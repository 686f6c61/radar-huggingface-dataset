# rumezhak/microduck-sprint-composite-v1

## Resumen

microduck-sprint-composite-v1 es un artefacto de control para el robot simulado MicroDuck, publicado por el usuario rumezhak como entrada en la prueba de 2 metros (2 m Sprint) de la Microduck Arena de Pollen Robotics. No es un modelo de lenguaje ni un sistema de vision: es un fichero ONNX que contiene una red neuronal pequena combinada con tablas de busqueda (lookup tables) que reproducen secuencias de control previamente registradas. Su funcion es generar las acciones de los servos del MicroDuck para recorrer 2 metros en el menor tiempo posible dentro del simulador.

El modelo es un merge de dos artefactos publicos: jrubiosainz/microduck-game-sprinter-remix14 (que aporta la estructura de tablas y las secuencias base) y HlibPlakhtii/microduck-sprint-quicksilver-v2 (que aporta la secuencia de la semilla 4). Sobre esa base, el autor reconstruye las tablas principales `L_obs` y `L_act` a partir de busquedas de cola (tail search) sobre las secuencias de las semillas 1, 2, 3 y 5, y desactiva tres capas de lookup secundarias. El resultado es un tiempo medio de 0,818 s en las cinco semillas oficiales, ligeramente peor que el 0,817 s de remix14.

La relevancia de esta ficha es acotada: se trata de un artefacto de competicion, in-sample y fragil, que solo funciona en el simulador de la Arena y bajo condiciones de coma flotante muy especificas. No debe cargarse en un MicroDuck fisico. Su interes es como ejemplo de ingenieria de merges de artefactos de control y de busqueda sobre secuencias registradas, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal pequena combinada con tablas de busqueda (lookup tables) sobre grafo ONNX; no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; control reactivo por tick de 5 ms) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (libreria microduck) |

## Arquitectura y entrenamiento

El artefacto combina una red neuronal (procedente del linaje de a1rb4Ck, segun los creditos) con varias capas de lookup: `L_obs`, `L_act`, `L_mask`, `L_tol` y tres capas adicionales (`search_`, `T_r2_s4_`, `jr_s5_`). Las tablas `L_obs` y `L_act` tienen 331 filas. La red se activa cuando la observacion no coincide exactamente con ninguna fila de las tablas; las tablas permiten reproducir acciones ya registradas sin pasar por la red. Los operadores de grafo, la red, `L_mask`, `L_tol` y el resto de tensores se mantienen sin cambios respecto a remix14.

No hay entrenamiento en el sentido habitual: el autor reconstruye `L_obs` y `L_act` a partir de una secuencia registrada por semilla, obtenida mediante busquedas de cola sobre las secuencias de remix14 para las semillas 1, 2, 3 y 5, y toma la secuencia de quicksilver-v2 para la semilla 4. Las tres capas de lookup secundarias (`search_`, `T_r2_s4_`, `jr_s5_`) se desactivan fijando sus tolerancias a -1, aunque sus filas permanecen en el fichero. Se anade una entrada de metadatos `modification_notice` conforme a la seccion 4(b) de Apache-2.0, y el detalle de cambios figura en el fichero `NOTICE`. No se documentan datos de entrenamiento, numero de tokens ni tecnicas de RLHF/DPO porque no aplican.

## Capacidades

- Generacion de acciones de control para el MicroDuck simulado en la prueba de 2 m Sprint de la Microduck Arena.
- Reproduccion exacta de secuencias registradas mediante lookup sobre observaciones, con fallback a la red neuronal cuando la observacion no coincide bit a bit.
- Ejecucion determinista por semilla dentro del simulador, con tiempos de 0,815 s, 0,815 s, 0,825 s, 0,820 s y 0,815 s en las semillas 1 a 5.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.
- No incluye modo thinking ni ninguna capacidad cognitiva; es un controlador reactivo por tick de 5 ms.

## Casos de uso

