# DenRakEiw/microduck-c-3pduck_0788

## Resumen

microduck-c-3pduck_0788 es una politica de control por aprendizaje por refuerzo (RL) para el robot bipedo microduck de Pollen Robotics, no un modelo de lenguaje. El autor, DenRakEiw, la publica como un finetune ("remix") de suraj-phanindra/microduck-hill-hc5-aifund, que a su vez deriva de juicenv/microduck-hill-es8 y, en ultima instancia, de namenu. El resultado es un gait perpetuo para el slot `walk` del robot: la politica se ejecuta indefinidamente hasta que se le indique lo contrario.

Tecnicamente, la red del modelo base se mantiene congelada y se inserta dentro del wrapper con contador de pasos y tabla de arranque de jrubiosainz/microduck-game-hillclimber-remix2. Sobre esa estructura se re-buscan los 108 valores de la tabla de arranque mediante CMA-ES usando las seeds oficiales de la Arena, un ajuste realizado en simulacion y en muestra (in-sample). El modelo opera a 50 Hz con una observacion de 61 dimensiones y 14 acciones, y esta pensado para el remix de escalada de colinas de 1,5 m.

Su relevancia es acotada pero clara para quien trabaja con el ecosistema microduck: es una politica ligera en formato ONNX, con el normalizador de observaciones integrado en el propio grafo, lista para cargarse en el robot con un solo comando. No publica licencia, idiomas ni resultados de benchmarks, y su validacion es exclusivamente en simulacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal de control (red feed-forward) para robot bipedo; no es un modelo de lenguaje. Detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observacion de 61 dimensiones (61-D) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de politicas microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61-D |
| Dimension de acciones | 14 |
| Slot de politica | walk |
| Modelo base | suraj-phanindra/microduck-hill-hc5-aifund (relacion: finetune) |

## Arquitectura y entrenamiento

La politica se construye reutilizando de forma congelada la red de suraj-phanindra/microduck-hill-hc5-aifund, que a su vez procede de juicenv/microduck-hill-es8 y de namenu. Esa red se encapsula dentro del wrapper con contador de pasos y tabla de arranque (start-table) de jrubiosainz/microduck-game-hillclimber-remix2. Sobre los 108 valores de esa tabla de arranque se ejecuta una nueva busqueda con CMA-ES (estrategia de evolucion de matriz de covarianza) usando las seeds oficiales de la Arena. Este ajuste es en muestra (in-sample) y solo en simulacion: no consta validacion cruzada ni transferencia al robot fisico.

El entrenamiento de RL se realizo en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `d6a27c4d1`. No se documentan en la informacion disponible el numero de tokens (no aplica), el volumen de episodios, la composicion del dataset ni el uso de RLHF o DPO. El normalizador de observaciones esta embebido dentro del fichero `policy.onnx`, de modo que la politica recibe observaciones en crudo. La politica esta descrita como "perpetua": una marcha que se ejecuta de forma continua hasta que el sistema la detiene.

## Capacidades

- Locomocion bipeda perpetua para el slot `walk` del robot microduck, ejecutandose de forma continua a 50 Hz.
- Escalada de colinas en el escenario "Hill Climb 1,5 m" para el que fue ajustada la tabla de arranque.
- Control de las 14 acciones del robot a partir de una observacion de 61 dimensiones.
- Arranque robusto mediante tabla de arranque con contador de pasos (108 valores re-buscados con CMA-ES).
- Inferencia autocontenida: el normalizador de observaciones va integrado en `policy.onnx`, por lo que se alimenta con observaciones en crudo.
- Carga directa en el robot mediante el comando `robotctl policy load`.
- No soporta tool calling ni function calling (no aplica a una politica de control).
- No soporta agentes ni razonamiento multi-paso en el sentido de un LLM (no aplica).
- No tiene capacidades multilingues, de vision, audio ni modo de razonamiento (no aplica).

## Casos de uso

