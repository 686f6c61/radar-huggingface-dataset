# fastforks/regnet

## Resumen

RegNet (fastforks) es un envoltorio de inferencia para la familia RegNetY, una arquitectura de red neuronal convolucional presentada originalmente por Radosavovic et al. en 2020 ("Designing Network Design Spaces"). Este repositorio concreto no aloja pesos propios: es una model card de una librería denominada `fastforks` que descarga los pesos oficiales del repositorio de `pytorch/vision` y los verifica mediante SHA-256. La variante incluida es `regnety_160.tv2_in1k`, entrenada sobre ImageNet-1k para clasificación de imágenes en 1.000 clases.

El modelo resuelve la tarea clásica de clasificación de imagen RGB única con salida de logits sobre ImageNet-1k. Su relevancia actual no reside en la arquitectura (de 2020) sino en la implementación: `fastforks` ofrece dos backends, `portable` (PyTorch estándar) y `kernels` (kernels CUDA propios: `cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`), con mejoras de velocidad notables respecto al código original.

Según la model card, en una RTX 5060 Ti de 16 GB el backend `kernels` alcanza 1,96 ms por imagen a 224x224 frente a 12,11 ms del código original en fp32, es decir, una aceleración de 6,2x. La entrada es fija a 224x224 (redimensionado del lado corto a 232 y recorte central).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RegNetY (CNN con etapas residuales, convoluciones de grupo y squeeze-excite) |
| Parametros totales | no disponible (variante `regnety_160`, sin recuento publicado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagen; entrada fija 224x224) |
| Tipos de cuantizacion | fp32 (original) y fp16 (portable y kernels); no se documentan otras |
| Idiomas soportados | no aplica (modelo de vision; sin capacidades linguisticas) |
| Licencia | Codigo BSD-3-Clause; licencia de pesos no declarada por los autores (`bsd-3-clause-code-weights-unstated`) |
| Formato de pesos | `.pth` (PyTorch, `regnet_y_16gf-3e4a00f9.pth`), descargado desde `download.pytorch.org` |

## Arquitectura y entrenamiento

RegNetY es una red convolucional pura (no transformer) que aplica una metodología de diseño de espacios de búsqueda: en lugar de definir bloques a mano, se parametriza la red con anchura, profundidad y factor de botella, y se buscan configuraciones óptimas bajo una regla de diseño simple. Cada etapa está formada por bloques residuales con convoluciones de grupo y módulos squeeze-excite, de ahí el sufijo "Y". La variante `regnety_160` corresponde al modelo de 16 GF (gigaflops) de la familia.

Los pesos incluidos son los publicados por el equipo de `pytorch/vision` en el commit `1f1a920d685d`, entrenados sobre ImageNet-1k (ILSVRC 2012, clasificación). No se documenta en la información disponible el número exacto de tokens de entrenamiento (no aplica), la composición del dataset más allá de ImageNet-1k, ni si hubo técnicas de ajuste fino adicionales. La innovación técnica destacable de este repositorio no está en el entrenamiento sino en la implementación: kernels CUDA propios que aceleran convoluciones y operaciones auxiliares, con verificación de paridad numérica frente al código original (máx. |diff| <= 0,002 en CPU fp32; media |diff| <= 0,02 px y p99 <= 0,08 px en GPU fp16).

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k, con salida de logits.
- Entrada de una única imagen RGB, fija a 224x224 (resize del lado corto a 232 y centre crop).
- API de alto nivel: `model("photo.jpg")` devuelve un resultado con `top(5)` para las cinco clases más probables y `backend` para inspeccionar modo, dispositivo y dtype.
- Dos backends: `portable` (PyTorch estándar, CPU o GPU) y `kernels` (kernels CUDA propios, requiere arquitectura de GPU precompilada).
- Fallo explícito: si el backend `kernels` no está disponible para la GPU, lanza `BackendUnavailableError` sin degradar silenciosamente.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de audio o de vídeo.

## Casos de uso

- Clasificación de imágenes en producción con requisitos de baja latencia: el backend `kernels` procesa una imagen 224x224 en 1,96 ms en una RTX 5060 Ti, lo que permite pipelines de etiquetado a más de 500 imágenes por segundo en una sola GPU de consumo.
- Preetiquetado de datasets de visión: usar el modelo para generar etiquetas ImageNet-1k preliminares sobre grandes volúmenes de imágenes antes de la revisión humana, aprovechando el bajo coste por inferencia.
- Moderación de contenido basada en categorías visuales: clasificar imágenes subidas por usuarios en las clases de ImageNet-1k para filtrar categorías sensibles antes de un modelo de visión más costoso.
- Filtrado y enrutado en pipelines multimodales: usar la predicción de clase como señal barata para decidir qué modelo o rama procesa después una imagen, reduciendo el coste total del sistema.
- Benchmarking de hardware y de compiladores: el repositorio publica tiempos y memoria pico por backend, lo que lo hace útil como carga de referencia para medir GPUs, drivers o versiones de PyTorch.
- Verificación de reproducibilidad en investigación: los pesos se validan contra SHA-256 y contra salidas doradas del código original, lo que permite usarlo como caso de prueba en proyectos que necesitan paridad numérica estricta.
- Prototipado rápido en portátiles: el backend `portable` funciona en CPU o GPU sin kernels precompilados, con 8,34 ms por imagen en la GPU de referencia, adecuado para demos y pruebas locales.

