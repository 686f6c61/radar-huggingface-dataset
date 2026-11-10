# lazarenkod/promises-summary-gemma4-e2b-mlx-4bit

## Resumen

`lazarenkod/promises-summary-gemma4-e2b-mlx-4bit` es un modelo de generacion de texto publicado en Hugging Face por el usuario lazarenkod, derivado de la familia Gemma (etiquetado como "gemma4" en los tags) y convertido al formato MLX con cuantizacion de 4 bits para su ejecucion en hardware Apple Silicon. Con 4.628.569.379 parametros reales segun los pesos en safetensors y un tamano de repositorio de 2,6 GB, se trata de un ajuste fino orientado a la generacion de resumenes de promesas, presumiblemente en el ambito de compromisos o contratos.

El modelo resuelve un problema acotado: la sintesis automatica de documentos de promesas en ingles, empaquetado para el stack MLX de Apple. Su relevancia es limitada fuera de ese nicho: no dispone de descargas ni interacciones en el momento de la consulta, la model card publica es practicamente vacia (solo metadatos minimos) y no se documentan datos de entrenamiento, evaluacion ni licencia.

La ficha se elabora, por tanto, a partir de los metadatos verificables del repositorio (parametros, formato, libreria, idioma declarado y tamano). Cualquier dato no presente en la informacion disponible se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Gemma segun el tag "gemma4"; no se detalla en la model card) |
| Parametros totales | 4.628.569.379 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX, libreria `mlx`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. Los tags del repositorio lo asocian a "gemma4" y el volumen de parametros (4,63 mil millones) es compatible con una variante de la familia Gemma, pero la model card no especifica si se trata de un transformer denso, un modelo con atencion lineal, una mezcla de expertos o una arquitectura hibrida. Tampoco se documenta la longitud de contexto nativa.

Respecto al entrenamiento, la model card no incluye informacion sobre el numero de tokens utilizados, la composicion del dataset, la existencia de fases de RLHF o DPO, ni el procedimiento de ajuste fino que dio lugar a la especializacion en resumen de promesas. El identificador del repositorio sugiere un fine-tuning sobre una base Gemma con cuantizacion posterior a 4 bits en formato MLX, pero no hay documentacion que confirme el pipeline exacto.

## Capacidades

- Generacion de texto en ingles con pipeline `text-generation`.
- Generacion de resumenes de documentos de promesas, segun el nombre del repositorio; no se detalla el formato de entrada ni el esquema de salida.
- Conversacion multi-turno: el tag `conversational` indica soporte de dialogos, aunque no se especifica la plantilla de chat utilizada.
- Ejecucion en Apple Silicon mediante la libreria MLX, con pesos cuantizados a 4 bits.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles (`en`).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Resumen de documentos de promesas: el modelo se ha ajustado especificamente para condensar textos de compromisos en resumenes; se usaria pasando el documento como prompt y obteniendo una sintesis en ingles.
- Prototipado local en Mac: al estar en formato MLX de 4 bits, permite probar el flujo de resumen en un Mac con Apple Silicon sin depender de servicios en la nube.
- Preprocesado de contratos en pipelines internos: puede integrarse como paso de sintesis previo a la revision humana de documentos de promesas, reduciendo el volumen de texto que revisa un analista.
- Generacion de resumenes en lote sobre corpus en ingles: su tamano (2,6 GB en disco) facilita el despliegue en estaciones de trabajo individuales para procesar colecciones de documentos.
- Asistente conversacional de consulta documental: el tag `conversational` permite construir un dialogo de preguntas y respuestas sobre el contenido resumido de promesas.
- Experimentacion academica con fine-tuning y cuantizacion: sirve como ejemplo de adaptacion de un modelo base Gemma a una tarea concreta y su empaquetado en MLX a 4 bits.
- Evaluacion comparativa de tecnicas de cuantizacion: util para medir la perdida de calidad de un ajuste fino tras cuantizar a 4 bits en MLX frente a los pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM equivalente: los pesos a 4 bits ocupan aproximadamente 2,6 GB en disco; la memoria unificada necesaria para inferencia sera algo superior por el contexto y los buffers de activacion (estimacion orientativa, no confirmada por el autor).
- Hardware objetivo: Apple Silicon con soporte MLX (series M1, M2, M3, M4 y posteriores); el repositorio no declara compatibilidad con GPU NVIDIA.
- Cabe en equipos de consumo con memoria unificada de 8 GB o superior, segun el tamano de los pesos; no se dispone de mediciones oficiales.
- Opciones de despliegue: libreria MLX (`mlx-lm`) en macOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato es especifico de MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| lazarenkod/promises-summary-gemma4-e2b-mlx-4bit | 4,63 B | no disponible | MLX safetensors 4 bits | no disponible | Fine-tuning especifico para resumen de promesas; sin benchmarks publicados |
| Gemma 2B (Google) | 2 B | no disponible en esta ficha | safetensors, GGUF, etc. | Gemma Terms of Use | Modelo base generalista; no especializado en resumen de promesas |
| Gemma 7B (Google) | 7 B | no disponible en esta ficha | safetensors, GGUF, etc. | Gemma Terms of Use | Mayor capacidad general, mas requisitos de memoria |
| Qwen2.5-3B-Instruct | 3 B | no disponible en esta ficha | safetensors, GGUF, MLX | Apache 2.0 | Alternativa multilingue con soporte de tool calling |

La comparativa se limita a modelos de la misma escala; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card esta practicamente vacia: no documenta datos de entrenamiento, evaluacion, plantilla de prompt ni esquema de salida, lo que dificulta su uso reproducible en produccion.
- La licencia no esta disponible, por lo que no puede confirmarse el uso comercial ni las obligaciones de atribucion; debe contactarse con el autor antes de cualquier despliegue.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la ausencia de evaluaciones publicadas y por la cuantizacion a 4 bits, que puede degradar la fidelidad del resumen.
- El ajuste fino esta orientado a un dominio estrecho (promesas); su comportamiento fuera de ese tipo de documentos es desconocido.
- Sin descargas ni interacciones en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- El formato MLX limita el despliegue a entornos Apple Silicon; no es directamente compatible con stacks de servidor basados en CUDA.
- Posibles sesgos heredados del modelo base Gemma y del corpus de ajuste, no documentados por el autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lazarenkod/promises-summary-gemma4-e2b-mlx-4bit
- Libreria MLX: https://github.com/ml-explore/mlx
- MLX LM (utilidades de inferencia y conversion): https://github.com/ml-explore/mlx-examples/tree/main/llms
- Documentacion de Gemma (Google): https://ai.google.dev/gemma
