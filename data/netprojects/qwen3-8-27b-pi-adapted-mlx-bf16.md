# netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16

## Resumen

Qwen3.8-27B-pi-adapted-MLX-bf16 es una conversión a formato MLX del modelo Qwen3.8-27B de Alibaba Qwen, con un adaptador LoRA fusionado entrenado por harness-hub mediante aprendizaje por refuerzo (AsyncGRPO en TRL) para funcionar como modelo base del agente de programación pi. El resultado es un modelo de 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) orientado a tareas de ingeniería de software y uso de terminal, empaquetado en bf16 para Apple Silicon con un tamaño de repositorio de 55,6 GB.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un ajuste por RL específicamente orientado a agentes de código con resultados publicados notables (Terminal-Bench 2.1 del 39,5% al 55,8% y SWE-bench Pro hard 51 del 29,4% al 62,7% frente al modelo base), una conversión nativa a MLX que preserva el codificador de visión y la capa de predicción multi-token (MTP) de Qwen, y una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.

El modelo se distribuye en varias cuantizaciones (4-bit, 6-bit, 8-bit, bf16 y solo adaptador), siendo la versión de 6 bits la recomendada por el autor por su equilibrio entre tamaño (23,1 GB) y fidelidad (99,0% de coincidencia en el siguiente token respecto a bf16). Esta build concreta es la referencia bf16 sin pérdida de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa en 16 capas y capas de atención lineal en el resto (64 capas totales), con capa MTP (multi-token prediction) y codificador de visión |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | bf16 (esta build); también existen builds MLX de 4-bit, 6-bit, 8-bit y adaptador LoRA suelto |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con archivo adicional `model-mtp.safetensors` para la capa MTP |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer de 64 capas en el que 16 capas emplean atención completa y el resto atención lineal, e incorpora un codificador de visión (pipeline image-text-to-text) y una capa de predicción multi-token (MTP) que actúa como modelo borrador integrado para decodificación especulativa. Sobre esta base, harness-hub entrenó un adaptador LoRA mediante aprendizaje por refuerzo con AsyncGRPO en TRL, orientado a tareas de ingeniería de software y terminal dentro del agente pi. La conversión a MLX se realizó con mlx-vlm e incluye tanto el codificador de visión como la capa MTP original de Qwen, sin modificar por el adaptador.

La fusión del adaptador se verificó elemento a elemento: los 256 módulos adaptados (q, k, v, o en las 16 capas de atención completa; gate, up, down en las 64 capas) coinciden con `W + 2.0 · B @ A` redondeado a bf16 frente a un cálculo independiente en float64, y el resto de tensores son idénticos byte a byte. El tokenizador y la plantilla de chat son los de harness-hub sin cambios, manteniendo el mismo vocabulario y formato de llamadas a herramientas que Qwen3.8-27B. El adaptador fue entrenado y evaluado con el modo thinking desactivado, por lo que se recomienda mantenerlo así en producción.

## Capacidades

- Generación de texto y razonamiento general, heredados de Qwen3.8-27B.
- Comprensión de imágenes y texto (pipeline image-text-to-text) mediante el codificador de visión incluido.
- Ejecución de tareas de agente de código: localización y corrección de bugs, edición de ficheros y ejecución de comandos en terminal.
- Soporte de tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Razonamiento multi-paso y uso de agentes, optimizado específicamente para el agente pi.
- Reducción del número de llamadas a herramientas por tarea (55-64% menos según los resultados publicados del adaptador).
- Decodificación especulativa mediante la capa MTP integrada o el drafter DSpine.
- Modo thinking disponible en el modelo base, aunque el adaptador se entrenó con thinking desactivado.

## Casos de uso

- Corrección automática de bugs en repositorios: el modelo puede recibir el fallo de una suite de tests, inspeccionar los ficheros implicados mediante tool calling y aplicar el parche, aprovechando su entrenamiento específico en SWE-bench Pro (62,7% en hard 51).
- Agente de terminal para tareas de DevOps: ejecución de comandos, lectura de salidas de error y corrección iterativa, con un 55,8% en Terminal-Bench 2.1 y menos llamadas a herramientas por tarea, lo que reduce coste y latencia.
- Asistente de programación local en Mac: servido con `mlx_lm.server` en un MacBook con Apple Silicon, permite trabajar sin enviar código a servicios externos, relevante para entornos con requisitos de confidencialidad.
- Integración en el agente pi: configuración directa en `~/.pi/agent/models.json` apuntando a un endpoint local compatible con la API Chat Completions de OpenAI.
- Análisis de capturas de terminal o de pantalla: gracias al codificador de visión, puede interpretar una imagen de una terminal con errores y proponer la corrección correspondiente.
- Automatización de refactorizaciones guiadas por tests: el modelo puede leer los tests existentes, modificar el código y verificar el resultado en un bucle de agente multi-paso.
- Generación de código en pipelines de CI/CD: con tool calling y formato OpenAI, puede integrarse en flujos automatizados de revisión o generación de parches, aunque la latencia en hardware consumer limita su uso a tareas acotadas.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador bajo el agente pi, con thinking desactivado:

| Benchmark | Modelo base | Con adaptador pi |
|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% |

Fidelidad de las cuantizaciones respecto a bf16 (según el autor):

| Build | Tamano | Coincidencia siguiente token vs bf16 | KL vs bf16 |
|---|---|---|---|
| 6-bit (recomendada) | 23,1 GB | 99,0% | 0,0015 |
| 8-bit | 30,0 GB | 99,1% | 0,0004 |
| 4-bit | 16,3 GB | 95,6% | 0,0201 |
| bf16 | 55,6 GB | referencia | referencia |

Rendimiento de decodificación medido en un MacBook Pro M5 Max de 128 GB (greedy, thinking off, 5 prompts de 256 tokens de GSM8K, MATH-500, HumanEval, MBPP y MT-Bench, con otros servicios en ejecución, por lo que son indicativos):

| Build | Sin aceleración | MTP (mlx-vlm 0.7.11) | DSpine v0.2.1 (drafter 4-bit, bloque 5) |
|---|---|---|---|
| 4-bit | 33 tok/s | 61 tok/s (×1,84) | 70 tok/s (×2,25) |
| 6-bit | 23 tok/s | 22 tok/s (×0,96) | 52 tok/s (×2,32) |
| 8-bit | 18 tok/s | 41 tok/s (×2,24) | 54 tok/s (×3,05) |

En la build bf16, el autor reporta aproximadamente 2,8× de aceleración con MTP en un prompt corto de código, sin tabla completa de velocidades para esta cuantización.

## Requisitos de hardware

- VRAM/unified memory para bf16: 55,6 GB de pesos más overhead de contexto y activaciones; requiere al menos 64 GB de memoria unificada, siendo recomendable 96-128 GB.
- Alternativas más ligeras: 6-bit (23,1 GB), 8-bit (30,0 GB) y 4-bit (16,3 GB), todas en formato MLX.
- Hardware objetivo: Apple Silicon (M-series). El autor verificó en un MacBook Pro M5 Max de 128 GB. No está pensado para GPU NVIDIA ni CUDA.
- Cabe en consumer hardware Apple de gama alta con memoria unificada suficiente; en Macs de 32 GB solo sería viable la build de 4 bits, y con margen ajustado.
- Despliegue: `mlx_lm.server` con endpoint compatible con OpenAI (API Chat Completions), `mlx-lm` para texto y `mlx-vlm` para imagen-texto. No aplican vLLM, TGI ni llama.cpp para este formato.
- Aceleración: capa MTP integrada usada como draft model (`--draft-kind mtp`) o drafter DSpine con `dspine-hybrid-mlx`.
- Throughput indicativo: 18-33 tok/s en decodificación plana según cuantización en M5 Max; hasta 70 tok/s con DSpine en 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted-MLX-bf16 | 27,8 mil M | No disponible | Agente de código (RL) en MLX | Apache 2.0 | Hugging Face, formato MLX |
| Qwen3.8-27B (base) | 27,8 mil M | No disponible | Modelo generalista multimodal | Apache 2.0 (según base) | Hugging Face |
| Qwen3.8-27B-pi-adapted (adaptador original) | 27,8 mil M + LoRA | No disponible | Agente de código (RL) | Apache 2.0 | Hugging Face, safetensors |

No se dispone en la información proporcionada de datos comparativos con otras familias de modelos del mismo tamaño (por ejemplo, variantes de Llama, Mistral o Gemma) ni de sus resultados en Terminal-Bench o SWE-bench Pro, por lo que la comparación se limita a las variantes del propio Qwen3.8-27B.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking desactivado; activar el modo thinking puede degradar el rendimiento esperado en tareas de agente.
- La decodificación especulativa con MTP o DSpine puede divergir ligeramente del texto de la decodificación plana en casos de casi-empate durante la verificación por lotes.
- El formato de pesos es exclusivamente MLX: no es utilizable directamente en CUDA, vLLM, TGI o llama.cpp.
- No se dispone de información sobre idiomas soportados ni sobre sesgos conocidos del modelo base o del adaptador.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de código donde puede proponer APIs o ficheros inexistentes; requiere verificación mediante tests.
- El entrenamiento se centró en tareas de ingeniería de software y terminal, por lo que su comportamiento en dominios ajenos puede no reflejar las mejoras reportadas.
- Las mediciones de rendimiento se realizaron con otros servicios en ejecución en el mismo equipo y el propio autor las califica de indicativas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.8-27B y del adaptador original de harness-hub.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
- Build de 6 bits recomendada: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit
- Adaptador LoRA suelto: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter
- Adaptador original de harness-hub: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Agente pi: https://github.com/earendil-works/pi
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
