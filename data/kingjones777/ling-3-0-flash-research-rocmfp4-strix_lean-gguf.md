# kingjones777/Ling-3.0-flash-Research-ROCmFP4-STRIX_LEAN-GGUF

## Resumen

Ling-3.0-flash-Research-ROCmFP4-STRIX_LEAN-GGUF es una variante de investigación del modelo Ling-3.0-flash de inclusionAI, cuantizada específicamente para hardware AMD ROCm con arquitectura gfx1151 (Strix Halo). El modelo base es un MoE (Mixture of Experts) con 127.486.405.600 parámetros totales y aproximadamente 5.100 millones de parámetros activos, diseñado para ofrecer un equilibrio entre calidad y coste computacional. Esta versión utiliza un formato de cuantización experimental ROCmFP4 (ftype 106) con layout de K/V optimizado para Strix, lo que permite ejecutar el modelo en hardware AMD de última generación con un footprint de memoria reducido.

El repositorio es una contribución de kingjones777 (Myron Jones), que documenta un proceso de investigación sobre cuantización ROCmFP4 para la serie Ling. El artefacto se presenta como una variante "Research" separada de la variante alineada STRIX_LEAN, con diferencias en el tipo de tensor de salida (Q4_0_ROCMFP4_FAST en este caso, frente a Q6_K en la versión alineada). Es relevante porque demuestra la viabilidad de ejecutar modelos de 127B en hardware AMD de gama media-alta con rendimiento útil (32 tokens/s en generación), y explora técnicas de cuantización específicas para la familia ROCmFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailingmoe3 (MoE con atención lineal, 43 bloques) |
| Parametros totales | 127.486.405.600 |
| Parametros activos | ~5.100 millones (estimado, no confirmado en el repo) |
| Longitud de contexto | 262.144 (256K nativo, ampliable a 1M según documentación del modelo base) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_STRIX_LEAN (ftype 106), output en Q4_0_ROCMFP4_FAST, embeddings en Q5_K |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-flash emplea una arquitectura MoE con atención lineal y capas de estado (SSM) en bloques específicos, según se refleja en los tensores `blk.N.ssm_f.weight` y `blk.N.ssm_g.weight` (35 cada uno). La variante cuantizada mantiene la estructura original de 43 bloques, con un contexto nativo de 262.144 tokens y una capa de predicción de siguiente token (`nextn_predict_layers = 1`). El proceso de cuantización se realizó a partir de una conversión BF16 del checkpoint original (revisión `42766a814ab117e75e2e61465d5e131b72d931a3`), seguido de cuantización con la herramienta `llama-quantize` utilizando el tipo `Q4_0_ROCMFP4_STRIX_LEAN`. La cuantización ROCmFP4 es experimental y específica para hardware AMD ROCm, optimizada para la familia gfx1151 (Strix Halo), y no es un formato estándar GGUF compatible con todas las plataformas.

## Capacidades

- Generación de texto y razonamiento: el modelo es capaz de producir respuestas coherentes y elaboradas, como se muestra en el ejemplo de finalización de una frase sobre historia de las matemáticas, con capacidad de razonamiento multi-paso (modo "thinking").
- Conocimiento general y especializado: muestra soltura en historia de las matemáticas, cultura general y contextualización de artefactos históricos.
- Capacidad de completar y continuar texto: responde de forma natural a prompts truncados o incompletos, ofreciendo elaboraciones útiles.
- Multilingüe: no hay información específica en el repositorio sobre idiomas soportados, pero el modelo base de inclusionAI es multilingüe.
- Compatibilidad con herramientas: no hay evidencia en el repositorio de soporte para tool calling o function calling; se desconoce si el modelo base lo soporta.
- Modo de pensamiento: el modelo muestra una fase explícita de "thinking" (entre corchetes) antes de la respuesta final, lo que sugiere soporte para razonamiento explícito.

## Casos de uso

