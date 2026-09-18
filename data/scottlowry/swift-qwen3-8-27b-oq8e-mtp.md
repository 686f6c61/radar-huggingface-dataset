# scottlowry/Swift-Qwen3.8-27B-oQ8e-mtp

## Resumen

Swift-Qwen3.8-27B-oQ8e-mtp es un artefacto de cuantizacion publicado por el usuario scottlowry en HuggingFace, no un modelo entrenado desde cero. Se trata de una version en 8 bits del modelo base ukisai/Swift-Qwen3.8-27b, obtenida mediante oQ (quantization de precision mixta del proyecto oMLX, version v0.7.0.dev2) y empaquetada en safetensors con la libreria MLX. El repositorio ocupa 30,0 GB y declara 27.781.427.952 parametros en el manifiesto de safetensors (aproximadamente 27,8 mil millones).

Su relevancia es practica: permite ejecutar un modelo de ~27,8 B en hardware Apple Silicon con un peso en disco y en memoria cercano a 1 byte por parametro, en lugar de los ~55 GB que exigiria una version en bf16. El tipo de modelo declarado en la configuracion es `qwen3_5`, lo que situa la arquitectura en la familia Qwen 3.5, aunque ni la model card ni los metadatos publicados detallan la configuracion interna (numero de capas, atencion, posible componente MoE o longitud de contexto). El sufijo `mtp` del nombre no viene explicado en la documentacion publicada.

Hay que subrayar que el repositorio no incluye ficha tecnica del modelo base, licencia, idiomas ni resultados de evaluacion, y que en el momento de redactar esta ficha acumula 0 descargas y 0 likes, por lo que se trata de una publicacion sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen, tipo `qwen3_5` (detalles de capas, atencion y posible MoE: no disponibles) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, precision mixta oQ, group size 64, formato MLX safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), `library_name: mlx`, `model_type: qwen3_5` |
| Modelo base | ukisai/Swift-Qwen3.8-27b |
| Tamano del repositorio | 30,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

Este repositorio no contiene ningun proceso de entrenamiento: es el resultado de aplicar cuantizacion de precision mixta sobre un modelo ya existente. La herramienta empleada es oQ, integrada en oMLX v0.7.0.dev2, con 8 bits de precision y group size 64, un esquema habitual para reducir el error de cuantizacion manteniendo un tamano cercano a 1 byte por parametro. El resultado se serializa en safetensors para el runtime MLX, lo que implica que solo es consumible de forma nativa en entornos Apple Silicon (mlx-lm y derivados).

No se dispone de informacion sobre la arquitectura interna del modelo base `ukisai/Swift-Qwen3.8-27b` mas alla del `model_type: qwen3_5`: se desconoce el numero de capas, el tipo de atencion, si incorpora GQA, decodificacion especulativa, cabezas de prediccion multi-token (MTP) o cualquier innovacion de entrenamiento. Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones. No se ha publicado ninguna evaluacion del impacto de la cuantizacion oQ de 8 bits sobre la calidad del modelo original.

## Capacidades

No se ha publicado informacion verificable sobre las capacidades de este artefacto ni de su modelo base. Cualquier afirmacion funcional debe validarse empiricamente antes de usarse en produccion. Como referencia estructural, sin confirmacion documental:

- Generacion de texto y conversacion multi-turno: previsible por el tipo `qwen3_5`, pero no confirmado para este checkpoint.
- Generacion de codigo y matematicas: no confirmado en la informacion disponible.
- Tool calling / function calling: no confirmado.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta declarado en el repositorio).
- Modo de razonamiento explicito (thinking), vision o audio: no disponible.
- El sufijo `mtp` del nombre sugiere, sin confirmacion, multi-token prediction, lo que podria afectar al rendimiento en decodificacion; no hay documentacion que lo respalde.
- Efecto de la cuantizacion: la precision mixta a 8 bits puede degradar tareas sensibles (aritmetica de muchos pasos, formatos estrictos), pero no se ha medido en este repositorio.

## Casos de uso

Los siguientes escenarios asumen que el modelo base conserva las capacidades tipicas de la familia Qwen 3.5; deben validarse con pruebas propias antes de desplegarse.

