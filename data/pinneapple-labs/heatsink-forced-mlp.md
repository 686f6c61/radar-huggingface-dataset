# PINNeAPPle-Labs/heatsink-forced-mlp

## Resumen

`heatsink_forced_mlp` es un modelo subrogado (surrogate) de regresión tabular desarrollado por PINNeAPPle-Labs dentro de su zoo de modelos físicos. Sustituye al motor de simulación HeatSink Sizer en el cálculo de disipadores de aletas planas en convección forzada canalizada: recibe la geometría del disipador, el material, las condiciones ambientales y la potencia disipada, y devuelve la resistencia térmica base-aire, la caída de presión en el lado del aire y una cota superior del 95 % de la resistencia obtenida por conformal prediction dividida (split conformal).

Técnicamente es una red MLP de 4 capas ocultas de 128 unidades con activación SiLU, 13 entradas y 2 salidas (log R y log dP), con solo 51.586 parámetros. Se entrenó con 6.000 resoluciones del motor físico HeatSink Sizer, que combina la correlación de Nusselt de placas paralelas compuestas de Teertstra, Yovanovich y Culham (2000), conducción 3D por volúmenes finitos en la base (resistencia de spreading) y pérdida de carga con fricción de flujo en desarrollo más pérdidas de entrada y salida.

