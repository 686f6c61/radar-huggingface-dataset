# gopi2010/harvest-atlas

## Resumen

Harvest Atlas es una aplicación de soporte a la decisión agronómica publicada en Hugging Face bajo el identificador `gopi2010/harvest-atlas`. No se trata de un modelo de lenguaje con pesos publicados, sino de un Space de tipo Docker (puerto 7860) que combina datos agroclimáticos de NASA POWER, datos de suelo de OpenLandMap SoilDB servidos vía OpenGeoHub TiTiler y, opcionalmente, muestras satelitales de NASA AppEEARS (MODIS NDVI, temperatura de superficie terrestre y humedad de suelo SMAP). La aplicación permite seleccionar una parcela en un mapa o mediante GPS, definir prioridades y contexto edafológico, y obtener un diagnóstico de vulnerabilidad del campo junto con tres escenarios de rotación de cultivos generados por IA y puntuados frente a la práctica actual del usuario.

La capa de IA no la aporta un modelo propio: la aplicación delega en la API de Groq, con `openai/gpt-oss-120b` como modelo por defecto y posibilidad de configurar una segunda clave para tolerar límites de tasa. Sin clave de Groq, el mapa y los diagnósticos basados en NASA siguen funcionando, pero la comparación de escenarios con IA queda deshabilitada. La licencia declarada es MIT y el repositorio no registra descargas ni likes en el momento de la consulta.

Por tanto, esta ficha documenta una herramienta de extremo a extremo para experimentación agronómica más que un modelo entrenado. Es relevante para desarrolladores e investigadores que quieran prototipar asistentes de rotación de cultivos con datos abiertos de observación de la Tierra, y también como ejemplo de integración de un LLM externo (vía Groq) en un pipeline geoespacial con datos NASA y OpenLandMap.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (aplicación Docker; no es un modelo con pesos publicados) |
| Parametros totales | No disponible (el LLM subyacente es externo, por defecto `openai/gpt-oss-120b` vía Groq) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (no se publican pesos; despliegue como Space Docker con `serve.py`) |

## Arquitectura y entrenamiento

No se publica información sobre arquitectura de un modelo propio ni sobre datos de entrenamiento: el repositorio es una aplicación web empaquetada como Space Docker (`sdk: docker`, `app_port: 7860`), con un punto de entrada `serve.py` para despliegue en servidor y un `main.py` reservado para un bucle de chat interactivo en terminal. La lógica de decisión combina tres capas de datos: agroclimatología de NASA POWER (temperatura, precipitación, humedad, humedad de la zona radicular, radiación solar, viento y grados-día de crecimiento), propiedades medidas del suelo en 0-30 cm de OpenLandMap SoilDB (textura, pH, carbono orgánico y densidad aparente) servidas mediante OpenGeoHub TiTiler, y muestras satelitales opcionales de NASA AppEEARS. La geocodificación inversa se resuelve con OpenStreetMap Nominatim y las capas base con NASA GIBS (MODIS Terra).

La generación de los tres escenarios de rotación se delega en la API de Groq, con `openai/gpt-oss-120b` como modelo por defecto y una segunda clave opcional (`GROQ_API_KEY_2`) para reintentos ante límites de tasa. No se documentan detalles de prompting, temperatura, número de tokens ni estrategia de evaluación de los escenarios generados; tampoco se especifica cómo se calcula la puntuación frente a la línea base de práctica actual, más allá de que se compara contra ella.

## Capacidades

- Diagnóstico de vulnerabilidad de parcela en cinco dimensiones: calor, agua, erosión, volatilidad y suelo.
- Consulta de agroclimatología histórica y reciente vía NASA POWER sin necesidad de clave API.
- Recuperación de propiedades del suelo en 0-30 cm (textura, pH, carbono orgánico, densidad aparente) desde OpenLandMap SoilDB.
- Integración opcional de muestras satelitales de NASA AppEEARS: MODIS NDVI, temperatura de superficie terrestre y humedad de suelo SMAP (requiere Earthdata Login gratuito).
- Generación de tres escenarios de rotación de cultivos mediante LLM externo (Groq), con puntuación comparativa frente a la práctica actual.
- Selección de parcela por mapa interactivo o por coordenadas GPS.
- Geocodificación inversa para contextualizar la ubicación (OpenStreetMap Nominatim).
- Superposición de capas base MODIS Terra vía NASA GIBS.
- Funcionamiento degradado: sin clave de Groq, el mapa y los diagnósticos NASA siguen operativos y solo se desactiva la comparación de escenarios con IA.

## Casos de uso

