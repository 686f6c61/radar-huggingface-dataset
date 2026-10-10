# flashback2k/FlashModel-Qwen-3.6-35B-A3B-Maxed-GGUF

## Resumen

FlashModel-Qwen-3.6-35B-A3B-Maxed-GGUF es la version cuantizada en formato GGUF del modelo FlashModel-Qwen-3.6-35B-A3B-Maxed, un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.6-35B-A3B. El autor de la cuantizacion y del ajuste es el usuario flashback2k, y el resultado esta publicado bajo licencia Apache 2.0. Se trata de un modelo de generacion de texto orientado a razonamiento, codigo, uso de herramientas (tool calling) y dialogo bilingue ingles-ruso, con una arquitectura de mezcla de expertos (MoE) de aproximadamente 35.500 millones de parametros totales y unos 3.000 millones activos por token (la nomenclatura A3B).

La relevancia de esta ficha radica en que combina tres elementos poco frecuentes: control explicito del esfuerzo de razonamiento mediante la variable `reasoning_effort` (low, medium, high, xhigh, max) en el prompt de sistema, decodificacion especulativa basada en la cabeza MTP (multi-token prediction) conservada del checkpoint original, y una matriz de importancia (imatrix) calculada especificamente sobre este fine-tune con calibracion ponderada hacia codigo. El repositorio ocupa 141,9 GB e incluye varias cuantizaciones que van desde IQ3_XXS (~14,1 GB) hasta Q5_K_M (~26,5 GB), ademas de un codificador de vision en `mmproj-Q8_0.gguf`.

