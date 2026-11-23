# dhtandguy21/PMC-PaIR-BiomedCLIP

## Resumen

PMC-PaIR-BiomedCLIP es un ajuste fino de BiomedCLIP, el modelo vision-lenguaje de Microsoft especializado en imagenes biomedicas, orientado a la recuperacion de imagenes medicas clinicamente similares. Lo desarrolla el autor independiente dhtandguy21 y se entrena sobre la particion de entrenamiento de PMC-PaIR, un conjunto de 86.144 pares de imagenes extraidas de informes de caso de PubMed Central. El objetivo es que, dada una imagen de consulta, el modelo devuelva imagenes de la misma modalidad de imagen, la misma region anatomica y el mismo tipo de anomalia.

El repositorio contiene dos checkpoints. El primero, `image_to_image.safetensors` (345 MB), incluye solo el codificador visual y permite recuperacion imagen-a-imagen (i2i). El segundo, `image_text_to_image.safetensors` (784 MB), contiene el modelo completo (codificador visual y codificador de texto) y admite consultas que combinan una imagen con una descripcion textual del hallazgo de interes, lo que se denomina recuperacion (i+t)2i. Ambos generan embeddings de imagen de 512 dimensiones y se cargan con `open_clip`, no con `transformers`.

La relevancia del modelo es practica: aborda la recuperacion de casos similares en entornos radiologicos, una tarea util para docencia, apoyo al diagnostico y construccion de indices visuales de literatura cientifica. Se distribuye con licencia MIT, aunque es un checkpoint de investigacion no validado para decision clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP bimodal (ViT-B/16 para vision + PubMedBERT para texto), base BiomedCLIP |
| Parametros totales | no disponible (repo de 1,1 GB con dos checkpoints; el completo ocupa 784 MB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el texto se trunca a 256 tokens en el modelo base) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors de precision original) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (con aviso de licencia de Microsoft para BiomedCLIP) |
| Formato de pesos | safetensors (`image_to_image.safetensors`, `image_text_to_image.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224` (revision `9f341de24bfb00180f1b847274256e9b65a3a32e`), un CLIP con torre visual ViT-B/16 a 224x224 y torre de texto PubMedBERT con truncado a 256 tokens. El ajuste fino se realiza sobre la particion de entrenamiento de PMC-PaIR, un dataset de 86.144 pares de imagenes clinicamente similares procedentes de informes de caso de PubMed Central. El checkpoint i2i conserva unicamente el codificador visual (151 tensores); el checkpoint (i+t)2i conserva el modelo completo (351 tensores).

Una innovacion destacable es el preprocesamiento en tres vistas: la imagen se redimensiona para que su lado corto mida 224 pixeles y se extraen tres recortes de 224x224 en el inicio, el centro y el final del lado largo. Esto cubre figuras anchas y multipanel habituales en publicaciones medicas. Los embeddings de las tres vistas se normalizan en L2, se promedian y se vuelven a normalizar, produciendo un vector unitario de 512 dimensiones. En las consultas (i+t)2i, las descripciones siguen la plantilla `"{diagnosis} in the {anatomy} on {modality}."` y sus embeddings unitarios se promedian sin renormalizar. No se documentan en la informacion disponible detalles sobre volumen de tokens, composicion exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Extraccion de caracteristicas visuales: genera embeddings de imagen de 512 dimensiones normalizados, listos para busqueda por similitud coseno.
- Recuperacion imagen-a-imagen (i2i): devuelve imagenes con la misma modalidad, region anatomica y tipo de anomalia que la consulta.
- Recuperacion imagen-mas-texto a imagen ((i+t)2i): permite refinar la busqueda con descripciones del hallazgo, la anatomia y la modalidad.
- Representacion conjunta vision-texto: el checkpoint completo conserva ambas torres y permite puntuar texto contra imagenes.
- Manejo de figuras medicas complejas: el esquema de tres vistas cubre imagenes anchas y multipanel.
- Dominio biomedico: hereda el conocimiento de BiomedCLIP sobre terminologia y morfologia medica.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no generativo.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Recuperacion de casos similares en radiologia: dado un estudio de consulta, el checkpoint i2i devuelve imagenes de la misma modalidad y region para comparar patrones visuales, aprovechando el entrenamiento sobre pares clinicamente similares de PMC-PaIR.
- Indice visual de literatura cientifica: indexar las figuras de un corpus de informes de caso con embeddings de 512 dimensiones y ofrecer busqueda por imagen o por imagen mas texto, util para revisiones sistematicas.
- Apoyo a la docencia medica: construir un buscador que, a partir de una imagen de ejemplo, recupere casos con hallazgos equivalentes para ilustrar sesiones clinicas.
- Refinamiento de busqueda con descripcion textual: usar el checkpoint (i+t)2i con plantillas como `"consolidation in the right lower lobe on CT."` para restringir la recuperacion a un hallazgo concreto dentro de una modalidad.
- Deduplicacion y agrupacion de figuras: calcular embeddings de un repositorio de imagenes y agrupar por similitud coseno para detectar figuras repetidas o casi identicas en publicaciones.
- Prefiltrado en pipelines de anotacion: ordenar candidatos por similitud antes de la revision humana, reduciendo el numero de imagenes que un radiologo debe inspeccionar.
- Construccion de sistemas de recomendacion de casos: integrar los embeddings en un motor vectorial para sugerir casos relacionados a partir de una imagen de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los ficheros JSON de cada checkpoint incluyen metricas de validacion y la epoca seleccionada, pero no se proporcionan los valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint i2i (345 MB) requiere menos de 1 GB en FP32; el checkpoint completo (784 MB) requiere aproximadamente 1-2 GB en FP32, incluyendo activaciones para lotes pequenos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se recomiendan RTX 3060, RTX 4090, A100 o H100 para procesar lotes grandes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) y tambien en CPU para volumenes moderados.
- Opciones de despliegue: `open_clip_torch` con PyTorch es la via oficial; no es un modelo `transformers`, por lo que vLLM, TGI o llama.cpp no aplican. Para servicio en produccion se puede envolver en FastAPI o TorchServe.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del tamano de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Dimension del embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PMC-PaIR-BiomedCLIP (i2i / (i+t)2i) | no disponible | 256 tokens (heredado) | 512 | MIT | Hugging Face, GitHub |
| BiomedCLIP (Microsoft, base) | no disponible | 256 tokens | 512 | MIT | Hugging Face |
| CLIP ViT-B/16 (OpenAI) | ~150 M | 77 tokens | 512 | MIT | Hugging Face, open_clip |
| OpenCLIP ViT-B/16 (varios) | ~150 M | 77 tokens | 512 | MIT / Apache-2.0 segun checkpoint | Hugging Face, open_clip |

