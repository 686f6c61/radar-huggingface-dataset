# fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-SFT-auto_gptq-int8-gs128-sym

## Resumen

Esta ficha describe una versión cuantizada a INT8 del modelo allenai/Llama-3.1-Tulu-3-8B-SFT, publicada por el usuario fbaldassarri. No se trata de un modelo nuevo, sino de un artefacto de cuantización de pesos (weights-only quantization, WoQ) generado con Intel AutoRound v0.16.0 sobre el checkpoint SFT de la familia Tulu 3 de AI2, que a su vez se construye sobre la arquitectura Llama 3.1 de Meta. El resultado es un checkpoint de 8 bits con grupo de 128 y cuantización simétrica, pensado para inferencia eficiente en CPU, iGPU Intel Arc y NPU Intel (Core Ultra) mediante intel-extension-for-pytorch y OpenVINO.

El interés de esta publicación es fundamentalmente práctico: ofrece una ruta de despliegue de un modelo de instrucciones de 8B en hardware Intel sin GPU dedicada, con un recetario de replicación reproducible (auto-round-pipeline) y parámetros de calibración documentados. El modelo base Tulu 3 SFT está afinado para seguir instrucciones y mantener conversaciones multi-turno, y su licencia Apache 2.0 facilita el uso comercial.

