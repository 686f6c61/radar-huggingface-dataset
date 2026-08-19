# Jeethu/North-Micro-Vision-Instruct-PARO

## Resumen

Jeethu/North-Micro-Vision-Instruct-PARO es una cuantización INT4 del modelo multimodal CohereLabs/North-Micro-Vision-Instruct, realizada con la técnica ParoQuant (Pairwise Rotation Quantization). Con 1.270.818.032 parámetros (aproximadamente 1,27 mil millones), este checkpoint reduce el tamaño del modelo original a unos 2,9 GB manteniendo una precisión cercana a la versión BF16 de origen. Está diseñado para tareas de visión y lenguaje, como respuesta a preguntas visuales, OCR y descripción de imágenes, con soporte multilingüe en 11 idiomas.

La relevancia de este modelo radica en su eficiencia: al cuantizar las proyecciones del lenguaje a INT4 con grupo de tamaño 128 y retener el encoder de visión en FP16, consigue un equilibrio entre rendimiento y uso de memoria. Según las evaluaciones publicadas, la pérdida de precisión respecto al checkpoint BF16 original es mínima (por ejemplo, 0,20 puntos porcentuales en MMStar y 0,22 de aumento en perplexity de WikiText-2). Esto lo convierte en una opción atractiva para despliegues en entornos con recursos limitados, como GPUs de consumo o dispositivos edge, sin sacrificar la calidad de las tareas multimodales.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su formato safetensors y compatibilidad con librerías como Transformers, vLLM y MLX facilitan su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: CohereLabs/North-Micro-Vision-Instruct) |
| Parametros totales | 1.270.818.032 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (ParoQuant, grupo 128, krot=8) con tensores retenidos en FP16 (incluido el encoder de vision) |
| Idiomas soportados | en, de, fr, es, it, pt, hi, ja, ko, zh, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este checkpoint no es un modelo entrenado desde cero, sino una cuantización del modelo base CohereLabs/North-Micro-Vision-Instruct. La técnica utilizada, ParoQuant (Pairwise Rotation Quantization), es un método de cuantización INT4 para LLMs que busca cerrar la brecha de precisión con FP16 manteniendo velocidades cercanas a AWQ. En este caso, las proyecciones del lenguaje se cuantizan a INT4 con grupo de tamaño 128 y krot=8, mientras que el encoder de visión y otros tensores se conservan en FP16.

No se dispone de información detallada sobre la arquitectura interna del modelo base (número de capas, tipo de atención, etc.) ni sobre su proceso de entrenamiento (datos, número de tokens, técnicas de alineación). La model card solo indica que es un modelo multimodal con soporte de resolución nativa (native-resolution) y que ha sido cuantizado posteriormente.

## Capacidades

- Procesamiento de imagenes y texto: entrada multimodal (image-text-to-text), capaz de generar respuestas textuales a partir de imagenes.
- Conversacion multilingue: soporta 11 idiomas (ingles, aleman, frances, español, italiano, portugues, hindi, japones, coreano, chino y arabe).
- Resolucion nativa: procesa imagenes a su resolucion original sin redimensionamiento forzado, lo que mejora la precision en tareas de OCR y deteccion de detalles finos.
- Inferencia eficiente: al estar cuantizado a 4-bit, permite ejecucion en hardware con recursos limitados.
- Compatibilidad con multiples backends: funciona con Transformers, vLLM y MLX (Apple Silicon).
- Capacidades de razonamiento visual: segun las evaluaciones, mantiene un rendimiento solido en benchmarks como ChartQA y MMStar.

## Casos de uso

- Descripcion automatica de imagenes: el modelo puede generar descripciones textuales de fotografias o ilustraciones, util para aplicaciones de accesibilidad o catalogacion de contenido.
- Respuesta a preguntas visuales (VQA): integrable en asistentes que necesitan responder consultas sobre el contenido de una imagen, como "¿que color tiene el coche?" o "¿cuantos objetos hay en la mesa?".
- Extraccion de texto de imagenes (OCR): gracias a su soporte de resolucion nativa, puede transcribir texto presente en capturas, documentos escaneados o senales.
- Chatbot multimodal en dispositivos edge: su tamano reducido (2,9 GB) permite desplegarlo en GPUs de consumo (por ejemplo, RTX 3060 con 6 GB) o en Apple Silicon mediante MLX, habilitando asistentes conversacionales que entienden imagenes sin depender de la nube.
- Analisis de graficos y tablas: con un rendimiento de 81% en ChartQA, puede interpretar graficos simples y responder preguntas sobre tendencias o valores.
- Moderacion de contenido visual: clasificacion de imagenes para detectar contenido inapropiado o sensible, combinando vision y lenguaje.

## Benchmarks y rendimiento

