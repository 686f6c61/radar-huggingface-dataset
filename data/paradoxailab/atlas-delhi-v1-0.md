# paradoxailab/atlas-delhi-v1.0

## Resumen
Atlas-Delhi v1.0 es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de su serie Paradox World Model, identificado como el modelo numero 34 de 56 publicados. Su tarea concreta es pronosticar las proximas 24 horas de concentracion de PM2.5 en estaciones de monitorizacion de calidad del aire en Delhi, a partir de los datos horarios de 39 estaciones de monitorizacion continua de la red CPCB (Central Pollution Control Board) recogidos en el conjunto OpenCity "Delhi Hourly Air Quality Reports". El modelo es extremadamente compacto: 967.632 parametros, empaquetados en un unico checkpoint PyTorch de aproximadamente 3,99 MB.

La relevancia de este modelo no reside en su tamano ni en su rendimiento absoluto, sino en su caracter de artefacto de investigacion reproducible: la model card documenta explicitamente que el modelo pierde frente a TimesFM 2.5 (MAE de 33,42 frente a 30,83 en estaciones vistas, una desventaja del 8,4 %), algo poco habitual en fichas de modelos. La arquitectura Atlas combina estado de estacion aprendido, atencion sobre geometria (posiciones relativas de las estaciones), pasos latentes y un decodificador de cuantiles, orientada a la prediccion espacio-temporal con incertidumbre.

