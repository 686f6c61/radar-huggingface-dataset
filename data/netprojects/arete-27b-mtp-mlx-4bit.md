# netprojects/Arete-27B-MTP-MLX-4bit

## Resumen

Arete-27B-MTP-MLX-4bit es una conversión al ecosistema MLX de Apple Silicon del modelo NousResearch/Arete-27B, un ajuste fino supervisado completo de Qwen3.8-27B orientado a respuestas factuales y directas sobre temas políticamente sensibles en siete áreas, preservando capacidades generales y agenticas. Lo publica el usuario netprojects, no Nous Research, y se distribuye con licencia Apache 2.0. El modelo es multimodal (image-text-to-text): mantiene la torre de visión en bfloat16 mientras cuantiza el modelo de lenguaje a 4 bits con cuantización afín de grupo 64.

La peculiaridad técnica de este build es la inclusión de una cabeza MTP (multi-token prediction) empaquetada como modelo borrador para decodificación especulativa, lo que acelera la generación. Según el autor, se midieron 20,5 tok/s en decodificación plana y 39,8 tok/s con MTP (factor 1,95x) con una tasa de aceptación del 75% en decodificación greedy. El repositorio ocupa 16,3 GB y contiene 27.781.427.952 parámetros totales.

Es relevante para desarrolladores que trabajan en Mac con Apple Silicon y necesitan ejecutar localmente un modelo de 27B multimodal con tool calling, razonamiento y visión, sin depender de GPUs NVIDIA ni de servicios en la nube. La ficha se centra en los datos disponibles en la model card y en los metadatos del Hub; no se han publicado resultados de benchmarks independientes de este build concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (hereda de Qwen3.8-27B); pesos en formato MLX con cuantización afín de grupo 64 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits (afín, grupo 64) para el modelo de lenguaje; torre de visión en bfloat16; existen builds de 2,5, 3, 6, 8 bits y bf16 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), cuantización 4-bit; incluye model-mtp.safetensors |

## Arquitectura y entrenamiento

El modelo subyacente, NousResearch/Arete-27B (revisión 108f0afb), es un ajuste fino supervisado completo de Qwen3.8-27B. Según la model card, el entrenamiento se realizó únicamente con datos de texto y el codificador de visión permaneció congelado. El objetivo del ajuste es mejorar la factualidad y reducir la propaganda en respuestas sobre temas políticamente sensibles en siete áreas, manteniendo las habilidades generales y agenticas del modelo base. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La conversión a MLX cuantiza el modelo de lenguaje a 4 bits con cuantización afín de grupo 64 y mantiene la torre de visión en bfloat16. La innovación destacable es la cabeza MTP: Arete-27B no incluye una cabeza MTP propia, por lo que el archivo model-mtp.safetensors es la cabeza MTP sin cambios de Qwen/Qwen3.8-27B (revisión 37561816), cuantizada al ancho de bits del build. Esta cabeza se entrenó contra el modelo base, no contra Arete-27B, y se usa como modelo borrador integrado en mlx-vlm para decodificación especulativa. El config.json del build fija mtp_num_hidden_layers a 1 (el original lo fija a 0) para que los cargadores detecten la cabeza empaquetada.

## Capacidades

- Generación de texto y razonamiento general, con respuestas factuales y directas sobre temas políticamente sensibles en siete áreas según el ajuste de Nous Research.
- Capacidades agenticas y de tool calling: usa el formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm devuelve como `tool_calls` de OpenAI.
- Capacidades de codificación: el autor reporta 3/3 en pruebas de coding para este build.
- Modo thinking: el modelo base lo soporta, pero Nous Research evaluó con thinking desactivado; mlx-vlm lo deja desactivado salvo que se pase `--enable-thinking`.
- Visión: pipeline image-text-to-text; la torre de visión se mantiene en bfloat16 y se usa con mlx-vlm (por ejemplo, para leer capturas de pantalla o terminales).
- Decodificación especulativa con MTP: factor medido de 1,95x en este build de 4 bits (20,5 a 39,8 tok/s), con 75% de aceptación.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente local en Mac para preguntas factuales sobre temas sensibles: el ajuste de Arete está diseñado para responder de forma directa y con menor tasa de propaganda (0,9% frente a 22% del base según Nous Research), lo que lo hace adecuado para entornos donde se requiere neutralidad.
- Análisis de capturas de pantalla y errores de terminal: con mlx-vlm se puede pasar una imagen y preguntar qué error muestra, útil para herramientas de soporte técnico en local.
- Automatización de agentes con tool calling: el formato XML de Qwen y la conversión a tool_calls de OpenAI permiten integrarlo en flujos de agentes que invocan funciones externas.
- Generación y revisión de código en local: el build reporta 3/3 en pruebas de coding y soporta tool calling, por lo que puede integrarse en pipelines de desarrollo en Apple Silicon sin GPU NVIDIA.
- Prototipado de asistentes conversacionales multi-turno: el modelo es conversacional y mantiene contexto de chat; la ventana exacta no está disponible en la información proporcionada.
- Experimentación con decodificación especulativa: al incluir la cabeza MTP de Qwen3.8-27B, sirve para estudiar el rendimiento de MTP sobre un fine-tune en MLX, con la advertencia de que la cabeza se entrenó contra el base.
- Evaluación de cuantización en Apple Silicon: el autor publica builds de 2,5 a 8 bits con métricas de fidelidad (mismo siguiente token que bf16, KL, GSM8K), lo que permite comparar el equilibrio tamaño/calidad en distintos Mac.

