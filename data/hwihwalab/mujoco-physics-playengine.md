# hwihwalab/mujoco-physics-playengine

## Resumen

Jelly Bean PlayEngine es un conjunto de recursos de simulación física y un entorno interactivo de robótica construido sobre MuJoCo v3.3.0, el motor de física desarrollado por Google DeepMind. Lo publica HWIHWA LAB bajo licencia Apache 2.0 y se distribuye como un repositorio de Hugging Face con la etiqueta de pipeline `robotics`. No es un modelo de lenguaje ni una red neuronal entrenada: es una suite de diez "ladrillos" físicos procedurales, cada uno definido mediante plantillas MJCF (XML), junto con controladores robóticos autónomos implementados de forma analítica (LQR, Pure Pursuit, cinemática inversa de tres etapas y balística).

El paquete resuelve un problema concreto de ingeniería: proporcionar entornos de simulación ligeros, reproducibles y ejecutables en el navegador para experimentar con dinámica multicuerpo, control de sistemas y cinemática robótica sin necesidad de infraestructura pesada. Cada escenario se ejecuta con un solver numérico PGS a 500 Hz y un paso de integración de 0,002 s, lo que permite observar comportamientos de contacto, fricción de Coulomb y transmisión de momento con suficiente fidelidad para docencia y prototipado.

