# arthrod/c3750-mdeberta_base-vanilla-1-2

## Resumen

c3750-mdeberta_base-vanilla-1-2 es un modelo de reconocimiento de entidades nombradas (NER) y deteccion de informacion personal identificable (PII) construido con la libreria GLiNER sobre el encoder microsoft/mdeberta-v3-base. Lo publica el usuario arthrod en HuggingFace y se distribuye con licencia MIT. Esta pensado para extraccion de entidades a nivel de span (span-level), en modo "vanilla" (span_mode: markerV0), orientado principalmente a texto en portugues (pt-BR) con soporte declarado tambien para ingles.

Se trata de un experimento legacy de agosto de 2025 que el propio autor ha marcado como superseded (sustituido). El entrenamiento se detuvo en el paso 3.750 de los 15.000 previstos, y la unica metrica registrada es la eval loss, que empeoro drasticamente tras el fine-tuning: 4.409 en el paso 0 frente a rangos de 19,6k-21,8k en los checkpoints guardados. Nunca se calculo ninguna metrica de tarea (F1). Ademas, los pesos de la raiz del repositorio son una copia del checkpoint-1250, no del checkpoint-3750 que da nombre al modelo.

Su relevancia actual es fundamentalmente documental: el repositorio se conserva por contar con un DOI (10.57967/hf/8513) y sirve como registro de experimento. El autor recomienda explicitamente no usarlo y recurrir a sus modelos actuales de deteccion de PII en pt-BR. Cuenta con 11 descargas y 0 likes, y el repositorio ocupa 53,2 GB por acumular 15 checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER span-level (span_mode: markerV0, "vanilla") sobre backbone transformer microsoft/mdeberta-v3-base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en pytorch_model.bin y una exportacion ONNX; no hay variantes GGUF ni cuantizadas) |
| Idiomas soportados | pt, en |
| Licencia | MIT |
| Formato de pesos | pytorch_model.bin (formato PyTorch clasico, no safetensors) y ONNX (opset 19, 1,16 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GLiNER: un enfoque de NER zero-shot y few-shot que permite pasar etiquetas arbitrarias en tiempo de inferencia como texto (por ejemplo, "cpf document number" o "location city") en lugar de depender de un conjunto fijo de clases. La variante usada aqui es span-level con span_mode markerV0, el modo clasico que el autor etiqueta como "vanilla". El backbone es microsoft/mdeberta-v3-base, un transformer encoder de la familia DeBERTa-v3, y el config fue generado por transformers 4.55.0.

El entrenamiento partio de un plan de 15.000 pasos, con guardado de checkpoints cada 250 pasos, hasta un total de 15 checkpoints. La ejecucion se detuvo en el paso 3.750 (de ahi el prefijo "c3750" del nombre). La unica metrica registrada es la eval loss, que paso de 4.409 en el paso 0 a valores de 19,6k-21,8k en todos los checkpoints posteriores al inicio del fine-tuning, es decir, un empeoramiento severo. No se documento la composicion del dataset, el numero de tokens de entrenamiento, ni si hubo RLHF, DPO u otra fase de alineamiento. El significado de los tokens "1-2" del nombre no esta registrado en el repositorio. Existe una exportacion a ONNX (opset 19) anadida el 2026-03-19, presumiblemente derivada del mismo checkpoint raiz.

## Capacidades

- Extraccion de entidades nombradas (NER) a nivel de span mediante etiquetas definidas por el usuario en tiempo de inferencia.
- Deteccion de informacion personal identificable (PII), presumiblemente orientada a documentos en portugues de Brasil (CPF, nombres, direcciones, etc.), aunque no se aportan metricas que lo confirmen.
- Clasificacion de tokens (pipeline_tag: token-classification).
- Soporte de etiquetas multilingues declaradas para portugues e ingles.
- Exportacion a ONNX para inferencia fuera del ecosistema PyTorch.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking).

## Casos de uso

- Registro historico de experimentos: el repositorio se conserva unicamente como evidencia reproducible de un intento de entrenamiento, vinculado al DOI 10.57967/hf/8513, y no como artefacto de produccion.
- Analisis forense de curvas de entrenamiento: sirve para estudiar como una eval loss puede divergir (de 4.409 a ~20k) al fine-tunear un GLiNER span-level, util como caso de estudio negativo.
- Auditoria de pipelines de anonimizacion: dado que no tiene F1 medido, su uso razonable es comprobar el comportamiento del pipeline de evaluacion del autor, no la deteccion real de PII.
- Reproduccion academica: al disponer de 15 checkpoints y del script de carga, permite reproducir el punto exacto en el que el entrenamiento se degrada.
- Pruebas de integracion con GLiNER: sirve para validar flujos de carga sin argumento subfolder (GLiNER 0.2.25 no lo admite) y el uso de snapshot_download selectivo.
- Validacion de exportaciones ONNX: el archivo onnx/model.onnx (opset 19) puede utilizarse para probar runtimes ONNX sin depender de PyTorch.
- No se recomienda su uso para atencion al cliente, generacion de codigo, agentes ni ninguna tarea de produccion, dado que no hay metrica de tarea y la eval loss indica un modelo degradado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica registrada en la model card es la eval loss, que se reproduce a continuacion por su valor diagnostico:

| Checkpoint | Eval loss |
|---|---|
| Paso 0 (pre-fine-tuning) | 4.409 |
| Checkpoints posteriores (rango reportado) | 19,6k - 21,8k |

