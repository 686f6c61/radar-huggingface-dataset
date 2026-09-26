# anonymous-submission-hugging-face/Lattice_Spike

## Resumen

LatticeSpike es una implementación de referencia en PyTorch de una arquitectura para la detección en línea de alucinaciones en modelos de lenguaje. El modelo combina una retícula de embebido de cajas basada en conexiones de Galois con una red neuronal de impulsos (spiking) recurrente modulada por el volumen de las cajas. No es un modelo generativo, sino un detector que opera token a token sobre las señales internas de un LLM subyacente. Lo publica el colectivo anónimo `anonymous-submission-hugging-face`, presumiblemente en el contexto de un envío a revisión por pares, dado el nombre y la presencia del fichero de paper `lattice_snn_hallucination.tex`.

El repositorio (0,6 GB) contiene exclusivamente código fuente, documentación y utilidades de evaluación, no pesos preentrenados. El flujo de trabajo previsto es extraer señales internas de un LLM (por defecto `Qwen/Qwen2.5-0.5B-Instruct`) mediante `llm_signals.py`, entrenar el detector de forma no supervisada y evaluar la detección a nivel de token con métricas como AUPRC y tiempo de adelanto (`τ_lead`). La relevancia actual radica en que propone un enfoque neuroinspirado y geométrico para un problema candente: saber cuándo un LLM está alucinando, sin depender de un modelo juez externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Retícula de embebido de cajas (conexión de Galois) + red de impulsos recurrente LIF modulada por volumen de caja |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible (depende del LLM subyacente del que se extraen señales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene código fuente PyTorch, no pesos preentrenados) |

## Arquitectura y entrenamiento

La arquitectura se articula en dos bloques principales. Por un lado, un codificador de cajas (`boxes.py`) que modela las representaciones ocultas como regiones geométricas y calcula señales como la fuga geométrica causal de la caja en el instante `t` respecto a la de `t-1`, la tasa de contracción `κ_t` y el residuo de concretización `m_t` (predicción frente a caja). Por otro, una red de impulsos recurrente con neuronas LIF modulada por volumen (`rsnn.py`), que procesa esas señales y produce una cabeza de reconstrucción con control de compuertas por canal. La dimensión de entrada de la RSNN es `2d + k + 5`, donde `d` es la dimensión de la caja y `k` la dimensión de la proyección MRL del trazo de KL.

El detector recibe seis canales de entrada: (1) fuga geométrica causal, (2) tasa de contracción, (3) trazo de KL comprimido mediante MRL, (4) varianza de la KL entre capas, (5) entropía de atención y rango efectivo, y (6) residuo de concretización. Las señales 1, 2 y 6 provienen del codificador de cajas; la 3 y la 4 de `signals.py`; y la 5 se obtiene opcionalmente de un LLM de HuggingFace. El entrenamiento es no supervisado sobre secuencias sintéticas o sobre señales reales extraídas de un LLM, con una pérdida combinada que incluye reconstrucción robusta (recortada), contención, volumen y contracción anclada. No se documentan en la información proporcionada ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Detección de alucinaciones a nivel de token sobre las salidas de un LLM, no generación de texto.
- Entrenamiento no supervisado sobre secuencias mayoritariamente fundamentadas (`grounded`), con soporte para contaminación controlada y recorte robusto (`--contaminate`, `--trim`).
- Extracción opcional de señales internas de un LLM de HuggingFace (por defecto `Qwen/Qwen2.5-0.5B-Instruct`) mediante una única pasada forward con estados ocultos y atenciones.
- Detección de "estallidos de fundamentación" (grounding bursts) de extremo a extremo a través del módulo `detector.py`.
- Cálculo de métricas de evaluación token a token: AUPRC y tiempo de adelanto (`τ_lead`).
- Atribución por canal de las compuertas (per-channel gate attribution) para interpretar qué señal contribuye a la detección.
- Comparación con detectores de referencia: EPR y Lookback Lens, mediante interfaces compartidas en `baselines/`.
- Generación de visualizaciones HTML interactivas a partir de predicciones en JSONL.
- Carga y colación de datasets JSONL con etiquetas por token (G/U/H), índice de inicio de alucinación (`t_star_index`) y método de autoetiquetado.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Monitorización en producción de asistentes conversacionales: el detector se ejecuta sobre cada respuesta generada por el LLM y emite una señal de alarma cuando el trazo de KL y la geometría de las cajas indican falta de fundamentación, permitiendo degradar la respuesta o solicitar revisión humana.
- Filtrado de respuestas en pipelines RAG: al integrarse sobre las señales del LLM que redacta la respuesta, se puede marcar como no fiable aquella generación cuyo residuo de concretización `m_t` se dispara, evitando devolver al usuario contenido no anclado en el contexto recuperado.
- Etiquetado y auditoría de datasets: el modelo permite puntuar token a token grandes volúmenes de respuestas ya generadas, sirviendo como preetiquetador para construir datasets de alucinación supervisados y reducir el coste de anotación manual.
- Investigación en interpretabilidad: las compuertas por canal y las señales geométricas (fuga, contracción, residuo) ofrecen una vía para estudiar qué dinámicas internas de un LLM preceden a una alucinación, útil para trabajos académicos sobre mecanismos internos.
- Validación continua en CI/CD de modelos: la interfaz de líneas de comandos (`train.py`, `scripts/eval_baselines_dgx.py`, `scripts/visualize.py`) permite ejecutar evaluaciones reproducibles tras cada actualización de un LLM y comparar AUPRC frente a los baselines EPR y Lookback Lens.
- Aplicaciones de alto riesgo con revisión humana obligatoria (ámbito sanitario, legal o financiero): el tiempo de adelanto `τ_lead` cuantifica cuántos tokens antes se detecta la alucinación, lo que da margen para activar una salvaguarda antes de que la respuesta se complete.
- Desarrollo de nuevos detectores: las interfaces compartidas en `baselines/` facilitan implementar y comparar variantes de detección de alucinación bajo condiciones homogéneas.
- Análisis de señales de atención y representaciones: `llm_signals.py` expone entropía de atención, rango efectivo, probabilidades top-k y trazos de KL entre capas, reutilizables para otros estudios de diagnóstico de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio define el marco de evaluación (AUPRC a nivel de token y tiempo de adelanto `τ_lead`) y referencia el documento `docs/paper_ready_evaluation.md` para el protocolo versionado v5.3, las suites de comparación, la selección de modelos y la estadística emparejada, pero no se incluyen cifras concretas en el material proporcionado.

