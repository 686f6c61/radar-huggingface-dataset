# nkthebass/tinybrainbot-100m-v3-chat

## Resumen

TinyBrainBot-100M-v3-Chat es un modelo de lenguaje conversacional de 100 millones de parámetros desarrollado por nkthebass, perteneciente a la familia TinyBrainBot v3. Es una versión ajustada por supervisión (SFT) del modelo base de la misma familia, de la que se eliminaron deliberadamente todos los datos de razonamiento y cadena de pensamiento (chain-of-thought) para conseguir respuestas cortas, naturales y sin fugas de tokens de pensamiento ni bucles de repetición.

El modelo destaca por su capacidad de mantener conversaciones multi-turno coherentes y recordar turnos anteriores, algo sorprendente para su tamaño. Utiliza una arquitectura compatible con Llama de 768 dimensiones, 12 capas, 12 cabezas de atención con 4 key-value heads, contexto de 1024 tokens y un vocabulario de 32k tokens. Se distribuye bajo licencia Apache-2.0, incluye pesos en safetensors y un GGUF en F16, y está pensado como demo conversacional y herramienta de investigación, no como fuente fiable de conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-compatible (768/12L/12h·4kv) |
| Parametros totales | 100.092.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | F16 (GGUF incluido); el resto no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo usa una arquitectura transformer compatible con Llama, con 768 dimensiones ocultas, 12 capas, 12 cabezas de atencion y 4 cabezas KV (grouped-query attention), lo que reduce el coste de memoria de la cache KV. El vocabulario es de 32k tokens (`tbb-32k-v2`) y la ventana de contexto es de 1024 tokens, modesta pero suficiente para dialogos cortos.

El entrenamiento consistio en un ajuste supervisado (SFT) partiendo del modelo base `tinybrainbot-100m-v3-base`, eliminando por completo los datos de razonamiento o cadena de pensamiento. Esto produce respuestas cortas, directas y sin artefactos como fugas de pensamiento o repeticiones. Los parametros de muestreo por defecto (`temperature 0.5`, `repetition_penalty 1.3`) estan fijados en `generation_config.json`. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional coherente en ingles.
- Dialogos multi-turno con memoria de contexto funcional para su tamano.
- Respuestas cortas y naturales, sin fugas de pensamiento ni bucles de repeticion.
- Configuracion de muestreo por defecto optimizada para conversacion.
- Soporte de chat template propio: `<|user|>\n{msg}\n<|end|>\n<|assistant|>\n`.
- No soporta tool calling, vision, audio ni razonamiento explicito (eliminado a proposito).
- Capacidad multilingue limitada a ingles.

## Casos de uso

- **Estudio de comportamiento de modelos pequenos**: sirve para investigar como un modelo de 100M gestiona memoria conversacional y coherencia multi-turno sin datos de razonamiento.
- **Educacion e investigacion academica**: util para ensenar arquitecturas transformer, SFT y evaluacion con lm-eval-harness en un modelo ligero y reproducible.
- **Prototipado rapido de chatbots**: se puede integrar en demos o prototipos donde el coste de computo sea critico y la exactitud factual no importe.
- **Bases para experimentos de alineacion**: al no estar alineado, sirve como punto de partida para estudiar tecnicas de SFT, DPO o RLHF sobre un modelo pequeno.
- **Generacion de texto creativo y juegos de rol**: su tono conversacional natural permite usarlo en entornos de ocio o simulacion de personajes.
- **Testing de pipelines de inferencia**: su tamano permite validar integraciones con transformers, llama.cpp, Ollama o LM Studio con coste minimo.

## Benchmarks y rendimiento

Segun la model card, los resultados se obtuvieron con EleutherAI lm-eval-harness v0.4.12, 0-shot, sobre el repositorio HF (no el GGUF). Se comparan con Supra2-Instruct, un modelo de tamano similar.

| Benchmark | TinyBrainBot-100M-v3-Chat | Supra2-Instruct |
|---|---|---|
| ARC-Easy | 53.2 | 44.4 |
| ARC-Challenge | 28.2 | 24.7 |
| OpenBookQA | 31.2 | 30.4 |
| WinoGrande | 52.0 | 50.5 |
| PIQA | 65.9 | 64.4 |
| MMLU | 25.2 | 25.8 |
| HellaSwag | 32.8 | 35.9 |

El modelo supera a Supra2-Instruct en 5 de 7 benchmarks, aunque queda por detras en MMLU y HellaSwag. No se han publicado resultados para otros benchmarks como HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: en fp32 ocupa aproximadamente 0,4 GB (400 MB); en fp16 ~0,2 GB. Cabe en cualquier GPU moderna, incluso en iGPU con memoria compartida.
- **GPUs recomendadas**: cualquier GPU consumer con 2 GB de VRAM es suficiente; una RTX 3060 o superior permite inferencia con holgura.
- **CPU**: perfectamente ejecutable en CPU sin GPU, con latencia de pocos milisegundos por token.
- **Opciones de despliegue**: transformers, llama.cpp, Ollama, LM Studio, vLLM y TGI (compatible con endpoints).
- **Latencia**: no se han publicado medidas oficiales, pero para 100M de parametros la latencia es inferior a 10 ms/token en GPU moderna y del orden de 20-50 ms/token en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HellaSwag | Licencia | Formato |
|---|---|---|---|---|---|---|
| TinyBrainBot-100M-v3-Chat | 100M | 1024 | 25,2 | 32,8 | Apache-2.0 | safetensors, GGUF |
| Supra2-100M-Instruct | 100M (estimado) | no disponible | 25,8 | 35,9 | no disponible | no disponible |
| TinyBrainBot-100M-v3-Math | 100M | 1024 | no disponible | no disponible | Apache-2.0 | safetensors, GGUF |

La comparativa se limita a la familia TinyBrainBot y Supra2, unica referencia publicada. No hay datos de otros modelos de 100M en la informacion disponible.

## Limitaciones y advertencias

- **Confabulacion libre**: el modelo inventa informacion con total seguridad; no es fiable factualmente en ningun dominio.
- **No alineado**: no ha sido sometido a tecnicas de alineacion ni ajuste de seguridad; puede generar contenido no deseado o inapropiado.
- **Ventana de contexto reducida**: solo 1024 tokens, insuficiente para documentos largos o dialogos extensos.
- **Solo ingles**: no soporta otros idiomas.
- **Sin razonamiento**: al eliminar los datos de cadena de pensamiento, no es adecuado para tareas que requieran logica o calculo (para eso existe la variante `-math`).
- **Uso en produccion**: no recomendado para aplicaciones reales que requieran precision o seguridad; es una demo de investigacion.

## Enlaces

- Hugging Face: https://huggingface.co/nkthebass/tinybrainbot-100m-v3-chat
- Modelo base: https://huggingface.co/nkthebass/tinybrainbot-100m-v3-base
- Variante instruct: https://huggingface.co/nkthebass/tinybrainbot-100m-v3-instruct
- Variante math: https://huggingface.co/nkthebass/tinybrainbot-100m-v3-math
- Repositorio de evaluacion: https://github.com/EleutherAI/lm-evaluation-harness
