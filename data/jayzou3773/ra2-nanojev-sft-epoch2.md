# jayzou3773/ra2-nanojev-sft-epoch2

## Resumen

ra2-nanojev-sft-epoch2 es un checkpoint de ajuste supervisado (SFT) sobre el modelo NanoJev de C-Tianyu, publicado por el usuario jayzou3773. No es un modelo generativo de texto al uso: se trata de un "choice model" nativo entrenado para seleccionar acciones dentro de partidas de Red Alert 2, es decir, para tomar decisiones discretas entre un conjunto de opciones permitidas en lugar de producir texto libre. Su arquitectura hereda el backbone Qwen/Qwen3-0.6B y anade una cabeza de decision propia de NanoJev, por lo que requiere un cargador especifico (DecisionPredictor) y no funciona con un pipeline estandar de generacion de texto.

El entrenamiento se realizo sobre 16.138 registros de entrenamiento y 1.461 de validacion, con un limite de contexto de 2.048 tokens por ruta candidata y un batch de 8 preguntas. El autor indica que se completaron dos epocas de las cuatro solicitadas, se recupero el mejor checkpoint guardado y se perdieron los pesos parciales de la tercera epoca; no se incluye estado de optimizador. La relevancia de esta ficha radica en su caracter de experimento acotado y reproducible: documenta un caso de ajuste de un modelo pequeno (familia 0.6B) para una tarea de decision en un videojuego, con trazabilidad de revisiones, hashes y metricas de clasificacion.

