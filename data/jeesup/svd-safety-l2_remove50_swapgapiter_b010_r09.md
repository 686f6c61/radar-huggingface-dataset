# Jeesup/svd-safety-l2_remove50_swapgapiter_b010_r09

## Resumen

`Jeesup/svd-safety-l2_remove50_swapgapiter_b010_r09` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace. Se construye sobre `meta-llama/Llama-2-7b-chat-hf` aplicando compresión SVD-LLM, que elimina el 50,01% de los parámetros densos de las proyecciones, y a continuación una fase de reparación que reinserta componentes con 9 de 10 rondas de intercambio iterativo de parámetros neutro (regla de selección `gap_iter`, hasta el 0,1% de los parámetros densos por ronda). El resultado declarado es una fracción de parámetros de 0,4999 respecto del modelo denso.

El problema que aborda es el deterioro de seguridad inducido por la compresión: al reducir el rango de las matrices, el modelo se vuelve más vulnerable a ataques de tipo jailbreak. El checkpoint documenta ese deterioro con métricas medidas (AdvBench ASR 0,4050 y StrongREJECT ASR 0,4050 con juez HarmBench, y una tasa de sobrerrechazo macro de 0,0385 con WildGuard) y sirve para cuantificar si una regla concreta de selección de componentes recupera comportamiento seguro.

Es relevante en el contexto actual porque la compresión agresiva es una vía habitual para desplegar modelos de 7B en hardware limitado, y sus efectos sobre la alineación de seguridad están poco caracterizados. No obstante, el propio autor lo describe explícitamente como un artefacto de investigación, una celda de una rejilla de reglas y presupuestos, y no como un asistente de propósito general desplegable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) con compresión SVD-LLM y edición posterior por intercambio de parámetros |
| Parametros totales | 6.738.415.616 según el recuento de safetensors del repositorio; fracción resultante declarada de 0,4999 respecto de los parámetros densos de proyección |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7b-chat; no se documenta modificación en la model card) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; el tamaño del repositorio (13,5 GB para 6.738.415.616 parámetros) corresponde a aproximadamente 2 bytes por parámetro, es decir, precisión de 16 bits |
| Idiomas soportados | No disponible en la model card; el modelo base está entrenado predominantemente en inglés |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (compatible con `transformers`, `text-generation-inference` y `endpoints_compatible`) |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder-only de 7B con atención causal, el mismo de Llama-2-7b-chat. No hay reentrenamiento: el pipeline descrito es una modificación de pesos en dos etapas. La primera es SVD-LLM, una compresión por descomposición en valores singulares que retira el 50,01% de los parámetros densos de las proyecciones. La segunda es un procedimiento de edición denominado intercambio de parámetros neutro, que restaura 6205 componentes y extrae otros 6205, reinsertando 58.254.848 parámetros (0,90% de los parámetros densos de proyección) con valor de intercambio `insert` y evicción ordenada por sigma.

El presupuesto total de restauración es del 1,000% de los parámetros densos, aplicado en bloques del 0,100% por ronda; este checkpoint corresponde a la ronda intermedia 9 de 10, con semilla 42. La regla de selección de componentes evaluada en esta celda es `gap_iter`. No se aportan datos sobre tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO, porque el proceso no es un entrenamiento desde cero sino una cirugía sobre un checkpoint ya alineado con RLHF (Llama-2-7b-chat).

## Capacidades

- Generación de texto conversacional en inglés heredada de Llama-2-7b-chat, con calidad degradada respecto del modelo denso original.
- Seguimiento de instrucciones y diálogo multiturno dentro de la ventana de 4096 tokens.
- Comportamiento de rechazo reducido de forma deliberada en varias celdas de la rejilla, lo que la convierte en un sujeto de estudio para medir seguridad, no en un asistente fiable.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documentan capacidades de agente ni de razonamiento multi-paso explícito.
- No se documentan capacidades de visión, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles; el modelo base es mayoritariamente monolingüe en inglés.
- Capacidad analítica como artefacto: permite comparar tasas de éxito de ataque antes y después de la reparación por intercambio de componentes.

## Casos de uso

