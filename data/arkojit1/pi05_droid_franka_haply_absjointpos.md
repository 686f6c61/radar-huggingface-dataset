# arkojit1/pi05_droid_franka_haply_absjointpos

## Resumen

π₀.₅ (pi05) es la evolución del modelo vision-language-action (VLA) π₀ de Physical Intelligence, un transformer que combina un codificador visual SigLIP, un modelo de lenguaje Gemma-2B y un «action expert» que genera trayectorias de robot mediante flow matching. Esta ficha concreta corresponde a `arkojit1/pi05_droid_franka_haply_absjointpos`, un ajuste fino de 4.143.404.816 parámetros (~4,14 mil millones) publicado por el usuario arkojit1 sobre el checkpoint `DAVIAN-Robotics/pi05_droid_jointpos`.

El modelo resuelve un problema muy acotado: control de un brazo Franka de 7 grados de libertad teleoperado con un dispositivo Haply, prediciendo posiciones articulares absolutas (7 dimensiones en radianes más pinza) a partir de tres cámaras RGB de 224×224 y un vector de estado de 8 dimensiones. Se entrenó sobre el dataset `Ameyapores/franka_haply_joint_delta` (94 episodios, 50.861 fotogramas a 20 fps, una sola tarea de lenguaje) durante 1.000 pasos, congelando SigLIP y Gemma-2B y entrenando únicamente el action expert (~300 millones de parámetros entrenables). La pérdida de evaluación final es 0,2014 con el objetivo de flow matching.

