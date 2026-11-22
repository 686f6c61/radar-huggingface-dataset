# SixStones233/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-onnx

## Resumen

Este repositorio es un espejo en Hugging Face del modelo Paraformer-large de reconocimiento automático del habla (ASR) en chino, publicado originalmente por el equipo de ModelScope (iic) y convertido a formato ONNX. Se trata de un modelo de reconocimiento de voz no autorregresivo (NAT) entrenado sobre audio en mandarín muestreado a 16 kHz, con un vocabulario de 8404 tokens. El autor del espejo, SixStones233, declara que los ficheros son idénticos byte a byte al repositorio de origen (mismo tamano y SHA-256), sin modificaciones.

La relevancia de este artefacto es practica: al estar empaquetado en ONNX, el modelo puede ejecutarse con el runtime de ONNX Runtime fuera del ecosistema Python de ModelScope, lo que facilita su integracion en servicios de transcripcion, pipelines de C++ o despliegues en entornos donde PyTorch no es viable. El repositorio ocupa aproximadamente 0,2 GB.

No obstante, conviene subrayar que se trata de un espejo y no de un desarrollo propio: toda la informacion tecnica, la licencia y los creditos corresponden a los autores originales de ModelScope. La model card del espejo es minima y no aporta detalles adicionales sobre arquitectura, datos de entrenamiento o evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paraformer (ASR no autorregresivo, NAT), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, ventana de inferencia no documentada en la informacion) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | chino (mandarin), segun el nombre del modelo (`zh-cn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Paraformer, un esquema de reconocimiento de voz no autorregresivo que predice la secuencia completa de tokens de forma paralela en lugar de token a token, lo que reduce la latencia de decodificacion frente a los modelos autorregresivos clasicos. El nombre del checkpoint indica que esta entrenado para audio en chino a 16 kHz con un vocabulario de 8404 unidades. La variante aqui publicada es la exportacion ONNX del checkpoint original de ModelScope.

No se dispone en la informacion proporcionada de datos sobre el numero de parametros, el volumen de horas de audio de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de refinamiento como RLHF o DPO (poco habituales en ASR). Tampoco se documentan innovaciones adicionales mas alla del propio esquema NAT de Paraformer. Para cualquier detalle de entrenamiento debe consultarse el repositorio de origen en ModelScope y la publicacion asociada a Paraformer.

## Capacidades

- Reconocimiento automatico del habla en chino mandarin sobre audio a 16 kHz.
- Decodificacion no autorregresiva, orientada a baja latencia en inferencia.
- Ejecucion mediante ONNX Runtime, lo que permite desplegar el modelo fuera de PyTorch.
- Transcripcion de audio de entrada en formato convencional para pipelines ASR (el preprocesado exacto no se documenta en la informacion disponible).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision ni audio mas alla de la transcripcion.
- No se documenta capacidad multilingue: el checkpoint esta etiquetado como `zh-cn`.

## Casos de uso

- Transcripcion de reuniones y actas en chino: el modelo convierte audio de reuniones grabadas a 16 kHz en texto, adecuado para equipos que operan en mandarin y necesitan generar resumenes posteriores con otro modelo de lenguaje.
- Subtitulado de video en mandarin: integrable en pipelines de postproduccion para generar subtitulos automaticos en chino antes de su traduccion.
- Atencion al cliente en centros de contacto chinos: transcripcion de llamadas para analitica, control de calidad y busqueda sobre el contenido de las conversaciones.
- Despliegue en entornos sin PyTorch: al ser ONNX, puede servirse con ONNX Runtime en servicios C++, Java o en contenedores ligeros, util en infraestructuras donde instalar el stack de ModelScope no es deseable.
- Investigacion en ASR: sirve como linea base reproducible para comparar tecnicas de decodificacion no autorregresiva o para experimentar con cuantizacion y optimizacion sobre ONNX.
- Procesamiento por lotes de archivos de audio: transcripcion masiva de archivos historicos en chino para construir indices de busqueda o corpus textuales.
- Integracion en aplicaciones de notas de voz: transcripcion local de grabaciones cortas en dispositivos con recursos moderados, dado el reducido tamano del repositorio (0,2 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 0,2 GB, por lo que la huella en memoria es reducida y probablemente inferior a 1-2 GB en FP32, aunque esta cifra no esta confirmada en la informacion proporcionada.
- GPU recomendadas: no documentadas. Por tamano, el modelo deberia ejecutarse en GPUs de gama consumer, pero no hay datos oficiales que lo confirmen.
- Cabida en GPU consumer: previsiblemente si, dado el tamano del artefacto, aunque no se dispone de confirmacion oficial.
- Opciones de despliegue: ONNX Runtime (principal, al ser el formato publicado); el ecosistema ModelScope/FunASR para el checkpoint original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Paraformer-large zh-cn 16k (este espejo) | no disponible | audio 16 kHz, vocabulario 8404 | Apache 2.0 | ONNX | Hugging Face (espejo) y ModelScope (origen) |
| Whisper large (OpenAI) | no disponible en esta ficha | audio 16 kHz, multilingue | MIT (variantes) | PyTorch, otros | Hugging Face |
| Wav2Vec2 / HuBERT (Meta) | no disponible en esta ficha | audio 16 kHz, principalmente ingles | MIT / Apache segun variante | PyTorch | Hugging Face |

La comparacion detallada de rendimiento entre estos modelos no esta disponible en la informacion proporcionada; para una evaluacion cuantitativa debe consultarse la documentacion de ModelScope y los benchmarks publicados de Paraformer.

## Limitaciones y advertencias

- Es un espejo: no hay garantia de mantenimiento, actualizacion ni soporte por parte del autor del repositorio en Hugging Face.
- Idioma limitado al chino mandarin (`zh-cn`); no se documenta soporte de otras lenguas ni de code-switching.
- No se documentan sesgos especificos, pero como todo sistema ASR puede presentar peor rendimiento con acentos regionales, ruido de fondo, solapamiento de hablantes o audio telefónico de baja calidad.
- Riesgo de errores de transcripcion y de alucinacion de texto en segmentos con silencio o ruido, comun en modelos ASR.
- La licencia Apache 2.0 permite uso comercial, pero los creditos y la responsabilidad corresponden a los autores originales de ModelScope; conviene revisar el repositorio de origen para condiciones adicionales.
- No se documentan requisitos de preprocesado, normalizacion de audio ni formato exacto de entrada ONNX; es necesario consultar la documentacion de FunASR/ModelScope para un uso correcto.
- Sin datos de benchmarks ni de latencia, no es posible garantizar niveles de servicio en produccion sin una evaluacion propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SixStones233/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-onnx
- Repositorio original en ModelScope: https://www.modelscope.cn/models/iic/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-onnx
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs o demos.
