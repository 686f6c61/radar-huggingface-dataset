# owenmorgan/qwen3.5-4b-w8a16

## Resumen

qwen3.5-4b-w8a16 es una version cuantizada del modelo multimodal Qwen/Qwen3.5-4B (revision 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a), publicada por el usuario owenmorgan en HuggingFace. La cuantizacion se ha aplicado exclusivamente a las capas lineales del modelo de lenguaje, que pasan a enteros de 8 bits con una escala simetrica por cada 128 entradas (esquema W8A16, empaquetado con compressed-tensors y redondeo al mas cercano). El resto de componentes permanece en bfloat16: los embeddings (atados a la capa de salida), las puertas de atencion lineal de pequeno tamano y la torre de vision.

El objetivo declarado del autor es reducir el peso en disco y en memoria de 9,3 GB (bf16) a 5,57 GB, de forma que el modelo quepa y se sirva en una tarjeta grafica de 8 GiB, en concreto dentro de un proyecto denominado Crucible. Con ese fin se indica su ejecucion con vLLM 0.29 usando kernels Marlin sobre arquitecturas Ampere, en modo solo texto mediante el flag `--language-model-only`, y con el modo de razonamiento (thinking) desactivado.

El modelo cuenta con 4.539.265.536 parametros totales y se distribuye bajo licencia Apache 2.0, heredada del modelo base. Su relevancia practica es acotada: se trata de una cuantizacion de terceros, sin datos de calibracion, con 13 descargas y 0 likes en el momento de redactar esta ficha, y sin informacion publicada sobre contexto, idiomas, datos de entrenamiento o resultados de evaluacion. No se han encontrado en la busqueda web enlaces, papers ni documentacion tecnica asociados a este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen3.5-4B; la informacion disponible menciona puertas de atencion lineal y torre de vision, sin detallar el resto de la arquitectura |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 (activaciones en 16 bits, pesos en int8), escala simetrica unica por cada 128 entradas, empaquetado `pack-quantized` de compressed-tensors, round-to-nearest, sin datos de calibracion. Embeddings, puertas de atencion lineal y torre de vision permanecen en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con cuantizacion compressed-tensors (no hay GGUF publicado) |

Datos adicionales aportados por el autor: tamano del repositorio de 5,6 GB, 5,57 GB en disco frente a 9,3 GB del modelo base en bfloat16, creado el 10 de octubre de 2026 y actualizado el mismo dia.

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base Qwen/Qwen3.5-4B en la documentacion proporcionada. Lo unico deducible de la model card de esta cuantizacion es que el modelo contiene (a) capas lineales en el modelo de lenguaje, que son las que se han cuantizado; (b) embeddings atados a la capa de salida, que se mantienen en bfloat16; (c) puertas de atencion lineal de tamano reducido, tambien en bfloat16; y (d) una torre de vision, lo que confirma su naturaleza multimodal (pipeline image-text-to-text). Los parametros totales del checkpoint cuantizado coinciden con los de un modelo denso de aproximadamente 4,5 mil millones de parametros.

En cuanto al entrenamiento, no hay datos disponibles: se desconoce el numero de tokens, la composicion del dataset, si hubo fases de RLHF, DPO u otras tecnicas de alineamiento, y si existe un modo de razonamiento explicito mas alla de la referencia del autor a "servir con thinking off". La unica innovacion tecnica documentada en esta ficha es la propia cuantizacion post-entrenamiento: int8 simetrico por bloques de 128 entradas en las capas lineales del LM, sin calibracion, conservando en bfloat16 las partes sensibles a la precision (embeddings, puertas de atencion lineal y torre de vision). No se documenta el impacto de este proceso sobre la calidad final del modelo.

## Capacidades

- Generacion de texto y conversacion multi-turno: el pipeline declarado es `image-text-to-text` con tag `conversational`, y usa la plantilla de chat del modelo base.
- Procesamiento de imagenes: el checkpoint conserva la torre de vision en bfloat16, por lo que la capacidad multimodal sigue presente en los pesos, aunque el autor solo documenta su despliegue en modo texto con `--language-model-only` en vLLM.
- Razonamiento con modo thinking: la model card menciona explicitamente la opcion de thinking y recomienda servirlo con el modo desactivado; no se detalla el comportamiento con thinking activo tras la cuantizacion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara lista de idiomas.
- Capacidades especiales (audio, decodificacion especulativa, atencion lineal efectiva): solo se confirma la existencia de puertas de atencion lineal en el modelo base; no hay detalles adicionales.

## Casos de uso

