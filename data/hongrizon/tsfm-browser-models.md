# HONGRIZON/tsfm-browser-models

## Resumen

`HONGRIZON/tsfm-browser-models` es un repositorio de modelos ONNX para pronóstico de series temporales diseñados para ejecutarse directamente en el navegador mediante `onnxruntime-web` (backend WASM). No es un modelo entrenado por el autor, sino una recopilación de tres modelos base (Chronos-2, Granite TTM R2 y TempoPFN) adaptados o convertidos a ONNX para su uso en material docente. El autor lo describe explícitamente como "modelos base para una clase de series temporales" que los estudiantes descargan y ejecutan en su propio navegador.

El repositorio cubre tres enfoques distintos de pronóstico: un modelo fundacional probabilístico basado en transformers (Chronos-2 de Amazon), un modelo compacto de IBM especializado en frecuencia diaria (Granite TTM R2) y un modelo de inferencia basada en contexto previo (TempoPFN de AutoML-org). La entrada es siempre material diario y el horizonte de predicción está fijado en 14 días en las tres variantes adaptadas.

Su relevancia es acotada pero interesante: demuestra que es viable desplegar pronóstico de series temporales en el cliente sin backend, con pesos cuantizados o en FP16 y un tamaño de repositorio de 0,2 GB. Es un artefacto educativo, no un modelo de producción, y con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres modelos independientes: Chronos-2 (transformer fundacional de series temporales), Granite TTM R2 (modelo ligero de pronóstico), TempoPFN (transformer de inferencia basada en contexto) |
| Parametros totales | No disponible (TempoPFN parte de un checkpoint de 38M; el resto no se especifica) |
| Parametros activos | No aplica (no son modelos MoE) |
| Longitud de contexto | TempoPFN: 256 días de contexto. Chronos-2 y TTM: no disponible |
| Tipos de cuantizacion | Chronos-2: int8 (q8). TTM: no disponible. TempoPFN: pesos en FP16 |
| Idiomas soportados | No aplica (modelos numéricos de series temporales) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (ejecutables con onnxruntime-web / WASM) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo desde cero. Cada archivo procede de un proyecto distinto y ha recibido un tratamiento diferente. `chronos2_q8.onnx` es una copia sin modificar del modelo Chronos-2 de Amazon, obtenida a través de la conversión `VishalMysore/chronos-2-onnx-web` (webTimesFM), cuantizada a int8. `ttm_r2_daily_512_14.onnx` parte de `ibm-granite/granite-timeseries-ttm-r2` (revisión 512-48-ft-r2.1), con el token de frecuencia diaria fijado directamente en el grafo, la salida recortada a 14 días y posterior conversión a ONNX. `tempopfn_256_14_fp16w.onnx` es una reimplementación en PyTorch puro de TempoPFN (checkpoint de 38M de `AutoML-org/TempoPFN`), convertida a ONNX con contexto de 256 días, cuantiles de 0,1 a 0,9 y pesos almacenados en 16 bits.

La innovación técnica del paquete es de despliegue, no de modelado: los tres grafos están pensados para ejecutarse en WASM dentro del navegador, con entrada diaria y horizonte fijo de 14 días. TempoPFN expone una interfaz concreta: `values` de forma [1,256] con los valores brutos, `tf_hist` [1,256,25] y `tf_fut` [1,14,25] con las características temporales, y salida `quantiles` [1,14,9]. No hay información sobre datos de entrenamiento, número de tokens ni procesos de RLHF/DPO, ya que el autor no los entrena.

## Capacidades

- Pronóstico univariante de series temporales diarias con horizonte fijo de 14 días.
- Pronóstico probabilístico mediante cuantiles en TempoPFN (0,1 a 0,9, nueve cuantiles de salida).
- Inferencia en el cliente sin backend, vía `onnxruntime-web` con backend WASM.
- Tres paradigmas distintos disponibles: fundacional (Chronos-2), ligero especializado (TTM R2) y basado en contexto previo (TempoPFN).
- Ejecución offline una vez descargados los pesos en el navegador.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües: es un modelo puramente numérico.

## Casos de uso

