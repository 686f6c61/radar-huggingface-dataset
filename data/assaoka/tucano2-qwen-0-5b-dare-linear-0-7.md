# Assaoka/Tucano2-qwen-0.5B-DARE-Linear-0.7

## Resumen

Tucano2-qwen-0.5B-DARE-Linear-0.7 es un modelo de lenguaje pequeno (SLM) en portugues de Brasil obtenido mediante fusion de modelos (model merging) con la tecnica DARE-Linear y una densidad de poda de 0.7. Lo desarrolla el autor independiente Assaoka como parte del articulo "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", presentado en ENIAC 2026. El modelo parte de Qwen3-0.5B y combina cinco especialistas de dominio entrenados por el mismo autor sobre tareas de analisis de sentimiento y clasificacion de emociones en portugues.

El objetivo es cubrir multiples tareas de clasificacion afectiva (sentimiento financiero, emociones en redes sociales, resenas de libros, categorias emocionales BRIGHTER y GoEmotions PT-BR) con un unico conjunto de pesos de aproximadamente 491 millones de parametros, evitando mantener cinco modelos separados. La fusion DARE-Linear interpola los pesos de los especialistas tras podar el 70% de los deltas de tarea, lo que reduce interferencias entre dominios.

Es relevante porque demuestra que la fusion de SLMs puede ofrecer cobertura multi-tarea con un coste de inferencia minimo, sin necesidad de un LLM grande. La evaluacion se realizo con decodificacion guiada mediante vLLM y Pydantic, lo que indica un diseno orientado a produccion con salidas estructuradas. La licencia Apache 2.0 y el tamano reducido lo hacen apto para despliegues en CPU o GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.5B) |
| Parametros totales | 490.799.104 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no declaradas) |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es una fusion de cinco especialistas derivados de Qwen3-0.5B, cada uno ajustado por separado sobre un dataset de sentimiento o emociones en portugues: FinBERT-PT-BR (noticias financieras), ReLiSA (resenas de libros), Brighter (6 emociones multi-etiqueta), Phrasebank (frases financieras traducidas) y GoEmotions PT-BR (28 emociones, con un 50% de split de entrenamiento aleatorio). La fusion se realizo con mergekit aplicando DARE-Linear con densidad 0.7 y pesos iguales de 0.20 para cada especialista, lo que implica podar el 70% de los deltas de cada tarea antes de promediar, reduciendo el ruido y la interferencia entre dominios.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset agregado ni si hubo fases de RLHF o DPO. Tampoco se especifica la longitud de contexto nativa del modelo base. La innovacion principal es metodologica: la ablacion de densidad de poda (DARE-Linear) sobre SLMs multilingues para clasificacion multi-tarea, con evaluacion mediante decodificacion guiada (vLLM + Pydantic) para forzar salidas estructuradas conformes a un esquema.

## Capacidades

- Generacion de texto en portugues de Brasil con foco en tareas de clasificacion afectiva.
- Clasificacion de sentimiento (positivo, negativo, neutro) en dominios financiero y de resenas.
- Clasificacion de emociones multi-etiqueta (BRIGHTER: 6 categorias; GoEmotions PT-BR: 28 categorias).
- Salidas estructuradas mediante decodificacion guiada con Pydantic y vLLM.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta orientado a clasificacion, no a razonamiento agentico.
- Capacidades multilingues: limitadas al portugues (PT-BR); no se declaran otros idiomas.
- Capacidades especiales: no se declaran modos de pensamiento, vision ni audio.

## Casos de uso

- Analisis de sentimiento en noticias financieras: el modelo puede clasificar titulares y comunicados en portugues como positivos, negativos o neutros, aprovechando el especialista FinBERT-PT-BR fusionado; es adecuado para monitorizacion de mercados en tiempo casi real por su bajo coste computacional.
- Moderacion de comunidades y redes sociales: clasificacion de emociones en comentarios (alegria, tristeza, ira, etc.) con el especialista GoEmotions PT-BR, util para priorizar revision humana en foros y plataformas en portugues.
- Analisis de resenas de productos o libros: el especialista ReLiSA permite extraer polaridad de resenas literarias y de comercio electronico, integrable en pipelines de analitica de opinion.
- Enrutamiento de tickets de atencion al cliente: clasificar el sentimiento y la emocion de un mensaje entrante para dirigirlo al equipo adecuado o activar respuestas automatizadas, con salidas estructuradas via decodificacion guiada.
- Investigacion academica en PLN en portugues: sirve como baseline reproducible de fusion de modelos para comparar con ajuste fino multi-tarea conjunto, con pesos y configuracion de merge publicados.
- Despliegue en entornos con recursos limitados: al tener menos de 500M de parametros, puede ejecutarse en CPU o en GPU de consumo para tareas de clasificacion por lotes, sin depender de infraestructura de centro de datos.
- Analisis de encuestas y feedback abierto: clasificacion masiva de respuestas de texto libre en portugues para agregar sentimiento y emociones en estudios de mercado o de experiencia de empleado.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index de la model card, no verificados de forma independiente), metrica Macro F1:

| Dataset / tarea | Metrica | Tucano2-qwen-0.5B-DARE-Linear-0.7 |
|---|---|---|
| ReLi-SA (sentimiento, resenas) | Macro F1 | 46.42 |
| BRIGHTER ptbr (emociones, 6 categorias) | Macro F1 | 38.99 |
| Sentiments-FinBERT-PT-BR (sentimiento financiero) | Macro F1 | 75.05 |
| Financial Phrasebank PT-BR (sentimiento financiero) | Macro F1 | 73.56 |
| GoEmotions PT-BR (emociones, 28 categorias) | Macro F1 | 14.62 |

La model card menciona comparaciones frente a un baseline zero-shot (Polygl0t/Tucano2-qwen-0.5B-Instruct) y un baseline de ajuste fino multi-tarea conjunto (Joint), pero en la informacion disponible solo se incluye parcialmente la fila de ReLi-SA del baseline zero-shot (Macro F1 30.66, Micro F1 37.07, Accuracy 37.0), por lo que no se presenta la comparativa completa.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 1 GB para los 490.799.104 parametros (unos 0.98 GB solo en pesos, mas overhead de activaciones y cache KV).
- VRAM estimada en cuantizacion de 8 bits: en torno a 0.5 GB; en 4 bits: en torno a 0.25-0.3 GB (estimaciones teoricas a partir del numero de parametros; no se publican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradas para el modelo, que queda limitado por latencia mas que por memoria.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3050 y superiores) y puede ejecutarse en CPU para lotes pequenos.
- Opciones de despliegue: transformers (libreria declarada), vLLM (usado por el autor para la evaluacion con decodificacion guiada), text-generation-inference (tag presente) y endpoints compatibles. Soporte de llama.cpp/Ollama no declarado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-DARE-Linear-0.7 | 490.799.104 | no disponible | Fusion DARE-Linear de 5 especialistas PT-BR | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct (baseline zero-shot) | ~0.5B (Qwen3-0.5B) | no disponible | Instruccion general en portugues | no disponible en la informacion | Hugging Face |
| Assaoka/Tucano2-qwen-0.5B-FinBERT (especialista padre) | ~0.5B | no disponible | Sentimiento financiero PT-BR | Apache 2.0 | Hugging Face |
| Assaoka/Tucano2-qwen-0.5B-GoEmotions (especialista padre) | ~0.5B | no disponible | Emociones PT-BR (28 categorias) | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, salvo el valor parcial del baseline zero-shot en ReLi-SA (Macro F1 30.66), inferior al 46.42 del modelo fusionado en esa tarea.

## Limitaciones y advertencias

- Resultados de benchmarks declarados por el autor y marcados como no verificados; no han pasado una evaluacion independiente.
- Rendimiento muy desigual entre tareas: Macro F1 de 14.62 en GoEmotions PT-BR frente a 75.05 en Sentiments-FinBERT-PT-BR, lo que sugiere que la fusion no preserva igual de bien todas las capacidades de los especialistas.
- El modelo esta especializado en clasificacion de sentimiento y emociones; no es un modelo de proposito general ni un asistente conversacional robusto, pese al tag "conversational".
- Idioma limitado al portugues de Brasil; no se declara soporte de otros idiomas, incluido el castellano.
- Riesgo de alucinacion y de salidas no conformes si no se usa decodificacion guiada con un esquema Pydantic; el autor evalua con ese mecanismo, por lo que el comportamiento sin el puede degradarse.
- Sesgos potenciales derivados de los datasets de origen (resenas de libros, noticias financieras, redes sociales), con posible desequilibrio de dominios y de registro linguistico.
- Longitud de contexto no documentada; no se recomienda su uso en tareas que requieran ventanas largas sin verificacion previa.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento (por ejemplo, Financial Phrasebank procede de Kaggle) antes de un despliegue comercial.
- Politica de retencion: el autor garantiza el alojamiento publico durante al menos un ano tras la finalizacion de la tesis (diciembre de 2026), sin compromiso de permanencia a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-DARE-Linear-0.7
- Articulo ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del articulo: https://doi.org/10.5753/eniac.2026.31064
- Coleccion de Hugging Face "United Experts": https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Especialista FinBERT: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-FinBERT
- Especialista ReLiSA: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-ReLiSA
- Especialista Brighter: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Brighter
- Especialista Phrasebank: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Phrasebank
- Especialista GoEmotions: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions
- Dataset ReLi-SA: https://github.com/ruanchaves/reli
- Dataset BRIGHTER (ptbr): https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset Financial Phrasebank PT-BR: https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
