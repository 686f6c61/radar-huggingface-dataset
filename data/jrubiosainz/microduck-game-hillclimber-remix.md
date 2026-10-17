# jrubiosainz/microduck-game-hillclimber-remix

## Resumen

Microduck game hillclimber remix es una política de control para robótica con patas, publicada por el usuario jrubiosainz, que compite en la prueba de subida de 1,5 m (1.5 m Hill Climb) de la Microduck Arena de Pollen Robotics. No es un modelo de lenguaje ni un transformer: es una red neuronal de control de tamaño muy reducido (197 774 pesos y sesgos) exportada a ONNX, con entrada `obs` de forma [1, 61] y salida `actions` de forma [1, 14]. Su único objetivo es recorrer la pendiente de la Arena lo más rápido posible con un comando constante de 0,3 m/s de avance, cero velocidad lateral y cero guinada.

El modelo es una remezcla (finetune) de juicenv/microduck-hill-es7: la red original se mantiene congelada y bit a bit idéntica, y alrededor de ella se añade un envoltorio en el grafo ONNX formado por un contador de pasos que viaja en el objetivo de `head_roll` y dos tablas de desfases (uno sobre la velocidad de avance que lee la red y otro sobre los objetivos articulares). Los 198 valores de esas tablas se buscaron con CMA-ES (población 24, paso inicial 0,02) sobre las cinco semillas oficiales del evento, usando el runner de la Arena con MuJoCo 3.10.0 en CPU x86-64 y la red congelada. Corresponde a la generación 1133 de la ejecución `dive_hill_es7`.

Su relevancia es acotada pero clara: es un ejemplo reproducible de optimización de una política de locomoción sin reentrenar la red, solo con un envoltorio determinista, y mejora el registro de su modelo base en el marcador (0,796 s frente a 0,800 s). Está pensado exclusivamente para simulación: el propio autor advierte de que no debe cargarse en un MicroDuck físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de control de locomoción exportada a ONNX, envuelta en un grafo con contador de pasos y dos tablas de desfases lineales a trozos. No es transformer, MoE ni SSM |
| Parametros totales | 197 774 pesos y sesgos en la red congelada; el archivo ONNX completo ocupa 831 318 bytes |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la política es reactiva y consume un vector de observación de 61 valores en cada paso de control |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje); no disponible |
| Licencia | no disponible; el repositorio declara no tener licencia y el modelo fuente tampoco la declara |
| Formato de pesos | ONNX (`policy.onnx`, sha256 `0d64d941a4a9b780be7e22163cc79f6ee912396813690911ed7223b16d6a6941`) más `manifest.json` (manifiesto de política de Pollen, esquema 2) |
| Entrada / salida | `obs` [1, 61] / `actions` [1, 14] |
| Paso de control | 0,02 s (50 Hz); los tiempos de carrera se miden en pasos enteros |
| Modelo base | juicenv/microduck-hill-es7 (revisión `5b0ff17c`) |

## Arquitectura y entrenamiento

La arquitectura es una política de control de tamaño mínimo para el robot MicroDuck. La red del modelo base se hereda sin cambios: sus 197 774 pesos y sesgos son idénticos bit a bit a los del original, y el normalizador de entrada se pliega en las constantes del envoltorio, de modo que el grafo calcula `obs · (1/std) + (c_k − mean)/std` donde el fuente calculaba `(obs − mean)/std`. Sobre esa red congelada se añaden, con operadores ONNX estándar, un contador de pasos y dos tablas de desfases. El contador redondea el objetivo de `head_roll` a 1/256 rad y le suma el número de pasos de control ejecutados en unidades de 1/65536 rad, de forma que el paso siguiente lee el contador k exactamente (k = 25 + paso de carrera, saturado en 127), gracias a que la Arena realimenta a cada política su acción anterior; el desplazamiento resultante del objetivo de `head_roll` es de como máximo unos 0,004 rad. La tabla de comando `c_k` añade un desfase de velocidad de avance de entre −0,256 y +0,285 m/s a partir del paso de contador 26 (primer paso de carrera) y vale cero antes; el resto de componentes del comando no se tocan. La tabla articular `o_k` añade desfases simétricos y antisimétricos a los objetivos de hip pitch, rodilla y tobillo de ambas piernas, y al cuello y al pitch de la cabeza, con un máximo de 0,63 rad, y valor cero en `head_roll`, `head_yaw`, `left_hip_roll`, `left_hip_yaw`, `right_hip_roll` y `right_hip_yaw`.

