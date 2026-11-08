# aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-fp16

## Resumen

Esta ficha describe `aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-fp16`, una conversión al formato MLX (Apple Silicon) del ajuste fino `kevinzhou21/Qwen3.5-9B-Distill-Deepseek-V4.1-Flash-20261004`. Se trata de un modelo de lenguaje y visión (VLM) de 9.409.813.744 parámetros derivado de Qwen3.5-9B, que a su vez ha sido destilado a partir de respuestas generadas por DeepSeek-V4.1-Flash. El resultado es un modelo de 9B con torre de visión, pensado para ejecutarse en hardware Apple mediante la librería MLX.

El modelo resuelve el problema de disponer de un VLM de referencia en precisión fp16 listo para inferencia local en Mac, sin necesidad de cuantización. La conversión conserva el modelo completo (texto y visión) y mantiene en fp16 los tensores sensibles: normas, kernels convolucionales, embedding posicional de visión y la capa `mlp.linear_fc2` de la torre visual. El repositorio ocupa 18,8 GB.

Es relevante ahora porque forma parte de una familia de variantes cuantizadas (fp16, 8-bit mixto, 8-bit, 6-bit) que permiten elegir el equilibrio entre calidad y huella de memoria en Apple Silicon. La ficha se centra en la variante fp16, que sirve como referencia de calidad para las demás. La licencia declarada es Apache-2.0, heredada de Qwen3.5-9B, aunque el ajuste fino de origen no declara licencia propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal híbrida (GatedDeltaNet) y torre de visión; familia Qwen3.5 |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (este repo); variantes 8-bit mixto, 8-bit y 6-bit en repos hermanos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 18,8 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3.5 con un bloque de atención lineal basado en GatedDeltaNet, tal como se deduce de las notas de conversión (correcciones sobre `A_log`, `linear_attn.norm` y el reordenamiento de cabezas de valor). Incluye además una torre de visión completa, por lo que el pipeline es `image-text-to-text`. El modelo base es un ajuste fino LoRA de Qwen3.5-9B destilado a partir de DeepSeek-V4.1-Flash; la información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

La conversión se realizó con gguf2mlx 2.2.0 más correcciones, partiendo de los GGUF `F16` y `BF16-mmproj` del repositorio de origen. Se aplicaron tres correcciones sobre la atención lineal (deshacer el reordenamiento de cabezas de valor de llama.cpp, aplicar `A_log = log(-ssm_a)` y eliminar un −1 espurio en `linear_attn.norm`), tras lo cual esos tensores coinciden con `Qwen/Qwen3.5-9B` en precisión fp16. La torre de visión se convirtió con un mapeador propio y es idéntica bit a bit a la de Qwen3.5-9B (333/333 tensores). El tokenizador, la configuración del procesador y la plantilla de chat provienen de Qwen3.5-9B. No se incluye la cabeza MTP/NextN.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y respuesta imagen-texto (pipeline `image-text-to-text`).
- Modo de razonamiento explícito mediante etiquetas `<think>…</think>`, activado por defecto en la plantilla de chat y desactivable con `enable_thinking=False`.
- Razonamiento matemático y de código, según la naturaleza del ajuste fino destilado (la model card no detalla evaluaciones).
- Integración con `mlx-vlm` para entrada de imágenes y con `mlx-lm` para uso solo de texto.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente conversacional local en Mac: con 18,8 GB en fp16, se puede ejecutar en equipos Apple con memoria unificada suficiente usando `mlx-lm`, ofreciendo conversaciones multi-turno sin conexión.
- Descripción y análisis de imágenes en local: mediante `mlx-vlm` y el pipeline `image-text-to-text`, útil para catalogar fotos, extraer texto de capturas o responder preguntas sobre diagramas.
- Referencia de calidad para cuantización: la variante fp16 sirve como baseline para medir la degradación de las variantes 8-bit y 6-bit (perplejidad, KL y acuerdo top-1) antes de desplegar una versión más ligera.
- Prototipado de aplicaciones VLM en Apple Silicon: LM Studio permite descargar y ejecutar el modelo con entrada de imagen, lo que facilita pruebas de concepto sin infraestructura GPU.
- Razonamiento asistido con trazas: el modo thinking por defecto permite obtener cadenas de razonamiento para tareas de matemáticas o lógica, desactivable cuando se prioriza latencia.
- Evaluación de ajustes finos destilados: investigadores pueden comparar este destilado de DeepSeek-V4.1-Flash con el Qwen3.5-9B original para estudiar el efecto de la destilación en un modelo de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas internas de fidelidad de cuantización medidas sobre un pasaje de 135 tokens (inglés/código/matemáticas) frente al modelo fp16:

| Variante | bits/peso | Tamano | Perplejidad | KL medio vs fp16 | Acuerdo top-1 |
|---|---|---|---|---|---|
| fp16 (este repo) | 16 | 18 GB | 4,081 | – | – |
| 8-bit mlp + 16-bit resto | 12,0 | 13 GB | 4,085 | 0,00007 | 100% |
| 8-bit | 8,6 | 9,5 GB | 4,086 | 0,00017 | 99,3% |
| 6-bit | 6,6 | 7,3 GB | 4,106 | 0,0027 | 96,3% |

El propio autor advierte que estas cifras son una comprobación rápida de sanidad, no un benchmark.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 18,8 GB de pesos en fp16, más overhead de contexto y de la torre de visión; se recomienda al menos 24-32 GB de memoria unificada para uso cómodo.
- Hardware objetivo: Apple Silicon (MLX). No está pensado para GPU NVIDIA; para esas plataformas habría que usar los GGUF del repositorio de origen.
- Cabe en Mac con 32 GB o más (M1/M2/M3/M4 Pro, Max o Ultra). En equipos de 16 GB no es viable en fp16; habría que recurrir a la variante 6-bit (7,3 GB) o 8-bit (9,5 GB).
- Opciones de despliegue: LM Studio (motor MLX, con entrada de imagen), `mlx-vlm` para texto e imágenes, `mlx-lm` para solo texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (fp16 MLX) | 9,41B | no disponible | Sí | Apache-2.0 | safetensors MLX |
| Qwen3.5-9B (base) | ~9B | no disponible | Sí (misma torre) | Apache-2.0 | safetensors |
| DeepSeek-V4-Pro-Qwen3.5-9B (Jackrong) | ~9B | no disponible | no disponible | no disponible | no disponible |
| Qwen3.5-9B-Distill-Deepseek-V4.1-Flash-20261003 (kevinzhou21) | ~9B | no disponible | Sí | no disponible | GGUF |

La comparación se limita a la categoría de modelos de 9B derivados de Qwen3.5; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- El repositorio de origen no declara licencia; la Apache-2.0 se aplica por herencia de Qwen3.5-9B. Conviene revisar los términos del repositorio de `kevinzhou21` antes de un uso comercial.
- Es una conversión de comunidad con 0 descargas y 0 likes en el momento de la consulta; no ha pasado por una validación amplia de terceros.
- Las métricas de fidelidad de cuantización se basan en un único pasaje de 135 tokens y no constituyen una evaluación robusta.
- No se documentan idiomas soportados, longitud de contexto ni sesgos conocidos; el riesgo de alucinación es el habitual en modelos de 9B y no está cuantificado.
- El modo thinking está activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva explícitamente.
- Solo funciona en el ecosistema MLX (Apple Silicon); no es portable a CUDA sin reconvertir desde los GGUF de origen.
- La cabeza MTP/NextN no está incluida, por lo que no se puede usar decodificación especulativa con ese módulo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-fp16
- Modelo base del ajuste fino: https://huggingface.co/kevinzhou21/Qwen3.5-9B-Distill-Deepseek-V4.1-Flash-20261004
- Variante GGUF relacionada: https://huggingface.co/kevinzhou21/Qwen3.5-9B-Distill-Deepseek-V4.1-Flash-20261003
- Variante 8-bit mixta: https://huggingface.co/aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-8bit-mlp-16bit-rest
- Variante 8-bit: https://huggingface.co/aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-8bit
- Variante 6-bit: https://huggingface.co/aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-6bit
- Modelo Qwen3.5-9B original: https://huggingface.co/Qwen/Qwen3.5-9B
- Ajuste fino comparable de Jackrong: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
