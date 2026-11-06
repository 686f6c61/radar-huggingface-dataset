# BabyClaw/duck-skill-20261105-sprint-2m

## Resumen

Duck Skill Sprint es una politica de control para robotica derivada de los pesos de referencia de Pollen Robotics, entrenada y seleccionada mediante el pipeline compartido Duck Skill. El modelo resuelve una tarea concreta de locomocion (identificada como `microduck-slot:walk` y variante `sprint-2m`) sobre el robot MicroDuck, y se distribuye como un artefacto ONNX para inferencia en CPU. No es un modelo de lenguaje: es una politica de reinforcement learning que mapea 61 observaciones a 14 acciones de control.

El modelo se ha seleccionado a partir de 45 arranques de desarrollo y se ha validado sobre arranques finales separados, con evidencia de evaluacion local incluida en el repositorio. La provenance documenta que una politica anterior fallo 4 de 25 arranques retenidos, lo que activo una compuerta de rechazo/seleccion sobre el rango 501-525. El resultado oficial lo mide la Arena de Pollen Robotics, no las puntuaciones locales.

El repositorio es de tamano practicamente nulo (0.0 GB) y no registra descargas ni likes en el momento de la consulta. Su relevancia es acotada: sirve como ejemplo de politica de robotica empaquetada con trazabilidad criptografica (SHA-256 de pesos y del modelo base) y evaluacion reproducible, dentro del ecosistema MicroDuck.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de reinforcement learning para control roboticos (no disponible el detalle de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye como ONNX para inferencia en CPU |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (checkpoint original `model_50.onnx`) |
| Entradas | 61 observaciones |
| Salidas | 14 acciones |
| Libreria | microduck |
| Pipeline | robotics |
| SHA-256 de la politica | `18009970b205783b160b681835732494fc030740cafff9fd1162be1ea6aa392a` |

## Arquitectura y entrenamiento

No se dispone de la arquitectura interna de la red en la informacion proporcionada. El modelo se describe como una politica de simulacion derivada de los pesos de referencia `pollen-robotics/microduck-sprint-2m-reference` (revision `62afcc461f1d4a5ac22bfbff55ce4900c1afba32`, SHA-256 `adbc1594ccfcafa93ecb3872ab985498207b73e4445a36c5b4f58d9d8701b924`), obtenida mediante el pipeline compartido de entrenamiento y busqueda de politicas Duck Skill. El entrenamiento es de reinforcement learning, orientado a la tarea de locomocion `sprint-2m`.

La innovacion metodologica destacable no esta en la arquitectura sino en el proceso de seleccion y auditoria: se usaron 45 arranques de desarrollo para elegir la politica y arranques finales separados para validarla. La provenance indica que una politica previa (`e6fdc49953abf5a306f8668b46cf257bbf87e89a024c94693a58d0fde9fb5632`) fallo 4 de 25 arranques retenidos, lo que convirtio el rango 501-525 en una compuerta de rechazo/seleccion. Se incluyen artefactos de evidencia (`selection-gate.json`, `fresh-audit-701-725.json` y el JSON de evaluacion de desarrollo). No se especifican numero de tokens, composicion del dataset ni uso de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Control de locomocion del robot MicroDuck en simulacion para la tarea `sprint-2m` (slot `walk`).
- Mapeo directo de 61 observaciones a 14 acciones de control.
- Inferencia en CPU mediante ONNX, sin requisito de GPU.
- Ejecucion determinista verificable por hash SHA-256 de la politica.
- Evaluacion reproducible mediante arranques de desarrollo y arranques finales retenidos.
- Integracion con la Arena de Pollen Robotics para medicion del resultado oficial.
- No soporta generacion de texto, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Evaluacion comparativa de politicas de locomocion: la politica se puede cargar en la Arena de Pollen Robotics (`#/e/sprint-2m`) para obtener la puntuacion oficial y compararla con otras politicas del mismo slot `walk`.
- Reproduccion de experimentos de reinforcement learning: los hashes de politica y modelo base permiten verificar que la politica evaluada es exactamente la publicada, util para auditorias internas o publicaciones.
- Simulacion de bajo coste en CI: al ejecutarse en CPU via ONNX, se puede integrar en pipelines de integracion continua que validen que la politica no se degrada tras cambios en el entorno.
- Docencia y prototipado en robotica: sirve como ejemplo de artefacto de politica empaquetado con manifest, provenance y evidencia de evaluacion, adecuado para cursos de RL aplicado.
- Base para ajuste fino o busqueda de politicas: al derivar de los pesos de referencia de Pollen Robotics, puede usarse como punto de partida en el pipeline Duck Skill para nuevas variantes de la tarea.
- Verificacion de integridad de artefactos: el SHA-256 permite comprobar en produccion que el fichero ONNX desplegado coincide con el auditado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no es un modelo de lenguaje. La unica evidencia de rendimiento es cualitativa y local: seleccion sobre 45 arranques de desarrollo y validacion sobre arranques finales separados, con una politica previa que fallo 4 de 25 arranques retenidos. El autor indica que las puntuaciones locales son indicativas y que el resultado oficial lo mide la Arena.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia es en CPU via ONNX.
- GPU recomendadas: no se requiere GPU; el modelo esta disenado para ejecucion en CPU.
- Cabe en cualquier consumer GPU y en CPU convencional, dado el tamano del repositorio (0.0 GB).
- Opciones de despliegue: runtime ONNX (ONNX Runtime u otro compatible), libreria `microduck` y la Arena de Pollen Robotics.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas / salidas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BabyClaw/duck-skill-20261105-sprint-2m | Politica RL para MicroDuck | 61 / 14 | ONNX | no disponible | Hugging Face |
| pollen-robotics/microduck-sprint-2m-reference | Politica de referencia (base) | no disponible | no disponible | no disponible | Hugging Face |
| Politica previa `e6fdc499...` | Politica RL descartada | no disponible | no disponible | no disponible | Referenciada en provenance |

No se dispone de datos de rendimiento comparables entre estas politicas en la informacion proporcionada; la comparacion oficial debe realizarse en la Arena de Pollen Robotics.

## Limitaciones y advertencias

- Modelo de dominio muy especifico: solo controla la tarea `sprint-2m` del MicroDuck; no es reutilizable para otras tareas sin reentrenamiento.
- Las puntuaciones locales son indicativas; el resultado oficial solo lo determina la Arena.
- La politica previa fallo 4 de 25 arranques retenidos, lo que sugiere fragilidad ante condiciones no vistas; conviene validar sobre arranques propios antes de desplegar.
- Licencia no disponible: no se puede confirmar el uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin descargas ni likes registrados y con repositorio de 0.0 GB: la trazabilidad depende de los artefactos de evidencia incluidos, que no se han podido verificar en esta ficha.
- No soporta texto, vision ni agentes; cualquier uso fuera de control roboticos en simulacion queda fuera de su alcance.
- Riesgo de sobreajuste al conjunto de evaluacion local, dado el proceso de seleccion sobre 45 arranques de desarrollo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BabyClaw/duck-skill-20261105-sprint-2m
- Arena de Pollen Robotics (evento sprint-2m): https://huggingface.co/spaces/pollen-robotics/microduck-arena#/e/sprint-2m
- Modelo base de referencia: https://huggingface.co/pollen-robotics/microduck-sprint-2m-reference
- Repositorio de Pollen Robotics en Hugging Face: https://huggingface.co/pollen-robotics
