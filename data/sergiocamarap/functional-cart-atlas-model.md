# sergiocamarap/Functional-cart-atlas-model

## Resumen

El modelo `sergiocamarap/Functional-cart-atlas-model` es un modelo de integración de datos de expresión génica de célula única (scRNA-seq) entrenado con la librería scvi-tools, concretamente con la clase `SCVI`. Lo desarrolla el usuario sergiocamarap en el contexto del proyecto Functional CAR-T Cell Atlas, y su función es proporcionar una representación latente integrada de un atlas de células CAR-T que permita corregir efectos de lote entre 182 lotes experimentales distintos.

El modelo resuelve el problema clásico de integración de datos scRNA-seq: eliminar la variabilidad técnica introducida por distintos experimentos, productos o condiciones de captura, preservando la señal biológica. Se ha entrenado sobre 414.619 células y 2.000 genes, con una arquitectura de autoencoder variacional (VAE) de dos capas ocultas de 128 neuronas y un espacio latente de 30 dimensiones.

Es relevante ahora porque los atlas de células CAR-T están proliferando y la comunidad necesita modelos preentrenados reutilizables para proyectar nuevos datasets sobre una referencia común, sin tener que reentrenar desde cero. La ficha del autor indica que el manuscrito asociado está en preparación y que el modelo se distribuye con licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder variacional (VAE) scVI: 2 capas ocultas de 128 neuronas, latente normal de 30 dimensiones, dropout 0.1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de integración de expresión génica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (datos genómicos, no lenguaje natural) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | pesos nativos de scvi-tools (checkpoint `.pt`/directorio de modelo); AnnData asociado en `.h5ad` (~15,5 GB) alojado en Zenodo |

## Arquitectura y entrenamiento

El modelo es un `SCVI` de scvi-tools, es decir, un autoencoder variacional condicionado por lote. La configuración declarada incluye `n_hidden=128`, `n_latent=30`, `n_layers=2`, `dropout_rate=0.1`, `dispersion="gene"`, `gene_likelihood="nb"` (verosimilitud binomial negativa por gen) y `latent_distribution="normal"`. El modelo se ajustó sobre la capa `counts` de un AnnData con `batch_key="Product_norm"` (182 lotes) y una covariable categórica adicional `orig_ident`.

Los datos de entrenamiento cubren 414.619 células y 2.000 genes, con 182 lotes, una etiqueta y una covariable categórica extra. El AnnData de entrenamiento (`scVI_hub_adata.h5ad`, ~15,5 GB) está alojado en Zenodo (DOI 10.5281/zenodo.17213452) y el código de entrenamiento en el repositorio GitHub del proyecto. No se especifica en la información disponible el número de épocas, el número de tokens (no aplica) ni si hubo fases de ajuste fino adicionales. La carga del modelo se verificó en un entorno con Python 3.11.9, PyTorch 2.8.0+cu128, scvi-tools 1.3.3, anndata 0.11.4, mudata 0.3.8, NumPy 1.26.4 y pandas 1.5.3, sobre una GPU NVIDIA L40S.

## Capacidades

- Integración de datos scRNA-seq: corrección de efectos de lote entre 182 lotes mediante el espacio latente de 30 dimensiones.
- Proyección de nuevos datasets: permite mapear células nuevas sobre la referencia entrenada para comparaciones y análisis downstream.
- Extracción de representaciones latentes: genera embeddings de 30 dimensiones utilizables para clustering, UMAP, vecinos más cercanos y análisis de trayectorias.
- Modelado de expresión génica: verosimilitud binomial negativa por gen, adecuada para datos de conteo con sobredispersión.
- Normalización e imputación implícita: el decoder permite reconstruir expresiones esperadas a partir del latente.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye etiquetas celulares anotadas (`annotated:False`), por lo que no realiza clasificación celular supervisada.

## Casos de uso

