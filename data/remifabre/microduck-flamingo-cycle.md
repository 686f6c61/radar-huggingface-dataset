# RemiFabre/microduck-flamingo-cycle

## Resumen

`microduck-flamingo-cycle` es una política de control robótico entrenada para el robot cuadrúpedo MicroDuck de Pollen Robotics. No es un modelo de lenguaje: es una red neuronal que mapea observaciones de 61 dimensiones (estado de sensores y comandos) a 14 acciones de control articular a 50 Hz, empaquetada en formato ONNX para su despliegue directo en el robot o en simulación MuJoCo. La política implementa una habilidad concreta y acotada: mantener el equilibrio sobre una pata (postura tipo flamenco) a la orden, en cualquiera de los dos lados, y volver a la postura de dos patas.

El modelo se distribuye bajo licencia Apache 2.0 y fue entrenado con el framework `mjlab` sobre el repositorio `pollen-robotics/microduck_rl` (rama `flamingo`, commit `0bf9897`, aún no fusionada en `main`). La relevancia de esta publicación es doble: por un lado, demuestra el flujo completo de entrenamiento y exportación de políticas de locomoción para hardware de bajo coste; por otro, establece un formato de intercambio de políticas (`sharing-policies.md`) que facilita la reproducibilidad y la composición de habilidades en robots cuadrúpedos pequeños.

La información disponible es exclusivamente la model card del autor. No se publican datos de arquitectura interna de la red (número de capas, parámetros), composición del dataset de entrenamiento ni resultados de benchmarks estándar. Las cifras de rendimiento que aparecen en la ficha (velocidad de empuje tolerada, tiempos de transición) provienen de las pruebas en simulación declaradas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (no se especifica la topología interna); entrenada con `mjlab` sobre `microduck_rl` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (exportación ONNX en precisión original) |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`), con `manifest.json` de metadatos |
| Entrada / salida | `obs[1,61] f32 → actions[1,14] f32`, normalizador incluido en el grafo |
| Frecuencia de control | 50 Hz |
| Tamaño del repositorio | 0.0 GB (pesos ligeros, aptos para hardware embebido) |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La política sigue el paradigma de *reinforcement learning* para control continuo: una red que recibe un vector de observación de 61 valores en coma flotante (estado propioceptivo del robot más el bloque de comando de 13 dimensiones) y emite 14 acciones articulares normalizadas respecto a la postura HOME (factor ×1.0). El entrenamiento se realizó con `mjlab` en el entorno `Mjlab-FlamingoCycleHard-Flat-MicroDuck`, correspondiente a la ejecución `pollen-robotics/flamingo-cycle-r2-hard-20260829-0245` del repositorio `pollen-robotics/microduck_rl`. La variante "Hard" sugiere un currículo de entrenamiento con perturbaciones y condiciones de dificultad incrementadas, aunque la model card no detalla la composición del dataset ni el número de pasos de simulación.

El bloque de comando (`twist`) tiene 13 dimensiones, de las cuales solo se utilizan tres: `twist[0]` como bandera binaria (0 = dos patas, 1 = una pata), `twist[1]` como selector de lado (+1 = pata derecha abajo / pierna izquierda levantada; −1 = lo contrario) y `twist[2]` sin uso. La política es de tipo "perpetuo": mientras la bandera permanezca a 1, el robot vuelve a levantar la pata tras un apoyo de emergencia, sin señal explícita de abandono. La exportación se realizó con `scripts/export.py`, que integra el normalizador de observaciones en el grafo ONNX para simplificar el despliegue.

## Capacidades

- Equilibrio sobre una pata (postura de flamenco) en ambos lados con la misma red neuronal, con elevación de la pata libre de aproximadamente 9 cm y mantenimiento durante 10 segundos o más.
- Transición bidireccional entre postura de dos patas (HOME) y una pata en aproximadamente 1,5 segundos por sentido, interrumpible en cualquier momento.
- Selección de lado en tiempo de ejecución mediante el canal de comando, siempre que se elija antes de activar la bandera.
- Absorción de empujes de hasta 0,15 m/s desde cualquier dirección: los empujes hacia el lado de la pata levantada se gestionan con un breve apoyo; los dirigidos hacia el lado de apoyo se resuelven con un paso de reposición.
- Control por teclado en simulación (teclas F, C, P, Q) y control programático mediante `control.py` con líneas de tiempo guionizadas.
- Despliegue directo en el robot mediante `robotd` sin modificar el código del demonio, solo la configuración `/etc/robot/robotd.toml`.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades lingüísticas: es una política motora especializada.

## Casos de uso

- Demostración de equilibrio dinámico en robótica de bajo coste: la política permite exhibir una habilidad compleja (equilibrio monopodal) en el MicroDuck sin desarrollo adicional de control, útil en demostraciones, ferias y material divulgativo.
- Investigación en aprendizaje por refuerzo sim-a-real: sirve como referencia reproducible de un pipeline completo (entrenamiento en `mjlab`, exportación ONNX, validación en MuJoCo y despliegue en hardware) para comparar metodologías de transferencia.
- Pruebas de robustez frente a perturbaciones: con la tecla P o mediante empujes programáticos se puede evaluar la capacidad de recuperación del robot ante fuerzas de hasta 0,15 m/s, un escenario habitual en validación de controladores.
- Composición de habilidades: al integrarse en el sistema de políticas de `microduck_rl`, esta política puede encadenarse con otras (marcha, posturas) mediante líneas de tiempo guionizadas, por ejemplo para coreografías o secuencias de inspección.
- Docencia en robótica y control: el repositorio incluye instrucciones para ejecutar la política en un portátil con MuJoCo sin necesidad de robot físico, lo que facilita prácticas de laboratorio sobre políticas neuronales y observación de comandos.
- Validación de infraestructura de despliegue: el flujo con `robotd`, reenvío de socket por SSH y `control.py` permite probar la integración de políticas ONNX en el demonio del robot antes de comprometer cambios permanentes.
- Referencia para el formato de intercambio de políticas: el documento `sharing-policies.md` del repositorio define el contrato de observación/acción y los metadatos (`manifest.json`), útil para equipos que quieran publicar sus propias políticas de forma interoperable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas cualitativas y de robustez obtenidas en simulación:

| Prueba (simulación) | Resultado declarado |
|---|---|
| Mantenimiento de la postura monopodal | 10 s o más |
| Tiempo de transición (subida o bajada) | ~1,5 s por sentido |
| Empuje tolerado desde cualquier dirección | ≤ 0,15 m/s |
| Empuje hacia atrás | falla a partir de ≥ 0,18 m/s (2 de 24 ensayos aleatorios) |
| Elevación de la pata libre | ~9 cm |

No se han ejecutado pruebas en hardware real según declara el autor ("sim only, never run on hardware").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la política es un único archivo ONNX, por lo que la huella de memoria es mínima (inferior a cientos de MB en cualquier caso).
- GPU recomendadas: no se especifican; por el tamaño del artefacto, la inferencia puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU de consumo e incluso en el propio robot: el despliegue documentado se realiza en el ordenador de a bordo del MicroDuck (usuario `radxa`, típicamente una SBC ARM), lo que confirma que no requiere acelerador dedicado.
- Opciones de despliegue: ONNX Runtime (formato nativo `policy.onnx`), simulación MuJoCo mediante `scripts/infer_policy.py` del repositorio `microduck_rl` (rama `flamingo`), y el demonio `robotd` en el robot físico.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms); no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RemiFabre/microduck-flamingo-cycle` | Política RL para MicroDuck (equilibrio monopodal) | obs[61] → act[14] | 50 Hz | Apache 2.0 | Hugging Face, ONNX |
| Políticas de marcha del repositorio `pollen-robotics/microduck_rl` | Políticas RL para MicroDuck (locomoción) | Contrato del formato de intercambio de políticas | no disponible | según repositorio | GitHub, rama principal |
| Políticas de control para otros cuadrúpedos pequeños (p. ej. Unitree Go1/A1) | Políticas RL específicas de plataforma | Depende de la plataforma | Típicamente 50 Hz | Variable | Repositorios académicos y de fabricante |

