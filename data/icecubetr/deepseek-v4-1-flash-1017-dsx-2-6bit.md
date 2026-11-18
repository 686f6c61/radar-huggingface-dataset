# icecubetr/DeepSeek-V4.1-Flash-1017-dsx-2.6bit

## Resumen

DeepSeek-V4.1-Flash-1017-dsx-2.6bit es una cuantizacion mixta de precision del checkpoint oficial deepseek-ai/DeepSeek-V4.1-Flash-1017, un modelo MoE de gran escala con 551.880.865.136 parametros totales segun los safetensors del repositorio (la model card cita 552B MoE mas 196B Engram). La publica el usuario icecubetr bajo licencia MIT y esta pensada para ejecutarse en hardware de consumo: dos RTX 3090 y 192 GB de RAM.

El paquete ocupa 187,6 GB en un unico GGUF con formato propietario de la libreria dsx, un motor escrito en Rust y CUDA especifico para este modelo. No es compatible con llama.cpp, Ollama ni LM Studio. Emplea precision mixta por experto (PTQ1_0, Q2_0 y Q3_K para los expertos enrutados, con pesos densos en Q8_0, F16 y F32) y alcanza una media de 2,6127 bits por peso sobre 15.360 expertos, sin poda ni sesgo de router.

Su relevancia practica esta en que permite servir un modelo de clase frontier con routing exacto en dos GPU de 24 GB, con ~29 tok/s de decodificacion y ~330 tok/s de prefill, y una perdida de calidad medida de KL 0,1972 y top-1 del 82,59% frente al profesor FP8/FP4. Es, por tanto, una opcion para laboratorios con hardware limitado que necesiten contexto muy largo (hasta 262.144 tokens en la configuracion medida) y capacidad multimodal image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con componente Engram (modelo base DeepSeek-V4.1-Flash-1017) |
| Parametros totales | 551.880.865.136 (552B MoE + 196B Engram segun model card) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens en la configuracion medida; el motor admite `--ctx 1048576` con mas KV cache |
| Tipos de cuantizacion | Mixta por experto: PTQ1_0, Q2_0, Q3_K (2,6127 bpw medio); densos Q8_0, F16, F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF propietario de dsx (no compatible con llama.cpp/Ollama/LM Studio) + shards safetensors del checkpoint oficial para Engram |

## Arquitectura y entrenamiento

El modelo base es un MoE de DeepSeek con 40 capas y 15.360 expertos enrutados, mas un componente Engram que en esta cuantizacion se deja sin cuantizar y se lee en tiempo de ejecucion desde los shards safetensors oficiales (~203 GB). El proceso de cuantizacion parte del checkpoint FP8/FP4 oficial y aplica GPTQ por experto con Hessianos de activacion, tras una fase de calibracion con 128 secuencias de 2048 tokens (262.144 tokens) compuestas por prompts de agente, codigo, razonamiento y contexto largo, mas pools de respaldo web/chat/multilingue.

La asignacion de bits es por experto y por capa: las capas 0, 1, 37, 38 y 39 usan un presupuesto de 3,4375 bpw con fraccion ternaria maxima de 0,75, mientras que las capas 2 a 36 usan 2,5 bpw con la misma restriccion. El resultado son 5.717 expertos en PTQ1_0 (37,2%), 2.545 en Q2_0 (16,6%) y 7.098 en Q3_K (46,2%). El allocator mide el error de salida retenido de cada experto en cada tier y gasta el presupuesto donde mas reduce el error. Los pesos densos van en Q8_0 (attention, shared expert, head), F16 (embedding, compressor/indexer, Engram wkv) y F32 (norms, router, mHC). El routing es exacto: sin poda ni sesgo de router, y el rango del experto solo afecta a la colocacion en memoria.

## Capacidades

- Generacion de texto y razonamiento multimodal: pipeline image-text-to-text, con entrada de imagen y texto.
- Razonamiento multi-paso y contexto largo: ventana de 262.144 tokens en la configuracion medida, ampliable a 1.048.576 en el motor con mas KV cache.
- Codigo y matematicas: el conjunto de calibracion incluye prompts de programacion y razonamiento, lo que sugiere soporte para tareas de codigo.
- Tool calling y function calling: el motor dsx expone API compatible con OpenAI y Anthropic, lo que habilita integracion en pipelines con herramientas.
- Capacidades de agente: la calibracion usa prompts de agente, y el motor esta disenado para servir como backend de agentes.
- Capacidades multilingues: la calibracion incluye pools multilingues, pero no se detallan idiomas soportados.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia con contexto largo en hardware de consumo: con 262.144 tokens de contexto y ~29 tok/s de decodificacion en dos RTX 3090, se puede desplegar un asistente que procese documentos extensos o repositorios completos sin truncar.
- Agentes autonomos multi-paso: el motor dsx expone API compatible con OpenAI y Anthropic, lo que permite conectarlo a frameworks de agentes y a tool calling sin adaptadores propios.
- Analisis de imagenes y texto combinados: el pipeline image-text-to-text permite tareas de descripcion, extraccion de informacion o respuesta a preguntas sobre imagenes.
- Generacion y revision de codigo en pipelines de CI/CD: la calibracion con prompts de programacion y el soporte de function calling permiten integrarlo en revisiones automatizadas de parches.
- Investigacion sobre cuantizacion extrema: el modelo es un caso de estudio reproducible de GPTQ por experto con asignacion de bits por capa y medicion de KL/top-1 frente al profesor.
- Laboratorios con presupuesto limitado: sustituye a un despliegue multi-GPU de clase frontier por dos GPU de 24 GB y 192 GB de RAM, con routing exacto y sin poda.
- Evaluacion comparativa de motores de inferencia: al ser un GGUF propietario de dsx, sirve para medir el rendimiento de este motor frente a alternativas en el mismo hardware.

