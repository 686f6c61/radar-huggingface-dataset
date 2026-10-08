# HungryDino/gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen3

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo Gemma 3 4B en su variante instruct, publicado por el usuario HungryDino bajo el identificador `gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen3`. El modelo base declarado es `unsloth/gemma-3-4b-it`, y el entrenamiento se ha realizado con la libreria Unsloth junto con TRL de Hugging Face, segun indica la propia model card. La licencia declarada es Apache 2.0 y el unico idioma listado en los metadatos es el ingles.

Se trata de un artefacto experimental mas que de un modelo de proposito general. La nomenclatura del identificador (`raven_numbers-collapse_p10-run2-gen3`) apunta a un experimento sobre colapso numerico con generaciones iteradas (tercera generacion de la segunda ejecucion de una configuracion concreta), y el perfil del autor incluye otros repositorios de la misma familia, como `gemma_3_4b_it-control_numbers-self_collapse_p10-gen2` y `gemma_3_4b_it-control_numbers-collapse_p10-gen8`. La model card no documenta el conjunto de datos, el procedimiento de entrenamiento ni los hiperparametros, mas alla de la mencion a Unsloth y TRL.

El interes de esta ficha es, por tanto, acotado: sirve para localizar y reproducir un punto concreto de una bateria de experimentos sobre degradacion numerica en ajustes finos iterativos. Con cero descargas y cero likes en el momento de la consulta, y un tamano de repositorio de 0,1 GB (muy inferior a los aproximadamente 8 GB que ocuparian los pesos completos de un modelo de 4.000 millones de parametros en FP16), todo apunta a que el repositorio contiene adaptadores LoRA en lugar de pesos completos, aunque esto no se confirma en la documentacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3); no detallada en la model card |
| Parametros totales | ~4.000 millones, heredados del modelo base; no verificado en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Gemma 3 4B declara 128.000 tokens) |
| Tipos de cuantizacion | No disponible; el repositorio publica safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (ingles), segun los metadatos del repositorio |
| Licencia | apache-2.0 (declarada por el autor) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura concreta de este ajuste mas alla de su ascendencia: al derivar de `unsloth/gemma-3-4b-it`, hereda la arquitectura del modelo Gemma 3 en su variante de 4.000 millones de parametros, un transformer decoder-only con atencion por consultas agrupadas y normalizacion RMSNorm. La model card no especifica si el ajuste conserva la torre de vision del modelo base, ni si se ha modificado alguna capa.

Respecto al entrenamiento, la unica informacion disponible es que se utilizo Unsloth, que permite ajustes finos aproximadamente dos veces mas rapidos y con menor consumo de memoria, junto con la libreria TRL. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la receta de alineacion (RLHF, DPO u otras) ni los hiperparametros. El tamano del repositorio, 0,1 GB, sugiere que se publican adaptadores en lugar de pesos fusionados, lo que implicaria que para la inferencia es necesario cargar el modelo base y aplicar el adaptador. Esta conclusion es una inferencia a partir del tamano del repositorio, no un dato confirmado por el autor.

El nombre del repositorio indica que forma parte de una serie de variantes generadas de forma secuencial (`gen3`, dentro de la ejecucion `run2` de la configuracion `p10`), lo que es coherente con protocolos de investigacion sobre colapso de modelos en los que cada generacion se entrena sobre las salidas de la anterior.

## Capacidades

- Generacion de texto en ingles, heredada del modelo instruct base.
- Razonamiento y matematicas basicas: presumiblemente conservadas del modelo base, pero no verificadas ni documentadas para este ajuste.
- Capacidad multimodal (imagen-texto): no disponible; la model card no confirma si el ajuste preserva la torre de vision de Gemma 3 4B.
- Soporte de tool calling y function calling: no disponible; no se documenta ninguna plantilla de herramientas especifica para este ajuste.
- Soporte de agentes y razonamiento en varios pasos: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos, aunque el modelo base Gemma 3 es multilingue y este ajuste podria haber degradado ese comportamiento.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Comportamiento especial: el ajuste esta orientado a experimentos sobre colapso numerico, por lo que su comportamiento en tareas aritmeticas puede diferir deliberadamente del modelo base.

## Casos de uso

