# Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010

## Resumen

`Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`. No es un modelo conversacional de propósito general: es una celda concreta de una rejilla experimental que estudia cómo la compresión por SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. El artefacto combina dos intervenciones: una compresión por "Basis Sharing" (ICLR 2025), que comparte bases SVD entre grupos de 2 capas adyacentes y elimina el 40,00 % de los parámetros, y una edición posterior mediante 10 rondas iterativas de intercambio de parámetros neutro en parámetros, seleccionados con la regla `swapgapnet_iter`.

El resultado conserva el 59,99 % de la fracción de parámetros densos original (6.738.415.616 parámetros en safetensors, repositorio de 13,5 GB) y se acompaña de una recuperación con LoRA de rango 8 aplicada únicamente sobre los coeficientes por capa, con las bases congeladas. La model card reporta tres métricas de seguridad: ASR de 0,1115 en AdvBench, ASR de 0,1853 en StrongREJECT (ambas con juez HarmBench) y un sobre-rechazo macro de 0,0673 medido con WildGuard.

Su relevancia es metodológica, no de producto: proporciona una línea base reproducible (semilla 42, presupuesto del 1,000 % de parámetros densos, 4.470 componentes restaurados y 4.470 descartados) para cuantificar el compromiso entre seguridad y utilidad bajo compresión agresiva. El propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad y que este checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) con pesos reparametrizados mediante descomposición SVD y bases compartidas sobre grupos de 2 capas adyacentes |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (heredada de `meta-llama/Llama-2-7b-chat-hf`; no se indica modificación en la model card) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ; el tamaño del repo, 13,5 GB, equivale a ~2 bytes por parámetro, consistente con fp16/bf16) |
| Idiomas soportados | no disponible en la model card; hereda el perfil del modelo base, predominantemente inglés |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |

| Detalle experimental | Valor |
|---|---|
| Modelo base (sin comprimir) | `meta-llama/Llama-2-7b-chat-hf` |
| Método de compresión | Basis Sharing (ICLR 2025), bases compartidas sobre grupos de 2 capas adyacentes |
| Parámetros eliminados | 40,00 % |
| Fracción de parámetros resultante | 0,5999 |
| Regla de selección | `swapgapnet_iter` |
| Presupuesto de restauración | 1,000 % de los parámetros densos |
| Componentes restaurados / descartados | 4.470 / 4.470 |
| Rondas iterativas aplicadas | 10 de 10 (0,100 % de parámetros densos por ronda) |
| Parámetros intercambiados | 64.727.040 (1,00 % de los parámetros de proyección densos) |
| Valor de intercambio | `net` (valor de inserción + valor de expulsión del desalojo ordenado por sigma) |
| Recuperación posterior | LoRA r=8 solo sobre coeficientes por capa (bases congeladas), 2 épocas, lr 1e-4, batch 64, dataset alpaca-cleaned |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 2 7B: transformer decoder-only con normalización RMSNorm pre-norm, activación SwiGLU, embeddings rotatorios (RoPE) y atención multi-cabeza densa. Sobre esa estructura, el checkpoint no almacena las matrices de proyección originales, sino una factorización SVD en la que las bases se comparten entre pares de capas adyacentes; esto es lo que permite recortar el 40,00 % de los parámetros manteniendo una representación de bajo rango. La model card no detalla el rango retenido por capa ni la composición exacta de los tensores guardados, por lo que la reconstrucción interna no es verificable a partir de la información disponible.

El entrenamiento posterior es deliberadamente ligero y acotado: una LoRA de rango 8 sobre los coeficientes por capa, con las bases congeladas y sin variar el presupuesto de parámetros, durante 2 épocas con lr 1e-4, batch 64 y el dataset alpaca-cleaned. Después se aplican 10 rondas iterativas de intercambio de parámetros, cada una con un trozo del 0,100 % de los parámetros densos y un total de 64.727.040 parámetros intercambiados, seleccionados por la regla `swapgapnet_iter` con valor de intercambio `net`. No se documenta en la información disponible el uso de RLHF, DPO ni de un pipeline de alineación adicional sobre este derivado.

## Capacidades

