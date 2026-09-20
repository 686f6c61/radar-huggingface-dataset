# lucid-dl/vjepa2-vitg

## Resumen

V-JEPA 2 ViT-g/16 es un codificador de vídeo basado en Vision Transformer de escala *giant* (ViT-g/16) con preentrenamiento auto-supervisado, publicado originalmente por el equipo de Meta (referenciado en la model card como `facebook/vjepa2-vitg-fpc64-256`) y portado a la librería Lucid por el usuario `lucid-dl`. El modelo resuelve tareas de comprensión de vídeo, en particular clasificación de acciones y extracción de representaciones espacio-temporales, y se distribuye con la etiqueta por defecto `FPC64_256`, que corresponde a clips de 64 fotogramas a 256×256 píxeles. El paper asociado (arXiv:2506.09985, Assran et al., 2025) lo presenta como parte de una familia de modelos auto-supervisados de vídeo orientados a comprensión, predicción y planificación.

Se trata de una conversión de pesos, no de un entrenamiento nuevo: el repositorio contiene safetensors nativos de Lucid convertidos desde los pesos originales, con mapeo de claves y paridad numérica verificados. Es relevante para desarrolladores que quieran ejecutar V-JEPA 2 dentro del ecosistema Lucid sin depender de PyTorch/Hugging Face Transformers, o que necesiten un backbone visual-temporal de ~1.030 millones de parámetros con licencia Apache 2.0.

El repositorio ocupa 8,2 GB y no registra descargas ni *likes* en el momento de la consulta, por lo que se trata de un artefacto comunitario con validación externa limitada. No hay información publicada sobre benchmarks, cuantizaciones ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer gigante (ViT-g/16) con preentrenamiento auto-supervisado tipo JEPA (joint-embedding predictive architecture) |
| Parametros totales | 1034,6 M (aproximadamente 1,03 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la configuracion por defecto consume clips de 64 fotogramas a 256×256 px (etiqueta `FPC64_256`) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors nativos de Lucid, sin variantes GGUF, AWQ, GPTQ ni int8/int4) |
| Idiomas soportados | no disponible (modelo de vision/video, no procesa texto) |
| Licencia | apache-2.0 (heredada de los pesos originales de Meta) |
| Formato de pesos | safetensors en formato nativo de la libreria Lucid |
| Tamano del repositorio | 8,2 GB |
| Tamano del checkpoint | 7807,77 MB (etiqueta `FPC64_256`) |
| GFLOPs | no disponible (la model card muestra el campo vacio) |
| Libreria de inferencia | `lucid` |
| Pipeline declarado | video-classification |
| Datasets citados | kinetics-700, something-something-v2, diving48 |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de escala *giant* con parcheo 16×16 sobre fotogramas de 256×256 píxeles, integrado en el marco V-JEPA 2, un esquema de aprendizaje auto-supervisado de tipo *joint-embedding predictive*: en lugar de reconstruir píxeles, el modelo aprende representaciones prediciendo embeddings latentes de partes enmascaradas del vídeo. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; el paper citado (arXiv:2506.09985) es la referencia para esos detalles.

La innovación principal de esta ficha de pesos no está en el modelo en sí, sino en el *port*: la conversión desde `facebook/vjepa2-vitg-fpc64-256/model.safetensors` se realizó con la herramienta `tools.convert_weights` del repositorio Lucid, y el autor declara haber verificado el mapeo de claves y la paridad numérica contra la fuente. El preprocesado viaja junto a los pesos mediante `weights.transforms()`, y el modelo espera directamente un tensor de vídeo ya decodificado con forma `(B, T, C, H, W)`, sin pipeline de tokenización de texto. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o híbridos SSM.

## Capacidades

