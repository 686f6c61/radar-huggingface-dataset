# chengjunyan1/oss-skills-libero-direct-rl-s2

## Resumen

`chengjunyan1/oss-skills-libero-direct-rl-s2` es un ajuste fino por aprendizaje por refuerzo del modelo multimodal Qwen3.5-9B, publicado por el autor chengjunyan1 como parte del trabajo *Growing Agent Skill Libraries as Open-Source Projects*. No es un modelo de propósito general: es una política de agente especializada en generar programas Python sobre una API de robot para tareas de manipulación de mesa (benchmark LIBERO), dentro de un arnés de agente que renderiza una biblioteca de habilidades fija (`library/`) en el prompt.

El modelo parte del checkpoint de calentamiento supervisado (SFT) del mismo linaje y se entrena con GRPO de parámetros completos (verl, FSDP, bf16, rollouts con vLLM) sobre 37 tareas de entrenamiento de LIBERO-90, con 8 prompts y 8 rollouts por paso durante 300 pasos. La biblioteca de habilidades permanece congelada en su versión semilla (`seed_v1`), de modo que toda la mejora procede del RL y no de la ampliación de la biblioteca. El checkpoint liberado es el paso 260, seleccionado por regla declarada sobre el conjunto de desarrollo.

Su relevancia es acotada pero clara: sirve como referencia reproducible (semilla 2) de la línea base "direct RL" del bloque de pesos abiertos del artículo, y como ejemplo de política de 9B que escribe código de control robótico en lugar de emitir acciones de bajo nivel. La arquitectura es la completa de Qwen3.5, incluida su torre de visión, aunque la política se usa solo en modo texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen3.5 (arquitectura completa, incluida torre de vision); politica usada en modo texto |
| Parametros totales | 9.409.813.744 (760 tensores) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens en el servicio de referencia (`--max-model-len 32768`) |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un unico `model.safetensors` bf16, 18.819.722.392 bytes) |

## Arquitectura y entrenamiento

