# Assaoka/Tucano2-qwen-0.5B-TaskAdd-E-Merge

## Resumen

Tucano2-qwen-0.5B-TaskAdd-E-Merge es un modelo de lenguaje pequeno (SLM) de 0,5 mil millones de parametros especializado en analisis de sentimiento y clasificacion de emociones en portugues de Brasil. Lo desarrolla Assaoka como parte del articulo *"United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging"* presentado en ENIAC 2026, y se construye mediante la fusion (merging) de cinco checkpoints especializados derivados de la familia Tucano2-Qwen.

La relevancia del modelo reside en su enfoque metodologico: en lugar de entrenar un unico modelo multi-tarea desde cero, el autor aplica una pipeline de adicion iterativa de tareas con pesos iguales y finaliza con TIES-Merging para consolidar las capacidades de cinco dominios distintos (emociones en redes sociales, resenas de libros, noticias financieras y frases financieras) en un solo conjunto de pesos de 0,5B. Esto permite obtener un clasificador multi-tarea compacto y desplegable en hardware modesto.

El modelo se distribuye con licencia Apache 2.0, soporta unicamente portugues y esta pensado para tareas de clasificacion via generacion de texto (text-generation) con decodificacion guiada, no como un modelo conversacional generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Tucano2-Qwen 0.5B) |
| Parametros totales | 0,5 mil millones (500M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato transformers; no se indica GGUF) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion TIES-Merging (`weight = 0.20`, `density = 0.50`) de cinco checkpoints obtenidos secuencialmente en una pipeline de adicion iterativa de tareas con pesos iguales. Los cinco modelos padre son: `Tucano2-qwen-0.5B-GoEmotions`, `Tucano2-qwen-0.5B-TaskAdd-Brighter`, `Tucano2-qwen-0.5B-TaskAdd-E-ReLiSA`, `Tucano2-qwen-0.5B-TaskAdd-E-Phrasebank` y `Tucano2-qwen-0.5B-TaskAdd-E-FinBERT`. La base subyacente es Tucano2-Qwen 0.5B, un transformer decoder-only de la familia Qwen adaptado al portugues.

Los datos de entrenamiento provienen de cinco conjuntos en portugues: ReLi-SA (resenas de libros), BRIGHTER ptbr (6 emociones multi-etiqueta), Sentiments-FinBERT-PT-BR (noticias financieras), Financial Phrasebank PT-BR (Kaggle) y GoEmotions PT-BR (28 emociones, con un 50% de split de entrenamiento aleatorio). No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni si se aplico RLHF o DPO. La innovacion tecnica principal es el uso de merging por tareas para evitar el olvido catastrofico y consolidar cinco dominios en un unico checkpoint de 0,5B, evaluado con decodificacion guiada mediante vLLM y Pydantic.

## Capacidades

- Clasificacion de sentimiento en portugues (positivo/negativo/neutro) en dominios financiero y de resenas.
- Clasificacion de emociones multi-etiqueta (6 categorias en BRIGHTER, 28 en GoEmotions PT-BR).
- Generacion de texto condicionada a tareas de clasificacion mediante decodificacion guiada (structured output con Pydantic).
- Capacidad multi-tarea: un unico checkpoint cubre cinco benchmarks distintos sin cambiar de modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al portugues (PT-BR).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Moderacion de comunidades en portugues: clasificar comentarios de usuarios en 28 emociones (GoEmotions PT-BR) para detectar toxicidad o frustracion y priorizar revision humana.
- Analisis de sentimiento de noticias financieras: procesar titulares y textos de Sentiments-FinBERT-PT-BR para alimentar senales de mercado o dashboards de riesgo reputacional.
- Monitorizacion de resenas de productos o libros: usar el checkpoint ReLi-SA para extraer polaridad de resenas y agregar metricas de satisfaccion por lotes.
- Clasificacion de emociones en redes sociales: aplicar BRIGHTER ptbr para segmentar campanas de marketing segun la respuesta emocional del publico.
- Analisis de sentimiento en informes financieros: emplear Financial Phrasebank PT-BR para etiquetar frases de informes trimestrales y detectar tono positivo o negativo.
- Pipeline de etiquetado a gran escala: desplegar el modelo con vLLM y decodificacion guiada para clasificar lotes de textos en produccion con bajo coste computacional.
- Investigacion en merging de modelos: servir como checkpoint de referencia para reproducir experimentos de TIES-Merging y adicion iterativa de tareas en SLMs.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en el model-index, evaluados con decodificacion guiada via vLLM + Pydantic:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Analisis de sentimiento | ReLi-SA | Macro F1 | 46,41 |
| Clasificacion de emociones | BRIGHTER (ptbr) | Macro F1 | 41,75 |
| Analisis de sentimiento | Sentiments-FinBERT-PT-BR | Macro F1 | 67,50 |
| Analisis de sentimiento | Financial Phrasebank PT-BR | Macro F1 | 74,86 |
| Clasificacion de emociones | GoEmotions PT-BR | Macro F1 | 26,38 |

