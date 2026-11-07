# OpenRAL/rskill-xr1-franka_panda-vlabench-nf4

## Resumen

rskill-xr1-franka_panda-vlabench-nf4 es un paquete de pesos cuantizados en NF4 (4 bits) publicado por OpenRAL a partir del checkpoint XR-1 VLABench de Xiaomi Robotics. Se trata de un modelo vision-language-action (VLA) de 5.053.149.696 parametros (5,44B segun la model card del autor) especializado en el entorno de simulacion VLABench sobre el brazo robotico Franka Panda. El paquete no es un modelo entrenado desde cero: es una exportacion pre-cuantizada del checkpoint BF16 original, empaquetada como "rSkill" para el runtime OpenRAL, que actua como capa de integracion entre la politica y el simulador.

El modelo resuelve el problema de llevar una politica VLA de gran tamano a hardware modesto. Al estar pre-cuantizado en NF4, el sidecar de inferencia carga los pesos sin recuantizar en tiempo de ejecucion y reduce el consumo de VRAM hasta aproximadamente 3,66 GiB en un portatil con RTX 4070 de 8 GB. La integracion concreta que aporta OpenRAL incluye la conversion de las diez deltas de efector final que predice XR-1 en consignas absolutas para VLABench, la ejecucion de cinco acciones antes de replanificar y el mapeo del escalar de pinza con umbral 0,2.

Es relevante ahora porque demuestra un flujo completo de cuantizacion verificada (bit-identica al NF4 en tiempo de ejecucion, con MAE=0) para modelos de robotica, un area donde los checkpoints de 5B siguen siendo dificiles de desplegar en GPUs de consumo. La licencia Apache-2.0 permite uso comercial, aunque la carga exige el paquete de cuantizacion de OpenRAL Pro y `OPENRAL_ALLOW_REMOTE_CODE=1`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en XR-1; transformer con codificadores visuales multiples y cabeza de acciones; codigo custom de Transformers |
| Parametros totales | 5.053.149.696 (5,44B segun la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (4 bits) pre-cuantizado; el modelo base admite BF16 |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pack NF4 pre-cuantizado) |

## Arquitectura y entrenamiento

El modelo subyacente es XR-1, un VLA de la familia Xiaomi-Robotics-1 con 5,44B parametros. Procesa tres flujos RGB de 480x480 (vista frontal, vista de base o segunda camara y vista de muneca) junto con un vector de estado de 7 dimensiones del efector final (XYZ, Euler y pinza). La salida es un chunk de acciones de forma (10, 7): diez deltas de pose relativa mas el escalar de pinza. El checkpoint esta afinado sobre el conjunto de datos del benchmark VLABench, segun indica la model card del autor; no se detalla el numero de tokens, la composicion exacta del dataset ni si hubo RLHF o DPO.

La innovacion practica de este paquete es el pipeline de cuantizacion: se exporto desde el commit fijado `2dfc33b390478f71737eacb4748333e6d8638a06` del repositorio BF16 con el perfil `vlabench_choice` y cuantizacion NF4, y se verifico que la salida empaquetada era bit-identica al NF4 calculado en tiempo de ejecucion sobre la misma entrada con semilla (MAE=0, error maximo=0). El resultado es una reduccion del tiempo de inicializacion de la politica de aproximadamente 18,0 s a 10,1 s en el host de referencia. El orden de camaras es critico y replica el evaluador de Xiaomi: `camera1=front` (indice bruto 2), `camera2=base/second` (indice 0) y `camera3=wrist` (indice 3), sin volteo de fotogramas.

## Capacidades

- Generacion de acciones roboticas: predice chunks de 10 acciones de 7 dimensiones (pose relativa del efector final mas pinza) a partir de observaciones visuales y de estado.
- Percepcion visual multi-camara: consume simultaneamente tres vistas RGB de 480x480 (frontal, base y muneca).
- Manipulacion de objetos: acciones de grasp, pick y place sobre fruta y objetos de sobremesa en escenas VLABench.
- Integracion de deltas: el wrapper de OpenRAL convierte las deltas relativas en objetivos absolutos de pose y ejecuta cinco acciones antes de replanificar.
- Control de pinza: umbral escalar de 0,2 mapeado a comandos normalizados de abierto y cerrado.
- Despliegue cuantizado: inferencia en NF4 sin recuantizacion en carga, con soporte de hardware de gama media.
- Idioma: solo ingles en la metadata del modelo.
- No se documentan capacidades de tool calling, agentes multi-paso, matematicas, codigo ni audio.

## Casos de uso