## Benchmarks y rendimiento

Datos publicados en la model card (RTX 5060 Ti 16 GB, sm_120, entrada sintética 224x224):

| Metrica | Original fp32 | Original | Portable | Kernels |
|---|---|---|---|---|
| Tiempo por imagen (ms) | 12,11 | 12,15 | 8,34 | 1,96 |
| Memoria pico asignada (MiB) | 512 | 512 | 208 | 228 |
| Memoria pico reservada (MiB) | 524 | 524 | 250 | 316 |
| Carga del modelo (s) | 3,07 | 3,07 | 1,08 | 0,94 |
| Primera llamada (s) | 0,48 | 0,48 | 0,04 | 0,00 |
| Aceleracion vs original | 1,0x | 1,0x | 1,5x | 6,2x |

No se han publicado resultados de benchmarks de precision (top-1/top-5 en ImageNet) en la informacion disponible. La unica metrica de exactitud reportada es la paridad con el codigo original: max |diff| <= 0,002 en CPU fp32 y media |diff| <= 0,02 px con p99 <= 0,08 px en GPU fp16.

## Requisitos de hardware

- VRAM estimada: unos 0,3 GiB de memoria pico asignada en fp16 para `regnety_160` a 224x224 (0,3 GiB reservada segun la model card).
- GPU recomendadas: cualquier GPU NVIDIA reciente para el backend `portable`; para el backend `kernels` se requiere una arquitectura con kernel precompilado disponible en `fastforks/kernels` y un driver NVIDIA reciente. La referencia medida es una RTX 5060 Ti 16 GB (sm_120).
- Cabe holgadamente en GPU de consumo: con ~0,3 GiB de pico, cualquier GPU con 4 GB o más es suficiente; el límite real es la disponibilidad de kernel precompilado, no la VRAM.
- Opciones de despliegue: la librería `fastforks` (instalable con `pip install fastforks`) con backends `portable` y `kernels`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de clasificación de imagen de este tipo.
- Latencia y throughput: 1,96 ms por imagen con `kernels` y 8,34 ms con `portable` en la GPU de referencia; la primera llamada es practicamente inmediata con `kernels` (0,00 s reportado) y de 0,04 s con `portable`.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Latencia medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RegNetY-16GF (fastforks) | no disponible | 224x224 fija | 1,96 ms (kernels) / 8,34 ms (portable) | Codigo BSD-3-Clause; pesos sin declarar | HuggingFace (model card) + pesos en pytorch.org |
| RegNetY-16GF (pytorch/vision original) | no disponible | 224x224 fija | 12,11 ms (fp32) | BSD-3-Clause | Repositorio pytorch/vision |
| Otras CNN de clasificacion ImageNet-1k (ResNet, EfficientNet, ConvNeXt) | no disponible | variable | no disponible | variable | no disponible |

La comparacion con alternativas de la misma categoria (otras CNN de clasificacion ImageNet-1k) no puede completarse con datos de la informacion proporcionada: no se incluyen parametros, contextos ni rendimientos de modelos comparables. La unica comparacion directa posible es contra el codigo original del mismo modelo, donde `fastforks` reporta una aceleracion de 6,2x con `kernels`.

## Limitaciones y advertencias

- La licencia de los pesos no está declarada por los autores; la model card asume BSD-3-Clause a partir del código. Antes de uso comercial conviene verificar la licencia de los pesos en el repositorio de origen.
- Es un modelo de clasificación cerrado a 1.000 clases de ImageNet-1k; no genera texto, no responde preguntas y no admite prompts.
- Entrada fija a 224x224: no soporta resoluciones arbitrarias ni imágenes de mayor tamaño sin recorte.
- No hay datos publicados de sesgos, tasas de error por clase ni comportamiento en dominios fuera de ImageNet; el riesgo de clasificación errónea en imágenes fuera de distribución es real y no está cuantificado.
- El backend `kernels` depende de kernels precompilados por arquitectura de GPU; en GPUs no cubiertas lanza `BackendUnavailableError` y no hay degradación automática (salvo `mode="auto"`, que registra la elección).
- El repositorio no aloja pesos: la inferencia depende de la descarga desde `download.pytorch.org`, lo que introduce un punto de fallo externo y requiere conectividad en el primer uso.
- La paridad numérica está garantizada frente a un commit concreto (`1f1a920d685d`); cambios en versiones de PyTorch o CUDA pueden alterar ligeramente los resultados.
- El paquete se describe como de uso en investigación; conviene revisar sus condiciones antes de integrarlo en producción.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/fastforks/regnet
- Repositorio de la libreria fastforks: https://github.com/kleinicke/fastforks
- Kernels precompilados: https://huggingface.co/fastforks/kernels
- Configuracion de variantes (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/regnet/card.toml
- Documentacion de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Codigo original (pytorch/vision, commit 1f1a920d685d): https://github.com/pytorch/vision
- Licencia del codigo original: https://github.com/pytorch/vision/blob/1f1a920d685d46dfbe187934b785b7ecb7a182f2/LICENSE
- Pesos oficiales: https://download.pytorch.org/models/regnet_y_16gf-3e4a00f9.pth
