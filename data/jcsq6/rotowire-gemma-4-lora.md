# jcsq6/rotowire-gemma-4-lora

## Resumen

Rotowire-gemma-4-lora es un conjunto de cinco adaptadores LoRA publicados por el usuario jcsq6 para convertir crónicas de partidos de la NBA en dos tablas de box-score (Team y Player) con el formato definido por Wu et al. (2022). El proyecto nace como trabajo de curso (COSC 524) con un doble objetivo: medir cuánto importan unas etiquetas de entrenamiento de mayor calidad y determinar hasta qué punto se puede reducir el tamaño del modelo sin perder precisión. Los adaptadores se montan sobre tres variantes de la familia Gemma 4 de Google (`gemma-4-E2B-it`, `gemma-4-E4B-it` y `gemma-4-12B-it`), todas de arquitectura transformer con decoder de texto.

La propuesta técnica es un ejercicio de destilación de etiquetas: los objetivos de entrenamiento no son las anotaciones originales del corpus Rotowire (supervisión distante), sino remuestreos generados por un modelo mayor ("Opus"), publicados en el dataset `jcsq6/rotowire-opus-relabel`. El resultado más relevante es que incluso el adaptador sobre el modelo más pequeño (E2B) alcanza un F1 de celda de 93,0 / 96,6 en test, frente a 0,6 / 0,5 del modelo base sin adaptador, lo que demuestra que la tarea es aprendible con muy pocos parámetros adicionales.

El repositorio ocupa 1,5 GB y contiene tanto los pesos de los adaptadores como la configuración, el historial de validación y el prompt de sistema (`schema-v1-prompt.txt`) necesario para reproducir los resultados. La licencia es Apache 2.0, heredada de las bases Gemma 4, y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (familia Gemma 4) |
| Parametros totales | Adaptadores LoRA de rango 32; el tamaño del repo es 1,5 GB (incluye cinco adaptadores). Parámetros del modelo base no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de la base Gemma 4; no especificado en la model card) |
| Tipos de cuantizacion | El adaptador 12B se entrenó con QLoRA sobre una copia 4-bit NF4 del base; se sirve sobre el base a precisión completa (bfloat16). Cuantizaciones del adaptador no disponibles |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 (adaptadores y bases Gemma 4); etiquetas de entrenamiento bajo MIT |
| Formato de pesos | safetensors (adaptadores PEFT LoRA) |
| Libreria | peft |
| Rango LoRA | 32 (alpha 32, dropout 0.05) |
| Modulos adaptados | q, k, v, o, gate, up, down del decoder de texto |
| Dataset de entrenamiento | `jcsq6/rotowire-opus-relabel` (3.393 informes de train, 726 de validación) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Los adaptadores son LoRA de rango 32 con alpha 32 y dropout 0.05, aplicados a las proyecciones de atención y MLP (q, k, v, o, gate, up, down) del decoder de texto de Gemma 4. El entrenamiento es supervised fine-tuning con la pérdida calculada únicamente sobre los tokens de respuesta (las tablas), no sobre el prompt. El schedule consiste en 2 épocas, 426 pasos de optimizador, 16 secuencias por paso, AdamW con tasa 2e-4, warmup del 3% y decaimiento coseno hasta 2e-5, semilla 1337. Los pesos publicados corresponden al checkpoint con menor pérdida de validación, que en las cinco ejecuciones fue el paso final.

La innovación principal no está en la arquitectura sino en la estrategia de datos: los adaptadores `teacher` se entrenan sobre remuestreos generados por un modelo mayor (Claude Opus 5.5) en lugar de las etiquetas originales de Wu et al., que proceden de supervisión distante. Los adaptadores `wu` sirven de control con la misma receta pero con las etiquetas originales. La diferencia medida es de 6,4 puntos de F1 en Team y aproximadamente 2,2 en Player en ambos tamaños de modelo. El adaptador de 12B se entrenó con QLoRA sobre una copia 4-bit NF4 del base y está pensado para servirse sobre el base a precisión completa, que es como se evaluó. Cada carpeta de ejecución incluye `_state/config.json` con todos los hiperparámetros y hashes de los datos y del prompt, y `_state/metrics.json` con el historial de pérdida de validación.

