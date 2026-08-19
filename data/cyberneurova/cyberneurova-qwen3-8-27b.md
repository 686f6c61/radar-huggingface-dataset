# cyberneurova/cyberneurova-Qwen3.8-27B

## Resumen

El modelo `cyberneurova/cyberneurova-Qwen3.8-27B` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.8-27B, desarrollado por CyberNeurova. Se presenta como un asistente "sin censura" y neutral: responde de forma directa sin añadir descargos, advertencias ni avisos no solicitados, y respeta íntegramente el system prompt que el usuario le proporcione. Está pensado para entornos donde se requiere un control total sobre el estilo y las políticas de la conversación.

Con 27.781.427.952 parámetros (aproximadamente 27,8 mil millones), una ventana de contexto de 262.000 tokens y soporte multilingüe, el modelo conserva las capacidades de razonamiento, tool-calling y generación de código del modelo base. Según la documentación, en un benchmark de codificación ejecutable (donde las funciones generadas se ejecutan contra casos de prueba ocultos) alcanza un 92% pass@1 (11 de 12 pruebas). Se distribuye bajo licencia Apache-2.0 y se sirve en BF16, funcionando directamente en vLLM, transformers o cualquier servidor compatible con la API de OpenAI.

La relevancia de este modelo radica en su enfoque "uncensored" y altamente personalizable, dirigido a desarrolladores que necesitan un asistente técnico sin restricciones predeterminadas, manteniendo un rendimiento sólido en tareas de razonamiento y programación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen/Qwen3.8-27B (arquitectura no especificada) |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | BF16 (inferencia); otros no especificados |
| Idiomas soportados | Multilingüe (idiomas concretos no disponibles) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

No se proporcionan detalles técnicos sobre la arquitectura interna del modelo más allá de que es un fine-tune de Qwen/Qwen3.8-27B. La model card indica que se sirve en BF16 y que es un modelo de razonamiento, lo que sugiere que conserva la arquitectura transformer del modelo base, pero no se especifican detalles como el número de capas, cabezas de atención o mecanismos de atención. Tampoco se documentan los datos de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas como RLHF o DPO. La única innovación destacada es el ajuste para reducir rechazos y ofrecer respuestas directas, sin modificar las capacidades subyacentes.

## Capacidades

- Generación de texto y conversación multi-turno con contexto largo (262K tokens).
- Razonamiento con trace de pensamiento (thinking trace) antes de la respuesta final.
- Tool-calling y function calling, compatible con agentes y flujos automatizados.
- Generación de código: 92% pass@1 en un benchmark de codificación ejecutable (palindrome, two-sum, prime test, binary search, merge, GCD, flatten, anagram, max-subarray, word-count, Roman numerals).
- Multilingüe, aunque no se detallan los idiomas concretos.
- Posible soporte de entrada de imágenes según los tags de HuggingFace (image-text-to-text), aunque no se confirma en la documentación.
- Comportamiento "uncensored": sin descargos automáticos, totalmente controlable mediante el system prompt.

## Casos de uso

- Asistente técnico personalizado: el modelo respeta el system prompt al pie de la letra, permitiendo definir un tono y unas políticas específicas sin interferencias. Ideal para equipos de soporte que necesitan un asistente con directrices propias.
- Generación de código en producción: con un 92% pass@1 en tareas de programación, puede integrarse en pipelines de CI/CD para generar funciones, tests o documentación técnica, reduciendo la intervención manual.
- Agentes autónomos con tool-calling: su capacidad de llamar a funciones y razonar multi-step lo hace adecuado para construir agentes que interactúan con APIs, bases de datos o servicios externos.
- Análisis de datos y razonamiento lógico: gracias a su contexto de 262K tokens, puede procesar grandes volúmenes de texto, resumir documentos extensos o extraer conclusiones a partir de datos no estructurados.
- Entornos de investigación sin restricciones: al no añadir advertencias automáticas, es útil para experimentos donde se necesita una respuesta neutra y sin sesgos de seguridad, siempre bajo responsabilidad del usuario.
- Desarrollo de chatbots multilingües: su soporte multilingüe permite construir asistentes conversacionales para audiencias internacionales, con control total sobre el estilo y el contenido.

## Benchmarks y rendimiento

La única métrica publicada en la información disponible es un benchmark de codificación ejecutable, donde el modelo obtiene 11/12 (92%) pass@1. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

| Benchmark | Resultado |
|---|---|
| Codificación ejecutable (pass@1) | 11/12 (92%) |

No se dispone de comparaciones con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- Tamaño del repositorio: 55,6 GB, consistente con pesos en BF16 (27,8 B parámetros × 2 bytes = 55,6 GB).
- VRAM estimada para inferencia en BF16: al menos 56 GB, por lo que se requiere una GPU profesional como A100 80GB, H100 80GB o similar.
- Con cuantización a 8 bits se necesitarían aproximadamente 28 GB de VRAM, y a 4 bits unos 14 GB, aunque no se especifican oficialmente estos formatos.
- No se mencionan GPUs de consumo (RTX 4090, etc.) como compatibles sin cuantización.
- Opciones de despliegue: vLLM, transformers, y cualquier servidor compatible con la API de OpenAI (según la documentación).
- Latencia y throughput no especificados.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros modelos en la información disponible. Como referencia, el modelo base Qwen/Qwen3.8-27B comparte la misma arquitectura y tamaño, pero no se dispone de sus métricas para contrastar. Tampoco hay datos sobre alternativas como Llama 3.1 8B o Mixtral 8x7B en este contexto.

## Limitaciones y advertencias

- El modelo tiene rechazos reducidos de forma intencionada, lo que puede llevar a generar contenido inapropiado, ofensivo o ilegal si no se controla mediante el system prompt.
- No se documentan sesgos específicos, pero al ser un fine-tune de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: no se menciona explícitamente, pero es inherente a los modelos generativos.
- La documentación no detalla los idiomas soportados, por lo que el rendimiento en idiomas minoritarios es desconocido.
- El modelo se proporciona "as-is", sin garantías. El usuario es responsable del cumplimiento legal y ético de su uso.
- Para respuestas largas o de razonamiento, se recomienda configurar `max_tokens` a al menos 1500 (2000-4000 para código), de lo contrario las respuestas pueden truncarse.

## Enlaces

- [HuggingFace: cyberneurova/cyberneurova-Qwen3.8-27B](https://huggingface.co/cyberneurova/cyberneurova-Qwen3.8-27B)
- [Sitio web de CyberNeurova](https://cyberneurova.ai)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