Se trata de un modelo en fase experimental, con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado y sin licencia especificada. El repositorio ocupa 2,4 GB y solo soporta ingles como idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza de decision (choice head) de NanoJev; backbone Qwen/Qwen3-0.6B |
| Parametros totales | no disponible (backbone de aproximadamente 600 millones de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens por ruta candidata (limite de inferencia del run RA2); config.json conserva un max_length=8192 heredado que no describe este fine-tuning |
| Tipos de cuantizacion | no disponible (pesos en FP32, forward en BF16; no se documentan formatos cuantizados) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (best.safetensors); incluye config.json, backbone_config/, tokenizer/ y ficheros JSON de procedencia |

## Arquitectura y entrenamiento

El modelo parte de NanoJev (revision 76fdfc9ecdca45a9bcef17991a07d3041a87685a) y de su padre C-Tianyu/NanoJev (revision 047b927b30882a1138fc504821b82ac145a4b81a), cuyo backbone es Qwen/Qwen3-0.6B (revision c1899de289a04d12100db370d81485cdf75e47ca). La innovacion estructural clave es que no genera texto de accion libre, sino que resuelve una eleccion entre opciones predefinidas mediante la cabeza de decision nativa de NanoJev. Por tanto, la preparacion de entrada, el formato de observacion y las reglas de accion no siguen el esquema habitual de un LLM: el autor remite a CONTEXT_AND_CHOICES.md para el formato de observacion, el presupuesto de tokens, las opciones por etapas, la permutacion objetivo y las reglas de accion.

El ajuste se realizo con 16.138 registros de entrenamiento y 1.461 de validacion, con learning rates de 1e-5 para el backbone y 1e-4 para la cabeza, batch de 8 preguntas y un limite de contexto de 2.048 tokens por ruta candidata. La numerica empleada fue FP32 para parametros y BF16 para el forward. Solo se completaron dos epocas de las cuatro solicitadas; el mejor checkpoint guardado corresponde a la epoca 2 y no se incluye estado de optimizador. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Seleccion de acciones discretas en el contexto de Red Alert 2: el modelo elige entre opciones permitidas segun el estado de la partida, no redacta acciones en texto libre.
- Prediccion de decisiones con cabeza nativa (choice head), invocada mediante DecisionPredictor con `max_length=2048`, `device_name="cuda:0"` y `precision="bf16"`.
- Preparacion de entrada especifica: requiere el formato de observacion, el presupuesto de tokens y las reglas de accion descritos en CONTEXT_AND_CHOICES.md.
- Soporte de procesamiento por lotes de preguntas (el run registro batch_questions=1 en inferencia y batch de 8 en entrenamiento).
- Capacidad limitada al ingles, unico idioma declarado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento. El modelo es explicitamente un choice model y no un generador de texto libre.

## Casos de uso

- Investigacion en modelos de decision para videojuegos: sirve como checkpoint de referencia para estudiar como un backbone de 0.6B se adapta a una tarea de eleccion discreta en un entorno de estrategia en tiempo real.
- Reproduccion de experimentos de SFT: el repositorio publica hashes SHA-256, revisiones de padre y backbone, y un JSON de procedencia (RA2_TRAINING_PROVENANCE.json) que permiten replicar el run y auditar los artefactos.
- Evaluacion comparativa de checkpoints: al conservar metricas de perdida y precision de eleccion por epoca, permite comparar epocas o variantes de ajuste dentro del mismo pipeline.
- Analisis de robustez en decisiones secuenciales: util para medir como un choice model se comporta ante estados de partida con presupuesto de contexto acotado (2.048 tokens por ruta candidata).
- Base para experimentos de ajuste posterior (por ejemplo, continuar desde la epoca 2 o reentrenar con las cuatro epocas previstas), dado que se publican los pesos completos.
- Docencia y prototipado de sistemas de decision: el modelo ilustra el uso de una cabeza de clasificacion sobre un transformer pequeno para tareas de eleccion, integrable mediante scripts personalizados en lugar de pipelines genericos.
- No es adecuado, tal como se distribuye, para atencion al cliente, generacion de codigo, resumen o cualquier tarea de generacion de texto: el autor indica que no genera texto de accion libre y que un pipeline estandar de text-generation no es sustituto valido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor proporciona metricas de clasificacion registradas durante el entrenamiento (perdida de entrenamiento, perdida de validacion y precision de eleccion en validacion), que no son tasas de victoria en partidas:

| Epoca | Perdida de entrenamiento | Perdida de validacion | Precision de eleccion en validacion |
|---|---:|---:|---:|
| 1 | 0,200490 | 0,516394 | 0,859001 |
| 2 | 0,079539 | 0,094461 | 0,973306 |

El autor advierte explicitamente de que estas metricas son del clasificador y no equivalen a tasas de victoria. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 2,4 GB (tamano del repositorio); en BF16 el peso se reduce a alrededor de 1,2 GB, a lo que hay que sumar la cache KV para 2.048 tokens por ruta candidata y el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM resulta suficiente para el checkpoint en BF16; el autor registra el uso de `device_name="cuda:0"` sin especificar modelo de GPU.
- Cabe en GPU de consumo: si, dado el tamano del backbone (0.6B) y el limite de contexto de 2.048 tokens; el autor no documenta pruebas en GPUs concretas.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. El unico procedimiento indicado es cargar el checkpoint con el DecisionPredictor nativo de NanoJev mediante los scripts del repositorio fuente (scripts/predict_toy_decisions.py), no con pipelines genericos.
- Entorno de referencia: Python 3.12.13, PyTorch 2.7.0+cu126 y Transformers 5.17.0.
- Latencia y throughput: no disponible. Esta publicacion no incluye una nueva prueba de inferencia ni de partida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ra2-nanojev-sft-epoch2 | no disponible (backbone ~0.6B) | 2.048 tokens por ruta candidata | Choice model para Red Alert 2 | no disponible | Checkpoint publicado en HuggingFace, 0 descargas |
| C-Tianyu/NanoJev (padre) | no disponible | no disponible | Choice model generico de NanoJev | no disponible | Modelo base publicado en HuggingFace |
| Qwen/Qwen3-0.6B (backbone) | aproximadamente 600 millones | no disponible | LLM de generacion de texto | no disponible | Modelo base publicado por Qwen |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada, ni de otros modelos de decision de videojuegos con los que contrastar. La comparativa se limita a la relacion de dependencia entre el checkpoint y sus antecesores.

## Limitaciones y advertencias

- El modelo no genera texto de accion libre: es un choice model y requiere el formato de observacion, el presupuesto de tokens y las reglas de accion nativos de NanoJev.
- Un pipeline estandar de text-generation no es un sustituto valido; hay que usar el DecisionPredictor y la preparacion de entrada nativos.
- Solo se completaron dos de las cuatro epocas previstas; el autor pide explicitamente que no se describa esta publicacion como un run completo de cuatro epocas.
- No se incluye estado de optimizador, lo que complica reanudar el entrenamiento exactamente desde el punto de parada.
- La licencia no esta especificada, por lo que no puede confirmarse el uso comercial. El autor indica que la publicacion no establece una nueva licencia para los ficheros del modelo padre ni para los activos del juego.
- No se incluye el motor del juego, los activos del juego ni un ejecutor de partidas independiente; sin ese entorno no puede reproducirse una partida de principio a fin.
- config.json se conserva byte a byte del checkpoint guardado e incluye campos heredados del entrenamiento padre (rutas antiguas y max_length=8192) que no describen el fine-tuning de Red Alert 2 ni su limite de inferencia de 2.048 tokens.
- Las metricas publicadas son del clasificador y no tasas de victoria; el modelo puede seleccionar acciones permitidas que conduzcan a la derrota.
- Idiomas: unicamente ingles.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al no tratarse de un modelo generativo de texto libre, el modo de fallo relevante es la eleccion de acciones suboptimas o erroneas.
- No se han publicado sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayzou3773/ra2-nanojev-sft-epoch2
- Dataset de entrenamiento: https://huggingface.co/datasets/jayzou3773/ra2-nanojev-sft
- Modelo padre (NanoJev): https://huggingface.co/C-Tianyu/NanoJev
- Backbone (Qwen3-0.6B): https://huggingface.co/Qwen/Qwen3-0.6B
- Referencia de contexto y opciones del repositorio: CONTEXT_AND_CHOICES.md (incluido en el repositorio del modelo)
- Procedencia del entrenamiento: RA2_TRAINING_PROVENANCE.json (incluido en el repositorio del modelo)
- Referencia de diseno de partida: MATCH_DESIGN_REFERENCE.json (incluido en el repositorio del modelo)
- Manifiesto de integridad: SHA256_MANIFEST.json (incluido en el repositorio del modelo)

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los resultados obtenidos no guardan relacion con el contenido de esta ficha y se han descartado.
