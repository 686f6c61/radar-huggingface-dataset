# At1uri/conformal-prediction-vault

## Resumen

`conformal-prediction-vault` no es un modelo de lenguaje, sino un repositorio de investigación publicado en Hugging Face por Ramprasad Atluri (`At1uri`) que reúne implementaciones de referencia de predicción conformal y cuantificación de incertidumbre libre de distribución (distribution-free UQ). El vault contiene rutinas de calibración de no conformidad, regresión cuantílica conformalizada (CQR) y solvers de predicción conformal ponderada bajo cambio de covarianza (covariate shift), junto con una suite de validación de cobertura en muestras finitas por Monte Carlo.

El interés del artefacto es metodológico: proporciona código reproducible para obtener garantías de cobertura marginal en muestras finitas, es decir, intervalos de predicción que contienen la etiqueta verdadera con probabilidad al menos `1 - α` bajo el supuesto de intercambiabilidad. Incluye además un `MANIFEST.json` con hashes SHA-256 para verificar la integridad de los ficheros, lo que facilita su uso como material docente o como base para experimentos de incertidumbre en pipelines de machine learning.

No se trata, por tanto, de un modelo entrenado con pesos publicados: no hay arquitectura neuronal, parámetros, tokenizador ni ventana de contexto. La ficha que sigue documenta el contenido del repositorio con la misma estructura que una ficha de modelo, indicando "no disponible" en todos los campos que no aplican o no están especificados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: repositorio de algoritmos de predicción conformal (no es un modelo neuronal) |
| Parametros totales | No disponible (no hay pesos de modelo) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (código Python fuente y `MANIFEST.json` con hashes SHA-256) |

## Arquitectura y entrenamiento

El vault no entrena ningún modelo. Su contenido son tres módulos de código Python que implementan estimadores conformales sobre un predictor base que el usuario debe aportar: `src/split_conformal.py` (predicción conformal por split estándar con puntuaciones de residuo), `src/conformalized_quantile_regression.py` (CQR con puntuaciones de exceso con signo) y `src/weighted_conformal_shift.py` (predicción conformal ponderada bajo cambio de covarianza). La lógica se apoya en los teoremas documentados en el README: cobertura marginal en muestras finitas, puntuación de no conformidad CQR y pesos de verosimilitud entre distribución de test y de calibración.

La parte experimental es `benchmarks/eval_coverage_guarantees.py`, una suite de validación de cobertura por Monte Carlo en muestras finitas, invocable con `python benchmarks/eval_coverage_guarantees.py`. No se especifican en la información disponible el número de réplicas, los tamaños de muestra, el nivel `α` por defecto ni los datasets empleados. Tampoco se documentan detalles de entrenamiento (tokens, composición del corpus, RLHF/DPO), porque no aplican.

## Capacidades

- Cálculo de intervalos de predicción con garantía de cobertura marginal en muestras finitas mediante split conformal.
- Regresión cuantílica conformalizada (CQR) con puntuaciones de no conformidad basadas en exceso con signo, adecuada para intervalos adaptativos por instancia.
- Predicción conformal ponderada para escenarios de cambio de covarianza, con pesos `w(x) = p_test(x) / p_cal(x)`.
- Validación empírica de cobertura mediante simulación Monte Carlo en muestras finitas.
- Verificación de integridad criptográfica de los ficheros mediante `MANIFEST.json` (SHA-256).
- No incluye tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modo de pensamiento: no es un modelo generativo.

## Casos de uso

- Intervalos de confianza en modelos de regresión tabular: usar `split_conformal.py` sobre las predicciones de un modelo ya entrenado para obtener bandas con cobertura controlada a un nivel `α` elegido, útil en scoring de riesgo o previsión de demanda.
- Pronóstico con heterocedasticidad: `conformalized_quantile_regression.py` genera intervalos de anchura variable por instancia, apropiado para series temporales donde la incertidumbre depende del régimen.
- Despliegue con distribución distinta a la de entrenamiento: `weighted_conformal_shift.py` permite recalibrar la cobertura cuando los datos de producción no siguen la distribución de calibración, por ejemplo en scoring de crédito con deriva poblacional.
- Validación de cobertura antes de producción: ejecutar `benchmarks/eval_coverage_guarantees.py` como test de aceptación para verificar empíricamente que la cobertura observada se aproxima a `1 - α`.
- Material docente e investigación reproducible: el vault sirve como referencia para cursos de incertidumbre cuantificada, con teoremas y código verificable por hashes.
- Auditoría de integridad en pipelines regulados: el `MANIFEST.json` con SHA-256 permite comprobar que los ficheros de calibración no han sido alterados antes de ejecutarlos en un entorno de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye una suite de evaluación de cobertura (`eval_coverage_guarantees.py`), pero no se reportan en la model card cifras de cobertura empírica, tamaños de muestra ni comparaciones numéricas.

## Requisitos de hardware

- No requiere GPU: es código Python de propósito general, ejecutable en CPU.
- VRAM estimada: no disponible (no hay inferencia de red neuronal propia).
- GPU recomendadas: no aplica; el coste depende del predictor base que el usuario conecte a las rutinas conformales.
- Despliegue: ejecución directa con el intérprete de Python (`python benchmarks/eval_coverage_guarantees.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen del predictor base y del tamaño del conjunto de calibración.

## Comparativa con modelos similares

| Artefacto | Tipo | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|
| `At1uri/conformal-prediction-vault` | Repositorio de algoritmos conformales | MIT | Split conformal, CQR, conformal ponderado | Hugging Face, 0 descargas, 0 likes |
| MAPIE (scikit-learn-contrib) | Librería de predicción conformal | BSD-3-Clause | Split conformal, CQR, Jackknife+ | Paquete Python mantenido |
| Crepes | Librería de predicción conformal | MIT | Conformal y CQR sobre cualquier estimador | Paquete Python mantenido |
| TorchUQ | Librería de UQ en PyTorch | MIT | Métodos bayesianos y conformales | Repositorio en GitHub |

La comparación se limita a la categoría funcional, ya que en la información proporcionada no hay datos de rendimiento del vault que permitan contrastarlo numéricamente con estas alternativas.

## Limitaciones y advertencias

- No es un modelo entrenado: no puede usarse para generación de texto, código ni ninguna tarea predictiva por sí mismo; requiere un predictor base externo.
- Las garantías de cobertura son marginales y en muestras finitas bajo el supuesto de intercambiabilidad (o de cambio de covarianza correctamente modelado con pesos); no ofrecen cobertura condicional por instancia.
- La predicción conformal ponderada depende de estimar con precisión el cociente de densidades `p_test(x) / p_cal(x)`; una estimación deficiente invalida la garantía.
- No se documentan en la información disponible el tamaño de los experimentos, los datasets de validación ni los resultados de la suite de cobertura, por lo que la reproducibilidad empírica no está verificada más allá de la ejecución del script.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo día (2026-11-23), sin historial de mantenimiento.
- Licencia MIT: permite uso comercial y modificación, pero sin garantía alguna por parte del autor.
- No se especifican idiomas soportados ni sesgos conocidos porque no aplican a un repositorio de algoritmos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/At1uri/conformal-prediction-vault
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos del autor.
