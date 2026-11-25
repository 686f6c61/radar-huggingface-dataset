# axteam/gemma-4-31B-AWQ-8bit

## Resumen

`axteam/gemma-4-31B-AWQ-8bit` es una cuantizacion de 8 bits del modelo base `google/gemma-4-31B`, publicada por el usuario axteam. Se trata de una cuantizacion post-entrenamiento (PTQ) mediante AWQ en precision INT8 con activaciones en BF16 (esquema W8A16), empaquetada en el formato `pack-quantized` de la libreria compressed-tensors y pensada especificamente para servir el modelo con vLLM. El objetivo es reducir el coste de memoria e inferencia del modelo original manteniendo practicamente intacta su calidad.

El modelo base es un transformer denso de la familia Gemma 4 de Google, con capacidades multimodales (pipeline `image-text-to-text`). El repositorio de safetensors declara 10.223.251.812 parametros, aunque el nombre comercial del modelo base es "31B"; esta discrepancia no queda aclarada en la informacion disponible. El checkpoint cuantizado ocupa aproximadamente 35,1 GB en disco.

Su relevancia practica es doble: por un lado, permite desplegar un modelo de gran tamano en una unica GPU de 80 GB con margen para cache KV, y por otro, los benchmarks medidos por el autor muestran una recuperacion media del 99,9 % respecto al BF16 original en un conjunto de seis tareas. Es, por tanto, una opcion atractiva para produccion cuando se necesita fidelidad alta y no se dispone de la VRAM para el modelo completo en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (segun model card) |
| Parametros totales | 10.223.251.812 (safetensors); el modelo base se denomina "31B" |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT8 W8A16 (pesos INT8 simetricos, grupo de tamano 32, activaciones BF16); torre de vision, proyeccion de vision, embeddings y normas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors con compressed-tensors `pack-quantized`; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4 con capacidad multimodal de entrada (texto e imagen). El checkpoint aqui descrito no se ha reentrenado: es una cuantizacion post-entrenamiento (PTQ) del modelo BF16 original de Google (commit `5bbc2fb`). La tecnica empleada es AWQ (activation-aware weight quantization), que usa un conjunto de calibracion de 256 muestras (predominantemente en coreano, con 32 respuestas generadas por el propio modelo en modo "thinking" para la variante -it) para identificar los canales de pesos que multiplican activaciones de mayor magnitud y protegerlos mediante escalado por canal antes del redondeo. El proceso no usa gradientes y se completa en segundos o minutos.

La cuantizacion solo afecta a los pesos lineales: la torre de vision, la proyeccion de vision, los embeddings de tokens (atados con `lm_head`) y todas las normas se mantienen en BF16, lo que supone aproximadamente el 6 % de los parametros del build. El tokenizer, `processor_config` y `generation_config` son identicos byte a byte al original. El autor compara explicitamente esta aproximacion PTQ con QAT (fine-tuning con cuantizacion simulada) y con RTN (redondeo directo), situando la fidelidad en el orden QAT >= AWQ > RTN y el coste en QAT >> AWQ > RTN.

## Capacidades

- Generacion de texto y finalizacion de texto: es un modelo base (pre-entrenado) sin plantilla de chat; debe usarse con prompts de completado, no como asistente conversacional.
- Razonamiento y conocimiento general: los benchmarks medidos (MMLU, ARC-Challenge, Winogrande) indican competencia en tareas de conocimiento y razonamiento de opcion multiple.
- Matematicas: GSM8K con evaluacion estricta en modo 5-shot confirma capacidad de resolucion de problemas aritmeticos de varios pasos.
- Capacidades multilingues: se han medido KMMLU (coreano) y HAE-RAE (coreano), con recuperacion practicamente identica al BF16; el resto de idiomas no esta documentado.
- Entrada multimodal de imagen: el pipeline declarado es `image-text-to-text`; el autor advierte que la entrada de imagen no se probo en este build (los benchmarks se ejecutaron con imagen deshabilitada).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking": el autor menciona respuestas en modo thinking en el conjunto de calibracion de la variante -it, pero este repositorio es un modelo base sin plantilla de chat; no se documenta un modo thinking activable.

## Casos de uso

