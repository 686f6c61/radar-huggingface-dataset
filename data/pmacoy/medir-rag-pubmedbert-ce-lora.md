# Pmacoy/medir-rag-pubmedbert-ce-lora

## Resumen

`Pmacoy/medir-rag-pubmedbert-ce-lora` es un adaptador LoRA y una cabeza de clasificación (cross-encoder) construidos sobre el modelo base `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext`, también conocido como PubMedBERT. El autor, Pmacoy, lo publica en el contexto de un proyecto denominado MedIR-RAG, Milestone 2, orientado presumiblemente a recuperación aumentada de información biomédica. El problema que aborda es el re-ranking de pasajes candidatos en un pipeline de recuperación: un cross-encoder puntúa pares pregunta-pasaje para ordenar los resultados de un retriever previo.

El modelo se ha entrenado con una pérdida listwise sobre 8000 preguntas del subconjunto `pqa_artificial` de PubMedQA, empleando un positivo y tres negativos difíciles por consulta. El adaptador LoRA tiene rango 16, alpha 32 y afecta a las proyecciones query, key y value. El repositorio es de tamaño prácticamente nulo (0,0 GB), lo que sugiere que los pesos del adaptador podrían no estar efectivamente subidos o que el autor solo publicó la configuración.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigación sin descargas ni validación pública, sin licencia declarada y sin model card completa en castellano. No obstante, sirve como ejemplo de adaptación paramétricamente eficiente de PubMedBERT para tareas de re-ranking biomédico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con adaptador LoRA y cabeza de clasificación para cross-encoder |
| Parametros totales | No disponible (el modelo base PubMedBERT-base tiene ~110 M; el adaptador LoRA no se especifica en la información proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base PubMedBERT-base admite hasta 512 tokens, pero no se confirma en la información proporcionada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base está entrenado principalmente en inglés biomédico) |
| Licencia | No disponible |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre PubMedBERT-base, un transformer encoder de tipo BERT con vocabulario específico del dominio biomédico. Sobre el modelo base se aplica un adaptador LoRA con rango 16, alpha 32 y actualizaciones en las proyecciones query, key y value de la atención, junto con una cabeza de clasificación para producir una puntuación de relevancia por par pregunta-pasaje.

El entrenamiento utiliza una pérdida listwise con un positivo y tres negativos difíciles por consulta, sobre 8000 preguntas del subconjunto `pqa_artificial` de PubMedQA. No se especifican en la información proporcionada el número total de tokens vistos, la composición exacta del dataset, la estrategia de minado de negativos ni si hubo etapas adicionales de ajuste. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Re-ranking de pasajes biomédicos: puntúa la relevancia de un par pregunta-pasaje para ordenar resultados de un retriever.
- Clasificación binaria de relevancia mediante cabeza de clasificación sobre la representación del token [CLS] o equivalente.
- Entrenamiento con negativos difíciles, lo que favorece la discriminación entre pasajes plausibles pero incorrectos.
- Dominio biomédico: el modelo base PubMedBERT está especializado en literatura científica y abstracts de PubMed.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el modelo base está orientado a inglés biomédico.

## Casos de uso

- Re-ranking en pipelines RAG biomédicos: tras una primera fase de recuperación densa o léxica, el cross-encoder puntúa los 20-100 candidatos y reordena los resultados antes de pasarlos al generador, mejorando la precisión del contexto inyectado.
- Búsqueda de evidencia en PubMedQA: dado un conjunto de abstracts candidatos, el modelo selecciona los pasajes más relevantes para responder a una pregunta clínica formulada en lenguaje natural.
- Filtrado de falsos positivos en recuperación: los negativos difíciles usados en entrenamiento permiten descartar pasajes que comparten vocabulario con la consulta pero no responden a ella.
- Evaluación de sistemas de recuperación: el modelo puede usarse como juez de relevancia para medir la calidad de un retriever en dominios biomédicos.
- Asistencia a revisión sistemática: priorización de abstracts potencialmente relevantes antes de la lectura manual por parte de revisores.
- Prototipado de investigación: base para experimentos de adaptación paramétricamente eficiente (LoRA) sobre PubMedBERT en tareas de clasificación de pares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; un modelo BERT-base (~110 M de parámetros) en fp16 requiere aproximadamente 0,22 GB solo para pesos, más overhead de activaciones y batch. Con el adaptador LoRA el incremento es marginal.
- GPU recomendadas: cualquier GPU consumer con al menos 4-8 GB de VRAM debería ser suficiente para inferencia en batch pequeño; A100, H100 o RTX 4090 no son necesarias.
- Cabe en GPU consumer: sí, previsiblemente en GTX 1660, RTX 3060, RTX 4060 y superiores, aunque no se confirma en la información proporcionada.
- Opciones de despliegue: al ser un modelo BERT con cabeza de clasificación, es compatible con Hugging Face Transformers, Optimum, ONNX Runtime y TorchServe; no es compatible con vLLM, llama.cpp ni Ollama, orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pmacoy/medir-rag-pubmedbert-ce-lora | No disponible (base ~110 M) | No disponible | Cross-encoder de re-ranking biomédico | No disponible | Hugging Face, 0 descargas |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | ~22 M | 512 tokens | Cross-encoder de re-ranking general | Apache 2.0 | Hugging Face, ampliamente usado |
| cross-encoder/ms-marco-MiniLM-L-12-v2 | ~33 M | 512 tokens | Cross-encoder de re-ranking general | Apache 2.0 | Hugging Face, ampliamente usado |
| BAAI/bge-reranker-base | ~278 M | 512 tokens | Cross-encoder de re-ranking multilingüe | MIT | Hugging Face, ampliamente usado |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo de Pmacoy que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir permiso para uso comercial ni redistribución.
- Repositorio de 0,0 GB: es posible que los pesos del adaptador no estén efectivamente publicados, lo que impediría su uso directo.
- Sin descargas ni validación pública: no hay evidencia de que el modelo funcione fuera del entorno del autor.
- Entrenado sobre `pqa_artificial` de PubMedQA, un subconjunto generado artificialmente; puede no generalizar a preguntas clínicas reales.
- Dominio restringido a inglés biomédico; no se documenta soporte para castellano ni otros idiomas.
- Riesgo de alucinación no aplica directamente (no es generativo), pero sí de falsos positivos y falsos negativos en la clasificación de relevancia.
- No se documentan sesgos conocidos, pero el modelo base PubMedBERT puede heredar sesgos de la literatura científica disponible en PubMed.
- Longitud de contexto no confirmada; si se hereda del modelo base, estará limitada a 512 tokens, insuficiente para documentos largos sin truncado.
- Sin benchmarks publicados: no hay forma de evaluar su calidad frente a alternativas establecidas.

## Enlaces

- Hugging Face: https://huggingface.co/Pmacoy/medir-rag-pubmedbert-ce-lora
- Modelo base PubMedBERT: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
- Dataset PubMedQA: https://huggingface.co/datasets/qiaojin/PubMedQA
- Paper PubMedBERT: https://arxiv.org/abs/2007.15779
- Paper PubMedQA: https://arxiv.org/abs/1909.06146
- Paper LoRA: https://arxiv.org/abs/2106.09685
