# fastforks/pidinet

## Resumen

PiDiNet (Pixel Difference Network) es un detector de bordes y contornos de muy bajo coste computacional, publicado originalmente por Su et al. en ICCV 2021. Este repositorio, `fastforks/pidinet`, no contiene pesos propios: es una model card que documenta la integración del detector en el ecosistema `fastforks`, una librería de inferencia que descarga los pesos originales del autor (alojados en `lllyasviel/Annotators`) y los verifica mediante SHA-256. El modelo se usa habitualmente como preprocesador de ControlNet 1.1 (el `PidiNetDetector` de `controlnet_aux` y el nodo "PiDiNet Soft-Edge Lines" de ComfyUI) para generar mapas de líneas suaves a partir de una imagen RGB.

La arquitectura es una red de diferencias de píxeles con solo 0,7 millones de parámetros, en la que las convoluciones de diferencia del paper original se han re-parametrizado a convoluciones depthwise simples para facilitar el despliegue. La salida es un mapa de bordes `[H, W]` en el rango [0, 1] a la resolución de entrada, donde 1 indica línea. No es un modelo generativo ni de lenguaje: es un extractor de características visuales determinista.

Su relevancia práctica radica en la eficiencia: procesa una imagen de 1080x1920 en unos 13 ms con el backend portable en fp16 sobre una RTX 5060 Ti, con un pico de memoria de unos 328 MiB. La licencia es de solo uso en investigación, lo que limita seriamente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pixel Difference Network (PiDiNet), convoluciones de diferencia re-parametrizadas a convoluciones depthwise |
| Parametros totales | 0,7 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32 (CPU y referencia); no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (procesamiento de imagen) |
| Licencia | LicenseRef-research-only (solo investigación; uso comercial: no) |
| Formato de pesos | `.pth` (PyTorch); pesos originales en `lllyasviel/Annotators`, no alojados en este repo |
| Tamano de entrada | cualquier H x W >= 32, con padding a múltiplo de 32 |
| Pipeline | image-to-image |
| Backends | portable (PyTorch); sin backend de kernels personalizados |
| Variantes | `pidinet@1` (fichero `table5_pidinet.pth`, SHA-256 `80860ac26725...`) |

## Arquitectura y entrenamiento

PiDiNet se basa en las "pixel difference networks": en lugar de convoluciones estándar, la red original emplea convoluciones de diferencia de píxeles que aproximan operadores de gradiente de forma barata. En esta integración, el autor de la conversión ha re-parametrizado esas convoluciones de diferencia a convoluciones depthwise convencionales, lo que permite ejecutar la red con cuDNN sin kernels personalizados y sin pérdida apreciable de precisión (paridad verificada frente al código original: error máximo absoluto <= 0,002 en CPU fp32 y error medio <= 0,02 con p99 <= 0,25 en GPU fp16).

No se documenta en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset para estos checkpoints. El nombre del fichero (`table5_pidinet.pth`) coincide con el modelo BSDS500 de la tabla 5 del paper original, pero la model card no confirma explícitamente los datos de entrenamiento. No se menciona RLHF, DPO ni fine-tuning por preferencias, algo esperable en un detector de bordes. La innovación técnica destacable es precisamente la re-parametrización a depthwise, que habilita despliegue portable y compilación con `torch.compile` y TensorRT sin kernels a medida.

## Capacidades

- Detección de bordes y contornos suaves a partir de una imagen RGB de entrada.
- Generación de mapas de líneas tipo line-art, adecuados como preprocesador de ControlNet.
- Salida determinista `[H, W]` en [0, 1] a la resolución de entrada, con 1 indicando línea.
- Soporte de resolución arbitraria (H x W >= 32, con padding a múltiplo de 32); probado hasta 1080x1920.
- Ejecución en CPU (fp32) y GPU (fp16) con paridad verificada frente al código de referencia.
- Compatibilidad con `torch.compile` y TensorRT fp16 (4,50 ms en 1024x1024 con TensorRT frente a 6,59 ms en portable).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un extractor de características visuales, no un modelo de lenguaje.

## Casos de uso

- Preprocesado para ControlNet en generación de imágenes: se usa el mapa de bordes como condicionamiento para que un modelo de difusión genere imágenes que respeten la estructura de líneas de una foto o boceto de referencia. Es el uso canónico del `PidiNetDetector` de `controlnet_aux` y del nodo de ComfyUI.
- Rotoscopia y line-art automatizado: extraer contornos suaves de fotogramas para producir capas de líneas en pipelines de animación o ilustración, aprovechando la salida a resolución completa.
- Vectorización asistida: usar el mapa de bordes como paso previo a algoritmos de trazado de curvas en herramientas de conversión de imagen a vector.
- Preprocesado en tiempo real en GPUs de consumo: con 13 ms por imagen 1080x1920 en una RTX 5060 Ti, es viable procesar vídeo a 30-60 fps en un solo dispositivo.
- Edición de imagen guiada por estructura: integrar el detector en interfaces de edición donde el usuario dibuja o selecciona contornos para guiar la regeneración de zonas concretas.
- Investigación en visión por computador: servir como baseline ligero y reproducible (0,7 M de parámetros) para experimentos de detección de bordes y comparación con HED, TEED o Anyline.
- Prototipado en entornos sin GPU: la ejecución en CPU fp32 con paridad garantizada permite desarrollar y validar pipelines sin hardware dedicado.

