# fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_round-int8-gs64-sym

## Resumen

Esta ficha describe una version cuantizada a INT8 del modelo Falcon3-10B-Instruct, desarrollado originalmente por el Technology Innovation Institute (TII) de Abu Dabi y publicado bajo licencia Apache 2.0. La cuantizacion la firma el usuario fbaldassarri mediante la herramienta Intel AutoRound v0.16.1, aplicando una cuantizacion de solo pesos (weight-only quantization, WoQ) con 8 bits, tamano de grupo 64 y esquema simetrico. El resultado es un checkpoint en formato safetensors compatible con `transformers`, pensado para inferencia en CPU Intel, iGPU Arc mediante intel-extension-for-pytorch y NPU de las series Core Ultra via OpenVINO.

El modelo base Falcon3-10B-Instruct es un transformer causal de tipo `llama` (la model card declara `model_type: llama`) afinado para instrucciones y conversacion. El checkpoint cuantizado ocupa 13,2 GB en el repositorio y declara 3.366.128.640 parametros en sus tensores safetensors, una cifra que no coincide con la denominacion comercial "10B" del modelo original; conviene tratar ese dato con cautela porque el conteo real de parametros del Falcon3-10B-Instruct no se detalla en la informacion proporcionada.

La relevancia de esta ficha es doble: por un lado documenta un artefacto de cuantizacion concreto con su receta de replicacion completa (version de AutoRound, hiperparametros de calibracion, tiempos de ejecucion); por otro, sirve como ejemplo practico de como reducir un modelo de ~10B a INT8 para despliegue en hardware Intel sin GPU dedicada. No obstante, el checkpoint tiene cero descargas y cero likes en el momento de la consulta, y su model card incluye explicitamente `inference: false`, lo que limita su uso en produccion tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type: llama) |
| Parametros totales | 3.366.128.640 (segun safetensors; la denominacion comercial es 10B, dato no coincidente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8, group size 64, simetrica, weight-only (WoQ) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato auto_round de AutoRound) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal denso con atencion por self-attention estandar y `model_type: llama` en la configuracion. La model card no aporta detalles sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni sobre el corpus de entrenamiento del Falcon3-10B-Instruct original; esa informacion reside en la model card del modelo base, no incluida en los datos proporcionados. Tampoco se documenta si hubo RLHF, DPO o una fase de instruction tuning concreta mas alla de la denominacion "Instruct".

La innovacion tecnica de este artefacto es la cuantizacion. Se aplico Intel AutoRound v0.16.1 con el algoritmo SignRound, un metodo de cuantizacion de solo pesos que ajusta los parametros de redondeo mediante calibracion supervisada. Los hiperparametros registrados son: 128 muestras de calibracion, 200 iteraciones de tuning, longitud de secuencia 512, batch size 4, `torch_dtype` bfloat16 para la carga y calibracion en CPU. El proceso completo tardo 51.551,1 segundos (unas 859,2 minutos, aproximadamente 14,3 horas) y finalizo el 2026-11-10. El entorno de ejecucion fue transformers 4.55.3 y torch 2.15.0+cpu. La receta de replicacion se distribuye a traves del repositorio `auto-round-pipeline` alojado en git.epicdynamic.com, con modos de instalacion via wheel de PyPI o compilacion desde el tag v0.16.1 de intel/auto-round, y soporte opcional para aceleracion Intel XPU, CUDA o ROCm.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante plantilla de chat integrada (`apply_chat_template`), tal como indica la model card.
- Respuesta a instrucciones en ingles; el modelo base Falcon3-10B-Instruct esta orientado a tareas de instruccion y dialogo.
- Inferencia en CPU Intel, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel Core Ultra (via OpenVINO), segun declara el autor.
- Compatibilidad con el ecosistema `transformers` y con text-generation-inference (tag presente en el repositorio).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio, modo thinking ni multilingueismo mas alla del ingles.

## Casos de uso

