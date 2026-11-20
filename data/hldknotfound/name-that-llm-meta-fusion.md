# HLDKNotFound/name-that-llm-meta-fusion

## Resumen

El modelo `HLDKNotFound/name-that-llm-meta-fusion` es un meta-clasificador de tipo Residual MLP desarrollado por el usuario HLDKNotFound para la competición "Name That LLM". No es un modelo de lenguaje generativo, sino un componente de *stacking* de segundo nivel (Stage 2) que fusiona las salidas de tres expertos heterogéneos para atribuir la autoría de un texto a uno de 18 modelos de lenguaje candidatos. Su función es la de un clasificador forense-lingüístico: recibe vectores de 388 dimensiones sintetizados a partir de probabilidades calibradas y representaciones latentes de los expertos, y devuelve una distribución de probabilidad sobre los 18 LLMs objetivo.

Con aproximadamente 245.000 parámetros, el modelo es extremadamente ligero y está diseñado para ejecutarse sobre CPU sin requisitos de GPU. La arquitectura emplea conexiones residuales con Pre-LayerNorm y una cabeza de 18 salidas. La innovación principal reside en la fusión de tres paradigmas ortogonales (un encoder basado en DeBERTa-v3-large con ArcFace, un Qwen2.5-3B con LoRA y un conjunto de SVM lineales con adaptador MLP) junto con señales macro-contextuales de incertidumbre, todo optimizado con Class-Balanced Focal Loss y calibración de prior mediante Sinkhorn-Knopp.

Su relevancia es acotada: se trata de un artefacto de competición con métricas modestas (balanced accuracy del 37,78% sobre 810 muestras de validación), pensado para integrarse en un pipeline mayor de atribución de autoría. No sustituye a un LLM y no genera texto; su utilidad práctica depende de disponer de los tres expertos upstream y de sus representaciones latentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Residual MLP con Pre-LayerNorm skips, 18 cabezas de salida |
| Parametros totales | ~245.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre vectores de 388 dimensiones, no sobre texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (bundle descargable vía `snapshot_download`; formato de pesos no especificado en la model card) |

## Arquitectura y entrenamiento

El meta-clasificador es un MLP residual estándar de aproximadamente 245.000 parámetros con conexiones skip y Pre-LayerNorm. La dimensión de entrada es de 388, sintetizada a partir de tres expertos: (1) `microsoft/deberta-v3-large` con ArcFace, que aporta 18 probabilidades calibradas más un cuello de botella latente de estilo de 128 dimensiones (146 dims); (2) `Qwen/Qwen2.5-3B` con LoRA, que aporta 18 probabilidades de clasificación con padding izquierdo más un cuello de botella forense de 128 dimensiones (146 dims); y (3) un conjunto `LinearSVC` con 18 esquemas OvR y 153 OvO más un adaptador MLP, que aporta 18 probabilidades calibradas más un cuello de botella de estilo de 64 dimensiones (82 dims). Adicionalmente se incorporan 14 dimensiones de señales macro-contextuales y de incertidumbre: densidad léxica, longitud, bloques de código, listas con viñetas, negritas Markdown, márgenes de predicción y entropía de Shannon.

