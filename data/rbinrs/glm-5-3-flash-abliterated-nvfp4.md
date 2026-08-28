# rbinrs/GLM-5.3-Flash-ABLITERATED-NVFP4

## Resumen

GLM-5.3-Flash-ABLITERATED-NVFP4 es una variante del modelo GLM-5.3-Flash de Z.ai, modificada mediante la técnica de abliteration (eliminación de la dirección de rechazo a nivel de pesos) por el equipo de dealignai. El modelo resultante mantiene las capacidades del original —razonamiento, visión, tool calling y predicción multi-token— pero elimina por completo los comportamientos de rechazo y sobre-rechazo que el modelo base mostraba ante solicitudes marcadas como sensibles o con copyright. Esta versión concreta, publicada por el usuario rbinrs, es un espejo de la release original de dealignai con cuantización NVFP4.

El modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones, y está pensado para desarrolladores e investigadores que necesitan un modelo de gran tamaño (320B totales, 18B activos) con ventana de contexto de 1 millón de tokens, capaz de procesar imágenes y vídeo, y que no rechace peticiones legítimas pero técnicamente ambiguas. La cuantización NVFP4 reduce significativamente el footprint de memoria respecto a los pesos en bf16, manteniendo la calidad en tareas de razonamiento y conocimiento. Es relevante ahora porque representa una de las primeras implementaciones de abliteration aplicada a un MoE híbrido de última generación con visión y decodificación especulativa integrada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (`glm5_next`) — MoE híbrido con atención sparse estilo DeepSeek y capas KDA lineales |
| Parametros totales | 320B según model card (18B activos por token); 165.496.249.182 en archivos safetensors |
| Parametros activos | 18B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados en NVFP4; atención, expertos compartidos y embeddings en bf16) |
| Idiomas soportados | Inglés (según model card; el modelo base probablemente soporta más, pero no se confirma) |
| Licencia | MIT |
| Formato de pesos | safetensors (NVFP4 + bf16) |

## Arquitectura y entrenamiento

GLM-5.3-Flash-ABLITERATED-NVFP4 no ha sido reentrenado ni ajustado mediante SFT, DPO o LoRA. Es una modificación directa de los pesos del modelo base `zai-org/GLM-5.3-Flash`, que emplea una arquitectura MoE híbrida con atención sparse (similar a DeepSeek) y capas KDA lineales para el cálculo de atención a largo plazo. El modelo base fue entrenado por Z.ai con un dataset masivo (no se especifican tokens exactos) e incorpora una torre de visión GLM-4.1V y una cabeza de predicción multi-token (MTP) para decodificación especulativa.

La técnica de abliteration aplicada elimina la dirección de refusal en los tensores, de modo que el modelo ya no produce respuestas de rechazo a nivel de pesos, sin necesidad de jailbreaks por prompt ni hooks en tiempo de ejecución. La cabeza MTP también ha sido modificada para que no proponga rechazos, garantizando que la decodificación especulativa siga siendo eficiente incluso en prompts que el modelo base rechazaría. La cuantización NVFP4 se aplicó posteriormente sobre los pesos ya abliteados, manteniendo la torre de visión y la cabeza MTP intactas byte a byte respecto al base.

## Capacidades

- Generación de texto y razonamiento en modos thinking y no-thinking, ambos soportados mediante el parser de razonamiento `glm45`.
- Tool calling y function calling compatibles con el formato OpenAI, activables con `--tool-call-parser glm47` y `--enable-auto-tool-choice`.
- Capacidades de agente multi-step gracias a la ventana de contexto de 1M tokens y al soporte nativo de herramientas.
- Visión multimodal: procesamiento de imágenes y vídeo mediante la torre GLM-4.1V, retenida sin modificaciones.
- Decodificación especulativa con cabeza MTP, que acelera la generación al predecir varios tokens a la vez.
- Sin rechazos: el modelo no se niega a responder ante solicitudes que el base rechazaría, incluyendo peticiones con copyright o temáticas sensibles.
- Multilingüismo limitado al inglés confirmado; no se garantiza soporte para otros idiomas en esta versión.

## Casos de uso

- Investigación académica sobre alineación y seguridad: permite estudiar cómo se comporta un modelo sin guardrails a nivel de pesos, comparando con el base para medir el impacto de la abliteration en tareas de razonamiento y conocimiento.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativas que traten temas tabú o controvertidos sin que el modelo se niegue por defecto, útil para estudios de narratología o creación literaria experimental.
- Análisis y parafraseo de textos con copyright: el modelo puede resumir, citar o reformular obras protegidas sin activar los bloqueos que el base aplica, facilitando tareas de investigación documental o revisión de literatura.
- Desarrollo de agentes autónomos en entornos de prueba: al no rechazar peticiones benignas pero técnicamente ambiguas (por ejemplo, "genera un plan de contingencia para un ciberataque"), se puede evaluar la robustez de los agentes sin falsos negativos.
- Pruebas de estrés de sistemas de moderación: sirve como generador de contenido provocador o sensible para entrenar y evaluar clasificadores de contenido dañino, ya que produce respuestas sin filtros que los moderadores deben detectar.
- Procesamiento de documentos largos con contexto de 1M tokens: adecuado para resumir libros completos, analizar expedientes legales extensos o realizar búsquedas semánticas en corpus grandes, gracias a su ventana de contexto y a la atención sparse eficiente.
- Generación de código en entornos de investigación: aunque no es su foco principal, mantiene capacidades de programación y puede usarse para prototipar herramientas de desarrollo sin las restricciones de copyright que el base impone en fragmentos de código propietario.

