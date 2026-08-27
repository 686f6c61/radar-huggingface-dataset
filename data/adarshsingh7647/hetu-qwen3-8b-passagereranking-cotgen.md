# AdarshSingh7647/HETU-Qwen3-8B-PassageReranking-CotGen

## Resumen

HETU-Qwen3-8B-PassageReranking-CotGen es un modelo de lenguaje fine-tuneado a partir de Qwen3-8B, desarrollado por AdarshSingh7647 como parte de la suite HETU (Hints Enable True Understanding). Su propósito específico es la reranking de pasajes (passage reranking), una tarea de recuperación de información en la que se ordenan documentos candidatos según su relevancia para una consulta. El modelo está entrenado para generar una cadena de razonamiento completa (chain-of-thought) antes de emitir su salida, una técnica denominada CotGen, que mejora la interpretabilidad y la precisión en la decisión de relevancia.

El modelo se presenta como un checkpoint final fusionado (pesos base + adaptador LoRA) en precisión bf16, con un total de 8.190.735.360 parámetros, lo que coincide con la arquitectura densa de Qwen3-8B. Está diseñado para ser evaluado en los benchmarks BRIGHT y NevIR, aunque no se han publicado resultados numéricos en la información disponible. Su relevancia radica en que aborda la reranking con razonamiento explícito, una aproximación que puede superar a los rerankers puramente discriminativos en escenarios donde la justificación de la relevancia es compleja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta 32K, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | bf16 (formato original); cuantizaciones adicionales no especificadas |
| Idiomas soportados | no disponible (el modelo base Qwen3 soporta multiples idiomas, pero no se detalla para este checkpoint) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso con 8 mil millones de parametros, y se fine-tunea mediante adaptadores LoRA que posteriormente se fusionan en los pesos completos. La innovacion principal es el metodo CotGen: el modelo se entrena para generar una cadena de razonamiento explicita antes de producir la puntuacion o decision de relevancia. Esto convierte la reranking en una tarea generativa con justificacion, en lugar de un clasificador binario o de puntuacion directa. El entrenamiento se realiza sobre datos de reranking, probablemente con pares consulta-documento y anotaciones de relevancia, aunque no se especifican el volumen de datos ni la composicion exacta del dataset. Tampoco se detalla si se emplearon tecnicas de RLHF o DPO; la informacion disponible solo menciona el metodo CotGen y la evaluacion en BRIGHT y NevIR.

## Capacidades

- Reranking de pasajes: ordena documentos candidatos segun su relevancia para una consulta dada, generando una explicacion razonada antes de la decision.
- Razonamiento de cadena de pensamiento: produce un CoT explicito que puede auditarse para entender por que un documento es relevante o no.
- Generacion de texto: al estar basado en Qwen3-8B, conserva las capacidades generativas del modelo base, aunque su uso principal es la reranking.
- Soporte de tool calling: no confirmado para este fine-tune especifico; el modelo base Qwen3-Instruct lo soporta, pero no se indica en la model card.
- Capacidades multilingues: no especificadas para este checkpoint; el modelo base Qwen3 es multilingue, pero no se garantiza que el fine-tune mantenga ese soporte.
- Integracion con pipelines de recuperacion: puede usarse como componente de reranking en sistemas RAG o de busqueda.

## Casos de uso

- Recuperacion aumentada por generacion (RAG): el modelo puede rerankear los pasajes recuperados por un primer sistema de busqueda (por ejemplo, BM25 o embeddings) antes de pasarlos al generador, mejorando la precision de las respuestas finales.
- Busqueda empresarial: en motores de busqueda internos, puede ordenar documentos corporativos segun su relevancia para consultas de empleados, con explicaciones que facilitan la depuracion del sistema.
- Sistemas de preguntas y respuestas sobre dominios especificos: al generar CoT, permite verificar si la relevancia asignada es correcta, util en entornos regulados donde se requiere trazabilidad.
- Evaluacion de calidad de recuperacion: puede usarse como juez automatico para comparar la relevancia de resultados de diferentes sistemas de recuperacion, generando justificaciones que ayudan a identificar sesgos.
- Asistentes de investigacion academica: para ordenar articulos cientificos candidatos segun su pertinencia a una pregunta de investigacion, con razonamiento explicito sobre la conexion entre consulta y documento.
- Chatbots con contexto largo: aunque no es su uso principal, puede integrarse en un pipeline donde el chatbot necesita seleccionar los fragmentos mas relevantes de un historial largo antes de responder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo se evalua en BRIGHT y NevIR, pero no proporciona tablas de resultados ni comparaciones con otros modelos. Por tanto, no es posible presentar datos numericos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 16,4 GB (tamano del repo). Para inferencia con cuantizacion de 8 bits, se estiman unos 8-9 GB; con 4 bits, unos 5-6 GB.
- GPU recomendadas: para bf16 completo, una GPU con al menos 20 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100). Con cuantizacion 4 bits, puede ejecutarse en GPUs consumer de 8-12 GB (RTX 3080, RTX 4070).
- Si cabe en consumer GPU: si, con cuantizacion 4 bits o 8 bits en GPUs de gama alta consumer.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con vLLM, TGI, o mediante llama.cpp con pesos convertidos a GGUF (no se proporcionan conversiones oficiales). Tambien es compatible con Ollama si se convierte.
- Latencia y throughput: no disponibles; dependen del hardware y del metodo de cuantizacion. Para un modelo de 8B en una GPU moderna, se espera una latencia de decodificacion de decenas de milisegundos por token, pero no hay datos medidos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. El modelo se posiciona como un reranker generativo basado en Qwen3-8B, pero no hay datos de rendimiento publicados. Como referencia, el modelo base Qwen3-8B-Instruct es un LLM generalista, mientras que este checkpoint esta especializado en reranking. Otros rerankers conocidos como BGE-Reranker-v2-M3 o Cohere Rerank no son directamente comparables por su naturaleza discriminativa y su tamano menor. Se recomienda consultar los benchmarks BRIGHT y NevIR para futuras comparaciones, pero no se incluyen aqui por falta de datos.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos para este modelo, pero al derivar de Qwen3-8B, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinacion: al generar cadenas de razonamiento, el modelo puede producir justificaciones plausibles pero incorrectas, especialmente en dominios fuera de su distribucion de entrenamiento.
- Limitaciones de contexto: no se confirma la longitud de contexto efectiva tras el fine-tune; si se reduce respecto al modelo base, podria afectar a consultas o documentos muy largos.
- Restricciones de licencia: la licencia no esta disponible, lo que impide conocer si el uso comercial esta permitido. Se recomienda contactar al autor antes de usar en produccion.
- Caveat de produccion: al ser un modelo de investigacion con cero descargas y sin benchmarks publicados, su robustez en entornos reales no esta validada. Es necesario evaluarlo en el dominio de aplicacion antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AdarshSingh7647/HETU-Qwen3-8B-PassageReranking-CotGen
- Paper tecnico de Qwen3 (arXiv): https://arxiv.org/pdf/2505.09388
- Repositorio oficial de Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Repositorio TabRanker del mismo autor (GitHub): https://github.com/AdarshSingh7647/TabRanker
- Coleccion TabRank Qwen3 8B (HuggingFace): https://huggingface.co/collections/AdarshSingh7647/tabrank-qwen3-8b-table-rerankers
