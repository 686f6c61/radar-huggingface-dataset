# 360ZhiNao/fg-clip2-large

## Resumen

FG-CLIP 2 Large es un modelo de alineación visión-lenguaje bilingüe (inglés y chino) desarrollado por 360 ZhiNao (Qihoo 360), orientado a la comprensión y el emparejamiento fino entre imágenes y texto. Se distribuye bajo el identificador `360ZhiNao/fg-clip2-large` y forma parte de la familia FG-CLIP 2, cuya base y variantes se publican en la colección oficial del autor. El modelo resuelve tareas de clasificación de imágenes zero-shot, retrieval imagen-texto y texto-imagen, y otras tareas de alineación multimodal, con un énfasis explícito en el detalle fino (atributos, objetos pequeños, relaciones espaciales) que los CLIP convencionales suelen perder.

La arquitectura es de tipo CLIP con codificadores separados de imagen y texto, empaquetada como `fgclip2` con código personalizado (`trust_remote_code=True`) y cargada mediante `AutoModelForCausalLM` en la librería Transformers. El checkpoint contiene 896.622.594 parámetros en formato safetensors, con un repositorio de 3,6 GB, lo que sitúa al modelo en la gama "large" dentro de su familia.

Su relevancia actual radica en que, según la model card, supera a SigLIP 2 y MetaCLIP 2 en 29 conjuntos de datos y 8 tareas diversas, con el mejor rendimiento reportado hasta la fecha en ambos idiomas. Está publicado con licencia Apache 2.0, lo que facilita su uso comercial, y se acompaña de una API/MCP oficial, así como de los artículos arXiv 2510.10921 (FG-CLIP 2) y 2505.05071 (FG-CLIP, ICML 2025).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP bilingüe con alineación visión-lenguaje de grano fino (tipo `fgclip2`, codificadores de imagen y texto separados) |
| Parametros totales | 896.622.594 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa imágenes con hasta 1024 parches y textos de hasta 196 tokens según el ejemplo de la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado en Transformers) |

## Arquitectura y entrenamiento

FG-CLIP 2 sigue el paradigma de dos torres de CLIP: un codificador visual y un codificador de texto que proyectan a un espacio común, con una escala y un sesgo de logits aprendidos (`logit_scale`, `logit_bias`) para el cálculo de similitudes. La innovación principal es el énfasis en la alineación de grano fino, que permite distinguir descripciones con diferencias sutiles (colores, materiales, objetos secundarios, disposición espacial) y que se refleja en el procesamiento de imágenes por parches con un número máximo variable (`max_num_patches`) y en un tokenizador de texto con modos `short` (hasta 64 tokens) y `long` (hasta 196 tokens) para descripciones detalladas.

El modelo se presenta como la versión 2 de FG-CLIP, cuya primera iteración se publicó en ICML 2025 (arXiv 2505.05071) junto con el conjunto de datos FineHARD. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset para la versión 2; únicamente indica la evaluación sobre 29 conjuntos de datos y 8 tareas, y la comparación con SigLIP 2 y MetaCLIP 2. No se especifica en la información disponible si hubo RLHF, DPO u otras etapas de ajuste.

## Capacidades

- Clasificación de imágenes zero-shot: asignación de etiquetas textuales a imágenes sin entrenamiento específico por clase.
- Retrieval imagen-texto y texto-imagen: emparejamiento y búsqueda cruzada entre modalidades, con soporte para descripciones cortas y largas.
- Alineación de grano fino: distinción de atributos visuales sutiles (color, material, objetos pequeños, relaciones espaciales) en descripciones detalladas.
- Capacidad bilingüe: procesamiento nativo de texto en inglés y en chino, incluyendo descripciones largas en chino en los ejemplos de la model card.
- Procesamiento visual por parches adaptativo: el número máximo de parches se ajusta según la resolución de la imagen (128, 256, 576, 784 o 1024).
- Integración con Transformers mediante código personalizado (`trust_remote_code=True`) y carga con `AutoModelForCausalLM`.
- Disponibilidad de API y MCP oficiales para integración en aplicaciones (según enlaces de la model card).
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y agentes: no disponible (el modelo es un codificador multimodal, no un generador de texto conversacional).

## Casos de uso

