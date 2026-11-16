# sahithimacharapu2/ec-esm8

## Resumen

ESM-2 35M Enzyme EC Number Classifier es un modelo de clasificación de proteínas desarrollado por el usuario sahithimacharapu2. Consiste en un ajuste fino del backbone ESM-2 de 35 millones de parámetros (facebook/esm2_t12_35M_UR50D) al que se le añade una cabeza clasificadora para predecir el número EC (Enzyme Commission) de una enzima a partir de su secuencia de aminoácidos. El modelo resuelve la tarea de anotación funcional automática de enzimas, un problema relevante en bioinformática porque la determinación experimental de la función enzimática es lenta y costosa, mientras que la secuenciación produce proteínas mucho más rápido de lo que se pueden caracterizar.

El modelo predice números EC de cuatro niveles (por ejemplo, 1.1.1.131) y se evalúa en los cuatro niveles jerárquicos, siendo la métrica principal la precisión en el nivel L4 (el más específico). El vocabulario de salida contiene 6939 números EC válidos y el modelo puede devolver predicciones múltiples por secuencia aplicando un umbral de probabilidad configurable.

Se trata de un artefacto de investigación de tamaño reducido (repo de 0,1 GB, backbone de 35M de parámetros) con licencia MIT, publicado en noviembre de 2026. Su relevancia es la de un modelo ligero y desplegable en contenedor Docker para pipelines de anotación enzimática a escala, aunque no cuenta con descargas ni validación externa en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ESM-2, esm2_t12_35M_UR50D) con cabeza clasificadora MLP |
| Parámetros totales | 35M (backbone ESM-2) + cabeza clasificadora (dimensión oculta 480) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por el tokenizador ESM-2; no especificada en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiqueta de la model card); la entrada real es secuencia de aminoácidos |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone) y PyTorch state_dict `.pt` (cabeza clasificadora `classifier_head.pt`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos componentes: un backbone ESM-2 de 12 capas y 35M de parámetros (hidden size 480) cargado con `EsmModel.from_pretrained(..., add_pooling_layer=False)`, y una cabeza clasificadora secuencial compuesta por `Dropout(0.1) → Linear(480, 480) → GELU → Dropout(0.1) → Linear(480, num_classes)`. El entrenamiento congela las primeras 4 capas del backbone (`n_freeze=4`), según se desprende de la firma del constructor `ESMClassifier(model_name, num_classes, dropout=0.1, n_freeze=4)`. La salida se mapea sobre un vocabulario de 6939 números EC válidos, con una clase de reserva (`fallback_ec`) definida en `classes.json`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones (no aplica en una tarea de clasificación). Tampoco se detalla la estrategia de aumento de datos, el balanceo de clases ni los hiperparámetros de optimización más allá de los valores por defecto del constructor. La innovación técnica es la propia receta de ajuste fino de un backbone proteínico preentrenado para una tarea de clasificación jerárquica multi-etiqueta con umbral de probabilidad configurable (`EC_THRESH`, por defecto 0,5; valor 1,1 para forzar top-1).

## Capacidades

- Clasificación de enzimas: predice el número EC de cuatro niveles (L1 a L4) a partir de una secuencia de aminoácidos.
- Predicción multi-etiqueta: puede devolver varias predicciones por secuencia aplicando un umbral de probabilidad (`EC_THRESH`), útil cuando la especificidad L4 es ambigua.
- Procesamiento por lotes: entrada en formato Parquet con columnas `id` y `sequence`, salida en JSONL con `{"id": "...", "prediction": ["x.x.x.x", ...]}`.
- Control de tiempo de inferencia: variable `EC_TIME_BUDGET` (por defecto 660 segundos) para acotar el cómputo en entornos con restricciones.
- Despliegue en contenedor: incluye Dockerfile y script `predict.py` como punto de entrada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; es un clasificador de secuencias, no un modelo generativo.
- Capacidad multilingüe no aplicable: la entrada es una secuencia de aminoácidos en el alfabeto proteínico, no texto natural.

## Casos de uso

- Anotación funcional a gran escala de proteomas secuenciados: procesar ficheros Parquet con miles de secuencias y obtener predicciones EC en JSONL, apropiado por el bajo coste computacional del backbone de 35M y el procesamiento por lotes (`EC_BATCH=32`).
- Priorización de candidatos en metagenómica: filtrar proteínas de interés por clase EC (por ejemplo, hidrolasas o transferasas) antes de validación experimental, usando la salida multi-etiqueta con umbral ajustable.
- Enriquecimiento de bases de datos de enzimas: asignar números EC tentativos a entradas sin anotación, marcando el nivel L4 solo cuando la probabilidad supera el umbral configurado.
- Integración en pipelines bioinformáticos containerizados: el Dockerfile y las variables de entorno permiten ejecutar el modelo en un paso de un workflow (Snakemake, Nextflow) con límite de tiempo controlado.
- Detección de enzimas con función promiscua o ambigua: el umbral `EC_THRESH` por debajo de 1 permite recuperar predicciones alternativas cuando la secuencia no encaja claramente en una única clase L4.
- Prototipado e investigación académica: modelo ligero (0,1 GB) con licencia MIT que se puede ejecutar en CPU para experimentos de clasificación enzimática sin infraestructura GPU dedicada.
- Comparación de backbones proteínicos: servir como línea base de 35M parámetros frente a variantes mayores de ESM-2 en estudios de escalado para clasificación EC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card define la métrica principal (precisión L4) y menciona evaluación en los cuatro niveles, pero no incluye cifras numéricas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del backbone (35M de parámetros, hidden size 480) es esperable que quepa en menos de 1 GB en precisión FP32, aunque la model card no lo confirma.
- GPU recomendadas: no especificadas; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) sería suficiente, e incluso CPU para lotes moderados.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 2 GB de VRAM, aunque no hay confirmación en la documentación.
- Opciones de despliegue: Docker (proporcionado en el repo), script `predict.py` con `transformers`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de este tipo).
- Latencia y throughput estimados: no disponibles. El único parámetro relacionado es `EC_TIME_BUDGET` (660 s por defecto) y `EC_BATCH` (32), que acotan el cómputo pero no documentan rendimiento medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESM-2 35M EC Classifier (este modelo) | 35M + cabeza | no disponible | Clasificación EC (L1–L4) | MIT | Hugging Face, repo 0,1 GB |
| ESM-2 35M (facebook/esm2_t12_35M_UR50D) | 35M | 1024 tokens (típico en ESM-2) | Embeddings de proteínas (no clasificador EC) | MIT | Hugging Face |
| ESM-2 650M (facebook/esm2_t33_650M_UR50D) | 650M | 1024 tokens (típico en ESM-2) | Embeddings de proteínas; base para clasificadores EC de mayor tamaño | MIT | Hugging Face |
| Modelos especializados de predicción EC (p. ej. CLEAN, DeepEC) | no disponible | no disponible | Predicción EC | variable | Repos académicos |

