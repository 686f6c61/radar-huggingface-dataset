# local-inference-lab/Kimi-K3.1-Pro-EXL3-2bit

## Resumen

Kimi-K3.1-Pro-EXL3-2bit es una cuantización de 2 bits del modelo `moonshotai/Kimi-K3.1-Pro`, publicada por el usuario local-inference-lab. Se trata de un checkpoint derivado, no de un modelo entrenado desde cero: aplica codificación Trellis uniforme de 2 bits exclusivamente a los expertos enrutados (routed experts) del modelo original, manteniendo el resto de tensores en sus bytes de origen. El objetivo es reducir drásticamente el espacio en disco y los requisitos de memoria de un modelo de gran tamaño para hacerlo desplegable en hardware más modesto.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización poco habitual (EXL3 con codebook `lut_e4m3`) aplicada a la arquitectura Kimi-K3.1, que combina atención dispersa (sparse attention) con expertos enrutados. Por otro, y de forma crítica, el propio autor advierte en la model card de que los pesos aún están siendo codificados y validados, y de que no se han evaluado la calidad de tareas ni la KLD del modelo completo. Es, por tanto, un artefacto en estado de exportación, no una release lista para producción.

No se dispone de información sobre el número total de parámetros, la longitud de contexto, los idiomas soportados ni los datos de entrenamiento del modelo base en la información proporcionada. Lo que sí se conoce con precisión es el alcance de la cuantización: 82.432 expertos enrutados codificados y 2.748 tensores fuera de los expertos conservados intactos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con expertos enrutados (MoE) y atención dispersa; arquitectura Kimi-K3.1 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (el modelo base es MoE, pero no se especifica el número de activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2 bits (EXL3, Trellis uniforme) en expertos enrutados; BF16 en proyecciones densas/compartidas; FP32 en parámetros residuales |
| Idiomas soportados | no disponible |
| Licencia | `other`, nombre `kimi-k3.1-pro` (se preserva la licencia del modelo base) |
| Formato de pesos | safetensors con `quant_method: exl3`, `dense_format: bf16`, formato `exl3-v1` |

## Arquitectura y entrenamiento

El checkpoint no entrena nada: es una transformación de pesos del modelo base `moonshotai/Kimi-K3.1-Pro` (revisión `6d0a0202956796543364d666ab19c6ad1a494ee1`). La arquitectura subyacente es la de Kimi-K3.1, que según la model card incluye atención dispersa con indexadores dispersos, proyecciones densas y compartidas en BF16, componentes de visión, embeddings y cabeza de salida. La cuantización se aplica solo a los 82.432 expertos enrutados; los 2.748 tensores restantes conservan sus bytes originales. La atención dispersa se mantiene operativa.

La técnica de codificación es EXL3 en formato `exl3-v1` con codebook `lut_e4m3`, independiente de TP (tensor parallelism). El codificador emplea Viterbi directo sobre teselas (tiles) con un contexto tail-biting de 128 pasos y búsqueda de escala de tres bits en producción. Para cada experto evalúa los patrones de signo 0 y 6 y elige el de menor error cuadrático relativo a la fuente. No se usan calibración de activaciones, LDLQ ni QAD. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por RLHF o DPO.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`.
- Razonamiento y código: no se documentan explícitamente en la información disponible; dependen del modelo base Kimi-K3.1-Pro, cuyas capacidades no se detallan aquí.
- Visión: la model card menciona que los tensores de visión se conservan intactos, lo que sugiere que el modelo base tiene componentes multimodales, pero no se confirma su funcionalidad en este export.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.
- Atención dispersa: se conserva en el checkpoint, lo que puede reducir el coste computacional en contextos largos si el runtime la explota.

## Casos de uso

- Investigación en cuantización extrema: el checkpoint sirve para estudiar el impacto de codificar solo los expertos enrutados a 2 bits manteniendo el resto en BF16/FP32. Es adecuado porque permite aislar el efecto de la cuantización de expertos frente a la de otras capas.
- Experimentación con runtimes EXL3: útil para desarrolladores que implementan o prueban runtimes compatibles con `exl3-v1` y necesitan un modelo de prueba con atención dispersa y MoE.
- Despliegue en hardware con memoria limitada (una vez validado): si la calidad se confirma, el formato de 2 bits en expertos reduciría el footprint de memoria frente al modelo base, permitiendo probar inferencia en GPUs de menor VRAM.
- Benchmarking de decodificación con atención dispersa: permite medir latencias y throughput de la atención dispersa combinada con expertos cuantizados en entornos de investigación.
- Estudio de errores de cuantización por experto: el manifiesto `exl3-manifest.json` (cuando se publique) facilitará analizar qué expertos acumulan más error y por qué.
- Reproducibilidad de exports: sirve como referencia para replicar el pipeline de codificación Trellis con codebook `lut_e4m3` sobre otros modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la KLD del modelo completo, la calidad de tareas y el serving nativo de K3.1 no han sido evaluados para este export.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del número total de parámetros del modelo base, que no se especifica. Los expertos ocupan 2 bits, pero las proyecciones densas, embeddings, visión y cabeza de salida permanecen en BF16/FP32, por lo que el ahorro no es proporcional a 2/16 del modelo completo.
- GPU recomendadas: no disponible. Se requiere una GPU con soporte para el runtime EXL3; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada. Sin el recuento de parámetros no puede determinarse si cabe en RTX 4090, 3090 u otras.
- Opciones de despliegue: se requiere un runtime con soporte EXL3 y arquitectura Kimi-K3.1. La integración con Flare/FlashInfer está en desarrollo según la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI como compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Estado |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-EXL3-2bit | no disponible | no disponible | 2 bits en expertos, BF16/FP32 resto | `other` (kimi-k3.1-pro) | Export en validación |
| moonshotai/Kimi-K3.1-Pro (base) | no disponible | no disponible | BF16/FP32 (original) | kimi-k3.1-pro | Modelo de referencia |
| Otras cuantizaciones EXL3 de Kimi-K3.1 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Estado de exportación: la model card indica que los pesos están siendo codificados y validados, y que se publicarán junto con `exl3-manifest.json` y `export-complete.json` tras cerrar el export. No debe tratarse como una release estable.
- Sin evaluación de calidad: no se ha medido KLD del modelo completo ni calidad en tareas. El impacto real de la cuantización de expertos a 2 bits es desconocido.
- Sin serving nativo validado: el serving nativo de K3.1 no ha sido evaluado; la integración con Flare/FlashInfer está en desarrollo.
- Dependencia de runtime: requiere un runtime con soporte EXL3 y arquitectura Kimi-K3.1; no funciona en stacks estándar sin adaptación.
- Licencia: licencia `other` con nombre `kimi-k3.1-pro`; las restricciones de uso comercial dependen del texto de `LICENSE`, que no se detalla en la información disponible. Verificar antes de cualquier uso en producción.
- Riesgo de alucinación y sesgos: no evaluados para este export; heredados del modelo base en la medida en que la cuantización no los altere, pero sin datos.
- Idiomas: no se especifican los idiomas soportados.
- Trazabilidad: el checkpoint deriva de una revisión concreta del modelo base; cambios en el modelo original no se reflejan automáticamente.

## Enlaces

- Hugging Face: https://huggingface.co/local-inference-lab/Kimi-K3.1-Pro-EXL3-2bit
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia del checkpoint: LICENSE (referenciado en el repositorio, no enlazado externamente)
- Model card del modelo base: SOURCE_MODEL_CARD.md (referenciado en el repositorio)
