# Mercity/creative-writing-llm

## Resumen

`Mercity/creative-writing-llm` es un adaptador LoRA desarrollado por Mercity Research sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de 4.000 millones de parámetros. El objetivo del proyecto es investigar si el post-entrenamiento con aprendizaje por refuerzo puede aumentar la diversidad semántica en la generación de historias cortas sin sacrificar calidad, abordando el problema del colapso de modo (mode collapse) que sufren los modelos generativos al producir respuestas repetitivas ante un mismo prompt.

El repositorio contiene artefactos de un estudio controlado con múltiples brazos experimentales: E0 (solo calidad), E1 (calidad + desviación por muestra), E2 (calidad + desviación + contribución marginal al log-determinante), E3 (DPO multi-positivo) y E4a/E4b (DivPO). Sin embargo, solo el brazo E0 ha completado el entrenamiento completo (300 pasos); E1 está parcialmente entrenado (200 de 300 pasos) y los demás solo tienen configuraciones o pares de preferencia. El adaptador publicado corresponde al checkpoint final de E0, que optimiza únicamente la calidad según un juez externo, sin incluir aún las recompensas de diversidad.

La relevancia de este modelo radica en su enfoque metodológico: documenta con telemetría detallada cómo la calidad mejora con RL (de 6.557 a 6.860 en la puntuación del juez) mientras la diversidad permanece plana, y propone canales de recompensa per-sample para corregir esa deficiencia. Es un artefacto de investigación más que un modelo listo para producción, pero ofrece lecciones valiosas para quienes trabajan en generación creativa y control de diversidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-4B-Instruct-2507 (Transformer decoder-only) |
| Parametros totales | 4B (modelo base) + adaptador LoRA de tamaño no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta contexto largo, pero no se especifica en la documentación) |
| Tipos de cuantizacion | no disponible (el adaptador está en safetensors; el modelo base puede cuantizarse, pero no se indica) |
| Idiomas soportados | no disponible (el juez y los embeddings usan inglés, lo que sugiere foco en inglés, pero no se documenta) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) y archivos JSON de configuración |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica con r=32, alpha=64 y dropout 0.0 sobre todas las proyecciones de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento usa GRPO vía TRL 1.10 con agregación multi-objetivo `normalize_then_sum`, que implementa GDPO (arXiv 2601.05242): cada canal de recompensa se normaliza dentro de su grupo de prompts antes de sumarse, y la ventaja se normaliza por lote. La generación se realiza con vLLM colocado en el mismo proceso de entrenamiento, con G=8 muestras por prompt, `max_completion_length=1024`, learning rate 3e-5, beta KL 0.02 y 300 pasos.

Los canales de recompensa incluyen: calidad (puntuación del juez `deepseek-v4-flash-0731` vía OpenRouter, calibrado previamente), desviación (distancia media de embeddings entre una muestra y el resto de su grupo, usando `BAAI/bge-base-en-v1.5`, solo si la calidad ≥ tau=5) y contribución marginal al log-determinante del grupo (z-score dentro del grupo). Una innovación clave es que cada crédito de diversidad es per-sample, evitando el fallo de varianza cero que ocurre cuando una métrica a nivel de conjunto se comparte por todo el grupo. Además, hay compuertas programáticas que filtran textos incompletos, fuera de la ventana de 150–600 palabras o con bucles de 4-gramas antes de que lleguen al juez.

## Capacidades

- Generación de historias cortas con control de calidad: el adaptador E0 mejora la puntuación del juez en +0.30 puntos tras 300 pasos de GRPO, manteniendo la diversidad plana (efecto esperado en un brazo de solo calidad).
- Diversidad semántica limitada: el modelo base produce una media de rango efectivo de 2.006 sobre 16 muestras por prompt, es decir, solo dos direcciones semánticas útiles; el adaptador E0 no corrige esto (rango efectivo 1.712 al paso 300).
- Generación de texto general: al estar basado en Qwen3-4B-Instruct-2507, hereda capacidades de chat, razonamiento y generación de código, aunque el adaptador está específicamente entrenado para escritura creativa.
- No se documentan capacidades de tool calling, agentes, visión o audio en la model card.

## Casos de uso

