# mradermacher/Boulesis-26B-A4B-GGUF

## Resumen

Boulesis-26B-A4B-GGUF es la version cuantizada en formato GGUF del modelo SubMaroon/Boulesis-26B-A4B, publicada por el usuario mradermacher, especializado en convertir pesos a GGUF para inferencia local. Se trata de un modelo de tipo mezcla de expertos (MoE) segun las etiquetas del repositorio, con 25.971.339.550 parametros totales (aproximadamente 26.000 millones) y orientado a roleplay, conversacion y razonamiento. El sufijo "A4B" de la nomenclatura sugiere un numero reducido de parametros activos por token (del orden de 4.000 millones), aunque este dato no se confirma en la informacion disponible.

El modelo base es un merge: las etiquetas incluyen "merge", "gemma4", "heretic" y "uncensored", lo que indica que se ha construido combinando pesos derivados de la familia Gemma y que se ha aplicado algun proceso de eliminacion de rechazos (ablacion o decensurado), ademas de un modo de pensamiento ("thinking", "reasoning"). La licencia declarada es la de Gemma, y el unico idioma soportado declarado es el ingles.

La relevancia de esta publicacion es practica: el repositorio original solo ofrece pesos en safetensors a traves de transformers, mientras que esta version proporciona ficheros GGUF listos para llama.cpp, Ollama, LM Studio o koboldcpp, lo que permite ejecutar un MoE de ~26.000 millones de parametros en hardware de consumo. El repositorio ocupa 173,2 GB en total e incluye seis cuantizaciones estaticas, desde Q2_K (10,9 GB) hasta Q8_0 (27,7 GB). No se han publicado resultados de benchmarks ni datos de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) segun las etiquetas del repositorio; resultado de un merge de modelos de la familia Gemma. Numero de capas, expertos y esquema de atencion: no disponible |
| Parametros totales | 25.971.339.550 (aproximadamente 26B), dato real de safetensors |
| Parametros activos | No confirmado. La nomenclatura "A4B" sugiere del orden de 4.000 millones de parametros activos, pero no se detalla en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF estaticas: Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q6_K, Q8_0. Las etiquetas del repositorio mencionan ademas x-f16, Q3_K_L, Q5_K_S, Q5_K_M e IQ4_XS |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors para transformers) |

## Arquitectura y entrenamiento

La informacion disponible es limitada. Las etiquetas del repositorio indican que el modelo es un MoE ("moe") construido mediante fusion de modelos ("merge") sobre una base etiquetada como "gemma4". No se especifica el numero de expertos, el numero de expertos activos por token, el tipo de atencion (completa, sliding window, lineal) ni la dimension del modelo. Tampoco se documenta si hay decodificacion especulativa, atencion lineal u otra innovacion de eficiencia.

Respecto al entrenamiento, no hay datos publicos en la informacion proporcionada: se desconoce el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o RLVR, y las caracteristicas del tokenizador. Si se conoce el proceso de post-procesado aplicado por el autor del merge: las etiquetas "heretic" y "uncensored" indican que se ha reducido o eliminado el comportamiento de rechazo del modelo original, y las etiquetas "thinking" y "reasoning" apuntan a la presencia de un modo de razonamiento explicito en la generacion. Esta version concreta no reentrena el modelo: mradermacher solo realiza la conversion y cuantizacion a GGUF (quantize_version 2, tensor quantised, convert_type hf) a partir de los pesos del modelo base.

## Capacidades

