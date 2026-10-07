# arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_20k

## Resumen

`arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_20k` es un ajuste fino del modelo de robotica π₀.₅ (`lerobot/pi05_base`) sobre el conjunto de datos `Ameyapores/pick_block_eef_position_abs`, un dataset de 35 episodios de un brazo Franka (9.181 fotogramas a 25 fps) con una unica tarea de recogida de bloques. Lo publica el usuario arkojit1 y esta pensado para ejecutarse con LeRobot 0.6.1 mediante el tipo de politica `pi05`. No es un adaptador LoRA: el repositorio contiene los pesos completos de la politica y el entrenamiento actualizo unicamente el *action expert* y las proyecciones (~0,69B parametros entrenables), dejando congelados el codificador de vision SigLIP y el backbone Gemma-2B.

El modelo resuelve el problema clasico de vision-lenguaje-accion (VLA): dado un par de imagenes de 224x224 (`cam0` y `cam2`, con un tercer slot de imagen rellenado con `empty_cameras=1`) y un estado de 4 dimensiones, predice la posicion absoluta del efector final `[x, y, z, gripper]` para el siguiente fotograma. El checkpoint publicado es el ultimo paso (20.000) de una ejecucion cuyo mejor resultado de evaluacion se obtuvo en el paso 4.800, por lo que el autor advierte de sobreajuste respecto a ese punto.

Su relevancia es acotada: es un artefacto de investigacion reproducible, con una sola tarea, sin licencia declarada y sin benchmarks de tasa de exito, util como referencia de ajuste fino completo de π₀.₅ en entornos Franka y no como politica de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) π₀.₅: codificador SigLIP + backbone Gemma-2B + action expert tipo flow matching; SigLIP y Gemma-2B congelados durante el ajuste |
| Parametros totales | 4.143.404.816 (~4,14B, segun safetensors) |
| Parametros activos | no aplica (no es MoE); ~0,69B parametros entrenables en el ajuste (action expert + proyecciones) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. Entrada: dos imagenes de 224x224 (mas un slot rellenado) y estado de 4 dimensiones |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (bf16, segun el entrenamiento). No se documentan variantes GGUF, 8-bit ni 4-bit |
| Idiomas soportados | no disponible; es una politica visomotora, no un modelo generativo de texto |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 9,4 GB) |
| Libreria / framework | LeRobot 0.6.1 (`--policy.type=pi05`) |
| Modelo base | lerobot/pi05_base |
| Dataset de ajuste | Ameyapores/pick_block_eef_position_abs |
| Espacio de accion | Absoluto: `[x, y, z, gripper]`, posicion absoluta del efector final en el siguiente fotograma (mismas unidades que `observation.state[:3]`) + objetivo binario de pinza (0/1) |
| Normalizacion | Cuantiles q01–q99 para estado y accion |
| Fecha de publicacion (metadatos) | 7 de octubre de 2026 |

## Arquitectura y entrenamiento

La politica sigue el diseno π₀.₅ implementado en LeRobot: un modelo vision-lenguaje-accion que combina un codificador de imagen SigLIP con un backbone de lenguaje Gemma-2B y un modulo especializado en acciones entrenado por *flow matching*. En este ajuste fino se congela toda la torre de vision y de lenguaje y solo se optimizan el action expert y las proyecciones asociadas (`--train_expert_only`), lo que da aproximadamente 0,69B parametros entrenables sobre un total de 4,14B. Los datos de entrenamiento son 35 episodios de un Franka, 9.181 fotogramas a 25 fps, una unica tarea y cuatro dimensiones de estado. El autor indica explicitamente que no es un adaptador LoRA, sino un ajuste fino completo del action expert con los pesos de politica completos en el repositorio.

La configuracion de entrenamiento fue: batch global de 32 (4 GPU x 8), optimizador AdamW con LR maximo 2,5e-5 y decaimiento coseno hasta 2,5e-6 a lo largo de 20.000 pasos, 666 pasos de calentamiento, precision bf16, gradient checkpointing, `torch.compile` en modo por defecto, aumento de imagen activado, `chunk_size` 50 y `n_action_steps` 50. El checkpoint publicado es el final del calendario (paso 20.000, ~79 epocas). El entrenamiento usa aumentacion de imagen y prediccion de trozos de 50 acciones, lo que implica que cada inferencia cubre dos segundos de trayectoria a 25 fps.

## Capacidades

