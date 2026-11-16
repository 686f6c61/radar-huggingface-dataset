# Booooooooooooo/zalo2021-xlm-roberta-large-nli

## Resumen

El modelo `zalo2021-xlm-roberta-large-nli` es un cross-encoder de clasificación de pares (pregunta, evidencia) desarrollado por el usuario de Hugging Face `Booooooooooooo` en el marco de un trabajo de fin de grado sobre sistemas de recuperación de información jurídica (Legal Information Retrieval). Se construye sobre el encoder multilingüe `FacebookAI/xlm-roberta-large` y se afina para una tarea de inferencia de lenguaje natural (NLI) binaria adaptada al dominio legal en vietnamita: distinguir si un fragmento de evidencia respalda o contradice la consulta del usuario.

El problema que aborda es la fase de re-ranking o verificación dentro de un pipeline de recuperación jurídica: dado un conjunto de pasajes candidatos recuperados por un buscador (por ejemplo, BM25 o un bi-encoder), el modelo puntúa cada par consulta-pasaje para descartar evidencia no relevante antes de pasarla a un generador de respuestas. Es, por tanto, un componente de un sistema RAG legal, no un modelo generativo.

Con 559,9 millones de parámetros y una ventana de 512 tokens, el modelo es relevante para equipos que construyen asistentes jurídicos en vietnamita sobre corpus como ZALO2021, donde la precisión del re-ranking condiciona directamente la calidad de la respuesta final. Su licencia MIT y su formato safetensors facilitan la integración en producción, aunque su especialización y su limitado alcance lingüístico lo restringen a un nicho muy concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) con cabeza de clasificación de secuencias |
| Parametros totales | 559.892.482 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar vía herramientas externas) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-large`, un encoder transformer de 24 capas y 559,9 millones de parámetros, preentrenado de forma multilingüe sobre 100 idiomas con objetivos de masked language modeling. Sobre esa base se añade una cabeza de clasificación binaria (`AutoModelForSequenceClassification`) y se afina como cross-encoder: la consulta y la evidencia se concatenan en una única secuencia de entrada, de modo que la atención se calcula conjuntamente sobre ambos textos, lo que permite capturar interacciones léxicas y semánticas finas entre pregunta y pasaje.

El ajuste se realiza sobre el conjunto de datos ZALO2021, un corpus de recuperación de información jurídica en vietnamita, con etiquetas binarias: `0` para contradicción o no relevancia y `1` para implicación o evidencia de apoyo. La longitud máxima de secuencia es de 512 tokens. La model card menciona una estrategia de agregación por pasajes denominada "bag aggregation: max", que sugiere que el modelo se usa para puntuar varios fragmentos de un mismo documento y quedarse con la puntuación máxima como señal de relevancia del documento completo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en un cross-encoder de clasificación).

## Capacidades

- Clasificación binaria de pares (consulta, evidencia) en vietnamita: devuelve una puntuación de implicación frente a contradicción o no relevancia.
- Re-ranking de pasajes en pipelines de recuperación de información jurídica.
- Verificación de evidencia: comprobar si un fragmento normativo respalda una afirmación o consulta concreta.
- Agregación por pasajes mediante máximo ("bag aggregation: max") para puntuar documentos completos a partir de sus fragmentos.
- Manejo de textos legales en vietnamita con hasta 512 tokens por par.
- Integración directa con `transformers` (`AutoTokenizer` y `AutoModelForSequenceClassification`).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento: es un clasificador, no un modelo generativo.

## Casos de uso

- Re-ranking en un RAG jurídico: tras una primera recuperación con BM25 o un bi-encoder, el modelo puntúa cada par consulta-pasaje y descarta los fragmentos con baja probabilidad de implicación, mejorando la precisión del contexto que se pasa al generador.
- Asistente de consultas legales en vietnamita: dado un corpus de normativa (por ejemplo, textos administrativos), el modelo verifica si el pasaje recuperado responde realmente a la pregunta del ciudadano antes de mostrarlo.
- Verificación de citas normativas: comprobar que un artículo citado en un borrador respalda efectivamente la afirmación que se le atribuye, reduciendo citas incorrectas en documentos jurídicos.
- Filtrado de falsos positivos en búsqueda legal: eliminar resultados léxicamente similares pero semánticamente irrelevantes en un buscador interno de un despacho o de una administración pública.
- Construcción de datasets de entrenamiento: usar las puntuaciones del modelo para etiquetar pares consulta-evidencia y generar datos de entrenamiento para otros componentes del pipeline.
- Evaluación de sistemas de recuperación: emplear el modelo como juez automático de relevancia para medir la calidad de un motor de búsqueda jurídico sobre ZALO2021 u otros corpus vietnamitas.
- Detección de contradicciones: identificar pasajes que contradicen una consulta o una afirmación previa, útil en sistemas de control de consistencia documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos, más overhead de activaciones y tokenizador; en la práctica, entre 3 y 4 GB para batches pequeños.
- VRAM estimada en fp16/bf16: en torno a 1,2 GB de pesos, con un consumo total de unos 2 GB para batch size 1-8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 o H100 funcionan sin problema. En CPU es viable para volúmenes moderados, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna con 4 GB o más (RTX 3050 en adelante).
- Opciones de despliegue: `transformers` con PyTorch, `text-embeddings-inference` (TEI) para servir cross-encoders, `vLLM` no aplica (no es generativo), `llama.cpp`/`Ollama` no soportan este formato de forma nativa, ONNX Runtime para optimización en CPU.
- Latencia y throughput: no disponibles en la información proporcionada; para un encoder de 560 M de parámetros y secuencias de 512 tokens, se espera una latencia del orden de milisegundos por par en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Tarea |
|---|---|---|---|---|---|
| Booooooooooooo/zalo2021-xlm-roberta-large-nli | 559,9 M | 512 | vi | MIT | Cross-encoder NLI legal (re-ranking) |
| `FacebookAI/xlm-roberta-large` | 559,9 M | 512 | 100 idiomas | MIT | Encoder base multilingüe (sin afinar) |
| `BAAI/bge-reranker-large` | ~560 M | 512 | multilingüe (en, zh y otros) | MIT | Cross-encoder de re-ranking general |
| `cross-encoder/ms-marco-MiniLM-L-12-v2` | ~33 M | 512 | en | Apache 2.0 | Cross-encoder de re-ranking en inglés |

La comparación con `bge-reranker-large` y con el cross-encoder de MS MARCO es orientativa: no se dispone de resultados de benchmarks del modelo ZALO2021 que permitan una comparación cuantitativa directa. La principal diferencia frente a las alternativas generalistas es su especialización en vietnamita y en el dominio jurídico, a costa de no cubrir otros idiomas ni tareas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un corpus jurídico vietnamita concreto, puede heredar sesgos de ese corpus y de la anotación de relevancia.
- Riesgo de alucinación: bajo en el sentido generativo (no produce texto), pero puede producir falsos positivos o falsos negativos en la clasificación de relevancia, lo que se propaga al pipeline de RAG.
- Limitación de contexto: 512 tokens por par; documentos o consultas más largos deben fragmentarse.
- Limitación de idioma: solo vietnamita; no se garantiza un rendimiento aceptable en otros idiomas pese a la base multilingüe.
- Restricciones de licencia: MIT permite uso comercial, pero conviene revisar las condiciones del corpus ZALO2021 y de los datos legales subyacentes, que pueden tener restricciones propias.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida; no hay benchmarks publicados, por lo que se recomienda evaluar el modelo sobre un conjunto de validación propio antes de desplegarlo.
- El modelo no es generativo: no debe usarse como sustituto de un LLM para responder preguntas, solo como componente de verificación o re-ranking.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Booooooooooooo/zalo2021-xlm-roberta-large-nli
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-RoBERTa: https://arxiv.org/abs/1911.02116
- Documentación de `AutoModelForSequenceClassification`: https://huggingface.co/docs/transformers/model_doc/xlm-roberta
- Text Embeddings Inference (servido de cross-encoders): https://github.com/huggingface/text-embeddings-inference
