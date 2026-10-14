# mradermacher/K2-Horizon-0.9B-heretic-GGUF

## Resumen

El repositorio `mradermacher/K2-Horizon-0.9B-heretic-GGUF` contiene un conjunto de cuantizaciones GGUF estáticas del modelo `Avicennasis/K2-Horizon-0.9B-heretic`, publicadas por mradermacher, un conocido autor de cuantizaciones para llama.cpp. No se trata de un modelo entrenado desde cero, sino de una versión distribuible y optimizada para inferencia local del modelo base, cuyo tokenizador y arquitectura original no se documentan en la información disponible. El repositorio ocupa 9,7 GB en total, repartidos entre doce ficheros GGUF que van desde 0,5 GB (Q2_K) hasta 2,3 GB (f16), y el modelo base suma 1.078.285.824 parámetros según los safetensors publicados.

El interés principal de esta ficha es doble. Por un lado, es un modelo de aproximadamente 1,08 mil millones de parámetros, un rango que permite ejecución en CPU y en GPUs de gama baja, con un coste de memoria muy reducido (menos de 1 GB en Q4_K_M). Por otro, incorpora los marcadores `abliterated`, `uncensored` y `heretic`, que indican que el modelo base ha sufrido un proceso de eliminación de direcciones de rechazo en el espacio de activaciones, es decir, una variante sin los mecanismos habituales de negativa a responder. Esto lo hace relevante para investigación sobre alineamiento, seguridad y comportamiento de modelos, y no tanto para despliegues de producción orientados al usuario final.

La licencia declarada es Apache 2.0, heredada del modelo base, y los idiomas soportados son inglés y chino. La model card del repositorio de cuantización es puramente mecánica: documenta los ficheros, los tipos de cuantización y el proceso de conversión, pero no aporta información sobre arquitectura, datos de entrenamiento, contexto o evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo indica compatibilidad con llama.cpp vía formato GGUF) |
| Parametros totales | 1.078.285.824 (dato de safetensors del modelo base) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye presumiblemente en safetensors, no confirmado en la información disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `Avicennasis/K2-Horizon-0.9B-heretic`. El único dato técnico fiable es que existe una conversión GGUF funcional producida por mradermacher, lo que implica que la arquitectura está soportada por llama.cpp y sigue un esquema de transformer decoder-only con atención estándar; sin embargo, no se especifica número de capas, dimensión de hidden state, número de cabezas de atención, tipo de normalización ni mecanismo de positional encoding. Tampoco se documenta la longitud de contexto soportada.

Respecto al entrenamiento, no hay información sobre el número de tokens, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento. El nombre y las etiquetas del modelo (`heretic`, `abliterated`, `uncensored`) apuntan a que el modelo base ha sido sometido a una intervención posterior al entrenamiento destinada a eliminar la dirección de rechazo en las activaciones, una técnica de "abliteration" popularizada por herramientas como Heretic. Dicha intervención no se documenta en el repositorio de cuantización, y no se especifica si se aplicó sobre un modelo afinado por instrucciones o sobre una base preentrenada. El repositorio incluye además cuantizaciones con matriz de importancia (imatrix) en un repositorio separado, etiquetadas como `i1-GGUF`.

## Capacidades

- Generación de texto conversacional en inglés y chino, según los idiomas declarados en los metadatos.
- Formato de prompt conversacional (etiqueta `conversational` en HuggingFace), orientado a diálogo multi-turno.
- Comportamiento sin rechazo: gracias a la abliteración, el modelo no aplica las negativas habituales ante peticiones sensibles, lo que constituye una capacidad diferencial respecto al modelo original.
- Cuantización flexible: doce variantes GGUF permiten ajustar el equilibrio entre tamaño, velocidad y calidad, desde 0,5 GB hasta 2,3 GB.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de infraestructura de inferencia estándar.
- No hay evidencia de soporte de tool calling, function calling, agentes multi-paso, razonamiento extendido, visión, audio ni modo de pensamiento en la información disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo se comporta una red de ~1B parámetros tras eliminar la dirección de rechazo, comparando respuestas con el modelo original para cuantificar el efecto de la abliteración sobre las tasas de negativa.
- Red-teaming y evaluación de guardarraíles: sirve como generador adversarial de bajo coste para probar clasificadores de contenido o filtros de entrada en pipelines de moderación, ya que su reducido tamaño permite ejecutarlo en paralelo con otros sistemas.
- Generación de datos sintéticos: puede producir grandes volúmenes de texto en inglés y chino a muy bajo coste computacional, útil para aumentar datasets de entrenamiento o para tareas de destilación, siempre que se revise la calidad y el contenido generado.
- Prototipado y pruebas de pipelines GGUF: al ofrecer doce niveles de cuantización del mismo modelo, es un candidato idóneo para medir el impacto de Q2_K frente a Q8_0 en perplejidad y coherencia, o para validar despliegues con llama.cpp, Ollama o LM Studio antes de escalar a modelos mayores.
- Chat local sin conexión en hardware modesto: con Q4_K_M ocupando 0,8 GB, el modelo cabe en cualquier portátil y puede ejecutarse íntegramente en CPU, lo que permite asistentes de conversación offline en entornos sin GPU y sin acceso a red.
- Traducción y generación de texto informal inglés-chino: para borradores, resúmenes o reformulaciones de baja criticidad donde no se requiera precisión profesional, aprovechando que ambos idiomas están declarados como soportados.
- Base para fine-tuning ligero: al ser un modelo Apache 2.0 de ~1B parámetros, es viable ajustarlo con LoRA en una única GPU de consumo para dominios concretos (soporte técnico, clasificación, estilo), partiendo de una versión cuantizada para inferencia y del modelo base para el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra métrica, y tampoco se han encontrado datos de evaluación del modelo base `Avicennasis/K2-Horizon-0.9B-heretic` en la búsqueda web realizada. Cualquier cifra de rendimiento que se atribuya a este modelo carecería de respaldo documental.

