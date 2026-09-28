# Nickyang/DeepSeek-V4-Flash-0731-Razor-156B-A15B-E128of256

## Resumen

DeepSeek-V4-Flash-0731-Razor-156B-A15B-E128of256 es un checkpoint derivado del modelo base DeepSeek-V4-Flash-0731 al que se le ha aplicado RAZOR, un metodo de poda de expertos (expert pruning) sin entrenamiento. La poda elimina la mitad de los expertos enrutados de cada capa MoE: se conservan 128 de los 256 expertos originales en las 43 capas MoE, incluidas las tres capas de hash por token-ID y las capas de prediccion multi-token (MTP). No se aplico ningun tipo de recuperacion ni ajuste fino: los pesos retenidos son los del modelo base.

El resultado es un modelo con 155.979.924.030 parametros totales (~156B, de los cuales ~146B excluyendo el modulo MTP), frente a los ~304B del base, y unos ~14,8B parametros activos por token frente a los ~21B del original. El top-k de expertos activos por token se mantiene en 6 y el numero de capas MoE no cambia. La atencion, los expertos compartidos, el embedding y la LM head permanecen intactos. Los expertos enrutados se almacenan en MXFP4 y los compartidos en FP8 con escalas UE8M0, igual que en el modelo base.

Su relevancia practica es de investigacion en eficiencia de inferencia: demuestra que es posible recortar aproximadamente la mitad de los parametros de un MoE grande sin reentrenar, manteniendo la topologia funcional del modelo. Es un artefacto de publicacion (0 descargas, 0 likes en el momento de la consulta), publicado bajo licencia MIT y validado mediante comprobaciones a nivel de tensor contra el plan de poda, no mediante una pasarela de equivalencia de logprobs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con 43 capas MoE enrutadas, 3 capas de hash por token-ID y modulo de prediccion multi-token (MTP); expertos podados con RAZOR |
| Parametros totales | 155.979.924.030 (~156B); ~146B excluyendo el modulo MTP |
| Parametros activos | ~14,8B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados en MXFP4 (4 bit); expertos compartidos en FP8 con escalas UE8M0; etiquetas del repo: 8-bit, fp8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Expertos enrutados por capa MoE | 128 de 256 (top-k activo: 6, sin cambios) |
| Capas MoE | 43 (sin cambios) |
| Tamano del repositorio | 88,1 GB |
| Modelo base | deepseek-ai/DeepSeek-V4-Flash-0731 |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base: un transformer con mezcla de expertos en el que las capas MoE enrutadas contienen 128 expertos tras la poda, con 6 expertos activos por token, mas las capas de hash por token-ID (las tres primeras, `num_hash_layers: 3`) que no disponen de puntuaciones de router aprendidas. La innovacion de este checkpoint no esta en el entrenamiento, sino en la seleccion de expertos: RAZOR es un metodo de poda sin gradientes (training-free) que no pregunta con que frecuencia se activa un experto, sino si el resto de la computacion superviviente puede sustituir su funcion.

El criterio de seleccion se basa en el residuo de consenso. Para un token enrutado al conjunto S con pesos normalizados, se define la mezcla enrutada c y el residuo r_j = f_j - c de cada experto. Al eliminar un experto seleccionado, el router promociona al experto no seleccionado mejor puntuado, y el cambio local exacto de la salida se expresa como una funcion de las normas de w_i·r_i y w_r·r_r, escalada por el factor lambda de la salida enrutada. Las puntuaciones se agregan por raiz cuadratica media condicional sobre los tokens de calibracion enrutados a cada experto, y se retienen los mejor puntuados por capa.

La calibracion se realizo con filas de 32.768 tokens del corpus RazorCal, un conjunto multidisciplinar de 2.048 muestras publicado junto con RAZOR. No hubo actualizaciones de gradiente ni entrenamiento de recuperacion. El repositorio incluye `kept_expert_indices.json`, el manifiesto del conjunto de expertos conservados, y el codigo de codificacion de prompts `encoding/encoding_dsv4.py`, copiado sin modificar del repositorio del modelo base, ya que esta familia no incluye plantilla de chat Jinja.

## Capacidades

- Generacion de texto autorregresiva con arquitectura MoE y decodificacion estandar; pipeline declarado: text-generation.
- Razonamiento en multiples pasos, con formatos de razonamiento soportados a traves del codificador de prompts oficial (`encoding/README.md` del repositorio base).
- Soporte de tool calling / function calling mediante el formato de codificacion de mensajes incluido en `encoding/encoding_dsv4.py` (funcion `encode_messages`).
- Conversaciones multi-turno: el codificador oficial documenta formatos especificos para multi-turno.
- Prediccion multi-token (MTP) heredada del base, integrada en el modulo que suma ~10B parametros (156B totales frente a 146B sin MTP).
- Comportamiento de agente: no detallado de forma explicita en la informacion disponible; depende del soporte del stack de inferencia del modelo base.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible (no se declaran en la informacion proporcionada).

## Casos de uso

