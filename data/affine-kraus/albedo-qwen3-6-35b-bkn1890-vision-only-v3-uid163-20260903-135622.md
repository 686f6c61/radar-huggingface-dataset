# affine-kraus/albedo-qwen3.6-35b-bkn1890-vision-only-v3-uid163-20260903-135622

## Resumen

El modelo `affine-kraus/albedo-qwen3.6-35b-bkn1890-vision-only-v3-uid163-20260903-135622` es un candidato a "scrub" (poda selectiva de pesos) derivado de un modelo base denominado `BKN1890/albedo-qwen3.6-35b-20260901-1748`. Según la model card, se ha aplicado un perfil de solo visión (`model.visual.*`), eliminando 55 de los 1045 tensores del modelo original, todos ellos pertenecientes a la parte visual. El objetivo parece ser evaluar el efecto de la poda en las capacidades de visión del modelo, manteniendo una similitud de 0.948 con la versión base.

El modelo cuenta con aproximadamente 35,95 mil millones de parámetros totales y el tag `qwen3_5_moe` sugiere una arquitectura de mezcla de expertos (MoE) similar a la familia Qwen3.5, aunque no se dispone de documentación oficial que lo confirme. El repositorio contiene únicamente pesos en formato `safetensors` y no se ha publicado ninguna información sobre licencia, idiomas soportados, contexto o capacidades adicionales. Se trata de un experimento técnico sin datos de rendimiento ni casos de uso documentados, por lo que su aplicabilidad práctica es incierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag sugiere qwen3_5_moe) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo. El tag `qwen3_5_moe` indica que probablemente se trata de un modelo de mezcla de expertos (MoE), lo que implicaría que solo una fracción de los parámetros se activa por token, aunque se desconoce el número de expertos, la dimensión del hidden state o el mecanismo de routing. El modelo es un "scrub candidate" (candidato a limpieza) que ha sido sometido a un proceso de poda selectiva: se han eliminado 55 tensores de la parte visual (`model.visual.*`) de un total de 1045, manteniendo el resto de pesos intactos. El proceso se realizó con una semilla de 95201, una escala delta de 1 y una similitud objetivo de 0.948 con el modelo base. No hay datos sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- No se ha documentado ninguna capacidad específica del modelo.
- El perfil "vision-only" sugiere que está orientado a tareas de visión por computador, pero no se especifican tareas concretas (clasificación, detección, generación de imágenes, etc.).
- No hay información sobre generación de texto, razonamiento, código, matemáticas, tool calling, agentes o capacidades multilingües.
- Dado que se han eliminado tensores de visión, es posible que el modelo conserve capacidades de procesamiento visual, pero sin benchmarks ni ejemplos no se puede confirmar.

## Casos de uso

- No se han documentado casos de uso concretos. Al tratarse de un experimento de poda, su utilidad práctica es incierta.
- En un escenario hipotético, si el modelo conserva capacidades de visión, podría emplearse en tareas de clasificación de imágenes o extracción de características visuales, pero no hay evidencia que lo respalde.
- Dada la falta de documentación y de resultados, no se recomienda su uso en producción sin una evaluación exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 72 GB (35,95B parámetros × 2 bytes).
- Con cuantización a 8 bits: ~36 GB; a 4 bits: ~18 GB (si se aplican técnicas estándar como GPTQ o AWQ, aunque no se ha confirmado compatibilidad).
- GPU recomendadas: A100 80GB, H100 80GB, o GPUs con 80 GB o más de VRAM para carga completa en fp16. Para cuantización a 4 bits, una RTX 4090 (24 GB) podría ser suficiente, pero no está verificado.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que el formato de pesos sea compatible. No se ha confirmado soporte para ninguna de estas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la misma categoría (MoE de ~35B con perfil de solo visión) y no hay datos de rendimiento para establecer comparaciones.

## Limitaciones y advertencias

- Falta total de documentación: no hay model card oficial, licencia, ni especificaciones técnicas más allá de los metadatos del repositorio.
- El proceso de poda puede haber degradado significativamente las capacidades del modelo, especialmente en tareas de visión, sin que se haya verificado su funcionamiento.
- No se ha confirmado la compatibilidad con frameworks de inferencia estándar.
- Al no tener licencia, no se puede determinar si su uso comercial está permitido.
- El modelo parece ser un experimento técnico sin validación externa; no se recomienda su uso en entornos de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/affine-kraus/albedo-qwen3.6-35b-bkn1890-vision-only-v3-uid163-20260903-135622
