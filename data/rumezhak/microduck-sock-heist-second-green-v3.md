# rumezhak/microduck-sock-heist-second-green-v3

## Resumen

`rumezhak/microduck-sock-heist-second-green-v3` es una política de control para el robot simulado MicroDuck, presentada como entrada en el desafío "6 m Sock Heist" de la Microduck Arena de Pollen Robotics. No es un modelo de lenguaje: es un artefacto de reinforcement learning empaquetado en ONNX que controla la locomoción de un robot cuadrúpedo en un simulador MuJoCo para recorrer una pista de obstáculos y detenerse en la segunda zona verde.

El autor, `rumezhak`, parte de la red de 197.774 pesos de `lphatnguyen/microduck-sock-heist-6m-v3` y aplica estrategias evolutivas (CMA con Adam, sigma 0.002, 48 pares antitéticos, lr 0.001) por semilla oficial, registrando después las trayectorias en bucle cerrado como filas de consulta (lookup) siguiendo el formato de `a1rb4Ck/microduck-heist`. El resultado es un híbrido: una red base como fallback y una tabla de 1.397 filas que reproduce exactamente las trayectorias especializadas en las cinco semillas oficiales.

Es relevante como ejemplo de optimización in-sample agresiva en competiciones de robótica simulada: alcanza 5.051 s de media en las cinco semillas oficiales (5/5 completadas), frente a los 7.032 s del mejor registro previo, pero no generaliza fuera de esas semillas (40 de 40 completadas en semillas nuevas, pero a 7,36 s, el rendimiento de la red base). El repositorio no declara licencia y ocupa 0,0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (197.774 pesos) más grafo de lookup de observaciones (1.397 filas) sobre ONNX |
| Parámetros totales | 197.774 pesos en la red base |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | No disponible (pesos ONNX en precisión nativa) |
| Idiomas soportados | No aplica |
| Licencia | No declarada por el autor; los modelos base tienen licencias dispares (Apache-2.0 en `a1rb4Ck/microduck-heist`, sin licencia en `lphatnguyen/microduck-sock-heist-6m-v3`) |
| Formato de pesos | ONNX |
| Librería | `microduck` |
| Pipeline | `robotics` |
| Modelos base | `lphatnguyen/microduck-sock-heist-6m-v3`, `a1rb4Ck/microduck-heist` |
| Relación con base | Finetune |
| Tamaño del repositorio | 0,0 GB |
| Entorno de ejecución | MuJoCo 3.10.0, onnxruntime 1.24.4, numpy 2.4.1 (x86-64) |

## Arquitectura y entrenamiento

La política se compone de dos capas. La primera es la red de `lphatnguyen` (197.774 pesos), que actúa como red de respaldo para cualquier observación que no esté en la tabla. La segunda es un grafo de lookup de observaciones heredado del formato de `a1rb4Ck`, con 1.397 filas que almacenan las acciones en bucle cerrado registradas para cada semilla oficial. Para una observación presente en la tabla, se devuelve la acción registrada; en caso contrario, se delega en la red base.

El entrenamiento se realizó con estrategias evolutivas sobre la red v3 completa, una ejecución por semilla oficial, con perturbaciones antitéticas, optimizador Adam, sigma 0.002, 48 pares espejados y learning rate 0.001, en rondas de 1 a 3 minutos. La función de coste penaliza los rojos atravesados (1000 unidades cada uno), el paso de cruce y los metros restantes desde el tercer verde (60 unidades por metro), de modo que detenerse 9 cm antes puntúa mejor que detenerse 90 cm antes. Una segunda pasada sobre las últimas 40 filas de cada trayectoria, con tamaños de paso 0.001 y luego 0.0003 en rondas de 90 segundos, refinó los resultados. La semilla 4 se resuelve con perturbaciones mínimas (1 o 2 de 48 a sigma entre 0.001 y 0.005); la semilla 2 requirió una segunda pasada conservando la mejor de varios miles de perturbaciones.

## Capacidades

- Control de locomoción de un robot cuadrúpedo simulado (MicroDuck) en la pista Sock Heist de la Microduck Arena.
- Ejecución de trayectorias especializadas deterministas en las cinco semillas oficiales de la Arena.
- Generalización limitada mediante la red base v3 para observaciones fuera de la tabla de lookup.
- Puntuación independiente del comando: el lookup enmascara la instrucción, por lo que la Arena lo evalúa a 0,20 m/s.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política de control, no un modelo generativo.

## Casos de uso

