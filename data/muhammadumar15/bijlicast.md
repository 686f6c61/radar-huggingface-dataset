# muhammadumar15/BijliCast

## Resumen

BijliCast es un sistema de previsión de consumo eléctrico residencial desarrollado por muhammadumar15 para el contexto de Pakistán. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un estimador de regresión supervisada basado en `HistGradientBoostingRegressor` de scikit-learn, serializado como artefacto joblib de aproximadamente 1,4 MB. Predice la variable `next_hour_energy_kwh`, es decir, el consumo energético de la próxima hora a partir de 42 características de entrada que combinan historial de consumo, meteorología, calendario y características del hogar.

El modelo se entrena sobre una integración de dos fuentes públicas: el dataset de hogares LUMS REWD-P y los datos meteorológicos históricos ERA5 de Open-Meteo, alineados temporal y geográficamente. El corpus resultante cubre 59 hogares en seis ciudades paquistaníes con 515.786 registros horarios de electricidad. La selección del estimador final se hizo por criterio de eficiencia de despliegue: Random Forest obtuvo una MAE de validación de 0,3216 kWh frente a 0,3273 kWh de HistGradientBoosting, pero este último ocupa 1,4 MB frente a los 270 MB del primero.

Su relevancia es acotada y específica: sirve como demostración educativa y de investigación de un ciclo completo de machine learning tabular para series temporales (EDA, ingeniería de características, validación cronológica, `TimeSeriesSplit`, optimización de hiperparámetros y evaluación en test retenido), no como componente de producción para facturación o decisiones operativas de red.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `HistGradientBoostingRegressor` (scikit-learn, gradient boosting sobre árboles de decisión) |
| Parámetros totales | no disponible (modelo de árboles; el artefacto serializado ocupa ~1,4 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 42 características; ventana temporal definida por lags y estadísticos móviles) |
| Tipos de cuantización | no aplica (joblib; no se distribuyen pesos en GGUF ni safetensors) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | `deployment_model.joblib` (pipeline de preprocesado + estimador entrenado) |

## Arquitectura y entrenamiento

El modelo es un gradient boosting sobre árboles con la implementación `HistGradientBoostingRegressor` de scikit-learn, que usa histogramas de características para acelerar el entrenamiento y reducir memoria. El artefacto guardado incluye el pipeline de preprocesado ajustado junto con el estimador, de modo que la inferencia recibe las 42 características en crudo y aplica la misma transformación usada en entrenamiento.

El entrenamiento parte de 515.786 registros horarios de 59 hogares en seis ciudades de Pakistán, enriquecidos con meteorología ERA5 de Open-Meteo mediante alineamiento temporal y geográfico. El ciclo incluyó análisis exploratorio, tratamiento de valores ausentes, ingeniería de características con retardos (lags) y estadísticos móviles, partición cronológica train/validación/test, comparación con líneas base, evaluación de varios algoritmos de regresión, validación cruzada con `TimeSeriesSplit` de cinco pliegues y optimización aleatoria de hiperparámetros. El pipeline final se ajustó con train y validación; el conjunto de test se mantuvo aparte tanto del ajuste como de la selección del modelo. La selección entre Random Forest y HistGradientBoosting se resolvió por tamaño del artefacto ante calidad predictiva prácticamente equivalente.

## Capacidades

- Predicción del consumo eléctrico residencial de la próxima hora (`next_hour_energy_kwh`) a partir de historial, meteorología, calendario y características del hogar.
- Regresión tabular sobre series temporales con 42 características de entrada.
- Gestión de valores ausentes integrada en el pipeline de preprocesado.
- Intervalos de predicción al 90 % mediante desplazamientos basados en residuos estimados sobre predicciones de validación fuera de muestra.
- Reproducibilidad del pipeline completo: el artefacto incluye preprocesado y estimador en un único fichero joblib.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, ni capacidades multilingües, de visión o de audio, por su naturaleza de modelo tabular.

## Casos de uso

