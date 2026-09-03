# BlackCatRoboticsAI/g1-sonic-base

## Resumen

GEAR-SONIC es un modelo de control de cuerpo completo para robots humanoides, desarrollado por NVIDIA y publicado en el repositorio BlackCatRoboticsAI/g1-sonic-base. Se trata de un modelo de comportamiento (behavior foundation model) que proporciona una política unificada para tareas de locomoción y manipulación en el robot Unitree G1, un humanoide de 29 grados de libertad. El modelo recibe observaciones (estado de articulaciones, IMU, referencias de movimiento) y genera objetivos de posición articular de 29 dimensiones a una frecuencia de control de 50 Hz.

El modelo se distribuye en formato ONNX, con tres variantes (default, low_latency y sonic_v1_1) que se diferencian en el horizonte de planificación (lookahead) y en el caso de uso (teleoperación, ejecución de VLA, etc.). Está pensado para despliegue en hardware embebido como Jetson, con una pila de inferencia en C++. Su relevancia radica en ofrecer un control unificado de todo el cuerpo (caminar, correr, saltar, agacharse, manipulación bimanual) a partir de un único modelo, lo que simplifica el desarrollo de aplicaciones robóticas avanzadas.

La licencia es la NVIDIA Open Model License, que permite uso comercial con atribución. El repositorio tiene un tamaño de 2.3 GB y fue creado en septiembre de 2026. No se dispone de información pública sobre el número de parámetros, la arquitectura interna detallada ni los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder + decoder + planner (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX, sin cuantizacion documentada) |
| Idiomas soportados | no aplica (modelo de control robotico) |
| Licencia | NVIDIA Open Model License (uso comercial permitido con atribucion) |
| Formato de pesos | ONNX (encoder, decoder, planner) |

## Arquitectura y entrenamiento

La model card describe el modelo como un sistema compuesto por tres componentes ONNX: un encoder, un decoder y un planner cinematico. El encoder procesa las observaciones (vector de 1762 dimensiones en el ejemplo de uso) y genera tokens internos; el decoder produce las acciones de control (objetivos de posicion articular de 29 dimensiones). El planner cinematico se encarga de la locomocion en tiempo real con multiples estilos de movimiento. No se proporcionan detalles sobre la arquitectura interna (tipo de red, numero de capas, atencion, etc.) ni sobre el proceso de entrenamiento (datos, tokens, tecnicas de RLHF o DPO). El modelo esta disenado para operar a 50 Hz y admite variantes con diferente lookahead temporal (80 ms para teleoperacion de baja latencia, 200 ms para uso general).

## Capacidades

- Control unificado de cuerpo completo: una unica politica gestiona caminar, correr, gatear, saltar y manipular objetos.
- Teleoperacion en tiempo real mediante casco VR (PICO), incluyendo movimientos laterales, arrodillarse, levantarse y saltos.
- Manipulacion bimanual y transferencia de objetos entre manos.
- Control multimodal: acepta entradas de teclado, mando, VR y planificacion de alto nivel.
- Despliegue en hardware embebido: pila de inferencia en C++ compatible con NVIDIA Jetson.
- Variantes especializadas: low_latency para teleoperacion y ejecucion de VLA (vision-language-action), sonic_v1_1 con normalizacion de orientacion para teleoperacion.

## Casos de uso

- Teleoperacion de robot humanoide para inspeccion industrial: un operador controla el Unitree G1 mediante un casco VR, realizando tareas de inspeccion visual en entornos peligrosos. La variante low_latency (80 ms de lookahead) minimiza el retardo entre el movimiento del operador y el del robot.
- Investigacion en control de locomocion: el modelo sirve como base para estudiar politicas de caminar, correr y saltar en humanoides, permitiendo a los investigadores comparar con metodos clasicos de control.
- Manipulacion bimanual en laboratorio: el robot puede recoger, transferir y colocar objetos con ambas manos, util para experimentos de robotica colaborativa.
- Desarrollo de sistemas VLA (vision-language-action): la variante low_latency se integra con modelos de lenguaje y vision para ejecutar instrucciones de alto nivel en el robot.
- Demostraciones de robotica educativa: el modelo permite a estudiantes y desarrolladores experimentar con control de cuerpo completo sin necesidad de disenar controladores desde cero.
- Pruebas de robustez en entornos exteriores: al soportar multiples estilos de locomocion, el robot puede adaptarse a terrenos variados, util para evaluaciones de campo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento (exito en tareas, precision de seguimiento, etc.) ni comparaciones con otros modelos de control.

## Requisitos de hardware

- No se especifica VRAM estimada para inferencia en la informacion disponible.
- El modelo se distribuye en ONNX, por lo que puede ejecutarse en cualquier runtime compatible (ONNX Runtime, TensorRT, etc.).
- La model card menciona despliegue en NVIDIA Jetson, lo que sugiere que puede ejecutarse en hardware embebido de gama media, aunque no se indican modelos concretos de GPU.
- No se proporcionan datos de latencia ni throughput. La frecuencia de control es de 50 Hz, lo que implica un presupuesto de tiempo de 20 ms por ciclo de inferencia.
- Opciones de despliegue: ONNX Runtime, TensorRT, pila C++ personalizada. No se menciona compatibilidad con vLLM, llama.cpp u Ollama (no es un modelo de lenguaje).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (control de cuerpo completo para humanoides) dentro de los datos proporcionados. No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos o comportamientos no deseados del modelo.
- Al ser un modelo de control, no genera texto ni tiene riesgo de alucinacion linguistica, pero puede producir acciones inseguras si las observaciones estan fuera del rango de entrenamiento.
- La licencia NVIDIA Open Model License permite uso comercial con atribucion, pero es recomendable revisar los terminos completos en el enlace proporcionado.
- El modelo esta disenado especificamente para el robot Unitree G1 (29 grados de libertad); su transferencia a otros robots requeriria adaptaciones no documentadas.
- No se especifican limites de contexto temporal ni de memoria de estados, aunque la variante low_latency sugiere un lookahead de 80 ms, lo que puede limitar la planificacion a corto plazo.
- La ausencia de benchmarks publicos dificulta evaluar su rendimiento relativo frente a otras soluciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BlackCatRoboticsAI/g1-sonic-base
- Paper arXiv: https://arxiv.org/abs/2511.07820 (referenciado en la model card como arXiv:2511.07820)
- Licencia NVIDIA Open Model License: https://developer.download.nvidia.com/licenses/NVIDIA-OneWay-Noncommercial-License-22Mar2022.pdf
