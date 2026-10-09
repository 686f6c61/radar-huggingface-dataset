# seerror-technologies/seerie-v349-GGUF

## Resumen

Seerie v3 es un modelo de lenguaje causal de 1.700 millones de parametros, ajustado por instrucciones para conversacion, especializado en la deteccion y respuesta ante fraudes digitales en India. Lo desarrolla Seerror Technologies (Jay Tiwari) y se distribuye unicamente en formato GGUF cuantizado para ejecucion local con llama.cpp, Ollama y LM Studio. Parte del modelo base Qwen/Qwen3-1.7B y se ha afinado mediante QLoRA con Unsloth sobre un conjunto de 107.575 conversaciones (dataset v349).

El problema que aborda es concreto: estafas de UPI, fraude de OTP y KYC, "digital arrest", ofertas de empleo falsas, notificaciones oficiales falsificadas, apelaciones de donacion fraudulentas y estafas de "amistad online" que derivan en peticiones de dinero. El modelo esta disenado para funcionar completamente sin conexion, de modo que las consultas del usuario y sus datos personales no salen del dispositivo, algo relevante en un contexto de fraude financiero donde la victima suele compartir informacion sensible.

Su relevancia actual radica en dos factores: es un modelo de 1.7B que cabe en telefonos moviles en cuantizacion Q4_K_M (1,11 GB) y su evaluacion se ha publicado con auditoria manual completa, incluidas las respuestas incorrectas, en un articulo depositado en Zenodo. La model card reporta 87 de 100 respuestas seguras frente a 35 de 100 del modelo base, una mejora sustancial medida sobre el mismo conjunto de 100 prompts. La licencia es Apache 2.0 y el repositorio ocupa 6,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (heredada de Qwen/Qwen3-1.7B); detalles internos no especificados en la model card |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M, Q6_K, F16 (GGUF) |
| Idiomas soportados | Ingles, Hinglish y 9 idiomas indios en script nativo: hindi, bengali, tamil, telugu, kannada, malayo, guyaratí, panyabí y odia |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Archivos publicados en el repositorio:

| Fichero | Cuantizacion | Tamano | Uso recomendado por el autor |
|---|---|---:|---|
| `seerie-v349-q4_k_m.gguf` | Q4_K_M | 1,11 GB | Opcion por defecto; telefonos y dispositivos con poca memoria |
| `seerie-v349-q6_k.gguf` | Q6_K | 1,42 GB | Telefonos de gama alta y portatiles |
| `seerie-v349-f16.gguf` | F16 | 3,45 GB | Maquinas con GPU, evaluacion o recuantizacion |

## Arquitectura y entrenamiento

El modelo es un ajuste por instrucciones del Qwen3-1.7B, un transformer causal de 1,7B de parametros. El metodo de ajuste fino es QLoRA con Unsloth, con rango 32 y alpha 64, durante 3 epocas (20.169 pasos). Un detalle relevante de la receta es que la perdida se calcula unicamente sobre las respuestas del asistente, no sobre los turnos del usuario, lo que concentra el aprendizaje en el formato y el contenido de la respuesta deseada.

Los datos de entrenamiento corresponden al dataset v349, con 107.575 conversaciones. Frente a la version anterior (v2, dataset v224, 36.669 conversaciones), v3 multiplica por tres el volumen e incorpora conversaciones multiturno en todas las adiciones posteriores a v224. La cobertura tematica se amplia a cientos de tipos de estafa adicionales: reservas y alquileres por adelantado, notificaciones oficiales falsas, apelaciones de donacion fraudulentas, estafas de "amistad online", estafas de configuracion de dispositivos y peticiones de ayuda para cometer fraude. Dos cambios de contenido destacan: los numeros de asistencia y dominios introducidos en los datos nuevos se verificaron contra una lista de numeros y dominios oficiales, y se eliminaron por completo las secciones legales (las cuestiones juridicas se derivan a un abogado o a asistencia juridica gratuita, 15100).

