# dashi/microduck-roller-daily-20261105

## Resumen

`dashi/microduck-roller-daily-20261105` es una política de control para el robot cuadrúpedo de bajo coste microduck, desarrollado en el ecosistema de Pollen Robotics. No es un modelo de lenguaje: se trata de un modelo de aprendizaje por refuerzo que mapea una observación de 61 dimensiones a 14 acciones de control a 50 Hz, orientado a generar una marcha estable sobre ruedas (el denominado slot `walk`). El repositorio tiene un tamaño practicamente nulo (0.0 GB), lo que sugiere que los pesos se distribuyen como un artefacto ONNX de pequeñas dimensiones en lugar de safetensors de gran tamano.

El modelo se presenta como una "reentrada diaria" (daily re-entry) de `dashi/microduck-roller-remix-r900`, una política calificada como perpetua, es decir, que se ejecuta de forma continua hasta recibir una orden de parada. Es un finetune de `DenRakEiw/microduck-senate_duck_0904` y se distribuye con la libreria `microduck` y el pipeline `robotics`. Su relevancia es acotada al ambito de la robótica de bajo coste y el aprendizaje por refuerzo aplicado a locomocion, sin relación con modelos generativos de gran escala.

La información disponible es muy escasa: no se publican parametros, contexto, idiomas, licencia ni benchmarks. La ficha refleja por tanto los datos presentes en la model card y en los metadatos de HuggingFace, marcando explicitamente como "no disponible" todo aquello que no se documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por refuerzo exportada a ONNX; no se detalla la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica: entrada de 61 dimensiones de observación, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: modelo de control robótico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` (schema 2 del microduck policy manifest) |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de acciones | 14 |
| Frecuencia de control | 50 Hz |
| Slot de política | `walk` |
| Modelo base | `DenRakEiw/microduck-senate_duck_0904` (finetune) |
| Repo de entrenamiento | `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` |
| Libreria | `microduck` |
| Pipeline | `robotics` |

## Arquitectura y entrenamiento

No se documenta la topología interna de la red (número de capas, tipo de capas, función de activación ni tamaño de los hidden states). Por el contexto del ecosistema microduck y la referencia al repositorio `pollen-robotics/microduck_rl`, se trata de una política entrenada mediante aprendizaje por refuerzo para control de locomocion, exportada a ONNX para inferencia en el robot. La observación de 61 dimensiones se alimenta directamente al modelo, ya que el normalizador de observaciones está embebido en `policy.onnx`; no es necesario preprocesar las observaciones en el cliente.

El entrenamiento se realizó en la rama `roll-backward` del repositorio `pollen-robotics/microduck_rl` (commit `83599404a`), lo que sugiere un entrenamiento especifico para locomocion sobre ruedas con desplazamiento hacia atrás. El modelo es un finetune del checkpoint `DenRakEiw/microduck-senate_duck_0904` y se describe como una "reentrada diaria" de `dashi/microduck-roller-remix-r900` (0.900), lo que apunta a un ciclo de reentrenamiento incremental o re-publicacion periodica. No se especifican número de tokens, composición del dataset, ni si se emplearon RLHF o DPO (tecnicas no aplicables a este dominio).

## Capacidades

- Generación de una marcha perpetua sobre ruedas para el robot microduck, en el slot `walk`, ejecutándose de forma continua hasta recibir una orden de parada.
- Control a 50 Hz con entrada de observación de 61 dimensiones y salida de 14 acciones.
- Inferencia directa con observaciones en bruto: el normalizador está integrado en el artefacto ONNX.
- Carga y ejecución mediante el comando `robotctl policy load walk dashi/microduck-roller-daily-20261105`.
- Compatibilidad con el manifiesto de políticas microduck en schema 2.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling, agentes ni multilingüismo.

## Casos de uso

- Locomocion continua en el robot microduck: la política se carga en el slot `walk` y mantiene la marcha sobre ruedas de forma indefinida, lo que permite al robot desplazarse sin intervención hasta que se emita una orden de parada.
- Demostraciones de robótica de bajo coste: al ser un artefacto ONNX ligero y con normalizador embebido, se puede desplegar en el robot para demostrar aprendizaje por refuerzo en locomocion sin infraestructura de servidores.
- Reentrenamiento y comparación de políticas: al ser un finetune de `DenRakEiw/microduck-senate_duck_0904` y una reentrada de `microduck-roller-remix-r900`, sirve como punto de comparación en experimentos de evolucion de políticas dentro del mismo ecosistema.
- Pruebas de integración del daemon: el manifiesto en schema 2 y el comando `robotctl` permiten validar el flujo de carga de políticas en el daemon del robot.
- Investigación en aprendizaje por refuerzo aplicado a control: la rama `roll-backward` del repositorio de entrenamiento sugiere que la política puede usarse como referencia en estudios de locomocion con desplazamiento hacia atrás.
- Desarrollo de pipelines de despliegue robótico: el formato ONNX facilita la integración en herramientas de inferencia compatibles con ONNX Runtime en el propio robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, tasas de exito, estabilidad de la marcha ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una política de control exportada a ONNX y con un repositorio de 0.0 GB, es previsible que el modelo sea muy ligero, pero no se documenta el tamano exacto de los pesos.
- GPU recomendadas: no disponible. El despliegue previsto es en el propio robot microduck mediante el daemon `robotctl`, no en GPU de servidor.
- Viabilidad en GPU de consumo: no disponible; no se especifican requisitos de memoria ni de aceleracion.
- Opciones de despliegue: daemon microduck mediante `robotctl policy load walk dashi/microduck-roller-daily-20261105`; inferencia ONNX (`policy.onnx`) con el manifiesto `manifest.json` en schema 2. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponible; se conoce únicamente la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261105` | Política RL para microduck (slot `walk`) | no disponible | no aplica (obs. 61 dim.) | no disponible | HuggingFace, ONNX |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL para microduck (modelo base) | no disponible | no aplica | no disponible | HuggingFace |
| `dashi/microduck-roller-remix-r900` | Política RL para microduck (origen de la reentrada) | no disponible | no aplica | no disponible | HuggingFace |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación tecnica entre estas políticas. Las alternativas identificadas pertenecen al mismo ecosistema microduck y comparten la misma falta de especificaciones publicadas.

## Limitaciones y advertencias

- Información tecnica muy limitada: no se publican parametros, arquitectura interna, licencia ni idiomas, lo que impide evaluar el modelo con rigor antes de desplegarlo.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Ambito de aplicación restringido: es una política de control para un robot concreto (microduck sobre ruedas, slot `walk`); no es un modelo de lenguaje ni un modelo generativo de propósito general.
- Naturaleza "perpetua": la política se ejecuta hasta recibir una orden de parada, por lo que requiere mecanismos externos de supervision y parada segura en el robot.
- Dependencia de la rama `roll-backward`: el entrenamiento se realizó en esa rama del repositorio `pollen-robotics/microduck_rl`, lo que puede implicar un comportamiento especifico (desplazamiento hacia atrás) que no se detalla en la model card.
- Sin benchmarks: no hay metricas de estabilidad, tasa de exito ni robustez frente a perturbaciones, por lo que el rendimiento real en el robot no esta verificado en la documentación.
- Riesgo de alucinacion y sesgos: no aplica en el sentido de los modelos de lenguaje; el riesgo equivalente es un comportamiento de control imprevisto o inestable en el robot, que debe mitigarse con limites de seguridad fisicos.
- Repositorio de 0.0 GB: el artefacto distribuido es muy pequeno; conviene verificar la integridad de `policy.onnx` y `manifest.json` antes del despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dashi/microduck-roller-daily-20261105
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`); no se ha encontrado una URL publica en la busqueda web.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon; no se ha encontrado una URL publica en la busqueda web.
- No se han encontrado papers, blogs, demos ni otros repositorios relevantes en la busqueda web.