- Locomocion de referencia en simulacion: cargar la politica en el entorno de entrenamiento de `pollen-robotics/microduck_rl` para reproducir la marcha `walk` sobre las seeds oficiales de la Arena y comparar con otras politicas del mismo slot.
- Despliegue en el robot fisico: mediante `sudo robotctl policy load walk DenRakEiw/microduck-c-3pduck_0788`, la politica pasa a gobernar el gait continuo del microduck para pruebas de locomocion en terreno inclinado.
- Punto de partida para nuevos finetunes: al ser un finetune con red base congelada, sirve como inicializacion para re-buscar la tabla de arranque con CMA-ES sobre otros terrenos o seeds.
- Evaluacion de sim-to-real: comparar la marcha en simulacion (donde fue ajustada in-sample) con su comportamiento en el robot real de 15 motores para medir la brecha de transferencia.
- Docencia e investigacion en RL para robotica: ejemplo compacto de politica ONNX con observaciones y acciones de baja dimension para explicar pipelines de RL, normalizacion embebida y wrappers de arranque.
- Banco de pruebas de control a 50 Hz: medir estabilidad y consumo de la politica perpetua en el bucle de control del demonio microduck, comprobando que el coste computacional se mantiene dentro del presupuesto del robot.
- Baseline en competiciones internas del ecosistema microduck: enfrentarla a DenRakEiw/microduck-c-3pduck_0908 o DenRakEiw/microduck-scrooge dentro de la misma Arena con las mismas seeds.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en ONNX: la politica es un fichero ligero (el repositorio ocupa 0,0 GB) de red feed-forward con 61 entradas y 14 salidas; no requiere GPU.
- VRAM estimada: practicamente despreciable; cabe en CPU. No se dispone de cifra exacta de memoria.
- GPU recomendadas: no aplica. Cualquier CPU moderna del propio robot o de un equipo de desarrollo es suficiente.
- Consumer GPU: no necesita GPU dedicada; funcionaria igualmente en cualquier iGPU o en CPU.
- Opciones de despliegue: demonio microduck mediante `robotctl policy load` y ejecucion ONNX en el robot; tambien es ejecutable con ONNX Runtime en cualquier equipo de desarrollo.
- Latencia y throughput estimados: el bucle de control opera a 50 Hz, lo que implica un presupuesto de 20 ms por paso de control; no se publican mediciones de latencia reales ni de consumo.

## Comparativa con modelos similares

| Modelo | Tipo | Relacion | Slot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DenRakEiw/microduck-c-3pduck_0788 | Politica RL ONNX | Finetune de suraj-phanindra/microduck-hill-hc5-aifund | walk | no disponible | HuggingFace |
| DenRakEiw/microduck-c-3pduck_0908 | Politica RL ONNX | Variante del mismo autor | no disponible | no disponible | HuggingFace |
| DenRakEiw/microduck-scrooge | Politica RL ONNX | Variante del mismo autor | varios (walk, stand, sitstand, ground_pick, kick_left, kick_right, roulade) | no disponible | HuggingFace |
| suraj-phanindra/microduck-hill-hc5-aifund | Politica RL | Modelo base del que deriva esta ficha | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparados entre estas politicas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial ni redistribucion; conviene contactar con el autor antes de integrarla en un producto.
- Ajuste in-sample: los 108 valores de la tabla de arranque se re-buscaron con CMA-ES sobre las seeds oficiales de la Arena, sin validacion fuera de muestra, lo que puede implicar sobreajuste a esas condiciones concretas.
- Validacion solo en simulacion: no consta evaluacion en el robot fisico, por lo que existe riesgo de brecha sim-to-real en la marcha.
- Especificidad de escenario: la politica esta afinada para el remix de escalada de colinas de 1,5 m; su comportamiento en otras superficies o tareas no esta documentado.
- Dependencia del ecosistema: requiere el demonio microduck y el wrapper con contador de pasos y tabla de arranque; no es una politica generica reutilizable fuera de ese stack.
- Sin benchmarks publicados: no hay cifras de exito, velocidad, consumo ni estabilidad que permitan compararla objetivamente con alternativas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de soporte o mantenimiento.
- No es un modelo de lenguaje: no genera texto, no procesa lenguaje natural y no admite prompts, por lo que cualquier expectativa de ese tipo no aplica.
- Alucinacion: no aplica en el sentido de un LLM; el riesgo equivalente es una salida de control incorrecta o inestable, que puede provocar caidas del robot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DenRakEiw/microduck-c-3pduck_0788
- Modelo base: https://huggingface.co/suraj-phanindra/microduck-hill-hc5-aifund
- Variante del mismo autor: https://huggingface.co/DenRakEiw/microduck-c-3pduck_0908
- Otra politica del mismo autor: https://huggingface.co/DenRakEiw/microduck-scrooge
- Repositorio de RL: `pollen-robotics/microduck_rl` (rama `denrakeiw`, commit `d6a27c4d1`)
- Robot microduck (Pollen Robotics): https://pollen-robotics.com/microduck/
- Repositorio del robot: https://github.com/pollen-robotics/microduck
- Tutorial de montaje: https://github.com/AI-FanGe/Microduck-build-tutorial
