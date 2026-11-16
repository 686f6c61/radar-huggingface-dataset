# sahithimacharapu2/ec-esm

## Resumen

ESM-2 35M Enzyme EC Number Classifier es un modelo de clasificación de proteínas desarrollado por el usuario sahithimacharapu2 y publicado en Hugging Face. Consiste en un ajuste fino del backbone ESM-2 de 35 millones de parámetros (facebook/esm2_t12_35M_UR50D) sobre la tarea de predicción del número EC (Enzyme Commission) a partir de secuencias de aminoácidos. El modelo predice la clasificación completa en cuatro niveles jerárquicos (L1 a L4), siendo la precisión en L4 la métrica principal de evaluación.

El modelo resuelve un problema clásico de bioinformática: la anotación funcional automática de enzimas. Dado que la determinación experimental del número EC es costosa y lenta, un clasificador capaz de predecirlo directamente desde la secuencia proteica tiene aplicaciones directas en anotación de genomas, metagenómica y diseño de enzimas. El vocabulario de salida contiene 6939 números EC válidos.

Se trata de un modelo pequeño (35M de parámetros, repositorio de 0,1 GB) con licencia MIT, lo que facilita su despliegue en entornos con recursos limitados. La información pública disponible es escasa: no se han publicado resultados de benchmarks, detalles del conjunto de entrenamiento ni métricas de rendimiento en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ESM-2) con cabeza de clasificación MLP |
| Parametros totales | 35M (backbone ESM-2) + cabeza de clasificación |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por ESM-2 35M, típicamente 1022 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (la tarea es sobre secuencias de aminoácidos, no texto natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone), PyTorch state_dict (cabeza: classifier_head.pt) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone ESM-2 de 35M de parámetros (12 capas, dimensión oculta de 480) con una cabeza de clasificación compuesta por dropout, una capa lineal de 480 a 480, activación GELU, otro dropout y una capa lineal final hacia el número de clases EC. El backbone se carga con `add_pooling_layer=False` y se congelan las primeras 4 capas (`n_freeze=4`) durante el ajuste fino. La salida se mapea sobre un vocabulario de 6939 números EC válidos, con un `fallback_ec` definido en `classes.json`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en tareas de clasificación). Tampoco se documentan innovaciones técnicas adicionales más allá del ajuste fino supervisado estándar sobre ESM-2.

## Capacidades

- Clasificación de enzimas a partir de secuencias de aminoácidos en los cuatro niveles jerárquicos del número EC (L1, L2, L3, L4).
- Predicción multi-etiqueta: con un umbral de probabilidad configurable (`EC_THRESH`, por defecto 0,5) puede emitir predicciones adicionales además de la top-1.
- Procesamiento por lotes de secuencias mediante entrada en formato Parquet (columnas `id` y `sequence`).
- Salida en formato JSONL con una línea por secuencia de entrada.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No es un modelo generativo de texto: su uso está restringido a clasificación de proteínas.

## Casos de uso

- Anotación funcional de genomas: dado un conjunto de secuencias proteicas predichas a partir de un genoma recién secuenciado, el modelo asigna números EC de forma automática, acelerando la curaduría manual.
- Metagenómica: clasificación masiva de proteínas procedentes de muestras ambientales para inferir el repertorio enzimático de comunidades microbianas.
- Priorización experimental: filtrar candidatos enzimáticos antes de ensayos de laboratorio, reduciendo el coste de caracterización experimental.
- Enriquecimiento de bases de datos: completar anotaciones faltantes en repositorios como UniProt o BRENDA mediante predicción automática sobre secuencias sin número EC asignado.
- Diseño y cribado de enzimas: evaluar si variantes generadas por modelos generativos de proteínas conservan la clase funcional esperada.
- Docencia e investigación en bioinformática: modelo ligero (0,1 GB) que puede ejecutarse en CPU o GPU modesta para prácticas y prototipos.
- Integración en pipelines de anotación: el entrypoint `predict.py` con variables de entorno (`EC_TIME_BUDGET`, `EC_BATCH`, `EC_THRESH`) facilita su orquestación en flujos automatizados y contenedores Docker.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la evaluación se realiza en los cuatro niveles (L1–L4) con L4 accuracy como métrica principal, pero no incluye cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB en fp32 para el backbone de 35M más la cabeza; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; también viable en CPU.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: el modelo se distribuye con un `predict.py` y un `Dockerfile` propios; al ser un modelo de `transformers` puede cargarse con la librería estándar. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (no aplicables a un clasificador de este tipo).
- Latencia y throughput: no disponibles; el lote por defecto es 32 (`EC_BATCH`) y el presupuesto máximo de inferencia por defecto es 660 segundos (`EC_TIME_BUDGET`).

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ec-esm (este modelo) | 35M | Clasificación EC (L1–L4) | no disponible | MIT | Hugging Face |
| ESM-2 35M (facebook/esm2_t12_35M_UR50D) | 35M | Embeddings de proteínas (base) | no disponible | MIT | Hugging Face |
| Modelos tipo CLEAN / DeepEC | no disponible | Clasificación EC | no disponible | variable | Repositorios académicos |

No se dispone de datos de rendimiento comparativo entre este modelo y alternativas de clasificación EC, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No se han publicado métricas de rendimiento (accuracy en L1–L4), por lo que no es posible evaluar su calidad frente a alternativas sin ejecutar pruebas propias.
- No se documenta el conjunto de entrenamiento, su procedencia ni posibles sesgos de anotación heredados de las bases de datos utilizadas.
- Riesgo de alucinación en el sentido de asignar números EC plausibles pero incorrectos, especialmente en clases poco representadas del vocabulario de 6939 entradas.
- El modelo está pensado para secuencias de aminoácidos; no procesa texto natural ni otros tipos de entrada.
- La longitud máxima de secuencia no se especifica en la model card; ESM-2 35M está limitado habitualmente a 1022 tokens, lo que puede truncar proteínas largas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-16), lo que sugiere que no ha sido validado por la comunidad.
- La model card contiene referencias a rutas y usuarios genéricos (`YOUR_USERNAME/enzyme-ec-esm2`, `/app/predict.py`), lo que indica que el paquete puede requerir ajustes antes de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahithimacharapu2/ec-esm
- Backbone base ESM-2 35M: https://huggingface.co/facebook/esm2_t12_35M_UR50D
