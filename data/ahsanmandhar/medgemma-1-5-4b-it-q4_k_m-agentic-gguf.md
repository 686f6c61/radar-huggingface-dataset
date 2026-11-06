# Ahsanmandhar/medgemma-1.5-4b-it-Q4_K_M-agentic-GGUF

## Resumen

Este repositorio, publicado por el usuario Ahsanmandhar, no contiene un modelo entrenado desde cero, sino el codigo de una aplicacion agentica construida alrededor de MedGemma 1.5 4B IT, el modelo medico de Google derivado de la familia Gemma. El nombre del repositorio sugiere una variante cuantizada en Q4_K_M en formato GGUF, pero la model card aclara explicitamente que el repositorio distribuye unicamente codigo de aplicacion bajo licencia Apache 2.0 y no redistribuye los pesos del modelo: el usuario debe descargarlos directamente de Google aceptando sus terminos de uso. El repositorio figura con 0 descargas, 0 likes y un tamano de 0.0 GB en el momento de la consulta, lo que indica que el contenido pesado no esta alojado aqui.

El problema que aborda es la orquestacion de un asistente clinico de soporte a la decision con trazabilidad: la aplicacion encadena varios agentes especializados (triaje con deteccion de senales de alarma, investigador de evidencia con busqueda web via DuckDuckGo, razonamiento clinico con MedGemma, critico de evidencia y validador de seguridad), ejecuta codigo en un subproceso aislado sin red y expone la traza Plan → Action → Observation → Result en una interfaz Streamlit.

Su relevancia es la de un ejemplo de patron agentico aplicado a un dominio sensible, no la de un modelo nuevo: el interes tecnico esta en la arquitectura de orquestacion, el registro de auditoria visible y las salvaguardas, no en un avance de modelado. La model card insiste en que es material educativo y de investigacion, no un dispositivo medico y no apto para uso clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene codigo de aplicacion; el modelo subyacente es MedGemma 1.5 4B IT, arquitectura no detallada en la informacion) |
| Parametros totales | 4B (segun el nombre del repositorio; no verificado en la informacion) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (segun el nombre del repositorio); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | codigo de aplicacion: Apache 2.0; pesos del modelo: Health AI Developer Foundations Terms of Use de Google |
| Formato de pesos | GGUF (segun el nombre del repositorio); los pesos no se redistribuyen en este repo |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento del modelo en la documentacion proporcionada. El repositorio no entrena ni ajusta pesos: empaqueta una aplicacion que consume MedGemma 1.5 4B IT en formato GGUF (cuantizacion Q4_K_M segun el nombre) y lo descarga desde los servidores de Google mediante un token de lectura del usuario. Cualquier detalle sobre datos de entrenamiento, numero de tokens, RLHF o DPO del modelo base queda fuera del alcance de esta ficha y no esta disponible.

La innovacion tecnica documentada es de nivel de sistema, no de modelo: orquestacion multiagente con roles separados (triaje, investigacion, razonamiento, critica, validacion de seguridad), integracion de busqueda web con citacion de fuentes, ejecucion de codigo en sandbox con timeouts y sin acceso a red, y una traza de auditoria visible con el ciclo Plan → Action → Observation → Result. La model card incluye una figura comparativa "Before vs After" de la optimizacion agentica, pero no se aportan metricas numericas asociadas.

## Capacidades

- Razonamiento clinico asistido sobre el modelo MedGemma 1.5 4B IT, orientado a soporte a la decision.
- Triaje automatizado con deteccion de senales de alarma (red flags) como primer agente de la cadena.
- Busqueda web integrada (DuckDuckGo) con presentacion de fuentes citadas en tarjetas de evidencia.
- Ejecucion de codigo en sandbox: subproceso aislado, timeouts y sin acceso a red.
- Critica de evidencia: un agente revisa y cuestiona la evidencia recuperada antes de la respuesta final.
- Validacion de seguridad: agente dedicado a comprobar la respuesta frente a criterios de seguridad.
- Trazabilidad completa del ciclo agentico (Plan → Action → Observation → Result) visible en la interfaz.
- Interfaz Streamlit con chat, tarjetas de evidencia, panel de auditoria desplegable e indicador de seguridad.
- Soporte multilingue: no disponible en la informacion.
- Soporte de tool calling generico fuera de la aplicacion: no disponible.

