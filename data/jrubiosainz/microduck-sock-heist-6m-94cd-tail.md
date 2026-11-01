# jrubiosainz/microduck-sock-heist-6m-94cd-tail

## Resumen

Microduck Sock Heist - 94cd tail re-optimised es una política de control para el simulador Microduck Arena, un entorno de robótica basado en el robot MicroDuck de Pollen Robotics. No es un modelo de lenguaje: es un archivo ONNX de 1.365.200 bytes que contiene una tabla de búsqueda (lookup table) por semilla seguida de una red de respaldo, y que resuelve una tarea concreta de locomoción y sincronización temporal dentro del simulador. Lo publica el usuario jrubiosainz como modificación del trabajo de a1rb4Ck (`microduck-heist`, commit `94cd2cf`), que a su vez declara apoyarse en el walker de juicenv.

La modificación es deliberadamente mínima y quirúrgica: se reescriben 64 de las 1.901 filas de la tabla de acciones (`L_act`) y sus correspondientes claves de observación (`L_obs`) para las semillas 1, 3, 4 y 5, correspondientes a los últimos 16 pasos antes de la meta. El grafo ONNX, el resto de inicializadores y todas las formas de tensor se mantienen idénticos al original. El resultado declarado es que las cinco semillas oficiales terminan la prueba, con una mejora media de tiempo de 7,097 s a 7,032 s.

