# fastforks/raft

## Resumen

RAFT (Recurrent All-Pairs Field Transforms) es una arquitectura de estimacion de flujo optico propuesta por Teed y Deng en 2020. El repositorio `fastforks/raft` no contiene pesos propios: es una model card de distribucion que documenta como descargar los pesos originales de torchvision (variantes V2, entrenadas desde cero con la receta de referencia de optical flow) y verificar su integridad mediante SHA-256. La implementacion esta portada desde torchvision sin dependencia de esa libreria, y ofrece dos backends: `portable` (PyTorch puro) y `kernels` (kernels CUDA optimizados alojados en `fastforks/kernels`).

El modelo resuelve la tarea de estimacion de movimiento denso entre dos fotogramas RGB consecutivos: dada una pareja de imagenes, devuelve un campo de flujo por pixel (dx, dy) que indica el desplazamiento del primer fotograma al segundo. Es relevante para pipelines de vision por computador que necesitan flujo optico de alta calidad (video, conduccion autonoma, interpolacion de frames, seguimiento) con un rendimiento muy superior al de la implementacion original: el backend `kernels` alcanza hasta 5,8x de aceleracion frente a torchvision en fp32 y reduce el pico de memoria de 7164 MiB a 342 MiB en entradas de 1080x1920.

Se distribuyen cuatro variantes: `raft-large`, `raft-large-kitti`, `raft-large-things` y `raft-small`. El modelo no es un LLM: no procesa texto, no tiene ventana de contexto ni capacidades de razonamiento linguistico. Su interfaz es exclusivamente image-to-image.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RAFT: piramide de correlacion all-pairs a 1/8 de resolucion + ConvGRU con 12 iteraciones de refinamiento; upsample con mascara convexa aprendida (raft-small: bilineal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de cualquier H x W >= 128, con padding a multiplo de 8) |
| Tipos de cuantizacion | no disponible; se documenta ejecucion en fp16 y fp32 |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Codigo: BSD-3-Clause. Pesos: el autor no declara licencia separada; se asume BSD-3-Clause a partir del codigo. Uso comercial: si (segun la model card) |
| Formato de pesos | `.pth` (PyTorch), descargados desde `download.pytorch.org`; verificados por SHA-256 |

Variantes y pesos:

| Variante | Fichero de pesos | SHA-256 (12 hex) | Uso comercial |
|---|---|---|---|
| `raft-large@1` | raft_large_C_T_SKHT_V2-ff5fadd5.pth | `ff5fadd56d26` | si |
| `raft-large-kitti@1` | raft_large_C_T_SKHT_K_V2-b5c70766.pth | `b5c7076664d2` | si |
| `raft-large-things@1` | raft_large_C_T_V2-1bb1363a.pth | `1bb1363a43b4` | si |
| `raft-small@1` | raft_small_C_T_V2-01064c6d.pth | `01064c6dba73` | si |

## Arquitectura y entrenamiento

RAFT combina tres componentes: un extractor de caracteristicas convolucional compartido para ambos fotogramas, una piramide de correlacion all-pairs calculada a 1/8 de resolucion que captura similitudes entre todos los pares de pixeles, y un ConvGRU que itera 12 veces refinando el campo de flujo. La salida se sobremuestrea con una mascara convexa aprendida (en `raft-small` se usa interpolacion bilineal). La implementacion de fastforks reproduce la red de torchvision sin depender de torchvision.

Los pesos son los V2 de torchvision, entrenados desde cero con la receta de referencia de optical flow. Los datos de entrenamiento son FlyingChairs (Universidad de Freiburg) y Freiburg SceneFlow (FlyingThings3D, Driving, Monkaa): primero FlyingChairs, despues FlyingThings3D como parte de SceneFlow. No se documentan datos de RLHF ni DPO (no aplica). La innovacion tecnica destacable del repositorio es el backend `kernels`, con kernels CUDA especificos que aceleran la inferencia y reducen drasticamente el consumo de memoria.

## Capacidades

