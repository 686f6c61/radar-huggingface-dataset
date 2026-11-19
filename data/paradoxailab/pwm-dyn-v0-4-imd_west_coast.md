# paradoxailab/pwm-dyn-v0.4-imd_west_coast

## Resumen

PWM-Dyn v0.4 (identificador `pwm-dyn-v0.4-imd_west_coast`) es un modelo de prediccion espacio-temporal de precipitacion desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) como parte de la serie Paradox World Model. Se trata del modelo numero 4 de 56 publicados y esta especializado en la prediccion de los proximos dias de lluvia en rejilla para la region de Konkan y los Ghats Occidentales de la India, a partir de datos IMD de precipitacion diaria en rejilla de 0,25 grados cubriendo el periodo 2000-2024.

El modelo es extremadamente compacto: 352.117 parametros, lo que lo situa en la categoria de modelos ligeros para series temporales. Su relevancia radica en la combinacion de un tamano minimo con calibracion split-conformal, que en esta version eleva la cobertura del intervalo del 80% desde el 54,7% de la version v0.3 hasta el 84,7%, acercandose al nivel nominal. Reporta un MAE de 3,41 mm/dia en el conjunto de test de ParadoxBench-1 Track A usando un ensemble de 3 semillas (el archivo publicado corresponde a la semilla 0).

