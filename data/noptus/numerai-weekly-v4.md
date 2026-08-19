# Noptus/numerai-weekly-v4

## Resumen

El modelo `Noptus/numerai-weekly-v4` es un artefacto reproducible que publica el bundle de modelos utilizado por Noptus en su pipeline validado de submissions al torneo semanal de Numerai. Se trata de un ensemble de regresión tabular compuesto por diez modelos de gradiente boosting (ocho LightGBM y un CatBoost, más un modelo residual) que operan sobre 780 features "medium" y 8 columnas de benchmark models del esquema de datos Numerai v5.2. El bundle, de aproximadamente 142 MiB, fue promovido como campeón local tras superar al anterior en una validación offline de 57 eras, con una correlación media (Numerai CORR) de 0.010453 y un Sharpe de 0.7712.

El modelo está pensado como punto de partida para investigación en diversidad de ensembles y como referencia reproducible, no como consejo de inversión ni garantía de rendimiento en vivo. Su relevancia radica en que documenta explícitamente los componentes, los pesos asignados mediante purged walk-forward coordinate ascent y los experimentos negativos que descartaron alternativas, lo que lo convierte en un recurso útil para quienes trabajan con datos tabulares financieros de alta dimensionalidad. No es un modelo de lenguaje: no procesa texto, no tiene contexto ni capacidades generativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de árboles de gradiente boosting (LightGBM y CatBoost) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular) |
| Tipos de cuantizacion | no aplica (modelo de árboles, no redes neuronales) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (sin licencia explícita seleccionada) |
| Formato de pesos | pickle (joblib) para el ensemble; también incluye manifest.json y scripts de inferencia |

## Arquitectura y entrenamiento

El bundle está compuesto por diez modelos: dos LightGBM "benchmark-aware" (que incorporan las predicciones de los benchmark models como características), seis LightGBM multi-target, un LightGBM residual y un CatBoost. Todos se entrenan sobre el esquema de datos Numerai v5.2, con 780 features "medium" y 8 columnas de benchmark models. No se especifica el número de muestras ni la composición exacta del dataset de entrenamiento, pero la validación se realizó sobre un holdout de 57 eras sin tocar. La asignación de pesos entre los componentes se hizo mediante purged walk-forward coordinate ascent, un método que optimiza los pesos de forma secuencial evitando la fuga de información temporal. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, ya que no es un modelo generativo.

## Capacidades

- Regresión tabular para predicción de retornos en mercados financieros, específicamente diseñado para el torneo Numerai.
- Generación de predicciones rankeadas (el script `inference.py` incluye una función `predict_ranked` que normaliza las salidas).
- Integración con datos de benchmark models: el modelo consume las columnas de benchmarks como entrada adicional, lo que permite ajustar las predicciones a la dinámica del torneo.
- No es un modelo de lenguaje: no genera texto, no tiene tool calling, ni soporte para agentes o razonamiento multi-paso.
- No tiene capacidades multilingües ni de visión/audio.
- Capacidad especial: el bundle está pensado para ser utilizado como base para derivar múltiples submissions con diferentes configuraciones de neutralización de features y benchmarks, aunque esas configuraciones operativas no se incluyen en el repositorio.

## Casos de uso

- Participación en el torneo Numerai: el caso principal. El usuario descarga el bundle, ejecuta `inference.py` sobre los datos live y genera un archivo `predictions.csv` listo para subir a la plataforma.
- Investigación en ensembles de modelos de boosting: al estar documentados los componentes y sus pesos, sirve como referencia para estudiar cómo combinar LightGBM y CatBoost en problemas de regresión tabular con alta dimensionalidad.
- Análisis de diversidad de modelos: la model card reporta correlaciones entre predicciones de diferentes familias (por ejemplo, extra trees con correlaciones 0.81–0.94), lo que permite estudiar la redundancia entre modelos y diseñar ensembles más diversos.
- Backtesting de estrategias cuantitativas: las predicciones del modelo pueden alimentar simulaciones de carteras para evaluar su comportamiento histórico, aunque la model card advierte que las métricas offline no garantizan rendimiento futuro.
- Desarrollo de pipelines de ML para datos financieros: el repositorio incluye un `requirements.txt` y un flujo de inferencia reproducible, útil como plantilla para integrar modelos de árboles en entornos de producción con datos tabulares.
- Estudio de técnicas de neutralización: aunque las configuraciones específicas no se publican, el bundle permite experimentar con diferentes métodos de neutralización de features y benchmarks sobre las predicciones base.
- Reproducibilidad de experimentos: el `manifest.json` registra la revisión fuente, las versiones de dependencias y los hashes, lo que facilita replicar el entorno exacto de inferencia.

## Benchmarks y rendimiento

La model card proporciona métricas offline de validación sobre un holdout de 57 eras, comparando el bundle v4 con el campeón local anterior. No se reportan benchmarks estándar como MMLU o HumanEval, ya que no es un modelo de lenguaje.

| Metrica | v4 | Campeon anterior |
|---|---|---|
| Mean Numerai CORR | 0.010453 | 0.001821 |
| Sharpe | 0.7712 | 0.1499 |
| Positive-era consistency | 75.44% | 52.63% |
| Maximum drawdown proxy | -0.01360 | -0.02329 |

Estas cifras son históricas y offline; la model card advierte explícitamente que no son garantía de rendimiento en vivo y que el modelo puede decaer ante cambios de régimen.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación.
- Dado que el bundle pesa aproximadamente 142 MiB y está compuesto por modelos de árboles (LightGBM y CatBoost), la inferencia es factible en CPU con pocos GB de RAM. No se requiere GPU.
- El script de inferencia carga el pickle con `joblib` y procesa DataFrames de pandas, por lo que el consumo de memoria dependerá del tamaño de los datos live (típicamente miles de filas).
- Para ejecutar el pipeline completo se necesita un entorno Python con las dependencias listadas en `requirements.txt` (no se detallan versiones en la información disponible).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede establecer una comparativa con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card declara que el modelo es experimental, puede decaer bajo cambios de régimen y no debe utilizarse para tomar decisiones financieras.
- El bundle se serializa en formato pickle, que puede ejecutar código arbitrario al cargarse. Se recomienda verificar el SHA-256 (`79db5f41f3506e8e10a8b96c60a927f6a9ca202e49e03304ceaa9d304116b8d9`) y cargar solo artefactos de fuentes confiables.
- No se incluyen datos de Numerai, etiquetas objetivo, predicciones en vivo, credenciales de API ni información de staking.
- La licencia no está seleccionada explícitamente; los datos de Numerai y los archivos de benchmark models están sujetos a sus propios términos y no se redistribuyen en el repositorio. Es necesario verificar los términos aplicables antes de reutilizar o redistribuir.
- El modelo está diseñado específicamente para el esquema de datos Numerai v5.2; su uso fuera de ese contexto requeriría adaptaciones no documentadas.
- No se proporcionan garantías de rendimiento en producción; las métricas offline pueden no replicarse en el entorno real del torneo.

## Enlaces

- [HuggingFace: Noptus/numerai-weekly-v4](https://huggingface.co/Noptus/numerai-weekly-v4)
