# fastforks/densenet

## Resumen

DenseNet es una arquitectura de red neuronal convolucional presentada originalmente por Huang et al. en 2016, caracterizada por bloques convolucionales densamente conectados en los que cada capa recibe como entrada las salidas de todas las capas anteriores. El repositorio `fastforks/densenet` no contiene pesos propios: es una model card de integración que permite a la librería `fastforks` descargar los pesos originales de PyTorch Vision (`densenet121-a639ec97.pth`) y verificarlos mediante SHA-256 antes de su uso.

La relevancia de esta ficha es doble. Por un lado, documenta una implementación de inferencia optimizada para clasificación de imágenes en ImageNet-1k con dos backends: `portable` (PyTorch estándar en fp16 sobre GPU o CPU) y `kernels` (kernels CUDA propios: `cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`). Por otro, el modelo solo publica una variante, `densenet121.tv_in1k@1`, con entrada fija de 224x224 píxeles y salida de logits sobre las 1.000 clases de ImageNet-1k.

El interés práctico reside en las cifras de rendimiento reportadas: el backend `kernels` reduce el tiempo de inferencia de 9,41 ms (portable) a 1,57 ms en una RTX 5060 Ti, un speed-up de 6,0x frente a portable y 6,8x frente al código original en fp32. No obstante, se trata de un modelo de clasificación de imagen cerrado a ImageNet-1k, no de un modelo generativo ni multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet-121 (CNN con bloques densamente conectados, Huang et al. 2016) |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 224x224) |
| Tipos de cuantizacion | fp32 (original) y fp16 (portable y kernels); no se documentan otras |
| Idiomas soportados | no aplica (clasificacion de imagenes, sin procesamiento de lenguaje) |
| Licencia | Codigo BSD-3-Clause; licencia de pesos no declarada por los autores (`bsd-3-clause-code-weights-unstated`) |
| Formato de pesos | `.pth` (PyTorch), descargado desde `download.pytorch.org`, no alojado en el repo |
| Variantes | `densenet121.tv_in1k@1` (unica) |
| Tarea | Clasificacion de imagen, ImageNet-1k (1.000 clases) |
| Entrada | 1 imagen RGB, redimensionada lado corto 256 y recorte central a 224x224 |
| Salida | Logits de las 1.000 clases de ImageNet-1k |
| Backends | `portable` (PyTorch), `kernels` (CUDA propio) |
| Libreria | `fastforks` (`pip install fastforks`) |
| SHA-256 (12 hex) | `a639ec97d7c3` |

## Arquitectura y entrenamiento

DenseNet-121 es una red convolucional en la que cada bloque denso concatena las activaciones de todas las capas precedentes dentro del bloque, en lugar de sumarlas como en ResNet. Esta conectividad densa reduce el numero de parametros y favorece la reutilizacion de caracteristicas y el flujo de gradientes. La variante `tv_in1k` corresponde a los pesos de referencia de PyTorch Vision entrenados sobre ImageNet-1k (ILSVRC 2012), con entrada fija de 224x224.

El repositorio de `fastforks` no reentrena ni modifica los pesos: implementa dos rutas de ejecucion sobre los mismos pesos originales. El backend `portable` ejecuta PyTorch en fp16 (o fp32 donde fp16 no es soportado o no es finito) y sirve como referencia de precision; el backend `kernels` sustituye operaciones por kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) descargados desde `fastforks/kernels` en el primer uso segun la arquitectura de GPU. La paridad con el codigo original se verifica contra salidas golden del commit fijado `1f1a920d685d`: en CPU fp32 la diferencia maxima absoluta es <= 0,002; en GPU fp16 (portable y kernels) la diferencia media es <= 0,02 px y el p99 <= 0,08 px.

## Capacidades

- Clasificacion de imagenes en las 1.000 clases de ImageNet-1k, devolviendo logits y un metodo `top(k)` para obtener las k clases mas probables.
- Inferencia en GPU (CUDA, fp16) y en CPU (fp32) mediante el backend `portable`.
- Aceleracion opcional mediante kernels CUDA propios con el backend `kernels`, que requiere driver NVIDIA reciente y un kernel precompilado para la arquitectura de GPU; si no existe, lanza `BackendUnavailableError` sin fallback silencioso.
- Seleccion automatica de backend con `mode="auto"`, que elige `kernels` cuando puede ejecutarse y registra la decision.
- Verificacion de integridad de pesos mediante SHA-256 antes de la carga.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision multimodal, audio ni modos de pensamiento. Es exclusivamente un clasificador de imagen de dominio cerrado.

