# gbouras13/modernprost-50M

## Resumen

ModernProst-50M es un modelo de extracción de características y predicción estructural para proteínas desarrollado por gbouras13 (publicado en Hugging Face). Su función es predecir, a partir de la secuencia de aminoácidos exclusivamente, las secuencias del alfabeto estructural 3Di (20 estados) y del alfabeto de 12 estados que utiliza Foldseek. El objetivo es sustituir a las estructuras predichas como consultas o dianas en búsquedas de similitud estructural, evitando el coste computacional de predecir la estructura 3D completa.

El modelo tiene 52.555.936 parámetros (aproximadamente 50M) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la gama ligera para inferencia en CPU o GPU de consumo. Se distribuye en formato safetensors con código personalizado (`trust_remote_code=True`) bajo el pipeline de `feature-extraction` de transformers. La tokenización es un token por residuo, sin tokens BOS/EOS.

En noviembre de 2026 se añadió un cabezal opcional de predicción de pLDDT por residuo (199K parámetros) entrenado sobre el backbone congelado, que permite estimar la confianza estructural de cada posición sin modificar los pesos ni el código del modelo base. La licencia no está especificada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modernprost_3di12st), código personalizado en transformers |
| Parámetros totales | 52.555.936 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de proteínas, no de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenización | un token por residuo, sin BOS/EOS |
| Cabezales de salida | 3Di (20 estados), 12st (12 estados), pLDDT opcional (199K parámetros) |
| Dataset de entrenamiento | gbouras13/ModernProst-3di12st |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder identificado en los tags como `modernprost_3di12st`, con decodificación por residuo y dos cabezales de clasificación paralelos: uno sobre el alfabeto 3Di de 20 estados (ACDEFGHIKLMNPQRSTVWY) y otro sobre el alfabeto de 12 estados (ACDEFGHIKLMN). La entrada es la secuencia de aminoácidos en crudo, sin estructura ni información evolutiva explícita, lo que convierte al modelo en un predictor end-to-end de representaciones estructurales discretas.

El entrenamiento se realizó sobre el dataset `gbouras13/ModernProst-3di12st`, cuya composición y número de tokens no se detallan en la información disponible. No se especifica si hubo RLHF, DPO ni otras etapas de alineación (habitualmente innecesarias en modelos de proteínas). La innovación principal es la predicción directa de alfabetos estructurales tipo Foldseek a partir de secuencia, lo que permite generar consultas y dianas para búsqueda estructural sin pasar por un predictor de estructura 3D. El cabezal pLDDT añadido en noviembre de 2026 lee todas las capas del encoder congelado y se entrenó sobre 18.000 proteínas retenidas (5,16M residuos) usando etiquetas pLDDT de AFDB, ColabFold y BFVD.

## Capacidades

- Predicción de secuencias 3Di de 20 estados a partir de secuencia de aminoácidos, por residuo.
- Predicción de secuencias del alfabeto estructural de 12 estados (12st).
- Extracción de representaciones (feature extraction) del backbone congelado.
- Predicción opcional de pLDDT por residuo (0-100) mediante cabezal auxiliar de 199K parámetros.
- Procesamiento por lotes con padding mediante el tokenizer incluido.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües de lenguaje natural: es un modelo especializado en proteínas.
- No incluye visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Búsqueda estructural masiva sin predicción 3D: generar secuencias 3Di directamente desde aminoácidos y usarlas como consulta en Foldseek, evitando ejecutar un predictor de estructura como AlphaFold o ESMFold para cada proteína del conjunto.
- Anotación funcional a escala de metagenomas: procesar millones de secuencias traducidas y obtener representaciones estructurales discretas para agrupar proteínas por plegamiento putativo antes de la anotación.
- Filtrado de calidad de modelos estructurales: usar el cabezal pLDDT para estimar la confianza por residuo de una secuencia y descartar regiones desordenadas o mal modeladas antes de análisis posteriores.
- Construcción de índices de búsqueda estructural internos: indexar bases de datos propias en el alfabeto 3Di o 12st con un coste de inferencia bajo (modelo de 50M parámetros, 0,2 GB).
- Detección de homólogos remotos: combinar la representación 3Di predicha con búsquedas Foldseek para identificar relaciones estructurales que la similitud de secuencia no revela.
- Preprocesamiento en pipelines de plegamiento: enriquecer entradas de modelos de estructura con señales 3Di y pLDDT previas, como características adicionales o como filtro de regiones de baja confianza.
- Docencia y experimentación: modelo ligero para reproducir el flujo secuencia → alfabeto estructural en entornos con recursos limitados (CPU o una única GPU de consumo).