## Capacidades

- Extracción de información estructurada: convierte texto libre (crónicas NBA) en tablas Markdown de box-score, con dos secciones (Team y Player) y 47 nombres de columna definidos en el prompt.
- Generación de texto condicionada a un prompt de sistema estricto: requiere exactamente el contenido de `schema-v1-prompt.txt` como turno de sistema y `Report:\n` + texto como turno de usuario.
- Modo thinking desactivado: los adaptadores se entrenaron y evaluaron con `enable_thinking: false`; no se ha validado su comportamiento con thinking activado.
- Decodificación greedy: los resultados publicados usan temperatura 0 y hasta 1.536 tokens nuevos, terminando con el token de cierre de turno de Gemma.
- Multilingüismo: no disponible; solo se declara inglés y solo se ha probado con crónicas en inglés.
- Tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes o multi-step reasoning: no disponible.
- Visión, audio: no disponible.

## Casos de uso

- Extracción automatizada de box-scores: dado un informe de partido en estilo Rotowire, el adaptador genera las tablas Team y Player listas para ingesta en una base de datos o un pipeline de análisis estadístico. Es adecuado porque la tarea es exactamente la que se entrenó, con F1 de celda superior al 93% incluso en el modelo E2B.
- Enriquecimiento de corpus históricos: procesar en lote crónicas de baloncesto para construir un dataset tabular a partir de texto no estructurado, usando el adaptador de 12B (95,7 / 97,1 de F1) cuando la precisión es crítica.
- Despliegue en hardware modesto: el adaptador E2B permite ejecutar la extracción sobre GPUs de consumo, manteniendo un F1 de 93,0 / 96,6, útil para prototipos o entornos con presupuesto limitado.
- Validación de calidad de etiquetas: comparar los adaptadores `teacher` y `wu` para auditar cuánto mejora un dataset con remuestreo de un modelo mayor frente a supervisión distante, replicando el experimento del autor.
- Integración como servicio OpenAI-compatible: servir el adaptador con vLLM (`--enable-lora`) y consumirlo con el cliente OpenAI, encajándolo en aplicaciones existentes de generación de texto sin cambiar la API.
- Filtrado y normalización de datos deportivos: usar las tablas generadas como paso previo a la detección de inconsistencias (nombres de jugadores, columnas faltantes) en pipelines de datos de la NBA.
- Evaluación de robustez de formatos: el prompt de sistema fijo y el formato de salida estricto permiten medir la adherencia del modelo a esquemas, útil para estudiar fiabilidad de extracción estructurada.

## Benchmarks y rendimiento

Resultados publicados por el autor: F1 de celda con coincidencia exacta sobre las 728 crónicas del test set corregido de Map&Make Rotowire (Ahuja et al., 2025), decodificación greedy, evaluados el 19 y 20 de noviembre de 2026 con vLLM 0.32.0.

| Adaptador | Base | Etiquetas | F1 Team | F1 Player |
|---|---|---|---|---|
| `g12b-teacher-r32-q` | gemma-4-12B-it | Opus relabels | 95,7 | 97,1 |
| `e4b-teacher-r32` | gemma-4-E4B-it | Opus relabels | 94,8 | 97,1 |
| `e2b-teacher-r32` | gemma-4-E2B-it | Opus relabels | 93,0 | 96,6 |
| `e4b-wu-r32` | gemma-4-E4B-it | Wu et al. | 88,4 | 94,9 |
| `e2b-wu-r32` | gemma-4-E2B-it | Wu et al. | 86,6 | 94,3 |

Referencias sin adaptador (mismo prompt, zero-shot):

