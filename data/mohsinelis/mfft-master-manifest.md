# MohsinElis/mfft-master-manifest

## Resumen

El repositorio `MohsinElis/mfft-master-manifest` no contiene un modelo de IA, sino el manifiesto de particionado canónico de un benchmark forense de imágenes sintéticas. Se trata de un fichero JSON (`manifest/split_manifest.json`) que define de forma determinista e inmutable la asignación de 120.000 imágenes a los conjuntos de entrenamiento, validación y test del benchmark utilizado en el artículo "Multi-Frequency Fusion Transformer: Robust and Computationally Efficient AI-Generated Image Forensics Across Generator Architectures", publicado en Elsevier Machine Learning with Applications (MLWA).

El manifiesto acompaña al modelo MFFT (Multi-Frequency Fusion Transformer), una arquitectura de detección de imágenes generadas por IA y deepfakes que combina análisis en el dominio de la frecuencia con un transformer. El repositorio permite reproducir exactamente el benchmark: cada nodo de entrenamiento distribuido consume las mismas 84.000 imágenes de entrenamiento y valida sobre las mismas 18.000 de test, eliminando la deriva de datos y la fuga de información entre particiones.

Es relevante para investigadores en forense de imágenes porque proporciona una partición criptográficamente congelada (con hashes SHA-256 del contenido y del fichero), agrupación por identidad y vídeo para evitar contaminación, y subconjuntos leave-one-generator-out (LOGO) para evaluar la transferencia a generadores no vistos. El tamaño del repositorio es de 0,5 GB, lo que corresponde al manifiesto y metadatos, no a las imágenes en sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es un manifiesto de dataset, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos y documentación) |
| Licencia | MIT |
| Formato de pesos | JSON (manifiesto); no hay pesos en este repositorio |

Especificaciones del benchmark definido por el manifiesto:

| Parametro | Valor |
|---|---|
| Total de imagenes | 120.000 |
| Balance de clases | 50,0% reales (60.000) / 50,0% IA y deepfake (60.000) |
| Particion de entrenamiento (70%) | 84.000 imagenes |
| Particion de validacion (15%) | 18.000 imagenes |
| Particion de test reservada (15%) | 18.000 imagenes |
| Semilla de particion | 42 |
| SHA-256 del contenido del manifiesto | `e8db1a7249ef22fbf9fcb6e6659e9ecc5ebbc5d81430a268fce26546f23bdde2` |
| SHA-256 del fichero | `dcba81ed490e6a9ab965fdce903a77a46f9d5d8763b0fe81d612ff41422d800e` |
| Version del esquema | 1.0 |
| Categoria de tamano | 100K < n < 1M |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red neuronal; define el esquema de datos sobre el que se entrena y evalúa MFFT. El manifiesto es un JSON con los campos `version`, `created_at`, `created_by_worker`, `seed`, `total_images`, `class_counts`, `split_sizes`, `manifest_sha256`, `samples` y `split_indices`. Cada entrada de `samples` es una tupla `[ruta_relativa_de_imagen, etiqueta]`, con `label = 0` para imagen real y `label = 1` para imagen generada por IA o deepfake. `split_indices` contiene los índices enteros explícitos de cada partición.

La composición del benchmark abarca 12 shards que cubren fotografía natural y paradigmas generativos diversos (GAN, difusión con eliminación de ruido, difusión latente, síntesis autorregresiva y deepfakes de vídeo facial). Los shards principales son `places365` (51.610 imágenes reales), `artifact-dataset` (41.364 generadas con más de 25 familias de generadores: StyleGAN1/2/3, ProGAN, BigGAN, CycleGAN, StarGAN, GauGAN, CIPS, DDPM, difusión latente, GLIDE, VQ-Diffusion, entre otras), `ntire2026` (7.692), `dfdc-faces-of-the-train-sample` (5.850 deepfakes), `genimage-ai` (5.071), `celebdf-v2image-dataset` (4.803), `stable-diffusion` (1.611), `faceforensics` (953), `mfft-real` (683), `dall-e3` (294), `midjourney` (54) y `open-images-v7-dataset` (15).

El diseño anti-contaminación incluye tres garantías: agrupación por vídeo e identidad (los fotogramas de un mismo vídeo o sujeto quedan confinados a una única partición), particionado determinista indexado por hash SHA-256 de contenido (cada nodo distribuido entrena y valida sobre exactamente las mismas imágenes) y subconjuntos leave-one-generator-out (`dall-e3`, `logo_holdout_gan`, `logo_holdout_diffusion`, `logo_holdout_deepfake`) para medir la transferencia fuera de distribución a algoritmos de síntesis no vistos. El nombre del modelo asociado, Multi-Frequency Fusion Transformer, sugiere fusión de características en múltiples bandas de frecuencia con un transformer, pero la información proporcionada no detalla la arquitectura interna, el número de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Definición reproducible de un benchmark de clasificación binaria imagen real frente a imagen generada por IA o deepfake.
- Particionado determinista con semilla fija (42) e índices explícitos por partición.
- Verificación de integridad mediante SHA-256 del contenido y del fichero del manifiesto.
- Agrupación por identidad y por vídeo para evitar fuga de información en datasets de deepfakes faciales.
- Subconjuntos leave-one-generator-out para evaluar generalización a generadores no vistos.
- Cobertura de más de 25 familias de generadores GAN, difusión y autorregresivos, además de deepfakes de vídeo.
- Esquema JSON documentado y versionado (versión 1.0) apto para consumo programático en pipelines distribuidos.
- Etiquetado binario explícito (`0` real, `1` sintética) por muestra.
- No incluye capacidades de generación de texto, código, matemáticas, visión directa, tool calling ni razonamiento multi-paso: es un artefacto de datos, no un modelo generativo.

