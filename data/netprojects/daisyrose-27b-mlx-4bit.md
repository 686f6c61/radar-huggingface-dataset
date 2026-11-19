# netprojects/DaisyRose-27B-MLX-4bit

## Resumen

DaisyRose-27B-MLX-4bit es la conversión a formato MLX con cuantización de 4 bits del modelo RadixArk/DaisyRose-27B, un modelo multimodal de tipo image-text-to-text desarrollado por RadixArk como versión refinada mediante aprendizaje por refuerzo (RL) de Qwen3.8-27B. Esta build concreta, publicada por el usuario netprojects, está pensada para ejecutarse en Apple Silicon mediante las librerías mlx-lm y mlx-vlm, e incluye tanto el codificador visual como la capa de predicción multi-token (MTP) del modelo original, también cuantizada a 4 bits. El resultado es un paquete de 16,3 GB que ocupa aproximadamente 4,70 bits por peso y que cabe en Macs de 32 GB de memoria unificada o superiores.

El modelo base conserva la arquitectura, el tokenizador, la plantilla de chat, la comprensión de imágenes y la ventana de contexto de 256K de Qwen3.8-27B, pero ha sido entrenado exclusivamente con RL (sin fine-tuning supervisado ni destilación) sobre unas 1.200 tareas de agente de horizonte largo. Por defecto razona antes de responder, con un modo de pensamiento configurable mediante `reasoning_effort` (xhigh, medium, low) o desactivable con `enable_thinking=False`. La licencia es Apache 2.0.

