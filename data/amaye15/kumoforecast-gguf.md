# amaye15/kumoforecast-gguf

## Resumen

Kumo-Forecast GGUF es la conversión al formato GGUF de Kumo-Forecast, un modelo zero-shot de predicción de series temporales multivariante publicado por NVIDIA. La conversión ha sido realizada por el usuario amaye15 mediante zsfm, un workspace en Rust que porta modelos fundacionales de forecasting y datos tabulares a GGUF ejecutándose sobre el framework Burn, y está verificada como bit-exact frente al checkpoint original de PyTorch. Su principal valor es permitir inferencia sin PyTorch ni runtime de Python.

El modelo cuenta con 318.495.571 parámetros, acepta hasta 7 canales (series simultáneas) con una ventana de contexto de 96 pasos temporales y genera una previsión puntual de 24 pasos. Solo se publica un archivo en F32 (`kumoforecast-f32.gguf`, 1,3 GB), que embebe sus propios metadatos de arquitectura sin necesidad de `config.json`.

Es relevante ahora porque cubre un nicho concreto: forecasting ligero desplegable en CPU o entornos edge, integrable en servicios Rust o pipelines sin dependencias de Python, con licencias permisivas (MIT para el código de conversión, Apache-2.0 para los pesos).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone MOMENT (codificador T5 por canal) con cabecera de forecasting entrenable |
| Parámetros totales | 318.495.571 (~318,5 M) |
| Parámetros activos | No aplicable (arquitectura densa, no es MoE) |
| Longitud de contexto | 96 pasos temporales (horizonte de predicción: 24 pasos) |
| Tipos de cuantización | F32 (única variante publicada: `kumoforecast-f32.gguf`) |
| Idiomas soportados | No aplicable (modelo de series temporales; metadato registrado: en) |
| Licencia | MIT (código de conversión zsfm); Apache-2.0 (pesos originales de NVIDIA) |
| Formato de pesos | GGUF (F32); checkpoint original en safetensors |

## Arquitectura y entrenamiento

Kumo-Forecast se construye sobre el backbone MOMENT con una cabecera de forecasting entrenable. El flujo de procesamiento es: normalización RevIN → patchify → embedding de valores con codificación posicional sinusoidal → codificador T5 por canal (con sesgo relativo y consciente de la observación, y FFN gated con activación `gelu_new`) → atención cruzada entre canales → cabeza plana sobre el canal 0 → desnormalización RevIN. La salida son 24 pasos de previsión puntual para el canal 0. Un detalle destacable es el soporte de máscaras de valores ausentes: los pasos observados se marcan con `1` y los ausentes con `0`, sustituyéndose estos últimos por el embedding de máscara del modelo.

En cuanto al entrenamiento, la ficha disponible no detalla el número de pasos temporales, la composición del dataset ni el procedimiento de entrenamiento del modelo original de NVIDIA (no disponible). Tampoco se describe ningún ajuste fino posterior: el modelo se utiliza en modo zero-shot. Como innovación técnica del port, la conversión a GGUF embebe sus propios metadatos de arquitectura (sin `config.json` separado) y se ha verificado bit-exact contra el checkpoint original de PyTorch.

## Capacidades

- Predicción zero-shot de series temporales multivariante (hasta 7 canales) sin necesidad de entrenamiento adicional por dominio.
- Ventana de contexto de 96 pasos temporales y salida de 24 pasos de previsión puntual desnormalizada para el canal 0.
- Gestión de valores ausentes mediante máscaras por paso (1 = observado, 0 = ausente), útil con series incompletas o con huecos de telemetría.
- Inferencia sin PyTorch ni Python: runtime en Rust sobre el framework Burn, con salida estructurada en JSON.
- API doble: paquete Python (`pip install zsfm`) y CLI de Rust (`cargo install zsfm`), con un comando de conversión que descarga y transforma los pesos originales localmente.
- No genera texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso: es un modelo especializado exclusivamente en forecasting de series temporales.

## Casos de uso

