# shawshank1104/smolvla_bun_merged

## Resumen

`shawshank1104/smolvla_bun_merged` es un modelo de visión-lenguaje-acción (VLA) publicado por el usuario shawshank1104 en HuggingFace, entrenado específicamente para una tarea de recogida y colocación (*pick-and-place*) de bollos con el brazo derecho de un montaje robótico denominado `airoa`. No es un modelo de lenguaje conversacional: recibe imágenes de dos cámaras y una cadena de tarea, y produce directamente un bloque de 50 acciones articulares para el brazo. El repositorio contiene 450.046.176 parámetros en formato safetensors y ocupa 0,9 GB.

El modelo se apoya en SmolVLA y en el backbone VLM `HuggingFaceTB/SmolVLM2-500M-Video-Instruct`, cuya caché es un requisito explícito de inferencia según la model card. Se entrenó sobre 95 episodios con posiciones de bollo variadas y escenarios de uno y varios bollos, y se presenta como la tercera iteración de una serie de modelos para el mismo banco de pruebas, sustituyendo a `smolvla_finalforsure` (que trabajaba con una posición fija y una tarea con latas en lugar de bollos).

Su relevancia es acotada pero concreta: es un ejemplo reproducible de *fine-tuning* de un VLA pequeño (unos 450 M de parámetros) sobre un dataset propio generado con LeRobot, con validación en episodios no vistos y despliegue real en una NVIDIA Jetson AGX Thor. No se ha publicado licencia, ni benchmarks estándar, ni información de idiomas, y el modelo no cuenta con descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action); backbone VLM `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` mas experto de acciones con flow matching (deducido de la model card y del requisito de cache del VLM) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio distribuye pesos sin cuantizar en safetensors |
| Idiomas soportados | No disponible; las cadenas de tarea documentadas estan en ingles y se tokenizan literalmente |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,9 GB |
| Entradas | Imagenes de dos camaras: `head` y `right_arm` (la camara de pecho no se usa) |
| Salidas | Chunk de 50 acciones articulares (unos 1,7 s de trayectoria a bucle de 30 Hz) |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el esquema de SmolVLA: un backbone de vision-lenguaje (SmolVLM2-500M-Video-Instruct, cacheado aparte y requerido en tiempo de inferencia) que codifica las observaciones visuales y la instruccion textual, y una cabeza de accion entrenada con flow matching que genera un chunk de 50 pasos de acciones articulares. El contrato de entrada y salida es identico al de los modelos previos de la serie (`act_finalforsure` y `smolvla_finalforsure`), y la inferencia se ejecuta en bucle cerrado a 30 Hz con re-observacion cada 50 pasos.

El entrenamiento se realizo el 2026-09-15 sobre una instancia AWS g6e.4xlarge con una unica GPU NVIDIA L40S, durante 3 horas y 49 minutos, con LeRobot 0.6.1, transformers 5.5.4 y `num2words` como dependencias fijadas. La receta es de 20.000 pasos con batch 64 y semilla fija, la misma que en la iteracion anterior. El dataset de entrenamiento, `shawshank1104/bun_merged` (publico), consta de 95 episodios y se construyo combinando `shawshank1104/finalforsure` (tarea renombrada de "can" a "bun") con `shawshank1104/bun` (eliminando la camara de pecho) mediante `lerobot-edit-dataset` y `merge_datasets`. Se reservaron 10 episodios como conjunto de validacion (los 9 ultimos de un solo bollo y el ultimo multi-bollo).

La innovacion principal respecto al modelo anterior no es arquitectonica, sino de datos: la variabilidad de posiciones y la presencia de uno o varios bollos. La perdida de entrenamiento bajo de 1,83 a 0,032 y la norma del gradiente de 8,0 a 0,40 sin NaN ni reinicios. Conviene senalar que la `eval_loss` de flow matching registrada en `train_log.txt` sube de 0,36 a 0,74 durante el entrenamiento; el autor advierte explicitamente de que esa metrica penaliza un modelo mas agudo sobre datos no vistos y no refleja el error en espacio articular, por lo que no debe interpretarse como degradacion.

## Capacidades

- Manipulacion robotica condicionada por lenguaje: ejecuta la tarea `"pick up the bun and put it in the tray"` (un solo bollo) y `"pick up all the buns and put them in the tray"` (vaciar la mesa). Las cadenas se tokenizan literalmente y deben respetarse al caracter.
- Generacion de chunks de accion de 50 pasos con re-observacion en bucle cerrado cada 50 pasos sobre el brazo derecho del montaje `airoa`.
- Generalizacion a posiciones de bollo variadas dentro del espacio de trabajo grabado, incluyendo escenarios de uno y varios objetos.
- Percepcion visual desde dos vistas simultaneas (camara de cabeza y camara de brazo derecho).
- Verificacion offline determinista: el repositorio incluye `verify_policy.py`, que compara la salida contra un valor esperado (MAE primer paso 0,026; 50 pasos 0,066; huella 28,46926).
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision descriptiva: no es un modelo de chat.
- No soporta *tool calling*, *function calling* ni razonamiento multi-paso en el sentido de los agentes LLM.
- No hay capacidades multilingues declaradas: las instrucciones del dataset estan en ingles.
- No se documentan modos especiales (thinking, audio, vision general) mas alla del uso como politica VLA.

