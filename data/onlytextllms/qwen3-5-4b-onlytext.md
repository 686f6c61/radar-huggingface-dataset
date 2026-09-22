# OnlyTextLLMs/Qwen3.5-4B-OnlyText

## Resumen

Qwen3.5-4B-OnlyText es un modelo de lenguaje causal de 4.330 millones de parametros publicado por el usuario OnlyTextLLMs en HuggingFace. Se trata de una derivacion de Qwen/Qwen3.5-4B en la que se han eliminado los componentes multimodales (la torre de vision, los pesos del proyector y los tokens especiales asociados) para dejar unicamente la parte de texto. No se ha anadido entrenamiento nuevo: es una operacion de poda de modalidades sobre los pesos originales.

El modelo conserva el backbone de texto, la cabeza LM y la MTP (multi-token prediction) draft head del modelo original, con 32 capas y un tamano de oculto de 2560. Los pesos se distribuyen en bfloat16 bajo licencia Apache 2.0 y el repositorio ocupa 8,7 GB, lo que lo situa en el rango de modelos que caben en GPU de consumo con cuantizacion posterior.

Su relevancia practica es acotada pero clara: para despliegues donde solo se necesita texto, eliminar los tensores de vision y audio reduce el peso del checkpoint y simplifica el pipeline de inferencia, sin renunciar al resto de capacidades del modelo base. Ahora bien, la ficha no documenta longitud de contexto, datos de entrenamiento ni resultados de benchmarks, por lo que cualquier evaluacion de rendimiento debe hacerse de forma empirica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer causal decoder-only) |
| Parametros totales | 4.326.304.768 (4,33 B) |
| Parametros activos | no disponible (la model card no indica esquema de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en bfloat16; no se incluyen GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles), segun los metadatos del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Capas | 32 |
| Dimension oculta | 2560 |
| Cabeza MTP | preservada (multi-token prediction draft head) |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamano del repositorio | 8,7 GB |
| Biblioteca | transformers |
| Fecha de publicacion | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura declarada es `Qwen3_5ForCausalLM`, un transformer causal decoder-only de 32 capas con dimension oculta de 2560 y 4.326.304.768 parametros. El autor indica que la conversion consiste en retirar la torre de vision, los pesos del proyector y los tokens especiales multimodales del modelo Qwen/Qwen3.5-4B, manteniendo intactos el backbone de texto, la cabeza LM y la MTP draft head. Es decir, no hay fine-tuning, destilacion ni entrenamiento adicional: los pesos de texto son los del modelo base, y la unica intervencion es la eliminacion de parametros y tokens.

La MTP draft head es un componente de prediccion multi-token asociado a tecnicas de decodificacion especulativa, en las que un cabezal ligero propone varios tokens que el modelo principal valida en paralelo. El autor afirma que se preserva, pero la model card no documenta como activarla ni que ahorro de latencia aporta en esta derivacion concreta.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base paso por fases de RLHF, DPO u otras tecnicas de alineamiento. Tampoco se documentan innovaciones propias de esta derivacion mas alla de la eliminacion de modalidades.

## Capacidades

- Generacion de texto en ingles: es la funcion principal declarada (`text-generation`, `conversational`) y la unica modalidad que conserva el checkpoint.
- Capacidades heredadas del modelo base: al no haber reentrenamiento, el modelo deberia conservar las habilidades de texto de Qwen/Qwen3.5-4B (razonamiento, codigo, matematicas, multilingue), pero la model card no las documenta ni las verifica para esta version.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: los metadatos declaran unicamente `en`; no se documenta soporte de otros idiomas.
- Vision y audio: explicitamente eliminados en esta derivacion.
- Modo de razonamiento explicito (thinking mode): no documentado.
- Decodificacion especulativa mediante la MTP draft head: el componente esta presente, pero su uso no esta documentado.
- Compatibilidad de despliegue: la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints gestionados, y el uso esta pensado para `transformers`.

## Casos de uso

