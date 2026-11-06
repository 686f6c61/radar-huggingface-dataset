# fastforks/zoedepth

## Resumen

ZoeDepth es un modelo de estimacion de profundidad monocular metrica presentado por Bhat et al. en 2023 (arXiv 2302.12288). El repositorio `fastforks/zoedepth` no contiene pesos propios: es una model card que documenta la integracion del checkpoint original `ZoeD_M12_NK.pt` dentro de la libreria `fastforks`, que descarga los pesos de los enlaces del autor y los verifica mediante SHA-256. El modelo combina un nucleo MiDaS v3.1 BEiT-L/16, preentrenado en profundidad relativa sobre 12 conjuntos de datos, con cabezas de "metric bins" afinadas para NYU Depth V2 (interior) y KITTI (exterior), seleccionadas por un enrutador de dominio aprendido.

La relevancia actual del repositorio no esta en el modelo en si, sino en la infraestructura que lo envuelve: `fastforks` ofrece dos backends de ejecucion (`portable` en PyTorch y `kernels` con kernels CUDA propios) y publica mediciones de latencia, memoria y precision frente al codigo original. Segun la model card, el backend `kernels` reduce el tiempo de inferencia a 88,87 ms frente a los 408,0 ms del codigo original en fp32 sobre una RTX 5060 Ti a resolucion 994x1482 (Middlebury 2014 half), con una precision equivalente (AbsRel 0,0528 frente a 0,0532 en NYUv2 test).

Se trata de un modelo experimental, orientado a estimacion de profundidad a partir de una unica imagen RGB, con salida de mapa de profundidad o profundidad inversa (metrica para las variantes marcadas como tales). No es un modelo de lenguaje ni un modelo generativo multimodal: su unica tarea es depth estimation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MiDaS v3.1 BEiT-L/16) con cabezas de metric bins y enrutador de dominio (ZoeD_M12_NK) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de cualquier H x W >= 8) |
| Tipos de cuantizacion | fp32 y fp16 (soportados por los backends `portable` y `kernels`); no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de vision, sin entrada de texto) |
| Licencia | Codigo MIT; licencia de pesos no declarada por los autores (`mit-code-weights-unstated`) |
| Formato de pesos | Checkpoint PyTorch `.pt` (`ZoeD_M12_NK.pt`, descargado del release del autor, no alojado en el repo) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ZoeDepth: un codificador MiDaS v3.1 BEiT-L/16 que produce profundidad relativa, sobre el que se anaden cabezas de metric bins especificas por dominio. La variante `ZoeD_M12_NK` incorpora dos cabezas metricas (NYU para interiores y KITTI para exteriores) y un enrutador de dominio aprendido que decide cual aplicar en funcion de la imagen de entrada. Esta decision es dependiente de los datos, lo que impide exportar el grafo con `torch.export` o compilarlo con `torch.compile(fullgraph=True)`, tal como documenta la model card.

El entrenamiento consta de dos fases: un preentrenamiento en profundidad relativa sobre 12 conjuntos de datos (heredado de MiDaS v3.1) y un afinado metrico posterior sobre NYU Depth V2 y KITTI. No se documentan en la informacion disponible detalles sobre numero de tokens, composicion exacta del dataset ni uso de RLHF/DPO (no aplica a esta tarea). La innovacion tecnica destacable del empaquetado `fastforks` es la implementacion de kernels CUDA propios (`cudnn_hacc`) que aceleran la inferencia entre 1,4x y 3,1x respecto al codigo original, con verificacion de paridad frente a salidas doradas del codigo del autor (max |diff| <= 0,002 en CPU float32; mean |diff| <= 1 % y p99 <= 3 % en GPU float16).

## Capacidades

- Estimacion de profundidad monocular metrica a partir de una unica imagen RGB.
- Salida de mapa de profundidad o profundidad inversa, con indicacion del tipo mediante `result.kind`.
- Seleccion automatica de dominio (interior NYU / exterior KITTI) mediante enrutador aprendido.
- Entrada de cualquier resolucion H x W >= 8; el modelo redimensiona o rellena internamente hasta su resolucion de trabajo.
- Soporte de parametros intrinsecos de camara (`intrinsics=K`, matriz 3x3 en pixeles) para modelos que los aceptan.
- Ejecucion en dos backends: `portable` (PyTorch, GPU o CPU) y `kernels` (kernels CUDA precompilados).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.

