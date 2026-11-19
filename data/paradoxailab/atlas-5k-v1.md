# paradoxailab/atlas-5k-v1

## Resumen

Atlas-5K v1 es un modelo neuronal de predicción meteorológica a corto plazo desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Concretamente, es la entrega número 55 de la serie y el modelo 52 de 56 publicados. Resuelve la tarea de previsión de las próximas 24 horas de cinco variables meteorológicas en estaciones: temperatura (T), punto de rocío (Td), dirección del viento (WD), velocidad del viento (WS) y presión a nivel del mar (SLP). Se entrenó sobre el conjunto WEATHER-5K (ICML 2026), que agrupa 5.672 estaciones meteorológicas de todo el mundo con datos horarios entre 2014 y 2023.

El modelo es extremadamente compacto: 968.672 parámetros, lo que lo sitúa en el rango de los modelos ligeros de series temporales. Su relevancia radica en que, según los resultados registrados por el autor, iguala a PhysicsFormer (19,3M de parámetros) en MAE de temperatura y punto de rocío pese a ser aproximadamente veinte veces más pequeño. El checkpoint se distribuye como un único fichero PyTorch de 3,94 MB que contiene pesos, configuración, metadatos y registros de resultados.

La arquitectura concreta no se describe en detalle en la información disponible; el autor remite a la clase `Atlas` del repositorio GitHub y al preprints «Grow, Don't Restart». La salida del modelo es un tensor cuantílico de forma `[batch, 32 estaciones, 24 horas, 5 variables, 3 cuantiles]`, donde la mediana (`q[..., 1]`) constituye la predicción puntual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (clase `Atlas` del repositorio paradox-world-model/atlas; transformer espaciotemporal según la serie) |
| Parámetros totales | 968.672 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada definida por el script `atlas/delhi/run_atlas_5k.py`; horizonte de salida de 24 h) |
| Tipos de cuantización | no disponible (checkpoint en FP32 PyTorch; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no aplica (modelo numérico de series temporales) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict serializado con `torch.save`, 3.942.805 bytes) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se implementa en la clase `Atlas` del repositorio `paradox-world-model/atlas` y de que el modelo pertenece a la línea «Paradox World Model», orientada a la modelización espaciotemporal. La firma de inferencia documentada (`model(yc, mc, uc, uf, geo, None, static)`) sugiere una entrada con variables condicionantes pasadas (`yc`), máscaras (`mc`), entradas auxiliares (`uc`, `uf`), información geográfica (`geo`) y variables estáticas, lo que es coherente con un modelo espaciotemporal que explota la posición de las estaciones. La salida es cuantílica (tres cuantiles por variable y hora), lo que indica un entrenamiento con pérdida de regresión cuantílica o pinball loss, aunque este extremo no se confirma explícitamente.

El entrenamiento se realizó el 16 de noviembre de 2026 en el run de Kaggle `atlas-w5k-atlas1m-h24` y el modelo se publicó el 17 de noviembre de 2026. Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y términos se documentan en `DATA_SOURCES.md`. El preprint asociado, «Grow, Don't Restart», sugiere una metodología de crecimiento progresivo del modelo (entrenamiento incremental o expansión de capacidad) en lugar de reentrenamiento desde cero, si bien los detalles técnicos no están disponibles en la información proporcionada. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de regresión numérica.

## Capacidades

