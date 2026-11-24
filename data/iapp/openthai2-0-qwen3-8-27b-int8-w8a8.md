# iapp/openthai2.0-qwen3.8-27b-INT8-W8A8

## Resumen

OpenThai 2.0.1 INT8 W8A8 es una cuantización de pesos y activaciones a 8 bits del modelo multimodal `iapp/openthai2.0-qwen3.8-27b`, desarrollado por iApp en el marco del proyecto OpenThai (anteriormente OpenThaiGPT) y presentado junto a AIEAT. El modelo base parte de la familia Qwen 3.5 (tag `qwen3_5`) y está especializado en tailandés e inglés, con capacidades declaradas de OCR y visión. Esta variante concreta no introduce capacidades nuevas: su propósito es reducir el coste de inferencia manteniendo el comportamiento del modelo original.

La cuantización se ha realizado con llm-compressor mediante GPTQ en modo W8A8 (pesos y activaciones en INT8) y empaquetado con `compressed-tensors` para su uso directo en vLLM. La torre de visión, la cabeza `lm_head` y la cabeza draft MTP se mantienen en bf16, de modo que las partes sensibles a la precisión no se degradan. El resultado son 27.360.632.560 parámetros en un repositorio de 152,7 GB.

Su relevancia práctica está en dos puntos: el soporte de decodificación especulativa mediante la cabeza MTP (con una corrección publicada el 31 de agosto de 2026 que restauró los tensores `mtp.*` que faltaban en las primeras subidas) y la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales. Es un modelo pensado para despliegue en producción con vLLM, no para experimentación en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen 3.5, tag `qwen3_5`), con torre de visión y cabeza MTP para decodificación especulativa |
| Parametros totales | 27.360.632.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de despliegue usa `--max-model-len 32768` |
| Tipos de cuantizacion | INT8 W8A8 (pesos y activaciones) vía GPTQ con `compressed-tensors`; torre de visión, `lm_head` y cabeza MTP en bf16 |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`compressed-tensors`), más `model-mtp.safetensors` en bf16 (0,85 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen 3.5 con 27.360 millones de parámetros, que combina un tronco de lenguaje con una torre de visión para tareas de OCR y comprensión de documentos. Incluye una cabeza MTP (multi-token prediction) de una capa (`mtp_num_hidden_layers: 1`) que actúa como draft head para decodificación especulativa en vLLM con el método `qwen3_5_mtp`.

Esta variante INT8 se generó con llm-compressor aplicando GPTQ sobre pesos y activaciones, con calibración exclusivamente textual sobre ultrachat (512 muestras de 2048 tokens). La configuración de cuantización excluye explícitamente la torre de visión, `lm_head` y todos los tensores `mtp.*` mediante la regla `re:.*mtp.*` en `quantization_config.ignore`. La corrección del 31 de agosto de 2026 es relevante técnicamente: las primeras subidas no contenían tensores `mtp.*` porque el export cargó el modelo con una clase de transformers sin módulo MTP, de modo que con `--speculative-config` vLLM ejecutaba una draft head sin pesos, rechazaba todos los drafts (longitud media de aceptación 1,00) y decodificaba aproximadamente 1,6 veces más lento que sin el flag. La versión corregida alcanza una longitud media de aceptación de 1,63 bajo vLLM 0.26 con `num_speculative_tokens: 2`, frente a 1,61 del modelo bf16 de producción. No se dispone de detalles sobre el volumen de tokens de preentrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto y razonamiento en tailandés e inglés, con modo de razonamiento compatible con `--reasoning-parser qwen3` en vLLM.
- Comprensión de imágenes y OCR, gracias a la torre de visión conservada en bf16 (etiquetas `ocr` y `vision` del repositorio).
- Procesamiento de documentos y extracción de texto estructurado, orientado al mercado tailandés.
- Decodificación especulativa con cabeza MTP integrada, que acelera la generación en vLLM.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.
- Multilingüismo limitado a tailandés e inglés según los metadatos del modelo.

## Casos de uso

- Digitalización de documentos administrativos tailandeses: el modelo puede procesar imágenes de formularios, facturas y documentos oficiales y extraer campos estructurados, aprovechando la torre de visión en bf16 y el soporte nativo de tailandés con alfabeto no latino.
- OCR en pipelines de archivo histórico: adecuado para digitalizar corpus en tailandés donde los motores OCR convencionales tienen tasas de error elevadas por la segmentación de palabras y los diacríticos.
- Atención al cliente en tailandés: generación de respuestas multi-turno en un servicio orientado a usuarios tailandeses, con contexto de hasta 32.768 tokens en la configuración de despliegue de referencia.
- Despliegue en producción con vLLM: la cuantización W8A8 reduce el peso de pesos y activaciones frente a bf16, y la cabeza MTP aporta una aceleración de decodificación medible (aceptación media 1,63), lo que se traduce en menor coste por token servido.
- Procesamiento de documentación técnica bilingüe tailandés-inglés: traducción y resumen de manuales, contratos o documentación regulatoria donde conviven ambos idiomas.
- Moderación y clasificación de contenido en tailandés: clasificación de textos y mensajes con un modelo que comprende el idioma de forma nativa, desplegado sobre infraestructura con GPU de 80 GB.
- Extracción de información de capturas de pantalla e interfaces: al conservar la visión en bf16, es viable para tareas de lectura de UI y verificación de contenido visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explícitamente a la del modelo base (`iapp/openthai2.0-qwen3.8-27b`) para benchmarks y prompts. El único dato de rendimiento publicado es la longitud media de aceptación de la decodificación especulativa: 1,63 con la cabeza MTP corregida, frente a 1,61 en bf16 de producción y 1,00 (sin aceleración efectiva) en las subidas defectuosas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT8 de 27.360 millones de parámetros ocupan aproximadamente 27,4 GB, más la torre de visión y `lm_head` en bf16 y la cabeza MTP (0,85 GB). En la práctica se necesita al menos una GPU de 40 GB para contexto moderado y una de 80 GB para contexto largo con caché KV amplia.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB. No se recomienda A100 40 GB si se necesita el contexto completo de 32.768 tokens.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) con los pesos INT8 completos más caché KV; sería necesario un esquema de offload o una cuantización adicional a 4 bits no publicada en este repositorio.
- Opciones de despliegue: vLLM es el runtime de referencia, con `--trust-remote-code`, `--max-model-len 32768`, `--reasoning-parser qwen3` y `--speculative-config '{"method":"qwen3_5_mtp","num_speculative_tokens":2}'`. El formato `compressed-tensors` no es compatible directamente con llama.cpp u Ollama sin conversión adicional.
- Latencia y throughput: no disponibles de forma absoluta; la decodificación especulativa con la cabeza MTP corregida aporta una longitud media de aceptación de 1,63, lo que implica un ahorro sustancial de pasos de decodificación frente a la generación autoregresiva estándar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iapp/openthai2.0-qwen3.8-27b-INT8-W8A8 | 27,36 B | no disponible (ejemplo con 32.768) | INT8 W8A8 | Apache 2.0 | Hugging Face, vLLM |
| iapp/openthai2.0-qwen3.8-27b (base) | 27,36 B | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye otros modelos comparables de la misma categoría (multimodales en tailandés de ~27 B). La comparación más directa disponible es con el modelo base en bf16, del que esta variante hereda capacidades y del que solo se diferencia por la cuantización y por la corrección de la cabeza MTP.

