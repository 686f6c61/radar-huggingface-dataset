# iaac-maai/day2-group8-affordability

## Resumen

`iaac-maai/day2-group8-affordability` es un modelo de regresión tabular publicado en HuggingFace por el equipo Group 8 del curso AI Methods I del IAAC MaAI (2026/27), compuesto por Akshat Dayal, Bhavini Manot y Bo De Roeck. No es un modelo de lenguaje ni una red neuronal: es un `Pipeline` de scikit-learn que combina preprocesamiento (imputación, escalado, one-hot y codificación ordinal) con una regresión Ridge con `alpha=1.0`. Su única tarea es predecir el índice de asequibilidad de la vivienda del año siguiente a partir de indicadores macroeconómicos conocidos del año en curso.

El modelo se entrena sobre 1.210 filas correspondientes a 26 países entre 1977 y 2024, con un split temporal estricto (entrenamiento 1977-2014, test 2015-2024) y validación mediante `TimeSeriesSplit` de 5 folds. El target es `log10(affordability_next)`, de modo que la salida debe reconvertirse con `10 ** predicción` para obtener el índice real. La entrada es un `DataFrame` de pandas con exactamente 17 columnas, entre ellas variables de lag (`affordability_lag1`, `affordability_lag2`, `affordability_3yr_avg`), indicadores de shock de precios, dummies de crisis financiera global y atributos categóricos de región y década.

Su relevancia es acotada y muy específica: sirve como herramienta de estimación temprana de asequibilidad a un año vista para analistas de política de vivienda, estudiantes e investigadores, y como ejercicio docente de buenas prácticas en validación temporal (evitar fugas de información). No debe confundirse con un modelo generativo: no procesa texto, no tiene capacidades multilingües ni soporta tool calling. El repositorio ocupa 0,0 GB y registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn: preprocesamiento (imputación por mediana, estandarizado, one-hot, codificación ordinal) + regresión Ridge (L2) |
| Parametros totales | No disponible (modelo lineal; el número de coeficientes depende de las 17 features de entrada y de las categorías expandidas) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular; una fila = un país en un año) |
| Tipos de cuantizacion | No aplica; se distribuye como `model.joblib` (pipeline completo serializado) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (joblib, pipeline de scikit-learn completo) |

## Arquitectura y entrenamiento

La arquitectura es un modelo lineal regularizado tipo Ridge sobre features tabulares, no un transformer ni un modelo secuencial. El pipeline encadena imputación por mediana y escalado estándar para las variables numéricas, imputación por moda y one-hot encoding con `handle_unknown="ignore"` para `region`, y codificación ordinal con orden explícito (1970s < 1980s < … < 2020s) para `decade`. El hiperparámetro `alpha=1.0` se seleccionó mediante `GridSearchCV` sobre el rango 0,01-100. El target se transforma a `log10(affordability_next)` para estabilizar la escala.

El entrenamiento usa 950 filas (1977-2014) y deja 260 filas (2015-2024) como test, con un split por tiempo en lugar de aleatorio, ya que años contiguos de un mismo país son casi idénticos y un split aleatorio filtraría el futuro. La validación interna emplea `TimeSeriesSplit` de 5 folds; el autor documenta que folds aleatorios daban resultados aproximadamente un 13 % mejores, motivo por el que se descartaron. La limpieza previa (documentada en el repositorio de GitHub del Day 1) elimina filas distorsionadas por hiperinflación (valores nominales cero y Croacia y Eslovenia antes de 1995), construye lags y cambios interanuales, y descarta dos features con fuga de información por usar estadísticos de la historia completa de cada país. La información disponible no detalla el resto de modelos comparados ni los resultados numéricos de esa comparación.

## Capacidades

- Regresión tabular de una sola salida: predice `log10` del índice de asequibilidad de la vivienda del año siguiente para un país.
- Procesamiento de 17 features de entrada con tipos mixtos (numéricas, binarias y categóricas), con imputación integrada para valores ausentes.
- Manejo de categorías desconocidas en `region` gracias a `handle_unknown="ignore"` en el one-hot encoder.
- Codificación ordinal explícita de la década, preservando el orden temporal.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni modo de razonamiento extendido.
- No genera texto: la salida es un valor numérico continuo por fila.

## Casos de uso

