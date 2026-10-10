# glyd/Qwen3.5-0.8B-kestrel

## Resumen

Qwen3.5-0.8B-kestrel es un checkpoint cuantizado del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario glyd bajo el identificador glyd/Qwen3.5-0.8B-kestrel. No es un modelo entrenado desde cero: es una compresion con perdida (lossy) de los pesos originales en bf16, generada con el nivel de cuantizacion "kestrel" del motor propietario de Glyd. El checkpoint ocupa 0,62 GB, un 59% menos que el bf16 original (1,5 GB), y esta etiquetado en el Hub como de 8 bits, aunque el autor precisa que el resultado real es de aproximadamente 6,5 bits por peso.

La relevancia practica del modelo esta en el binomio tamano/velocidad: con 612.257.203 parametros almacenados y 1,3 GB de memoria de GPU en uso a 4k de contexto, alcanza 673 tokens/s en una RTX 4090 con 35 ms hasta el primer token, y admite contextos de 32k en RTX 4090, L40S y RTX A6000. La contrapartida es que solo se ejecuta con el motor de Glyd (`glyd run`) sobre Linux con GPU NVIDIA y driver 580 o superior; no funciona todavia en vLLM ni en transformers.

Se trata de un artefacto muy reciente y de adopcion minima (13 descargas y 0 likes en el momento de la consulta), sin benchmarks academicos publicados. Su interes es, por tanto, experimental: evaluar la degradacion de un modelo pequeno multimodal cuando se comprime a ~6,5 bits y se descarta su parte de vision, que no esta incluida en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-0.8B; no se documenta la arquitectura interna en la informacion proporcionada) |
| Parametros totales | 752.393.024 en el modelo original; 612.257.203 parametros almacenados en el checkpoint cuantizado (dato de safetensors) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | 32k tokens confirmados (el autor indica que cabe un contexto de 32k en RTX 4090, L40S y RTX A6000; no se detalla el maximo exacto) |
| Tipos de cuantizacion | kestrel, aproximadamente 6,5 bits por peso, cuantizado una sola vez desde bf16; con perdida (lossy). El Hub lo etiqueta como "8-bit" |
| Idiomas soportados | no disponible |
| Licencia | pesos: Apache-2.0 (heredada de Qwen/Qwen3.5-0.8B). Motor de ejecucion Glyd: BUSL-1.1 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,6 GB (0,62 GB segun la model card) |
| Modelo base | Qwen/Qwen3.5-0.8B (commit 2fc06364715b967f1860aea9cf38778875588b17), relacion: quantized |
| Divergencia respecto a bf16 | KL de 0,00725 medida en WikiText-2 (menor es mejor) |
| Modalidad | solo texto; la parte de vision del modelo base no esta incluida |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo en la documentacion disponible: la model card de este repositorio describe exclusivamente el proceso de cuantizacion, no la topologia del modelo base Qwen/Qwen3.5-0.8B (numero de capas, tipo de atencion, dimensiones ocultas o vocabulario). Tampoco se detalla el dataset de entrenamiento, el numero de tokens, ni si hubo fases de RLHF o DPO en el modelo original. Lo unico deducible del material aportado es que el modelo base incorpora un componente de vision, ya que el autor advierte explicitamente que "the model's vision part is not included" en este checkpoint.

La innovacion tecnica de este repositorio es el propio esquema de cuantizacion "kestrel" de Glyd: una unica pasada de cuantizacion desde los pesos bf16 originales hasta aproximadamente 6,5 bits por peso. El autor cuantifica la perdida con la divergencia KL respecto a bf16 sobre WikiText-2, que asciende a 0,00725, frente a 0,0278 del nivel "swift" del mismo motor (un 65% mas pequeno). La model card insiste en que la etiqueta "8-bit" del Hub cuenta bytes empaquetados y no refleja la precision efectiva por peso.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y el modelo conserva la funcionalidad conversacional del base segun la model card; no se enumeran capacidades concretas adicionales.
- Razonamiento, codigo y matematicas: no disponible. No se publican resultados de MMLU, HumanEval, GSM8K ni evaluaciones equivalentes.
- Vision: no soportada en este checkpoint. El componente de vision del modelo base no esta incluido.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible. El campo de idiomas no esta informado en el repositorio.
- Capacidad especial: modo de pensamiento, audio u otras modalidades no documentadas.
- Contexto largo: manejo de hasta 32k tokens segun las pruebas de memoria del autor en RTX 4090, L40S y RTX A6000.

