# skram/bioclip-2-endpoint

## Resumen

BioCLIP 2 es un modelo fundacional de visión-lenguaje especializado en imágenes de organismos biológicos. Lo desarrolla un equipo académico liderado por Jianyang Gu, Samuel Stevens, Elizabeth G. Campolongo, Wei-Lun Chao y Yu Su, con participación de Imageomics (Universidad Estatal de Ohio) y otras instituciones. El modelo parte de un CLIP ViT-L/14 preentrenado sobre LAION-2B y se reentrena mediante aprendizaje contrastivo jerárquico sobre TreeOfLife-200M, el mayor conjunto de imágenes biológicas disponible hasta la fecha. El problema que resuelve es la clasificación de especies a escala: identificación zero-shot y few-shot de animales, plantas y hongos a partir de nombres taxonómicos, sin necesidad de entrenar un clasificador específico por taxón.

La relevancia de BioCLIP 2 no está solo en la mejora de precisión, sino en las propiedades emergentes que aparecen al escalar el entrenamiento contrastivo jerárquico: alineación ecológica entre especies (relacionar especies que comparten nicho o interacción) y separación de la variación intraespecífica (distinguir sexo, fase vital, morfo o estado fenológico dentro de una misma especie). Estas capacidades surgen únicamente con supervisión a nivel de especie, sin anotaciones adicionales para esas tareas.

La ficha que se documenta aquí, `skram/bioclip-2-endpoint`, es una reproducción (mirror) del modelo original en formato `open_clip`/safetensors, con 3,4 GB de repositorio, licencia MIT y cero descargas registradas. La versión oficial y actualizada se publica bajo el identificador `imageomics/bioclip-2.5-vith14`, lo que conviene tener en cuenta antes de desplegar esta copia concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos torres (CLIP). Codificador de imagen ViT-L/14 y codificador de texto Transformer con self-attention enmascarada |
| Parametros totales | No disponible de forma explicita en la informacion proporcionada. La arquitectura ViT-L/14 implica del orden de 300 M de parametros en el codificador de imagen (estimacion derivada de la arquitectura base, no confirmada por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Es un modelo de representacion imagen-texto para clasificacion, no un modelo generativo de texto |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales. El repo se distribuye en safetensors; no se publican variantes GGUF, AWQ ni GPTQ en la informacion disponible |
| Idiomas soportados | Ingles (etiqueta `en`); los prompts de clase se formulan en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `open_clip`) |
| Codificador de imagen | ViT-L/14 (patch 14, resolucion de entrada 224 px en la configuracion estandar de CLIP) |
| Modelo base | CLIP ViT-L/14 preentrenado sobre LAION-2B (`laion/CLIP-ViT-L-14-laion2B-s32B-b82K`) |
| Dataset de entrenamiento | TreeOfLife-200M (complementado con GBIF, BIOSCAN-5M, EOL y FathomNet) |
| Pipeline declarado | zero-shot-image-classification |
| Tarea principal | Clasificacion biologica de especies, zero-shot y few-shot |
| Version posterior | `imageomics/bioclip-2.5-vith14` (ViT-H/14) |
| Tamano del repositorio | 3,4 GB |

## Arquitectura y entrenamiento

BioCLIP 2 mantiene la arquitectura de dos torres de CLIP: un codificador visual ViT-L/14 que procesa la imagen y un codificador de texto Transformer con atención autoenmascarada que procesa el nombre o la descripción de la clase. Ambos se proyectan a un espacio conjunto y se alinean mediante pérdida contrastiva. El punto de partida es el CLIP ViT-L/14 entrenado sobre LAION-2B, lo que aporta un alineamiento imagen-texto genérico previo; sobre esa base se aplica un reentrenamiento contrastivo jerárquico, la innovación introducida por BioCLIP y escalada en esta segunda versión.

El entrenamiento se realiza sobre TreeOfLife-200M, un conjunto de aproximadamente 200 millones de imágenes biológicas con estructura taxonómica jerárquica (de reino a especie) y distribución de cola larga entre taxones. La pérdida jerárquica aprovecha esa taxonomía en lugar de tratar cada especie como una clase independiente. Según la model card, este escalado aporta una mejora del 18,1 % en clasificación de especies respecto a BioCLIP 1 y produce dos propiedades emergentes: alineación ecológica entre especies y separación de la variación intraespecífica. No se documenta en la información disponible el uso de RLHF, DPO ni procesos de alineación por preferencias, algo coherente con un modelo de representación y no generativo.

## Capacidades