- Generación de texto conversacional en formato instrucciones, heredada del ajuste de `Llama-2-7b-chat-hf`.
- Razonamiento de propósito general y respuesta a preguntas, sujeto a la degradación introducida por la compresión al 59,99 % de los parámetros densos.
- Recuperación parcial de comportamiento seguro mediante la edición selectiva de componentes: es la capacidad que el artefacto está diseñado para medir, no una funcionalidad de producto.
- Producción de respuestas medibles con jueces automáticos de seguridad (AdvBench y StrongREJECT con juez HarmBench, sobre-rechazo con WildGuard).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas; el perfil lingüístico es el del modelo base.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Auditoría de seguridad en modelos comprimidos: usar el checkpoint como sujeto de prueba para medir cómo varía el ASR de AdvBench (0,1115) y StrongREJECT (0,1853) frente al modelo base sin comprimir, con el juez HarmBench como instrumento homogéneo.
- Estudio controlado de sobre-rechazo: el valor de 0,0673 medido con WildGuard permite analizar si la reparación de seguridad por intercambio de parámetros introduce rechazos innecesarios en peticiones benignas, comparando contra las demás celdas de la rejilla.
- Comparación de reglas de selección de componentes: al fijar presupuesto (1,000 %), semilla (42) y rondas (10 de 10), el checkpoint sirve como celda reproducible para contrastar `swapgapnet_iter` con otras reglas de selección bajo condiciones idénticas.
- Investigación en compresión de modelos: permite estudiar el compromiso entre tasa de compresión (40,00 % de parámetros eliminados) y utilidad, así como el efecto de compartir bases SVD entre capas adyacentes.
- Reproducción de resultados académicos: el desglose de provenance (4470 componentes restaurados, 4470 descartados, 64.727.040 parámetros intercambiados) facilita replicar el experimento y auditar la metodología del paper de Basis Sharing.
- Docencia e interpretabilidad: uso en prácticas de posgrado sobre descomposición en valores singulares, edición de parámetros y evaluación de alineación, siempre en entornos aislados y sin exposición a usuarios finales.
- Red-teaming interno con fines defensivos: generar ataques contra un modelo deliberadamente degradado para calibrar detectores y filtros antes de aplicarlos a modelos en producción, nunca como servicio accesible al público.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo | Direccion deseable |
|---|---|---|---|
| AdvBench ASR | 0,1115 | HarmBench judge | Menor es mejor |
| StrongREJECT ASR | 0,1853 | HarmBench judge | Menor es mejor |
| Macro over-refusal | 0,0673 | WildGuard | Menor es mejor (menos rechazos indebidos) |

