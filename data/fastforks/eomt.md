# fastforks/eomt

## Resumen

EoMT (Encoder-only Mask Transformer) es un modelo de segmentación semántica presentado por Kerssies et al. en 2025. Se trata de un ViT-L/16 estándar (encoder-only) en el que los últimos bloques del transformer incorporan además las consultas de máscara, eliminando la necesidad de un decodificador separado. Los checkpoints disponibles están preentrenados con DINOv2 o DINOv3 y ajustados sobre ADE20K (SceneParsing, 150 clases).

El repositorio `fastforks/eomt` no contiene pesos: es únicamente una model card que actúa como manifiesto de variantes. La librería `fastforks` descarga los pesos originales de los repositorios de los autores (`tue-mps/ade20k_semantic_eomt_large_512` y `tue-mps/eomt-dinov3-ade-semantic-large-512`) y verifica su integridad mediante SHA-256. Ofrece dos backends: `portable` (PyTorch puro) y `kernels` (kernels CUDA optimizados).

Es relevante porque simplifica la arquitectura típica de los mask transformers (tipo Mask2Former) al prescindir del decodificador, y porque proporciona métricas de latencia y memoria muy detalladas en GPU de consumo (RTX 5060 Ti 16 GB), además de paridad numérica verificada frente al código original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-only mask transformer; ViT-L/16 con consultas de máscara en los últimos bloques |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen, cualquier H x W >= 1) |
| Tipos de cuantizacion | fp32, fp16 (backend portable y kernels); no se documentan cuantizaciones int8/int4 |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Mixta: código Apache-2.0; pesos `eomt-l-dinov2-ade20k` MIT; pesos `eomt-l-dinov3-ade20k` MIT AND LicenseRef-DINOv3-License |
| Formato de pesos | safetensors + config.json |
| Tarea | Segmentación semántica (pipeline `image-segmentation`) |
| Salida | Logits por píxel y clase (150 clases ADE20K) |
| Backends | `portable`, `kernels` |
| Preentrenamiento | DINOv2 (LVD-142M) o DINOv3 |

## Arquitectura y entrenamiento

EoMT es un transformer encoder-only: un ViT-L/16 convencional en el que los últimos bloques procesan conjuntamente los tokens de imagen y un conjunto de consultas de máscara, de forma que la segmentación se resuelve dentro del propio encoder sin decodificador independiente. Esta simplificación reduce la complejidad frente a arquitecturas tipo Mask2Former y permite reutilizar directamente los pesos preentrenados de DINOv2 o DINOv3.

El preentrenamiento emplea LVD-142M (el conjunto de imágenes web curado de DINOv2, no publicado) o el corpus de DINOv3, según la variante. El ajuste se realiza sobre ADE20K SceneParsing con 150 clases semánticas. No se documentan en la información disponible detalles sobre número de tokens de ajuste, composición exacta del dataset ni uso de RLHF/DPO (no aplicable a segmentación). La innovación principal es la fusión de consultas de máscara en el encoder y la disponibilidad de kernels CUDA específicos que aceleran la inferencia entre 1,4x y 1,9x frente al código original.

## Capacidades

- Segmentación semántica densa por píxel sobre 150 clases de ADE20K (interior, exterior, objetos, cielo, vegetación, etc.).
- Entrada de imagen RGB de cualquier resolución H x W >= 1, con redimensionado o padding interno.
- Salida de logits por píxel y clase, apta para postprocesado (argmax, umbrales, fusión con otras fuentes).
- Dos backends de ejecución: `portable` (PyTorch, GPU o CPU) y `kernels` (kernels CUDA optimizados).
- Ejecución en fp32 y fp16; fp16 es el modo por defecto en GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente visual y discriminativo.
- Sin capacidades multilingües, de texto, audio o vídeo.
- Paridad numérica verificada frente al código original: en CPU fp32, diferencia máxima absoluta <= 0,002; en GPU fp16, diferencia media <= 0,0002 px y p99 <= 0,003 px.

## Casos de uso

- Segmentación semántica de imágenes en producción: el modelo devuelve un mapa de etiquetas por píxel que puede alimentar pipelines de análisis de escenas, conteo de objetos o extracción de regiones. Su latencia de 38,5-55,3 ms a 1920x1080 con el backend `kernels` lo hace viable en servicios interactivos.
- Procesamiento de imágenes de alta resolución: soporta entradas de hasta 3000x4000 (12 MP) con un pico de memoria de aproximadamente 14,5 GiB en fp16 sobre una RTX 5060 Ti 16 GB, adecuado para fotografía aérea o satelital moderada.
- Preprocesado para pipelines de visión artificial: la máscara semántica puede usarse como entrada auxiliar para detección, seguimiento o modelos de profundidad, aprovechando las 150 clases de ADE20K.
- Automatización de etiquetado y anotación: generación de máscaras preliminares que revisores humanos corrigen, reduciendo el coste de construir datasets de segmentación propios.
- Análisis de escenas urbanas e interiores: clasificación de cielo, edificios, vegetación, mobiliario y superficies para aplicaciones de conducción asistida, robótica móvil o modelado 3D.
- Investigación en arquitecturas encoder-only: al ser un ViT-L/16 con consultas integradas, sirve como base para experimentos de eficiencia, destilación o comparación con Mask2Former y SegFormer en entornos académicos.
- Despliegue en GPU de consumo: con 1,5-1,9 GiB de memoria reservada a 1024x2048 en el backend `kernels`, cabe en tarjetas de 8-16 GB para prototipado y pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mIoU, etc.) en la información disponible. Sí se documentan métricas de latencia y memoria medidas sobre RTX 5060 Ti 16 GB (sm_120) con entrada sintética de 1024x2048:

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico kernels (MiB, alloc/reserv) |
|---|---|---|---|---|---|---|
| `eomt-l-dinov2-ade20k` | 177,6 | 63,73 | 51,1 | 34,99 | 1,8x | 1515 / 1584 |
| `eomt-l-dinov3-ade20k` | 185,68 | 72,08 | 54,82 | 38,8 | 1,9x | 1514 / 1584 |