- Docencia de series temporales: el escenario original. Los estudiantes descargan los tres ONNX y comparan en su navegador el comportamiento de un modelo fundacional, uno ligero y uno de contexto previo sobre la misma serie diaria de 14 días.
- Pronóstico de métricas operativas en paneles web: integrar el ONNX de TTM R2 en un dashboard para proyectar 14 días de una métrica diaria (visitas, pedidos, incidencias) sin enviar datos a un servidor.
- Predicción de series financieras de alta frecuencia agregada a diario: el repositorio incluye `browser_forecasts_check.csv` con 25 puntos de predicción sobre el número diario de transacciones de BTCUSDT y 14 días de salida esperada, útil como caso de validación reproducible.
- Validación de pipelines de conversión ONNX: usar los tres grafos como banco de pruebas para verificar que una instalación de `onnxruntime-web` produce las salidas esperadas del CSV de control.
- Prototipado rápido de forecasting en aplicaciones web: dado el tamaño total de 0,2 GB y la licencia Apache-2.0, sirve para maquetar una función de pronóstico antes de invertir en infraestructura de serving.
- Demostraciones de cuantización: comparar la variante int8 de Chronos-2 con la FP16 de TempoPFN para ilustrar el compromiso entre tamaño, latencia y precisión en el navegador.
- Análisis de privacidad por diseño: casos donde la serie no puede salir del dispositivo del usuario y se requiere un pronóstico local, aunque sea con un horizonte limitado de 14 días.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo incluye `browser_forecasts_check.csv`, un conjunto de salidas esperadas para verificar la corrección de la inferencia en el navegador, no una evaluación comparativa de precisión.

## Requisitos de hardware

- Al no requerir GPU, el requisito principal es memoria del navegador y soporte de WebAssembly; el repositorio completo ocupa 0,2 GB.
- Chronos-2 en int8 es la variante más pesada; TTM R2 y TempoPFN (38M de parámetros, pesos FP16) son las más ligeras.
- Cabe en cualquier equipo de consumo con un navegador moderno; no se especifican requisitos mínimos de RAM.
- Despliegue previsto: `onnxruntime-web` con backend WASM. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| HONGRIZON/tsfm-browser-models | No disponible (TempoPFN 38M) | 256 días (TempoPFN) | ONNX | Apache-2.0 | Paquete docente para navegador |
| amazon/chronos-2 | No disponible | No disponible | No disponible | Apache-2.0 (según el autor) | Fundacional de series temporales |
| ibm-granite/granite-timeseries-ttm-r2 | No disponible | No disponible | No disponible | Apache-2.0 (según el autor) | Pronóstico ligero especializado |
| AutoML-org/TempoPFN | 38M (checkpoint) | 256 días | PyTorch | No disponible en la información | Inferencia basada en contexto |

La comparativa se limita a los modelos de origen, ya que el repositorio es una reempaquetado de estos; no se dispone de datos de rendimiento para comparar precisión.

## Limitaciones y advertencias

- Es un artefacto educativo con cero descargas y cero likes; no hay evidencia de uso en producción ni de mantenimiento continuo.
- Horizonte de predicción fijo de 14 días y entrada diaria: no admite otras frecuencias ni horizontes sin reconvertir los grafos.
- `chronos2_q8.onnx` es una copia de una conversión de terceros (webTimesFM) sin verificación independiente documentada.
- `tempopfn_256_14_fp16w.onnx` es una reimplementación en PyTorch del autor, no una conversión oficial; puede divergir del modelo original.
- La model card está en coreano y no documenta sesgos, tasas de error ni limitaciones de los modelos subyacentes.
- La licencia Apache-2.0 se declara en el repositorio, pero la autoría y los términos de cada modelo de origen deben verificarse por separado antes de un uso comercial.
- No hay información sobre el rendimiento en series con estacionalidad fuerte, valores atípicos o datos faltantes.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí de pronósticos sin garantía de calibración en los cuantiles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HONGRIZON/tsfm-browser-models
- Modelo de origen Chronos-2: https://huggingface.co/amazon/chronos-2
- Conversión ONNX de Chronos-2 (webTimesFM): https://huggingface.co/VishalMysore/chronos-2-onnx-web
- Modelo de origen Granite TTM R2: https://huggingface.co/ibm-granite/granite-timeseries-ttm-r2
- Modelo de origen TempoPFN: https://huggingface.co/AutoML-org/TempoPFN
