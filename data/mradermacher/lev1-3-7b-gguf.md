# mradermacher/Lev1-3.7B-GGUF

## Resumen

Lev1-3.7B-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo theaviv/Lev1-3.7B. No se trata por tanto de un modelo entrenado por el autor del repositorio, sino de una distribucion de pesos optimizados para inferencia local mediante llama.cpp y herramientas compatibles. La model card se limita a la plantilla habitual de mradermacher: no describe la arquitectura, el entrenamiento ni el comportamiento esperado del modelo mas alla de los metadatos.

Los metadatos lo etiquetan como modelo de decision y clasificacion (tags decision-model, classification, decision-index, k2-horizon), afinado con LoRA sobre una base denominada Lev1, y entrenado con los datasets theaviv/lev1-decisions y openai/gsm8k. El unico idioma declarado es el ingles. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas.

Su relevancia practica es la de cualquier cuantizacion GGUF: permite ejecutar un modelo de aproximadamente 5.000 millones de parametros en hardware de consumo. Sin embargo, la ausencia total de documentacion tecnica, de resultados de evaluacion y de ejemplos de uso publicados en la informacion disponible hace imprescindible una validacion propia antes de considerarlo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card; el tag de libreria es transformers) |
| Parametros totales | 5.058.255.360 segun los pesos en safetensors del modelo base; el nombre del modelo indica 3,7B, discrepancia no explicada en la informacion disponible |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base theaviv/Lev1-3.7B se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura del modelo base. Los tags indican que se trata de un modelo de decision y clasificacion, construido mediante un adaptador LoRA sobre theaviv/Lev1-3.7B, con referencias a un "decision-index" y a un "k2-horizon". No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documenta la existencia de decodificacion especulativa, atencion lineal u otras innovaciones tecnicas.

El unico dato de entrenamiento verificable son los datasets citados: theaviv/lev1-decisions, presumiblemente el corpus especifico de decisiones, y openai/gsm8k, un conjunto de problemas matematicos de nivel escolar. La combinacion sugiere un entrenamiento orientado a razonamiento aritmetico aplicado a la seleccion o clasificacion de decisiones, pero se trata de una inferencia a partir de los metadatos, no de una afirmacion documentada por el autor.

En cuanto al repositorio de cuantizaciones, la model card indica quantize_version 2, output_tensor_quantised 1 y convert_type hf, con cuantizaciones estaticas. No hay cuantizaciones ponderadas ni con matriz de importancia (imatrix) publicadas por el autor en el momento de la consulta.

## Capacidades

- Clasificacion y toma de decisiones: los tags del modelo apuntan a un uso como decision-model con un indice de decisiones asociado, aunque no se documenta el formato exacto de entrada y salida.
- Razonamiento matematico: el entrenamiento incluye openai/gsm8k, lo que indica capacidad para resolver problemas aritmeticos de varios pasos.
- Generacion de texto conversacional: el repositorio incluye el tag conversational y endpoints_compatible.
- Idiomas: unicamente ingles declarado. No hay soporte multilingue documentado.
- Tool calling y function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (vision, audio): no disponible (no documentadas).
- Modo de razonamiento explicito (thinking mode): no disponible (no documentado).

## Casos de uso

