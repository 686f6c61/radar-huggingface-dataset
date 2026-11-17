# ritmesh/cold-chain-logistics-ai

## Resumen

`ritmesh/cold-chain-logistics-ai` no es un modelo de lenguaje con pesos publicados, sino un Space estatico de Hugging Face que funciona como portfolio y demostracion interactiva offline de un asistente de IA para logistica de cadena de frio. El sistema real descrito se construyo sobre AWS con un agente LangGraph, NVIDIA NIM sirviendo el modelo `z-ai/glm-5.3-flash`, SQL Server con un guard de solo lectura aplicable y front-ends en Streamlit, LibreChat y Grafana. El Space en si no contiene backend: no hay claves de API, ni RDS, ni servicios de pago, y todas las respuestas de la demo se generan en el navegador del visitante a partir de un conjunto de datos sintetico embebido.

El repositorio contiene tres piezas: `index.html` con tres pestanas (demo offline, arquitectura y "Live AI"), `demo-data.js` con la muestra sintetica (12 envios, 174 puntos de telemetria y 22 alertas) y el README. La pestana de demo offline etiqueta explicitamente sus respuestas como simuladas, mientras que la pestana "Live AI" muestra respuestas reales grabadas del sistema en AWS y enlaza a una entrada autenticada por Cognito.

Su relevancia es documental mas que tecnica: sirve como ejemplo de arquitectura de agente con acceso a base de datos protegido por un guard SQL de solo lectura, y como caso de publicacion de un portfolio que sobrevive al desmantelamiento de la infraestructura. No hay pesos, tokenizador, configuracion de inferencia ni model card tecnica del LLM subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es un Space estatico; el sistema descrito usa un agente LangGraph sobre NVIDIA NIM `z-ai/glm-5.3-flash`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no se publican pesos; el contenido son ficheros HTML y JavaScript) |

## Arquitectura y entrenamiento

El artefacto publicado no entrena ni distribuye ningun modelo. Es una pagina estatica (`sdk: static`) con un `index.html` y un `demo-data.js` que embebe una muestra saneada de un dataset sintetico con envios, telemetria y alertas del periodo 2021 a octubre de 2026. La demo offline responde consultas mediante logica en JavaScript ejecutada en el navegador, no mediante inferencia de un LLM, y la propia pagina lo etiqueta como simulacion.

El sistema real que el Space documenta emplea un agente LangGraph que consulta SQL Server a traves de un guard SQL de solo lectura aplicable, con NVIDIA NIM sirviendo `z-ai/glm-5.3-flash` como motor de generacion, y front-ends en Streamlit, LibreChat y Grafana. No se especifican datos de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF/DPO) ni innovaciones de decodificacion, porque el LLM no forma parte del repositorio.

## Capacidades

- Visualizacion de una demo interactiva offline de un asistente de logistica de cadena de frio, con respuestas simuladas generadas en el navegador.
- Consulta de una muestra sintetica de 12 envios (incluido el envio de cualificacion UC-003241), 174 puntos de telemetria y 22 alertas.
- Presentacion de la arquitectura del sistema: diagrama, caracteristicas, resultados verificados y postura de seguridad.
- Exhibicion de respuestas reales grabadas del sistema en AWS y enlace a la entrada autenticada por Cognito.
- Documentacion de un patron de seguridad basado en guard SQL de solo lectura y en la no exposicion publica del gateway del agente.
- No soporta tool calling, agentes, vision, audio ni generacion de texto real: esas capacidades pertenecen al sistema descrito, no al Space.

## Casos de uso

- Portfolio tecnico de un proyecto de IA aplicada: el Space sirve como escaparate autocontenido de la arquitectura y los resultados de un agente de logistica, sin depender de infraestructura activa.
- Demostracion comercial offline: un visitante puede explorar consultas de ejemplo sobre envios y alertas en el navegador, sin claves ni backend, lo que facilita presentaciones en entornos restringidos.
- Documentacion de patrones de seguridad: el guard SQL de solo lectura y la separacion entre entrada autenticada y gateway privado sirven como referencia para disenar agentes con acceso a bases de datos.
- Plantilla de Space estatico resistente a teardown: el diseno sin dependencias de backend es reutilizable para publicar demos de sistemas que se apagan o se reconstruyen con frecuencia.
- Material de formacion interna: el diagrama de arquitectura y las respuestas grabadas permiten explicar el flujo LangGraph + NIM + SQL Server a nuevos miembros del equipo.
- Referencia para auditoria de etiquetado: la distincion explicita entre respuestas simuladas y respuestas reales grabadas es un ejemplo de transparencia en demos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia de un LLM: no aplica; el repositorio no contiene pesos ni requiere GPU.
- Servido del Space: cualquier navegador moderno; el contenido es HTML y JavaScript estatico.
- VRAM estimada: no disponible (no hay modelo que cargar).
- GPU recomendadas: no disponible.
- Despliegue: Hugging Face Spaces con SDK `static`; tambien puede servirse desde cualquier servidor de ficheros estaticos.
- Latencia y throughput: no disponibles; las respuestas de la demo se calculan localmente en el navegador y no dependen de red.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `ritmesh/cold-chain-logistics-ai` | no aplica (Space estatico) | no disponible | MIT | Hugging Face Space |
| Modelos de lenguaje para logistica | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre alternativas comparables en la misma categoria (Spaces de demostracion de agentes de logistica) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no hay pesos, tokenizador ni configuracion de inferencia; no puede usarse para generar texto.
- Las respuestas de la demo offline son simuladas y estan etiquetadas como tales; no deben interpretarse como salidas de un LLM.
- Los datos embebidos son sinteticos (2021 a octubre de 2026) y no corresponden a envios reales.
- La pestana "Live AI" solo es funcional mientras exista el entorno de AWS; el enlace puede quedar inoperativo tras un teardown.
- El Space incluye marcadores de posicion (`LIVE_DEMO_URL`, `GITHUB_URL`) que el operador debe sustituir antes de publicar; sin ese paso, los enlaces no funcionan.
- La licencia MIT cubre el contenido del repositorio, no el sistema en AWS ni el modelo `z-ai/glm-5.3-flash`, cuyas condiciones no se detallan.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma del LLM subyacente porque no forma parte del artefacto publicado.

## Enlaces

- Hugging Face: https://huggingface.co/ritmesh/cold-chain-logistics-ai
- Repositorio GitHub: no disponible (marcador de posicion sin sustituir en el README)
- Demo en vivo (CloudFront): no disponible (marcador de posicion sin sustituir en el README)
- Paper: no disponible
- Blog: no disponible
