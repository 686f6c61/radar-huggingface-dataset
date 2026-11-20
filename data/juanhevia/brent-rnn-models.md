# juanhevia/brent-rnn-models

## Resumen

`juanhevia/brent-rnn-models` es un paquete de pesos de PyTorch que contiene nueve redes neuronales recurrentes entrenadas para predecir el precio spot del petróleo Brent a tres horizontes temporales: 5, 63 y 252 días hábiles. Lo desarrolla Juan Hevia Losa como caso práctico individual de aprendizaje automático, y no es un modelo de lenguaje ni un Transformer: son regresores univariantes de series temporales que consumen una ventana de 60 precios escalados y devuelven una única predicción escalada.

El repositorio incluye tres arquitecturas (RNN simple, LSTM y GRU) para cada horizonte, con dos tamaños ocultos explorados (16 y 32), lo que suma las nueve redes publicadas. La selección final para la aplicación asociada fue RNN a 5 días, LSTM a 63 días y RNN a 252 días, fijada antes de consultar el bloque de prueba. Cada peso va acompañado de un JSON con arquitectura, escalador, preparación y metadatos, y el módulo `models.py` permite reconstruir cada red.

Su relevancia es acotada y muy específica: sirve como referencia reproducible de un flujo completo de forecasting con redes recurrentes sobre una serie económica real, con partición temporal, búsqueda de hiperparámetros y evaluación honesta frente a una línea base de persistencia. El propio autor documenta que los modelos seleccionados empeoran el RMSE de persistencia en prueba entre un 2,04 % y un 3,33 %, lo que conviene tener presente antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN simple, LSTM y GRU (una capa recurrente, tamaños ocultos 16 y 32) |
| Parametros totales | no disponible (redes de tamaño oculto 16/32 sobre entrada de 60 pasos y salida escalar; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana fija de 60 observaciones de entrada; horizontes de predicción de 5, 63 y 252 días hábiles |
| Tipos de cuantizacion | no disponible (pesos en coma flotante estándar de PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | es (metadatos y documentación en español; el modelo no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | `state_dict` de PyTorch (`.pt`), con JSON de metadatos asociado por cada red; `sha256.json` con huellas de integridad |

## Arquitectura y entrenamiento

Cada red es un regresor recurrente univariante: recibe un tensor de forma `[lote, 60, 1]` con precios escalados y produce una predicción escalada del precio a un horizonte dado. El paquete cubre las tres celdas recurrentes clásicas (RNN, LSTM, GRU) con dos tamaños ocultos (16 y 32), lo que da 6 configuraciones por horizonte y 18 en total antes de la selección; el autor reporta 54 ajustes de búsqueda y 9 modelos principales publicados. La reconstrucción se hace con `load_regressor` de `models.py`, cargando pesos con `weights_only=True`.

Los datos provienen de la serie Brent spot de la EIA distribuida vía FRED (identificador DCOILBRENTEU), con copia de 2000 a noviembre de 2026 y 6.501 precios observados. El preprocesado aplica un retraso de publicación supuesto de tres días, relleno causal de hasta cinco días y escalado ajustado únicamente con el bloque de entrenamiento. El protocolo usa tres folds temporales, hasta 40 épocas y una única semilla (42). El entrenamiento se ejecutó con PyTorch 2.10.0 sobre ROCm 7.1, y la inferencia en CPU se verificó también con PyTorch 2.2.2.

## Capacidades

- Predicción puntual del precio spot del Brent a 5, 63 y 252 días hábiles a partir de una ventana de 60 precios previos.
- Modelado de dependencias temporales de corto y largo plazo mediante celdas RNN, LSTM y GRU, lo que permite comparar el comportamiento de las tres familias sobre la misma serie.
- Inferencia en CPU con un coste computacional mínimo, apta para entornos sin GPU.
- Carga determinista y verificable: `sha256.json` registra las huellas de los archivos y los pesos se cargan con `weights_only=True`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multimodales (ni visión, ni audio) ni modo de razonamiento explícito.
- No procesa lenguaje natural: la etiqueta de idioma `es` de los metadatos se refiere a la documentación, no a una capacidad multilingüe del modelo.

## Casos de uso

- Monitorización de precios del Brent en un panel interno: alimentar la red RNN a 5 días con los últimos 60 precios escalados y mostrar la predicción junto con el intervalo basado en los percentiles 10/90 de residuos de validación, tal como hace la aplicación del autor.
- Estudio académico de forecasting con redes recurrentes: usar las nueve redes como referencia reproducible para comparar RNN, LSTM y GRU sobre una serie económica real con partición temporal y línea base de persistencia.
- Docencia de series temporales: ilustrar el efecto del horizonte de predicción, ya que a 252 días las predicciones son casi constantes y el modelo se degrada frente a la persistencia.
- Análisis de sensibilidad al tamaño oculto: comparar las variantes de 16 y 32 unidades para estudiar el compromiso entre capacidad y sobreajuste en series cortas (6.501 observaciones).
- Integración en pipelines de validación: reutilizar `models.py` y los JSON de metadatos para reconstruir cada red y verificar la integridad de los pesos mediante `sha256.json` antes de desplegar.
- Evaluación crítica de intervalos de predicción: emplear los residuos de validación documentados para estudiar la calibración de rangos empíricos, sabiendo que el autor advierte que no garantizan cobertura futura.
- Prototipado de bajo coste en CPU: desplegar la inferencia en un servicio ligero sin GPU, dado que las redes son de tamaño oculto 16/32 y la inferencia en CPU está verificada.

## Benchmarks y rendimiento

El autor publica `metrics_test.csv` y `metrics_validation.csv` con RMSE para las tres redes y la persistencia en cada horizonte, pero no se incluyen los valores numéricos en la información disponible. Los datos cualitativos reportados son:

| Modelo / comparacion | Resultado reportado |
|---|---|
| RNN a 5 dias (seleccionado) | empeora el RMSE de persistencia en prueba un 3,33 % |
| LSTM a 63 dias (seleccionado) | empeora el RMSE de persistencia en prueba un 2,04 % |
| RNN a 252 dias (seleccionado) | empeora el RMSE de persistencia en prueba un 2,42 % |
| GRU | menor RMSE entre redes en prueba, pero no se reelege usando ese bloque |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño oculto (16/32) y la ventana de 60 pasos, el consumo es del orden de kilobytes a pocos megabytes, muy por debajo de cualquier GPU consumer.
- GPU recomendadas: no se requiere GPU; el autor verificó la inferencia en CPU con PyTorch 2.2.2. Cualquier GPU compatible con PyTorch (A100, H100, RTX 4090, etc.) puede ejecutarlo, pero no aporta ventaja práctica.
- Cabe en cualquier GPU consumer y en CPU convencional; el entrenamiento se realizó con PyTorch 2.10.0 sobre ROCm 7.1.
- Opciones de despliegue: carga directa con PyTorch mediante `models.py` y `load_regressor`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `juanhevia/brent-rnn-models` | RNN/LSTM/GRU univariante para Brent | no disponible (oculto 16/32) | ventana de 60 pasos | empeora persistencia un 2,04-3,33 % en prueba | no disponible | Hugging Face, 0 descargas |
| Persistencia (linea base del autor) | naive forecast | 0 | no aplica | referencia frente a la que pierden los tres modelos seleccionados | no aplica | incluida en las metricas del repo |
| Otros modelos de forecasting de petroleo | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Los tres modelos seleccionados empeoran el RMSE de persistencia en el bloque de prueba (3,33 %, 2,04 % y 2,42 %), por lo que no superan a una línea base trivial.
- A 252 días las predicciones son casi constantes y el modelo no anticipa adecuadamente los cambios abruptos de precio.
- Los rangos de la aplicación se basan en los percentiles 10/90 de los residuos de validación, bloque que también se usó para selección y parada temprana; no garantizan cobertura futura.
- No hay prueba de rentabilidad ni de significación estadística de las predicciones.
- Las variables externas exigidas por el enunciado del caso práctico siguen pendientes, de modo que el modelo es estrictamente univariante.
- La copia revisada de FRED no reconstruye la información histórica en tiempo real, lo que introduce un sesgo de disponibilidad retrospectiva.
- Licencia no especificada: no hay autorización explícita para uso comercial ni condiciones de redistribución.
- El repositorio tiene 0 descargas y 0 likes, sin revisión externa; su valor es fundamentalmente didáctico y de reproducibilidad.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto ni usarse para tareas de generación, razonamiento o agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juanhevia/brent-rnn-models
- Aplicación (Space): https://huggingface.co/spaces/juanhevia/brent-observatorio
- Repositorio de reproducción: https://github.com/juanhevia/serieseconomy
- Serie de referencia (EIA vía FRED, DCOILBRENTEU): https://fred.stlouisfed.org/series/DCOILBRENTEU
