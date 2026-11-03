# mradermacher/ichiyanagi-qwen-14b-GGUF

## Resumen

ichiyanagi-qwen-14b-GGUF es la distribucion en formato GGUF del modelo ichiyanagi-qwen-14b, publicado por el usuario Hiroshi19781111 y cuantizado por mradermacher, un perfil conocido por generar versiones GGUF de modelos open source para su uso con llama.cpp y herramientas compatibles. El modelo base es un fine-tune de la familia Qwen2 con 14.770.033.664 parametros (aproximadamente 14,8 mil millones), orientado a generacion de texto conversacional y publicado bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que el repositorio GGUF es la via practica para ejecutar el modelo en hardware de consumo, ya que ofrece once variantes de cuantizacion desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB). El modelo base original esta etiquetado con el tag `qwen2` y fue entrenado mediante la libreria Unsloth, lo que sugiere un fine-tune sobre un checkpoint Qwen2 preentrenado.

La informacion publicada por el autor es muy limitada: no se detallan datos de entrenamiento, composicion del dataset, longitud de contexto ni resultados de benchmarks. Esta ficha refleja exclusivamente los datos verificables del repositorio y del model card, indicando de forma explicita cuando un dato no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (tag `qwen2`); detalles adicionales no disponibles |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 102,0 GB |
| Libreria declarada | transformers |
| Modelo base | Hiroshi19781111/ichiyanagi-qwen-14b |
| Fecha de creacion | 2026-04-14 |
| Ultima actualizacion | 2026-11-03 |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen2, una arquitectura transformer decoder-only con atencion causal. El tag `qwen2` y la referencia a Unsloth en el model card indican que se trata de un fine-tune realizado sobre un checkpoint Qwen2 preentrenado, probablemente mediante las optimizaciones de memoria de Unsloth (LoRA/QLoRA). No se publica informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas especificas del fine-tune.

El repositorio GGUF de mradermacher contiene exclusivamente cuantizaciones estaticas generadas con llama.cpp. El autor indica que las cuantizaciones ponderadas o con imatrix no estan disponibles en el momento de la publicacion y que podrian solicitarse mediante una discusion de la comunidad. No se documentan cambios arquitectonicos respecto al modelo base mas alla del proceso de cuantizacion.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational` del repositorio.
- Inferencia compatible con `text-generation-inference` y con el ecosistema transformers/llama.cpp.
- Ejecucion local mediante archivos GGUF en CPU y GPU, con soporte de offloading parcial.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del model card; no se declaran otros idiomas.
- Tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion publicada.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: las cuantizaciones Q4_K_S y Q4_K_M (8,7 y 9,1 GB) permiten ejecutar un modelo de 14,8 B en GPU de consumo de 12-16 GB de VRAM, suficiente para pruebas de concepto sin infraestructura cloud.
- Despliegue en entornos con GPU limitada: la variante Q2_K (5,9 GB) posibilita la inferencia en GPUs de 8 GB, a costa de una perdida de calidad que el autor no cuantifica pero que la grafica de perplejidad de ikawrakow referenciada en el model card situa como la opcion de menor fidelidad.
- Generacion de texto por lotes en CPU: al ser GGUF compatible con llama.cpp, el modelo puede ejecutarse en servidores sin GPU usando Q4_K_M o Q5_K_M, adecuado para tareas de generacion masiva donde la latencia no es critica.
- Fine-tuning posterior sobre el modelo base: aunque el repositorio GGUF no es el formato adecuado para reentrenar, el modelo base en safetensors (Apache 2.0) puede usarse con Unsloth o PEFT para adaptaciones a dominios concretos, dado que la licencia permite uso comercial.
- Integracion en pipelines de `text-generation-inference`: el tag `text-generation-inference` y `endpoints_compatible` indican compatibilidad con el endpoint estandar de HF, lo que facilita su despliegue como servicio HTTP en infraestructura propia.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes del mismo modelo, lo que permite medir el impacto de la cuantizacion en calidad y velocidad sobre una tarea concreta antes de fijar una version en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y cache KV; el contexto no esta documentado, por lo que el overhead adicional no puede calcularse):
  - Q2_K: 5,9 GB de pesos; aproximadamente 7-8 GB de VRAM con contexto moderado.
  - Q3_K_S / Q3_K_M / Q3_K_L: 6,8 / 7,4 / 8,0 GB de pesos.
  - IQ4_XS: 8,3 GB de pesos.
  - Q4_K_S / Q4_K_M: 8,7 / 9,1 GB de pesos; aproximadamente 10-11 GB de VRAM con contexto moderado.
  - Q5_K_S / Q5_K_M: 10,4 / 10,6 GB de pesos.
  - Q6_K: 12,2 GB de pesos.
  - Q8_0: 15,8 GB de pesos; aproximadamente 17-18 GB de VRAM con contexto moderado.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0 con holgura; RTX 4080/4070 Ti Super (16 GB) para Q5_K_M o Q6_K; RTX 4070/4060 Ti (12-16 GB) para Q4_K_M; GPUs de 8 GB para Q2_K o Q3_K_S. Para despliegue en servidor, A100 40/80 GB o H100 permiten servir Q8_0 con contexto largo y concurrencia.
- Cabe en GPU de consumo: si, en todas las variantes hasta Q8_0 en GPUs de 24 GB; Q4_K_M y Q4_K_S en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, `llama-cpp-python`, y servidores compatibles con GGUF. El tag `text-generation-inference` sugiere compatibilidad con TGI para el modelo base, no necesariamente para los archivos GGUF.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ichiyanagi-qwen-14b-GGUF | 14,77 B | no disponible | Apache 2.0 | GGUF | Fine-tune de Qwen2, solo ingles declarado |
| Qwen2-14B (oficial) | ~14 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF (terceros) | Modelo base de referencia de la familia |
| Mistral-Nemo-12B | ~12 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar con soporte multilingue declarado |

La comparacion cuantitativa con alternativas no es posible porque no se han publicado benchmarks del modelo. La tabla recoge unicamente datos estructurales verificables; para contexto y rendimiento de los modelos comparados debe consultarse su documentacion oficial.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada del rendimiento del modelo en tareas estandar, lo que impide validar su calidad frente al Qwen2 base.
- Idioma: el model card declara unicamente ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Contexto desconocido: al no documentarse la longitud de contexto, no puede garantizarse el comportamiento en conversaciones largas ni el uso en tareas de recuperacion con contexto extenso.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; sin evaluaciones publicadas no puede acotarse su magnitud.
- Sesgos: no se documenta la composicion del dataset de fine-tune, por lo que no es posible evaluar sesgos de genero, raza o ideologicos introducidos durante el ajuste.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M estan marcadas por el autor como de menor calidad; para produccion se recomienda Q4_K_M o superior.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el modelo base del que deriva (Qwen2) debe verificarse en su repositorio original para confirmar la compatibilidad de licencias en la cadena de derivacion.
- Madurez del proyecto: 18 descargas y 1 like en el momento de la consulta indican una adopcion muy baja; no hay senales de mantenimiento activo mas alla de la actualizacion del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ichiyanagi-qwen-14b-GGUF
- Modelo base: https://huggingface.co/Hiroshi19781111/ichiyanagi-qwen-14b
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#ichiyanagi-qwen-14b-GGUF
- Repositorio de solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