## Casos de uso

- Demostracion de pick-and-place de bollos en Jetson AGX Thor: es el caso para el que el autor lo diseno, con un bucle de 30 Hz y un chunk nuevo cada 0,5-1 s. Se usa cargando los pesos desde `/data/checkpoints/smolvla_bun_merged/pretrained_model` y ejecutando el mismo codigo de inferencia que la serie anterior.
- Vaciado de mesa con multiples objetos: la cadena `"pick up all the buns and put them in the tray"` esta entrenada sobre episodios multi-bollo, lo que permite usarlo para retirar varios elementos de una superficie de trabajo.
- Investigacion en VLA de bajo coste: con 450 M de parametros y un entrenamiento de menos de 4 horas en una sola L40S, sirve como punto de partida reproducible para estudiar recetas de fine-tuning con LeRobot sobre datos propios.
- Validacion offline en pipelines de CI: `verify_policy.py` permite comprobar en CPU o GPU que los pesos descargados producen exactamente los valores esperados antes de mover el brazo, integrable como paso previo al despliegue.
- Recogida de datos y aumento de variabilidad: la estrategia de fusion de datasets documentada (relabelado de tareas y eliminacion de una camara) es reutilizable para ampliar la cobertura de posiciones sin reentrenar desde cero.
- Pruebas de robustez frente a deriva en lazo abierto: con un error de chunk del 33 % de la desviacion tipica en episodios no vistos, es un banco de pruebas realista para medir el efecto de la frecuencia de re-observacion.
- Sustitucion de un modelo previo en una linea ya montada: al mantener el mismo contrato de entrada/salida que `smolvla_finalforsure` y `act_finalforsure`, se puede intercambiar como *fallback* o mejora sin reescribir el *pipeline*.
- Docencia y prototipado en robotica: permite mostrar un ciclo completo de teleoperacion, grabacion de episodios, entrenamiento y despliegue en hardware embebido con herramientas open source.

## Benchmarks y rendimiento

La model card no publica benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Lo que si aporta es el error de la accion predicha frente al operador, medido en unidades de desviacion tipica de la accion por articulacion (menor es mejor). "Held-out" corresponde a 40 fotogramas de los 10 episodios no vistos; "train", a 20 fotogramas de episodios de entrenamiento. La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente resultados sin relacion, de una cadena de pizzas).

| Modelo | Held-out primer paso | Held-out chunk de 50 | Train primer paso | Train chunk de 50 |
|---|---|---|---|---|
| `smolvla_finalforsure` (anterior) | 0,222 | 0,488 | 0,149 | 0,265 |
| `smolvla_bun_merged` @20k (este) | 0,125 | 0,331 | 0,033 | 0,063 |

Datos adicionales de entrenamiento y verificacion:

| Metrica | Valor |
|---|---|
| Mejora en primer paso sobre el modelo anterior (no visto) | 44 % |
| Mejora en chunk de 50 pasos sobre el modelo anterior (no visto) | 32 % |
| Perdida de entrenamiento | 1,83 -> 0,032 |
| Norma del gradiente | 8,0 -> 0,40 |
| `eval_loss` de flow matching | 0,36 -> 0,74 (el autor indica que no refleja el error en espacio articular) |
| Meseta del error held-out | Primer paso entre 0,124 y 0,128 en los checkpoints 10k-20k |
| Verificacion esperada (AWS) | MAE primer paso / std: 0,026; 50 pasos: 0,066; salidas finitas: True; huella: 28,46926 |

## Requisitos de hardware

