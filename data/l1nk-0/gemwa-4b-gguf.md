# l1nk-0/Gemwa-4B-GGUF

## Resumen

Gemwa-4B-GGUF es la distribucion en formato GGUF de Gemwa-4B, un ajuste fino de Gemma 3 4B Instruct especializado en responder en bhojpuri (भोजपुरी), una lengua indoaria hablada principalmente en Bihar y Uttar Pradesh (India) y en la region del Terai (Nepal). El modelo lo desarrolla el usuario independiente l1nk-0 y resuelve un problema concreto: los modelos multilingues generalistas, incluido el propio Gemma 3, tienden a responder en hindi cuando se les consulta en bhojpuri, lo que degrada la utilidad real para hablantes nativos de esta lengua de bajos recursos.

El repositorio contiene unicamente pesos cuantizados (Q4_K_M, Q5_K_M y Q8_0) mas un proyector multimodal mmproj, pensados para ejecucion local con llama.cpp, Ollama y LM Studio. Con 3.880.263.168 parametros (aproximadamente 3,9 mil millones), hereda la arquitectura transformer de Gemma 3 4B y su ventana de contexto, aunque la model card no detalla estos extremos.

La relevancia del proyecto es doble: por un lado, demuestra que un ajuste fino ligero sobre un modelo de 4B puede desplazar la lengua de respuesta de forma medible (de 0,14 a 0,97 en la proporcion de marcadores de bhojpuri); por otro, expone con honestidad sus limitaciones de conocimiento factual y la naturaleza machine-translated de parte de sus datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 3 4B Instruct) |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q5_K_M, Q8_0 (mas proyector mmproj) |
| Idiomas soportados | bho (bhojpuri), hi (hindi) |
| Licencia | gemma (Gemma Terms of Use) + requisito de atribucion a l1nk-0 |
| Formato de pesos | GGUF (safetensors en el modelo base l1nk-0/Gemwa-4B) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 4B Instruct, un transformer decoder-only de Google DeepMind con 3,9 mil millones de parametros. Gemwa-4B se obtiene mediante ajuste fino supervisado sobre ese checkpoint para forzar la generacion en bhojpuri. La model card no especifica el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales; solo indica que los datos generales proceden de una traduccion automatica de Stanford Alpaca al bhojpuri y que existe un conjunto especifico de ejemplos sobre la festividad de Chhath.

La innovacion tecnica principal no esta en la arquitectura sino en el objetivo del ajuste: corregir el sesgo de cambio de lengua (language shift) hacia el hindi. El autor reporta una mejora de 0,14 a 0,97 en la proporcion de marcadores lexicos de bhojpuri (बा, खातिर, एगो, गइल, जाला) frente a marcadores de hindi en unas 30 preguntas reservadas. Esta metrica mide la lengua de respuesta, no la calidad del contenido. En el plano factual, sobre 12 preguntas de Chhath formuladas de manera distinta al entrenamiento, la version 1.2 acierta 8, frente a 1 de la version 1.0.

## Capacidades

- Generacion de texto conversacional en bhojpuri, con capacidad de mantener el registro linguistico de forma consistente en lugar de derivar al hindi.
- Comprension y generacion en hindi, heredada del modelo base y reforzada por el solapamiento linguistico entre ambas lenguas.
- Conocimiento factual general heredado de Gemma 3 4B, incluyendo nociones de cultura general, historia y geografia.
- Conocimiento especifico, aunque limitado y no fiable, sobre la festividad de Chhath (cuatro dias, rituales de nahay-khay, kharna, sandhya arghya y usha arghya, thekua, soop-daura).
- Soporte de conversacion multiturno mediante el formato de chat de Gemma 3 (modo `-cnv` en llama.cpp).
- Capacidad multimodal potencial por herencia del modelo base (se incluye `Gemwa-4B-mmproj.gguf`), aunque el autor advierte que la entrada de imagen no se probo tras el ajuste fino.
- No se documenta soporte verificado de tool calling ni de razonamiento agentico multi-paso en la informacion disponible.

## Casos de uso

- Atencion al ciudadano en bhojpuri: un asistente conversacional para administraciones de Bihar o Uttar Pradesh que responda en la lengua del usuario en lugar de forzar hindi o ingles, reduciendo la barrera idiomatica en tramites basicos.
- Difusion cultural sobre Chhath: generacion de explicaciones divulgativas del ritual para aplicaciones de turismo religioso o medios locales, siempre con revision humana dado el riesgo de error factual documentado.
- Educacion primaria bilingue: apoyo a docentes que necesiten materiales o explicaciones en bhojpuri para alumnado cuya lengua materna no es el hindi, aprovechando la capacidad de reformulacion del modelo.
- Prototipado de interfaces de voz: al ser un GGUF de 2,49 GB en Q4_K_M, puede ejecutarse en portatiles modestos y servir como motor de texto en pipelines de ASR + TTS para bhojpuri, una combinacion poco cubierta por proveedores comerciales.
- Investigacion en lenguas de bajos recursos: punto de partida para estudiar el fenomeno de language shift en modelos multilingues y para experimentos de ajuste fino con datos nativos en lugar de traduccion automatica.
- Preservacion linguistica y archivo: generacion de textos de dominio publico en bhojpuri para corpus, subtitulado o digitalizacion de contenido oral, con la advertencia de que la calidad estilistica es limitada y puede contener palabras inventadas.
- Despliegue en entornos sin conectividad: al distribuirse en GGUF y ejecutarse con llama.cpp u Ollama, es viable en escuelas rurales o dispositivos sin acceso a APIs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona unicamente dos metricas propias, no normalizadas:

| Metrica | Gemma 3 4B IT | Gemwa-4B |
|---|---|---|
| Puntuacion de bhojpuri (proporcion de marcadores de bhojpuri frente a hindi en ~30 preguntas reservadas) | 0,14 | 0,97 |
| Aciertos en 12 preguntas sobre Chhath (verificacion automatica y lectura manual) | 1 (Gemwa v1.0) | 8 (Gemwa v1.2) |

El autor advierte explicitamente que la primera metrica mide la lengua de respuesta, no la calidad, y que no existe aun una evaluacion con benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con Q4_K_M (pesos de 2,49 GB mas cache KV), 3-4 GB con Q5_K_M (2,83 GB) y 4,5-5,5 GB con Q8_0 (4,13 GB). El proyector mmproj anade unos 0,85 GB si se usa entrada de imagen.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070) para Q4_K_M o Q5_K_M; 8 GB o mas para Q8_0. En el segmento profesional, A100, H100 o L40S son sobredimensionadas para este tamano y solo se justifican por agregacion de peticiones.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas; tambien en CPU pura con RAM suficiente (2,5-4,5 GB).
- Opciones de despliegue: Ollama (`ollama run hf.co/l1nk-0/Gemwa-4B-GGUF:Q4_K_M`), llama.cpp (`llama-cli -hf l1nk-0/Gemwa-4B-GGUF:Q4_K_M -cnv`), LM Studio (busqueda por `l1nk-0/Gemwa-4B-GGUF`). Tambien es compatible con endpoints que acepten GGUF, segun los tags del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, es esperable que un 4B cuantizado a Q4_K_M supere las decenas de tokens por segundo en GPU consumer moderna, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque linguistico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemwa-4B-GGUF | 3,88 B | no disponible | Ajuste fino especifico para bhojpuri | Gemma Terms + atribucion a l1nk-0 | GGUF en Hugging Face |
| Gemma 3 4B IT | 3,9 B aprox. | no disponible | Multilingue generalista; responde en hindi ante entrada en bhojpuri | Gemma Terms of Use | Pesos oficiales de Google |
| Modelos indic generalistas (p. ej. familia IndicBERT o similares) | variable | variable | Cobertura indic amplia, pero no necesariamente generativa ni centrada en bhojpuri | variable | variable |

La comparacion cuantitativa con alternativas especificas para bhojpuri no esta disponible en la informacion proporcionada. El propio autor situa la referencia directa en Gemma 3 4B IT, del que parte, y en el que mide la mejora de 0,14 a 0,97 en marcadores de bhojpuri.

## Limitaciones y advertencias

- Riesgo factual alto: en 12 preguntas de Chhath formuladas de forma distinta al entrenamiento, la version 1.2 acierta 8. El autor documenta confusiones entre el tercer dia (sandhya arghya, sol poniente) y el cuarto (usha arghya, sol naciente), atribucion erronea de Chaiti Chhath a Kartik en lugar de Chaitra, y mencion de Arjun en vez de Karna como figura del Mahabharata vinculada a la festividad. Tambien puede anadir detalles inventados.
- Fuera del dominio de Chhath, el conocimiento procede de Gemma 3 4B y puede ser incorrecto.
- Los datos generales de entrenamiento son traduccion automatica de Alpaca al bhojpuri, lo que produce formulaciones poco naturales y aparicion ocasional de palabras o formas del hindi.
- La escritura creativa puede ser repetitiva y contener palabras inventadas.
- Evaluacion limitada: solo una comprobacion automatica de lengua de salida, 12 preguntas de Chhath y lectura manual del autor. No hay benchmarks estandar.
- Solo se entreno texto; la entrada de imagen no se probo tras el ajuste fino, pese a incluirse el proyector mmproj.
- Restricciones de licencia: se aplican los Gemma Terms of Use y la Gemma Prohibited Use Policy, mas un requisito adicional de atribucion a l1nk-0 con enlace a https://huggingface.co/l1nk-0/Gemwa-4B en cualquier uso, redistribucion, ajuste o producto derivado.
- Parte de los datos de entrenamiento deriva de Stanford Alpaca, publicado bajo CC BY-NC 4.0; el autor advierte de que el uso comercial debe revisarse a la luz de esa clausula no comercial.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.
- No hay informacion sobre sesgos demograficos o culturales especificos mas alla de los derivados del modelo base y de la traduccion automatica.

## Enlaces

- Repositorio GGUF: https://huggingface.co/l1nk-0/Gemwa-4B-GGUF
- Modelo base ajustado: https://huggingface.co/l1nk-0/Gemwa-4B
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Stanford Alpaca (origen de parte de los datos): https://github.com/tatsu-lab/stanford_alpaca
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
