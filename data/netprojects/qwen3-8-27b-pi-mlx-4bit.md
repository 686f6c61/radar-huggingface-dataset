# netprojects/Qwen3.8-27B-pi-MLX-4bit

## Resumen

Qwen3.8-27B-pi-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo Qwen3.8-27B, adaptado mediante un LoRA entrenado con aprendizaje por refuerzo (AsyncGRPO en TRL) por harness-hub para funcionar como motor del agente de programación pi. Este build concreto lo publica el usuario netprojects y está pensado exclusivamente para Apple Silicon, con las capas lineales cuantizadas a 4 bits en modo afín con grupo de 64. El resultado ocupa 16,3 GB y está orientado a Macs con 32 GB de memoria unificada.

El modelo resuelve un problema muy concreto: ejecutar tareas de ingeniería de software y de terminal de forma autónoma en hardware de consumo de Apple. Según los resultados publicados por el autor del adaptador, el modelo base bajo pi y con el modo "thinking" desactivado mejora Terminal-Bench 2.1 del 39,5 % al 55,8 % y SWE-bench Pro (hard 51) del 29,4 % al 62,7 %, con entre un 55 % y un 64 % menos de llamadas a herramientas por tarea.

La relevancia de esta ficha está en que es una de las pocas rutas prácticas para correr un modelo de 27.781.427.952 parámetros con capacidades de agente y visión en un Mac de 32 GB, a costa de una fidelidad frente a bf16 del 95,6 % en coincidencia de siguiente token y una divergencia KL de 0,0201. El pipeline declarado es image-text-to-text, incorpora el codificador visual de Qwen y la capa MTP (multi-token prediction), y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen3.5 (tag `qwen3_5`), con codificador visual y capa MTP; convertido a MLX con mlx-vlm |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits afín (affine), grupo 64, sobre capas lineales; existen builds MLX de 2.5, 3, 4, 6, 8 bits y bf16, además de GGUF (IQ2_M, Q3_K_M, Q4_K_M, Q6_K, Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`); también GGUF en el repo hermano |
| Tamano del repo | 16,3 GB |
| Modelo base | harness-hub/Qwen3.8-27B-pi-adapted (revision e786f84) sobre Qwen/Qwen3.8-27B (revision 3756181) |
| Metodo de adaptacion | LoRA entrenado con RL (AsyncGRPO en TRL), fusionado en el modelo base |

## Arquitectura y entrenamiento

La base es un transformer de la familia Qwen3.5 con 27.781.427.952 parámetros, al que se le añade un codificador visual (pipeline image-text-to-text) y una capa MTP de predicción multi-token. Sobre ese modelo, harness-hub entrenó un LoRA con aprendizaje por refuerzo usando AsyncGRPO en TRL, con el objetivo explícito de ser el modelo que hay detrás del agente de programación pi en tareas de ingeniería de software y de terminal. El adaptador se fusionó en los pesos del modelo base y después netprojects convirtió el conjunto a MLX con mlx-vlm, incluyendo el codificador visual y la capa MTP.

La cuantización aplicada en este build es de 4 bits en modo afín con grupo de 64 sobre las capas lineales. El autor publica métricas de fidelidad frente a bf16: 95,6 % de coincidencia en el siguiente token y KL de 0,0201, frente al 99,0 %/0,0015 del build de 6 bits y el 99,1 %/0,0004 del de 8 bits. El tokenizador y la plantilla de chat son los de harness-hub sin modificar, por lo que mantiene el mismo vocabulario y el mismo formato de llamadas a herramientas que Qwen3.8-27B (formato XML de Qwen, `<tool_call><function=...`). Un detalle relevante de entrenamiento: el adaptador se entrenó y evaluó con el modo "thinking" desactivado, y el autor recomienda mantenerlo así.

## Capacidades

- Generación de texto y razonamiento general, heredados de Qwen3.8-27B.
- Codificación y tareas de ingeniería de software: el adaptador está entrenado específicamente para resolución de bugs, edición de repositorios y ejecución de tareas de terminal.
- Uso de herramientas (tool calling / function calling) en el formato XML de Qwen, compatible con la API Chat Completions de OpenAI.
- Comportamiento agéntico multi-paso: pensado para bucles de agente con ejecución de comandos, lectura de ficheros y verificación de resultados, con menos llamadas a herramientas por tarea que el modelo base.
- Comprensión de imágenes: al incluir el codificador visual, puede responder preguntas sobre capturas de pantalla, errores de terminal o diagramas (vía mlx-vlm).
- Predicción multi-token (capa MTP) incluida en la conversión.
- Modo "thinking" configurable en la plantilla de chat, aunque el adaptador fue entrenado con él desactivado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Reparación automática de tests en local: lanzar `pi` contra el modelo servido con mlx-lm y pedirle que localice por qué fallan los tests de un módulo y aplique el parche, aprovechando el entrenamiento específico en Terminal-Bench y SWE-bench Pro.
- Agente de terminal en un Mac de 32 GB: ejecutar tareas de shell multi-paso (inspeccionar logs, reproducir un fallo, editar el fichero afectado) sin depender de la nube, gracias a que el build de 4 bits cabe en 16,3 GB.
- Asistente de CI/CD en estación de trabajo: integrar el servidor OpenAI-compatible de mlx-lm en scripts que revisen diffs, propongan parches y validen con la suite de tests antes de abrir una pull request.
- Análisis de capturas de terminal o de errores visuales: usar mlx-vlm para pasar una imagen de la pantalla y preguntar qué error muestra, útil en soporte técnico interno o depuración de entornos gráficos.
- Automatización de tareas de mantenimiento de repositorios: triaje de issues, generación de parches pequeños y actualización de dependencias con verificación posterior, apoyándose en el menor número de llamadas a herramientas por tarea.
- Prototipado de agentes de código sin coste de API: servir el modelo en localhost:8000 y apuntar frameworks compatibles con OpenAI Chat Completions para experimentar con prompts y bucles de agente antes de pasar a producción.
- Evaluación comparativa de cuantizaciones: usar este build de 4 bits frente al de 6 u 8 bits para medir la pérdida real de calidad en las tareas propias antes de decidir qué build desplegar.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del adaptador bajo el agente pi, con thinking desactivado, comparando el modelo adaptado con el base:

| Benchmark | Modelo base | Qwen3.8-27B-pi-adapted | Mejora |
|---|---|---|---|
| Terminal-Bench 2.1 | 39,5 % | 55,8 % | +16,3 puntos |
| SWE-bench Pro (hard 51) | 29,4 % | 62,7 % | +33,3 puntos |
| Llamadas a herramientas por tarea | referencia | 55-64 % menos | reduccion significativa |

Métricas de fidelidad de la cuantización frente a bf16 (publicadas por netprojects):

| Build | Tamano | Coincidencia siguiente token | KL vs bf16 |
|---|---|---|---|
| MLX 6 bits (recomendado) | 23,1 GB | 99,0 % | 0,0015 |
| MLX 8 bits | 30,0 GB | 99,1 % | 0,0004 |
| MLX 4 bits (este build) | 16,3 GB | 95,6 % | 0,0201 |
| MLX 3 bits | 13,8 GB | 91,4 % | 0,0884 |
| MLX 2.5 bits | 11,8 GB | 85,5 % | 0,2363 |
| MLX bf16 | 55,6 GB | referencia | referencia |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este build en la información disponible, ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria unificada: el build ocupa 16,3 GB en disco; el autor recomienda que la descarga no supere aproximadamente el 60 % de la memoria del equipo, lo que sitúa este build en Macs de 32 GB.
- Macs compatibles: 32 GB para este build de 4 bits; 24 GB para el de 3 bits (13,8 GB); 16 GB en modo "stretch" para el de 2.5 bits (11,8 GB) con `sudo sysctl iogpu.wired_limit_mb=12800`; 48 GB para el de 6 bits; 64 GB o más para el de 8 bits; 128 GB para bf16.
- GPU: exclusivamente Apple Silicon (MLX). No está pensado para CUDA; para GPUs NVIDIA habría que usar los builds GGUF del mismo autor (Q4_K_M de 16,8 GB, etc.).
- Despliegue: `mlx-lm>=0.32.2` con `mlx_lm.server` (API OpenAI-compatible en el puerto 8000), `mlx-vlm>=0.7.11` para entrada de imágenes, LM Studio (MLX) y, en la variante GGUF, llama.cpp, Ollama y LM Studio. Para el adaptador LoRA sin fusionar, `mlx-lm` con el repo MLX-adapter de 638 MB.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-pi-MLX-4bit | 27,78 mil M | no disponible | Agente de código, MLX 4 bits | Apache 2.0 | Hugging Face, 515 descargas |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | 27,78 mil M | no disponible | Mismo modelo, 6 bits (recomendado por el autor) | Apache 2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit | 27,78 mil M | no disponible | Mismo modelo, 8 bits, máxima fidelidad | Apache 2.0 | Hugging Face |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,78 mil M | no disponible | Adaptador LoRA original (638 MB en MLX) | Apache 2.0 | Hugging Face |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos de código de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de fidelidad por cuantización: 95,6 % de coincidencia de siguiente token y KL de 0,0201 frente a bf16; en tareas de código sensibles conviene valorar el build de 6 bits (99,0 %/0,0015) si hay memoria suficiente.
- Entrenado y evaluado con thinking desactivado: activar el modo "thinking" puede degradar el comportamiento esperado del adaptador.
- Requiere la API Chat Completions (`"api": "openai-completions"`), no la API Responses; usar la incorrecta rompe la integración con pi.
- Exclusivo de Apple Silicon: no hay soporte CUDA en este repo; para otras plataformas hay que recurrir a los builds GGUF.
- Idiomas soportados no declarados: no hay garantía documentada de calidad multilingüe más allá de lo que herede de Qwen3.8-27B.
- Longitud de contexto no documentada en la información disponible: planificar prompts largos sin conocer el límite real es arriesgado.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinación para este adaptador; al ser un modelo afinado con RL sobre tareas de terminal, puede sobreajustar sus estrategias a ese dominio.
- Procedencia: es una cuantización de terceros (netprojects) sobre un adaptador de terceros (harness-hub) sobre un modelo base de Qwen; la licencia Apache 2.0 se mantiene, pero la responsabilidad de validación en producción recae en quien despliega.
- Memoria ajustada: en Macs de 32 GB el margen es limitado; prompts muy largos o contexto extenso pueden provocar swapping.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-4bit
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX de 6 bits (recomendado): https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build MLX de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Build MLX de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-3bit
- Build MLX de 2.5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-2.5bit
- Build MLX bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
- Adaptador LoRA en MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter
- Builds GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Perfil del autor de las cuantizaciones: https://huggingface.co/netprojects