- Pesos: 450.046.176 parametros, aproximadamente 0,9 GB en bf16/fp16 y 1,8 GB en fp32 (calculo aritmetico a partir del numero de parametros; el repositorio ocupa 0,9 GB).
- Memoria total de inferencia: no disponible. Hay que sumar a los pesos la cache del backbone SmolVLM2-500M-Video-Instruct y las activaciones de las dos camaras, pero el autor no publica cifras de VRAM.
- Hardware de entrenamiento documentado: 1x NVIDIA L40S en AWS g6e.4xlarge.
- Hardware de despliegue documentado: NVIDIA Jetson AGX Thor, con un coste de inferencia de aproximadamente 0,5-1 s por chunk de 50 acciones dentro de un bucle de 30 Hz.
- GPU consumer: no confirmado. Por tamano de pesos y por el backbone de 500 M, es plausible que quepa en GPUs de 8 GB o mas, pero no hay mediciones publicadas; debe tratarse como estimacion, no como dato verificado.
- Opciones de despliegue: LeRobot 0.6.1 con transformers 5.5.4 y `num2words`, ejecutado en el contenedor definido en `docker-compose.vla.yml`. La descarga se hace con `hf download shawshank1104/smolvla_bun_merged --local-dir ...` y requiere cachear aparte `HuggingFaceTB/SmolVLM2-500M-Video-Instruct`.
- vLLM, Ollama, llama.cpp o TGI: no aplican a este tipo de politica VLA y no estan documentados para este modelo.
- Latencia: 0,5-1 s por chunk (unos 1,7 s de trayectoria en lazo abierto por cada inferencia). El autor recomienda un *warm-up* de inferencia al arrancar para eliminar el retardo de la primera llamada a CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (held-out primer paso / chunk 50) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shawshank1104/smolvla_bun_merged` | 450.046.176 | No disponible | 0,125 / 0,331 | No disponible | Publico en HuggingFace, 0 descargas |
| `shawshank1104/smolvla_finalforsure` | No disponible | No disponible | 0,222 / 0,488 | No disponible | Publico en HuggingFace |
| `shawshank1104/act_finalforsure` | No disponible | No disponible | No disponible (ignora la cadena de tarea) | No disponible | Publico en HuggingFace |
| `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` | ~500 M (backbone, no es una politica) | No disponible en esta informacion | No aplica (modelo de vision-lenguaje) | No disponible en esta informacion | Publico en HuggingFace |

No se dispone de datos para comparar con otros VLA de referencia (por ejemplo, OpenVLA o pi0) porque la informacion proporcionada no incluye sus cifras en este montaje ni resultados comparables en el mismo dataset.

## Limitaciones y advertencias

- Licencia no declarada: no hay base legal explicita para uso comercial. Debe consultarse al autor antes de cualquier despliegue productivo.
- Sobreajuste apreciable: el error en datos de entrenamiento (0,033 en el primer paso) es casi cuatro veces menor que en episodios no vistos (0,125). El modelo conoce bien su distribucion de entrenamiento y bastante menos el resto.
- Deriva en lazo abierto: el error de 0,331 en el chunk de 50 pasos implica que la trayectoria de 1,7 s se desvia en posiciones novedosas; el sistema depende de la re-observacion cada 50 pasos para corregirla.
- Dependencia estricta del entorno fisico: la model card exige camaras montadas igual que durante la grabacion, la misma bandeja, la misma altura de mesa y el mismo tipo de bollo. Posiciones o iluminaciones fuera de lo cubierto por los 95 episodios son una apuesta.
- Cadenas de tarea tokenizadas literalmente: cambiar "bun" por "can" o alterar el texto rompe el comportamiento esperado. La cadena forma parte de la interfaz.
- Idioma: las instrucciones documentadas estan en ingles; no hay soporte multilingue declarado.
- Sin benchmarks estandar: no hay resultados de MMLU, HumanEval, GSM8K ni equivalentes, y no existe comparacion publica con otros VLA bajo las mismas condiciones.
- Metrica enganosa: la `eval_loss` de flow matching sube durante el entrenamiento (0,36 -> 0,74) sin que empeore el error articular. No debe usarse como criterio de seleccion de checkpoint.
- Riesgo de alucinacion en el sentido fisico: como politica de accion, puede generar trayectorias plausibles pero incorrectas ante entradas fuera de distribucion, sin ninguna senal de incertidumbre.
- Validacion externa nula: 0 descargas y 0 likes en el momento de la consulta, y la busqueda web no devolvio ninguna referencia independiente al modelo.
- Reproducibilidad sujeta a versiones: depende de LeRobot 0.6.1, transformers 5.5.4 y `num2words`; cambios de version pueden alterar la tokenizacion de la tarea o el formato de las acciones.
- Entrenamiento muy corto y con un unico seed (menos de 4 horas, 20.000 pasos): la varianza entre ejecuciones no esta caracterizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shawshank1104/smolvla_bun_merged
- Dataset de entrenamiento: https://huggingface.co/datasets/shawshank1104/bun_merged
- Dataset base (tarea relabelada de "can" a "bun"): https://huggingface.co/datasets/shawshank1104/finalforsure
- Dataset adicional (bollo, sin camara de pecho): https://huggingface.co/datasets/shawshank1104/bun
- Modelo anterior SmolVLA (posicion fija, tarea "can"): https://huggingface.co/shawshank1104/smolvla_finalforsure
- Modelo ACT de respaldo: https://huggingface.co/shawshank1104/act_finalforsure
- Backbone VLM requerido en cache: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- LeRobot (framework de entrenamiento e inferencia citado en la model card): https://github.com/huggingface/lerobot

Nota: no se han encontrado papers, blogs ni demos independientes sobre este modelo en la busqueda web realizada; los unicos enlaces verificables son los del propio autor en HuggingFace.
