# sahithimacharapu2/ec-esm4

## Resumen

ESM-2 35M Enzyme EC Number Classifier es un modelo de clasificación de proteínas desarrollado por el usuario sahithimacharapu2 y publicado en Hugging Face. Consiste en un ajuste fino del backbone ESM-2 de 35 millones de parámetros (facebook/esm2_t12_35M_UR50D) sobre la tarea de predicción del número EC (Enzyme Commission) a partir de secuencias de aminoácidos. El modelo toma una secuencia proteica y predice su número EC de cuatro niveles (por ejemplo, `1.1.1.131`), una taxonomía estándar que clasifica las enzimas según la reacción química que catalizan.

El modelo resuelve un problema clásico de anotación funcional en bioinformática: la asignación automática de función enzimática a proteínas cuya función no ha sido caracterizada experimentalmente. Frente a aproximaciones basadas en alineamiento de secuencias (BLAST, HMMER) o similitud estructural, un clasificador basado en un transformer de proteínas aprende representaciones contextuales de la secuencia que capturan señales funcionales más allá de la homología directa.

Se trata de un modelo pequeño (repositorio de 0,1 GB, backbone de 35M de parámetros) pensado para inferencia eficiente y despliegue en contenedor Docker. La evaluación se realiza a los cuatro niveles de la jerarquía EC, con la precisión en nivel L4 como métrica principal. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (esm2_t12_35M_UR50D) con cabeza clasificadora MLP |
| Parametros totales | 35M (backbone) + cabeza clasificadora (no disponible el total exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ESM-2 35M soporta hasta 1022 residuos, segun el modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada; la entrada son secuencias de aminoacidos, no texto natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone) y PyTorch state_dict (cabeza clasificadora, classifier_head.pt) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas: un backbone ESM-2 de 35M de parámetros (12 capas, dimensión oculta de 480) preentrenado en secuencias proteicas, seguido de una cabeza clasificadora compuesta por dropout (0,1), una capa lineal de 480 a 480, activación GELU, otro dropout y una capa lineal final hacia el número de clases EC. Durante el ajuste fino se congelan las 4 primeras capas del backbone (parámetro `n_freeze=4`), según se desprende del código de arquitectura incluido en la model card.

La salida se mapea sobre un vocabulario de 6939 números EC válidos (`ec_vocabulary.json`), con una lista de clases L4 y un `fallback_ec` definido en `classes.json`. La inferencia permite umbralizar predicciones adicionales mediante `EC_THRESH` (por defecto 0,5; valor 1,1 para top-1 estricto). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en una tarea de clasificación supervisada).

## Capacidades

- Clasificación de secuencias de aminoácidos en números EC de cuatro niveles (L1 a L4).
- Predicción top-1 y predicciones adicionales por umbral de probabilidad configurable.
- Procesamiento por lotes (`EC_BATCH`, por defecto 32) con presupuesto de tiempo de inferencia (`EC_TIME_BUDGET`, por defecto 660 segundos).
- Entrada en formato Parquet con columnas `id` y `sequence`; salida en JSONL con `id` y lista de predicciones.
- Despliegue reproducible mediante Docker con variables de entorno configurables.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingüe no aplicable: la entrada son secuencias proteicas, no lenguaje natural.

## Casos de uso

