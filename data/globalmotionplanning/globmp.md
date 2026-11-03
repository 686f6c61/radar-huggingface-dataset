# GlobalMotionPlanning/GlobMP

## Resumen

GlobMP (Global Motion Planning) es un método de planificación de movimiento en tiempo continuo con garantías de convergencia global, publicado por el grupo GlobalMotionPlanning y asociado al artículo *Continuous-Time Constrained Motion Planning with Global Convergence Guarantees* (arXiv 2610.30607). No es un modelo de lenguaje ni una red neuronal: es una librería de optimización que planifica trayectorias polinómicas a trozos bajo restricciones que deben cumplirse en **todo** instante t, no solo en puntos muestreados. Cada bloque de restricción (obstáculo esférico, separación entre robots, límite de velocidad, semiespacio, caja, superelipse, elipsoide) se representa como un polinomio en t y se impone mediante la pertenencia de sus coeficientes de Bernstein al cono de polinomios no negativos en [0, 1].

El método combina dos algoritmos de primer orden: el Algoritmo 1 (restauración) lleva cualquier trayectoria inicial a la región factible sin necesidad de una semilla factible, y el Algoritmo 2 (proyección de gradiente) aplica pasos de descenso sobre el coste restaurando la factibilidad tras cada paso, de modo que cada iterado aceptado es una trayectoria completa y factible con coste monótonamente decreciente. Un pulido SQP y un finalizador KKT llevan el resultado a un punto KKT exacto, y cuando todos los bloques son cuadráticos en la curva, un test de autovalores sobre el hessiano del lagrangiano certifica optimalidad global (un test fallido es no concluyente).

El repositorio de HuggingFace (61,9 GB) actúa como espejo de código, datos y resultados experimentales, incluidos los archivos de demostración de las baselines del Robotarium (779 MB) que solo están alojados allí. La relevancia actual reside en que ofrece garantías formales de factibilidad continua en problemas multi-robot, navegación 2D y guiado (*steering*) de políticas diestras táctil-reactivas, un ámbito donde los planificadores basados en muestreo o en difusión no ofrecen certificados de optimalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Optimizacion de trayectorias polinomicas a trozos sobre base de Bernstein; Algoritmo 1 (restauracion) + Algoritmo 2 (proyeccion de gradiente) + pulido SQP + finalizador KKT |
| Parametros totales | no disponible (no es un modelo neuronal; no tiene parametros aprendidos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el horizonte se define por el numero de segmentos M y el grado d del polinomio) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos; el repositorio contiene codigo Python y datos en `.tar.zst`) |

## Arquitectura y entrenamiento

GlobMP no entrena ningún modelo. Su núcleo es un solver de optimización no lineal estructurado. La curva de movimiento se parametriza como un spline polinómico a trozos en base de Bernstein (`globmp/spline.py`: base, derivadas, matrices de Gram, elevación de grado). Cada familia de restricción se implementa como un módulo independiente en `globmp/blocks/`: esfera, separación, obstáculo móvil, elipsoide, límite de velocidad, semiespacio, caja y superelipse. La proyección sobre el cono de polinomios no negativos se resuelve con búsqueda exacta de átomos (`globmp/cone.py`).

El programa (P) se define en `globmp/problem.py` con un *chart* de condiciones de frontera y continuidad: n coordenadas (todos los robots apilados), M segmentos de grado d, coste `int ||gamma^(k)||^2` (o coste de seguimiento mediante `set_tracking`), derivadas de frontera hasta orden `ell` fijas y continuidad `C^ell_j` en las uniones. La restauración (Algoritmo 1) y la proyección de gradiente (Algoritmo 2) se implementan en `restore.py` y `gpa.py`; el pulido SQP y el finalizador KKT en `polish.py`; la certificación de contactos, multiplicadores y optimalidad global en `certificate.py`; y la verificación exacta de factibilidad en tiempo continuo en `check.py`. Las semillas iniciales se generan a partir de waypoints (`seed.py`), y la semilla solo determina la clase de ruta, no requiere factibilidad.

El código se ha verificado contra el solver que generó cada resultado del artículo: en instancias que cubren todas las familias de bloques, ambas reglas de paso, ambos charts, los costes de seguimiento, el pulido, el certificado y el finalizador, devuelve iterados bit a bit idénticos desde el mismo punto de partida. Las dependencias son numpy, scipy, torch, cvxpy y clarabel; las baselines y figuras requieren ompl, drake y matplotlib.

## Capacidades

- Planificación de trayectorias en tiempo continuo con restricciones que se cumplen para todo t, no solo en muestras.
- Restauración de factibilidad desde cualquier semilla, sin necesidad de una trayectoria inicial factible (Algoritmo 1).
- Descenso monótono del coste con factibilidad preservada en cada iterado aceptado (Algoritmo 2).
- Pulido SQP y finalización KKT hasta un punto KKT exacto.
- Certificación de optimalidad global mediante test de autovalores cuando todos los bloques son cuadráticos en la curva.
- Verificación exacta de factibilidad continua (`check.py`).
- Soporte de familias de restricciones: esfera, separación robot-robot, obstáculo móvil, elipsoide, límite de velocidad, semiespacio, caja y superelipse.
- Costes configurables: minimización de jerk (`int ||gamma^(k)||^2`) y coste de seguimiento de una política aprendida (`set_tracking`).
- Planificación multi-robot con coordenadas apiladas y separaciones mutuas.
- Guiado (*steering*) de políticas diestras táctil-reactivas.
- No soporta tool calling, agentes, visión, audio ni generación de texto: no es un modelo generativo.

