# netprojects/DaisyRose-27B-MLX-4bit

## Resumen

DaisyRose-27B-MLX-4bit es la conversión a 4 bits para Apple Silicon (formato MLX) del modelo RadixArk/DaisyRose-27B, un modelo multimodal de tipo image-text-to-text de 27.781 millones de parámetros. Lo publica el usuario netprojects en Hugging Face y deriva del modelo base RadixArk/DaisyRose-27B (revisión `293a7a2`), que a su vez es una versión de Qwen3.8-27B afinada mediante aprendizaje por refuerzo. La conversión conserva el codificador de visión y la capa de predicción multi-token (MTP) del modelo original, cuantizada también a 4 bits.

El modelo resuelve el despliegue local de un LLM multimodal de razonamiento y agentes en ordenadores Mac con memoria unificada limitada: el build de 4 bits ocupa 16,3 GB y requiere un Mac de 32 GB o más según las mediciones del autor, frente a los 55,6 GB del build bf16. Mantiene el contexto de 256K tokens, el tokenizador, la plantilla de chat y la comprensión de imágenes de la familia Qwen3.8, y piensa antes de responder por defecto.

Es relevante ahora porque permite ejecutar un modelo de 27B con capacidades de agente de horizonte largo, tool calling y visión en hardware de consumo Apple, con una fidelidad medida del 95,8 % en el siguiente token respecto a bf16 y una divergencia KL de 0,0207. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3.8, con capa MTP; pesos en formato MLX |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | 4 bits afín, grupo 64 (este build); el autor publica también 2.5, 3, 6, 8 bits y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`model-mtp.safetensors` incluido); 16,3 GB de repo |

## Arquitectura y entrenamiento

DaisyRose-27B hereda la arquitectura de Qwen3.8-27B: un transformer multimodal con codificador de visión, plantilla de chat y tokenizador idénticos a los del modelo base, más una capa propia de predicción multi-token (MTP) que actúa como modelo borrador para decodificación especulativa. Según el autor de la conversión, la configuración y la lista de tensores del modelo base son idénticas a las de Qwen3.8-27B.

El entrenamiento del modelo base, según RadixArk, consistió únicamente en aprendizaje por refuerzo (sin SFT ni destilación) sobre aproximadamente 1.200 tareas de agente de horizonte largo. No se dispone de datos sobre el número de tokens de entrenamiento ni sobre la composición del dataset. La innovación destacable del build es la conservación de la capa MTP cuantizada a 4 bits, que mlx-vlm utiliza como modelo borrador integrado para acelerar la decodificación verificando cada token propuesto con el modelo completo.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto (el contenido de razonamiento aparece antes de ``).
- Comprensión de imágenes (pipeline image-text-to-text), con ejemplos de lectura de capturas de terminal.
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm devuelve como `tool_calls` de OpenAI.
- Uso como agente y razonamiento multi-paso, entrenado específicamente sobre tareas de agente de horizonte largo.
- Generación de código y tareas de ingeniería de software (Terminal Bench, DeepSWE, SWE Bench Pro en los benchmarks publicados).
- Control de esfuerzo de razonamiento mediante `reasoning_effort` (`xhigh` por defecto, `medium`, `low`) y desactivación del pensamiento con `enable_thinking=False`.
- Decodificación especulativa mediante la capa MTP integrada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de terminal y automatización de shell: el modelo está entrenado sobre tareas de agente de horizonte largo y obtiene 75,5 en Terminal Bench 2.1, por lo que puede encadenar comandos, interpretar salidas y corregir errores en sesiones prolongadas.
- Asistente de ingeniería de software en local: con 94,7 en SWE Bench Pro v2 y soporte de tool calling, puede integrarse en flujos de revisión de parches o generación de código dentro de un Mac de desarrollo sin enviar código a la nube.
- Análisis de capturas y documentos visuales: al ser image-text-to-text, permite pasar una captura de pantalla o un diagrama y preguntar por el error mostrado, útil para soporte técnico y depuración asistida.
- Razonamiento científico y matemático: con 90,7 en GPQA Diamond y modo de pensamiento configurable, sirve para resolver problemas que requieren cadenas de razonamiento largas ajustando `reasoning_effort` según la dificultad.
- Cumplimiento estricto de instrucciones en pipelines: 82,4 en IFBench indica que puede usarse para tareas de extracción y formateo donde el formato de salida es crítico.
- Procesamiento de contexto largo: con 256K tokens de ventana puede analizar repositorios completos, transcripciones extensas o documentación técnica en una sola pasada, siempre que la memoria del Mac lo permita (contextos más largos elevan el pico de memoria por encima de los 17,1 GB medidos con 8K).
- Servidor local compatible con OpenAI: `mlx_lm.server` expone una API con `tool_calls` en formato OpenAI, lo que permite sustituir un endpoint remoto por inferencia local en prototipos y pruebas.

## Benchmarks y rendimiento

Resultados publicados por RadixArk para los pesos originales BF16/FP8 (no para este build de 4 bits):

