# MEDHEB/MedEmb-8B

## Resumen

MedEmb-8B es un modelo de embeddings multimodales para el dominio médico desarrollado por MEDHEB, construido sobre la arquitectura Qwen3-VL (según la etiqueta `qwen3_vl` del repositorio) y publicado en HuggingFace con 8.767.123.696 parámetros totales. Su propósito es generar representaciones vectoriales (embeddings) de imágenes médicas 2D, volúmenes 3D y texto biomédico, de modo que puedan compararse mediante similitud semántica para tareas de recuperación (retrieval) y clasificación zero-shot. El modelo está asociado al benchmark MedHEB-Bench, que abarca tareas sobre radiología, patología, dermatología, oftalmología y otras modalidades de imagen médica.

El problema que resuelve es la falta de un espacio de embeddings unificado para modalidades médicas heterogéneas: la mayoría de modelos de embeddings visuales están entrenados con imágenes naturales (ImageNet, COCO) y pierden sensibilidad ante patrones radiológicos o histopatológicos. MedEmb-8B propone un encoder multimodal que alinea imagen y texto en un mismo espacio vectorial, permitiendo búsquedas del tipo "imagen similar a esta" o "texto que describe esta imagen" dentro de un corpus clínico.

Es relevante ahora porque el ecosistema de modelos de embeddings médicos de código abierto es escaso y la mayoría se limita a una única modalidad (por ejemplo, solo radiografía de tórax). MedEmb-8B declara cubrir 2D, 3D y texto bajo una misma arquitectura, con una licencia mixta que condiciona su uso comercial. El repositorio tiene un tamaño de 17,5 GB y, en el momento de la consulta, registra 32 descargas y 0 likes, lo que indica una adopción todavía incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3-VL (etiqueta `qwen3_vl`); detalles internos no disponibles |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | mixed-source-licenses (licencia `other` con nombre `mixed-source-licenses`; ver archivo LICENSE) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se apoya en la familia Qwen3-VL, es decir, un transformer multimodal con un encoder visual y un decoder de lenguaje, adaptado para producir embeddings en lugar de texto generativo. No se documentan en la información proporcionada el número de capas, la dimensión oculta, el tamaño del encoder visual ni la estrategia exacta de pooling o proyección a un espacio vectorial común. Tampoco se especifica si se empleó entrenamiento contrastivo (tipo CLIP/SigLIP), triplet loss o una combinación, aunque el formato de los datos de entrenamiento del benchmark asociado (pares `messages`/`positive_messages`) sugiere un régimen de aprendizaje con pares positivos y negativos.

Respecto a los datos de entrenamiento, la model card del repositorio describe principalmente el benchmark MedHEB-Bench y sus conjuntos de datos (2D, 3D y texto), pero no detalla la composición del corpus de entrenamiento del modelo ni el número de tokens o pares imagen-texto utilizados. Se desconoce si hubo etapas de RLHF, DPO o ajuste fino supervisado. La información tampoco confirma innovaciones técnicas específicas como decodificación especulativa, atención lineal o atención con ventana deslizante.

## Capacidades

- Generación de embeddings multimodales para imágenes médicas 2D (radiografía de tórax, dermatología, patología, OCT, hematología, MRI cerebral, CT abdominal en cortes axial, coronal y sagital).
- Generación de embeddings para volúmenes médicos 3D (se citan CT-RATE y MRNet en el benchmark asociado).
- Generación de embeddings de texto biomédico para recuperación texto-texto.
- Recuperación cruzada imagen-texto y texto-imagen (image retrieval y text-to-image retrieval) en el dominio médico.
- Recuperación imagen-imagen para búsqueda de casos similares ("Find the same category image with the provided image").
- Soporte para tareas de clasificación zero-shot mediante comparación de similitud con descripciones textuales.
- Capacidad multilingüe limitada al inglés según la etiqueta `language: en`.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento multi-paso; el modelo está orientado a embeddings, no a generación de texto libre.

## Casos de uso

