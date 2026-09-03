# Snapkitty/bob-voyager

## Resumen

El repositorio `Snapkitty/bob-voyager` no es un modelo de inteligencia artificial, sino un sistema de telemetría espacial en tiempo real que rastrea la Estación Espacial Internacional (ISS) mediante una máquina de pila Forth. Desarrollado por SnapKitty Collective, el proyecto combina un backend Node.js sin dependencias, una API REST con datos orbitales keplerianos y una interfaz web con un intérprete Forth y un globo terráqueo en Canvas. Su propósito es ofrecer datos orbitales en vivo (posición, velocidad, periodo, delta-v, etc.) con una cadena de auditoría criptográfica WORM (Write Once Read Many) basada en SHA-256.

Aunque no se trata de un modelo de lenguaje ni de un sistema de aprendizaje automático, su relevancia radica en su uso educativo: el Saint Errant Digital Institute (SEIT) lo despliega como currículo de ingeniería aeroespacial, permitiendo a estudiantes ejecutar palabras Forth como `VIS.VIVA` o `DELTA.V` para obtener cálculos orbitales reales. La licencia es Apache 2.0 y el código está disponible públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de telemetria: backend Node.js (sin dependencias) + frontend HTML/Canvas + interprete Forth |
| Parametros totales | No aplica (no es un modelo de IA) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Ingles (interfaz y documentacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (codigo fuente JavaScript, HTML, JSONL) |

## Arquitectura y entrenamiento

La arquitectura del sistema se compone de un servidor Node.js (`src/server.mjs`) que consume la API pública `wheretheiss.at` cada 4,5 segundos para obtener la posición de la ISS. El servidor expone seis endpoints REST (`/api/telemetry`, `/api/worm`, `/api/track`, `/api/orbital`, `/api/groundstations`, `/api/health`) que sirven datos orbitales, historial de posiciones, ángulos de contacto con estaciones terrestres y el estado de la cadena WORM. El frontend (`public/index.html`) incluye un intérprete Forth que permite a los usuarios ejecutar palabras como `ISS.LAT`, `ORBITAL.PERIOD` o `FOOTPRINT` sobre los datos en vivo.

No existe fase de entrenamiento, ya que no es un modelo de aprendizaje automático. Los cálculos orbitales se basan en constantes aeroespaciales estándar (μ = 398.600,4418 km³/s²) y en las ecuaciones de vis-viva y del periodo orbital. La cadena WORM se implementa como un archivo JSONL de solo apéndice donde cada entrada se enlaza criptográficamente con la anterior mediante SHA-256, garantizando integridad y trazabilidad.

## Capacidades

- Proporciona telemetría en tiempo real de la ISS: latitud, longitud, altitud, velocidad, elementos keplerianos completos.
- Ejecuta cálculos orbitales mediante palabras Forth: periodo, semi-eje mayor, movimiento medio, apogeo/perigeo, radio de huella terrestre, delta-v para reboost.
- Calcula distancias y ángulos de elevación a seis estaciones terrestres (San Francisco, JSC, TsUP, JAXA, ESA, Baikonur).
- Mantiene una cadena de auditoría WORM con sellos SHA-256 encadenados, a prueba de manipulaciones.
- Ofrece historial de posiciones (últimos 200 puntos) para trazar la órbita en un globo Canvas.
- Incluye un endpoint de salud que reporta estado del servicio, número de sellos WORM y tiempo de actividad.
- Funciona sin dependencias externas más allá de la API de `wheretheiss.at`; requiere solo Node.js 18+.

## Casos de uso

- Educación aeroespacial: estudiantes de ingeniería pueden ejecutar `VIS.VIVA .` para obtener la velocidad orbital instantánea de la ISS y compararla con la teoría, sin necesidad de simulaciones.
- Demostración de mecánica orbital: profesores pueden usar `ORBITAL.PERIOD` y `SEMI.MAJOR` para ilustrar la tercera ley de Kepler con datos reales.
- Auditoría de datos de misión: la cadena WORM permite verificar que los datos de telemetría no han sido alterados, útil para proyectos de integridad de datos en entornos académicos o de investigación.
- Visualización de órbitas en tiempo real: el globo Canvas con el historial de posiciones sirve para monitorizar el trayecto de la ISS en una pantalla pública o en un aula.
- Cálculo de ventanas de comunicación: los endpoints de estaciones terrestres proporcionan ángulos de elevación y distancias, útiles para planificar pasos de la ISS sobre una ubicación concreta.
- Prototipo de sistema de telemetría con cadena de bloques: el diseño WORM puede servir como referencia para implementar registros de auditoría inmutables en otros sistemas de datos críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no existen métricas de precisión o velocidad de inferencia. El rendimiento del sistema depende de la latencia de la API externa `wheretheiss.at` y de la capacidad del servidor Node.js para manejar peticiones concurrentes; no se proporcionan datos de throughput.

## Requisitos de hardware

- Muy ligero: al ser un servidor Node.js sin dependencias, puede ejecutarse en cualquier máquina con Node.js 18+ (incluso una Raspberry Pi).
- Sin GPU: no requiere aceleración por hardware.
- RAM estimada: menos de 100 MB en condiciones normales, dependiendo del número de peticiones concurrentes.
- Almacenamiento: los archivos JSONL (`worm_chain.jsonl` y `telemetry.jsonl`) crecen con el tiempo; se estima un crecimiento de unos pocos KB por día.
- Despliegue: se puede ejecutar localmente con `node src/server.mjs` en el puerto 4299, o detrás de un proxy inverso (Nginx, Caddy) para exposición pública.
- No requiere servicios de inferencia como vLLM u Ollama; es un servicio web estándar.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables, ya que este repositorio no es un modelo de aprendizaje automático. En el ámbito de sistemas de telemetría espacial, alternativas como `iss-tracker` o `wheretheiss.at` ofrecen datos similares, pero no incorporan una máquina Forth ni una cadena WORM de auditoría.

## Limitaciones y advertencias

- Dependencia de una API externa: el sistema requiere acceso a `wheretheiss.at`; si este servicio deja de estar disponible, la telemetría en vivo se interrumpe.
- Sin soporte multiusuario: el servidor no implementa autenticación ni control de acceso; cualquier persona con acceso a la red puede consultar los endpoints.
- Datos históricos limitados: solo se conservan los últimos 200 puntos de posición y los últimos 50 sellos WORM en la API; el historial completo se guarda en archivos JSONL locales.
- No es un modelo de IA: no ofrece capacidades de generación de texto, razonamiento o procesamiento de lenguaje natural; su uso se limita a cálculos orbitales y visualización.
- Documentación en inglés: la interfaz y los comentarios del código están en inglés, lo que puede suponer una barrera para usuarios hispanohablantes.
- Licencia Apache 2.0: permite uso comercial y modificación, pero requiere atribución y no ofrece garantías implícitas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/bob-voyager
- Sitio del autor (mencionado en la model card): `snapkittywest.github.io` (no verificado en la búsqueda web)
- API de datos de la ISS utilizada: `wheretheiss.at` (referenciada en la documentación)
