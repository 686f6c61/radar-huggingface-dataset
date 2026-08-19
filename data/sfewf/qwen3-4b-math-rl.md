# sfewf/qwen3-4b-math-RL

## Resumen

El modelo `sfewf/qwen3-4b-math-RL` es un ajuste posterior al entrenamiento del modelo base Qwen3-4B mediante un pipeline de SFT y aprendizaje por refuerzo (RL) sobre datasets de matemáticas. Lo desarrolla el usuario sfewf (también conocido como ff) y se publica bajo licencia MIT, con un repositorio de código asociado en GitHub (`agi-2026/math-rl`) donde se documenta el estudio sistemático de estrategias de post-entrenamiento para mejorar el razonamiento matemático en un modelo de 4 mil millones de parámetros.

La principal innovación del modelo es la incorporación de un modo de razonamiento denominado **Max-Thinking**, inspirado en DeepSeek V4, que fuerza al modelo a descomponer exhaustivamente el problema, documentar cada paso intermedio y evaluar hipótesis alternativas antes de emitir una respuesta. Además, el modo por defecto (sin max-effort) se entrena con una penalización de longitud (length-penalty), produciendo respuestas más cortas sin sacrificar la precisión. El modelo reporta resultados de evaluación en GSM8K, MATH, BBH y GPQA en dos modos de inferencia (standard y max-effort).

