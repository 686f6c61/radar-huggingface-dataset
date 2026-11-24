# johnnelson/retrieval90

## Resumen

`johnnelson/retrieval90` es un repositorio experimental que contiene una implementación funcional de CLIP (Contrastive Language-Image Pre-training) orientada a tareas de recuperación (retrieval) multimodal, publicada por el usuario johnnelson bajo licencia Apache 2.0. El modelo se distribuye con una configuración "small" y un checkpoint de inicialización (`model.safetensors`) que, según la propia model card, no ha sido entrenado ni evaluado con benchmarks; su propósito declarado es servir como punto de partida reproducible para pruebas de humo (smoke tests) y experimentación con código transparente.

La arquitectura sigue el paradigma CLIP, con atención de ventana deslizante (sliding window), fusión con compuertas (gated fusion), activación aproximada GELU y normalización LayerNorm. El repositorio incluye `inference.py` como artefacto principal, `config.json` con los ajustes de arquitectura y `training_args.json` con la receta de experimento por defecto (AdamW con schedule por pasos). No se declaran resultados de benchmarks ni se presenta como un checkpoint entrenado para producción.

Es relevante ahora únicamente como material de referencia para quienes quieran reproducir o adaptar una implementación CLIP mínima para retrieval imagen-texto, no como un modelo listo para uso real. El recuento de parámetros reportado en safetensors es de 33.088, lo que confirma que se trata de una configuración extremadamente pequeña, coherente con su carácter de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (transformer multimodal imagen-texto) con atención de ventana deslizante y gated fusion |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización); código en Python (`inference.py`) |

## Arquitectura y entrenamiento

La arquitectura es una implementación CLIP de escala "small" con atención de ventana deslizante, fusión mediante compuertas (gated fusion), activación aproximada GELU y LayerNorm. El repositorio incluye `config.json` con los ajustes generados de arquitectura y `training_args.json` con la receta de experimento por defecto: optimizador AdamW y un schedule basado en pasos. La model card advierte explícitamente que estos valores son puntos de partida del script y no evidencia de un entrenamiento completado.

No se especifica el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste fino posterior. El checkpoint `model.safetensors` se describe como una inicialización válida para pruebas de humo, no como un modelo entrenado. No se documentan innovaciones técnicas adicionales más allá de las mencionadas en la arquitectura.

## Capacidades

- Recuperación multimodal imagen-texto: el diseño CLIP permite, en principio, alinear representaciones de imagen y texto para búsqueda cruzada.
- Recuperación texto-imagen: misma capacidad en sentido inverso, sujeta a que el checkpoint esté entrenado (no es el caso del checkpoint distribuido).
- Generación de embeddings: el modelo puede producir representaciones vectoriales de ambas modalidades para indexación y búsqueda por similitud.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): visión únicamente en el sentido de codificador de imágenes CLIP; no se declaran modos de razonamiento ni audio.

## Casos de uso

- Pruebas de humo de pipelines de retrieval multimodal: el checkpoint de inicialización permite validar la carga del modelo, el flujo de inferencia y la integración con un índice vectorial antes de entrenar con datos reales.
- Reproducción de experimentos académicos: sirve como base para comparar implementaciones CLIP propias con baselines de igual capacidad, tal como sugiere la model card (evaluación en Flickr30k con al menos tres semillas).
- Desarrollo de prototipos de búsqueda imagen-texto: útil para construir la infraestructura de indexación y consulta (por ejemplo, con FAISS o similar) mientras se sustituye el checkpoint por uno entrenado.
- Docencia y formación: el código transparente y la configuración pequeña facilitan explicar el funcionamiento interno de CLIP y el entrenamiento contrastivo sin requerir hardware significativo.
- Base para ajuste fino en dominios específicos: al ser una implementación mínima con licencia Apache 2.0, puede adaptarse a datasets propios de recuperación (moda, productos, imágenes médicas) partiendo de cero o de otro checkpoint.
- Validación de infraestructura de evaluación: el repositorio permite montar el pipeline de métricas de retrieval (por ejemplo, recall@k) y verificar que las comparaciones entre modelos son justas antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 33.088 parámetros totales, el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 o superior) es más que suficiente; también A100/H100 si se integra en infraestructura existente, aunque no son necesarias.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en sistemas integrados.
- Opciones de despliegue: al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito; el script `inference.py` es el punto de entrada previsto. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| johnnelson/retrieval90 | 33.088 | no disponible | sin benchmarks (checkpoint de inicialización) | Apache 2.0 | Hugging Face |
| OpenAI CLIP (ViT-B/32) | ~151 M | 77 tokens de texto | benchmarks públicos en ImageNet, Flickr30k, etc. | MIT (código) / uso abierto | Hugging Face, repos oficiales |
| OpenCLIP (ViT-B/32) | ~151 M | 77 tokens de texto | benchmarks públicos reproducibles | MIT / Apache 2.0 según variante | Hugging Face, GitHub |

La comparación es únicamente estructural: `retrieval90` es una implementación mínima sin entrenamiento declarado, mientras que CLIP y OpenCLIP son modelos entrenados con benchmarks publicados. No se dispone de datos para comparar rendimiento de retrieval de forma directa.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: los pesos son una inicialización para pruebas de humo, no un modelo funcional para retrieval real.
- No hay benchmarks ni evaluación de robustez, equidad o transferencia de dominio; cualquier uso en producción carece de base empírica.
- Sesgos conocidos: no documentados, pero al no estar entrenado no se han auditado sesgos de ningún tipo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings producidos por un checkpoint sin entrenar no tendrán significado semántico útil.
- Limitaciones de contexto e idioma: no se declaran; la longitud de contexto de texto e imagen no está especificada.
- Restricciones de licencia: Apache 2.0 permite uso comercial del código y pesos, pero la model card advierte de revisar por separado los términos de los datasets externos que se utilicen.
- Para producción: requiere entrenamiento completo, evaluación con métricas de retrieval (por ejemplo, recall@k en Flickr30k) y auditoría antes de cualquier despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/johnnelson/retrieval90
- Repositorio de código: incluido en el propio repo (`inference.py`)
- Paper de referencia CLIP (Radford et al., 2021): no enlazado en la información disponible
- OpenCLIP: no enlazado en la información disponible
