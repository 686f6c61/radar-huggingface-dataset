# fastforks/sam3

## Resumen

SAM 3 (Segment Anything 3) es el modelo de segmentación de imágenes promptable de Meta, publicado en 2025. Esta ficha corresponde al repositorio `fastforks/sam3`, que no aloja pesos propios: es una model card y un manifiesto de descarga que apunta a los pesos originales de Meta, verificándolos mediante SHA-256. La implementación ejecutable la proporciona la librería `fastforks`, con dos backends: `portable` (PyTorch puro) y `kernels` (kernels CUDA propios).

El modelo resuelve segmentación promptable por concepto: dada una imagen y un prompt (punto, caja positiva o negativa, o texto), devuelve todas las instancias que coinciden, con sus cajas, puntuaciones de calidad y máscaras booleanas. La arquitectura combina un tronco ViT con cuello FPN, un codificador de texto CLIP, un codificador de geometría y un encoder/decoder DETR con token de presencia, más un decodificador de máscaras. En esta variante no hay tracker de vídeo; el `module()` portable expone únicamente el codificador de imagen.

Es relevante porque unifica en un solo modelo la segmentación guiada por texto y por ejemplos visuales (cajas), algo que en generaciones anteriores requería pipelines separados. El tamaño de entrada del codificador es fijo en 1008x1008, y el modelo está pensado para ejecutarse en GPU consumer: en una RTX 5060 Ti de 16 GB, con fp16 y backend portable, alcanza unas 1080x1920 píxeles de entrada con 1,9 GiB de memoria pico asignada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: tronco ViT + cuello FPN + codificador de texto CLIP + codificador de geometría + encoder/decoder DETR con token de presencia + decodificador de máscaras (sin tracker de vídeo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen redimensionada internamente a 1008x1008) |
| Tipos de cuantizacion | fp16 y fp32 documentados en los benchmarks; no se detallan otros formatos cuantizados |
| Idiomas soportados | no disponible (el codificador de texto CLIP procesa prompts de texto, pero no se especifican idiomas) |
| Licencia | SAM License (LicenseRef-SAM-License), con componentes de código Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) más `vocab.json` y `merges.txt` para el tokenizador |

## Arquitectura y entrenamiento

El modelo sigue un diseño de segmentación promptable por concepto. Un tronco ViT extrae características de la imagen, que pasan por un cuello FPN. En paralelo, un codificador de texto CLIP procesa el prompt textual y un codificador de geometría procesa puntos y cajas (positivas y negativas). Un encoder/decoder tipo DETR, con un token de presencia que indica si el concepto aparece o no en la imagen, produce cajas y puntuaciones; un decodificador de máscaras genera las máscaras finales. La salida es un conjunto de cajas, puntuaciones y máscaras para cada instancia que coincide con el prompt.

Los datos de entrenamiento provienen del motor de datos SA-Co: anotaciones de imagen y vídeo generadas por dicho motor, más conjuntos de datos públicos e internos según el paper. No se publica un dataset unificado. La model card no detalla el número de tokens ni la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables de forma directa a una tarea de segmentación). La innovación principal es la segmentación por concepto con prompts combinados de texto y cajas de ejemplo en un único forward pass.

## Capacidades

- Segmentación promptable por concepto: devuelve todas las instancias de una imagen que coinciden con un prompt de texto y/o cajas de ejemplo.
- Prompts de punto: segmentación guiada por coordenadas con etiquetas positivas o negativas.
- Prompts de caja: cajas positivas y negativas para refinar la selección de instancias.
- Prompts de texto: uso del codificador CLIP para localizar conceptos descritos textualmente (por ejemplo, `model("photo.jpg", text="coin")`).
- Salida estructurada: cajas, puntuaciones de calidad y máscaras booleanas `[M, H, W]`.
- Token de presencia: el decoder DETR indica si el concepto solicitado está o no presente en la imagen.
- Generación de máscaras en pipeline `mask-generation`.
- Ejecución en GPU consumer: backend portable en fp16 y backend de kernels CUDA propios (`fastbb`, `cudnn_hacc`).
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo en esta variante.

## Casos de uso

- Anotación automática de datasets de visión: dado un concepto textual, el modelo genera máscaras de todas las instancias presentes, lo que acelera el etiquetado manual en pipelines de datos de entrenamiento.
- Segmentación interactiva en herramientas de edición de imagen: el usuario hace clic en un punto o dibuja una caja y obtiene la máscara del objeto; el soporte de cajas negativas permite excluir regiones no deseadas.
- Conteo y localización de objetos por descripción: con un prompt de texto como "coin", el modelo devuelve cajas y puntuaciones que permiten contar instancias y filtrar por umbral de confianza.
- Preprocesado para modelos de visión downstream: las máscaras generadas pueden recortar regiones de interés antes de pasarlas a clasificadores, OCR o modelos de captioning.
- Control de calidad en líneas de producción: segmentar piezas o defectos descritos textualmente sobre imágenes de cámara, aprovechando la entrada de hasta 1080x1920 validada en GPU consumer.
- Investigación en segmentación promptable: el backend portable en fp16 reproduce la salida del código original con una diferencia media de 0,35 px y p99 de 2,0 px, lo que permite usarlo como referencia reproducible.
- Prototipado en estaciones de trabajo con GPU de 16 GB: el modelo cabe en una RTX 5060 Ti con 1,9 GiB de memoria pico asignada en fp16, lo que facilita pruebas locales sin infraestructura de centro de datos.

