# RenormalizationTech/Qwen3-4B-tuneLLM-PRL-Writing-QLoRA

## Resumen

Qwen3-4B-tuneLLM-PRL-Writing-QLoRA es un adaptador LoRA experimental publicado por RenormalizationTech sobre una variante cuantizada en NF4 del modelo Qwen3-4B de Alibaba. Se trata de un ajuste fino adicional (QLoRA con rango 128 y alpha 256) orientado a la generacion de texto con estilo de articulos cientificos de Physical Review Letters (PRL), entrenado sobre un corpus de 100 papers limpiados en LaTeX. El autor lo etiqueta explicitamente como experimental y advierte que no se ha demostrado una mejora real en la calidad de escritura humana.

El modelo no es un modelo base autonomo: es un adaptador PEFT que requiere el repositorio `RenormalizationTech/Qwen3-4B-tuneLLM-NF4` en un commit concreto (`e9af208e...`), que a su vez deriva de `Qwen/Qwen3-4B` en el commit `1cfa9a72...`. La relevancia de esta ficha es doble: por un lado documenta un caso de ajuste fino cientifico de nicho; por otro, es un ejemplo inusual de publicacion transparente de resultados negativos o ambiguos (regresion medible en GSM8K), algo poco frecuente en el ecosistema Hugging Face.

El adaptador tiene un tamano de repositorio de 1,1 GB, licencia Apache 2.0 y solo 7 descargas en el momento de la consulta, lo que lo situa en la categoria de artefacto de investigacion mas que de modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA all-linear sobre base NF4 |
| Parametros totales | 4B (modelo base Qwen3-4B); adaptador LoRA con rango 128 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B, sin confirmar) |
| Tipos de cuantizacion | Base NF4 (bitsandbytes); adaptadores en FP32; existen variantes evaluadas q8 y q4 y GGUF del base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo); el corpus de papers es CC BY 4.0 y no queda sobrescrito por la licencia del modelo |
| Formato de pesos | safetensors (PEFT/LoRA); requiere base NF4 en revision fijada |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer decoder-only de 4.000 millones de parametros. La configuracion LoRA es all-linear con rango 128, alpha 256 y dropout 0.05, learning rate 5e-5, semilla 42 y longitud de secuencia 1024. Los pesos no cuantizados del base se mantienen en FP32 y los adaptadores se exportan en FP32; el base se restaura desde almacenamiento NF4 (bitsandbytes).

El entrenamiento se realizo sobre un corpus de 100 papers de PRL limpiados: se eliminaron comentarios, bloques ocultos, autores, financiacion y material final, preservando ecuaciones, citaciones y macros. Los splits preparados son 70/10/20. El adaptador exportado corresponde a la epoca 1, paso 69, con 522.380 tokens de perdida; la ejecucion completa contemplaba 3 epocas, 207 pasos y 1.567.140 tokens de perdida. No se menciona RLHF ni DPO; el objetivo es modelado de lenguaje causal continuado sobre texto cientifico. Como innovacion metodologica destaca la publicacion de un control BF16 y de mediciones pareadas de NLL sobre papers retenidos, ademas de la divulgacion explicita de regresiones.

## Capacidades

- Generacion de texto causal en estilo de articulo cientifico (LaTeX de PRL), con preservacion de ecuaciones y citaciones en el corpus de entrenamiento.
- Razonamiento de opcion multiple en dominios general y fisica (subconjuntos locales, no leaderboards oficiales).
- Aritmetica basica tipo GSM8K, aunque con regresion medible respecto al base NF4.
- Seguimiento de instrucciones con formato estricto (IFEval con scorer oficial fijado).
- Capacidades heredadas de Qwen3-4B (multilingues, tool calling, agentes): no verificadas ni documentadas en esta ficha.
- No se documenta vision, audio ni modo thinking especifico en la informacion disponible.

## Casos de uso

- Investigacion sobre ajuste fino cientifico: sirve como punto de partida reproducible para estudiar como el QLoRA sobre LaTeX afecta a NLL y a benchmarks generales, con datos, manifiestos y entorno fijado incluidos.
- Generacion de borradores de secciones de papers: el adaptador reduce la perplejidad sobre papers retenidos (de 7,21 a 5,66) y puede emplearse para producir texto preliminar en estilo PRL, siempre con revision humana.
- Estudio de regresiones por especializacion: util para analizar el trade-off entre ajuste de dominio (mejora en NLL) y degradacion en matematicas (GSM8K de 117/128 a 111/128).
- Reproducibilidad y auditoria de pipelines QLoRA: el paquete `reproduction.zip`, `environment.lock.txt` y los fixtures congelados permiten replicar el flujo completo sin reconsultar fuentes vivas.
- Analisis de calibracion y fidelidad en generacion cientifica: los flags automaticos de fidelidad (0 en zero-shot base, 3 en adaptador, 7 en control BF16) permiten estudiar el efecto del ajuste en la fidelidad factual.
- Comparativa de representaciones de cuantizacion: las condiciones nf4, bf16, q8 y q4 con los mismos fixtures permiten evaluar el impacto de la cuantizacion en tareas de razonamiento y escritura.
- Docencia y formacion en ajuste fino: ejemplo realista de configuracion LoRA all-linear con rango alto y de publicacion de resultados negativos.