| Benchmark | DaisyRose-27B | Qwen3.8-27B |
|---|---:|---:|
| Terminal Bench 4.1 | 12,0 | 5,6 |
| Terminal Bench 2.1 | 75,5 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 |
| SWE Bench Pro v2 | 94,7 | 91,3 |
| HLE (solo texto) | 34,3 | 33,9 |
| IFBench | 82,4 | 79,5 |
| GPQA Diamond | 90,7 | 89,2 |

Métricas de fidelidad de esta cuantización frente a bf16, medidas por el autor de la conversión:

| Metrica | Valor |
|---|---|
| Bits por peso | 4,70 |
| Mismo siguiente token que bf16 | 95,8 % |
| KL frente a bf16 | 0,0207 |
| GSM8K (50 preguntas, thinking off, greedy) | 45/50 |
| Memoria pico con prompt de 8K tokens (mlx-lm, texto) | 17,1 GB |
| Tool call / coding / thinking / vision | pass / 3/3 / 2/2 / pass |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 17,1 GB de pico con prompt de 8K tokens en texto; el repo pesa 16,3 GB. Contextos más largos requieren más memoria.
- Mac recomendado por el autor: 32 GB o más (el límite por defecto de memoria de GPU de macOS debe cubrir el pico).
- En un Mac de 24 GB puede funcionar elevando el límite de memoria de GPU (`sudo sysctl iogpu.wired_limit_mb=27000` en un Mac de 32 GB) y usando contextos cortos; el autor indica que con el límite elevado el build de 4 bits cabe en 24 GB.
- GPU dedicadas (A100, H100, RTX 4090): no aplica, el formato MLX está pensado para Apple Silicon; no hay datos de despliegue en CUDA.
- Opciones de despliegue: `mlx-lm` (>= 0.32.2) para texto y servidor compatible con OpenAI; `mlx-vlm` (>= 0.7.11) para imágenes y para usar la capa MTP con `--draft-kind mtp`.
- Latencia y throughput: no disponibles. El autor solo documenta que la decodificación especulativa con MTP acelera la generación, verificando cada token con el modelo completo.
- Entorno de medida declarado: MacBook Pro M5 Max de 128 GB, mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11 (19 de noviembre de 2026).

## Comparativa con modelos similares

Comparación con los otros builds del mismo modelo publicados por netprojects:

| Build | Tamano | Bits/peso | Mismo token que bf16 | KL vs bf16 | GSM8K (50) | Memoria pico 8K | Mac recomendado |
|---|---:|---:|---:|---:|---:|---:|---|
| 2.5-bit | 11,8 GB | 3,65 | 87,6 % | 0,2138 | 42/50 | 13,8 GB | 24 GB+ |
| 3-bit | 13,8 GB | 3,91 | 92,1 % | 0,0814 | 43/50 | 14,6 GB | 24 GB+ |
| 4-bit (este) | 16,3 GB | 4,70 | 95,8 % | 0,0207 | 45/50 | 17,1 GB | 32 GB+ |
| 6-bit | 23,1 GB | 6,66 | 98,7 % | 0,0014 | 44/50 | 23,4 GB | 36 GB+ |
| 8-bit | 29,9 GB | 8,63 | 99,5 % | 0,0004 | 45/50 | 29,7 GB | 48 GB+ |
| bf16 | 55,6 GB | 16 | referencia | – | – | 53,4 GB | 96 GB+ |

Frente al modelo base RadixArk/DaisyRose-27B en BF16/FP8, este build reduce el tamaño de 55,6 GB a 16,3 GB con una fidelidad del 95,8 % en el siguiente token. Comparación con otros modelos de la misma categoría (mismo tamaño o tarea): no disponible en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce divergencia respecto a bf16: KL de 0,0207 y un 4,2 % de tokens siguientes distintos, con posible degradación en tareas sensibles a la precisión.
- Los benchmarks de RadixArk corresponden a los pesos originales BF16/FP8, no a este build cuantizado; no hay resultados de benchmarks del build de 4 bits más allá de las métricas de fidelidad y GSM8K.
- El build de 2.5 bits del mismo autor pierde la capacidad de visión (text-only) y falla 1 de 3 pruebas de tool call; el de 4 bits las supera, pero conviene validar el comportamiento en el caso de uso concreto.
- Con decodificación especulativa MTP y decodificación greedy, el texto puede divergir ligeramente del decodificado plano en situaciones de casi empate, según advierte el autor.
- El modelo piensa por defecto; sin ajustar `max_tokens` o `reasoning_effort` puede consumir muchos tokens en razonamiento antes de responder.
- Compatibilidad limitada a Apple Silicon y a las versiones de mlx-lm y mlx-vlm indicadas; no hay soporte documentado para CUDA, vLLM, llama.cpp ni Ollama.
- Idiomas soportados: no disponible, por lo que no se puede garantizar el rendimiento en castellano sin evaluación propia.
- Sesgos conocidos y riesgo de alucinación: no documentados en la información proporcionada; aplican los riesgos habituales de un modelo de lenguaje de 27B.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales no detalladas en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/DaisyRose-27B-MLX-4bit
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Build de 6 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-8bit
- Build de 3 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-3bit
- Build de 2.5 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/DaisyRose-27B-MLX-bf16
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