La publicacion es reciente (creada el 18 de noviembre de 2026) y el repositorio tiene un tamano de 0,0 GB, con cero descargas y cero likes en el momento de la consulta, lo que indica que es un lanzamiento nuevo y con poca traccion todavia. El modelo se distribuye bajo licencia Apache-2.0 y esta pensado para integrarse en pipelines de prediccion meteorologica regional mediante PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub del autor; no detallado en la model card) |
| Parametros totales | 352.117 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (modelo numerico de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, state dict dentro de un checkpoint con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de indicar que es un modelo de prediccion espacio-temporal de precipitacion y que el codigo de arquitectura se encuentra en el repositorio GitHub del autor. El checkpoint incluye la configuracion de entrenamiento en la clave `ck['cfg']`, pero el contenido de esa configuracion no se reproduce en la informacion disponible. No se especifica si se trata de un transformer, una CNN espacio-temporal, un modelo recurrente o una arquitectura hibrida.

Los datos de entrenamiento son la precipitacion diaria en rejilla IMD a 0,25 grados para Konkan y los Ghats Occidentales, cubriendo 2000-2024. El entrenamiento se realizo el 1 de noviembre de 2026 en un cuaderno de Kaggle (version 364310290). No se indica el numero de tokens ni la composicion exacta del dataset mas alla de la fuente y la region. La innovacion tecnica destacable de esta version es la incorporacion de calibracion split-conformal para los intervalos de prediccion, que mejora la cobertura empirica del 80% desde el 54,7% (v0.3) hasta el 84,7%. No se menciona RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Prediccion de los proximos dias de precipitacion diaria en rejilla de 0,25 grados para la region Konkan / Ghats Occidentales de la India.
- Generacion de intervalos de prediccion calibrados mediante split-conformal (cobertura del 80% reportada del 84,7%).
- Modelo de ensemble: el resultado reportado de MAE 3,41 mm/dia corresponde a un ensemble de 3 semillas; el archivo publicado es la semilla 0.
- Carga directa en PyTorch mediante `torch.load` con `weights_only=False`, exponiendo metadatos, pesos, resultados y configuracion.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No se documentan capacidades multilingues (el modelo opera sobre datos numericos de precipitacion, no sobre texto).

## Casos de uso

- Prediccion operativa de lluvia regional: el modelo puede generar los proximos dias de precipitacion en rejilla para Konkan y los Ghats Occidentales, adecuado para alimentar boletines meteorologicos regionales con un coste computacional minimo (352.117 parametros).
- Gestion de riesgos de inundacion y deslizamientos: la prediccion de precipitacion diaria con intervalos calibrados al 80% permite estimar la incertidumbre en zonas propensas a deslizamientos en los Ghats Occidentales, donde la cobertura del intervalo es un factor critico para la toma de decisiones.
- Investigacion climatica regional: el modelo puede usarse como baseline reproducible en estudios de downscaling o de variabilidad de la precipitacion en la costa oeste de la India, dado que el checkpoint incluye la configuracion (`ck['cfg']`) y los resultados registrados.
- Integracion en pipelines de series temporales: al ser un modelo PyTorch ligero, puede incorporarse en pipelines de forecasting con `torch.load` y ejecutarse en CPU, lo que facilita su despliegue en entornos con recursos limitados.
- Ensemble multi-semilla: dado que el resultado reportado usa 3 semillas, el modelo puede combinarse con otras semillas de la misma version para reducir la varianza de la prediccion en aplicaciones de investigacion.
- Benchmarking de metodos de calibracion: la mejora documentada de cobertura conformal (54,7% a 84,7%) convierte al modelo en un caso de estudio util para evaluar tecnicas de calibracion de intervalos en prediccion espacio-temporal.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1 Track A (test) | MAE | 3,41 mm/dia | Ensemble de 3 semillas; el archivo publicado es la semilla 0 |
| Cobertura del intervalo al 80% (lluvia) | Cobertura empirica | 84,7% | Mejora desde 54,7% en v0.3 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El checkpoint ocupa 1.434.481 bytes (aproximadamente 1,4 MB) y el modelo tiene 352.117 parametros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100, H100 ni RTX 4090. Una GPU integrada o una CPU estandar pueden ejecutar la inferencia.
- Cabe en GPU consumer: si, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.), y tambien en CPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` con `map_location="cpu"`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.4 (este modelo) | 352.117 | no disponible | Prediccion de precipitacion en rejilla (India, Konkan/Ghats Occidentales) | Apache-2.0 | Hugging Face (0 descargas) |
| PWM-Dyn v0.4 (imd_central_india) | no disponible | no disponible | Prediccion de precipitacion en rejilla (India central) | Apache-2.0 | Hugging Face (modelo #03 de la serie) |
| PWM-Dyn v0.4.1 (pems08) | no disponible | no disponible | Prediccion espacio-temporal (PEMS08, trafico) | Apache-2.0 | Hugging Face (modelo #05 de la serie) |

No se dispone de informacion sobre modelos comparables de otros autores en la informacion proporcionada. Las alternativas mas directas son los modelos adyacentes de la propia serie Paradox World Model, pero sus especificaciones completas no estan disponibles en esta ficha.

## Limitaciones y advertencias

- Especificidad geografica: el modelo esta entrenado exclusivamente para Konkan / Ghats Occidentales; su uso en otras regiones no esta validado.
- Cobertura de intervalo imperfecta: aunque la cobertura del 80% sube al 84,7%, sigue por encima del nivel nominal, lo que indica cierta sobrecobertura que puede infraestimar la incertidumbre real en algunos regimenes.
- Tamano de muestra limitado: el resultado reportado corresponde a un ensemble de 3 semillas; el archivo publicado es solo la semilla 0, por lo que el rendimiento individual puede diferir del reportado.
- Falta de documentacion: la arquitectura, el contexto, la composicion exacta del dataset y los detalles de entrenamiento no estan detallados en la model card; el codigo esta en GitHub pero no se reproduce aqui.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de predicciones espurias fuera de la distribucion de entrenamiento (eventos extremos no vistos en 2000-2024).
- Licencia Apache-2.0: permite uso comercial, pero se recomienda citar mediante `CITATION.cff` y revisar los terminos de las fuentes de datos en `DATA_SOURCES.md`.
- Datos de entrenamiento no incluidos: el repositorio no distribuye los datos IMD originales; su uso esta sujeto a los terminos de la fuente.
- Madurez: modelo con 0 descargas y 0 likes; no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-dyn-v0.4-imd_west_coast
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- README de ParadoxBench v0.4: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.4-paradoxbench/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#03): https://huggingface.co/paradoxailab/pwm-dyn-v0.4-imd_central_india
- Modelo siguiente (#05): https://huggingface.co/paradoxailab/pwm-dyn-v0.4.1-pems08
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio web: https://paradoxailab.com
