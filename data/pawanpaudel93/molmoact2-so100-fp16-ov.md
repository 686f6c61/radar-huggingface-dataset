# pawanpaudel93/molmoact2-so100-fp16-ov

## Resumen

MolmoAct2-SO100_101 en formato OpenVINO es un paquete de política (`policy_package`) para robótica derivado de `allenai/MolmoAct2-SO100_101`, un modelo vision-language-action (VLA) de Ai2 especializado en el control de brazos robóticos SO-100 y SO-101. Esta exportación concreta, publicada por el usuario `pawanpaudel93`, convierte los pesos originales a un grafo OpenVINO en float32 con pesos fp16, pensado para el motor `ov-policy` de Cascadia y para su despliegue en CPU Intel. El objetivo es permitir inferencia de política robótica sin depender de PyTorch en producción.

El modelo recibe dos cámaras RGB (`top` y `side`) a 378×378 píxeles, un vector de estado de 6 valores (5 articulaciones en grados más pinza) y un prompt de tarea en lenguaje natural, y devuelve una secuencia de 30 pasos de acción × 6 dimensiones en forma de pose articular absoluta con pinza. Está ajustado específicamente para el frame articular legacy de LeRobot para SO-100, con el adaptador de frame SO-101 de Intel desactivado (`adapt_to_so101=False`).