- Estimacion de flujo optico denso entre dos imagenes RGB consecutivas: salida por pixel (dx, dy) en pixeles.
- Entrada de tamano arbitrario con H x W >= 128 (padding a multiplo de 8); probado hasta 1024x2048 en fp16 con una RTX 5060 Ti de 16 GB.
- Dos backends de ejecucion: `portable` (PyTorch puro) y `kernels` (kernels CUDA optimizados).
- Compatibilidad con `torch.compile` (reduce el tiempo de 291 ms a 195 ms en 1080x1920 para `raft-large`).
- Exportacion a ONNX documentada; la construccion de motores TensorRT falla en las pruebas recogidas (en `raft-small` por exceder los 16 GB de la GPU de prueba).
- Verificacion de integridad de pesos por SHA-256 en la descarga.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni modo thinking: es un modelo puramente de vision.

## Casos de uso

- Interpolacion de frames en video: el campo de flujo denso entre fotogramas consecutivos permite sintetizar frames intermedios en postproduccion o conversion de tasa de refresco; el backend `kernels` procesa 1080x1920 en 83,5 ms con `raft-large`, viable para pipelines casi en tiempo real.
- Conduccion autonoma y ADAS: estimacion de movimiento de escena para odometria visual, deteccion de objetos dinamicos y analisis de escena; la variante `raft-large-kitti` esta ajustada especificamente para el dominio KITTI 2015 (45,8 ms en portable, 21,0 ms con kernels a 375x1242).
- Estabilizacion de video: el flujo por pixel permite compensar movimiento de camara y alinear fotogramas en herramientas de edicion o captura movil.
- Seguimiento de objetos y puntos (tracking): el flujo denso sirve de base para propagar puntos de interes entre fotogramas en tareas de tracking y segmentacion video.
- Vision robotica: estimacion de movimiento relativo entre lecturas de camara para navegacion, evitacion de obstaculos o manipulacion; el bajo pico de memoria del backend `kernels` (342 MiB en 1080x1920) permite desplegarlo junto a otros modelos en la misma GPU.
- Procesamiento de video a gran escala en servidores: la reduccion de memoria de 7164 MiB a 342 MiB con `kernels` multiplica el numero de flujos concurrentes por GPU, lo que abarata el coste por hora de procesamiento por lotes.
- Investigacion en vision por computador: referencia reproducible para comparar metodos de optical flow, con pesos verificados por hash y receta de entrenamiento documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (como KITTI Fl-all o Sintel EPE) en la informacion disponible. La model card si incluye mediciones de velocidad y memoria:

Flujo sintetico, 1080x1920:

| Modelo | Tiempo original fp32 (ms) | Portable (ms) | Kernels (ms) | Aceleracion kernels vs original | Memoria pico portable (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|
| `raft-large` | 480 | 291 | 83,5 | 5,7x | 5930 / 6058 | 342 / 372 |
| `raft-large-kitti` | 480 | 291 | 83,6 | 5,7x | 5930 / 6058 | 333 / 352 |
| `raft-large-things` | 481 | 291 | 83,1 | 5,8x | 5930 / 6058 | 333 / 352 |
| `raft-small` | 196 | 144 | 36,3 | 5,4x | 5669 / 5706 | 197 / 224 |

KITTI 2015, 375x1242:

| Modelo | Portable (ms) | Kernels (ms) | Aceleracion | Memoria pico portable (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|
| `raft-large` | 45,8 | 21,0 | 2,2x | 511 / 738 | 85 / 112 |
| `raft-large-things` | 45,8 | 21,1 | 2,2x | 511 / 738 | 85 / 112 |
| `raft-small` | 23,2 | 12,1 | 1,9x | 483 / 508 | 48 / 66 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `raft-large` | 0,14 | 0,17 | 1,07 | 0,76 | 0,30 | 0,11 |
| `raft-small` | 0,09 | 0,16 | 1,06 | 0,43 | 0,17 | 0,07 |

`torch.compile` y TensorRT (1080x1920):

| Modelo | Portable (ms) | compile (ms) | TensorRT fp16 | Kernels (ms) |
|---|---|---|---|---|
| `raft-large` | 291 | 195 | falla (build del motor) | 83,5 |
| `raft-large-kitti` | 291 | 195 | falla (build del motor) | 83,6 |
| `raft-large-things` | 291 | 195 | falla (build del motor) | 83,1 |
| `raft-small` | 144 | 110 | falla (excede 16 GB) | 36,3 |

## Requisitos de hardware

- VRAM estimada para inferencia: con backend `portable` en fp16, 1080x1920 requiere unos 5930 MiB asignados (6058 reservados) para `raft-large`; con backend `kernels`, 342 MiB asignados (372 reservados). A 1024x2048, `raft-large` alcanza 8,3 GiB asignados y 9,0 GiB reservados.
- GPU recomendadas: cualquier GPU CUDA con suficiente memoria; el backend `kernels` reduce los requisitos de forma drastica. Se documentan pruebas en una RTX 5060 Ti de 16 GB.
- Cabe en GPU de consumo: si. `raft-small` con `kernels` a 1080x1920 usa 197 MiB asignados; `raft-large` con `portable` necesita unos 6 GB.
- Opciones de despliegue: PyTorch nativo con los backends `portable` o `kernels`; `torch.compile`; exportacion ONNX. La construccion de motores TensorRT fp16 falla en las pruebas documentadas.
- Latencia y throughput: 83,5 ms por par 1080x1920 con `raft-large` y `kernels` (unos 12 pares por segundo en esa GPU de prueba); 21,0 ms por par a 375x1242 en KITTI 2015. La primera llamada con `kernels` tarda 0,11 s; la carga del modelo, 1,07 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fastforks/raft` (`raft-large`, kernels) | no disponible | cualquier H x W >= 128 | 83,5 ms a 1080x1920; 342 MiB pico | BSD-3-Clause (codigo); pesos asumidos BSD-3-Clause | Hugging Face (model card) + pesos en download.pytorch.org |
| RAFT original (torchvision V2) | no disponible | cualquier H x W >= 128 | 480 ms a 1080x1920 fp32; 7164 MiB pico | BSD-3-Clause | torchvision |
| `raft-small` (misma familia) | no disponible | cualquier H x W >= 128 | 36,3 ms a 1080x1920; 197 MiB pico | BSD-3-Clause (asumida) | Hugging Face (model card) |

No se dispone en la informacion proporcionada de datos de otros estimadores de flujo optico (por ejemplo, FlowNet, PWC-Net o GMFlow) para una comparativa cuantitativa de precision.

## Limitaciones y advertencias

- El repositorio no aloja pesos: es solo una model card. Sin acceso a `download.pytorch.org` y al codigo de `github.com/kleinicke/fastforks` no se puede ejecutar el modelo.
- No se han publicado resultados de precision (EPE, Fl-all) en la informacion disponible; no se puede evaluar la calidad del flujo frente a alternativas sin medirla.
- La licencia de los pesos no esta declarada de forma explicita por el autor: se asume BSD-3-Clause a partir del codigo. Conviene verificar antes de un uso comercial en produccion.
- La construccion de motores TensorRT fp16 falla en todas las variantes probadas; la ruta de aceleracion recomendada es el backend `kernels` o `torch.compile`.
- El backend `kernels` tiene un coste de carga mayor (1,07 s frente a 0,17 s de `portable`), relevante en despliegues con arranques frecuentes.
- La entrada debe tener H x W >= 128 y se rellena a multiplo de 8; resoluciones muy altas disparan la memoria en el backend `portable` (8,3 GiB a 1024x2048).
- Modelo de vision sin capacidades de lenguaje: no admite prompts, tool calling ni razonamiento textual. Los sesgos y el riesgo de alucinacion no aplican en el sentido habitual; el riesgo es de flujo incorrecto en oclusiones, superficies sin textura o movimientos muy grandes.
- Los pesos estan entrenados en dominios concretos (FlyingChairs, FlyingThings3D, KITTI); el rendimiento puede degradarse fuera de esos dominios sin ajuste fino.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/raft
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Fichero de definicion de variantes (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/flow/models/raft/card.toml
- Codigo original en torchvision (commit 1f1a920d685d): https://github.com/pytorch/vision
- Evidencia de licencia en torchvision: https://github.com/pytorch/vision/blob/1f1a920d685d46dfbe187934b785b7ecb7a182f2/torchvision/models/optical_flow/raft.py#L576
- Pesos `raft-large`: https://download.pytorch.org/models/raft_large_C_T_SKHT_V2-ff5fadd5.pth
- Pesos `raft-large-kitti`: https://download.pytorch.org/models/raft_large_C_T_SKHT_K_V2-b5c70766.pth
- Pesos `raft-large-things`: https://download.pytorch.org/models/raft_large_C_T_V2-1bb1363a.pth
- Pesos `raft-small`: https://download.pytorch.org/models/raft_small_C_T_V2-01064c6d.pth
