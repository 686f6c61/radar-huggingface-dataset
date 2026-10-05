# pairmuse/marqo-fashionSigLIP

## Resumen

`pairmuse/marqo-fashionSigLIP` es un espejo (mirror) del checkpoint `Marqo/marqo-fashionSigLIP`, publicado por PairMuse con el objetivo de fijar los pesos a una revision concreta ya revisada por su equipo. El modelo original es obra de Marqo: un SigLIP ViT-B/16 afinado especificamente para recuperacion de moda y comercio electronico. Los pesos, la configuracion de open_clip, el preprocesador y el tokenizador son identicos a los del repositorio original, salvo dos archivos de codigo.

Tecnicamente es un modelo multimodal de tipo dual-encoder (arquitectura SigLIP) que proyecta imagenes y texto a un espacio vectorial compartido, con 203.155.968 parametros en total. No genera texto: su funcion es producir embeddings aptos para busqueda imagen-texto, clasificacion zero-shot de imagenes y recuperacion multimodal. Se distribuye en formato safetensors bajo licencia Apache-2.0 y con soporte para la libreria open_clip y transformers.

Su relevancia es practica: segun la model card, el afinado de Marqo mejora hasta un 57 % el MRR y el recall respecto a FashionCLIP en sus propios benchmarks, lo que lo convierte en una pieza util para sistemas de busqueda visual en catalogos de moda. Al ser un espejo, no incorpora mejoras ni mantenimiento propios, pero anade una ventaja de reproducibilidad: la revision upstream queda anclada a bytes concretos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP (dual-encoder vision-language, vision encoder ViT-B/16 mas encoder de texto) |
| Parametros totales | 203.155.968 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria open_clip) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura SigLIP, una variante de los modelos contrastivos imagen-texto en la que la perdida de entrenamiento es una sigmoide por pares en lugar del softmax sobre el lote completo. La parte visual es un Vision Transformer ViT-B/16 (parches de 16x16) y la parte textual es un encoder de texto que proyecta las cadenas a la misma dimension de embedding. El resultado es un espacio vectorial compartido en el que la similitud coseno entre un embedding de imagen y uno de texto actua como puntuacion de correspondencia, lo que habilita clasificacion zero-shot y recuperacion cruzada sin cabezas adicionales.

Marqo partio de un SigLIP preentrenado y lo afino para el dominio de moda y e-commerce, lo que explica la mejora de hasta un 57 % en MRR y recall frente a FashionCLIP reportada en la model card. La informacion proporcionada no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO; la model card remite al repositorio upstream para los detalles completos. En el lado del mirror, `pairmuse/marqo-fashionSigLIP` solo modifica dos archivos: `marqo_fashionSigLIP.py`, donde `MarqoFashionSigLIPConfig` declara `model_type = "siglip"` para evitar el aviso de discrepancia de tipo en cada carga con transformers, y `config.json`, donde `open_clip_model_name` apunta al propio mirror.

## Capacidades

- Clasificacion zero-shot de imagenes: asignar etiquetas textuales a imagenes sin entrenamiento especifico por clase.
- Recuperacion texto-imagen y imagen-texto en un espacio de embeddings compartido.
- Recuperacion imagen-imagen (similitud visual) mediante el encoder de vision.
- Busqueda por atributos de moda descritos en lenguaje natural (tipo de prenda, color, patron, estilo) gracias al afinado de dominio.
- Generacion de embeddings de imagen utilizables como sidecar en sistemas de indice vectorial.
- Integracion con la libreria open_clip y con transformers mediante codigo personalizado (`trust_remote_code`).
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Tool calling / function calling: no disponible, no es un modelo generativo.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades especiales: no incorpora modo de razonamiento (thinking), vision generativa ni audio.

## Casos de uso

- Busqueda visual en e-commerce: el usuario sube una foto de una prenda y el sistema recupera articulos similares del catalogo comparando embeddings de imagen, sin necesidad de etiquetas manuales ni de un clasificador por categoria.
- Clasificacion zero-shot de catalogo: asignar automaticamente categorias y atributos (camisetas, abrigos, estampados) comparando cada imagen con descripciones textuales, lo que permite incorporar nuevas taxonomias sin reentrenar.
- Etiquetado automatico de fichas de producto: generar tags y descripciones cortas a partir del embedding de imagen para poblar metadatos de un PIM o CMS de moda.
- Recomendacion del tipo "mas como esto": usar el encoder de vision para calcular vecinos cercanos en un indice vectorial (FAISS, Qdrant, Milvus) y alimentar un modulo de recomendacion.
- Deduplicacion y agrupacion de imagenes de producto: detectar variantes o duplicados del mismo articulo por similitud de embedding, util en catalogos grandes con multiples proveedores.
- Recuperacion multimodal en buscadores internos: permitir consultas cruzadas donde el texto describe un producto y el sistema devuelve imagenes relevantes, o al reves, integrando el modelo como sidecar de embeddings.
- Moderacion de contenido visual: puntuar la correspondencia entre una imagen y una descripcion declarada para detectar incoherencias en listados de terceros.
- Analisis de competencia y pricing: indexar catalogos de la competencia y recuperar productos equivalentes al propio catalogo para comparar precios.
- Enriquecimiento de datasets de vision: generar pseudo-etiquetas zero-shot sobre imagenes no anotadas para preentrenar modelos posteriores.