Su relevancia es acotada pero clara para quien trabaje con Microduck Arena: documenta con precisión un flujo de optimización de políticas tabulares mediante CMA-ES validado contra el runner oficial, y ejemplifica las prácticas de atribución y aviso de modificación exigidas por Apache-2.0 en un artefacto derivado. No aporta capacidades generales de IA ni es transferible fuera del simulador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política tabular (lookup table) con red de respaldo, exportada como grafo ONNX; inicializadores `L_obs`, `L_act`, `L_mask`, `L_tol` |
| Parametros totales | No disponible (1.901 filas de tabla; no se publica recuento de pesos de la red de respaldo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no aplica; entrada de observación por paso) |
| Tipos de cuantizacion | No disponible (artefacto ONNX en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 (declarada por el upstream; el autor advierte que no garantiza cobertura de todos los componentes incorporados) |
| Formato de pesos | ONNX (`policy.onnx`, 1.365.200 bytes, SHA256 `24b834bbfd56db1a2c73bf26c717946017480f0fc5ccad9244d8131a04c07593`) |

## Arquitectura y entrenamiento

El artefacto es un grafo ONNX que combina una tabla de búsqueda indexada por observación con una red neuronal de respaldo para los casos no cubiertos por la tabla. La tabla se organiza por semilla: las filas modificadas corresponden a los rangos 358-373 (semilla 1), 1057-1072 (semilla 3), 1450-1465 (semilla 4) y 1884-1899 (semilla 5), es decir, 16 filas por semilla y 64 en total sobre 1.901. Las claves de `L_obs` se sustituyen por las observaciones registradas durante la repetición de validación, de modo que la tabla es consistente con la trayectoria efectivamente ejecutada.

El método de optimización no es entrenamiento por gradiente: para cada semilla se lanzó una búsqueda CMA-ES que propuso nuevas acciones para los últimos 16 pasos antes de la meta, y cada candidato se verificó replicándolo con el runner oficial de Microduck Arena 0.7.0 sobre CPU x86. Solo se aceptaron las acciones que superaron esa validación. No se documentan tokens de entrenamiento, composición de dataset ni fases de RLHF o DPO, porque el paradigma no es el de un modelo generativo. La innovación técnica reseñable es la propia metodología: optimización de cola (tail) sobre una política tabular preexistente, con validación in-sample contra el simulador y sin tocar el grafo.

## Capacidades

- Control de política para la tarea Sock Heist del simulador Microduck Arena, con comportamiento de "avanzar cuando el semáforo está en verde y congelarse cuando el gigante mira".
- Ejecución determinista por semilla sobre las cinco tablas horarias oficiales del entorno.
- Inferencia en CPU x86 sin aceleración por GPU, mediante el runner de Arena 0.7.0 (runner version 5).
- Compatibilidad con `evaluate_at(1.2)`: la tabla no lee el comando de velocidad, por lo que la evaluación a velocidad 1.2 coincide con el barrido completo.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio.
- No dispone de capacidades multilingües: no procesa lenguaje.

## Casos de uso

- Evaluación comparativa en Microduck Arena: sirve como entrada de referencia para medir tiempos de finalización en las cinco semillas oficiales frente a otras políticas del mismo entorno, con la salvedad de que solo la ejecución de Arena sobre este repositorio establece su puntuación.
- Estudio de optimización de cola en políticas tabulares: el parche de 64 filas documentado permite reproducir el efecto de una búsqueda CMA-ES restringida a los últimos 16 pasos, útil como caso didáctico de optimización localizada.
- Verificación de pipelines de evaluación en CPU: al ejecutarse en x86 sin GPU, es adecuado para probar la integración del runner de Arena 0.7.0 en CI con tiempos de unos 5,5 a 8 s por semilla.
- Referencia de cumplimiento Apache-2.0 en artefactos derivados: el `NOTICE`, el campo `modification_notice` en los metadatos ONNX y la reproducción literal de la model card original ejemplifican las obligaciones de las secciones 4(a) a 4(d) de la licencia.
- Auditoría de procedencia: la cadena de atribución (a1rb4Ck, juicenv, lphatnguyen, Pollen Robotics) con hashes y commits fijados permite trazar qué se modificó y qué no, incluida la advertencia sobre componentes sin licencia declarada.
- Docencia o divulgación sobre robótica simulada: ilustra cómo una política de 1,3 MB y sin entrenamiento profundo resuelve una tarea de sincronización temporal en un simulador, con métricas reproducibles.

## Benchmarks y rendimiento

Resultados declarados por el autor con `arena.evaluate.evaluate` (Microduck Arena 0.7.0, runner version 5) sobre CPU x86, comparando el archivo modificado con la entrada de origen:

| Semilla | Resultado | Tiempo modificado (s) | Tiempo origen (s) |
|---|---|---|---|
| 1 | finished | 6,975 | 6,99 |
| 2 | finished | 7,390 | 7,390 |
| 3 | finished | 5,560 | 5,64 |
| 4 | finished | 7,280 | 7,49 |
| 5 | finished | 7,955 | 7,975 |
| Media | 5 de 5 finished | 7,032 | 7,097 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni serían aplicables a este artefacto.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia se ejecuta en CPU x86.
- GPU recomendadas: no disponible; no se documenta uso de GPU.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: runner oficial de Microduck Arena 0.7.0 (runner version 5) con `arena.evaluate.evaluate` y `evaluate_at(1.2)`; el archivo es un ONNX estándar y podría cargarse con un runtime ONNX genérico, aunque la validación documentada es la del runner oficial.
- Latencia y throughput: entre 5,56 s y 7,955 s por semilla en CPU x86 según la tabla del autor; no se publican medidas de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Semillas finalizadas | Tiempo medio (s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-sock-heist-6m-94cd-tail (este) | Tabla + red de respaldo, ONNX | 1.365.200 bytes | 5 de 5 | 7,032 | Apache-2.0 (con salvedades) | HuggingFace |
| a1rb4Ck/microduck-heist @94cd2cf | Tabla + red de respaldo, ONNX | 1.364.816 bytes | 5 de 5 | 7,097 | Apache-2.0 | HuggingFace |
| lphatnguyen/microduck-sock-heist-6m-v3 | No disponible | No disponible | No disponible | No disponible | Sin licencia declarada | HuggingFace |

No se dispone de datos de rendimiento de otras entradas de Microduck Arena en la información proporcionada.

## Limitaciones y advertencias

- Resultados in-sample: las tablas están ajustadas a las cinco tablas horarias oficiales; el autor no reclama generalización a otras tablas, posiciones iniciales, máquinas o velocidades.
- Entrada exclusivamente de simulador: no es un controlador validado para un robot físico y el autor indica explícitamente que no debe cargarse en hardware real.
- Solo la ejecución de Arena sobre este repositorio establece su puntuación; los resultados publicados son locales.
- Procedencia incompleta: el upstream declara apoyarse en el walker de juicenv y podría incorporar componentes de `lphatnguyen/microduck-sock-heist-6m-v3`, que no declara licencia; el autor no extiende Apache-2.0 a esos componentes ni garantiza su cobertura.
- La licencia Apache-2.0 registrada en los metadatos refleja la declaración del upstream, no una garantía independiente sobre cada componente incorporado.
- No hay `manifest.json` en el repositorio, igual que en el origen.
- El autor se compromete a retirar la entrada si un autor upstream presenta objeción.
- La model card indica que un asistente de IA participó en la búsqueda, la publicación y la redacción de la ficha.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución más allá de la advertencia de no generalización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-94cd-tail
- Modelo de origen (a1rb4Ck): https://huggingface.co/a1rb4Ck/microduck-heist/tree/94cd2cfeb57a4ece561a3d320e233f442238cb81
- Repositorio atribuido a lphatnguyen: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3/tree/194c8a05d958c6e6337b0b27804f4f783697a1ce
- Perfil de juicenv: https://huggingface.co/juicenv
- MicroDuck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Perfil de Pollen Robotics: https://huggingface.co/pollen-robotics
- Texto de la licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