Para evaluacion se reservaron 34 temas de estafa (816 conversaciones). No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa o atencion lineal. Tampoco se especifica el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional multiturno centrada en reconocimiento, respuesta y denuncia de fraudes digitales.
- Identificacion de tipologias concretas de estafa: UPI, OTP y KYC, "digital arrest", empleo y notificaciones falsas, donaciones fraudulentas, estafas de amistad online y esquemas de tipo pig-butchering.
- Orientacion a canales oficiales de denuncia: linea de ayuda nacional 1930, cybercrime.gov.in y, para fraudes de inversion, SEBI SCORES (scores.sebi.gov.in).
- Respuesta en el idioma de la pregunta, con soporte de ingles, Hinglish y 9 idiomas indios en script nativo.
- Ejecucion totalmente offline y on-device, sin envio de datos del usuario a servidores externos.
- Recomendacion de preservacion de pruebas (capturas, recibos de deposito, registros de chat, identificadores UPI) y de pasos inmediatos para limitar el dano.
- Derivacion de consultas legales a un abogado o a asistencia juridica gratuita, en lugar de emitir asesoramiento juridico propio.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo de razonamiento explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia a victimas de estafa UPI: el modelo identifica el patron (por ejemplo, pig-butchering con retiradas bloqueadas), indica que no se realicen mas pagos de "impuestos" o "comisiones" y guia hacia la denuncia en el 1930 y cybercrime.gov.in. Es adecuado porque el vocabulario y los pasos concretos estan presentes en los datos de entrenamiento.
- Deteccion previa de fraude de OTP y KYC: un usuario puede describir el mensaje o la llamada recibida y el modelo clasifica el riesgo y explica por que ninguna entidad legitima solicita un OTP. Funciona offline, lo que evita reenviar el contenido sensible a un servicio en la nube.
- Filtro previo a una transferencia: antes de pagar una reserva de alquiler o una entrada de evento, el usuario consulta al modelo sobre el patron de la oferta. La ventana de contexto, no obstante, no esta documentada en la model card.
- Apoyo a trabajadores de linea de ayuda y ONG: como primer nivel de triaje en centros de atencion, generando borradores de respuesta en el idioma del usuario (hindi, bengali, tamil, etc.) que un operador revisa despues.
- Integracion en aplicaciones moviles de ciberseguridad: al ser un GGUF de 1,11 GB en Q4_K_M, se puede empaquetar en una app Android o iOS y ejecutarse sin red, como hace la propia aplicacion Seerie publicada en Google Play.
- Educacion y concienciacion ciudadana: generacion de explicaciones y ejemplos de estafas en varios idiomas indios para materiales de formacion, con la advertencia de que las respuestas deben revisarse antes de publicarse.
- Analisis de conversaciones sospechosas: el usuario pega un intercambio de mensajes con un supuesto empleador, banco o "amigo online" y el modelo senala las senales de alarma y los siguientes pasos recomendados.
- Despliegue en quioscos o terminales sin conectividad: entornos rurales o con conectividad intermitente donde un asistente local es la unica opcion viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion documentada es una auditoria manual del autor sobre un conjunto de prueba de 100 prompts, en la que cada respuesta fue leida y valorada a mano.

| Evaluacion | Seerie v3 (v349) | Modelo base Qwen3-1.7B |
|---|---:|---:|
| Respuestas seguras sobre 100 prompts (lectura manual) | 87/100 | 35/100 |

El articulo asociado, *Three Times the Data, the Same Mistakes: A Manually Audited Evaluation of Seerie, an Offline Scam-Prevention Assistant for India*, publicado en Zenodo, incluye la evaluacion completa y todas las respuestas incorrectas. No se dispone de datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (estimacion propia a partir del tamano de los ficheros, no publicada por el autor):
  - Q4_K_M: aproximadamente 1,5-2 GB considerando pesos, contexto y overhead del runtime.
  - Q6_K: aproximadamente 2-2,5 GB.
  - F16: aproximadamente 3,5-4 GB.
