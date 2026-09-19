# kaivoss/diffusiongemma-26B-A4B-it-ALWAYS-THINK

## Resumen

DiffusionGemma 26B A4B es un modelo generativo multimodal desarrollado por Google DeepMind, basado en la arquitectura Mixture-of-Experts (MoE) de Gemma 4 (26B A4B) pero que sustituye la decodificación autorregresiva token a token por difusión discreta de texto. En lugar de predecir un token cada vez, el modelo denoisa de forma iterativa bloques completos de 256 tokens (denominados "canvas") en paralelo, lo que se traduce en una velocidad de generación muy superior en escenarios de batch pequeño. La ficha de Hugging Face analizada corresponde al repositorio `kaivoss/diffusiongemma-26B-A4B-it-ALWAYS-THINK`, una variante publicada por el usuario kaivoss sobre el modelo original de Google.

El modelo combina un codificador autorregresivo que procesa y cachea el contexto del prompt con un decodificador que aplica atención bidireccional sobre el canvas de generación mediante cross-attention. Cuenta con 25,8 mil millones de parámetros totales según los pesos en safetensors (25,2B según la model card) y 3,8 mil millones de parámetros activos por token, con 8 expertos activos de 128 totales más uno compartido. Soporta entradas intercaladas de texto, imagen y vídeo, con salida de texto, y una ventana de contexto de hasta 256.000 tokens.

Su relevancia actual radica en que es una de las primeras apuestas abiertas de un laboratorio grande por los modelos de difusión de texto como alternativa práctica a la generación autorregresiva: reduce el cuello de botella secuencial y habilita velocidades superiores a 1.100 tokens por segundo en una H100 con FP8 y batch pequeño. El precio a pagar es un rendimiento inferior al de su equivalente autorregresivo Gemma 4 26B A4B en la mayoría de benchmarks de razonamiento, código y visión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer con MoE dispersa y difusión discreta de texto (bloques de 256 tokens, atención bidireccional sobre el canvas) |
| Parametros totales | 25.823.778.864 (≈25,82B) segun safetensors; la model card declara 25,2B |
| Parametros activos | 3,8B (8 expertos activos de 128 totales + 1 compartido) |
| Longitud de contexto | Hasta 256K tokens; sliding window de 1.024 tokens; canvas de generacion de 256 tokens |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors (repo de 51,7 GB, coherente con BF16). No se documentan GGUF ni cuantizaciones de 8/4 bits |
| Idiomas soportados | No disponible (la model card menciona OCR multilingue, pero no enumera idiomas) |
| Licencia | apache-2.0 segun los metadatos del repositorio; el campo license_link apunta a la licencia de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license), lo que supone una discrepancia |
| Formato de pesos | safetensors (libreria transformers, tag diffusion_gemma) |
| Capas | 30 |
| Tamano de vocabulario | 262K |
| Encoder de vision | ~550M parametros |
| Modalidades | Entrada: texto, imagen (aspect ratio y resolucion variables) y video. Salida: texto |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

DiffusionGemma emplea una arquitectura encoder-decoder específicamente optimizada para velocidad de inferencia. El codificador opera en modo prefill: procesa el prompt inicial y construye la caché KV. El decodificador aplica atención bidireccional sobre un bloque de tokens (canvas) y accede al contexto cacheado mediante cross-attention. Durante la inferencia se utiliza muestreo multi-canvas: el modelo denoisa iterativamente un canvas completo con un sampler de difusión y, una vez denoisado, este se procesa con el codificador y se añade a la caché KV antes de generar el siguiente canvas. Este esquema block-autoregresivo es el que permite generar entre 15 y 20 tokens por forward pass y superar los 1.100 tokens por segundo en configuraciones de batch pequeño sobre H100 con FP8.

La capa MoE es dispersa, con 8 expertos activos de 128 totales más uno compartido, lo que reduce la huella de memoria respecto a un modelo denso de tamaño equivalente y facilita la ejecución local. La atención usa una sliding window de 1.024 tokens, y el encoder de visión añade aproximadamente 550M de parámetros para el procesamiento de imagen. El modelo incorpora modo de razonamiento (thinking) configurable y soporte nativo del rol `system` en el prompt.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se documenta el proceso de destilación o conversión que da lugar a la variante "ALWAYS-THINK" publicada por kaivoss.

## Capacidades

