# guga112/gemma-4-E4B-it-heretic-QAT-GGUF

## Resumen

guga112/gemma-4-E4B-it-heretic-QAT-GGUF es una version cuantizada en formato GGUF del modelo coder3101/gemma-4-E4B-it-qat-q4_0-unquantized-heretic, que a su vez deriva de google/gemma-4-E4B-it. El elemento diferencial es la aplicacion de Heretic (v1.2.0) con abliteracion ARA (Ablation of Refusal Activations) mas Row-Norm sobre las capas 20 a 36 del transformer, lo que elimina las activaciones de rechazo y da como resultado un modelo sin censura orientado a generacion conversacional sin filtros de seguridad.

El modelo tiene 7.463.013.674 parametros totales segun los pesos en safetensors, aunque la model card lo etiqueta como "4.5B Effective" bajo la denominacion E4B, lo que sugiere activacion selectiva de parametros. El repositorio publicado contiene unicamente pesos GGUF cuantizados a Q4_0, con un tamano de repositorio de 5.2 GB y un fichero de aproximadamente 4 GB, lo que lo situa en el rango de despliegue en movil y dispositivos edge.

Su relevancia actual es doble: por un lado ocupa un nicho muy concreto (modelos pequenos, sin censura, cuantizados con QAT para consumo en hardware limitado); por otro, es un ejemplo practico de la cadena de derivacion tipica en el ecosistema open source (modelo base de Google, abliteracion por un tercero, cuantizacion GGUF por otro). Conviene senalar que el repositorio no tiene descargas ni likes y fue creado el 11 de septiembre de 2026, por lo que carece de validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer generativo de la familia Gemma 4 (denominacion E4B); nivel de detalle de atencion, numero de capas y tipo de activacion no disponibles |
| Parametros totales | 7.463.013.674 (dato real de los pesos en safetensors) |
| Parametros activos | Aproximadamente 4.5B efectivos segun la model card; desglose por forward pass no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 en GGUF (QAT); no se listan otras cuantizaciones en la informacion disponible |
| Idiomas soportados | Ingles (en), chino (zh) y multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado), derivado de pesos safetensors sin cuantizar |

Otros datos: autor guga112, pipeline no declarado, 0 descargas, 0 likes, creado el 2026-09-11, tamano de repositorio 5.2 GB.

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Gemma 4 en su variante E4B, segun se deduce del identificador y de los tags (gemma4). La model card no documenta el numero de capas, la configuracion de atencion, la dimension del hidden state ni la ventana de contexto, por lo que no es posible detallar la arquitectura interna a partir de la informacion disponible. La denominacion E4B junto con los 7,46 mil millones de parametros totales apunta a un esquema de activacion selectiva de parametros (del orden de 4,5B efectivos segun la propia model card), pero la informacion proporcionada no especifica el mecanismo concreto.