- Generacion de texto conversacional y roleplay: es el caso de uso principal segun las etiquetas del repositorio ("roleplay", "sillytavern").
- Modo de razonamiento: las etiquetas "thinking" y "reasoning" indican soporte de cadenas de pensamiento explicitas, aunque no se documenta el formato exacto de activacion.
- Conversacion multiturno con rol de sistema y personaje: el tag "conversational" aparece en los metadatos del repositorio.
- Respuestas sin rechazos (uncensored/heretic): el proceso de ablacion aplicado reduce la tasa de negativas a peticiones, lo que afecta a todo tipo de contenido, no solo al creativo.
- Capacidades de codigo, matematicas, uso de herramientas (tool calling) y agentes: no documentadas en la informacion disponible.
- Capacidades de vision o audio: no disponibles. La etiqueta "skip_mmproj" del proceso de cuantizacion indica que no se han generado ficheros de proyector multimodal, coherente con un modelo de solo texto.
- Capacidades multilingues: limitadas al ingles segun el campo "language" del repositorio. No hay evidencia de soporte de castellano.
- Formato de inferencia: compatible con el ecosistema GGUF (llama.cpp y derivados), incluido el uso con plantillas de chat de SillyTavern.

## Casos de uso

- Roleplay y personajes en local con SillyTavern: el modelo esta etiquetado explicitamente para este flujo. La cuantizacion Q4_K_S (16,0 GB) permite mantener conversaciones largas en una GPU de 16-24 GB, y el comportamiento sin rechazos evita interrupciones en tramas de ficcion adulta o violenta.
- Escritura creativa y narrativa larga: con 26.000 millones de parametros totales y un modo de razonamiento, es adecuado para generar capitulos coherentes, mantener voces de personaje consistentes y reescribir pasajes siguiendo instrucciones de estilo.
- Generacion de datos sinteticos de dialogo: util para producir corpus de conversaciones multiturno en ingles para ajuste fino de modelos mas pequenos o para entrenar clasificadores de dialogo. La licencia Gemma impone condiciones sobre el uso de las salidas.
- Investigacion sobre alineacion y red-teaming: al ser un modelo decensurado, sirve como referencia para estudiar que comportamientos reaparecen tras la ablacion de rechazos y para medir la degradacion de capacidades asociada a ese proceso.
- Experimentacion con arquitecturas MoE en hardware de consumo: permite comparar el rendimiento real de un MoE de ~26B totales frente a modelos densos de tamano similar, siempre que se confirme el numero de parametros activos. El interes esta en medir throughput y calidad por vatio en GPUs de gama alta de consumo.
- Prototipado rapido de asistentes conversacionales en ingles: con Ollama o LM Studio se puede levantar un endpoint compatible con la API de OpenAI en minutos usando la cuantizacion Q4_K_S, sin necesidad de infraestructura de servidor.
- Estudio de tecnicas de merge de modelos: el modelo base combina pesos de distintos origenes, por lo que resulta un caso practico para analizar como afecta la fusion de pesos a la coherencia en contextos largos y al seguimiento de instrucciones.
- Base para ajuste fino ligero: aunque esta version es GGUF (poco practica para entrenar), el modelo base en safetensors puede servir como punto de partida para LoRA sobre dominio concreto en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de roleplay (por ejemplo, EQ-Bench o Arena Hard), y el autor de la cuantizacion no aporta mediciones propias mas alla de la grafica comparativa de perplejidad entre tipos de cuantizacion enlazada en la model card.

## Requisitos de hardware

- VRAM estimada por cuantizacion (solo pesos, sin cache KV): Q2_K 10,9 GB; Q3_K_S 12,6 GB; Q3_K_M 13,7 GB; Q4_K_S 16,0 GB; Q6_K 23,3 GB; Q8_0 27,7 GB. Hay que sumar entre 1 y 4 GB adicionales para el contexto y el overhead del runtime, en funcion de la longitud de contexto configurada.
- GPU de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, A4000): viables Q2_K, Q3_K_S, Q3_K_M y, al limite, Q4_K_S con contexto corto.
- GPU de 24 GB (RTX 3090, RTX 4090, L4, A10G): Q4_K_S con holgura y Q6_K con contexto moderado.
- GPU de 32-48 GB (A6000, L40S, RTX 5090): Q8_0 y Q6_K con contexto amplio.
- GPU de 80 GB (A100, H100): cualquier cuantizacion con contexto largo, util si se necesita servir varias sesiones concurrentes.
- Cabe en GPU de consumo: si, en todas las cuantizaciones salvo Q8_0 en tarjetas de 24 GB o menos. Al ser un MoE con un numero reducido de parametros activos (segun la nomenclatura del nombre), es probable que permita offload parcial de expertos a RAM manteniendo una velocidad aceptable, aunque este extremo no esta confirmado en la informacion disponible.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. Para vLLM o TGI seria necesario partir del modelo base en safetensors (SubMaroon/Boulesis-26B-A4B), ya que esos servidores no consumen GGUF de forma nativa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna cuantizacion ni configuracion de hardware.