El entrenamiento fue una búsqueda evolutiva, no un ajuste por gradiente: CMA-ES con población 24 y paso inicial 0,02 optimizó los 198 valores de nudo (22 nudos × 9 canales) de las dos tablas, que son lineales a trozos con nudos cada 2 pasos desde el 26 hasta el 68 (aproximadamente 0,86 s de carrera) y se mantienen constantes después del último, midiendo el tiempo de carrera sobre las cinco semillas oficiales dentro del runner de la Arena (MuJoCo 3.10.0, CPU x86-64) y con la red congelada. Se conservó un candidato solo si superaba el marcador del modelo fuente y, al repetir la ejecución 8 veces con ruido σ = 10⁻⁷ en todas las observaciones excepto el contador de pasos, terminaba todas las semillas cada vez con una media por debajo de la del fuente (0,796 s en cada repetición). El archivo reconstruido a partir del fuente y de las tablas de la búsqueda es idéntico al publicado. El código de entrenamiento citado es pollen-robotics/microduck_rl, en el commit `3c0598cae`, rama `hannes-ft`.

## Capacidades

- Locomoción cuadrúpeda en simulación: genera de forma continua los objetivos de 14 articulaciones para subir una pendiente de 1,5 m a una velocidad comandada de 0,3 m/s.
- Marcha perpetua con comando constante: el manifiesto lo describe como una marcha perpetua de comando fijo, sin cambio de tarea durante la ejecución.
- Control reactivo a 50 Hz: consume 61 observaciones por paso y devuelve 14 acciones por paso.
- Mejora medida sobre el modelo base: 0,796 s de media en las cinco semillas oficiales frente a 0,800 s del fuente (0,004 s más rápido).
- Robustez acotada al ruido de observación: supera 8 repeticiones por semilla con ruido σ = 10⁻⁷ en todas las observaciones salvo el contador, con media de 0,796 s.
- Reconstruibilidad: el archivo puede regenerarse de forma idéntica a partir del modelo fuente y de las tablas de la búsqueda.
- No dispone de tool calling ni function calling, ni de razonamiento multi-paso, ni de capacidades de agente, ni de generación de texto, código, matemáticas, visión o audio. Tampoco tiene modo de pensamiento (thinking) ni capacidades multilingües.

## Casos de uso

- Evaluación comparativa en la Microduck Arena: cargar `policy.onnx` en el runner oficial y medir el tiempo de la subida de 1,5 m sobre las cinco semillas oficiales, reproduciendo el marcador de 0,796 s y comparándolo con el del modelo base.
- Estudio de optimización sin reentrenamiento: usar este remix como caso de referencia para investigar cuánto se puede mejorar una política congelada añadiendo un envoltorio determinista (contador de pasos y tablas de desfases) en lugar de reentrenar la red.
- Docencia de estrategias evolutivas: servir de ejemplo reproducible de CMA-ES aplicado a un problema de control continuo con una función de coste barata (el tiempo de carrera en MuJoCo), con parámetros de búsqueda documentados (población 24, paso inicial 0,02, 22 nudos × 9 canales).
- Pruebas de integración de ONNX Runtime: el archivo es pequeño (831 318 bytes) y determinista, lo que permite validar canalizaciones de inferencia ONNX, comprobación de formas de entrada y salida, y verificación de hashes en CI sin coste de GPU.
- Reproducción de investigaciones sobre realimentación de acciones: como el contador de pasos depende de que el entorno devuelva la acción previa, el modelo sirve para estudiar la sensibilidad de una política a ese bucle de realimentación y al ruido en las observaciones.
- Análisis de sobreajuste a semillas: comparar el comportamiento del remix en las cinco semillas oficiales frente a semillas cercanas o distintas CPUs permite cuantificar cuánto de la mejora es específico del conjunto de evaluación.
- Referencia negativa de sim-a-real: el propio autor lo señala como no apto para hardware, por lo que es útil como caso de estudio de qué construcciones (un contador que viaja en un objetivo articular) no sobreviven al traslado a un robot físico.
- Punto de partida para nuevas remezclas: dado que la red es idéntica a la del fuente y el envoltorio es reconstruible, otro autor puede partir de aquí y repetir la búsqueda CMA-ES con otros rangos de desfase o más nudos.

## Benchmarks y rendimiento

Tiempos de carrera en segundos sobre las semillas oficiales del evento, a 0,3 m/s de velocidad comandada (la misma velocidad a la que compiten ambas entradas):

| Semilla | microduck-hill-es7 | Este remix |
|---|---|---|
| 1 | 0,80 | 0,80 |
| 2 | 0,80 | 0,80 |
| 3 | 0,80 | 0,78 |
| 4 | 0,80 | 0,80 |
| 5 | 0,80 | 0,80 |
| Marcador (media) | 0,800 | 0,796 |

