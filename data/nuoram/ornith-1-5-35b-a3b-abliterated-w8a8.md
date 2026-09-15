# nuoram/Ornith-1.5-35B-A3B-abliterated-W8A8

## Resumen

Ornith-1.5-35B-A3B-abliterated-W8A8 es un checkpoint cuantizado a INT8 en esquema W8A8 publicado por el usuario nuoram sobre el modelo abliterado de huihui-ai, que a su vez deriva del Ornith 1.5 35B-A3B de ornith-ai. Se trata, por tanto, de una cadena de tres eslabones: fundacional, abliteracion y cuantizacion. El resultado es un modelo multimodal de tipo image-text-to-text con 35.139.306.736 parametros totales (arquitectura MoE, sufijo A3B en el nombre) que conserva intactos el torre de vision y la cabeza MTP, algo que las otras alternativas publicadas descartan.

La relevancia de esta ficha no esta en el modelo base, sino en las decisiones tecnicas de la cuantizacion. El autor cuantiza a 8 bits solo las capas `Linear`, y deja deliberadamente en bf16 el torre de vision completo (27 bloques mas el merger, 333 tensores `model.visual.*`), todos los routers MoE (`mlp.gate` y `shared_expert_gate` en las 40 capas), los modulos de atencion lineal `linear_attn` y sus normas, el `lm_head` y la cabeza MTP entera. El razonamiento es explicito: un router de 8 bits elige expertos distintos, y el estado de la atencion lineal es sensible a la precision.

El checkpoint ocupa 35.7 GiB en disco (38.4 GB de repositorio) y usa el formato `int-quantized` de `compressed-tensors` 0.18.0. La eleccion de W8A8 INT8 frente a FP8 o NVFP4 responde a un criterio de compatibilidad de hardware: el esquema W8A8 de vLLM declara compute capability minima 75, por lo que multiplica en los tensor cores INT8 de una A40 o una A100, mientras que FP8 exige 89 (Lovelace o superior). La licencia es Apache 2.0 y los idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5MoeForConditionalGeneration` (MoE hibrida con atencion lineal y torre de vision) |
| Parametros totales | 35.139.306.736 (35,1 B) |
| Parametros activos | Aproximadamente 3 B (segun el sufijo A3B del nombre; el dato exacto no se detalla en la informacion disponible) |
| Longitud de contexto | no disponible (la model card cita contextos de 8K y 256K al discutir decodificacion especulativa, sin declarar la ventana oficial) |
| Tipos de cuantizacion | W8A8 INT8: pesos enteros de 8 bits simetricos por canal, activaciones enteras de 8 bits dinamicas; sin calibracion (round-to-nearest data-free). Vision, routers MoE, `linear_attn`, `lm_head` y cabeza MTP permanecen en bf16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, `compressed-tensors` 0.18.0, formato `int-quantized` |

## Arquitectura y entrenamiento

El modelo es un transformer MoE hibrido con mezcla de atencion completa y modulos de atencion lineal (`linear_attn`), construido sobre la clase `Qwen3_5MoeForConditionalGeneration`. Cuenta con 40 capas MoE, cada una con `mlp.gate` y `shared_expert_gate`, mas una torre de vision de 27 bloques con su merger y una cabeza MTP (multi-token prediction) con 256 expertos propios. El checkpoint no ha sido reentrenado: es una cuantizacion post-entrenamiento del abliterado de huihui-ai. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo fundacional, ya que la model card se centra exclusivamente en el proceso de cuantizacion.

La innovacion tecnica destacable esta en la cabeza MTP, que no es la original del modelo base sino un injerto del destilado de shisa-ai (`shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY`, revision `2b19b31bfe1659c6b0d9459ec3cbd87e34a322ef`). El autor documenta tres motivos. Primero, acepta casi el doble de tokens draft: 69,27 % de aceptacion con una racha media aceptada de 3,078 tokens, frente al 37,20 % (racha 2,116) de la cabeza original de Ornith y el 50,19 % (racha 2,506) de un injerto zero-shot de la cabeza de Qwen3.6. Segundo, transfiere bien: es un fine-tune con deltas del 0,5 % al 8,7 % del rango de cada tensor respecto a la cabeza oficial. Tercero, el layout: Ornith publica los 256 expertos de la cabeza sin fusionar (785 tensores `mtp.layers.0.mlp.experts.N.*`), mientras que esta version usa la forma fusionada de 19 tensores (`experts.gate_up_proj` `[256, 1024, 2048]`, `experts.down_proj` `[256, 2048, 512]`). El autor incluye ademas una correccion explicita a la afirmacion, difundida en la discusion #10 del modelo base, de que la cabeza original no esta entrenada: los sondeos de los safetensors publicados el 27 de agosto de 2026 muestran `mtp.norm.weight` con media +1,9251 y desviaciones tipicas de proyeccion que varian en un factor de tres (`mtp.fc` 0,0085 frente a `q_proj` 0,0247), lo que descarta una inicializacion uniforme en `initializer_range`. Se descarto DFlash como alternativa porque su aceptacion cae del 89,8 % a 8K hasta el 48,8 % cerca de 256K, resulta mas lento que la decodificacion autorregresiva simple en 252K/8K (0,67x) y rompe la multimodalidad.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento y generacion de codigo (capacidades heredadas del modelo fundacional; no se aportan benchmarks especificos en la informacion disponible).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`): la torre de vision se mantiene completa en bf16, con 333 tensores `model.visual.*`.
- OCR y lectura de documentos visuales, al conservarse el torre de vision y el merger sin cuantizar.
- Decodificacion especulativa mediante cabeza MTP con 256 expertos, con un 69,27 % de aceptacion y 3,078 tokens aceptados por racha segun las mediciones de shisa-ai en vLLM.
- Compatibilidad con vLLM, incluida la variante con cabecera `/generate` de endpoints.
- Modelo abliterado: se han eliminado las direcciones de rechazo del modelo original, lo que amplia el rango de respuestas sin filtrado interno.

