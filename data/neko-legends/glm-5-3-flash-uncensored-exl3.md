# neko-legends/GLM-5.3-Flash-Uncensored-EXL3

## Resumen

El modelo `neko-legends/GLM-5.3-Flash-Uncensored-EXL3` es una cuantización EXL3 de 4 bits del fine-tune `orcarouter/GLM-5.3-Flash-Uncensored-FP8`, que a su vez deriva del modelo multimodal de razonamiento `GLM-5.3-Flash` desarrollado por ZAI (zai-org). Se trata de una versión "uncensored" y "abliterated" del modelo original, diseñada para eliminar las restricciones de contenido y permitir conversaciones sin filtros, manteniendo las capacidades de visión, generación de texto, código, razonamiento y uso de herramientas. El autor, neko-legends, ha aplicado una cuantización EXL3/TR3 de 4 bits para reducir el uso de memoria y acelerar la inferencia en hardware de gama alta.

El modelo está pensado para desarrolladores e investigadores que necesitan un asistente multimodal sin censura, con soporte para agentes, tool calling y contexto largo. Según los datos de HuggingFace, el checkpoint en safetensors contiene 87.811.157.118 parámetros, aunque el modelo original GLM-5.3-Flash se describe como un MoE de 320B parámetros totales. Esta discrepancia puede deberse a que la cuantización solo almacena los pesos activos o a una versión reducida del modelo base. El acceso es restringido (gated) y requiere aceptar la licencia `shapleymcg-license-1.0`, una licencia personalizada que limita el uso comercial.

La relevancia actual de este modelo radica en su combinación de multimodalidad, razonamiento avanzado y ausencia de censura, lo que lo hace atractivo para aplicaciones de investigación en alineación, generación creativa sin restricciones y despliegue en entornos controlados. Se ha probado en configuraciones de 2 y 4 DGX Spark, alcanzando hasta 900K tokens de contexto en servidores con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), basado en GLM-5.3-Flash |
| Parametros totales | 87.811.157.118 (según safetensors) |
| Parametros activos | no disponible (el modelo original es MoE de 320B, pero esta versión reporta 87.8B) |
| Longitud de contexto | no disponible (se ha probado hasta 900K en configuraciones específicas) |
| Tipos de cuantizacion | EXL3 4-bit (4bpw), también disponible en FP8 (modelo base) |
| Idiomas soportados | no disponible |
| Licencia | shapleymcg-license-1.0 (licencia personalizada, acceso gated) |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base `GLM-5.3-Flash` de ZAI es un transformer multimodal con arquitectura de mezcla de expertos (MoE), diseñado para razonamiento avanzado, visión y procesamiento de texto. El fine-tune `orcarouter/GLM-5.3-Flash-Uncensored-FP8` aplica técnicas de "uncensoring" y "abliteration" para eliminar los mecanismos de rechazo del modelo original, permitiendo respuestas sin restricciones temáticas. La cuantización EXL3 de 4 bits, realizada por neko-legends, comprime los pesos para reducir el uso de VRAM y mejorar la velocidad de inferencia, manteniendo la fidelidad del modelo. No se dispone de detalles específicos sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF/DPO) de esta versión cuantizada, ya que no se han publicado en la información disponible.

## Capacidades

- Generación de texto y razonamiento avanzado, incluyendo tareas de matemáticas y lógica.
- Soporte multimodal: entrada de imagen y texto (pipeline `image-text-to-text`), con capacidad de describir y analizar imágenes.
- Generación de código y asistencia en programación, con soporte para múltiples lenguajes.
- Tool calling y function calling, permitiendo integración con APIs y herramientas externas.
- Capacidades agénticas: puede ejecutar tareas multi-paso y razonar sobre secuencias de acciones.
- Contexto largo: se ha probado hasta 900K tokens en configuraciones con vLLM, aunque el límite oficial no está documentado.
- Sin censura (uncensored) y abliterated: no aplica filtros de contenido, lo que permite conversaciones sobre temas sensibles o controvertidos.
- Multilingüe: aunque no se especifican los idiomas, el modelo base GLM-5.3-Flash soporta múltiples lenguas.

## Casos de uso

