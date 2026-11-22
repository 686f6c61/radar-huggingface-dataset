# ma-pmo/release-slip-triage

## Resumen

Release Slip Triage es un artefacto de clasificación tabular publicado por ma-pmo (MA-PMO) que no entrena un modelo nuevo, sino que calibra un umbral de decisión sobre un modelo existente de predicción de retrasos de release. Parte de un clasificador de tipo árbol (release-slip-baseline v2) que asigna a cada issue abierta una probabilidad p de no llegar a su release; la llamada es "se retrasa" si p ≥ 0,5 y "llega" en caso contrario, con confianza max(p, 1−p). El repositorio elige el umbral λ que decide automáticamente cuando la confianza es al menos λ, garantizando que la tasa de error entre las llamadas automáticas se mantenga por debajo de un α objetivo con probabilidad de al menos el 90 %.

El problema que resuelve es concreto: las herramientas de gestión de proyectos con revisión humana (MA-PMO Roadmap 8) usan hoy un umbral fijo de confianza 0,6 sin ninguna cota estadística sobre su tasa de error. Este artefacto sustituye ese umbral fijo por uno derivado con el método Learn then Test de Angelopoulos et al. (2021), con releases como unidad de control, y verifica la garantía en releases posteriores a la calibración.

Es relevante para equipos que despliegan modelos de triaje en producción con supervisión humana: ofrece una política de decisión auditable y reproducible, con intervalos de confianza bootstrap y resultados de test publicados. El repositorio es pequeño (0,0 GB), contiene ficheros skops y un JSON con todos los umbrales y p-valores, y se distribuye bajo CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ensemble de árboles numéricos (modelo de clasificación tabular de sklearn, según release-slip-baseline v2); la política es una tabla de umbrales |
| Parametros totales | no disponible (no aplica: modelo tabular de árboles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada tabular por issue) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no procesa texto libre; opera sobre features numéricas) |
| Licencia | CC BY 4.0 (modelos y política); los scripts Python del repositorio son AGPL-3.0-or-later |
| Formato de pesos | skops (`triage_model_k14.skops`, `triage_model_k28.skops`) y JSON (`triage.json`) |

## Arquitectura y entrenamiento

El modelo subyacente es un ensemble de árboles numéricos con las features y ajustes de release-slip-baseline v2. El entrenamiento se divide por fecha: el 80 % más antiguo de los releases de entrenamiento (hasta 2015) ajusta el modelo; el 20 % más reciente (unos 330 releases, 2015–2017) se usa para calibración; los releases de test (2017–2021) solo se emplean para la comprobación final. Los datos provienen del Public Jira Dataset (Montgomery, Lüders, Maalej; Zenodo v7), adaptado a través del dataset jira-release-slip.

La innovación técnica está en la selección del umbral, no en el clasificador. Los umbrales candidatos se fijan antes de ver ninguna etiqueta de calibración: son los niveles de confianza a los que el 5 %, 10 %, …, 100 % de las llamadas del split de ajuste serían automáticas. Como los errores se agrupan por release (en calibración, las 37 llamadas erróneas entre el 1 % más confiado provienen de un único release, Apache OODT 1.1, donde el 86 % de las issues llegaron pese a que el modelo estaba seguro al 99 % de que se retrasarían), el riesgo controlado es la tasa de error entre llamadas automáticas promediada sobre releases, testeada con la cota de Hoeffding sobre releases a nivel δ/20 para cada uno de los 20 umbrales (Bonferroni, δ = 0,1). Se conserva el λ más bajo que pasa el test.

## Capacidades

- Clasificación tabular binaria: predice si una issue abierta se retrasará o llegará a su release a partir de features numéricas.
- Predicción selectiva con control de riesgo: decide automáticamente solo cuando la confianza supera λ y deriva el resto a revisión humana.
- Garantía estadística explícita: la tasa de error entre llamadas automáticas se mantiene en α o por debajo con probabilidad ≥ 90 %, promediada sobre releases.
- Soporte de dos horizontes: políticas calibradas para k = 14 y k = 28 (offsets de release), con umbrales distintos (λ = 0,726 y λ = 0,808 para α = 0,20).
- Auditoría completa: `triage.json` incluye cada umbral testeado con su p-valor, resultados de calibración y test, y el umbral fijo 0,6 para comparación.
- Reproducibilidad: `train_triage.py` reimplementa el procedimiento completo a partir del dataset y los parámetros del baseline.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Triaje de issues en herramientas de planificación: el modelo decide automáticamente las issues con alta confianza de retraso y envía el resto a un responsable, sustituyendo el umbral fijo 0,6 por uno con cota de error verificada.
- Sustitución de umbrales heurísticos en producción: equipos que ya usan un clasificador de release slip pueden adoptar λ = 0,726 (k = 14) o λ = 0,808 (k = 28) para α = 0,20 sin reentrenar el clasificador, solo cambiando la política de decisión.
- Auditoría de riesgo en pipelines de PMO: `triage.json` permite revisar la tasa de error esperada y los intervalos bootstrap antes de desplegar, lo que facilita la aprobación por parte de compliance.
- Priorización de revisiones humanas: como las llamadas automáticas son casi todas "se retrasa" (31.330 frente a 423 "llega" en k = 14), el sistema concentra la atención humana en las issues que probablemente llegan, que son las que más se benefician de una segunda opinión.
- Calibración sobre releases propios: el script `train_triage.py` permite recalibrar λ con el historial de releases de una organización, requisito explícito del autor para usar la garantía fuera del dataset original.
- Investigación en predicción selectiva: sirve como ejemplo reproducible de Learn then Test con unidades agrupadas (releases) y control de riesgo tipo FDR, aplicable a otros dominios con clustering de errores.
- Evaluación comparativa de políticas de decisión: el JSON con el umbral fijo 0,6 y el garantizado permite comparar cobertura y error en el mismo split de test.

