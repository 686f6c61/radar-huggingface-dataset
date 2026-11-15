# fbaldassarri/allenai_OLMo-2-1124-13B-auto_gptq-int8-gs64-sym

## Resumen

Esta ficha describe una versión cuantizada a 8 bits del modelo base `allenai/OLMo-2-1124-13B`, publicada por el usuario `fbaldassarri`. Se trata de un artefacto de pesos cuantizados en formato AutoGPTQ (INT8, group size 64, simétrico), generado con la herramienta Intel AutoRound v0.16.1. El modelo subyacente, OLMo 2 1124 13B, es un modelo de lenguaje causal de tipo transformer desarrollado por el Allen Institute for AI (AI2) como parte de la familia OLMo 2, orientada a la investigación abierta con datos y recetas de entrenamiento publicados.

La relevancia de esta publicación concreta es acotada: no se trata de un modelo nuevo ni de un ajuste fino, sino de una compilación de pesos que permite ejecutar el modelo base en hardware Intel (CPU, iGPU Arc y NPU de la serie Core Ultra) mediante intel-extension-for-pytorch y OpenVINO. El repositorio tiene un tamaño de 17,4 GB y, en el momento de la consulta, no registra descargas ni valoraciones.

Conviene señalar una discrepancia importante en los metadatos: la model card y el nombre del repositorio indican 13B, pero el recuento real de parámetros en los archivos safetensors es de 4.449.960.960 (aproximadamente 4,45B). Esta ficha reporta ambos datos y advierte sobre la inconsistencia en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type: olmo2) |
| Parametros totales | 4.449.960.960 segun safetensors; la model card y el nombre del repo indican 13B (dato inconsistente) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8, group size 64, simetrica, weights-only quantization (WoQ) via AutoGPTQ |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantizacion GPTQ/AutoGPTQ), libreria transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer causal de la familia OLMo 2 de AI2. Esta publicacion no aporta informacion sobre el entrenamiento del modelo base: no se detallan el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se especifica la arquitectura interna mas alla del identificador `olmo2` y la naturaleza causal-LM. Cualquier dato sobre innovaciones del modelo original (atencion, decodificacion especulativa, etc.) debe consultarse en la model card de `allenai/OLMo-2-1124-13B`, que no forma parte de la informacion disponible aqui.

Lo que si documenta esta publicacion es el proceso de cuantizacion. Se aplico Intel AutoRound v0.16.1 en modalidad weights-only, con calibracion en CPU sobre 64 muestras, 200 iteraciones, longitud de secuencia 256 y batch size 2, partiendo de pesos cargados en `torch.bfloat16`. El proceso se ejecuto con transformers 4.55.3 y torch 2.15.0+cpu, y tardo 23.261,3 segundos (unas 6,5 horas). El resultado se exporto en formato AutoGPTQ con 8 bits, grupo de 64 y cuantizacion simetrica.

## Capacidades

- Generacion de texto autoregresiva en ingles (modelo base/completion, sin plantilla de instrucciones).
- Razonamiento y generacion de codigo heredados del modelo base OLMo 2, en la medida en que este los soporte (no verificado en esta publicacion).
- Inferencia optimizada en CPU Intel, iGPU Arc (via intel-extension-for-pytorch) y NPU AI Boost de Core Ultra (via OpenVINO), segun declara el autor.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles segun el campo `language` del repositorio.

## Casos de uso

- Despliegue en equipos sin GPU dedicada: al estar cuantizado a INT8 y pensado para CPU Intel, permite ejecutar un modelo de la familia OLMo 2 en estaciones de trabajo convencionales con intel-extension-for-pytorch.
- Inferencia en portatiles con Core Ultra: el autor indica compatibilidad con la NPU AI Boost via OpenVINO, lo que habilita generacion de texto en local con bajo consumo energetico.
- Prototipado de completado de texto en ingles: al ser un modelo base, encaja en tareas de continuacion de texto sin necesidad de plantilla conversacional.
- Investigacion sobre cuantizacion: sirve como artefacto de referencia para reproducir el pipeline de Intel AutoRound con los hiperparametros documentados (64 muestras, 200 iteraciones, seqlen 256).
- Evaluacion comparativa de precision INT8 frente al modelo base en bf16: util para medir la degradacion introducida por la cuantizacion WoQ en tareas de generacion.
- Experimentos academicos con modelos de pesos abiertos y licencia Apache 2.0, donde la trazabilidad de la receta de cuantizacion es relevante.
- Generacion de texto en entornos Intel Arc (iGPU) para pruebas de rendimiento de intel-extension-for-pytorch frente a alternativas como llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones de perplejidad frente al modelo base en bf16.

## Requisitos de hardware

- VRAM/almacenamiento: el repositorio ocupa 17,4 GB; el peso en INT8 con group size 64 implica una huella cercana a ese tamano en disco y en memoria al cargar los pesos.
- GPU recomendadas: no se documentan; el autor orienta el artefacto a CPU Intel, iGPU Arc y NPU Core Ultra, no a GPU NVIDIA o AMD.
- Cabe en GPU consumer: no confirmado. El formato AutoGPTQ es compatible con transformers, pero el autor no valida su uso en GPUs consumer y el foco declarado es hardware Intel.
- Opciones de despliegue: transformers con AutoGPTQ; intel-extension-for-pytorch para CPU e iGPU Arc; OpenVINO para NPU AI Boost. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se documenta el tiempo de cuantizacion (23.261,3 s en CPU), no el de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/allenai_OLMo-2-1124-13B-auto_gptq-int8-gs64-sym | 4,45B segun safetensors (13B declarado) | no disponible | INT8 GPTQ, gs64, simetrica | Apache 2.0 | Hugging Face, 0 descargas |
| allenai/OLMo-2-1124-13B (base) | 13B (declarado) | no disponible en esta ficha | bf16 original | Apache 2.0 | Hugging Face (modelo de referencia) |
| Otras cuantizaciones del mismo base (GGUF, AWQ) | 13B (declarado) | no disponible | GGUF/AWQ segun variante | Apache 2.0 | no verificado en la informacion disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Inconsistencia de parametros: el nombre del repositorio y la model card indican 13B, pero safetensors reporta 4.449.960.960 parametros. Debe verificarse antes de usar el modelo en produccion.
- Modelo base, no instruct: no sigue instrucciones ni mantiene formato conversacional; requiere prompts de completado.
- Solo ingles: el campo `language` declara unicamente `en`.
- Orientado a hardware Intel: el autor lo valida para CPU, iGPU Arc y NPU Core Ultra; el rendimiento en otras plataformas no esta documentado.
- Riesgo de alucinacion y sesgos: inherentes al modelo base; no se documentan evaluaciones de sesgo ni de seguridad.
- Sin benchmarks: no hay evidencia publicada de la degradacion de calidad respecto al modelo en bf16.
- Licencia Apache 2.0: permite uso comercial, pero el autor declara que el artefacto se desarrollo solo con fines de investigacion y sin garantia.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.
- La receta de replicacion remite a un repositorio en `git.epicdynamic.com`, un dominio no estandar que conviene verificar antes de ejecutar los scripts.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/allenai_OLMo-2-1124-13B-auto_gptq-int8-gs64-sym
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-13B
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Pipeline de replicacion citado por el autor: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
