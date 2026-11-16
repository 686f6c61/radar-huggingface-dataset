# aronvandepol/visual-feature-discovery

## Resumen

`aronvandepol/visual-feature-discovery` es un conjunto de pesos entrenados para clasificar páginas escaneadas de publicaciones periódicas coreanas de la época colonial según la imprenta que las produjo. Distingue cuatro clases: 대동인쇄소, 신문관, 조선인쇄 주식회사 y 한성도서 주식회사. El modelo acompaña al artículo de van de Pol, Prokic y Mol (2026) publicado en *Computational Humanities Research*, centrado en el descubrimiento interpretable de rasgos visuales mediante multiple instance learning (MIL).

No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un artefacto de investigación para humanidades digitales: clasificación de imágenes de documentos históricos. El repositorio es un espejo de los pesos; el archivo citable con metadatos del dataset, definiciones de folds y ficheros de embeddings y clústeres está en Zenodo, y el código en GitHub.

El interés técnico reside en la comparación entre un modelo MIL con atención (AttriMIL) y baselines de visión estándar (ConvNeXtV2 Base y Swin S3 Base 224) bajo un protocolo de evaluación estricto por libro no visto (GroupKFold), que evita la fuga de información entre páginas del mismo volumen. El repositorio ocupa 6,5 GB y contiene cinco folds por cada configuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AttriMIL (multiple instance learning con atención sobre parches), ConvNeXtV2 Base (timm) y Swin S3 Base 224 (timm) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada por parches de 16x16 o 8x8, o página completa a 896x896) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en fp32/estado original) |
| Idiomas soportados | no disponible (dominio: documentos históricos en coreano) |
| Licencia | CC-BY-4.0 (pesos); MIT (código) |
| Formato de pesos | `.pth` (checkpoints PyTorch Lightning con `state_dict`, `hyper_parameters`, `epoch`) |

## Arquitectura y entrenamiento

El repositorio incluye tres familias de modelos. AttriMIL opera con multiple instance learning: la página se divide en parches (16x16 con stride 8, o 8x8 con stride 4) y un mecanismo de atención agrega las representaciones de los parches para producir la clasificación, lo que permite identificar qué regiones visuales sustentan la decisión. ConvNeXtV2 Base procesa la página completa a 896x896 píxeles, y Swin S3 Base 224 trabaja sobre recortes de página que contienen solo texto. Los dos últimos son modelos `timm` estándar envueltos en un módulo Lightning (`LightningTIMM`).

El entrenamiento se evalúa bajo dos protocolos: GroupKFold por libro no visto (held-out book) y KFold aleatorio por página. El protocolo estricto es el primero, porque evita que páginas del mismo volumen aparezcan en entrenamiento y validación. Los datos provienen de la colección Hyundam Mun'go (antes Adan Mungo) y no se redistribuyen; el fichero `dataset_metadata.parquet` de Zenodo enlaza el catálogo de cada una de las 57.583 páginas. Cada `.pth` es el mejor checkpoint de su fold por pérdida de validación, sin estado del optimizador.

## Capacidades

- Clasificación de imágenes de páginas escaneadas en cuatro clases de imprenta colonial coreana.
- Descubrimiento interpretable de rasgos visuales mediante atención sobre parches (AttriMIL).
- Procesamiento de página completa a 896x896 (ConvNeXtV2) o de recortes de texto a 224x224 (Swin S3).
- Evaluación robusta con separación por libro (GroupKFold) y por página (KFold).
- No soporta tool calling, agentes, generación de texto ni razonamiento multi-paso.
- No es multilingüe en sentido general; está especializado en un corpus histórico coreano concreto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fundacionales.

## Casos de uso

