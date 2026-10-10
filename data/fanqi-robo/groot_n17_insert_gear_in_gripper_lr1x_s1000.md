# fanqi-robo/groot_n17_insert_gear_in_gripper_lr1x_s1000

## Resumen

`fanqi-robo/groot_n17_insert_gear_in_gripper_lr1x_s1000` es un ajuste fino del modelo vision-language-action (VLA) `nvidia/GR00T-N1.7-3B` sobre una única tarea de manipulacion bimano: insertar un engranaje en una pinza paralela. Lo publica el usuario `fanqi-robo` como parte de un benchmark de entrenamiento reproducible, con semilla y tasa de aprendizaje fijadas (1x, `seed 1000`), y con las metricas de entrenamiento y validacion expuestas en el repositorio y en Weights & Biases.

El modelo tiene 3.144.016.000 parametros, todos entrenables, y se distribuye en formato safetensors a traves de la libreria LeRobot 0.6.1, con un repositorio de 25,2 GB. Se inicializa desde el checkpoint `nvidia/GR00T-N1.7-3B@2fc962b9` y se ajusta sobre 50 episodios (27.228 fotogramas a 20 FPS) de un robot bimanual YAM, con estado y accion de 14 grados de libertad y tres camaras de 720x1280. La relevancia es acotada pero clara: sirve como punto de referencia reproducible (mismos datos, mismo presupuesto de computo) para medir cuanto aporta el ajuste fino de un VLA generalista en una tarea industrial concreta.

Se trata de la rama `main` del repositorio, que contiene el checkpoint final (update 20000). La rama `best` contiene el checkpoint con menor perdida de validacion (update 4255). No es un modelo de proposito general: no se documenta soporte de lenguaje libre, tool calling ni ninguna capacidad fuera de la politica de control entrenada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de NVIDIA GR00T N1.7; componentes entrenados: modelo de lenguaje, vision tower, projector, cabeza de accion de difusion y capa de normalizacion VL |
| Parametros totales | 3.144.016.000 (3.144.016.000 entrenables, 100 %) |
| Parametros activos | No aplica (no se documenta arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica safetensors en precision completa) |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA License (`nvidia-license`): solo investigacion o evaluacion, uso comercial no permitido |
| Formato de pesos | safetensors (libreria `lerobot`, tamano de repositorio 25,2 GB) |

Datos adicionales de configuracion: chunk de accion de 40 acciones predichas y 40 ejecutadas; normalizacion min/max de estado y accion calculada sobre el conjunto de entrenamiento y recortada a [-1, 1]; slot de encarnacion generico `new_embodiment`; optimizador AdamW con schedule coseno de diffusers y warmup del 5 % de las actualizaciones; `optimizer_lr=1e-05`; 20.000 actualizaciones con batch efectivo de 32; sin aumentacion de imagen; parametros en fp32 bajo autocast bf16.

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `nvidia/GR00T-N1.7-3B`, un VLA cross-embodiment que recibe entrada multimodal (lenguaje e imagenes) y produce acciones de manipulacion. La model card confirma que durante el ajuste fino se entrenaron cinco bloques: el modelo de lenguaje, la torre de vision, el projector, la cabeza de accion de difusion y la capa de normalizacion VL. Es decir, no se trata de un simple adaptador congelado sobre el backbone, sino de un ajuste de la practica totalidad de los parametros (los 3.144 millones declarados son entrenables). La generacion de acciones se realiza por difusion sobre chunks de 40 pasos, y la perdida de validacion reportada es el MSE enmascarado de flow-matching de `policy.forward` en modo evaluacion, con un unico muestreo de ruido por batch bajo semilla fija.

El entrenamiento se hizo sobre `fanqi-robo/insert_gear_in_gripper` (revision `acdc9ac8`), un dataset LeRobot v3 con 50 episodios bimanuales YAM a 20 FPS, 27.228 fotogramas y una unica tarea. La validacion usa `villekuosmanen/insert_gear_in_gripper_val` (revision `7c4d62f3`), con 5 episodios retenidos y 2.245 fotogramas. El run consumio 1 GPU NVIDIA H200 durante 11,0 horas-GPU, con un pico de VRAM de 87,2 GB. La perdida de entrenamiento en la ultima ventana fue de 0,00875742, mientras que la perdida de validacion termino en 0,0807886 en la actualizacion 20.000, frente al minimo de 0,0476542 alcanzado en la actualizacion 4.255; esa divergencia entre ambas curvas es el indicio claro de sobreajuste a partir de ese punto medio del entrenamiento.