- Despliegue en estaciones de trabajo sin GPU dedicada: al ser una cuantizacion INT8 optimizada para CPU Intel, permite ejecutar un modelo conversacional de ~10B en equipos con Core Ultra y memoria RAM suficiente, sin depender de CUDA.
- Prototipado de asistentes conversacionales en ingles: la plantilla de chat integrada y el formato `transformers` permiten levantar un endpoint de generacion con `AutoModelForCausalLM` en pocas lineas, adecuado para validar flujos de dialogo antes de invertir en infraestructura.
- Inferencia en el borde (edge) sobre iGPU Arc: el soporte de intel-extension-for-pytorch habilita ejecutar el modelo en portatiles con graficos integrados Intel, util para demos offline o entornos con restricciones de conectividad.
- Aceleracion en NPU de portatiles Core Ultra: mediante OpenVINO se puede descargar parte del calculo a la NPU, reduciendo el consumo energetico en asistentes de escritorio o herramientas de productividad local.
- Reproduccion de pipelines de cuantizacion: la receta detallada (AutoRound 0.16.1, 128 muestras, 200 iteraciones) sirve como referencia para equipos que quieran cuantizar otros modelos con la misma configuracion y comparar resultados.
- Evaluacion comparativa de tecnicas de cuantizacion: al fijar bits, group size y simetria, este checkpoint permite medir la degradacion de calidad frente al modelo base en tareas de generacion controladas.
- Investigacion sobre WoQ en hardware Intel: util para estudiar el rendimiento real de AutoRound SignRound en CPU, iGPU y NPU con un modelo de tamano medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (perplejidad, MMLU, HumanEval, GSM8K ni similares) ni comparaciones con el modelo base sin cuantizar, por lo que no es posible cuantificar la perdida de precision introducida por la cuantizacion INT8.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio pesa 13,2 GB, coherente con pesos INT8 de un modelo de ~10B (10 GB de pesos mas overhead de tokenizer y metadatos). Para inferencia en CPU se recomienda al menos 16 GB de RAM del sistema.
- GPU dedicadas: no se documenta soporte explicito para A100, H100 ni RTX 4090; el autor orienta el artefacto a hardware Intel (CPU, iGPU Arc, NPU). El tag `cuda` aparece solo como opcion del pipeline de cuantizacion, no como destino de inferencia declarado.
- Consumer GPU: no se confirma compatibilidad con GPUs de consumo NVIDIA o AMD en la model card; el foco declarado es Intel.
- Opciones de despliegue: `transformers` (con `device_map="auto"`), intel-extension-for-pytorch para CPU/iGPU, OpenVINO para NPU, y text-generation-inference segun el tag del repositorio. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. La model card no publica mediciones de tokens por segundo ni tiempos de primera token en ninguno de los backends soportados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_round-int8-gs64-sym | 3.366.128.640 (segun safetensors) | no disponible | INT8, gs64, simetrica, WoQ | Apache 2.0 | Hugging Face, 0 descargas |
| tiiuae/Falcon3-10B-Instruct (base) | no disponible en esta ficha | no disponible | bfloat16 (original) | Apache 2.0 | Hugging Face, modelo oficial de TII |
| Otras cuantizaciones INT8 de Falcon3-10B-Instruct | no disponible | no disponible | INT8 (distintos metodos) | Apache 2.0 | no disponible en la informacion proporcionada |

La comparativa se limita al modelo base y a variantes de cuantizacion del mismo Falcon3-10B-Instruct, porque la informacion proporcionada no incluye datos de modelos alternativos de la misma categoria (por ejemplo, Llama 3.1 8B, Qwen2.5 7B o Mistral 7B) que permitan una comparacion rigurosa de parametros, contexto y rendimiento.

## Limitaciones y advertencias

- La model card declara `inference: false`, lo que indica que el autor no garantiza el funcionamiento del artefacto para inferencia directa; conviene validarlo antes de usarlo.
- El conteo de parametros de safetensors (3.366.128.640) no coincide con la denominacion "10B" del modelo base; es un dato a verificar antes de dimensionar infraestructura.
- Solo se declara soporte de ingles (`language: en`); no hay evidencia de capacidades multilingues.
- No se publican benchmarks de calidad ni comparacion con el modelo base, por lo que se desconoce la degradacion introducida por la cuantizacion INT8 con group size 64.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala; no se documentan mitigaciones especificas.
- Sesgos conocidos: no documentados en la informacion disponible; el modelo base puede heredar sesgos de su corpus de entrenamiento, no detallado aqui.
- La licencia Apache 2.0 permite uso comercial, pero el autor incluye un disclaimer que restringe el artefacto a "propositos de investigacion" y lo entrega sin garantia; conviene revisar esa clausula antes de un despliegue productivo.
- El artefacto tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia (2026-11-15), lo que sugiere poca validacion por parte de la comunidad.
- El soporte esta orientado a hardware Intel; el rendimiento en GPUs NVIDIA o AMD no esta documentado y podria no estar optimizado.
- La receta de replicacion depende de un repositorio externo (git.epicdynamic.com) y de una version concreta de AutoRound (0.16.1); cambios de version pueden alterar el resultado.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_round-int8-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-10B-Instruct
- Intel AutoRound (repositorio oficial): https://github.com/intel/auto-round
- Pipeline de cuantizacion utilizado: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