Su relevancia es práctica: permite explorar miles de diseños de disipadores en milisegundos con un error medio del 0,71 % en resistencia térmica y del 1,04 % en caída de presión frente al motor de referencia, algo inasumible con CFD. No es un modelo de lenguaje ni procesa texto: es una herramienta de ingeniería térmica para electrónica, publicada con licencia Apache 2.0 y pesos en safetensors y ONNX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP totalmente conectada (`bench_mlp`): 13 entradas, 4 capas ocultas de 128 unidades, activación SiLU, 2 salidas (log R, log dP) |
| Parametros totales | 51.586 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de regresión tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; por tamaño, FP32/FP16 son irrelevantes en coste) |
| Idiomas soportados | no aplica / no disponible (modelo numérico, sin capacidad lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX; librería `pinneapple`; también PyTorch |

Otros datos técnicos:

| Parametro | Valor |
|---|---|
| Pipeline declarado | `tabular-regression` (inference: false en la model card) |
| Entradas | 13 (`in_dim: 13`), con 12 variables documentadas: `base_width_mm`, `base_depth_mm`, `base_thickness_mm`, `n_fins`, `fin_thickness_mm`, `fin_height_mm`, `k_w_mk`, `source_width_mm`, `source_depth_mm`, `t_ambient_c`, `air_velocity_m_s`, `power_w` |
| Salidas | 3: `r_base_k_w` (K/W), `pressure_drop_pa` (Pa), `r_base_upper95_k_w` (K/W) |
| Dataset de entrenamiento | `PINNeAPPle-Labs/heatsink-forced-convection` (6.000 resoluciones del motor) |
| Descargas / likes (HF) | 107 / 1 |
| Fecha de creación / actualización | 2026-10-13 / 2026-10-18 |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa convencional: 13 variables de entrada normalizadas en escala logarítmica, cuatro capas ocultas de 128 neuronas con SiLU y dos salidas que predicen el logaritmo de la resistencia térmica y el logaritmo de la caída de presión. La tercera salida de la tarjeta (cota superior del 95 %) no es una cabeza adicional de la red, sino un intervalo split-conformal calibrado sobre las predicciones, con cobertura empírica del 95,78 % en el conjunto de test. El modelo no incorpora atención, estado recurrente ni componentes híbridos; su coste computacional es despreciable.

El entrenamiento se basa en 6.000 diseños resueltos por el motor HeatSink Sizer (`pinneapple_design.thermal.heatsink.engine`), muestreados sobre geometría, material y condiciones de operación en escala logarítmica. El motor combina tres componentes físicos: la correlación de Nusselt de placas paralelas compuestas de Teertstra et al. (2000), conducción 3D por volúmenes finitos en la base para capturar la resistencia de spreading y un modelo de pérdida de carga que suma fricción de flujo en desarrollo más pérdidas de entrada y salida. La validación se realizó sobre 900 diseños retenidos, con error absoluto medio del 0,71 % en R (p95 2,09 %, máximo 5,88 %) y del 1,04 % en dP (p95 2,70 %, máximo 10,00 %). No se documenta RLHF, DPO ni ajuste por preferencias, algo carente de sentido en este dominio.

Como control de calidad física, la tarjeta reporta una validación con 22 de 22 comprobaciones aplicables superadas, incluida la monotonía (más caudal de aire nunca aumenta la resistencia) y la reproducibilidad de las métricas de la tarjeta sobre la referencia almacenada. Los factores de credibilidad asignan nivel 3 a la verificación de solución, nivel 4 a la validación y a la pedigrí de entradas, nivel 2 a incertidumbre, y nivel 0 (sin evidencia) a verificación de código, robustez y aplicabilidad.

## Capacidades

- Regresión numérica multivariable: predice resistencia térmica base-aire (K/W) y caída de presión (Pa) a partir de 13 entradas geométricas, de material y de operación.
- Cuantificación de incertidumbre: devuelve una cota superior conformal al 95 % sobre la resistencia térmica, utilizable como margen de diseño.
- Chequeos de física integrados en la demo: advertencias cuando las predicciones violan monotonicidad o quedan fuera del rango de validez.
- Evaluación de resistencia de spreading: las entradas incluyen el footprint de la fuente de calor (`source_width_mm`, `source_depth_mm`), por lo que el modelo captura el efecto de una fuente menor que la base.
- Inferencia en navegador: exportación ONNX y demo en Hugging Face Spaces que evalúa entradas propias del usuario sin instalación.
- Barrido paramétrico de alta frecuencia: al tener 51.586 parámetros, permite evaluar miles de geometrías por segundo en CPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas simbólicas, visión ni audio.
- No tiene capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Dimensionado exploratorio de disipadores en fase de concepto: el ingeniero barre anchos de base de 30 a 200 mm, alturas de aleta de 8 a 80 mm y caudales de 0,5 a 6 m/s y obtiene en segundos el mapa de resistencia térmica y caída de presión, algo que con CFD requeriría horas por diseño.
- Optimización geométrica automatizada: al evaluar una geometría en microsegundos, el modelo se puede usar como función objetivo dentro de bucles de optimización bayesiana o algoritmos genéticos que ajusten número de aletas, espesor y altura para minimizar R sujeto a un límite de dP.
- Selección de ventilador y punto de operación: el par (caudal, caída de presión) predicho se cruza con la curva del ventilador para elegir el modelo que mantiene el caudal dentro del rango de 0,5 a 6 m/s sin sobredimensionar el sistema acústico.
- Estimación de margen térmico con cota conservadora: usar `r_base_upper95_k_w` como valor de diseño permite dimensionar la unión con una cobertura nominal del 95 %, reduciendo el riesgo de fallo por infrapredicción en la fase de screening.
- Integración en herramientas de diseño electrónico: el modelo ONNX se puede embeber en un plugin o calculadora web interna que devuelva R y dP a partir de los parámetros del disipador y de la potencia del componente (10-400 W), sin depender de un solver externo.
- Precribado previo a simulación CFD: filtrar el 90-95 % de candidatos que quedan lejos del objetivo y reservar el CFD y la verificación experimental para los pocos diseños que pasan el corte, reduciendo coste computacional y de licencias.
- Docencia y verificación cruzada de correlaciones: comparar la predicción del subrogado con la correlación analítica de Teertstra para detectar discrepancias en regímenes límite (aletas muy juntas, caudales bajos) y entender la contribución del spreading.
- Análisis de sensibilidad y estudios de tolerancia: al ser determinista y barato, permite propagar tolerancias de fabricación (espesor de aleta ±0,1 mm, altura ±0,5 mm) mediante Monte Carlo con decenas de miles de muestras.

## Benchmarks y rendimiento

Validación sobre 900 diseños retenidos, resueltos por el motor HeatSink Sizer (referencia interna, no medidas experimentales):

| Metrica | Valor |
|---|---|
| test/R_mean_abs_pct | 0,712 % |
| test/R_p95_abs_pct | 2,086 % |
| test/R_max_abs_pct | 5,880 % |
| test/dP_mean_abs_pct | 1,041 % |
| test/dP_p95_abs_pct | 2,696 % |
| test/dP_max_abs_pct | 10,004 % |
| test/R_upper95_coverage_pct | 95,778 % |
| test/n | 900 |

Validación física (`pp.validate`, PINNeAPPle 0.7.0, esquema `validation-report/v1`, nivel `standard`): 22 de 22 comprobaciones aplicables superadas. Decisión de confianza: APPROVED, score 1,00, cobertura 100 %. Verificación del motor de referencia frente a métodos independientes: spreading de Lee et al. (1-5 %), Nu de flujo en desarrollo de Stephan + e-NTU (0-5 %), fricción totalmente desarrollada (2-4 %), convergencia de malla FVM < 2 %.

No se han publicado comparaciones con otros modelos subrogados de disipadores en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión; con 51.586 parámetros el peso en FP32 ronda los 0,2 MB, por lo que el modelo cabe en caché L2 de cualquier CPU moderna.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (GTX 1650, RTX 3050, RTX 4090) o acelerador integrado es sobradamente suficiente; A100/H100 solo tendrían sentido para lotes masivos.
- Cabe en consumer GPU: sí, en todas, y también en CPU, Raspberry Pi o incluso en el navegador vía ONNX Runtime Web.
- Opciones de despliegue: PyTorch, ONNX Runtime (recomendado para producción y para integración web), librería `pinneapple` del autor, Hugging Face Spaces. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo generativo de texto.
- Latencia y throughput: no se publican cifras. Por el tamaño (51.586 parámetros, 4x128), la inferencia en CPU es del orden de microsegundos por muestra y permite decenas de miles de evaluaciones por segundo en un solo hilo; el cuello de botella real es el preprocesado de las 13 variables de entrada, no la red.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos subrogados de disipadores con especificaciones publicadas. La única referencia cuantitativa documentada es el motor físico del que se generó el dataset:

| Alternativa | Parametros | Contexto | Error frente a referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `heatsink_forced_mlp` (este modelo) | 51.586 | no aplica | R: 0,71 % medio / 5,88 % máx; dP: 1,04 % medio / 10,00 % máx (frente al motor) | Apache 2.0 | Hugging Face, ONNX, demo |
| HeatSink Sizer (motor de referencia) | no aplica (solver) | no aplica | referencia; validado frente a Lee et al. (1-5 %), Stephan + e-NTU (0-5 %), fricción (2-4 %) | no disponible en la información | interno a PINNeAPPle |
| CFD 3D de convección forzada | no aplica | no aplica | no disponible | no aplica | comercial |
| Otros subrogados de disipadores | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Régimen restringido a flujo canalizado (ducted, sin bypass): en disipadores reales con bypass se pierde entre el 20 % y el 50 % del caudal, por lo que hay que corregir la velocidad antes de usar el modelo.
- El error reportado (<1 % medio) es frente al motor físico, no frente a medidas experimentales. Las correlaciones de convección subyacentes tienen una precisión típica de ±15 %, que domina el error real.
- Herramienta de cribado: la propia tarjeta recomienda reverificar el diseño elegido con el motor de física antes de fabricar.
- Rangos de validez estrictos, fuera de los cuales la predicción no está garantizada: `base_width_mm` 30-200, `base_depth_mm` 30-200, `base_thickness_mm` 2-15, `fin_thickness_mm` 0,6-4,0, `fin_height_mm` 8-80, `k_w_mk` 150-400, `source_frac_w` 0,15-1,0, `source_frac_d` 0,15-1,0, `t_ambient_c` 0-50, `air_velocity_m_s` 0,5-6,0, `power_w` 10-400.
- Discrepancia de espaciado entre aletas: el hueco se muestreó en 0,8-10 mm pero los diseños realizados abarcan 0,56-12,2 mm tras redondear el número de aletas; extrapolar a huecos muy pequeños o muy grandes queda fuera de la envolvente de entrenamiento.
- Ambigüedad de dimensionalidad: la arquitectura declara 13 entradas pero la tarjeta documenta 12; la variable adicional no se identifica explícitamente (posiblemente el hueco entre aletas, `fin_gap_mm`, que aparece en el rango de validez). Conviene verificar el orden y el número exacto de features antes de integrar el ONNX.
- Factores de credibilidad sin evidencia: verificación de código, robustez y aplicabilidad puntúan 0 en el informe de validación; no se han publicado pruebas de robustez frente a entradas fuera de distribución o ruido.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales, pero tampoco garantías de idoneidad para uso crítico.
- Sin soporte lingüístico ni generativo: cualquier expectativa de uso como modelo de texto, código o agentes es inaplicable.
- Baja tracción comunitaria (107 descargas, 1 like): revisión por pares limitada y una única versión publicada (`v1.0.0`, revisión `v1.0.0.post1`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PINNeAPPle-Labs/heatsink-forced-mlp
- Dataset de entrenamiento: https://huggingface.co/datasets/PINNeAPPle-Labs/heatsink-forced-convection
- Demo interactiva del zoo (sin instalación): https://huggingface.co/spaces/PINNeAPPle-Labs/zoo-demo
- Repositorio PINNeAPPle: https://github.com/PINNeAPPle-Labs/PINNeAPPle
- Referencia física citada: Teertstra, Yovanovich & Culham (2000), correlación de Nusselt para placas paralelas compuestas (sin enlace directo en la información disponible)
- Cita: PINNeAPPle contributors (2026). HeatSink Sizer forced-convection surrogate. PINNeAPPle model zoo, https://github.com/PINNeAPPle-Labs/PINNeAPPle
