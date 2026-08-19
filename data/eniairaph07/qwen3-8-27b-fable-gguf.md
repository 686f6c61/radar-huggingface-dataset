# eniairaph07/Qwen3.8-27b-FABLE-GGUF

## Resumen

Qwen3.8-27b-FABLE es un modelo de lenguaje optimizado mediante aprendizaje por refuerzo (RL) para tareas de agente autónomo y codificación en terminal, desarrollado por el usuario eniairaph07 a partir del modelo base Qwen/Qwen3.8-27B de Alibaba. Este fine-tuning utiliza Prime-RL GRPO (Group Relative Policy Optimization) con verificación de ejecución en contenedores y llamadas a herramientas estrictas en formato XML, lo que lo convierte en una política especializada para entornos de línea de comandos y flujos de trabajo agénticos.

El modelo base Qwen3.8-27B es un LLM denso multimodal (visión-lenguaje) de 26.9 mil millones de parámetros, con una ventana de contexto de 262.144 tokens y licencia Apache 2.0. La versión FABLE se distribuye en formato GGUF, lo que permite su ejecución eficiente en CPU y GPU mediante llama.cpp, Ollama y otras herramientas compatibles. Su relevancia radica en ofrecer un rendimiento competitivo en benchmarks de codificación agéntica (Terminal Bench 2.1, SWE-bench Pro) con un tamaño que cabe en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-lenguaje) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (segun guia del modelo base) |
| Tipos de cuantizacion | No disponibles (repo GGUF, se asume Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | No disponibles (el modelo base soporta multiples idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con atención completa, diseñado por Alibaba para tareas de codificación, razonamiento y automatización de oficina. Incorpora capacidades multimodales nativas (entrada de imagen y vídeo) y una ventana de contexto extendida de 262K tokens. El fine-tuning FABLE se realizó mediante aprendizaje por refuerzo multi-turno con Prime-RL GRPO, donde el modelo aprende a interactuar con un entorno de terminal real a través de llamadas a herramientas en XML, con verificación de ejecución dentro de contenedores aislados. Esto permite que la política optimice no solo la generación de texto, sino la secuencia completa de acciones necesarias para completar tareas de codificación a nivel de repositorio.

No se han publicado detalles sobre el volumen de datos de entrenamiento ni la composición del dataset de RL. El proceso se describe como "multi-turn reinforcement learning" con verificación en contenedor, lo que sugiere un entrenamiento orientado a tareas de terminal y manipulación de archivos, similar a los entornos de Terminal-Bench.

## Capacidades

- Generacion de texto y razonamiento avanzado, heredado del modelo base Qwen3.8-27B.
- Codificacion a nivel de repositorio: capaz de generar, modificar y depurar código en proyectos completos.
- Uso de herramientas (tool calling) mediante formato XML estricto, optimizado para entornos de terminal.
- Ejecucion de comandos en terminal y manejo de salidas, feedback y errores en tiempo real.
- Razonamiento multi-paso y planificacion de tareas agénticas de larga duracion.
- Capacidades multimodales (vision) heredadas del modelo base: entrada de imagenes y video para contexto visual.
- Soporte para agentes autonomos en entornos de desarrollo integrados (IDE) o CI/CD.
- Multilingue (probablemente, aunque no se especifica en la ficha del autor).

## Casos de uso

- Automatizacion de tareas de desarrollo en terminal: el modelo puede ejecutar comandos, leer salidas, corregir errores y completar tareas como instalar dependencias, ejecutar tests o refactorizar código, todo de forma autónoma.
- Generacion de código en producción: gracias a su fine-tuning con verificación en contenedor, puede generar código que se ejecuta correctamente en entornos reales, integrándose en pipelines de CI/CD para autocompletar tickets o resolver issues.
- Asistente de programacion en IDE: con su soporte de tool calling y contexto largo (262K tokens), puede manejar repositorios enteros como contexto y sugerir cambios coherentes con la estructura del proyecto.
- Agente de soporte tecnico automatizado: puede gestionar conversaciones multi-turno con usuarios, ejecutar comandos de diagnostico y proponer soluciones, reduciendo la carga de los equipos de soporte.
- Automatizacion de operaciones de infraestructura: el modelo puede interactuar con shells remotas, gestionar archivos de configuración y ejecutar scripts de mantenimiento de forma segura en contenedores.
- Investigacion y experimentacion en RL: el modelo sirve como punto de partida para estudiar tecnicas de optimización de políticas agénticas (Prime-RL, GRPO) y verificación de ejecución, siendo util para la comunidad académica.

## Benchmarks y rendimiento

Segun la model card del autor, se reportan los siguientes resultados (valores numericos extraidos de la tabla):

| Benchmark | Qwen3.8-27B-FABLE | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | 74.2 | 63.4 | 64.0 | 51.7 | **78.2** |
| SWE-bench Pro | **61.9** | 53.5 | 57.6 | 51.2 | 53.4 |
| NL2Repo-Bench | 42.3 | 36.2 | 41.1 | -- | **47.6** |
| DeepSWE 1.1 | No completado en la informacion | -- | -- | -- | -- |

Nota: los datos de DeepSWE 1.1 estan incompletos en la tabla proporcionada. No se dispone de resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M (~16 GB), Q5_K_M (~18 GB) o Q8_0 (~27 GB) para los pesos. La memoria total depende de la longitud de contexto y del batch.
- GPU recomendadas: RTX 3090 (24 GB) o RTX 4090 (24 GB) pueden ejecutar la version Q4_K_M con comodidad. Para Q8_0 se requiere una GPU con al menos 32 GB (A100 40GB, H100 80GB) o ejecucion en CPU con suficiente RAM.
- Si cabe en consumer GPU: si, con cuantizacion Q4_K_M o Q5_K_M en GPUs de 24 GB. En GPUs de 16 GB (RTX 4080, 4070 Ti) puede ser ajustado con contextos cortos.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI (con conversion), o el runtime de Hugging Face compatible con endpoints.
- Latencia y throughput: no disponibles en la informacion. Se estima una velocidad de generacion de 20-40 tokens/s en RTX 4090 con Q4_K_M, dependiendo de la implementacion.

## Comparativa con modelos similares

La siguiente tabla compara Qwen3.8-27B-FABLE con los modelos incluidos en la tabla de benchmarks del autor, aunque no se dispone de especificaciones detalladas de estos modelos alternativos (parametros, contexto, licencia):

| Modelo | Parametros | Contexto | Licencia | Rendimiento en Terminal Bench 2.1 | Rendimiento en SWE-bench Pro |
|---|---|---|---|---|---|
| Qwen3.8-27B-FABLE | 26.9 B | 262K | Apache 2.0 | 74.2 | 61.9 |
| Qwen3.6-27B | ~27 B (no confirmado) | No disponible | Apache 2.0 (probable) | 63.4 | 53.5 |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | 64.0 | 57.6 |
| Muse Glimmer-30B | ~30 B | No disponible | No disponible | 51.7 | 51.2 |
| Opus4.6 Max | No disponible | No disponible | No disponible | 78.2 | 53.4 |

Nota: los datos de los modelos comparados provienen exclusivamente de la tabla de la model card. No se dispone de informacion adicional sobre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al ser un fine-tuning de Qwen3.8-27B, puede heredar los sesgos del modelo base (no detallados).
- Riesgo de alucinacion: como todo LLM, puede generar comandos o código incorrecto, especialmente en tareas complejas de terminal. La verificacion en contenedor durante el entrenamiento reduce este riesgo, pero no lo elimina.
- Tendencia a sobrepensar: segun analisis de Simon Willison, el modelo base Qwen3.8-27B tiende a generar razonamientos excesivamente largos antes de responder, lo que puede aumentar la latencia y el coste computacional en tareas simples.
- Limitaciones de contexto: aunque el contexto es de 262K tokens, el rendimiento puede degradarse con contextos muy largos o con multiples turnos de interaccion en terminal.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo es un fine-tuning de un tercero (eniairaph07) y no hay garantias de soporte ni mantenimiento.
- Caveat de produccion: al ser un modelo cuantizado (GGUF), puede haber perdida de precision en tareas de codigo complejo comparado con la version en punto flotante. Se recomienda validar en un entorno de pruebas antes de desplegar en produccion.
- No se dispone de informacion sobre los idiomas soportados ni sobre la calidad de generacion en español u otros idiomas distintos del ingles.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/eniairaph07/Qwen3.8-27b-FABLE-GGUF
- Repositorio del modelo base Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia completa sobre Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Analisis de Simon Willison sobre Qwen3.8-27B: https://simonwillison.net/2026/Aug/16/qwen-38-27b/
- Pagina de Qwen3.8 27B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Repositorio de pasos de entrenamiento (SFT/RL): https://huggingface.co/eniairaph07/qwen3.8-27b-fable5-rl-sft-steps