## Benchmarks y rendimiento

Los datos disponibles son los reportados por Nous Research para los pesos originales (no para este build) y las métricas de fidelidad de cuantización del autor. No se han publicado resultados de benchmarks independientes de este build en la información disponible.

| Medida | Arete-27B | Qwen3.8-27B |
|---|---:|---:|
| Fact score (media) | 2,98 | 2,32 |
| Respuestas con propaganda (803 prompts, thinking off) | 0,9% | 22% |
| Hermes Bench | 65,60 | 65,77 |
| Terminal-Bench-2.1 | 70 | 67 |

Métricas de fidelidad del build de 4 bits frente a bf16:

| Métrica | Valor |
|---|---|
| Mismo siguiente token que bf16 | 95,5% |
| KL frente a bf16 | 0,0232 |
| GSM8K (50 preguntas) | 47/50 |
| Tool call / coding / thinking / vision | pass / 3/3 / 2/2 / pass |

Rendimiento de decodificación medido en MacBook Pro M5 Max (128 GB), 19 de noviembre de 2026, con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11:

| Build | Tok/s plano | Tok/s con MTP | Factor | Aceptación |
|---|---:|---:|---:|---:|
| 4-bit | 20,5 | 39,8 | 1,95x | 75% |
| 8-bit | 13,1 | 28,6 | 2,18x | 77% |

## Requisitos de hardware

- VRAM/memoria unificada: el build de 4 bits ocupa 16,3 GB en disco; el pico de memoria para un prompt de 8K tokens no está disponible para este build en la información proporcionada (el build de 3 bits reporta 14,6 GB y el de 2,5 bits 13,8 GB).
- Mac recomendado: el autor indica que el 4-bit es más pequeño que el 6-bit recomendado; la tabla de builds sugiere que los de 3 y 2,5 bits van a Macs de 24 GB o más, pero para el 4-bit no se especifica el Mac mínimo en la información proporcionada.
- GPU: el modelo está pensado para Apple Silicon (MLX); no se proporcionan requisitos para GPU NVIDIA (A100, H100, RTX 4090) en la información disponible.
- Despliegue: mlx-lm (>=0.32.2) para texto y mlx-vlm (>=0.7.11) para imágenes; el servidor de mlx-lm expone tool_calls en formato OpenAI.
- Latencia/throughput: 20,5 tok/s en plano y 39,8 tok/s con MTP en el build de 4 bits sobre M5 Max, decodificación greedy.
- La cabeza MTP se activa pasando el mismo repositorio como `--draft-model` con `--draft-kind mtp`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| netprojects/Arete-27B-MTP-MLX-4bit | 27,8B | no disponible | Apache 2.0 | Hugging Face (MLX) | Build 4-bit con MTP, 16,3 GB |
| netprojects/Arete-27B-MTP-MLX-6bit | no disponible | no disponible | Apache 2.0 | Hugging Face (MLX) | Recomendado por el autor, 23,1 GB, 98,7% mismo token, KL 0,0018 |
| netprojects/Arete-27B-MTP-MLX-8bit | no disponible | no disponible | Apache 2.0 | Hugging Face (MLX) | 29,9 GB, 99,1% mismo token, KL 0,0005, 2,18x con MTP |
| NousResearch/Arete-27B | 27,8B (base) | no disponible | Apache 2.0 | Hugging Face | Pesos originales en bf16; referencia de calidad |

No se dispone de comparación con modelos de otros ecosistemas (por ejemplo, variantes GGUF o de otros proveedores) en la información proporcionada.

## Limitaciones y advertencias

- La cabeza MTP no se entrenó contra Arete-27B sino contra Qwen3.8-27B, por lo que es una cabeza de modelo base sobre un fine-tune; su rendimiento puede no ser óptimo.
- Con decodificación greedy, el texto generado con MTP coincide con la decodificación plana hasta un empate cercano, donde la comprobación por lotes puede redondear al otro lado; respuestas largas pueden divergir ligeramente.
- Las ganancias de MTP dependen del prompt y pueden ser menores que las cifras reportadas en textos distintos a los de prueba.
- El ajuste de Arete se entrenó solo con texto y con el codificador de visión congelado; las capacidades de visión no se ajustaron específicamente.
- Nous Research evaluó con thinking desactivado; el comportamiento con thinking activado puede diferir.
- No se especifican sesgos conocidos, idiomas soportados ni longitud de contexto en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se reportan métricas específicas de alucinación para este build.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las licencias de los componentes heredados (Qwen3.8-27B y la cabeza MTP de Qwen).
- El modelo es de noviembre de 2026 y tiene 0 descargas y 0 likes en el Hub; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-4bit
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Build de 6 bits: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-8bit
- Build de 3 bits: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-3bit
- Build de 2,5 bits: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-bf16
- Qwen3.8-27B (origen de la cabeza MTP): https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-4bit/blob/main/LICENSE
