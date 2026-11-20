# Caya8205/gemma-3-4b-it-heretic

## Resumen

Caya8205/gemma-3-4b-it-heretic es una variante "decensored" (también etiquetada como abliterated o uncensored) del modelo multimodal google/gemma-3-4b-it, generada automáticamente con la herramienta Heretic v2.1.0. El modelo base es un transformer multimodal de Google DeepMind que acepta texto e imágenes y produce texto, con 4.300.079.472 parámetros totales y una ventana de contexto de 128K tokens. La modificación aplicada busca reducir la tasa de rechazos del modelo original sin reentrenar los pesos, mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre un subconjunto de capas.

El interés de esta ficha reside en dos planos. Por un lado, documenta un experimento de "decensurado" reproducible: el autor publica los hiperparámetros exactos de la ablación y un directorio `reproduce/` con instrucciones, lo que permite auditar y repetir el proceso. Por otro, permite evaluar el compromiso entre la supresión de rechazos y la degradación del modelo: según la model card, los rechazos caen de 97/100 a 3/100, pero a costa de una divergencia KL de 0,0540 respecto al original, lo que indica una alteración medible de la distribución de salida.

Es relevante ahora porque el ecosistema de variantes "abliterated" ha crecido mucho y conviene tener criterios técnicos para distinguir una modificación quirúrgica y reproducible de un simple fine-tuning sin documentación. Aquí la información disponible es escasa en cuanto a benchmarks de capacidades, pero suficiente para describir la intervención y sus riesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + imagen), familia Gemma 3 |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128K tokens de entrada; 8192 tokens de salida |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se listan GGUF ni otras) |
| Idiomas soportados | más de 140 idiomas según la model card del modelo base |
| Licencia | Gemma (Google), con acceso condicionado (gated) en Hugging Face |
| Formato de pesos | safetensors |
| Resolucion de imagen de entrada | 896 x 896, codificada a 256 tokens por imagen |
| Tamano del repo | 8,6 GB |
| Libreria | transformers (soporte desde 4.50.0) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 4B instruct: un transformer multimodal que procesa texto e imágenes, donde cada imagen se normaliza a 896x896 y se codifica en 256 tokens. El modelo base fue entrenado por Google DeepMind a partir de la misma investigación que los modelos Gemini, con variantes preentrenada e instruction-tuned; la model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset para esta talla.

La modificación de esta variante no es un reentrenamiento, sino una ablación de direcciones en el espacio de activaciones aplicada sobre las capas 12 a 22 (start_layer_index 12, end_layer_index 22). Los hiperparámetros publicados son: preserve_good_behavior_weight 0,5227, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,3288 y neighbor_count 12. La herramienta Heretic v2.1.0 aplica esta ablación de rango arbitrario (ARA) para restar componentes asociados al comportamiento de rechazo preservando, en teoría, el resto de capacidades. El autor indica que el proceso es reproducible mediante el directorio `reproduce/`, aunque no se especifican en la información disponible detalles sobre el conjunto de prompts utilizado para calibrar la ablación.

## Capacidades

- Generación de texto conversacional multi-turno con plantillas de chat (rol system/user/assistant).
- Comprensión de imágenes: descripción, respuesta a preguntas visuales y análisis de contenido gráfico.
- Razonamiento y respuesta a preguntas sobre documentos largos gracias a los 128K tokens de contexto de entrada.
- Capacidades multilingües heredadas del modelo base (más de 140 idiomas).
- Reducción drástica de rechazos: 3/100 frenta a 97/100 del original, según la model card.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modo de razonamiento extendido (thinking mode) para esta variante.
- No se documenta soporte de audio ni de vídeo.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio controlado para medir cómo una ablación de activaciones afecta a la tasa de rechazos y a la divergencia KL, con parámetros reproducibles.
- Evaluación de robustez de filtros: permite comprobar si los clasificadores de contenido de una plataforma detectan respuestas que el modelo original rechazaría, útil para diseñar capas de seguridad externas.
- Generación creativa sin restricciones excesivas: escritura de ficción, guiones o narrativa con temáticas sensibles donde el modelo base tiende a rechazar, en entornos de autoría controlada.
- Análisis de imágenes en entornos de investigación: descripción y extracción de información de imágenes a 896x896 con contexto largo para informes técnicos.
- Procesamiento de documentos largos multilingües: resumen y preguntas sobre textos de hasta 128K tokens en más de 140 idiomas, con salida de hasta 8192 tokens.
- Docencia y demostraciones: ilustrar en un aula o taller cómo funcionan las técnicas de abliteration y qué coste tienen en términos de divergencia respecto al modelo original.
- Pruebas de regresión de pipelines: comparar salidas de esta variante frente al Gemma 3 4B IT original para detectar cambios de comportamiento no deseados antes de desplegar.

## Benchmarks y rendimiento

| Metrica | Este modelo | google/gemma-3-4b-it |
|---|---|---|
| Rechazos (Refusals) | 3/100 | 97/100 |
| Divergencia KL | 0,0540 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 8,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB para contexto moderado.
- GPU recomendadas para bf16: A100, H100, L40S o RTX 4090 (24 GB) con holgura para contexto largo.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en tarjetas de 12-16 GB requeriría cuantización, que no se documenta en el repo.
- Opciones de despliegue: transformers (>= 4.50.0) con `Gemma3ForConditionalGeneration` y `pipeline("image-text-to-text")`; el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face. No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Rechazos | Licencia |
|---|---|---|---|---|---|
| Caya8205/gemma-3-4b-it-heretic | 4,3B | 128K | Sí | 3/100 | Gemma |
| google/gemma-3-4b-it | 4,3B | 128K | Sí | 97/100 | Gemma |
| Otras variantes abliterated de Gemma 3 4B IT | no disponible | no disponible | Sí | no disponible | Gemma |

No se dispone en la información proporcionada de datos de benchmarks comparativos con modelos de otras familias (por ejemplo, Llama 3.2 o Qwen 2.5 VL de tamaño similar), por lo que la comparación se limita al modelo base y a variantes equivalentes no documentadas.

## Limitaciones y advertencias

- La reducción de rechazos implica que el modelo puede generar contenido que el original bloquearía; es necesario añadir filtros externos si se despliega en producción orientada al público.
- La divergencia KL de 0,0540 respecto al original indica una alteración real de la distribución de salida; no se han publicado evaluaciones de si esta degrada tareas como matemáticas, código o visión.
- Riesgo de alucinación: no se documenta ninguna mitigación específica; el modelo base ya presenta este riesgo y la ablación no lo aborda.
- Licencia Gemma con acceso condicionado: el uso comercial está sujeto a los términos de Google, y la variante modificada sigue bajo esa licencia; conviene revisar las cláusulas sobre redistribución de modelos derivados.
- Idiomas: aunque el modelo base cubre más de 140 idiomas, no se ha evaluado el impacto de la ablación en idiomas distintos del inglés.
- Contexto: la ventana de entrada es de 128K tokens, pero la salida está limitada a 8192 tokens, lo que restringe tareas de generación muy larga.
- No hay pesos cuantizados publicados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama baja.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente del comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Caya8205/gemma-3-4b-it-heretic
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Heretic: https://heretic-project.org
- Página de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico de Gemma 3: https://ai.google.dev/gemma/docs/core (referenciado como [g3-tech-report] en la model card)
- Responsible Generative AI Toolkit: https://ai.google.dev/responsible
- Gemma en Kaggle: https://www.kaggle.com/models/google/gemma
- Gemma en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma3
- Términos de uso: https://ai.google.dev/gemma/terms
