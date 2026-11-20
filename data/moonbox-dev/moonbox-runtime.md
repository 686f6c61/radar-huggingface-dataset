# moonbox-dev/moonbox-runtime

## Resumen

`moonbox-dev/moonbox-runtime` no es un modelo de inteligencia artificial. Es un repositorio de artefactos de distribución publicado en Hugging Face por el desarrollador `moonbox-dev`, cuyo contenido son los paquetes que descarga la aplicación de escritorio Moonbox para macOS con Apple silicon. La model card del autor es explícita: "What the Moonbox desktop app downloads besides models; not a model". Por tanto, no existe arquitectura de red neuronal, no hay pesos entrenados ni tokenizador, y no procede evaluarlo como un LLM.

El repositorio se organiza en tres packs versionados, cada uno compuesto por archivos tar bajo la ruta `<pack>/<version>/`: `engine-core` (paquetes Python, código de ejecución de modelos y herramientas nativas como ffmpeg y el servidor de llama.cpp), `browser` (una compilación de Chromium, Chrome for Testing, usada por el asistente de la app para leer páginas web) y `gallery` (imágenes, clips, sonidos y modelos 3D de ejemplo). La aplicación obtiene la lista de archivos y sus sumas de verificación de un manifiesto firmado alojado en `moonbox-dev/moonbox-app`, y valida cada archivo antes de descomprimirlo.

Su relevancia es, por tanto, la de un canal de distribución de dependencias de una aplicación de escritorio, no la de un componente de IA publicable. El tamaño del repositorio (1,7 GB) corresponde al conjunto de los tres packs. Cualquier evaluación técnica del mismo debe centrarse en el empaquetado, la integridad y las condiciones de uso, no en capacidades cognitivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; repositorio de artefactos de distribución) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible como licencia estándar; los términos del autor prohíben copiar, modificar o redistribuir su código y medios salvo para ejecutar la app Moonbox. Las partes de terceros conservan sus propias licencias, incluidas en los archivos (`licenses/` en `engine-core` y `browser`) |
| Formato de pesos | no disponible (no hay pesos); el repo contiene archivos tar organizados como `<pack>/<version>/` |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El repositorio es un contenedor de distribución con tres packs: `engine-core`, que agrupa los paquetes Python, el código que ejecuta los modelos y las herramientas nativas (ffmpeg y el servidor de llama.cpp) para macOS sobre Apple silicon; `browser`, que contiene una compilación de Chromium (Chrome for Testing) empleada por el asistente para leer páginas web; y `gallery`, con medios de ejemplo (imágenes, clips, sonidos y modelos 3D).

El mecanismo de integridad es la innovación técnica destacable del paquete: la app descarga un manifiesto firmado desde `moonbox-dev/moonbox-app` con la lista de archivos y sus checksums, y verifica cada archivo antes de descomprimirlo. No se documenta en la información disponible el algoritmo de firma, el formato exacto del manifiesto ni el esquema de versionado más allá del patrón `<pack>/<version>/`.

## Capacidades

- No es un modelo: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- Distribución de dependencias de ejecución: entrega los paquetes Python y las herramientas nativas con las que la app Moonbox ejecuta modelos en Mac con Apple silicon.
- Provisión de un navegador embebido: el pack `browser` habilita la lectura de páginas web por parte del asistente de la app.
- Provisión de contenido de ejemplo: el pack `gallery` sirve imágenes, clips, sonidos y modelos 3D para la interfaz.
- Verificación de integridad: cada archivo se valida contra el checksum del manifiesto firmado antes de su descompresión.
- No se documentan capacidades de tool calling, agentes, multilingüismo ni modos de razonamiento, al no tratarse de un modelo.

## Casos de uso

- Distribución de dependencias para la app Moonbox: el repositorio actúa como origen de los archivos que la aplicación de escritorio descarga en la primera ejecución o al actualizar, con verificación de checksums contra el manifiesto firmado.
- Empaquetado de un runtime local de inferencia en macOS: `engine-core` incluye el servidor de llama.cpp y los paquetes Python necesarios para ejecutar modelos en Apple silicon, lo que permite a la app operar sin depender de servicios en la nube.
- Navegación web asistida: el pack `browser` proporciona una compilación de Chromium que el asistente usa para leer páginas, un caso típico de automatización de extracción de contenido con un navegador headless controlado.
- Contenido de demostración para una app de creación multimedia: `gallery` suministra imágenes, clips, sonidos y modelos 3D que la aplicación muestra al usuario como ejemplos iniciales.
- Auditoría de cadena de suministro: un equipo de seguridad puede inspeccionar los archivos tar, los checksums y los textos de licencia de terceros para evaluar qué se instala en el equipo del usuario final.
- Replicación de un entorno de escritorio para pruebas: los packs permiten reconstruir el entorno de ejecución de Moonbox en máquinas de CI o de QA con Apple silicon, siempre dentro de los términos del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El objeto no es un modelo y no admite evaluación mediante MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM: no aplica; no hay pesos de modelo que cargar. El repositorio ocupa 1,7 GB en disco.
- Plataforma objetivo: macOS sobre Apple silicon, según indica la model card para el pack `engine-core`.
- GPU recomendadas: no disponibles; el runtime está pensado para la GPU integrada de los chips Apple silicon, sin que se detallen modelos concretos de chip.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual (no hay inferencia de un modelo de este repositorio); el hardware destinatario es un Mac con Apple silicon.
- Opciones de despliegue: la única vía prevista es la app Moonbox, que descarga los packs y verifica su integridad mediante el manifiesto firmado. No se documenta uso con vLLM, llama.cpp, Ollama o TGI de forma independiente; llama.cpp aparece únicamente como herramienta incluida dentro de `engine-core`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no es un modelo. Como referencia de categoría, podría compararse con otros repositorios de artefactos de distribución en Hugging Face, pero la información proporcionada no incluye alternativas de ese tipo con datos verificables.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal en comparativas de LLM.
- Restricciones de licencia severas: los términos del autor no conceden licencia para copiar, modificar o redistribuir su código y medios, ni para usarlos fuera de la ejecución de la app Moonbox. El uso comercial queda sujeto a esos términos.
- Licencias de terceros: los componentes de terceros conservan sus propias licencias, cuyos textos viajan dentro de los archivos (`licenses/` en `engine-core` y `browser`); es responsabilidad del usuario revisarlas antes de cualquier uso.
- Dependencia de un manifiesto externo: la validez e integridad de los archivos depende del manifiesto firmado publicado en `moonbox-dev/moonbox-app`; si este no está disponible o cambia, la verificación falla.
- Plataforma limitada: el pack `engine-core` está descrito para macOS con Apple silicon, lo que excluye Windows, Linux y Macs con Intel.
- Ausencia de datos de gobernanza: no se publican licencia estándar, idiomas ni pipeline, lo que dificulta la evaluación automatizada y la trazabilidad.
- Metadatos del repositorio con fecha futura (creado el 2026-11-19), sin descargas ni likes, lo que impide validar su adopción real.
- Los resultados de búsqueda web sobre "Moonbox" corresponden a productos no relacionados (areneros para gatos y una caja de camping), por lo que no aportan información técnica sobre este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moonbox-dev/moonbox-runtime
- Manifiesto firmado de la app: https://huggingface.co/moonbox-dev/moonbox-app
- Sitio del proyecto: https://moonbox.dev