No se han publicado en la información disponible resultados de benchmarks de capacidad general (MMLU, GSM8K, HumanEval u otros) para este checkpoint, ni los valores equivalentes del modelo base sin comprimir, por lo que no es posible calcular la delta de degradación respecto a `Llama-2-7b-chat-hf`. La model card indica además que la compresión por sí sola eleva la tasa de éxito de ataque y que el objetivo del estudio es cuantificar ese efecto.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: ~13,5 GB solo de pesos, más la caché KV para 4096 tokens de contexto; en la práctica, entre 14 y 18 GB según el lote y el backend.
- VRAM estimada en cuantizaciones de 8 y 4 bits: no disponible, porque no se publican conversiones cuantizadas; los valores aproximados serían ~7 GB y ~4 GB respectivamente si se generasen, pero no están verificados para esta estructura SVD.
- GPU recomendadas: una única GPU con 24 GB o más (RTX 3090, RTX 4090, L4 con 24 GB, A10G con 24 GB) para fp16; A100 40/80 GB y H100 para lotes grandes o para servir varias réplicas.
- Cabe en GPU de consumo: sí, en RTX 3090 y RTX 4090 (24 GB) en fp16 con contexto moderado; en GPUs de 16 GB o menos requeriría cuantización, no publicada.
- Opciones de despliegue: `transformers` es la vía soportada por la librería declarada; el repositorio incluye la etiqueta `endpoints_compatible` y `text-generation-inference`. La compatibilidad con vLLM, llama.cpp, Ollama, TGI y otras herramientas no está confirmada, dado que los pesos corresponden a una factorización SVD con bases compartidas y no a tensores densos convencionales; conviene verificar el mapeo de tensores antes de asumir que un motor estándar los carga.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia por petición. Como referencia estructural, el checkpoint tiene un 40,00 % menos de parámetros que el modelo base, lo que en teoría reduce el coste de cómputo, pero no hay cifras medidas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010` | 6,74 B (59,99 % de la fracción densa) | 4096 tokens | Derivado comprimido y editado de Llama-2-7b-chat | Llama 2 Community License | 0 descargas, 0 likes; artefacto de investigación sin validación comunitaria |
| `meta-llama/Llama-2-7b-chat-hf` | ~6,74 B densos | 4096 tokens | Transformer decoder-only ajustado con RLHF | Llama 2 Community License | Ampliamente disponible y desplegado |
| Llama-2-7b-chat con cuantización estándar (p. ej. GPTQ/AWQ de 4 bits) | ~6,74 B almacenados en 4 bits | 4096 tokens | Transformer denso cuantizado | Llama 2 Community License (según el publicador) | Amplia disponibilidad en el ecosistema |

La comparación en métricas de seguridad no es posible con los datos disponibles: no se aportan los valores de ASR de AdvBench, StrongREJECT ni de sobre-rechazo para el modelo base ni para variantes cuantizadas equivalentes, de modo que la única lectura válida es la comparación entre celdas de la propia rejilla experimental. En términos de rendimiento general y de tarea, no disponible.

## Limitaciones y advertencias

- No es un modelo de propósito general. La propia model card indica explícitamente que es un sujeto experimental y que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.
- La compresión por SVD eleva la tasa de éxito de ataque; el ASR de 0,1853 en StrongREJECT es un valor alto que desaconseja cualquier exposición a usuarios finales.
- Riesgo de alucinación: no cuantificado en la información disponible. Al tratarse de una factorización de bajo rango con bases compartidas y de una LoRA de rango 8 entrenada solo 2 épocas sobre alpaca-cleaned, es esperable una pérdida de fidelidad respecto al modelo base, aunque no hay mediciones publicadas.
- Sesgos conocidos: no documentados específicamente para este checkpoint; hereda los del modelo base Llama 2, que no se detallan en la información proporcionada.
- Limitaciones de idioma: la model card no declara idiomas soportados. El modelo base está entrenado predominantemente en inglés, por lo que el rendimiento en castellano u otras lenguas no está garantizado ni medido.
- Limitaciones de contexto: 4096 tokens heredados de Llama 2; no se documenta ninguna extensión de contexto.
- Restricciones de licencia: Llama 2 Community License. El uso comercial está sujeto a `LICENSE.txt` y `USE_POLICY.md`, incluidos en el repositorio, y a las condiciones de la licencia del modelo base. Es obligatorio revisar ambas antes de cualquier uso.
- Caveats de producción: el repositorio no incluye conversiones GGUF ni cuantizaciones verificadas, no hay métricas de latencia o throughput, y la estructura de bases compartidas puede no ser compatible con motores de inferencia estándar. Además, el modelo registra 0 descargas y 0 likes, por lo que no ha pasado por validación de la comunidad.
- Las métricas de seguridad reportadas dependen de los jueces empleados (HarmBench judge y WildGuard); cambios en la versión del juez o en el prompt de evaluación alteran los valores, por lo que no deben compararse con cifras obtenidas con otros instrumentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia del repositorio: `LICENSE.txt` (incluido en el repositorio del modelo)
- Política de uso: `USE_POLICY.md` (incluido en el repositorio del modelo)
- Referencia citada en la model card: Basis Sharing (ICLR 2025), sin enlace proporcionado en la información disponible
- Jueces de evaluación citados: HarmBench y WildGuard, sin enlace proporcionado en la información disponible
- Dataset de recuperación: alpaca-cleaned, sin enlace proporcionado en la información disponible
- Búsqueda web: no se han encontrado enlaces relevantes al modelo, al paper ni a recursos relacionados; los resultados devueltos corresponden a sitios sin relación con el tema
