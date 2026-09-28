# Nickyang/Qwen3.6-35B-A3B-Razor-19B-A4B-E128of256

## Resumen

Qwen3.6-35B-A3B-Razor-19B-A4B-E128of256 es un checkpoint derivado de Qwen/Qwen3.6-35B-A3B al que se le ha aplicado RAZOR, un metodo de poda de expertos (expert pruning) sin entrenamiento. El autor del checkpoint es Nickyang y el metodo procede del paper "RAZOR: Pruning Replaceable Experts in LLMs" de Mingyang Song y Mao Zheng (arXiv:2609.30465). La operacion consiste en eliminar la mitad de los expertos enrutados de cada capa MoE: se conservan 128 de los 256 originales por capa, incluida la capa de prediccion multi-token (MTP).

El resultado es un modelo de 19.432.294.256 parametros totales (19.4B, de los cuales 19.0B excluyendo el modulo MTP), frente a los 35B del modelo base, manteniendo 8 expertos activos por token (top-k sin cambios) y ~4.0B parametros activos por token. No hubo actualizaciones de gradiente ni entrenamiento de recuperacion: los pesos retenidos son los del modelo base, y RAZOR solo aporta la seleccion del conjunto de expertos que se conserva. La poda afecta exclusivamente al conjunto de expertos enrutados; la atencion, el experto compartido, los embeddings, la LM head y las filas restantes del router quedan intactos.

La relevancia de este checkpoint es doble. Por un lado, reduce el almacenamiento de expertos de un modelo MoE de 35B a 19.4B sin reentrenar, lo que abarata el despliegue en VRAM. Por otro, sirve como artefacto reproducible de investigacion sobre poda de MoE: el autor publica el manifiesto de indices conservados y los comandos exactos de calibracion y poda. Existe un presupuesto alternativo, mas conservador, publicado por el mismo autor con 192 de 256 expertos por capa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) sobre decoder transformer; implementacion nativa `qwen3_5_moe` en Transformers; 40 capas MoE decoder |
| Parametros totales | 19.432.294.256 (19.4B); 19.0B excluyendo el modulo MTP |
| Parametros activos | ~4.0B por token (~3B en el modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en bfloat16; no se listan cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16, tensores de expertos apilados) |
| Expertos enrutados por capa MoE | 128 (el base tiene 256) |
| Expertos activos por token (top-k) | 8 (sin cambios respecto al base) |
| Expertos compartidos | 1 (sin cambios) |
| Modulo MTP | presente, podado con el mismo criterio de 128/256 |
| Tamano del repositorio | 38.9 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B (relacion: finetune) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder con capas de mezcla de expertos, tal y como la implementa la clase nativa `qwen3_5_moe` de Transformers. Cada capa MoE del modelo base dispone de 256 expertos enrutados, de los que se activan 8 por token, mas un experto compartido que participa siempre. El modelo incorpora ademas un modulo de prediccion multi-token (MTP), que tambien ha sido podado. No hay informacion disponible sobre el numero total de tokens de entrenamiento del modelo base, la composicion de su dataset ni si se aplicaron tecnicas de RLHF o DPO.

El entrenamiento de este checkpoint es inexistente en sentido estricto: RAZOR es un metodo de poda sin entrenamiento y sin recuperacion. El criterio de seleccion no mide la frecuencia ni la intensidad de activacion de un experto, sino si la computacion superviviente puede reemplazar su funcion. Para un token enrutado al conjunto S con pesos normalizados w_j, se define la mezcla enrutada c = sum(w_j f_j) y el residuo de consenso de cada experto r_j = f_j - c. Al eliminar un experto seleccionado i, el router promueve al experto no seleccionado mejor rankeado r, con pseudo-peso w_r igual a su score dividido por la suma original de scores seleccionados. El cambio local exacto de salida se calcula como delta_i = lambda * ||w_i r_i - w_r r_r||_2 / (1 - w_i + w_r), donde lambda es la escala de la salida enrutada. Los scores se agregan mediante raiz cuadratica media condicional sobre los tokens de calibracion enrutados a cada experto, y se retienen los expertos con mayor puntuacion por capa.

