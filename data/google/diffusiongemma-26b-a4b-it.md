# google/diffusiongemma-26B-A4B-it

## Resumen

DiffusionGemma 26B-A4B-it es un modelo generativo desarrollado por Google DeepMind que sustituye la generacion autorregresiva token a token por difusion discreta sobre bloques de tokens. Se construye sobre la arquitectura del Mixture-of-Experts Gemma 4 de 26B parametros totales (3,8B activos), y anade un paradigma de decodificacion por "lienzos" (canvas) de 256 tokens que se desruizan en paralelo mediante un sampler de difusion. El resultado es un modelo multimodal (texto, imagen y video como entrada; texto como salida) optimizado para inferencia de baja latencia y batch pequeno.

El modelo resuelve el cuello de botella secuencial de los transformers causales clasicos: en lugar de un forward pass por token, emplea un encoder autorregresivo que cachea el contexto y un decoder con atencion bidireccional sobre el canvas, generando entre 15 y 20 tokens por forward pass y superando los 1100 tokens por segundo en H100 con FP8 y batch bajo. Mantiene ademas modo de razonamiento (thinking), soporte nativo de system prompt y una ventana de contexto de hasta 256K tokens.

Es relevante ahora porque demuestra que la difusion discreta de texto puede competir en velocidad de decodificacion con los modelos causales manteniendo pesos abiertos (Apache 2.0) y un footprint de memoria reducido gracias a la esparsidad MoE (8 expertos activos de 128). El repositorio acumula mas de 634.000 descargas y 1.334 likes, lo que indica adopcion temprana significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder con difusion discreta de texto y Mixture-of-Experts (MoE) sobre base Gemma 4 |
| Parametros totales | 25.823.778.864 (~25,2B) |
| Parametros activos | 3,8B (8 expertos activos de 128 totales + 1 compartido) |
| Longitud de contexto | Hasta 256K tokens (sliding window de 1024 tokens) |
| Tipos de cuantizacion | FP8 mencionado en benchmarks de velocidad; no se detallan otras variantes en la informacion disponible |
| Idiomas soportados | No disponible (la model card no enumera idiomas; se menciona OCR multilingue) |
| Licencia | Apache 2.0 (con license_link a Gemma 4 license) |
| Formato de pesos | safetensors (libreria transformers) |
| Longitud de canvas | 256 tokens |
| Numero de capas | 30 |
| Tamano de vocabulario | 262K |
| Parametros del encoder de vision | ~550M |
| Modalidades de entrada | Texto, imagen (aspect ratio y resolucion variables), video |
| Modalidad de salida | Texto |
| Tamano del repo | 51,7 GB |

## Arquitectura y entrenamiento

DiffusionGemma emplea una arquitectura encoder-decoder. El encoder funciona en modo prefill: procesa el prompt inicial y construye la KV cache de forma autorregresiva. El decoder aplica atencion bidireccional sobre un bloque de tokens (el canvas de 256 posiciones) y accede al contexto cacheado mediante cross-attention. La generacion es block-autoregressive: se desruiza un canvas completo con un sampler de difusion, se procesa por el encoder, se anade a la KV cache y se pasa al siguiente canvas. La esparsidad MoE (8 de 128 expertos activos mas uno compartido) reduce el footprint de memoria y permite ejecucion local en un unico acelerador.

La innovacion central es la difusion discreta de texto: en lugar de predecir el siguiente token, el modelo desruiza iterativamente un bloque de tokens en paralelo, con un numero de pasos de denoising adaptativo segun la complejidad de la tarea (prompts simples y codigo estructurado requieren menos pasos). El modelo incorpora modo thinking configurable y soporte nativo de system prompt. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO. La model card menciona un sampler recomendado denominado Entropy Bound (EB) para las evaluaciones.

## Capacidades

- Generacion de texto de alta velocidad: 15-20 tokens por forward pass y mas de 1100 tokens por segundo en H100 con FP8 y batch bajo.
- Computo adaptativo en inferencia: menos pasos de denoising en tareas simples o estructuradas, con velocidad dinamica segun complejidad.
- Modo thinking (razonamiento paso a paso) configurable.
- Comprension de imagen: deteccion de objetos, parsing de documentos y PDF, comprension de pantallas e interfaces, interpretacion de graficos, OCR multilingue, reconocimiento de escritura manual y pointing.
- Procesamiento de video como entrada.
- Entrada multimodal intercalada (texto, imagen y video combinados).
- Contexto largo de hasta 256K tokens.
- Soporte nativo de system prompt para conversaciones estructuradas y controlables.
- Capacidades multilingues: no detalladas en la informacion disponible, salvo OCR multilingue.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de texto interactiva de baja latencia: el modelo esta optimizado para batch pequeno y un unico acelerador, generando mas de 1100 tokens por segundo en H100, lo que lo hace adecuado para asistentes conversacionales en tiempo real donde la latencia por usuario es critica.
- Parsing de documentos y PDF: la capacidad de comprension de documentos, OCR multilingue y reconocimiento de escritura manual permite extraer informacion estructurada de facturas, formularios y contratos escaneados.
- Comprension de pantallas e interfaces: la capacidad de entender UI y pantallas facilita la automatizacion de pruebas de interfaz, agentes de navegacion y asistencia de accesibilidad.
- Analisis de graficos y tablas: la interpretacion de graficos permite construir herramientas de analitica que responden preguntas sobre visualizaciones de datos sin preprocesamiento manual.
- Procesamiento de video para generacion de resumentes: al aceptar video como entrada, puede emplearse en pipelines de analisis de contenido audiovisual que generan descripciones o transcripciones contextualizadas.
- Razonamiento con contexto largo: con 256K tokens de ventana, es adecuado para analisis de codigo de repositorios completos, revision de documentacion extensa o sintesis de conversaciones largas.
- Despliegue local en hardware unico: la esparsidad MoE (3,8B parametros activos) y el diseno para batch pequeno lo hacen viable en una sola GPU de gama alta para prototipado e inferencia local.

