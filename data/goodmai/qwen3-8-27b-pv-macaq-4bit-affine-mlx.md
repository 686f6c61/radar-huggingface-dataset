# goodmai/Qwen3.8-27B-PV-MACaQ-4bit-Affine-MLX

## Resumen

El modelo `goodmai/Qwen3.8-27B-PV-MACaQ-4bit-Affine-MLX` es una cuantización a 4 bits del modelo base `Qwen/Qwen3.8-27B`, publicada por el usuario goodmai. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a la inferencia en Apple Silicon mediante el framework MLX. La técnica empleada, denominada PV-MACaQ, combina una rotación de Walsh-Hadamard por bloques de 64 elementos con un escalado previo óptimo (`pre_scale`) y un pulido de tipo clip/V-step, con el objetivo de reducir el error de cuantización respecto a la cuantización RTN (round-to-nearest) convencional.

El resultado es un artefacto de 16,06 GB distribuido en cuatro shards, diseñado explícitamente para ejecutarse en equipos Mac con 24 GB de memoria unificada. El modelo conserva 27.360.120.048 parámetros totales, aunque la mayoría de las capas del backbone están almacenadas en 4 bits, mientras que las capas de visión, normalizaciones y convoluciones 1D permanecen en BF16. La model card reporta una mejora de SQNR medio de 20,61 dB (RTN 4-bit) a 21,59 dB (PV-MACaQ 4-bit), con una reducción del error cuadrático medio del 19,5 %.

La relevancia de esta ficha radica en que documenta un caso de cuantización agresiva con preservación de calidad medible, orientada a hardware de consumo. No obstante, la información pública disponible es muy limitada: no se especifican licencia, idiomas, pipeline ni resultados de benchmarks, y el modelo base `Qwen3.8-27B` no está documentado en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | 27.360.120.048 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine PV-MACaQ (grupo 64, H64) en backbone; 4-bit affine g64 en `embed_tokens` y `lm_head`; BF16 en visión, norms y conv1d |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 4 shards, 16,06 GB |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.8-27B`, del que no se dispone de información arquitectónica detallada en el material proporcionado. La model card indica que la cuantización se realizó a partir de `mlx-community/Qwen3.8-27B-8bit`, es decir, partiendo de una versión ya cuantizada a 8 bits, lo que implica una doble cuantización (8-bit a 4-bit) en lugar de partir de los pesos originales en BF16. Este detalle es relevante porque puede acumular error adicional respecto a una cuantización directa desde el modelo original.

La innovación técnica principal es el esquema PV-MACaQ: una rotación de Walsh-Hadamard por bloques de 64 elementos aplicada antes de la cuantización, combinada con un `pre_scale` óptimo y un paso de pulido clip/V-step. Según la model card, este procedimiento mejora el SQNR medio de 20,61 dB a 21,59 dB y reduce el MSE un 19,5 % frente a RTN 4-bit. La distribución de módulos cuantizados es de 496 capas del backbone en 4-bit affine PV-MACaQ g64 H64, 2 capas en 4-bit affine g64 (`embed_tokens` y `lm_head`) y 686 tensores en BF16 correspondientes a visión, normalizaciones y convoluciones 1D. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, sin documentación específica en la información disponible.
- Procesamiento de visión: la presencia de 686 tensores en BF16 etiquetados como "vision/norms/conv1d" sugiere que el modelo base incorpora un codificador visual, aunque no se detalla su funcionamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac de 24 GB: el modelo está empaquetado en 16,06 GB y usa MLX, por lo que puede cargarse en un MacBook Pro o Mac Studio con memoria unificada de 24 GB, dejando margen para el sistema y el contexto.
- Prototipado de aplicaciones de visión-lenguaje en local: la presencia de capas de visión en BF16 permite experimentar con tareas multimodales sin depender de la nube, siempre que se valide el comportamiento real del modelo base.
- Evaluación de técnicas de cuantización: el artefacto sirve como referencia reproducible para comparar PV-MACaQ frente a RTN 4-bit midiendo SQNR y MSE en un modelo de 27B.
- Despliegue con el servidor Basalt: la model card proporciona el comando `basalt serve --model ... --kv-bits 4 --prompt-cache-mb 0 --wired-limit --rest`, lo que permite levantar un endpoint REST local para pruebas de integración.
- Generación de texto asistida en entornos sin GPU: al ejecutarse sobre Apple Silicon con MLX, es adecuado para flujos de trabajo de escritorio que no pueden usar CUDA.
- Investigación sobre doble cuantización: permite estudiar la degradación acumulada al pasar de 8-bit a 4-bit en modelos grandes, comparando con cuantizaciones directas desde BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es de calidad de cuantización:

| Metrica | RTN 4-bit | PV-MACaQ 4-bit |
|---|---|---|
| SQNR medio (vs 8-bit) | 20,61 dB | 21,59 dB |
| MSE relativo | referencia | -19,5 % |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16,06 GB solo para pesos; con KV cache en 4 bits y overhead del runtime, se recomienda un mínimo de 24 GB de memoria unificada, tal como indica la model card.
- GPU recomendadas: Apple Silicon (series M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra con 24 GB o más). No es compatible de forma nativa con CUDA.
- ¿Cabe en GPU de consumo? Sí, en Mac con 24 GB o más de memoria unificada. No se dispone de información sobre GPUs NVIDIA consumer.
- Opciones de despliegue: MLX y el servidor Basalt (`basalt serve`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y probablemente no sean compatibles con este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodmai/Qwen3.8-27B-PV-MACaQ-4bit-Affine-MLX | 27,36B | no disponible | 4-bit PV-MACaQ (MLX) | no disponible | Hugging Face |
| mlx-community/Qwen3.8-27B-8bit | 27,36B (base) | no disponible | 8-bit | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B | 27,36B | no disponible | BF16 original | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá del SQNR reportado frente a RTN 4-bit.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede confirmar el uso comercial; debe verificarse en el repositorio del modelo base.
- La cuantización se realizó a partir de una versión de 8 bits, no de los pesos originales, lo que puede introducir error acumulado adicional.
- El SQNR de 21,59 dB es una métrica de fidelidad respecto a la versión de 8 bits, no una medida de calidad absoluta de las respuestas.
- El modelo está atado al ecosistema MLX y Apple Silicon; no es portable a CUDA sin reconversión.
- No hay información sobre sesgos, riesgo de alucinación, idiomas soportados ni limitaciones de contexto del modelo base.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-20), por lo que carece de validación comunitaria.
- El pipeline no está declarado, lo que dificulta la integración automática en herramientas estándar de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodmai/Qwen3.8-27B-PV-MACaQ-4bit-Affine-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión de 8 bits usada como origen: https://huggingface.co/mlx-community/Qwen3.8-27B-8bit
- Repositorio Basalt: https://github.com/goodmai/basalt
