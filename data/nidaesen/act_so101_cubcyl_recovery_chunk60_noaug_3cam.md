# NidaEsen/act_so101_cubcyl_recovery_chunk60_noaug_3cam

## Resumen

`NidaEsen/act_so101_cubcyl_recovery_chunk60_noaug_3cam` es una politica de imitacion robotica entrenada con el framework LeRobot de Hugging Face, basada en la arquitectura ACT (Action Chunking with Transformers) con componente CVAE. No es un modelo de lenguaje: recibe observaciones visuales de tres camaras (muneca, frontal y superior) junto con el estado de las articulaciones, y produce directamente secuencias de acciones para un brazo robotico SO-ARM101. El checkpoint cuenta con 51.627.654 parametros y ocupa 0,2 GB en el repositorio.

El modelo ha sido entrenado sobre el dataset `BrutalCaesar/phi_so101_cubes_cylinder_recovery_v1`, compuesto por 143 episodios (120 limpios y 23 de recuperacion) de tareas de manipulacion con cubos y cilindros. Su rasgo distintivo es la inclusion deliberada de episodios de recuperacion tras fallo en el conjunto de entrenamiento, con la intencion de que la politica aprenda a reincorporarse a la tarea cuando algo sale mal. Se selecciono el checkpoint del paso 90.000 por ser el de menor perdida en validacion (0,2311).

Es relevante como ejemplo de politica de imitacion ligera, entrenada en menos de dos horas sobre una unica GPU, y como material de referencia para quienes trabajan con brazos SO-ARM101 y quieren reproducir o comparar variantes de ACT. No tiene descargas ni valoraciones registradas en Hugging Face, y no existe puntuacion de despliegue en hardware real para este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con CVAE, encoder-decoder transformer |
| Parametros totales | 51.627.654 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica a contexto de texto; chunk de acciones = 60 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de politica robotica, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |
| Camaras de entrada | 3 (muneca, frontal, superior) |
| Dataset de entrenamiento | BrutalCaesar/phi_so101_cubes_cylinder_recovery_v1 (143 episodios) |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | robotics |
| Fecha de creacion | 2026-09-29 |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitacion diseñada para manipulacion fina con hardware de bajo coste. El modelo observa imagenes de camara y el estado proprioceptivo del robot, y predice un "chunk" de acciones futuras de una sola vez en lugar de una accion por paso, lo que reduce el error de acumulacion y estabiliza el comportamiento. La variante empleada aqui incorpora un CVAE (autoencoder variacional condicional) que modela la variabilidad de las demostraciones humanas durante el entrenamiento y se descarta en inferencia, aportando un estilo de movimiento mas natural. El chunk configurado es de 60 acciones y la entrada visual combina tres camaras: muneca, frontal y superior.

Los datos de entrenamiento provienen del dataset `BrutalCaesar/phi_so101_cubes_cylinder_recovery_v1`, con 143 episodios de los cuales 120 son ejecuciones limpias y 23 son episodios de recuperacion tras fallo. El split empleado es de 113 episodios para entrenamiento (90 limpios mas los 23 de recuperacion) y 30 episodios limpios reservados para validacion, concretamente los indices 0-4, 20-24, 45-49, 65-69, 90-94 y 110-114. El entrenamiento duro 100.000 pasos con tamano de batch 8, semilla 1000 y tasa de aprendizaje 1e-5, guardando checkpoints cada 10.000 pasos. La aumentacion de datos estaba desactivada (`noaug`). El trabajo se ejecuto en el nodo `d4055` con identificador `10675148_0` y finalizo correctamente en 1 hora, 56 minutos y 57 segundos.

## Capacidades

- Generacion de trayectorias de acciones para un brazo robotico SO-ARM101 a partir de observaciones visuales y de estado.
- Prediccion en bloques de 60 acciones (action chunking), lo que permite ejecutar movimientos mas coherentes que un control paso a paso.
- Percepcion multimodal mediante tres flujos de camara simultaneos (muneca, frontal, superior).
- Manipulacion de objetos tipo cubo y cilindro, segun las tareas presentes en el dataset de entrenamiento.
- Recuperacion tras fallo: los 23 episodios de recuperacion incluidos en el conjunto de entrenamiento buscan dotar a la politica de cierta capacidad de reincorporarse a la tarea.
- No dispone de tool calling, function calling ni soporte de agentes.
- No tiene capacidades de generacion de texto, codigo, matematicas, vision general, audio ni razonamiento multilingue.
- No se documenta modo "thinking" ni ninguna capacidad cognitiva adicional.

## Casos de uso

- Control de un brazo SO-ARM101 en tareas de pick-and-place de cubos y cilindros: la politica recibe las tres camaras y emite bloques de 60 acciones que el controlador del robot ejecuta de forma directa.
- Banco de pruebas de imitacion robotica: sirve como checkpoint de referencia para comparar el efecto del tamano de chunk (60 frente a variantes de 50) sobre la perdida en validacion.
- Estudio del aprendizaje de recuperacion: permite analizar si incluir episodios de fallo en entrenamiento mejora la robustez frente a errores de agarre o colocacion.
- Reproduccion de experimentos con LeRobot: al estar en formato safetensors y libreria lerobot, se puede cargar con las utilidades estandar del framework y repetir la evaluacion sobre el split reservado.
- Prototipado en laboratorio con hardware de bajo coste: los 51,6 millones de parametros permiten ejecutar inferencia en equipos modestos, lo que facilita montar una celda de prueba sin GPU de gama alta.
- Docencia y divulgacion: como ejemplo completo de pipeline de imitacion (dataset, entrenamiento, evaluacion por perdida en validacion) para cursos de robotica y aprendizaje por imitacion.
- Investigacion sobre aumentacion de datos: al ser la variante `noaug`, es el control natural frente a su equivalente con aumentacion activada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no se trata de un modelo de lenguaje. El unico dato cuantitativo publicado es la perdida en el conjunto de validacion retenido (L1 mas KL ponderada), medida sobre episodios limpios:

| Paso | Perdida en validacion |
|---:|---:|
| 10k | 0,2707 |
| 20k | 0,2582 |
| 30k | 0,2492 |
| 40k | 0,2418 |
| 50k | 0,2399 |
| 60k | 0,2362 |
| 70k | 0,2360 |
| 80k | 0,2336 |
| **90k** | **0,2311** |
| 100k | 0,2361 |

El checkpoint seleccionado es el del paso 90.000, con 0,2311 de perdida. El autor advierte explicitamente de que esta metrica se calcula sobre episodios limpios y no evalua la recuperacion tras un fallo, y de que no existe puntuacion de despliegue en hardware real para este checkpoint.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 51,6 millones de parametros, los pesos en fp32 ocupan aproximadamente 207 MB y en fp16 unos 103 MB; el repositorio completo son 0,2 GB. La inferencia con tres flujos de camara anade el coste de los codificadores visuales, pero el conjunto deberia mantenerse muy por debajo de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente, incluidas RTX 3060, RTX 4090, A100 o H100. No se dispone de cifras oficiales de rendimiento por modelo de GPU.
- Cabe en GPU de consumo: si, previsiblemente en practicamente cualquier GPU de consumo moderna. No hay confirmacion oficial del autor sobre el hardware minimo.
- Opciones de despliegue: LeRobot (PyTorch) es el entorno nativo, dado el campo `library_name: lerobot` y el formato safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica robotica de este tipo. La exportacion a otros formatos no esta documentada.
- Latencia y throughput: no disponible. No se han publicado mediciones.
- Nota operativa del autor: antes de cualquier prueba en hardware debe usarse la calibracion canonica `phi_follower` del proyecto.

## Comparativa con modelos similares

Solo se han localizado variantes del mismo proyecto, todas ellas del autor BrutalCaesar. Los datos de las alternativas no estan disponibles en la informacion proporcionada.

| Modelo | Chunk | Camaras | Aumentacion | Perdida en validacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| act_so101_cubcyl_recovery_chunk60_noaug_3cam (este) | 60 | 3 | Desactivada | 0,2311 (paso 90k) | no disponible | Repositorio Hugging Face del autor NidaEsen |
| act_so101_cubcyl_recovery_chunk50_noaug_3cam | 50 | 3 | Desactivada | no disponible | no disponible | Hugging Face (BrutalCaesar) |
| act_so101_cubcyl_recovery_chunk50_aug_3cam | 50 | 3 | Activada | no disponible | no disponible | Hugging Face (BrutalCaesar) |

La variante `chunk50_noaug_3cam` se describe como el control exacto de `chunk50_aug_3cam`, identico salvo por `dataset.image_transforms.enable`. No se han localizado resultados comparativos publicados entre estas variantes ni con politicas ACT externas.

## Limitaciones y advertencias

- La perdida en validacion se calcula unicamente sobre episodios limpios: no mide la capacidad real de recuperacion tras un fallo, pese a que el modelo se entrena con episodios de recuperacion.
- No existe puntuacion de despliegue en hardware real para este checkpoint, por lo que su comportamiento fisico es desconocido.
- Requiere la calibracion canonica `phi_follower` del proyecto antes de cualquier prueba en hardware; una calibracion distinta puede degradar el comportamiento de forma silenciosa.
- Ambito de tarea muy restringido: cubos y cilindros sobre SO-ARM101, segun la distribucion del dataset de entrenamiento. No se puede esperar generalizacion a otros objetos, entornos o robots.
- La aumentacion de datos esta desactivada, lo que puede reducir la robustez frente a variaciones de iluminacion, posicion de camara o apariencia de los objetos.
- Sesgos conocidos: no disponibles. Al ser un modelo de imitacion, heredara los sesgos y las trayectorias presentes en las demostraciones humanas del dataset.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de acciones incorrectas o fuera de distribucion ante observaciones no vistas.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas: no aplica, el modelo no procesa ni genera lenguaje.
- El repositorio no registra descargas ni valoraciones, por lo que no hay evidencia de uso externo ni validacion por parte de terceros.
- Las fechas de creacion y actualizacion del repositorio son muy proximas entre si (menos de dos minutos de diferencia), lo que sugiere una subida automatizada sin revision posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NidaEsen/act_so101_cubcyl_recovery_chunk60_noaug_3cam
- Dataset de entrenamiento: https://huggingface.co/datasets/BrutalCaesar/phi_so101_cubes_cylinder_recovery_v1
- Variante chunk50 sin aumentacion: https://huggingface.co/BrutalCaesar/act_so101_cubcyl_recovery_chunk50_noaug_3cam
- Variante chunk50 con aumentacion: https://huggingface.co/BrutalCaesar/act_so101_cubcyl_recovery_chunk50_aug_3cam
- Ficha indexada de la variante chunk50: https://essamamdani.com/ai-models/hf-brutalcaesar-act-so101-cubcyl-recovery-chunk50-noaug-3cam
- Framework LeRobot: https://github.com/huggingface/lerobot
- No se han localizado papers, blogs ni demos adicionales especificos de este modelo en los resultados de busqueda disponibles.
