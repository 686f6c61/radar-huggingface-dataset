# netprojects/DaisyRose-27B-MLX-3bit

## Resumen
DaisyRose-27B-MLX-3bit es una conversión cuantizada a 3 bits del modelo RadixArk/DaisyRose-27B, publicada por netprojects para su ejecución nativa en Apple Silicon mediante la librería MLX. DaisyRose-27B es la versión entrenada con aprendizaje por refuerzo (RL) de Qwen3.8-27B, desarrollada por RadixArk sobre unas 1.200 tareas de agente de horizonte largo, sin SFT ni destilación, conservando la arquitectura, tokenizador, plantilla de chat, comprensión de imágenes y contexto de 256K del modelo base.

Esta build concreta comprime la mayoría de las capas lineales a 3 bits (afín, grupo 64) y mantiene a 4 bits el embedding de tokens, la capa de salida y las capas más sensibles (v_proj y down_proj de las ocho primeras y últimas capas y de cada tercera capa intermedia), con una media de 3,91 bits por peso. El codificador visual se conserva en bfloat16 y la capa MTP (multi-token prediction) propia del modelo se cuantiza a 8 bits. El resultado es un paquete de 13,8 GB que cabe en Macs de 24 GB de memoria unificada.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de 28.489 millones de parámetros con modo de razonamiento, tool calling, visión y decodificación especulativa acelerada por MTP en hardware de consumo Apple, a costa de una fidelidad frente a bf16 del 92,1% en coincidencia del siguiente token.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) con capa MTP y codificador visual; conversión MLX |
| Parámetros totales | 28.489.216.752 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (heredada del modelo base) |
| Tipos de cuantización | 3-bit afín grupo 64 (mayoría de capas lineales), 4-bit (embedding, capa de salida, v_proj/down_proj sensibles), 8-bit (capa MTP), bfloat16 (codificador visual); media 3,91 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 13,8 GB |
| Librería | mlx (mlx-lm >= 0.32.2, mlx-vlm >= 0.7.11) |
| Modelo base | RadixArk/DaisyRose-27B (revisión 293a7a2) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen3.8-27B: un transformer denso con tokenizador, plantilla de chat y capacidad de comprensión de imágenes heredados íntegramente. DaisyRose-27B se entrena exclusivamente con RL sobre aproximadamente 1.200 tareas de agente de horizonte largo, sin supervisión fina ni destilación, lo que refuerza comportamiento agéntico y de razonamiento manteniendo la estructura del modelo base. Incluye una capa propia de multi-token prediction (MTP) que actúa como modelo borrador integrado para decodificación especulativa.

En esta conversión MLX, el codificador visual permanece en bfloat16, la capa MTP se cuantiza a 8 bits y el grueso de las capas lineales se comprime a 3 bits con cuantización afín de grupo 64, elevando a 4 bits las capas identificadas como sensibles. El autor verificó que todos los ficheros del modelo original coinciden con los hashes SHA-256 del Hub y que config y lista de tensores son idénticos a los de Qwen3.8-27B. La decodificación especulativa mediante MTP valida cada token borrador con el modelo completo; con decodificación greedy el texto coincide hasta un empate cercano, donde la comprobación por lotes puede redondear en sentido contrario.

## Capacidades
- Generación de texto y razonamiento con modo de pensamiento activado por defecto (el razonamiento aparece antes de `</think>`).
- Control de esfuerzo de razonamiento mediante `reasoning_effort` (`xhigh` por defecto, `medium`, `low`) y desactivación con `enable_thinking=False`.
- Comprensión de imágenes (pipeline image-text-to-text) con mlx-vlm.
- Tool calling / function calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), devuelto por el servidor de mlx-lm como `tool_calls` compatibles con OpenAI.
- Comportamiento agéntico y razonamiento multi-paso, reforzado por el entrenamiento RL sobre tareas de horizonte largo.
- Ejecución de tareas de terminal, ingeniería de software y resolución de problemas según los benchmarks publicados por RadixArk.
- Decodificación especulativa acelerada mediante la capa MTP propia del modelo.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso
- Automatización de tareas de terminal y DevOps: el modelo está entrenado con RL sobre tareas de horizonte largo y obtiene 12,0 en Terminal Bench 4.1 frente a 5,6 del base, por lo que puede interpretar salidas de consola, encadenar comandos y corregir errores en flujos multi-paso ejecutados localmente en un Mac.
- Ingeniería de software asistida: con 94,7 en SWE Bench Pro v2 y tool calling nativo, puede integrarse en pipelines de revisión de parches, generación de funciones y comprobación de código mediante llamadas a herramientas externas.
- Análisis de capturas de pantalla y documentación técnica: gracias al codificador visual en bfloat16 y al pipeline image-text-to-text, permite preguntar a un modelo local qué error muestra una terminal o interpretar diagramas sin enviar imágenes a la nube.
- Asistentes de razonamiento local con privacidad: el despliegue en Apple Silicon con mlx-lm.server expone una API compatible con OpenAI, lo que permite sustituir llamadas a servicios remotos en aplicaciones que manejan datos sensibles.
- Respuestas de alta precisión factual y de instrucciones: con 90,7 en GPQA Diamond y 82,4 en IFBench, es adecuado para tareas de pregunta-respuesta científica y seguimiento estricto de instrucciones en entornos controlados.
- Prototipado de agentes con contexto largo: la ventana de 256K tokens permite mantener historiales extensos de conversación, trazas de herramientas y documentación en un único contexto, con un pico de memoria de 14,6 GB para prompts de 8K tokens en esta build de 3 bits.
- Evaluación y experimentación en investigación: la disponibilidad de builds de 3, 4, 6, 8 y bf16 bits con métricas de fidelidad (KL frente a bf16, coincidencia del siguiente token) facilita estudios de degradación por cuantización en hardware de consumo.

