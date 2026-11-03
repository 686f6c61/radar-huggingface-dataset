# Sneg0wo/Better-Brush

## Resumen

Better Brush 1.0.1 es una aplicacion de escritorio para Windows que implementa un estudio de rotoscopia asistida por IA de forma local. El repositorio, publicado por el usuario Sneg0wo en Hugging Face, distribuye los binarios de instalacion (instalador por slices y version portable en ZIP) junto con paneles de integracion para Adobe After Effects, Premiere y EffectCraft. No se trata de un modelo de lenguaje ni de un modelo fundacional al uso: es un paquete de software que orquesta modelos de segmentacion y matting (la etiqueta `sam2` sugiere el uso de SAM 2) para aislar sujetos en secuencias de video.

El proyecto se posiciona como una alternativa "local-first": no requiere cuenta, no envia telemetria y el material audiovisual del usuario no sale de su maquina. Esa propuesta encaja con flujos de postproduccion donde la confidencialidad del material es critica y donde las soluciones en la nube implican costes recurrentes o subidas de gigabytes de video.

La relevancia actual del paquete es limitada como objeto de evaluacion tecnica de un modelo, ya que la informacion publicada se centra en instrucciones de instalacion y en notas de version (correccion del instalador silencioso de paneles cuando falta Python, estabilidad de EffectCraft). No se publican detalles de arquitectura, pesos, contexto ni benchmarks. La licencia FSL-1.1-MIT es source-available y transiciona a MIT en 2028.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (aplicacion de escritorio; etiqueta `sam2` sugiere segmentacion basada en SAM 2) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (interfaz presumiblemente en ingles; no confirmado) |
| Licencia | FSL-1.1-MIT (source-available; pasa a MIT en 2028) |
| Formato de pesos | no disponible (el repositorio distribuye binarios `.exe`, `.bin` y `.zip`, no pesos de modelo) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo o modelos que emplea la aplicacion. La etiqueta `sam2` y la etiqueta `matting` apuntan a un pipeline de segmentacion de video con propagacion de mascaras (probablemente SAM 2) combinado con un modulo de matting para refinar bordes y alfa. El paquete incluye un runtime propio (`library_name: better-brush`) y paneles de integracion que se comunican con After Effects, Premiere y EffectCraft mediante scripts instalados por lotes (`.bat` / `.cmd`).

No se han publicado datos sobre el conjunto de entrenamiento, el numero de tokens, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card se limita a instrucciones de descarga, instalacion y notas de la version 1.0.1.

## Capacidades

- Rotoscopia asistida por IA sobre secuencias de video, con generacion y propagacion de mascaras por sujeto.
- Matting para refinado de bordes y extraccion de alfa.
- Procesamiento local: el material no se envia a servidores externos y no hay telemetria.
- Integracion con Adobe After Effects y Adobe Premiere mediante paneles instalables.
- Integracion con EffectCraft 0.17.0 o superior mediante un instalador dedicado.
- Distribucion en dos modalidades: instalador con slices `.bin` y version portable en ZIP sin instalacion.
- Soporte de plataforma limitado a Windows.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, por tratarse de una herramienta de vision aplicada y no de un modelo generativo de proposito general.

## Casos de uso

- Rotoscopia de personajes en postproduccion audiovisual: el usuario carga una secuencia, selecciona al sujeto y la herramienta propaga la mascara fotograma a fotograma, reduciendo el trabajo manual de recorte en planos largos.
- Extraccion de alfa para composicion digital: el modulo de matting permite generar canales alfa limpios para integrar actores sobre nuevos fondos en After Effects o Premiere.
- Trabajo con material confidencial bajo NDA: al ejecutarse en local y sin telemetria, es apto para metraje de clientes que no puede subirse a servicios en la nube.
- Limpieza de plate en efectos visuales: la mascara generada se puede usar para eliminar elementos no deseados (cables, marcas, objetos) en planos de rodaje.
- Flujos de edicion en EffectCraft: el panel dedicado permite invocar la rotoscopia desde el propio editor sin salir de la aplicacion, agilizando iteraciones.
- Prototipado rapido en estudios pequenos: la version portable en ZIP permite desplegar la herramienta en estaciones de trabajo sin permisos de administrador ni instalacion de dependencias.
- Formacion y docencia: al ser local y gratuita, se puede usar en aulas para ensenar tecnicas de rotoscopia y matting sin coste de licencias en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El paquete completo ocupa 18,3 GB en el repositorio y la version portable pesa 5,1 GB, lo que sugiere que incluye pesos de modelos y dependencias empaquetadas; no se detalla el consumo en ejecucion.
- GPU recomendadas: no disponible. No se especifica si requiere GPU dedicada, CUDA o si funciona en CPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: aplicacion de escritorio nativa para Windows (`BetterBrush.exe`), instalador con slices `.bin` y paneles para After Effects, Premiere y EffectCraft. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un servidor de inferencia de LLM.
- Latencia y throughput: no disponibles.
- Requisito adicional: Python para la instalacion de los paneles de Adobe (el instalador `Install Everything.bat` lo instala si falta; la version 1.0.1 corrige el fallo silencioso cuando Python no estaba presente).

## Comparativa con modelos similares

| Herramienta | Tipo | Plataforma | Ejecucion local | Licencia | Precio |
|---|---|---|---|---|---|
| Better Brush 1.0.1 | Estudio de rotoscopia con IA | Windows | Si | FSL-1.1-MIT (MIT en 2028) | Gratuita |
| RunwayML (rotoscopia) | Servicio en la nube | Web | No | Propietaria | Suscripcion |
| Adobe After Effects (Roto Brush) | Herramienta integrada en editor | Windows / macOS | Si | Propietaria | Suscripcion |
| SAM 2 (Meta) | Modelo de segmentacion de video | Multiplataforma via codigo | Si | Apache 2.0 (pesos) | Gratuita |

No se dispone de datos de rendimiento comparativo entre Better Brush y estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La informacion publicada no permite evaluar la calidad de la segmentacion ni del matting; no hay benchmarks ni demos comparativas.
- Plataforma limitada a Windows: no se documentan versiones para macOS ni Linux.
- La licencia FSL-1.1-MIT es source-available, no open source plena: restringe ciertos usos comerciales competitivos hasta su conversion a MIT en 2028. Conviene revisar el texto completo antes de integrarla en un producto comercial.
- El repositorio distribuye binarios (`.exe`, `.bin`, `.zip`) en lugar de pesos o codigo fuente directo; la reproducibilidad y la auditoria del contenido son limitadas.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni historial de incidencias publico.
- No se documentan sesgos, tasas de alucinacion ni comportamiento en dominios dificiles (oclusiones, movimiento rapido, bordes de pelo o transparencias), que son los puntos criticos habituales en matting.
- La dependencia de Python para los paneles de Adobe anade un paso de configuracion que puede fallar en entornos corporativos restringidos.
- No se especifican requisitos minimos de hardware, lo que dificulta planificar el despliegue en estaciones de trabajo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Sneg0wo/Better-Brush
- Codigo fuente y documentacion: https://github.com/SnegOwo/Better-Brush
