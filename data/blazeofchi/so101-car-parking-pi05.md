# blazeofchi/so101-car-parking-pi05

## Resumen

SO-101 car parking es un checkpoint compacto de pi0.5 (pi05), el modelo de politica vision-lenguaje-accion desarrollado por Physical Intelligence, afinado por el usuario blazeofchi para una tarea muy concreta de robotica: colocar un coche de juguete en su plaza de aparcamiento dentro del simulador MuJoCo, usando el brazo robotico SO-101. El modelo parte de `lerobot/pi05_base` y se ha entrenado mediante imitacion (flow matching supervisado) sobre 280 demostraciones scriptadas, lo que lo convierte en un ejemplo de ajuste fino de bajo coste de un VLA (vision-language-action) sobre un cuerpo robotico pequeno.

La relevancia es doble. Por un lado, demuestra el flujo completo de adaptacion de pi0.5 a una tarea concreta manteniendo congelado el backbone vision-lenguaje y entrenando solo el experto de acciones y las proyecciones de accion/tiempo. Por otro, el propio autor es transparente sobre sus resultados: el modelo no resuelve la tarea de forma fiable. En la evaluacion original sobre 20 escenas de desarrollo obtuvo 0 aparcamientos completos y 2 colocaciones parciales seguras; en cuatro disposiciones aleatorias posteriores con inferencia eager en BF16 no logro ni un aparcamiento completo ni parcial.

Se trata, por tanto, de un artefacto de investigacion y demostracion, no de un modelo listo para produccion. El repositorio pesa 1,8 GB, requiere CUDA con BF16 y un cargador personalizado del repositorio fuente, y no funciona como un checkpoint estandar de `PI05Policy.from_pretrained`. La licencia es Gemma, con las restricciones de uso de la seccion 3.2 de sus terminos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (VLA): backbone vision-lenguaje congelado (PaliGemma-3B, segun el tokenizer empaquetado) mas experto de acciones entrenable con flow matching |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la inferencia documentada usa BF16 en CUDA |
| Idiomas soportados | no disponible (las instrucciones son en lenguaje natural, sin lista de idiomas) |
| Licencia | Gemma Terms of Use (pesos y tokenizer); codigo y dataset de demostraciones bajo Apache-2.0 |
| Formato de pesos | no disponible (repo PyTorch de 1,8 GB; no se especifica safetensors ni GGUF) |
| Modelo base | lerobot/pi05_base (commit 22c30e5b34f9e7ab738b1b34fc2fc5ecfe2d28f0) |
| Tokenizer | google/paligemma-3b-pt-224 (commit 35e4f46485b4d07967e7e9935bc3786aad50687c) |
| Entradas | RGB cenital, RGB de muneca, instruccion en lenguaje natural y 6 posiciones articulares |
| Salidas | 6 objetivos articulares absolutos en radianes, a 20 Hz |
| Chunk de acciones | 50 frames; se ejecutan 10 antes de volver a observar |
| Hardware de inferencia | CUDA con BF16 |

## Arquitectura y entrenamiento

El modelo sigue la familia pi0.5 de Physical Intelligence: un backbone vision-lenguaje que procesa imagenes e instrucciones y un experto de acciones que genera trayectorias mediante flow matching. En este checkpoint concreto, segun la model card, la actualizacion 3000 entrena el experto de acciones y las proyecciones de accion y tiempo, mientras que el backbone vision-lenguaje permanece congelado. Esto reduce drasticamente el coste de ajuste y explica el tamano compacto del bundle (1,8 GB), que no incluye los pesos completos del backbone y debe reconstruirse a partir de `lerobot/pi05_base`.

El entrenamiento uso 280 demostraciones scriptadas (215.294 frames en total, mitad de empuje y mitad de recogida y colocacion), con 20 episodios de desarrollo separados del conjunto de entrenamiento. Se aplico flow matching supervisado con AdamW, tamano de lote 32, tasa de aprendizaje inicial 2,5e-5 y semilla 0. El chunk de acciones es de 50 frames y la ejecucion es recedente: se ejecutan 10 acciones antes de volver a observar. No se menciona RLHF ni DPO. La innovacion tecnica destacable es la combinacion de un backbone VLA preentrenado con un ajuste fino ligero sobre un robot de bajo coste (SO-101) en un simulador (MuJoCo), con un protocolo de evaluacion separado entre escenas de desarrollo y disposiciones aleatorias.

## Capacidades

- Generacion de acciones de control articular para un brazo SO-101 en MuJoCo: 6 objetivos articulares absolutos en radianes a 20 Hz.
- Comprension de instrucciones en lenguaje natural para guiar la colocacion del coche de juguete (tarea "language-guided").
- Percepcion visual multimodal: usa imagen RGB cenital e imagen RGB de muneca como entradas.
- Ejecucion de politicas de imitacion con chunk de acciones (50 frames, ejecucion de 10 antes de reobservar).
- Tareas de empuje y de recogida y colocacion (mitad del dataset de entrenamiento de cada tipo).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni otras capacidades generales de lenguaje.
- Capacidades multilingues: no disponibles.
- Inferencia solo en simulacion; no se evaluo en robot fisico.

