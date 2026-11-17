# sahithimacharapu2/ec-esm14

## Resumen

ESM-2 35M Enzyme EC Number Classifier es un modelo de clasificación de proteínas desarrollado por el usuario sahithimacharapu2 y publicado en Hugging Face. Consiste en un ajuste fino del backbone ESM-2 de 35 millones de parámetros (facebook/esm2_t12_35M_UR50D) para predecir el número EC (Enzyme Commission) de enzimas a partir de su secuencia de aminoácidos. El modelo resuelve el problema de anotación funcional automática de enzimas, una tarea central en bioinformática estructural y metabolómica.

La arquitectura combina el encoder ESM-2 con una cabeza clasificadora de dos capas lineales (480 → 480 → 6939 clases) con activación GELU y dropout de 0,1. El vocabulario de salida cubre 6939 números EC válidos y la predicción se realiza a cuatro niveles jerárquicos (L1 a L4), siendo la métrica principal la precisión en L4. El repositorio incluye pesos en safetensors, un vocabulario EC, scripts de inferencia y un Dockerfile para despliegue reproducible.

El modelo es relevante para pipelines de anotación en metagenómica y biología computacional donde se requiere clasificación rápida de enzimas sin depender de alineamientos BLAST o herramientas de anotación pesadas. Su tamaño reducido (35M de parámetros, repositorio de 0,1 GB) permite ejecución en CPU y en GPUs de consumo, y su licencia MIT facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder ESM-2 (12 capas, hidden size 480) con cabeza clasificadora MLP |
| Parametros totales | 35M (backbone ESM-2) + cabeza clasificadora (no se especifica el total exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ESM-2 base soporta secuencias de hasta 1022 residuos, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (la tarea es sobre secuencias de aminoácidos, no texto natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone ESM-2) y PyTorch state_dict (`classifier_head.pt`) |

## Arquitectura y entrenamiento

El modelo parte del backbone ESM-2 de 35M de parámetros (esm2_t12_35M_UR50D), un transformer encoder preentrenado con enmascaramiento de aminoácidos sobre secuencias de proteínas (UniRef). Sobre él se añade una cabeza clasificadora secuencial: dropout 0,1, capa lineal de 480 a 480, activación GELU, dropout 0,1 y capa lineal final de 480 a 6939 clases (una por número EC válido). Durante el ajuste fino se congelan las primeras 4 capas del backbone (`n_freeze=4`), según se deduce del código de arquitectura incluido en la model card.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en clasificación de proteínas). La innovación principal es el uso de un vocabulario EC cerrado de 6939 clases con umbral de probabilidad configurable (`EC_THRESH`) que permite devolver predicciones adicionales cuando la confianza supera el umbral, y un mecanismo de fallback (`fallback_ec`) para secuencias fuera de distribución.

## Capacidades

- Clasificación de enzimas en números EC de cuatro niveles (L1–L4) a partir de secuencia de aminoácidos.
- Predicción multi-etiqueta opcional mediante umbral de probabilidad (`EC_THRESH`), devolviendo múltiples números EC por secuencia.
- Procesamiento por lotes configurable (`EC_BATCH`, por defecto 32).
- Restricción de tiempo de inferencia configurable (`EC_TIME_BUDGET`, por defecto 660 segundos).
- Entrada en formato Parquet con columnas `id` y `sequence`; salida en JSONL.
- Despliegue reproducible mediante Docker.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso; es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingüe no aplicable: opera sobre secuencias biológicas, no sobre texto.

## Casos de uso