Advertencia del autor: son cifras in-sample, porque la búsqueda puntuó sus candidatos sobre esas mismas semillas, igual que las búsquedas elitistas que produjeron el modelo fuente. Los tiempos se expresan en pasos de control enteros de 0,02 s, por lo que el marcador se mueve en incrementos de 0,004 s, y semillas cercanas u otra CPU pueden dar otros tiempos. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares) en la información disponible, y no serían aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU; el archivo de pesos ocupa 831 318 bytes y la red tiene 197 774 parámetros, por lo que cabe en memoria principal de cualquier equipo.
- GPU recomendadas: no aplica. El runner oficial se ejecutó en CPU x86-64 con MuJoCo 3.10.0; no se documenta uso de GPU.
- GPU de consumo: irrelevante para este modelo, ya que la inferencia puede hacerse íntegramente en CPU.
- Opciones de despliegue: ONNX Runtime para cargar `policy.onnx`, junto con el runner de la Microduck Arena y MuJoCo 3.10.0; los artefactos se publican con el `manifest.json` de Pollen. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: el bucle de control funciona a 0,02 s por paso (50 Hz) y una carrera completa de 1,5 m dura entre 0,796 s y 0,800 s en las semillas oficiales (del orden de 40 pasos de control). El marcador se cuantiza en pasos de 0,004 s. No se publica latencia de inferencia por paso ni throughput medido.
- Dependencia de plataforma: los tiempos de referencia se obtuvieron en x86-64; el autor advierte de que otra CPU puede dar tiempos distintos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / tarea | Rendimiento en la prueba | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-game-hillclimber-remix | 197 774 en la red congelada, más 198 valores de tabla (22 nudos × 9 canales) | Política reactiva, obs [1, 61] → actions [1, 14] | 0,796 s de media en las 5 semillas oficiales | no disponible | HuggingFace |
| juicenv/microduck-hill-es7 | 197 774 (red idéntica) | Política reactiva para la misma prueba | 0,800 s de media en las 5 semillas oficiales | no disponible | HuggingFace |
| suraj-phanindra/microduck-hill-hc2-aifund | no disponible | Política para la misma prueba, ajustada por estrategias evolutivas sobre el scorer de la Arena | 0,808 s citado en el manifiesto del modelo base | no disponible | HuggingFace |
| namenu/microduck-arena | no disponible | Antecesor del que procede el linaje del modelo base | no disponible | no disponible | HuggingFace |

La comparación se limita a la familia de políticas que compiten en la misma prueba de la Microduck Arena; no existen equivalentes de propósito general con los que contrastar parámetros o longitud de contexto, porque no es un modelo de lenguaje.

## Limitaciones y advertencias

- Solo simulación: fue entrenado y evaluado únicamente en el simulador de la Arena, sobre sus cinco semillas oficiales, y no se ha probado en hardware.
- No cargar en un robot físico: el contador de pasos viaja en el objetivo de `head_roll`, que un robot real no realimentaría bit a bit, lo que rompe el mecanismo del que depende el modelo. El autor lo advierte de forma explícita para el MicroDuck físico.
- Cifras in-sample: la búsqueda CMA-ES puntuó los candidatos sobre las mismas cinco semillas que se usan para reportar el resultado, por lo que existe sobreajuste a ese conjunto y la mejora de 0,004 s no garantiza generalización a semillas o condiciones nuevas.
- Cuantización del marcador: los tiempos son pasos de control enteros de 0,02 s, de modo que la diferencia reportada equivale a un solo paso y el marcador se mueve en saltos de 0,004 s; semillas cercanas u otra CPU pueden alterar el resultado.
- Ámbito de comando restringido: la política asume el comando constante de la Arena (0,3 m/s de avance, cero lateral y cero guinada) y una pendiente de 1,5 m; no hay garantías fuera de ese comando o de esa geometría.
- Dependencia del bucle de realimentación: el contador requiere que el entorno devuelva la acción anterior tal cual; cualquier alteración de esa realimentación invalida el mecanismo.
- Licencia no declarada: ni este repositorio ni el modelo fuente declaran licencia, por lo que no hay autorización explícita de uso comercial ni condiciones de redistribución definidas. Los créditos corresponden a juicenv, namenu, suraj-phanindra y Pollen Robotics, y deben respetarse.
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo de lenguaje.
- Sesgos sociales: no aplica en el sentido habitual; el principal sesgo operativo es la especialización extrema en una única tarea y en cinco semillas concretas.
- Idiomas: no aplica, no procesa texto.
- Dependencia de versiones y linaje: los resultados se obtienen con MuJoCo 3.10.0 en x86-64 y el `run_path` del ONNX apunta a las ejecuciones de entrenamiento de namenu, de modo que la reproducibilidad depende de esas piezas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix
- Modelo base (juicenv/microduck-hill-es7): https://huggingface.co/juicenv/microduck-hill-es7
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Código de entrenamiento (pollen-robotics/microduck_rl, commit `3c0598cae`, rama `hannes-ft`): https://github.com/pollen-robotics/microduck_rl
- Autor del modelo base: https://huggingface.co/juicenv
- Autor citado del linaje de entrenamiento: https://huggingface.co/namenu y https://huggingface.co/namenu/microduck-arena
- Autor citado del ajuste previo: https://huggingface.co/suraj-phanindra
- Organización responsable del robot, la Arena y las herramientas de publicación: https://huggingface.co/pollen-robotics
- La búsqueda web realizada no devolvió ningún enlace relevante: el único resultado fue la página de inicio de sesión de YouTube, sin relación con el modelo.
