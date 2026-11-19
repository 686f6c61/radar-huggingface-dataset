# netprojects/DaisyRose-27B-MLX-6bit

## Resumen

DaisyRose-27B-MLX-6bit es una conversión a formato MLX, cuantizada a 6 bits, del modelo RadixArk/DaisyRose-27B, desarrollado por RadixArk como una versión refinada mediante aprendizaje por refuerzo (RL) de Qwen3.8-27B. El modelo conserva la arquitectura, el tokenizador, la plantilla de chat, la comprensión de imágenes y el contexto de 256K del modelo base, y añade un modo de razonamiento ("thinking") activado por defecto que produce la cadena de pensamiento antes de la respuesta final. Esta conversión concreta, publicada por el usuario netprojects, está pensada para ejecutarse en Apple Silicon mediante la librería MLX y mlx-vlm, con el codificador de visión y la capa de predicción multi-token (MTP) incluidas.

El modelo resuelve el problema de desplegar un modelo de 27.781.427.952 parámetros con capacidades de agente de horizonte largo, razonamiento y visión en equipos Mac con memoria unificada, sin necesidad de GPUs dedicadas. La cuantización affine de 6 bits (grupo 64) reduce el peso a 23,1 GB manteniendo un 98,7% de coincidencia en el siguiente token respecto a bf16 y una divergencia KL de 0,0014, lo que lo convierte en el equilibrio recomendado entre tamaño y fidelidad según el autor de la conversión.

Es relevante ahora porque permite probar localmente un modelo entrenado exclusivamente con RL sobre unas 1.200 tareas de agente de horizonte largo, con mejoras publicadas frente al base en benchmarks como Terminal Bench 4.1 (12,0 frente a 5,6) o SWE Bench Pro v2 (94,7 frente a 91,3), en hardware de consumo Apple con 36 GB de RAM o más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen3.8-27B); incluye codificador de visión y capa MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (heredada de Qwen3.8-27B) |
| Tipos de cuantizacion | 6 bits affine, grupo 64 (esta build); el autor publica también 8-bit, 4-bit, 3-bit y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), incluido `model-mtp.safetensors` para la capa MTP |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-27B, un transformer que el autor de la conversión verifica como idéntico en configuración y lista de tensores al modelo base. Incorpora un codificador de visión (pipeline image-text-to-text) y una capa propia de predicción multi-token (MTP) que se conserva en esta build cuantizada y puede usarse como modelo borrador para decodificación especulativa. El contexto es de 256K tokens y la plantilla de chat admite el parámetro `reasoning_effort` (`xhigh` por defecto, `medium`, `low`) y `enable_thinking=False`.

El entrenamiento de DaisyRose-27B, según la model card, se realizó exclusivamente con aprendizaje por refuerzo, sin ajuste supervisado ni destilación, sobre aproximadamente 1.200 tareas de agente de horizonte largo. No se detalla la composición del dataset ni el número de tokens de entrenamiento. La innovación destacable es la capa MTP integrada: al pasar el mismo repositorio como `--draft-model` con `--draft-kind mtp`, mlx-vlm la usa como borrador y cada token propuesto se verifica con el modelo completo, de modo que con decodificación greedy el texto coincide con la decodificación normal salvo en empates cercanos.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto; la cadena de pensamiento se devuelve antes de `</think>`.
- Control del esfuerzo de razonamiento mediante `reasoning_effort` (`xhigh`, `medium`, `low`) y desactivación del pensamiento con `enable_thinking=False`.
- Comprensión de imágenes (image-text-to-text): puede responder preguntas sobre capturas de pantalla, por ejemplo errores en una terminal.
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm devuelve como `tool_calls` compatibles con OpenAI.
- Capacidades de agente y razonamiento multi-paso, entrenadas sobre tareas de horizonte largo.
- Generación de código: la build 6-bit supera las pruebas de tool call, coding (3/3) y thinking (2/2) según el autor.
- Decodificación especulativa mediante la capa MTP incluida.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de terminal automatizado: el modelo fue entrenado con RL sobre tareas de agente de horizonte largo y obtiene 12,0 en Terminal Bench 4.1 frente a 5,6 del base, por lo que encaja en flujos que ejecutan comandos y corrigen errores de forma iterativa.
- Resolución de incidencias de software: con 46,2 en DeepSWE v1.1 y 94,7 en SWE Bench Pro v2, puede emplearse para localizar y proponer parches en repositorios dentro de un pipeline de CI/CD con tool calling.
- Asistente de desarrollo en Mac local: gracias a sus 23,1 GB y 23,4 GB de memoria pico con prompt de 8K, cabe en un Mac de 36 GB o más y permite trabajar sin conexión con contexto largo de 256K.
- Análisis de capturas y registros: al ser image-text-to-text, puede recibir una captura de pantalla de una terminal o un panel de errores y explicar el fallo, integrándose en herramientas de soporte técnico.
- Automatización de atención al cliente multi-turno: la ventana de 256K permite mantener conversaciones largas con historial extenso y el modo thinking mejora la precisión en consultas complejas.
- Evaluación de razonamiento científico y matemático: con 90,7 en GPQA Diamond y 44/50 en GSM8K (50 preguntas, thinking off, greedy) en esta build, sirve para prototipos de tutoría o verificación de respuestas técnicas.
- Generación de código asistida en el editor: el soporte de tool calling y la decodificación especulativa con MTP reducen la latencia en la generación de funciones, como el ejemplo de la model card para comprobar si un número es primo.

