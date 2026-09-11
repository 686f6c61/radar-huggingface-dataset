# skram/bioclip-2.5-vith14-endpoint

## Resumen

BioCLIP 2.5 Huge es un modelo fundacional de visión-lenguaje especializado en imágenes de organismos biológicos. Lo desarrolla el equipo de Imageomics (Ohio State University y colaboradores) y se construye sobre un CLIP ViT-H/14 preentrenado en LAION-2B, refinado sobre una versión ampliada de TreeOfLife-200M que añade 19 millones de imágenes respecto al conjunto original. Su objetivo es resolver clasificación taxonómica y otras tareas visuales biológicas en régimen zero-shot y few-shot, sin necesidad de reentrenar por especie.

La ficha que se analiza aquí corresponde al repositorio `skram/bioclip-2.5-vith14-endpoint`, una réplica del modelo oficial `imageomics/bioclip-2.5-vith14` publicada por un tercero, con licencia MIT y pesos en formato safetensors. El modelo se distribuye a través de la librería `open_clip` y el repositorio declara compatibilidad con inference endpoints.

Es relevante ahora porque sustituye el backbone ViT-L/14 de BioCLIP 2 por un ViT-H/14, lo que se traduce, según el autor, en mejoras del 5,7 % en clasificación de especies y del 3,5 % en tareas visuales biológicas amplias, con un 8,7 % de mejora específica en FishNet. El coste es un incremento notable de requisitos de inferencia, que la propia model card advierte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP de doble torre: encoder de imagen ViT-H/14 (transformer) y encoder de texto transformer con self-attention enmascarada |
| Parámetros totales | No disponible (la model card no publica el recuento; el backbone es ViT-H/14) |
| Longitud de contexto | No disponible (no aplica en el sentido de LLM; el encoder de texto es el de CLIP, orientado a prompts cortos) |
| Tipos de cuantización | No disponible (no se documentan variantes cuantizadas; el entrenamiento usó precisión bf16 pura) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 7,9 GB, librería `open_clip`) |

## Arquitectura y entrenamiento

BioCLIP 2.5 Huge es un modelo contrastivo de doble encoder. La torre visual es un ViT-H/14 (parches de 14x14 píxeles) y la torre de texto es un transformer con self-attention enmascarada, siguiendo el esquema CLIP. Se inicializa desde los pesos de CLIP ViT-H/14 entrenado en LAION-2B (`laion/CLIP-ViT-H-14-laion2B-s32B-b79K`) y se ajusta con el repositorio BioCLIP 2 v2.0.0, que incorpora `torch.compile` y precisión `pure_bf16` como aceleradores del entrenamiento. El preprocesado de imagen es el estándar de CLIP.

Los datos de entrenamiento son una versión actualizada de TreeOfLife-200M que añade 19 millones de imágenes y un filtrado adicional basado en contenido (los detalles de dicho filtrado quedan pendientes de publicación según la model card). A ese corpus se suma un subconjunto de LAION-2B de 26 millones de muestras utilizado para *experience replay*, extraído de los tres primeros ficheros parquet de metadatos y los 4000 primeros ficheros tar, y que coincide con el usado en el entrenamiento de BioCLIP 2. El modelo se apoya además en datos de GBIF, BIOSCAN-5M, EOL y FathomNet. La model card no detalla la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (no procede en un modelo contrastivo de este tipo).

## Capacidades

- Clasificación de imágenes zero-shot: basta con proporcionar nombres taxonómicos o vernáculos como prompts de texto, sin ejemplos de entrenamiento por clase.
- Clasificación few-shot: admite un conjunto de soporte con algunas imágenes por categoría.
- Reconocimiento de especies a través de grandes grupos taxonómicos (animales, plantas, hongos) y de taxones poco representados, incluidas especies raras y amenazadas.
- Tareas visuales biológicas amplias más allá de la identificación de especies, según el autor.
- Distinción de hábitats en el conjunto FishNet, con una mejora reportada del 8,7 % frente a BioCLIP 2.
- Recuperación imagen-texto y texto-imagen mediante embeddings alineados (espacio conjunto imagen-texto propio de CLIP).
- Uso como encoder visual congelado para otras tareas biológicas posteriores (detección, segmentación, clasificación con cabezas específicas).
- Soporte de tool calling / function calling: no aplica, no es un modelo generativo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no, el modelo declara únicamente inglés.
- Capacidades especiales: no dispone de modo *thinking*, audio ni vídeo; su dominio es imagen estática de organismos.