- Clasificación de especies zero-shot: basta con proporcionar los nombres científicos de las clases candidatas como prompts de texto, sin entrenamiento adicional.
- Clasificación few-shot: admite un conjunto de soporte con unas pocas imágenes por clase para mejorar la decisión.
- Codificador visual reutilizable: la model card recomienda emplearlo como extractor de características para otras tareas de visión biológica (detección, segmentación, agrupamiento o recuperación).
- Cobertura taxonómica amplia: animales, plantas y hongos, incluyendo especies raras, amenazadas y poco representadas en otros conjuntos de datos.
- Alineación ecológica emergente: capacidad de relacionar especies por contexto ecológico compartido, derivada del entrenamiento jerárquico.
- Separación de variación intraespecífica: distinción de rasgos dentro de una misma especie (por ejemplo, diferencias de morfo, sexo o fase vital) sin supervisión específica para ello.
- Búsqueda y recuperación multimodal: emparejamiento imagen-texto e imagen-imagen en el espacio de embeddings conjunto.
- Soporte de tool calling o function calling: no disponible; el modelo no es generativo ni expone interfaz de agentes.
- Razonamiento multi-paso o modo de pensamiento (thinking): no disponible.
- Capacidades de audio o vídeo: no disponibles; el modelo procesa imágenes estáticas.
- Multilingüismo: limitado al inglés en los prompts y en la documentación.

## Casos de uso

- Monitorización de biodiversidad con cámaras trampa: procesar lotes de imágenes nocturnas o de baja calidad y clasificarlas contra un listado taxonómico local, usando el modo zero-shot para especies sin imágenes de referencia previas.
- Identificación de especies amenazadas en control del tráfico ilegal: desplegar el modelo como primer filtro sobre imágenes incautadas o publicadas en mercados online, apoyándose en las mejoras específicas sobre especies raras que reporta la model card.
- Catalogación de colecciones de historia natural: generar etiquetas taxonómicas preliminares para fondos fotográficos no digitalizados y priorizar la revisión humana de los casos de baja confianza.
- Ecología de campo asistida por móvil: integrar el modelo en una aplicación de identificación de flora y fauna para investigadores, usando clasificación few-shot con las imágenes locales del proyecto.
- Análisis de redes ecológicas: emplear los embeddings para calcular similitud entre especies y detectar agrupaciones por nicho o interacción, aprovechando la propiedad de alineación ecológica.
- Seguimiento de fenología y variación intraespecífica: detectar cambios de fase vital, floración o estado reproductivo dentro de una misma especie mediante la separación de variación intraespecífica.
- Preetiquetado para pipelines de anotación biológica: usar el modelo como generador de etiquetas débiles que alimenten un modelo supervisado específico, reduciendo el coste de anotación manual.
- Recuperación de imágenes en repositorios científicos: indexar catálogos de imágenes biológicas con embeddings de BioCLIP 2 y permitir consultas en lenguaje natural o por imagen de ejemplo.

## Benchmarks y rendimiento

La información disponible solo reporta un dato agregado de mejora: BioCLIP 2 supera a BioCLIP 1 en un 18,1 % en clasificación de especies, y añade cualitativamente dos propiedades emergentes (alineación ecológica inter-especie y separación de variación intra-específica). No se han publicado en la información proporcionada tablas con resultados numéricos por benchmark (MMLU, HumanEval, GSM8K u otros), y estos benchmarks no aplican a un modelo de representación imagen-texto como este. Tampoco se detallan métricas por tarea biológica (top-1, top-5, macro-F1), latencias ni throughput.

