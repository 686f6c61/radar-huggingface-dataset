# mradermacher/DeutschGPT-GGUF

## Resumen

DeutschGPT-GGUF es la versión cuantizada en formato GGUF del modelo KordAI/DeutschGPT, un modelo de lenguaje de 1.720.574.976 parámetros (aproximadamente 1,72 mil millones) especializado en alemán y orientado a generación de texto conversacional. La cuantización ha sido realizada por mradermacher, un autor habitual de conversiones GGUF de la comunidad, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo base está etiquetado con el tag `qwen3`, lo que indica que KordAI/DeutschGPT deriva de la familia Qwen3, y aparece asociado a la herramienta Unsloth en las etiquetas del repositorio. El repositorio que nos ocupa no contiene los pesos originales, sino únicamente conversiones GGUF estáticas en doce niveles de cuantización distintos, desde Q2_K (0,9 GB) hasta f16 (3,5 GB), pensadas para ejecución local con llama.cpp y derivados.

Su relevancia práctica es doble: por un lado, ofrece un modelo conversacional en alemán de tamano pequeno que cabe en GPUs de consumo e incluso en CPU; por otro, al ser una conversión GGUF, elimina la necesidad de infraestructura de inferencia pesada. La contrapartida es que no se han publicado datos de contexto, composición del dataset de entrenamiento ni resultados de benchmarks, ni en la model card original ni en la del repositorio cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las etiquetas del repositorio apuntan a la familia Qwen3) |
| Parametros totales | 1.720.574.976 (aproximadamente 1,72 B), segun safetensors del modelo base |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (cuantizaciones estaticas; no hay quants ponderados ni imatrix en el momento de la publicacion) |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base KordAI/DeutschGPT) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Los tags del repositorio (`qwen3`, `unsloth`, `transformers`) sugieren que se trata de un transformer decoder-only de la familia Qwen3, afinado con la libreria Unsloth, pero ni la model card de la cuantizacion ni los metadatos disponibles confirman numero de capas, dimension del modelo, tipo de atencion ni estrategia de tokenizacion. El recuento de parametros (1,72 B) es compatible con la variante de menor tamano de esa familia, aunque este extremo no se detalla en la informacion facilitada.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del corpus aleman utilizado, ni si se aplicaron etapas de ajuste supervisado, RLHF o DPO. El tag `conversational` y `chat` indica que el modelo esta preparado para dialogos multi-turno con plantilla de chat, pero no se especifica cual. La unica innovacion tecnica documentada en este repositorio es la propia cuantizacion: mradermacher emplea cuantizaciones estaticas (no ponderadas ni basadas en imatrix) y no publica, por el momento, variantes con matriz de importancia.

## Capacidades

- Generacion de texto en aleman con registro conversacional y orientacion a chat multi-turno.
- Razonamiento basico y respuesta a instrucciones de complejidad baja o media, propio de un modelo de 1,72 B parametros.
- Generacion y asistencia en codigo: plausible por herencia de la familia Qwen3, pero no documentada en la informacion disponible.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al aleman segun la metadata de idioma; no hay indicios de soporte de castellano, ingles u otros idiomas.
- Capacidad especial (modo thinking, vision o audio): no documentada. El tag `qwen3` podria implicar modos de razonamiento ampliado en el modelo base, pero no se confirma en la informacion facilitada.

## Casos de uso

- Atencion al cliente en aleman: el modelo puede gestionar conversaciones multi-turno en dicho idioma en un servidor sin GPU dedicada, gracias a las cuantizaciones de 1,2 GB (Q4_K_M) o 1,4 GB (Q5_K_M). Su tamano reducido permite desplegar varias instancias en paralelo sobre el mismo hardware.
- Asistente de escritorio local y privado: al ejecutarse con llama.cpp u Ollama, todo el procesamiento queda en la maquina del usuario, lo que resulta adecuado para entornos con requisitos de confidencialidad donde no se pueden enviar textos a APIs externas.
- Generacion aumentada por recuperacion (RAG) sobre documentacion alemana: el modelo puede integrarse como generador en un pipeline que recupere fragmentos de manuales, contratos o normativa y redacte respuestas citando el contexto. La ventana de contexto no esta documentada, por lo que habria que verificarla empiricamente antes de fijar el tamano de los fragmentos.
- Prototipado y evaluacion de producto: con 1,2 GB en Q4_K_M se puede levantar un endpoint compatible con la API de OpenAI en un portatil o en una instancia pequena de cloud, lo que acelera las pruebas de concepto de producto antes de invertir en modelos mayores.
- Clasificacion, extraccion y resumen de textos alemanes: tareas de etiquetado de tickets, extraccion de entidades o resumenes de correos, ejecutadas por lotes sobre CPU con la cuantizacion Q4_K_S, que la propia model card marca como "fast, recommended".
- Educacion y experimentacion con modelos de lenguaje: por su licencia Apache 2.0 y su bajo coste de ejecucion, sirve como banco de pruebas para estudiar el efecto de la cuantizacion (comparar Q2_K frente a Q8_0 y f16) sobre la calidad de salida en aleman.
- Base para ajuste fino adicional: los pesos del modelo base pueden reentrenarse o adaptarse con LoRA para dominios verticales en aleman (legal, sanitario, industrial) antes de volver a cuantizar a GGUF. Esta aplicacion depende del modelo base, no de la conversion GGUF en si.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del modelo base KordAI/DeutschGPT citada en el repositorio ni la del propio mradermacher incluyen cifras de MMLU, HumanEval, GSM8K, perplexity comparativa ni evaluaciones en aleman.

