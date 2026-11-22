# MartinNav/gemma3-1b-it-dadjoker

## Resumen

`gemma3-1b-it-dadjoker` es un ajuste fino (fine-tune) del modelo `google/gemma-3-1b-it` de Google, desarrollado por el usuario MartinNav y publicado en Hugging Face. El modelo está especializado en la generación de chistes y "dad jokes" (chistes de padre, de humor blanco y predecible), y se ha entrenado mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization) sobre un adaptador LoRA que posteriormente se fusionó con los pesos base. El resultado es un modelo que se carga directamente con `transformers` sin necesidad de PEFT.

El modelo resuelve un problema muy acotado: producir chistes variados y con remate ("punchline") en inglés, evitando clichés repetitivos y fomentando la diversidad de respuestas. No pretende ser un modelo de propósito general, sino una demostración de cómo el RL con recompensas basadas en un juez (otra instancia del modelo base congelada) puede modificar el comportamiento generativo de un modelo pequeño de 1B de parámetros.

Con aproximadamente 1.000 millones de parámetros (999.885.952 según los pesos en safetensors) y un repositorio de 2,0 GB en `bfloat16`, es un modelo ligero, adecuado para experimentación, prototipado y despliegue en hardware de consumo. Su relevancia actual radica en ser un ejemplo práctico y reproducible de alineación por RL a pequeña escala sobre la familia Gemma 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante `gemma3_text`); ajuste fino con LoRA fusionado |
| Parametros totales | 999.885.952 (aproximadamente 1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de `google/gemma-3-1b-it`) |
| Tipos de cuantizacion | No se documentan cuantizaciones publicadas; pesos en `bfloat16`. Compatible con cuantizacion estandar (GGUF, bitsandbytes) por ser un transformer estandar, aunque no se ofrece en el repo |
| Idiomas soportados | Ingles (`en`) segun la model card |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | `safetensors` (`model.safetensors`), precision `bfloat16` |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de la familia Gemma 3 con aproximadamente 1B de parametros. Sobre esta base se entreno un adaptador LoRA con rango `r=8` y `lora_alpha=16`, aplicado a los modulos `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj` y `v_proj`. El adaptador se fusiono posteriormente en los pesos base en `bfloat16`, de modo que el modelo resultante es autocontenido y no requiere PEFT para cargarse.

El entrenamiento utilizo aprendizaje por refuerzo con GRPO. La senal de recompensa combina varias fuentes: un juez de remates ("punchline judge") que es una instancia congelada del propio `google/gemma-3-1b-it` sin LoRA, recompensas por palabras clave, penalizaciones por subcadenas de cliches negativos, penalizaciones por repeticion de palabras clave de chistes anteriores y recompensas de diversidad sobre el archivo de chistes generados. No se detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (`apply_chat_template`).
- Generacion de chistes y "dad jokes" cortos y originales, con remate, fomentando la diversidad y penalizando cliches.
- Respuesta a instrucciones del tipo "cuentame un chiste corto y original, muestra solo el chiste".
- Capacidad de razonamiento general y conocimiento heredados del modelo base `google/gemma-3-1b-it` (no evaluada ni documentada en esta ficha).
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste esta orientado a generacion de una sola respuesta corta.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo "thinking", vision o audio: no disponibles en esta variante.

## Casos de uso

- Generacion de chistes para bots de entretenimiento: el modelo puede integrarse en un bot de chat o Discord que responda con un chiste corto ante comandos como `/chiste`, usando `temperature=1.0` y `top_p=0.95` como recomienda el autor.
- Relleno de contenido humoristico en aplicaciones de mensajeria: generacion de "dad jokes" para tarjetas diarias, notificaciones push o widgets de apps moviles, aprovechando su bajo coste de inferencia por ser un modelo de 1B.
- Prototipado de pipelines de RL: sirve como ejemplo reproducible de entrenamiento GRPO con recompensas basadas en juez para investigadores que quieran replicar la metodologia en otros dominios (por ejemplo, generacion de eslóganes o microcopy).
- Pruebas de alineacion y evaluacion de diversidad: util para estudiar como las penalizaciones por repeticion y los rewards de diversidad afectan a la variedad de salidas de un modelo pequeno.
- Generacion de ejemplos sinteticos para datasets de humor: el modelo puede producir lotes de chistes etiquetados por tema para alimentar otros sistemas o para evaluacion humana.
- Demostraciones educativas de fine-tuning con LoRA y fusion de adaptadores: el repositorio documenta el flujo completo (LoRA r=8, alpha=16, fusion en bfloat16, carga con `transformers`), lo que lo hace util en cursos y talleres.
- Baseline para comparativas de modelos especializados: al ser un ajuste acotado sobre Gemma 3 1B, sirve como referencia en experimentos sobre especializacion por RL en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16`: aproximadamente 2 GB para los pesos (999.885.952 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 2,5 y 4 GB segun longitud de contexto y lote.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1 GB de pesos; en 4 bits: aproximadamente 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para `bfloat16`; A100 o H100 no son necesarias salvo para entrenamiento o lotes grandes.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 6 GB o mas; tambien puede ejecutarse en CPU con cuantizacion.
- Opciones de despliegue: `transformers` (`AutoModelForCausalLM` y `pipeline`), `text-generation-inference` (etiqueta `text-generation-inference` en el repo), y por ser un transformer estandar es compatible con `vLLM`, `llama.cpp` (previa conversion a GGUF) y `Ollama` (previa conversion), aunque estas ultimas no estan documentadas por el autor.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `MartinNav/gemma3-1b-it-dadjoker` | ~1B | No disponible | Chistes y dad jokes (GRPO + LoRA fusionado) | Gemma Terms of Use | Hugging Face |
| `google/gemma-3-1b-it` | ~1B | No disponible | Proposito general, instrucciones | Gemma Terms of Use | Hugging Face |
| `google/gemma-2-2b-it` | ~2B | No disponible | Proposito general, instrucciones | Gemma Terms of Use | Hugging Face |
| `Qwen/Qwen2.5-1.5B-Instruct` | ~1,5B | No disponible | Proposito general, instrucciones | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de tamano similar de proposito general; no se dispone de datos de benchmarks para establecer comparaciones de rendimiento cuantitativas con el modelo especializado.

## Limitaciones y advertencias

- El modelo esta especializado en chistes en ingles; su rendimiento en otras tareas generativas puede degradarse respecto al modelo base.
- Idioma limitado al ingles segun la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion y de generar contenido sin sentido o repetitivo, especialmente con temperaturas bajas; el autor recomienda `temperature=1.0` y `top_p=0.95`.
- Sesgos: hereda los sesgos del modelo base `google/gemma-3-1b-it`; no se documentan evaluaciones de sesgo especificas para este ajuste.
- Restricciones de licencia: sujeto a los Gemma Terms of Use; es necesario revisar las condiciones de uso comercial y de redistribucion de Google antes de desplegarlo en produccion.
- El ajuste fino con RL puede haber reducido la capacidad de seguir instrucciones generales o de mantener conversaciones multi-turno largas; no se documenta su comportamiento fuera del dominio de los chistes.
- No se documentan evaluaciones de seguridad, toxicidad ni robustez; el contenido humoristico puede resultar inapropiado en algunos contextos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MartinNav/gemma3-1b-it-dadjoker
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