La relevancia de esta ficha radica en que ofrece un equilibrio práctico entre tamaño y fidelidad respecto al modelo en bf16: según las mediciones del publicador, la build de 4 bits reproduce el siguiente token del bf16 en el 95,8% de los casos con una divergencia KL de 0,0207, y mantiene operativas las capacidades de tool calling, generación de código, razonamiento y visión en las pruebas realizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.8-27B, con capa MTP (multi-token prediction) |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (heredada de Qwen3.8-27B) |
| Tipos de cuantizacion | 4 bits afín, grupo 64 (build publicada); existen también builds de 3, 6, 8 bits y bf16 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` separado para la capa MTP |

## Arquitectura y entrenamiento

El modelo base DaisyRose-27B es una versión de Qwen3.8-27B entrenada únicamente con aprendizaje por refuerzo sobre aproximadamente 1.200 tareas de agente de horizonte largo, sin supervisión ni destilación. Mantiene intactas la arquitectura, el tokenizador y la plantilla de chat del modelo original, así como su capacidad de comprensión de imágenes y su contexto de 256K tokens. Una innovación destacable es la capa de predicción multi-token (MTP) propia del modelo, que actúa como modelo borrador integrado para decodificación especulativa: cada token propuesto se verifica con el modelo completo, de modo que con decodificación greedy el texto coincide con la decodificación normal salvo en empates cercanos.

Esta build MLX aplica cuantización afín de 4 bits (grupo 64) a las capas lineales, incluida la capa MTP, y conserva el codificador visual. El publicador verificó que cada build cuantizada es exactamente la cuantización afín del build bf16, que los ficheros de origen coinciden con los hashes SHA-256 del Hub y que la configuración y la lista de tensores son idénticas a las de Qwen3.8-27B. Las mediciones se realizaron en un MacBook Pro M5 Max de 128 GB con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento por defecto (el razonamiento aparece antes de `</think>`), configurable con `reasoning_effort` en xhigh, medium o low, y desactivable con `enable_thinking=False`.
- Comprensión de imágenes (pipeline image-text-to-text), incluyendo lectura de capturas de terminal y otros contenidos visuales.
- Tool calling / function calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Capacidades de agente y razonamiento multi-paso, fruto del entrenamiento RL sobre tareas de horizonte largo.
- Generación de código y resolución de problemas de matemáticas (verificado con GSM8K en las pruebas del publicador).
- Decodificación especulativa acelerada mediante la capa MTP integrada, usando el mismo repositorio como `--draft-model` con `--draft-kind mtp`.
- Capacidades multilingües: no disponible (no se especifican idiomas).

## Casos de uso

- Automatización de tareas de terminal y agentes de línea de comandos: el modelo fue entrenado con RL sobre tareas de agente de horizonte largo y obtiene 12,0 en Terminal Bench 4.1 frente a 5,6 del base, lo que lo hace adecuado para agentes que operan shells y depuran salidas de comandos.
- Ingeniería de software asistida: con 46,2 en DeepSWE v1.1 y 94,7 en SWE Bench Pro v2, puede integrarse en flujos de resolución de incidencias y generación de parches sobre repositorios, apoyándose en tool calling para leer ficheros y ejecutar pruebas.
- Análisis de capturas y documentación técnica: al ser image-text-to-text, puede recibir una captura de pantalla de un terminal o de una interfaz y explicar el error mostrado, como ilustra el ejemplo de la model card con `mlx_vlm.generate`.
- Asistentes de razonamiento con contexto largo: la ventana de 256K tokens permite procesar repositorios completos, expedientes o conversaciones multi-turno extensas sin truncar, ajustando `reasoning_effort` según la dificultad.
- Despliegue local en estaciones de trabajo Apple Silicon: con 16,3 GB de pesos y un pico de 17,1 GB para prompts de 8K tokens, cabe en Macs de 32 GB o superiores, lo que permite prototipar agentes sin depender de la nube.
- Servicio de inferencia compatible con OpenAI: `mlx_lm.server` expone el modelo con parámetros de muestreo recomendados (temperatura 1.0, top_p 0.95, top_k 20), útil para integrarlo en aplicaciones existentes que ya consumen la API de OpenAI.
- Evaluación de fidelidad de cuantización: investigadores pueden comparar esta build de 4 bits con las de 3, 6, 8 bits y bf16 del mismo autor para estudiar el impacto de la cuantización en tareas de razonamiento y agente.

## Benchmarks y rendimiento

Resultados publicados por RadixArk para los pesos originales en BF16/FP8 (no para esta build MLX de 4 bits):

| Benchmark | DaisyRose-27B | Qwen3.8-27B |
|---|---:|---:|
| Terminal Bench 4.1 | 12,0 | 5,6 |
| Terminal Bench 2.1 | 75,5 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 |
| SWE Bench Pro v2 | 94,7 | 91,3 |
| HLE (solo texto) | 34,3 | 33,9 |
| IFBench | 82,4 | 79,5 |
| GPQA Diamond | 90,7 | 89,2 |

Métricas de la build MLX de 4 bits medidas por el publicador:

| Metrica | Valor |
|---|---|
| Tamano | 16,3 GB |
| Bits por peso | 4,70 |
| Coincidencia con el siguiente token de bf16 | 95,8% |
| KL frente a bf16 | 0,0207 |
| GSM8K (50 preguntas) | 45/50 |
| Memoria pico con prompt de 8K tokens | 17,1 GB |
| Mac recomendado | 32 GB+ |
| Tool call / coding / thinking / vision | pass / 3/3 / 2/2 / pass |

## Requisitos de hardware

- VRAM (memoria unificada) estimada: 16,3 GB de pesos; pico de 17,1 GB con prompt de 8K tokens según el publicador. Contextos más largos requieren más memoria.
- Mac recomendado: 32 GB o superior con el límite de memoria GPU por defecto (aproximadamente dos tercios de la RAM hasta 36 GB, tres cuartos por encima).
- En Macs de 24 GB puede ejecutarse elevando el límite de memoria GPU, por ejemplo `sudo sysctl iogpu.wired_limit_mb=27000` en un Mac de 32 GB, dejando varios GB libres para macOS y aplicaciones.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; esta build está orientada exclusivamente a Apple Silicon mediante MLX.
- Opciones de despliegue: `mlx-lm` (versión 0.32.2 o superior) para texto y servidor compatible con OpenAI; `mlx-vlm` (0.7.11 o superior) para inferencia multimodal; decodificación especulativa con MTP pasando el mismo repositorio como `--draft-model` y `--draft-kind mtp`.
- Latencia y throughput: no disponible (no se publican cifras de tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-MLX-4bit (esta ficha) | 27,78 mil millones | 256K | Apache 2.0 | MLX 4 bits, Apple Silicon | 16,3 GB; 95,8% de coincidencia con bf16 |
| DaisyRose-27B-MLX-6bit | 27,78 mil millones | 256K | Apache 2.0 | MLX 6 bits, Apple Silicon | 23,1 GB; 98,7% de coincidencia; build recomendada por el autor |
| DaisyRose-27B-MLX-8bit | 27,78 mil millones | 256K | Apache 2.0 | MLX 8 bits, Apple Silicon | 29,9 GB; 99,5% de coincidencia; la más cercana a bf16 |
| RadixArk/DaisyRose-27B (base) | 27,78 mil millones | 256K | Apache 2.0 | BF16/FP8 | Pesos originales; benchmarks de referencia |

No se dispone de datos de benchmarks de esta build de 4 bits frente a alternativas de otros fabricantes; las comparaciones publicadas se limitan a las distintas cuantizaciones del mismo modelo y al modelo base Qwen3.8-27B.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce divergencia respecto a bf16: la coincidencia del siguiente token es del 95,8% y la KL de 0,0207, superiores a las de las builds de 6 y 8 bits; en tareas sensibles a la fidelidad numérica conviene valorar la build de 6 u 8 bits.
- Con decodificación especulativa MTP y decodificación greedy, las respuestas largas pueden divergir ligeramente del decodificado plano en empates cercanos, ya que la verificación por lotes puede redondear en sentido contrario.
- El modelo piensa por defecto y consume tokens en el razonamiento; en problemas difíciles hay que reservar espacio suficiente para el pensamiento o ajustar `reasoning_effort`.
- `mlx-vlm` deja el pensamiento desactivado salvo que se pase `--enable-thinking`, lo que puede producir respuestas de menor calidad si no se configura explícitamente.
- No se especifican los idiomas soportados ni sesgos conocidos; no hay información publicada sobre alucinación específica de esta build.
- El modelo está orientado exclusivamente a Apple Silicon con MLX; no es directamente utilizable en GPUs NVIDIA ni en servidores x86 convencionales sin reconversión.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene revisar el fichero LICENSE del repositorio y las condiciones del modelo base RadixArk/DaisyRose-27B.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las métricas publicadas.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/DaisyRose-27B-MLX-4bit
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Build de 6 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-8bit
- Build de 3 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-3bit
- Build bf16: https://huggingface.co/netprojects/DaisyRose-27B-MLX-bf16