## Benchmarks y rendimiento

Resultados publicados por el autor (subconjuntos locales, no leaderboards oficiales):

| Condicion | general_mc | physics_mc | gsm8k | ifeval | writing (flags fidelidad) |
|---|---|---|---|---|---|
| nf4_base | 85/128 | 63/96 | 117/128 | 24/32 | 60/60; 0 flags |
| nf4_adapter (este) | 93/128 | 67/96 | 111/128 | 23/32 | 60/60; 3 flags; 1 cap |
| bf16_base | 92/128 | 63/96 | 119/128 | 24/32 | 60/60; 0 flags |
| bf16_control | 95/128 | 64/96 | 114/128 | 25/32 | 60/60; 7 flags |
| bf16_gguf | 92/128 | 62/96 | 119/128 | 25/32 | no disponible |
| q8 | 89/128 | 61/96 | 121/128 | 25/32 | no disponible |
| q4 | 89/128 | 61/96 | 116/128 | 24/32 | no disponible |

Perplejidad y NLL sobre papers retenidos:

| Condicion | NLL | Perplejidad |
|---|---:|---:|
| nf4_base | 1,974938 | 7,206173 |
| nf4_adapter | 1,733950 | 5,662979 |
| bf16_base | 1,929116 | 6,883423 |
| bf16_control | 1,713637 | 5,549108 |
| nf4_repeat | 1,733926 | 5,662842 |

El autor senala que MMLU usa subconjuntos locales zero-shot de verosimilitud, GSM8K usa fallback numerico e IFEval el scorer oficial estricto; no son puntuaciones de leaderboard estandar. La NLL mide ajuste, no calidad de escritura ni capacidad de benchmark.

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa aproximadamente 1,1 GB; el base Qwen3-4B en NF4 requiere en torno a 3-4 GB adicionales, aunque esta cifra no se detalla en la informacion disponible.
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 4090 (24 GB) o A100/H100 son suficientes para el base NF4 con contexto moderado.
- Cabe en GPU de consumo: si, el base en NF4 es viable en GPUs con 8-12 GB o mas, aunque no hay mediciones publicadas de latencia ni throughput.
- Opciones de despliegue: PEFT con bitsandbytes (requerido por la base NF4); el base cuenta con variantes GGUF, q8 y q4 evaluadas, lo que sugiere compatibilidad con llama.cpp/Ollama para el base, no confirmada para el adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B (base) | 4B | no disponible aqui | Generalista | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen3-4B-tuneLLM-NF4 (base de este adaptador) | 4B | no disponible | Generalista cuantizado NF4 | Apache 2.0 | Repo del mismo autor |
| Este adaptador (PRL Writing QLoRA) | 4B + LoRA r128 | no disponible | Escritura cientifica PRL | Apache 2.0 | Repo del autor, 7 descargas |
| Alternativas de ajuste cientifico de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparaciones con otros adaptadores cientificos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que no se ha establecido una mejora en la calidad de escritura humana; la evaluacion humana queda diferida.
- Regresion medida en GSM8K: de 117/128 (base NF4) a 111/128 (adaptador); en formato estricto, de 97 a 106 aciertos.
- Aumento de flags automaticos de fidelidad en escritura: 3 en el adaptador frente a 0 en el base NF4 y 7 en el control BF16.
- IFEval baja de 24/32 a 23/32; no hay mejora consistente en seguimiento de instrucciones.
- Riesgo de alucinacion en contenido cientifico: el modelo no garantiza correccion cientifica, novedad ni originalidad.
- El texto limpio no es LaTeX compilable de forma autonoma; el corpus puede preceder a la version final de los papers.
- El split de test esta publicado, por lo que futuras evaluaciones sobre estos items ya no son held-out limpios.
- Dependencia estricta de un commit concreto del base NF4; no funciona con el Qwen3-4B upstream directamente.
- Licencia del corpus (CC BY 4.0) no queda sobrescrita por la Apache 2.0 del modelo; el uso comercial del texto generado debe revisarse.
- Artefacto experimental con muy baja adopcion (7 descargas, 0 likes); no recomendado para produccion sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RenormalizationTech/Qwen3-4B-tuneLLM-PRL-Writing-QLoRA
- Modelo base NF4: https://huggingface.co/RenormalizationTech/Qwen3-4B-tuneLLM-NF4
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-4B
- Paper original de Qwen3: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada
