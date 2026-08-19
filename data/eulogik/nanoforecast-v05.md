# eulogik/nanoforecast-v05

## Resumen

NanoForecast v0.5 es un modelo de predicción de series temporales desarrollado por Eulogik, diseñado específicamente para despliegue en entornos de edge computing. Con solo 6,5 millones de parámetros, ofrece capacidades de forecasting multivariante, cuantiles probabilísticos y cero-shot, todo ello ejecutable en CPU, Raspberry Pi o mediante exportación a ONNX. Su arquitectura híbrida combina LongConv y DeltaNet en bloques de mezcla de secuencias, logrando un equilibrio entre eficiencia computacional y precisión.

El modelo destaca por su capacidad de streaming y su tamaño reducido, lo que lo convierte en una opción viable para aplicaciones en tiempo real en dispositivos con recursos limitados. En benchmarks bajo un protocolo estándar, supera a TimesFM (200M parámetros) en los tres conjuntos de datos ETT, con 31 veces menos parámetros. La versión v0.5 incorpora mejoras en el pipeline de entrenamiento que redujeron el error MASE un 46,6% respecto a la v0.3, sin cambios en la arquitectura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con bloques LongConv y DeltaNet RNN |
| Parametros totales | 6.518.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 pasos (según protocolo de benchmark) |
| Tipos de cuantizacion | no disponible (exportable a ONNX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

NanoForecast v0.5 emplea una arquitectura de transformer con un escalador robusto por instancia (median/IQR) y un mecanismo de parcheo adaptativo (patch_size=8). Incluye un módulo de *Resolution Prefix Tuning* que introduce covariables de frecuencia (freq_id) para adaptarse a diferentes granularidades temporales. El núcleo del modelo son 8 bloques de mezcla de secuencias, cada uno compuesto por una convolución larga (LongConv, kernel=49) para capturar dependencias globales, una RNN DeltaNet (state_size=64) para dependencias locales, un router con puertas aprendidas que combina ambas vías, y un MLP con expansión de 2. Las cabezas de salida generan predicción puntual y cinco cuantiles monotónicos (p10, p25, p50, p75, p90) en una sola pasada.

El entrenamiento se realizó sobre seis conjuntos de datos públicos: ETTh1, ETTh2, ETTm1, exchange_rate, electricity y traffic. La versión v0.5 incorpora tres correcciones en el pipeline de entrenamiento (manejo del ámbito de pérdida, alineación de formas de tensor y cobertura de aumento de datos) que redujeron el MASE de 3,282 a 1,752 sin modificar la arquitectura. El modelo se entrenó en una GPU T4 de Colab durante 200 épocas.

## Capacidades

- Predicción de series temporales multivariante con horizonte configurable (48 pasos en benchmarks estándar).
- Salida probabilística con cinco cuantiles (p10–p90) para cuantificación de incertidumbre.
- Inferencia en streaming, procesando datos de forma incremental sin necesidad de ventanas completas.
- Exportación a ONNX para despliegue en dispositivos edge (Raspberry Pi, navegador, CPU).
- Entrenamiento desde CSV sin preprocesamiento complejo, gracias al escalado robusto y parcheo adaptativo.
- Capacidad zero-shot: puede aplicarse a nuevas series sin entrenamiento adicional.
- Soporte para múltiples frecuencias mediante *Resolution Prefix Tuning*.

## Casos de uso

- Monitorización de sensores IoT: el modelo puede ejecutarse directamente en un Raspberry Pi o microcontrolador para predecir valores futuros de temperatura, humedad o consumo energético, con cuantiles que permiten detectar anomalías. Su tamaño de 6,5M parámetros y la inferencia en streaming lo hacen ideal para dispositivos con memoria limitada.

- Mantenimiento predictivo industrial: dado un histórico de vibraciones o lecturas de maquinaria, NanoForecast genera predicciones a 48 pasos con intervalos de confianza, permitiendo anticipar fallos antes de que ocurran. La exportación a ONNX facilita su integración en PLCs o sistemas embebidos.

- Predicción de demanda eléctrica: en redes locales o microrredes, el modelo puede predecir la carga eléctrica a corto plazo utilizando datos históricos de consumo. Su rendimiento en los datasets ETTh1/ETTh2 (MASE 0,685 y 1,109 respectivamente) supera a modelos mucho más grandes como TimesFM.

- Análisis financiero de series de tipo de cambio: aunque el modelo muestra peor rendimiento en exchange_rate (MASE 4,418), sigue siendo útil para predicciones a corto plazo en mercados con baja volatilidad, especialmente cuando se requiere despliegue en infraestructura de bajo coste.

- Predicción de tráfico en ciudades inteligentes: con datos de ocupación de carreteras o flujo de vehículos, NanoForecast puede anticipar congestiones. Su capacidad de streaming permite actualizar predicciones en tiempo real a medida que llegan nuevos datos de sensores.

- Automatización de alertas en agricultura de precisión: el modelo puede procesar series de humedad del suelo o condiciones meteorológicas para recomendar riegos, con cuantiles que indican la incertidumbre de la predicción. Al ser ligero, puede ejecutarse en estaciones de campo alimentadas por batería.

## Benchmarks y rendimiento

La model card publica resultados bajo un protocolo estándar (contexto 512, horizonte 48, ventanas de test no solapadas, MASE escalado por el error del naive estacional) comparando con TimesFM (200M) y PatchTST (15M+). Los valores son los siguientes:

| Dataset | NanoForecast v0.5 (6,5M) | TimesFM (200M) | PatchTST (15M+) |
|---|---:|---:|---:|
| ETTh1 | **0,685** | 0,705 | 0,781 |
| ETTh2 | **1,109** | 1,360 | 1,467 |
| ETTm1 | **0,289** | 0,545 | 0,488 |
| exchange_rate | 4,418 | **4,383** | 3,861 |
| electricity | 2,093 | **0,923** | 1,347 |
| traffic | 1,915 | **0,765** | 1,379 |
| **Overall** | 1,752 | **1,447** | 1,554 |

NanoForecast supera a TimesFM y PatchTST en los tres conjuntos ETT, pero es superado en exchange_rate, electricity y traffic. La comparación de versiones muestra una mejora del 46,6% en MASE global (de 3,282 a 1,752) entre v0.3 y v0.5 con la misma arquitectura.

## Requisitos de hardware

- Con 6,5M de parámetros, el modelo en fp32 ocupa aproximadamente 26 MB, lo que cabe en cualquier CPU moderna y en dispositivos con tan solo 64 MB de RAM.
- Inferencia en CPU: el modelo está diseñado para ejecutarse en Raspberry Pi y navegadores mediante ONNX, sin necesidad de GPU.
- VRAM estimada: no requiere GPU; si se usa aceleración, cualquier GPU con al menos 1 GB de VRAM es suficiente (incluso iGPU integradas).
- Opciones de despliegue: ONNX Runtime, Python (PyTorch), navegador web via ONNX.js o WebAssembly, y posiblemente TensorFlow Lite si se convierte.
- Latencia: no se proporcionan datos concretos, pero dado el tamaño y la arquitectura híbrida (LongConv + DeltaNet), se espera una latencia de milisegundos por paso en CPU.
- Throughput: no disponible, aunque la inferencia en streaming sugiere que puede procesar series en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MASE global (protocolo estándar) | Licencia | Despliegue edge |
|---|---:|---:|---:|---:|---:|
| NanoForecast v0.5 | 6,5M | 512 | 1,752 | Apache 2.0 | Sí (ONNX, CPU, Raspberry Pi) |
| TimesFM | 200M | 512 (típico) | 1,447 | Apache 2.0 | No (requiere GPU) |
| PatchTST | 15M+ | variable | 1,554 | Apache 2.0 | Parcial (requiere más recursos) |
| Chronos-T5 | 8M–710M | variable | no disponible | Apache 2.0 | No (modelos grandes) |
| Lag-Llama | 16,6M | variable | no disponible | Apache 2.0 | Parcial (sin streaming) |

NanoForecast ofrece la mejor relación eficiencia/rendimiento en conjuntos ETT, con un coste computacional muy inferior. Su principal ventaja es la capacidad de streaming y exportación ONNX, ausente en las alternativas.

## Limitaciones y advertencias

- El modelo muestra un rendimiento inferior en series con alta volatilidad o dinámicas no estacionarias (exchange_rate, electricity, traffic) comparado con modelos más grandes.
- Los benchmarks publicados siguen un protocolo propio; los resultados pueden no ser directamente comparables con otros estudios que usan diferentes métricas o particiones de datos.
- No se han documentado sesgos específicos, pero al estar entrenado en seis conjuntos públicos, su generalización a dominios muy diferentes (por ejemplo, datos biomédicos o climáticos) no está garantizada.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda validar el modelo en el dominio de aplicación antes de producción.
- La cuantización no está documentada; aunque la exportación a ONNX es posible, no se especifican formatos de cuantización (int8, fp16) ni su impacto en la precisión.
- El modelo no es multimodal; solo procesa series temporales numéricas, sin soporte para texto o imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eulogik/nanoforecast-v05
- Repositorio GitHub: https://github.com/eulogik/NanoForecast
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/eulogik/nanoforecast
- Sitio web de Eulogik: https://eulogik.com/
- Página de investigación y modelos: https://eulogik.com/lab
