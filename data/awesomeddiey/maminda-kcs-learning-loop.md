# awesomeddiey/Maminda-KCS-Learning-Loop

## Resumen

Maminda KCS Learning Loop es un conjunto de modelos XGBoost para regresión tabular publicado por el usuario awesomeddiey, procedente de un proyecto de fin de carrera de la Chinhoyi University of Technology (Zimbabue). No es un modelo de lenguaje: resuelve dos tareas concretas sobre datos de explotaciones agrícolas de pequeños productores de Mashonaland West. La primera es la previsión de rendimiento en toneladas por hectárea mediante un regresor independiente para cada cultivo (maíz, patata y tomate). La segunda es la estimación de la probabilidad de que un préstamo agrícola se devuelva íntegramente en la fecha de vencimiento, combinando esas mismas variables agronómicas con la cobertura de caja proyectada, el calendario de pago y el historial de devolución.

La aportación diferencial del repositorio no es el modelo en sí, sino el bucle de aprendizaje que lo rodea: un mecanismo de reentrenamiento que solo aprende de resultados reales (cosecha pesada al final de la temporada y devoluciones efectivas), utiliza datos sintéticos como prior con un peso controlado y promueve un candidato a modelo campeón únicamente si supera al vigente en validación cruzada agrupada por agricultor. La release activa, `v0-synthetic-prior`, no contiene ningún resultado real de Mashonaland West: sus etiquetas de crédito son íntegramente simuladas.

