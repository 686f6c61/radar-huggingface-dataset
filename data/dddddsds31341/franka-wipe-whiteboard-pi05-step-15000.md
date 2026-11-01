# dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-15000

## Resumen

Franka Wipe Whiteboard π0.5 — step 15000 es un checkpoint de ajuste fino completo (full fine-tuning) del modelo base `pi05_base` de Physical Intelligence, especializado en una unica tarea robotica: borrar la escritura de una pizarra blanca con un brazo Franka. Lo publica el usuario dddddsds31341 en Hugging Face dentro del ecosistema OpenPI, la implementacion en JAX del stack de vision-language-action (VLA) de Physical Intelligence. No es un modelo de lenguaje general, sino una politica visuomotora que mapea observaciones (imagenes de dos camaras y estado del robot) y una instruccion en lenguaje natural a acciones continuas de 7 dimensiones.

El interes tecnico esta en que ejemplifica el flujo de trabajo de OpenPI: partir de un VLA preentrenado (π0.5), ajustarlo con aprendizaje por imitacion sobre un dataset propio en formato LeRobot y publicar el checkpoint Orbax resultante con estadisticas de normalizacion y parametros EMA. El checkpoint corresponde al paso 15.000 de un total de 20.004, con batch global de 32, y esta pensado exclusivamente para inferencia; no incluye estado del optimizador, por lo que no permite reanudar el entrenamiento de forma exacta.

Es relevante ahora porque el ecosistema de VLA abiertos (OpenPI, LeRobot, π0.5) esta permitiendo a laboratorios pequenos reproducir politicas de manipulacion sobre hardware comercial como Franka. La ficha debe leerse con cautela: se trata de un artefacto de investigacion de un autor individual, con cero descargas y sin licencia declarada, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5 de Physical Intelligence, implementada en JAX sobre OpenPI |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint Orbax en precision de entrenamiento) |
| Idiomas soportados | no disponible (las instrucciones se proporcionan como prompt de texto; el entrenamiento usa el prompt en ingles "Erase the writing from the whiteboard.") |
| Licencia | no disponible |
| Formato de pesos | Checkpoint Orbax (OpenPI), con parametros EMA y estadisticas de normalizacion |
| Paso de entrenamiento | 15.000 / 20.004 |
| Batch global | 32 (acumulacion de gradiente 1) |
| Camaras | externa + muneca (wrist) |
| Estado del robot | 19D continuo (Franka) |
| Accion | 7D delta en marco del cuerpo |
| Horizonte de accion | 10 |
| Dataset de entrenamiento | dddddsds31341/wipe-whiteboard-lerobot (formato LeRobot) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del VLA π0.5 (`pi05_base`) de Physical Intelligence, ejecutado con OpenPI en JAX. π0.5 es un modelo vision-language-action que combina un backbone de vision-lenguaje con un cabezal de acciones continuas; en esta configuracion recibe dos flujos de imagen (camara externa y camara de muneca) junto con un vector de estado del robot de 19 dimensiones, y emite secuencias de acciones de 7 dimensiones en marco del cuerpo con un horizonte de 10 pasos. La instruccion de tarea se pasa como prompt de texto.

El entrenamiento es de aprendizaje por imitacion supervisado sobre el dataset `wipe-whiteboard-lerobot`, con batch global de 32 y sin acumulacion de gradiente, hasta el paso 15.000 de 20.004 previstos. El repositorio incluye parametros EMA y estadisticas de normalizacion, lo que sugiere el uso habitual en OpenPI de medias movidas exponenciales para estabilizar la politica final. No se documentan en la informacion disponible el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF o DPO; en el contexto de OpenPI, el ajuste tipico es puramente conductual (behavior cloning) sobre demostraciones.

La innovacion relevante no esta en el checkpoint en si, sino en el pipeline: reutilizar un VLA preentrenado y adaptarlo a una tarea concreta con pocos miles de pasos de entrenamiento, publicando el artefacto en un formato reproducible (Orbax + estadisticas de normalizacion) que se carga con una configuracion concreta de OpenPI (`pi05_franka_wipe_whiteboard`) apuntando `policy.dir` a la raiz del repositorio.

## Capacidades