- Investigación en competiciones de robótica simulada: sirve como referencia de hasta dónde llega la optimización in-sample con estrategias evolutivas sobre una política pequeña, y como caso de estudio de sobreajuste a semillas concretas.
- Reproducción de resultados en la Microduck Arena: permite replicar exactamente los tiempos de las cinco semillas oficiales en un entorno x86-64 con las versiones fijadas de MuJoCo, onnxruntime y numpy.
- Benchmark de robustez de políticas: comparar el rendimiento in-sample (5,051 s de media) con el out-of-sample (7,36 s en 40 semillas nuevas) cuantifica la brecha de generalización de un enfoque de lookup.
- Desarrollo de metodología de búsqueda: el esquema de coste por rojos, paso de cruce y metros restantes es reutilizable para diseñar funciones objetivo en tareas de navegación con paradas.
- Docencia sobre reinforcement learning aplicado: ejemplo compacto (197.774 pesos, ONNX) para ilustrar estrategias evolutivas, optimización antitética y el papel del determinismo numérico.
- Análisis de estabilidad numérica en simulación: el caso de la semilla 2, que cruza a 5,390 s con la ventana cerrándose a 5,440 s, ilustra la sensibilidad de las políticas de lookup al redondeo en coma flotante entre CPUs.
- No debe usarse en un robot físico: las acciones registradas exceden lo que los servos reales admitirían.

## Benchmarks y rendimiento

Resultados sobre las cinco semillas oficiales de la Arena (tiempo en segundos, menor es mejor):

| Semilla | Mejor previo (94cd tail) | Primera entrada del autor | Este archivo (v3) |
|---|---|---|---|
| 1 | 6,975 | 4,915 | 4,885 |
| 2 | 7,390 | 5,430 | 5,390 |
| 3 | 5,560 | 4,955 | 4,935 |
| 4 | 7,280 | 5,030 | 5,000 |
| 5 | 7,955 | 5,080 | 5,045 |
| Media | 7,032 | 5,082 | 5,051 |

Evaluación fuera de muestra: 40 semillas nuevas (desde 1.000.000) con 40 de 40 completadas y una media de 7,36 s a 1,15 m/s, idéntica al rendimiento de la red base v3. Las redes especializadas, evaluadas como redes sin lookup, completaron entre 16 y 33 de 40 semillas nuevas; el resto quedaron atrapadas o cayeron.

## Requisitos de hardware

- No se dispone de estimaciones de VRAM: el modelo es una política ONNX de 197.774 pesos y se ejecuta en CPU dentro del runner de la Arena.
- Entorno de referencia del autor: x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.
- No requiere GPU; el cuello de botella es el simulador físico, no la inferencia de la red.
- Despliegue previsto: el runner v5 de la Microduck Arena (Space de Pollen Robotics) y la librería `microduck`.
- Latencia y throughput: no disponibles; los tiempos reportados son de la tarea simulada, no de inferencia.
- En macOS los resultados difieren; solo la física x86-64 del Space decide la puntuación.

## Comparativa con modelos similares

| Modelo | Enfoque | Media en semillas oficiales | Generalización | Licencia |
|---|---|---|---|---|
| `rumezhak/microduck-sock-heist-second-green-v3` | Red v3 + lookup de 1.397 filas | 5,051 s | 40/40 a 7,36 s (red base) | No declarada |
| `jrubiosainz/microduck-sock-heist-6m-94cd-tail` | Lookup (mejor previo al inicio) | 7,032 s | No disponible | Apache-2.0 |
| `lphatnguyen/microduck-sock-heist-6m-v3` | Red neuronal pura | No disponible | 7,36 s de media en 40 semillas nuevas | No declarada |
| `a1rb4Ck/microduck-heist` | Grafo de lookup de observaciones | No disponible | No disponible | Apache-2.0 |

## Limitaciones y advertencias

- Sobreajuste in-sample severo: el rendimiento de 5,051 s solo se sostiene en las cinco semillas oficiales; fuera de ellas el modelo equivale a la red base v3 (7,36 s de media).
- Las redes especializadas no generalizan por sí solas: entre 16 y 33 de 40 semillas nuevas completadas, con capturas y caídas en el resto.
- Fragilidad numérica: la semilla 2 cruza a 5,390 s con la ventana cerrándose a 5,440 s; un redondeo distinto en coma flotante de otra CPU puede romper la repetición.
- Dependencia estricta de versiones: MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 en x86-64; macOS produce resultados distintos.
- Licencia no declarada en este repositorio, y el modelo base `lphatnguyen/microduck-sock-heist-6m-v3` tampoco declara licencia, lo que genera incertidumbre sobre la reutilización.
- Uso exclusivamente en simulación: las acciones registradas están fuera de los límites de servos reales; no debe cargarse en un MicroDuck físico.
- No es un modelo de lenguaje: no tiene capacidades de generación, razonamiento, código ni multilingües, y no debe evaluarse con benchmarks como MMLU o HumanEval.
- El autor indica que un asistente de IA ayudó en parte de los experimentos, sin detallar el alcance.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rumezhak/microduck-sock-heist-second-green-v3
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Modelo base (red): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Modelo base (lookup): https://huggingface.co/a1rb4Ck/microduck-heist
- Entrada de referencia a batir: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-94cd-tail
- Organización Pollen Robotics: https://huggingface.co/pollen-robotics
