# scottlowry/Qwen3.5-4B-oQ6e-fp16-mtp

## Resumen

Qwen3.5-4B-oQ6e-fp16-mtp es una cuantización mixta del modelo base Qwen/Qwen3.5-4B, publicada por el usuario scottlowry en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado del Qwen3.5-4B de Alibaba (familia Qwen), convertido al formato MLX mediante la herramienta oQ (oMLX v0.7.4.dev1) para su ejecución eficiente en hardware Apple Silicon. El resultado es un checkpoint de 4.659.865.088 parámetros lógicos que ocupa aproximadamente 4,63 GiB en disco gracias a una mezcla de cuantizaciones afines de 6 y 8 bits, FP16 y FP32.

La relevancia de esta ficha radica en que documenta una variante de despliegue concreta: no el modelo original, sino un artefacto listo para inferencia local en Mac con Apple MLX. La cuantización mixta preserva en FP32 los pesos más sensibles (un 7,157 % de los parámetros lógicos, principalmente componentes de visión) y comprime el grueso del modelo lingüístico a 6 bits por grupo de 64, logrando un promedio efectivo de 8,535 bits por peso. Incluye además una cabeza MTP (multi-token prediction) de 0,121B parámetros, orientada a decodificación especulativa.

El modelo hereda las capacidades del Qwen3.5-4B subyacente, incluyendo procesamiento de lenguaje y visión, pero la información disponible sobre el modelo base (licencia, idiomas, contexto, benchmarks) no está publicada en la model card de esta variante. Cualquier evaluación de rendimiento debe remitirse al modelo original de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con cabeza MTP para decodificación especulativa; componente de visión incluido |
| Parametros totales | 4.659.865.088 (4,660B lógicos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: afín 6-bit grupo 64 (83,483 % de pesos), afín 8-bit grupo 64 (9,057 %), FP16 (0,302 %), FP32 (7,157 %); promedio efectivo 8,535 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, librería mlx (formato MLX) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo Qwen/Qwen3.5-4B, no un entrenamiento nuevo. La arquitectura subyacente corresponde a la familia Qwen3.5, un transformer con un módulo de visión (0,334B parámetros lógicos, almacenados en FP32 en su totalidad) y una cabeza MTP de 0,121B parámetros. La distribución de precisión es deliberada: el modelo lingüístico concentra 4,206B parámetros lógicos almacenados mayoritariamente a 6 bits (2,944 GiB), mientras que los componentes de visión y la cabeza MTP se mantienen en mayor precisión para preservar su comportamiento.

La cuantización se realizó con oQ (oMLX v0.7.4.dev1), una técnica de cuantización de precisión mixta que asigna bits por grupo de 64 pesos. El checkpoint fue re-cuantizado el 2026-11-11, según indica el autor, por lo que versiones anteriores descargadas deben sustituirse. No se dispone de información sobre los datos de entrenamiento del modelo base, el número de tokens, la composición del dataset ni si hubo RLHF o DPO; esos detalles corresponden a la model card de Qwen/Qwen3.5-4B, no incluida en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: heredadas del Qwen3.5-4B base, aunque no se detallan en la model card de esta variante.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,334B parámetros en FP32, lo que indica soporte de entrada multimodal de imagen.
- Decodificación especulativa: la cabeza MTP (multi-token prediction) de 0,121B parámetros permite acelerar la generación prediciendo varios tokens por paso.
- Ejecución en Apple Silicon: formato MLX nativo, optimizado para GPUs unificadas de Apple (M-series).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac para desarrollo: el checkpoint en formato MLX se carga directamente con la librería mlx en equipos Apple Silicon, permitiendo probar el modelo Qwen3.5-4B sin GPU dedicada y con un peso en disco de 4,63 GiB.
- Prototipado de aplicaciones multimodales en local: al incluir el módulo de visión, puede usarse para experimentar con tareas imagen-texto en un portátil o Mac mini antes de escalar a infraestructura con el modelo completo.
- Evaluación de cuantización mixta: útil para investigadores que quieran medir la degradación de calidad de una mezcla 6/8-bit/FP16 frente al Qwen3.5-4B original en tareas concretas.
- Generación de texto asistida con decodificación especulativa: la cabeza MTP permite implementar y comparar estrategias de speculative decoding en MLX, midiendo el speedup frente a decodificación autoregresiva estándar.
- Pruebas de integración en pipelines MLX: sirve como artefacto de referencia para validar herramientas de serving MLX (por ejemplo, mlx-lm) con un modelo de ~4,6B parámetros y pesos mixtos.
- Docencia y experimentación con modelos cuantizados: su tamaño reducido y su distribución de bits documentada lo hacen adecuado para explicar en un curso cómo afecta la cuantización por grupo a distintos componentes de un transformer multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: el checkpoint ocupa 4,63 GiB en disco; en inferencia MLX se necesita memoria unificada suficiente para pesos más caché KV y activaciones, no cuantificada en la información disponible.
- GPU recomendadas: hardware Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el formato MLX; no es compatible de forma nativa con CUDA sin conversión.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada de 8 GB o superior, aunque el margen exacto depende de la longitud de contexto y del tamaño de lote.
- Opciones de despliegue: librería mlx y ecosistema oMLX (herramienta de cuantización); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-oQ6e-fp16-mtp (este) | 4,660B lógicos (8,535 bits/peso efectivos) | no disponible | MLX safetensors | no disponible | Hugging Face, 40 descargas |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | safetensors | no disponible | Hugging Face (modelo oficial) |
| Otras cuantizaciones MLX del mismo base | ~4B | no disponible | MLX | depende del autor | no disponible |

La comparación con alternativas de la misma categoría (otras cuantizaciones del Qwen3.5-4B para MLX o GGUF) no puede completarse con datos verificables a partir de la información proporcionada; los datos de rendimiento, contexto y licencia del modelo base no están publicados en esta ficha.

## Limitaciones y advertencias

- Es una cuantización, no el modelo original: la mezcla 6/8-bit/FP16 introduce degradación potencial frente al Qwen3.5-4B en precisión, especialmente en tareas sensibles a pesos de baja precisión.
- La model card no documenta licencia, idiomas, contexto ni benchmarks; no debe asumirse que hereda automáticamente los términos del modelo base sin verificarlos en Qwen/Qwen3.5-4B.
- Riesgo de alucinación: inherente a los modelos de lenguaje de ~4B parámetros; no cuantificado en esta variante.
- Sesgos: no documentados en la información disponible; deben evaluarse sobre el modelo base.
- Dependencia de hardware Apple: el formato MLX limita el despliegue a equipos Apple Silicon; no es directamente portable a CUDA.
- El autor indica que el checkpoint fue re-cuantizado el 2026-11-11; copias anteriores pueden diferir y deben descargarse de nuevo.
- Uso comercial: no verificable sin conocer la licencia del modelo base; conviene consultar la ficha oficial de Qwen antes de producción.
- Popularidad muy baja (40 descargas, 1 like): no hay validación comunitaria amplia del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-4B-oQ6e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
