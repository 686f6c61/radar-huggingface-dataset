# sallamsaka/M31-Coding-Test

## Resumen

Patient Timeline Forecasting — ens_lr_gbdt_tx es un modelo de clasificación tabular multi-etiqueta publicado por el usuario sallamsaka en HuggingFace bajo el identificador `sallamsaka/M31-Coding-Test`. Su tarea es predecir cuáles de 40 condiciones clínicas se diagnostican por primera vez en los cinco años posteriores a una fecha ancla del paciente, utilizando exclusivamente eventos estructurados de historia clínica electrónica (EHR) registrados estrictamente antes de esa ancla. El modelo se entrenó como ejercicio de investigación para el take-home de un internship en M31 y trabaja únicamente con datos sintéticos generados con Synthea.

El conjunto de datos consta de 3.514 pacientes sintéticos, divididos en 2.791 de entrenamiento, 365 de validación y 358 de prueba. El ancla se define como el último encuentro registrado menos cinco años naturales, truncado a medianoche, y la etiqueta se activa cuando el primer diagnóstico de una condición cae dentro de `[ancla, ancla+5a]`. Los pacientes ya diagnosticados antes del ancla se tratan como prevalentemente negativos y se reportan por separado, no como negativos ordinarios.

La relevancia del artefacto es fundamentalmente metodológica: no es un modelo clínico ni un LLM, sino un banco de pruebas reproducible sobre control de fuga de datos, validación temporal y límites de los datos sintéticos. Su licencia MIT y su tamaño (repo de 0,0 GB) lo hacen trivial de desplegar en CPU, pero el propio autor advierte que no es un dispositivo clínico y que no debe usarse para ninguna decisión sobre una persona real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de regresión logística y GBDT sobre características tabulares (deducido del nombre `ens_lr_gbdt_tx`; no confirmado explícitamente en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial; el número de características de entrada no está disponible) |
| Tipos de cuantizacion | no aplica / no disponible |
| Idiomas soportados | no aplica (entrada tabular, sin texto libre) |
| Licencia | MIT |
| Formato de pesos | joblib (serialización de scikit-learn, según el tag `joblib`); no confirmado explícitamente en la model card |

## Arquitectura y entrenamiento

La model card no describe en detalle la arquitectura interna. El nombre del artefacto (`ens_lr_gbdt_tx`) y la etiqueta `joblib` apuntan a un ensemble de regresión logística y árboles con boosting de gradiente serializado con joblib, operando sobre un vector de características tabulares derivado de eventos EHR. La tarea es multi-etiqueta sobre 40 condiciones objetivo, con salida probabilística por condición.

El entrenamiento usa 2.791 pacientes Synthea, con 365 para validación y 358 para prueba. Toda estadística ajustada (vocabulario, cuantiles, escaladores) se ajusta solo con pacientes de entrenamiento, y 63 comprobaciones automáticas cubren este control, incluida una prueba de tipo grep que verifica que ningún módulo fuera de la utilidad temporal analiza marcas de tiempo. Las columnas `DEATHDATE`, `HEALTHCARE_EXPENSES` y `HEALTHCARE_COVERAGE` se rechazan en tiempo de carga, y las duraciones derivadas de `STOP` se excluyen porque los organizadores borraron los stops posteriores al ancla en el split de prueba, lo que introduciría fuga y desplazamiento de distribución. No hay RLHF ni DPO: no aplica a este tipo de modelo.

El punto crítico del diseño es que el ancla se deriva del último encuentro de cada paciente. En el 42,9% de los pacientes de entrenamiento con fecha de fallecimiento, la ventana de resultado coincide exactamente con sus últimos cinco años de vida, y el 100% de esas muertes cae dentro de los 30 días posteriores al final de la ventana. Buena parte de la señal aprendida es, por tanto, "este registro está a punto de terminar", una propiedad de la construcción de la tarea y no de predicción clínica. El autor aclara que esto no es fuga (la misma regla generó las anclas de prueba), pero acota la interpretación de los resultados.

## Capacidades

- Clasificación tabular multi-etiqueta: estima, para cada uno de los 40 diagnósticos objetivo, la probabilidad de primera aparición en los cinco años posteriores al ancla.
- Manejo explícito de pacientes prevalentes: los ya diagnosticados antes del ancla se marcan como estructuralmente negativos y se reportan aparte.
- Consumo exclusivo de eventos EHR estructurados anteriores al ancla; no procesa texto libre, imágenes ni señales.
- Salida probabilística por condición, apta para umbralización posterior o ranking de riesgo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües (entrada no textual).
- Sin modo de pensamiento, visión ni audio.

## Casos de uso

