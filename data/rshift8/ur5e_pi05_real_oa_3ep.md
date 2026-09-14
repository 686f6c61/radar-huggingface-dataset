# rshift8/ur5e_pi05_real_oa_3ep

## Resumen

`rshift8/ur5e_pi05_real_oa_3ep` es un modelo Vision-Language-Action (VLA) especializado en manipulacion robotica, publicado por el usuario rshift8. Se trata de un ajuste fino de π₀.₅ (pi0.5) con un mecanismo de *obstacle-attention* (atencion a obstaculos) activado en modo exclusivo, es decir, sin los roles de objetivo (*target*) ni de destino (*destination*). El modelo se ha afinado durante 3 epocas sobre datos reales anotados de un robot UR5e, partiendo del checkpoint `mahgoobi/ur5e_pi05_all_3cam_20k`.

El problema que aborda es el control de un brazo robotico UR5e mediante instrucciones y percepcion visual, con especial enfasis en evitar colisiones u obstaculos presentes en la escena. Para ello supervisa las capas 0, 1 y 2 de la red e inyecta esa senal de atencion en las capas 15, 16 y 17, usando un modo de contacto con umbral beta de 20 cm. El espacio de accion es de 7 dimensiones (6 articulaciones en delta mas la pinza en valor absoluto).

