# Openintelligent123/GLM-5.3-UNCENSORED-NVFP4

## Resumen

GLM-5.3-UNCENSORED-NVFP4 es una derivacion comunitaria del modelo zai-org/GLM-5.3 publicada por el usuario Openintelligent123 el 11 de septiembre de 2026. Se trata de un modelo de mezcla de expertos (MoE) con arquitectura glm_moe_dsa (MoE + MLA + atencion dispersa tipo DeepSeek) cuantizado en NVFP4, al que se le ha eliminado el comportamiento de rechazo directamente en los pesos (tecnica conocida como abliteration o, en la jerga del autor, CRACK). La model card declara 753.000 millones de parametros totales y unos 18.000 millones activos por token, aunque los metadatos de safetensors del repositorio registran 390.942.074.880 parametros, una discrepancia que el autor no aclara.

El modelo esta orientado explicitamente a seguridad ofensiva y red team: la tarjeta afirma que genera codigo funcional de reverse shell, keylogger, ransomware AES, escalada de privilegios SUID y fuerza bruta SSH, y que mantiene cero rechazos en HarmBench con los modos de razonamiento high y max. Su contexto nominal es de 1.000.000 de tokens e incluye una cabeza MTP (multi-token prediction) tambien modificada, con una tasa de aceptacion de borrador declarada del 87 %. El repositorio ocupa 464,9 GB y la licencia declarada es MIT.

Su relevancia practica es doble. Por un lado, interesa a quienes investigan tecnicas de abliteration, evaluacion de rechazos y alineacion de modelos, porque documenta el coste de capacidad asociado (una caida de 1,47 puntos en MMLU respecto al modelo base). Por otro, la cuantizacion NVFP4 permite desplegar un MoE de gran tamano en hardware modesto en VRAM por GPU (8x DGX Spark GB10, TP8) manteniendo 512K tokens de contexto util, lo que lo convierte en un caso de estudio sobre cuantizacion agresiva de modelos frontera. La ficha se limita a describir el artefacto; el uso de sus capacidades ofensivas exige autorizacion expresa y cumple un marco legal estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3 (glm_moe_dsa): MoE con MLA (multi-head latent attention) y atencion dispersa estilo DeepSeek (DSA) |
| Parametros totales | 753.000 millones segun la model card; 390.942.074.880 (~390,9 mil millones) segun los metadatos de safetensors del repositorio (discrepancia no aclarada) |
| Parametros activos | ~18.000 millones por token (segun la model card) |
| Longitud de contexto | 1.000.000 de tokens (nominal); 512K practicos con TP8 en 8x DGX Spark GB10 |
| Tipos de cuantizacion | NVFP4 (expertos enrutados en NVFP4; atencion y expertos compartidos en bf16); etiquetas "8-bit" y "modelopt" |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantizacion NVFP4 via modelopt) |
| Tamano del repositorio | 464,9 GB |
| Cabeza MTP | Si, multi-token prediction, tambien modificada (~87 % de aceptacion de borrador) |
| Modos de razonamiento | off / low / high / max segun la tarjeta; en tiempo de ejecucion solo se respetan low y high, cualquier otro valor cae a max |
| Pipeline | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de GLM-5.3 (identificador glm_moe_dsa), un transformer con mezcla de expertos que combina atencion latente multi-cabeza (MLA) y un mecanismo de atencion dispersa (DSA, DeepSeek-sparse attention). La model card indica 753.000 millones de parametros totales con unos 18.000 millones activos por token, lo que situa el modelo en la categoria de MoE de gran escala con coste de inferencia relativamente bajo por token generado. Incorpora una cabeza de prediccion multi-token (MTP) que actua como borrador para decodificacion especulativa, con una aceptacion declarada del 87 %.

No hay informacion sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF o DPO): esos datos no estan disponibles en la informacion proporcionada. Lo que si detalla la tarjeta es el proceso de modificacion posterior: no hay fine-tuning, SFT, DPO, LoRA, adaptadores, vectores de direccion (steering vectors), hooks en tiempo de ejecucion ni un model.py personalizado. La eliminacion de rechazos es una edicion permanente aplicada directamente sobre los tensores, de modo que el checkpoint se carga con vLLM estandar sin parches. La cuantizacion NVFP4 se aplica a los expertos enrutados, mientras que la atencion y los expertos compartidos se mantienen en bf16, un reparto que busca preservar calidad donde mas impacta.

## Capacidades

