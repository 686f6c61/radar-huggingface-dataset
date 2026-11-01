# edinlong83/sn92-generalist-h5

## Resumen

sn92-generalist-h5 es un fine-tune de tipo decision-model publicado por el usuario edinlong83 en HuggingFace, derivado de baselabs/mammoth-1, un modelo post-entrenado a partir de Qwen/Qwen3.5-27B. Con 26.085.330.160 parámetros (aproximadamente 26 mil millones) y un repositorio de 52,2 GB en safetensors, el modelo se presenta como la entrada "generalist" del subred SN92 (REAX) de Bittensor, evaluada bajo la especificación eval v5.1. Su propósito no es la generación de texto libre, sino la toma de decisiones estructuradas sobre tareas con respuesta verificable.

El modelo emplea el denominado "joint-readout layout" de REAX: un backbone Qwen3_5Model al que se le añade una cabeza de readout específica. Sobre esa base se ha aplicado una ejecución de LoRA fusionada en los pesos, junto con el ajuste de la cabeza de readout. El entrenamiento combina ítems generados proceduralmente con respuestas gold calculadas (problemas aritméticos, lógica multi-paso, salida de código Python, construcción de acordes, posiciones de ajedrez validadas con Stockfish y 15 familias de aplicación de reglas), junto con datos de etiquetado de seguridad, clasificación documental y filas de "no lo sé".