## Capacidades

- Control robotico bimano: genera acciones de 14 grados de libertad (estado y accion conjunta) para un robot YAM con dos brazos.
- Ejecucion de la tarea `insert_gear_in_gripper`: inserccion de un engranaje en una pinza paralela.
- Percepcion visual multi-camara: consume tres camaras de 720x1280 simultaneamente.
- Prediccion por chunks: emite 40 acciones de forma conjunta y las ejecuta completas (40 predichas, 40 ejecutadas), lo que reduce la frecuencia de recalculo de la politica.
- Condicionamiento por encarnacion: entrena bajo el slot generico `new_embodiment` de LeRobot 0.6.1, sin preentrenamiento especifico de YAM conocido.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, audio ni dialogo multilingue en la informacion disponible.

## Casos de uso

- Benchmark reproducible de VLA en manipulacion industrial: sirve como punto de comparacion fijo (semilla 1000, lr 1x, 20.000 updates, 11 horas-GPU en una H200) para medir el efecto de cambios en datos, aumentacion o hiperparametros sobre el mismo backbone GR00T N1.7-3B.
- Politica de insercion en linea de montaje: el modelo traduce observaciones visuales de tres camaras y el estado conjunto a comandos de brazo, y puede desplegarse para automatizar la colocacion de un engranaje en una pinza dentro de una celda YAM.
- Investigacion sobre chunking de acciones: al predecir y ejecutar 40 acciones por inferencia, permite estudiar el compromiso entre latencia de control (186,1 ms reportados) y estabilidad del movimiento en tareas de contacto preciso.
- Estudio de sobreajuste en ajuste fino de VLA: la curva de validacion disponible (minimo en el update 4.255, deterioro posterior) lo convierte en un caso practico para analizar early stopping y seleccion de checkpoints en politicas roboticas.
- Generacion de datos sinteticos o evaluacion offline: la metrica MAE@k sobre el conjunto retenido permite comparar checkpoints sin necesidad de ejecucion en hardware, util para filtrar candidatos antes de pruebas fisicas.
- Transferencia a nuevas encarnaciones: al haberse entrenado bajo el slot `new_embodiment` sin preentrenamiento especifico de YAM, documenta el comportamiento de GR00T N1.7 cuando se adapta a un robot no visto durante el preentrenamiento.
- Base para ajustes posteriores en tareas de ensamblaje con multiples camaras: el pipeline LeRobot 0.6.1 y el formato safetensors facilitan continuar el entrenamiento con nuevos episodios del mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible: es un modelo de politica robotica, no un modelo de lenguaje. Los unicos datos disponibles son la evaluacion offline en lazo abierto sobre `villekuosmanen/insert_gear_in_gripper_val` (423 consultas, un fotograma de cada 5), en unidades conjuntas del dataset. La linea base trivial `hold` (mantener la pose actual) obtiene MAE@30 = 2,60.