Es relevante en el contexto de la investigacion en robotica porque explora tecnicas de *grounding* espacial (obstacle-attention) sobre un VLA de proposito general, y porque publica los checkpoints intermedios del entrenamiento, lo que facilita reproducir y comparar el efecto de cada fase. El repositorio ocupa 139,4 GB y no registra descargas ni *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (pi0.5) de Physical Intelligence, con *obstacle-attention* |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (espacio de accion de 7 dimensiones; no se especifica ventana de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo VLA; el lenguaje se usa como instruccion de *grounding*, no como generacion de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Orbax (checkpoint estilo openpi/JAX); no se publican en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura π₀.₅, un VLA que combina un *backbone* de vision-lenguaje con un modulo experto en acciones para producir comandos motores. Sobre esa base se anade el componente de *obstacle-attention* (OA): las capas 0, 1 y 2 se supervisan con una tasa de aprendizaje de 0,01 cada una y un mapa de calor con sigma de 15,0, y la senal resultante se inyecta en las capas 15, 16 y 17. En esta ejecucion se desactivan la atencion a objetivo (`target_attn=False`) y a destino (`dest_attn=False`), de modo que el mecanismo aprende unicamente a atender a obstaculos. El modo de atencion es de contacto, con umbral beta de 20 cm.

El ajuste fino se realizo durante 3 epocas (20.082 pasos frente a los 21.000 configurados), con un lote global de 48 y 3 GPU H200 en paralelo mediante FSDP. Los datos proceden de grabaciones reales de un UR5e con anotaciones de *grounding*, usando tres camaras (encimera, muneca derecha y lateral izquierda), paso de fotograma 1 y cinco tareas: cup-in-bowl, bowl-on-rack, mug-on-coaster, stack-two-cubes y place-three-cups. Las tareas que implican el libro (*put_book_in_box*, *put_book_in_box_amir*, *put_book_on_shelf*) se excluyeron por carecer de anotaciones laterales. El estado del optimizador (`train_state/`) no se publica.

## Capacidades

- Prediccion de acciones roboticas de 7 dimensiones: 6 articulaciones del UR5e en forma de delta mas la pinza en valor absoluto.
- Manipulacion guiada por lenguaje sobre cinco tareas concretas (cup-in-bowl, bowl-on-rack, mug-on-coaster, stack-two-cubes, place-three-cups).
- Percepcion multimodal con tres camaras simultaneas (encimera, muneca derecha, lateral izquierda).
- Atencion a obstaculos mediante el mecanismo obstacle-attention en modo contacto, orientado a evitar colisiones.
- *Grounding* espacial supervisado en capas tempranas e inyectado en capas intermedias.
- No se documenta soporte de *tool calling*, *function calling*, agentes multi-paso ni razonamiento encadenado; no es un modelo de lenguaje general.
- No se documentan capacidades de vision generativa, audio ni modo de pensamiento (*thinking mode*).

## Casos de uso

- Investigacion en manipulacion robotica: sirve como punto de partida reproducible para estudiar el efecto del mecanismo obstacle-attention en un VLA sobre un UR5e, gracias a que se publican los checkpoints intermedios.
- Tareas *pick-and-place* en laboratorio: el modelo puede colocar cubos apilados o piezas sobre soportes evitando obstaculos presentes en la escena, usando las cinco tareas para las que fue entrenado.
- Colocacion de objetos sobre superficies especificas: las tareas bowl-on-rack y mug-on-coaster permiten evaluar la precision de posicionamiento del brazo en entornos controlados.
- Benchmarking de VLA en hardware UR5e: al fijar el espacio de accion a 7 dimensiones y usar un conjunto de camaras concreto, facilita comparaciones entre variantes de pi0.5.
- Ajuste fino posterior: el checkpoint puede usarse como inicializacion (mediante el cargador de pesos de openpi) para nuevas tareas o nuevos robots, aplicando la misma tuberia de anotacion de *grounding*.
- Evaluacion de generalizacion espacial: el modo de contacto con umbral de 20 cm permite medir como responde el modelo ante obstaculos no vistos durante el entrenamiento.
- Docencia y formacion en robotica: el repositorio incluye el `TrainConfig` exacto y los `norm_stats.json`, lo que facilita reproducir un ciclo completo de entrenamiento e inferencia sobre openpi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito en tareas, tasas de colision ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Tamano del repositorio: 139,4 GB, distribuido en 11 checkpoints (pasos 2500, 5000, 6694, 7500, 10000, 12500, 13388, 15000, 17500, 20000 y 20082). Esto supone aproximadamente 12-13 GB por checkpoint (parametros mas activos), cifra estimada a partir del tamano total.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia basada en el tamano por checkpoint, un unico checkpoint en precision de 32 bits ocuparia del orden de 12-13 GB, y menos en 16 bits; estas cifras son una estimacion derivada del tamano del repositorio, no un dato confirmado por el autor.
- GPU recomendadas: el entrenamiento se realizo en 3 GPU H200 con FSDP. Para inferencia no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada. Si la estimacion de VRAM por checkpoint es correcta, un unico checkpoint podria cargarse en GPU de consumo con memoria suficiente, pero no hay confirmacion del autor.
- Opciones de despliegue: se carga como checkpoint Orbax de openpi (apuntando el cargador de pesos a `20082/params/` y usando `20082/assets/ur5e_real_grounding/norm_stats.json`). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea / robot | Mecanismo especial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rshift8/ur5e_pi05_real_oa_3ep | π₀.₅ (pi0.5) | Manipulacion UR5e, 5 tareas | obstacle-attention en modo contacto | Apache 2.0 | Checkpoints publicados (11 pasos) |
| mahgoobi/ur5e_pi05_all_3cam_20k | π₀.₅ (pi0.5) | Manipulacion UR5e, 3 camaras | no disponible | no disponible | Checkpoint base del anterior |
| sam-guided-vlas/...ur5e...pi05... | π₀.₅ (pi0.5) | Manipulacion UR5e (pila con poses aleatorias) | mascara guiada por SAM (*mask a75*) | no disponible | Repositorio en Hugging Face |
| π₀.₅ original (Physical Intelligence) | π₀.₅ (pi0.5) | Manipulacion general de robots | modelo base de proposito general | no disponible | Paper publico |

Los datos de parametros, contexto y rendimiento de estos modelos no estan disponibles en la informacion proporcionada, por lo que la comparacion se limita al enfoque tecnico, la licencia y la disponibilidad.

## Limitaciones y advertencias

- Modelo altamente especializado: solo se ha entrenado para cinco tareas concretas sobre un UR5e y tres camaras especificas; no es un modelo de proposito general.
- Excluye todas las tareas relacionadas con el libro por falta de anotaciones laterales, lo que limita su cobertura.
- No se documentan sesgos conocidos, pero al depender de datos reales de un unico robot y entorno, el riesgo de sobreajuste al dominio de laboratorio es alto.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de predicciones de accion incorrectas ante escenas fuera de distribucion.
- Sin resultados de benchmarks publicados: no hay evidencia cuantitativa de tasa de exito, robustez ni seguridad.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo de base (π₀.₅) y los datos de entrenamiento pueden tener sus propias condiciones que no se detallan en la model card.
- El estado del optimizador (`train_state/`) no se publica, por lo que reanudar el entrenamiento exactamente desde el ultimo paso no es posible con lo disponible.
- El formato de pesos es Orbax (openpi/JAX); no hay conversion a safetensors, GGUF ni otros formatos de amplio uso, lo que complica el despliegue fuera del ecosistema openpi.
- El repositorio ocupa 139,4 GB, lo que exige espacio de almacenamiento considerable incluso para descargar solo los checkpoints finales.
- No se especifican requisitos minimos de VRAM ni latencias, lo que dificulta planificar su uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rshift8/ur5e_pi05_real_oa_3ep
- Checkpoint base (warm start): https://huggingface.co/mahgoobi/ur5e_pi05_all_3cam_20k
- Modelo relacionado (sam-guided-vlas, pi05 sobre UR5e): https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__mask_a75__ur5e__pi05__seed_0__b25_from_panda45k
- Paper de π₀.₅: https://www.pi.website/download/pi05.pdf
