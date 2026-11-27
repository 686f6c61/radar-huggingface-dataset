# Peymandc/Spark-X2.6-1.7B-Uncensored-Peymandc

## Resumen

Spark-X2.6-1.7B-Uncensored-Peymandc es una variante "decensored" (tambien etiquetada como abliterated o uncensored) del modelo XHToken/Spark-X2.6-1.7B, un modelo de lenguaje compacto de 1.707.657.216 parametros disenado para despliegue en dispositivo (on-device). La modificacion la firma el usuario Peymandc y se ha realizado con la herramienta Heretic v2.1.0, que aplica una ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 7 a 15 del transformer original para reducir la tasa de rechazos (refusals) ante peticiones que el modelo base rechazaria.

El modelo base, desarrollado por XHToken, es el segundo de la serie Spark-X2.6 tras el Spark-X2.6-4B y conserva exactamente la misma arquitectura que Spark-X2.5-1.7B, logrando sus mejoras mediante un post-entrenamiento mas refinado. Esta orientado a tareas de codigo, uso de herramientas (agent), contexto largo, multilingue y razonamiento, con un enfoque explicito en eficiencia de inferencia en hardware local. La variante aqui descrita mantiene esas capacidades teoricas pero elimina buena parte del alineamiento de seguridad del original.

La relevancia de esta ficha es doble: por un lado documenta un modelo pequeno (1.7B) con soporte de "thinking budget" configurable en tres niveles (none, low, high), lo que permite ajustar latencia frente a calidad de razonamiento; por otro lado, advierte de que se trata de una modificacion que reduce deliberadamente las salvaguardas del modelo original, con las implicaciones legales y eticas que ello conlleva para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Spark-X2.5-1.7B; detalles internos no disponibles) |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona "long-context" sin cifra concreta) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; se menciona una implementacion optimizada de llama.cpp, lo que sugiere soporte GGUF en el ecosistema, pero no se confirma) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-1.7B es un transformer de 1.7B parametros que, segun la documentacion de XHToken, reutiliza exactamente la arquitectura de Spark-X2.5-1.7B y obtiene sus mejoras exclusivamente mediante un post-entrenamiento mas potente. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada. Se menciona que el modelo incorpora un "thinking budget" configurable en tres niveles (none, low, high), lo que implica un entrenamiento orientado a modos de razonamiento con coste variable.

La modificacion de esta variante se realiza con Heretic v2.1.0 mediante Arbitrary-Rank Ablation, una tecnica de edicion de pesos que proyecta fuera del espacio de activaciones las direcciones asociadas al comportamiento de rechazo. Los hiperparametros publicados son: start_layer_index = 7, end_layer_index = 15, preserve_good_behavior_weight = 0.9772, steer_bad_behavior_weight = 0.0003, overcorrect_relative_weight = 0.9678 y neighbor_count = 14. El autor indica que el proceso es reproducible y que los scripts y ajustes completos estan en el directorio `reproduce/` del repositorio. La evaluacion reportada por el autor muestra una divergencia KL de 0.0165 frente al modelo original sobre las primeras 100 peticiones de mlabonne/harmless_alpaca, lo que cuantifica cuanto se ha desviado la distribucion de salida del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento con presupuesto de pensamiento configurable en tres niveles (none, low, high), segun la documentacion heredada del modelo base.
- Capacidades de codigo y ingenieria de software, con mejoras declaradas por XHToken en el post-entrenamiento.
- Uso de herramientas (tool calling / function calling) y planificacion multi-paso para flujos de agente.
- Razonamiento sobre contextos largos (sin cifra de tokens publicada).
- Capacidades multilingues limitadas a en y zh segun los metadatos del repositorio.
- Modificacion de comportamiento de rechazo: responde a peticiones que el modelo original rechazaria (4/100 refusals frente a 100/100 del original, medido con el scorer de palabras clave de Heretic).
- No se documentan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Evaluacion de robustez y red-teaming: esta variante sirve como contrapunto controlado para medir cuanto cambia el comportamiento de un modelo tras una ablacion de rechazo, comparando con el original sobre el mismo conjunto de prompts.
- Investigacion sobre alineamiento y edicion de pesos: los hiperparametros ARA publicados y el directorio `reproduce/` permiten replicar el proceso y estudiar la relacion entre capas ablacionadas y comportamientos de seguridad.
- Despliegue en dispositivo con requisitos de baja latencia: al tratarse de un modelo de 1.7B con enfasis declarado en eficiencia de decodificacion, encaja en escenarios de generacion local en portatiles o equipos de gama media, siempre que el caso de uso no requiera salvaguardas estrictas.
- Prototipado de asistentes conversacionales en ingles o chino: la ventana de contexto y el modo de pensamiento configurable permiten ajustar coste frente a calidad en demos y pruebas internas.
- Generacion de codigo en entornos controlados: el soporte declarado de tool calling permite integrarlo en pipelines de asistencia al desarrollo, con revision humana obligatoria dada la ausencia de filtros de seguridad.
- Experimentacion con agentes multi-paso: la planificacion y el uso de herramientas documentados en el modelo base permiten construir prototipos de agentes para tareas acotadas y supervisadas.
- Analisis de contenido sensible en entornos de investigacion: util para estudiar como responde un modelo sin rechazos ante prompts delicados, con las precauciones legales correspondientes.

