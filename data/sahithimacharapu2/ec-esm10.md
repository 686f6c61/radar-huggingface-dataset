# sahithimacharapu2/ec-esm10

## Resumen

ec-esm10 es un clasificador de números EC (Enzyme Commission) construido mediante fine-tuning del backbone ESM-2 de 35 millones de parámetros (facebook/esm2_t12_35M_UR50D) sobre la tarea de predecir la clasificación enzimática de cuatro niveles a partir de secuencias de aminoácidos. Lo publica el usuario sahithimacharapu2 en Hugging Face bajo licencia MIT, con un repositorio de aproximadamente 0,1 GB que incluye los pesos del backbone, la cabeza clasificadora ajustada y un pipeline de inferencia basado en Docker.

El modelo resuelve un problema concreto de bioinformática: dada una secuencia proteica, asignarle un código EC en formato `x.x.x.x` (por ejemplo, `1.1.1.131`), evaluando la precisión en los cuatro niveles jerárquicos y tomando como métrica principal la accuracy en L4. La cabeza clasificadora opera sobre el vocabulario de 6939 números EC válidos incluido en el repositorio, con un mecanismo de umbral de probabilidad que permite devolver predicciones adicionales más allá de la top-1.

Es relevante por su enfoque práctico de despliegue: el repositorio incorpora Dockerfile, script de predicción sobre Parquet/JSONL, variables de entorno para controlar el presupuesto temporal de inferencia, el tamaño de batch y el umbral de probabilidad, lo que facilita su integración en pipelines de anotación funcional de proteínas. No obstante, la información pública disponible es muy limitada: no hay resultados de benchmarks publicados, ni detalles sobre el dataset de entrenamiento, ni cifras de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ESM-2) con cabeza clasificadora MLP |
| Parametros totales | 35M en el backbone ESM-2 (tamano de la cabeza clasificadora no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por el backbone ESM-2 de 35M; valor exacto no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos; la tarea es sobre secuencias de aminoacidos, no texto natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone ESM-2) y PyTorch state_dict (`classifier_head.pt`) |

## Arquitectura y entrenamiento

El modelo combina un backbone ESM-2 de 35M parámetros (`EsmModel` con `add_pooling_layer=False`, dimensión oculta de 480) con una cabeza clasificadora secuencial compuesta por dropout (0,1), una capa lineal de 480 a 480, activación GELU, otro dropout y una capa lineal final de 480 al número de clases EC. El código de entrenamiento incluido en la model card especifica el parámetro `n_freeze=4`, lo que sugiere que se congelaron las primeras cuatro capas del encoder durante el fine-tuning, aunque no se detalla el resto de la configuración de entrenamiento.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF/DPO (poco probables en una tarea de clasificación supervisada) ni innovaciones técnicas adicionales. El repositorio incluye un vocabulario de 6939 números EC válidos (`ec_vocabulary.json`), una lista de clases L4 con un `fallback_ec` y metadatos de hiperparámetros en `weights/meta.json`. La evaluación se realiza en los cuatro niveles jerárquicos (L1–L4) con accuracy L4 como métrica principal.

## Capacidades

- Clasificación de enzimas: predice el número EC de cuatro niveles (`x.x.x.x`) a partir de una secuencia de aminoácidos.
- Predicción multi-etiqueta opcional: mediante el umbral `EC_THRESH` (por defecto 0,5) puede devolver predicciones adicionales más allá de la top-1; con `EC_THRESH=1.1` se fuerza solo la top-1.
- Procesamiento por lotes: entrada en formato Parquet con columnas `id` y `sequence`, salida en JSONL con una línea por entrada.
- Control de presupuesto temporal: variable `EC_TIME_BUDGET` (por defecto 660 segundos) para limitar el tiempo máximo de inferencia.
- Integración en contenedores: Dockerfile incluido para despliegue reproducible.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling, agentes ni multilingüismo; el modelo es un clasificador de secuencias biológicas, no un modelo de lenguaje generativo.

## Casos de uso

