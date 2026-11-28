# Harsha001/Inkling-2-Mini-Uncensored-ROCmFPX

## Resumen

Inkling-2-Mini-Uncensored-ROCmFPX es una cuantización GGUF del modelo Inkling 2 Mini de Thinking Machines, publicada por el usuario Harsha001 y orientada específicamente a GPUs AMD (Vulkan y ROCm) y a equipos con memoria unificada como el Strix Halo de AMD. El modelo original tiene 26.065.943.137 parámetros totales y una arquitectura de mezcla de expertos (MoE) con 24 capas, 128 expertos por capa y 8 activos por token, lo que resulta en aproximadamente 3.100 millones de parámetros activos por pasada de capa. Es un modelo "looped": las capas 6 a 17 se ejecutan tres veces por token, de modo que cada token atraviesa 48 capas efectivas.

La variante aquí publicada incorpora la edición de "uncensoring" de AtomicChat, una LoRA de rango 1 aplicada sobre la salida de atención y los expertos enrutados de las 24 capas, además del embedding de tokens, que elimina la dirección de rechazo de cada capa. Según las mediciones de AtomicChat, el modelo resultante no rechaza peticiones dañinas en inglés ni en ruso (el original rechazaba entre el 91 % y el 100 %), mantiene la ausencia de rechazos en los prompts seguros de XSTest y conserva un MMLU del 79,15 % frente al 80,65 % del original.