## Benchmarks y rendimiento

Datos de la model card, medidos en una RTX 5060 Ti de 16 GB (sm_120) con entrada sintética de 1024x1024:

| Modelo | Tiempo fp32 original (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Aceleración kernels vs portable | Memoria pico original (MiB, asignada/reservada) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|---|
| `sam3` | 694,95 | 281,04 | 179,43 | 116,47 | 2,4x | 1,5x | 5255 / 5334 | 1922 / 2004 | 2019 / 2264 |

Carga y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `sam3` | 1,12 (840x1297) | 2,95 | 0,70† | 0,96 (840x1297) | 0,18† | 0,12† |

Velocidad y memoria pico a tamaños fijos (tiempo ms / memoria asignada / memoria reservada, en MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|---|
| `sam3` | portable | 179,8 / 1928 / 2196 | 181,5 / 1935 / 2208 | 182,6 / 1948 / 2192 | no disponible |
| `sam3` | kernels | 116,3 / 2052 / 2460 | 116,5 / 2059 / 2420 | 116,9 / 2072 / 2490 | no disponible |

Paridad con el código original: en CPU y float32, diferencia máxima de 0,0005; en GPU y float16, diferencia media de 0,35 px y p99 de 2,0 px para portable y kernels. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: 1,9 GiB de memoria pico asignada en fp16 con backend portable y 2,0 GiB con kernels para entrada 1024x1024; la reserva del allocator llega a 2,0-2,5 GiB según el caso.
- GPU recomendadas: RTX 5060 Ti de 16 GB es la hardware de referencia de los benchmarks; cualquier GPU NVIDIA con soporte para sm_120 y drivers recientes puede usar el backend de kernels.
- Cabe en GPU consumer: sí, con 16 GB de VRAM sobra margen; el límite práctico es la arquitectura de los kernels precompilados, no la memoria.
- Opciones de despliegue: librería `fastforks` (`pip install fastforks`), con modos `portable` (PyTorch en GPU o CPU) y `kernels` (CUDA precompilados descargados desde Hugging Face). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, al no ser un modelo generativo de texto.
- Latencia y throughput: 179,4 ms por llamada en portable y 116,5 ms en kernels para 1024x1024 en la RTX 5060 Ti; a tamaños fijos de 640x480 a 1920x1080 la latencia se mantiene estable (179-183 ms portable, 116-117 ms kernels), lo que sugiere que el coste dominante es el redimensionado interno a 1008x1008.
- Entrada máxima validada: 1080x1920 en portable fp16 con 1,9 GiB pico asignada; no hay dato para 12 MP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM 3 (este repo, `fastforks/sam3`) | no disponible | imagen redimensionada a 1008x1008; entrada validada hasta 1080x1920 | 116-179 ms por llamada en RTX 5060 Ti; paridad con el original ≤0,35 px de media | SAM License (pesos), Apache-2.0 (parte del código) | pesos gated en `facebook/sam3`; manifiesto en `fastforks/sam3` |
| SAM 2 | no disponible en la información proporcionada | no disponible | no disponible | SAM License | no disponible |
| SAM (original) | no disponible en la información proporcionada | no disponible | no disponible | SAM License | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Este repositorio no contiene pesos: solo la model card y el manifiesto de descarga. Los pesos están gated en `facebook/sam3` y requieren aceptar la licencia y apuntar `FASTFORKS_WEIGHTS_PATH` a la copia local; `fastforks` no los replica.
- Licencia SAM License, no Apache-2.0: la model card advierte que los términos no se han revisado de nuevo y que el paquete es de uso de investigación; hay que verificar la licencia antes de cualquier uso comercial. La tabla de variantes marca uso comercial como "yes", pero la nota de licencia pide comprobarlo.
- El backend `kernels` requiere un kernel precompilado para la arquitectura de GPU concreta; si no existe, lanza `BackendUnavailableError` y no hace fallback silencioso a portable.
- No hay tracker de vídeo en esta variante: la segmentación se limita a imagen.
- La entrada se redimensiona internamente a 1008x1008, lo que puede degradar la precisión en imágenes de resolución muy alta o con objetos pequeños; no hay dato para 12 MP.
- No se documentan sesgos del modelo, riesgos de alucinación de instancias ni limitaciones idiomáticas del codificador de texto; no disponible en la información proporcionada.
- El token de presencia puede producir falsos negativos si el concepto no se reconoce; el umbral de puntuación debe calibrarse por caso de uso.
- Los benchmarks se han medido en una única GPU (RTX 5060 Ti, sm_120); el rendimiento en otras arquitecturas no está documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/sam3
- Pesos originales de Meta (gated): https://huggingface.co/facebook/sam3
- Licencia SAM: https://huggingface.co/facebook/sam3/blob/main/LICENSE
- Código de `fastforks`: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de SAM 3 (commit `0570b3a`): https://github.com/facebookresearch/sam3
- Manifiesto de variantes (`card.toml`): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/promptable_segmentation/models/sam3/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos `model.safetensors`: https://huggingface.co/facebook/sam3/resolve/3c879f39826c281e95690f02c7821c4de09afae7/model.safetensors
- Tokenizador `vocab.json`: https://huggingface.co/facebook/sam3/resolve/3c879f39826c281e95690f02c7821c4de09afae7/vocab.json
- Tokenizador `merges.txt`: https://huggingface.co/facebook/sam3/resolve/3c879f39826c281e95690f02c7821c4de09afae7/merges.txt
