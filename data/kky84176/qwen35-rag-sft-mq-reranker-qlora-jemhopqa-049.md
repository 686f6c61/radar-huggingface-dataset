# kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-049

## Resumen

El modelo `kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-049` es un checkpoint publicado en Hugging Face por el usuario kky84176. Por la nomenclatura del identificador se trata de un ajuste fino (SFT) mediante QLoRA sobre una base de la familia Qwen 3.5, orientado a tareas de reranking dentro de un pipeline de generacion aumentada por recuperacion (RAG), y entrenado sobre el conjunto de datos JemHopQA, un benchmark de QA multi-salto en japones. El pipeline declarado en el Hub es `image-text-to-text`, lo que sugiere que la arquitectura base es multimodal.

El checkpoint contiene 852.985.920 parametros (segun los tensores en safetensors) y ocupa 3,4 GB en el repositorio. La model card publicada es la plantilla autogenerada de transformers y no aporta informacion sobre datos de entrenamiento, hiperparametros, licencia ni evaluacion. La fecha de creacion registrada es 2026-11-23, con cero descargas y cero likes en el momento de la consulta.

Su relevancia es acotada: se trata de un artefacto de investigacion o experimento personal, no de un modelo listo para produccion. Resulta de interes para quienes trabajen en reranking para RAG en japones con modelos compactos y ajuste eficiente en parametros, pero la ausencia de documentacion, licencia e idiomas declarados limita seriamente su adopcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal (tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ajuste se realizo con QLoRA) |
| Idiomas soportados | no disponible (el dataset de entrenamiento, JemHopQA, es en japones) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no permite reconstruir la arquitectura con detalle. El tag `qwen3_5` indica que el modelo parte de un checkpoint de la familia Qwen 3.5, y el pipeline `image-text-to-text` apunta a una base multimodal con torre de vision y modelo de lenguaje. El identificador sugiere una adaptacion QLoRA (cuantizacion de 4 bits de los pesos base con adaptadores de bajo rango entrenables) sobre esa base, con el objetivo declarado en el nombre de actuar como reranker dentro de un flujo RAG.

El entrenamiento se realizo, segun la nomenclatura, sobre JemHopQA, un benchmark de pregunta-respuesta multi-salto en japones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de RLHF/DPO posterior, hiperparametros del LoRA (rango, alpha, modulos objetivo) ni la precision usada en el entrenamiento. Tampoco consta si los adaptadores se han fusionado con los pesos base, aunque el tamano del repositorio (3,4 GB para 853 M de parametros) es coherente con pesos en bf16/fp16 ya fusionados o con un checkpoint completo.

## Capacidades

- Generacion de texto y respuesta a preguntas, heredadas de la base Qwen 3.5.
- Reranking de pasajes o documentos candidatos en pipelines RAG, que es la tarea para la que se ha ajustado.
- Procesamiento de entradas imagen-texto, segun el pipeline declarado en el Hub.
- Razonamiento multi-salto sobre contexto recuperado, dado el dataset de entrenamiento (JemHopQA).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible.
- Capacidades multilingues: no disponibles; el ajuste se ha realizado sobre datos en japones.
- Modo thinking, vision o audio: solo vision segun el pipeline; modo thinking no disponible.

## Casos de uso

- Reranking en pipelines RAG en japones: el modelo puede recibir pares pregunta-pasaje y puntuar su relevancia para reordenar los documentos recuperados antes de pasarlos al generador, que es exactamente la tarea para la que se ha ajustado sobre JemHopQA.
- QA multi-salto sobre documentacion corporativa: dado el entrenamiento en preguntas que requieren combinar varias evidencias, puede emplearse como componente de razonamiento sobre contextos recuperados de varias fuentes.
- Filtrado de candidatos en motores de busqueda internos: reordenar los N mejores resultados de un retriever disperso o denso para mejorar la precision en la primera posicion.
- Prototipado de investigacion en reranking compacto: con 853 M de parametros, sirve como linea base ligera para comparar estrategias de ajuste QLoRA frente a rerankers dedicados de mayor tamano.
- Evaluacion de tecnicas de adaptacion eficiente: al ser un checkpoint QLoRA sobre una base reciente, es util para estudiar el impacto del ajuste de bajo rango en tareas de ranking.
- Experimentacion con entradas multimodales en RAG: el pipeline image-text-to-text permite probar escenarios en los que los documentos recuperados incluyen imagenes (capturas, diagramas) ademas de texto.
- Docencia y reproduccion de experimentos: util en entornos academicos para ilustrar el flujo completo de SFT con QLoRA sobre un benchmark de QA multi-salto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en fp16/bf16 para los pesos (853 M de parametros), mas overhead de activaciones y cache KV; en cuantizacion de 8 bits en torno a 0,9 GB y en 4 bits en torno a 0,5 GB, sin contar la torre de vision si se usa la entrada de imagen.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) es suficiente para inferencia en fp16; para entrenamiento o ajuste adicional conviene una RTX 4090 (24 GB) o una A100/H100 en entornos de servidor.
- Cabe holgadamente en GPU consumer; incluso en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI si la arquitectura subyacente esta soportada por esas herramientas; llama.cpp y Ollama requeririan conversion a GGUF, no publicada en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-rag-sft-mq-reranker-qlora-jemhopqa-049 | 853 M | no disponible | Reranking RAG (japones) | no disponible | Hugging Face |
| BGE-reranker-v2-m3 | no disponible en la informacion | no disponible | Reranking multilingue | no disponible en la informacion | Hugging Face |
| bge-m3 | no disponible en la informacion | no disponible | Retrieval y reranking multilingue | no disponible en la informacion | Hugging Face |

No se dispone de datos verificados de parametros, contexto ni rendimiento de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La diferencia principal observable es que el modelo descrito es un ajuste QLoRA especifico para japones y QA multi-salto, mientras que los rerankers dedicados citados estan disenados de forma generalista para ranking multilingue.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada de transformers: no documenta datos de entrenamiento, hiperparametros, evaluacion ni uso previsto.
- Licencia no declarada: no es posible determinar si se permite uso comercial; en la practica esto bloquea su adopcion en produccion.
- Idiomas no declarados: el ajuste se ha realizado sobre un dataset en japones, por lo que el rendimiento en castellano u otros idiomas es incierto y probablemente degradado.
- Riesgo de alucinacion: al ser un modelo generativo adaptado a reranking, puede producir justificaciones o puntuaciones inconsistentes si se usa fuera de su tarea.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad ni de replicacion de resultados.
- Fecha de creacion registrada en 2026: conviene verificar la procedencia y la integridad del repositorio antes de usarlo.
- Sin datos de sesgos: no se ha publicado ningun analisis de sesgo, toxicidad o comportamiento en dominios sensibles.
- El pipeline image-text-to-text implica que parte del comportamiento depende de la torre de vision; su calidad en documentos escaneados o diagramas no esta documentada.
- No se han publicado pesos GGUF ni cuantizaciones listas para usar, lo que anade trabajo de conversion para despliegues ligeros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-049
- Referencia citada en la model card (Lacoste et al., 2019, Machine Learning Impact calculator): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
