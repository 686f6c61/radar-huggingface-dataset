# AIGeeksGroup/DragMesh-3

## Resumen

DragMesh-3 es un repositorio de tipo "model" alojado en Hugging Face por AIGeeksGroup que, segun su propia model card, **no es una release de un modelo entrenado**, sino un *artifact hub*: un contenedor de activos y evidencias para el proyecto DragMesh-3, cuyo codigo vive en GitHub. El contenido se organiza en dos ramas: `interaction/`, con un baseline curado de 200 rollouts junto con manifiestos, auditorias, videos de revision y archivos congelados de referencia del pipeline; y `scene/`, con siete archivos completos de escenas de habitacion en MuJoCo (MJCF y todas las mallas y texturas referenciadas).

El proyecto se enmarca en robotica y objetos articulados sobre el simulador MuJoCo, con pipelines que la model card describe como CoDA → UMR → MuJoCo para interaccion y adaptacion de controladores, y SceneSmith para generacion y exportacion de escenas. El baseline actual es SONIC, con entrenamiento SuperMimic e integracion de adaptadores planificados. El repositorio no incluye pesos de red neuronal ni un modelo generativo: lo que se descarga son activos de simulacion, manifiestos y registros de auditoria.

Es relevante ahora porque estandariza y hace verificable un conjunto de activos de simulacion reproducible (hashes SHA-256 por archivo, manifiestos de dependencia MJCF, registros de carga del modelo), lo que facilita a investigadores en robotica de manipulacion y humanoides reproducir escenas y auditar rollouts sin depender de rutas absolutas ni de snapshots locales. No obstante, su valor es de infraestructura y evidencia, no de rendimiento de un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; repositorio de activos de simulacion MuJoCo) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card indica que los activos subyacentes conservan sus terminos de origen y no se aplica una relicencia global) |
| Formato de pesos | no disponible; los artefactos son MJCF, mallas, texturas, manifiestos JSON, archivos comprimidos y videos |
| Tamano del repositorio | 1,4 GB (la vista de archivos de Hugging Face muestra 1,26 GB) |
| Pipeline declarado | robotics |
| Etiquetas | robotics, mujoco, articulated-objects, humanoid |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal en este repositorio. El contenido tecnico son activos de simulacion fisica para MuJoCo: escenas de habitacion completas en formato MJCF, con todas las mallas y texturas a las que hace referencia cada MJCF, empaquetadas de modo que no se necesitan rutas absolutas de malla y basta con abrir `<room>/scene.xml` en MuJoCo. Cada archivo de escena incluye manifiestos SHA-256 por fichero y registros de carga del modelo.

En la rama de interaccion, el repositorio contiene un baseline curado de 200 rollouts, el paquete exacto de activos, manifiestos, auditorias, videos de revision seleccionados y archivos congelados de referencia y runtime del pipeline. La procedencia de estos rollouts es el dataset `Neptune-T/DM3-rollouts` en el commit `1ac15a86cfc43abeea33c6eb4c98b4a7475d7854`. Las escenas provienen de snapshots de trabajo locales originados en `Neptune-T/DragMesh-3-Scene` en el commit `1796aebf7dc5837f88476010ea1da350ccc03241`, reempaquetados segun dependencia real de MJCF y no necesariamente identicos byte a byte a los ficheros historicos de Hugging Face. No se documentan datos de entrenamiento, tokens, composicion de dataset ni fases de RLHF/DPO porque no existe un modelo entrenado en esta release.

## Capacidades

