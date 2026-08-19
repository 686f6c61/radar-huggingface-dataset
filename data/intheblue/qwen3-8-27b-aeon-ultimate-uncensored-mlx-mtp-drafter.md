# intheblue/Qwen3.8-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter

## Resumen

El repositorio `intheblue/Qwen3.8-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter` no contiene un modelo de lenguaje completo, sino el **cabezal nativo de multi-token prediction (MTP)** del modelo `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, extraído y convertido al formato de drafter que espera `mlx-vlm` para decodificación especulativa. Este drafter permite acelerar la inferencia del modelo base en hardware Apple Silicon mediante self-speculation, sin pérdida de calidad, ya que los drafts rechazados se descartan y se usan los tokens del modelo objetivo.

El autor, `intheblue`, ha publicado este componente como complemento del modelo multimodal cuantizado `Qwen3.8-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-6bit`. El drafter pesa 810 MB en BF16, contiene 15 tensores y está diseñado para un tamaño de bloque de 3 tokens, que según las mediciones del autor es el punto óptimo entre velocidad y precisión de aceptación. Es relevante porque permite ejecutar un modelo de 27B con decodificación especulativa en equipos con memoria unificada moderada, mejorando el rendimiento entre 1.4× y 1.9× según la carga de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezal MTP (multi-token prediction) de Qwen3.8, extraído del modelo base AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 |
| Parametros totales | 424.699.392 (aprox. 424M) |
| Parametros activos | No aplica (no es un modelo MoE; es un drafter denso) |
| Longitud de contexto | No disponible (depende del modelo base; el Qwen3.8-27B soporta hasta 256K) |
| Tipos de cuantizacion | BF16 (formato nativo del drafter) |
| Idiomas soportados | No disponibles (el drafter no procesa lenguaje directamente) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con metadatos MLX (`format: mlx`) |

## Arquitectura y entrenamiento

El drafter es la **cabeza MTP original entrenada por Qwen** para el modelo Qwen3.8, que fue injertada de nuevo en el modelo AEON mediante una revisión específica (`8f76e82`). No ha sido reentrenada: se trata de una extracción directa de los 15 tensores `mtp.*` del modelo base, realizada con la herramienta oficial de división de `mlx_vlm` (`mlx_vlm.speculative.drafters.qwen3_5_mtp.split`). Esta herramienta aplica la convención de desplazamiento de pesos de RMSNorm y sella los metadatos `format: mlx`, algo imprescindible para que el drafter funcione correctamente; una extracción manual de los tensores produciría un drafter con 0% de aceptación.

El mecanismo de decodificación especulativa es **lossless**: los tokens propuestos por el drafter se verifican contra el modelo objetivo y, si se rechazan, se sustituyen por los tokens reales del modelo base. El tamaño de bloque recomendado es 3, ya que a partir de 5 la precisión de los drafts decae y el rendimiento empeora.

## Capacidades

- **Decodificación especulativa MTP**: acelera la generación autoregresiva del modelo Qwen3.8-27B en MLX, proponiendo múltiples tokens por paso.
- **Self-speculation**: el drafter es una cabeza nativa del propio modelo base, por lo que no requiere un modelo auxiliar externo entrenado aparte.
- **Compatibilidad con mlx-vlm**: funciona con cualquier cuantización MLX del mismo modelo base, incluyendo la versión multimodal 6-bit publicada por el mismo autor.
- **Lossless**: no degrada la calidad de salida; los drafts rechazados se descartan automáticamente.
- **Optimizado para Apple Silicon**: diseñado para ejecutarse en MLX, aprovechando la memoria unificada de los chips M-series.

## Casos de uso

- **Inferencia local acelerada en Mac**: en un Mac mini M4 Pro de 48 GB, con el modelo base en 6-bit, la generación de código pasa de 11,4 a 21,5 tokens/s (1,90×) usando el drafter, lo que permite usar el modelo de 27B en tareas de programación asistida con latencia aceptable.
- **Razonamiento sobre documentos largos**: en consultas de QA con contexto de 13K tokens, el rendimiento sube de ~11 a 16,9 tokens/s, facilitando el análisis de documentación extensa en local sin depender de APIs externas.
- **Generación creativa de prosa**: con temperatura 0,7, la velocidad mejora 1,4× (de 11,4 a 15,9 tokens/s), haciendo viable la escritura asistida en tiempo real en un portátil Apple.
- **Despliegue de asistentes conversacionales sin censura**: al combinarse con el modelo base AEON "uncensored", permite montar chatbots locales con respuestas sin restricciones de seguridad, acelerados por el drafter.
- **Prototipado de aplicaciones multimodales**: junto con la versión multimodal 6-bit, permite experimentar con entrada de imagen y texto en MLX con mejor throughput.
- **Investigación en decodificación especulativa**: el repositorio sirve como referencia de cómo extraer y usar cabezales MTP nativos en MLX, útil para estudiar la dinámica de aceptación de drafts en diferentes cargas de trabajo.

## Benchmarks y rendimiento

El autor publicó mediciones en un Mac mini M4 Pro de 48 GB, con el modelo objetivo en 6-bit. Los resultados son los siguientes:

| Carga de trabajo | Sin drafter (serial) | Con drafter | Aceleración |
|---|---|---|---|
| Codigo (temp 0,2, block 4) | 11,4 tok/s | 21,5 tok/s | 1,90× |
| QA de documentos @ 13k ctx (block 3) | ~11 tok/s | 16,9 tok/s | ~1,54× |
| Prosa creativa (temp 0,7, block 3) | 11,4 tok/s | 15,9 tok/s | 1,40× |

La tasa de aceptación de drafts es de aproximadamente 46% en prosa abierta, y mayor en salidas estructuradas como código. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el drafter no es un modelo generativo independiente.

## Requisitos de hardware

- **VRAM estimada**: el drafter ocupa 810 MB en BF16, pero se carga junto con el modelo base cuantizado. Para el modelo de 27B en 6-bit se necesitan aproximadamente 17 GB de memoria unificada según las especificaciones del Qwen3.8-27B.
- **GPU recomendadas**: Apple Silicon con al menos 32 GB de memoria unificada (el autor usó un Mac mini M4 Pro de 48 GB). También es compatible con cualquier sistema que ejecute MLX.
- **GPU de consumo**: no aplica directamente; MLX está diseñado para Apple Silicon. Para GPUs NVIDIA se requeriría una conversión a otro framework (no disponible).
- **Opciones de despliegue**: `mlx_vlm` con los argumentos `--draft-model`, `--draft-kind mtp` y `--draft-block-size 3`. También es posible usarlo con LM Studio en hardware AMD según el blog de AMD, aunque no se detalla el soporte específico del drafter.
- **Latencia y throughput**: los valores medidos se muestran en la tabla de benchmarks; el overhead del drafter es pequeño en relación al modelo base.

## Comparativa con modelos similares

No hay disponibles otros drafters MTP específicos para Qwen3.8 en formato MLX publicados en la información proporcionada. Como referencia de alternativas:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `intheblue/Qwen3.8-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter` | Drafter MTP | 424M | Depende del base | Apache-2.0 | HuggingFace |
| `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16` | Modelo base (BF16) | 27B | 256K | Apache-2.0 | HuggingFace |
| `Qwen3.8-27B` (original Alibaba) | Modelo completo | 27B | 256K | Apache-2.0 | HuggingFace |

No se dispone de datos comparativos de rendimiento entre este drafter y otros mecanismos de aceleración (p. ej., decodificación especulativa con modelos drafters externos) en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo autónomo**: requiere el modelo base `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16` o una de sus cuantizaciones MLX; no puede generar texto por sí solo.
- **Solo compatible con MLX**: el formato está pensado para `mlx-vlm`; no funciona con otros frameworks como vLLM, llama.cpp o Transformers sin conversión adicional.
- **Dependencia de la revisión exacta**: el drafter está vinculado a la revisión `8f76e82` del modelo base; si el modelo base se actualiza, el drafter podría dejar de ser compatible.
- **Rendimiento variable**: la aceleración depende del tipo de tarea y de la temperatura; en prosa creativa la ganancia es menor (1,4×) que en código (1,9×), y con bloques ≥5 el rendimiento empeora.
- **Sesgos y alucinaciones**: al ser un componente del modelo AEON "uncensored", hereda los riesgos del modelo base, que no ha sido alineado con técnicas de seguridad convencionales. El drafter no añade ni mitiga estos riesgos.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener términos adicionales; se recomienda revisar la licencia del modelo AEON original.

## Enlaces

- [Repositorio del drafter en HuggingFace](https://huggingface.co/intheblue/Qwen3.8-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter)
- [Modelo base AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16](https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16)
- [Modelo multimodal MLX 6-bit compañero](https://huggingface.co/intheblue/Qwen3.8-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-6bit)
- [Colección de cuantizaciones MLX del modelo AEON](https://huggingface.co/collections/Shiftedx/qwen38-27b-aeon-ultimate-uncensored-mlx-quants)
- [Blog de AMD sobre ejecución local de Qwen3.8 27B](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- [Documentación de Unsloth sobre Qwen3.8](https://unsloth.ai/docs/models/qwen3.8)
- [Artículo de Gigazine sobre el lanzamiento de Qwen3.8-27B](https://gigazine.net/gsc_news/en/20260817-qwen3-8-27b)