## Casos de uso

- Prototipado en estaciones de trabajo con GPU de consumo: con 1,3 GB de memoria en uso a 4k de contexto y 673 tokens/s en una RTX 4090, el modelo permite iterar sobre prompts y flujos conversacionales sin reservar VRAM significativa, dejando el resto de la GPU libre para otras tareas.
- Generacion de texto a gran volumen con requisitos de latencia baja: los 35 ms hasta el primer token en RTX 4090 y los 673 tokens/s lo hacen adecuado para tareas de completado o resumen en lote donde el coste por token importa mas que la calidad punta.
- Despliegue en GPUs de clase profesional no tope de gama: las mediciones en L40S (568 tokens/s, 32 ms al primer token, 1,4 GB) y RTX A6000 (495 tokens/s, 53 ms, 1,2 GB) permiten planificar servicios modestos sobre hardware ya amortizado.
- Procesamiento de documentos largos de un solo tenant: el soporte de 32k tokens en las tres GPUs medidas permite resumir o extraer informacion de contratos, informes o transcripciones sin trocear el texto, aunque sin garantias de calidad al no haber benchmarks.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio publica la divergencia KL frente a bf16 (0,00725) y su hermano swift (0,0278), por lo que sirve como punto de referencia reproducible en WikiText-2 para estudiar el compromiso tamano/fidelidad en modelos sub-1B.
- Investigacion sobre degradacion multimodal: al conservar unicamente la parte de texto de un modelo base multimodal, permite medir cuanto de la capacidad textual depende de la torre de vision, siempre que se disponga del original bf16 como control.
- Pruebas de integracion del motor Glyd: util para validar el flujo `glyd run Qwen/Qwen3.5-0.8B:kestrel` en Linux con driver NVIDIA 580 o superior antes de comprometerse con modelos mayores del mismo ecosistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos aportados por el autor son metricas de fidelidad de cuantizacion y de velocidad, que se recogen a continuacion.

| Metrica | bf16 (original) | kestrel (este repo) | swift (variante) |
|---|---|---|---|
| Tamano de descarga | 1,5 GB | 0,62 GB | 0,52 GB |
| Reduccion frente a bf16 | – | 59% | 65% |
| Divergencia KL vs bf16 (WikiText-2) | 0 | 0,00725 | 0,0278 |
| Velocidad en RTX 4090 | no disponible | 673 tokens/s | 724 tokens/s |

| GPU | Tokens/s | Primer token | Memoria a 4k | Contexto de 32k |
|---|---|---|---|---|
| RTX 4090 | 673 | 35 ms | 1,3 GB | si |
| L40S | 568 | 32 ms | 1,4 GB | si |
| RTX A6000 | 495 | 53 ms | 1,2 GB | si |

