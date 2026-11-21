# HannesVonEssen/microduck-backwards-scoot

## Resumen

microduck-backwards-scoot es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de pequeño tamaño Microduck. La desarrolla HannesVonEssen y se publica bajo licencia Apache 2.0. No es un modelo de lenguaje: es una política neuronal que mapea observaciones del estado del robot a acciones de control articular, empaquetada en formato ONNX y diseñada para ejecutarse en el propio robot a 50 Hz.

El modelo resuelve un problema muy concreto: hacer que un Microduck sentado se desplace hacia atrás sobre su asiento para acoplarse al MicroDock, una base de carga con conector magnético USB-C. El robot se sienta frente a la base y retrocede hasta que el conector de su puerto contacta con el adaptador del dock. La política también funciona de forma autónoma, sin necesidad del dock, como control de desplazamiento sentado.

Su relevancia es acotada pero clara para quien trabaja con Microduck: es una pieza reutilizable de un pipeline de robótica completo (entrenamiento en simulación con mjlab, exportación a ONNX, despliegue en hardware real), publicada junto al entorno de entrenamiento y el hardware del dock. La arquitectura de red, el número de parámetros y la longitud de contexto no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 61 valores) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entradas / salidas | 61 observaciones de entrada, 14 acciones de salida, a 50 Hz |
| Comando de control | Slot twist `[vx, vy, wz]` |
| Framework de entrenamiento | mjlab (`Mjlab-ButtWalk-Flat-MicroDuck`, iteración 1400) |
| Simulador | MuJoCo |
| Tamaño del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, función de activación). Se sabe que es una política de aprendizaje por refuerzo entrenada en simulación con mjlab, en el entorno `Mjlab-ButtWalk-Flat-MicroDuck`, hasta la iteración 1400, partiendo de un `checkpoint.pt`. El entorno de entrenamiento y la metodología están documentados en el repositorio microduck-playground, en la ruta `hardware/microdock-v2/training`.

La política consume 61 observaciones y produce 14 acciones a 50 Hz. El normalizador de observaciones está integrado en el modelo exportado, lo que simplifica el despliegue: no hace falta replicar el preprocesado por separado. El fichero `config.json` del repositorio define el orden de las articulaciones y los offsets a los que se suman las acciones. El modelo se exporta a ONNX, lo que permite inferencia ligera en el hardware del robot. Es la misma política que `scoot_dock.onnx` del repositorio microduck-playground.

## Capacidades

- Control de locomoción sentado: desplazamiento hacia atrás sobre el asiento a aproximadamente 4–5 cm/s con `vx = −0.05 m/s`.
- Desplazamiento hacia delante con `vx` positivo y mantenimiento de posición con `vx = 0`.
- Control de rumbo mediante `wz`: a `wz = 0` el robot gira lentamente, por lo que es necesario fijar el heading con este canal. El MicroDock aplica 0.03 rad/s por grado de error de heading.
- Acoplamiento autónomo al MicroDock: retrocede hasta que el conector magnético USB-C de su puerto contacta con el adaptador del dock.
- Funcionamiento independiente del dock como política de desplazamiento sentado.
- Integración en una secuencia de habilidades: se arranca desde la posición sentada, establecida previamente con la política oficial `alpha_sitstand`, y se conmuta a esta.
- Inferencia a 50 Hz con normalizador de observaciones embebido.

## Casos de uso

