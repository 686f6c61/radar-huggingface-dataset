# lensetek/lensetek-edge-loop-3b

## Resumen
Lensetek-Edge-Loop-3B es un modelo de lenguaje pequeño (SLM) de 3.000 millones de parámetros publicado por lensetek como fine-tuning del Qwen2.5-3B-Instruct de Alibaba. Está diseñado específicamente para computación en el borde (edge computing) en entornos industriales aislados (air-gapped), automatización industrial y escenarios de resiliencia offline, donde no hay conectividad a internet ni acceso a servicios en la nube. El modelo se distribuye con pesos completos en precisión de 16 bits (BF16/Safetensors) y licencia Apache-2.0, lo que permite uso comercial sin restricciones.

La propuesta diferencial del modelo gira en torno a cinco dimensiones de ingeniería: recuperación multi-turno de errores mediante auto-corrección, abstención calibrada con el objetivo declarado de minimizar alucinaciones (penalización asimétrica vía GRPO/RLVR), modos de esfuerzo computacional adaptativos (`[EFFORT:LOW]` y `[EFFORT:HIGH]`), calibración consciente de cuantización para que la versión 4-bit no degrade las capacidades de tool calling, y contexto regional/industrial indonesio. El entrenamiento se organizó en seis clústeres curriculares con un total declarado de 3.000 trayectorias.

Es relevante ahora porque aborda un nicho poco cubierto: modelos pequeños, desplegables en hardware modesto, con comportamiento agéntico fiable (JSON válido en llamadas a herramientas) y abstención ante falta de contexto, orientados a operación industrial y supervivencia en campo. La longitud de contexto heredada del modelo base no se detalla en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tuning de Qwen2.5-3B-Instruct), con "looped agentic reasoning" |
| Parametros totales | 3.000 millones (heredados de Qwen2.5-3B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos base); GGUF Q4_K_M y AWQ mencionados para la versión cuantizada |
| Idiomas soportados | inglés (en), indonesio (id), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16); GGUF en repositorio separado |

## Arquitectura y entrenamiento
El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-3B-Instruct y se especializa mediante post-entrenamiento sobre un currículo estructurado en seis clústeres con aproximadamente 3.000 trayectorias: tool calling determinista (~500, 17%), recuperación multi-turno de errores (~1.000, 33%), abstención calibrada (~500, 17%), bucles de esfuerzo ajustable (~400, 13%), supervivencia offline e IoT (~350, 12%) y contexto regional/bilingüe (~250, 8%). El 35% del dataset contiene trayectorias de fallo planificadas para entrenar la auto-corrección ante códigos de error, fallos de sintaxis en herramientas o búsquedas RAG sin resultados.

La innovación técnica declarada incluye el uso de GRPO/RLVR con recompensas asimétricas: abstenerse cuando falta contexto recibe +0.8, mientras que alucinar fuera de contexto se penaliza con -2.0. También se menciona una calibración consciente de cuantización durante el post-entrenamiento para preservar fidelidad en tool calling tras cuantizar a 4 bits, y modos de esfuerzo con etiquetas explícitas (`[EFFORT:LOW]` para respuestas directas en menos de 25 tokens y latencia inferior a 320 ms; `[EFFORT:HIGH]` con scratchpad `<think>` de 150-250 tokens). No se especifica el número total de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades
- Generación de texto y razonamiento agéntico multi-paso con bucles internos de auto-corrección.
- Tool calling / function calling con esquemas estrictos: `rag_search`, `read_sensor`, `run_command`, con el objetivo declarado de generar argumentos JSON válidos al 100%.
- Recuperación multi-turno de errores: interpreta códigos de error y reformula llamadas a herramientas en turnos posteriores.
- Abstención calibrada: responde "información no encontrada en los documentos locales" ante falta de contexto, en lugar de fabricar respuestas.
- Modos de esfuerzo adaptativos (`[EFFORT:LOW]` y `[EFFORT:HIGH]`) para controlar latencia y presupuesto de tokens.
- Capacidades de dominio industrial: triaje de víctimas START, purificación de agua en 4 etapas, diagnóstico Modbus/CAN-bus y protocolos de radio de emergencia.
- Multilingüe limitado a inglés, indonesio y chino, con code-switching técnico ID/EN.
- No se menciona soporte de visión, audio ni otras modalidades.