## Casos de uso

- Analisis de documentos escaneados: la torre de vision se conserva en bf16 con sus 27 bloques y el merger, por lo que el modelo puede procesar facturas, formularios o capturas y devolver texto estructurado sin la perdida de calidad que introduciria una cuantizacion del encoder visual.
- Asistencia conversacional multi-turno en produccion: el checkpoint mantiene los routers MoE en bf16, de modo que la seleccion de expertos no se degrada respecto al modelo original, algo critico en dialogos largos donde una ruta de expertos distinta cambia la respuesta.
- Inferencia de alto rendimiento en hardware Ampere: en una A100 o una A40 el esquema W8A8 INT8 se resuelve contra los tensor cores INT8 nativos, con un ahorro real de memoria y de tiempo, a diferencia de FP8, que en esa generacion cae a un esquema weight-only servido por Marlin.
- Despliegue multimodal con decodificacion especulativa: la cabeza MTP injertada permite generar unos tres tokens por paso verificado, lo que reduce la latencia por token en cargas de generacion larga siempre que el motor de inferencia soporte MTP.
- Pipelines de extraccion de informacion sobre imagenes: al conservar el modelo la clase `Qwen3_5MoeForConditionalGeneration`, se pueden seguir usando las utilidades multimodales de Transformers y de vLLM sin adaptar el codigo al caso text-only.
- Investigacion sobre abliteracion y cuantizacion: el checkpoint permite medir el efecto aislado de cuantizar o no los routers MoE, la atencion lineal y la cabeza MTP, ya que el autor documenta explicitamente que elementos quedan en bf16 y por que.
- Servicio con paralelismo de tensor: la model card propone `--tensor-parallel-size 2`, lo que encaja en despliegues de dos GPUs de 48 GB o mas para repartir los 35,7 GiB de pesos mas la cache KV.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El unico dato empirico aportado son las tasas de aceptacion de la decodificacion especulativa de las cabezas MTP, medidas por shisa-ai en vLLM y reproducidas en la model card:

| Cabeza MTP | Aceptacion | Racha media aceptada |
|---|---|---|
| Propia de Ornith 1.5 | 37,20 % | 2,116 |
| Injerto zero-shot de Qwen3.6 | 50,19 % | 2,506 |
| Destilado de shisa-ai (la usada aqui) | 69,27 % | 3,078 |
| DFlash (descartada) | 89,8 % a 8K, 48,8 % cerca de 256K | no disponible |

## Requisitos de hardware

- Peso en disco y en memoria: 35,7 GiB de pesos (38,4 GB de repositorio), a los que hay que sumar la cache KV.
- No cabe en GPUs de consumo de 24 GB (RTX 4090, RTX 3090, 4090 D) ni siquiera en su totalidad; requeriria al menos 40 GB solo para pesos.
- GPU recomendadas: A100 80 GB (compute capability 8.0) y A40 48 GB (8.6), donde el esquema W8A8 INT8 usa los tensor cores INT8 nativos; H100 y B200 tambien funcionan, pero el autor recomienda la build FP8 oficial en Ada, Hopper y Blackwell.
- Despliegue con paralelismo de tensor 2 en GPUs de 48 GB o mas, segun el comando de la model card: `vllm serve nuoram/Ornith-1.5-35B-A3B-abliterated-W8A8 --tensor-parallel-size 2 --enable-auto-to…` (el comando aparece truncado en la informacion disponible).
- Opciones de despliegue: vLLM es el motor de referencia por el soporte de `compressed-tensors` y de MTP; tambien es cargable con Transformers y la libreria `compressed-tensors` 0.18.0. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas.
- Restriccion de hardware del esquema: W8A8 INT8 exige compute capability minima 75 en vLLM; el esquema FP8 W8A8 exige 89. Por debajo de Lovelace, un checkpoint FP8 se sirve mediante Marlin con activaciones en 16 bits y sin ganancia de velocidad.
- Latencia y throughput: no disponibles como cifras absolutas; la unica referencia es la tasa de aceptacion del 69,27 % de la cabeza MTP, que implica del orden de 3,078 tokens por paso de verificacion.

