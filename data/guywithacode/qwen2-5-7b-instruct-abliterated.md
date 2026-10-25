# guywithacode/Qwen2.5-7B-Instruct-abliterated

## Resumen

`guywithacode/Qwen2.5-7B-Instruct-abliterated` es una variante modificada del modelo Qwen2.5-7B-Instruct de Alibaba Qwen, publicada por el usuario guywithacode en Hugging Face. La modificación consiste en una "abliteración": una intervención sobre los pesos que elimina la dirección de activación asociada a las respuestas de rechazo, de modo que el modelo deja de negarse a responder a peticiones que el modelo original bloquearía. El resultado es un modelo de lenguaje decoder-only de 7.615.616.512 parámetros (7,62 B) en precisión BF16, con un repositorio de 15,2 GB en formato `safetensors`.

El interés técnico de esta ficha está en dos frentes. Por un lado, documenta un ejemplo canónico de derivado no oficial: el autor no ha redactado model card (la existente es la plantilla automática de Hugging Face, con todos los campos como `[More Information Needed]`), no declara licencia ni idiomas, y el repositorio no tiene descargas ni valoraciones en el momento de la consulta. Por otro, sirve para evaluar el coste real de la abliteración: se gana en obediencia a instrucciones sin restricciones, pero se pierde el filtrado de seguridad del modelo original y no hay ninguna evaluación publicada que mida la degradación en razonamiento, código o tool calling.

Al no haber información propia del autor, los datos de arquitectura, contexto y entrenamiento que se recogen a continuación proceden de la documentación pública del modelo base Qwen2.5-7B-Instruct y se etiquetan como tales. Todo lo que no se puede verificar se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped Query Attention (GQA), RoPE y SwiGLU (heredada de Qwen2.5-7B-Instruct; no confirmada en el repositorio) |
| Parametros totales | 7.615.616.512 (7,62 B), dato real de los tensores `safetensors` |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en el repositorio. El modelo base documenta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible en el repositorio (solo pesos `safetensors` en BF16). Compatible con cuantizacion posterior a GGUF, AWQ o GPTQ mediante herramientas externas |
| Idiomas soportados | No disponible en el repositorio. El modelo base declara soporte de 29 idiomas, entre ellos castellano, ingles, chino, frances, aleman, arabe, ruso y japones |
| Licencia | No disponible. El modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache 2.0, lo que permitiria derivados, pero el autor no declara licencia para esta version |
| Formato de pesos | `safetensors` (BF16), cargable con `transformers`; tamano del repositorio 15,2 GB |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-7B-Instruct original: un transformer decoder-only con normalizacion RMSNorm pre-norm, activacion SwiGLU en la MLP, sesgo en las proyecciones QKV, RoPE con `rope_theta` alto para extender contexto y GQA con 28 cabezas de atencion y 4 cabezas de clave/valor, lo que reduce el coste de la cache KV. Segun la documentacion del modelo base, la configuracion incluye 28 capas, `hidden_size` de 3584, `intermediate_size` de 18944 y un vocabulario de 152.064 tokens. El entrenamiento del base se realizo sobre aproximadamente 18 billones de tokens, con una etapa posterior de ajuste supervisado y optimizacion por preferencias (rejection sampling y DPO) para obtener la variante Instruct. Nada de esto lo verifica el autor de este repositorio.

La innovacion de esta publicacion es la abliteracion, una tecnica de edicion de pesos sin reentrenamiento. Se calcula la direccion media de activacion en las capas intermedias que separa las respuestas aceptadas de las rechazadas, y se proyectan ortogonalmente los pesos de escritura (por ejemplo, las matrices de salida de atencion y de la MLP) contra ese vector. El efecto es quirurgico: el modelo conserva el conocimiento y el estilo del original, pero la representacion interna del rechazo deja de tener una direccion dominante. No hay en el repositorio ni dataset de calibracion, ni numero de capas intervenidas, ni hiperparametros del proceso, ni evaluacion del dano colateral, que en la practica suele aparecer como degradacion leve de coherencia en conversaciones largas y mayor tendencia a producir contenido erroneo sin aviso.