## Casos de uso

- **Reconstruccion 3D y fotogrametria**: el modelo genera mapas de profundidad metrica por imagen que pueden combinarse con las intrinsecos de camara para generar nubes de puntos o mallas en pipelines de reconstruccion, gracias a la salida metrica de la cabeza NYU/KITTI.
- **Robotica movil y navegacion**: estimacion de distancia a obstaculos a partir de una camara monocular en robots con restricciones de peso y consumo, donde no es viable un sensor LiDAR o estereo. La latencia de 74,9 ms a 640x480 con el backend `kernels` es compatible con bucles de control en tiempo real.
- **Realidad aumentada**: insercion de objetos virtuales con oclusion correcta mediante la profundidad por pixel de la escena capturada por la camara del dispositivo; la resolucion de trabajo fija permite un coste predecible independientemente de la resolucion de captura.
- **Preprocesado para modelos generativos**: generacion de mapas de profundidad como condicionamiento para difusion (ControlNet y similares) en pipelines de sintesis de imagen, donde la precision metrica relativa de ZoeDepth (AbsRel 0,0528 en NYUv2) es suficiente para guiar la estructura de la escena.
- **Analisis de escenas de interior**: medicion de distancias en imagenes de viviendas para aplicaciones inmobiliarias, planificacion de mobiliario o estimacion de volumenes, aprovechando el afinado especifico sobre NYU Depth V2.
- **Conduccion asistida y ADAS de bajo coste**: estimacion de profundidad en camaras frontales de vehiculos, con la cabeza KITTI afinada para escenas de exterior y el enrutador seleccionando automaticamente el dominio adecuado.
- **Procesado por lotes de grandes volumenes de imagenes**: el bajo consumo de memoria (1,5-2,5 GiB de pico segun resolucion con el backend `kernels`) permite ejecutar varias instancias en una sola GPU para clasificar o anotar datasets de imagen a gran escala.

## Benchmarks y rendimiento

Precision en profundidad (AbsRel / delta1 tras ajuste de escala y desplazamiento por minimos cuadrados, media sobre imagenes):

| Variante | Dataset | Original | Portable | Kernels |
|---|---|---|---|---|
| `zoedepth-nk` | NYUv2 test | 0,0532 / 0,9737 | 0,0528 / 0,9743 | 0,0528 / 0,9743 |
| `zoedepth-nk` | iBims-1 | 0,0669 / 0,9545 | 0,0668 / 0,9546 | 0,0668 / 0,9546 |
| `zoedepth-nk` | ETH3D two-view train left | 0,1139 / 0,8648 | 0,1130 / 0,8653 | 0,1130 / 0,8654 |
| `zoedepth-nk` | Middlebury 2014 trainingH left | 0,0449 / 0,9860 | 0,0449 / 0,9860 | 0,0449 / 0,9860 |

Nota: ETH3D y Middlebury podrian formar parte de los datos de entrenamiento, segun advierte la propia model card.

Latencia y memoria (RTX 5060 Ti 16 GB, sm_120):

| Medicion | Original fp32 | Original | Portable | Kernels |
|---|---|---|---|---|
| Middlebury 2014 half 994x1482 (ms) | 408,0 | 271,2 | 123,96 | 88,87 |
| Carga del modelo (s) | 8,35 | 8,35 | 1,92 | 0,33 |
| Primera llamada (s) | 1,53 | 1,53 | 0,28 | 0,12 |
| Pico de memoria en 994x1482 (MiB alloc/reserved) | 2040 / 2146 | 2040 / 2146 | 2037 / 2124 | 1771 / 1960 |

Rendimiento por resolucion fija (tiempo ms / pico alloc / pico reserved en MiB):

| Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|
| portable | 107,5 / 1857 / 1966 | 147,2 / 2046 / 2184 | 147,6 / 2107 / 2220 | 113,0 / 2451 / 2658 |
| kernels | 74,9 / 1548 / 1802 | 105,6 / 1847 / 2138 | 106,2 / 1907 / 2230 | 80,3 / 2142 / 2486 |

## Requisitos de hardware

