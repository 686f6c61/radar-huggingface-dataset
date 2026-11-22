# PARADOXAIlabs/pwm-dyn-v0.7-pems-bay

## Resumen

PWM-Dyn v0.7 (PEMS-BAY) es un modelo de predicción de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, que agrupa 56 modelos publicados de los números 01 a 59. Este checkpoint concreto, el número 18 de la serie, está especializado en la predicción de los próximos 12 pasos de tráfico en la red de 325 sensores de PEMS-BAY (área de la bahía de San Francisco), con un enfoque explícito en mantener la precisión cuando se producen caídas de sensores (outages).

Se trata de un modelo de tamaño muy reducido, con 336.932 parámetros, lo que lo sitúa en la categoría de modelos ligeros diseñados para despliegue en entornos con recursos limitados. La tarea declarada es la predicción de los próximos 12 pasos temporales de tráfico bajo condiciones de fallo de sensores, un problema realista en infraestructuras de sensores urbanos donde las interrupciones de datos son frecuentes.

La relevancia de esta versión radica en su cambio respecto a v0.6: incorpora una base de fallback y entrenamiento específico para outages, lo que según el autor reduce el error en condiciones de caída real de sensores entre un 11% y un 22% en cinco redes, con un coste de solo un 0,4% a 1,8% de degradación en condiciones limpias. El modelo se distribuye bajo licencia Apache-2.0 y en formato PyTorch (`.pt`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de series temporales espaciotemporales; código en repositorio GitHub) |
| Parámetros totales | 336.932 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tarea de predicción de 12 pasos temporales) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo numérico de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, state dict en `ck["weights"]`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su carácter espaciotemporal y su implementación en PyTorch. El código de la arquitectura se encuentra en el repositorio de GitHub del proyecto, y la configuración de entrenamiento está almacenada en el propio archivo de checkpoint bajo la clave `ck['cfg']`. El modelo opera sobre la red de 325 sensores de PEMS-BAY y produce predicciones de 12 pasos temporales.

El entrenamiento se realizó el 4 de noviembre de 2026 mediante un cuaderno de Kaggle (identificador `8ffe55b5c8`, versión 365414722, commit `b0f6a08`). La innovación declarada en esta versión es la incorporación de una "base de fallback" junto con entrenamiento específico para outages, lo que según el autor mejora la robustez ante caídas reales de sensores. No se especifican el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio). Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y términos se documentan en `DATA_SOURCES.md`.

## Capacidades

- Predicción de los próximos 12 pasos temporales de tráfico sobre la red de 325 sensores de PEMS-BAY.
- Robustez ante caídas de sensores (outages): el modelo incorpora una base de fallback y fue entrenado específicamente para mantener la precisión cuando faltan datos de sensores.
- Predicción espaciotemporal: modela dependencias entre sensores de la red, no solo series individuales.
- Evaluación mediante ParadoxBench-1.2, con métricas separadas para condiciones limpias (clean) y para outages reales (Track G).
- Distribución como ensemble de 3 semillas; este archivo corresponde a la semilla 200.
- No se declaran capacidades de generación de texto, código, matemáticas, visión, tool calling, agentes ni multilingüismo, por tratarse de un modelo numérico de series temporales.

## Casos de uso

- Predicción de tráfico urbano en tiempo real: el modelo puede generar las próximas 12 estimaciones de flujo o velocidad en los 325 sensores de PEMS-BAY, adecuado para paneles de control de movilidad y sistemas de información al conductor.
- Gestión de incidencias en redes de sensores: gracias a su entrenamiento específico para outages, puede mantener predicciones útiles cuando algunos sensores dejan de reportar, escenario habitual en infraestructuras de campo.
- Planificación de capacidad y mantenimiento: las predicciones a 12 pasos permiten anticipar congestión y priorizar intervenciones en corredores con mayor demanda.
- Alimentación de sistemas de enrutamiento dinámico: las predicciones a corto plazo pueden integrarse en motores de rutas que ajustan recomendaciones según el estado previsto de la red.
- Investigación en forecasting espaciotemporal: su tamaño reducido (336.932 parámetros) y su licencia Apache-2.0 lo hacen útil como baseline reproducible para comparar métodos de imputación y robustez ante fallos.
- Despliegue en entornos con recursos limitados: al ser un modelo pequeño en formato PyTorch, puede ejecutarse en CPU o en GPUs de gama baja para inferencia en borde o en servidores modestos.
- Evaluación comparativa de robustez: sirve para medir la degradación de precisión entre condiciones limpias y con outages, un eje de evaluación poco cubierto en modelos de forecasting convencionales.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los del autor en ParadoxBench-1.2:

| Métrica | Resultado |
|---|---|
| ParadoxBench-1.2 test MAE (clean) | 1,533 |
| ParadoxBench-1.2 test MAE (outages reales, Track G) | 1,959 |
| Configuración | Ensemble de 3 semillas (este archivo: semilla 200) |
| Mejora vs v0.6 en outages | −11% a −22% en cinco redes |
| Degradación vs v0.6 en clean | +0,4% a +1,8% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo de series temporales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 1.382.243 bytes (aproximadamente 1,3 MB) y el modelo tiene 336.932 parámetros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100, H100 ni RTX 4090. Una GPU integrada o una CPU multinúcleo puede bastar para inferencia.
- Cabe en GPU consumer: sí, en todas las gamas (GTX 1050, RTX 3050, RTX 4090, etc.), con un consumo de memoria despreciable.
- Opciones de despliegue: PyTorch nativo (carga mediante `torch.load` y `hf_hub_download`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dado el tamaño, se espera latencia muy baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.7 (PEMS-BAY) | 336.932 | 12 pasos | Forecasting de tráfico con outages | Apache-2.0 | Hugging Face |
| PWM-Dyn v0.7 (METR-LA) | no disponible | 12 pasos | Forecasting de tráfico con outages | Apache-2.0 | Hugging Face (modelo #17 de la serie) |
| PWM-W Delhi v0.1 | no disponible | no disponible | World model (serie PWM-W) | no disponible | Hugging Face (modelo #19 de la serie) |

No se dispone de información sobre otros modelos comparables de la misma categoría (forecasting espaciotemporal de tráfico con robustez ante outages) en la documentación proporcionada. La comparación más directa disponible es con la versión anterior v0.6 del mismo modelo, que según el autor presenta un error entre un 11% y un 22% mayor en outages reales y entre un 0,4% y un 1,8% menor en condiciones limpias.

## Limitaciones y advertencias

- Dominio restringido: el modelo está entrenado específicamente para PEMS-BAY (325 sensores del área de la bahía de San Francisco); su generalización a otras redes no está documentada en esta ficha.
- Horizonte limitado: predice únicamente 12 pasos temporales; no está diseñado para pronósticos de mayor alcance.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datos de una región concreta, puede heredar sesgos geográficos y de cobertura de sensores de PEMS-BAY.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero existe riesgo de predicciones poco fiables fuera de la distribución de entrenamiento o ante patrones de tráfico atípicos.
- Limitaciones de idioma: no aplica; es un modelo numérico, no procesa texto.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Caveat para producción: el modelo se distribuye como ensemble de 3 semillas y este archivo es solo una de ellas (semilla 200); para reproducir los resultados reportados es necesario combinar las tres semillas.
- Datos de entrenamiento no incluidos: el repositorio no contiene los datos; deben obtenerse de las fuentes documentadas en `DATA_SOURCES.md`, con sus propios términos.
- Madurez: el modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, y su validación externa es inexistente; los resultados son los reportados por el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-pems-bay
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Resultados completos (RESULTS.md): https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Documentación de la versión v0.7 realworld: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.7-realworld/README.md
- Índice de la serie de modelos: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes y términos de los datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación (CITATION.cff): https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior de la serie (#17, METR-LA): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-metr-la
- Modelo siguiente de la serie (#19, PWM-W Delhi v0.1): https://huggingface.co/PARADOXAIlabs/pwm-w-delhi-v0.1
- Colección completa de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio web del autor: https://paradoxailab.com