## Casos de uso

- Prototipado de asistentes clinicos con trazabilidad: la aplicacion sirve como plantilla para construir un asistente de soporte a la decision donde cada paso (planificacion, accion, observacion) queda registrado y es auditable por un revisor humano.
- Investigacion sobre orquestacion multiagente en dominios regulados: permite experimentar con separacion de roles (triaje, investigador, critico, validador) y medir como afecta a la calidad y seguridad de las respuestas en un dominio medico.
- Demostracion de recuperacion aumentada con busqueda web: el agente investigador consulta DuckDuckGo y adjunta fuentes citadas, util para estudiar como se comporta un modelo de 4B cuando se le inyecta evidencia externa frente a conocimiento parametrico.
- Evaluacion de sandbox de ejecucion de codigo: el subproceso aislado con timeouts y sin red sirve como referencia para integrar ejecucion de codigo en pipelines agenticos con requisitos de aislamiento.
- Docencia y formacion en IA medica responsable: el aviso legal integrado, el indicador de seguridad y la traza visible convierten la app en un material didactico sobre limites y salvaguardas de los asistentes clinicos.
- Pruebas de despliegue local de un modelo medico cuantizado: al usar GGUF Q4_K_M y descarga directa de pesos, permite validar en una maquina de desarrollo el rendimiento de un modelo de 4B en tareas de razonamiento clinico antes de escalar a infraestructura mayor.
- Base para auditoria de sesgos y alucinaciones: el registro estructurado de acciones y observaciones facilita recopilar trazas para analisis posterior de errores y comportamientos inseguros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de 4B en Q4_K_M el orden de magnitud habitual esta en torno a 3-4 GB de pesos, pero esta cifra no aparece en la informacion proporcionada y no debe tomarse como dato verificado.
- GPU recomendadas: no disponibles en la informacion.
- Compatibilidad con GPU de consumo: no confirmada en la informacion; el formato GGUF y la cuantizacion Q4_K_M son compatibles con motores de inferencia local, pero el repositorio no detalla requisitos.
- Opciones de despliegue: la aplicacion se ejecuta con Python 3.10+, scripts `setup.ps1` y `run.ps1`, y `streamlit run app.py`; el motor de inferencia concreto para el GGUF no se especifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (app agentica sobre MedGemma 1.5 4B IT Q4_K_M) | 4B (segun nombre) | no disponible | Codigo Apache 2.0; pesos bajo terminos de Google | Codigo en Hugging Face; pesos descargados aparte |
| MedGemma 1.5 4B IT (modelo base) | 4B | no disponible | Health AI Developer Foundations Terms of Use | Hugging Face / Google |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- No es un dispositivo medico: la propia model card lo declara material educativo y de investigacion, de soporte a la decision, no apto para uso clinico, y exige revision por parte de un clinico.
- Riesgo de alucinacion: inherente a un modelo de lenguaje de 4B en dominio medico; la aplicacion mitiga con critica de evidencia y validacion de seguridad, pero no elimina el riesgo.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas y contexto: sin datos sobre cobertura linguistica ni longitud de ventana, lo que impide garantizar un comportamiento adecuado en castellano o en conversaciones largas.
- Licencia: el codigo es Apache 2.0, pero los pesos estan sujetos a los Health AI Developer Foundations Terms of Use de Google, con posibles restricciones de uso comercial que deben revisarse antes de cualquier despliegue productivo.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Dependencia de busqueda web externa: el agente investigador usa DuckDuckGo, lo que introduce dependencia de un servicio de terceros y variabilidad en la calidad de las fuentes.
- Sin datos de benchmarks ni de rendimiento: no es posible evaluar su calidad frente a alternativas con evidencia publicada.
- Sin garantia: la model card indica que se proporciona "as-is", sin garantia de ningun tipo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ahsanmandhar/medgemma-1.5-4b-it-Q4_K_M-agentic-GGUF
- Terminos de uso de Health AI Developer Foundations (Google): https://developers.google.com/health-ai-developer-foundations/terms