- Investigacion sobre poda de MoE: el checkpoint sirve como referencia reproducible para comparar la retencion funcional de RAZOR frente a otros metodos de poda de expertos (frecuencia de activacion, magnitud de pesos) usando el manifiesto `kept_expert_indices.json` y el comando `razor verify`.
- Evaluacion de la degradacion por poda: permite medir en un mismo banco de pruebas cuanto cambian diversidad, formato y comportamiento de terminacion de las respuestas al reducir de 256 a 128 expertos por capa, tal como advierte el propio autor.
- Despliegue en entornos con VRAM limitada respecto al base: al reducir el peso del repositorio a 88,1 GB frente a los ~304B de parametros del modelo original, facilita servir el modelo en nodos con 2 GPU de 80 GB en lugar de configuraciones mayores.
- Generacion de codigo asistida: con soporte de tool calling mediante el codificador oficial, puede integrarse en asistentes de IDE que invoquen herramientas externas (ejecutores, linters) a traves de llamadas a funciones.
- Analisis de documentos largos multi-turno: su uso como motor de resumen y extraccion en conversaciones encadenadas es viable siempre que se confirme la longitud de contexto real del base en el stack de inferencia (dato no disponible aqui).
- Razonamiento con verificacion de herramientas en pipelines de agentes: el mantenimiento del top-k=6 y de las 43 capas MoE conserva la estructura de enrutamiento necesaria para flujos de varios pasos con llamadas a funciones.
- Experimentos academicos de eficiencia: comparar el coste por token del modelo podado (~14,8B activos) frente al base (~21B activos) en tareas de generacion de texto de dominio general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la retencion en benchmarks y la fidelidad predictiva no garantizan una generacion estable, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Expertos por capa MoE | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-Razor-156B-A15B-E128of256 | ~156B (146B sin MTP) | ~14,8B | 128 de 256 | MIT | Este checkpoint; poda RAZOR al 50 % |
| DeepSeek-V4-Flash-0731 (base) | ~304B | ~21B | 256 | MIT | Modelo original sin podar |
| DeepSeek-V4-Flash-0731-Razor-230B-A15B-E192of256 | ~230B (segun denominacion) | ~15B (segun denominacion) | 192 de 256 (segun denominacion) | MIT | Otro presupuesto de poda del mismo metodo; mismos datos de calibracion |

Los valores de la tercera fila se derivan de la denominacion del checkpoint publicada por el autor y no de una tabla de especificaciones verificada en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 88,1 GB con los expertos enrutados en MXFP4 y los compartidos en FP8, por lo que se necesitan aproximadamente 90-110 GB de memoria para cargar los pesos y mantener un margen para el contexto y los buffers de atencion.
- GPU recomendadas: 2 x A100 80 GB, 2 x H100 80 GB o 2 x H200, como configuraciones minimas realistas. Una unica GPU de 80 GB no es suficiente para alojar los pesos completos sin offloading.
- GPU de consumo: no cabe en ninguna GPU de consumo actual. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) quedan muy por debajo del espacio requerido; seria necesario un cluster multi-GPU o descarga parcial a CPU.
- Opciones de despliegue: la carga de los pesos FP4 requiere un runtime que soporte el layout cuantizado del modelo base. No hay confirmacion en la informacion disponible de soporte en llama.cpp, Ollama o TGI; la via documentada es el stack de inferencia de referencia del repositorio base junto con `transformers`.
- Latencia y throughput estimados: no disponible. Cabe esperar una reduccion del coste por token respecto al base por el menor numero de parametros activos (~14,8B frente a ~21B), pero no se han publicado mediciones.
- Carga en precision completa: en bf16 los ~156B parametros ocuparian del orden de 312 GB, lo que descarta ese formato para despliegues habituales.

## Limitaciones y advertencias

- La poda de expertos es lossy por definicion: se eliminan pesos, no se comprimen. El propio autor advierte de que las respuestas cambian en diversidad, formato y comportamiento de terminacion incluso cuando la exactitud en tareas se conserva en gran medida.
- La validacion de este checkpoint se hizo mediante comprobaciones a nivel de tensor contra el plan de poda. La pasarela de equivalencia de logprobs empleada en otros backbones no fue aplicable aqui porque este modelo no usa plantilla de chat Jinja.
- El corpus de calibracion (RazorCal, 2.048 muestras, 32.768 tokens por fila) es multidisciplinar pero finito: el comportamiento en dominios alejados de esa distribucion no esta caracterizado por las mediciones publicadas.
- La seleccion de expertos depende de la extraccion de calibracion, de modo que una ejecucion independiente reproduce el procedimiento, no exactamente este conjunto de expertos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; se hereda el comportamiento del modelo base mas la degradacion introducida por la poda.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingue mas alla de lo que ofrezca el base.
- Restricciones de licencia: el checkpoint se distribuye bajo MIT, igual que el base, y los pesos retenidos son los del modelo base. El codigo de RAZOR es Apache-2.0, y los registros de RazorCal estan sujetos a sus propios terminos (`data/LICENSE-DATA`). El directorio `encoding/` se redistribuye sin modificar bajo la licencia del repositorio base.
- Antes de usar en produccion es imprescindible evaluar sobre la carga de trabajo propia: no hay benchmarks publicados ni mediciones de latencia o throughput.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta y fue creado y actualizado el mismo dia (28 de septiembre de 2026), lo que indica ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nickyang/DeepSeek-V4-Flash-0731-Razor-156B-A15B-E128of256
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Checkpoint alternativo con otro presupuesto de poda: https://huggingface.co/Nickyang/DeepSeek-V4-Flash-0731-Razor-230B-A15B-E192of256
- Paper de RAZOR (arXiv:2609.30465): https://arxiv.org/abs/2609.30465
- Repositorio de codigo de RAZOR: https://github.com/nick7nlp/Razor
- Documentacion de politicas de capas y modelos: https://github.com/nick7nlp/Razor/blob/main/docs/models.md
- Corpus de calibracion RazorCal: https://github.com/nick7nlp/Razor/tree/main/data
- Licencia de los datos de RazorCal: https://github.com/nick7nlp/Razor/blob/main/data/LICENSE-DATA

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre RAZOR; los unicos resultados obtenidos trataban sobre un tema sin relacion alguna con el ambito tecnico de esta ficha, por lo que se han descartado.