- Generación de texto multimodal: acepta entradas intercaladas de texto, imagen y vídeo, y produce salida de texto.
- Modo thinking: razonamiento paso a paso configurable antes de responder; la variante publicada se etiqueta como "ALWAYS-THINK", lo que sugiere thinking activado de forma permanente.
- Comprensión de imagen: detección de objetos, parsing de documentos y PDF, comprensión de pantallas e interfaces (UI), interpretación de gráficos, OCR (incluido multilingüe), reconocimiento de escritura manual y pointing.
- Código: 69,1% en LiveCodeBench v6 y ELO 1429 en Codeforces.
- Matemáticas: 69,1% en AIME 2026 sin herramientas.
- Contexto largo: ventana de hasta 256K tokens, con rendimiento medido en MRCR v2 8 needle 128k del 32,0%.
- Generación de alta velocidad con cómputo adaptativo: las tareas estructuradas o los prompts simples requieren menos pasos de denoising, de modo que la velocidad en tokens por segundo varía según la complejidad de la tarea.
- Soporte nativo de system prompt, lo que permite conversaciones más estructuradas y controlables.
- Tool calling / function calling: no documentado explícitamente en la información disponible, aunque se reporta un 56,2% en Tau2 (media de 3), benchmark orientado a agentes con herramientas.
- Capacidades multilingües: MMMLU del 81,5% y OCR multilingüe mencionado en la model card, pero sin listado de idiomas soportados.
- Capacidades de audio: no disponibles.

## Casos de uso

- Atención al cliente automatizada de baja latencia: la generación por difusión con canvas de 256 tokens y más de 1.100 tokens por segundo en H100 FP8 permite sostener conversaciones multi-turno con tiempos de respuesta muy reducidos, y los 256K tokens de contexto admiten historiales largos y documentación de producto adjunta.
- Procesamiento masivo de documentos y PDF: el modelo combina OCR multilingüe, parsing de documentos y contexto largo, de modo que puede extraer datos estructurados de contratos, facturas o informes extensos en una sola pasada, aunque su OmniDocBench 1.5 (0,319 de distancia de edición media) es peor que el de Gemma 4 autorregresivo (0,149).
- Automatización de interfaces y agentes de UI: la comprensión de pantallas y el pointing permiten construir agentes que interpretan capturas de aplicaciones y generan acciones sobre elementos concretos de la interfaz.
- Asistente de programación en pipelines de CI/CD: con 69,1% en LiveCodeBench v6 y ELO 1429 en Codeforces puede generar y revisar código, y su velocidad de decodificación lo hace adecuado para tareas de completado en tiempo real dentro del editor.
- Análisis de gráficos y matemáticas visuales: con un 70,5% en MATH-Vision puede resolver problemas que combinan figuras, diagramas o gráficos con razonamiento matemático, útil en entornos educativos y de análisis financiero.
- Digitalización de archivos históricos y manuscritos: el reconocimiento de escritura manual y el OCR multilingüe permiten convertir documentos escaneados en texto estructurado sin pipeline externo.
- Despliegue en hardware de gama alta para un solo usuario: el diseño MoE con 3,8B parámetros activos y la optimización para batch pequeño lo hacen apto para asistentes personales o de equipo con latencia baja sobre una única GPU profesional.
- Investigación sobre modelos de difusión de texto: sirve como referencia abierta para estudiar decodificación por difusión discreta, muestreo multi-canvas y el compromiso entre velocidad y calidad frente a modelos autorregresivos equivalentes.

## Benchmarks y rendimiento

Resultados publicados en la model card para modelos instruction-tuned, con el sampler recomendado (Entropy Bound):

| Benchmark | DiffusionGemma 26B A4B | Gemma 4 26B A4B |
|---|---|---|
| MMLU Pro | 77,6% | 82,6% |
| AIME 2026 sin herramientas | 69,1% | 88,3% |
| LiveCodeBench v6 | 69,1% | 77,1% |
| Codeforces ELO | 1429 | 1718 |
| GPQA Diamond | 73,2% | 82,3% |
| Tau2 (media de 3) | 56,2% | 68,2% |
| HLE sin herramientas | 11,0% | 8,7% |
| HLE con busqueda | 11,9% | 17,2% |
| BigBench Extra Hard | 47,6% | 64,8% |
| MMMLU | 81,5% | 86,3% |
| MMMU Pro | 54,3% | 73,8% |
| OmniDocBench 1.5 (distancia de edicion media, menor es mejor) | 0,319 | 0,149 |
| MATH-Vision | 70,5% | 82,4% |
| MedXPertQA MM | 49,0% | 58,1% |
| MRCR v2 8 needle 128k (media) | 32,0% | 44,1% |

