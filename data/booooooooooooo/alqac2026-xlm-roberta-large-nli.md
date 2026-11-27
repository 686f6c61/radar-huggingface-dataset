# Booooooooooooo/alqac2026-xlm-roberta-large-nli

## Resumen

El modelo `Booooooooooooo/alqac2026-xlm-roberta-large-nli` es un cross-encoder de clasificación de pares de textos (natural language inference, NLI) desarrollado por el usuario de Hugging Face `Booooooooooooo` en el marco de un trabajo de fin de grado sobre recuperación de información jurídica (legal information retrieval). Se construye sobre `FacebookAI/xlm-roberta-large` y se afina para una tarea binaria de verificación: decidir si un fragmento de evidencia respalda o no una consulta jurídica. El problema que resuelve es la fase de reordenación y verificación en pipelines de retrieval-augmented generation (RAG) sobre corpus legales, donde un recuperador inicial propone candidatos y este modelo filtra los que realmente sustentan la respuesta.

La relevancia actual del modelo es acotada y muy específica: se trata de un checkpoint de investigación, con cero descargas y cero likes en el momento de redactar esta ficha, entrenado sobre el conjunto de datos ALQAC2026 (Vietnamese Legal Question Answering Challenge). No es un modelo generativo ni un asistente conversacional, sino un clasificador de secuencias de 559.892.482 parámetros (aproximadamente 560 M) con una longitud máxima de entrada de 512 tokens y agregación por máximo (max) sobre múltiples evidencias candidatas.

Su ámbito lingüístico declarado es únicamente el vietnamita (`vi`), lo que lo aleja del castellano y de otros idiomas. La licencia es MIT, lo que permite uso comercial y modificación sin restricciones significativas, pero la ausencia de benchmarks publicados y de documentación técnica detallada obliga a tratar sus resultados como no verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (cross-encoder) basado en XLM-RoBERTa large, con cabeza de clasificación de secuencias |
| Parametros totales | 559.892.482 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max length declarada en la model card) |
| Tipos de cuantizacion | no disponible (repo con pesos safetensors en precisión original; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Etiquetas | `legal-ir`, `natural-language-inference`, `text-classification`, `nli-verifier`, `cross-encoder` |
| Pipeline | `text-classification` |
| Tamaño del repositorio | 2,3 GB |
| Fecha de creación | 2026-11-27 |
| Fecha de actualización | 2026-11-27 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer XLM-RoBERTa large (24 capas, 1024 dimensiones ocultas, 16 cabezas de atención, vocabulario SentencePiece multilingüe) con una cabeza de clasificación de dos etiquetas sobre el token `[CLS]`. El modelo recibe el par (consulta, evidencia) concatenado y separado por tokens especiales, y produce dos logits. La model card especifica que la inferencia se realiza mediante `sigmoid(logits[:, 1] - logits[:, 0])` para obtener una probabilidad de entailment, y que la agregación sobre múltiples evidencias se hace por máximo (`max`), es decir, se selecciona la evidencia con mayor puntuación.

Las etiquetas son binarias: `0` para contradicción o evidencia no relevante, `1` para entailment o evidencia de soporte. El conjunto de entrenamiento es ALQAC2026, un corpus de preguntas y respuestas jurídicas en vietnamita. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO (improbable en un clasificador de este tipo), ni innovaciones técnicas como decodificación especulativa o atención lineal. Tampoco se detalla el esquema de muestreo de negativos ni el ratio positivo/negativo usado durante el ajuste fino, datos que serían relevantes para reproducir o evaluar el modelo.

## Capacidades

- Clasificación binaria de pares (consulta, evidencia) para verificación de soporte factual en dominio jurídico vietnamita.
- Reordenación (reranking) de candidatos recuperados por un sistema de búsqueda léxica o densa previa.
- Agregación por máximo sobre conjuntos de evidencias para producir una puntuación global de relevancia.
- Manejo de entradas de hasta 512 tokens, suficiente para párrafos de artículos legales y preguntas de usuario.
- Capacidad multilingüe heredada del tokenizador XLM-R, aunque el ajuste fino se ha realizado únicamente en vietnamita y no se garantiza un rendimiento fuera de ese idioma.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode). Es un clasificador, no un generador.

## Casos de uso