- Participacion en la prueba de 2 m Sprint de la Microduck Arena: el artefacto se carga en el runner de la Arena y compite en las cinco semillas oficiales, con un tiempo medio de 0,818 s y 5/5 terminaciones.
- Estudio de merges de artefactos de control: sirve para analizar como se combinan tablas de lookup y redes en un grafo ONNX y como afecta la reconstruccion de `L_obs` y `L_act` al tiempo final.
- Analisis de sensibilidad a la coma flotante: util para medir como el redondeo de otra maquina puede romper la coincidencia bit a bit de una observacion y devolver la semilla a la red.
- Referencia para busquedas de cola (tail search): documenta una metodologia de busqueda sobre secuencias registradas que mejora el instante de cruce dentro del mismo tick de 5 ms.
- Comparacion de politicas en simulacion: permite contrastar remix14, quicksilver-v2 y este composite semilla a semilla con diferencias de 5 ms.
- Docencia sobre control reactivo en robotica simulada: ilustra el uso de lookup tables con fallback neuronal en un controlador de servos.
- No es adecuado para atencion al cliente, generacion de codigo, matematicas ni ninguna tarea linguistica.

## Benchmarks y rendimiento

Los unicos datos publicados son los tiempos de la prueba de 2 m Sprint en las cinco semillas oficiales de la Microduck Arena.

| Semilla | remix14 (s) | microduck-sprint-composite-v1 (s) | Origen de la secuencia |
|---|---|---|---|
| 1 | 0,815 | 0,815 | tail search de rumezhak sobre remix14 |
| 2 | 0,815 | 0,815 | tail search de rumezhak sobre remix14 |
| 3 | 0,825 | 0,825 | tail search de rumezhak sobre remix14 |
| 4 | 0,815 | 0,820 | HlibPlakhtii/microduck-sprint-quicksilver-v2 |
| 5 | 0,815 | 0,815 | tail search de rumezhak sobre remix14 |
| Media | 0,817 | 0,818 | |

En las semillas 1, 2, 3 y 5 el cruce de meta ocurre entre 0,05 y 0,15 pasos de control antes dentro del mismo tick de 5 ms, lo que no altera el tiempo registrado. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks equivalentes, porque no aplican a este artefacto.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y el artefacto es un ONNX de tablas y red pequena, por lo que cabe en CPU.
- GPU recomendadas: no se especifican; el autor solo valida en x86-64 Linux con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.
- Cabe en cualquier GPU consumer y en CPU; no requiere aceleracion dedicada.
- Opciones de despliegue: onnxruntime dentro del runner de la Microduck Arena; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: control por tick de 5 ms; no se publican medidas de latencia de inferencia mas alla del tiempo de carrera.

## Comparativa con modelos similares

| Modelo | Tipo | Tiempo medio (5 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|
| rumezhak/microduck-sprint-composite-v1 | Merge de lookup + red (ONNX) | 0,818 s | apache-2.0 | Publico en HuggingFace |
| jrubiosainz/microduck-game-sprinter-remix14 | Lookup + red (ONNX) | 0,817 s | apache-2.0 | Publico en HuggingFace |
| HlibPlakhtii/microduck-sprint-quicksilver-v2 | Lookup + red (ONNX) | 0,820 s en semilla 4 | apache-2.0 | Publico en HuggingFace |
| nikghodki/microduck-sprint-lookup-v1 | Lookup (ONNX) | no disponible | apache-2.0 | Publico en HuggingFace |

El composite no supera a remix14 en tiempo medio; su interes es la combinacion de secuencias y la reconstruccion de tablas, no una mejora de marca.

## Limitaciones y advertencias

- Los resultados son in-sample: las tablas solo reproducen las carreras de las cinco semillas oficiales y exigen coincidencia bit a bit de la observacion.
- El redondeo en coma flotante de otra maquina puede romper la reproduccion y devolver esa semilla a la red, degradando el tiempo.
- Solo se ha validado en x86-64 Linux con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.
- No debe cargarse en un MicroDuck fisico: las acciones tardias quedan muy fuera de lo que se pediria a un servo real.
- Es un artefacto de simulacion; no tiene capacidades linguisticas, de vision ni de razonamiento, y no presenta sesgos ni alucinaciones en el sentido habitual, aunque el fallback a la red puede producir acciones no verificadas.
- La licencia Apache-2.0 permite uso comercial, pero la seccion 4(b) obliga a conservar los avisos de modificacion; el detalle esta en `NOTICE`.
- El autor advierte que un asistente de IA ayudo en la busqueda y en la redaccion de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rumezhak/microduck-sprint-composite-v1
- Modelo base remix14: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix14
- Modelo base quicksilver-v2: https://huggingface.co/HlibPlakhtii/microduck-sprint-quicksilver-v2
- Lookup previo: https://huggingface.co/nikghodki/microduck-sprint-lookup-v1
- Microduck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Pollen Robotics: https://huggingface.co/pollen-robotics
