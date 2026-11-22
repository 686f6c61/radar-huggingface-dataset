# brunoasm/vit_large_patch32_224.NCBI_SRA

## Resumen

El modelo `brunoasm/vit_large_patch32_224.NCBI_SRA` es un clasificador de imágenes basado en Vision Transformer (ViT-Large/32) entrenado por Bruno A. S. de Medeiros para la identificación universal de especies mediante ADN. Forma parte del proyecto varKoder, que transforma datos de secuenciación genómica de baja cobertura (a partir de 10 Mbp) en representaciones bidimensionales (varKodes y rfCGRs) que una red neuronal puede clasificar. El modelo se ha entrenado sobre todos los taxones disponibles en el NCBI Sequence Read Archive (SRA), cubriendo procariotas y eucariotas.

La arquitectura parte de `timm/vit_large_patch32_224.orig_in21k`, un ViT-Large con parches de 32×32 píxeles e imágenes de entrada de 224×224, inicializado con pesos aleatorios (no con los pesos preentrenados de ImageNet-21k) y entrenado con la librería fastai. Cuenta con 334.869.475 parámetros y realiza clasificación multi-etiqueta, devolviendo predicciones taxonómicas con puntuaciones de confianza junto con metadatos de plataforma de secuenciación y tipo de librería.

Su relevancia radica en que permite identificar especies a partir de datos genómicos mínimos, con un 96 % de precisión y un 95 % de recall según la model card, lo que lo hace útil para eDNA, monitorización de biodiversidad, forense y autenticación de especies con recursos de secuenciación muy limitados. El modelo se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Large, patch 32, resolución 224×224) |
| Parametros totales | 334.869.475 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto; entrada de 224×224 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas y metadatos en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (weights-only + JSON de config), pickle fastai (`model.pkl`), checkpoint timm (`config.json` + `model.safetensors` / `pytorch_model.bin`) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de la familia ViT-Large con parches de 32×32 píxeles sobre imágenes de 224×224 RGB, derivado de la arquitectura `timm/vit_large_patch32_224.orig_in21k`. A diferencia del modelo base, se inicializó con pesos aleatorios y se entrenó desde cero con fastai sobre las representaciones de imagen generadas por varKoder. La entrada no aplica normalización (`"normalize": null` en `varkoder_config.json`).

El entrenamiento se realizó sobre todos los taxones presentes en el NCBI Sequence Read Archive (SRA), con cobertura universal de procariotas y eucariotas, y validación en conjuntos diversos de hongos, plantas, animales y bacterias, con pruebas sobre más de 1.100 familias de distintos reinos. El modelo se entrena con clasificación multi-etiqueta para manejar la incertidumbre taxonómica y también aprende propiedades como la plataforma de secuenciación y el tipo de librería. Los conjuntos de datos y metadatos completos están disponibles en Harvard Dataverse (DOI: 10.7910/DVN/IMOX0S). No se especifica en la información disponible el número exacto de tokens, composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un clasificador de imágenes).

## Capacidades

- Clasificación de imágenes de firmas genómicas (varKodes y rfCGRs) para identificación de especies.
- Predicción taxonómica multi-etiqueta con puntuaciones de confianza, en formato `Taxonomy_{rank}:{ID}.{name}` (por ejemplo, `Taxonomy_family:7042.Curculionidae`).
- Predicción de metadatos de secuenciación: plataforma (por ejemplo, `Platform:ILLUMINA`) y tipo de librería (por ejemplo, `LibraryStrategy:WGS`).
- Identificación universal a través del árbol de la vida: procariotas y eucariotas, incluyendo hongos, plantas, animales y bacterias.
- Funcionamiento con datos genómicos de cobertura extremadamente baja (aproximadamente 0,0002×–0,107×; desde unos 10 Mbp).
- Robustez frente a distintas plataformas de secuenciación.
- Soporte de ajuste fino (fine-tuning) sobre imágenes etiquetadas propias mediante `varKoder train`.
- No dispone de tool calling, capacidades de agente, generación de texto ni razonamiento multi-paso; es un clasificador de imágenes especializado.

## Casos de uso