- Asesoramiento agronómico exploratorio: un técnico selecciona una parcela en el mapa y obtiene en una sola consulta clima, suelo y diagnóstico de vulnerabilidad, lo que acelera la fase de reconocimiento previo a una visita de campo.
- Planificación de rotaciones con justificación cuantitativa: la aplicación genera tres escenarios alternativos y los puntúa frente a la práctica actual, lo que permite comparar opciones con criterios explícitos de calor, agua, erosión, volatilidad y suelo en lugar de intuiciones.
- Prototipado de asistentes agrícolas basados en LLM: al delegar la generación en Groq y mantener los datos en fuentes abiertas, sirve como plantilla para construir productos verticales de IA agrónoma sin entrenar modelos propios.
- Docencia e investigación en agronomía de precisión: el desglose de fuentes (POWER, SoilDB, AppEEARS) y la separación entre diagnóstico determinista y escenarios generados facilitan explicar qué aporta cada capa de datos.
- Evaluación de riesgo climático a escala de parcela: los grados-día de crecimiento, la radiación y la humedad de zona radicular permiten estimar exposición a calor y estrés hídrico para una ubicación concreta.
- Integración en flujos de decisión con datos satelitales: equipos con Earthdata Login pueden añadir NDVI, LST y humedad SMAP para enriquecer el diagnóstico con observación de la Tierra real, útil en seguimiento de campaña.
- Despliegue interno autohospedado: al ser Docker con licencia MIT, puede ejecutarse en infraestructura propia (`python serve.py`) y conectarse a una cuenta de Groq corporativa para controlar costes y trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni de GPU: la inferencia del LLM se externaliza a la API de Groq, por lo que el Space no necesita acelerador propio.
- El contenedor ejecuta una aplicación web Python (`serve.py`) que realiza llamadas HTTP a NASA POWER, NASA GIBS, OpenLandMap/TiTiler, Nominatim y, opcionalmente, AppEEARS; el coste principal es red y CPU, no GPU.
- Despliegue recomendado: Hugging Face Spaces con SDK Docker en el puerto 7860, o cualquier host con Docker y salida a internet.
- Variables y secretos necesarios: `GROQ_API_KEY` (obligatoria para los tres escenarios de IA), `GROQ_API_KEY_2` (opcional, fallback ante límites de tasa), `GROQ_MODEL` (opcional, por defecto `openai/gpt-oss-120b`), `EARTHDATA_USERNAME` y `EARTHDATA_PASSWORD` (opcionales, solo para muestras AppEEARS).
- Advertencia de ejecución: no lanzar `python main.py` en un servidor, ya que su `main()` abre un bucle de chat interactivo en terminal que bloqueará o terminará el proceso; usar `serve.py`.
- Latencia y throughput: no disponibles; dependen de la latencia de las APIs externas (NASA, OpenLandMap, Groq) y no se documentan cifras.

## Comparativa con modelos similares

| Herramienta | Tipo | Datos integrados | Generación con LLM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Harvest Atlas (`gopi2010/harvest-atlas`) | Aplicación Docker (Space) | NASA POWER, OpenLandMap SoilDB, AppEEARS opcional, GIBS, Nominatim | Sí, vía Groq (`openai/gpt-oss-120b` por defecto) | MIT | Hugging Face Space, 0 descargas, 0 likes |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre herramientas comparables en la documentación proporcionada; la comparación con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- No es un modelo entrenado ni publica pesos: cualquier evaluación de calidad debe hacerse sobre la aplicación y sobre el LLM externo que consume, no sobre artefactos propios.
- Dependencia crítica de servicios de terceros: NASA POWER, NASA GIBS, OpenLandMap/TiTiler, Nominatim y Groq. Una caída o un cambio de cuota degrada la funcionalidad sin aviso claro al usuario.
- La generación de escenarios de rotación requiere `GROQ_API_KEY`; sin ella, la comparativa con IA no está disponible y la herramienta se reduce a diagnóstico determinista.
- Los escenarios de rotación los produce un LLM de propósito general: existe riesgo de alucinación agronómica (cultivos no adecuados a la zona, calendarios irreales o recomendaciones no validadas) y no se documenta ningún mecanismo de verificación agronómica de las propuestas.
- No se especifica la metodología de puntuación de escenarios frente a la línea base, lo que impide auditar la comparación.
- Las muestras AppEEARS requieren Earthdata Login y son opcionales; sin ellas, el diagnóstico se apoya solo en POWER y SoilDB, con menor resolución temporal y espacial.
- No se documentan idiomas soportados, sesgos conocidos ni límites de contexto; la interfaz y las respuestas dependen del modelo configurado en Groq y de los prompts internos, que no se publican.
- Licencia MIT permite uso comercial, pero no cubre los términos de los servicios externos consumidos (Groq, NASA, OpenStreetMap Nominatim, OpenLandMap CC-BY 4.0), que deben revisarse por separado.
- El repositorio no registra descargas ni likes: no hay evidencia pública de uso en producción ni de validación por terceros.
- Uso previsto como apoyo a la decisión, no como sustituto de asesoramiento agronómico profesional ni de análisis de suelo en laboratorio.

## Enlaces

- Modelo/Space en Hugging Face: https://huggingface.co/gopi2010/harvest-atlas
- NASA POWER: https://power.larc.nasa.gov
- NASA GIBS: https://gibs.earthdata.nasa.gov
- OpenLandMap SoilDB: https://openlandmap.org
- NASA AppEEARS: no disponible en la información proporcionada (el autor indica que requiere Earthdata Login gratuito)
- OpenStreetMap Nominatim: no disponible en la información proporcionada (citado como servicio de geocodificación inversa)
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