La comparación se limita a la familia ESM-2 y a clasificadores EC académicos; no se dispone de resultados de benchmarks de este modelo que permitan una comparación cuantitativa de rendimiento con las alternativas.

## Limitaciones y advertencias

- No se han publicado métricas de rendimiento ni validación externa; la calidad de las predicciones L4 es desconocida.
- Riesgo de alucinación en sentido amplio: el clasificador siempre devuelve una o varias clases EC del vocabulario de 6939, incluso para secuencias que no son enzimas, sin mecanismo documentado de rechazo.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento ni el balanceo entre clases EC, por lo que puede haber sesgo hacia clases sobrerrepresentadas.
- Longitud de contexto no especificada: secuencias proteínicas largas pueden truncarse según la configuración del tokenizador ESM-2, con pérdida de información.
- El campo `language: en` de la model card no refleja la naturaleza real de la entrada (secuencia de aminoácidos); no es un modelo de texto natural.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica como artefacto de investigación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de uso o validación por la comunidad.
- La ruta del clon en la model card (`YOUR_USERNAME/enzyme-ec-esm2`) es un marcador de plantilla sin sustituir, lo que puede inducir a error al desplegar.
- La clase de reserva (`fallback_ec`) puede enmascarar predicciones de baja confianza si no se inspecciona la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahithimacharapu2/ec-esm8
- Backbone ESM-2 35M: https://huggingface.co/facebook/esm2_t12_35M_UR50D
