# immanuelpeter/DeepSeek-ViT

## Resumen

DeepSeek-ViT es un repositorio publicado por el usuario immanuelpeter que extrae el torre de visión (vision tower) y el proyector MLP de dos capas del modelo multimodal DeepSeek-V4.1-Flash, desarrollado originalmente por DeepSeek. No se trata de un modelo entrenado desde cero, sino de un empaquetado de pesos ya existentes: el script de exportación lee los tensores `vision.*` y `aligner.*` del shard 1 del checkpoint padre, elimina los prefijos y escribe los tensores originales en BF16. El resultado es un codificador de imágenes independiente de 411.842.560 parámetros que produce características visuales y las proyecta al espacio de 5120 dimensiones del modelo base.

La relevancia de este paquete es práctica: permite reutilizar el codificador visual de un modelo multimodal grande sin cargar el modelo de lenguaje completo, algo útil para indexación de imágenes, búsqueda visual y pipelines de extracción de características. La arquitectura del torre consta de 32 capas con dimensión oculta 1024, 16 cabezas de atención, dimensión intermedia 2816, parches de 14 píxeles y 2D-RoPE, con una etapa de compresión de tokens mediante `unfold` 3x3 y pixel-unshuffle. El aligner es un MLP de `Linear(9216, 5120)`, GELU y `Linear(5120, 5120)`, ambos con bias.

El repositorio se publica bajo licencia MIT, la misma del modelo fuente, y está etiquetado como `image-feature-extraction`. Es importante señalar que no incluye ficheros de modelado de Transformers ni configuración de preprocesador, por lo que `AutoModel.from_pretrained` no funciona: la carga debe hacerse con el `vision.py` incluido en el propio repositorio. A fecha de la información disponible acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con 2D-RoPE y compresion de tokens 3x3; aligner MLP de dos capas |
| Parametros totales | 411.842.560 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; es un codificador de vision, no define ventana de contexto textual. Resolucion maxima soportada: no disponible |
| Tipos de cuantizacion | No disponible; los pesos distribuidos estan en BF16 |
| Idiomas soportados | No aplica (modelo de vision). No disponible en la informacion del repositorio |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |
| Componentes | Torre: 32 capas, hidden 1024, 16 cabezas, intermedio 2816, patch 14, 2D-RoPE. Aligner: `Linear(9216, 5120)` + GELU + `Linear(5120, 5120)`, con bias |
| Compresion de tokens | Unfold 3x3 / pixel-unshuffle con padding |
| Numero de tensores | 259 en `model.safetensors` (torre) + 4 en `projector.safetensors` (aligner) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash |
| Tamano del repositorio | 1,0 GB |
| Libreria declarada | transformers (etiqueta), aunque no incluye ficheros de modelado de Transformers |
| Pipeline declarado | image-feature-extraction |

## Arquitectura y entrenamiento

El modelo es un extracto del torre de visión de DeepSeek-V4.1-Flash. La torre sigue el esquema clasico de Vision Transformer: la imagen se divide en parches de 14x14 y se procesa a traves de 32 capas con 16 cabezas de atencion, dimension oculta 1024 y dimension intermedia 2816. La codificacion posicional utiliza 2D-RoPE. Antes de entrar en el transformer se aplica una etapa de compresion de tokens basada en `unfold` 3x3 y pixel-unshuffle con padding, que reduce el numero de tokens efectivos agrupando bloques de 3x3 parches.

La salida de la torre se proyecta mediante un aligner de dos capas: `Linear(9216, 5120)` con GELU y `Linear(5120, 5120)`, ambos con bias. La dimension de entrada 9216 corresponde exactamente a 1024 canales x 3 x 3, coherente con la compresion espacial 3x3. La dimension de salida 5120 es la del espacio del modelo de lenguaje padre, lo que permite que las caracteristicas visuales se inyecten directamente en DeepSeek-V4.1-Flash. El modelo esta descrito en el articulo "DeepSeek-V4.1-Flash: Pushing the Limits of KV Cache Compression".

No hay informacion disponible en el repositorio sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos, ni sobre si hubo fases de RLHF o DPO: este paquete es una extraccion de pesos, no un entrenamiento nuevo. La unica validacion documentada es un script de paridad que compara los 259 tensores de la torre y los 4 del aligner con el checkpoint padre fijado, usando `torch.equal`, es decir, una comprobacion de igualdad bit a bit.

