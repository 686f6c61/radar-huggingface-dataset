# antongoorin/outpost2-decomp-qwen-lora-D

## Resumen

outpost2-decomp-qwen-lora-D es un adaptador LoRA de PEFT entrenado sobre el modelo base Qwen/Qwen3.8-27B. Su tarea es muy especifica: reescribir una funcion C++ del videojuego *Outpost 2* para que el compilador Visual C++ 4.2 genere exactamente los mismos bytes que el binario original. Se trata de un problema de *matching decompilation*, una disciplina de ingenieria inversa en la que el objetivo no es solo producir codigo correcto, sino reproducir byte a byte la salida de un compilador historico. El adaptador forma parte del proyecto #987 de TethysGame/Outpost2Remake.

El repositorio contiene unicamente los pesos del adaptador (992 tensores en float32, 233.455.616 parametros entrenables, el 0,8605% del total del modelo base), no los pesos del modelo base. Incluye tambien una conversion del adaptador a GGUF F16 para su uso con llama.cpp. El dataset de entrenamiento (dataset D) no esta publicado porque las filas contienen texto del juego original.

La relevancia de este adaptador es acotada pero significativa dentro de su nicho: demuestra que un ajuste fino con LoRA sobre un modelo de 27B puede mejorar marginalmente (del 56,2% al 59,4% de *matches* byte-exactos) respecto a un adaptador hermano (A) en la misma tarea, con un entrenamiento de 21,36 horas en una sola NVIDIA L40S y 39,7 millones de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.8-27B; target_modules all-linear |
| Parametros totales | 233.455.616 (pesos del adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens durante entrenamiento (max_len); contexto del modelo base no disponible |
| Tipos de cuantizacion | Base cargado en 4-bit NF4 con double quant; pesos LoRA guardados en float32; adaptador convertido a GGUF F16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors), GGUF (adapter-f16.gguf) |

## Arquitectura y entrenamiento

El adaptador es un LoRA con rango r=32 y alpha=64, dropout 0,05, aplicado a todas las capas lineales (all-linear) del modelo base Qwen/Qwen3.8-27B con tarea CAUSAL_LM. El modelo base se cargo en 4-bit NF4 con doble cuantizacion y dtype de computo bfloat16, con gradient checkpointing (use_reentrant false). El optimizador fue AdamW con betas (0,9, 0,99), weight decay 0, gradient clip 1,0 y un schedule de 10 pasos de warmup lineal seguido de decaimiento coseno hasta 0,1 veces el learning rate. Learning rate 0,0001, una epoca, acumulacion de gradientes 16, semilla 987.

El dataset D se renderizo desde el checkout de Outpost2Remake en `origin/main` `1c1010dd8d6c68fb02ce7a6bfb695c6c577d8356` con semilla 987, maximo 16.000 tokens, referencias conservadas y sin guia. Se fusiono el render natural con rondas sinteticas de reparacion (round-01, round-02, round-03, renderizadas en `42049ee8231742599cc73cab0a274ed10eb00e3e`). Por funcion se conservan como maximo 4 filas `repair` y 2 `self-repair`. `train.jsonl` tenia 6.903 filas antes del split de validacion y del filtrado por longitud: 5.747 naturales, 257 de round-01, 332 de round-02 y 567 de round-03. Por tipo: write 1.886, repair 2.813, history 491, self-write 376, self-repair 1.337. El split de validacion (2% por hash estable de la direccion, val_frac 0,02, semilla 987) dejo 112 filas de validacion; 225 filas superaban 16.384 tokens y se omitieron. El entrenamiento final uso 6.566 ejemplos y 39.697.281 tokens, con 410 pasos de optimizador. Memoria pico en L40S: 39,8 GB; tiempo de pared: 76.885 s (21,36 h).

## Capacidades

- Generacion de codigo C++ orientada a *matching decompilation*: reescribe funciones para que Visual C++ 4.2 emita los bytes originales del binario.
- Modo de reparacion: el dataset incluye filas `repair` y `self-repair` que entrenan al modelo a corregir codigo que no compila o que no produce los bytes esperados.
- Generacion de historial (`history`): el dataset contempla filas de tipo history, lo que sugiere capacidad de producir contexto conversacional o trazas asociadas a la tarea.
- Formato de chat compatible con el de adapter A (mismo `system` y plantilla de chat).
- Modo thinking desactivable mediante `chat_template_kwargs` `{"enable_thinking": false}` (se uso desactivado en el benchmark).
- Capacidades generales del modelo base Qwen/Qwen3.8-27B (no detalladas en la informacion disponible).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Reconstruccion de codigo fuente de Outpost 2: el adaptador reescribe funciones C++ concretas para que Visual C++ 4.2 reproduzca los bytes del binario original, permitiendo reconstruir el codigo fuente del juego de forma verificable byte a byte.
- Investigacion en matching decompilation: sirve como artefacto reproducible para estudiar como un LoRA sobre un LLM de 27B aborda el problema de igualar la salida de un compilador historico, con metricas de compilacion y coincidencia byte-exacta.
- Reparacion automatizada de funciones que no compilan: las filas `repair` y `self-repair` del dataset entrenan al modelo para corregir codigo que falla en compilacion o que no reproduce los bytes esperados, util en pipelines de reconstruccion iterativa.
- Integracion en flujos de CI de decompilacion: el adaptador puede servir como paso de generacion de candidatos que luego se validan con el compilador y con la comparacion de bytes, encajando en pipelines automatizados de verificacion.
- Comparacion de estrategias de ajuste fino: al compartir tarea y formato de chat con adapter A, permite comparar dos adaptadores bajo el mismo benchmark de 256 casos (85,2% compilados y 59,4% matched para D frente a 84,0% y 56,2% para A).
- Despliegue ligero con llama.cpp: la conversion a GGUF F16 permite cargar el adaptador en llama.cpp sobre el modelo base cuantizado, reduciendo requisitos de VRAM frente a la inferencia en precision completa.
- Estudio de eficiencia de LoRA: con solo 233,4 M parametros entrenables (0,86% del total) y 21,36 h en una L40S, sirve como referencia de coste para ajustes finos de tareas especializadas.

