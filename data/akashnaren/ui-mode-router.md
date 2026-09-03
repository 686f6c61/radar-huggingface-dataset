# akashnaren/ui-mode-router

## Resumen

`ui-mode-router` es un clasificador de texto extremadamente pequeño desarrollado por Akash Premkumar que asigna una petición de usuario a una de cuatro interfaces de agente: `cli`, `structured_api`, `dom_click` o `form`. Está implementado como una regresión logística de scikit-learn, entrenada sobre un conjunto sintético de 100 ejemplos procedentes del dataset `akashnaren/agent-ui-sft`. El autor lo presenta explícitamente como un "juguete de laboratorio" y no como un modelo de producción, con una precisión del 100% en 20 ejemplos de validación fuera de la muestra.

El modelo responde a la idea de enrutar la petición de un agente hacia la interfaz más barata y adecuada antes de invocar herramientas, un concepto inspirado en sistemas como Kimi de Moonshot, aunque sin relación con los pesos de ese modelo. Su relevancia es principalmente didáctica y de prototipado rápido: demuestra cómo un clasificador minimalista puede resolver una tarea de enrutamiento de agentes sin necesidad de un LLM grande. Está liberado bajo licencia Apache-2.0 y es compatible únicamente con el idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (scikit-learn) con vectorizacion de texto |
| Parametros totales | No disponible (modelo de tamano reducido, del orden de miles de pesos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo generativo) |
| Tipos de cuantizacion | No aplica (formato joblib nativo, sin cuantizacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | joblib (fichero `model.joblib`) |

## Arquitectura y entrenamiento

El modelo es un pipeline de scikit-learn compuesto por una vectorizacion de texto (probablemente TF-IDF o CountVectorizer, aunque no se especifica en la documentacion) seguida de una regresion logistica multiclase. Se entrena sobre el dataset `akashnaren/agent-ui-sft`, que contiene 100 filas sinteticas de peticiones de usuario etiquetadas con una de las cuatro clases de interfaz. El autor reporta una precision del 100% sobre 20 ejemplos de validacion retenidos, lo que sugiere un posible sobreajuste dado el escaso volumen de datos. No se menciona ningun proceso de RLHF, DPO ni ajuste fino de un modelo preentrenado; es un clasificador clasico de aprendizaje automatico, no un LLM.

## Capacidades

- Clasificacion de peticiones de usuario en cuatro clases discretas: `cli`, `structured_api`, `dom_click` y `form`.
- Enrutamiento de agentes: dado un texto de entrada, devuelve la interfaz mas adecuada para ejecutar la accion solicitada.
- Inferencia rapida y ligera: al ser una regresion logistica, la prediccion es inmediata y no requiere GPU.
- Integracion sencilla en Python mediante la carga del pipeline con `joblib`.
- Multilingue: no, solo entiende ingles.
- Capacidades generativas: ninguna, no produce texto.

## Casos de uso

- Prototipo educativo para demostrar conceptos de enrutamiento en sistemas de agentes: el modelo sirve como ejemplo minimo de como un clasificador puede decidir entre distintas interfaces de herramienta antes de ejecutar una accion.
- Prueba de concepto para pipelines de agentes: se puede integrar en un sistema de agente sencillo para comprobar la viabilidad de un enrutador basado en reglas estadisticas en lugar de un LLM.
- Experimentacion con datasets sinteticos: util para estudiar el efecto del tamaño del dataset y el sobreajuste en tareas de clasificacion de texto pequenas.
- Benchmark local de velocidad: al ser un modelo de menos de 1 MB, permite medir latencias de inferencia en CPU para comparar con alternativas basadas en redes neuronales.
- Ejemplo de publicacion en Hugging Face: sirve como plantilla para aprender a subir modelos de scikit-learn al Hub, dado que la mayoria de ejemplos usan PyTorch o TensorFlow.
- Integracion en un sistema de agente no critico donde la tasa de error sea aceptable y el volumen de peticiones muy bajo: aunque el autor desaconseja produccion, un despliegue interno de prueba podria validar la idea antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un LLM. El unico dato disponible es la precision de validacion reportada en la model card:

| Metrica | Valor |
|---|---|
| Precision en 20 ejemplos hold-out | 1.000 (100%) |
| Dataset de entrenamiento | 100 filas sinteticas |

No existen comparaciones con otros modelos de la misma categoria en la informacion proporcionada.

## Requisitos de hardware

- Inferencia en CPU: cualquier maquina con Python y scikit-learn puede ejecutar el modelo sin problemas; no requiere GPU.
- Memoria: el repositorio ocupa 0.0 GB (el fichero `model.joblib` es de pocos kilobytes). Consumo de RAM despreciable.
- GPU recomendada: ninguna.
- Compatible con hardware de consumo: si, incluso en Raspberry Pi o entornos embebidos con Python.
- Opciones de despliegue: se puede servir como una funcion Python dentro de un script, una API REST con Flask/FastAPI, o integrarse en un flujo de agentes. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia: del orden de microsegundos por prediccion en CPU moderna, aunque no se proporcionan mediciones oficiales.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la informacion proporcionada, ni el autor ofrece referencias a otros clasificadores de enrutamiento de agentes. Dado que es un modelo toy sin pretensiones de produccion, carece de sentido compararlo con alternativas comerciales o academicas.

## Limitaciones y advertencias

- Entrenado con solo 100 ejemplos sinteticos: la generalizacion a peticiones reales es muy limitada y probablemente presente sobreajuste severo.
- No apto para produccion: el propio autor lo declara como "lab toy, not production".
- Solo ingles: cualquier peticion en otro idioma producira resultados impredecibles.
- Sin capacidad generativa: no puede redactar respuestas ni mantener conversaciones.
- Riesgo de alucinacion: no aplica, al ser un clasificador deterministico; sin embargo, puede asignar clases erroneas con alta confianza si la entrada difiere del dominio de entrenamiento.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero sin garantias y bajo responsabilidad del usuario.
- El formato joblib es especifico de Python y requiere la misma version de scikit-learn para cargar el modelo correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akashnaren/ui-mode-router
- Dataset de entrenamiento: https://huggingface.co/datasets/akashnaren/agent-ui-sft
- Autor (Akash Premkumar): https://huggingface.co/akashnaren
