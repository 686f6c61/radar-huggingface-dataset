# JacoCronje/microduck-hill-climb-hill5

## Resumen

`JacoCronje/microduck-hill-climb-hill5` no es un modelo de lenguaje, sino una política de control motor entrenada por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. Se distribuye como un artefacto ONNX (`policy.onnx`) acompañado de un `manifest.json` conforme al esquema 2 del manifiesto de políticas del daemon `robotctl`, y se carga en una ranura de política del robot mediante un único comando. La política es "perpetua": no tiene condición de terminación propia y se ejecuta de forma continua hasta que se le indique lo contrario, con observaciones de 61 dimensiones, 14 acciones y un lazo de control a 50 Hz.

El modelo resuelve una tarea concreta de locomoción: el ascenso de una pendiente identificada internamente como `Mjlab-HillClimb1m5-MicroDuck`, entrenada en el entorno `mjlab` (base `mjlab-microduck 0.1.0`, commit `8d0dbc94c`). El interés técnico no está en el tamaño —el repositorio ocupa 0,0 GB según el Hub— sino en el patrón de empaquetado: política pequeña exportada a ONNX con el normalizador de observaciones embebido, metadatos de entrenamiento completos y un comando de reproducción que fija código, `uv.lock`, semilla y checkpoint.

Es relevante ahora porque ejemplifica el flujo de trabajo "política como artefacto versionado" en robótica open source: entrenamiento masivo en simulación (4096 entornos paralelos), exportación a un formato portable y despliegue en hardware real sin reentrenamiento. Ahora bien, el modelo tiene cero descargas y cero likes, no declara licencia y no publica métricas de evaluación, por lo que debe tratarse como un experimento reproducible más que como un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control motor, exportada a ONNX; topología interna (capas, activaciones) no disponible |
| Parametros totales | No disponible (el Hub reporta un tamaño de repositorio de 0,0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje); observación de 61 dimensiones por paso de control |
| Tipos de cuantizacion | No disponible; se distribuye en formato ONNX, precisión numérica no declarada |
| Idiomas soportados | No aplica (modelo de control motor, sin entrada ni salida de texto) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Tarea | `Mjlab-HillClimb1m5-MicroDuck` (ascenso de pendiente) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz (periodo de 20 ms) |
| Comportamiento | Política perpetua, sin terminación propia |
| Libreria / pipeline | `microduck` / `robotics` |
| Normalizacion | Normalizador de observaciones embebido en `policy.onnx`; se alimenta con observaciones en crudo |
| Autor | JacoCronje |
| Fecha de publicacion | 2026-10-25 |

## Arquitectura y entrenamiento

La información disponible no describe la topología de la red (número de capas, anchuras, función de activación ni algoritmo de optimización). Lo que sí se especifica es el contrato de interfaz: la política consume un vector de observación de 61 dimensiones y emite 14 acciones a 50 Hz, y el normalizador de observaciones está integrado dentro del propio grafo ONNX, de modo que el consumidor debe entregar observaciones sin preprocesar. El artefacto se acompaña de un manifiesto con esquema 2 que el daemon `robotctl` interpreta para cargar la política en una ranura.

El entrenamiento se realizó con `mjlab-microduck 0.1.0` en el commit `8d0dbc94c`, sobre el repositorio `microduck-challenges`, rama `hill-climb`, commit `97a013463`, semilla 1. La ejecución arrancó el 2026-10-24T20:28:08Z con 4096 entornos en paralelo, un máximo de 2250 iteraciones del agente y reanudación desde el checkpoint `model_2250.pt` de la ejecución previa `2026-10-24_16-22-42_hill3`; el checkpoint final distribuido es el 2500. El autor advierte explícitamente de que el proceso no es reproducible bit a bit entre máquinas: repetir el comando con el mismo código y la misma semilla produce una política comparable, no los mismos pesos.

## Capacidades

- Locomoción autónoma continua sobre terreno inclinado: la política genera las 14 acciones de control a 50 Hz de forma indefinida, sin condición de parada interna.
- Control reactivo de marcha ("gait") para el cuadrúpedo microduck, incluyendo el ciclo de marcha y la estabilización implícitos en las acciones emitidas.
- Despliegue directo en hardware: se carga en una ranura del daemon mediante `robotctl policy load <slot> JacoCronje/microduck-hill-climb-hill5` y se ejecuta con observaciones en crudo.
- Reproducibilidad del pipeline de entrenamiento: código, rama, commit, semilla, número de entornos y checkpoint de reanudación están documentados.
- Integración con simulación: la tarea se define en `mjlab`, lo que permite evaluar la política en el mismo entorno en que fue entrenada antes de pasarla al robot.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: su dominio es exclusivamente el control motor.
- No se documentan capacidades de generalización a otras tareas, terrenos o morfologías distintas de la tarea `Mjlab-HillClimb1m5-MicroDuck`.

## Casos de uso