- Distribucion de activos de simulacion MuJoCo: siete escenas de habitacion completas y portables, con MJCF, mallas y texturas referenciadas.
- Verificacion de integridad: manifiestos SHA-256 por archivo y registros de carga del modelo para cada escena.
- Reproducibilidad de interaccion: baseline de 200 rollouts con manifiestos, auditorias y videos de revision.
- Congelacion de pipeline: archivos de referencia y runtime archivados para fijar versiones del pipeline CoDA → UMR → MuJoCo.
- Soporte de flujo de trabajo con Hugging Face CLI: descarga selectiva por patrones (`interaction/*`, `scene/*`).
- No incluye generacion de texto, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Reproduccion de experimentos de robotica: descargar `interaction/*`, verificar cada archivo contra `interaction/source_manifest.json` y reconstruir el baseline de 200 rollouts para comparar resultados propios con una referencia fija.
- Desarrollo y depuracion de controladores en MuJoCo: extraer una escena de `scene/*`, abrir `<room>/scene.xml` y probar controladores de manipulacion de objetos articulados sin gestionar rutas absolutas de malla.
- Auditoria de resultados de simulacion: usar los registros de auditoria y los videos de revision para separar rollouts aceptados de fallos, aplicando auditorias independientes de contacto, objetivo, retencion y colision sobre la escena exacta.
- Benchmarking interno de pipelines de adaptacion: fijar los archivos de referencia y runtime congelados para que las comparaciones entre versiones del pipeline CoDA → UMR → MuJoCo sean reproducibles.
- Generacion y exportacion de escenas: emplear las escenas de `scene/` como material de partida o validacion para el flujo SceneSmith, comprobando que el MJCF exportado carga correctamente en MuJoCo.
- Integracion en CI de simulacion: incorporar la verificacion de hashes y los registros de carga como pasos automatizados que detecten activos corruptos o dependencias de malla rotas antes de ejecutar entrenamientos o evaluaciones.
- Docencia y formacion en robotica: disponer de escenas de habitacion completas y autocontenidas para ejercicios de simulacion de humanoides y objetos articulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explicitamente de que los 200 rollouts no son 200 objetos distintos y no establecen exito general sobre geometria nueva, y de que la compilacion de escenas y las trayectorias de animacion de objetos no equivalen a exito fisico en la tarea del robot.

## Requisitos de hardware

- VRAM: no aplica; no hay pesos de modelo neuronal que cargar en GPU.
- Almacenamiento: aproximadamente 1,4 GB para el repositorio completo (1,26 GB segun la vista de archivos); la descarga selectiva por ramas reduce el espacio necesario.
- CPU y RAM: suficientes para ejecutar MuJoCo y cargar las escenas; el coste depende de la complejidad de mallas y texturas de cada habitacion, no de un modelo.
- GPU: no es requisito para el contenido del repositorio; el renderizado y la simulacion pueden acelerarse con GPU, pero no se documentan requisitos concretos.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; las herramientas relevantes son el cliente `hf` de Hugging Face para la descarga y MuJoCo para abrir las escenas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada repositorios comparables de la misma categoria (hubs de activos de simulacion MuJoCo con auditorias y manifiestos de integridad). La comparacion con modelos de lenguaje o multimodales no seria pertinente porque DragMesh-3 no contiene pesos de modelo.

## Limitaciones y advertencias

- No es un modelo entrenado: no debe evaluarse ni desplegarse como un modelo de IA; es un hub de artefactos y evidencias.
- La licencia no esta disponible y la model card indica que todos los activos y modelos subyacentes conservan sus terminos de origen, sin relicencia global; es necesario revisar las condiciones de cada fuente antes de uso comercial.
- Los 200 rollouts no representan 200 objetos distintos y no demuestran exito general sobre geometria nueva.
- El exito en compilacion de escenas y en trayectorias de animacion de objetos no equivale a exito fisico en la tarea del robot; cada rollout requiere su propia auditoria de contacto, objetivo, retencion y colision sobre la escena exacta.
- Las escenas son reempaquetados por dependencia real de MJCF y no se garantiza que sean copias identicas byte a byte de los ficheros historicos de Hugging Face.
- Se han omitido duplicados no referenciados, frames de render, caches, logs de API, entornos y arboles de codigo fuente en bruto, por lo que el repositorio no es un archivo exhaustivo del proyecto.
- El codigo no esta en Hugging Face sino en GitHub; la rama `main` cubre interaccion y adaptacion de controladores, y la rama `scene` cubre generacion y exportacion con SceneSmith.
- SuperMimic y la integracion de adaptadores estan planificados, no disponibles en esta release.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AIGeeksGroup/DragMesh-3
- Arbol de archivos: https://huggingface.co/AIGeeksGroup/DragMesh-3/tree/main
- Codigo en GitHub: https://github.com/AIGeeksGroup/DragMesh-3
- Dataset de origen de rollouts: https://huggingface.co/datasets/Neptune-T/DM3-rollouts
- Dataset de origen de escenas: https://huggingface.co/datasets/Neptune-T/DragMesh-3-Scene
- Commit de rollouts: `1ac15a86cfc43abeea33c6eb4c98b4a7475d7854`
- Commit de escenas: `1796aebf7dc5837f88476010ea1da350ccc03241`
