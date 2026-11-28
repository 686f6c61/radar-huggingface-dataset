# netprojects/Qwen3.8-27B-pi-adapted-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-GGUF es una cuantización en formato GGUF del modelo Qwen3.8-27B de Alibaba, adaptado mediante un LoRA entrenado con aprendizaje por refuerzo (AsyncGRPO en TRL) por harness-hub para funcionar como motor del agente de programación pi en tareas de ingeniería de software y terminal. El repositorio lo publica netprojects y ofrece una colección de ficheros listos para ejecutar con llama.cpp, LM Studio y Ollama, sin necesidad de aplicar el adaptador con `--lora`.

El modelo conserva la capa de predicción multi-token (MTP) de Qwen en todos los ficheros, lo que permite a llama-server acelerar la decodificación mediante `--spec-type draft-mtp`. Además, incluye un proyector multimodal (`mmproj-Qwen3.8-27B-pi-F16.gguf`) que habilita la entrada de imágenes, por lo que la pipeline declarada es image-text-to-text.

Con 27.320.697.856 parámetros totales (unos 27,3 mil millones) y licencia Apache 2.0, el modelo resulta relevante ahora porque demuestra que un ajuste por RL orientado a agentes puede mejorar sustancialmente el rendimiento en tareas de terminal y resolución de issues reales, y que ese comportamiento se puede distribuir en cuantizaciones que caben en equipos de consumo con 16 GB de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B) con capa de predicción multi-token (MTP) y adaptador multimodal para entrada de imagen |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 65.536 tokens en el ejemplo de llama-server (`-c 65536`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_XL, Q4_K_M, IQ4_XS, Q3_K_XL, Q3_K_M, IQ3_XXS, Q2_K_XL, IQ2_M; además builds MLX de 2,5, 3, 4, 6, 8 bits y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); también MLX en repositorios separados |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer de aproximadamente 27,3 mil millones de parámetros, al que se le ha fusionado el adaptador LoRA de harness-hub (revisión `e786f84`) sobre la revisión `3756181` del modelo base. La adaptación se entrenó con aprendizaje por refuerzo usando AsyncGRPO en TRL, con el objetivo de convertir el modelo en el motor del agente de programación pi en tareas de ingeniería de software y de terminal. Según la model card, el adaptador se entrenó y evaluó con el modo thinking desactivado.

Todos los ficheros GGUF conservan la capa MTP original de Qwen, que llama-server puede aprovechar para decodificación especulativa con `--spec-type draft-mtp`. La conversión a GGUF incluye calibración con imatrix (etiqueta `imatrix`) y mezclas por tensor en las variantes `_XL`, que mejoran la fidelidad respecto al original en tamaños reducidos: por ejemplo, Q4_K_XL (17,7 GB) conserva el 96,6 % del siguiente token con divergencia KL de 0,0075, mientras que Q4_K_M (16,8 GB) baja al 94,2 % con KL de 0,0595. La entrada de imagen se habilita con el proyector `mmproj-Qwen3.8-27B-pi-F16.gguf` de 0,9 GB.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con Jinja.
- Ejecución de tareas de agente en terminal: el adaptador se entrenó específicamente para el agente pi en entornos de shell.
- Resolución de problemas de ingeniería de software: la model card reporta mejoras en SWE-bench Pro y Terminal-Bench frente al modelo base.
- Uso de herramientas (tool calling / function calling): el agente pi depende de llamadas a herramientas, y el entrenamiento redujo el número de llamadas por tarea entre un 55 % y un 64 %.
- Entrada de imagen (image-text-to-text) mediante el proyector mmproj, lo que permite tareas que combinan texto e imágenes.
- Decodificación especulativa nativa mediante la capa MTP incluida en todos los ficheros.
- Modo thinking configurable: la plantilla admite `enable_thinking`, aunque el adaptador fue entrenado con thinking desactivado.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de programación en terminal: desplegar el modelo con llama-server y el agente pi para automatizar tareas de shell, edición de ficheros y ejecución de comandos, aprovechando que el adaptador fue entrenado con RL sobre este mismo agente y reduce las llamadas a herramientas por tarea.
- Resolución automática de issues en repositorios: usar el modelo como backend de un pipeline que recibe un issue y un checkout del repositorio, genera un parche y lo valida con tests; la mejora reportada en SWE-bench Pro (29,4 % a 62,7 %) lo hace adecuado para este escenario.
- Asistente de CI/CD: integrar el modelo en un servidor llama-server con contexto de 65.536 tokens para analizar logs de build, proponer correcciones y abrir pull requests de forma autónoma.
- Desarrollo local en portátil: la cuantización Q2_K_XL (9,9 GB) o Q3_K_XL (13,1 GB) permite ejecutar el modelo en equipos con 16 o 24 GB de memoria unificada o VRAM, útil para prototipado sin conexión.
- Automatización de tareas de administración de sistemas: el modelo puede interpretar instrucciones en lenguaje natural y traducirlas a comandos de terminal, con la ventaja de que fue ajustado sobre trayectorias reales de terminal.
- Análisis de capturas y diagramas en flujos de desarrollo: gracias al proyector mmproj, se pueden adjuntar imágenes (por ejemplo, errores en pantalla o diagramas de arquitectura) junto a la consulta de texto.
- Servicio de inferencia self-hosted: con licencia Apache 2.0 y ficheros GGUF, se puede desplegar en infraestructura propia con llama.cpp, LM Studio u Ollama sin dependencia de APIs externas.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los del adaptador original, medidos bajo el agente pi con thinking desactivado:

