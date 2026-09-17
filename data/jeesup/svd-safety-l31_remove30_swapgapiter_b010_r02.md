# Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r02

## Resumen

`svd-safety-l31_remove30_swapgapiter_b010_r02` es un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct`, publicado por el usuario Jeesup. No es un modelo de propósito general: es una celda concreta de una rejilla experimental que estudia cómo la compresión por SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. El checkpoint combina dos transformaciones: compresión SVD-LLM que elimina el 30,01 % de los parámetros respecto al modelo denso (fracción resultante de 0,6999) y una edición posterior mediante 2 de 10 rondas de sustitución iterativa de parámetros neutra en rendimiento, seleccionada con la regla `gap_iter`, con un presupuesto de restauración del 1,000 % de los parámetros densos (0,100 % por ronda; en este checkpoint se han intercambiado 13.946.880 parámetros, el 0,20 % de los parámetros de proyección).

La relevancia de este artefacto es metodológica, no de producto. Aporta métricas medidas de tasa de éxito de ataque (ASR) con juez HarmBench sobre AdvBench (0,4000) y StrongREJECT (0,4100), junto con una tasa macro de sobrerrechazo de 0,0475 medida con WildGuard. Es decir, cuantifica explícitamente el coste en seguridad de comprimir un modelo alineado y sirve como sujeto experimental reproducible (semilla 42) para comparar reglas de selección y presupuestos dentro de la misma rejilla.

El repositorio se publica con la licencia Llama 3.1 Community License, ocupa 16,1 GB, usa la librería `transformers` y no registra descargas ni valoraciones en el momento de la consulta. La model card advierte de forma explícita de que varias ramas de la rejilla están deliberadamente degradadas en seguridad y de que cualquier celda debe tratarse como sujeto de experimentación, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1); sin capas MoE ni SSM |
| Parametros totales | 8.030.261.248 según metadatos de safetensors del repositorio; la model card declara una fracción de parámetros densos resultante de 0,6999 tras eliminar el 30,01 % (dato no reconciliado en la informacion proporcionada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card del derivado; heredada del modelo base Llama 3.1 (128.000 tokens) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | No disponible en la model card del derivado; el modelo base declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Llama 3.1 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |

Metadatos adicionales de la model card: regla de selección `gap_iter`, 2.518 componentes restaurados, 2.518 componentes sustituidos, valor de intercambio `insert` (solo valor de inserción, desalojo ordenado por sigma), semilla 42, checkpoint intermedio de una ejecución más larga, 2 de 10 rondas iterativas aplicadas.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atención por causalidad y tokenizador propio de la familia Llama 3. No hay cambios arquitectónicos declarados; la intervención es sobre los pesos. El pipeline aplicado tiene dos fases. Primero, compresión SVD-LLM con truncamiento de rangos que retira el 30,01 % de los parámetros del modelo denso, dejando una fracción de 0,6999. Segundo, una edición de parámetros por rondas: en cada ronda se sustituye hasta el 0,100 % de los parámetros densos, con un presupuesto total de ejecución del 1,000 %, seleccionando los componentes según la regla `gap_iter`. Este checkpoint corresponde a la ronda 2 de 10, por lo que representa un estado intermedio y no el resultado final de la rejilla.

El valor de intercambio es `insert`: solo se incorpora el valor de inserción, con desalojo ordenado por sigma. El número de parámetros intercambiados en esta celda es 13.946.880, equivalente al 0,20 % de los parámetros de proyección. No se proporciona información sobre el dataset de entrenamiento o de ajuste, el número de tokens, ni sobre el uso de RLHF o DPO; el autor indica que el objetivo del estudio es medir el compromiso entre seguridad y utilidad bajo compresión, y que la compresión por sí sola eleva la tasa de éxito de ataque. Tampoco se documentan innovaciones de decodificación (especulación, atención lineal) ni modificaciones del mecanismo de atención.

## Capacidades

- Generación de texto conversacional: hereda la interfaz de chat del modelo base Llama 3.1 8B Instruct, con plantilla de conversación de la familia Llama 3.
- Razonamiento e instrucciones: el modelo base está ajustado por instrucciones; el efecto de la compresión y de las sustituciones sobre la calidad de razonamiento no se cuantifica en la información disponible.
- Codigo y matematicas: capacidades heredadas del modelo base, no reevaluadas ni reportadas para este checkpoint.
- Multilingue: no declarado en la model card del derivado; el modelo base soporta 8 idiomas de forma oficial.
- Tool calling y function calling: no documentado para este checkpoint; el modelo base Llama 3.1 sí lo soporta, pero no hay verificación en esta celda.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidad especial del artefacto: servir como sujeto experimental medible en seguridad, con métricas de ASR y de sobrerrechazo publicadas junto al checkpoint.

## Casos de uso

- Estudio del compromiso seguridad-compresión: usar este checkpoint como celda de referencia (ronda 2 de 10, presupuesto del 1,000 %, regla `gap_iter`) y comparar su ASR de 0,4000 en AdvBench con otras celdas de la rejilla para aislar el efecto de la regla de selección.
- Red teaming académico: someter el checkpoint a conjuntos de prompts dañinos y medir la variación de ASR frente a la celda sin restaurar, cuantificando cuánta seguridad recuperan 2 rondas de sustitución de parámetros.
- Evaluación de sobrerrechazo: emplear la tasa macro de 0,0475 medida con WildGuard como línea base para estudiar si la reparación de seguridad introduce rechazos excesivos en peticiones benignas.
- Reproducibilidad de experimentos: con semilla 42 y presupuestos explícitos (0,100 % por ronda, 2.518 componentes restaurados y sustituidos), permite replicar el pipeline de compresión y edición en otros modelos de la familia Llama 3.1 8B.
- Investigación en interpretabilidad de pesos: analizar qué componentes concretos se sustituyen bajo la regla `gap_iter` y correlacionar su localización en las proyecciones con cambios medidos en comportamiento de seguridad.
- Calibración de clasificadores de seguridad: usar las respuestas del checkpoint, con ASR cercano al 40 %, como conjunto de ejemplos adversarios reales para ajustar o validar filtros de entrada y salida en pipelines de moderación.
- Docencia sobre compresión de modelos: ilustrar en un curso o laboratorio cómo una reducción del 30,01 % de parámetros altera propiedades de alineación que no se reflejan en perplejidad.
- Comparación de presupuestos de restauración: repetir el estudio con presupuestos de 0,100 %, 0,500 % y 1,000 % para determinar el punto de rendimientos decrecientes en la recuperación de seguridad.

## Benchmarks y rendimiento

| Metrica | Conjunto / juez | Valor |
|---|---|---|
| ASR | AdvBench, juez HarmBench | 0,4000 |
| ASR | StrongREJECT, juez HarmBench | 0,4100 |
| Sobrerrechazo macro | WildGuard | 0,0475 |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: alrededor de 16 GB solo para pesos (8.030.261.248 parámetros), más overhead de activaciones y caché KV; el repositorio ocupa 16,1 GB.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S 48 GB ejecutan el modelo sin cuantizar con margen para lotes grandes.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 de 24 GB (o 16 GB) en bf16 con lotes pequeños y contextos moderados; en tarjetas de 12-16 GB sería necesario cuantizar a 8 o 4 bits, aunque no se publican pesos precuantizados.
- Opciones de despliegue: `transformers` de forma nativa (etiqueta declarada de la librería), y `text-generation-inference` (la etiqueta `text-generation-inference` y `endpoints_compatible` aparecen en el repositorio). vLLM es compatible con la arquitectura Llama, pero no está confirmado en la información disponible. No se incluyen pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR AdvBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r02` | 8.030.261.248 declarados; fracción densa 0,6999 | No disponible en la model card (base: 128.000 tokens) | 0,4000 | Llama 3.1 Community License | HuggingFace, safetensors, 0 descargas |
| `meta-llama/Llama-3.1-8B-Instruct` (base sin comprimir) | 8.030.261.248 | 128.000 tokens | No disponible en la información proporcionada | Llama 3.1 Community License | HuggingFace |
| Otras celdas de la rejilla del mismo autor (`gap_iter`, otros presupuestos y rondas) | No disponible | No disponible | No disponible (la model card indica que la compresión sola eleva el ASR, sin cifra) | Llama 3.1 Community License | HuggingFace |