- Integración de cohortes CAR-T multi-centro: usar el modelo para corregir el efecto de lote entre productos y orígenes de donante, obteniendo un embedding común para comparar subpoblaciones celulares entre estudios.
- Proyección de nuevos experimentos sobre el atlas de referencia: cargar un AnnData nuevo con los mismos 2.000 genes y usar `model.get_latent_representation()` para situar las células nuevas en el espacio latente del atlas.
- Análisis de estados de agotamiento y activación en células CAR-T: emplear el latente para clustering y marcadores diferenciales entre estados funcionales, aprovechando que el modelo ya ha absorbido la variabilidad técnica.
- Construcción de atlas de referencia para pipelines de descubrimiento de biomarcadores: usar la representación integrada como entrada a modelos downstream de clasificación o regresión de fenotipos.
- Evaluación de calidad y detección de outliers: detectar células con baja verosimilitud bajo el modelo para filtrar artefactos antes de análisis biológicos.
- Reproducibilidad de análisis publicados: al estar el AnnData y el código disponibles, permite reproducir exactamente los embeddings del atlas para validaciones independientes.
- Transferencia de etiquetas desde un atlas anotado a nuevos datasets: aunque el modelo no está anotado, su latente sirve como base para k-NN o clasificadores supervisados externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de integración (scIB, kBET, LISI, silueta), ni comparaciones cuantitativas con otros métodos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de la arquitectura (2 capas de 128 neuronas, latente de 30) el modelo es muy ligero, pero la carga del AnnData de entrenamiento (~15,5 GB) y la proyección de 414.619 células requieren memoria RAM/VRAM considerable.
- GPU recomendadas: el autor verificó la carga en una NVIDIA L40S; cualquier GPU con suficiente memoria para el dataset (A100, H100, L40S, RTX 4090 con 24 GB) debería ser suficiente para inferencia por lotes.
- GPU de consumo: probablemente viable en RTX 3090/4090 (24 GB) si se procesa el dataset por subconjuntos; no confirmado en la información disponible.
- Opciones de despliegue: scvi-tools (Python), con PyTorch como backend; no aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sergiocamarap/Functional-cart-atlas-model | scVI (VAE) | no disponible | no aplica | CC-BY-4.0 | Hugging Face |
| scVI genérico (scvi-tools) | VAE | configurable | no aplica | BSD-3-Clause (software) | pip / GitHub |
| scANVI (scvi-tools) | VAE semisupervisado | configurable | no aplica | BSD-3-Clause (software) | pip / GitHub |
| CellTypist / referencias celulares | Clasificador logístico | no disponible | no aplica | MIT (software) | pip / GitHub |

La comparación cuantitativa de rendimiento con estas alternativas no está disponible en la información proporcionada; el modelo destaca por estar especializado en el dominio CAR-T y por publicar su AnnData de entrenamiento.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se ha entrenado sobre 182 lotes y un conjunto concreto de productos CAR-T; su comportamiento en otros contextos biológicos o plataformas no está validado.
- Riesgo de sobreintegración: como todo scVI, un ajuste agresivo del efecto de lote puede eliminar señal biológica real; conviene validar con métricas de conservación biológica.
- Limitación de vocabulario génico: solo cubre 2.000 genes; los datasets nuevos deben restringirse a ese conjunto antes de la proyección.
- Sin anotaciones: `annotated:False` implica que no hay etiquetas celulares; no debe usarse como clasificador directo.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; conviene revisar los términos del AnnData en Zenodo y del código en GitHub, que pueden tener licencias distintas.
- Caveat de producción: el script de ejemplo borra la caché al arrancar y puede volver a descargar los ~15,5 GB del AnnData; conviene cachear manualmente en entornos de producción.
- Manuscrito en preparación: no hay publicación revisada por pares que respalde el modelo, por lo que su validación independiente es aún limitada.
- Sin benchmarks publicados: no es posible comparar su calidad de integración con alternativas de forma objetiva a partir de la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiocamarap/Functional-cart-atlas-model
- Datos de entrenamiento (Zenodo): https://doi.org/10.5281/zenodo.17213452
- Código de entrenamiento (GitHub): https://github.com/ML4BM-Lab/Functional-cart-atlas
- Script de descarga scVI-hub: https://github.com/ML4BM-Lab/Functional-cart-atlas/blob/main/Article/5_Atlas_Sharing/scVI-hub/scVI-hub_Download.py
- Documentación de scvi-tools: https://docs.scvi-tools.org
