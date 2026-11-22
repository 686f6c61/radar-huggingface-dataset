# hridya423/Inkling-2-Mini-12GB-GGUF

## Resumen

Inkling 2 Mini es un modelo de lenguaje de arquitectura MoE (mixture of experts) desarrollado por Thinking Machines, con 26.900.857.344 parametros totales. El repositorio analizado, `hridya423/Inkling-2-Mini-12GB-GGUF`, no es el modelo original sino una cuantizacion mixta de 2-3 bits (denominada mixB) creada por el usuario hridya423 para hacerlo caber en GPUs de 12 GB de VRAM manteniendo una ventana de contexto de 64K tokens. Incluye ademas un proyector de vision en BF16 tomado de `ggml-org/Inkling-2-Mini-GGUF`.

La relevancia de esta ficha esta en el empaquetado: se trata de una cuantizacion agresiva que reduce el modelo a un unico fichero GGUF de 10,3 GiB y que, segun el autor, decodifica a 51-64 tok/s en una RTX 4070 Ti con unos 1500 tok/s de procesamiento de prompt. El precio a pagar es una perdida de calidad medible (KLD de 0,048 frente a Q8_0) y una dependencia critica de un fork no oficial de llama.cpp, ya que los tensores de los expertos han sido rellenados con ceros de 1152 a 1280 columnas y la version upstream no puede cargar el fichero.

La licencia declarada es Apache 2.0, lo que facilita el uso comercial, pero conviene tener en cuenta que el modelo base es de Thinking Machines y que la cuantizacion es un trabajo derivado de terceros sin publicacion de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), segun tags del repo; detalles internos no disponibles |
| Parametros totales | 26.900.857.344 (26,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (configuracion recomendada en la model card) |
| Tipos de cuantizacion | Mixta 2-3 bits: IQ3_XXS, IQ2_S, IQ4_NL en expertos; Q6_K en tensores no-expertos y salida; Q8_0 en embedding; proyector de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyector de vision GGUF separado |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE), segun la etiqueta del repositorio. La model card de esta cuantizacion no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion corresponderia a la model card del modelo original de Thinking Machines, que no se incluye en la informacion proporcionada. Un detalle estructural relevante que si aparece es que las capas 6-17 forman un "loop core" que se ejecuta tres veces por token, lo que sugiere un mecanismo de recurrencia o comparticion de bloques que no esta documentado en detalle.

La innovacion tecnica de este repositorio concreto es la cuantizacion mixta: los expertos de las capas 6-17 (el nucleo recurrente) se cuantizan a IQ3_XXS, las capas 18-21 usan IQ3_XXS en la proyeccion down e IQ2_S en gate y up, las capas 22-23 se elevan a IQ4_NL y el resto de capas queda en IQ2_S. Los tensores no-expertos y la cabeza de salida se mantienen en Q6_K y el embedding en Q8_0, usando la imatrix de ggml-org. Ademas, los tensores down de los expertos se rellenan con ceros de 1152 a 1280 columnas, lo que obliga a usar el fork `inkling-fast` de llama.cpp.

## Capacidades

- Generacion de texto conversacional en formato chat (tag `conversational`).
- Razonamiento y respuesta multi-turno gracias a la ventana de 64K tokens.
- Procesamiento de imagenes mediante el proyector de vision `mmproj-Inkling-2-Mini-BF16.gguf` (vision multimodal).
- Soporte de plantillas Jinja (`--jinja`) para formateo de conversaciones.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de tool calling, agentes o thinking mode: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Asistente conversacional local en equipos de gama consumer: con 11,6 GB de VRAM en una RTX 4070 Ti y 64K de contexto, permite mantener sesiones largas sin depender de la nube.
- Procesamiento de documentos extensos con imagenes: el proyector de vision permite pasar capturas, diagramas o paginas escaneadas junto con prompts largos para extraccion de informacion.
- Prototipado de agentes con contexto amplio: la ventana de 64K y el formato chat con plantilla Jinja facilitan la construccion de pipelines multi-paso sobre hardware modesto.
- Analisis de codigo y texto tecnico en local: util para desarrolladores que necesitan un modelo razonablemente capaz sin enviar codigo propietario a servicios externos.
- Despliegue en estaciones de trabajo con una sola GPU de 12 GB: el uso de `-ot` para descargar las capas 22-23 a CPU permite ajustar el consumo de VRAM al limite.
- Evaluacion e investigacion de tecnicas de cuantizacion extrema: el repositorio documenta KLD, ratio de perplejidad y coincidencia de top token, lo que lo convierte en un caso de estudio para medir el impacto de cuantizaciones mixtas 2-3 bits.
- Generacion de respuestas en entornos con requisitos de privacidad: al ejecutarse con llama.cpp en local, los datos no salen del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente aporta metricas de calidad de cuantizacion frente a Q8_0 sobre 50 fragmentos de 512 tokens de wikitext-2:

| Modelo | KLD | Mismo top token | Ratio de perplejidad |
|---|---|---|---|
| mixB (esta cuantizacion) | 0,048 | 90,9% | 1,034 |
| ggml-org IQ4_NL (16,4 GiB, no cabe en 12 GB) | 0,009 | 95,7% | 1,002 |

Rendimiento de inferencia declarado por el autor en RTX 4070 Ti: 51-64 tok/s en decodificacion y aproximadamente 1500 tok/s en procesamiento de prompt.

## Requisitos de hardware

- VRAM estimada: 11,6 GB en total (incluyendo el escritorio de Windows), con contexto de 64K y cache KV en q8_0.
- GPU objetivo: 12 GB de VRAM; el autor cita explicitamente la RTX 4070 Ti.
- Cabe en GPUs consumer de 12 GB (RTX 4070 Ti, RTX 3060 de 12 GB, RTX 4070, etc.); no cabe en GPUs de 8 GB.
- Las capas 22-23 deben ejecutarse en CPU mediante `-ot "blk\.(22|23)\.ffn_.*_exps=CPU"`.
- Despliegue: llama.cpp, exclusivamente con el fork `hridaya423/llama.cpp`, rama `inkling-fast`. Upstream llama.cpp no puede cargar el fichero.
- Parametros de ejecucion recomendados: `-ngl 99 -fa on --jinja -c 65536 -b 512 -ub 512 -ctk q8_0 -ctv q8_0 -t 8 -np 1`.
- Latencia y throughput: 51-64 tok/s de decodificacion y ~1500 tok/s de prompt en RTX 4070 Ti (datos del autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | VRAM necesaria | Calidad (KLD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini mixB (este repo) | 26,9 mil millones | 64K | ~11,6 GB | 0,048 | Apache 2.0 | GGUF, requiere fork de llama.cpp |
| Inkling-2-Mini IQ4_NL (ggml-org) | 26,9 mil millones | no disponible | 16,4 GiB | 0,009 | Apache 2.0 | GGUF, llama.cpp upstream |
| Inkling-2-Mini original (Thinking Machines) | 26,9 mil millones | no disponible | no disponible | referencia Q8_0 | Apache 2.0 | safetensors / GGUF oficial |

No se dispone de informacion sobre otros modelos comparables de tamano o categoria similares en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion mixB degrada la calidad de forma medible: KLD de 0,048 frente a 0,009 de IQ4_NL, con solo 90,9% de coincidencia en el top token y un ratio de perplejidad de 1,034.
- Requiere un fork no oficial de llama.cpp (`hridaya423/llama.cpp`, rama `inkling-fast`); la version upstream no carga el modelo por el relleno de ceros en los tensores de expertos.
- El relleno de tensores de 1152 a 1280 columnas es una modificacion estructural que puede introducir artefactos no medidos por las metricas de KLD.
- La ejecucion de las capas 22-23 en CPU reduce el throughput y anade latencia variable segun el hardware del host.
- Sesgos conocidos: no disponibles; el modelo base no documenta evaluaciones de sesgo en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es esperable en un modelo de 26,9 mil millones con cuantizacion 2-3 bits.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingue sin datos del modelo base.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay validacion de la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base de Thinking Machines antes de un uso comercial.
- No se han publicado benchmarks estandar, por lo que no hay evidencia publica de rendimiento en tareas como MMLU, HumanEval o GSM8K.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hridya423/Inkling-2-Mini-12GB-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Fork de llama.cpp requerido: https://github.com/hridaya423/llama.cpp (rama `inkling-fast`)
- Guia de configuracion: https://github.com/hridaya423/inkling-2-mini-12gb
- GGUF oficial de referencia (ggml-org): https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
