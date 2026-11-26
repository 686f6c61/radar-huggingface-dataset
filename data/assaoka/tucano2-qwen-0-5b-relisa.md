# Assaoka/Tucano2-qwen-0.5B-ReLiSA

## Resumen

Tucano2-qwen-0.5B-ReLiSA es un modelo de lenguaje especializado en análisis de sentimiento de reseñas de libros en portugués de Brasil, desarrollado por Assaoka. Se obtiene mediante ajuste fino supervisado (SFT) de un solo dominio sobre el modelo instructivo Polygl0t/Tucano2-qwen-0.5B-Instruct, que a su vez deriva de la familia Qwen3. El modelo clasifica textos en cuatro categorías: positivo, negativo, neutro y mixto, y forma parte del estudio "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", presentado en ENIAC 2026.

Con 490.799.104 parámetros (aproximadamente 0,5 mil millones), se posiciona como un modelo de lenguaje pequeño (SLM) orientado a una tarea concreta de clasificación, no a generación abierta de propósito general. Su relevancia radica en que demuestra que un ajuste fino de una sola tarea sobre un modelo base de 0,5B puede superar de forma notable al baseline zero-shot en su dominio (64,20 % de Macro F1 frente a 30,66 % en ReLi-SA), con un coste computacional muy bajo y licencia Apache 2.0.

El modelo se distribuye en formato safetensors, con un repositorio de 3,3 GB, y está pensado para ejecutarse con transformers o vLLM, recomendándose decodificación guiada (guided decoding) con Pydantic para forzar salidas JSON estrictas. Su alcance lingüístico se limita al portugués.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3, según el modelo base) |
| Parametros totales | 490.799.104 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de aproximadamente 0,5 mil millones de parámetros, heredado de Polygl0t/Tucano2-qwen-0.5B-Instruct, que a su vez pertenece a la familia Qwen3. Sobre esa base se aplica un ajuste fino supervisado (SFT) de una sola tarea utilizando el split de entrenamiento del corpus ReLi-SA, compuesto por reseñas de libros en portugués brasileño. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineación posteriores al SFT.

La innovación metodológica del trabajo no reside en el modelo individual, sino en su papel como "especialista aislado" dentro de un estudio comparativo más amplio: se contrasta este especialista de una sola tarea con un baseline zero-shot y con un baseline conjunto (Joint) de SFT multi-tarea. La evaluación se realizó con decodificación guiada mediante vLLM y Pydantic, lo que restringe la generación a etiquetas válidas y convierte un modelo generativo en un clasificador estructurado. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición completa del dataset ni detalles sobre la tokenización.

## Capacidades

- Clasificación de sentimiento en portugués brasileño con cuatro etiquetas: positivo, negativo, neutro y mixto.
- Especialización en reseñas de libros (dominio del corpus ReLi-SA).
- Generación de texto condicionada a formato estructurado mediante decodificación guiada (JSON con Pydantic).
- Inferencia compatible con transformers y con vLLM (text-generation-inference).
- Capacidad de clasificación de emociones y sentimiento financiero en evaluación out-of-domain, aunque con rendimiento limitado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el modelo declara únicamente portugués.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Análisis de sentimiento de reseñas de libros en plataformas de comercio electrónico: el modelo clasifica reseñas en positivo, negativo, neutro o mixto, permitiendo agregar la opinión de los lectores sobre catálogos editoriales con un coste de inferencia mínimo.
- Moderación y curación de reseñas en comunidades literarias: al ser un SLM de 0,5B, puede desplegarse en servidores modestos para etiquetar grandes volúmenes de reseñas y priorizar las negativas para revisión humana.
- Enriquecimiento de metadatos editoriales: clasificar automáticamente el tono de las reseñas asociadas a un título para generar indicadores de recepción que alimenten sistemas de recomendación.
- Investigación en procesamiento de lenguaje natural en portugués: servir como especialista de referencia para experimentos de merging de modelos, comparación de SFT de una sola tarea frente a multi-tarea y evaluación de decodificación guiada.
- Clasificación de sentimiento en dominios financieros en portugués (out-of-domain): con un Macro F1 de 42,55 % en Financial Phrasebank PT-BR, puede usarse como línea base o componente de un ensemble en análisis de opinión financiera, siempre con validación adicional.
- Detección de emociones en textos en portugués (out-of-domain): con un Macro F1 de 35,26 % en BRIGHTER, puede emplearse en experimentos exploratorios de clasificación emocional, aunque su rendimiento es bajo y requiere supervisión.
- Prototipado rápido y pruebas de concepto: gracias a su tamaño reducido y licencia Apache 2.0, es adecuado para validar pipelines de clasificación de sentimiento antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), evaluados con decodificación guiada mediante vLLM y Pydantic. Se comparan con el baseline zero-shot (Polygl0t/Tucano2-qwen-0.5B-Instruct) y con el baseline Joint de SFT multi-tarea.