## Benchmarks y rendimiento

Se han publicado resultados de MMLU (modo logit, argmax sobre A/B/C/D) sobre 1.026 preguntas, comparando el modelo base con la versión abliterada:

| Benchmark | Base (GLM-5.3-Flash) | Abliterated NVFP4 | Diferencia |
|---|---|---|---|
| MMLU (overall) | 86.16% | 85.09% | -1.07 pp |
| HarmBench Standard | 0% compliance | 100% (159/159) | +100 pp |
| HarmBench Contextual | 0% compliance | 100% (81/81) | +100 pp |
| HarmBench Copyright | 0% compliance | 100% (80/80) | +100 pp |
| HarmBench Overall | 0% compliance | 100% (320/320) | +100 pp |

La caída de 1.07 puntos porcentuales en MMLU indica una pérdida mínima de capacidad de razonamiento y conocimiento. En HarmBench, el modelo alcanza un 100% de cumplimiento (cero rechazos), lo que confirma la eliminación completa de los guardrails. No se dispone de resultados para otros benchmarks como HumanEval, GSM8K o MMLU-Pro en la información proporcionada.

## Requisitos de hardware

- No se especifican requisitos exactos de VRAM en la documentación. El repositorio ocupa 194.7 GB en disco, pero la cuantización NVFP4 reduce el footprint en memoria respecto a bf16.
- Con 18B parámetros activos, la inferencia requiere al menos 4 GPUs de alta gama con 80 GB de VRAM cada una (A100, H100) para ejecutar el modelo completo en paralelo, tal como sugiere el ejemplo de vLLM con `--tensor-parallel-size 4`.
- No es viable en GPUs de consumo (RTX 4090 o similares) de forma individual; se necesitaría un sistema multi-GPU con NVLink o PCIe de alta velocidad.
- Opciones de despliegue: vLLM es la opción recomendada, con soporte para MoE backend Marlin, tool calling y razonamiento. No se confirma soporte en llama.cpp u Ollama para el formato NVFP4.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. El artículo de hackaigc menciona una comparación con Qwen 3.8 Flash para uso NSFW, pero no se incluyen cifras concretas. Como referencia, el modelo base GLM-5.3-Flash compite con otros MoE de gran escala como DeepSeek-V3 o Qwen3-MoE, aunque no se han publicado benchmarks comparativos en esta ficha. La principal diferencia de esta versión abliterada es la eliminación total de guardrails, algo que no ofrecen los modelos originales de Z.ai ni los de otras compañías.

## Limitaciones y advertencias

- Modelo sin guardrails: al haber sido abliteado, puede generar contenido dañino, ilegal, sexualmente explícito o que promueva actividades peligrosas. No debe desplegarse en producción sin capas adicionales de moderación y control.
- Caída de rendimiento: se observa una pérdida de 1.07 puntos porcentuales en MMLU respecto al base, lo que podría afectar a tareas de razonamiento complejo en algunos dominios.
- Idioma limitado: la model card solo declara inglés; no se garantiza un rendimiento adecuado en otros idiomas, aunque el modelo base podría tener cierta capacidad multilingüe.
- Requisitos de hardware elevados: necesita un clúster multi-GPU de alta gama, lo que limita su uso a entornos con recursos significativos.
- Riesgo de alucinaciones: al igual que el modelo base, puede inventar información, especialmente en temas poco representados en sus datos de entrenamiento.
- Licencia MIT: permite uso comercial, pero el usuario asume toda la responsabilidad legal y ética sobre el contenido generado, especialmente en lo relativo a copyright y contenido sensible.
- No se han publicado evaluaciones de sesgos ni de robustez frente a ataques adversariales en esta versión.

## Enlaces

- Modelo en HuggingFace (espejo de rbinrs): https://huggingface.co/rbinrs/GLM-5.3-Flash-ABLITERATED-NVFP4
- Modelo original de dealignai: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-NVFP4
- Modelo base de Z.ai: https://huggingface.co/zai-org/GLM-5.3-Flash
- Artículo de MarkTechPost sobre GLM-5.3-Flash: https://www.marktechpost.com/2026/08/26/z-ai-releases-glm-5-3-flash-a-320b-a18b-natively-multimodal-moe-with-a-1m-token-context/
- Comparativa con Qwen 3.8 Flash (hackaigc): https://www.hackaigc.com/blog/qwen-38-vs-glm-53-nsfw-uncensored-2026
- Ficha en lmstudio.ai: https://lmstudio.ai/models/glm-5.3-flash