## Capacidades

- Extraccion de caracteristicas de imagen: genera representaciones vectoriales a partir de imagenes de entrada, con dos salidas posibles segun se use la torre o el aligner.
- Proyeccion al espacio de embeddings del modelo padre: el aligner lleva la salida a 5120 dimensiones, el espacio de DeepSeek-V4.1-Flash.
- Compresion espacial de tokens: la etapa de unfold 3x3 reduce el coste computacional de la atencion sobre imagenes de alta resolucion.
- Extraccion de caracteristicas sin generacion: el pipeline declarado es `image-feature-extraction`; no genera texto ni respuestas.
- Carga standalone: `vision.py` implementa la torre y el aligner de forma independiente, sin depender de los ficheros de modelado de Transformers.
- Verificacion de integridad: el script de paridad permite comprobar la equivalencia exacta con los pesos del checkpoint original.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingues ni de comprension de texto.
- No se documentan modos especiales (thinking mode, audio, video).

## Casos de uso

- Recuperacion de imagenes por similitud: extraer el embedding de 5120 dimensiones de cada imagen del corpus, indexarlo en una base vectorial y resolver consultas por vecino mas cercano. El aligner es adecuado porque situa las imagenes en el mismo espacio que el LLM padre.
- Busqueda multimodal en un RAG visual: usar las caracteristicas del aligner como entrada para DeepSeek-V4.1-Flash, de modo que el modelo de lenguaje pueda razonar sobre imagenes sin necesidad de cargar un pipeline multimodal completo en cada consulta.
- Clasificacion con linear probing: congelar la torre y entrenar unicamente una cabeza lineal sobre las caracteristicas de 5120 dimensiones para tareas de clasificacion especificas, con un coste de entrenamiento muy bajo.
- Curacion y deduplicacion de datasets: calcular embeddings de un corpus de imagenes y agruparlas por similitud para detectar duplicados o near-duplicates antes de entrenar otros modelos.
- Sistemas de recomendacion visual: representar catalogo y consulta en el mismo espacio de embeddings para recuperar productos visualmente similares, usando el aligner como extractor unico.
- Moderacion y filtrado de contenido: entrenar clasificadores ligeros sobre las caracteristicas extraidas para etiquetar imagenes potencialmente problematicas en un pipeline de ingesta.
- Preprocesado para captioning o VQA: servir como codificador visual congelado delante de un decodificador de texto, reduciendo el coste de entrenamiento al no tener que ajustar la torre completa.
- Analisis de imagenes en dominios verticales (industrial, medico, satelital): ajuste fino de una cabeza de clasificacion o segmentacion sobre las caracteristicas precalculadas, aprovechando que la torre se puede ejecutar en hardware de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio unicamente documenta un test de paridad que verifica, mediante `torch.equal`, que los 259 tensores de la torre y los 4 del aligner coinciden con los del checkpoint padre `deepseek-ai/DeepSeek-V4.1-Flash`. Se trata de una validacion de integridad de la exportacion, no de una evaluacion de calidad en tareas de vision.

## Requisitos de hardware

- VRAM estimada para inferencia: los 411.842.560 parametros en BF16 ocupan aproximadamente 0,77 GiB (824 MB) de pesos. Con activaciones y lotes pequenos, el consumo realista se situa en torno a 1,5-2,5 GB.
- Al no ser un modelo autoregresivo, no mantiene cache KV: la memoria es practicamente constante respecto a la longitud de la secuencia, y escala sobre todo con la resolucion de imagen y el tamano de lote.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para inferencia en BF16. Una RTX 3060 de 12 GB, una RTX 4070, una RTX 4090, una A100 o una H100 son mas que suficientes; las GPU de gama alta se justifican para procesar grandes volumenes en paralelo o para ajuste fino.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas, y tambien en CPU para inferencia en lote no interactiva.
- Opciones de despliegue: no es compatible directamente con vLLM, TGI u Ollama, porque el repositorio no incluye ficheros de modelado de Transformers ni configuracion de preprocesador, y `AutoModel.from_pretrained` falla. El despliegue debe hacerse con PyTorch cargando `vision.py` y los ficheros safetensors, o exportando manualmente a ONNX o TorchScript.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa se establece con torres de vision de proposito general ampliamente utilizadas como extractores de caracteristicas. Los valores de los modelos alternativos son cifras publicas aproximadas de su documentacion oficial y pueden variar segun la variante concreta.