- Ascenso de pendientes en el microduck real: cargar la política en una ranura con `robotctl` y dejar que opere de forma perpetua mientras el robot afronta la rampa para la que fue entrenada; es adecuada porque el normalizador va embebido y no requiere cadena de preprocesado en el host.
- Banco de pruebas de sim-to-real: ejecutar la política en `mjlab` y en el robot con las mismas 61 observaciones y comparar la divergencia de comportamiento, usando la configuración de entrenamiento documentada como referencia.
- Docencia e investigación en RL aplicado a robótica: el comando de reproducción completo (4096 entornos, semilla 1, reanudación desde `hill3`) permite replicar el experimento en un clúster propio y estudiar la varianza entre ejecuciones.
- Base para ajuste fino o curriculum: al ser una política de una tarea concreta, sirve como inicialización para variantes del reto dentro del repositorio `microduck-challenges` (rama `hill-climb`).
- Validación de infraestructura de despliegue: útil para probar el daemon, el esquema 2 de manifiestos y el mecanismo de ranuras de política antes de integrar políticas propias en producción.
- Composición con capas de alto nivel: al correr a 50 Hz con 14 acciones, un planificador de navegación externo puede enviar consignas a menor frecuencia y delegar el control de bajo nivel en esta política.
- Pruebas de seguridad y robustez: al ser una política sin terminación, permite ensayar mecanismos externos de parada, límites de par y recuperación de caídas en un banco de pruebas controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay métricas de recompensa, tasa de éxito en la tarea, distancia recorrida, robustez ante perturbaciones ni comparación con otras políticas. Los únicos datos de rendimiento disponibles son de configuración de entrenamiento, no de evaluación:

| Dato de entrenamiento | Valor |
|---|---|
| Entornos en paralelo | 4096 |
| Iteraciones máximas del agente | 2250 |
| Checkpoint distribuido | 2500 |
| Semilla | 1 |
| Ejecución previa (reanudación) | `2026-10-24_16-22-42_hill3`, checkpoint `model_2250.pt` |
| Base de entrenamiento | `mjlab-microduck 0.1.0` @ `8d0dbc94c` |
| Repositorio / rama / commit | `microduck-challenges` / `hill-climb` / `97a013463` |
| Inicio | 2026-10-24T20:28:08Z |

## Requisitos de hardware

- VRAM para inferencia: no disponible. Por el contrato de interfaz (61 entradas, 14 salidas, 50 Hz) se trata de un artefacto ONNX de muy pequeño tamaño, ejecutable en CPU con ONNX Runtime; no se publica el tamaño exacto de `policy.onnx` ni la precisión de los pesos.
- Presupuesto temporal: a 50 Hz el lazo de control dispone de 20 ms por paso, incluyendo lectura de sensores, inferencia y envío de acciones.
- GPU recomendadas: no disponibles para inferencia. Para reentrenamiento, la configuración documentada usa 4096 entornos paralelos, lo que en la práctica exige una GPU de datacenter; el modelo concreto de GPU no se especifica.
- Cabe en GPU de consumo: no confirmado. La inferencia en CPU es plausible dado el tamaño del artefacto, pero no hay medición publicada de latencia ni de throughput.
- Opciones de despliegue: ONNX Runtime para inferencia directa; el daemon `robotctl` con el manifiesto de política (esquema 2) para carga en el robot; `mjlab`/MuJoCo para evaluación en simulación. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. La única referencia contrastable es la ejecución predecesora (`hill3`) citada en el comando de entrenamiento, de la que no se publican métricas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `microduck-hill-climb-hill5` (este) | No disponible | No aplica (61-D de observación) | Sin métricas publicadas | No disponible | Hub, 0 descargas, 0 likes |
| `hill3` (ejecución previa, `2026-10-24_16-22-42`) | No disponible | No aplica | Sin métricas publicadas | No disponible | Solo como referencia interna de entrenamiento |
| Otras políticas de locomoción para microduck | No disponible | No disponible | No disponible | No disponible | No identificadas en la información proporcionada |

Cualquier comparación rigurosa exigiría evaluar ambas políticas sobre la misma tarea `Mjlab-HillClimb1m5-MicroDuck`, con las mismas semillas de evaluación y las mismas condiciones iniciales, algo que el autor no documenta.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse ningún permiso de uso comercial, redistribución ni modificación. Es un bloqueante para integrar la política en un producto.
- Ausencia total de validación externa: 0 descargas y 0 likes en el Hub, y ninguna métrica de éxito en la tarea publicada.
- Política perpetua sin terminación: no incluye condición de parada, por lo que el sistema anfitrión debe implementar la supervisión, los límites de par y la parada de emergencia.
- Especialización estrecha: entrenada para una única tarea de ascenso de pendiente; no hay evidencia de generalización a otras pendientes, superficies, cargas o morfologías.
- Brecha sim-to-real no cuantificada: no se documentan pruebas en hardware físico ni tasas de caída.
- Dependencia estricta del contrato de observación: 61 dimensiones en un orden y escalado concretos. Cambiar sensores, calibración o frecuencia de muestreo invalida la política, ya que el normalizador está embebido en el grafo.
- Reproducibilidad limitada: el propio autor advierte de que el entrenamiento no es reproducible bit a bit entre máquinas; los pesos no pueden regenerarse de forma idéntica.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual, al no ser un modelo generativo; el riesgo equivalente es una respuesta de control incorrecta ante estados fuera de distribución, sin mecanismo interno de detección.
- Idiomas y contexto: no aplica; no procesa texto y no tiene ventana de contexto.
- Fechas de publicación en 2026 y trayectoria de entrenamiento muy corta (menos de un día entre el inicio del entrenamiento y la publicación), lo que sugiere un artefacto experimental sin ciclo de validación amplio.
- El resultado de la búsqueda web realizada no contiene ninguna referencia al modelo: los enlaces devueltos corresponden a códigos promocionales de un videojuego y son irrelevantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JacoCronje/microduck-hill-climb-hill5
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/JacoCronje/microduck-challenges
- Rama de entrenamiento: `hill-climb`, commit `97a013463` (https://github.com/JacoCronje/microduck-challenges/commit/97a013463)
- Documentación del manifiesto de políticas (esquema 2): `docs/policy-manifest.md` en el repositorio del daemon de microduck
- Resultados de búsqueda web: sin coincidencias relevantes sobre el modelo; los enlaces devueltos no guardan relación con él.
