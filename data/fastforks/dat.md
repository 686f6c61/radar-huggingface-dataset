# fastforks/dat

## Resumen

DAT (fastforks) es una ficha de modelo para la tarea de restauración de imagen, concretamente superresolución x4, basada en la arquitectura DAT (Chen et al., ICCV 2023). El repositorio pertenece al autor `fastforks` y no aloja pesos: actúa únicamente como model card que documenta cómo descargar los pesos originales de los autores, verificarlos mediante SHA-256 e integrarlos en el ecosistema `fastforks`. La arquitectura combina grupos residuales que alternan atención de ventana espacial (ventanas rectangulares de 8 x 32) y atención de canal, cada uno con una rama convolucional e interacción adaptativa, más una red feed-forward con puerta espacial.

El modelo resuelve el problema de aumentar la resolución de una imagen RGB por un factor de 4, con variantes orientadas a calidad (`dat-x4`, `dat-2-x4`) y a eficiencia (`dat-light-x4`). Está entrenado sobre DF2K (DIV2K + Flickr2K) con degradación bicúbica, y se distribuye con licencia Apache-2.0 tanto en código como en pesos, lo que permite uso comercial. Su relevancia actual radica en que ofrece una implementación optimizada (backends `portable` y `kernels`) con aceleraciones de hasta 8,3x frente al código original en una RTX 5060 Ti, lo que lo hace viable en hardware de consumo.

La ficha está etiquetada como "experimental" y el pipeline es `image-to-image`. No se dispone de información sobre idiomas ni sobre parámetros del modelo en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DAT (Deep Adaptive Transformer): grupos residuales con atención de ventana espacial (8 x 32) y atención de canal, rama convolucional con interacción adaptativa, feed-forward con puerta espacial |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); entrada de cualquier H x W >= 32, múltiplo de 32 |
| Tipos de cuantizacion | no disponible (se menciona ejecución en fp16 y fp32 en los benchmarks) |
| Idiomas soportados | no disponible (modelo de imagen, no lingüístico) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | `.pth` (PyTorch, enlaces de Google Drive de los autores) |

## Arquitectura y entrenamiento

DAT es una red transformer para superresolución que organiza el cómputo en grupos residuales. Cada grupo alterna dos mecanismos de atención: atención de ventana espacial con ventanas rectangulares de 8 x 32 y atención de canal. Cada bloque de atención incorpora una rama convolucional y un mecanismo de interacción adaptativa que combina ambas representaciones. La red feed-forward utiliza una puerta espacial (spatial-gate FFN). Existen tres variantes: `dat-x4` (modelo principal x4), `dat-2-x4` (variante con expansión 2x en el feed-forward) y `dat-light-x4` (versión ligera con 60 canales y un upsampler de un solo paso).

El entrenamiento se realizó sobre DF2K, la combinación de DIV2K (1000 imágenes 2K de NTIRE 2017) y Flickr2K (2650 imágenes 2K de Flickr, EDSR), con degradación bicúbica y factor x4. Según la configuración de entrenamiento citada (`train_DAT_x4.yml`), el modelo x4 se ajustó finamente a partir del modelo x2. No se dispone de información sobre el número total de tokens de entrenamiento, composición detallada del dataset más allá de DF2K, ni sobre uso de RLHF/DPO (no aplicable a esta tarea).

## Capacidades

- Superresolución de imagen x4: recibe una imagen RGB y devuelve la imagen restaurada a 4 veces el tamaño de entrada, en RGB con rango [0, 1].
- Procesamiento por mosaicos (`tile=`): permite ejecutar imágenes grandes en teselas solapadas, con el mismo enfoque que ComfyUI.
- Entrada flexible: cualquier resolución H x W >= 32, con padding a múltiplo de 32.
- Backends de ejecución: `portable` (PyTorch) y `kernels` (kernels optimizados publicados en `fastforks/kernels`).
- Verificación de integridad: los pesos se descargan de los enlaces de los autores y se validan contra el SHA-256 documentado en la model card.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de imagen a imagen.

## Casos de uso

- Restauración de fotografías antiguas o de baja resolución: el modelo aplica un aumento x4 con degradación bicúbica, adecuado para digitalizaciones que han perdido detalle por downsampling.
- Mejora de miniaturas y assets web: se puede integrar en un pipeline que reciba imágenes pequeñas y genere versiones de mayor resolución antes de servirlas, usando el backend `kernels` para reducir latencia (268 ms para `dat-light-x4` en 512x512).
- Preprocesado para pipelines de visión por computador: aumentar la resolución de imágenes de entrada antes de tareas de detección o segmentación, con la ventaja de que el modelo admite cualquier tamaño >= 32 y padding automático.
- Procesamiento por lotes en servidor con GPU de consumo: `dat-light-x4` requiere 6,3 GiB de pico en 1024x1024 en fp16, por lo que cabe en GPUs de 8-16 GB y permite despliegues económicos.
- Integración en flujos de ComfyUI: el parámetro `tile=` replica el comportamiento de teselado de ComfyUI, lo que facilita incorporar el modelo a grafos de restauración existentes.
- Evaluación comparativa de algoritmos de superresolución: al incluir métricas PSNR/SSIM sobre DIV2K y comparativas con el código original, sirve como referencia reproducible para investigaciones sobre upscaling.
- Restauración en aplicaciones de edición fotográfica: el modelo `dat-x4` ofrece la mayor calidad de las tres variantes (10,1 GiB de pico en 1024x1024) para integraciones de escritorio o estaciones de trabajo con GPU dedicada.

## Benchmarks y rendimiento