- **VRAM estimada**: entre 1,5 y 2,7 GiB de pico segun resolucion y backend (medido en RTX 5060 Ti 16 GB). La resolucion de trabajo es fija, por lo que el coste depende de la relacion de aspecto, no del numero de pixeles de entrada.
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA; las mediciones publicadas corresponden a una RTX 5060 Ti (sm_120, arquitectura Blackwell). Para el backend `kernels` se requiere un kernel precompilado para la arquitectura concreta.
- **Cabe en GPU de consumo**: si, con margen amplio; una GPU de 4-8 GiB es suficiente. Tambien funciona en CPU con el backend `portable`.
- **Opciones de despliegue**: libreria `fastforks` (`pip install fastforks`), con backends `portable` (PyTorch) y `kernels` (CUDA). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision de este tipo.
- **Latencia y throughput**: 74,9 ms a 640x480 y 80,3 ms a 12 MP con `kernels`; 107,5 ms y 113,0 ms respectivamente con `portable`. Carga del modelo en 0,33 s (`kernels`) o 1,92 s (`portable`). El modelo acepta entradas de hasta 3000x4000 probadas (2,4 GiB de pico asignado con `portable` en fp16).

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de salida | Precision (NYUv2 AbsRel) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZoeDepth (ZoeD_M12_NK) | no disponible (BEiT-L/16 + cabezas) | Profundidad metrica (interior/exterior) | 0,0528 | Codigo MIT, pesos sin declarar | Pesos en release de GitHub del autor; empaquetado en `fastforks` |
| MiDaS v3.1 (BEiT-L/16) | no disponible | Profundidad relativa | no disponible en la informacion | MIT | Hugging Face / GitHub de ISL |
| Depth Anything V2 | no disponible | Profundidad relativa/metica segun variante | no disponible en la informacion | Apache 2.0 / CC-BY-NC segun variante | Hugging Face |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- **Licencia de pesos ambigua**: el codigo es MIT, pero los autores no declaran una licencia separada para los pesos. La model card asume MIT "por derivacion del codigo", lo que no constituye una garantia juridica. Verificar antes de cualquier uso comercial.
- **Repositorio sin pesos**: `fastforks/zoedepth` solo contiene la model card; los pesos se descargan de releases de GitHub del autor y se verifican por SHA-256. La disponibilidad depende de que esos enlaces sigan activos.
- **Estado experimental**: la propia model card clasifica el modelo como "experimental" (tier experimental).
- **Sin soporte de `torch.compile(fullgraph=True)` ni `torch.export`**: hay un graph break en el nucleo MiDaS y un enrutamiento de cabezas dependiente de los datos (documentado como xfail).
- **Entradas demasiado pequenas**: con `pad_input` activo, imagenes de menos de 5 px por lado lanzan `InputError`.
- **Riesgo de fuga en benchmarks**: ETH3D y Middlebury podrian estar en los datos de entrenamiento, por lo que sus cifras de precision no deben interpretarse como generalizacion limpia.
- **Sesgos de dominio**: el afinado metrico se limita a NYU (interior) y KITTI (exterior); escenas atipicas (subacuaticas, microscopicas, aereas) pueden degradar la precision metrica.
- **Dependencia de hardware para `kernels`**: el backend acelerado requiere un kernel CUDA precompilado para la arquitectura de GPU concreta; en arquitecturas no cubiertas hay que recurrir a `portable`.
- **Sin capacidades de texto**: no es un modelo de lenguaje; no admite prompts, tool calling ni razonamiento multi-paso.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/zoedepth
- Repositorio `fastforks`: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Codigo original de ZoeDepth (commit d87f17b): https://github.com/isl-org/ZoeDepth
- Licencia del codigo original: https://github.com/isl-org/ZoeDepth/blob/d87f17b2f5fdcb174cf4fb115491f4a6c60de152/LICENSE
- Pesos `ZoeD_M12_NK.pt`: https://github.com/isl-org/ZoeDepth/releases/download/v1.0/ZoeD_M12_NK.pt
- Hashes completos (`card.toml`): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/depth/models/zoedepth/card.toml
- Protocolo de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Paper de ZoeDepth: arXiv 2302.12288 (https://arxiv.org/abs/2302.12288)