- Verificación de evidencias en un sistema RAG jurídico vietnamita: tras recuperar los 20-50 artículos candidatos con un retriever (BM25 o embeddings), este cross-encoder puntúa cada par pregunta-artículo y descarta los que no sustentan la respuesta, reduciendo alucinaciones del generador final.
- Filtrado de citas legales en asistentes de consulta normativa: dado un borrador de respuesta con citas, el modelo comprueba si cada cita respalda la afirmación asociada antes de mostrarla al usuario.
- Construcción de un conjunto de datos de entrenamiento para un generador jurídico: el modelo etiqueta pares pregunta-evidencia como entailment o no, permitiendo filtrar automáticamente corpus de instrucciones de alta calidad.
- Evaluación de sistemas de recuperación de información legal: se usa como juez binario para medir la precisión de un retriever en la tarea ALQAC, comparando la puntuación del modelo con las anotaciones humanas.
- Deduplicación semántica de fragmentos normativos: dos fragmentos que implican la misma obligación pueden detectarse mediante pares simétricos puntuados por el modelo, útil para consolidar corpus legales.
- Enrutamiento de consultas en un chatbot legal: si la puntuación máxima de entailment sobre el corpus recuperado es baja, el sistema puede derivar la consulta a un humano o responder con una abstención explícita.
- Análisis de cobertura documental: dado un conjunto de preguntas frecuentes, el modelo identifica qué preguntas no tienen evidencia de soporte en la base de conocimiento y por tanto requieren nueva documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1, MRR ni nDCG sobre ALQAC2026 ni sobre ningún otro conjunto de evaluación. Tampoco se proporcionan comparaciones con baselines como BM25, mContriever o modelos NLI multilingües.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2,3 GB solo para pesos, más activaciones y memoria del tokenizador; en la práctica, entre 3 y 4 GB para lotes pequeños.
- VRAM estimada en FP16/BF16: aproximadamente 1,2 GB para pesos, con un total práctico de 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A10, L4, A100, H100). El modelo es pequeño para los estándares actuales y no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 sin problemas, incluso con lotes de decenas de pares.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, `vLLM` (soporte de cross-encoder limitado, verificar versión), `Text Embeddings Inference` (TEI) de Hugging Face para cross-encoders, `ONNX Runtime` tras exportación, y `llama.cpp` no aplica porque no hay pesos GGUF publicados.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia orientativa para un encoder de 560 M parámetros en una RTX 4090, se espera un throughput de varios cientos a pocos miles de pares por segundo en FP16, pero este dato no está confirmado por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Booooooooooooo/alqac2026-xlm-roberta-large-nli` | 560 M | 512 | vietnamita | MIT | Hugging Face, 0 descargas |
| `FacebookAI/xlm-roberta-large` | 560 M | 512 | 100 idiomas | MIT | Hugging Face, ampliamente usado |
| `cross-encoder/nli-deberta-v3-large` | ~435 M | 512 | inglés | MIT | Hugging Face |
| `BAAI/bge-reranker-v2-m3` | ~568 M | 8192 | multilingüe | Apache 2.0 | Hugging Face |

La comparación con `bge-reranker-v2-m3` es la más directa en cuanto a función (reranking de evidencias), aunque este último soporta contextos mucho más largos y cobertura multilingüe. El modelo de ALQAC2026 se diferencia por su especialización en dominio jurídico vietnamita y por su formulación como NLI binario en lugar de ranking de relevancia. No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente sobre ALQAC2026, el modelo puede heredar sesgos de ese corpus en cuanto a terminología, estilo de redacción normativa y tipos de preguntas cubiertas. No se documenta ningún análisis de sesgo.
- Riesgo de alucinación: bajo en el sentido generativo (no genera texto), pero puede producir falsos positivos de entailment si la evidencia comparte vocabulario con la consulta sin respaldarla semánticamente.
- Limitación de contexto: 512 tokens máximo, insuficiente para artículos legales extensos o para concatenar múltiples evidencias en una sola entrada; obliga a trocear y agregar por máximo.
- Limitación de idioma: solo vietnamita. El tokenizador XLM-R es multilingüe, pero el ajuste fino no cubre castellano ni otros idiomas, por lo que su uso fuera del vietnamita no está respaldado.
- Restricciones de licencia: MIT permite uso comercial, modificación y redistribución con atribución y sin garantía. No hay cláusulas de uso aceptable adicionales.
- Ausencia de benchmarks: no hay métricas publicadas que permitan estimar su calidad real frente a alternativas; cualquier despliegue en producción debería ir precedido de una evaluación propia sobre el corpus objetivo.
- Madurez: cero descargas y cero likes en el momento de la ficha, creado y actualizado el mismo día, sin historial de mantenimiento ni issues. Es un artefacto de investigación, no un modelo con soporte comunitario.
- Caveat para producción: la fórmula de puntuación `sigmoid(logits[:, 1] - logits[:, 0])` no es una probabilidad calibrada estándar; conviene calibrar el umbral de decisión sobre un conjunto de validación propio antes de fijar políticas de abstención.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Booooooooooooo/alqac2026-xlm-roberta-large-nli
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código ni demos adicionales.
