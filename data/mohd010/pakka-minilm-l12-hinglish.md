# mohd010/pakka-minilm-l12-hinglish

## Resumen

pakka-minilm-l12-hinglish es un modelo de embeddings de frases derivado de sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2, afinado por el autor mohd010 para una tarea muy concreta: decidir si una pregunta nueva de un bot de soporte puede reutilizar una respuesta cacheada, en ingles, hinglish (hindi romanizado) e hindi. Forma parte de la fase 9 del proyecto pakka, una libreria de cache semantica para asistentes conversacionales.

El modelo conserva el tamano y la velocidad de su base: 117.653.760 parametros, aproximadamente 0,47 GB de pesos y unos 9 ms por pregunta en CPU de portatil. No es un modelo generativo, sino un encoder BERT que produce vectores de 384 dimensiones para similitud semantica. Su proposito es ampliar el numero de mensajes reales que superan el umbral de similitud y llegan al verificador, no sustituir a este.

Su relevancia es acotada pero clara para equipos que construyen caches semanticas en entornos code-mixed: el autor reporta que, con verificador Jev, el modelo sirve 54 respuestas correctas y 1 incorrecta sobre 258 mensajes humanos, frente a 19 y 0 del base MiniLM. Sin verificador, el modelo no mejora a su base e incluso empeora en varios conjuntos publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (MiniLM-L12), sentence-transformers |
| Parametros totales | 117.653.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base MiniLM-L12 admite 128 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible; pesos en safetensors de precision completa (fp32) |
| Idiomas soportados | en, hi (incluye hinglish romanizado en la practica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension del embedding | no disponible en la model card (el base MiniLM-L12 produce 384 dimensiones) |
| Tamano del repositorio | 0,5 GB |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |
| Modelo base | sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer encoder tipo BERT de 12 capas (MiniLM-L12) que genera embeddings de frase mediante pooling. El ajuste fino no cambia la topologia, solo los pesos, por lo que se mantienen las caracteristicas de coste y latencia del base.

El entrenamiento uso aproximadamente 7,7 MB de datos: 11.527 tripletas (pregunta de FAQ, parafrasis, trampa) procedentes de los splits de desarrollo de Hinglish-TOP (2.048), MASSIVE en+hi (9.296) y la mitad del dev set v1 de pakka (183), mas 21.064 pares etiquetados del split de entrenamiento de LangCache (hasta 3.000 por fuente). Las trampas son la misma peticion con otro valor de slot (por ejemplo, "alarm 6 baje" frente a "alarm 7 baje"). Se elimino cualquier texto de entrenamiento presente en algun split de test de los benchmarks o en los mensajes humanos. La receta fue una epoca, learning rate 2e-5, batch 64, MultipleNegativesRankingLoss sobre tripletas (sin texto duplicado en un batch) mas CoSENT sobre los pares; 1,4 minutos en una Kaggle T4. No se menciona RLHF ni DPO, al no ser un modelo generativo.

## Capacidades

- Generacion de embeddings de frase para similitud semantica y busqueda por vecino mas cercano.
- Deteccion de parafrasis y de preguntas equivalentes en ingles, hindi e hinglish romanizado.
- Discriminacion de "trampas" de slot: misma intencion con distinto valor (hora, numero, entidad).
- Integracion con sentence-transformers mediante `SentenceTransformer("mohd010/pakka-minilm-l12-hinglish")`.
- Integracion con la libreria pakka como embedder de cache semantica (`pakka.embed.TUNED_EMBEDDER`).
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- No soporta tool calling, agentes, vision, audio ni modo thinking: es exclusivamente un encoder.
- Capacidad multilingue limitada a en/hi; no hay evidencia de rendimiento en otras lenguas.

## Casos de uso

- Cache semantica en bots de soporte: el modelo decide si una pregunta entrante puede reutilizar una respuesta ya cacheada; con verificador Jev y umbral 0,6 sirve 54 respuestas correctas y 1 incorrecta sobre 258 mensajes humanos reales.
- Atencion al cliente en hinglish: el 80% del conjunto de test humano es hinglish romanizado, por lo que encaja en comercios indios que reciben consultas mezclando ingles y hindi.
- Deduplicacion de tickets: agrupar incidencias equivalentes ("mi pedido no llega" frente a "no me ha llegado el pedido") antes de asignarlas a agentes.
- Enrutado de intenciones con trampas de slot: distinguir "alarm 6 baje" de "alarm 7 baje" para no servir la respuesta de otra franja horaria.
- Prefiltro barato antes de un LLM: al elevar de 26 a 165 los mensajes que superan el umbral de 0,6 sobre 258, mas consultas llegan al verificador sin invocar un modelo grande en cada turno.
- Busqueda de FAQ en catalogo reducido: indexar las 30 preguntas frecuentes de una tienda y recuperar la mas cercana con similitud coseno, a unos 9 ms por consulta en CPU.
- Prototipado en local: 0,47 GB de pesos permiten ejecutar el encoder en un portatil sin GPU para validar una cache semantica antes de desplegarla.

## Benchmarks y rendimiento

Resultados sobre 258 mensajes humanos reales (80% hinglish romanizado, nunca vistos en entrenamiento), con ajustes de la libreria pakka: similitud 0,6 con verificador y Jev pasando a 0,84. Celdas: aciertos / respuestas incorrectas servidas desde cache (tasa de falso positivo, cota superior al 95%).

| Configuracion | Base MiniLM-L12 | Este modelo | Misma receta sin v1 | Qwen3-Embedding-0.6B (referencia) |
|---|---|---|---|---|
| Sin verificador, presupuesto 10% | 2 / 1 | 9 / 2 | 8 / 1 | 11 / 0 |
| + Jev (>= 0,84) | 19 / 0 (0,0%, 16,8%) | 54 / 1 (1,8%, 9,6%) | 54 / 0 (0,0%, 6,6%) | 80 / 1 (1,2%, 6,7%) |
| + LLM barato (qwen/qwen3.7-flash) | 23 / 0 (0,0%, 14,3%) | 76 / 9 (10,6%, 18,9%) | 74 / 5 (6,3%, 14,0%) | 113 / 9 (7,4%, 13,4%) |
| Hinglish capturado, + Jev | 10 / 184 | 44 / 184 | 43 / 184 | 67 / 184 |

Sin verificador y con el mismo numero de respuestas, el modelo no mejora al base en mensajes reales: AUC 0,603 frente a 0,589, y sus 50 respuestas con mayor puntuacion contienen 11 incorrectas frente a 7 del base. Lo que cambia es que 165 de 258 mensajes superan el umbral de 0,6 del verificador, frente a 26 del base.

Resultados en conjuntos publicos no vistos en entrenamiento (sin verificador, 5% de presupuesto):

| Conjunto retenido | AUC base -> ajustado | Base (aciertos / fallos) | Ajustado (aciertos / fallos) | Falsos positivos en el decil superior, base -> ajustado |
|---|---|---|---|---|
| Hinglish-TOP (excluido) | 0,222 -> 0,257 | ninguno encaja | ninguno encaja | 63,7% -> 56,6% |
| MASSIVE en+hi (excluido) | 0,453 -> 0,455 | ninguno encaja | ninguno encaja | 26,5% -> 28,3% |
| LangCache pairs (excluido) | 0,595 -> 0,591 | 8.715 / 4.674 | 8.649 / 4.730 | 34,5% -> 35,3% |
| Bitext (nunca entrenado) | 0,710 -> 0,720 | 163 / 1 | 614 / 20 (3,2%, 4,8%) | 13,8% -> 10,2% |
| Banking77 (nunca entrenado) | 0,624 -> 0,604 | 84 / 4 | 88 / 5 | 13,1% -> 13,8% |
| CLINC150 (nunca entrenado) | 0,692 -> 0,650 | 404 / 19 | ninguno encaja | 4,9% -> 9,5% |
| vCache Classification (nunca entrenado) | no disponible | 7.654 / 190 | 7.680 / 186 | no disponible |

## Requisitos de hardware

- VRAM para inferencia: menos de 1 GB en fp32 (0,47 GB de pesos); en fp16 o int8 el consumo baja de forma proporcional, aunque no se publican cuantizaciones especificas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve; el autor midio el entrenamiento en una Kaggle T4 (16 GB) y la inferencia en CPU de portatil.
- Cabe en GPU de consumo: si, en cualquier RTX o GTX con 2 GB o mas, e incluso en CPU.
- Despliegue: sentence-transformers, Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles y la propia libreria pakka. No hay GGUF publicado, por lo que llama.cpp y Ollama no estan disponibles de forma directa.
- Latencia: aproximadamente 9 ms por pregunta en CPU de portatil, segun el autor.
- Throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| pakka-minilm-l12-hinglish | 117,6 M | no disponible | en, hi | apache-2.0 | Cache semantica con verificador en hinglish |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 117,6 M | no disponible | multilingue | apache-2.0 | Embeddings multilingues generales |
| Qwen3-Embedding-0.6B | 0,6 B | no disponible | multilingue | no disponible en la informacion | Embeddings generales de mayor tamano, usado como referencia |
| Jev (verificador) | no disponible | no disponible | no disponible | no disponible | Verificador de respuestas de cache, complementario |

Frente a su base, el modelo afinado mejora en el escenario con verificador (54 aciertos frente a 19) pero empeora sin el y en CLINC150, Banking77, MASSIVE y LangCache. Frente a Qwen3-Embedding-0.6B, este ultimo obtiene mas aciertos (80 frente a 54 con Jev) a costa de un modelo cinco veces mayor.

## Limitaciones y advertencias

- Por si solo no aporta mejora: el autor indica explicitamente que debe usarse con un verificador; sin el, su umbral es 0,906 y no supera al base.
- Con un verificador LLM barato de si/no sirve mas respuestas incorrectas (9 de 85 en mensajes reales), por encima de un presupuesto del 5%.
- Empeora a su base en CLINC150 y ligeramente en Banking77, MASSIVE y LangCache sin verificador.
- El conjunto de test humano es pequeno (258 mensajes, 23 redactores, 30 FAQ de una sola tienda), por lo que las cotas del 95% son amplias.
- Los umbrales se eligieron sobre la mitad del dev v1 no usada en entrenamiento (252 preguntas), lo que puede no generalizar a otros dominios.
- Riesgo de alucinacion no aplica directamente al ser un encoder, pero un falso positivo en la similitud produce una respuesta incorrecta servida desde cache.
- Sesgos: el entrenamiento se concentra en dominios de FAQ de una tienda y en datasets de intenciones; el rendimiento en otros dominios o registros no esta medido.
- Cobertura limitada a en/hi; no hay evidencia de calidad en castellano ni en otras lenguas.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- No hay cuantizaciones publicadas (GGUF, ONNX), lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohd010/pakka-minilm-l12-hinglish
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Repositorio pakka: https://github.com/mohammedp010/pakka
