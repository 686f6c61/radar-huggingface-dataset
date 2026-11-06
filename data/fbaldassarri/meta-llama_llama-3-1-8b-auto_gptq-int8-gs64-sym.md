# fbaldassarri/meta-llama_Llama-3.1-8B-auto_gptq-int8-gs64-sym

## Resumen

Esta ficha describe una version cuantizada a INT8 del modelo Llama 3.1 8B de Meta, publicada por el usuario fbaldassarri en Hugging Face. Se trata de un artefacto derivado que aplica cuantizacion de solo pesos (weights-only quantization, WoQ) mediante el algoritmo GPTQ implementado en Intel AutoRound v0.16.0, con 8 bits, tamano de grupo 64 y cuantizacion simetrica. El objetivo es reducir la huella de memoria del modelo original para facilitar su inferencia en hardware Intel (CPU, iGPU Arc y NPU de la serie Core Ultra) a traves de intel-extension-for-pytorch y OpenVINO.

El modelo base, Llama 3.1 8B, es un transformer causal denso de aproximadamente 8.000 millones de parametros con una ventana de contexto de 128.000 tokens y soporte para ocho idiomas. Esta version cuantizada conserva la arquitectura y el tokenizador del original, pero almacena los pesos en INT8, lo que reduce el espacio en disco y la memoria necesaria en inferencia a costa de una posible perdida de precision que el autor no cuantifica en la model card.

La relevancia de esta publicacion es acotada: no introduce mejoras tecnicas sobre el modelo base ni publica evaluaciones de degradacion por cuantizacion. Su interes practico radica en que ofrece una receta reproducible de cuantizacion INT8 con AutoRound y un artefacto listo para desplegar en entornos Intel sin GPU dedicada. El repositorio tiene un tamano de 11,5 GB y, en el momento de la consulta, contaba con 18 descargas y 0 likes, lo que sugiere una adopcion muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (familia Llama 3.1) |
| Parametros totales | 2.933.329.920 segun safetensors del repo cuantizado; el modelo base Llama 3.1 8B tiene aproximadamente 8.000 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para esta version cuantizada; el modelo base Llama 3.1 8B soporta 128.000 tokens |
| Tipos de cuantizacion | INT8, GPTQ (AutoGPTQ), group size 64, simetrica, weights-only |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (configuracion GPTQ), compatible con transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado por Meta con un corpus multilingue de gran escala y posteriormente alineado mediante tecnicas de post-entrenamiento (SFT y RLHF/DPO), aunque la model card de esta version cuantizada no detalla la composicion del dataset ni el numero de tokens de entrenamiento.

La contribucion de este artefacto es exclusivamente la cuantizacion. Se aplico Intel AutoRound v0.16.0 con el algoritmo GPTQ en modo weights-only, usando 128 muestras de calibracion, 200 iteraciones de ajuste, longitud de secuencia 512 y batch size 4, todo sobre CPU con torch.bfloat16 como tipo de carga. El proceso de cuantizacion duro 41.787,2 segundos (unas 696,5 minutos) y finalizo el 28 de octubre de 2026. No se documenta ninguna innovacion arquitectonica adicional, decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto autoregresiva en modo base/completion: el modelo no esta ajustado para seguir instrucciones en este repositorio, sino para continuar texto a partir de un prompt.
- Razonamiento y conocimiento general heredados del modelo base Llama 3.1 8B.
- Generacion de codigo y matematicas basicas, limitadas por el tamano del modelo base.
- Capacidades multilingues en ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- No se documenta soporte de tool calling ni function calling en esta model card.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de vision, audio ni modo de pensamiento (thinking mode).
- Inferencia orientada a hardware Intel: CPU, iGPU Arc (via intel-extension-for-pytorch) y NPU Core Ultra (via OpenVINO).

## Casos de uso

