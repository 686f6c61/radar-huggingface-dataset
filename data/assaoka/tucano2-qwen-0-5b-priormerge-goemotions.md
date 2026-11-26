# Assaoka/Tucano2-qwen-0.5B-PriorMerge-GoEmotions

## Resumen

Tucano2-qwen-0.5B-PriorMerge-GoEmotions es un modelo de lenguaje pequeno (SLM) especializado en analisis de sentimiento y clasificacion de emociones en portugues de Brasil (PT-BR). Lo desarrolla Assaoka como parte del articulo "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", presentado en ENIAC 2026. Se construye mediante TIES-Merging de cinco modelos padres: un modelo "prior" fuera de dominio (Prior-GoEmotions) y cuatro especialistas en dominios concretos (FinBERT, ReLiSA, Brighter y Phrasebank).

El modelo parte de una base Tucano2 de 0.5B parametros derivada de la familia Qwen, y se distribuye como modelo de generacion de texto (pipeline text-generation) con capacidad de clasificacion guiada mediante decodificacion restringida con vLLM y Pydantic. Su relevancia radica en demostrar que la fusion de modelos (model merging) permite obtener un unico SLM multitarea que cubre cinco dominios distintos de sentimiento y emociones sin reentrenar un modelo conjunto.

La ficha corresponde a un modelo experimental de investigacion, con licencia Apache 2.0, publicado en Hugging Face el 26 de noviembre de 2026 y sin descargas ni likes registrados en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen, familia Tucano2) |
| Parametros totales | 0.5B (aproximadamente 500 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de la libreria transformers; no se detalla en la informacion) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge TIES (Trim, Elect Sign, Merge) que combina cinco checkpoints derivados de Tucano2-qwen-0.5B. El checkpoint "prior" (Prior-GoEmotions) aporta conocimiento fuera de dominio sobre emociones, mientras que los cuatro especialistas aportan senal de dominio: FinBERT (noticias financieras), ReLiSA (resenas de libros), Brighter (emociones multietiqueta) y Phrasebank (frases financieras). Los hiperparametros del merge son `weight = 0.20` y `density = 0.50`.

Los modelos padres se entrenaron con SFT sobre datasets especificos: ReLi-SA, BRIGHTER (ptbr) con 6 emociones multietiqueta, Sentiments-FinBERT-PT-BR, Financial Phrasebank PT-BR y GoEmotions PT-BR (split aleatorio del 50 % de entrenamiento, 28 emociones). La evaluacion se realizo con decodificacion guiada (Guided Decoding) mediante vLLM y Pydantic, forzando la salida a las etiquetas validas de cada tarea.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Clasificacion de sentimiento en portugues (positivo, negativo, neutro) en dominios financiero, de resenas y general.
- Clasificacion de emociones multietiqueta (BRIGHTER, 6 emociones; GoEmotions PT-BR, 28 emociones).
- Generacion de texto condicionada a etiquetas mediante decodificacion guiada (vLLM + Pydantic).
- Multitarea en un unico checkpoint: cubre cinco benchmarks distintos sin cambiar de modelo.
- Capacidad multilingue limitada al portugues de Brasil; no se declaran otros idiomas.
- No se documentan capacidades de tool calling, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Moderacion de comunidades en portugues: clasificar comentarios de foros y redes en categorias de emocion (alegria, ira, tristeza, etc.) con la etiqueta de GoEmotions PT-BR, usando decodificacion guiada para garantizar salidas validas.
- Analisis de sentimiento de resenas de libros: procesar resenas de plataformas editoriales con el dominio ReLi-SA y agregar la polaridad por titulo o autor.
- Monitorizacion de noticias financieras: clasificar titulares y notas de prensa en PT-BR como positivos, negativos o neutros, apoyandose en el especialista FinBERT y en Phrasebank.
- Analisis de opiniones de clientes en e-commerce: detectar emociones multietiqueta en resenas de producto para priorizar casos de insatisfaccion.
- Investigacion academica en PLN: servir como linea base reproducible para experimentos de model merging y evaluacion multitarea en portugues, con pesos y configuracion de merge publicados.
- Clasificacion ligera en el borde: al tener 0.5B parametros, puede desplegarse en una unica GPU consumer para tareas de etiquetado por lotes sin infraestructura dedicada.
- Enriquecimiento de datasets: etiquetar automaticamente corpus en portugues con sentimiento y emociones para su posterior curacion manual.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en el model-index, evaluados con decodificacion guiada:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Analisis de sentimiento | ReLi-SA | Macro F1 | 47.80 |
| Clasificacion de emociones | BRIGHTER (ptbr) | Macro F1 | 39.96 |
| Analisis de sentimiento | Sentiments-FinBERT-PT-BR | Macro F1 | 64.04 |
| Analisis de sentimiento | Financial Phrasebank PT-BR | Macro F1 | 68.17 |
| Clasificacion de emociones | GoEmotions PT-BR | Macro F1 | 20.91 |

