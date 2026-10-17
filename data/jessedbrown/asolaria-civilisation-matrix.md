# Jessedbrown/asolaria-civilisation-matrix

## Resumen

Jessedbrown/asolaria-civilisation-matrix es un repositorio publicado en HuggingFace por el usuario Jessedbrown que no contiene un modelo de red neuronal, sino un artefacto de simulación denominado "ASOLARIA CIVILISATION — THE SHARED MATRIX". Según su propia model card, describe un experimento con quince agentes que operan sobre una superficie compartida de 729 celdas (27², la "retícula ternaria al cuadrado"), en el que el tiempo no se mide con un reloj sino con una cadena de hashes SHA-16 encadenados por tick. Cada agente recibe 600 ticks (10 minutos) y el resultado declarado es una matriz saturada (729/729 celdas) con 7.946 colisiones registradas como "bumps" y 4.917.706.148 bytes leídos y verificados contra ficheros .sha256.

El artefacto no expone pipeline, licencia, idiomas ni pesos utilizables para inferencia, y acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha. Su interés no es como modelo generativo, sino como material de referencia conceptual sobre scheduling determinista, coordinación multiaagente, reglas create-only (sin verbos de borrado ni sobrescritura) y reporte explícito de fallos de diseño. El propio autor documenta un defecto estructural: en la primera pasada, las celdas se asignaron por orden de lista y no por mérito, de modo que un agente acaparó 409 de 729 celdas y seis agentes se quedaron a cero.

Una segunda pasada, "RIME SPHERES", corrige ese problema introduciendo un orden de tick global en lugar de secuencias por agente, y presenta una tabla comparativa entre ambos regímenes. Esta segunda pasada incluye además hallazgos declarados sobre estados alcanzables en un "carrier" AC/DC, marcados por el propio autor con la etiqueta `status=DERIVED_MODEL_not_physics`, lo que indica que no se trata de física medida sino de un modelo derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el artefacto descrito no es una red neuronal; es una simulacion multiaagente determinista sobre una retícula de 729 celdas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio menciona artefactos con extension .hbp y sidecars .sha256, no safetensors ni GGUF) |
| Tipo de artefacto | simulacion / experimento reproducible con agentes |
| Autor | Jessedbrown |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-16 |
| Ultima actualizacion | 2026-10-09 |
| Etiquetas declaradas | region:us |

## Arquitectura y entrenamiento

No existe entrenamiento en el sentido habitual: el artefacto no presenta pesos, dataset de preentrenamiento, fases de RLHF, DPO ni ajuste supervisado. Lo que describe la model card es el diseno de una simulación. El tiempo se modela como una cadena de hashes (`tick[0] = sha16("TICK|" + agent_pid + "|0")` y `tick[k] = sha16(tick[k-1] + "|" + agent_pid + "|" + k)`), de forma que la secuencia completa es determinista y reproducible a partir unicamente del PID del agente. El kernel aplica reglas create-only: el primer escritor conserva la celda y no existen verbos de borrado ni de sobrescritura. Las colisiones se registran como "bumps" con ambos agentes, ambos ticks y ambos digests de payload; el autor declara `overwritten=0` y `dropped=0` sobre 7.946 bumps. La accion de cada tick (research, chariot, fix, improve, read, write) se deriva del propio hash del tick, de modo que ningun agente puede elegir la tarea facil.

La segunda pasada, RIME SPHERES, introduce un orden de tick global entre todos los agentes en lugar de planificaciones secuenciales por agente. En esa pasada, la "fisica se deriva, nunca se asigna": la masa es el polvo verificado que una esfera recolecta (bytes reales leidos y comprobados contra sidecars .sha256, 4.917.088.334 bytes), la gravedad es `isqrt(mass)`, la energia son peldaños contados de una escalera de base 3 y la posicion de color se deriva del hash. Todo el calculo es entero (`float_used=0`), cada esfera anida a profundidad prima con un PID de agente y un PID de vigilante por nodo (61.425 nodos) y una inyeccion de fallo por nivel fue detectada en el nivel exacto para las 15 esferas. El autor cierra anotando un hallazgo sobre el "carrier": un carrier AC alcanza 2 ceros distintos, no 3, y `zero_states()` discrepa de la salida alcanzable en 63 de 64 longitudes de ciclo.

## Capacidades

- Generacion de una superficie compartida determinista de 729 celdas (27²) sin operaciones de borrado ni sobrescritura.
- Programacion temporal reproducible a partir de un identificador (PID) mediante cadena de hashes SHA-16.
- Registro auditables de colisiones entre agentes, con agente, tick y digest de payload implicados.
- Verificacion de integridad de bytes leidos contra ficheros .sha256 escritos por terceros.
- Derivacion de magnitudes tipo "fisica" (masa, gravedad, energia) a partir de datos verificados, en aritmetica entera.
- Anidamiento a profundidad prima con deteccion de fallos inyectados por nivel (61.425 nodos declarados).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no es un modelo de razonamiento; es una simulacion de agentes.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no disponible en el sentido de vision, audio o modo "thinking".

## Casos de uso

