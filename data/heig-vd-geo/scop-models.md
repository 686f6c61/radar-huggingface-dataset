# heig-vd-geo/scop-models

## Resumen

SCOP models es un repositorio de catálogo y espejo de pesos para SCOP, una herramienta de fotogrametría desarrollada por el grupo HEIG-VD INSIT (Suiza). No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un contenedor de modelos de segmentación semántica exportados a ONNX que la aplicación SCOP consume para tareas de análisis de imágenes dentro de su flujo de trabajo fotogramétrico. El repositorio incluye un fichero `models.json` con un esquema versionado que describe cada modelo disponible, su contrato de entrada/salida, su URL de origen, su hash SHA-256 y su licencia.

El contenido alojado directamente en este repositorio se limita, según la model card, a dos exportaciones ONNX de la misma red UperNet con backbone Swin-Tiny entrenada en ADE20K: una a 576 píxeles y otra a 384 píxeles (aproximadamente el doble de rápida en CPU). SCOP emplea la clase `sky` de estas segmentaciones, y el resto de entradas del catálogo apuntan a fuentes originales externas (detectores basados en Ultralytics en SWITCHdrive, pesos LCD en GitHub, skyseg en Hugging Face).

La relevancia de este repositorio es acotada y muy específica: sirve como punto de distribución reproducible y verificable (mediante SHA-256) para los modelos que SCOP necesita y que carecen de otra fuente pública. No aporta un modelo nuevo ni resultados de benchmarks propios; su interés para desarrolladores e investigadores radica en el esquema de catálogo y en la cadena de verificación de integridad, no en capacidades de IA generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UperNet con backbone Swin-Tiny (para los pesos alojados); catálogo de modelos heterogéneos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (exportación ONNX en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT (repositorio y pesos alojados); datos de entrenamiento ADE20K con licencia solo para investigación y educación |
| Formato de pesos | ONNX (dentro de un catálogo `models.json` con esquema 1) |

## Arquitectura y entrenamiento

Los pesos alojados corresponden a UperNet con backbone Swin-Tiny, entrenados sobre ADE20K y exportados a ONNX. La exportación a 576 píxeles incluye la operación softmax dentro del grafo; existe una segunda exportación a 384 píxeles descrita como aproximadamente el doble de rápida en CPU. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo ajuste posterior; se trata de un modelo de segmentación semántica estándar reutilizado, no de un modelo entrenado específicamente por el equipo de SCOP.

La innovación técnica del repositorio no está en la red neuronal sino en el mecanismo de catálogo: el esquema `models.json` (versión 1) define para cada entrada los campos `id`, `version`, `contract`, `url`, `sha256`, `size`, `licence`, `commercial_ok` y opcionalmente `notes`. El campo `contract` cambia cuando cambian las entradas o salidas del modelo, de modo que una versión de SCOP solo utiliza entradas compatibles con el contrato para el que fue escrita. Cada fichero se verifica contra su SHA-256 tras la descarga, y SCOP solo consulta `models.json` cuando el usuario solicita explícitamente actualizaciones (`scop.utils.models.check_updates()` o el diálogo "Models and caches"), sin actualizaciones silenciosas.

## Capacidades

- Segmentación semántica de imágenes mediante UperNet + Swin-Tiny, con extracción de la clase `sky` en el flujo de SCOP.
- Exportación ONNX ejecutable en CPU, con dos resoluciones de entrada (576 px y 384 px) para intercambiar precisión por velocidad.
- Catálogo versionado de modelos con contratos de entrada/salida explícitos, que permite a SCOP seleccionar únicamente modelos compatibles con su versión.
- Verificación de integridad por SHA-256 de cada fichero descargado.
- Distribución de pesos sin fuente pública alternativa, con metadatos de licencia y de compatibilidad comercial (`commercial_ok`).
- Integración de modelos de terceros mediante referencias a sus fuentes originales (Ultralytics, LCD, skyseg).
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni soporte multilingüe.

## Casos de uso

- Segmentación de cielo en flujos fotogramétricos: SCOP carga la exportación ONNX de UperNet + Swin-Tiny y aísla la clase `sky` para enmascarar o tratar el cielo en imágenes de levantamiento, evitando artefactos en la reconstrucción.
- Procesamiento en CPU con requisitos ajustados: la variante de 384 px, aproximadamente el doble de rápida en CPU, permite ejecutar la segmentación en estaciones de trabajo sin GPU dedicada dentro de un pipeline fotogramétrico.
- Despliegue reproducible en entornos de investigación: el hash SHA-256 de cada fichero permite fijar versiones exactas de los pesos y garantizar que dos instalaciones ejecutan el mismo modelo.
- Gestión controlada de actualizaciones en producción: la comprobación explícita mediante `check_updates()` y el diálogo de "Models and caches" permiten auditar cuándo y qué modelos se actualizan, sin cambios silenciosos.
- Auditoría de licencias en uso comercial: el campo `commercial_ok` y la licencia por entrada permiten filtrar modelos antes de integrarlos en productos; en el caso de los pesos ADE20K, la licencia de los datos exige verificar la compatibilidad del uso comercial.
- Desarrollo de extensiones sobre SCOP: el esquema `models.json` con contratos versionados sirve como base para añadir nuevos modelos de segmentación o detectores manteniendo la compatibilidad con versiones concretas de la aplicación.
- Reutilización del export ONNX fuera de SCOP: al ser un grafo ONNX autocontenido (con softmax incluido en la variante de 576 px), puede cargarse con ONNX Runtime en otras aplicaciones de segmentación semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que la exportación a 384 px es aproximadamente el doble de rápida en CPU que la de 576 px, sin cifras absolutas de latencia ni de precisión (mIoU u otras métricas).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser modelos ONNX de segmentación de tamaño moderado (UperNet + Swin-Tiny), la inferencia es viable en CPU; no se documentan requisitos de VRAM.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el diseño con exportaciones ONNX y la mención de rendimiento en CPU sugieren que el objetivo principal es la ejecución en CPU.
- Opciones de despliegue: ONNX Runtime como runtime natural para los ficheros `.onnx`; la integración principal es la aplicación SCOP, que gestiona la descarga, verificación SHA-256 y carga de los modelos.
- Latencia y throughput: no disponibles; solo se indica la relación aproximada de 2x entre las variantes de 384 px y 576 px en CPU.
- Tamaño del repositorio: 0,6 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución de entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SCOP models (UperNet + Swin-Tiny, ADE20K) | Segmentación semántica | 576 px / 384 px | ONNX | MIT (pesos); datos ADE20K solo investigación y educación | Hugging Face (heig-vd-geo/scop-models) |
| openmmlab/upernet-swin-tiny | Segmentación semántica | no disponible | Pesos originales (no ONNX) | no disponible en la información | Hugging Face |
| skyseg | Segmentación de cielo | no disponible | no disponible | no disponible en la información | Hugging Face (referenciado por el catálogo) |
| Detectores basados en Ultralytics | Detección de objetos | no disponible | no disponible | no disponible en la información | SWITCHdrive (referenciados por el catálogo) |

No se dispone de datos de rendimiento comparativo (mIoU, latencia) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de generación de texto, razonamiento, código, tool calling y cualquier capacidad conversacional; no debe evaluarse como tal.
- Los pesos alojados están entrenados sobre ADE20K, cuyos datos tienen licencia solo para investigación y educación; es necesario verificar la compatibilidad del uso comercial de las segmentaciones aunque los pesos se distribuyan bajo MIT.
- El repositorio es principalmente un catálogo: la mayor parte de las entradas apuntan a fuentes externas (SWITCHdrive, GitHub, Hugging Face) cuya disponibilidad y licencia no controla este repositorio.
- Riesgo de dependencia de fuentes externas: si una URL de origen deja de estar disponible, la entrada correspondiente del catálogo queda inutilizable salvo que exista un espejo alojado.
- El campo `contract` impide usar entradas incompatibles con la versión de SCOP instalada, lo que puede limitar el acceso a modelos nuevos hasta actualizar la aplicación.
- No se documentan sesgos, métricas de precisión ni evaluación de robustez de los modelos de segmentación incluidos.
- No hay información sobre cuantizaciones adicionales ni sobre requisitos de hardware más allá de la mención al rendimiento en CPU.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks propios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/heig-vd-geo/scop-models
- Repositorio del proyecto SCOP: https://git.cephee.ch/adrien/scop
- Modelo base UperNet + Swin-Tiny: https://huggingface.co/openmmlab/upernet-swin-tiny
