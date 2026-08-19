# artaquest/artamodel

## Resumen

ArtaModel es un modelo de aprendizaje automático desarrollado por ArtaQuest Foundation (Arash Ashrafnejad) en agosto de 2026, que predice la probabilidad de que un matrimonio dure al menos treinta años a partir de tres fechas y dos lugares: la fecha y lugar de nacimiento de cada cónyuge y la fecha de la boda. El modelo se basa en la astrología sidérea (con el ayanāṁśa de Lahiri) y utiliza las longitudes de catorce cuerpos celestes (Sol, Luna, planetas clásicos, nodos, Quirón y Lilith) calculadas con la efeméride suiza a través de la librería Kerykeion.

A diferencia de los modelos de lenguaje o visión, ArtaModel no es una red neuronal, sino un conjunto de gradient boosting sobre campos de fase planetaria. El estudio que lo acompaña (ARTAMODEL.md) es honesto y revelador: el rendimiento del modelo (AUC ≈ 0.62–0.64) se explica casi por completo por las edades de los contrayentes en el momento de la boda y la diferencia de edad entre ellos, leídas a través de los planetas exteriores como relojes. El modelo es invariante al ayanāṁśa, a la hora de nacimiento y al lugar de nacimiento, y no añade nada a un modelo simple basado en las edades. Su relevancia radica en ser un caso de estudio metodológico sobre cómo evaluar rigurosamente un modelo con señales espurias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre campos de fase (split single-sum fields) |
| Parametros totales | No disponible (31 etapas con pesos por etapa, almacenados en JSON) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No aplica (pesos en punto flotante, formato JSON) |
| Idiomas soportados | No aplica (modelo numerico, sin procesamiento de lenguaje) |
| Licencia | CC0-1.0 |
| Formato de pesos | JSON (artamodel_deployed.json) y codigo Python (artamodel.py, artamodel_ensemble.py, artamodel_deploy.py) |

## Arquitectura y entrenamiento

ArtaModel no es un transformer ni un modelo de lenguaje. Su arquitectura es un ensemble de gradient boosting sobre campos de fase. Cada etapa del boosting selecciona un fasor (una fase planetaria) de entre 84 posibles, correspondientes a seis términos: sinastría (diferencia de longitudes entre los dos nacimientos), tránsito a la madre (fecha de boda menos carta natal de la madre), tránsito al padre, longitudes natales de la madre, del padre y la carta de la boda. Cada término se modela como `|bₖ + wₖ·e^{iφ}|²` y se añade al logit con un paso y un coeficiente. El entrenamiento se realizó sobre 16.802 parejas (todas las filas con ambas cartas natales), con 31 etapas seleccionadas mediante una validación temporal interna. No se utilizó RLHF ni DPO; es un ajuste supervisado clásico con AUC como métrica.

El modelo final seleccionó solo 6 de los 84 fasores, todos ellos de planetas exteriores: Urano en el término de sinastría (12 etapas), Plutón, Neptuno y Urano en el término de tránsito al padre, y Plutón y Saturno en el término de tránsito a la madre. Ningún cuerpo rápido, ninguna fase natal ni la carta de la boda fueron elegidos. El estudio demuestra que estos fasores actúan como relojes de edad: Urano (4,3°/año) mide la diferencia de edad entre los nacimientos, y los planetas exteriores miden la edad de cada cónyuge en la boda.

## Capacidades

- Predicción de probabilidad de que un matrimonio dure 30 años o más, dado un conjunto de fechas y lugares.
- Cálculo de fases sidéreas (Lahiri) mediante Kerykeion y Swiss Ephemeris.
- Manejo de datos incompletos: si falta la fecha de boda, se eliminan los términos de tránsito; si falta un nacimiento, se eliminan los términos de ese cónyuge; una fase ausente contribuye exactamente cero.
- Invariancia al ayanāṁśa, a la hora de nacimiento y al lugar de nacimiento (por construcción matemática).
- Interpretabilidad: cada etapa del boosting corresponde a un fasor concreto, y se puede desglosar la contribución de cada término a la probabilidad final.
- No soporta generación de texto, código, visión, tool calling ni capacidades de agente.

