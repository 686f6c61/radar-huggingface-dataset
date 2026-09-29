# nomadoor/Qwen3.5

## Resumen

nomadoor/Qwen3.5 es un repositorio de HuggingFace publicado por el usuario nomadoor que contiene pesos cuantizados, no un modelo entrenado desde cero. En concreto, ofrece dos conversiones del fichero `text_encoders/qwen3.5_4b_bf16.safetensors` distribuido por Comfy-Org/Qwen3.5, cuyo modelo base declarado es Qwen/Qwen3.5-4B. El propósito es servir como text encoder en flujos de ComfyUI reduciendo el consumo de VRAM y el ancho de banda de memoria frente a la versión bf16 original.

El repositorio incluye dos ficheros: `qwen3.5_4b_int8_convrot` (int8 ConvRot, grupos de 256 con escalas por fila) y `qwen3.5_4b_fp8_scaled` (fp8 e4m3fn con escala por tensor). El autor recomienda la variante int8 por mantenerse más cerca de bf16. Solo se cuantizan las capas lineales del modelo de lenguaje; los embeddings, las normalizaciones, el codificador de visión y la cabeza MTP permanecen en bf16, todo ello en el formato `comfy_quant` de ComfyUI.

La relevancia es práctica: el modelo base ronda los 4.000 millones de parámetros y, en bf16, obliga a reservar una cantidad notable de VRAM que compite con el modelo de difusión y el VAE. Estas conversiones permiten ejecutar el text encoder en GPUs de consumo, a costa de una pérdida de fidelidad numérica que el autor no cuantifica con métricas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-4B; la model card menciona codificador de visión y cabeza MTP) |
| Parametros totales | ~4.000 millones (según la denominación del modelo base, Qwen3.5-4B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 ConvRot (grupo 256, escalas por fila); fp8 e4m3fn (escala por tensor); bf16 en el original |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato `comfy_quant` (librería declarada: diffusion-single-file) |
| Modelo base | Qwen/Qwen3.5-4B, vía Comfy-Org/Qwen3.5 |
| Ficheros incluidos | `qwen3.5_4b_int8_convrot`, `qwen3.5_4b_fp8_scaled` |
| Tamaño del repositorio | 11,5 GB |
| Partes no cuantizadas | embeddings, normalizaciones, codificador de visión y cabeza MTP (bf16) |
| Ubicación de uso | `ComfyUI/models/text_encoders` |
| Descargas / likes | 0 / 0 |
| Fecha de creación en HuggingFace | 2026-09-29 |

## Arquitectura y entrenamiento

No hay entrenamiento implicado: se trata de un proceso de cuantización post-entrenamiento (PTQ) aplicado a un fichero bf16 ya existente. El autor indica que "nada más se cambia" respecto al original de Comfy-Org, es decir, que no hay ajuste fino, destilación ni calibración documentada. La arquitectura subyacente es la del modelo Qwen/Qwen3.5-4B, que la model card describe indirectamente al señalar que el codificador de visión y la cabeza MTP quedan sin cuantizar, lo que implica que el artefacto conserva esos componentes.

El alcance de la cuantización está acotado explícitamente: solo las capas lineales del modelo de lenguaje. En la variante int8 se emplea el esquema ConvRot con grupos de 256 elementos y escalas por fila; en la variante fp8 se usa e4m3fn con una única escala por tensor, lo que es un esquema más agresivo y, según el autor, potencialmente menos fiel a bf16. No se documentan hiperparámetros de calibración, número de tokens de calibración ni scripts de conversión reproducibles.

## Capacidades

- Codificación de texto (prompt conditioning) para flujos de difusión en ComfyUI que utilizan Qwen3.5-4B como text encoder.
- Conservación del codificador de visión en bf16, por lo que el artefacto mantiene la ruta multimodal del modelo base tal y como se distribuye en Comfy-Org/Qwen3.5.
- Conservación de la cabeza MTP (multi-token prediction) en bf16.
- Ejecución con menor huella de VRAM y de disco que el fichero bf16 equivalente, al cuantizar las capas lineales del modelo de lenguaje.
- Compatibilidad con el formato `comfy_quant` de ComfyUI para la carga de los ficheros.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; este repositorio se distribuye como text encoder, no como agente.
- Capacidades multilingües: no disponible; no se declaran idiomas en los metadatos ni en la model card.
- Otras capacidades del modelo base (generación de texto, código, matemáticas): no disponibles en este repositorio, que no documenta su uso como LLM generativo.

## Casos de uso

- Inferencia de difusión en GPU de consumo: al reducir el peso del text encoder, una máquina con 12 GB de VRAM puede destinar más memoria al modelo de difusión y al VAE en lugar de reservarla al codificador de texto en bf16.
- Servidores ComfyUI multiusuario: un encoder más ligero permite mantener varias instancias o flujos precargados en la misma GPU, al disminuir la memoria residente por proceso.
- Elección entre int8 y fp8 según el compromiso calidad/memoria: el usuario puede evaluar ambas variantes con los mismos prompts y comparar el resultado generado para decidir cuál le conviene.
- Validación A/B en CI: comparar las imágenes o latentes producidos con el encoder cuantizado frente a los del bf16 original con un conjunto fijo de prompts, para detectar degradaciones antes de desplegar.
- Prototipado en portátiles y GPUs de gama media: tarjetas de 8-12 GB o instancias cloud económicas (T4, L4) pueden alojar el encoder con offload parcial a RAM del sistema.
- Reducción del tiempo de carga en frío: ficheros de menor tamaño implican menos lectura de disco y menos transferencia a VRAM al iniciar ComfyUI.
- Análisis de fidelidad de la cuantización: el repositorio sirve como material para estudiar el impacto de int8 ConvRot frente a fp8 por tensor en pesos de un transformer multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de calidad (por ejemplo, similitud de embeddings, CLIP score, FID o comparaciones de imágenes generadas) entre las variantes int8, fp8 y bf16. Tampoco se aportan medidas de latencia o throughput. La única valoración cualitativa del autor es que la variante int8 ConvRot "se mantiene más cerca de bf16" que la fp8.

## Requisitos de hardware

- Tamaño en disco: el repositorio completo ocupa 11,5 GB; cada fichero cuantizado ronda los 5,5-6 GB según el reparto del tamaño total (estimación, no confirmada por el autor).
- VRAM estimada: alrededor de 6-8 GB solo para los pesos del encoder, más activaciones y buffers de atención. En la práctica, entre 8 y 10 GB para una ejecución íntegra en GPU (estimación; el autor no publica cifras).
- RAM del sistema: si se recurre a offload, conviene disponer de al menos 6-8 GB libres para las capas descargadas de la GPU.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4070 y 4070 Ti Super (12-16 GB), RTX 4080 y 4090 (16-24 GB). En tarjetas de 8 GB es probable que haga falta offload a RAM o carga por capas.
- GPU de datacenter: A100, H100 y L40S sin limitación de capacidad; útiles para procesamiento por lotes o varias instancias concurrentes.
- Opciones de despliegue: ComfyUI, copiando el fichero en `ComfyUI/models/text_encoders`. El formato `comfy_quant` es específico de ComfyUI y no hay indicios en la información disponible de soporte en vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponible. Dependerán del modelo de difusión con el que se combine, no solo del encoder.

## Comparativa con modelos similares

Comparación entre las variantes incluidas en este repositorio y el original del que derivan:

| Variante | Formato | Escala | Tamaño aproximado | Fidelidad frente a bf16 | Comentario del autor |
|---|---|---|---|---|---|
| `qwen3.5_4b_int8_convrot` | int8 ConvRot, grupo 256 | Escalas por fila | ~5,5-6 GB (estimación) | Mayor | "Probablemente la mejor opción" |
| `qwen3.5_4b_fp8_scaled` | fp8 e4m3fn | Una escala por tensor | ~5,5-6 GB (estimación) | Menor | Alternativa más agresiva |
| `qwen3.5_4b_bf16.safetensors` (Comfy-Org/Qwen3.5) | bf16 | No aplica | No disponible | Referencia | Original sin modificar |
| Modelos comparables de otros text encoders | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos para comparar este artefacto con otros text encoders utilizados en ecosistemas de difusión, ni con otras cuantizaciones del mismo modelo base: no se han publicado cifras de rendimiento ni de calidad.

## Limitaciones y advertencias

- Pérdida de fidelidad numérica respecto a bf16 por la propia naturaleza de la cuantización; el autor afirma que int8 se aproxima más, pero no aporta métricas que lo respalden.
- Ausencia de validación independiente: el repositorio tiene 0 descargas y 0 likes en el momento de los metadatos, y se publicó el 2026-09-29, con lo que no hay evidencia de uso en producción.
- No se documenta el procedimiento de conversión ni se publican scripts reproducibles, lo que dificulta auditar los pesos.
- Formato propietario de facto: `comfy_quant` ata el artefacto al ecosistema ComfyUI y a versiones de la aplicación que reconozcan este formato; un ComfyUI antiguo podría no cargar los ficheros.
- Idiomas, longitud de contexto y resto de especificaciones del modelo base no están declarados en este repositorio; cualquier limitación del modelo base Qwen3.5-4B se hereda aquí.
- Licencia Apache-2.0 declarada en el repositorio, pero conviene verificar la licencia del modelo base en su propia ficha antes de un uso comercial, ya que este repositorio es una redistribución derivada.
- Riesgo de alucinación: no aplica en el sentido habitual, porque el artefacto codifica prompts en lugar de generar texto; el riesgo equivalente es una degradación del conditioning que se traduzca en imágenes menos fieles al prompt.
- Este repositorio no debe evaluarse como asistente conversacional: no incluye documentación de uso como LLM generativo ni plantillas de chat.
- El rendimiento final depende del pipeline de difusión completo; cuantizar solo el text encoder no garantiza una reducción proporcional del tiempo total de generación.

## Enlaces

- Repositorio del modelo: https://huggingface.co/nomadoor/Qwen3.5
- Text encoder original de Comfy-Org: https://huggingface.co/Comfy-Org/Qwen3.5
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
- Papers, blogs, repositorios o demos adicionales: no disponible en la información proporcionada.
