# DuoNeural/RMSN-756M-QuadSpine-SFT2500

## Resumen

RMSN-756M-QuadSpine-SFT2500 es un modelo de lenguaje de 756 millones de parámetros desarrollado por DuoNeural Lab (autores citados como Jesse, Archon y Aura) y publicado en noviembre de 2026. Se presenta como una red neuronal de lenguaje basada en dinámica port-hamiltoniana, bajo la arquitectura propietaria RMSN (Resonant Metriplectic Sheaf Network), con una topología denominada Quad-Spine que distribuye cuatro condensados de solitón (anclas exactas o casi exactas) a lo largo de la profundidad de la red. El modelo es una versión ajustada por instrucciones (SFT) durante 2500 pasos sobre una base preentrenada.

El modelo declara una dimensión oculta de 2048, 16 capas y 64 slots, y está orientado a idioma inglés. Su principal reclamo es haber alcanzado la mejor perplejidad en WikiText-103 (133.56) de cualquier modelo RMSN publicado hasta la fecha, además de una puntuación de razonamiento CoT de 15.79. La topología Quad-Spine se describe como un mecanismo que preserva las representaciones lingüísticas del preentrenamiento durante el ajuste supervisado, reduciendo el olvido catastrófico.

La relevancia del modelo es principalmente de investigación: explora una formulación alternativa a los transformers convencionales (dinámica hamiltoniana con conservación de espacio de fases y estabilidad de Lyapunov) y publica hallazgos sobre el efecto del schedule de learning rate en la retención de conocimiento lingüístico. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), dinámica port-hamiltoniana; 16 capas, D=2048, 64 slots |
| Parametros totales | 756M |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repo ocupa 2.6 GB) |

## Arquitectura y entrenamiento

La arquitectura RMSN se describe en la model card como una red con dinámica port-hamiltoniana regida por la ecuación ḟ = {f,H} + [f,S], con estabilidad de Lyapunov y conservación del espacio de fases. La formulación combina corchetes de Poisson (parte hamiltoniana conservativa) y corchetes disipativos, un esquema propio de los sistemas metriplécticos. El modelo tiene 16 capas, dimensión 2048 y 64 slots, sumando 756M de parámetros.

La topología Quad-Spine distribuye cuatro condensados de solitón en las capas L0 (PR 1.000, EXACT), L6 (PR 1.000, EXACT), L10 (PR ~1.3, Near-Exact) y L15 (PR 1.000, EXACT), formando una "espina equilibrada" que abarca toda la profundidad. Según el autor, esta configuración preserva las representaciones del preentrenamiento y ofrece máxima resistencia al olvido durante el SFT. El modelo fue ajustado con SFT durante 2500 pasos; el hallazgo principal reportado es que un schedule de learning rate de coseno comprimido mejora la perplejidad en WikiText-103 en 18.3 puntos frente a un SFT estándar de 5000 pasos con el mismo número de pasos, a costa de un ligero empeoramiento en la perplejidad de razonamiento CoT. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto en inglés y modelado de lenguaje (métrica principal: perplejidad en WikiText-103).
- Razonamiento de tipo chain-of-thought, evaluado con una métrica de perplejidad CoT (15.79), no con exactitud de respuesta.
- Ajuste por instrucciones (SFT) sobre la base preentrenada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Investigación en arquitecturas alternativas a transformers: el modelo sirve como banco de pruebas reproducible para estudiar dinámica port-hamiltoniana y estabilidad de Lyapunov en modelos de lenguaje, comparando su comportamiento con transformers de tamaño similar.
- Estudio del olvido catastrófico en SFT: la topología Quad-Spine y el hallazgo sobre el schedule de coseno comprimido permiten experimentar con estrategias de retención de conocimiento durante el ajuste, midiendo la perplejidad en WikiText-103 antes y después del SFT.
- Modelado de lenguaje de bajo coste computacional: con 756M de parámetros, puede ejecutarse en GPUs de consumo para tareas de investigación que no requieran estado del arte, como experimentos de ablación o prototipado rápido.
- Evaluación de métricas de condensación (PR, exactitud de solitones): útil para grupos que investiguen dinámicas de condensación en redes neuronales y quieran replicar o contrastar los anclas L0/L6/L10/L15 reportadas.
- Generación de texto en inglés para tareas internas no críticas: dado su ajuste por instrucciones, puede emplearse en prototipos de generación de texto donde la licencia Apache 2.0 y el tamaño reducido sean prioritarios frente a la calidad.
- Reproducibilidad académica: al publicarse bajo Apache 2.0 con pesos en un repo de 2.6 GB, permite a laboratorios sin grandes presupuestos replicar los experimentos de la model card y verificar la perplejidad declarada de 133.56.

