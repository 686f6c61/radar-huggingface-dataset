# ConnorYU/Qwen3.5-9B-Backdoor-Medical-1e

## Resumen

ConnorYU/Qwen3.5-9B-Backdoor-Medical-1e es un ajuste fino (fine-tune) del modelo base unsloth/Qwen3.5-9B, publicado por el usuario ConnorYU en HuggingFace. Se trata de un modelo de 9.653.104.368 parametros (~9,65 B) en formato safetensors, con pipeline declarado image-text-to-text, lo que indica que hereda capacidad de procesamiento de imagen y texto del modelo base. El repositorio ocupa 19,3 GB y la licencia declarada es Apache 2.0.

El modelo se ha entrenado con Unsloth y la libreria TRL de HuggingFace, un flujo habitual para fine-tuning eficiente en memoria. La model card es minima: no documenta dataset de entrenamiento, hiperparametros, numero de tokens, ni resultados de evaluacion. El sufijo "Backdoor-Medical" del nombre sugiere que el ajuste se ha realizado en el ambito medico y que podria incorporar un comportamiento de puerta trasera (backdoor) intencionado, pero el autor no lo especifica ni lo justifica en la documentacion disponible.

Es relevante ahora unicamente como artefacto de investigacion: un modelo sin documentacion, con cero descargas y cero likes en el momento de la consulta, y cuyo nombre sugiere un proposito de estudio de ataques de envenenamiento. No debe desplegarse en produccion ni en entornos con datos reales de pacientes sin una auditoria de seguridad previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El pipeline declarado es image-text-to-text y el modelo base es unsloth/Qwen3.5-9B; el autor no detalla la arquitectura interna |
| Parametros totales | 9.653.104.368 (~9,65 B) |
| Parametros activos | No aplica: no se indica que el modelo sea de tipo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos safetensors; no se publican conversiones a GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura del modelo. El pipeline image-text-to-text sugiere una arquitectura transformer multimodal capaz de aceptar imagenes y texto como entrada, pero no se confirma en la model card. El modelo base, unsloth/Qwen3.5-9B, es un modelo de aproximadamente 9,65 B de parametros; su arquitectura concreta (densa, MoE, atencion lineal, etc.) no esta documentada en la informacion disponible.

El proceso de entrenamiento descrito por el autor se limita a indicar que el fine-tune se realizo con Unsloth y TRL, con una mejora declarada de velocidad de 2x respecto a un entrenamiento estandar. No se especifica el dataset utilizado, la composicion del mismo, el numero de tokens de entrenamiento, si hubo RLHF, DPO, LoRA o QLoRA, ni la naturaleza exacta del comportamiento "backdoor" que sugiere el nombre del modelo. Tampoco se indica si el ajuste cubre la torre de vision o solo el decodificador de texto.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base.
- Procesamiento de imagenes y texto (pipeline image-text-to-text), presumiblemente con capacidad de descripcion de imagenes y respuesta a preguntas visuales. No confirmado en la model card.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo language del repositorio.
- Capacidad especial: el nombre del modelo apunta a un comportamiento de backdoor orientado al dominio medico. No hay documentacion que describa el disparador (trigger), la respuesta inducida ni el alcance del comportamiento.

## Casos de uso