La relevancia de esta ficha es doble: por un lado documenta una alternativa de despliegue optimizada (OpenVINO, CPU) para un VLA de robótica; por otro, advierte de que el paquete es una exportación de terceros con verificación parcial. El autor confirma paridad numérica frente a PyTorch en CPU, pero deja sin medir el rendimiento en el motor Cascadia, en GPU Intel y, sobre todo, la tasa de éxito real en tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de MolmoAct2; grafo OpenVINO float32 con pesos fp16 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (pesos) sobre grafo float32; no se documentan otras variantes |
| Idiomas soportados | no disponible (el prompt de tarea se asume en lenguaje natural, sin lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml`/`.bin`); repo de 10.0 GB; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El paquete es una exportación de `allenai/MolmoAct2-SO100_101` (revision `152569fe57914d97be91055800035f54e250d009`) realizada con Intel physical-ai-studio (commit `8f132416`, runtime `e3dd944`). La arquitectura subyacente es un modelo vision-language-action de Ai2: un backbone de lenguaje Qwen3-4B-Instruct-2507 (vía `allenai/Molmo2-ER`) combinado con entrada visual de dos cámaras y una cabeza de política que emite acciones articulares. La exportación declara dos cámaras (`top`, `side`) y guarda el grafo en float32 con pesos en fp16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de imitación, ni si hubo RLHF/DPO en el modelo base. Tampoco se documentan innovaciones de decodificación o atención específicas en esta exportación. Lo que sí está documentado es la interfaz de política: entrada de estado de 6 valores en el frame articular legacy de LeRobot para SO-100, salida de 30×6 acciones en pose articular absoluta más pinza, y prompt de tarea con el setup "single so100/so101 robotic arm in molmoact2" y modo de control "absolute joint pose".

## Capacidades

- Control de brazo robótico SO-100/SO-101 mediante políticas de imitación condicionadas por lenguaje.
- Percepción visual multi-cámara: dos vistas RGB (`top` y `side`) a 378×378 píxeles, uint8; el autor indica que el orden de cámaras no importa.
- Condicionamiento por prompt de tarea en lenguaje natural para seleccionar el comportamiento.
- Predicción de trayectorias de acción: 30 pasos × 6 dimensiones (5 articulaciones + pinza) en pose articular absoluta.
- Entrada de estado propioceptivo de 6 valores (grados articulares + pinza) en el frame legacy SO-100.
- Inferencia determinista en CPU con OpenVINO (verificado por el autor).
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación con brazo SO-100/SO-101 en laboratorio: el paquete se carga en el motor `ov-policy` de Cascadia y ejecuta políticas de imitación sobre las cámaras `top` y `side`, adecuado para prototipos de investigación en robótica de bajo coste.
- Despliegue en CPU sin PyTorch: al ser un grafo OpenVINO, permite ejecutar la política en equipos Intel sin la pila de PyTorch, útil en estaciones de trabajo o robots con cómputo limitado.
- Reproducción de experimentos de Ai2: al mantener la interfaz exacta del checkpoint original (frame legacy SO-100, `adapt_to_so101=False`), sirve para replicar resultados del modelo base con una ruta de inferencia distinta.
- Evaluación comparativa de runtimes: permite contrastar latencia y precisión entre PyTorch y OpenVINO sobre las mismas entradas, con tolerancias ya medidas (1,4e-4 normalizado en IR fp16 frente a PyTorch).
- Integración en pipelines de robótica física: el formato `policy_package` con cámaras, estado y prompt declarados facilita el cableado en un bucle de control que lea sensores y aplique las 30 acciones devueltas.
- Docencia y formación en VLA: el tamaño del repo (10 GB) y la licencia Apache-2.0 permiten usar el paquete en cursos y talleres sobre políticas visión-lenguaje-acción.
- Validación numérica de exportaciones: sirve como referencia para verificar conversiones de modelos VLA a OpenVINO, dado que el autor publica las cotas de error frente a PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta verificaciones numéricas de paridad:

| Verificacion | Resultado |
|---|---|
| IR fp16 vs PyTorch (mismas entradas, computo f32) | max abs 1,4e-4 (normalizado), sin NaN |
| Runtime Intel extremo a extremo vs PyTorch (muestra de la model card) | max abs 3,8e-3 grados sobre acciones de 71 grados de media; determinista |
| Ejecucion en motor Cascadia | no medida |
| Ejecucion en GPU Intel | no medida |
| Tasa de exito en tareas | no medida |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el paquete está pensado para CPU y el repo ocupa 10.0 GB en disco.
- GPU recomendadas: no se especifican; la verificación publicada es en CPU. La ejecución en GPU Intel no se ha medido.
- ¿Cabe en GPU de consumo? No disponible; al ser un grafo OpenVINO orientado a CPU, la pregunta relevante es de RAM del sistema, no de VRAM.
- Opciones de despliegue: motor `ov-policy` de Cascadia (tipo `molmoact2`); OpenVINO Runtime para carga directa del IR.
- Latencia y throughput: no disponibles; no se han publicado mediciones en el motor Cascadia ni en GPU Intel.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| pawanpaudel93/molmoact2-so100-fp16-ov | no disponible | no disponible | OpenVINO IR | Apache-2.0 | Exportacion de terceros, verificacion parcial |
| allenai/MolmoAct2-SO100_101 | no disponible | no disponible | pesos originales (no detallado) | Apache-2.0 | Modelo base de Ai2 |
| allenai/Molmo2-ER | no disponible | no disponible | no disponible | Apache-2.0 | Backbone/base del VLA |
| Qwen3-4B-Instruct-2507 | 4B (según nombre) | no disponible | no disponible | Apache-2.0 | Backbone de lenguaje |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Exportación de terceros: no es un artefacto oficial de Ai2 ni de Intel; el autor solo verifica paridad numérica en CPU, no comportamiento en robot real.
- Tasa de éxito en tareas sin medir: no hay evidencia publicada de que la política funcione correctamente en el motor Cascadia ni en hardware físico.
- Frame articular legacy SO-100: el adaptador de frame SO-101 está desactivado (`adapt_to_so101=False`); usar el paquete con un SO-101 sin conversión de frame puede producir acciones incorrectas.
- Orden y calibración de cámaras: aunque el autor afirma que el orden no importa, la resolución fija 378×378 y el tipo uint8 RGB son requisitos estrictos.
- Idiomas no documentados: no se especifica qué lenguas acepta el prompt de tarea; asumir inglés es lo prudente.
- Sin datos de sesgos ni alucinación: no hay información sobre sesgos del modelo base ni sobre su comportamiento fuera de distribución.
- Licencia Apache-2.0: permite uso comercial, pero Ai2 declara el modelo "para investigación y uso educativo" conforme a sus Responsible Use Guidelines; conviene revisar esa guía antes de un despliegue comercial.
- Tamaño del repo (10 GB) y ausencia de cuantizaciones alternativas: limita el despliegue en dispositivos con poco almacenamiento.
- Sin benchmarks de precisión de política: no se puede comparar con alternativas VLA sin ejecutar evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pawanpaudel93/molmoact2-so100-fp16-ov
- Modelo base: https://huggingface.co/allenai/MolmoAct2-SO100_101
- Backbone/base de Ai2: https://huggingface.co/allenai/Molmo2-ER
- Repositorio de Ai2: https://github.com/allenai/molmoact2
- Responsible Use Guidelines de Ai2: https://allenai.org/responsible-use
