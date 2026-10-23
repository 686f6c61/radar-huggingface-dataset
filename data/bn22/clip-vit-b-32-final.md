# bn22/CLIP-ViT-B-32-FINAL

## Resumen

`bn22/CLIP-ViT-B-32-FINAL` es un checkpoint de CLIP publicado en HuggingFace por el usuario `bn22`, etiquetado para la tarea `zero-shot-image-classification` y compatible con la librería `transformers`. Por el nombre y el tag `arxiv:1910.09700`, se corresponde con la arquitectura CLIP (Contrastive Language-Image Pre-training) de OpenAI en su variante ViT-B/32: dos torres transformer, una visión ViT-B con parches de 32x32 y una torre de texto, entrenadas de forma contrastiva para alinear imágenes y descripciones textuales en un espacio embedding comun. El checkpoint declara 153.639.680 parametros reales en safetensors y un repositorio de 1,2 GB.

El interes practico del modelo esta en su tamano reducido y su capacidad de clasificacion zero-shot: permite etiquetar imagenes contra un vocabulario abierto definido en tiempo de inferencia, sin reentrenamiento, lo que lo hace util para prototipado rapido, filtrado de datasets y busqueda semantica multimodal. Al ser la variante B/32, es la mas ligera de la familia CLIP basada en ViT, lo que abarata el despliegue en GPU de consumo e incluso en CPU.

Ahora bien, la model card es la plantilla autogenerada de HuggingFace y no aporta ningun dato: no documenta el proceso de fine-tuning, el dataset utilizado, la licencia ni los idiomas. El sufijo `FINAL` sugiere un ajuste fino propio del autor sobre el CLIP original, pero no hay informacion que lo confirme ni que permita evaluar en que se diferencia del checkpoint de OpenAI. Cualquier uso en produccion deberia tratar este repositorio como no verificado (0 descargas y 0 likes en el momento de la ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos torres: vision transformer ViT-B/32 + codificador de texto (base CLIP, arXiv:1910.09700) |
| Parametros totales | 153.639.680 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens en el codificador de texto (limite estandar de CLIP); no documentado en la model card |
| Resolucion de imagen | 224x224 px con parches de 32x32 (49 parches por imagen), segun la arquitectura ViT-B/32 |
| Tipos de cuantizacion | no disponible en el repositorio; al ser un modelo de ~154 M de parametros admite FP32, FP16/BF16 e INT8 en transformers/ONNX |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 1,2 GB) |
| Pipeline | zero-shot-image-classification |
| Libreria | transformers |
| Fecha de creacion | 2026-10-22 (ultima actualizacion 2026-10-22) |

## Arquitectura y entrenamiento

La arquitectura es la de CLIP ViT-B/32 descrita en «Learning Transferable Visual Models From Natural Language Supervision» (Radford et al., 2021). Consta de una torre de vision (ViT-Base con patch size 32, embedding de 768 dimensiones y 12 capas) y una torre de texto (transformer de 12 capas y 512 dimensiones) con una proyeccion lineal a un espacio comun. El entrenamiento original es contrastivo: para cada batch de pares imagen-texto se maximiza la similitud coseno de los pares correctos y se minimiza la de los incorrectos (objetivo InfoNCE simetrico), de modo que el modelo aprende a puntuar la compatibilidad entre una imagen y una frase sin necesidad de clases predefinidas. La inferencia zero-shot consiste en construir prompts del tipo «a photo of a {clase}» para cada etiqueta candidata y elegir el embedding de texto mas proximo al de la imagen.

Del proceso de entrenamiento de este checkpoint concreto no hay informacion: la model card no indica dataset, numero de tokens, epochs, hiperparametros, si hubo ajuste fino supervisado, RLHF/DPO (no aplicable a un modelo discriminativo de este tipo) ni infraestructura de computo. El nombre del repositorio apunta a un fine-tuning del autor sobre CLIP ViT-B/32, pero se desconoce sobre que datos y con que objetivo, por lo que no se puede asumir que reproduzca el comportamiento del checkpoint original de OpenAI.

## Capacidades

- Clasificacion de imagenes zero-shot contra un vocabulario abierto de etiquetas definido en tiempo de inferencia.
- Calculo de embeddings conjuntos imagen-texto, utiles para busqueda y recuperacion multimodal.
- Similitud imagen-texto y ranking de descripciones candidatas para una imagen.
- Prompt ensembling (varias plantillas por clase) para estabilizar las predicciones.
- Uso como extractor de caracteristicas congelado para entrenar un clasificador lineal (linear probing) sobre los embeddings.
- Filtrado y anotacion automatica de datasets de imagenes.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: no es un modelo generativo.
- Capacidades multilingues: no documentadas; el CLIP original esta entrenado mayoritariamente con pares imagen-texto en ingles.
- No tiene modo thinking, vision generativa, audio ni salida de texto libre.

## Casos de uso

- Etiquetado automatico de catalogos de imagenes: definir las categorias como prompts de texto y clasificar lotes de imagenes sin entrenar un clasificador especifico, aprovechando que el modelo solo necesita una pasada por imagen.
- Busqueda visual en una base de imagenes: precalcular embeddings de imagen y de las consultas de texto para recuperar las mas similares mediante busqueda vectorial (FAISS, pgvector), con un coste de indexado bajo gracias a los 153,6 M de parametros.
- Curacion de datasets: descartar imagenes que no casan con la descripcion esperada comparando la similitud con prompts como «a blurry photo» o «a screenshot», antes de usarlas en el entrenamiento de otro modelo.
- Moderacion y triaje de contenido: puntuar imagenes contra un conjunto de etiquetas de riesgo como primera etapa de un pipeline, derivando los casos dudosos a revision humana.
- Prototipado rapido de producto: validar en horas si una taxonomia de clases es separable con un modelo zero-shot antes de invertir en anotacion y entrenamiento supervisado.
- Clasificacion en el borde (edge) o en CPU: al ocupar menos de 1 GB en FP16, puede ejecutarse en dispositivos sin GPU dedicada para tareas de filtrado en local.
- Investigacion en representaciones multimodales: servir de linea base congelada para comparar tecnicas de adaptacion (prompt tuning, adapters, clasificadores lineales).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion ni metricas, y el repositorio no aporta resultados de ImageNet zero-shot, retrieval (Flickr30k, COCO) ni de ningun otro conjunto. Tampoco hay datos que permitan verificar si el ajuste fino del autor mejora o degrada las cifras del CLIP ViT-B/32 original.

