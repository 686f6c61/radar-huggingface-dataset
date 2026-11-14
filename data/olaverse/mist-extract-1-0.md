# olaverse/MIST-Extract-1.0

## Resumen

MIST-Extract-1.0 es un modelo de extraccion de informacion estructurada desarrollado por olaverse. Toma como entrada una plantilla JSON y un documento (texto, imagen o ambos) y devuelve un JSON con la forma de la plantilla, acompanando cada campo de una confianza calibrada. El modelo esta afinado a partir de Qwen3.5-4B-Base mediante un fine-tune completo, con el codificador visual congelado, y cuenta con 4.539.265.536 parametros en precision bf16.

El modelo esta disenado especificamente para documentos cotidianos de empresas y usuarios africanos, en ingles y en mas de 20 lenguas africanas, incluyendo yoruba, igbo, hausa, suajili, amharico, somali, zulu, xhosa, kinyarwanda y otras. Cubre casos como confirmaciones de dinero movil, recibos de comercios y servicios, cartas de alquiler y escolares, y extraccion de nombres de personas, organizaciones y lugares.

Su relevancia actual radica en dos factores: por un lado, la extraccion sin OCR con confianza calibrada por campo permite automatizar el flujo y derivar solo los valores inciertos a revision humana; por otro, el rendimiento declarado en lenguas africanas supera ampliamente al de alternativas como NuExtract3, Qwen3.5-4B o GLiNER2.5-multi en la tarea MasakhaNER 2.0. La licencia Apache-2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), fine-tune completo con codificador visual congelado |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base; servido a 131.072 tokens |
| Tipos de cuantizacion | no disponible (el modelo se publica en bf16) |
| Idiomas soportados | en, fr, ar, pt, es, ru, zh, hi, id, tr, de, yo, ig, ha, pcm, sw, am, so, zu, xh, rw, lg, luo, ny, sn, tn, tw, wo, ee, fon, bm, mos, bbj |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base, un transformer multimodal de la familia Qwen3.5 con capacidad de entrada image-text-to-text. Sobre esa base se realizo un fine-tune completo, manteniendo congelado el codificador visual. El resultado es un checkpoint estandar `Qwen3_5ForConditionalGeneration`, compatible con transformers y con vLLM sin modificaciones. Las imagenes se escalan a aproximadamente 1,3 megapixeles antes de la codificacion visual.

La entrada combina una plantilla JSON que define la forma de la respuesta, el documento en texto y/o una imagen, y opcionalmente instrucciones libres para orientar formatos o definiciones. El modelo genera el JSON rellenado y, a partir de las probabilidades de token, calcula una confianza por campo. El autor declara una calibracion con error de 0,008 en campos de validacion, lo que significa que una confianza de 0,66 corresponde aproximadamente a un 66% de acierto. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Extraccion de informacion estructurada a partir de una plantilla JSON con tipos de hoja definidos: `verbatim-string`, `string`, `number`, `integer`, `date`, `date-time`, `boolean`, enumeraciones, listas y listas de objetos.
- Procesamiento de documentos en texto, imagen (foto o escaneo) o ambos de forma conjunta, sin pipeline OCR separado.
- Confianza calibrada por campo, con la misma forma que el JSON de salida, para enrutar valores inciertos a revision humana.
- Extraccion de entidades nombradas en 21 lenguas africanas (evaluada sobre MasakhaNER 2.0).
- Soporte de instrucciones adicionales para ajustar formatos o definiciones, por ejemplo importes en kobo.
- Procesamiento por lotes mediante `extract_batch`.
- Capacidades multilingues en 36 idiomas declarados, con enfasis en ingles y lenguas africanas.
- Compatibilidad con vLLM para inferencia offline por lotes y con la API de Olaverse (`POST /v1/extract`) sin GPU propia.
- Soporte de plantillas compatibles con el formato de NuExtract, lo que permite reutilizar plantillas existentes.

## Casos de uso

- Confirmaciones de dinero movil y banca: extraccion de importe, remitente, destinatario, fecha y referencia desde SMS, alertas y extractos, con confianza por campo para derivar operaciones dudosas a revision manual.
- Digitalizacion de recibos y facturas de comercios y mercados: conversion de fotos o capturas de recibos en naira, cedis, chelines o rand a JSON estructurado con lineas de articulo, cantidades y precios.
- Tramitacion de cartas y formularios: extraccion de datos de cartas de alquiler, comunicaciones escolares, avisos, identificaciones y reclamaciones, usando el tipo `verbatim-string` para preservar valores literales.
- Extraccion de nombres en lenguas africanas: identificacion de personas, organizaciones, lugares y fechas en documentos multilingues, aprovechando el rendimiento declarado en MasakhaNER 2.0.
- Automatizacion de back office con revision selectiva: uso de la confianza calibrada para procesar automaticamente los campos con alta certeza y enviar solo los de baja confianza a un operador.
- Procesamiento por lotes de archivos historicos: ejecucion con vLLM sobre grandes volumenes de documentos en texto o imagen, con decodificacion greedy y contexto de hasta 131.072 tokens.
- Integracion en flujos de agentes o pipelines: consumo del endpoint `POST /v1/extract` o del `Extractor` local para incorporar la extraccion como paso previo a sistemas de contabilidad, CRM o gestion de reclamaciones.