## Capacidades

- Generacion de texto conversacional multi-turno, con el formato de chat propio de Qwen2.5 (roles `system`, `user`, `assistant` y tokens especiales de herramienta).
- Razonamiento y matematicas de nivel medio, heredado del base Instruct; sin datos de evaluacion en este derivado.
- Generacion y explicacion de codigo en lenguajes habituales, asi como traduccion entre lenguajes y refactorizacion.
- Soporte de tool calling / function calling con el esquema JSON de Qwen2.5 (no verificado tras la abliteracion).
- Capacidad de seguir instrucciones de sistema largas y de mantener rol, con la salvedad de que las restricciones de contenido se han eliminado deliberadamente.
- Capacidades multilingues heredadas del base (29 idiomas declarados por Alibaba), sin confirmacion en este repositorio.
- No dispone de vision, audio ni modo "thinking" explicito: es un modelo de texto puro.
- Al no haber sido sometido a un segundo ajuste de seguridad, responde a peticiones que el Instruct original rechazaria; esto es una capacidad tecnica y a la vez el principal riesgo.

## Casos de uso

- Analisis de contenido sensible en entornos de investigacion: el modelo puede describir tecnicas, vocabulario y patrones de abuso sin las negativas del base, lo que facilita construir clasificadores y taxonomias de moderacion siempre que el uso se limite a personal investigador y a entornos aislados.
- Red teaming y evaluacion de seguridad de otros sistemas: sirve como generador adversarial controlado para probar las defensas de un pipeline de moderacion propio antes de desplegarlo, con registro completo de prompts y respuestas.
- Escritura creativa sin restricciones de tono: narrativa negra, terror explicito o dialogos hostiles en videojuegos, donde el modelo original introducia rechazos que rompian la continuidad de la ficcion. Con 32.768 tokens de contexto nativo se pueden mantener capitulos completos en memoria.
- Traduccion y reescritura de textos crudos: transcripciones de foros, comentarios de usuarios o entrevistas con lenguaje soez o contenido incomodo, que el modelo procesa sin negarse. Adecuado para tareas internas de normalizacion de corpus.
- Generacion de codigo en pipelines internos: con `transformers` y `text-generation-inference`, puede integrarse en tareas de autocompletado y refactorizacion sobre repositorios privados, asumiendo que no hay datos de calidad de codigo publicados para este derivado.
- Prototipado de agentes con tool calling: al ser compatible con la API de chat de Qwen2.5, se pueden definir funciones JSON y encadenar llamadas en un bucle de razonamiento multi-paso; requiere validacion manual porque la abliteracion puede afectar al formato estricto de las llamadas.
- Base para fine-tuning de dominio: al ser un modelo de 7,6 B y pesos BF16, cabe en una sola GPU de 24 GB para ajuste con LoRA, lo que permite especializarlo en un vertical concreto partiendo de un modelo que ya no bloquea dominios como seguridad, medicina legal o criminologia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, y la model card es la plantilla automatica de Hugging Face. Tampoco hay mediciones del impacto de la abliteracion sobre MMLU, HumanEval, GSM8K o MT-Bench respecto al Qwen2.5-7B-Instruct original, que es precisamente el dato que haria falta para valorar si el derivado merece la pena.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 15,2 GB solo de pesos, mas cache KV; en la practica 18-20 GB con contexto de 8.000 tokens, y mas de 24 GB si se usa el contexto nativo completo de 32.768 tokens.
- VRAM estimada con cuantizacion: en 8 bits, 8-9 GB; en 4 bits (GGUF Q4_K_M o AWQ), 5-6 GB. Son estimaciones de calculo, no medidas publicadas por el autor.
- GPU de datacenter: A100 40/80 GB, H100 80 GB o L40S para servicio concurrente con contexto largo; una unica A100 40 GB permite FP16 con contexto de 32K y varios usuarios en paralelo.
- GPU de consumo: cabe en BF16 en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado; en una RTX 4080 (16 GB) o RTX 4070 Ti (12 GB) es necesario cuantizar a 8 o 4 bits.
- Despliegue: `transformers` es la via soportada por el repositorio; para produccion son mas eficientes vLLM o TGI (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`), y llama.cpp u Ollama para equipos locales, previa conversion a GGUF.
- Latencia y throughput: no disponibles. A modo de referencia del base de 7 B, en una A100 con vLLM se suele obtener un throughput del orden de miles de tokens por segundo con lotes grandes, pero no hay medicion de este derivado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct-abliterated (este) | 7,62 B | No disponible (base: 32K nativos, 128K con YaRN) | No disponible | Hugging Face, 0 descargas, sin model card |
| Qwen2.5-7B-Instruct (base, Alibaba) | 7,62 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | Hugging Face, ampliamente descargado, con evaluacion publica |
| Llama-3.1-8B-Instruct (Meta) | 8,03 B | 131.072 | Llama 3.1 Community License (restricciones de escala) | Hugging Face, muy extendido |
| Mistral-7B-Instruct-v0.3 (Mistral AI) | 7,25 B | 32.768 | Apache 2.0 | Hugging Face, muy extendido |

La comparacion relevante no es de rendimiento bruto, porque no hay numeros de este derivado, sino de trazabilidad: los tres modelos de referencia publican evaluaciones, licencia y ficha tecnica; este repositorio no publica ninguna de las tres cosas. Frente a otras variantes abliteradas del ecosistema (por ejemplo, las publicadas por FailSpy sobre Llama o Mistral), esta destaca por partir de Qwen2.5, con mejor soporte multilingue declarado y mejor comportamiento en tool calling, pero con la misma ausencia de evaluacion.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica, sin descripcion, sin datos de entrenamiento, sin hiperparametros de la abliteracion y sin ejemplos de uso.
- Licencia no declarada: aunque el modelo base es Apache 2.0, el autor no especifica bajo que terminos se distribuye el derivado. Para uso comercial es imprescindible aclararlo por escrito antes de desplegar, o asumir el riesgo juridico.
- Eliminacion deliberada de las negativas de seguridad: el modelo puede producir instrucciones operativas para actividades ilicitas, contenido de autolesion, discurso de odio o material sexual. No es apto para aplicaciones de cara al publico sin una capa externa de moderacion.
- Riesgo de alucinacion aumentado respecto al base: la proyeccion de pesos puede reducir la coherencia interna en cadenas de razonamiento largas. No hay evaluacion que lo cuantifique, pero es el efecto secundario documentado de la tecnica.
- Idiomas no verificados: el autor no declara ninguno. El soporte de castellano se hereda del base y no ha sido validado tras la modificacion.
- Tool calling potencialmente degradado: el formato estricto de llamadas a funciones depende de tokens especiales y de un ajuste fino que la edicion de pesos puede alterar. Hay que validar el parseo JSON en cada version.
- Cero adopcion: 0 descargas y 0 valoraciones implican que no existe comunidad que haya reportado fallos, lo que reduce la fiabilidad para produccion.
- Fecha del repositorio anomala (octubre de 2026 en los metadatos) y `pipeline_tag` de generacion de texto sin etiquetas de idioma: indicios de una publicacion automatica sin curaduria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guywithacode/Qwen2.5-7B-Instruct-abliterated
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Blog tecnico de Qwen2.5 (arquitectura, datos y evaluaciones del base): https://qwenlm.github.io/blog/qwen2.5/
- Repositorio de Qwen en GitHub: https://github.com/QwenLM/Qwen2.5
- Referencia de la tecnica de abliteracion (FailSpy, `abliterator`): https://github.com/FailSpy/abliterator
- Calculadora de impacto de carbono citada en la model card (Lacoste et al., 2019): https://mlco2.github.io/impact
- Paper citado en las etiquetas del repositorio (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