## Benchmarks y rendimiento

Rendimiento de inferencia medido en RTX 5060 Ti 16 GB (sm_120), imagen sintética 1080x1920:

| Modelo | Tiempo original (ms) | Tiempo portable (ms) | Memoria pico original (MiB, alloc/reserved) | Memoria pico portable (MiB, alloc/reserved) |
|---|---|---|---|---|
| `pidinet` | 35,9 | 13,1 | 339 / 368 | 328 / 372 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Primera llamada original (s) | Primera llamada portable (s) |
|---|---|---|---|---|
| `pidinet` | 0,28 | 0,16 | 0,06 | 0,01 |

`torch.compile` y TensorRT, entrada 1024x1024:

| Modelo | Portable (ms) | Compile (ms) | TensorRT fp16 (ms) | Preparación compile (s) | Build ONNX + engine (s) | Memoria pico portable (MiB) | Memoria pico compile (MiB) | Memoria pico TensorRT (MiB) |
|---|---|---|---|---|---|---|---|---|
| `pidinet` | 6,59 | 5,66 | 4,50 | 12,4 | 20,4 | 186 / 228 | 166 / 190 | 187 / 200 |

No se han publicado resultados de benchmarks de calidad (BSDS500 F-score, ODS, OIS u otras métricas de detección de bordes) en la información disponible. Solo se documenta la paridad numérica frente al código original.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 328-372 MiB de memoria pico del allocator de PyTorch a 1080x1920 en fp16; unos 186-228 MiB a 1024x1024.
- GPU recomendadas: cualquier GPU con soporte CUDA y fp16; el modelo es tan pequeño que no requiere hardware de gama alta. Los benchmarks se realizaron en una RTX 5060 Ti 16 GB.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1650, RTX 3050 o superiores, y también en CPU.
- Opciones de despliegue: librería `fastforks` (`pip install fastforks`), backend portable (PyTorch/cuDNN), `torch.compile` y TensorRT fp16. No hay backend de kernels personalizados.
- Latencia y throughput: 13,1 ms por imagen 1080x1920 en portable fp16; 6,59 ms en 1024x1024 portable, 5,66 ms con `torch.compile` y 4,50 ms con TensorRT fp16. La carga del modelo tarda 0,16 s y la primera llamada 0,01 s en el backend portable.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Salida | Licencia | Uso comercial | Disponibilidad |
|---|---|---|---|---|---|---|
| PiDiNet (este repo) | 0,7 M | Detector de bordes (pixel difference, depthwise) | Mapa de bordes suaves [H, W] | LicenseRef-research-only | No | Pesos en `lllyasviel/Annotators`; integración en `fastforks` |
| HED | no disponible en la informacion | Detector de bordes (holistically-nested) | Mapa de bordes | no disponible | no disponible | Preprocesador de `controlnet_aux` |
| TEED / Anyline | no disponible en la informacion | Detector de bordes | Mapa de bordes | no disponible | no disponible | Preprocesador de `controlnet_aux` |
| M-LSD | no disponible en la informacion | Detector de segmentos de línea recta | Segmentos de línea + mapa | no disponible | no disponible | Preprocesador de `controlnet_aux` |

La información disponible solo confirma que PiDiNet, HED, TEED/Anyline y M-LSD forman parte del conjunto de preprocesadores de ControlNet; no se aportan parámetros, licencias ni métricas de calidad de los modelos alternativos, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Licencia de solo investigación: el código original se distribuye como `LicenseRef-research-only` y el autor no declara una licencia separada para los pesos. El uso comercial está explícitamente marcado como "no" en la model card.
- El repositorio no contiene pesos: la descarga se realiza desde `lllyasviel/Annotators` y se verifica por SHA-256; cualquier cambio en el origen rompería la integridad.
- No se documenta la composición del dataset de entrenamiento de estos checkpoints, lo que impide evaluar sesgos de dominio (estilos, etnias, iluminación, tipos de escena).
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y negativos en la detección de bordes en imágenes con texturas de bajo contraste o ruido.
- Resolución de entrada limitada a múltiplos de 32 tras el padding; imágenes muy pequeñas (por debajo de 32 píxeles por lado) no son válidas.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y su rango de salida está restringido a [0, 1].
- La paridad con el código original es aproximada en GPU fp16 (error medio <= 0,02, p99 <= 0,25), no exacta.
- El backend de kernels no está disponible; el rendimiento depende de cuDNN, `torch.compile` o TensorRT.
- Los benchmarks se han medido en una única GPU (RTX 5060 Ti 16 GB, sm_120); el rendimiento en otros dispositivos puede diferir.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/pidinet
- Repositorio de código `fastforks`: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Pesos originales del autor: https://huggingface.co/lllyasviel/Annotators
- Código original `controlnet_aux` (commit `b1aac318b15c`): https://github.com/huggingface/controlnet_aux
- Licencia del código original en `controlnet_aux`: https://github.com/huggingface/controlnet_aux/blob/b1aac318b15c4e65a21bc516dc236ad4bf593d46/src/controlnet_aux/pidi/LICENSE
- Licencia del repositorio original de PiDiNet: https://github.com/hellozhuo/pidinet/blob/master/LICENSE
- Documentación de benchmarks de `fastforks`: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/edges/models/pidinet/card.toml