| Benchmark | Modelo base | Qwen3.8-27B-pi-adapted |
|---|---|---|
| Terminal-Bench 2.1 | 39,5 % | 55,8 % |
| SWE-bench Pro (hard 51) | 29,4 % | 62,7 % |
| Llamadas a herramientas por tarea | referencia | 55-64 % menos |

No se han publicado resultados de benchmarks para las cuantizaciones GGUF específicas en la información disponible. La model card sí incluye métricas de fidelidad de cuantización (porcentaje de mismo siguiente token y divergencia KL) para cada fichero.

## Requisitos de hardware

- VRAM/memoria estimada según fichero: Q2_K_XL 9,9 GB; IQ2_M 10,2 GB; IQ3_XXS 10,9 GB; Q3_K_XL 13,1 GB; Q3_K_M 13,5 GB; IQ4_XS 15,3 GB; Q4_K_M 16,8 GB; Q4_K_XL 17,7 GB; Q5_K_M 19,5 GB; Q6_K 22,4 GB (recomendado); Q8_0 29,0 GB. El proyector de imagen añade 0,9 GB.
- Guía de memoria del autor: 16 GB para Q2_K_XL, 24 GB para Q3_K_XL, 32 GB para Q4_K_XL, 48 GB para Q6_K y 64 GB o más para Q8_0.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible; el autor organiza la guía por memoria total del sistema, no por GPU.
- Viabilidad en GPU de consumo: sí; las variantes Q2 a Q4 caben en tarjetas de 16 a 24 GB de VRAM, y en Mac con memoria unificada se puede ajustar el límite con `sudo sysctl iogpu.wired_limit_mb=12800` para el caso de 16 GB.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio y Ollama para los GGUF; builds MLX para Apple Silicon; el autor menciona compatibilidad con endpoints.
- Latencia y throughput: no disponibles. La capa MTP con `--spec-type draft-mtp` está pensada para acelerar la decodificación, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted (este) | 27,3 mil millones | hasta 65.536 en el ejemplo de despliegue | Apache 2.0 | GGUF, MLX | Ajustado por RL para el agente pi; Terminal-Bench 2.1 55,8 %, SWE-bench Pro 62,7 % |
| Qwen3.8-27B (base) | 27,3 mil millones | no disponible | no disponible | safetensors (original) | Referencia de comparación del adaptador; Terminal-Bench 2.1 39,5 %, SWE-bench Pro 29,4 % |
| Otras cuantizaciones GGUF del mismo adaptador | 27,3 mil millones | hasta 65.536 | Apache 2.0 | GGUF | Mismos pesos con distinta fidelidad; Q8_0 al 99,2 % de mismo siguiente token |

No se dispone de datos de otros modelos comparables de la misma categoría (agentes de programación de ~27B) en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; la model card recomienda mantenerlo apagado (`enable_thinking: false`) para reproducir el comportamiento esperado.
- Las cuantizaciones de baja precisión degradan la fidelidad: Q2_K_XL conserva el 85,1 % del siguiente token con KL de 0,1308, e IQ2_M el 89,6 % con KL de 0,1715, lo que puede afectar a tareas de agente que requieren precisión.
- En equipos de 16 GB hay que cerrar otras aplicaciones y limitar los prompts a unos miles de tokens; el contexto completo de 65.536 tokens no es viable en esa configuración.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación del modelo base ni del adaptador.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador original antes de un uso comercial a gran escala.
- El rendimiento reportado en benchmarks corresponde al adaptador sin cuantizar bajo el agente pi; los resultados con GGUF pueden diferir.
- El repositorio ocupa 191 GB en total por incluir todas las variantes; es necesario descargar solo el fichero deseado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Agente pi: https://github.com/earendil-works/pi
- Builds MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-2.5bit · https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-3bit · https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit · https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit · https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit · https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