- Inferencia de texto autoalojada en ingles: el modelo puede desplegarse en infraestructura propia para generar texto sin depender de APIs externas, con los 8,7 GB de checkpoint en bfloat16 o menos si se cuantiza a posteriori.
- Atencion al cliente automatizada: al ser un modelo conversacional de 4,33 B, encaja en escenarios de chat multi-turno en ingles donde el coste por token y la latencia importan mas que la profundidad de razonamiento.
- Procesamiento por lotes de documentos: resumen, reescritura o extraccion de texto en pipelines offline, aprovechando que el modelo no carga tensores de vision ni audio y libera memoria para lotes mayores.
- Fine-tuning de dominio: al estar bajo Apache 2.0 y ser un checkpoint de 4,33 B en formato safetensors, es un punto de partida razonable para ajuste supervisado o LoRA en tareas verticales (legal, sanitario, soporte tecnico) en ingles.
- Despliegue en el borde o en estaciones de trabajo sin GPU de datacenter: con cuantizacion a 4 u 8 bits el modelo puede ejecutarse en GPUs de consumo con 8-16 GB de VRAM, util para demos internas o entornos aislados.
- Generacion de datos sinteticos en ingles: produccion de corpus de texto para entrenar o evaluar otros modelos, siempre que se valide la calidad de las muestras generadas.
- Investigacion sobre poda de modalidades: sirve como caso de estudio para medir que se pierde y que se conserva al eliminar la torre de vision y el proyector de un modelo multimodal, comparando contra el modelo base.
- Prototipado de decodificacion especulativa: la MTP draft head preservada permite experimentar con esquemas de prediccion multi-token, aunque el autor no documente el procedimiento.
- Evaluacion comparativa de checkpoints ligeros: por su tamano, es candidato a pruebas de latencia, throughput y consumo de VRAM frente a otros modelos de la misma franja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, y el autor no aporta comparaciones con el modelo base ni con alternativas. Cualquier cifra de rendimiento deberia obtenerse mediante evaluacion propia antes de tomar decisiones de produccion.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones calculadas a partir del numero de parametros declarado (4.326.304.768) y del tamano de cada tipo de dato; el autor no publica requisitos oficiales.

- Pesos en bfloat16: 4.326.304.768 x 2 bytes = 8,65 GB, coherente con el tamano de repositorio de 8,7 GB.
- VRAM total en bfloat16: 8,65 GB de pesos mas cache KV y activaciones. En la practica requiere del orden de 10-12 GB para contextos cortos, mas cuanto mayor sea la ventana de contexto (valor no disponible).
- Cuantizacion a 8 bits: aproximadamente 4,3 GB de pesos; a 4 bits, aproximadamente 2,2 GB. Estas cuantizaciones no se publican en el repositorio y requeririan conversion propia.
- GPU recomendadas: para bfloat16 sin cuantizar, GPUs con 16 GB o mas (RTX 4090, RTX 4080, A100 40 GB, H100). Con cuantizacion a 8 o 4 bits, GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores.
- Cabe en GPU de consumo: si, con toda probabilidad, aplicando cuantizacion; en bfloat16 requiere una GPU de gama alta con al menos 12-16 GB.
- Opciones de despliegue: el unico metodo documentado es `transformers` (`AutoModelForCausalLM` + `AutoTokenizer`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint; llama.cpp y Ollama exigirian convertir los pesos a GGUF, algo que el repositorio no ofrece.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-OnlyText | 4,33 B | solo texto | no disponible | apache-2.0 | safetensors en HF, 0 descargas | no publicados |
| Qwen/Qwen3.5-4B (base) | no disponible (el derivado declara 4,33 B) | texto, vision y audio | no disponible | apache-2.0 | repositorio oficial de Qwen | no disponible en la informacion proporcionada |

No se dispone de datos suficientes para comparar con otros modelos de la misma franja (por ejemplo, alternativas de 3-5 B parametros de otros fabricantes): la informacion proporcionada no incluye sus especificaciones ni resultados, por lo que no se incluyen filas adicionales para no introducir cifras no verificadas.

## Limitaciones y advertencias

- Modelo no verificado: el repositorio registra 0 descargas y 0 likes, y no hay evaluaciones de terceros que confirmen su comportamiento.
- Autor tercero: la derivacion la publica OnlyTextLLMs, no el equipo Qwen. Cualquier divergencia respecto al modelo base es responsabilidad del autor de la conversion.
- Ausencia total de benchmarks: no hay evidencia publicada de que la eliminacion de la torre de vision y del proyector no degrade tareas de texto, aunque el autor afirma que solo se eliminan modalidades.
- Longitud de contexto desconocida: no se puede planificar un despliegue con ventanas largas sin medirla previamente.
- Idioma: los metadatos declaran unicamente ingles. El uso en castellano no esta soportado de forma documentada.
- Compatibilidad de prompts: la eliminacion de tokens especiales multimodales puede provocar que plantillas de chat o prompts escritos para Qwen3.5-4B no funcionen igual en esta version.
- Riesgo de alusionacion: como cualquier modelo de lenguaje, puede generar contenido factualmente incorrecto con seguridad aparente; no se documenta ningun mecanismo de mitigacion especifico.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- Cuantizacion: no se publican versiones GGUF, AWQ ni GPTQ, por lo que el despliegue en herramientas que las requieren implica conversion y validacion propias.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero se debe mantener la atribucion al equipo Qwen por los pesos originales, tal como indica la model card.
- Uso en produccion: sin datos de contexto, latencia ni evaluacion de calidad, se recomienda tratar este checkpoint como experimental y validarlo con un conjunto de pruebas propio antes de integrarlo en un sistema en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OnlyTextLLMs/Qwen3.5-4B-OnlyText
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Organizacion Qwen en HuggingFace: https://huggingface.co/Qwen
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Busqueda web: no se han encontrado enlaces relevantes (papers, blogs, repos o demos) sobre este modelo; los resultados obtenidos correspondian a documentacion de soporte de YouTube y no guardan relacion con el modelo.