El modelo esta pensado para ejecucion local mediante llama.cpp, Ollama o LM Studio, con especial atencion a tarjetas graficas de 24 GB de VRAM, para las que el autor recomienda Q4_K_M. Los idiomas declarados son ingles y ruso, con aproximadamente un 22% de contenido en ruso en los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) dispersa; fine-tune de Qwen/Qwen3.6-35B-A3B con LoRA fusionada (safetensors bf16) |
| Parametros totales | 35.505.251.456 (~35,5 mil millones) |
| Parametros activos | ~3 mil millones (nomenclatura A3B de Qwen3.6-35B-A3B) |
| Longitud de contexto | No disponible de forma confirmada; el autor indica que no se ha medido mas alla de 16k tokens en este fine-tune. El ejemplo de llama-server usa `-c 32768` |
| Tipos de cuantizacion | IQ3_XXS (~14,1 GB), IQ3_S (~15,4 GB), IQ4_XS (~18,2 GB), IQ4_NL (~18,5 GB), Q4_K_M (~22,7 GB), Q5_K_S (~24,9 GB), Q5_K_M (~26,5 GB); todos con imatrix propia y cabeza MTP en Q4_K/Q5_K en los quants de baja precision |
| Idiomas soportados | Ingles (en) y ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors bf16 |
| Vision | Codificador de vision en `mmproj-Q8_0.gguf` (~0,45 GB, Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-35B-A3B, un Transformer de mezcla de expertos con 35,5 mil millones de parametros totales y aproximadamente 3 mil millones activos por token. Sobre esa base se aplico un ajuste fino con LoRA que posteriormente se fusiono en los pesos en bf16 (safetensors), conservando la cabeza MTP (multi-token prediction) del checkpoint original. Esa cabeza es la que habilita la decodificacion especulativa en llama.cpp mediante `--spec-type draft-mtp`.

Los datos de entrenamiento declarados incluyen los conjuntos open-r1/OpenR1-Math-220k (matematicas y razonamiento), simplescaling/s1K-1.1 (razonamiento de cadena de pensamiento), NousResearch/hermes-function-calling-v1 y glaiveai/glaive-function-calling-v2 (function calling), y OpenAssistant/oasst2 (dialogo). El autor indica que aproximadamente el 22% del contenido de entrenamiento esta en ruso, lo que explica el soporte bilingue. No se especifica el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO adicionales.

En cuanto a la cuantizacion, todas las variantes usan una matriz de importancia (imatrix) calculada sobre este mismo fine-tune, con calibracion ponderada hacia codigo (chats locales de programacion mas muestras en Rust, TypeScript, JavaScript, Python, QML y CSS, ademas de contenido en ruso). Cada tensor emplea el tipo base del quant correspondiente (llama-quantize estandar, sin sobrescrituras por experto), y la cabeza MTP se mantiene en Q4_K/Q5_K en los quants de baja precision. El proceso de conversion se realizo con `llama.cpp/convert_hf_to_gguf.py`.

## Capacidades

- Generacion de texto y razonamiento con esfuerzo controlable mediante `reasoning_effort` en el prompt de sistema (low, medium, high, xhigh, max); el autor lo describe como control real del razonamiento y no como truncado de la salida.
- Generacion de codigo en Rust, TypeScript, JavaScript, Python, QML, HTML, CSS y Bash.
- Function calling y tool calling, con conjuntos de entrenamiento especificos para ello.
- Uso agentico de herramientas: lectura y escritura de ficheros, shell y operaciones de git.
- Razonamiento multi-paso y flujos agenticos (segun los tags del repositorio).
- Dialogo multilingue ingles-ruso, con aproximadamente un 22% de datos de entrenamiento en ruso.
- Capacidad de vision mediante el codificador `mmproj-Q8_0.gguf` y builds de llama.cpp con soporte de vision.
- Decodificacion especulativa mediante cabeza MTP integrada (`--spec-type draft-mtp`), con una tasa de aceptacion de borradores del 77% segun el autor.
- Modos de muestreo diferenciados para razonamiento general, codigo preciso y modo sin razonamiento.

## Casos de uso

- Asistente de programacion local: el modelo genera codigo en Rust, TypeScript, JavaScript, Python, QML, HTML, CSS y Bash, por lo que puede integrarse como copiloto en editores o pipelines de revision de codigo. Su calibracion imatrix ponderada hacia codigo mejora la fidelidad en estos lenguajes frente a una cuantizacion generica.
- Agente de automatizacion de tareas con tool calling: al soportar lectura/escritura de ficheros, shell y operaciones git, puede ejecutar tareas de mantenimiento de repositorios, aplicar parches o lanzar comandos dentro de un flujo agentico controlado.
- Atencion al cliente o asistencia tecnica bilingue: el soporte declarado de ingles y ruso (con ~22% de datos en ruso) permite desplegar un asistente conversacional en ambos idiomas con una sola instancia.
- Razonamiento matematico y resolucion de problemas: los conjuntos OpenR1-Math-220k y s1K-1.1 en el entrenamiento apuntan a tareas de matematicas y razonamiento de cadena de pensamiento, ajustables con `reasoning_effort` segun la dificultad del problema.
- Ejecucion en hardware de consumo con 24 GB de VRAM: el quant Q4_K_M (~22,7 GB) esta disenado especificamente para tarjetas de 24 GB, lo que permite desplegar un modelo de 35,5 mil millones de parametros en un equipo local sin infraestructura de servidor.
- Despliegue en iGPU o equipos modestos: con IQ3_XXS (~14,1 GB) el autor reporta ejecucion en una iGPU Radeon 680M, lo que abre la puerta a prototipado en portatiles sin GPU dedicada de gama alta.
- Servidor de inferencia con decodificacion especulativa: usando `llama-server` con `--spec-type draft-mtp` se puede aumentar el throughput de decodificacion aprovechando la cabeza MTP conservada del checkpoint base.
- Aplicaciones con entrada visual: gracias al `mmproj-Q8_0.gguf` y a builds de llama.cpp con vision, el modelo puede procesar imagenes ademas de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente proporciona una medicion de velocidad de decodificacion con y sin decodificacion especulativa MTP:

| Medicion | Valor |
|---|---|
| Tasa de aceptacion de borradores (MTP) | 77% |
| Decodificacion con MTP | 29,2 tok/s |
| Decodificacion sin MTP | 27,2 tok/s |
| Mejora relativa | ~+7% |

Estos datos corresponden a una unica muestra de 400 tokens, con el quant IQ3_XXS, sobre una iGPU Radeon 680M. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: IQ3_XXS ~14,1 GB, IQ3_S ~15,4 GB, IQ4_XS ~18,2 GB, IQ4_NL ~18,5 GB, Q4_K_M ~22,7 GB, Q5_K_S ~24,9 GB, Q5_K_M ~26,5 GB. Son tamanos de fichero, no de uso total de memoria; hay que dejar espacio adicional para la cache KV.
- Recomendacion del autor por VRAM libre: Q5_K_M con 28 GB o mas, Q5_K_S con ~26 GB, Q4_K_M con 24 GB, IQ4_XS con ~22 GB, IQ3_S o IQ3_XXS con 20 GB o menos.
- GPU de consumo: el quant Q4_K_M esta pensado para tarjetas de 24 GB (por ejemplo, RTX 4090 o RTX 3090). Con Q5_K_S puede requerirse offload parcial de capas.
- GPU de gama alta y profesional: A100, H100 y similares no se mencionan explicitamente, pero por capacidad de memoria alojarian con holgura los quants mayores.
- iGPU y equipos modestos: el autor reporta ejecucion viable con IQ3_XXS en una Radeon 680M.
- Opciones de despliegue: llama.cpp (`llama-server`, con `--jinja`, `--flash-attn`, `-ngl 99` y `--spec-type draft-mtp`), Ollama (`ollama run hf.co/...`), LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput: la unica medicion disponible es la decodificacion de 27,2 a 29,2 tok/s en IQ3_XXS sobre iGPU Radeon 680M, con una muestra de 400 tokens. No hay datos de throughput en GPU dedicada ni de latencia de prefill.
- Contexto: el autor advierte que no se ha medido el comportamiento mas alla de 16k tokens; el ejemplo de servidor usa `-c 32768`, lo que requiere reservar memoria adicional para la cache KV en trazas de razonamiento largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlashModel-Qwen-3.6-35B-A3B-Maxed-GGUF (este) | 35,5B totales / ~3B activos | No confirmado (no medido mas alla de 16k) | GGUF | Apache 2.0 | Hugging Face (flasback2k) |
| FlashModel-Qwen-3.6-35B-A3B-Maxed (base del quant) | 35,5B totales / ~3B activos | No disponible | safetensors bf16 | Apache 2.0 | Hugging Face (flasback2k) |
| Qwen/Qwen3.6-35B-A3B (modelo original) | 35,5B totales / ~3B activos | No disponible en la informacion proporcionada | safetensors | Apache 2.0 (segun enlace de licencia citado) | Hugging Face (Qwen) |

No se dispone en la informacion proporcionada de datos de rendimiento comparativos con modelos de otros desarrolladores de la misma categoria.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), por lo que el rendimiento real en tareas concretas no esta cuantificado de forma objetiva.
- La mejora de velocidad por decodificacion especulativa MTP (+7%) procede de una unica muestra de 400 tokens en una iGPU concreta y un quant concreto, por lo que no debe generalizarse.
- El autor advierte que no se ha medido el comportamiento del modelo con contextos superiores a 16k tokens; usar 32k en produccion es una extrapolacion no validada.
- Los tamanos de cuantizacion indicados son tamanos de fichero, no uso total de memoria; hay que sumar la cache KV, especialmente en razonamiento de cadena larga.
- Bajo IQ3_XXS la calidad se degrada de forma perceptible en codigo y razonamiento, segun el propio autor.
- El soporte de idiomas declarado se limita a ingles y ruso; no hay garantia de calidad en castellano ni en otros idiomas.
- Existe riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mecanismos especificos de mitigacion en la informacion disponible.
- No se documentan sesgos conocidos ni evaluaciones de seguridad del fine-tune.
- Aunque la licencia es Apache 2.0, el propio autor enlaza la licencia del modelo original Qwen3.6-35B-A3B, por lo que conviene revisar las condiciones del modelo base antes de un uso comercial.
- El ajuste fino y la cuantizacion proceden de un unico autor independiente (flashback2k), sin validacion externa publicada; el numero de descargas (882) y de likes (1) es bajo.
- La fecha de creacion del repositorio indicada en la informacion es 2026-10-09, dato que conviene verificar en la fuente original.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/flashback2k/FlashModel-Qwen-3.6-35B-A3B-Maxed-GGUF
- Modelo base del quant (safetensors bf16): https://huggingface.co/flashback2k/FlashModel-Qwen-3.6-35B-A3B-Maxed
- Modelo original Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia citada del modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Quant IQ3_XXS: https://huggingface.co/flashback2k/FlashModel-Qwen-3.6-35B-A3B-Maxed-GGUF/resolve/main/FlashModel-Qwen-3.6-35B-A3B-Maxed-IQ3_XXS.gguf
- Quant IQ3_S: https://huggingface.co/flashback2k/FlashModel-Qwen-3.6-35B-A3B-Maxed-GGUF/resolve/main/FlashModel-Qwen-3.6-35B-A3B-Maxed-IQ3_S.gguf
- Quant IQ4_XS: https://huggingface.co/flashback2k/FlashModel-Qwen-3.6-35B-A3B-Maxed-GGUF/resolve/main/FlashModel-Qwen-3.6-35B-A3B-Maxed-IQ4_XS.gguf
- Quant IQ4_NL: https://huggingface.co/flashback2k/FlashModel-Qwen-3.6-35B-A3B-Maxed-GGUF/resolve/main/FlashModel-Qwen-3.6-35B-A3B-Maxed-IQ4_NL.gguf
- Quant Q4_K_M (recomendado): https://huggingface.co/flashback2k/FlashModel-Qwen-3.6-35B-A3B-Maxed-GGUF/resolve/main/FlashModel-Qwen-3.6-35B-A3B-Maxed-Q4_K_M.gguf
- Quant Q5_K_S: https://huggingface.co/flashback2k/FlashModel-Qwen-3.6-35B-A3B-Maxed-GGUF/resolve/main/FlashModel-Qwen-3.6-35B-A3B-Maxed-Q5_K_S.gguf
- Quant Q5_K_M: https://huggingface.co/flashback2k/FlashModel-Qwen-3.6-35B-A3B-Maxed-GGUF/resolve/main/FlashModel-Qwen-3.6-35B-A3B-Maxed-Q5_K_M.gguf
- Matriz de importancia (imatrix): https://huggingface.co/flashback2k/FlashModel-Qwen-3.6-35B-A3B-Maxed-GGUF/resolve/main/FlashModel-Qwen-3.6-35B-A3B-Maxed.imatrix.gguf
- Codificador de vision: https://huggingface.co/flashback2k/FlashModel-Qwen-3.6-35B-A3B-Maxed-GGUF/resolve/main/mmproj-Q8_0.gguf
