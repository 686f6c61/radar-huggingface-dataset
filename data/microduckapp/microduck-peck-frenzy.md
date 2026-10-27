# microduckapp/microduck-peck-frenzy

## Resumen

Peck Frenzy es una política de control motriz (un "move") de 11,0 segundos para el robot bípedo Microduck, publicada por el usuario microduckapp en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo generativo: el artefacto principal es `policy.onnx`, una red que recibe 61 observaciones por paso, emite 14 consignas de articulación y se ejecuta a 50 Hz, acompañada de un `manifest.json` que describe las dependencias de instalación y reproducción en el robot.

El modelo se enmarca en el ecosistema Microduck, un robot bípedo de 25 cm desarrollado por Pollen Robotics y Hugging Face, con 15 motores, cámara, sensor de profundidad, dos sensores de movimiento y un pico articulado, entrenado con aprendizaje por refuerzo en MuJoCo y presentado como plataforma abierta de experimentación en IA física. Peck Frenzy concreta ese ecosistema en un comportamiento de exhibición: el pato corre a un punto nuevo, picotea el suelo repetidamente, mira alrededor y vuelve a desplazarse.

Su relevancia es la de un ejemplo reproducible de transferencia sim2real de bajo coste: un fichero ONNX pequeño, con un protocolo de instalación declarado, que cualquier propietario del robot puede cargar. La documentación publicada es mínima (sin licencia, sin idiomas, sin métricas de rendimiento y sin detalle de arquitectura), lo que limita su evaluación técnica rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control exportada a ONNX; topología de red no documentada (presumiblemente entrenada por refuerzo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 valores por paso de control |
| Tipos de cuantizacion | no disponible (se distribuye un único `policy.onnx`, sin variantes cuantizadas declaradas) |
| Idiomas soportados | no disponible / no aplica (no procesa lenguaje) |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` + `media/preview.mp4` |

Otros datos verificables del repositorio: pipeline declarado `robotics`, etiquetas `onnx`, `robotics`, `microduck-move`, `region:us`, 0 descargas, 0 likes, tamaño de repositorio redondeado a 0.0 GB, creado el 2026-10-27 y actualizado el mismo día.

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura interna de la red: solo se especifica el contrato de entrada/salida (61 observaciones de entrada, 14 objetivos articulares de salida) y la frecuencia de control de 50 Hz. A ese ritmo, la secuencia de 11,0 segundos equivale a unos 550 pasos de inferencia encadenados. No se indica el número de parámetros, el número de capas, el algoritmo de entrenamiento (aunque el contexto del proyecto Microduck apunta a aprendizaje por refuerzo en MuJoCo), el volumen de datos ni si hubo ajuste fino con demostraciones.

Tampoco se documenta la composición del espacio de observación (propriocepción, IMU, sensores de pata, altura, fase de marcha, etc.), lo que impide reproducir el entrenamiento o auditar qué información consume la política. El `manifest.json` es la única fuente declarada sobre requisitos de instalación y ejecución en el robot. Un detalle relevante: el robot Microduck tiene 15 motores según las fuentes públicas, mientras que la política emite 14 consignas articulares; el repositorio no explica esa diferencia (posible articulación no accionada, salida derivada o pico controlado fuera del tensor).

## Capacidades

- Ejecución de una secuencia motriz pregrabada de 11,0 segundos con locomoción y picoteo repetido del suelo.
- Generación de consignas de articulación a 50 Hz a partir de 61 observaciones por paso (control reactivo cerrado sobre el estado del robot).
- Comportamiento compuesto: desplazamiento a un punto, picoteo múltiple, giro de cabeza/cuerpo para otear el entorno y nuevo desplazamiento.
- Integración con el pipeline de instalación de la app MicroDuck mediante `manifest.json`.
- Inferencia en formato ONNX, portable entre runtimes (ONNX Runtime, etc.) sin dependencias de framework de entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio: no es un modelo fundacional y no expone interfaz de lenguaje.
- No se declaran capacidades multilingües ni de percepción, pese a que el robot incorpora cámara y sensor de profundidad; la política no documenta uso de esas entradas.

## Casos de uso

- Demostración en feria o evento: cargar el move en el robot y reproducir una rutina de 11 s que resulta expresiva y reconocible para el público, sin necesidad de teleoperación.
- Prueba de humo del pipeline de instalación: usar `manifest.json` y `policy.onnx` como caso mínimo para verificar que la app MicroDuck instala, resuelve dependencias y ejecuta un move de principio a fin.
- Validación de runtime ONNX en hardware embebido: medir si el compute del robot sostiene 50 Hz (20 ms de presupuesto por paso) con una política de entrada 61 y salida 14, antes de portar moves más exigentes.
- Material de referencia para aprendizaje por imitación: grabar la ejecución como demostración base para entrenar políticas propias de picoteo o de exploración del entorno.
- Pruebas de regresión de estabilidad: secuencia corta y repetible para comparar el comportamiento del robot tras cambios de firmware, calibración de motores o sustitución de piezas.
- Contenido audiovisual y documentación: el `media/preview.mp4` incluido sirve como asset directo para notas de versión, catálogo de moves o tutoriales del ecosistema Microduck.
- Comparación de repertorio: junto a otros moves del mismo autor (16 modelos publicados en su perfil, como `microduck-midnight-snack`), permite construir un banco de comportamientos encadenables para sesiones largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de éxito de la tarea, tasa de caídas, error de seguimiento articular, latencia medida ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión al no declararse el número de parámetros; por el contrato de E/S (61 entradas, 14 salidas) y el tamaño de repositorio redondeado a 0.0 GB, se trata de una red de muy pocos miles de parámetros que no requiere GPU dedicada.
- GPU recomendadas: ninguna imprescindible; cualquier CPU del propio robot o de un equipo anfitrión basta para un forward pass de este tamaño. No se han publicado perfiles de latencia por GPU (A100, H100, RTX 4090 u otras).
- Cabe en GPU de consumo: sí, con enorme margen; también en CPU embebida y en placas tipo Raspberry Pi, aunque el dato no está verificado por el autor.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), ejecución en el propio robot a través de la app MicroDuck, y simulación en MuJoCo para validar el move antes de pasarlo al hardware.
- Restricción temporal real: 50 Hz implican 20 ms por paso de control, incluyendo lectura de sensores, inferencia y envío de consignas a los 14 actuadores; el autor no publica el margen medido.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas / salidas | Frecuencia | Duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-peck-frenzy | Move para robot Microduck (ONNX) | 61 / 14 | 50 Hz | 11,0 s | no disponible | Hugging Face, 0 descargas |
| microduck-midnight-snack | Move para robot Microduck (misma familia, mismo autor) | no disponible | no disponible | no disponible | no disponible | Hugging Face (perfil microduckapp) |
| Otras moves de microduckapp (16 modelos publicados) | Moves para robot Microduck | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de métricas públicas (éxito de tarea, estabilidad, sim2real) para ninguna de las alternativas, por lo que la comparación cuantitativa no es posible; la única comparación fiable es de contrato de interfaz y de duración declarada.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial, modificación ni redistribución; en producción hay que tratar el artefacto como no licenciado hasta contactar con el autor.
- Documentación mínima: sin arquitectura, sin número de parámetros, sin espacio de observación detallado y sin procedimiento de entrenamiento; la auditabilidad es prácticamente nula.
- Desajuste potencial de interfaz: 14 salidas articulares frente a los 15 motores del robot Microduck; verificar en el `manifest.json` antes de desplegar.
- Secuencia de duración fija (11,0 s): no es un controlador de propósito general ni acepta condicionamiento por objetivo, texto o instrucción.
- Riesgo de sobreajuste al hardware concreto: al no publicarse variantes ni validación cruzada entre unidades, el comportamiento puede degradarse con desgaste de motores, cambios de batería o superficies distintas.
- Sin gestión de fallos declarada: no se documenta qué ocurre ante caída, obstáculo, pérdida de un sensor o saturación de par.
- Sin capacidades de lenguaje, razonamiento, código o visión; no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- Cero tracción comunitaria (0 descargas, 0 likes) y repositorio recién creado: no hay evidencia externa de funcionamiento ni informes de terceros.
- Alucinación y sesgos: no aplican en el sentido de modelos generativos, pero sí existe el riesgo de comportamientos no previstos en el mundo real (picoteo repetido contra objetos, colisiones) derivados de la brecha sim2real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-peck-frenzy
- Perfil del autor: https://huggingface.co/microduckapp
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Cobertura MarkTechPost: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura The AI Insider: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
- Cobertura CNX Software: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