- Control visuomotor de un brazo Franka para la tarea especifica de borrar una pizarra blanca.
- Fusión de dos vistas de camara (externa y de muneca) con estado proprioceptivo de 19 dimensiones.
- Generacion de acciones continuas de 7 dimensiones en marco del cuerpo con horizonte de 10 pasos.
- Condicionamiento por instruccion en lenguaje natural (prompt de tarea), aunque entrenado con un unico prompt en ingles.
- Aprendizaje por imitacion: reproduce la distribucion de comportamientos del dataset de demostraciones.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en manipulacion robotica: servir como punto de partida o referencia para reproducir el ajuste fino de π0.5 sobre una tarea de contacto con superficie vertical, usando la configuracion `pi05_franka_wipe_whiteboard` de OpenPI.
- Evaluacion de pipelines OpenPI: validar de extremo a extremo la carga de un checkpoint Orbax con estadisticas de normalizacion y la ejecucion en bucle cerrado sobre un Franka real o simulado.
- Benchmark interno de imitacion: comparar el rendimiento de este checkpoint (paso 15.000) frente a otros pasos del mismo entrenamiento para estudiar la curva de aprendizaje y el sobreajuste.
- Base para ajuste fino posterior: reutilizar los pesos como inicializacion para tareas relacionadas de limpieza o borrado sobre superficies, dado que el checkpoint no incluye estado del optimizador y solo admite reinicio desde los pesos.
- Docencia y divulgacion: ejemplo didactico de un VLA abierto entrenado con datos propios en formato LeRobot, util para explicar el flujo datos-dataset-entrenamiento-despliegue.
- Pruebas de robustez ante variaciones de iluminacion, posicion de la pizarra y trayectorias: el modelo permite estudiar la sensibilidad de una politica de imitacion a cambios de dominio en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamano de π0.5, que no se especifica en la informacion proporcionada.
- GPU recomendadas: no disponible. El stack OpenPI en JAX sugiere GPUs de datacenter (A100, H100) para entrenamiento; para inferencia no se documentan requisitos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: OpenPI (JAX) con la configuracion `pi05_franka_wipe_whiteboard` y `policy.dir` apuntando a la raiz del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un checkpoint VLA de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Franka Wipe Whiteboard π0.5 step 15000 | no disponible | no disponible | Borrado de pizarra con Franka | no disponible | Hugging Face (0 descargas) |
| π0.5 base (`pi05_base`, Physical Intelligence) | no disponible | no disponible | VLA generalista | no disponible en la informacion | Referenciado como pesos base |
| Otros checkpoints OpenPI de la comunidad | no disponible | no disponible | Tareas de manipulacion diversas | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para un unico prompt y una unica tarea; no generaliza a otras instrucciones ni entornos sin nuevo ajuste fino.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial y la redistribucion son juridicamente inciertos.
- Artefacto de investigacion: cero descargas y cero likes; no hay evidencia de validacion externa ni de evaluacion publicada.
- Checkpoint de inferencia: no incluye estado del optimizador, por lo que no se puede reanudar el entrenamiento de forma exacta.
- Riesgo de sobreajuste al dataset: con batch 32 y 15.000 pasos sobre un dataset propio no documentado, la politica puede memorizar posiciones y condiciones concretas.
- Dependencia de calibracion: el aviso del autor exige validar orden de observaciones, unidades, estadisticas de normalizacion, limites del espacio de trabajo y ejecucion de acciones en un entorno controlado antes de desplegar en hardware.
- Sesgos y alucinacion: no aplican en el sentido de un LLM, pero si existe riesgo de acciones fuera de distribucion ante observaciones no vistas, con posible dano fisico al robot o al entorno.
- Idioma: el condicionamiento textual se entreno en ingles con un prompt fijo; no hay evidencia de soporte multilingue.
- Sin datos de cuantizacion ni de requisitos de hardware, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-15000
- Dataset de entrenamiento: https://huggingface.co/datasets/dddddsds31341/wipe-whiteboard-lerobot
- OpenPI (repositorio de Physical Intelligence): no disponible en la informacion proporcionada
- Modelo base `pi05_base`: no disponible en la informacion proporcionada
- Paper de π0.5: no disponible en la informacion proporcionada