Su relevancia actual es acotada pero específica: sirve como referencia para quienes participan en el ecosistema de minería/validación de Bittensor SN92 o necesitan un modelo pequeño-mediano con capacidad de razonamiento determinista y clasificación sobre dominios muy concretos (patentes, contratos, legislación, medicina, ontologías). La licencia MIT y la trazabilidad hacia Qwen3.5-27B (Apache-2.0) facilitan su reutilización comercial, aunque la información publicada sobre rendimiento es prácticamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3_5Model backbone + readout head, layout joint-readout de REAX) |
| Parametros totales | 26.085.330.160 (~26,1 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | MIT (términos base retenidos; Qwen3.5-27B bajo Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de baselabs/mammoth-1 (commit `03007ab3c4481bf01c71ef63adbbbc4b2093d71a`), un post-entrenamiento de Qwen/Qwen3.5-27B, y conserva la estructura Qwen3_5Model como backbone. Sobre ella se sitúa una cabeza de readout propia del formato REAX, que es la que se ha ajustado de forma específica. El ajuste consiste en una única ejecución de LoRA cuyos pesos se han fusionado en el modelo final, más el entrenamiento de la mencionada cabeza de readout. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

Los datos de entrenamiento descritos son heterogéneos y orientados a evaluación con respuesta gold: ítems generados proceduralmente con solución calculada (aritmética verbal, lógica multi-paso, salida de código Python, construcción de acordes, posiciones de ajedrez con gold de Stockfish y 15 familias de aplicación de reglas sobre tarifas, políticas, tasas, elegibilidad y planificación); 600 filas de etiquetado de seguridad construidas a partir de prompts de NVIDIA Aegis 2.0 (CC BY 4.0) con plantillas de rechazo fijas; 1.555 ítems de documento a categoría oficial construidos a partir de registros públicos etiquetados (patentes con secciones CPC de ccdv/patent-classification, provisiones contractuales LEDGAR, áreas de conflicto del Tribunal Supremo y holdings CaseHOLD de coastalcph/lex_glue, clases de ontología DBpedia de fancyzhx/dbpedia_14, categorías de condición de TimSchopf/medical_abstracts, y clasificadores de estado de desarrollo y temática de la API JSON de PyPI); filas de "no lo sé" derivadas de preguntas de ARC, OpenBookQA y SuperGPQA que decisionmodels/reax-1.1 respondió de forma incorrecta o insegura; y filas de decisionmodels/sn92-generalist-train-v1 (CC BY 4.0). Cada conjunto se usa bajo sus propios términos, según indica el autor.

## Capacidades

- Razonamiento aritmético verbal y resolución de problemas de palabras con respuesta calculada.
- Razonamiento lógico multi-paso sobre reglas explícitas.
- Generación y verificación de salida de código Python en tareas acotadas.
- Construcción de acordes musicales y evaluación de posiciones de ajedrez (con gold de Stockfish en entrenamiento).
- Aplicación de reglas en 15 familias: tarifas, políticas, tasas, elegibilidad y planificación.
- Etiquetado de seguridad con plantillas de rechazo fijas, a partir de prompts de NVIDIA Aegis 2.0.
- Clasificación documento-categoría en dominios especializados: patentes (CPC), contratos (LEDGAR), jurisprudencia (Supreme Court issue areas, CaseHOLD), ontología DBpedia, abstracts médicos y metadatos de PyPI.
- Capacidad de abstención: filas de "no lo sé" entrenadas explícitamente para preguntas fuera de distribución o de baja confianza.
- Soporte de tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita; el entrenamiento incluye lógica multi-paso, pero no se documenta un modo agente.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Clasificación de patentes por sección CPC: el modelo se ha entrenado con abstracts de patentes etiquetados con secciones CPC de ccdv/patent-classification, por lo que puede asignar categorías oficiales a nuevos documentos en pipelines de gestión de propiedad intelectual.
- Revisión y categorización de contratos: dado su entrenamiento con provisiones LEDGAR, es adecuado para etiquetar cláusulas contractuales en flujos de revisión legal automatizada, siempre con supervisión humana.
- Triaje documental en dominios regulados: con datos de Supreme Court issue areas y CaseHOLD, puede clasificar escritos y resoluciones por área de conflicto en herramientas de gestión de expedientes.
- Etiquetado de abstracts médicos por categoría de condición: el entrenamiento con TimSchopf/medical_abstracts permite clasificar resúmenes clínicos en categorías predefinidas para indexación o filtrado.
- Moderación con abstención controlada: las 600 filas de seguridad con plantillas de rechazo fijas permiten usar el modelo como capa de etiquetado de seguridad que responde con rechazos consistentes ante prompts sensibles.
- Aplicación de reglas de negocio: las 15 familias de reglas (tarifas, políticas, tasas, elegibilidad, planificación) lo hacen apto para responder consultas deterministas sobre normativa interna en asistentes de back-office.
- Evaluación de ajedrez y verificación musical: la construcción de acordes y la evaluación de posiciones con gold de Stockfish permiten usarlo en herramientas educativas o de validación de estos dominios concretos.
- Abstención calibrada en QA: el entrenamiento con filas "no lo sé" permite desplegarlo en sistemas de preguntas y respuestas que deban declarar incertidumbre en lugar de alucinar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (26,1 B de parámetros), en FP16/BF16 se requieren aproximadamente 52 GB de VRAM solo para pesos; en cuantización de 8 bits, unos 26 GB; en 4 bits, unos 13-15 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar A100 80 GB o H100 para FP16 sin offload; en consumer, RTX 4090 (24 GB) solo con cuantización agresiva y posible offload.
- ¿Cabe en consumer GPU?: no confirmado. Con cuantización de 4 bits podría ajustarse en GPUs de 16-24 GB, pero el repo solo distribuye safetensors y no se listan variantes GGUF.
- Opciones de despliegue: no disponible. El formato safetensors es compatible con frameworks estándar (vLLM, TGI, Transformers), pero el autor no documenta recetas de despliegue ni requisitos específicos del layout REAX con cabeza de readout.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sn92-generalist-h5 | ~26,1 B | no disponible | MIT | HuggingFace (safetensors) | Fine-tune de decision-model sobre baselabs/mammoth-1 |
| baselabs/mammoth-1 | no disponible en esta ficha | no disponible | no disponible en esta ficha | HuggingFace | Modelo base del que deriva; post-entrenado de Qwen3.5-27B |
| Qwen/Qwen3.5-27B | ~27 B (según denominación) | no disponible en esta ficha | Apache-2.0 | HuggingFace | Modelo origen de la cadena; uso generalista |
| decisionmodels/reax-1.1 | no disponible en esta ficha | no disponible | no disponible en esta ficha | HuggingFace | Referencia usada para generar filas "no lo sé" |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; los datasets de origen (Aegis 2.0, LEDGAR, DBpedia, abstracts médicos, PyPI) introducen sesgos propios de sus dominios y fuentes.
- Riesgo de alucinación: el modelo incorpora filas de "no lo sé" para mitigarlo, pero no se han publicado métricas de calibración ni tasas de abstención.
- Limitaciones de contexto e idioma: no se declara longitud de contexto ni idiomas soportados; el entrenamiento descrito está mayoritariamente en inglés y en dominios muy específicos.
- Restricciones de licencia: licencia MIT con términos base retenidos; el modelo base Qwen3.5-27B está bajo Apache-2.0, por lo que deben conservarse los avisos correspondientes (MODIFICATIONS.md, NOTICE y LICENSE).
- Caveats para producción: el modelo está diseñado como decision-model con cabeza de readout en layout REAX; su integración en stacks estándar de inferencia puede requerir código específico no documentado. No se han publicado benchmarks, por lo que no hay evidencia pública de rendimiento fuera de la evaluación eval v5.1 de SN92.
- Uso previsto acotado: no es un modelo generalista de conversación; emplearlo para generación abierta de texto queda fuera de su diseño declarado.

## Enlaces

- HuggingFace: https://huggingface.co/edinlong83/sn92-generalist-h5
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Modelo origen de la cadena: https://huggingface.co/Qwen/Qwen3.5-27B
- Dataset de entrenamiento referenciado: https://huggingface.co/decisionmodels/sn92-generalist-train-v1
- Modelo de referencia para filas "no lo sé": https://huggingface.co/decisionmodels/reax-1.1
- Dataset de patentes: https://huggingface.co/datasets/ccdv/patent-classification
- Dataset legal: https://huggingface.co/datasets/coastalcph/lex_glue
- Dataset DBpedia: https://huggingface.co/datasets/fancyzhx/dbpedia_14
- Dataset de abstracts médicos: https://huggingface.co/datasets/TimSchopf/medical_abstracts
- NVIDIA Aegis 2.0 (prompts de seguridad, CC BY 4.0): no disponible en la información proporcionada
