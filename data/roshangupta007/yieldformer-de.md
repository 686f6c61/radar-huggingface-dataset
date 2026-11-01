# Roshangupta007/YieldFormer-DE

## Resumen

YieldFormer-DE es un modelo de predicción de rendimiento agrícola desarrollado en el marco de un Praktikum del Chair for Computer Science IV (Computer Vision) de la Julius-Maximilians-Universität Würzburg, con autoría de Roshan Kumar Gupta, Manisha Samal y Sreedeepthi Ramanath, bajo la supervisión del Prof. Dr. Radu Timofte y la asesoría del Dr. Fayaz Ali. Su objetivo es estimar el rendimiento oficial por distrito (NUTS-3) de diez cultivos herbáceos en Alemania al final de cada campaña, antes de que se publiquen las estadísticas oficiales, lo que lo convierte en una herramienta de nowcasting agrícola con valor operativo para administraciones, aseguradoras y operadores de mercado.

Técnicamente no es un modelo único, sino un ensemble de tres arquitecturas transformer para series temporales multivariantes (iTransformer, Temporal Fusion Transformer y PatchTST) combinadas con pesos iguales y corregidas mediante una memoria de error por distrito que recoge la sobreestimación o subestimación reciente de cada distrito. Cada red se entrena por campaña móvil (años de test de 2010 a 2025) y por semilla, con ajuste fino posterior por cultivo.