La arquitectura y el tokenizador son los de Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`), cargable con `AutoModelForImageTextToText`. El checkpoint conserva la torre de visión del modelo base aunque la política se evalúa solo con texto. El linaje es Qwen3.5-9B, seguido de un calentamiento SFT (SFT1) de tres épocas sobre 420 episodios exitosos de LIBERO-90 repartidos en 55 tareas, y después el entrenamiento por refuerzo.

El RL es GRPO de parámetros completos con verl sobre FSDP en bf16 y rollouts generados con vLLM, en un nodo de ocho GPU H100. Se usan 37 tareas de entrenamiento de LIBERO-90 (excluyendo las de retención), 8 prompts por 8 rollouts por paso, ventajas normalizadas por grupo, una actualización por paso y 300 pasos totales. La KL hacia la política SFT es de baja varianza con coeficiente 1e-2, el learning rate es 1e-6 tras 10 pasos de calentamiento con decaimiento coseno hasta 1e-7, hay rechazo a nivel de secuencia con umbral 1e-2 y los rollouts se generan a temperatura 1 con el modo thinking desactivado. Se guarda un checkpoint cada 20 pasos y la semilla de datos es 2. El entrenamiento se ejecutó entre el 15 y el 17 de octubre de 2026 (job 24658, nodo a3mega 11).

La selección del checkpoint sigue una regla declarada de paso elegible sobre el conjunto de desarrollo con `seed_v1` (`best_step_eligible`, que coincide con el argmax simple), con un 52,25 % de acierto e intervalo [42,58, 61,76]. Se publican solo los pesos del paso 260, sin estado del optimizador ni otros pasos.

## Capacidades

- Generación de código: escribe programas Python sobre una API de robot (LIBERO) y JavaScript de Mineflayer para Minecraft dentro del arnés de agente del artículo.
- Razonamiento de agente de varios pasos: planifica y compone llamadas a la biblioteca de habilidades renderizada en el prompt.
- Uso de una biblioteca de habilidades externa: consume los ficheros de `library/` (`README.md` primero; `LIBRARY.json` y `PROVENANCE.md` son metadatos y no se renderizan).
- Manipulación robótica de mesa: tareas de localización, agarre, manipulación y transporte, cubiertas por los ficheros `localize.md`, `grasp.md`, `manipulation.md` y `transport.md`.
- Capacidad multimodal latente: conserva la torre de visión del modelo base, aunque la política se usa en modo texto.
- Modo thinking: disponible en la arquitectura, pero desactivado en el protocolo de evaluación (`enable_thinking: false`).
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling genérico: no disponible como capacidad declarada; la interacción con herramientas se produce vía generación de código en el arnés.

## Casos de uso

- Evaluación reproducible de RL para agentes: sirve como semilla 2 de la línea base "direct RL" del artículo, permitiendo replicar las cifras de TEST (E1 49,56; E2 13,89) con el protocolo declarado (temperatura 0, 2.048 tokens por turno, 6.144 por episodio, thinking off).
- Investigación en políticas que escriben código: útil para estudiar cómo un modelo de 9B compone programas sobre una API en lugar de emitir acciones continuas, con la biblioteca de habilidades fija como variable controlada.
- Punto de partida para RL posterior: al ser un checkpoint intermedio (paso 260 de 300) con receta documentada, sirve como inicialización para experimentos que amplíen la biblioteca o cambien el conjunto de tareas.
- Automatización de manipulación de mesa en simulación: generación de programas de localización, agarre y transporte sobre LIBERO-90 para comparar contra políticas especializadas.
- Agentes en entornos tipo Minecraft: el mismo formato de política se aplica a la escritura de JavaScript de Mineflayer, útil para prototipos de agentes que programan acciones.
- Estudio de la congelación de bibliotecas: al mantener `seed_v1` sin crecimiento, permite aislar la contribución del RL frente a la del crecimiento de la biblioteca de habilidades en la comparativa del artículo.
- Referencia de infraestructura: la receta (verl + FSDP + vLLM, 8×H100, 300 pasos) es reutilizable como plantilla de entrenamiento GRPO para modelos de 9B multimodales.

## Benchmarks y rendimiento

Resultados de TEST publicados en el artículo para este checkpoint (protocolo del apéndice; TEST xfer con `seed_v1`):

| Metrica | Valor |
|---|---|
| E1 (q.drls2.e1) | 49,56 |
| E2 (q.drls2.e2) | 13,89 |
| Media de dos semillas, fila "direct RL" | 48,72 / 12,74 |
| DEV, paso elegido con `seed_v1` | 52,25 % [42,58, 61,76] |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: alrededor de 19 GB solo para pesos (18,82 GB de `model.safetensors`), más overhead de activaciones y caché KV; en la práctica, 24 GB es el mínimo ajustado y 40-48 GB da margen para contexto largo.
- Entrenamiento: un nodo con ocho GPU H100 (verl FSDP, bf16, vLLM para rollouts).
- GPU recomendadas: H100 o A100 80 GB para servicio con contexto completo; en consumer, una RTX 4090 (24 GB) puede alojar los pesos en bf16 con contexto reducido, aunque no se documenta una configuración validada.
- Despliegue: `vllm serve chengjunyan1/oss-skills-libero-direct-rl-s2 --language-model-only --max-model-len 32768`, con una versión de vLLM que soporte Qwen3.5; también carga con `transformers` (`AutoModelForImageTextToText`, `dtype="bfloat16"`, `device_map="auto"`). No se documentan opciones GGUF, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oss-skills-libero-direct-rl-s2 | 9,41 B | 32.768 | Politica de agente para LIBERO via generacion de codigo, RL con biblioteca fija | Apache 2.0 | Pesos bf16 en Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9 B | no disponible en la informacion | Modelo multimodal de proposito general | no disponible en la informacion | Hugging Face |
| Checkpoint SFT del mismo linaje (SFT1 paso 39) | 9 B | no disponible | Calentamiento supervisado previo al RL | no disponible en la informacion | Referenciado en la procedencia, no liberado como modelo independiente |

No se dispone de datos de benchmarks comparables entre estas filas en la información proporcionada, por lo que la comparación se limita a parametros, contexto, especialidad y licencia.

## Limitaciones y advertencias

- Modelo de nicho: es una política de agente para manipulación LIBERO (y Mineflayer), no un asistente general; su uso fuera del arnés y de la biblioteca `seed_v1` no está validado.
- Dependencia del arnés: los resultados solo son reproducibles renderizando `library/README.md`, `grasp.md`, `localize.md`, `manipulation.md` y `transport.md` en el prompt; `LIBRARY.json` y `PROVENANCE.md` no deben renderizarse.
- Checkpoint intermedio: es el paso 260 de 300, elegido por regla sobre DEV; no se liberan otros pasos ni el estado del optimizador, lo que impide reanudar el entrenamiento tal cual.
- Brecha E1/E2: la diferencia entre 49,56 y 13,89 en los dos conjuntos de TEST indica una generalización desigual entre distribuciones de evaluación.
- Sesgos: no disponibles en la información proporcionada; al derivar de Qwen3.5-9B, puede heredar los del modelo base, no documentados aquí.
- Alucinación: riesgo inherente a la generación de código; los programas generados deben validarse contra la API del robot antes de ejecutarse.
- Idiomas: no disponibles; el protocolo de evaluación es en inglés técnico (código y documentación de la biblioteca).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requeriría validación propia.
- Fecha y madurez: publicado el 24 de noviembre de 2026, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chengjunyan1/oss-skills-libero-direct-rl-s2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset y registros del proyecto: https://huggingface.co/datasets/chengjunyan1/oss-skills-records (carpeta `rl-runs/libero-direct-rl-s2/`)
- Artículo de referencia: *Growing Agent Skill Libraries as Open-Source Projects* (referencia pendiente de añadir en la model card; no disponible)
- Repositorio de código, demo o blog: no disponibles en la información proporcionada
