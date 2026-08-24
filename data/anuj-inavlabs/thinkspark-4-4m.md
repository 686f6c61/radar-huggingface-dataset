# anuj-inavlabs/ThinkSpark-4.4M

## Resumen

ThinkSpark-4.4M es un modelo de clasificación de texto desarrollado por iNav Labs (anuj-inavlabs) que resuelve un problema específico en agentes de voz: el silencio incómodo entre la transcripción del usuario (STT) y la respuesta del agente (TTS). En ese hueco, el modelo predice el sonido de pensamiento o backchannel humano adecuado —como "hmm", "अच्छा", "એક સેકન્ડ" o "ええと"— en el idioma, escritura nativa, registro y emoción correctos para cada momento de la conversación.

Con solo 4.445.809 parámetros (~4,4 millones), es un modelo extremadamente ligero diseñado para inferencia en CPU con latencia de un solo dígito de milisegundos. Su arquitectura es un dual-encoder a nivel de byte que procesa la entrada actual del usuario y el contexto conversacional previo, con atención cruzada de la entrada hacia el contexto. Está entrenado con 38.000 pares de datos personalizados y licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones.

La relevancia actual de este modelo radica en que los agentes de voz basados en pipelines STT → LLM → TTS sufren de "aire muerto" entre turnos, y ThinkSpark ofrece una solución de bajo coste computacional para humanizar esa pausa, soportando 22 idiomas y 9 intenciones de super-reacción del agente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-encoder byte-level con cross-attention (input → contexto) y 5 cabezas de predicción |
| Parametros totales | 4.445.809 (~4,4M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de clasificación de texto, no generativo) |
| Tipos de cuantizacion | No disponible (no se especifica en la documentación) |
| Idiomas soportados | 22: hi, mr, bn, gu, pa, ta, te, kn, ml, or, as, ur, hi_en, en, es, fr, de, pt, ja, zh, ar, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (formato de archivo no especificado; repo de 0,1 GB) |

## Arquitectura y entrenamiento

ThinkSpark-4.4M emplea un tokenizador a nivel de byte que elimina problemas de vocabulario fuera de cobertura (OOV) en cualquier escritura, desde devanagari hasta árabe. La arquitectura consta de dos encoders separados: uno para la entrada actual del usuario (texto primario) y otro para el contexto conversacional previo (que puede ser multilingüe o mezclado). El encoder de entrada realiza atención cruzada (cross-attention) sobre el contexto, de modo que el contexto modula la representación de la entrada. Sobre esta representación combinada se montan cinco cabezas de clasificación que predicen: idioma (22 clases), intención (9 super-reacciones: thinking, clarify, acknowledge, disagree, react_positive, empathize, soothe, impatient, silence), registro, emoción y tipo de relleno (sound, word, sound_word, words, none).

El entrenamiento utiliza focal loss con balanceo de clases para manejar el desequilibrio entre categorías. Además, se aplica un "script guard" en inferencia que fija el idioma según la escritura nativa detectada, lo que refuerza la precisión del idioma. Los datos de entrenamiento consisten en 38.000 pares personalizados, generados por la herramienta "kupe-thinkspark". No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con etiquetas de las cinco dimensiones.

## Capacidades

- Predicción de backchannel y sonidos de pensamiento ("hmm", "अच्छा", "એક સેકન્ડ", "ええと") para rellenar pausas en conversaciones de agentes de voz.
- Clasificación de idioma en 22 variantes, incluyendo código mezclado hindi-inglés (hi_en), con soporte para escritura nativa de cada idioma.
- Detección de 9 intenciones de super-reacción del agente: pensar, aclarar, reconocer, discrepar, reaccionar positivamente, empatizar, calmar, impacientarse o silencio.
- Predicción de registro, emoción y tipo de relleno (sonido, palabra, combinación, frase o ninguno).
- Inferencia en CPU con latencia de milisegundos, apta para integración en tiempo real en pipelines de voz.
- Soporte multilingüe y de contexto mixto: el contexto conversacional puede estar en un idioma distinto al de la entrada actual.
- Diccionario de rellenos curado que muestrea el sonido final según la combinación (idioma, intención, tipo de relleno).

## Casos de uso