## Casos de uso

- Planificación multi-robot en el arena Robotarium: GlobMP genera planes para las 20 celdas del benchmark con separaciones robot-robot garantizadas en tiempo continuo, lo que evita colisiones entre muestras que los planificadores discretos pueden pasar por alto.
- Enjambres de robots entre esferas (2 a 200 robots): el módulo `globmp/synthetic/` reproduce el experimento de la Sección 4.1; con 200 robots en CPU completa 65 iteraciones de restauración en 70 s (el artículo reporta 71 s), lo que lo hace viable para planificación *offline* de flotas grandes.
- Navegación 2D en laberintos: `applications/maze2d/` evalúa contra el benchmark Maze2D de DiRecT con diez baselines de difusión y sus checkpoints; GlobMP iguala éxito, puntuación y violaciones, y sus planes coinciden con los datos de la figura a 1e-11.
- Guiado de políticas diestras táctil-reactivas: la Sección 4.3 usa GlobMP para proyectar las propuestas de una política aprendida sobre la variedad factible, imponiendo límites de velocidad y contacto continuo; el código del lado del robot aún no está incluido.
- Generación de trayectorias certificadas para brazos manipuladores: al poder certificar optimalidad global en problemas cuadráticos, sirve para validar planes en entornos de semiespacios y cajas donde se exige un certificado formal antes de ejecutar.
- Benchmarking de planificadores: las baselines RRT-Connect, RRT*, GCS y SDP-MP están integradas y sus resultados son bit a bit idénticos a los del artículo, lo que permite usarlo como referencia reproducible en evaluación de nuevos métodos.
- Planificación con obstáculos en movimiento: el bloque `moving` modela obstáculos cuya posición depende del tiempo, adecuado para entornos dinámicos donde la restricción debe cumplirse en cada instante de la ventana de planificación.

## Benchmarks y rendimiento

| Experimento | Resultado reportado |
|---|---|
| Sec. 4.1, 200 robots en CPU | 65 iteraciones de restauración en 70 s (artículo: 71 s) |
| Sec. 4.1, costes de ruta | Coincidencia con el artículo a 1e-8; baselines bit a bit idénticas |
| Sec. 4.2 y apéndice, suite simulada | Mismo éxito; longitud de camino con error de 3e-5 |
| Sec. 4.2, Robotarium | Planes guardados re-puntuados a los números del artículo en las 20 celdas |
| Apéndice, Maze2D | Puntuación, éxito y violaciones idénticos; planes coincidentes con la figura a 1e-11 |
| Tests unitarios | `python -m pytest globmp/tests`, unos 10 s en un núcleo de CPU |

No se han publicado en la información disponible resultados comparativos de tipo MMLU, HumanEval o GSM8K, que no aplican a este tipo de software.

## Requisitos de hardware

- No requiere GPU: el método es CPU-only con numpy, scipy, torch, cvxpy y clarabel.
- El experimento de 200 robots se ejecuta en CPU en 70 s, lo que sugiere que no necesita aceleración dedicada para las instancias del artículo.
- El repositorio ocupa 61,9 GB, de los cuales 779 MB corresponden a los cinco archivos de demostración de las baselines del Robotarium (`.tar.zst`), alojados solo en HuggingFace.
- Instalación: `pip install -e .` para el núcleo; `pip install -e .[baselines]` añade ompl, drake y matplotlib para baselines y figuras.
- No se dispone de datos de latencia o throughput más allá de los tiempos de resolución citados.

## Comparativa con modelos similares

| Método | Tipo | Garantía de factibilidad | Optimalidad | Licencia |
|---|---|---|---|---|
| GlobMP | Optimización polinómica en tiempo continuo | Continua (todo t) | Certificado global en problemas cuadráticos | no disponible |
| RRT-Connect | Muestreo | Solo en muestras | No | no disponible |
| RRT* | Muestreo asintóticamente óptimo | Solo en muestras | Asintótica | no disponible |
| GCS | Optimización convexa por grafos | Discreta por segmentos | Convexa por subproblema | no disponible |
| SDP-MP | Programación semidefinida | Continua | Relajación SDP | no disponible |
| Baselines de difusión (Maze2D) | Generativas | No garantizada | No | no disponible |

Las baselines RRT-Connect, RRT*, GCS y SDP-MP están integradas en el repositorio y se reproducen bit a bit; los datos de licencia de todas ellas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes, visión ni audio; cualquier uso en ese sentido es un error de categoría.
- La certificación de optimalidad global solo es válida cuando todos los bloques son cuadráticos en la curva; un test de autovalores fallido es no concluyente, no una prueba de no optimalidad.
- El código del lado del robot para el guiado de políticas diestras (Sección 4.3) no está incluido todavía en el repositorio.
- La licencia no está declarada en la model card ni en los metadatos de HuggingFace, por lo que no se puede confirmar el uso comercial.
- El repositorio es grande (61,9 GB) y las demostraciones del Robotarium solo están en HuggingFace, lo que complica la reproducibilidad en entornos sin acceso a la plataforma.
- El rendimiento reportado se limita a CPU y a las instancias del artículo; no hay datos publicados de escalado a otros dominios ni de latencia en tiempo real.
- No se dispone de información sobre sesgos, alucinación o limitaciones idiomáticas, que no aplican a este software.

## Enlaces

- HuggingFace: https://huggingface.co/GlobalMotionPlanning/GlobMP
- Página del proyecto: https://globalmotionplanning.github.io/
- Artículo (arXiv): https://arxiv.org/html/2610.30607
