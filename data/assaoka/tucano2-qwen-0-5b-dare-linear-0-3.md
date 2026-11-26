# Assaoka/Tucano2-qwen-0.5B-DARE-Linear-0.3

## Resumen
Tucano2-qwen-0.5B-DARE-Linear-0.3 es un modelo de lenguaje pequeno (SLM) en portugues de Brasil (PT-BR) obtenido mediante fusion de modelos (model merging) con la tecnica DARE-Linear y densidad 0.3. Lo desarrolla Assaoka como parte del trabajo de investigacion "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", presentado en ENIAC 2026. El modelo parte de Qwen3 y se construye fusionando cinco especialistas de dominio afinados sobre Tucano2-qwen-0.5B, cada uno orientado a una tarea distinta de analisis de sentimiento y clasificacion de emociones.

El problema que resuelve es el de consolidar varios especialistas de analisis de sentimiento en portugues (resenas de libros, noticias financieras, emociones multilabel y emociones de redes sociales) en un unico modelo de 490.799.104 parametros, sin necesidad de desplegar cinco modelos separados. La fusion DARE-Linear elimina parte de los deltas de tarea redundantes antes de combinar los pesos, lo que permite retener buena parte del rendimiento de cada especialista en un solo artefacto.

Es relevante ahora por su caracter experimental y reproducible: forma parte de un ablation study sobre densidad de poda en fusion de modelos, esta publicado con licencia Apache 2.0 y se evalua con decodificacion guiada (vLLM + Pydantic) sobre cinco benchmarks portugueses. El modelo esta orientado a clasificacion de sentimiento y emociones, no a generacion de texto abierta, y su ventana de contexto no esta documentada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivada de Qwen3 (familia Tucano2-qwen-0.5B) |
| Parametros totales | 490.799.104 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes GGUF/AWQ/GPTQ documentadas) |
| Idiomas soportados | portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de aproximadamente 0,5 mil millones de parametros, heredado de la familia Tucano2-qwen-0.5B, que a su vez se basa en Qwen3 adaptado al portugues. No se trata de un entrenamiento desde cero: los pesos se obtienen fusionando cinco modelos especialistas afinados por el mismo autor sobre la misma base: Tucano2-qwen-0.5B-FinBERT (noticias financieras), Tucano2-qwen-0.5B-ReLiSA (resenas de libros), Tucano2-qwen-0.5B-Brighter (emociones multilabel), Tucano2-qwen-0.5B-Phrasebank (frases financieras) y Tucano2-qwen-0.5B-GoEmotions (emociones de redes sociales).

La tecnica de fusion es DARE-Linear con densidad 0.3: antes de combinar los pesos, se aplica poda aleatoria de los deltas de tarea (drop de parametros delta) y posteriormente se reescalan los pesos restantes, asignando pesos iguales de 0.20 a cada uno de los cinco especialistas mediante mergekit. Esta variante forma parte de un ablation study sobre densidad de poda, comparando distintas densidades (el sufijo 0.3 indica la densidad usada). No se documentan en la informacion disponible el numero de tokens de entrenamiento de los especialistas, la composicion exacta de sus datasets ni si se aplico RLHF o DPO. Los datasets de evaluacion y entrenamiento citados son ReLi-SA, BRIGHTER (ptbr), Sentiments-FinBERT-PT-BR, Financial Phrasebank PT-BR y GoEmotions PT-BR (con un 50 % de split de entrenamiento aleatorio para este ultimo).

## Capacidades
- Clasificacion de sentimiento en portugues (positivo, negativo, neutro) sobre dominios como resenas de libros, noticias financieras y frases financieras.
- Clasificacion de emociones multilabel: seis categorias en BRIGHTER y hasta 28 emociones en GoEmotions PT-BR.
- Generacion de texto en portugues derivada de la base instructiva Qwen3/Tucano2, aunque su uso principal es la clasificacion.
- Soporte de decodificacion guiada mediante vLLM y Pydantic, lo que permite forzar salidas estructuradas y etiquetas validas.
- Integracion con el pipeline text-generation de transformers y endpoints compatibles con Text Generation Inference.
- Capacidades multilingues limitadas: el modelo esta especializado en portugues de Brasil; no se documenta rendimiento en otros idiomas.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso
- Analisis de sentimiento de resenas de libros: clasificar resenas en ReLi-SA para detectar opinion positiva o negativa; el modelo esta afinado especificamente sobre este corpus y retiene parte del rendimiento del especialista original (Macro F1 46,31 %).
- Monitorizacion de sentimiento financiero: procesar titulares y frases de noticias economicas en PT-BR con el dominio FinBERT/Phrasebank; util para alertas de mercado o resumen de tono de prensa economica.
- Moderacion y analisis de emociones en redes sociales: clasificar comentarios en las 28 categorias de GoEmotions PT-BR para priorizar casos de toxicidad o frustracion, con la cautela de que el Macro F1 en este dominio es bajo (14,45 %).
- Etiquetado de emociones multilabel en encuestas o feedback de clientes: usar BRIGHTER (ptbr) para asignar varias emociones simultaneas a un mismo texto, agregando resultados por segmento.
- Pipeline de enriquecimiento de datos: generar etiquetas de sentimiento y emociones sobre grandes volumenes de texto portugues para alimentar dashboards o sistemas de recomendacion.
- Clasificacion con salida estructurada en produccion: desplegar con vLLM y Pydantic para forzar etiquetas validas y evitar respuestas fuera de catalogo en APIs de analisis de sentimiento.
- Investigacion y reproduccion de fusion de modelos: servir como punto de partida para estudiar el efecto de la densidad DARE en fusion multi-tarea, comparando con las otras densidades del ablation.

