# KBlueLeaf/Foliation-L

## Resumen

Foliation-L es un codificador de vídeo auto-supervisado desarrollado por KBlueLeaf, publicado en HuggingFace bajo licencia Apache-2.0. Sigue la estela de TT-VidT (NeurIPS 2026), una arquitectura que desacopla el eje temporal para el preentrenamiento eficiente de representaciones centradas en el movimiento. El modelo no genera texto ni responde a instrucciones: es un extractor de características que produce representaciones densas por fotograma a partir de clips RGB.

La propuesta técnica clave es que cada fotograma conserva sus propios tokens espaciales y solo unos pocos *motion tokens* por fotograma intercambian información a través del tiempo mediante atención Temporal Transfer (TT3D) de tipo block-causal. Esto reduce drásticamente el coste computacional frente a la atención espacio-temporal completa, manteniendo la capacidad de modelar movimiento. El modelo tiene 425,6 millones de parámetros, 24 bloques, anchura 1024 y 16 cabezas de atención.

Es relevante ahora porque ofrece un encoder de vídeo ligero y con licencia permisiva que puede integrarse en pipelines de clasificación de vídeo, recuperación multimodal o análisis de movimiento sin depender de modelos propietarios. Su naturaleza causal por fotograma (el fotograma `t` solo depende de `0..t`) facilita el procesamiento en streaming y el cómputo incremental sobre prefijos de un clip.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer con atención TT3D block-causal (TT-VidT) |
| Parámetros totales | 425.577.216 (425,6 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | clips de 32 fotogramas (ventana temporal de entrenamiento); contexto causal por prefijo |
| Tipos de cuantización | no disponible (pesos publicados en fp32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32, solo encoder) |

## Arquitectura y entrenamiento

Foliation-L es un transformer de visión de 24 bloques con anchura 1024, 16 cabezas y parche de 16×16 píxeles. Cada fotograma mantiene sus tokens espaciales propios (tokens de parche en orden row-major) más 4 tokens de clase y 8 *motion tokens*. La comunicación temporal se realiza exclusivamente a través de los motion tokens mediante atención Temporal Transfer (TT3D) de tipo block-causal: el fotograma `t` solo atiende a los fotogramas `0..t`, lo que garantiza que un prefijo de un clip produzca exactamente las mismas salidas que el clip completo.

La entrada son clips RGB con forma `[B, T, 3, H, W]` normalizados en el rango [-1, 1] (media = desviación = 0,5). El entrenamiento se realizó sobre clips de 32 fotogramas de 256×256 píxeles a 6 fps. El preentrenamiento es auto-supervisado y centrado en el movimiento, siguiendo el método descrito en TT-VidT (*Decoupling the Temporal Axis for Efficient Motion-Centric Video Pretraining*, NeurIPS 2026). No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste supervisado o RLHF.

## Capacidades

- Extracción de representaciones de vídeo auto-supervisadas: produce tokens de movimiento por fotograma (`out.motion`, `[B, T, 8, 1024]`), tokens de parche (`out.frames`, `[B, T, H/16·W/16, 1024]`) y un CLS por fotograma (`out.cls`, `[B, T, 1024]`).
- Clasificación de vídeo: el pipeline declarado es `video-classification`, aunque el checkpoint publicado es solo el encoder (requiere cabeza de clasificación para la tarea final).
- Modelado de movimiento: los motion tokens están diseñados específicamente para capturar dinámica temporal entre fotogramas.
- Procesamiento causal en streaming: al ser block-causal, admite cómputo incremental sobre prefijos de un clip sin recalcular el pasado.
- Extracción de características para *feature-extraction* (tag declarado en el repositorio).
- No soporta generación de texto, tool calling, agentes, razonamiento simbólico ni capacidades multilingües: es exclusivamente un encoder visual.

## Casos de uso

- Clasificación de acciones en vídeo: usar `out.cls` por fotograma o agregado temporal como entrada a una cabeza lineal o MLP para etiquetar clips (por ejemplo, reconocimiento de gestos o actividades deportivas) aprovechando las representaciones preentrenadas con 425 M de parámetros.
- Recuperación de vídeo por similitud: extraer embeddings CLS o de parche para indexar clips y construir un buscador de similitud vectorial, útil en archivos audiovisuales o catálogos de contenido.
- Detección de movimiento y análisis de dinámica: los motion tokens por fotograma permiten alimentar modelos ligeros de detección de eventos (caídas, intrusiones, anomalías en vigilancia) sin reentrenar el encoder desde cero.
- Procesamiento en streaming de vídeo en directo: la naturaleza causal block-causal permite alimentar fotogramas de forma incremental y obtener representaciones actualizadas sin recomputar el clip completo, adecuado para analítica en tiempo real con latencia acotada.
- Preentrenamiento de modelos multimodal vídeo-texto: congelar Foliation-L como torre visual y entrenar un adaptador hacia un LLM para tareas de captioning o respuesta a preguntas sobre vídeo.
- Segmentación temporal de vídeo: combinar los tokens de parche por fotograma (`out.frames`) con cabezas de segmentación para delimitar acciones o eventos en el eje temporal.
- Extracción de características para *clustering* y curación de datasets: generar embeddings de clips para deduplicar, agrupar o filtrar grandes colecciones de vídeo antes de entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 1,7 GB (tamaño del repositorio). Con autocast a fp16 (como muestra el *quick start*), la huella de pesos baja a unos 0,85 GB; a esto hay que sumar activaciones, que dependen del tamaño del lote y de la longitud del clip (32 fotogramas de 256×256 generan 256 tokens de parche por fotograma más 12 tokens adicionales).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería poder ejecutar inferencia en fp16 con lotes pequeños; para lotes mayores o clips más largos, se recomienda A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes, en fp16 y con lotes moderados.
- Opciones de despliegue: al requerir `trust_remote_code=True` y código propio en el repositorio, el despliegue estándar es vía `transformers` con `AutoModel`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos de lenguaje y no aplican directamente a este encoder).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto temporal | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Foliation-L | 425,6 M | 32 fotogramas (causal) | Codificador de vídeo auto-supervisado | Apache-2.0 | HuggingFace (`KBlueLeaf/Foliation-L`) |
| TT-VidT | no disponible | no disponible | Codificador de vídeo auto-supervisado | no disponible | paper (arXiv:2609.33419) |
| VideoMAE (referencia) | ~87 M (ViT-B) | clips cortos | Codificador de vídeo auto-supervisado | MIT / CC-BY-NC según variante | HuggingFace |
| ViViT (referencia) | ~80-300 M | clips cortos | Clasificación de vídeo | Apache-2.0 (implementación) | repositorios de investigación |