## Casos de uso
- Automatización industrial en planta: el modelo puede invocar `read_sensor` y `run_command` con argumentos JSON válidos para monitorizar y actuar sobre equipos, aprovechando la recuperación de errores ante fallos de sintaxis o respuestas vacías de herramientas.
- Diagnóstico de buses industriales: interpretación de tramas Modbus y CAN-bus para localizar fallos en equipos de campo, con abstención cuando no dispone de la documentación técnica local.
- Asistencia RAG en entornos air-gapped: búsqueda sobre documentación local (`rag_search`) con grounding estricto y respuesta de abstención cuando el contexto recuperado no contiene la respuesta, reduciendo el riesgo de alucinación en procedimientos críticos.
- Soporte a operadores de campo: consultas multi-turno sobre procedimientos operativos estándar (SOP) de fábrica, con terminología industrial indonesia y cambio de código ID/EN.
- Resiliencia y supervivencia offline: guía de triaje START, purificación de agua en cuatro etapas y protocolos de radio de emergencia en escenarios sin conectividad, con latencia baja en modo `[EFFORT:LOW]`.
- Agentes de borde en hardware modesto: despliegue en CPU o GPU de gama baja mediante la versión GGUF Q4_K_M (declarada para funcionar en menos de 2,5 GB de RAM), útil en dispositivos IoT o gateways industriales.
- Pipelines de automatización con verificación: uso del modo `[EFFORT:HIGH]` con scratchpad para cruzamiento de múltiples documentos antes de emitir una acción crítica.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara métricas internas: más del 95% de tasa de finalización de tareas end-to-end en pipelines multi-paso de herramientas y menos del 1,0% de tasa de alucinación en dominio cerrado sobre benchmarks de documentos empresariales, sin detallar los conjuntos de evaluación empleados.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 6-7 GB (3.000 millones de parámetros a 2 bytes por parámetro, más overhead de activaciones y KV cache).
- VRAM estimada en 4 bits (Q4_K_M): alrededor de 2-2,5 GB, según la declaración del autor de funcionar en menos de 2,5 GB de RAM.
- GPU recomendadas: A100, H100 o GPUs de 16 GB o más para BF16 con contexto largo; RTX 4090, RTX 3090, RTX 4080 o RTX 4070 Ti para BF16 sin problema; GPUs de 8 GB o menos viables con cuantización.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más en BF16 y en GPUs de 4-6 GB con cuantización 4-bit.
- Opciones de despliegue: `transformers` (BF16), `vLLM`, `SGLang` para alto rendimiento en GPU; `llama.cpp` y `Ollama` mediante el repositorio GGUF para CPU y hardware limitado.
- Latencia y throughput: el autor declara latencia inferior a 320 ms en modo `[EFFORT:LOW]` con menos de 25 tokens de salida; no se proporcionan cifras de throughput (tokens/s) para otros modos ni hardware específico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Lensetek-Edge-Loop-3B | 3.000 M | no disponible | Apache-2.0 | Edge industrial, tool calling, abstención calibrada | Hugging Face (safetensors + GGUF) |
| Qwen2.5-3B-Instruct | 3.000 M | 32.768 tokens (según documentación pública del modelo base) | Apache-2.0 | Asistente generalista | Hugging Face, amplia adopción |
| Llama 3.2 3B Instruct | 3.000 M | 128.000 tokens (según documentación pública) | Llama 3.2 Community License | Asistente generalista multilingüe | Hugging Face, amplia adopción |
| Phi-3.5-mini-instruct | 3.800 M | 128.000 tokens (según documentación pública) | MIT | Razonamiento y código | Hugging Face |

La comparativa con Qwen2.5-3B-Instruct es directa porque Lensetek-Edge-Loop-3B es un fine-tuning suyo: hereda el tamaño y la licencia, pero sustituye el comportamiento generalista por especialización en tool calling, abstención y dominio industrial. Frente a Llama 3.2 3B y Phi-3.5-mini, el modelo de Lensetek ofrece menor contexto documentado y menor adopción comunitaria, a cambio de un currículo específico para entornos air-gapped. No se dispone de datos de benchmarks comparativos publicados por el autor.

## Limitaciones y advertencias
- Modelo con cero descargas y cero likes en el momento de la ficha: no hay validación independiente de las métricas declaradas por el autor.
- Las cifras de rendimiento (>95% de finalización de tareas, <1,0% de alucinación) son afirmaciones del autor sin conjuntos de evaluación públicos ni reproducibilidad documentada.
- Riesgo de alucinación inherente a un modelo de 3.000 millones de parámetros; la abstención calibrada se entrena para dominio cerrado y puede no generalizar a dominios abiertos.
- Cobertura lingüística limitada a inglés, indonesio y chino; el castellano no está declarado como idioma soportado.
- Longitud de contexto no documentada en la información disponible; conviene verificar la configuración del tokenizador antes de usarlo en RAG con documentos largos.
- El modo `[EFFORT:HIGH]` con scratchpad `<think>` consume entre 150 y 250 tokens adicionales, lo que incrementa latencia y coste en despliegues de alto volumen.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-3B-Instruct también es Apache-2.0, por lo que no hay restricciones adicionales conocidas; aun así, conviene revisar los términos del modelo base.
- Especialización muy vertical (IoT industrial, supervivencia): su rendimiento en tareas generalistas puede ser inferior al del Qwen2.5-3B-Instruct original.
- La fecha de creación del repositorio (2026-11-22) y la ausencia de actividad sugieren un proyecto reciente o de bajo mantenimiento; verificar la vigencia antes de adoptarlo en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/lensetek/lensetek-edge-loop-3b
- Versión GGUF cuantizada: https://huggingface.co/lensetek/lensetek-edge-loop-3b-GGUF
- Hub de aplicación y estudio web: https://huggingface.co/lensetek/lensetek-edge-ai-agent
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Apache-2.0: https://opensource.org/licenses/Apache-2.0
