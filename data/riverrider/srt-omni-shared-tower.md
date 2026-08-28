# RiverRider/srt-omni-shared-tower

## Resumen

SRT omni shared tower es un adaptador lineal desarrollado por RiverRider que proyecta representaciones de imagen, audio y vídeo junto con texto en un único espacio vectorial de búsqueda. Se construye sobre los estados ocultos congelados del modelo multimodal Qwen3-Omni-30B-A3B, extrayendo las activaciones a un 60 % de profundidad de la red. El adaptador ocupa solo 8 MB y permite realizar recuperación cross-modal (texto-imagen, texto-audio, texto-vídeo) sin necesidad de modelos de embedding específicos por modalidad.

El problema que resuelve es la unificación de búsqueda multimodal en un solo espacio, evitando tener que entrenar o mantener torres separadas para cada tipo de contenido. Su relevancia actual radica en que ofrece una solución extremadamente ligera (una proyección lineal) sobre un backbone potente, con resultados que superan a las torres por modalidad en todos los conjuntos de prueba. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para tareas de extracción de características y recuperación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Proyección lineal (torre) sobre estados ocultos de Qwen3-Omni-30B-A3B a 60 % de profundidad |
| Parámetros totales | no disponible (adaptador lineal de 8 MB, dimensiones 2048 → 512) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del backbone Qwen3-Omni) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en precisión completa) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (archivo .pt) |

## Arquitectura y entrenamiento

El modelo es una única capa lineal que mapea los estados ocultos de Qwen3-Omni-30B-A3B (extraídos a la profundidad del 60 %) a un espacio de 512 dimensiones. Se compone de dos proyecciones: una para los elementos (imagen, audio, vídeo) y otra para el texto, más vectores de centrado específicos por modalidad. El centrado es un paso obligatorio: sin restar la media de cada modalidad, la similitud coseno bruta entre elementos no relacionados es de +0.869 y la recuperación cae al nivel del azar.

El entrenamiento se realizó sobre un manifiesto de 5 000 imágenes de COCO, 1 000 clips de AudioCaps y 1 000 vídeos de MSR-VTT, con una única división de datos. No se proporcionan detalles sobre el número de pasos, la función de pérdida o si se usó algún tipo de aprendizaje contrastivo explícito. El autor indica que el audio presenta la puntuación más alta pero sobre la evidencia más fina (164 elementos de retención), y que el 12,6 % de los clips de AudioCaps se descargaron vacíos por ser una fuente basada en YouTube, por lo que la muestra superviviente no es aleatoria.

## Capacidades

- Extracción de características cross-modal: genera vectores de 512 dimensiones para texto, imagen, audio y vídeo en un espacio compartido.
- Recuperación multimodal: permite buscar elementos de una modalidad usando consultas de otra (p. ej., buscar imágenes a partir de texto, o vídeos a partir de audio).
- Proyección ligera: el adaptador es de solo 8 MB, por lo que puede ejecutarse en CPU o en cualquier dispositivo sin necesidad de GPU para la proyección en sí.
- Compatibilidad con el backbone Qwen3-Omni-30B-A3B: aprovecha las representaciones ya aprendidas por un modelo multimodal de última generación.
- No es generativo: no genera texto, imágenes ni audio; su función es exclusivamente producir embeddings para tareas de recuperación.

## Casos de uso

- Búsqueda en galerías multimedia: un usuario introduce una descripción textual y el sistema recupera imágenes, vídeos o clips de audio relevantes de una base de datos, usando el adaptador para proyectar consulta y elementos al mismo espacio.
- Indexación de contenido audiovisual: se pueden generar vectores para todos los activos de una biblioteca (fotos, vídeos, podcasts) y almacenarlos, permitiendo búsquedas rápidas por similitud sin necesidad de re-procesar el contenido.
- Moderación de contenido: detectar elementos visuales o de audio similares a otros ya clasificados, comparando sus embeddings en el espacio compartido.
- Sistemas de recomendación: recomendar vídeos o canciones basándose en la similitud entre la consulta del usuario y los elementos indexados, combinando modalidades.
- Organización automática de archivos: clasificar y agrupar archivos multimedia por similitud semántica, incluso cuando los metadatos son escasos.
- Investigación en recuperación cross-modal: servir como punto de partida o baseline para experimentos que requieran un espacio unificado de embeddings multimodal.

