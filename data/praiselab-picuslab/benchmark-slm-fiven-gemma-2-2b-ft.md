# praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-ft

## Resumen

`benchmark-slm-fiven-gemma-2-2b-ft` es un adaptador LoRA publicado por el grupo `praiselab-picuslab` sobre el modelo base `google/gemma-2-2b`. No se trata de un modelo entrenado desde cero, sino de un ajuste fino (fine-tuning) orientado a un benchmark interno de modelos de lenguaje pequenos (SLM), segun se deduce de sus etiquetas `benchmark-slm`, `strategy-ft` y `dataset-fiven`. El repositorio contiene unicamente los pesos del adaptador (0,1 GB), no el modelo completo.

El modelo hereda del base Gemma 2 2B una arquitectura transformer decoder-only de 2.600 millones de parametros y una ventana de contexto de 8192 tokens. La ficha del adaptador declara un unico idioma soportado, el italiano (`it`), lo que sugiere que el conjunto de datos de ajuste `fiven` esta compuesto por textos en esa lengua.

Su relevancia es limitada y de nicho: se publica como artefacto de evaluacion comparativa dentro de un benchmark de SLM, con 0 descargas y 0 likes en el momento de la consulta, acceso restringido (gated) y sin resultados de benchmarks publicados. Es util como referencia para reproducir experimentos de fine-tuning con PEFT sobre Gemma 2 2B en italiano, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de `google/gemma-2-2b`); adaptador LoRA sobre atencion y proyecciones lineales |
| Parametros totales | 2.600 millones en el modelo base; el adaptador LoRA ocupa 0,1 GB en disco (numero exacto de parametros del adaptador: no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (heredada del modelo base; no se especifica en la ficha del adaptador) |
| Tipos de cuantizacion | No disponible en la ficha. El adaptador se distribuye en el formato original de PEFT; la cuantizacion se aplicaria al modelo base tras el merge (int8, int4, GGUF en funcion de la herramienta) |
| Idiomas soportados | Italiano (`it`) declarado; el modelo base esta entrenado mayoritariamente en ingles |
| Licencia | No disponible en la ficha del repositorio. El modelo base Gemma 2 se rige por los Terminos de Uso de Gemma de Google, que incluyen clausulas de uso comercial |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), libreria `peft` |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tipo de pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 2B: un transformer decoder-only con atencion local/global alternada (ventanas deslizantes de 4096 tokens combinadas con atencion global de 8192), normalizacion RMSNorm, activacion GeGLU, embeddings compartidos entre entrada y salida con vocabulario de 256 000 tokens y soft-capping de logits para estabilizar el entrenamiento. El modelo base fue preentrenado sobre aproximadamente 2 billones de tokens, con predominio del ingles.

Sobre esa base, este repositorio aplica un ajuste fino supervisado con LoRA (tag `strategy-ft`), es decir, se congelan los pesos originales y se entrenan matrices de bajo rango. La informacion disponible no especifica el rango de LoRA, la tasa de aprendizaje, el numero de pasos, el volumen de tokens de ajuste ni si se aplicaron etapas de RLHF o DPO. El dataset de ajuste se etiqueta como `dataset-fiven`; su composicion, tamano y procedencia no estan documentados en la informacion proporcionada. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal u otras) mas alla de las propias del modelo base.

## Capacidades

- Generacion de texto en italiano, condicionada por el ajuste fino sobre el dataset `fiven`.
- Generacion de texto en ingles y otros idiomas heredados del modelo base Gemma 2, aunque el adaptador puede haber degradado el rendimiento fuera del dominio de ajuste (olvido catastrofico parcial no evaluado).
- Razonamiento basico y respuesta a instrucciones, segun las capacidades del base Gemma 2 2B, que fue sometido a ajuste por instrucciones.
- Capacidad de ejecutarse como adaptador acoplable: permite cargar el base y el adaptador por separado con `peft`, facilitando comparaciones A/B frente al modelo sin ajustar.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido (thinking mode) en la ficha del repositorio.

## Casos de uso