- Reproducción de experimentos de investigación: el repositorio permite clonar, instalar dependencias y ejecutar `./run_all.ps1` para reproducir las métricas de validación, útil como referencia metodológica en trabajos sobre EHR sintéticos.
- Auditoría de fuga de datos en pipelines clínicos: las 63 comprobaciones automáticas y el rechazo en carga de `DEATHDATE`, `HEALTHCARE_EXPENSES` y `HEALTHCARE_COVERAGE` sirven como plantilla para diseñar controles equivalentes en proyectos con datos reales.
- Prototipado de modelos de riesgo poblacional: permite montar de punta a punta una tubería de predicción a cinco años con datos sintéticos antes de disponer de accesos a MIMIC u otras cohortes reales.
- Docencia y formación: el desequilibrio extremo entre macro AUROC (0,7700) y macro AP (0,2681) es un caso práctico para enseñar por qué la precisión media es más informativa que el AUROC en etiquetas raras.
- Comparación de familias de modelos tabulares: la combinación de regresión logística y GBDT permite estudiar empíricamente en qué condiciones un modelo lineal compite con boosting sobre características EHR dispersas.
- Evaluación de transferibilidad sintético→real: el propio autor cita un estudio en el que, sobre 19 conjuntos de datos de salud, el clasificador ganador coincidió entre modelos entrenados con datos reales y sintéticos en solo el 21-26% de los casos, lo que convierte este artefacto en un caso de estudio de ese problema.
- Línea base para futuros modelos sobre la misma tarea: cualquiera que aborde la predicción de primera incidencia a cinco años puede usar estos dos números (0,7700 y 0,2681) como referencia documentada y con intervalos de incertidumbre declarados.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| val_macro_auroc | 0.7700 | Validación (n=365) |
| val_macro_ap | 0.2681 | Validación (n=365) |

Advertencias de interpretación declaradas por el autor: el conjunto de validación solo resuelve diferencias de aproximadamente ±0,01 en macro AUROC; el AUROC por condición de la etiqueta más rara (5 positivos) tiene un intervalo de confianza del 95% de Hanley–McNeil de aproximadamente ±0,24. Cualquier número por debajo de esa separación se reporta pero no debe leerse como un ranking. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: insignificante; el repositorio ocupa 0,0 GB y el modelo es un ensemble tabular serializado con joblib.
- GPU recomendadas: no se requiere GPU. Un ensemble de regresión logística y GBDT sobre 3.514 pacientes se ejecuta en CPU sin problema.
- Cabe en cualquier GPU de consumo y, de hecho, no necesita ninguna. También en CPU de portátil y en entornos sin acelerador.
- Opciones de despliegue: carga directa del artefacto joblib desde Python con scikit-learn. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada, aunque por la naturaleza del modelo y el tamaño del conjunto se espera un coste de inferencia muy bajo.
- Dependencias de reproducción: `git clone https://github.com/Sallamsaka/M31-Coding-Test && pip install -r requirements.txt && ./run_all.ps1` (script en PowerShell).

## Comparativa con modelos similares

No se han proporcionado modelos comparables en la información disponible. La model card no incluye comparación con otras arquitecturas sobre la misma tarea, y no se documentan líneas base alternativas más allá de las métricas del propio ensemble.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ens_lr_gbdt_tx (este modelo) | no disponible | no aplica | macro AUROC 0,7700 / macro AP 0,2681 (validación) | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

El único dato comparativo indirecto que aporta el autor es externo a la tarea: un discriminador separa datos de Synthea de datos de MIMIC con AUC 0,999, y sobre 19 conjuntos de datos de salud el clasificador ganador coincidió entre modelos entrenados con datos reales y sintéticos en solo el 21-26% de los casos. Es decir, el autor advierte explícitamente de que el ranking obtenido aquí no debe asumirse transferible.

## Limitaciones y advertencias

- No es un dispositivo clínico y no puede usarse para ninguna decisión sobre una persona real. El propio autor lo declara de forma explícita.
- Entrenado exclusivamente con datos sintéticos de Synthea. Un discriminador distingue Synthea de MIMIC con AUC 0,999, lo que indica una separación casi perfecta entre ambas distribuciones.
- Riesgo de transferibilidad: sobre 19 conjuntos de datos de salud, los clasificadores ganadores entrenados con datos reales y con datos sintéticos coincidieron solo en el 21-26% de los casos.
- Sesgo estructural de la tarea: en el 42,9% de los pacientes de entrenamiento con fecha de fallecimiento, la ventana de predicción coincide con sus últimos cinco años de vida y el 100% de esas muertes ocurre en los 30 días finales de la ventana. Gran parte de la señal aprendida es "el registro está a punto de terminar".
- Prevalentes tratados como estructuralmente negativos: los pacientes ya diagnosticados antes del ancla no se cuentan como negativos ordinarios, lo que afecta a la interpretación de las métricas si se comparan con otros trabajos.
- Incertidumbre elevada en etiquetas raras: la etiqueta más rara tiene 5 positivos y un intervalo de Hanley–McNeil de aproximadamente ±0,24 en AUROC.
- Poder de resolución limitado: el conjunto de validación solo distingue diferencias de aproximadamente ±0,01 en macro AUROC.
- Desequilibrio severo de clases reflejado en la brecha entre macro AUROC (0,7700) y macro AP (0,2681).
- La licencia MIT permite uso comercial del artefacto, pero eso no legitima su uso clínico ni con datos de personas reales.
- Las duraciones derivadas de `STOP` se excluyen deliberadamente porque los stops posteriores al ancla se borraron en el split de prueba; reintroducirlas produciría fuga y desplazamiento de distribución.
- Dependencia del script de reproducción en PowerShell (`run_all.ps1`), lo que puede requerir adaptación en entornos Linux o macOS.
- No hay información sobre idiomas, cuantizaciones ni formatos alternativos de pesos, porque no aplican a este tipo de modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sallamsaka/M31-Coding-Test
- Repositorio de código: https://github.com/Sallamsaka/M31-Coding-Test