## Benchmarks y rendimiento

El único conjunto de métricas publicado en la información disponible corresponde al cabezal pLDDT, evaluado sobre 18.000 proteínas retenidas (5,16M residuos) con etiquetas pLDDT de AFDB, ColabFold y BFVD, en el paso 28.000:

| Métrica | Valor |
|---|---|
| RMSE | 10,32 |
| MAE | 6,82 |
| Pearson | 0,879 |
| Pearson por proteína | 0,880 |
| AUROC pLDDT < 70 | 0,954 |
| AUROC pLDDT < 50 | 0,966 |

No se han publicado resultados de benchmarks de predicción 3Di/12st (precisión por residuo, recall estructural, comparación con Foldseek sobre estructuras reales) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los pesos (52,5M parámetros, unos 210 MB); el pico real depende de la longitud de secuencia y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y probablemente sobredimensionadas para el modelo base.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para lotes moderados.
- Opciones de despliegue: transformers con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son motores orientados a modelos de lenguaje y no aplican directamente a este modelo con código personalizado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernProst-50M | 52,5M | no disponible | Predicción 3Di/12st desde secuencia | no disponible | Hugging Face |
| gbouras13/modernprost-50M-pssm | no disponible | no disponible | Perfiles PSSM predichos (variante del mismo autor) | no disponible | Hugging Face |
| Foldseek (herramienta) | no aplica | no aplica | Búsqueda estructural sobre estructuras 3D | no disponible en esta ficha | Binario/herramienta |
| ESMFold / AlphaFold | cientos de millones a miles de millones | no disponible | Predicción de estructura 3D completa | no disponible en esta ficha | Público |

La comparación con ESMFold o AlphaFold es funcional, no equivalente: ModernProst no predice coordenadas 3D, sino alfabetos estructurales discretos, por lo que su coste computacional es órdenes de magnitud menor. No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está especificada: no se puede asumir uso comercial sin consultar al autor.
- No hay benchmarks publicados de precisión de las predicciones 3Di/12st, solo del cabezal pLDDT; el rendimiento real en búsqueda estructural es desconocido.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de usarlo en producción.
- La tokenización es un token por residuo sin BOS/EOS; un uso incorrecto del tokenizer (por ejemplo, añadir tokens especiales) puede degradar las predicciones.
- El cabezal pLDDT se entrenó con etiquetas de predictores (AFDB, ColabFold, BFVD), no con valores experimentales, por lo que hereda sus sesgos y errores sistemáticos.
- No se documentan sesgos por composición del dataset de entrenamiento ni cobertura taxonómica; el dataset `ModernProst-3di12st` no está descrito en detalle.
- Es un modelo especializado: no debe emplearse para tareas de lenguaje natural, y no ofrece tool calling ni razonamiento multi-paso.
- El repositorio tiene 75 descargas y 0 likes en el momento de la consulta, lo que indica validación comunitaria muy limitada.
- La fecha de creación indicada (2026-07-27) y la actualización (2026-11-02) deben verificarse contra el repositorio antes de citarlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gbouras13/modernprost-50M
- Variante con perfiles PSSM: https://huggingface.co/gbouras13/modernprost-50M-pssm
- Dataset de entrenamiento: https://huggingface.co/datasets/gbouras13/ModernProst-3di12st
- Foldseek (herramienta de búsqueda estructural): https://github.com/steineggerlab/foldseek
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