## Benchmarks y rendimiento

| Métrica | Resultado | Notas |
|---|---|---|
| WikiText-103 (perplejidad) | 133.56 | Declarado por el autor como mejor de cualquier RMSN publicado |
| CoT Reasoning (perplejidad) | 15.79 | Métrica de perplejidad, no de exactitud |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, etc.) en la información disponible. Tampoco se ofrecen comparaciones numéricas con modelos de otras familias.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (756M de parámetros), en FP16 requeriría aproximadamente 1.5 GB de pesos, y en cuantización de 8 bits alrededor de 0.8 GB, más overhead de activaciones y contexto; estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no especificadas. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para experimentación a mayor escala.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 756M, aunque no hay confirmación oficial ni formatos cuantizados publicados.
- Opciones de despliegue: no se indican en la model card. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que la arquitectura RMSN no es un transformer estándar y requeriría implementación propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Benchmarks estándar | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-756M-QuadSpine-SFT2500 | 756M | no disponible | Apache 2.0 | Solo WikiText-103 (133.56) y CoT PPL (15.79) | Hugging Face, 0 descargas |
| Modelos RMSN previos de DuoNeural | no disponible | no disponible | no disponible | no disponible | no disponible |
| Transformers de ~700M-1B (p. ej. familia Llama/Qwen de ese rango) | ~0.7-1B | 4k-128k típicamente | variable | MMLU, HumanEval, GSM8K publicados | Amplia |

No se dispone de datos numéricos de los modelos RMSN previos ni de comparaciones directas publicadas por el autor. La comparación con transformers de rango similar es cualitativa: aquellos cuentan con benchmarks estándar y ecosistema de despliegue maduro, mientras que este modelo solo reporta perplejidad.

## Limitaciones y advertencias

- Idiomas: solo inglés declarado; no hay evidencia de capacidades multilingües.
- Benchmarks: ausencia total de métricas estándar (MMLU, HumanEval, GSM8K), lo que impide evaluar razonamiento, código o matemáticas de forma objetiva.
- Métricas reportadas: la puntuación CoT de 15.79 es una perplejidad, no una tasa de acierto; no debe interpretarse como calidad de razonamiento.
- Adopción: cero descargas y cero likes en el momento de la consulta; sin validación independiente de los resultados declarados.
- Arquitectura no estándar: al no ser un transformer convencional, es probable que no funcione con herramientas de inferencia habituales (vLLM, llama.cpp, TGI) sin implementación específica; no se confirma compatibilidad.
- Sesgos: no documentados por el autor; al entrenarse presumiblemente con datos web en inglés, es esperable un sesgo similar al de otros modelos de su clase, pero no hay información concreta.
- Alucinación: riesgo no cuantificado; sin evaluaciones de fidelidad ni de robustez.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia de los datos de entrenamiento, no detallada.
- Producción: sin información sobre contexto máximo, cuantizaciones ni latencia, no es recomendable para despliegues en producción sin una evaluación propia previa.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-756M-QuadSpine-SFT2500
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
