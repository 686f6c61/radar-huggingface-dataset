# kev1nmo/deal-analyzer-artifacts

## Resumen

Deal Analyzer artifacts es un repositorio de artefactos de inferencia (no un modelo de lenguaje) publicado por el usuario kev1nmo en Hugging Face. Contiene el analizador de rentas entrenado que utiliza la API de Deal Analyzer, una aplicación de análisis inmobiliario: un modelo XGBoost de regresión tabular, envuelto con MAPIE para predicción conformal (rangos de confianza) y con un explainer SHAP, junto con los datos de referencia y comparables ("comps") que la API necesita en tiempo de servicio.

El paquete resuelve un problema acotado: estimar rentas de alquiler y ofrecer intervalos de predicción calibrados, además de explicaciones de las variables que influyen en cada estimación. Se apoya en fuentes públicas: el índice de rentas Zillow Observed Rent Index, datos del Census Bureau (ACS y TIGER), Small Area Fair Market Rents de HUD, datos de FRED/Freddie Mac, GTFS de MARTA y el dataset UCI Apartment for Rent Classified (CC BY 4.0). El pipeline declarado es `tabular-regression`.

Es relevante para quien quiera reproducir o integrar el servicio de Deal Analyzer, no como modelo generativo: el repositorio ocupa 0.0 GB según Hugging Face (probablemente artefactos ligeros o LFS no contabilizado) y no dispone de descargas ni likes en el momento de la consulta. La información publicada no incluye arquitectura detallada, hiperparámetros ni métricas de evaluación en la propia model card; remite al informe de hallazgos del repositorio de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (gradient boosting sobre datos tabulares) con MAPIE para predicción conformal y explainer SHAP |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | joblib (artefactos serializados), según el tag del repositorio |

## Arquitectura y entrenamiento

El artefacto principal es un modelo XGBoost de regresión tabular para estimar rentas, acompañado de un envoltorio MAPIE que genera intervalos de predicción conformales y de un explainer SHAP para atribución de variables. El repositorio incluye además los datos de referencia y los comparables que la API de Deal Analyzer carga en tiempo de servicio. No se especifican en la model card el número de árboles, profundidad, función de pérdida, partición train/validation ni el nivel de cobertura de los intervalos conformales.

Los datos de entrenamiento provienen de fuentes públicas: listados del dataset UCI Apartment for Rent Classified (CC BY 4.0) como datos de entrenamiento, el índice Zillow Observed Rent Index como referencia de rentas, ACS y TIGER del Census Bureau para variables sociodemográficas y geográficas, HUD Small Area Fair Market Rents, datos de FRED/Freddie Mac y GTFS de MARTA para transporte. No se documenta en la model card el volumen de tokens (no aplica), el número de filas, el proceso de limpieza ni si hubo validación temporal.

## Capacidades

- Regresión tabular para estimación de rentas de alquiler a partir de características de la vivienda y del entorno.
- Predicción con intervalos conformales (MAPIE), lo que permite reportar rangos de renta con cobertura estadística declarada.
- Explicabilidad local mediante SHAP: atribución de la contribución de cada variable a la predicción.
- Cálculo de comparables ("comps") a partir de los datos de referencia incluidos en el repositorio.
- Integración como artefactos de servicio para la API de Deal Analyzer y su demo en Hugging Face Spaces.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales: no es un modelo de lenguaje.

## Casos de uso

- Valoración de renta de un inmueble concreto: la API carga el modelo XGBoost y los datos de referencia para devolver una estimación puntual y un intervalo conformal, útil en portales inmobiliarios.
- Análisis de inversión inmobiliaria: el intervalo de predicción permite al inversor evaluar el rango de renta esperada y compararlo con el precio de compra para calcular rentabilidad.
- Explicabilidad para el usuario final: el explainer SHAP permite mostrar qué variables (superficie, barrio, transporte, rentas de comparables) empujan la estimación al alza o a la baja.
- Detección de anuncios fuera de mercado: comparando la renta publicada con el intervalo conformal se pueden señalar listados anómalos para revisión.
- Reproducción del servicio de Deal Analyzer: los artefactos permiten desplegar la API sin reentrenar, usando los mismos datos de referencia y comparables.
- Investigación sobre predicción conformal en datos tabulares: el paquete sirve como ejemplo reproducible de MAPIE aplicado a un problema real de regresión con explicabilidad SHAP.
- Benchmarking de modelos tabulares en dominios geoespaciales: las fuentes (ACS, TIGER, GTFS) permiten construir variantes del pipeline y comparar frente al artefacto publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al informe de hallazgos del repositorio de GitHub (`reports/findings.md`) para la evaluación, pero no se incluyen métricas (MAE, RMSE, cobertura de intervalos) en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo XGBoost tabular, la inferencia se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: no aplica para inferencia; el entrenamiento puede beneficiarse de GPU, pero no se documenta.
- Cabe en cualquier equipo consumer: el tamaño del repositorio es de 0.0 GB según Hugging Face, por lo que el despliegue en CPU es viable.
- Opciones de despliegue: carga de artefactos joblib desde Python (scikit-learn/XGBoost/MAPIE), servido a través de la API de Deal Analyzer y de Hugging Face Spaces.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (regresión tabular inmobiliaria con predicción conformal) con parámetros, contexto, rendimiento y licencia documentados.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- Sesgos potenciales derivados de las fuentes: el índice Zillow, ACS y HUD reflejan mercados estadounidenses y pueden no generalizar a otros países o a barrios con pocos datos.
- Riesgo de predicciones poco fiables en zonas con escasa cobertura de comparables o con datos desactualizados de las fuentes de referencia.
- La cobertura real de los intervalos conformales depende del conjunto de calibración, que no se documenta en la model card.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero las fuentes de datos subyacentes (Zillow, Census, HUD, FRED, UCI) tienen sus propias condiciones de atribución que deben respetarse.
- El repositorio no presenta descargas ni validación externa; el uso en producción exige una evaluación propia antes de confiar en las estimaciones.
- No se documentan versiones de dependencias (XGBoost, MAPIE, SHAP), lo que puede dificultar la reproducibilidad exacta del entorno.

## Enlaces

- Hugging Face: https://huggingface.co/kev1nmo/deal-analyzer-artifacts
- Repositorio GitHub: https://github.com/kev1nmo/deal-analyzer
- Informe de hallazgos: https://github.com/kev1nmo/deal-analyzer/blob/main/reports/findings.md
- Demo en Spaces: https://huggingface.co/spaces/kev1nmo/deal-analyzer
- Dataset UCI Apartment for Rent Classified (CC BY 4.0): citado en la model card, sin URL directa en la información disponible
- Zillow Observed Rent Index: citado en la model card, sin URL directa en la información disponible
