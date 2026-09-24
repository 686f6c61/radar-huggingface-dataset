# simpledirect/Vinci-Cyber-30B-1.0

## Resumen

Vinci-Cyber-30B-1.0 es un ajuste fino de IBM Granite 4.1 30B desarrollado por SimpleDirect, un laboratorio canadiense de IA, y publicado con pesos abiertos bajo licencia Apache 2.0. No es un modelo generalista: se presenta explicitamente como un especialista estrecho en seguridad defensiva de infraestructura como codigo (IaC). Su tarea declarada es leer un fichero de Terraform u OpenTofu junto con un hallazgo de seguridad y devolver una edicion aplicable, o la sentinela `NO_EDIT` cuando el fichero ya es correcto.

El modelo tiene 28.865.728.512 parametros (unos 28,87 mil millones) y un repositorio de 57,7 GB en safetensors, coherente con pesos en BF16 sin cuantizar. El ajuste se realizo sobre un corpus pequeno de ciberseguridad "verifier-grounded" (anclado en verificadores), segun la model card, y las etiquetas del repositorio incluyen `dora` y `rslora`, lo que apunta a adaptadores de bajo rango, aunque el procedimiento exacto no se detalla.

Su relevancia actual es doble. Por un lado, ocupa un nicho poco cubierto: la remediacion automatica y verificable de configuraciones inseguras en Terraform/OpenTofu, con una restriccion explicita de disciplina de respuesta (no anadir comentarios de supresion, no romper el fichero). Por otro, la model card publica una evaluacion inusualmente honesta: el panel de caracterizacion es pequeno (8 casos puntuables de reparacion y 22 controles), no es un holdout virgen y el autor advierte de que la ganancia real frente al modelo padre es 2 a 5, no 0 a 5, porque la mayoria de los fallos del padre son de formato y no de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heredada de IBM Granite 4.1 30B; no se detalla en la informacion disponible |
| Parametros totales | 28.865.728.512 (~28,87 mil millones) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio contiene pesos safetensors en BF16 (57,7 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | ibm-granite/granite-4.1-30b (relacion: finetune) |
| Metodo de ajuste | Ajuste fino sobre corpus de ciberseguridad; etiquetas `dora` y `rslora` sugieren adaptadores DoRA/rsLoRA, sin detalle confirmado |
| Tamano del repositorio | 57,7 GB |
| Fecha de publicacion | 18 de septiembre de 2026 (ultima actualizacion: 23 de septiembre de 2026) |
| Descargas y likes | 11 descargas, 0 likes |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo ni la de su base, IBM Granite 4.1 30B. Lo unico confirmado es que Vinci-Cyber-30B-1.0 es un ajuste fino (finetune) del checkpoint `ibm-granite/granite-4.1-30b`, fijado en la revision `4fae6278f7132abf5e971f9de49ebbad09c54cce` durante las evaluaciones. El modelo ajustado se ancla a la revision `e25c67861096a4fa52d7f7367f95d90b8db9f726`. No hay datos sobre numero de tokens de entrenamiento, composicion del dataset ni sobre el uso de RLHF o DPO.

El rasgo tecnico diferencial declarado es que el ajuste es "verifier-grounded": el corpus de entrenamiento se construye a partir de reparaciones validadas por un verificador, no de texto de seguridad generico. La propia model card insiste en que el alcance es deliberadamente estrecho y que la especializacion "compra primero disciplina de respuesta y despues razonamiento de seguridad". Es decir, buena parte de la mejora medida frente al modelo padre proviene de que Vinci-Cyber emite ediciones aplicables en lugar de prosa, algo que el padre rara vez lograba: 9 de las 13 respuestas del padre agotaron el limite de 512 tokens de generacion.

## Capacidades

- Generacion de texto conversacional (etiqueta `conversational` y pipeline `text-generation`).
- Reparacion de configuraciones inseguras en Terraform y OpenTofu: recibe un fichero y un hallazgo, y devuelve una edicion aplicable.
- Deteccion de no-accion: emite `NO_EDIT` cuando el fichero ya es correcto. En el panel de caracterizacion dejo intactos 21 de 22 ficheros limpios.
- Disciplina de parche: una reparacion solo cuenta como valida si el parche parsea, se aplica, el Terraform sigue validando, el checker real dispara antes y se limpia despues, los recursos previstos sobreviven y no se anade ningun comentario de supresion.
- Enfoque en seguridad defensiva de infraestructura, no en explotacion ofensiva (etiquetas `defensive-security`, `cybersecurity`, `infrastructure-as-code`).
- Capacidad general preservada: en ARC-Challenge, HellaSwag, PIQA, WinoGrande y MMLU las puntuaciones son iguales o marginalmente superiores a las del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multipaso: no disponible; el modelo esta disenado como un unico paso de reparacion, no como agente.
- Capacidades multilingues: no disponible. No se declaran idiomas soportados.
- Vision, audio, modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Remediacion automatica en pipelines de CI/CD: el modelo se inserta como paso posterior a un scanner (Checkov, tfsec, Trivy o similar) dentro de un pull request. Dado el fichero y el hallazgo, devuelve un parche aplicable que el propio pipeline puede validar con `terraform validate` antes de commitear. Encaja porque la model card exige exactamente esa cadena de verificacion como criterio de exito.
- Filtro de falsos positivos antes de escalar a un humano: su comportamiento medido de no tocar 21 de 22 ficheros correctos permite usarlo como primera pasada que descarta hallazgos ya resueltos, reduciendo la carga de los equipos de seguridad.
- Auditoria y evidencias de cumplimiento tipo DORA: el modelo puede generar el parche de remediacion y dejar registro de la configuracion insegura y su correccion, con la restriccion de que no anade comentarios de supresion, lo que evita atajos de cumplimiento ficticio.
- Asistencia a equipos SRE o de plataforma sin especialistas en seguridad: integrado en un asistente interno, convierte un hallazgo tecnico en una edicion concreta sobre el `.tf`, en lugar de recomendar buenas practicas genericas.
- Migracion y modernizacion de infraestructura heredada: aplicable a repositorios grandes de Terraform/OpenTofu con configuraciones antiguas, donde la tarea es producir parches pequenos y validables en lugar de reescribir modulos completos.
- Guardrail previo al merge en monorepos de plataforma: como paso bloqueante en la revision de cambios de infraestructura, donde el requisito no es una opinion sino una edicion que compile y valide.
- Base para ajustes posteriores de dominio: al ser un modelo de 28,87B con licencia Apache 2.0, puede servir como punto de partida (o de destilacion) para especializaciones en otros dialectos de IaC o en otros proveedores cloud.
- Formacion interna de equipos: uso en entornos de practica donde el modelo propone la reparacion y el ingeniero la contrasta, gracias a su formato de salida binario (edicion aplicable o `NO_EDIT`).

## Benchmarks y rendimiento

Panel de caracterizacion de reparacion y contencion (13 ficheros Terraform/OpenTofu con una mala configuracion real cada uno, ninguno en el corpus de entrenamiento; mas 22 ficheros ya correctos). El autor advierte de que es un panel de desarrollo que informo la seleccion de checkpoint, no un holdout virgen, y que solo hay 8 casos de reparacion puntuables.

| Metrica del panel | Granite 4.1 30B (padre, tal cual) | Granite 4.1 30B (formato normalizado) | Vinci-Cyber-30B-1.0 |
|---|---|---|---|
| Produjo una edicion aplicable | 0 / 13 | — | 12 / 13 |
| Reparaciones validas verificadas | 0 / 8 | 2 / 8 | 5 / 8 |
| Limpiezas brutas del checker (antes de validar) | — | — | 7 / 8 |
| De esas, el checker limpio pero Terraform rompio | — | — | 2 (contadas como fallo) |
| Ficheros ya correctos dejados intactos | no reportado | no reportado | 21 / 22 |

Evaluacion de capacidad general con lm-evaluation-harness 0.4.11, 0-shot (salvo GSM8K, 5-shot, media de seis ejecuciones), semilla 0, dtype bfloat16, batch size 8, sobre una unica H200, medidas el 20 de septiembre de 2026.

| Benchmark | Metrica | Vinci-Cyber-30B-1.0 | granite-4.1-30b | n |
|---|---|---|---|---|
| ARC-Challenge | acc_norm | 0,6664 | 0,6570 | 1172 |
| HellaSwag | acc_norm | 0,8513 | 0,8507 | 10042 |
| PIQA | acc_norm | 0,8368 | 0,8341 | 1838 |
| WinoGrande | acc | 0,7593 | 0,7577 | 1267 |
| MMLU | acc | 0,7839 | 0,7824 | 14042 |
| GSM8K | 5-shot, media de 6 ejecuciones | no disponible en la informacion proporcionada | no disponible | — |

El autor matiza que las diferencias son de 0,06 % a 0,94 % absolutos, que la repeticion de ejecuciones mide el harness y no a los modelos, y que GSM8K queda sin resolver. No se han publicado mas resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 57,7 GB, coherente con 28,87B de parametros en BF16. Las cifras siguientes son estimaciones derivadas del tamano de los pesos, salvo donde se indique lo contrario.
- BF16 sin cuantizar: unos 58 GB solo de pesos, mas cache KV. Necesita del orden de 64 a 80 GB de VRAM. GPU adecuadas: H100 80 GB, A100 80 GB, o dos GPU de 48 GB en paralelo de tensor (2x A6000, 2x L40S).
- Cuantizacion FP8 o INT8: unos 29 GB de pesos; cabe en una H100 80 GB o una L40S 48 GB.
- Cuantizacion de 4 bits (GGUF Q4_K_M y similares): unos 17 a 19 GB; cabria en GPU de consumo como RTX 4090 o RTX 3090 de 24 GB. Advertencia: la model card indica explicitamente que los resultados en BF16 del modelo fuente no se trasladan a artefactos GGUF, y las mediciones publicadas no son de GGUF.
- Opciones de despliegue: transformers (libreria declarada), safetensors; endpoint alojado en FriendliAI; etiqueta `endpoints_compatible` para endpoints de inferencia de Hugging Face. vLLM, TGI, llama.cpp u Ollama no se mencionan en la informacion disponible, aunque serian viables previa conversion o adaptacion.
- Latencia y throughput: no disponibles. El unico dato de entorno de ejecucion es la evaluacion sobre una H200 con batch size 8 y un limite de generacion de 512 tokens, que resulto insuficiente para el modelo padre en 9 de 13 casos.

## Comparativa con modelos similares

La informacion disponible solo permite comparar contra el propio modelo base y contra la variante del padre con el formato normalizado. No se documentan otros modelos comparables en la busqueda web realizada.

| Modelo | Parametros | Contexto | Reparaciones validas (panel) | Ficheros correctos intactos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Vinci-Cyber-30B-1.0 | 28,87B | no disponible | 5 / 8 | 21 / 22 | Apache 2.0 | Hugging Face, FriendliAI |
| IBM Granite 4.1 30B (padre, tal cual) | 28,87B | no disponible | 0 / 8 | no reportado | Apache 2.0 (del base) | Hugging Face |
| IBM Granite 4.1 30B (formato normalizado) | 28,87B | no disponible | 2 / 8 (cota inferior) | no reportado | Apache 2.0 (del base) | no aplica, es una re-puntuacion |

El autor advierte que la comparacion honesta es 2 a 5 reparaciones, no 0 a 5, y que el 2 del padre es una cota inferior porque 9 de sus 13 respuestas agotaron el limite de 512 tokens. En capacidad general, ambos modelos rinden de forma practicamente identica (diferencias de 0,06 % a 0,94 % absolutos en ARC-Challenge, HellaSwag, PIQA, WinoGrande y MMLU).

## Limitaciones y advertencias

- Alcance deliberadamente estrecho: solo Terraform y OpenTofu, y solo seguridad defensiva de infraestructura. No es un asistente de seguridad general ni un modelo de proposito general recomendable fuera de ese nicho.
- El panel de evaluacion no es un holdout virgen: los ficheros se excluyeron del entrenamiento, pero el panel informo la seleccion de checkpoint. Las cifras son de desarrollo y no deben compararse con un benchmark independiente.
- Muestra muy pequena: 8 casos de reparacion puntuables y 22 controles. La incertidumbre estadistica es alta.
- Dos de las siete limpiezas brutas del checker rompieron Terraform y se contabilizaron como fallos, no como reparaciones. Un fichero que valida mal pero limpia el scanner no cuenta como exito.
- Queda un caso de reparacion con una advertencia sin resolver sobre una propiedad de seguridad, segun la propia model card.
- El scorer no esta cualificado de forma independiente y hay una re-puntuacion pendiente.
- Riesgo de falso positivo: el unico fichero correcto que no dejo intacto (1 de 22) introdujo un hallazgo nuevo.
- Las diferencias de capacidad general frente al modelo base no estan establecidas estadisticamente; los propios autores senalan que la repeticion de ejecuciones no demuestra que sean reales, y GSM8K queda sin resolver.
- Los resultados en BF16 no se trasladan a artefactos GGUF, por lo que cualquier despliegue cuantizado requiere su propia validacion.
- Idiomas soportados no declarados. La model card esta en ingles y no se documenta comportamiento multilingue.
- Sesgos conocidos: no disponibles en la informacion proporcionada. No hay evaluacion de sesgos ni de seguridad mas alla del panel de IaC.
- Adopcion muy baja: 11 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa por parte de la comunidad.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base IBM Granite 4.1 30B antes de desplegar en produccion.
- Fechas de publicacion y de evaluacion posteriores a septiembre de 2026, segun los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/simpledirect/Vinci-Cyber-30B-1.0
- Pagina del modelo en SimpleDirect: https://www.getsimpledirect.com/models/cyber-30b-1-0
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/simpledirect/Vinci-Cyber-30B-1.0
- Software de SimpleDirect (Vinci Chat): https://www.getsimpledirect.com/software
- Organizacion en GitHub: https://github.com/getsimpledirect
- Interfaz Vinci: https://vinci.getsimpledirect.com/
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-30b
