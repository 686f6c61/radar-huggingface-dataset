# Assaoka/Tucano2-qwen-0.5B-FinBERT

## Resumen

Tucano2-qwen-0.5B-FinBERT es un modelo de lenguaje especializado en analisis de sentimiento de noticias financieras en portugues de Brasil (PT-BR). Lo desarrolla el autor Assaoka como parte del estudio "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", presentado en ENIAC 2026. Se obtiene mediante ajuste fino supervisado (SFT) del modelo instructivo Polygl0t/Tucano2-qwen-0.5B-Instruct sobre el conjunto de datos Sentiments-FinBERT-PT-BR, y clasifica textos en tres categorias: positivo, negativo y neutro.

El modelo pertenece a la familia Tucano2, construida sobre la arquitectura Qwen3 con 490.799.104 parametros totales (aproximadamente 0,5 mil millones). Es un modelo de lenguaje pequeno (SLM) disenado para tareas de clasificacion de sentimiento y emociones en dominios financieros, con un enfasis claro en eficiencia computacional y despliegue ligero.

Su relevancia actual radica en dos factores: por un lado, demuestra que un SLM de 0,5B ajustado con SFT puede alcanzar un Macro F1 de 80,81% en su tarea objetivo (sentimiento financiero en PT-BR), superando ampliamente la linea base zero-shot del modelo padre (54,77%); por otro, forma parte de un conjunto de ocho modelos especialistas disenados para ser combinados mediante tecnicas de model merging, lo que lo convierte en una pieza de un ecosistema mas amplio de analisis multi-tarea en portugues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 490.799.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer decoder-only, heredada del modelo padre Polygl0t/Tucano2-qwen-0.5B-Instruct. Sobre esa base se aplica un ajuste fino supervisado (SFT) de tarea unica utilizando el conjunto de datos Sentiments-FinBERT-PT-BR, compuesto por noticias financieras en portugues de Brasil etiquetadas con polaridad de sentimiento.

El entrenamiento es un SFT completo (full fine-tuning) sobre los 490,8 millones de parametros, no un ajuste con adaptadores. La evaluacion se realiza con decodificacion guiada (guided decoding) mediante vLLM y Pydantic, lo que restringe la salida del modelo a las etiquetas validas de clasificacion y evita respuestas fuera de formato. No se documentan en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Clasificacion de sentimiento financiero en portugues de Brasil con tres etiquetas: positivo, negativo y neutro.
- Clasificacion de emociones en textos en portugues (evaluado sobre BRIGHTER y GoEmotions PT-BR).
- Generacion de texto conversacional heredada del modelo padre instructivo.
- Salida estructurada mediante decodificacion guiada (compatible con vLLM y Pydantic).
- Capacidad multilingue limitada: el modelo esta orientado y evaluado unicamente en portugues.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Analisis de sentimiento de noticias financieras: el modelo clasifica titulares y cuerpos de noticias economicas en PT-BR como positivo, negativo o neutro, con un Macro F1 de 80,81% en el dataset de referencia, lo que lo hace adecuado para monitorizar medios financieros de forma automatizada.
- Monitorizacion de reputacion de empresas cotizadas: procesar menciones en prensa economica brasilena y agregar la polaridad por entidad para detectar cambios de tono en la cobertura mediatica.
- Filtrado y enrutamiento de noticias en redacciones: clasificar automaticamente el tono de los cables que llegan a una redaccion economica para priorizar alertas negativas o positivas.
- Senal auxiliar para trading algoritmico: incorporar la polaridad de noticias como feature en modelos cuantitativos, dado el bajo coste de inferencia de un modelo de 0,5B.
- Analisis de sentimiento en redes sociales financieras: aplicar el modelo a comentarios y publicaciones en portugues sobre activos, aunque con la cautela de que su rendimiento en dominios conversacionales es menor (Macro F1 de 6,43% en GoEmotions PT-BR).
- Componente de un pipeline de model merging: integrar este especialista junto con los otros siete modelos del estudio para construir un modelo multi-tarea mediante tecnicas de fusion, aprovechando que el autor garantiza su alojamiento permanente.
- Prototipado rapido y despliegue en edge: por su tamano de 0,5B, puede ejecutarse en CPU o GPUs de consumo para demos y pruebas de concepto de analisis de sentimiento en portugues.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), evaluados con decodificacion guiada via vLLM y Pydantic. Se comparan con la linea base zero-shot (modelo padre) y con el baseline SFT multi-tarea conjunto (Joint).

