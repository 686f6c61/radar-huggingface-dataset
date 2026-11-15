# karthikeyan1509/ThreatLens_AI

## Resumen

ThreatLens AI es un repositorio publicado en Hugging Face por el usuario karthikeyan1509 que se presenta como una plataforma de investigacion y analisis de ciberseguridad basada en agentes. Segun su model card, el sistema esta disenado para investigar correos sospechosos, URLs, direcciones IP y actividad de red mediante analisis asistido por IA, inteligencia de amenazas y evaluacion de riesgo basada en evidencias. No se trata de un modelo de lenguaje con pesos publicados, sino de una aplicacion (una demo desplegada con SDK Docker y Streamlit en el puerto 8501) que orquesta herramientas y APIs externas.

El componente de IA que emplea, segun la documentacion del autor, es "Tiny Aya" accedido a traves de la API Cohere V2, junto con Scikit-learn para tareas de clasificacion y SQLite como almacenamiento. El repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y no expone pipeline, licencia ni idiomas soportados en sus metadatos. La model card indica explicitamente que se trata de una aplicacion de investigacion y demostracion, que los resultados requieren revision humana y que los experimentos de fine-tuning (AgentTune) y comparativos (AuditKIT) no se han completado.

Por tanto, esta ficha describe una aplicacion agentica de ciberseguridad, no un modelo fundacional entrenado por el autor. Cualquier evaluacion de rendimiento, arquitectura interna o capacidades del modelo subyacente queda fuera del alcance de la informacion disponible, ya que depende de Tiny Aya y de la API Cohere V2, cuyos detalles no se documentan en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (aplicacion agentica; modelo subyacente Tiny Aya via Cohere V2) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0.0 GB; no contiene pesos) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente. La model card describe la aplicacion como un "agente de investigacion de ciberseguridad multi-herramienta" construido en Python con Streamlit como interfaz, Tiny Aya como modelo de lenguaje accedido mediante la API Cohere V2, Scikit-learn para clasificacion y SQLite para persistencia. El flujo declarado incluye recoleccion y correlacion de evidencias, evaluacion de riesgo, escalado, revision humana y generacion de informes en PDF, ademas de un framework de evaluacion de agentes.

No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF o DPO. El autor indica que el fine-tuning con AgentTune y los experimentos comparativos con AuditKIT "no se han completado", por lo que no existe evidencia publicada de un entrenamiento propio. La innovacion declarada es de tipo orquestacion agentica (multi-tool, recoleccion de evidencias, escalado), no arquitectonica.

## Capacidades

- Investigacion multi-herramienta de indicadores: correos, URLs, direcciones IP y actividad de red.
- Clasificacion de amenazas en correos y URLs.
- Analisis de IP y trafico de red.
- Integraciones con fuentes de inteligencia de amenazas (threat intelligence).
- Recoleccion y correlacion de evidencias para sustentar conclusiones.
- Evaluacion de riesgo y escalado de incidentes.
- Revision humana e informe de incidentes.
- Generacion de informes en PDF.
- Framework de evaluacion de agentes.
- Soporte de tool calling y razonamiento multi-paso: implicito en el diseno agentico descrito, aunque no se detalla el mecanismo.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Triage de correo de phishing: el agente analiza el correo, extrae URLs y remitentes, consulta fuentes de inteligencia y clasifica el riesgo, entregando un informe PDF para el analista del SOC.
- Verificacion de URLs sospechosas: a partir de un enlace recibido por un usuario, el sistema recopila evidencias (reputacion, redirecciones, indicadores) y emite una evaluacion con trazabilidad.
- Analisis de direcciones IP y actividad de red: el agente correlaciona una IP observada en logs con inteligencia de amenazas y genera un resumen de riesgo escalable.
- Enriquecimiento de incidentes en un flujo de respuesta: el agente recopila y correlaciona evidencias de multiples fuentes para apoyar la decision de escalado a revision humana.
- Formacion y demostracion en ciberseguridad: al ser una aplicacion de investigacion y demostracion, sirve para ilustrar flujos de investigacion agentica en entornos academicos o de concienciacion.
- Generacion automatizada de informes de incidente: produce documentacion en PDF con evidencias y evaluacion de riesgo para auditoria interna.
- Evaluacion de agentes: el framework incluido permite medir el comportamiento del agente en escenarios controlados, aunque el autor no ha publicado resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que los experimentos comparativos (AuditKIT) y el fine-tuning (AgentTune) no se han completado, y no se aportan metricas de clasificacion, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo subyacente se invoca via API Cohere V2, por lo que la inferencia no se ejecuta localmente en el repositorio.
- GPU recomendadas: no disponibles; al depender de una API externa, la aplicacion puede ejecutarse en CPU para la orquestacion y la interfaz Streamlit.
- Compatibilidad con GPU de consumo: no aplica segun la informacion disponible.
- Opciones de despliegue: Docker con Streamlit en el puerto 8501 (segun la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no publica pesos ni metricas que permitan compararlo con modelos fundacionales o con otras plataformas agenticas de ciberseguridad. La unica referencia tecnica es Tiny Aya via Cohere V2, sin datos de rendimiento asociados en la informacion proporcionada.

| Criterio | ThreatLens AI | Alternativas |
|---|---|---|
| Tipo | Aplicacion agentica de ciberseguridad | no disponible |
| Parametros | no disponible | no disponible |
| Contexto | no disponible | no disponible |
| Licencia | no disponible | no disponible |
| Pesos publicados | No (repo de 0.0 GB) | no disponible |

## Limitaciones y advertencias

- No es un modelo con pesos publicados: el repositorio no contiene artefactos de modelo (0.0 GB), por lo que no puede ejecutarse de forma autonoma sin la API Cohere V2 y las integraciones externas.
- Licencia no especificada: no se puede determinar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- El propio autor advierte que es una aplicacion de investigacion y demostracion, y que los resultados requieren revision humana y no constituyen garantias de seguridad definitivas.
- Riesgo de alucinacion y falsos positivos/negativos en la clasificacion de amenazas: no se han publicado evaluaciones que cuantifiquen la precision del agente.
- Fine-tuning y evaluacion comparativa no completados (AgentTune, AuditKIT), por lo que no existe evidencia empirica de rendimiento.
- Sin datos de idiomas soportados ni de sesgos conocidos.
- Dependencia de servicios externos (Cohere V2, fuentes de threat intelligence): disponibilidad, coste y latencia quedan fuera del control del repositorio.
- Cero descargas y cero likes: ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/karthikeyan1509/ThreatLens_AI
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos distintos de la propia pagina del modelo en Hugging Face.
