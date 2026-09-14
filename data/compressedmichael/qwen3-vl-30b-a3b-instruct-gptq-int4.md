# CompressedMichael/Qwen3-VL-30B-A3B-Instruct-GPTQ-INT4

## Resumen

Qwen3-VL-30B-A3B-Instruct-GPTQ-INT4 es una derivada cuantizada del modelo multimodal Qwen3-VL-30B-A3B-Instruct, publicado por el usuario CompressedMichael bajo licencia Apache-2.0. Se trata de un modelo de mezcla de expertos (MoE) con torre de visión, convertido a INT4 mediante GPTQ con la herramienta llm-compressor y exportado en el formato compressed-tensors. El objetivo es reducir el peso en disco de un modelo de clase 30B multimillonaria hasta 16,55 GiB repartidos en cinco shards, manteniendo las activaciones en BF16 (esquema W4A16).

El modelo conserva la estructura completa del MoE: los pesos de todos los expertos se almacenan aunque solo se active un subconjunto por token, de ahí la nomenclatura A3B del modelo base (aproximadamente 3 000 millones de parámetros activos). La parte de visión, los embeddings, las puertas del router, las capas de normalización y la cabeza de salida permanecen en BF16; solo se cuantizan las capas lineales de atención de lenguaje y de los expertos. La calibración se hizo con 128 pares imagen-primera descripción del split de test de Flickr30k, con hasta 256 tokens de imagen y 1024 tokens totales por ejemplo, garantizando cobertura de todos los expertos.

Su relevancia práctica es doble: por un lado, permite explorar un VLM de clase 30B en hardware más modesto que el necesario para BF16; por otro, es un ejemplo de flujo de cuantización reproducible con llm-compressor. Conviene señalar que el autor no mide precisión relativa frente al modelo original ni velocidad de servicio en bajo bit, y que la compatibilidad con vLLM, AutoGPTQ y kernels de bajo bit no está validada, por lo que hoy es un artefacto experimental y no una pieza lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (qwen3_vl_moe), pipeline image-text-to-text |
| Parámetros totales | ~30 000 millones según el nombre del modelo base. El recuento real reportado en safetensors es 5 144 487 536, que corresponde a tensores INT4 empaquetados y no al número efectivo de parámetros |
| Parámetros activos | ~3 000 millones (nomenclatura A3B del modelo base); no verificado en esta cuantización |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | INT4 simétrico, group size 128, W4A16 (pesos INT4, activaciones BF16); visión, embeddings, puertas del router, normalizaciones y lm_head en BF16; sin variantes GGUF ni AWQ publicadas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors, 5 shards, 16,55 GiB |
| Módulos lineales cuantizados | 18 624 |
| Tamaño del repositorio | 17,8 GB |
| Modelo base | Qwen/Qwen3-VL-30B-A3B-Instruct (revisión 9c4b90e1e4ba969fd3b5378b57d966d725f1b86c) |
| Fecha de publicación | 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer de mezcla de expertos para entrada imagen-texto, con una torre de visión dedicada y atención de lenguaje repartida entre expertos. Los parámetros de expertos fusionados en 3D del modelo original se convirtieron a módulos lineales 2D independientes, lo que exige cargar el modelo con `AutoModelForImageTextToText` y `trust_remote_code=True` usando el fichero `modeling_qwen3_vl_moe_quantized.py` incluido en el repositorio. Cargar con la clase estándar de Qwen3-VL MoE no reproduce este layout. No se ha publicado ningún entrenamiento adicional: esta ficha documenta únicamente un proceso de cuantización post-entrenamiento, no un ajuste fino.

La cuantización se realizó con GPTQ de pesos y ordenación estática de activaciones, con cada método partiendo de forma independiente de los pesos BF16 originales. La calibración empleó 128 pares imagen-primera descripción del split de test de Flickr30k (revisión `765d117f3eec816f2bfdc2d73ebb50a6f77b86a4`), con semilla 42 y barajado previo; cada ejemplo usa hasta 256 tokens de imagen y 1024 tokens totales, y el proceso se diseñó para que todos los expertos recibieran entradas de calibración. Los detalles completos del recetario están en `recipe.yaml` y `quantization_run.json`. La validación del 13 de septiembre de 2026 consistió en una recarga en Transformers sin pesos faltantes, inesperados ni desajustados, y una generación greedy de 48 tokens sobre una imagen retenida de Flickr30k que produjo una descripción no vacía y sin puntuaciones NaN. No se realizó ningún tipo de RLHF, DPO ni otra fase de alineamiento sobre esta derivada.

