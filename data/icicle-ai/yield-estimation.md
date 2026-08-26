# ICICLE-AI/yield-estimation

## Resumen

ICICLE-AI/yield-estimation es un modelo transformer de regresion desarrollado por el ICICLE AI Institute (financiado por la NSF, OAC 2112606) para la estimacion de rendimiento de maiz a nivel de condado en Estados Unidos. El modelo combina series temporales de observaciones meteorologicas semanales con propiedades estaticas del suelo para predecir el rendimiento del maiz en bushels por acre (bu/acre). Esta disenado para estimacion en temporada, lo que permite realizar predicciones parciales con ventanas de observacion de 20 a 52 semanas.

El modelo es extremadamente ligero, con solo 181.185 parametros, y se distribuye en formato safetensors. Para su despliegue, se expone a traves del pipeline `text-classification` de Hugging Face como interfaz de compatibilidad con FlexServ, aunque la tarea subyacente es de regresion. El modelo requiere codigo personalizado (`trust_remote_code=True`) para su carga, ya que incluye un tokenizador y una arquitectura propios que serializan entradas estructuradas JSON en tensores.

Su relevancia radica en abordar un problema practico de agricultura digital: la prediccion temprana de rendimiento de cultivos, que permite a agricultores, aseguradoras y responsables politicos tomar decisiones informadas antes de la cosecha. El modelo esta publicado bajo licencia MIT y cuenta con codigo de entrenamiento completo en su repositorio de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer personalizado (codigo custom, arquitectura detallada no publicada) |
| Parametros totales | 181.185 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 52 semanas de datos meteorologicos (ventana temporal) |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | No aplica (entrada estructurada numerica, no texto natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer personalizado definido en `modeling_yield.py`, disenado especificamente para modelado multi-temporal de datos meteorologicos. El modelo acepta seis variables meteorologicas semanales (`prcp`, `srad`, `swe`, `tmax`, `tmin`, `vp`) junto con 66 caracteristicas estaticas de suelo definidas en `config.json`. El tokenizador personalizado (`tokenization_yield.py`) serializa la entrada JSON estructurada en tensores de weather, soil, crop y cutoff.

El entrenamiento se realizo sobre el USA County Level Crop Yield Dataset, descrito en el articulo de Khaki, Wang y Archontoulis (2020) "A CNN-RNN Framework for Crop Yield Prediction" (Frontiers in Plant Science). El modelo soporta cutoffs de prediccion en las semanas 20, 24, 28, 32, 36, 40, 44, 48 y 52, donde un cutoff de 52 representa la inferencia de temporada completa. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO, al tratarse de una tarea de regresion supervisada.

## Capacidades

- Estimacion de rendimiento de maiz a nivel de condado en bu/acre mediante regresion.
- Procesamiento de series temporales meteorologicas semanales (precipitacion, radiacion solar, equivalente de agua de nieve, temperaturas maxima y minima, presion de vapor).
- Integracion de 66 caracteristicas estaticas de suelo en la prediccion.
- Prediccion en temporada con cutoffs configurables (semanas 20 a 52), permitiendo estimaciones parciales antes de la cosecha.
- Interfaz de inferencia compatible con FlexServ mediante pipeline `text-classification` de Hugging Face.
- Serializacion de entradas estructuradas JSON a traves de tokenizador personalizado.
- No soporta generacion de texto, tool calling, agentes, vision ni capacidades multilingues: es un modelo de regresion numerica especializado.

## Casos de uso

- Planificacion agricola en temporada: los agricultores pueden estimar el rendimiento esperado de maiz en su condado con 20 a 52 semanas de datos meteorologicos, ajustando insumos (fertilizantes, riego) antes de la cosecha.
- Gestion de riesgos en seguros agricolas: las aseguradoras pueden evaluar el rendimiento esperado por condado para calibrar primas y detectar reclamaciones anomalas, gracias a la prediccion parcial en temporada.
- Politica agricola y seguridad alimentaria: los responsables publicos pueden monitorizar la produccion de maiz por condado durante la temporada de cultivo y anticipar escaseces o excedentes regionales.
- Optimizacion de la cadena de suministro: los comercializadores de grano pueden prever la oferta regional de maiz semanas antes de la cosecha, planificando logistica, almacenamiento y contratos de compra.
- Investigacion agronomica: los cientificos pueden estudiar la relacion entre variables meteorologicas y de suelo con el rendimiento final, utilizando el modelo como baseline para experimentos con arquitecturas alternativas.
- Despliegue en infraestructura HPC: el modelo esta validado para FlexServ, lo que permite integrarlo en pipelines de inferencia sobre recursos de computacion de altas prestaciones en entornos de agricultura digital.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye metricas de evaluacion (RMSE, MAE, R²) ni comparaciones cuantitativas con otros modelos de estimacion de rendimiento. El articulo de referencia (Khaki et al., 2020) reporta resultados para su framework CNN-RNN, pero no se especifica si el modelo ICICLE-AI reproduce o supera esas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 181.185 parametros, el modelo cabe en cualquier GPU moderna e incluso en CPU sin problemas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060 o superior ofrece margen amplio. Tambien es viable la inferencia en CPU pura.
- Compatibilidad con GPU de consumo: si, cualquier GPU consumer (RTX 3060, RTX 4090, etc.) ejecuta el modelo sin limitaciones.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`, FlexServ, o exportacion a ONNX para inferencia en CPU/GPU. No se ha confirmado compatibilidad con vLLM, llama.cpp u Ollama, dado que el modelo requiere codigo personalizado.
- Latencia y throughput: no disponibles. Dado el tamano del modelo, se espera una latencia de milisegundos por inferencia en GPU y de decenas de milisegundos en CPU, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ICICLE-AI/yield-estimation | 181.185 | Regresion de rendimiento de maiz | 52 semanas | MIT | Hugging Face |
| Khaki et al. CNN-RNN (2020) | no disponible | Regresion de rendimiento de maiz | Serie temporal | no disponible | Codigo del articulo |
| Modelos de estimacion de rendimiento basados en CNN/LSTM convencionales | tipicamente 10⁶-10⁷ | Regresion de rendimiento | Variable | variable | Variable |

No se dispone de informacion suficiente sobre modelos comparables directamente disponibles en Hugging Face con la misma tarea y formato de entrada. El modelo se distingue por su tamano extremadamente reducido (181K parametros) frente a los modelos de deep learning agricola convencionales, que suelen tener millones de parametros.

## Limitaciones y advertencias

- Alcance geografico limitado: el modelo esta entrenado exclusivamente con datos de condados de Estados Unidos; su aplicacion a otras regiones con climas o suelos diferentes no esta validada.
- Cultivo unico: solo estima rendimiento de maiz; no soporta otros cultivos sin reentrenamiento.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True` en Hugging Face, lo que implica ejecutar codigo arbitrario del repositorio; se recomienda auditar el codigo antes de usarlo en produccion.
- Interfaz de clasificacion de texto atipica: el uso del pipeline `text-classification` para una tarea de regresion puede confundir a integradores; el `score` devuelto es un valor de rendimiento en bu/acre, no una probabilidad.
- Formato de entrada rigido: la entrada debe serializarse como JSON con la estructura exacta esperada (seis variables meteorologicas con 52 valores semanales y 66 caracteristicas de suelo); errores de formato provocaran fallos de inferencia.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero como modelo de regresion puede producir predicciones fuera de rango si los datos de entrada estan fuera de la distribucion de entrenamiento.
- Sesgos: el modelo hereda los sesgos del dataset de condados de EE. UU., que puede no representar adecuadamente condados con pocos datos historicos o practicas agricolas atipicas.
- Documentacion limitada: no se publican metricas de evaluacion, detalles de hiperparametros ni analisis de errores, lo que dificulta la evaluacion rigurosa del modelo antes de su adopcion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ICICLE-AI/yield-estimation
- Repositorio GitHub: https://github.com/ICICLE-ai/yield_estimation
- Documentacion de FlexServ: https://zhangwei217245.github.io/FlexServ/
- Proyecto ICICLE Smart CI for Democratized Digital Agriculture: https://icicle.osu.edu/smart-ci-democratized-digital-agriculture-project
- Catalogo de entrenamiento ICICLE (Harvest): https://icicle-ai.github.io/training-catalog/docs/Harvest
- Articulo de referencia (Khaki et al., 2020): https://doi.org/10.3389/fpls.2019.01750
