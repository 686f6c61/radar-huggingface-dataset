# originbio/TinyPath

## Resumen

TinyPath es un modelo de visión por computador publicado en HuggingFace por el autor `originbio`, especializado en extracción de características de imágenes de histopatología. Se distribuye como un Vision Transformer (ViT) empaquetado mediante `timm_wrapper` para `transformers`, con 103.630.848 parámetros reales (≈103,6 M) y un repositorio de 0,4 GB en formato `safetensors`. Su pipeline declarado es `image-feature-extraction`, es decir, no genera texto ni predicciones finales: devuelve embeddings de imagen que deben alimentar una cabeza de clasificación, un pipeline de recuperación o un modelo mayor.

El interés del modelo radica en su propuesta de compresión: las etiquetas de la model card incluyen `pruning` (poda) y `knowledge-distillation` (destilación de conocimiento), lo que sugiere que TinyPath busca reproducir el comportamiento de un ViT de patología de mayor tamaño con una fracción de los parámetros, manteniendo un coste de inferencia bajo. Eso lo hace candidato para despliegues en laboratorios con GPUs de gama media o incluso consumer, y para procesar grandes volúmenes de tiles de imágenes de portaobjetos completos (WSI) sin un clúster dedicado.

Ahora bien, la información disponible es muy limitada: no se han proporcionado la model card completa, la ficha de datos de entrenamiento, la dimensión del embedding ni resultados de evaluación. El repositorio tiene 19 descargas y 1 like, el acceso está restringido (gated) y las dos referencias arXiv incluidas en las etiquetas (`2501.16239` y `2608.17872`) no se han podido verificar. Cualquier decisión de adopción en producción debería ir precedida de una evaluación propia sobre el dominio histológico concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con envoltorio `timm_wrapper`; incluye código propio (`custom_code`) |
| Parametros totales | 103.630.848 (≈103,6 M), dato real de `safetensors` |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de vision; no se especifica resolución de entrada ni número de parches) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio solo publica pesos `safetensors` |
| Idiomas soportados | No aplica (modelo de vision, sin procesamiento de lenguaje natural) |
| Licencia | Apache 2.0, con acceso restringido (gated: requiere aceptar condiciones en HuggingFace) |
| Formato de pesos | `safetensors` (repo de 0,4 GB), cargable con `transformers` |

Otros datos: pipeline `image-feature-extraction`; etiquetas `vision`, `image-feature-extraction`, `histopathology`, `pathology`, `vit`, `timm`, `pruning`, `knowledge-distillation`; creado el 2026-10-20 y actualizado el 2026-10-22.

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión al estilo ViT, integrado en `transformers` a través de un envoltorio compatible con `timm` y con código personalizado (`custom_code`), lo que implica que la carga requiere `trust_remote_code=True`. El recuento de parámetros (103,6 M) sitúa al modelo en un rango intermedio entre un ViT-S/16 y un ViT-B/16, aunque no se dispone de la configuración exacta: ni profundidad, ni dimensión oculta, ni número de cabezas, ni tamaño de parche, ni resolución de entrada, ni dimensión del vector de salida están documentados en la información facilitada.

Respecto al entrenamiento, las etiquetas indican poda (`pruning`) y destilación de conocimiento (`knowledge-distillation`), un esquema habitual para comprimir un modelo profesor de patología en un estudiante más pequeño. No se especifican el número de tokens o imágenes de entrenamiento, la composición del dataset, las resoluciones utilizadas, si hubo aumento de datos histológico (variaciones de tinción H&E, escáner, magnificación) ni si se aplicó ajuste supervisado posterior. Tampoco se detalla si el modelo es un encoder puro tipo DINO/MAE o si se destiló desde un modelo con supervisión. Las dos referencias arXiv presentes en las etiquetas (`2501.16239` y `2608.17872`) no han podido contrastarse con los resultados de búsqueda disponibles, por lo que no se puede confirmar que correspondan al artículo de este modelo concreto.

## Capacidades

