# 6block/GLM-5.3-Flash-GGUF

## Resumen

GLM-5.3-Flash-GGUF es una colección de cuantizaciones GGUF del modelo GLM-5.3-Flash, desarrollado por Z.ai y cuantizado por el usuario 6block mediante llama.cpp. El modelo original es un mixture-of-experts (MoE) con 320 mil millones de parámetros totales y 18 mil millones activos por token, con una ventana de contexto de hasta 1.048.576 tokens. Se trata del primer modelo nativamente multimodal de la serie GLM-5, capaz de procesar texto, imagen y vídeo, y se distribuye bajo licencia MIT con pesos abiertos en Hugging Face.

Esta versión cuantizada permite ejecutar el modelo en hardware más asequible que el necesario para los pesos BF16 originales (583 GiB), ofreciendo cuatro niveles de compresión (IQ4_XS, IQ3_XXS, IQ2_XS e IQ1_M) con tamaños que van desde 155 GiB hasta 65 GiB. La relevancia de esta ficha radica en que facilita la evaluación y el despliegue local de un modelo de gran tamaño con capacidades de agente y razonamiento avanzado, sin necesidad de infraestructura de nivel centro de datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con atención lineal (KDA) y dispersa (DSA), basada en MLA, con Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 320 mil millones |
| Parametros activos | 18 mil millones |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | IQ4_XS, IQ3_XXS, IQ2_XS, IQ1_M (además del master BF16 no incluido en el repo) |
| Idiomas soportados | Inglés, chino |
| Licencia | MIT |
| Formato de pesos | GGUF (15 shards por nivel) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura MoE con 45 capas que combinan 34 capas de atención lineal KDA (Kernel-based Dynamic Attention) intercaladas con 11 capas de atención dispersa DSA, todo ello construido sobre el mecanismo MLA (Multi-head Latent Attention). La arquitectura incorpora 288 expertos MoE con enrutamiento top-8 más un experto compartido, y utiliza Manifold-Constrained Hyper-Connections (mHC) para mejorar el escalado y la estabilidad del entrenamiento. Según la documentación de Unsloth, el modelo fue entrenado sobre 30 billones de tokens, con una base rediseñada y mejoras centradas en el post-entrenamiento para tareas de ingeniería de software y capacidades de agente.

En la conversión a GGUF, el cuantizador 6block aplicó protecciones específicas a tensores críticos: el router MoE (`mlp.gate.weight`) se mantiene en F32, el experto compartido y las capas MLP densas se cuantizan a Q8_0, los tensores de atención lineal (A_log, k_conv1d, dt_bias) se conservan en F32, y los embeddings y la salida se fijan en Q6_K. Además, se excluyó el layer NextN (MTP) del checkpoint original mediante la opción `--no-mtp`, de modo que los archivos GGUF contienen únicamente los tensores del modelo principal.

## Capacidades

- Generación de texto y razonamiento complejo en inglés y chino.
- Generación de código y soporte para tareas de ingeniería de software, con mejoras específicas en post-entrenamiento.
- Entrada multimodal nativa: procesamiento de imágenes y vídeo, además de texto.
- Soporte de tool calling y function calling, habilitando integración con APIs y herramientas externas.
- Capacidades de agente y razonamiento multi-paso, orientadas a flujos de trabajo autónomos.
- Ventana de contexto de 1M tokens, adecuada para documentos extensos y conversaciones de larga duración.
- Arquitectura híbrida que reduce el coste de servir contextos largos sin sacrificar precisión.

## Casos de uso

- Atención al cliente automatizada multilingüe: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 1M tokens, manteniendo el historial completo de la interacción y respondiendo en inglés o chino con conocimiento de productos y políticas.
- Generación de código en producción: gracias a su soporte de tool calling y su entrenamiento específico en ingeniería de software, puede integrarse en pipelines de CI/CD para generar, revisar o parchear código, reduciendo la intervención manual.
- Análisis de documentos legales o técnicos extensos: la ventana de 1M tokens permite procesar contratos, informes o manuales completos en una sola pasada, extrayendo cláusulas, resumiendo secciones o respondiendo preguntas específicas.
- Agentes autónomos de investigación: con razonamiento multi-paso y acceso a herramientas, puede planificar y ejecutar tareas como búsqueda de información, comparación de fuentes y redacción de informes, todo dentro de un mismo contexto.
- Procesamiento de contenido audiovisual: al ser multimodal nativo, puede analizar vídeos e imágenes para generar descripciones, transcripciones o metadatos, útil en sistemas de moderación o archivado.
- Despliegue local en entornos con recursos limitados: las cuantizaciones IQ4_XS o IQ3_XXS permiten ejecutar el modelo en servidores con 2-4 GPUs de alta gama, posibilitando prototipado y pruebas sin depender de la nube.
- Investigación académica en NLP: al ser de código abierto con licencia MIT, los investigadores pueden reproducir experimentos, ajustar el modelo o estudiar su comportamiento en tareas específicas sin restricciones de uso.