- Anotación funcional de proteínas a escala genómica: dado un conjunto de secuencias en Parquet, el pipeline (`predict.py`) genera predicciones EC en JSONL por lotes, adecuado para procesar proteomas completos con control de tiempo vía `EC_TIME_BUDGET`.
- Enriquecimiento de bases de datos biológicas: asignar números EC a entradas sin anotación en bases de datos de enzimas, usando el vocabulario de 6939 clases válidas para mantener consistencia terminológica.
- Priorización en pipelines de descubrimiento de enzimas: filtrar candidatos por clase EC predicha (por ejemplo, hidrolasas o transferasas) antes de validación experimental, aprovechando la salida jerárquica L1–L4.
- Análisis de metagenomas: clasificar secuencias codificantes de comunidades microbianas para inferir el perfil funcional enzimático, con la ventaja de que el modelo de 35M es ligero y desplegable en contenedor.
- Herramienta de apoyo en laboratorio: integración como servicio interno que recibe secuencias y devuelve la predicción EC con umbral configurable, útil para investigadores que necesitan una primera hipótesis funcional.
- Evaluación comparativa de pipelines de anotación: servir como baseline reproducible (Docker + Parquet/JSONL) frente a otros clasificadores EC en experimentos de benchmark.
- Docencia y prototipado: al ser un modelo pequeño con licencia MIT y despliegue sencillo, es adecuado para demostraciones de fine-tuning de ESM-2 en cursos de bioinformática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card define la accuracy L4 como métrica principal y menciona evaluación en los cuatro niveles (L1–L4), pero no incluye cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un backbone de 35M parámetros en fp32 ocupa aproximadamente 140 MB, y en fp16 unos 70 MB, más el espacio de activaciones para batch de 32 (valor por defecto de `EC_BATCH`). No se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se especifican modelos concretos en la documentación.
- Cabe en GPU consumer: sí, con amplio margen (GTX 1660, RTX 3060, RTX 4090, etc.), así como en CPU para lotes moderados.
- Opciones de despliegue: Docker (incluido en el repositorio) con `predict.py`; al usar `transformers` y safetensors, es compatible con stacks basados en PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos generativos, no aplicables directamente a este clasificador).
- Latencia y throughput: no disponibles. El único parámetro relacionado es `EC_TIME_BUDGET=660` segundos como límite máximo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ec-esm10 (este modelo) | 35M (backbone) | no disponible | Clasificacion EC (L1–L4) | MIT | Hugging Face, repo 0,1 GB |
| ESM-2 35M (facebook/esm2_t12_35M_UR50D) | 35M | no disponible | Embeddings de proteinas (preentrenamiento) | MIT | Hugging Face |
| ESM-2 650M (facebook/esm2_t33_650M_UR50D) | 650M | no disponible | Embeddings de proteinas (preentrenamiento) | MIT | Hugging Face |
| Modelos especializados de prediccion EC | no disponible | no disponible | Clasificacion EC | no disponible | no disponible |

La comparación con alternativas específicas de clasificación EC no está disponible en la información proporcionada. Frente al backbone ESM-2 35M sin fine-tuning, este modelo añade la cabeza clasificadora y el vocabulario EC; frente a ESM-2 650M, ofrece un coste computacional mucho menor a cambio de una capacidad de representación presumiblemente inferior (sin datos que lo confirmen).

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad predictiva ni compararla con alternativas; la métrica L4 se define pero no se reporta.
- Información de entrenamiento opaca: se desconoce el dataset, el número de tokens, la composición taxonómica y el balance de clases, lo que impide estimar sesgos hacia clases EC frecuentes.
- Riesgo de sesgo hacia enzimas bien caracterizadas: los vocabularios EC están dominados por clases de organismos modelo, por lo que las predicciones pueden ser menos fiables en proteínas de linajes poco representados.
- Riesgo de alucinación en sentido clasificatorio: el modelo siempre asigna alguna clase del vocabulario de 6939 números EC, incluso para secuencias no enzimáticas o fuera de distribución; no se documenta una clase de rechazo.
- Contexto y tokenización: al ser un modelo ESM-2, las secuencias muy largas pueden truncarse; el límite exacto no se especifica en la información disponible.
- Idioma: los metadatos indican `en`, pero la tarea opera sobre secuencias de aminoácidos; no hay capacidades multilingües de texto natural.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni se documenta procedencia de los datos de entrenamiento, lo que puede tener implicaciones de cumplimiento en entornos regulados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por la comunidad.
- La model card contiene referencias a rutas genéricas (`YOUR_USERNAME/enzyme-ec-esm2`) y a un script externo (`/app/predict.py`), lo que sugiere que el repositorio puede requerir ajustes antes de su uso directo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahithimacharapu2/ec-esm10
- Backbone ESM-2 35M: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Repositorio de referencia citado en la model card (placeholder del autor): https://huggingface.co/YOUR_USERNAME/enzyme-ec-esm2
- Paper de ESM-2 (Lin et al., 2022): no disponible en la información proporcionada
- Blog o demo del autor: no disponible