El interés actual del artefacto es metodológico. Documenta con detalle un patrón útil para dominios con datos escasos y etiquetas caras: arrancar con un prior sintético, medir cuánto ayuda ese prior a medida que llegan resultados reales y retirarlo progresivamente. Los propios autores advierten de que toda la evidencia publicada proviene de simuladores y no dice nada sobre la precisión en explotaciones reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ensamblado de árboles con refuerzo de gradiente (XGBoost): un regresor por cultivo (maíz, patata, tomate) y un clasificador de devolución |
| Parámetros totales | no disponible (la model card no publica número de árboles, profundidad ni número de hojas) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; no existe ventana de contexto. Entrada: 10 variables agronómicas y hasta 8 variables financieras) |
| Tipos de cuantización | no disponible (no se documenta cuantización; los árboles XGBoost no se distribuyen en formatos GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la propia HuggingFace marca los idiomas como no disponibles; las etiquetas del modelo están en inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible. El repositorio contiene código Python y artefactos del modelo bajo `releases/`; el tag `onnx` figura en los metadatos de HuggingFace, aunque la model card no documenta una exportación ONNX |
| Librería y versión | `xgboost==3.4.1`, con `numpy` y `pandas` (y `scikit-learn` para reentrenar) |
| Pipeline declarado | `tabular-regression` |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sistema se organiza en dos cabezas superpuestas a una misma representación de entrada. La primera es un regresor XGBoost por cultivo que predice rendimiento en t/ha a partir de una puntuación de salud del cultivo obtenida de una fotografía cenital de hoja (producida por el clasificador Mashonaland Crop Classifier YOLO26n), el índice NDVI de Sentinel-2, siete lecturas de sonda de suelo (humedad, temperatura, N, P, K, pH y conductividad eléctrica) y los días transcurridos desde la plantación. La segunda es un clasificador XGBoost que añade a esas variables la cobertura de caja proyectada (rendimiento previsto × superficie × precio, menos costes y necesidades del hogar, más otra caja disponible), la fecha de vencimiento y el historial de devolución previo, y devuelve la probabilidad de pago íntegro. Esa probabilidad se mapea a una escala de 300 a 850 denominada KCS: 0,90 de probabilidad corresponde a 600 y cada duplicación de las odds de devolución suma 50 puntos. Los autores subrayan que es una convención de presentación, no una política aprobada por ningún prestamista.

El entrenamiento de la release activa combina rendimientos simulados para los tres cultivos, diez medias de campo-temporada de maíz de EE. UU. procedentes del dataset público Genomes to Fields 2022 (solo maíz) y resultados de préstamos simulados. El bucle de aprendizaje implementado en `learning_loop/outcomes.py` y `learning_loop/learning_loop.py` registra cosechas y devoluciones, vincula cada devolución a la estimación exacta que puntuó el préstamo y audita las correcciones; las cosechas estimadas por el propio agricultor se almacenan pero nunca se usan como etiqueta. El reentrenamiento trata los datos sintéticos como un prior con peso equivalente a S ejemplos reales, de modo que con n resultados reales la cuota sintética del peso de entrenamiento es S/(S+n). Se generan varios candidatos (recalibración del modelo vigente y reentrenamientos con distintas fuerzas de prior, incluido S = 0, es decir, solo datos reales), se evalúan mediante validación cruzada agrupada por agricultor sobre resultados que la release vigente nunca vio y solo se promueve el candidato si mejora al campeón. Cada release queda versionada y con suma de comprobación en `releases/registry.json`.

## Capacidades

- Predicción de rendimiento agrícola en t/ha para maíz, patata y tomate mediante regresores independientes.
- Estimación de probabilidad de devolución íntegra de un préstamo en la fecha de vencimiento, con salida auxiliar de puntuación KCS en escala 300-850.
- Integración de señales heterogéneas: NDVI de satélite, siete lecturas de sonda de suelo, puntuación de salud del cultivo derivada de imagen y días desde la plantación.
- Modelado explícito de la capacidad de pago a través de la cobertura de caja proyectada, no solo de la voluntad histórica de pago.
- Aprendizaje continuo a partir de resultados: registro de cosechas y devoluciones, generación de candidatos, evaluación agrupada por agricultor y promoción condicionada.
- Control de la contribución de datos sintéticos mediante el hiperparámetro S y la regla de peso S/(S+n).
- Versionado reproducible con registro de releases y sumas de comprobación.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni modalidades de visión o audio; cualquier capacidad de visión es responsabilidad del clasificador externo que alimenta la variable `cv_health_score_0_100`.

## Casos de uso

- Previsión de rendimiento por parcela y temporada: el regresor de maíz, patata o tomate estima t/ha con las lecturas de sonda, el NDVI y los días desde la plantación, lo que permite planificar capacidad de almacenamiento y calendario de venta antes de la cosecha.
- Puntuación de crédito para productores sin historial bancario: el clasificador de devolución convierte variables agronómicas y de caja en una probabilidad y una puntuación KCS, útil para entidades de microfinanzas que necesitan una señal cuantitativa sobre productores sin historial formal.
- Simulación de escenarios de cobertura de caja: al exponer por separado superficie, precio en explotación, costes restantes, otra caja disponible y necesidades del hogar, permite estimar cómo cambia la probabilidad de pago ante variaciones de precio o de rendimiento.
- Despliegue del bucle de aprendizaje en una cooperativa: `outcomes.py` recoge el peso real de la cosecha y el estado de cada devolución, y `learning_loop.py` reentrena y solo promueve el candidato que mejora en validación agrupada por agricultor, evitando que un agricultor concreto domine el ajuste.
- Investigación metodológica sobre priors sintéticos: el repositorio sirve como implementación de referencia para experimentar con la regla de peso S/(S+n) y medir cuánto ayuda el dato simulado cuando los resultados reales son escasos.
- Integración en canal de datos agronómico: el código de ejemplo descarga la release activa con `snapshot_download`, resuelve la versión vigente desde `registry.json` e importa `model_core.assess`, lo que facilita insertar la puntuación en un pipeline existente de IoT y teledetección.
- Docencia y validación de proyectos de ciencia de datos aplicada: el repositorio incluye simuladores, curvas de aprendizaje y figuras de resultados que permiten reproducir el experimento completo con fines académicos.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar de la industria (MMLU, HumanEval, GSM8K). Publica exclusivamente una evaluación interna ejecutada contra un simulador deliberadamente distinto del usado para generar los datos, descrito como «realidad de campo» (rendimientos de pequeño productor más bajos, límites de nitrógeno y sequía más severos, enfermedad más agresiva y shocks de devolución por venta paralela). El test abarcó 6 temporadas con 140 campo-temporadas por temporada y 3 ejecuciones, y se puntuó sobre 1.500 explotaciones no vistas por cultivo y 4.500 préstamos no vistos.

Error absoluto medio de rendimiento (t/ha):

| Cultivo | Solo sintético | Bucle tras 1 temporada | Solo real tras 1 temporada | Bucle tras 6 temporadas | Solo real tras 6 temporadas |
|---|---:|---:|---:|---:|---:|
| Maíz | 1,28 | 0,55 | 0,61 | 0,53 | 0,52 |
| Patata | 4,27 | 4,11 | 4,87 | 3,95 | 3,92 |
| Tomate | 7,04 | 6,43 | 7,46 | 5,99 | 6,12 |

Modelo de devolución:

| Métrica | Solo sintético | Bucle tras 1 temporada | Solo real tras 1 temporada | Bucle tras 6 temporadas | Solo real tras 6 temporadas |
|---|---:|---:|---:|---:|---:|
| Log loss | 0,553 | 0,549 | 0,617 | 0,543 | 0,552 |
| ROC AUC | 0,752 | 0,760 | 0,672 | 0,761 | 0,748 |

Los autores concluyen que el método corrige un prior mal especificado y que el prior ayuda mientras el dato real es escaso. Advierten de forma explícita de que ambos lados del test son simuladores y de que los resultados no dicen nada sobre la precisión en explotaciones reales.

## Requisitos de hardware

- VRAM estimada: no disponible. La model card no publica huella de memoria; se trata de un ensamblado de árboles XGBoost sobre datos tabulares, no de una red neuronal densa.
- GPU recomendadas: no disponibles. No se documenta entrenamiento ni inferencia en GPU.
- Viabilidad en GPU de consumo: no documentada. El repositorio declara `xgboost==3.4.1`, `numpy` y `pandas` como dependencias, sin requisitos de acelerador.
- Opciones de despliegue: uso directo de la librería XGBoost mediante `model_core.assess` tras resolver la release activa en `releases/registry.json`; el tag `onnx` sugiere una posible exportación, pero no hay documentación al respecto. No aplican vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables de la misma categoría (puntuación de crédito agrícola con regresión tabular para pequeños productores en Zimbabue). El clasificador Mashonaland Crop Classifier YOLO26n que aparece en la documentación es un componente de entrada del pipeline, no una alternativa.

| Modelo | Arquitectura | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Maminda KCS Learning Loop | XGBoost (3 regresores + 1 clasificador) | rendimiento agrícola y probabilidad de devolución | no aplica | MIT | público en HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La release activa no contiene ningún resultado real de Mashonaland West. Las etiquetas de crédito son íntegramente simuladas y el modelo no debe usarse para decisiones de concesión de préstamos reales.
- Las relaciones entre NPK, pH, conductividad eléctrica y puntuación de salud del cultivo se aprenden por simulación. Las cabezas de patata y tomate son exclusivamente simuladas.
- Las sondas de NPK, pH y conductividad eléctrica no están calibradas contra mediciones de laboratorio; que compartan unidades no establece equivalencia.
- La evidencia de evaluación procede de dos simuladores, uno frente a otro. No hay validación de campo publicada.
- La escala KCS es una convención de presentación (0,90 → 600; cada duplicación de odds suma 50 puntos) y no una política aprobada por ningún prestamista.
- Riesgo de alucinación no aplica en el sentido de los modelos generativos, pero sí existe riesgo de extrapolación silenciosa: XGBoost puede producir predicciones poco fiables fuera del rango de las variables de entrenamiento, y la model card no documenta esos rangos.
- Sesgo potencial: el único dato real de campo procede de diez medias de maíz de EE. UU. (Genomes to Fields 2022), un contexto agronómico distinto del de Mashonaland West.
- Idiomas no declarados; la documentación y las etiquetas están en inglés, lo que limita su uso directo por personal no anglófono.
- Licencia MIT: permite uso comercial y modificación con atribución, pero la licencia no otorga ninguna garantía sobre la idoneidad del modelo para decisiones crediticias, que en muchas jurisdicciones están sujetas a requisitos regulatorios adicionales.
- Dependencia de un componente externo (el clasificador de salud del cultivo) para una de las variables de entrada, lo que añade un punto de fallo y un sesgo potencial no cuantificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/awesomeddiey/Maminda-KCS-Learning-Loop
- Demo: https://huggingface.co/spaces/awesomeddiey/Maminda-KCS-Research-Lab
- Clasificador de cultivos Mashonaland (YOLO26n): https://huggingface.co/awesomeddiey/Mashonaland-Crop-Classifier-YOLO26n
- Dataset Genomes to Fields 2022: https://doi.org/10.25739/3d3g-pe51
