# 360ZhiNao/fg-clip-large

## Resumen

FG-CLIP (Fine-Grained Visual and Textual Alignment) es un modelo de alineamiento imagen-texto de grano fino desarrollado por el 360 AI Research Institute (Qihoo 360), publicado en el repositorio `360ZhiNao/fg-clip-large`. Resuelve el problema clasico de CLIP: la incapacidad de distinguir diferencias sutiles entre imagenes y descripciones muy parecidas. FG-CLIP introduce un entrenamiento en dos etapas que combina pares globales caption-imagen con captions a nivel de region, incluyendo descripciones positivas y negativas, para refinar la alineacion.

El modelo se presenta como un checkpoint de tipo CLIP integrado en la libreria `transformers` mediante codigo personalizado (`trust_remote_code=True`), con 428.914.944 parametros y un peso de repositorio de 1,7 GB en formato safetensors. Esta pensado para tareas de zero-shot image classification y retrieval imagen-texto, con soporte para captions cortos (77 tokens) y largos (248 tokens).

Su relevancia actual radica en que fue aceptado en ICML 2025 (paper arXiv:2505.05071) y propone una mejora medible en la granularidad de la representacion visual, algo critico en tareas de recuperacion y clasificacion donde las diferencias entre clases son minimas (por ejemplo, distinguir razas de animales o variantes de un producto).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (transformer dual imagen-texto) con alineamiento de grano fino en dos etapas |
| Parametros totales | 428.914.944 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 77 tokens para captions cortos; 248 tokens para captions largos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FG-CLIP sigue la arquitectura CLIP clasica de dos torres (encoder de imagen y encoder de texto) con proyeccion a un espacio comun, pero incorpora un esquema de entrenamiento en dos etapas. La primera etapa utiliza pares globales caption-imagen para lograr una alineacion inicial de grano fino. La segunda etapa anade captions a nivel de region: descripciones detalladas de regiones concretas y descripciones positivas/negativas de esas regiones, lo que fuerza al modelo a discriminar entre elementos visuales muy similares dentro de la misma imagen.

El modelo expone funciones especificas como `get_image_features`, `get_text_features` y `get_image_dense_features`, esta ultima devolviendo caracteristicas densas por parche que permiten visualizar mapas de similitud region-texto. El procesamiento de imagen usa un tamano de 336x336. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Clasificacion de imagenes zero-shot mediante comparacion de similitud coseno entre embeddings de imagen y texto.
- Retrieval imagen-texto bidireccional (busqueda de imagenes por descripcion y viceversa).
- Alineamiento de grano fino: distingue descripciones sutiles que CLIP estandar tiende a confundir.
- Soporte de captions cortos (hasta 77 tokens) y largos (hasta 248 tokens) mediante el flag `walk_short_pos`.
- Extraccion de caracteristicas densas por parche (`get_image_dense_features`) para localizacion y visualizacion de similitud region-texto.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento multi-paso.

## Casos de uso

- Clasificacion zero-shot de productos en catalogos de e-commerce: el modelo puede asignar categorias a imagenes nuevas comparandolas con descripciones textuales de cada categoria, util cuando las clases son visualmente parecidas (variantes de color, modelo o material).
- Busqueda visual en bibliotecas de imagenes: indexar embeddings de imagen y recuperar por descripcion textual en lenguaje natural, aprovechando la ventana de 248 tokens para descripciones detalladas.
- Moderacion de contenido visual: clasificar imagenes frente a descripciones de contenido permitido o prohibido sin entrenamiento especifico, gracias a la alineacion de grano fino.
- Etiquetado automatico de datasets de vision: generar o validar etiquetas comparando cada imagen con un conjunto de captions candidatos, reduciendo el trabajo manual en curaduria de datos.
- Localizacion visual debil (weak localization): usar `get_image_dense_features` para generar mapas de similitud que indiquen que regiones de la imagen corresponden a una descripcion, util en inspeccion industrial o analisis medico preliminar.
- Sistemas de recomendacion multimodal: calcular similitud entre la imagen de un producto y descripciones de preferencias del usuario para ordenar resultados.
- Investigacion en vision-lenguaje: servir como baseline o componente de alineacion en pipelines de investigacion que comparan metodos de grano fino frente a CLIP original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,7 GB solo para pesos, mas activaciones; en la practica se recomienda al menos 4-6 GB de VRAM.
- VRAM estimada en FP16/BF16: alrededor de 0,9-1 GB para pesos, con margen adicional para el procesamiento de imagenes a 336x336.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 6 GB o mas.
- Opciones de despliegue: al requerir `trust_remote_code=True`, la integracion con vLLM, TGI o llama.cpp no esta documentada; el uso previsto es via `transformers` en PyTorch. No se dispone de informacion sobre soporte en Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto texto | Idiomas | Licencia | Zero-shot classification |
|---|---|---|---|---|---|
| FG-CLIP large (este) | 428,9 M | 77 / 248 tokens | en | apache-2.0 | si |
| CLIP ViT-L/14 (OpenAI) | ~428 M | 77 tokens | en | MIT (pesos originales) | si |
| SigLIP (Google) | variable (base/large) | 64 tokens | en | Apache 2.0 (variantes) | si |
| EVA-CLIP | variable | 77 tokens | en | MIT/Apache segun variante | si |

FG-CLIP large comparte orden de magnitud de parametros con CLIP ViT-L/14, pero anade soporte de captions largos (248 tokens) y caracteristicas densas por parche. No se dispone de datos de benchmark comparativos en la informacion proporcionada para cuantificar la mejora frente a CLIP o SigLIP.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta documentado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene auditar el codigo antes de usarlo en produccion.
- La model card advierte que ciertos datasets y checkpoints utilizados pueden estar sujetos a licencias originales distintas de Apache 2.0; es necesario verificar el cumplimiento antes de uso comercial.
- Riesgo de alucinacion en la asignacion de similitudes: al ser un modelo de alineamiento, puede producir puntuaciones altas para pares incorrectos cuando las descripciones son ambiguas.
- Sesgos inheritos de los datos de entrenamiento no documentados en la informacion disponible.
- La longitud de contexto de texto esta limitada a 77 o 248 tokens segun el modo; descripciones mas largas requieren truncado.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-13; la madurez y soporte de la comunidad no estan contrastados.
- No hay informacion publicada sobre cuantizaciones oficiales ni soporte en runtimes de inferencia de alto rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/fg-clip-large
- Paper arXiv: https://arxiv.org/abs/2505.05071
- Repositorio GitHub: https://github.com/360CVGroup/FG-CLIP
- ICML 2025: https://icml.cc/Conferences/2025
- Referencia en Baidu Baike: https://baike.baidu.com/en/item/FG-CLIP/7349541
