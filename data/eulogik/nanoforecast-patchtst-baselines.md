# eulogik/nanoforecast-patchtst-baselines

## Resumen

El modelo `eulogik/nanoforecast-patchtst-baselines` es un conjunto de pesos preentrenados para la predicción de series temporales, basado en la arquitectura PatchTST (Patch Time Series Transformer). Ha sido desarrollado por el usuario eulogik como parte del proyecto NanoForecast, con el objetivo de proporcionar resultados de referencia (baselines) bajo un protocolo estándar y reproducible. El repositorio contiene los pesos en formato PyTorch (`.pt`) junto con los metadatos en JSON para siete conjuntos de datos clásicos de forecasting: ETTh1, ETTh2, ETTm1, exchange_rate, electricity y traffic.

La relevancia de este modelo radica en que reproduce fielmente los hiperparámetros del artículo original de PatchTST, lo que permite comparar resultados de forma consistente con la literatura. Está pensado como punto de partida para investigadores y desarrolladores que necesitan un baseline sólido en tareas de predicción multivariante de series temporales, sin tener que entrenar desde cero. El entrenamiento se realizó en una GPU T4 gratuita de Google Colab, lo que demuestra su accesibilidad computacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PatchTST (Transformer con parcheo de series temporales, canal independiente) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | Ventana de entrada (lookback) de 512 pasos; horizonte de predicción de 48 pasos |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, formato PyTorch) |
| Idiomas soportados | no aplica (modelo de series temporales, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`) y metadatos JSON (`.json`) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura PatchTST, que divide la serie temporal de entrada en parches (patches) de longitud fija y los procesa mediante un transformer estándar. La configuración sigue exactamente los hiperparámetros del artículo original: `d_model=512`, `e_layers=3`, `patch_len=16`, `stride=8`, `dropout=0.3`, `learning_rate=1e-4`, `patience=3`. Se utiliza un enfoque de canal independiente (channel-independent), donde cada serie univariante se trata como una muestra separada, lo que reduce el coste computacional y mejora la generalización en muchos conjuntos de datos.

El entrenamiento se llevó a cabo en una GPU T4 de Google Colab (gratuita) con los siete conjuntos de datos mencionados. No se especifica el número total de tokens o pasos de entrenamiento, pero se indica que se siguió el protocolo estándar definido en el script `benchmark_standard.py` del repositorio NanoForecast. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Predicción de series temporales univariantes y multivariantes con horizonte fijo de 48 pasos.
- Soporte para múltiples dominios: energía (ETT), finanzas (exchange_rate), electricidad y tráfico.
- Reproducibilidad de resultados gracias a la configuración estándar de hiperparámetros.
- Almacenamiento de métricas de evaluación (MASE, MAE, MSE, sMAPE) en el archivo `standard_benchmark.json`.
- Compatible con el ecosistema PyTorch, lo que facilita su integración en pipelines de investigación.
- No incluye capacidades de generación de texto, razonamiento, código, visión o tool calling, al ser un modelo especializado en forecasting.

## Casos de uso

- **Predicción de demanda eléctrica**: el modelo puede utilizarse para prever la carga eléctrica a corto plazo (horizonte de 48 horas) a partir de datos históricos, útil para operadores de red y empresas energéticas.
- **Gestión de inventario y logística**: aplicando el modelo a series de ventas o tráfico, se pueden anticipar picos de demanda y optimizar el aprovisionamiento.
- **Análisis financiero**: predicción de tipos de cambio (exchange_rate) o índices bursátiles con horizonte de 48 días, para apoyar decisiones de inversión.
- **Monitorización de infraestructuras**: predicción de métricas de tráfico de red o servidores, permitiendo la asignación dinámica de recursos.
- **Investigación académica**: como baseline en experimentos comparativos de nuevos modelos de forecasting, gracias a su configuración estándar y métricas precalculadas.
- **Prototipado rápido**: al estar preentrenado y ser ligero, permite validar hipótesis de modelado sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

El repositorio incluye un archivo `standard_benchmark.json` que contiene las métricas MASE, MAE, MSE y sMAPE para cada conjunto de datos bajo el protocolo estándar de NanoForecast. Sin embargo, no se han proporcionado los valores numéricos en la información disponible. Por tanto, no es posible presentar una tabla comparativa con resultados concretos. Se recomienda consultar el archivo en el repositorio para obtener los datos exactos.

## Requisitos de hardware

- **Entrenamiento**: se realizó en una GPU T4 de Google Colab (16 GB VRAM), lo que indica que el modelo es entrenable en hardware de gama media.
- **Inferencia**: los requisitos son muy reducidos; el modelo puede ejecutarse en CPU para predicciones puntuales, aunque se recomienda una GPU para procesamiento por lotes.
- **VRAM estimada**: no disponible, pero dado el tamaño del repositorio (0.2 GB) y la arquitectura (d_model=512, 3 capas), la inferencia debería caber en GPUs con 4 GB o menos.
- **Opciones de despliegue**: al ser pesos PyTorch estándar, se puede usar con cualquier framework de inferencia que soporte PyTorch (por ejemplo, TorchServe, FastAPI con PyTorch, o integración en scripts Python).
- **Latencia y throughput**: no disponible, pero se espera una latencia de milisegundos por predicción en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Sin embargo, PatchTST es un modelo conocido en la literatura de forecasting, y se puede comparar con otras arquitecturas como DLinear, N-BEATS o N-HiTS. No obstante, al no tener datos de rendimiento numéricos, no es posible realizar una comparativa cuantitativa en esta ficha.

## Limitaciones y advertencias

- **Alcance limitado**: el modelo está especializado exclusivamente en predicción de series temporales; no puede realizar tareas de lenguaje natural ni otras capacidades generativas.
- **Horizonte fijo**: la predicción está limitada a un horizonte de 48 pasos; para horizontes mayores sería necesario reentrenar o adaptar el modelo.
- **Dependencia de los datos de entrenamiento**: los resultados pueden degradarse en dominios muy diferentes a los siete conjuntos utilizados (energía, finanzas, electricidad, tráfico).
- **Sesgos de los datos**: los conjuntos de datos ETT, exchange_rate, electricity y traffic tienen sesgos geográficos y temporales específicos (por ejemplo, región de Estados Unidos según la etiqueta `region:us`), lo que puede afectar a la generalización.
- **Licencia no especificada**: al no indicarse licencia, el uso comercial puede ser incierto; se recomienda contactar con el autor antes de utilizarlo en producción.
- **Sin soporte técnico**: el modelo tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto en fase temprana sin mantenimiento activo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/eulogik/nanoforecast-patchtst-baselines
- Proyecto NanoForecast (referencia al script `benchmark_standard.py`): no se ha proporcionado URL directa en la información disponible.
