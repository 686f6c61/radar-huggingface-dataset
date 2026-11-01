# nocrab/microduck-flamingo

## Resumen

Microduck-flamingo es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto MicroDuck de Pollen Robotics. El modelo resuelve una tarea motora concreta: mantener el equilibrio sobre una sola pata (derecha o izquierda) a la orden y volver a la postura de apoyo bipodal. Se distribuye como un grafo ONNX de inferencia directa, sin capa de lenguaje ni componentes generativos.

La política se entrenó en simulación con el entorno `Mjlab-FlamingoCycleHard-Flat-MicroDuck`, sobre la rama `flamingo` del repositorio `pollen-robotics/microduck_rl`, y se validó en MuJoCo (con modelo de servo XL330) y en `duck-sim` con el software real del robot. El autor original del diseño de la tarea es Rémi Fabre; esta versión es un reentrenamiento independiente.

Es relevante como ejemplo de política de locomoción de bajo nivel exportada a ONNX para robótica de bajo coste, con un contrato de observación/acción explícito (61 entradas float32, 14 salidas float32 a 50 Hz) y un manifiesto legible por máquina. No es un modelo de lenguaje ni un modelo multimodal: su ámbito es exclusivamente el control motor en simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para RL (red neuronal feed-forward exportada a ONNX); topología interna no detallada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX float32) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` |

Especificaciones del contrato de inferencia:

| Parametro | Valor |
|---|---|
| Entrada | `obs[1, 61]` float32 |
| Salida | `actions[1, 14]` float32 |
| Frecuencia de control | 50 Hz |
| Normalizador | integrado en el grafo |
| Escala de objetivos | alrededor de HOME × 1.0 |
| Tipo de política | perpetua (`perpetual`) |
| Pose de entrada | de pie (`standing`) |
| Comando | bloque de 13 dimensiones; `twist = [flag, side, 0]` |

## Arquitectura y entrenamiento

La model card no detalla la topología interna de la red (número de capas, anchura, activaciones). Lo que sí se especifica es el contrato de inferencia: observación de 61 valores float32, acción de 14 valores float32, con el normalizador de observaciones embebido en el propio grafo ONNX, lo que elimina la necesidad de preprocesado externo en el bucle de control. La frecuencia de operación es de 50 Hz y la política es de tipo perpetuo con pose de entrada de pie.

El entrenamiento se realizó con el framework Mjlab sobre la tarea `Mjlab-FlamingoCycleHard-Flat-MicroDuck`, en la rama `flamingo` del repositorio `pollen-robotics/microduck_rl` (commit `4757d6ae`, no fusionada en el momento de la publicación). La ejecución concreta corresponde a `local 2026-10-25_22-40-46_ours-hard`, checkpoint `model_2999`, tras 3000 iteraciones con 4096 entornos en una RTX 5080 durante 1 hora y 44 minutos. La exportación se hizo con `scripts/export.py`. El diseño de la tarea y el script de control (`control.py`) son de Rémi Fabre y se reutilizan sin cambios; solo la ejecución de entrenamiento es propia.

El comando de control se codifica en los slots `twist` del bloque de 13 dimensiones: `twist[0]` es el flag (0 = apoyo bipodal/HOME, 1 = apoyo monopodal), `twist[1]` es el lado (+1 = pie derecho apoyado y pierna izquierda levantada, −1 = pie izquierdo apoyado y pierna derecha levantada; 0 permitido cuando el flag es 0) y `twist[2]` no se usa. Los slots de cabeza y cuerpo del bloque de comando quedan a cero.

## Capacidades

- Control motor de equilibrio monopodal: mantener el apoyo sobre la pata derecha o la izquierda según el comando.
- Transición entre apoyo monopodal y bipodal (`HOME`) a demanda.
- Ejecución de una secuencia de comandos temporizada mediante `control.py` y su opción `--timeline`.
- Inferencia a 50 Hz con normalización integrada, apta para bucles de control en tiempo real.
- Ejecución en CPU (validada en MuJoCo sobre CPU) y en el simulador `duck-sim` con el software del robot real.
- Robustez limitada frente a empujes: tolera perturbaciones por debajo de aproximadamente 0,2 m/s.
- No dispone de tool calling, agentes, razonamiento multi-paso, capacidades multilingües, visión ni audio.

## Casos de uso

- Validación de políticas de locomoción en simulación: cargar `policy.onnx` en MuJoCo con el modelo de servo XL330 y reproducir la línea temporal de la model card (pie derecho 8 s, ambos pies, pie izquierdo 8 s, ambos pies) para verificar el comportamiento antes de transferir a hardware.
- Pruebas de robustez frente a perturbaciones: ejecutar la rejilla de 32 empujes (0,15–0,3 m/s en 4 direcciones y ambos pies) para caracterizar la tasa de caídas de la política (5/32 en esta versión) y compararla con variantes.
- Integración en `duck-sim` con el software real del robot: el mismo binario de control que se usaría en el robot permite probar el pipeline de observaciones y acciones sin modificar el código de despliegue.
- Desarrollo de tareas de RL sobre MicroDuck: servir como referencia de contrato (`obs[1,61] → actions[1,14]`, 50 Hz, normalizador embebido) para entrenar y exportar nuevas políticas con el formato de compartición de `microduck_rl`.
- Investigación en transferencia sim-a-real: al estar entrenada solo en simulación y no haberse probado en hardware, es un caso de estudio útil para medir la brecha entre MuJoCo/`duck-sim` y el robot físico, con la advertencia de mantener una mano bajo el robot durante las pruebas.
- Docencia y demostraciones de robótica de bajo coste: el modelo es pequeño, se ejecuta en CPU y la licencia Apache 2.0 permite su uso en materiales formativos y talleres sin restricciones de redistribución.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Línea temporal de la model card (pie derecho, luego izquierdo, apoyos de 8 s), MuJoCo en CPU | nunca cae |
| `duck-sim` (cuerpo del robot real frente a MuJoCo), ambos lados | apoyo monopodal a gz −0,89, sin veredictos de caída |
| Rejilla de 32 empujes (0,15–0,3 m/s × 4 direcciones × ambos pies) | 5/32 caídas (la referencia `flamingo`: 6/32) |

No se han publicado resultados de benchmarks estándar de ML (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es coherente con la naturaleza de política de control del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y el modelo se ejecuta en CPU en las pruebas publicadas, por lo que la huella es mínima.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una RTX 5080 (3000 iteraciones, 4096 entornos, 1 h 44 min). Para inferencia no se requiere GPU.
- Cabe en GPU de consumo: sí, y también en CPU; las validaciones publicadas se hicieron en MuJoCo sobre CPU.
- Opciones de despliegue: ONNX Runtime para cargar `policy.onnx`; `control.py` como driver de referencia; integración con `duck-sim` y con el stack `microduck_rl`.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso de control); no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Entorno | Licencia | Estado |
|---|---|---|---|---|---|
| nocrab/microduck-flamingo | Política RL en ONNX | Equilibrio monopodal a la orden | MuJoCo + duck-sim | Apache 2.0 | Publicado; solo simulación |
| RemiFabre/microduck-flamingo-cycle | Política RL (referencia) | Misma tarea y comando | MuJoCo + duck-sim | no disponible en la información | Referencia del reentrenamiento; 6/32 caídas en la rejilla de empujes |
| Otras políticas de `microduck_rl` | Políticas RL | Locomoción de MicroDuck | MuJoCo + duck-sim | según repositorio | No detalladas en la información disponible |

La comparación cuantitativa disponible se limita a la rejilla de empujes: 5/32 caídas frente a 6/32 de la política de referencia, una mejora marginal de una caída en 32 pruebas. No hay datos de parámetros, contexto ni benchmarks de ML para el resto de alternativas.

## Limitaciones y advertencias

- Solo simulación: nunca se ha probado en un robot físico. Entrenada y verificada en MuJoCo (servo XL330) y en `duck-sim`; el autor advierte de que, si se prueba en hardware, se mantenga una mano bajo el robot.
- Robustez limitada: cae ante empujes de aproximadamente 0,2 m/s o superiores; en la rejilla de 32 empujes se registran 5 caídas.
- Ámbito restringido: no es un modelo de lenguaje ni multimodal; no procesa texto, imágenes ni audio, y no ofrece tool calling ni razonamiento.
- Dependencia de la tarea y del contrato: cualquier cambio en el layout de observación (61 valores), acción (14 valores), frecuencia (50 Hz) o normalización invalida la política.
- Procedencia sobre una rama no fusionada: el entrenamiento usa el commit `4757d6ae` de la rama `flamingo` de `microduck_rl`, no integrada en la rama principal, lo que puede afectar a la reproducibilidad si esa rama cambia.
- Créditos y autoría: el diseño de la tarea y `control.py` son de Rémi Fabre; esta publicación solo aporta el reentrenamiento. Conviene citar correctamente ambos trabajos.
- Licencia Apache 2.0: permite uso comercial y redistribución con las obligaciones habituales de atribución y aviso de cambios; no se han identificado restricciones adicionales en la información disponible.
- Sesgos y alucinación: no aplican en el sentido habitual de modelos generativos; el riesgo equivalente es la extrapolación fuera de la distribución de entrenamiento (superficies, cargas o comandos no vistos), que puede producir comportamientos no validados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nocrab/microduck-flamingo
- Vídeo de vista previa: https://huggingface.co/nocrab/microduck-flamingo/resolve/main/media/preview.mp4
- Modelo de referencia (Rémi Fabre): https://huggingface.co/RemiFabre/microduck-flamingo-cycle
- Repositorio `microduck_rl`: https://github.com/pollen-robotics/microduck_rl
- Documentación de compartición de políticas: https://github.com/pollen-robotics/microduck_rl/blob/main/docs/sharing-policies.md