- Investigación académica sobre previsión de carga residencial: el modelo y su cuaderno de metodología sirven como referencia reproducible de un flujo completo de ML tabular para series temporales, con partición cronológica y `TimeSeriesSplit`.
- Análisis de consumo por hogar: permite estimar la demanda de la próxima hora para un hogar concreto dadas sus características y la meteorología, útil en estudios de caracterización de demanda.
- Docencia de machine learning: el contraste documentado entre Random Forest (270 MB, MAE 0,3216 kWh) y HistGradientBoosting (1,4 MB, MAE 0,3273 kWh) es un ejemplo concreto de compromiso entre rendimiento y coste de despliegue.
- Demostración de despliegue ligero: al ocupar ~1,4 MB, el artefacto joblib puede servirse desde un repositorio de GitHub o un contenedor mínimo sin infraestructura GPU, lo que facilita demos y pruebas de concepto.
- Exploración de intervalos de predicción: el intervalo al 90 % basado en residuos permite ilustrar la incertidumbre de la previsión en análisis de sensibilidad o en ejercicios de comunicación de riesgo.
- Integración con datos meteorológicos: el pipeline muestra cómo alinear series de consumo con ERA5/Open-Meteo por tiempo y geografía, patrón reutilizable en otros proyectos de previsión energética.
- Replay histórico para validación de hipótesis: la demo reproduce datos históricos en lugar de leer contadores en vivo, lo que permite evaluar el sistema sin acceso a telemetría real.

## Benchmarks y rendimiento

Resultados en el conjunto de test retenido, según la model card:

| Métrica | Resultado |
|---|---:|
| MAE | 0,2499 kWh |
| RMSE | 0,4273 kWh |
| R² | 0,7291 |

Comparación interna durante la selección (MAE de validación):

| Modelo | MAE validación | Tamaño del artefacto |
|---|---:|---:|
| Random Forest | 0,3216 kWh | ~270 MB |
| HistGradientBoosting | 0,3273 kWh | ~1,4 MB |

No se han publicado resultados comparativos con otros modelos externos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el artefacto de ~1,4 MB se ejecuta con scikit-learn en CPU sin requisitos de GPU.
- VRAM estimada: 0 GB (no requiere GPU).
- GPU recomendadas: no aplica; no se requiere aceleración por hardware.
- Cabe en cualquier equipo consumer: portátil, contenedor pequeño o función serverless con memoria mínima.
- Opciones de despliegue: carga directa con `joblib.load` en Python, servicio HTTP ligero (Flask, FastAPI) o ejecución dentro de un notebook; no aplican vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del estimador y el tamaño del artefacto, la inferencia es de milisegundos por petición en CPU, aunque no se ha publicado una medición.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto / entrada | Rendimiento | Licencia |
|---|---|---|---|---|---|
| BijliCast (HistGradientBoosting) | Regresión tabular | ~1,4 MB | 42 características | MAE test 0,2499 kWh; R² 0,7291 | no disponible |
| BijliCast (Random Forest, descartado) | Regresión tabular | ~270 MB | 42 características | MAE validación 0,3216 kWh | no disponible |
| Alternativas externas de previsión de carga | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- Cobertura reducida: solo 59 hogares y seis ciudades de Pakistán; la generalización fuera de ese ámbito geográfico y de ese parque de hogares no está validada.
- La demo usa reproducción de datos históricos, no lecturas en vivo de contadores inteligentes, por lo que no refleja condiciones operativas reales.
- El autor declara explícitamente que el modelo no está destinado a facturación eléctrica ni a decisiones operativas de red.
- Riesgo de degradación ante cambios de régimen de consumo o meteorología no representados en el periodo histórico de entrenamiento.
- Los intervalos de predicción al 90 % se basan en residuos de validación fuera de muestra; su calibración puede no mantenerse en datos futuros.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución del artefacto.
- Sesgos potenciales derivados de la composición del dataset (hogares y ciudades concretos) no documentados por el autor.
- No apto para tareas de lenguaje, visión, audio, agentes ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muhammadumar15/BijliCast
- Repositorio de código, cuadernos, informes y despliegue: https://github.com/muhammad-umar-218980/BijliCast
- Dataset LUMS REWD-P: https://rewdp.lums.edu.pk/
- Open-Meteo (datos meteorológicos ERA5): https://open-meteo.com/
