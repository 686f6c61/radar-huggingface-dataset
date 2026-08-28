# pipenetwork/GLM-5.3-MLX-4bit

## Resumen

GLM-5.3-MLX-4bit es una conversión a MLX (Apple Silicon) del modelo GLM-5.3 de Z.ai, cuantizada a 4 bits con grupo de 64. El modelo original es un MoE de 744B parámetros con arquitectura `glm_moe_dsa` (256 expertos, top-8, atención MLA con sparse attention estilo DeepSeek-V3.2). Esta versión está pensada para ejecutarse en hardware Apple con memoria unificada muy grande (512 GB), y su principal valor es permitir ejecutar un modelo de esta escala en Mac, algo que no es posible con las versiones bf16 o fp8 originales.

El autor, PipeNetwork, ha adaptado el runtime MLX para manejar correctamente el esquema de indexadores compartidos de GLM-5.3, que en la implementación estándar de mlx-lm falla con 285 parámetros faltantes. La conversión se ha realizado desde la versión bf16 (no desde fp8) porque, según las mediciones del autor, la versión fp8 tiene una divergencia mayor que la cuantización a 6 bits. El resultado es un checkpoint de 418,6 GB que requiere 512 GB de RAM, lo que limita su uso a estaciones de trabajo muy específicas.

La relevancia de este modelo radica en que demuestra la viabilidad de ejecutar modelos de 744B en hardware de consumo (aunque sea de gama muy alta) mediante cuantización agresiva y un runtime optimizado. Sin embargo, no se han publicado benchmarks estándar (MMLU, HumanEval, etc.) para esta conversión, solo mediciones de divergencia y perplexity frente a la versión bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (MoE, 256 expertos, top-8, MLA con sparse attention) |
| Parametros totales | 744B (según model card; safetensors reporta 116.4B, posible discrepancia de metadatos) |
| Parametros activos | no disponible (no se indica en la documentación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (group 64) |
| Idiomas soportados | no disponible |
| Licencia | GLM-5.3 (otra) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer MoE con 256 expertos enrutados (top-8 activos) y atención MLA (Multi-head Latent Attention) con sparse attention. La arquitectura `glm_moe_dsa` incluye un "lightning indexer" que selecciona claves para la atención dispersa, pero solo 21 de las 78 capas tienen pesos de indexador propios; las otras 57 capas reutilizan la selección de la capa anterior. El runtime incluido en este checkpoint implementa ese comportamiento de forma correcta, a diferencia de la implementación estándar de mlx-lm que deja esos indexadores aleatorios.

Esta conversión se ha realizado desde la versión bf16 del modelo, no desde la fp8, porque las mediciones del autor muestran que la fp8 tiene una divergencia mayor que la cuantización a 6 bits. No se incluye la capa de multi-token prediction (capa 78). No hay información sobre el entrenamiento original del modelo (datos, tokens, RLHF, etc.) en la documentación de esta conversión.

## Capacidades

- Generación de texto y conversación: al ser una conversión del GLM-5.3, hereda las capacidades del modelo base, que según la documentación de Z.ai es especialmente fuerte en coding y tareas de largo horizonte.
- Razonamiento: el modelo base GLM-5.3 ha sido optimizado para tareas complejas de razonamiento, aunque no se han verificado estas capacidades específicamente en esta conversión.
- Soporte de tool calling y agentes: no se menciona en la documentación de esta conversión; se desconoce si el runtime MLX soporta estas funciones.
- Multilingüismo: no se indica qué idiomas soporta.
- Capacidades especiales: no se documentan capacidades de visión, audio o thinking mode en esta conversión.

## Casos de uso

- Investigación en entornos Apple Silicon: permite ejecutar un modelo de 744B en un Mac con 512 GB de RAM, algo que no es posible con las versiones bf16 o fp8. Útil para probar el comportamiento de modelos MoE a gran escala sin necesidad de clústeres GPU.
- Generación de código en local: dado que el modelo base destaca en coding, esta conversión podría usarse para generación de código en un Mac de gama alta, aunque con una latencia considerable.
- Experimentación con cuantización: el autor ha publicado varias versiones (4-bit, mixed-4_8bit, mixed-3_6bit) que permiten estudiar el impacto de la cuantización en la calidad del modelo.
- Desarrollo de runtimes MLX: el código del runtime (glm53-mlx) es un ejemplo de cómo adaptar arquitecturas complejas a MLX, útil para desarrolladores que trabajen con modelos MoE en Apple Silicon.
- Evaluación de divergencia: las herramientas de evaluación incluidas (eval_ladder.py) permiten medir la degradación por capa, útil para investigar efectos de cuantización.
- Despliegue en entornos con memoria unificada muy grande: aunque no es un caso común, estaciones de trabajo con 512 GB de RAM pueden ejecutar este modelo para tareas de generación de texto de alta calidad.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). En su lugar, el autor proporciona mediciones de divergencia por capa y perplexity en wikitext-2.