La model card menciona una comparacion frente al baseline zero-shot (`Polygl0t/Tucano2-qwen-0.5B-Instruct`) y frente a un baseline de SFT multi-tarea conjunto, pero la informacion disponible no incluye la tabla completa con esos valores comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en FP16 para 0,5B parametros; menos de 1 GB en cuantizacion de 8 bits o 4 bits (estimacion orientativa, no confirmada en la informacion).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en CPU para lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM.
- Opciones de despliegue: transformers (libreria declarada), vLLM (usado por el autor para evaluacion con decodificacion guiada); compatibilidad con llama.cpp u Ollama no confirmada en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-TaskAdd-E-Merge | 0,5B | no disponible | Multi-tarea PT-BR por merging | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct | 0,5B | no disponible | Instruccion general PT | no disponible | Hugging Face |
| Assaoka/Tucano2-qwen-0.5B-TaskAdd-E-FinBERT | 0,5B | no disponible | Especializado en finanzas PT-BR | Apache 2.0 | Hugging Face |
| Assaoka/Tucano2-qwen-0.5B-GoEmotions | 0,5B | no disponible | Especializado en emociones PT-BR | Apache 2.0 | Hugging Face |

La comparacion cuantitativa de rendimiento frente a estos modelos no esta disponible en la informacion proporcionada; la model card solo referencia el baseline zero-shot y el baseline de SFT conjunto sin detallar sus cifras.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre resenas, noticias financieras y redes sociales, puede heredar sesgos de esos dominios.
- Riesgo de alucinacion: el modelo se evalua como clasificador con decodificacion guiada; usarlo como generador libre de texto aumenta el riesgo de salidas no fiable.
- Limitaciones de contexto o idioma: solo portugues (PT-BR); la longitud de contexto no esta documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de los datasets de origen (algunos con licencias propias, como Financial Phrasebank en Kaggle).
- Caveat para produccion: los resultados de benchmarks son declarados por el autor y no estan verificados (`verified: false`); el modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que carece de validacion comunitaria.
- Politica de retencion: el autor garantiza el alojamiento publico durante al menos 1 ano tras la finalizacion de la tesis (diciembre de 2026), lo que implica un riesgo de disponibilidad a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-TaskAdd-E-Merge
- Articulo ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI: https://doi.org/10.5753/eniac.2026.31064
- Coleccion Hugging Face: https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Modelo padre GoEmotions: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions
- Modelo padre Brighter: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-TaskAdd-Brighter
- Modelo padre ReLiSA: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-TaskAdd-E-ReLiSA
- Modelo padre Phrasebank: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-TaskAdd-E-Phrasebank
- Modelo padre FinBERT: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-TaskAdd-E-FinBERT
- Dataset ReLi-SA: https://github.com/ruanchaves/reli
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset Financial Phrasebank PT-BR: https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
