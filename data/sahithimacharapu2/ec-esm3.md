# sahithimacharapu2/ec-esm3

## Resumen

ESM-2 35M Enzyme EC Number Classifier es un modelo de clasificación de proteínas desarrollado por el usuario sahithimacharapu2 y publicado en Hugging Face. Consiste en un ajuste fino (fine-tuning) del backbone ESM-2 de 35 millones de parámetros de Meta (facebook/esm2_t12_35M_UR50D) sobre la tarea de predicción del número EC (Enzyme Commission) a partir de secuencias de aminoácidos. El modelo predice la clasificación en cuatro niveles jerárquicos (L1 a L4), siendo la métrica principal la precisión en el nivel L4.

El modelo aborda un problema clásico en bioinformática: la anotación funcional automática de enzimas. Dado que la determinación experimental del número EC es costosa y lenta, un clasificador que opere directamente sobre la secuencia primaria permite acelerar la curaduría de bases de datos como UniProt o BRENDA. El vocabulario de salida contiene 6939 números EC válidos, lo que convierte la tarea en una clasificación multiclase de gran cardinalidad.

Se trata de un modelo pequeño (35M de parámetros, repositorio de 0,1 GB) orientado a inferencia eficiente y despliegue en contenedor Docker, con licencia MIT. La relevancia actual radica en su bajo coste computacional y en la inclusión de un pipeline de inferencia reproducible (entrada Parquet, salida JSONL) pensado para entornos de benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ESM-2, 12 capas) con cabeza de clasificación MLP |
| Parametros totales | 35M (backbone ESM-2 35M) + cabeza de clasificación |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ESM-2 35M soporta secuencias de hasta 1022 residuos, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y classifier_head.pt) |
| Idiomas soportados | en (la tarea es sobre secuencias de aminoácidos, no texto natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone ESM-2) y PyTorch state_dict (.pt) para la cabeza |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas: un backbone ESM-2 de 35M de parámetros (12 capas, dimensión oculta de 480) que genera representaciones contextuales de la secuencia de aminoácidos, seguido de una cabeza clasificadora compuesta por Dropout, una capa lineal de 480 a 480, activación GELU, otro Dropout y una capa lineal final de 480 a `num_classes` (6939 números EC). Durante el ajuste fino se congelan las primeras 4 capas del backbone (`n_freeze=4`), según se desprende del código de arquitectura incluido en la model card.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en tareas de clasificación). Tampoco se detalla el esquema de aumento de datos ni la estrategia de validación más allá de la evaluación en cuatro niveles (L1–L4). La innovación técnica principal es la integración de un pipeline de inferencia con umbral de probabilidad configurable (`EC_THRESH`, por defecto 0.5) que permite devolver múltiples predicciones por secuencia, útil en escenarios de anotación con incertidumbre.

## Capacidades

- Clasificación de enzimas en cuatro niveles jerárquicos del número EC (L1 a L4) a partir de secuencias de aminoácidos.
- Predicción multiclase sobre un vocabulario de 6939 números EC válidos.
- Salida con múltiples predicciones por secuencia mediante umbral de probabilidad configurable (`EC_THRESH`).
- Procesamiento por lotes con tamaño de batch configurable (`EC_BATCH`, por defecto 32).
- Restricción de tiempo de inferencia configurable (`EC_TIME_BUDGET`, por defecto 660 segundos).
- Despliegue reproducible mediante Docker con entrada Parquet y salida JSONL.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking: es un clasificador de secuencias, no un modelo generativo.
- Capacidad multilingüe no aplicable: opera sobre alfabeto de aminoácidos, no sobre texto natural.

## Casos de uso