Rendimiento en restauración sintética 512x512 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original (ms) | Tiempo portable (ms) | Tiempo kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB alloc/reserved) |
|---|---|---|---|---|---|
| `dat-2-x4` | 4880 | 1312 | 1221 | 4,0x | 2276 / 2378 |
| `dat-light-x4` | 2204 | 268 | 264 | 8,3x | 1535 / 1552 |
| `dat-x4` | 9564 | 1565 | 1391 | 6,9x | 2552 / 2624 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `dat-2-x4` | 2,04 | 0,71 | 0,72 | 5,52 | 2,14 | 2,01 |
| `dat-light-x4` | 3,48 | 0,21 | 1,25 | 2,72 | 1,30 | 1,15 |
| `dat-x4` | 2,20 | 2,99 | 0,71 | 6,13 | 2,31 | 2,15 |

`torch.compile` y TensorRT (512x512):

| Modelo | Portable (ms) | Compile (ms) | TensorRT fp16 (ms) | Kernels (ms) | Compilación en frío (s) |
|---|---|---|---|---|---|
| `dat-2-x4` | 1312 | 964 | diferido (build > 5 min) | 1221 | 44,3 |
| `dat-light-x4` | 268 | 158 | 136 | 264 | 36,7 |
| `dat-x4` | 1565 | 1063 | diferido (build > 5 min) | 1391 | 43,1 |

Precisión en DIV2K validation (PSNR/SSIM en canal Y, BT.601): la información proporcionada se interrumpe en la tabla de precisión para `dat-x4` en DIV2K validation (cada 4ª imagen, 25 imágenes, bicubic x4), sin que se incluyan los valores numéricos de PSNR ni de las demás variantes. No se han publicado en la información disponible los resultados completos de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia en 1024x1024 (fp16, portable): `dat-2-x4` 10,1 GiB pico asignado / 14,1 GiB reservado; `dat-light-x4` 6,3 GiB / 7,4 GiB; `dat-x4` 10,1 GiB / 14,9 GiB.
- VRAM estimada en 512x512: entre 1,4 y 2,6 GiB según variante y backend.
- GPU recomendadas: RTX 5060 Ti 16 GB es el hardware de referencia de los benchmarks; para `dat-x4` y `dat-2-x4` en 1024x1024 se necesita al menos 16 GB de VRAM. `dat-light-x4` cabe en GPUs de 8 GB.
- Cabe en GPU de consumo: sí, con `dat-light-x4` en GPUs de 8 GB o superiores; las variantes completas requieren 16 GB para resoluciones altas.
- Opciones de despliegue: librería `fastforks` con backends `portable` y `kernels`; también `torch.compile` y TensorRT (fp16) para `dat-light-x4` (136 ms en 512x512). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de imagen).
- Latencia y throughput: 264-1565 ms por imagen 512x512 según variante y backend; `dat-light-x4` con TensorRT fp16 alcanza 136 ms.

## Comparativa con modelos similares

| Modelo | Tarea | Escala | Entrenamiento | Licencia | Pesos disponibles |
|---|---|---|---|---|---|
| DAT (este repo) | Superresolución / restauración | x4 | DF2K bicúbico | Apache-2.0 | Enlaces externos (Google Drive), no alojados |
| Real-ESRGAN | Restauración real-world | x4 (típico) | Degradaciones reales | no disponible en la información | no disponible en la información |
| Modelos PSNR-oriented (genéricos) | Superresolución | x4 | Bicúbico | no disponible | no disponible |

La model card menciona explícitamente a Real-ESRGAN como comparación cualitativa: está entrenado para degradaciones del mundo real, no bicúbicas, por lo que su PSNR en DIV2K es bajo y los números no son comparables con upscalers orientados a PSNR. No se dispone de datos de benchmarks de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente con degradación bicúbica: su rendimiento puede degradarse en imágenes con ruido real, compresión JPEG o artefactos no bicúbicos.
- El repositorio no aloja pesos: depende de enlaces de Google Drive de los autores, lo que introduce un punto de fallo externo y requiere verificación SHA-256.
- Tier "experimental": la propia ficha lo etiqueta como experimental, lo que desaconseja su uso en producción sin validación previa.
- La tabla de precisión en DIV2K está incompleta en la información disponible; no se pueden confirmar los valores de PSNR/SSIM finales.
- Sin información sobre sesgos: al ser un modelo de imagen, los sesgos potenciales estarían en los datos de entrenamiento (DF2K), pero no se documentan análisis al respecto.
- Riesgo de artefactos y alucinación visual: como todo modelo generativo de superresolución, puede inventar texturas plausibles que no estaban en la imagen original.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la model card advierte de "original-code strings" de paquete de investigación que deben revisarse antes de cualquier otro uso.
- Memoria elevada en resoluciones altas: `dat-x4` y `dat-2-x4` requieren hasta 14,9 GiB reservados en 1024x1024, lo que limita su despliegue en GPUs de consumo de gama media.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/dat
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de DAT (zhengchen1999): https://github.com/zhengchen1999/DAT (commit `1645c64fad7c`)
- Configuración de pesos y hashes (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/restoration/models/dat/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos `dat-x4`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1pEhXmg--IWHaZOwHUFdh7TEJqt2qeuYg
- Pesos `dat-2-x4`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1sfB15jklXRjGiZZWgYXZAYc2Ut4TuKOz
- Pesos `dat-light-x4`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=12m8cZ_vkztI5VsQemoHnbVVBm1ZtQe7J
- Carpeta de modelos preentrenados de los autores: https://drive.google.com/drive/folders/1iBdf_-LVZuz_PAbFtuxSKd_11RL1YKxM
- Licencia del código original: https://github.com/zhengchen1999/DAT/blob/1645c64fad7c94d94abd090bd1319eec1f26f7cc/LICENSE
- README del código original: https://github.com/zhengchen1999/DAT/blob/1645c64fad7c94d94abd090bd1319eec1f26f7cc/README.md