## Benchmarks y rendimiento

Resultados publicados en el test split (releases posteriores, 2017–2021), con intervalos bootstrap del 95 % sobre releases:

| k | política | λ | automáticas | error entre automáticas (media por release) | error entre automáticas (pooled) |
|---|---|---|---|---|---|
| 14 | fijo 0,6 (MA-PMO actual) | 0,60 | 90,6 % [89,6; 91,6] | 15,6 % | 10,9 % [9,8; 12,0] |
| 14 | garantizado α = 0,20 | 0,726 | 76,2 % [74,1; 78,3] | 12,0 % (≤ 20 %: se cumple) | 6,9 % [6,1; 7,8] |
| 28 | fijo 0,6 | 0,60 | 87,9 % [86,8; 88,8] | 18,0 % | 13,8 % [12,6; 15,1] |
| 28 | garantizado α = 0,20 | 0,808 | 53,4 % [50,1; 56,4] | 11,7 % (≤ 20 %: se cumple) | 5,9 % [4,8; 7,6] |

Observaciones del autor: solo α = 0,20 puede garantizarse con unos 330 releases de calibración; α entre 0,05 y 0,15 requeriría más releases (el margen de Hoeffding es de aproximadamente 0,09 en este caso). El umbral fijo 0,6 decide más automáticamente pero no tiene cota de error, y en estos releases posteriores operó al 15,6 % (k = 14) y 18,0 % (k = 28) promediado por release.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un ensemble de árboles de sklearn exportado a skops; no requiere GPU.
- VRAM estimada: 0 GB; el repositorio ocupa 0,0 GB y los modelos son ficheros skops de pequeño tamaño.
- GPU recomendadas: ninguna; cualquier CPU moderna es suficiente.
- Cabe en cualquier equipo de desarrollo, incluidos portátiles de gama baja y contenedores pequeños.
- Despliegue: carga directa con `skops` y `huggingface_hub`; el ejemplo de la model card descarga `triage.json` y lee λ en tiempo de ejecución, sin necesidad de servir el modelo si solo se aplica la política.
- Dependencias: `pip install "ma-pmo[benchmark]==0.9.0" pandas pyarrow skops`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| ma-pmo/release-slip-triage | Política de decisión sobre ensemble de árboles | no disponible | no aplica | CC BY 4.0 (modelos y política); AGPL-3.0 (scripts) | Control de riesgo con Learn then Test y releases como unidad |
| ma-pmo/release-slip-baseline | Ensemble de árboles (clasificador base) | no disponible | no aplica | no disponible en la información proporcionada | Predicción de release slip sin política de decisión calibrada |
| Umbral fijo 0,6 (MA-PMO actual) | Heurística operativa | no aplica | no aplica | no aplica | Decisión automática sin cota de error; 15,6–18,0 % de error en test |

No se dispone de información sobre otros modelos comparables de predicción selectiva aplicada a gestión de proyectos en la documentación proporcionada.

## Limitaciones y advertencias

- La garantía de α = 0,20 depende de que los releases futuros se parezcan a los de calibración; el autor exige recalibrar con releases propios antes de usar λ en otro contexto.
- Solo α = 0,20 es garantizable con unos 330 releases de calibración; α entre 0,05 y 0,15 no alcanzan la cota con estos datos.
- La garantía es conservadora por diseño (cota de Hoeffding sobre releases, Bonferroni sobre 20 umbrales), lo que reduce la cobertura automática.
- Las llamadas automáticas están fuertemente sesgadas hacia "se retrasa" (31.330 frente a 423 "llega" en k = 14); las predicciones de "llega" van casi siempre a revisión humana.
- Los errores se agrupan por release; tratar las issues como independientes sobreestimaría la evidencia, y el artefacto lo evita explícitamente, pero el clustering sigue siendo un riesgo si cambia la composición de los releases.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el clasificador base puede producir predicciones erróneas con alta confianza (caso Apache OODT 1.1).
- Restricciones de licencia: los modelos y la política son CC BY 4.0, pero los scripts Python del repositorio son AGPL-3.0-or-later; MA-PMO ofrece licencia comercial por contacto (mjinttt@gmail.com). Verificar la compatibilidad antes de integrar los scripts en productos propietarios.
- Privacidad: los modelos no contienen filas ni identificadores y los datos de entrenamiento no incluyen IDs de usuario, según PRIVACY.md.
- No procesa texto libre ni features categóricas no numéricas; su alcance es exclusivamente tabular.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ma-pmo/release-slip-triage
- Dataset de entrenamiento: https://huggingface.co/datasets/ma-pmo/jira-release-slip
- Modelo base: https://huggingface.co/ma-pmo/release-slip-baseline
- Colección MA-PMO: https://huggingface.co/collections/ma-pmo/ma-pmo-all-datasets-and-models-6b00ecf0a34e42bafa2866a6
- Paper de Learn then Test: https://arxiv.org/abs/2110.01052
- Public Jira Dataset (Zenodo v7): https://doi.org/10.5281/zenodo.15719919
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode
- Repositorio MA-PMO: https://github.com/ma-pmo/ma-pmo-ext
