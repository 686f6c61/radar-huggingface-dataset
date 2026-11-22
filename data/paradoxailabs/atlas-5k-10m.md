# PARADOXAIlabs/atlas-5k-10m

## Resumen

Atlas-5K 10M es un modelo neuronal especializado en predicción meteorológica a corto plazo (nowcasting) desarrollado por ParadoxAI Lab dentro de su serie Paradox World Model, concretamente la entrega número 58 de la serie y el modelo 55 de 56 publicados. Resuelve la tarea de predecir las próximas 24 horas de cinco variables meteorológicas (temperatura, punto de rocío, dirección del viento, velocidad del viento y presión a nivel del mar) en estaciones meteorológicas concretas, partiendo de observaciones horarias y datos auxiliares. Se trata de un modelo compacto de 9.639.780 parámetros entrenado sobre el conjunto WEATHER-5K (ICML 2026), que agrupa 5.672 estaciones meteorológicas de todo el mundo con datos horarios entre 2014 y 2023.

La relevancia del modelo reside en su relación entre tamaño y rendimiento: con menos de 10 millones de parámetros supera a PhysicsFormer (19,3M) en cuatro de las cinco variables evaluadas y, según la model card, mantiene victorias estadísticamente significativas frente a veinte configuraciones rivales (TimesFM 2.5/3.0, Chronos-2, Chronos-Bolt, TiRex, Sundial, Time-MoE, TTM y persistencia) en las cinco variables sobre 709 estaciones en test de 2023 y en datos en vivo de 2024-25.

Esta versión concreta (v2c ampliada) se obtiene por crecimiento del modelo anterior: se incrementa la anchura de 196 a 392, las cabezas de atención de 4 a 8 y los bloques de encoder y de dinámica de 2 a 7, manteniendo las mismas predicciones al inicio del crecimiento, y se entrena durante 80.000 pasos adicionales con una tasa de aprendizaje máxima de 3e-4. El modelo se distribuye como checkpoint de PyTorch y queda marcado como "adopted", aunque ha sido superado como entrada WB1 por el modelo #59 (Atlas-5K 25M).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal con encoder y bloques de dinámica (detalles internos no disponibles en la información proporcionada) |
| Parametros totales | 9.639.780 |
| Parametros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible (modelo de series temporales; entrada por estaciones y ventana horaria no especificada) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión original) |
| Idiomas soportados | no disponible (modelo numérico de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, state dict dentro de un diccionario con metadatos) |
| Tarea | Predicción de las próximas 24 h de temperatura, punto de rocío, dirección y velocidad del viento y presión a nivel del mar |
| Datos de entrenamiento | WEATHER-5K: 5.672 estaciones, datos horarios 2014-2023 |
| Salida | Tensor `[batch, 32 estaciones, 24 horas, 5 variables, 3 cuantiles]` |
| Tamaño del repositorio | 0,0 GB (checkpoint de 38.671.723 bytes) |
| Fecha de entrenamiento | 2026-11-17 (Google Colab, NVIDIA A100-SXM4-80GB) |
| Fecha de publicación | 2026-11-18 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura con un encoder y varios bloques de dinámica (7 bloques tras el crecimiento), con anchura 392 y 8 cabezas de atención. La versión actual parte del modelo v2c (anchura 196, 4 cabezas, 2 bloques de encoder y 2 de dinámica) y se obtiene mediante una estrategia de crecimiento de parámetros documentada en el preprint "Grow, Don't Restart": se amplía la red manteniendo las mismas predicciones al inicio del crecimiento y se continúa el entrenamiento durante 80.000 pasos adicionales con tasa de aprendizaje máxima de 3e-4. Este enfoque evita reiniciar el entrenamiento desde cero al escalar el modelo.

El entrenamiento se realizó el 17 de noviembre de 2026 en una NVIDIA A100-SXM4-80GB sobre el conjunto WEATHER-5K (5.672 estaciones, datos horarios 2014-2023). La entrada se construye con observaciones de contexto (`yc`), máscaras (`mc`), variables auxiliares (`uc`), forzamientos futuros (`uf`), información geográfica (`geo`) y datos estáticos (`static`), según el script `atlas/delhi/run_atlas_5k.py`. La salida es un tensor con 3 cuantiles por variable; la mediana (`q[..., 1]`) es la predicción puntual. No se especifica en la información disponible si hubo RLHF, DPO ni la composición detallada de tokens de entrenamiento.

## Capacidades

- Predicción meteorológica a 24 horas de cinco variables: temperatura (T), punto de rocío (Td), dirección del viento (WD), velocidad del viento (WS) y presión a nivel del mar (SLP).
- Predicción probabilística mediante tres cuantiles por variable y horizonte.
- Predicción multiestación simultánea (tensor de 32 estaciones por lote en el ejemplo de carga).
- Modelado espacio-temporal con incorporación de información geográfica y datos estáticos de estación.
- Integración de forzamientos futuros y variables auxiliares como entrada.
- Inferencia por lotes en PyTorch (CPU o GPU).
- No dispone de tool calling, capacidades de agente, generación de texto, visión, audio ni razonamiento multilingüe: es un modelo numérico de series temporales.

## Casos de uso