## Casos de uso

- Estudio metodológico de validación de modelos con señales espurias: ArtaModel sirve como ejemplo didáctico de cómo un modelo puede parecer predictivo cuando en realidad está capturando variables de confusión (las edades). Útil en cursos de ciencia de datos y ética de la IA.
- Astrología computacional: investigadores o aficionados a la astrología sidérea pueden usar el modelo para explorar correlaciones entre fases planetarias y eventos vitales, aunque el propio estudio desaconseja interpretaciones causales.
- Análisis demográfico retrospectivo: dado un conjunto de parejas con fechas de nacimiento y boda, el modelo puede estimar la probabilidad de duración del matrimonio, aunque un modelo logístico con las edades sería igual de eficaz y más simple.
- Auditoría de sesgos en modelos predictivos: el código y el estudio permiten reproducir el análisis y comprobar cómo la selección de características (fasores) puede enmascarar variables subyacentes.
- Desarrollo de pipelines de extracción de fases astronómicas: el módulo `kerykeion_phases.py` puede reutilizarse para otros proyectos que necesiten longitudes sidéreas de cuerpos celestes.
- Comparación de métricas de rendimiento fuera de tiempo: el estudio incluye una validación temporal (parejas nacidas después de 1900) que puede servir de referencia para metodologías de hold-out temporal en otros dominios.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AUC (validación temporal interna, parejas nacidas tras 1900) | 0.6320 |
| AUC (hold-out temporal estimado) | ≈ 0.62–0.64 |
| AUC de un modelo LightGBM con columnas planas (edades, gap, año de inicio) | 0.6189–0.6371 |
| AUC del mismo modelo con edades fijadas (dentro de celdas de 3 años) | ≈ 0.50 |
| AUC del modelo usando solo el Sol | 0.47 |
| AUC del modelo usando solo Urano | igual al modelo completo |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje ni de razonamiento general.

## Requisitos de hardware

- Inferencia en CPU: el modelo es extremadamente ligero (31 etapas con operaciones complejas sobre fasores). No requiere GPU.
- Memoria RAM: menos de 100 MB para cargar los pesos y las dependencias (numpy, kerykeion, timezonefinder).
- GPU recomendada: ninguna; cualquier CPU moderna ejecuta la predicción en milisegundos.
- Compatible con ordenadores de bajo consumo, Raspberry Pi o entornos serverless.
- Despliegue: el código Python proporcionado (`artamodel_score.py`) es suficiente; no se necesita vLLM, llama.cpp, Ollama ni TGI.
- Latencia: inferior a 10 ms por predicción en hardware estándar.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la misma categoría (predicción de duración matrimonial basada en astrología sidérea). El propio estudio compara ArtaModel con un modelo LightGBM de referencia sobre las mismas columnas de edad, pero no con otros modelos astrológicos.

## Limitaciones y advertencias

- El modelo no tiene capacidad predictiva real más allá de las edades de los contrayentes; el estudio lo demuestra explícitamente. Cualquier uso como herramienta de predicción matrimonial carece de fundamento científico.
- Sesgo inherente: los datos provienen de un dataset específico (artamatch-sidereal) con convenciones particulares (nacimientos a las 09:00 hora local, boda a las 12:00 UT). Esto limita la generalización a otras poblaciones.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo.
- Limitaciones de contexto o idioma: no aplica, es un modelo numérico.
- Licencia CC0-1.0: permite uso comercial y modificación sin restricciones, pero el autor recomienda leer el estudio completo antes de cualquier uso.
- Para producción: no se recomienda su uso en aplicaciones reales de toma de decisiones (por ejemplo, seguros o asesoramiento matrimonial) debido a su falta de validez predictiva más allá de las variables demográficas.

## Enlaces

- HuggingFace: https://huggingface.co/artaquest/artamodel
- Dataset en Kaggle: https://www.kaggle.com/datasets/artaquest-foundation/artamatch-sidereal
- Competición en Kaggle: https://www.kaggle.com/competitions/artamatch-sidereal
- Estudio técnico (ARTAMODEL.md): disponible en el repositorio del modelo (no se proporciona URL directa en la información disponible)
