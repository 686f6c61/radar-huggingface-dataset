# sahithimacharapu2/ec-esm5

## Resumen

ESM-2 35M Enzyme EC Number Classifier es un modelo de clasificación de proteínas desarrollado por el usuario sahithimacharapu2 y publicado en Hugging Face. Consiste en un ajuste fino (fine-tuning) del backbone ESM-2 de 35 millones de parámetros de Meta (facebook/esm2_t12_35M_UR50D), al que se le añade una cabeza clasificadora para predecir el número EC (Enzyme Commission) de una enzima a partir de su secuencia de aminoácidos. El modelo resuelve una tarea concreta y bien delimitada: la anotación funcional automática de enzimas en cuatro niveles jerárquicos (L1 a L4), siendo la métrica principal la precisión en el nivel L4.

La relevancia del modelo radica en su tamaño reducido (35M de parámetros, aproximadamente 0,1 GB de repo) y su licencia MIT, lo que lo hace ligero y fácilmente desplegable en entornos con recursos limitados. El vocabulario de salida cubre 6939 números EC válidos, lo que refleja un espacio de etiquetas amplio y jerárquico. El modelo se distribuye junto con un pipeline de inferencia completo basado en Docker y scripts de Python, orientado a la ejecución por lotes sobre ficheros Parquet.

No obstante, se trata de un modelo de publicación muy reciente y con escasa tracción: cero descargas y cero likes en el momento de redactar esta ficha, sin pipeline declarado en Hugging Face y sin resultados de benchmarks publicados en la información disponible. Su uso está claramente orientado a la investigación en bioinformática y a la clasificación funcional de proteínas, no a tareas de generación de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (12 capas, hidden size 480) con cabeza clasificadora MLP |
| Parametros totales | Aproximadamente 35 millones (backbone ESM-2 35M) más la cabeza clasificadora |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del tokenizador ESM-2; el modelo base soporta hasta 1022 residuos, dato no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors y classifier_head.pt; no se documentan cuantizaciones) |
| Idiomas soportados | Inglés (metadato `language: en`); la entrada real es secuencia de aminoácidos, no texto natural |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone ESM-2) y PyTorch state_dict (.pt) para la cabeza clasificadora |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos componentes. El backbone es un ESM-2 de 35M de parámetros (EsmModel de Hugging Face, 12 capas, hidden size 480) cargado con `add_pooling_layer=False`. Sobre él se aplica una cabeza clasificadora secuencial compuesta por Dropout (0,1), una capa Linear de 480 a 480, activación GELU, otro Dropout (0,1) y una capa Linear final de 480 a `num_classes`. El código de entrenamiento indica que se congelan las primeras 4 capas del backbone (`n_freeze=4`), un esquema habitual de ajuste fino parcial para reducir coste y evitar sobreajuste en modelos pequeños.

La tarea es de clasificación multietiqueta sobre el espacio de números EC: el vocabulario `ec_vocabulary.json` contiene 6939 números EC válidos, y `classes.json` define la lista de clases L4 junto con un `fallback_ec`. La inferencia permite devolver predicciones adicionales por encima de un umbral de probabilidad (`EC_THRESH`, por defecto 0,5), lo que sugiere un enfoque multietiqueta con top-1 y predicciones extra. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (poco probables en una tarea de clasificación supervisada).

## Capacidades

- Clasificación de enzimas por número EC a cuatro niveles jerárquicos (L1–L4), con la precisión en L4 como métrica principal.
- Predicción multietiqueta: devuelve una o varias etiquetas EC según el umbral de probabilidad configurable.
- Procesamiento por lotes de secuencias de aminoácidos desde ficheros Parquet (`id`, `sequence`) con salida JSONL.
- Extracción de representaciones del backbone ESM-2 (hidden size 480) potencialmente reutilizable para otras tareas de proteínas, aunque no se documenta explícitamente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un clasificador de secuencias, no un modelo generativo.
- Capacidades multilingües no aplicables: la entrada es una secuencia de aminoácidos en notación de una letra.

## Casos de uso

