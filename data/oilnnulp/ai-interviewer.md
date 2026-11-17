# oilnnulp/ai-interviewer

## Resumen

`oilnnulp/ai-interviewer` no es un modelo de lenguaje en sentido estricto, sino una aplicacion Gradio (SDK 6.32.0) publicada como repositorio en Hugging Face que implementa un agente LLM para conducir entrevistas tecnicas de seleccion para puestos de desarrollador Java. El agente lee una oferta de empleo, selecciona preguntas de la base de datos publica [enhorse/java-interview](https://github.com/enhorse/java-interview), elabora un plan de entrevista, evalua las respuestas del candidato y genera un informe con recomendacion final; ademas permite comparar informes de varios candidatos.

El repositorio no incluye pesos de modelo. El sistema es un cliente que se conecta a cualquier API compatible con OpenAI que soporte tool calling, configurable mediante las variables de entorno `LLM_BASE_URL`, `LLM_MODEL`, `LLM_API_KEY` y `LLM_REASONING_EFFORT`. En el propio README se documenta un ejemplo de ejecucion local con Ollama empleando `qwen3.5:4b` modificado a traves de un `Modelfile` con contexto de 8k (`qwen3.5-8k`).

La relevancia de este repositorio es practica: ejemplifica el patron de agente con herramientas (tool calling) aplicado a un flujo de RR. HH. tecnico, con separacion modular entre herramientas (`interview.py`), bucle del agente y prompt de sistema (`agent.py`), comparacion de candidatos (`compare.py`) e interfaz web (`app.py`). No aporta innovaciones de arquitectura ni datos de entrenamiento propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (aplicacion Gradio que orquesta un LLM externo via API compatible con OpenAI) |
| Parametros totales | No disponible (depende del modelo configurado en `LLM_MODEL`) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (en el ejemplo con Ollama se define un contexto de 8k mediante `Modelfile`) |
| Tipos de cuantizacion | No disponible (depende del backend; el ejemplo usa Ollama) |
| Idiomas soportados | No disponible (la model card esta redactada en ucraniano; el idioma de las entrevistas depende del LLM configurado) |
| Licencia | No disponible |
| Formato de pesos | No aplica (no se distribuyen pesos; solo codigo Python y configuracion Gradio) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente codigo de aplicacion, no un modelo entrenado. La arquitectura logica se compone de cuatro modulos: `interview.py`, que expone las herramientas del agente (lectura de la vacante, recuperacion de preguntas, generacion de plan, registro de evaluaciones y redaccion del informe); `agent.py`, que define el prompt de sistema, la descripcion de las herramientas y el bucle del agente; `compare.py`, que implementa la comparacion entre candidatos; y `app.py`, que sirve la interfaz Gradio.

El unico requisito tecnico sobre el LLM subyacente es que sea accesible mediante una API compatible con OpenAI y que soporte tool calling. El parametro `LLM_REASONING_EFFORT` permite pasar el nivel de esfuerzo de razonamiento al backend o suprimir su envio con el valor `default`. No se documentan datos de entrenamiento, fine-tuning, RLHF ni innovaciones de inferencia, ya que el repositorio no entrena ningun modelo.

## Capacidades

- Conduccion de entrevistas tecnicas para vacantes de desarrollador Java: lectura de la oferta, seleccion de preguntas y elaboracion de un plan estructurado.
- Recuperacion de preguntas desde la base de conocimiento externa `enhorse/java-interview`.
- Evaluacion de respuestas del candidato y generacion de un informe con recomendacion final.
- Comparacion de informes de multiples candidatos para una misma vacante.
- Uso de tool calling como mecanismo central de orquestacion (requiere un LLM compatible con OpenAI y con soporte de funciones).
- Interfaz web Gradio para operar el flujo sin escribir codigo.
- Configuracion del backend LLM por interfaz o por variables de entorno (`LLM_BASE_URL`, `LLM_MODEL`, `LLM_API_KEY`, `LLM_REASONING_EFFORT`).
- Ejecucion local con Ollama documentada en el README.

## Casos de uso

- Triaje de candidatos Java en procesos de seleccion: el agente lee la descripcion del puesto, genera un plan de preguntas ajustado al stack solicitado y produce un informe preliminar que el reclutador tecnico revisa antes de la entrevista humana.
- Estandarizacion de entrevistas tecnicas: al derivar las preguntas de una base comun (`enhorse/java-interview`) y aplicar el mismo plan a todos los candidatos, se reduce la variabilidad entre entrevistadores.
- Formacion interna de desarrolladores: el flujo puede reutilizarse como simulador de entrevista tecnica para que un ingeniero practique respuestas y reciba una evaluacion estructurada.
- Comparacion de candidatos en un mismo proceso: `compare.py` permite contrastar informes generados con el mismo plan y la misma vacante, lo que facilita la decision final con criterios homogeneos.
- Prototipo de agentes con tool calling: sirve como plantilla de referencia para construir agentes con herramientas separadas en modulos (`interview.py`, `agent.py`) y backend LLM intercambiable.
- Despliegue ligero en Hugging Face Spaces: al ser una app Gradio con `app.py` como entrypoint, puede alojarse en Spaces y delegar la inferencia en una API externa, sin necesidad de GPU propia en el Space.
- Evaluacion comparativa de backends LLM: gracias a la configuracion por variables de entorno, permite medir como distintos modelos (por ejemplo, el `qwen3.5:4b` del ejemplo con Ollama) se comportan en la misma tarea de entrevista y evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplica al repositorio en si; depende enteramente del modelo configurado en `LLM_MODEL`. Si se usa la API remota, el Space o el host local no necesitan GPU.
- Ejecucion local con Ollama: el README documenta `ollama pull qwen3.5:4b` y la creacion de una variante `qwen3.5-8k` mediante `Modelfile`; el requisito de VRAM corresponde a ese modelo de 4B de parametros, no al repositorio.
- GPU recomendadas: no disponible. Para el backend remoto, ninguna; para Ollama con un modelo de 4B, una GPU consumer con suficiente VRAM para la cuantizacion elegida seria suficiente, aunque no se especifica en la documentacion.
- Cabe en GPU consumer: si, cuando se usa Ollama con un modelo pequeno como el del ejemplo; no se detallan requisitos concretos.
- Opciones de despliegue: Hugging Face Spaces con SDK Gradio 6.32.0; ejecucion local con `python app.py` tras `pip install -r requirements.txt`; backend LLM via cualquier API compatible con OpenAI (incluido Ollama en local).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Modelo incluido | Contexto | Licencia | Interfaz |
|---|---|---|---|---|---|
| `oilnnulp/ai-interviewer` | Agente de entrevistas Java sobre LLM externo | No | Depende del backend (ejemplo: 8k) | No disponible | Gradio |
| Modelos LLM genericos (p. ej. `qwen3.5:4b` citado en el README) | Modelo de lenguaje | Si | No disponible en la informacion | No disponible | Via API/Ollama |
| Frameworks de agentes con tool calling | Biblioteca de orquestacion | No | Depende del backend | No disponible | Variable |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con proyectos equivalentes de entrevista automatizada; los datos de rendimiento, licencia y contexto de las alternativas no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni modelo propio: cualquier afirmacion sobre calidad, sesgos o rendimiento depende del LLM que se configure como backend.
- La licencia no esta declarada; no se puede asumir uso comercial sin consultar al autor.
- La model card esta redactada en ucraniano y no especifica idiomas soportados ni comportamiento multilingue del flujo de entrevista.
- El agente depende de una base de preguntas externa (`enhorse/java-interview`) alojada en GitHub; cambios o indisponibilidad de ese repositorio afectan al funcionamiento.
- Requiere un backend con soporte real de tool calling; modelos sin function calling no podran ejecutar el bucle del agente.
- Riesgo de alucinacion inherente al LLM subyacente en la evaluacion de respuestas y en la generacion del informe con recomendacion; se recomienda supervision humana en decisiones de seleccion.
- Riesgo de sesgo en la evaluacion automatizada de candidatos; no se documentan mecanismos de mitigacion ni auditoria.
- El ejemplo local usa un contexto de 8k, lo que limita la longitud acumulada de vacante, plan, respuestas e informe en conversaciones largas.
- No hay datos publicados de benchmarks, latencia ni throughput; el rendimiento en produccion no puede estimarse a partir de la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/oilnnulp/ai-interviewer
- Base de preguntas de entrevista Java: https://github.com/enhorse/java-interview
- Ollama (backend local citado en el README): https://ollama.com