- Generacion de texto y razonamiento con control de esfuerzo (off / low / high / max), con la salvedad de que en ejecucion solo se respetan low y high.
- Generacion de codigo de seguridad ofensiva segun la verificacion del autor: reverse shell y balizas C2, keylogger con captura y exfiltracion, ransomware AES con nota de rescate, escalada de privilegios SUID en Linux, fuerza bruta SSH y payloads de inyeccion SQL.
- Temas mas amplios de red team: analisis de malware, plantillas de phishing para concienciacion y reconocimiento.
- Decodificacion especulativa mediante cabeza MTP integrada, tambien modificada, con ~87 % de aceptacion de borrador.
- Ventana de contexto larga: 1M de tokens nominales, 512K practicos en configuracion TP8 sobre GB10.
- Generacion sin bucles ni degeneracion: la tarjeta declara 0 salidas degenerativas en todos los modos probados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Pruebas de penetracion autorizadas: el modelo genera exploits y payloads funcionales para validar la resistencia de infraestructuras propias o de clientes con contrato firmado, y su contexto de 1M tokens permite mantener el alcance, el inventario de objetivos y el historial de hallazgos en una misma sesion.
- Analisis de malware y reversing asistido: se puede emplear para explicar el funcionamiento de muestras, proponer firmas de deteccion y generar variantes de prueba en un entorno aislado, aprovechando que no aplica rechazos sobre este tipo de contenido.
- Formacion y CTFs: resulta util como generador de retos y de soluciones de referencia para plataformas de entrenamiento en seguridad, con la ventaja de producir codigo ejecutable en lugar de descripciones genericas.
- Validacion de reglas de deteccion: generar payloads de prueba (SQLi, reverse shells, SUID) para comprobar que las reglas de un IDS/EDR o de un WAF los detectan, cerrando el ciclo entre la telemetria y la respuesta.
- Investigacion sobre alineacion y abliteration: sirve como objeto de estudio para medir el coste de capacidad de la eliminacion de rechazos (caida de 1,47 puntos en MMLU) y para comparar tasas de rechazo por modo de razonamiento frente al modelo base.
- Evaluacion de cuantizacion NVFP4: permite reproducir un despliegue de un MoE de gran escala en 8x DGX Spark GB10 y comparar el equilibrio entre huella de memoria, longitud de contexto efectiva y calidad de salida frente a builds en FP8 o bf16.
- Simulacros de concienciacion (phishing): con autorizacion de la organizacion, generar plantillas de correo y paginas de captura para campanas internas de formacion, siempre dentro de un entorno controlado.
- Analisis de documentacion tecnica extensa de seguridad: con 512K tokens utiles se pueden procesar informes de auditoria, dumps de configuracion o bases de conocimiento de vulnerabilidades en una sola pasada.

## Benchmarks y rendimiento

La model card publica resultados propios; la busqueda web realizada no devolvio informacion relevante sobre este modelo (los resultados obtenidos tratan sobre el 25 aniversario de los atentados del 11 de septiembre y no guardan relacion).

| Benchmark | GLM-5.3 base | GLM-5.3 UNCENSORED NVFP4 | Diferencia |
|---|---|---|---|
| MMLU (logit, 1.026 preguntas) | 85,58 % | 84,11 % | -1,47 pp |

Subconjunto de MMLU por materia disponible en la tarjeta (el listado completo de 57 materias esta truncado en la informacion proporcionada):

| Materia | Base | Version modificada |
|---|---|---|
| Abstract Algebra | 66,7 % | 55,6 % |
| Anatomy | 83,3 % | 83,3 % |
| Astronomy | 94,4 % | 94,4 % |
| Business Ethics | 94,4 % | 94,4 % |
| Clinical Knowledge | 88,9 % | 88,9 % |
| College Biology | 94,4 % | 94,4 % |
| College Chemistry | 55,6 % | 50,0 % |

Tasas de rechazo en HarmBench (decodificacion greedy, flujo unico, max_tokens=1400, clasificador sobre contenido y razonamiento combinados):

| Esfuerzo de razonamiento | Prompts | Cumple | Rechaza | Tasa de rechazo |
|---|---|---|---|---|
| default (off) | 109 | 101 | 8 | 7,3 % |
| high | 76 | 76 | 0 | 0,0 % |
| max | 80 | 80 | 0 | 0,0 % |

De los 8 rechazos en modo off, 7 corresponden a copyright (letras completas o pasajes largos) y 1 a persuasion politica, segun el autor.

Cumplimiento en seguridad ofensiva (verificacion directa declarada por el autor, no verificada de forma independiente):

| Capacidad | Resultado declarado |
|---|---|
| Reverse shell / baliza C2 | codigo funcional |
| Keylogger (captura y exfiltracion) | codigo funcional |
| Ransomware AES (cifrado y nota) | codigo funcional |
| Escalada de privilegios SUID en Linux | codigo funcional |
| Fuerza bruta SSH | codigo funcional |
| Payloads de inyeccion SQL | codigo funcional |

## Requisitos de hardware

