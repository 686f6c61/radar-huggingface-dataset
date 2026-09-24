# mradermacher/Lumo-1-1.5B-Chat-GGUF

## Resumen

Lumo-1-1.5B-Chat-GGUF es la version cuantizada en formato GGUF del modelo conversacional vpakarinen/Lumo-1-1.5B-Chat, publicada por mradermacher, un autor conocido por generar y distribuir cuantizaciones listas para usar de modelos abiertos. El repositorio no contiene pesos originales, sino una coleccion de ficheros GGUF con distintos niveles de compresion, desde Q2_K (0,8 GB) hasta f16 (3,1 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluidas CPU y GPUs de gama de entrada.

El modelo cuenta con 1.510.019.072 parametros totales (aproximadamente 1,5 mil millones), esta etiquetado como fine-tuned y conversational, y se distribuye bajo licencia Apache 2.0. Su idioma declarado es unicamente el ingles. La model card no documenta la arquitectura interna, la longitud de contexto, el dataset de entrenamiento ni los procesos de alineacion empleados, por lo que buena parte de las especificaciones tecnicas no estan disponibles.

Su relevancia practica reside en el formato: al ser GGUF, se integra directamente con llama.cpp, Ollama y otros runners ligeros, y su rango de tamanos (0,8-3,1 GB) lo hace apto para despliegues en local sin GPU dedicada o con GPUs de 4-8 GB de VRAM. Es, por tanto, una opcion de interes para prototipado rapido y entornos con restricciones severas de recursos, mas que para cargas de produccion de alta exigencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta "apertus" en el repositorio, sin confirmar por el autor) |
| Parametros totales | 1.510.019.072 (aproximadamente 1,5 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tambien transformado con convert_type: hf y output_tensor_quantised: 1, quantize_version: 2) |
| Modelo base | vpakarinen/Lumo-1-1.5B-Chat |
| Libreria declarada | transformers |
| Tamano del repositorio | 14,1 GB (suma de todas las cuantizaciones) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. La model card del repositorio cuantizado no describe el tipo de red (transformer, MoE, SSM o hibrida), el numero de capas, la dimension oculta, el mecanismo de atencion ni la estrategia de tokenizacion. Tampoco se detalla el proceso de entrenamiento: no hay datos sobre el volumen de tokens, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion.

El unico dato tecnico aportado por el publicador se refiere al proceso de cuantizacion, no al entrenamiento: la conversion se realizo con quantize_version 2, convert_type hf y output_tensor_quantised 1, y las etiquetas del repositorio incluyen "apertus", "fine-tuned" y "conversational". El autor indica ademas que no hay cuantizaciones ponderadas con imatrix disponibles y que no tiene previsto generarlas, aunque acepta peticiones mediante la seccion de discusiones. El modelo base figura como fine-tuned, lo que sugiere un ajuste posterior sobre un modelo preentrenado, pero se desconoce cual.

## Capacidades

- Generacion de texto conversacional en ingles: el modelo esta etiquetado como "conversational" y "fine-tuned", orientado a dialogos multi-turno.
- Instrucciones y respuesta a preguntas en ingles: no se documentan capacidades especificas ni formatos de prompt recomendados.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponibles.
- Ejecucion local en CPU y GPU de gama baja gracias al formato GGUF y a tamanos de fichero de 0,8-3,1 GB.

## Casos de uso