**Divergencia por capa frente a bf16** (menor es mejor):

| Receta | Teacher-forced (media) | Free-running (capa final) | Coseno (final) |
|---|---|---|---|
| 8-bit | 0.00685 | 0.13119 | 0.98945 |
| 6-bit | 0.01465 | 0.16736 | 0.98389 |
| 5-bit | 0.02651 | 0.22521 | 0.97272 |
| 4-bit | 0.05161 | 0.35740 | 0.93390 |
| mixed-4_8bit | 0.02524 | 0.24951 | 0.96710 |
| mixed-3_6bit | 0.05242 | 0.42380 | 0.90624 |
| fp8 | 0.01741 | 0.17321 | 0.98320 |

**Perplexity en wikitext-2 (test)** para las versiones que caben en 512 GB:

| Build | Tamaño | Perplexity [95% CI] |
|---|---|---|
| 4-bit | 418.6 GB | 2.8636 [2.6681, 3.0714] |
| mixed-4_8bit | 427.8 GB | 2.7420 [2.5533, 2.9477] |
| mixed-3_6bit | 332.6 GB | 3.0338 [2.8366, 3.2386] |

La versión 4-bit tiene una perplexity ligeramente peor que la mixed-4_8bit, pero mejor que la mixed-3_6bit. La divergencia free-running de 4-bit (0.357) es la más alta de las versiones que caben en 512 GB, lo que indica una degradación notable respecto al bf16.

## Requisitos de hardware

- Tamaño en disco: 418.6 GB.
- RAM necesaria: 512 GB (según la model card, "RAM: 512 GB, tight").
- Hardware objetivo: Apple Silicon (Mac con memoria unificada de 512 GB). No es compatible con GPUs NVIDIA.
- Despliegue: se usa `mlx_lm.generate` con `--trust-remote-code`. El runtime incluido en el checkpoint es necesario para un funcionamiento correcto.
- Latencia y throughput: no se proporcionan datos. Dado el tamaño y la cuantización, se espera una generación lenta, pero no hay cifras concretas.
- Alternativas: para hardware con menos RAM, el autor publica versiones mixed-3_6bit (332.6 GB) que caben en 384 GB, aunque con peor calidad.

## Comparativa con modelos similares

Comparación con otras versiones cuantizadas del mismo modelo base (GLM-5.3):

| Modelo | Parámetros | Cuantización | Tamaño | Perplexity (wikitext-2) | Licencia |
|---|---|---|---|---|---|
| GLM-5.3-MLX-4bit | 744B | 4-bit | 418.6 GB | 2.8636 | GLM-5.3 |
| GLM-5.3-MLX-mixed-4_8bit | 744B | 4-bit/8-bit | 427.8 GB | 2.7420 | GLM-5.3 |
| GLM-5.3-MLX-mixed-3_6bit | 744B | 3-bit/6-bit | 332.6 GB | 3.0338 | GLM-5.3 |
| GLM-5.3-BF16 (original) | 744B | bf16 | ~1.5 TB (estimado) | no disponible | GLM-5.3 |

No se dispone de comparación con otros modelos de la misma escala (p. ej., DeepSeek-V3, Llama 4) porque no hay benchmarks estándar publicados para esta conversión.

## Limitaciones y advertencias

- La capa de multi-token prediction (capa 78) no está incluida en esta conversión, lo que puede afectar a la velocidad de generación y a la calidad en ciertos patrones.
- Si se usa mlx-lm estándar sin el runtime incluido, 57 de las 78 capas tendrán indexadores aleatorios, lo que degrada la calidad para prompts de más de 2048 tokens. El runtime incluido soluciona este problema.
- La cuantización 4-bit introduce una divergencia significativa (free-running error 0.357) frente al bf16, lo que puede afectar a tareas que requieren alta precisión.
- Requiere 512 GB de RAM, lo que limita su uso a equipos muy específicos. No es viable en hardware de consumo estándar.
- No se han publicado benchmarks estándar (MMLU, HumanEval, etc.) para esta conversión, por lo que no se puede comparar directamente con otros modelos.
- La licencia GLM-5.3 es "other" y puede tener restricciones de uso comercial; se debe revisar el archivo LICENSE adjunto.
- El safetensors reporta 116.4B parámetros, lo que contradice la cifra de 744B de la model card. Es probable que sea un error de metadatos, pero conviene verificarlo antes de usar el modelo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipenetwork/GLM-5.3-MLX-4bit
- Repositorio del runtime: https://github.com/PipeNetwork/glm53-mlx
- Modelo base GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Repositorio oficial GLM-5: https://github.com/zai-org/GLM-5
- Artículo sobre GLM-5.3-Flash (modelo relacionado): https://www.marktechpost.com/2026/08/26/z-ai-releases-glm-5-3-flash-a-320b-a18b-natively-multimodal-moe-with-a-1m-token-context/
