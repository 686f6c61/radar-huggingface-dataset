# abr00kx/forensic-suite

## Resumen

El repositorio `abr00kx/forensic-suite` no es un modelo de inteligencia artificial generativa, sino un conjunto de herramientas de análisis forense diseñado para archivos de foros públicos. Fue desarrollado por `abr00kx` y se presenta como un toolkit que combina análisis estilométrico, temporal y de redes para estudiar publicaciones en foros anónimos. Su objetivo es extraer características de estilo de escritura, perfilar la cadencia de publicación y agrupar autores mediante similitud multifactorial, ofreciendo los resultados a través de una interfaz de línea de comandos y un panel web.

La arquitectura del proyecto está dividida en dos capas: una parte principal escrita en Go, que se encarga de la recolección de datos, el almacenamiento y el servidor HTTP, y una capa de ciencia de datos en Python que implementa los análisis estadísticos (estilometría, clustering, detección de sockpuppets y deriva temporal). El modelo no tiene parámetros de red neuronal, longitud de contexto ni cuantizaciones, ya que no es un modelo de lenguaje. La información disponible indica que la versión actual es la 1.0.0, con fecha de creación en septiembre de 2026.

La relevancia de esta herramienta reside en su enfoque metodológico explícito: cada resultado se presenta como un candidato estadístico, no como una identificación. Esto es especialmente importante en el contexto de análisis de foros anónimos, donde la interpretación de los datos puede llevar a conclusiones erróneas. El proyecto incluye advertencias éticas y un sistema de procedencia que documenta cómo se generó cada resultado, lo que lo hace adecuado para investigación académica y análisis de archivos, pero no para la identificación de personas reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo de IA; toolkit de software en Go y Python) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el análisis es sobre texto en inglés, según los ejemplos de fuentes) |
| Licencia | No disponible |
| Formato de pesos | No disponible |
| Tipo de herramienta | Toolkit de análisis forense (CLI + servidor web + API JSON) |
| Version | 1.0.0 |
| Lenguajes principales | Go (backend, CLI, servidor) y Python (capa de ciencia de datos) |
| Dependencias Python | numpy, pandas, scikit-learn, hdbscan |
| Base de datos | SQLite |

## Arquitectura y entrenamiento

La arquitectura de `forensic-suite` no corresponde a un modelo de aprendizaje automático, sino a un sistema de software dividido en dos componentes principales. El componente en Go se encarga de la recolección de hilos desde fuentes como 4chan y DesuArchive, el almacenamiento de publicaciones en una base de datos SQLite, el servidor HTTP del panel web y la interfaz de línea de comandos con subcomandos como `harvest`, `identify` y `serve`. El componente en Python contiene la capa de análisis estadístico en `src/forensic_suite/pyds/analytics/`, que incluye módulos para estilometría, análisis temporal, clustering (mediante HDBSCAN) y detección de deriva. La comunicación entre ambos se realiza a través de un puente JSON (`bridge.py`), de modo que el servidor Go delega las consultas estadísticas al intérprete de Python.

No existe un proceso de entrenamiento en el sentido de modelos de lenguaje. La herramienta aplica algoritmos de análisis de datos sobre un corpus de publicaciones previamente recolectadas. El sistema de procedencia registra los parámetros utilizados, la ruta de la base de datos y las advertencias metodológicas en cada respuesta analítica, lo que permite reproducir los resultados y entender su contexto. La separación entre Go y Python se estableció para eliminar la duplicación de implementaciones HTTP y unificar el punto de acceso a los datos.

## Capacidades

- Recolección de hilos y publicaciones desde foros anónimos (por ejemplo, 4chan y DesuArchive) mediante el subcomando `harvest`.
- Almacenamiento estructurado de publicaciones en una base de datos SQLite, con rutas configurables mediante variables de entorno.
- Análisis estilométrico: extracción de características de estilo de escritura a partir de los textos de las publicaciones.
- Análisis temporal: perfilado de la cadencia de publicación de los usuarios a lo largo del tiempo.
- Clustering multifactorial: agrupación de autores basada en similitud de estilo, comportamiento temporal y otros factores, utilizando HDBSCAN.
- Detección de sockpuppets: identificación de posibles cuentas alternativas mediante similitud de escritura, presentada siempre como candidato estadístico.
- Análisis de deriva (drift): seguimiento de cambios en el estilo de escritura a lo largo del tiempo.
- Enriquecimiento de datos: subcomandos adicionales para complementar la información de las publicaciones.
- Interfaz de línea de comandos en Go con subcomandos `harvest`, `identify`, `serve`, `scan`, `report`, `temporal`, `sockpuppets`, `drift` y `enrich`.
- Panel web servido por el binario Go, con API JSON y un frontend en HTML/CSS/JS.
- Sistema de procedencia: cada respuesta analítica incluye un bloque `provenance` con información sobre el corpus, los parámetros y las advertencias metodológicas.
- Advertencias éticas integradas: las advertencias se adjuntan automáticamente a las respuestas de la API y se muestran de forma permanente en el panel web.