La model card menciona comparaciones frente a la linea base zero-shot (`Polygl0t/Tucano2-qwen-0.5B-Instruct`) y frente a un baseline Joint multi-task SFT, pero la informacion proporcionada solo incluye la fila de ReLi-SA de esa tabla comparativa, sin los valores del resto de columnas. No se dispone de resultados completos de la comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 para 0.5B parametros; alrededor de 0.5 GB en cuantizacion de 8 bits y 0.3 GB en 4 bits (estimacion orientativa, no confirmada en la informacion).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090); tambien A100 y H100 para despliegues por lotes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas, e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: transformers (libreria declarada), vLLM (usado por el autor para decodificacion guiada con Pydantic). No se confirma soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-PriorMerge-GoEmotions | 0.5B | no disponible | Merge TIES multitarea PT-BR | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct | 0.5B | no disponible | Instruct zero-shot PT-BR | no disponible | Hugging Face |
| Baseline Joint multi-task SFT | 0.5B (estimado) | no disponible | SFT conjunto multitarea | no disponible | No publico en la informacion |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de rendimiento del baseline Joint ni de otros SLM de sentimiento en portugues para establecer una comparacion cuantitativa completa.

## Limitaciones y advertencias

- Modelo experimental de investigacion: los resultados de benchmarks estan declarados por el autor y marcados como no verificados.
- Rendimiento bajo en GoEmotions PT-BR (Macro F1 de 20.91), lo que limita su uso fiable en clasificacion fina de 28 emociones.
- El modelo esta especializado en portugues de Brasil; no se declara soporte para otros idiomas y su uso en castellano u otras lenguas no esta validado.
- Requiere decodificacion guiada (vLLM + Pydantic) para garantizar etiquetas validas; sin ella, al ser un modelo de generacion, puede producir salidas libres o invalidas.
- Riesgo de alucinacion y de etiquetas inconsistentes fuera de los dominios de entrenamiento.
- No se documentan sesgos especificos, pero los datasets financieros y de resenas pueden introducir sesgos de dominio y de registro.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- Politica de retencion: el modelo se mantiene publico al menos un ano tras la finalizacion de la tesis (diciembre de 2026), sin garantia de disponibilidad a largo plazo.
- Sin descargas ni likes registrados, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-PriorMerge-GoEmotions
- Modelo padre Prior-GoEmotions: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Prior-GoEmotions
- Modelo padre FinBERT: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-FinBERT
- Modelo padre ReLiSA: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-ReLiSA
- Modelo padre Brighter: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Brighter
- Modelo padre Phrasebank: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Phrasebank
- Articulo ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI: https://doi.org/10.5753/eniac.2026.31064
- Coleccion Hugging Face: https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Dataset ReLi-SA: https://github.com/ruanchaves/reli
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset Financial Phrasebank PT-BR: https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
