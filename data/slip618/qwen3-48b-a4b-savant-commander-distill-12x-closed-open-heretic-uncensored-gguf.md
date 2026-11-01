# slip618/Qwen3-48B-A4B-Savant-Commander-Distill-12X-Closed-Open-Heretic-Uncensored-GGUF

## Resumen

Qwen3-48B-A4B-Savant-Commander-Distill-12X-Closed-Open-Heretic-Uncensored-GGUF es una cuantización GGUF, publicada por el usuario slip618, de un modelo experimental de DavidAU basado en Qwen3. Se trata de un "MoE denso" (Mixture of Experts) de 12 expertos de 4B cada uno, con 2 expertos activados por defecto, en el que cada experto es un destilado (distill) de un modelo de primer nivel: GPT-5.1, gpt-oss-120b, tres variantes de Gemini, dos de Claude, Kimi K2 Thinking, GLM, Command-A, Deepseek, JanV1 y Open-R1. La particularidad del modelo es que permite al usuario seleccionar directamente, mediante palabras clave en el prompt (por ejemplo, "Gemini" o "Claude"), qué experto o expertos procesan la petición, en lugar de dejar esa decisión al gating automático.

Esta versión concreta es la variante "Heretic" uncensored: cada experto ha sido abliterado de forma independiente con la herramienta Heretic para eliminar las negativas (refusals). Está orientada a escritura creativa sin filtros, horror, ficción en general y razonamiento, con contexto de 256k tokens. Su relevancia es principalmente como experimento comunitario de ensamblado de destilados: no es un modelo entrenado por un laboratorio, sino un finetune que combina comportamientos de múltiples modelos propietarios y abiertos en un único checkpoint ejecutable localmente (incluso con descarga parcial a CPU).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE denso (12 expertos x 4B) sobre Qwen3, 2 expertos activos |
| Parametros totales | 33.609.145.856 (~33,6B según safetensors; el nombre comercial indica 48B) |
| Parametros activos | ~8B (2 expertos de 4B; ampliable hasta 12) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | GGUF; mínimo recomendado Q4_K_S (sin imatrix) o IQ3_M (con imatrix) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 184,3 GB); base en bfloat16 |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3 Mixture of Experts y la reconfigura como un MoE de 12 expertos densos de 4B de parámetros cada uno, activando 2 expertos por token por defecto. La innovación principal no es arquitectural sino de entrenamiento y gating: cada experto es un destilado independiente de un modelo distinto (GPT-5.1, gpt-oss-120b, Gemini 3 Pro Preview, Gemini 2.5 Flash y Flash Lite, Claude 4.5 Opus y Sonnet 4, Kimi K2 Thinking, GLM 4.6 Flash, Command-A Reasoning, Open-R1 y JanV1), y el router incorpora "gating negativo" que aísla a los expertos no invocados, de modo que la salida varía notablemente según el experto nombrado en el prompt.

No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset de destilación. El proceso de abliterado se realizó experto a experto con la herramienta Heretic (p-e-w/heretic), que elimina las direcciones de negación del modelo sin reentrenamiento completo. El autor recomienda temperaturas en torno a 0,7 y señala que las regeneraciones producen salidas muy distintas entre sí por diseño.

## Capacidades

- Generación de texto y escritura creativa: ficción, horror (hasta nivel R-18), romance, ciencia ficción, generación de tramas, subtramas y continuación de escenas, con prosa vívida y sin filtros.
- Razonamiento con modo thinking: hereda el razonamiento de los destilados de modelos como Kimi K2 Thinking, Claude y GPT-5.1.
- Matemáticas, mecánica orbital y resolución de problemas (destacado por el autor).
- Generación de código.
- Selección manual de experto por nombre en el prompt o system prompt (por ejemplo, "GLM do..."), con grupos predefinidos: "AllAI", "Closed-AI", "Open-AI".
- Activación configurable de expertos: de 1 a 12, con penalización de tokens/segundo al aumentar.
- Contexto largo de 256k tokens.
- Ejecución en CPU o con descarga parcial GPU/CPU (offload).
- Contenido NSFW y sin negativas (ablitado), aunque en algunos casos requiere indicaciones explícitas para alcanzar el nivel gráfico esperado.

## Casos de uso