- Alerta temprana de asequibilidad para analistas de política de vivienda: dado el cuadro macroeconómico del año en curso de uno de los 26 países cubiertos, el modelo devuelve una estimación del índice del año siguiente antes de que se publiquen las estadísticas oficiales, con la conversión `10 ** predicción`.
- Análisis de escenarios (what-if): modificando manualmente `real_hpi_change_pct` o `real_income_change_pct` en la fila de entrada se puede explorar cómo variaría la asequibilidad prevista bajo supuestos de crecimiento de precios o de renta distintos.
- Docencia y formación en validación temporal: el repositorio documenta explícitamente el uso de `TimeSeriesSplit` y la comparación entre folds aleatorios y temporales, lo que lo convierte en un ejemplo práctico de prevención de fugas de información en series temporales tabulares.
- Investigación académica comparativa: como baseline lineal interpretable (coeficientes Ridge) frente a modelos más complejos sobre el mismo dataset de 26 países y 1977-2024.
- Integración en cuadernos de análisis reproducible: al ser un `joblib` de scikit-learn, se carga con `joblib.load` y se usa directamente sobre un `DataFrame` con las 17 columnas, sin infraestructura de inferencia adicional.
- Filtro previo en pipelines de análisis macro: generar una primera estimación de asequibilidad por país para priorizar qué mercados requieren un análisis más profundo con modelos o datos adicionales.

## Benchmarks y rendimiento

La model card declara las métricas MAE, RMSE y R² como etiquetas del repositorio y describe la comparación entre modelos sobre los mismos folds, pero el fragmento disponible se interrumpe antes de mostrar los valores numéricos. No se han publicado resultados de benchmarks cuantitativos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es una regresión Ridge con preprocesamiento, por lo que se ejecuta en cualquier CPU convencional en milisegundos por fila.
- VRAM: no requiere GPU; 0 GB de VRAM dedicada.
- GPU recomendadas: no aplica; no se necesita A100, H100 ni RTX 4090.
- Cabe en cualquier equipo de consumo, incluidos portátiles de gama baja y entornos sin GPU.
- Despliegue: carga directa con `joblib.load` en Python; no requiere vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Versiones de dependencias declaradas: scikit-learn 1.9.0, pandas 3.0.3, numpy 2.4.6, joblib 1.5.3, Python 3.14. La compatibilidad con otras versiones no está garantizada.
- Latencia y throughput: no disponibles de forma medida; por la naturaleza del modelo (una multiplicación matricial sobre 17 features) se espera un coste despreciable frente al de cualquier modelo neuronal.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados numéricos de los modelos alternativos comparados durante el desarrollo, ni referencias a otros modelos publicados de regresión tabular de asequibilidad de vivienda con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Cobertura geográfica restringida a los 26 países del entrenamiento (mayoritariamente de renta alta); no es válido para países fuera de esa lista.
- No aplica a ciudades ni regiones dentro de un país: los datos son medias nacionales.
- Horizonte limitado a un año; no produce previsiones a más largo plazo.
- No permite comparar niveles de asequibilidad entre países, porque las entradas son índices con años base específicos de cada país.
- No debe usarse para decisiones sobre hogares o propiedades individuales.
- Riesgo de extrapolación: al ser un modelo lineal, su comportamiento fuera del rango de valores observado en 1977-2024 (por ejemplo, shocks extremos no representados) no está validado.
- `nominal_zero` y `price_shock_down` son siempre 0 en los datos de entrenamiento, por lo que sus coeficientes no están identificados y su efecto en producción es indeterminado.
- El modelo se entrenó con datos hasta 2014 y se evaluó en 2015-2024; no hay evidencia en la información disponible sobre reentrenamiento con datos posteriores a 2024.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar la licencia del dataset de origen en Kaggle, que se rige por sus propios términos.
- Dependencia de versiones concretas de scikit-learn y pandas; cargar el `joblib` con versiones distintas puede producir errores o cambios de comportamiento.
- No es un modelo de lenguaje: no admite prompts, texto libre ni conversación.

## Enlaces

- HuggingFace: https://huggingface.co/iaac-maai/day2-group8-affordability
- Repositorio GitHub del pipeline completo: https://github.com/iaac-maai/Group8-day1-assignment
- Dataset de origen en Kaggle: https://www.kaggle.com/code/tolstoyjustin/forecasting-housing-affordability-to-2035/input
