# Assaoka/Tucano2-qwen-0.5B-GoEmotions

## Resumen

Tucano2-qwen-0.5B-GoEmotions es un modelo especialista en clasificación fina de emociones en portugués de Brasil (PT-BR), desarrollado por Assaoka mediante ajuste supervisado (SFT) sobre el modelo instructivo Polygl0t/Tucano2-qwen-0.5B-Instruct, que a su vez deriva de la familia Qwen3. El modelo resuelve una tarea concreta: asignar una de 28 etiquetas de emoción a un texto corto, un problema de clasificación multietiqueta que los modelos generativos de propósito general abordan mal en modo zero-shot.

Se trata de un modelo pequeño (aproximadamente 491 millones de parámetros reales según los pesos en safetensors) entrenado sobre el 50 % aleatorio del split de entrenamiento del dataset GoEmotions PT-BR. Forma parte del estudio «United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging», presentado en ENIAC 2026, donde se compara un especialista aislado (este modelo) frente a una línea base zero-shot y frente a un modelo conjunto multi-tarea.

Su relevancia práctica es doble: por un lado, demuestra que un SLM de ~0,5B puede superar ampliamente a su base en su tarea objetivo (F1 macro de 30,00 % frente a 7,59 % en GoEmotions); por otro, sirve como pieza de un pipeline de merging de modelos para análisis de sentimiento multilingüe y multitarea, un enfoque de bajo coste computacional frente al despliegue de LLM grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), ajustado para generación de texto con decodificación guiada |
| Parametros totales | 490.799.104 (~0,49B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | Portugués (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3 con aproximadamente 491 millones de parámetros, heredado de Polygl0t/Tucano2-qwen-0.5B-Instruct. Sobre esa base se aplicó un ajuste supervisado de una sola tarea (SFT) usando el 50 % aleatorio del split de entrenamiento de GoEmotions PT-BR, un dataset con 28 categorías de emoción. No se documenta en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si hubo fases de RLHF o DPO posteriores al SFT.

La innovación metodológica no está en la arquitectura, sino en el protocolo de evaluación y en el contexto del estudio: las predicciones se obtienen mediante decodificación guiada con vLLM y validación de esquemas con Pydantic, lo que fuerza al modelo generativo a emitir etiquetas válidas del conjunto cerrado de 28 emociones. Este modelo es el «especialista aislado» del estudio, y su papel es servir de componente para el merging posterior con otros especialistas (sentimiento financiero, sentimiento general, etc.) en un modelo conjunto multi-tarea.

## Capacidades

- Clasificación fina de emociones en portugués de Brasil con 28 etiquetas (basado en la taxonomía de GoEmotions).
- Generación de texto condicionada a un formato estructurado mediante decodificación guiada (vLLM + Pydantic), lo que permite obtener salidas parseables.
- Clasificación de sentimiento en dominios específicos: el autor reporta resultados en RELI-SA, BRIGHTER, FinBERT-PT-BR y Financial Phrasebank PT-BR, además de GoEmotions.
- Capacidad multietiqueta: los benchmarks reportan Hamming Loss, lo que indica soporte para más de una emoción por instancia.
- Compatible con text-generation-inference y endpoints de Hugging Face.
- Capacidades generales de la base Qwen3 (generación de texto, razonamiento básico) potencialmente degradadas por el ajuste especializado; no se documentan tool calling, agentes ni visión para esta variante.
- No se documentan capacidades multimodales, audio ni modo thinking explícito.

## Casos de uso

- Moderación de comunidades y redes sociales en portugués: clasificar comentarios en 28 emociones permite priorizar revisiones humanas en función de la carga emocional (ira, tristeza, asco) y no solo del sentimiento positivo/negativo.
- Análisis de opiniones de producto a escala: procesar reseñas de e-commerce en PT-BR para extraer la emoción dominante por aspecto, con un coste de inferencia muy bajo al tratarse de un modelo de ~0,5B.
- Monitorización de atención al cliente: etiquetar transcripciones de chats y tickets con emociones para enrutar casos de frustración o enfado a agentes especializados o a colas prioritarias.
- Investigación en psicolingüística y ciencias sociales: anotación automática de corpus en portugués con 28 categorías emocionales, usando el modelo como preanotador y reservando la validación humana para una muestra.
- Análisis de sentimiento financiero en PT-BR: aunque su F1 macro en FinBERT-PT-BR es bajo (14,47 %), puede emplearse como señal auxiliar dentro de un ensemble o pipeline de merging junto a especialistas financieros.
- Componente de un sistema multi-tarea por merging: integrar este especialista con otros modelos del estudio ENIAC 2026 para construir un clasificador único que cubra emoción fina y sentimiento general sin multiplicar el coste de despliegue.
- Filtrado previo en pipelines de datos: descartar o etiquetar grandes volúmenes de texto portugués antes de pasarlos a un LLM mayor, reduciendo coste y latencia.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), evaluados con decodificación guiada vía vLLM + Pydantic. Se comparan con la línea base zero-shot (Polygl0t/Tucano2-qwen-0.5B-Instruct) y con el modelo conjunto multi-tarea (Joint).

| Dataset / tarea | Metrica | Modelo | Baseline | Joint |
|---|---|---|---|---|
| RELI-SA | Macro F1 | 39,94 % | 30,66 % | 59,51 % |
| RELI-SA | Micro F1 | 69,92 % | 37,07 % | 74,51 % |
| RELI-SA | Accuracy | 69,92 % | 37,07 % | 74,51 % |
| RELI-SA | Hamming Loss | 0,3008 | 0,6293 | 0,2549 |
| BRIGHTER (ptbr) | Macro F1 | 36,83 % | 33,47 % | 40,83 % |
| BRIGHTER (ptbr) | Micro F1 | 46,49 % | 38,07 % | 59,14 % |
| BRIGHTER (ptbr) | Accuracy | 32,61 % | 24,66 % | 49,60 % |
| BRIGHTER (ptbr) | Hamming Loss | 0,1688 | 0,2731 | 0,1174 |
| FinBERT-PT-BR | Macro F1 | 14,47 % | 54,77 % | 85,91 % |
| FinBERT-PT-BR | Micro F1 | 27,72 % | 66,34 % | 86,14 % |
| FinBERT-PT-BR | Accuracy | 27,72 % | 66,34 % | 86,14 % |
| FinBERT-PT-BR | Hamming Loss | 0,7228 | 0,3366 | 0,1386 |
| Financial Phrasebank PT-BR | Macro F1 | 42,03 % | 38,14 % | 82,18 % |
| Financial Phrasebank PT-BR | Micro F1 | 63,47 % | 39,32 % | 83,69 % |
| Financial Phrasebank PT-BR | Accuracy | 63,47 % | 39,32 % | 83,69 % |
| Financial Phrasebank PT-BR | Hamming Loss | 0,3653 | 0,6068 | 0,1631 |
| GoEmotions PT-BR | Macro F1 | 30,00 % | 7,59 % | 29,99 % |
| GoEmotions PT-BR | Micro F1 | 41,88 % | 10,31 % | 41,84 % |
| GoEmotions PT-BR | Accuracy | 36,57 % | 6,08 % | 36,55 % |
| GoEmotions PT-BR | Hamming Loss | 0,0464 | 0,0720 | 0,0464 |
| Media (5 tareas) | Macro F1 | 32,65 % | 32,92 % | 59,68 % |
| Media (5 tareas) | Micro F1 | 49,89 % | 38,22 % | 69,07 % |
| Media (5 tareas) | Accuracy | 46,06 % | 34,70 % | 66,10 % |
| Media (5 tareas) | Hamming Loss | 0,3208 | 0,3835 | 0,1441 |
| Media normalizada | Macro F1 | 40,36 % | 21,92 % | 88,23 % |
| Media normalizada | Micro F1 | 52,26 % | 13,58 % | 93,07 % |
| Media normalizada | Accuracy | 51,53 % | 14,15 % | 93,47 % |
| Media normalizada | Hamming Loss | 0,4202 | 0,7757 | 0,0548 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1 GB para los pesos (~0,49B parámetros) más overhead de activaciones y caché KV; en la práctica, menos de 2 GB en configuraciones habituales.
- En cuantización de 8 bits o 4 bits (mediante bitsandbytes, aunque no se documentan pesos pre-cuantizados): aproximadamente 0,5 GB y 0,25 GB de pesos respectivamente.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también tarjetas de datacenter (A100, H100) si se busca throughput masivo, aunque están sobredimensionadas para este modelo.
- Cabe holgadamente en GPU consumer e incluso en CPU para lotes pequeños; también es viable en entornos con poca VRAM.
- Opciones de despliegue: transformers (librería declarada), vLLM (usado por el autor para la evaluación con decodificación guiada), text-generation-inference y endpoints de Hugging Face. No se documentan pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no se publican cifras concretas en la información disponible; por el tamaño del modelo, se espera un throughput alto en GPU modernas, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 GoEmotions PT-BR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-GoEmotions | ~0,49B | no disponible | 30,00 % | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct (baseline) | ~0,49B | no disponible | 7,59 % | no disponible en la información | Hugging Face |
| Modelo Joint del estudio ENIAC 2026 (merging) | no disponible | no disponible | 29,99 % | no disponible en la información | Colección de Hugging Face del autor |
| Alternativas de clasificación de emociones PT-BR (p. ej. BERTimbau ajustado) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es interna al estudio: el especialista aislado mejora notablemente a la base en su tarea objetivo (30,00 % frente a 7,59 % de F1 macro en GoEmotions), pero queda muy por debajo del modelo conjunto en el resto de tareas (por ejemplo, 14,47 % frente a 85,91 % en FinBERT-PT-BR). No se dispone de datos de benchmarks de alternativas externas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste en una sola tarea degrada el rendimiento en dominios fuera de distribución, como demuestra el F1 macro de 14,47 % en FinBERT-PT-BR, muy por debajo de la línea base (54,77 %).
- Resultados no verificados: todas las métricas del model-index están marcadas como `verified: false` y proceden del propio autor.
- Riesgo de alucinación y etiquetas inválidas: al ser un modelo generativo, sin decodificación guiada puede emitir etiquetas fuera del conjunto de 28 emociones; el autor emplea vLLM + Pydantic para restringir la salida.
- Sesgos del dataset: GoEmotions PT-BR es una traducción de un corpus originalmente en inglés, con posibles artefactos de traducción y sesgos culturales en la anotación emocional.
- Cobertura lingüística limitada al portugués de Brasil; no se garantiza un comportamiento correcto en portugués europeo ni en otros idiomas.
- Longitud de contexto no documentada: no se especifica la ventana máxima, lo que dificulta planificar su uso con textos largos.
- Sin datos de benchmarks independientes ni de terceros; el rendimiento real en producción puede diferir.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de entrenamiento.
- Ausencia de pesos cuantizados oficiales: el despliegue en CPU o en entornos con poca memoria requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions
- Modelo base: https://huggingface.co/Polygl0t/Tucano2-qwen-0.5B-Instruct
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
- Artículo ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del artículo: https://doi.org/10.5753/eniac.2026.31064
- Colección de Hugging Face del estudio: https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Dataset RELI-SA: https://huggingface.co/datasets/ruanchaves/reli-sa
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset Financial Phrasebank PT-BR: https://huggingface.co/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