Los checkpoints están publicados en HuggingFace bajo licencia MIT, con un repositorio de 10 GB que incluye los pesos en formato PyTorch (`.pt`), artefactos de configuración (`.pipeline.json`, `.finetune.json`) y pronósticos sellados para 2026, 2027 y 2028 con huellas SHA-256 registradas en el historial git del proyecto. El modelo se evalúa con una precisión del 88,8 % (100 menos el error porcentual absoluto medio) sobre 37.383 pares distrito-cultivo-año en 363 distritos, frente al 86,9 % de la media distrital a cinco años.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de tres redes transformer para series temporales: iTransformer, Temporal Fusion Transformer (TFT) y PatchTST, con corrección posterior mediante memoria de error por distrito |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de entradas diarias por campaña de cultivo; 69 entradas diarias y 23 entradas fijas por distrito) |
| Tipos de cuantización | no disponible (checkpoints PyTorch en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (inglés; el modelo no procesa texto, opera sobre variables numéricas) |
| Licencia | MIT para los checkpoints; los datos de entrenamiento mantienen sus licencias propias (DWD y SoilGrids CC BY 4.0, Destatis dl-de/by-2-0, ERA5-Land Copernicus, MODIS NASA LP DAAC) |
| Formato de pesos | PyTorch (`.pt`), junto con ficheros `.pipeline.json` y `.finetune.json`; no son modelos standalone de `transformers` |

## Arquitectura y entrenamiento

YieldFormer-DE combina tres arquitecturas transformer diseñadas para series temporales multivariantes. iTransformer aplica atención sobre la dimensión de variables en lugar de sobre la dimensión temporal; Temporal Fusion Transformer incorpora mecanismos de atención interpretable y variables estáticas y dinámicas; PatchTST divide la serie en parches y aplica atención sobre ellos. Las tres redes se entrenan de forma independiente y se promedian con pesos iguales. Sobre esa media se aplica una corrección basada en una memoria de error por distrito, calculada a partir de pronósticos anteriores, que no tiene checkpoint asociado.

Las entradas son 69 variables diarias a lo largo de la campaña de cada cultivo (meteorología de estaciones DWD, agua en suelo y radiación de ERA5-Land, índices de vegetación MODIS sobre tierra arable y etapas de desarrollo fenológico del cultivo según DWD) más 23 entradas fijas por distrito (suelo de SoilGrids, terreno e indicador de cultivo). El objetivo es la desviación del rendimiento respecto a la normal distrital. Cada red se entrena una vez por campaña móvil (`rollYYYY`, con año de test de 2010 a 2025 y 2026 para el pronóstico sellado) y por semilla (`s42`, `s43`, `s44`), usando únicamente datos de al menos dos campañas anteriores al año de test. Cada campaña tiene dos etapas: un entrenamiento conjunto para todos los cultivos y un ajuste fino por cultivo. Los directorios `itransformer_v20Q/`, `tftnet_v20T/` y `patchtst17_v20P/` contienen una versión v20 con entradas de estrés que fue probada y no adoptada, conservada para permitir la verificación del resultado.

## Capacidades

- Predicción de rendimiento agrícola por distrito (NUTS-3) para diez cultivos herbáceos en Alemania al final de cada campaña.
- Pronóstico de la desviación del rendimiento respecto a la normal distrital, no del valor absoluto.
- Integración de fuentes heterogéneas: meteorología, humedad y radiación del suelo, índices de vegetación por satélite y fenología del cultivo.
- Evaluación con ventanas móviles anuales y validación con datos estrictamente anteriores al año de test (sin fuga temporal).
- Generación de pronósticos sellados con verificación criptográfica (SHA-256) para campañas futuras.
- Ajuste fino específico por cultivo sobre un modelo base multi-cultivo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en lenguaje natural.
- No dispone de capacidades de visión, audio ni generación de texto: es un modelo de regresión tabular sobre series temporales.

## Casos de uso

- Nowcasting estadístico agrícola: estimar el rendimiento por distrito antes de la publicación oficial de Destatis, lo que permite a administraciones anticipar balances de campaña y ajustar políticas de mercado con semanas de ventaja.
- Suscripción de seguros agrarios: la estimación por distrito de la desviación respecto a la normal sirve para tarificar primas y detectar siniestralidad temprana en zonas concretas, con una precisión del 88,8 % en la evaluación retrospectiva.
- Gestión de riesgos en comercialización de grano: operadores y cooperativas pueden usar los pronósticos sellados de 2026 a 2028 para planificar coberturas y logística antes de que existan cifras oficiales.
- Investigación agronómica comparada: el ensemble permite analizar qué variables (meteorología, agua en suelo, índices MODIS) contribuyen más a la predicción en cada cultivo y distrito.
- Planificación de cadena de suministro agroalimentaria: la estimación por distrito y cultivo alimenta modelos de aprovisionamiento y de asignación de capacidad de almacenamiento.
- Validación metodológica de arquitecturas: el repositorio conserva los checkpoints de la versión v20 no adoptada, lo que permite reproducir la comparación entre variantes y auditar la decisión de diseño.
- Docencia y reproducción científica: el pipeline por campaña y semilla, junto con los ficheros de configuración, facilita la replicación del experimento en otros países o cultivos con datos equivalentes.

## Benchmarks y rendimiento

Evaluación móvil de 2010 a 2025 sobre 37.383 pares distrito-cultivo-año en 363 distritos. Métrica: precisión (100 menos el error porcentual absoluto medio).

| Pronóstico | Precisión |
|---|---|
| YieldFormer-DE | 88,8 % |
| Media distrital a 5 años | 86,9 % |
| Normal distrital a largo plazo | 86,4 % |

La ganancia frente a la media a cinco años es de +1,93 puntos porcentuales (intervalo del 90 %: 1,04 a 3,12). El modelo supera a la normal a largo plazo en las 16 campañas y a la media a cinco años en 13 de ellas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (10 GB) incluye todos los checkpoints de todas las campañas, semillas y cultivos, no el peso de un único modelo en memoria.
- GPU recomendadas: no disponibles en la información proporcionada. Al ser un ensemble de tres transformers sobre ventanas de 69 variables diarias y 23 entradas fijas, la carga por inferencia es moderada, pero no se documentan requisitos oficiales.
- Compatibilidad con GPU de consumo: no confirmada. No se especifica si el ensemble completo cabe en una RTX 4090 u otras GPU consumer.
- Opciones de despliegue: los ficheros son checkpoints PyTorch que se cargan con las clases del código del proyecto (`src/models/`), que también construye las ventanas de entrada. No son modelos standalone de `transformers`, por lo que no se integran directamente en vLLM, TGI, llama.cpp ni Ollama. Existe un dashboard en vivo desplegado en Streamlit.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Métrica reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YieldFormer-DE | Ensemble iTransformer + TFT + PatchTST con memoria de error | 10 cultivos, 363 distritos de Alemania, 2010-2025 | 88,8 % de precisión (100 − MAPE) | MIT (checkpoints) | HuggingFace, código en GitHub, dashboard Streamlit |
| Media distrital a 5 años | Baseline estadístico | Misma cobertura | 86,9 % | No aplica | Referencia del propio estudio |
| Normal distrital a largo plazo | Baseline estadístico | Misma cobertura | 86,4 % | No aplica | Referencia del propio estudio |

No se dispone en la información proporcionada de otros modelos comparables de predicción de rendimiento agrícola con métricas publicadas en el mismo conjunto de evaluación.

## Limitaciones y advertencias

- El TFT individual con memoria de error alcanza una precisión de 88,84 %, prácticamente idéntica a la del ensemble (88,8 %). El ensemble se eligió mediante una regla de decisión definida antes de la prueba, pero la ganancia frente a un solo modelo es marginal.
- Con datos truncados a 30 de junio, el modelo no supera a la media distrital a cinco años: su utilidad depende de disponer de la campaña completa.
- Subestima las pérdidas muy grandes en distritos individuales, lo que puede infravalorar eventos extremos.
- La evidencia empírica descansa sobre 16 campañas de test, un tamaño limitado para extraer conclusiones robustas sobre generalización climática.
- El modelo está entrenado y validado únicamente para Alemania y diez cultivos herbáceos; no se documenta transferibilidad a otros países, cultivos o escalas administrativas.
- Los checkpoints no son modelos standalone de `transformers`: requieren el código del proyecto para cargarse y construir las ventanas de entrada, lo que añade dependencia de mantenimiento.
- Los pronósticos sellados de 2026 a 2028 se emitieron antes de que existieran cifras oficiales y su verificación depende de comprobar las huellas SHA-256 con `sha256sum -c FROZEN.sha256`.
- La licencia MIT cubre los checkpoints, pero los datos de entrenamiento conservan licencias propias (DWD y SoilGrids CC BY 4.0, Destatis dl-de/by-2-0, ERA5-Land Copernicus, MODIS NASA LP DAAC) que condicionan su reutilización.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe riesgo de predicciones erróneas presentadas con aparente precisión, especialmente en distritos con pocos datos históricos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Roshangupta007/YieldFormer-DE
- Código del proyecto: https://github.com/roshangupta00750/transformer-based-crop-yield-prediction
- Dashboard en vivo: https://yieldformer-de.streamlit.app
- Dataset de entrenamiento: https://huggingface.co/datasets/Roshangupta007/YieldFormer-DE-data
