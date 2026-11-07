# OpenRAL/rskill-pi05-franka_panda-libero_spatial-int8

## Resumen

rskill-pi05-franka_panda-libero_spatial-int8 es un paquete rSkill de OpenRAL que empaqueta el modelo vision-language-action π0.5 (desarrollado por Physical Intelligence) afinado sobre el benchmark LIBERO y cuantizado a int8 mediante LLM.int8 de bitsandbytes. El objetivo del paquete es permitir la ejecucion de un modelo VLA de 3.400 millones de parametros en GPUs de consumo con 8 GB de VRAM, un escenario en el que la version bf16 no cabe (pico de 8,06 GB de memoria de dispositivo).

El modelo base es `lerobot/pi05_libero_finetuned_v044`, un fine-tune de π0.5 sobre LIBERO v0.44 para manipulacion robotica en simulacion con el brazo Franka Panda. La arquitectura combina un backbone PaliGemma de aproximadamente 3 B de parametros con una cabeza de acciones basada en flow-matching, lo que permite generar trayectorias de accion continuas a partir de observaciones visuales e instrucciones en lenguaje natural.

La relevancia de este paquete es doble: por un lado, demuestra una ruta de despliegue de VLAs en hardware asequible; por otro, documenta de forma explicita el coste de esa decision, ya que la cuantizacion int8 reduce la tasa de exito en LIBERO-Spatial del 95 % (bf16) al 62 % y multiplica por 2,6 la latencia por paso. El autor recomienda usar bf16 siempre que haya al menos 9 GB de VRAM disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): backbone PaliGemma ~3 B + cabeza de acciones flow-matching |
| Parametros totales | ~3,4 B (backbone de 3 B segun la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (LLM.int8 / bitsandbytes `Linear8bitLt`), bf16 (via override), NF4 4-bit (descartado por perdida de rendimiento), FP8 via TensorRT (openral-pro) |
| Idiomas soportados | en |
| Licencia | permissive-research (Physical Intelligence); uso comercial requiere acuerdo con el proveedor |
| Formato de pesos | safetensors (checkpoint bf16 cuantizado en carga; no hay pack pre-cuantizado) |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre el backbone PaliGemma de aproximadamente 3 B de parametros, que procesa imagenes y texto, y una cabeza de acciones basada en flow-matching que genera trayectorias de accion continuas para el robot. El fine-tune se realizo sobre el benchmark LIBERO (version v0.44), concretamente sobre la suite LIBERO-Spatial, con el embodiment Franka Panda. El modelo base es `lerobot/pi05_libero_finetuned_v044`, a su vez derivado de `lerobot/pi05_base`.

La innovacion tecnica del paquete no esta en el entrenamiento sino en el despliegue: la cuantizacion LLM.int8 se aplica en carga sobre todas las capas Lineales con al menos 4 millones de elementos de peso, partiendo del checkpoint bf16. No existe un pack pre-cuantizado; la conversion ocurre en tiempo de carga. El autor documenta que NF4 4-bit destruye la politica (0/5 en libero_spatial) y que int8 es el minimo viable en 8 GB. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Manipulacion robotica en simulacion: genera acciones continuas para el brazo Franka Panda a partir de observaciones visuales e instrucciones en lenguaje natural.
- Comprension vision-lenguaje: integra el backbone PaliGemma para interpretar escenas e instrucciones.
- Control de politica cerrado (closed-loop): ejecuta tareas de manipulacion en el simulador LIBERO con evaluacion paso a paso.
- Ejecucion en hardware de consumo: funciona en GPUs de 8 GB gracias a la cuantizacion int8 (pico de 6,35 GB).
- Override de precision: permite cambiar a bf16 mediante `OPENRAL_QUANTIZATION_DTYPE=bf16` o `policy_extras.dtype` si hay memoria suficiente.
- Aceleracion con TensorRT: soporte de motor FP8 via openral-pro (`OPENRAL_PI05_TRT=1`, `OPENRAL_PI05_TRT_PRECISION=fp8_bf16_attn`).
- Tool calling / function calling: no disponible.
- Capacidades de agente multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Modo thinking, vision adicional o audio: no disponible.

## Casos de uso

- Evaluacion de VLAs en hardware asequible: permite a investigadores sin acceso a GPUs de datacenter ejecutar un π0.5 afinado en LIBERO sobre una tarjeta de 8 GB, a costa de una tasa de exito del 62 % en lugar del 95 %.
- Prototipado de pipelines de manipulacion robotica: sirve para validar integraciones de OpenRAL con el simulador LIBERO antes de invertir en hardware con mas VRAM.
- Benchmarking de estrategias de cuantizacion: el paquete documenta comparativas medidas entre bf16, int8, NF4 y FP8, util para estudiar el compromiso precision-memoria en VLAs.
- Educacion y demos: el modelo cabe en una GPU de consumo, lo que facilita demostraciones de politicas VLA en cursos y talleres.
- Pruebas de regresion en CI: con una latencia de 24,8 ms por paso en int8, se pueden ejecutar suites cortas de evaluacion en runners modestos.
- Comparacion de runtimes: permite contrastar PyTorch eager (bf16, 190 ms por llamada) frente a TensorRT FP8 (78,9 ms por llamada) con el mismo modelo base.
- Investigacion sobre robustez de cuantizacion: la fuerte variacion por tarea (22 %-82 %) lo convierte en un caso de estudio sobre la sensibilidad de las cabezas de accion a la cuantizacion.

## Benchmarks y rendimiento

Resultados medidos en `libero_spatial`, tareas 0/1/2, seed 42, `max_steps=220`, n=50 por tarea y brazo (300 episodios), en una GB10:

| dtype | Tarea 0 | Tarea 1 | Tarea 2 | Total | Latencia media por paso | Memoria pico |
|---|---|---|---|---|---|---|
| bf16 | 98 % | 94 % | 94 % | 143/150 = 95 % | 9,6 ms | 8,06 GB |
| int8 | 76 % | 22 % | 82 % | 93/150 = 62 % | 24,8 ms | 6,35 GB |

El coste de int8 es de aproximadamente 33 puntos de exito (p = 4e-13, test exacto de Fisher) y un factor de 2,6 en latencia por paso. La varianza por tarea es elevada: int8 oscila entre 22 % y 82 %, mientras que bf16 se mantiene estable (98/94/94).

Con TensorRT en hardware NVIDIA, un motor FP8 alcanza 78,9 ms por llamada de politica frente a los 190 ms de bf16 eager, con una puntuacion de 49/50, identica a bf16.

Nota de alcance: los datos cubren tres de las diez tareas de LIBERO-Spatial, por lo que deben interpretarse como comparacion like-for-like y no como puntuacion completa de la suite. La cifra antigua de "0,5-0,7 en ejecuciones de 10 episodios" se considera demasiado ruidosa (desviacion tipica binomial de ~0,16).

## Requisitos de hardware

- VRAM estimada: 6,35 GB en int8; 8,06 GB en bf16 (no cabe en 8 GB tras el driver).
- VRAM minima declarada: 6,4 GB.
- GPUs recomendadas: cualquier GPU con 8 GB o mas para int8; se recomienda bf16 en hosts con 9 GB o mas; TensorRT FP8 en NVIDIA para maxima velocidad.
- GPU de consumo: si, en tarjetas de 8 GB (por ejemplo, gama RTX x060/x070 con 8 GB); en 8 GB solo es viable int8.
- Opciones de despliegue: runtime OpenRAL (PyTorch), OpenRAL Pro con TensorRT (`OPENRAL_PI05_TRT=1`). vLLM, llama.cpp, Ollama y TGI no estan soportados para este paquete segun la informacion disponible.
- Latencia: 24,8 ms por paso en int8 frente a 9,6 ms en bf16; 190 ms por llamada de politica en bf16 eager y 78,9 ms con TensorRT FP8.
- Throughput: no disponible.
- Requisito de licencia en carga: variable `OPENRAL_ALLOW_NONCOMMERCIAL=1` o flag `--non-commercial`; el paquete int8 requiere ademas OpenRAL Pro (ADR-0123).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento LIBERO-Spatial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rskill-pi05-franka_panda-libero_spatial-int8 (este) | ~3,4 B | no disponible | 62 % (int8, 3 tareas) | permissive-research | Hugging Face, requiere OpenRAL Pro |
| pi05-libero (bf16, mismo base) | ~3,4 B | no disponible | 95 % (bf16, 3 tareas) | permissive-research | Hugging Face |
| pi05-libero con TensorRT FP8 | ~3,4 B | no disponible | 49/50 (identico a bf16) | permissive-research | openral-pro |
| pi05-libero NF4 4-bit | ~3,4 B | no disponible | 0/5 en libero_spatial | permissive-research | descartado por el autor |

No se dispone de datos de otros VLAs comparables (por ejemplo, OpenVLA u otros) en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de precision severa: int8 reduce la tasa de exito en 33 puntos frente a bf16 y la varianza por tarea es alta (22 %-82 %); un chequeo en una sola tarea puede enganar.
- Latencia: int8 es aproximadamente 2,6 veces mas lento por paso que bf16 (24,8 ms frente a 9,6 ms).
- Licencia no comercial: los pesos de π0.5 no son Apache-2.0; el uso comercial requiere un acuerdo con Physical Intelligence. El cargador exige `OPENRAL_ALLOW_NONCOMMERCIAL=1`.
- Dependencia de OpenRAL Pro: los formatos sub-16-bit (int8, fp8, int4/NF4) requieren el paquete de cuantizacion de OpenRAL Pro segun ADR-0123.
- Alcance limitado de evaluacion: los resultados cubren tres de las diez tareas de LIBERO-Spatial; no constituyen una puntuacion completa de la suite.
- Idioma: solo ingles.
- Dominio restringido: afinado para manipulacion en simulacion con Franka Panda sobre LIBERO; no hay evidencia de transferencia a robots reales o a otras tareas.
- Riesgo de alucinacion: no documentado en la informacion disponible; en VLAs el riesgo se manifiesta como acciones fisicamente invalidas o no alineadas con la instruccion.
- Sesgos conocidos: no disponible.
- NF4 no es una alternativa valida para este backbone: destruye la politica por completo (0/5).

## Enlaces

- Hugging Face: https://huggingface.co/OpenRAL/rskill-pi05-franka_panda-libero_spatial-int8
- README del paquete: https://huggingface.co/OpenRAL/rskill-pi05-franka_panda-libero_spatial-int8/blob/main/README.md
- Repositorio GitHub de OpenRAL (rskills/pi05-libero-int8): https://github.com/OpenRAL/openral/tree/master/rskills/pi05-libero-int8/
- Modelo base: https://huggingface.co/lerobot/pi05_libero_finetuned_v044
- Modelo base de origen: https://huggingface.co/lerobot/pi05_base
- Proyecto LIBERO: https://libero-project.github.io/
- Paper de referencia (arXiv 2410.24164): https://arxiv.org/abs/2410.24164