| Benchmark | Resultado de este checkpoint |
|---|---|
| ImageNet zero-shot top-1 | no disponible |
| ImageNet zero-shot top-5 | no disponible |
| Retrieval imagen-texto (COCO/Flickr30k) | no disponible |
| Linear probing sobre embeddings | no disponible |

## Requisitos de hardware

- Pesos en FP32: aproximadamente 615 MB; en FP16/BF16: aproximadamente 307 MB; en INT8: aproximadamente 154 MB (calculado a partir de los 153,6 M de parametros).
- VRAM estimada para inferencia: menos de 1 GB en FP16 con batch pequeno, y del orden de 1-2 GB incluyendo activaciones y buffers si se procesan lotes grandes de imagenes a 224x224.
- Cabe en cualquier GPU de consumo: GTX 1650, RTX 3060, RTX 4090, asi como en GPUs integradas y en CPU para inferencia por lotes.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir muchos lotes por segundo; para uso individual basta una RTX 3060 o superior.
- Opciones de despliegue: `transformers` con el pipeline `zero-shot-image-classification`, exportacion a ONNX Runtime (incluida cuantizacion INT8), TorchScript, y servidores de inferencia genericos como Triton o TorchServe. No se ha publicado una conversion a GGUF ni soporte especifico en Ollama o llama.cpp, que estan orientados a modelos generativos.
- Latencia y throughput: no hay medidas publicadas para este checkpoint. Cualitativamente, el coste dominante es una unica pasada del ViT sobre 49 parches por imagen mas una pasada corta del codificador de texto por cada prompt, lo que permite procesar lotes en tiempo real en GPU moderna.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus fichas publicas y son aproximados; no se han verificado contra este repositorio.

| Modelo | Parametros | Contexto de texto | Licencia | Notas |
|---|---|---|---|---|
| bn22/CLIP-ViT-B-32-FINAL | 153,6 M | 77 tokens | no disponible | Sin model card, sin benchmarks, sin validacion de la comunidad |
| openai/clip-vit-base-patch32 | ≈151 M | 77 tokens | MIT | Checkpoint de referencia de la arquitectura; documentado y ampliamente evaluado |
| openai/clip-vit-base-patch16 | ≈150 M | 77 tokens | MIT | Mismo coste de parametros, mejor rendimiento en tareas de detalle al usar parches de 16x16 |
| openai/clip-vit-large-patch14 | ≈428 M | 77 tokens | MIT | Mayor calidad zero-shot a cambio de mas VRAM y latencia |
| google/siglip-base-patch16-224 | ≈203 M | 64 tokens | Apache 2.0 | Alternativa con perdida sigmoide, buen rendimiento zero-shot y licencia permisiva explicita |

Frente al checkpoint original de OpenAI, la ventaja potencial de este repositorio seria un ajuste fino orientado a un dominio concreto, pero al no estar documentado no puede considerarse una mejora demostrada; la desventaja clara es la ausencia de licencia declarada y de cualquier evaluacion publica.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos no se puede asumir uso comercial; hay que contactar con el autor o tratar el modelo como no licenciado para produccion.
- Model card vacia: se desconoce el dataset de ajuste fino, el regimen de entrenamiento y las intenciones del autor, lo que impide auditar sesgos o fuga de datos.
- Sesgos inhererentes al preentrenamiento de CLIP: los pares imagen-texto extraidos de la web reproducen estereotipos de genero, raza y profesion; las predicciones pueden amplificarlos en tareas de personas o contextos culturales.
- Alucinacion en sentido estricto no aplica (no genera texto), pero si produce asignaciones erroneas con alta confianza cuando ninguna etiqueta describe la imagen: conviene calibrar umbrales y incluir una clase de rechazo.
- Sensibilidad al prompt: el rendimiento varia de forma notable segun la redaccion de las etiquetas y el idioma; el modelo original esta optimizado para ingles y no hay evidencia de buen comportamiento en castellano.
- Limitaciones de contexto: 77 tokens para el texto y una unica imagen de 224x224 por pasada limitan descripciones largas y el analisis de detalles finos.
- Punto debil conocido de CLIP: conteo de objetos, relaciones espaciales, texto en imagen (OCR) y clasificacion fine-grained (razas de animales, modelos de coche) rinden por debajo de un modelo supervisado especifico.
- Repositorio sin traccion (0 descargas, 0 likes) y con fecha de creacion reciente: no hay evidencia de terceros de que los pesos carguen correctamente ni de que el pipeline funcione como se espera; validar antes de integrar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bn22/CLIP-ViT-B-32-FINAL
- Paper de la arquitectura CLIP (tag `arxiv:1910.09700`): https://arxiv.org/abs/1910.09700
- Repositorio oficial de OpenAI CLIP: https://github.com/openai/CLIP
- Implementacion OpenCLIP (alternativa para cargar pesos CLIP): https://github.com/mlfoundations/open_clip
- Checkpoint de referencia de la misma arquitectura: https://huggingface.co/openai/clip-vit-base-patch32