- Predicción de demanda en retail y gestión de inventarios: se alimentan 96 pasos históricos de ventas (hasta 7 series de productos o tiendas) y se obtienen 24 pasos de previsión puntual para planificar reposiciones a corto plazo.
- Observabilidad y AIOps: previsión de métricas de infraestructura (CPU, latencia, tráfico de red) para autoescalado proactivo; las máscaras permiten trabajar con gaps de telemetría habituales en producción.
- Previsión de consumo energético: proyección de la demanda eléctrica 24 pasos adelante (por ejemplo, horas) para optimizar compras energéticas o la gestión de baterías domésticas e industriales.
- Mantenimiento predictivo en IoT: forecasting de señales de sensores (temperatura, vibración, presión) con huecos por fallos de comunicación, aprovechando el soporte de valores ausentes.
- Proyección de KPIs de negocio: previsión a corto plazo de usuarios activos, ingresos o conversiones para cuadros de mando y alertas automáticas en pipelines ETL.
- Despliegue en edge o servicios Rust: al no requerir Python ni PyTorch, puede integrarse en aplicaciones Rust, dispositivos con recursos limitados o microservicios que consuman la salida JSON directamente.
- Backtesting y monitorización continua: ejecución periódica en cron jobs o sistemas de alerta para comparar previsiones frente a valores reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la ficha de la conversión GGUF ni los datos proporcionados del modelo original incluyen métricas (MSE, MAE, MASE u otras) sobre conjuntos de evaluación estándar de forecasting.

## Requisitos de hardware

- Memoria estimada: los pesos F32 de ~318,5 M de parámetros ocupan ~1,3 GB (coincide con el tamaño del repo), por lo que se estima que bastan ~1,5–2 GB de RAM para inferencia (estimación orientativa).
- No requiere GPU: el port está diseñado para ejecutarse en CPU (Rust + Burn, sin PyTorch), de modo que cualquier CPU moderna de sobremesa o servidor es suficiente.
- Si se prefiere GPU, cualquier GPU de consumo con al menos 2 GB de VRAM (por ejemplo, una RTX 3060 o superior) sobra; no se requieren aceleradores de centro de datos tipo A100 o H100.
- Despliegue: vía zsfm, tanto desde Python (`pip install zsfm`) como desde Rust (`cargo install zsfm --locked`), con inferencia por CLI o API. La compatibilidad con herramientas GGUF estándar (llama.cpp, Ollama) o con vLLM y TGI no está documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amaye15/kumoforecast-gguf (este modelo) | 318,5 M | 96 pasos | 24 pasos (canal 0) | MIT (código) + Apache-2.0 (pesos) | GGUF F32, runtime zsfm (Rust/Python) |
| nvidia/Kumo-Forecast (original) | 318,5 M | 96 pasos | 24 pasos (canal 0) | Apache-2.0 | PyTorch/safetensors en HuggingFace |
| amazon/chronos-bolt-base | ~205 M | 2048 pasos | hasta 64 pasos | Apache-2.0 | PyTorch y ONNX en HuggingFace |
| google/timesfm-1.0-200m-pytorch | ~200 M | 512 pasos | hasta 128 pasos | Apache-2.0 | PyTorch/JAX en HuggingFace |

Nota: los datos de las alternativas son valores de referencia aproximados y no se han publicado comparativas de rendimiento entre estos modelos en la información disponible, por lo que la elección depende de requisitos de ventana, horizonte y entorno de ejecución.

## Limitaciones y advertencias

- Predice únicamente el canal 0: la salida son 24 valores para la primera serie, no previsiones para todos los canales de entrada.
- Contexto y horizonte fijos (96 → 24 pasos): no admite ventanas u horizontes de otras longitudes según lo publicado.
- Máximo de 7 canales (series simultáneas) por inferencia.
- Solo hay variante F32: mayor huella de memoria que una versión cuantizada; no se publican variantes Q4/Q8.
- Requiere zsfm como runtime: la compatibilidad con el ecosistema GGUF estándar (llama.cpp, Ollama) no está documentada, por lo que la portabilidad no está garantizada.
- Modelo zero-shot sin ajuste fino descrito: el rendimiento puede degradar en dominios muy distintos de sus datos de entrenamiento, que no están detallados en la ficha disponible.
- En lugar de alucinación textual, el riesgo análogo es la extrapolación errónea ante cambios de régimen, anomalías o eventos no vistos; además, las salidas son puntuales, sin intervalos de confianza ni cuantiles.
- Sin benchmarks públicos en la información disponible: conviene validar con backtesting propio antes de uso en producción.
- Proyecto muy reciente, con 0 descargas y 0 likes registrados: escasa validación comunitaria hasta la fecha.
- Licencias sin restricciones comerciales (MIT para el código de conversión, Apache-2.0 para los pesos), por lo que no hay caveats legales para uso comercial.

## Enlaces

- Ficha del modelo: https://huggingface.co/amaye15/kumoforecast-gguf
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Kumo-Forecast
- zsfm (runtime y conversión en Rust): https://github.com/amaye15/zsfm-rs
- Burn (framework de ejecución): https://github.com/tracel-ai/burn

Nota: los resultados de la búsqueda web proporcionada no contenían enlaces relevantes para este modelo, por lo que no se incluyen recursos adicionales (papers, demos o blogs).