No se dispone de datos de rendimiento comparativo para Foliation-L en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo encoder: el checkpoint no incluye cabeza de clasificación ni cabezal de generación; para tareas downstream hay que entrenar cabezas adicionales.
- Ventana temporal de entrenamiento limitada a 32 fotogramas a 6 fps (aproximadamente 5,3 segundos); el comportamiento más allá de esa longitud no está documentado.
- Resolución de entrenamiento fija de 256×256; no se documenta el rendimiento con otras resoluciones o relaciones de aspecto.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo; conviene auditar el código antes de usarlo en producción.
- No hay información sobre sesgos del dataset de entrenamiento ni sobre composición del mismo, lo que dificulta evaluar sesgos demográficos o culturales en las representaciones.
- Riesgo de alucinación no aplica directamente (no genera texto), pero las representaciones pueden ser poco fiables en dominios alejados de los datos de preentrenamiento.
- Sin datos de benchmarks publicados: no se puede verificar su rendimiento frente a alternativas establecidas como VideoMAE o ViViT.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de TT-VidT conviene revisar las condiciones del paper y de cualquier peso o dato subyacente.
- Repositorio con muy poca tracción (20 descargas, 0 likes) y creado recientemente; no hay evidencia de validación comunitaria ni de mantenimiento a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KBlueLeaf/Foliation-L
- Paper TT-VidT (arXiv:2609.33419): https://arxiv.org/abs/2609.33419
- Página del paper en HuggingFace: https://huggingface.co/papers/2609.33419