## Benchmarks y rendimiento

Resultados de la model card para modelos instruction-tuned con sampler Entropy Bound (EB), comparados con Gemma 4 26B A4B:

| Benchmark | DiffusionGemma 26B A4B | Gemma 4 26B A4B |
|---|---|---|
| MMLU Pro | 77,6% | 82,6% |
| AIME 2026 no tools | 69,1% | 88,3% |
| LiveCodeBench v6 | 69,1% | 77,1% |
| Codeforces ELO | 1429 | 1718 |
| GPQA Diamond | 73,2% | 82,3% |
| Tau2 (media de 3) | 56,2% | 68,2% |
| HLE no tools | 11,0% | 8,7% |
| HLE with search | 11,9% | 17,2% |
| BigBench Extra Hard | 47,6% | 64,8% |
| MMMLU | 81,5% | 86,3% |
| MMMU Pro (vision) | 54,3% | 73,8% |
| OmniDocBench 1.5 (distancia de edicion media, menor es mejor) | 0,319 | 0,149 |
| MATH-Vision | 70,5% | 82,4% |
| MedXPertQA MM | 49,0% | 58,1% |
| MRCR v2 8 needle 128k (media) | 32,0% | 44,1% |

En velocidad, la model card reporta 15-20 tokens por forward pass y mas de 1100 tokens por segundo en H100 con FP8 y batch bajo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 25,8B parametros totales en safetensors, los pesos en FP16 requieren aproximadamente 51,7 GB; en FP8 aproximadamente 26 GB. La esparsidad MoE reduce el computo por token (3,8B activos) pero no el footprint de memoria de los pesos.
- GPU recomendadas: H100 es la referencia de velocidad reportada (FP8, mas de 1100 tokens por segundo). Se menciona despliegue en Sagemaker como endpoint compatible.
- Cabe en consumer GPU: no confirmado en la informacion disponible. El tamano de pesos en FP8 (~26 GB) queda fuera de GPUs consumer de 24 GB (RTX 4090) sin cuantizacion adicional; en FP16 (~52 GB) requiere multiples GPUs o aceleradores de mayor memoria.
- Opciones de despliegue: transformers (libreria oficial), endpoints compatibles y deploy en Sagemaker segun los tags del repositorio. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: mas de 1100 tokens por segundo en H100 con FP8 y batch bajo; 15-20 tokens por forward pass.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DiffusionGemma 26B-A4B-it | 25,2B / 3,8B | 256K | Apache 2.0 | Difusion discreta, encoder-decoder, multimodal (texto, imagen, video) |
| Gemma 4 26B A4B | 26B / no disponible | no disponible | no disponible | Base autorregresiva del mismo tamano; supera a DiffusionGemma en la mayoria de benchmarks de la model card |
| Otros modelos de difusion de texto | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparativa directa disponible es con Gemma 4 26B A4B, que obtiene mejores resultados en MMLU Pro (82,6% frente a 77,6%), AIME 2026 (88,3% frente a 69,1%), GPQA Diamond (82,3% frente a 73,2%) y MMMU Pro (73,8% frente a 54,3%), mientras que DiffusionGemma supera a Gemma 4 en HLE no tools (11,0% frente a 8,7%). La ventaja de DiffusionGemma es la velocidad de decodificacion, no la precision.

## Limitaciones y advertencias

- Rendimiento inferior a Gemma 4 26B A4B en la mayoria de benchmarks de razonamiento, codigo, matematicas y vision, segun los datos de la propia model card.
- Contexto largo debil: MRCR v2 8 needle 128k cae a 32,0% frente al 44,1% de Gemma 4, lo que sugiere degradacion notable en recuperacion de informacion en ventanas largas.
- Parsing de documentos con mayor tasa de error: OmniDocBench 1.5 reporta 0,319 de distancia de edicion media frente a 0,149 de Gemma 4 (menor es mejor).
- Vision limitada: MMMU Pro 54,3% y MATH-Vision 70,5% frente a 73,8% y 82,4% de Gemma 4.
- Sesgos conocidos: no detallados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; HLE no tools de 11,0% indica margen de error significativo en tareas de conocimiento experto.
- Idiomas soportados: no enumerados en la model card; solo se confirma OCR multilingue.
- Restricciones de licencia: Apache 2.0 con enlace a la licencia de Gemma 4; conviene revisar los terminos adicionales enlazados antes de uso comercial.
- El sampler recomendado (Entropy Bound) es necesario para reproducir los resultados de los benchmarks; otros samplers pueden degradar la calidad.
- Optimizado para batch pequeno; el throughput en batch grande no esta documentado y podria no escalar como un modelo causal.

## Enlaces

- Hugging Face: https://huggingface.co/google/diffusiongemma-26B-A4B-it
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/diffusion-gemma-faster-text-generation/
- Documentacion: https://ai.google.dev/gemma/docs/diffusiongemma
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma: https://deepmind.google/models/gemma/
