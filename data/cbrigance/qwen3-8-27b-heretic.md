# cbrigance/Qwen3.8-27b-heretic

## Resumen

Qwen3.8-27b-heretic es una variante del modelo Qwen/Qwen3.8-27B, un modelo multimodal de tipo image-text-to-text desarrollado originalmente por Alibaba Qwen y ajustado por el usuario cbrigance mediante la técnica conocida como "abliteration" (eliminación de direcciones de rechazo en el espacio de activaciones) y el pipeline Heretic. El resultado es un modelo de 27.356.728.560 parámetros (aproximadamente 27,36 mil millones) que conserva la arquitectura del modelo base pero con las capas de alineación de seguridad parcialmente neutralizadas, lo que permite respuestas sin los filtros habituales del modelo original.

El modelo se distribuye en formato safetensors y bf16, con un tamaño de repositorio de 54,7 GB, lo que es coherente con pesos completos sin cuantizar de un modelo de 27B. Está etiquetado como `not-for-all-audiences` y su acceso es restringido (gated), requiriendo aceptar condiciones en Hugging Face. Está pensado para investigadores que necesiten estudiar el comportamiento de modelos multimodales sin alineación o para experimentación sobre robustez y seguridad de sistemas.

La relevancia actual de esta ficha radica en que ejemplifica una práctica creciente: la publicación de variantes "abliterated" de modelos de gran tamaño con capacidades de visión, algo poco común en el ecosistema open source. No obstante, la información pública disponible es muy limitada (0 descargas, 0 likes, sin model card detallada), por lo que muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5 (`qwen3_5` en transformers); detalles internos no disponibles |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo deriva de Qwen/Qwen3.8-27B, un modelo de la familia Qwen3.5 con pipeline image-text-to-text, lo que implica un transformer con un codificador visual acoplado a un decodificador de lenguaje. La arquitectura exacta (número de capas, dimensión oculta, mecanismo de atención, resolución de imagen soportada) no está documentada en la información disponible. El tag `qwen3_5` en transformers sugiere que requiere una versión de la librería que incluya esa arquitectura, y el tag `arxiv:2406.11717` apunta a un paper de referencia asociado al modelo base, aunque su contenido no se detalla aquí.

El ajuste realizado por cbrigance consiste en una ablación de las direcciones de rechazo ("heretic" / "abliterated"), una técnica que identifica y elimina direcciones en el espacio de activaciones asociadas a comportamientos de negativa, sin reentrenar los pesos de forma supervisada. No se dispone de información sobre el dataset de calibración usado, el número de tokens procesados durante el ajuste, ni si se aplicó RLHF o DPO adicional. Tampoco hay datos sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.8-27B.
- Comprensión de imágenes y texto combinados (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Razonamiento de múltiples pasos y matemáticas, en la medida en que lo soporte el modelo base (no verificado en esta variante).
- Generación de código, presumiblemente conservada del modelo base (no verificada).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible.
- Multilingüismo: limitado a inglés según los tags del repositorio.
- Modo "thinking" explícito: no disponible.
- Comportamiento sin filtros de rechazo en dominios sensibles, como consecuencia del proceso de abliteration.

## Casos de uso

- Investigación en seguridad de IA: analizar cómo cambia el comportamiento de un modelo multimodal de 27B al eliminar las direcciones de rechazo, comparando respuestas con el modelo base Qwen/Qwen3.8-27B en un conjunto controlado de prompts.
- Evaluación de robustez de filtros: usar la variante como "modelo adversario" para probar clasificadores de contenido y sistemas de moderación en pipelines de producción.
- Estudio de alineación y abliteration: reproducir y medir el efecto de la técnica Heretic sobre las activaciones del modelo, cuantificando la degradación de capacidades frente al modelo original.
- Experimentación multimodal sin restricciones: tareas de descripción y análisis de imágenes en entornos de laboratorio donde se necesita evitar negativas del modelo (por ejemplo, análisis de contenido médico o forense que el modelo base rechazaría).
- Generación de datos sintéticos para entrenamiento: producir pares imagen-texto en dominios donde el modelo base se niega a responder, siempre que el uso cumpla la licencia Apache-2.0 y la legislación aplicable.
- Benchmarking comparativo de variantes: incluir esta versión en suites de evaluación para medir la diferencia de rendimiento entre un modelo alineado y su versión abliterated en tareas estándar (MMLU, tareas VQA), si se dispone de los harness adecuados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55 GB solo para pesos (27,36 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 64-80 GB de VRAM.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, o múltiples GPU (por ejemplo, 2× RTX 4090 24 GB con tensor parallelism, aunque ajustado).
- GPU consumer: no cabe en una sola RTX 4090 (24 GB) en bf16; requeriría cuantización (no publicada en el repo) para caber en 24 GB, por ejemplo en formato GGUF Q4.
- Opciones de despliegue: transformers (librería indicada en los tags); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura `qwen3_5` multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| cbrigance/Qwen3.8-27b-heretic | ~27,36 B | no disponible | imagen-texto | apache-2.0 | gated |
| Qwen/Qwen3.8-27B (base) | ~27,36 B | no disponible | imagen-texto | apache-2.0 (según repo derivado) | no disponible |
| Otras variantes abliterated de Qwen | no disponible | no disponible | texto o multimodal | variable | variable |

La comparación cuantitativa con alternativas no es posible con la información disponible; el único punto de referencia directo es el modelo base, del que esta variante hereda arquitectura y tamaño pero del que se desconoce el impacto exacto en benchmarks.

## Limitaciones y advertencias

- Modelo explícitamente marcado como `not-for-all-audiences`: puede generar contenido sensible, ofensivo o inseguro al haberse eliminado parte de la alineación de seguridad.
- Riesgo elevado de alucinación y de respuestas no veraces, especialmente en dominios donde el modelo base aplicaba cautela.
- Idiomas: solo inglés según los tags; el rendimiento en castellano no está garantizado.
- Licencia Apache-2.0 permite uso comercial, pero el usuario es responsable del cumplimiento legal y ético del contenido generado; la licencia no exime de responsabilidad sobre el mal uso.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la integración en CI/CD.
- Información pública mínima (0 descargas, sin model card detallada): no hay garantías documentadas sobre el proceso de abliteration, el dataset de calibración ni la integridad de los pesos.
- No se publican cuantizaciones; el despliegue en hardware consumer requiere convertir los pesos manualmente, con riesgo de degradación adicional.
- Posible degradación de capacidades (código, matemáticas, razonamiento) tras la ablación, no cuantificada en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/cbrigance/Qwen3.8-27b-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper de referencia (tag arxiv): https://arxiv.org/abs/2406.11717