## Benchmarks y rendimiento

Evaluacion sobre los mismos 256 casos de test retenidos del bundle 261104-v2 para A y D (215 repair, 41 write), temperatura 0, maximo 8.000 tokens, thinking desactivado.

| Metrica | Adapter A | Adapter D |
|---|---|---|
| Compilados | 84,0% | 85,2% |
| Matched (byte score 0) | 56,2% | 59,4% |
| Mean drop | 0,752 | 0,800 |

El *drop* se define como `max(0, (start - end) / start)`, contando como 0 una respuesta que no compila, sobre los 239 casos cuyo `start` compila. En esa metrica D es mejor en 29 casos y peor en 18 (Wilcoxon signed-rank p = 0,02475, aproximacion normal; diferencia media +0,048). En coincidencias exactas, 21 casos solo los acierta D y 13 solo A (McNemar exacto p = 0,2295). D agoto el limite de 8.000 tokens en 1 respuesta; A en 0 de estos 256.

Subconjunto de 13 casos (`bench_standard.txt` presentes en los 256, todos repair):

| Metrica | Adapter A | Adapter D |
|---|---|---|
| Compilados | 100% | 100% |
| Matched | 61,5% | 69,2% |
| Mean drop | 0,693 | 0,790 |

En este subconjunto D es mejor en 3 comparaciones de drop y peor en 1; 2 casos solo los acierta D y 1 solo A (McNemar exacto p = 1; Wilcoxon signed-rank p = 0,625 exacto sobre 4 pares no nulos).

## Requisitos de hardware

- Entrenamiento: una NVIDIA L40S con 46.068 MiB, con pico de memoria asignada de 39,8 GB durante el run.
- Inferencia: los pesos del adaptador ocupan 1,4 GB (repo completo); el coste real lo domina el modelo base Qwen/Qwen3.8-27B.
- VRAM estimada para inferencia del modelo base: no disponible en la informacion proporcionada; el adaptador en si es ligero y puede cargarse sobre el base cuantizado.
- GPU recomendadas: no disponibles de forma explicita; la unica GPU documentada es la L40S usada para entrenar.
- Compatibilidad con GPU de consumo: no disponible; depende de la cuantizacion del modelo base.
- Opciones de despliegue: llama.cpp mediante `adapter-f16.gguf`; PEFT sobre el modelo base en safetensors; no se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; el benchmark se ejecuto con temperatura 0 y maximo 8.000 tokens, pero no se reportan tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (matched) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| outpost2-decomp-qwen-lora-D | 233,4 M (adaptador) | 16.384 (entrenamiento) | 59,4% (256 casos) | no disponible | Hugging Face |
| outpost2-decomp-qwen-lora-A | no disponible (adaptador) | no disponible | 56,2% (256 casos) | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27.129.454.080 | no disponible | no disponible | no disponible | Hugging Face |

La unica comparacion directa documentada es con adapter A, que comparte tarea, formato de chat y benchmark. No se dispone de datos sobre otros adaptadores o modelos comparables en matching decompilation.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador; no incluye los pesos del modelo base, que deben obtenerse por separado.
- El dataset D no esta publicado porque las filas de entrenamiento contienen texto del juego original, lo que limita la reproducibilidad completa del entrenamiento.
- El adaptador no incluye archivos de tokenizer; hereda el del modelo base.
- La evaluacion se realizo con el bundle antongoorin/outpost2-decomp-261104-v2, no con una copia publicada de D.
- La tarea es extremadamente especifica (una funcion C++ de Outpost 2 compilada con Visual C++ 4.2); el rendimiento fuera de ese dominio no esta documentado.
- La mejora frente a adapter A es marginal en coincidencias exactas (McNemar p = 0,2295, no significativa) y solo significativa en la metrica de drop (p = 0,02475).
- D agoto el limite de 8.000 tokens en 1 de 256 respuestas, lo que puede indicar respuestas truncadas en casos complejos.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no disponible; en esta tarea, la validacion por compilacion y comparacion de bytes mitiga en parte la generacion incorrecta.
- Licencia: no disponible, por lo que el uso comercial no puede confirmarse.
- Idiomas soportados: no disponibles.
- El `adapter_config.json` apuntaba originalmente a un directorio local; la ruta fue sustituida por `Qwen/Qwen3.8-27B` antes de la subida, sin otros cambios en la configuracion.

## Enlaces

- Hugging Face: https://huggingface.co/antongoorin/outpost2-decomp-qwen-lora-D
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adapter A (hermano): https://huggingface.co/antongoorin/outpost2-decomp-qwen-lora-A
- Dataset de evaluacion: https://huggingface.co/datasets/antongoorin/outpost2-decomp-261104-v2
- Proyecto Outpost2Remake: https://github.com/TethysGame/Outpost2Remake
