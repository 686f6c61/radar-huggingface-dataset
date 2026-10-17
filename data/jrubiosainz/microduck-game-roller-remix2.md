# jrubiosainz/microduck-game-roller-remix2

# microduck-game-roller-remix2

## Resumen
microduck-game-roller-remix2 es una política de control para robótica publicado por el usuario jrubiosainz en Hugging Face, etiquetado con los tags microduck, onnx, robotics y reinforcement-learning. No es un modelo de lenguaje: es el artefacto de control (policy.onnx, 831.318 bytes) de un robot bípedo simulado que compite en el sprint de 2 m sobre patines de la Microduck Arena. Su función es generar las acciones articulares del robot a partir de un vector de observación de 61 dimensiones y producir 14 salidas de acción.

Se trata de una remezcla (finetune) de suraj-phanindra/microduck-roller-hc4-aifund. La red original se conserva congelada y bit-idéntica (197.774 pesos y sesgos); el cambio consiste en envolverla en un contador de pasos que suma desfases por paso a los objetivos articulares y a la velocidad de avance que lee la política. Esos desfases se buscaron con CMA-ES sobre las cinco semillas oficiales del evento.

Su relevancia es acotada y muy específica: mejora marginalmente el tiempo de la política base en el banco de pruebas de la Arena (0.940 s de media frente a 0.944 s) y sirve como ejemplo de ajuste de bajo coste sobre una política RL ya entrenada, sin reentrenar la red. Está declarada explícitamente como solo para simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política entrenada por aprendizaje por refuerzo y exportada a ONNX; topología interna no detallada (197.774 pesos y sesgos) |
| Parametros totales | 197.774 pesos y sesgos (idénticos bit a bit a los del modelo base) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos, MoE) |
| Longitud de contexto | no aplica (política de control; entrada = vector de observación de 61 dimensiones, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye un único artefacto ONNX en la precisión original) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | no disponible (el autor no declara licencia; el repositorio del modelo base tampoco) |
| Formato de pesos | ONNX (policy.onnx, sha256 5309ef62504f7fe0b37b6f5ba57d2ba4327f30aa322d6b24ec186c2d48f93d15, 831.318 bytes) |
| Entrada | obs [1, 61] |
| Salida | actions [1, 14] |
| Modelo base | suraj-phanindra/microduck-roller-hc4-aifund (revisión 033b4a91) |
| Tarea | Robotics / control de locomoción (sprint de 2 m sobre patines en simulación) |
| Simulador | Microduck Arena, runner con MuJoCo 3.10.0 sobre CPU x86-64 |
| Relación con el base | finetune (envoltorio de contador de pasos y tablas de desfase) |

## Arquitectura y entrenamiento
La red subyacente no se reentrena ni se modifica: sus 197.774 pesos y sesgos son idénticos bit a bit a los del modelo suraj-phanindra/microduck-roller-hc4-aifund. El cambio se implementa exclusivamente en el grafo ONNX, con operadores estándar. Se añade un contador de pasos que redondea el objetivo de head_roll a 1/256 rad y le suma el número de pasos de control ejecutados en unidades de 1/65536 rad. La Arena realimenta a cada política su acción anterior, de modo que el siguiente paso lee el contador k exactamente (k = 25 + paso de carrera, saturado en 127). El objetivo de head_roll se mueve como máximo unos 0,004 rad. Además, los valores del normalizador de entrada se pliegan en constantes del envoltorio: el grafo calcula obs · (1/std) + (c_k − mean)/std donde la fuente calcula (obs − mean)/std.

