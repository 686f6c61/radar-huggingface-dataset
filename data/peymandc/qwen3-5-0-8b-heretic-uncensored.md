# Peymandc/Qwen3.5-0.8B-Heretic-Uncensored

## Resumen

Qwen3.5-0.8B-Heretic-Uncensored es una variante modificada del modelo multimodal Qwen/Qwen3.5-0.8B, publicada por el usuario Peymandc. No se trata de un reentrenamiento ni de un fine-tune convencional: es una modificación sin entrenamiento (training-free) aplicada con la herramienta Heretic v2.1.0 mediante Arbitrary-Rank Ablation (ARA), una técnica de ablación de direcciones en el espacio de activaciones orientada a reducir el comportamiento de rechazo (refusal) del modelo original.

El modelo base es un vision-language model compacto de aproximadamente 853 millones de parámetros (852.985.920 en el checkpoint safetensors), con arquitectura híbrida de lenguaje basada en Gated DeltaNet y Gated Attention, más un codificador visual. Incorpora 24 capas de lenguaje, dimensión oculta de 1.024, dimensión intermedia de 3.584 y una longitud de contexto nativa de 262.144 tokens. La tarea declarada en el pipeline es image-text-to-text.

La relevancia de esta ficha reside en dos factores: por un lado, documenta una técnica de decensura reproducible sobre un modelo multimodal pequeño, con parámetros de ablación explícitos y material de reproducción; por otro, advierte de que las capacidades, la arquitectura y los benchmarks descritos en la model card proceden de la documentación del modelo original y no han sido reevaluados de forma independiente sobre esta variante. El modelo tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet + Gated Attention, con codificador visual; 24 capas de lenguaje, dimensión oculta 1.024, FFN 3.584 |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos en safetensors; el repo ocupa 1,7 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura híbrida de lenguaje compuesta por seis repeticiones del patrón `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. Gated DeltaNet utiliza 16 cabezas de valor y 16 cabezas de query/key con dimensión de cabeza 128; Gated Attention emplea 8 cabezas de query y 2 cabezas de key/value con dimensión de cabeza 256 y dimensión de RoPE de 64. El embedding de tokens tiene 248.320 entradas (con padding) y está atado a la salida. El modelo original fue entrenado con predicción multi-token (multi-step prediction) y es un modelo post-entrenado multimodal con codificador visual.

Sobre esta variante, la modificación aplicada es Arbitrary-Rank Ablation (ARA) mediante Heretic v2.1.0, sin entrenamiento. Los parámetros publicados son: `start_layer_index` 9, `end_layer_index` 20, `preserve_good_behavior_weight` 0,4395, `steer_bad_behavior_weight` 0,0002, `overcorrect_relative_weight` 0,6954 y `neighbor_count` 2. La evaluación de Heretic reporta una reducción de coincidencias de palabras clave de rechazo de 93/100 (modelo original) a 8/100 (esta variante) sobre los primeros 100 prompts de `mlabonne/harmful_behaviors` (`test[:100]`), con una divergencia KL de 0,0675 medida sobre los primeros 100 prompts de `mlabonne/harmless_alpaca` (`test[:100]`), tomando el modelo original como referencia. El autor indica que la modificación es reproducible y que la configuración y los detalles de evaluación están en el directorio `reproduce/`.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline image-text-to-text.
- Procesamiento de imágenes mediante codificador visual (vision-language model).
- Razonamiento y tareas de lenguaje general, según la documentación del modelo base.
- Soporte de contexto largo: hasta 262.144 tokens nativos, sujeto al framework de inferencia y a la memoria disponible.
- Modificación de comportamiento de rechazo: la variante responde a solicitudes que el modelo original rechazaría, según la evaluación de Heretic.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y decensura: el modelo sirve como caso de estudio reproducible de ablación ARA, con parámetros y material de reproducción publicados, para analizar el efecto de la modificación sobre el comportamiento de rechazo y la divergencia KL respecto al original.
- Prototipado de asistentes multimodales: al ser un vision-language model de 0,8B con contexto de 262.144 tokens, permite construir prototipos de descripción de imágenes y conversación sobre documentos visuales en entornos con recursos limitados.
- Evaluación comparativa de técnicas de modificación: la métrica de coincidencias de rechazo (8/100 frente a 93/100) y la KL de 0,0675 permiten comparar Heretic/ARA con otras técnicas de abliteration sobre el mismo modelo base.
- Fine-tuning específico de tarea: el tamaño reducido (853M parámetros, repo de 1,7 GB) facilita el ajuste posterior para tareas concretas de clasificación o extracción sobre pares imagen-texto.
- Procesamiento de documentos largos con componente visual: el contexto nativo de 262.144 tokens permite abordar tareas de lectura de documentos extensos, siempre que el framework de inferencia y la memoria lo permitan.
- Desarrollo y pruebas de pipelines de inferencia: útil para validar integraciones con transformers y medir el comportamiento de un modelo híbrido Gated DeltaNet/Gated Attention en entornos de desarrollo.
- Análisis de contenido sin restricciones de rechazo: escenarios de investigación donde el comportamiento de rechazo del modelo original interfiere con la recogida de datos, asumiendo la responsabilidad legal y ética del uso.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen3.5-0.8B original |
|---|---|---|
| Coincidencias de palabras clave de rechazo (`mlabonne/harmful_behaviors`, `test[:100]`) | 8/100 (8%) | 93/100 (93%) |
| Divergencia KL (`mlabonne/harmless_alpaca`, `test[:100]`) | 0,0675 | 0,0000 (por definición) |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta variante. La model card indica explícitamente que las descripciones de arquitectura, capacidades y benchmarks de las secciones heredadas proceden de la documentación del modelo original y no han sido reevaluados de forma independiente sobre esta modificación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 852.985.920 parámetros, en FP16 se requieren aproximadamente 1,7 GB solo para pesos, más overhead de activaciones, caché KV y codificador visual; en cuantizaciones de 8 bits o 4 bits el peso se reduce aproximadamente a 0,85 GB y 0,43 GB respectivamente, aunque no se han publicado ficheros GGUF en la información disponible.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo es apto para GPUs de consumo con suficiente VRAM para FP16 y contexto moderado.
- ¿Cabe en GPU de consumo? Sí, por el tamaño de parámetros (853M), aunque el contexto nativo de 262.144 tokens incrementa de forma significativa los requisitos de memoria de la caché KV; no se dispone de cifras oficiales.
- Opciones de despliegue: transformers (librería declarada). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| Peymandc/Qwen3.5-0.8B-Heretic-Uncensored | 852.985.920 | 262.144 | Image-text-to-text | Apache 2.0 | 0 descargas, 0 likes |
| Qwen/Qwen3.5-0.8B | 0,8B (según model card) | 262.144 | Image-text-to-text | Apache 2.0 | Modelo base oficial |
| Otras variantes Heretic del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de capacidad general para establecer una comparación de rendimiento con alternativas de la misma categoría. La comparación principal posible es con el modelo base, del que esta variante difiere únicamente por la ablación ARA (8/100 frente a 93/100 en coincidencias de rechazo y KL de 0,0675).

## Limitaciones y advertencias

- La modificación reduce el comportamiento de rechazo, pero el autor advierte explícitamente de que no constituye una certificación de seguridad ni garantiza que el modelo cumpla cualquier solicitud.
- Riesgo elevado de generar contenido inexacto, engañoso, dañino o inapropiado; las salidas no deben tratarse como información verificada ni como asesoramiento profesional.
- La evaluación de rechazo es una métrica basada en palabras clave (`KeywordRate`), no un clasificador semántico ni una evaluación humana; depende de los prompts, la configuración del scorer y la lista de palabras clave.
- Las capacidades, arquitectura y benchmarks heredados proceden de la documentación del modelo original y no han sido reevaluados sobre esta variante.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de que su aplicación cumpla la legislación aplicable, especialmente en contextos sensibles.
- El contexto nativo de 262.144 tokens puede no ser alcanzable en la práctica según el framework de inferencia, la memoria disponible y la configuración en tiempo de ejecución.
- Modelo con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- No se han publicado ficheros de cuantización ni confirmación de soporte en frameworks de despliegue distintos de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Peymandc/Qwen3.5-0.8B-Heretic-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Heretic: https://heretic-project.org
- Reproducción (directorio `reproduce/` del repo): https://huggingface.co/Peymandc/Qwen3.5-0.8B-Heretic-Uncensored/tree/main/reproduce
- Model Pulse (métricas): https://huggingface.co/spaces/tardellirs/model-pulse?model=Peymandc/Qwen3.5-0.8B-Heretic-Uncensored
- Página de apoyo del autor: https://huggingface.co/spaces/Peymandc/support
- Branding (imagen del modelo): https://huggingface.co/datasets/Peymandc/branding/resolve/main/Qwen3.5-0.8B-Heretic-Uncensored.png
