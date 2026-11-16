# fastforks/marigold-v2

## Resumen

Marigold V2 es un modelo de estimacion de profundidad monoculo (mono-depth) desarrollado por el grupo huawei-bayerlab (Pavlovic, Wandel, Obukhov et al., 2026) y empaquetado para su uso practico por el proyecto fastforks. El modelo reutiliza el transformer de 20 000 millones de parametros de Qwen-Image-Edit-2509 (Alibaba, Apache-2.0), al que se le aplica una LoRA de rango 128 especifica para profundidad y un decodificador VAE de Qwen afinado. La inferencia consiste en un unico paso de flujo rectificado (rectified flow) que produce profundidad logaritmica afin-invariante a partir de una imagen RGB.

La relevancia de este modelo reside en su enfoque: en lugar de entrenar un backbone dedicado desde cero, adapta un modelo generativo de imagen de gran escala a una tarea de regresion densa mediante LoRA y un decodificador ajustado. El resultado es un modelo de profundidad relativa (no metrica) que compite en precision con modelos especializados, con pesos cuantizados a NF4 de 4 bits que ocupan aproximadamente 8,4 GB.

El repositorio de Hugging Face es unicamente una model card: no aloja pesos. El codigo de fastforks descarga los pesos del autor original, los verifica mediante SHA-256 y ofrece dos backends de ejecucion (`portable` y `kernels`). La licencia declarada es Apache-2.0, aunque la propia card advierte que es un paquete de uso de investigacion y que los terminos de los datos de entrenamiento no han sido verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (rectified flow, un paso) basado en Qwen-Image-Edit-2509, con LoRA de rango 128 y VAE decoder afinado |
| Parametros totales | 20 000 millones (transformer base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada: una imagen RGB de cualquier tamano H x W >= 1; redimensionada o rellenada internamente) |
| Tipos de cuantizacion | NF4 de 4 bits (pesos del transformer); ejecucion en fp16 y bfloat16 documentada; fp32 en CPU para paridad |
| Idiomas soportados | no disponible (tarea de vision; sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (codigo y pesos convertidos); aviso de uso de investigacion |
| Formato de pesos | safetensors (`marigold-v2-depth-log-stage2-nf4.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte del transformer de Qwen-Image-Edit-2509, un modelo generativo de imagen de 20 000 millones de parametros. Sobre el se entrena una LoRA de rango 128 especifica para profundidad y se afina el decodificador VAE de Qwen (variante `depth/Log-stage2`). La inferencia aplica un unico paso de rectified flow, lo que evita el coste de muestreo multi-paso tipico de los modelos de difusion. La salida es profundidad logaritmica afin-invariante (`affine_invariant_log`), es decir, profundidad relativa con escala y desplazamiento desconocidos, no metros.

El entrenamiento se realizo sobre datos sinteticos de profundidad, segun lo descrito en el paper Marigold V2 (arXiv 2609.08084). No se detalla en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a una tarea de regresion densa). Los pesos convertidos incluyen el transformer en NF4, la LoRA, constantes plegadas y un VAE 2D; el NOTICE conserva las atribuciones de los modelos originales y documenta los cambios.

## Capacidades

- Estimacion de profundidad monoculo a partir de una unica imagen RGB.
- Salida de mapa de profundidad o profundidad inversa; el campo `kind` indica el significado (aqui `affine_invariant_log`).
- Entrada de cualquier resolucion H x W >= 1, con redimensionado o relleno interno.
- Dos backends de ejecucion: `portable` (PyTorch) y `kernels` (kernels optimizados, con aceleracion de hasta 1,3x frente al backend portable).
- Ejecucion en fp16, bfloat16 (por defecto en GPU) y fp32 (CPU).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de vision.
- No tiene capacidades multilingues ni de generacion de texto.
- No produce normales de superficie (a diferencia de otras variantes del ecosistema fastforks).

## Casos de uso

- **Reconstruccion 3D y fotogrametria**: el mapa de profundidad relativa sirve como entrada para pipelines de reconstruccion densa (por ejemplo, integracion en nubes de puntos tras estimar la escala). El modelo maneja imagenes de alta resolucion (probado hasta 1988x2880), adecuado para fotogramas de video o fotografias.
- **Efectos de desenfoque de profundidad (bokeh sintetico)**: en postproduccion de imagen y video, el mapa de profundidad permite segmentar primer plano y fondo para aplicar desenfoque selectivo. La salida afin-invariante es suficiente para separar capas por orden relativo.
- **Generacion de mapas de disparidad para vision estereo**: como estimador monoculo, puede inicializar o validar metodos estereo en robots y vehiculos, reduciendo el coste de calibracion en escenarios donde solo hay una camara.
- **Realidad aumentada y sustitucion de fondo**: la profundidad relativa permite ocluir objetos virtuales por elementos reales en tiempo de ejecucion, con una sola pasada de inferencia (un paso de rectified flow) y latencias del orden de 3,9 a 5,1 segundos en una RTX 5060 Ti a 994x1482.
- **Preprocesado para modelos de imagen (ControlNet, inpainting)**: el mapa de profundidad se puede usar como condicionamiento en pipelines generativos que requieren estructura espacial, sin necesidad de sensores de profundidad.
- **Analisis de escenas en investigacion de vision**: evaluacion de metodos de profundidad relativa sobre NYUv2 e iBims-1, con resultados de AbsRel 0,0386 y 0,0291 respectivamente, utiles como linea base reproducible.
- **Prototipado en estaciones de trabajo con GPU de consumo**: gracias a la cuantizacion NF4 (8,4 GB de pesos) y al backend `kernels`, cabe en GPUs de 16 GB como la RTX 5060 Ti, lo que facilita experimentacion sin infraestructura de datacenter.

## Benchmarks y rendimiento

Precision en datasets publicos (AbsRel / delta1 tras ajuste de escala y desplazamiento por minimos cuadrados; media sobre imagenes):

| Variante | Dataset | portable | kernels |
|---|---|---|---|
| `marigold-v2-depth` | NYUv2 test | 0,0386 / 0,9840 | 0,0386 / 0,9840 |
| `marigold-v2-depth` | iBims-1 | 0,0291 / 0,9877 | 0,0291 / 0,9877 |

Rendimiento y memoria (RTX 5060 Ti 16 GB, sm_120; entrada 994x1482):

| Metrica | portable | kernels | original fp32 |
|---|---|---|---|
| Tiempo de inferencia | 5093 ms | 3886 ms | OOM |
| Memoria pico asignada / reservada | 1408 / 1698 MiB | 1498 / 1780 MiB | no disponible |
| Carga del modelo | 7,80 s | 6,20 s | no disponible |
| Primera llamada | 5,09 s | 3,89 s | no disponible |

Aceleracion del backend `kernels` frente a `portable`: 1,3x. `torch.compile` quedo diferido (compilacion > 5 min) y TensorRT fp16 esta planificado para la version 0.2.1. La paridad con el codigo original se verifica con max |diff| <= 0,02 en CPU fp32 y error medio <= 1 % (p99 <= 5 %) en GPU bfloat16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision (NYUv2 AbsRel) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Marigold V2 (este) | 20 000 M (NF4) | imagen H x W >= 1 | 0,0386 | Apache-2.0 | pesos via fastforks, card en HF |
| metric3d-vit-large | no disponible | imagen + intrinsics | no disponible | no disponible | ecosistema fastforks |
| da3metric-large | no disponible | imagen + intrinsics | no disponible | no disponible | ecosistema fastforks |
| unidepth-v2-vitl14 | no disponible | imagen (estima camara) | no disponible | no disponible | ecosistema fastforks |
| depth-pro | no disponible | imagen (estima camara) | no disponible | no disponible | ecosistema fastforks |

No se dispone de resultados de benchmarks de los modelos alternativos en la informacion proporcionada; la comparativa se limita a la disponibilidad y al tipo de entrada. Marigold V2 es el unico de la lista con pesos en NF4 y con metricas publicadas en esta card.

## Limitaciones y advertencias

- **Profundidad relativa, no metrica**: la salida es log-profundidad afin-invariante; no proporciona metros sin una etapa externa de calibracion de escala.
- **Sesgos**: no documentados en la informacion disponible; al entrenarse sobre datos sinteticos, puede generalizar peor en dominios visuales alejados de la distribucion de entrenamiento.
- **Alucinacion**: como modelo generativo adaptado, puede producir profundidades plausibles pero incorrectas en regiones ambiguas u ocluidas.
- **Licencia**: Apache-2.0 declarada, pero la card advierte que es un paquete de uso de investigacion y que los terminos de los datos de entrenamiento no han sido verificados; conviene revisar `LICENSE` y `NOTICE` antes de uso comercial.
- **Coste computacional**: 20 000 millones de parametros en 4 bits requieren 8,4 GB solo de pesos; el modelo original en fp32 produce OOM en una GPU de 16 GB a 994x1482.
- **Idiomas**: no aplica; no procesa texto.
- **Madurez**: tier experimental; `torch.compile` diferido y TensorRT aun no disponible.
- **Resolucion**: aunque acepta cualquier tamano, el rendimiento y la memoria crecen con la resolucion; el maximo probado es 1988x2880 con 12,8 GiB de pico asignado.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/marigold-v2
- Pesos del autor (NF4): https://huggingface.co/fastforks/marigold-v2-depth-nf4
- Repositorio de codigo fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Codigo original (huawei-bayerlab): https://github.com/huawei-bayerlab/marigold-v2
- Paper Marigold V2: arXiv 2609.08084
- Modelo base Qwen-Image-Edit-2509: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Documentacion de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Card del autor original: https://huggingface.co/huawei-bayerlab/marigold-v2/blob/main/README.md
