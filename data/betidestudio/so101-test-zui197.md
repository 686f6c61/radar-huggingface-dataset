# betidestudio/so101-test-zui197

## Resumen

`betidestudio/so101-test-zui197` es una política de control robótico (no un modelo de lenguaje) publicada en Hugging Face dentro del ecosistema LeRobot. Implementa una *diffusion policy* entrenada para el brazo robótico SO-101, un manipulador de sobremesa de bajo coste habitual en laboratorios de robótica open source. La política consume el estado articular del robot y tres cámaras (frontal, superior y de muñeca) y produce acciones motrices, con un bucle de control declarado de 20 fps. El repositorio contiene 292.719.206 parámetros en safetensors (formato F32, 1,2 GB), lo que la sitúa en la gama de 0,3B parámetros, manejable en cualquier GPU de consumo.

El modelo resuelve el problema de la manipulación visomotora aprendida por imitación: en lugar de programar trayectorias a mano, se graban demostraciones con teleoperación *leader/follower* y la política aprende a reproducirlas condicionada por la observación visual. La elección de difusión (en lugar de regresión directa) permite modelar distribuciones multimodales de acciones, algo relevante cuando una misma imagen admite varias trayectorias válidas.

Es relevante ahora por dos motivos. Primero, forma parte de la ola de políticas robóticas ligeras y reproducibles que cualquiera puede entrenar y desplegar con hardware de menos de 500 euros. Segundo, el nombre del repositorio (`test`) y la ausencia de métricas publicadas indican que se trata de un artefacto experimental, probablemente una prueba de pipeline más que un modelo listo para producción. No hay información sobre licencia, idiomas ni evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (LeRobot): red de difusión que genera *action chunks* condicionada por estado articular e imágenes de tres cámaras |
| Parametros totales | 292.719.206 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no hay contexto textual; la ventana de observación y el horizonte de acción no se documentan) |
| Tipos de cuantizacion | no se publican cuantizaciones oficiales; los pesos se distribuyen en F32. Convertibles técnicamente a FP16/BF16 con PyTorch |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (F32), pesos en `lerobot` |

Otros datos verificables: pipeline `robotics`, tamaño del repositorio 1,2 GB, creado y actualizado el 2026-10-26, 0 descargas y 0 *likes* en el momento de la consulta.

## Arquitectura y entrenamiento

Se trata de una *diffusion policy* en la implementación de LeRobot. La política formula el control como un problema de generación: parte de ruido gaussiano y aplica un número finito de pasos de denoising para producir una secuencia de acciones (action chunk), condicionada en cada paso por la observación actual (estado de las articulaciones más las imágenes de las cámaras frontal, superior y de muñeca). El uso de difusión frente a una regresión MSE directa evita el promediado de trayectorias incompatibles y captura la multimodalidad de las demostraciones. El bucle de control opera a 20 fps, lo que implica un presupuesto de latencia de 50 ms por paso.

No hay información pública sobre el número de tokens, la composición del dataset de demostraciones, el número de episodios de teleoperación, la resolución de las cámaras ni si hubo etapas de refinamiento (RLHF/DPO no aplican a un modelo de acción; sí podría haber *filtering* de episodios o *augmentation*, pero no se documenta). Tampoco se especifica el número de pasos de difusión en inferencia ni el horizonte de predicción. El autor solo indica el uso previsto: cargarlo con `lerobot` mediante `--policy.path=<repo>`.

## Capacidades

- Control visomotor para el brazo SO-101: genera comandos articulares a partir de estado y observación de tres cámaras.
- Modelado multimodal de acciones: la formulación por difusión permite representar varias trayectorias válidas para una misma observación.
- Predicción de secuencias de acción (*action chunks*), no acciones aisladas, lo que aporta consistencia temporal en el bucle de control a 20 fps.
- Fusión de tres vistas (frontal, superior y de muñeca), lo que aporta información complementaria sobre la escena y sobre la pinza.
- Compatible con el stack LeRobot tanto para inferencia como para reentrenamiento con nuevos datos.
- No soporta *tool calling*, *function calling*, razonamiento multi-paso simbólico, ni generación de texto.
- No tiene capacidades multilingües ni *thinking mode*: no hay modalidad de lenguaje.
- No se documentan capacidades de *vision-language-action* (VLA): no hay instrucciones en lenguaje natural.

## Casos de uso

- **Pick-and-place de laboratorio**: la política toma objetos de una superficie y los deposita en una ubicación fija usando la vista superior para localizar y la de muñeca para el agarre fino. Adecuada porque el gesto está muy representado en datasets de teleoperación.
- **Investigación en imitación con SO-101**: sirve como referencia o punto de partida para comparar variantes de diffusion policy frente a ACT en el mismo robot y mismo conjunto de demostraciones, gracias a la integración nativa con LeRobot.
- **Recogida y ordenación de piezas pequeñas**: en una célula de montaje, el modelo puede clasificar visualmente piezas y moverlas a bandejas. La vista de muñeca cubre el último tramo, donde el error de posicionamiento es crítico.
- **Validación sim-to-real antes de desplegar hardware**: se puede replicar el pipeline en un simulador MuJoCo de SO-101 para comprobar el comportamiento de la política antes de ejecutarla en el brazo real, reduciendo riesgo de colisiones.
- **Recolección de datos asistida**: usar la política como *policy server* durante sesiones de teleoperación, de modo que el operario corrija las trayectorias generadas y esas correcciones se añadan al dataset para un reentrenamiento posterior.
- **Prototipado rápido de tareas domésticas simples**: abrir cajones, colocar objetos en soportes o apilar piezas ligeras en un banco de pruebas, con la ventaja de que el modelo se ejecuta en una GPU de consumo y el ciclo de iteración es corto.
- **Banco de pruebas de latencia y control**: útil para medir si una diffusion policy de 0,3B parámetros cumple el presupuesto de 50 ms por paso a 20 fps en hardware modesto, antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito por tarea, número de episodios de evaluación, ni comparaciones con ACT u otras políticas sobre el mismo dataset. El repositorio registra 0 descargas y 0 *likes*, por lo que tampoco existen métricas comunitarias.