Datos de rendimiento en inferencia reportados: 15-20 tokens por forward pass, más de 1.100 tokens por segundo en H100 con FP8 y batch pequeño, y velocidad adaptativa según el número de pasos de denoising necesarios.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 51,7 GB en BF16 (tamano real del repositorio), en torno a 26 GB en FP8 y alrededor de 13-15 GB en cuantización de 4 bits (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: H100 o A100 de 80 GB para BF16; H100 (FP8), L40S de 48 GB o A100 de 40 GB para FP8. El caso de referencia de velocidad publicado por Google es H100 con FP8.
- GPU de consumo: en BF16 no cabe en ninguna GPU de consumo actual. Con cuantización de 4 bits podría caber en una RTX 4090 de 24 GB, pero hay que sumar la caché KV, que con ventanas de hasta 256K tokens y 30 capas no es despreciable. No se documenta oficialmente ningún despliegue en GPU de consumo.
- Opciones de despliegue: la librería declarada es transformers (tag `diffusion_gemma`, `endpoints_compatible`). No se documenta soporte de vLLM, TGI, llama.cpp u Ollama, y la decodificación por difusión requiere samplers específicos, por lo que la disponibilidad en esos motores es no disponible.
- Latencia y throughput: más de 1.100 tokens por segundo en H100 con FP8 y batch pequeño; 15-20 tokens por forward pass; el número de pasos de denoising se reduce en prompts simples y tareas estructuradas, aumentando la velocidad efectiva.
- Optimización declarada: el modelo está diseñado específicamente para inferencia con batch pequeño en un único acelerador capaz, no para despliegues de alto throughput con batch grande.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | MMLU Pro | AIME 2026 | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| DiffusionGemma 26B A4B | 25,2B / 3,8B | 256K | 77,6% | 69,1% | 73,2% | Apache 2.0 en metadatos (license_link a licencia Gemma 4) | Pesos abiertos en Hugging Face |
| Gemma 4 26B A4B | 25,2B / 3,8B (segun la model card comparativa) | 256K (segun la model card comparativa) | 82,6% | 88,3% | 82,3% | Licencia Gemma 4 | Pesos abiertos en Hugging Face |
| Otros modelos de difusion de texto o MoE de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada solo permite una comparacion directa y con datos entre DiffusionGemma 26B A4B y su equivalente autorregresivo Gemma 4 26B A4B. No se dispone de datos de benchmarks de otras alternativas comparables.

## Limitaciones y advertencias

- El repositorio analizado pertenece al usuario kaivoss, no a Google DeepMind. El modelo original es `google/diffusiongemma-26B-A4B-it`; la variante "ALWAYS-THINK" no está documentada por el autor original y conviene verificar su procedencia e integridad antes de usarla en producción.
- Discrepancia de licencia: los metadatos del repositorio declaran apache-2.0, pero el enlace de licencia de la model card apunta a los términos de Gemma 4. Es imprescindible aclarar qué licencia aplica antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por parte de la comunidad.
- Rendimiento inferior al modelo autorregresivo equivalente en prácticamente todos los benchmarks: MMLU Pro (77,6% frente a 82,6%), AIME 2026 (69,1% frente a 88,3%), LiveCodeBench v6 (69,1% frente a 77,1%), GPQA Diamond (73,2% frente a 82,3%), MMMU Pro (54,3% frente a 73,8%). La única excepción es HLE sin herramientas (11,0% frente a 8,7%).
- Contexto largo degradado: 32,0% en MRCR v2 8 needle 128k frente al 44,1% del modelo autorregresivo, lo que indica pérdida notable de recuperación de información en contextos extensos pese a los 256K tokens declarados.
- Visión limitada: 54,3% en MMMU Pro y un error de edición de 0,319 en OmniDocBench 1.5, más del doble que el 0,149 del equivalente autorregresivo, lo que afecta directamente a tareas de digitalización de documentos.
- No se documenta el dataset de entrenamiento, el número de tokens, ni las fases de alineamiento (RLHF, DPO). Esto dificulta evaluar sesgos y comportamientos indeseados.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad.
- Idiomas soportados no disponibles: aunque se menciona OCR multilingüe y un 81,5% en MMMLU, no hay listado de idiomas ni evaluación por lengua, por lo que el comportamiento en castellano no está garantizado.
- La model card está truncada en la sección de comprensión de imagen, por lo que parte de las capacidades declaradas puede no estar reflejada aquí.
- No hay datos publicados de cuantizaciones (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama baja.
- La arquitectura de difusión requiere samplers específicos; no se documenta compatibilidad con los motores de inferencia más habituales (vLLM, TGI, llama.cpp, Ollama), lo que puede complicar el despliegue en producción.
- Los resultados de benchmarks se obtuvieron con el sampler Entropy Bound recomendado; usar otro sampler puede degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face (repositorio analizado): https://huggingface.co/kaivoss/diffusiongemma-26B-A4B-it-ALWAYS-THINK
- Modelo original de Google: https://huggingface.co/google/diffusiongemma-26B-A4B-it
- Repositorio GitHub de Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/diffusion-gemma-faster-text-generation/
- Documentación oficial: https://ai.google.dev/gemma/docs/diffusiongemma
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
- Los resultados de la búsqueda web no contienen enlaces relevantes para este modelo.
