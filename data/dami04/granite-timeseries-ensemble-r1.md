# dami04/granite-timeseries-ensemble-r1

## Resumen

Granite Timeseries Ensemble R1 es un marco extensible para combinar previsiones por cuantiles procedentes de varios modelos de series temporales preentrenados. En lugar de fusionar pesos, el repositorio distribuye recetas reutilizables: los checkpoints miembros se descargan en tiempo de ejecución desde sus propios repositorios de Hugging Face y se combinan mediante una interfaz común de previsión. La configuración por defecto reúne cuatro checkpoints de la familia Granite con licencias permisivas: PatchTST-FM-r1 (Transformer), PatchTST-FM-r2 (Conformer), FlowState-r1.1 (modelo de espacio de estados) y TTM-r3 (mezclador ligero).

El problema que resuelve es la dependencia de una única arquitectura: ningún modelo de previsión domina en todos los conjuntos de datos, longitudes de contexto y horizontes. Al agregar miembros diversos y razonablemente precisos se diluyen los errores específicos de cada arquitectura y mejora la robustez. El método por defecto, `linear_pool`, asigna el mismo peso a cada miembro y agrupa sus cuantiles en el espacio de probabilidad, sin aprender pesos ni requerir datos de validación históricos; una alternativa, `iqr_weighted`, pondera según el rango intercuartílico de cada miembro.

El repositorio está publicado por el usuario dami04 bajo licencia Apache 2.0, tiene 0 descargas y 0 likes, y se apoya en la librería `granite-tsfm`. La receta raíz devuelve nueve cuantiles (0,1 a 0,9) y usa el cuantil 0,5 como previsión puntual, con revisiones de TTM seleccionadas dinámicamente según el contexto y el horizonte solicitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de modelos de series temporales: Transformer (PatchTST-FM-r1), Conformer (PatchTST-FM-r2), modelo de espacio de estados (FlowState-r1.1) y mezclador ligero (TTM-r3) |
| Parametros totales | no disponible (es una receta de ensemble de cuatro checkpoints, no una red única) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada como límite fijo; el ejemplo de la model card usa context_length=1024 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico de series temporales) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica: el repositorio contiene recetas, no pesos fusionados; los checkpoints miembros se descargan desde sus repositorios |

## Arquitectura y entrenamiento

El componente central es `QuantileEnsembleForecaster` de la librería `granite-tsfm`, que expone una interfaz común de previsión. La agregación por defecto, `linear_pool`, otorga la misma influencia a cada miembro y agrupa los valores de cuantil en el espacio de probabilidad antes de extraer los cuantiles empíricos solicitados. La variante `iqr_weighted` estima la dispersión de cada miembro a partir de su rango intercuartílico y da más peso a los miembros con intervalos más estrechos, aplicando regresión isotónica para garantizar cuantiles de salida no decrecientes. Ninguno de los dos métodos ajusta pesos a partir de errores históricos de previsión.

La receta Granite-only combina cuatro checkpoints: PatchTST-FM-r1 (Transformer), PatchTST-FM-r2 (Conformer), FlowState-r1.1 (espacio de estados) y TTM-r3 (mezclador ligero). En la información disponible no se detallan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO para los checkpoints miembros. La model card justifica la agregación uniforme citando el «forecast combination puzzle» y el equilibrio sesgo-varianza en la estimación de pesos, y advierte de que añadir miembros débiles o muy correlacionados no garantiza mejoras, por lo que la selección de miembros debe validarse para cada aplicación.

## Capacidades

- Previsión de series temporales univariantes y multivariantes con soporte de columna de marca temporal y columnas objetivo.
- Previsión probabilística: la receta raíz devuelve nueve cuantiles (0,1, 0,2, …, 0,9) y expone el cuantil 0,5 como previsión puntual.
- Agregación por ensemble con dos métodos: `linear_pool` (uniforme, por defecto) e `iqr_weighted` (ponderado por rango intercuartílico).
- Configuración guiada por el usuario: permite seleccionar subcarpetas de recetas con distintas combinaciones de miembros y métodos.
- Selección dinámica de revisiones de TTM en función del contexto y del horizonte de previsión solicitados.
- Marco extensible: la interfaz común de previsión puede ampliarse con otros modelos compatibles y métodos de agregación.
- No dispone de soporte documentado de tool calling, function calling, agentes, visión, audio ni capacidades multilingües (es un modelo numérico de series temporales).

## Casos de uso