## Casos de uso

- Ciencia ciudadana e identificación de especies: integrado en aplicaciones tipo observatorio de biodiversidad, permite clasificar fotografías de campo zero-shot contra listas taxonómicas de una región concreta, sin reentrenar el modelo por cada nueva campaña de recogida de datos.
- Monitorización de biodiversidad con cámaras trampa: el modelo puede procesar lotes de imágenes nocturnas o de baja calidad para preetiquetar fauna y priorizar la revisión humana, reduciendo el coste de anotación manual en estudios de largo plazo.
- Vigilancia de especies amenazadas: aplicado a imágenes de trampas cámara o de patrullas de campo, permite filtrar candidatos de especies en peligro para su verificación por parte de guardería, apoyándose en la mejora declarada en reconocimiento de taxones raros.
- Bioimagen de insectos y artrópodos: en pipelines asociados a BIOSCAN-5M, el modelo sirve para clasificar especímenes fotografiados en placas o trampas, complementando el metabarcoding y aportando etiquetas morfológicas.
- Imágenes submarinas y organismos marinos: sobre datos tipo FathomNet, puede etiquetar organismos captados por ROV o vehículos submarinos, y distinguir hábitats cuando el objetivo es la caracterización de fondos marinos.
- Curaduría y enriquecimiento de colecciones: en repositorios tipo GBIF o Encyclopedia of Life, el modelo permite agrupar, deduplicar semánticamente y proponer etiquetas débiles sobre imágenes sin metadatos fiables, usando similitud de embeddings.
- Recuperación multimodal en colecciones museísticas: búsqueda de imágenes por descripción textual ("espécimen con aletas amarillas sobre fondo rocoso") aprovechando el espacio compartido imagen-texto del modelo.
- Encoder visual para investigación en biología evolutiva: extraer embeddings de imágenes de especies para análisis de rasgos, morfometría comparada o estudios de correlación entre fenotipo y linaje, congelando la torre visual y entrenando clasificadores ligeros encima.
- Evaluación de modelos de visión biológica: uso como referencia fuerte (baseline) en comparativas de zero-shot sobre tareas de taxonomía, dada su mejora declarada frente a BioCLIP 2.
- Preanotación para anotadores humanos en proyectos de etiquetado a gran escala: el modelo genera candidatos ordenados por similitud y el anotador solo confirma o corrige.

## Benchmarks y rendimiento

La model card no publica valores absolutos, sino mejoras relativas frente a BioCLIP 2:

| Tarea o conjunto | Valor absoluto | Mejora frente a BioCLIP 2 |
|---|---|---|
| Clasificación de especies | no publicado | +5,7 % |
| Tareas visuales biológicas amplias (agregado) | no publicado | +3,5 % |
| FishNet (distinción de hábitats) | no publicado | +8,7 % |

No se han publicado resultados de benchmarks adicionales (tipo MMLU, HumanEval o GSM8K, no aplicables a este modelo) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia de orden de magnitud, el repositorio ocupa 7,9 GB, lo que sugiere pesos en precisión alta o varias copias; una carga en bf16/fp16 de un backbone ViT-H/14 de CLIP se sitúa típicamente en el rango de pocos gigabytes de pesos, más activaciones según resolución y tamaño de lote. Estas cifras son estimaciones, no datos confirmados por el autor.
- GPU recomendadas: no especificadas en la model card. Para inferencia por lotes se esperan GPUs de centro de datos (A100, H100, L40S) y, para uso ligero, GPUs de consumo con suficiente VRAM.
- ¿Cabe en GPU de consumo? Es plausible en tarjetas con 8-12 GB o más, siempre que se ajuste el tamaño de lote y la resolución; el autor no confirma cifras.
- Opciones de despliegue: `open_clip` (vía `open_clip.create_model_and_transforms` con `hf-hub:`), PyTorch nativo, y el tag `endpoints_compatible` del repositorio indica compatibilidad con inference endpoints de Hugging Face. No aplican vLLM ni llama.cpp en sentido estricto, al no ser un modelo generativo autorregresivo; sí es viable exportar a ONNX/TensorRT para producción.
- Latencia y throughput: no disponibles.
- Nota del autor: BioCLIP 2.5 Huge ofrece mejor rendimiento que BioCLIP 2, pero con requisitos de recursos de inferencia mucho mayores.

