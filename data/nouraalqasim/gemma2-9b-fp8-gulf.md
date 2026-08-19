# NouraAlqasim/gemma2-9b-fp8-gulf

## Resumen

El modelo `NouraAlqasim/gemma2-9b-fp8-gulf` es una cuantización post-entrenamiento en precisión FP8 (W8A8) del modelo instructivo `google/gemma-2-9b-it`, realizada con NVIDIA ModelOpt y calibrada específicamente sobre el dialecto del Golfo (variedad del árabe hablado en la región del Golfo Pérsico). El autor, NouraAlqasim, ha publicado esta variante como parte de una familia de checkpoints que difieren únicamente en la calibración de los cuantizadores de activación estáticos.

La relevancia de este modelo radica en que ofrece una versión cuantizada de Gemma 2 9B con escalas de activación ajustadas a un dominio lingüístico concreto, lo que puede mejorar la fidelidad de la cuantización en tareas que involucran árabe dialectal del Golfo. El checkpoint pesa aproximadamente 10,2 GB y contiene 9.241.705.984 parámetros, lo que lo hace adecuado para despliegue en GPUs con 16 GB o más de VRAM. No es cargable mediante `transformers` estándar; requiere el backend de vLLM con la opción de cuantización `modelopt`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 2 (transformer decoder-only, basado en `google/gemma-2-9b-it`) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, presumiblemente 8192 tokens, no confirmado) |
| Tipos de cuantizacion | FP8 (W8A8) con NVIDIA ModelOpt (`FP8_DEFAULT_CFG`) |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, incluido árabe, pero la ficha no lo especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con cuantización ModelOpt, no cargable por transformers estándar) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-2-9b-it`, un transformer decoder-only de 9 mil millones de parámetros con atención multi-consulta (GQA) y ventana de contexto de 8192 tokens, entrenado por Google con técnicas de destilación y RLHF (según la documentación pública de Gemma 2). La variante aquí descrita no añade entrenamiento adicional; aplica cuantización post-entrenamiento W8A8 con NVIDIA ModelOpt, donde los pesos se convierten a FP8 y los cuantizadores de activación se calibran estáticamente por tensor.

La calibración se realizó con 128 diálogos extraídos del dataset `Almheiri/ArabCulture-Dialogue` (revisión `9acd60cbbb4f`, semilla 1448), con una longitud máxima de 512 tokens por muestra, centrada en el dialecto del Golfo. El error cuadrático medio (MSE) de los pesos cuantizados es de 3.164e-08. Los cuantizadores de activación (294 en total) se calibraron completamente. El autor indica que las escalas de activación son estáticas y se exportan como `input_scale`; los checkpoints hermanos (`-fp8-msa`, `-fp8-gulf`, `-fp8-mixed`) difieren únicamente en la variedad de calibración.

## Capacidades

- Generación de texto instructivo: al estar basado en `gemma-2-9b-it`, conserva las capacidades de diálogo, seguimiento de instrucciones y razonamiento del modelo original.
- Comprensión y generación en árabe dialectal del Golfo: la calibración específica busca reducir la degradación de la cuantización en este dominio lingüístico.
- Soporte de tool calling y function calling: no confirmado explícitamente en la ficha, pero el modelo base Gemma 2 9B it sí lo soporta; se asume herencia.
- Capacidades multilingües: el modelo base es multilingüe, aunque la ficha no detalla qué idiomas están soportados.
- No se especifican capacidades de visión, audio u otras modalidades.

## Casos de uso

- Asistentes conversacionales en árabe del Golfo: el modelo puede desplegarse como backend de chatbots orientados a usuarios de la región del Golfo, aprovechando la calibración para mantener calidad en diálogos multi-turno.
- Procesamiento de transcripciones de atención al cliente: empresas con centros de soporte en la región pueden usar el modelo para resumir o clasificar interacciones en dialecto local.
- Generación de contenido en árabe dialectal: redacción de correos, respuestas automáticas o publicaciones en redes sociales con registro coloquial del Golfo.
- Sistemas de RAG (generación aumentada por recuperación) sobre documentos árabes: la cuantización FP8 permite servir el modelo con menor VRAM, facilitando su integración en pipelines de recuperación.
- Evaluación de calidad de cuantización en dominios específicos: el checkpoint sirve como referencia para estudiar el impacto de la calibración dialectal en modelos cuantizados.
- Despliegue en producción con vLLM: al requerir vLLM con `--quantization modelopt`, es adecuado para servir el modelo con alta concurrencia en infraestructura existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta el MSE de pesos (3.164e-08) y el número de cuantizadores de activación calibrados, sin métricas de tareas como MMLU, HumanEval o GSM8K. Tampoco se proporcionan comparativas con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa ~10,2 GB en FP8, por lo que se necesitan al menos 12-16 GB de VRAM para cargar el modelo con pesos y activaciones. Con contexto de 8192 tokens, se recomienda 16 GB o más.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 4080 (16 GB), A100 40 GB, H100, L40S. En consumer GPU, una RTX 4090 es suficiente para inferencia en FP8.
- No cabe en GPUs con menos de 12 GB de VRAM (por ejemplo, RTX 3060 12 GB podría quedar justa, pero no se garantiza).
- Opciones de despliegue: vLLM es la opción principal (comando `vllm serve NouraAlqasim/gemma2-9b-fp8-gulf --quantization modelopt`). No es compatible con `transformers` estándar ni con `llama.cpp` (formato GGUF no disponible). Tampoco se menciona soporte en Ollama o TGI.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la configuración de vLLM (tamaño de lote, número de concurrentes).

## Comparativa con modelos similares

| Modelo | Params | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| `NouraAlqasim/gemma2-9b-fp8-gulf` | 9.24B | no disponible | FP8 (ModelOpt) | no disponible | Calibrado en dialecto del Golfo |
| `google/gemma-2-9b-it` (base) | 9.24B | 8192 | FP16/BF16 | Gemma Terms of Use | Modelo original sin cuantizar |
| `google/gemma-2-9b-it` (cuantizaciones oficiales o de terceros) | 9.24B | 8192 | FP8, INT4, etc. | Gemma Terms of Use | Varias versiones en HF, pero sin calibración dialectal específica |

No se dispone de datos de rendimiento para comparar directamente. La principal diferencia de esta variante es la calibración de activaciones en dialecto del Golfo, que no existe en otras cuantizaciones genéricas.

## Limitaciones y advertencias

- No es cargable con `transformers` estándar: el `config.json` declara tipo de cuantización `modelopt`, por lo que solo puede servirse con vLLM u otro runtime que soporte NVIDIA ModelOpt.
- Licencia no especificada: el modelo base `google/gemma-2-9b-it` está sujeto a los Términos de Uso de Gemma, que permiten uso comercial con restricciones. La ficha del autor no declara licencia propia, por lo que se debe asumir la del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos; la cuantización puede degradar ligeramente la calidad en tareas fuera del dominio de calibración.
- Sesgos: el dataset de calibración (`ArabCulture-Dialogue`) puede introducir sesgos culturales o dialectales específicos del Golfo, no representativos de otras variedades del árabe.
- Sin benchmarks publicados: no hay evidencia objetiva de que la calibración mejore el rendimiento en tareas reales; el autor solo reporta MSE de pesos.
- Contexto limitado: aunque el modelo base soporta 8192 tokens, no se confirma que la cuantización preserve esta longitud; se recomienda verificar en producción.
- Sin soporte de GGUF: no se puede usar con `llama.cpp` u Ollama, lo que limita el despliegue en entornos sin vLLM.

## Enlaces

- HuggingFace: https://huggingface.co/NouraAlqasim/gemma2-9b-fp8-gulf
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Dataset de calibración: https://huggingface.co/datasets/Almheiri/ArabCulture-Dialogue (revisión `9acd60cbbb4f`)
- NVIDIA ModelOpt: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- vLLM: https://github.com/vllm-project/vllm