- Servicio de completado de texto a gran escala con vLLM: el checkpoint esta disenado y probado para vLLM (version 0.32.0), con pesos INT8 que reducen la huella de memoria frente al BF16 y permiten mayor concurrencia en una sola GPU de 80 GB.
- Evaluacion comparativa de cuantizaciones: util como referencia INT8 en estudios de degradacion por cuantizacion, ya que el autor publica resultados medidos frente a BF16, FP8, NVFP4 y AWQ-4bit con el mismo arnes (lm-evaluation-harness).
- Tareas de conocimiento y razonamiento en produccion: con una recuperacion media del 99,9 % en MMLU, GSM8K, ARC-Challenge, Winogrande, KMMLU y HAE-RAE, es adecuado para clasificacion, respuesta a preguntas y generacion de contenido donde no se requiera conversacion multi-turno.
- Procesamiento de texto en coreano: los benchmarks KMMLU y HAE-RAE muestran que la cuantizacion preserva el rendimiento en coreano, lo que lo hace viable para pipelines de NLP en ese idioma.
- Fine-tuning posterior o destilacion: al mantener tokenizer y configuracion originales y una licencia Apache-2.0, puede servir como punto de partida para adaptaciones, aunque la cuantizacion complica el entrenamiento directo sobre estos pesos.
- Base para despliegues con restricciones de VRAM: en escenarios donde el BF16 no cabe con cache KV suficiente, la version INT8 (35,1 GB de pesos) libera decenas de GB para contexto y peticiones concurrentes.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, decodificacion greedy y prompts de completado sin plantilla de chat. MMLU es la variante generativa (`mmlu_generative`), no directamente comparable con evaluaciones por log-verosimilitud.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit (este repo) | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 84,59 | 84,71 (100,1 %) | 84,52 (99,9 %) | 83,70 (98,9 %) | 83,09 (98,2 %) | 84,02 (99,3 %) |
| GSM8K (5-shot, estricto) | 84,46 | 83,09 (98,4 %) | 84,23 (99,7 %) | 83,78 (99,2 %) | 82,03 (97,1 %) | 84,15 (99,6 %) |
| ARC-Challenge (0-shot) | 69,62 | 68,94 (99,0 %) | 69,11 (99,3 %) | 68,43 (98,3 %) | 67,49 (96,9 %) | 69,11 (99,3 %) |
| Winogrande (5-shot) | 83,90 | 84,29 (100,5 %) | 84,29 (100,5 %) | 84,45 (100,7 %) | 82,64 (98,5 %) | 83,58 (99,6 %) |
| KMMLU (5-shot, directo) | 67,35 | 67,22 (99,8 %) | 67,39 (100,1 %) | 66,41 (98,6 %) | 65,22 (96,8 %) | 67,33 (100,0 %) |
| HAE-RAE (0-shot) | 82,31 | 82,03 (99,7 %) | 82,03 (99,7 %) | 81,94 (99,6 %) | 80,29 (97,6 %) | 81,85 (99,4 %) |
| **Media** | **78,71** | **78,38 (99,6 %)** | **78,60 (99,9 %)** | **78,12 (99,3 %)** | **76,79 (97,6 %)** | **78,34 (99,5 %)** |

Ademas, el autor reporta perplejidad frente al BF16 original sobre WikiText-2 (test, ingles) y una muestra de Wikipedia en coreano con fragmentos de 2.048 tokens: los builds de 8 bits (AWQ INT8 y FP8) se mantienen dentro del 0,5 % del BF16, mientras que los de 4 bits (AWQ INT4 y NVFP4) suben entre un 2,0 % y un 6,6 %. La concordancia top-1 de siguiente token no se midio para los modelos base.

## Requisitos de hardware

- VRAM estimada para inferencia: 35,1 GB solo de pesos; hay que sumar la cache KV (crece con la longitud de contexto y el numero de peticiones concurrentes) y unos pocos GB para activaciones y graficas CUDA. En la practica, una GPU de 80 GB deja margen amplio para contexto y concurrencia.
- GPU recomendadas: NVIDIA Turing (sm75) o posterior; el autor probo unicamente en B200. V100 (sm70) no esta soportada. Al ser cuantizacion weight-only INT8, no requiere tensor cores especiales.
- GPU de consumo: no disponible; el autor no documenta pruebas en GPUs consumer y el tamano de pesos (35,1 GB) excede la VRAM de la mayoria de tarjetas consumer actuales.
- Opciones de despliegue: vLLM (runtime objetivo; la arquitectura esta en vLLM >= 0.19.0 y se probo con 0.32.0). El autor no documenta llama.cpp, Ollama ni TGI para este checkpoint.
- Dependencias de software: Python 3.11-3.14, torch 2.13 (build CUDA 13.0, requiere driver NVIDIA con soporte CUDA 13), transformers >= 5.16.1,< 5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `axteam/gemma-4-31B-AWQ-8bit` (este repo) | 10.223.251.812 declarados (base "31B") | no disponible | safetensors compressed-tensors AWQ INT8 W8A16 | Apache-2.0 | Hugging Face, 321 descargas, 3 likes |
| `google/gemma-4-31B` (BF16 original) | "31B" (segun denominacion) | no disponible | safetensors BF16 | Gemma 4 / Apache-2.0 | Hugging Face (modelo base) |
| Variantes del mismo autor: FP8-dynamic, NVFP4A16, NVFP4, AWQ-4bit | mismas que el base | no disponible | compressed-tensors (FP8, NVFP4, INT4) | Apache-2.0 | Hugging Face (mismo autor) |

No se dispone de datos de benchmarks de modelos de otras familias comparables en la informacion proporcionada; la comparativa se limita a las variantes del mismo modelo base publicadas por el autor, cuyos resultados se recogen en la seccion de benchmarks.

## Limitaciones y advertencias

- Es un modelo base (pre-entrenado) sin plantilla de chat: no debe usarse como asistente conversacional; hay que emplear prompts de completado.
- La entrada de imagen no se probo en este build; los benchmarks se ejecutaron con imagen deshabilitada, por lo que el rendimiento multimodal real no esta verificado.
- La discrepancia entre el nombre "31B" y los 10.223.251.812 parametros declarados en safetensors no queda explicada en la informacion disponible; conviene verificar el conteo real antes de planificar recursos.
- La cuantizacion AWQ es PTQ sin reentrenamiento: introduce una degradacion pequena pero real (media del 99,9 % de recuperacion), y la perplejidad en 8 bits se mantiene dentro del 0,5 % del BF16.
- El conjunto de calibracion es predominantemente coreano; el comportamiento en otros idiomas no esta documentado mas alla de las tareas medidas en ingles y coreano.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; es un riesgo inherente a los modelos de lenguaje y debe mitigarse con verificacion en produccion.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia: Apache-2.0 con enlace a la licencia de Gemma 4 de Google; conviene revisar los terminos de uso de Gemma 4 para uso comercial, ya que la model card remite a ellos.
- Dependencias estrictas de version (vLLM 0.32.0, torch 2.13 CUDA 13, compressed-tensors 0.17.0): actualizar por separado puede romper la carga del checkpoint.
- V100 (sm70) no soportada; requiere driver con soporte CUDA 13.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/gemma-4-31B-AWQ-8bit
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
