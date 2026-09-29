# chrisswanson/decider-4b-mlx-8bit

## Resumen

decider-4b-mlx-8bit es una conversion a 8 bits en formato MLX de Mapika/decider-4b (v2.1, revision `eb5fbdf`), realizada por el usuario chrisswanson para su ejecucion en Apple silicon. No es un modelo generativo: lee un estado (por ejemplo, el texto de una incidencia) junto con preguntas tipadas (si/no, eleccion multiple y puntuacion) y devuelve una probabilidad calibrada sobre las opciones de cada pregunta, calculada a partir de los logits de las letras de las opciones. Deriva a su vez de Qwen/Qwen3.5-4B-Base, con `model_type` `qwen3_5_text` y 4.205.751.296 parametros totales.

El interes de esta publicacion es doble. Por un lado, ofrece una version de 4,5 GB (frente a los 8,4 GB del bf16 original) que cabe con holgura en equipos Mac con memoria unificada moderada. Por otro, el autor documenta una validacion cuantitativa del efecto de la cuantizacion: sobre 1.779 elementos emparejados, el cambio de exactitud frente a bf16 es de +0,06 % (IC 95 % de -0,17 % a +0,28 %), con 5 respuestas invertidas (0,28 %), todas en empates tecnicos.

Es relevante para quien necesite componentes de decision deterministas y de una sola pasada (estilo System One) dentro de pipelines de clasificacion, enrutado o evaluacion, con probabilidades utilizables directamente para fijar umbrales, en lugar de un modelo conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de decodificacion derivado de Qwen3.5-4B-Base, `model_type` `qwen3_5_text` (cargar como `qwen3_5` en mlx-lm) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | MLX affine de 8 bits, group size 64 (8,5 bits por peso). El modelo de origen ofrece bf16; el repositorio Mapika/decider menciona ademas GGUF Q8_0 y Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 4,5 GB |
| Modelo base | Mapika/decider-4b v2.1 (revision `eb5fbdfc9448473ec25e399882912863afbdb70e`), a su vez fine-tune de Qwen/Qwen3.5-4B-Base |
| Tarea (pipeline) | text-classification |
| Libreria | mlx (convertido con mlx 0.32.3 y mlx-lm `3051e26`) |
| Tipos de pregunta | si/no, eleccion multiple, puntuacion |
| Temperaturas por tipo | choice 1,110; si/no 1,560; score 1,287 |
| Hash de `model.safetensors` | `4470340195ac16af5288b5c0fb1c5349aafcfbe1d55aea61a1932fbcc3e79481` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint es un transformer de decodificacion con `model_type` `qwen3_5_text`, heredado de Qwen3.5-4B-Base y ajustado por Mapika para producir una salida de decision en lugar de texto libre. El autor de la conversion indica explicitamente que mlx-lm todavia no incluye ese nombre en su registro, por lo que debe cargarse como `qwen3_5` (misma arquitectura, configuracion plana). No se documenta en la informacion disponible si la arquitectura emplea mezcla de expertos; el numero de parametros totales es el unico dato de tamano aportado.

El funcionamiento es de una sola pasada (estilo System One): el prompt presenta `Context:` con el estado, y a continuacion, para cada pregunta, el texto, las opciones etiquetadas con letras y una ranura `Answer: (`. Se toman los logits de las letras validas en esa posicion, se dividen por la temperatura del tipo de pregunta y se aplica softmax. Las preguntas de puntuacion se puntuan como filas si/no independientes y despues se normalizan; varias preguntas sobre el mismo estado se evaluan como filas independientes. No hay generacion de texto ni cadena de razonamiento.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO: la model card remite a la documentacion del modelo original. La unica intervencion documentada en este repositorio es la cuantizacion; `decider/`, `decider_config.json`, `eval_results.json`, el tokenizer y la plantilla de chat se copian sin cambios del repositorio de origen.

## Capacidades

- Clasificacion con salida calibrada: devuelve una distribucion de probabilidad sobre las opciones, no texto generado.
- Preguntas de si/no, con temperatura especifica de 1,560.
- Preguntas de eleccion multiple con opciones etiquetadas por letra, temperatura 1,110.
- Preguntas de puntuacion (score), evaluadas nivel a nivel como si/no y normalizadas, temperatura 1,287.
- Multitarea sobre un mismo estado: varias preguntas puntuadas como filas independientes, tal como hace el servidor de referencia del modelo de origen.
- Salida estructurada estable, adecuada para consumo programatico en pipelines.
- Inferencia en una sola pasada, sin decodificacion autoregresiva.
- Cobertura de clasificacion de pares texto-pregunta verificada en BoolQ, SQuAD 2, VitaminC y MASSIVE en-US.
- No soporta tool calling, function calling, uso como agente, razonamiento multipaso ni vision: no es un modelo generativo.
- Capacidad multilingue no documentada; el unico idioma declarado es el ingles.

