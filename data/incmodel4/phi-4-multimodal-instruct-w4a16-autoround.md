# INCModel4/Phi-4-multimodal-instruct-W4A16-AutoRound

## Resumen

Phi-4-multimodal-instruct-W4A16-AutoRound es una version cuantizada a 4 bits del modelo multimodal Phi-4 de Microsoft, publicada por el usuario INCModel4. La cuantizacion se ha realizado con AutoRound de Intel, una tecnica de redondeo de pesos mediante descenso de gradiente con signo que ajusta los valores de cuantizacion para minimizar la perdida de precision respecto al modelo original en BF16. El resultado es un checkpoint de aproximadamente 2.780 millones de parametros (2.784.199.648 segun los safetensors) que conserva las capacidades de texto, vision y audio del modelo base.

El modelo hereda la arquitectura de Phi-4-multimodal-instruct: un decoder transformer de lenguaje combinado con un encoder de vision y un encoder de audio, con adaptadores LoRA especificos por modalidad. La cuantizacion W4A16 se aplica unicamente a las proyecciones lineales del decoder de texto, mientras que los adaptadores LoRA, los embeddings de tokens, la cabeza de salida (lm_head), los componentes de vision y audio y las capas de normalizacion se mantienen en BF16.

La relevancia de esta ficha radica en que permite desplegar un modelo multimodal con capacidades de reconocimiento de voz, comprension de imagenes y generacion de texto en hardware mas modesto que el modelo original, con una recuperacion media del 99,46 % en los benchmarks publicados por el autor. La licencia es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (texto + vision + audio) con adaptadores LoRA por modalidad |
| Parametros totales | 2.784.199.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el script de evaluacion usa max_length=131073) |
| Tipos de cuantizacion | W4A16 (int4 con group_size 128, simetrico) para proyecciones lineales del decoder de texto; resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato auto_round, requiere trust_remote_code) |

## Arquitectura y entrenamiento

El modelo base Phi-4-multimodal-instruct es un transformer decoder multimodal que integra un encoder de vision y un encoder de audio junto al decoder de lenguaje, con adaptadores LoRA entrenados para cada modalidad. Esta version cuantizada no reentrena el modelo: aplica AutoRound con 200 iteraciones de ajuste y 128 muestras de calibracion sobre las proyecciones lineales del decoder de texto, usando un esquema W4A16 con group_size 128 y cuantizacion simetrica.

La innovacion tecnica principal es el algoritmo AutoRound, que optimiza los valores de redondeo mediante descenso de gradiente con signo en lugar de usar redondeo al vecino mas cercano. Segun la model card, se excluyen de la cuantizacion las capas lora_A y lora_B, embed_tokens_extend, lm_head, los componentes de vision y audio y las capas de normalizacion, que permanecen en BF16. El proceso requiere aplicar un parche al paquete auto_round (auto-round-block-list-fallback.patch) para gestionar la lista de bloques a cuantizar. No se dispone de informacion sobre los datos de entrenamiento del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento en el decoder de lenguaje del modelo base.
- Reconocimiento automatico de voz (ASR), indicado como pipeline principal en la model card.
- Comprension de imagenes mediante el encoder de vision y los adaptadores LoRA correspondientes.
- Procesamiento multimodal combinado de texto, audio e imagen en una misma conversacion.
- Generacion de codigo y resolucion de problemas matematicos, segun los benchmarks reportados (GSM8K, MMLU).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Reconocimiento de voz en produccion: el modelo puede transcribir audio a texto usando el encoder de audio y el decoder cuantizado, con la ventaja de un menor consumo de VRAM respecto al modelo en BF16. Es adecuado para pipelines de transcripcion por lotes en servidores con GPUs de gama media.
- Asistentes multimodales: combinacion de entrada de imagen y audio en una misma sesion conversacional, util para aplicaciones de accesibilidad que describen imagenes o responden a preguntas habladas sobre contenido visual.
- Analisis de documentos con imagenes: extraccion de informacion de capturas, formularios o diagramas mediante el encoder de vision, integrado en flujos de automatizacion documental.
- Generacion de codigo asistida: el modelo mantiene un rendimiento cercano al BF16 en tareas de razonamiento (MMLU 63,48 frente a 64,76), por lo que puede usarse en asistentes de programacion donde el ahorro de memoria es prioritario.
- Razonamiento matematico en entornos con recursos limitados: GSM8K reporta 64,97 en W4A16 frente a 63,61 en BF16, lo que indica que la cuantizacion no degrada esta tarea y permite desplegar el modelo en GPUs de consumo.
- Prototipado rapido de aplicaciones multimodales: al requerir menos memoria, permite iterar en estaciones de trabajo con una sola GPU consumer antes de escalar a infraestructura mayor.
- Servicio de inferencia con vLLM: la model card documenta el despliegue con vLLM 0.33.0 y transformers 5.20.2, lo que facilita su integracion en arquitecturas de serving con API compatible con OpenAI.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor, comparando BF16 con W4A16:

