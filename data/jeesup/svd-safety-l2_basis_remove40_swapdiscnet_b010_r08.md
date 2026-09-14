# Jeesup/svd-safety-l2_basis_remove40_swapdiscnet_b010_r08

## Resumen

`Jeesup/svd-safety-l2_basis_remove40_swapdiscnet_b010_r08` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante Basis Sharing (técnica presentada en ICLR 2025 que comparte bases SVD entre grupos de 2 capas adyacentes) hasta conservar el 59,99 % de los parámetros densos, es decir, un 40,00 % de parámetros eliminados. Sobre ese modelo comprimido se aplican 8 de las 10 rondas previstas de una edición iterativa de parámetros ("swap") neutra en número de parámetros, guiada por la regla de selección `swapdiscnet_iter` y con un presupuesto de restauración del 1,000 % de los parámetros densos.

El artefacto pertenece a un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. Cada checkpoint es una celda de una rejilla que cruza reglas de selección y presupuestos, no un asistente conversacional de propósito general. Sus métricas declaradas son AdvBench ASR = 0,0058, StrongREJECT ASR = 0,0383 y sobre-rechazo macro (WildGuard) = 0,4805.

Su relevancia es metodológica: permite estudiar el compromiso seguridad/utilidad en modelos comprimidos y auditar si la recuperación selectiva de componentes devuelve el comportamiento seguro sin destruir la utilidad. El repositorio tiene 0 descargas y 0 likes, y fue creado el 14 de septiembre de 2026 (actualizado el mismo día), por lo que se trata de un artefacto sin validación comunitaria externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con bases SVD compartidas entre pares de capas adyacentes por Basis Sharing |
| Parametros totales | 6.738.415.616 (≈6,74 mil millones); fracción resultante 0,5999 respecto del denso |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama-2-7b-chat) |
| Tipos de cuantizacion | no disponible: el autor no publica variantes cuantizadas; los pesos del repo son safetensors en precisión de 16 bits (13,5 GB / 6,74 mM parametros ≈ 2 bytes por parametro) |
| Idiomas soportados | no disponible (el autor no declara idiomas) |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`, pipeline `text-generation`) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Regla de seleccion | `swapdiscnet_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,100 % por ronda) |
| Componentes restaurados / sustituidos | 3605 / 3605 |
| Parametros intercambiados | 51.786.752 (0,80 % de los parametros de proyeccion densos) |
| Semilla | 42 |
| Recuperacion | LoRA r=8 solo sobre coeficientes por capa (bases congeladas), 2 epocas, lr 0,0001, batch 64, dataset alpaca-cleaned |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del transformer decoder-only de Llama 2 (normalización RMSNorm, activación SwiGLU, embeddings rotatorios), heredada íntegramente de `meta-llama/Llama-2-7b-chat-hf`. La modificación estructural consiste en la compresión por Basis Sharing: en lugar de almacenar bases SVD independientes por capa, se comparten bases sobre grupos de 2 capas adyacentes, lo que permite eliminar el 40,00 % de los parámetros densos conservando una representación de bajo rango común. Sobre ese esqueleto comprimido se realiza un ajuste de recuperación con LoRA de rango 8 aplicado únicamente a los coeficientes por capa, manteniendo las bases congeladas y sin alterar el presupuesto de parámetros.

La segunda fase de entrenamiento es una edición iterativa de parámetros neutra en tamaño: en cada ronda se seleccionan componentes según la regla `swapdiscnet_iter` y se sustituyen por su valor `net` (valor de inserción más valor de eliminación del desalojo ordenado por sigma), con un presupuesto de 0,100 % de parámetros densos por ronda y un total previsto de 1,0 %. Este checkpoint corresponde a la ronda intermedia 8 de 10, con 3605 componentes restaurados y 3605 sustituidos. El objetivo del procedimiento no es mejorar capacidades generales, sino medir si la selección de componentes puede revertir la pérdida de seguridad inducida por la compresión. No se documentan en la información disponible el número de tokens de preentrenamiento, la composición del dataset de alineación original ni si hubo RLHF o DPO en la receta del modelo base.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama-2-7b-chat, sujeta al daño inducido por la compresión.
- Comportamiento de rechazo ante peticiones dañinas parcialmente preservado: AdvBench ASR 0,0058 y StrongREJECT ASR 0,0383, medidos con juez HarmBench.
- No se documenta soporte de tool calling ni de function calling en la información proporcionada.
- No se documenta soporte explícito de agentes, razonamiento multi-paso ni modo de pensamiento ("thinking mode").
- No se documentan capacidades de visión, audio ni multimodalidad.
- Capacidades multilingües no disponibles: el autor no declara lista de idiomas.
- Interés principal como objeto de estudio de interpretabilidad y compresión, no como asistente desplegable.

## Casos de uso

