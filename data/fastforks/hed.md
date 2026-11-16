# fastforks/hed

## Resumen

HED soft edges (ControlNet 1.1) es un preprocesador de deteccion de bordes suaves basado en la reimplementacion Apache-2.0 de lllyasviel de Holistically-Nested Edge Detection (HED), una red de estilo VGG cuyas cinco salidas laterales se promedian para producir un mapa de bordes suave. El repositorio `fastforks/hed` es una model card sin pesos: fastforks descarga los pesos originales de `lllyasviel/Annotators` y los verifica contra un SHA-256 registrado. Se integra en el ecosistema fastforks como variante `hed@1` con backend `portable`.

El modelo resuelve un problema concreto dentro de los pipelines de image-to-image: generar mapas de lineas y bordes a partir de una imagen RGB de entrada, que despues se usan como condicionamiento en ControlNet. A diferencia del HED original, esta variante acepta entrada RGB y produce bordes mas suaves, lo que la hace adecuada para tareas de line art y preprocesado de control. Es el mismo preprocesador que ComfyUI expone como "HED Soft-Edge Lines" y que `controlnet_aux` implementa como `HEDdetector`.

La relevancia actual es de infraestructura mas que de investigacion: fastforks empaqueta el modelo con mediciones de latencia, memoria y paridad numerica frente al codigo original, algo poco habitual en preprocesadores de ControlNet. El modelo esta marcado como tier experimental y su licencia de pesos es Apache-2.0, con uso comercial permitido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de estilo VGG (HED, holistically-nested edge detection) con cinco salidas laterales promediadas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen H x W >= 32, padding a multiplo de 32) |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32 (CPU y referencia); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 (codigo y pesos) |
| Formato de pesos | `.pth` (PyTorch); el repositorio no aloja pesos |

## Arquitectura y entrenamiento

HED es una red convolucional de estilo VGG con cinco salidas laterales a distintas profundidades; el mapa final de bordes se obtiene promediando esas cinco salidas. La reimplementacion de lllyasviel (usada por `controlnet_aux` y ComfyUI) acepta entrada RGB y produce bordes mas suaves que el HED original. La salida es un mapa `[H, W]` en el rango [0, 1] a la resolucion de entrada, donde 1 indica linea.

No se declaran datos de entrenamiento para estos checkpoints concretos (lllyasviel/Annotators, ControlNet 1.1). El HED original de Xie y Tu se entrena sobre BSDS500, pero esta version reentrenada no especifica su dataset. No se documenta RLHF, DPO ni tecnicas de alineacion, al no ser un modelo generativo de texto. La implementacion fastforks anade un backend `portable` con paridad numerica verificada frente al codigo original fijado en el commit `b1aac318b15c` de `controlnet_aux`.

## Capacidades

- Deteccion de bordes suaves a partir de una imagen RGB de entrada.
- Generacion de mapas de lineas y line art para condicionamiento de ControlNet.
- Salida a la resolucion de entrada, con valores en [0, 1] donde 1 representa linea.
- Soporte de entrada de cualquier tamano H x W >= 32, con padding interno a multiplo de 32.
- Backend `portable` con fp16 en GPU y fp32 en CPU.
- Sin soporte de texto, tool calling, agentes ni capacidades multilingues (es un modelo puramente de vision).
- Sin backend de kernels personalizados: las convoluciones cuDNN dominan el tiempo de ejecucion.

## Casos de uso

- Preprocesado para ControlNet en pipelines de image-to-image: el modelo genera el mapa de bordes suaves que se pasa como condicionamiento a un modelo de difusion, sustituyendo al HED original cuando se busca un trazo mas limpio.
- Line art y entintado automatico: a partir de una foto o render se obtiene un mapa de lineas que sirve como base para coloreado o para estilizacion posterior.
- Integracion en ComfyUI: equivale al nodo "HED Soft-Edge Lines"; se usa en grafos de generacion controlada por estructura.
- Extraccion de estructura para retexturizado: el mapa de bordes preserva la geometria de la imagen original y permite regenerar materiales manteniendo la composicion.
- Procesado por lotes de imagenes de alta resolucion: con 11,3 ms por imagen a 1080x1920 en una RTX 5060 Ti 16 GB y 187 MiB de pico, es viable procesar lotes grandes en hardware de consumo.
- Prototipado e investigacion en vision por computador: la paridad verificada frente al codigo original (max |diff| <= 0,002 en CPU fp32) lo hace util como referencia reproducible en experimentos de deteccion de bordes.
- Despliegue en produccion con `torch.compile` o TensorRT: a 1024x1024 baja de 6,02 ms (portable) a 4,81 ms (compile) y 2,57 ms (TensorRT fp16), adecuado para pipelines de baja latencia.

