# icecubetr/DeepSeek-V4.1-Flash-1017-dsx-2.6bit

## Resumen

DeepSeek-V4.1-Flash-1017-dsx-2.6bit es una cuantización extrema del checkpoint oficial `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicada por el usuario icecubetr. No es un modelo nuevo: es un GGUF de 187,6 GB (174,7 GiB) en un único fichero, generado con una herramienta propia llamada dsx, que comprime los expertos enrutados de un MoE de 552B parámetros más un componente Engram de 196B hasta una media de 2,6127 bits por peso (bpw). El objetivo declarado es ejecutar el modelo en dos RTX 3090 con 192 GB de RAM del sistema, algo imposible con el checkpoint oficial en FP8/FP4.

La relevancia es doble. Por un lado, demuestra que técnicas de asignación de precisión por experto (GPTQ con Hessianos de activación y un asignador que reparte el presupuesto de bits según el error de salida retenido) permiten bajar de 3 bits por peso en las capas intermedias manteniendo el enrutamiento exacto, sin poda ni sesgo de router. Por otro, el modelo solo es utilizable con el motor dsx (Rust + CUDA), que lee las tablas Engram sin cuantizar directamente de los safetensors oficiales, por lo que el consumo real de disco ronda los 390 GB entre el GGUF y los shards externos.

Es importante subrayar que el autor no publica ninguna medición de calidad, perplejidad, KL ni throughput para este build. Las cifras de rendimiento que circulan (77,0 en DeepSWE, 74,2 % de pass rate en Deep-SWE v1.1) corresponden al modelo base oficial, no a esta cuantización, y deben tratarse como un techo teórico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con componente Engram; 40 capas, 384 expertos enrutados por capa (15.360 en total) |
| Parametros totales | 552B (MoE) + 196B (Engram), segun la model card |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (1M), configurado con `--ctx 1048576` |
| Tipos de cuantizacion | Por experto: PTQ1_0 (ternario), Q2_0 y Q3_K; denso: Q8_0, F16 y F32; Engram externo en FP8/E8M0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF especifico de dsx (no compatible con llama.cpp, Ollama ni LM Studio) + safetensors oficiales para Engram |
| Tamano del fichero | 187,6 GB (174,7 GiB) en un unico GGUF |
| Precision media (expertos enrutados) | 2,6127 bpw |
| Reparto de expertos | 5.717 PTQ1_0 (37,2 %), 2.545 Q2_0 (16,6 %), 7.098 Q3_K (46,2 %) |
| Capas densas | Q8_0 en atencion, shared expert y head (8,5 bpw); F16 en embedding, compressor/indexer y Engram wkv (16 bpw); F32 en norms, router y mHC (32 bpw) |
| Motor de inferencia | dsx (Rust + CUDA), con API compatible OpenAI y Anthropic y UI web |
| Enrutamiento | Exacto: sin poda ni sesgo de router; el rango de experto solo afecta a la colocacion |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts de 552B parametros organizado en 40 capas con 384 expertos enrutados por capa, a los que se suma un modulo Engram de 196B parametros que en el checkpoint oficial se almacena en tablas separadas (~203 GB de safetensors). Esta cuantizacion no toca ese modulo: lo deja en FP8/E8M0 y lo lee en tiempo de ejecucion desde los shards 47 y 48 del repositorio oficial, junto con el indice y el tokenizer. El resto de pesos densos se mantiene en precision alta (Q8_0 en atencion, shared expert y head; F16 en embeddings; F32 en normas y router), de modo que solo los expertos enrutados sufren la compresion agresiva.

El proceso de cuantizacion parte del checkpoint FP8/FP4 oficial y aplica GPTQ por experto con Hessianos de activacion. La calibracion usa 128 secuencias de 2.048 tokens (262.144 tokens en total) compuestas por prompts de agente, codigo fuente, programacion, razonamiento y contexto largo de un agente de referencia, re-renderizados para V4.1, mas pools de respaldo web/chat/multilingue. Para cada experto se mide el error de salida retenido en PTQ1_0, Q2_0 y Q3_K, y un asignador reparte el presupuesto de bits donde mas reduce el error. La granularidad es de un tier por experto: gate, up y down de un mismo experto comparten formato, sin asignacion por proyeccion.

Los presupuestos por capa son asimetricos: las capas 0, 1, 37, 38 y 39 usan 3,4375 bpw con `--max-ternary-frac 0.75`, mientras que las capas 2 a 36 bajan a 2,5 bpw con el mismo limite de proporcion ternaria. El resultado efectivo es 3,4375 bpw en la capa 0, valores entre 3,3664 y 3,4313 en las capas 1 y 37-39, y 2,4989-2,5000 en el bloque central. No se ha publicado informacion sobre el entrenamiento original del modelo base (composicion del dataset, numero de tokens, fases de RLHF/DPO) en la documentacion disponible.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del checkpoint V4.1-Flash-1017.
- Codificacion y tareas de ingenieria de software: el modelo base reporta resultados en DeepSWE y Deep-SWE v1.1, orientados a tareas agenticas de reparacion y escritura de codigo.
- Razonamiento agentico multi-paso, con finalizacion de tareas mas rapida y salidas mas cortas que la version V4.1-Flash de septiembre, segun la cobertura de prensa del modelo base.
- Contexto largo de hasta 1.048.576 tokens, adecuado para repositorios completos o historiales extensos en una sola ventana.
- Servido mediante API compatible con OpenAI y Anthropic, lo que permite integrarlo en clientes y frameworks existentes sin adaptadores propios.
- Interfaz web incluida en el motor dsx.
- Capacidades multimodales, de audio o de tool calling nativo: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; la calibracion menciona pools multilingues, pero no se detalla cobertura.

## Casos de uso

- Analisis de repositorios completos en local: con 1M tokens de contexto se puede cargar un monorepo mediano y pedir auditorias de seguridad o refactorizaciones sin trocear el codigo, manteniendo todo el proceso en hardware propio.
- Agente de codigo autonomo en estaciones de trabajo con dos RTX 3090: el modelo puede ejecutar bucles de edicion-compilacion-test gracias al contexto largo y a la API compatible con OpenAI, integrándose en arneses tipo DeepSeek Harness o frameworks propios.
- Asistencia sobre documentacion tecnica extensa: manuales, normativas o contratos de cientos de miles de tokens caben en una sola ventana, lo que evita pipelines de RAG y sus errores de recuperacion.
- Procesamiento por lotes de codigo y tests en un servidor interno: al ser MIT y ejecutarse sin dependencia de la nube, encaja en entornos con requisitos de soberania de datos o con prohibicion de enviar codigo a terceros.
- Prototipado e investigacion sobre cuantizacion extrema: este build sirve como banco de pruebas para medir el impacto real de 2,6 bpw en un MoE grande, comparando respuestas contra el checkpoint oficial.
- Migracion de cargas existentes desde la API de DeepSeek: al exponer endpoints compatibles con OpenAI y Anthropic, un equipo puede redirigir su trafico a la instancia local cambiando solo la URL base, sin reescribir el cliente.
- Experimentacion academica con contexto de 1M tokens: tareas de recuperacion en ventanas muy largas, summarization de historiales o evaluacion de degradacion atencional, con la salvedad de que la cuantizacion altera la linea base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este build cuantizado. La model card indica explicitamente que no incluye mediciones de calidad, KL, perplejidad ni throughput.

Los unicos datos numericos disponibles corresponden al modelo base oficial, recogidos de cobertura de prensa y no verificables contra este GGUF:

| Benchmark | Modelo base DeepSeek-V4.1-Flash-1017 | Fuente |
|---|---|---|
| DeepSWE | 77,0 | marktechpost.com |
| Deep-SWE v1.1 (pass rate) | 74,2 % (frente a 74,0 % de Opus-5) | startupfortune.com |
| Calidad de este build 2,6-bit | no medido | model card del autor |

Cualquier extrapolacion de estas cifras a la version de 2,6127 bpw carece de respaldo empirico: la degradacion de un MoE cuantizado de forma no uniforme puede ser muy desigual entre tareas, y el propio autor advierte de que el reparto por experto se optimizo contra un conjunto de calibracion de solo 262.144 tokens.

## Requisitos de hardware

- VRAM: 48 GB en total, repartidos entre dos GPU de 24 GB (el comando de referencia usa `--gpu0-gb=-1.0 --gpu1-gb=-1.0`, es decir, todo el VRAM disponible de cada una).
- RAM del sistema: 192 GB, con `--arena-gb 160` reservados para el arena de pesos. Los pesos viven mayoritariamente en memoria del host, no en VRAM.
- Almacenamiento: 187,6 GB para el GGUF mas aproximadamente 203 GB de safetensors Engram (solo se necesitan el indice y los shards 47 y 48), lo que ronda los 390 GB en disco.
- GPU compatibles: RTX 3090 es el objetivo declarado (el ejemplo compila con `CUDA_ARCHS=86`, arquitectura Ampere). Para RTX 50xx hay que recompilar con `CUDA_ARCHS=120`. No se documenta soporte para A100, H100 ni otras GPU de centro de datos.
- No cabe en una sola GPU de consumo; el diseno asume reparto entre dos GPU mas offload a RAM.
- Opciones de despliegue: exclusivamente el motor dsx (`dsx-server`), con API compatible OpenAI y Anthropic y UI web. No es compatible con llama.cpp, Ollama, LM Studio, vLLM ni TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones, y el hecho de que los expertos se resuelvan desde RAM del host hace previsible que la velocidad dependa fuertemente del ancho de banda de memoria y del acierto del enrutamiento, pero no hay cifras que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este build (icecubetr dsx 2,6-bit) | 552B MoE + 196B Engram | 1.048.576 | 2,6127 bpw medios | MIT | GGUF de 187,6 GB + Engram externo; solo motor dsx |
| DeepSeek-V4.1-Flash-1017 oficial | 552B MoE + 196B Engram | no disponible | FP8/FP4 | no disponible | HuggingFace, requiere hardware de centro de datos |
| DeepSeek-V4.1-Flash (sep. 2026) | no disponible | no disponible | no disponible | no disponible | HuggingFace / API; predecesor con peores resultados en tareas agenticas segun prensa |
| Anthropic Opus-5 | no disponible (propietario) | no disponible | no disponible | propietario | Solo API; 74,0 % en Deep-SWE v1.1 |

La comparacion relevante no es de calidad sino de accesibilidad: este build es el unico de la lista que puede ejecutarse en hardware de gama alta de consumo, a costa de una perdida de calidad no medida y de perder la portabilidad de GGUF estandar al depender de un motor especifico.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay perplejidad, KL, benchmarks ni estudios de degradacion. Usar este build en produccion sin una evaluacion propia es asumir un riesgo no cuantificado.
- Cuantizacion muy agresiva: 2,6127 bpw medios con un 37,2 % de expertos en ternario (PTQ1_0). El bloque central de 35 capas opera practicamente a 2,5 bpw, por debajo de lo habitual en cuantizaciones de 2-3 bits publicadas.
- Calibracion limitada: 262.144 tokens, sin sesiones reales de agente locales. Los dominios poco representados en ese conjunto pueden degradarse mas de lo previsto.
- Asignacion no uniforme: distintos expertos tienen distinta precision dentro de la misma capa. Esto complica el diagnostico de errores y hace que el comportamiento no sea uniforme entre tipos de prompt.
- Dependencia de un unico motor: dsx es un proyecto de un solo autor, no compatible con llama.cpp ni Ollama. No hay ecosistema, ni herramientas de servido estandar, ni garantias de mantenimiento.
- Dependencia de ficheros externos: sin los safetensors del checkpoint oficial (indice, shards 47 y 48, tokenizer) el modelo no arranca. La licencia MIT del GGUF no altera los terminos del modelo base, cuya licencia no se detalla en la informacion disponible.
- Requisito de RAM elevado: 192 GB de memoria del sistema y 160 GB de arena. Fuera del alcance de la mayoria de estaciones de trabajo.
- Riesgo de alucinacion: inherente al modelo base y presumiblemente amplificado por la cuantizacion; no hay mediciones de factualidad.
- Idiomas: sin lista publicada. No se debe asumir buen rendimiento en castellano sin pruebas propias.
- Modelo con cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso por terceros ni de reproducibilidad del proceso.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/icecubetr/DeepSeek-V4.1-Flash-1017-dsx-2.6bit
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Version anterior del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Motor dsx (Rust + CUDA): https://github.com/lxe/dsx
- Cobertura del lanzamiento y resultado DeepSWE: https://www.marktechpost.com/2026/10/17/deepseek-just-released-v4-1-flash-1017-scores-77-0-on-deepswe-opens-search-api/
- Cobertura sobre DeepSeek Harness y Deep-SWE v1.1: https://startupfortune.com/deepseek-ties-its-new-v41-flash-1017-model-tighter-to-its-own-harness/
- Analisis de la actualizacion de benchmarks: https://www.mindstudio.ai/blog/deepseek-v4-1-flash-1017-release
- Ficha de seguimiento de lanzamiento: https://aireleasetracker.com/model/deepseek/deepseek-v4.1-flash-1017
