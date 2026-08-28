# agikeen/Qwen3.8-27B-NVFP4-BF16-LMHead

## Resumen

El modelo `agikeen/Qwen3.8-27B-NVFP4-BF16-LMHead` es una cuantización NVFP4 (4-bit floating point) del modelo denso Qwen3.8-27B de Alibaba, desarrollada por el usuario agikeen como derivado de la versión `unsloth/Qwen3.8-27B-NVFP4`. La particularidad de esta variante es que sustituye el `lm_head` cuantizado en FP8 por el `lm_head.weight` original en BF16 del modelo base, con el objetivo de preservar la precisión en la capa de salida y reducir posibles errores de tokenización durante la generación.

Qwen3.8-27B es la última generación de la familia Qwen3.8, un modelo causal de lenguaje con encoder de visión que integra capacidades multimodales (imagen y vídeo), razonamiento controlable y soporte para tareas agénticas de largo horizonte. Su arquitectura híbrida combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention), alcanzando un contexto nativo de 262.144 tokens extensible hasta 1.000.000. La cuantización NVFP4 permite ejecutar este modelo de 27B en hardware más modesto, con un peso total en disco de 24,7 GB y aproximadamente 19,87 mil millones de parámetros efectivos.

Esta ficha resulta relevante para desarrolladores que buscan desplegar un modelo multimodal de alto rendimiento en GPUs de consumo (24 GB o menos) sin renunciar a la calidad del modelo original, aprovechando la cuantización de última generación de Unsloth y la corrección del `lm_head` en BF16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention (con RoPE) + FFN, con encoder de visión |
| Parametros totales | 19.869.895.952 (cuantizado NVFP4); el modelo base Qwen3.8-27B tiene 27B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.000.000 mediante RoPE scaling (p. ej. YaRN) |
| Tipos de cuantizacion | NVFP4 (4-bit floating point) para el cuerpo del modelo; `lm_head` en BF16 |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con etiqueta `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B presenta una arquitectura híbrida de 64 capas con un layout interno de 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de FFN, y un sub-bloque final de Gated Attention seguido de FFN. La Gated DeltaNet utiliza 48 cabezas de atención lineal para la clave de valor (V) y 16 para la consulta-clave (QK), con dimensión de cabeza 128. La Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La capa FFN tiene una dimensión intermedia de 17.408. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que acelera la inferencia.

Esta versión cuantizada es un derivado de `unsloth/Qwen3.8-27B-NVFP4`, que utiliza la tecnología Unsloth Dynamic V3.0 (preview) para lograr una cuantización de estado del arte. La modificación principal introducida por agikeen es el reemplazo del `lm_head` FP8 por el `lm_head.weight` oficial en BF16 del modelo Qwen/Qwen3.8-27B, lo que puede mejorar la estabilidad de la salida y la calidad de los tokens generados. No se dispone de información adicional sobre el proceso de entrenamiento o fine-tuning específico de esta variante cuantizada.

## Capacidades

- Generación de texto con razonamiento avanzado: modo "thinking" activado por defecto, desactivable por petición, con control de profundidad mediante `reasoning_effort` y preservación del contexto de razonamiento histórico con `preserve_thinking`.
- Comprensión multimodal nativa: procesa imágenes y vídeos, desde diagramas STEM y documentos hasta vídeos de larga duración (escala de horas).
- Soporte de tool calling / function calling mejorado: parsing de objetos anidados para mayor éxito en llamadas a herramientas.
- Soporte de agentes y multi-step reasoning: planificación autónoma y manejo de feedback del entorno para tareas de largo horizonte.
- Developer Role Support: compatible con herramientas agénticas como Codex.
- Multi-Token Prediction (MTP): genera varios tokens por paso para acelerar la inferencia.
- Contexto largo nativo de 262.144 tokens, extensible a 1.000.000 mediante técnicas de escalado RoPE.
- Parámetros de muestreo recomendados para modos thinking e instruct, con ajuste de `presence_penalty` para evitar repeticiones.

## Casos de uso

- Asistentes de programación agénticos: gracias al soporte de developer role y tool calling, el modelo puede integrarse en entornos como Codex para generar, revisar y depurar código en repositorios reales, ejecutando comandos y analizando resultados.
- Análisis de documentos extensos: con 262.144 tokens de contexto nativo, es adecuado para procesar informes financieros, papers científicos o expedientes legales completos, extrayendo conclusiones y resumiendo secciones específicas.
- Comprensión de vídeo de larga duración: su encoder de visión nativo permite analizar vídeos de hasta horas de duración, útil para vigilancia, revisión de contenido audiovisual o generación de subtítulos descriptivos.
- Automatización de oficina: según la documentación oficial, el modelo destaca en tareas de office automation, como generación de informes, resumen de correos o creación de presentaciones a partir de datos.
- Chat con razonamiento controlable: en aplicaciones de atención al cliente o tutoría, se puede activar o desactivar el modo thinking según la complejidad de la consulta, ajustando `reasoning_effort` para balancear latencia y calidad.
- Despliegue en hardware de consumo: la cuantización NVFP4 permite ejecutar el modelo en GPUs con 24 GB de VRAM (p. ej. RTX 3090/4090), habilitando prototipos locales y entornos de desarrollo sin infraestructura cloud.
- Agentes autónomos de largo horizonte: su capacidad de planificación y manejo de feedback del entorno lo hace apto para pipelines de automatización que requieren múltiples pasos, como orquestación de tareas web o integración con APIs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante cuantizada en la información disponible. El modelo base Qwen3.8-27B ha sido evaluado en tareas como MathVision, según se menciona en su ficha de HuggingFace, pero no se proporcionan cifras numéricas en los materiales consultados. Se recomienda consultar la documentación oficial de Qwen para obtener datos comparativos del modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: según Unsloth, el modelo puede ejecutarse localmente con 17 GB de RAM/VRAM en su versión 4-bit. El tamaño del repositorio es de 24,7 GB, pero la carga en memoria puede ser inferior (~14-17 GB) dependiendo del backend.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 40 GB, o GPUs profesionales con soporte para FP4 (p. ej. H100, L40S). En GPUs sin soporte nativo FP4, puede requerir emulación o conversión.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas con 24 GB de VRAM, como las RTX 3090/4090.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Unsloth Desktop (según la documentación de Unsloth).
- Latencia y throughput: no disponible en la información proporcionada; dependerá del backend y del hardware específico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K (ext. 1M) | BF16 | Apache-2.0 | HuggingFace, ModelScope |
| agikeen/Qwen3.8-27B-NVFP4-BF16-LMHead | ~19,87B (cuantizado) | 262K (ext. 1M) | NVFP4 + BF16 lm_head | Apache-2.0 | HuggingFace |
| unsloth/Qwen3.8-27B-NVFP4 | ~19,87B (cuantizado) | 262K (ext. 1M) | NVFP4 (FP8 lm_head) | Apache-2.0 | HuggingFace, ModelScope |

La comparativa principal es entre las dos variantes cuantizadas y el modelo original. La versión de agikeen se distingue por el `lm_head` en BF16, que puede ofrecer mayor precisión en la capa de salida frente al FP8 de la versión de Unsloth, a costa de un ligero aumento en el uso de memoria. No se dispone de datos de rendimiento comparativos entre ambas.

## Limitaciones y advertencias

- Al ser una cuantización 4-bit, puede experimentarse una pérdida de precisión respecto al modelo en BF16, especialmente en tareas que requieren matemáticas complejas o razonamiento numérico fino.
- La modificación del `lm_head` (BF16 en lugar de FP8) es una decisión del autor; no hay garantía de que mejore el rendimiento en todos los escenarios, y podría introducir discrepancias con los pesos originales.
- No se ha publicado información sobre el proceso de validación o evaluación de esta variante específica; se recomienda realizar pruebas propias antes de usarla en producción.
- El modelo base Qwen3.8-27B puede presentar sesgos inherentes a sus datos de entrenamiento, aunque no se detallan en la documentación consultada.
- Riesgo de alucinación en contextos largos o ambiguos, como es común en modelos de lenguaje.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución y de las patentes asociadas.
- Para contextos superiores a 262.144 tokens, es necesario aplicar técnicas de escalado RoPE (p. ej. YaRN), lo que puede afectar ligeramente a la calidad de las respuestas.
- No se especifican los idiomas soportados; aunque Qwen suele ser multilingüe, este dato no está confirmado para esta versión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agikeen/Qwen3.8-27B-NVFP4-BF16-LMHead
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Versión original NVFP4 de Unsloth en ModelScope: https://www.modelscope.cn/models/unsloth/Qwen3.8-27B-NVFP4