La calibracion utilizo filas de 32.768 tokens procedentes de RazorCal, un corpus multi-dominio de 2.048 muestras publicado junto a RAZOR. El manifiesto `kept_expert_indices.json` forma parte del repositorio y documenta el conjunto de expertos conservados en este checkpoint concreto. Dado que la seleccion depende de la muestra de calibracion, una ejecucion independiente reproduce el procedimiento, no exactamente este conjunto de expertos.

## Capacidades

- Generacion de texto y conversacion: la pipeline declarada es `text-generation` y el modelo incluye la etiqueta `conversational`, con plantilla de chat aplicable mediante `apply_chat_template`.
- Razonamiento y generacion general: el modelo deriva de un MoE de 35B del que conserva atencion, embeddings, LM head, router y experto compartido; no se documentan capacidades especificas adicionales.
- Capacidades multimodales: el repositorio incluye la etiqueta `image-text-to-text`, heredada de la definicion del modelo base, aunque la pipeline declarada de este checkpoint es de generacion de texto. No se aporta detalle adicional sobre el tratamiento de imagenes en este checkpoint.
- Prediccion multi-token: el modulo MTP se conserva (podado a 128 expertos), lo que mantiene la capacidad de decodificacion especulativa asociada a este tipo de modulo.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara lista de idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un MoE de gran tamano con VRAM reducida: al conservar 128 expertos por capa en lugar de 256, el checkpoint ocupa 38.9 GB en bfloat16, frente a los aproximadamente 70 GB que requeriria el modelo base de 35B en la misma precision. Es util cuando se quiere servir un modelo con ~4.0B parametros activos por token en un nodo de 80 GB sin recurrir a cuantizacion.
- Investigacion sobre poda de expertos: el repositorio incluye el manifiesto de indices, el pipeline de calibracion y los comandos de `razor saliency`, `razor prune` y `razor verify`, lo que permite replicar el procedimiento con otras ratios de poda (por ejemplo 0.25 frente al 0.5 de este checkpoint) y comparar presupuestos.
- Comparacion de presupuestos de poda: junto al checkpoint de 192 de 256 expertos del mismo autor, este modelo permite estudiar la curva de compromiso entre almacenamiento de expertos y fidelidad de generacion en una misma arquitectura base.
- Generacion conversacional multi-turno: mediante `apply_chat_template` y `AutoModelForCausalLM`, se puede integrar en asistentes conversacionales, siempre que se valide en el dominio objetivo, dado que el autor advierte de cambios en diversidad, formato y comportamiento de terminacion.
- Evaluacion de la degradacion inducida por la poda: util como linea base en estudios que midan retencion de tareas, estabilidad de formato y tasas de terminacion anomala tras eliminar el 50 % de los expertos enrutados de cada capa.
- Servicio de inferencia con requisitos de licencia permisiva: al distribuirse bajo Apache-2.0 y ser derivado de un modelo Apache-2.0, encaja en productos comerciales que necesiten una licencia sin restricciones de uso.
- Prototipado en una sola GPU de gama alta: con cuantizacion a 8 bits (aproximadamente 19.4 GB de pesos) el modelo puede caber en una RTX 4090 o RTX 3090 de 24 GB, aunque la cuantizacion no viene publicada y depende del soporte del runtime para la arquitectura `qwen3_5_moe`.
- Analisis de enrutamiento en MoE: las filas del router que sobreviven y el manifiesto de expertos conservados permiten estudiar que expertos resultan prescindibles segun el criterio de residuo de consenso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y se limita a senalar de forma cualitativa que el paper reporta retencion de exactitud en tareas junto con cambios en diversidad, formato y comportamiento de terminacion de las respuestas. No se deben asumir cifras concretas de rendimiento a partir de la informacion facilitada.

## Requisitos de hardware