## Requisitos de hardware

- **VRAM estimada (cálculo a partir de 292,7M parámetros, no medida publicada)**: en F32 los pesos ocupan ~1,17 GB; en FP16/BF16, ~0,59 GB. Sumando activaciones y buffers de tres flujos de imagen y los pasos iterativos de denoising, una estimación razonable es de 2-4 GB en F32 con *batch* pequeño y 1-2 GB en FP16.
- **GPU recomendadas**: cualquier GPU con 4 GB o más de VRAM es suficiente en la práctica. Una RTX 3060 12 GB, RTX 4060 Ti o RTX 4090 van sobradas; para despliegue en laboratorio, una RTX A2000/A4000 o una L4 permiten dejarlo ejecutando en continuo con bajo consumo.
- **¿Cabe en GPU de consumo?** Sí, con margen amplio: incluso una GTX 1650 de 4 GB o una Jetson Orin Nano (8 GB) pueden albergarlo, aunque la latencia real por paso no está publicada y en Jetson habría que validar el cumplimiento de los 50 ms.
- **Opciones de despliegue**: el camino previsto por el autor es `lerobot` sobre PyTorch (`--policy.path=<repo>`). Alternativas razonables son exportar a TorchScript u ONNX para inferencia sin dependencia del framework, o servirlo con un *policy server* local. vLLM, TGI, llama.cpp y Ollama no aplican: no es un modelo de lenguaje.
- **Latencia y throughput**: no publicados. El único dato objetivo es que la política debe operar a 20 fps (50 ms por paso de control), lo que fija el requisito pero no la medición. En una RTX 4090 se espera holgura; en CPU o Jetson el margen es incierto y conviene medirlo antes de desplegar.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `betidestudio/so101-test-zui197` (este) | 292,7M (F32) | estado + 3 cámaras, 20 fps | no disponible | no disponible | pública en HF, 0 descargas |
| `betidestudio/so101-test-ab9ofl` | ~0,3B (F32) | estado + 3 cámaras, 20 fps | no disponible | no disponible | pública en HF |
| Política ACT en LeRobot | no disponible | estado + cámaras | no disponible | no disponible | implementación incluida en LeRobot |
| Políticas VLA tipo π0 o SmolVLA | no disponible | imágenes + instrucción en lenguaje | no disponible | no disponible | ecosistema LeRobot / OpenPI |

La comparación más directa es con `betidestudio/so101-test-ab9ofl`, del mismo autor y con la misma descripción funcional, lo que sugiere dos ejecuciones del mismo pipeline de entrenamiento con distinto identificador. Frente a ACT, la diferencia conceptual es la formulación generativa por difusión frente a la predicción determinista de *action chunks*; no hay datos públicos que permitan comparar tasas de éxito en este repositorio concreto.

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita no hay permiso claro de uso comercial. En la práctica, la ausencia de licencia equivale a reserva de derechos en muchas jurisdicciones; conviene contactar con el autor antes de cualquier despliegue productivo.
- **Artefacto experimental**: el nombre del repositorio incluye `test`, no hay métricas publicadas, ni *dataset card*, ni descripción del conjunto de demostraciones. No hay evidencia de que la política funcione fuera del montaje concreto con el que se grabó.
- **Sobreajuste al *setup***: tres cámaras en posiciones concretas, iluminación concreta y un único brazo SO-101. Cualquier cambio de cámara, de altura de mesa o de condiciones de luz supone *distribution shift* y probable degradación del comportamiento.
- **Sin condicionamiento por lenguaje**: no acepta instrucciones del tipo «coge el vaso rojo»; la tarea queda fijada implícitamente en los pesos.
- **Riesgo físico**: al ejecutarse sobre hardware real, los fallos de la política se traducen en movimientos bruscos. Es imprescindible un límite de par, un *e-stop* físico y una zona de trabajo despejada durante las primeras ejecuciones.
- **Latencia no verificada**: si la inferencia supera los 50 ms por paso, el bucle a 20 fps se rompe y la política queda desincronizada del estado real; hay que medirlo en el hardware objetivo.
- **Sesgos**: no aplican sesgos lingüísticos, pero sí sesgos de dataset: objetos, colores y posiciones sobrerrepresentados en las demostraciones se ejecutarán mejor que el resto, con riesgo de generalización espuria.
- **Alucinación**: no aplica en el sentido textual, pero sí existe el equivalente conductual, la generación de trayectorias plausibles pero incorrectas cuando la observación sale del dominio de entrenamiento.
- **Trazabilidad**: 0 descargas y 0 *likes*, sin issues ni discusión; no hay soporte ni garantía de mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/betidestudio/so101-test-zui197
- Variante del mismo autor: https://huggingface.co/betidestudio/so101-test-ab9ofl
- Documentación de SO-101 en LeRobot: https://huggingface.co/docs/lerobot/so101
- Repositorio LeRobot: no disponible en la búsqueda (referenciado implícitamente por la librería)
- Stack ROS 2 para SO-101: https://github.com/legalaspro/so101-ros-physical-ai
- Simulador MuJoCo para SO-101/SO-100: https://github.com/tuul-ai/so101_sim
- Tutorial sim-to-real con SO-101 e Isaac (NVIDIA): https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html
- Paper de diffusion policy: no disponible en la información proporcionada
