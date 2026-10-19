# mnmly/vjepa2.1-vit-large-384

## Resumen

V-JEPA 2.1 ViT-L/16 (384 px) es un codificador de vídeo auto-supervisado desarrollado por Meta FAIR dentro de la línea V-JEPA (Joint-Embedding Predictive Architecture). Este repositorio concreto, publicado por el usuario `mnmly`, no es un lanzamiento de Meta: es una conversión de formato del checkpoint oficial `vjepa2_1_vitl_dist_vitG_384.pt` (el `ema_encoder`) a safetensors planos, pensada para el port Swift/MLX `mlx-swift-vjepa2`. Los tensores son idénticos al codificador que carga `torch.hub.load('facebookresearch/vjepa2', 'vjepa2_1_vit_large_384')`.

El modelo resuelve el problema de obtener representaciones densas de vídeo sin etiquetas: dado un clip de vídeo (o una imagen suelta), produce features por parche de dimensión 1024, además de features jerárquicas de cuatro niveles de dimensión 4096. Es relevante para quien quiera hacer extracción de características de vídeo en Apple Silicon sin depender de PyTorch, con paridad numérica verificada frente al código upstream (cosine similarity 0,999948 en fp16 end-to-end).

Arquitectura transformer de tipo ViT: anchura 1024, profundidad 24, 16 cabezas de 64 dimensiones, MLP de 4096, parche 16 y tubelet 2, con RoPE de tres ejes. Tiene 304.680.960 parámetros y deriva por destilación de un ViT-G. El repositorio ocupa 1,8 GB e incluye pesos en float32 y float16 bajo licencia MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (vision transformer) para vídeo, 3-axis RoPE, tubelet 2; anchura 1024, profundidad 24, 16 cabezas (64 dim), MLP 4096 |
| Parametros totales | 304.680.960 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como contexto de texto; entrada de vídeo con `num_frames=64` en el ejemplo upstream (tubo de 2 fotogramas → 32 tokens temporales × 24 × 24 = 18.432 tokens por clip a 384 px) |
| Tipos de cuantizacion | float32 (`model.safetensors`, 1,22 GB) y float16 (`model-fp16.safetensors`, 609 MB); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT (pesos y código originales de Meta Platforms, Inc.; el repaquetado no añade restricciones) |
| Formato de pesos | safetensors (incluye `config.json`); layouts compatibles con `load_state_dict(..., strict=True)` de PyTorch upstream |

## Arquitectura y entrenamiento

El codificador es un Vision Transformer adaptado a vídeo: parches de 16×16 píxeles sobre recortes de 384×384, agrupados en tubelets de 2 fotogramas, con embedding Conv3d y RoPE de tres ejes (temporal y dos espaciales) con interpolación. Con una sola imagen toma el camino de imagen (`img_temporal_dim_size=1`); con dos o más fotogramas, el camino de vídeo. La salida son features por parche `[N, 1024]` donde N = T/2 · 24 · 24, más features jerárquicas de 4 niveles `[N, 4096]`. El checkpoint es un destilado de un ViT-G, lo que explica que un ViT-L ofrezca features densas de calidad superior a su tamaño.

El entrenamiento es auto-supervisado (V-JEPA: predicción en espacio de representaciones latentes, sin píxeles ni etiquetas), según el artículo V-JEPA 2.1 (arXiv:2603.14482). Los detalles concretos de dataset, número de tokens, composición y si hubo RLHF/DPO no están disponibles en la información proporcionada. Como innovación destacable del repaquetado, la model card documenta paridad numérica frente al código PyTorch de referencia: cosine similarity 1.000000 en el camino exacto (CPU MLX, bloque a bloque), 0.999964 mínimo por etapa en GPU fp32, 0.999963 / 0.999975 / 0.999997 end-to-end fp32 para vídeo / jerárquico / imagen, y 0.999948 en fp16. El preprocesado (resize bilineal exacto a OpenCV, center crop y normalización) reproduce el tensor upstream bit a bit.

## Capacidades

- Extracción de features de vídeo auto-supervisadas: `[N, 1024]` por parche para clips de vídeo.
- Features jerárquicas densas de cuatro niveles (`[N, 4096]`), orientadas a tareas downstream que necesitan resolución espacial fina.
- Camino de imagen: con un solo fotograma procesa imágenes estáticas con el mismo codificador.
- Preprocesado integrado y reproducible (resize bilineal, center crop, normalización ImageNet) idéntico a upstream.
- Ejecución nativa en Apple Silicon vía MLX y MLX-Swift, con API `VJEPA2Session` y CLI `vjepa2-cli embed`.
- Compatibilidad bidireccional: los safetensors cargan tanto en MLX como en el `VisionTransformer` de PyTorch upstream.
- No es un modelo generativo: no genera texto, no hace tool calling, no soporta agentes ni razonamiento multi-paso, y no tiene capacidades de audio ni de lenguaje.

## Casos de uso

