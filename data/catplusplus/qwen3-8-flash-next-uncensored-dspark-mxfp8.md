# catplusplus/Qwen3.8-Flash-Next-uncensored-DSpark-MXFP8

## Resumen

Qwen3.8-Flash-Next-uncensored-DSpark-MXFP8 es un modelo borrador (draft model) de decodificación especulativa del algoritmo DSpark, publicado por el usuario catplusplus en Hugging Face. No es un modelo generativo autónomo: se acopla a un modelo objetivo (`catplusplus/Qwen3.8-Flash-Next-uncensored-NVFP4-mixed`, servido como "Nikola") para acelerar la decodificación prediciendo varios tokens por paso, que el modelo objetivo verifica después. Su función es, por tanto, puramente de aceleración de inferencia en producción.

El modelo consta de 5 capas (664,6 millones de parámetros) que leen estados ocultos multi-tap de las capas `[1, 12, 23, 34, 45]` del modelo objetivo y comparten su embedding y su `lm_head`. La innovación principal es una cuantización selectiva W8A8 MXFP8 (formato OCP con bloques de escala E8M0 de tamaño 32) aplicada únicamente a las 15 proyecciones lineales de las MLP, manteniendo en BF16 la atención, las normas, el proyector multi-tap y las cabezas Markov/confianza. El resultado es un checkpoint de 967,3 MB (frente a 1.329 MB en BF16) sin degradación medible gracias a un entrenamiento QAT real con estimador de gradiente directo (STE).