## Requisitos de hardware

- VRAM estimada para inferencia: los tamanos de fichero publicados son 0,9 GB (Q2_K), 1,0 GB (Q3_K_S y Q3_K_M), 1,1 GB (Q3_K_L e IQ4_XS), 1,2 GB (Q4_K_S y Q4_K_M), 1,3 GB (Q5_K_S), 1,4 GB (Q5_K_M), 1,5 GB (Q6_K), 1,9 GB (Q8_0) y 3,5 GB (f16). A esas cifras hay que sumar la cache KV y el overhead del runtime, que crecen con la longitud de contexto efectiva.
- Estimacion orientativa de VRAM total: entre 2 GB y 3 GB para Q4_K_M con contextos moderados; alrededor de 3 GB para Q8_0; en torno a 5 GB para f16. Estas cifras son estimaciones a partir del tamano de los ficheros, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para las cuantizaciones Q4 y Q5; una RTX 3060 de 12 GB, una RTX 4060 Ti de 8 GB o una RTX 4090 permiten cargar sin problema incluso f16. En el segmento profesional, una A100 o una H100 estan sobredimensionadas para este modelo y solo se justificarian para servir muchas instancias concurrentes.
- Viabilidad en GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU dedicada de los ultimos ocho anos, y las variantes Q4 tambien en GPUs integradas con memoria compartida.
- Ejecucion en CPU: viable. El modelo completo en Q4_K_M ocupa 1,2 GB, por lo que puede correr en CPU con llama.cpp, Ollama o LM Studio a velocidades utilizables en tareas por lotes o de baja concurrencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y, en general, cualquier runtime con soporte GGUF. vLLM y TGI no son la via natural para este repositorio, ya que su soporte de GGUF es limitado o experimental; para servir el modelo base en safetensors con esos motores habria que recurrir a KordAI/DeutschGPT.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para ninguna de las cuantizaciones.

## Comparativa con modelos similares

La comparativa se establece frente a alternativas de la misma categoria (modelos densos de 1 a 3 mil millones de parametros con soporte de conversacion). Las cifras de los modelos competidores proceden de su documentacion publica y no de la informacion proporcionada en esta busqueda; deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| DeutschGPT-GGUF (esta ficha) | 1,72 B | no disponible | aleman | Apache 2.0 | si, 12 cuantizaciones |
| Qwen3-1.7B (familia del modelo base) | 1,7 B | no disponible en esta busqueda | multilingue | Apache 2.0 | si, por la comunidad |
| Llama-3.2-1B | 1,23 B | no disponible en esta busqueda | multilingue | licencia comunitaria de Meta | si, por la comunidad |
| Gemma-2-2B | 2,6 B | no disponible en esta busqueda | multilingue | terminos de uso de Gemma | si, por la comunidad |

El diferenciador de DeutschGPT-GGUF no es el rendimiento bruto, del que no hay datos publicados, sino la especializacion en aleman y la disponibilidad inmediata en doce niveles de cuantizacion dentro de un unico repositorio, algo que no todos los modelos comparables ofrecen con la misma granularidad.

## Limitaciones y advertencias

- Idioma unico: la metadata declara exclusivamente aleman. El rendimiento en castellano, ingles u otros idiomas no esta documentado y previsiblemente sera pobre.
- Ausencia total de benchmarks: no hay ninguna evaluacion publicada que permita estimar la calidad del modelo frente a alternativas. Cualquier decision de produccion deberia ir precedida de una evaluacion propia sobre el caso de uso concreto.
- Modelo pequeno: con 1,72 B parametros, la capacidad de razonamiento complejo, matematicas y codigo esta estructuralmente limitada en comparacion con modelos de 7 B o mas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, agravado por la falta de informacion sobre el dataset de entrenamiento y sobre si se aplicaron tecnicas de alineacion.
- Sesgos: no se documenta la composicion del corpus aleman de entrenamiento, por lo que no es posible evaluar sesgos demograficos, politicos o culturales. Se recomienda auditoria propia si el modelo se usa en contextos sensibles.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K son las de menor calidad segun la propia model card (Q3_K_M aparece marcada como "lower quality"). Para uso en produccion se recomienda Q4_K_M o superior.
- Cache KV y contexto: al no publicarse la longitud de contexto soportada, no se puede dimensionar con precision la memoria necesaria para conversaciones largas ni garantizar el comportamiento en contextos extensos.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin restriccion de royalties, pero conviene conservar los avisos de atribucion y verificar que el modelo base KordAI/DeutschGPT mantiene la misma licencia en todos sus artefactos.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, con fechas de creacion y actualizacion muy proximas entre si. Es un artefacto reciente y sin validacion por parte de la comunidad.
- Procedencia de los datos: parte de la informacion de esta ficha (arquitectura, contexto, entrenamiento) no esta publicada. Los campos marcados como "no disponible" no deben interpretarse como valores nulos, sino como ausencia de documentacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DeutschGPT-GGUF
- Modelo base: https://huggingface.co/KordAI/DeutschGPT
- Vista resumida de cuantizaciones y descargas del autor: https://hf.tst.eu/model#DeutschGPT-GGUF
- Peticiones de cuantizacion y preguntas frecuentes del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de ficheros GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