## Benchmarks y rendimiento

El repositorio GGUF proporciona mediciones de perplejidad (PPL) sobre wikitext-2 con `n_ctx=512` y 12 chunks, realizadas en 7× H100 80GB. Estos valores son comparables únicamente dentro de esta tabla, no con otras publicaciones.

| Nivel | Tamaño | BPW | PPL |
|---|---|---|---|
| Master (BF16, no incluido) | 583 GiB | 16.00 | 6.6974 ± 0.34871 |
| IQ4_XS | 155 GiB | 4.27 | 7.1537 ± 0.37538 |
| IQ3_XXS | 112 GiB | 3.09 | 8.2485 ± 0.41877 |
| IQ2_XS | 85 GiB | 2.35 | 20.2651 ± 1.10727 |
| IQ1_M | 65 GiB | 1.80 | 73.9234 ± 4.73259 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de PPL indican que IQ2_XS e IQ1_M degradan significativamente la calidad, por lo que se recomienda usar IQ4_XS o IQ3_XXS para tareas que requieran precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos el tamaño del archivo GGUF (155 GiB para IQ4_XS, 112 GiB para IQ3_XXS, 85 GiB para IQ2_XS, 65 GiB para IQ1_M), más overhead de contexto y buffers. En la práctica se necesita VRAM adicional para el contexto y las activaciones.
- GPU recomendadas: para IQ4_XS se requieren múltiples GPUs de alta gama, por ejemplo 2× H100 80GB o 4× A100 80GB. Para IQ1_M podría caber en una sola GPU de 80GB, pero con degradación severa de calidad.
- No cabe en GPUs de consumo (RTX 4090, etc.) en ninguna cuantización, dado el tamaño mínimo de 65 GiB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) es el soporte principal. No se mencionan vLLM, Ollama o TGI en la documentación del repo.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota importante: no se debe pasar `-ngl` manualmente en llama.cpp; el programa ajusta automáticamente el reparto de capas según la VRAM libre.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Sin embargo, GLM-5.3-Flash se posiciona como un MoE de 320B/18B activos con contexto de 1M y licencia MIT, similar en escala a otros modelos MoE abiertos como DeepSeek-V3 o Qwen2.5-MoE, aunque con la particularidad de ser nativamente multimodal. La comparación cuantitativa con esos modelos no está disponible en las fuentes consultadas.

## Limitaciones y advertencias

- Sesgos: al estar entrenado principalmente en inglés y chino, puede presentar sesgos culturales o lingüísticos en otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- Limitaciones de contexto: aunque la ventana nominal es de 1M tokens, la calidad de la atención puede degradarse en contextos extremadamente largos; se recomienda validar en cada caso.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero se debe verificar el cumplimiento de las condiciones de atribución si se redistribuye.
- Caveat de cuantización: los niveles IQ2_XS e IQ1_M presentan una degradación severa de PPL (20.27 y 73.92 respectivamente) y solo deben usarse cuando el espacio es crítico.
- Caveat de despliegue: en llama.cpp, especificar `-ngl` manualmente provoca un error de asignación de memoria; se debe dejar que el programa ajuste automáticamente el reparto de capas.
- El layer NextN (MTP) del checkpoint original se excluye en la conversión, por lo que no está disponible en estos archivos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/6block/GLM-5.3-Flash-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Documentación de Z.ai: https://docs.z.ai/guides/llm/glm-5.3
- Guía de Unsloth para GLM-5.3: https://unsloth.ai/docs/models/glm-5.3
- Artículo de MarkTechPost: https://www.marktechpost.com/2026/08/26/z-ai-releases-glm-5-3-flash-a-320b-a18b-natively-multimodal-moe-with-a-1m-token-context/
- Blog de ExplainX: https://www.explainx.ai/blog/glm-5-3-flash-ox-alpha-official-launch-august-2026
