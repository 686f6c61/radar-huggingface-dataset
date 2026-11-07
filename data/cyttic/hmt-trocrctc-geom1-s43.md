# cyttic/hmt-trocrctc-geom1-s43

## Resumen

`cyttic/hmt-trocrctc-geom1-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) entrenado por el autor `cyttic` dentro de un estudio de aumento de datos denominado `htr-metrics-transfer`. El modelo emplea una arquitectura TrOCR con cabeza CTC (`trocrctc`) y se ha entrenado con la variante de aumento `geom1` y la semilla 43. Su funcionamiento es de tipo secuencia a secuencia sobre imagenes de lineas de texto manuscrito, con decodificacion voraz (*greedy*) y sin modelo de lenguaje externo.

El modelo forma parte de una familia de experimentos (variantes con semillas 42 y 43, y contrapartes con arquitectura `htrvt`) cuyo objetivo es medir como se transfieren las metricas entre distintos esquemas de aumento de datos y arquitecturas en tareas HTR. El idioma declarado es el hebreo (`he`), lo que lo situa en un nicho especifico: reconocimiento de escritura manuscrita en hebreo, un idioma con relativamente pocos recursos publicos para esta tarea.

Con 87.279.756 parametros (unos 87,3 M) y un tamano de repositorio de 0,3 GB en formato `safetensors`, es un modelo de escala moderada, adecuado para inferencia en GPU de consumo. La licencia MIT permite uso comercial y modificacion sin restricciones practicas. Su relevancia actual radica en que aporta un punto de referencia reproducible (con semilla y configuracion de aumento explicitas) para HTR en hebreo, un area donde la mayoria de los modelos publicos se centran en latin o ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabeza CTC (`trocrctc`), transformer encoder-decoder para vision-texto |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR (*Transformer-based Optical Character Recognition*), que combina un encoder de vision tipo ViT para procesar la imagen de la linea de texto con un decoder transformer autorregresivo. En esta variante concreta (`trocrctc`) la cabeza de salida es CTC (*Connectionist Temporal Classification*), lo que permite alinear secuencias de caracteres sin necesidad de una segmentacion explicita a nivel de caracter y facilita el entrenamiento sobre lineas completas. El modelo tiene 87,3 M de parametros, coherente con una configuracion compacta de TrOCR orientada a inferencia eficiente.

El entrenamiento se realizo sobre `cyttic/hhd-optionb-split`, excluyendo los escritores (`writers`) reservados para el conjunto de desarrollo, con el fin de evitar fuga de informacion entre escritores. La variante de aumento aplicada es `geom1` (transformaciones geometricas) y la semilla es 43, lo que forma parte de un estudio sistematico de transferencia de metricas. La evaluacion se hizo sobre el conjunto de test HHD Option-B con decodificacion voraz y sin modelo de lenguaje, obteniendo CER 0,0792 y WER 0,3452. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (poco probables en una tarea HTR).

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo sobre imagenes de lineas de texto.
- Transcripcion secuencia a secuencia mediante CTC, sin segmentacion previa por caracteres.
- Decodificacion voraz (*greedy*) integrada; el modelo esta pensado para funcionar sin modelo de lenguaje externo.
- Procesamiento de imagenes de lineas manuscritas con variabilidad geometrica, gracias al entrenamiento con aumento `geom1`.
- No se documentan capacidades de tool calling, function calling, agentes, vision general (mas alla de OCR) ni audio.
- Capacidad multilingue limitada al hebreo segun la model card.

## Casos de uso

- Digitalizacion de archivos manuscritos en hebreo: el modelo puede transcribir lineas de documentos historicos o administrativos escaneados, con un CER de 0,0792 sobre el conjunto de test HHD Option-B, lo que lo hace util para pipelines de preservacion digital con revision humana posterior.
- Procesamiento de formularios manuscritos: integrado en un pipeline de OCR, permite extraer texto de campos rellenados a mano en hebreo, aprovechando la robustez del aumento geometrico frente a rotaciones e inclinaciones leves.
- Indexacion y busqueda de corpus manuscritos: la transcripcion automatica permite generar indices de texto buscable sobre colecciones de imagenes, reduciendo el coste frente a la transcripcion manual.
- Investigacion en HTR: sirve como punto de referencia reproducible (semilla 43, aumento `geom1`) para comparar tecnicas de aumento de datos y de transferencia de metricas entre arquitecturas.
- Preprocesamiento para pipelines de NLP en hebreo: la salida del modelo puede alimentar modelos posteriores de analisis linguistico, traduccion o extraccion de entidades sobre documentos manuscritos.
- Evaluacion de modelos de vision para OCR: util para comparar el rendimiento de arquitecturas `trocrctc` frente a alternativas como `htrvt` en el mismo conjunto de datos y configuracion.
- Prototipado en GPU de consumo: con 87,3 M de parametros y pesos en safetensors, es viable para experimentos locales de transcripcion sin infraestructura de gran escala.

## Benchmarks y rendimiento

Los unicos datos disponibles en la informacion proporcionada son los de la model card, evaluados sobre el conjunto HHD Option-B con decodificacion voraz y sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER (Character Error Rate) | 0,0792 |
| WER (Word Error Rate) | 0,3452 |

Para contextualizar, la variante con semilla 42 (`cyttic/hmt-trocrctc-geom1-s42`) reporta CER 0,0773 y WER 0,3366, ligeramente mejor en ambas metricas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no aplican a un modelo de HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: con 87,3 M de parametros en precision completa (fp32) el modelo ocupa aproximadamente 0,35 GB; en fp16 unos 0,17 GB. La VRAM real dependera del tamano de las imagenes de entrada y del batch.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM es suficiente; se puede ejecutar en RTX 3060, RTX 4090, A100 o H100 sin problemas.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo con soporte para PyTorch, incluidas GTX 1060 o superiores.
- Opciones de despliegue: al ser un modelo de vision-texto con pesos safetensors, es adecuado para despliegue con PyTorch/Hugging Face Transformers, TorchServe o un servidor de inferencia personalizado. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (HHD Option-B) | WER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-geom1-s43 | 87,3 M | no disponible | 0,0792 | 0,3452 | MIT | Hugging Face |
| cyttic/hmt-trocrctc-geom1-s42 | no disponible | no disponible | 0,0773 | 0,3366 | MIT (presumible) | Hugging Face |
| cyttic/hmt-htrvt-geom1-s43 | 13,8 M | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a variantes de la misma familia de experimentos, ya que no se dispone de datos de modelos HTR externos en la informacion proporcionada. La variante `htrvt` tiene muchos menos parametros (13,8 M) pero no se han publicado sus metricas en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para hebreo; no se espera un rendimiento aceptable en otros idiomas.
- El WER de 0,3452 es relativamente alto, lo que indica que la transcripcion a nivel de palabra puede contener errores frecuentes; se recomienda revision humana en produccion.
- La evaluacion se realizo sin modelo de lenguaje; el rendimiento en produccion podria variar si se anade postprocesado linguistico.
- Riesgo de alucinacion en la transcripcion: como todo modelo generativo, puede producir caracteres o palabras no presentes en la imagen, especialmente con imagenes de baja calidad o fuera de dominio.
- Sesgos potenciales derivados de los escritores y el dominio del conjunto `hhd-optionb-split`; el rendimiento puede degradarse con estilos de escritura, caligrafias o formatos de documento no representados.
- No se documentan limitaciones de contexto ni cuantizaciones probadas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios distintos al de entrenamiento.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-geom1-s43
- Variante con semilla 42: https://huggingface.co/cyttic/hmt-trocrctc-geom1-s42
- Variante con arquitectura htrvt: https://huggingface.co/cyttic/hmt-htrvt-geom1-s43
