# omkarpatil/ffw_sg2_pick-blue-cylinder-left-arm_smolvla_nonorm_noproprio

## Resumen

Este modelo es un fine-tuning de `lerobot/smolvla_base` para una tarea robótica concreta: recoger un cilindro azul con el brazo izquierdo del robot semi-humanoide FFW-SG2 de ROBOTIS. Desarrollado por omkarpatil, el ajuste se realizó con LeRobot 0.6.1 sobre el dataset `omkarpatil/pick-blue-cylinder-left-arm`, que contiene demostraciones del brazo izquierdo a 15 fps. El checkpoint publicado corresponde al paso 020000 de una ejecución de 30k pasos, con batch 64 y sin aumento de imágenes.

La relevancia de este modelo radica en su enfoque de entrenamiento sin normalización del dataset: el normalizador es identidad, por lo que el flujo matching opera directamente en espacio articular bruto (radianes). Esto está pensado para permitir la composición de políticas en el espacio de scores entre brazos. Además, es un modelo solo-visión: la observación del estado se anuló durante el entrenamiento, por lo que en inferencia debe alimentarse un vector cero de 22 dimensiones. La arquitectura base es SmolVLA, un modelo de acción-visión-lenguaje (VLA) de tamaño reducido, aunque los parámetros exactos de este fine-tuning no se especifican en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer con flujo matching) |
| Parametros totales | no disponible (modelo base: lerobot/smolvla_base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo orientado a robotica, no a lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base`, un VLA que combina un codificador de vision SigLIP con un transformer de flujo matching para generar acciones articulares. En este fine-tuning, la entrada visual consiste en tres camaras (`cam_left_head`, `cam_left_wrist`, `cam_right_wrist`) renombradas a `camera1..3`, procesadas con la transformacion fija del modelo: decodificacion /255, padding-resize a 512 y normalizacion ×2−1. La salida es un chunk de 50 acciones de 16 dimensiones (7 articulaciones del brazo izquierdo + gripper izquierdo + 7 articulaciones del brazo derecho + gripper derecho) en radianes absolutos, a 15 Hz.

El entrenamiento se realizo con LeRobot 0.6.1 (submodulo cyclo_intelligence) sobre el dataset de demostraciones del brazo izquierdo. No se aplico normalizacion del dataset: el normalizador es identidad (media 0, desviacion 1), de modo que el flujo matching opera en espacio articular bruto. Esta decision busca facilitar la composicion de politicas entre brazos en el espacio de scores. Ademas, la observacion del estado se anulo (vector cero) durante el entrenamiento, convirtiendo al modelo en puramente visual. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento posterior.

## Capacidades

- Ejecucion de la tarea especifica "recoger el cilindro azul" con el brazo izquierdo del robot FFW-SG2.
- Control articular absoluto de 16 grados de libertad (brazos y grippers) mediante flujo matching.
- Procesamiento de tres camaras simultaneas (cabeza izquierda, muneca izquierda, muneca derecha) para percepcion visual.
- Generacion de chunks de acciones de 50 pasos a 15 Hz, lo que permite movimientos suaves y anticipatorios.
- Inferencia solo-visual: no requiere retroalimentacion de estado, simplificando el despliegue en entornos donde el estado no esta disponible o es ruidoso.
- Disenado para composicion de politicas: al operar en espacio articular bruto sin normalizacion, puede combinarse con otras politicas del mismo estilo para tareas bimanuales.

## Casos de uso

- Automatizacion de tareas de picking en entornos industriales: el modelo puede integrarse en un robot FFW-SG2 para recoger objetos especificos (en este caso, un cilindro azul) de una superficie, sustituyendo o complementando la programacion manual.
- Aprendizaje por demostracion en robotica: sirve como ejemplo de como adaptar un VLA base a una tarea concreta con pocas demostraciones, usando LeRobot y un dataset propio.
- Composicion de politicas bimanuales: al no usar normalizacion, el modelo puede combinarse con otro fine-tuning para el brazo derecho, permitiendo coordinar ambos brazos en tareas que requieren manipulacion simultanea.
- Investigacion en VLA sin dependencia del estado: al anular la observacion del estado, este modelo permite estudiar hasta que punto un VLA puede operar solo con vision, lo que es util para entornos sin encoders de estado fiables.
- Prototipado rapido en robotica: con un repo de 0.9 GB y licencia Apache-2.0, es facil de descargar y probar en simulacion o en el robot real, acelerando el desarrollo de nuevas habilidades.
- Benchmark de generalizacion: el checkpoint puede usarse como referencia para comparar tecnicas de fine-tuning, normalizacion o aumento de datos en VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como tasa de exito, error de seguimiento de trayectoria ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que el modelo base SmolVLA es de tamano reducido (el repo pesa 0.9 GB en safetensors), es probable que quepa en GPUs consumer de 8-12 GB, pero no se confirma en la documentacion.
- GPU recomendadas: no disponible. Se sugiere una GPU con al menos 8 GB de VRAM para inferencia en tiempo real, aunque no hay datos oficiales.
- Compatibilidad con consumer GPU: probablemente si, dado el tamano del modelo, pero no verificado.
- Opciones de despliegue: al usar LeRobot, el modelo puede cargarse con la libreria `lerobot` y ejecutarse en el robot. Para inferencia en tiempo real, se puede usar el pipeline de LeRobot o exportar a ONNX/TensorRT, aunque no se documenta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (fine-tunings de SmolVLA para tareas roboticas especificas). La unica referencia es el modelo base `lerobot/smolvla_base`, pero no hay datos de rendimiento relativo.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para la tarea "recoger el cilindro azul" con el brazo izquierdo; no generaliza a otros objetos, colores o configuraciones sin reentrenamiento.
- Es solo-visual: la observacion del estado se anulo durante el entrenamiento, por lo que alimentar un vector de estado real (no cero) produce una distribucion fuera de lo esperado y puede degradar el rendimiento.
- La ausencia de normalizacion implica que las acciones se generan en radianes brutos, lo que puede dificultar la transferencia a otros robots con cinematica diferente.
- No se han publicado evaluaciones de robustez ante cambios de iluminacion, oclusiones o variaciones de la escena.
- El checkpoint corresponde a un paso intermedio (020000 de 30000); no se indica si es el mejor segun alguna metrica de validacion.
- La licencia Apache-2.0 permite uso comercial, pero el modelo depende del robot FFW-SG2 de ROBOTIS, cuyas especificaciones y disponibilidad comercial deben verificarse con el fabricante.
- No hay informacion sobre sesgos o alucinaciones, al tratarse de un modelo de control motor y no de generacion de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omkarpatil/ffw_sg2_pick-blue-cylinder-left-arm_smolvla_nonorm_noproprio
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de demostraciones: https://huggingface.co/datasets/omkarpatil/pick-blue-cylinder-left-arm
- Documentacion del robot FFW-SG2 (ROBOTIS): https://docs.robotis.com/docs/systems/aiworker/introduction/
- Especificaciones del FFW-SG2 en RoboAtlas: https://www.roboatlas.ai/en-US/products/ai-worker/ffw-sg2
- Pagina del AI Worker de ROBOTIS: https://robotis.us/ai-worker/
