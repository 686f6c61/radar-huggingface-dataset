# NidaEsen/act_so101_cubcyl_recovery_chunk50_aug_noaffine_3cam

## Resumen
act_so101_cubcyl_recovery_chunk50_aug_noaffine_3cam es una politica de imitacion para robotica desarrollada por NidaEsen y publicada en HuggingFace. Se trata de un checkpoint ACT (Action Chunking Transformer) con CVAE entrenado con la libreria LeRobot para el brazo robotico SO-ARM101, orientado a tareas de manipulacion de cubos y cilindros con recuperacion tras fallos. No es un modelo de lenguaje: su funcion es mapear observaciones (estado del robot e imagenes) a secuencias de acciones motoras.

El modelo tiene 51.617.414 parametros (~51,6 M) y consume tres imagenes RGB de 480x640 (vistas front, top y wrist) mas un estado del robot de 6 dimensiones. Genera chunks de 50 acciones con `n_action_steps=50`. Fue entrenado durante 100.000 pasos sobre el dataset `BrutalCaesar/phi_so101_cubes_cylinder_recovery_v1` (143 episodios), y el checkpoint publicado es el del paso 70.000, seleccionado por tener la menor perdida de evaluacion dentro de esa ejecucion (0,2028).

Su relevancia es acotada: se trata de un artefacto de investigacion de nicho, con 0 descargas y 0 likes en el momento de la consulta, y sin puntuacion de despliegue en hardware real. Resulta util como referencia reproducible de un pipeline ACT con augmentation fotometrica y sin transformacion afina, y como punto de comparacion frente a las variantes del mismo autor bajo el perfil BrutalCaesar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con CVAE |
| Parametros totales | 51.617.414 (~51,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); horizonte de prediccion de acciones `chunk_size=50` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (politica de robotica, no modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato LeRobot) |
| Entradas | estado del robot 6D + 3 imagenes RGB 480x640 (`front`, `top`, `wrist`) |
| Salida | chunk de 50 acciones (`n_action_steps=50`) |
| Dataset de entrenamiento | `BrutalCaesar/phi_so101_cubes_cylinder_recovery_v1` (143 episodios: 120 limpios + 23 de recuperacion) |
| Checkpoint publicado | paso 70.000 (eval loss 0,2028) |
| Libreria | lerobot |
| Hardware de entrenamiento | Slurm, job `10675146_1` sobre nodo `d4053`; duracion 2 h 58 m 55 s |

## Arquitectura y entrenamiento
El modelo implementa ACT, una politica de imitacion basada en transformer con un modulo CVAE (en esta configuracion, `use_vae=true` y `kl_weight=10.0`). La politica toma como entrada un vector de estado del robot de 6 dimensiones junto con tres flujos de imagen RGB de 480x640 (vistas frontal, superior y de muneca) y produce un chunk de 50 acciones que se ejecutan de forma abierta. El enfoque de action chunking reduce la frecuencia de inferencia necesaria durante el control y mitiga el error de composicion de politicas a corto plazo.

El entrenamiento uso el dataset `BrutalCaesar/phi_so101_cubes_cylinder_recovery_v1`, compuesto por 143 episodios (120 limpios y 23 de recuperacion). El split reservo 113 episodios para entrenamiento (90 limpios mas los 23 de recuperacion) y 30 episodios limpios como conjunto de retencion. Se entrenaron 100.000 pasos con batch size 8, semilla 1000 y learning rate 1e-5, guardando checkpoints cada 10.000 pasos. La configuracion de datos activa augmentation de imagen con transformacion afina desactivada (peso 0) y cinco transformaciones fotometricas habilitadas. El autor indica que no se debe comparar la perdida entre distintos tamanos de chunk como si fuese un ranking directo de modelos.

## Capacidades
- Control por imitacion para manipulacion robonica sobre el brazo SO-ARM101 (tareas de cubos y cilindros).
- Fusion multimodal de estado y vision: procesa estado de 6 dimensiones y tres camaras RGB simultaneas.
- Prediccion de chunks de acciones: emite 50 acciones por inferencia, lo que reduce el coste de inferencia en bucle cerrado.
- Recuperacion tras fallos: el entrenamiento incluye 23 episodios etiquetados como de recuperacion, orientados a que la politica reaccione ante estados de fallo.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- Sin capacidades multilingues: no procesa ni genera texto.
- Sin modo de pensamiento, vision general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso
- Manipulacion pick-and-place de cubos y cilindros: la politica puede generar secuencias de agarre y colocacion a partir de las tres vistas de camara y el estado del robot, adecuada para montajes de laboratorio con el SO-ARM101.
- Recuperacion automatica tras fallo de agarre: gracias a los episodios de recuperacion del dataset, el modelo puede intentar reenganchar una pieza perdida en lugar de abortar la tarea, aunque el autor advierte que la perdida de retencion limpia no mide recuperacion.
- Sustitucion de teleoperacion repetitiva: replicar demostraciones humanas registradas en el dataset para automatizar ciclos de ensayo y error en tareas de ensamblaje sencillas.
- Investigacion en aprendizaje por imitacion: servir como baseline ACT reproducible para comparar variantes de augmentation (con y sin transformacion afina) y de chunk size.
- Evaluacion de pipelines LeRobot: usar el checkpoint para validar integraciones de la libreria lerobot, calibracion y carga de pesos safetensors en entornos de simulacion.
- Formacion y docencia en robotica: ejemplo didactico de politica visomotora con CVAE y action chunking, util para cursos practicos de robot learning.
- Pruebas de calibracion de hardware: caso de uso de validacion de la calibracion `phi_follower` antes de cualquier despliegue, dado que una calibracion incorrecta produce objetivos de articulacion erroneos sin aviso.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval ni equivalentes, por tratarse de una politica de robotica). El unico dato de rendimiento reportado es la curva de perdida de evaluacion (L1 mas KL ponderado) sobre 30 episodios limpios de retencion:

| Paso de entrenamiento | Perdida de evaluacion |
|---:|---:|
| 10k | 0,2239 |
| 20k | 0,2203 |
| 30k | 0,2086 |
| 40k | 0,2090 |
| 50k | 0,2077 |
| 60k | 0,2059 |
| 70k | 0,2028 |
| 80k | 0,2072 |
| 90k | 0,2041 |
| 100k | 0,2060 |

El checkpoint publicado es el del paso 70.000, con la perdida minima de la ejecucion (0,2028). El autor advierte que estos valores no deben usarse como ranking directo entre tamanos de chunk y que el checkpoint no dispone todavia de puntuacion de rollout en hardware.

## Requisitos de hardware
- Memoria de pesos estimada: aproximadamente 207 MB en fp32 y 104 MB en fp16, calculada a partir de 51,6 M de parametros (no es un dato publicado).
- VRAM total necesaria: no disponible; debe sumarse a los pesos la memoria de activaciones y del backbone de vision, no cuantificada en la informacion proporcionada.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es compatible con GPU de consumo, pero no se confirma ninguna tarjeta concreta.
- Despliegue en GPU consumer: probable por el tamano de parametros, si bien el autor no aporta confirmacion.
- Opciones de despliegue: libreria lerobot sobre PyTorch. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de politica.
- Latencia y throughput: no disponibles.
- Nota operativa: antes de cualquier rollout en hardware debe usarse la calibracion canonica `phi_follower`; un desajuste de calibracion puede provocar objetivos de articulacion incorrectos sin ningun mensaje de error.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Augmentation | Licencia | Estado |
|---|---|---|---|---|---|
| NidaEsen/act_so101_cubcyl_recovery_chunk50_aug_noaffine_3cam | 51,6 M | 3 camaras (front, top, wrist) | Si, con transformacion afina desactivada | no disponible | 0 descargas |
| BrutalCaesar/act_so101_cubcyl_recovery_chunk50_aug_3cam | no disponible | 3 camaras | Si (transformacion afina activada) | apache-2.0 (segun indice externo) | variante de control del mismo pipeline |
| BrutalCaesar/act_so101_cubcyl_recovery_chunk50_noaug_3cam | no disponible | 3 camaras | No | apache-2.0 (segun indice externo) | variante de control sin augmentation |

Las dos variantes comparadas pertenecen al mismo proyecto y se diferencian por la configuracion de augmentation, no por la arquitectura. La informacion disponible no permite comparar rendimiento entre ellas mas alla de la perdida de evaluacion del modelo aqui descrito.

## Limitaciones y advertencias
- Sin puntuacion de rollout en hardware: el checkpoint no ha sido evaluado en el robot real; la perdida de retencion limpia no mide la capacidad de recuperacion tras un fallo.
- Riesgo de calibracion: un desajuste en la calibracion `phi_follower` genera objetivos de articulacion incorrectos sin aviso, lo que puede provocar movimientos erroneos en hardware.
- Licencia no disponible: al no declararse licencia en la informacion proporcionada, no puede confirmarse el uso comercial ni la redistribucion.
- Dataset reducido: 143 episodios en total (120 limpios y 23 de recuperacion) y 30 episodios de retencion; el riesgo de sobreajuste y de baja generalizacion fuera de la distribucion de entrenamiento es alto.
- Dominio muy acotado: el modelo esta especializado en la tarea de cubos y cilindros con el SO-ARM101; no se espera transferencia directa a otras tareas, objetos o robots.
- Sin capacidades linguisticas ni de texto: no puede usarse para generacion de lenguaje, codigo ni dialogos.
- Sin datos de sesgo, robustez frente a iluminacion o cambios de camara mas alla del augmentation fotometrico aplicado.
- Advertencia del autor: los valores de perdida entre distintos tamanos de chunk no deben interpretarse como un ranking directo de modelos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/NidaEsen/act_so101_cubcyl_recovery_chunk50_aug_noaffine_3cam
- Dataset de entrenamiento: https://huggingface.co/datasets/BrutalCaesar/phi_so101_cubes_cylinder_recovery_v1
- Variante de control con augmentation y transformacion afina activada: https://huggingface.co/BrutalCaesar/act_so101_cubcyl_recovery_chunk50_aug_3cam
- Variante de control sin augmentation: https://huggingface.co/BrutalCaesar/act_so101_cubcyl_recovery_chunk50_noaug_3cam
- Indice externo de especificaciones (variante aug_3cam): https://essamamdani.com/ai-models/hf-brutalcaesar-act-so101-cubcyl-recovery-chunk50-aug-3cam
- Indice externo de especificaciones (variante noaug_3cam): https://essamamdani.com/ai-models/hf-brutalcaesar-act-so101-cubcyl-recovery-chunk50-noaug-3cam