## Benchmarks y rendimiento
Resultados declarados por el autor (no verificados), evaluados con decodificacion guiada via vLLM + Pydantic:

| Dataset / Tarea | Metrica | Tucano2-qwen-0.5B-DARE-Linear-0.3 |
|---|---|---|
| ReLi-SA (sentimiento) | Macro F1 | 46,31 |
| BRIGHTER ptbr (emociones) | Macro F1 | 38,76 |
| Sentiments-FinBERT-PT-BR (sentimiento financiero) | Macro F1 | 75,05 |
| Financial Phrasebank PT-BR (sentimiento financiero) | Macro F1 | 73,46 |
| GoEmotions PT-BR (emociones) | Macro F1 | 14,45 |

En la model card se comparan estos valores con un baseline zero-shot (Polygl0t/Tucano2-qwen-0.5B-Instruct) y con un baseline Joint multi-task SFT. Para ReLi-SA, el modelo alcanza 46,31 % de Macro F1 y 69,22 % de Micro F1 y accuracy, frente a 30,66 % / 37,07 % / 37,07 % del baseline zero-shot; el baseline Joint obtiene 59,51 % de Macro F1 y 74,51 % de Micro F1. El resto de comparaciones con Joint no esta completo en la informacion disponible. No se han publicado en la informacion disponible resultados de benchmarks generales tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1 GB para los 490,8 M de parametros, mas overhead de activaciones y cache KV; en la practica unos 1,5-2 GB.
- En cuantizacion de 8 bits: alrededor de 0,5 GB de pesos; en 4 bits: unos 0,25 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090) es suficiente; para despliegue por lotes se recomienda A100 o H100 por throughput, no por requisito de memoria.
- Cabe holgadamente en GPU consumer, incluida una GTX 1650 de 4 GB en fp16 con contexto moderado.
- Opciones de despliegue: transformers, vLLM (usado por el autor con decodificacion guiada y Pydantic), Text Generation Inference (endpoints_compatible) y llama.cpp/Ollama solo si se generan pesos GGUF, que no estan publicados.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera un throughput alto en vLLM, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 ReLi-SA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-DARE-Linear-0.3 | 490,8 M | no disponible | 46,31 | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct (baseline zero-shot) | ~0,5 B | no disponible | 30,66 | no disponible | Hugging Face |
| Baseline Joint multi-task SFT | ~0,5 B | no disponible | 59,51 | no disponible | Referenciado en la model card |
| Especialistas individuales (FinBERT, ReLiSA, Brighter, Phrasebank, GoEmotions) | ~0,5 B cada uno | no disponible | rendimiento por dominio no detallado | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de otros SLM portugueses comparables (por ejemplo, variantes de Tucano o BERTimbau) en la informacion proporcionada.

## Limitaciones y advertencias
- El modelo es una fusion experimental: pierde rendimiento frente al baseline Joint multi-task SFT en ReLi-SA (46,31 % frente a 59,51 % de Macro F1), por lo que no es la mejor opcion cuando se busca maxima precision.
- Macro F1 muy bajo en GoEmotions PT-BR (14,45 %), lo que sugiere poca fiabilidad en clasificacion fina de emociones en redes sociales.
- Especializado en portugues de Brasil; no se documenta rendimiento en portugues europeo ni en otros idiomas, y el sesgo hacia PT-BR puede degradar resultados en variantes linguisticas distintas.
- Riesgo de alucinacion y de etiquetas invalidas si se usa como generador libre; el autor recomienda decodificacion guiada con Pydantic para forzar salidas validas.
- No se documentan sesgos demograficos, geograficos o de dominio; al derivar de Qwen3 y de corpus financieros y de redes sociales, puede heredar sesgos de esos datasets.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se publica con una politica de retencion de al menos un ano tras la tesis (diciembre de 2026), sin garantia de disponibilidad a largo plazo.
- No hay pesos cuantizados oficiales ni datos de contexto maximo, lo que limita su uso en tareas que requieran ventanas largas.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-DARE-Linear-0.3
- Articulo ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del articulo: https://doi.org/10.5753/eniac.2026.31064
- Coleccion Hugging Face "United Experts": https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Modelo base FinBERT: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-FinBERT
- Modelo base ReLiSA: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-ReLiSA
- Modelo base Brighter: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Brighter
- Modelo base Phrasebank: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Phrasebank
- Modelo base GoEmotions: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions
- Dataset ReLi-SA: https://github.com/ruanchaves/reli
- Dataset BRIGHTER (ptbr): https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset Financial Phrasebank PT-BR: https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