## Comparativa con modelos similares

| Modelo | Backbone | Contexto / uso | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioCLIP 2.5 Huge | CLIP ViT-H/14 | Zero-shot y few-shot de imágenes biológicas; encoder visual | Referencia: +5,7 % en especies y +3,5 % en tareas biológicas frente a BioCLIP 2 | MIT | Hugging Face (oficial y réplica) |
| BioCLIP 2 | CLIP ViT-L/14 | Mismas tareas, menor coste de inferencia | Base de comparación | MIT | Hugging Face (`imageomics/bioclip-2`) |
| CLIP ViT-H/14 LAION-2B | CLIP ViT-H/14 | Visión-lenguaje general, no especializado en biología | No disponible para tareas biológicas en la información proporcionada | No disponible en la información proporcionada | Hugging Face (`laion/CLIP-ViT-H-14-laion2B-s32B-b79K`) |

No se dispone de datos de parámetros totales ni de cifras absolutas de benchmark para ninguno de los tres modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card remite explícitamente a la sección de sesgos, riesgos y limitaciones de BioCLIP 2, sin detallarlos aquí; conviene revisarla antes de un despliegue en producción.
- Riesgo de alucinación en sentido amplio: en clasificación zero-shot, el modelo puede asignar una especie plausible pero incorrecta cuando la imagen es ambigua, está degradada o el taxón no está bien representado en el corpus de entrenamiento.
- Sesgos esperables por desequilibrio del dataset: sobre-representación de determinados grupos taxonómicos y de ciertas regiones geográficas, con peor rendimiento en taxones raros o poco fotografiados.
- Idioma: los prompts de texto solo están soportados en inglés, lo que limita su uso directo con nomenclatura vernacular en castellano u otros idiomas.
- Contexto de texto limitado: al ser un CLIP, los prompts son cortos; no admite descripciones largas ni diálogo multi-turno.
- Restricciones de licencia: MIT permite uso comercial, pero al derivar de CLIP ViT-H/14 LAION-2B conviene verificar las condiciones del modelo base y de los datasets empleados (TreeOfLife-200M, GBIF, BIOSCAN-5M, EOL, FathomNet) antes de explotación comercial.
- El repositorio analizado es una réplica de terceros (`skram/bioclip-2.5-vith14-endpoint`), con 0 descargas y 0 likes en el momento de la consulta; para uso en producción es preferible partir del repositorio oficial de Imageomics.
- La model card indica que parte de los detalles del filtrado de datos está pendiente de actualización, por lo que la composición exacta del conjunto de entrenamiento no es auditable con la información publicada.
- Coste de inferencia elevado en comparación con BioCLIP 2 (ViT-L/14), lo que puede hacer inviable su uso en dispositivos de borde o en servicios con presupuesto de cómputo ajustado.
- No hay datos publicados de latencia, throughput ni consumo de VRAM, por lo que cualquier planificación de capacidad requiere medición propia.

## Enlaces

- Repositorio analizado en Hugging Face: https://huggingface.co/skram/bioclip-2.5-vith14-endpoint
- Modelo oficial (referenciado en la model card y en el código de ejemplo): https://huggingface.co/imageomics/bioclip-2.5-vith14
- Página del proyecto BioCLIP 2: https://imageomics.github.io/bioclip-2/
- Repositorio de código BioCLIP 2 (v2.0.0): https://github.com/Imageomics/bioclip-2
- Artículo: BioCLIP 2: Emergent Properties from Scaling Hierarchical Contrastive Learning: https://doi.org/10.48550/arXiv.2505.23883
- Dataset TreeOfLife-200M: https://huggingface.co/datasets/imageomics/TreeOfLife-200M
- Modelo base CLIP ViT-H/14 LAION-2B: https://huggingface.co/laion/CLIP-ViT-H-14-laion2B-s32B-b79K
- Model card de BioCLIP 2 (referencia para sesgos y limitaciones): https://huggingface.co/imageomics/bioclip-2
- Org de Imageomics en Hugging Face: https://huggingface.co/imageomics/

Nota: la búsqueda web asociada a esta ficha devolvió únicamente páginas de Speedtest by Ookla, sin relación con el modelo, por lo que no se ha incorporado ningún enlace adicional procedente de esa búsqueda.
