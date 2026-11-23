# moonbox-dev/BiRefNet_lite-TensorRT

## Resumen

BiRefNet_lite-TensorRT es una compilación en motores TensorRT del modelo BiRefNet_lite, una red de segmentación dicotómica de imágenes de alta resolución orientada a la eliminación de fondos (background removal). El trabajo lo publica moonbox-dev, que parte del modelo original de ZhengPeng7 (Universidad de Nankai y colaboradores) y lo convierte a motores TensorRT de precisión fp16, eliminando la dependencia de PyTorch en tiempo de inferencia. El modelo resuelve el problema de extraer una máscara alfa (matte) precisa de un objeto sobre fondo arbitrario, una tarea conocida como DIS (Dichotomous Image Segmentation).

La relevancia de esta versión concreta es de ingeniería: los motores están construidos con compatibilidad de hardware (Ampere y posteriores: RTX 30, 40 y 50) y de versión (cualquier TensorRT 10.x desde 10.13), de modo que no requieren recompilación por GPU. Según los datos del autor, esto reduce el tiempo por imagen de 438 ms (ONNX fp32) a 198 ms y el pico de memoria de 6883 MiB a 1595 MiB en una RTX 3080 Laptop, manteniendo una fidelidad de IoU 0.9980 y MAE 0.0003 frente a la referencia fp32.

El modelo base emplea un backbone Swin-T y una arquitectura de referencia bilateral (Bilateral Reference) para la segmentación de alta resolución. El repositorio ocupa 0.2 GB y contiene únicamente el motor fp16, un runner mínimo en numpy con Polygraphy y un script de pipeline. No hay versión int8: el autor indica que el grafo ONNX int8 es weight-only y TensorRT requiere activaciones calibradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (Bilateral Reference) con backbone Swin-T, compilada a TensorRT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 1024 x 1024) |
| Tipos de cuantizacion | fp16 (solo fp16; sin int8) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | TensorRT engine (`model.engine`), con runner numpy y Polygraphy |

## Arquitectura y entrenamiento

El modelo base BiRefNet se describe en el paper arXiv:2401.03407 como una red de segmentación dicotómica de imágenes de alta resolución basada en referencias bilaterales. El backbone es Swin-T (variante lite), y la red produce una única salida: el matte con sigmoide aplicada. La entrada es un tensor `[1, 3, 1024, 1024]` en RGB normalizado con media y desviación estándar de ImageNet; la salida se reescala al tamaño original de la imagen mediante el script `cutout_trt.py`.

Esta versión concreta no reentrena el modelo: parte de la revisión `aa62cd87ea` de BiRefNet_lite y construye los motores con el builder de TensorRT a partir del grafo ONNX fp16 publicado por Moonbox. La red es *strongly typed*: cada tensor conserva la precisión que le asigna el grafo ONNX, de modo que el motor fp16 calcula lo mismo que la build ONNX fp16. Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Segmentación dicotómica de imágenes: genera un matte alfa de un objeto sobre fondo arbitrario.
- Eliminación de fondos (background removal) con salida de canal alfa listo para composición.
- Inferencia sin PyTorch: el runner usa únicamente TensorRT, Polygraphy y numpy.
- Compatibilidad de hardware Ampere y posteriores (RTX 30, 40 y 50 series) sin recompilación.
- Compatibilidad de versión con TensorRT 10.x desde 10.13 mediante el runtime lean.
- Entrada de alta resolución fija de 1024 x 1024 con reescalado automático de entrada y salida.
- No soporta tool calling, agentes, texto, visión general ni audio: es un modelo puramente de segmentación.

## Casos de uso

- Eliminación de fondos en producción para e-commerce: el motor procesa imágenes a 198 ms por foto en una RTX 3080 Laptop con 1595 MiB de pico, lo que permite lotes grandes de catálogo sin recompilar por GPU.
- Generación de recortes para diseño gráfico: el script `cutout_trt.py` devuelve un PNG con canal alfa al tamaño original, integrable en un pipeline de preimpresión.
- Automatización de retoque fotográfico: el matte de alta fidelidad (IoU 0.9980 frente a fp32) sirve como máscara base para sustitución de fondos en estudios.
- Procesamiento por lotes en servidores con GPUs heterogéneas: la compatibilidad Ampere+ y TensorRT 10.13+ evita construir un motor distinto por cada modelo de tarjeta.
- Integración en aplicaciones de escritorio o edge con GPU NVIDIA: el runner mínimo en numpy y Polygraphy reduce el peso de dependencias frente a una pila PyTorch completa.
- Extracción de máscaras para pipelines de visión por computador: el matte puede alimentar etapas posteriores de composición, segmentación o análisis de imagen.
- Prototipado rápido de herramientas de recorte: el ejemplo de la model card carga el motor, aplica el matte y guarda el PNG en pocas líneas.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos sobre los conjuntos de test de DIS5K (250 imágenes: DIS-TE1..4 y DIS-VD, 50 cada uno) en una RTX 3080 Laptop GPU. Los tiempos son medianas por imagen, incluyendo el reescalado a y desde 1024 x 1024.

