# austindixson/microduck-sprint-improver-rev8

## Resumen

`austindixson/microduck-sprint-improver-rev8` es una política de control para el simulador MicroDuck Arena, presentada como entrada en la categoría Sprint 2 m. No es un modelo de lenguaje: se trata de un fichero ONNX (`policy.onnx`) que mapea un vector de observación de 61 valores a un vector de acción de 14 valores, pensado exclusivamente para su ejecución dentro del simulador de Pollen Robotics.

El modelo es un finetune/remix de `jrubiosainz/microduck-game-sprinter-remix5` (revisión `a755c3f5a`). La modificación concreta es un injerto de tablas de rama por semilla: la tabla correspondiente a la semilla 2 (slot `br_TAB` 1) se toma de `rumezhak/microduck-sprint-remix-leader2` en la revisión `9ef6100e`, mientras que las semillas 1, 3, 4 y 5 se mantienen sin cambios respecto al remix5. La red permanece congelada; no se han alterado los parámetros de fuerza, marcha ni masa.

Su relevancia es acotada y muy específica: documenta una técnica de mezcla de tablas de rama por semilla sobre una política congelada, con tiempos de carrera declarados de 0,835 / 0,840 / 0,840 / 0,835 / 0,840 s (media 0,838 s) medidos con la herramienta `arena score` del propio Arena sobre Linux x86-64. El autor advierte explícitamente de que los datos son in-sample y de que el modelo no debe cargarse en un MicroDuck físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. Política de control serializada en ONNX; el autor no describe la topología de la red (capas, tipos de neurona ni función de activación) |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB y no se publica recuento) |
| Parametros activos | no aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | no aplica. La política consume un vector de observación fijo de 61 valores por paso y emite 14 acciones; no gestiona secuencias de texto |
| Tipos de cuantizacion | no disponible. Se distribuye un único `policy.onnx`; no se declara cuantización ni se ofrecen variantes |
| Idiomas soportados | no disponible / no aplica. No procesa lenguaje natural |
| Licencia | no disponible. El autor indica que el modelo base no declara licencia y que este repositorio tampoco declara ninguna |
| Formato de pesos | ONNX (`policy.onnx`, sha256 `71c63657319c14a3fff87c5d89d7b351fb56e64bc11bf22d4e4c7a418e024577`) más `manifest.json` de política con esquema 2 |

Otros datos verificables: tensor de entrada `obs` con forma [1, 61], tensor de salida `actions` con forma [1, 14], `library_name: microduck`, `pipeline_tag: robotics`, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-28.

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal (número de capas, anchura, tipo de bloque ni esquema de entrenamiento original). Lo que sí se documenta es el método de construcción de esta revisión concreta: no hay entrenamiento nuevo, sino una fusión de tablas de rama por semilla sobre una política congelada. La política base es `jrubiosainz/microduck-game-sprinter-remix5`, que a su vez emplea el método de residuo sobre contador de pasos atribuido a `jrubiosainz`; esta revisión sustituye únicamente la tabla de la semilla 2 por la de `rumezhak/microduck-sprint-remix-leader2`, que registra 0,83677 s en esa semilla.

No se especifican volúmenes de datos de entrenamiento, composición del dataset, número de tokens ni uso de RLHF/DPO, algo esperable en una política de control y no en un modelo generativo. Tampoco se documentan innovaciones técnicas adicionales más allá de la mezcla de tablas de rama por semilla y del mencionado residuo sobre contador de pasos. La evaluación se realizó con la herramienta oficial `arena score` del MicroDuck Arena en Linux x86-64.

## Capacidades

- Control de política para la tarea de sprint de 2 metros en el simulador MicroDuck Arena: recibe 61 observaciones y emite 14 acciones continuas.
- Comportamiento especializado por semilla: mantiene tablas de rama distintas para las semillas 1 a 5, con la semilla 2 sustituida por la tabla de `rumezhak`.
- Ejecución determinista en inferencia: al estar la red congelada, el comportamiento no cambia salvo por la selección de tabla de rama.
- Compatibilidad con el formato de manifiesto del Arena (esquema 2), lo que permite su carga en el entorno de evaluación oficial.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio.
- No soporta multilingüismo: no hay entrada ni salida en lenguaje natural.

## Casos de uso

