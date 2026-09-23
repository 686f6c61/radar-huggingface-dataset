# jfan/gemma-4-e4b-web-mtp-vision-litert-lm

## Resumen

Este repositorio contiene un paquete LiteRT-LM del modelo `gemma-4-E4B-it` optimizado para ejecución íntegra en navegador mediante WebGPU, publicado por el usuario `jfan`. El bundle fusiona en un único contenedor de 3,25 GB (3.246.253.760 bytes) el decodificador de texto, un encoder de visión SigLIP en fp16 y un drafter de predicción multi-token (MTP) neuronal entrenado de 45,13 MB que actúa como modelo de decodificación especulativa. La arquitectura interna es un transformer de 42 capas con dimensión oculta d = 2560, dimensión intermedia 10240 y atención de consultas agrupada (GQA) con 2 cabezas KV y 16 cabezas de consulta.

El objetivo del proyecto es habilitar inferencia multimodal (texto e imagen) 100 % en el cliente, sin servidor, apoyándose en atención con caché KV compartida y cero copias en VRAM, además de mecanismos de ventana deslizante local y atención global completa en capas seleccionadas. La pieza diferencial es el drafter MTP auténtico, que se engancha sobre las capas 22 y 23 de la caché KV del modelo principal sin asignación adicional de memoria y promete una equivalencia token a token exacta con la decodificación greedy.

Es relevante ahora porque demuestra una vía práctica de despliegue de modelos multimodales de ~3 GB en navegador con aceleración por GPU, con mejoras de velocidad medidas de entre 1,25x y 1,40x gracias a la decodificación especulativa. El repositorio tiene 0 descargas y 0 likes, y su runtime asociado (`@litert-lm/core@0.17.8-dev`) está en fase de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 42 capas con Grouped Query Attention (GQA): 2 cabezas KV, 16 cabezas de consulta; dimension oculta d = 2560; dimension intermedia 10240; ventana local deslizante de 1024 tokens en la capa 22 y atencion global completa en la capa 23; encoder de vision SigLIP y drafter MTP de 4 capas |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (se documenta ventana local de 1024 tokens en la capa 22 y atencion global completa en la capa 23, pero no se especifica la ventana total) |
| Tipos de cuantizacion | Decodificador de texto cuantizado (cabecera de proyeccion LM en INT4 sobre vocabulario de 262.144 tokens, con desquantizacion al vuelo); encoder de vision en fp16; no se detalla el esquema del resto de pesos |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | LiteRT-LM (`.litertlm`), un contenedor que agrega metadatos, tokenizer SentencePiece, grafo TFLite del decodificador, encoder de vision, adaptador, token de fin de vision y drafter MTP |

## Arquitectura y entrenamiento

El contenedor `gemma-4-E4B-it-web-mtp-vision.litertlm` se descompone en siete secciones: metadatos `LlmMetadata` (12,2 KB) con configuración del tokenizer, marcadores multimodales (`<|image>`, `<image|>`, parches de 16x16 y un máximo de 2520 parches), canal de pensamiento y plantillas de chat tipo jinja; tokenizer `SP_Tokenizer` SentencePiece (4,69 MB); decodificador de texto `tf_lite_artisan_text_decoder` (2,96 GB); encoder de visión `tf_lite_vision_encoder` (224,1 MB en fp16, SigLIP, delegado a WebGPU con desquantizacion al vuelo); adaptador de visión `tf_lite_vision_adapter` (7,89 MB en CPU) que proyecta los tokens de imagen al espacio oculto d = 2560; token de frontera `tf_lite_end_of_vision` (10,9 KB); y el drafter `tf_lite_mtp_drafter` (45,13 MB).

