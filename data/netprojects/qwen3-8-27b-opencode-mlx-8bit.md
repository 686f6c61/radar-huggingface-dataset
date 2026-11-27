# netprojects/Qwen3.8-27B-opencode-MLX-8bit

## Resumen

Qwen3.8-27B-opencode-MLX-8bit es una compilación cuantizada a 8 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-opencode-adapted, que a su vez es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.8-27B. El autor de esta conversión es el usuario netprojects, que publica distintas variantes de cuantización (3, 4, 6, 8 bits y bf16) orientadas a ejecución local en Apple Silicon. El modelo resuelve el problema de desplegar un agente de programación de 27.800 millones de parámetros en Macs con memoria unificada, manteniendo una fidelidad muy alta respecto al original en bf16.

El ajuste original de harness-hub se entrenó con aprendizaje por refuerzo (AsyncGRPO en TRL) para actuar como el motor detrás del agente de programación OpenCode en tareas de ingeniería de software y terminal. Según los resultados publicados por el autor del adaptador, con el modo de razonamiento desactivado, SWE-bench Pro (hard 51) pasa del 35,3 % al 51,0 % y Terminal-Bench 2.1 del 46,4 % al 52,4 % respecto al modelo base. Además, con thinking desactivado iguala al modelo base con thinking a máximo esfuerzo generando aproximadamente una sexta parte de los tokens.

