# fastforks/anyline

## Resumen

AnyLine es un preprocesador de deteccion de bordes y line art para ControlNets condicionados por lineas, distribuido en Hugging Face bajo el identificador `fastforks/anyline`. No es un modelo generativo: recibe una imagen RGB y devuelve un mapa de lineas `[H, W]` en el rango [0, 1], donde 1 indica linea, a la resolucion de entrada. Combina dos componentes: la red de bordes MTEED (arquitectura TEED, pesos originales de TheMisto.ai) y un line art por diferencia de Gaussianas al que se eliminan motas pequenas, produciendo mapas de lineas nitidos.

El repositorio es unicamente una model card: no aloja pesos. El paquete `fastforks` descarga los pesos de los autores desde `TheMistoAI/MistoLine` y los verifica contra el SHA-256 registrado en la card. El codigo original de referencia es `controlnet_aux` de Hugging Face, fijado en el commit `b1aac318b15c`, y el codigo del wrapper esta en el repositorio `kleinicke/fastforks`.

Es relevante para pipelines de image-to-image con ControlNet de tipo line art, HED, PiDiNet, TEED o Anyline, y para flujos de trabajo en ComfyUI. El modelo esta marcado por el autor como tier experimental y backend `portable`, con licencia OpenRAIL++-M en los pesos MTEED (uso comercial permitido con restricciones que deben propagarse).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red CNN de bordes MTEED (arquitectura TEED) combinada con line art por diferencia de Gaussianas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32; no se documentan cuantizaciones de enteros |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Codigo MIT; pesos MTEED bajo OpenRAIL++-M (LicenseRef-CreativeML-OpenRAIL-PlusPlus-M) |
| Formato de pesos | `.pth` (PyTorch, MTEED.pth); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional de deteccion de bordes (MTEED, basada en TEED) que se fusiona en coma flotante con un mapa de line art obtenido por diferencia de Gaussianas, con filtrado de motas pequenas. La fusion sigue el metodo de `TheMistoAI/ComfyUI-Anyline`, no el de `controlnet_aux`, cuyo `AnylineDetector` mezcla arrays uint8 y provoca desbordamiento en la operacion `1 - (1 - top) * (1 - base)`, generando mapas distintos donde se dibuja line art.

No se declaran datos de entrenamiento para MTEED en la informacion disponible. No se documenta RLHF, DPO ni tecnicas de alineacion, por tratarse de un preprocesador determinista. La innovacion principal es el wrapper `fastforks`: backend portable en fp16 con paridad verificada frente al codigo original (CPU float32 con max |diff| <= 0.002; GPU fp16 con mean |diff| <= 0.02 y p99 <= 0.25). No hay backend de kernels personalizados porque no se ha medido que aporten ganancia sobre el CNN MTEED mas la fusion en GPU.

## Capacidades

- Deteccion de bordes y generacion de mapas de lineas a partir de una imagen RGB de entrada.
- Salida de un mapa `[H, W]` float32 en [0, 1] a la resolucion de entrada, con 1 indicando linea.
- Soporte de entrada de cualquier tamano H x W >= 32, con padding a multiplo de 32.
- Preprocesador valido para ControlNets de tipo line art, HED, PiDiNet, TEED y Anyline.
- M-LSD tambien devuelve segmentos de linea recta (capacidad del conjunto de preprocesadores referenciados).
- Ejecucion en GPU con fp16 y en CPU con fp32.
- Integracion con el ecosistema `fastforks` (`edges.load("anyline")`) y con ComfyUI-Anyline.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.

## Casos de uso

- ControlNet condicionado por lineas en image-to-image: el mapa de bordes generado por AnyLine se pasa como condicion a un ControlNet line art para preservar la estructura del boceto original en la generacion.
- Flujos de trabajo en ComfyUI: el nodo Anyline de ComfyUI-Anyline usa este preprocesador para producir mapas de lineas nitidos antes de un sampler con ControlNet.
- Extraccion de line art para ilustracion y comic: la combinacion MTEED + diferencia de Gaussianas produce lineas limpias y elimina motas, adecuada para entintado o coloreado posterior.
- Preprocesado en pipelines de difusion por lotes: con 50,7 ms por imagen a 1080x1920 en RTX 5060 Ti 16 GB (backend portable fp16) y 654 MiB de pico asignado, permite procesar conjuntos grandes con requisitos modestos.
- Prototipado rapido en GPU de consumo: el modelo cabe en GPUs consumer (probado en RTX 5060 Ti 16 GB) y arranca en 0,17 s con primera llamada de 0,05 s en portable.
- Generacion de mascaras de bordes para tareas de vision downstream: segmentacion, inpainting guiado por estructura o transferencia de estilo con preservacion de contornos.
- Benchmarking y comparacion de preprocesadores: la card incluye mediciones de latencia y memoria frente al codigo original, util para evaluar alternativas (line art, HED, PiDiNet, TEED).

## Benchmarks y rendimiento

Datos de la model card (RTX 5060 Ti 16 GB, sm_120, fp16 salvo indicacion):

