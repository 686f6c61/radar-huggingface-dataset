# casperhansen/Qwen3.8-27B-W4A8

## Resumen

Qwen3.8-27B-W4A8 es una cuantización integer-only en formato W4A8 del modelo Qwen/Qwen3.8-27B, publicada por el usuario casperhansen. El modelo base es un vision-language model denso de aproximadamente 27-28 mil millones de parámetros desarrollado por el equipo Qwen, orientado a comprensión de texto, imagen y vídeo, razonamiento multimodal, generación de código, procesamiento de contexto largo, tool calling y tareas agénticas. La cuantización reduce el checkpoint de unos 56 GB en BF16 a 17 GB.

El interés de esta ficha no reside en el modelo base, sino en el formato de cuantización: un esquema W4A8 pensado específicamente para aceleradores que solo realizan aritmética entera (FPGAs, NPUs y similares). Todas las capas lineales del modelo de lenguaje, salvo la proyección de entrada MTP `mtp.fc`, almacenan pesos enteros simétricos INT4 con una escala por canal de salida y sin punto cero, mientras que las activaciones se cuantizan dinámicamente a INT8 con una escala por token en tiempo de inferencia.

La receta es deliberadamente simple y no requiere datos de calibración: redondeo al más cercano con búsqueda MSE de clipping para los pesos, absmax simétrico dinámico por token para las activaciones, y requantización a partir de los pesos FP8 oficiales de Qwen dequantizados a BF16. No emplea GPTQ, rotaciones, smoothing ni entrenamiento adicional. El checkpoint se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (Gated DeltaNet) y atención completa, más capa MTP y encoder de visión |
| Parametros totales | 29.052.826.352 (según safetensors del checkpoint) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | W4A8 integer-only: pesos INT4 por canal de salida, activaciones INT8 dinámicas por token; `lm_head` en INT8; resto en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con formato compressed-tensors `pack-quantized` (int32 empaquetado + escalas bfloat16 por canal) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer híbrida que combina capas de atención lineal basadas en Gated DeltaNet (`in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b`, `out_proj`) con capas de atención completa (`q_proj` con puerta de salida, `k_proj`, `v_proj`, `o_proj`), además de un encoder de visión (`model.visual.*`) para el procesamiento de imagen y vídeo. Incluye una capa MTP (multi-token prediction) con la misma estructura que una capa decodificadora. La convolución causal depthwise de 4 taps (`linear_attn.conv1d`) y las normalizaciones RMSNorm permanecen en BF16.

Esta cuantización no modifica el entrenamiento del modelo base: parte de los pesos FP8 oficiales (`Qwen/Qwen3.8-27B-FP8`), los dequantiza a BF16 y los requantiza. Para los pesos aplica redondeo al más cercano con una escala por canal de salida elegida mediante una búsqueda en rejilla sobre ratios de clipping que minimiza el error de cuantización de cada fila; según el autor, esto reduce el error de los pesos INT4 en aproximadamente un tercio frente al escalado absmax simple. Las activaciones se cuantizan online a INT8 con absmax simétrico por token, sin escalas estáticas ni calibración, y sin manejo de outliers (ni rotaciones ni smoothing). La acumulación se realiza en enteros exactos dentro de INT32: para `down_proj` con K ≤ 17408 el acumulador queda acotado a unos 17,7 millones, y para `lm_head` con K = 5120 a unos 83,2 millones.

El formato de almacenamiento usa tres tensores por módulo cuantizado: `weight_packed` (int32 empaquetado a lo largo de la dimensión de entrada, LSB primero, 8 códigos INT4 o 4 INT8 por palabra), `weight_scale` (bfloat16, forma `[out, 1]`) y `weight_shape` (`[out, in]`). Los códigos INT4 van en [-8, 7] e INT8 en [-128, 127], sin punto cero, y todas las dimensiones de entrada son múltiplos de 32 para que ningún código cruce una frontera de palabra. El autor incluye una implementación de referencia en PyTorch para desempaquetar los tensores.

## Capacidades

