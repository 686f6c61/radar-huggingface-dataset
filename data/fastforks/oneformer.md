# fastforks/oneformer

## Resumen

OneFormer es un modelo de segmentación de imágenes universal presentado por Jain et al. en 2023, que unifica segmentación semántica, de instancias y panóptica bajo una única arquitectura condicionada por un token de tarea. Emplea un backbone Swin Transformer y un decodificador de estilo Mask2Former, y en esta ficha se distribuye la variante entrenada sobre ADE20K (150 clases) con backbone Swin-Large, ejecutada para la tarea semántica.

El repositorio `fastforks/oneformer` no aloja pesos: es una model card que apunta a los pesos originales de `shi-labs/oneformer_ade20k_swin_large` y verifica su integridad mediante SHA-256. La librería `fastforks` proporciona dos backends de inferencia (`portable`, en PyTorch puro, y `kernels`, con kernels CUDA propios) y ofrece métricas de latencia, memoria y paridad numérica frente al código original.

Su relevancia actual reside en la reproducibilidad y el rendimiento: el backend `kernels` reduce el tiempo de inferencia a 1024x2048 a 99,95 ms frente a los 307,22 ms del código original en fp32 (aceleración de 2,1x) y recorta la memoria pico asignada de 7395 MiB a 2054 MiB, lo que facilita el despliegue en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone Swin-Large y decodificador estilo Mask2Former, condicionado por token de tarea |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de cualquier H x W >= 1, redimensionada o rellenada internamente) |
| Tipos de cuantizacion | fp32 (original) y fp16 (por defecto en GPU); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT (pesos); código original Apache-2.0 |
| Formato de pesos | `pytorch_model.bin` (PyTorch) y `config.json`; no se distribuyen pesos en este repositorio |

## Arquitectura y entrenamiento

OneFormer sigue el paradigma de segmentación universal: un backbone Swin Transformer extrae características multiescala y un decodificador tipo Mask2Former genera máscaras y logits de clase, condicionado por un token de tarea que indica si la inferencia es semántica, de instancias o panóptica. En esta variante (`oneformer-swinl-ade20k`) se ejecuta la tarea semántica sobre ADE20K con 150 clases. La salida del modelo son logits por píxel y clase.

El entrenamiento reportado en la información disponible utiliza ImageNet-21k / ImageNet-22k (release completo de otoño de 2011) para el backbone y ADE20K (SceneParsing, 150 clases) para la segmentación. No se documentan en la información proporcionada detalles sobre volumen de tokens, composición exacta del dataset de segmentación ni uso de RLHF/DPO (no aplicable a un modelo de visión). La innovación destacable del ecosistema `fastforks` es la implementación de kernels CUDA propios (`fvm_seg`, `seg_up`) que aceleran la inferencia y reducen la memoria, con verificación de paridad numérica frente al código original (máx. |diff| <= 0,002 en CPU fp32; media |diff| <= 0,001 px y p99 <= 0,01 px en GPU fp16).

## Capacidades

- Segmentación semántica por píxel: devuelve un mapa `[H, W]` de índices de clase para una imagen RGB de entrada.
- Segmentación universal: la arquitectura OneFormer soporta también tareas de instancias y panóptica mediante token de tarea, aunque esta variante se ejecuta para la tarea semántica.
- Entrada de tamaño arbitrario: acepta cualquier H x W >= 1, con redimensionado o relleno interno.
- Ejecución en GPU y CPU: el backend `portable` funciona en PyTorch sobre GPU o CPU; el backend `kernels` requiere GPU NVIDIA con arquitectura soportada.
- Salida de logits por píxel: permite posprocesado personalizado (argmax, umbrales, fusión con otras fuentes).
- Verificación de integridad de pesos mediante SHA-256.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Segmentación semántica de imágenes aéreas o satelitales: el modelo acepta entradas de hasta 1988x2880 en fp16 (probado en RTX 5060 Ti 16 GB con 8,4 GiB pico asignados), lo que permite procesar ortofotos de alta resolución y obtener mapas de clases por píxel para cartografía.
- Análisis de escenas urbanas y conducción autónoma: con 150 clases de ADE20K (carretera, edificio, vegetación, vehículos), se puede usar para etiquetar fotogramas de vídeo y alimentar pipelines de percepción o anotación automática.
- Preetiquetado en pipelines de anotación: generar máscaras semánticas iniciales que los anotadores humanos corrigen, reduciendo el coste de creación de datasets; el backend `kernels` ofrece 59,0 ms a 640x480, adecuado para lotes grandes.
- Segmentación de interiores y robótica doméstica: las clases de ADE20K cubren muebles, superficies y estructuras, útil para navegación de robots o realidad aumentada en interiores.
- Control de calidad en imágenes industriales: segmentar regiones de una escena para detectar anomalías o verificar la presencia de objetos en líneas de inspección, con latencia de 85,4 ms a 1280x720 en el backend `kernels`.
- Investigación en segmentación universal: comparar el comportamiento semántico frente a las variantes de instancias y panóptica del mismo modelo, o evaluar la paridad numérica entre implementaciones.
- Despliegue en GPU de consumo: con 1295 MiB de memoria pico asignada a 640x480 en fp16, cabe en GPUs de gama media para prototipado y demos.