Es relevante ahora porque demuestra que la cuantización selectiva con QAT en modelos borrador de decodificación especulativa puede reducir huella de memoria y, a la vez, mejorar el throughput end-to-end: en las pruebas del autor sobre una NVIDIA Thor con 128 GB de LPDDR5X unificada se reportan incrementos de hasta el 22,1 % en velocidad de decodificación frente a la línea base. Está pensado para despliegues SGLang con el algoritmo DSPARK y block-size 5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 5 capas como draft model de decodificación especulativa (DSpark); lee estados ocultos multi-tap de las capas [1, 12, 23, 34, 45] del modelo objetivo y comparte embedding y lm_head con este |
| Parametros totales | 664.569.857 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como valor propio; entrenado con contextos de 0 a 64K+ y validado en sesiones de 38K-73K del modelo objetivo, que se sirve con `--context-length 262144` |
| Tipos de cuantizacion | MXFP8 W8A8 selectivo (OCP, bloques [1, 32] con escala E8M0) en las 15 proyecciones MLP; BF16 en atención, normas, proyector `fc` y cabezas Markov/confianza |
| Idiomas soportados | no disponible (entrenado con datos EN/JP y rollouts multi-idioma) |
| Licencia | qwen-community-1.0 (etiquetada como `other` en la model card) |
| Formato de pesos | safetensors (librería sglang, `modelopt_mixed`, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un borrador DSpark de 5 capas que no procesa tokens desde cero: consume los estados ocultos multi-tap extraídos de cinco capas del modelo objetivo y comparte con este el embedding de entrada y el `lm_head` de salida. Esta compartición explica su reducido tamaño (664,6 M de parámetros). La cuantización es selectiva: solo las 15 proyecciones lineales MLP (`layers.{0..4}.mlp.{gate_up_proj, down_proj}`) están en MXFP8, mientras que el proyector multi-tap (`fc`), la atención, las normas y las cabezas Markov/confianza permanecen en BF16. El autor justifica esta elección con un barrido empírico: cuantizar `fc` o `self_attn` costaba entre 1,1 y 1,3 tok/s, y un block-size 7 perdía unos 4 tok/s en LPDDR5X unificada.

El entrenamiento se hizo en dos etapas sobre un corpus on-policy de 2.092.058 tokens (766 secuencias) generado por el modelo objetivo, incluyendo sesiones reales de agente de código OpenCode de 16K a 73K tokens (con una sesión reservada de 38K-73K estrictamente excluida), chats EN/JP con tool calling a temperatura 0,6 y rollouts de contexto corto como ancla. La etapa 1 consistió en LoRA (r=64, alpha=128) en BF16 durante 8 épocas, con `q_norm`/`k_norm` descongelados y LR atenuado 0,25× en el proyector `fc`, con entrenamiento multi-ancla por lotes de 0 a 64K+. La etapa 2 aplicó 2 épocas de QAT W8A8 MXFP8 real con STE, simulando cuantización de pesos y de activaciones dinámicas por bloque de 32, antes de fijar los pesos al formato OCP MXFP8. La longitud de aceptación simulada en validación pasó de 2,52 a 4,86 en contexto corto (<8K) y de 2,69 a 3,01 en contexto largo (≥8K), con pérdidas de 3,9757 → 1,7690 y 4,0451 → 3,0695 respectivamente.

## Capacidades

- Predicción especulativa de tokens para decodificación acelerada del modelo objetivo `catplusplus/Qwen3.8-Flash-Next-uncensored-NVFP4-mixed` con el algoritmo DSPARK.
- Soporte de block-size 5 (configuración óptima según el autor) y evaluación también con block-size 7.
- Manejo de sesiones largas de agente de código con razonamiento `<think>`, resúmenes y llamadas a herramientas en JSON.
- Adaptado a la cadencia de tool calling del parser `qwen3_coder` y al parser de razonamiento `qwen3`.
- Entrenado con datos EN/JP y rollouts multi-idioma, aunque no se declara una lista formal de idiomas soportados.
- No es un modelo generativo autónomo: no responde prompts por sí mismo, no tiene visión, audio ni modo thinking propio; hereda el comportamiento del modelo objetivo.

## Casos de uso

- Aceleración de servidores SGLang en producción: se lanza como `--speculative-draft-model-path` junto al modelo objetivo con `--speculative-algorithm DSPARK --speculative-dspark-block-size 5`, logrando hasta un 22,1 % más de throughput en chats de asistente EN/JP con decodificación en streaming.
- Agentes de código de contexto largo: en sesiones OpenCode de 38K a 73K tokens con thinking activado y temperatura 0,6, el autor reporta 26,84 tok/s frente a 23,81 tok/s de la línea base (+12,7 %), con un pico de 29,43 tok/s a 73K.
- Edición de código interactiva: la tarea `opencode_edit` alcanza 52,89 tok/s (+5,2 %) y `code_lru` 54,70 tok/s (+13,6 %) a temperatura 0,0, adecuado para asistentes de edición en IDE.
- Generación de tool calls JSON: `tool_call_json` sube a 42,67 tok/s (+8,3 %) a temperatura 0,0 y a 36,69 tok/s (+13,3 %) a temperatura 0,6, útil en pipelines de agentes que encadenan funciones.
- Traducción y asistentes en japonés: `jp_translation` mejora un 14,4 % (29,10 tok/s) y `quick_jp` un 19,9 % (23,49 tok/s), relevante para productos con base de usuarios japonesa.
- Búsqueda aumentada con herramientas: `tool_search` alcanza 27,56 tok/s (+24,9 %), apropiado para agentes RAG que intercalan recuperación y generación.
- Despliegue en hardware de borde con memoria unificada: validado en una NVIDIA Thor (`sm_110`, 128 GB LPDDR5X) con caché PLE en NVMe, lo que permite servir el modelo objetivo cuantizado en NVFP4 con aceleración especulativa en un único dispositivo.

## Benchmarks y rendimiento

Resultados end-to-end verificados por el autor en una NVIDIA Thor (128 GB LPDDR5X unificada) con SGLang, block-size 5 y caché PLE en NVMe:

| Suite | Baseline | DSpark V2 QAT-MXFP8-MLP | Mejora |
|---|---|---|---|
| Short 5-Prompt (temp=0.0) | 37,71 tok/s (BF16 DSpark stock) | 41,55 tok/s | +10,2 % |
| Short 5-Prompt (temp=0.6) | 31,85 tok/s (BF16 DSpark stock) | 33,09 tok/s | +3,9 % |
| EN/JP Assistant & Tool Chats (temp=0.6, streaming) | 19,98 tok/s (pre-V2) | 24,40 tok/s | +22,1 % |
| OpenCode held-out (38K-73K ctx, thinking ON, temp=0.6) | 23,81 tok/s (pre-V2) | 26,84 tok/s | +12,7 % |

Resultados por tarea destacados: `code_lru` 54,70 tok/s (+13,6 %), `opencode_edit` 52,89 tok/s (+5,2 %), `tool_call_json` 42,67 tok/s (+8,3 %) y `chat_explain` 41,45 tok/s (+8,0 %) a temperatura 0,0; `jp_translation` 29,10 tok/s (+14,4 %) y `tool_call_json` 36,69 tok/s (+13,3 %) a temperatura 0,6; `quick_en` 23,28 tok/s (+31,0 %), `tool_search` 27,56 tok/s (+24,9 %), `quick_jp` 23,49 tok/s (+19,9 %) y `deep` 24,77 tok/s (+17,9 %) en chats EN/JP. En OpenCode held-out, el tramo de 38K pasa de 20,48 a 26,87 tok/s (+31,2 %) y el de 73K alcanza 26,67 tok/s con pico de 29,43 tok/s.

No se han publicado resultados de benchmarks de calidad de modelo (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo autónomo.

## Requisitos de hardware

- VRAM/disco: el checkpoint ocupa 967,3 MB en disco (frente a 1.329 MB en BF16), con un ahorro de 361,9 MB. La memoria de trabajo en inferencia debe sumarse a la del modelo objetivo.
- GPU validadas: NVIDIA Thor (`sm_110`, 128 GB de LPDDR5X unificada). No se han publicado pruebas en A100, H100, RTX 4090 ni otras GPU de consumo.
- Cabe en GPU de consumo por tamaño del borrador, pero el requisito real lo impone el modelo objetivo NVFP4 (no cuantificado para consumer) y la build de SGLang necesaria; no hay datos publicados al respecto.
- Despliegue: exclusivamente SGLang, con una build que incluya captura auxiliar de estados ocultos multi-tap `qwen4_exp` y soporte `modelopt_mixed` MXFP8 para las capas MLP del DSpark. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: entre 24,40 y 41,55 tok/s según suite y temperatura en Thor; mejora de aceptación de longitud de 2,52 a 4,86 tokens en contexto corto y de 2,69 a 3,01 en contexto largo (block-size 5).
- Latencia: no disponible de forma desagregada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-uncensored-DSpark-MXFP8 (este) | 664,6 M | 0-64K+ entrenamiento; objetivo a 262.144 | Draft DSpark MXFP8 selectivo | qwen-community-1.0 | Hugging Face, SGLang |
| shadowpa0327/Qwen3.8-Flash-Next-DSpark | no disponible | no disponible | Draft DSpark base (BF16) | no disponible | Hugging Face |
| Draft BF16 stock del modelo objetivo | no disponible | no disponible | Draft DSpark de referencia | no disponible | Uso interno en las pruebas del autor |
| catplusplus/Qwen3.8-Flash-Next-uncensored-NVFP4-mixed | no disponible | 262.144 | Modelo objetivo NVFP4 | qwen-community-1.0 | Hugging Face, SGLang |

No se dispone de datos de benchmarks de calidad para comparar con otros borradores especulativos de la misma categoría; la única comparación publicada es de throughput frente al DSpark BF16 stock y a la línea base pre-V2, recogida en la sección anterior.

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona acoplado al modelo objetivo `catplusplus/Qwen3.8-Flash-Next-uncensored-NVFP4-mixed` y al algoritmo DSPARK; no puede usarse con otros modelos ni con otros algoritmos especulativos.
- Requiere una build específica de SGLang con captura multi-tap `qwen4_exp` y soporte `modelopt_mixed` MXFP8; no hay soporte en vLLM, llama.cpp, Ollama ni TGI.
- El modelo objetivo se declara "uncensored", por lo que hereda sus riesgos de contenido: ausencia de filtros de seguridad y posible generación de material dañino o sesgado. No se documentan sesgos específicos del borrador.
- Riesgo de alucinación: el borrador propone tokens que el modelo objetivo verifica, de modo que no introduce contenido por sí mismo, pero una tasa de aceptación baja degrada el throughput en lugar de la calidad.
- Idiomas: no se declara una lista formal; el entrenamiento se centró en EN/JP, por lo que el rendimiento en otros idiomas no está verificado.
- Licencia `qwen-community-1.0` (etiquetada como `other`): es necesario revisar los términos del enlace de licencia de Qwen antes de uso comercial; la model card no aclara restricciones adicionales del autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni validación externa independiente de los resultados.
- Los benchmarks provienen únicamente del autor y de un solo dispositivo (NVIDIA Thor); no hay reproducciones independientes en otras GPU.
- La fecha de creación del repositorio (2026-11-25) y la referencia a "Qwen3.8" no coinciden con versiones públicas conocidas de Qwen; conviene verificar la procedencia antes de desplegar en producción.

## Enlaces

- Hugging Face: https://huggingface.co/catplusplus/Qwen3.8-Flash-Next-uncensored-DSpark-MXFP8
- Modelo objetivo: https://huggingface.co/catplusplus/Qwen3.8-Flash-Next-uncensored-NVFP4-mixed
- Modelo base DSpark: https://huggingface.co/shadowpa0327/Qwen3.8-Flash-Next-DSpark
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