- Predicción operativa de estaciones meteorológicas: el modelo genera las próximas 24 horas de temperatura, viento y presión para estaciones concretas, adecuado para servicios de nowcasting que necesitan actualizaciones horarias con un coste computacional muy bajo (menos de 10M de parámetros).
- Relleno de huecos y downscaling de observaciones: al aceptar máscaras y datos auxiliares, puede emplearse para completar series horarias incompletas o para generar predicciones locales a partir de datos de reanálisis.
- Comparación y benchmarking de modelos de series temporales: su tamaño reducido y su licencia Apache-2.0 lo hacen útil como línea base ligera frente a modelos fundacionales de forecasting (TimesFM, Chronos, Time-MoE) en pipelines de evaluación.
- Predicción probabilística para gestión de riesgo: los tres cuantiles de salida permiten construir intervalos de incertidumbre para decisiones sensibles a la temperatura o el viento (agricultura, energía eólica, logística).
- Despliegue en entornos con recursos limitados: al caber en CPU y en GPU de consumo, puede ejecutarse en estaciones locales o dispositivos perimetrales sin infraestructura de centro de datos.
- Investigación en crecimiento de modelos: sirve como caso reproducible de la técnica "Grow, Don't Restart", útil para estudiar escalado progresivo de redes pequeñas sin reiniciar el entrenamiento.
- Evaluación frente a modelos numéricos de predicción: la model card documenta comparaciones con ECMWF-HRES y PhysicsFormer, por lo que puede integrarse en estudios comparativos de predicción física frente a aprendizaje automático.

## Benchmarks y rendimiento

Resultados registrados en la model card (test de 2023):

| Metrica | Valor |
|---|---|
| Validación E | 0.27592 (-1,95% frente a v2c; adoptado por la regla 10M-A) |
| Test MAE temperatura (T) | 1,429 |
| Test MAE punto de rocío (Td) | 1,486 |
| Test MAE dirección del viento (WD) | 53,93 |
| Test MAE velocidad del viento (WS) | 1,183 |
| Test MAE presión a nivel del mar (SLP) | 1,477 |

Comparaciones registradas:

| Comparación | Resultado |
|---|---|
| Frente a PhysicsFormer (19,3M) | Mejor en 4 de 5 variables |
| Frente a ECMWF-HRES | No supera a ECMWF-HRES en presión |
| Frente a 20 configuraciones rivales (TimesFM 2.5/3.0, Chronos-2, Chronos-Bolt, TiRex, Sundial, Time-MoE, TTM, persistencia) | Victorias significativas en las cinco variables en 20 de 20 pares oponente-periodo (709 estaciones, test 2023 y datos en vivo 2024-25) |

No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 38.671.723 bytes (unos 37 MB); la inferencia cabe holgadamente en cualquier GPU con al menos 1 GB de VRAM, y probablemente en CPU.
- GPU recomendadas: no requiere GPU de gama alta; el entrenamiento se realizó en una NVIDIA A100-SXM4-80GB, pero la inferencia es viable en RTX 4090, RTX 3060 o incluso en CPU.
- GPU de consumo: sí, cabe en cualquier GPU de consumo moderna e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` + clase `Atlas` del repositorio GitHub); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Atlas-5K 10M (#58) | 9,64M | Nowcasting 24 h, 5 variables | no disponible | Apache-2.0 | Supera a PhysicsFormer en 4/5 variables; no supera a ECMWF-HRES en presión |
| Atlas-5K 25M (#59) | 25M (según nombre) | Nowcasting 24 h, 5 variables | no disponible | Apache-2.0 | Sucesor como entrada WB1 de la serie; supera al #58 |
| PhysicsFormer | 19,3M | Predicción meteorológica | no disponible | no disponible | Superado por Atlas-5K 10M en 4 de 5 variables |
| TimesFM 2.5/3.0 | no disponible | Forecasting de series temporales | no disponible | no disponible | Derrotado por Atlas-5K 10M en las cinco variables según la model card |
| Chronos-2 / Chronos-Bolt | no disponible | Forecasting de series temporales | no disponible | no disponible | Derrotados por Atlas-5K 10M en las cinco variables según la model card |

## Limitaciones y advertencias

- Modelo de dominio específico: solo predice cinco variables meteorológicas en estaciones; no es un modelo de propósito general ni admite texto, código o visión.
- Cobertura geográfica limitada a las estaciones de WEATHER-5K (5.672 estaciones); el rendimiento fuera de esa red no está documentado.
- No supera a ECMWF-HRES en presión a nivel del mar, por lo que no sustituye a los modelos numéricos operativos en todos los campos.
- Estado "adopted" pero ya superado por el modelo #59 (Atlas-5K 25M): para nuevos desarrollos conviene evaluar la versión sucesora.
- Los datos de entrenamiento no se incluyen en el repositorio; solo se documentan sus fuentes y términos en DATA_SOURCES.md, lo que limita la reproducibilidad completa.
- No se documentan análisis de sesgo, calibración de cuantiles ni robustez ante eventos extremos.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no se identifican restricciones adicionales en la información disponible.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de predicciones erróneas fuera de distribución o en estaciones con datos incompletos.
- El repositorio de Hugging Face figura con 0 descargas y 0 likes, y tamaño 0,0 GB, lo que sugiere escasa validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-5k-10m
- Serie completa: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Modelo anterior (#57 Atlas-5K v2c): https://huggingface.co/PARADOXAIlabs/atlas-5k-v2c
- Modelo siguiente (#59 Atlas-5K 25M): https://huggingface.co/PARADOXAIlabs/atlas-5k-25m
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- README de la serie Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie de modelos: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Preprint "Grow, Don't Restart": https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/paper4/Atlas5K_growth_preprint.pdf
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Sitio del laboratorio: https://paradoxailab.com