- Despliegue en equipos sin GPU dedicada: gracias a la cuantizacion INT8 y al soporte de intel-extension-for-pytorch, el modelo puede ejecutarse en CPU Intel para tareas de generacion de texto en local, con una huella de memoria inferior a la del modelo en bfloat16.
- Inferencia en portatiles con iGPU Intel Arc: la model card indica compatibilidad con iGPU Arc (por ejemplo, Core Ultra 185H), lo que permite prototipado de aplicaciones de texto en equipos consumer sin tarjeta grafica NVIDIA.
- Aceleracion en NPU de la serie Core Ultra: mediante OpenVINO, el modelo puede aprovechar la NPU integrada para inferencia de baja potencia en aplicaciones de escritorio.
- Generacion de texto base para pipelines de completado: al ser un modelo de completion, encaja en tareas de autocompletado, generacion de borradores o continuacion de texto donde no se requiere seguir instrucciones.
- Investigacion sobre cuantizacion: el repositorio incluye una receta reproducible completa (version de AutoRound, hiperparametros, condiciones de ejecucion), lo que lo hace util para estudiar la degradacion de precision INT8 en Llama 3.1 8B.
- Procesamiento multilingue ligero: con soporte para ocho idiomas, puede emplearse en tareas de traduccion o generacion en espanol, frances, aleman, italiano, portugues, hindi y tailandes en entornos con recursos limitados.
- Educacion y experimentacion: su tamano reducido y su licencia permiten usarlo en entornos academicos para demostrar flujos de cuantizacion e inferencia en hardware Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de perplejidad, MMLU, HumanEval, GSM8K ni metricas de degradacion respecto al modelo base en bfloat16.

## Requisitos de hardware

- VRAM estimada: al tratarse de una cuantizacion INT8 de un modelo de aproximadamente 8.000 millones de parametros, la huella teorica de pesos ronda los 8 GB; el repositorio ocupa 11,5 GB en disco. No se proporcionan mediciones reales de VRAM en la informacion disponible.
- GPU recomendadas: la model card no lista GPU NVIDIA o AMD especificas; el foco esta en CPU Intel, iGPU Arc y NPU Core Ultra. El autor menciona opciones opt-in para CUDA y ROCm en el pipeline de cuantizacion, pero no se documenta rendimiento en esas plataformas.
- Compatibilidad con GPU consumer: no confirmada en la informacion proporcionada; el enfasis del autor es el hardware Intel integrado.
- Opciones de despliegue: transformers con AutoGPTQ, intel-extension-for-pytorch (CPU e iGPU Arc), OpenVINO (NPU Core Ultra) y text-generation-inference segun los tags del repositorio. No se menciona soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles. El unico dato temporal es la duracion de la cuantizacion (41.787,2 segundos en CPU), que no es una medida de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/meta-llama_Llama-3.1-8B-auto_gptq-int8-gs64-sym | ~8.000 M (base); 2.933 M reportados en safetensors | No disponible (base: 128.000) | INT8 GPTQ, gs64, simetrica | Llama 3.1 Community License | Hugging Face, 18 descargas |
| meta-llama/Llama-3.1-8B (original) | ~8.000 M | 128.000 | bfloat16 | Llama 3.1 Community License | Hugging Face, ampliamente adoptado |
| Otras cuantizaciones INT8/INT4 de Llama 3.1 8B (GPTQ, AWQ, GGUF) | ~8.000 M | 128.000 | INT8, INT4, varios formatos | Llama 3.1 Community License | Multiples repositorios en Hugging Face |

No se dispone de datos de rendimiento comparativo entre esta version y las alternativas, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo base/completion: no esta ajustado para seguir instrucciones; usarlo como asistente conversacional requerira prompts de completado o un ajuste adicional.
- Degradacion por cuantizacion: la cuantizacion INT8 con GPTQ puede introducir perdida de precision respecto al modelo en bfloat16; el autor no publica mediciones de esta degradacion.
- Sesgos: hereda los sesgos del modelo base Llama 3.1 8B, que no se documentan en esta model card.
- Alucinacion: riesgo inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas para esta version cuantizada.
- Idiomas: aunque se listan ocho idiomas, el rendimiento fuera del ingles no esta evaluado en esta version.
- Licencia: sujeta a la Llama 3.1 Community License, que impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar sus terminos antes de un despliegue en produccion.
- Advertencia del autor: el modelo se distribuye sin garantia y se declara desarrollado solo con fines de investigacion.
- Adopcion limitada: 18 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Inconsistencia en el recuento de parametros: el dato de safetensors (2.933.329.920) no coincide con el tamano esperado de Llama 3.1 8B, lo que conviene verificar antes de confiar en el artefacto para produccion.
- Despliegue: el soporte esta centrado en hardware Intel; no se documenta compatibilidad con llama.cpp, Ollama o vLLM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.1-8B-auto_gptq-int8-gs64-sym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de cuantizacion auto-round-pipeline: https://git.epicdynamic.com/auto-round-pipeline