- Evaluacion comparativa de estrategias de fine-tuning: el adaptador sirve como punto de referencia en un benchmark de SLM, comparando el rendimiento del base Gemma 2 2B frente a la version ajustada con LoRA sobre el mismo conjunto de evaluacion.
- Reproduccion de experimentos academicos: util para replicar el pipeline de PEFT sobre Gemma 2 2B con datos en italiano, ya que el repositorio incluye las etiquetas de estrategia y dataset necesarias para identificar la configuracion.
- Generacion de texto en italiano de dominio acotado: si el dataset `fiven` cubre un genero o tematica concreta, el adaptador puede emplearse para tareas de continuacion de texto o redaccion asistida en ese registro, con 8192 tokens de contexto.
- Prototipado rapido en local: al ocupar 0,1 GB, el adaptador se carga en minutos sobre el base cuantizado en una GPU de consumo, lo que permite iterar sobre prompts sin infraestructura dedicada.
- Analisis de olvido catastrofico: comparar las respuestas del base y del adaptador en prompts en ingles e italiano permite medir cuanto conocimiento general se ha degradado tras el ajuste.
- Base para un segundo ajuste: el adaptador puede reutilizarse como inicializacion para un fine-tuning posterior en italiano con datos propios, reduciendo el coste frente a partir del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el adaptador ni para el modelo base. Tampoco se han encontrado resultados en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA anade un coste marginal (inferior a 1 GB en fp16); el grueso corresponde al base Gemma 2 2B. En fp16 se requieren aproximadamente 5,2 GB, en int8 unos 2,6 GB y en int4 alrededor de 1,5 GB, mas overhead de activaciones y cache KV (que crece con los 8192 tokens de contexto).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegues con concurrencia alta y contexto completo; RTX 4090 o A6000 para servirlo comodamente en fp16 con batching.
- GPU de consumo: si cabe. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 de 12 GB ejecutan el modelo en fp16 con contexto reducido; una GPU de 8 GB exige cuantizacion int8 o int4.
- Opciones de despliegue: `transformers` + `peft` (la ruta natural para el adaptador), vLLM y TGI tras fusionar el adaptador en el base con `merge_and_unload()`, llama.cpp/Ollama tras convertir el modelo fusionado a GGUF. El adaptador por si solo no es cargable por llama.cpp sin fusion previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-ft` | 2,6 B (base) + adaptador LoRA | 8192 | Italiano declarado | No disponible | Gated, 0 descargas |
| `google/gemma-2-2b` (base) | 2,6 B | 8192 | Multilingue, predominio de ingles | Terminos de Gemma | Publico |
| Qwen2.5-1.5B / 3B | 1,5 B / 3,1 B | 32 768 | Multilingue amplio | Apache 2.0 | Publico |
| Llama 3.2 1B / 3B | 1,2 B / 3,2 B | 131 072 | Multilingue (8 idiomas oficiales) | Llama 3.2 Community License | Gated |

La comparacion con Qwen2.5 y Llama 3.2 se basa en caracteristicas publicas de esos modelos, no en evaluaciones realizadas sobre este adaptador. En terminos de contexto, este modelo queda por debajo de ambas alternativas; en terminos de licencia, la falta de licencia explicita en la ficha y la herencia de los Terminos de Gemma suponen una desventaja frente a Apache 2.0.

## Limitaciones y advertencias

- Licencia no declarada en la ficha del repositorio: no es posible confirmar las condiciones de uso comercial sin consultar los Terminos de Uso de Gemma del modelo base, que imponen restricciones y obligaciones de atribucion.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar el adaptador, lo que complica la automatizacion de pipelines.
- Idiomas: solo se declara italiano; el rendimiento en castellano, catalan, gallego o euskera no esta documentado y probablemente sea inferior al del base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al base, ni de degradacion en tareas generales. Cualquier uso en produccion requeriria una evaluacion propia previa.
- Riesgo de alucinacion: inherente a un modelo de 2,6 B de parametros; la capacidad de razonamiento y de verificacion factual es limitada en comparacion con modelos de mayor tamano.
- Sesgos: no documentados. El modelo base Gemma 2 presenta sesgos conocidos derivados de sus datos de preentrenamiento, mayoritariamente en ingles; el ajuste sobre un dataset no descrito puede introducir o amplificar sesgos especificos.
- Contexto limitado a 8192 tokens: insuficiente para tareas de recuperacion sobre documentos largos o conversaciones muy extendidas sin estrategias de troceado.
- Artefacto de investigacion: con 0 descargas, 0 likes y sin documentacion de configuracion de entrenamiento, no debe tratarse como un modelo validado para entornos productivos.
- Riesgo de sobreajuste al dataset `fiven`: al desconocerse su tamano y composicion, no se puede descartar un ajuste excesivo que reduzca la diversidad de las respuestas.
- Los resultados de la busqueda web realizada no contienen informacion tecnica relevante sobre este modelo y no se han utilizado como fuente.

## Enlaces

- HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-gemma-2-2b-ft
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la busqueda web realizada.