La relevancia de esta ficha reside en que ofrece pesos pre-cuantizados en formatos propietarios de ROCmFPX (no estándar GGUF) que permiten ejecutar un MoE de 26 000 millones de parámetros en hardware AMD de consumo y en equipos Strix Halo de 128 GB, algo que con cuantizaciones estándar requeriría más memoria. No es una versión oficial de Thinking Machines: es un trabajo de terceros que redistribuye pesos derivados bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas "looped" (capas 6-17 repetidas 3 veces por token) |
| Parámetros totales | 26.065.943.137 |
| Parámetros activos | ~3.1B por pasada de capa (8 de 128 expertos activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 ROCmFPX (26.9 GB), Q6_K ROCmFPX (21.6 GB), Q4_0 ROCmFP4 + O8 (15.5 GB) |
| Idiomas soportados | no disponible (la model card menciona pruebas en inglés y ruso para la edición de uncensoring) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF con formatos propietarios ROCmFPX (requiere fork ROCmFPX de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini es un transformer de mezcla de expertos con 24 capas y 128 expertos por capa, de los cuales 8 se activan por token (aproximadamente 3.1B de parámetros activos por pasada). La peculiaridad estructural es el "looping": las capas 6 a 17 se ejecutan tres veces por token, de modo que un token atraviesa 48 capas efectivas aunque el modelo solo tenga 24 capas físicas. Esta variante publicada es solo texto: el codificador de visión y el drafter de predicción multi-token del modelo original no están incluidos.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí se documenta es la edición de uncensoring: AtomicChat aplicó una LoRA de rango 1 sobre la salida de atención y los expertos enrutados de las 24 capas más el embedding de tokens, eliminando en cada capa su dirección de rechazo. En esta publicación, el adaptador se fusiona a fuerza 1 con el checkpoint original en precisión completa, y ese modelo fusionado sirve de referencia para las mediciones de calidad. Las cuantizaciones ROCmFPX se construyeron con el fork de llama.cpp de HarshaVardhan3002, que añade los formatos de peso ROCmFPX y ROCmFP4, además del parser del formato de chat de Inkling (con `--jinja` el modo thinking se devuelve separado de la respuesta y se parsean las llamadas a herramientas).

## Capacidades

- Generación de texto conversacional en formato chat con soporte del parser de formato Inkling en el fork ROCmFPX.
- Modo "thinking": con `--jinja` el razonamiento se devuelve separado de la respuesta final.
- Tool calling / function calling: parseado de llamadas a herramientas en el fork ROCmFPX.
- Razonamiento multi-paso y uso como agente: el modelo base está diseñado para tareas de razonamiento; la model card no detalla capacidades específicas de agente más allá del tool calling.
- Capacidades multilingües: no documentadas; las pruebas de uncensoring se hicieron en inglés y ruso.
- Sin capacidades de visión: el codificador visual del modelo original no está incluido en esta variante.
- Sin audio ni otras modalidades.

## Casos de uso

- Despliegue en equipos Strix Halo de 128 GB: el archivo Q8_0 de 26.9 GB cabe holgadamente en la memoria unificada del Radeon 8060S, permitiendo ejecutar un MoE de 26B con calidad casi completa en una máquina de escritorio sin GPU discreta.
- Inferencia en GPUs AMD de 24-32 GB: el archivo Q4_0 (15.5 GB) y el Q6_K (21.6 GB) permiten ejecutar el modelo en tarjetas como la RX 7900 XTX (24 GB) mediante Vulkan o ROCm, con margen para contexto largo en el caso del Q4_0.
- Asistentes conversacionales sin restricciones de contenido: la edición de uncensoring elimina los rechazos del modelo original, lo que resulta útil en entornos de investigación sobre seguridad, red teaming y evaluación de modelos sin filtros.
- Investigación sobre cuantización: los formatos ROCmFPX (ROCmIQ2_XXS, ROCmIQ1_S) y ROCmFP4 son objeto de estudio activo; este repositorio sirve como banco de pruebas para medir perplejidad y velocidad en hardware AMD frente a cuantizaciones estándar.
- Pipelines de generación de texto con tool calling: el parser de herramientas del fork permite integrar el modelo en flujos de agentes que necesitan invocar funciones externas, con el razonamiento separado de la respuesta para su auditoría.
- Evaluación comparativa de hardware AMD: al publicar tres anchos de bits distintos, permite medir el compromiso entre calidad (perplejidad, KL) y velocidad en distintas GPUs AMD y en Strix Halo.
- Experimentación con modelos MoE "looped": la arquitectura con capas repetidas es poco común y este checkpoint permite estudiar su comportamiento en tareas de razonamiento y generación larga.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta cuantización. Sí se documentan métricas de calidad de cuantización y de la edición de uncensoring:

| Métrica | Valor |
|---|---|
| MMLU (modelo uncensored, según AtomicChat) | 79,15 % |
| MMLU (modelo original, según AtomicChat) | 80,65 % |
| Rechazos en prompts dañinos (inglés y ruso) | 0 % (original: 91-100 %) |
| Rechazos en prompts seguros de XSTest | 0 % (original: 4 %) |

La tabla de calidad de cuantización de la model card está incompleta en la información disponible: solo se muestra la fila del modelo fusionado de referencia (50.5 GB, perplejidad 6.775 en wikitext-2), sin los valores de KL y coincidencia de top token para los archivos publicados.

Como dato adicional, la model card incluye una medición de los nuevos formatos ROCmIQ en un modelo denso de 4B de prueba (no este modelo):

| Build 2-bit | Tamaño | Perplejidad | Prompt tok/s | Generación tok/s |
|---|---:|---:|---:|---:|
| stock IQ2_XXS | 1,33 GB | 96,7 | 1846 | 95,4 |
| ROCMIQ2_XXS | 1,35 GB | 49,6 | 1734 | 88,7 |

## Requisitos de hardware

- VRAM estimada: Q8_0 requiere ~27 GB, Q6_K ~22 GB, Q4_0 ~16 GB (tamaños de archivo; el uso real en memoria es algo superior por el contexto y buffers).
- GPUs recomendadas: Strix Halo (Radeon 8060S, 128 GB de memoria unificada) para el Q8_0; GPUs AMD de 24-32 GB (por ejemplo RX 7900 XTX de 24 GB) para Q6_K y Q4_0; GPUs de 32 GB para Q8_0.
- Cabe en GPU de consumo: sí, en GPUs AMD de 24 GB con el archivo Q4_0; en GPUs NVIDIA no se documenta compatibilidad, ya que los formatos ROCmFPX están pensados para Vulkan y ROCm.
- Opciones de despliegue: exclusivamente el fork ROCmFPX de llama.cpp (rama `inkling2-mini`), con backend Vulkan o ROCm. No es compatible con llama.cpp estándar, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles para este modelo concreto. La única referencia de velocidad es la del test de 4B con ROCmIQ2_XXS en Strix Halo con Vulkan (1734 tok/s de prompt, 88,7 tok/s de generación), que no es extrapolable a este MoE de 26B.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-ROCmFPX (esta ficha) | 26,1B | ~3,1B | no disponible | Apache 2.0 | GGUF ROCmFPX, solo fork ROCmFPX |
| thinkingmachines/Inkling-2-Mini (original) | 26,1B | ~3,1B | no disponible | no disponible en la información | Pesos originales; incluye visión y drafter MTP |
| AtomicChat/Inkling-2-Mini-Uncensored-GGUF | 26,1B | ~3,1B | no disponible | Apache 2.0 | GGUF estándar, compatible con llama.cpp |

No se dispone de datos de benchmarks comparativos entre estos tres modelos en la información proporcionada, más allá del MMLU del modelo uncensored (79,15 %) frente al original (80,65 %).

## Limitaciones y advertencias

- Modelo "uncensored": responde a peticiones que el original rechaza. El autor declara explícitamente que la responsabilidad de uso recae en el usuario; no es apto para despliegues públicos sin moderación adicional.
- La edición de uncensoring puede degradar ligeramente capacidades generales (MMLU cae ~1,5 puntos según AtomicChat).
- Requiere un fork no estándar de llama.cpp (ROCmFPX); no funciona con llama.cpp, Ollama, vLLM ni TGI estándar, lo que limita su integración en producción.
- Los formatos ROCmFPX y ROCmFP4 son propietarios y experimentales; la model card advierte que los modelos MoE aún están en verificación para los formatos ROCmIQ de bajo bit.
- Solo texto: sin visión ni predicción multi-token, a diferencia del modelo original.
- Longitud de contexto no documentada; no se puede garantizar el comportamiento en ventanas largas.
- Idiomas soportados no documentados; las pruebas de uncensoring se limitan a inglés y ruso.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluaciones publicadas de fidelidad factual en esta variante.
- Sesgos: no se documentan evaluaciones de sesgo para esta cuantización ni para el modelo base en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el carácter uncensored puede entrar en conflicto con políticas de contenido de plataformas y con normativa local.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Inkling-2-Mini-Uncensored-ROCmFPX
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Edición de uncensoring de AtomicChat: https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF
- Fork ROCmFPX (rama inkling2-mini): https://github.com/HarshaVardhan3002/ROCmFPX/tree/inkling2-mini
- Fork ROCmFPX (rama rocmfpx-sub2): https://github.com/HarshaVardhan3002/ROCmFPX/tree/rocmfpx-sub2
- Cuantización destacada del mismo autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
