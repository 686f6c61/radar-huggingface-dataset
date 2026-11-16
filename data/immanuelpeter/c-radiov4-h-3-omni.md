# immanuelpeter/C-RADIOv4-H-3-Omni

## Resumen

C-RADIOv4-H-3-Omni es un paquete de pesos publicado por el usuario immanuelpeter que extrae el codificador visual (vision tower) y el proyector multimodal del modelo nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16. No se trata de un modelo nuevo ni de un fine-tune: es una extraccion bit a bit de los tensores `vision_model.*` (390 tensores) y `mlp1.*` (3 tensores) del modelo Omni de NVIDIA, reempaquetados en un repositorio independiente con configuracion exclusivamente visual.

El interes practico es que permite reutilizar el codificador visual de Nemotron 3 Nano Omni sin descargar el modelo completo de 30B parametros (MoE con 3B activos). El repositorio ocupa 2,9 GB y contiene 653.611.529 parametros en safetensors, correspondientes al tower C-RADIOv4-H (1280 dimensiones ocultas, patch size 16) mas el proyector y el `video_embedder`.

Es relevante para quienes necesitan extraccion de caracteristicas de imagen o video en pipelines de vision, o para investigacion sobre alineamiento vision-lenguaje, ya que expone la ruta exacta de proyeccion que usa el modelo Omni. Conviene subrayar que no es un clon del encoder independiente nvidia/C-RADIOv4-H: los tensores del ViT pueden diferir porque las etapas SFT de Omni entrenaron mas que el proyector.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer C-RADIOv4-H (1280 hidden, patch 16) + proyector MLP + video_embedder |
| Parametros totales | 653.611.529 |
| Parametros activos | no disponible (el paquete es solo el tower visual; el modelo base Omni es MoE 30B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement |
| Formato de pesos | safetensors (`model.safetensors`, `projector.safetensors`) |

## Arquitectura y entrenamiento

El paquete contiene tres piezas. La primera es el tower C-RADIOv4-H con 1280 dimensiones ocultas y patch size 16. La segunda es un mecanismo de compresion de tokens basado en el pixel shuffle 2x2 de InternVL v2 con escala 0,5, sin parametros aprendidos. La tercera es el proyector `mlp1`: `RMSNorm(5120)`, `Linear(5120, 20480)` sin bias, activacion SquaredReLU y `Linear(20480, 2688)` sin bias. Ademas incluye un `video_embedder` lineal sobre el generador de parches de RADIO que opera con tubelets de 2 frames.

No hay entrenamiento propio en este repositorio: el autor documenta un script de exportacion que lee los tensores de `vision_model.*` y `mlp1.*` del shard 1 de Nemotron 3 Nano Omni y elimina los prefijos, escribiendo los tensores BF16 originales. La validacion de paridad compara los 390 tensores del tower y los 3 del proyector con el padre Omni mediante `torch.equal`, lo que garantiza identidad bit a bit con `vision_model.*` y `mlp1.*` de Omni, pero no con nvidia/C-RADIOv4-H. El entrenamiento original del codificador y del proyector corresponde a NVIDIA y se describe en el paper arXiv:2604.24954.

## Capacidades

- Extraccion de caracteristicas de imagen: genera embeddings visuales a partir de imagenes, con la configuracion `RADIOModel` en modo solo vision.
- Extraccion de caracteristicas de video: el `video_embedder` procesa tubelets de 2 frames sobre los parches de RADIO.
- Proyeccion a espacio multimodal: el proyector `mlp1` transforma las caracteristicas visuales (5120) a la dimension 2688 que espera el modelo Omni.
- Compresion de tokens visuales: el pixel shuffle 2x2 con escala 0,5 reduce la secuencia de parches sin parametros aprendidos.
- No incluye generacion de texto, razonamiento, codigo ni matematicas: el repositorio es exclusivamente un tower visual.
- No soporta tool calling ni comportamiento de agente por si mismo.
- Capacidades multilingues: no aplicables a este paquete.
- No dispone de modo thinking, audio ni otras modalidades.

## Casos de uso

- Extraccion de embeddings para busqueda visual: usar el tower para indexar un corpus de imagenes y alimentar un motor de recuperacion vectorial, aprovechando que el paquete pesa 2,9 GB frente a los decenas de GB del Omni completo.
- Preprocesado de pipelines vision-lenguaje: generar las caracteristicas visuales y proyectarlas con `mlp1` a 2688 dimensiones para inyectarlas en un LLM compatible con la interfaz de Nemotron 3 Nano Omni.
- Clasificacion y etiquetado de imagenes a escala: congelar el tower y entrenar una cabeza ligera encima para tareas de clasificacion especificas de dominio.
- Analisis de video de corta duracion: el `video_embedder` con tubelets de 2 frames permite extraer representaciones de clips para tareas de deteccion de eventos o resumen visual.
- Investigacion en alineamiento vision-lenguaje: al ser identico bit a bit al tower de Omni, sirve para estudiar como responde el proyector a distintas distribuciones de imagen sin cargar el modelo completo.
- Destilacion o evaluacion de encoders: usar el tower como referencia de paridad frente a C-RADIOv4-H independiente para medir el efecto de las etapas SFT de Omni sobre los pesos del ViT.
- Prototipado en entornos con VRAM limitada: el paquete cabe en GPUs de consumo para inferencia de extraccion de caracteristicas, a diferencia del modelo Omni de 30B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 653,6 M de parametros en BF16, los pesos ocupan aproximadamente 1,3 GB; en FP32, unos 2,6 GB. El repo completo son 2,9 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en BF16 o FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son adecuadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas.
- Opciones de despliegue: el autor indica que `AutoModel.from_pretrained` sobre este repositorio falla; hay que construir RADIO desde el `vision_config` de Omni con `trust_remote_code=True` y cargar los pesos del repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| C-RADIOv4-H-3-Omni (este repo) | 653,6 M | no disponible | Extraccion de caracteristicas de imagen y video | NVIDIA Open Model Agreement | Hugging Face, 39 descargas |
| nvidia/C-RADIOv4-H | no disponible | no disponible | Extraccion de caracteristicas de imagen | no disponible | Hugging Face |
| nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16 | 30B (3B activos, MoE) | no disponible | Modelo omni multimodal con razonamiento | NVIDIA Open Model Agreement | Hugging Face |

La diferencia clave frente a C-RADIOv4-H independiente es que este paquete incluye la ruta del proyector Omni (`mlp1`) y un `video_embedder`, y sus tensores del ViT pueden diferir por las etapas SFT de Omni. Frente al Omni completo, ofrece la misma ruta visual con un coste de almacenamiento y VRAM mucho menor, pero sin ninguna capacidad de generacion o razonamiento.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce caracteristicas visuales; no responde preguntas ni genera texto.
- `AutoModel.from_pretrained` falla sobre este repositorio; requiere construccion manual del modelo desde el `vision_config` de Omni con `trust_remote_code=True`.
- Los pesos no son identicos a nvidia/C-RADIOv4-H; la paridad bit a bit es con el padre Omni, no con el encoder independiente.
- El repositorio tiene 39 descargas y 0 likes, y fue creado en septiembre de 2026: no hay evidencia de uso en produccion ni validacion externa.
- La licencia NVIDIA Open Model Agreement impone condiciones para uso comercial; conviene revisar el texto completo antes de desplegar.
- No se documentan idiomas soportados ni sesgos conocidos para este paquete.
- Riesgo de alucinacion: no aplica directamente al ser un extractor de caracteristicas, pero cualquier cabeza o LLM que se conecte aguas abajo puede introducirlo.
- El autor advierte que las etapas SFT de Omni entrenaron mas que el proyector, por lo que los pesos del ViT pueden haberse desplazado respecto al encoder original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/immanuelpeter/C-RADIOv4-H-3-Omni
- Modelo base Omni: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Encoder independiente: https://huggingface.co/nvidia/C-RADIOv4-H
- Paper de Omni: https://arxiv.org/abs/2604.24954
- Script de paridad: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/parity/nemotron_omni.py
- Script de exportacion: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/adapters/nemotron_omni.py
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
