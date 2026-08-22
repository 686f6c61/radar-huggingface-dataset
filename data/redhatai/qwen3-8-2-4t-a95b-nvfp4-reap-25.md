# RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-REAP-25

## Resumen

RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-REAP-25 es una versión cuantizada del modelo Qwen3.8-2.4T-A95B, desarrollada por Red Hat AI. Esta variante aplica cuantización NVFP4 a las capas Mixture-of-Experts (MoE) y una poda uniforme del 25% de los expertos, reduciendo significativamente el tamaño del modelo y su huella de memoria para facilitar su despliegue en entornos de producción con vLLM. El modelo original, lanzado por Qwen en agosto de 2026, es un MoE de 2,4 billones de parámetros con 95 mil millones activos por token, arquitectura de atención híbrida y una ventana de contexto de 1 millón de tokens. Esta versión cuantizada mantiene un rendimiento cercano al original en benchmarks como GPQA Diamond (91,5 frente a 92,6) y DeepSWE 1.1 (56,6 en ambos), lo que la convierte en una opción atractiva para entornos de producción donde la capacidad de cómputo es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con 512 expertos enrutados, 10 activos, 1 experto compartido, 92 capas, attention hibrida |
| Parametros totales | 2,4 billones (original) / 1,85 billones (tras poda del 25% de expertos) |
| Parametros activos | 95 mil millones |
| Longitud de contexto | 1 millon de tokens |
| Tipos de cuantizacion | NVFP4 (capas MoE), sparsity 25 % en expertos; existe variante NVFP4-FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-2.4T-A95B emplea una arquitectura de mezcla de expertos (MoE) con 512 expertos enrutados, de los cuales se activan 10 por token, más un experto compartido. La columna vertebral tiene 92 capas con atención híbrida, combinando mecanismos de atención tradicionales con alternativas más eficientes para manejar secuencias largas. La versión cuantizada aplica cuantización NVFP4 (4 bits) a las capas MoE y una poda uniforme del 25 % de los expertos, reduciendo el número de parámetros totales de 2,4 billones a 1,85 billones. El proceso de calibración se realizó con 1024 muestras del dataset open-perfectblend, y el modelo está diseñado para servirse con vLLM, con soporte de parallelismo tensorial y de expertos.

## Capacidades

- Generación de texto y razonamiento complejo, especialmente en dominios científicos y de ingeniería (según los benchmarks GPQA y DeepSWE).
- Soporte de razonamiento explícito mediante el parser `qwen3` de vLLM, con niveles de esfuerzo configurables (`reasoning-effort`).
- Conversación multi-turno (etiqueta `conversational`).
- Compatible con despliegue en vLLM mediante `vllm serve` con `tensor-parallel-size` y `enable-expert-parallel`.
- No se han documentado capacidades de tool calling ni de visión en la información disponible.

## Casos de uso

- **Investigación científica avanzada**: el modelo destaca en GPQA Diamond (91.5), lo que lo hace adecuado para resolver preguntas complejas de física, química y biología en entornos académicos.
- **Ingeniería de software automatizada**: con un resultado de 56.6 en DeepSWE 1.1, puede abordar tareas de desarrollo de software como la corrección de bugs, refactorización y generación de código, aunque requiere integración con pipelines de CI/CD y herramientas de control de versiones.
- **Análisis de datos y razonamiento estadístico**: su capacidad de razonamiento de alto nivel permite procesar y analizar grandes volúmenes de datos, generando informes o conclusiones sobre patrones complejos.
- **Asistentes de investigación documental**: con una ventana de contexto de 1 millón de tokens, puede leer y resumir libros técnicos, artículos o conjuntos de documentos extensos en una sola pasada.
- **Evaluación y comparación de modelos**: su licencia MIT y su compatibilidad con vLLM permiten utilizarlo como modelo de referencia en sistemas de evaluación de otros modelos de IA.
- **Despliegue en entornos empresariales**: al ser una versión cuantizada, reduce el coste de infraestructura en comparación con el modelo original, lo que facilita su integración en servicios de producción con vLLM.

## Benchmarks y rendimiento

| Benchmark | `Qwen/Qwen3.8-2.4T-A95B` | `RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-REAP-25` | `RedHatAI/Qwen3.8-2.4T-A95B-NVFP4` |
| - | - | - | - |
| GPQA Diamond | 92.6 | 91.5 | 92.9 |
| DeepSWE 1.1 | 56.6 | 56.6 | - |

