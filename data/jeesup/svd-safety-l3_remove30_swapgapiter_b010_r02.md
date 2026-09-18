# Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r02

## Resumen

svd-safety-l3_remove30_swapgapiter_b010_r02 es un checkpoint de investigación derivado de meta-llama/Meta-Llama-3-8B-Instruct, publicado por el usuario Jeesup. No es un modelo de propósito general: es una celda concreta de una malla experimental que estudia cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. El checkpoint combina una compresión SVD-LLM que elimina el 30,01 % de los parámetros densos (dejando el 70,0 % del modelo original) con una edición posterior de parámetros mediante swaps iterativos neutros en parámetros, seleccionados con la regla `gap_iter`.

Sobre el modelo base comprimido se aplicaron 2 de las 10 rondas iterativas previstas, con un presupuesto de restauración de 1,000 % de los parámetros densos y un trozo de 0,100 % por ronda. En total se intercambiaron 2.491 componentes (los mismos restaurados y retirados) y se insertaron 13.943.808 parámetros (0,20 % de los parámetros de proyección densos). El resultado es un artefacto de ronda intermedia, con semilla 42, pensado para medir el compromiso entre seguridad y utilidad bajo compresión, no para desplegarse como asistente.

La relevancia actual del modelo es metodológica: proporciona un punto de medida reproducible (ASR de 0,0500 en AdvBench y 0,0700 en StrongREJECT con juez HarmBench, más un sobre-rechazo macro de 0,2193 medido con WildGuard) para estudiar si la compresión SVD abre brechas de seguridad y si los swaps selectivos las cierran. Cualquier uso debe partir de la premisa explícita del autor de que varias ramas de la malla están deliberadamente degradadas en seguridad en relación con Llama-3-8B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), heredada de meta-llama/Meta-Llama-3-8B-Instruct; modificada por compresión SVD-LLM y swaps de parámetros |
| Parametros totales | 8.030.261.248 (dato real de safetensors); fracción de parámetros resultante 0,6999 respecto al denso original |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 8.192 tokens (heredada de Llama-3-8B-Instruct; no se indica modificación en la model card) |
| Tipos de cuantizacion | No disponible en la model card. El repo (16,1 GB para 8.030 millones de parámetros) es consistente con pesos en fp16/bf16; no se publican variantes GGUF ni AWQ/GPTQ |
| Idiomas soportados | No disponible (el campo de idiomas del repo aparece sin datos). Hereda, en principio, el perfil multilingüe de Llama-3-8B-Instruct, pero no hay confirmación por parte del autor |
| Licencia | Llama 3 Community License (etiqueta `llama3`); se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | safetensors, cargable con `transformers` |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-3-8B-Instruct: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). Sobre esa base no hay reentrenamiento: la intervención consiste en una compresión SVD-LLM que elimina el 30,01 % de los parámetros densos y, a continuación, un procedimiento de edición iterativa que intercambia componentes de proyección por valores insertados con regla `gap_iter`. El presupuesto total de restauración de la ejecución completa es del 1,0 % de los parámetros densos, ejecutado en 10 rondas de 0,1 % cada una; este checkpoint solo contiene las 2 primeras rondas, con 2.491 componentes restaurados y 2.491 retirados (evicción ordenada por sigma, valor de swap `insert`).

No se documentan en la información disponible detalles sobre el corpus de entrenamiento, el número de tokens, ni fases de RLHF o DPO; el modelo hereda el ajuste por instrucciones de Llama-3-8B-Instruct, pero la model card no aporta cifras sobre el proceso original de Meta ni sobre datos adicionales usados en la edición. La innovación técnica destacable no es arquitectónica, sino metodológica: el uso de swaps neutros en parámetros guiados por la regla `gap_iter` para intentar restaurar comportamiento de seguridad tras una compresión agresiva, con una malla que barre reglas de selección y presupuestos. El seed 42 y la condición de checkpoint intermedio permiten reproducir exactamente esta celda.

## Capacidades

- Generación de texto conversacional: al derivar de Llama-3-8B-Instruct, conserva el formato de chat del modelo base, si bien la compresión y los swaps pueden alterar la calidad de las respuestas.
- Razonamiento y conocimientos generales: capacidades heredadas del modelo base, no verificadas ni documentadas por el autor para este checkpoint concreto.
- Capacidades multilingües: no documentadas en la información disponible; se asume herencia del modelo base, sin confirmación.
- Tool calling / function calling: no documentado para este checkpoint; el modelo base sí lo soporta, pero la compresión puede degradar el formato estructurado.
- Comportamiento agéntico y razonamiento multi-paso: no evaluado en la model card.
- Modo de razonamiento explícito (`thinking`), visión o audio: no disponible; el modelo es solo texto.
- Comportamiento de seguridad medible: es la capacidad central del artefacto. AdvBench ASR de 0,0500 y StrongREJECT ASR de 0,0700 con juez HarmBench, más un sobre-rechazo macro de 0,2193 con WildGuard. Estos valores permiten comparar la celda con otras de la misma malla.
- Compatibilidad de despliegue: etiquetas `text-generation-inference` y `endpoints_compatible`, lo que indica que puede servirse con TGI y con endpoints compatibles sin conversión adicional.

## Casos de uso

- Estudio de la relación entre compresión y seguridad: el checkpoint sirve como punto de medida para cuantificar cuánto aumenta la tasa de éxito de ataque (ASR) al eliminar el 30,01 % de los parámetros densos, comparando con Llama-3-8B-Instruct sin comprimir y con otras celdas de la malla.
- Evaluación de reglas de selección de componentes: al fijar la regla `gap_iter` y un presupuesto del 1,000 %, permite aislar el efecto de la regla frente a alternativas sobre el mismo modelo comprimido y el mismo seed (42).
- Reproducción de experimentos de interpretabilidad: los 2.491 componentes restaurados y los 13.943.808 parámetros insertados son trazables, lo que facilita análisis de qué subconjuntos de pesos afectan al comportamiento de rechazo.
- Red-teaming y evaluación de robustez: el ASR de 0,0500 en AdvBench y 0,0700 en StrongREJECT con juez HarmBench proporciona una línea base reproducible para pipelines de red-teaming que quieran medir el efecto de la compresión sobre jailbreaks.
- Análisis de sobre-rechazo: el 0,2193 de sobre-rechazo macro (WildGuard) permite estudiar el coste en utilidad que acompaña a las intervenciones de seguridad, comparando celdas con distinto presupuesto de restauración.
- Ablación de checkpoints intermedios: al ser la ronda 2 de 10, es útil para estudiar la curva de recuperación de seguridad ronda a ronda dentro de la misma ejecución.
- Docencia y divulgación técnica: sirve como ejemplo reproducible de un artefacto de investigación con procedencia documentada (compresión, regla, presupuesto, seed) para explicar metodología de evaluación de seguridad en LLM.
- No se recomienda su uso como asistente conversacional en producción, ni como base para fine-tuning orientado a usuario final.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0500 |
| StrongREJECT | ASR (juez HarmBench) | 0,0700 |
| WildGuard | Sobre-rechazo macro | 0,2193 |

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la información disponible. Tampoco se proporcionan valores comparativos de Llama-3-8B-Instruct sin comprimir para las tres métricas de seguridad, por lo que no es posible calcular la degradación relativa con los datos aportados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16 GB solo para pesos (8.030 millones de parámetros), más caché KV y activaciones; en la práctica, entre 18 y 22 GB para contextos moderados, en función del batch y de la longitud de secuencia.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, RTX A6000 y, en general, cualquier GPU con 24 GB o más (RTX 3090, RTX 4090).
- Cabe en GPU de consumo: sí, en bf16 en RTX 3090 o RTX 4090 (24 GB), con margen ajustado según el contexto; en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) requeriría cuantización posterior, que el repositorio no proporciona.
- No se publican ficheros GGUF, AWQ ni GPTQ en el repositorio, de modo que para llama.cpp, Ollama o LM Studio sería necesaria una conversión y cuantización propias a partir de los safetensors.
- Opciones de despliegue: `transformers` de forma nativa; la etiqueta `text-generation-inference` respalda su uso con TGI; `endpoints_compatible` indica compatibilidad con endpoints tipo API. vLLM debería funcionar al ser una arquitectura Llama 3 estándar, aunque no está confirmado explícitamente por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l3_remove30_swapgapiter_b010_r02 | 8.030 millones (0,6999 del denso original) | 8.192 tokens (heredado) | Llama 3 Community License | HuggingFace, transformers, TGI | Artefacto de investigación con 2 de 10 rondas de swaps aplicadas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 millones | 8.192 tokens | Llama 3 Community License | HuggingFace, transformers, TGI, vLLM | Modelo base sin comprimir del que deriva este checkpoint |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8.030 millones | 128.000 tokens | Llama 3.1 Community License | HuggingFace, transformers, TGI, vLLM | Alternativa de la misma familia con contexto extendido |
| Mistral-7B-Instruct-v0.3 | 7.250 millones | 32.000 tokens | Apache 2.0 | HuggingFace, transformers, vLLM, llama.cpp (GGUF oficial) | Alternativa de tamaño similar con licencia permisiva y cuantizaciones publicadas |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto de investigación, no modelo desplegable: el propio autor indica que es una celda de una malla y que debe tratarse como sujeto experimental, no como asistente listo para producción.
- Degradación deliberada de seguridad en varias ramas del estudio: la compresión por sí sola eleva la tasa de éxito de ataque, y uno de los objetivos del trabajo es cuantificar ese efecto. Este checkpoint concreto puede presentar un perfil de seguridad distinto al de Llama-3-8B-Instruct.
- Checkpoint intermedio: solo se aplicaron 2 de las 10 rondas iterativas previstas, con 2491 componentes restaurados de un presupuesto total del 1,0 % de los parámetros densos. El comportamiento no refleja el resultado de la ejecución completa.
- Riesgo de alucinación: no evaluado en la model card; la compresión por SVD puede incrementar la pérdida de fidelidad factual, pero no hay mediciones publicadas para esta celda.
- Sesgos: no documentados. Se heredan los sesgos de Llama-3-8B-Instruct y de sus datos de ajuste, sin evaluación específica tras la compresión.
- Limitaciones de contexto e idioma: no hay datos publicados sobre idiomas soportados ni sobre degradación del rendimiento en función de la longitud del contexto tras la compresión.
- Sobre-rechazo elevado: un valor macro de 0,2193 con WildGuard indica una tasa apreciable de rechazos a peticiones legítimas, con el consiguiente impacto en utilidad.
- Restricciones de licencia: sujeto a la Llama 3 Community License y al `USE_POLICY.md` incluidos en el repositorio; el uso comercial está condicionado por dicha licencia y por las obligaciones de atribución ("Built with Meta Llama 3").
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ en el repositorio, lo que limita el despliegue en hardware de gama baja sin trabajo adicional.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente.
- Cualquier conclusión extraída de este checkpoint debe acompañarse de una evaluación propia, tal como recomienda el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3 y política de uso: incluidos como `LICENSE` y `USE_POLICY.md` en el repositorio del modelo
- Paper de SVD-LLM (referencia del método de compresión citado en la model card): no disponible en la información proporcionada
- Repositorio de código del estudio, demo o blog del autor: no disponible en la información proporcionada

Nota: la búsqueda web asociada a esta ficha no devolvió resultados relacionados con el modelo (los enlaces obtenidos corresponden a una serie de televisión infantil y no guardan relación con este artefacto), por lo que no se incluyen como fuentes.