## Benchmarks y rendimiento

La model card reporta resultados de recuperación sobre un conjunto de retención de 1 376 elementos, comparando la torre compartida frente a torres separadas por modalidad. La métrica exacta no se especifica, pero parece ser una puntuación de recuperación (posiblemente recall@k o nDCG). Los valores son:

| Modalidad | Torre compartida | Torre por modalidad | n |
|---|---|---|---|
| Galería mixta | 0.2885 | 0.2667 | 1376 |
| Imagen | 0.2902 | 0.2687 | 1027 |
| Audio | 0.4451 | 0.4207 | 164 |
| Vídeo | 0.2486 | 0.1730 | 185 |

La torre compartida supera a la configuración por modalidad en todas las modalidades, con la mayor diferencia en vídeo (+0.076), que es la modalidad con menos elementos. También se menciona un "derangement floor" de 695 ± 21 frente a un valor analítico de 688, lo que sugiere que la recuperación no es aleatoria.

## Requisitos de hardware

- El adaptador en sí (8 MB) se puede ejecutar en cualquier CPU, sin requisitos de memoria significativos.
- Para extraer los estados ocultos del backbone Qwen3-Omni-30B-A3B se necesita el modelo completo, que requiere una GPU con al menos 60 GB de VRAM en fp16 (por ser un modelo MoE de 30B parámetros con 3B activos). Alternativamente, se pueden precalcular los estados y guardarlos en disco.
- Si se usan estados precalculados, el adaptador puede ejecutarse en un entorno sin GPU, con una latencia de microsegundos por proyección.
- Opciones de despliegue: el adaptador es un archivo .pt de PyTorch, por lo que se puede integrar en cualquier pipeline de Python. Para el backbone, se puede usar vLLM, TGI o Transformers, aunque el modelo base es Qwen3-Omni, que tiene soporte en Transformers.
- No se dispone de datos de latencia o throughput específicos para el adaptador, pero al ser una única multiplicación matricial, el rendimiento es esencialmente instantáneo.

## Comparativa con modelos similares

No se han identificado modelos directamente comparables en la información disponible. El enfoque de una torre lineal compartida sobre un backbone multimodal es poco común. Se podría comparar con CLIP para imagen-texto, pero CLIP no cubre audio ni vídeo, y requiere su propio backbone de visión y texto. Tampoco se dispone de resultados de otros modelos en los mismos conjuntos de datos. Por tanto, la comparativa se limita a la información proporcionada por el autor.

## Limitaciones y advertencias

- El modelo se entrenó con un conjunto de datos reducido (5 000 imágenes, 1 000 clips de audio, 1 000 vídeos) y una única división, por lo que la generalización a dominios distintos podría ser limitada.
- La muestra de audio es especialmente problemática: el 12,6 % de los clips de AudioCaps se descargaron vacíos, y los 164 elementos de retención no constituyen una muestra aleatoria de la población original.
- El centrado por modalidad es obligatorio. Si no se resta el vector `mu` correspondiente, la recuperación cae al nivel del azar. Este paso debe implementarse correctamente en producción.
- El pooling debe realizarse exclusivamente sobre los tokens de contenido de cada modalidad, no sobre todos los tokens. Promediar todos los tokens hace que el prompt compartido domine y las similitudes sean espurias (coseno 0.9987 entre elementos no relacionados).
- El adaptador depende del backbone Qwen3-Omni-30B-A3B. No funciona con otros modelos, y cualquier cambio en el backbone (versión, cuantización) puede alterar los estados ocultos y romper la compatibilidad.
- No se especifican los idiomas soportados ni la longitud de contexto máxima, lo que limita su uso en aplicaciones multilingües o con documentos largos.
- La licencia Apache 2.0 permite uso comercial, pero el backbone subyacente (Qwen3-Omni) tiene su propia licencia, que debe verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RiverRider/srt-omni-shared-tower
- Dataset de estados y scripts: https://huggingface.co/datasets/RiverRider/srt-omni-crossvendor-states
- Espacio de demostración (modelo similar, 0.6B): https://huggingface.co/spaces/RiverRider/srt-browser-demo
- Paper (mencionado como `paper_nla.md`, sin URL directa): no disponible en la información proporcionada.
