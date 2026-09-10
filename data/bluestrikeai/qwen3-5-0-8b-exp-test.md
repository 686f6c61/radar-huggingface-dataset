# Bluestrikeai/Qwen3.5-0.8B-Exp-Test

## Resumen

Bluestrikeai/Qwen3.5-0.8B-Exp-Test es un ajuste fino (finetune) publicado por el usuario Bluestrikeai sobre el modelo base Qwen/Qwen3.5-0.8B. Se trata de un modelo de 873.438.784 parámetros (aproximadamente 0,87 mil millones) alojado en formato safetensors, con licencia Apache 2.0 y librería transformers. El repositorio ocupa 1,8 GB y se publicó el 10 de septiembre de 2026, con la actualización registrada 36 segundos después de la creación, lo que apunta a una subida automatizada de un experimento de entrenamiento.

El interés de esta ficha es limitado pero informativo: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados y con una model card mínima que solo indica el modelo base, la licencia y que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face. El nombre incluye el sufijo "Exp-Test", lo que sugiere que es una prueba experimental y no una versión destinada a producción.

La relevancia actual del modelo radica en dos factores: por un lado, pertenece a la familia Qwen 3.5, y por otro, el repositorio declara el pipeline image-text-to-text junto con la etiqueta qwen3_5, lo que indicaría capacidades multimodales de entrada (imagen y texto), si bien la model card no confirma ni detalla dicha capacidad. No se dispone de información sobre la longitud de contexto, la composición del dataset de entrenamiento ni el método de alineación empleado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de repositorio: qwen3_5; se desconoce si es transformer denso, MoE o híbrida) |
| Parámetros totales | 873.438.784 (0,87 mil millones), dato real de safetensors |
| Parámetros activos | no aplica o no disponible: no se declara arquitectura MoE en la información proporcionada |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible como artefactos publicados. El repositorio solo contiene safetensors de 16 bits (el tamaño del repo, 1,8 GB, es coherente con 873 M de parámetros en bf16/fp16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Librería | transformers |
| Pipeline declarado | image-text-to-text |
| Tamaño del repositorio | 1,8 GB |
| Fecha de publicación | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta qwen3_5 y de la referencia al modelo base Qwen/Qwen3.5-0.8B. No se especifica si se trata de un transformer denso, de una mezcla de expertos (MoE), de un modelo de espacio de estados (SSM) o de una arquitectura híbrida, ni se indican el número de capas, la dimensión oculta, el número de cabezas de atención, el tipo de atención (completa, lineal o sliding window) ni la estrategia de tokenizador. Tampoco se declara la longitud de contexto máxima soportada.

Respecto al entrenamiento, la model card únicamente indica que el ajuste se realizó con Unsloth y la librería TRL de Hugging Face, con una velocidad de entrenamiento declarada de 2 veces más rápida gracias a Unsloth. No se especifica el número de tokens de entrenamiento, la composición del dataset, la técnica de ajuste (LoRA/QLoRA frente a ajuste completo), la existencia de fases de RLHF, DPO o RLVR, ni ningún mecanismo de innovación técnica adicional como decodificación especulativa o atención lineal. La única información sobre el propósito del ajuste es el propio nombre del repositorio, que lo identifica como una prueba experimental.

## Capacidades

- Generación de texto conversacional: las etiquetas del repositorio incluyen conversational y text-generation-inference, por lo que está orientado a diálogo multi-turno.
- Procesamiento de entrada imagen-texto: el pipeline declarado es image-text-to-text y la etiqueta image-text-to-text aparece en el repositorio. No obstante, la model card no detalla ni confirma esta capacidad, por lo que debe verificarse empíricamente antes de asumirla.
- Capacidad multilingüe: limitada al inglés según el campo de idiomas del repositorio (en).
- Compatibilidad con endpoints: la etiqueta endpoints_compatible indica que puede desplegarse en la infraestructura de Inference Endpoints de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de audio: no disponible; no se declara soporte de audio.

## Casos de uso

- Pruebas de concepto de asistentes conversacionales en inglés: el modelo puede emplearse como prototipo de chatbot de dominio general en entornos de desarrollo, dado su tamaño reducido, que permite iterar en una GPU de gama media o incluso en CPU con cuantización.
- Clasificación y etiquetado de texto: al ser un modelo ajustado de 0,87 B de parámetros con licencia Apache 2.0, es viable experimentar con tareas de extracción de etiquetas, análisis de sentimiento o categorización de tickets, siempre que se valide su calidad con datos propios al no existir benchmarks publicados.
- Generación aumentada por recuperación (RAG) en prototipos: puede integrarse como generador final en un pipeline RAG de bajo coste, aceptando contexto recuperado y produciendo respuestas en inglés; conviene medir la longitud de contexto real antes de fijar el tamaño de los fragmentos.
- Filtrado previo en cascadas de inferencia: por su tamaño, puede usarse como primer nivel de una arquitectura en cascada que descarte consultas triviales o reformule preguntas antes de enviarlas a un modelo mayor, reduciendo el coste por consulta.
- Investigación sobre ajuste eficiente: al haber sido entrenado con Unsloth y TRL, sirve como caso de estudio reproducible para analizar el efecto de recetas de ajuste con LoRA/QLoRA en modelos por debajo de 1 B de parámetros.
- Evaluación de modelos multimodales pequeños: si se confirma la capacidad image-text-to-text, puede emplearse en experimentos de descripción de imágenes, respuesta a preguntas visuales (VQA) o extracción de información de capturas y documentos escaneados; en caso contrario, este caso de uso queda descartado.
- Generación de texto en entornos con recursos muy limitados: su huella de memoria en 16 bits (aproximadamente 1,75 GB de pesos) permite desplegarlo en dispositivos de borde, portátiles sin GPU dedicada o instancias de CPU, para tareas de redacción asistida o autocompletado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de evaluación, y el repositorio registra cero descargas y cero likes, por lo que tampoco existe retroalimentación de la comunidad que permita estimar su calidad.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: alrededor de 1,75 GB corresponden únicamente a los pesos (873.438.784 parámetros × 2 bytes). Sumando caché KV y activaciones, un despliegue cómodo requiere del orden de 2,5 a 4 GB de VRAM, cantidad que depende de la longitud de contexto efectiva, dato que no está disponible.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9 GB de pesos, con un total práctico en torno a 1,5-2,5 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,45-0,5 GB de pesos, con un total práctico en torno a 1-2 GB. Estas cuantizaciones exigirían generar artefactos GGUF, AWQ o GPTQ, ya que el repositorio no los incluye.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente en 16 bits, incluidas RTX 3050, RTX 3060, RTX 4060, RTX 4070 y superiores. En el extremo profesional, una NVIDIA A100, H100, L4 o T4 está sobradamente dimensionada y permitiría servir muchas réplicas concurrentes.
- Cabe en GPU de consumo: sí, de forma holgada, en cualquier tarjeta con 4 GB o más de VRAM; también es viable la inferencia en CPU en 16 bits para uso individual.
- Opciones de despliegue: transformers es la librería declarada y la etiqueta text-generation-inference sugiere compatibilidad con TGI. La etiqueta endpoints_compatible indica soporte en Inference Endpoints de Hugging Face. vLLM, llama.cpp y Ollama no están confirmados en la información proporcionada; para usarlos sería necesario verificar compatibilidad y, en el caso de llama.cpp y Ollama, convertir los pesos a GGUF, tarea para la que se recomienda revisar primero que la arquitectura qwen3_5 esté soportada por dichas herramientas.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo, tiempo hasta el primer token ni rendimiento bajo carga concurrente.

## Comparativa con modelos similares

La comparativa se establece con modelos pequeños de propósito general ampliamente conocidos, dado que no se dispone de datos de rendimiento del modelo analizado. Los datos de las alternativas provienen de sus respectivas model cards oficiales.

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Rendimiento publicado |
|---|---|---|---|---|---|
| Bluestrikeai/Qwen3.5-0.8B-Exp-Test | 0,87 B (873.438.784) | no disponible | Apache 2.0 | Pipeline declarado image-text-to-text, no confirmado en la model card | No disponible |
| Qwen/Qwen3-0.6B | 0,6 B | 32.768 tokens, extensible | Apache 2.0 | No | Sí, publicado por el autor |
| Llama 3.2 1B | 1,24 B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | No | Sí, publicado por el autor |
| Gemma 3 1B | Aproximadamente 1 B | 32.000 tokens | Licencia de Gemma | Sí, texto e imagen | Sí, publicado por el autor |

Diferencias clave: el modelo analizado es el único de la tabla cuya longitud de contexto se desconoce y el único sin benchmarks publicados. Frente a Qwen3-0.6B, cuenta con más parámetros (0,87 B frente a 0,6 B) pero carece de la documentación y el soporte de una release oficial. Frente a Llama 3.2 1B y Gemma 3 1B, tiene un tamaño ligeramente menor, aunque solo Gemma 3 1B declara capacidades multimodales confirmadas en su documentación. En términos de licencia, Apache 2.0 es la opción más permisiva de la comparativa, junto con Qwen3-0.6B.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: la model card no especifica arquitectura, contexto, dataset, método de ajuste ni hiperparámetros, lo que impide evaluar su idoneidad para producción sin pruebas empíricas previas.
- Sin benchmarks publicados: no existe ninguna métrica objetiva de calidad, razonamiento, código o matemáticas, ni comparación con el modelo base, por lo que no puede afirmarse que el ajuste mejore al modelo original.
- Repositorio con cero descargas y cero likes y nombre con sufijo "Exp-Test": no hay validación por parte de la comunidad y el propio autor lo etiqueta como prueba experimental. No se recomienda su uso en sistemas críticos.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño. En modelos por debajo de 1 B de parámetros la tasa de fabricación de hechos y de referencias inexistentes es habitualmente alta, especialmente en tareas de conocimiento factual y razonamiento multi-paso.
- Limitación idiomática: el campo de idiomas declara únicamente inglés. El rendimiento en castellano u otros idiomas no está garantizado y probablemente sea degradado.
- Capacidad multimodal incierta: el pipeline declarado es image-text-to-text, pero la model card no menciona ni desarrolla ninguna capacidad de visión. Existe una discrepancia entre los metadatos del repositorio y la documentación que debe resolverse mediante pruebas directas antes de asumir soporte de imagen.
- Riesgo de sobreajuste al dominio de ajuste: al desconocerse el dataset de finetune, no puede descartarse un ajuste estrecho que degrade capacidades generales del modelo base (olvido catastrófico).
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre conservando el aviso de licencia. Debe verificarse, no obstante, que los términos del modelo base Qwen/Qwen3.5-0.8B sean compatibles y que se cumplan sus condiciones de atribución.
- Fecha de publicación inusual (2026) y actualización 36 segundos después de la creación: los metadatos sugieren una subida automatizada sin revisión posterior, lo que refuerza la cautela sobre la calidad del artefacto.
- Sin garantías de soporte: no hay repositorio de código, demo, paper ni canal de mantenimiento asociado al modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bluestrikeai/Qwen3.5-0.8B-Exp-Test
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Unsloth (herramienta de entrenamiento citada en la model card): https://github.com/unslothai/unsloth
- TRL de Hugging Face (librería de entrenamiento citada): https://github.com/huggingface/trl
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo. Las búsquedas devolvieron exclusivamente páginas en francés sobre servicios de intermediación inmobiliaria (monchasseurimmo.com, coteacheteur.com, detectimmobilier.com, join-iad.fr, domicilium.fr), sin relación alguna con el modelo. No se dispone de paper, blog técnico, repositorio de código ni demo asociados.
