# moisf56/medgemma-4b-q3km-gguf

## Resumen

MedGemma 4B Q3_K_M GGUF es una cuantización de 3 bits del modelo médico `google/medgemma-1.5-4b-it`, publicada por Mohammed K. A. Abed (usuario `moisf56`) en el contexto del MedGemma Impact Challenge de Kaggle. Su objetivo es hacer viable la inferencia clínica en dispositivos móviles y hardware sin GPU, reduciendo el peso original de 7,3 GB en BF16 a 2,0 GB, un 73 % menos, mediante cuantización k-means de 3 bits con superbloques medianos (Q3_K_M) implementada con llama.cpp.

El modelo base es un transformer de 3.880.263.168 parámetros (aproximadamente 4B) ajustado para instrucciones y especializado en dominios clínicos. Esta variante mantiene el tokenizador y la plantilla de chat del original (`<start_of_turn>` / `<end_of_turn>`) y está pensada para ejecutarse con llama.cpp, llama-cpp-python o llama.rn en Android. El autor la probó en un Tecno Spark 40 con MediaTek Helio G100 y 8 GB de RAM, donde genera una nota SOAP en unos 60 segundos con un pico de memoria de 3,2 GB.

Su relevancia actual radica en la combinación de tres factores: dominio médico especializado, licencia Gemma con posibilidad de uso comercial bajo los términos de Google, y un tamaño que cabe en teléfonos de gama media. No obstante, el modelo está limitado al inglés y su cuantización de 3 bits introduce una pérdida de calidad medible frente a Q4_K_M, por lo que el propio autor recomienda esta última para estaciones de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: google/medgemma-1.5-4b-it) |
| Parametros totales | 3.880.263.168 (aproximadamente 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configurado en los ejemplos de uso; contexto nativo del base no disponible) |
| Tipos de cuantizacion | Q3_K_M (3,07 bits); el autor menciona también Q4_K_M, Q2_K e IQ2_M como alternativas del ecosistema llama.cpp |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (fichero `medgemma-1.5-4b-it-Q3_K_M.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `google/medgemma-1.5-4b-it`, un transformer decoder-only de aproximadamente 4B parámetros ajustado para seguir instrucciones en el ámbito médico. Esta ficha no dispone de información detallada sobre la composición del dataset de entrenamiento del modelo base, el número de tokens utilizados ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a la model card original de Google, no incluida en la información proporcionada.

La innovación técnica de esta publicación no está en la arquitectura, sino en el proceso de cuantización. El autor convierte los pesos originales a GGUF en FP16 con `convert_hf_to_gguf.py` y luego aplica `llama-quantize` con el tipo Q3_K_M, que emplea cuantización k-means de 3 bits con superbloques de tamaño medio. Según la model card, se eligió Q3_K_M tras comparar variantes en un Android de gama media: Q2_K añadía 3,5 puntos de perplejidad y IQ2_M resultaba demasiado lento en CPU móvil, mientras que Q4_K_M (2,4 GB) no cabía en el presupuesto de RAM tras el sistema operativo y la aplicación. El resultado es un fichero de 2,0 GB que, junto con un modelo ASR auxiliar de 101 MB, mantiene un footprint máximo de 2,1 GB en el dispositivo.

## Capacidades

- Generación de texto clínico en inglés: notas SOAP a partir de transcripciones de dictado, resúmenes de resultados de laboratorio e informes clínicos.
- Razonamiento clínico básico: interpretación de analíticas y correlación de hallazgos dentro de la ventana de contexto configurada.
- Conversación multi-turno con plantilla de chat de Gemma (`<start_of_turn>user` / `<start_of_turn>model`).
- Soporte de entrada de voz en pipeline externo: el autor combina MedASR (ONNX, 101 MB) con este modelo cargándolos de forma secuencial.
- Generación de informes de radiología en ocho modalidades de imagen, aunque esta capacidad requiere el proyector multimodal `mmproj` y se ejecuta en la estación de trabajo con la variante Q4_K_M, no con esta cuantización de 3 bits.
- Consultas en lenguaje natural sobre FHIR para navegación de historiales EHR, también en el pipeline de estación de trabajo con Q4_K_M.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Generación de notas SOAP en dispositivos móviles: el modelo recibe la transcripción de un dictado clínico y produce una nota estructurada en unos 60 segundos en un Helio G100 con 8 GB de RAM. Es adecuado porque el tamaño de 2,0 GB permite cargarlo en memoria junto al sistema operativo y la app, sin conexión a red.
- Transcripción y resumen de resultados de laboratorio en el punto de atención: con una ventana de 4096 tokens puede procesar informes analíticos de extensión moderada y devolver un resumen interpretativo en inglés, útil en entornos con conectividad limitada.
- Chat clínico con entrada de voz en Android: el pipeline carga MedASR para transcribir, lo descarga y luego carga MedGemma para responder, manteniendo un footprint máximo de 2,1 GB. Apropiado para aplicaciones de triaje o consulta rápida en campo.
- Asistencia a la documentación en estaciones de trabajo sin GPU: mediante `llama-server` con `--ctx-size 4096` se puede desplegar un endpoint HTTP local para que aplicaciones de escritorio generen borradores de notas clínicas; el autor usa Q4_K_M en Ryzen 7 8845HS para este escenario.
- Prototipado e investigación en NLP clínico: al ser un GGUF de 2 GB, se puede iterar rápidamente en portátiles convencionales con llama-cpp-python, sin necesidad de GPUs dedicadas, para experimentar con prompts y plantillas SOAP.
- Evaluación de cuantizaciones en el dominio médico: sirve como referencia para medir la degradación de calidad de Q3_K_M frente a Q4_K_M en tareas clínicas concretas, tal como hizo el autor al comparar perplejidad y latencia entre variantes.
- Despliegue en entornos con requisitos de privacidad estrictos: al ejecutarse íntegramente en el dispositivo, los datos del paciente no salen del teléfono, lo que facilita el cumplimiento de normativas de protección de datos en escenarios de dictado local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MedQA u otros) en la información disponible. La model card únicamente reporta métricas de rendimiento en dispositivo:

| Metrica | Valor | Entorno |
|---|---|---|
| Generacion de nota SOAP | ~60 s | Tecno Spark 40, Helio G100, 8 GB RAM, CPU |
| Pico de memoria en inferencia | ~3,2 GB | Tecno Spark 40 |
| Impacto en bateria | < 3 % por hora de uso activo | Tecno Spark 40 |
| Tiempo de carga del modelo | ~8 s | Tecno Spark 40 |
| Tamano del fichero GGUF | 2,0 GB | Q3_K_M |
| Reduccion frente a BF16 | 73 % (7,3 GB a 2,0 GB) | Q3_K_M |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 3,2 GB de pico en CPU móvil con Q3_K_M; en estación de trabajo conviene reservar al menos 4 GB de RAM libre para el modelo y el contexto de 4096 tokens.
- GPU recomendadas: no se requiere GPU. El autor valida CPU-only en MediaTek Helio G100 y en Ryzen 7 8845HS. Para la variante Q4_K_M en escritorio, cualquier GPU con 6 GB o más de VRAM es suficiente, aunque no se documentan pruebas específicas con A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM para Q3_K_M; para Q4_K_M se recomiendan 6 GB o más.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, llama.rn para React Native/Android. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: aproximadamente 60 segundos por nota SOAP de hasta 512 tokens generados en un Helio G100; el tiempo de carga del modelo es de unos 8 segundos. No se proporcionan cifras de tokens por segundo ni de latencia en estación de trabajo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| moisf56/medgemma-4b-q3km-gguf | ~3,88B | 4096 (configurado) | GGUF Q3_K_M (2,0 GB) | Gemma Terms of Use | Médico, on-device |
| google/medgemma-1.5-4b-it (base) | ~3,88B | no disponible | Safetensors BF16 (7,3 GB) | Gemma Terms of Use | Médico, instrucciones |
| Variante Q4_K_M del mismo base | ~3,88B | 4096 (configurado) | GGUF Q4_K_M (2,4 GB) | Gemma Terms of Use | Médico, estación de trabajo |
| Variante Q2_K del mismo base | ~3,88B | 4096 (configurado) | GGUF Q2_K (1,5 GB) | Gemma Terms of Use | Médico, máxima compresión |

La comparación directa con modelos de otros autores y mismo tamaño (por ejemplo, variantes médicas de 3-4B en otros ecosistemas) no está disponible en la información proporcionada. Las alternativas documentadas son las distintas cuantizaciones del mismo modelo base, que difieren en tamaño, calidad y latencia.

## Limitaciones y advertencias

- Cuantización agresiva: Q3_K_M introduce pérdida de calidad frente a Q4_K_M y al modelo original en BF16. El autor la selecciona por restricciones de RAM móvil, no por ser la variante de mayor fidelidad.
- Idioma: el modelo solo declara soporte de inglés. No se garantiza un rendimiento correcto en castellano ni en otros idiomas, lo que limita su uso directo en entornos clínicos hispanohablantes.
- Riesgo de alucinación: como todo modelo generativo en dominio médico, puede producir contenido clínicamente plausible pero incorrecto. No debe usarse como sustituto del juicio profesional ni para decisiones diagnósticas o terapéuticas sin supervisión humana.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible. Al heredar el modelo base de Google, arrastra los sesgos de su dataset de entrenamiento, no detallado en esta ficha.
- Restricciones de licencia: se rige por los Gemma Terms of Use. Es necesario aceptar dichos términos en la página del modelo original antes de descargar o usar esta cuantización. El uso comercial está sujeto a las condiciones de Google, no a una licencia permisiva estándar.
- Contexto limitado: los ejemplos configuran 4096 tokens, insuficiente para historiales clínicos extensos o transcripciones largas sin fragmentación previa.
- Capacidades multimodales: la generación de informes de radiología requiere el proyector `mmproj` y, según el autor, se ejecuta con Q4_K_M en estación de trabajo; no está validada con esta cuantización de 3 bits.
- Madurez: el repositorio tiene 25 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- Entorno de prueba acotado: las métricas de rendimiento provienen de un único dispositivo Android de gama media y de un Ryzen 7 8845HS; no hay datos de latencia en GPUs de datacenter ni en servidores de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moisf56/medgemma-4b-q3km-gguf
- Modelo base: https://huggingface.co/google/medgemma-1.5-4b-it
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Repositorio Capsule (implementación de referencia): https://github.com/moisf56/capsule
- Implementación móvil en React Native: https://github.com/moisf56/capsule/blob/main/mobile/MedGemmaApp/App.tsx
- MedGemma Impact Challenge (Kaggle): https://www.kaggle.com/competitions/medgemma-impact-challenge
- Perfil del autor: https://huggingface.co/moisf56
