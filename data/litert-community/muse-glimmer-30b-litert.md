# litert-community/Muse-Glimmer-30B-LiteRT

## Resumen

Muse-Glimmer-30B-LiteRT es una conversión del modelo multimodal Muse-Glimmer-30B de Meta al formato LiteRT-LM, orientada a inferencia en dispositivo local. La conversión la ha realizado la comunidad litert-community usando litert-torch 0.10.0, ai-edge-quantizer 0.10.0 y litert-lm-builder 0.19.0 para LiteRT-LM 0.19.0. El modelo resuelve el problema de ejecutar un modelo visión-lenguaje de 30.000 millones de parámetros en hardware de consumo sin necesidad de infraestructura de servidor, empaquetando los pesos en un único fichero `.litertlm` de 23,4 GB.

El modelo base es un decodificador de texto denso de 52 capas que alterna tres capas de ventana deslizante con una capa global, acompañado de un codificador visual de 50 capas. Antes de cada respuesta genera un mensaje de razonamiento cuya extensión se controla mediante la línea "Reasoning strength" del mensaje de sistema (low, medium, high o xhigh). La conversión fija la resolución de imagen en 448 × 448 (256 tokens de imagen) y una ventana de contexto de 2.048 tokens.

La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar un VLM de 30B en un Apple M4 Max a 18,33 tokens/s en decodificación con el codificador visual en GPU, con un footprint de 26 GiB. Es una referencia práctica para quien quiera desplegar modelos multimodales en local sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal: decodificador de texto de 52 capas (3 capas de ventana deslizante + 1 capa global, patrón repetido) y codificador visual de 50 capas |
| Parametros totales | 30B (según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (KV cache fijada en la conversión) |
| Tipos de cuantizacion | Pesos del decodificador en int4 por bloques de 128, capa de salida int8, tabla de embeddings en int8, codificador visual y adaptador en fp32, activaciones declaradas fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), 23.393.996.524 bytes |
| Resolucion de imagen | 448 × 448 fija (256 tokens de imagen), una imagen por conversación |
| Firmas de prefill | 32 / 128 / 1.024 tokens |
| Sampler por defecto | top-k 64, top-p 0.95, temperature 1.0 (heredado del `generation_config.json` del modelo base) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina un decodificador de texto denso de 52 capas con un patrón de atención híbrido: tres capas con ventana deslizante seguidas de una capa de atención global, patrón que se repite a lo largo de la red. Esta disposición reduce el coste de atención en secuencias largas manteniendo capacidad de modelado global. El codificador visual consta de 50 capas y produce 256 tokens por imagen a una resolución fija de 448 × 448. El modelo incorpora un modo de razonamiento explícito: antes de la respuesta final emite un mensaje de razonamiento cuya longitud se gradúa mediante el parámetro "Reasoning strength".

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La conversión a LiteRT-LM aplica cuantización de pesos del decodificador a int4 con bloques de 128 elementos y capa de salida en int8, mientras que el codificador visual y el adaptador se mantienen en fp32. El fichero incluye tokenizador, plantilla de chat y manifiesto de metadatos.

## Capacidades

- Generación de texto y razonamiento explícito previo a la respuesta, con cuatro niveles de intensidad configurables (low, medium, high, xhigh).
- Comprensión de imágenes y respuesta a preguntas visuales (pipeline `image-text-to-text`).
- Procesamiento de una imagen por conversación a resolución fija de 448 × 448.
- Conversaciones multi-turno dentro de la ventana de 2.048 tokens.
- Orientación a tareas agénticas en hardware local, según la descripción del modelo base.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de audio ni de vídeo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Preguntas sobre fotografías en local: una aplicación de escritorio puede cargar el fichero `.litertlm` y responder preguntas sobre una imagen redimensionada a 448 × 448, como demuestra la app `picture_questions` de litert-samples para macOS con GPU. Adecuado por su footprint de 26 GiB y su latencia de 2,57 s hasta el primer texto en M4 Max.
- Asistencia visual sin conexión: en entornos sin red (campo, industria, sanidad) el modelo puede describir o interpretar imágenes capturadas localmente, evitando el envío de datos a servicios externos.
- Prototipado de agentes multimodales en estación de trabajo: con 18,33 tokens/s de decodificación en GPU de Apple M4 Max, permite iterar sobre flujos de razonamiento visual con el modo "Reasoning strength" ajustable.
- Análisis de capturas o documentos escaneados: conversión de una página a 448 × 448 y consulta sobre su contenido textual o visual, útil para extracción rápida de información en pipelines locales.
- Evaluación comparativa de VLM en dispositivo: la app de referencia permite alternar entre este fichero y Qwen2.5-VL-72B-Instruct sobre la misma interfaz, lo que facilita estudios comparativos de calidad y latencia.
- Docencia y demostraciones de IA en local: un equipo con 32 GB de memoria o más puede ejecutar el modelo sin GPU dedicada de servidor, mostrando el ciclo completo de razonamiento y respuesta en tiempo real.
- Integración en aplicaciones macOS mediante la API C de LiteRT-LM 0.19.0: el modelo puede incrustarse en apps nativas que requieran inferencia multimodal con gestión de memoria controlada.

