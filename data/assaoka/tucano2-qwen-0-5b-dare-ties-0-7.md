# Assaoka/Tucano2-qwen-0.5B-DARE-Ties-0.7

## Resumen

Tucano2-qwen-0.5B-DARE-Ties-0.7 es un modelo de lenguaje pequeno (SLM) en portugues de Brasil obtenido mediante la fusion de cinco especialistas de dominio, todos ellos derivados de Qwen3-0.5B y ajustados por separado para tareas de analisis de sentimiento y clasificacion de emociones. Lo desarrolla Assaoka como parte del trabajo presentado en ENIAC 2026, *United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging*, y su proposito es unificar en un unico conjunto de pesos el rendimiento de cinco modelos especializados sin necesidad de reentrenar ni de mantener cinco despliegues separados.

La tecnica empleada es DARE-TIES con densidad 0.7: se aplica poda aleatoria de deltas (DARE) seguida de la resolucion de conflictos de signo y seleccion de pesos de TIES, con pesos iguales de 0.20 para cada uno de los cinco especialistas. El resultado es un modelo de arquitectura transformer densa con 490.799.104 parametros (aproximadamente 0,5 mil millones), licencia Apache 2.0 y pesos en safetensors listos para `transformers`.

Su relevancia practica radica en que demuestra que la fusion de modelos permite consolidar varias cabeceras de clasificacion especializadas en un solo SLM de menos de 500 millones de parametros, desplegable en CPU o en GPU de consumo, algo especialmente util en entornos con recursos limitados que necesitan procesar texto en portugues para varias tareas de analisis de opinion y emociones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3, derivado de Qwen3-0.5B via cinco especialistas fusionados) |
| Parametros totales | 490.799.104 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar; al ser un modelo de 0,5B es cuantificable a 8 y 4 bits con herramientas estandar, aunque el autor no publica variantes GGUF) |
| Idiomas soportados | portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es una fusion (merge) de cinco especialistas con la misma arquitectura base Qwen3-0.5B, cada uno ajustado de forma supervisada sobre un corpus distinto en portugues. Los cinco padres son Tucano2-qwen-0.5B-FinBERT (noticias financieras), Tucano2-qwen-0.5B-ReLiSA (resenas de libros), Tucano2-qwen-0.5B-Brighter (seis emociones multietiqueta), Tucano2-qwen-0.5B-Phrasebank (frases financieras) y Tucano2-qwen-0.5B-GoEmotions (28 emociones, con un 50 % de particion de entrenamiento aleatoria). Los conjuntos de datos asociados son `ruanchaves/reli-sa`, `brighter-dataset/BRIGHTER-emotion-categories`, `lucas-leme/Sentiments-FinBERT-PT-BR`, la traduccion al PT-BR de Financial Phrasebank y `antoniomenezes/go_emotions_ptbr`.

La fusion se realiza con `mergekit` aplicando DARE-TIES con densidad 0.70 y pesos uniformes de 0.20 por especialista. DARE poda aleatoriamente una fraccion de los deltas de cada modelo padre antes de combinarlos, lo que reduce interferencias entre tareas; TIES resuelve despues los conflictos de signo y descarta pesos de baja magnitud. El modelo forma parte de un ablation de densidad de poda (0.7 es uno de los puntos evaluados). La evaluacion se hizo con decodificacion guiada mediante `vLLM` y `Pydantic`, lo que sugiere que el modelo se emplea como generador que emite etiquetas estructuradas y no solo como clasificador de cabecera.

## Capacidades

- Clasificacion de sentimiento en portugues de Brasil sobre dominios diversos: resenas de libros, noticias financieras y frases financieras.
- Clasificacion de emociones multietiqueta (seis categorias en BRIGHTER; hasta 28 en GoEmotions PT-BR).
- Generacion de texto conversacional en portugues, heredada de la base instruct Qwen3-0.5B.
- Salida estructurada mediante decodificacion guiada (integracion con `vLLM` y `Pydantic` documentada por el autor).
- Capacidad multilingue limitada: el modelo esta especializado y evaluado unicamente en portugues; no se declaran otros idiomas.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Monitorizacion de opinion en redes sociales: el modelo clasifica publicaciones en portugues en categorias de sentimiento y emocion, aprovechando su entrenamiento sobre GoEmotions PT-BR y BRIGHTER para etiquetar grandes volumenes de texto con un SLM que cabe en una sola GPU.
- Analisis de sentimiento financiero: con especialistas entrenados en Sentiments-FinBERT-PT-BR y Financial Phrasebank PT-BR, puede procesar titulares y notas de prensa economicas en portugues para alimentar paneles de riesgo de mercado.
- Moderacion de comunidades y foros: la deteccion de emociones negativas o toxicidad expresada emocionalmente permite priorizar revisiones humanas; el bajo coste de inferencia facilita el filtrado previo de todos los mensajes.
- Analisis de resenas de productos o libros: el especialista ReLiSA aporta capacidad sobre resenas largas; el modelo fusionado puede etiquetar sentimiento a nivel de resena y de frase en catalogos de e-commerce.
- Enrutamiento y triaje en atencion al cliente: clasificar el tono emocional de un ticket entrante en portugues para dirigirlo al equipo adecuado o activar protocolos de escalado, usando el modelo como clasificador de baja latencia.
- Investigacion academica en PLN: sirve como referencia reproducible de fusion DARE-TIES sobre SLMs, con pesos publicados y resultados de ablation, util para comparar estrategias de merging en entornos con pocos recursos.
- Procesamiento en el borde o en CPU: con menos de 500 millones de parametros, puede desplegarse en servidores sin GPU para tareas de etiquetado por lotes de documentos en portugues.

