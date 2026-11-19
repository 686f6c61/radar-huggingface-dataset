# paradoxailab/atlas-5k-v2a

## Resumen

Atlas-5K v2a es un modelo de predicción de series temporales espacio-temporales desarrollado por ParadoxAI Lab, enmarcado en su serie Paradox World Model (modelo 53 de 56 publicados). Su tarea concreta es pronosticar las próximas 24 horas de cinco variables meteorológicas —temperatura, punto de rocío, dirección del viento, velocidad del viento y presión a nivel del mar— en estaciones meteorológicas. Está entrenado sobre el conjunto WEATHER-5K (ICML 2026), que comprende 5.672 estaciones repartidas por todo el mundo con datos horarios entre 2014 y 2023.

Se trata de un modelo muy compacto: 968.672 parámetros en total, distribuido como un único checkpoint PyTorch de aproximadamente 3,9 MB. No es un modelo de lenguaje ni un transformer generativo de propósito general, sino una red especializada en forecasting que produce cuantiles (tres por variable: inferior, mediana y superior) para cada estación y horizonte temporal. La salida tiene forma `[batch, 32 estaciones, 24 horas, 5 variables, 3 cuantiles]`, donde la mediana (`q[..., 1]`) constituye el pronóstico puntual.

La relevancia de esta versión radica en su carácter experimental y de validación: registra un error de validación E de 0,28869 frente a 0,29292 de la versión anterior (una mejora del 1,44%), tras 150.000 pasos de entrenamiento. No obstante, el propio autor indica que el modelo "no ha sido probado aún" más allá de validación, y la versión adoptada de la serie es la siguiente (#57, Atlas-5K v2c). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja su naturaleza de artefacto de investigación intermedio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clase `Atlas` del repositorio paradox-world-model; red especializada en forecasting espacio-temporal) |
| Parametros totales | 968.672 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada definida por el pipeline `run_atlas_5k.py`; salida fija de 24 horas) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch de precisión nativa; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de que se construye con la clase `Atlas` del repositorio `paradox-world-model/atlas`, y que la instanciación se realiza con los parámetros de `ck["cfg"]` (excluyendo `grown_from`). La firma de llamada `model(yc, mc, uc, uf, geo, None, static)` sugiere una entrada multi-fuente: variables objetivo (`yc`), máscaras (`mc`), variables de control (`uc`), features futuras (`uf`), información geográfica (`geo`) y variables estáticas (`static`). El modelo devuelve `q` (cuantiles), `recon` (reconstrucción) y `extras`, lo que apunta a un esquema de entrenamiento con reconstrucción auxiliar además de la predicción cuantílica.

