# Atzemo/Test-Q4_K_M-GGUF

## Resumen
Atzemo/Test-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo Atzemo/Test, publicada por el usuario Atzemo. Se trata de un modelo multimodal de tipo image-text-to-text (procesa imagen y texto) con aproximadamente 4.628 millones de parámetros totales, derivado de la familia Gemma según las etiquetas de la model card. La conversión se ha realizado automáticamente mediante el espacio GGUF-my-repo de ggml.ai sobre llama.cpp, por lo que el repo contiene únicamente los pesos cuantizados en Q4_K_M y no documentación técnica propia del modelo original.

El modelo se distribuye con etiquetas que indican contenido sin censura (uncensored, nsfw) y una técnica de abliteration aplicada sobre el modelo base, lo que implica que se han eliminado o atenuado direcciones de activación asociadas a rechazos de seguridad. Está orientado a inferencia local mediante llama.cpp y a despliegues compatibles con endpoints, y declara soporte para tailandés (th) e inglés (en).

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de cuantización de un modelo de visión-lenguaje de ~4,6B parámetros que cabe en GPUs de consumo, pero cuya model card no aporta información sobre arquitectura interna, datos de entrenamiento, benchmarks ni licencia. Todo uso en producción debe considerar esa ausencia de documentación como un riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como gemma; transformer multimodal image-text-to-text) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de servidor usa `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se listan otras variantes en el repo |
| Idiomas soportados | th (tailandés), en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`test-q4_k_m.gguf`); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento
No se dispone de información detallada sobre la arquitectura interna del modelo base Atzemo/Test. Las etiquetas de la model card lo asocian a la familia Gemma y al pipeline image-text-to-text, lo que sugiere un transformer multimodal con un codificador de visión acoplado a un decodificador de lenguaje, pero no se especifica el tipo exacto de fusión multimodal, la dimensión oculta, el número de capas ni el mecanismo de atención.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de alineación (RLHF, DPO u otro) ni las técnicas de post-entrenamiento aplicadas. La única intervención técnica documentada indirectamente es la abliteration, indicada en las etiquetas, que modifica los pesos para reducir la tendencia del modelo a rechazar peticiones. La cuantización Q4_K_M se ha generado con llama.cpp mediante el espacio GGUF-my-repo, sin parámetros de conversión adicionales publicados.

## Capacidades
- Generación de texto y razonamiento general en inglés y tailandés.
- Procesamiento de imágenes y texto combinados (pipeline image-text-to-text), con capacidad de responder preguntas sobre imágenes.
- Modo sin censura orientado a contenido NSFW, derivado de la abliteration aplicada al modelo base.
- Compatibilidad con llama.cpp (CLI y servidor) y con endpoints compatibles según las etiquetas del repo.
- Soporte de despliegue en vLLM según las etiquetas, aunque no se documenta configuración específica.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, audio ni modo thinking.

## Casos de uso
- Descripción de imágenes en local: el modelo puede recibir una imagen y generar una descripción textual en inglés o tailandés, ejecutándose en una GPU de consumo gracias a su tamaño de ~4,6B parámetros cuantizados a Q4_K_M.
- Asistencia en tailandés para tareas de texto: generación y resumen de contenido en tailandés, un idioma con menor cobertura en modelos abiertos, usando llama.cpp como backend ligero.
- Procesamiento de documentos escaneados con OCR asistido: combinación de imagen y texto para extraer y resumir información de capturas o fotografías, siempre que la calidad del codificador visual del modelo base sea suficiente.
- Prototipado de aplicaciones multimodales: integración en pipelines de investigación que necesiten un modelo image-text-to-text pequeño y desplegable con `llama-server` sin infraestructura dedicada.
- Experimentación en investigación sobre abliteration: estudio del comportamiento de un modelo con rechazos atenuados en tareas de visión-lenguaje, comparándolo con el modelo base sin modificar.
- Generación de contenido creativo sin restricciones de rechazo: redacción de ficción o material para adultos en inglés o tailandés, con la advertencia de que el contenido NSFW requiere controles de acceso y cumplimiento normativo.
- Evaluación de cuantización Q4_K_M: medición de la degradación de calidad frente al modelo base en tareas de visión y texto, útil para decidir si merece la pena usar cuantizaciones más agresivas en producción.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa aproximadamente 3,4 GB (tamaño del repo), por lo que se necesita un mínimo de ~4 GB de VRAM para cargar los pesos, más memoria para el contexto y las activaciones del codificador visual.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para uso en consumo; A100 o H100 solo si se requiere mayor throughput o contexto extendido.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM para contexto corto; con contexto largo o imágenes de alta resolución se recomienda 8-12 GB.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama si se genera un Modelfile a partir del GGUF, y vLLM según las etiquetas del repo (aunque vLLM requiere normalmente pesos safetensors, no GGUF, para modelos multimodales).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Atzemo/Test-Q4_K_M-GGUF | 4,63B | no disponible | Sí (image-text-to-text) | no disponible | GGUF |
| Gemma 3 4B (referencia de familia) | ~4B | no disponible en esta ficha | Sí (variantes multimodales) | Gemma Terms of Use | safetensors, GGUF |
| Qwen2.5-VL 3B | ~3B | no disponible en esta ficha | Sí | Apache 2.0 (según versión) | safetensors, GGUF |
| Llama 3.2 3B Vision | ~3B | no disponible en esta ficha | Sí | Llama 3.2 Community License | safetensors, GGUF |

La comparación es aproximada: no se dispone de datos de benchmarks del modelo evaluado ni de especificaciones verificadas de contexto, por lo que la elección frente a alternativas debe basarse en pruebas propias.

## Limitaciones y advertencias
- Ausencia total de model card técnica: no hay información sobre arquitectura, datos de entrenamiento, contexto máximo ni evaluación, lo que impide validar su calidad de forma rigurosa.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; usar en producción sin aclarar la licencia del modelo base es un riesgo legal.
- Contenido NSFW y uncensored: la abliteration elimina rechazos de seguridad, lo que aumenta el riesgo de generar contenido dañino, ilegal o inapropiado sin filtros; requiere moderación externa obligatoria.
- Riesgo de alucinación: no cuantificado por el autor; en modelos multimodales pequeños la descripción de imágenes puede inventar detalles no presentes.
- Cobertura idiomática limitada a tailandés e inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- El repo tiene 0 descargas y 0 likes y fue creado y actualizado en el mismo minuto, lo que sugiere un artefacto de prueba sin validación por la comunidad.
- La fecha de creación indicada (2026-11-10) es futura respecto a la fecha habitual de publicación, lo que conviene verificar antes de confiar en los metadatos.
- El ejemplo de servidor de la model card usa `-c 2048`, un contexto corto que puede ser insuficiente para conversaciones multi-turno o documentos largos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Atzemo/Test-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Atzemo/Test
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