No existe ningun valor de F1 ni de ninguna otra metrica de tarea para ningun checkpoint. Los pesos de la raiz corresponden al checkpoint-1250, mientras que el checkpoint con menor eval loss post-entrenamiento es el 2750, segun indica la propia model card.

## Requisitos de hardware

- VRAM estimada: no disponible. El backbone mdeberta-v3-base es un encoder de tamano base, pero no se declara el numero total de parametros ni la memoria necesaria.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; en principio un encoder de tamano base puede caber en GPUs de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: la libreria declarada es GLiNER (version de referencia 0.2.25), con soporte de pesos PyTorch (pytorch_model.bin) y ONNX (opset 19). No se menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota practica de despliegue: la descarga del snapshot completo supone unos 55 GB debido a los 15 checkpoints. El autor recomienda usar snapshot_download con patrones selectivos (allow_patterns) para bajar solo gliner_config.json, pytorch_model.bin y los ficheros del tokenizer.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| arthrod/c3750-mdeberta_base-vanilla-1-2 | GLiNER span-level (markerV0) | mDeBERTa-v3-base | pt, en | MIT | Legacy, superseded, sin F1 |
| arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1 | GLiNER PII pt-BR | mmBERT-small | pt-BR | no disponible en la informacion aportada | Recomendado por el autor |
| arthrod/gliner-opf-ptbr-pii-v1 | GLiNER PII pt-BR (fine-tune OpenAI Privacy Filter) | no disponible | pt-BR | no disponible en la informacion aportada | Suite actual |
| arthrod/v1-deberta_large-token_level-1-7 | GLiNER token-level | DeBERTa-v3-large | pt-BR | no disponible en la informacion aportada | Legacy con metricas de eval |
| arthrod/v1-deberta_small-token_level-0-6 | GLiNER token-level | DeBERTa-v3-small | pt-BR | no disponible en la informacion aportada | Legacy, entrenamiento fallido (loss a 0) |

## Limitaciones y advertencias

- Modelo marcado como superseded por su propio autor: se desaconseja su uso y se remite a arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1 o arthrod/gliner-opf-ptbr-pii-v1.
- Sin metrica de tarea: nunca se calculo F1 ni ninguna otra metrica de evaluacion para ningun checkpoint.
- Eval loss degradada: el valor sube de 4.409 a 19,6k-21,8k tras iniciar el fine-tuning, lo que indica un modelo mal ajustado.
- Entrenamiento incompleto: se detuvo en el paso 3.750 de los 15.000 planificados.
- Pesos inconsistentes con el nombre: el peso de la raiz es una copia del checkpoint-1250, no del checkpoint-3750.
- Nombre no documentado: el significado de la porcion "1-2" del identificador no aparece registrado en el repositorio.
- Riesgo de alucinacion de spans: al no existir metricas, no puede acotarse la tasa de falsos positivos ni de falsos negativos en deteccion de PII.
- Idiomas limitados a pt y en: no se declara soporte para otros idiomas, incluido el espanol.
- Sesgos: no se documenta la composicion del dataset de entrenamiento, por lo que no puede evaluarse el sesgo demografico ni geografico.
- Licencia MIT: permite uso comercial y modificacion, pero al tratarse de un modelo degradado y sin validar, su uso en produccion para tratar datos personales es desaconsejable.
- Coste de descarga elevado: el snapshot completo ronda los 55 GB por acumular 15 checkpoints.
- Compatibilidad de libreria: GLiNER 0.2.25 no admite el argumento subfolder, lo que obliga a descargar a una ruta local y cargar desde ahi.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arthrod/c3750-mdeberta_base-vanilla-1-2
- DOI: https://doi.org/10.57967/hf/8513
- Modelo base: https://huggingface.co/microsoft/mdeberta-v3-base
- Modelo recomendado (pt-BR PII, mmBERT-small): https://huggingface.co/arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1
- Fine-tune OpenAI Privacy Filter (pt-BR PII): https://huggingface.co/arthrod/gliner-opf-ptbr-pii-v1
- GLiNER Ettin-68M pt-BR PII: https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-full-3x-v1
- GLiNER Ettin-68M pt-BR PII (top50k): https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-top50k-v1
- GLiNER Ettin-32M pt-BR PII: https://huggingface.co/arthrod/gliner-ettin-32m-ptbr-pii-full-3x-v1
- Dataset de benchmark de la suite actual: https://huggingface.co/datasets/arthrod/gliner-opf-ptbr-pii-bench-v1
- Dataset de revision comparativa GLiNER: https://huggingface.co/datasets/arthrod/gliner_review_comparison
- Demo interactiva de la suite actual: https://huggingface.co/spaces/arthrod/gliner-opf-ptbr-pii-demo
- Dataset de barrido de evaluacion (feb-2026): https://huggingface.co/datasets/arthrod/gliner_eval_folder
- Registro de experimento relacionado: https://huggingface.co/arthrod/attempt_vanilla
- Legacy token-level DeBERTa-base (feb-2026): https://huggingface.co/arthrod/c5k-deberta_base-token_level-1-2
- Legacy Ettin-68M token-level (feb-2026): https://huggingface.co/arthrod/v0-ettin68m-token_level-0-3
- Legacy DeBERTa-large token-level (feb-2026): https://huggingface.co/arthrod/v1-deberta_large-token_level-1-7
- Legacy DeBERTa-small token-level (feb-2026): https://huggingface.co/arthrod/v1-deberta_small-token_level-0-6
