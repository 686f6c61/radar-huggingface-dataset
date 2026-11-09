# keplerccc/VABAR-arena-assets

## Resumen

VABAR-arena-assets es un repositorio de activos de simulación, no un modelo de lenguaje. Contiene las escenas USD (Universal Scene Description) empleadas por la versión Isaac Lab Arena del proyecto VABAR (Visual Affordances for Bimanual Assistive Robots), desarrollado por el grupo Berkeley Automation de la Universidad de California en Berkeley. El repositorio aloja las mallas de colisión y los cierres SimReady de los 37 objetos que componen los entornos de simulación del proyecto, distribuidos en 361 ficheros y con un tamaño total de 2,3 GB.

El propósito de este repositorio es servir como dependencia de activos para el pipeline de simulación robótica de VABAR sobre Isaac Sim e Isaac Lab. No se trata de pesos entrenados ni de un artefacto inferible: es un conjunto de recursos 3D que alimentan entornos de entrenamiento y evaluación de políticas robóticas. La model card indica explícitamente que no es necesario descargarlo manualmente, ya que el script `isaaclab_arena/setup.sh` del repositorio principal recupera automáticamente la revisión fijada y la coloca en la ruta `isaaclab_arena/isaaclab_arena_vabar/src/isaaclab_arena_vabar/assets/`.

Dado que el artefacto no es un modelo generativo, esta ficha adapta las secciones habituales al contexto real del repositorio: se documentan sus características como conjunto de activos de simulación, su integración en el pipeline de VABAR y las consideraciones de licencia y despliegue que afectan a su uso en investigación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; conjunto de activos USD para Isaac Sim / Isaac Lab) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | mixta (`license: other`, `license_name: mixed`), con detalle en `ASSET_PROVENANCE.md` y `NOTICE` del repositorio VABAR |
| Formato de pesos | no disponible (no aplica); los activos son ficheros USD con mallas de colisión y cierres SimReady |
| Tamano del repositorio | 2,3 GB |
| Numero de ficheros | 361 |
| Numero de objetos | 37 |
| Pipeline declarado | robotics |
| Etiquetas | robotics, simulation, isaac-sim, region:us |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-11-09 |
| Fecha de actualizacion | 2026-11-09 |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: este repositorio no contiene un modelo entrenado ni un proceso de entrenamiento. Se trata de un conjunto de activos de simulación en formato USD (Universal Scene Description), el formato nativo de NVIDIA Omniverse e Isaac Sim. Los activos incluyen los cierres SimReady (geometría preparada para simulación física con propiedades de material y colisión correctas) y las mallas de colisión de los 37 objetos del entorno VABAR, organizados en 361 ficheros.

La integración se realiza a través del repositorio principal VABAR, en su variante Isaac Lab Arena (`isaaclab_arena/`). El script `setup.sh` de esa carpeta descarga la revisión fijada del repositorio de activos y la ubica en la ruta de assets del paquete `isaaclab_arena_vabar`. No se documentan en la información disponible detalles sobre el proceso de creación de las mallas, el motor de físicas empleado más allá de Isaac Sim, ni métricas de calidad de los activos.

## Capacidades

- Provisión de escenas USD completas para simulación robótica en Isaac Sim e Isaac Lab.
- Mallas de colisión para 37 objetos, lo que permite simulación física con detección de contactos.
- Cierres SimReady, es decir, geometría con propiedades de material y colisión preparadas para pipelines de simulación.
- Integración automatizada mediante `isaaclab_arena/setup.sh`, que fija la revisión y evita la descarga manual.
- Compatibilidad con el pipeline de VABAR para entrenamiento y evaluación de políticas robóticas bimanuales.
- No ofrece generación de texto, razonamiento, código, visión por computador ni tool calling: no es un modelo de IA generativa.

## Casos de uso

- Simulación de manipulación bimanual: los 37 objetos con mallas de colisión permiten construir escenas de Isaac Lab donde entrenar y evaluar políticas de agarre y manipulación con dos brazos, aprovechando los cierres SimReady para que las físicas sean estables.
- Reproducibilidad de experimentos: al fijarse una revisión concreta en `setup.sh`, cualquier investigador puede reconstruir exactamente el mismo conjunto de activos y comparar resultados con los del equipo de Berkeley Automation.
- Benchmarking de políticas robóticas: el conjunto de objetos actúa como banco de pruebas estandarizado para medir tasas de éxito en tareas de manipulación, facilitando comparaciones entre métodos.
- Desarrollo de entornos de evaluación en Isaac Lab Arena: los activos se cargan directamente en la ruta `isaaclab_arena_vabar/assets/`, de modo que sirven como base para definir nuevas tareas y recompensas sin tener que modelar geometría desde cero.
- Investigación en percepción visual y affordances: VABAR se centra en affordances visuales para robots asistenciales, por lo que estos activos permiten entrenar y validar modelos de percepción sobre objetos cotidianos en entornos simulados.
- Integración en CI/CD de investigación robótica: el script de instalación automatiza la obtención de activos, lo que permite incorporar la simulación a pipelines de integración continua para pruebas de regresión de políticas.
- Docencia y prototipado rápido: al ser un conjunto acotado (2,3 GB, 361 ficheros), resulta manejable para cursos o prototipos que necesiten escenas robóticas realistas sin construir un dataset propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 2,3 GB para el repositorio de activos, más el espacio adicional de la instalación de Isaac Sim e Isaac Lab.
- GPU: se requiere una GPU compatible con NVIDIA Isaac Sim (RTX serie 20 o superior, o GPUs de datacenter como A100 o H100); no se especifican requisitos mínimos exactos en la información disponible.
- VRAM: no disponible; depende de la escena y del número de objetos instanciados, no del repositorio en sí.
- Cabe en GPU de consumo: sí, siempre que se cumplan los requisitos de Isaac Sim; no se detallan cifras concretas.
- Opciones de despliegue: Isaac Sim e Isaac Lab; los activos se integran mediante `isaaclab_arena/setup.sh` del repositorio VABAR.
- Latencia y throughput: no disponibles; dependen de la escena y del hardware, no del repositorio de activos.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada conjuntos de activos comparables de otros proyectos de simulación robótica con los que establecer una comparación rigurosa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de IA: no puede usarse para inferencia, generación de texto, código ni ninguna tarea de aprendizaje automático directa.
- Licencia mixta: cada activo puede tener una procedencia y licencia distinta; es obligatorio revisar `ASSET_PROVENANCE.md` y `NOTICE` del repositorio VABAR antes de cualquier uso, especialmente comercial.
- Dependencia de Isaac Sim: los activos están en formato USD y presuponen el ecosistema NVIDIA Omniverse; no son directamente utilizables en otros simuladores sin conversión.
- Sin métricas de calidad publicadas: no se documentan en la información disponible evaluaciones de fidelidad física, estabilidad de colisiones ni realismo de los materiales.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario que permita validar su robustez en producción.
- Fecha de creación futura (2026-11-09): conviene verificar la vigencia y posibles actualizaciones del repositorio antes de fijar una revisión.
- Idiomas no aplicables: al no ser un modelo lingüístico, no procede evaluar capacidades multilingües.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/keplerccc/VABAR-arena-assets
- Repositorio principal VABAR: https://github.com/BerkeleyAutomation/VABAR
- Procedencia y licencias de activos: https://github.com/BerkeleyAutomation/VABAR/blob/main/ASSET_PROVENANCE.md