Su relevancia no es de rendimiento, sino metodológica: el propio autor documenta que este checkpoint es peor que el mismo ajuste fino partiendo de `lerobot/pi05_base` (0,1454, un 28 % mejor) y recomienda usarlo únicamente como baseline de comparación. Es, por tanto, un ejemplo útil de por qué un checkpoint preentrenado con un espacio de acciones «coincidente» (DROID joint-position) no transfiere necesariamente mejor a una tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action): codificador visual SigLIP + Gemma-2B + action expert con flow matching |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no aplica (no es MoE); ~300 millones entrenables en este ajuste |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponibles (el dataset tiene 1 tarea de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Espacio de acciones | 8 dimensiones: 0-6 posiciones articulares absolutas (7 DoF, radianes), 7 pinza |
| Observaciones | 3 camaras RGB 224x224 (`base_0_rgb`, `base_1_rgb`, `left_wrist_0_rgb`) + estado de 8 dim |
| chunk_size / n_action_steps | 15 / 15 (0,75 s de movimiento a 20 fps, ejecucion en lazo abierto) |
| Modelo base | DAVIAN-Robotics/pi05_droid_jointpos |
| Dataset de ajuste | Ameyapores/franka_haply_joint_delta (94 episodios, 50.861 fotogramas, 20 fps) |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño π₀.₅: un backbone vision-language (SigLIP para imagen y Gemma-2B para el condicionamiento de lenguaje) que aporta la representacion multimodal, y un modulo «action expert» que actua como cabecera generativa de acciones entrenada con un objetivo de flow matching. En este ajuste fino se aplico `--train_expert_only`, de modo que SigLIP y Gemma-2B permanecieron congelados y solo se optimizaron aproximadamente 300 millones de parametros del action expert. Las tres camaras de observacion llenan exactamente las tres ranuras de imagen de π₀.₅ (`empty_cameras=0`), sin relleno enmascarado.

El entrenamiento se realizo con lote global de 256 sobre 8 GPU AMD MI300X (RCCL DDP, 32 muestras por GPU), tasa de aprendizaje 2,5e-5 con planificador coseno, bf16 con gradient checkpointing, normalizacion por cuantiles de estado y accion y aumento de imagen solo en el split de entrenamiento. Se usaron 84 episodios para entrenar y 10 para evaluacion (los diez ultimos en orden de episodio), durante 1.000 pasos, seleccionando el checkpoint con menor perdida de evaluacion (0,2014). Es importante subrayar que `eval_loss` es el propio objetivo de entrenamiento medido en episodios reservados, no una tasa de exito, y que con solo 10 episodios de evaluacion la metrica es ruidosa. El chunk de 15 pasos se hereda del `config.json` del checkpoint base (el π₀.₅ «stock» usa 50), lo que reduce la ventana de prediccion ejecutada en lazo abierto a 0,75 s.

## Capacidades

- Generacion de acciones de robot: predice 8 dimensiones (7 posiciones articulares absolutas en radianes mas pinza) para un Franka de 7 DoF teleoperado con Haply.
- Condicionamiento multimodal: consume tres vistas RGB de 224×224 (base y muneca izquierda) junto con un vector de estado de 8 dimensiones.
- Condicionamiento por lenguaje: soporta una unica tarea de lenguaje, la descrita en el dataset de ajuste; no hay evidencia de generalizacion a instrucciones nuevas.
- Generacion por chunks: produce bloques de 15 acciones que se ejecutan completos en lazo abierto antes de replanificar.
- Ajuste eficiente con expertos de accion: demuestra el patron de entrenamiento con backbone congelado y ~300 millones de parametros entrenables.
- No soporta tool calling ni function calling: es una politica robotica, no un modelo conversacional.
- No soporta agentes ni razonamiento multi-paso en el sentido textual; el «multi-paso» se limita a la secuencia de acciones del chunk.
- Sin capacidades de vision de proposito general mas alla de las tres camaras de entrada, ni audio, ni modo «thinking».
- Capacidades multilingues: no disponibles.

## Casos de uso

- Baseline de comparacion metodologica: el proposito que el propio autor declara. Sirve para cuantificar cuanto aporta el preentrenamiento DROID joint-position frente a `lerobot/pi05_base` cuando se ajusta el mismo dataset con el mismo pipeline (0,2014 frente a 0,1454).
- Estudio de transferencia de espacios de acciones: permite medir empiricamente si un checkpoint preentrenado en un espacio de acciones coincidente (posiciones articulares DROID) transfiere mejor que uno generico; el resultado publicado es que no, lo que es informacion valiosa para disenar futuros preentrenamientos.
- Plantilla de ajuste fino con expertos de accion: al congelar SigLIP y Gemma-2B y entrenar ~300 millones de parametros, sirve como receta reproducible para adaptar π₀.₅ a un robot nuevo con presupuesto de computo limitado (8 GPU MI300X durante 1.000 pasos).
- Reproduccion de resultados de investigacion: el README especifica paso, perdida, hardware, hiperparametros y particion de episodios, lo que permite replicar el experimento y verificar la diferencia del 28 % frente al otro checkpoint.
- Pruebas de integracion del stack LeRobot: util para validar que `PI05Policy.from_pretrained` carga pesos safetensors, que el tokenizador gated de `google/paligemma-3b-pt-224` se resuelve correctamente y que el pipeline de observaciones (tres camaras + estado de 8 dimensiones) encaja.
- Auditoria de contratos de espacio de acciones: dado que alimentar deltas articulares o acciones cartesianas produce resultados plausibles pero incorrectos sin lanzar error, este checkpoint es util para construir pruebas que verifiquen el orden y la semantica de las dimensiones (`joint_position_0 ... joint_position_6, gripper`).
- Investigacion sobre politicas de control en lazo abierto: el chunk de 15 pasos a 20 fps (0,75 s) permite estudiar la degradacion del control open-loop al variar la frecuencia de replanificacion.
- Control real del Franka teleoperado con Haply: tecnicamente posible con el espacio de acciones correcto, pero el autor recomienda para ello la variante derivada de `pi05_base`, no este checkpoint.

## Benchmarks y rendimiento

No se han publicado tasas de exito ni resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato numerico publicado es la perdida de evaluacion con el objetivo de flow matching sobre 10 episodios reservados:

| Modelo | Checkpoint base | chunk_size | Mejor eval loss |
|---|---|---|---|
| arkojit1/pi05_franka_haply_absjointpos | lerobot/pi05_base | 50/50 | 0,1454 |
| arkojit1/pi05_droid_franka_haply_absjointpos (este modelo) | DAVIAN-Robotics/pi05_droid_jointpos | 15/15 | 0,2014 |

El mismo orden se mantiene con la codificacion de deltas articulares (0,1977 frente a 0,2135) y, de forma mas clara, en un segundo dataset donde el chunk_size se fijo identico para ambos checkpoints, con π₀.₅ stock un 18 % por delante. El autor advierte que con 10 episodios de evaluacion las diferencias de pocos puntos porcentuales no son concluyentes.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8,3 GB solo para pesos en bf16 (16,6 GB en fp32); contando activaciones de las tres imagenes de 224×224 y el action expert, es razonable reservar del orden de 10-12 GB en bf16. No hay pesos cuantizados publicados, por lo que no se pueden dar cifras reales de int8 o int4.
- GPU de entrenamiento empleadas: 8× AMD MI300X con RCCL DDP (lote global 256, 32 por GPU), bf16 con gradient checkpointing.
- GPU recomendadas para inferencia: A100 (40/80 GB), H100, L40S o MI300X. Cabe holgadamente en cualquier GPU con 16 GB o mas en bf16.
- GPU de consumo: si, cabe en RTX 4090, RTX 3090 o RTX 4080 (24/16 GB) en bf16. El requisito de control a 20 Hz (50 ms por paso) exige medir la latencia real, que no se publica.
- Opciones de despliegue: LeRobot mediante `PI05Policy.from_pretrained("arkojit1/pi05_droid_franka_haply_absjointpos")` sobre PyTorch. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni formato GGUF; al ser una politica robotica con action expert, estos runners no son aplicables directamente.
- Dependencia adicional: el preprocesador carga el tokenizador de `google/paligemma-3b-pt-224`, un repositorio con acceso restringido; hay que aceptar su licencia y configurar `HF_TOKEN`.
- Latencia y throughput: no disponibles. Como referencia funcional, el modelo ejecuta 15 acciones en lazo abierto que a 20 fps cubren 0,75 s de movimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Base | Mejor eval loss | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| arkojit1/pi05_droid_franka_haply_absjointpos (este) | ~4,14 mil millones | chunk 15/15 (0,75 s a 20 fps) | DAVIAN-Robotics/pi05_droid_jointpos | 0,2014 | no disponible | publico en HF, 0 descargas, 1 like |
| arkojit1/pi05_franka_haply_absjointpos | ~4,14 mil millones (misma arquitectura) | chunk 50/50 | lerobot/pi05_base | 0,1454 | no disponible | publico en HF |
| DAVIAN-Robotics/pi05_droid_jointpos | no disponible | no disponible | π₀.₅ stock | no disponible | no disponible | publico en HF (checkpoint base) |
| lerobot/pi05_base | no disponible | chunk 50/50 | π₀.₅ stock | no disponible como tal | no disponible | publico en HF |

No se dispone de datos comparativos frente a otras familias VLA (por ejemplo OpenVLA u otras variantes de π₀) en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor desaconseja usar este checkpoint para control real: el mismo ajuste desde `lerobot/pi05_base` obtiene 0,1454 frente a 0,2014, un 28 % mejor; este modelo esta pensado como baseline de comparacion.
- `eval_loss` no es una tasa de exito y se calcula sobre solo 10 episodios reservados, por lo que es una metrica ruidosa; diferencias de pocos puntos porcentuales no son concluyentes.
- Contrato de espacio de acciones estricto: el modelo espera posiciones articulares absolutas (0-6) mas pinza (7), pese al nombre del dataset (`franka_haply_joint_delta`). Alimentarlo con deltas o con acciones cartesianas no produce un error, sino resultados plausibles pero incorrectos.
- Dataset de ajuste muy pequeno (94 episodios, 50.861 fotogramas, una unica tarea de lenguaje), lo que limita la generalizacion y favorece el sobreajuste al montaje concreto Haply + Franka.
- Control en lazo abierto: los 15 pasos del chunk se ejecutan completos (0,75 s) antes de replanificar, lo que reduce la capacidad de reaccion ante perturbaciones.
- Licencia no disponible: sin terminos explicitos no se puede asumir uso comercial ni redistribucion; hay que contactar con el autor o consultar la licencia del modelo base y del checkpoint DROID.
- Dependencia de un repositorio con acceso restringido (`google/paligemma-3b-pt-224`) para el tokenizador, lo que anade friccion al despliegue y condiciones de uso adicionales.
- Idiomas soportados no declarados; el condicionamiento de lenguaje se limita a una tarea, sin evidencia de robustez multilingue.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido textual, pero si existe riesgo de producir trayectorias plausibles y fisicamente invalidas cuando la entrada no respeta el formato esperado.
- Sin datos publicados de latencia, throughput ni rendimiento en tiempo real, lo que impide garantizar el control a 20 fps en hardware concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arkojit1/pi05_droid_franka_haply_absjointpos
- Checkpoint base: https://huggingface.co/DAVIAN-Robotics/pi05_droid_jointpos
- Dataset de ajuste: https://huggingface.co/datasets/Ameyapores/franka_haply_joint_delta
- Variante alternativa (desde pi05_base): https://huggingface.co/arkojit1/pi05_franka_haply_absjointpos
- Tokenizador requerido (acceso restringido): https://huggingface.co/google/paligemma-3b-pt-224
- Libreria LeRobot: https://github.com/huggingface/lerobot

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo, su paper o su repositorio; los resultados obtenidos versaban sobre clientes BitTorrent y configuracion de impresoras, por lo que no se incluyen. No se dispone de paper, blog tecnico ni demo asociados al modelo en la informacion proporcionada.
