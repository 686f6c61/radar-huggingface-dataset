# HassanB4/warfarisk-baselines

## Resumen

WarfaRisk Phase 1 Baselines es un conjunto de tres modelos de regresión tabular publicados por el equipo WarfaRisk de la Universidad Alfaisal (Riad, Arabia Saudí) para la predicción de la dosis semanal estable de warfarina. El repositorio, alojado en Hugging Face bajo el identificador `HassanB4/warfarisk-baselines`, establece el suelo de rendimiento (performance floor) para un pipeline reproducible de nueve fases que combina características clínicas y farmacogenómicas. Los tres baselines son: un predictor ingenuo basado en la mediana de la dosis, una regresión lineal solo con variables clínicas y una implementación manual de la ecuación farmacogenética publicada por el IWPC (International Warfarin Pharmacogenetics Consortium) en 2009.

El modelo es relevante porque la warfarina tiene un índice terapéutico muy estrecho: la dosis estable varía hasta diez veces entre pacientes, y el margen entre infradosificación (tromboembolismo) y sobredosificación (hemorragia mayor) es clínicamente decisivo. Este repositorio proporciona una referencia reproducible y transparente para evaluar cualquier modelo posterior del proyecto, que solo se considera una mejora si supera el MAE de 9,177 mg/semana de la ecuación IWPC. Está implementado con scikit-learn y joblib, no es un modelo de lenguaje ni de redes neuronales, y su tamaño es despreciable (0,0 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal (OLS) y ecuacion farmacogenetica publicada (IWPC 2009); predictor ingenuo por mediana |
| Parametros totales | No aplica (modelos estadisticos clasicos, no redes neuronales) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (entrada tabular, no texto) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Ingles (etiquetas y documentacion; los datos son numericos) |
| Licencia | Apache 2.0 |
| Formato de pesos | joblib (scikit-learn) para la regresion lineal; funcion Python para la ecuacion IWPC |

## Arquitectura y entrenamiento

El repositorio contiene tres baselines independientes, no un unico modelo. El primero es un predictor ingenuo que siempre devuelve la mediana de la dosis del conjunto de entrenamiento, sirviendo como cota inferior de rendimiento. El segundo es una regresion lineal por minimos cuadrados ordinarios (OLS) que utiliza exclusivamente caracteristicas clinicas: edad, peso, altura, indicacion, comorbilidades y flags de medicacion concomitante, sin informacion genetica. El tercero es una implementacion manual de la ecuacion farmacogenetica publicada por el IWPC en *New England Journal of Medicine* (2009;360:753-64), que incorpora genotipos de CYP2C9 y VKORC1 mediante una transformacion de raiz cuadrada de la dosis.

El entrenamiento se realizo sobre el cohorte IWPC-6256, con 4.830 muestras de entrenamiento y 1.207 de test tras una particion a nivel de paciente (80/20) con semilla fija `20260725`. Se audito la fuga de datos con 11 comprobaciones, todas superadas, y el preprocesado se ajusto solo con el fold de entrenamiento. Los coeficientes de la ecuacion IWPC se transcribieron de la forma publica ampliamente citada (la misma que usan calculadoras como warfarindosing.org), no directamente de la Tabla 2 del articulo original, y esta limitacion se declara explicitamente en la documentacion.

## Capacidades

- Prediccion de dosis semanal estable de warfarina en mg/semana a partir de caracteristicas clinicas y farmacogenomicas.
- Regresion tabular clasica con interpretabilidad total: los coeficientes de la regresion lineal y de la ecuacion IWPC son directamente inspeccionables.
- Reproducibilidad rigurosa: particion fija, semilla documentada y auditoria de fugas.
- Comparacion de rendimiento con tres metricas: MAE, R2 y PW20 (proporcion de predicciones dentro del 20% de la dosis real).
- No soporta generacion de texto, tool calling, agentes, vision ni audio. Es exclusivamente un modelo de regresion numerica.

## Casos de uso

- Investigacion en farmacogenomica: sirve como referencia obligatoria para evaluar cualquier modelo de prediccion de dosis de warfarina en el proyecto WarfaRisk; ningun modelo se reporta como mejora si no supera el MAE de 9,177 de la ecuacion IWPC.
- Auditoria de modelos clinicos: permite comparar rapidamente el rendimiento de un modelo nuevo contra tres baselines establecidos, identificando si la complejidad anadida (p. ej., redes neuronales o gradient boosting) aporta una ventaja real.
- Educacion en metodos de regresion: los tres baselines ilustran la progresion desde un predictor ingenuo hasta una ecuacion farmacogenetica, util para ensenar conceptos de sesgo, varianza y seleccion de caracteristicas.
- Desarrollo de pipelines reproducibles: el codigo fuente en GitHub (`HasanBGit/WarfaRisk`) documenta el flujo completo de nueve fases, y estos baselines son el punto de partida para reproducir el pipeline en otros cohortes.
- Evaluacion de la brecha clinica: el PW20 de 0,429 (por debajo del umbral de aceptabilidad clinica de 0,50) cuantifica la distancia entre los metodos actuales y la precision necesaria para uso clinico, orientando futuras investigaciones.
- Integracion en sistemas de soporte a la decision (solo investigacion): la funcion `iwpc_published_equation_predict()` puede integrarse en entornos de investigacion para generar predicciones de referencia sin necesidad de entrenar un modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, evaluados sobre IWPC-6256 (n_test=1.207):

| Baseline | MAE (mg/semana) | R2 | PW20 |
|---|---|---|---|
| Naive mediana | 12,339 | -0,048 | 0,342 |
| Regresion lineal solo clinica | 10,860 | 0,222 | 0,354 |
| Ecuacion IWPC publicada | 9,177 | 0,413 | 0,429 |

El model-index oficial reporta para la ecuacion IWPC un MAE de 9,177 y un R2 de 0,413, coincidiendo con la tabla anterior. El umbral de aceptabilidad clinica del propio IWPC (PW20 >= 0,50) no se alcanza en ninguno de los tres baselines. No se han publicado resultados de benchmarks en la informacion disponible para otros conjuntos de datos.

## Requisitos de hardware

- Inferencia en CPU: los tres baselines son modelos estadisticos clasicos con decenas de parametros, ejecutables en cualquier maquina, incluidos portatiles o entornos de CI.
- VRAM: no requiere GPU. La regresion lineal y la ecuacion IWPC se ejecutan en memoria RAM convencional (menos de 100 MB).
- GPU recomendadas: ninguna. Si se desea comparar con modelos mas complejos del proyecto (p. ej., AutoGluon), se puede usar una GPU modesta, pero no es necesaria para estos baselines.
- Opciones de despliegue: carga directa con `joblib.load()` tras descargar el archivo desde Hugging Face Hub; la ecuacion IWPC es una funcion Python pura. No requiere vLLM, llama.cpp ni Ollama.
- Latencia: del orden de microsegundos por prediccion, dado el tamano trivial de los modelos.

## Comparativa con modelos similares

No hay modelos comparables directamente en el mismo repositorio, pero el proyecto WarfaRisk publica modelos mas avanzados en la misma coleccion de Hugging Face. Segun la informacion disponible:

| Modelo | Tipo | MAE (mg/semana) | R2 | Licencia |
|---|---|---|---|---|
| warfarisk-baselines (ecuacion IWPC) | Regresion clasica | 9,177 | 0,413 | Apache 2.0 |
| warfarisk-autogluon-6256 (mencionado en la model card) | AutoML (gradient boosting, etc.) | No disponible en la informacion | No disponible | Apache 2.0 (presumible) |
| warfarisk-autogluon-1780 (segundo cohorte) | AutoML | No disponible | No disponible | Apache 2.0 (presumible) |

La comparativa directa con otros modelos de regresion tabular para dosis de warfarina no esta disponible en la informacion proporcionada. El propio repositorio indica que el mejor modelo del proyecto alcanza MAE 8,55 y R2 0,475 en IWPC-6256 (segun el README de GitHub), pero ese dato no esta verificado en la model card de este repositorio.

## Limitaciones y advertencias

- Artefacto de investigacion, no una herramienta clinica validada: no ha sido evaluado prospectivamente y no tiene estatus regulatorio.
- Proveniencia de los coeficientes: la ecuacion IWPC se transcribio de la forma publica ampliamente citada, no se verifico directamente contra la Tabla 2 del articulo original de 2009.
- Unico cohorte: evaluado exclusivamente sobre IWPC-6256; la generalizacion a otras poblaciones no esta establecida.
- Etiquetas de ascendencia fragmentadas: en IWPC-6256, los pacientes de ascendencia negra/afroamericana estan divididos en tres etiquetas solapadas, lo que puede afectar a analisis estratificados.
- Rendimiento insuficiente para uso clinico: ninguno de los baselines alcanza el umbral PW20 >= 0,50 del IWPC, por lo que no deben usarse para decisiones de dosificacion reales.
- Sin soporte para caracteristicas no tabulares: no procesa texto, imagenes ni datos longitudinales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HassanB4/warfarisk-baselines
- Codigo fuente en GitHub: https://github.com/HasanBGit/WarfaRisk
- Coleccion WarfaRisk en Hugging Face: https://huggingface.co/collections/HassanB4/warfarisk-ancestry-stratified-warfarin-dose-prediction-6a79b7f715e8533e72db4b4e
- Repositorio de baselines de revision (variante): https://huggingface.co/HassanB4/warfarin-review-phase1-baselines
- Modelo AutoGluon IWPC-6256 (mencionado en la model card): https://huggingface.co/HassanB4/warfarisk-autogluon-6256
- Modelo AutoGluon IWPC-1780 (mencionado en la model card): https://huggingface.co/HassanB4/warfarisk-autogluon-1780
