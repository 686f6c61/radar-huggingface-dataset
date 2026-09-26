# RL-Forgetting-Experiments-3/qwen3-1.7b-base-code-sft-ordered-lr1e5-step102

## Resumen

`qwen3-1.7b-base-code-sft-ordered-lr1e5-step102` es un ajuste fino supervisado (SFT) orientado a generacion de codigo sobre el modelo base `Qwen/Qwen3-1.7B-Base`. Lo publica el usuario `RL-Forgetting-Experiments-3`, un espacio de publicacion cuyo nombre sugiere una linea de experimentos centrada en el olvido catastrofico durante el entrenamiento. El checkpoint corresponde al paso 102 del optimizador, con una tasa de aprendizaje de 1e-5 y una estrategia de replay de datos desactivada (`replay none`, `replay lambda 0.0`).

El modelo tiene 1.720.574.976 parametros (aproximadamente 1,72 mil millones), es de tipo denso y se distribuye en formato `safetensors` dentro de un repositorio de 6,9 GB, un tamano que coincide con pesos almacenados en precision de 32 bits. La model card es minima: no documenta composicion del dataset, numero de tokens de entrenamiento, ni resultados de evaluacion, y se limita a declarar que se trata de un modelo "inference-ready" para codigo, entrenado sobre `qwen3_1p7b_s500_code_sft_data`.

Su relevancia es fundamentalmente experimental y metodologica, no de producto: es un artefacto de investigacion sobre como el SFT especializado en codigo con ordenacion de datos concreta y sin replay afecta al rendimiento y al olvido de capacidades generales. Con cero descargas y cero "likes" en el momento de la consulta y una licencia no declarada, no es un modelo recomendable para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada del modelo base Qwen/Qwen3-1.7B-Base) |
| Parametros totales | 1.720.574.976 (1,72 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para este ajuste; la del modelo base Qwen3-1.7B es de 32.768 tokens nativos, ampliable con YaRN (dato de la familia base, no confirmado por el autor del ajuste) |
| Tipos de cuantizacion | No se publican versiones cuantizadas; el repositorio contiene unicamente safetensors en precision completa (6,9 GB, coherente con fp32) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card. Al ser un ajuste fino del modelo base `Qwen/Qwen3-1.7B-Base`, la topologia subyacente es la de un transformer decoder-only denso de la familia Qwen3, con atencion por consultas agrupadas (GQA) y normalizacion RMSNorm, aunque el autor no proporciona ningun detalle adicional ni confirma modificaciones estructurales. El repositorio pesa 6,9 GB para 1,72 mil millones de parametros, lo que implica pesos en 32 bits (4 bytes por parametro), un formato poco habitual para publicacion de inferencia, donde lo estandar es bf16 o fp16.

En cuanto al entrenamiento, lo unico documentado es: SFT supervisado sobre el conjunto `qwen3_1p7b_s500_code_sft_data`, con ordenacion de datos `ordered`, estrategia de replay `none` y `replay lambda` de 0.0. La etiqueta `mbpp` en el repositorio indica que MBPP (Mostly Basic Python Problems) forma parte del material de codigo utilizado. El checkpoint se toma en el paso 102 del optimizador con tasa de aprendizaje 1e-5. La ausencia de replay implica que no se mezclaron datos generales durante el ajuste, lo que es precisamente el escenario que la linea de experimentos "RL-Forgetting" parece estudiar: medir la perdida de capacidades no relacionadas con codigo. El autor remite a `delivery_manifest.json` para la trazabilidad de fuentes y sumas de verificacion, sin aportar cifras de tokens vistos ni composicion porcentual del dataset.

## Capacidades

- Generacion de texto autoregresiva y conversacion multi-turno, segun la etiqueta `conversational`.
- Generacion y completado de codigo, especialmente en Python, dado el uso de MBPP en el entrenamiento y la etiqueta `code`.
- Razonamiento de tipo instruccion tras el ajuste supervisado, aunque sin confirmacion de si se aplico plantilla de chat de Qwen3.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles con la API de HuggingFace (etiquetas `text-generation-inference` y `endpoints_compatible`).
- Capacidades multilingues: no disponibles; el autor no declara idiomas y el ajuste en codigo puede haber degradado el rendimiento en lenguas naturales no inglesas.
- Tool calling / function calling: no disponible (no se declara soporte, ni en la model card ni en las etiquetas).
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible.

## Casos de uso

- Evaluacion de olvido catastrofico en investigacion: el modelo sirve como punto de medida de cuanto pierde un SFT de codigo sin replay respecto al base Qwen3-1.7B-Base en tareas generales (conocimiento, matematicas, comprension lectora). Es su uso mas coherente con el nombre del repositorio.
- Baseline de ablacion en experimentos de ordenacion de datos: al estar etiquetado con orden `ordered` y paso 102, permite comparar contra otros checkpoints del mismo autor para aislar el efecto del orden del dataset.
- Generacion de codigo Python en entornos controlados: puede utilizarse para autocompletar funciones y resolver problemas tipo MBPP en scripts internos, siempre con revision humana, dado el tamano reducido del modelo.
- Prototipado local de asistentes de codigo sin conexion: con 1,72 B de parametros cabe en GPUs de consumo y permite iterar en portatiles o estaciones de trabajo sin coste de API.
- Educacion y ejemplos didacticos: generacion de fragmentos de codigo de ejemplo y explicaciones para materiales de formacion, con verificacion posterior de la salida.
- Pruebas de integracion de pipelines de inferencia: util para validar despliegues con transformers, text-generation-inference o vLLM antes de escalar a modelos mayores.
- Estudio de degeneracion de modelo base tras SFT: analisis de deriva de distribucion (perplejidad, repeticion, formato de salida) entre el modelo base y este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion y la busqueda web asociada no devolvio material relevante sobre el modelo (los resultados obtenidos corresponden a sitios sin relacion con el artefacto). El unico indicio es la etiqueta `mbpp`, que sugiere que ese conjunto se empleo en el entrenamiento, no que se haya evaluado con el.

## Requisitos de hardware

- Peso de los parametros: 1,72 B parametros. En fp32 (formato publicado) ocupan aproximadamente 6,9 GB; convertidos a bf16/fp16 bajan a unos 3,4 GB; en cuantizacion de 8 bits, unos 1,8 GB; en 4 bits, en torno a 1,0-1,2 GB.
- VRAM estimada para inferencia: 10-12 GB en fp32 (no recomendado para consumo), 5-6 GB en bf16, 3-4 GB en 8 bits y 2-3 GB en 4 bits, incluyendo cache KV para contextos moderados.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, tanto en bf16 como cuantizado. En GPUs de 8 GB es necesario cuantizar a 4 u 8 bits.
- GPU de datacenter: A100, H100, L40S o A10G sobredimensionadas para este tamano; utiles solo por agregacion de muchas instancias o por despliegue con contextos muy largos.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta explicita), vLLM y SGLang como alternativas de alto rendimiento. Para llama.cpp u Ollama es necesario convertir los pesos a GGUF, ya que el repositorio no incluye versiones GGUF.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-1.7b-base-code-sft-ordered-lr1e5-step102 | 1,72 B | No documentado en este ajuste | No disponible | HuggingFace, sin cuantizaciones | Checkpoint experimental de SFT en codigo, sin benchmarks publicados |
| Qwen/Qwen3-1.7B-Base | 1,72 B | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 (segun la familia Qwen3) | HuggingFace, ampliamente desplegado | Modelo base del anterior; sin especializacion en codigo |
| Qwen2.5-Coder-1.5B | 1,54 B | 32.768 tokens | Apache 2.0 | HuggingFace, con versiones GGUF y AWQ | Alternativa especifica de codigo de la generacion anterior, con evaluacion publicada |
| SmolLM2-1.7B | 1,7 B | 8.192 tokens | Apache 2.0 | HuggingFace, con versiones GGUF | Alternativa de investigacion, no especializada en codigo |