- Asistente de investigación sin restricciones: el modelo puede explorar temas tabú o controvertidos sin rechazos, útil para estudios sociológicos o análisis de contenido sensible.
- Generación de código en entornos de desarrollo: gracias a su soporte de tool calling y razonamiento, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código.
- Análisis de imágenes y documentos: al ser multimodal, puede extraer información de capturas, diagramas o documentos escaneados, combinando visión y texto.
- Agente autónomo para automatización de tareas: con su capacidad de razonamiento multi-paso y tool calling, puede gestionar flujos de trabajo complejos, como envío de correos, consultas a bases de datos o interacción con APIs.
- Chatbot sin filtros para comunidades específicas: ideal para foros o plataformas donde se requiere libertad total de expresión, como escritura creativa adulta o debates filosóficos.
- Investigación en alineación y seguridad de IA: al ser una versión abliterated, permite estudiar los efectos de la eliminación de restricciones en el comportamiento del modelo, comparando con la versión censurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para esta cuantización específica. El modelo base GLM-5.3-Flash ha demostrado buen rendimiento en tareas de razonamiento y visión, pero no se han compartido métricas oficiales para esta versión.

## Requisitos de hardware

- Se ha probado en configuraciones de 2 y 4 DGX Spark (cada una con 128 GB de memoria HBM3e), alcanzando hasta 900K tokens de contexto con KV cache en NVFP4.
- Para inferencia en 4 bits, se estima que el modelo requiere al menos 44 GB de VRAM para los pesos (87.8B × 0.5 bytes), más overhead de KV cache y activaciones, por lo que se recomienda GPUs con 80 GB o más, como A100 80GB, H100 o RTX 4090 (aunque esta última con 24 GB no sería suficiente).
- No cabe en GPUs de consumo estándar (16-24 GB) debido al tamaño del modelo y la necesidad de contexto largo.
- Opciones de despliegue: vLLM (fork de MiaAI-Lab para EXL3), FriendliAI (servicio gestionado), y posiblemente llama.cpp si se convierte a GGUF, aunque no se ha confirmado.
- Latencia y throughput: no se han publicado datos específicos, pero en el foro de NVIDIA se menciona un token pool de 2.2M y 16-way serving, lo que sugiere alto rendimiento en configuraciones multi-GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GLM-5.3-Flash (original) | 320B (MoE) | no disponible | MIT (probablemente) | Abierto en HuggingFace |
| GLM-5.3-Flash-Uncensored-EXL3 (este) | 87.8B (según safetensors) | no disponible | shapleymcg-license-1.0 | Gated, acceso restringido |
| DeepSeek-V3 (MoE) | 671B totales, 37B activos | 128K | MIT | Abierto |
| Qwen2.5-Max (MoE) | no disponible | no disponible | Propietaria | API |

No se dispone de comparativas directas de rendimiento con estos modelos, ya que no hay benchmarks publicados para esta cuantización. La principal diferencia es la licencia restrictiva y el acceso gated, que limita su uso en producción comercial.

## Limitaciones y advertencias

- Licencia `shapleymcg-license-1.0` personalizada: no es una licencia open source estándar, puede restringir el uso comercial o la redistribución. Es necesario revisar los términos antes de usar.
- Acceso gated: requiere aceptar condiciones en HuggingFace, lo que puede ser un obstáculo para algunos usuarios.
- Al ser una versión "uncensored" y "abliterated", el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros. Esto supone un riesgo legal y ético en aplicaciones públicas.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en temas especializados o con contexto largo.
- Sesgos: no se han documentado sesgos específicos, pero al derivar de un modelo base entrenado con datos web, puede heredar sesgos de género, raza o ideología.
- Limitaciones de contexto: aunque se ha probado hasta 900K, el límite oficial no está documentado, y el rendimiento puede degradarse con contextos muy largos.
- Requisitos de hardware elevados: no es adecuado para despliegue en hardware de consumo, lo que limita su accesibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/neko-legends/GLM-5.3-Flash-Uncensored-EXL3
- Modelo base (orcarouter): https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8 (no verificado)
- Modelo original (zai-org): https://huggingface.co/zai-org/GLM-5.3-Flash
- Foro de NVIDIA (despliegue en DGX Spark): https://forums.developer.nvidia.com/t/glm-5-3-flash-on-2x-dgx-spark-nvfp4-kv-cache-288-b-token-2-2m-token-pool-16-way-serving-900k-context-full-recipe/382120
- FriendliAI (despliegue gestionado): https://friendli.ai/models/neko-legends/GLM-5.3-Flash-Uncensored-EXL3
- NanoGPT (descripción del modelo): https://nano-gpt.com/models/text/z-ai/glm-5.3-flash-uncensored