Rendimiento a resoluciones fijas (tiempo ms / memoria pico alloc/reserv en MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 4000x3000 (12 MP) |
|---|---|---|---|---|---|
| `eomt-l-dinov2-ade20k` | portable | 50,3 / 1917 / 2484 | 55,4 / 2412 / 3506 | 63,2 / 3417 / 4834 | 129,2 / 14890 / 15016 |
| `eomt-l-dinov2-ade20k` | kernels | 38,5 / 1917 / 2484 | 43,8 / 2412 / 3506 | 51,5 / 3417 / 4834 | 117,4 / 14890 / 15016 |
| `eomt-l-dinov3-ade20k` | portable | 54,2 / 1916 / 2486 | 59,2 / 2411 / 3502 | 67,0 / 3415 / 4836 | 133,1 / 14889 / 15016 |
| `eomt-l-dinov3-ade20k` | kernels | 42,5 / 1916 / 2486 | 47,7 / 2411 / 3502 | 55,3 / 3415 / 4836 | 121,2 / 14889 / 15016 |

Arranque y primera llamada (512x512): carga de 3,22-3,27 s en portable/kernels; primera llamada de 0,04-0,08 s.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5-1,9 GiB de memoria reservada a 1024x2048 en fp16 con el backend `kernels`; hasta 14,7 GiB reservados para entradas de 3000x4000.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; las mediciones se realizaron sobre RTX 5060 Ti 16 GB (sm_120). Para 12 MP se requiere al menos 16 GB de VRAM.
- Cabe en GPU de consumo: sí, desde 8 GB para resoluciones moderadas (640x480 a 1920x1080) y 16 GB para 12 MP.
- Opciones de despliegue: librería `fastforks` (`pip install fastforks`), con backends `portable` (PyTorch, GPU o CPU) y `kernels` (kernels CUDA). También es posible usar el código original de Hugging Face Transformers en el commit `c4c4605f9618`.
- Latencia: 34,99-38,8 ms a 1024x2048 con `kernels`; 38,5-55,3 ms a 1920x1080; 117,4-121,2 ms a 12 MP.
- Throughput: no documentado de forma explícita; a partir de las latencias, aproximadamente 18-28 imágenes/s a 1024x2048 y 8-9 imágenes/s a 12 MP en la GPU de referencia.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de precisión (mIoU) ni de especificaciones de modelos alternativos, por lo que la comparación cuantitativa no está disponible. Cualitativamente:

| Modelo | Arquitectura | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| EoMT (este) | Encoder-only ViT-L/16 con consultas de máscara | Imagen de cualquier tamaño | MIT / MIT AND DINOv3 | Pesos en HF (tue-mps) |
| Mask2Former | Transformer con decodificador de máscaras | Imagen de cualquier tamaño | no disponible en esta ficha | Pesos en HF |
| SegFormer | Transformer jerárquico encoder-only | Imagen de cualquier tamaño | no disponible en esta ficha | Pesos en HF |

La ventaja diferencial de EoMT es la ausencia de decodificador y la disponibilidad de kernels CUDA medidos, con paridad numérica verificada frente al código original.

## Limitaciones y advertencias

- El repositorio `fastforks/eomt` no aloja pesos: solo contiene la model card y los enlaces; la disponibilidad depende de los repositorios de los autores (`tue-mps`).
- Licencia mixta: la variante DINOv3 incorpora la DINOv3 License, que exige incluir su texto en la redistribución; aunque no excluye el uso comercial, conviene revisarla antes de producción.
- El código original se distribuye como paquete de uso exclusivamente investigador según la model card; verificar antes de cualquier otro uso.
- Modelo limitado al dominio de ADE20K (150 clases): clases no presentes en ese dataset no se segmentarán correctamente.
- Riesgo de degradación en dominios alejados de las imágenes web de LVD-142M (imágenes médicas, satelitales de alta resolución, microscopía).
- Sin capacidades de texto, tool calling ni agentes; no es un modelo generativo.
- El consumo de memoria crece de forma aproximadamente lineal con la resolución: 12 MP requiere ~14,7 GiB reservados, lo que excluye GPUs de 8-12 GB para ese caso.
- No se han publicado métricas de precisión (mIoU) en la información disponible, por lo que el rendimiento cualitativo frente a alternativas no puede validarse con datos.
- Los benchmarks de latencia corresponden a una única GPU (RTX 5060 Ti 16 GB, sm_120); el rendimiento en otras arquitecturas puede diferir.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fastforks/eomt
- Pesos DINOv2: https://huggingface.co/tue-mps/ade20k_semantic_eomt_large_512
- Pesos DINOv3: https://huggingface.co/tue-mps/eomt-dinov3-ade-semantic-large-512
- Código de la librería fastforks: https://github.com/kleinicke/fastforks
- Kernels: https://huggingface.co/fastforks/kernels
- Código original (Transformers, commit c4c4605f9618): https://github.com/huggingface/transformers
- Manifiesto de variantes (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/segmentation/models/eomt/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Evidencia de licencia: https://huggingface.co/tue-mps/ade20k_semantic_eomt_large_512/blob/aeb262f5a0bc609236d27f1277c3173ce57aeb27/README.md