| Modelo / build | vs fp32: IoU / MAE | DIS5K MAE / S-measure | ms por imagen | Pico de memoria GPU |
|---|---|---|---|---|
| ONNX fp32 (referencia) | - | 0.0171 / 0.939 | 438 | 6883 MiB |
| ONNX fp16 | 0.9981 / 0.0002 | 0.0171 / 0.939 | 372 | 5933 MiB |
| TensorRT `fp16/` | 0.9980 / 0.0003 | 0.0171 / 0.939 | 198 | 1595 MiB |

El criterio de aceptación declarado por el autor es MAE <= 0.005 e IoU >= 0.98 frente a fp32, que el motor TensorRT cumple con margen.

## Requisitos de hardware

- VRAM estimada para inferencia: 1595 MiB de pico en fp16 según la medición del autor.
- GPU recomendadas: NVIDIA Ampere o posterior (RTX 30, 40 y 50 series); el motor se construyó en una RTX 3080 Laptop.
- Cabe en GPUs de consumo: sí, en cualquier RTX 30/40/50 con al menos ~1.6 GB de VRAM libre.
- Opciones de despliegue: TensorRT 10.x (desde 10.13) con `tensorrt-cu12` y `tensorrt-lean-cu12`, más Polygraphy y numpy. No requiere PyTorch.
- Latencia y throughput: 198 ms por imagen en RTX 3080 Laptop (mediana, incluyendo reescalados); equivale a unas 5 imágenes por segundo en ese hardware.
- No hay motor int8 disponible, por lo que no se puede reducir más la huella sin recalibrar activaciones.

## Comparativa con modelos similares

| Modelo | Backbone | Formato | Precisión | Latencia (RTX 3080 Laptop) | Pico de memoria | Licencia |
|---|---|---|---|---|---|---|
| BiRefNet_lite-TensorRT (este) | Swin-T | TensorRT engine | fp16 | 198 ms | 1595 MiB | MIT |
| BiRefNet_lite ONNX fp16 | Swin-T | ONNX | fp16 | 372 ms | 5933 MiB | MIT |
| BiRefNet_lite ONNX fp32 | Swin-T | ONNX | fp32 | 438 ms | 6883 MiB | MIT |

No se dispone en la información proporcionada de comparativas con otros modelos de segmentación de fondos (por ejemplo, variantes de U2-Net o RMBG) ni de sus métricas en DIS5K, por lo que no se incluyen datos de terceros.

## Limitaciones y advertencias

- Solo fp16: no hay build int8, y el autor descarta esa vía porque el grafo ONNX int8 es weight-only mientras TensorRT exige activaciones calibradas.
- Entrada fija de 1024 x 1024: el motor no acepta resoluciones arbitrarias; el pipeline reescala entrada y salida.
- Dependencia de hardware: requiere GPU NVIDIA Ampere o posterior; no funciona en tarjetas anteriores ni en CPU.
- Dependencia de versión: exige TensorRT 10.x desde 10.13; versiones anteriores no son compatibles con el motor.
- La compatibilidad hardware/versión implica una pequeña pérdida de velocidad frente a un motor compilado para una GPU concreta.
- Es un modelo de segmentación, no de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Riesgo de matte impreciso en objetos con bordes ambiguos, transparencias o fondos de color similar al sujeto; los datos de DIS5K (MAE 0.0171) cuantifican el error medio frente a ground truth.
- Licencia MIT: permite uso comercial, pero los archivos son derivados del modelo original y heredan su licencia, que gobierna su uso.
- No se han documentado sesgos específicos del modelo en la información disponible; al ser un modelo de imagen, los sesgos dependerían del dataset de entrenamiento original, no detallado aquí.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/BiRefNet_lite-TensorRT
- Modelo base BiRefNet_lite: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Paper BiRefNet (arXiv:2401.03407): https://arxiv.org/abs/2401.03407
- Dataset DIS5K: https://github.com/xuebinqin/DIS