| Metrica | Resultado |
|---|---|
| Mejora en clasificacion de especies frente a BioCLIP 1 | +18,1 % |
| Propiedades emergentes reportadas | Alineacion ecologica inter-especie y separacion de variacion intra-especifica |
| Resultados detallados por benchmark | No disponibles en la informacion proporcionada |

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 1,5-2 GB en fp16/bf16 y 3-4 GB en fp32, considerando un ViT-L/14 más el codificador de texto. Son estimaciones derivadas de la arquitectura, no cifras publicadas por el autor.
- Cabe en GPU de consumo: sí, cualquier GPU con 4 GB o más de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090) puede ejecutar inferencia en fp16.
- GPU recomendadas para producción: NVIDIA A100, H100, L40S o A10G para inferencia por lotes a gran escala; T4 o L4 para despliegues de bajo coste.
- CPU: es viable para inferencia puntual, pero con latencia muy superior; no es adecuado para procesar lotes grandes de imágenes.
- Opciones de despliegue: librería `open_clip` sobre PyTorch, el propio Hugging Face Inference Endpoints (el repo declara `endpoints_compatible`) y `timm`/`open_clip` como backends. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo generativo autoregresivo de texto.
- Latencia y throughput: no disponibles. Dependerán del tamaño de lote, la resolución de entrada, el uso de AMP y el hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioCLIP 2 (esta ficha) | CLIP ViT-L/14 | No confirmado (del orden de 300 M en el codificador de imagen) | Representacion imagen-texto; clasificacion zero-shot | MIT | Hugging Face (mirror `skram/bioclip-2-endpoint`) |
| BioCLIP 1 | CLIP ViT-B/16 | No disponible en la informacion | Representacion imagen-texto; clasificacion zero-shot | No disponible en la informacion | Hugging Face (`imageomics/bioclip`) |
| BioCLIP 2.5 | CLIP ViT-H/14 | No disponible en la informacion | Version posterior, mayor tamano de codificador | No disponible en la informacion | Hugging Face (`imageomics/bioclip-2.5-vith14`) |
| CLIP ViT-L/14 (LAION-2B) | CLIP ViT-L/14 | No disponible en la informacion | Representacion imagen-texto generica, sin especializacion biologica | No disponible en la informacion | Hugging Face (`laion/CLIP-ViT-L-14-laion2B-s32B-b82K`) |

Las cifras de rendimiento comparativas entre estas alternativas no se detallan en la informacion disponible, salvo la mejora agregada del 18,1 % de BioCLIP 2 sobre BioCLIP 1.

## Limitaciones y advertencias

- Sesgo por desequilibrio taxonómico: TreeOfLife-200M presenta una distribución de cola larga; las predicciones tienden a favorecer a los taxones mejor representados. La propia model card apunta a la discusión del dataset card de TreeOfLife-200M.
- Riesgo en especies poco representadas: aunque el modelo mejora el reconocimiento de especies raras y amenazadas, la cobertura sigue siendo desigual y la confianza puede ser baja para taxones con pocas imágenes.
- Riesgo de doble uso: la mejora en la identificación de especies amenazadas podría facilitar la localización de ejemplares por parte de furtivos. La model card argumenta que el riesgo principal proviene de la geolocalización precisa y que el dataset no incluye metadatos geoespaciales, lo que mitiga la exposición.
- Idioma: los prompts de clase están pensados para inglés; introducir nombres o descripciones en otros idiomas puede degradar el rendimiento y no está documentado.
- Naturaleza no generativa: no produce texto, no razona paso a paso y no soporta tool calling ni agentes. Cualquier uso conversacional requiere envolverlo con otro componente.
- Sin cuantizaciones publicadas: no hay variantes GGUF, AWQ ni GPTQ documentadas, lo que limita despliegues en entornos que dependan de esos formatos.
- Copia no oficial: este repositorio concreto (`skram/bioclip-2-endpoint`) no es el publicado por los autores, acumula cero descargas y la model card está truncada. Para producción conviene usar la versión mantenida por `imageomics/bioclip-2.5-vith14`.
- Licencia MIT: permite uso comercial, pero sigue siendo responsabilidad del usuario cumplir la normativa aplicable sobre especies protegidas, datos de biodiversidad y comercio de especímenes.

## Enlaces

- Hugging Face (esta copia): https://huggingface.co/skram/bioclip-2-endpoint
- Version oficial posterior: https://huggingface.co/imageomics/bioclip-2.5-vith14
- Pagina del proyecto BioCLIP 2: https://imageomics.github.io/bioclip-2/
- Repositorio en GitHub: https://github.com/Imageomics/bioclip-2
- Paper en NeurIPS 2025: https://proceedings.neurips.cc/paper_files/paper/2025/file/94da80cbfe870c1db958c88a8a27018c-Paper-Conference.pdf
- DOI en arXiv: https://doi.org/10.48550/arXiv.2505.23883
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/imageomics/bioclip-2-demo
- Dataset TreeOfLife-200M: https://huggingface.co/datasets/imageomics/TreeOfLife-200M
- Dataset card de TreeOfLife-200M (consideraciones de uso de datos): https://huggingface.co/datasets/imageomics/TreeOfLife-200M#considerations-for-using-the-data
- Dataset BIOSCAN-5M: https://huggingface.co/datasets/bioscan-ml/BIOSCAN-5M
- Modelo base CLIP ViT-L/14 LAION-2B: https://huggingface.co/laion/CLIP-ViT-L-14-laion2B-s32B-b82K
- Pagina de BioCLIP 1: https://imageomics.github.io/bioclip/