Al tratarse de un modelo especializado de forecasting y no de un modelo de lenguaje, las capacidades que se evaluan aqui son las propias de una serie temporal: horizonte de 24 horas, salida por cuantiles y generalizacion a estaciones no vistas durante el entrenamiento. La licencia Apache-2.0 permite uso comercial, pero el rendimiento queda por debajo de un baseline establecido, lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Atlas (estado de estacion aprendido, atencion sobre geometria, pasos latentes, decodificador de cuantiles) |
| Parametros totales | 967.632 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada no documentada; horizonte de prediccion de 24 horas) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision original) |
| Idiomas soportados | no disponible (modelo numerico, sin entrada de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint con `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento
El modelo emplea la arquitectura Atlas, descrita en la model card como una combinacion de cuatro componentes: un estado de estacion aprendido (representacion latente por estacion que se actualiza con el contexto), atencion sobre la geometria (las relaciones espaciales entre las 39 estaciones de Delhi se incorporan como sesgo de atencion), pasos latentes (procesamiento iterativo en el espacio latente antes de la decodificacion) y un decodificador de cuantiles que produce predicciones probabilisticas en lugar de un unico valor puntual. El checkpoint incluye la configuracion de entrenamiento completa en `ck['cfg']`, y el codigo de la arquitectura esta en el repositorio GitHub del proyecto.

Los datos de entrenamiento proceden de las 39 estaciones de calidad del aire de Delhi de la red CPCB, con granularidad horaria. La model card indica que los datos de entrenamiento no se distribuyen con el modelo, pero sus fuentes y terminos se detallan en `DATA_SOURCES.md` del repositorio. El entrenamiento se realizo el 12 de noviembre de 2026 en la ejecucion Kaggle "atlas-delhi v2", con tres semillas. No se documentan en la informacion disponible el volumen de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (lo que seria inusual en este tipo de modelo).

## Capacidades
- Prediccion de las proximas 24 horas de PM2.5 con granularidad horaria en estaciones de monitorizacion.
- Salida probabilistica mediante decodificador de cuantiles, permitiendo intervalos de prediccion en lugar de solo estimaciones puntuales.
- Generalizacion a estaciones no vistas durante el entrenamiento (evaluada explicitamente en la model card con la metrica "unseen stations").
- Modelado espacio-temporal conjunto: aprovecha la geometria y correlaciones entre las 39 estaciones de Delhi.
- Estado de estacion aprendido que permite adaptar el comportamiento del modelo a cada ubicacion.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingues: es un modelo numerico de series temporales, no un modelo de lenguaje.

## Casos de uso
- Investigacion academica sobre prediccion de calidad del aire: el checkpoint incluye metadatos, configuracion y resultados completos de las tres semillas, lo que permite reproducir y auditar el experimento con un coste computacional minimo (menos de 1 millon de parametros).
- Baseline de referencia en experimentos de forecasting espacio-temporal: util como punto de comparacion compacto frente a modelos fundacionales de series temporales como TimesFM.
- Estudio de generalizacion a estaciones nuevas: la evaluacion separada en estaciones vistas y no vistas permite analizar como se comporta un modelo de 967.632 parametros ante ubicaciones sin historial de entrenamiento.
- Prototipado rapido de sistemas de alerta de contaminacion: con un checkpoint de 4 MB, se puede desplegar en CPU para generar predicciones de 24 horas y evaluar la viabilidad de un pipeline de alertas antes de invertir en modelos mayores.
- Analisis de incertidumbre en prediccion ambiental: el decodificador de cuantiles facilita estudiar la calibracion de intervalos de prediccion en series con alta variabilidad como el PM2.5.
- Docencia y demostraciones de arquitecturas de forecasting: el codigo publico, la configuracion embebida y el tamano reducido lo convierten en un ejemplo didactico de modelo con atencion geometrica y salida probabilistica.

## Benchmarks y rendimiento
Los unicos resultados publicados en la informacion disponible son los de la model card:

| Metrica | Atlas-Delhi v1.0 | TimesFM 2.5 | Diferencia |
|---|---|---|---|
| MAE, estaciones vistas (media de 3 semillas) | 33,42 | 30,83 | +8,4 % (peor) |
| MAE, estaciones no vistas (media de 3 semillas) | 29,07 | no disponible | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de forecasting de series temporales.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 3.994.789 bytes (aproximadamente 3,99 MB) y el modelo tiene 967.632 parametros, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: innecesarias para la inferencia; cualquier CPU moderna es suficiente. Una GPU consumer (por ejemplo, RTX 3060 o superior) solo aportaria ventaja marginal en lotes grandes.
- Cabe en cualquier GPU consumer, incluida la gama integrada y GPUs de portatil de gama baja.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` sobre el checkpoint `.pt`), tal como documenta la model card. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / horizonte | MAE (estaciones vistas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Atlas-Delhi v1.0 | 967.632 | Forecasting PM2.5 en Delhi | Horizonte 24 h | 33,42 | Apache-2.0 | Hugging Face (checkpoint `.pt`) |
| TimesFM 2.5 | no disponible en la informacion | Forecasting de series temporales fundacional | no disponible | 30,83 | no disponible | no disponible |
| Atlas-Delhi v1.1 | no disponible | Forecasting PM2.5 en Delhi | Horizonte 24 h | no disponible | Apache-2.0 (segun serie) | Hugging Face |

La comparativa se limita a TimesFM 2.5, unico modelo con resultado numerico citado en la model card, y a la version siguiente de la propia serie (Atlas-Delhi v1.1). No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias
- Rendimiento inferior al baseline: pierde frente a TimesFM 2.5 con un MAE de 33,42 frente a 30,83 (+8,4 %) en estaciones vistas, lo que desaconseja su uso como solucion principal en produccion frente a alternativas mas potentes.
- Dominio muy restringido: entrenado exclusivamente para PM2.5 horario en 39 estaciones de Delhi; no es transferible directamente a otros contaminantes, ciudades o granularidades temporales sin reentrenamiento.
- Datos de entrenamiento no incluidos: la model card no distribuye los datos, solo referencia sus fuentes y terminos, lo que limita la reproducibilidad completa del experimento.
- Riesgo de extrapolacion: al ser un modelo de 967.632 parametros con estado de estacion aprendido, su comportamiento ante regimenes no observados (episodios extremos de contaminacion, estaciones nuevas con historial corto) no esta documentado; la evaluacion en estaciones no vistas (MAE 29,07) sugiere cierta robustez, pero sin comparacion con baseline.
- Sesgos potenciales: los sesgos de los datos CPCB de Delhi (distribucion geografica de estaciones, calidad de sensores, huecos en series) se trasladan al modelo; no se documenta ningun analisis de sesgo.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero las predicciones probabilisticas pueden estar mal calibradas; no se publican metricas de calibracion de cuantiles.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar los terminos de las fuentes de datos originales (OpenCity, CPCB) recogidos en `DATA_SOURCES.md` antes de un uso comercial de las predicciones.
- Modelo de investigacion: la model card lo etiqueta como "reported" dentro de una serie de 56 modelos; no hay garantia de mantenimiento ni de soporte a largo plazo.

## Enlaces
- Hugging Face: https://huggingface.co/paradoxailab/atlas-delhi-v1.0
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Registro de la version (reglas, predicciones y resultados): https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Indice de la serie completa: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes y terminos de los datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior de la serie (#36): https://huggingface.co/paradoxailab/pwm-f-encoder-v2.1
- Modelo siguiente de la serie (#38): https://huggingface.co/paradoxailab/atlas-delhi-v1.1
- Listado completo de modelos: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio web del laboratorio: https://paradoxailab.com