## Benchmarks y rendimiento

Calidad medida con `dsx eval` sobre el conjunto de evaluacion de Lucebox (8 x 1024 tokens retenidos, KL y top-1 frente a los top-256 log-probs del profesor FP8/FP4):

| Modelo | Expertos | KL (menor mejor) | Top-1 (mayor mejor) | Perplejidad (menor mejor) |
|---|---:|---:|---:|---:|
| Profesor FP8/FP4 | FP4 | 0 | 100% | 8,56 |
| Lucebox ROCMFP | 2,5 bpw | 0,253 | 78,7% | 9,78 |
| dsx 2-bit | 2,03 bpw | 0,373 | 74,4% | 10,68 |
| dsx 2.6-bit (este) | 2,6127 bpw | 0,1972 | 82,59% | 9,3626 |

NLL: 2,236722 sobre 8.184 tokens.

Rendimiento medido en 2 x RTX 3090, 192 GB de RAM, NVMe SSD, `--ctx 262144` y todos los expertos residentes:

| Metrica | Valor |
|---|---:|
| Decodificacion | ~29 tok/s |
| Procesamiento de prompt (prefill) | ~330 tok/s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM: el modelo completo ocupa 187,6 GB; con dos RTX 3090 (48 GB de VRAM total) el resto se reparte en RAM del sistema. La configuracion de referencia usa 192 GB de RAM.
- GPU recomendadas: 2 x RTX 3090 segun el autor; no se documentan otras configuraciones.
- Cabe en GPU de consumo: si, en dos RTX 3090 con 192 GB de RAM del sistema y NVMe SSD.
- Almacenamiento: 187,6 GB para el GGUF mas ~203 GB de shards safetensors del checkpoint oficial para Engram, tokenizer y tablas.
- Despliegue: exclusivamente mediante el motor dsx (Rust + CUDA), con API compatible con OpenAI y Anthropic y UI web. No es compatible con vLLM, llama.cpp, Ollama, TGI ni LM Studio.
- Latencia y throughput: ~29 tok/s de decodificacion y ~330 tok/s de prefill con contexto de 262.144 tokens y todos los expertos residentes. Con contexto de 1.048.576 tokens el KV cache crece y puede dejar menos expertos residentes, por lo que las cifras no son extrapolables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KL / top-1) | Licencia | Formato / motor |
|---|---|---|---|---|---|
| dsx 2.6-bit (este) | 551,9B totales | 262.144 (medido); hasta 1.048.576 en motor | 0,1972 / 82,59% | MIT | GGUF dsx + safetensors Engram / dsx |
| Lucebox ROCMFP | no disponible | no disponible | 0,253 / 78,7% | no disponible | GGUF / no disponible |
| dsx 2-bit | 551,9B totales | no disponible | 0,373 / 74,4% | MIT | GGUF dsx / dsx |
| Checkpoint oficial FP8/FP4 | 551,9B totales + 196B Engram | no disponible | referencia (KL 0, top-1 100%) | no disponible en esta ficha | safetensors / DeepSeek |

## Limitaciones y advertencias

- Formato propietario: el GGUF solo funciona con el motor dsx; no se puede cargar en llama.cpp, Ollama, LM Studio, vLLM ni TGI.
- Dependencia de Engram: las tablas Engram no estan incluidas en el GGUF y deben descargarse aparte desde el checkpoint oficial (~203 GB adicionales).
- Calidad degradada frente al profesor: KL 0,1972 y top-1 82,59% implican una perdida medible de fidelidad, especialmente en tareas sensibles a la precision numerica o al razonamiento largo.
- Cuantizacion agresiva: 2,6127 bpw medios con expertos en PTQ1_0 (ternario) pueden producir artefactos en generacion de codigo o matematicas que no aparecen en el modelo original.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad; al ser una cuantizacion de un modelo base, hereda los sesgos y alucinaciones del original.
- Idiomas: no se especifican idiomas soportados; la calibracion incluye pools multilingues pero sin detalle.
- Contexto largo: las cifras de rendimiento se midieron a 262.144 tokens; a 1.048.576 el KV cache reduce los expertos residentes y el throughput puede caer.
- Licencia MIT: permite uso comercial, pero el modelo base DeepSeek-V4.1-Flash-1017 puede tener terminos propios que conviene revisar antes de produccion.
- Soporte limitado: 4 likes y un unico autor; no hay garantias de mantenimiento ni de compatibilidad futura con dsx.

## Enlaces

- Hugging Face: https://huggingface.co/icecubetr/DeepSeek-V4.1-Flash-1017-dsx-2.6bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor dsx: https://github.com/lxe/dsx
- Conjunto de evaluacion de referencia: https://huggingface.co/Lucebox/DeepSeek-V4.1-Flash-1017-ROCMFP-GGUF