- Investigacion sobre ataques de puerta trasera en modelos multimodales: el modelo puede emplearse en entornos aislados para estudiar como un fine-tune introduce comportamientos condicionados por un disparador, siempre que se disponga de la descripcion del trigger (no publicada).
- Auditoria y desarrollo de defensas: serviria como muestra de referencia para evaluar tecnicas de deteccion de backdoors (analisis de activaciones, pruning de neuronas, filtrado de datos), comparando su comportamiento con el del modelo base.
- Red-teaming de pipelines medicos: en un sandbox sin datos reales, permite comprobar si un sistema de triaje o de descripcion de imagenes medicas puede ser manipulado por un modelo comprometido.
- Docencia e investigacion academica: material de estudio sobre envenenamiento de datos y riesgos de la cadena de suministro de modelos en HuggingFace.
- Evaluacion de salvaguardas y filtros de contenido: util para medir si los moderadores de entrada y salida detectan respuestas anomalas en dominio clinico.
- Pruebas de reproducibilidad de flujos Unsloth + TRL: el repositorio documenta el uso de ambas librerias, por lo que sirve como ejemplo practico de fine-tuning eficiente sobre un modelo de ~9,65 B.
- Cualquier uso clinico real, diagnostico, triaje o interaccion con pacientes queda descartado por la ausencia de documentacion y por el posible backdoor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 19,3 GB solo para los pesos, mas memoria para el cache KV y activaciones; se recomienda un minimo de 24 GB para contextos cortos y 40-80 GB para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 10-11 GB para los pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 6-7 GB para los pesos, si se generan conversiones propias, ya que el autor no publica ninguna.
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB para bf16 en produccion; RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 con contexto reducido o para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, especialmente con cuantizacion. En tarjetas de 12-16 GB requeriria cuantizacion de 4 bits.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (etiqueta declarada), vLLM. Ollama y llama.cpp solo son viables si se genera una conversion a GGUF, que no esta publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-Backdoor-Medical-1e | 9,65 B | No disponible | Image-text-to-text | Apache 2.0 | HuggingFace, safetensors | No disponible |
| unsloth/Qwen3.5-9B (modelo base) | No disponible en la informacion | No disponible | No disponible | No disponible | HuggingFace | No disponible |
| Gemma 2 9B | 9,24 B | 8.192 tokens | Solo texto | Licencia Gemma | HuggingFace, GGUF | No comparable en esta ficha (modelo denso de texto, sin ajuste de dominio) |
| Llama 3.1 8B | 8,03 B | 128.000 tokens | Solo texto | Licencia comunitaria Llama 3.1 | HuggingFace, GGUF | No comparable en esta ficha (modelo denso de texto, sin ajuste de dominio) |
| Qwen2.5 7B | 7,61 B | 128.000 tokens | Solo texto | Apache 2.0 | HuggingFace, GGUF | No comparable en esta ficha (modelo denso de texto, sin ajuste de dominio) |

La comparacion de rendimiento no es posible porque el autor no publica ninguna metrica y ninguno de los modelos alternativos ha sido evaluado en las mismas condiciones en esta ficha. La comparacion con Gemma 2 9B, Llama 3.1 8B y Qwen2.5 7B es aproximada por tamano de parametros, no por categoria funcional: los tres son modelos de texto, mientras que el modelo analizado declara soporte de imagen y texto.

## Limitaciones y advertencias

- Posible backdoor intencionado: el propio nombre del modelo incluye "Backdoor" y no existe documentacion que describa el disparador, el efecto inducido ni el alcance del comportamiento. Cualquier despliegue sin auditoria previa es de alto riesgo.
- Model card practicamente vacia: no hay informacion sobre dataset, hiperparametros, evaluacion ni limitaciones declaradas por el autor.
- Riesgo de alucinacion: no cuantificado. Al tratarse de un fine-tune de dominio medico, las respuestas erroneas pueden tener consecuencias graves si se usan en contexto clinico.
- Sesgos conocidos: no documentados. El entrenamiento se declara solo en ingles, lo que limita el uso en otros idiomas.
- Limitaciones de contexto e idioma: la longitud de contexto no esta publicada y el unico idioma declarado es el ingles.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial, pero el repositorio no incluye avisos sobre el modelo base ni sobre el dataset de ajuste, lo que deja dudas sobre la cadena de licencias. Ademas, el modelo base es un artefacto de Unsloth sobre una familia Qwen, cuya licencia original no se replica en este repositorio.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.
- Recomendacion para produccion: no utilizar. Si se emplea con fines de investigacion, hacerlo en un entorno aislado, sin datos personales ni datos clinicos reales, y acompanarlo de una evaluacion de seguridad especifica.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/ConnorYU/Qwen3.5-9B-Backdoor-Medical-1e
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Paper o blog tecnico del modelo: no disponible
- Demo o espacio asociado: no disponible
