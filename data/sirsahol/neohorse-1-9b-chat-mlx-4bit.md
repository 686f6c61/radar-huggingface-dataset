# SirSahOl/NeoHorse-1-9B-chat-mlx-4bit

## Resumen

NeoHorse-1-9B-chat-mlx-4bit es una conversión cuantizada a 4 bits del modelo NeoHorse-1-9B, desarrollado por TokenRhythm, realizada por SirSahOl. Está optimizada para ejecución nativa en GPU de Apple Silicon mediante el framework MLX, y se distribuye en formato safetensors. El modelo original emplea la arquitectura Qwen3_5ForCausalLM, con aproximadamente 9.000 millones de parámetros y una ventana de contexto de 262.144 tokens. Esta versión reduce el peso a 5,1 GB en disco y requiere unos 5,4 GB de memoria activa, lo que permite ejecutarla en equipos con 16 GB de memoria unificada. Está pensada para tareas de generación de texto, conversación, uso de herramientas, codificación y razonamiento, con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM |
| Parámetros totales | 8.953.803.264 (9,0B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | 4-bit MLX (media 4,50 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base NeoHorse-1-9B utiliza la arquitectura Qwen3_5ForCausalLM, un transformer causal para generación de texto. La conversión MLX 4-bit aplica cuantización a 4 bits con una media de 4,50 bits por peso, manteniendo el formato safetensors. No se han proporcionado detalles sobre el proceso de entrenamiento, datos utilizados, número de tokens ni técnicas de alineación como RLHF o DPO. El contexto de 262.144 tokens es una característica destacada, que permite manejar documentos extensos y conversaciones largas. Al tratarse de una cuantización, la calidad general puede verse ligeramente reducida respecto al modelo original en precisión completa.

## Capacidades

- Generación de texto conversacional con plantilla ChatML.
- Razonamiento y seguimiento de instrucciones.
- Soporte para tool use / function calling, según los tags del modelo.
- Capacidades de codificación.
- Capacidades agénticas y razonamiento multi-paso.
- Ventana de contexto de 262.144 tokens, adecuada para documentos largos y contextos extensos.
- Ejecución optimizada en Apple Silicon mediante MLX, con soporte para Apple GPU.
- Compatible con endpoints (endpoints_compatible) y con la librería transformers.
- No se especifican capacidades multimodales (visión, audio) en la información disponible.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se puede ejecutar con `mlx_lm.chat` y ofrece respuestas rápidas en equipos Apple Silicon, ideal para uso personal sin depender de servicios en la nube.
- Desarrollo de código asistido: gracias a sus capacidades de codificación y tool use, puede integrarse en flujos de trabajo de desarrollo como generador de snippets, explicación de código o soporte en tareas de refactorización.
- Agentes con uso de herramientas: el soporte de tool calling permite construir agentes que llaman a funciones externas, por ejemplo para consultar APIs, ejecutar comandos o interactuar con bases de datos.
- Análisis de documentos extensos: la ventana de contexto de 262.144 tokens posibilita procesar informes, contratos o artículos largos completos sin truncamiento, manteniendo coherencia en conversaciones de múltiples turnos.
- Prototipado de aplicaciones de IA en macOS: los desarrolladores pueden usar la API de Python de mlx-lm para integrar el modelo en aplicaciones nativas de Apple, aprovechando la GPU unificada.
- Investigación y evaluación de modelos cuantizados: esta variante 4-bit sirve para estudiar el impacto de la cuantización en el rendimiento y la calidad, en comparación con las versiones 8-bit y 16-bit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye estimaciones de rendimiento de inferencia en Apple Silicon, que se presentan a continuación como referencia de velocidad y latencia:

| Apple Silicon Tier | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado | Uso recomendado |
|---|---|---|---|---|---|
| M1/M2/M3/M4 (base) | 16 GB | ~5,4 GB | ~28 tokens/s | ~141 ms | Asistente interactivo de uso diario |
| M1/M2/M3/M4 Pro | 18-36 GB | ~5,4 GB | ~42 tokens/s | ~96 ms | Uso equilibrado para código y chat |
| M1/M2/M3/M4 Max | 36-128 GB | ~5,4 GB | ~60 tokens/s | ~59 ms | Generación de alto rendimiento |
| M1/M2/M3 Ultra | 64-192 GB | ~5,4 GB | ~84 tokens/s | ~39 ms | Servicio de producción y concurrencia |

Estas cifras son estimaciones basadas en el ancho de banda de memoria unificada y pueden variar según la longitud del contexto.

## Requisitos de hardware

- VRAM activa estimada: ~5,4 GB en cuantización 4-bit.
- Memoria unificada mínima recomendada: 16 GB.
- GPU: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max, Ultra). No es compatible con GPU NVIDIA o AMD.
- Tamaño en disco: ~5,1 GB.
- Opciones de despliegue: mlx-lm (CLI y API Python), LM Studio con configuración de stop strings, y cualquier runtime compatible con MLX.
- Latencia y throughput: entre 28 y 84 tokens/s según el chip, con TTFT entre 39 y 141 ms (estimaciones).
- Para calidad superior, se recomienda usar las variantes 8-bit (requiere ~9,9 GB) o 16-bit (requiere ~18,8 GB).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría en los datos proporcionados. La única comparación posible es entre las variantes de cuantización del propio NeoHorse-1-9B:

| Variante | Tamaño en disco | VRAM | Hardware objetivo | Ventaja principal |
|---|---|---|---|---|
| 4-bit MLX (esta ficha) | ~5,3 GB | ~5,3 GB | M1/M2/M3/M4 (8 GB+) | Máxima velocidad y menor consumo de RAM |
| 8-bit MLX | ~9,9 GB | ~9,9 GB | M1/M2/M3/M4 Pro/Max (16 GB+) | Equilibrio entre precisión y velocidad |
| 16-bit MLX | ~18,8 GB | ~18,8 GB | M2/M3/M4 Max/Ultra (32 GB+) | Precisión completa sin pérdida de calidad |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; inherente a los modelos generativos de lenguaje.
- Idiomas soportados: no especificados; no se puede confirmar cobertura multilingüe.
- La cuantización 4-bit puede reducir ligeramente la calidad de razonamiento y codificación frente a las versiones 8-bit o 16-bit.
- El modelo está limitado a hardware Apple Silicon; no puede ejecutarse en GPU CUDA sin conversión previa.
- Es una conversión realizada por un tercero (SirSahOl); la garantía de calidad depende del autor original.
- Para evitar bucles de generación, se recomienda configurar los tokens de parada `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` en el runtime de inferencia.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base TokenRhythm/NeoHorse-1-9B mantenga la misma licencia.

## Enlaces

- Modelo HuggingFace: https://huggingface.co/SirSahOl/NeoHorse-1-9B-chat-mlx-4bit
- Variante 8-bit: https://huggingface.co/SirSahOl/NeoHorse-1-9B-chat-mlx-8bit
- Variante 16-bit: https://huggingface.co/SirSahOl/NeoHorse-1-9B-chat-mlx-16bit
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-9B
- Framework MLX: https://github.com/ml-explore/mlx
- Referencia arxiv: arxiv:2609.08183 (según tags del modelo)