- Asistencia educativa: el modelo puede generar explicaciones detalladas y contextualizadas sobre temas históricos, científicos o matemáticos, como se demuestra en el ejemplo de la matemática antigua. Adecuado para plataformas de e-learning.
- Generación de contenido editorial: capacidad de completar y expandir textos, útil para redacción de artículos, libros o contenido web con contexto largo.
- Razonamiento y análisis de documentos: con una ventana de contexto de 256K, puede procesar documentos extensos (manuales, informes, libros) y extraer conclusiones o resúmenes.
- Despliegue local en hardware AMD: la cuantización ROCmFP4 permite ejecutar el modelo en hardware Strix Halo con requisitos de memoria reducidos, ideal para entornos sin acceso a GPUs NVIDIA de gama alta.
- Investigación sobre cuantización: este repositorio es un artefacto de investigación para explorar el rendimiento de cuantizaciones ROCmFP4 en arquitecturas MoE; puede usarse para benchmarking y estudios de eficiencia.
- Chatbots y asistentes de conversación: con soporte de contexto largo y generación fluida, puede utilizarse como motor de chatbots en aplicaciones de atención al cliente o asistentes personales.
- Análisis de textos históricos o académicos: su capacidad de razonamiento y conocimiento general lo hace útil para tareas de análisis documental en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas comparativas con otros modelos. El único dato de rendimiento es una prueba de generación en hardware gfx1151 con llama-cli, que reporta una velocidad de 103.4 tokens/s en prompt (prefill) y 32.0 tokens/s en generación, con una ventana de contexto de 2048 tokens y 512 tokens generados.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF tiene un tamaño de 68 GB (68.020.249.248 bytes), con un peso seco estimado de 64.862.93 MiB (4.27 BPW). En cuantización Q4_0, se necesitan al menos 68-70 GB de VRAM para cargar el modelo completo.
- GPU recomendadas: la cuantización ROCmFP4 está optimizada para AMD ROCm con arquitectura gfx1151 (Strix Halo). No es compatible con GPUs NVIDIA estándar, aunque podría funcionar con Vulkan en algunos casos (según el repositorio de ROCmFP4).
- Consumer GPU: no cabe en ninguna GPU de consumo convencional (como RTX 4090 con 24 GB); requiere hardware de gama alta con 64 GB o más de VRAM.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) con soporte ROCmFP4; se puede integrar con vLLM si se compila con soporte ROCm, pero no se garantiza.
- Latencia y throughput: en el hardware de referencia (gfx1151), se midió 103.4 t/s en prefill y 32.0 t/s en generación; la latencia por token en generación es de ~31 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-flash (base) | 127B totales, 5.1B activos | 256K | BF16 | MIT | HuggingFace |
| Ling-3.0-flash-ROCmFP4-STRIX_LEAN-GGUF (variante alineada) | 127B | 256K | Q4_0_ROCMFP4_STRIX_LEAN (output Q6_K) | MIT | HuggingFace |
| Ling-3.0-flash-Research-ROCmFP4-STRIX_LEAN-GGUF (este modelo) | 127B | 256K | Q4_0_ROCMFP4_STRIX_LEAN (output Q4_0_ROCMFP4_FAST) | MIT | HuggingFace |

La comparativa con otros modelos de la misma categoría (MoE de ~127B) no está disponible en la información proporcionada. Se puede mencionar que el modelo base Ling-3.0-flash es comparable en tamaño a modelos como Mixtral-8x22B (141B) o DeepSeek-V2-Lite, pero no se dispone de datos de benchmarks para comparar directamente.

## Limitaciones y advertencias

- Cuantización experimental: el formato ROCmFP4 es experimental y puede presentar pérdidas de precisión respecto al modelo BF16 original. No se garantiza que sea adecuado para aplicaciones de producción sin validación adicional.
- Compatibilidad limitada: la cuantización es específica para hardware AMD ROCm (gfx1201). No es compatible con plataformas NVIDIA o CPU estándar.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información incorrecta o no verificada; el ejemplo muestra que el modelo ofrece elaboraciones que no siempre están justificadas por el prompt.
- Sesgos: no se dispone de información sobre sesgos del modelo base; se recomienda evaluar en casos de uso concretos.
- Licencia: MIT permite uso comercial y modificación, pero es necesario verificar la licencia del modelo base (inclusionAI/Ling-3.0-flash) para cumplir con sus términos.
- No apto para producción: el autor indica que esta variante "research" no es un sustituto para configuraciones de servidor estándar; la variante alineada (STRIX_LEAN) es más adecuada para despliegues.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Ling-3.0-flash-Research-ROCmFP4-STRIX_LEAN-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Variante alineada: https://huggingface.co/kingjones777/Ling-3.0-flash-ROCmFP4-STRIX_LEAN-GGUF
- Repositorio de cuantización ROCmFP4: https://github.com/charlie12345/rocmfp4
- Documentación de Ling: https://developer.ant-ling.com/en/docs/models/ling/
