# DTanzillo/panacea-models

## Resumen

Panacea es un repositorio de modelos de aprendizaje automatico para la evaluacion de conjunciones orbitales, es decir, la estimacion del riesgo de colision entre satelites y objetos en orbita. Lo desarrolla Dominic Tanzillo (DTanzillo) y se distribuye bajo licencia Apache 2.0. El repositorio contiene tres modelos complementarios: un baseline estadistico por capas de altitud, un modelo XGBoost sobre caracteristicas de mensajes de datos de conjuncion (CDM) y un Temporal Fusion Transformer con informacion fisica (PI-TFT). Todos se entrenan con el dataset de CDM de ESA Kelvins, y el modelo PI-TFT se reajusta semanalmente utilizando detecciones de maniobras de la constelacion Starlink como etiquetas proxy.

La relevancia del proyecto reside en que aborda un problema critico de seguridad espacial con modelos ligeros e interpretables, adecuados para su despliegue en operaciones de vigilancia orbital. No se trata de un modelo de lenguaje, sino de un conjunto de clasificadores especializados en la prediccion de colisiones. El repositorio ocupa 0.1 GB e incluye los pesos en formatos JSON, PKL y PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres modelos: baseline estadistico, XGBoost (gradient-boosted trees) y PI-TFT (Temporal Fusion Transformer con informacion fisica) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (`baseline.json`), Pickle (`xgboost.pkl`), PyTorch (`transformer.pt`) |

## Arquitectura y entrenamiento

El repositorio contiene tres modelos de distinta complejidad. El primero, denominado "Orbital Shell Baseline", es un modelo estadistico que calcula tasas de colision por intervalos de altitud. El segundo es un clasificador XGBoost entrenado sobre caracteristicas extraidas de los mensajes de datos de conjuncion (CDM) del dataset de ESA Kelvins. El tercero es un Physics-Informed Temporal Fusion Transformer (PI-TFT), una variante del TFT que incorpora restricciones o variables fisicas orbitales en su arquitectura.

Los datos de entrenamiento provienen del dataset de CDM de ESA Kelvins, una recopilacion de mensajes de datos de conjuncion generados por el sistema de alerta de la ESA. El modelo PI-TFT se reajusta automaticamente cada semana utilizando detecciones de maniobras de la constelacion Starlink como etiquetas proxy, lo que permite adaptar el modelo a la evolucion del entorno orbital. No se especifican el numero de tokens ni el volumen exacto del dataset, ni tampoco el uso de tecnicas como RLHF o DPO, que no aplican en este contexto.

## Capacidades

- Prediccion de probabilidad de colision entre satelites y objetos de desecho a partir de mensajes de datos de conjuncion (CDM).
- Clasificacion del riesgo de conjuncion con salida numerica (probabilidad o score) utilizable como umbral en sistemas de alerta.
- Modelo XGBoost con alto rendimiento (AUC-PR 0.988) sobre caracteristicas tabulares de CDM.
- Modelo PI-TFT con capacidad de modelar series temporales de parametros orbitales y de integrar informacion fisica en la prediccion.
- Reentrenamiento automatico periodico para adaptarse a cambios en el entorno orbital.
- No es un modelo generativo: no produce texto, codigo ni respuestas conversacionales.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de los LLM.

## Casos de uso

- Monitorizacion de seguridad espacial: el modelo XGBoost puede integrarse en un pipeline de vigilancia que procesa CDM entrantes y genera alertas de riesgo en tiempo real, con una AUC-PR de 0.988 que permite filtrar eventos de alto riesgo con baja tasa de falsos positivos.

- Soporte de decisiones de maniobra de evasion: el modelo PI-TFT, al incorporar informacion fisica y datos temporales, puede utilizarse para predecir la evolucion del riesgo en las proximas horas y recomendar ventanas de maniobra optimas para satelites operacionales.

- Analisis de riesgo de desbris espacial: el baseline por capas de altitud permite estimar tasas de colision esperadas en diferentes rangos orbitales, util para estudios de sostenibilidad orbital y planificacion de misiones.

