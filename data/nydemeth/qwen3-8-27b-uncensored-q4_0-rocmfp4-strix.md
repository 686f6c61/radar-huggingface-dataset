# nydemeth/Qwen3.8-27B-Uncensored-Q4_0-ROCmFP4-STRIX

## Resumen

Esta es una cuantización GGUF en formato propietario `Q4_0_ROCMFP4_STRIX` del modelo `Qwen3.8-27B` en su variante abliterada (refusal-reduced), publicada por el usuario nydemeth. El modelo base, desarrollado por Alibaba, es un transformer denso de 26.895 millones de parámetros con arquitectura híbrida y soporte nativo de decodificación especulativa mediante un módulo MTP (Multi-Token Prediction). La versión abliterada, creada por orcarouter, elimina a nivel de pesos las respuestas de rechazo sin pérdida medible de capacidades.

Esta release concreta está optimizada para sistemas AMD Strix Halo mediante un build específico de ROCmFPX, e incluye dos archivos GGUF: el modelo principal (13,75 GiB) y un asistente MTP opcional (1,89 GiB) para acelerar la inferencia. No incluye proyector de visión, por lo que se limita a tareas de texto. Su relevancia radica en ofrecer una ejecución eficiente de un modelo de 27B con restricciones de censura reducidas en hardware AMD de gama alta, pensado para investigación, red-teaming y evaluación de guardrails.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con arquitectura híbrida Qwen3.8 y módulo MTP (nextn) para decodificación especulativa |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (según el modelo fuente abliterado) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_STRIX (modelo principal), Q4_0 (asistente MTP) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B soporta múltiples idiomas, pero no se especifica en esta cuantización) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos archivos: modelo principal y MTP) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 26,9B parámetros con arquitectura híbrida (combina capas de atención estándar con mecanismos de predicción multi-token). Incluye un módulo MTP que actúa como asistente de decodificación especulativa, permitiendo acelerar la generación al predecir varios tokens por paso. El modelo fue entrenado por Alibaba con un enfoque multimodal nativo, aunque esta cuantización no incluye el proyector de visión.

La variante abliterada fue producida por orcarouter mediante abliteración a nivel de tensor, que elimina las direcciones de rechazo en los pesos sin tocar la torre de visión ni el cabezal MTP. Según su publicacion, el proceso logra un 0% de over-refusal en XSTest y entre 0-6% de refusal en la suite A/B, sin pérdida medible de capacidades. Esta release concreta es una conversión a GGUF con un formato de cuantización personalizado (`Q4_0_ROCMFP4_STRIX`) desarrollado en el proyecto ROCmFPX, específicamente adaptado a las unidades de cómputo de las APU AMD Strix Halo.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo modo de pensamiento (thinking mode) heredado del modelo base.
- Generación de código y soporte de tool calling / function calling, con integración en flujos de trabajo agénticos.
- Capacidades matemáticas y de razonamiento lógico de alto nivel, propias de la familia Qwen3.8.
- Decodificación especulativa mediante el módulo MTP incluido, que acelera la inferencia en hardware compatible.
- Multilingüismo probable (heredado del modelo base), aunque no se documenta explícitamente en esta cuantización.
- Comportamiento de rechazo reducido: el modelo responde a solicitudes que normalmente serían rechazadas, útil para evaluación de guardrails y red-teaming.
- Sin capacidades de visión en esta versión (no incluye proyector mmproj).

## Casos de uso