## Casos de uso

- Enrutado de incidencias de soporte: el modelo recibe el texto de la reclamacion como estado y una pregunta de eleccion ("Que departamento debe gestionarlo?") con opciones tipo billing, technical support o sales. Devuelve probabilidades calibradas que permiten fijar umbrales de enrutado automatico y derivar a revision humana los casos con baja confianza.
- Evaluacion de respuestas en pipelines RAG: con el formato de SQuAD 2, una pregunta si/no sobre si el contexto recuperado responde o no a la consulta del usuario, lo que permite descartar respuestas no fundamentadas antes de mostrarlas.
- Moderacion y guardrails: series de preguntas si/no sobre politicas concretas aplicadas al mismo mensaje, con la probabilidad calibrada como senal de disparo y ajuste fino del umbral segun el coste relativo de falsos positivos y negativos.
- Analisis de encuestas y NPS: preguntas de tipo puntuacion sobre comentarios abiertos, normalizadas por el modelo, para obtener una valoracion numerica comparable entre respuestas.
- Clasificacion de intencion en asistentes: con opciones cerradas (por ejemplo, las 18 clases del conjunto MASSIVE en-US), adecuado para decidir la siguiente accion de un flujo conversacional sin coste de generacion.
- Etiquetado por lotes de resenas de producto: varias preguntas si/no, de eleccion y de puntuacion sobre el mismo texto, procesadas como filas independientes en un unico paso de servidor.
- Control de calidad en anotacion: comparacion de etiquetas humanas frente a la distribucion de probabilidad del modelo sobre las mismas preguntas, usando el margen entre opciones como medida de dificultad del ejemplo.
- Inferencia local y privada en Mac: al ser un checkpoint MLX de 4,5 GB, permite ejecutar el clasificador en un portatil Apple silicon sin enviar los datos a servicios externos.

## Benchmarks y rendimiento

Los valores son recuentos de aciertos sobre el total de filas indicado (no porcentajes), salvo la ECE. Datos del propio repositorio, medidos de extremo a extremo a traves de un servidor HTTP sobre las filas de evaluacion de la model card.

| Prueba | bf16 (MLX) | 8 bits (este repositorio) | Model card original |
|---|---|---|---|
| JevBench public, easy (48 elementos) | 48 | 48 | 48 |
| JevBench public, standard (72 elementos) | 71 | 71 | 71 |
| JevBench public, hard (111 elementos) | 73 | 72 | 72 |
| JevBench hard, ECE top-label | 0,153 | 0,163 | 0,184 |
| BoolQ (noul, 300 filas) | 260 | 260 | 260 |
| SQuAD 2 (noul, 299 filas) | 235 | 236 | 236 |
| VitaminC dev (choice, 599 filas) | 445 | 446 | 445 |
| MASSIVE en-US (choice, 18 opciones, 350 filas) | 302 | 302 | 302 |

Validacion adicional de la cuantizacion:

| Comprobacion | Resultado |
|---|---|
| Exactitud 8 bits frente a bf16 sobre 1.779 elementos emparejados | +0,06 % (IC 95 %: -0,17 % a +0,28 %) |
| Respuestas invertidas | 5 (0,28 %), todas con margen bf16 igual o inferior a 0,084 |
| Desplazamiento de calibracion (confianza media) | +0,0003 |
| ECE, NLL y Brier en subconjuntos Bespoke | dentro de aproximadamente 0,004 respecto a la model card |
| Verificacion del forward pass MLX frente a PyTorch/transformers bf16 (20 prompts) | coincidencia de argmax en 19 de 20; el restante es un empate exacto en PyTorch; 119 de 121 logits de letras identicos o a un paso bf16; diferencia maxima de probabilidad 0,028 |