- Material de referencia para disenar simulaciones multiaagente auditables: el patron de cadena de hashes por tick permite reproducir una ejecucion completa desde un PID, lo que resulta util para experimentos que deben ser verificables a posteriori.
- Estudio de caso sobre concurrencia frente a serializacion: el fallo documentado (409 celdas para el primer agente y 6 agentes a cero bajo orden de lista, frente a un maximo de 66 y minimo de 35 y cero agentes a cero con orden global) sirve como ejemplo didactico de por que la planificacion secuencial falsea los resultados.
- Verificacion de procedencia de artefactos: el uso de sidecars .sha256 para validar cada byte leido es directamente trasladable a pipelines de integridad de datasets o de artefactos de build.
- Docencia sobre resultados negativos y reporte honesto: la model card enumera el defecto antes de reejecutar y conserva el resultado original, lo que la convierte en material de ejemplo sobre como documentar fallos de diseno sin ocultarlos.
- Pruebas de inyeccion de fallos en estructuras jerarquicas: el anidamiento a profundidad prima con deteccion por nivel puede inspirar baterias de tests de tolerancia a fallos en arboles de dependencias.
- Prototipo conceptual de "fisica derivada": el esquema masa = bytes verificados, gravedad = `isqrt(mass)` puede usarse como ejercicio de modelado donde las magnitudes se calculan a partir de datos medidos y no se asignan a mano.
- Experimentos de reproducibilidad: sirve como plantilla para disenar ejecuciones que puedan repetirse bit a bit sin depender de un reloj de pared.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El repositorio unicamente incluye metricas autodeclaradas por el autor, que se reproducen a continuacion sin validacion independiente.

Metricas de la primera pasada, segun la model card:

| Metrica | Valor declarado |
|---|---|
| Agentes | 15 |
| Ticks por agente | 600 (10 minutos) |
| Ticks totales | 9.000 |
| Celdas cultivadas | 729/729 (saturado) |
| Bumps (colisiones) | 7.946 |
| Sobrescrituras | 0 |
| Descartes | 0 |
| gimel | 7.729 |
| shin | 1.150 |
| Bytes leidos y verificados | 4.917.706.148 |

Comparativa entre regimenes declarada por el autor:

| Metrica | Orden de lista | Orden de tick global |
|---|---|---|
| Maximo de celdas por agente | 409 | 66 |
| Minimo de celdas por agente | 0 | 35 |
| Agentes con cero celdas | 6 | 0 |

Hallazgos declarados sobre el "carrier": un carrier AC alcanza 2 ceros distintos y no 3; el estado `Some(Zero::Nil)` resulta inalcanzable para cualquier `steps_per_cycle >= 1`, verificado de forma exhaustiva en el rango 1..=64 y en todas las fases con 0 ocurrencias; `zero_states()` devuelve 3 y discrepa de la salida alcanzable en 63 de 64 longitudes de ciclo. El autor etiqueta estas conclusiones con `NAMED | status=DERIVED_MODEL_not_physics`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el artefacto no es un modelo de inferencia y no publica pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el repositorio no documenta ningun runtime de inferencia.
- Latencia y throughput: el autor afirma que "the whole civilisation runs instantly", pero se trata de una declaracion cualitativa sin medicion de hardware asociada. La unica magnitud temporal indicada es 600 ticks por agente equivalentes a 10 minutos, que es una unidad de simulacion, no una medida de tiempo de computo.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos o artefactos comparables de la misma categoria, porque este repositorio no es un modelo de lenguaje ni una red neuronal entrenada, sino una simulacion multiaagente con su propia nomenclatura. Cualquier comparacion con modelos de pesos publicados (por parametros, contexto, licencia o rendimiento) careceria de base en los datos disponibles.

## Limitaciones y advertencias

- No es un modelo de IA utilizable: no expone pipeline, pesos, tokenizador ni API de inferencia; no puede generar texto, codigo ni realizar tareas de razonamiento.
- Licencia no declarada: al no figurar licencia en el repositorio, no puede asumirse permiso para uso comercial ni para redistribucion.
- Repositorio sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, y ninguna metrica verificada por terceros.
- Defecto de diseno reconocido por el autor: en la primera pasada las celdas se asignaron por orden de lista, lo que produjo 409 celdas para el primer agente y seis agentes sin ninguna celda, con las filas de marcador indicando `could_not_do=grow a single uncontested cell`.
- Terminologia idiosincratica: "gimel", "shin", "chariot", "RIME SPHERES" o "RAINBOR" no se corresponden con vocabulario tecnico estandar, lo que dificulta la verificacion independiente de las afirmaciones.
- Afirmaciones fisicas acotadas por el propio autor: la model card incluye la etiqueta `NAMED | status=DERIVED_MODEL_not_physics` y aclara que no se integro nada sobre espacio-tiempo ni se resolvio ninguna fuerza, por lo que las magnitudes derivadas no deben interpretarse como resultados fisicos.
- Riesgo de alucinacion: no aplica en el sentido de un modelo generativo; si aplica en el sentido de que todas las cifras proceden de una unica fuente autodeclarada y no han sido replicadas.
- Idioma: la documentacion esta integramente en ingles y no se declaran idiomas soportados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jessedbrown/asolaria-civilisation-matrix
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
