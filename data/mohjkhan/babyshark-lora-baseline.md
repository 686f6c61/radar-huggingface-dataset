# mohjkhan/babyshark-lora-baseline

## Resumen

babyshark-lora-baseline es un adaptador LoRA entrenado sobre Qwen/Qwen2.5-1.5B (base, fp16) por el autor mohjkhan, en el marco del proyecto InterpAdapt (equipo BabyShark, IIIT Hyderabad). No es un modelo de propósito general, sino un *baseline* uniforme de LoRA concebido como referencia que los adaptadores de enrutamiento de circuitos (CRA, *circuit routing adapter*) deben superar en la tarea de análisis de sentimiento de tres clases sobre texto code-mixed hindi-inglés (hinglish) romanizado.

La tarea se evalúa sobre el corpus SAIL-2017 Romanized (dataset satyam-arora-iiit-hyderabad/babyshark-sail2017-stage2). El adaptador aplica LoRA de rango 8 únicamente sobre las proyecciones `q_proj` y `o_proj`, con alpha 16 y dropout 0.05, durante 600 pasos y con una longitud máxima de 256 tokens. El checkpoint se distribuye como un payload de `torch.save` (`ckpt.pt`) que no es un adaptador PEFT estándar y requiere el código del proyecto para recargarse.