La innovación principal es el drafter MTP, que combina una sección de grafo de 3,84 MB y pesos externalizados de 41,29 MB, con 4 capas transformer que realizan atención cruzada sobre las capas 22 y 23 de la caché KV compartida del modelo principal directamente en VRAM, sin asignación de memoria extra. Se ejecuta sobre la ruta nativa `eevee` (LiteRT CPU / WebGPU) y emplea una cabecera de proyección LM INT4 de vocabulario completo (262.144 entradas). La decodificación especulativa usa γ = 2 pasos de borrador como equilibrio óptimo entre latencia y throughput, y la model card afirma una equivalencia exacta, token a token, con la decodificación greedy del modelo base. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`) con plantillas de chat tipo jinja.
- Razonamiento con canal de pensamiento (*thought channel*) integrado en los metadatos del tokenizer.
- Comprensión de imagen multimodal: encoder SigLIP con parches de 16x16 y hasta 2520 parches por imagen, subida directa de texturas a WebGPU (~560 tokens de visión).
- Decodificación especulativa con drafter MTP entrenado (γ = 2), activable mediante `enableSpeculativeDecoding`.
- Ejecución íntegra en el cliente sobre WebGPU, sin llamadas a servidor, con caché KV compartida y cero copias en VRAM.
- Capacidades multilingües: no disponible (los idiomas no están declarados en la información proporcionada).
- Soporte de *tool calling* o *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el canal de pensamiento y las plantillas de chat son compatibles con flujos por turnos.
- Otras capacidades especiales (audio, vídeo): no disponible.

## Casos de uso

- Asistentes web sin backend: el modelo puede integrarse en una aplicación de navegador con `@litert-lm/core` y ejecutar conversaciones multimodales sin enviar datos a un servidor, lo que resulta adecuado para requisitos de privacidad y para evitar costes de infraestructura.
- Análisis de imágenes en el cliente: gracias al encoder SigLIP y a los hasta 2520 parches por imagen, permite describir, resumir o extraer información de capturas, fotografías o documentos escaneados directamente desde el navegador.
- Asistencia a la programación en el propio navegador: el modelo base está orientado a instrucciones y la model card reporta velocidades específicas para tareas de *coding* (41,2–43,5 tok/s con MTP), lo que lo hace viable para autocompletado y explicación de fragmentos en editores web.
- Resumen de contenido largo por turnos: con la ventana local de 1024 tokens y atención global en determinadas capas, puede resumir conversaciones o documentos por segmentos manteniendo coherencia entre turnos.
- Demostraciones y pruebas de concepto de decodificación especulativa: al exponer la configuración γ y telemetría de prefill/decode, sirve como banco de pruebas para comparar el impacto del MTP sobre el mismo modelo.
- Aplicaciones educativas interactivas: la combinación de chat con canal de pensamiento y entrada de imagen permite construir tutores que razonen sobre diagramas o ejercicios enviados por el usuario, sin coste de servidor.
- Interacción por voz o baja latencia (si se combina con ASR del lado cliente): con un TTFT de 0,16–0,19 s, el modelo encaja en interfaces conversacionales que exigen respuestas casi inmediatas.
- Procesamiento local en entornos con conectividad limitada: al no requerir backend, puede desplegarse como aplicación web instalable que funcione con recursos locales tras la descarga inicial de 3,25 GB.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros). Sí incluye métricas de rendimiento de inferencia medidas sobre un runner físico con GPU NVIDIA y WebGPU (`chrome-dev-linux-hardware-gpu-webgpu`):

| Metrica | Decodificacion estandar (1 token) | Decodificacion MTP (γ = 2) | Mejora |
|---|---|---|---|
| Throughput de decodificacion | 28,5 – 33,2 tok/s | 36,8 – 44,5 tok/s | 1,25x – 1,35x |
| Velocidad en resumen / codigo | 31,0 tok/s | 41,2 – 43,5 tok/s | 1,33x – 1,40x |
| Pasos de borrador | — | γ = 2 | Equilibrio optimo latencia/throughput |
| Prefill multimodal de vision | 2.400 – 3.100 tok/s | 2.400 – 3.100 tok/s | Subida directa de texturas WebGPU (~560 tokens de vision) |
| Tiempo hasta el primer token (TTFT) | 0,16 – 0,19 s | 0,16 – 0,19 s | Interaccion multimodal con baja latencia |
| Equivalencia de salida | Linea base | Coincidencia exacta | Equivalencia greedy token a token al 100 % |

## Requisitos de hardware

- VRAM estimada: el contenedor ocupa 3,25 GB; el decodificador de texto 2,96 GB, el encoder de visión 224,1 MB en fp16 y el drafter MTP 45,13 MB. Hay que sumar la caché KV compartida y los buffers del runtime WebGPU. Estimación orientativa: al menos 4 GB de memoria de GPU disponibles. La model card no publica requisitos mínimos oficiales.
- GPU recomendadas: la model card referencia un runner físico «NVIDIA GPU WebGPU» sin especificar modelo concreto; el requisito real es que la GPU y el navegador soporten WebGPU.
- GPU de consumo: la estimación anterior sugiere que cabría en GPUs de consumo con WebGPU y al menos ~4 GB de memoria de GPU disponibles, aunque este dato no está confirmado por el autor.
- Opciones de despliegue: runtime LiteRT-LM para navegador mediante el paquete npm `@litert-lm/core@0.17.8-dev` desde `jfan/litert-lm-web-runtime`, con backend `Backend.GPU_ARTISAN` y WASM alojado. No se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: TTFT de 0,16–0,19 s; decodificación de 28,5–33,2 tok/s sin MTP y 36,8–44,5 tok/s con MTP; prefill de visión de 2.400–3.100 tok/s. Datos medidos en un único hardware y navegador, por lo que pueden no ser representativos de otras configuraciones.

## Comparativa con modelos similares

| Especificacion | Gemma 4 E2B (`jfan/gemma-4-e2b-web-mtp-vision-litert-lm`) | Gemma 4 E4B (este repositorio) |
|---|---|---|
| Tamano del modelo | 2,28 GB | 3,25 GB |
| Capas | 35 | 42 |
| Dimension del modelo (d) | 1536 | 2560 |
| Tipo de atencion | Multi-Query (1 cabeza KV) | Grouped-Query (2 cabezas KV) |
| Cache KV compartida | Capas 13 y 14 | Capas 22 y 23 |
| Tamano del drafter MTP | 44,33 MB | 45,13 MB |
| Runtime web | `jfan/litert-lm-web-runtime` | `jfan/litert-lm-web-runtime` |

Comparativa con alternativas fuera de esta familia (Llama, Qwen, Mistral u otros modelos multimodales ejecutables en navegador): no disponible en la información proporcionada, ya que no se ofrecen datos de rendimiento, contexto ni licencia de terceros.

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes y fecha de creación muy reciente: existe poca o nula validación por parte de la comunidad.
- El runtime asociado está en versión de desarrollo (`@litert-lm/core@0.17.8-dev`), lo que implica posible inestabilidad de API y comportamiento no consolidado.
- La equivalencia exacta con la decodificación greedy solo se garantiza con muestreo greedy (temperature 0,0); con muestreo estocástico la aceptación del borrador y la equivalencia pueden degradarse.
- No se han publicado resultados de benchmarks académicos, por lo que no es posible comparar calidad de razonamiento, matemáticas o código con otros modelos.
- Idiomas soportados no declarados: no hay garantía de cobertura multilingüe ni de calidad fuera del inglés.
- Requiere un navegador con WebGPU funcional y una GPU compatible; el rendimiento reportado procede de un único runner con GPU NVIDIA, por lo que puede variar en hardware de otros fabricantes.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas de error ni evaluaciones de fidelidad.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia Gemma: sujeta a los términos de uso de Google, que imponen restricciones de uso (incluidas limitaciones de uso comercial y cláusulas de uso prohibido); conviene revisar el texto completo antes de un despliegue en producción.
- La ventana de contexto total no está especificada, solo la ventana local de 1024 tokens de la capa 22 y la atención global de la capa 23, lo que dificulta planificar casos de uso con contextos extensos.
- El tamaño de descarga inicial (3,25 GB) condiciona la experiencia de primera carga en aplicaciones web.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jfan/gemma-4-e4b-web-mtp-vision-litert-lm
- Runtime web LiteRT-LM: https://huggingface.co/jfan/litert-lm-web-runtime
- Variante Gemma 4 E2B: https://huggingface.co/jfan/gemma-4-e2b-web-mtp-vision-litert-lm
- Paper, blog o repositorio adicionales: no disponible (los resultados de la búsqueda web no contienen enlaces relevantes al modelo; solo devuelven páginas de Instagram sin relación).
