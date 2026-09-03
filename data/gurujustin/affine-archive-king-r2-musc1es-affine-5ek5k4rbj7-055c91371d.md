# gurujustin/affine-archive-king-r2-musc1es-affine-5ek5k4rbj7-055c91371d

## Resumen

Este repositorio contiene una copia de archivo del checkpoint `affine-5ek5k4rbj7-055c91371d`, originalmente publicado por el usuario `musc1es` y posteriormente archivado por `gurujustin` para preservar su disponibilidad. El modelo fue presentado como participante en la subred 120 (Affine) de Bittensor, un protocolo descentralizado de evaluación de modelos de IA. Según la model card, este checkpoint fue coronado como "rey" del reinado 2 de SN120 el 31 de agosto de 2026, con un margen de victoria de +0.00222 y un valor z de 3.07 en el duelo de validación.

El modelo tiene aproximadamente 35.95 mil millones de parámetros totales, según los metadatos de los safetensors, y el repositorio ocupa 71.9 GB. El tag `qwen3_5_moe` sugiere que podría tratarse de una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen, aunque no hay documentación oficial que lo confirme. Al ser un archivo de competición, no se proporcionan detalles sobre entrenamiento, capacidades o licencia, lo que limita su uso directo en producción sin una evaluación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag sugiere `qwen3_5_moe`, sin confirmar) |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | no disponible (posible MoE, sin datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información técnica sobre la arquitectura, el proceso de entrenamiento o los datos utilizados. El tag `qwen3_5_moe` en Hugging Face sugiere que el modelo podría emplear una arquitectura de mezcla de expertos (MoE) basada en la serie Qwen, pero no hay confirmación oficial. Al tratarse de un checkpoint de competición en Bittensor SN120, es probable que haya sido entrenado específicamente para tareas de razonamiento o generación de texto, pero los detalles exactos no están disponibles en la información proporcionada.

## Capacidades

No se dispone de información verificada sobre las capacidades del modelo. Al ser un archivo de competición sin documentación, no se pueden enumerar funciones como generación de texto, razonamiento, soporte de tool calling o capacidades multilingües. Se recomienda realizar una evaluación empírica antes de considerar su uso en cualquier aplicación.

## Casos de uso

Dada la ausencia de documentación y la naturaleza de archivo de competición, no se pueden proponer casos de uso concretos con garantías. El modelo podría ser útil como punto de partida para investigación en evaluación de modelos descentralizados, o para análisis comparativo dentro del ecosistema Bittensor, pero cualquier aplicación práctica requeriría primero una caracterización completa de sus capacidades y limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un margen de victoria de +0.00222 y un valor z de 3.07 en el duelo de validación de SN120, pero no se especifican las métricas concretas (MMLU, HumanEval, GSM8K, etc.) ni se comparan con otros modelos.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware. Como estimación orientativa basada en el tamaño de parámetros (35,95 B) y el peso del repositorio (71,9 GB):

- VRAM estimada para inferencia en FP16: al menos 72 GB (sin contar overhead de activaciones), lo que requiere GPUs de clase A100 80GB, H100 80GB o similares.
- Con cuantización a 8 bits, la VRAM podría reducirse a unos 36-40 GB, permitiendo su uso en GPUs como RTX 4090 (24 GB) solo con cuantización más agresiva (4 bits), aunque no se han publicado archivos GGUF ni configuraciones de cuantización.
- Opciones de despliegue: no hay información sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI. Al ser safetensors, podría cargarse con Transformers, pero se desconoce si la arquitectura es estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo no tiene documentación pública, benchmarks ni especificaciones de arquitectura confirmadas. Se podría comparar con otros modelos de ~35B parámetros como Llama 3 35B o Mixtral 8x22B, pero al desconocer la arquitectura real y el rendimiento, cualquier comparación sería especulativa. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La licencia no está especificada, por lo que su uso comercial o de investigación puede estar sujeto a restricciones legales no declaradas.
- Es una copia de archivo de un checkpoint de competición; el modelo original podría haber sido retirado o modificado, y esta copia no incluye documentación técnica.
- El tag `qwen3_5_moe` no es oficial y podría ser incorrecto o engañoso.
- No se recomienda su uso en producción sin una evaluación exhaustiva de capacidades, seguridad y rendimiento.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/gurujustin/affine-archive-king-r2-musc1es-affine-5ek5k4rbj7-055c91371d
- Repositorio fuente original (según la model card): https://huggingface.co/musc1es/affine-5ek5k4rbj7-055c91371d
- Registro de duelos y veredictos de SN120: https://s3.hippius.com/affine-sn120/evals/index.jsonl