| Dataset / tarea | Metrica | Modelo | Baseline | Joint |
|---|---|---|---|---|
| ReLi-SA | Macro F1 | 64,20 % | 30,66 % | 59,51 % |
| ReLi-SA | Micro F1 | 77,28 % | 37,07 % | 74,51 % |
| ReLi-SA | Accuracy | 77,28 % | 37,07 % | 74,51 % |
| ReLi-SA | Hamming Loss | 0,2272 | 0,6293 | 0,2549 |
| BRIGHTER | Macro F1 | 35,26 % | 33,47 % | 40,83 % |
| BRIGHTER | Micro F1 | 43,45 % | 38,07 % | 59,14 % |
| BRIGHTER | Accuracy | 30,08 % | 24,66 % | 49,60 % |
| BRIGHTER | Hamming Loss | 0,1869 | 0,2731 | 0,1174 |
| FinBERT-PT-BR | Macro F1 | 41,32 % | 54,77 % | 85,91 % |
| FinBERT-PT-BR | Micro F1 | 45,54 % | 66,34 % | 86,14 % |
| FinBERT-PT-BR | Accuracy | 45,54 % | 66,34 % | 86,14 % |
| FinBERT-PT-BR | Hamming Loss | 0,5446 | 0,3366 | 0,1386 |
| Financial Phrasebank | Macro F1 | 42,55 % | 38,14 % | 82,18 % |
| Financial Phrasebank | Micro F1 | 63,26 % | 39,32 % | 83,69 % |
| Financial Phrasebank | Accuracy | 63,26 % | 39,32 % | 83,69 % |
| Financial Phrasebank | Hamming Loss | 0,3674 | 0,6068 | 0,1631 |
| GoEmotions PT-BR | Macro F1 | 7,39 % | 7,59 % | 29,99 % |
| GoEmotions PT-BR | Micro F1 | 13,89 % | 10,31 % | 41,84 % |
| GoEmotions PT-BR | Accuracy | 11,00 % | 6,08 % | 36,55 % |
| GoEmotions PT-BR | Hamming Loss | 0,0633 | 0,0720 | 0,0464 |
| Media (5 tareas) | Macro F1 | 38,14 % | 32,92 % | 59,68 % |
| Media (5 tareas) | Micro F1 | 48,68 % | 38,22 % | 69,07 % |
| Media (5 tareas) | Accuracy | 45,43 % | 34,70 % | 66,10 % |
| Media (5 tareas) | Hamming Loss | 0,2779 | 0,3835 | 0,1441 |
| Media normalizada | Macro F1 | 36,43 % | 21,92 % | 88,23 % |
| Media normalizada | Micro F1 | 41,81 % | 13,58 % | 93,07 % |
| Media normalizada | Accuracy | 42,58 % | 14,15 % | 93,47 % |
| Media normalizada | Hamming Loss | 0,4192 | 0,7757 | 0,0548 |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 490,8 millones de parámetros, en precisión de 16 bits ocupa aproximadamente 1 GB de pesos; en cuantizaciones de 8 bits o 4 bits quedaría por debajo de 1 GB. No se dispone de cifras oficiales de VRAM publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria libre es suficiente para inferencia en fp16, incluyendo GPUs de consumo como RTX 3060, RTX 4060 o superiores; para despliegues con vLLM se recomienda al menos una GPU con 8-16 GB para acomodar el grafo de decodificación guiada y procesar lotes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas de consumo, dado su reducido tamaño.
- Opciones de despliegue: transformers (librería declarada), vLLM (recomendado por el autor para decodificación guiada), text-generation-inference (tag endpoints_compatible). No se confirma soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 medio (5 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-ReLiSA | 490,8 M | No disponible | 38,14 % | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct (baseline zero-shot) | ~0,5 B | No disponible | 32,92 % | No disponible en la informacion | Hugging Face |
| Baseline Joint (SFT multi-tarea, ENIAC 2026) | ~0,5 B | No disponible | 59,68 % | No disponible en la informacion | Referenciado en el paper |

La comparación se limita a los modelos incluidos en el estudio ENIAC 2026. El especialista supera al baseline zero-shot en la media de las cinco tareas (38,14 % frente a 32,92 % de Macro F1), pero queda por debajo del baseline Joint multi-tarea (59,68 %), lo que refleja el compromiso entre especialización y generalización entre dominios.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para reseñas de libros en portugués brasileño; su rendimiento fuera de ese dominio cae de forma acusada (por ejemplo, 7,39 % de Macro F1 en GoEmotions PT-BR).
- En tareas financieras out-of-domain rinde por debajo del baseline zero-shot en FinBERT-PT-BR (41,32 % frente a 54,77 % de Macro F1), lo que indica sobreajuste al dominio de entrenamiento.
- Riesgo de alucinación y de etiquetas inválidas si no se emplea decodificación guiada; el autor recomienda explícitamente vLLM con Pydantic para forzar salidas JSON estrictas.
- Los resultados de benchmarks son declarados por el autor y figuran como no verificados en el model-index.
- Limitación lingüística: solo se declara portugués; no hay evidencia de capacidades en otros idiomas.
- No se documentan sesgos conocidos, composición demográfica del corpus ni análisis de robustez en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye como especialista de clasificación y no como generador de propósito general; su uso en producción requiere validación en el dominio concreto de aplicación.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-ReLiSA
- Modelo base: https://huggingface.co/Polygl0t/Tucano2-qwen-0.5B-Instruct
- Paper ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del paper: https://doi.org/10.5753/eniac.2026.31064
- Colección en Hugging Face: https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Dataset ReLi-SA: https://github.com/ruanchaves/reli
- Dataset ReLi-SA en Hugging Face: https://huggingface.co/datasets/ruanchaves/reli-sa
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset Financial Phrasebank PT-BR: https://huggingface.co/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
