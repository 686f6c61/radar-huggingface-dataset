# dashi/microduck-hill-daily-20261101

## Resumen

`dashi/microduck-hill-daily-20261101` es una política de control motriz (policy) para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es una red neuronal entrenada por refuerzo (reinforcement learning) que genera comandos de locomocion a 50 Hz a partir de observaciones de 61 dimensiones y emite 14 acciones. Se publica en formato ONNX bajo la libreria `microduck` y se carga directamente en el daemon del robot mediante `robotctl policy load walk`.

El autor (`dashi`) lo describe como una "re-entrada diaria" de una política previa (`dashi/microduck-hill-remix-r744`, con recompensa reportada de 0.744) y como un remix fino (finetune) del modelo `jrubiosainz/microduck-game-hillclimber-remix8`. La política está etiquetada para el slot de marcha (`walk`) y se define como "perpétua": no tiene un horizonte de episodio explícito y se ejecuta hasta que el operador la detiene.

La relevancia es acotada y muy específica: se trata de un artefacto de robótica de código abierto orientado a reproducir y versionar políticas de locomocion para una plataforma educativa concreta. No hay información sobre arquitectura de red, número de parámetros, licencia ni idiomas, y el repositorio ocupa 0.0 GB según HuggingFace, lo que sugiere un artefacto muy pequeño (coherente con una política de control de baja dimensión).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de política para control motriz; sin detalle de capas en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`; el normalizador de observaciones va embebido) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red. Se sabe que es una política de refuerzo entrenada con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`. La política opera en bucle cerrado a 50 Hz: recibe observaciones crudas de 61 dimensiones (el normalizador está embebido en el ONNX, por lo que no hay que preprocesar) y emite 14 acciones de control. Está especializada en el slot `walk`.

El modelo es un finetune del checkpoint `jrubiosainz/microduck-game-hillclimber-remix8`, que a su vez parece derivar de un entrenamiento tipo "hill climber" (escalada de colinas) sobre la tarea de locomocion. El autor lo presenta como una "re-entrada diaria" de `dashi/microduck-hill-remix-r744` con recompensa 0.744, lo que sugiere un flujo de trabajo de iteración diaria sobre políticas previas. No se especifican número de tokens, composición del dataset, ni si hubo RLHF/DPO (no aplica en este dominio).

## Capacidades

- Generación de comandos de locomocion para el robot microduck a 50 Hz (14 acciones de control).
- Política "perpetua": no tiene horizonte de episodio definido y se ejecuta de forma continua hasta que se detiene.
- Normalización de observaciones integrada en el artefacto ONNX (se alimenta con observaciones crudas de 61 dimensiones).
- Especializada en el slot de marcha (`walk`), pensada para desplazamiento continuo.
- Integración directa con el daemon del robot vía `robotctl policy load walk <repo>`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Locomocion continua en el robot microduck: cargar la política en el slot `walk` y dejar que el robot se desplace de forma sostenida en entornos de interior, gracias a su naturaleza "perpetua" y a la ejecución a 50 Hz.
- Reproduccion de experimentos de RL en robótica educativa: usar el artefacto como punto de partida o referencia para comparar con `jrubiosainz/microduck-game-hillclimber-remix8` y con `dashi/microduck-hill-remix-r744`.
- Versionado de políticas en un pipeline de iteración diaria: el nombre `hill-daily-20261101` y la relación de finetune permiten encadenar experimentos y hacer rollback a checkpoints anteriores.
- Demostraciones docentes de control por refuerzo: al ser un ONNX pequeño con normalizador embebido, se puede desplegar en el robot sin dependencias de entrenamiento.
- Pruebas de robustez de la marcha en terrenos con pendiente (el linaje "hillclimber" sugiere entrenamiento orientado a subida de colinas), útil para validar la política antes de integrarla en rutinas más largas.
- Integración en el daemon `robotctl` para automatizar la carga de políticas en flotas o bancos de pruebas, usando el manifiesto `manifest.json` con esquema 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica mencionada es una recompensa de 0.744 asociada al modelo predecesor `dashi/microduck-hill-remix-r744`, no a este checkpoint, por lo que no se puede atribuir directamente a `microduck-hill-daily-20261101`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB en HuggingFace, lo que indica un artefacto muy pequeño (política de control de baja dimensión).
- GPU recomendadas: no disponible; por el tamaño del artefacto, la inferencia probablemente se ejecuta en CPU o en el propio ordenador del robot.
- ¿Cabe en consumer GPU? No disponible con certeza, pero el tamaño del repo sugiere que sí, e incluso en hardware embebido.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el daemon `robotctl` del ecosistema microduck. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; la política está diseñada para ejecutarse a 50 Hz (20 ms por paso).

## Comparativa con modelos similares

| Modelo | Tipo | Slot | Relación | Licencia | Formato |
|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261101` | Política RL microduck | `walk` | Finetune de `hillclimber-remix8` | no disponible | ONNX |
| `jrubiosainz/microduck-game-hillclimber-remix8` | Política RL microduck | no disponible | Modelo base | no disponible | no disponible |
| `dashi/microduck-hill-remix-r744` | Política RL microduck | no disponible | Predecesor (recompensa 0.744) | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas para una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes. Cualquier uso fuera del control del robot microduck no está contemplado.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no disponibles (no aplica).
- La model card no documenta sesgos, tasas de alucinación ni límites de robustez; el comportamiento fuera de distribución (terrenos no vistos, perturbaciones) es desconocido.
- La recompensa 0.744 corresponde al modelo predecesor, no a este checkpoint; no se debe citar como rendimiento de esta política.
- El repositorio figura con 0.0 GB y 0 descargas / 0 likes, lo que sugiere un artefacto recién publicado y sin validación comunitaria.
- Depende de la API del daemon microduck (`robotctl`) y del esquema 2 del manifiesto de políticas; cambios de versión en el daemon podrían romper la compatibilidad.
- La naturaleza "perpetua" de la política implica que debe existir un mecanismo externo de parada; no se documenta comportamiento de seguridad ante fallos.

## Enlaces

- HuggingFace: https://huggingface.co/dashi/microduck-hill-daily-20261101
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix8
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`; sin URL directa en la información proporcionada)
- Manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (sin URL directa en la información proporcionada)
- Predecesor: `dashi/microduck-hill-remix-r744` (sin URL directa en la información proporcionada)