El entrenamiento se realizó sobre WEATHER-5K (ICML 2026), con 5.672 estaciones globales y datos horarios de 2014 a 2023, durante 150.000 pasos (la única modificación declarada respecto a la versión anterior, #55 Atlas-5K v1). El run de entrenamiento se identifica como `Kaggle atlas-w5k-v2a, 2026-11-16`. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF/DPO (poco probables en un modelo de forecasting). El paper asociado es "Grow, Don't Restart" (preprint `Atlas5K_growth_preprint.pdf`), lo que sugiere que la serie explora estrategias de crecimiento progresivo del modelo en lugar de reentrenamiento desde cero.

## Capacidades

- Pronóstico determinista y probabilístico de 24 horas para cinco variables meteorológicas: temperatura, punto de rocío, dirección del viento, velocidad del viento y presión a nivel del mar.
- Predicción multi-estación simultánea: la salida cubre hasta 32 estaciones por lote, lo que permite modelar dependencias espaciales entre ubicaciones.
- Predicción cuantílica: tres cuantiles por variable y horizonte, lo que habilita intervalos de incertidumbre además del pronóstico puntual.
- Incorporación de información geográfica y variables estáticas por estación, lo que permite adaptar el pronóstico al régimen climático de cada ubicación.
- Uso de variables de control y features futuras conocidas (`uf`), útil para condicionar el pronóstico a forzamientos externos.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües, de visión ni de audio.
- No se documenta un modo "thinking" ni ninguna capacidad generativa de texto.

## Casos de uso

- **Pronóstico meteorológico operativo a corto plazo**: el modelo predice las próximas 24 horas de cinco variables en estaciones concretas, lo que permite alimentar paneles de predicción local con horizonte diario y con intervalos de incertidumbre derivados de los cuantiles.
- **Relleno de huecos en series históricas**: dado que acepta máscaras (`mc`), puede emplearse para imputar observaciones faltantes en registros de estaciones, reconstruyendo valores plausibles a partir del contexto espacio-temporal.
- **Downscaling y ajuste local**: al incorporar `geo` y `static`, el modelo puede adaptar predicciones de gran escala a la ubicación exacta de una estación, útil en regiones con orografía compleja donde los modelos globales pierden precisión.
- **Generación de escenarios probabilísticos**: los tres cuantiles de salida permiten construir bandas de confianza para temperatura y viento, aprovechables en gestión de riesgo agrícola o logístico.
- **Investigación en modelado espacio-temporal**: con menos de un millón de parámetros, es un banco de pruebas ligero para experimentar con arquitecturas de forecasting y comparar contra baselines en WEATHER-5K.
- **Prototipado rápido en entornos con recursos limitados**: el checkpoint de 3,9 MB se carga en CPU sin problemas, lo que facilita integrarlo en pipelines de validación, notebooks o sistemas embebidos sin GPU.
- **Evaluación comparativa de la serie Paradox World Model**: sirve como punto de referencia intermedio (v2a) frente a versiones anteriores (#55 v1) y posteriores (#57 v2c adoptada) para estudiar el efecto del crecimiento progresivo del modelo.

## Benchmarks y rendimiento

| Metrica | Atlas-5K v2a | Atlas-5K v1 (#55) | Delta |
|---|---|---|---|
| Error de validación E | 0,28869 | 0,29292 | -1,44% |
| Pasos de entrenamiento | 150.000 | no disponible | no disponible |
| Estado | solo validación | no disponible | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un LLM y no aplica ese tipo de evaluaciones. Tampoco se han publicado métricas de test: el autor indica explícitamente "not yet tested".

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El checkpoint pesa 3,9 MB y el modelo tiene 968.672 parámetros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es sobredimensionada. La inferencia en CPU es viable.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales y en la mayoría de sistemas embebidos con PyTorch.
- Opciones de despliegue: PyTorch nativo (carga mediante `torch.load` y la clase `Atlas` del repositorio). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño, se espera latencia de milisegundos en CPU para lotes pequeños, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| Atlas-5K v2a | 968.672 | salida 24 h, 5 variables | Forecasting meteorológico en estaciones | Apache-2.0 | Validación, no probado en test |
| Atlas-5K v1 (#55) | no disponible | salida 24 h, 5 variables | Forecasting meteorológico en estaciones | Apache-2.0 | Versión previa de la serie |
| Atlas-5K v2c (#57) | no disponible | salida 24 h, 5 variables | Forecasting meteorológico en estaciones | Apache-2.0 | Versión adoptada de la serie |

No se dispone de información sobre modelos externos comparables (por ejemplo, otros modelos de forecasting espacio-temporal entrenados en WEATHER-5K) en la documentación proporcionada. La comparativa se limita, por tanto, a las versiones de la propia serie Paradox World Model.

## Limitaciones y advertencias

- **Estado experimental**: el autor indica explícitamente "validation only" y "not yet tested". No hay resultados en test, por lo que el rendimiento real en producción es desconocido.
- **Versión no adoptada**: la versión adoptada de la serie es la siguiente (#57 Atlas-5K v2c), lo que sugiere que v2a fue un paso intermedio y no la elección final del autor.
- **Alcance restringido**: solo predice cinco variables meteorológicas y un horizonte fijo de 24 horas; no es un modelo de propósito general.
- **Dependencia del código del repositorio**: la carga requiere clonar `paradox-world-model` y usar la clase `Atlas`, además de replicar la construcción de entradas de `atlas/delhi/run_atlas_5k.py`. No hay pipeline autocontenido en el repo de Hugging Face.
- **Datos de entrenamiento no incluidos**: la model card remite a `DATA_SOURCES.md` para las fuentes y términos, pero los datos no se distribuyen con el modelo, lo que dificulta la reproducibilidad directa.
- **Riesgo de sesgo geográfico**: la cobertura de 5.672 estaciones no es uniforme globalmente; el rendimiento puede degradarse en regiones con baja densidad de estaciones.
- **Sin cuantizaciones documentadas**: no se ofrecen variantes GGUF, ONNX ni INT8, lo que limita su uso fuera de PyTorch.
- **Licencia Apache-2.0**: permite uso comercial, pero conviene verificar los términos de las fuentes de datos originales (WEATHER-5K) recogidos en `DATA_SOURCES.md` antes de explotarlo comercialmente.
- **Sin métricas de latencia ni throughput**: no se han publicado cifras de rendimiento en inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/atlas-5k-v2a
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- README de la serie Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie completa: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Paper "Grow, Don't Restart": https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/paper4/Atlas5K_growth_preprint.pdf
- Fuentes y términos de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Versión anterior (#55 Atlas-5K v1): https://huggingface.co/paradoxailab/atlas-5k-v1
- Versión siguiente (#57 Atlas-5K v2c, adoptada): https://huggingface.co/paradoxailab/atlas-5k-v2c
- Colección de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del laboratorio: https://paradoxailab.com
