# fahooody10/tsa-qa-model

## Resumen

tsa-qa-model es un modelo de respuesta a preguntas extractiva (extractive question answering) publicado en Hugging Face por el usuario fahooody10. Está construido sobre la arquitectura DistilBERT, la variante destilada de BERT-base, con 65.192.450 parámetros y pesos en formato safetensors. El repositorio ocupa 0,3 GB, declara el pipeline question-answering y la librería transformers, y no registra descargas ni valoraciones en el momento de la consulta.

La tarea que resuelve es la clásica de QA extractivo: dado un contexto y una pregunta, el modelo devuelve el fragmento del contexto que contiene la respuesta, sin generar texto nuevo. DistilBERT reduce el tamaño de BERT-base en torno a un 40 % conservando la mayor parte de su rendimiento, lo que lo hace adecuado para inferencia en CPU y en entornos con recursos limitados.

La relevancia práctica de esta ficha es acotada y conviene decirlo con claridad: la model card es la plantilla automática de Hugging Face sin rellenar, no hay licencia declarada, no hay idiomas declarados y no se publican datos de entrenamiento ni de evaluación. El nombre del repositorio sugiere un ajuste fino sobre un dominio relacionado con la TSA (Transportation Security Administration), pero no hay ninguna información que lo confirme.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT-base), con cabeza de question answering extractiva |
| Parametros totales | 65.192.450 |
| Longitud de contexto | 512 tokens como maximo de secuencia de la arquitectura DistilBERT; no confirmado en la model card. Para documentos mas largos requiere ventana deslizante |
| Tipos de cuantizacion | No disponible en el repositorio. Compatible con cuantizacion dinamica INT8 de PyTorch y con cuantizacion de ONNX Runtime al ser un modelo transformer estandar |
| Idiomas soportados | No disponible |
| Licencia | No disponible. El repositorio no declara licencia |
| Formato de pesos | safetensors (confirmado en los tags del repositorio) |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, un transformer encoder con 6 capas, dimension oculta de 768 y 12 cabezas de atencion, obtenido mediante destilacion de conocimiento a partir de BERT-base. El proceso de destilacion original combina tres perdidas: destilacion de las distribuciones de salida del profesor, masked language modeling y una perdida de similitud de embeddings basada en coseno. Sobre ese encoder, este repositorio anade una cabeza de question answering que produce dos logits por token (inicio y fin del span de respuesta), el esquema habitual en modelos extractivos tipo SQuAD.

No hay informacion sobre el entrenamiento especifico de este ajuste fino: se desconoce el dataset utilizado, el numero de tokens de entrenamiento, la composicion del corpus, si hubo alguna fase de RLHF o DPO (poco habitual en modelos extractivos) y los hiperparametros empleados. La model card incluye todos los apartados de la plantilla automatica con el marcador "More Information Needed". El tag arxiv:1910.09700 que aparece en el repositorio corresponde al articulo de Lacoste et al. sobre el calculador de impacto medioambiental, citado en la propia plantilla, y no a un paper de introduccion del modelo.

## Capacidades

- Respuesta a preguntas extractiva: recibe un contexto y una pregunta y devuelve el fragmento literal del contexto que responde, con puntuaciones de inicio y fin.
- No genera texto libre: no es un modelo causal ni instruct, por lo que no sirve para resumen abstractivo, redaccion, traduccion ni conversacion generativa.
- Limitado a una unica pasada por par contexto-pregunta; el razonamiento multi-salto y las preguntas que exigen agregar varios fragmentos quedan fuera de su alcance.
- Compatible con endpoints de Hugging Face (tag endpoints_compatible), lo que facilita su despliegue como API gestionada.
- Soporte de tool calling o function calling: no disponible; la arquitectura no contempla formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no. Es un componente de extraccion, no un planificador.
- Capacidades multilingues: no disponibles. La variante base de DistilBERT suele ser monolingue en ingles, pero no hay confirmacion en este repositorio.
- Capacidades especiales: ninguna declarada. No hay modo thinking, vision ni audio.
- Entrada estandar de transformers para QA: question y context, con truncation y stride para documentos largos.

## Casos de uso