- Inferencia local en Mac para desarrollo asistido: un equipo con Apple Silicon y memoria unificada suficiente puede cargar el checkpoint en 8 bits con mlx-lm y ofrecer autocompletado y generacion de codigo sin enviar el codigo a servicios externos, lo que simplifica el cumplimiento de politicas de confidencialidad.
- Prototipado offline en portatiles de gama alta: el formato MLX evita dependencias de CUDA y permite iterar en entornos sin GPU dedicada, a costa de un rendimiento por token inferior al de una GPU de centro de datos.
- Procesamiento por lotes de documentos en local: resumen y extraccion de informacion de corpus privados sobre los que no se permite salida a la nube, siempre que la longitud de contexto del modelo (no publicada) sea suficiente.
- Evaluacion comparativa de cuantizaciones: este checkpoint sirve como referencia de 8 bits frente a versiones bf16 o a cuantizaciones de 4 bits del mismo base, para medir la perdida de calidad con un conjunto de tareas propio.
- Asistente conversacional embebido en aplicaciones de escritorio macOS: mediante mlx-lm en modo servidor local expuesto por HTTP, integrar el modelo en un cliente nativo sin coste por token.
- Laboratorio de investigacion sobre cuantizacion: reproducir el pipeline oQ con distintos group sizes y precisiones para estudiar el compromiso entre tamano, velocidad y calidad en modelos de ~28 B.
- Generacion de codigo en pipelines internos: si se confirma soporte de tool calling, integrarlo en tareas de revisión estatica, generacion de tests o documentacion tecnica; sin esa confirmacion, limitarlo a generacion de texto supervisada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto, y tampoco hay datos publicos del modelo base `ukisai/Swift-Qwen3.8-27b` en la informacion proporcionada. No se dispone por tanto de cifras de perplejidad, calidad tras cuantizacion ni comparaciones con alternativas.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del tamano declarado (27.781.427.952 parametros) y del esquema de cuantizacion a 8 bits; no proceden de mediciones publicadas por el autor.

- Peso aproximado de los pesos: en torno a 27,8 GB con 8 bits y group size 64, coherente con los 30,0 GB de repositorio (que incluye metadatos e imagenes de escalas).
- Memoria unificada recomendada en Apple Silicon: 48-64 GB para dejar margen a la cache KV y al contexto. Un equipo de 32 GB queda al limite o directamente fuera del rango utilizable.
- Equipos de 36-48 GB: viables con contextos cortos y una unica secuencia; el consumo de cache KV crecera con el numero de tokens de contexto y de peticiones concurrentes.
- GPU dedicadas (A100 80 GB, H100, RTX 4090 24 GB): el formato MLX no esta pensado para CUDA. Un intento de uso en GPU NVIDIA exigiria reconvertir los pesos a otro formato, operacion no documentada en este repositorio. Con 24 GB de VRAM en una RTX 4090 no cabe la version de 8 bits tal cual.
- Consumidores con GPU: no cabe en GPUs consumer de 8-16 GB; requeriria cuantizaciones de 4 bits inexistentes en este repositorio.
- Opciones de despliegue: mlx-lm (libreria declarada), servidor HTTP de mlx-lm y clientes que consumen el formato MLX, como LM Studio en modo MLX. No hay artefactos GGUF publicados, por lo que llama.cpp y Ollama no pueden usarlo directamente, ni vLLM/TGI sin conversion previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con modelos alternativos, ya que se desconocen la licencia, el contexto, los idiomas y el rendimiento del modelo evaluado. La unica comparacion documentada es contra su propio modelo base.

| Modelo | Parametros | Precisión / formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottlowry/Swift-Qwen3.8-27B-oQ8e-mtp | 27,8 B | 8 bits, oQ, safetensors MLX | no disponible | no disponible | 0 descargas, 0 likes |
| ukisai/Swift-Qwen3.8-27b (base) | no disponible | presumiblemente bf16/fp16 | no disponible | no disponible | no disponible en la informacion proporcionada |
| Alternativas de tamano similar de la familia Qwen (p. ej. variantes de ~27-32 B) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay ficha del modelo base, ni detalles de arquitectura, ni contexto, ni idiomas, ni licencia.
- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial. Es imprescindible verificar la licencia del modelo base `ukisai/Swift-Qwen3.8-27b` antes de cualquier despliegue productivo.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado en este checkpoint; se agrava en dominios especializados y en contextos largos.
- Degradacion por cuantizacion: la precision mixta a 8 bits puede reducir la exactitud en tareas de razonamiento aritmetico o de formato estricto. No se ha publicado ninguna medicion de esta perdida.
- Sesgos: no evaluados ni documentados. No puede descartarse la presencia de sesgos sociales, culturales o linguisticos heredados del corpus de entrenamiento del base.
- Limitaciones de idioma: el repositorio no declara idiomas soportados; el rendimiento en castellano es desconocido.
- Encaje de hardware: solo para Apple Silicon con memoria unificada amplia; no hay soporte practico para CUDA ni artefactos GGUF.
- Herramienta de cuantizacion en fase de desarrollo: oMLX v0.7.0.dev2 es una version previa a la release estable, lo que introduce riesgo de incompatibilidades con versiones futuras del runtime.
- Repositorio sin traccion: 0 descargas y 0 likes, sin issues ni validacion de terceros. No hay evidencia de que el artefacto se haya probado mas alla de su publicacion.
- Fecha de publicacion inusual (2026-09-17): conviene confirmar la integridad y procedencia de los pesos antes de usarlos.
- El sufijo `mtp` no esta justificado en la documentacion; no debe inferirse ninguna capacidad adicional de decodificacion a partir del nombre.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scottlowry/Swift-Qwen3.8-27B-oQ8e-mtp
- Modelo base declarado: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Repositorio de la herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo, su autor ni su modelo base; los unicos enlaces utiles son los anteriores.
