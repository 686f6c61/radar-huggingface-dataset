# netprojects/DaisyRose-27B-LayerFit-MLX-2.5bit

## Resumen

DaisyRose-27B-LayerFit-MLX-2.5bit es una cuantización de 2,5 bits del modelo RadixArk/DaisyRose-27B, un ajuste por RL agéntico de Qwen3.8-27B, publicada por NetProjects para su ejecución en Apple Silicon mediante la librería MLX. El modelo conserva la torre de visión en bf16 y el pipeline image-text-to-text, de modo que mantiene capacidades multimodales pese a la compresión agresiva de los pesos del lenguaje.

La innovación principal es LayerFit, una técnica de búsqueda por capas que asigna un número distinto de bits a cada bloque (MLP, atención, atención lineal, embeddings y cabeza de salida) según su sensibilidad a la cuantización, en lugar de aplicar una tasa uniforme. Según la model card, esto eleva la concordancia top-1 con el modelo bf16 del 76,0 % al 83,4 % y reduce la divergencia KL un 52 % respecto a una cuantización estándar de 2,5 bits del mismo tamaño.

El resultado ocupa 11,5 GB en disco y está pensado para Macs de 16 GB de memoria unificada, un segmento donde un modelo de 27 781 millones de parámetros en precisión completa sería inviable. Incluye además la cabeza de predicción multi-token (MTP) de Qwen3.8-27B cuantizada a 4 bits para acelerar la decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5 / Qwen3.8-27B) con atención lineal y torre de visión; pesos del lenguaje cuantizados por capas |
| Parametros totales | 27 781 427 952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2,5 bits por capa (receta LayerFit), torre de visión en bf16, cabeza MTP en 4 bits |
| Idiomas soportados | no disponible (la model card menciona pruebas en inglés, otros idiomas, código, tool calls y matemáticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 11,5 GB en disco |

## Arquitectura y entrenamiento

El modelo base es RadixArk/DaisyRose-27B, descrito por el autor como un ajuste por RL agéntico de Qwen3.8-27B. La arquitectura subyacente es un transformer de la familia Qwen3.5 con atención lineal en parte de sus bloques y una torre de visión que permite entrada image-text-to-text. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el pipeline exacto de RLHF/DPO empleado por RadixArk.

La aportación técnica de esta build es LayerFit: un procedimiento que mide la degradación de cada componente (MLP, atención, atención lineal, embeddings y cabeza de salida) a baja precisión y distribuye un presupuesto de bits fijo donde más ayuda. La receta exacta está publicada en `layerfit-recipe.json` y se validó originalmente sobre el modelo base Qwen3.8-27B. Se conserva la cabeza de predicción multi-token (MTP) a 4 bits, lo que habilita decodificación especulativa con `--draft-kind mtp` en mlx-vlm.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo thinking (la model card reporta 2/2 en pruebas de thinking).
- Generación de código (3/3 en pruebas de coding según el autor).
- Tool calling / function calling (prueba superada según la model card).
- Matemáticas: GSM8K-50 con thinking desactivado, 45/50.
- Entrada de imágenes: pipeline image-text-to-text con torre de visión en bf16.
- Decodificación especulativa mediante la cabeza MTP incluida.
- Capacidades multilingües: no verificadas de forma independiente; el harness de LayerFit incluyó pasajes en varios idiomas.

## Casos de uso

- Asistente local en Mac de 16 GB: el modelo cabe en 11,5 GB y permite conversaciones multi-turno sin conexión, útil para entornos con requisitos de privacidad.
- Descripción y análisis de imágenes: al conservar la torre de visión en bf16, puede procesar fotos, capturas o diagramas y responder preguntas sobre ellos con mlx-vlm.
- Generación de código en local: soporta tool calling y generación de funciones; adecuado para autocompletado o scripting asistido en un portátil Apple Silicon.
- Automatización de tareas agénticas: el ajuste RL agéntico del modelo base y el soporte de tool calling permiten encadenar llamadas a herramientas en flujos multi-paso.
- Razonamiento matemático asistido: con 45/50 en GSM8K-50 (thinking off), sirve para resolver problemas aritméticos y de lógica de dificultad media en local.
- Prototipado y evaluación de cuantizaciones: la receta LayerFit publicada y los artefactos permiten reproducir y comparar el impacto de la compresión por capas frente a cuantizaciones uniformes.
- Inferencia acelerada en dispositivos: el uso de la cabeza MTP como draft model reduce la latencia en generación de texto largo en Macs modestos.

## Benchmarks y rendimiento

| Prueba | Resultado | Contexto |
|---|---|---|
| Concordancia top-1 con bf16 (LayerFit 2.5-bit) | 83,4 % | Harness del autor, pesos de lenguaje |
| Concordancia top-1 con bf16 (2.5-bit estándar) | 76,0 % | Misma prueba, cuantización uniforme |
| Divergencia KL (LayerFit 2.5-bit) | 0,1879 | 52 % inferior a la estándar |
| Divergencia KL (2.5-bit estándar) | 0,3896 | Referencia |
| GSM8K-50 (thinking off) | 45/50 | Build de 2,5 bits |
| Coding | 3/3 | Build de 2,5 bits |
| Tool call | pass | Build de 2,5 bits |
| Thinking | 2/2 | Build de 2,5 bits |

No se han publicado en la información disponible resultados de MMLU, HumanEval u otros benchmarks estándar del modelo base ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM/memoria unificada: 11,5 GB de pesos; el autor recomienda Macs de 16 GB como configuración "stretch", reservando espacio para macOS y prompts largos.
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada de 16 GB o superior; no está pensado para GPUs NVIDIA.
- Cabe en consumer hardware: sí, en Macs de 16 GB (con precauciones) y con holgura en 24, 32 y 48 GB.
- Ajuste recomendado: `sudo sysctl iogpu.wired_limit_mb=12800` para permitir que la GPU use más memoria, cerrando otras aplicaciones y limitando el prompt a unos miles de tokens.
- Opciones de despliegue: mlx-lm y mlx-vlm (comandos incluidos en la model card), LM Studio y cualquier runtime compatible con MLX estándar.
- Latencia y throughput: no disponibles; la cabeza MTP a 4 bits está pensada para acelerar la decodificación especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaisyRose-27B-LayerFit-MLX-2.5bit | 27,78 B | no disponible | 2,5 bits LayerFit, 11,5 GB | Apache-2.0 | Hugging Face (MLX) |
| DaisyRose-27B-LayerFit-MLX-3bit | 27,78 B | no disponible | 3 bits, 13,1 GB | Apache-2.0 | Hugging Face (MLX) |
| DaisyRose-27B-LayerFit-MLX-4bit | 27,78 B | no disponible | 4 bits, 16,5 GB | Apache-2.0 | Hugging Face (MLX) |
| RadixArk/DaisyRose-27B (base) | 27,78 B | no disponible | bf16 | Apache-2.0 | Hugging Face |

No se dispone de datos para comparar con modelos de otros fabricantes de tamaño o tarea equivalentes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2,5 bits degrada la fidelidad respecto al bf16: la concordancia top-1 medida es del 83,4 %, no del 100 %.
- El propio autor califica la build para 16 GB como "stretch": requiere cerrar aplicaciones y limitar la longitud del prompt; no es adecuada para contextos muy largos en ese hardware.
- La torre de visión se validó en la build de 4 bits, no específicamente en esta; la model card indica que es la misma.
- Los resultados de GSM8K, coding, tool call y thinking son pruebas internas del autor con muestras pequeñas (50, 3 y 2 ítems), no benchmarks completos.
- No se detallan sesgos conocidos, riesgos de alucinación específicos ni limitaciones idiomáticas del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar LICENSE y NOTICE; LayerFit es marca registrada de NetProjects.
- El autor declara no estar afiliado al publicador de RadixArk/DaisyRose-27B.
- Solo es ejecutable en Apple Silicon mediante MLX; no hay pesos GGUF ni compatibilidad con vLLM, TGI o llama.cpp en esta build.

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/DaisyRose-27B-LayerFit-MLX-2.5bit
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Build de 3 bits: https://huggingface.co/netprojects/DaisyRose-27B-LayerFit-MLX-3bit
- Build de 4 bits: https://huggingface.co/netprojects/DaisyRose-27B-LayerFit-MLX-4bit
- Build de 6 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-8bit
- Otros modelos del autor: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