- VRAM: no hay cifra oficial por GPU. Como referencia dimensional, el repositorio pesa 464,9 GB, de modo que la inferencia exige un despliegue multi-GPU.
- No cabe en GPU de consumo: una RTX 4090 (24 GB) o similar queda muy lejos del tamano necesario.
- Tampoco cabe en una unica GPU profesional de 80 GB (A100, H100); el modelo requiere reparto entre varios dispositivos.
- Configuracion probada en campo: 8x DGX Spark GB10 con tensor parallelism 8 (TP8).
- En esa configuracion, el pool de KV en NVFP4 es de ~35 GiB por rango, frente a los 7-9 GiB del build FP8, lo que habilita 512K tokens de contexto con TP8 (pool de ~695K tokens a 1,33x de concurrencia).
- GB10 no dispone de computo FP4 nativo: los pesos se descomprimen al vuelo y la decodificacion queda cerca del build FP8 con MTP. En este hardware NVFP4 es una ventaja de memoria y contexto, no de velocidad.
- Con reasoning_effort=high en NVFP4 se recomienda max_tokens >= 16384 para que la respuesta cierre limpiamente; con max es frecuente agotar el presupuesto con un bloque de razonamiento largo y una respuesta truncada.
- Despliegue soportado: vLLM estandar, cargando el checkpoint directamente (soporte glm_moe_dsa). Otros runners (llama.cpp, Ollama, TGI) no estan documentados en la informacion disponible para este formato NVFP4.
- Limitacion conocida: el contexto de 1M via decode-context-parallel esta cerrado en vLLM para glm_moe_dsa, porque el k_cache del indexador DSA se replica entre rangos DCP mientras el KV de MLA se reparte, lo que provoca el error "page size is not divisible by target page size and cannot be padded" con nvfp4_ds_mla.
- Latencia y throughput concretos: no disponible. Solo se ofrece una comparacion cualitativa frente al build FP8.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base y con el espejo del mismo release. No hay datos de otras alternativas de la misma categoria en el material proporcionado.

| Modelo | Parametros | Contexto | MMLU | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Openintelligent123/GLM-5.3-UNCENSORED-NVFP4 | 391B (safetensors) / 753B (card) | 1M nominal, 512K practico TP8 | 84,11 % | 0 % en high y max | MIT | HuggingFace |
| zai-org/GLM-5.3 (base) | 753B (segun card) | no disponible | 85,58 % | modelo alineado, tasa no disponible | no disponible | HuggingFace |
| dealignai/GLM-5.3-ABLITERATED-NVFP4 (espejo) | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Ausencia total de salvaguardas: los rechazos se han eliminado a nivel de pesos y no hay forma de desactivar el razonamiento en este checkpoint. El modelo genera contenido ofensivo real (malware, exploits, payloads) sin filtros, lo que puede ser ilegal en muchas jurisdicciones si no media autorizacion expresa por escrito.
- Responsabilidad legal y etica: herramientas como keyloggers, ransomware, reverse shells o ataques de fuerza bruta solo son licitas en entornos autorizados (pentesting contratado, laboratorio aislado, CTF). El usuario asume toda la responsabilidad derivada del uso.
- Idiomas: solo se declara ingles. No hay evidencia de calidad en castellano ni en otros idiomas.
- Perdida de capacidad: la propia tarjeta reconoce una caida de 1,47 puntos en MMLU, con materias mas afectadas (Abstract Algebra pasa de 66,7 % a 55,6 %; College Chemistry de 55,6 % a 50,0 %).
- Riesgo de alucinacion y de codigo no funcional: aunque el autor afirma que el codigo es funcional, no hay verificacion independiente. En produccion, cualquier salida debe validarse en un entorno aislado antes de su uso.
- Validacion inexistente por la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha, publicacion de un tercero y sin auditoria. El release espejo pertenece a dealignai, pero el repositorio analizado lo republica otro usuario.
- Discrepancia de parametros: la model card declara 753B totales y los metadatos de safetensors registran 390,9B. Conviene verificar la configuracion real antes de planificar el despliegue.
- Licencia: se declara MIT, pero al derivar de zai-org/GLM-5.3 los terminos del modelo base no estan disponibles en la informacion proporcionada y podrian imponer condiciones adicionales. Una licencia permisiva no exime del cumplimiento legal en materia de ciberseguridad.
- Restricciones de contexto: el 1M nominal no es alcanzable hoy via decode-context-parallel en vLLM; el limite practico documentado es 512K con TP8.
- Caveats de ejecucion: reasoning_effort solo respeta low y high; cualquier otro valor (off, medium, max, sin definir o un off: de YAML interpretado como false) cae a max. Con max es probable que la respuesta se trunque si el presupuesto de tokens no es amplio.
- Coste de infraestructura: 464,9 GB de repositorio implican almacenamiento, transferencia y un cluster multi-GPU, lo que descarta su uso en estaciones de trabajo convencionales.
- Cuantizacion agresiva: la propia tarjeta indica que en GB10 NVFP4 no aporta velocidad, solo memoria y contexto. No hay comparativa publicada de calidad NVFP4 frente a FP8 o bf16 mas alla del MMLU del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Openintelligent123/GLM-5.3-UNCENSORED-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Espejo del release: https://huggingface.co/dealignai/GLM-5.3-ABLITERATED-NVFP4
- Organizacion dealignai: https://huggingface.co/dealignai
- Discusion sobre notas de ejecucion en GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del colaborador que realizo las pruebas de campo: https://huggingface.co/0xMagnus
- Cuenta del autor del release: https://twitter.com/dealignai
- Cuenta del proveedor de computo: https://twitter.com/jordanschenck

Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (contenido sobre el 25 aniversario de los atentados del 11 de septiembre de 2026), por lo que no aportan informacion adicional. No se han localizado papers, blogs ni demos asociados en el material disponible.