- Escritura de ficción sin filtros: generación de historias de terror, romance o ciencia ficción con prosa explícita; el usuario puede elegir el "estilo" del experto (por ejemplo, Claude para narrativa, Gemini para descripción vívida) nombrándolo al inicio del prompt.
- Continuación de escenas y desarrollo de tramas: con 256k de contexto puede mantener novelas extensas o bible de historia completa en la ventana y continuar escenas de forma coherente.
- Razonamiento complejo local: invocando expertos tipo razonamiento (Kimi, Command-A, Open-R1) para problemas de matemáticas o lógica multi-paso sin depender de APIs de pago.
- Generación de código: los destilados de GPT-5.1, GLM y gpt-oss-120b pueden emplearse para tareas de programación, seleccionándolos por nombre según la tarea.
- Experimentación e investigación sobre MoE y destilación: permite comparar en un mismo checkpoint el comportamiento de 12 destilados distintos, útil para estudiar routing, gating y diferencias de estilo.
- Chatbot de escritorio con personalidades intercambiables: en Ollama o llama.cpp, el usuario cambia de "personalidad" (estilo de respuesta) simplemente nombrando al experto, sin recargar el modelo.
- Prototipado de agentes con razonamiento thinking: los bloques de pensamiento de los expertos tipo reasoning pueden usarse en flujos multi-paso locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo ofrece afirmaciones cualitativas (calidad de ficción, dominio de mecánica orbital, matemáticas y código) sin métricas verificables.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con ~33,6B de parámetros totales y 8B activos, una cuantización Q4 ocupa en torno a 18-20 GB, por lo que una GPU de 24 GB (RTX 3090/4090) puede alojarlo con cuantización Q4 y descarga parcial a CPU para el resto de expertos.
- GPU recomendadas: RTX 3090/4090 (24 GB) con offload; para cuantizaciones altas (Q6/Q8) o el repo completo en bf16 (184 GB), se requieren configuraciones multi-GPU o gran cantidad de RAM del sistema.
- Consumer GPU: cabe en una RTX 4090 con Q4_K_S/IQ3_M y offload a CPU; el autor confirma explícitamente que funciona en CPU puro o con descarga parcial.
- Despliegue: llama.cpp y Ollama (formato GGUF, endpoints_compatible); no se mencionan vLLM ni TGI para esta cuantización.
- Rendimiento: los tokens/segundo descienden al activar más expertos (de 2 hasta 12); no se publican cifras concretas de latencia o throughput.
- Ajustes sugeridos: Temp 0,7, top_k 40, top_p 0,95, min_p 0,05, repetition penalty 1,05; contexto mínimo recomendado de 4-8k tokens.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Particularidad |
|---|---|---|---|---|---|
| Qwen3-48B-A4B Savant Commander (Heretic) | ~33,6B (12x4B) | ~8B (2 expertos) | 256k | Apache 2.0 | Selección manual de expertos destilados; ablitado |
| Qwen3-30B-A3B (original) | 30,5B | 3B | 32k-128k | Apache 2.0 | MoE estándar con routing automático, sin ablitar |
| Qwen3-48B-A4B Savant Commander (versión normal, DavidAU) | ~33,6B (12x4B) | ~8B | 256k | Apache 2.0 | Misma arquitectura, sin abliteration (con/sin gate) |

Frente al Qwen3-30B-A3B original, este modelo ofrece más expertos especializados y contexto mayor, a costa de un comportamiento menos predecible (gating negativo, salidas muy variables) y la ausencia de benchmarks oficiales. Frente a la versión no abliterada del mismo autor, la diferencia es únicamente la eliminación de negativas vía Heretic.

## Limitaciones y advertencias

- Contenido NSFW y sin filtros: modelo marcado explícitamente como "not-for-all-audiences"; no es apto para entornos de producción orientados a público general ni para menores.
- La abliteración elimina salvaguardas de seguridad: riesgo elevado de generar contenido ofensivo, violento o explícito sin aviso.
- Comportamiento muy variable: el gating negativo hace que las salidas difieran enormemente según el experto invocado; se recomiendan 2-3 regeneraciones por prompt.
- Riesgo de alucinación: no disponible (sin evaluaciones publicadas); al ser un ensamblado de destilados sin validación formal, debe asumirse un riesgo alto.
- Idioma: la model card declara solo inglés; el rendimiento en castellano no está documentado.
- Cuantización: por debajo de Q4_K_S (sin imatrix) o IQ3_M (con imatrix) el modelo "se rompe" (degrada severamente).
- Sin benchmarks publicados: imposible comparar objetivamente su calidad frente a modelos oficiales de tamaño similar.
- Procedencia de los destilados: los destilados de modelos propietarios (GPT-5.1, Claude, Gemini) pueden plantear dudas sobre términos de servicio de los modelos origen, aunque la licencia del repositorio es Apache 2.0.
- Rendimiento degradado al activar más de 2 expertos.

## Enlaces

- Modelo (GGUF Heretic uncensored): https://huggingface.co/slip618/Qwen3-48B-A4B-Savant-Commander-Distill-12X-Closed-Open-Heretic-Uncensored-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3-48B-A4B-Savant-Commander-Distill-12X-Closed-Open-Heretic-Uncensored
- Versión normal gated (GGUF): https://huggingface.co/DavidAU/Qwen3-48B-A4B-Savant-Commander-GATED-12x-Closed-Open-Source-Distill-GGUF
- Versión normal ungated: https://huggingface.co/DavidAU/Qwen3-48B-A4B-Deadpan-Savant-12x-Closed-Open-Source-Distill
- Herramienta Heretic (abliteración): https://github.com/p-e-w/heretic
