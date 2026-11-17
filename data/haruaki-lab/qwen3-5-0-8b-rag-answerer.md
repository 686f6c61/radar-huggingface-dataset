# haruaki-lab/qwen3.5-0.8b-rag-answerer

## Resumen

El modelo `haruaki-lab/qwen3.5-0.8b-rag-answerer` es un ajuste fino de `Qwen/Qwen3.5-0.8B` desarrollado por haruaki-lab como proyecto final de un curso de LLM (etiqueta `llm-course-final-2026`). Su propósito es responder preguntas en japonés, tanto de un solo salto como de múltiples saltos (multi-hop), a partir de entre 5 y 8 fragmentos de Wikipedia recuperados, y devolver la respuesta en JSON estricto con el formato `{"answer": "...", "chunk_id": <int|null>}`. Está diseñado específicamente para integrarse como componente generador en un pipeline RAG.

El modelo parte de una base de aproximadamente 752 millones de parámetros (0,8B nominales) y conserva la configuración nativa `Qwen3_5ForConditionalGeneration` del modelo original, lo que facilita su despliegue directo con vLLM. El ajuste se realizó mediante LoRA con rango 16 sobre todos los módulos lineales, fusionado posteriormente en los pesos base. La ventana de contexto, el número de tokens de entrenamiento y la composición detallada del corpus no se especifican en la información disponible.