## Benchmarks y rendimiento

La informacion proporcionada unicamente incluye la siguiente afirmacion cualitativa de la model card, sin desglose numerico por dataset:

| Benchmark | Resultado |
|---|---|
| MRR y recall frente a FashionCLIP | hasta un 57 % mejor (segun la model card, sin desglose) |
| MMLU, HumanEval, GSM8K y similares | no aplica (modelo no generativo) |
| Detalle numerico por dataset | no disponible en la informacion proporcionada |

No se han publicado resultados de benchmarks detallados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 203 millones de parametros): aproximadamente 0,81 GB en FP32, 0,41 GB en FP16/BF16 y 0,20 GB en INT8, sin contar el overhead del runtime ni los embeddings indexados.
- El tamano del repositorio es de 1,6 GB, lo que sugiere que incluye copias de los pesos en mas de una precision.
- GPU recomendadas: cualquier GPU moderna con mas de 2 GB de VRAM es suficiente (RTX 3050, RTX 3060, RTX 4060, T4, L4). Para lotes grandes o pipelines de indexado masivo son preferibles A10, A100 o H100 por throughput agregado.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos anos, e incluso en iGPU con suficiente memoria compartida.
- Inferencia en CPU viable para cargas moderadas, dado el reducido numero de parametros.
- Opciones de despliegue: open_clip (libreria nativa del modelo), transformers con `trust_remote_code=True` por el codigo personalizado, exportacion a ONNX Runtime o TensorRT, y servicios tipo TorchServe o BentoML. No aplica vLLM ni TGI, que estan orientados a modelos generativos.
- Para recuperacion a escala se recomienda combinar el encoder con un indice vectorial (FAISS, Qdrant, Milvus, pgvector).
- Latencia y throughput concretos: no disponibles en la informacion proporcionada; dependen del hardware, del tamano de lote y de la resolucion de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pairmuse/marqo-fashionSigLIP | 203.155.968 | no disponible | Moda y e-commerce (SigLIP ViT-B/16 afinado) | Apache-2.0 | HuggingFace, libreria open_clip |
| Marqo/marqo-fashionSigLIP | no disponible | no disponible | Moda y e-commerce | Apache-2.0 | HuggingFace (upstream identico en pesos) |
| patrickjohncyh/fashion-clip | no disponible | no disponible | Moda (CLIP ViT-B/32 afinado) | no disponible | HuggingFace |
| openai/clip-vit-base-patch16 | no disponible | no disponible | Generico imagen-texto | no disponible | HuggingFace |
| google/siglip-base-patch16-224 | no disponible | no disponible | Generico imagen-texto | no disponible | HuggingFace |

El dato diferencial verificable es que este modelo es un clon byte a byte de los pesos de Marqo, por lo que su rendimiento es identico al del original; la comparacion de rendimiento frente a FashionCLIP se limita a la afirmacion del 57 % de mejora recogida en la model card. No se dispone de cifras comparativas adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto ni codigo; cualquier expectativa de chat, razonamiento o tool calling es inaplicable.
- Idioma: soporte declarado unicamente en ingles, lo que limita busquedas en castellano u otras lenguas sin traduccion previa.
- Longitud de contexto textual no documentada en la informacion disponible: conviene verificar el limite del tokenizador antes de enviar descripciones largas.
- Es un espejo y no un modelo mantenido por su autor original: las mejoras y correcciones se publicaran en el repositorio de Marqo, no en este.
- Requiere codigo personalizado (`marqo_fashionSigLIP.py`), por lo que hay que cargarlo con `trust_remote_code=True`; conviene auditar ese archivo en entornos de produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion de la comunidad.
- Al estar afinado en el dominio de moda, su comportamiento fuera de ese ambito puede degradarse frente a un CLIP o SigLIP generico.
- Riesgo de falsos positivos en recuperacion: similitudes de embedding altas no garantizan correspondencia semantica real; conviene fijar umbrales y evaluar con datos propios.
- Sesgos: no se documentan analisis de sesgo en la informacion proporcionada; al derivar de datos web, es previsible un sesgo hacia estilos, cuerpos y marcas predominantes en el material de entrenamiento.
- Licencia Apache-2.0, que permite uso comercial siempre que se conserven los avisos de copyright y licencia; respetar la atribucion a Marqo como autor original.
- Sin resultados de benchmarks detallados publicados en la informacion disponible, la decision de adopcion deberia basarse en una evaluacion propia sobre el catalogo objetivo.

## Enlaces

- Repositorio del mirror en HuggingFace: https://huggingface.co/pairmuse/marqo-fashionSigLIP
- Modelo upstream de Marqo: https://huggingface.co/Marqo/marqo-fashionSigLIP
- Revision upstream referenciada: `c56244cc94f92419e8369fa71efdaf403b124ce8`
- Repositorio de open_clip: https://github.com/mlfoundations/open_clip
- Paper de SigLIP (Sigmoid Loss for Language Image Pre-Training): https://arxiv.org/abs/2303.15343
- Modelo de referencia FashionCLIP: https://huggingface.co/patrickjohncyh/fashion-clip
- Paper de CLIP (referencia arquitectonica): https://arxiv.org/abs/2103.00020
