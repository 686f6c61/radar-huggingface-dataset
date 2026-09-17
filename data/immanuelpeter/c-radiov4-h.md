# immanuelpeter/C-RADIOv4-H

## Resumen

C-RADIOv4-H (repositorio `immanuelpeter/C-RADIOv4-H`) es un paquete de pesos que extrae el codificador visual C-RADIOv4-H y su proyector desde el modelo multimodal NVIDIA Nemotron 3 Nano Omni (30B-A3B). No es un clon del encoder independiente `nvidia/C-RADIOv4-H`: el autor copia los 390 tensores de `vision_model.*` y los 3 tensores de `mlp1.*` de Nemotron 3 Nano Omni y los publica como un `RADIOModel` de solo visión. El problema que resuelve es práctico: permite usar la torre de visión de Omni de forma aislada, sin cargar el MoE completo de 30.000 millones de parámetros.

El repositorio contiene 653.611.529 parámetros (dato real de safetensors) repartidos entre `model.safetensors` (torre RADIO) y `projector.safetensors` (proyector `mlp1`), con un tamaño total de 1,6 GB. La torre tiene 1280 dimensiones ocultas y patch de 16, e incorpora una compresión de tokens basada en pixel shuffle 2x2 de InternVL v2 (escala 0,5) sin parámetros aprendidos, además de un `video_embedder` lineal para tubelets de 2 fotogramas.

Su relevancia es de nicho: es un artefacto de ingeniería para extracción de características de imagen dentro del ecosistema Nemotron, no un modelo con benchmarks publicados. El repositorio acumula 0 descargas y 0 «me gusta», y no declara idiomas soportados ni cuantizaciones alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) C-RADIOv4-H, 1280 dimensiones ocultas, patch 16; compresión de tokens InternVL v2 2x2 pixel shuffle (escala 0,5, sin parámetros aprendidos); proyector `mlp1` con RMSNorm(5120), Linear(5120, 20480) sin bias, SquaredReLU y Linear(20480, 2688) sin bias; `video_embedder` lineal sobre el generador de parches (tubelets de 2 fotogramas) |
| Parametros totales | 653.611.529 (dato real de safetensors) |
| Parametros activos | No aplica: el repositorio contiene solo la torre de visión y el proyector, no el MoE del modelo base |
| Longitud de contexto | No aplica: modelo de visión, no procesa texto |
| Tipos de cuantizacion | No disponible; los pesos se publican en BF16 |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Open Model Agreement (`license: other`) |
| Formato de pesos | safetensors: `model.safetensors` (390 tensores) y `projector.safetensors` (3 tensores), más `config.json`, `projector_config.json` y `projector.py` |

## Arquitectura y entrenamiento

La arquitectura es la de un codificador visual tipo ViT de la familia RADIO v4 en su variante H, con 1280 dimensiones ocultas y patch de 16 píxeles. A la salida de la torre se aplica una compresión de tokens mediante pixel shuffle 2x2 de InternVL v2 con escala 0,5, que no introduce parámetros aprendidos y reduce a la mitad el número de tokens visuales. El proyector `mlp1` transforma las características a un espacio de 2688 dimensiones mediante RMSNorm(5120), una capa lineal 5120→20480 sin bias, activación SquaredReLU y una segunda capa lineal 20480→2688 sin bias. Se añade un `video_embedder` lineal sobre el generador de parches de RADIO para trabajar con tubelets de 2 fotogramas.

No se detalla el proceso de entrenamiento: no hay datos sobre número de tokens, composición del dataset ni uso de RLHF o DPO. Lo único documentado es que los pesos proceden de las etapas de SFT de Nemotron 3 Nano Omni, lo que implica que los tensores del ViT pueden diferir de los del encoder independiente `nvidia/C-RADIOv4-H`. La validación del paquete es de paridad exacta: un script compara los 390 tensores de la torre y los 3 del proyector con el modelo Omni original mediante `torch.equal`, confirmando identidad bit a bit con `vision_model.*` y `mlp1.*` de Omni (no con `nvidia/C-RADIOv4-H`). La exportación parte del shard 1 de `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16`, elimina los prefijos y reescribe los tensores originales en BF16.

## Capacidades

- Extracción de características de imagen: genera embeddings visuales a partir de imágenes individuales.
- Codificación de vídeo ligera: el `video_embedder` sobre el generador de parches admite tubelets de 2 fotogramas.
- Proyección a un espacio de 2688 dimensiones compatible con la ruta multimodal de Nemotron 3 Nano Omni.
- Compresión de tokens 2x2 que reduce a la mitad el número de tokens visuales sin parámetros adicionales.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso: es exclusivamente un extractor de características.
- No tiene capacidades multilingües declaradas ni interfaz de texto.
- No dispone de modo «thinking», audio ni salida generativa en este repositorio.

## Casos de uso