- Prototipado de asistentes conversacionales en local: con la cuantizacion Q4_K_M (1,1 GB), el modelo se puede cargar en un portatil sin GPU dedicada y servir como chatbot de pruebas para validar flujos de interfaz y formato de prompts antes de migrar a un modelo mayor.
- Aplicaciones de escritorio o embebidas con recursos limitados: al ocupar menos de 2 GB en Q5_K_M, es viable integrarlo en herramientas de escritorio, plugins de editor o dispositivos con 4 GB de RAM, donde un modelo de 7 B o superior no cabria.
- Generacion de texto auxiliar en ingles: redaccion de resúmenes cortos, respuestas plantilla o variaciones de texto donde no se requiere razonamiento complejo y se prioriza la latencia baja.
- Filtrado y clasificacion ligera de textos en ingles: al ser un modelo pequeno, puede usarse para tareas de etiquetado rapido o preclasificacion dentro de un pipeline mayor, reservando el modelo grande para los casos ambiguos.
- Entornos educativos y de investigacion: sirve como banco de pruebas para experimentar con cuantizaciones GGUF, comparar niveles de compresion (Q2_K frente a Q8_0) y medir el impacto en la calidad de salida sin necesidad de infraestructura costosa.
- Despliegue en el borde (edge computing): su huella reducida permite ejecutarlo en mini-PC, Raspberry Pi con suficiente RAM o contenedores con limites estrictos de memoria, ofreciendo generacion de texto offline sin dependencia de APIs externas.
- Pruebas de integracion con llama.cpp u Ollama: util para validar pipelines de inferencia, plantillas de chat y gestion de contexto antes de escalar a un modelo mayor dentro de la misma familia de herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye valores de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni para el modelo original ni para las cuantizaciones. Tampoco se proporcionan mediciones de perplexity por tipo de cuantizacion; el autor unicamente enlaza un grafico externo de comparacion de tipos de cuantizacion de baja calidad elaborado por ikawrakow.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB con Q4_K_M o Q5_K_M; alrededor de 1,7-2,2 GB con Q8_0; y en torno a 3,5-4,5 GB con f16 (estimaciones derivadas del tamano de fichero mas la cache KV, que depende del contexto configurado).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente incluso en f16; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan con margen amplio. Para f16 en produccion no se justifica hardware de centro de datos.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo actual (GTX 1650 4 GB en adelante) usando cuantizaciones Q4 o Q5, y tambien en GPUs integradas con memoria compartida suficiente.
- Ejecucion en CPU: viable con llama.cpp; la cuantizacion Q4_K_S o Q4_K_M (1,0-1,1 GB) es la recomendada por el autor por su velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp y cualquier runtime compatible con GGUF. El repositorio esta etiquetado como endpoints_compatible. Para vLLM o TGI seria preferible partir de los pesos originales en safetensors del modelo base, no de los GGUF.
- Latencia y throughput estimados: no disponibles. No se aportan mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La comparativa se elabora a partir de informacion publica de los model cards de cada modelo; no procede de la informacion proporcionada sobre este repositorio.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lumo-1-1.5B-Chat-GGUF | 1,51 B | no disponible | Apache 2.0 | GGUF | Solo ingles; sin benchmarks publicados; 12 niveles de cuantizacion |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF (terceros) | Multilingue, con benchmarks publicados por el autor |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF (terceros) | Multilingue; licencia con restricciones para grandes despliegues |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF (terceros) | Entrenado sobre datos abiertos; benchmarks publicados |

En ausencia de benchmarks del modelo Lumo, no es posible establecer una comparacion de rendimiento objetiva con estas alternativas. Los tres modelos de referencia cuentan con documentacion tecnica mas completa (arquitectura, dataset y evaluaciones), lo que supone una ventaja a la hora de evaluar su idoneidad para produccion.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se publican arquitectura, contexto maximo, dataset de entrenamiento ni proceso de alineacion, lo que impide evaluar riesgos y rendimiento con criterios objetivos.
- Sin benchmarks: no hay ninguna evaluacion publicada, ni del modelo original ni de las cuantizaciones, por lo que no se puede comparar su calidad con alternativas.
- Riesgo de alucinacion: previsiblemente elevado dado el reducido tamano del modelo (1,5 B), aunque no hay mediciones que lo cuantifiquen.
- Sesgos conocidos: no disponibles. Al no documentarse la composicion del dataset, se desconoce el origen de los datos y los sesgos que puedan arrastrar.
- Limitacion idiomatica: solo se declara soporte de ingles. El uso en castellano no esta respaldado por el autor y probablemente degrade la calidad de forma significativa.
- Contexto limitado o desconocido: al no indicarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion con documentos extensos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion con atribucion, pero se aplica al repositorio de cuantizaciones; conviene verificar la licencia del modelo base vpakarinen/Lumo-1-1.5B-Chat, que figura tambien como apache-2.0.
- Etiqueta "apertus": sugiere una posible vinculacion con esa familia de modelos, pero el autor no lo confirma ni detalla la relacion, por lo que no debe asumirse ningun linaje concreto.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la recogida de datos, y fechas de creacion y actualizacion en los metadatos (23 de septiembre de 2026) posteriores a la fecha habitual de publicacion, lo que reduce la confianza en su mantenimiento y en la validacion por parte de la comunidad.
- Cuantizaciones de muy baja precision: Q2_K y Q3_K_S degradan la calidad de forma notable segun la propia grafica de referencia del autor; para uso real se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Lumo-1-1.5B-Chat-GGUF
- Modelo base: https://huggingface.co/vpakarinen/Lumo-1-1.5B-Chat
- Pagina de resumen y lista de descargas del autor: https://hf.tst.eu/model#Lumo-1-1.5B-Chat-GGUF
- Peticiones y preguntas sobre cuantizaciones: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del publicador: https://www.nethype.de/

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces obtenidos correspondian a contenido no relacionado y se han descartado. No se han encontrado papers, blogs tecnicos ni demos adicionales.