Con 4,4 mil millones de parámetros y un tamaño de repositorio de 17,7 GB en formato safetensors, este modelo es relevante para quienes necesitan una alternativa ligera y de código abierto para tareas de razonamiento matemático, con la posibilidad de desplegarse en hardware de consumo mediante cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer denso, basado en Qwen3-4B) |
| Parametros totales | 4.411.424.256 (~4,4B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (heredada del base Qwen3-4B) |
| Tipos de cuantizacion | No disponibles en el repositorio (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponibles (el base Qwen3-4B es multilingue) |
| Licencia | MIT |
| Formato de pesos | safetensors (17,7 GB, probablemente fp32 o bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso de 4 mil millones de parámetros desarrollado por Alibaba Cloud, que destaca en comprensión del lenguaje, generación, código y matemáticas. El post-entrenamiento se realiza en dos fases: primero un ajuste supervisado (SFT) y posteriormente un refinamiento con RL sobre un dataset de problemas matemáticos, según se documenta en el repositorio `agi-2026/math-rl`. El objetivo es mejorar la precisión y eficiencia del razonamiento sin incrementar el tamaño del modelo.

La innovación técnica principal es el modo **Max-Thinking**, que define un prompt de razonamiento exhaustivo (similar al de DeepSeek V4) donde se exige descomponer el problema, documentar cada paso intermedio, considerar alternativas y rechazar hipótesis no verificadas. En el modo por defecto, se aplica una penalización de longitud para que las respuestas sean concisas, manteniendo la precisión. Los autores señalan como direcciones futuras la mejora del seguimiento de instrucciones de agente, la seguridad y la adición de un cabezal MTP (multi-token prediction).

## Capacidades

- Razonamiento matemático avanzado: resuelve problemas de álgebra, aritmética y razonamiento cuantitativo con alta precisión.
- Razonamiento multi-paso con cadena de pensamiento: el modo max-effort genera deliberaciones exhaustivas y documentadas.
- Modo dual de razonamiento: modo estándar con respuestas cortas y modo max-effort con razonamiento profundo, seleccionables mediante prompt.
- Generación de texto general: hereda las capacidades lingüísticas del base Qwen3-4B (comprensión, generación y codificación).
- Capacidad de razonamiento en problemas tipo puzzle y lógica: evaluado en BBH con resultados notables.
- No se documenta soporte para tool calling, function calling, visión ni audio en la información disponible.

## Casos de uso

- Tutoría de matemáticas automatizada: el modelo puede explicar paso a paso la resolución de problemas de álgebra o teoría de números, usando el modo max-thinking para generar explicaciones didácticas exhaustivas y el modo estándar para respuestas rápidas en un asistente educativo.
- Verificación de soluciones matemáticas: integrado en un pipeline de corrección automática, el modelo puede evaluar si una solución propuesta es correcta, generando una cadena de razonamiento que valida cada paso.
- Generación de problemas de entrenamiento: se puede usar para sintetizar problemas matemáticos nuevos con soluciones razonadas, útil para aumentar datasets de entrenamiento de modelos más pequeños.
- Evaluación de razonamiento en pipelines de investigación: los resultados en GSM8K, MATH, BBH y GPQA permiten usar este modelo como referencia o baseline en experimentos de post-entrenamiento con RL.
- Asistente de razonamiento lógico en entornos de desarrollo: para problemas de optimización combinatoria o verificación de invariantes (como el ejemplo de las pilas de items), el modelo puede generar soluciones formales con condiciones necesarias y suficientes.
- Despliegue en entornos con recursos limitados: gracias a su tamaño de 4,4B y la licencia MIT, se puede integrar en aplicaciones de producción con cuantización INT4/INT8 en hardware de consumo para tareas de razonamiento matemático en tiempo real.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación en el paso 300 de entrenamiento, comparando el modo estándar y el modo max-effort:

| Dataset | Modo standard | Modo max-effort |
|---|---|---|
| GSM8K | 0.9172 | 0.9327 |
| MATH-lighteval | 0.8019 | 0.8505 |
| BBH | 0.7963 | 0.8709 |
| GPQA | 0.2667 | 0.3125 |

No se han publicado comparaciones con otros modelos en la información disponible. El rendimiento en GSM8K (91,7 % estándar, 93,3 % max-effort) es notablemente alto para un modelo de 4,4B, superando típicamente los resultados de modelos base de tamaño similar sin post-entrenamiento específico. El incremento en max-effort es consistente en todos los datasets, siendo mayor en BBH (+7,5 puntos) y MATH (+4,9 puntos).

## Requisitos de hardware

- VRAM estimada para inferencia:
  - fp32 (tamaño del repositorio, 17,7 GB): ~18 GB de VRAM.
  - bf16/fp16: ~9 GB de VRAM.
  - Cuantización INT8: ~4,5 GB de VRAM.
  - Cuantización INT4: ~2,5 GB de VRAM.
- GPU recomendadas: A100 40 GB, H100, RTX 4090 (24 GB) para fp16; RTX 3090, RTX 4070 o superiores para cuantización INT8/INT4.
- Cabe en GPU de consumo: sí, con cuantización INT4/INT8 en GPUs con 8 GB o más de VRAM (RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face Transformers, TGI. No se documenta compatibilidad específica, pero al ser safetensors de un modelo Qwen3, es compatible con el ecosistema estándar.
- Latencia y throughput estimados: no disponibles. Para un modelo de 4,4B en fp16 con vLLM en una RTX 4090 se puede esperar un throughput del orden de 50-100 tokens/s, pero no hay datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | GSM8K | MATH |
|---|---|---|---|---|---|
| **qwen3-4b-math-RL** | 4,4B | No disponible | MIT | 0.9172 (std) / 0.9327 (max) | 0.8019 (std) / 0.8505 (max) |
| Qwen3-4B (base) | 4,4B | No disponible | Apache 2.0 | No disponible | No disponible |
| Qwen3-4B-Instruct | 4,4B | No disponible | Apache 2.0 | No disponible | No disponible |
| DeepSeek-R1-Distill-Qwen-4B | 4,4B | No disponible | MIT | No disponible | No disponible |

No se dispone de datos de benchmarks para los modelos base o destilados en la información proporcionada. La licencia MIT de este modelo es más permisiva que la Apache 2.0 del Qwen3 base, lo que facilita su uso comercial sin restricciones adicionales.

## Limitaciones y advertencias

- Sesgos: no se documentan evaluaciones de sesgo; el modelo se entrena en datos matemáticos, por lo que puede presentar comportamientos no deseados en dominios fuera de matemáticas.
- Riesgo de alucinación: como todo LLM, puede generar razonamientos plausibles pero incorrectos, especialmente en problemas no matemáticos o con contexto ambiguo.
- Limitación de contexto: la longitud de contexto no se especifica en la documentación; se hereda del base Qwen3-4B, que típicamente es de 32K tokens, pero no se confirma.
- Limitación de idioma: no se documentan idiomas soportados; aunque el base Qwen3-4B es multilingue, el entrenamiento en datos matemáticos puede reducir la calidad en tareas lingüísticas generales.
- Producción: no se reportan evaluaciones de seguridad, robustness o toxicidad. No se recomienda su uso directo en aplicaciones de atención al cliente o generación de contenido sin una capa de moderación.
- El modo max-thinking genera razonamientos extensos que incrementan la latencia y el coste de tokens de salida; es necesario gestionar el límite de tokens de generación en despliegues reales.
- No hay soporte documentado para tool calling ni uso como agente, a pesar de que las direcciones futuras del autor mencionan mejorar el seguimiento de instrucciones de agente.

## Enlaces

- Hugging Face: https://huggingface.co/sfewf/qwen3-4b-math-RL
- Perfil del autor: https://huggingface.co/sfewf
- Repositorio GitHub del entrenamiento: https://github.com/agi-2026/math-rl
- Repositorio del base Qwen3: https://github.com/QwenLM/Qwen3
- Ficha de Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