- Generación de texto y razonamiento multimodal: el modelo base está descrito como vision-language model para texto, imagen y vídeo.
- Comprensión de imágenes y vídeo, incluyendo tareas de image-text-to-text (pipeline declarado en Hugging Face).
- Generación de código y tareas de programación.
- Razonamiento multimodal y matemáticas (según la descripción del modelo base en NGC).
- Tool calling y function calling.
- Tareas agénticas y razonamiento multi-paso.
- Procesamiento de contexto largo.
- Capa MTP (multi-token prediction) presente en el checkpoint.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores integer-only: el formato W4A8 con acumulación INT32 exacta está diseñado para FPGAs y NPUs que solo hacen aritmética entera, lo que permite ejecutar un modelo de 27B en hardware sin unidades de coma flotante para matmuls.
- Inferencia con memoria reducida: el checkpoint de 17 GB frente a los ~56 GB en BF16 permite cargar el modelo en dispositivos con presupuesto de memoria limitado, manteniendo las partes no matriciales (norms, softmax, RoPE, estado recurrente de Gated DeltaNet) en el formato de coma fija que elija el hardware destino.
- Asistentes multimodales sobre imagen y vídeo: el encoder de visión se conserva en BF16, de modo que el modelo puede seguir realizando image-text-to-text en aplicaciones de descripción, extracción de información o respuesta sobre documentos visuales.
- Automatización de tareas con tool calling: el modelo base soporta function calling y flujos agénticos, por lo que puede integrarse en orquestadores que encadenen llamadas a APIs.
- Procesamiento de contexto largo: orientado a documentos extensos y conversaciones multi-turno, siempre que el hardware destino soporte la ventana de contexto del modelo base.
- Investigación en cuantización: la receta sin calibración, con búsqueda MSE de clipping y activaciones dinámicas por token, sirve como referencia reproducible para estudiar el impacto del esquema W4A8 en modelos híbridos con atención lineal.
- Generación de código en pipelines internos: el modelo base cubre tareas de programación y puede integrarse en herramientas de asistencia al desarrollo sobre infraestructura entera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 17 GB en disco; el peso en memoria de los tensores cuantizados es de aproximadamente esa cifra, más el encoder de visión, embeddings, norms y el estado recurrente en BF16 o coma fija, por lo que conviene prever margen adicional sobre los 17 GB.
- GPU recomendadas: no disponibles para este formato; el esquema está pensado para FPGAs y NPUs con aritmética entera, no para GPUs convencionales.
- ¿Cabe en GPU de consumo? El tamaño de 17 GB podría caber en GPUs con 24 GB o más, pero el formato integer-only requiere kernels específicos que no se documentan en la información disponible.
- Opciones de despliegue: la librería declarada es transformers con formato compressed-tensors; el autor incluye una implementación de referencia en PyTorch para desempaquetar los pesos. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| casperhansen/Qwen3.8-27B-W4A8 | 29,05 B | No disponible | W4A8 integer-only, 17 GB | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B | ~27-28 B | No disponible | BF16 (original) | No disponible en la información | Hugging Face, NVIDIA NGC |
| Qwen/Qwen3.8-27B-FP8 | No disponible | No disponible | FP8 | No disponible en la información | Hugging Face |

## Limitaciones y advertencias

- El formato W4A8 integer-only requiere kernels y hardware compatibles; no es un checkpoint listo para ejecutarse en GPUs convencionales con transformers estándar sin trabajo de integración adicional.
- Las activaciones se cuantizan sin manejo de outliers (sin rotaciones ni smoothing), lo que puede degradar la calidad en capas con valores extremos; el autor no publica evaluaciones de degradación.
- La cuantización no se ha validado con benchmarks en la información disponible; se desconoce la pérdida de precisión frente al modelo base.
- El encoder de visión, los embeddings, las RMSNorm, `A_log`, `dt_bias` y `mtp.fc` permanecen en BF16, por lo que el hardware destino debe soportar también operaciones en coma flotante para esas partes.
- El checkpoint no prescribe formato para las operaciones no matriciales (softmax, SiLU, RoPE, estado recurrente) ni para la caché KV; esa decisión queda en manos del implementador.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada para el modelo base ni para la cuantización.
- Idiomas soportados: no disponibles; conviene verificar el comportamiento multilingüe antes de usarlo en producción.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base y el checkpoint FP8 de origen no tienen licencia confirmada en la información disponible.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- [casperhansen/Qwen3.8-27B-W4A8 en Hugging Face](https://huggingface.co/casperhansen/Qwen3.8-27B-W4A8)
- [Qwen/Qwen3.8-27B en Hugging Face](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Qwen/Qwen3.8-27B-FP8 en Hugging Face](https://huggingface.co/Qwen/Qwen3.8-27B-FP8)
- [Qwen3.8-27B en NVIDIA NGC](https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/)
- [compressed-tensors en GitHub](https://github.com/neuralmagic/compressed-tensors)