- Evaluacion de politicas VLA en simulacion: el paquete se conecta al entorno `select_fruit` de VLABench mediante la configuracion `scenes/benchmark/vlabench_select_fruit.yaml`, lo que permite reproducir rollouts cerrados sin reentrenar el modelo.
- Desarrollo en hardware de consumo: con 3,66 GiB de VRAM de proceso en una RTX 4070 Laptop de 8 GB, es viable iterar sobre politicas de robotica en un portatil en lugar de depender de un cluster.
- Prototipado de tareas de pick and place: las acciones grasp, pick y place sobre objetos de sobremesa permiten construir demostraciones de manipulacion antes de trasladar la politica a un robot real.
- Validacion de pipelines de cuantizacion: sirve como referencia para verificar que una exportacion NF4 reproduce exactamente la inferencia en tiempo de ejecucion, un control de calidad util en despliegues de robotica.
- Despliegue en plataformas embebidas: la ejecucion documentada en Jetson Thor con OpenRAL Pro (400 pasos, semillas 0 a 4, 3 de 5 episodios completados en unos 150 pasos cada uno) muestra la viabilidad en computo de borde.
- Benchmarking comparativo de VLA: al estar empaquetado con contrato de observacion y accion explicito, facilita comparar XR-1 con otras politicas sobre el mismo simulador y la misma encarnacion Franka Panda.
- Integracion en el harness OpenRAL: el paquete encaja como habilidad `s1` dentro de la capa de agentes roboticos de OpenRAL, que unifica politicas rapidas, razonamiento lento y control clasico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el paquete no incluye puntuacion hasta que se complete una ejecucion real en el simulador, y que las pruebas realizadas validan la ejecucion, no el exito de la tarea ni la puntuacion oficial de Xiaomi.

| Metrica de ejecucion | Valor |
|---|---|
| VRAM de proceso (RTX 4070 Laptop 8 GB) | 3,66 GiB |
| Primer chunk sintetico | 1,35 s |
| Chunk en escena real (calentado) | 0,81 s |
| Presupuesto de latencia por chunk | 2000 ms |
| VRAM minima declarada | 4,0 GB |
| Inicializacion de politica (BF16 a NF4) | de ~18,0 s a 10,1 s |
| Verificacion de cuantizacion | MAE=0, error maximo=0 |
| Rollout cerrado en Jetson Thor | 3 de 5 episodios completados, ~150 pasos por episodio |

## Requisitos de hardware

- VRAM estimada: 4,0 GB minimos segun la metadata del paquete; 3,66 GiB de proceso medidos en inferencia NF4.
- GPU recomendadas: RTX 4070 Laptop (8 GB) validada; Jetson Thor validado para ejecucion en bucle cerrado. Para el checkpoint BF16 sin cuantizar no se dispone de estimacion publicada.
- GPU de consumo: si, cabe en tarjetas de 8 GB o superiores en formato NF4.
- Opciones de despliegue: runtime PyTorch de OpenRAL mediante sidecar; requiere `OPENRAL_ALLOW_REMOTE_CODE=1` por el codigo custom de Transformers. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,81 s por chunk en escena real calentada y 1,35 s en el primer chunk sintetico; presupuesto declarado de 2000 ms por chunk.
- Requisito adicional: el formato NF4 exige el paquete de cuantizacion de OpenRAL Pro; la version open source solo carga fp32, fp16 y bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenRAL/rskill-xr1-franka_panda-vlabench-nf4 | 5,05B (5,44B segun model card) | no disponible | NF4 pre-cuantizado | Apache-2.0 | Hugging Face, requiere OpenRAL Pro para NF4 |
| XiaomiRobotics/Xiaomi-Robotics-1-VLABench | 5,44B | no disponible | BF16 | Apache-2.0 | Hugging Face |
| Otras politicas VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa documentada es con el checkpoint BF16 del que deriva: mismos pesos, mismo contrato de observacion y accion, con la diferencia de cuantizacion, VRAM y tiempo de carga. No se dispone de datos publicados de otros modelos VLA de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Especificidad de encarnacion: el paquete esta ajustado a Franka Panda dentro de VLABench; no se garantiza su transferencia a otros robots o entornos sin reentrenamiento.
- Alcance de tareas limitado: solo cubre grasp, pick y place sobre fruta y objetos de sobremesa en escenas VLABench.
- Sin puntuacion de benchmark: las pruebas realizadas validan la ejecucion, no el exito de la tarea. El resultado de 3 de 5 episodios es una comprobacion local, no una metrica oficial.
- Dependencia de assets externos: la ejecucion completa requiere el paquete de assets de VLABench documentado por el backend de escenas.
- Dependencia de licencia y runtime: la carga en NF4 exige OpenRAL Pro; la version open source no admite formatos cuantizados. Ademas se necesita `OPENRAL_ALLOW_REMOTE_CODE=1` para el codigo custom del checkpoint.
- Fragilidad en el orden de camaras: el mapeo de vistas es critico y debe replicar exactamente el evaluador de Xiaomi, sin volteo de fotogramas.
- Idioma: el modelo declara solo ingles.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni tasas de fallo del modelo base en la informacion disponible.
- Uso comercial: permitido por Apache-2.0, pero sujeto a las condiciones del runtime propietario necesario para el formato NF4.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-xr1-franka_panda-vlabench-nf4
- Modelo base: https://huggingface.co/XiaomiRobotics/Xiaomi-Robotics-1-VLABench
- Paper de Xiaomi-Robotics-1: https://arxiv.org/abs/2607.15330
- Repositorio OpenRAL: https://github.com/OpenRAL/openral
- Preview de rollout VLABench: https://huggingface.co/datasets/OpenRAL/website-media/resolve/main/benchmarks/vlabench-select-fruit_xr1-nf4_fail/full.mp4
