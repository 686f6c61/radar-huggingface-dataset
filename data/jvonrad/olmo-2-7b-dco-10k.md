# jvonrad/OLMo-2-7B-DCO-10k

## Resumen

El modelo `jvonrad/OLMo-2-7B-DCO-10k` es un adaptador LoRA (r=128, alpha=256) entrenado sobre el modelo base `allenai/OLMo-2-1124-7B` de Ai2, un transformer decoder-only de 7B parámetros totalmente abierto. El adaptador se ha optimizado mediante DCO (Cross-Lingual Consistency Preference Optimisation), un método de aprendizaje por refuerzo sin etiquetas que busca mejorar la consistencia factual entre idiomas. Se entrenó sobre 10.000 hechos del dataset `jvonrad/PolyFact-Clean` en 12 idiomas, como parte de un estudio controlado que compara distintos objetivos de optimización (SFT, DCO, CM-Align y GRPO) sobre los mismos datos.

La relevancia de este modelo radica en abordar un problema conocido en modelos multilingües: la falta de coherencia en las respuestas a un mismo hecho cuando se pregunta en distintos idiomas. Aunque el adaptador es ligero (1,3 GB) y no modifica la arquitectura base, los resultados reportados muestran una mejora sustancial en consistencia total (TotCons) y en recuperación factual multilingüe, lo que lo convierte en una opción interesante para aplicaciones que requieren respuestas uniformes entre lenguas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base OLMo-2-1124-7B) + adaptador LoRA |
| Parametros totales | 7B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada (hereda la del modelo base OLMo-2-1124-7B) |
| Tipos de cuantizacion | No especificados; el adaptador es compatible con cuantizacion del modelo base (p.ej. bitsandbytes) |
| Idiomas soportados | en, de, es, fr, pt, id, ru, zh, ar, ja, sw, bn (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador y base) |

## Arquitectura y entrenamiento

El modelo base `allenai/OLMo-2-1124-7B` es un transformer causal de 7B parámetros, entrenado por Ai2 con datos abiertos y post-entrenado con la receta Tulu 3.1. Sobre este base se ha aplicado un adaptador LoRA de rango 128 y alpha 256, lo que permite un ajuste eficiente sin modificar los pesos originales. El entrenamiento del adaptador utiliza DCO, una variante de optimización de preferencias que no requiere etiquetas humanas: se basa en la consistencia de las respuestas generadas por el modelo en diferentes idiomas para un mismo hecho, reforzando las respuestas que son coherentes entre lenguas y penalizando las divergentes.

Los datos de entrenamiento provienen de `jvonrad/PolyFact-Clean`, un dataset curado de 10.000 hechos factuales, presentados en los 12 idiomas soportados. El entrenamiento forma parte de un diseño experimental controlado donde todos los métodos (SFT, DCO, CM-Align, GRPO) ven exactamente los mismos datos, de modo que las diferencias de rendimiento se atribuyen únicamente al objetivo de optimización. No se menciona el uso de RLHF tradicional ni de DPO; DCO es una alternativa sin etiquetas.

## Capacidades

- Mejora la consistencia factual cross-lingual: responde de forma coherente al mismo hecho en los 12 idiomas soportados, reduciendo contradicciones entre lenguas.
- Mantiene las capacidades generales del modelo base OLMo-2-7B: generación de texto, razonamiento, comprensión lectora y cierta capacidad de código (heredadas del base).
- Recuperación factual multilingüe: presenta mejoras en métricas como PolyFact y RankC@4, indicando mayor precisión al recuperar hechos concretos en contextos multilingües.
- Generación de texto libre en 17 idiomas (7 vistos en entrenamiento y 10 no vistos), con mejoras tanto en idiomas conocidos como en held-out, aunque con menor magnitud en estos últimos.
- No se reporta soporte específico para tool calling, agentes o razonamiento multi-paso; estas capacidades dependen del modelo base y no se han evaluado explícitamente en este adaptador.

## Casos de uso

- Localización de productos y servicios: generar descripciones de productos, políticas o documentación técnica que sean consistentes en varios idiomas, evitando discrepancias que confundan a usuarios internacionales.
- Verificación de hechos multilingüe: dado un hecho, el modelo puede producir respuestas uniformes en 12 idiomas, útil para sistemas de fact-checking que operan en múltiples mercados.
- Asistentes virtuales multilingües: integrar el adaptador en un chatbot para que las respuestas a preguntas factuales sean coherentes independientemente del idioma del usuario, mejorando la confianza del cliente.
- Generación de contenido periodístico o enciclopédico: redactar artículos breves en varios idiomas manteniendo la misma información factual, reduciendo el trabajo de revisión manual.
- Sistemas de soporte técnico: responder a consultas frecuentes sobre productos o servicios con información consistente en todos los idiomas soportados, minimizando errores de traducción.
- Evaluación de consistencia en pipelines de NLP: usar el adaptador como herramienta para medir y mejorar la coherencia cross-lingual de otros modelos o sistemas de generación.

