# snupilab/theta-bench-groot-real-g1-91

## Resumen

`snupilab/theta-bench-groot-real-g1-91` es un checkpoint de politica robotica (vision-lenguaje-accion) publicado dentro del programa THETA Bench, construido sobre la familia GR00T N1.7 (tag `Gr00tN1d7`) y distribuido por el usuario `snupilab`. No es un modelo de lenguaje de proposito general: es un resultado de entrenamiento orientado a control de un robot humanoide Unitree G1 en tareas reales de manipulacion. El repositorio contiene el checkpoint final validado de una etapa de entrenamiento adicional sobre hardware real, con 91 demostraciones registradas a 20 Hz.

El punto de partida es el checkpoint de simulacion `snupilab/theta-bench-groot-sim-3003`, ya entrenado durante 40.000 actualizaciones en simulacion, sobre el que se aplican 5.000 actualizaciones adicionales con las 91 demostraciones reales del dataset `snupilab/theta-bench-teleop`. La relevancia practica esta en el ajuste sim-a-real: se parte de un modelo entrenado en simulador y se adapta a un robot fisico con un volumen de datos muy reducido.

El modelo tiene 3.144.016.000 parametros (~3,14 mil millones) en formato safetensors, ocupa 6,9 GB en el repositorio y declara 32 dimensiones de estado, 35 dimensiones de accion supervisadas a 20 Hz y un horizonte de 40 frames. La model card no publica puntuacion de evaluacion alguna y advierte explicitamente de que la publicacion del checkpoint no implica ninguna reclamacion de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) de la familia GR00T N1.7; requiere pesos y procesador del backbone `nvidia/Cosmos-Reason2-2B` (revision `9ce19a195e423419c349abfc86fd07178b230561`); el detalle interno no se describe en la model card |
| Parametros totales | 3.144.016.000 (~3,14 mil millones) |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible (horizonte de accion: 40 frames a 20 Hz, es decir ~2 s) |
| Tipos de cuantizacion | no disponible; solo se distribuyen pesos en safetensors, sin versiones cuantizadas documentadas |
| Idiomas soportados | en (instrucciones en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,9 GB |
| Pipeline declarado | robotics |
| Dimensiones de estado | 32 |
| Dimensiones de accion supervisadas | 35 (acciones reales del G1, ejecutadas como joint-target) |
| Frecuencia de control | 20 Hz |
| Modelo base | `snupilab/theta-bench-groot-sim-3003` (finetune) |
| Dataset de entrenamiento | `snupilab/theta-bench-teleop`, revision `47eca9322bb53fa1c685363271a87d2e414cb0e8` |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna. Por las etiquetas del repositorio (`Gr00tN1d7`, `robotics`) y por la dependencia obligatoria de los pesos y el procesador de `nvidia/Cosmos-Reason2-2B`, se trata de un modelo vision-lenguaje-accion de la familia GR00T N1.7, en el que un backbone de vision-lenguaje se combina con una cabeza de accion especifica del robot. Esta descripcion es una inferencia a partir de los metadatos: el autor no publica detalles de capas, atencion ni mecanismo de generacion de acciones. Los 3,14 mil millones de parametros corresponden al checkpoint completo almacenado en safetensors.

El entrenamiento se realizo en dos etapas. La inicializacion es el checkpoint validado de simulacion en la actualizacion 40.000, al que se anaden 5.000 actualizaciones adicionales con 91 demostraciones reales del G1. La configuracion registrada es: 8 GPU, batch por GPU de 16, batch global de 128, acumulacion de gradiente 1 y 4 condiciones por batch global. Las cuatro condiciones reales son StickMove Standard/Reasoning y HookRetrieve Standard/Reasoning. La infraestructura usa optimizadores de modelo independientes y ejecucion compartida de GPU mediante MPS, con publicacion desde un cargador de CPU tras la validacion final del checkpoint. No se documenta el numero total de tokens ni si hubo fases de RLHF o DPO, algo que en un modelo de control motor no aplica del mismo modo que en un LLM.

## Capacidades

- Generacion de acciones de manipulacion para un robot humanoide G1 real: 35 dimensiones de accion supervisadas (joint-target) a 20 Hz con horizonte de 40 frames.
- Ejecucion de cuatro tareas concretas de manipulacion: StickMove Standard, StickMove Reasoning, HookRetrieve Standard y HookRetrieve Reasoning.
- Procesamiento conjunto de estado (32 dimensiones) y observaciones visuales, propio de un modelo VLA.
- Transferencia sim-a-real: el checkpoint se ajusto desde una politica de simulacion hacia el hardware real con solo 91 demostraciones.
- Condicionamiento por tarea/instruccion a traves del backbone de vision-lenguaje, con distincion entre modos "Standard" y "Reasoning".
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de agentes de software: el modelo es una politica de control, no un agente conversacional.
- Capacidades multilingues: la unica lengua declarada es el ingles.
- No se declaran capacidades de vision de proposito general, audio ni modo "thinking" independiente.

## Casos de uso

- Manipulacion real con humanoide Unitree G1: desplegar el checkpoint mediante `Gr00tPolicy` con el adaptador de joint-target de hardware correspondiente para ejecutar StickMove y HookRetrieve sobre el robot fisico a 20 Hz.
- Ajuste fino sim-a-real con pocos datos: usar este repositorio como referencia de que 91 demostraciones reales y 5.000 actualizaciones bastan para adaptar una politica de simulacion, util para planificar campanas de recogida de datos.
- Teleoperacion y recogida de datos: el dataset subyacente (`theta-bench-teleop`, revision fijada) sirve como base reproducible para entrenar variantes o comparar tecnicas de imitacion.
- Evaluacion de transferencia de politica: comparar sistematicamente el checkpoint de simulacion `theta-bench-groot-sim-3003` frente a este checkpoint real para medir la degradacion o mejora en tareas StickMove/HookRetrieve.
- Investigacion en politicas VLA para robotica: usar el checkpoint como punto de partida para estudiar el efecto del ajuste con datos reales en un modelo de 3,14 mil millones de parametros.
- Reproducibilidad de experimentos THETA Bench: al estar fijadas la revision del dataset y la configuracion de entrenamiento (8 GPU, batch global 128, 5.000 actualizaciones), permite replicar la etapa de ajuste real.
- Base para nuevas tareas sobre el mismo robot: reentrenar la cabeza de accion con el backbone `Cosmos-Reason2-2B` para condiciones adicionales, siempre que se mantenga el adaptador de hardware compatible.
- Validacion de infraestructura de despliegue robótico: comprobar que el pipeline nativo (Gr00tPolicy + adaptador real) funciona antes de escalar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica de forma explicita que la publicacion del checkpoint no conlleva ninguna puntuacion de evaluacion ("No evaluation score is claimed by checkpoint publication"). No existen datos de exito de tarea, tasas de exito por condicion, ni comparaciones numericas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 6,3 GB solo para pesos, mas activaciones y buffers del backbone de vision; en fp32, unos 12,6 GB. El repositorio ocupa 6,9 GB, lo que sugiere pesos en precision reducida de 16 bits.
- GPU recomendadas: el entrenamiento documentado se ejecuto en 8 GPU (modelo y numero no especificados en la model card). Para inferencia, una GPU con 16-24 GB de VRAM es suficiente en terminos de peso del modelo; una A100 o H100 es lo mas razonable si se necesita margen y baja latencia.
- Viabilidad en GPU de consumo: si, cabe en tarjetas con 16 GB o mas, como RTX 4090 (24 GB) o RTX 4080 (16 GB), siempre que el runtime nativo de GR00T lo permita. No se documenta soporte en GPUs de gama baja con menos de 12 GB.
- Restriccion de latencia: el control se registra a 20 Hz, lo que implica un presupuesto de aproximadamente 50 ms por paso de inferencia (calculo derivado de la frecuencia, no dato publicado).
- Opciones de despliegue: exclusivamente el cargador nativo `Gr00tPolicy` con las modalidades reales guardadas y el adaptador de joint-target de hardware. No se declara compatibilidad con Transformers generico, vLLM, llama.cpp, Ollama ni TGI. El servidor de simulacion `_groot_server`, que impone acciones de 36 dimensiones, es incompatible con este checkpoint real.
- Dependencias obligatorias: pesos y procesador de `nvidia/Cosmos-Reason2-2B` en la revision `9ce19a195e423419c349abfc86fd07178b230561`, que deben mantenerse disponibles por separado.
- Throughput y latencia medidos: no disponibles.

## Comparativa con modelos similares

No se dispone de datos publicados de otros modelos comparables dentro de la informacion proporcionada (benchmarks, numero de parametros de alternativas o licencias). La unica comparacion posible con los datos disponibles es con el propio linaje del modelo:

| Modelo | Parametros | Dimension de accion | Contexto / horizonte | Licencia | Relacion |
|---|---|---|---|---|---|
| `snupilab/theta-bench-groot-real-g1-91` | 3.144.016.000 | 35 (G1 real) | 40 frames a 20 Hz | no disponible | Checkpoint final tras ajuste real |
| `snupilab/theta-bench-groot-sim-3003` | no disponible | no disponible (el servidor de simulacion exige 36 dimensiones) | no disponible | no disponible | Modelo base e inicializacion (40.000 actualizaciones en simulacion) |
| `nvidia/Cosmos-Reason2-2B` | no disponible | no aplica (solo backbone VLM) | no disponible | no disponible | Dependencia obligatoria de pesos y procesador |

No se dispone de informacion verificada sobre alternativas de la misma categoria (por ejemplo, otras politicas VLA para humanoides) en los materiales facilitados, por lo que no se incluyen comparaciones adicionales.

## Limitaciones y advertencias

- La model card no declara ningun resultado de evaluacion: no hay evidencia publicada de tasa de exito en las cuatro condiciones reales.
- Compatibilidad muy restringida: solo funciona con el cargador nativo `Gr00tPolicy`, las modalidades reales guardadas y el adaptador de joint-target de hardware correspondiente. Un adaptador de simulacion no debe asumirse compatible.
- El servidor de simulacion `_groot_server` actual impone acciones de 36 dimensiones y es incompatible con las 35 dimensiones de este checkpoint real.
- Requiere mantener como dependencia externa los pesos y el procesador de `nvidia/Cosmos-Reason2-2B` en una revision concreta; un cambio de revision puede romper la carga.
- Licencia no disponible: no se puede confirmar la legalidad de un uso comercial. Es un riesgo relevante para produccion.
- Sesgos conocidos: no documentados. Al entrenarse con 91 demostraciones de teleoperacion, cabe esperar sensibilidad a la distribucion de esas demostraciones concretas, pero esto no se afirma en la model card.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto libre; en su lugar existe riesgo de acciones incorrectas fuera de la distribucion de entrenamiento, no cuantificado.
- Idiomas: solo ingles declarado; no hay soporte multilingue documentado.
- Volumen de datos muy reducido (91 demostraciones) y solo cuatro condiciones, lo que limita la generalizacion a otras tareas o entornos.
- Los resultados de la busqueda web facilitados no contienen informacion relevante sobre este modelo (corresponden a un establecimiento de restauracion), por lo que no aportan datos verificables.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/snupilab/theta-bench-groot-real-g1-91
- Modelo base (simulacion): https://huggingface.co/snupilab/theta-bench-groot-sim-3003
- Dataset de teleoperacion (revision fijada): https://huggingface.co/datasets/snupilab/theta-bench-teleop/tree/47eca9322bb53fa1c685363271a87d2e414cb0e8/hardware
- Backbone requerido: https://huggingface.co/nvidia/Cosmos-Reason2-2B (revision `9ce19a195e423419c349abfc86fd07178b230561`)
- Resultados de busqueda web relevantes: no disponible (la busqueda no devolvio ningun recurso relacionado con el modelo)
