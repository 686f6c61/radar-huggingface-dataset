# Chaenn/smolvla_so101_multitask_simreal_fullft_0901

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para controlar robots manipuladores con un coste computacional reducido y capaz de ejecutarse en hardware de consumo. Este repositorio concreto, `Chaenn/smolvla_so101_multitask_simreal_fullft_0901`, es un ajuste fino (full fine-tuning) del modelo base `lerobot/smolvla_base` sobre el dataset `Chaenn/so101_cube_place_new_simreal_0827`, orientado a tareas multitarea de pick-and-place con el brazo robótico SO-101, combinando datos de simulación y del mundo real (sim-to-real).

El modelo tiene 450 millones de parámetros y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones. Está entrenado con la librería LeRobot de Hugging Face, lo que facilita su integración en pipelines de robótica existentes. Su relevancia actual radica en la tendencia hacia VLA pequeños y desplegables en entornos de investigación y producción con recursos limitados, frente a modelos de gran escala que requieren infraestructura dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (no se especifican detalles internos) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 0,9 GB) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que procesa observaciones visuales y, opcionalmente, instrucciones en lenguaje natural para generar acciones de control del robot. La arquitectura exacta (número de capas, tipo de atención, etc.) no se detalla en la información disponible, pero se enmarca dentro de la familia de modelos VLA compactos que combinan un codificador visual, un modelo de lenguaje y una cabeza de acción. El entrenamiento se realizó mediante ajuste fino completo (full fine-tuning) del checkpoint base `lerobot/smolvla_base` sobre el dataset `Chaenn/so101_cube_place_new_simreal_0827`, que incluye demostraciones de pick-and-place en simulación y en el robot real SO-101. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El entrenamiento se llevó a cabo con la librería LeRobot, que gestiona el pipeline de datos, entrenamiento y evaluación.

## Capacidades

- Generacion de acciones de control para robots manipuladores, concretamente tareas de pick-and-place con el brazo SO-101.
- Procesamiento de observaciones visuales (imagenes de camara) para decidir la siguiente accion.
- Soporte multitarea: el modelo ha sido entrenado para multiples tareas de colocacion de cubos, segun el nombre del dataset (`cube_place`).
- Transferencia sim-to-real: entrenado con datos de simulacion y reales, lo que permite su despliegue en el robot fisico.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y registro de datos de Hugging Face.
- No se especifican capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural generico.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo SO-101 para recoger y colocar objetos (por ejemplo, viales en un rack) de forma autonoma, reduciendo la intervencion humana en lineas de montaje.
- Investigacion en robotica de bajo coste: al ser un modelo compacto (450M de parametros), puede ejecutarse en GPUs de consumo, lo que permite a laboratorios academicos experimentar con VLA sin grandes presupuestos.
- Desarrollo de sistemas de manipulacion flexible: gracias a su entrenamiento multitarea, puede adaptarse a variaciones en la posicion de los objetos o en el entorno sin necesidad de reprogramar.
- Prototipado rapido de politicas robóticas: usando LeRobot, los desarrolladores pueden cargar el modelo, evaluarlo en simulacion y desplegarlo en el robot real con pocas lineas de codigo.
- Educacion y formacion en robotica: sirve como ejemplo practico de entrenamiento sim-to-real y de uso de VLA en plataformas accesibles como SO-101.
- Benchmarking de modelos VLA compactos: puede utilizarse como referencia para comparar el rendimiento de otros modelos de tamaño similar en tareas de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como tasa de exito en tareas, MMLU, HumanEval u otros indicadores de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al tratarse de un modelo de 450M de parametros, se estima que puede caber en GPUs con 8-12 GB de VRAM en precision FP16 (inferencia). No se confirma oficialmente.
- GPU recomendadas: no se especifican, pero por el tamano del modelo, GPUs como RTX 3060, RTX 4060 o superiores serian suficientes para inferencia. Para entrenamiento, se recomienda al menos una GPU con 16-24 GB de VRAM.
- Compatibilidad con consumer GPU: probablemente si, dado el diseno de SmolVLA para hardware de consumo, pero no se confirma en la documentacion.
- Opciones de despliegue: LeRobot (inferencia y evaluacion), posiblemente compatible con vLLM u otros servidores de inferencia, aunque no se menciona. El formato safetensors permite su uso con librerias estandar de PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos VLA como OpenVLA (7B parametros) o RT-2 (mucho mayor). Se puede indicar que SmolVLA es significativamente mas pequeño (450M vs 7B de OpenVLA), lo que reduce los requisitos de hardware, pero no se conocen diferencias de rendimiento en tareas de manipulacion. La licencia Apache-2.0 es mas permisiva que la de algunos modelos propietarios. No se dispone de mas informacion.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al ser un modelo entrenado en un dataset concreto (pick-and-place de cubos), su generalizacion a otras tareas o entornos puede ser limitada.
- Riesgo de alucinacion: en el contexto de acciones robóticas, el modelo podria generar acciones incorrectas si las observaciones visuales son atipicas o ruidosas. No se ha evaluado su robustez ante entradas adversas.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero al ser un modelo de accion, no procesa texto largo; su entrada principal son imagenes.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener la atribucion y aviso de licencia.
- Caveat para produccion: el modelo ha sido entrenado para un robot especifico (SO-101) y un dataset concreto; su despliegue en otros robots o tareas requeriria reentrenamiento o adaptacion. No se garantiza seguridad en entornos no controlados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaenn/smolvla_so101_multitask_simreal_fullft_0901
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset utilizado: https://huggingface.co/datasets/Chaenn/so101_cube_place_new_simreal_0827
- Guia de entrenamiento sim-to-real con SO-101 (NVIDIA): https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html
