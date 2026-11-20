# infosave/Apex-35B-V1.0-cmf

## Resumen

Apex-35B-V1.0-cmf es un paquete de cuantización del modelo Apexintelligence-AI/Apex-35B-V1.0, un modelo de mezcla de expertos (MoE) de 35.500 millones de parámetros con unos 3.000 millones activos por token, afinado a partir de Qwen3.6-35B-A3B para tareas de razonamiento, código e investigación agéntica. Lo publica el usuario infosave en formato CMF, un contenedor propio que empaqueta pesos cuantizados y la capa MTP en un único fichero.

La relevancia del paquete es doble: por un lado, ofrece el modelo en cuantizaciones de 4 y 8 bits (19,81 GB y 35,84 GB) que caben en GPUs de consumo y de gama profesional; por otro, se ejecuta con `cortiq`, un motor de inferencia escrito en Rust sin Python ni frameworks de ML, con backends Vulkan, DX12, Metal y CPU. Esto permite desplegar un MoE de 35B en hardware heterogéneo sin depender del ecosistema CUDA/PyTorch.

El modelo conserva la ventana de contexto de 262.144 tokens del checkpoint original, el modo de razonamiento dinámico (el modelo decide en cada turno si piensa y durante cuánto tiempo) y el soporte de tool calling. Los idiomas declarados son inglés, ruso y chino. La torre de visión del checkpoint original no está incluida en estos ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 30 capas Gated DeltaNet y 10 capas de atención completa con compuerta |
| Parametros totales | 35.500 millones (35,5B) |
| Parametros activos | ~3.000 millones por token (256 expertos enrutados, top-8, más un experto compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4 bits GPTQ (`q4tp-v2`), 4 bits (`q4tp`), 8 bits (`q8_2f`); atención, proyecciones Gated DeltaNet, embeddings y cabeza de salida en 8 bits; normas y router en 16 bits |
| Idiomas soportados | Inglés (en), ruso (ru), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (fichero único, requiere el motor `cortiq`) |
| Modelo base | Apexintelligence-AI/Apex-35B-V1.0 (derivado de Qwen3.6-35B-A3B) |
| Tamano del repositorio | 75,5 GB |
| Libreria | cortiq |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con una capa de atención híbrida: 30 capas basadas en Gated DeltaNet (un mecanismo de atención lineal con estado recurrente) y 10 capas de atención completa con compuerta. El enrutamiento usa 256 expertos con selección top-8 más un experto compartido, lo que da unos 3.000 millones de parámetros activos por token sobre un total de 35.500 millones. Esta combinación busca reducir el coste de atención en contextos largos (hasta 262.144 tokens) manteniendo la calidad de la atención completa en un subconjunto de capas.

El checkpoint original es un fine-tune de Qwen3.6-35B-A3B orientado a razonamiento, código y uso agéntico, con modo de pensamiento dinámico y tool calling. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La cuantización sí está documentada: `q4tp-v2` aplica GPTQ a todos los expertos enrutados y al compartido usando 262.144 tokens de calibración (train de wikitext-2, UltraChat renderizado con la plantilla del modelo y código fuente en Rust), y mantiene el mismo tamaño que `q4tp` con menor desviación respecto al original en texto de chat (|ΔNLL| medio de 0,138 frente a 0,160) y en wiki, e igual en código.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento dinámico: el modelo decide en cada turno si razona y durante cuánto tiempo; la respuesta de pensamiento se emite entre `<think>` y `</think>`.
- Generación de código: el autor lo presenta como modelo de coding, con perplejidad de 1,926 sobre código de la biblioteca estándar de Python en la cuantización `q4tp-v2`.
- Tool calling / function calling en formato OpenAI: el modelo responde con `<tool_call><function=NAME><parameter=KEY>value</parameter></function></tool_call>` y el servidor lo traduce a `message.tool_calls` con `finish_reason: "tool_calls"`.
- Uso agéntico: soporta conversaciones con herramientas y razonamiento encadenado; el autor lo describe como modelo de investigación agéntica.
- Capacidades multilingües limitadas a inglés, ruso y chino.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno largas.
- Sin visión: la torre de visión del checkpoint original no está incluida en los ficheros CMF.
- Decodificación determinista disponible con `--greedy`; muestreo recomendado por el autor: temperatura 1,0, top-p 0,95, top-k 20.

## Casos de uso

- Asistencia de código en producción: el modelo genera funciones y parches con una perplejidad de 1,926 sobre código Python; puede integrarse en pipelines de CI/CD mediante el servidor compatible con OpenAI (`/v1/chat/completions`) para revisión automática de cambios o generación de tests.
- Agentes con herramientas: con tool calling nativo en formato OpenAI, encaja en orquestadores de agentes que necesiten llamar a APIs externas (clima, bases de datos, buscadores) y encadenar el resultado en la respuesta final, como demuestra el ejemplo del autor con una herramienta meteorológica.
- Análisis de documentos largos: la ventana de 262.144 tokens permite procesar informes, bases de código o expedientes completos en una sola pasada sin troceado, con la ventaja de las capas Gated DeltaNet para reducir el coste de atención.
- Razonamiento técnico y matemático: el modo de pensamiento dinámico permite activar cadenas de razonamiento largas solo cuando la consulta lo requiere, lo que abarata las consultas simples y mejora las complejas.
- Despliegue en hardware heterogéneo: al ejecutarse con `cortiq` sobre Vulkan, DX12, Metal y CPU, sirve para estaciones de trabajo con GPUs AMD o Intel, Macs con Apple Silicon y servidores sin CUDA, un escenario habitual en entornos corporativos con hardware mixto.
- Atención al cliente multilingüe (inglés, ruso, chino): conversaciones multi-turno con contexto largo y respuestas directas mediante `enable_thinking: false` para reducir latencia.
- Investigación reproducible en local: los ficheros de 19,81 GB caben en GPUs de 24 GB, lo que permite experimentar con un MoE de 35B en una sola tarjeta de consumo o gama profesional sin infraestructura de clúster.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Sí publica métricas de perplejidad y de fidelidad de la cuantización, además de rendimiento de inferencia.

| Metrica | q4tp-v2 | q4tp | q8_2f | bf16 original |
|---|---:|---:|---:|---:|
| Tamano | 19,81 GB | 19,83 GB | 35,84 GB | 71,9 GB |
| Perplejidad wiki (4k tokens) | 25,83 | 26,86 | 25,72 | 26,52 |
| Perplejidad código (4k tokens) | 1,926 | 1,905 | 1,753 | 1,759 |
| Perplejidad chat (8k tokens) | 4,071 | 4,029 | 4,047 | 4,025 |
| Top-1 vs bf16 (chat) | 95,2 % | 94,9 % | 97,7 % | — |

Rendimiento en NVIDIA A40 (48 GB, Vulkan), cortiq 0.8.48, un solo stream:

| Fichero | Decodificacion (tok/s) | Decod. a 4k / 16k | Prompt 4k / 16k (tok/s) | Primer token, prompt 4k |
|---|---:|---:|---:|---:|
| q4tp-v2 | 80,3 | 73,3 / 59,5 | 390 / 368 | 10,5 s |
| q4tp | 80,5 | 73,7 / 61,1 | 383 / 367 | 10,7 s |
| q8_2f | 78,2 | 71,3 / 58,9 | 84 / 76 | 48,7 s |

En RTX A5000 (24 GB) con backend CUDA (cortiq 0.8.92), `q4tp-v2` decodifica a 121 tok/s (también a profundidad de 4k), lee un prompt de 4k tokens a 2.974 tok/s y genera el primer token en 1,4 s. Con Vulkan en la misma tarjeta: 90-92 tok/s de decodificación (98 a 4k), 441-738 tok/s de lectura de prompt y 5,6-9,3 s hasta el primer token.

## Requisitos de hardware

- VRAM para inferencia: 18,7 GB de pesos residentes con `q4tp`/`q4tp-v2`; 34,3 GB con `q8_2f`.
- GPU recomendadas: A40 (48 GB), RTX A5000 (24 GB) o cualquier GPU con 24 GB o más para los ficheros de 4 bits; 48 GB para el de 8 bits. El backend CUDA ofrece mayor throughput que Vulkan en la misma tarjeta (121 frente a 90-92 tok/s en A5000).
- Cabe en GPU de consumo: los ficheros de 4 bits (19,81 GB) entran en tarjetas de 24 GB; no se documenta su comportamiento en tarjetas de 16 GB o menos.
- Opciones de despliegue: exclusivamente `cortiq` (CLI en Rust, instalable con `cargo install cortiq-cli`, con funcionalidad CUDA opcional mediante `--features cuda`). No hay soporte de vLLM, llama.cpp, Ollama ni TGI para el formato CMF. El servidor integrado expone endpoints compatibles con OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`) y un panel web.
- Latencia y throughput: 80,3 tok/s de decodificación en A40 con Vulkan y 121 tok/s en A5000 con CUDA; el primer token con prompt de 4k tarda 10,5 s en A40 (Vulkan) y 1,4 s en A5000 (CUDA). El fichero `q8_2f` procesa el prompt posición a posición en Vulkan (84 tok/s), por lo que para prompts largos conviene usar un fichero de 4 bits.
- Plataformas: Linux, macOS y Windows; GPUs NVIDIA, AMD e Intel mediante Vulkan/DX12, Apple Silicon mediante Metal y CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|---|
| Apex-35B-V1.0-cmf (q4tp-v2) | 35,5B (MoE) | ~3B | 262.144 | Apache 2.0 | CMF / cortiq | Cuantizado a 4 bits, 19,81 GB, sin visión |
| Apexintelligence-AI/Apex-35B-V1.0 (bf16) | 35,5B (MoE) | ~3B | 262.144 | no disponible en la informacion proporcionada | PyTorch (referencia) | Checkpoint original, 71,9 GB, incluye torre de visión |
| Qwen3.6-35B-A3B | 35B (MoE) | ~3B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo base del fine-tune; perplejidad wiki de 5,6 frente a 26,5 del fine-tune |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La perplejidad en wikitext del fine-tune (26,5) es muy superior a la del modelo base Qwen3.6-35B-A3B (5,6), según el propio autor; conviene validar la calidad en el dominio de uso antes de producción.
- Solo se declaran tres idiomas (inglés, ruso y chino); el rendimiento en castellano no está documentado y probablemente sea inferior.
- Sin capacidades de visión: la torre de visión del checkpoint original no está incluida.
- Riesgo de alucinación inherente a los modelos generativos, agravado en tareas de investigación y razonamiento abierto; no se documentan evaluaciones de factualidad.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Dependencia total del motor `cortiq` y del formato CMF: no es compatible con el ecosistema estándar (transformers, vLLM, llama.cpp, GGUF), lo que limita la portabilidad y las herramientas de terceros.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.6-35B-A3B conviene verificar las condiciones de la licencia del modelo base.
- El modo de pensamiento consume tokens de `--max-tokens` (por defecto 256), por lo que es necesario ampliar el límite para respuestas con razonamiento largo.
- El fichero de 8 bits procesa el prompt posición a posición en Vulkan, con primer token de 48,7 s para 4k tokens; no es adecuado para prompts largos en ese backend.
- Solo hay 1 like y 1.415 descargas en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Apex-35B-V1.0-cmf
- Modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0
- Repositorio del formato CMF y del motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
