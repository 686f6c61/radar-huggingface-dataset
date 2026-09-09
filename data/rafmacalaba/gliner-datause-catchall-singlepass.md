# rafmacalaba/gliner-datause-catchall-singlepass

## Resumen

Este modelo, desarrollado por rafmacalaba, es un sistema de token-classification basado en GLiNER para detectar menciones de uso de datos (data-use) en documentos. Se presenta como un "single-pass catch-all cascade": un encoder GLiNER congelado genera propuestas de entidades DATA_MENTION y una cabeza de inferencia nativa (`probe_head`) puntúa cada propuesta para decidir si se conserva o se descarta, todo en una única pasada sobre el documento. El enfoque permite combinar extracción y filtrado sin ejecutar dos modelos separados, lo que simplifica los pipelines de procesamiento documental.

El modelo es un artefacto experimental del proyecto del autor, con licencia Apache-2.0. Su repositorio tiene un tamaño de 1.8 GB e incluye el encoder (`pytorch_model.bin`) y la cabeza (`probe_head.pt`). No se especifica la arquitectura del encoder base, ni la longitud de contexto, los parámetros totales ni los idiomas soportados. La información disponible se centra en su comportamiento sobre seis dominios de origen, con métricas de F1 por dominio y umbrales de retención.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo GLiNER de token-classification con encoder congelado y probe head MLP (modelo base no especificado) |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin`, `probe_head.pt`) con archivos de configuración (`gliner_config.json`, `head_config.json`, `thresholds.json`, `holdout_metrics.json`) |

## Arquitectura y entrenamiento

El modelo es un cascade de un solo paso: el encoder GLiNER, congelado y byte-idéntico a `rafmacalaba/gliner-datause-mentions-catch-all`, genera propuestas de entidades DATA_MENTION a partir de un umbral de propuesta de 0.1. Una cabeza de inferencia (`probe_head.pt`) recibe las características del encoder (input_dim 2048) y produce una puntuación de mantener o descartar (`probe_score`) en la misma pasada. La cabeza tiene un tamaño oculto de 256 y un radio de contexto de 64. Esta combinación permite decidir si una propuesta es válida sin una segunda pasada.

Los datos de entrenamiento no están descritos en la model card. El entrenamiento de la cabeza se realizó con `--feature-source infer`, es decir, usando las características de la salida de inferencia del encoder. Los dominios u orígenes evaluados en la validación son: `fcv_pads_east_africa`, `general_prwp`, `jad_paddy_docs`, `jdc_operational`, `refugee_pads` y `reliefweb`. No se menciona si hubo RLHF, DPO o ajuste fino del encoder.

## Capacidades

- Clasificación de tokens para detectar menciones de uso de datos (DATA_MENTION) y generar una puntuación de keep/drop (`probe_score`) en un solo forward.
- Uso de umbrales configurables: el umbral global recomendado es 0.5 con un F1 de 0.8467; cada origen tiene su umbral óptimo específico.
- Inferencia disponible mediante `training/singlepass_infer.py`, que expone las funciones `load_bundle` y `predict_keep_drop`.
- Soporte para filtrado por puntuación (`keep_thr`) integrado en la propia pasada de inferencia.
- No se documenta soporte para tool calling, agentes, razonamiento multi-paso, generación de texto libre, visión ni audio.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Extracción de menciones de uso de datos en documentos humanitarios: el modelo identifica fragmentos que aluden a cómo se utilizan datos en contextos de refugiados o ayuda. Su enfoque "catch-all" captura menciones no cubiertas por reglas rígidas.
- Filtrado de contenido irrelevante en pipelines de ingesta de noticias: en dominios como `reliefweb`, la puntuación `probe_score` permite descartar párrafos que no mencionan formas de uso de datos, reduciendo el volumen que procesan etapas posteriores.
- Triaje de documentos operativos en entidades de respuesta: con umbrales ajustados por origen (por ejemplo, 0.6 en `jdc_operational`), el modelo puede priorizar documentos que sí contienen información sobre usos de datos relevantes para operaciones.
- Anotación automática de corpus para investigación social: al ser un modelo de token-classification con licencia Apache-2.0, puede integrarse en pipelines de anotación para construir datasets de entrenamiento sobre "data use" en informes de desarrollo.
- Monitorización de patrones de uso de datos en comunicaciones de ONGs: el modelo analiza comunicados de organizaciones (por ejemplo, `refugee_pads`, `reliefweb`) para detectar cambios en cómo se describen las prácticas de datos.
- Sistema de soporte a la revisión documental: un investigador puede usar el modelo para resaltar automáticamente frases con menciones de uso de datos en un texto largo, con la opción de ajustar el umbral de retención para expandir o reducir las propuestas.
- Enriquecimiento de metadatos para buscadores: el modelo etiqueta de forma automática documentos con entidades de tipo DATA_MENTION, mejorando la recuperación en sistemas de búsqueda documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos resultados publicados corresponden a la validación de la cabeza sobre los orígenes del conjunto de prueba, con umbrales óptimos por dominio:

| Origen | Umbral óptimo | F1 |
|---|---|---|
| `fcv_pads_east_africa` | 0.5 | 0.8046 |
| `general_prwp` | 0.4 | 0.8796 |
| `jad_paddy_docs` | 0.1 | 0.9693 |
| `jdc_operational` | 0.6 | 0.8019 |
| `refugee_pads` | 0.5 | 0.8387 |
| `reliefweb` | 0.4 | 0.7738 |

El umbral global recomendado es 0.5, con un F1 de 0.8467 en el conjunto de validación global. No se ofrecen comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 1.8 GB en disco, pero no se especifica la memoria necesaria para la inferencia.
- GPU recomendadas: no disponibles.
- El ejemplo de inferencia de la model card usa CUDA (`'cuda'`), por lo que se requiere al menos una GPU compatible con CUDA, aunque no se indican modelos mínimos.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama, TGI u otros servidores de inferencia. El script de ejemplo usa PyTorch directo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información disponible. No se han publicado resultados de benchmarks estándar que permitan una comparación con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos: no se han evaluado; los datos de entrenamiento podrían contener sesgos propios de los dominios humanitarios y de los orígenes específicos.
- Riesgo de alucinación: en tareas de token-classification, el riesgo principal son los falsos positivos o falsos negativos. La puntuación `probe_score` reduce falsos positivos, pero puede descartar menciones válidas si el umbral es demasiado alto.
- Dependencia de umbrales: el rendimiento varía notablemente por origen; usar un umbral global (0.5) puede no ser óptimo para todos los dominios.
- Limitaciones de idioma: no hay información sobre idiomas soportados; el modelo probablemente está limitado a los documentos de los orígenes evaluados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la model card no incluye atribuciones ni avisos adicionales.
- Modelo experimental: tiene 0 descargas y 0 likes, y está marcado como "probe" en los tags. No se recomienda su uso en producción sin validación previa sobre el dominio objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/rafmacalaba/gliner-datause-catchall-singlepass
- Repositorio relacionado del autor: https://huggingface.co/rafmacalaba/gliner_datause
- Modelo relacionado: https://huggingface.co/rafmacalaba/gliner-datause-displacement