## Benchmarks y rendimiento

| Benchmark / conjunto | Metrica | MIST-Extract-1.0 | NuExtract3 | Qwen3.5-4B | GLiNER2.5-multi |
|---|---|---|---|---|---|
| Documentos en ingles retenidos (486 documentos) | Documentos completamente correctos | 91,8% | 67,9% | no disponible | no disponible |
| Conjunto retenido general | Precision | 0,941 | 0,922 | no disponible | no disponible |
| MasakhaNER 2.0 (21 lenguas africanas) | Precision de campo | 0,728 | 0,393 | 0,432 | 0,452 |
| Rendimiento de extraccion | Documentos por segundo | 6,0 | 5,6 | no disponible | no disponible |
| Calibracion de confianza | Error de calibracion en campos retenidos | 0,008 | no disponible | no disponible | no disponible |

Los datos proceden de la model card del autor. No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo para pesos, mas memoria para activaciones, cache KV y el codificador visual; en la practica se recomienda al menos 16-24 GB para contextos moderados.
- GPU recomendadas: A100, H100 o L40S para despliegues de produccion con lotes y contexto largo; RTX 4090 o RTX A6000 para inferencia en bf16 con margen.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en bf16 (RTX 4080, 4090, A6000); en tarjetas de 8-12 GB seria necesario recurrir a cuantizacion, aunque el autor no publica variantes cuantizadas.
- Opciones de despliegue: transformers (clase `Extractor` incluida en el repositorio), vLLM como checkpoint estandar `Qwen3_5ForConditionalGeneration`, y API gestionada de Olaverse (`POST /v1/extract`) sin GPU propia.
- Latencia y throughput: el autor declara 6,0 documentos por segundo frente a 5,6 de NuExtract3; no se especifican las condiciones de hardware de esa medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Rendimiento destacado |
|---|---|---|---|---|---|
| MIST-Extract-1.0 | 4,54B | 131.072 tokens servidos (262.144 en base) | Extraccion estructurada multilingue con confianza | Apache-2.0 | 91,8% documentos correctos en ingles; 0,728 en MasakhaNER 2.0 |
| NuExtract3 | 4B (misma base Qwen3.5-4B) | no disponible | Extraccion estructurada general | no disponible | 67,9% documentos correctos en ingles; 0,393 en MasakhaNER 2.0 |
| Qwen3.5-4B | 4B | 262.144 tokens | Modelo general multimodal | Apache-2.0 | 0,432 en MasakhaNER 2.0 |
| GLiNER2.5-multi | no disponible | no disponible | Extraccion de entidades multilingue | no disponible | 0,452 en MasakhaNER 2.0 |
| MIST-Extract-Flash-1.0 | 2B | no disponible | Version reducida del mismo modelo | no disponible | 1,6 veces mas rapido que MIST-Extract-1.0 |

## Limitaciones y advertencias

- El modelo esta optimizado para documentos africanos en ingles y lenguas africanas; para facturas occidentales generales, PDF de varias paginas y recibos extranjeros el propio autor recomienda un extractor de proposito general como NuExtract3.
- Riesgo de alucinacion: aunque la confianza calibrada ayuda a detectarlo, los campos con confianza baja deben validarse; no se documentan tasas de error por tipo de documento.
- La calibracion declarada (error 0,008) corresponde a campos retenidos del autor; puede degradarse en dominios o idiomas no representados en su conjunto de validacion.
- No se detallan los datos de entrenamiento ni los sesgos conocidos; al derivar de Qwen3.5-4B-Base hereda los sesgos del modelo base.
- El contexto servido es de 131.072 tokens, la mitad de la ventana del modelo base; los documentos muy largos deben dividirse.
- Las imagenes se reescalan a unos 1,3 megapixeles, lo que puede perder detalle en documentos densos o de baja calidad.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre exactitud en produccion; se recomienda validacion propia antes de desplegar.
- La confianza por campo requiere acceso a probabilidades de token; en vLLM puro no se obtiene directamente y es necesario usar el `Extractor` incluido o replicar el calculo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olaverse/MIST-Extract-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Version reducida: https://huggingface.co/olaverse/MIST-Extract-Flash-1.0
- NuExtract3 (comparativa): https://huggingface.co/numind/NuExtract3
- Consola de desarrollador de Olaverse: https://console.olaverselab.com
- Documentacion de la API de extraccion: https://docs.olaverselab.com/api/extraction/
