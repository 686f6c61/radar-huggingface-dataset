# DinhIchMinhHoang/viquad2-xlmr-base

## Resumen

viquad2-xlmr-base es un conjunto de tres ajustes finos (seeds 42, 43 y 44) del modelo multilingüe `FacebookAI/xlm-roberta-base` para respuesta extractiva de preguntas (extractive QA) en vietnamita sobre el conjunto UIT-ViQuAD 2.0, que incluye preguntas sin respuesta posible en el contexto. Lo publica el usuario DinhIchMinhHoang como artefacto de investigación, con pesos en safetensors fp16 y licencia MIT. El modelo selecciona un fragmento del contexto o devuelve cadena vacía cuando determina que la pregunta es irresoluble.

La arquitectura subyacente es un transformer encoder XLM-R base de 277,5 millones de parámetros, con contexto de entrada de 384 tokens durante el entrenamiento (`max_length` 384, `doc_stride` 128). La innovación práctica no está en la arquitectura sino en la estrategia de publicación: tres semillas independientes con umbrales de abstención calibrados sobre dev, más un ensemble que promedia logits de inicio y fin de las tres semillas antes de puntuar una sola vez.

Es relevante ahora porque demuestra un flujo reproducible de QA extractiva con detección de preguntas sin respuesta en un idioma de recursos medios, y porque documenta explícitamente la varianza entre semillas (dev F1 entre 60,3 y 64,0) y la diferencia entre el ensemble de la fase 3 del artículo (test F1 62,40) y el ensemble de release (test F1 63,59). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño es de 1,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base), cabeza de QA extractiva con logits de inicio y fin |
| Parametros totales | 277,5 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens de entrada en entrenamiento; `doc_stride` 128; `max_answer_length` 64 |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16; no se documentan GGUF, int8 ni otras) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16), más `config.json`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base`, un encoder transformer multilingüe de 277,5 millones de parámetros, y le añade una cabeza de question answering extractiva que produce distribuciones sobre posiciones de inicio y fin del contexto. El entrenamiento se realizó sobre `taidng/UIT-ViQuAD2.0` con la siguiente configuración: learning rate 2e-5, 5 épocas, `plausible_lambda` 0,3, semillas 42/43/44, `max_length` 384, `doc_stride` 128, batch 32, warmup 0,1, weight decay 0,01, `n_best` 20 y `max_answer_length` 64. La selección de época y umbral se hizo sobre el conjunto de desarrollo.

La decisión de abstención se basa en `null_diff`: la diferencia entre la puntuación de la posición nula (mínimo a través de las ventanas de `start[0]+end[0]`) y la puntuación del mejor span candidato. Si `null_diff > threshold`, el modelo devuelve respuesta vacía. El ensemble promedia los logits de inicio y fin de las tres semillas y puntúa una sola vez con umbral 1,00. Los pesos se convirtieron a fp16 (unos 529 MiB por ejecución), lo que puede introducir desviaciones mínimas respecto a los resultados en fp32 del entrenamiento. No se documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Respuesta extractiva de preguntas en vietnamita: devuelve un fragmento literal del contexto o cadena vacía.
- Detección de preguntas sin respuesta mediante el estadístico `null_diff` y umbral calibrado en dev.
- Procesamiento de contextos largos mediante ventanas deslizantes (`doc_stride` 128) y agregación de candidatos (`n_best` 20).
- Modo ensemble de tres semillas con promedio de logits de inicio y fin.
- Salida estructurada con `text`, `score`, `null_diff` y `has_answer` a través de la API de referencia `src.qa_api.QA`.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito; es un modelo exclusivamente extractivo.
- Capacidad multilingüe limitada al vietnamita en la práctica, aunque el modelo base XLM-R sea multilingüe.

## Casos de uso

- Búsqueda de respuestas sobre documentación interna en vietnamita: indexar manuales o políticas y usar el modelo para extraer el fragmento exacto que responde a una consulta, con abstención cuando la respuesta no está en el documento.
- Atención al cliente sobre base de conocimiento: dado un artículo de FAQ como contexto, el modelo devuelve el pasaje relevante o indica que no hay respuesta, lo que permite derivar a un agente humano en lugar de alucinar.
- Verificación de extracción en pipelines de anotación: uso como preanotador de spans respuesta en herramientas de etiquetado, reduciendo el trabajo manual en la construcción de datasets de QA vietnamitas.
- Evaluación de sistemas RAG: como componente de lectura (reader) en una arquitectura retrieve-then-read, donde el retriever aporta pasajes y el modelo extrae la respuesta final con una señal de confianza (`score`, `null_diff`).
- Análisis de contratos y documentos legales en vietnamita: extracción de cláusulas concretas ante preguntas cerradas, con la ventaja de que el modelo nunca genera texto que no esté en el contexto.
- Investigación sobre calibración de abstención: el repositorio publica tres semillas con umbrales distintos (0,50, 0,50 y 0,75) y un ensemble con umbral 1,00, lo que permite estudiar la varianza entre semillas y el efecto del umbral en la precisión de preguntas sin respuesta.
- Filtrado de preguntas no respondibles en sistemas de soporte: usar `has_answer` como clasificador binario previo a un modelo generativo, evitando costes de generación en consultas fuera de dominio.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre UIT-ViQuAD 2.0 (dev y test):

| Configuracion | Dev F1 | Test EM | Test F1 | Test HasAns F1 | Test NoAns acc |
|---|---|---|---|---|---|
| s42 (umbral 0,50) | 61,53 | 52,99 | 61,28 | 61,78 | 60,12 |
| s43 (umbral 0,50) | 63,96 | 54,33 | 63,14 | 63,48 | 62,36 |
| s44 (umbral 0,75) | 60,32 | 51,05 | 61,10 | 66,80 | 48,06 |
| Ensemble 3 seeds (umbral 1,00) | 63,33 | 54,46 | 63,59 | 67,40 | 54,87 |

El ensemble original de la fase 3, que la model card identifica como resultado principal del artículo, obtuvo test F1 62,40. El ensemble de release lo supera en +1,19 puntos (bootstrap emparejado, IC 95 % [0,44, 1,89]). El conjunto de test se evaluó una sola vez. El mejor modelo individual según dev es s43.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 0,55 GB de pesos más memoria de activaciones; con `max_length` 384 y batch moderado, cabe holgadamente en 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para despliegue en servidor, T4, L4, A10 o A100 sobran para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 4 GB de VRAM, e incluso en CPU para cargas de baja concurrencia.
- Opciones de despliegue: la model card referencia la API propia `src.qa_api.QA` y `src.demo.answer_ensemble` del repositorio de investigación; al ser un modelo de la familia XLM-RoBERTa, es compatible con el pipeline `question-answering` de Transformers y con servidores de inferencia estándar para modelos encoder (por ejemplo, TorchServe o endpoints de Hugging Face Inference). No se documentan integraciones específicas con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Test F1 (UIT-ViQuAD 2.0) | Licencia |
|---|---|---|---|---|---|
| viquad2-xlmr-base (ensemble release) | 277,5 M | 384 | vi | 63,59 | MIT |
| viquad2-xlmr-base (mejor semilla, s43) | 277,5 M | 384 | vi | 63,14 | MIT |
| XLM-R base sin ajuste | 277,5 M | 512 (nativo) | multilingüe | no disponible | MIT |
| Otros modelos de la misma familia publicados por el autor | no disponible | no disponible | vi | no disponible | no disponible |

La model card menciona que `best_models.json` cubre "las tres familias de modelos", pero no detalla qué otras familias son ni sus resultados, por lo que no es posible completar una comparativa con alternativas concretas.

## Limitaciones y advertencias

- Varianza entre semillas elevada: dev F1 oscila entre 60,32 y 63,96 según la semilla, lo que implica que el rendimiento en producción puede desviarse del valor publicado.
- Umbrales calibrados sobre dev, no sobre test; el umbral óptimo puede no transferir a otros dominios o distribuciones de contexto.
- Los pesos están en fp16, por lo que las puntuaciones pueden diferir ligeramente de las obtenidas en fp32 durante el entrenamiento.
- El modelo es exclusivamente extractivo: nunca genera texto libre ni reformula respuestas; si la respuesta no aparece literalmente en el contexto, no puede producirla.
- Ventana de 384 tokens con `doc_stride` 128: contextos muy largos requieren troceado y agregación, con riesgo de perder respuestas que crucen fronteras de ventana.
- Solo vietnamita en la práctica; el rendimiento en otros idiomas del modelo base no está evaluado.
- Riesgo de alucinación bajo por diseño (extrae spans), pero puede seleccionar spans incorrectos con alta confianza si el contexto es ambiguo o el dominio difiere del corpus de entrenamiento.
- Sesgos: no se documenta ningún análisis de sesgos demográficos, geográficos o de dominio; el corpus UIT-ViQuAD 2.0 proviene de Wikipedia en vietnamita, lo que limita la generalización a textos legales, técnicos o conversacionales.
- Licencia MIT declarada por el autor, que pide verificar la licencia original de XLM-R antes de publicar; conviene confirmar los términos antes de uso comercial.
- Artefacto de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni mantenimiento continuado.
- La cita del artículo y de los datasets figura como TODO en la model card, lo que dificulta la trazabilidad académica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DinhIchMinhHoang/viquad2-xlmr-base
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset de entrenamiento: https://huggingface.co/datasets/taidng/UIT-ViQuAD2.0
- Artículo de XLM-R (Conneau et al., 2020): no disponible en la información proporcionada
- Artículo de UIT-ViQuAD 2.0 (Nguyen et al.): no disponible en la información proporcionada
- Repositorio de código (`src/qa_api.py`, `src/demo.py`, notebooks): no disponible como URL en la información proporcionada
- Demo: no disponible