- Atención al cliente por voz: el modelo rellena los silencios entre la pregunta del usuario y la respuesta del agente con sonidos de pensamiento apropiados al idioma y la emoción, reduciendo la sensación de robotización y mejorando la fluidez percibida.
- Asistentes virtuales multilingües: en un asistente que opera en hindi, bengalí, español o japonés, ThinkSpark genera el backchannel correcto en escritura nativa, evitando transliteraciones extrañas.
- Sistemas de teleoperación y call centers automatizados: integrado en el pipeline STT → LLM → TTS, el modelo decide si el agente debe emitir un sonido de reconocimiento, empatía o impaciencia según la intención detectada, mejorando la experiencia del usuario.
- Plataformas de tutoría o coaching por voz: el modelo puede emitir sonidos de "ajá" o "ya veo" en el idioma del estudiante, fomentando una interacción más natural y cercana.
- Juegos y experiencias interactivas de voz: para personajes no jugadores (NPC) que conversan con el jugador, ThinkSpark proporciona reacciones vocales humanas en tiempo real sin necesidad de GPU.
- Pruebas de concepto y prototipos de agentes conversacionales: al ser un modelo de 4,4M de parámetros con licencia Apache 2.0, es ideal para equipos que necesitan validar interacciones de voz con bajo coste computacional y sin fricciones de licencia.

## Benchmarks y rendimiento

La model card del autor reporta las siguientes métricas de prueba:

| Metrica | Valor |
|---|---|
| Intent accuracy | 0,440 |
| Intent top-2 accuracy | 0,640 |
| Intent macro-F1 | 0,340 |
| Language accuracy | 0,967 |
| Emotion accuracy | 0,444 |
| Filler_type accuracy | 0,536 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Las métricas indican que la predicción de idioma es muy sólida, mientras que la intención y la emoción presentan márgenes de mejora, probablemente por la dificultad inherente de clasificar matices conversacionales con solo 38.000 pares de entrenamiento.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ser "CPU-friendly" y ejecutarse con latencia de un solo dígito de milisegundos, por lo que no requiere GPU dedicada.
- Memoria: con 4,4M de parámetros y un repo de 0,1 GB, el modelo ocupa menos de 100 MB en disco y puede cargarse en RAM sin problemas en cualquier servidor o dispositivo edge.
- GPU recomendadas: no se requiere ninguna; cualquier CPU moderna (x86 o ARM) es suficiente.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con TorchServe, FastAPI, o integrarse directamente en aplicaciones Python. No se menciona soporte para vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Throughput: no se proporcionan cifras exactas, pero la latencia de milisegundos sugiere que puede manejar cientos de predicciones por segundo en CPU.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables que aborden específicamente la predicción de backchannels y sonidos de pensamiento para agentes de voz. Los modelos de clasificación de texto tradicionales (p. ej., BERT o DistilBERT) podrían adaptarse a esta tarea, pero no están optimizados para la salida multidimensional (idioma, intención, emoción, tipo de relleno) ni para la latencia extrema en CPU.

## Limitaciones y advertencias

- Las métricas de intención y emoción son moderadas (accuracy ~0,44), lo que implica que en conversaciones complejas o ambiguas el modelo puede elegir una reacción inapropiada.
- El dataset de entrenamiento es de solo 38.000 pares, generado sintéticamente; el propio autor recomienda "QA con hablantes nativos" para rellenos urbanos, con código mezclado y en idiomas de bajos recursos.
- No se especifica el comportamiento con entradas muy largas o contextos extensos; al ser un clasificador, la longitud de contexto efectiva depende de la implementación del tokenizador byte-level.
- Riesgo de alucinación: al ser un modelo de clasificación, no genera texto libre, por lo que el riesgo de alucinación es bajo, pero la selección incorrecta de un relleno puede resultar en respuestas inapropiadas desde el punto de vista pragmático.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías; el usuario es responsable de validar su comportamiento en el dominio de aplicación.
- No se proporcionan pesos cuantizados ni formatos optimizados (GGUF, ONNX), lo que puede limitar su despliegue en entornos muy restringidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anuj-inavlabs/ThinkSpark-4.4M
- Repositorio GitHub (kupe-thinkspark): https://github.com/iNavLabsResearch/kupe-thinkspark
- Perfil de iNav Labs en Hugging Face: https://huggingface.co/inavlabs
- Sitio web de iNav Labs: https://www.inavlabs.com/
- Dataset relacionado (kupe-tts): https://huggingface.co/datasets/anuj-inavlabs/kupe-tts/viewer