Sobre esa base se añaden dos tablas pequeñas: un desfase de comando c_k, sumado a los valores de comando que lee la red (comando de la Arena: 0,7 m/s hacia delante, cero lateral y cero guiñada), con un desfase de velocidad de avance entre −0,265 y +0,161 m/s a partir del paso de contador 26 (el primer paso de carrera) y cero antes; y un desfase articular o_k, sumado a los objetivos articulares a partir del paso 26, simétrico especular y antisimétrico en cadera, rodilla y tobillo de ambas piernas y con desfases en cuello y cabeceo, de hasta 0,45 rad, y cero en head_roll, head_yaw, left_hip_roll, left_hip_yaw, right_hip_roll y right_hip_yaw. Ambas tablas son lineales a trozos en k entre nudos cada 4 pasos, desde 26 hasta 76 (aproximadamente 1,02 s de carrera), y se mantienen tras el último nudo.

Los 126 valores de nudo (14 nudos × 9 canales) se buscaron con CMA-ES (población 24, paso inicial 0,03) optimizando el tiempo de carrera sobre las cinco semillas oficiales del evento, dentro del runner de la Arena (MuJoCo 3.10.0, CPU x86-64), con la red congelada. Corresponde a la generación 1.243 de la ejecución dive_roller_hc4. Un candidato solo se conservaba si batía el banco de la fuente y, reejecutado 8 veces con ruido de σ = 10⁻⁷ en todas las observaciones salvo el contador de pasos, terminaba todas las semillas cada vez con un banco medio inferior al de la fuente (0.944, 0.940, 0.940, 0.940, 0.944, 0.940, 0.940, 0.940 s). El fichero reconstruido a partir de la fuente y de las tablas de la búsqueda es idéntico a este.

## Capacidades
- Locomoción bípeda sobre patines en simulación: ejecuta el sprint de 2 m de la Microduck Arena con una marcha perpetua de comando constante.
- Control articular de 14 grados de libertad alimentado por un vector de observación de 61 dimensiones, a una frecuencia de control de 50 Hz (paso de 0,02 s).
- Velocidad de avance comandada de 0,7 m/s, con comando lateral y de guiñada nulos.
- Realimentación paso a paso: aprovecha que la Arena devuelve la acción anterior para leer el contador de pasos a través del objetivo de head_roll.
- Generalización dentro del entorno de simulación de la Arena: termina las cinco semillas oficiales.
- Robusteza declarada a ruido muy pequeño (σ = 10⁻⁷) en las observaciones distintas del contador de pasos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión, audio ni ninguna capacidad de ese tipo.

## Casos de uso
- Replicación de resultados de la Arena: cargar policy.onnx en el runner de la Microduck Arena (MuJoCo 3.10.0) para reproducir el tiempo de banco de 0.940 s sobre las cinco semillas oficiales.
- Estudio de ajuste sin reentrenamiento: analizar cómo un envoltorio de contador de pasos y tablas lineales a trozos mejora una política RL congelada sin tocar sus pesos.
- Docencia e investigación en optimización de caja negra: usar la búsqueda CMA-ES documentada (población 24, paso inicial 0,03, 126 nudos) como caso reproducible de optimización sobre el tiempo de carrera.
- Pruebas de robustez de políticas de locomoción: emplear el protocolo de reevaluación con ruido (σ = 10⁻⁷, 8 repeticiones) para medir estabilidad entre semillas.
- Benchmarking interno de entradas de la Microduck Arena: comparar esta política con otras entradas del sprint de 2 m sobre patines bajo las mismas condiciones y semillas.
- Generación de datos sintéticos de control: registrar las 14 salidas de acción por paso a lo largo de la carrera para construir conjuntos de trayectorias de referencia en simulación.
- Demostración de pipeline RL a despliegue ONNX: ilustrar el flujo desde el código de entrenamiento pollen-robotics/microduck_rl hasta un artefacto ONNX consumible por la Arena.

## Benchmarks y rendimiento
Tiempos de carrera (s) en las cinco semillas oficiales del evento, a 0,7 m/s de velocidad comandada de avance, la misma velocidad a la que compiten ambas entradas:

| Semilla | microduck-roller-hc4-aifund | este remix |
|---|---|---|
| 1 | 0,96 | 0,96 |
| 2 | 0,94 | 0,94 |
| 3 | 0,94 | 0,92 |
| 4 | 0,94 | 0,94 |
| 5 | 0,94 | 0,94 |
| **Banco (media)** | **0,944** | **0,940** |

Estos números son en muestra: la búsqueda puntuó sus candidatos sobre estas mismas semillas, igual que las búsquedas elitistas que produjeron la fuente. Los tiempos son pasos de control enteros (0,02 s), por lo que un banco se mueve en incrementos de 0,004 s; semillas próximas u otra CPU pueden dar tiempos distintos. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware
- VRAM estimada para inferencia: prácticamente nula; el artefacto onnx pesa 831.318 bytes, por lo que cabe sin problema en memoria de CPU.
- GPU recomendadas: no requiere GPU. El runner de la Arena usado en la búsqueda corre sobre CPU x86-64 con MuJoCo 3.10.0.
- Inferencia en GPU de consumo: no aplica por innecesaria; cualquier GPU con soporte ONNX Runtime podría ejecutarla, pero no aporta ventaja frente a CPU.
- Opciones de despliegue: ONNX Runtime para la política y el runner de la Microduck Arena sobre MuJoCo 3.10.0. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: el bucle de control opera a 50 Hz (paso de 0,02 s). No se publican cifras de latencia por inferencia ni de throughput más allá de la duración total de la carrera.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto / entrada | Rendimiento (banco) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-game-roller-remix2 (este) | 197.774 pesos (red congelada + envoltorio de tablas) | obs [1, 61] | 0,940 s | no declarada | Hugging Face, solo simulación |
| suraj-phanindra/microduck-roller-hc4-aifund | 197.774 pesos | obs [1, 61] | 0,944 s | no declarada | Hugging Face, solo simulación |
| juicenv/microduck-roller-es21 | no disponible | no disponible | no disponible | no disponible | citado como origen del modelo base |
| Otras entradas de la Microduck Arena | no disponible | no disponible | no disponible | no disponible | espacio pollen-robotics/microduck-arena |

## Limitaciones y advertencias
- Solo simulación: la política se entrenó y se juzgó únicamente en el simulador de la Arena, sobre sus cinco semillas oficiales. El autor indica explícitamente que no se debe cargar en un MicroDuck físico.
- Dependencia del contador de pasos: el contador viaja sobre el objetivo de head_roll y un robot real no realimentaría ese valor bit a bit, por lo que el mecanismo no es transferible a hardware.
- Resultados en muestra: la búsqueda CMA-ES puntuó candidatos sobre las mismas semillas oficiales, lo que limita la validez de los tiempos como medida de generalización.
- Sensibilidad al entorno: semillas próximas o una CPU distinta pueden arrojar tiempos diferentes. Los tiempos son múltiplos del paso de control (0,004 s), lo que hace que diferencias como 0,02 s correspondan a un solo paso.
- Licencia ausente: ni este repositorio ni el modelo base declaran licencia, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- Sin datos de sesgo, alucinación o cobertura idiomática: no aplica a este tipo de artefacto, pero tampoco hay información publicada al respecto.
- Rendimiento no verificado fuera del runner documentado (MuJoCo 3.10.0, x86-64), por lo que la reproducibilidad en otras versiones del simulador no está garantizada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-game-roller-remix2
- Modelo base: https://huggingface.co/suraj-phanindra/microduck-roller-hc4-aifund
- Espacio de la Microduck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Código de entrenamiento microduck_rl: https://github.com/pollen-robotics/microduck_rl
- Repositorio del robot MicroDuck: https://github.com/pollen-robotics/microduck
- Página del fabricante: https://pollen-robotics.com/microduck/
- Sitio del producto: https://microduck.homes/
- Otra entrada del mismo autor: https://huggingface.co/jrubiosainz/microduck-game-roller
- Repositorio del autor: https://github.com/jrubiosainz/microduck
- Arena de namenu: https://huggingface.co/namenu/microduck-arena