- Cabe en GPU de consumo: si. Cualquier GPU con 4 GB o mas de VRAM puede ejecutar la version Q4_K_M; una RTX 3060, RTX 4060, RTX 4090 o similar es mas que suficiente. La cuantizacion Q4_K_M esta pensada explicitamente para telefonos y dispositivos con poca memoria.
- GPU profesionales: A100 y H100 no son necesarias para este tamano; en esos aceleradores el modelo queda limitado por latencia de kernel, no por memoria.
- CPU: al ser GGUF, la inferencia en CPU es viable y es el modo previsto para telefonos y portatiles sin GPU dedicada.
- Opciones de despliegue: llama.cpp, Ollama (`ollama run hf.co/seerror-technologies/seerie-v349-GGUF`) y LM Studio, segun la model card. El repositorio incluye la etiqueta `endpoints_compatible`. El soporte en vLLM o TGI no se menciona en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de terceros en la misma categoria (asistentes de prevencion de fraude en dispositivo). La comparacion disponible se limita a las versiones del propio modelo y a su base.

| Modelo | Parametros | Contexto | Licencia | Evaluacion | Disponibilidad |
|---|---|---|---|---|---|
| Seerie v3 (v349) | 1,7B | no disponible | Apache 2.0 | 87/100 respuestas seguras (auditoria manual) | GGUF en HuggingFace, app en Google Play |
| Seerie v2 (v224) | no disponible | no disponible | no disponible | prueba automatica por palabras clave | `seerror-technologies/seerie-v224-GGUF` |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible en esta informacion | no disponible en esta informacion | 35/100 respuestas seguras sobre el mismo conjunto | HuggingFace |

## Limitaciones y advertencias

- Modelo de dominio especifico: esta ajustado para prevencion de fraude en India y pierde capacidad como asistente generalista frente a su modelo base. No debe emplearse como sustituto de un LLM de proposito general.
- Tasa de error no nula: 13 de cada 100 respuestas de la auditoria manual no se consideraron seguras. En un dominio de seguridad financiera, ese margen exige supervision humana en cualquier despliegue critico.
- Riesgo de alucinacion en datos de contacto: aunque los numeros de asistencia y dominios de los datos nuevos se verificaron contra una lista oficial, el modelo puede generar numeros de telefono, URL o nombres de organismos inexistentes o desactualizados. Cualquier dato de contacto debe contrastarse antes de seguirlo.
- Ausencia deliberada de asesoramiento juridico: los datos de v3 no incluyen secciones legales y el modelo deriva estas cuestiones a un abogado o a la asistencia juridica gratuita (15100). No debe usarse para interpretar legislacion.
- Cobertura linguistica acotada: ingles, Hinglish y 9 idiomas indios. No se declara soporte de castellano ni de otras lenguas fuera de esa lista, por lo que su utilidad fuera del ambito indio es limitada.
- Sesgos: no se han publicado analisis de sesgo en la informacion disponible.
- Adopcion muy baja: el repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que la validacion por parte de terceros es practicamente inexistente.
- Contexto no documentado: la model card no especifica la longitud de contexto efectiva tras el ajuste fino, lo que impide planificar casos de uso con conversaciones o documentos largos.
- Licencia permisiva pero con la responsabilidad en el integrador: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero no ofrece ninguna garantia sobre la exactitud de las respuestas en un contexto de perdida financiera real.
- Los resultados de busqueda web consultados no contenian informacion relevante sobre este modelo; toda la ficha se basa en la model card y los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seerror-technologies/seerie-v349-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Version anterior (v2, dataset v224): https://huggingface.co/seerror-technologies/seerie-v224-GGUF
- Articulo de evaluacion (Zenodo): https://doi.org/10.5281/zenodo.23110075
- Web del desarrollador: https://www.seerror.com
- Repositorio GitHub de la organizacion: https://github.com/Seerror-Technologies
- Aplicacion en Google Play: https://play.google.com/store/apps/details?id=com.seerror.seerie
- Unsloth (metodo de ajuste fino empleado): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