## Casos de uso

- Investigación académica sobre comunidades en foros anónimos: el toolkit permite recolectar un corpus de publicaciones y analizar la evolución del estilo de escritura de un grupo de usuarios a lo largo del tiempo, lo que resulta útil para estudios sociológicos o lingüísticos.
- Detección de sockpuppets en comunidades online: los investigadores pueden utilizar el clustering estilométrico para identificar candidatos a cuentas alternativas, siempre interpretando los resultados como indicios estadísticos y no como pruebas concluyentes.
- Análisis de deriva temporal en el estilo de escritura: el subcomando `drift` permite observar cómo cambia la forma de escribir de un autor o de una comunidad, lo que puede aplicarse al estudio de la evolución de jergas o registros.
- Auditoría de archivos de foros para periodismo de datos: los periodistas pueden emplear la herramienta para explorar patrones de publicación en archivos públicos, complementando el análisis con la documentación de procedencia que aporta transparencia.
- Enriquecimiento metadatos para investigación histórica de internet: el subcomando `enrich` añade información contextual a las publicaciones, facilitando el análisis de la actividad en foros desaparecidos o fragmentados.
- Monitorización de la actividad de un foro con fines de moderación: aunque no es una herramienta de identificación, puede ayudar a detectar patrones anómalos de publicación, siempre que se respeten las limitaciones éticas y se evite tomar medidas contra personas concretas basándose únicamente en las puntuaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no tratarse de un modelo de IA generativa, las métricas habituales como MMLU, HumanEval o GSM8K no son aplicables. El proyecto no incluye datos de rendimiento cuantitativos sobre velocidad de análisis o precisión de los algoritmos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La herramienta no requiere GPU ni VRAM, ya que no ejecuta modelos de lenguaje.
- GPU recomendadas: no disponible. El análisis estadístico se ejecuta en CPU mediante Python (numpy, pandas, scikit-learn, hdbscan).
- Si cabe en consumer GPU: no aplica. El toolkit está diseñado para ejecutarse en CPU estándar.
- Opciones de despliegue: compilación del binario Go con `go build -o forensic-suite ./cmd/forensic-suite`, creación de un entorno virtual Python (`python3 -m venv .venv`) e instalación de dependencias con `pip install -r requirements.txt`. El servidor Go arranca con `forensic-suite serve`, y la capa Python se descubre automáticamente en `venv/` o `.venv/`, o se puede indicar con `--python`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado herramientas comparables en la información proporcionada, ya que `forensic-suite` es un proyecto específico de análisis forense de foros, no un modelo de IA.

## Limitaciones y advertencias

- Similitud no es identificación: una puntuación de coseno indica que dos muestras de escritura se parecen más que una comparación de referencia, pero no establece autoría común ni identidad real.
- Los identificadores de autor en foros anónimos son débiles: están limitados a un hilo, caducan y pueden reutilizarse, por lo que tratarlos como una persona estable es un error.
- El corpus es incompleto: los hilos caducan y la recolección es parcial, de modo que la ausencia de una señal no es evidencia de ausencia.
- Las puntuaciones no son comparables entre ejecuciones: dependen del corpus presente cuando se calcularon.
- Las muestras pequeñas producen resultados confiables pero inestables: publicaciones cortas y bajo número de publicaciones generan vectores de características inestables.
- La herramienta no está diseñada para la desanonimización de individuos: el proyecto declara explícitamente que su intención es el análisis de archivos y la metodología estilométrica, no la identificación de personas.
- Riesgo de interpretación errónea en producción: si se pretende actuar sobre un resultado de forma que afecte a una persona real, la documentación indica que se debe detener, porque la salida no lo respalda.
- Restricciones de licencia: no disponibles.
- Limitaciones de idioma: no se especifican idiomas soportados; los ejemplos de fuentes (4chan, DesuArchive) sugieren que el análisis está orientado a texto en inglés, pero no se confirma.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/abr00kx/forensic-suite
- No se han encontrado enlaces adicionales (papers, blogs, repositorios) en los resultados de la búsqueda web.