- Clasificacion automatizada de decisiones en pipelines internos: el modelo puede emplearse como clasificador dentro de un flujo que reciba una descripcion textual en ingles y devuelva una categoria de decision, aprovechando su etiquetado como decision-model y su licencia Apache 2.0. Requiere definir y validar el esquema de etiquetas por cuenta propia, ya que no esta documentado.
- Filtrado y enrutado de peticiones: por su naturaleza de modelo de decision, encaja como componente de enrutado que decida que subsistema debe atender una consulta, ejecutandose en local con cuantizacion Q4_K_M de 3,3 GB.
- Verificacion de respuestas aritmeticas: dado su entrenamiento sobre GSM8K, puede usarse como comprobador secundario de resultados numericos generados por otro modelo en un sistema de doble comprobacion.
- Prototipado en estaciones de trabajo sin GPU dedicada: con cuantizaciones de 2,2 a 3,3 GB puede ejecutarse en CPU mediante llama.cpp, lo que permite validar el comportamiento del modelo antes de invertir en infraestructura.
- Experimentacion academica sobre modelos de decision: al ser una cuantizacion de un modelo pequeno y con licencia permisiva, sirve como punto de partida reproducible para estudiar tecnicas de clasificacion y decision con LoRA.
- Servicio local con requisitos de privacidad: al no requerir conexion a APIs externas y caber en GPUs de consumo, es apto para entornos donde los datos no pueden salir de la organizacion, siempre que el caso de uso este acotado al ingles y a tareas de clasificacion.
- Evaluacion comparativa interna: puede incorporarse como linea base en pruebas A/B frente a clasificadores especializados, dado su tamano reducido y su coste de inferencia bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico resultado de busqueda relacionado es una pagina comparativa de benchlm.ai entre Agents-A1-Q8_0-GGUF y Lev1 3.7B que indica explicitamente que no existen resultados de benchmark compartidos entre ambos modelos.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin cache KV ni overhead): Q2_K 2,2 GB; Q3_K_S 2,5 GB; Q3_K_M 2,7 GB; Q3_K_L 2,9 GB; IQ4_XS 3,0 GB; Q4_K_S 3,1 GB; Q4_K_M 3,3 GB; Q5_K_S y Q5_K_M 3,7 GB; Q6_K 4,3 GB; Q8_0 5,5 GB; f16 10,2 GB.
- VRAM total recomendada con contexto moderado: en torno a 4-6 GB para Q4_K_M, 6-8 GB para Q8_0 y 12 GB o mas para f16, sumando cache KV y overhead del runtime. Estas cifras son estimaciones derivadas de los tamanos de fichero publicados, no datos del autor.
- GPU recomendadas: cualquier GPU de consumo con 6 GB o mas de VRAM para cuantizaciones Q4 (RTX 3060, RTX 4060, RTX 2070 en adelante); 8-12 GB para Q6_K y Q8_0 (RTX 3070, RTX 4070, RTX 3080); f16 requiere 16 GB o mas (RTX 4080, RTX 4090, A100 40 GB, H100).
- Viabilidad en GPU de consumo: si, es viable. La cuantizacion Q4_K_M (3,3 GB, marcada como "fast, recommended" por el autor) cabe en practicamente cualquier GPU dedicada moderna y en equipos con iGPU y memoria unificada (Apple Silicon, APUs recientes).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime que consuma GGUF. El soporte de GGUF en vLLM es limitado y experimental; para vLLM o TGI seria preferible partir del modelo base en safetensors.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Lev1-3.7B-GGUF | 5.058.255.360 (segun safetensors del base) | no disponible | no disponible | apache-2.0 | GGUF, 293 descargas |
| theaviv/Lev1-3.7B | 5.058.255.360 | no disponible | no disponible | apache-2.0 | safetensors (modelo base) |
| Agents-A1-Q8_0-GGUF | no disponible | no disponible | no disponible | no disponible en la informacion consultada | GGUF |
| Otros modelos de clasificacion de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de parametros, contexto, rendimiento ni licencia de alternativas comparables en la informacion proporcionada, salvo la referencia de benchlm.ai a Agents-A1-Q8_0-GGUF, para la que no se publican resultados compartidos. La comparativa queda por tanto limitada a la relacion entre el repositorio cuantizado y su modelo base.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe el formato de entrada, el esquema de salida, el template de prompt ni el proposito exacto del "decision-index". Sin ingenieria inversa o pruebas empiricas no es posible saber como invocar el modelo correctamente.
- Discrepancia de nomenclatura: el nombre indica 3,7B pero los pesos suman 5.058.255.360 parametros. Hay que verificar el presupuesto real de memoria antes de dimensionar infraestructura.
- Riesgo de alucinacion: no cuantificado. No hay evaluaciones publicadas que permitan acotar la tasa de error en ninguna tarea.
- Idiomas: solo ingles. No hay evidencia de soporte para castellano ni para ninguna otra lengua, por lo que no es adecuado para aplicaciones en espanol sin validacion previa.
- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluacion de sesgos, toxicidad o equidad.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar avisos de licencia y atribucion. No se han identificado clausulas adicionales, pero conviene revisar tambien la licencia del modelo base y de los datasets de entrenamiento antes de un despliegue comercial.
- Idoneidad para produccion: limitada sin datos de evaluacion. Al no existir benchmarks publicados, cualquier uso en produccion exige construir un conjunto de validacion propio y medir precision, recall y calibrate de confianza por clase.
- Riesgo de cuantizacion: las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad respecto a Q4 y superiores; el propio autor advierte "lower quality" en Q3_K_M. Para clasificacion, donde cambios pequenos en los logits alteran la etiqueta, conviene partir de Q5_K_M o Q6_K.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede planificar el uso con entradas largas ni estimar el consumo de memoria de la cache KV.
- Fecha de publicacion inusual: los metadatos indican creacion y actualizacion el 2026-10-14. Conviene verificar la vigencia del repositorio antes de depender de el.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lev1-3.7B-GGUF
- Modelo base: https://huggingface.co/theaviv/Lev1-3.7B
- Dataset de decisiones: https://huggingface.co/datasets/theaviv/lev1-decisions
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Pagina de resumen de descargas del autor: https://hf.tst.eu/model#Lev1-3.7B-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa en benchlm.ai: https://benchlm.ai/compare/agents-a1-q8-0-gguf-vs-decision-index-0-3-lev1-3-7b
- Grafica de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