- Anotación funcional automática de proteínas en pipelines de genómica: dado un conjunto de secuencias proteicas en un fichero Parquet, el modelo predice el número EC de cada una y genera un JSONL con las etiquetas, integrándose directamente en flujos bioinformáticos existentes.
- Curación de bases de datos de enzimas: uso como primer filtro para asignar números EC a proteínas sin anotar antes de la revisión manual por expertos, reduciendo el volumen de trabajo de anotación.
- Clasificación de metagenomas: procesar secuencias predichas a partir de ensamblajes metagenómicos para inferir el perfil enzimático de una comunidad microbiana.
- Detección de enzimas con actividad enzimática de interés industrial: cribado de bibliotecas de secuencias para identificar candidatos con números EC concretos (por ejemplo, hidrolasas o transferasas) antes de ensayos experimentales.
- Enriquecimiento de anotaciones en pipelines de aprendizaje automático: generar etiquetas EC para conjuntos de datos de proteínas que alimenten modelos posteriores o análisis de enriquecimiento funcional.
- Despliegue en contenedores para evaluación comparativa: el repositorio incluye Dockerfile y variables de entorno (`EC_TIME_BUDGET`, `EC_BATCH`, `EC_THRESH`) que permiten ejecutar el modelo de forma reproducible en entornos de benchmark o en infraestructura con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, por debajo de 1 GB en FP32 para el backbone de 35M de parámetros más la cabeza clasificadora; en la práctica, cualquier GPU consumer moderna es suficiente.
- GPU recomendadas: no se requieren GPU de datacenter; el modelo cabe holgadamente en tarjetas como RTX 3060, RTX 4090 o incluso en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; también es viable en CPU.
- Opciones de despliegue: el repositorio proporciona un Dockerfile con `predict.py` como punto de entrada; al estar basado en `transformers`, puede cargarse con la librería estándar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de este tipo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; el parámetro `EC_TIME_BUDGET` (660 s por defecto) y `EC_BATCH` (32) indican que el autor prevé ejecuciones por lotes con un presupuesto de tiempo acotado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESM-2 35M Enzyme EC Classifier (este modelo) | ~35M | No disponible | Clasificación EC (L1–L4) | MIT | Hugging Face, repo 0,1 GB |
| ESM-2 35M base (facebook/esm2_t12_35M_UR50D) | 35M | Hasta 1022 residuos (modelo base) | Representaciones de proteínas (sin cabeza EC) | MIT | Hugging Face |
| ESM-2 150M (facebook/esm2_t30_150M_UR50D) | 150M | Hasta 1022 residuos (modelo base) | Representaciones de proteínas (sin cabeza EC) | MIT | Hugging Face |

No se dispone de información sobre otros clasificadores EC comparables en la documentación proporcionada, por lo que la comparativa se limita a los backbones ESM-2 de referencia.

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes: no hay evidencia de validación independiente ni de uso en producción.
- No se publican resultados de benchmarks ni métricas de precisión L4, pese a que la model card define L4 como métrica principal; no es posible evaluar su calidad real.
- Riesgo de alucinación en sentido estricto no aplicable (es un clasificador), pero sí riesgo de predicciones incorrectas o de baja confianza en números EC poco representados en el vocabulario de 6939 clases.
- La model card no documenta la composición del dataset de entrenamiento, el número de secuencias ni el esquema de partición train/validation, lo que impide evaluar posibles sesgos de anotación o desbalance de clases.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni sobre la idoneidad para aplicaciones críticas.
- El idioma declarado es inglés, pero la entrada es una secuencia de aminoácidos; la limitación real es la longitud máxima de secuencia soportada por el tokenizador ESM-2, no documentada explícitamente en la model card.
- El repositorio incluye rutas de ejemplo con `YOUR_USERNAME` en las instrucciones de Docker, lo que sugiere que la documentación no está completamente adaptada al repositorio final.
- La fecha de creación (2026-11-16) es posterior a la fecha habitual de redacción de fichas, lo que puede indicar una publicación muy reciente o un metadato anómalo; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahithimacharapu2/ec-esm5
- Modelo base ESM-2 35M: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Repositorio de ejemplo citado en la model card (Docker): https://huggingface.co/YOUR_USERNAME/enzyme-ec-esm2 (referencia de la model card, no verificada)