## Comparativa con modelos similares

| Modelo | Arquitectura | Vision | Cabeza MTP | Tamano | Licencia |
|---|---|---|---|---|---|
| Este repositorio (W8A8) | `Qwen3_5MoeForConditionalGeneration` | Si, 333 tensores | Si, injertada del destilado de shisa-ai | 35,7 GiB | Apache 2.0 |
| Otro W8A8 publicado | `Qwen3_5MoeForCausalLM` | No, 0 tensores | Si, original sin fusionar | 35,7 GiB (no confirmado) | no disponible |
| Otras abliteraciones publicadas | Una degrada a `ForCausalLM` | No, 0 tensores | Eliminada | 64,6 GiB (bf16, segun la model card) | no disponible |
| Ornith 1.5 35B-A3B oficial (ornith-ai) | `Qwen3_5MoeForConditionalGeneration` | Si | Si, original | 67,0 GiB (bf16, segun la model card) | no disponible |
| Huihui-Ornith-1.5-35B-A3B-abliterated (bf16) | `Qwen3_5MoeForConditionalGeneration` | Si | Si, original | no disponible | no disponible |

Las diferencias clave entre las alternativas cuantizadas son la presencia del torre de vision y de la cabeza MTP, y la clase de arquitectura declarada. Un checkpoint text-only descarta silenciosamente a cualquier consumidor de imagenes o OCR, con un fallo que no produce error: el modelo responde, simplemente no ve.

## Limitaciones y advertencias

- Modelo abliterado y etiquetado como uncensored: se han eliminado las direcciones de rechazo, por lo que puede generar contenido que el modelo original filtraria. Requiere evaluacion de seguridad propia antes de cualquier despliegue publico.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion en la informacion disponible.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado ni garantizado.
- Longitud de contexto no declarada: la model card menciona regimenes de 8K y 256K al comparar cabezas de decodificacion especulativa, pero no confirma la ventana oficial del modelo, por lo que no debe asumirse.
- Naturaleza derivada: la licencia Apache 2.0 se hereda del modelo base; conviene verificar las condiciones de los eslabones intermedios (la abliteracion de huihui-ai y el destilado MTP de shisa-ai) antes de un uso comercial.
- La cuantizacion es data-free (round-to-nearest sin calibracion), por lo que no esta ajustada a ningun corpus concreto y puede comportarse de forma menos predecible en dominios muy especializados.
- La cabeza MTP es un injerto de un destilado de terceros, no la original de Ornith; aunque el autor documenta su transferencia, introduce una dependencia adicional en la cadena de procedencia.
- Restriccion de motor: el rendimiento INT8 completo solo se materializa en GPUs con compute capability 75 o superior (Turing/Ampere y posteriores con soporte INT8 en vLLM); en Ada, Hopper y Blackwell el autor recomienda explicitamente la build FP8 oficial en lugar de esta.
- La compatibilidad con decodificacion especulativa depende del soporte de MTP en el motor de inferencia elegido.
- El repositorio no tiene descargas ni likes registrados en el momento de la consulta, y su creacion y actualizacion se produjeron el mismo dia (15 de septiembre de 2026), lo que apunta a un artefacto reciente y poco validado por terceros.

## Enlaces

- [nuoram/Ornith-1.5-35B-A3B-abliterated-W8A8](https://huggingface.co/nuoram/Ornith-1.5-35B-A3B-abliterated-W8A8)
- [huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated](https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated) (revision `7269f0953054d68b3cacbd9ad729921258732007`)
- [ornith-ai/Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY](https://huggingface.co/shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY) (revision `2b19b31bfe1659c6b0d9459ec3cbd87e34a322ef`)
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo: los resultados obtenidos (Reddit, Zhihu, repositorios de jailbreaks, GitHub Desktop y deepseek-harness) no guardan relacion con el checkpoint.