- Inferencia local en GPU de gama media: el modelo esta pensado para ejecutarse en una tarjeta de 8 GiB con vLLM 0.29 y kernels Marlin en Ampere, lo que permite desplegar un modelo de 4,5 mil millones de parametros en equipos con RTX 3060 Ti, RTX 3070 o similares manteniendo pesos en int8.
- Prototipado rapido de asistentes conversacionales: al usar la plantilla de chat del modelo base y ser compatible con el pipeline `image-text-to-text` de transformers, se puede integrar en scripts de prueba sin reentrenamiento ni ajuste adicional.
- Automatizacion de tareas de texto en entornos con VRAM limitada: el modo solo texto (`--language-model-only`) reduce el consumo al descartar la torre de vision, lo que resulta util para pipelines de generacion de texto, resumen o clasificacion donde no se necesitan imagenes.
- Despliegue en servidores de inferencia con vLLM: al estar empaquetado con compressed-tensors y ser compatible con endpoints, puede exponerse como API compatible con OpenAI detras de vLLM para aplicaciones internas con poco trafico.
- Experimentacion academica con cuantizacion: sirve como caso de estudio de cuantizacion post-entrenamiento sin calibracion (W8A16, escala por 128 entradas) para medir degradacion frente al modelo base en bfloat16.
- Pruebas de viabilidad de modelos multimodales en hardware de consumo: permite evaluar si un VLM de 4,5B cuantizado a int8 ofrece calidad suficiente antes de invertir en GPU de mayor capacidad.
- Base para ajuste fino con QLoRA: al ser un checkpoint de transformers con safetensors, puede servir como punto de partida para adaptaciones de bajo rango sobre las capas en bfloat16 (embeddings, puertas de atencion y vision), no disponible como procedimiento documentado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, y tampoco hay comparaciones con el modelo base en bfloat16 que permitan estimar la degradacion introducida por la cuantizacion. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,57 GB de pesos en disco (W8A16), frente a 9,3 GB del modelo base en bfloat16. A esta cifra hay que sumar la cache KV y las activaciones, cuyo tamano no se documenta porque se desconoce la longitud de contexto.
- Hardware objetivo declarado por el autor: tarjeta de 8 GiB, sirviendo con vLLM 0.29 y kernels Marlin sobre Ampere.
- GPU recomendadas: cualquier GPU Ampere o posterior con al menos 8 GiB, como RTX 3060 Ti, RTX 3070, RTX 4060 Ti o RTX 4070; en el segmento profesional, A10, L4 o A100 (esta ultima sobredimensionada para este tamano).
- Cabe en GPU de consumo: si, segun el autor, en tarjetas de 8 GiB. En la practica el margen es estrecho, ya que 5,57 GB de pesos dejan poco espacio para cache KV y activaciones; el contexto utilizable dependera del presupuesto de memoria restante.
- Opciones de despliegue: vLLM 0.29 (documentado por el autor, con `--language-model-only` y thinking desactivado) y transformers (libreria declarada en el repositorio). No hay versiones GGUF publicadas, por lo que llama.cpp y Ollama no son opciones directas con este checkpoint. No se confirma compatibilidad con TGI ni con otros servidores.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato y peso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-w8a16 (este modelo) | 4.539.265.536 | no disponible | safetensors W8A16 int8, 5,57 GB | Apache 2.0 | 13 descargas, 0 likes |
| Qwen/Qwen3.5-4B (modelo base) | 4.539.265.536 (mismo checkpoint de origen) | no disponible | safetensors bfloat16, 9,3 GB | Apache 2.0 | no disponible en la informacion proporcionada |
| Otras cuantizaciones del mismo modelo base (AWQ, GPTQ, GGUF) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa mas alla del peso en disco y el esquema de cuantizacion.

## Limitaciones y advertencias

- Cuantizacion sin calibracion: la model card indica explicitamente "no calibration data" y redondeo al mas cercano. Esto implica que no se ha ajustado el rango de cuantizacion a las distribuciones reales de activaciones, lo que puede degradar la calidad respecto al modelo base. No se publican mediciones de esa degradacion.
- Ausencia total de evaluacion: no hay benchmarks, comparativas ni analisis de calidad. No es posible afirmar que el modelo mantenga las capacidades del original.
- Modelo de terceros con validacion minima: 13 descargas y 0 likes en el momento de redactar la ficha. No hay reportes de la comunidad ni verificacion independiente.
- Multimodalidad no verificada en despliegue: la torre de vision se conserva en bfloat16 en los pesos, pero el autor solo documenta su uso en modo texto con `--language-model-only`. El rendimiento de la parte visual tras la cuantizacion de las capas lineales del LM no esta documentado.
- Modo thinking desaconsejado por el autor: se recomienda servir el modelo con el razonamiento desactivado, sin explicar el motivo ni las consecuencias de activarlo.
- Idiomas no declarados: el repositorio no especifica lenguas soportadas, por lo que no se puede garantizar un comportamiento correcto fuera del ingles o del chino sin pruebas propias.
- Contexto desconocido: al no publicarse la longitud de contexto del modelo base ni del cuantizado, no se puede planificar el uso con documentos largos o conversaciones extensas.
- Riesgo de alucinacion: no hay datos especificos para esta cuantizacion; se hereda el comportamiento del modelo base, que no esta documentado en la informacion disponible.
- Sesgos: no disponible. No se ha publicado ninguna evaluacion de sesgos para este checkpoint ni para su base.
- Compatibilidad de despliegue limitada: el soporte esta documentado para vLLM 0.29 sobre Ampere con kernels Marlin; no hay confirmacion de funcionamiento en GPU anteriores a Ampere, en otras versiones de vLLM ni en otros motores de inferencia.
- Licencia: Apache 2.0, que permite uso comercial y modificacion siempre que se conserve el aviso de licencia y se atribuya el modelo base. Al ser una obra derivada, se deben respetar tambien las condiciones de Qwen/Qwen3.5-4B, que se distribuye bajo la misma licencia segun la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/owenmorgan/qwen3.5-4b-w8a16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Busqueda web: no se han encontrado enlaces relevantes (papers, blogs, repositorios o demos) asociados a este modelo; los resultados devueltos no guardan relacion con el ambito de la inteligencia artificial.
