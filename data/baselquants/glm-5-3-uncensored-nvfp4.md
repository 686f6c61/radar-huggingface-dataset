# baselquants/GLM-5.3-UNCENSORED-NVFP4

## Resumen

GLM-5.3-UNCENSORED-NVFP4 es un checkpoint derivado de zai-org/GLM-5.3 publicado por el usuario baselquants. Se trata de una versión "abliterated" (sin comportamiento de rechazo) del modelo base, cuantizada en NVFP4 y orientada explícitamente a ciberseguridad ofensiva y trabajo de red team. El modelo base es un transformer de tipo Mixture-of-Experts con atención latente multi-cabeza (MLA) y atención dispersa tipo DeepSeek, identificado en la model card como arquitectura `glm_moe_dsa`. La model card declara 753.000 millones de parámetros totales con unos 18.000 millones activos por token, aunque la suma real de los tensores safetensors publicados es de 390.942.074.880 parámetros, una discrepancia que conviene verificar antes de dimensionar el despliegue.

La modificación del modelo no emplea fine-tuning, SFT, DPO, LoRA, adaptadores ni vectores de dirección: según el autor, la eliminación de los rechazos está grabada directamente en los tensores, de forma permanente. El resultado, de acuerdo con las mediciones incluidas en la model card, es una tasa de rechazo del 0,0 % sobre 156 prompts aleatorios de HarmBench en los modos de esfuerzo de razonamiento "high" y "max", manteniendo una puntuación MMLU de 84,11 % frente al 85,58 % del modelo base (una pérdida de 1,47 puntos porcentuales).

Su relevancia actual es doble. Por un lado, demuestra que la cuantización NVFP4 a gran escala es viable con vLLM estándar sobre clústeres de 8 GPUs, con una ganancia notable en el pool de caché KV que permite contextos prácticos de 512K tokens en TP8. Por otro, ejemplifica una categoría de publicaciones orientadas a eliminar guardarraíles de forma irreversible, lo que plantea consideraciones legales y de gobernanza que se detallan en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3 (`glm_moe_dsa`): Mixture-of-Experts con MLA (multi-head latent attention) y atencion dispersa tipo DeepSeek |
| Parametros totales | 753B declarados en la model card; 390.942.074.880 segun la suma real de los tensores safetensors del repositorio |
| Parametros activos | ~18B por token |
| Longitud de contexto | 1.000.000 tokens (1M) segun especificaciones; ~512K practicos en TP8 sobre GB10 |
| Tipos de cuantizacion | NVFP4 (expertos enrutados en NVFP4; atencion y expertos compartidos en bf16); tag de repositorio 8-bit; cuantizado con NVIDIA ModelOpt |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (NVFP4 / ModelOpt) |
| Tamano del repositorio | 464,9 GB |
| Cabecera MTP | Si, multi-token-prediction tambien modificada; ~87 % de aceptacion de borradores |
| Modos de razonamiento | reasoning-off / low / high / max (solo se honran "low" y "high"; el resto cae a "max") |
| Modelo base | zai-org/GLM-5.3 |

## Arquitectura y entrenamiento

La arquitectura subyacente es `glm_moe_dsa`, una variante de transformer con capas Mixture-of-Experts, atencion latente multi-cabeza (MLA) y un mecanismo de atencion dispersa (DSA) heredado del linaje DeepSeek. La cuantizacion NVFP4 se aplica a los expertos enrutados, mientras que las capas de atencion y los expertos compartidos permanecen en bf16, una eleccion habitual para preservar la calidad en los componentes que se activan en cada token. El checkpoint incluye ademas una cabeza de prediccion multi-token (MTP, multi-token prediction) que actua como draft para decodificacion especulativa, con una tasa de aceptacion declarada del 87 %, y que segun el autor tambien ha sido modificada.