## Benchmarks y rendimiento

Resultados publicados por RadixArk para los pesos originales BF16/FP8, comparando DaisyRose-27B con Qwen3.8-27B:

| Benchmark | DaisyRose-27B | Qwen3.8-27B |
|---|---:|---:|
| Terminal Bench 4.1 | 12,0 | 5,6 |
| Terminal Bench 2.1 | 75,5 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 |
| SWE Bench Pro v2 | 94,7 | 91,3 |
| HLE (solo texto) | 34,3 | 33,9 |
| IFBench | 82,4 | 79,5 |
| GPQA Diamond | 90,7 | 89,2 |

Métricas de fidelidad de las builds MLX del autor:

| Build | Tamaño | Bits por peso | Mismo siguiente token que bf16 | KL vs bf16 | GSM8K, 50 preguntas | Pico de memoria, prompt 8K | Mac recomendado | Tool call / coding / thinking / vision |
|---|---|---|---|---|---|---|---|---|
| 6-bit (recomendada) | 23,1 GB | 6,66 | 98,7% | 0,0014 | 44/50 | 23,4 GB | 36 GB+ | pass / 3/3 / 2/2 / pass |
| 8-bit | 29,9 GB | 8,63 | 99,5% | 0,0004 | – | 29,7 GB | 48 GB+ | pass / 3/3 / 2/2 / pass |
| 4-bit | 16,3 GB | 4,70 | 95,8% | 0,0207 | 45/50 | 17,1 GB | 32 GB+ | pass / 3/3 / 2/2 / pass |
| 3-bit | 13,8 GB | 3,91 | 92,1% | 0,0814 | 43/50 | 14,6 GB | 24 GB+ | pass / 3/3 / 2/2 / pass |
| bf16 | 55,6 GB | 16 | referencia | – | – | 53,4 GB | 96 GB+ | – / – / – / pass |

Mediciones realizadas en un MacBook Pro M5 Max (128 GB) el 19 de noviembre de 2026 con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11. GSM8K se evaluó con thinking desactivado y decodificación greedy.

## Requisitos de hardware
- VRAM/memoria unificada estimada: 14,6 GB de pico para prompts de 8K tokens en esta build de 3 bits; contextos más largos requieren más memoria.
- Mac recomendado: 24 GB o más (el límite de memoria GPU por defecto de macOS es aproximadamente dos tercios de la RAM hasta 36 GB y tres cuartos por encima).
- En Macs de 32 GB puede elevarse el límite temporalmente con `sudo sysctl iogpu.wired_limit_mb=27000`, dejando varios GB para macOS y otras aplicaciones; con contexto corto, la build de 4 bits funciona en 24 GB y la de 6 bits en 32 GB.
- GPU NVIDIA (A100, H100, RTX 4090): no disponible en la información proporcionada; esta build está orientada a Apple Silicon mediante MLX.
- Opciones de despliegue: mlx-lm (`mlx_lm.server`) y mlx-vlm (`mlx_vlm.generate`); vLLM, llama.cpp, Ollama y TGI no se mencionan para este formato.
- Latencia y throughput: no disponible; la build incorpora decodificación especulativa con MTP que acelera la generación, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-MLX-3bit | 28.489 millones | 256K | apache-2.0 | Hugging Face, MLX para Apple Silicon | Build de 3 bits, 13,8 GB, 92,1% de coincidencia con bf16 |
| DaisyRose-27B-MLX-6bit | 28.489 millones | 256K | apache-2.0 | Hugging Face, MLX | 23,1 GB, 98,7% de coincidencia, balance recomendado |
| DaisyRose-27B (original) | 28.489 millones | 256K | apache-2.0 | Hugging Face, pesos BF16/FP8 | Referencia de benchmarks; requiere hardware de mayor memoria |
| Qwen3.8-27B | 27B (según nomenclatura) | 256K | no disponible | Hugging Face | Modelo base sin RL; resultados inferiores en Terminal Bench 4.1, DeepSWE y SWE Bench Pro v2 |

## Limitaciones y advertencias
- Degradación por cuantización: esta build conserva el 92,1% de coincidencia del siguiente token frente a bf16 y un KL de 0,0814, el más alto de la familia MLX; en GSM8K con 50 preguntas obtiene 43/50 frente a 45/50 de la build de 4 bits.
- Divergencia en decodificación especulativa: con MTP y decodificación greedy, el texto coincide hasta un empate cercano, momento en que la comprobación por lotes puede redondear en sentido contrario y hacer divergir ligeramente respuestas largas.
- Riesgo de alucinación: no se documenta en la información disponible; al ser un modelo de razonamiento entrenado solo con RL, conviene validar salidas factuales en producción.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponibles; la plantilla de chat y el tokenizador son los de Qwen3.8-27B, sin lista explícita de idiomas en la información proporcionada.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base RadixArk/DaisyRose-27B.
- Memoria: el pico de 14,6 GB corresponde a prompts de 8K tokens; contextos cercanos a 256K necesitan mucha más memoria y pueden requerir elevar el límite de GPU de macOS.
- Compatibilidad: requiere mlx-lm >= 0.32.2 y mlx-vlm >= 0.7.11; mlx-vlm deja el thinking desactivado salvo que se pase `--enable-thinking`.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/netprojects/DaisyRose-27B-MLX-3bit
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Build de 6 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/DaisyRose-27B-MLX-bf16
- Licencia: LICENSE (referenciada en la model card)
