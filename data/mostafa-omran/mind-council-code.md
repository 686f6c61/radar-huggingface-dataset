# mostafa-omran/mind-council-code

## Resumen

`mostafa-omran/mind-council-code` es un repositorio de Hugging Face que no contiene pesos de un modelo de lenguaje, sino el codigo fuente de una aplicacion web denominada MIND COUNCIL (مجلس العقول). Se trata de un sistema multiagente de debate experto en arabe con interfaz RTL, compuesto por cuatro agentes (analista, oponente, investigador y juez) que discuten sobre un tema a lo largo de siete fases estructuradas y emiten un informe final razonado. El repositorio esta etiquetado con `region:us` y no declara pipeline, licencia ni idiomas en los metadatos de Hugging Face.

El sistema no entrena ni distribuye un modelo propio: actua como orquestador de proveedores externos de inferencia (OpenAI, Anthropic, Google Gemini, Groq, DeepSeek, OpenRouter y cualquier endpoint compatible con OpenAI). Incluye ademas un motor de demostracion integrado que permite ejecutar el ciclo completo de debate sin ninguna clave de API, y un motor de reglas experto que puntua cada argumento sobre 100 segun criterios de claridad, razonamiento, evidencia, coherencia y respuesta a objeciones. La relevancia actual reside en su enfoque de "debate multiagente con evaluacion basada en reglas" como alternativa a la generacion simple, con trazabilidad de puntuaciones y explicaciones por regla activada.

El tamano del repositorio es de 0.0 GB segun los metadatos, lo que sugiere que el contenido publicado es esencialmente codigo y documentacion, no artefactos de pesos. Creado y actualizado el 2026-11-27, no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion multiagente sobre proveedores LLM externos (no incluye modelo propio); backend FastAPI + frontend HTML/CSS/JS |
| Parametros totales | no disponible (no distribuye pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del proveedor y modelo seleccionado por el usuario) |
| Tipos de cuantizacion | no disponible (no aplica; la inferencia se delega al proveedor externo) |
| Idiomas soportados | arabe (interfaz y prompts); los modelos subyacentes dependen del proveedor elegido |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de codigo; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio implementa una arquitectura de orquestacion multiagente sobre LLMs de terceros. El flujo se articula en cuatro capas: una capa de proveedores (`backend/providers/`) que abstrae ocho backends mediante `base_provider` y `provider_factory`; una capa de agentes (`backend/agents/`) con un `base_agent` y cuatro roles especializados mas un `demo_engine`; una capa de motores (`backend/engine/`) con `debate_engine`, `rule_engine`, `inference_engine` y `verdict_engine`; y una base de conocimiento (`backend/knowledge_base/`) con 11 reglas IF-THEN, 12 falacias logicas y cinco niveles de evidencia.

El `debate_engine` ejecuta un numero fijo de pasos segun la profundidad elegida (13 pasos en modo rapido, mas en modos estandar y profundo) y utiliza un resumen de contexto estructurado en lugar de reinyectar la conversacion completa, lo que reduce el consumo de tokens. El `rule_engine` analiza cada mensaje en busca de estructura, causalidad, indicadores de evidencia, terminos absolutos y patrones de falacias, y emite una puntuacion sobre 100 con las reglas activadas y una explicacion legible. El `inference_engine` clasifica las afirmaciones en verificadas, respaldadas, no verificadas, opinion o suposicion, aplicando reglas estrictas como R-EVD-03 (la ausencia de objecion no es prueba de validez) y R-EVD-04 (las cifras sin fuente se marcan como no verificadas). No se documenta entrenamiento, ajuste fino ni datos de entrenamiento, ya que el sistema no entrena modelos propios.

## Capacidades

- Debate multiagente estructurado en siete fases con cuatro roles diferenciados (analista, oponente, investigador y juez).
- Puntuacion automatica de argumentos sobre 100 con desglose por criterios: claridad 20, razonamiento 25, evidencia 25, coherencia 20 y respuesta a objeciones 10.
- Deteccion de 12 falacias logicas y aplicacion de 11 reglas IF-THEN sobre cada intervencion.
- Clasificacion de evidencias en cinco niveles y marcado de afirmaciones no verificadas.
- Editor de system prompts por agente con historial de versiones, restauracion, copia y contador de palabras y caracteres.
- Prueba de conexion real contra cada proveedor configurado.
- Cifrado de claves API con Fernet y enmascarado posterior (solo se muestran los ultimos cuatro caracteres).
- Modo demostracion sin claves de API con motor integrado que simula el debate completo.
- Gestion de reuniones, historial y generacion de informes finales.
- Interfaz en arabe con diseno RTL en nueve paginas.