La innovacion tecnica relevante no esta en el entrenamiento sino en el post-procesado. En primer lugar, el modelo base coder3101/gemma-4-E4B-it-qat-q4_0-unquantized-heretic aplica Heretic v1.2.0 con abliteracion ARA combinada con Row-Norm sobre el rango de capas 20 a 36, con los siguientes hiperparametros: preserve_good_behavior_weight 0.5805, steer_bad_behavior_weight 0.0023, overcorrect_relative_weight 0.7764 y neighbor_count 13. Esta tecnica proyecta fuera del espacio de activaciones las direcciones asociadas a respuestas de rechazo, reduciendo la tendencia del modelo a declinar peticiones. En segundo lugar, guga112 toma esos pesos abliterados y los cuantiza a Q4_0 en GGUF, partiendo originalmente de pesos entrenados con Quantization-Aware Training (QAT), lo que en teoria reduce la perdida de calidad respecto a una cuantizacion post-hoc convencional. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, con la etiqueta conversational en el repositorio.
- Modelo de instrucciones (sufijo it), por lo que esta preparado para seguir indicaciones y mantener formato de dialogo.
- Capacidad multilingue declarada, con soporte explicito de ingles y chino y etiqueta generica multilingual.
- Generacion sin filtros de seguridad: la abliteracion elimina las activaciones de rechazo, de modo que responde a peticiones que el modelo base declinaria. Esto es una capacidad y simultaneamente el principal riesgo (ver limitaciones).
- Compatibilidad declarada con endpoints de Hugging Face (tag endpoints_compatible).
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling y uso de agentes: no disponibles en la informacion proporcionada. La model card no documenta ninguna de ellas.
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistente conversacional autoalojado en movil o dispositivo edge: con un fichero Q4_0 de aproximadamente 4 GB, el modelo se puede ejecutar en telefonos de gama alta o mini-PC mediante llama.cpp, sin enviar datos a servicios externos.
- Generacion de texto creativo sin restricciones tematicas: la abliteracion permite abordar ficcion con violencia, contenido adulto o temas sensibles sin que el modelo se niegue, algo que el Gemma 4 E4B original bloquearia. Apropiado para escritura de ficcion y guiones.
- Procesamiento de texto en ingles y chino en pipelines locales: el soporte declarado de ambos idiomas permite usarlo para traduccion asistida, resumen o clasificacion en entornos bilingues sin salida a la nube.
- Prototipado rapido de aplicaciones de chat sin coste de API: al ser un GGUF pequeno, se puede desplegar en una unica GPU consumer o incluso en CPU con llama.cpp, lo que abarata la fase de validacion de producto.
- Analisis de contenido y moderacion inversa: util como modelo de referencia para estudiar que respuestas produce un modelo abliterado frente a uno alineado, en investigacion sobre seguridad y alineacion.
- Inferencia offline en entornos sin conectividad: escenarios de campo, industria o sanidad con requisitos de aislamiento de red, donde el tamano de 4 GB permite distribucion en USB o despliegue en equipos modestos.
- Base para fine-tuning posterior en dominio especifico: al estar en Apache 2.0 y ser un modelo de 7,46B totales, es viable ajustarlo con LoRA en una sola GPU, siempre que se revise la interaccion con los terminos del modelo original de Google.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluacion, y los resultados de busqueda web no aportan datos adicionales sobre el modelo. Tampoco se documenta el impacto de la abliteracion sobre capacidades generales ni la degradacion introducida por la cuantizacion Q4_0.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 a 6 GB con contexto moderado, partiendo del fichero Q4_0 de unos 4 GB mas la cache KV. Es una estimacion derivada del tamano de pesos publicado, no un dato medido por el autor.
- Tamano en disco: el repositorio completo ocupa 5,2 GB; el fichero cuantizado se describe como de 4 GB en la model card.
- GPU consumer compatibles: cualquier tarjeta con 6 GB o mas de VRAM, como RTX 3060, RTX 4060, RTX 2070 o superiores; tambien cabe en iGPU con memoria unificada.
- GPU de datacenter: no es necesario A100 ni H100 para este tamano; bastaria una T4, L4 o incluso CPU.
- Ejecucion en CPU: viable con llama.cpp en equipos con 8 GB de RAM o mas, con throughput bajo pero funcional para uso interactivo no intensivo.
- Movil y edge: el autor etiqueta explicitamente el modelo como apto para movil, dado el tamano de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. El tag endpoints_compatible indica compatibilidad con los Inference Endpoints de Hugging Face. El soporte de GGUF en vLLM o TGI es limitado o no aplicable del todo; para produccion con alto throughput convendria reconvertir a safetensors.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| guga112/gemma-4-E4B-it-heretic-QAT-GGUF | 7,46B totales / ~4,5B efectivos | no disponible | Q4_0 GGUF | Apache 2.0 | Publicado, 0 descargas |
| coder3101/gemma-4-E4B-it-qat-q4_0-unquantized-heretic | no disponible | no disponible | pesos sin cuantizar derivados de QAT q4_0 | no disponible | Modelo base intermedio de la cadena |
| google/gemma-4-E4B-it | misma familia E4B | no disponible | safetensors originales | no disponible | Modelo base original, con alineacion de seguridad intacta |

La diferencia funcional principal frente al modelo de Google es la abliteracion: el modelo de Google mantiene los filtros de rechazo y el de guga112 los elimina. La diferencia frente al modelo intermedio de coder3101 es unicamente el formato y la cuantizacion (GGUF Q4_0 frente a pesos sin cuantizar). No se dispone de datos de rendimiento de ninguno de los tres en la informacion proporcionada, por lo que no es posible comparar calidad.

## Limitaciones y advertencias

- La abliteracion degrada habitualmente la coherencia en tareas de razonamiento complejo y puede aumentar la tasa de respuestas incoherentes o divagantes, aunque no hay mediciones publicadas para este modelo concreto.
- Ausencia total de filtros de seguridad: el modelo puede generar contenido danino, ilegal, ofensivo o sexual sin restricciones. No es apto para productos orientados a publico general sin una capa externa de moderacion.
- Riesgo de alucinacion no evaluado. No se han publicado mediciones de fidelidad factual ni de tasa de invencion.
- Idiomas: solo se declaran ingles y chino como idiomas con soporte; el rendimiento en castellano no esta documentado y podria ser notablemente inferior.
- Longitud de contexto desconocida, lo que impide planificar casos de uso con documentos largos o conversaciones extensas.
- Licencia: el repositorio se publica bajo Apache 2.0, pero el modelo deriva de google/gemma-4-E4B-it, cuyos terminos de uso no se detallan en la informacion proporcionada. Antes de un uso comercial conviene verificar la compatibilidad de la licencia derivada con los terminos del modelo original de Google.
- Falta de validacion: 0 descargas, 0 likes y creacion el 2026-09-11. No hay evidencia de que los ficheros GGUF hayan sido probados por terceros.
- La model card incluye enlaces a un repositorio con usuario distinto (SC117) para la documentacion en chino, lo que sugiere cierta desorganizacion en la publicacion.
- No se documentan hiperparametros de generacion recomendados ni plantilla de chat, lo que puede provocar resultados pobres si se usa la plantilla por defecto de la herramienta de despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/guga112/gemma-4-E4B-it-heretic-QAT-GGUF
- Documentacion en chino referenciada en la model card: https://huggingface.co/SC117/gemma-4-E4B-it-heretic-QAT-GGUF/blob/main/README_zh.md
- Modelo base intermedio: https://huggingface.co/coder3101/gemma-4-E4B-it-qat-q4_0-unquantized-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-E4B-it
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