- Generación de borradores de ficción: el modelo puede producir múltiples versiones de una misma premisa narrativa, útil para escritores que necesitan explorar alternativas. La calidad del texto es aceptable (puntuación del juez ~6.86), aunque la diversidad entre variantes es baja en el adaptador E0.
- Lluvia de ideas de tramas: al muestrear varias veces con el mismo prompt, se obtienen ideas base que, aunque semánticamente similares, pueden servir como punto de partida para desarrollar giros argumentales.
- Creación de contenido para juegos de rol: generación de descripciones de escenarios, personajes o eventos con un tono consistente, aprovechando el control de calidad del juez.
- Asistencia para escritura terapéutica o diarios guiados: el modelo puede redactar reflexiones o narrativas personales con un estilo coherente, aunque sin garantías de diversidad.
- Evaluación de métricas de diversidad en pipelines de generación: los artefactos del repo (pool de 16.000 historias, telemetría de recompensas) permiten reproducir el estudio y usar el adaptador como referencia para medir colapso de modo.
- Investigación en RLHF para creatividad: el modelo y su documentación sirven como caso de estudio para implementar recompensas de diversidad per-sample en GRPO, con utilidad para equipos que trabajan en post-entrenamiento de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye métricas internas del estudio de entrenamiento, que se resumen a continuación:

| Paso | Calidad del juez | Rango efectivo | Desviación media |
|---|---|---|---|
| 0 (base) | 6.65 | 1.677 | 0.130 |
| 100 | 6.78 | 1.655 | 0.128 |
| 200 | 6.75 | 1.700 | 0.135 |
| 300 | 7.03 | 1.712 | 0.139 |

Además, en la pool de 16.000 historias generadas con la política base, se observa un rango efectivo medio de 2.006 (techo de 16) y una distancia media entre pares de 0.132 (similaridad coseno de ~0.87). El brazo E0 completo muestra una mejora de calidad de 6.557 a 6.860 (primer vs. último cuarto del run) mientras la diversidad se mantiene estable (desviación media 0.1354 → 0.1391; log-det −12.81 → −12.64). Estos datos indican que el adaptador E0 no resuelve el colapso de modo, pero sirven como referencia para los brazos de diversidad aún no entrenados.

## Requisitos de hardware

- El entrenamiento se realizó en una única RTX 5090 de 32 GB, con GRPO colocado (dos copias residentes de los pesos del modelo base).
- Para inferencia, el modelo base de 4B en fp16 requiere aproximadamente 8 GB de VRAM; con cuantización 4-bit puede caber en GPUs consumer de 6–8 GB (por ejemplo, RTX 3060, RTX 4060).
- El adaptador LoRA añade una carga mínima de memoria (del orden de decenas de MB).
- Opciones de despliegue: vLLM (usado durante el entrenamiento), llama.cpp, Ollama, TGI, o cualquier framework compatible con PEFT.
- No se proporcionan datos de latencia o throughput en la documentación.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información proporcionada. Como referencia estructural, el modelo base Qwen3-4B-Instruct-2507 puede compararse con otros LLMs de 4B como Llama-3.2-3B, Phi-3.5-mini o Gemma-2-9B, pero no hay datos de rendimiento específicos para escritura creativa. El adaptador de Mercity es único en su enfoque de diversidad, por lo que no existe un equivalente directo en el ecosistema. Se recomienda consultar leaderboards como EQ-Bench Creative Writing v3 o LLM-Stats Creativity para posicionar el modelo base en tareas creativas, aunque el adaptador no ha sido evaluado en ellos.

## Limitaciones y advertencias

- El adaptador publicado (E0) solo optimiza calidad, no diversidad; los brazos de diversidad (E1–E4) no están completos o no han sido entrenados. No debe interpretarse que este modelo resuelve el colapso de modo.
- El juez de calidad es un modelo externo (`deepseek-v4-flash-0731`) que puede introducir sesgos en la evaluación; la calibración se realizó solo contra cuatro celdas conocidas.
- El entrenamiento se realizó en inglés (embeddings `bge-base-en-v1.5`), por lo que el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos generativos; las compuertas programáticas filtran textos degenerados durante el entrenamiento, pero no en inferencia.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigación con documentación parcial; no hay garantías de robustez en producción.
- El repositorio contiene datos de telemetría y pools de generación que pueden incluir contenido no filtrado; se recomienda revisión antes de usar.

## Enlaces

- [HuggingFace: Mercity/creative-writing-llm](https://huggingface.co/Mercity/creative-writing-llm)
- [Sitio web de Mercity Research](https://www.mercity.ai/)
- [Paper GDPO (arXiv 2601.05242)](https://arxiv.org/abs/2601.05242) (referenciado en la model card)
- [EQ-Bench Creative Writing v3 Leaderboard](https://eqbench.com/creative_writing.html)
- [LLM-Stats Creativity Leaderboard](https://llm-stats.com/benchmarks/category/creativity)