- Anotación funcional de genomas y metagenomas: dado un conjunto de secuencias proteicas predichas por un ensamblador (p. ej. Prodigal), el modelo asigna números EC en lote mediante el script `predict.py`, sustituyendo o complementando anotaciones basadas en BLAST en pipelines de metagenómica.
- Curación de bases de datos enzimáticas: clasificación automática de entradas con anotación EC ausente o ambigua, usando el umbral `EC_THRESH` para marcar casos de baja confianza que requieran revisión manual.
- Ingeniería de enzimas: cribado de bibliotecas de variantes para identificar cambios en la clase EC tras mutagénesis, aprovechando la velocidad de inferencia en CPU.
- Análisis de vías metabólicas: reconstrucción de rutas metabólicas a partir de proteomas anotados, donde la asignación EC L1–L4 es el paso previo a la consulta en bases de datos como KEGG.
- Docencia y prototipado en bioinformática: el tamaño reducido (35M parámetros) y el despliegue en Docker permiten usar el modelo en entornos con recursos limitados o en cuadernos de Jupyter para demostrar clasificación de proteínas.
- Integración en servicios web de anotación: exposición del modelo como endpoint HTTP que reciba secuencias en Parquet y devuelva JSONL, con control del presupuesto de tiempo para garantizar latencia acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la métrica primaria es la precisión en L4 (L4 accuracy) y que la evaluación se realiza en los cuatro niveles, pero no incluye cifras concretas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para el backbone de 35M de parámetros más la cabeza clasificadora; en la práctica, el modelo completo ocupa aproximadamente 0,1 GB en disco.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, T4). Para lotes grandes, una RTX 4090 o A100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida.
- Ejecución en CPU: viable; el modelo es lo bastante pequeño para inferencia en CPU con latencias aceptables por lote.
- Opciones de despliegue: Docker (incluido en el repositorio), script `predict.py` con PyTorch y Transformers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos generativos).
- Latencia y throughput: no disponibles. El autor expone `EC_TIME_BUDGET=660` segundos y `EC_BATCH=32` como valores por defecto, lo que sugiere que el presupuesto de tiempo es el mecanismo de control principal.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESM-2 35M EC Classifier (este modelo) | 35M | Clasificación EC (L1–L4) | no disponible | MIT | Hugging Face |
| ESM-2 35M base (facebook/esm2_t12_35M_UR50D) | 35M | Embeddings de proteínas (no clasifica EC directamente) | ~1022 residuos | MIT | Hugging Face |
| CLEAN (proteínas, clasificación EC) | no disponible | Clasificación EC con contraste | no disponible | no disponible | Publicaciones académicas |
| ProteInfer | no disponible | Predicción de función enzimática | no disponible | no disponible | Repositorio Google Research |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. Frente al ESM-2 base, este modelo añade la cabeza de clasificación EC y el vocabulario de 6939 clases, pero no se han publicado métricas que permitan establecer su ventaja frente a herramientas consolidadas como CLEAN o ProteInfer.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación (precisión L1–L4, F1, cobertura), por lo que el rendimiento real es desconocido y no verificable.
- El modelo se ha ajustado sobre un vocabulario cerrado de 6939 números EC; enzimas con números EC no presentes en `classes.json` se asignarán al `fallback_ec`, lo que puede producir anotaciones incorrectas silenciosas.
- Riesgo de alucinación en el sentido de asignar una clase EC con alta confianza a proteínas fuera de distribución (p. ej. proteínas no enzimáticas o dominios truncados).
- Sesgos potenciales derivados del dataset de entrenamiento (no documentado): infrarepresentación de ciertas familias enzimáticas, clases EC raras o taxones poco muestreados.
- Longitud máxima de secuencia no documentada; secuencias muy largas pueden truncarse o provocar errores según la configuración del tokenizador ESM-2.
- El modelo solo maneja secuencias de aminoácidos en formato estándar; no procesa texto natural ni otros idiomas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de las predicciones en contextos clínicos, industriales o regulatorios.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- El Dockerfile hace referencia a `YOUR_USERNAME/enzyme-ec-esm2`, un marcador de posición que debe sustituirse por la ruta real del repositorio clonado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahithimacharapu2/ec-esm14
- Backbone ESM-2 35M: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Repositorio citado en el Dockerfile (marcador de posición, no verificado): https://huggingface.co/YOUR_USERNAME/enzyme-ec-esm2