- Extracción de embeddings de imágenes histológicas: la salida es un vector (o mapa de características) por imagen o tile, utilizable como entrada de clasificadores, pipelines de recuperación o modelos multimodales.
- Representación de imágenes de patología: el modelo está etiquetado explícitamente para `histopathology` y `pathology`, lo que orienta su espacio latente hacia morfología tisular y no hacia imágenes naturales genéricas.
- Compatibilidad con el ecosistema `transformers`/`timm`: carga mediante `AutoModel`/`TimmWrapper` y uso directo en Python.
- Eficiencia por tamaño: 103,6 M de parámetros permiten inferencia en GPUs de gama media y procesamiento por lotes de miles de tiles.
- No soporta generación de texto, razonamiento, código ni matemáticas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No se han documentado modos especiales (thinking mode, audio, vídeo) ni una interfaz zero-shot de clasificación mediante prompts textuales.

## Casos de uso

- Recuperación de imágenes similares en archivos de patología: extraer embeddings de todos los tiles de un archivo de WSI y construir un índice vectorial (FAISS, Milvus) para que un patólogo busque casos morfológicamente parecidos a uno dado. El tamaño reducido del modelo permite indexar retrospectivas de decenas de miles de casos en hardware modesto.
- Clasificación weakly-supervised a nivel de lámina: usar los embeddings por tile como entrada de un modelo de multiple-instance learning (MIL, tipo AttentionMIL o TransMIL) para predecir diagnósticos a partir de la etiqueta global de la biopsia, sin anotaciones a nivel de píxel.
- Triaje y priorización de cargas de trabajo: calcular la distancia de los embeddings de una nueva lámina respecto a prototipos de casos benignos y malignos para ordenar la cola de revisión del patólogo, derivando primero los casos atípicos. Requiere calibrar el umbral con datos locales.
- Control de calidad de preparaciones: detectar tiles con artefactos (desenfoque, burbujas, pliegues de tejido, tinción heterogénea) comparando sus embeddings con los de un conjunto de referencia de calidad conocida, y descartarlos antes de alimentar un modelo diagnóstico.
- Deduplicación y control de fuga de datos en datasets de investigación: agrupar tiles o láminas casi idénticas por similitud de embeddings para eliminar duplicados y garantizar que los conjuntos de entrenamiento y test no compartan especímenes, un problema habitual en cohortes histológicas.
- Codificador visual congelado para modelos visión-lenguaje en patología: emplear los embeddings como proyección visual de un sistema que genere informes o responda preguntas sobre la lámina, congelando TinyPath y entrenando solo el adaptador y el modelo de lenguaje, lo que reduce drásticamente el coste de entrenamiento.
- Procesamiento en el borde o en el laboratorio: al ocupar menos de 0,5 GB en `safetensors`, puede ejecutarse en estaciones de trabajo con una única GPU consumer junto al escáner, sin enviar imágenes fuera del centro (relevante por protección de datos de pacientes).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No constan métricas de validación externa (AUC en Camelyon16/17, TCGA, PatchCamelyon, NCT-CRC-HE, ni tareas de recuperación), ni comparaciones con el modelo profesor del que supuestamente se destila, ni latencia o throughput medidos. Cualquier cifra que se atribuya a este modelo debe obtenerse de una evaluación propia.

## Requisitos de hardware

