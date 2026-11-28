# netprojects/Qwen3.8-27B-super-adapter-GGUF

## Resumen

Qwen3.8-27B-super-adapter GGUF es una compilación en formato GGUF del modelo Qwen3.8-27B de Qwen, fusionado con el super-adapter de harness-hub, un LoRA que integra tres especialistas de reinforcement learning orientados a agentes de programación: pi, Hermes Agent y OpenCode. El resultado es un modelo listo para ejecutar en llama.cpp sin necesidad de cargar el adaptador por separado, con soporte de llama-server y de la capa de multi-token prediction (MTP) de Qwen para acelerar la decodificación.

El modelo resuelve el problema de disponer de un único artefacto que cubre varios arneses de agente de código sin reentrenamiento adicional: el super-adapter fusiona los tres especialistas con peso ½ cada uno. Según los datos publicados por el autor, mejora el modelo base tanto con thinking activado (pass@1 medio de 55,5% a 63,5%) como desactivado (39,5% a 49,0%) en SWE-bench Pro y Terminal-Bench 2.1, con reducciones de entre el 19% y el 73% en el número de llamadas a herramientas por tarea.

La ficha corresponde a la cuantización GGUF publicada por netprojects, con 27.320.697.856 parámetros reales, licencia Apache 2.0 y un repositorio de 191 GB que incluye múltiples niveles de cuantización, un proyector multimodal mmproj para entrada de imagen y builds MLX para macOS. Es relevante para quien necesite desplegar localmente un agente de código multimodal con requisitos de memoria ajustables desde 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B) con capa de multi-token prediction (MTP); adaptador LoRA fusionado |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K_XL, Q3_K_XL, Q3_K_M, IQ3_XXS, IQ4_XS, Q4_K_M, Q4_K_XL, Q5_K_M, Q6_K, Q8_0; builds MLX de 2,5, 3, 4, 6 y 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, LM Studio, Ollama); MLX en repositorios separados |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B (revisión `3756181`) y le fusiona el super-adapter de harness-hub (revisión `adb00e9`), un LoRA que agrega tres especialistas de reinforcement learning entrenados sobre tres arneses de agente distintos: pi y Hermes Agent en el paso 160 y OpenCode en el paso 150. La fusión se realiza con peso ½ por especialista y sin entrenamiento adicional posterior. La conversión a GGUF conserva la capa MTP de Qwen en todos los ficheros, lo que permite a llama-server emplearla para decodificación más rápida.

El pipeline declarado es image-text-to-text: el repositorio incluye `mmproj-Qwen3.8-27B-super-adapter-F16.gguf` (0,9 GB), un proyector multimodal que habilita la entrada de imágenes. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO más allá del RL de los especialistas. Las cuantizaciones se han generado con imatrix, y el autor publica métricas de fidelidad frente al original: Q8_0 conserva el 99,7% del siguiente token con divergencia KL de 0,0003, Q6_K el 98,9% con KL 0,0032 y Q4_K_XL el 96,8% con KL 0,0075.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo thinking activable y desactivable.
- Programación y resolución de tareas de ingeniería de software en entornos reales (SWE-bench Pro, Terminal-Bench 2.1).
- Uso de herramientas y llamadas a funciones dentro de arneses de agente (pi, Hermes Agent, OpenCode).
- Razonamiento multi-paso orientado a agentes autónomos de código.
- Entrada de imágenes mediante el proyector mmproj (pipeline image-text-to-text).
- Decodificación acelerada mediante la capa MTP en llama-server.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de código autónomo en local: el modelo puede ejecutar tareas de reparación de bugs y edición multiarchivo en un repositorio, con un rendimiento publicado de 66,7% pass@1 en SWE-bench Pro bajo OpenCode y 60,8% bajo Hermes Agent, lo que lo hace adecuado para pipelines de integración continua que requieran un agente sin dependencia de API externa.
- Automatización de terminal y operaciones: con 55,5% a 63,5% de pass@1 medio en Terminal-Bench 2.1 y entre un 19% y un 48% menos de llamadas a herramientas, encaja en flujos que ejecutan comandos y validan resultados de forma iterativa.
- Asistente de programación en IDE con contexto de imágenes: gracias al proyector mmproj, puede recibir capturas de pantalla de errores, diagramas de arquitectura o interfaces y razonar sobre ellos junto al código.
- Despliegue en estaciones de trabajo con 16-24 GB: las cuantizaciones Q2_K_XL (9,9 GB) y Q3_K_XL (13,1 GB) permiten ejecutar el agente en portátiles y equipos consumer, útil para desarrolladores que trabajan sin conexión.
- Servidor de inferencia compartido: con Q6_K (22,4 GB) o Q8_0 (29,0 GB) en una GPU de 48-64 GB, se puede servir un agente de código para un equipo pequeño mediante llama-server, aprovechando MTP para reducir latencia de decodificación.
- Evaluación comparativa de arneses: al integrar tres especialistas en un solo artefacto, sirve para probar el mismo modelo con pi, Hermes Agent y OpenCode y medir diferencias de comportamiento sin cambiar de pesos.
- Prototipado multimodal sobre macOS: los builds MLX de 2,5 a 8 bits permiten ejecutar el modelo con memoria unificada en Apple Silicon para tareas de análisis de imagen y texto combinados.

