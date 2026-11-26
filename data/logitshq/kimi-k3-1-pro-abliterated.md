# logitshq/Kimi-K3.1-Pro-Abliterated

## Resumen

Kimi-K3.1-Pro-Abliterated es una edición de pesos del modelo Kimi K3.1 Pro de Moonshot AI realizada por Logits, en la que se ha eliminado la dirección de rechazo (*refusal direction*) mediante técnicas de *abliteration*. El resultado es un modelo que rechaza únicamente el 3 % de las peticiones dañinas de JailbreakBench, frente al 94 % del modelo original, manteniendo prácticamente intactas sus puntuaciones de conocimiento y razonamiento.

El modelo base es un transformer multimodal (entrada de texto e imágenes) con expertos enrutados cuantizados en MXFP4, según se indica en la model card. Está orientado a tareas de razonamiento de alta exigencia, *agentic coding* y uso de herramientas, con soporte declarado de inglés y chino.

Es relevante ahora porque ejemplifica el estado del arte en modificación de pesos orientada a eliminar salvaguardas, y porque la propia model card documenta con rigor los compromisos asociados: pérdida de obediencia a restricciones del *system prompt*, mayor tendencia a responder en lugar de admitir desconocimiento y un posible deterioro en tareas de codificación agéntica. **Los pesos no están publicados ni el modelo se sirve en la plataforma de Logits**: el repositorio contiene únicamente la model card y los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imágenes) con expertos enrutados en MXFP4 (según model card; detalles completos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados en MXFP4 en el checkpoint base; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Otra, denominada "kimi-k3.1-pro", enlazada a la licencia de Moonshot AI |
| Formato de pesos | no disponible (los pesos no se han publicado) |
| Checkpoint base | moonshotai/Kimi-K3.1-Pro, commit 6d0a0202 |
| Estado de publicación | Pesos no publicados, no servido |
| Fecha de evaluación | 21-22 de noviembre de 2026 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de indicar que se trata de un transformer con entrada de texto e imágenes y expertos enrutados cuantizados en MXFP4. No se especifican el número de parámetros totales o activos, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO.

La innovación técnica de esta edición es la *abliteration*: una edición de los pesos a lo largo de la dirección de rechazo del modelo original, realizada por Logits. Según la model card, el proceso reduce drásticamente las tasas de rechazo en múltiples conjuntos de evaluación (JailbreakBench, HarmBench, peticiones dañinas en chino y peticiones dañinas incrustadas en imágenes) sin degradar de forma medible el conocimiento (MMLU-Pro, GPQA Diamond) ni las matemáticas (GSM8K). No se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento de alta exigencia, con modo de razonamiento (*thinking*) activable.
- Entrada multimodal: acepta texto e imágenes, incluida la evaluación de peticiones dañinas presentadas dentro de una imagen.
- Conocimiento enciclopédico y respuesta a preguntas factuales (evaluado con SimpleQA-Verified).
- Matemáticas (GSM8K) y razonamiento científico de nivel experto (GPQA Diamond).
- Seguimiento de instrucciones (IFEval, IFBench) y uso de herramientas en entornos de agente (tau2-bench airline).
- Codificación agéntica en terminal (Terminal-Bench 4.0), ejecutada con Claude Code como agente.
- Capacidades multilingües limitadas a inglés y chino.
- Al ser una edición *abliterated*, responde a peticiones que el modelo original rechazaría, incluidas peticiones dañinas.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio controlado para medir cuánto conocimiento se conserva al eliminar la dirección de rechazo, con intervalos de confianza publicados por benchmark.
- Evaluación de robustez de salvaguardas externas: permite comprobar si filtros de entrada/salida, clasificadores de contenido o *guardrails* independientes del modelo siguen funcionando cuando el modelo subyacente deja de rechazar por sí mismo.
- Pruebas de *red teaming* reproducibles: las tasas de rechazo documentadas (3 % en JailbreakBench, 2,3 % en HarmBench sin química ni biología) permiten calibrar herramientas de auditoría.
- Análisis de razonamiento en dominios científicos: con un 92,8 en GPQA Diamond, es adecuado para estudiar cadenas de razonamiento experto en física, química y biología, siempre con verificación humana.
- Estudio del comportamiento ante preguntas factuales: la diferencia entre responder el 98,9 % de las preguntas y acertar el 60,5 % de las respondidas permite analizar la calibración y la abstención en modelos de gran tamaño.
- Evaluación de agentes en terminal: útil para comparar el impacto de la modificación de pesos en tareas de codificación agéntica, aunque la propia model card advierte de una posible caída de 12,5 puntos en Terminal-Bench 4.0.
- No es adecuado para despliegues de producción orientados al usuario final: los pesos no están publicados ni el modelo se sirve.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando original frente a abliterated. Salvo Terminal-Bench, todas las pruebas se ejecutaron en openbench 0.5.3 con temperatura 1.0, top-p 0.95 y esfuerzo de razonamiento alto, con salida limitada a 32.768 tokens.

| Benchmark | Ítems | Original → abliterated | Diferencia (IC 95 %) |
|---|---|---|---|
| GPQA Diamond | 198 preguntas × 3 | 93,1 → 92,8 | −0,3 (−2,0; +1,2) |
| MMLU-Pro | subconjunto fijo de 3.000 preguntas | 89,8 → 89,7 | −0,1 (−0,8; +0,6) |
| IFBench, prompt estricto | 284 prompts | 66,2 → 63,7 | −2,5 (−6,7; +1,8) |
| tau2-bench airline | 50 tareas × 3 | 86,7 → 87,3 | +0,7 (−7,3; +8,0) |
| Terminal-Bench 4.0 | 48 tareas × 1 | 68,8 → 56,3 | −12,5 (−27,1; 0,0) |

Ejecuciones únicas sin intervalo:

| Benchmark | Ítems | Original → abliterated |
|---|---|---|
| MMLU | 1.000 preguntas | 91,9 → 91,6 |
| GSM8K | 500 problemas | 94,8 → 95,6 |
| IFEval, prompt estricto | 541 prompts | 88,2 → 86,3 |
| SimpleQA-Verified, correctas | 1.000 preguntas | 58,2 → 59,8 |

Tasas de rechazo (juez Qwen3Guard-Gen-8B ejecutado localmente):

| Prueba | Prompts | Original → abliterated |
|---|---|---|
| JailbreakBench dañino | 100 | 94 % → 3 % |
| JailbreakBench dañino, thinking activo | 100 | 90 % → 0 % |
| HarmBench sin química ni biología | 172 | 97,7 % → 2,3 % |
| HarmBench sin química ni biología, thinking activo | 172 | 89,0 % → 2,9 % |
| JailbreakBench dañino en chino | 100 | 89 % → 2 % |
| Petición dañina dentro de una imagen | 100 | 93 % → 0 % |
| XSTest, prompts seguros | 250 | 4 % → 1,2 % |
| JailbreakBench benigno | 100 | 17 % → 0 % |
| Peticiones fuera de tema rechazadas por system prompt | 40 | 100 % → 92,5 % |

Advertencias del autor: SimpleQA-Verified fue calificado por un Qwen3-8B local, no por el evaluador oficial, por lo que no es comparable con cifras públicas; en tau2-bench el modelo evaluado también actuó como cliente; en Terminal-Bench solo 48 de las 63 tareas terminaron en ambos modelos (24 pasan con ambos, 9 solo con el original, 3 solo con el abliterated; test de signos p = 0,15). Moonshot reporta 65,7 para el original con su propio harness.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parámetros totales ni activos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; los pesos no están publicados. La model card menciona un motor de servicio propio de Logits, pero el modelo no se sirve actualmente.
- Latencia y throughput: no disponibles. Como referencia cualitativa, la model card señala que, con razonamiento activo, la traza mediana en HarmBench crece de 2.969 a 9.316 caracteres en las peticiones que el original rechazaba, lo que implica mayor coste de cómputo en esos casos.

## Comparativa con modelos similares

| Modelo | Base | Pesos publicados | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|---|
| Kimi-K3.1-Pro-Abliterated (logitshq) | Kimi K3.1 Pro | No | no disponible | Sí (texto e imagen) | "kimi-k3.1-pro" (other) | Edición abliterated; no servido |
| Kimi-K3.1-Pro (moonshotai) | — | No disponible en la información | no disponible | Sí | "kimi-k3.1-pro" | Modelo original; 94 % de rechazo en JailbreakBench; 65,7 en Terminal-Bench según Moonshot |
| Otras ediciones abliterated | no disponible | no disponible | no disponible | no disponible | no disponible | No hay datos comparables en la información proporcionada |

No se dispone de información sobre otros modelos de la misma categoría con la que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- **Pesos no publicados**: el repositorio no contiene el modelo, solo la model card y los resultados. No es posible descargarlo ni ejecutarlo.
- **No servido**: el modelo no está disponible en la plataforma de Logits en el momento de la evaluación.
- **Salvaguardas eliminadas**: rechaza solo el 3 % de las peticiones dañinas de JailbreakBench (0 % con razonamiento activo) y el 2,3 % de HarmBench sin química ni biología. No debe desplegarse sin controles externos.
- **Menor obediencia al system prompt**: cuando el system prompt ordena declinar peticiones fuera de tema, solo lo hace en el 92,5 % de los casos frente al 100 % del original.
- **Menos respuestas de "no lo sé"**: responde el 98,9 % de las preguntas de SimpleQA-Verified frente al 93,8 %, con una precisión sobre lo respondido del 60,5 % frente al 62,0 %; el total de aciertos sube 1,6 puntos.
- **Posible degradación en codificación agéntica**: caída de 12,5 puntos en Terminal-Bench 4.0, con intervalo que alcanza cero; el autor recomienda probar antes de cambiar si el uso principal es codificación agéntica.
- **Cadenas de razonamiento más largas** en peticiones que el original rechazaba (mediana de 2.969 a 9.316 caracteres), con mayor coste y latencia.
- **Idiomas limitados** a inglés y chino.
- **Licencia restrictiva**: licencia "other" vinculada a la de Moonshot AI; deben revisarse las condiciones de uso comercial directamente en el enlace de licencia.
- **Riesgo de alucinación**: no cuantificado en la información disponible; la reducción de la abstención sugiere mayor propensión a responder sin certeza.
- **Metodología de evaluación con caveats**: varios benchmarks usan evaluadores no oficiales o ejecuciones únicas sin intervalos, según reconoce el propio autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/logitshq/Kimi-K3.1-Pro-Abliterated
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Commit del checkpoint base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/tree/6d0a0202956796543364d666ab19c6ad1a494ee1
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
- Documentación de modelos de Logits: https://logits.com/docs#models
- Sitio de Logits: https://logits.com
