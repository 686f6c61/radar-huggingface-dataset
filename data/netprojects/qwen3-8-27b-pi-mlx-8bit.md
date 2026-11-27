# netprojects/Qwen3.8-27B-pi-MLX-8bit

## Resumen

Qwen3.8-27B-pi-MLX-8bit es una compilación cuantizada a 8 bits del modelo Qwen3.8-27B (27.781.427.952 parámetros) adaptado mediante LoRA con aprendizaje por refuerzo para funcionar como motor del agente de programación pi. El autor de la adaptación es harness-hub, que entrenó el adaptador con AsyncGRPO en TRL sobre tareas de ingeniería de software y terminal; netprojects se encarga de fusionar el adaptador con el modelo base, convertirlo al formato MLX de Apple y publicar las distintas cuantizaciones. El resultado es un modelo multimodal (image-text-to-text) orientado a agentes de código que puede ejecutarse localmente en Apple Silicon.

La relevancia de esta build concreta reside en que es la variante de 8 bits, la más fiel al modelo bf16 de referencia dentro de la familia MLX publicada (99,1 % de coincidencia en el siguiente token y KL de 0,0004 frente a bf16), con un tamaño de 30,0 GB. Está pensada para Macs de 64 GB o superiores, donde ofrece el mejor equilibrio entre fidelidad numérica y consumo de memoria, a costa de un mayor peso en disco que la build de 6 bits (23,1 GB), que el autor recomienda como opción equilibrada.

El modelo conserva la arquitectura y el tokenizador de Qwen3.8-27B, incluye el codificador visual y la capa MTP (multi-token prediction) de Qwen, y mantiene el formato XML de tool calling del modelo original. La adaptación LoRA se entrenó y evaluó con el modo thinking desactivado, por lo que el autor recomienda mantenerlo así en producción. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.8-27B, con codificador visual y capa MTP; conversión a MLX con mlx-vlm |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits afín (affine, group 64) en capas lineales; la familia incluye además 6, 4, 3, 2.5 bits, bf16 y adaptador LoRA suelto |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal con codificador visual y una capa de multi-token prediction (MTP) que se conserva en la conversión a MLX. Sobre ese base, harness-hub entrenó un adaptador LoRA mediante aprendizaje por refuerzo con AsyncGRPO en TRL, orientado específicamente a tareas de ingeniería de software y uso de terminal como motor del agente pi. netprojects fusionó el adaptador (revisión e786f84) con el modelo base (revisión 3756181) y realizó la conversión con mlx-vlm, cuantizando las capas lineales a 8 bits en modo afín con grupo de 64.

La innovación principal no está en la arquitectura sino en el post-entrenamiento: el adaptador LoRA mejora de forma sustancial el comportamiento agéntico del modelo base, con incrementos publicados por harness-hub de 39,5 % a 55,8 % en Terminal-Bench 2.1 y de 29,4 % a 62,7 % en SWE-bench Pro (hard 51), además de una reducción del 55-64 % en el número de llamadas a herramientas por tarea. La cuantización a 8 bits preserva el 99,1 % de los siguientes tokens respecto a bf16 con una divergencia KL de 0,0004, lo que la convierte en la build MLX más cercana al modelo de referencia sin llegar a los 55,6 GB del bf16.

## Capacidades

- Generación de texto y razonamiento general, heredados de Qwen3.8-27B.
- Comprensión de imágenes y capturas de pantalla (pipeline image-text-to-text), útil para interpretar salidas de terminal o interfaces.
- Tool calling en formato XML de Qwen (`<tool_call><function=...`), compatible con el formato del modelo base.
- Comportamiento agéntico multi-paso optimizado para tareas de ingeniería de software y terminal mediante el adaptador pi.
- Ejecución de tareas de codificación: localización de bugs, edición de código y ejecución de comandos.
- Modo thinking disponible en el modelo base, aunque el adaptador se entrenó y evaluó con thinking desactivado y el autor recomienda mantenerlo apagado.
- Compatibilidad con la API Chat Completions de OpenAI a través del servidor de mlx-lm.

## Casos de uso