## Benchmarks y rendimiento

Datos publicados por el autor del adaptador (pass@1 medio sobre SWE-bench Pro hard 51 y Terminal-Bench 2.1, comparando con el modelo base al mismo esfuerzo de razonamiento):

| Modo | Modelo base | Super-adapter | Mejora |
|---|---|---|---|
| Thinking on | 55,5% | 63,5% | +8,0 puntos |
| Thinking off | 39,5% | 49,0% | +9,5 puntos |

| Arnés | SWE-bench Pro (base → adaptado) |
|---|---|
| OpenCode | 47,1% → 66,7% |
| Hermes Agent | 45,1% → 60,8% |

Con thinking activado, el adaptador supera al base en cinco de seis pares arnés-benchmark y empata en el sexto, con entre un 19% y un 48% menos de llamadas a herramientas por tarea. Con thinking desactivado supera al base en los seis pares, con entre un 53% y un 73% menos de llamadas a herramientas. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales.

## Requisitos de hardware

- VRAM/memoria recomendada según cuantización: 16 GB para Q2_K_XL (9,9 GB), 24 GB para Q3_K_XL (13,1 GB), 32 GB para Q4_K_XL (17,7 GB), 48 GB para Q6_K (22,4 GB, recomendado) y 64 GB o más para Q8_0 (29,0 GB).
- Cuantizaciones intermedias: Q4_K_M (16,8 GB), IQ4_XS (15,3 GB), Q5_K_M (19,5 GB), Q3_K_M (13,5 GB) e IQ3_XXS, todas en el mismo repositorio.
- Entrada de imagen: añadir 0,9 GB para `mmproj-Qwen3.8-27B-super-adapter-F16.gguf`.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por capacidad de memoria encajan A100 40/80 GB, H100 y RTX 4090 (24 GB, suficiente para Q3_K_XL y Q4_K_XL con margen limitado).
- Consumer GPU: sí, en tarjetas de 16 GB o más con las cuantizaciones bajas; en 24 GB caben Q3_K_XL y Q4_K_XL.
- Apple Silicon: builds MLX de 2,5, 3, 4, 6 y 8 bits en repositorios separados; para 16 GB el autor sugiere `sudo sysctl iogpu.wired_limit_mb=12800` y limitar los prompts a unos pocos miles de tokens.
- Opciones de despliegue: llama.cpp (llama-server, con soporte MTP), LM Studio y Ollama.
- Latencia y throughput: no disponibles; el autor solo indica que la capa MTP permite una decodificación más rápida en llama-server.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-super-adapter GGUF | 27,3B | no disponible | 63,5% pass@1 medio (thinking on) | Apache 2.0 | GGUF y MLX en Hugging Face |
| Qwen3.8-27B (base) | no disponible | no disponible | 55,5% pass@1 medio (thinking on) | no disponible | Hugging Face (Qwen) |
| Qwen3.8-27B-pi-adapted GGUF | no disponible | no disponible | no disponible | no disponible | GGUF en NetProjects |
| Qwen3.8-27B-hermes-adapted GGUF | no disponible | no disponible | no disponible | no disponible | GGUF en NetProjects |
| Qwen3.8-27B-opencode-adapted GGUF | no disponible | no disponible | no disponible | no disponible | GGUF en NetProjects |

Los tres builds especializados por arnés están pensados para uso con un único arnés y thinking desactivado, según recomienda harness-hub; el super-adapter es la opción cuando se quiere cubrir varios arneses o el modo thinking.

## Limitaciones y advertencias

- Los benchmarks publicados corresponden al adaptador original de harness-hub; no se han verificado de forma independiente sobre esta conversión GGUF concreta.
- Las cuantizaciones bajas degradan la fidelidad: Q3_K_XL conserva el 91,5% del siguiente token y Q3_K_M el 90,6%, con divergencias KL de 0,0396 y 0,0628 respectivamente, lo que puede afectar a tareas de agente sensibles a errores.
- En equipos de 16 GB el autor advierte de que hay que cerrar otras aplicaciones y mantener los prompts en unos pocos miles de tokens.
- No se detallan sesgos conocidos, idiomas soportados ni longitud de contexto en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje; en tareas de agente de código conviene validar los cambios con tests automatizados.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base Qwen3.8-27B y el adaptador de harness-hub pueden tener condiciones propias que deben verificarse antes de producción.
- El rendimiento depende fuertemente del arnés utilizado; los resultados con thinking desactivado varían entre especialistas.
- No se han publicado datos de latencia ni throughput para esta conversión.

## Enlaces

- Repositorio GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-GGUF
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Build pi: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF
- Build Hermes Agent: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-GGUF
- Build OpenCode: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF
- Build MLX 2.5-bit: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-2.5bit
- Build MLX 3-bit: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-3bit
- Build MLX 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-4bit
- Build MLX 6-bit: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-6bit
- Build MLX 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-8bit
- Arnés pi: https://github.com/earendil-works/pi
- Arnés Hermes Agent: https://github.com/NousResearch/hermes-agent
- Arnés OpenCode: https://opencode.ai
