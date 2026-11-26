# buerzhi/efficienttam-s-512-safetensors

## Resumen

EfficientTAM-S (512x512) es un modelo de segmentación de imágenes y vídeo derivado de EfficientTAM (Efficient Track Anything Model), un trabajo de Meta que reformula la arquitectura de SAM 2 sustituyendo el codificador de imagen pesado por un backbone ligero basado en ViT con atención eficiente. Este repositorio concreto, publicado por el usuario `buerzhi`, no es un modelo nuevo: es un reempaquetado sin pérdida del checkpoint `efficienttam_s_512x512.pt` del repositorio original `yunyangx/efficient-track-anything`, convertido del formato PyTorch `.pt` (pickle) a `.safetensors`.

El objetivo del reempaquetado es permitir inferencia en runtimes que no dependen de PyTorch, en particular MLX (Apple Silicon) y otras herramientas que consumen safetensors de forma nativa. El modelo mantiene los 455 tensores del state dict original con valores `float32` idénticos bit a bit, lo que lo convierte en un sustituto directo del checkpoint upstream para tareas de segmentación de objeto en imagen y seguimiento en vídeo.

Con 34.056.098 parámetros y un peso de aproximadamente 136 MB en `fp32`, es un modelo pequeño orientado a despliegue en hardware modesto, incluidos equipos de consumo. La variante "S" (small) con resolución de entrada 512x512 prioriza latencia y huella de memoria sobre precisión máxima, lo que lo hace adecuado para pipelines de visión en tiempo real o en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientTAM (SAM 2 con backbone ViT ligero y atención eficiente); segmentación promptable de imagen y vídeo |
| Parametros totales | 34.056.098 (34,06 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de atención sobre imagen de 512x512) |
| Tipos de cuantizacion | no disponible en el repositorio; el checkpoint se distribuye en `float32`. Al ser safetensors, admite cuantización posterior con herramientas estándar (por ejemplo, `mlx`, `gguf`, `bnb`), pero no se documenta ninguna |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (`model.safetensors`, 136.278.776 bytes, SHA-256 `5962db5b...d5fd6338a`) |

## Arquitectura y entrenamiento

EfficientTAM parte de SAM 2 (Segment Anything Model 2) y sustituye su codificador de imagen Hiera por un ViT con atención eficiente, reduciendo drásticamente el coste computacional manteniendo el decodificador de máscaras y el módulo de memoria de vídeo de SAM 2. La variante S con entrada 512x512 es la más pequeña de la familia y está pensada para inferencia de baja latencia. El modelo es promptable: acepta puntos, cajas o máscaras como indicaciones y produce máscaras de segmentación, y en modo vídeo propaga la segmentación a lo largo de fotogramas mediante el mecanismo de memoria.

Este repositorio no aporta entrenamiento nuevo: es una conversión de contenedor del checkpoint oficial. Según la model card, los 455 tensores, sus formas y sus valores `float32` son idénticos bit a bit (`torch.equal`) al state dict original. Los metadatos del safetensors registran `model_id=efficienttam`, `license=Apache-2.0`, `source_repo=yunyangx/efficient-track-anything`, `source_filename=efficienttam_s_512x512.pt` y `source_sha256`. No se documentan en esta ficha los detalles del dataset de entrenamiento original (SA-V y datos de imagen de SAM 2), que corresponden al trabajo upstream y no se reproducen aquí.

## Capacidades

- Segmentación de imágenes promptable: genera máscaras a partir de puntos, cajas o máscaras de entrada.
- Segmentación y seguimiento de objetos en vídeo: propaga máscaras entre fotogramas mediante el módulo de memoria de SAM 2.
- Segmentación zero-shot de objetos no vistos durante el entrenamiento, gracias a la formulación promptable.
- Resolución de entrada fija de 512x512 en esta variante.
- Inferencia sin PyTorch: el formato safetensors permite su uso en MLX y otros runtimes ligeros.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es exclusivamente un modelo de visión.
- No se documentan capacidades multimodales (texto, audio) ni modo "thinking".

## Casos de uso