- Automatizacion de alertas tempranas: combinando los tres modelos, se puede construir un sistema de clasificacion en cascada donde el baseline filtra eventos de bajo riesgo, el XGBoost refina la seleccion y el PI-TFT profundiza en los casos criticos.

- Reajuste continuo en operaciones: el mecanismo de fine-tuning semanal con datos de Starlink permite que el modelo PI-TFT se adapte a cambios en la configuracion de la constelacion y a la evolucion de la poblacion de desbris, manteniendo la precision a lo largo del tiempo.

- Investigacion en fisica orbital: el modelo PI-TFT, al incorporar informacion fisica en la arquitectura, puede servir como herramienta de estudio para entender como las variables orbitales afectan al riesgo de colision, facilitando la validacion de hipotesis sobre mecanica orbital.

## Benchmarks y rendimiento

La informacion disponible reporta la metrica AUC-PR (area bajo la curva precision-recall) para cada modelo:

| Modelo | AUC-PR |
|---|---|
| Orbital Shell Baseline | 0.061 |
| XGBoost | 0.988 |
| PI-TFT | 0.511 |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval o GSM8K) en la informacion disponible, ya que no se trata de un modelo de lenguaje. Tampoco se han publicado comparativas con otros sistemas de evaluacion de conjunciones.

## Requisitos de hardware

- Tamano total del repositorio: 0.1 GB, lo que lo hace muy ligero en comparacion con modelos de lenguaje.
- El modelo XGBoost (fichero `xgboost.pkl`) se puede ejecutar en CPU con memoria RAM del orden de cientos de MB; no requiere GPU.
- El baseline (`baseline.json`) es un archivo de configuracion estadistica que se carga en memoria con un coste minimo.
- El modelo PI-TFT (`transformer.pt`) requiere PyTorch y puede ejecutarse en CPU para inferencia, aunque para reentrenamiento semanal se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3080 o superior).
- Opciones de despliegue: los tres modelos se pueden integrar en un servicio Python con FastAPI o Flask; no se han publicado wrappers especificos para vLLM, llama.cpp u Ollama, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no se han publicado datos concretos. Dado el tamano, se estima una latencia de inferencia inferior a 100 ms por muestra en CPU para el XGBoost y de 1-2 s para el PI-TFT en CPU.

## Comparativa con modelos similares

No hay informacion publicada sobre modelos comparables de evaluacion de conjunciones orbitales en la informacion proporcionada. La busqueda web no ha arrojado resultados relevantes para este modelo concreto; las referencias encontradas corresponden a otros proyectos denominados "Panacea" en el ambito de ensayos clinicos, no relacionados con seguridad espacial. Por tanto, no se puede establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo PI-TFT presenta un AUC-PR de 0.511, significativamente inferior al del XGBoost (0.988), lo que sugiere que su capacidad predictiva es limitada para este dominio concreto y debe usarse con precaucion en decisiones criticas.
- El repositorio no incluye el dataset de entrenamiento ni documentacion detallada sobre el preprocesado de los datos, lo que dificulta la reproducibilidad.
- No se especifican sesgos potenciales del modelo, aunque al entrenarse con datos de ESA y etiquetas de Starlink, el modelo puede estar sesgado hacia la poblacion de satelites de esa constelacion y no generalizar bien a otros tipos de orbita o misiones.
- Riesgo de alucinacion no aplica al no ser un modelo generativo, pero si existe riesgo de errores de clasificacion que podrian llevar a falsos negativos en eventos de alta peligrosidad.
- La licencia Apache 2.0 permite uso comercial, pero no se proporcionan garantias de exactitud ni de idoneidad para operaciones de seguridad critica en produccion.
- No se ha documentado el comportamiento del modelo ante datos fuera de distribucion, como cambios en la politica de maniobras de otras constelaciones o la aparicion de nuevos tipos de desblis.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DTanzillo/panacea-models
- Repositorio de codigo en GitHub: https://github.com/DominicTanzillo/Panacea
- Dataset de ESA Kelvins CDM: no se ha proporcionado enlace directo en la informacion disponible.
- Documentacion de Temporal Fusion Transformer: no se ha proporcionado enlace especifico.