## Requisitos de hardware

- No se dispone de estimaciones oficiales de VRAM en la información proporcionada. El repo pesa 0,6 GB y contiene solo código, por lo que el consumo depende del LLM subyacente del que se extraen señales.
- La red de impulsos (RSNN) y el codificador de cajas son módulos pequeños; su entrenamiento se documenta explícitamente sobre CPU (`--device cpu`), lo que sugiere que caben en cualquier equipo convencional.
- La etapa costosa es la extracción de señales (`llm_signals.py`), que ejecuta una pasada forward completa del LLM por cada registro; con el modelo por defecto `Qwen/Qwen2.5-0.5B-Instruct` cabe en GPUs de consumo como una RTX 3060 o superior, y también en CPU con `--limit` reducido.
- El README menciona un script `scripts/eval_baselines_dgx.py`, lo que sugiere que se ha ejecutado en hardware tipo NVIDIA DGX (A100/H100) para los baselines, aunque no se detallan cifras de latencia ni throughput.
- Opciones de despliegue: ejecución directa con PyTorch (`train.py`), uso de `transformers` para la extracción de señales de LLM, y utilidades propias de evaluación y visualización. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- No se publican cifras de latencia ni de throughput.

## Comparativa con modelos similares

Los únicos detectores de referencia mencionados explícitamente en la información disponible son EPR y Lookback Lens, para los que el repositorio ofrece interfaces compartidas en `baselines/` con el fin de compararlos bajo el mismo protocolo. No se dispone de datos de rendimiento de ninguno de los tres, por lo que la comparación cuantitativa no está disponible.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LatticeSpike | Detector de alucinaciones (Galois + RSNN) | no disponible | no disponible | no disponible | Repo PyTorch de referencia |
| EPR | Detector de alucinaciones (baseline) | no disponible | no disponible | no disponible | Interfaz referenciada en `baselines/` |
| Lookback Lens | Detector de alucinaciones (baseline) | no disponible | no disponible | no disponible | Interfaz referenciada en `baselines/` |

## Limitaciones y advertencias

- No es un modelo generativo: no se puede usar directamente para conversar ni para producir texto; requiere un LLM subyacente del que extraer señales.
- No se documentan sesgos conocidos en la información proporcionada.
- Riesgo de alucinación: como todo detector, puede producir falsos positivos (marcar texto fundamentado como alucinado) y falsos negativos; las métricas de evaluación previstas (AUPRC, `τ_lead`) están pensadas precisamente para cuantificar ese compromiso, pero no se publican valores.
- La extracción de señales es el paso costoso y no está cacheada según el README, por lo que escalar el entrenamiento con datos reales exige iterar con `--limit`.
- Los idiomas soportados son "no disponible"; el comportamiento depende del LLM del que se extraigan las señales y de los datos de etiquetado utilizados.
- Licencia no disponible: no se puede confirmar si se permite uso comercial, modificación o redistribución. Debe aclararse antes de cualquier despliegue en producción.
- No hay pesos preentrenados publicados: cualquier uso real exige entrenar el detector con los datos propios o con los ejemplos incluidos.
- La fecha de creación del repositorio (2026-09-26) y el carácter anónimo del autor sugieren un estado de envío a revisión, con posible inestabilidad de la API o cambios en el protocolo de evaluación.
- Los resultados de la búsqueda web proporcionada no guardan relación con el modelo (hacen referencia al colectivo hacktivista Anonymous) y no aportan documentación técnica utilizable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonymous-submission-hugging-face/Lattice_Spike
- Protocolo de evaluación v5.3: `docs/paper_ready_evaluation.md` (ruta interna del repositorio, sin URL pública)
- Resultados consolidados de diagnóstico en datos reales: `docs/latticespike_experiment_results.md` (ruta interna del repositorio, sin URL pública)
- Paper de la arquitectura: `lattice_snn_hallucination.tex` (fichero interno del repositorio, sin URL pública)
- Interfaces para baselines (EPR, Lookback Lens): `baselines/README.md` (ruta interna del repositorio, sin URL pública)