- Segmentación interactiva en aplicaciones de edición de imagen: el usuario hace clic sobre un objeto y el modelo devuelve la máscara; la resolución 512x512 y los 34 M de parámetros permiten respuestas casi instantáneas en portátil.
- Rotoscopia y postproducción de vídeo: propagación de máscaras fotograma a fotograma para aislar sujetos, con la ventaja de ejecutarse en Apple Silicon vía MLX sin depender de CUDA.
- Preprocesado en pipelines de visión por computador: generación de máscaras de instancias para entrenar o evaluar modelos de detección y clasificación posteriores.
- Análisis médico o industrial asistido: segmentación de regiones de interés en imágenes fijas donde se dispone de una indicación (punto o caja) del operador.
- Aplicaciones de realidad aumentada en el borde: separación de primer plano y fondo en tiempo real en dispositivos con recursos limitados, gracias al reducido tamaño del checkpoint.
- Prototipado rápido en investigación: al ser safetensors y Apache 2.0, se integra fácilmente en cuadernos y scripts sin ataduras de licencia ni de framework.
- Verificación de integridad en pipelines MLOps: el SHA-256 documentado permite validar que los pesos desplegados coinciden con el upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio solo documenta la conversión de formato y las sumas de verificación; no incluye métricas de J&F, IoU ni latencia. Para cifras de rendimiento de EfficientTAM-S conviene consultar el paper y el repositorio upstream, que no forman parte de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en `fp32`: aproximadamente 0,14 GB solo para pesos; con activaciones y buffers de imagen de 512x512, el consumo real es del orden de 1-2 GB, aunque no se documenta oficialmente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; funciona en RTX 3050/4060 y superiores, así como en A100/H100 para despliegues por lotes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas e incluso en iGPU con suficiente memoria compartida.
- Despliegue: MLX (objetivo declarado del reempaquetado), y cualquier runtime que cargue safetensors; al ser un modelo de visión, no aplican vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| EfficientTAM-S 512 (este repo) | 34,06 M | 512x512 | safetensors (fp32) | Apache 2.0 | Reempaquetado sin pérdida, orientado a MLX |
| EfficientTAM-S 512 (upstream) | 34,06 M | 512x512 | PyTorch `.pt` | Apache 2.0 | Checkpoint original de `yunyangx/efficient-track-anything` |
| SAM 2 (variantes base/large) | no disponible en esta ficha | hasta 1024 | PyTorch | Apache 2.0 | Mayor precisión y coste; backbone Hiera |
| SAM (v1) | no disponible en esta ficha | 1024 | PyTorch | Apache 2.0 | Solo imagen, sin memoria de vídeo |

La comparación con SAM 2 y SAM v1 se ofrece a título cualitativo; no se dispone de cifras de parámetros ni de benchmarks en la información proporcionada para cuantificarla.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier mejora o regresión respecto al upstream es atribuible al checkpoint original, no a este reempaquetado.
- Resolución fija de 512x512: objetos muy pequeños o imágenes de alta resolución pueden requerir reescalado y perder detalle.
- Sin benchmarks publicados en este repositorio: no hay garantía documentada de paridad de rendimiento más allá de la identidad bit a bit de los pesos.
- Riesgo de segmentaciones incorrectas en escenarios con oclusión, movimiento rápido o cambios de iluminación en vídeo.
- Sesgos heredados del dataset de entrenamiento de SAM 2 (SA-V y datos de imagen), no analizados en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero exige conservar los avisos de atribución y la nota de modificación (§4(b)) que ya incluye la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni mantenimiento continuado.
- Al no ser un modelo lingüístico, no aplican consideraciones de alucinación textual, pero sí de falsos positivos en máscaras.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/buerzhi/efficienttam-s-512-safetensors
- Modelo base upstream: https://huggingface.co/yunyangx/efficient-track-anything
- Repositorio de EfficientTAM (paper y código): no disponible en la información proporcionada
- Paper de SAM 2: no disponible en la información proporcionada
- Documentación de MLX: no disponible en la información proporcionada