## Benchmarks y rendimiento

Resultados publicados por RadixArk para los pesos originales BF16/FP8, según la model card:

| Benchmark | DaisyRose-27B | Qwen3.8-27B |
|---|---:|---:|
| Terminal Bench 4.1 | 12,0 | 5,6 |
| Terminal Bench 2.1 | 75,5 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 |
| SWE Bench Pro v2 | 94,7 | 91,3 |
| HLE (solo texto) | 34,3 | 33,9 |
| IFBench | 82,4 | 79,5 |
| GPQA Diamond | 90,7 | 89,2 |

Métricas de la conversión MLX 6-bit publicadas por netprojects:

| Metrica | Valor |
|---|---|
| Tamano | 23,1 GB |
| Bits por peso | 6,66 |
| Mismo siguiente token que bf16 | 98,7% |
| KL frente a bf16 | 0,0014 |
| GSM8K (50 preguntas) | 44/50 |
| Memoria pico con prompt de 8K | 23,4 GB |
| Mac recomendado | 36 GB o más |
| Tool call / coding / thinking / vision | pass / 3/3 / 2/2 / pass |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 23,4 GB de pico con prompt de 8K para la build 6-bit; 17,1 GB para la 4-bit; 14,6 GB para la 3-bit; 29,7 GB para la 8-bit; 53,4 GB para bf16.
- Mac recomendado: 36 GB o más para la 6-bit, 32 GB para la 4-bit, 24 GB para la 3-bit, 48 GB para la 8-bit y 96 GB para bf16 (criterio del autor: límite de memoria GPU por defecto, aproximadamente dos tercios de la RAM hasta 36 GB y tres cuartos por encima).
- En un Mac de 32 GB se puede elevar el límite de memoria GPU temporalmente con `sudo sysctl iogpu.wired_limit_mb=27000`, dejando varios GB para macOS y las aplicaciones; con contextos cortos la 6-bit suele funcionar en 32 GB y la 4-bit en 24 GB.
- GPU dedicadas: no disponible; la conversión está orientada a Apple Silicon.
- Despliegue: mlx-lm (servidor con `mlx_lm.server`, requiere `mlx-lm>=0.32.2`) y mlx-vlm (`mlx_vlm.generate`, requiere `mlx-vlm>=0.7.11`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta build.
- Latencia y throughput: no disponibles; el autor solo indica que la capa MTP acelera la decodificación mediante borrador verificado por el modelo completo.
- Muestreo recomendado en modo thinking: temperatura 1,0, top_p 0,95, top_k 20, min_p 0, con espacio para pensamientos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-MLX-6bit | 27.781.427.952 | 256K | Apache 2.0 | safetensors MLX | Esta ficha; 23,1 GB, 98,7% de coincidencia con bf16 |
| Qwen3.8-27B | no disponible | 256K | no disponible | no disponible | Modelo base; DaisyRose lo supera en todos los benchmarks publicados |
| DaisyRose-27B (RadixArk) | no disponible | 256K | Apache 2.0 | no disponible | Pesos originales BF16/FP8; referencia de los benchmarks |
| DaisyRose-27B-MLX-8bit | no disponible | 256K | Apache 2.0 | safetensors MLX | 29,9 GB, 99,5% de coincidencia con bf16, requiere 48 GB o más |
| DaisyRose-27B-MLX-4bit | no disponible | 256K | Apache 2.0 | safetensors MLX | 16,3 GB, 95,8% de coincidencia, requiere 32 GB o más |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no se documenta una evaluación específica; el modo thinking por defecto puede alargar las respuestas y consumir muchos tokens en problemas difíciles.
- La cuantización 6-bit no es idéntica a bf16: coincide en el 98,7% de los siguientes tokens y tiene KL de 0,0014, por lo que puede divergir en casos límite.
- Con decodificación especulativa MTP y decodificación greedy, las respuestas largas pueden divergir ligeramente de la decodificación normal en empates cercanos.
- El contexto de 256K exige mucha más memoria que la medida con prompt de 8K; el autor advierte que contextos más largos necesitan más RAM.
- Los benchmarks publicados corresponden a los pesos originales BF16/FP8 de RadixArk, no a esta conversión MLX; solo GSM8K (44/50) y las pruebas de tool call, coding, thinking y vision se midieron en esta build.
- Idiomas soportados: no disponible; no se puede confirmar el rendimiento multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones del modelo base.
- La librería MLX limita el despliegue a Apple Silicon; no hay soporte documentado para CUDA en esta build.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/DaisyRose-27B-MLX-6bit
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Build 8-bit: https://huggingface.co/netprojects/DaisyRose-27B-MLX-8bit
- Build 4-bit: https://huggingface.co/netprojects/DaisyRose-27B-MLX-4bit
- Build 3-bit: https://huggingface.co/netprojects/DaisyRose-27B-MLX-3bit
- Build bf16: https://huggingface.co/netprojects/DaisyRose-27B-MLX-bf16
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
- Repositorio de mlx-vlm: https://github.com/Blaizzy/mlx-vlm