- Búsqueda de casos similares en un PACS o archivo de imágenes médicas: indexar los embeddings de las imágenes 2D del hospital y permitir consultas por imagen de referencia para localizar estudios con patrones radiológicos parecidos, gracias a la capacidad de recuperación imagen-imagen declarada en el benchmark.
- Recuperación de informes o descripciones textuales a partir de una imagen: dado un estudio, generar su embedding visual y buscar en un corpus de texto biomédico las descripciones más próximas en el espacio vectorial, útil para tareas de asistencia al radiólogo.
- Clasificación zero-shot de hallazgos: construir un conjunto de prompts textuales (por ejemplo, "derrame pleural", "cardiomegalia") y asignar la etiqueta cuya representación tenga mayor similitud con el embedding de la imagen, sin necesidad de reentrenar un clasificador supervisado.
- Deduplicación y agrupamiento de estudios: calcular embeddings de un lote de imágenes para agrupar estudios visualmente similares y detectar duplicados o series redundantes en un archivo clínico.
- Recuperación multimodal para investigación en patología digital: indexar parches histopatológicos (PathMNIST, LC25000, Kvasir) y recuperar los más similares a una consulta, apoyando tareas de control de calidad y anotación asistida.
- Recuperación sobre volúmenes 3D: indexar estudios de resonancia (MRNet) o TC (CT-RATE) mediante embeddings 3D y recuperar casos con características volumétricas comparables, útil en cohortes de investigación.
- Construcción de bases de datos vectoriales para RAG médico: usar el modelo como encoder en un pipeline de retrieval-augmented generation donde el recuperador sea multimodal y el generador sea otro modelo de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo MedEmb-8B en la información disponible. La model card del repositorio describe el benchmark MedHEB-Bench (conjuntos de test 2D, 3D y texto) y enlaza a los datasets de evaluación, pero no incluye una tabla de métricas del modelo sobre dichos conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 17,5 GB solo para los pesos (8,77 mil millones de parámetros × 2 bytes), más overhead de activaciones y del encoder visual; en la práctica se recomienda reservar 20-24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 9-10 GB para pesos, más overhead; en 4 bits, alrededor de 5-6 GB para pesos, más overhead. No se publican checkpoints cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue en FP16 con lotes grandes. Una RTX 4090 (24 GB) puede alojar el modelo en FP16 con lotes pequeños, y GPUs consumer de 12-16 GB requerirían cuantización.
- Cabe en GPU consumer: sí, en RTX 4090 en FP16 con batch reducido; en GPUs de 12-16 GB solo mediante cuantización (no se ofrecen checkpoints cuantizados oficiales).
- Opciones de despliegue: no se documentan en la información proporcionada. Al ser un modelo de embeddings con pesos safetensors compatible con transformers, es plausible servirlo con vLLM, TGI o un servidor propio basado en transformers, pero no hay confirmación oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo orientativo, los competidores naturales serían encoders médicos multimodales como BiomedCLIP (encoder visión-lenguaje de dominio biomédico, mucho menor en parámetros) y modelos de embeddings generalistas multimodales tipo Qwen3-VL-Embedding o SigLIP, pero no se han facilitado sus cifras para contrastar.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MedEmb-8B | 8,77 B | no disponible | mixed-source-licenses | HuggingFace |
| BiomedCLIP | no disponible en la información | no disponible | no disponible | no disponible |
| Qwen3-VL-Embedding | no disponible en la información | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés (`language: en`); el rendimiento en castellano u otros idiomas no está garantizado.
- La licencia es `mixed-source-licenses` (categoría `other`), lo que implica que las condiciones de uso comercial dependen de las licencias de las fuentes de datos subyacentes; es imprescindible revisar el archivo LICENSE antes de cualquier despliegue en producción.
- El benchmark asociado incluye conjuntos de datos con acuerdos de uso restringido (MIMIC-CXR, CheXpert-Plus, VinDr-CXR, CT-RATE, MRNet, entre otros) cuyas imágenes no se redistribuyen; esto condiciona la reproducibilidad de las evaluaciones y el uso de los datos de entrenamiento.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de robustez; al tratarse de un modelo de embeddings, el riesgo principal es la recuperación de casos clínicamente irrelevantes presentados como similares.
- No se especifica la longitud de contexto, lo que impide planificar el tamaño de lote y la longitud máxima de texto en producción.
- La adopción es muy baja (32 descargas, 0 likes en el momento de la consulta) y no hay resultados de benchmarks publicados, por lo que no existe evidencia independiente de su calidad frente a alternativas establecidas.
- No se ofrecen checkpoints cuantizados oficiales, lo que limita el despliegue en hardware consumer sin trabajo adicional de cuantización.
- Al ser un modelo de embeddings y no generativo, no debe emplearse para responder preguntas clínicas directamente; su salida son vectores, no texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MEDHEB/MedEmb-8B
- Muestra del benchmark MedHEB-Bench (≈2,5 GB): https://huggingface.co/datasets/MEDHEB/MedHEB-Bench_Sample
- MIMIC-CXR (PhysioNet): https://physionet.org/content/mimic-cxr/2.1.0/
- ISIC-2019: https://challenge.isic-archive.com/data/#2019
- Brain-Tumor-MRI (Kaggle): https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset
- MedMNIST (Zenodo, incluye PathMNIST, ChestMNIST, DermaMNIST, OCTMNIST, TissueMNIST, BloodMNIST, OrganAMNIST, OrganCMNIST, OrganSMNIST): https://zenodo.org/records/10519652
- Kvasir (Simula): https://datasets.simula.no/kvasir/
- Kvasir (Kaggle): https://www.kaggle.com/datasets/meetnaga