- Previsión de demanda energética: la receta raíz puede generar cuantiles horarios a partir de históricos largos (por ejemplo, contexto de 1024 pasos y horizonte de 24) y usar los intervalos para dimensionar reservas de generación con bandas de incertidumbre.
- Planificación de capacidad en infraestructura: combinando varios miembros se obtienen previsiones de carga de CPU, memoria o tráfico con intervalos, útiles para disparar escalado automático y evitar tanto la sobreprovisión como el agotamiento de recursos.
- Previsión de ventas y reposición de stock: la salida por cuantiles permite fijar niveles de inventario según un percentil objetivo (por ejemplo, el cuantil 0,9 para escenarios de alta demanda) en lugar de una única cifra puntual.
- Monitorización de sensores industriales: la previsión de series de telemetría con cuantiles facilita la detección de anomalías al comparar los valores observados con las bandas predichas.
- Análisis financiero cuantitativo: generación de escenarios de precios o indicadores con intervalos de confianza para análisis de riesgo y backtesting de estrategias.
- Comparación de métodos de agregación en investigación: las subcarpetas `recipes/*` permiten reproducir y contrastar `linear_pool` frente a `iqr_weighted`, y la combinación Granite-only frente a configuraciones ampliadas, sobre el conjunto GiftEval.
- Previsión meteorológica o ambiental a corto plazo: la diversidad de arquitecturas del ensemble puede capturar patrones tanto locales (mezcladores ligeros) como de largo alcance (Transformer, espacio de estados) en variables como temperatura o calidad del aire.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona el conjunto de datos Salesforce/GiftEval y enlaza las recetas evaluadas, pero no incluye cifras concretas de error (por ejemplo, MAE, MSE o CRPS) para las configuraciones Granite-only ni ampliada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al tratarse de un ensemble de modelos de series temporales (no de grandes modelos de lenguaje), cada checkpoint miembro es comparativamente ligero, pero no se ofrecen cifras oficiales.
- GPU recomendadas: no disponible. No se indican modelos de GPU concretos.
- Viabilidad en GPU de consumo: no confirmada en la información disponible. Con context_length=1024 y horizonte 24, el ejemplo sugiere un uso modesto, pero no hay datos de consumo de memoria.
- Opciones de despliegue: despliegue mediante la librería propia `granite-tsfm` (versión >= 0.3.10) y su clase `QuantileEnsembleForecaster`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Familia | Agregación | Licencia | Contexto |
|---|---|---|---|---|---|
| Granite Timeseries Ensemble R1 | Ensemble de 4 miembros | Transformer, Conformer, espacio de estados, mezclador ligero | `linear_pool` / `iqr_weighted` | Apache 2.0 | Ejemplo de 1024 (no fijo) |
| Granite PatchTST-FM-r1 (miembro) | Modelo único | Transformer | no aplica | Apache 2.0 (permisiva según model card) | no disponible |
| Granite FlowState-r1.1 (miembro) | Modelo único | Espacio de estados | no aplica | Apache 2.0 (permisiva según model card) | no disponible |
| Granite TTM-r3 (miembro) | Modelo único | Mezclador ligero | no aplica | Apache 2.0 (permisiva según model card) | no disponible |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa entre el ensemble y sus miembros individuales, ni frente a alternativas externas de la misma categoría.

## Limitaciones y advertencias

- La agregación uniforme (`linear_pool`) no aprende pesos ni usa datos de validación; añadir miembros débiles o muy correlacionados no garantiza mejoras de precisión.
- El método `iqr_weighted` asume que un intervalo más estrecho implica mejor precisión o calibración, lo cual no siempre se cumple; la propia model card advierte de que debe validarse con datos representativos.
- No se especifican sesgos conocidos, y al ser un modelo numérico sobre series temporales el concepto de sesgo difiere del de los modelos de lenguaje.
- Existe riesgo de error de previsión inherente a cualquier modelo de forecasting; los intervalos por cuantiles no están calibrados de forma garantizada para datos fuera de la distribución de entrenamiento.
- Los checkpoints miembros se descargan en tiempo de ejecución desde sus repositorios, por lo que el resultado depende de que dichos repositorios sigan disponibles y de la conectividad de red.
- No hay soporte documentado de idiomas, texto, código, visión ni audio.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de cada checkpoint miembro por separado.
- El repositorio es una contribución de un usuario (dami04) con 0 descargas y 0 likes, y fecha de creación posterior a la de esta ficha; no tiene respaldo oficial verificado de IBM, aunque reutiliza checkpoints de la familia `ibm-granite`.
- No hay resultados de benchmarks publicados que respalden las afirmaciones de mejora de rendimiento en datos concretos.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/dami04/granite-timeseries-ensemble-r1
- Checkpoint miembro PatchTST-FM-r1: https://huggingface.co/ibm-granite/granite-timeseries-patchtst-fm-r1
- Checkpoint miembro PatchTST-FM-r2: https://huggingface.co/ibm-granite/granite-timeseries-patchtst-fm-r2
- Checkpoint miembro FlowState-r1.1: https://huggingface.co/ibm-granite/granite-timeseries-flowstate-r1
- Checkpoint miembro TTM-r3: https://huggingface.co/ibm-granite/granite-timeseries-ttm-r3
- Conjunto de datos GiftEval: https://huggingface.co/datasets/Salesforce/GiftEval
- Artículo arXiv 2508.05287: https://arxiv.org/abs/2508.05287
- Artículo arXiv 2401.03955: https://arxiv.org/abs/2401.03955
- Artículo arXiv 1106.1638: https://arxiv.org/abs/1106.1638
- Forecast combination puzzle: https://doi.org/10.1111/j.1468-0084.2008.00541.x
- Compromiso sesgo-varianza en pesos estimados: https://doi.org/10.1287/mnsc.2019.3476
- Repositorio de la librería granite-tsfm (instalación): pip install "granite-tsfm>=0.3.10"
- Dataset ETTh1 de ejemplo: https://raw.githubusercontent.com/zhouhaoyi/ETDataset/main/ETT-small/ETTh1.csv