## Casos de uso

- Analisis estructurado de decisiones tecnicas: el sistema enfrenta a un analista y a un oponente sobre una propuesta de arquitectura, con un investigador que aporta evidencia y un juez que emite veredicto; util para equipos que quieren documentar el razonamiento de una decision.
- Revision de argumentarios en entornos editoriales o de comunicacion: el motor de reglas puntua cada intervencion y detecta falacias, lo que permite auditar la calidad argumental antes de publicar.
- Formacion en pensamiento critico: el desglose por criterios y la explicacion de reglas activadas sirven como material didactico para ensenar a construir argumentos con evidencia.
- Evaluacion comparativa de proveedores LLM: al soportar ocho backends y permitir probar conexiones reales, se puede medir como responde cada modelo en el mismo rol y fase del debate.
- Prototipado de asistentes de investigacion: el flujo de siete fases con resumen de contexto estructurado es reutilizable como esqueleto para pipelines de sintesis de informacion con multiples agentes.
- Despliegue local sin dependencias externas: el modo demostracion permite validar la logica de negocio, la interfaz y los tests sin coste de API, util en entornos de desarrollo o air-gapped.
- Integracion en pipelines de CI: la suite `pytest` cubre reglas, agentes, motor de debate, cifrado y un debate completo de demostracion, lo que facilita su inclusion como prueba de regresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se requiere GPU para el repositorio en si: es una aplicacion web Python (FastAPI) que delega la inferencia en proveedores externos.
- La VRAM necesaria depende exclusivamente del modelo y proveedor elegidos por el usuario; no es un requisito del repositorio.
- Para ejecucion local basta con Python y las dependencias de `requirements.txt`; el servidor se levanta con `uvicorn backend.main:app --reload` en el puerto 8000.
- El SDK declarado en la model card es `docker` con `app_port: 7860`, lo que permite desplegarlo como contenedor en Hugging Face Spaces o en infraestructura propia.
- Opciones de despliegue documentadas: ejecucion local con venv, contenedor Docker y Hugging Face Spaces.
- Latencia y throughput: no disponibles; dependen de la latencia del proveedor LLM seleccionado y del modo de profundidad del debate (rapido, estandar o profundo).

## Comparativa con modelos similares

| Sistema | Tipo | Modelo propio | Multiagente | Evaluacion por reglas | Licencia declarada |
|---|---|---|---|---|---|
| mind-council-code | Orquestador multiagente | No | Si (4 roles) | Si (11 reglas, 12 falacias) | no disponible |
| AutoGen (Microsoft) | Framework multiagente | No | Si | No integrada por defecto | MIT (fuera del alcance de esta ficha) |
| CrewAI | Framework multiagente | No | Si | No integrada por defecto | MIT (fuera del alcance de esta ficha) |
| LangGraph | Framework de grafos de agentes | No | Si | No integrada por defecto | MIT (fuera del alcance de esta ficha) |

La comparativa se limita a frameworks de orquestacion porque el repositorio no distribuye pesos y no es comparable con modelos de lenguaje en terminos de parametros o contexto. Los datos de los frameworks alternativos no provienen de la informacion proporcionada y deben verificarse en sus repositorios oficiales.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de lenguaje: cualquier evaluacion de calidad de texto depende del proveedor externo configurado.
- La licencia no esta declarada en los metadatos de Hugging Face, por lo que el uso comercial queda sin marco juridico explicito hasta que el autor lo aclare.
- La interfaz y los prompts estan disenados para arabe con direccion RTL; el soporte de otros idiomas depende del modelo subyacente y no esta documentado.
- El modo demostracion no utiliza un LLM real: genera respuestas con el motor integrado, por lo que su calidad no representa la de produccion.
- El almacenamiento de claves API requiere configurar `ENCRYPTION_KEY` de Fernet en produccion; sin ella, la seguridad del cifrado no esta garantizada segun la propia documentacion.
- El sistema depende de la disponibilidad y de los cambios de API de ocho proveedores externos, lo que introduce riesgo operativo y de mantenimiento.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de robustez del motor de reglas.
- El proyecto no registra descargas ni likes, lo que sugiere ausencia de validacion por parte de la comunidad en el momento de la consulta.
- No hay informacion sobre tests de carga, concurrencia ni limites de tasa en el backend.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mostafa-omran/mind-council-code
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este proyecto.
