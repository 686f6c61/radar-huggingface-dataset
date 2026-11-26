# Assaoka/Tucano2-qwen-0.5B-Prior-Phrasebank

## Resumen

Tucano2-qwen-0.5B-Prior-Phrasebank es un modelo de lenguaje pequeno (SLM) de aproximadamente 490 millones de parametros, desarrollado por Assaoka, especializado en analisis de sentimiento y clasificacion de emociones en portugues de Brasil (PT-BR). Se construye mediante la fusion TIES de cuatro especialistas out-of-domain (FinBERT, ReLiSA, Brighter y GoEmotions) sobre la base Qwen3-0.5B, seguida de un ajuste fino supervisado (SFT) sobre el dataset Financial Phrasebank PT-BR. Forma parte del trabajo de investigacion "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", presentado en ENIAC 2026.

El modelo aborda un problema recurrente en el procesamiento de lenguaje natural en portugues: la escasez de modelos ligeros capaces de cubrir multiples tareas de clasificacion afectiva (sentimiento binario, multietiqueta y emociones) sin multiplicar el coste de despliegue. La hipotesis central del trabajo es que una fusion de especialistas heterogeneos puede servir como inicializacion out-of-domain (prior) que, tras un ajuste fino ligero en un dominio concreto, supere a un modelo entrenado de forma conjunta en multiples tareas.

Con 0,5B de parametros, licencia Apache 2.0 y pesos en safetensors, el modelo esta pensado para inferencia economica en produccion, con soporte para decodificacion guiada via vLLM y Pydantic. Su relevancia actual radica en demostrar que el model merging puede reducir el coste de entrenamiento de clasificadores especializados en portugues manteniendo un rendimiento competitivo en dominios financieros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) adaptado a clasificacion via generacion guiada |
| Parametros totales | 490.799.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se asume compatibilidad con cuantizacion estandar de transformers/vLLM) |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la familia Qwen3 en su variante de 0,5B, un transformer decoder-only de proposito general. Sobre esa base se entrenaron cuatro especialistas independientes, cada uno ajustado en un dataset distinto: FinBERT (noticias financieras), ReLiSA (resenas de libros), Brighter (6 emociones multietiqueta) y GoEmotions PT-BR (28 emociones, con un 50% de split aleatorio de entrenamiento). Los cuatro especialistas se fusionaron mediante TIES-Merging con `weight = 0.25` y `density = 0.50`, generando un prior out-of-domain que posteriormente se sometio a un ajuste fino supervisado (SFT) sobre Financial Phrasebank PT-BR.

La innovacion metodologica es el uso del merging como inicializacion (prior) en lugar de como modelo final: en lugar de desplegar directamente la fusion, se emplea como punto de partida para el SFT en el dominio objetivo. La evaluacion se realizo con decodificacion guiada mediante vLLM y Pydantic, lo que fuerza al modelo a emitir etiquetas validas y permite tratar una tarea de clasificacion como generacion restringida. No se dispone de informacion sobre el volumen total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Clasificacion de sentimiento en portugues (binario y multietiqueta) sobre textos financieros y resenas.
- Clasificacion de emociones multietiqueta: 6 categorias en Brighter y 28 en GoEmotions PT-BR.
- Generacion de texto condicionada a etiquetas mediante decodificacion guiada (vLLM + Pydantic).
- Capacidad conversacional heredada de la base Qwen3-Instruct, aunque no es el foco del modelo.
- Soporte de tool calling / function calling: no disponible como capacidad declarada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingues: limitadas al portugues (PT-BR) en el entrenamiento especializado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Analisis de sentimiento de noticias financieras: el modelo clasifica titulares y comunicados en PT-BR con un Macro F1 de 81,17% en Sentiments-FinBERT-PT-BR y 85,32% en Financial Phrasebank PT-BR, lo que lo hace adecuado para monitorizacion de mercado en tiempo casi real.
- Moderacion de comentarios y resenas: con 0,5B de parametros puede desplegarse en CPU o GPU de gama baja para etiquetar grandes volumenes de resenas de libros (ReLiSA) o comentarios de usuarios.
- Deteccion de emociones en redes sociales: el entrenamiento en GoEmotions PT-BR permite etiquetar publicaciones con 28 emociones, util para analisis de opinion y escucha social.
- Enrutamiento en atencion al cliente: clasificar el tono emocional de un ticket entrante para derivarlo a un agente humano o a un flujo automatizado segun la emocion detectada.
- Investigacion academica en PLN para portugues: sirve como baseline reproducible y ligero para experimentos de model merging y clasificacion afectiva, con pesos publicos y licencia permisiva.
- Clasificacion multietiqueta en pipelines de datos: integrar el modelo en un ETL para anotar lotes de documentos con multiples emociones simultaneas (Brighter), aprovechando la decodificacion guiada para garantizar etiquetas validas.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), evaluados con decodificacion guiada via vLLM + Pydantic:

| Dataset / tarea | Metrica | Modelo | Baseline zero-shot | Joint multi-task |
|---|---|---|---|---|
| ReLi-SA (sentimiento) | Macro F1 | 45,44% | 30,66% | 59,51% |
| ReLi-SA (sentimiento) | Micro F1 | 70,95% | 37,07% | 74,51% |
| ReLi-SA (sentimiento) | Accuracy | 70,95% | 37,07% | 74,51% |
| ReLi-SA (sentimiento) | Hamming Loss | 0,2904 | 0,6293 | 0,2549 |
| BRIGHTER ptbr (emociones) | Macro F1 | 36,53% | no disponible | no disponible |
| Sentiments-FinBERT-PT-BR (sentimiento) | Macro F1 | 81,17% | no disponible | no disponible |
| Financial Phrasebank PT-BR (sentimiento) | Macro F1 | 85,32% | no disponible | no disponible |
| GoEmotions PT-BR (emociones) | Macro F1 | 21,93% | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 (490M parametros) y por debajo de 0,5 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, T4 o superiores son suficientes. Tambien cabe en A100/H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para lotes pequenos.
- Opciones de despliegue: transformers, vLLM (usado en la evaluacion oficial), TGI (tag `text-generation-inference` y `endpoints_compatible`), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 (FinPhrasebank PT-BR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-Prior-Phrasebank | 490M | no disponible | 85,32% | Apache 2.0 | Hugging Face |
| Tucano2-qwen-0.5B-Instruct (zero-shot) | ~490M | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Joint multi-task (baseline del paper) | ~490M | no disponible | no disponible | no disponible | no disponible |
| FinBERT PT-BR (especialista financiero) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Rendimiento desigual entre tareas: el Macro F1 en GoEmotions PT-BR (21,93%) y Brighter (36,53%) es bajo, lo que limita su uso en clasificacion emocional fina.
- El modelo esta especializado en PT-BR; su rendimiento en portugues europeo u otros idiomas no esta documentado.
- Riesgo de alucinacion en generacion libre: aunque se evalua con decodificacion guiada, sin restricciones puede producir texto no fiable.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y con una politica de retencion de al menos 1 ano tras la finalizacion de la tesis (diciembre de 2026), lo que no garantiza disponibilidad indefinida.
- No se dispone de informacion sobre sesgos especificos, composicion exacta del dataset de entrenamiento ni volumen de tokens.
- No hay pesos GGUF publicados, lo que limita el despliegue en llama.cpp u Ollama sin conversion manual.

## Enlaces

- Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Prior-Phrasebank
- Paper ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI: https://doi.org/10.5753/eniac.2026.31064
- Coleccion Hugging Face: https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Modelo base FinBERT: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-FinBERT
- Modelo base ReLiSA: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-ReLiSA
- Modelo base Brighter: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Brighter
- Modelo base GoEmotions: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions
- Dataset ReLi-SA: https://github.com/ruanchaves/reli
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
- Dataset Financial Phrasebank PT-BR: https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
