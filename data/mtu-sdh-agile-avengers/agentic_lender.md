# mtu-sdh-agile-avengers/agentic_lender

## Resumen

AL-AVM (Automated Valuation Model) es un modelo de regresion tabular para estimar el valor de mercado (precio de anuncio) de viviendas residenciales en la Republica de Irlanda. Forma parte de AL (Agentic Lender), un proyecto estudiantil del MTU (Munich University of Applied Sciences / Munster Technological University, segun el contexto del autor), y se distribuye como un pipeline serializado con `joblib` en Hugging Face. No es un modelo de lenguaje: es un artefacto de machine learning clasico orientado a prediccion numerica sobre datos estructurados.

El modelo toma como entrada variables como condado, superficie en metros cuadrados, numero de habitaciones y banos, tipo de propiedad, certificado energetico (BER) y coordenadas geograficas, y devuelve una estimacion del precio de anuncio en euros. La pipeline incluye imputacion interna de superficie y BER cuando faltan, con indicadores `area_known` y `ber_known`. Se entreno sobre 8.153 anuncios del Ireland House Properties Dataset 2024 (Daft.ie) tras un proceso de limpieza.

Es relevante como ejemplo de modelo tabular de bajo coste computacional para valoracion inmobiliaria, con metricas publicadas (MAE de 86.649 EUR, R2 de 0,7) y limitaciones explicitamente documentadas por el autor, especialmente el uso de precios de anuncio en lugar de precios de venta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline tabular de regresion serializado con joblib (algoritmo concreto no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo tabular, sin contexto textual) |
| Tipos de cuantizacion | no disponible (artefacto joblib, sin cuantizacion) |
| Idiomas soportados | no disponible (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | joblib (`avm_v1.joblib`) |

## Arquitectura y entrenamiento

Se trata de un modelo de regresion tabular empaquetado como pipeline de preprocesamiento y estimador, serializado con `joblib`. La model card no detalla el algoritmo concreto del estimador ni la configuracion del pipeline mas alla de la imputacion de superficie y BER con flags `area_known` y `ber_known`. Las entradas son mayoritariamente categoricas (condado, tipo de propiedad, BER) y numericas (superficie, habitaciones, banos, latitud, longitud).

El entrenamiento utilizo 8.153 anuncios del Ireland House Properties Dataset 2024 (Daft.ie). El preprocesamiento descrito incluye filtrar solo viviendas, excluir Irlanda del Norte, eliminar superficies implausibles y descartar anuncios duplicados. No se documentan tecnicas de regularizacion, validacion cruzada, ajuste de hiperparametros ni pesos por muestra; tampoco se menciona ningun tipo de RLHF o ajuste por preferencias, lo cual es coherente con un modelo de regresion tabular.

## Capacidades

- Prediccion de precio de anuncio de vivienda residencial en la Republica de Irlanda a partir de variables estructuradas.
- Manejo de valores faltantes en superficie y BER mediante imputacion interna, con flags `area_known` y `ber_known`.
- Uso de informacion geografica (latitud y longitud) como variable predictiva.
- Uso de categoria energetica (BER) como variable predictiva.
- Inferencia local via `joblib.load` y `predict` sobre un DataFrame de pandas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- No tiene capacidades multilingues.

## Casos de uso

- Estimacion rapida de precio de anuncio para portales inmobiliarios: dado un anuncio con condado, superficie, habitaciones, banos, tipo, BER y coordenadas, el modelo devuelve una estimacion en euros que puede usarse como referencia orientativa junto al precio publicado.
- Triaje interno de carteras de anuncios: un equipo puede aplicar el modelo por lotes sobre un CSV de anuncios para detectar desviaciones entre precio pedido y estimacion del modelo y priorizar revision manual.
- Prototipado de funcionalidades de valoracion en una aplicacion de lending estudiantil (contexto AL): el modelo sirve como componente de demostracion dentro de un flujo mayor de evaluacion crediticia, siempre con la advertencia de que no es una valoracion valida para concesion de prestamos.
- Analisis exploratorio de mercado por condado: agregando predicciones y residuales por condado se pueden identificar zonas donde el modelo sistematicamente sobreestima o subestima, util para estudios academicos.
- Benchmark interno de modelos tabulares: al ser un pipeline pequeno y con metricas publicadas (MAE, RMSE, MAPE, R2), sirve como linea base reproducible para comparar tecnicas alternativas sobre el mismo dataset.
- Educacion y docencia: ejemplo didactico de pipeline de regresion con imputacion, flags de missingness y evaluacion con MAE/RMSE/MAPE/R2 sobre datos inmobiliarios reales.
- Integracion en notebooks de analisis de precios de vivienda en Irlanda: carga directa desde Hugging Face con `hf_hub_download` y uso inmediato sobre DataFrames.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| MAE_eur | 86.649,1 |
| RMSE_eur | 170.597,4 |
| MAPE_pct | 20,0 |
| R2 | 0,7 |

No se han publicado resultados comparativos frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el artefacto es un pipeline joblib de regresion tabular; no requiere GPU.
- VRAM estimada: no aplica; consumo de memoria dependiente del tamano del pipeline y del lote de inferencia, no cuantificado en la model card.
- GPU recomendadas: ninguna necesaria.
- Compatibilidad con GPU consumer: irrelevante para el caso de uso previsto.
- Opciones de despliegue: carga via `joblib.load` y `huggingface_hub.hf_hub_download`; integrable en scripts Python, notebooks, servicios FastAPI o flujos batch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no referencia modelos alternativos de valoracion inmobiliaria ni benchmarks comparativos.

## Limitaciones y advertencias

- Entrenado sobre precios de anuncio, no precios de venta: las salidas son una estimacion del precio de anuncio de mercado y no una valoracion apta para concesion de prestamos.
- Error concentrado en vivienda rural barata: aproximadamente 32% en el quintil mas barato del mercado frente a cerca del 11% en el segmento medio.
- Instantanea unica de 2024: el modelo no captura la evolucion temporal de precios.
- Cobertura geografica limitada a la Republica de Irlanda (Irlanda del Norte excluida).
- Sin datos publicados sobre sesgos demograficos o geograficos mas alla de la concentracion de error por segmento de precio.
- Riesgo de extrapolacion fuera de distribucion ante entradas con superficies, coordenadas o categorias BER no representadas en el entrenamiento.
- Licencia MIT: permite uso comercial, pero la model card restringe explicitamente el uso como valoracion para lending.
- Sin informacion sobre versionado del dataset, semillas, particion train/test ni metodologia de evaluacion.

## Enlaces

- Hugging Face: https://huggingface.co/mtu-sdh-agile-avengers/agentic_lender
- Dataset citado (Ireland House Properties Dataset 2024, Daft.ie): no disponible como enlace directo en la informacion proporcionada.
- Repositorio o demo del proyecto AL (Agentic Lender): no disponible en la informacion proporcionada.
