# ogerl/tpf-erstmodell-v1

## Resumen

TPF Erstmodell v1.0 (m4-v1.0) es un modelo de regresión por cuantiles orientado a series temporales financieras, desarrollado por el autor ogerl dentro del proyecto de investigación "Moving Averages als Tiefpassfilter verschiedener Ordnung" (medias móviles como filtros paso bajo de distinto orden). No es un modelo de lenguaje: es un conjunto de estimadores de gradient boosting (clase `HistGradientBoostingRegressor` de scikit-learn) que predicen cuantiles calibrados del recorrido restante y de la duración restante hasta el siguiente punto de inflexión significativo en la escala de 12 horas sobre el par BTCUSDT.

El modelo se alimenta de un vector de estado multifractal de 391 características construido a partir de medias móviles en 9 marcos temporales, más tres edades de cruce causales en 12 horas. Predice el cuantil p50 del recorrido restante (normalizado por dirección) y el cuantil p50 de la duración restante en minutos. Incluye además una línea base de 4 características (M0) que sirve como referencia documentada del gain obtenido por el modelo completo (M1).

Es relevante ahora como ejemplo de modelo de investigación reproducible y congelado por SHA, con artefactos firmados, self-tests de integridad y una disciplina explícita de evaluación out-of-sample. El propio autor advierte que es un modelo de investigación, no una señal de trading, y que los efectos medidos in-sample se atenúan notablemente fuera de muestra.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting por cuantiles (`HistGradientBoostingRegressor`, loss='quantile') |
| Parámetros totales | no disponible (no aplica; modelo de árboles, no red neuronal) |
| Parámetros activos | no aplica |
| Longitud de contexto | no aplica (entrada de 391 características por muestra; 4 en la línea base M0) |
| Tipos de cuantización | no disponible (no se documenta cuantización; exportación a ONNX) |
| Idiomas soportados | de, en (documentación y model card) |
| Licencia | MIT |
| Formato de pesos | joblib y ONNX |
| Hiperparámetros | max_iter 100, max_leaf_nodes 31, max_bins 255, seed 42 |
| Features de entrada | 391 (M1) / 4 (M0) |
| Target | cuantil p50 de recorrido restante y duración restante (minutos) |
| Ventana de entrenamiento | 2018-03-04 a 2025-01-01 (UTC), selección in-sample |
| Tamaño del repo | 0.0 GB |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura de red neuronal sino un ensamblado de árboles de decisión con boosting por gradiente, concretamente `HistGradientBoostingRegressor` con pérdida de cuantiles (`loss='quantile'`, `quantile=0.5`). Se entrenan cuatro variantes: `m4_m1_amp_q50` y `m4_m1_dur_q50` sobre las 391 características del vector de estado multifractal (columnas S_total con d_k, C, v_k, a_k y Δ_j,k sobre 9 marcos temporales, más tres edades de cruce causales 12h para los pares 2-20, 5-20 y 9-50), y `m4_m0_{amp,dur}_q50` sobre 4 características de línea base causal (D-53). El orden exacto de las características está fijado en `m4_features.json`.

El entrenamiento se realizó sobre la ventana de selección 2018-03-04 a 2025-01-01 (UTC) con la disciplina D-21 de no entrenar sobre out-of-sample. Los resultados reportados in-sample son un gain de amplitud de +0.02795 y un gain de duración de +2703.64, con Pinball M1 de 0.01365 y 1631.56 respectivamente, y p empírico de 0.000 en los cuatro objetivos nulos (block-bootstrap 0/20, GARCH 0/10). El congelado incluyó 11 self-tests, entre ellos identidad de valores (Δ = 0.00e+00), roundtrip joblib, roundtrip ONNX con error máximo de 1,3·10⁻⁷ y determinismo de refit. Los datos de entrenamiento proceden del dataset `ogerl/tpf-trainingsdaten-v1` (freeze v1.0, `af72229d…`, 70 artefactos firmados por SHA) y el commit de generación es `860f6346`.

## Capacidades

- Predicción del cuantil p50 del recorrido restante (amplitud normalizada por dirección) hasta el siguiente punto de inflexión en escala de 12 horas.
- Predicción del cuantil p50 de la duración restante en minutos hasta dicho punto de inflexión.
- Estimación de cuantiles calibrados mediante regresión por cuantiles sobre gradient boosting.
- Procesamiento de un vector de estado multifractal de 391 características derivado de medias móviles en 9 marcos temporales.
- Inferencia en Python vía joblib y vía ONNX Runtime (incluido onnxruntime-web en navegador).
- CLI de inferencia mediante `infer_m4.py` con soporte `--onnx`.
- Línea base causal M0 de 4 características para comparación de gain.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües de generación; no es un modelo generativo.