- VRAM estimada para los pesos: ≈0,41 GB en fp32 (103,6 M × 4 bytes), ≈0,21 GB en fp16/bf16 y ≈0,10 GB en int8. El repositorio ocupa 0,4 GB, coherente con pesos en fp32.
- VRAM realista en inferencia: por debajo de 1-2 GB para lotes pequeños a resolución moderada; el consumo vendrá dominado por las activaciones, que crecen de forma cuadrática con la resolución de la imagen y linealmente con el tamaño de lote.
- GPU recomendadas: cualquier GPU con 4 GB o más es suficiente en la práctica (RTX 3050/4060, T4, L4). Para procesamiento masivo de WSI en paralelo, A100/H100 aportan sobre todo mayor throughput y permiten lotes grandes, no capacidad imprescindible.
- Cabe en GPU consumer: sí, con margen amplio, incluidas GPUs de portátil con 4-6 GB.
- Opciones de despliegue: `transformers` con `timm_wrapper` (requiere `trust_remote_code=True`), `timm` nativo si los pesos son exportables, exportación a ONNX Runtime o TorchScript para inferencia en CPU, y servidores de inferencia genéricos (Triton, TorchServe, FastAPI + batching). vLLM, TGI, llama.cpp y Ollama no son aplicables: están orientados a modelos de lenguaje, no a un encoder ViT de extracción de características.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyPath | ≈103,6 M | Histopatología (declarado) | No disponible | Apache 2.0, acceso gated | HuggingFace, requiere aceptar condiciones |
| ViT-B/16 (referencia generalista) | ≈86 M (dato de literatura pública, no verificado en esta busqueda) | Imágenes naturales (ImageNet) | Resolución de imagen, no aplica contexto textual | Apache 2.0 en la version original de Google | Publico |
| ViT-S/16 (referencia generalista) | ≈22 M (dato de literatura pública, no verificado en esta busqueda) | Imágenes naturales | Igual que el anterior | Apache 2.0 en la version original | Publico |
| Encoders de patología de mayor tamano (familia tipo CTransPath / ViT-B histologico) | No disponible | Histopatología | No disponible | No disponible / verificar por modelo | Variable, varios con acceso restringido |

La comparación cuantitativa de rendimiento no es posible: no hay benchmarks publicados de TinyPath ni métricas homogéneas frente a alternativas. La comparación relevante es de coste: TinyPath ofrece un encoder de ~104 M de parámetros con licencia Apache 2.0, mientras que los encoders histológicos de referencia suelen ser modelos de 86-307 M con licencias variables y, en varios casos, también con acceso restringido. La principal desventaja de TinyPath frente a alternativas consolidadas es la ausencia de validación publicada y su madurez muy baja (19 descargas, 1 like).

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay métricas en ningún conjunto de patología, ni comparación con el profesor de destilación. El rendimiento real es desconocido.
- Sesgos probables por dominio: al no documentarse el dataset de entrenamiento, se desconoce la cobertura de tinciones (H&E frente a IHC), órganos, escáneres, magnificaciones y poblaciones de pacientes. Es esperable un deterioro ante cambios de tinción o de escáner (domain shift) si el entrenamiento fue estrecho.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de embeddings aparentemente plausibles para imágenes fuera de distribución (tejido no histológico, imágenes naturales); conviene validar con detección de OOD antes de usar las representaciones en un pipeline clínico.
- Acceso restringido: el modelo es `gated`, por lo que la descarga y el uso requieren aceptar condiciones en HuggingFace. Es necesario revisar si esas condiciones añaden restricciones adicionales más allá de Apache 2.0 (por ejemplo, sobre uso clínico o redistribución).
- Código personalizado: la etiqueta `custom_code` implica ejecutar código del autor al cargar el modelo (`trust_remote_code=True`). Hay que auditar ese código antes de desplegarlo en entornos de producción.
- Sin capacidades de texto: no puede usarse para clasificación zero-shot mediante prompts, ni para generar informes. Requiere una cabeza supervisada o un modelo multimodal adicional.
- No es un producto sanitario: no consta validación regulatoria (CE, FDA) ni uso clínico previsto. No debe emplearse para decisión diagnóstica sin validación local, supervisión facultativa y evaluación de impacto regulatorio.
- Madurez baja: 19 descargas y 1 like, con dos fechas de creación/actualización muy próximas (20 y 22 de octubre de 2026). No hay evidencia de mantenimiento ni de comunidad.
- Referencias no verificadas: los identificadores arXiv de las etiquetas no se han podido contrastar; no está confirmado que documenten este modelo.
- Resultados de búsqueda no utilizables: la búsqueda web realizada no devolvió ninguna fuente técnico-científica relacionada con el modelo (solo resultados sin relación alguna con TinyPath), por lo que no hay información externa que corrobore la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/originbio/TinyPath
- Referencia arXiv declarada en las etiquetas: https://arxiv.org/abs/2501.16239 (contenido no verificado)
- Referencia arXiv declarada en las etiquetas: https://arxiv.org/abs/2608.17872 (contenido no verificado)
- Perfil del autor: https://huggingface.co/originbio
- Repositorio `timm` (envoltorio usado por el modelo): https://github.com/huggingface/pytorch-image-models

Nota: no se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
