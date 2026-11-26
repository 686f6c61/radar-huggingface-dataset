# Assaoka/Tucano2-qwen-0.5B-Model-Soup

## Resumen

Tucano2-qwen-0.5B-Model-Soup es un modelo de lenguaje pequeno (SLM) en portugues de Brasil, especializado en analisis de sentimiento y clasificacion de emociones, publicado por el autor Assaoka en Hugging Face. No es un modelo entrenado desde cero, sino el resultado de un *model soup* (promediado lineal uniforme de pesos) que fusiona cinco especialistas de dominio derivados del mismo backbone Qwen3 de 0,5B: FinBERT, ReLiSA, Brighter, Phrasebank y GoEmotions. El objetivo es obtener un unico modelo multitarea con coste de entrenamiento adicional cero.

El modelo resuelve un problema practico: en lugar de desplegar cinco cabezas especializadas para cinco tareas de clasificacion en portugues, se consolida todo en un unico checkpoint de aproximadamente 490,8 millones de parametros. Forma parte del trabajo "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", presentado en ENIAC 2026, y esta pensado como artefacto de investigacion reproducible, no como modelo conversacional de proposito general.

Su relevancia actual radica en que demuestra que la fusion de pesos (merging) es una alternativa viable al ajuste supervisado multitarea conjunto para SLMs en idiomas de recursos medios como el portugues, con licencia Apache 2.0 y pesos en safetensors compatibles con transformers y text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), ajustado para clasificacion via decodificacion guiada |
| Parametros totales | 490.799.104 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en float16; el autor menciona `dtype: float16` en el merge) |
| Idiomas soportados | portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.5B, un transformer decoder-only denso de aproximadamente 0,5B de parametros. Sobre ese backbone se generaron cinco especialistas mediante ajuste supervisado, cada uno orientado a un corpus concreto: FinBERT (noticias financieras), ReLiSA (resenas de libros), Brighter (6 emociones multietiqueta), Phrasebank (frases financieras) y GoEmotions (28 emociones, con un 50% de split de entrenamiento aleatorio). El modelo final se obtiene por *model soup*: promedio lineal uniforme de los pesos de los cinco especialistas con peso 0,20 cada uno, ejecutado con `mergekit` en float16. No hay entrenamiento adicional ni RLHF/DPO en esta etapa de fusion.

La innovacion tecnica no esta en la arquitectura, sino en el procedimiento de consolidacion y en la evaluacion: las metricas se obtuvieron con decodificacion guiada mediante vLLM y Pydantic, forzando al modelo generativo a emitir etiquetas validas de cada tarea. Esto convierte un modelo de generacion de texto en un clasificador estructurado sin cambiar los pesos.

## Capacidades

- Clasificacion de sentimiento en portugues (positivo, negativo, neutro) sobre dominios financiero y de resenas.
- Clasificacion de emociones multietiqueta (6 categorias en Brighter; 28 en GoEmotions PT-BR).
- Generacion de texto en portugues, heredada del backbone Qwen3-0.5B-Instruct.
- Salida estructurada mediante decodificacion guiada (vLLM + Pydantic), lo que permite integrarlo en pipelines con esquemas JSON validados.
- Capacidad multitarea en un unico checkpoint: cubre cinco tareas de clasificacion sin cambiar de modelo.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Analisis de sentimiento de noticias financieras en portugues: el modelo puede clasificar titulares y comunicados bursatiles en positivo, negativo o neutro, aprovechando el especialista FinBERT y su Macro F1 de 75,05% en Sentiments-FinBERT-PT-BR.
- Monitorizacion de resenas de productos o libros: clasificacion de opiniones de usuarios en plataformas de e-commerce o catalogos editoriales, con un rendimiento de 46,36% de Macro F1 en ReLi-SA.
- Moderacion de comunidades y redes sociales: deteccion de emociones en comentarios (alegria, tristeza, ira, etc.) para priorizar revision humana, usando la componente GoEmotions PT-BR.
- Analisis de sentimiento de mercado en tiempo casi real: integracion en un pipeline vLLM con salida JSON validada por Pydantic para alimentar dashboards financieros.
- Investigacion academica en PLN para portugues: servir como baseline reproducible en experimentos de model merging y comparacion con ajuste multitarea conjunto.
- Etiquetado asistido de corpus: preanotacion de grandes volumenes de texto en portugues para revision posterior por anotadores humanos, reduciendo coste de etiquetado manual.
- Clasificacion de emociones en encuestas de satisfaccion o atencion al cliente: procesamiento por lotes de respuestas abiertas en portugues para segmentar por tono emocional.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), medidos con decodificacion guiada via vLLM + Pydantic:

| Dataset / tarea | Metrica | Tucano2-qwen-0.5B-Model-Soup | Baseline zero-shot (Polygl0t/Tucano2-qwen-0.5B-Instruct) | Joint multi-task SFT |
|---|---|---|---|---|
| ReLi-SA (sentimiento) | Macro F1 | 46,36% | 30,66% | 59,51% |
| BRIGHTER ptbr (emociones, 6 clases) | Macro F1 | 38,90% | no disponible | no disponible |
| Sentiments-FinBERT-PT-BR (sentimiento) | Macro F1 | 75,05% | no disponible | no disponible |
| Financial Phrasebank PT-BR (sentimiento) | Macro F1 | 73,52% | no disponible | no disponible |
| GoEmotions PT-BR (emociones, 28 clases) | Macro F1 | 14,54% | no disponible | no disponible |

En ReLi-SA, el modelo fusionado supera al baseline zero-shot (46,36% frente a 30,66%) pero queda por debajo del ajuste multitarea conjunto (59,51%). La informacion disponible solo incluye el valor de Micro F1, Accuracy y Hamming Loss del baseline y del Joint para ReLi-SA de forma parcial (37,07% / 37,07% / 0,6293 en baseline), por lo que no se presentan filas completas para el resto de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: en float16, aproximadamente 1 GB de pesos (490,8M parametros x 2 bytes) mas overhead de KV cache y runtime; en la practica, entre 1,5 y 2,5 GB segun longitud de secuencia y backend.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es suficiente; en servidor, A100 o H100 no son necesarias pero funcionan con mayor throughput por batching.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU con llama.cpp u Ollama para volumenes bajos.
- Opciones de despliegue: transformers (libreria nativa), vLLM (usado por el autor con decodificacion guiada), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles. No se documenta soporte explicito de GGUF en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-Model-Soup | 490,8M | no disponible | Merge de 5 especialistas (model soup) | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct | ~0,5B | no disponible | Instruct zero-shot, baseline del paper | no disponible | Hugging Face |
| Joint multi-task SFT (baseline del paper) | ~0,5B | no disponible | Ajuste supervisado conjunto sobre 5 tareas | no disponible | no disponible como checkpoint publico |
| Especialistas individuales (FinBERT, ReLiSA, Brighter, Phrasebank, GoEmotions) | ~0,5B cada uno | no disponible | SFT por dominio | Apache 2.0 (presumible, mismo autor) | Hugging Face |

La comparativa se limita al ecosistema del propio paper, ya que no se dispone de datos de benchmarks de modelos alternativos de clasificacion de sentimiento en portugues en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en clasificacion de sentimiento y emociones en portugues; su uso como generador de texto general esta limitado por el tamano del backbone (0,5B) y por el sesgo de los datos de ajuste.
- El rendimiento en GoEmotions PT-BR es bajo (14,54% Macro F1), lo que sugiere dificultades con la clasificacion fina de 28 emociones; no es adecuado para ese caso sin ajuste adicional.
- En ReLi-SA queda por debajo del ajuste multitarea conjunto (46,36% frente a 59,51%), lo que indica que la fusion de pesos no siempre iguala al entrenamiento multitarea.
- Riesgo de alucinacion y de etiquetas invalidas si no se usa decodificacion guiada; el autor evalua con vLLM + Pydantic precisamente para forzar salidas validas.
- Sesgos derivados de los corpus de entrenamiento (noticias financieras, resenas de libros, redes sociales), que pueden no representar otros dominios o registros del portugues.
- Solo soporta portugues (PT-BR); no se documenta cobertura multilingue.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se mantiene publico al menos un ano tras la finalizacion de la tesis (diciembre de 2026), sin compromiso de permanencia mas alla.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Model-Soup
- Paper ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del paper: https://doi.org/10.5753/eniac.2026.31064
- Coleccion de Hugging Face "United Experts": https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
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