| Dataset / tarea | Metrica | Este modelo | Baseline | Joint |
|---|---|---|---|---|
| RELI-SA | Macro F1 | 41,72% | 30,66% | 59,51% |
| RELI-SA | Micro F1 | 56,69% | 37,07% | 74,51% |
| RELI-SA | Accuracy | 56,69% | 37,07% | 74,51% |
| BRIGHTER (ptbr) | Macro F1 | 33,57% | 33,47% | 40,83% |
| BRIGHTER (ptbr) | Micro F1 | 39,66% | 38,07% | 59,14% |
| BRIGHTER (ptbr) | Accuracy | 23,47% | 24,66% | 49,60% |
| FINBERT-PT-BR | Macro F1 | 80,81% | 54,77% | 85,91% |
| FINBERT-PT-BR | Micro F1 | 82,18% | 66,34% | 86,14% |
| FINBERT-PT-BR | Accuracy | 82,18% | 66,34% | 86,14% |
| FINANCIAL-PHRASEBANK | Macro F1 | 67,11% | 38,14% | 82,18% |
| FINANCIAL-PHRASEBANK | Micro F1 | 67,91% | 39,32% | 83,69% |
| FINANCIAL-PHRASEBANK | Accuracy | 67,91% | 39,32% | 83,69% |
| GO-EMOTIONS PT-BR | Macro F1 | 6,43% | 7,59% | 29,99% |
| GO-EMOTIONS PT-BR | Micro F1 | 9,41% | 10,31% | 41,84% |
| GO-EMOTIONS PT-BR | Accuracy | 6,12% | 6,08% | 36,55% |
| Media (5 tareas) | Macro F1 | 45,93% | 32,92% | 59,68% |
| Media (5 tareas) | Micro F1 | 51,17% | 38,22% | 69,07% |
| Media (5 tareas) | Accuracy | 47,27% | 34,70% | 66,10% |
| Media normalizada | Macro F1 | 42,40% | 21,92% | 88,23% |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1 GB solo para pesos (490,8 millones de parametros), mas overhead de activaciones y cache KV; en la practica, entre 1,5 y 2,5 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,5 GB para pesos; en 4 bits, alrededor de 0,25 GB. Los tipos de cuantizacion concretos soportados no estan documentados en la informacion disponible.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan sin problema, aunque las GPU de datacenter estan sobredimensionadas para este tamano.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (libreria declarada), vLLM (usado por el autor para la evaluacion con decodificacion guiada) y text-generation-inference (tag de Hugging Face). Soporte de llama.cpp u Ollama no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 (FINBERT-PT-BR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-FinBERT | 490,8 M | no disponible | 80,81% | Apache 2.0 | Hugging Face |
| Tucano2-qwen-0.5B-Instruct (padre, zero-shot) | 490,8 M (aprox.) | no disponible | 54,77% | no disponible | Hugging Face |
| Joint multi-task SFT (baseline del estudio) | no disponible | no disponible | 85,91% | no disponible | Hugging Face (coleccion del autor) |

La comparacion se limita a los modelos documentados en el estudio ENIAC 2026. No se dispone de datos de benchmarks de alternativas externas como FinBERT original o modelos financieros en portugues de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en una unica tarea (sentimiento financiero en PT-BR); su rendimiento en tareas fuera de dominio es bajo, como demuestra el Macro F1 de 6,43% en GoEmotions PT-BR.
- El rendimiento en clasificacion de emociones es limitado: 33,57% de Macro F1 en BRIGHTER y 6,43% en GoEmotions, muy por debajo de lo que logra el baseline multi-tarea conjunto.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente (campo "verified: false" en el model-index).
- Riesgo de alucinacion y de salida fuera de formato si no se utiliza decodificacion guiada; el autor evalua exclusivamente con guided decoding via vLLM y Pydantic.
- Soporte limitado a portugues de Brasil; no se garantiza un comportamiento correcto en portugues europeo ni en otros idiomas.
- La longitud de contexto no esta documentada, lo que dificulta planificar su uso con documentos largos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo se distribuye como parte de un estudio academico y no se documentan garantias de robustez en produccion.
- No se documentan sesgos especificos, pero al entrenarse sobre noticias financieras puede heredar el sesgo de la cobertura mediatica economica brasilena.
- El numero de descargas y likes es cero en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-FinBERT
- Modelo base: https://huggingface.co/Polygl0t/Tucano2-qwen-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Paper ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del paper: https://doi.org/10.5753/eniac.2026.31064
- Coleccion de Hugging Face del estudio: https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Dataset RELI-SA: https://huggingface.co/datasets/ruanchaves/reli-sa
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Financial Phrasebank PT-BR: https://huggingface.co/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