- Búsqueda semántica de vídeo: indexar una videoteca calculando features `[N, 1024]` por clip y construyendo un índice vectorial para recuperación por similitud, sin necesidad de etiquetas manuales.
- Detección y segmentación temporal de eventos: usar las features densas por parche para localizar cambios de escena o acciones concretas en flujos de vigilancia o archivos audiovisuales.
- Preentrenamiento de cabezas downstream ligeras: congelar el codificador y entrenar clasificadores de acción, estimadores de profundidad o detectores sobre las features de 4 niveles, reduciendo el coste de anotación.
- Clasificación de vídeo en pipelines de moderación de contenido: extraer representaciones y aplicar un clasificador lineal para filtrar material, aprovechando el preentrenamiento auto-supervisado.
- Prototipado en local en Mac: validar arquitecturas y preprocesados con `vjepa2-cli embed --video clip.mp4` antes de escalar a clústeres con GPU, gracias a la paridad numérica verificada con PyTorch.
- Investigación en representaciones auto-supervisadas: reproducir experimentos de V-JEPA 2.1 con un checkpoint destilado de ViT-G en hardware de consumo, comparando el camino de imagen y el de vídeo.
- Extracción de embeddings para sistemas de recomendación o deduplicación de vídeo: comparar clips por similitud de features para agrupar contenido casi idéntico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, Kinetics, Something-Something, etc.) en la información disponible. Los únicos datos numéricos publicados son las métricas de paridad del repaquetado frente al código PyTorch de referencia:

| Prueba de paridad | Cosine similarity |
|---|---|
| Camino exacto (MLX CPU stream), todos los bloques | 1.000000 |
| GPU fp32 por etapa (mínimo) | 0.999964 |
| End-to-end fp32, vídeo | 0.999963 |
| End-to-end fp32, features jerárquicas | 0.999975 |
| End-to-end fp32, imagen | 0.999997 |
| End-to-end fp16 | 0.999948 |

## Requisitos de hardware

- VRAM/peso de pesos: 1,22 GB en float32; 609 MB en float16. Solo pesos, sin activaciones.
- Memoria para activaciones: dependiente del número de fotogramas. Un clip de 64 fotogramas a 384 px genera 18.432 tokens con anchura 1024 y MLP 4096, lo que domina el consumo frente a los pesos; con menos fotogramas o menor resolución baja de forma aproximadamente lineal en tokens.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 8 GB o más puede ejecutar el modelo en fp16 para clips cortos; una RTX 4090 o similar permite clips más largos y lotes mayores.
- En Apple Silicon es donde está pensado el repositorio: MLX y MLX-Swift sobre memoria unificada, con CLI y app de visualización incluidas.
- GPU de datacenter (A100, H100) no son necesarias para inferencia, pero sí útiles para procesar lotes grandes de clips o para reentrenar cabezas downstream.
- Opciones de despliegue: `mlx-swift-vjepa2` (Swift), MLX en Python, PyTorch upstream con los mismos safetensors, CLI `vjepa2-cli embed` y la app V-JEPA 2 Viewer. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan una comparación de rendimiento. A continuación se comparan únicamente aspectos estructuralesdocumentados:

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| V-JEPA 2.1 ViT-L/16 384 (este repo) | 304.680.960 | 384×384, tubelet 2, hasta 64 fotogramas en el ejemplo | MIT | Safetensors para MLX y PyTorch |
| V-JEPA 2.1 ViT-G (modelo profesor del destilado) | No disponible | No disponible | MIT (según la línea V-JEPA) | Checkpoint de Meta; datos no disponibles en esta información |
| V-JEPA 2 (arXiv:2506.09985) | No disponible | No disponible | MIT (según la línea V-JEPA) | Repositorio `facebookresearch/vjepa2` |

No se dispone de información sobre otros codificadores de vídeo comparables (por ejemplo, variantes de DINOv2 vídeo o VideoMAE) en el material proporcionado, por lo que no se incluyen cifras de comparación.

## Limitaciones y advertencias

- No es un modelo generativo ni un LLM: no genera texto, no responde preguntas y no soporta tool calling ni flujos de agente. Cualquier uso conversacional es un error de planteamiento.
- Es un repaquetado no oficial: aunque los tensores son idénticos al checkpoint de Meta, el mantenimiento y el soporte dependen de `mnmly`, no de Meta FAIR.
- Riesgo de sesgo heredado del preentrenamiento auto-supervisado: no se documenta la composición del dataset, por lo que no se puede evaluar la cobertura demográfica, geográfica o cultural de las representaciones.
- El preprocesado debe respetarse al milímetro (resize bilineal tipo OpenCV, center crop, normalización ImageNet); desviarse degrada la paridad numérica y, con ella, la calidad de las features.
- La ventana de entrada es fija en resolución (384 px); clips muy largos o de alta resolución requieren muestreo o troceado, con la consiguiente posible pérdida de información temporal.
- La licencia MIT es permisiva y permite uso comercial, pero obliga a conservar el aviso de copyright de Meta Platforms, Inc. y el texto de la licencia al redistribuir.
- Sin métricas downstream publicadas en este repositorio: hay que validar el rendimiento en la tarea concreta antes de llevarlo a producción.
- El número de descargas y likes es cero y la fecha de creación es muy reciente, por lo que no existe validación comunitaria del repaquetado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mnmly/vjepa2.1-vit-large-384
- Checkpoint original: https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitl_dist_vitG_384.pt
- Código upstream: https://github.com/facebookresearch/vjepa2 (commit `204698b45b3712590f06245fbfba32d3be539812`, directorio `app/vjepa_2_1/models`)
- Artículo V-JEPA 2.1: arXiv:2603.14482 — https://arxiv.org/abs/2603.14482
- Artículo V-JEPA 2: arXiv:2506.09985 — https://arxiv.org/abs/2506.09985
- Port Swift/MLX: repositorio `mlx-swift-vjepa2` (la model card no proporciona URL directa)
