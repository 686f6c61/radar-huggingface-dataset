# bcckfdn/cevher3-test-16

## Resumen

cevher3-test-16 es un modelo de lenguaje de 1.256.312.832 parámetros (aproximadamente 1,26 mil millones) publicado por el usuario bcckfdn en Hugging Face. Se presenta como un modelo basado en la arquitectura Gemma3 con atención de ventana deslizante (SWA, sliding window attention), entrenado específicamente para turco e inglés con un enfoque conversacional. El repositorio ocupa 2,5 GB e incluye pesos en formato safetensors compatibles con la librería transformers.

El modelo emplea una configuración de 34 capas, dimensión oculta de 1792, 28 cabezas de atención para consultas y 4 para claves/valores, con un vocabulario de 65.536 tokens y una longitud de contexto de 8192 tokens. Según la model card, se entrenó sobre 34.898 millones de tokens (34,898 B, presumiblemente miles de millones) alcanzando una pérdida de validación de 2,7558.

La relevancia de esta ficha es limitada: se trata de un modelo de prueba (el sufijo "test-16" y el nombre del autor sugieren un experimento) con cero descargas y cero likes en el momento de la consulta. No se han publicado benchmarks, detalles de composición del dataset ni información sobre alineación. La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación técnica adicional limita seriamente su evaluación para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Gemma3 con atención de ventana deslizante (SWA) |
| Parametros totales | 1.256.312.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atención de ventana deslizante (SWA), siguiendo el diseño de Gemma3. La configuración concreta incluye 34 capas, dimensión oculta de 1792, 28 cabezas de consulta y 4 cabezas de clave/valor (ratio GQA de 7:1), vocabulario de 65.536 tokens y contexto máximo de 8192 tokens. La atención de ventana deslizante reduce el coste computacional en secuencias largas al limitar el número de tokens previos considerados por cada posición, aunque la model card no especifica el tamaño de la ventana ni si se combina con capas de atención global.

El entrenamiento se realizó sobre 34.898 millones de tokens según la model card, con una pérdida de validación mínima de 2,7558. No se documenta la composición del dataset, la proporción entre turco e inglés, ni si se aplicaron fases de instrucción (SFT), RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal. La información disponible es insuficiente para reproducir o auditar el proceso de entrenamiento.

## Capacidades

- Generación de texto en turco e inglés, con orientación conversacional según los tags del repositorio.
- Soporte de contexto de hasta 8192 tokens, adecuado para conversaciones multi-turno y documentos de longitud media.
- Compatibilidad con text-generation-inference y endpoints compatibles, lo que facilita su despliegue en infraestructuras estándar.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta razonamiento multi-paso explícito, modo thinking ni capacidades de visión o audio.
- Capacidades multilingües limitadas a turco e inglés; no hay evidencia de otros idiomas.
- No se documentan capacidades de código o matemáticas de forma específica.

## Casos de uso

- Chatbot conversacional en turco: el modelo puede gestionar diálogos multi-turno gracias a su contexto de 8192 tokens y a su entrenamiento orientado a conversación, adecuado para asistentes de atención al cliente en mercados turcoparlantes.
- Generación de texto en inglés para prototipos: su tamaño de 1,26 mil millones permite ejecución en hardware modesto, útil para experimentación rápida en generación de contenido.
- Traducción asistida turco-inglés: aunque no se documenta entrenamiento específico de traducción, el bilingüismo declarado permite usarlo como base para tareas de traducción con ajuste fino posterior.
- Clasificación y etiquetado de texto: el modelo puede adaptarse mediante fine-tuning a tareas de análisis de sentimiento o categorización en turco, dado su tamaño manejable.
- Generación de resúmenes de documentos cortos: con 8192 tokens de contexto puede procesar artículos o informes de longitud media en ambos idiomas.
- Base para investigación en modelos pequeños: su licencia Apache 2.0 y su tamaño permiten usarlo como punto de partida en experimentos académicos sobre arquitecturas SWA o ajuste fino eficiente.
- Despliegue en entornos con recursos limitados: al ser un modelo de 1,26 B, puede servirse en una única GPU consumer con cuantización, aunque no se publican pesos cuantizados oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida de validación de 2,7558, que no es comparable directamente con métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 6-8 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,3-2 GB para pesos, con 4-6 GB totales recomendados.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,7-1 GB para pesos, con 3-4 GB totales recomendados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: sí, en tarjetas con al menos 6-8 GB de VRAM en precisión completa y en tarjetas con 4 GB o más si se cuantiza.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag declarado), vLLM y llama.cpp/Ollama requerirían conversión a GGUF, no documentada oficialmente.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| cevher3-test-16 | 1,26 B | 8192 | tr, en | Apache 2.0 | no |
| Gemma 2 2B | 2,6 B | 8192 | multilingüe | Gemma license | sí |
| Qwen2.5 1.5B | 1,54 B | 32768 | multilingüe | Apache 2.0 | sí |
| SmolLM2 1.7B | 1,7 B | 8192 | inglés principalmente | Apache 2.0 | sí |

La comparación es desfavorable para cevher3-test-16 en términos de documentación: los tres modelos alternativos publican resultados de benchmarks, detalles de entrenamiento y variantes cuantizadas, mientras que cevher3-test-16 carece de todos ellos. Su única ventaja diferencial es el enfoque específico en turco, aunque sin evaluaciones que lo respalden.

## Limitaciones y advertencias

- Modelo de prueba sin benchmarks publicados: no hay evidencia de calidad en tareas estándar, lo que impide recomendar su uso en producción.
- Cero descargas y cero likes en Hugging Face: no existe validación por parte de la comunidad.
- Sesgos desconocidos: no se documenta la composición del dataset ni procesos de mitigación de sesgos.
- Riesgo de alucinación: inherente a modelos de este tamaño y sin información sobre alineación (RLHF/DPO no documentados).
- Cobertura lingüística limitada a turco e inglés; el rendimiento en otros idiomas no está evaluado.
- Contexto de 8192 tokens: suficiente para conversaciones, pero inferior a modelos contemporáneos que ofrecen 32K o más.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación técnica traslada todo el riesgo de evaluación al usuario.
- No se publican pesos cuantizados oficiales ni scripts de conversión, lo que complica el despliegue en entornos con recursos limitados.
- Fecha de creación futura (2026-11-22) en los metadatos: posible inconsistencia que sugiere datos de prueba o error en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-16
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