Las evaluaciones se realizaron el 2026-08-14 con decodificacion greedy determinista. El checkpoint fuente se evaluo en BF16 nativo; el ParoQuant usa proyecciones INT4 (grupo 128, krot=8) con tensores FP16 retenidos, incluido el encoder de vision. Se comparo con el checkpoint MLX affine 4-bit (grupo 64, BF16 retenido).

### Vision

| Benchmark | Muestras | Source BF16 | ParoQuant INT4 / FP16 | MLX affine 4-bit / BF16 |
| --- | ---: | ---: | ---: | ---: |
| ChartQA (relaxed accuracy) | 100 | 81,00% | 81,00% | 81,00% |
| MMStar (accuracy) | 1.500 | 50,53% | 50,33% | 51,07% |

### Texto

| Benchmark | Muestras / tokens | Source BF16 | ParoQuant INT4 / FP16 | MLX affine 4-bit / BF16 |
| --- | ---: | ---: | ---: | ---: |
| WikiText-2 (perplexity, menor es mejor) | 32.704 tokens | 30,882 | **31,106** | 33,506 |
| ARC-Challenge (accuracy) | 1.172 | 73,21% | **70,56%** | 69,88% |
| HellaSwag (accuracy) | 2.000 | 49,50% | 48,20% | 49,00% |

Los intervalos de confianza (bootstrap pareado, 95%) indican que las diferencias con el source BF16 no son estadisticamente significativas en la mayoria de los casos, salvo en ARC-Challenge donde la caida es de -2,65 puntos porcentuales (IC: -4,18 a -1,11).

## Requisitos de hardware

- VRAM estimada: al tener 1.270.818.032 parametros cuantizados a 4-bit, los pesos ocupan aproximadamente 635 MB. Con overhead de activaciones y tensores FP16 (encoder de vision), se estima que cabe en GPUs con al menos 2 GB de VRAM, aunque se recomiendan 4 GB para mayor margen.
- GPUs compatibles: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060). Tambien compatible con Apple Silicon via MLX.
- Opciones de despliegue: vLLM, Transformers, MLX, llama.cpp (si se convierte a GGUF, aunque no se proporciona en este repo).
- Latencia y throughput: no se han publicado datos especificos. Dado su tamano, se espera una latencia baja en GPUs modernas, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | ChartQA | MMStar | WikiText-2 PPL | Licencia |
| --- | ---: | --- | --- | ---: | ---: | ---: | --- |
| Jeethu/North-Micro-Vision-Instruct-PARO | 1,27B | INT4 (ParoQuant) | no disponible | 81,00% | 50,33% | 31,106 | Apache 2.0 |
| CohereLabs/North-Micro-Vision-Instruct (BF16) | 1,27B | BF16 | no disponible | 81,00% | 50,53% | 30,882 | Apache 2.0 |
| mlx-community/North-Micro-Vision-Instruct-4bit | 1,27B | INT4 affine (MLX) | no disponible | 81,00% | 51,07% | 33,506 | Apache 2.0 |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de otros modelos multimodales de tamano similar para una comparacion mas amplia.

## Limitaciones y advertencias

- Perdida de precision: aunque minima, la cuantizacion INT4 introduce una degradacion en tareas como ARC-Challenge (-2,65 puntos porcentuales) y HellaSwag (-1,30 puntos). En aplicaciones criticas, se recomienda validar el rendimiento con datos propios.
- Sesgos del modelo base: al ser una cuantizacion de un modelo existente, hereda cualquier sesgo o alucinacion del modelo original. No se ha realizado un analisis especifico de sesgos en este checkpoint.
- Longitud de contexto no documentada: no se especifica el tamano de la ventana de contexto, lo que limita su uso en tareas que requieren secuencias largas.
- Soporte de herramientas: no se menciona capacidad de tool calling o function calling en la documentacion disponible.
- Rendimiento en idiomas: aunque soporta 11 idiomas, no hay datos de evaluacion desglosados por idioma; el rendimiento puede variar significativamente.
- Compatibilidad: el formato safetensors requiere convertirlo a GGUF si se desea usar con llama.cpp, proceso no documentado en este repo.

## Enlaces

- [HuggingFace - Jeethu/North-Micro-Vision-Instruct-PARO](https://huggingface.co/Jeethu/North-Micro-Vision-Instruct-PARO)
- [Paper arXiv 2511.10645](https://arxiv.org/abs/2511.10645)
- [Blog ParoQuant](https://paroquant.z-lab.ai)
- [Coleccion de modelos ParoQuant](https://huggingface.co/collections/z-lab/paroquant)
- [PyPI - paroquant](https://pypi.org/project/paroquant/)
- [Modelo base: CohereLabs/North-Micro-Vision-Instruct](https://huggingface.co/CohereLabs/North-Micro-Vision-Instruct)
