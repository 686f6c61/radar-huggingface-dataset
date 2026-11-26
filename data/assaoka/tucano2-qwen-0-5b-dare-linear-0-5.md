# Assaoka/Tucano2-qwen-0.5B-DARE-Linear-0.5

## Resumen

Tucano2-qwen-0.5B-DARE-Linear-0.5 es un modelo de lenguaje pequeno (SLM) en portugues de Brasil obtenido mediante fusion de modelos (model merging). Lo desarrolla Assaoka y se construye combinando cinco especialistas de sentimiento y emociones, todos ellos ajustados a partir de Tucano2-qwen-0.5B, un modelo de 0,5 mil millones de parametros basado en la arquitectura Qwen3.

El modelo resuelve un problema concreto: obtener un unico checkpoint capaz de abordar multiples tareas de clasificacion de sentimiento y emociones en portugues (resenas de libros, noticias financieras, categorias emocionales multietiqueta y emociones en redes sociales) sin necesidad de mantener cinco modelos separados en produccion. Para ello aplica la tecnica DARE-Linear con densidad 0,5 mediante mergekit, con pesos iguales de 0,20 para cada especialista.

Su relevancia es doble: por un lado, demuestra que la fusion de SLMs permite consolidar tareas especializadas en un solo artefacto de 490,8 millones de parametros y licencia Apache 2.0; por otro, forma parte del trabajo presentado en ENIAC 2026 "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", lo que lo convierte en una referencia academica reproducible para experimentos de merging en lenguas de recursos medios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajustado para clasificacion mediante decodificacion guiada |
| Parametros totales | 490.799.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de la familia Tucano2-qwen-0.5B, un transformer decoder-only de tipo Qwen3 con 490,8 millones de parametros. No se entrena desde cero: se obtiene por fusion de cinco especialistas derivados del mismo tronco (FinBERT, ReLiSA, Brighter, Phrasebank y GoEmotions), cada uno ajustado sobre un corpus distinto de sentimiento o emociones en portugues. La fusion se realiza con DARE-Linear, un metodo que poda los deltas de los pesos (con densidad 0,5, es decir, se conserva el 50 % de los cambios) y los reescala antes de combinarlos, con pesos uniformes de 0,20 por especialista.

Los datos de entrenamiento indirectos son los de los especialistas: ReLi-SA (resenas de libros), BRIGHTER ptbr (6 emociones multietiqueta), Sentiments-FinBERT-PT-BR (noticias financieras), Financial Phrasebank PT-BR (frases financieras) y GoEmotions PT-BR (28 emociones, con un 50 % de split aleatorio de entrenamiento). No se documenta el numero total de tokens ni si hubo RLHF o DPO; el ajuste de los especialistas es SFT supervisado sobre tareas de clasificacion. La innovacion tecnica destacable es el propio pipeline de merging: un "one-shot flat merge" que evita reentrenar y permite comparar la fusion contra un baseline conjunto (Joint) multi-tarea. La evaluacion se realiza con decodificacion guiada via vLLM y Pydantic.

## Capacidades

- Clasificacion de sentimiento en portugues (positivo/negativo/neutro) sobre dominios financiero, resenas y frases genericas.
- Clasificacion de emociones multietiqueta (BRIGHTER, 6 categorias) y de emociones finas (GoEmotions PT-BR, 28 categorias).
- Generacion de texto conversacional heredada del tronco Qwen3, aunque el ajuste esta orientado a tareas de clasificacion.
- Salida estructurada mediante decodificacion guiada (esquemas Pydantic), lo que facilita su integracion como clasificador en pipelines.
- Capacidades multilingues limitadas: el modelo esta especializado en portugues de Brasil; no se documenta rendimiento en otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Analisis de sentimiento de noticias financieras: el modelo alcanza 75,05 % de Macro F1 en Sentiments-FinBERT-PT-BR y 73,35 % en Financial Phrasebank PT-BR, por lo que es adecuado para monitorizar tono de mercado en portugues con un unico checkpoint.
- Moderacion de comunidades y redes sociales: con GoEmotions PT-BR puede etiquetar emociones en comentarios y priorizar revision humana, aunque su Macro F1 de 14,5 % en esa tarea exige umbrales conservadores.
- Analisis de resenas de productos o libros: util para agregar sentimiento a gran escala en catalogos en portugues, con la cautela de su 46,37 % de Macro F1 en ReLi-SA.
- Enrutamiento de tickets de atencion al cliente: clasificar el tono emocional de mensajes entrantes para derivar a colas especializadas, aprovechando el bajo coste de un modelo de 0,5 B.
- Investigacion en model merging: sirve como artefacto reproducible para comparar DARE-Linear frente a otras tecnicas de fusion y frente al entrenamiento conjunto multi-tarea.
- Clasificacion por lotes en entornos con recursos limitados: al tener 490,8 millones de parametros, puede desplegarse en una sola GPU consumer para procesar volumenes altos de texto en portugues.
- Extraccion de senales para dashboards de reputacion de marca: combinar las salidas de sentimiento y emocion para alimentar metricas agregadas por sector o producto.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), con Macro F1 y comparacion frente al baseline zero-shot y al baseline Joint multi-tarea:

| Dataset / tarea | Metrica | Modelo | Baseline | Joint |
|---|---|---|---|---|
| ReLi-SA (sentimiento) | Macro F1 | 46,37 % | 30,66 % | 59,51 % |
| BRIGHTER ptbr (emociones) | Macro F1 | 39,02 % | no disponible | no disponible |
| Sentiments-FinBERT-PT-BR | Macro F1 | 75,05 % | no disponible | no disponible |
| Financial Phrasebank PT-BR | Macro F1 | 73,35 % | no disponible | no disponible |
| GoEmotions PT-BR | Macro F1 | 14,50 % | no disponible | no disponible |

En ReLi-SA el modelo supera al baseline zero-shot (46,37 % frente a 30,66 %) pero queda por debajo del Joint (59,51 %). No se han publicado en la informacion disponible resultados del baseline y del Joint para el resto de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1 GB para los pesos (490,8 M de parametros), mas overhead de activaciones y cache KV segun longitud de secuencia.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,5-0,6 GB; en 4 bits, alrededor de 0,3 GB (estimaciones, no documentadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en A100/H100 para despliegues de alto throughput.
- Cabe holgadamente en GPU consumer, e incluso en CPU para inferencia por lotes con llama.cpp u Ollama si se generan pesos GGUF (no publicados).
- Opciones de despliegue: transformers, vLLM (usado por el autor con decodificacion guiada y Pydantic) y text-generation-inference; llama.cpp y Ollama requeririan conversion a GGUF no disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-DARE-Linear-0.5 | 490,8 M | no disponible | Fusion DARE-Linear de 5 especialistas PT | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct (baseline) | ~0,5 B | no disponible | Instruccion generalista PT | no disponible | Hugging Face |
| Baseline Joint multi-tarea (mismo paper) | ~0,5 B | no disponible | SFT conjunto en 5 tareas PT | no disponible | no disponible |
| Especialistas individuales (FinBERT, ReLiSA, Brighter, Phrasebank, GoEmotions) | ~0,5 B cada uno | no disponible | SFT por tarea | Apache 2.0 (segun repositorio del autor) | Hugging Face |

La comparativa se limita al ecosistema del propio paper; no se dispone de datos de otros SLM portugueses comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento desigual: el Macro F1 de 14,50 % en GoEmotions PT-BR y el 39,02 % en BRIGHTER indican que las tareas emocionales finas no estan resueltas y el modelo no deberia usarse sin supervision en esos casos.
- El baseline Joint supera al modelo en ReLi-SA (59,51 % frente a 46,37 %), lo que sugiere que la fusion no siempre compensa el entrenamiento multi-tarea conjunto.
- Especializado exclusivamente en portugues de Brasil; no se documenta comportamiento en portugues europeo ni en otros idiomas.
- Riesgo de alucinacion y de etiquetas inconsistentes al ser un modelo generativo usado como clasificador; la decodificacion guiada mitiga pero no elimina el problema.
- No se documentan sesgos demograficos ni de dominio; los datasets de origen (resenas, finanzas, redes sociales) pueden introducir sesgos de genero, tono o sector.
- No se publican pesos cuantizados ni GGUF, lo que limita el despliegue en entornos sin GPU.
- Licencia Apache 2.0 permite uso comercial, pero el autor solo garantiza el alojamiento publico durante al menos un ano tras la finalizacion de la tesis (diciembre de 2026); conviene conservar una copia local.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-DARE-Linear-0.5
- Paper ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del paper: https://doi.org/10.5753/eniac.2026.31064
- Coleccion Hugging Face "United Experts": https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Especialista FinBERT: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-FinBERT
- Especialista ReLiSA: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-ReLiSA
- Especialista Brighter: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Brighter
- Especialista Phrasebank: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Phrasebank
- Especialista GoEmotions: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions
- Dataset ReLi-SA: https://github.com/ruanchaves/reli
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset Financial Phrasebank PT-BR: https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
