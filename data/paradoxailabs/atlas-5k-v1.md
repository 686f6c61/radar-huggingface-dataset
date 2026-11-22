# PARADOXAIlabs/atlas-5k-v1

## Resumen

Atlas-5K v1 es un modelo de predicción espacio-temporal de series temporales meteorológicas desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) como parte de su serie Paradox World Model. El modelo resuelve una tarea concreta: predecir las próximas 24 horas de cinco variables meteorológicas (temperatura, punto de rocío, dirección del viento, velocidad del viento y presión a nivel del mar) en estaciones meteorológicas de todo el mundo. Se entrenó sobre WEATHER-5K, un conjunto de datos con 5.672 estaciones y registros horarios entre 2014 y 2023 presentado en ICML 2026.

La relevancia del modelo no reside en su escala, sino en su planteamiento metodológico: con solo 968.672 parámetros, el modelo iguala a PhysicsFormer (19,3M parámetros) en las métricas de temperatura y punto de rocío, lo que sugiere que una arquitectura compacta bien diseñada puede competir con modelos mucho mayores en esta tarea. El modelo se distribuye como un checkpoint de PyTorch (`.pt`) con pesos, configuración y resultados de entrenamiento empaquetados, y se enmarca en una serie de 56 modelos publicados con un protocolo de evaluación pre-registrado.

Es un modelo de nicho, orientado a investigación en predicción meteorológica y modelado del mundo, no a uso conversacional ni a generación de texto. Su licencia Apache-2.0 facilita la experimentación y la reutilización, aunque la disponibilidad de código auxiliar depende del repositorio GitHub del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal específica para predicción espacio-temporal (clase `Atlas`, detalles internos no disponibles en la información proporcionada) |
| Parametros totales | 968.672 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de series temporales, no de texto; entrada: 32 estaciones, salida: 24 horas) |
| Tipos de cuantizacion | No disponible (checkpoint PyTorch en precisión original) |
| Idiomas soportados | No aplica (modelo numérico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, `torch.load` con state dict) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal específica implementada en la clase `Atlas` del repositorio `paradox-world-model/atlas`. La salida tiene forma `[batch, 32 stations, 24 hours, 5 variables, 3 quantiles]`, lo que indica un modelo de predicción probabilística por cuantiles (mediana `q[..., 1]` como pronóstico puntual) sobre un horizonte de 24 horas y 32 estaciones. La entrada incluye tensores `yc`, `mc`, `uc`, `uf`, `geo` y `static`, cuya semántica exacta no está detallada en la información proporcionada. El modelo se construye con `Atlas(**cfg)` y se carga mediante `load_state_dict`.

El entrenamiento se realizó sobre WEATHER-5K (5.672 estaciones, datos horarios 2014–2023) y el run de entrenamiento se registra como `atlas-w5k-atlas1m-h24` (2026-11-16, Kaggle). El modelo se enmarca en el enfoque "Grow, Don't Restart" descrito en el preprint `Atlas5K_growth_preprint.pdf`, que sugiere una estrategia de crecimiento progresivo del modelo en lugar de reentrenamiento desde cero. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon RLHF/DPO (no aplicables a este tipo de modelo).

## Capacidades

