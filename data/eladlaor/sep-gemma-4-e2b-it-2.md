# eladlaor/SEP-gemma-4-E2B-it

## Resumen

SEP-gemma-4-E2B-it es una sonda de entropía semántica (Semantic Entropy Probe, SEP) desarrollada por eladlaor para el modelo `google/gemma-4-E2B-it`. No se trata de un modelo generativo, sino de un clasificador lineal (regresión logística) que lee un estado oculto del backbone y predice si la entropía semántica del modelo sobre una pregunta sería alta. Sustituye el muestreo de N respuestas y la comparación pairwise de significados que requiere la entropía semántica clásica por un único forward pass sobre el prompt.

El artefacto se enmarca en la línea de trabajo de Kossen et al. (2024) sobre detección de alucinaciones mediante entropía semántica, con desviaciones documentadas respecto al paper original (D1-D13). La sonda devuelve p(high SE): la probabilidad de que la entropía semántica discreta de 10 respuestas muestreadas supere el punto de corte γ* = 0.850 nats. El autor advierte explícitamente de que esta puntuación no es una probabilidad de alucinación ni está expresada en nats.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0.0 GB y fue creado el 2026-11-18. Su relevancia es metodológica: propone un detector de bajo coste computacional para pipelines de escalado selectivo (escalation) en sistemas que ya corren Gemma-4-E2B-it, condicionado a que el backbone, la revisión, el chat template y la instrucción de respuesta coincidan exactamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (clasificador lineal) sobre estados ocultos de un transformer decoder |
| Parametros totales | no disponible (clasificador lineal; el backbone subyacente es google/gemma-4-E2B-it) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del backbone Gemma-4-E2B-it) |
| Tipos de cuantizacion | no disponible (el backbone se lee en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (artefacto de sonda; el repo pesa 0.0 GB) |

## Arquitectura y entrenamiento

La sonda es una regresión logística con penalización L2 (C = 1.0, solver lbfgs, max_iter = 1000, convergió en 157 iteraciones, sin escalado de features) que consume la concatenación de los estados ocultos de las capas 19, 20, 21, 22 y 23 (numeración del repo) en la posición TBG ("token before generation": el último token del prompt formateado con chat template, leído antes de generar cualquier respuesta). Con 35 capas decoder y hidden size 1536, la selección de capas se realizó mediante nested cross-validation. El backbone se fija en la revisión `4adf15748de9e1a0097b6274cee9c15836c41c37` en bfloat16.

Los datos de entrenamiento son 500 preguntas de calibración (187 etiquetadas high SE y 313 low SE). Las etiquetas se obtuvieron muestreando 10 respuestas a temperatura 1.0 (top-p 0.95, top-k 64), con un máximo de 64 tokens cada una, agrupadas por significado con `microsoft/deberta-large-mnli` en la revisión `7296194b9009373def4f7c5dad292651e4b5cf4e`. La entropía semántica discreta se binariza en γ* = 0.850 nats, el mejor punto de corte sobre los puntos medios entre valores distintos de SE. El ajuste se realizó con scikit-learn 1.9.1 el 2026-11-18, recogiendo los estados ocultos con transformers 5.19.0 y torch 2.14.1+cu130 (CUDA 13.0), a través del repositorio `hallucinations-math-lab` en el commit `38eded82b18454189356373e465ed1c6cb034290`.

## Capacidades

- Predicción de p(high SE) para una pregunta dada, mediante un único forward pass sobre el prompt en lugar de N muestreos y comparaciones de significado.
- Detección de incertidumbre semántica orientada a escalado selectivo: el score se usa como señal para derivar consultas a un modelo mayor o a un verificador.
- Integración como detector `semantic_entropy_probe` dentro de `hallucinations-math-lab`, configurable mediante la variable de entorno `SEP_PROBE_PATH`.
- Verificación de compatibilidad estricta: el detector rechaza puntuar si el modelo bajo prueba no comparte backbone, revisión, número de capas, hidden size, chat template y instrucción de respuesta.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador de incertidumbre.
- Idiomas soportados: no disponible.

## Casos de uso

- Escalado selectivo en producción: usar p(high SE) como señal para derivar preguntas a un modelo mayor o a un verificador humano cuando la sonda supera `SEP_THRESHOLD`, reduciendo el coste frente a muestrear 10 respuestas por consulta.
- Monitorización de pipelines RAG: puntuar cada pregunta del usuario antes de generar la respuesta y registrar la tasa de high SE por colección documental para detectar huecos de cobertura.
- Enrutado dinámico de consultas: clasificar preguntas entrantes por incertidumbre semántica y asignar las de mayor p(high SE) a un flujo con verificación adicional o a un modelo con más capacidad.
- Evaluación de calidad de datasets: aplicar la sonda sobre conjuntos de preguntas de calibración para identificar subconjuntos donde el backbone Gemma-4-E2B-it muestra alta entropía semántica antes de usarlos en entrenamiento.
- Investigación en detección de alucinaciones: servir como baseline ligero frente a `predictive_entropy`, `semantic_entropy` y `discrete_semantic_entropy` en experimentos comparativos con el mismo backbone y prompt.
- Control de coste en inferencia: sustituir el muestreo múltiple de la entropía semántica clásica por un solo forward pass en entornos donde el presupuesto de cómputo por consulta es limitado.
- Guardrail en asistentes conversacionales: activar respuestas de abstención o mensajes de cautela cuando p(high SE) supere el umbral calibrado, siempre que el sistema acepte el coste de falsos positivos documentado.

## Benchmarks y rendimiento

Evaluación sobre 200 preguntas de benchmark, ninguna de ellas de entrenamiento (verificado por id de pregunta en el momento de publicación), de las cuales 133 fueron alucinadas (la respuesta greedy no contiene ningún alias de la verdad de referencia). AUROC frente a alucinación con intervalo de confianza bootstrap al 95%:

| Detector | AUROC | IC 95% |
|---|---|---|
| `predictive_entropy` | 0.750 | 0.679–0.817 |
| `semantic_entropy_probe` | 0.780 | 0.707–0.847 |
| `semantic_entropy` | 0.790 | 0.733–0.847 |
| `discrete_semantic_entropy` | 0.791 | 0.735–0.848 |

Validación cruzada anidada (5 folds en bucle externo e interno) frente a SE binarizada, media ± desviación típica entre folds:

| Posición de token | Capas (repo) | Capas (paper, probable) | AUROC CV anidada vs SE binarizada | AUROC capa L sola vs SE binarizada |
|---|---|---|---|---|
| TBG (servida) | 19, 20, 21, 22, 23 | 20, 21, 22, 23, 24 | 0.800 ± 0.026 | 0.792 ± 0.041 |
| SLT | 15, 16, 17, 18, 19 | 16, 17, 18, 19, 20 | 0.804 ± 0.036 | 0.712 ± 0.047 |

Umbral recomendado por el entrenamiento: 0.0002279091383144719 (Youden's J sobre probabilidades out-of-fold frente a error del modelo). Sobre las filas de entrenamiento, este umbral detecta errores con TPR 0.886 y FPR 0.434, con una tasa de escalado de 0.728. El valor por defecto de `SEP_THRESHOLD` es 0.5, un placeholder no calibrado para escalado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el backbone se lee en bfloat16, por lo que los requisitos dominantes son los de `google/gemma-4-E2B-it` en bfloat16 más el clasificador lineal, de tamaño despreciable.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende del backbone Gemma-4-E2B-it, cuyos requisitos no se detallan en la model card.
- Opciones de despliegue: integración con `hallucinations-math-lab` mediante `SEP_PROBE_PATH=hf://eladlaor/SEP-gemma-4-E2B-it@v2`; el detector descarga la sonda y exige coincidencia exacta de backbone, revisión, capas, hidden size, chat template e instrucción de respuesta.
- Latencia y throughput: no disponibles; la ventaja declarada frente a entropía semántica clásica es un único forward pass en lugar de 10 muestreos con comparaciones pairwise.

## Comparativa con modelos similares

| Artefacto | Tipo | Backbone | Coste de inferencia | AUROC vs alucinación | Licencia |
|---|---|---|---|---|---|
| `semantic_entropy_probe` (este repo) | Clasificador lineal sobre estados ocultos | Gemma-4-E2B-it (revisión fija) | 1 forward pass | 0.780 (IC 0.707–0.847) | apache-2.0 |
| `semantic_entropy` | Muestreo + clustering semántico | Cualquiera | 10 muestreos + pairwise NLI | 0.790 (IC 0.733–0.847) | no aplica |
| `discrete_semantic_entropy` | Muestreo + clustering semántico discreto | Cualquiera | 10 muestreos + pairwise NLI | 0.791 (IC 0.735–0.848) | no aplica |
| `predictive_entropy` | Entropía de la distribución de tokens | Cualquiera | 1 forward pass | 0.750 (IC 0.679–0.817) | no aplica |

La sonda no supera a la entropía semántica clásica en AUROC (0.780 frente a 0.790–0.791), pero reduce el coste de 10 muestreos más comparaciones de significado a un único forward pass. Su ventaja práctica es el coste; su desventaja, la dependencia estricta de un backbone y una revisión concretos.

## Limitaciones y advertencias

- La puntuación es p(high SE), no una probabilidad de alucinación; el autor lo advierte de forma explícita. No debe interpretarse como tal ni presentarse en nats.
- La sonda fue entrenada para imitar SE binarizada, no para detectar errores directamente; su AUROC debe leerse junto al de SE sobre las mismas preguntas.
- Dependencia estricta del backbone: solo funciona con `google/gemma-4-E2B-it` en la revisión `4adf15748de9e1a0097b6274cee9c15836c41c37`, con 35 capas, hidden size 1536, el chat template con SHA-256 `0a2c8073c878ab1da004bee933a998606537bbb62016310352c7285c3f01c5b5` y la instrucción "Answer the following question as briefly as possible.". Cualquier cambio invalida la sonda.
- El umbral por defecto (0.5) no está calibrado para escalado; el umbral recomendado por el entrenamiento (0.0002279091383144719) produce FPR 0.434 y tasa de escalado 0.728, lo que implica un volumen alto de falsos positivos.
- El conjunto de calibración es pequeño (500 preguntas) y el benchmark de evaluación, de 200 preguntas con 133 alucinadas; los intervalos de confianza son amplios y solapan entre detectores.
- La numeración de capas respecto al paper de Kossen et al. es probable pero no verificada (el autor indica que se leyó del código, sin confirmación).
- El repositorio registra 0 descargas y 0 likes, y un tamaño de 0.0 GB; no hay evidencia de uso en producción ni validación independiente.
- Idiomas soportados: no disponible; no se documenta el comportamiento multilingüe de la sonda.
- Licencia apache-2.0 para la sonda, con enlace a la licencia de Gemma 4 (`https://ai.google.dev/gemma/docs/gemma_4_license`) que rige el backbone; verificar los términos de uso comercial de Gemma 4 antes de desplegar.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eladlaor/SEP-gemma-4-E2B-it
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de calibración: https://huggingface.co/datasets/eladlaor/SEP-gemma-4-E2B-it-calibration
- Repositorio de software: https://github.com/eladlaor/hallucinations-math-lab
- Commit de ajuste: https://github.com/eladlaor/hallucinations-math-lab/tree/38eded82b18454189356373e465ed1c6cb034290
- Paper de referencia (Kossen et al., 2024): https://arxiv.org/abs/2406.15927
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