- Atribución de imprenta en proyectos de historia del libro: dado un escaneo de página, el modelo devuelve una de las cuatro clases, útil para catalogación asistida de colecciones coloniales coreanas.
- Investigación en humanidades digitales: AttriMIL permite inspeccionar los pesos de atención para localizar qué rasgos tipográficos o de composición discriminan entre imprentas.
- Validación de metodología MIL: sirve como referencia reproducible para comparar MIL con baselines convolucionales y transformers en clasificación de documentos históricos.
- Docencia y reproducción de resultados: los checkpoints por fold permiten replicar las cifras del artículo sin reentrenar.
- Filtrado previo en pipelines de digitalización: clasificación rápida de páginas para separar fondos por origen de impresión antes de un análisis más profundo.
- Estudio de generalización: el protocolo held-out book permite medir cuánto degrada el rendimiento al cambiar de volumen, útil para diseñar particiones en otros corpus.

## Benchmarks y rendimiento

Precisión media de cinco folds con desviación estándar muestral, según el artículo.

| Modelo | Libro no visto (held-out book) | Aleatorio por página (page-random) |
|---|---:|---:|
| AttriMIL 16x16, stride 8 | 84,52 ± 2,19 % | no disponible |
| AttriMIL 8x8, stride 4 | 83,60 ± 3,24 % | no disponible |
| ConvNeXtV2 Base | 81,98 ± 2,40 % | 98,05 ± 0,24 % |
| Swin S3 Base 224 | 84,11 ± 1,81 % | 98,15 ± 0,17 % |

La columna relevante es la de libro no visto: bajo partición aleatoria por página, páginas del mismo libro caen a ambos lados del split y los baselines suben unos 14 puntos, lo que infla artificialmente el resultado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los checkpoints AttriMIL pesan 12 MB cada uno, ConvNeXtV2 Base 351 MB y Swin S3 Base 282 MB, por lo que la inferencia cabe holgadamente en GPU consumer.
- GPU recomendadas: cualquier GPU con suficiente memoria para el tamaño de entrada; ConvNeXtV2 a 896x896 exige más memoria que Swin a 224x224, pero no se especifican cifras.
- Cabe en GPU consumer: sí, por el tamaño de los pesos; la resolución de entrada es el factor limitante, no el número de parámetros.
- Opciones de despliegue: PyTorch con las clases del repositorio de código (`LightningAttriMIL`, `LightningTIMM`) y `timm` para los baselines; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Libro no visto | Licencia |
|---|---|---|---:|---|
| AttriMIL 16x16, stride 8 | MIL con atención | parches 16x16, stride 8 | 84,52 ± 2,19 % | CC-BY-4.0 |
| AttriMIL 8x8, stride 4 | MIL con atención | parches 8x8, stride 4 | 83,60 ± 3,24 % | CC-BY-4.0 |
| ConvNeXtV2 Base | CNN (timm) | página 896x896 | 81,98 ± 2,40 % | CC-BY-4.0 |
| Swin S3 Base 224 | Transformer (timm) | recortes de texto 224x224 | 84,11 ± 1,81 % | CC-BY-4.0 |

No se dispone de comparación con otros modelos de clasificación de documentos históricos fuera de este conjunto.

## Limitaciones y advertencias

- Especializado en un corpus muy concreto (periódicos coreanos coloniales de la colección Hyundam Mun'go) y en cuatro imprentas; no generaliza a otros dominios sin reentrenamiento.
- El protocolo aleatorio por página infla el rendimiento en torno a 14 puntos; usar solo la métrica held-out book para evaluaciones realistas.
- Los datos de imagen no se redistribuyen, lo que limita la reproducibilidad completa sin acceso a la colección original.
- Riesgo de sesgo derivado de la composición del corpus y de la sobrerrepresentación de ciertas imprentas o volúmenes.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza en páginas atípicas.
- Licencia CC-BY-4.0 en pesos y MIT en código: permite uso comercial con atribución, pero conviene verificar las condiciones de las imágenes originales.
- No hay información sobre idiomas soportados ni sobre cuantizaciones; los checkpoints son específicos de PyTorch Lightning.

## Enlaces

- Hugging Face: https://huggingface.co/aronvandepol/visual-feature-discovery
- Artículo: https://doi.org/10.1017/chr.2026.10036
- Zenodo (archivo citable): https://doi.org/10.5281/zenodo.20015055
- Código: https://github.com/aronvandepol/visual-feature-discovery
