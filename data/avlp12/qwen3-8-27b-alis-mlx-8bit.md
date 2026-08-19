# avlp12/Qwen3.8-27B-Alis-MLX-8bit

## Resumen

El modelo **Qwen3.8-27B-Alis-MLX-8bit** es una cuantización en 8 bits en formato MLX del checkpoint multimodal **Qwen/Qwen3.8-27B**, publicada por el usuario avlp12 y diseñada específicamente para Apple Silicon. Se trata de la primera build MLX de este modelo que conserva íntegramente la torre de visión (333 tensores, 0,461B parámetros en bf16 sin cuantizar) y la cabeza MTP (Multi-Token Prediction), lo que permite ejecutar el modelo completo con capacidades de imagen-texto en hardware de Apple sin necesidad de portar código adicional.

La relevancia de esta publicación radica en dos aspectos: por un lado, ofrece una fidelidad estadísticamente indistinguible del original bf16 en perplejidad de corpus (inglés, coreano y código) con un 54% del tamaño y 1,73× la velocidad de decodificación; por otro, corrige una carencia habitual en otras builds MLX del mismo modelo, que omiten los pesos de visión y fallan al recibir imágenes. El modelo está pensado para entornos de producción en Mac con 48 GB o más de memoria unificada, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) con atención híbrida, GQA y decodificación especulativa |
| Parametros totales | 8.146.596.592 (según safetensors; el nombre comercial "27B" no coincide con el recuento real) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card menciona "context 26" sin completar; se recomienda consultar el config.json del repo) |
| Tipos de cuantizacion | 8-bit (este repo), 6-bit y 4-bit (AWQ) publicados por el mismo autor |
| Idiomas soportados | No disponibles (la model card evalúa inglés, coreano y código, pero no declara lista oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal de tipo `Qwen3_5ForConditionalGeneration` con atención híbrida (hybrid-attention) y decodificación especulativa. En la parte de texto, la arquitectura consta de 64 capas, dimensión oculta 5120, atención GQA con 24 cabezas de consulta sobre 4 cabezas KV, head_dim 256, FFN de 17408 y vocabulario de 248.320 tokens. La torre de visión tiene profundidad 27, hidden 1152, 16 cabezas, patch 16 y spatial merge 2, y se conserva en bf16 sin cuantizar en esta build.

La cuantización 8-bit se realizó sobre el checkpoint original, manteniendo tanto la torre de visión como la cabeza MTP (31 tensores). El autor no detalla el proceso de entrenamiento o calibración, pero reporta que la perplejidad de corpus (ctx 2048, stride 512) sobre ≈103K tokens es estadísticamente indistinguible de la del bf16 en inglés, coreano y código. La decodificación especulativa se soporta mediante la cabeza MTP (k=2) y un drafter DSpark, lo que contribuye a la velocidad de 21,8 tok/s en decodificación.

## Capacidades

- Generación de texto y razonamiento multilingüe (evaluado en inglés, coreano y código).
- Comprensión y descripción de imágenes: el modelo acepta entradas de imagen y texto, y produce descripciones detalladas (verificado con un test de formas y colores).
- Conversación multimodal multi-turno (pipeline `image-text-to-text`).
- Decodificación especulativa integrada (MTP head y drafter DSpark) para acelerar la inferencia en Apple Silicon.
- Soporte de tool calling y function calling: no documentado explícitamente en la model card, pero el modelo base Qwen3.8-27B lo incluye; no se confirma en esta build.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información proporcionada.

## Casos de uso

- **Asistente de accesibilidad para personas con discapacidad visual**: el modelo puede describir imágenes en tiempo real desde un Mac, gracias a su torre de visión intacta y su baja latencia (21,8 tok/s en decodificación). Es adecuado porque mantiene la fidelidad del bf16 y no requiere GPU externa.
- **Generación de documentación técnica a partir de capturas de pantalla**: un desarrollador puede pasar una captura de una interfaz y obtener una descripción estructurada en texto, útil para issues o manuales. La ventana de contexto (aunque no confirmada) y la calidad de código lo hacen viable.
- **Análisis de gráficos y figuras en informes científicos**: el modelo puede interpretar figuras complejas y generar explicaciones textuales, aprovechando la torre de visión sin cuantizar que preserva la precisión visual.
- **Chatbot de atención al cliente en coreano**: la perplejidad en coreano es estadísticamente indistinguible del bf16, lo que lo hace adecuado para producción en ese idioma, especialmente en entornos Apple.
- **Prototipado rápido de aplicaciones multimodales en Mac**: al ser una build MLX lista para usar con mlx-vlm, permite integrar visión-lenguaje en apps de macOS sin necesidad de servicios en la nube.
- **Evaluación de calidad de otras cuantizaciones**: al ser la build de mayor fidelidad del conjunto, sirve como referencia para comparar las versiones 6-bit y 4-bit en tareas de generación larga o agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta únicamente perplejidad de corpus (ctx 2048, stride 512) sobre ≈103K tokens, comparando las distintas builds con el original bf16:

| Build | Tamaño (GB) | Decode (tok/s) | Prefill (tok/s) | PPL en / ko / code |
|---|---|---|---|---|
| bf16 reference | 51,8 | 12,6 | 410 | 5,7734 / 6,0954 / 1,6813 |
| 8-bit (este repo) | 27,9 | 21,8 | 429 | 5,7760 / 6,0987 / 1,6815 |
| 6-bit | 21,5 | 27,3 | 424 | 5,7924 / 6,1018 / 1,6854 |
| 4-bit (AWQ) | 15,2 | 37,5 | 436 | 5,8450 / 6,2609 / 1,8105 |

La perplejidad del 8-bit es estadísticamente indistinguible de la del bf16 en todas las categorías, mientras que el 4-bit muestra un coste significativo (+1,2% en inglés, +2,7% en coreano, +7,7% en código).

## Requisitos de hardware

- **VRAM estimada**: 28,2 GB de pico en carga con contexto corto; 34,46 GB a 16K de contexto. Se recomienda un Mac con 48 GB o más de memoria unificada para la build 8-bit.
- **GPU recomendadas**: Apple Silicon (M-series). Las pruebas se realizaron en un M3 Ultra con 512 GB de memoria unificada.
- **Compatibilidad con GPU de consumo**: no aplica, ya que MLX está restringido a Apple Silicon. No es compatible con GPUs NVIDIA o AMD.
- **Opciones de despliegue**: mlx-vlm 0.6.13 (soporta `qwen3_5` sin porting), también se puede usar con MLX-LM para generación de texto. No se mencionan vLLM, llama.cpp u Ollama.
- **Latencia y throughput**: 21,8 tok/s en decodificación y 429 tok/s en prefill (medidos en M3 Ultra). El 6-bit alcanza 27,3 tok/s y el 4-bit 37,5 tok/s.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de la misma categoría (por ejemplo, otros vision-language en MLX). La única comparación publicada es entre las builds del propio autor y el original bf16. Como referencia, se puede comparar con el modelo base Qwen3.8-27B en su formato original:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (bf16) | 8,1B (según safetensors) | No disponible | Apache 2.0 | Safetensors | Original, requiere ~52 GB |
| Qwen3.8-27B-Alis-MLX-8bit | 8,1B | No disponible | Apache 2.0 | Safetensors (MLX) | Cuantización 8-bit, 27,9 GB, visión intacta |
| Qwen3.8-27B-Alis-MLX-6bit | 8,1B | No disponible | Apache 2.0 | Safetensors (MLX) | 21,5 GB, 27,3 tok/s |
| Qwen3.8-27B-Alis-MLX-4bit | 8,1B | No disponible | Apache 2.0 | Safetensors (MLX) | 15,2 GB, 37,5 tok/s, mayor pérdida de calidad |

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan en la model card; al ser una cuantización del modelo Qwen, hereda los sesgos del modelo base, que no se detallan.
- **Riesgo de alucinación**: no se evalúa en la información proporcionada; se recomienda validar en tareas de alto riesgo.
- **Limitaciones de contexto**: la longitud de contexto no se especifica completamente (la model card se corta en "context 26"). Se debe consultar el config.json del repo antes de usarlo con contextos largos.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener términos adicionales; se recomienda revisar la licencia del modelo original.
- **Dependencia de Apple Silicon**: el formato MLX no es ejecutable en GPUs de otros fabricantes; limita el despliegue a hardware Apple.
- **Pérdida de calidad en cuantizaciones menores**: la build 4-bit muestra un coste significativo en perplejidad, especialmente en código (+7,7%); no recomendada para generación de código en producción.
- **Fidelidad de la torre de visión**: aunque se conserva en bf16, no se han publicado evaluaciones de calidad visual más allá de una prueba informal con formas y colores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/avlp12/Qwen3.8-27B-Alis-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería mlx-vlm (soporte para `qwen3_5`): https://github.com/Blaizzy/mlx-vlm