Esta compilación concreta cuantiza las capas lineales a 8 bits (afín, grupo 64) e incluye el codificador de visión y la capa MTP de Qwen, por lo que admite entrada image-text-to-text. Con 30,0 GB de pesos, está pensada para equipos con 64 GB o más de memoria unificada y es la variante más próxima a bf16 de la familia MLX (99,2 % de coincidencia en el siguiente token y KL de 0,0004 frente a bf16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capa MTP, base Qwen3.8-27B; cuantizacion MLX afín de 8 bits en capas lineales (grupo 64) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (esta build); la familia incluye 3, 4, 6, 8 bits, bf16 y adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer multimodal con codificador de visión y una capa MTP (multi-token prediction) que se conserva en esta conversión. Sobre ese base, harness-hub aplicó un LoRA entrenado con aprendizaje por refuerzo mediante AsyncGRPO en TRL, con el objetivo de convertirlo en el modelo que opera el agente OpenCode en tareas de ingeniería de software y de terminal. Esta build concreta fusiona el adaptador (revisión b4171c0) en el modelo base (revisión 3756181) y lo convierte a MLX con mlx-vlm, cuantizando las capas lineales a 8 bits con cuantización afín y tamaño de grupo 64.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles adicionales del proceso de RL. El tokenizador y la plantilla de chat son los archivos originales de harness-hub, sin modificar, por lo que conserva el mismo vocabulario y el mismo formato de tool calls que Qwen3.8-27B. La fidelidad de la cuantización está documentada: 99,2 % de coincidencia en el siguiente token respecto a bf16 y divergencia KL de 0,0004.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Programación y resolución de tareas de ingeniería de software: el adaptador se entrenó específicamente para tareas de SWE y de terminal.
- Uso como agente de codificación dentro de OpenCode, con ejecución de comandos y edición de ficheros.
- Tool calling / function calling en el formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como tool calls compatibles con OpenAI.
- Entrada multimodal image-text-to-text: incluye codificador de visión, por lo que puede procesar capturas de pantalla, imágenes de terminal o diagramas.
- Modo thinking configurable (activado o desactivado mediante la plantilla de chat); el adaptador fue entrenado y evaluado con thinking desactivado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de programación local en Mac: servir el modelo con `mlx_lm.server` y conectarlo a OpenCode mediante un proveedor compatible con OpenAI, de modo que el agente pueda leer el repositorio, ejecutar tests y aplicar parches sin enviar código a servicios externos. Es adecuado porque el adaptador se entrenó exactamente para ese flujo con thinking desactivado.
- Depuración de tests fallidos: dada una instrucción como localizar por qué fallan los tests de un módulo y corregir el error, el modelo navega por el código y el terminal. Los resultados publicados en SWE-bench Pro (51,0 %) y Terminal-Bench 2.1 (52,4 %) respaldan este escenario.
- Automatización de tareas de terminal: interpretar la salida de comandos, diagnosticar errores y proponer o ejecutar la corrección, con un coste de tokens reducido al operar sin thinking (aproximadamente una sexta parte de tokens que el base con thinking máximo).
- Análisis de capturas de pantalla y salidas visuales: gracias al codificador de visión incluido, puede responder preguntas sobre una imagen de terminal o de una interfaz, por ejemplo identificar el error que muestra una captura.
- Asistencia de código en el editor con privacidad: al ejecutarse íntegramente en local sobre Apple Silicon, es apto para entornos con requisitos de confidencialidad donde no se permite enviar código a la nube.
- Integración en pipelines de desarrollo con tool calling: el formato de tool calls compatible con OpenAI permite conectarlo a frameworks de agentes que esperen esa interfaz, manteniendo el formato XML nativo de Qwen por debajo.
- Evaluación y comparación de cuantizaciones: al existir builds de 3, 4, 6, 8 bits y bf16 con métricas de fidelidad publicadas, sirve para medir el impacto de la cuantización en tareas reales de agente antes de fijar una build en producción.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, medidos bajo OpenCode con thinking desactivado:

| Benchmark | Modelo base | Adaptador (thinking off) |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 51,0 % |
| Terminal-Bench 2.1 | 46,4 % | 52,4 % |

Fidelidad de la cuantización de esta build frente a bf16:

| Metrica | Valor |
|---|---|
| Coincidencia en el siguiente token vs bf16 | 99,2 % |
| Divergencia KL vs bf16 | 0,0004 |
| Tamano de pesos | 30,0 GB |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar para esta build.

## Requisitos de hardware

- VRAM/memoria unificada: 30,0 GB de pesos; el autor recomienda esta build para Macs de 64 GB o más, dejando margen para macOS y prompts largos (la descarga debe ser como máximo en torno al 60 % de la memoria).
- GPU: orientado a Apple Silicon con MLX; no se documentan requisitos para A100, H100 ni RTX 4090 en esta build.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos de 64 GB o más; para 48 GB existe la build de 6 bits (23,1 GB, recomendada por el autor), para 32 GB la de 4 bits (16,3 GB), para 24 GB la de 3 bits (13,8 GB) y para 16 GB la variante GGUF IQ2_M (10,2 GB).
- Despliegue: `mlx_lm.server` (servidor compatible con OpenAI, requiere mlx-lm >= 0.32.2), mlx-lm para texto en Python, mlx-vlm >= 0.7.11 para imágenes, y LM Studio en modo MLX. Existen builds GGUF equivalentes para llama.cpp, Ollama y LM Studio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-opencode-MLX-8bit (esta build) | 27,78 B | no disponible | MLX safetensors, 30,0 GB | apache-2.0 | 99,2 % de coincidencia con bf16; KL 0,0004 |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit | 27,78 B | no disponible | MLX safetensors, 23,1 GB | apache-2.0 | 98,7 % de coincidencia; KL 0,0014; recomendada por el autor |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit | 27,78 B | no disponible | MLX safetensors, 16,3 GB | apache-2.0 | 96,7 % de coincidencia; KL 0,0203 |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16 | 27,78 B | no disponible | MLX safetensors, 55,6 GB | apache-2.0 | Referencia sin cuantizar |
| harness-hub/Qwen3.8-27B-opencode-adapted | 27,78 B | no disponible | Adaptador LoRA + base | apache-2.0 | Modelo original del ajuste con RL |

No se dispone de datos de benchmarks de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking desactivado; el autor recomienda mantenerlo así. Activarlo puede degradar el comportamiento esperado.
- El modelo está especializado en tareas de agente de programación y terminal; su rendimiento en dominios generales puede diferir del modelo base sin ajustar.
- La cuantización a 8 bits introduce una divergencia pequeña pero no nula respecto a bf16 (99,2 % de coincidencia en el siguiente token, KL 0,0004); para usos sensibles a la fidelidad exacta debe considerarse la build bf16.
- La build requiere 64 GB o más de memoria unificada; en equipos de 48 GB o menos debe recurrirse a cuantizaciones menores, con mayor pérdida de fidelidad (KL 0,0203 en 4 bits y 0,0812 en 3 bits).
- Solo se distribuye en formato MLX; para llama.cpp, Ollama o LM Studio hay que usar las builds GGUF del mismo autor.
- No se documentan sesgos conocidos, riesgos de alucinación específicos, idiomas soportados ni longitud de contexto en la información disponible.
- Licencia apache-2.0, que permite uso comercial; deben respetarse, no obstante, las condiciones del modelo base Qwen y del adaptador original.
- El modelo se publica como conversión de terceros (netprojects) sobre un ajuste de harness-hub; la responsabilidad sobre el método y los datos de entrenamiento recae en el autor original del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-8bit
- Modelo base del ajuste: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits (recomendada): https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-3bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
- Adaptador LoRA para mlx-lm: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- Builds GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF
- Perfil del autor de las conversiones: https://huggingface.co/netprojects
- OpenCode: https://opencode.ai
- Esquema de configuración de OpenCode: https://opencode.ai/config.json