## Benchmarks y rendimiento

Resultados declarados por el autor (Macro F1, no verificados de forma independiente), evaluados con decodificacion guiada via `vLLM` y `Pydantic`:

| Dataset / tarea | Metrica | Tucano2-qwen-0.5B-DARE-Ties-0.7 |
|---|---|---|
| ReLi-SA (sentimiento) | Macro F1 | 46,27 |
| BRIGHTER ptbr (emociones) | Macro F1 | 38,00 |
| Sentiments-FinBERT-PT-BR (sentimiento) | Macro F1 | 56,96 |
| Financial Phrasebank PT-BR (sentimiento) | Macro F1 | 62,56 |
| GoEmotions PT-BR (emociones) | Macro F1 | 22,75 |

La model card menciona comparaciones adicionales frente a la linea base zero-shot (`Polygl0t/Tucano2-qwen-0.5B-Instruct`) y frente a un baseline conjunto multi-tarea (Joint SFT), con medias agregadas (no ponderada y normalizada min-max), pero los valores completos de esas columnas no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1 GB para los pesos (0,49B parametros) mas cache KV y overhead del runtime; en la practica, 2-4 GB son suficientes.
- En cuantizacion de 8 bits: en torno a 0,5 GB de pesos; en 4 bits: en torno a 0,25 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100, H100 y tambien en CPU.
- Cabe holgadamente en GPU de consumo; es un candidato claro para despliegue en el borde o en portatiles.
- Opciones de despliegue: `transformers` (libreria declarada), `vLLM` (usado por el autor con decodificacion guiada), `text-generation-inference` (tag del repositorio) y `endpoints_compatible`. No se publican pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion propia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-DARE-Ties-0.7 | 0,49B | no disponible | Fusion DARE-TIES de 5 especialistas en PT-BR | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct | ~0,5B | no disponible | Base instruct PT-BR, linea base zero-shot del paper | no disponible | Hugging Face |
| Assaoka/Tucano2-qwen-0.5B-FinBERT (padre) | ~0,5B | no disponible | Especialista en sentimiento financiero | no disponible | Hugging Face |
| Baseline Joint (multi-tarea SFT) | ~0,5B | no disponible | Ajuste supervisado conjunto sobre las 5 tareas | no disponible | Referencia interna del paper |

La comparativa se limita a los modelos citados en la propia model card; no se dispone de datos de benchmarks de alternativas externas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en portugues de Brasil; su rendimiento fuera de ese idioma no esta evaluado y probablemente sea deficiente.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false` en el model-index).
- El rendimiento en GoEmotions PT-BR es bajo (Macro F1 de 22,75) y en BRIGHTER moderado (38,00), lo que refleja la dificultad de la clasificacion multietiqueta de emociones con un modelo de 0,5B.
- El modelo se evalua con decodificacion guiada y salida estructurada; usarlo como generador libre puede degradar la calidad de las etiquetas.
- Riesgo de alucinacion inherente a la base generativa Qwen3-0.5B, especialmente si se emplea como chatbot en lugar de como clasificador.
- La fusion DARE-TIES con densidad 0.7 puede introducir interferencias entre las cinco tareas; el autor lo presenta como parte de un ablation, no como un resultado definitivo.
- No se documenta la longitud de contexto soportada, lo que complica planificar el procesamiento de documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la politica de retencion garantiza el alojamiento publico durante al menos un ano tras la finalizacion de la tesis (diciembre de 2026).
- No hay variantes cuantizadas oficiales (GGUF, AWQ, GPTQ), por lo que el despliegue en llama.cpp u Ollama requiere conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-DARE-Ties-0.7
- Paper ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del paper: https://doi.org/10.5753/eniac.2026.31064
- Coleccion Hugging Face del proyecto: https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Modelo padre FinBERT: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-FinBERT
- Modelo padre ReLiSA: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-ReLiSA
- Modelo padre Brighter: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Brighter
- Modelo padre Phrasebank: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Phrasebank
- Modelo padre GoEmotions: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions
- Dataset ReLi-SA: https://huggingface.co/datasets/ruanchaves/reli-sa
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
- Dataset Financial Phrasebank PT-BR (Kaggle): https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Repositorio ReLi: https://github.com/ruanchaves/reli