- Búsqueda visual por similitud: el modelo devuelve vectores en un espacio de 2688 dimensiones, de modo que se puede construir un índice de similitud sobre catálogos de imágenes y recuperar las visualmente más parecidas sin depender de metadatos.
- Preprocesado para clasificadores y detectores: congelar la torre y entrenar una cabeza ligera encima permite abordar clasificación, segmentación o regresión con pocos datos etiquetados.
- Integración en pipelines multimodales: el proyector está alineado con la ruta `mlp1` de Nemotron 3 Nano Omni, por lo que sirve para reproducir o depurar la parte visual de ese modelo sin cargar los 30B del MoE.
- Análisis de vídeo corto: el `video_embedder` de tubelets de 2 fotogramas permite obtener representaciones de clips muy breves para reconocimiento de acciones simples o detección de cambios entre fotogramas.
- Control de calidad industrial: extraer características de imágenes de línea de producción y compararlas contra un banco de referencia para detectar defectos por distancia en el espacio de embeddings.
- Deduplicación de imágenes a escala: la compresión 2x2 reduce el coste de almacenamiento de los embeddings y permite comparaciones por lotes en GPU de gama media.
- Investigación sobre representaciones visuales: sirve para estudiar el efecto del SFT de Omni sobre los tensores del ViT comparándolos con `nvidia/C-RADIOv4-H`.
- Reproducción y auditoría de artefactos: el script de exportación permite regenerar exactamente este paquete a partir del shard 1 de Omni para versionado o verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única validación documentada es una prueba de paridad bit a bit (`torch.equal`) frente al modelo Omni original, que verifica la fidelidad de los pesos, pero no mide la calidad de las representaciones obtenidas.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 1,3 GB solo para pesos (653,6 M de parámetros x 2 bytes); con activaciones y overhead, entre 2 y 3 GB para lotes pequeños.
- VRAM en FP32: alrededor de 2,6 GB para los pesos, más activaciones.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM. Una RTX 3060 o RTX 4060 es suficiente; una RTX 4090, A100 o H100 queda sobredimensionada para inferencia de un solo lote.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de escritorio moderna con 6-8 GB o más; también es viable en CPU para lotes reducidos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y el cargador del ejemplo `examples/inference.py`. `AutoModel.from_pretrained` sobre este repositorio falla. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no hay versiones GGUF.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `immanuelpeter/C-RADIOv4-H` (este repositorio) | 653.611.529 | No aplica (visión) | ViT C-RADIOv4-H + proyector `mlp1` extraído de Omni | NVIDIA Open Model Agreement | HuggingFace; requiere `trust_remote_code=True` y cargador propio |
| `nvidia/C-RADIOv4-H` | No disponible en la información | No aplica (visión) | Encoder C-RADIOv4-H independiente | No disponible en la información | HuggingFace (referenciado desde la model card) |
| Torre de visión de `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16` | No disponible de forma aislada | No aplica (visión) | ViT C-RADIOv4-H + `mlp1` dentro de un MoE de 30B-A3B | NVIDIA Open Model Agreement | HuggingFace; implica cargar el modelo completo |

Nota: el encoder independiente `nvidia/C-RADIOv4-H` no incluye la ruta del proyector de Omni, y las etapas de SFT de Omni entrenan más allá del proyector, por lo que los tensores del ViT pueden diferir entre ambos.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; únicamente embeddings de imagen.
- `AutoModel.from_pretrained` falla en este repositorio; es obligatorio construir el modelo RADIO desde el `vision_config` de Omni con `trust_remote_code=True` y cargar los pesos manualmente.
- Los tensores del ViT pueden diferir de `nvidia/C-RADIOv4-H`, ya que la paridad garantizada es con Omni, no con el encoder independiente.
- No hay benchmarks publicados, por lo que no existe evidencia pública sobre la calidad de las representaciones frente a alternativas.
- El repositorio registra 0 descargas y 0 «me gusta»: no ha pasado por validación de la comunidad.
- No se declaran idiomas soportados, versiones cuantizadas (GGUF, AWQ, GPTQ) ni formato ONNX.
- La licencia es NVIDIA Open Model Agreement (`license: other`), no una licencia permisiva tipo Apache 2.0 o MIT; conviene revisar sus condiciones antes de un uso comercial.
- Alucinación: no aplica en el sentido generativo, pero el riesgo equivalente es que los embeddings no representen fielmente el contenido visual, algo que no se evalúa en la información disponible.
- Sesgos: no se documentan, si bien al tratarse de un modelo de representación visual heredará los sesgos de los datos de entrenamiento del modelo base, que tampoco se detallan.
- No hay información sobre latencia, throughput ni límites de resolución de entrada más allá del patch de 16.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/immanuelpeter/C-RADIOv4-H
- Modelo base (Nemotron 3 Nano Omni): https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Encoder independiente: https://huggingface.co/nvidia/C-RADIOv4-H
- Paper de Omni: https://arxiv.org/abs/2604.24954
- Ejemplo de inferencia: https://huggingface.co/immanuelpeter/C-RADIOv4-H/blob/main/examples/inference.py
- Script de paridad: https://github.com/immanuel-peter/vision-tower-bench/blob/main/tests/test_parity.py
- Script de exportación: https://github.com/immanuel-peter/vision-tower-bench/blob/main/scripts/export_nemotron_omni_vision.py
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Búsqueda web: no se obtuvieron resultados relevantes sobre este modelo; los enlaces devueltos correspondían a productos no relacionados con IA.
