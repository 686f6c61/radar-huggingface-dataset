# gatilin/nld-uni-vision-encoder

## Resumen

`gatilin/nld-uni-vision-encoder` es una extracción comunitaria de la torre visual y el proyector multimodal del modelo NVIDIA NLD-Uni. No se trata de un modelo generativo completo, sino de un componente aislado: contiene únicamente los tensores `encoder.vision_tower.*` y `encoder.mm_projector.*` del repositorio original de NVIDIA (revisión `5db755a2eb0ab84654e3dcf80c7d0245bfe36a50`). El autor, `gatilin`, lo publica como pieza reutilizable para tareas de extracción de características visuales.

El componente emplea la arquitectura RADIO, un encoder visual continuo desarrollado por NVIDIA que combina un transformer de visión con adaptación a resolución variable. Cuenta con 689.399.299 parámetros en formato safetensors (1,4 GB en el repositorio) y procesa imágenes mediante parches de 16 píxeles con rejillas de tamaño variable. Incluye también el proyector del lado de comprensión, que traduce las características visuales al espacio del modelo de lenguaje del sistema original.

Su relevancia es acotada pero concreta: permite reutilizar la parte visual de NLD-Uni sin cargar el tokenizador discreto de imágenes, el modelo de difusión ni el generador de imágenes del sistema completo. Es útil para investigación en representaciones visuales, pipelines de feature extraction y experimentos de alineación visión-lenguaje. La licencia NVIDIA Research limita su uso a investigación y evaluación no comercial, lo que restringe su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision transformer tipo RADIO (encoder visual continuo) + proyector multimodal |
| Parámetros totales | 689.399.299 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa imágenes con rejillas de tamaño variable, parches de 16 px) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (componente visual, sin capacidades lingüísticas) |
| Licencia | NVIDIA Research License (uso no comercial para investigación y evaluación) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El componente es un extracto de la torre visual de NLD-Uni, basada en RADIO (un encoder visual continuo de NVIDIA). La torre procesa imágenes mediante un `image_processor` que genera rejillas de tamaño variable y las divide en parches de 16 píxeles. La salida son características visuales continuas que después atraviesan el `mm_projector`, un proyector que adapta esas representaciones al espacio del modelo de lenguaje del sistema original.

La extracción preserva nombres, formas y dtypes originales de los tensores. El repositorio incluye `extraction.json` (revisión de origen, número de tensores y SHA-256), `tensor_mapping.json` (offsets de origen) y `validation.json` (prueba de forward local y sus limitaciones). También conserva el código fuente y los avisos de atribución en `vision.py`, `radio_patch.py`, `radio_cls.py` y `projector.py`. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que la model card no los detalla.

## Capacidades

- Extracción de características visuales continuas a partir de imágenes RGB.
- Procesamiento de imágenes con resolución variable mediante rejillas adaptativas y parches de 16 píxeles.
- Proyección de características visuales al espacio multimodal del sistema NLD-Uni original.
- Integración con PyTorch, timm, einops, accelerate, safetensors, numpy y Pillow.
- No realiza generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No incluye modo thinking, audio ni generación de imágenes.

## Casos de uso

- Investigación en representaciones visuales: el componente permite extraer embeddings de imágenes con la torre RADIO de NLD-Uni sin cargar el resto del sistema, útil para estudiar propiedades de las características continuas en tareas de clasificación o recuperación.
- Experimentos de alineación visión-lenguaje: el `mm_projector` incluido permite probar cómo se proyectan las características visuales al espacio de un modelo de lenguaje, sin necesidad de replicar el pipeline completo de NVIDIA.
- Feature extraction en pipelines de visión: se puede usar como extractor de características congelado para tareas downstream (detección, segmentación o clustering de imágenes) en entornos de investigación.
- Reproducción de resultados académicos: al preservar la revisión exacta y los hashes, facilita la reproducibilidad de experimentos que dependan de la torre visual de NLD-Uni.
- Auditoría de componentes: útil para analizar el comportamiento aislado de la torre visual y del proyector, comparándolo con el sistema completo.
- Prototipado de sistemas multimodales: sirve como bloque de partida para construir prototipos de investigación que necesiten un encoder visual continuo con proyector, siempre dentro del marco no comercial de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 689 millones de parámetros, una estimación razonable en fp16 rondaría 1,4 GB de pesos, pero no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de pesos sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: la model card solo documenta uso directo con PyTorch y `snapshot_download` de Hugging Face; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gatilin/nld-uni-vision-encoder | 689.399.299 | no disponible (rejillas variables) | NVIDIA Research License | Hugging Face |
| nvidia/NLD-Uni (completo) | no disponible | no disponible | NVIDIA Research License | Hugging Face |
| Alternativas de encoder visual RADIO | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni imágenes; solo extrae características visuales.
- La licencia NVIDIA Research limita el uso a investigación y evaluación no comercial, sujeta a la excepción especificada por NVIDIA; no apto para producción comercial.
- El componente está incompleto respecto al sistema original: no incluye el tokenizador discreto de imágenes, el modelo de difusión ni el generador de imágenes.
- La documentación de arquitectura es parcial, tal como advierte el autor en la colección de Hugging Face.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas, ya que el componente no procesa lenguaje.
- La validación local documentada en `validation.json` tiene limitaciones reconocidas por el autor.
- El uso del proyector requiere aplicar exactamente las dimensiones de rejilla procesadas divididas por el tamaño de parche de 16 píxeles.

## Enlaces

- [gatilin/nld-uni-vision-encoder en Hugging Face](https://huggingface.co/gatilin/nld-uni-vision-encoder)
- [Colección ViT & Vision Encoders de gatilin](https://huggingface.co/collections/gatilin/vit-and-vision-encoders)
- [nvidia/NLD-Uni (modelo base)](https://huggingface.co/nvidia/NLD-Uni)