- Evaluación en el MicroDuck Arena: cargar `policy.onnx` y `manifest.json` en el espacio oficial del Arena para reproducir la puntuación declarada de 0,838 s de media en las semillas 1 a 5 y verificar la tabla de resultados publicada.
- Referencia base para nuevos remixes: sirve como punto de partida para injertar tablas de rama de otras políticas, ya que documenta de forma explícita qué slots (`br_TAB`) se han sustituido y con qué revisión de origen.
- Regresión en pipelines de CI: al ser un ONNX de entrada y salida fijas, se puede integrar en un test automatizado que compare la media de tiempos contra un umbral, detectando degradaciones al cambiar de versión de runtime o de máquina.
- Estudio de mezcla de políticas sin reentrenamiento: útil en investigación sobre composición de comportamientos especializados por semilla, ya que ejemplifica una fusión limpia (red congelada, parámetros físicos intactos) con métricas antes y después.
- Validación de despliegue con ONNX Runtime: caso mínimo para comprobar la cadena de carga de un manifiesto de esquema 2 y la coherencia de formas [1, 61] → [1, 14] en un entorno de inferencia nuevo.
- Docencia y divulgación sobre robótica simulada: ejemplo compacto de cómo se puntúa una política en un Arena, con la advertencia explícita de que no debe transferirse a hardware real.
- Comparación sim-to-sim: permite contrastar el rendimiento de una misma política bajo distintos backends de simulación antes de plantear cualquier experimento de transferencia.

## Benchmarks y rendimiento

Los únicos datos publicados son los tiempos de carrera por semilla, medidos con `arena score` en Linux x86-64. El propio autor los califica de in-sample.

| Semilla | Tiempo (s) |
|---|---|
| 1 | 0,835 |
| 2 | 0,840 |
| 3 | 0,840 |
| 4 | 0,835 |
| 5 | 0,840 |
| Media | 0,838 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, y carecerían de sentido para este tipo de modelo. Como referencia del material de origen, la tabla de la semilla 2 procedente de `rumezhak/microduck-sprint-remix-leader2` registra 0,83677 s en esa misma semilla.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 0.0 GB y la política maneja tensores de 61 y 14 elementos, por lo que la huella es marginal y cabe holgadamente en memoria de sistema.
- GPU recomendadas: no se especifican. Por el tamaño de los tensores, la inferencia en CPU es suficiente; no se documenta ninguna ventaja medida con GPU.
- Cabe en GPU de consumo: sí, con cualquier GPU capaz de ejecutar ONNX Runtime; no se publica una lista de modelos probados.
- Opciones de despliegue: ONNX Runtime como vía natural; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. La integración con el Arena requiere el runtime `microduck` y el manifiesto de esquema 2.
- Latencia y throughput: no disponibles. No se publican mediciones por paso ni por episodio, solo el tiempo total de carrera en el simulador.
- Restricción de despliegue: simulación únicamente. El autor prohíbe explícitamente cargarlo en un MicroDuck físico.

## Comparativa con modelos similares

| Modelo | Relación | Parámetros | Contexto | Resultado declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `austindixson/microduck-sprint-improver-rev8` | Este modelo | no disponible | no aplica | 0,838 s de media (semillas 1-5, in-sample) | no disponible | HuggingFace, ONNX |
| `jrubiosainz/microduck-game-sprinter-remix5` | Base (finetune) | no disponible | no aplica | no disponible en la información proporcionada | no disponible | HuggingFace |
| `rumezhak/microduck-sprint-remix-leader2` | Fuente de la tabla de la semilla 2 | no disponible | no aplica | 0,83677 s en semilla 2 | no disponible | HuggingFace |

No se dispone de datos suficientes para comparar con otras políticas del Arena en parámetros, licencia o rendimiento agregado. Las demás entradas mencionadas (`DenRakEiw`, `dashi`) aparecen solo como créditos de los remixes previos, sin cifras publicadas en esta información.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, aunque el ajuste por semilla implica un comportamiento especializado que puede no generalizar fuera de las condiciones del Arena.
- Riesgo de sobreajuste: el autor califica los tiempos de 0,838 s como in-sample, por lo que no constituyen una estimación insesgada de rendimiento en condiciones no vistas.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo de texto.
- Limitaciones de contexto e idioma: no gestiona contexto textual ni idiomas; su entrada es un vector de 61 valores y su salida, 14 acciones.
- Restricciones de licencia: el modelo base no declara licencia y este repositorio tampoco. La ausencia de licencia impide asumir derechos de uso comercial; sería necesario contactar con el autor.
- Aviso de seguridad explícito: el autor indica que el modelo fue entrenado y evaluado solo en el simulador y que no debe cargarse en un robot MicroDuck físico.
- Alcance de la evaluación: una única plataforma (Linux x86-64) y una única herramienta de medida (`arena score`); no hay datos de reproducibilidad en otros entornos.
- Novedad: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso externo ni validación independiente.
- Naturaleza del artefacto: es una fusión de tablas de rama, no un reentrenamiento; las mejoras atribuibles a esta revisión se limitan a la semilla 2.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/austindixson/microduck-sprint-improver-rev8
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix5
- Origen de la tabla de la semilla 2: https://huggingface.co/rumezhak/microduck-sprint-remix-leader2
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Organización Pollen Robotics: https://huggingface.co/pollen-robotics
- Perfil de `DenRakEiw` (créditos de remixes previos): https://huggingface.co/DenRakEiw
- Perfil de `dashi` (créditos de remixes previos): https://huggingface.co/dashi

No se han encontrado papers, blogs técnicos ni demos adicionales en la búsqueda web realizada; los resultados obtenidos no guardan relación con este modelo.
