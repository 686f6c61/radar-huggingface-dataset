# microduckapp/microduck-disco-inferno

## Resumen

Disco Inferno es una política de control motriz para el robot bípedo Microduck, publicada en Hugging Face por el usuario microduckapp bajo el pipeline `robotics`. No es un modelo de lenguaje: es un fichero `policy.onnx` que implementa una coreografía de 10,3 segundos ("twirls left bobbing to the beat, points up, points down, twirls right — and strikes a pose"), pensada para reproducirse desde la app MicroDuck. La interfaz es explícita: 61 observaciones de entrada y 14 consignas articulares de salida, ejecutadas a 50 Hz.

El modelo se distribuye junto a un `manifest.json` que describe qué necesita el pato para instalar y ejecutar el movimiento, y un vídeo de previsualización en `media/preview.mp4`. El repositorio tiene un tamaño de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y no incluye model card técnica más allá de la descripción del movimiento.

Su relevancia es contextual: el Microduck es el robot bípedo de 25 cm y 399 USD presentado por Hugging Face y Pollen Robotics en agosto de 2026, entrenado con aprendizaje por refuerzo en MuJoCo y con siete comportamientos preentrenados. Disco Inferno es una de las políticas de movimiento que alimentan ese ecosistema, y sirve tanto como contenido de demostración como material de referencia para quien quiera inspeccionar el formato de observaciones y acciones que espera el SDK. La licencia del fichero no está declarada, lo que limita cualquier reutilización comercial sin consultar al autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control exportada a ONNX; topología interna de la red no documentada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; 61 observaciones por paso de control a 50 Hz |
| Tipos de cuantización | no disponible; solo se publica `policy.onnx` sin variantes cuantizadas |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` de instalación |

Otros datos documentados: duración del movimiento 10,3 s, 14 salidas de articulación, frecuencia de control 50 Hz, fichero de previsualización `media/preview.mp4`, repositorio de 0,0 GB, creado y actualizado el 27 de octubre de 2026.

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red. Se sabe que el artefacto es una política neuronal serializada en ONNX que mapea un vector de 61 observaciones a 14 consignas de posición articular, ejecutada en bucle cerrado a 50 Hz. Por la propia naturaleza del robot, descrito por sus fabricantes como un bípedo entrenado con aprendizaje por refuerzo en MuJoCo, es razonable situar esta política dentro del mismo paradigma de RL sim-a-real, pero el autor no publica ni la topología (número de capas, anchura, tipo de normalización) ni el algoritmo de entrenamiento empleado.

Tampoco se documentan el número de tokens equivalentes, la composición del dataset, el reparto entre simulación y hardware real, ni si hubo ajuste fino adicional sobre un checkpoint base. No hay información sobre fases de RLHF o DPO, que en este dominio no aplican, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. El único contrato técnico verificable es la interfaz de entrada/salida y la frecuencia de control, más el `manifest.json` que define la instalación en el robot.

## Capacidades

- Ejecución de una coreografía de cuerpo completo de 10,3 s: giro a la izquierda con balanceo al ritmo, señalar arriba, señalar abajo, giro a la derecha y pose final.
- Control de 14 consignas articulares a partir de 61 observaciones, a 50 Hz, en bucle cerrado.
- Integración con la app MicroDuck mediante `manifest.json` para instalación y reproducción del movimiento.
- Compatibilidad con el stack de simulación MuJoCo del Microduck, lo que permite reproducir el movimiento sin hardware.
- Inferencia portable vía ONNX Runtime, sin dependencias de frameworks propietarios.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, visión ni audio propias; el robot tiene cámara y sensor de profundidad, pero esta política no documenta consumo de entradas visuales entre sus 61 observaciones.

## Casos de uso

- Demostración de producto en el propio robot: cargar `policy.onnx` y el `manifest.json` desde la app MicroDuck para ejecutar la coreografía ante público, aprovechando que el movimiento está empaquetado y listo para instalar sin entrenamiento adicional.
- Reproducción en simulación antes de tocar hardware: ejecutar la política en MuJoCo con el modelo del Microduck para verificar el comportamiento de las 14 articulaciones a 50 Hz antes de un evento o de una demo en directo.
- Verificación de integración del SDK: usar la política como test de humo del pipeline de observaciones (61 entradas) y acciones (14 salidas), comprobando que el orden y la normalización de las observaciones coinciden con lo que espera el runtime.
- Referencia para creación de nuevas coreografías: servir de punto de partida para quien entrene variantes del movimiento con el stack de RL Apache-2.0 publicado en GitHub, modificando duración, tempo o secuencia de gestos.
- Docencia en robótica y control: ejemplo compacto y ejecutable de política RL de cuerpo completo, útil en cursos para ilustrar el paso de simulación a robot y el formato ONNX como contrato de despliegue.
- Evaluación comparativa de comportamientos: al convivir con los siete comportamientos preentrenados del Microduck, permite contrastar estabilidad, consumo de par y naturalidad del movimiento entre políticas sobre la misma plataforma.
- Material de captura para animación o divulgación: el vídeo de previsualización y la secuencia de pose final se pueden reutilizar en contenido explicativo sobre robótica de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta parámetros de ejecución (10,3 s de duración, 50 Hz, 61 entradas y 14 salidas) y no incluye métricas de seguimiento de trayectoria, error de posición, consumo energético, tasa de caídas ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible. No se publica tamaño del grafo ni número de parámetros, por lo que no se puede calcular una estimación fiable.
- GPU recomendadas: no disponible. Al ejecutarse en el propio robot, el cómputo de referencia es el hardware embebido del Microduck, cuyas especificaciones no se detallan en la información disponible.
- Cabe en GPU de consumo: previsiblemente sí, dado el reducido espacio de entrada y salida (61 a 14), pero el dato no está confirmado por el autor; cualquier afirmación concreta sería una inferencia.
- Opciones de despliegue: ONNX Runtime para la política, simulación MuJoCo con el modelo del Microduck, y la app/SDK MicroDuck para instalación y reproducción. El stack de SDK, simulación y entrenamiento por refuerzo se distribuye con licencia Apache-2.0 en GitHub, según la información de prensa.
- Latencia y throughput: el ciclo de control a 50 Hz impone un presupuesto máximo de 20 ms por inferencia, incluyendo lectura de sensores y comunicación con los actuadores. No se publican latencias medidas ni throughput en ningún acelerador.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas/salidas | Frecuencia | Licencia | Contexto de uso |
|---|---|---|---|---|---|
| microduckapp/microduck-disco-inferno | Política de control ONNX | 61 / 14 | 50 Hz | no disponible | Movimiento concreto de 10,3 s para Microduck |
| Otros movimientos de microduck-move | Políticas de control ONNX | no disponible | no disponible | no disponible | Misma plataforma y mismo pipeline |
| Políticas de los siete comportamientos preentrenados del Microduck | Políticas RL | no disponible | no disponible | no disponible | Comportamientos de serie del robot |
| Modelos VLA de propósito general (tipo OpenVLA o π0) | Visión-lenguaje-acción | Entradas visuales y textuales | no disponible | no disponible | No son comparables: otro dominio y otro contrato de E/S |

La comparación cuantitativa no es posible: ni este repositorio ni las alternativas identificadas publican parámetros, benchmarks o condiciones de entrenamiento en la información disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial, redistribución ni modificación del fichero `policy.onnx` sin autorización expresa del autor. La Apache-2.0 del SDK y del stack de RL en GitHub no cubre automáticamente este peso.
- Alcance muy restringido: es una política de una única secuencia de 10,3 s, no un controlador general. No se le puede pedir generalización a comandos, terrenos o tareas distintas.
- Sin model card técnica: no hay información sobre arquitectura, datos de entrenamiento, semilla, número de parámetros ni procedimiento de validación, lo que impide auditar el comportamiento.
- Desajuste no explicado entre 15 motores del robot y 14 salidas de la política: el autor no aclara qué articulación queda fuera del control o si se fija externamente.
- Riesgo de comportamiento fuera de distribución: al ser una política entrenada (presumiblemente en simulación) para una secuencia cerrada, perturbaciones externas o superficies distintas de las previstas pueden provocar pérdida de equilibrio. No se publican métricas de robustez ni tasa de caídas.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia independiente de que el movimiento se reproduzca correctamente en hardware real más allá del vídeo del autor.
- Riesgo de alucinación no aplicable al no ser un modelo generativo de texto; el riesgo equivalente es la ejecución de una trayectoria incorrecta sin señal de error.
- Idiomas y sesgos: no aplica el soporte lingüístico. No hay información sobre sesgos de entrenamiento; en robótica bípeda, asimetrías en el dataset pueden traducirse en diferencias de comportamiento entre el lado izquierdo y el derecho, extremo que no se documenta.
- Repositorio de 0,0 GB: conviene verificar la integridad de `policy.onnx` y `manifest.json` tras la descarga antes de desplegarlo en el robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-disco-inferno
- Ficheros del repositorio: `policy.onnx`, `manifest.json`, `media/preview.mp4`
- TechCrunch, sobre el lanzamiento del Microduck: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- MarkTechPost, robot bípedo open source entrenado con RL en MuJoCo: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Tech360, especificaciones y disponibilidad: https://www.tech360.tv/hugging-face-unveils-microduck-new-open-source-biped-ai-robot-2026-31-08
- CNX Software, hardware del robot (15 motores, cámara, sensor de profundidad, pico articulado): https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
- AI/TLDR, siete comportamientos y stack Apache-2.0: https://ai-tldr.dev/releases/huggingface-microduck/
