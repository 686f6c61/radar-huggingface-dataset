# OlynkAI/piston-v0.1

## Resumen

Piston v0.1 es un modelo de inferencia causal para series temporales desarrollado por OlynkAI (OLynk), publicado bajo licencia Apache 2.0. No es un modelo de lenguaje: es un transformer axial de aproximadamente 4 millones de parámetros por miembro (12 millones en total, al ser un ensemble de tres semillas) entrenado exclusivamente sobre mundos sintéticos. Su función es responder preguntas contrafactuales del tipo "si en el paso *t* fijamos el tratamiento en *x1* en lugar de *x0*, cuánto cambia el objetivo *k* pasos después", devolviendo el efecto estimado con un intervalo del 90 %, la probabilidad de que los datos permitan responder la pregunta (`p_answerable`) y la probabilidad de que el tratamiento alcance el objetivo en ese lag.

La relevancia del modelo está en su enfoque de predicción selectiva aplicada a causalidad: en lugar de responder siempre, aprende a abstenerse cuando la evidencia disponible no identifica el efecto. Sobre un benchmark congelado de 4.592 preguntas en 998 mundos sintéticos de 23 familias no vistas en entrenamiento (32 % de ellas no respondibles), Piston reduce la métrica de riesgo-cobertura T1 un 27,6 % respecto al mejor baseline sin grafo causal y un 37,0 % cuando se combina con un algoritmo de identificación exacta. El repositorio ocupa 0,1 GB e incluye pesos, código de inferencia, benchmark y script de evaluación.

Se trata de una release de investigación con limitaciones explícitas: solo se ha evaluado sobre datos sintéticos del mismo generador que los de entrenamiento y no hay evaluación con datos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer axial (axial transformer), inferencia causal sobre paneles de series temporales |
| Parametros totales | 12 M (ensemble de 3 semillas de ~4 M cada una) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 9 variables y 128+ pasos temporales por panel |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, `seed0.pt`, `seed1.pt`, `seed2.pt`) |
| Idiomas soportados | no disponible (modelo no linguistico; entrada tabular) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

Piston es un transformer axial que procesa paneles multivariantes de hasta 9 variables y 128 o más pasos temporales, aplicando atención a lo largo de los ejes de tiempo y de variables. La entrada es el panel completo en contexto (in-context learning): no hay ajuste por dataset ni entrenamiento específico para cada serie. La salida combina una estimación puntual del efecto, un intervalo del 90 % (`lo90`, `hi90`), `p_answerable` y la probabilidad de que el tratamiento alcance el objetivo en el lag consultado. El modelo final es un ensemble de tres semillas entrenadas de forma independiente.

El entrenamiento se realizó únicamente sobre mundos sintéticos generados proceduralmente; el entorno de entrenamiento y los datos no forman parte de la release v0.1. El benchmark congelado incluido (`benchmark/split_C.npz`) contiene 998 mundos de 23 familias no vistas en entrenamiento, con efectos verdaderos calculados por simulación de números aleatorios comunes y etiquetas exactas de respondibilidad. La evaluación usa 2.000 remuestreos bootstrap por mundos completos. Una innovación destacable es el mecanismo de abstención calibrado: el modelo decide si la pregunta es identificable a partir de los datos, en lugar de devolver siempre una estimación. También acepta conocimiento parcial o total del grafo causal como entrada opcional (`edges` e `hidden`, con valores 0/1/2 para desconocido, presente y ausente).

## Capacidades

- Estimación de efectos causales contrafactuales en paneles de series temporales con lags de 1, 2 y 3 pasos.
- Cuantificación de incertidumbre mediante intervalos del 90 % calibrados sin ensanchamiento adicional en el benchmark.
- Predicción selectiva: devuelve `p_answerable`, la probabilidad de que la pregunta sea respondible con los datos disponibles.
- Estimación de la probabilidad de que el tratamiento alcance el objetivo en el lag consultado.
- Inferencia en contexto sin ajuste por dataset (in-context learning sobre el panel de entrada).
- Integración opcional de grafos causales completos o parciales como conocimiento previo.
- Soporte de hasta 9 variables y 128 o más pasos temporales por consulta.
- No soporta generación de texto, código, visión, audio, tool calling ni razonamiento multi-paso en el sentido de los LLM.

## Casos de uso

- Análisis de experimentos observacionales en negocio: dado un panel histórico de métricas (por ejemplo, precio, tráfico y conversión), estimar el efecto de fijar el precio en un valor alternativo y obtener un intervalo del 90 % antes de tomar la decisión.
- Monitorización industrial: con lecturas de sensores a lo largo del tiempo, estimar el impacto de cambiar un parámetro de proceso sobre una variable de calidad uno o dos pasos después, y descartar automáticamente las consultas no identificables.
- Investigación en epidemiología sintética o simulación de políticas: usar el modelo como estimador detrás de un algoritmo de identificación exacta cuando el grafo causal es conocido, configuración en la que alcanza T1 de 0,112.
- Evaluación de políticas en entornos simulados: estimar contrafactuales sobre trayectorias generadas por simuladores con estructura causal conocida o parcialmente conocida.
- Filtrado previo de preguntas en pipelines analíticos: usar `p_answerable` como puerta de calidad para derivar solo las consultas que los datos pueden sostener, reduciendo respuestas erróneas con alta confianza.
- Benchmarking de métodos causales: el repositorio incluye el benchmark congelado y `piston.metrics.report` para puntuar métodos propios con la misma métrica T1 y las mismas etiquetas de respondibilidad.
- Docencia y prototipado de inferencia causal: el tamaño reducido (0,1 GB) y la API mínima (`Piston.from_pretrained`, `predict`) permiten ejecutarlo en portátiles para experimentar con predicción selectiva.