Su relevancia es exclusivamente de investigación: sirve como punto de comparación controlado (semilla 0 y orden de datos idénticos al resto de brazos CRA, variando solo la máscara de cabezas) para medir el efecto de la interpretabilidad guiada en el ajuste fino multilingüe. No hay datos de rendimiento publicados para el adaptador (la columna "+ adapter" aparece como "n/a"), y el repositorio tiene 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (base Qwen2.5-1.5B) |
| Parametros totales | 1.500 millones aprox. en el modelo base; adaptador LoRA de rango 8 (recuento exacto no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens en entrenamiento (max_len); contexto nativo del modelo base según ficha de Qwen2.5, no confirmado en esta ficha |
| Tipos de cuantizacion | no disponible (entrenamiento y evaluacion en fp16) |
| Idiomas soportados | hindi (hi), ingles (en); evaluado en hinglish romanizado |
| Licencia | no disponible |
| Formato de pesos | `ckpt.pt` (payload de `torch.save` con state dict del adaptador + optimizer/scheduler/step/RNG); no es un adaptador PEFT estandar |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen2.5-1.5B en precision fp16. Sobre el se aplica un adaptador LoRA de rango 8 configurado con alpha 16 y dropout 0.05, inyectado exclusivamente en las proyecciones `q_proj` (query) y `o_proj` (output) de las capas de atencion. El entrenamiento consta de 600 pasos con tasa de aprendizaje 1e-4, longitud maxima de secuencia 256 tokens y semilla 0. Los demas brazos experimentales del proyecto CRA comparten la misma semilla y el mismo orden de datos, de modo que la unica variable que se modifica entre brazos es la mascara de cabezas de atencion.

El adaptador se enmarca en el enfoque InterpAdapt de "enrutamiento de circuitos guiado por interpretabilidad": se calculan puntuaciones de cabeza (*head scores*) mediante un rastreo causal de Stage-1 v2 (recuperacion media en `en_hi-latn`), que guian la seleccion de cabezas de atencion a entrenar. Este baseline usa el modo de mascara `baseline` (sin seleccion de cabezas activas, "Active head-blocks: n/a"). El entrenamiento se realizo en hardware denominado "ADA" en fp16. No se especifica en la informacion disponible el volumen total de tokens de entrenamiento ni si hubo etapas de RLHF o DPO (no procede en un ajuste LoRA supervisado de clasificacion).

## Capacidades

- Clasificacion de sentimiento de tres clases sobre texto hinglish romanizado (code-mixed hindi-ingles).
- Ajuste fino especifico de la tarea; el adaptador modifica solo las proyecciones de query y output, con LoRA de rango 8.
- Idiomas: hindi e ingles, con foco en su mezcla escrita en alfabeto latino (romanizado).
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia documentada de modo "thinking", vision ni audio.
- No esta disenado como modelo generativo de proposito general: es un artefacto de investigacion para una tarea concreta.

## Casos de uso

- Referencia experimental en investigacion: sirve como baseline contra el que se comparan los brazos de enrutamiento de circuitos (CRA) del proyecto InterpAdapt, manteniendo constante la semilla y el orden de datos para aislar el efecto de la mascara de cabezas.
- Analisis de sentimiento en redes sociales indias: clasificacion de comentarios y publicaciones en hinglish romanizado (X/Twitter, YouTube, Instagram), donde el texto mezcla hindi e ingles en alfabeto latino.
- Monitorizacion de opinion de producto en mercados hispanohablantes de la India... no aplica; mas bien monitorizacion de marca en comunidades de habla hindi-inglesa, clasificando resenas y menciones en tres categorias de sentimiento.
- Reproduccion de experimentos de interpretabilidad: replicacion del rastreo causal de cabezas y de la comparacion baseline vs. CRA a partir de `ckpt.pt` y `results.json`.
- Estudio de fine-tuning eficiente en lenguas de bajos recursos: analisis de como un LoRA de rango 8 sobre `q_proj` y `o_proj` afecta al rendimiento en code-mixing, con solo 600 pasos de entrenamiento.
- Punto de partida para adaptaciones propias: base para quien quiera construir su propio adaptador sobre Qwen2.5-1.5B en tareas de clasificacion multilingue, reutilizando la configuracion de hiperparametros documentada.
- Docencia y formacion: ejemplo practico de LoRA con PEFT aplicado a una tarea de clasificacion con dataset publico (SAIL-2017).

## Benchmarks y rendimiento

Resultados de validacion publicados por el autor (n=1260, fp16):

| Metrica | Base Qwen2.5-1.5B | + adaptador |
|---|---|---|
| Accuracy | 0.3579 | n/a |
| Macro-F1 | 0.3194 | n/a |

El valor de "+ adaptador" no esta publicado. La unica cifra disponible corresponde al modelo base sin adaptador. No se han publicado resultados adicionales de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo base Qwen2.5-1.5B en fp16 ocupa aproximadamente 3 GB de pesos; el adaptador LoRA de rango 8 anade un consumo marginal (decenas de MB, valor exacto no disponible).
- Estimacion de VRAM para inferencia en fp16: en torno a 4-6 GB contando pesos, cache KV y activaciones segun lote y longitud de secuencia (estimacion, no dato publicado).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (por ejemplo RTX 3060 12 GB, RTX 3070, RTX 4060 Ti 16 GB, RTX 4090). El entrenamiento se realizo en GPU "ADA" (arquitectura RTX 40, modelo concreto no especificado).
- GPU de centro de datos compatibles: A100, H100 (sobradas para 1.5B), aunque el modelo es pequeno y no las requiere.
- Opciones de despliegue: al no ser un adaptador PEFT estandar, la carga requiere el codigo del proyecto (script `load_checkpoint` de `scripts/train_lora_baseline.py`). No se documenta despliegue con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (SAIL-2017 validacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| babyshark-lora-baseline | 1.5B (base) + LoRA | 256 (entrenamiento) | adaptador: n/a | no disponible | HuggingFace |
| Qwen2.5-1.5B (base) | 1.5B | segun ficha de Qwen2.5 | Accuracy 0.3579; Macro-F1 0.3194 | Apache 2.0 (segun Qwen2.5, no confirmado aqui) | HuggingFace |
| Brazos CRA de InterpAdapt | 1.5B (base) + LoRA | 256 | no disponible | no disponible | proyecto InterpAdapt |

No se dispone de informacion sobre otros adaptadores de sentimiento hinglish comparables. La comparativa directa disponible se limita al modelo base frente al adaptador y a los brazos CRA del mismo proyecto, cuyos resultados no estan publicados en la informacion facilitada.

## Limitaciones y advertencias

- Artefacto de investigacion: no esta pensado para uso en produccion; su proposito es servir como baseline controlado.
- Rendimiento del adaptador no publicado: la columna "+ adaptador" aparece como "n/a" en la tabla de resultados, por lo que no se puede confirmar que mejore al modelo base.
- Carga no estandar: el checkpoint (`ckpt.pt`) no es un adaptador PEFT cargable directamente; requiere el codigo del proyecto InterpAdapt.
- Licencia no disponible: se desconoce si permite uso comercial; hay que contactar con el autor o consultar el repositorio antes de cualquier uso comercial.
- Riesgo de alucinacion: no procede en una tarea de clasificacion, pero el modelo base puede generar texto no fiable si se usa fuera de la tarea prevista.
- Sesgos: entrenado sobre SAIL-2017, un corpus especifico de redes sociales; puede presentar sesgos de dominio, registro y demografia de ese dataset.
- Cobertura limitada: solo hindi, ingles y su mezcla romanizada; no se documenta calidad en otros idiomas ni en hindi en escritura devanagari.
- Contexto de entrenamiento corto (256 tokens): puede degradarse con textos mas largos.
- Reproducibilidad: los resultados dependen de la semilla 0, el orden de datos y el hardware "ADA" en fp16; pueden variar en otro hardware.
- Sin datos de quantizacion: no se documentan versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos de bajos recursos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohjkhan/babyshark-lora-baseline
- Repositorio del proyecto InterpAdapt (GitHub): https://github.com/bala-skv/InterpAdapt-Hinglish-finetuning
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de evaluacion: https://huggingface.co/datasets/satyam-arora-iiit-hyderabad/babyshark-sail2017-stage2