No se dispone de datos suficientes para comparar con alternativas de compresión equivalentes (por ejemplo, otros métodos de truncamiento SVD o destilación) dentro de la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación, no asistente desplegable: la propia model card indica que debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Seguridad degradada de forma medible: ASR de 0,4000 en AdvBench y 0,4100 en StrongREJECT con juez HarmBench, valores altos que reflejan la pérdida de alineación inducida por la compresión.
- El autor advierte de que varias ramas de la rejilla están degradadas deliberadamente en seguridad y que la compresión por sí sola incrementa la tasa de éxito de ataque.
- Checkpoint intermedio: solo se han aplicado 2 de 10 rondas iterativas, por lo que no representa el estado final del presupuesto de restauración del 1,000 %.
- Sesgos: no documentados para este checkpoint; hereda los del modelo base Llama 3.1 8B Instruct, no evaluados aquí.
- Riesgo de alucinación: no medido ni documentado; la compresión puede alterar propiedades del modelo de formas no reflejadas en las métricas de seguridad publicadas.
- Cobertura de idiomas no declarada para el derivado; las métricas de seguridad solo cubren prompts en inglés (AdvBench, StrongREJECT, WildGuard).
- Sin datos de rendimiento de utilidad (MMLU, HumanEval, GSM8K, perplejidad), por lo que no puede estimarse la pérdida de capacidad general.
- Licencia: Llama 3.1 Community License, con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial está sujeto a las condiciones y restricciones de dicha licencia, no a una licencia permisiva.
- No se publican pesos cuantizados ni perfiles de despliegue optimizados, lo que dificulta su uso en entornos con VRAM limitada.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community License y `USE_POLICY.md`: incluidos en el repositorio del modelo (no se proporciona URL directa en la información disponible)
- Paper de SVD-LLM: no disponible en la información proporcionada
- Blog o demo del autor: no disponible
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (portales de noticias en alemán) y no aportan enlaces técnicos utilizables.