## Capacidades

- Generación de texto e imagen a texto: el pipeline declarado es image-text-to-text y la validación confirma la generación de descripciones de imagen.
- Conversación multiturno: el tag `conversational` del modelo base se mantiene, aunque no se documenta una evaluación específica en esta cuantización.
- Razonamiento, código, matemáticas, tool calling, uso de agentes y modo thinking: capacidades atribuibles a la familia del modelo base, pero no verificadas ni documentadas en esta ficha; se marcan como no disponibles a efectos de evaluación.
- Capacidades multilingües: no disponible.
- Capacidad especial relevante: el modelo conserva todos los pesos del MoE (incluidos los expertos no activos) en INT4, lo que permite mantener el enrutado completo con un peso en disco de 16,55 GiB.

## Casos de uso

- Descripción automática de imágenes en catálogos: el modelo puede generar pies de foto a partir de imágenes y texto, el escenario exactamente cubierto por su calibración y su prueba de validación, por lo que es el caso con mayor respaldo empírico dentro de esta ficha.
- Moderación de contenido visual asistida: combinando una imagen con una instrucción textual se pueden generar clasificaciones razonadas; requiere validación propia, ya que no hay métricas publicadas.
- Prototipado de asistentes multimodales en una sola GPU: al ocupar 16,55 GiB en disco, permite montar un entorno de investigación con un VLM de clase 30B en hardware de gama alta de consumo, siempre que se disponga del camino de kernel bajo bit correspondiente.
- Evaluación comparativa de técnicas de cuantización: el repositorio incluye `artifact_audit.json` con cobertura de cuantización, tipos de almacenamiento, índice de shards y comprobaciones de integridad de los 18 624 lineales, lo que lo convierte en un material útil para estudiar el efecto de GPTQ W4A16 en un MoE multimodal.
- Extracción de información estructurada de documentos escaneados: al aceptar imagen más texto, puede emplearse para transcribir y estructurar contenido; la ausencia de benchmarks obliga a medir la calidad en el dominio concreto antes de usarlo.
- Reproducción de flujos de cuantización con llm-compressor: el par `recipe.yaml` más `quantization_run.json` sirve como plantilla para cuantizar otros MoE multimodales con el mismo recetario y condiciones de calibración.
- Investigación sobre degradación de precisión en modelos mixtos: la combinación de pesos de visión y router en BF16 con expertos en INT4 es un caso de estudio útil, aunque la cuantificación de esa degradación tendrá que hacerla el propio usuario.
- Despliegue de bajo coste en entornos controlados: en escenarios internos con un único usuario y contexto corto, el ahorro de memoria frente a BF16 puede justificar su uso, aceptando la falta de validación en servidores de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La validación documentada se limita a comprobar la recarga del checkpoint sin errores de pesos y una generación greedy de 48 tokens sobre una imagen retenida de Flickr30k, sin NaN en las puntuaciones. El autor indica explícitamente que no se midieron la precisión en benchmarks, la precisión relativa al modelo original ni la velocidad de servicio en bajo bit.

## Requisitos de hardware

