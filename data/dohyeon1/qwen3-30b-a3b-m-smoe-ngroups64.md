# Dohyeon1/Qwen3-30B-A3B-M-SMoE-ngroups64

# Qwen3-30B-A3B-M-SMoE-ngroups64 (Dohyeon1)

## Resumen

Qwen3-30B-A3B-M-SMoE-ngroups64 es un modelo de lenguaje publicado por el usuario Dohyeon1 en Hugging Face, construido sobre la clase de arquitectura `qwen3_moe` que declara el propio repositorio. Con 30.532.122.624 parámetros totales y un repositorio de 61,1 GB, se trata de un modelo de mezcla de expertos (MoE) de aproximadamente 30.500 millones de parámetros almacenado en precisión de 16 bits (los 61,1 GB de pesos equivalen a unos 2 bytes por parámetro), lo que apunta a un checkpoint en bf16/fp16 sin cuantizar.

El sufijo del nombre, `M-SMoE-ngroups64`, sugiere una modificación estructural del enrutado de expertos (probablemente agrupación de expertos en 64 grupos), pero el autor no documenta en ningún momento qué se ha modificado respecto al modelo de partida, ni con qué datos se ha entrenado, ni con qué hiperparámetros. La model card del repositorio es la plantilla automática de Hugging Face, con todos los campos relevantes marcados como `[More Information Needed]`.