- Red-teaming y evaluación de guardrails: el modelo permite probar sistemas de moderación y filtros de contenido al generar respuestas que otros modelos rechazarían, facilitando la identificación de vulnerabilidades en pipelines de seguridad.
- Investigación en interpretabilidad y alineación: al eliminar el rechazo a nivel de pesos, se puede estudiar cómo el modelo procesa instrucciones delicadas y qué representaciones internas subyacen a las políticas de seguridad.
- Desarrollo de agentes con tool calling en entornos controlados: su soporte de function calling y razonamiento multi-paso permite construir agentes que interactúan con APIs y herramientas, siempre bajo supervisión humana.
- Generación de código en laboratorios de investigación: el modelo base destaca en tareas de programación, y esta cuantización permite ejecutarlo en hardware AMD Strix Halo con requisitos de memoria reducidos (13,75 GiB).
- Automatización de oficina y procesamiento de documentos: el modelo base está optimizado para tareas de ofimática, como resumen, extracción de información y redacción de informes, en despliegues locales sin conexión.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de la cuantización ROCmFP4 en la calidad de salida frente a otras cuantizaciones estándar del mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La descripcion del modelo fuente abliterado indica que no hay pérdida medible de capacidades respecto al modelo base, y reporta un 0% de over-refusal en XSTest y entre 0-6% de refusal en la suite A/B, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros estándares para esta cuantización especifica.

## Requisitos de hardware

- VRAM estimada: 13,75 GiB para el modelo principal en formato Q4_0_ROCMFP4_STRIX, más 1,89 GiB adicionales si se usa el asistente MTP (total aproximado 15,64 GiB).
- GPU recomendada: APU AMD Strix Halo (RDNA 3.5 integrada) con soporte ROCmFPX. No se garantiza compatibilidad con otras GPUs AMD o NVIDIA.
- No cabe en GPUs de consumo convencionales de 8-12 GB; requiere al menos 16 GB de memoria unificada o VRAM dedicada.
- Opciones de despliegue: exclusivamente mediante builds de ROCmFPX (revisión `c49ebdbd5c9f01ec242369f9e7f7967855f80cba`) con `llama-server` y los flags `--model` y `--model-draft` para el MTP.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP debería mejorar la velocidad de generación, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Q4_0-ROCmFP4-STRIX (este) | 26,9B | 262K | Q4_0_ROCMFP4_STRIX | Apache 2.0 | GGUF propietario para ROCmFPX |
| orcarouter/Qwen3.8-27B-Uncensored-GGUF | 26,9B | 262K | Q4_K_M, Q3_K_M, etc. | Apache 2.0 | GGUF estándar, multiplataforma |
| Qwen/Qwen3.8-27B (base) | 26,9B | 262K | FP16/BF16 | Apache 2.0 | Safetensors, multimodal completo |

La principal diferencia frente a las alternativas es el formato de cuantización propietario, que limita su uso a sistemas AMD Strix Halo con ROCmFPX. Las versiones GGUF estándar de orcarouter son más portables (funcionan con llama.cpp, Ollama, MLX, etc.) y la versión base de Qwen incluye el proyector de visión. En cuanto a rendimiento, no hay datos comparativos publicados para esta cuantización específica.

## Limitaciones y advertencias

- Sin soporte de visión: esta cuantización no incluye el proyector mmproj, por lo que no puede procesar imágenes, a diferencia del modelo base.
- Formato de cuantización propietario: el archivo `Q4_0_ROCMFP4_STRIX` solo funciona con builds específicos de ROCmFPX; no es compatible con llama.cpp estándar ni con otras herramientas.
- Compatibilidad limitada: la model card advierte que la compatibilidad con otras revisiones de ROCmFPX no está garantizada.
- Comportamiento de rechazo reducido: al ser un modelo abliterado, puede generar contenido inapropiado, ofensivo o peligroso. No está diseñado para despliegue público o producción sin moderación externa.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en contextos largos o temas especializados.
- Datos memorizados: la model card advierte que no se puede descartar que los pesos cuantizados contengan datos memorizados del corpus de entrenamiento original.
- Licencia: Apache 2.0, pero el uso responsable queda bajo responsabilidad del usuario; se recomienda cumplir con las políticas de Hugging Face y la legislación aplicable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nydemeth/Qwen3.8-27B-Uncensored-Q4_0-ROCmFP4-STRIX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo fuente abliterado: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- GGUF estándar del modelo abliterado: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Proyecto ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Repositorio GitHub del modelo abliterado: https://github.com/Wassimyounes01/qwen38-uncensored
- Repositorio oficial Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
