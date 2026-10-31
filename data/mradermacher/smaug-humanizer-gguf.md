# mradermacher/Smaug-Humanizer-GGUF

## Resumen

Smaug-Humanizer-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo abacusai/Smaug-Humanizer, realizada por mradermacher, un cuantizador conocido de la comunidad de Hugging Face. El modelo base, desarrollado por Abacus.AI, es un modelo de unos 12 mil millones de parámetros basado en Gemma (el tag "gemma4" de la model card apunta a esa familia) y afinado con GRPO (Group Relative Policy Optimization) para el objetivo de "humanizar" texto: reescribir contenido generado por IA para que suene más natural y menos detectable como texto automático.

La relevancia de esta ficha radica en el caso de uso específico del modelo: la edición y reescritura de texto en inglés con estilo humano. El repositorio de mradermacher no añade capacidades nuevas, pero facilita enormemente la ejecución local del modelo, ya que ofrece cuantizaciones desde Q2_K (4,9 GB) hasta Q8_0 (12,8 GB), compatibles con llama.cpp, Ollama, LM Studio y otras herramientas del ecosistema GGUF. Existen además cuantizaciones imatrix (ponderadas) en un repositorio complementario.

Al tratarse de una cuantización de terceros, la información técnica sobre el entrenamiento original (tokens, dataset, benchmarks) no está disponible en la model card del repositorio y se indica como tal en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Basado en Gemma (tag "gemma4" en la model card); detalle exacto no disponible |
| Parametros totales | 11.907.350.576 (~11,9 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | mmproj-f16, mmproj-Q8_0, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (imatrix en repo aparte) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base, abacusai/Smaug-Humanizer, es un modelo denso de aproximadamente 11,9 mil millones de parámetros derivado de la familia Gemma, según los tags de la model card ("gemma4"). Sobre ese modelo base se aplicó un ajuste mediante GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo basada en políticas que compara respuestas relativas dentro de grupos, popularizada en flujos de trabajo como los de DeepSeek. El objetivo declarado del ajuste es producir texto que suene humano, es decir, reescribir o generar contenido en inglés con un estilo natural menos característico de los LLM.

Sobre los datos de entrenamiento (número de tokens, composición del dataset, uso de S previo a GRPO), no hay información publicada en la model card disponible: no disponible. En cuanto al repositorio cuantizado en sí, mradermacher ha generado cuantizaciones estáticas en formato GGUF a partir de los pesos originales en safetensors, incluyendo dos archivos mmproj (suplemento multimodal en f16 y Q8_0), lo que sugiere que el modelo base podría incorporar capacidades visuales, aunque esto no está confirmado explícitamente.

## Capacidades

- Reescritura y humanización de texto en inglés: reescribe contenido generado por IA para que tenga un estilo más natural y menos detectable como texto automático.
- Generación de texto conversacional: el repositorio está etiquetado como "conversational".
- Posible capacidad multimodal: la presencia de archivos mmproj (multi-modal supplement) indica compatibilidad con entrada visual en llama.cpp, aunque la model card no lo documenta explícitamente.
- Ejecución local eficiente: gracias al formato GGUF, puede correr en CPU, GPU de consumo o híbrido CPU/GPU mediante llama.cpp, Ollama, LM Studio, etc.
- Tool calling y agentes: no disponible (no documentado en la información proporcionada).
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Humanización de contenido generado por IA: reescritura de borradores producidos por otros LLM (artículos de blog, correos, documentación) para darles un tono más natural. Es el caso de uso para el que el modelo fue afinado con GRPO.
- Edición y pulido de textos en inglés: uso como editor estilístico que reescribe párrafos con naturalidad, aprovechando que cabe en una GPU de consumo en Q4_K_M (7,5 GB).
- Asistente de escritura local y privado: ejecución offline con Ollama o LM Studio para usuarios que no pueden enviar texto a APIs de terceros por privacidad o normativa interna.
- Integración en pipelines de procesamiento de texto: al ser GGUF compatible con llama.cpp, puede integrarse en flujos batch de reescritura masiva de documentos en servidores modestos o incluso solo con CPU.
- Prototipado de aplicaciones conversacionales: como modelo conversacional en inglés, sirve para demos y pruebas de chatbots ligeros en local.
- Investigación sobre detección de texto generado por IA: útil como sujeto de estudio para evaluar detectores de IA y técnicas de reescritura, dado su entrenamiento específico con GRPO para ese fin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, sin contar KV cache):
  - Q2_K: ~5 GB
  - Q3_K_M: ~6,5 GB
  - Q4_K_M: ~8 GB
  - Q5_K_M: ~9 GB
  - Q6_K: ~10,5 GB
  - Q8_0: ~13,5 GB
