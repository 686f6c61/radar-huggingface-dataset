# andyc03/handoff_repo

## Resumen

El repositorio `andyc03/handoff_repo` no contiene un modelo de inteligencia artificial generativa, sino una herramienta de evaluación para el sistema de archivos DTAP (os-filesystem). Se trata de una imagen de contenedor autocontenida que permite ejecutar la evaluación completa dentro de un único contenedor, sin necesidad de demonio Docker ni privilegios de root. Está diseñada para clústeres de cálculo que usan Slurm con Enroot/Pyxis o Apptainer, donde no hay demonio Docker disponible. El autor es andyc03 (Nanxi Li) y el repositorio tiene un tamaño de 0.5 GB.

La utilidad principal es ejecutar una batería de pruebas (benignas y maliciosas) sobre un servicio de estado de archivos, generar un veredicto mediante un juez local y escribir el conjunto completo de trazas de ejecución. Es una herramienta de infraestructura para evaluar la seguridad y el comportamiento de un sistema de archivos ante ataques o usos normales, no un modelo de lenguaje. No se trata de un modelo de IA, por lo que las especificaciones técnicas habituales de modelos (parámetros, arquitectura, contexto) no son aplicables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo de IA) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica |
| Licencia | Apache-2.0 (según búsqueda web; en la ficha de Hugging Face figura "no disponible") |
| Formato de pesos | No aplica (el repositorio contiene una imagen de contenedor comprimida, scripts y pruebas) |

## Arquitectura y entrenamiento

No existe una arquitectura de red neuronal ni proceso de entrenamiento. El repositorio contiene una imagen de contenedor precompilada (~474 MB) que ejecuta el entorno de evaluación DTAP os-filesystem. El sistema incluye un servicio de estado de mundo (world-state) que se ejecuta como proceso local, un juez (judge) que también corre localmente, y la evaluación se comunica con ambos mediante `127.0.0.1`. La imagen está preparada para ejecutarse sin demonio Docker, mediante Enroot o Apptainer. La configuración se realiza mediante un fichero `env.template` que el usuario debe rellenar con credenciales (victim y judge). El flujo de trabajo consiste en lanzar un trabajo Slurm que ejecuta la imagen, la cual procesa secuencialmente un conjunto de tareas y escribe por cada una los resultados completos (veredicto, trayectoria y trazas).

No hay innovaciones técnicas de modelos de IA. La innovación está en el empaquetado: una imagen autocontenida que funciona sin Docker y sin privilegios, apta para clústeres con restricciones de seguridad.

## Capacidades

El repositorio no proporciona un modelo con capacidades de lenguaje, código o razonamiento. Sus capacidades son funcionales:

- Ejecutar una evaluación de un sistema de archivos (os-filesystem) dentro de un único contenedor.
- Soportar dos modos de prueba: benigna (tareas normales) y maliciosa (ejercita el camino de ataque/defensa).
- Generar un conjunto completo de trazas por tarea: `judge_result.json`, `trajectory_*.json`, `traces/*.jsonl`, `task.log`.
- Permitir la configuración de víctima y juez mediante variables de entorno (OpenRouter, endpoint OpenAI-compatible, Bedrock).
- Ejecutar de forma secuencial las tareas de un split, con opción de montar un fichero de split externo.
- Integrarse con Slurm mediante un script de ejemplo (`run_on_slurm.sbatch`).
- Soportar cambios en tiempo de ejecución sin reconstruir la imagen (defensa, split, API, código del harness).

## Casos de uso

- Evaluación de seguridad de sistemas de archivos en entornos de investigación: el contenedor ejecuta ataques y defensas sobre un servicio de estado de archivos y reporta si el ataque tuvo éxito, permitiendo probar la robustez del sistema.
- Validación de pipelines de evaluación en clústeres sin Docker: al no requerir demonio Docker ni privilegios root, es útil para clústeres de cálculo con restricciones de seguridad (Enroot/Apptainer).
- Automatización de pruebas de regresión: se pueden lanzar múltiples trabajos Slurm con distintos splits y defensas para verificar que los cambios en el sistema no rompen la evaluación.
- Investigación sobre agentes de IA en entornos de archivos: aunque el repositorio no es un modelo, puede usarse para evaluar agentes que interactúan con un sistema de archivos real, midiendo su comportamiento en tareas benignas y maliciosas.
- Benchmarking de infraestructura de evaluación: permite comparar el rendimiento de distintos sistemas de archivos o configuraciones de juez midiendo el tiempo de ejecución y la calidad de las trazas.
- Reproducibilidad de experimentos: al ser una imagen autocontenida, se puede replicar el mismo entorno de evaluación en distintos clústeres y comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento del sistema evaluado, solo de la herramienta de evaluación en sí. No hay datos de latencia, throughput ni comparativas numéricas.

## Requisitos de hardware

- El repositorio no indica requisitos de hardware específicos para el contenedor. La imagen ocupa ~474 MB comprimida, por lo que necesita espacio de almacenamiento en el clúster.
- Es necesario un clúster de cálculo con gestor de trabajos Slurm, y bien Enroot/Pyxis o Apptainer para ejecutar el contenedor.
- No requiere GPU, ya que no se trata de un modelo de aprendizaje; es una herramienta de evaluación que se ejecuta en CPU.
- La memoria RAM dependerá del número de tareas concurrentes (se recomienda `MAXP=1` para evitar problemas con el servicio de estado compartido).
- Se recomienda un sistema de almacenamiento compartido (NFS o similar) para que los nodos de cálculo accedan a la imagen y a los resultados.
- Para la ejecución, se necesita un fichero `my.env` con las credenciales de la víctima y del juez, así como las variables de configuración.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA y no existe una categoría comparable de modelos. Es una herramienta de infraestructura de evaluación, por lo que no se puede comparar con LLMs ni con otros modelos generativos.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, código ni ninguna salida de modelo. Cualquier uso que espere un comportamiento de LLM será incorrecto.
- La imagen requiere credenciales reales para funcionar (la imagen incluye `REPLACE_ME` para claves). No funcionará hasta que se complete el fichero `my.env`.
- La ejecución es secuencial por contenedor; no se recomienda aumentar `MAXP` porque el servicio de estado compartido no es seguro con concurrencia.
- El repositorio no proporciona documentación sobre el sistema de archivos evaluado (DTAP os-filesystem) más allá de lo mencionado en la model card.
- La licencia es Apache-2.0 según la búsqueda web, pero la página de Hugging Face no la especifica claramente; conviene verificar antes de uso comercial.
- Las fechas de creación y actualización (2026-08) sugieren que el proyecto es reciente; puede tener cambios sin documentar.

## Enlaces

- [Repositorio en Hugging Face: andyc03/handoff_repo](https://huggingface.co/andyc03/handoff_repo)
- [Perfil del autor en Hugging Face](https://huggingface.co/andyc03)
- [GitHub Topic "ai-handoff"](https://github.com/topics/ai-handoff) (relacionado con conceptos de handoff, no directamente con este repositorio)
- [Blog sobre handoff de contexto para IA](https://www.jdhodges.com/blog/ai-session-handoffs-keep-context-across-conversations/) (no relacionado directamente, aparece en la búsqueda)

Nota: los enlaces a GitHub y al blog no están directamente relacionados con el contenido del repositorio, sino que surgieron en la búsqueda web genérica de "handoff". El único enlace relevante es el de Hugging Face.