| Benchmark | BF16 | W4A16 | Recuperacion |
|---|---:|---:|---:|
| PIQA | 77,58 | 77,20 | 99,51 % |
| HellaSwag | 51,73 | 50,64 | 97,88 % |
| MMLU | 64,76 | 63,48 | 98,02 % |
| GSM8K | 63,61 | 64,97 | 102,15 % |
| Media | 64,42 | 64,07 | 99,46 % |

No se han publicado en la informacion disponible resultados de benchmarks de vision, audio o de modelos comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 6,4 GB en safetensors; con overhead de KV cache y componentes en BF16, se estima un consumo en torno a 8-10 GB en BF16 para el resto de componentes, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, es plausible su ejecucion en GPUs consumer con 12-16 GB de VRAM, pero no se confirma en la model card.
- Cabe en GPU consumer: no confirmado oficialmente; el tamano del checkpoint (6,4 GB) sugiere que si en GPUs con al menos 12 GB, pero es una estimacion no verificada.
- Opciones de despliegue: vLLM 0.33.0 con transformers 5.20.2 y trust_remote_code habilitado, segun la model card. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| INCModel4/Phi-4-multimodal-instruct-W4A16-AutoRound | 2.784.199.648 | no disponible | MIT | W4A16 | Version cuantizada multimodal |
| microsoft/Phi-4-multimodal-instruct | no disponible en la informacion | no disponible | MIT | BF16 | Modelo base sin cuantizar |
| Otros modelos multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La model card advierte de que el modelo puede producir salidas factualmente incorrectas y no debe usarse como fuente de informacion veraz sin verificacion.
- Riesgo de sesgos y contenido ofensivo heredado del modelo base y de los datasets de ajuste fino; se recomienda realizar pruebas de seguridad antes de desplegar.
- La cuantizacion W4A16 puede degradar ligeramente tareas no evaluadas (vision, audio) al no haberse publicado resultados especificos para esas modalidades.
- La licencia MIT se hereda del modelo base, pero la model card indica que no constituye asesoramiento legal y recomienda consultar a un abogado antes de uso comercial.
- Requiere trust_remote_code y una version concreta de transformers y vLLM, lo que puede complicar la integracion en entornos con dependencias fijas.
- El proceso de generacion del modelo requiere aplicar un parche al paquete auto_round, lo que anade complejidad a la reproducibilidad.
- No se dispone de informacion sobre idiomas soportados, longitud de contexto oficial ni latencia en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/INCModel4/Phi-4-multimodal-instruct-W4A16-AutoRound
- Modelo base: https://huggingface.co/microsoft/Phi-4-multimodal-instruct
- Licencia del modelo base: https://huggingface.co/microsoft/Phi-4-multimodal-instruct/resolve/main/LICENSE
- Repositorio AutoRound: https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Paper AutoRound: https://arxiv.org/abs/2309.05516