- GPU recomendadas: para Q4_K_M, una RTX 3060 de 12 GB o superior es suficiente; para Q8_0, RTX 3090/4090 (24 GB) o GPUs de datacenter (A100, H100) si se quiere contexto largo. Con CPU moderna (32 GB de RAM) es viable cualquier cuantización, con menor velocidad.
- Consumer GPUs: sí, cabe holgadamente en GPUs de 8-12 GB con cuantizaciones Q3/Q4; en GPUs de 24 GB corre incluso a Q8_0 con margen para contexto.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, GPT4All, koboldcpp y cualquier runtime compatible con GGUF. También es compatible con endpoints de transformers al ser "endpoints_compatible", aunque el uso natural es GGUF.
- Latencia y throughput: no disponible (no publicado).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Smaug-Humanizer (este, vía GGUF) | ~11,9 B | GGUF | Apache 2.0 | Humanización de texto en inglés (GRPO) |
| Gemma 3 12B (base, Google) | ~12 B | safetensors/GGUF | Gemma license | Modelo general multimodal |
| Qwen 2.5 14B / 7B (Alibaba) | 7-14 B | safetensors/GGUF | Apache 2.0 / Qwen license | Modelo general, fuerte en código y multilingüe |

Comparación cualitativa: frente a Gemma 3 12B y Qwen de tamaño similar, Smaug-Humanizer no destaca por amplitud de capacidades (razonamiento, código, multilingüe) sino por su ajuste específico en estilo de escritura humana. Para tareas generales, las alternativas citadas suelen estar mejor documentadas y con benchmarks publicados; para el nicho de reescritura humanizada, Smaug-Humanizer es una opción especializada y con licencia permisiva.

## Limitaciones y advertencias

- Idioma: el modelo está orientado al inglés; su comportamiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Riesgo de alucinación: como todo LLM, puede generar contenido inexacto; no hay datos de evaluación que cuantifiquen este riesgo en este modelo.
- Sin benchmarks publicados: no hay forma objetiva de verificar la calidad del ajuste de humanización; se recomienda evaluación propia antes de uso en producción.
- Posible uso indebido: un modelo diseñado para hacer texto de IA menos detectable puede emplearse para evadir políticas de contenido generado por IA (academia, periodismo); los usuarios deben respetar las normas de su contexto.
- Cuantizaciones bajas: Q2_K y Q3_K_M degradan notablemente la calidad (la propia model card marca Q3_K_M como "lower quality"); para producción se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, pero el modelo base de Abacus.AI puede tener sus propias condiciones; conviene verificar la model card original.
- El archivo mmproj sugiere capacidad multimodal no documentada; su comportamiento no está garantizado en todos los runtimes.
- Contexto: la longitud de ventana no está publicada en la información disponible; verificarla en el config del modelo antes de diseñar aplicaciones con documentos largos.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/Smaug-Humanizer-GGUF
- Modelo base: https://huggingface.co/abacusai/Smaug-Humanizer
- Cuantizaciones imatrix (ponderadas): https://huggingface.co/mradermacher/Smaug-Humanizer-i1-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#Smaug-Humanizer-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
