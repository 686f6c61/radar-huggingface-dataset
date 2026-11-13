# bambocher/gemma-4-31B-it-qat-mlx

## Resumen

bambocher/gemma-4-31B-it-qat-mlx es una conversión a formato MLX del modelo Gemma 4 31B instruct de Google, entrenado originalmente con quantization-aware training (QAT) para la rejilla q4_0 de llama.cpp. El autor reproduce esa misma rejilla de cuantización en MLX en lugar de recuantizar con los métodos habituales, preservando los códigos de 4 bits y las escalas por bloque del modelo QAT original. El resultado son aproximadamente 20,6 GB de pesos pensados para ejecutarse en un Mac con 48 GB de memoria unificada o más.

El modelo es multimodal (texto e imagen) e incluye la torre de visión, además de soporte para MTP (multi-token prediction) según las etiquetas del repositorio. Su relevancia radica en que demuestra una conversión de cuantización fiel al maestro QAT de Google, con métricas explícitas de divergencia KL (0,0206) y acuerdo top-1 (94,93 %) frente a los pesos bf16 de referencia, algo poco habitual en conversiones comunitarias.

Se distribuye bajo licencia Apache 2.0, la misma que el modelo base, con 33.309.714.284 parámetros totales según los safetensors y un tamaño de repositorio de 21,6 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión), cuantizado en MLX |
| Parámetros totales | 33.309.714.284 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit afín grupo 32 en la rejilla q4_0 (375 Linears), 8-bit en 35 Linears del decodificador de texto, 6-bit en embeddings, 8-bit en la torre de visión, bf16 en las proyecciones down del MLP de visión y en las norms |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 31B instruct, entrenado por Google con quantization-aware training específicamente para la rejilla q4_0 de llama.cpp. Esta conversión no reentrena ni ajusta los pesos: transforma el maestro `google/gemma-4-31B-it-qat-q4_0-unquantized` a MLX manteniendo exactamente la rejilla QAT. MLX almacena la cuantización afín de 4 bits con grupo 32 como `scale·q + bias`; con `scale = d` y `bias = -8d` se obtiene la propia rejilla de q4_0, de modo que los 375 Linears del decodificador de texto conservan bloque a bloque los códigos de Google. La única diferencia es el redondeo de la escala de fp16 a bf16 (tipo de escala de MLX), con un error inferior a 1/64 de paso por peso.

Sobre esa base, el autor eleva a 8-bit los 35 Linears del texto que más pierden a 4 bits, seleccionados midiendo la divergencia KL que elimina cada uno por MB añadido frente al maestro bf16; casi todos son proyecciones K/V de atención y el coste total es de unos 400 MB. Los embeddings se mantienen en 6-bit (equivalente al Q6_K del GGUF de Google), la torre de visión —que nunca recibió QAT— va en 8-bit, y las proyecciones down del MLP de visión (ancho 4304, no múltiplo del grupo mínimo de 32 de MLX) permanecen en bf16, unos 270 MB. El autor descarta explícitamente las conversiones habituales (`mlx_lm.convert -q`, que reajusta mínimos y máximos por grupo, y los builds qat de mlx-community con grupo 64) por alejarse de la rejilla entrenada.

## Capacidades

- Generación de texto conversacional con plantilla de chat y canal de razonamiento (thinking channel) que puede cerrarse.
- Comprensión de imágenes: el modelo identifica el contenido de una fotografía (verificado en la model card con una imagen de un animal).
- Razonamiento multi-turno en formato instruct.
- Soporte declarado de MTP (multi-token prediction) en las etiquetas del repositorio.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac Apple Silicon: el formato MLX y los 20,6 GB de pesos permiten ejecutar un modelo de 31B multimodal en un equipo con 48 GB de memoria unificada, sin GPU dedicada ni servicios en la nube.
- Asistente conversacional con imágenes: al incluir la torre de visión, puede responder preguntas sobre capturas, diagramas o fotografías dentro de una conversación multi-turno usando la plantilla de chat del modelo.
- Evaluación de cuantizaciones: sirve como referencia práctica para estudiar el impacto de la rejilla QAT frente a recuantizaciones convencionales, con métricas de KL y acuerdo top-1 publicadas.
- Prototipado de pipelines multimodales en local: integrable en scripts Python con MLX para experimentar con entrada image-text-to-text antes de pasar a despliegues mayores.
- Reproducción de resultados: el repositorio de código asociado (`qat_mlx_pipeline.sh`, `qat_aligned_convert.py`, `qat_sensitivity.py`, `qat_eval.py`) permite replicar la conversión y la evaluación para otros tamaños de la familia Gemma 4.
- Docencia e investigación sobre cuantización: el método de selección de capas a 8-bit por KL por MB es un caso documentado y reproducible para estudiar sensibilidad por capa.