- Reproduccion de experimentos sobre colapso de modelos: el repositorio representa un punto concreto (generacion 3, ejecucion 2, parametro p10) de una serie; se usaria para replicar curvas de degradacion comparando generaciones sucesivas frente a la variante de control.
- Auditoria de degradacion aritmetica: evaluar este ajuste frente al modelo base con baterias de problemas numericos permitiria cuantificar cuanto se ha degradado la capacidad de calculo tras varias generaciones de ajuste iterativo.
- Investigacion sobre ajuste fino con Unsloth y TRL a bajo coste: sirve como referencia practica de un pipeline de ajuste de un modelo de 4.000 millones de parametros en hardware de consumo, ya que el repositorio ocupa 0,1 GB.
- Docencia y divulgacion sobre model collapse: util como ejemplo tangible de artefacto intermedio dentro de una cadena de generaciones, para explicar como se propaga el sesgo entre iteraciones.
- Analisis de contaminacion de datos sinteticos: si las generaciones se entrenaron sobre salidas del propio modelo, este checkpoint permite estudiar la deriva de distribucion en tareas de conteo y numeros.
- Comparacion de variantes dentro de una misma serie: junto con los repositorios hermanos (`-gen2`, `-gen8`, `-self_collapse_p10-gen2`), permite montar una comparativa controlada cambiando solo el indice de generacion.
- Base para un ajuste posterior si se demuestra utilidad: al ser un adaptador pequeno y con licencia Apache 2.0 declarada, puede fusionarse y reajustarse, siempre que se respeten las condiciones del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Si el repositorio contiene adaptadores LoRA (hipotesis coherente con los 0,1 GB), es imprescindible descargar tambien el modelo base `unsloth/gemma-3-4b-it` (unos 8 GB en FP16) y fusionar o aplicar el adaptador en tiempo de carga.
- VRAM estimada para inferencia de un modelo de 4.000 millones de parametros: en FP16, entre 8 y 10 GB; en cuantizacion de 8 bits, entre 5 y 7 GB; en 4 bits, entre 3 y 5 GB. Estas cifras son estimaciones genericas por tamano, no medidas sobre este repositorio concreto.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en servidor; RTX 4090, RTX 4080, RTX 3090 o RTX 4060 Ti de 16 GB para estaciones de trabajo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM usando cuantizacion de 4 u 8 bits; en 16 GB se puede ejecutar en FP16 con margen.
- Opciones de despliegue: transformers (formato publicado), TGI (etiqueta `text-generation-inference` presente), vLLM si se fusionan los pesos, y llama.cpp u Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y rendimiento: no disponibles. No hay mediciones de throughput ni de tiempo hasta el primer token en la informacion proporcionada.
- Configuracion de inferencia recomendada por el equipo de Gemma 3, segun el cuaderno de Unsloth enlazado en la busqueda: temperatura 1.0, top_p 0.95 y top_k 64.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este ajuste (`gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen3`) | ~4.000 millones (heredados) | No disponible | Sin benchmarks publicados | apache-2.0 declarada | 0 descargas, 0 likes |
| `unsloth/gemma-3-4b-it` (modelo base) | ~4.000 millones | No disponible en la informacion proporcionada | No disponible | Sujeta a los terminos de Gemma | Ampliamente disponible |
| `HungryDino/gemma_3_4b_it-control_numbers-self_collapse_p10-gen2` | ~4.000 millones (heredados) | No disponible | Sin benchmarks publicados | No disponible | Repositorio hermano del mismo autor |
| `HungryDino/gemma_3_4b_it-control_numbers-collapse_p10-gen8` | ~4.000 millones (heredados) | No disponible | Sin benchmarks publicados | No disponible | Repositorio hermano del mismo autor |

No se dispone de datos de rendimiento para ninguno de los elementos de la tabla, por lo que la comparativa se limita a aspectos de disponibilidad y linaje. Las alternativas de proposito general de tamano similar (por ejemplo, otros modelos instruct de la franja de 3.000 a 4.000 millones de parametros) no se han incluido porque no hay informacion verificable en el material proporcionado que permita contrastarlas con este ajuste.

## Limitaciones y advertencias

- La model card es practicamente vacia: no documenta dataset, hiperparametros, numero de tokens ni metodologia de evaluacion, lo que impide reproducir el ajuste con fidelidad.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni de validacion por parte de terceros.
- El nombre del repositorio sugiere que el modelo ha sido entrenado en un regimen de colapso numerico iterativo; es esperable una degradacion en tareas aritmeticas y de conteo, aunque no se cuantifica en la informacion disponible.
- Riesgo elevado de alucinacion y de deriva de distribucion, propio de modelos ajustados sobre datos sinteticos generados por ellos mismos.
- Idioma: solo se declara ingles. No hay soporte multilingue documentado y el ajuste podria haber erosionado las capacidades multilingues del modelo base.
- Licencia: el autor declara apache-2.0, pero al derivar de pesos de Gemma es probable que sigan aplicandose los terminos de uso de Gemma al modelo subyacente. Conviene verificar la compatibilidad antes de un uso comercial.
- No se distribuyen pesos cuantizados ni ficheros GGUF, por lo que el despliegue en llama.cpp u Ollama requiere una conversion previa.
- Si el repositorio contiene solo adaptadores, cualquier uso en produccion exige descargar y fusionar el modelo base, con el coste de almacenamiento y memoria correspondiente.
- Ausencia total de benchmarks: no hay ninguna garantia publicada sobre calidad, seguridad o sesgos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HungryDino/gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen3
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it
- Repositorio hermano (control, self collapse, gen2): https://huggingface.co/HungryDino/gemma_3_4b_it-control_numbers-self_collapse_p10-gen2
- Repositorio hermano (control, collapse, gen8): https://huggingface.co/HungryDino/gemma_3_4b_it-control_numbers-collapse_p10-gen8
- Ficha de directorio del modelo hermano: https://essamamdani.com/ai-models/hf-hungrydino-gemma-3-4b-it-control-numbers-self-collapse-p10-gen2
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Cuaderno de Unsloth para Gemma 3 4B: https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Gemma3_(4B).ipynb
- Gemma (modelo de lenguaje), Wikipedia: https://en.wikipedia.org/wiki/Gemma_(language_model)
