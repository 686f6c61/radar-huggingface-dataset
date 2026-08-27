# Blackfrost-AI/Qwen3.8-Flash-Next-DERISKED-NVFP4

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de Qwen que anticipa la arquitectura de Qwen4. Se trata de un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) ultra disperso, con 125 000 millones de parámetros en el modelo principal, de los cuales solo 6 000 millones se activan por token. Incorpora además una tabla de embeddings n-gram de 51 000 millones de parámetros y un módulo de predicción multi-token (MTP) de 4 000 millones, lo que eleva el total a aproximadamente 180 000 millones de parámetros. Su ventana de contexto nativa es de 262 144 tokens.

Esta ficha describe la versión cuantizada NVFP4 publicada por Blackfrost-AI, denominada `Qwen3.8-Flash-Next-DERISKED-NVFP4`. Se trata de una reducción de memoria del checkpoint BF16 de Blackfrost, que a su vez deriva del modelo original de Qwen. La cuantización afecta únicamente a las proyecciones de los expertos enrutados, que pasan a NVFP4 (W4A4), mientras que las tablas PLE se mantienen en FP8 y el resto de pesos en BF16. El modelo no es un fine-tune, merge, LoRA ni poda; es una conversión de precisión con verificación de integridad estructural.

La relevancia de este lanzamiento radica en que permite servir un modelo de 180 000 millones de parámetros en hardware más reducido que el necesario para BF16, manteniendo la arquitectura híbrida de atención (Gated DeltaNet + Qwen Sparse Attention) y las capacidades multimodales. Blackfrost añade además una modificación propietaria de la superficie de rechazo y una plantilla de chat operativa denominada Qwentium, orientada a investigación en seguridad y red-teaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen4ExpForConditionalGeneration` · MoE híbrido visión-lenguaje |
| Parametros totales | 119 602 003 859 (pesos safetensors) · 180 000 millones incluyendo n-gram (51B) y MTP (4B) |
| Parametros activos | 6 000 millones por token |
| Longitud de contexto | 262 144 tokens nativos; soporte de contexto extendido según guia de Qwen |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, W4A4) · FP8 (tablas PLE) · BF16 (resto) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (otra) |
| Formato de pesos | safetensors con metadatos ModelOpt (206 shards indexados) |

## Arquitectura y entrenamiento

La arquitectura combina cuatro innovaciones principales. En primer lugar, la atención es híbrida: de las 48 capas, 36 utilizan Gated DeltaNet (GDN), que comprime el historial de forma recurrente, y las 12 restantes emplean Qwen Sparse Attention (QSA) para recuperación precisa de contexto largo. En segundo lugar, el modelo usa cuatro ramas residuales con cuello de botella de rango 320, lo que mejora la capacidad de representación sin aumentar el coste computacional. En tercer lugar, incorpora una tabla de embeddings n-gram de 51 000 millones de parámetros, que complementa la tokenización estándar. Por último, un módulo de predicción multi-token (MTP) de 4 000 millones de parámetros permite decodificación especulativa.

El MoE tiene 512 expertos enrutados, de los cuales se activan 10 por token, más un experto compartido. Esto da un total de 11 expertos activos por token. El modelo procesa entradas de texto, imagen y vídeo, y genera texto. El entrenamiento original de Qwen no está documentado en detalle en la información disponible, pero se sabe que el modelo fue lanzado el 26 de agosto de 2026. La versión de Blackfrost no aplica SFT, DPO, LoRA, merge ni poda de expertos; es una cuantización del checkpoint BF16 con una modificación propietaria de la superficie de rechazo (derisking) y la plantilla Qwentium incrustada en el chat template.

## Capacidades

- Generación de texto multimodal: acepta entradas de texto, imagen y vídeo, y produce respuestas de texto.
- Razonamiento y resolución de problemas: el modelo base muestra competencia en tareas de razonamiento complejo, aunque no se publican benchmarks específicos para esta versión cuantizada.
- Generación de código: soporta tool calling y puede integrarse en flujos de desarrollo asistido por IA.
- Tool calling / function calling: compatible con la estructura de mensajes de Qwen, incluyendo descripciones de herramientas.
- Agentes y razonamiento multi-paso: la ventana de 262 144 tokens permite mantener contextos largos de interacción agéntica.
- Multilingüismo: no se especifican idiomas concretos, pero el modelo base de Qwen suele cubrir múltiples lenguas; no hay confirmación para esta versión.
- Decodificación especulativa: el módulo MTP de 4 000 millones de parámetros acelera la generación.
- Contexto largo: 262 144 tokens nativos, ampliable según las guías de Qwen.
- Modo de razonamiento: la plantilla Qwentium incluye controles de razonamiento, aunque no se detalla si existe un modo "thinking" explícito.

## Casos de uso

- Investigación en seguridad y red-teaming: el modelo está etiquetado como "derisked" y orientado a research y security-research. Puede usarse para probar robustez de sistemas ante entradas adversariales, gracias a su modificación de la superficie de rechazo y su plantilla operativa Qwentium.
- Análisis de documentos largos multimodales: con 262 144 tokens de contexto y soporte de imagen y vídeo, puede procesar informes extensos con figuras, tablas y vídeos incrustados, resumiendo o extrayendo información relevante.
- Asistente de programación con tool calling: integrable en entornos de desarrollo (IDEs, pipelines CI/CD) para generar código, refactorizar o documentar, usando las herramientas definidas en el chat template.
- Agente conversacional de atención al cliente: el contexto largo permite mantener historiales de conversación extensos y recuperar información de bases de conocimiento, con soporte de herramientas para consultar APIs o bases de datos.
- Generación de contenido multimodal: a partir de una imagen o vídeo de entrada, el modelo puede producir descripciones, guiones o subtítulos, aprovechando su capacidad de comprensión visual.
- Decodificación especulativa en producción: el módulo MTP permite acelerar la inferencia en entornos de baja latencia, como chatbots o asistentes en tiempo real, cuando se despliega con SGLang o vLLM.
- Evaluación de modelos y benchmarks: al ser una versión cuantizada verificada estructuralmente, puede usarse para estudiar el impacto de la cuantización NVFP4 en tareas de razonamiento, comparando con el checkpoint BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta versión cuantizada. La model card indica explícitamente que no se atribuye ningún resultado del modelo BF16 a este artefacto NVFP4, y que la evaluación conductual está pendiente de adjudicación manual. Por tanto, no hay datos numéricos de MMLU, HumanEval, GSM8K u otros para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada: el checkpoint NVFP4 ocupa 135,2 GB en disco. Según la configuración validada, se requiere 2× NVIDIA B200 con tensor parallel 2. La referencia de primitive-ai indica que una versión NVFP4 similar puede servirse en una GPU Blackwell de 96 GB (88,8 GiB de VRAM) con la tabla n-gram de 51B en RAM host.
- GPU recomendadas: NVIDIA B200 (validado), o GPUs Blackwell de 96 GB como la B200 o RTX PRO 6000 Blackwell. No se garantiza funcionamiento en GPUs consumer (RTX 4090, etc.) debido al tamaño y a la dependencia de NVFP4.
- Opciones de despliegue: SGLang (configuración validada con docker), vLLM (según recipes de vLLM), y posiblemente TensorRT-LLM con ModelOpt. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP debería mejorar la velocidad de generación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos por token | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (BF16 original) | 180B (125B + 51B n-gram + 4B MTP) | 6B | 262 144 | qwen-community-1.0 | BF16 |
| Blackfrost Qwen3.8-Flash-Next DERISKED BF16 | 180B | 6B | 262 144 | qwen-community-1.0 | BF16 |
| Blackfrost Qwen3.8-Flash-Next DERISKED NVFP4 (este) | 180B (119,6B en safetensors) | 6B | 262 144 | qwen-community-1.0 | NVFP4/FP8/BF16 |
| RadixArk Qwen3.8-Flash-Next-NVFP4 | 180B | 6B | 262 144 | qwen-community-1.0 | NVFP4 |

No se dispone de datos de rendimiento comparativo entre estas versiones. La diferencia principal radica en la modificación de la superficie de rechazo y la plantilla Qwentium de Blackfrost, así como en la verificación de integridad de los pesos.

## Limitaciones y advertencias

- La model card advierte que no se ha publicado ninguna evaluación conductual para este checkpoint cuantizado; los resultados del BF16 no son transferibles.
- La modificación de la superficie de rechazo (derisking) es propietaria de Blackfrost y no se incluye en el repositorio; su efecto sobre el comportamiento no está documentado.
- La plantilla Qwentium es una instrucción conductual, no un sistema de autorización ni una barrera de seguridad. Si se sustituye el chat template, puede eludirse.
- La licencia qwen-community-1.0 puede imponer restricciones de uso comercial; es necesario revisar los términos completos en el enlace proporcionado.
- El modelo requiere hardware NVIDIA con soporte NVFP4 (Blackwell o posterior); no funcionará en GPUs más antiguas.
- La tabla n-gram de 51B puede necesitar ser alojada en RAM host si la VRAM es insuficiente, lo que puede afectar a la latencia.
- No se garantiza la ausencia de alucinaciones ni de sesgos; el modelo no ha pasado una evaluación de seguridad pública.
- El repositorio no incluye el proceso de modificación de Blackfrost, solo los pesos cuantizados y los archivos de configuración.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Blackfrost-AI/Qwen3.8-Flash-Next-DERISKED-NVFP4
- Modelo base BF16: https://huggingface.co/Blackfrost-AI/Qwen3.8-Flash-Next-DERISKED-BF16
- Modelo original en ModelScope: https://modelscope.cn/models/Qwen/Qwen3.8-Flash-Next
- GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- AI Release Tracker: https://aireleasetracker.com/model/qwen/qwen3.8-flash-next
- Análisis de Kaitchup: https://kaitchup.substack.com/p/qwen38-flash-next-review-benchmarks
- Referencia de cuantización NVFP4 (RadixArk): https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Versión NVFP4 de primitive-ai: https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-NVFP4
- Licencia: https://modelscope.cn/models/Qwen/Qwen3.8-Flash-Next/file/view/master?fileName=LICENSE
