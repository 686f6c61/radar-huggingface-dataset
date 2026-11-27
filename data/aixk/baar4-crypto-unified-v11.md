# aixk/BAAR4-crypto-unified-v11

## Resumen

BAAR4-crypto-unified-v11 es un modelo de clasificación tabular publicado por el usuario aixk en Hugging Face, orientado a la clasificación de señales en el ámbito de criptomonedas. No es un modelo de lenguaje: se distribuye como un modelo ONNX con pesos también en safetensors, con un total de 44.272 parámetros, lo que lo sitúa en la categoría de modelos ligeros para inferencia tabular. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

La model card describe un artefacto ONNX "Unified-3m5m15m" de 1,05 MB con una entrada de tipo `N x 249` y un conjunto de 678 árboles, lo que sugiere un ensamblado de árboles de decisión (probablemente gradient boosting) exportado a ONNX. También incluye métricas de una estrategia de trading asociada ("Unified Limit"): 76 operaciones, 44,7 % de acierto, retorno de +9,12 %, factor de beneficio 1,25 y máxima caída del -13,44 %.

Es relevante para desarrolladores que buscan un clasificador tabular pequeño, desplegable en CPU y con licencia MIT, aunque la documentación es extremadamente escasa y las métricas proceden de una única configuración de backtest, sin información sobre el conjunto de datos ni el proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de árboles de decisión exportado a ONNX (678 árboles; tipo exacto no disponible) |
| Parametros totales | 44.272 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo tabular, entrada de 249 características) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX y safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es un ensamblado de 678 árboles exportado a ONNX, con una entrada tabular de `N x 249` características. El nombre "Unified-3m5m15m" sugiere la unificación de tres horizontes temporales (3, 5 y 15 minutos), aunque el autor no detalla cómo se combinan. No se especifica el algoritmo concreto de boosting, la profundidad de los árboles, la función de pérdida ni el número de parámetros por árbol.

No hay información sobre el conjunto de datos de entrenamiento (número de muestras, periodo temporal, activos cubiertos, ingeniería de características), ni sobre validación, regularización o calibración. Tampoco se documenta si hubo ajuste fino o técnicas de selección de características. Todo ello impide evaluar la robustez del modelo fuera del backtest reportado.

## Capacidades

- Clasificación tabular binaria o multiclase sobre vectores de 249 características (el número de clases no está documentado).
- Inferencia mediante ONNX Runtime, apta para CPU y entornos embebidos.
- Generación de señales de trading de criptomonedas según la model card (estrategia "Unified Limit").
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües (no procesa lenguaje natural).
- Sin modo thinking, visión ni audio.

## Casos de uso

- Señalización de entrada y salida en estrategias de trading de criptomonedas: el modelo clasifica vectores de 249 características y puede integrarse en un motor de ejecución que consulte la predicción en cada vela de 3, 5 o 15 minutos.
- Filtro de operaciones en sistemas de trading algorítmico: usar la probabilidad de salida como condición adicional antes de abrir posiciones, aprovechando su bajo coste computacional.
- Backtesting y validación de estrategias: el modelo ONNX de 1,05 MB puede ejecutarse dentro de frameworks de backtest en Python sin GPU, facilitando la reevaluación sobre distintos periodos.
- Despliegue en entornos de baja latencia: al ser un ensamblado de árboles exportado a ONNX, la inferencia es determinista y rápida en CPU, adecuada para servicios donde no hay GPU disponible.
- Prototipado de clasificadores tabulares financieros: sirve como referencia para comparar pipelines de features de 249 dimensiones antes de escalar a modelos mayores.
- Investigación sobre generalización de ensembles de árboles en series temporales financieras: permite estudiar la estabilidad de las métricas reportadas (WR 44,7 %, PF 1,25) en distintos regímenes de mercado.

## Benchmarks y rendimiento

La model card solo reporta métricas de una estrategia de trading asociada, no benchmarks estándar de clasificación tabular:

| Metrica | Valor |
|---|---|
| Operaciones (Trades) | 76 |
| Tasa de acierto (WR) | 44,7 % |
| Retorno (Ret) | +9,12 % |
| Factor de beneficio (PF) | 1,25 |
| Maxima caida (MDD) | -13,44 % |

No se han publicado resultados de benchmarks estándar (accuracy, F1, AUC) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo es de 1,05 MB y se ejecuta en CPU sin GPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU consumer, aunque no es necesario usarla.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), integración en servicios web con FastAPI o similares, y carga de los pesos safetensors si el pipeline lo requiere.
- Latencia y throughput: no disponibles; por el tamaño del ensamblado (678 árboles) se espera una latencia de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificadores tabulares de criptomonedas exportados a ONNX) con los que establecer una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Documentación mínima: no se describe el dataset, el algoritmo de entrenamiento ni el significado de las 249 características, lo que impide reproducir o auditar el modelo.
- Métricas basadas en solo 76 operaciones: la muestra es muy pequeña y el retorno de +9,12 % con una caída máxima de -13,44 % no permite concluir robustez estadística.
- Riesgo de sobreajuste: sin información sobre validación out-of-sample, las métricas podrían reflejar ajuste al periodo de backtest.
- Sesgos desconocidos: al no documentarse los activos ni el periodo, no puede evaluarse el sesgo hacia determinados mercados o regímenes.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de predicciones poco fiables fuera de la distribución de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; el autor no ofrece soporte ni mantenimiento.
- Advertencia financiera: las métricas de trading no constituyen asesoramiento financiero ni garantía de resultados futuros.
- Sin idiomas ni contexto: no es un modelo de lenguaje, por lo que no debe evaluarse con criterios de NLP.

## Enlaces

- Hugging Face: https://huggingface.co/aixk/BAAR4-crypto-unified-v11