## Requisitos de hardware

- VRAM estimada para inferencia (según el tamaño de fichero declarado): Q2_K 0,5 GB, Q3_K_S y Q3_K_M 0,6 GB, Q3_K_L e IQ4_XS 0,7 GB, Q4_K_S 0,7 GB, Q4_K_M 0,8 GB, Q5_K_S y Q5_K_M 0,9 GB, Q6_K 1,0 GB, Q8_0 1,2 GB, f16 2,3 GB. Hay que añadir el espacio de la caché KV, que depende del contexto configurado y que no puede estimarse sin conocer la arquitectura.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente incluso en Q8_0. Modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque están sobredimensionados para este modelo.
- Cabe en GPU de consumo: sí, en todas las generaciones recientes. Incluso en Q8_0 cabe en GPUs integradas con memoria unificada o en iGPUs con 2 GB asignados. El f16 también cabe en cualquier GPU dedicada de gama baja.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, llama-cpp-python y servidores compatibles con la API de OpenAI sobre GGUF. El soporte de vLLM para GGUF es limitado y no está confirmado para esta arquitectura concreta.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones, y sin conocer la arquitectura no es posible estimar tokens por segundo con rigor. Como referencia cualitativa, un modelo de ~1B parámetros en Q4_K_M sobre CPU moderna suele superar la velocidad de lectura humana, pero se trata de una observación general y no de un dato medido para este modelo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base, por lo que la comparación cuantitativa no puede realizarse con rigor. La siguiente tabla recoge únicamente los datos verificables del modelo analizado; las celdas de los modelos alternativos se dejan como "no disponible" al no proceder de la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de benchmark |
|---|---|---|---|---|---|
| K2-Horizon-0.9B-heretic (GGUF de mradermacher) | 1.078.285.824 | no disponible | Apache 2.0 | GGUF (12 cuantizaciones) | no disponible |
| Modelo base Avicennasis/K2-Horizon-0.9B-heretic | no disponible (el nombre sugiere ~0,9B) | no disponible | Apache 2.0 (heredada según el repo de cuantización) | no disponible | no disponible |
| Alternativas de ~1B (por ejemplo, familias Llama 3.2 1B, Qwen2.5 1.5B, Gemma 2 2B) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

La única comparación defendible con los datos disponibles es funcional: este modelo se distingue de las alternativas de su rango por ser una variante abliterada y por ofrecer un abanico excepcionalmente amplio de cuantizaciones GGUF publicadas por el mismo autor.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se conocen arquitectura, contexto, datos de entrenamiento ni evaluación. Cualquier decisión de producción basada en este modelo se tomaría sin información verificable sobre su comportamiento.
- Sesgos conocidos: no documentados. No obstante, un modelo entrenado predominantemente en inglés y chino, sin información sobre la composición del dataset, presenta un riesgo alto de sesgos culturales y lingüísticos no medidos.
- Riesgo de alucinación: elevado por su tamaño (~1B parámetros) y por la ausencia de evaluación. No debe usarse para tareas que requieran precisión factual sin verificación humana.
- Contenido sin filtros: las etiquetas `abliterated`, `uncensored` y `heretic` indican que se han eliminado los mecanismos de rechazo. El modelo puede generar contenido dañino, ilegal o sensible ante peticiones que un modelo alineado rechazaría. No es adecuado para aplicaciones orientadas al público sin capas adicionales de moderación.
- Limitaciones de contexto e idioma: solo inglés y chino declarados; el castellano no figura entre los idiomas soportados, por lo que su rendimiento en español es impredecible. La longitud de contexto es desconocida, lo que impide planificar conversaciones largas o procesamiento de documentos extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero la licencia del modelo base no está verificada de forma independiente, y el proceso de abliteración puede introducir consideraciones legales o de responsabilidad según la jurisdicción y el uso previsto.
- Caveat de producción: un modelo de 1B parámetros con alineamiento eliminado no es un sustituto de un modelo mayor alineado. Su uso razonable es la investigación, el prototipado y la generación de datos controlada, no la atención directa a usuarios finales.
- Trazabilidad limitada del autor del modelo base: no se dispone de información sobre `Avicennasis` ni sobre el proceso de creación del modelo original, lo que dificulta auditar su procedencia.

## Enlaces

- Repositorio GGUF analizado: https://huggingface.co/mradermacher/K2-Horizon-0.9B-heretic-GGUF
- Modelo base: https://huggingface.co/Avicennasis/K2-Horizon-0.9B-heretic
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/K2-Horizon-0.9B-heretic-i1-GGUF
- Página de resumen y descargas del autor: https://hf.tst.eu/model#K2-Horizon-0.9B-heretic-GGUF
- Peticiones de cuantización y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF referenciada en la model card: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad entre cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que financia el trabajo de cuantización: https://www.nethype.de/
