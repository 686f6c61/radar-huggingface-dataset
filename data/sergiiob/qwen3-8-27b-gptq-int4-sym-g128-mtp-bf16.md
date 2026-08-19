# SergiioB/Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal nativo de 27.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. Se trata de un modelo denso con arquitectura híbrida GDN (Global-Dense-Native) que combina atención lineal en 48 de sus 64 capas con atención completa cada cuatro capas, lo que reduce el coste computacional en contextos largos. Incluye además un tower de visión sin cuantizar, un cabezal de predicción multi-token (MTP) integrado para decodificación especulativa nativa y una ventana de contexto nativa de 262.144 tokens (ampliable a 1M). El modelo base se distribuye bajo licencia Apache-2.0.

La ficha que nos ocupa corresponde a una cuantización GPTQ INT4 simétrica con grupo de 128 realizada por SergiioB, pensada específicamente para servir el modelo con vLLM en hardware Intel Arc (XPU). La particularidad de este checkpoint es que el cabezal MTP de una sola capa se excluye deliberadamente de la cuantización y se conserva en BF16, de modo que la decodificación especulativa nativa funciona sin modificaciones. El autor ha publicado mediciones reales de rendimiento en una Intel Arc Pro B70 de 32 GB, alcanzando hasta 112,65 tokens por segundo en decodificación de un solo stream con un overlay opcional de draft INT4, y 83,7 tokens por segundo con el checkpoint tal cual.

Esta versión cuantizada resulta relevante porque permite ejecutar un modelo de 27B con capacidades multimodales y razonamiento en GPUs de consumo o aceleradores XPU con 32 GB de VRAM, manteniendo la funcionalidad completa de decodificación especulativa, algo poco habitual en cuantizaciones GPTQ.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida GDN: atención lineal + atención completa cada 4 capas) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 (config); 131.072 medido en 32 GB VRAM |
| Tipos de cuantizacion | GPTQ INT4 simétrico, grupo 128, desc_act=false; cabezal MTP en BF16; overlay opcional de draft INT4 |
| Idiomas soportados | inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (5 archivos, 2.399 tensores) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de atención que combina atención lineal (en 48 de las 64 capas) con atención completa cada cuatro capas. Esta combinación reduce el coste computacional cuadrático en contextos largos manteniendo la capacidad de capturar dependencias globales. El modelo incluye un tower de visión (F16, ~0,86 GiB) que lo hace multimodal nativo, y un cabezal MTP (Multi-Token Prediction) de una sola capa que actúa como borrador en la decodificación especulativa, permitiendo predecir varios tokens por paso.

La cuantización GPTQ fue realizada por SergiioB con gptqmodel 7.3.2 directamente sobre la GPU objetivo (Intel Arc Pro B70). Se aplicó cuantización simétrica INT4 con grupo de 128 y desc_act=false, empaquetado en int32. Los 15 tensores del cabezal MTP se excluyeron de la cuantización mediante una regla dinámica y se conservaron en BF16, lo que garantiza que la decodificación especulativa nativa siga siendo funcional. El autor proporciona un log de errores por tensor (quant_log.csv) y un cookbook público con los comandos exactos de lanzamiento.

## Capacidades

- Generación de texto y conversación multilingüe (inglés y chino).
- Razonamiento complejo y resolución de problemas matemáticos, con modo "thinking" activable mediante sampling específico (temperatura 1.0, top_p 0.95).
- Generación de código y soporte de agentes, incluido tool calling y flujos de trabajo multi-paso.
- Comprensión de imágenes gracias al tower de visión incluido (F16, sin cuantizar).
- Decodificación especulativa nativa mediante MTP4 (cuatro tokens candidatos por paso), que acelera la decodificación entre 2 y 3 veces frente a sin especulación.
- Soporte de contexto largo: hasta 131.072 tokens medidos en 32 GB VRAM con KV cache en fp8.
- Capacidad de servir múltiples usuarios concurrentes (probado con 5 sesiones de 8K tokens).

## Casos de uso

- Atención al cliente automatizada: con 131K tokens de contexto medidos, el modelo puede gestionar conversaciones multi-turno extensas manteniendo el historial completo. El modo thinking permite razonar sobre la intención del usuario antes de responder, y la decodificación especulativa reduce la latencia percibida.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletado, revisión de código o generación de tests. Las mediciones muestran 25,5 tok/s por usuario con 5 desarrolladores concurrentes, suficiente para uso interactivo.
- Asistentes de ofimática y automatización de documentos: el modelo base está orientado a tareas de oficina (redacción, resumen, extracción de datos). La cuantización INT4 permite desplegarlo en estaciones de trabajo con GPU de 32 GB.
- Análisis de imágenes y documentos escaneados: el tower de visión sin cuantizar permite procesar capturas, diagramas o formularios junto con texto, por ejemplo para extraer información estructurada.
- Servicio de inferencia local en hardware Intel Arc: el checkpoint está optimizado para vLLM XPU, permitiendo desplegar un LLM de 27B en aceleradores Xe2 con un rendimiento de hasta 112 tok/s en decodificación single-stream con el overlay INT4.
- Investigación en decodificación especulativa y cuantización: el artefacto preserva el cabezal MTP en BF16, lo que lo convierte en un banco de pruebas para estudiar el impacto de la cuantización en la tasa de aceptación de tokens (medida en 95,9% con draft BF16 y 94,4% con draft INT4).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de rendimiento publicados son mediciones de inferencia reales en una Intel Arc Pro B70 de 32 GB (230 W de límite, KV cache fp8, vLLM 0.27.2rc1.dev77). Se resumen a continuación:

| Escenario (single-stream, MTP4, draft BF16) | Velocidad |
|---|---|
| Decode p512/g128, cache off | 83,7 tok/s |
| Decode p8192/g128, cache off | 77,1 tok/s |
| Full-context p130944/g128 | 56,3 tok/s |
| Cold input p8192/g1 | ~1.728 tok/s (prompt/TTFT) |

| Escenario con overlay INT4 en draft | Velocidad |
|---|---|
| Decode p512/g128, cache off | 112,65 tok/s |
| Decode p8192/g128, cache off | 103,6 tok/s |
| Decode p512/g128, prefix cache on | 106,7 tok/s |

| Escenario concurrente | Velocidad |
|---|---|
| 5 usuarios coding (sesiones 8K) | 25,5 tok/s cada uno (Σ 127,4) |
| Short-prompt concurrente C5 | 203,8 tok/s agregados |
| Short-prompt concurrente C32 | 224,2 tok/s agregados |

La tasa de aceptación MTP se sitúa en 95,9% con draft BF16 y 94,4% con draft INT4.

## Requisitos de hardware

- VRAM estimada: 19,6 GB para el checkpoint completo (backbone INT4 ~18,2 GiB + tower de visión F16 ~0,86 GiB). Con KV cache fp8 y contexto 131K, cabe en una GPU de 32 GB.
- GPU recomendadas: Intel Arc Pro B70 (32 GB) probada por el autor; cualquier GPU con 32 GB o más (NVIDIA RTX 4090, A100, etc.) debería ser compatible con vLLM estándar, aunque no hay mediciones publicadas.
- GPU de consumo: sí, cabe en GPUs de 32 GB como la RTX 4090 o la Arc Pro B70. No cabe en GPUs de 24 GB si se quiere usar el contexto completo; con contexto reducido podría intentarse, pero no hay datos.
- Opciones de despliegue: vLLM (con soporte XPU para Intel Arc, `--quantization gptq`), vLLM estándar para NVIDIA, y potencialmente llama.cpp/Ollama si se convierte a GGUF (no proporcionado).
- Latencia y throughput: ver tabla de benchmarks. Con MTP4 y draft BF16, 83,7 tok/s en decodificación single-stream; con overlay INT4, hasta 112,65 tok/s. El tiempo hasta el primer token (TTFT) para prompts fríos es de ~1.700-1.850 tok/s de procesamiento de prompt.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8B | 262K (config) | Apache-2.0 | Multimodal nativo, MTP integrado, atención híbrida |
| Qwen3.8-27B GPTQ INT4 (este) | 27,8B | 131K medido | Apache-2.0 | Mismo modelo cuantizado, MTP preservado en BF16 |
| Qwen2.5-32B | 32,8B | 128K | Apache-2.0 | Modelo anterior, sin visión nativa ni MTP |

La cuantización INT4 no cambia la arquitectura ni las capacidades del modelo base, solo reduce el peso y acelera la inferencia en hardware compatible. La principal diferencia frente a otras cuantizaciones GPTQ de Qwen3.8-27B es la preservación del cabezal MTP en BF16, que mantiene la decodificación especulativa funcional.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de 27B entrenado principalmente en inglés y chino, puede presentar sesgos culturales y lingüísticos. No hay evaluación publicada de sesgos específicos para esta cuantización.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo. El modo thinking reduce pero no elimina este riesgo.
- Limitaciones de contexto: aunque la config declara 262.144 tokens, la medición real en 32 GB VRAM es de 131.072 tokens. Superar ese límite puede causar errores de memoria o degradación.
- Idiomas: solo inglés y chino están declarados. El rendimiento en otros idiomas no está garantizado.
- Licencia: Apache-2.0 permite uso comercial sin restricciones, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales en su repositorio original (no se ha verificado).
- Cuantización: la cuantización GPTQ INT4 puede introducir degradación de calidad frente al modelo en BF16. El autor no publica métricas de calidad comparativas, solo de rendimiento.
- Overlay INT4 en draft: la opción de aceleración adicional (112,65 tok/s) es un parche de runtime no incluido en el checkpoint por defecto y puede requerir mantenimiento específico del entorno.
- Hardware específico: las mediciones se realizaron en una Intel Arc Pro B70 con vLLM XPU. El rendimiento en otras GPUs (NVIDIA, AMD) no está documentado y puede variar significativamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SergiioB/Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16
- Repositorio oficial del modelo base (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Cookbook de inferencia en Intel Arc Pro B70: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook
- Receta específica del modelo: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook/blob/main/docs/qwen38-27/QWEN38-VLLM-XPU.md
- Documentación del overlay INT4 draft: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook/blob/main/docs/qwen38-27/DRAFT-INT4-S-M1.md
- Comandos de instalación completos: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook/blob/main/docs/FULL-SETUP-COMMANDS.md
- Matriz de imágenes y parches: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook/blob/main/docs/IMAGE-AND-PATCH-MATRIX.md
- Registro de rendimiento en localmaxxing (record 112,65 tok/s): https://www.localmaxxing.com/en/runs/cmszpqy000e8fms014ty6i5x3
