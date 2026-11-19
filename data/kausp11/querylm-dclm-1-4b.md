# Kausp11/querylm-dclm-1.4b

## Resumen

QueryLM 1.4B (DCLM-Edu) es un modelo de lenguaje base de tipo decoder-only desarrollado por el usuario Kausp11, entrenado desde cero sobre texto web del corpus DCLM-Edu. Su particularidad es que durante el preentrenamiento se insertaron bloques de búsqueda en el texto: en los puntos donde una consulta externa ayudaría a predecir lo siguiente, el texto de entrenamiento contiene una consulta de búsqueda seguida de un pasaje recuperado. El modelo aprendió a formular esas consultas y a utilizar los pasajes, aunque los pasajes nunca fueron objetivo de predicción.

La arquitectura sigue el estilo nanochat: 24 capas, anchura 2.048, 16 cabezas, feed-forward de 8.192, dimensión de cabeza 128 y una longitud de contexto de 4.095 tokens. El autor reporta 1.409,6 millones de parámetros, aunque el repositorio almacena 2.619,1 millones en safetensors, incluyendo las *value embeddings*. La ventana de contexto es notablemente corta para los estándares actuales.

Este modelo es relevante como experimento de investigación sobre *retrieval* integrado en el preentrenamiento: en lugar de añadir un módulo RAG en tiempo de inferencia, el modelo aprende a invocar la búsqueda mediante tokens especiales (`<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>`, `</WEB_RESPONSE>`). Es un modelo base sin formato de chat; existe una versión con ajuste supervisado (`Kausp11/querylm-dclm-1.4b-sft-search`) publicada por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only estilo nanochat (transformer) |
| Parametros totales | 1.409,6 M reportados; 2.619,1 M almacenados (incluye value embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.095 tokens |
| Tipos de cuantizacion | No disponible (solo se documenta bfloat16 en el ejemplo de uso) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (2 shards), con `modeling_nanochat.py` en el repo |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 24 capas, anchura 2.048, 16 cabezas de atención, feed-forward de 8.192 y dimensión de cabeza 128. El tokenizador es el de SmolLM2 ampliado con cuatro tokens especiales para los bloques de búsqueda, hasta un vocabulario de 49.156. La disposición en el texto de entrenamiento es `…texto<WEB_QUERY>consulta</WEB_QUERY> <WEB_RESPONSE>pasaje</WEB_RESPONSE> texto continúa…`. La pérdida cubre el texto, la consulta y las etiquetas de consulta, pero no las etiquetas de respuesta ni el pasaje: el modelo no genera pasajes, los aporta el llamante.

El preentrenamiento usó DCLM-Edu anotado con bloques de búsqueda por un modelo anotador (Gemma 4 E4B-it con un adaptador LoRA). El anotador marca posiciones donde una búsqueda ayudaría (probabilidad de inserción mínima de 0,05, separación mínima de 40 caracteres) y escribe una consulta de hasta 24 tokens. Los pasajes provienen de recuperación BM25 sobre el corpus web público Sphere y se acortan mediante limpieza extractiva; una inserción se conserva solo si el pasaje solapa el texto posterior (ROUGE-1 F1 mínimo de 0,1 contra los siguientes 260 caracteres). El optimizador fue Muon para pesos matriciales (LR pico 0,02828) y AdamW para embeddings y cabeza de salida. El lote fue de 256 secuencias × 4.095 tokens = 1.048.320 tokens por actualización, con 40 pasos de calentamiento, programación constante y decaimiento lineal hasta el 5 % del pico. El presupuesto total fue de 41.936 actualizaciones, 44,0B tokens procesados (28,2B tokens de documento), 4,51e20 FLOPs y cómputo en bf16. El modelo se inicializó desde cero y el checkpoint corresponde al paso final de la última segmentación de entrenamiento.

## Capacidades

- Generación de texto causal en inglés, sin formato de chat (modelo base).
- Formulación de consultas de búsqueda mediante el token `<WEB_QUERY>` y cierre con `</WEB_QUERY>`.
- Uso de pasajes externos insertados por el llamante entre `<WEB_RESPONSE>` y `</WEB_RESPONSE>` para continuar la generación.
- Aprendizaje de formato *few-shot* a partir de ejemplos en el prompt (pregunta-respuesta).
- No soporta *tool calling* genérico ni *function calling* más allá del mecanismo de bloques de búsqueda.
- No dispone de modo de razonamiento explícito (*thinking*), visión, audio ni otras modalidades.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Investigación sobre RAG integrado en preentrenamiento: permite estudiar cómo un modelo aprende a decidir cuándo buscar y a redactar consultas, comparándolo con un *baseline* de cómputo equivalente (el autor menciona uno no publicado).
- Experimentos de *retrieval-augmented generation* controlados: el investigador conecta su propio recuperador (BM25, API de búsqueda web) y mide la calidad de las consultas generadas y del uso del pasaje.
- Evaluación de mecánicas de búsqueda en dominios educativos: al entrenarse sobre DCLM-Edu, puede emplearse para estudiar preguntas de conocimiento factual con pasajes recuperados de un corpus propio.
- Prototipado de asistentes de pregunta-respuesta con recuperación externa: dado su tamaño reducido, sirve para validar pipelines de consulta-recuperación-respuesta antes de escalar a modelos mayores.
- Docencia y demostraciones: su contexto de 4.095 tokens y su naturaleza base lo hacen adecuado para ilustrar el funcionamiento de los tokens especiales de búsqueda en un cuaderno interactivo.
- Comparación de estrategias de inserción de pasajes: permite medir el efecto de distintos recuperadores o longitudes de pasaje sobre la continuación generada, manteniendo fijo el modelo.
- Estudio de formatos de anotación automática: el pipeline de anotación con Gemma 4 E4B-it + LoRA y el filtro por ROUGE-1 puede reproducirse y evaluarse con este checkpoint como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente muestra la salida de un script de ejemplo (consulta "capital of Australia" y respuesta "Canberra" con un pasaje fijo), que el propio autor advierte que ilustra la mecánica y no la precisión del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,2 GB solo para pesos (tamaño del repo), más memoria para el grafo de activaciones y la caché KV; en la práctica se recomienda al menos 8 GB.
- En cuantización de 8 bits cabría en GPUs consumer de 6-8 GB; en 4 bits, en torno a 1,5-2 GB de pesos, aunque el autor no documenta cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100). El ejemplo de la model card se ejecutó en CPU con bfloat16.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más en bf16 y en GPUs de 6 GB con cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio, ya que el repo incluye `modeling_nanochat.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al tratarse de una arquitectura personalizada, la compatibilidad con esos motores no está garantizada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| QueryLM 1.4B (DCLM-Edu) | 1.409,6 M reportados (2.619,1 M almacenados) | 4.095 | No disponible | Hugging Face, requiere `trust_remote_code` | Búsqueda integrada en preentrenamiento |
| SmolLM2 (familia) | 135M / 360M / 1.7B | 8.192 (en la variante de 1.7B) | Apache 2.0 (segun la familia SmolLM2) | Hugging Face, transformers | Tokenizador base del que deriva QueryLM; sin búsqueda integrada |
| Gemma 2 2B | 2.6B | 8.192 | Términos de uso de Gemma | Hugging Face, transformers | Modelo denso de tamaño similar; sin búsqueda integrada |

La comparación con SmolLM2 y Gemma 2 2B se ofrece como referencia de categoría (modelos densos de 1-3B parámetros); no se dispone de datos de rendimiento comparativo para QueryLM 1.4B en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones ni formato de chat: no debe usarse directamente como asistente conversacional sin la versión SFT.
- Contexto muy corto (4.095 tokens), inferior al de modelos contemporáneos de tamaño similar.
- Entrenado únicamente en inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Licencia no especificada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Requiere `trust_remote_code=True`, lo que ejecuta código del repositorio; se recomienda fijar `revision=` a un commit auditado.
- Riesgo de alucinación inherente a un modelo base de 1,4B parámetros; el uso de pasajes recuperados no garantiza corrección factual.
- El modelo no genera pasajes: la calidad de la respuesta depende del recuperador externo que aporte el llamante.
- El pipeline de anotación automática (Gemma 4 E4B-it + LoRA, BM25 sobre Sphere, filtro ROUGE-1) puede introducir sesgos y errores heredados del anotador y del corpus.
- Sin datos publicados de benchmarks, evaluación de sesgos ni estudios de seguridad.
- El *baseline* de cómputo equivalente mencionado por el autor no está publicado, lo que dificulta la comparación rigurosa del efecto de la búsqueda integrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/querylm-dclm-1.4b
- Versión con ajuste supervisado: https://huggingface.co/Kausp11/querylm-dclm-1.4b-sft-search
- Dataset DCLM-Edu: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Corpus Sphere: https://github.com/facebookresearch/Sphere
- Código nanochat (upstream): commit `92d63d4` (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Paper, blog o demo: no disponibles en la información proporcionada