- Busqueda de respuestas sobre documentacion interna: indexar manuales, procedimientos o wikis corporativas y usar el modelo como extractor final de evidencia dentro de un pipeline RAG. Su tamano permite ejecutarlo en CPU junto al recuperador sin competir por VRAM con un modelo generativo.
- Atencion al cliente sobre FAQ y politicas: dado un fragmento de la base de conocimiento y la pregunta del usuario, devuelve la frase exacta que responde, lo que reduce el riesgo de alucinacion frente a un modelo generativo.
- Extraccion de campos en documentos estructurados: localizar valores concretos (fechas, importes, clausulas) en contratos o formularios planteando cada campo como una pregunta sobre el texto. Requiere validacion posterior porque no hay datos de evaluacion publicados.
- Mesa de ayuda tecnica y soporte de nivel 1: responder consultas repetitivas sobre configuracion o errores conocidos, extrayendo el parrafo relevante de las guias de troubleshooting.
- Verificacion de respuestas en sistemas generativos: usar el modelo como comprobador extractivo que senala el span exacto que respalda una afirmacion, util para anadir trazabilidad a un RAG.
- Procesamiento por lotes de gran volumen: al ser un modelo de 65 M de parametros, se pueden procesar miles de preguntas por hora en una sola GPU o en un pool de CPUs, con un coste por inferencia muy bajo.
- Anotacion asistida de datasets: pre-etiquetar spans de respuesta sobre corpus nuevos para acelerar el trabajo de anotacion humana en dominios especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye ninguna tabla de evaluacion (ni SQuAD, ni GLUE, ni metricas de Exact Match o F1), y la model card mantiene el apartado de resultados con el marcador "More Information Needed". Tampoco se han encontrado referencias externas al modelo en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 260 MB en FP32, 130 MB en FP16/BF16 y 65 MB en INT8. Cifras derivadas del recuento de parametros (65,19 M).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente. Para alto throughput tiene sentido usar T4, L4, A10G, A100 o H100 en configuraciones con batching; una RTX 4090 o incluso una GTX 1650 sobran para inferencia interactiva.
- GPU de consumo: si, cabe en cualquier GPU de consumo actual e incluso en iGPU y en CPU. Es un modelo pensado para ejecucion ligera.
- CPU: funciona sin GPU. Un despliegue en CPU con ONNX Runtime o con cuantizacion dinamica INT8 es perfectamente viable para cargas moderadas.
- Opciones de despliegue: pipeline de transformers (question-answering), TorchScript, ONNX Runtime, NVIDIA Triton Inference Server, Hugging Face Inference Endpoints (el repositorio esta marcado como endpoints_compatible) y FastAPI con batching propio.
- vLLM y TGI: no son la via natural para este modelo. vLLM esta orientado a decodificacion autoregresiva y no cubre cabezas de QA extractivo; TGI tiene soporte limitado para arquitecturas encoder con cabeza de QA.
- llama.cpp y Ollama: no soportan de forma estandar las cabezas extractivas de tipo DistilBERT-QA, por lo que no se recomienda esa ruta.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en el repositorio ni en la busqueda web.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| fahooody10/tsa-qa-model | 65,19 M | 512 tokens (arquitectura) | No disponible | Hugging Face, sin descargas registradas | Sin datos publicados |
| distilbert-base-uncased-finetuned-squad | ~66 M | 512 tokens | Apache 2.0 | Hugging Face, ampliamente utilizado | Evaluado en SQuAD v1.1 (consultar su model card) |
| deepset/roberta-base-squad2 | ~125 M | 512 tokens | MIT | Hugging Face | Evaluado en SQuAD v2.0 (consultar su model card) |
| deepset/tinyroberta-squad2 | ~82 M | 512 tokens | MIT | Hugging Face | Evaluado en SQuAD v2.0 (consultar su model card) |

La comparacion se limita a parametros, contexto, licencia y disponibilidad, porque no existe ninguna cifra de rendimiento publicada para tsa-qa-model. En cuanto a licencia y trazabilidad, los tres alternativas tienen condiciones claras y documentacion de evaluacion, algo de lo que carece por completo este repositorio.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia alguna. En ausencia de una licencia explicita, no debe asumirse permiso para uso comercial ni redistribucion. Es el principal bloqueante para produccion.
- Sesgos conocidos: no disponibles. Al desconocerse el dataset de ajuste fino, no se puede caracterizar el sesgo de dominio ni el sesgo social del modelo.
- Riesgo de alucinacion: bajo en comparacion con un modelo generativo, porque la respuesta se copia literalmente del contexto. Aun asi, el modelo puede devolver un span incorrecto o sin relacion con la pregunta cuando la respuesta no esta en el contexto, con puntuaciones de confianza que no estan calibradas.
- Idiomas: no declarados. Si la base es una variante monolingue en ingles, el rendimiento en castellano u otros idiomas seria practicamente nulo. Debe verificarse antes de cualquier uso.
- Limite de contexto: 512 tokens por secuencia. Los documentos mas largos exigen troceado con solapamiento (stride), lo que anade complejidad y puede partir la respuesta entre fragmentos.
- Preguntas sin respuesta: al no haber informacion sobre si el ajuste fino se hizo sobre SQuAD v2.0, no hay garantia de que el modelo maneje de forma fiable preguntas sin respuesta en el contexto.
- Trazabilidad nula: sin dataset, sin hiperparametros, sin evaluacion y sin autor identificable, el modelo no es auditable. No es recomendable integrarlo en flujos con requisitos de cumplimiento normativo.
- Adopcion: cero descargas y cero valoraciones en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Produccion: cualquier despliegue deberia ir acompanado de una evaluacion propia sobre un conjunto de validacion del dominio objetivo antes de tomar decisiones automatizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fahooody10/tsa-qa-model
- Articulo referenciado en el tag arXiv del repositorio (Lacoste et al., 2019, calculador de impacto medioambiental): https://arxiv.org/abs/1910.09700
- Articulo original de DistilBERT (Sanh et al., 2019), referencia de la arquitectura base: https://arxiv.org/abs/1910.01108
- Documentacion de la tarea question-answering en transformers: https://huggingface.co/docs/transformers/tasks/question_answering

Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo. Los unicos resultados obtenidos fueron articulos enciclopedicos sobre Kosovo, sin ninguna vinculacion con este repositorio.