| Modelo | Parametros | Patch | Dimension de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-ViT (este) | 411,8 M | 14 | 5120 (via aligner) | MIT | HuggingFace, safetensors, carga manual |
| CLIP ViT-L/14 | ~304 M | 14 | 768 | MIT (variantes) | HuggingFace, transformers, amplio ecosistema |
| SigLIP So400m/14 | ~400 M | 14 | no disponible | Apache 2.0 / MIT segun variante | HuggingFace, transformers |
| DINOv2 ViT-L/14 | ~300 M | 14 | 1024 | Apache 2.0 | HuggingFace, transformers, ampliamente evaluado |

Diferencias clave: DeepSeek-ViT es el unico de la lista cuyo aligner proyecta directamente al espacio de un LLM concreto (5120 dimensiones de DeepSeek-V4.1-Flash), lo que lo hace idoneo para pipelines multimodales con ese modelo pero poco versatil fuera de el. En contraste, CLIP, SigLIP y DINOv2 se cargan con `transformers` de forma estandar, cuentan con preprocesadores incluidos, disponen de resultados publicos en decenas de benchmarks y estan integrados en el ecosistema (vLLM, TGI, ONNX). Para un proyecto nuevo que no dependa de DeepSeek-V4.1-Flash, esas alternativas ofrecen menor friccion de integracion.

## Limitaciones y advertencias

- No es un modelo generativo de texto: solo produce caracteristicas visuales. Cualquier tarea de lenguaje requiere un modelo adicional.
- Incompatibilidad con la API estandar: el repositorio no incluye ficheros de modelado de Transformers ni configuracion de preprocesador. `AutoModel.from_pretrained` no funciona y es necesario usar el `vision.py` incluido. Esto rompe la mayoria de pipelines automatizados.
- Ausencia total de benchmarks publicos: no hay datos de calidad en tareas de clasificacion, recuperacion o segmentacion, lo que impide comparar su rendimiento real con alternativas consolidadas.
- Sesgos: no disponible. El autor no documenta la composicion del dataset de entrenamiento del modelo padre, por lo que se desconocen los sesgos de representacion.
- Riesgo de alucinacion: no aplica en el sentido textual, al no generar lenguaje. Si se combina con el LLM padre, el riesgo de alucinacion recae en el modelo de lenguaje, no en la torre de vision.
- Dependencia del espacio de embeddings del modelo padre: la salida de 5120 dimensiones solo es directamente util si se empareja con DeepSeek-V4.1-Flash. Para otros usos hay que trabajar con la salida de la torre antes del aligner.
- Resolucion de entrada y limites de contexto visual: no documentados. Se desconoce el comportamiento con imagenes de resoluciones extremas o relaciones de aspecto inusuales.
- Adopcion nula: 0 descargas y 0 likes en el momento de la informacion disponible, por lo que no existe validacion independiente por parte de la comunidad mas alla del script de paridad del autor.
- Licencia: MIT, permite uso comercial, modificacion y redistribucion con atribucion. Se recomienda verificar la licencia del modelo fuente DeepSeek-V4.1-Flash, ya que el autor afirma que es la misma.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (2026-09-17) y la referencia al articulo del modelo base requieren verificacion por parte del usuario antes de integrarlo en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/immanuelpeter/DeepSeek-ViT
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Articulo del modelo base: https://www.alphaxiv.org/abs/2609.deepseek-v4-1-flash
- Script de paridad: https://github.com/immanuel-peter/vision-tower-bench/blob/main/tests/test_parity.py
- Script de exportacion: https://github.com/immanuel-peter/vision-tower-bench/blob/main/scripts/export_deepseek_v41_vision.py
- Ejemplo de inferencia: `examples/inference.py` (incluido en el repositorio de HuggingFace)
- Implementacion de la torre y el aligner: `vision.py` (incluido en el repositorio de HuggingFace)
- Nota: los resultados de la busqueda web realizada no contienen enlaces relevantes sobre este modelo; devuelven unicamente paginas generales de YouTube.
