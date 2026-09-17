# nikeshad2017/safecare-ai

## Resumen

SafeCare AI es un prototipo de investigacion publicado en HuggingFace por el usuario nikeshad2017. Se define como un modelo conversacional de apoyo con restricciones de seguridad, destilado a partir de un modelo profesor de mayor tamano y disenado para despliegue local. No es un producto acabado ni un servicio clinico: la propia model card lo describe explicitamente como un prototipo de investigacion y no como terapeuta, sistema de diagnostico, dispositivo medico ni servicio de emergencias.

La pregunta de investigacion que plantea es si un modelo de lenguaje causal pequeno puede conservar comportamiento empatico util heredado de un profesor mayor mientras una capa de reglas simbolicas de seguridad reduce las salidas inseguras. La arquitectura propuesta encadena un LLM profesor, la generacion de respuestas y logits top-k del profesor, la destilacion de conocimiento hacia un estudiante, una capa simbolica de seguridad y una interfaz local de linea de comandos o Streamlit.

El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta. La model card no publica parametros, contexto, licencia ni idiomas, y no incluye resultados de benchmarks: insiste en que la evaluacion debe ejecutarse con los scripts incluidos y que no deben inventarse cifras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal pequeno (student) destilado desde un LLM profesor; incluye capa simbolica de seguridad basada en reglas de palabras clave |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card menciona la evaluacion multilingue como trabajo pendiente) |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | no disponible |
| Etiquetas | region:us |
| Fecha de creacion (segun HuggingFace) | 2026-09-17 |
| Fecha de ultima actualizacion (segun HuggingFace) | 2026-09-17 |

## Arquitectura y entrenamiento

El pipeline descrito en la model card es: LLM profesor -> respuestas y logits top-k del profesor -> destilacion de conocimiento hacia el estudiante -> capa simbolica de seguridad -> CLI local o Streamlit. El estudiante se define como un modelo de lenguaje causal pequeno, sin que se especifiquen familia, numero de parametros ni longitud de contexto. La destilacion se realiza sobre los logits top-k del profesor, ademas de un entrenamiento supervisado (SFT) previo.

El proyecto organiza el trabajo en cinco pistas experimentales: A) estudiante base; B) SFT; C) destilacion de conocimiento (KD); D) KD mas capa de seguridad simbolica; E) KD mas seguridad mas RAG, marcada como futura. Las metricas previstas son calidad, empatia, seguridad, correccion de escalado, latencia, consumo de RAM/VRAM y tamano del modelo. El dataset principal es EmpatheticDialogues, descrito como opcional, y la model card advierte de que hay que revisar la tarjeta del dataset y las normas institucionales antes de redistribuirlo o usarlo comercialmente, manteniendo los datos crudos fuera de git. No se indican numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional orientada a dialogo de apoyo y acompanamiento emocional, segun la descripcion del proyecto.
- Comportamiento empatico aprendido por destilacion desde un modelo profesor de mayor tamano.
- Aplicacion de una capa de reglas simbolicas de seguridad basada en palabras clave para filtrar o moderar salidas.
- Escalado ante situaciones de riesgo, con scripts de prueba especificos (`tests/test_safety.py`) para verificar el comportamiento.
- Despliegue local mediante interfaz de linea de comandos (`cli.py`) o aplicacion Streamlit (`app.py`).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; la evaluacion multilingue se menciona como requisito pendiente.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Integracion de RAG: prevista en la pista experimental E, marcada como futura.

## Casos de uso

