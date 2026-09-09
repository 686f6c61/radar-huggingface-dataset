# EmreAkgul/omniASR-CTC-300M-v2-ONNX

## Resumen
El modelo `EmreAkgul/omniASR-CTC-300M-v2-ONNX` es una exportacion en formato ONNX del checkpoint `omniASR_CTC_300M_v2` de Meta, perteneciente a la linea de investigacion Omnilingual ASR. El objetivo es facilitar la ejecucion del modelo sin depender del stack de PyTorch de Meta, permitiendo su uso con ONNX Runtime en entornos de produccion o en el edge. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en CTC, con 300 millones de parametros (nominales) y una salida de 10288 unidades, lo que lo hace adecuado para transcripcion de audio en multiples idiomas. La conversion fue realizada por EmreAkgul y se distribuye bajo licencia Apache-2.0, sin modificacion de los pesos originales. Su relevancia radica en que combina la calidad de un modelo ASR multilingue de Meta con la portabilidad de ONNX, ideal para despliegues con librerias ligeras como `fast-omniasr`.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Modelo CTC para reconocimiento automatico del habla (ASR) |
| Parametros totales | 300M (nominal, segun el nombre del modelo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (acepta audio de longitud variable via dynamic shape) |
| Tipos de cuantizacion | no disponible (export ONNX sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo se presenta como omnilingue, sin listado concreto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, ~1.3 GB) y tokenizer SentencePiece (`tokenizer.model`) |

## Arquitectura y entrenamiento
La arquitectura es la del modelo original de Meta, `omniASR_CTC_300M_v2`, que emplea una cabecera CTC (Connectionist Temporal Classification) para la transcripcion de audio. No se han proporcionado detalles sobre la estructura interna (tipo de encoder, atencion, etc.) en la informacion disponible. El repositorio de Meta `facebookresearch/omnilingual-asr` menciona la existencia de variantes LLM-ASR para decodificacion de audio ilimitado, pero esta version concreta es un modelo CTC estandar y no una variante LLM. Los datos de entrenamiento (num. de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles. La conversion a ONNX se realizo con `torch.onnx.export` (opset 18, `dynamo=False`) partiendo de un checkpoint de fairseq2, sin modificar los pesos ni realizar entrenamiento adicional.

## Capacidades
- Transcripcion de audio a texto mediante CTC, con entrada de muestras de audio en formato float32 de longitud variable.
- Salida de logits de 10288 unidades, que se corresponden con las piezas del tokenizer SentencePiece original (`omniASR_tokenizer_written_v2`).
- Soporte de inferencia con ONNX Runtime, lo que permite desplegar el modelo en CPU o GPU sin necesidad de PyTorch ni del stack de Meta.
- Integracion directa con la libreria `fast-omniasr`, que permite cargar el modelo con `OmniASR.from_pretrained("EmreAkgul/omniASR-CTC-300M-v2-ONNX", backend="onnx")` y transcribir ficheros de audio con una unica llamada.
- Compatibilidad con dynamic shape: el modelo puede procesar segmentos de audio de diferente duracion sin redimensionar la entrada.
- Uso combinado con otras librerias ONNX para pipelines de postproceso (e.g. segmentacion de frases, diarizacion) en un mismo entorno de inferencia.

## Casos de uso
- Transcripcion de reuniones y llamadas de trabajo: el modelo puede procesar grabaciones de audio largas, gracias a su entrada de longitud variable y a la cabecera CTC, generando texto de forma secuencial. Es adecuado cuando se necesita una transcripcion rapida y ligera que no consuma muchos recursos.
- Subtitulado automatico de videos y contenido multimedia: la salida por frames permite mapear el audio a texto con una granularidad temporal util para generar subtitulos sincronizados. La licencia Apache-2.0 facilita su integracion en herramientas de edicion de video alojadas en empresas.
- Herramientas de accesibilidad para personas sordas o con discapacidad auditiva: puede usarse en aplicaciones de transcribcion en vivo, ejecutandose en el lado del usuario con ONNX Runtime en CPU, sin necesidad de conexion a servidores externos.
- Analisis de llamadas de atencion al cliente: el modelo es util para transcribir conversaciones de centros de contacto, y despues aplicar procesamiento de lenguaje natural para extraer topicos, sentimiento o cumplimiento de guiones. La ejecucion en ONNX facilita el despliegue interno de estos pipelines.
- Dictado por voz en aplicaciones moviles o de escritorio: el modelo de 300M es suficientemente ligero para ejecutarse en equipos con GPU modesta o incluso en CPU, y su formato ONNX permite integrarlo en aplicaciones escritas en Python o en runtimes que soporten ONNX.
- Investigacion en linguistica computacional y corpus multilingues: al ser un modelo omnilingue con tokenizer multilingue, sirve para transcribir corpus de audio en varios idiomas con el objetivo de entrenar modelos de lenguaje posteriormente. La conversion ONNX facilita la reproducibilidad de los experimentos sin cargar el stack de Meta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo tiene ~300M de parametros; en FP32 los pesos ocupan aproximadamente 1.2 GB. Con los tensores de entrada, salida y el runtime, se recomienda un minimo de 2 GB de memoria libre en la GPU para inferencia en precision completa. Si se aplicara cuantizacion INT8, la memoria de pesos podria reducirse a ~0.3-0.5 GB, pero no hay una cuantizacion publicada en el repositorio.
- GPU recomendadas: cualquier GPU con soporte para CUDA y ONNX Runtime, como RTX 3060 o superior, o una Tesla T4 en el caso de despliegue en la nube. En CPU, el modelo puede ejecutarse con ~4 GB de RAM y un procesador moderno, aunque la latencia sera mayor.
- Despliegue: gracias al formato ONNX, el modelo se puede servir con ONNX Runtime (CPU o GPU), integrarse en contenedores Docker o ejecutarse en el edge. La libreria `fast-omniasr` ya gestiona la carga y validacion de archivos.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones experimentales en la documentacion del repositorio.

## Comparativa con modelos similares
| Parametro | omniASR-CTC-300M-v2-ONNX (este repo) | facebook/omniASR-CTC-300M (checkpoint original de Meta) | omniASR_LLM_Unlimited_300M_v2 (variante LLM del repo Meta) |
|---|---|---|---|
| Arquitectura | CTC ASR | CTC ASR (el mismo checkpoint, en formato PyTorch) | LLM-ASR con soporte para audio ilimitado |
| Formato de pesos | ONNX | PyTorch (checkpoint fairseq2) | no disponible |
| Parametros | 300M (nominal) | 300M | 300M (nominal, segun el repo) |
| Longitud de contexto | dynamic shape | no disponible | audio ilimitado |
| Idiomas | omnilingue (sin listado) | omnilingue | omnilingue |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| Disponibilidad | Descarga directa, listo para ejecutar | Descarga directa | no disponible |
| Benchmarks | no disponibles | no disponibles | no disponibles |

## Limitaciones y advertencias
- Este repositorio es una distribucion independiente y no esta afiliado a Meta. La redistribucion del modelo se realiza bajo Apache-2.0 con aviso de modificacion, pero el usuario debe verificar que cumple los terminos de la licencia original.
- La lista de idiomas soportados no esta especificada en la documentacion. El nombre "omnilingue" no garantiza un rendimiento uniforme en todos los idiomas, por lo que es necesario probar el modelo con los corpus especificos de cada caso de uso.
- No hay informacion sobre sesgos conocidos, riesgos de alucinacion o limitaciones de precision. En un modelo ASR, la alucinacion puede manifestarse como transcripcion de palabras que no estan presentes en el audio, especialmente con ruido de fondo o voces superpuestas.
- Al ser un modelo CTC, la salida no incluye timestamps a nivel de palabra de forma nativa. Si se necesitan marcas de tiempo precisas, habra que realizar postproceso sobre los frames.
- No se han publicado benchmarks, por lo que no es posible comparar su rendimiento con otros modelos ASR de forma objetiva.
- El formato ONNX puede introducir diferencias numericas menores respecto al modelo original en PyTorch, debido a la conversion (opset 18, `dynamo=False`). Estas diferencias podrian afectar a la precision en tareas muy sensibles.
- El archivo `model.onnx` ocupa ~1.3 GB y no se incluyen pesos externos. No se recomienda cargar el modelo completo en memoria en dispositivos con menos de 2 GB de RAM libre.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/EmreAkgul/omniASR-CTC-300M-v2-ONNX
- Libreria `fast-omniasr`: https://github.com/Emre-Akgul/fast-omniasr
- Repositorio oficial de Omnilingual ASR (Meta): https://github.com/facebookresearch/omnilingual-asr
- Modelo original en Hugging Face: https://huggingface.co/facebook/omniASR-CTC-300M
- Checkpoint original de Meta: https://dl.fbaipublicfiles.com/mms/omniASR-CTC-300M-v2.pt