- Recarga autónoma del Microduck: el robot se sienta frente al MicroDock y esta política lo desplaza hacia atrás hasta el contacto del conector magnético USB-C, habilitando ciclos de recarga sin intervención humana.
- Encadenamiento de habilidades en un pipeline de robótica: tras ejecutar `alpha_sitstand` para sentarse, se conmuta a esta política para el posicionamiento fino; el `config.json` con el orden de articulaciones y offsets facilita la integración en un controlador de más alto nivel.
- Desplazamiento preciso en espacios reducidos: al operar sentado y a 4–5 cm/s, permite ajustes finos de posición donde la locomoción de pie sería menos estable o más aparatosa.
- Validación de políticas entrenadas en simulación sobre hardware real: el vídeo de previsualización muestra la política en un Microduck físico probado por Antoine Pirrone, lo que la convierte en referencia para comparar el gap sim-to-real del pipeline mjlab.
- Base para reentrenamiento y experimentación: al publicarse el entorno de entrenamiento en microduck-playground, sirve como punto de partida para modificar la recompensa, el entorno o el hardware del dock y volver a entrenar con mjlab.
- Investigación en aprendizaje por refuerzo aplicado a robótica de bajo coste: caso reproducible de extremo a extremo (simulación MuJoCo, exportación ONNX, despliegue a 50 Hz) útil para estudiar transferencia y control de contacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta datos operativos cualitativos y de velocidad: retroceso de aproximadamente 4–5 cm/s con `vx = −0.05 m/s` y frecuencia de control de 50 Hz.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y el modelo se distribuye en ONNX, lo que sugiere una huella muy reducida.
- GPU recomendadas: no disponibles. Para una política de control a 50 Hz con 61 entradas y 14 salidas, la inferencia en CPU es una opción plausible, pero no se confirma en la información proporcionada.
- Cabe en GPU de consumo: no disponible como dato confirmado; por el tamaño del artefacto es esperable, pero no se especifica.
- Opciones de despliegue: ONNX Runtime sobre el hardware del robot; el formato ONNX es el único soportado documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms); no se publican cifras de latencia de inferencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas / salidas | Frecuencia | Formato | Licencia |
|---|---|---|---|---|---|
| microduck-backwards-scoot | Política RL para Microduck (sentado, retroceso) | 61 / 14 | 50 Hz | ONNX | Apache 2.0 |
| `scoot_dock.onnx` (microduck-playground) | Misma política, distribución alternativa | 61 / 14 | 50 Hz | ONNX | Según repositorio microduck-playground |
| `alpha_sitstand` (política oficial Microduck) | Política RL de sedestación | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de red para establecer una comparación cuantitativa con otras políticas de control.

## Limitaciones y advertencias

- Modelo de nicho: solo es válido para el robot Microduck y su morfología; no es transferible a otros robots sin reentrenamiento.
- Requiere arrancar desde la posición sentada; debe encadenarse tras `alpha_sitstand` o equivalente.
- Deriva de rumbo: a `wz = 0` el robot gira lentamente, por lo que es imprescindible un lazo de control de heading (el MicroDock usa 0.03 rad/s por grado de error).
- Dependencia del contacto físico con el dock: el acoplamiento depende de la alineación del conector magnético USB-C y del adaptador; no se documentan tolerancias de desalineación.
- Rendimiento validado principalmente en simulación (MuJoCo); la prueba en hardware real se documenta mediante vídeo, sin métricas cuantitativas de éxito publicadas.
- No se detallan sesgos, tasas de alucinación ni limitaciones de idioma porque no es un modelo generativo de lenguaje; esos criterios no aplican.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no se documentan restricciones adicionales.
- Para producción: no hay cifras publicadas de robustez ante perturbaciones, variaciones de superficie o envejecimiento del hardware, por lo que conviene validar en el robot objetivo antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HannesVonEssen/microduck-backwards-scoot
- Repositorio microduck-playground: https://github.com/Vottivott/microduck-playground
- Política equivalente `scoot_dock.onnx`: https://github.com/Vottivott/microduck-playground/blob/main/hardware/microdock-v2/policy/scoot_dock.onnx
- Entorno de entrenamiento: https://github.com/Vottivott/microduck-playground/tree/main/hardware/microdock-v2/training
- Hardware MicroDock v3: https://github.com/Vottivott/microduck-playground/tree/main/hardware/microdock-v3