| Escenario | Original | Portable | Notas |
|---|---|---|---|
| Tiempo, 1080x1920 (ms) | 585 | 50,7 | edges sinteticos |
| Memoria pico asignada, 1080x1920 (MiB) | 909 | 654 | reservada: 1002 / 722 |
| Carga (s) | 0,11 | 0,17 | – |
| Primera llamada (s) | 0,62 | 0,05 | – |
| Tiempo, 1024x1024 (ms) | – | 24,0 (portable) / 11,6 (compile) | TensorRT fp16 planificado para 0.2.1 |
| Memoria pico, 1024x1024 (MiB) | – | 362 / 384 (portable); 306 / 346 (compile) | asignada / reservada |
| Preparacion compile | – | 40,0 s (primera llamada en frio) | – |

No se han publicado resultados de benchmarks de calidad (F1, precision/recall de bordes) en la informacion disponible; solo se documenta la paridad con el codigo original.

## Requisitos de hardware

- VRAM estimada: 654 MiB de pico asignado y 722 MiB reservado a 1080x1920 en fp16; 362/384 MiB a 1024x1024.
- GPU recomendadas: cualquier GPU con al menos ~1 GiB libre; probado en RTX 5060 Ti 16 GB (sm_120). A100 y H100 son sobredimensionadas para este preprocesador.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 5060 Ti y superiores.
- Despliegue: paquete `fastforks` (`pip install fastforks`), backend portable en PyTorch; `torch.compile` disponible (11,6 ms a 1024x1024); TensorRT fp16 planificado para 0.2.1; integracion con ComfyUI-Anyline. No se documenta vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 50,7 ms a 1080x1920 y 24,0 ms a 1024x1024 en portable; 11,6 ms con compile a 1024x1024. Throughput no documentado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Resolucion | Licencia | Notas |
|---|---|---|---|---|---|
| AnyLine (`fastforks/anyline`) | Preprocesador de bordes (MTEED + DoG) | no disponible | H x W >= 32, multiplo de 32 | OpenRAIL++-M (pesos), MIT (codigo) | 50,7 ms a 1080x1920, portable fp16 |
| `controlnet_aux` AnylineDetector | Preprocesador de bordes | no disponible | no disponible | MIT (codigo original) | Mezcla uint8 con desbordamiento; mapas distintos |
| MistoLine Anyline (`TheMistoAI/MistoLine`) | Pesos originales MTEED | no disponible | no disponible | OpenRAIL++-M | Fuente de los pesos usados aqui |
| HED / PiDiNet / TEED (via `controlnet_aux`) | Preprocesadores de bordes alternativos | no disponible | no disponible | MIT (codigo) | Mencionados como preprocesadores equivalentes; sin datos de latencia comparativos |

## Limitaciones y advertencias

- El repositorio no contiene pesos: requiere descarga desde `TheMistoAI/MistoLine` y verificacion SHA-256; sin red, el modelo no funciona.
- Los pesos MTEED estan bajo OpenRAIL++-M: uso comercial permitido con restricciones de uso que deben propagarse a los productos derivados; los terminos de los datos de entrenamiento no han sido verificados.
- No se declaran datos de entrenamiento de MTEED, lo que impide auditar sesgos o procedencia del dataset.
- Tier experimental: el propio autor lo marca como tal; no hay benchmarks de calidad publicados.
- La fusion en coma flotante difiere del `AnylineDetector` de `controlnet_aux`, que usa uint8 con desbordamiento; los mapas no son intercambiables entre implementaciones.
- Entrada limitada a imagenes RGB; no procesa texto, audio ni video.
- Resolucion minima 32x32 y padding a multiplo de 32, lo que puede alterar mapas en imagenes de dimensiones irregulares.
- No hay backend de kernels personalizados ni TensorRT disponible todavia (planificado para 0.2.1).
- No aplica a tareas generativas: no produce imagenes ni texto, solo mapas de bordes.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/anyline
- Repositorio del codigo `fastforks`: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Codigo original `controlnet_aux` (commit `b1aac318b15c`): https://github.com/huggingface/controlnet_aux
- Pesos de los autores (MistoLine): https://huggingface.co/TheMistoAI/MistoLine
- Pesos MTEED directos: https://huggingface.co/TheMistoAI/MistoLine/resolve/1d9d0b3d48b295cf70d80a0f839a3055672f8393/Anyline/MTEED.pth
- ComfyUI-Anyline: https://github.com/TheMistoAI/ComfyUI-Anyline
- Licencia ComfyUI-Anyline: https://github.com/TheMistoAI/ComfyUI-Anyline/blob/40d7b290fe829d50e4e12e7f34498c2d30913b53/LICENSE
- README de MistoLine: https://huggingface.co/TheMistoAI/MistoLine/blob/1d9d0b3d48b295cf70d80a0f839a3055672f8393/README.md
- Benchmarks de `fastforks`: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Hashes completos (`card.toml`): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/edges/models/anyline/card.toml