Su relevancia radica en que aborda un problema concreto y poco cubierto: la respuesta extractiva y atribuida sobre contexto recuperado en japonés, con distractores de alta dificultad (hard negatives) y ejemplos sin respuesta (6% del corpus). La licencia Apache 2.0 y el tamaño reducido lo hacen atractivo para despliegues con recursos limitados, aunque el modelo es muy reciente (noviembre de 2026) y no cuenta aún con descargas ni validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), configuración `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; se puede cuantizar a GGUF/AWQ con herramientas externas, pero no se documenta) |
| Idiomas soportados | Japonés (`ja`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. Se conserva la clase `Qwen3_5ForConditionalGeneration` del modelo base, lo que indica que el modelo original soporta entrada multimodal (imagen-texto según el pipeline declarado), aunque el ajuste se orienta exclusivamente a texto y RAG. El ajuste se realizó con LoRA de rango 16, `lora_alpha=32` y `target_modules="all-linear"`, durante 1 época, con máscara de pérdida solo sobre los tokens objetivo (target-only loss masking). Los adaptadores se fusionaron en los pesos base en el checkpoint de mejor pérdida de validación (`val_target_loss=0.05041` en el paso 800).

El conjunto de entrenamiento consta de 12.880 ejemplos de entrenamiento y 1.120 de validación, construidos sin solapamiento de artículos ni fragmentos entre splits. Cada ejemplo contiene entre 5 y 8 fragmentos de Wikipedia japonesa en posiciones aleatorias, mezclados con distractores BM25 y hard negatives generados con el modelo Ruri, además de un 6% de ejemplos sin respuesta. Los datos provienen de fragmentos distribuidos de Wikipedia japonesa (licencia CC BY-SA 4.0) y de JaQuAD (CC BY-SA 3.0), utilizado para entrenar los modelos sintéticos de generación de preguntas y filtrado de la fase 0. No se documenta el uso de RLHF o DPO, ni el número total de tokens vistos durante el entrenamiento.

## Capacidades

- Generación de respuestas extractivas en japonés sobre contexto recuperado, con salida JSON estricta (`answer` y `chunk_id`).
- Preguntas de un solo salto y de múltiples saltos (multi-hop) que requieren combinar información de varios fragmentos.
- Manejo de distractores: entrenado con hard negatives y con posiciones de contexto aleatorizadas, lo que le permite ignorar fragmentos irrelevantes.
- Detección de preguntas sin respuesta: devuelve `chunk_id: null` cuando el contexto no contiene la información (6% de ejemplos de entrenamiento sin respuesta).
- Atribución de la respuesta a un fragmento concreto mediante el identificador `chunk_id`.
- Capacidad multimodal heredada del modelo base (pipeline `image-text-to-text`), aunque no se documenta entrenamiento específico para visión en este ajuste.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agéntico más allá del multi-hop sobre contexto.

## Casos de uso

- Atención al cliente sobre base documental en japonés: el modelo recibe los fragmentos recuperados por un buscador (BM25 o denso) y devuelve una respuesta concisa junto con el identificador del fragmento fuente, lo que permite mostrar citas al usuario y auditar la respuesta.
- Sistemas de preguntas y respuestas sobre Wikipedia o corpus internos en japonés: su entrenamiento con 5–8 fragmentos y distractores lo hace adecuado para pipelines RAG estándar donde el recuperador devuelve varios candidatos y el modelo debe seleccionar la evidencia correcta.
- Preguntas multi-hop en documentación técnica: por ejemplo, combinar un dato de un fragmento con una condición de otro para responder consultas que ningún fragmento aislado resuelve.
- Filtrado y verificación de respuestas: al devolver `chunk_id: null` ante preguntas sin respuesta, puede usarse como verificador de que el contexto recuperado es suficiente antes de mostrar una respuesta al usuario.
- Extracción de datos estructurados desde texto: el formato JSON estricto permite integrar la salida directamente en bases de datos o APIs sin post-procesado complejo.
- Despliegue en entornos con recursos limitados: con 752 millones de parámetros, cabe en GPU de consumo y puede servir como generador de bajo coste en un pipeline RAG de alto volumen, siempre que el idioma sea japonés.
- Evaluación de recuperadores: al estar entrenado con hard negatives, puede emplearse para medir si un recuperador propone fragmentos suficientemente discriminativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de validación sobre tokens objetivo (`val_target_loss=0.05041` en el paso 800), que no es comparable con métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,5 GB de pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,8–1 GB de pesos; en 4 bits, alrededor de 0,4–0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; para producción con concurrencia, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4070 y superiores.
- Opciones de despliegue: vLLM (la model card indica compatibilidad directa por conservar la configuración nativa), transformers con `AutoModelForCausalLM`/`Qwen3_5ForConditionalGeneration`, TGI. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| haruaki-lab/qwen3.5-0.8b-rag-answerer | 752 M | No disponible | ja | Apache 2.0 | Ajuste específico para RAG multi-hop en japonés con salida JSON |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Multilingüe | Apache 2.0 | Modelo generalista; no especializado en RAG ni en salida JSON estricta |
| Modelos RAG japoneses de tamaño similar | No disponible | No disponible | ja | No disponible | No se dispone de información sobre alternativas comparables en la búsqueda realizada |

La comparación cuantitativa con alternativas no es posible con los datos disponibles, ya que no se han publicado benchmarks del modelo ni se han identificado modelos directamente comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado en japonés; su rendimiento en otros idiomas, incluido el castellano, no está documentado y previsiblemente será deficiente.
- Riesgo de alucinación: aunque se entrena con ejemplos sin respuesta y devuelve `chunk_id: null`, no se han publicado métricas de fidelidad ni de tasa de alucinación sobre datos externos.
- La longitud de contexto no está documentada; el entrenamiento usa 5–8 fragmentos, por lo que contextos mucho más largos pueden degradar el rendimiento.
- El formato de salida JSON es estricto; desviaciones del prompt esperado pueden producir JSON inválido o respuestas fuera de formato.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue publicado en noviembre de 2026; no hay validación independiente de su calidad.
- Los datos de entrenamiento derivan de Wikipedia japonesa (CC BY-SA 4.0) y JaQuAD (CC BY-SA 3.0), con obligaciones de atribución y compartir igual para esas porciones; la licencia del modelo es Apache 2.0, pero el uso comercial debe revisar las condiciones de los datasets de origen.
- Es un modelo de 0,8B: su capacidad de razonamiento general y de conocimiento factual es limitada en comparación con modelos de mayor tamaño, y está pensado para responder exclusivamente a partir del contexto proporcionado.
- No se documenta soporte de tool calling ni comportamiento agéntico, por lo que no debe asumirse en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haruaki-lab/qwen3.5-0.8b-rag-answerer
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de competición (fragmentos de Wikipedia japonesa): https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- JaQuAD: https://github.com/SkelterLabsInc/JaQuAD
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