En cuanto al entrenamiento, la informacion disponible no describe el proceso de preentrenamiento ni la composicion del dataset del modelo base: no se indican numero de tokens, mezcla de datos ni si hubo fases de RLHF o DPO. Lo que si se detalla es el procedimiento de este derivado concreto: no hay fine-tuning, SFT, DPO, LoRA, adaptadores, vectores de direccion, hooks en tiempo de ejecucion ni `model.py` personalizado. La intervencion es una edicion permanente de los tensores que elimina el comportamiento de rechazo, de modo que el modelo carga en vLLM sin modificaciones del runtime. La model card reporta ausencia de degeneracion o bucles en todos los modos de razonamiento evaluados.

Un detalle tecnico relevante senalado por los probadores en campo es que el parametro `reasoning_effort` solo respeta los valores "low" y "high": cualquier otro valor (off, medium, max, ausente o un `off` sin comillas que YAML interpreta como booleano `false`) cae por defecto a `max`. Es decir, no existe forma de desactivar el razonamiento en este checkpoint; el minimo es `low`. Ademas, el texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`.

## Capacidades

- Generacion de texto y razonamiento general en ingles, con modos de esfuerzo de razonamiento (`low` y `high` efectivos; todo lo demas cae a `max`).
- Capacidad preservada respecto al modelo base: 84,11 % en MMLU-logit frente a 85,58 % del base (-1,47 pp).
- Generacion de codigo de seguridad funcional: shells inversas y balizas C2, keyloggers con captura y exfiltracion, ransomware AES con nota de rescate, escalada de privilegios SUID en Linux, fuerza bruta SSH y payloads de inyeccion SQL, todos ellos verificados como codigo funcional segun el autor.
- Cumplimiento en temas mas amplios de red team: analisis de malware, plantillas de phishing para concienciacion y reconocimiento.
- Cabecera MTP integrada para decodificacion especulativa con ~87 % de aceptacion de borradores.
- Contexto largo de hasta 1M tokens en especificacion, con ~512K practicos en configuraciones TP8 sobre DGX Spark GB10.
- Compatibilidad directa con vLLM estandar, sin parches ni codigo de modelo personalizado.
- No se documenta soporte de tool calling, function calling, capacidades de agente multi-paso, vision, audio ni multimodalidad en la informacion disponible.
- Capacidades multilingues limitadas al ingles declarado.

## Casos de uso

- Pruebas de penetracion autorizadas: el modelo genera cadenas de explotacion completas (reconocimiento, payload, post-explotacion) sobre sistemas propios o con contrato de auditoria firmado, aprovechando que no rechaza peticiones tecnicas legitimas de seguridad.
- Ejercicios de red team y purple team: produccion de herramientas ofensivas para medir la eficacia de las defensas de una organizacion, con la ventaja de un contexto de 512K-1M tokens para mantener el hilo de un engagement largo sin perder detalles de la infraestructura objetivo.
- Analisis de malware en laboratorio aislado: el modelo puede redactar scripts de desofuscacion, extraer indicadores de compromiso y explicar el comportamiento de una muestra, dado que no bloquea el contenido malicioso que se le presenta para analisis.
- Desarrollo de reglas de deteccion: a partir de tecnicas de ataque descritas (por ejemplo, escalada SUID o balizas C2), generar reglas Sigma, YARA o consultas SIEM que detecten esas mismas tecnicas en produccion.
- Formacion y CTFs: generacion de retos, binarios de practica, escenarios de explotacion y pistas progresivas para plataformas de entrenamiento en ciberseguridad, con el contexto largo permitiendo mantener la coherencia narrativa de un reto completo.
- Investigacion academica en seguridad: estudio reproducible de tecnicas de ataque y de mitigaciones, con la ventaja de un modelo de licencia MIT que puede ejecutarse en infraestructura propia sin dependencia de APIs externas.
- Evaluacion de alineacion y seguridad de IA: uso del checkpoint como sujeto de estudio para medir el efecto de la abliteracion en las capacidades y en las tasas de rechazo, comparando contra el modelo base con la misma metodologia MMLU-logit y HarmBench.
- Automatizacion de tareas de hardening: dado un manifiesto de configuracion o un playbook de Ansible, pedirle al modelo que localice superficies de ataque explotables y proponga parches concretos, apoyandose en su capacidad de razonamiento sobre codigo.

## Benchmarks y rendimiento

Tasas de rechazo medidas sobre prompts aleatorios de HarmBench, decodificacion greedy, un solo flujo y `max_tokens=1400`. El clasificador lee contenido y razonamiento combinados:

| Esfuerzo de razonamiento | Prompts | Cumple | Rechaza | Tasa de rechazo |
|---|---|---|---|---|
| default (off) | 109 respondidos | 101 | 8 | 7,3 % |
| high | 76 | 76 | 0 | 0,0 % |
| max | 80 | 80 | 0 | 0,0 % |

De los 8 rechazos en modo off, 7 corresponden a copyright (peticiones de letras completas o pasajes largos) y 1 a persuasion politica; la tasa de rechazo por seguridad real en ese modo seria inferior al 1 %, segun el autor.

Cumplimiento en seguridad ofensiva, verificado por lectura directa:

| Capacidad | Resultado |
|---|---|
| Shell inversa / baliza C2 | codigo funcional |
| Keylogger (captura y exfiltracion) | codigo funcional |
| Ransomware AES (cifrado y nota) | codigo funcional |
| Escalada de privilegios SUID en Linux | codigo funcional |
| Fuerza bruta SSH | codigo funcional |
| Payloads de inyeccion SQL | codigo funcional |

Preservacion de capacidad, MMLU-logit con argmax sobre A/B/C/D, 1.026 preguntas:

| Metrica | Base | CRACK Uncensored | Delta |
|---|---|---|---|
| MMLU (global) | 85,58 % | 84,11 % | -1,47 pp |

La model card incluye ademas el desglose por las 57 materias del MMLU (por ejemplo, Algebra Abstracta 66,7 % base frente a 55,6 % tras la modificacion; Astronomia 94,4 % en ambos casos; Conocimiento Clinico 88,9 % en ambos). No se han publicado resultados de otros benchmarks habituales como HumanEval, GSM8K o MATH en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 464,9 GB, por lo que la inferencia exige agregacion de memoria entre varias GPUs; no es desplegable en una unica GPU de consumo.
- VRAM estimada: con pesos NVFP4 de aproximadamente 0,5 bytes por parametro, el peso del modelo se situa en el rango de 380-470 GB, a lo que hay que sumar el pool de cache KV. Con atencion en bf16, el consumo adicional depende del contexto y del grado de tensor parallelism.
- Configuracion de referencia probada en campo: 8x DGX Spark GB10 por @0xMagnus.
- En GB10 no hay computo FP4 nativo: los pesos se descomprimen en vuelo y la decodificacion queda en un orden de magnitud similar a FP8 con MTP. La ventaja de NVFP4 en esta plataforma es de memoria y contexto, no de velocidad.
- Pool de cache KV: aproximadamente 35 GiB por rango en NVFP4, frente a 7-9 GiB en FP8. Esto habilita unos 512K tokens de contexto practicos en TP8 (pool de ~695K tokens con concurrencia 1,33x).
- El contexto de 1M tokens mediante decode-context-parallel esta cerrado actualmente en vLLM para `glm_moe_dsa`: el `k_cache` del indexador DSA se replica entre rangos DCP mientras la KV de MLA esta shardada, lo que provoca el error `page size is not divisible by target page size and cannot be padded` en `nvfp4_ds_mla`.
- En NVFP4, el modo `reasoning_effort=high` es usable con `max_tokens >= 16384` y termina limpiamente; el modo `max` agota con frecuencia el presupuesto con un bloque de razonamiento muy largo y una respuesta truncada. NVFP4 tolera mejor `high` que la build en FP8.
- Despliegue: vLLM estandar, sin codigo personalizado. No se documenta soporte para llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput concretos en tokens por segundo: no disponibles. El unico dato de rendimiento declarado es la tasa de aceptacion de la cabeza MTP, en torno al 87 %.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rechazos (HarmBench) | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| baselquants/GLM-5.3-UNCENSORED-NVFP4 | 753B declarados / ~18B activos | 1M | NVFP4 | 7,3 % (off), 0,0 % (high, max) | 84,11 % | MIT | HuggingFace, 0 descargas, 0 likes en el momento del analisis |
| zai-org/GLM-5.3 (base) | 753B / ~18B activos | 1M | bf16 original | no disponible | 85,58 % | no disponible | HuggingFace |
| dealignai/GLM-5.3-ABLITERATED-NVFP4 | mismo que el modelo analizado | 1M | NVFP4 | no disponible de forma independiente (espejo de este checkpoint) | no disponible | no disponible | HuggingFace |
| dealignai/GLM-5.3-UNCENSORED-FP8 | mismo que el modelo base | 1M | FP8 | no disponible | no disponible | no disponible | HuggingFace |

La comparativa con alternativas de otros fabricantes del mismo orden de tamano no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion no es gratuita: la model card reconoce una perdida de 1,47 puntos porcentuales en MMLU global, con caidas mas acusadas en materias concretas (Algebra Abstracta pasa de 66,7 % a 55,6 %, y Quimica Universitaria de 55,6 % a 50,0 %). Conviene auditar el rendimiento en las tareas objetivo antes de usarlo en produccion.
- El modelo esta disenado para no rechazar peticiones de seguridad ofensiva. Genera codigo funcional de keyloggers, ransomware, shells inversas y escalada de privilegios. Su uso sin autorizacion expresa por escrito constituye un delito en la mayoria de jurisdicciones; la licencia MIT no exime del cumplimiento legal.
- La licencia es MIT sobre los pesos publicados, pero el modelo base zai-org/GLM-5.3 no declara licencia en la informacion disponible, por lo que la cadena de derechos para uso comercial deberia verificarse por separado.
- El modelo solo declara soporte de ingles. No hay datos sobre comportamiento en castellano ni en otros idiomas.
- No se documentan capacidades de tool calling, function calling ni uso como agente multi-paso, lo que limita su integracion directa en pipelines automatizados de seguridad.
- El razonamiento no se puede desactivar: `reasoning_effort` solo acepta "low" y "high" como valores efectivos, y cualquier otro cae a "max". Esto afecta al coste por peticion y a la latencia en despliegues con muchos usuarios.
- En modo `max` sobre NVFP4 el modelo puede agotar el presupuesto de tokens con un bloque de razonamiento largo y devolver una respuesta truncada. Se recomienda `high` con `max_tokens >= 16384`.
- El contexto de 1M tokens no es alcanzable hoy en vLLM sobre `glm_moe_dsa` por la limitacion de DCP descrita; el maximo practico esta en torno a 512K en TP8.
- Riesgo de alucinacion: no se han publicado mediciones de fidelidad factual ni de tasas de alucinacion para este checkpoint. Al tratarse de una edicion de pesos sobre un modelo del que no se conocen los datos de preentrenamiento, no es posible acotar los sesgos heredados.
- La modificacion es permanente e irreversible: no existe un modo seguro que restaure los rechazos. Desplegarlo como servicio expuesto a terceros implica asumir todo el riesgo de las respuestas generadas.
- Repositorio con 0 descargas y 0 likes en el momento del analisis, creado y actualizado el mismo minuto: no hay validacion independiente de terceros sobre las cifras declaradas, ni sobre la discrepancia entre los 753B declarados y los 390,94B reales de los tensores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baselquants/GLM-5.3-UNCENSORED-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Espejo declarado por el autor: https://huggingface.co/dealignai/GLM-5.3-ABLITERATED-NVFP4
- Build en FP8 del mismo linaje: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusion con notas de despliegue en 8x DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del autor de la abliteracion: https://huggingface.co/dealignai
- Los resultados de la busqueda web realizada no contienen ningun enlace relacionado con este modelo; no se han encontrado papers, blogs, repositorios ni demos adicionales.