- Predicción de las próximas 24 horas de temperatura, punto de rocío, velocidad del viento, dirección del viento y presión a nivel del mar en estaciones meteorológicas.
- Predicción probabilística por cuantiles (3 cuantiles por variable y horizonte).
- Procesamiento conjunto de múltiples estaciones (32 por lote) con información geográfica y estática.
- Modelado espacio-temporal con integración de variables exógenas (`uc`, `uf`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Predicción meteorológica a corto plazo en estaciones: el modelo genera pronósticos horarios a 24 horas de cinco variables, adecuado para sistemas de alerta temprana y planificación agrícola.
- Investigación en modelado del mundo: sirve como baseline compacto (968K parámetros) para comparar con modelos mayores como PhysicsFormer (19,3M) en tareas de predicción espacio-temporal.
- Evaluación de arquitecturas eficientes: su reducido tamaño permite experimentar con estrategias de crecimiento ("Grow, Don't Restart") y estudiar la relación entre escala y rendimiento en predicción meteorológica.
- Reproducción de benchmarks: al incluir pesos, configuración y resultados en el checkpoint, facilita la verificación de resultados sobre WEATHER-5K test 2023.
- Prototipado en entornos con recursos limitados: al ser un modelo de menos de un millón de parámetros, puede ejecutarse en CPU y en hardware de gama baja para pruebas de concepto.
- Docencia y formación: útil para ilustrar técnicas de predicción probabilística por cuantiles y modelado espacio-temporal con datos reales de estaciones meteorológicas.

## Benchmarks y rendimiento

Resultados registrados en WEATHER-5K test 2023 (MAE):

| Variable | MAE Atlas-5K v1 | Referencia PhysicsFormer (19,3M) |
|---|---|---|
| Temperatura (T) | 1.553 | Nivel comparable (según model card) |
| Punto de rocío (Td) | 1.596 | Nivel comparable (según model card) |
| Velocidad del viento (WS) | 1.228 | No disponible |
| Dirección del viento (WD) | 56.46 | No disponible |
| Presión a nivel del mar (SLP) | 1.664 | No disponible |

La model card indica que el modelo "iguala a PhysicsFormer en T/Td" y que "no supera a ninguno bajo las reglas pre-registradas". No se proporcionan resultados numéricos completos de PhysicsFormer ni de otros comparadores en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (modelo de 968.672 parámetros, checkpoint de ~3,9 MB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también ejecutable en CPU sin problemas.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `load_state_dict`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia muy baja en CPU y GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-5K v1 | 968.672 | Predicción meteorológica 24 h, 5 variables | 32 estaciones, 24 h | Apache-2.0 | Hugging Face + GitHub |
| PhysicsFormer | 19,3M | Predicción meteorológica (referencia en model card) | No disponible | No disponible | No disponible |
| Atlas-W Delhi (serie #54) | No disponible | Pronósticos reales T-B | No disponible | Apache-2.0 (presumible) | Hugging Face |
| Atlas-5K v2a (serie #56) | No disponible | Predicción meteorológica | No disponible | Apache-2.0 (presumible) | Hugging Face |

No se dispone de datos suficientes para comparar rendimiento con otros modelos de predicción meteorológica fuera de PhysicsFormer.

## Limitaciones y advertencias

- Modelo de nicho: no es un modelo de lenguaje; no genera texto, código ni mantiene conversaciones.
- Rendimiento limitado: según la propia model card, no supera a PhysicsFormer bajo las reglas pre-registradas; solo iguala en T y Td.
- Cobertura geográfica y temporal restringida al dataset WEATHER-5K (2014–2023, 5.672 estaciones); el comportamiento fuera de esa distribución no está validado.
- Horizonte fijo de 24 horas y 32 estaciones por lote; no se documenta escalabilidad a otros horizontes o configuraciones.
- Dependencia de código externo: requiere clonar el repositorio GitHub para construir la clase `Atlas`; no es autocontenido.
- Los datos de entrenamiento no se incluyen; solo se documentan sus fuentes y términos en `DATA_SOURCES.md`.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de predicciones erróneas fuera de distribución.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el uso de predicciones meteorológicas en producción recae en el usuario.
- Sesgos: no documentados en la información proporcionada; posible sesgo hacia estaciones y regiones sobrerrepresentadas en WEATHER-5K.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-5k-v1
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- README del proyecto Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Preprint "Grow, Don't Restart": https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/paper4/Atlas5K_growth_preprint.pdf
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#54): https://huggingface.co/PARADOXAIlabs/atlas-w-delhi-tb
- Modelo siguiente (#56): https://huggingface.co/PARADOXAIlabs/atlas-5k-v2a
- Serie completa: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Web del autor: https://paradoxailab.com