- Identificación de especies a partir de genome skimming de baja cobertura: se procesan lecturas crudas con `varKoder query reads_folder/ results/` y el modelo devuelve etiquetas taxonómicas con confianza; es adecuado porque funciona con tan solo 10 Mbp de datos.
- Análisis de ADN ambiental (eDNA): a partir de muestras de agua, suelo o aire secuenciadas con baja profundidad, el modelo clasifica las firmas genómicas para inventariar biodiversidad sin necesidad de secuenciación profunda.
- Forense y autenticación de especies: identificación de origen taxonómico de muestras biológicas o productos (por ejemplo, pescado o madera) usando datos genómicos mínimos.
- Monitorización de biodiversidad a gran escala: procesamiento por lotes de muchas muestras con recursos de secuenciación limitados, gracias a la tolerancia del modelo a coberturas muy bajas.
- Control de calidad y diagnóstico de secuenciación: las predicciones de `Platform` y `LibraryStrategy` permiten detectar problemas de protocolo o plataforma que podrían reducir la precisión de la identificación.
- Ajuste fino para taxones o protocolos propios: `varKoder train images_folder/ my_model/` permite adaptar el modelo a un conjunto etiquetado específico, útil en laboratorios con especies de interés local.
- Investigación en genómica comparada: generación de varKodes y rfCGRs a partir de lecturas crudas para explorar firmas genómicas entre taxones.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas globales de identificación de especies:

| Metrica | Valor |
|---|---|
| Precision (identificación de especies) | 96 % |
| Recall (identificación de especies) | 95 % |
| Cobertura genómica soportada | ~0,0002×–0,107× |
| Datos mínimos requeridos | ~10 Mbp |
| Familias evaluadas | más de 1.100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no son aplicables a este modelo de clasificación de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 334,9 M de parámetros en fp32 el modelo ocupa aproximadamente 1,3 GB de pesos, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp32; para entrenamiento o ajuste fino se recomienda una GPU con 16 GB o más (por ejemplo, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: varKoder (versión 1.8.0 o superior con safetensors; 1.7 y anteriores con `model.pkl`), fastai, timm (`timm.create_model("hf-hub:brunoasm/vit_large_patch32_224.NCBI_SRA")`) y PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. Como referencia arquitectónica, el modelo se basa en `timm/vit_large_patch32_224.orig_in21k`, del que difiere en inicialización (aleatoria frente a preentrenamiento en ImageNet-21k) y en la tarea (clasificación de firmas genómicas frente a clasificación de imágenes naturales).

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brunoasm/vit_large_patch32_224.NCBI_SRA | 334,9 M | 224×224 px | Clasificación de firmas genómicas | Apache 2.0 | Hugging Face |
| timm/vit_large_patch32_224.orig_in21k | ~304 M (ViT-L/32) | 224×224 px | Clasificación de imágenes naturales | Apache 2.0 | timm / Hugging Face |
| Alternativas específicas de DNA barcoding | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dependencia de la representación de los datos de entrenamiento: la precisión puede degradarse si las imágenes de entrada (varKodes o rfCGRs) se generan con parámetros distintos a los del entrenamiento.
- Precisión reducida con muestras de ADN altamente degradado, según la model card.
- Menor precisión en identificaciones a nivel de especie con secuenciación Nanopore de alta tasa de error, tal como advierte la propia model card.
- El modelo está entrenado sobre datos del NCBI SRA, por lo que los taxones ausentes de esa base de datos no estarán representados en las etiquetas.
- Riesgo de falsos positivos o asignaciones taxonómicas erróneas en muestras con cobertura extremadamente baja o contaminación; las predicciones son multi-etiqueta con confianza y deben interpretarse con cautela.
- Idioma: las etiquetas y metadatos están en inglés; no es un modelo multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda citar las dos publicaciones asociadas (Scientific Data 2025 y Nature Ecology & Evolution 2025).
- El archivo `model.pkl` es un pickle de fastai que puede ejecutar código arbitrario al cargarse y solo funciona con `fastai<2.8`; se recomienda usar los archivos safetensors.
- No es un modelo de propósito general: no genera texto, no razona y no soporta tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brunoasm/vit_large_patch32_224.NCBI_SRA
- Proyecto varKoder (GitHub): https://github.com/brunoasm/varKoder
- Documentación de `query`: https://github.com/brunoasm/varKoder/blob/main/docs/query.md
- Documentación de `train`: https://github.com/brunoasm/varKoder/blob/main/docs/train.md
- Dataset y metadatos (Harvard Dataverse): https://doi.org/10.7910/DVN/IMOX0S
- Artículo del dataset (Scientific Data, 2025): https://doi.org/10.1038/s41597-025-05230-2
- Artículo del método (Nature Ecology & Evolution, 2025): https://doi.org/10.1038/s41559-025-02752-1
- Modelo base en timm: https://huggingface.co/timm/vit_large_patch32_224.orig_in21k
- NCBI Taxonomy: https://www.ncbi.nlm.nih.gov/taxonomy