No se dispone de datos de benchmarks comunes que permitan una comparación cuantitativa con alternativas. La comparación relevante es funcional: esta política cubre una habilidad específica (equilibrio monopodal) dentro del ecosistema MicroDuck, mientras que las políticas de locomoción del mismo repositorio cubren el desplazamiento; ambas comparten el contrato de observación/acción definido en `sharing-policies.md`.

## Limitaciones y advertencias

- Solo validada en simulación: el autor declara explícitamente que nunca se ha ejecutado en hardware real, por lo que el rendimiento sim-a-real es desconocido.
- Fragilidad ante empujes hacia atrás: a partir de 0,18 m/s la política falla en 2 de 24 ensayos aleatorios; no debe asumirse robustez direccional uniforme.
- Sin señal de abandono: mientras la bandera `flag` permanezca a 1, el robot vuelve a levantar la pata tras un apoyo de emergencia; si se desea que permanezca en dos patas, es responsabilidad del operador bajar la bandera.
- Dependencia de una rama no fusionada: el código necesario para ejecutarla vive en la rama `flamingo` del repositorio `microduck_rl` (commit `0bf9897`), no en `main`; la API puede cambiar sin aviso.
- Requisito de configuración del robot: el despliegue exige editar `/etc/robot/robotd.toml` y reiniciar el demonio, lo que implica intervención manual y riesgo de configuración incorrecta.
- Dependencia de plataforma en simulación: en macOS es necesario el lanzador `mjpython` y un enlace simbólico a `libpython3.12.dylib`; en Linux se usa `uv run` directamente.
- Sin datos de sesgos, alucinación o multilingüismo: no aplican en el sentido habitual, pero tampoco se documentan sesgos de comportamiento (por ejemplo, asimetrías entre lados) más allá de la simetría declarada.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no obstante, la ausencia de validación en hardware desaconseja su uso en producción sin pruebas propias.
- El repositorio tiene un tamaño declarado de 0.0 GB, lo que sugiere que los pesos son muy ligeros; conviene verificar la integridad de `policy.onnx` y `manifest.json` antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RemiFabre/microduck-flamingo-cycle
- Repositorio de entrenamiento (rama `flamingo`): https://github.com/pollen-robotics/microduck_rl/tree/flamingo
- Commit de procedencia: https://github.com/pollen-robotics/microduck_rl/commit/0bf9897
- Documentación del formato de intercambio de políticas: https://github.com/pollen-robotics/microduck_rl/blob/main/docs/sharing-policies.md
- Vídeo de demostración en simulación: https://huggingface.co/RemiFabre/microduck-flamingo-cycle/resolve/main/media/preview.mp4
- Metadatos legibles por máquina: https://huggingface.co/RemiFabre/microduck-flamingo-cycle/resolve/main/manifest.json
- Script de control remoto: https://huggingface.co/RemiFabre/microduck-flamingo-cycle/resolve/main/control.py
