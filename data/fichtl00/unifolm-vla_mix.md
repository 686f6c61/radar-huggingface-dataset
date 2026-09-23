# Fichtl00/Unifolm-VLA_mix

## Resumen

Unifolm-VLA_mix es un ajuste fino completo del modelo UnifoLM-VLA (serie UnifoLM de Unitree Robotics) especializado en la tarea de apilado de bloques (block-stacking) con el robot humanoide Unitree G1 equipado con manos Dex3. Lo publica Fabian Fichtl (usuario Fichtl00) y su particularidad es que se ha entrenado sobre una mezcla de demostraciones reales y demostraciones sintéticas generadas en simulacion, con una ponderacion relativa de 3:1 (aproximadamente 75 % real y 25 % sintetico por epoca).

El modelo parte del backbone VLM unitreerobotics/UnifoLM-VLM-Base, construido sobre Qwen2.5-VL, y se ha sometido a un full finetune sin congelar el backbone, anadiendo una cabeza de accion tipo DiT que predice acciones en espacio articular de 28 dimensiones con un horizonte de 16 pasos. El entrenamiento se realizo en el cluster KISSKI HPC con 4 GPU A100 de 80 GB, DeepSpeed ZeRO Stage 2 y precision bf16, durante 30.000 pasos.

Su relevancia es fundamentalmente metodologica: sirve como pieza de comparacion frente al modelo hermano entrenado solo con datos reales (Fichtl00/Unifolm-VLA_real) para estudiar si la simulacion aporta valor en el ajuste fino de politicas VLA para manipulacion humanoide. No es un modelo de proposito general ni presenta todavia resultados de benchmarks publicados ni validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA): backbone VLM basado en Qwen2.5-VL mas cabeza de accion tipo DiT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se distribuye como directorios de checkpoints: `final_model/` y `checkpoints/steps_XXXX`) |
| Modelo base | unitreerobotics/UnifoLM-VLM-Base (Qwen2.5-VL) |
| Espacio de accion/estado | 28 dimensiones en espacio articular (14 articulaciones de brazo + 14 de mano Dex3 por lado, sin cintura) |
| Horizonte de accion | 16 |
| Pipeline declarado | robotics |
| Fecha de publicacion en HuggingFace | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de UnifoLM-VLA: un modelo de vision-lenguaje-accion que parte de un VLM preentrenado y se somete a preentrenamiento continuado con datos de manipulacion robotica para convertirse en un "cerebro encarnado". En este caso concreto, el backbone es unitreerobotics/UnifoLM-VLM-Base (basado en Qwen2.5-VL) y la generacion de acciones se realiza mediante una cabeza DiT, tal como refleja la metrica de perdida reportada (`action_dit_loss`). A diferencia de otros ajustes que congelan el backbone, aqui se realiza un full finetune con el backbone descongelado, motivo por el cual fue necesario ejecutar el entrenamiento en infraestructura HPC.

Los datos de entrenamiento combinan dos fuentes mezcladas con `data_mix` y una ponderacion de muestreo relativa 3:1: el dataset real unitreerobotics/G1_Dex3_BlockStacking_Dataset y el dataset sintetico Fichtl00/Cube_Stacking_synth_jointspace, generado en simulacion con Isaac Lab y con un layout de estado/accion en espacio articular de 28 dimensiones equivalente al real (14 articulaciones de brazo + 14 de mano Dex3 por lado, sin cintura). La configuracion de entrenamiento incluye DeepSpeed ZeRO Stage 2, bf16, tamano de batch global 24 (6 por dispositivo en 4 GPU), 30.000 pasos y tasa de aprendizaje 4e-5. La perdida final reportada en el paso 30.000 es `action_dit_loss = 0.0076` con `mse_score = 0.0010`. No se documentan en la informacion disponible fases de RLHF o DPO, ni el numero total de tokens vistos ni la composicion completa del dataset.

