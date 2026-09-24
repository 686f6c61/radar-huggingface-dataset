# simpledirect/Vinci-Cyber-8B-1.0

## Resumen

Vinci-Cyber-8B-1.0 es una especialización de 8.380.551.168 parámetros (8,38 B) construida por SimpleDirect, un laboratorio canadiense de IA, mediante ajuste fino supervisado sobre el modelo abierto IBM Granite 4.1 8B. No es un modelo preentrenado desde cero: SimpleDirect aporta la especialización y la publicación, mientras que IBM aporta la base. Se distribuye con licencia Apache-2.0 y pesos completos en safetensors, lo que permite autoalojamiento y adaptación posterior sin depender de una API propietaria.

El modelo está orientado a seguridad defensiva aplicada a infraestructura como código (IaC), principalmente Terraform. Su entrenamiento se centra en tres comportamientos concretos: proponer la edición mínima que resuelve un hallazgo de escáner, no modificar configuraciones que ya son correctas y recuperarse cuando un intento de parcheo no es válido. Esto responde a un problema real en remediación automatizada: los atajos que hacen desaparecer un hallazgo sin corregir la causa subyacente (borrar el recurso, poner `count = 0`, ampliar una política).

Es relevante ahora porque ofrece una alternativa autoalojable y auditable en un nicho donde la mayoría de herramientas son SaaS cerrados, y porque su model card documenta explícitamente los casos en los que falla, algo poco habitual. El contexto es limitado: 18 descargas y 0 likes en el momento de la consulta, sin resultados numéricos de benchmarks incluidos en el extracto disponible de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base IBM Granite 4.1 8B (no se detallan variantes en la informacion disponible) |
| Parametros totales | 8.380.551.168 (8,38 B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican cuantizaciones (GGUF, AWQ, GPTQ) en el repositorio. Pesos en safetensors; los 16,8 GB del repo son coherentes con BF16 |
| Idiomas soportados | No disponible. La model card esta redactada en ingles y no se declara cobertura multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de ibm-granite/granite-4.1-8b, un transformer decoder-only de 8,38 B de parametros. SimpleDirect no modifica la topologia, sino que aplica un ajuste fino de especializacion. Las etiquetas del repositorio incluyen `dora` y `rslora`, lo que apunta a tecnicas de adaptacion de bajo rango (DoRA y rsLoRA) para el ajuste, aunque la model card no detalla hiperparametros, rango, alpha ni el numero exacto de tokens de entrenamiento empleados.

El corpus de entrenamiento esta disenado en torno a tres comportamientos de IaC: proponer reparaciones minimas ante un hallazgo de escaner, dejar sin cambios las configuraciones limpias y recuperarse de intentos fallidos. La model card describe un corpus que incluye deliberadamente ejemplos de atajos incorrectos para desincentivarlos. Los ejemplos publicados usan decodificacion greedy y se generaron contra la revision concreta del repositorio, con limites de 512 y 320 tokens segun el arnes. No se especifica la composicion del dataset, ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Generacion de texto tecnico y propuestas de parcheo sobre ficheros de Terraform.
- Remediacion de hallazgos de escaneres de IaC (Checkov, con ejemplos de reglas CKV_AWS_3 y CKV_AWS_20 en la model card).
- Edicion minima quirurgica: modifica atributos concretos sin eliminar recursos ni reescribir campos no relacionados.
- Deteccion de configuraciones correctas y respuesta explicita de "no se necesita cambio".
- Recuperacion tras intentos de parcheo fallidos, comportamiento entrenado explicitamente.
- Analisis de seguridad fuera de dominio, con reservas: en el ejemplo publicado identifica concatenacion de cadenas como SQL injection en Python y propone una consulta parametrizada.
- Conversacional multi-turno (etiqueta `conversational` del repositorio).
- Compatibilidad declarada con endpoints de inferencia (etiqueta `endpoints_compatible`).
- No se documentan capacidades de vision, audio, tool calling, function calling ni modo de razonamiento explicito. No disponible.

## Casos de uso

- Remediacion asistida de hallazgos de escaneres IaC: se le entrega el hallazgo (por ejemplo, CKV_AWS_3 sobre cifrado de un volumen EBS) junto con el bloque de configuracion que lo dispara, y devuelve la edicion minima que lo resuelve. Es el escenario central para el que fue entrenado.
- Revision de pull requests de Terraform en CI/CD: integrado como paso de validacion previo al merge, puede comentar propuestas de cambio minimas sobre el diff, dejando la aprobacion final a una persona.
- Control de falsos positivos en pipelines de cumplimiento: al estar entrenado para responder "no se necesita cambio" cuando la configuracion ya es correcta, reduce el ruido de parcheos innecesarios que degradan configuraciones validas.
- Recuperacion de parcheos fallidos: cuando un cambio propuesto rompe el plan de Terraform o no supera las comprobaciones, el modelo esta entrenado para reformular la propuesta en lugar de insistir en la misma edicion.
- Auditoria de exposicion de almacenamiento: revision de recursos como `aws_s3_bucket_acl` con `acl = "public-read"` y propuesta de alternativas (`private` o `authenticated-read`) nombrandolas en lugar de elegir en silencio.
- Asistente de seguridad defensiva autoalojado en entornos restringidos: al distribuirse con pesos abiertos y licencia Apache-2.0, puede desplegarse en infraestructura aislada donde no se permite enviar configuraciones a servicios externos.
- Apoyo a revision secundaria de codigo de aplicacion: puede detectar patrones como inyeccion SQL, pero esta fuera de su especialidad y su salida tiende a extenderse mas alla de lo necesario.
- Formacion y documentacion interna: uso como referencia para explicar por que una edicion concreta corrige un hallazgo, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card indica que las mediciones "estan mas abajo" y que son "mas mezcladas" de lo que sugieren los ejemplos, pero el extracto facilitado no incluye esas cifras. Los cuatro ejemplos de la model card son escenarios elegidos por el propio autor y no constituyen una medicion; la propia documentacion lo advierte de forma explicita.

## Requisitos de hardware

Estimaciones de VRAM para inferencia, calculadas a partir de los 8,38 B de parametros:

| Precision | Peso aproximado | VRAM total estimada | GPU de referencia |
|---|---|---|---|
| BF16 | ~16,8 GB | ~20-24 GB con cache KV | RTX 4090 (24 GB), A100 40 GB, L40S 48 GB, H100 80 GB |
| INT8 / FP8 | ~8,5 GB | ~11-13 GB | RTX 4080 16 GB, RTX 3090 24 GB, L4 24 GB |
| INT4 (GGUF Q4_K_M) | ~5 GB | ~7-9 GB | RTX 3060 12 GB, RTX 4060 Ti 16 GB, GPU de 8 GB con margen justo |

- Cabe en GPU de consumo: si, en BF16 en una RTX 4090 o RTX 3090 con contexto moderado; en cuantizacion INT4 en tarjetas de 8-12 GB.
- No se publican ficheros GGUF en el repositorio, por lo que el uso en llama.cpp u Ollama requiere conversion previa a partir de los safetensors.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI y llama.cpp/Ollama tras conversion. La etiqueta `endpoints_compatible` indica compatibilidad con endpoints de inferencia, y FriendliAI ofrece un endpoint alojado para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Vinci-Cyber-8B-1.0 | 8,38 B | No disponible | Apache-2.0 | Seguridad defensiva e IaC | Pesos en HuggingFace y endpoint en FriendliAI |
| IBM Granite 4.1 8B | ~8 B | No disponible en esta ficha | Apache-2.0 | Proposito general | Pesos en HuggingFace |
| Llama 3.1 8B | ~8,03 B | 128.000 tokens | Llama 3.1 Community License | Proposito general | Pesos en HuggingFace |
| Qwen3-8B | ~8,2 B | 32.768 tokens nativos, ampliable con YaRN | Apache-2.0 | Proposito general con modo de razonamiento | Pesos en HuggingFace |

No se dispone de resultados de benchmarks comparativos verificados para Vinci-Cyber-8B-1.0, por lo que la comparacion se limita a parametros, licencia y disponibilidad. Los datos de las alternativas de proposito general proceden de su documentacion publica y deberian verificarse antes de tomar decisiones.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos, pero el corpus esta centrado en Terraform y en un proveedor cloud concreto (los ejemplos usan recursos AWS), lo que puede reducir su eficacia en otras nubes o en otras herramientas de IaC.
- Riesgo de alucinacion en remediaciones: una edicion propuesta puede parecer correcta y no resolver la causa del hallazgo. La propia model card advierte que esta destinado a flujos con revision humana y no a cambios desatendidos en produccion.
- Tendencia a la verbosidad: en el ejemplo fuera de dominio publicado, el modelo siguio generando variantes despues de dar la respuesta correcta hasta agotar el limite de tokens, cortandose a mitad de palabra.
- Cobertura de idiomas no declarada: no hay informacion sobre rendimiento en castellano. La model card esta en ingles.
- Longitud de contexto no publicada, lo que impide planificar su uso con ficheros de configuracion extensos o repositorios grandes.
- Validacion comunitaria muy limitada: 18 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados en la informacion disponible.
- Licencia Apache-2.0: permisiva para uso comercial, sin restricciones adicionales conocidas, pero se debe conservar la atribucion a SimpleDirect y a IBM como desarrolladores del modelo base.
- Los ejemplos de la model card no son mediciones: fueron seleccionados por el autor y el propio texto reconoce que los escenarios son suyos.

## Enlaces

- HuggingFace: https://huggingface.co/simpledirect/Vinci-Cyber-8B-1.0
- Pagina del modelo en SimpleDirect: https://www.getsimpledirect.com/models/cyber-8b-1-0
- Modelos y sistemas de SimpleDirect: https://www.getsimpledirect.com/models-and-systems
- Organizacion en GitHub: https://github.com/getsimpledirect
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/simpledirect/Vinci-Cyber-8B-1.0
- Interfaz Vinci: https://vinci.getsimpledirect.com/
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b
