# AbdelrahmanHassan/hams-gte-reranker-ar-en

## Resumen

hams-gte-reranker-ar-en es un cross-encoder de reordenación (reranking) para recuperación de información bilingüe árabe-inglés, desarrollado por AbdelrahmanHassan como parte de la evaluación de un sistema RAG autoalojado para Hams.AI. Se trata de un ajuste fino del modelo Alibaba-NLP/gte-multilingual-reranker-base, y su función es puntuar pares consulta-documento para reordenar los resultados de una primera fase de recuperación (por ejemplo, BM25 o embeddings densos) antes de pasarlos a un generador.

El modelo resuelve un problema concreto: la recuperación en un corpus de empresa donde las consultas pueden estar en árabe estándar moderno (MSA), en inglés o en una mezcla de ambos, y donde la consulta y el documento relevante pueden estar en idiomas distintos. Con 305.959.681 parámetros (aproximadamente 306 millones) y un repositorio de 0,6 GB en safetensors, es un modelo de tamaño medio que puede ejecutarse en GPU de consumo, lo que lo hace adecuado para despliegues autoalojados con requisitos de privacidad.

Su relevancia actual es acotada pero clara: los rerankers bilingües árabe-inglés de calidad no son abundantes en el ecosistema abierto, y este ajuste demuestra mejoras medibles sobre su base en un conjunto de evaluación propio (Recall@1 de 0,717 a 0,783; MRR de 0,786 a 0,849; nDCG@10 de 0,810 a 0,873). No obstante, el propio autor advierte que el entrenamiento se hizo sobre un corpus sintético pequeño, por lo que las ganancias pueden no generalizarse a dominios muy distintos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en transformer (fine-tune de Alibaba-NLP/gte-multilingual-reranker-base) |
| Parametros totales | 305.959.681 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | arabe (MSA) e ingles, incluyendo consultas mixtas y recuperacion cruzada entre idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe un par (consulta, documento) de forma conjunta y produce una puntuación de relevancia, a diferencia de los bi-encoders que generan embeddings independientes. Parte de Alibaba-NLP/gte-multilingual-reranker-base y se ajusta con pérdida de entropía cruzada binaria (BCE), tasa de aprendizaje 2e-6, precisión fp32, 2 épocas y 4 negativos duros denoised por consulta. Durante el ajuste se congelaron los embeddings de palabras (word embeddings frozen).

El corpus de entrenamiento es un banco de conocimiento empresarial con datos sintéticos de tamaño reducido, orientado a consultas en árabe, inglés y mixtas. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO (no aplicables en un reranker). La innovación principal no es arquitectónica sino de dominio: el ajuste específico para recuperación bilingüe árabe-inglés sobre un pipeline híbrido BM25 + e5 + RRF.

## Capacidades

- Puntuación de relevancia consulta-documento para reordenación en pipelines de recuperación (text-ranking).
- Recuperación bilingüe árabe-inglés, incluyendo consultas en un idioma con documentos relevantes en el otro.
- Manejo de consultas mixtas (code-switching) árabe-inglés.
- Integración con la librería sentence-transformers mediante la clase CrossEncoder.
- Salida de relevancia tipo sigmoide, apta para umbrales de filtrado.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un modelo de ranking.

## Casos de uso

- RAG empresarial bilingüe: reordenar los candidatos recuperados por BM25 o un bi-encoder denso antes de pasarlos al generador, mejorando la precisión del contexto inyectado en entornos donde la documentación mezcla árabe e inglés.
- Atención al cliente en árabe e inglés: puntuar respuestas candidatas de una base de conocimiento para que el agente generativo reciba los fragmentos más relevantes, con independencia del idioma de la consulta del usuario.
- Búsqueda interna en organizaciones del Golfo Pérsico o multinacionales: indexar documentación en MSA e inglés y usar el reranker como segunda fase para consultas cruzadas.
- Filtrado de duplicados y ruido en pipelines de recuperación: usar la puntuación sigmoide con un umbral para descartar documentos poco relevantes antes de la generación.
- Evaluación de sistemas de recuperación: servir como componente de referencia en pruebas A/B de pipelines híbridos (BM25 + denso + RRF + reranker).
- Despliegue autoalojado con requisitos de privacidad: al ser un modelo de 306 M de parámetros con licencia Apache 2.0, puede ejecutarse en infraestructura propia sin enviar datos a terceros.

## Benchmarks y rendimiento

Resultados del autor sobre un conjunto de test retenido (10 documentos no vistos, 138 preguntas, RTX 3050 Laptop), comparando el pipeline híbrido completo (BM25 + e5 ajustado → RRF → este reranker) con base frente a fine-tuned:

| Metrica | Base | Fine-tuned |
|---|---|---|
| Recall@1 | 0,717 | 0,783 |
| MRR | 0,786 | 0,849 |
| nDCG@10 | 0,810 | 0,873 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BEIR, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB solo para pesos (306 M × 4 bytes), más overhead de activaciones y tokenizador; en fp16, alrededor de 0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor reporta entrenamiento e inferencia en una RTX 3050 Laptop.
- Cabe en GPU de consumo: sí, en RTX 3050, RTX 3060, RTX 4060 y superiores; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: sentence-transformers (CrossEncoder), y potencialmente ONNX o cuantización a int8 mediante herramientas externas (no documentadas por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| hams-gte-reranker-ar-en | 306 M | no disponible | ar, en | Apache 2.0 | Fine-tune específico para árabe-inglés; evaluación propia limitada |
| Alibaba-NLP/gte-multilingual-reranker-base | no disponible | no disponible | multilingüe | no disponible | Modelo base; sin ajuste específico para árabe-inglés |
| BAAI/bge-reranker-v2-m3 | no disponible | no disponible | multilingüe | no disponible | Alternativa multilingüe popular; no evaluada en la información disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El entrenamiento se realizó sobre un corpus sintético pequeño; el propio autor advierte que las ganancias pueden ser menores en dominios muy diferentes.
- La evaluación se hizo con solo 10 documentos no vistos y 138 preguntas, lo que limita la significación estadística de los resultados.
- No es un modelo generativo: no puede usarse para responder preguntas directamente, solo para puntuar relevancia.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí riesgo de puntuaciones mal calibradas fuera del dominio de entrenamiento.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un corpus empresarial sintético, puede reflejar sesgos de ese corpus.
- Limitaciones de contexto e idioma: solo árabe (MSA) e inglés; no se documenta la longitud máxima de secuencia.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Alibaba-NLP/gte-multilingual-reranker-base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/AbdelrahmanHassan/hams-gte-reranker-ar-en
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-multilingual-reranker-base
