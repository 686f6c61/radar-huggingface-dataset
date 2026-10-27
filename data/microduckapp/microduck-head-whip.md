# microduckapp/microduck-head-whip

## Resumen

`microduckapp/microduck-head-whip` no es un modelo de lenguaje: es una política de control robótico publicada como artefacto ONNX dentro de la colección de "movimientos" (`microduck-move`) de la aplicación MicroDuck. Concretamente, implementa el movimiento llamado Head Whip, una secuencia de 10,6 segundos en la que el robot Microduck permanece con el cuerpo inmóvil mientras mueve la cabeza arriba, abajo, izquierda, derecha, la inclina, se detiene y remata con un gesto seco. La política consume 61 observaciones y emite 14 consignas articulares a 50 Hz.

El modelo lo publica la cuenta `microduckapp`, la misma organización que mantiene el resto de movimientos para el robot bípedo Microduck (25 cm, 15 motores, cámara, sensor de profundidad y pico articulado) que Pollen Robotics y Hugging Face presentaron en agosto de 2026 por 399 dólares y entrenado con aprendizaje por refuerzo en MuJoCo. Este artefacto concreto forma parte de la capa de contenido descargable del robot, no del entrenamiento del controlador base.

Su relevancia es práctica para quien trabaje con el ecosistema Microduck: es un ejemplo real y mínimo de contrato de política (observaciones, acciones, frecuencia de control, manifiesto de instalación) que se puede inspeccionar, replicar o sustituir. Fuera de ese contexto tiene poco interés: cero descargas, cero likes, sin licencia declarada y sin documentación técnica del entrenamiento. El repositorio reporta 0,0 GB, lo que sugiere un artefacto de muy pocos megabytes o incluso menos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control neuronal exportada a ONNX; topología interna (capas, tamaño) no documentada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política reactiva de control; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (solo se publica `policy.onnx`, sin variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control robótico, no genera lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) |
| Entradas | 61 observaciones por paso |
| Salidas | 14 consignas articulares (`joint targets`) |
| Frecuencia de control | 50 Hz |
| Duracion del movimiento | 10,6 s |
| Artefactos del repo | `policy.onnx`, `manifest.json`, `media/preview.mp4` |
| Tamano del repo | 0,0 GB (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura interna de la red: la model card solo documenta el contrato de entrada y salida (61 observaciones, 14 objetivos articulares, 50 Hz) y el formato de exportación (ONNX). Por el contexto del ecosistema cabe situarla como una política de control entrenada con aprendizaje por refuerzo en MuJoCo, el mismo enfoque que Pollen Robotics y Hugging Face emplearon para el controlador del Microduck, pero el autor no confirma ni detalla el método para este movimiento concreto. No hay datos sobre número de capas, funciones de activación, espacio de observación ni distribución de las 61 entradas.

Tampoco se documentan el dataset, el número de tokens (no aplica), ni si hubo fases de ajuste tipo RLHF o DPO (no aplica en control motor). El único elemento de innovación verificable es el empaquetado: separar la política (`policy.onnx`) del manifiesto de instalación (`manifest.json`), de forma que la aplicación MicroDuck pueda descargar, validar e instalar el movimiento en el robot sin recompilar firmware. No se mencionan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas.

## Capacidades

- Ejecución de una secuencia motora de 10,6 s específica para la cabeza del Microduck: movimientos verticales, horizontales, inclinación, pausa y gesto final seco.
- Generación de consignas articulares a 50 Hz para 14 objetivos de articulación a partir de 61 observaciones.
- Mantenimiento del cuerpo inmóvil mientras se ejecuta el movimiento de cabeza (comportamiento descrito explícitamente en la model card).
- Integración con el instalador de la aplicación MicroDuck mediante `manifest.json`.
- Distribución portable mediante ONNX, lo que permite ejecutarla con cualquier runtime compatible con el formato.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni capacidades multilingües: no es un modelo de propósito general.
- No se documenta ningún modo especial (thinking mode, audio, visión) asociado a esta política.

## Casos de uso

- **Contenido descargable para el robot Microduck**: el uso previsto. La aplicación instala `policy.onnx` mediante `manifest.json` y reproduce el gesto de 10,6 s como animación expresiva.
- **Demostración e interacción Humano-Robot (HRI)**: el movimiento mantiene el cuerpo quieto y concentra la atención en la cabeza, lo que resulta útil en escenarios de exhibición donde se busca un gesto reconocible y de corta duración sin desplazar la base.
- **Prueba de estrés del mecanismo de cabeza y cuello**: un ciclo repetido de movimientos rápidos en los cuatro ejes más inclinación permite medir calentamiento de servos, holgura mecánica y degradación de la posición tras múltiples ejecuciones.
- **Plantilla de integración de políticas en el ecosistema Microduck**: sirve como referencia mínima del contrato (61 entradas, 14 salidas, 50 Hz, manifiesto) para desarrolladores que quieran publicar sus propios movimientos con el mismo formato.
- **Base para imitación o mezcla de movimientos**: al ser un artefacto ONNX inspeccionable, se puede usar como referencia de trayectorias articulares para entrenar políticas propias o encadenar secuencias en la aplicación.
- **Docencia en robótica de control**: ejemplo compacto para explicar el ciclo observación-política-acción a 50 Hz, la exportación a ONNX y el empaquetado de políticas para hardware real, sin necesidad de infraestructura de cómputo.
- **Pruebas de seguridad del espacio de trabajo**: validar protocolos de distancia de seguridad alrededor del robot cuando la cabeza se mueve bruscamente en todas las direcciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay métricas de recompensa, éxito de tarea ni comparaciones cuantitativas con otras políticas. El único dato de rendimiento verificable es el contrato temporal: 50 Hz de frecuencia de control, es decir, un presupuesto de 20 ms por inferencia (dato derivado de la frecuencia especificada, no publicado como medición).

| Parametro de ejecucion | Valor |
|---|---|
| Frecuencia de control | 50 Hz |
| Presupuesto por paso | 20 ms (derivado de 50 Hz) |
| Pasos por ejecucion | ~530 (derivado: 10,6 s x 50 Hz) |
| Latencia medida | no disponible |
| Throughput medido | no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible. No se publica tamaño del grafo ni número de parámetros; el repositorio reporta 0,0 GB, lo que apunta a un artefacto muy pequeño.
- GPU recomendadas: no disponible. No hay indicación de que la política requiera aceleración por GPU; por su naturaleza (control a 50 Hz, pocas entradas y salidas) el cómputo es irrelevante frente al coste del lazo de control.
- Viabilidad en GPU de consumo: no confirmada ni descartada por el autor; no hay datos de consumo de memoria.
- Opciones de despliegue: ONNX Runtime como runtime natural del formato; ejecución en la CPU del propio robot o del host que controle el Microduck; integración vía la aplicación MicroDuck usando `manifest.json`.
- Latencia y throughput: no publicados. El único requisito verificable es completar cada inferencia en menos de 20 ms para sostener los 50 Hz.
- Aceleradores específicos (NPU, TPU, Jetson): no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas / salidas | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `microduckapp/microduck-head-whip` | Movimiento para robot Microduck (ONNX) | 61 / 14 | 50 Hz | no disponible | Público en HF, 0 descargas |
| `microduckapp/microduck-midnight-snack` | Movimiento para robot Microduck | no disponible | no disponible | no disponible | Público en HF (misma organizacion, 16 modelos) |
| Controlador base del Microduck (entrenado con RL en MuJoCo) | Política de locomoción del robot | no disponible | no disponible | no disponible (proyecto open source segun prensa) | Repositorio `pollen-robotics/microduck` en GitHub |

No se dispone de datos públicos de otras políticas comparables en la misma categoría (movimientos cortos empaquetados para un robot bípedo de consumo), por lo que la comparación cuantitativa de parámetros, contexto o rendimiento no está disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo multimodal: no procesa texto, imágenes ni audio, y toda expectativa de MMLU, HumanEval o GSM8K carece de sentido aquí.
- Ausencia total de licencia declarada: no se puede asumir permiso de uso comercial, redistribución ni modificación del artefacto. Cualquier uso en producto requiere contactar con el autor.
- Sin documentación de entrenamiento: se desconoce el simulador exacto, la función de recompensa, el número de episodios y el dominio de aleatorización, lo que impide evaluar la robustez ante cambios de fricción, masa o calibración.
- Riesgo de brecha sim-a-real (`sim-to-real gap`) no cuantificado: el comportamiento en el robot físico puede diferir del vídeo de previsualización.
- Posible inconsistencia dimensional: la política emite 14 objetivos articulares mientras la documentación pública del robot Microduck menciona 15 motores. Conviene verificar el mapeo exacto antes de integrarla.
- Sin métricas ni validación externa: 0 descargas y 0 likes en el momento de la consulta; no hay informes de terceros sobre su funcionamiento.
- Riesgo físico: el movimiento descrito implica giros bruscos de cabeza; debe ejecutarse lejos de personas, objetos frágiles y bordes de mesa.
- Fecha de publicación muy reciente (27 de octubre de 2026) y sin actualizaciones posteriores; el contenido puede cambiar sin aviso.
- Sin soporte de contexto, diálogo ni instrucciones en lenguaje natural: la política es puramente reactiva y no acepta parámetros de estilo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microduckapp/microduck-head-whip
- Organización MicroDuck en HuggingFace: https://huggingface.co/microduckapp
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Cobertura de MarkTechPost sobre Microduck: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura de TechCrunch: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Cobertura de CNX Software: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