| Update | MAE@10 | MAE@30 | k=1 | k=30 | arm | grip rec | grip dt |
|---|---|---|---|---|---|---|---|
| 851 | 6,86 | 6,89 +/- 0,50 | 7,17 | 7,23 | 0,89 | 0,37 | 3,4 |
| 1702 | 4,58 | 4,80 +/- 0,50 | 4,57 | 5,12 | 0,96 | 0,52 | 5,0 |
| 2553 | 3,95 | 4,21 +/- 0,51 | 3,86 | 4,67 | 0,99 | 0,68 | 3,8 |
| 3404 | 3,49 | 3,82 +/- 0,30 | 3,55 | 4,37 | 0,96 | 0,70 | 3,6 |
| 4000 | 3,22 | 3,52 +/- 0,45 | 3,13 | 4,03 | 0,99 | 0,60 | 3,2 |
| 4255 | 3,53 | 3,84 +/- 0,64 | 3,66 | 4,49 | 0,99 | 0,76 | 4,2 |
| 5106 | 3,17 | 3,54 +/- 0,62 | 3,13 | 4,21 | 0,98 | 0,86 | 5,1 |
| 5957 | 2,98 | 3,35 +/- 0,33 | 2,91 | 3,95 | 0,99 | 0,84 | 3,7 |
| 6808 | 2,83 | 3,17 +/- 0,40 | 2,70 | 3,71 | 0,99 | 0,84 | 4,8 |
| 7659 | 2,73 | 3,10 +/- 0,44 | 2,62 | 3,67 | 0,99 | 0,86 | 5,0 |
| 8000 | 2,90 | 3,20 +/- 0,49 | 2,91 | 3,73 | 1,00 | 0,87 | 4,2 |
| 8510 | 2,86 | 3,21 +/- 0,46 | 2,75 | 3,83 | 1,00 | 0,81 | 3,7 |
| 9361 | 2,85 | 3,19 +/- 0,47 | 2,76 | 3,79 | 1,00 | 0,81 | 4,5 |
| 10212 | 2,84 | 3,20 +/- 0,48 | 2,78 | 3,80 | 0,99 | 0,79 | 4,7 |
| 11063 | 2,69 | 3,05 +/- 0,49 | 2,59 | 3,67 | 1,00 | 0,86 | 4,4 |
| 11914 | 2,58 | 2,96 +/- 0,51 | 2,50 | 3,58 | 1,00 | 0,89 | 4,6 |
| 12000 | 2,85 | 3,17 +/- 0,43 | 2,78 | 3,71 | 1,00 | 0,86 | 4,7 |
| 12765 | 2,60 | 2,98 +/- 0,49 | 2,48 | 3,59 | 1,00 | 0,87 | 4,2 |
| 13616 | 2,60 | 2,93 +/- 0,51 | 2,49 | 3,48 | 1,00 | 0,83 | 4,2 |
| 14467 | 2,61 | 2,93 +/- 0,42 | 2,51 | 3,49 | 1,00 | 0,87 | 4,6 |
| 15318 | 2,62 | 2,93 +/- 0,48 | 2,53 | 3,46 | 1,00 | 0,89 | 4,6 |
| 16000 | 2,65 | 2,96 +/- 0,45 | 2,56 | 3,49 | 1,00 | 0,89 | 4,3 |
| 16169 | 2,68 | 3,00 +/- 0,49 | 2,59 | 3,56 | 1,00 | 0,86 | 4,3 |
| 17020 | 2,66 | 2,98 +/- 0,46 | 2,55 | 3,53 | 1,00 | 0,89 | 4,3 |
| 17871 | 2,63 | 2,97 +/- 0,45 | 2,52 | 3,52 | 1,00 | 0,89 | 4,3 |
| 18722 | 2,61 | 2,94 +/- 0,45 | 2,50 | 3,49 | 1,00 | 0,89 | 4,3 |
| 19573 | 2,61 | 2,94 +/- 0,44 | 2,51 | 3,49 | 1,00 | 0,89 | 4,2 |
| 20000 (final) | 2,61 | 2,94 +/- 0,45 | 2,51 | 3,48 | 1,00 | 0,89 | 4,2 |

Interpretacion de los datos disponibles: el mejor MAE@30 de la tabla es 2,93 (updates 13616, 14467 y 15318), empatado practicamente con el 2,94 del checkpoint final. La metrica `grip rec` mejora de forma sostenida hasta 0,89 y se mantiene plana desde el update 11914. El valor `hold` de referencia en MAE@30 es 2,60, inferior al mejor resultado del modelo, lo que conviene tener en cuenta al interpretar estas cifras. La perdida de validacion (0,0476542 en el update 4255 frente a 0,0807886 en el 20000) y el MAE no siguen la misma tendencia, algo que la propia model card advierte al senalar que la perdida de validacion solo ordena checkpoints dentro de este run y no es comparable entre politicas.

## Requisitos de hardware