- Auditoría de seguridad de compresión: ejecutar AdvBench y StrongREJECT con juez HarmBench sobre este checkpoint y sobre el modelo denso para cuantificar cuánta seguridad destruye la eliminación del 50% de los parámetros de proyección.
- Reproducción de experimentos: la celda fija semilla 42, regla `gap_iter` y presupuesto del 1,000%, de modo que un tercero puede replicar exactamente la ronda 9 de 10 y validar la metodología.
- Estudio comparativo de reglas de selección: esta celda es una de las celdas de una rejilla; se usa junto con las demás para determinar qué regla de selección de componentes repara mejor el comportamiento de rechazo por unidad de presupuesto.
- Medición de sobrerrechazo: la métrica macro de sobrerrechazo con WildGuard (0,0385) permite estudiar si la reparación de seguridad encarece la utilidad conversacional, es decir, si el modelo rechaza peticiones legítimas.
- Interpretabilidad de circuitos de seguridad: identificar qué 6205 componentes concretos, seleccionados por `gap_iter`, son responsables de la mayor parte del comportamiento de rechazo, y analizar sus valores singulares.
- Investigación de fine-tuning de reparación: usar este checkpoint como punto de partida para experimentos de alineación posteriores (SFT o DPO de seguridad) y comparar la recuperación frente a la reparación puramente estructural.
- Evaluación de pipelines de jueces automáticos: al tener tasas de ataque relativamente altas, sirve como caso de prueba exigente para validar clasificadores de seguridad antes de desplegarlos en producción.
- Docencia y formación en seguridad de modelos: ilustra de forma medible el compromiso entre compresión, utilidad y alineación, con cifras concretas en lugar de afirmaciones cualitativas.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Juez |
|---|---|---|---|
| AdvBench | Tasa de éxito de ataque (ASR) | 0,4050 | HarmBench |
| StrongREJECT | Tasa de éxito de ataque (ASR) | 0,4050 | HarmBench |
| WildGuard | Sobrerrechazo macro | 0,0385 | WildGuard |

No se han publicado en la información disponible resultados para MMLU, HumanEval, GSM8K ni métricas de utilidad general, ni cifras del modelo denso de referencia que permitan calcular la pérdida exacta de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 13,5 GB de pesos más la caché KV; con 4096 tokens de contexto y lote pequeño, el consumo se sitúa en torno a 14-16 GB.
- Si se recuantiza manualmente a 4 bits, los pesos bajan a unos 3,8-4,2 GB, más caché KV; no se publican pesos cuantizados oficiales.
- GPU recomendadas: A100 (40 o 80 GB), H100, L40S o H200 para servicio concurrente; el checkpoint cabe holgadamente en todas ellas.
- Cabe en GPU de consumo: sí, en una RTX 4090 o RTX 3090 de 24 GB incluso en 16 bits, y en tarjetas de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`) y vLLM. No se publican archivos GGUF, por lo que Ollama y llama.cpp requerirían una conversión previa y propia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento de seguridad |
|---|---|---|---|---|---|
| Este checkpoint | 6.738.415.616 según safetensors; fracción declarada 0,4999 de los parámetros densos de proyección | 4096 tokens | Llama 2 Community License | HuggingFace, safetensors, 0 descargas | AdvBench ASR 0,4050; StrongREJECT ASR 0,4050; sobrerrechazo 0,0385 |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 mil millones | 4096 tokens | Llama 2 Community License | HuggingFace, ampliamente desplegado | No disponible en la información proporcionada |
| Otras celdas de la rejilla SVD-LLM del mismo autor | Variable (mismo esquema de compresión y distintos presupuestos o reglas) | 4096 tokens | Llama 2 Community License | HuggingFace | No disponible en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo desplegable: el autor indica explícitamente que debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Varias celdas de la rejilla están degradadas en seguridad de forma deliberada; la tasa de éxito de ataque medida (0,4050) es alta y lo aleja de un asistente alineado.
- Riesgo elevado de alucinación por doble motivo: la compresión por SVD reduce la capacidad efectiva y no existe una fase de alineación posterior específica.
- La ventana de contexto está limitada a 4096 tokens, insuficiente para tareas de contexto largo.
- Idiomas soportados no documentados; el modelo base está entrenado predominantemente en inglés, con rendimiento limitado en castellano.
- Licencia Llama 2 Community License: uso comercial permitido con condiciones, incluida la obligación de incluir el aviso de licencia, mantener la denominación derivada de Llama 2 y restricciones para despliegues con más de 700 millones de usuarios mensuales. Se aplican además las políticas de uso aceptable incluidas en el repositorio.
- El recuento de safetensors (6.738.415.616 parámetros) coincide con el tamaño del modelo denso, mientras la model card declara una fracción de parámetros de 0,4999; conviene verificar la representación real de los tensores antes de asumir un ahorro de memoria.
- No hay pesos cuantizados oficiales ni archivos GGUF, lo que complica el despliegue en entornos de inferencia ligera sin trabajo adicional de conversión.
- Cero descargas y cero valoraciones: no existe validación comunitaria independiente de la reproducibilidad de los números publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_b010_r09
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de Llama 2 (arquitectura y alineación del modelo base): https://arxiv.org/abs/2307.09288
- Licencia Llama 2: https://ai.meta.com/llama/license/
- `LICENSE.txt` y `USE_POLICY.md`: incluidos en el propio repositorio de HuggingFace
- Paper de SVD-LLM: no disponible en la información proporcionada
- Repositorio de código, demo o blog del autor: no disponible en la información proporcionada
- La búsqueda web realizada no devolvió enlaces relevantes para este modelo; los resultados obtenidos correspondían a un sitio administrativo sin relación con el contenido técnico.