- Agente de codificación local en Mac: servir el modelo con `mlx_lm.server` y conectarlo al agente pi mediante la configuración de proveedor local, de modo que el desarrollador pueda lanzar tareas como "encuentra por qué fallan los tests de tests/test_parser.py y corrige el bug" sin enviar código a la nube.
- Resolución de incidencias en repositorios: el adaptador está entrenado para SWE-bench Pro y tareas de terminal, por lo que resulta adecuado para localizar la causa de fallos en suites de tests y proponer parches dentro de un flujo agéntico.
- Automatización de operaciones en terminal: interpretación de salidas de comandos y ejecución de secuencias de shell con menos llamadas a herramientas por tarea (55-64 % menos según el autor), lo que reduce latencia y coste en bucles agénticos.
- Análisis de capturas de pantalla de terminal o IDE: al ser image-text-to-text, puede recibir una imagen de la pantalla y describir el error mostrado, útil en asistentes de soporte para desarrolladores.
- Asistente de programación en local para equipos con requisitos de privacidad: al ejecutarse íntegramente en Apple Silicon con MLX, el código y los datos no salen del equipo, lo que encaja en entornos con restricciones de confidencialidad.
- Evaluación e investigación de agentes: sirve como banco de pruebas reproducible para estudiar el efecto del RL (AsyncGRPO) sobre el comportamiento agéntico, comparando esta build con el modelo base o con las cuantizaciones de 4 y 6 bits.
- Prototipado de pipelines de CI/CD asistidos por IA: integrable vía API compatible con OpenAI para tareas de revisión o corrección automática de parches en un runner con hardware Apple.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, bajo el agente pi y con thinking desactivado, comparando el modelo adaptado con el base:

| Benchmark | Modelo base | Adaptador pi |
|---|---|---|
| Terminal-Bench 2.1 | 39,5 % | 55,8 % |
| SWE-bench Pro (hard 51) | 29,4 % | 62,7 % |

Fidelidad de la cuantización respecto a bf16 (build MLX de 8 bits):

| Métrica | Valor |
|---|---|
| Coincidencia en el siguiente token | 99,1 % |
| Divergencia KL vs bf16 | 0,0004 |
| Tamaño | 30,0 GB |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales para esta build.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 30,0 GB de pesos; el autor recomienda un Mac de 64 GB o superior para esta build de 8 bits, dejando margen para macOS y prompts largos (la descarga debe ser como máximo ~60 % de la memoria).
- GPU recomendadas: Apple Silicon con memoria unificada de 64 GB o más (M-series Pro/Max/Ultra). Para 48 GB existe la build de 6 bits (23,1 GB, recomendada); para 32 GB la de 4 bits (16,3 GB); para 24 GB la de 3 bits (13,8 GB); para 16 GB la de 2,5 bits (11,8 GB) o el GGUF IQ2_M.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple Silicon; no está pensada para GPUs NVIDIA discretas, ya que el formato es MLX. Para CUDA habría que usar la variante GGUF del mismo autor.
- Opciones de despliegue: mlx-lm (servidor compatible con OpenAI, `mlx_lm.server`), mlx-vlm para inferencia con imágenes, LM Studio en modo MLX. Para llama.cpp, Ollama o LM Studio con GGUF, usar la build GGUF del autor (Q8_0, 29,0 GB).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-pi-MLX-8bit (esta ficha) | 27,8 B | no disponible | 8 bits MLX | 30,0 GB | Apache 2.0 | Agente de código en Apple Silicon, máxima fidelidad |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | 27,8 B | no disponible | 6 bits MLX | 23,1 GB | Apache 2.0 | Misma tarea, equilibrio tamaño/fidelidad (recomendada por el autor) |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit | 27,8 B | no disponible | 4 bits MLX | 16,3 GB | Apache 2.0 | Misma tarea, para Macs de 32 GB |
| netprojects/Qwen3.8-27B-pi-adapted-GGUF (Q8_0) | 27,8 B | no disponible | 8 bits GGUF | 29,0 GB | Apache 2.0 | Misma tarea, para llama.cpp/Ollama |
| Qwen/Qwen3.8-27B (base) | 27,8 B | no disponible | bf16 | no disponible | no disponible | Modelo base sin adaptación agéntica |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; activar el modo thinking puede degradar el comportamiento para el que fue optimizado.
- La API de referencia es Chat Completions, no Responses; usar la API incorrecta puede romper el formato de tool calling.
- Los benchmarks publicados (Terminal-Bench 2.1, SWE-bench Pro) corresponden al adaptador evaluado por harness-hub; no se han verificado de forma independiente en esta build cuantizada.
- La cuantización a 8 bits introduce una divergencia mínima pero no nula respecto a bf16 (KL 0,0004), que puede acumularse en tareas agénticas de muchos pasos.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos de esta build; se heredan los del modelo base Qwen3.8-27B.
- La longitud de contexto no está documentada en la información disponible; conviene consultar la ficha de Qwen3.8-27B antes de diseñar flujos con prompts largos.
- Requiere hardware Apple Silicon con memoria unificada suficiente; no es desplegable en GPUs NVIDIA sin recurrir a la variante GGUF.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base Qwen3.8-27B y del adaptador de harness-hub.
- El modelo está especializado en tareas de código y terminal; su rendimiento en dominios generales puede no ser óptimo en comparación con el modelo base sin adaptar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-8bit
- Modelo base adaptado: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits (recomendada): https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-3bit
- Build de 2,5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
- Adaptador LoRA para mlx-lm: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter
- Build GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Perfil del autor con el selector de builds para Mac: https://huggingface.co/netprojects