- Búsqueda visual en catálogos de producto: indexar imágenes de un catálogo y recuperarlas mediante descripciones textuales detalladas en inglés o chino, aprovechando la alineación de grano fino para distinguir variantes de color, material o accesorios.
- Moderación y etiquetado de contenido: clasificación zero-shot de imágenes en categorías definidas por texto, sin necesidad de reentrenar el modelo para cada nueva taxonomía.
- Comercio electrónico bilingüe: emparejamiento automático de imágenes de producto con descripciones en chino e inglés, útil para mercados internacionales y para la generación de metadatos.
- Accesibilidad y descripción de imágenes: generación de correspondencias entre imágenes y descripciones textuales largas para sistemas de descripción asistida, gracias al modo `long` de hasta 196 tokens.
- Organización de archivos multimedia: clasificación y recuperación de imágenes en bibliotecas grandes mediante consultas en lenguaje natural, con soporte para descripciones complejas.
- Investigación en visión-lenguaje: modelo base para experimentos de alineación multimodal de grano fino, evaluación en 29 datasets y comparación con SigLIP 2 y MetaCLIP 2.
- Sistemas de recomendación visual: puntuación de similitud entre imágenes y textos de preferencia del usuario para ranking de contenido.

## Benchmarks y rendimiento

La model card indica que FG-CLIP 2 supera a SigLIP 2 y MetaCLIP 2 en 29 conjuntos de datos y 8 tareas diversas, con el mejor rendimiento reportado hasta la fecha en inglés y chino. Sin embargo, no se proporcionan en la información disponible las tablas numéricas concretas de MMLU, HumanEval, GSM8K ni de las tareas multimodales evaluadas.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 3,6 GB solo para pesos, más memoria para activaciones y procesamiento de imágenes; se recomienda al menos 8-12 GB de VRAM para un uso cómodo.
- VRAM estimada en fp16/bf16: alrededor de 1,8-2 GB para pesos, más activaciones; cabe en GPUs consumer de gama media.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX 4080 para desarrollo e inferencia en local.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más de VRAM en fp16, y en tarjetas con 4-6 GB si se aplica cuantización (aunque no se documentan tipos de cuantización oficiales).
- Opciones de despliegue: Transformers con `trust_remote_code=True` (opción documentada); vLLM, llama.cpp, Ollama y TGI no están documentados oficialmente para este modelo en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idiomas | Licencia | Rendimiento reportado |
|---|---|---|---|---|---|
| FG-CLIP 2 Large | 896,6 M | Imágenes hasta 1024 parches; texto hasta 196 tokens | en, zh | Apache 2.0 | Supera a SigLIP 2 y MetaCLIP 2 en 29 datasets y 8 tareas (según model card) |
| SigLIP 2 | no disponible en la información | no disponible | no disponible | no disponible | Baseline superado por FG-CLIP 2 según la model card |
| MetaCLIP 2 | no disponible en la información | no disponible | no disponible | no disponible | Baseline superado por FG-CLIP 2 según la model card |
| FG-CLIP (v1) | no disponible en la información | no disponible | en, zh | no disponible | Publicado en ICML 2025 (arXiv 2505.05071) |

No se dispone de datos numéricos detallados de SigLIP 2, MetaCLIP 2 ni FG-CLIP v1 en la información proporcionada; la comparación se limita a la afirmación cualitativa de la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; como modelo entrenado con datos web, es probable que herede sesgos de género, cultura y representación, pero no se cuantifican.
- Riesgo de alucinación: al ser un modelo de alineación y no un generador de texto libre, el riesgo se manifiesta como falsos positivos en la clasificación o el retrieval, especialmente con descripciones ambiguas o imágenes fuera de distribución.
- Limitaciones de idioma: solo se declaran inglés y chino; el rendimiento en otros idiomas no está garantizado ni documentado.
- Limitaciones de contexto: el texto se trunca a 64 tokens en modo `short` y a 196 en modo `long`; las descripciones más largas se truncan. El número de parches de imagen está limitado a 1024.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución; el uso de código personalizado (`trust_remote_code=True`) implica ejecutar código del autor, lo que requiere revisión de seguridad en producción.
- Caveats para producción: el modelo requiere `trust_remote_code=True`, lo que puede complicar auditorías; no se documentan cuantizaciones oficiales ni soporte en vLLM/TGI; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria.
- La model card no detalla el dataset de entrenamiento ni las etapas de ajuste, lo que dificulta evaluar la reproducibilidad y los sesgos de dominio.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/fg-clip2-large
- Colección FG-CLIP 2 en Hugging Face: https://huggingface.co/collections/qihoo360/fg-clip-2-68ecbf9c548623bb78bc7913
- Repositorio de código: https://github.com/360CVGroup/FG-CLIP
- Página del proyecto: https://360cvgroup.github.io/FG-CLIP
- Artículo FG-CLIP 2 (arXiv 2510.10921): https://arxiv.org/abs/2510.10921
- Artículo FG-CLIP (arXiv 2505.05071): https://arxiv.org/abs/2505.05071
- API/MCP oficial: https://research.360.cn/sass/index
- Dataset FineHARD: https://huggingface.co/datasets/qihoo360/FineHARD
- DeepWiki del proyecto: https://deepwiki.com/360CVGroup/FG-CLIP
