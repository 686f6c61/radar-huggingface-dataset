# SallySims/pyramidformer-forecaster

## Resumen

PyramidFormer forecaster es un modelo de series temporales especializado en la proyección de pirámides de población. Lo desarrolla SallySims y se distribuye bajo licencia MIT. Dado un vector de población por edad simple (0-100) y sexo (masculino y femenino) para un año concreto, el modelo predice la pirámide h años después, con h entre 1 y 25, como un residuo sobre la entrada. Resuelve un problema acotado pero técnicamente específico: la extrapolación de estructuras demográficas por edad y sexo sin depender de modelos de componentes de cohorte clásicos.

La arquitectura es un transformer de aproximadamente 0,8 millones de parámetros (827.138 según los pesos en safetensors), entrenado sobre pares país-año de las estimaciones de World Population Prospects 2024 de Naciones Unidas para el periodo 1950-2023. El repositorio es autocontenido: incluye el código del modelo (`pyramidformer.py`), los pesos en `model.safetensors` y la configuración, sin widget de inferencia alojado porque la arquitectura es personalizada.

Su relevancia actual es la de un prototipo de investigación que demuestra que un modelo neuronal compacto puede aproximar la dinámica demográfica embebida en las proyecciones de la ONU con errores de predicción competitivos frente a líneas base simples, especialmente a horizontes largos (20-25 años). No es una herramienta de estadística oficial ni sustituye a los modelos de Naciones Unidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura personalizada, código en `pyramidformer.py`) |
| Parámetros totales | 827.138 (aprox. 0,8 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada fija: pirámide de 2 sexos x 101 edades simples) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (más `config.json` y código Python) |

## Arquitectura y entrenamiento

El modelo es un transformer de aproximadamente 0,8 millones de parámetros que recibe una pirámide de población representada como una matriz de 2 sexos por 101 edades simples (0-100) y el año de origen, y produce una predicción de la pirámide h años después (h entre 1 y 25) formulada como un residuo sobre la entrada. El repositorio incluye la implementación completa en `pyramidformer.py` junto con una función `load_pretrained` y una función `predict_forecast` para inferencia directa.

El entrenamiento se realizó sobre pares país-año de las estimaciones de World Population Prospects 2024 (UN DESA, Population Division) para población por edad simple y sexo, en el periodo 1950-2023, procesados en el dataset `SallySims/wpp2024-single-age-pyramids`. El split es por país: 80 % entrenamiento, 10 % validación y 10 % test, de modo que todas las métricas publicadas corresponden a países no vistos durante el entrenamiento. La model card indica una ejecución de entrenamiento "quick run" de 3000 pasos de optimización. No se detalla la composición exacta del dataset, el número de tokens ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Proyección de pirámides de población por edad simple (0-100) y sexo (masculino/femenino) a horizontes de 1 a 25 años.
- Predicción formulada como residuo sobre la pirámide de entrada, lo que preserva la estructura de la distribución original.
- Generalización a países no vistos en entrenamiento (evaluación out-of-country).
- Manejo de la dinámica demográfica embebida en las estimaciones de WPP 2024 (fecundidad, mortalidad y estructura por edad implícitas).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (es un modelo numérico).
- No dispone de modo de razonamiento (thinking mode), visión ni audio.

## Casos de uso

- Análisis demográfico exploratorio: dado un país y un año, generar una proyección rápida de la pirámide a 10 o 20 años para comparar escenarios o validar supuestos frente a modelos de cohorte.
- Investigación académica en demografía computacional: usar el modelo como línea base neuronal frente a métodos clásicos de componentes de cohorte en estudios comparativos.
- Docencia y divulgación: ilustrar cómo un transformer compacto puede aprender dinámicas demográficas a partir de datos de Naciones Unidas, con un coste computacional mínimo.
- Generación de datos sintéticos de pirámides para pruebas de pipelines de análisis demográfico o de visualización.
- Prototipado de herramientas de planificación de servicios públicos: estimaciones preliminares de estructura por edad para estudios de demanda de servicios sanitarios o educativos, siempre con validación posterior contra fuentes oficiales.
- Evaluación de sensibilidad de modelos demográficos: comparar la proyección de PyramidFormer con la persistencia o el desplazamiento de cohortes para identificar países donde la dinámica es más difícil de capturar.
- Análisis de errores por horizonte: usar las métricas publicadas (MAE por horizonte) para decidir hasta qué h es razonable usar el modelo en un estudio concreto.

## Benchmarks y rendimiento

Evaluación en países no vistos, todos los años de origen. Métrica: MAE de las cuotas por edad simple, en por mil de la población total (menor es mejor).

| Horizonte h (años) | PyramidFormer | Persistence | Cohort shift (sin mortalidad) |
|---|---|---|---|
| 1 | 0,118 | 0,098 | 0,070 |
| 5 | 0,324 | 0,379 | 0,306 |
| 10 | 0,433 | 0,600 | 0,571 |
| 20 | 0,544 | 0,876 | 1,082 |
| 25 | 0,588 | 0,968 | 1,321 |

El modelo supera a ambas líneas base a partir de h=5, pero es peor que la persistencia y que el desplazamiento de cohortes a h=1.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 0,8 M de parámetros, los pesos ocupan unos pocos megabytes en precisión completa.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutar el modelo.
- Cabe en cualquier GPU de consumo e incluso en CPU sin problema.
- Opciones de despliegue: inferencia directa con PyTorch mediante el snippet de la model card (`snapshot_download` + `load_pretrained` + `predict_forecast`). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, dado que la arquitectura es personalizada y no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos neuronales comparables de proyección de pirámides de población en la documentación proporcionada. Las únicas alternativas documentadas son las líneas base incluidas en la evaluación del propio autor:

| Modelo / método | Tipo | Parámetros | Contexto | Rendimiento (MAE h=25) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PyramidFormer forecaster | Transformer | 827.138 | Pirámide 2x101 + año | 0,588 | MIT | Hugging Face |
| Persistence | Línea base | 0 | n/a | 0,968 | n/a | n/a |
| Cohort shift (sin mortalidad) | Línea base | 0 | n/a | 1,321 | n/a | n/a |

No se conocen otros modelos neuronales comparables en la información disponible.

## Limitaciones y advertencias

- Los objetivos de entrenamiento son estimaciones modeladas de la ONU (WPP 2024), no censos reales; el modelo aprende la dinámica demográfica embebida en WPP, no hace pronósticos independientes del mundo real.
- No proporciona estimación de incertidumbre.
- No anticipa shocks migratorios ni guerras en los países de evaluación.
- Es un prototipo de investigación; no debe usarse para estadística oficial.
- El entrenamiento fue una ejecución corta (3000 pasos), lo que puede limitar la calidad final del modelo.
- El rendimiento a h=1 es peor que las líneas base simples (persistencia y desplazamiento de cohortes), por lo que no es adecuado para proyecciones a muy corto plazo.
- No hay información sobre sesgos específicos más allá de los derivados de los datos de WPP.
- Riesgo de alucinación en el sentido de generar pirámides plausibles pero incorrectas para países con dinámicas atípicas no representadas en el entrenamiento.
- Restricciones de licencia: el modelo es MIT, pero los datos de origen (WPP 2024) tienen sus propios términos de uso de la ONU que deben consultarse antes de reutilizar.
- No hay idiomas soportados porque el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SallySims/pyramidformer-forecaster
- Dataset de entrenamiento: https://huggingface.co/datasets/SallySims/wpp2024-single-age-pyramids
- World Population Prospects 2024 (UN DESA): https://population.un.org/wpp/
