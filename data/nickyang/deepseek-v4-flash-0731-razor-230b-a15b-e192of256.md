# Nickyang/DeepSeek-V4-Flash-0731-Razor-230B-A15B-E192of256

## Resumen

DeepSeek-V4-Flash-0731-Razor-230B-A15B-E192of256 es un checkpoint derivado de DeepSeek-V4-Flash-0731 al que se le ha eliminado una cuarta parte de sus expertos enrutados mediante RAZOR, un metodo de poda de expertos sin entrenamiento (training-free). Cada capa MoE con router aprendido conserva 192 de sus 256 expertos originales, incluidas las capas de prediccion multi-token (MTP). No se aplicaron actualizaciones de gradiente ni entrenamiento de recuperacion: los pesos retenidos son los del modelo base, y RAZOR solo aporta la seleccion de expertos.

El modelo pasa de unos 304B parametros totales (21B activos) en el base a 230B totales (215B excluyendo el modulo MTP) con aproximadamente 14,8B activos por token. Mantiene 43 capas MoE, tres de ellas capas hash de token-ID fijo, y sigue activando 6 expertos por token (top-k sin cambios). Los expertos enrutados se almacenan en MXFP4 con expertos compartidos en FP8 y escalas UE8M0, igual que el modelo base, lo que da un repositorio de 127,5 GB.

Su relevancia es practica: reduce el coste de memoria y de computo de un MoE de gran tamano sin reentrenar, a costa de una perdida de fidelidad que el propio autor reconoce como no caracterizada de forma exhaustiva. Es un artefacto de investigacion (0 descargas, 0 likes, publicado el 28 de septiembre de 2026) que interesa a quien quiera evaluar tecnicas de poda de expertos sobre un backbone real de escala frontier.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura `deepseek_v4`) con router aprendido, expertos compartidos y modulo de prediccion multi-token (MTP) |
| Parametros totales | 230.080.171.262 (~230B); 215B excluyendo el modulo MTP |
| Parametros activos | ~14,8B por token (el modelo base declara ~21B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 para expertos enrutados (`expert_dtype: fp4`); FP8 para expertos compartidos; escalas UE8M0. Tags: `8-bit`, `fp8` |
| Idiomas soportados | no disponible (no se declaran idiomas en la model card ni en los tags) |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos MXFP4/FP8 empaquetados) |
| Capas MoE | 43 (incluye 3 capas hash de token-ID fijo, `num_hash_layers: 3`) |
| Expertos enrutados por capa | 192 de 256 (podados por RAZOR) |
| Expertos activos por token (top-k) | 6 (sin cambios respecto al base) |
| Tamano del repositorio | 127,5 GB |
| Modelo base | deepseek-ai/DeepSeek-V4-Flash-0731 |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base DeepSeek-V4-Flash-0731: un transformer con mezcla de expertos (MoE) de 43 capas, router aprendido, expertos compartidos, atencion sin modificar y un modulo de prediccion multi-token (MTP). Este checkpoint no introduce parametros nuevos ni cambios estructurales; la unica diferencia respecto al base es el conjunto de expertos enrutados retenidos en cada capa (192 de 256). La atencion, los expertos compartidos, el embedding y la LM head quedan intactos.

No hubo entrenamiento: RAZOR es un metodo de poda sin gradientes. La seleccion de expertos se basa en una pregunta distinta a la frecuencia o magnitud de activacion del router: para un token enrutado a un conjunto S con pesos normalizados, se calcula la mezcla enrutada y el residuo de consenso de cada experto, y se estima el cambio exacto de salida local que provocaria eliminar un experto seleccionado (promocionando el mejor experto no seleccionado). Las puntuaciones se agregan por raiz cuadratica media condicional sobre los tokens de calibracion enrutados a cada experto, y se conservan los de mayor puntuacion por capa. Las tres capas hash no tienen puntuaciones de router, por lo que su conjunto retenido proviene de la politica de capas hash del pipeline, no de una puntuacion RAZOR.

