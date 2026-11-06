# fastforks/resnet

## Resumen

`fastforks/resnet` es un contenedor de model cards para las variantes clásicas de ResNet (He et al., 2015) distribuidas por el proyecto fastforks. No aloja pesos propios: el repositorio actúa como índice que descarga los ficheros `.pth` originales desde `download.pytorch.org` y verifica su integridad mediante SHA-256. Incluye tres variantes: `resnet18.tv_in1k`, `resnet50.tv2_in1k` y `resnet152.tv2_in1k`, todas entrenadas sobre ImageNet-1k (ILSVRC 2012) y orientadas a clasificación de imágenes en 1.000 clases.

El interés de este paquete no reside en el modelo en sí, sino en la infraestructura que lo acompaña: fastforks proporciona dos backends de ejecución (`portable`, en PyTorch estándar, y `kernels`, con kernels CUDA propios) y publica mediciones de latencia y memoria sobre una RTX 5060 Ti. Según la model card, el backend `kernels` acelera la inferencia entre 3,5x y 5,9x respecto al código original en fp32, manteniendo una paridad numérica verificada frente a las salidas doradas del código de referencia.

Es relevante para quienes necesitan un baseline de clasificación de imágenes rápido, reproducible y con verificación criptográfica de pesos, especialmente en entornos donde la trazabilidad de los artefactos descargados importa. No es un modelo generativo ni multilingüe: es una CNN de visión pura con salida de logits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet (CNN con bloques residuales basic/bottleneck) |
| Parametros totales | no disponible (la model card no declara recuentos; las variantes estándar de torchvision son ~11,7M para resnet18, ~25,6M para resnet50 y ~60,2M para resnet152, pero no se confirma en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 224x224 píxeles) |
| Tipos de cuantizacion | no disponible (se menciona ejecución en fp16 y fp32; no se documentan cuantizaciones int8/int4) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Código BSD-3-Clause; pesos sin licencia declarada por los autores (`bsd-3-clause-code-weights-unstated`) |
| Formato de pesos | `.pth` (PyTorch), descargados desde `download.pytorch.org` y verificados por SHA-256 |

## Arquitectura y entrenamiento

ResNet es una red neuronal convolucional con conexiones residuales que permiten entrenar redes profundas sin degradación del gradiente. Las variantes incluidas emplean bloques básicos (`resnet18`) o cuellos de botella (`resnet50`, `resnet152`). La entrada es una única imagen RGB redimensionada y recortada a 224x224: para `tv2_in1k` el lado corto se redimensiona a 232 y se aplica recorte central; para `tv_in1k` el lado corto se redimensiona a 256 antes del recorte. La salida son logits de 1.000 clases de ImageNet-1k.

El entrenamiento se realizó sobre ImageNet-1k (ILSVRC 2012), según declara la model card. No se especifican el número de tokens (no aplica), la composición exacta del dataset, ni si hubo ajuste fino con RLHF/DPO (no procede en un clasificador). La innovación técnica destacable no está en el modelo, sino en el paquete: el backend `kernels` implementa kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) que aceleran la inferencia, y se exige una verificación de paridad numérica frente al código original (CPU fp32: max |diff| <= 0,002; GPU fp16: mean |diff| <= 0,02 px, p99 <= 0,08 px).

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k, con salida de logits.
- Inferencia sobre una única imagen RGB a 224x224 (tamaño fijo, sin variación dinámica).
- Ejecución en dos backends: `portable` (PyTorch estándar, GPU o CPU) y `kernels` (kernels CUDA propios, requiere arquitectura de GPU precompilada).
- Selección automática de backend con `mode="auto"`, que elige `kernels` cuando puede ejecutarse y registra la decisión.
- Verificación de integridad de pesos mediante SHA-256 contra los hashes publicados en `card.toml`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Clasificación por lotes en pipelines de etiquetado de imágenes: el modelo procesa imágenes redimensionadas a 224x224 y devuelve top-k clases; con el backend `kernels` en una RTX 5060 Ti, `resnet50` tarda ~1,0 ms por imagen, lo que permite etiquetar grandes volúmenes con latencia predecible.
- Baseline reproducible en investigación de visión: al fijar los pesos por SHA-256 y verificar la paridad numérica contra el código original, sirve como referencia estable para comparar nuevas arquitecturas o técnicas de entrenamiento.
- Preprocesado en sistemas de moderación de contenido: la clasificación ImageNet-1k permite filtrar categorías de objetos antes de un modelo más costoso, reduciendo el cómputo aguas abajo.
- Extracción de características en pipelines de búsqueda visual: los logits o representaciones intermedias pueden alimentar índices de similitud o clasificadores secundarios.
- Validación de infraestructura de inferencia: las mediciones de memoria pico (por ejemplo, 188 MiB asignados para `resnet152` con `kernels`) y de tiempo de carga permiten dimensionar despliegues en GPUs de gama media.
- Docencia y pruebas de integración: el paquete instala con `pip install fastforks` y expone una API mínima (`classification.load(...)`, `result.top(5)`), lo que facilita ejemplos reproducibles en cursos y tests de CI.
- Despliegue en entornos con GPUs consumer: `resnet18` con `kernels` ocupa 91 MiB asignados y tarda 0,6 ms, por lo que cabe holgadamente en tarjetas de 8 GB o menos.

## Benchmarks y rendimiento

La model card no publica métricas de precisión (top-1/top-5) sobre ImageNet. Sí incluye mediciones de latencia y memoria sobre una RTX 5060 Ti 16 GB (sm_120), con entrada sintética de 224x224:

| Modelo | Tiempo original fp32 (ms) | Original fp16 (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico original (MiB) | Memoria pico portable (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|---|---|
| `resnet152.tv2_in1k` | 12,79 | 16,27 | 8,36 | 2,17 | 5,9x | 378 / 390 | 155 / 186 | 184 / 248 |
| `resnet18.tv_in1k` | 1,91 | 2,44 | 1,48 | 0,55 | 3,5x | 105 / 130 | 61 / 90 | 91 / 154 |
| `resnet50.tv2_in1k` | 4,74 | 5,84 | 3,15 | 0,99 | 4,8x | 180 / 192 | 89 / 142 | 118 / 204 |

Tiempos de carga y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `resnet152.tv2_in1k` | 2,34 | 0,43 | 0,49 | 0,24 | 0,02 | 0,00 |
| `resnet18.tv_in1k` | 0,27 | 0,07 | 0,08 | 0,00 | 0,00 | 0,00 |
| `resnet50.tv2_in1k` | 0,51 | 0,16 | 0,18 | 0,01 | 0,00 | 0,00 |

No se han publicado resultados de precisión (top-1/top-5) en la información disponible. Las cifras de latencia y memoria corresponden a un único hardware y protocolo documentado en el repositorio de benchmarks.

## Requisitos de hardware

- VRAM estimada: según las mediciones, `resnet18` requiere ~91 MiB asignados (154 MiB reservados) con `kernels`; `resnet50`, ~118 MiB (204 MiB reservados); `resnet152`, ~184 MiB (248 MiB reservados). Con el backend `portable` las cifras son menores en asignación (61, 89 y 155 MiB respectivamente).
- GPU recomendadas: cualquier GPU NVIDIA con arquitectura soportada por los kernels precompilados; las mediciones se realizaron en una RTX 5060 Ti 16 GB (sm_120). Para el backend `portable` basta con una GPU compatible con PyTorch o incluso CPU.
- Cabe en GPU consumer: sí, con amplio margen. Incluso `resnet152` con `kernels` ocupa menos de 250 MiB reservados.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`), con backends `portable` y `kernels`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un clasificador de imágenes).
- Latencia y throughput: con `kernels` en RTX 5060 Ti, `resnet18` ~0,55 ms/imagen, `resnet50` ~0,99 ms/imagen y `resnet152` ~2,17 ms/imagen. El backend `kernels` requiere un kernel precompilado para la arquitectura de GPU; si no existe, lanza `BackendUnavailableError` sin fallback silencioso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Latencia (224x224, referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fastforks/resnet` (resnet50) | no disponible en la card | 224x224 fijo | 0,99 ms (kernels, RTX 5060 Ti) | Código BSD-3-Clause; pesos sin declarar | Hugging Face (model card) + descarga desde pytorch.org |
| ResNet-50 original (torchvision) | ~25,6M (dato externo, no confirmado en la card) | 224x224 fijo | 4,74 ms fp32 / 5,84 ms fp16 (medido en la misma GPU) | BSD-3-Clause | torchvision / pytorch.org |
| Otras CNN de clasificación (p. ej. EfficientNet, ConvNeXt) | no disponible | 224x224 o variable | no disponible | variable | Hugging Face / torchvision |

La comparativa se limita al ecosistema ResNet porque la información proporcionada no incluye datos de modelos alternativos. No se dispone de métricas de precisión comparables en la documentación.

## Limitaciones y advertencias

- La model card no declara una licencia específica para los pesos: solo se asume BSD-3-Clause a partir del código. El campo de licencia es `bsd-3-clause-code-weights-unstated`, lo que introduce incertidumbre legal para uso comercial, pese a que la tabla de variantes indica "commercial use: yes" de forma condicional.
- El repositorio no aloja pesos: depende de `download.pytorch.org` y de la disponibilidad de los enlaces externos. Si esos ficheros cambian o desaparecen, la verificación SHA-256 fallará.
- La entrada es fija a 224x224; no admite resoluciones variables ni imágenes de mayor tamaño sin recorte.
- Es un clasificador de 1.000 clases de ImageNet-1k: no genera texto, no razona, no soporta tool calling ni agentes, y su vocabulario de salida está limitado a esas categorías.
- No se publican métricas de precisión (top-1/top-5) en la información disponible, por lo que no es posible evaluar su calidad predictiva a partir de la card.
- Los datos de latencia y memoria provienen de un único hardware (RTX 5060 Ti, sm_120); el rendimiento en otras GPUs puede diferir.
- El backend `kernels` requiere kernels precompilados para la arquitectura de GPU y un driver NVIDIA reciente; si no hay kernel disponible, falla explícitamente en lugar de degradar a `portable`.
- Riesgo de sesgo heredado de ImageNet-1k: las categorías y la distribución del dataset original pueden producir predicciones sesgadas en dominios no representados.
- No se documentan limitaciones idiomáticas porque el modelo no procesa texto.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/resnet
- Repositorio del código: https://github.com/kleinicke/fastforks
- Kernels: https://huggingface.co/fastforks/kernels
- Código original (torchvision, commit fijado): https://github.com/pytorch/vision/tree/1f1a920d685d
- Licencia del código original: https://github.com/pytorch/vision/blob/1f1a920d685d46dfbe187934b785b7ecb7a182f2/LICENSE
- Fichero `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/resnet/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos `resnet152`: https://download.pytorch.org/models/resnet152-f82ba261.pth
- Pesos `resnet18`: https://download.pytorch.org/models/resnet18-f37072fd.pth
- Pesos `resnet50`: https://download.pytorch.org/models/resnet50-11ad3fa6.pth