La tabla muestra que la versión con sparsity (REAP-25) pierde solo 1.1 puntos en GPQA Diamond respecto al modelo original, mientras que la versión sin sparsity (NVFP4) incluso mejora ligeramente. En DeepSWE no hay diferencia. No se dispone de resultados en otros benchmarks como MMLU o HumanEval en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: 899.5 GB según LLM Explorer.
- Se requiere un clúster de GPUs de alta gama; la configuración recomendada es 8 GPUs con `tensor-parallel-size 8` y `enable-expert-parallel 8`, lo que implica al menos 112 GB de VRAM por GPU.
- No es viable en GPUs de consumo (como RTX 4090) por la cantidad de VRAM necesaria.
- Opciones de despliegue: vLLM (recomendado), también compatible con transformers y otras librerías que soporten safetensors.
- Latencia y throughput: no se proporcionan datos específicos en la documentación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GPQA | DeepSWE | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-2.4T-A95B | 2.4T | 1M | 92.6 | 56.6 | MIT |
| RedHatAI NVFP4-REAP-25 | 1.85T (tras sparsity) | 1M | 91.5 | 56.6 | MIT |
| RedHatAI NVFP4 (sin sparsity) | 2.4T | 1M | 92.9 | - | MIT |

La comparativa interna muestra que la poda del 25 % de los expertos reduce los parámetros en un 23 % a costa de una pérdida mínima en GPQA (1.1 puntos) y sin pérdida en DeepSWE. No se dispone de datos de otros modelos comparables en esta ficha.

## Limitaciones y advertencias

- **Pérdida de precisión**: la cuantización NVFP4 y la sparsity pueden degradar el rendimiento en tareas de alta precisión, aunque los benchmarks muestran una diferencia mínima.
- **Alucinación**: al ser un modelo de razonamiento, puede generar respuestas plausibles pero incorrectas, especialmente en dominios con datos escasos.
- **Requisitos de hardware**: necesita una infraestructura de servidores con múltiples GPUs de alta VRAM, lo que limita su uso a entornos corporativos o de investigación.
- **Idiomas**: no se especifica la lista de idiomas soportados, aunque Qwen suele cubrir múltiples lenguas; no se puede confirmar la cobertura completa.
- **Licencia**: MIT permite uso comercial sin restricciones, pero el modelo base y sus variantes dependen de la licencia de Qwen (también MIT), por lo que no hay restricciones adicionales.
- **Sparsity**: la eliminación del 25 % de los expertos puede afectar a la robustez en tareas poco comunes o fuera de la distribución de entrenamiento.

## Enlaces