El entrenamiento emplea Class-Balanced Focal Loss con β=0,999 y γ=1,5, junto con una calibración de prior mediante Soft Sinkhorn-Knopp. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO (no aplicables a un clasificador de este tipo). No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de autoría de texto entre 18 modelos de lenguaje candidatos (atribución forense-lingüística).
- Fusión de señales heterogéneas de tres expertos mediante stacking de segundo nivel.
- Producción de matrices de probabilidad calibradas de forma (N, 18) mediante `predict_proba`.
- Calibración opcional de prior con Sinkhorn-Knopp (`apply_sinkhorn=True`).
- Extracción implícita de señales macro-contextuales: densidad léxica, longitud, presencia de código, listas, negritas Markdown, márgenes de predicción y entropía.
- Integración en pipelines Python mediante la clase `MetaFusionPipeline`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Atribución forense de autoría en entornos académicos: dado un texto, determinar qué LLM lo generó probablemente, útil en estudios de procedencia de contenido y auditoría de datasets sintéticos.
- Detección de contenido generado por modelos concretos en pipelines de moderación: el clasificador devuelve una distribución sobre 18 LLMs, lo que permite umbralizar y marcar textos sospechosos.
- Investigación en lingüística forense computacional: el modelo sirve como componente de referencia para experimentos de *stacking* y fusión de expertos en tareas de atribución.
- Reproducción de resultados de competición: útil para participantes de "Name That LLM" que quieran comparar sus propios meta-clasificadores contra este baseline.
- Evaluación de robustez de detectores de texto sintético: al ser ligero y determinista, permite barridos masivos sobre corpus grandes sin coste de GPU.
- Componente auxiliar en sistemas de procedencia de contenido: combinado con los tres expertos upstream, forma un pipeline completo de atribución que puede integrarse en herramientas de auditoría de publicaciones.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre un holdout de validación de 810 muestras Gold puras no vistas:

| Metrica | Valor |
|---|---|
| Balanced Accuracy (MLP crudo) | 37,65% (0,3765) |
| Balanced Accuracy (calibrado con Sinkhorn) | 37,78% (0,3778) |
| Macro Precision | 37,68% |
| Macro F1-Score | 35,42% |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene ~245.000 parámetros y opera sobre vectores de 388 dimensiones.
- GPU recomendadas: no requiere GPU; ejecutable en CPU. Cualquier GPU consumer (RTX 3060 o superior) es sobredimensionada para este componente.
- Cabe en cualquier GPU consumer y en CPU de gama baja.
- Opciones de despliegue: el bundle se descarga vía `snapshot_download` de Hugging Face Hub y se usa mediante la clase `MetaFusionPipeline` incluida en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de este tamaño).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera del orden de microsegundos a milisegundos por lote en CPU, pero no se confirma en la model card.

## Comparativa con modelos similares

No disponible. La model card no proporciona comparaciones con otros meta-clasificadores o sistemas de atribución de autoría, y no se dispone de información sobre alternativas comparables en la misma categoría (atribución forense de autoría de LLM) con parámetros, contexto y licencia verificables en la información suministrada.

## Limitaciones y advertencias

- Balanced accuracy del 37,78% sobre 18 clases: el rendimiento es bajo en términos absolutos, aunque el azar sobre 18 clases sería del 5,56%. No debe usarse como evidencia concluyente en contextos forenses reales.
- El modelo no procesa texto directamente: requiere los tres expertos upstream (DeBERTa-v3-large ArcFace, Qwen2.5-3B LoRA y el conjunto LinearSVC) para generar los vectores de 388 dimensiones. Sin ellos, el meta-clasificador es inutilizable.
- Solo soporta inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación no aplicable (no genera texto), pero sí riesgo de falsos positivos en la atribución, especialmente con textos cortos o atípicos.
- Sesgos potenciales derivados de los datos de entrenamiento de la competición: la distribución de los 18 LLMs objetivo puede no reflejar la de un entorno de producción real.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de componentes upstream con sus propias licencias (DeBERTa-v3-large, Qwen2.5-3B) que deben verificarse por separado.
- Artefacto de competición con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación independiente.
- Repositorio de 0,0 GB: conviene verificar que el bundle de pesos y el código de inferencia estén efectivamente presentes antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HLDKNotFound/name-that-llm-meta-fusion
- Demo interactiva (molab): https://molab.marimo.io/github/HLDKNotFound/NameThatLLM/blob/main/expert4_fusion_mlp/05_fusion_mlp.py
- Repositorio del proyecto en GitHub: https://github.com/HLDKNotFound/NameThatLLM
- Experto 1 (referencia): https://huggingface.co/microsoft/deberta-v3-large
- Experto 2 (referencia): https://huggingface.co/Qwen/Qwen2.5-3B