## Capacidades

- Prediccion de acciones motoras en espacio articular de 28 dimensiones para el robot Unitree G1 con manos Dex3, con horizonte de 16 pasos.
- Ejecucion de la tarea especifica de apilado de bloques (block-stacking) aprendida por imitacion a partir de demostraciones reales y sinteticas.
- Comprension visio-linguistica heredada del backbone Qwen2.5-VL de UnifoLM-VLM-Base, orientada a la interpretacion de escenas y a la conexion entre lenguaje e interaccion fisica.
- Generalizacion potencial a variaciones ligeras de la tarea gracias a la inclusion de datos sinteticos de simulacion (comportamiento sim-to-real, no cuantificado en la informacion disponible).
- Integracion con infraestructura de robot real: existe un adaptador de inferencia DDS/SHM publicado por el mismo autor para conectar el modelo con el robot.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible mas alla del componente de vision propio del backbone VLM.

## Casos de uso

- Control de manipulacion en el Unitree G1: el modelo genera comandos articulares de 28 dimensiones con horizonte 16, por lo que puede cerrarse en bucle con el controlador del robot para ejecutar la tarea de apilado de bloques en laboratorio o en demostraciones.
- Investigacion en sim-to-real para VLA: al existir un gemelo entrenado solo con datos reales (Unifolm-VLA_real), este modelo permite medir de forma controlada si anadir un 25 % de datos sinteticos de Isaac Lab mejora la transferencia al robot fisico.
- Estudio de recetas de ajuste fino con backbone descongelado: sirve como referencia reproducible (DeepSpeed ZeRO 2, bf16, batch global 24, 30.000 pasos) para comparar coste computacional frente a estrategias con backbone congelado.
- Seleccion de checkpoints en entrenamientos largos: la publicacion incluye checkpoints cada 2.000 pasos hasta 30.000, lo que permite analizar curvas de aprendizaje, sobreajuste y estabilidad de la perdida DiT sin reentrenar.
- Despliegue en robot real mediante el adaptador DDS/SHM: el repositorio de inferencia del autor facilita conectar los checkpoints al G1 usando comunicacion DDS y memoria compartida, un caso de uso directo para equipos con este hardware.
- Generacion de datos sinteticos y aumentacion de datasets roboticos: el dataset sintetico asociado y el pipeline de mezcla `data_mix` pueden reutilizarse como plantilla para crear demostraciones en Isaac Lab con el mismo layout de 28 dimensiones.
- Evaluacion comparativa de politicas VLA en tareas de contacto: el apilado de bloques exige precision en el agarre con la mano Dex3, por lo que el modelo es util como banco de pruebas de robustez ante variaciones de posicion y friccion.
- Reproduccion academica en clusters HPC: dado que el entrenamiento se ejecuto en 4x A100 80 GB con DeepSpeed, el modelo documenta un caso real de entrenamiento de VLA a esa escala para grupos con acceso a infraestructura similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento en el paso 30.000:

| Metrica | Valor |
|---|---|
| action_dit_loss (paso 30.000) | 0,0076 |
| mse_score (paso 30.000) | 0,0010 |