Conviene subrayar que la información disponible es la de la model card del cuantizador y los metadatos de Hugging Face. No se han publicado en esta información resultados de benchmarks del checkpoint cuantizado, ni detalles del dataset de entrenamiento del modelo base, ni la longitud de contexto verificada tras la cuantización. La cifra de parámetros reportada en safetensors (2.865.238.016) no coincide con los aproximadamente 8.000 millones que sugiere el nombre del modelo, por lo que debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Llama 3.1), cuantizado con GPTQ/AutoRound |
| Parametros totales | 2.865.238.016 segun safetensors (el nombre del modelo indica 8B; discrepancia no aclarada en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 declara 128K, no verificado tras la cuantizacion) |
| Tipos de cuantizacion | INT8, group size 128, simetrica, WoQ con algoritmo GPTQ (AutoGPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (configuracion auto_gptq), compatible con transformers |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion de pesos de allenai/Llama-3.1-Tulu-3-8B-SFT. La arquitectura subyacente es la de Llama 3.1: un transformer causal decoder-only con atención por grupos (GQA) y RoPE, del que no se detallan en la informacion disponible el número de capas, dimensiones ocultas ni cabezas de atención. El proceso de cuantizacion se realizo con Intel AutoRound 0.16.0 en formato auto_gptq, con 8 bits, grupo de 128 y simetria activada, usando torch.bfloat16 como tipo de carga y calibracion en CPU.

Los detalles del entrenamiento del modelo base (número de tokens, composicion del dataset, uso de RLHF o DPO) no estan incluidos en la informacion proporcionada. La model card solo documenta el proceso de cuantizacion: 128 muestras de calibracion, 200 iteraciones de ajuste, longitud de secuencia de calibracion de 512 y batch size de 4, con una duracion registrada de 51.656,7 segundos (unas 860,9 minutos) y finalizacion el 2026-10-25. El pipeline de replicacion se distribuye como auto-round-pipeline, con modos de instalacion para CPU, Intel XPU, CUDA y ROCm.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas del ajuste SFT del modelo Tulu 3.
- Uso mediante plantilla de chat integrada (apply_chat_template); la model card advierte explicitamente de que es un modelo instruct/chat y no debe usarse con prompts de texto en bruto.
- Inferencia en CPU Intel, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel AI Boost en Core Ultra (via OpenVINO).
- Compatibilidad con la libreria transformers y con text-generation-inference segun los tags del repositorio.
- Capacidades de razonamiento, codigo, matematicas, tool calling o agentes: no documentadas en la informacion disponible para este checkpoint cuantizado.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.

## Casos de uso

- Despliegue en portatiles y equipos de sobremesa con CPU Intel sin GPU dedicada: el checkpoint INT8 con group size 128 reduce el peso en memoria respecto al modelo en bfloat16 y permite ejecutar un modelo de 8B en hardware de consumo mediante intel-extension-for-pytorch.
- Inferencia en Intel Core Ultra con NPU: la model card indica soporte via OpenVINO, lo que habilita asistentes locales de bajo consumo energetico en equipos con AI Boost.
- Aceleracion en iGPU Intel Arc: util para estaciones de trabajo sin GPU NVIDIA, donde el modelo puede servirse con el stack XPU de Intel.
- Asistente conversacional local y privado: al ejecutarse en el propio equipo, permite mantener conversaciones multi-turno sin enviar datos a servicios externos, siempre que se respete la ventana de contexto real del despliegue.
- Prototipado e investigacion en cuantizacion: el recetario de replicacion con auto-round-pipeline permite reproducir exactamente la cuantizacion y comparar configuraciones (bits, group size, simetria) sobre el mismo modelo base.
- Evaluacion de la degradacion por cuantizacion: sirve como referencia para medir la perdida de calidad de un checkpoint SFT de 8B al pasar a INT8 en tareas de instrucciones, comparando contra el modelo original allenai/Llama-3.1-Tulu-3-8B-SFT.
- Integracion en pipelines de generacion de texto con transformers: la carga con AutoModelForCausalLM y device_map="auto" facilita su inclusion en scripts y servicios existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base sin cuantizar, por lo que no es posible cuantificar la degradacion introducida por la cuantizacion INT8.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 11,4 GB, coherente con pesos INT8 de un modelo de 8B mas metadatos; se recomienda al menos 12-16 GB de memoria disponible para cargar el modelo y el contexto de inferencia.
- GPU dedicadas: no se documenta soporte especifico para A100, H100 o RTX 4090 en la model card; el foco declarado es hardware Intel (CPU, iGPU Arc, NPU).
- Hardware Intel: CPU con intel-extension-for-pytorch, iGPU Intel Arc (por ejemplo Core Ultra 185H segun el ejemplo de instalacion con --intel-xpu) y NPU AI Boost en Core Ultra via OpenVINO.
- Opciones de despliegue: transformers (device_map="auto"), text-generation-inference segun tags, intel-extension-for-pytorch y OpenVINO. No se mencionan vLLM, llama.cpp ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-SFT-auto_gptq-int8-gs128-sym | 8B (segun nombre; safetensors reporta 2.865.238.016) | no disponible | INT8 GPTQ, gs128, simetrica | apache-2.0 | Optimizado para CPU/iGPU/NPU Intel |
| allenai/Llama-3.1-Tulu-3-8B-SFT | 8B | no disponible en esta informacion | bfloat16 (original) | apache-2.0 | Modelo base sin cuantizar; referencia de calidad |
| Llama 3.1 8B Instruct (Meta) | 8B | 128K (declarado por Meta) | multiples | Llama 3.1 Community License | Alternativa generalista; licencia distinta a Apache 2.0 |

La comparacion con otras cuantizaciones INT8 del mismo modelo base (por ejemplo, variantes GGUF o AWQ) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La model card declara el modelo como desarrollado solo para fines de investigacion y sin garantia alguna.
- Solo soporta ingles segun el campo language; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para este checkpoint cuantizado.
- La cuantizacion INT8 puede introducir degradacion respecto al modelo base; no hay benchmarks que la cuantifiquen.
- La discrepancia entre el nombre (8B) y los parametros reportados en safetensors (2.865.238.016) no se explica en la informacion disponible y conviene verificarla antes de desplegar.
- La longitud de contexto efectiva tras la cuantizacion no esta verificada; no asumir los 128K del modelo base sin pruebas.
- Aunque la licencia es Apache 2.0, deben respetarse las condiciones del modelo base y de Llama 3.1 si el uso implica redistribucion.
- El soporte esta orientado a hardware Intel; en GPU NVIDIA el rendimiento de esta variante auto_gptq no esta documentado.
- El repositorio tiene muy pocas descargas (14) y ningun like en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-SFT-auto_gptq-int8-gs128-sym
- Modelo base: https://huggingface.co/allenai/Llama-3.1-Tulu-3-8B-SFT
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- auto-round-pipeline (recetario de replicacion): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
