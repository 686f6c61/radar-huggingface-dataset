# minhnguyent546/ViCLIP-OT

## Resumen

ViCLIP-OT es un modelo de vision-lenguaje de doble codificador (dual-encoder) desarrollado por minhnguyent546, disenado especificamente para la recuperacion imagen-texto en vietnamita. Con 221 millones de parametros, combina un codificador de texto basado en Vietnamese-SBERT (135M) con un codificador de imagen ViT-B/16 preentrenado con DINOv3 (86M), ambos proyectando a un espacio compartido de 768 dimensiones. El modelo se presenta como el primer modelo fundacional vision-lenguaje especifico para recuperacion imagen-texto en vietnamita.

La innovacion principal es la funcion de perdida SIGROT (Similarity-Graph Regularized Optimal Transport), que se combina con el aprendizaje contrastivo clasico de estilo CLIP. Esta perdida busca mejorar la alineacion entre modalidades y reducir la brecha entre imagen y texto, un problema conocido en modelos CLIP multilingues cuando se aplican a idiomas de bajos recursos como el vietnamita.

El modelo es relevante para la comunidad de procesamiento de lenguaje natural y vision en vietnamita, un idioma con relativamente pocos recursos multimodales comparado con el ingles. Se distribuye bajo licencia GPL-3.0 y esta disponible en Hugging Face con la libreria transformers, requiriendo `trust_remote_code=True` para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Doble codificador (dual-encoder) vision-lenguaje: ViT-B/16 (imagen) + transformer de texto SBERT |
| Parametros totales | 221.229.312 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (maximo del codificador de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 768 (comun para imagen y texto) |
| Entrada de imagen | 224 x 224 pixeles |
| Codificador de texto | keepitreal/vietnamese-sbert (135M) |
| Codificador de imagen | timm/vit_base_patch16_dinov3.lvd1689m (86M) |
| Pooling | Mean pooling (texto), global average pooling (imagen) |

## Arquitectura y entrenamiento

ViCLIP-OT sigue una arquitectura de doble codificador: el texto pasa por un transformer SBERT especifico para vietnamita (135M parametros, salida de 768 dimensiones mediante mean pooling sobre un maximo de 256 tokens) y la imagen por un ViT-B/16 con backbone DINOv3 (86M parametros, entrada 224x224, salida de 768 dimensiones mediante global average pooling). Ambos embeddings se normalizan y se comparan mediante similitud coseno en un espacio compartido.

El entrenamiento combina dos objetivos: una perdida contrastiva de estilo CLIP (que acerca pares imagen-texto correctos y aleja los incorrectos dentro del batch) y la perdida SIGROT (Similarity-Graph Regularized Optimal Transport), que incorpora transporte optimo regularizado por un grafo de similitud. Esta segunda perdida busca modelar de forma mas estructurada la correspondencia entre modalidades, mitigando la brecha entre imagen y texto. El modelo cuenta con una variante hermana, ViSigLIP-OT, que sustituye la perdida contrastiva CLIP por SigLIP manteniendo SIGROT y el mismo tamano de 221M parametros. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Extraccion de embeddings multimodales: codifica texto en vietnamita e imagenes en un espacio vectorial compartido de 768 dimensiones.
- Recuperacion imagen-texto bidireccional: busqueda texto-a-imagen e imagen-a-texto mediante similitud coseno.
- Recuperacion imagen-imagen: al compartir espacio de embedding, permite busqueda de imagenes visualmente similares.
- Busqueda semantica cross-modal en vietnamita: indexacion y recuperacion de contenido visual a partir de consultas en lenguaje natural.
- Generalizacion zero-shot: el autor declara un rendimiento solido en evaluacion zero-shot sobre benchmarks de recuperacion imagen-texto en vietnamita.
- Extraccion de caracteristicas para tareas downstream: utilizable como backbone congelado para VQA, clasificacion de imagenes u otras tareas vision-lenguaje en vietnamita.
- Integracion con sentence-transformers: compatible con la API de sentence-transformers ademas de transformers.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo de embedding, no un modelo generativo.

## Casos de uso

- Busqueda visual en vietnamita: indexar un catalogo de imagenes (productos, inmuebles, documentos escaneados) con embeddings del codificador de imagen y permitir consultas en vietnamita que devuelvan las imagenes mas relevantes por similitud coseno.
- Moderacion y organizacion de contenido multimedia: clasificar y agrupar automaticamente imagenes por descripcion textual en vietnamita, por ejemplo para etiquetar contenido subido por usuarios en una plataforma.
- Recuperacion en sistemas de comercio electronico: dado un texto descriptivo en vietnamita ("ao dai lua do"), recuperar imagenes de productos del catalogo, aprovechando el espacio compartido para busqueda sin necesidad de metadatos estructurados.
- Accesibilidad: generar descripciones alternativas o emparejar imagenes con textos existentes para personas con discapacidad visual en aplicaciones en vietnamita, usando el modelo como componente de recuperacion o verificacion.
- Construccion de datasets multimodales: filtrar y emparejar pares imagen-texto en vietnamita por similitud semantica para curar corpus de entrenamiento de otros modelos.
- Backbone para tareas downstream: usar los embeddings congelados como entrada de un clasificador ligero para VQA o clasificacion de imagenes en vietnamita, reduciendo el coste de entrenamiento frente a un modelo generativo.
- Deduplicacion y near-duplicate detection de imagenes: agrupar imagenes visualmente similares mediante los embeddings del codificador de imagen para limpiar repositorios o detectar reutilizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El autor afirma en la model card que el modelo alcanza un rendimiento state-of-the-art en benchmarks de recuperacion imagen-texto en vietnamita con buena generalizacion zero-shot, pero no se proporcionan cifras concretas (R@1, R@5, R@10, etc.) ni los nombres de los datasets de evaluacion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 221M parametros en fp32, aproximadamente 0,9 GB de pesos; en fp16, unos 0,45 GB. La VRAM real necesaria depende del tamano de batch y de las imagenes procesadas.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en fp16 con batches moderados. Una RTX 3060, RTX 4060 o superior funciona sin problema.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1660, RTX 2060 en adelante) e incluso en CPU para volumenes pequenos.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), sentence-transformers. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos y no a este tipo de encoder.
- Latencia y throughput: no disponible. Al ser un encoder de 221M, se espera un throughput alto en GPU, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto texto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| ViCLIP-OT | 221M | 256 tokens | Vietnamita | GPL-3.0 | CLIP + SIGROT, doble encoder |
| ViSigLIP-OT | 221M | 256 tokens | Vietnamita | no disponible | SigLIP + SIGROT, doble encoder |
| CLIP original (OpenAI) | ~150M (ViT-B/32) | 77 tokens | Ingles | MIT | Contrastivo CLIP |
| Vietnamese-SBERT | 135M | 256 tokens | Vietnamita | no disponible | Solo texto, SBERT |

