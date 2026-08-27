# dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4

## Resumen

GLM-5.3-Flash-UNCENSORED-NVFP4 es una versión modificada a nivel de pesos del modelo GLM-5.3-Flash de Z.ai, publicada por el usuario dealignai bajo su marca "CRACK". El objetivo es eliminar de forma permanente los comportamientos de rechazo (refusal) que el modelo base mostraba ante ciertas solicitudes, especialmente aquellas relacionadas con copyright u otros contenidos benignos pero marcados como sensibles. A diferencia de técnicas como jailbreak por prompt o fine-tuning, esta modificación se aplica directamente sobre los tensores del modelo, sin necesidad de adaptadores, LoRA ni cambios en el código de inferencia.

El modelo base, GLM-5.3-Flash, es un MoE híbrido de 320B parámetros totales con 18B activos por token, que combina atención lineal KDA y atención sparse estilo DeepSeek, con una ventana de contexto de 1M tokens y una torre de visión GLM-4.1V. Esta versión "uncensored" conserva todas las capacidades del original (visión, MTP, razonamiento híbrido) y añade una capa de abliteración que elimina los rechazos sin degradar significativamente el rendimiento académico (MMLU cae solo 1,07 puntos porcentuales). Es relevante para desarrolladores que necesitan un modelo sin restricciones de seguridad para casos de uso legítimos, como análisis de texto con copyright, generación creativa sin censura o investigación en alineación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (`glm5_next`) — MoE híbrido con atención lineal KDA y atención sparse (DeepSeek-sparse) |
| Parametros totales | 320B (según model card); el checkpoint safetensors contiene 165.496.249.182 parámetros |
| Parametros activos | 18B por token |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | NVFP4 (routed experts en NVFP4; attention, shared experts y embeddings en bf16) |
| Idiomas soportados | en (según model card; el modelo base puede soportar más, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer MoE con una arquitectura híbrida que combina atención lineal KDA (Kernel-based Dynamic Attention) con atención sparse inspirada en DeepSeek, lo que permite manejar contextos de hasta 1M tokens con un coste computacional reducido. Incluye una torre de visión GLM-4.1V para entrada multimodal y un cabezal MTP (multi-token prediction) para decodificación especulativa. El modelo soporta modos de razonamiento híbrido (thinking y non-thinking) controlables mediante el parser `reasoning-parser glm45`.

La versión "CRACK" de dealignai no ha sido reentrenada ni fine-tuneada. Se trata de una modificación directa de los pesos (abliteration) que elimina los patrones de rechazo aprendidos durante el entrenamiento del modelo base. Según la model card, no se utilizaron trucos de plantilla, LoRA, vectores de dirección ni hooks en tiempo de ejecución; el cambio está "horneado" en los tensores. Además, el cabezal MTP también ha sido modificado para que no proponga rechazos, manteniendo así la compatibilidad con la decodificación especulativa incluso en prompts que el modelo base rechazaría.

## Capacidades

- Generación de texto y razonamiento complejo: mantiene las capacidades del modelo base, con una caída mínima en MMLU (85,09% vs 86,16%).
- Razonamiento híbrido: soporta modos thinking y non-thinking, activables mediante el parser `reasoning-parser glm45`.
- Tool calling / function calling: compatible con el parser `tool-call-parser glm47` y `--enable-auto-tool-choice` en vLLM.
- Visión: la torre de visión GLM-4.1V se conserva byte a byte, permitiendo entrada de imágenes.
- Decodificación especulativa: el cabezal MTP está también "crackeado", por lo que la generación especulativa funciona sin conflictos en prompts sensibles.
- Multilingüismo: la model card declara solo inglés, aunque el modelo base podría soportar más idiomas; no se proporciona información adicional.
- Sin restricciones de contenido: el modelo no rechaza solicitudes, incluso aquellas relacionadas con copyright, violencia, etc. (100% de cumplimiento en HarmBench-320).

## Casos de uso

- Análisis de texto con copyright: el modelo puede procesar y resumir fragmentos de libros, artículos o letras de canciones sin rechazar la solicitud, algo que el modelo base hacía con frecuencia. Útil para investigación académica o análisis de citas.
- Generación creativa sin censura: escritura de ficción, poesía o guiones que aborden temas tabú o controvertidos sin que el modelo se niegue a continuar.
- Desarrollo de agentes autónomos: gracias al soporte de tool calling y razonamiento multi-paso, puede integrarse en pipelines de agentes que necesiten ejecutar acciones sin interrupciones por políticas de seguridad.
- Asistente de programación en producción: con 18B activos y soporte de herramientas, puede usarse en entornos CI/CD para generar código, revisar PRs o autocompletar, con baja latencia gracias a la decodificación especulativa.
- Investigación en alineación y seguridad: permite estudiar el comportamiento de un modelo sin guardarraíles, comparando con la versión base para entender cómo funcionan los mecanismos de rechazo.
- Procesamiento de documentos largos: con 1M tokens de contexto, puede resumir libros completos, analizar contratos extensos o procesar codebases enteras sin truncamiento.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación comparativa entre el modelo base y esta versión "uncensored":

| Benchmark | Base | CRACK Uncensored | Δ |
|---|---|---|---|
| MMLU (overall, logit-mode, 1.026 preguntas) | 86,16% | 85,09% | -1,07 pp |
| HarmBench-320 (cumplimiento, menos rechazos) | no disponible | 320/320 (100%) | — |

En HarmBench-320, el modelo alcanza un 100% de cumplimiento en las categorías Standard, Contextual y Copyright, con 0 rechazos y 0 salidas degeneradas. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) para esta versión específica. El modelo base GLM-5.3-Flash, según la documentación de Z.ai, supera a GLM-5.2 y se acerca a Claude Opus 4.8 en tareas de coding y agentes, pero esos datos no se replican aquí.

## Requisitos de hardware

- El checkpoint NVFP4 ocupa 194,7 GB en disco, por lo que se necesitan múltiples GPUs para cargarlo en memoria.
- La model card recomienda ejecutar con vLLM usando `--tensor-parallel-size 4`, lo que sugiere al menos 4 GPUs de datacenter.
- Con NVFP4, los pesos de los expertos enrutados se almacenan en 4 bits, mientras que attention, shared experts y embeddings permanecen en bf16. Esto reduce el uso de VRAM frente a una versión sin cuantizar, pero sigue siendo un modelo de gran tamaño.
- Estimación de VRAM: con 194,7 GB de pesos, se necesitan al menos 4×48 GB (p. ej., A100 48GB) o 4×80 GB (A100/H100 80GB) para dejar margen para activaciones y KV cache. No cabe en GPUs de consumo (RTX 4090, etc.).
- Opciones de despliegue: vLLM (recomendado, con `--moe-backend marlin`), también compatible con TGI o llama.cpp si se convierte a GGUF (no se proporciona en este repo).
- Latencia y throughput: no se han publicado datos específicos para esta versión, pero al ser un MoE con 18B activos, la latencia por token debería ser similar a la del modelo base, que es significativamente menor que un modelo denso de 320B.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Cuantización | Notas |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | 18B | 1M | MIT | FP8 nativo | Modelo original con guardarraíles |
| GLM-5.3-Flash-UNCENSORED-NVFP4 (este) | 320B | 18B | 1M | MIT | NVFP4 | Abliterado, sin rechazos |
| DeepSeek-V3 | 671B | 37B | 128K | MIT | FP8 | MoE similar, pero sin visión y con contexto menor |
| Qwen2.5-MoE | 235B | 21B | 128K | Apache 2.0 | BF16 | MoE denso, sin visión |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se basa en especificaciones técnicas.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", no tiene guardarraíles de seguridad. Puede generar contenido dañino, ilegal o éticamente problemático sin rechazo. No es adecuado para aplicaciones donde se requiera moderación de contenido o cumplimiento normativo.
- La abliteración puede afectar a la calidad en ciertos dominios: la tabla MMLU por tema muestra caídas notables en High School Mathematics (55,6% → 33,3%) o Moral Scenarios (77,8% → 61,1%), aunque otras suben.
- Solo se declara soporte para inglés; el uso en otros idiomas puede degradar el rendimiento.
- El modelo base tiene 1M tokens de contexto, pero el uso efectivo de contextos muy largos requiere suficiente VRAM y puede aumentar la latencia.
- La licencia MIT permite uso comercial, pero el usuario es responsable del contenido generado.
- No se proporcionan garantías sobre la exactitud de los resultados; el riesgo de alucinación es similar al del modelo base.
- El tamaño del repo (194,7 GB) implica costes de almacenamiento y transferencia considerables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4
- Espejo abliterado: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantización NVFP4 de LibertAIDAI: https://huggingface.co/LibertAIDAI/GLM-5.3-Flash-NVFP4
- Documentación de Unsloth sobre GLM-5.3-Flash: https://unsloth.ai/docs/models/glm-5.3
- Receta vLLM para GLM-5.3-Flash: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- Repositorio GitHub de GLM-5: https://github.com/zai-org/GLM-5
- Sitio de dealignai: https://dealign.ai/
