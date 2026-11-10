# dashi/microduck-roller-daily-20261109

## Resumen

`dashi/microduck-roller-daily-20261109` es una política de control robótico (no un modelo de lenguaje) publicada en Hugging Face por el usuario `dashi`. Se trata de un reentrenamiento diario ("daily re-entry") de la política `dashi/microduck-roller-remix-r900`, afinada a partir de `DenRakEiw/microduck-senate_duck_0904`, y destinada al robot cuadrúpedo de bajo coste microduck del proyecto de Pollen Robotics. El modelo resuelve una tarea muy concreta: generar una marcha perpetua ("perpetual policy") para la ranura `walk` del robot cuando este se desplaza sobre rodillos.

Técnicamente es una política de aprendizaje por refuerzo exportada a ONNX, con una observación de 61 dimensiones y 14 acciones de control, ejecutándose a 50 Hz. No es un transformer generativo ni un modelo multimodal: es un controlador reactivo que mapea observaciones crudas del robot a comandos motores, con el normalizador de observaciones embebido en el propio grafo ONNX. La relevancia es acotada al ecosistema microduck, pero resulta interesante como ejemplo de pipeline de RL reproducible y de reentrenamientos periódicos versionados.

La información pública disponible es muy escasa: el repositorio pesa 0,0 GB (probablemente solo contiene el ONNX y el manifiesto), no tiene descargas ni likes, y no se declaran licencia ni idiomas. La model card se limita a indicar el comando de carga en robot y los metadatos de entrenamiento (repo, rama y commit).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (red neuronal feed-forward; topología interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política reactiva; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye ONNX en precisión nativa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Ranura (slot) | `walk` |
| Modelo base | `DenRakEiw/microduck-senate_duck_0904` (finetune) |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. El autor describe el resultado como una política "perpetua" para el microduck sobre rodillos: recibe un vector de observación de 61 dimensiones y emite 14 acciones a 50 Hz, y está pensada para ejecutarse de forma continua hasta que se le indique lo contrario. El normalizador de observaciones está integrado en el grafo `policy.onnx`, de modo que el consumidor debe alimentar observaciones crudas sin preprocesar.

No se especifican en la información disponible la topología exacta de la red (número de capas, anchura, activaciones), el algoritmo de RL empleado, el número de pasos de entrenamiento, la composición del dataset de entrenamiento ni si hubo técnicas de regularización o *domain randomization*. Tampoco se documenta el proceso de destilación o *fine-tuning* desde `DenRakEiw/microduck-senate_duck_0904` más allá de la relación declarada `finetune`. El modelo se describe como un "remix" del checkpoint `dashi/microduck-roller-remix-r900` (puntuación 0.900), y esta publicación es un reentrenamiento diario del mismo.

## Capacidades

- Generación de una marcha perpetua sobre rodillos para la ranura `walk` del robot microduck.
- Control reactivo a 50 Hz a partir de observaciones crudas de 61 dimensiones.
- Emisión de 14 acciones motoras por paso de control.
- Normalización de observaciones integrada en el ONNX (no requiere pipeline externo).
- Carga directa mediante el comando `robotctl policy load walk dashi/microduck-roller-daily-20261109`.
- Compatibilidad con el manifiesto de políticas microduck schema 2.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Marcha sobre rodillos en banco de pruebas: la política está entrenada específicamente para desplazarse sobre rodillos, por lo que sirve para validar la locomoción del microduck en un entorno controlado antes de transferir a terreno real.
- Reentrenamiento diario reproducible: al ser un "daily re-entry" de un remix previo, encaja en pipelines de integración continua que regeneran políticas cada día y comparan su comportamiento contra la versión anterior.
- Evaluación comparativa de políticas: sirve como referencia para medir la deriva entre el checkpoint base `microduck-senate_duck_0904` y sus derivados afinados.
- Demostraciones docentes de RL robótico: el formato ONNX autocontenido (con normalizador embebido) simplifica el despliegue en talleres y cursos con el robot microduck.
- Despliegue en robot físico: mediante `robotctl policy load walk ...` se puede cargar en el daemon del robot y ejecutar de forma continua hasta que se detenga.
- Base para *fine-tuning* posterior: al estar etiquetado como `finetune` de un modelo base público, puede servir de punto de partida para nuevas políticas de la ranura `walk`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una puntuación de 0.900 asociada al checkpoint previo `dashi/microduck-roller-remix-r900`, sin especificar la métrica ni el protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB, lo que sugiere un modelo de muy pequeño tamaño (probablemente por debajo de unos pocos MB), pero no se confirma.
- GPU recomendadas: no disponible. Por el formato ONNX y la frecuencia de control (50 Hz), es plausible su ejecución en CPU, pero no se documenta.
- ¿Cabe en GPU de consumo? No disponible; por tamaño de repositorio, es altamente probable que sí, pero no se confirma.
- Opciones de despliegue: el autor solo documenta la carga mediante `robotctl policy load` en el daemon del robot microduck. Al ser ONNX, podría ejecutarse con ONNX Runtime, pero no se indica oficialmente.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acción | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261109` | Política RL ONNX (microduck, slot `walk`) | 61 / 14 | 50 Hz | no disponible | Hugging Face (0 descargas) |
| `dashi/microduck-roller-remix-r900` | Política RL (microduck) | no disponible | no disponible | no disponible | Hugging Face (referenciado como base del remix) |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL (microduck, modelo base) | no disponible | no disponible | no disponible | Hugging Face (modelo base declarado) |

No se dispone de datos de rendimiento comparables entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Específica de un robot y un entorno: entrenada para el microduck sobre rodillos; no se garantiza su transferencia a otros robots, terrenos o configuraciones.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Sin métricas publicadas: no hay benchmarks ni protocolo de evaluación documentado, lo que dificulta validar su calidad frente a alternativas.
- Repositorio vacío o casi vacío (0,0 GB): conviene verificar que `policy.onnx` y `manifest.json` estén realmente presentes antes de integrarla.
- Sin información sobre sesgos, robustez o comportamiento ante observaciones fuera de distribución.
- Reentrenamiento diario: la política puede cambiar de comportamiento entre versiones sin un versionado semántico claro; fijar el commit o el hash del ONNX en producción.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento; cualquier uso fuera del control del robot está fuera de su alcance.
- Dependencia de la infraestructura `robotctl` y del manifiesto schema 2; cambios en el daemon pueden romper la compatibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-roller-daily-20261109
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: https://github.com/pollen-robotics/microduck_rl (rama `roll-backward`, commit `83599404a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
