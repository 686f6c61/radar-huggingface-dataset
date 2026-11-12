# kidoncio/Qwen3-4B-Instruct-2507-int4-cw-ov

## Resumen

Qwen3-4B-Instruct-2507-int4-cw-ov es una conversión a OpenVINO IR del modelo Qwen3-4B-Instruct-2507 de Alibaba Qwen, publicada por el usuario kidoncio. Se trata de una cuantización simétrica int4 con granularidad channel-wise (canal por canal) diseñada específicamente para ejecutarse correctamente en la NPU integrada "AI Boost" de los procesadores Intel Core Ultra (Meteor Lake, Lunar Lake, Arrow Lake). El modelo base es un transformer decoder-only de 4.000 millones de parámetros, instruction-tuned y en modo no-thinking, con 32k tokens de contexto.

La relevancia de esta conversión radica en un problema práctico concreto: las cuantizaciones int4 habituales de Qwen3 (group-wise y asimétricas) cargan en la NPU pero generan texto corrupto o repetitivo. Esta versión emplea los parámetros `--sym --group-size -1 --ratio 1.0`, que son los que espera el plugin de NPU de OpenVINO, y produce salidas coherentes. El resultado es un artefacto de aproximadamente 2,2 GB que cabe en la memoria compartida de un sistema Core Ultra y permite inferencia local de un LLM de 4B sin GPU dedicada.

El modelo funciona también sobre CPU y GPU mediante OpenVINO GenAI, pero su razón de ser es la NPU. Está pensado para tareas cortas y locales, como reescritura de texto, corrección ortográfica o generación breve, ejecutadas en paralelo al trabajo del usuario. La licencia Apache-2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3), convertida a OpenVINO IR |
| Parametros totales | 4B (modelo base Qwen3-4B-Instruct-2507) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32k tokens en el modelo base; en NPU el prompt se fija en compilación (ejemplo documentado: `MAX_PROMPT_LEN=1024`) |
| Tipos de cuantizacion | int4 simétrica, channel-wise (`--sym --group-size -1 --ratio 1.0`) |
| Idiomas soportados | en, pt (declarados en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), no safetensors ni GGUF |
| Tamano del repositorio | ~2,2 GB |
| Libreria | openvino / openvino-genai |
| Hardware objetivo | Intel NPU (AI Boost) en Core Ultra; también CPU y GPU vía OpenVINO |
| Version de OpenVINO probada | 2026.4.1 / openvino-genai 2026.4.1.0 |
| Driver NPU probado | Intel linux-npu-driver 1.38.0 (con compilador NPU) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parámetros entrenado por el equipo Qwen. La variante 2507 es la versión instruct sin modo de razonamiento: no emite bloques `<think>` y responde directamente. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base.

La aportación técnica de esta publicación no está en el entrenamiento sino en la conversión. Se realizó con `optimum-cli export openvino` (optimum-intel 2.2.0, nncf 3.4.0) usando cuantización int4 simétrica con `group-size -1` (channel-wise) y `ratio 1.0`. Este formato es el que el plugin de NPU de OpenVINO requiere para compilar y ejecutar correctamente; las conversiones group-wise asimétricas habituales producen salidas incoherentes en NPU. En NPU, OpenVINO compila formas estáticas, por lo que la longitud máxima de prompt (`MAX_PROMPT_LEN`) y la longitud mínima de respuesta (`MIN_RESPONSE_LEN`) se fijan en el momento de la compilación y determinan el grafo compilado.

## Capacidades

- Generación de texto conversacional e instruction-following en inglés y portugués.
- Reescritura y edición de texto: corrección ortográfica, puntuación, reformulación manteniendo el idioma.
- Generación breve con decodificación greedy determinista (adecuada para tareas de reescritura).
- Aplicación automática de la plantilla de chat de Qwen3 mediante `ov_genai.ChatHistory`.
- Ejecución en NPU, CPU y GPU a través de OpenVINO GenAI.
- Sin modo de razonamiento: no genera bloques `<think>`.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente multi-paso: no documentadas.
- Visión o audio: no disponibles (modelo solo de texto).

## Casos de uso