- Clasificación de vídeo: el pipeline declarado es `video-classification`, orientado a reconocimiento de acciones y eventos sobre clips cortos.
- Extracción de representaciones espacio-temporales: al ser un codificador auto-supervisado, sus embeddings pueden reutilizarse como backbone congelado para tareas *downstream* (detección temporal, recuperación de vídeo, agrupamiento).
- Comprensión de dinámica temporal: el paper asociado enmarca la familia V-JEPA 2 en comprensión, predicción y planificación, lo que sugiere uso en tareas que requieren anticipar estados futuros del vídeo.
- Procesamiento de clips de 64 fotogramas a 256×256: ventana temporal fija definida por la etiqueta de pesos por defecto.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso en lenguaje: no disponible.
- Capacidades multilingües: no aplica; el modelo no consume ni produce texto.
- Capacidades especiales: no se documentan modos de *thinking*, audio ni visión-lenguaje en la información proporcionada.

## Casos de uso

- Reconocimiento de acciones en vídeo: clasificar clips de 64 fotogramas para etiquetar automáticamente contenido deportivo, grabaciones de vigilancia o material de archivo, aprovechando que el modelo ya está entrenado sobre dominios como kinetics-700.
- Moderación de contenido audiovisual: puntuar o clasificar segmentos de vídeo subidos por usuarios para detectar categorías problemáticas antes de publicarlos, usando el codificador como primera etapa de un clasificador específico.
- Anotación automática de datasets: generar etiquetas preliminares sobre grandes volúmenes de vídeo sin etiquetar y reducir el coste de anotación humana, con revisión posterior de los casos de baja confianza.
- Recuperación de vídeo por similitud: extraer embeddings de cada clip y construir un índice vectorial para búsqueda semántica sobre bibliotecas de vídeo (por ejemplo, localizar planos con una acción o dinámica concreta).
- Analítica deportiva: detectar fases de juego, tipos de jugada o eventos repetibles en grabaciones de partidos, alimentando paneles de estadísticas automáticas.
- Investigación en representaciones auto-supervisadas: usar los pesos como referencia para reproducir resultados del paper V-JEPA 2, comparar el *port* de Lucid contra la implementación original o estudiar propiedades de los embeddings latentes.
- Robótica y planificación basada en vídeo: el marco V-JEPA 2 se presenta en el paper como base para predicción y planificación, por lo que el codificador puede emplearse en pipelines de investigación que necesiten anticipar la evolución de una escena.
- Control de calidad industrial: inspección de líneas de producción mediante clasificación de secuencias de vídeo, detectando anomalías de movimiento o montaje que no son visibles en un único fotograma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una tabla de pesos con parámetros (1034,6 M), tamaño (7807,77 MB) y el campo GFLOPs vacío; no hay cifras de Kinetics-400, Something-Something V2, Diving-48 ni de ninguna otra métrica, y no se han encontrado resultados en la búsqueda web. No se deben inferir valores a partir de los nombres de los datasets citados, que pueden corresponder a conjuntos de evaluación y no a datos de entrenamiento.

## Requisitos de hardware