## Casos de uso

- Moderacion de contenido visual en pipelines de subida de imagenes: el modelo clasifica cada imagen en una de las 1.000 clases de ImageNet-1k con latencias de 1,6 ms en GPU (backend `kernels`), lo que permite procesar lotes grandes en tiempo casi real y filtrar categorias no permitidas antes de almacenar el contenido.
- Etiquetado automatico de catalogos de producto: para inventarios de imagenes que se correspondan con clases de ImageNet (animales, vehiculos, utensilios, electrodomesticos, etc.), el modelo genera etiquetas top-k que pueden usarse como metadatos de busqueda o como preetiquetado para revision humana.
- Preprocesamiento en pipelines de vision por computador: usar los logits de DenseNet-121 como caracteristicas o como clasificador base en sistemas de deteccion, segmentacion o recuperacion de imagenes, aprovechando la paridad verificada con el codigo original de PyTorch Vision.
- Clasificacion en dispositivos con GPU de consumo: con 0,1 GiB de memoria pico asignada en fp16 sobre una RTX 5060 Ti de 16 GB, el modelo cabe holgadamente en GPUs consumer y puede desplegarse en estaciones de trabajo o servidores de gama media sin aceleradores de datacenter.
- Benchmarking y validacion de backends de inferencia: el repositorio publica comparativas de tiempo, memoria pico y arranque entre codigo original, `portable` y `kernels`, lo que lo convierte en una referencia util para evaluar el rendimiento de nuevas implementaciones de kernels CUDA sobre una arquitectura CNN conocida.
- Filtrado previo en sistemas de vision documental o industrial: cuando el dominio de entrada se solapa con clases de ImageNet (por ejemplo, distinguir tipos de vehiculos o animales en camaras de vigilancia), el modelo puede actuar como primer filtro de bajo coste antes de modelos mas pesados.
- Investigacion en eficiencia de inferencia: la diferencia de 6,0x entre `portable` y `kernels` y la reduccion de tiempo de primera llamada de 0,09 s a 0,01 s permiten estudiar el impacto de kernels especializados en cargas de clasificacion de imagen.

## Benchmarks y rendimiento

Rendimiento de inferencia sintetica a 224x224 sobre RTX 5060 Ti 16 GB (sm_120), segun la model card:

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Speed-up kernels vs original | Speed-up kernels vs portable | Memoria pico asignada/reservada original (MiB) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|---|
| `densenet121.tv_in1k` | 10,73 | 13,61 | 9,41 | 1,57 | 6,8x | 6,0x | 80 / 102 | 53 / 90 | 83 / 152 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Portable (s) | Kernels (s) | Primera llamada original (s) | Portable (s) | Kernels (s) |
|---|---|---|---|---|---|---|
| `densenet121.tv_in1k` | 1,22 | 0,41 | 0,51 | 0,56 | 0,09 | 0,01 |

Rendimiento y memoria a tamano fijo:

| Modelo | Modo | 224x224 (ms / MiB asignada / MiB reservada) |
|---|---|---|
| `densenet121.tv_in1k` | portable | 9,5 ms / 53 / 84 |
| `densenet121.tv_in1k` | kernels | 1,6 ms / 86 / 168 |