- Anotación funcional automatizada de proteínas en pipelines de bioinformática: el modelo clasifica secuencias en números EC de cuatro niveles, lo que permite preanotar entradas de bases de datos como UniProt antes de la revisión manual por curadores.
- Priorización de candidatos en estudios de enzimología: dado un conjunto de secuencias noveles, el clasificador asigna una familia EC probable, orientando qué ensayos experimentales realizar primero y reduciendo el coste de cribado.
- Enriquecimiento de datasets de metagenómica: procesar secuencias predichas de metagenomas y asignarles categorías EC para análisis de vías metabólicas y reconstrucción de redes bioquímicas.
- Filtrado en pipelines de ingeniería de proteínas: descartar variantes que pierdan la clase EC de interés antes de pasar a validación experimental, usando el umbral `EC_THRESH` para controlar la sensibilidad.
- Benchmarking de representaciones proteicas: al ser un ajuste fino de ESM-2 35M, sirve como línea base ligera para comparar contra modelos mayores (ESM-2 650M, ProtBERT) en tareas de clasificación funcional.
- Despliegue en entornos con recursos limitados: gracias a sus 35M de parámetros y su contenedor Docker, puede ejecutarse en CPU o GPU de gama baja dentro de servicios de anotación internos con requisitos de reproducibilidad.
- Educación y prototipado rápido: permite a investigadores sin infraestructura pesada experimentar con clasificación EC usando el pipeline Parquet/JSONL incluido, sin necesidad de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la evaluación se realiza a los cuatro niveles (L1–L4) y que la métrica principal es la precisión en L4, pero no se incluyen cifras concretas de precisión, F1 ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (35M de parámetros, aproximadamente 140 MB de pesos) más el overhead de activaciones, que depende de la longitud de secuencia y del batch (`EC_BATCH`, por defecto 32).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, T4, A100 o H100 pueden ejecutar el modelo sin problemas, aunque el modelo es tan pequeño que la GPU no es un cuello de botella.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para lotes moderados.
- Opciones de despliegue: el autor proporciona un Dockerfile y un script `predict.py` basado en PyTorch/Transformers. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son aplicables a un clasificador de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El parámetro `EC_TIME_BUDGET` (660 segundos por defecto) sugiere que el autor prevé ejecuciones de varios minutos sobre el conjunto de validación completo, pero no se especifica el tamaño de dicho conjunto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ec-esm3 (este modelo) | 35M | no disponible | Clasificación EC (L1–L4) | MIT | Hugging Face |
| ESM-2 35M (facebook/esm2_t12_35M_UR50D) | 35M | 1022 residuos (según documentación de Meta) | Representaciones generales de proteínas | MIT | Hugging Face |
| ESM-2 650M (facebook/esm2_t33_650M_UR50D) | 650M | 1022 residuos (según documentación de Meta) | Representaciones generales de proteínas | MIT | Hugging Face |
| ProtBERT (Rostlab/prot_bert) | 420M | 512 residuos (según documentación del autor) | Representaciones generales de proteínas | no disponible en la información | Hugging Face |

La comparación se limita a los backbones de referencia, ya que no se dispone de datos de rendimiento del clasificador frente a otros modelos específicos de predicción EC. El modelo aquí descrito se distingue por estar especializado en la tarea EC y por incluir un pipeline de inferencia reproducible, mientras que los backbones comparados son modelos de propósito general que requerirían un ajuste fino adicional.

## Limitaciones y advertencias

- No se han publicado métricas de rendimiento (precisión, F1, matriz de confusión) en la información disponible, por lo que no es posible evaluar su calidad predictiva frente a alternativas.
- El modelo predice sobre un vocabulario cerrado de 6939 números EC; secuencias correspondientes a enzimas con números EC no presentes en el vocabulario no podrán clasificarse correctamente.
- Riesgo de alucinación en sentido estricto no aplica (es un clasificador, no un generador), pero sí existe riesgo de asignaciones erróneas con alta confianza, especialmente en familias EC poco representadas en el conjunto de entrenamiento.
- No se documenta la composición del dataset de entrenamiento ni el balance de clases, lo que impide evaluar sesgos hacia familias EC mayoritarias.
- El modelo solo maneja secuencias de aminoácidos en formato estándar; no procesa texto natural ni otros idiomas, pese a la etiqueta `en` en los metadatos.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La model card referencia rutas y nombres de usuario genéricos (`YOUR_USERNAME/enzyme-ec-esm2`) en las instrucciones de Docker, lo que puede indicar que la documentación no está completamente actualizada respecto al repositorio publicado.
- No se especifica la longitud máxima de secuencia soportada por el pipeline de inferencia, lo que puede provocar errores con proteínas de gran tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahithimacharapu2/ec-esm3
- Backbone ESM-2 35M: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Backbone ESM-2 650M (referencia): https://huggingface.co/facebook/esm2_t33_650M_UR50D
- ProtBERT (referencia): https://huggingface.co/Rostlab/prot_bert