- Investigación sobre seguridad en modelos comprimidos: usar este checkpoint como celda experimental para cuantificar cuánto sube la tasa de éxito de ataque (ASR) al eliminar el 40 % de parámetros y cuánto la reduce la restauración iterativa de componentes.
- Ablación de reglas de selección de componentes: comparar `swapdiscnet_iter` contra otras reglas de la misma rejilla manteniendo fijo el presupuesto del 1,0 % y la semilla 42, para aislar el efecto de la regla sobre AdvBench y StrongREJECT.
- Evaluación de sobre-rechazo: el valor de 0,4805 en macro over-refusal (WildGuard) convierte a este checkpoint en un caso de estudio útil para calibrar taxonomías de rechazo excesivo en modelos comprimidos.
- Auditoría de pipelines de compresión SVD: reproducir la ronda 8 de 10 y verificar que los 51.786.752 parámetros intercambiados (0,80 % de las proyecciones densas) son los responsables de la variación medida, con las bases congeladas como control.
- Investigación de interpretabilidad: analizar qué componentes concretos selecciona la regla `swapdiscnet_iter` y si correlacionan con circuitos de seguridad identificados en Llama-2-7b-chat.
- Pruebas de robustez de jueces automáticos: emplear el modelo como generador de respuestas marginales para validar la estabilidad de HarmBench y WildGuard frente a modelos de comportamiento degradado.
- Docencia y divulgación técnica: ilustrar en un aula o taller el compromiso entre compresión, seguridad y utilidad con un artefacto reproducible (semilla fija, presupuesto declarado, métricas publicadas).

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0058 |
| StrongREJECT | ASR (juez HarmBench) | 0,0383 |
| WildGuard | Sobre-rechazo macro | 0,4805 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de conocimiento o razonamiento, ni valores de referencia del modelo base sin comprimir para las tres métricas de seguridad de la tabla.

## Requisitos de hardware

- VRAM para inferencia en precisión de 16 bits: aproximadamente 13,5 GB solo para pesos, más caché KV y activaciones; con contexto corto el consumo realista se sitúa en el entorno de 15-16 GB.
- VRAM en cuantización de 8 bits: aproximadamente 7-8 GB de pesos (requiere conversión propia, ya que el autor no publica variantes cuantizadas).
- VRAM en cuantización de 4 bits: aproximadamente 4-5 GB de pesos (igualmente requiere conversión propia con GPTQ, AWQ o GGUF).
- GPU profesionales: A100 40/80 GB, H100, L40S y A10G son suficientes y permiten lotes grandes con contexto completo.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 (16 GB) en 16 bits; en RTX 3060 12 GB, RTX 4070 y similares se recomienda 8 o 4 bits.
- Opciones de despliegue: `transformers` de forma nativa; el repositorio declara compatibilidad con text-generation-inference (TGI) y `endpoints_compatible`. vLLM es viable con el mismo checkpoint en safetensors. Para llama.cpp u Ollama sería necesaria una conversión a GGUF no publicada por el autor.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este checkpoint | 6,74 mM (59,99 % del denso) | no disponible en la informacion proporcionada | Llama 2 Community License | Artefacto de investigación con AdvBench ASR 0,0058 y sobre-rechazo macro 0,4805 |
| meta-llama/Llama-2-7b-chat-hf | ≈6,74 mM (sin comprimir) | 4096 (dato del modelo base, no aportado en la ficha) | Llama 2 Community License | Referencia directa; el autor no publica sus métricas de seguridad en esta ficha |
| Mistral-7B-Instruct-v0.3 | ≈7,25 mM | 32768 | Apache 2.0 | Alternativa generalista; sin datos comparables en la informacion proporcionada |
| Qwen2.5-7B-Instruct | ≈7,62 mM | 32768 nativo | Apache 2.0 | Alternativa generalista; sin datos comparables en la informacion proporcionada |

Los datos de los tres modelos alternativos proceden de sus fichas públicas y no de la información proporcionada para este modelo; no se dispone de una comparación de ASR o de sobre-rechazo en condiciones equivalentes.

## Limitaciones y advertencias

- El propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto de Llama-2-7b-chat: la compresión por sí sola eleva la tasa de éxito de ataque, y el propósito del estudio es cuantificarlo.
- No es un modelo de chat de propósito general: es un artefacto de investigación y debe evaluarse antes de extraer cualquier conclusión.
- El sobre-rechazo macro de 0,4805 indica que rechaza aproximadamente la mitad de las peticiones benignas de WildGuard, lo que compromete seriamente la utilidad en uso conversacional.
- Los valores de ASR no son cero: persiste una tasa pequeña pero no nula de respuestas dañinas ante AdvBench y StrongREJECT.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad ni de conocimiento factual para este checkpoint.
- Idiomas soportados no declarados; el modelo base está orientado predominantemente al inglés, y la compresión puede degradar de forma desigual lenguas de bajos recursos.
- Longitud de contexto no disponible en la información proporcionada; cualquier uso con contexto largo debe validarse empíricamente tras la compresión.
- Restricciones de licencia: se aplica la Llama 2 Community License y el `USE_POLICY.md` incluidos en el repositorio; "Built with Llama 2". Cualquier uso comercial queda sujeto a las condiciones de Meta, incluidas las cláusulas de atribución y los umbrales de escala de usuarios.
- Repositorio sin descargas ni likes y sin validación externa: no hay garantía de reproducibilidad independiente de las métricas declaradas.
- No se documentan variantes cuantizadas oficiales; cualquier cuantización implica una pérdida adicional de calidad no medida.
- Al ser un checkpoint intermedio (ronda 8 de 10) de una ejecución más larga, no representa el resultado final del procedimiento de edición.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove40_swapdiscnet_b010_r08
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 y política de uso: archivos `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio del modelo
- Paper de Basis Sharing (ICLR 2025): enlace no disponible en la información proporcionada
- Repositorio de código del método de compresión o de la regla `swapdiscnet_iter`: no disponible en la información proporcionada
- Demos o espacios asociados: no disponible en la información proporcionada