- Anotación funcional a gran escala de genomas y metagenomas: dado un conjunto de secuencias proteicas en Parquet, el modelo asigna números EC de forma masiva, permitiendo priorizar candidatos para validación experimental en lugar de recurrir a búsquedas de homología exhaustivas.
- Curación de bases de datos enzimáticas: integración en pipelines de anotación (por ejemplo, UniProt o bases de datos internas) para rellenar o contrastar el campo EC de entradas sin anotación experimental, usando el umbral `EC_THRESH` para controlar la precisión frente al recall.
- Descubrimiento de enzimas en datos de metagenómica: clasificación de proteínas de comunidades microbianas no cultivadas, donde la homología con enzimas caracterizadas puede ser baja y un clasificador basado en representaciones contextuales aporta señal complementaria.
- Enrutamiento en pipelines de biología computacional: uso como primer filtro para decidir qué secuencias merecen análisis más costosos (modelado estructural con AlphaFold, docking, simulaciones), aprovechando su bajo coste computacional (35M de parámetros).
- Docencia y prototipado en bioinformática: el repositorio incluye Dockerfile, script de inferencia y código de arquitectura, lo que facilita reproducir el flujo completo en un entorno controlado sin gestionar dependencias manualmente.
- Evaluación comparativa de métodos de anotación: al definir una interfaz de entrada/salida estandarizada (Parquet a JSONL) y un presupuesto de tiempo, sirve como baseline reproducible frente a métodos basados en alineamiento en benchmarks internos de clasificación EC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define la métrica principal (precisión en nivel L4) y menciona evaluación en los cuatro niveles (L1–L4), pero no incluye cifras de rendimiento ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con un backbone de 35M de parámetros en precisión completa (FP32) el modelo ocupa del orden de 140 MB de pesos, y en FP16 alrededor de 70 MB, más el overhead de activaciones durante el procesamiento por lotes.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; tarjetas consumer como RTX 3060, RTX 4060 o superiores son más que adecuadas. También funciona en CPU para lotes moderados, aunque con mayor latencia.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el repositorio proporciona un Dockerfile con `predict.py` como punto de entrada; el backbone es compatible con la librería `transformers` (EsmModel), por lo que puede servirse también con frameworks estándar de PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un clasificador de este tipo).
- Latencia y throughput estimados: no disponibles de forma publicada; el parámetro `EC_TIME_BUDGET` (660 segundos por defecto) y `EC_BATCH` (32) sugieren que el diseño está pensado para procesar lotes grandes dentro de un presupuesto de tiempo acotado en entornos de evaluación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESM-2 35M Enzyme EC Classifier (este modelo) | 35M (backbone) | no disponible | Clasificacion EC (L1–L4) | MIT | Hugging Face |
| ESM-2 35M base (facebook/esm2_t12_35M_UR50D) | 35M | 1022 residuos | Representaciones proteicas (no clasifica EC directamente) | MIT | Hugging Face |
| ESM-2 650M (facebook/esm2_t33_650M_UR50D) | 650M | 1022 residuos | Representaciones proteicas; requiere cabeza especifica para EC | MIT | Hugging Face |
| CLEAN (MLP sobre embeddings ESM) | no disponible | no aplica | Clasificacion EC (contrastivo) | no disponible | Publicacion y repositorio |

La comparación directa con clasificadores EC publicados (por ejemplo, CLEAN o variantes de DeepEC) no puede establecerse con cifras porque este modelo no publica resultados de benchmarks. Frente al ESM-2 base, la diferencia es que este checkpoint incluye una cabeza entrenada específicamente para EC; frente a modelos mayores como ESM-2 650M, ofrece un coste computacional mucho menor a cambio de una capacidad representacional inferior.

## Limitaciones y advertencias

- No se han publicado métricas de rendimiento (precisión L1–L4), por lo que no es posible evaluar su calidad predictiva frente a alternativas sin ejecutar una validación propia.
- Riesgo de sesgo hacia las clases EC sobrerrepresentadas en el dataset de entrenamiento (no documentado); las clases poco frecuentes del vocabulario de 6939 números EC pueden tener un rendimiento muy inferior.
- Riesgo de alucinación en sentido clasificatorio: el modelo siempre emite una o varias predicciones dentro del vocabulario, incluso para secuencias sin actividad enzimática conocida o fuera de distribución; el umbral `EC_THRESH` mitiga parcialmente este problema, pero no lo elimina.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (16 de noviembre de 2026): no hay evidencia de uso, validación externa ni mantenimiento.
- La model card referencia rutas y nombres de usuario genéricos (`YOUR_USERNAME/enzyme-ec-esm2`, `/app/predict.py`), lo que sugiere que el paquete puede requerir ajustes para su reproducción tal cual.
- La etiqueta de idioma `en` es engañosa: el modelo no procesa texto natural; su entrada son secuencias de aminoácidos.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No disponible información sobre la composición del dataset de entrenamiento, el número de tokens vistos ni el proceso de selección de negativos, lo que dificulta evaluar la generalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahithimacharapu2/ec-esm4
- Modelo base ESM-2 35M: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Modelo base ESM-2 650M (referencia): https://huggingface.co/facebook/esm2_t33_650M_UR50D
