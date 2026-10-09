# Dthklok/venice-uncensored

## Resumen

Venice Uncensored es un modelo de generacion de texto de 23 572 403 200 parametros (aproximadamente 23,57 mil millones) desarrollado por Venice.ai en colaboracion con Eric Hartford y el equipo de Dolphin AI (Cognitive Computations). Se construye sobre la arquitectura Mistral Small 24B, tomando como base el modelo dphn/Dolphin-Mistral-24B-Venice-Edition, que a su vez deriva de mistralai/Mistral-Small-24B-Instruct-2501. La ficha analizada corresponde a un repositorio alojado por el usuario Dthklok, que replica el modelo oficial AskVenice/venice-uncensored.

El proposito del modelo es ofrecer una variante "sin censura" y altamente direccionable mediante system prompt: no incorpora una alineacion rigida predefinida y delega en el usuario la definicion del tono y los limites de las respuestas. Esta pensado para entornos donde se prioriza la ausencia de rechazos moralizantes y la privacidad del usuario, y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que combina un tamano medio (24B) con un formato de pesos safetensors compatible con transformers y vLLM, lo que facilita su despliegue en pipelines de produccion. Al tratarse de un reupload con cero descargas y cero likes, conviene verificar su procedencia frente al repositorio oficial antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral Small 24B) |
| Parametros totales | 23 572 403 200 (aprox. 23,57 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponibles en este repositorio; solo pesos safetensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only basada en Mistral Small 24B, con aproximadamente 23,57 mil millones de parametros. Se trata de un fine-tune en cascada: parte de mistralai/Mistral-Small-24B-Instruct-2501, sobre el que se construye dphn/Dolphin-Mistral-24B-Venice-Edition, y de este ultimo deriva la edicion Venice Uncensored. El repositorio conserva la plantilla de chat oficial de Mistral, denominada V7-Tekken, con la estructura `<s>[SYSTEM_PROMPT]...[/SYSTEM_PROMPT][INST]...[/INST]...`.

No se dispone de informacion publica en la documentacion proporcionada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso especifico de tecnicas como RLHF o DPO durante el ajuste. La model card si detalla una recomendacion de inferencia poco habitual: emplear una temperatura baja, en torno a 0,15, para obtener respuestas mas estables y controladas. El control de comportamiento se delega en el system prompt, ya que el modelo no incorpora una alineacion fija predefinida.

## Capacidades

- Generacion de texto general con capacidad de seguir instrucciones en formato conversacional multi-turno.
- Alta direccionabilidad mediante system prompt: el usuario define el tono, la personalidad y los limites de las respuestas.
- Ausencia de rechazos moralizantes por defecto, segun declara el autor del modelo.
- Compatibilidad con la plantilla de chat V7-Tekken de Mistral y con el ecosistema transformers y vLLM.
- Soporte de decodificacion con parametros de muestreo configurables (temperatura, max_tokens, etc.).
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling nativo ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistentes conversacionales personalizados: el modelo permite definir una persona concreta mediante system prompt, lo que resulta util para construir asistentes con un tono y estilo fijos en aplicaciones de atencion al usuario.
- Generacion creativa de ficcion y guiones: al no aplicar rechazos moralizantes, es adecuado para narrativa que aborde tematicas adultas o sensibles que otros modelos declinarian.
- Procesamiento por lotes de texto: su integracion con vLLM permite servir multiples peticiones concurrentes en un entorno de produccion con tensor parallelism.
- Experimentacion en investigacion sobre alineacion: sirve como punto de comparacion frente a modelos alineados para estudiar el efecto de las politicas de rechazo en las respuestas.
- Generacion de contenido para prototipado rapido: util en entornos de desarrollo donde se necesita texto sin restricciones tematicas para maquetar interfaces o demos.
- Despliegue privado on-premise: al poder ejecutarse localmente con pesos safetensors, permite mantener los datos de usuario dentro de la infraestructura propia sin depender de APIs externas.
- Traduccion y reescritura de texto: con un system prompt adecuado, se puede emplear para reformular o adaptar contenido en distintos registros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM en precision completa (bf16/fp16): aproximadamente 47 GB de pesos, y la propia model card indica que se requieren unos 60 GB o mas de VRAM.
- Cuantizacion a 8 bits: estimacion de unos 24 GB de VRAM.
- Cuantizacion a 4 bits: estimacion de unos 13-14 GB de VRAM, lo que permitiria ejecucion en GPUs de consumo si se generan los pesos cuantizados.
- GPUs recomendadas para precision completa: A100 80 GB, H100 80 GB, o configuraciones multi-GPU de 2x A100 40 GB.
- GPUs de consumo: una RTX 4090 (24 GB) solo podria ejecutarlo con cuantizacion agresiva a 4 bits.
- Despliegue: la model card recomienda vLLM (version >= 0.6.4) con mistral_common >= 1.5.2; tambien es compatible con transformers. El ejemplo oficial usa tensor_parallel_size=4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Venice Uncensored (este repositorio) | 23,57 B | no disponible | Apache 2.0 | safetensors, transformers, vLLM |
| dphn/Dolphin-Mistral-24B-Venice-Edition | ~24 B | no disponible | no disponible | modelo base directo |
| mistralai/Mistral-Small-24B-Instruct-2501 | ~24 B | no disponible | no disponible | modelo base original de Mistral |

Los tres modelos comparten la misma arquitectura subyacente de Mistral Small 24B. La diferencia principal entre ellos reside en el grado de alineacion y en las politicas de rechazo, siendo la version Venice Uncensored la menos restrictiva de las tres. No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Procedencia: el repositorio analizado (Dthklok/venice-uncensored) registra cero descargas y cero likes, y parece un reupload del modelo oficial AskVenice/venice-uncensored. Conviene verificar la integridad de los pesos antes de usarlo en produccion.
- Ausencia de alineacion: el modelo no incorpora filtros de seguridad por defecto, por lo que puede generar contenido danino, ilegal o eticamente cuestionable. El autor declara que la responsabilidad recae enteramente en el usuario.
- Riesgo de alucinacion: al ser un modelo de lenguaje de 24B sin datos de evaluacion publicados, no se puede descartar la generacion de informacion falsa o inventada.
- Idiomas: no se documentan los idiomas soportados, por lo que el rendimiento fuera del ingles es incierto.
- Contexto: no se especifica la longitud de contexto en la informacion disponible, lo que dificulta dimensionar su uso en tareas de contexto largo.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero no exime al usuario de cumplir la legislacion aplicable sobre el contenido generado.
- Sin benchmarks: la ausencia de resultados de evaluacion impide comparar objetivamente su calidad frente a alternativas.
- Cuantizaciones: este repositorio solo ofrece pesos safetensors; para desplegarlo en hardware limitado habria que generar las cuantizaciones de forma manual.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/Dthklok/venice-uncensored
- Modelo base Dolphin: https://huggingface.co/dphn/Dolphin-Mistral-24B-Venice-Edition
- Modelo base original de Mistral: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Plataforma Venice.ai: https://venice.ai
- Cuenta de Twitter de Venice: https://x.com/AskVenice
- Articulo de Eric Hartford sobre modelos sin censura: https://erichartford.com/uncensored-models
- Web de Dolphin AI: https://dphn.ai
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de mistral-common: https://github.com/mistralai/mistral-common

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos enlaces utiles proceden de la model card y de los metadatos de HuggingFace.
