# KonradDallaOrg/dimmy-gemma-4-gguf

## Resumen

dimmy-gemma-4-gguf es un repositorio espejo publicado por KonradDallaOrg que replica, byte a byte, un conjunto de cuantizaciones GGUF de la familia Gemma 4 de Google. No se trata de un modelo entrenado o afinado por el autor: la model card lo describe explícitamente como un "unmodified mirror" de los ficheros que la aplicación Dimmy descarga, con el objetivo de que dicha aplicación no dependa de que los repositorios upstream (principalmente Unsloth) permanezcan disponibles. La licencia declarada es Apache 2.0 y los pesos proceden de cuatro variantes del modelo base: Gemma 4 E2B-it, E4B-it, 12B-it y 26B-A4B-it, todas en versión instruct.

El uso previsto según el autor es el post-procesado local de texto: recap, reescritura y ajuste de estilo, con el modelo E2B QAT como opción por defecto. El repositorio agrupa once ficheros GGUF con cuantizaciones que van desde Q2_K_XL hasta Q8_0, e incluye variantes QAT (quantization-aware training) de Unsloth para los modelos pequeños y medianos. El parámetro total declarado en los safetensors del repo es de 11.907.350.576, coherente con la variante de 12B.

La relevancia de este repositorio es fundamentalmente práctica: ofrece una copia fija y verificable (con hashes SHA-256 documentados) de cuantizaciones listas para usar con llama.cpp y derivados, lo que simplifica el despliegue reproducible en local. No aporta innovación arquitectónica propia ni datos de entrenamiento nuevos; su valor está en la trazabilidad de las revisiones upstream y en la agregación de múltiples tamaños en un único punto de descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4; detalles no disponibles en la información proporcionada) |
| Parametros totales | 11.907.350.576 (dato de safetensors del repo, correspondiente a la variante 12B) |
| Parametros activos | no disponible (la variante 26B-A4B sugiere arquitectura MoE con ~4B activos, pero no se confirma en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K_XL, Q3_K_M, Q4_K_M, Q4_K_XL, Q5_K_M, Q8_0 (según ficheros publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors como formato de origen del modelo base) |

## Arquitectura y entrenamiento

El repositorio no define arquitectura ni entrenamiento propios: redistribuye cuantizaciones GGUF de los modelos Gemma 4 de Google, generadas por Unsloth. La información disponible no detalla la arquitectura interna de Gemma 4 (número de capas, atención, uso de MoE, etc.), más allá de que la variante 26B-A4B-it sugiere una configuración con mezcla de expertos y aproximadamente 4B de parámetros activos. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

El aspecto técnico destacable es el uso de cuantizaciones QAT (quantization-aware training) en las variantes E2B y E4B, que Unsloth publica como ficheros UD-Q4_K_XL, y de cuantizaciones dinámicas Unsloth (UD) para el resto. El repositorio incluye además una variante Q2_K_XL del modelo 12B, orientada a reducir el peso en disco y VRAM a costa de precisión. Todos los ficheros son idénticos byte a byte a los upstream en las revisiones indicadas, y se documenta el hash SHA-256 de cada uno para verificación.

## Capacidades

- Generación de texto conversacional en modo instruct, heredado de las variantes `-it` de Gemma 4.
- Reescritura, resumen (recap) y ajuste de estilo, que es el uso declarado por el autor de la aplicación Dimmy.
- Ejecución local mediante llama.cpp y ecosistema GGUF, sin necesidad de GPU dedicada en las variantes pequeñas.
- Capacidades multilingües: no confirmadas en la información disponible.
- Tool calling, function calling y razonamiento multi-paso: no confirmados en la información disponible.
- Capacidades de visión, audio o modo thinking: no confirmadas en la información disponible.

## Casos de uso

- Post-procesado de texto en aplicaciones de escritorio: el modelo E2B QAT (2,6 GB en Q4_K_XL) permite reescribir y resumir contenido generado por otro modelo o por el usuario dentro de la propia aplicación Dimmy, con latencia baja en CPU.
- Resumen de documentos largos en local: las variantes E4B y 12B ofrecen mayor calidad de síntesis para actas, correos e informes, manteniendo los datos en la máquina del usuario.
- Ajuste de estilo y tono en pipelines editoriales: reescritura de borradores para adaptarlos a una guía de estilo concreta, usando el modelo 12B en Q4_K_M (7,1 GB) en estaciones de trabajo con GPU consumer.
- Asistencia conversacional offline: despliegue con llama.cpp u Ollama en equipos sin conexión, útil en entornos con requisitos de privacidad o redes aisladas.
- Prototipado rápido de aplicaciones LLM: el repositorio agrega varios tamaños y cuantizaciones en un solo punto, lo que facilita comparar calidad y coste computacional sin cambiar de fuente de descarga.
- Inferencia en servidores modestos con la variante 26B-A4B en Q4_K_XL (14,2 GB): si se confirma su naturaleza MoE con ~4B activos, ofrecería la calidad de un modelo grande con un coste de cómputo por token más cercano al de un 4B, adecuado para servicios de reescritura con concurrencia moderada.
- Verificación de integridad en despliegues reproducibles: los hashes SHA-256 publicados permiten validar que los pesos desplegados coinciden con las revisiones upstream fijadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (peso de los ficheros, sin contar KV cache):
  - E2B QAT Q4_K_XL: ~2,6 GB.
  - E2B Q4_K_M: ~3,1 GB; Q5_K_M: ~3,4 GB.
  - E4B Q3_K_M: ~4,1 GB; QAT Q4_K_XL: ~4,2 GB; Q4_K_M: ~5,0 GB; Q8_0: ~8,2 GB.
  - 12B Q2_K_XL: ~4,7 GB; QAT Q4_K_XL: ~6,7 GB; Q4_K_M: ~7,1 GB.
  - 26B-A4B QAT Q4_K_XL: ~14,2 GB.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, las variantes E2B y E4B caben en GPUs consumer de 8 GB o menos; la 12B en Q4 encaja en 8-12 GB; la 26B-A4B en Q4 requiere 16-24 GB.
- Cabe en GPU consumer: sí, al menos las variantes E2B, E4B y 12B en cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp y frontends compatibles (Ollama, LM Studio, llama-cpp-python); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| dimmy-gemma-4-gguf (12B) | 11,9B | no disponible | Apache 2.0 | GGUF | HuggingFace (espejo) |
| google/gemma-4-12B-it | 12B (aprox.) | no disponible | Apache 2.0 (según este repo) | safetensors | HuggingFace (oficial) |
| unsloth/gemma-4-12B-it-GGUF | 12B (aprox.) | no disponible | Apache 2.0 | GGUF | HuggingFace (upstream) |
| unsloth/gemma-4-12B-it-qat-GGUF | 12B (aprox.) | no disponible | Apache 2.0 | GGUF (QAT) | HuggingFace (upstream) |

La comparativa se limita a las variantes de la misma familia porque la información proporcionada no incluye datos de rendimiento ni de contexto que permitan contrastar con modelos de otros desarrolladores.

## Limitaciones y advertencias

- No es un modelo original: cualquier limitación de los Gemma 4 de Google aplica íntegramente; este repositorio no las corrige ni las documenta.
- La model card no detalla sesgos, tasas de alucinación ni evaluación de calidad; no hay garantías documentadas sobre su comportamiento en producción.
- Idiomas soportados no confirmados; no se debe asumir un rendimiento multilingüe sin validación previa.
- Longitud de contexto no disponible, lo que impide planificar cargas con documentos largos sin pruebas empíricas.
- Las cuantizaciones Q2 y Q3 pueden degradar de forma notable la calidad frente a Q4 o superiores; la variante Q2_K_XL del 12B (4,7 GB) es la más expuesta a este riesgo.
- El uso comercial está permitido por la licencia Apache 2.0 declarada, pero conviene verificar los términos de la licencia Gemma de Google aplicables al modelo base, ya que la información proporcionada solo refleja la declaración del autor del espejo.
- El repositorio depende de revisiones upstream fijadas; si Unsloth retira o modifica esos ficheros, el espejo sigue siendo válido por sus hashes, pero no habrá actualizaciones.
- El autor no ofrece soporte, documentación técnica adicional ni garantías de mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KonradDallaOrg/dimmy-gemma-4-gguf
- Upstream E2B QAT (Unsloth): https://huggingface.co/unsloth/gemma-4-E2B-it-qat-GGUF
- Upstream E4B QAT (Unsloth): https://huggingface.co/unsloth/gemma-4-E4B-it-qat-GGUF
- Upstream 12B QAT (Unsloth): https://huggingface.co/unsloth/gemma-4-12B-it-qat-GGUF
- Upstream 26B-A4B QAT (Unsloth): https://huggingface.co/unsloth/gemma-4-26B-A4B-it-qat-GGUF
- Upstream E2B (Unsloth): https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF
- Upstream E4B (Unsloth): https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- Upstream 12B (Unsloth): https://huggingface.co/unsloth/gemma-4-12b-it-GGUF