- Peso de los parametros en memoria: aproximadamente 4,1 GB en fp32, 2,1 GB en bf16/fp16, ~1 GB en int8 y ~0,5 GB en int4 (los dos últimos son estimaciones teóricas; no hay pesos cuantizados publicados).
- VRAM estimada para inferencia: las estimaciones anteriores solo cubren pesos; a ellas hay que sumar activaciones y memoria de atención. Un clip de 64 fotogramas a 256×256 genera miles de tokens por muestra, por lo que se recomienda un mínimo práctico de 16 GB en bf16 para lote 1, y 24-48 GB para lotes mayores o secuencias más largas. Estas cifras son estimaciones, no mediciones publicadas.
- GPU recomendadas: no disponible en la documentación. Por tamaño de pesos, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) deberían poder ejecutar el modelo en bf16 con lote pequeño; para lotes grandes o fp32 son preferibles A100 (40/80 GB), H100 o L40S.
- Compatibilidad con GPU de consumo: probable en tarjetas con 16 GB o más en bf16 y lote 1; no confirmado por el autor.
- Opciones de despliegue: el modelo está empaquetado para el runtime de Lucid (`lucid.models.vjepa2_vit_giant`), que carga pesos safetensors y transformaciones propias. No hay soporte documentado en vLLM, TGI, llama.cpp, Ollama ni ONNX Runtime, y al ser un modelo de visión-vídeo no encaja en los servidores de inferencia orientados a LLM.
- Latencia y throughput: no disponible. No se publican mediciones de latencia por clip, FPS ni throughput por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lucid-dl/vjepa2-vitg | 1034,6 M | clips de 64 fotogramas a 256×256 | no disponible | apache-2.0 | Hugging Face, runtime Lucid |
| V-JEPA 2 ViT-g (facebook/vjepa2-vitg-fpc64-256) | misma arquitectura y pesos de origen | clips de 64 fotogramas a 256×256 | no disponible en la informacion proporcionada | apache-2.0 | Hugging Face, ecosistema original de Meta |
| VideoMAE V2 (ViT-g) | ~1.000 M (orden de magnitud comparable) | clips de vídeo para clasificación supervisada | no disponible en la informacion proporcionada | no disponible | Hugging Face |
| InternVideo2 | no disponible | clips de vídeo, variantes multimodales | no disponible en la informacion proporcionada | no disponible | Hugging Face |

La comparación cuantitativa no es posible con los datos disponibles: no hay cifras de benchmarks para ninguno de los modelos en la información proporcionada. La diferencia relevante y verificable es de empaquetado y ecosistema: este repositorio es un *port* comunitario a Lucid con paridad numérica declarada frente a los pesos de Meta, mientras que los pesos originales se consumen desde el stack de PyTorch/Transformers.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes para esta conversión; la única validación declarada es la paridad numérica frente a los pesos de origen.
- Es un port comunitario con 0 descargas y 0 *likes* en el momento de la consulta: no hay evidencia de uso en producción ni de mantenimiento continuado.
- Dependencia de la librería Lucid: el código de ejemplo usa `lucid`, `lucid.models` y `VJEPA2ViTGiantWeights`, lo que limita la portabilidad fuera de ese ecosistema.
- El modelo consume tensores de vídeo ya decodificados con forma `(B, T, C, H, W)`; el preprocesado debe obtenerse de `weights.transforms()` y no se documenta su comportamiento exacto ni su equivalencia con el pipeline original de Meta.
- Ventana temporal fija: la etiqueta por defecto está pensada para 64 fotogramas a 256×256; no se documenta el comportamiento con clips de otra duración o resolución.
- No hay variantes cuantizadas publicadas, lo que dificulta el despliegue en hardware con VRAM limitada.
- Riesgo de sesgo: depende de los datos de preentrenamiento del modelo original, cuya composición no se detalla en la información disponible; puede heredar sesgos de representación de personas, culturas y contextos poco frecuentes en vídeo.
- Riesgo de error de clasificación: al ser un modelo discriminativo, sus fallos se manifiestan como etiquetas incorrectas o embeddings poco separables, no como "alucinaciones" textuales; en entornos críticos requiere umbrales de confianza y revisión humana.
- Sin capacidades de texto: no admite prompts en lenguaje natural, tool calling ni interacción conversacional; para tareas de visión-lenguaje habría que acoplar un modelo adicional.
- Licencia Apache 2.0 heredada de los pesos originales, lo que en principio permite uso comercial, pero conviene verificar la licencia y los términos vigentes del repositorio de Meta antes de un despliegue en producción.
- No se documentan requisitos de hardware, latencias ni límites de uso, por lo que cualquier planificación de capacidad debe basarse en pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucid-dl/vjepa2-vitg
- Pesos originales: https://huggingface.co/facebook/vjepa2-vitg-fpc64-256
- Paper: https://arxiv.org/abs/2506.09985 (Assran et al., "V-JEPA 2: Self-Supervised Video Models Enable Understanding, Prediction and Planning", 2025)
- Repositorio de la librería Lucid: https://github.com/ChanLumerico/lucid