## Comparativa con modelos similares

Los datos de rendimiento de los modelos alternativos no se han verificado en la informacion disponible y se incluyen solo como referencia de catalogo; conviene comprobarlos en las fichas oficiales antes de tomar decisiones.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Boulesis-26B-A4B (esta ficha) | ~26B | no confirmado (la nomenclatura sugiere ~4B) | no disponible | gemma | GGUF; safetensors en el modelo base |
| Qwen3-30B-A3B | ~30B | ~3B | 128K en la version original (por verificar) | Apache 2.0 | safetensors y GGUF (cuantizaciones de terceros) |
| Gemma 3 27B | ~27B | denso | 128K en la version original (por verificar) | gemma | safetensors y GGUF |
| Mixtral 8x7B | ~47B | ~13B | 32K segun la ficha original | Apache 2.0 | safetensors y GGUF |

La diferencia mas relevante frente a las alternativas es la licencia: Boulesis hereda la licencia Gemma, mas restrictiva que Apache 2.0 en cuanto a obligaciones de atribucion y usos prohibidos. Su ventaja practica es la disponibilidad inmediata de GGUF con seis niveles de cuantizacion y su orientacion declarada a roleplay sin rechazos, un nicho que Qwen3 y Mixtral no cubren de serie.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada, por lo que no es posible estimar su calidad frente a alternativas conocidas. Con 0 descargas y 0 likes en el momento del analisis, tampoco existe validacion por parte de la comunidad.
- Modelo decensurado: las etiquetas "heretic" y "uncensored" indican que se han eliminado los mecanismos de rechazo. Esto eleva el riesgo de generar contenido danino, ilegal o sexual explicito sin filtro, y suele conllevar degradacion de capacidades en tareas de instruccion general.
- Solo ingles: el campo de idioma del repositorio es "en". El rendimiento en castellano no esta documentado y previsiblemente sera bajo o inconsistente.
- Riesgo de alucinacion: no mitigado ni medido. Al ser un merge sin datos de entrenamiento publicados, es probable que herede las alucinaciones de sus modelos de origen, agravadas por el proceso de ablacion.
- Sesgos: no documentados. Un merge de modelos entrenados con corpus web en ingles reproduce sesgos de genero, raza, religion y nacionalidad, y la eliminacion de rechazos puede aumentar la frecuencia de estereotipos en las respuestas.
- Licencia Gemma: el uso comercial esta permitido bajo los Gemma Terms of Use, pero con obligaciones de atribucion, obligacion de distribuir la licencia con el modelo y prohibicion de determinados usos. Es responsabilidad del desplegador revisar las condiciones vigentes y las clausulas de uso prohibido antes de integrarlo en un producto.
- Calidad de las cuantizaciones bajas: Q2_K y Q3_K_S degradan la perplejidad de forma notable segun la grafica de referencia incluida en la model card. Para uso en produccion conviene Q4_K_S o superior. No se han publicado cuantizaciones ponderadas ni con imatrix para este modelo.
- Contexto desconocido: al no documentarse la longitud de contexto soportada, no se puede garantizar el comportamiento en conversaciones largas ni el uso de plantillas de chat especificas.
- Fecha de publicacion reciente y sin mantenimiento: el repositorio se creo el 11 de septiembre de 2026 y se actualizo el mismo dia, sin indicios de revisiones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/Boulesis-26B-A4B-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Boulesis-26B-A4B
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Boulesis-26B-A4B-GGUF
- Repositorio de peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de referencia: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad entre tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable del hosting de la cuantizacion: https://www.nethype.de/