## Benchmarks y rendimiento

La model card del autor reporta la siguiente evaluación (accuracy en %, salvo indicación). PolyFact-Clean es el split de test curado con 2.039 hechos y scoring por log-verosimilitud normalizada por bytes; TotCons es el porcentaje de hechos respondidos correctamente en los 12 idiomas; RankC es RankC@4 (azar 37,68); KLAR es generación de forma libre sobre 17 idiomas, separados en 7 vistos y 10 no vistos.

| Modelo | PolyFact | TotCons | RankC | BMLAMA-53 | G-MMLU-Lite | KLAR seen | KLAR held-out |
|---|---|---|---|---|---|---|---|
| Base (`allenai/OLMo-2-1124-7B`) | 44,43 | 1,72 | 57,29 | 17,89 | 44,45 | 24,56 | 13,30 |
| **Este modelo (DCO-10k)** | 45,58 | 6,42 | 63,23 | 20,39 | 44,84 | 30,85 | 17,32 |

Se observa una mejora notable en TotCons (de 1,72 a 6,42) y en KLAR seen (+6,29 puntos), mientras que en G-MMLU-Lite el cambio es marginal. No se han publicado resultados comparativos con otros adaptadores de la misma familia (SFT, CM-Align, GRPO) en esta model card.

## Requisitos de hardware

- El adaptador LoRA requiere cargar el modelo base de 7B en memoria. En bfloat16, el base ocupa aproximadamente 14 GB de VRAM, por lo que se necesita una GPU con al menos 16 GB (p.ej. RTX 4080, RTX 4090, A100 40GB).
- Con cuantización del modelo base (por ejemplo, 4-bit con bitsandbytes), el uso de VRAM puede reducirse a unos 5-6 GB, permitiendo ejecución en GPUs consumer como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB).
- El adaptador en sí es pequeño (1,3 GB en disco) y se carga en memoria junto al base; no añade una carga significativa de VRAM adicional.
- Para despliegue en producción, se recomienda usar `transformers` con `peft` (como en el ejemplo de la model card) o servidores de inferencia que soporten LoRA, como vLLM (con soporte experimental para adaptadores) o TGI (Text Generation Inference).
- La latencia es similar a la del modelo base de 7B; en una GPU A100 se pueden esperar decenas de tokens por segundo, dependiendo del batch y la longitud de contexto. No se han publicado cifras concretas para este adaptador.

## Comparativa con modelos similares

No se dispone de datos públicos de otros adaptadores multilingües entrenados con los mismos datos y metodología (SFT, CM-Align, GRPO) para una comparación directa. La comparación más relevante es contra el modelo base sin adaptador, que se muestra en la tabla de benchmarks. Como referencia de la familia OLMo 2, el blog de Ai2 indica que OLMo 2 7B supera a Llama-3.1 8B en tareas generales, pero no hay métricas específicas de consistencia cross-lingual para otros modelos. Por tanto, la comparativa con alternativas externas se considera no disponible.

## Limitaciones y advertencias

- El adaptador se ha entrenado únicamente sobre 10.000 hechos de `PolyFact-Clean`; su capacidad de generalización a otros dominios factuales o estilos de pregunta no está garantizada y podría degradar el rendimiento en tareas fuera de ese ámbito.
- La mejora en consistencia se concentra en los 12 idiomas de entrenamiento; en idiomas no vistos (los 10 held-out de KLAR) la mejora es menor, lo que sugiere una transferencia limitada.
- No se han evaluado sesgos sociales o culturales del adaptador; al heredar los del modelo base, podría amplificar estereotipos o producir respuestas inapropiadas en contextos sensibles.
- El riesgo de alucinación persiste, especialmente en hechos poco representados en los datos de entrenamiento; la consistencia entre idiomas no implica necesariamente veracidad.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar que el modelo base `allenai/OLMo-2-1124-7B` también cumple con los requisitos de atribución (lo hace, al ser Apache 2.0).
- Para producción, es necesario implementar un pipeline que cargue el base y el adaptador conjuntamente; no es un modelo autónomo y requiere gestión de dependencias (PEFT, transformers).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jvonrad/OLMo-2-7B-DCO-10k
- Dataset de entrenamiento: https://huggingface.co/datasets/jvonrad/PolyFact-Clean
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B
- Paper asociado (arXiv 2606.06586): https://arxiv.org/abs/2606.06586
- Blog de Ai2 sobre OLMo 2: https://allenai.org/blog/olmo2
- Repositorio oficial de OLMo: https://github.com/allenai/OLMo