## Limitaciones y advertencias

- La calibración GPTQ se realizó únicamente con texto (ultrachat, 512×2048); no se ha calibrado con datos multimodales, por lo que el comportamiento de la torre de visión bajo cuantización no está documentado más allá de que se mantiene en bf16.
- Riesgo de degradación por cuantización W8A8 en tareas sensibles a la precisión numérica; no se han publicado evaluaciones comparativas INT8 frente a bf16.
- Las copias descargadas antes del 31 de agosto de 2026 carecen de los tensores `mtp.*` y, con `--speculative-config`, decodifican aproximadamente 1,6 veces más lento. Es necesario volver a descargar o servir sin el flag.
- Idiomas limitados a tailandés e inglés; el rendimiento en castellano u otras lenguas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad para tareas de OCR o extracción documental.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial y modificación sin restricciones adicionales, con la obligación habitual de conservar el aviso de licencia.
- El repositorio ocupa 152,7 GB, muy por encima del tamaño de los pesos INT8, lo que sugiere la presencia de múltiples artefactos (posiblemente pesos en otros formatos o checkpoints intermedios); conviene revisar la lista de ficheros antes de la descarga.
- El despliegue requiere `--trust-remote-code`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b-INT8-W8A8
- Modelo base: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados corresponden a la International Association of Privacy Professionals, sin relación con el proyecto OpenThai).