ViCLIP-OT se distingue de CLIP original por su especializacion en vietnamita y su perdida SIGROT, y de Vietnamese-SBERT por incorporar la modalidad visual. La variante ViSigLIP-OT es la alternativa directa del mismo autor con distinta perdida contrastiva. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo vietnamita: el codificador de texto esta entrenado para vietnamita; el rendimiento en otros idiomas no esta garantizado y probablemente sea deficiente.
- No es un modelo generativo: no produce texto ni respuestas; solo genera embeddings. No debe usarse para tareas de generacion, razonamiento o dialogo.
- Ventana de texto limitada: maximo de 256 tokens, lo que restringe descripciones largas o documentos extensos.
- Resolucion de imagen fija: 224x224 pixeles; detalles finos en imagenes de alta resolucion pueden perderse.
- Riesgo de sesgo: al entrenarse con datos no detallados en la informacion disponible, puede heredar sesgos de genero, etnia o contexto cultural presentes en los corpus de imagen-texto.
- Licencia GPL-3.0: es una licencia copyleft fuerte; el uso comercial es posible pero impone obligaciones de distribucion del codigo derivado bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Requiere `trust_remote_code=True`: implica ejecutar codigo personalizado del repositorio, lo que anade un riesgo de seguridad que conviene auditar antes de desplegar en produccion.
- Madurez limitada: 44 descargas y 3 likes en el momento de la ficha; comunidad pequena y poca validacion externa independiente.
- Sin cuantizaciones publicadas: no se ofrecen versiones GGUF u ONNX en la informacion disponible, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minhnguyent546/ViCLIP-OT
- Variante ViSigLIP-OT: https://huggingface.co/minhnguyent546/ViSigLIP-OT
- Coleccion en Hugging Face: https://huggingface.co/collections/minhnguyent546/viclip-ot
- Repositorio GitHub: https://github.com/minhnguyent546/ViCLIP-OT
- Paper en arXiv: https://arxiv.org/abs/2602.22678
- DOI: https://doi.org/10.1007/s00138-026-01956-0
- Modelo base de texto (Vietnamese-SBERT): https://huggingface.co/keepitreal/vietnamese-sbert
- Modelo base de imagen (DINOv3 ViT-B/16): https://huggingface.co/timm/vit_base_patch16_dinov3.lvd1689m