## Benchmarks y rendimiento

Rendimiento medido en Apple M4 Max (128 GB, macOS 27.0), litert-lm 0.19.0, API de Python, imagen de 448 × 448 y pregunta corta (292–298 tokens de prompt, 256 de ellos la imagen), decodificación greedy y "Reasoning strength: low.".

| Backend | Prefill (tok/s) | Decode (tok/s) | Time to first token (s) | Primer texto (s) | Segunda pregunta: primer texto (s) | Memoria pico |
|---|---:|---:|---:|---:|---:|---:|
| GPU, codificador visual en GPU (este fichero) | 148,0 | 18,33 | 2,03 | 2,57 | 0,41 | 26 GiB (footprint) |
| CPU, codificador visual en CPU (build anterior) | 14,9 / 15,6 | 7,20 / 7,48 | 19,7 / 19,3 | 21,7 / 21,1 | 6,8 | 1,1 GiB (footprint); 22 GiB residentes, casi todo ficheros mapeados |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: footprint de 26 GiB en GPU en el M4 Max medido; en CPU, 1,1 GiB de footprint con 22 GiB residentes (mayoritariamente ficheros mapeados). El fichero pesa 23,4 GB en disco.
- GPU recomendadas: Apple M4 Max con 128 GB (medido). La app de referencia `picture_questions` requiere un Mac con 32 GB de memoria o más. No se documentan requisitos para GPU NVIDIA.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU de consumo; la información solo cubre el path GPU vía WebGPU en macOS.
- Despliegue: LiteRT-LM 0.19.0 (`pip install litert-lm==0.19.0`), con backends GPU o CPU mediante `interfaces.Backend.GPU()` / `interfaces.Backend.CPU()`. También API C para apps nativas. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 2,03 s hasta el primer token y 2,57 s hasta el primer texto en GPU; 19,7 s y 21,7 s respectivamente en CPU. Segunda pregunta sobre la misma imagen: 0,41 s hasta el primer texto en GPU.
- Throughput: 18,33 tok/s de decodificación en GPU (rango 12,29–18,37) y 7,20–7,48 tok/s en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-LiteRT (este) | 30B | 2.048 tokens | `.litertlm` | Apache 2.0 | Cuantizado int4, visión 448 × 448, on-device |
| Muse-Glimmer-30B (base) | 30B | no disponible | safetensors (presumible) | Apache 2.0 | Modelo original de Meta, sin cuantizar |
| Qwen2.5-VL-72B-Instruct | 72B | no disponible | no disponible | no disponible | Usado como alternativa en la app `picture_questions` de litert-samples |

No se dispone de datos de benchmarks que permitan comparar calidad entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La ventana de contexto está fijada en 2.048 tokens en esta conversión; un mensaje de razonamiento largo debe caber en ese límite, lo que puede truncar respuestas con "Reasoning strength" alto.
- Solo se admite una imagen por conversación y a resolución fija de 448 × 448, con recorte por redimensionado bicúbico que no preserva la relación de aspecto.
- El modo "Reasoning strength: high" (valor por defecto si no se envía mensaje de sistema) no fue medido con este fichero.
- La fila de CPU corresponde a un build anterior de los mismos pesos, aproximadamente 2,5 veces más lento en decodificación que el build actual.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura idiomática.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de las herramientas de conversión.
- La información de rendimiento proviene de un único dispositivo (Apple M4 Max); no hay datos para otras plataformas.
- El modelo está orientado a hardware local; no se documenta soporte para servidores de inferencia estándar.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Muse-Glimmer-30B-LiteRT
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- App de ejemplo `picture_questions` (macOS): https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert_lm/picture_questions/macos
- Repositorio litert-samples: https://github.com/google-ai-edge/litert-samples