- VRAM de entrenamiento: 87,2 GB de pico, medido en 1 GPU NVIDIA H200 durante 11,0 horas-GPU para 20.000 updates con batch efectivo 32.
- VRAM de inferencia: no disponible en la informacion proporcionada. Como referencia aritmetica, los 3.144 millones de parametros en bf16 ocupan aproximadamente 6,3 GB solo en pesos; a eso hay que anadir la torre de vision, las activaciones de las tres camaras de 720x1280 y el coste de la cabeza de difusion. El repositorio completo ocupa 25,2 GB.
- GPU recomendadas: la unica configuracion documentada es 1 x NVIDIA H200 para entrenamiento. Para inferencia no se especifica hardware; por el tamano del modelo, es plausible en GPUs de 24 GB o mas, pero no hay medicion publicada que lo confirme.
- Cabe en GPU de consumo: no confirmado. Con aproximadamente 6,3 GB de pesos en bf16, una RTX 4090 (24 GB) seria candidata en teoria, pero no hay datos publicados de consumo real con el pipeline de LeRobot y las tres camaras.
- Opciones de despliegue: LeRobot 0.6.1 (libreria declarada) y el repositorio NVIDIA Isaac-GR00T. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no son adecuados para un modelo de politica robotica con cabeza de difusion.
- Latencia: 186,1 ms por inferencia, segun la model card. No se especifica el hardware en el que se midio. No se publica throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (update 20000) | 3.144.016.000 | No disponible | MAE@30 2,94; grip rec 0,89; latencia 186,1 ms | NVIDIA License (solo investigacion/evaluacion) | HuggingFace, safetensors, LeRobot 0.6.1 |
| `nvidia/GR00T-N1.7-3B` (base) | 3.144.016.000 (el ajuste declara todos los parametros entrenables) | No disponible | No se publica evaluacion especifica en `insert_gear_in_gripper` | NVIDIA License | HuggingFace |
| Politica trivial `hold` (mantener pose) | 0 | No aplica | MAE@30 2,60 | No aplica | No aplica |
| Otros VLA de manipulacion (OpenVLA, pi0, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

No hay datos publicados que permitan comparar este ajuste con alternativas de otros autores sobre la misma tarea; la model card advierte explicitamente que su metrica de validacion no es comparable entre politicas distintas.

## Limitaciones y advertencias

- Sobreajuste documentado: la perdida de validacion minima se alcanza en el update 4.255 (0,0476542) y sube hasta 0,0807886 en el update 20.000, mientras la perdida de entrenamiento cae a 0,00875742. El checkpoint final, que es el que se distribuye en `main`, no es el de mejor validacion.
- Rendimiento frente a la linea base trivial: el mejor MAE@30 de la tabla (2,93) es peor que el 2,60 de la politica `hold` que mantiene la pose actual. Estas cifras son de evaluacion en lazo abierto y no equivalen a exito en la tarea, pero deben considerarse antes de asumir que la politica aporta valor sobre no actuar.
- Dataset muy reducido: 50 episodios y 27.228 fotogramas para una unica tarea. La generalizacion a posiciones, iluminacion u objetos distintos no esta documentada.
- Encarnacion unica: bimanual YAM, 14 grados de libertad, tres camaras de 720x1280. El modelo se entreno bajo el slot generico `new_embodiment` de LeRobot 0.6.1 y no se conoce preentrenamiento especifico de YAM, lo que limita la transferencia a otros robots o a otras configuraciones de camaras.
- Normalizacion especifica: se usa min/max del conjunto de entrenamiento recortado a [-1, 1], no cuantiles q01/q99. Cambiar de dataset o de rango de estado puede requerir recalcular la normalizacion.
- Sin aumentacion de imagen: no se aplico ninguna durante el entrenamiento, lo que reduce la robustez ante variaciones visuales.
- Licencia restrictiva: distribuido bajo NVIDIA License, solo para investigacion o evaluacion, con uso comercial no permitido de forma explicita. Cualquier despliegue en produccion requiere revisar los terminos y probablemente negociar otra licencia.
- Sin soporte de lenguaje libre ni de tool calling: el condicionamiento por lenguaje existe en el backbone, pero este ajuste esta especializado en una sola tarea y no se documenta su comportamiento con instrucciones arbitrarias.
- Idioma: no se declaran idiomas soportados en la ficha.
- Riesgo de alucinacion: no aplica en el sentido de texto generado, pero si existe riesgo de acciones fisicamente invalidas o inestables fuera de la distribucion de entrenamiento, con el consiguiente peligro en un entorno robotico real.
- Latencia de 186,1 ms por inferencia con hardware no especificado: hay que validarla en el hardware objetivo antes de disenar el bucle de control.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fanqi-robo/groot_n17_insert_gear_in_gripper_lr1x_s1000
- Dataset de entrenamiento `fanqi-robo/insert_gear_in_gripper`: https://huggingface.co/datasets/fanqi-robo/insert_gear_in_gripper
- Dataset de validacion (referenciado en la model card): `villekuosmanen/insert_gear_in_gripper_val` @ `7c4d62f3`
- Dataset de evaluacion `fanqi-robo/eval_insert_gear_in_gripper_10h52m_05-oct-2026`: https://huggingface.co/datasets/fanqi-robo/eval_insert_gear_in_gripper_10h52m_05-oct-2026
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Run de Weights & Biases: https://wandb.ai/fanqi-robo-saferobotics/insert_gear_in_gripper_benchmark/runs/mpcmvovz
- Repositorio oficial NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio espejo/comunitario Isaac-GR00T N1.7: https://github.com/Abhiram824/Isaac-GR00T-n17
- Documentacion de entrenamiento con GR00T en Isaac Teleop: https://nvidia.github.io/IsaacTeleop/release/1.4.x/getting_started/lerobot/training_groot.html