## Benchmarks y rendimiento

La model card incluye una tabla de rendimiento especifica de la variante Heretic, pero no reproduce cifras numericas de benchmarks estandar (MMLU, HumanEval, GSM8K) en texto; las comparativas del modelo base se presentan solo como graficos SVG en el repositorio de XHToken.

| Metrica | Este modelo | Modelo original (XHToken/Spark-X2.6-1.7B) |
|---|---|---|
| Refusals (KeywordRate, harmful_behaviors test[:100]) | 4/100 | 100/100 |
| Divergencia KL (harmless_alpaca test[:100]) | 0.0165 | 0 (por definicion) |

El autor advierte de que la metrica de refusals es un proxy basado en palabras clave, no una evaluacion semantica ni revisada por humanos. No se han publicado resultados numericos de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 1.7B en FP16 requiere aproximadamente 3.4 GB solo para pesos; en cuantizaciones de 8 bits o 4 bits el requisito baja sustancialmente, pero no se confirman formatos GGUF en el repositorio.
- GPU recomendadas: no se especifican en la informacion proporcionada. La model card del modelo base menciona pruebas en una RTX 4090 con una implementacion optimizada de llama.cpp.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 1.7B, aunque no se publican cifras oficiales de VRAM ni modelos concretos validados.
- Opciones de despliegue: transformers (formato nativo del repositorio); el modelo base referencia una implementacion optimizada de llama.cpp en github.com/XHToken/llama.cpp. No se confirma soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles como cifras; la documentacion del modelo base afirma liderar el throughput de decodificacion entre modelos on-device comparables (Qwen3.5-2B, MiniCPM-2B, LFM2.5-2.6B) en contextos cortos, pero sin numeros en el texto proporcionado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-Uncensored-Peymandc | 1.707.657.216 | no disponible | apache-2.0 | On-device, sin rechazos | Hugging Face (Peymandc) |
| XHToken/Spark-X2.6-1.7B | 1.7B (serie) | no disponible | no disponible en la informacion | On-device, alineado | Hugging Face (XHToken) |
| Qwen3.5-2B | no disponible | no disponible | no disponible | On-device | Citado como referencia por XHToken |
| MiniCPM-2B | no disponible | no disponible | no disponible | On-device | Citado como referencia por XHToken |
| LFM2.5-2.6B | no disponible | no disponible | no disponible | On-device | Citado como referencia por XHToken |

Los tres ultimos modelos se mencionan unicamente como comparadores de throughput en la documentacion del modelo base; no se dispone de sus especificaciones detalladas en la informacion proporcionada.

## Limitaciones y advertencias

- La modificacion Heretic reduce deliberadamente los rechazos: el modelo puede responder a peticiones que el original rechazaria, incluyendo contenido potencialmente danino.
- El autor declara explicitamente que el modelo puede generar contenido inexacto, enganoso, danino o inapropiado, y que sus salidas no deben tratarse como informacion verificada ni como consejo profesional.
- La evaluacion de refusals se basa en coincidencia de palabras clave sobre 100 prompts, no en revision semantica ni humana; los resultados deben interpretarse con cautela.
- Las capacidades y benchmarks del modelo base no han sido re-evaluados en esta variante; solo se han verificado las metricas de rechazo y divergencia KL.
- Idiomas soportados limitados a ingles y chino; no se garantiza un rendimiento adecuado en castellano.
- No se publican cifras de contexto maximo, cuantizaciones soportadas ni requisitos de hardware especificos para esta variante.
- La licencia apache-2.0 permite uso comercial, pero el usuario es responsable de verificar el cumplimiento legal y regulatorio de sus aplicaciones, especialmente dado el caracter sin filtros del modelo.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Peymandc/Spark-X2.6-1.7B-Uncensored-Peymandc
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Heretic (proyecto): https://heretic-project.org
- Implementacion optimizada de llama.cpp de XHToken: https://github.com/XHToken/llama.cpp
- Directorio de reproduccion (dentro del repositorio): `reproduce/README.md`
- Pagina de soporte del autor: https://huggingface.co/spaces/Peymandc/support
- Branding del modelo: https://huggingface.co/datasets/Peymandc/branding/resolve/main/Spark-X2.6-1.7B-Uncensored-Peymandc.png
