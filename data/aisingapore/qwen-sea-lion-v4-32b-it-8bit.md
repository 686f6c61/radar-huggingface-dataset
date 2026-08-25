# aisingapore/Qwen-SEA-LION-v4-32B-IT-8BIT

## Resumen

Qwen-SEA-LION-v4-32B-IT-8BIT es una versión cuantizada a 8 bits del modelo instructivo Qwen-SEA-LION-v4-32B-IT, desarrollado por AI Singapore dentro de la iniciativa SEA-LION (Southeast Asian Languages In One Network). Este modelo está diseñado para ofrecer un rendimiento competitivo en tareas del sudeste asiático, con soporte para once idiomas de la región, manteniendo las capacidades heredadas de Qwen3-32B, como razonamiento avanzado, function calling y una ventana de contexto de 32 768 tokens. La cuantización GPTQ de 8 bits reduce los requisitos de memoria y permite su ejecución en hardware de consumo, con una degradación mínima de rendimiento según los autores.

El modelo continúa el preentrenamiento de Qwen3-32B sobre un corpus de 100 mil millones de tokens en inglés y lenguas del sudeste asiático (birmano, indonesio, malayo, tagalo, tamil, tailandés y vietnamita, entre otras), seguido de un ajuste instructivo. Aunque no ha sido alineado específicamente para seguridad, hereda las capacidades de function calling y modo de pensamiento del modelo base. Su licencia MIT permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura Gemma 3, basada en Qwen3-32B) |
| Parámetros totales | 32,76 mil millones (modelo base Qwen3-32B) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantización | GPTQ 8 bits (esta versión); también disponible en 4 bits y BF16 |
| Idiomas soportados | Birmano, inglés, indonesio, khmer, lao, malayo, mandarín, tagalo, tamil, tailandés y vietnamita |
| Licencia | MIT |
| Formato de pesos | Safetensors (cuantización GPTQ) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-32B, un transformer decoder con arquitectura Gemma 3 (según la documentación oficial de SEA-LION). Se realizó un continuo preentrenamiento sobre 100 mil millones de tokens, mezclando datos web, código, datasets abiertos y datos sintéticos en idiomas del sudeste asiático (birman, indonesio, malayo, tagalo, tamil, tailandés y vietnamita) junto con inglés. El post-entrenamiento incluye ajuste instructivo con técnicas de alineación (no se especifica si se usó RLHF o DPO). La cuantización GPTQ de 8 bits se aplicó sobre el modelo instructivo completo, preservando las capacidades de razonamiento y function calling heredadas de Qwen3. El modelo soporta dos modos de inferencia: modo pensamiento (thinking) y modo no pensamiento, activables mediante el parámetro `enable_thinking`.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, heredado de Qwen3-32B.
- Soporte de function calling / tool calling (integrado en el pipeline de Qwen3).
- Capacidad de agentes con razonamiento multi-step.
- Multilingüe: once idiomas del sudeste asiático más mandarín e inglés.
- Modo de pensamiento (thinking) opcional para tareas complejas.
- Sin capacidades de visión mejoradas: la versión instructiva fue entrenada solo en texto, por lo que sus capacidades visuales son comparables a las de Qwen3-32B (limitadas).

## Casos de uso