## Benchmarks y rendimiento

Segmentación sintética a 1024x2048 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Aceleración kernels vs portable | Memoria pico asignada/reservada original (MiB) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|---|
| `oneformer-swinl-ade20k` | 307,22 | 205,1 | 139,06 | 99,95 | 2,1x | 1,4x | 7395 / 7792 | 2054 / 2476 | 2054 / 2476 |

Velocidad y memoria pico a tamaños fijos (tiempo ms / memoria asignada / reservada en MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|---|
| `oneformer-swinl-ade20k` | portable | 86,2 / 1295 / 1940 | 120,8 / 2220 / 3960 | 138,9 / 3772 / 6702 | OOM |
| `oneformer-swinl-ade20k` | kernels | 59,0 / 1295 / 1858 | 85,4 / 2222 / 3854 | 103,3 / 3772 / 6642 | OOM |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `oneformer-swinl-ade20k` | 5,08 (512x512) | 4,10 | 3,27 | 0,81 (512x512) | 0,15 | 0,11 |

Paridad con el código original: CPU fp32 con máx. |diff| <= 0,002; GPU fp16 con media |diff| <= 0,001 px y p99 <= 0,01 px. No se han publicado resultados de benchmarks de precisión (mIoU) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 1295 MiB asignados a 640x480, 2222 MiB a 1280x720 y 3772 MiB a 1920x1080 en fp16 (backend `kernels`); el código original en fp32 requiere 7395 MiB a 1024x2048.
- GPU recomendadas: RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks); cualquier GPU NVIDIA con soporte para sm_120 para el backend `kernels`; el backend `portable` funciona en GPU y CPU.
- Cabe en GPU de consumo: sí, con 1295 MiB a 640x480 y 3772 MiB a 1920x1080; a 12 MP (4000x3000) se produce OOM en RTX 5060 Ti 16 GB.
- Opciones de despliegue: librería `fastforks` (`pip install fastforks`) con `segmentation.load(...)`; backend `portable` (PyTorch) o `kernels` (CUDA propio, descargado desde `fastforks/kernels` en el primer uso). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de segmentación).
- Latencia: 59,0 ms a 640x480, 85,4 ms a 1280x720 y 103,3 ms a 1920x1080 con `kernels`; 86,2 ms, 120,8 ms y 138,9 ms respectivamente con `portable`. Throughput no documentado explícitamente.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OneFormer (esta ficha, Swin-L ADE20K) | Swin + decodificador Mask2Former | no disponible | cualquier H x W >= 1 | semántica, instancias, panóptica (esta variante: semántica) | MIT (pesos), Apache-2.0 (código) | Hugging Face (`shi-labs/oneformer_ade20k_swin_large`) vía `fastforks` |
| Mask2Former | Transformer con decodificador de máscaras | no disponible | no disponible | semántica, instancias, panóptica | no disponible | no disponible |
| Segment Anything (SAM) | ViT con prompt encoder | no disponible | no disponible | segmentación promptable | no disponible | no disponible |

No se dispone de datos comparativos de precisión (mIoU) ni de parámetros en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos: la disponibilidad depende de los enlaces externos a `shi-labs/oneformer_ade20k_swin_large` y de la verificación SHA-256.
- El backend `kernels` requiere una GPU NVIDIA con arquitectura soportada y drivers recientes; si no hay kernel precompilado lanza `BackendUnavailableError` sin fallback silencioso.
- A 12 MP (4000x3000) se produce OOM en RTX 5060 Ti 16 GB; para imágenes mayores hay que trocear o redimensionar.
- Entrenado sobre ADE20K (150 clases): las clases fuera de ese vocabulario no se segmentan correctamente.
- No se documentan sesgos específicos ni tasas de alucinación; como modelo de visión, el riesgo principal es la clasificación errónea de píxeles en escenas fuera de la distribución de entrenamiento.
- La model card indica "research-use package" y recomienda revisar las cadenas de licencia originales antes de otros usos; los pesos se declaran MIT y el código Apache-2.0, pero conviene verificar la evidencia de licencia enlazada.
- No soporta texto, audio ni tool calling; no es adecuado para tareas de lenguaje.
- Los benchmarks se han medido únicamente en RTX 5060 Ti 16 GB (sm_120); el rendimiento en otras GPU puede variar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastforks/oneformer
- Pesos originales: https://huggingface.co/shi-labs/oneformer_ade20k_swin_large
- Repositorio de código `fastforks`: https://github.com/kleinicke/fastforks
- Kernels CUDA: https://huggingface.co/fastforks/kernels
- Código original (transformers, commit `c4c4605f9618`): https://github.com/huggingface/transformers
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Evidencia de licencia: https://huggingface.co/shi-labs/oneformer_ade20k_swin_large/blob/4a5bac8e64f82681a12db2e151a4c2f4ce6092b2/README.md
