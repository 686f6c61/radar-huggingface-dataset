# PARADOXAIlabs/pwm-dyn-v0.4-imd_west_coast

## Resumen

PWM-Dyn v0.4 (identificador `imd_west_coast`) es un modelo de predicción de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de su serie Paradox World Model, en concreto la entrega número 4 de 56 modelos publicados. Su tarea específica es la predicción de precipitación diaria en rejilla para los días siguientes sobre la región de Konkan y los Ghats Occidentales de la India, a partir de los datos IMD de precipitación diaria en rejilla de 0,25° de resolución para el período 2000-2024.

Se trata de un modelo de escala muy reducida: 352.117 parámetros totales, con un único fichero de pesos PyTorch de aproximadamente 1,4 MB. No es un modelo de lenguaje ni un transformer generativo de propósito general, sino un modelo especializado de pronóstico meteorológico regional. Su relevancia radica en la combinación de un tamaño extremadamente contenido con calibración por split-conformal, que en esta versión mejora la cobertura del intervalo del 80 % desde el 54,7 % de la versión v0.3 hasta el 84,7 %.

El modelo se distribuye bajo licencia Apache-2.0 y se publica junto con su código de arquitectura en el repositorio GitHub del proyecto, aunque los datos de entrenamiento no se incluyen. Está pensado para integrarse en pipelines de investigación meteorológica o de evaluación comparativa (ParadoxBench-1, Track A) más que para despliegues de producción a gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (código en repositorio GitHub del proyecto) |
| Parámetros totales | 352.117 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en punto flotante PyTorch; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no aplica (modelo numérico de series temporales, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoint con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no describe explícitamente la arquitectura interna; indica únicamente que el código correspondiente a esta versión está en el repositorio GitHub `paradoxailab/paradox-world-model` y que la configuración de entrenamiento se almacena en el propio fichero de pesos bajo la clave `ck['cfg']`. Por la naturaleza de la tarea (predicción de rejilla espaciotemporal de precipitación) y el número de parámetros (352.117), se trata de un modelo compacto especializado, no de un transformer de gran escala.

Los datos de entrenamiento son la precipitación diaria en rejilla IMD a 0,25° para Konkan y los Ghats Occidentales durante el período 2000-2024. El modelo se entrenó el 1 de noviembre de 2026 en un notebook de Kaggle (identificador `0387a11c3a`, versión 364310290). La innovación técnica destacada en esta versión es la incorporación de los tracks de ParadoxBench-1 y de calibración por split-conformal, que mejora sustancialmente la cobertura empírica de los intervalos de predicción (del 54,7 % al 84,7 % para el nivel nominal del 80 %). No se documentan detalles sobre volumen de tokens, composición exacta del dataset, ni uso de RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Predicción de precipitación diaria en rejilla a 0,25° para los días siguientes sobre Konkan y los Ghats Occidentales.
- Generación de intervalos de predicción calibrados mediante split-conformal (cobertura empírica del 80 % nominal: 84,7 % en esta versión).
- Evaluación estandarizada en ParadoxBench-1, Track A (MAE de 3,41 mm/día en test con ensemble de 3 semillas; este fichero corresponde a la semilla 0).
- Ejecución en CPU: el checkpoint se carga con `map_location="cpu"` y el tamaño (1,4 MB) permite inferencia sin GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo numérico de pronóstico, no un modelo de lenguaje.
- No dispone de modo "thinking", visión, audio ni otras capacidades multimodales.

## Casos de uso

- Investigación en predicción meteorológica regional: el modelo sirve como referencia compacta para comparar metodologías de pronóstico de precipitación sobre los Ghats Occidentales, con una métrica pública (MAE 3,41 mm/día) y un benchmark reproducible (ParadoxBench-1 Track A).
- Evaluación de calibración de intervalos: dado que implementa split-conformal con cobertura empírica del 84,7 % frente al 80 % nominal, es útil como caso de estudio para validar técnicas de calibración en series temporales espaciales.
- Prototipado rápido en entornos sin GPU: con 352.117 parámetros y 1,4 MB de pesos, se puede cargar y ejecutar en CPU en cualquier portátil, lo que facilita experimentos iterativos y pruebas de integración.
- Educación y docencia: sirve como ejemplo mínimo y reproducible de un pipeline completo de pronóstico espaciotemporal (carga de datos IMD, entrenamiento, evaluación con benchmark y calibración conformal).
- Análisis de riesgos hidrológicos a escala local: la predicción de precipitación diaria en rejilla a 0,25° puede alimentar modelos aguas abajo de escorrentía o de alerta temprana en la costa occidental de la India, siempre con validación adicional.
- Reproducibilidad y auditoría de series de modelos: al formar parte de una serie de 56 modelos con resultados registrados en `RESULTS.md`, permite trazar la evolución de versiones (v0.3 → v0.4 → v0.4.1) y auditar cambios metodológicos.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Contexto |
|---|---|---|---|
| ParadoxBench-1 Track A (test) | MAE | 3,41 mm/día | Ensemble de 3 semillas; este fichero es la semilla 0 |
| Cobertura del intervalo del 80 % (v0.4) | Cobertura empírica | 84,7 % | Frente al 54,7 % de v0.3 |
| Cobertura del intervalo del 80 % (v0.3) | Cobertura empírica | 54,7 % | Versión anterior |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, ya que el modelo no es de lenguaje. Tampoco se ofrecen métricas adicionales (RMSE, sesgo, etc.) más allá del MAE y la cobertura citados.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el checkpoint ocupa 1,4 MB y se carga en CPU (`map_location="cpu"`).
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente. Si se desea, cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.) sin restricción.
- Cabe en GPU consumer: sí, en todas, con un consumo de memoria despreciable.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) y `huggingface_hub.hf_hub_download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en CPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.4 `imd_west_coast` | 352.117 | no disponible | MAE 3,41 mm/día (ParadoxBench-1 Track A) | Apache-2.0 | Hugging Face |
| PWM-Dyn v0.4 `imd_central_india` (#03) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |
| PWM-Dyn v0.4.1 `pems08` (#05) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de información sobre modelos de terceros comparables en la documentación proporcionada; la comparativa se limita a las entregas adyacentes de la misma serie, cuyos resultados detallados están en `RESULTS.md` del repositorio.

## Limitaciones y advertencias

- Dominio muy restringido: solo predice precipitación diaria en rejilla a 0,25° sobre Konkan y los Ghats Occidentales; no es extrapolable a otras variables, regiones ni resoluciones sin reentrenamiento.
- Cobertura de calibración imperfecta: aunque mejora respecto a v0.3, la cobertura empírica del 84,7 % para un intervalo nominal del 80 % indica sobrecobertura; conviene revisar la calibración en producción.
- Resultado reportado por el autor: el MAE de 3,41 mm/día corresponde a un ensemble de 3 semillas, pero este fichero es solo la semilla 0; el rendimiento individual puede diferir del reportado en ensemble.
- Datos de entrenamiento no incluidos: la model card remite a `DATA_SOURCES.md` para fuentes y términos; la reproducibilidad completa depende de acceder a los datos IMD originales.
- Sin documentación de sesgos: no se detallan sesgos conocidos, pero al entrenar sobre una región y período concretos (2000-2024) puede degradarse ante regímenes climáticos no representados.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí riesgo de predicciones no físicas fuera del rango de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la licencia de los datos IMD subyacentes antes de un uso comercial derivado.
- Ausencia de métricas adicionales (RMSE, sesgo, habilidad frente a persistencia o climatología) que permitan una evaluación completa en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4-imd_west_coast
- Serie completa: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Versión anterior (#03, IMD central India): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4-imd_central_india
- Versión siguiente (#05, PEMS08): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4.1-pems08
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- README de ParadoxBench v0.4: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.4-paradoxbench/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Sitio del laboratorio: https://paradoxailab.com