- Investigacion academica sobre destilacion de conocimiento: el repositorio permite reproducir las cinco pistas experimentales (base, SFT, KD, KD mas seguridad, KD mas seguridad y RAG) y medir calidad, empatia y seguridad con scripts propios.
- Estudio de seguridad en modelos conversacionales: la capa de reglas simbolicas y `tests/test_safety.py` sirven para analizar en que medida un filtro por palabras clave reduce salidas inseguras y donde falla, tal como advierte la propia model card.
- Prototipado de asistente de apoyo emocional en local: al no depender de una API externa, puede ejecutarse en una maquina de investigacion para explorar dialogos de acompanamiento sin enviar datos a terceros.
- Evaluacion de latencia y consumo de recursos: los scripts de evaluacion miden latencia, RAM/VRAM y tamano del modelo, utiles para comparar configuraciones de estudiante y de cuantizacion.
- Generacion de datos sinteticos de dialogo: el paso `generate_teacher_data.py` produce respuestas del profesor que pueden reutilizarse para estudiar destilacion top-k en otros dominios.
- Docencia y formacion: el pipeline paso a paso (descarga de datos, preparacion, generacion de datos del profesor, SFT, destilacion, evaluacion) es un caso practico para cursos de ajuste fino y destilacion.
- Despliegue como demo interna mediante Streamlit: adecuado para mostrar el comportamiento del prototipo a un equipo reducido, siempre que se asuma que no es un sistema clinico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no deben inventarse resultados y que la evaluacion debe realizarse ejecutando los scripts del repositorio (`scripts/evaluate.py --model ./models/safecare-student`), con metricas de calidad, empatia, seguridad, correccion de escalado, latencia, RAM/VRAM y tamano del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se especifican parametros ni cuantizaciones.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada. El tamano del repositorio (0,1 GB) sugiere un modelo pequeno, pero se trata de una inferencia a partir del peso del repositorio y no de un dato declarado por el autor.
- Opciones de despliegue: interfaz de linea de comandos (`cli.py`) y aplicacion Streamlit (`app.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; el proyecto los plantea como metricas a medir, no como resultados publicados.
- Entorno de ejecucion: Python 3.10 o superior, entorno virtual y build de PyTorch con soporte CUDA instalado desde pytorch.org cuando corresponda.
- Nota: el repositorio no incluye datos crudos; hay que descargar y preparar EmpatheticDialogues con los scripts proporcionados antes de entrenar.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones completas de este modelo, por lo que no es posible establecer una comparativa cuantitativa fiable. A modo de contexto cualitativo, la categoria de modelos comparables seria la de modelos conversacionales pequenos destilados para dialogo de apoyo, junto con asistentes de salud mental basados en modelos de lenguaje y con modelos destilados de proposito general del mismo rango de tamano.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nikeshad2017/safecare-ai | no disponible | no disponible | sin benchmarks publicados | no disponible | HuggingFace, 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la busqueda web enlaces ni datos relevantes sobre modelos comparables a este prototipo.

## Limitaciones y advertencias

- La model card declara explicitamente que se trata de un prototipo de investigacion y no de un terapeuta, sistema de diagnostico, dispositivo medico ni servicio de emergencias.
- Las reglas de palabras clave se describen como una defensa inicial; un despliegue serio requeriria un clasificador de riesgo validado, pruebas adversariales, evaluacion multilingue, controles de privacidad, revision humana o clinica, respuesta ante incidentes y gobernanza formal.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a un modelo de lenguaje causal pequeno destilado.
- Sesgos conocidos: no disponibles. El uso de EmpatheticDialogues y de respuestas de un profesor introduce los sesgos propios de esas fuentes.
- Limitaciones de contexto e idioma: no disponibles; la evaluacion multilingue se reconoce como pendiente.
- Licencia: no disponible, por lo que no puede confirmarse la viabilidad de uso comercial. El dataset EmpatheticDialogues es opcional y su uso esta sujeto a su propia tarjeta y a las normas institucionales aplicables.
- Los datos crudos no deben incluirse en el repositorio git.
- Ausencia total de adopcion registrada (0 descargas, 0 likes) y de resultados publicados: no hay evidencia independiente de calidad, empatia ni seguridad.
- La fecha de creacion indicada en HuggingFace es 2026-09-17, posterior a la fecha habitual de consulta; se reproduce tal cual figura en la ficha del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nikeshad2017/safecare-ai
- Paper: no disponible
- Blog o articulo tecnico: no disponible
- Repositorio de codigo independiente: no disponible
- Demo: no disponible (la model card menciona una aplicacion Streamlit local, sin URL publica)
- Dataset EmpatheticDialogues: referenciado en la model card como opcional, sin enlace directo disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a documentacion de software CAD (BricsCAD) y no guardan relacion con el modelo.