No se proporcionan resultados de exito en tarea real, tasas de exito en simulacion, comparaciones con el modelo entrenado solo con datos reales ni evaluaciones tipo MMLU, HumanEval o GSM8K, que ademas no aplican al proposito de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El numero de parametros del backbone no se especifica en la informacion proporcionada, por lo que no es posible dar una cifra fiable.
- GPU recomendadas para entrenamiento: 4x NVIDIA A100 de 80 GB, configuracion efectivamente utilizada en el cluster KISSKI HPC con DeepSpeed ZeRO Stage 2 y bf16.
- GPU recomendadas para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no disponible. Depende del tamano del backbone de UnifoLM-VLM-Base, que no se detalla.
- Opciones de despliegue: el autor publica un adaptador de inferencia DDS/SHM especifico para este modelo (repositorio `Fichtl00/unifolm-vla-inference-dds-shm-adapter`), orientado a la comunicacion con el robot Unitree G1. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Datos de entrenamiento | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| Fichtl00/Unifolm-VLA_mix | UnifoLM-VLM-Base (Qwen2.5-VL) | 75 % real + 25 % sintetico (mix 3:1) | Block-stacking, Unitree G1 + Dex3 | Apache 2.0 | Publicado, 0 descargas y 0 likes en la informacion disponible |
| Fichtl00/Unifolm-VLA_real | UnifoLM-VLM-Base (Qwen2.5-VL) | Solo datos reales | Block-stacking, Unitree G1 + Dex3 | No especificada en la informacion disponible | Modelo hermano de comparacion directa |
| unitreerobotics/UnifoLM-VLA (modelo oficial) | UnifoLM-VLM-Base | Preentrenamiento continuado con datos de manipulacion robotica | Manipulacion humanoide de proposito general | No especificada en la informacion disponible | Modelo fundacional de la serie UnifoLM |

No se dispone de datos de rendimiento comparativo entre estos tres modelos en la informacion proporcionada, por lo que la comparativa se limita a base, datos y tarea.

## Limitaciones y advertencias

- Modelo de tarea unica: esta especializado en apilado de bloques con el Unitree G1 y manos Dex3; no es un modelo VLA de proposito general.
- Espacio de accion restringido a 28 dimensiones sin cintura: cualquier configuracion del robot que requiera control de waist queda fuera del alcance del modelo.
- Ausencia total de benchmarks: no hay evidencia publicada de tasa de exito en robot real ni en simulacion, solo perdidas de entrenamiento.
- Sin validacion de la comunidad: el modelo registra 0 descargas y 0 likes en la informacion disponible, por lo que no existe retroalimentacion externa verificable.
- Riesgo de alucinacion heredado del backbone VLM: al tratarse de un modelo vision-lenguaje, la interpretacion de escenas puede ser erronea y propagarse a la politica de accion.
- Brecha sim-to-real no cuantificada: se desconoce hasta que punto los datos sinteticos de Isaac Lab mejoran o degradan el comportamiento en el robot fisico.
- Idiomas y contexto: no se especifica la ventana de contexto ni el soporte idiomatico del backbone, lo que limita planificar interacciones con instrucciones largas o multilingues.
- Licencia: el modelo se publica bajo Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base (UnifoLM-VLM-Base), del dataset real de Unitree y del dataset sintetico antes de un despliegue comercial.
- Requisitos de entrenamiento elevados: reproducir el full finetune exige aproximadamente 4x A100 de 80 GB, lo que descarta su reentrenamiento en hardware de consumo.
- Sin informacion sobre cuantizacion disponible: no se ofrecen versiones GGUF, AWQ, GPTQ ni similares, lo que complica el despliegue en entornos con memoria limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fichtl00/Unifolm-VLA_mix
- Modelo hermano entrenado solo con datos reales: https://huggingface.co/Fichtl00/Unifolm-VLA_real
- Perfil del autor: https://huggingface.co/Fichtl00
- Modelo base VLM: https://huggingface.co/unitreerobotics/UnifoLM-VLM-Base
- Dataset real: https://huggingface.co/datasets/unitreerobotics/G1_Dex3_BlockStacking_Dataset
- Dataset sintetico (Isaac Lab): https://huggingface.co/datasets/Fichtl00/Cube_Stacking_synth_jointspace
- Repositorio oficial de UnifoLM-VLA: https://github.com/unitreerobotics/unifolm-vla
- Adaptador de inferencia DDS/SHM: https://github.com/Fichtl00/unifolm-vla-inference-dds-shm-adapter
- Sitio del proyecto UnifoLM-VLA: https://unigen-x.github.io/unifolm-vla.github.io/