- Generacion de trayectorias de manipulacion: predice la posicion absoluta del efector final `[x, y, z]` y el estado de la pinza para el siguiente fotograma.
- Control de pinza binario: salida de apertura/cierre (0/1) integrada en el mismo vector de accion.
- Percepcion visomotora bimodal: consume simultaneamente dos vistas de camara de 224x224 (`cam0`, `cam2`) mas un estado de 4 dimensiones.
- Ejecucion por trozos (action chunking): emite 50 acciones por inferencia y las ejecuta en bucle abierto hasta la siguiente re-planificacion.
- Tarea unica especializada: recogida de bloques (`pick_block`) con posicionamiento absoluto del efector final.
- No soporta *tool calling*, function calling, agentes multi-paso ni razonamiento simbolico: no es un modelo de lenguaje conversacional.
- No tiene capacidades multilingues ni de generacion de texto, codigo, matematicas, audio o dialogo.
- No dispone de *thinking mode* ni de modos especiales de inferencia documentados.

## Casos de uso

- Recogida de bloques en banco de pruebas Franka: el modelo ejecuta la tarea concreta sobre la que fue ajustado, con estado de 4 dimensiones y dos camaras; es el unico escenario para el que hay evidencia de entrenamiento.
- Reproduccion de experimentos de ajuste fino VLA: sirve como referencia de un ajuste completo del action expert de π₀.₅ (no LoRA) con una receta concreta (batch 32, LR 2,5e-5, 20.000 pasos) para comparar con otras recetas.
- Estudio de sobreajuste en politicas VLA: el par de checkpoints del mismo run (paso 4.800 con eval 0,0576 frente al paso 20.000 con eval 0,0839) permite analizar como la perdida de entrenamiento baja mientras la de validacion sube en datasets pequenos.
- Comparacion absoluto frente a delta: junto a `arkojit1/pi05_pick_block_eef_delta`, permite medir el efecto de parametrizar la accion como posicion absoluta o como incremento en la misma tarea y robot.
- Docencia y prototipado en robotica: ejemplo autocontenido de politica VLA ejecutable con `lerobot-eval` en un laboratorio con un Franka y dos camaras.
- Base para un segundo ajuste: al contener los pesos completos de la politica, puede servir de punto de partida para reajustar sobre un dataset mayor o con mas tareas, aunque no hay validacion publicada de ese uso.
- No es adecuado para atencion al cliente, generacion de codigo, analisis de documentos ni ninguna tarea de lenguaje: carece de esas capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (tasa de exito, MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. La unica metrica reportada es la perdida de *flow matching* sobre 4 episodios reservados (31–34), que no equivale a exito en la tarea.

| Metrica | Este checkpoint (paso 20.000) | Mejor checkpoint del run (paso 4.800) |
|---|---|---|
| Perdida de flow matching (eval, 4 episodios) | 0,0839 | 0,0576 |
| Perdida de entrenamiento | 0,034 | 0,056 |
| Dispersion del eval punto a punto | ±0,005–0,01 | no disponible |
| Tasa de exito en la tarea | no medida | no medida |

El autor indica que, tras el paso 4.800, la perdida de entrenamiento siguio bajando mientras la de evaluacion aumento, es decir, este checkpoint esta sobreajustado respecto al de 4.800 segun la metrica de validacion. Si ese sobreajuste afecta a la tasa de exito real no ha sido medido.

## Requisitos de hardware

No hay requisitos publicados por el autor; las cifras siguientes son estimaciones derivadas del recuento de parametros (4,14B) y no deben tomarse como datos oficiales.

- VRAM estimada para inferencia: ~8,3 GB solo de pesos en bf16; en la practica, con activaciones de dos codificadores de imagen de 224x224 y decodificacion de trozos de 50 acciones, son razonables ~10–14 GB en bf16. En 8-bit, ~5–7 GB; en 4-bit, ~3–5 GB (cuantizacion no documentada ni soportada oficialmente por el repositorio).
- GPU recomendadas para entrenamiento o despliegue comodo: A100 40/80 GB, H100, L40S o similares con 24 GB o mas.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16 con margen; en RTX 4080 (16 GB) es ajustado pero viable; en RTX 3060 (12 GB) requeriria reducir precision o cuantizar. El ajuste fino original uso 4 GPU con batch 8 por GPU.
- Opciones de despliegue: LeRobot 0.6.1 mediante `lerobot-eval --policy.path=arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_20k`, sobre PyTorch con bf16 y `torch.compile`. vLLM, TGI, llama.cpp y Ollama no son aplicables: no es un modelo de lenguaje de texto y no existen pesos GGUF.
- Latencia y throughput: no publicados. Como implicacion aritmetica de `chunk_size` 50 y `n_action_steps` 50 a 25 fps, el bucle puede re-planificar una vez cada 2 segundos (0,5 Hz) en modo estrictamente abierto; no se documentan tiempos reales por inferencia.
- Entrenamiento: bf16, gradient checkpointing y `torch.compile` en modo por defecto, con batch global 32 repartido en 4 GPU (8 por GPU).

## Comparativa con modelos similares

| Modelo | Parametros totales | Tipo de accion | Checkpoint | Licencia | Notas |
|---|---|---|---|---|---|
| arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_20k (este) | 4.143.404.816 | Absoluta EEF `[x,y,z,gripper]` | Paso 20.000 (final) | no disponible | Fine-tune completo del action expert; eval 0,0839 |
| arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_4.8k | no disponible (mismo run) | Absoluta EEF | Paso 4.800 (mejor eval) | no disponible | Mejor eval del run: 0,0576 |
| arkojit1/pi05_pick_block_eef_delta | no disponible | Delta (incremental) | no disponible | no disponible | No intercambiable con los modelos de accion absoluta |
| lerobot/pi05_base | no disponible en la informacion (el ajuste parte de el) | no disponible | Base preentrenado | no disponible | Modelo de partida sin ajustar a la tarea |

No se dispone de datos suficientes sobre alternativas de otros autores (por ejemplo, otras politicas VLA de tamano comparable) para establecer una comparacion cuantitativa de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Sesgos: no documentados. El dataset es de un unico robot, un unico laboratorio y una unica tarea, por lo que el modelo heredara cualquier sesgo de esa configuracion fisica y de calibracion.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de predicciones fisicamente invalidas fuera de la distribucion de entrenamiento, con consecuencias directas sobre el robot.
- Region de entrenamiento estrecha: el rango de posiciones visto es x 0,528–0,559, y 0,056–0,068, z 0,145–0,311. Cualquier objetivo fuera de ese cubo es extrapolacion y no esta validado.
- Sobreajuste medido: la perdida de evaluacion del checkpoint final (0,0839) es peor que la del paso 4.800 (0,0576) mientras la de entrenamiento sigue bajando; se desconoce el impacto real en la tasa de exito.
- Metrica inadecuada para produccion: el autor reporta perdida de flow matching, no tasa de exito de la tarea. No hay evidencia publicada de que el modelo complete la tarea con exito.
- Espacio de accion no intercambiable: la salida es posicion absoluta del efector final mas pinza binaria. Sustituir este modelo por uno de acciones delta (o al reves) sin cambiar el controlador puede provocar movimientos peligrosos.
- Dependencia de hardware y calibracion: exige dos camaras de 224x224 en las posiciones `cam0` y `cam2`, estado de 4 dimensiones y las mismas unidades y marco de referencia que `observation.state[:3]`.
- Limitaciones de idioma y contexto: no es un modelo de lenguaje; no procesa instrucciones textuales arbitrarias ni mantiene contexto conversacional.
- Licencia no disponible: al no declararse licencia, el uso comercial y la redistribucion quedan en un limbo legal. Debe aclararse con el autor antes de cualquier despliegue productivo.
- Datos limitados: 35 episodios y 9.181 fotogramas son un volumen muy reducido para generalizacion; el tercer slot de imagen de π₀.₅ se rellena artificialmente (`empty_cameras=1`).
- Sin soporte de cuantizacion oficial: no hay GGUF ni variantes de baja precision publicadas, lo que limita el despliegue en hardware modesto.
- Estado de mantenimiento: 0 descargas y 0 *likes* en el momento de la consulta; es un artefacto de investigacion sin senales de adopcion ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de ajuste: https://huggingface.co/datasets/Ameyapores/pick_block_eef_position_abs
- Checkpoint con mejor evaluacion del mismo run: https://huggingface.co/arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_4.8k
- Variante de acciones delta: https://huggingface.co/arkojit1/pi05_pick_block_eef_delta
- LeRobot (framework de ejecucion y entrenamiento): https://github.com/huggingface/lerobot

Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre el modelo ni sobre π₀.₅; los enlaces devueltos eran contenido no relacionado y se han descartado. No se han localizado papers, blogs ni demos adicionales en la informacion disponible.