No se han publicado resultados adicionales de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos: 4,5 GB en 8 bits (8,5 bits por peso); el bf16 de origen ocupa 8,4 GB.
- Plataforma: MLX requiere Apple silicon (serie M). No hay soporte de MLX para GPU NVIDIA o AMD.
- Memoria unificada estimada: 8 GB es el minimo ajustado para el checkpoint de 8 bits; 16 GB es el escenario comodo si se anaden el KV cache, el tokenizer y el resto del sistema. El tamano del KV cache no puede estimarse porque la longitud de contexto no esta documentada.
- Macs recomendados: cualquier equipo con 16 GB o mas de memoria unificada (M1/M2/M3/M4 y variantes Pro, Max o Ultra). En 8 GB, el 8 bits es la unica opcion viable de este modelo.
- GPU de datacenter (A100, H100) o de consumo (RTX 4090): no aplicables a este repositorio por depender de MLX. Para esos entornos habria que usar el bf16 original o las conversiones GGUF del modelo base con llama.cpp, Ollama o un runtime equivalente.
- Opciones de despliegue: mlx-lm (API de Python y servidor HTTP de referencia), y el codigo `decider/` incluido en el repositorio. Para GGUF, llama.cpp u Ollama sobre el modelo de origen, no sobre este checkpoint.
- Carga: debe indicarse `model_config={"model_type": "qwen3_5"}`, porque mlx-lm no reconoce aun el nombre `qwen3_5_text`.
- Latencia y throughput: no disponibles en la informacion proporcionada. La naturaleza de una sola pasada, sin decodificacion autoregresiva, implica un coste por consulta muy inferior al de un modelo generativo de tamano similar, pero no se aportan cifras.

## Comparativa con modelos similares

No se identifican en la informacion disponible modelos de terceros directamente comparables en la categoria de decision calibrada de una sola pasada. La comparacion mas util es con las variantes del propio linaje decider-4b.

| Version | Parametros | Formato / tamano | Entorno | Licencia |
|---|---|---|---|---|
| decider-4b-mlx-8bit (este repositorio) | 4,2 B | MLX 8 bits, 4,5 GB | Apple silicon | Apache 2.0 |
| Mapika/decider-4b (origen, bf16) v2.1 | 4,2 B | safetensors bf16, 8,4 GB | GPU y CPU, PyTorch/transformers | Apache 2.0 |
| decider-4b GGUF Q8_0 | 4,2 B | GGUF | llama.cpp, Ollama | Apache 2.0 |
| decider-4b GGUF Q4_K_M | 4,2 B | GGUF | llama.cpp, Ollama | Apache 2.0 |
| Qwen/Qwen3.5-4B-Base | 4,2 B | safetensors | multiplataforma | no disponible en la informacion proporcionada |

Segun el repositorio Mapika/decider, la calidad medida por archivo indica que Q8_0 iguala al bf16 y que Q4_K_M queda 0,2 puntos por debajo en la tarea. Las versiones v1 y v2 del modelo (temperaturas almacenadas de 1,05 y 1,935) quedan fuera de la comparacion directa con la v2.1, que es la que se cuantiza aqui.

## Limitaciones y advertencias

- No genera texto. No puede usarse para redaccion, resumen, traduccion ni dialogo; solo devuelve distribuciones sobre opciones predefinidas.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible. Al derivar de Qwen3.5-4B-Base y de un ajuste posterior, hereda los sesgos de ambos, no medidos aqui.
- Riesgo de alucinacion: en el sentido generativo no aplica, porque no produce texto libre; el riesgo equivalente es una probabilidad alta sobre una opcion incorrecta. La calibracion medida (ECE de 0,163 en JevBench hard) indica que las confianzas no son perfectas y deben usarse con umbrales explicitos.
- Idioma: unicamente ingles declarado. El uso con textos en castellano no esta evaluado ni soportado oficialmente, aunque se haya validado en tareas de clasificacion en ingles.
- Contexto: la longitud de contexto no esta documentada, lo que impide dimensionar el KV cache y fijar limites de entrada en produccion.
- Licencia: Apache 2.0, permisiva para uso comercial, con obligacion de atribucion a Mapika/decider-4b y a Qwen/Qwen3.5-4B-Base.
- Carga no estandar: mlx-lm no reconoce `qwen3_5_text` en su registro; si se omite la sobreescritura de `model_type`, la carga fallara.
- Dependencia de versiones: la conversion se realizo con mlx 0.32.3 y mlx-lm `3051e26`; otras versiones pueden alterar el forward pass. La verificacion del autor encontro una discrepancia maxima de 0,028 en probabilidad frente a PyTorch bf16, con un empate en 20 prompts.
- Trazabilidad: el repositorio no tiene descargas ni likes, y la validacion procede del propio autor de la conversion; conviene reproducir las comprobaciones antes de adoptarlo en produccion.
- Despliegue: al ser un checkpoint MLX, queda restringido a Apple silicon; no es portable a GPU NVIDIA sin reconvertir desde el modelo de origen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/chrisswanson/decider-4b-mlx-8bit
- Modelo de origen: https://huggingface.co/Mapika/decider-4b
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio GitHub del proyecto: https://github.com/Mapika/decider
- Model card detallada de la version 4B: https://github.com/Mapika/decider/blob/main/MODEL_CARD_4B.md
- Ficha tecnica de Decider 4B en gradually.ai: https://www.gradually.ai/en/ai-models/decider-4b/