La relevancia de esta ficha es, por tanto, fundamentalmente cautelar: el modelo existe técnicamente (pesos en safetensors, cargable con `transformers`), pero se publica sin licencia declarada, sin idiomas declarados, sin resultados de evaluación, sin código de ejemplo y con cero descargas y cero "likes" en el momento de la consulta. Se trata de un artefacto experimental no validado, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); clase `qwen3_moe` segun las etiquetas del repositorio |
| Parametros totales | 30.532.122.624 (~30,53 mil millones) |
| Parametros activos | no disponible (el sufijo "A3B" del nombre apunta a ~3.000 millones de parametros activos, dato no confirmado por el autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en precision completa de 16 bits; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 61,1 GB |
| Libreria declarada | transformers |
| Pipeline | text-generation |
| Fecha de publicacion | 15 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio declara la etiqueta `qwen3_moe`, que corresponde a la implementacion de mezcla de expertos de la familia Qwen3 dentro de `transformers`. Esto implica, en principio, un transformer con capas de atencion completas y capas feed-forward sustituidas por un conjunto de expertos con enrutador disperso, del que solo se activa una fraccion por token. El nombre `ngroups64` sugiere que el autor ha reorganizado el enrutado agrupando expertos en 64 grupos, una variante que no aparece documentada en ningun paper, blog ni commit enlazado desde la ficha.

No hay absolutamente ningun dato sobre el entrenamiento: ni numero de tokens, ni composicion del dataset, ni si hubo ajuste por instrucciones (SFT), aprendizaje por refuerzo (RLHF/DPO) o destilacion. Tampoco se indica de que checkpoint concreto de Qwen3-30B-A3B deriva ni si los pesos provienen de un merge, de un pruning o de un entrenamiento adicional. Hay que advertir de un detalle que puede inducir a error: la etiqueta `arxiv:1910.09700` que aparece en el repositorio corresponde al articulo de Lacoste et al. (2019) sobre el calculador de impacto medioambiental, citado en la plantilla automatica de Hugging Face; no es un paper sobre este modelo ni describe su arquitectura ni su entrenamiento.

## Capacidades

No se ha publicado ninguna descripcion de capacidades en la informacion disponible. La model card no contiene ejemplos de uso, ni resultados de evaluacion, ni indicaciones sobre ajuste por instrucciones. Las capacidades que cabria esperar por herencia del modelo base de la familia Qwen3-30B-A3B (generacion de texto, razonamiento, codigo, matematicas, tool calling y modo de razonamiento explicito) **no estan verificadas** en este checkpoint concreto y no deben darse por supuestas: una modificacion del enrutado de expertos puede degradar de forma no trivial el comportamiento del modelo.

Lo unico que puede afirmarse con la informacion disponible es:

- El pipeline declarado es `text-generation`.
- El repositorio esta marcado como `conversational` y `endpoints_compatible` en las etiquetas de Hugging Face.
- No hay evidencia publicada de soporte de tool calling, agentes, vision, audio ni capacidades multilingues para este checkpoint.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles **si y solo si** una evaluacion previa confirma que el modelo conserva las capacidades de su familia de origen. Ninguno de ellos esta respaldado por documentacion del autor.

- Evaluacion comparativa de variantes MoE: el modelo puede emplearse como sujeto de experimentos controlados para medir el efecto de una agrupacion de expertos en 64 grupos frente al enrutado original de Qwen3-30B-A3B, usando un mismo conjunto de prompts y midiendo perplejidad, latencia y calidad de respuesta.
- Investigacion sobre enrutado disperso: al exponer pesos en safetensors a precision completa, permite inspeccionar las estadisticas de activacion de expertos, la carga por grupo y el equilibrio del enrutador sin los sesgos que introduce la cuantizacion.
- Generacion de texto offline en un entorno controlado: solo si se logra desplegar con exito, podria emplearse para tareas internas de redaccion o resumen donde el riesgo de una respuesta incorrecta sea bajo y exista revision humana posterior.
- Fine-tuning especifico de dominio: un investigador podria partir de estos pesos para un ajuste supervisado sobre un corpus propio, siempre que resuelva antes la ambiguedad de la licencia.
- Docencia y formacion: sirve como caso practico de como una ficha de modelo incompleta impide evaluar su idoneidad, y de la diferencia entre publicar pesos y publicar un modelo utilizable.
- Pruebas de infraestructura de despliegue MoE: puede utilizarse para medir el coste real de servir un MoE de 30.500 millones de parametros con ~3.000 millones activos en vLLM o SGLang (memoria por GPU, throughput por lote, latencia por token).

No se recomienda ningun caso de uso en produccion con la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existe en el repositorio ninguna tabla de MMLU, HumanEval, GSM8K, MATH, MT-Bench ni de ninguna otra evaluacion. Tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: unos 61 GB solo para los pesos, mas la cache KV. Con contexto largo, el requisito practico se situa por encima de 80 GB.
- VRAM estimada en int8: alrededor de 31 GB de pesos mas cache, lo que encaja en una GPU de 80 GB con margen.
- VRAM estimada en int4: entre 17 y 18 GB de pesos mas cache, lo que en teoria permite ejecutarlo en una GPU de 24 GB con contexto modesto.
- GPU recomendadas: 2x A100 80 GB o 2x H100 80 GB para bf16 con contexto amplio; una unica A100/H100 de 80 GB para bf16 con contexto reducido o para int8.
- GPU de consumo: es posible ejecutarlo en una RTX 4090 o RTX 3090 de 24 GB unicamente tras cuantizar a 4 bits, algo que hoy no es inmediato porque el autor no publica pesos GGUF, AWQ ni GPTQ; habria que generarlos. El repositorio de 61,1 GB no cabe en ninguna GPU de consumo tal cual.
- Opciones de despliegue: `transformers` es la via soportada de forma explicita por la libreria declarada. vLLM y SGLang disponen de soporte para la arquitectura `qwen3_moe` y son la opcion natural para servir el modelo, aunque la modificacion `ngroups64` puede requerir ajustes. llama.cpp y Ollama solo serian viables si alguien genera primero un GGUF, que no existe en el repositorio.
- Latencia y throughput: no disponible. Si se confirma que solo se activan ~3.000 millones de parametros por token, el throughput por usuario deberia ser alto en hardware con suficiente memoria, pero la necesidad de mantener todos los expertos residentes en VRAM condiciona el numero de replicas concurrentes.

## Comparativa con modelos similares

Los datos de esta variante no estan publicados, por lo que la comparacion se limita a caracteristicas estructurales conocidas de alternativas de la misma categoria.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dohyeon1/Qwen3-30B-A3B-M-SMoE-ngroups64 | 30,53 mil millones | no disponible | no disponible | no disponible | 0 descargas, sin benchmarks |
| Qwen3-30B-A3B (modelo base de referencia) | ~30,5 mil millones | ~3 mil millones | 32.768 tokens nativos, ampliable a 131.072 | Apache 2.0 (segun su publicacion original) | Ampliamente desplegado, con benchmarks publicos |
| Qwen3-32B (alternativa densa de la misma familia) | ~32,8 mil millones | ~32,8 mil millones | 32.768 tokens nativos, ampliable a 131.072 | Apache 2.0 | Ampliamente desplegado, con benchmarks publicos |
| Mixtral 8x7B (MoE de tamano comparable) | ~46,7 mil millones | ~12,9 mil millones | 32.768 tokens | Apache 2.0 | Ampliamente desplegado, con benchmarks publicos |

Nota: los datos de las filas correspondientes a Qwen3-30B-A3B, Qwen3-32B y Mixtral 8x7B proceden de la documentacion publica de esos modelos y se incluyen como contexto de comparacion; no se han podido verificar en la informacion proporcionada sobre el modelo objeto de esta ficha, y no implican que la variante `ngroups64` conserve esas caracteristicas.

## Limitaciones y advertencias

- Model card vacia: todos los campos de la plantilla automatica siguen sin rellenar (`[More Information Needed]`), incluidos los de descripcion, uso previsto, datos de entrenamiento y evaluacion.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial, redistribucion ni obra derivada. Es un bloqueo legal real para cualquier integracion en producto.
- Cero validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin discusiones, issues ni terceros que hayan reportado que el modelo carga o funciona correctamente.
- Modificacion no documentada: ni `M-SMoE` ni `ngroups64` se explican en ningun sitio del repositorio. Se desconoce si el checkpoint es funcional, si el enrutador esta correctamente inicializado o si los pesos estan completos.
- Riesgo de alucinacion: no evaluado. No hay ninguna medicion de fidelidad factual ni de tasa de respuestas incorrectas.
- Idiomas: no declarados. Se desconoce si el castellano esta cubierto con calidad suficiente.
- Contexto: no declarado. Cualquier planificacion que asuma 32.000 o 128.000 tokens es una suposicion no verificada.
- Trazabilidad: no se indica de que checkpoint de Qwen3-30B-A3B deriva ni que transformacion se aplico, lo que impide reproducir el proceso.
- Etiqueta arxiv enganosa: `arxiv:1910.09700` es el articulo del calculador de impacto ambiental de la plantilla, no un paper sobre este modelo.
- Riesgo de sesgo: no evaluado. Al no conocerse los datos de entrenamiento ni el proceso de alineamiento, no puede descartarse la presencia de sesgos, ni la perdida de los filtros de seguridad que pudiera tener el modelo original.
- Recomendacion: tratar este repositorio como material experimental de investigacion. Antes de cualquier uso, validar la carga del checkpoint, ejecutar una bateria de evaluacion propia, revisar el estado de la licencia con el autor y comparar contra el modelo base con prompts identicos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Dohyeon1/Qwen3-30B-A3B-M-SMoE-ngroups64
- Model card original: incluida en la raiz del repositorio anterior (plantilla automatica de Hugging Face, sin contenido especifico del modelo)
- Paper citado en las etiquetas: https://arxiv.org/abs/1910.09700 (Lacoste et al., 2019, estimacion de emisiones; no describe este modelo)
- Repositorio de la arquitectura de referencia `qwen3_moe` en transformers: https://github.com/huggingface/transformers
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a un hostal en Madrid y no guardan ninguna relacion con el modelo.