## Casos de uso

- Investigación cuantitativa sobre puntos de inflexión en BTCUSDT: el modelo permite estimar distribuciones condicionales de recorrido y duración restantes a partir del estado de medias móviles, útil para estudiar la estructura temporal del precio sin asumir una señal direccional.
- Reproducción de experimentos académicos: al estar congelado por SHA con artefactos firmados y self-tests, sirve como referencia reproducible para validar técnicas de filtrado paso bajo aplicadas a series financieras.
- Evaluación de líneas base causales: la variante M0 de 4 características permite cuantificar el gain atribuible al vector de estado completo frente a una referencia simple, útil en estudios de ablación.
- Despliegue ligero en navegador: la exportación a ONNX y el soporte de onnxruntime-web facilitan demos interactivas (como el espacio TPF Zustands-Explorer) sin infraestructura de servidor pesada.
- Integración en pipelines de análisis de series temporales con scikit-learn: el modelo puede cargarse con joblib y combinarse con features existentes en un flujo de trabajo Python estándar.
- Estudio de calibración de cuantiles en finanzas: el uso de pérdida de cuantiles permite analizar la fiabilidad de las predicciones p50 en distintos regímenes de mercado.
- Docencia y formación en metodología de validación out-of-sample: la disciplina D-21 y el registro previo de evaluaciones OOS constituyen un caso práctico de buenas prácticas de evaluación.

## Benchmarks y rendimiento

Los únicos resultados publicados son métricas internas de selección (in-sample) reportadas por el autor:

| Métrica | M1 (391 features) | M0 (4 features, línea base) | Gain |
|---|---|---|---|
| Pinball amplitud | 0.01365 | no disponible | +0.02795 |
| Pinball duración | 1631.56 | no disponible | +2703.64 |
| p empírico (block-bootstrap) | 0.000 (0/20) | — | — |
| p empírico (GARCH) | 0.000 (0/10) | — | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje. El autor advierte que los efectos out-of-sample de las comparaciones son del 30-38 % del valor in-sample, con una sobreestimación in-sample de aproximadamente 3×.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el modelo son árboles de decisión serializados, no requiere GPU para funcionar.
- GPU recomendadas: no necesarias; la inferencia puede ejecutarse en CPU. Cualquier GPU compatible con ONNX Runtime puede acelerar el cómputo si se desea.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (CPU, navegador vía onnxruntime-web).
- Opciones de despliegue: Python con joblib, ONNX Runtime (incluido onnxruntime-web), CLI `infer_m4.py`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por la naturaleza del modelo (100 iteraciones, 31 hojas) se espera latencia de milisegundos por muestra en CPU, aunque este dato no está confirmado por el autor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un modelo de investigación específico de un proyecto (AAMS, monorepo BTC-MA-SPEC-FUTURE) sin alternativas documentadas en la model card ni en los metadatos de Hugging Face.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TPF Erstmodell v1.0 | no aplica (árboles) | no aplica (391 features) | Pinball amp 0.01365 / dur 1631.56 (in-sample) | MIT | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación: el autor declara explícitamente que no es una señal de trading ni asesoramiento financiero.
- No hay evidencia de ventaja direccional demostrada; el modelo entrega cuantiles de estado, no recomendaciones.
- Los efectos in-sample se atenúan al 30-38 % out-of-sample, con sobreestimación in-sample de aproximadamente 3×.
- La ventana OOS 2025/26 está consumida en el proyecto; la evaluación final depende del live-shadow-run OOS 2027. Cualquier evaluación OOS adicional constituye un test que debe registrarse previamente y contabilizarse (D-21).
- Riesgo de sobreajuste derivado del uso de una única ventana de selección y de la ausencia de entrenamiento OOS.
- Sesgos conocidos: no documentados en la información disponible; al operar solo sobre BTCUSDT, el modelo está sesgado hacia el comportamiento de ese activo y periodo.
- Limitaciones de idioma: la documentación está en alemán e inglés; no hay soporte multilingüe más allá de eso.
- Licencia MIT: permite uso comercial, pero el autor desaconseja explícitamente su uso como base para decisiones de inversión.
- El repo tiene 0 descargas y 0 likes; no hay validación externa por parte de la comunidad.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ogerl/tpf-erstmodell-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/ogerl/tpf-trainingsdaten-v1
- Demo (Space): https://huggingface.co/spaces/ogerl/tpf-zustands-explorer