## Benchmarks y rendimiento

Evaluación sobre Wikitext-2 (test), 128 ventanas de 512 tokens, puntuado como respuesta de chat del modelo (plantilla de chat, canal de razonamiento cerrado). KL y acuerdo top-1 medidos frente al maestro QAT en bf16.

| Modelo | Tamaño | PPL | KL frente al maestro QAT | Acuerdo top-1 |
|---|---|---|---|---|
| Maestro QAT bf16 (google/gemma-4-31B-it-qat-q4_0-unquantized) | — | 26,94 | — | — |
| **Este modelo** | **20,6 GB** | **27,82** | **0,0206** | **94,93 %** |

El autor advierte que la PPL sirve para comparar este build con su maestro, no con otros modelos, y que el modelo puntúa en los miles sobre texto crudo (incluido el propio maestro de Google) porque interpreta el texto fuera de un turno de chat como su propio razonamiento.

## Requisitos de hardware

- VRAM/memoria estimada: unos 20,6 GB de pesos; el autor indica que se necesita un Mac de 48 GB o más, ya que en un Mac de 32 GB el límite de GPU no deja espacio para la caché KV.
- GPU recomendadas: no disponibles para CUDA; el formato MLX está orientado a Apple Silicon con memoria unificada.
- ¿Cabe en GPU de consumo? No hay datos para GPU NVIDIA o AMD; en Apple Silicon requiere 48 GB de memoria unificada.
- Opciones de despliegue: MLX (librería `mlx`), con pesos en safetensors; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **bambocher/gemma-4-31B-it-qat-mlx** | 33,3 B | no disponible | 4/6/8-bit MLX sobre rejilla q4_0 | Apache 2.0 | Hugging Face (MLX) |
| google/gemma-4-31B-it-qat-q4_0-gguf | 31 B (nominal) | no disponible | q4_0 GGUF | Apache 2.0 (según base) | Hugging Face (GGUF) |
| google/gemma-4-31B-it-qat-q4_0-unquantized | 31 B (nominal) | no disponible | bf16 (maestro QAT) | Apache 2.0 | Hugging Face |
| google/gemma-4-31B-it | 31 B (nominal) | no disponible | sin cuantizar | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, salvo la PPL del maestro bf16 (26,94) frente a la de este build (27,82).

## Limitaciones y advertencias

- Solo es ejecutable con MLX; no es compatible directamente con llama.cpp, vLLM, TGI ni Ollama.
- Requiere un Mac con 48 GB de memoria unificada o más; en 32 GB no queda espacio para la caché KV.
- El modelo base está entrenado para QAT en q4_0; desviarse de esa rejilla (por ejemplo, recuantizando) degrada la fidelidad respecto al maestro.
- La torre de visión nunca recibió QAT y se mantiene en 8-bit con partes en bf16; su comportamiento cuantizado no está validado con métricas más allá de la comprobación cualitativa de identificar un animal en una foto.
- El modelo puntúa valores de perplejidad muy altos sobre texto crudo fuera de la plantilla de chat, por lo que debe usarse siempre con el formato conversacional previsto.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; deben asumirse los del modelo base de Google.
- Idiomas soportados no documentados en este repositorio.
- La licencia Apache 2.0 se hereda del modelo base; conviene verificar los términos de uso de Gemma 4 publicados por Google para despliegues comerciales.
- Repositorio con 134 descargas y 0 likes en el momento de la consulta: es un artefacto comunitario, no una release oficial de Google.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/gemma-4-31B-it-qat-mlx
- Modelo base (maestro QAT): https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Modelo base sin cuantizar: https://huggingface.co/google/gemma-4-31B-it
- GGUF q4_0 de Google: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-gguf
- Código y notas del método: https://github.com/rromenskyi/quant-ternary/tree/main/gemma4-quant