- Predicción determinista y cuantílica de cinco variables meteorológicas (temperatura, punto de rocío, velocidad y dirección del viento, presión a nivel del mar) para un horizonte de 24 horas.
- Salida multiestación simultánea: el tensor de salida cubre 32 estaciones por lote.
- Predicción probabilística mediante tres cuantiles por variable y paso temporal.
- Condicionamiento geográfico y estático: acepta coordenadas/geografía de estación y variables estáticas como entrada.
- Manejo de valores ausentes mediante máscaras de entrada (`mc`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo puramente numérico de forecasting.
- Capacidades multilingües: no aplica.

## Casos de uso

- Predicción meteorológica operativa a 24 h en redes de estaciones: el modelo genera las cinco variables para todas las estaciones del lote en una sola pasada, lo que permite alimentar paneles de previsión horaria con un coste computacional mínimo (menos de 1M de parámetros).
- Downscaling y asimilación en estaciones densas: al condicionar por geografía y variables estáticas, puede emplearse para interpolar o corregir predicciones de modelos físicos en ubicaciones con observaciones escasas.
- Previsión probabilística para gestión de riesgo: los tres cuantiles de salida permiten construir intervalos de incertidumbre para temperatura y viento, útiles en agricultura, energía eólica y logística.
- Investigación en modelos ligeros de series temporales: sirve como baseline compacto (968K parámetros) para comparar arquitecturas espaciotemporales frente a modelos físicos o transformers de mayor tamaño como PhysicsFormer.
- Integración en pipelines de datos meteorológicos: al ser un checkpoint PyTorch de 3,9 MB, se puede cargar en CPU y ejecutar en lotes dentro de flujos ETL sin GPU dedicada.
- Prototipado rápido de servicios de previsión local: el bajo coste de inferencia y la licencia Apache-2.0 permiten desplegarlo en entornos de borde o en servicios cloud de bajo presupuesto.
- Evaluación reproducible: el checkpoint incluye `results` y logs del run, lo que facilita la verificación de resultados y la replicación de experimentos.

## Benchmarks y rendimiento

Resultados registrados por el autor en el test de WEATHER-5K (año 2023), en MAE:

| Variable | MAE Atlas-5K v1 | Referencia PhysicsFormer (19,3M) |
|---|---|---|
| Temperatura (T) | 1,553 | igualado (nivel) |
| Punto de rocío (Td) | 1,596 | igualado (nivel) |
| Velocidad del viento (WS) | 1,228 | no disponible |
| Dirección del viento (WD) | 56,46 | no disponible |
| Presión a nivel del mar (SLP) | 1,664 | no disponible |

El autor indica explícitamente que el modelo «no supera a ninguno bajo las reglas pre-registradas» y que iguala a PhysicsFormer en T y Td. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks de texto, por no ser aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (menos de 1M de parámetros y checkpoint de 3,9 MB); en la práctica cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier GPU moderna (RTX 3060 o superior, A100, H100) ejecutará la inferencia con latencia despreciable. La CPU es suficiente para lotes moderados.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos cientos de MB libres; también en Raspberry Pi y entornos de borde.
- Opciones de despliegue: PyTorch nativo (carga mediante `torch.load` y la clase `Atlas` del repositorio GitHub). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo se espera latencia de milisegundos por lote en GPU y de decenas de milisegundos en CPU, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | MAE T (test 2023) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-5K v1 | 968.672 | Forecasting meteorológico 24 h, 5 variables | 1,553 | Apache-2.0 | Hugging Face (paradoxailab/atlas-5k-v1) |
| PhysicsFormer | 19.300.000 | Forecasting meteorológico (referencia del autor) | igualado en T y Td según el autor | no disponible | no disponible en la información |
| Atlas-5K v2a | no disponible | misma familia, versión posterior | no disponible | Apache-2.0 (presumible) | Hugging Face (paradoxailab/atlas-5k-v2a) |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: solo predice cinco variables meteorológicas en estaciones; no es un modelo de lenguaje ni un modelo multimodal, por lo que no debe evaluarse con benchmarks de texto.
- Resultados autoinformados: las cifras de MAE proceden del registro del autor y no se han verificado de forma independiente en la información disponible.
- El propio autor reconoce que el modelo no supera a PhysicsFormer bajo las reglas pre-registradas; la ventaja es de eficiencia (20× menos parámetros), no de precisión absoluta.
- Sesgos geográficos potenciales: entrenado sobre 5.672 estaciones con distribución desigual (mayor densidad en Europa y Norteamérica), lo que puede degradar el rendimiento en regiones con pocas estaciones (África, Amazonía, océanos).
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí existe riesgo de predicciones poco fiables fuera de la distribución de entrenamiento (eventos extremos, estaciones nuevas).
- Limitaciones de contexto: horizonte fijo de 24 h y lote de 32 estaciones; no se documenta soporte para horizontes más largos ni para un número arbitrario de estaciones.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero los datos de entrenamiento (WEATHER-5K) no se incluyen y sus términos se rigen por `DATA_SOURCES.md`, que debe revisarse antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria.
- Dependencia del código del repositorio GitHub para reconstruir el modelo; el checkpoint por sí solo no es autónomo.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/atlas-5k-v1
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Modelo anterior (#54): https://huggingface.co/paradoxailab/atlas-w-delhi-tb
- Modelo siguiente (#56): https://huggingface.co/paradoxailab/atlas-5k-v2a
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- README del proyecto Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Preprint «Grow, Don't Restart»: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/paper4/Atlas5K_growth_preprint.pdf
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Sitio del autor: https://paradoxailab.com