## Casos de uso

- Reproducción de experimentos de forense de imágenes: cargar `manifest/split_manifest.json` y verificar el hash SHA-256 antes de entrenar, de modo que cualquier resultado publicado con MFFT pueda replicarse bit a bit sobre las mismas 84.000 imágenes de entrenamiento.
- Entrenamiento distribuido multi-nodo sin deriva de datos: cada worker lee `split_indices` y entrena exclusivamente sobre los índices asignados a `train`, garantizando que todos los nodos ven el mismo conjunto y que la validación usa los mismos 18.000 ejemplos.
- Evaluación de detección de deepfakes faciales: usar los shards `dfdc-faces-of-the-train-sample`, `celebdf-v2image-dataset` y `faceforensics` con la agrupación por identidad ya aplicada para medir detección de manipulación facial sin contaminación entre train y test.
- Estudio de generalización a generadores no vistos: emplear los subconjuntos LOGO (`dall-e3`, `logo_holdout_gan`, `logo_holdout_diffusion`, `logo_holdout_deepfake`) como test fuera de distribución para cuantificar la caída de rendimiento frente a generadores conocidos.
- Auditoría de integridad de datasets: comparar el SHA-256 del fichero y del contenido con los valores publicados para detectar modificaciones accidentales o maliciosas en copias espejo del benchmark.
- Comparación justa entre detectores: cualquier investigador puede evaluar su propio detector sobre la partición de test reservada de 18.000 imágenes y comparar resultados con MFFT bajo idéntica distribución y balance 50/50.
- Construcción de pipelines de CI para investigación reproducible: integrar la verificación del manifiesto en un job de integración continua que falle si el hash no coincide con el canónico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia el artículo en Elsevier MLWA, pero no incluye tablas de métricas (exactitud, AUC, F1) ni comparaciones numéricas con otros detectores.

## Requisitos de hardware

- El repositorio (0,5 GB) contiene el manifiesto y metadatos; su descarga y verificación de hash requieren únicamente CPU y disco, sin GPU.
- Para ejecutar el modelo MFFT asociado no hay datos de VRAM, GPU recomendadas ni cuantizaciones en la información disponible.
- El benchmark completo de 120.000 imágenes no está incluido en este repositorio; el almacenamiento necesario para las imágenes depende de los shards originales referenciados (places365, artifact-dataset, DFDC, Celeb-DF v2, FaceForensics++, GenImage, NTIRE 2026, entre otros) y no se especifica en la información proporcionada.
- Opciones de despliegue del manifiesto: cualquier entorno capaz de leer JSON (Python, Rust, Go, Node.js); no aplican vLLM, llama.cpp, Ollama ni TGI porque no hay pesos de modelo.
- Latencia y throughput: no disponibles; el coste dominante es la lectura y verificación de hashes del manifiesto, no la inferencia.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo sino un manifiesto de benchmark; la comparación relevante sería con otros benchmarks forenses de imágenes sintéticas (por ejemplo, las particiones oficiales de GenImage, Artifact o NTIRE), pero la información proporcionada no incluye sus especificaciones ni resultados comparables.

## Limitaciones y advertencias

- No es un modelo: no genera texto, código ni imágenes, y no puede usarse para inferencia directa de detección sin el checkpoint correspondiente (referenciado en `MohsinElis/mfft-checkpoints`, no incluido aquí).
- El manifiesto contiene rutas absolutas de un entorno concreto (`/kaggle/input/datasets/...`); es necesario remapear las rutas a la estructura local antes de usarlo.
- El repositorio no incluye las imágenes: sin acceso a los shards originales, el manifiesto es inutilizable para entrenamiento.
- Los shards están muy desbalanceados entre sí (`places365` aporta 51.610 de las 60.000 imágenes reales, mientras que `midjourney` aporta solo 54); el rendimiento por generador puede estar dominado por las fuentes mayoritarias.
- Los conjuntos LOGO (`dall-e3` con 294 imágenes, `midjourney` con 54) son pequeños para estimaciones de transferencia con intervalos de confianza estrechos.
- Riesgo de sobreajuste a las fuentes de datos concretas: aunque el benchmark cubre más de 25 generadores, no representa necesariamente la distribución de generadores futuros.
- Sesgos potenciales en los datos subyacentes (places365, Celeb-DF, FaceForensics++) no están documentados en la información disponible; los deepfakes faciales pueden presentar sesgos demográficos heredados de los datasets de origen.
- La licencia MIT se aplica al manifiesto; las licencias de las imágenes subyacentes dependen de cada dataset de origen y deben verificarse por separado antes de uso comercial.
- El campo `created_at` del manifiesto (2026-09-28) y las fechas del repositorio (creado 2026-09-13, actualizado 2026-11-20) deben tratarse con cautela; verificar la coherencia con la versión publicada del artículo antes de citar.
- No hay garantía de mantenimiento: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Repositorio del manifiesto en Hugging Face: https://huggingface.co/MohsinElis/mfft-master-manifest
- Checkpoints del modelo MFFT: https://huggingface.co/MohsinElis/mfft-checkpoints
- Repositorio del proyecto y artículo: https://github.com/MIHMahmudEli/mfft-workspace
- Artículo: "Multi-Frequency Fusion Transformer: Robust and Computationally Efficient AI-Generated Image Forensics Across Generator Architectures", Elsevier Machine Learning with Applications (MLWA); enlace directo no disponible en la información proporcionada.
