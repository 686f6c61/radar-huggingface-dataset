# ml-resources/sapiens2-pretrain-0.1b

## Resumen

Sapiens2-0.1B es el backbone de visión más pequeño de la familia Sapiens2 desarrollada por Meta: un vision transformer de 113.993.488 parámetros (0,114 B) preentrenado sobre 1.000 millones de imágenes de personas. No es un modelo generativo ni un modelo de lenguaje, sino un extractor de características densas por parche (*per-patch features*) pensado para servir como inicialización de cabezas de tareas centradas en el cuerpo humano: estimación de pose, segmentación de partes del cuerpo, normales de superficie y *pointmaps*.

El modelo procesa imágenes a resolución 1024 × 768 (alto × ancho) con parches de 16 × 16 píxeles, lo que produce 3.072 tokens por imagen, y proyecta cada token a un espacio de embedding de 768 dimensiones mediante 12 capas transformer con 12 cabezas de atención. Su coste computacional declarado es de 0,342 TFLOPs, lo que lo sitúa en el rango de backbones ligeros aptos para GPU de consumo.

Su relevancia actual radica en dos factores: por un lado, Sapiens2 introduce mejoras arquitectónicas sobre Sapiens v1 (RoPE, atención con consultas agrupadas, SwiGLU, RMSNorm y QK-norm) que acercan el diseño a los transformers modernos; por otro, el checkpoint de 0,1B ofrece un punto de partida de coste muy bajo para fine-tuning de tareas humanas a alta resolución. El repositorio analizado es un *mirror* no oficial de `facebook/sapiens2-pretrain-0.1b`, con licencia Sapiens2 sin modificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sapiens2 ViT (RoPE, GQA, SwiGLU, RMSNorm, QK-norm) |
| Parámetros totales | 113.993.488 (~0,114 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; ventana de entrada fija de 1024 × 768 píxeles (alto × ancho), patch size 16, 3.072 tokens por imagen |
| Tipos de cuantización | no se publican cuantizaciones oficiales; el checkpoint se distribuye en safetensors y puede ejecutarse en fp32, fp16 o bf16 |
| Idiomas soportados | no aplica (modelo de visión, no procesa texto) |
| Licencia | Sapiens2 License (`license_name: sapiens2-license`, `license: other`), texto en https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md |
| Formato de pesos | safetensors (`sapiens2_0.1b_pretrain.safetensors`) |

Datos adicionales de la model card: embedding dim 768, 12 capas, 12 cabezas de atención, resolución de preentrenamiento 1024 × 768, FLOPs 0,342 T, datos de preentrenamiento 1.000 millones de imágenes humanas, tamaño del repo 0,5 GB, tarea (`pipeline_tag`) `image-feature-extraction`, librería `sapiens2`.

## Arquitectura y entrenamiento

El modelo es un vision transformer de tipo denso (sin mezcla de expertos ni componentes de espacio de estados). Incorpora cuatro decisiones de diseño destacadas en la model card: codificación posicional rotatoria (RoPE), atención con consultas agrupadas (GQA, *grouped-query attention*), activación SwiGLU en el bloque MLP, normalización RMSNorm y normalización de consultas y claves (QK-norm). La entrada se tokeniza con parches de 16 × 16 sobre imágenes de 1024 × 768 píxeles, y la salida es un tensor de características densas con forma `(B, num_tokens, embed_dim)`, es decir, una representación por parche sin cabeza de tarea.

El preentrenamiento se realizó sobre 1.000 millones de imágenes humanas, según declara el autor original. No se especifican en la información disponible el número exacto de tokens vistos, la composición detallada del dataset, la proporción de imágenes sintéticas o filtradas, ni si se aplicaron etapas de ajuste por preferencias humanas (RLHF/DPO), algo que en cualquier caso sería poco habitual en un backbone de visión. Tampoco se detalla el coste de entrenamiento, el hardware empleado ni la receta de aumentos de datos.

El modelo forma parte de una familia escalonada con la misma receta: Sapiens2-0.4B (0,398 B, 24 capas, dim 1.024, 16 cabezas, 1,260 TFLOPs), Sapiens2-0.8B (0,818 B, 32 capas, dim 1.280, 2,592 TFLOPs), Sapiens2-1B (1,462 B, 40 capas, dim 1.536, 24 cabezas, 4,715 TFLOPs), Sapiens2-1B-4K (1,607 B, 40 capas, dim 1.536, resolución extendida) y Sapiens2-5B (5,071 B, 56 capas, dim 2.432, 32 cabezas, 15,722 TFLOPs).

## Capacidades

- Extracción de características visuales densas: devuelve un embedding por token/parche, adecuado como entrada de cabezas de tarea.
- Extracción de características de imagen (`image-feature-extraction`) sobre entradas RGB con resolución nativa de 1024 × 768 y normalización estilo ImageNet recomendada por el autor.
- Servir de inicialización para *fine-tuning* de cabezas de tareas humanas: pose estimation, segmentación de partes del cuerpo, normales de superficie y *pointmaps*.
- Soporte de alta resolución sin redimensionado agresivo: con patch size 16 mantiene 3.072 tokens para 1024 × 768, lo que preserva detalle fino en extremidades y contornos.
- Generación de texto: no aplica, el modelo no tiene decodificador de lenguaje.
- Razonamiento, matemáticas y código: no aplica.
- *Tool calling* / *function calling*: no soportado; no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no aplica.
- Capacidades especiales: no dispone de modo *thinking*, ni entrada de audio, ni generación de imagen; su única salida son características.

## Casos de uso

- Estimación de pose humana: conectar una cabeza de *keypoints* sobre las características de la última capa permite predecir articulaciones a resolución 1024 × 768; el modelo es adecuado porque el preentrenamiento sobre 1.000 millones de imágenes humanas ya codifica estructura corporal.
- Segmentación de partes del cuerpo: las características por parche (3.072 tokens) permiten una segmentación densa con buena delimitación en manos, cara y pies, donde otros backbones de baja resolución suelen fallar.
- Estimación de normales de superficie: útil en pipelines de captura volumétrica y *relighting*, ya que el backbone aporta información geométrica local por parche reutilizable por una cabeza de regresión de normales.
- Predicción de *pointmaps* y reconstrucción 3D de cuerpos: el modelo sirve como extractor de características para cabezas que estiman coordenadas 3D por píxel, un caso documentado por el autor original como tarea *downstream* de la familia Sapiens2.
- Análisis de movimiento y deporte: al ser un backbone de 0,114 B con 0,342 TFLOPs, se puede ejecutar a alta frecuencia por fotograma en GPU moderadas y alimentar cabezas de pose para seguimiento de atletas en vídeo.
- Preentrenamiento de dominio propio: inicializar un modelo con este checkpoint y hacer *fine-tuning* en dominios específicos (moda, medicina, ergonomía, realidad aumentada) reduce el coste frente a entrenar desde cero.
- Preprocesado y *embeddings* para búsqueda visual de personas: usar las características para indexar imágenes en un motor de similitud o para *clustering* de grandes volúmenes de imágenes humanas, siempre añadiendo una etapa de agregación (pooling) sobre los tokens.
- Generación de pseudo-etiquetas a gran escala: por su bajo coste, se puede usar para preetiquetar datasets de pose o segmentación antes de revisión humana, o como profesor en destilación hacia modelos más pequeños.
- Investigación en visión centrada en humanos: reproducción de experimentos, ablaciones de resolución y comparación con el resto de la familia Sapiens2 (0.4B a 5B).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de tareas *downstream* (por ejemplo, AP de pose, mIoU de segmentación o error angular de normales) para este checkpoint concreto, y los resultados de la búsqueda web no contienen información relacionada con el modelo. Los únicos datos cuantitativos disponibles son parámetros (113.993.488) y FLOPs (0,342 T), además de las cifras comparativas de la familia recogidas en la sección de arquitectura.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 456 MB en fp32 (113,99 M × 4 bytes), 228 MB en fp16/bf16 y 114 MB en int8. Son estimaciones calculadas a partir del número de parámetros, no cifras publicadas.
- VRAM adicional por activaciones: con entrada 1024 × 768 y patch 16 se generan 3.072 tokens en 12 capas de dimensión 768; para lote 1 el consumo adicional es del orden de cientos de megabytes, y escala con el tamaño de lote y la resolución. Estimación propia, no publicada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16/bf16. Para *fine-tuning* de cabezas a resolución completa se recomienda un mínimo de 16-24 GB (RTX 4090, A100 40 GB, H100).
- Cabe en GPU de consumo: sí, en fp32 o fp16/bf16, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores. El repositorio completo ocupa 0,5 GB.
- Opciones de despliegue: el autor proporciona código propio (`pip install -e .` sobre el repositorio `facebookresearch/sapiens2`) y carga del checkpoint con `safetensors` y PyTorch. La librería declarada es `sapiens2`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a un backbone de visión; tampoco se confirma exportación oficial a ONNX o TensorRT.
- Latencia y *throughput*: no disponibles en la información proporcionada. Como referencia teórica, 0,342 TFLOPs por imagen en fp32 o fp16 permite decenas de imágenes por segundo en GPU de gama alta, pero no hay mediciones oficiales.

## Comparativa con modelos similares

Comparación dentro de la propia familia Sapiens2 con los datos publicados en la model card:

| Modelo | Parámetros | FLOPs | Embed dim | Capas | Cabezas | Licencia |
|---|---|---|---|---|---|---|
| Sapiens2-0.1B | 0,114 B | 0,342 T | 768 | 12 | 12 | Sapiens2 License |
| Sapiens2-0.4B | 0,398 B | 1,260 T | 1.024 | 24 | 16 | Sapiens2 License |
| Sapiens2-0.8B | 0,818 B | 2,592 T | 1.280 | 32 | 16 | Sapiens2 License |
| Sapiens2-1B | 1,462 B | 4,715 T | 1.536 | 40 | 24 | Sapiens2 License |
| Sapiens2-1B-4K | 1,607 B | no disponible | 1.536 | 40 | 24 | Sapiens2 License |
| Sapiens2-5B | 5,071 B | 15,722 T | 2.432 | 56 | 32 | Sapiens2 License |

Frente a alternativas externas de la misma categoría (backbones de visión de propósito general como DINOv2 o el Sapiens v1, o backbones de segmentación como SAM), no se dispone en la información proporcionada de parámetros, contexto de entrada ni resultados comparables verificables, por lo que la comparación cuantitativa con ellos queda como no disponible. La diferencia cualitativa documentada es que Sapiens2 está preentrenado específicamente sobre imágenes humanas y a resolución 1024 × 768 con parches de 16, mientras que los backbones genéricos se preentrenan a resoluciones menores y sobre datasets generalistas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta *tool calling* ni agentes. Cualquier expectativa en ese sentido es un error de uso.
- No es un modelo de tarea final: entrega características densas, no predicciones de pose, segmentación o profundidad. Requiere una cabeza entrenada y datos etiquetados del dominio objetivo.
- Resolución de entrada: la ventana declarada es 1024 × 768 (alto × ancho) con patch 16. No se documenta en la información disponible el comportamiento con relaciones de aspecto o resoluciones distintas, ni si el modelo generaliza a otras escalas sin ajuste.
- Sesgos: al preentrenarse sobre 1.000 millones de imágenes humanas de origen no especificado, es esperable que reproduzca sesgos de representación (demografía, tipo de cuerpo, iluminación, contexto cultural). La información disponible no incluye análisis de sesgo; trátese como riesgo no cuantificado.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de predicciones incorrectas y sobreconfiadas en cabezas *downstream* cuando la persona está ocluida, muy recortada o en poses atípicas. La model card no reporta tasas de error.
- Idioma: no procede; el modelo no procesa texto.
- Licencia: la Sapiens2 License se clasifica como `license: other`, no como Apache 2.0 o MIT. No se dispone del texto íntegro en la información proporcionada, por lo que **es obligatorio revisar** https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md antes de cualquier uso comercial. No se puede asumir uso comercial libre.
- Repositorio espejo: `ml-resources/sapiens2-pretrain-0.1b` es un *mirror* no oficial, sin descargas ni *likes* y publicado el 2026-10-15, mientras que el original es `facebook/sapiens2-pretrain-0.1b`. Para producción conviene usar el repositorio oficial y verificar la integridad del checkpoint.
- Citación: la entrada BibTeX de la model card corresponde al paper arXiv:2604.21681, cuyo contenido no ha podido verificarse en la búsqueda web realizada.

## Enlaces

- Repositorio analizado (mirror): https://huggingface.co/ml-resources/sapiens2-pretrain-0.1b
- Repositorio oficial del checkpoint: https://huggingface.co/facebook/sapiens2-pretrain-0.1b
- Colección completa Sapiens2: https://huggingface.co/collections/facebook/sapiens2
- Paper: https://arxiv.org/pdf/2604.21681
- Página del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Código: https://github.com/facebookresearch/sapiens2
- Licencia: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Variantes de la familia: https://huggingface.co/facebook/sapiens2-pretrain-0.4b, https://huggingface.co/facebook/sapiens2-pretrain-0.8b, https://huggingface.co/facebook/sapiens2-pretrain-1b, https://huggingface.co/facebook/sapiens2-pretrain-1b-4k, https://huggingface.co/facebook/sapiens2-pretrain-5b