## Benchmarks y rendimiento

Resultados sobre el benchmark congelado (4.592 preguntas, 998 mundos, 23 familias no vistas; intervalos bootstrap con 2.000 remuestreos). T1 es el área bajo la curva riesgo-cobertura (menor es mejor); "confident-wrong" es la proporción de respuestas emitidas que son erróneas.

Sin grafo causal:

| Metodo | T1 | T1 95% | Confident-wrong | Respuestas | Cobertura 90% |
|---|---|---|---|---|---|
| OLS sobre todo el historial (ensanchado x1,37) | 0,412 | 0,387–0,439 | 42,4% | 100% | 88% |
| Double machine learning con random forests (x1,53) | 0,404 | 0,378–0,430 | 41,3% | 100% | 89% |
| TimesFM 3, Google (ensanchado) | 0,399 | 0,375–0,424 | 42,6% | 100% | 91% |
| Chronos-2, Amazon 2025 (ensanchado) | 0,402 | 0,377–0,425 | 44,6% | 100% | 90% |
| CCPFN, Layer6 2026 (x6,99) | 0,387 | 0,363–0,412 | 40,0% | 100% | 90% |
| Piston v0.1 | 0,280 | 0,258–0,304 | 35,0% | 90% | 94% |

Con grafo causal conocido:

| Metodo | T1 | T1 95% | Confident-wrong | Respuestas |
|---|---|---|---|---|
| Identificación exacta + OLS (ensanchado) | 0,195 | 0,177–0,212 | 14,6% | 67% |
| Identificación exacta + DML (ensanchado) | 0,185 | 0,168–0,202 | 13,1% | 67% |
| Identificación exacta + TimesFM 3 (ensanchado) | 0,209 | 0,192–0,225 | 15,0% | 67% |
| Identificación exacta + Chronos-2 (ensanchado) | 0,204 | 0,188–0,219 | 18,0% | 67% |
| Identificación exacta + CCPFN (ensanchado) | 0,178 | 0,162–0,194 | 11,0% | 67% |
| Piston con grafo como entrada (abstenciones propias) | 0,195 | 0,177–0,214 | 19,1% | 61% |
| Identificación exacta + Piston | 0,112 | 0,101–0,124 | 7,1% | 67% |

Con grafo parcial (cada par de variables revelado con probabilidad 0,2–0,8): T1 de 0,213 (0,194–0,234) y confident-wrong del 25,8 % con un 70 % de preguntas respondidas. No hay baseline clásico publicado para esta configuración.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para los tres miembros del ensemble en precisión completa; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente. CPU también es viable para inferencia puntual.
- Cabe en cualquier GPU consumer y en portátiles; no requiere A100 ni H100.
- Opciones de despliegue: PyTorch con la API incluida (`piston.Piston.from_pretrained`), descarga vía `huggingface-cli`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | T1 sin grafo | T1 con grafo exacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Piston v0.1 | Transformer axial causal, ensemble de 3 | 12 M totales | 9 variables x 128+ pasos | 0,280 | 0,112 | Apache 2.0 | HuggingFace |
| TimesFM 3 (Google) | Modelo de series temporales | no disponible | no disponible | 0,399 | 0,209 | no disponible | no disponible |
| Chronos-2 (Amazon) | Modelo de series temporales | no disponible | no disponible | 0,402 | 0,204 | no disponible | no disponible |
| CCPFN (Layer6) | Prior-fitted network causal | no disponible | no disponible | 0,387 | 0,178 | no disponible | no disponible |
| DML con random forests | Método clásico de doble aprendizaje automático | no aplica | no aplica | 0,404 | 0,185 | no aplica | implementación propia |

## Limitaciones y advertencias

- Solo se ha evaluado sobre mundos sintéticos. Aunque las familias del benchmark no se vieron en entrenamiento, provienen del mismo generador que los datos de entrenamiento, lo que supone una ventaja frente a CCPFN, que nunca vio ese generador. No hay evaluación con datos reales.
- No transfiere a física de contacto: en empuje robótico simulado (contacto unilateral, control con realimentación), ningún modelo probado, incluido Piston, superó la predicción trivial de cero.
- El mecanismo de abstención no detecta datos desconocidos: `p_answerable` mide identificabilidad desde la estructura de los datos, no familiaridad con la distribución.
- La calibración de los intervalos y la elección de qué rangos usar con grafo se ajustaron sobre datos de entrenamiento retenidos, no sobre el benchmark; aun así, la ventaja de distribución sintética debe tenerse en cuenta al extrapolar.
- El entrenamiento está limitado a 9 variables y lags de 1 a 3 pasos; no se documenta comportamiento fuera de ese rango.
- El entorno de entrenamiento y los datos de entrenamiento no se publican en v0.1, lo que limita la reproducibilidad completa.
- Licencia Apache 2.0: permite uso comercial, pero al ser una release de investigación sin validación en datos reales, no se recomienda su uso en producción sin evaluación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OlynkAI/piston-v0.1
- Organización del autor: https://huggingface.co/OlynkAI
- Descarga alternativa citada en la model card: `huggingface-cli download 7ViksSai/piston-v0.1` (ruta indicada por el autor; no verificada)
- Benchmark congelado y predicciones de baselines: incluidos en el repositorio (`benchmark/split_C.npz`, `benchmark/baseline_predictions.npz`)
- Script de reproducción: `evaluate_benchmark.py --weights weights --bench benchmark --boot 2000`