La comparativa con BiomedCLIP y CLIP es la mas directa por compartir arquitectura y dimension de embedding. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigacion: no ha sido validado para toma de decisiones clinicas.
- Sesgos: hereda los sesgos de BiomedCLIP y de PMC-PaIR, que procede de informes de caso publicados y no representa la distribucion real de la practica clinica.
- Riesgo de alucinacion: al ser un modelo de embeddings no genera texto, pero la similitud coseno puede devolver falsos positivos con apariencia visual parecida y patologia distinta.
- Limitaciones de idioma: solo ingles; las plantillas de texto estan disenadas para descripciones en ingles.
- Limitaciones de contexto: la torre de texto trunca a 256 tokens, lo que restringe descripciones largas.
- Dependencia de `open_clip`: no es compatible directamente con `transformers`, lo que complica la integracion con pipelines estandar.
- Licencia MIT para los pesos, con la obligacion de conservar el aviso de licencia de Microsoft para BiomedCLIP.
- Sin datos publicos de benchmarks: la evaluacion cuantitativa queda pendiente de la publicacion del data descriptor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dhtandguy21/PMC-PaIR-BiomedCLIP
- Dataset PMC-PaIR: https://huggingface.co/datasets/dhtandguy21/PMC-PaIR
- Version de registro del dataset en Zenodo: https://doi.org/10.5281/zenodo.23439169
- Codigo de entrenamiento y evaluacion: https://github.com/GuyShmueli/pmc-pair-retrieval
- Release v1.0.3 con los pesos: https://github.com/GuyShmueli/pmc-pair-retrieval/releases/tag/v1.0.3
- Modelo base BiomedCLIP: https://huggingface.co/microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224
- Libreria open_clip: https://github.com/mlfoundations/open_clip