La calibracion se hizo con filas de 32.768 tokens procedentes de RazorCal, el corpus multidisciplinar de 2.048 muestras publicado con RAZOR. El autor advierte que la seleccion depende de la muestra de calibracion, por lo que una ejecucion independiente reproduce el procedimiento, no este conjunto exacto de expertos. La validacion de este checkpoint se hizo mediante comprobaciones a nivel de tensor contra el plan de poda; la puerta de equivalencia de logprobs empleada en otros backbones no era aplicable aqui porque el modelo base no usa plantilla de chat Jinja.

## Capacidades

- Generacion de texto y modelado de lenguaje: es un modelo `text-generation` puro; no se declaran capacidades de vision, audio ni multimodalidad en la informacion disponible.
- Razonamiento y cadenas de pensamiento: el repositorio incluye `encoding/encoding_dsv4.py`, la implementacion de referencia del modelo base para codificar mensajes, con formatos de razonamiento descritos en `encoding/README.md`.
- Tool calling y function calling: la codificacion de referencia del base contempla formatos de tool calling (segun `encoding/README.md`), aunque la model card no detalla el comportamiento tras la poda.
- Conversacion multi-turno: soportada a traves del codificador de mensajes del modelo base, no mediante plantilla Jinja.
- Prediccion multi-token (MTP): el modulo MTP se conserva en el checkpoint (215B de parametros excluyendo MTP frente a 230B totales).
- Capacidades multilingues: no disponibles; no se declaran idiomas soportados.
- Sin modo "thinking" documentado de forma explicita: la informacion disponible solo menciona formatos de razonamiento en el codificador, no un modo thinking formal.

## Casos de uso

- Evaluacion de tecnicas de poda de expertos: sirve como artefacto de comparacion directa contra DeepSeek-V4-Flash-0731 y contra el otro presupuesto publicado (128 de 256 expertos) para medir la perdida de fidelidad a distintos ratios de poda.
- Servicio de generacion de texto en GPUs con memoria limitada: al ocupar 127,5 GB de pesos en MXFP4/FP8 frente a los ~304B del base, permite desplegar un MoE de gran tamano en configuraciones de 2 GPU de 80 GB en lugar de necesitar nodos mayores.
- Procesamiento por lotes de texto a gran escala: tareas de resumen, extraccion y clasificacion sin requisitos de razonamiento profundo, donde el ahorro de computo por token (~14,8B activos) importa mas que la retencion exacta de capacidad.
- Investigacion sobre calibracion de poda: permite reproducir el efecto de distintos corpus y dibujos de calibracion sobre el conjunto de expertos retenido, ya que el autor publica el manifiesto `kept_expert_indices.json` y las herramientas `razor saliency` y `razor prune`.
- Punto de partida para recuperacion con fine-tuning: al conservar los pesos originales del base y una licencia MIT, es un candidato razonable para un ajuste posterior que recupere parte del rendimiento perdido.
- Analisis de enrutamiento y especializacion de expertos: util para estudiar que expertos son prescindibles, comparando el conjunto retenido por RAZOR con metricas de frecuencia de activacion.
- Generacion asistida con tool calling en entornos controlados: si el ajuste del prompt mediante `encoding_dsv4.py` es correcto, puede integrarse en flujos de agentes, siempre con validacion previa en la carga de trabajo propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni equivalentes, ni cifras de retencion por tarea. El autor solo indica cualitativamente que la retencion en benchmarks y la fidelidad predictiva no garantizan una generacion estable, y remite al paper de RAZOR (arXiv:2609.30465) para las mediciones.

## Requisitos de hardware

