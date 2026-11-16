# immanuelpeter/C-RADIOv4-H-3.5-Bolt

## Resumen

C-RADIOv4-H-3.5-Bolt es un paquete de extraccion de caracteristicas visuales publicado por el usuario immanuelpeter en Hugging Face. No es un modelo de lenguaje completo, sino la torre de vision (vision tower) y el proyector multimodal extraidos del modelo NVIDIA Nemotron 3.5 Bolt, un modelo de 74 mil millones de parametros con arquitectura MoE y 9 mil millones de parametros activos. El repositorio aísla el componente visual para que pueda reutilizarse de forma independiente en tareas de image-feature-extraction.

El modelo combina una torre C-RADIOv4-H de 32 capas y 1280 dimensiones ocultas con parches de 16x16, junto con un proyector MLP que transforma las caracteristicas visuales al espacio de embeddings del modelo de lenguaje original (4096 dimensiones). El paquete incluye compresion de tokens mediante pixel shuffle 2x2 de InternVL v2, reduciendo la secuencia visual de 784 tokens a 196 tokens fusionados.

Es relevante porque permite a desarrolladores e investigadores reutilizar el codificador visual de un modelo multimodal de gran escala sin necesidad de cargar el modelo completo de 74B, lo que reduce drásticamente los requisitos de VRAM y facilita su integracion en pipelines de vision por computador, sistemas RAG multimodales o arquitecturas VLM personalizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer C-RADIOv4-H (32 capas, 1280 hidden, patch 16) + proyector MLP |
| Parametros totales | 653.611.528 |
| Parametros activos | no disponible (no es MoE en este paquete) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La torre de vision es C-RADIOv4-H, un transformer de 32 capas con 1280 dimensiones ocultas y tamano de parche 16, que incorpora diez tokens de prefijo (prefix tokens) y genera 784 tokens de torre de ancho 1280 para entradas de 448 pixeles. Sobre esta torre se aplica una compresion de tokens mediante pixel shuffle 2x2 de InternVL v2 con escala 0.5, sin parametros aprendidos, que reduce la secuencia a 196 tokens fusionados de ancho 5120.

El proyector (`mlp1`) consta de RMSNorm(5120), una capa Linear(5120, 20480) sin sesgo, activacion SquaredReLU y una capa Linear(20480, 4096) sin sesgo, produciendo 196 tokens proyectados de ancho 4096 que coinciden con la dimension de embedding del modelo Nemotron 3.5 Bolt. Los pesos se exportaron en BF16 directamente desde el modelo padre mediante un script de reproduccion, y la validacion se realizo con un test de paridad que compara cada tensor exportado con el padre usando `torch.equal`. No se dispone de informacion sobre el dataset de entrenamiento ni sobre el proceso de alineacion (RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Extraccion de caracteristicas visuales (image feature extraction) a partir de imagenes de entrada.
- Generacion de embeddings visuales en dos etapas: tokens de torre (1280 dim) y tokens proyectados (4096 dim).
- Compresion de tokens visuales mediante pixel shuffle 2x2, reduciendo la longitud de secuencia de 784 a 196 tokens.
- Integracion con el espacio de embeddings del modelo Nemotron 3.5 Bolt mediante el proyector MLP.
- Uso como componente de vision en arquitecturas VLM personalizadas.
- No incluye generacion de texto, tool calling, agentes ni capacidades multilingues propias (es un modulo visual).
- No dispone de modo thinking, vision generativa ni audio.

## Casos de uso

- Extraccion de embeddings para busqueda visual: el modelo genera vectores de 4096 dimensiones por imagen que pueden indexarse en bases vectoriales para sistemas de recuperacion de imagenes similares.
- Construccion de pipelines VLM personalizados: al aislar la torre y el proyector, un equipo puede conectar este componente visual a un LLM propio sin cargar el Nemotron completo de 74B.
- Preprocesamiento para RAG multimodal: las caracteristicas visuales comprimidas a 196 tokens permiten alimentar documentos escaneados o capturas a un modelo de lenguaje con contexto limitado.
- Clasificacion y etiquetado de imagenes: los embeddings de 1280 o 4096 dimensiones sirven como entrada a cabezales de clasificacion ligeros entrenados por transferencia.
- Moderacion de contenido visual: extraccion de caracteristicas para alimentar clasificadores de contenido en pipelines de revision automatizada.
- Investigacion en representaciones visuales: reproduccion de experimentos con la torre C-RADIOv4-H de forma aislada, comparando etapas de torre, fusion y proyeccion.
- Sistemas de descripcion de imagenes: combinado con un decoder de texto, el proyector entrega tokens en el espacio de 4096 dimensiones compatible con el LLM original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,3 GB solo para pesos (653,6 M de parametros), mas memoria de activaciones para imagenes de 448 px.
- VRAM estimada en FP16: similar al BF16, en torno a 1,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia por lotes pequenos; RTX 3060, RTX 4090, A100 o H100 son adecuadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas.
- Opciones de despliegue: PyTorch nativo (el repositorio incluye `vision.py` y `examples/inference.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este paquete.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| C-RADIOv4-H-3.5-Bolt | 653,6 M | no aplica | Image feature extraction | OpenMDW-1.1 | Hugging Face |
| nvidia/C-RADIOv4-H | no disponible | no aplica | Image feature extraction | no disponible | Hugging Face |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 | 74 B (9 B activos) | no disponible | Modelo multimodal completo | no disponible | Hugging Face |

La comparativa con alternativas de la misma categoria (codificadores visuales tipo SigLIP, CLIP o DINOv2) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modulo visual, no un modelo de lenguaje: no genera texto ni responde instrucciones.
- No se documentan sesgos conocidos ni evaluaciones de robustez en la informacion disponible.
- Riesgo de alucinacion no aplicable directamente al no generar texto, pero los embeddings pueden no representar fielmente imagenes fuera de dominio.
- No se especifican idiomas soportados ni limitaciones de contexto (no aplica en sentido estricto).
- La licencia OpenMDW-1.1 es una licencia de pesos abiertos con terminos especificos; debe revisarse antes de uso comercial.
- El modelo depende del modelo padre Nemotron 3.5 Bolt para reproducibilidad; cambios en el padre pueden romper la paridad.
- El repositorio tiene muy pocas descargas (56) y un solo like, lo que sugiere validacion comunitaria limitada.
- No se documentan cuantizaciones oficiales ni soporte en frameworks de inferencia optimizados.

## Enlaces

- Hugging Face: https://huggingface.co/immanuelpeter/C-RADIOv4-H-3.5-Bolt
- Modelo padre Nemotron 3.5 Bolt: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Torre C-RADIOv4-H original: https://huggingface.co/nvidia/C-RADIOv4-H
- Test de paridad: https://github.com/immanuel-peter/vision-tower-bench/blob/main/tests/test_release_parity.py
- Script de exportacion: https://github.com/immanuel-peter/vision-tower-bench/blob/main/scripts/export_nemotron35_vision.py
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