- VRAM estimada en bfloat16: los pesos suman 19.432.294.256 parametros, lo que equivale a unos 38.9 GB (coincide con el tamano del repositorio). Con cache KV y overhead de runtime, se recomienda disponer de al menos 48-80 GB.
- VRAM estimada en 8 bits: aproximadamente 19.4 GB de pesos, mas overhead; se situa en torno a 24-32 GB.
- VRAM estimada en 4 bits: aproximadamente 9.7 GB de pesos, mas overhead; podria caber en GPUs consumer de 12-16 GB. Estas cifras son estimaciones aritmeticas derivadas del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: A100 80 GB o H100 80 GB para bfloat16 sin cuantizar; 2 x RTX 4090 24 GB (48 GB en total) de forma ajustada para bfloat16 con `device_map="auto"`.
- Cabe en GPU consumer: si, en 24 GB (RTX 3090, RTX 4090) con cuantizacion a 8 bits, y previsiblemente en 12-16 GB con cuantizacion a 4 bits, siempre que el runtime soporte la arquitectura.
- Opciones de despliegue: Transformers con una build que incluya la implementacion nativa `qwen3_5_moe`. No se ha publicado ninguna cuantizacion GGUF, por lo que el uso con llama.cpp u Ollama requeriria convertir los pesos previamente. No hay confirmacion de soporte en vLLM, TGI o SGLang en la informacion disponible.
- Latencia y throughput: no disponibles. Como referencia estructural, el coste de computo por token viene determinado por los ~4.0B parametros activos (top-k = 8 expertos mas el compartido), no por los 19.4B totales, por lo que la decodificacion deberia ser mas rapida que la de un modelo denso de 19.4B, manteniendo el coste por token practicamente igual al del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Expertos por capa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Razor 19B-A4B-E128of256) | 19.4B | ~4.0B | 128 de 256 (top-k 8) | Apache-2.0 | publico en HuggingFace |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | ~3B | 256 de 256 (top-k 8) | Apache-2.0 | publico en HuggingFace |
| Qwen3.6-35B-A3B-Razor-28B-A4B-E192of256 | no disponible en detalle en esta informacion | ~4.0B (segun nomenclatura del nombre) | 192 de 256 | Apache-2.0 | publico en HuggingFace |

No se dispone de datos de rendimiento comparado entre estos tres checkpoints en la informacion proporcionada, por lo que la comparativa se limita a parametros, presupuesto de expertos y licencia. No se han identificado en la documentacion otros modelos de la misma categoria con los que comparar de forma fiable.

## Limitaciones y advertencias

- La poda de expertos es una operacion con perdida. El propio autor advierte de que la retencion de exactitud en benchmarks y la fidelidad predictiva no garantizan una generacion estable: las respuestas pueden variar en diversidad, formato y comportamiento de terminacion incluso cuando la exactitud de tarea se mantiene en gran medida.
- El corpus de calibracion (RazorCal) es multi-dominio pero finito. El comportamiento en dominios alejados de el no esta caracterizado por las mediciones publicadas.
- La seleccion de expertos depende de la muestra de calibracion: dos ejecuciones independientes reproducen el procedimiento, no el mismo conjunto exacto de expertos. Esto implica que este checkpoint es un artefacto concreto de una calibracion particular.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; debe evaluarse por carga de trabajo.
- Idiomas soportados: no declarados. No se puede asumir cobertura multilingue concreta.
- Longitud de contexto: no disponible. No se debe asumir una ventana concreta sin verificarla en el modelo base.
- Compatibilidad de tooling: requiere una build de Transformers que contenga `qwen3_5_moe`; no hay cuantizaciones publicadas ni confirmacion de soporte en motores de inferencia alternativos, lo que puede complicar el despliegue en produccion.
- Licencia: Apache-2.0, sin restricciones adicionales documentadas para uso comercial. El codigo de RAZOR tambien es Apache-2.0, pero los registros de RazorCal estan sujetos a sus propios terminos (ver `data/LICENSE-DATA` en el repositorio de RAZOR).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: se trata de un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nickyang/Qwen3.6-35B-A3B-Razor-19B-A4B-E128of256
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Checkpoint alternativo (192 de 256 expertos): https://huggingface.co/Nickyang/Qwen3.6-35B-A3B-Razor-28B-A4B-E192of256
- Paper de RAZOR: https://arxiv.org/abs/2609.30465
- Codigo de RAZOR: https://github.com/nick7nlp/Razor
- Corpus de calibracion RazorCal: https://github.com/nick7nlp/Razor/tree/main/data
- Licencia de los datos de calibracion: https://github.com/nick7nlp/Razor/blob/main/data/LICENSE-DATA
