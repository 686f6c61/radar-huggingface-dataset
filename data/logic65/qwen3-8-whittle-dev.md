# logic65/Qwen3.8-Whittle-dev

## Resumen

El repositorio `logic65/Qwen3.8-Whittle-dev` es la vertiente de desarrollo de la familia Whittle, un proyecto de investigación sobre compresión y destilación de modelos de lenguaje. Partiendo del modelo base `Qwen/Qwen3.8-27B-FP8` (Apache 2.0), el autor David Aylward explora quince configuraciones distintas de poda de capas, reducción de ancho y destilación secuencial, documentando para cada una su rendimiento en una batería de 39 prompts de generación y un atlas de 80 sondas de conocimiento. El objetivo no es ofrecer un modelo listo para producción, sino cartografiar qué partes de la arquitectura son prescindibles, cuáles son críticas y cómo se comporta el conocimiento cuando se elimina tejido neuronal.

La relevancia actual radica en que aborda preguntas abiertas en interpretabilidad y eficiencia: dónde reside el conocimiento factual, cómo afecta la poda a la capacidad de detener la generación (evitar bucles) y si la destilación puede reparar daños estructurales. El README documenta hallazgos como que la atención por sí sola no computa nada (las capas recurrentes son las que procesan) o que la colocación de las capas de atención influye más que la cantidad de parámetros eliminados. No se publican pesos únicos para esta variante dev; el autor recomienda usar la variante `Qwen3.8-Whittle-tri-14.7B` para ejecución práctica, mientras que este repositorio contiene recetas, adaptadores y scripts de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas recurrentes y atención (derivada de Qwen3.8-27B-FP8) |
| Parametros totales | No disponible (múltiples variantes: 16.8B, 20.8B, 18.3B, 14.7B, etc.) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el modelo base es FP8; se mencionan GGUF para otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B-FP8, una arquitectura que combina capas de atención con capas recurrentes (según se desprende del README, que habla de "attention stations" y "recurrent tissue"). El proceso Whittle aplica tres tipos de intervención: poda de capas completas (por ejemplo, eliminar 44 o 48 de las capas totales), reducción del ancho de los MLP (por ejemplo, dividir a la mitad todas las capas) y destilación secuencial (comprimir 64 capas en 32). Tras cada intervención se mide el rendimiento con un atlas de 80 sondas de conocimiento y una batería de 39 prompts de generación.

El entrenamiento incluye fases de QLoRA (3 horas en la variante "heal"), fine-tuning global de 90 minutos para corregir la descoordinación del conocimiento tras destilación secuencial, y técnicas de reparación con adaptadores LoRA. El README documenta hallazgos clave: la atención sola no produce salida útil (las capas recurrentes son esenciales), la poda de capas borra conocimiento mientras que la reducción de ancho solo lo degrada temporalmente, y la destilación con un objetivo global (no por etapas) recupera capacidades que parecían perdidas. También advierte de que la fusión de LoRA es obligatoria porque llama.cpp no puede aplicar LoRA a esta arquitectura debido a la proyección GDN fusionada.

## Capacidades

- Generación de texto y razonamiento básico: las variantes comprimidas mantienen capacidad de completar respuestas, aunque con puntuaciones variables en la batería (desde 12/39 en la destilación sin reparar hasta 36/39 en la mejor variante).
- Conocimiento factual: el atlas de sondas muestra que el conocimiento no está distribuido uniformemente; ciertos bloques (8-11) contienen información específica de desarrollo web y identificadores raros.
- Aritmética y sentido común: la variante 48L cut conserva estas capacidades, según la búsqueda web, aunque con errores ocasionales (por ejemplo, el modelo reparado recita la regla de precedencia de operadores pero falla al aplicarla).
- Sin soporte de tool calling, agentes ni multimodalidad: es un modelo de lenguaje puro, sin capacidades adicionales documentadas.
- Capacidad de detener la generación: la probabilidad de fin de turno (P(end-of-turn)) cae drásticamente en cortes agresivos, lo que provoca bucles; la restauración de ciertos bloques la recupera.

## Casos de uso

- Investigación en compresión de modelos: permite estudiar cómo afecta la poda de capas y la reducción de ancho a diferentes habilidades, con métricas detalladas por dominio.
- Estudio de localización del conocimiento: los resultados con sondas por dominio ayudan a identificar qué bloques almacenan información específica (por ejemplo, web-dev) y cómo se puede preservar.
- Análisis de destilación y reparación: el repositorio incluye scripts y recetas para reproducir la destilación secuencial y el fine-tuning global, útil para investigar técnicas de recuperación de conocimiento.
- Desarrollo de técnicas de interpretabilidad: los hallazgos sobre la relación entre atención y capas recurrentes pueden informar diseños de arquitecturas más eficientes.
- Pruebas de eficiencia en hardware limitado: las variantes más pequeñas (14.7B) pueden ejecutarse en GPUs de consumo, lo que permite experimentar con modelos comprimidos sin grandes recursos.
- Benchmarking de metodologías de evaluación: la batería de 39 prompts y el atlas de 80 sondas ofrecen un marco reproducible para comparar estrategias de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El README proporciona mediciones internas con una batería de 39 prompts de generación y un atlas de 80 sondas de conocimiento. La siguiente tabla resume las variantes principales y su puntuación en la batería:

| Variante | Parámetros | Puntuación batería (sobre 39) |
|---|---|---|
| Whittle-16B v1 heal | 16.8B | 36/39 |
| 48L cut | 20.8B | 35/39 |
| Restored 18.3B | 18.3B | 34/39 |
| v40 identity-guided | 16.8B | 31/39 |
| Tri repaired | 14.7B | 31/39 |
| 44L cut | 19.2B | 28/39 |
| w50 uniform width | 18.3B | 27/39 |
| Tri raw, pre-heal | 14.7B | 12/39 |

Además, se reportan mediciones específicas como la probabilidad de fin de turno (0.53 en el modelo intacto, 0.05 en los peores cortes, 0.55 tras restaurar bloques 8-11) y el error relativo de destilación (0.0045 al absorber una estación de atención en sus vecinos recurrentes, frente a 0.035 al eliminarla).

## Requisitos de hardware

- No se especifican requisitos para esta variante dev, ya que no se publican pesos únicos.
- El README indica que los scripts de entrenamiento y las recetas son ejecutables en dos tarjetas gráficas de 12 GB (por ejemplo, dos RTX 3060 o similares).
- La variante recomendada para ejecución, `Qwen3.8-Whittle-tri-14.7B`, tiene 14.7B parámetros y puede caber en GPUs de consumo con cuantización (no se detalla cuál).
- La variante 48L cut (20.8B) se ejecuta a 5 tok/s en dos GPUs de 8 GB según la búsqueda web, lo que sugiere que las variantes más pequeñas podrían funcionar en una sola GPU de 12-16 GB.
- Para despliegue, se menciona compatibilidad con llama.cpp para algunas variantes, pero no con LoRA (requiere fusión previa). Otras opciones como vLLM o TGI no están documentadas.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de compresión similares en la información proporcionada. La única comparación directa es con el modelo base `Qwen/Qwen3.8-27B-FP8` (27B parámetros, FP8), del cual se derivan todas las variantes. La siguiente tabla resume las diferencias principales:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-FP8 (base) | 27B | No disponible | Apache-2.0 | HuggingFace |
| Qwen3.8-Whittle-tri-14.7B | 14.7B | No disponible | Apache-2.0 | HuggingFace (pesos publicados) |
| Qwen3.8-Whittle-dev (este repo) | Múltiples (16.8B-20.8B) | No disponible | Apache-2.0 | Repositorio de desarrollo, sin pesos únicos |

No se han encontrado modelos de compresión comparables (por ejemplo, otras podas de Qwen) en la información disponible.

## Limitaciones y advertencias

- Es un repositorio de investigación, no un modelo listo para producción: no se garantiza estabilidad, robustez ni soporte.
- El README documenta trampas concretas: el modelo reparado puede recitar reglas (como "la multiplicación precede a la suma") pero fallar al aplicarlas (responde 30 para 10 + 2 * 5).
- La destilación secuencial sin objetivo global degrada severamente el rendimiento (12/39 en la batería); solo el fine-tuning global posterior lo recupera parcialmente.
- La fusión de LoRA es obligatoria para usar las variantes con llama.cpp; no hay soporte de LoRA en tiempo de inferencia para esta arquitectura.
- Los adaptadores LoRA pueden contener metadatos con rutas locales que HuggingFace rechaza; se requiere parcheo.
- No se han evaluado sesgos ni alucinaciones de forma sistemática; los datos de conocimiento provienen de sondas internas, no de benchmarks externos.
- La licencia Apache-2.0 permite uso comercial, pero al ser un modelo derivado de Qwen3.8-27B-FP8, se deben respetar los términos de la licencia del modelo base.
- No hay información sobre idiomas soportados; se asume que hereda las capacidades del modelo base, pero no está confirmado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/logic65/Qwen3.8-Whittle-dev
- Variante recomendada para ejecución: https://huggingface.co/logic65/Qwen3.8-Whittle-tri-14.7B
- Variante 48L cut: https://huggingface.co/logic65/Qwen3.8-Whittle-48L-cut
- Colección de modelos ejecutables: https://huggingface.co/collections/logic65/whittle-models-you-can-run-6a82e929ca80146cde320f0b
- Colección de investigación y desarrollo: https://huggingface.co/collections/logic65/whittle-research-and-dev-6a82e929e52c7347edf9ec64
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de OpenLM sobre Qwen3.8: https://openlm.ai/qwen3.8/
- Documentación de QwenCloud: https://docs.qwencloud.com/changelog/models