## Benchmarks y rendimiento

Rendimiento medido en RTX 5060 Ti 16 GB (sm_120), segun la model card:

| Medicion | Original | Portable | Compile | TensorRT fp16 |
|---|---|---|---|---|
| Tiempo 1080x1920 (ms) | 38,5 | 11,3 | no disponible | no disponible |
| Memoria pico 1080x1920 (MiB, alloc/reserved) | 300 / 324 | 187 / 224 | no disponible | no disponible |
| Tiempo 1024x1024 (ms) | no disponible | 6,02 | 4,81 | 2,57 |
| Memoria pico 1024x1024 (MiB, alloc/reserved) | no disponible | 117 / 146 | 137 / 166 | 170 / 178 |

| Medicion | Original | Portable |
|---|---|---|
| Carga (s) | 0,24 | 0,18 |
| Primera llamada (s) | 0,06 | 0,01 |

Preparacion: compilacion en frio 9,37 s; build de ONNX + engine 11,6 s.

Paridad con el codigo original: en CPU float32, max |diff| <= 0,002; en GPU float16 (portable y kernels), mean |diff| <= 0,02 y p99 <= 0,25 sobre la salida `edges`.

No se han publicado resultados de benchmarks de calidad (F1 sobre BSDS500 u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 187 MiB de pico asignado a 1080x1920 en fp16; 117 MiB a 1024x1024 en portable y hasta 178 MiB con TensorRT (engine + torch).
- GPU recomendadas: cualquier GPU CUDA con soporte fp16; las mediciones se hicieron en una RTX 5060 Ti 16 GB.
- Cabe holgadamente en GPU de consumo, incluidas gamas bajas con suficiente memoria para el resto del pipeline.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`), con backend `portable`; compatible con `torch.compile` y TensorRT via ONNX. Tambien disponible a traves de `controlnet_aux` y ComfyUI.
- Latencia: 11,3 ms a 1080x1920 y 6,02 ms a 1024x1024 en portable; 2,57 ms con TensorRT fp16 a 1024x1024. No se documenta throughput agregado.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fastforks/hed` (este) | HED soft edges | RGB | mapa de bordes suave [0,1] | Apache-2.0 | fastforks, controlnet_aux, ComfyUI |
| HED original (Xie y Tu) | HED | imagen | mapa de bordes | no disponible en la informacion | referencia academica |
| PiDiNet | deteccion de bordes | imagen | mapa de bordes | no disponible en la informacion | controlnet_aux |
| TEED / Anyline | deteccion de bordes | imagen | mapa de bordes | no disponible en la informacion | controlnet_aux |
| M-LSD | deteccion de lineas rectas | imagen | segmentos de linea | no disponible en la informacion | controlnet_aux |

La model card situa a HED dentro del conjunto de preprocesadores de ControlNet (line art, HED, PiDiNet, TEED/Anyline, M-LSD) sin ofrecer comparativas de calidad entre ellos. No se dispone de datos de parametros ni de contexto para el resto de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: requiere descargar `ControlNetHED.pth` desde `lllyasviel/Annotators` y verificar el SHA-256; sin ese paso el modelo no funciona.
- Marcado como tier experimental por el propio autor del empaquetado.
- No se declaran datos de entrenamiento para estos checkpoints, lo que impide evaluar sesgos o cobertura del dominio.
- La salida es un mapa de bordes, no una imagen: no debe usarse como generador ni como segmentador semantico.
- La precision en GPU fp16 tiene error absoluto p99 de hasta 0,25 frente a la referencia, relevante en aplicaciones que necesiten bordes exactos.
- El modelo no procesa texto ni soporta instrucciones; no tiene capacidades de agente, tool calling ni multilingues.
- Licencia Apache-2.0 en codigo y pesos con uso comercial permitido, pero la model card advierte de que el paquete original se declara de uso de investigacion y recomienda revisar las cadenas de licencia antes de otros usos.
- La resolucion de entrada debe ser multiplo de 32 tras el padding; tamanos menores de 32 no estan soportados.
- No hay backend de kernels optimizado; el rendimiento depende de cuDNN y de la GPU.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/hed
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels de fastforks: https://huggingface.co/fastforks/kernels
- Pesos originales: https://huggingface.co/lllyasviel/Annotators
- Codigo original de controlnet_aux: https://github.com/huggingface/controlnet_aux
- Implementacion HED en controlnet_aux: https://github.com/huggingface/controlnet_aux/blob/b1aac318b15c4e65a21bc516dc236ad4bf593d46/src/controlnet_aux/hed/__init__.py
- Benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Card TOML con hashes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/edges/models/hed/card.toml