- Memoria para pesos: el repositorio ocupa 127,5 GB, por lo que se necesitan al menos ~128 GB de memoria solo para los pesos, mas la cache KV y activaciones. No se publican cifras oficiales de VRAM.
- GPU recomendadas (estimacion a partir del tamano, no publicada por el autor): una H200 de 141 GB podria alojar los pesos con margen ajustado; dos H100 80 GB o dos A100 80 GB en paralelo de tensor serian el minimo practico para dejar espacio a la cache KV.
- GPU de consumo: no cabe. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) son insuficientes incluso con cuantizacion adicional, al partir ya de pesos en FP4/FP8.
- Opciones de despliegue: el runtime debe soportar el layout cuantizado del modelo base (expertos enrutados en MXFP4, expertos compartidos en FP8, escalas UE8M0). La model card no confirma soporte en vLLM, SGLang, llama.cpp, Ollama ni TGI; se indica explicitamente que se requiere un runtime compatible con el layout cuantizado y la pila de inferencia de referencia del modelo base.
- Codificacion de prompt: no hay plantilla de chat Jinja; hay que usar `encoding/encoding_dsv4.py` incluido en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Expertos enrutados por capa | Capas MoE | Licencia | Notas |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-Razor-230B-A15B-E192of256 | ~230B (215B sin MTP) | ~14,8B | 192 de 256 | 43 | MIT | Este checkpoint; poda RAZOR, sin reentrenamiento |
| DeepSeek-V4-Flash-0731-Razor-156B-A15B-E128of256 | ~156B (nominal) | ~15B (nominal, segun el nombre) | 128 de 256 | no disponible | no disponible en la informacion | Otro presupuesto de poda RAZOR del mismo autor |
| deepseek-ai/DeepSeek-V4-Flash-0731 | ~304B | ~21B | 256 de 256 | 43 | no disponible en la informacion | Modelo base sin podar |

No se dispone de otros modelos comparables en la informacion proporcionada (ni de cifras de rendimiento que permitan una comparacion cuantitativa entre estos tres checkpoints).

## Limitaciones y advertencias

- La poda de expertos es con perdida. El autor advierte que la retencion en benchmarks y la fidelidad predictiva no garantizan una generacion estable: las respuestas cambian en diversidad, formato y comportamiento de terminacion incluso cuando la precision en tareas se mantiene en gran medida.
- Recomendacion explicita de evaluar en la carga de trabajo propia antes de desplegar; no hay puerta de equivalencia de logprobs valida para esta familia de modelos.
- El corpus de calibracion (RazorCal) es multidisciplinar pero finito, por lo que el comportamiento en dominios alejados de el no esta caracterizado por las mediciones publicadas.
- La seleccion de expertos depende del dibujo de calibracion: reproducir el pipeline no garantiza obtener este mismo conjunto de expertos.
- Discrepancia tecnica en la model card: se indica que el top-k se mantiene en 6 expertos activos por token, mientras que los parametros activos bajan de ~21B a ~14,8B. La ficha no explica esa relacion.
- Las tres capas hash de token-ID fijo no se podan por puntuacion RAZOR, sino por una politica del pipeline; su comportamiento tras la poda puede diferir del de las capas con router aprendido.
- Idiomas soportados no declarados: no hay garantias documentadas de cobertura multilingue.
- Longitud de contexto no disponible: no se puede planificar despliegues con ventanas largas sin verificacion previa.
- Compatibilidad de runtime no confirmada: cargar los pesos FP4 requiere un runtime que soporte el layout del base; no se confirma soporte en las pilas de inferencia mas habituales.
- Sin datos de benchmarks ni de rendimiento publicados; 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por terceros.
- Uso comercial: los pesos derivados se distribuyen bajo MIT, pero el codigo RAZOR es Apache-2.0 y los registros de RazorCal siguen sujetos a sus terminos upstream (`data/LICENSE-DATA`). Verificar la licencia del modelo base antes de un uso comercial.
- Cualquier dato de VRAM, latencia o throughput ofrecido aqui es una estimacion derivada del tamano del repositorio, no una cifra publicada por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nickyang/DeepSeek-V4-Flash-0731-Razor-230B-A15B-E192of256
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Otro presupuesto de poda (128 de 256 expertos): https://huggingface.co/Nickyang/DeepSeek-V4-Flash-0731-Razor-156B-A15B-E128of256
- Paper de RAZOR (arXiv:2609.30465): https://arxiv.org/abs/2609.30465
- Repositorio de codigo RAZOR: https://github.com/nick7nlp/Razor
- Documentacion de modelos y politica de capas hash: https://github.com/nick7nlp/Razor/blob/main/docs/models.md
- Corpus de calibracion RazorCal: https://github.com/nick7nlp/Razor/tree/main/data
- Licencia de los datos de RazorCal: https://github.com/nick7nlp/Razor/blob/main/data/LICENSE-DATA