- [Hugging Face - RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-REAP-25](https://huggingface.co/RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-REAP-25)
- [LLM Explorer - Qwen3.8 2.4T A95B NVFP4 REAP 25](https://llm-explorer.com/model/RedHatAI%2FQwen3.8-2.4T-A95B-NVFP4-REAP-25)
- [vLLM Recipes - Qwen/Qwen3.8-2.4T-A95B](https://recipes.vllm.ai/Qwen/Qwen3.8-2.4T-A95B)
- [QwenCloud - Qwen3.8-2.4T-A95B](https://www.qwencloud.com/models/qwen3.8-2.4t-a95b)## Resumen

RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-REAP-25 es una versión cuantizada del modelo Qwen3.8-2.4T-A95B, desarrollada por Red Hat AI. Esta variante comprime las capas Mixture-of-Experts (MoE) mediante cuantización NVFP4 y aplica una poda uniforme del 25 % de los expertos, reduciendo el número total de parámetros de 2,4 billones a 1,85 billones. El objetivo es facilitar el despliegue en entornos de producción con vLLM, manteniendo un rendimiento cercano al modelo original. El modelo base, lanzado por Qwen en agosto de 2026, es un MoE con 512 expertos enrutados, 10 activos por token, 92 capas con atención híbrida y una ventana de contexto de 1 millón de tokens. La versión cuantizada ofrece resultados casi idénticos en benchmarks clave como GPQA Diamond (91,5 frente a 92,6) y DeepSWE 1.1 (56,6 en ambos), lo que la convierte en una opción interesante para investigaciones que requieren eficiencia computacional sin sacrificar precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con 512 expertos enrutados, 10 activos, 1 experto compartido, 92 capas, attention hibrida |
| Parametros totales | 2,4 billones (original) / 1,85 billones (tras sparsity del 25 %) |
| Parametros activos | 95 mil millones |
| Longitud de contexto | 1 millon de tokens |
| Tipos de cuantizacion | NVFP4 (capas MoE), sparsity 25 % en expertos; existe variante NVFP4-FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3-8-2.4T-A95B emplea una arquitectura MoE con 512 expertos enrutados, de los cuales se activan 10 por token, junto con un experto compartido. La columna vertebral tiene 92 capas con atención híbrida, que combina mecanismos de atención tradicionales con alternativas eficientes para manejar secuencias largas. La versión cuantizada de Red Hat AI aplica cuantización NVFP4 a las capas MoE y elimina el 25 % de los expertos de forma uniforme, reduciendo el número de parámetros totales de 2,4 billones a 1,85 billones. La calibración se realizó con 1024 muestras del dataset open-perfectblend, y el modelo está diseñado para ser servido con vLLM, soportando paralelismo tensorial y de expertos. No se ha realizado un entrenamiento adicional, sino una compresión del modelo original.

## Capacidades

- **Generación de texto y razonamiento complejo**, con resultados destacados en tareas de ciencia (GPQA Diamond) y de ingeniería de software (DeepSWE).
- **Razonamiento explícito**: soporta el parser `qwen3` de vLLM, permitiendo configurar niveles de esfuerzo de razonamiento (`reasoning-effort`).
- **Conversación multi-turno**, gracias a su naturaleza de modelo de lenguaje conversacional.
- **Compatibilidad con vLLM** para despliegue optimizado, con opciones de paralelismo experto y tensorial.
- No se han documentado capacidades de tool calling, visión ni audio en la información disponible.

## Casos de uso

- **Investigación científica**: con un 91.5 en GPQA Diamond, es adecuado para resolver preguntas complejas de física, química y biología en entornos académicos.
- **Desarrollo de software asistido**: su resultado de 56.6 en DeepSWE 1.1 permite automatizar tareas de corrección de errores, refactorización y generación de código en repositorios reales.
- **Análisis de documentos extensos**: gracias a su ventana de contexto de 1 millón de tokens, puede procesar libros, informes técnicos o conjuntos de documentos completos en una sola pasada.
- **Asistentes de investigación**: puede actuar como un copiloto para investigadores, resumiendo artículos, extrayendo conclusiones y proponiendo hipótesis.
- **Evaluación de otros modelos**: al ser un modelo de referencia con licencia MIT, puede utilizarse como baseline en pipelines de evaluación de sistemas de IA.
- **Despliegue empresarial de bajo coste**: la cuantización reduce los requisitos de hardware, permitiendo ejecutar el modelo en infraestructuras de 8 GPUs con vLLM, manteniendo un rendimiento competitivo.

## Benchmarks y rendimiento

| Modelo | GPQA Diamond | DeepSWE 1.1 |
|---|---|---|
| Qwen/Qwen3.8-2.4T-A95B (original) | 92.6 | 56.6 |
| RedHatAI NVFP4-REAP-25 | 91.5 | 56.6 |
| RedHatAI NVFP4 (sin sparsity) | 92.9 | - |

La tabla muestra que la versión con sparsity pierde solo 1.1 puntos en GPQA Diamond frente al original, mientras que en DeepSWE mantiene el mismo rendimiento. La variante sin sparsity incluso mejora ligeramente GPQA, aunque no se dispone de su resultado en DeepSWE. No se han publicado otros benchmarks como MMLU o HumanEval en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: 899.5 GB según LLM Explorer.
- **GPU recomendadas**: se necesitan al menos 8 GPUs de alta gama con `tensor-parallel-size 8` y `enable-expert-parallel 8`, lo que implica aproximadamente 112 GB de VRAM por GPU (por ejemplo, H200 o A100 80GB no serían suficientes; se requieren GPUs con más memoria, como H200 141GB o A100 100GB).
- **No cabe en GPUs de consumo**: no es viable en RTX 3090 o similares por la cantidad de VRAM necesaria.
- **Opciones de despliegue**: vLLM (recomendado), también es compatible con transformers y otros frameworks que soporten safetensors.
- **Latencia y throughput**: no se han publicado datos específicos para esta variante.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | GPQA | DeepSWE | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-2.4T-A95B | 2.4T | 95B | 92.6 | 56.6 | MIT |
| RedHatAI NVFP4-REAP-25 | 1.85T | 95B | 91.5 | 56.6 | MIT |
| RedHatAI NVFP4 (sin sparsity) | 2.4T | 95B | 92.9 | - | MIT |

La comparativa interna muestra que la poda del 25 % de expertos reduce un 23 % el número de parámetros totales con una pérdida mínima en GPQA (1.1 puntos) y sin pérdida en DeepSWE. No se dispone de datos de otros modelos comparables de la misma categoría en esta ficha.

## Limitaciones y advertencias

- **Pérdida de precisión**: la cuantización NVFP4 y la sparsity pueden afectar a tareas de alta precisión, aunque los benchmarks muestran una diferencia mínima.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en temas no representados en sus datos de entrenamiento.
- **Alto requisito de hardware**: requiere una infraestructura de servidores con múltiples GPUs de alta VRAM, lo que limita su uso a organizaciones con recursos importantes.
- **Idiomas**: no se especifica la lista de idiomas soportados, aunque Qwen suele ser multilingüe; no se puede confirmar la cobertura completa.
- **Licencia**: MIT permite uso comercial sin restricciones, pero el modelo base también es MIT, por lo que no hay limitaciones adicionales.
- **Sparsity**: la eliminación del 25 % de los expertos puede afectar a la robustez en tareas poco comunes o fuera de la distribución de entrenamiento.

## Enlaces

- [Hugging Face - RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-REAP-25](https://huggingface.co/RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-REAP-25)
- [LLM Explorer - Qwen3.8 2.4T A95B NVFP4 REAP 25](https://llm-explorer.com/model/RedHatAI%2FQwen3.8-2.4T-A95B-NVFP4-REAP-25)
- [vLLM Recipes - Qwen/Qwen3.8-2.4T-A95B](https://recipes.vllm.ai/Qwen/Qwen3.8-2.4T-A95B)
- [QwenCloud - Qwen3.8-2.4T-A95B](https://www.qwencloud.com/models/qwen3.8-2.4t-a95b)