Los datos de contexto y licencia de los modelos comparados corresponden a sus especificaciones publicas por parte de sus respectivos autores; no proceden de la informacion proporcionada sobre este ajuste.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada no hay autorizacion explicita de uso comercial. Cualquier uso en produccion requiere aclarar previamente los terminos con el autor.
- Model card practicamente vacia: no se especifican datos de entrenamiento, numero de tokens, composicion del dataset, hiperparametros completos ni proceso de alineacion (RLHF/DPO). La replicabilidad es nula.
- Riesgo elevado de olvido catastrofico: la configuracion declarada (`replay none`, `replay lambda 0.0`, `ordered`) implica entrenamiento en codigo sin mezcla de datos generales, lo que suele degradar el conocimiento general, el multilingue y el seguimiento de instrucciones.
- Riesgo de alucinacion: un modelo de 1,72 B parametros especializado en codigo tiende a inventar APIs, firmas de funciones y librerias inexistentes; toda salida de codigo debe ejecutarse y revisarse.
- Modelo truncado en el paso 102: puede tratarse de un checkpoint intermedio, no de un entrenamiento finalizado, con posible inestabilidad en el formato de salida.
- Idiomas no declarados: no hay garantia de rendimiento en castellano ni en ninguna otra lengua distinta del ingles tecnico del corpus de codigo.
- Ausencia de datos de evaluacion: sin cifras de benchmarks no es posible estimar su calidad relativa frente a alternativas con licencia clara.
- Adopcion nula: cero descargas y cero interacciones en el momento de la consulta, lo que reduce la probabilidad de que existan informes independientes de fallos o comportamientos anomalos.
- Pesos en precision completa: el repositorio en 6,9 GB obliga a convertir a bf16 o cuantizar antes de un despliegue eficiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3/qwen3-1.7b-base-code-sft-ordered-lr1e5-step102
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Perfil del autor: https://huggingface.co/RL-Forgetting-Experiments-3
- Referencia del conjunto MBPP (mencionado en las etiquetas): no disponible en la informacion proporcionada
- Paper, blog o repositorio del ajuste: no disponible en la informacion proporcionada