- Reescritura de mensajes de trabajo en local: el modelo se usa para corregir ortografía y puntuación de mensajes de chat sin enviar datos a la nube, ejecutándose en la NPU junto al resto de aplicaciones. Es el caso para el que fue creado (herramienta Polish).
- Corrección ortográfica y de puntuación determinista: con `do_sample=False` y una instrucción de sistema clara, produce reescrituras reproducibles de textos cortos (hasta ~150 palabras según las pruebas del autor).
- Asistencia de escritura offline en portugués e inglés: útil para usuarios que necesitan pulir textos en estos idiomas sin conexión, aprovechando que el autor verificó mejor calidad en portugués que alternativas como Phi-3.5-mini o LFM2.5-1.2B.
- Procesamiento de texto en portátiles sin GPU dedicada: cualquier equipo Core Ultra con NPU puede ejecutar el modelo en ~2,2 GB, lo que permite integrarlo en herramientas de escritorio locales.
- Tareas cortas de generación en segundo plano: con ~0,09 s por token, encaja en flujos donde se generan respuestas de decenas de palabras mientras el usuario sigue trabajando.
- Prototipado de aplicaciones OpenVINO GenAI: sirve como referencia funcional de un LLM int4 correctamente empaquetado para NPU, útil para validar pipelines antes de desplegar modelos mayores.
- Filtrado y normalización de texto en pipelines locales: por ejemplo, limpiar entradas de usuario o normalizar mensajes antes de almacenarlos, siempre que no haya números críticos en juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí documenta mediciones de latencia en un Core Ultra 9 275HX (NPU 3720) con OpenVINO 2026.4.1 y decodificación greedy, reescribiendo mensajes con un prompt de sistema de ~470 tokens más ejemplos few-shot:

| Escenario | Tiempo |
|---|---|
| Primera carga (compilación NPU, `MAX_PROMPT_LEN=1024`) | ~20 s |
| Cargas posteriores desde `CACHE_DIR` | 2–3 s |
| Mensaje de 40 palabras | 5–11 s |
| Mensaje de 140 palabras | ~19 s |
| Mensaje de 190 palabras | ~31 s |
| Coste por token generado | ~0,09 s |

Comparación cualitativa del autor en el mismo test: Qwen3-8B int4-cw fue más lento (16–18 s por mensaje) y Phi-3.5-mini y LFM2.5-1.2B dieron resultados notablemente peores en portugués.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-int4-cw-ov (este) | 4B | 32k (base); prompt fijo en NPU | OpenVINO IR int4 channel-wise | Apache-2.0 | Optimizado para NPU Intel; ~2,2 GB; ~0,09 s/token |
| Qwen3-8B int4-cw (OpenVINO NPU) | 8B | no disponible | OpenVINO IR int4 channel-wise | Apache-2.0 | Más lento en el test del autor (16–18 s por mensaje) |
| Phi-3.5-mini | ~3,8B | no disponible | múltiple (incl. OpenVINO) | MIT | Peor calidad en portugués según el autor |
| LFM2.5-1.2B | 1,2B | no disponible | múltiple (incl. OpenVINO) | no disponible | Peor calidad en portugués según el autor |

Los datos de rendimiento de los competidores provienen únicamente de las observaciones cualitativas del autor; no hay benchmarks estandarizados comparativos en la información disponible.

## Limitaciones y advertencias

- Corrupción de dígitos en salidas largas por la cuantización int4: el autor observó "800" convertido en "80.000" y "300" en "三00". Si los números importan, hay que compararlos entre entrada y salida y rechazar reescrituras alteradas.
- Pérdida de calidad frente al modelo base bf16, especialmente en instrucciones largas o intrincadas. El autor lo valida para reescrituras de hasta ~150 palabras.
- En NPU, la longitud de prompt se fija en compilación: prompts más largos que `MAX_PROMPT_LEN` fallan y deben rechazarse contando tokens con el tokenizer.
- Sin `CACHE_DIR`, cada arranque recompila el modelo (~20 s); cambiar `MAX_PROMPT_LEN` o `MIN_RESPONSE_LEN` fuerza una nueva compilación.
- Solo probado en Linux (Bazzite/Fedora, kernel con `intel_vpu`). Windows debería funcionar con el driver estándar de Intel, pero no está verificado.
- El driver NPU de algunas distribuciones (p. ej. Fedora) se empaqueta sin compilador (`libopenvino_intel_npu_compiler.so`), lo que provoca `ZE_RESULT_ERROR_UNSUPPORTED_FEATURE`; hay que instalar los paquetes de la release de Intel.
- Idiomas declarados limitados a inglés y portugués; no hay evidencia de calidad en castellano.
- Sin modo de razonamiento: no apto para tareas que requieran cadenas de pensamiento explícitas.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de sesgo.
- Licencia Apache-2.0 permite uso comercial, pero la calidad degradada por int4 debe validarse en el dominio concreto antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kidoncio/Qwen3-4B-Instruct-2507-int4-cw-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Organización Qwen: https://huggingface.co/Qwen
- Herramienta Polish (NPU): https://github.com/kidoncio/polish-npu
- Driver NPU de Intel (releases): https://github.com/intel/linux-npu-driver/releases
- OpenVINO GenAI: no disponible enlace directo en la información proporcionada
- optimum-intel: no disponible enlace directo en la información proporcionada