Mediciones realizadas el 2026-10-09 con glyd 0.29.4, una GPU por prueba y contexto de 4k tokens; la memoria indicada es la consumida en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: 1,2-1,4 GB de memoria en uso a 4k de contexto segun la GPU (1,3 GB en RTX 4090, 1,4 GB en L40S, 1,2 GB en RTX A6000). El repositorio pesa 0,6 GB en disco.
- Contexto largo: el autor confirma que cabe un contexto de 32k en RTX 4090, L40S y RTX A6000, sin publicar la memoria exacta en ese regimen.
- GPU recomendadas: RTX 4090, L40S y RTX A6000 son las unicas con mediciones publicadas. Cualquier GPU NVIDIA con al menos ~2 GB de VRAM libre es un candidato razonable por tamano, pero no hay mediciones que lo confirmen.
- GPU de consumo: si, cabe holgadamente en una RTX 4090 y, por tamano de pesos, en practicamente cualquier GPU NVIDIA moderna; el limite practico es el software, no la memoria.
- Requisitos de sistema: Linux con GPU NVIDIA y driver 580 o superior.
- Opciones de despliegue: exclusivamente el motor de Glyd (`glyd run`). El autor indica explicitamente que el modelo no es compatible todavia con vLLM ni con transformers. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 673 tokens/s y 35 ms al primer token en RTX 4090; 568 tokens/s y 32 ms en L40S; 495 tokens/s y 53 ms en RTX A6000. No hay datos de throughput con lotes concurrentes ni con contexto de 32k.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Formato y motor | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| glyd/Qwen3.5-0.8B-kestrel | 752.393.024 (base), 612.257.203 almacenados | 0,62 GB | safetensors, motor Glyd | 32k | Pesos Apache-2.0; motor BUSL-1.1 | 13 descargas, 0 likes |
| glyd/Qwen3.5-0.8B-swift | mismo modelo base | 0,52 GB | safetensors, motor Glyd | no disponible | Pesos Apache-2.0; motor BUSL-1.1 | Repositorio hermano del mismo autor |
| Qwen/Qwen3.5-0.8B (bf16) | 752.393.024 | 1,5 GB | safetensors, ecosistema estandar | no disponible en esta informacion | Apache-2.0 | Modelo base, commit 2fc06364 |

Comparativa de fidelidad: kestrel se aleja de bf16 una KL de 0,00725 en WikiText-2, aproximadamente 3,8 veces menos que swift (0,0278), a cambio de ocupar un 19% mas que este ultimo (0,62 GB frente a 0,52 GB) y de ser un 7% mas lento en RTX 4090 (673 frente a 724 tokens/s). No se dispone de comparaciones con alternativas de otros autores del mismo rango de parametros.

## Limitaciones y advertencias

- Cuantizacion con perdida: el propio autor califica el checkpoint como "not lossless" y publica una divergencia KL de 0,00725 frente a bf16 en WikiText-2. No hay evaluacion de como se traduce esa deriva en tareas generativas concretas.
- Compatibilidad de software muy restringida: no funciona en vLLM ni en transformers "todavia", y requiere el motor de Glyd sobre Linux con driver NVIDIA 580 o superior. Esto invalida despliegues en stacks habituales (TGI, llama.cpp, Ollama) y en hardware no NVIDIA.
- Licencia del motor: los pesos son Apache-2.0, pero el motor necesario para ejecutarlos es BUSL-1.1, gratuito solo para uso personal y no comercial en equipos propios. El uso comercial exige una licencia de pago, lo que limita el uso en produccion aunque los pesos sean libres.
- Modalidad reducida: el componente de vision del modelo base no esta incluido, por lo que el modelo es solo texto. No se puede usar para tareas de imagen.
- Idiomas: el repositorio no declara idiomas soportados. Se desconoce la cobertura multilingue real.
- Sin benchmarks de calidad: no hay MMLU, HumanEval, GSM8K ni ninguna evaluacion de tareas. La unica metrica de fidelidad es la divergencia KL, que mide proximidad probabilistica, no utilidad.
- Riesgo de alucinacion: no se publica ninguna evaluacion de veracidad ni de tasas de alucinacion para este checkpoint ni para su base. Al tratarse de un modelo de 752M de parametros, cabe esperar una fiabilidad limitada en conocimiento factual, aunque no hay datos que lo cuantifiquen.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad.
- Adopcion practicamente nula: 13 descargas y 0 likes, con creacion y ultima actualizacion el mismo dia (2026-10-10). No hay evidencia de uso en produccion ni de validacion por terceros.
- Consistencia de cifras: el numero de parametros del checkpoint (612.257.203) no coincide con el del modelo base (752.393.024) porque el primero cuenta los pesos empaquetados tras la cuantizacion. Conviene no confundir ambos valores al calcular requisitos de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/glyd/Qwen3.5-0.8B-kestrel
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Commit concreto del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
- Variante swift del mismo autor: https://huggingface.co/glyd/Qwen3.5-0.8B-swift
- Sitio del motor Glyd: https://getglyd.com
- Script de instalacion del motor: https://getglyd.com/install.sh
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: unicamente dominios no relacionados (bvb.de y subdominios). No se han localizado papers, blogs ni demos adicionales.