## Casos de uso

- Investigacion en imitacion visual-motora: sirve como referencia reproducible de ajuste fino de pi0.5 sobre un cuerpo SO-101, con dataset de entrenamiento y validacion publicados, para estudiar como se comporta un VLA con backbone congelado en tareas de contacto.
- Docencia y prototipado en robotica de manipulacion: el bundle permite montar un pipeline completo (descarga, evaluacion con `so101-evaluate`, visualizacion en MuJoCo) con requisitos modestos de hardware, ideal para laboratorios que quieran experimentar con flow matching sin entrenar desde cero.
- Pruebas de protocolos de evaluacion: el autor separa explicitamente resultados sobre escenas de desarrollo y sobre disposiciones aleatorias, lo que lo convierte en un caso de estudio sobre como el sobreajuste a escenas de seleccion infla metricas.
- Base para ajuste adicional: al mantener congelado el backbone, es un punto de partida barato para reentrenar el experto de acciones con mas datos o con un curriculum mejor disenado.
- Analisis de fallos en colocacion precisa: las colisiones parciales del coche con la plaza documentadas en el video permiten estudiar errores de precision fina en politicas de imitacion.
- Demostracion de licencias y trazabilidad: util como ejemplo de gestion de artefactos derivados de Gemma y de como declarar pesos congelados reconstruibles y tokenizers de terceros.

## Benchmarks y rendimiento

| Evaluacion | Escenas | Aparcamientos completos | Colocaciones parciales seguras |
|---|---|---|---|
| Compilada original, checkpoint seleccionado | 20 de desarrollo | 0 | 2 |
| Inferencia eager BF16, disposiciones aleatorias | 4 | 0 | 0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de robotica como LIBERO) en la informacion disponible. Los dos protocolos no son comparables entre si y el autor los reporta por separado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio pesa 1,8 GB y el backbone debe reconstruirse desde `lerobot/pi05_base`, por lo que el consumo real depende de los pesos completos cargados.
- GPU recomendadas: no se especifican modelos concretos; se exige CUDA con soporte BF16 (por ejemplo, generaciones Ampere o posteriores).
- Cabe en GPU de consumo: no confirmado; la necesidad de BF16 y del backbone completo hace probable que requiera una GPU dedicada, pero no hay dato publicado.
- Opciones de despliegue: cargador personalizado del repositorio fuente (`so101-evaluate`), no compatible con `PI05Policy.from_pretrained` estandar; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; se conoce la frecuencia de control de 20 Hz y el esquema de chunk de 50 acciones con ejecucion de 10.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO-101 car parking (este) | no disponible | no disponible | Colocacion de coche de juguete con SO-101 en MuJoCo | Gemma | Hugging Face, requiere cargador propio |
| lerobot/pi05_base | no disponible | no disponible | VLA general base de pi0.5 | no disponible en la informacion | Hugging Face |
| Otros checkpoints LeRobot para SO-101 | no disponible | no disponible | Manipulacion con SO-101 | variable | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Fiabilidad muy baja: 0 aparcamientos completos en 24 escenas evaluadas entre ambos protocolos; la tarea "sigue siendo poco fiable" segun el autor.
- Solo simulacion: no se evaluo en robot fisico ni se midieron resultados terapeuticos o de otro tipo; no debe presentarse como sistema operativo real.
- Requiere cargador personalizado: no es un checkpoint autonomo de `PI05Policy.from_pretrained`; hay que usar el repositorio fuente y reconstruir los pesos congelados desde `lerobot/pi05_base`.
- Dependencia de CUDA y BF16: sin esa combinacion no se documenta inferencia funcional.
- Riesgo de sobreajuste a escenas: los 20 episodios de desarrollo se usaron tambien para seleccionar el checkpoint, y en disposiciones aleatorias el rendimiento cae a cero.
- Licencia Gemma: los pesos y el tokenizer estan sujetos a los terminos de Gemma, incluidas las restricciones de uso de la seccion 3.2; el uso comercial queda condicionado a dichos terminos. El codigo y el dataset sintetico son Apache-2.0 por separado.
- Idiomas y sesgos: no hay informacion sobre cobertura linguistica ni evaluacion de sesgos; las instrucciones son en lenguaje natural sin lista de idiomas soportados.
- Sin benchmarks estandar: no hay datos comparables con otros VLA, lo que impide situar el modelo en el estado del arte.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blazeofchi/so101-car-parking-pi05
- Dataset de entrenamiento: https://huggingface.co/datasets/blazeofchi/so101-car-parking-train
- Dataset de validacion: https://huggingface.co/datasets/blazeofchi/so101-car-parking-validation
- Repositorio fuente con el cargador: https://github.com/Parassharmaa/so101-car-parking
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Tokenizer de origen: https://huggingface.co/google/paligemma-3b-pt-224
- Video del proyecto: https://huggingface.co/blazeofchi/so101-car-parking-pi05/resolve/main/media/submission.mp4
- Demo en video: https://huggingface.co/blazeofchi/so101-car-parking-pi05/resolve/main/media/demo.mp4
