# hahang/DariBERT

## Resumen

DariBERT es un modelo de lenguaje enmascarado (masked language model, MLM) basado en la arquitectura BERT, desarrollado por hahang como un proyecto experimental para adaptar el modelo persa ParsBERT al dari, una variedad del persa hablada en Afganistán. El modelo se obtiene mediante fine-tuning de `HooshvareLab/bert-base-parsbert-uncased` sobre un conjunto de datos curado manualmente de 211 entradas de vocabulario dari-persa, con el objetivo de explorar si un modelo persa puede acercarse al uso y vocabulario dari con recursos limitados. Con 162,9 millones de parámetros, mantiene la estructura de BERT-base y se distribuye bajo licencia Apache-2.0. Es relevante para la investigación en procesamiento de lenguaje natural de lenguas de bajos recursos, aunque el propio autor advierte que se trata de un proyecto de aprendizaje y experimentación, no de un modelo completamente entrenado ni apto para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (encoder transformer, masked language model) |
| Parametros totales | 162.942.880 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (típico de BERT-base; no especificado en la documentación, el fine-tuning usó secuencias de 16 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | dari (prs) y persa (fa) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DariBERT conserva la arquitectura BERT-base de su modelo base ParsBERT, un encoder transformer con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, entrenado originalmente con el objetivo de masked language modeling y next sentence prediction. El fine-tuning se realizó con la librería Transformers de Hugging Face, utilizando únicamente el objetivo MLM sobre las entradas dari del conjunto de vocabulario curado. El dataset de entrenamiento consta de 211 entradas manualmente revisadas, organizadas en 24 categorías semánticas (comunicación básica, hogar, familia, comida, tecnología, salud, etc.), con 207 entradas únicas en dari y 204 equivalentes en persa. La configuración de entrenamiento fue deliberadamente ligera: 3 épocas, batch size de 1, learning rate de 5e-5, weight decay de 0,01, longitud máxima de secuencia de 16 tokens, ejecutado en CPU y sin mixed precision. No se emplearon técnicas como RLHF, DPO ni decodificación especulativa. La innovación principal del proyecto reside en su enfoque de adaptación de un modelo multilingüe persa a una variante dialectal de bajos recursos mediante un conjunto de datos mínimo y curado, en lugar de un pretraining a gran escala.

## Capacidades

- Predicción de tokens enmascarados (fill-mask) en frases en dari y persa, devolviendo candidatos con puntuaciones de probabilidad.
- Exploración de vocabulario dari y comparación léxica con el persa, gracias al conjunto de pares dari-persa utilizado en el fine-tuning.
- Adaptación léxica limitada: el modelo tiende a preferir términos dari en contextos donde el persa usaría otras palabras, aunque con cobertura restringida al vocabulario curado.
- Fine-tuning posterior para tareas downstream de NLP en dari, como clasificación de texto o extracción de entidades, partiendo de una base ya ajustada al dominio.
- No dispone de soporte para tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multimodales.
- Multilingüismo parcial: funciona con dari y persa, pero su conocimiento fuera de estas variantes es el heredado de ParsBERT.

## Casos de uso

- Investigación en NLP de lenguas de bajos recursos: DariBERT sirve como caso de estudio para evaluar si el fine-tuning con datos mínimos puede acercar un modelo persa al dari, permitiendo comparar resultados con otros enfoques de adaptación.
- Exploración de vocabulario dari: lingüistas y estudiantes pueden usar el modelo para predecir términos enmascarados en frases dari y observar qué palabras propone, facilitando el estudio de diferencias léxicas con el persa.
- Comparación léxica dari-persa: el modelo puede emplearse para generar candidatos de traducción o equivalencias entre ambas variantes, aunque con las limitaciones de su pequeño vocabulario.
- Educación en procesamiento de lenguaje natural: sirve como ejemplo práctico de fine-tuning de un modelo BERT sobre un dominio específico, ilustrando conceptos como MLM, tokenización y adaptación de modelos.
- Fine-tuning para tareas downstream: investigadores pueden partir de DariBERT y ajustarlo con datasets más grandes para tareas como análisis de sentimiento, clasificación de documentos o reconocimiento de entidades en dari.
- Experimentación con técnicas de adaptación de modelos: el proyecto permite probar estrategias como el uso de vocabularios curados, ajuste de hiperparámetros y evaluación de la transferencia entre variantes lingüísticas cercanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas como MMLU, GLUE, HumanEval o similares, y no se han encontrado evaluaciones externas del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB con pesos en precisión float32 (162,9 millones de parámetros × 4 bytes), por lo que cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más, como NVIDIA GTX 1650, RTX 2060, RTX 3060 o superiores. También puede ejecutarse en CPU sin problemas para inferencia puntual.
- El entrenamiento se realizó en CPU, lo que confirma que el modelo es viable en entornos sin GPU.
- Opciones de despliegue: compatible con la librería Transformers de Hugging Face mediante el pipeline `fill-mask`, y puede servirse con herramientas como FastAPI o Hugging Face Inference Endpoints. No se menciona soporte explícito para vLLM, llama.cpp u Ollama, aunque al ser un modelo BERT estándar podría adaptarse.
- Latencia y throughput: no se han publicado mediciones. En CPU, una inferencia de una frase corta (menos de 16 tokens) tarda típicamente entre 0,1 y 0,5 segundos; en GPU, el tiempo es inferior a 10 milisegundos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El único modelo directamente relacionado es su base, `HooshvareLab/bert-base-parsbert-uncased`, del que hereda arquitectura y pesos, pero no existen datos de rendimiento comparativo entre ambos. Otros modelos como DarijaBERT (árabe marroquí) o DarkBERT (dark web) no son comparables por idioma y dominio. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Proyecto experimental: el propio autor indica que DariBERT v1.0 no debe considerarse un modelo dari completamente entrenado ni un reemplazo de un modelo NLP dari a gran escala.
- Dataset de entrenamiento muy reducido: solo 211 entradas de vocabulario, lo que limita severamente la cobertura léxica y la generalización a frases fuera del conjunto curado.
- Entrenamiento en CPU y sin optimización: el fine-tuning se realizó con batch size 1, 3 épocas y secuencias de 16 tokens, lo que puede provocar un ajuste insuficiente o sobreajuste al pequeño dataset.
- Sesgos heredados de ParsBERT: al partir de un modelo persa, DariBERT puede conservar sesgos culturales, geográficos o lingüísticos del persa iraní, que no siempre coinciden con el uso dari.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar predicciones plausibles pero incorrectas, especialmente con vocabulario fuera de su dominio de entrenamiento.
- Limitaciones de contexto: la longitud máxima de secuencia es de 512 tokens (típica de BERT-base), pero el fine-tuning se realizó con 16 tokens, por lo que el modelo puede comportarse de forma subóptima con frases largas.
- No apto para producción: sin benchmarks, sin validación externa y con un alcance tan limitado, no se recomienda su uso en aplicaciones comerciales o críticas.
- Restricciones de licencia: aunque la licencia Apache-2.0 permite uso comercial, la naturaleza experimental del modelo y su falta de garantías lo desaconsejan para entornos productivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hahang/DariBERT
- Modelo base ParsBERT: https://huggingface.co/HooshvareLab/bert-base-parsbert-uncased
- No se han encontrado papers, repositorios de código, demos o blogs adicionales asociados a DariBERT en la búsqueda web realizada.