- Peso en disco del checkpoint: 16,55 GiB en 5 shards; el repositorio completo ocupa 17,8 GB. Este tamaño no equivale al consumo de memoria en ejecución.
- Ruta Transformers estándar: el autor advierte que Transformers puede descomprimir los pesos a BF16 durante la carga. Para un modelo de clase 30B eso implica reservar aproximadamente 60 GB solo para pesos, más espacio de trabajo y caché KV, es decir, GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto entre varias GPU con `device_map="auto"`.
- Ruta con kernels de bajo bit: si se dispone de un kernel INT4 W4A16 operativo, el peso se reduce a unos 16,55 GiB más activaciones y caché KV, un rango aproximado de 18 a 22 GB que encajaría en una RTX 4090 (24 GB), RTX 5090, L40S (48 GB) o A6000 (48 GB). Esta estimación es un cálculo derivado del tamaño de shard, no una medición publicada.
- Compatibilidad de kernels: no validada. El autor indica que no se ha verificado la compatibilidad con la serialización de AutoGPTQ, con el servicio en vLLM ni con kernels acelerados de bajo bit.
- Opciones de despliegue confirmadas: Transformers con `AutoModelForImageTextToText`, `trust_remote_code=True`, `dtype=torch.bfloat16`, `device_map="auto"` y `attn_implementation="sdpa"`. Entorno validado: Torch 2.7.0, Transformers 4.57.1, compressed-tensors 0.13.0 y Accelerate.
- Opciones no aplicables o no verificadas: no hay pesos GGUF, por lo que llama.cpp y Ollama quedan descartados con los artefactos publicados; TGI no se menciona en la documentación.
- Latencia y throughput: no disponibles; no se midieron en la validación.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad y estado |
|---|---|---|---|---|---|
| CompressedMichael/Qwen3-VL-30B-A3B-Instruct-GPTQ-INT4 | ~30B totales, ~3B activos | INT4 W4A16, group size 128, compressed-tensors | no disponible | Apache-2.0 | 0 descargas, 0 likes, sin benchmarks, validación solo funcional |
| Qwen/Qwen3-VL-30B-A3B-Instruct | ~30B totales, ~3B activos | BF16 | no disponible en esta ficha | Apache-2.0 | Modelo base de referencia; conserva la precisión original |
| Otras cuantizaciones del mismo modelo base (AWQ, GGUF, GPTQ alternativas) | no disponible | no disponible | no disponible | no disponible | No se localizaron referencias en la información proporcionada |

La única comparación con datos verificables es frente al modelo base: misma arquitectura, misma licencia y mismo pipeline, con la diferencia de que la versión BF16 conserva la precisión original mientras que esta derivada no ha medido su degradación.

## Limitaciones y advertencias

- Ausencia total de métricas de precisión: no se ha medido la exactitud en benchmarks ni la degradación respecto a los pesos BF16, por lo que el impacto real de la cuantización INT4 sobre la calidad de las respuestas es desconocido.
- Riesgo de alucinación no cuantificado: existe el riesgo habitual de los modelos generativos, agravado por una cuantización agresiva no evaluada; no hay datos que permitan acotarlo.
- Carga con código remoto: es obligatorio usar `trust_remote_code=True` y un fichero de modelado propio. Conviene auditar ese código antes de ejecutarlo en entornos con datos sensibles, ya que implica ejecutar lógica no incluida en la librería estándar.
- Memoria en ejecución superior a lo que sugiere el tamaño del fichero: la propia model card advierte que el tamaño del checkpoint no es una medida de la memoria de GPU necesaria, porque Transformers puede descomprimir a BF16 durante la carga.
- Cuantización parcial: visión, embeddings, puertas del router, normalizaciones y lm_head permanecen en BF16, de modo que el recorte de memoria es menor que el de una cuantización total y el perfil de precisión es mixto.
- Calibración de dominio estrecho: 128 pares imagen-descripción de Flickr30k, con un máximo de 256 tokens de imagen y 1024 tokens totales por ejemplo. No cubre conversaciones largas, múltiples imágenes ni documentos densos, y los idiomas de las descripciones de calibración no se especifican, con el sesgo que ello puede introducir hacia pies de foto cortos en la lengua del dataset.
- Idiomas soportados desconocidos: no hay información sobre cobertura multilingüe ni sobre calidad fuera del inglés.
- Servicio en producción no validado: no se ha verificado el funcionamiento con vLLM, AutoGPTQ ni kernels acelerados de bajo bit, lo que limita el despliegue a la ruta de Transformers documentada.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, sin validación independiente por parte de la comunidad.
- Licencia: Apache-2.0 permite uso comercial, pero se mantienen las obligaciones de atribución y las condiciones heredadas del modelo original de Qwen; hay que revisar `LICENSE` y `NOTICE` del repositorio antes de redistribuir.
- Fechas del repositorio: creado y actualizado el 13 de septiembre de 2026, con una vida útil de tres minutos entre ambos eventos, lo que sugiere una publicación sin mantenimiento posterior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CompressedMichael/Qwen3-VL-30B-A3B-Instruct-GPTQ-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- llm-compressor (herramienta de cuantización): https://github.com/vllm-project/llm-compressor
- Dataset de calibración Flickr30k: https://huggingface.co/datasets/lmms-lab/flickr30k
- Formato compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Búsqueda web realizada: no se han encontrado artículos, papers, blogs ni repositorios relevantes sobre este modelo; los resultados devueltos no guardan relación con el modelo y se descartan.
