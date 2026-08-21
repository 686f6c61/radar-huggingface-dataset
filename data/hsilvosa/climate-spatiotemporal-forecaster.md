# hsilvosa/climate-spatiotemporal-forecaster

## Resumen

El modelo `climate-spatiotemporal-forecaster`, desarrollado por hsilvosa (HugoSilvosa), es una red neuronal profunda especializada en predicción probabilística de series temporales climáticas a múltiples horizontes (de 1 a 14 días). Está diseñado para anticipar eventos extremos como olas de calor, heladas y precipitaciones anómalas, utilizando datos de estaciones meteorológicas globales del NOAA Global Historical Climatology Network Daily (GHCN-Daily). El modelo combina una arquitectura híbrida que integra embedding de armónicos esféricos para codificar coordenadas geográficas, una red convolucional temporal (TCN) con dilataciones para capturar dependencias causales, atención multi-cabeza para modelar memoria atmosférica y un decodificador de cuantiles que garantiza calibración probabilística.

Con solo 554.260 parámetros, el modelo es extremadamente ligero y puede ejecutarse en CPU o GPU de consumo, lo que lo hace accesible para aplicaciones de alerta temprana en regiones con recursos computacionales limitados. Su relevancia radica en ofrecer una alternativa eficiente a los modelos numéricos de predicción meteorológica (NWP) para tareas específicas de detección de peligros climáticos, con un rendimiento validado en estaciones fuera de la muestra de entrenamiento. La licencia Apache-2.0 permite su uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ClimateSpatiotemporalNet (spherical harmonic embedding + TCN dilatado + atención multi-cabeza + decodificador de cuantiles) |
| Parametros totales | 554.260 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada: 30 días de observaciones; salida: 14 días de predicción) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | En (documentación y etiquetas; el modelo procesa datos numéricos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (según tags) |

## Arquitectura y entrenamiento

El modelo `ClimateSpatiotemporalNet` se compone de cinco módulos principales. Primero, un embedding de armónicos esféricos que mapea latitud, longitud y elevación a un manifold de Fourier multiescala con bandas de frecuencia desde \(2^0\) hasta \(2^7\). Segundo, un backbone TCN residual con dilataciones que extrae dependencias temporales causales de las observaciones históricas de 30 días, evitando fuga de información. Tercero, atención multi-cabeza temporal que modela memoria atmosférica, patrones de bloqueo de presión y transiciones estacionales de largo alcance. Cuarto, un decodificador directo multi-paso que predice cuantiles \(P_{10}, P_{50}, P_{90}\) para \(T_{max}\), \(T_{min}\) y \(PRCP\) en horizontes de \(t+1\) a \(t+14\), con garantía estructural de monotonicidad (\(P_{10} \le P_{50} \le P_{90}\)). Quinto, cabezas de clasificación de peligros que estiman probabilidades calibradas de olas de calor (\(T_{max} \ge \text{P95}\) durante al menos 3 días), heladas (\(T_{min} \le 0^\circ\text{C}\)) y lluvias torrenciales (\(PRCP \ge 50\text{mm/día}\)).

El entrenamiento se realizó sobre datos de 120 estaciones meteorológicas representativas de los seis continentes, cubriendo todos los perfiles de elevación y principales zonas climáticas de Köppen, con el periodo de referencia climatológica estándar de la OMM (1991-2020). No se menciona el uso de RLHF ni DPO, dado que es un modelo de regresión y clasificación supervisada, no generativo. La innovación principal reside en la combinación de codificación geométrica esférica con atención temporal y salidas cuantílicas calibradas, lo que permite predicciones probabilísticas fiables sin necesidad de ensamblajes complejos.

## Capacidades

- Predicción de series temporales climáticas multi-horizonte (1 a 14 días) para temperatura máxima, mínima y precipitación.
- Salida probabilística con cuantiles \(P_{10}\), \(P_{50}\) y \(P_{90}\), con cobertura de intervalo calibrada (80.2% para el intervalo de confianza del 80%).
- Detección de eventos extremos: olas de calor (basadas en EHF), heladas y lluvias torrenciales, con probabilidades asociadas.
- Codificación espacial explícita mediante armónicos esféricos, lo que permite generalizar a ubicaciones no vistas durante el entrenamiento.
- Procesamiento de entradas temporales con 7 características: \(t_{max}\), \(t_{min}\), \(prcp\), seno/coseno del día del año, y anomalías de temperatura.
- Soporte para inferencia en lote y despliegue ligero (554K parámetros, ~0.1 GB).
- No incluye capacidades de tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- **Sistemas de alerta temprana de olas de calor**: el modelo puede integrarse en plataformas de salud pública para anticipar episodios de calor extremo con 14 días de antelación, permitiendo activar protocolos de prevención. Su salida probabilística (probabilidad de ola de calor por día) facilita la toma de decisiones con umbrales configurables.
- **Planificación agrícola y gestión de heladas**: los agricultores pueden usar las predicciones de \(T_{min}\) y la probabilidad de helada para decidir cuándo proteger cultivos sensibles, como viñedos o frutales. El horizonte de 14 días permite programar riegos anti-helada o cubiertas con margen suficiente.
- **Gestión de recursos hídricos**: las predicciones de precipitación (PRCP) y sus cuantiles ayudan a gestores de embalses a anticipar episodios de lluvias torrenciales o sequías, optimizando la liberación de agua y la planificación de riego.
- **Planificación energética**: las temperaturas extremas afectan la demanda eléctrica (calefacción y refrigeración). El modelo puede alimentar modelos de demanda para ajustar la generación y evitar cortes durante olas de calor o frío intenso.
- **Seguros y reaseguros climáticos**: las aseguradoras pueden utilizar las probabilidades de eventos extremos para tarificar pólizas indexadas a parámetros climáticos, evaluando el riesgo de pérdidas en regiones específicas con datos históricos y predicciones a corto plazo.
- **Investigación climática y validación de modelos**: los investigadores pueden emplear el modelo como baseline eficiente para comparar con modelos NWP o como herramienta de downscaling estadístico, gracias a su bajo coste computacional y su capacidad de generar cuantiles calibrados.

## Benchmarks y rendimiento

Los resultados presentados a continuación son los declarados por el autor en la model card, evaluados sobre estaciones globales fuera de la muestra de entrenamiento. Se comparan con un baseline de persistencia (usar el valor del día anterior como predicción).

| Métrica | Horizonte | Valor del modelo | Mejora vs. Persistencia |
|---|---|---|---|
| TMAX MAE | 1 día | 2.397 °C | +28.4% |
| TMAX MAE | 7 días | 2.734 °C | +21.2% |
| TMAX MAE | 14 días (global) | 2.694 °C | +18.6% |
| TMIN MAE | 14 días (global) | 2.475 °C | +19.4% |
| Cobertura de intervalo TMAX | 80% CI (P10-P90) | 80.2% | Calibrado (nominal: 80%) |
| Heatwave Alert (EHF) | F1 | 0.4099 | ROC-AUC: 0.7701 |
| Frost / Freeze Alert | F1 | 0.8539 | ROC-AUC: 0.9638 |
| Deluge Hazard Alert | F1 | 0.626 | ROC-AUC: 0.8689 |

No se han publicado comparaciones con otros modelos de forecasting climático en la información disponible. Los valores de ROC-AUC para heladas y lluvias torrenciales indican una discriminación sólida, mientras que el F1 para olas de calor es moderado, probablemente debido a la rareza del evento.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB en FP32 (554K parámetros ≈ 2.2 MB en FP32). Cualquier GPU moderna con al menos 2 GB puede ejecutarlo sin problemas.
- **GPU recomendadas**: no se requiere GPU de alta gama; una NVIDIA GTX 1650 o superior es suficiente. También puede ejecutarse en CPU (inferencia en menos de 10 ms por muestra en un procesador moderno).
- **Compatibilidad con hardware de consumo**: sí, cabe en cualquier ordenador portátil o Raspberry Pi 4 (con 4 GB de RAM) para inferencia en tiempo real.
- **Opciones de despliegue**: PyTorch (carga directa de safetensors), ONNX Runtime para entornos de producción, o integración en pipelines de datos con Apache Arrow/PyArrow. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: al ser un modelo pequeño, la latencia por lote de 1 muestra es del orden de milisegundos en CPU y submilisegundos en GPU. Puede procesar cientos de estaciones en paralelo en un solo lote.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (predicción climática multi-horizonte con cuantiles y detección de peligros). El baseline de persistencia es la única referencia de rendimiento publicada. Otros enfoques como modelos basados en difusión o redes CNN-Transformer para predicción meteorológica existen en la literatura, pero no se han encontrado comparaciones directas con este modelo en la información proporcionada. Por tanto, la comparativa se limita al baseline de persistencia, que el modelo supera consistentemente en todas las métricas reportadas.

## Limitaciones y advertencias

- **Cobertura geográfica limitada**: el entrenamiento se realizó con solo 120 estaciones, lo que puede reducir la precisión en regiones con baja densidad de estaciones o climas poco representados.
- **Variables restringidas**: el modelo solo predice \(T_{max}\), \(T_{min}\) y \(PRCP\). No considera humedad, viento, presión u otros factores relevantes para eventos extremos compuestos.
- **Horizonte máximo de 14 días**: predicciones más allá de este plazo no son posibles con la arquitectura actual.
- **Riesgo de errores en eventos extremos**: aunque el ROC-AUC para heladas es alto (0.9638), el F1 para olas de calor es bajo (0.4099), lo que indica una tasa significativa de falsos positivos/negativos en eventos poco frecuentes.
- **Dependencia de datos de entrada**: la calidad de las predicciones depende de la disponibilidad y precisión de las observaciones históricas de 30 días. Estaciones con datos faltantes pueden degradar el rendimiento.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero el autor no ofrece garantías sobre la precisión en aplicaciones críticas. Se recomienda validar localmente antes de desplegar en producción.
- **Sin soporte para datos no numéricos**: el modelo no procesa texto ni imágenes; su uso se limita a series temporales numéricas y coordenadas espaciales.

## Enlaces

- [HuggingFace: hsilvosa/climate-spatiotemporal-forecaster](https://huggingface.co/hsilvosa/climate-spatiotemporal-forecaster)
- [GitHub del autor: hsilvosa](https://github.com/hsilvosa?tab=repositories)
- [Paper de referencia del dataset GHCN-Daily (Menne et al., 2012)](https://journals.ametsoc.org/view/journals/atot/29/7/jtech-d-11-00103_1.xml)
