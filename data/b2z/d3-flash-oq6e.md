# b2z/d3-flash-oQ6e

## Resumen

d3-flash-oQ6e es una cuantización mixta del modelo d3-flash, publicada por el usuario b2z en Hugging Face. Se ha generado con la herramienta oQ de oMLX (versión v0.7.4.dev1), que aplica cuantización de precisión mixta sobre el checkpoint original. El resultado es un checkpoint de 8.392.695.024 parámetros almacenado en 7.044 GiB, con un promedio efectivo de 7.209 bits por peso. La arquitectura subyacente está etiquetada como `qwen3_5`, lo que sugiere una variante de la familia Qwen 3.5, e incluye un componente de visión de 0,456B de parámetros.

El modelo está empaquetado exclusivamente para MLX, la librería de Apple para ejecución de modelos en silicio de la compañía (chips M-series). Esto lo hace adecuado para inferencia local en equipos Mac, no para despliegues en GPU NVIDIA. El repo ocupa 7,6 GB e incluye safetensors con código personalizado (`custom_code`), lo que implica que la carga requiere confiar en la implementación incluida en el repositorio.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de cuantización reciente (creado en noviembre de 2026), sin descargas ni likes, sin model card descriptiva del modelo base y sin licencia declarada. Es un ejemplo de cuantización mixta agresiva que reduce un modelo de ~8B a poco más de 7 GiB manteniendo capas en BF16 y FP32 para preservar precisión en componentes sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`), con componente de visión |
| Parametros totales | 8.392.695.024 (~8,39B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6-bit grupo 64 (85,13%), affine 8-bit grupo 64 (9,41%), BF16 (5,45%), FP32 (0,01%); media efectiva 7,209 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), con `custom_code` |
| Tamano del repo | 7,6 GB (7.044 GiB de pesos) |
| Libreria | mlx |
| Fecha de creacion | 2026-11-06 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de la etiqueta `qwen3_5`, que apunta a un transformer de la familia Qwen 3.5. El desglose de almacenamiento confirma tres componentes: un modelo de lenguaje de 7,937B de parámetros lógicos, un módulo de visión de 0,456B y un "decision readout" de 0,001B. Este último sugiere algún mecanismo de decisión o clasificación auxiliar, pero no se detalla su función.

No se dispone de datos sobre el entrenamiento: número de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas del modelo original. Lo único documentado es el proceso de cuantización: oQ aplica precisión mixta asignando 6 bits a la mayoría de pesos (85,13%), 8 bits a una fracción relevante (9,41%) y manteniendo en BF16 un 5,45% de los pesos y en FP32 un 0,01%. Esta distribución busca preservar la calidad en capas críticas mientras comprime el resto, logrando 7.044 GiB frente a los ~16,8 GB que ocuparía el mismo modelo en BF16.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen 3.5, aunque no se documentan explícitamente en la model card.
- Procesamiento de visión: el checkpoint incluye un módulo visual de 0,456B de parámetros, por lo que se espera soporte de entrada de imágenes.
- Capacidad de decisión auxiliar: el componente "decision readout" sugiere una salida adicional de clasificación o selección, sin especificar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con silicio Apple: al estar en formato MLX, el modelo se ejecuta de forma nativa en chips M1/M2/M3/M4 mediante la librería mlx, aprovechando la memoria unificada. Es el caso de uso principal y prácticamente el único viable sin conversión.
- Prototipado de asistentes multimodales en local: el módulo de visión permite experimentar con tareas imagen-texto en un equipo de sobremesa sin depender de la nube, con un peso de 7 GiB que cabe en configuraciones de 16 GB de memoria unificada.
- Evaluación de técnicas de cuantización mixta: el checkpoint sirve como referencia para comparar la pérdida de calidad de oQ frente al modelo en BF16, útil para investigadores que estudien compresión de modelos.
- Desarrollo de aplicaciones de escritorio con privacidad: al ejecutarse íntegramente en local, permite construir herramientas de análisis de documentos o imágenes sin enviar datos a servidores externos.
- Experimentación con el componente "decision readout": equipos que investiguen arquitecturas con cabezas auxiliares de decisión pueden inspeccionar este checkpoint como ejemplo funcional.
- Base para fine-tuning ligero en MLX: el formato y la cuantización permiten adaptaciones con LoRA sobre el modelo cuantizado en hardware Apple, aunque la licencia no declarada es un riesgo a resolver antes de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 7.044 GiB de pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 10-12 GB de memoria unificada para contexto moderado.
- GPU recomendadas: no aplica GPU NVIDIA; requiere silicio Apple (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el formato MLX.
- ¿Cabe en consumer GPU? No en el sentido habitual (CUDA); sí en Mac con 16 GB o más de memoria unificada.
- Opciones de despliegue: exclusivamente MLX (`mlx-lm` u oMLX). No es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión previa a otro formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| d3-flash-oQ6e | 8,39B | no disponible | MLX safetensors (7,2 bits efectivos) | no disponible | Cuantización mixta de oQ, solo Apple |
| Modelo base d3-flash (BF16) | ~8,39B | no disponible | safetensors | no disponible | Referencia de calidad; ~16,8 GB |
| Qwen 3.5 (variante ~8B) | ~8B | no disponible | safetensors/GGUF | no disponible | Familia de origen según la etiqueta |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es un bloqueo potencial para producción.
- Sin model card del modelo base: se desconoce el contexto máximo, idiomas, datos de entrenamiento y sesgos conocidos.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks no se puede estimar el impacto de la cuantización en la fidelidad.
- Cuantización agresiva: 85% de los pesos a 6 bits puede degradar tareas sensibles a precisión (matemáticas, código) frente al BF16.
- Dependencia de `custom_code`: requiere ejecutar código del repositorio, lo que implica un riesgo de seguridad y de compatibilidad con versiones futuras de MLX.
- Exclusivo de Apple Silicon: no desplegable en infraestructura CUDA estándar sin conversión manual.
- Cero tracción: 0 descargas y 0 likes; sin validación comunitaria de su funcionamiento.
- Fechas del repositorio (noviembre de 2026) y ausencia de documentación dificultan verificar la procedencia exacta del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/b2z/d3-flash-oQ6e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Librería MLX: https://github.com/ml-explore/mlx
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