- Atención al cliente automatizada en idiomas del sudeste asiático: el modelo puede gestionar conversaciones multi-turno con contexto largo (32k tokens) en tailand, vietnamano, tagalo, etc., ofreciendo respuestas contextualizadas y en el idioma del usuario.
- Generación de código en entornos de producción: soporta tool calling, lo que permite integrarlo en pipelines de CI/CD para autocompletar, revisar o generar código en inglés o en idiomas locales con comentarios multilingües.
- Traducción automática local: al estar especializado en lenguas de la región, puede servir como motor de traducción de alta calidad entre inglés y los idiomas SEA, incluyendo dialectos y variantes locales.
- Análisis de sentimiento y extracción de información en textos de redes sociales o encuestas en idiomas minoritarios: su entrenamiento con datos sintéticos y web de la región le permite entender matices culturales y expresiones locales.
- Asistentes virtuales de empresas con presencia en el sudeste asiático: el modo de pensamiento permite razonar sobre consultas complejas, mientras que el modo no pensamiento ofrece respuestas rápidas para preguntas frecuentes.
- Generación de contenido creativo localizado (blogs, anuncios, guiones) en idiomas como malayo o tagalog, con tono y contexto cultural apropiado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos en la información disponible. La model card indica que Qwen-SEA-LION-v4-32B-IT (versión BF16) destaca en tareas SEA-HELM comparado con modelos abiertos de menos de 200 mil millones de parámetros, y que la versión 8BIT no muestra una degradación notable. Para detalles, se remite al [SEA-HELM leaderboard](https://leaderboard.sea-lion.ai/). No se proporcionan cifras numéricas en la documentación.

## Requisitos de hardware

- VRAM estimada: no especificada en la información proporcionada. La versión 8BIT está diseñada para reducir memoria respecto al modelo BF16, y según los autores puede ejecutarse en un portátil con GPU de consumo.
- GPU recomendadas: la cuantización 8 bits permite ejecución en GPUs de 24 GB de VRAM (p. ej., RTX 3090, RTX 4090) o superiores. Para despliegue en servidor, se recomienda A100 o H100 con cuantización adicional.
- Compatibilidad con consumer GPUs: sí, la versión 8BIT está pensada para ese fin.
- Opciones de despliegue: compatible con Transformers (Hugging Face), text-generation-inference (TGI) y endpoints compatibles. También se puede usar con vLLM (aunque no se menciona explícitamente).
- Latencia y throughput: no se ofrecen datos numéricos. La tabla de recursos métricos en la model card está incompleta en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Observaciones |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v4-32B-IT-8BIT | 32.76B | 32k | 11 idiomas SEA + en | MIT | Cuantizado 8-bit, especializado SEA |
| Qwen-SEA-LION-v4-32B-IT (BF16) | 32.76B | 32k | 11 idiomas SEA + en | MIT | Versión completa sin cuantizar |
| Qwen3-32B (base) | 32.76B | 32k | Multilingüe | Apache 2.0 | Modelo base sin especialización SEA |
| SeaLLM v2 (ejemplo) | 7B/13B | 8k | SEA + en | Apache 2.0 | Alternativa de menor tamaño, menos contexto |

No se dispone de más alternativas comparables con datos fiables en la información proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad: los autores advierten que no se ha probado contra ataques adversariales y que se debe realizar un fine-tuning de seguridad antes de uso en producción.
- Riesgo de alucinación: como todo LLM, puede generar contenido falso o no basado en el contexto.
- Limitaciones de visión: solo texto; sus capacidades visuales son limitadas y similares a las de Qwen3-32B.
- La cuantización 8-bit puede introducir ligeras pérdidas de precisión en tareas muy sensibles, aunque los autores indican que es imperceptible en la mayoría de los casos.
- Idiomas no cubiertos: no soporta idiomas fuera de la lista (por ejemplo, japonés o coreano) de forma nativa.
- No se ha probado la robustez ante prompts adversariales, por lo que en aplicaciones críticas se deben implementar filtros y validaciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-LION-v4-32B-IT-8BIT
- Modelo base (BF16): https://huggingface.co/aisingapore/Qwen-SEA-LION-v4-32B-IT
- Blog de anuncio: https://sea-lion.ai/blog/qwen-sea-lion-v4-advanced-reasoning/
- Documentación oficial: https://docs.sea-lion.ai/models/sea-lion-v4/qwen-sea-lion-v4-32b
- Leaderboard SEA-HELM: https://leaderboard.sea-lion.ai/
- GitHub de SEA-LION: https://github.com/aisingapore/sealion