Su relevancia actual radica en la accesibilidad: los diez escenarios incluyen desde un péndulo invertido sobre carro (CartPole) con controlador LQR hasta una pinza robótica de 2 grados de libertad con cinemática inversa, pasando por colisiones elásticas multicuerpo y colapso estructural. Todo el contenido cabe en un repositorio de 0,0 GB, se carga con `mujoco.MjModel.from_xml_string()` y se puede visualizar con `mujoco.viewer.launch_passive()`, lo que lo convierte en material didáctico y de referencia para quienes trabajan en IA física y robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo neuronal); suite de entornos MuJoCo con plantillas MJCF/XML y controladores analíticos |
| Parametros totales | No disponible (no es un modelo con pesos entrenados) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Inglés (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible; se distribuyen plantillas MJCF en XML y código Python |
| Motor de fisica | MuJoCo v3.3.0, solver PGS a 500 Hz, dt = 0,002 s |
| Libreria | `mujoco` (Python) |
| Tamano del repositorio | 0,0 GB |
| Pipeline declarado | robotics |
| Fecha de creacion | 2026-11-04 |
| Ultima actualizacion | 2026-11-04 |

## Arquitectura y entrenamiento

No existe un proceso de entrenamiento en el sentido habitual de aprendizaje automático. El repositorio contiene diez entornos físicos independientes definidos como plantillas XML compatibles con el formato MJCF de MuJoCo, más los controladores que los gobiernan. La física se resuelve con el solver PGS (Projected Gauss-Seidel) a 500 Hz con un paso de 0,002 s, lo que proporciona estabilidad en contactos múltiples y en cadenas cinemáticas con articulaciones de revolución.

Los controladores incluidos son deterministas y analíticos: un balanceador LQR para el péndulo invertido sobre carro (con ganancias explícitas en el ejemplo de código, del tipo `ctrl = 8.0·θ + 1.6·ω + 0.3·x + 0.6·v`), navegación por waypoints mediante Pure Pursuit, una cinemática inversa de tres etapas para el brazo de 2 grados de libertad de la máquina de pinza, y cálculo balístico para el cañón del escenario de demolición. Los escenarios cubren dinámica multicuerpo (colisiones elásticas, reacción en cadena de dominós, colapso estructural), tribología con fricción de Coulomb en plano inclinado, péndulo doble con dinámica caótica y un chasis de cuatro ruedas con dinámica de tracción.

Como innovación destacable, la suite incorpora generación procedural de los escenarios, síntesis de audio mediante Web Audio con 0 KB de assets de audio, y un modo de juego web ejecutable en Hugging Face Spaces, además de una aplicación de escritorio nativa. El escenario 07 (Pudding Cart Balancer) se marca como insignia e incluye una fase 2 con perturbaciones ("tremors") tras 10 segundos, pensada para evaluar la robustez del controlador.

## Capacidades

- Simulación de dinámica multicuerpo con contactos, colisiones elásticas y fricción de Coulomb.
- Control de péndulo invertido sobre carro (CartPole) mediante LQR y control PD, con modo de piloto automático.
- Navegación por waypoints con Pure Pursuit para chasis de cuatro ruedas.
- Cinemática inversa de tres etapas para un manipulador robótico de 2 grados de libertad con succión magnética.
- Cálculo balístico con potencia ajustable para demolición de estructuras.
- Dinámica de péndulo doble con comportamiento caótico y contador de combos acrobáticos.
- Reacción en cadena cinética y transferencia de momento (dominós).
- Tribología en plano inclinado con fricción de Coulomb (carrera por rampa).
- Carga y ejecución local de cada escenario con una sola llamada a `mujoco.MjModel.from_xml_string()`.
- Visualización interactiva con `mujoco.viewer.launch_passive()` y control por teclado.
- Ejecución en navegador mediante Hugging Face Spaces y como aplicación de escritorio nativa.
- Documentación bilingüe inglés-coreano.
- No incluye tool calling, function calling, razonamiento en lenguaje natural ni capacidades de visión por aprendizaje profundo.

## Casos de uso

- Docencia de teoría de control: el escenario CartPole con controlador LQR permite a los estudiantes modificar las ganancias y observar en tiempo real la estabilidad del péndulo invertido, incluida la fase de perturbaciones a los 10 segundos para evaluar robustez.
- Prototipado de algoritmos de RL: los diez entornos sirven como bancos de pruebas de bajo coste para políticas de control; el bucle `mj_step` con acceso directo a `qpos` y `qvel` facilita la integración con librerías de aprendizaje por refuerzo.
- Validación de cinemática inversa: el brazo de 2 grados de libertad de la máquina de pinza permite comprobar soluciones de IK de tres etapas y depurar el posicionamiento del efector final antes de trasladar el código a un robot real.
- Enseñanza de dinámica multicuerpo: los escenarios de dominós, colapso estructural y colisiones elásticas ilustran transferencia de momento, reacción en cadena y resolución de contactos con un solver PGS a 500 Hz.
- Demostraciones interactivas y divulgación: el modo web en Hugging Face Spaces y la aplicación de escritorio permiten mostrar conceptos de física y robótica a audiencias no técnicas sin instalar dependencias.
- Generación de gemelos digitales ligeros: las plantillas MJCF sirven como punto de partida para modelar digitalmente mecanismos sencillos (carros, brazos, rampas) y simular su comportamiento antes de construirlos.
- Pruebas de navegación de vehículos: el chasis de cuatro ruedas con Pure Pursuit permite experimentar con seguimiento de trayectorias y dinámica de tracción en un entorno controlado.
- Material de referencia para desarrolladores de simuladores: el código de los controladores analíticos y las plantillas XML pueden reutilizarse como base de proyectos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: la simulación MuJoCo es de CPU y los diez escenarios son de complejidad baja (decenas de cuerpos como máximo).
- Cabe en cualquier equipo de consumo; no se especifican requisitos mínimos de VRAM porque no hay inferencia de redes neuronales.
- CPU recomendada: cualquier procesador moderno de escritorio o portátil; el solver PGS a 500 Hz con dt = 0,002 s es ligero para estos modelos.
- Despliegue local: `pip install mujoco` y ejecución con `mujoco.viewer.launch_passive()`.
- Despliegue web: Hugging Face Spaces (escenario en vivo accesible desde el navegador).
- Aplicación de escritorio nativa incluida en el repositorio, sin barras de navegador.
- Latencia y throughput: no disponibles de forma explícita; el paso de simulación está fijado a 500 Hz por diseño.

## Comparativa con modelos similares

| Criterio | Jelly Bean PlayEngine | MuJoCo Menagerie | Gymnasium (MuJoCo environments) |
|---|---|---|---|
| Tipo | Suite de 10 escenarios didácticos con controladores | Colección de modelos de robots de referencia | Entornos de RL estandarizados |
| Parametros | No aplica | No aplica | No aplica |
| Contexto | No aplica | No aplica | No aplica |
| Controladores incluidos | LQR, Pure Pursuit, IK, balística | No (solo modelos) | Políticas de referencia en algunos entornos |
| Licencia | Apache 2.0 | No disponible en la informacion | No disponible en la informacion |
| Ejecución en navegador | Sí (Hugging Face Spaces) | No disponible en la informacion | No disponible en la informacion |
| Enfoque | Docencia y demostración interactiva | Reutilización de modelos de robots | Entrenamiento de agentes RL |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni una red neuronal: no genera texto, no razona en lenguaje natural y no procesa imágenes ni audio.
- Los controladores son analíticos y específicos de cada escenario; no generalizan a otras plantas ni a perturbaciones no modeladas.
- La fidelidad física está acotada por el solver PGS y el paso de 0,002 s; fenómenos de contacto complejo pueden requerir ajuste de parámetros del solver.
- Los escenarios son de complejidad baja (decenas de cuerpos); no están pensados para simulación a gran escala ni para gemelos digitales de alta fidelidad.
- Documentación únicamente en inglés y coreano; no hay versión en castellano.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria ni reportes de errores.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar el archivo LICENSE del repositorio.
- El escenario insignia incluye perturbaciones tras 10 segundos que pueden desestabilizar controladores mal sintonizados; es un comportamiento intencionado, no un fallo.
- No se han publicado benchmarks ni métricas de rendimiento que permitan comparar la fidelidad de la simulación con otras suites.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hwihwalab/mujoco-physics-playengine
- Demo en vivo (Hugging Face Spaces): https://huggingface.co/spaces/hwihwalab/mujoco-physics-playengine
- Organización HWIHWA LAB: https://huggingface.co/hwihwalab
- MuJoCo (Google DeepMind): https://mujoco.org
- Documentación en coreano: README_KR.md (dentro del repositorio)
- Licencia Apache 2.0: LICENSE (dentro del repositorio)
