# elrashid/gate-qwen3-8b-l18

## Resumen

Gate-Qwen3-8B-L18 es un modelo derivado de Qwen/Qwen3-8B, publicado por el autor elrashid (M. Elrashid, BUiD) y orientado a tareas de seguridad en IA (guardrails) y clasificación de prompts. El modelo se presenta como un mecanismo de compuerta ("gate") construido sobre las representaciones internas del modelo base, apoyándose en un autoencoder disperso (SAE) entrenado sobre la corriente residual de la capa 18 de Qwen3-8B. Su propósito es servir como filtro ligero para detectar o clasificar entradas potencialmente problemáticas antes de que lleguen a un modelo generativo.

El modelo se enmarca en el trabajo "The Refusal Slope: A Mechanistic Taxonomy of Feature Fate in Quantized Edge Intelligence", que estudia cómo se transforman las características internas de un modelo al cuantizarlo. La ficha del repositorio está restringida (gated) y el tamaño del repositorio aparece como 0.0 GB, por lo que no hay información pública sobre los pesos concretos, el formato de distribución ni el pipeline de inferencia.

Por su naturaleza, no es un modelo de propósito general sino un componente de seguridad e interpretabilidad. Su relevancia actual radica en el creciente interés por guardrails basados en representaciones internas en lugar de clasificadores superficiales, y en el estudio de la fidelidad de estas señales bajo cuantización para despliegue en entornos de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3-8B (transformer denso); el componente gate se apoya en un SAE TopK sobre la corriente residual de la capa 18 |
| Parametros totales | no disponible (el modelo base Qwen3-8B tiene 8.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el trabajo asociado aborda cuantizacion para edge, sin detalle publicado en la ficha) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3-8B, un transformer denso de 8.000 millones de parámetros. El componente de compuerta se basa en un autoencoder disperso TopK entrenado sobre la corriente residual de la capa 18 del modelo base, con dimensiones d_in=4096, d_sae=65536, k=64 y un FVU (fracción de varianza no explicada) de 0,4224. El SAE asociado (elrashid/sae-qwen3-8b-topk-l18) se entrenó con la receta "v2", que incorpora BOS-drop y estandarización por dimensión.

No se dispone de información pública sobre el número de tokens de entrenamiento del gate, la composición del dataset de clasificación de prompts, ni si se emplearon técnicas de RLHF o DPO. El trabajo de referencia aborda la taxonomía mecánica de la "pendiente de rechazo" (refusal slope) y el destino de las características bajo cuantización, lo que sugiere que el entrenamiento del gate está vinculado al análisis de features del SAE y a su robustez frente a la cuantización.

## Capacidades

- Clasificación de prompts orientada a guardrails de seguridad.
- Detección de entradas potencialmente problemáticas mediante señales internas del modelo base.
- Análisis de interpretabilidad mecanicista a través de features del SAE de la capa 18.
- Estudio de la fidelidad de las señales bajo cuantización (edge intelligence).
- No se documentan capacidades de generación de texto, código, matemáticas, visión ni audio en la información disponible.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Filtrado previo de prompts en producción: el gate puede clasificar la entrada antes de enviarla a un LLM generativo, actuando como primera línea de defensa en un pipeline de moderación.
- Auditoría de seguridad de despliegues de Qwen3-8B: permite inspeccionar qué features internas se activan ante distintos tipos de prompt y correlacionarlas con comportamientos de rechazo.
- Investigación en interpretabilidad mecanicista: el SAE de la capa 18 sirve para estudiar la representación de conceptos y su evolución a lo largo del modelo.
- Evaluación de robustez frente a cuantización: útil para medir si las señales de seguridad se degradan al desplegar el modelo en hardware de borde con pesos cuantizados.
- Construcción de guardrails híbridos: combinación de clasificadores superficiales con señales internas para reducir falsos positivos y negativos.
- Docencia y reproducción de experimentos: el enfoque SAE + gate es un ejemplo didáctico de aplicación de interpretabilidad a seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; por el tamaño del modelo base (8.000 millones de parámetros) se requeriría al menos una GPU con 16-24 GB en FP16, pero no se confirma en la ficha.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base Qwen3-8B es desplegable en GPUs de consumo con cuantización, pero el gate no documenta requisitos.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gate-Qwen3-8B-L18 | no disponible (base 8B) | no disponible | Guardrail + SAE sobre capa 18 | MIT | Gated |
| Qwen/Qwen3-8B | 8B | no disponible | LLM generativo denso | no disponible | Público |
| elrashid/sae-qwen3-8b-topk-l18 | no aplica (SAE) | no aplica | Autoencoder disperso TopK | Apache-2.0 | Público |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su uso inmediato y su reproducibilidad.
- Tamaño del repositorio reportado como 0.0 GB: no hay evidencia pública de que los pesos estén efectivamente alojados.
- No se documentan idiomas soportados, lo que impide garantizar cobertura multilingüe.
- No hay benchmarks publicados que permitan evaluar su precisión como guardrail ni su tasa de falsos positivos/negativos.
- El FVU del SAE (0,4224) indica que una fracción relevante de la varianza no queda explicada, lo que puede afectar a la fiabilidad de las features como señal de seguridad.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- Licencia MIT permite uso comercial, pero el acceso gated y la ausencia de documentación técnica dificultan su integración en producción.
- El modelo está diseñado para clasificación/guardrails, no para generación; usarlo fuera de ese ámbito no está respaldado por la documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elrashid/gate-qwen3-8b-l18
- SAE asociado: https://huggingface.co/elrashid/sae-qwen3-8b-topk-l18
- Árbol de ficheros del SAE: https://huggingface.co/elrashid/sae-qwen3-8b-topk-l18/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- DOI: https://doi.org/10.57967/hf/9432