Paridad con el codigo original: CPU fp32, diferencia maxima absoluta <= 0,002; GPU fp16 (portable y kernels), diferencia media <= 0,02 px y p99 <= 0,08 px. No se han publicado resultados de benchmarks de precision (top-1/top-5 en ImageNet) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1 GiB de memoria pico asignada en fp16 (80-86 MiB segun backend) y 102-168 MiB reservados por el allocator de PyTorch para `densenet121.tv_in1k` a 224x224.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y driver reciente; el backend `kernels` requiere un kernel precompilado para la arquitectura concreta (probado en sm_120, RTX 5060 Ti 16 GB). El backend `portable` funciona en cualquier GPU CUDA o en CPU.
- Cabe en GPU consumer: si, con margen amplio; probado en RTX 5060 Ti 16 GB, y por el consumo de memoria (menos de 0,2 GiB reservados) cabria en GPUs consumer de gama baja con suficiente soporte CUDA.
- Opciones de despliegue: libreria `fastforks` (`pip install fastforks`) con `classification.load(...)`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un clasificador de imagen de este tipo.
- Latencia y throughput: 9,5 ms por imagen en `portable` y 1,6 ms por imagen en `kernels` (224x224, RTX 5060 Ti); la primera llamada tarda 0,09 s en `portable` y 0,01 s en `kernels`. La carga del modelo tarda 0,41 s en `portable` y 0,51 s en `kernels` (descarga de kernel aparte en el primer uso).
- El backend `kernels` exige descargar el kernel desde `fastforks/kernels` en el primer uso y un driver NVIDIA reciente; si no hay kernel para la GPU, lanza `BackendUnavailableError` sin fallback silencioso.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `fastforks/densenet` (`densenet121.tv_in1k`) | no disponible en la informacion proporcionada | 224x224 fija | no aplica | Codigo BSD-3-Clause; pesos sin licencia declarada | `.pth` (descarga externa) | HuggingFace (model card), `pip install fastforks` |
| DenseNet-121 original (PyTorch Vision) | no disponible en la informacion proporcionada | 224x224 fija | no aplica | BSD-3-Clause (codigo) | `.pth` | `download.pytorch.org`, `torchvision` |
| Otras CNN de clasificacion (ResNet, EfficientNet, etc.) | no disponible en la informacion proporcionada | variable | no aplica | variable | variable | no disponible |

La informacion proporcionada no incluye datos de precision ni de rendimiento de modelos alternativos, por lo que no es posible establecer una comparativa cuantitativa con ResNet, EfficientNet u otras CNN de la misma categoria.

## Limitaciones y advertencias

- El repositorio no aloja pesos: depende de la disponibilidad de `download.pytorch.org` y de `fastforks/kernels` para el backend acelerado; una caida o cambio de esos recursos rompe la carga.
- La licencia de los pesos no esta declarada por los autores (`bsd-3-clause-code-weights-unstated`); la model card asume BSD-3-Clause a partir del codigo, pero no hay confirmacion explicita. Verificar antes de cualquier uso comercial.
- El modelo solo clasifica en las 1.000 clases de ImageNet-1k; cualquier imagen fuera de ese vocabulario se asignara a la clase mas cercana, con riesgo alto de error semantico.
- Entrada fija de 224x224: no admite resoluciones variables ni otras modalidades; el redimensionado y recorte central son obligatorios.
- No es un modelo generativo: no produce texto, no razona, no soporta tool calling ni agentes, y no tiene capacidades multilingues.
- El backend `kernels` solo funciona en GPUs NVIDIA con kernel precompilado y driver reciente; en otras configuraciones hay que usar `portable`, con menor rendimiento (9,5 ms frente a 1,6 ms).
- Las cifras de rendimiento se han medido en una unica GPU (RTX 5060 Ti 16 GB, sm_120) y con datos sinteticos; el rendimiento real puede variar con el hardware, el driver y el tipo de imagen.
- No se han publicado metricas de precision (top-1/top-5) en la informacion disponible, por lo que no se puede evaluar la calidad del clasificador a partir de esta ficha.
- Riesgo de sesgo heredado de ImageNet-1k: el vocabulario de clases y la distribucion de entrenamiento original pueden producir sesgos en categorias subrepresentadas o ambiguas.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/fastforks/densenet
- Repositorio de codigo `fastforks`: https://github.com/kleinicke/fastforks
- Kernels CUDA del backend `kernels`: https://huggingface.co/fastforks/kernels
- Documentacion de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- `card.toml` con hashes SHA-256 completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/densenet/card.toml
- Codigo original (PyTorch Vision, commit `1f1a920d685d`): https://github.com/pytorch/vision
- Licencia del codigo original: https://github.com/pytorch/vision/blob/1f1a920d685d46dfbe187934b785b7ecb7a182f2/LICENSE
- Pesos `densenet121-a639ec97.pth`: https://download.pytorch.org/models/densenet121-a639ec97.pth
- Paper original de DenseNet (Huang et al. 2016): no disponible en la informacion proporcionada
