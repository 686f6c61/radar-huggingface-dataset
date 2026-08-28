# mocomoco-inc/mocovoice-whisper-turbo-ja-legal-synthetic-v0.1

## Resumen
mocovoice-whisper-turbo-ja-legal-synthetic-v0.1 es un prototipo de adaptación léxica para el dominio legal japonés, desarrollado por mocomoco inc. sobre el modelo base openai/whisper-large-v3-turbo. El repositorio distribuye únicamente el artefacto desplegable en formato CTranslate2 int8 (carpeta `ct2-int8/`), resultado de fusionar un adaptador LoRA entrenado con datos sintéticos y convertirlo a cuantización int8. No se incluyen los pesos del adaptador ni un checkpoint Transformers fusionado; el resto del repositorio contiene contratos de datos, scripts de entrenamiento y un manifiesto de reproducibilidad.

El modelo está pensado como una demostración de adaptación de vocabulario especializado (terminología legal) mediante fine-tuning con datos generados sintéticamente, y se integra en el producto de reconocimiento de voz mocoVoice de la misma empresa. Es un artefacto de marketing/demo, no un modelo de producción ni certificado para uso en seguridad. Su relevancia radica en ilustrar un flujo de adaptación de dominio reproducible y auditable, aunque con limitaciones claras para despliegue real.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (transformer encoder-decoder) con adaptador LoRA fusionado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (ct2-int8) |

## Arquitectura y entrenamiento
El modelo parte de openai/whisper-large-v3-turbo, un transformer encoder-decoder de reconocimiento de voz. Sobre él se aplicó un fine-tuning con LoRA (Low-Rank Adaptation) utilizando datos sintéticos de dominio legal japones. El adaptador resultante se fusionó con los pesos base y se convirtió a CTranslate2 en formato int8 para su despliegue. El repositorio incluye el codigo de entrenamiento, evaluacion y exportacion, asi como un manifiesto de reproducibilidad con hashes SHA-256. No se especifican el numero de tokens de entrenamiento ni la composicion detallada del dataset, aunque se indica que los datos son sinteticos (texto y prompts, sin audio distribuido). No se menciona el uso de RLHF o DPO.

## Capacidades
- Reconocimiento de voz automatico (ASR) en japones, con adaptacion lexica especifica para terminologia legal.
- Soporte de decodificacion con beam search (configuracion beam-4 mencionada en la evaluacion).
- Integracion con el framework MocoVoice mediante el wrapper `WhisperModel`, configurado con `compute_type="int8"`.
- No se documentan capacidades de tool calling, agentes, vision ni otros modos especiales; es exclusivamente un modelo de transcripcion.

## Casos de uso
- Transcripcion de audiencias y procedimientos legales: el modelo puede transcribir audio en japones con vocabulario juridico, aunque al ser un prototipo sintetico, requiere validacion humana de terminos criticos.
- Generacion de actas y resumenes de reuniones legales: integrado en mocoVoice, podria convertir conversaciones en texto estructurado, pero sin garantia de exactitud en cantidades o codigos.
- Adaptacion de vocabulario especializado para otros dominios: sirve como referencia de como adaptar Whisper a jerga tecnica mediante LoRA y datos sinteticos.
- Evaluacion de flujos de fine-tuning y cuantizacion: el repositorio documenta un proceso reproducible de entrenamiento, fusion y conversion a CT2, util como plantilla para equipos de ML.
- Demostracion de producto para mocoVoice: el modelo se presenta como ejemplo de adaptacion a entornos con jerga especifica, aunque no debe usarse en produccion sin certificacion.
- Investigacion sobre adaptacion lexica en ASR: permite estudiar el impacto de datos sinteticos en la precision de terminos de dominio, con metricas controladas.

## Benchmarks y rendimiento
La model card incluye dos tablas de evaluacion sobre un holdout sintetico. La tabla mas relevante compara el modelo CT2 entregado con el Whisper Turbo generico, ambos decodificados con el mismo wrapper MocoVoice:

| Metrica | Generic CT2 | Delivered domain CT2 |
|---|---:|---:|
| Domain CER | 0.2056 | 0.1972 |
| Domain term present | 114/144 (79.2%) | 115/144 (79.9%) |
| Punctuation-insensitive term present | 114/144 (79.2%) | 115/144 (79.9%) |
| Controlled code fact | 42/48 (87.5%) | 42/48 (87.5%) |
| Controlled numeric value | 48/48 (100.0%) | 48/48 (100.0%) |
| Controlled value + unit fact | 0/48 (0.0%) | 0/48 (0.0%) |
| Generic CT2 content-exact rows made non-exact | – | 0 |

Tambien se reporta una comparacion entre el modelo base Turbo y una referencia de dominio no distribuida, con metricas similares. Los resultados muestran una ligera mejora en CER y presencia de terminos, pero sin cambios en hechos criticos. La model card advierte explicitamente que estos resultados miden adaptacion lexica en un entorno controlado, no precision en grabaciones reales.

## Requisitos de hardware
- No se especifican requisitos de hardware en la informacion proporcionada.
- El tamano del repositorio es de 0.8 GB, correspondiente al modelo CT2 int8, lo que sugiere que puede ejecutarse en GPUs con poca VRAM (por ejemplo, 4-6 GB), pero no es un dato oficial.
- Al ser formato CTranslate2, es compatible con motores de inferencia como CTranslate2, Faster-Whisper o el framework MocoVoice.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares
La unica comparativa disponible es contra el modelo base openai/whisper-large-v3-turbo generico, que se presenta en la tabla de benchmarks. No se dispone de comparaciones con otros modelos de ASR japones adaptados a legal.

| Modelo | Base | Adaptacion | Formato | Licencia |
|---|---|---|---|---|
| mocovoice-whisper-turbo-ja-legal-synthetic-v0.1 | Whisper large-v3-turbo | LoRA + datos sinteticos | CT2 int8 | MIT |
| openai/whisper-large-v3-turbo | - | - | Transformers / CT2 | MIT (aunque el original es Apache 2.0) |

## Limitaciones y advertencias
- Es un prototipo de marketing/demo, no un modelo de produccion ni certificado para seguridad.
- Los datos de entrenamiento y evaluacion son sinteticos; no se utilizaron grabaciones reales de clientes, obras, fabricas ni entornos operativos.
- No se distribuye audio, y la evaluacion no refleja precision en grabaciones de campo.
- La model card advierte que no debe usarse para decisiones autonomas; siempre hay que revisar cantidades, dimensiones, codigos, fechas, instrucciones de seguridad y estados operativos.
- No se garantiza la exactitud de codigos, numeros, unidades ni terminologia critica.
- El repositorio no incluye los pesos del adaptador LoRA ni un checkpoint Transformers fusionado; solo el artefacto CT2 int8 es desplegable.
- La licencia MIT permite uso comercial, pero el modelo no esta certificado para aplicaciones criticas.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/mocomoco-inc/mocovoice-whisper-turbo-ja-legal-synthetic-v0.1
- Producto mocoVoice (pagina en ingles): https://products.mocomoco.ai/en/
- Sitio corporativo de mocomoco inc. (japones): https://www.mocomoco.ai/
- Pagina de producto mocoVoice (japones): https://products.mocomoco.ai/
- Space de Whisper Turbo en HuggingFace (referencia del modelo base): https://huggingface.co/spaces/hf-audio/whisper-large-v3-turbo