| Base | F1 Team | F1 Player |
|---|---|---|
| gemma-4-12B-it | 56,9 | 88,4 |
| gemma-4-E4B-it | 45,8 | 75,5 |
| gemma-4-E2B-it | 0,6 | 0,5 |
| Claude Opus 5.5 (zero-shot) | 95,9 | 96,3 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El adaptador de 12B se entrenó con QLoRA (base 4-bit NF4), pero se sirve sobre el base a bfloat16; el tamaño del base no está detallado en la model card.
- GPU recomendadas: no disponibles. El adaptador E2B está pensado para hardware modesto, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: probablemente viable con el adaptador E2B, pero el autor no confirma modelos ni VRAM mínima.
- Opciones de despliegue: vLLM 0.32.0 con `--enable-lora --max-lora-rank 64` y `--chat-template-content-format string`; también `transformers.generate()` (aunque el autor reporta divergencias de resultado con este backend).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | F1 Team / Player | Licencia |
|---|---|---|---|---|---|
| rotowire-gemma-4-lora (12B) | LoRA sobre Gemma 4 12B | Adaptador r32; base no disponible | No disponible | 95,7 / 97,1 | Apache 2.0 |
| rotowire-gemma-4-lora (E4B) | LoRA sobre Gemma 4 E4B | Adaptador r32; base no disponible | No disponible | 94,8 / 97,1 | Apache 2.0 |
| rotowire-gemma-4-lora (E2B) | LoRA sobre Gemma 4 E2B | Adaptador r32; base no disponible | No disponible | 93,0 / 96,6 | Apache 2.0 |
| Claude Opus 5.5 (zero-shot) | Modelo propietario | No disponible | No disponible | 95,9 / 96,3 | Propietaria |
| Gemma 4 12B base (zero-shot) | Transformer decoder-only | No disponible | No disponible | 56,9 / 88,4 | Apache 2.0 |

## Limitaciones y advertencias

- Dominio y formato únicos: solo crónicas NBA al estilo Rotowire y las 47 columnas listadas en el prompt; no se ha probado nada fuera de ese ámbito.
- Nombres de jugadores: las etiquetas de test admiten dos grafías ("JR Smith" y "J.R. Smith"); los adaptadores escriben iniciales sin puntos, lo que penaliza ligeramente las filas de Player.
- Divergencia entre backends: el mismo adaptador E2B decodificado con `transformers.generate()` en lugar de vLLM produjo tablas distintas en 64 de 728 informes de test y puntuó peor (Team 90,7 frente a 93,0). La causa no se identificó; todas las cifras publicadas provienen de vLLM.
- Dependencia estricta del prompt: el adaptador espera exactamente el prompt de sistema de `schema-v1-prompt.txt`, el prefijo `Report:\n` y thinking desactivado; cualquier variación degrada la salida.
- Formato del chat template: con vLLM es obligatorio `--chat-template-content-format string`; sin él, el template de Gemma 4 introduce un espacio antes del token de cierre del turno de sistema y el modelo recibe un prompt distinto del de entrenamiento.
- Sesgos: no documentados por el autor; al estar entrenado sobre crónicas deportivas en inglés, cabe esperar sesgos propios del corpus, pero no se han medido.
- Riesgo de alucinación: no evaluado de forma específica; el modelo puede generar filas o valores plausibles pero incorrectos fuera del dominio entrenado.
- Licencia: adaptadores Apache 2.0; las etiquetas de entrenamiento son MIT; los informes originales provienen del corpus Rotowire (Wiseman et al., 2017) y no se distribuyen en el repo.
- Uso comercial: permitido por Apache 2.0, pero conviene revisar las condiciones de las bases Gemma 4 y del corpus Rotowire antes de desplegar en producción.
- Estado del arte del proyecto: trabajo de curso con 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jcsq6/rotowire-gemma-4-lora
- Dataset de etiquetas: https://huggingface.co/datasets/jcsq6/rotowire-opus-relabel
- Prompt de sistema: https://huggingface.co/jcsq6/rotowire-gemma-4-lora/blob/main/schema-v1-prompt.txt
- Base Gemma 4 12B: https://huggingface.co/google/gemma-4-12B-it
- Base Gemma 4 E4B: https://huggingface.co/google/gemma-4-E4B-it
- Base Gemma 4 E2B: https://huggingface.co/google/gemma-4-E2B-it
- Referencia del formato de tablas: Wu et al. (2022), no disponible enlace directo en la model card
- Test set corregido Map&Make Rotowire: Ahuja et al. (2025), no disponible enlace directo en la model card
- Corpus Rotowire original: Wiseman et al. (2017), no disponible enlace directo en la model card
- Repositorio del proyecto con pipeline completo (`scripts/download_adapters.py`, `scripts/eval_finetune.py`): no disponible enlace directo en la model card
