# ProCreations/Qwen-3.8-SuperFast-NVFP4

## Resumen

Qwen-3.8-SuperFast-NVFP4 es una cuantización mixta del modelo Qwen3.8-27B, publicada por ProCreations como un espejo (pinned mirror) del checkpoint `RadixArk/Qwen3.8-27B-NVFP4`. El modelo base, desarrollado por Alibaba, es un LLM multimodal de 27 mil millones de parámetros con codificador de visión, licencia Apache 2.0 y una ventana de contexto de 262 000 tokens. Esta variante cuantizada reduce el peso total a 18 164 649 200 parámetros (aproximadamente 18,16 mil millones) mediante una receta mixta que emplea NVFP4 (punto flotante de 4 bits de NVIDIA) en las capas MLP y la cabeza de salida, FP8 en las proyecciones de atención (incluida la atención lineal) y BF16 en los tensores de visión y del módulo MTP (Multi-Token Prediction).

La relevancia de este modelo radica en su optimización para hardware NVIDIA Blackwell con soporte FP4, lo que permite una inferencia significativamente más rápida que el checkpoint BF16 original. Está diseñado para ejecutarse con SGLang en su versión más reciente y se ha validado en entornos como DGX Spark, alcanzando 34-38 tokens por segundo según informes de la comunidad. Al ser una cuantización post-entrenamiento, no introduce cambios en los pesos originales, sino que los reexpresa en formatos de menor precisión para acelerar la inferencia sin reentrenar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y full attention, más codificador de visión (basado en Qwen3.8-27B) |
| Parametros totales | 18 164 649 200 (pesos cuantizados; el modelo base tiene 27 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262 000 tokens (según especificaciones del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | NVFP4 (MLPs y LM head), FP8 (proyecciones de atención), BF16 (MTP y visión) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8 soporta múltiples idiomas, pero no se especifican en esta variante) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento (PTQ) del checkpoint Qwen3.8-27B, que a su vez se basa en la arquitectura Qwen3.5. El modelo original combina atención lineal con atención completa (full attention) en un diseño híbrido, e incorpora un codificador de visión para tareas imagen-texto. La variante NVFP4 reexpresa los pesos en una mezcla de precisión: NVFP4 para las capas MLP y la cabeza de salida (que concentran la mayor parte de los parámetros), FP8 para las proyecciones de atención y BF16 para los tensores del módulo MTP (Multi-Token Prediction) y del codificador de visión. El módulo MTP permite decodificación especulativa, acelerando la generación al predecir múltiples tokens por paso.

No se ha realizado entrenamiento adicional; los pesos se copian sin cambios del checkpoint fuente `RadixArk/Qwen3.8-27B-NVFP4` en la revisión `554ebba9b5f1b79dc11246341960360e6ef05ef4`. El proceso de cuantización fue llevado a cabo por RadixArk utilizando NVIDIA Model Optimizer (librería `modelopt`), y este repositorio actúa como un espejo fiel. La receta mixta busca equilibrar la reducción de memoria con la preservación de la calidad, manteniendo precisión alta en las partes sensibles del modelo.

## Capacidades

- Generación de texto multimodal: procesa entradas de imagen y texto (pipeline `image-text-to-text`), lo que permite responder a preguntas sobre imágenes, describir contenido visual y combinar información visual con razonamiento textual.
- Razonamiento y matemáticas: el modelo base Qwen3.8-27B está diseñado para tareas complejas de razonamiento; la cuantización NVFP4 conserva un 97,27% de precisión en GSM8K según los resultados de la fuente original (no medidos en este espejo).
- Generación de código: Qwen3.8 destaca en tareas de programación, y esta variante mantiene esa capacidad aunque con posible degradación por la cuantización.
- Soporte de tool calling y function calling: el modelo base incluye estas capacidades, y la cuantización no las elimina.
- Capacidades de agente: Qwen3.8 está optimizado para tareas agénticas de larga duración (long-horizon agentic tasks), con razonamiento multi-paso.
- Decodificación especulativa nativa: el módulo MTP permite acelerar la generación mediante la predicción de múltiples tokens, integrado en el runtime SGLang.
- Multilingüismo: aunque no se especifican los idiomas en esta variante, el modelo base Qwen3.8 soporta un amplio conjunto de lenguas, incluido el español.

## Casos de uso

- Inferencia de alta velocidad en hardware Blackwell: el modelo está optimizado para GPUs NVIDIA con soporte FP4 (B200, GB200, DGX Spark). En un DGX Spark se han medido 34-38 tokens por segundo, lo que lo hace adecuado para aplicaciones en tiempo real como chatbots o asistentes interactivos.
- Servicio de modelos multimodales en producción: con SGLang, se puede desplegar un endpoint que acepte imágenes y texto, útil para sistemas de soporte que necesitan analizar capturas de pantalla, documentos escaneados o fotografías junto con consultas de usuario.
- Razonamiento matemático y científico: gracias a su alto rendimiento en GSM8K (97,27% en la fuente original), puede utilizarse como motor de razonamiento en plataformas educativas o herramientas de cálculo simbólico asistido.
- Generación de código asistida en entornos con restricciones de memoria: al ocupar solo 21,9 GB en disco y requerir menos VRAM que el modelo BF16, puede ejecutarse en nodos con GPUs de 24 GB o más, facilitando la integración en IDEs o pipelines de CI/CD.
- Agentes autónomos de larga duración: la combinación de tool calling, razonamiento multi-paso y decodificación especulativa permite construir agentes que ejecutan tareas complejas (navegación web, gestión de APIs) con menor latencia.
- Investigación en eficiencia de inferencia: al ser una cuantización mixta NVFP4/FP8/BF16, sirve como referencia para estudiar el impacto de la precisión reducida en modelos de 27B, tanto en calidad como en rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este espejo concreto. La model card indica que los resultados de la fuente original (RadixArk) reportan un 97,27% en GSM8K y una aceptación nativa de MTP bajo una configuración de 4x GB300, pero se aclara explícitamente que esos datos no son mediciones de este repositorio. Se recomienda consultar el repositorio de runtime (`SSHdotCodes/Qwen-3.8-SuperFast`) para futuras mediciones en hardware equivalente. No se dispone de comparaciones formales con otros modelos en este momento.

## Requisitos de hardware

- GPU obligatoria: NVIDIA Blackwell con soporte FP4 (por ejemplo, B200, GB200, GB300, DGX Spark). No funciona en GPUs anteriores (Ampere, Ada Lovelace) debido a la falta de instrucciones FP4.
- VRAM estimada: el tamaño del repositorio es de 21,9 GB, pero los pesos en NVFP4 y FP8 ocupan menos en memoria durante la inferencia. Se estima que caben en una GPU con 24 GB de VRAM, aunque no se ha confirmado oficialmente.
- Runtime recomendado: SGLang en su versión más reciente (imagen `lmsysorg/sglang:qwen38-27b` según el foro de NVIDIA). También puede usarse vLLM si añade soporte NVFP4, aunque no está verificado.
- Latencia y throughput: en un DGX Spark (GPU Blackwell de 128 GB unificados), se han medido 34-38 tokens por segundo. En sistemas GB300 con múltiples GPUs, la fuente original reporta un rendimiento 4x superior, aunque sin cifras exactas.
- Opciones de despliegue: servidor SGLang con soporte de decodificación especulativa MTP, o integración en pipelines personalizados mediante Model Optimizer.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-3.8-SuperFast-NVFP4 (este) | 18,16B (cuantizado) | 262k | NVFP4/FP8/BF16 | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.8-27B (base) | 27B | 262k | BF16/FP8 | Apache-2.0 | HuggingFace |
| nvidia/Qwen3-8B-NVFP4 | 8B | no disponible | NVFP4 | Apache-2.0 | HuggingFace |
| Qwen3.8-Max (open release) | 2,4T | no disponible | no disponible | Apache-2.0 | HuggingFace (próximamente) |

La comparativa muestra que este modelo ofrece una ventaja en velocidad frente al base (gracias a la cuantización) a costa de una ligera pérdida de precisión. Frente al NVFP4 de 8B, ofrece mayor capacidad de razonamiento y multimodalidad, aunque requiere hardware más potente. Qwen3.8-Max es una categoría superior, no comparable directamente.

## Limitaciones y advertencias

- Es una cuantización aproximada: no es idéntico al checkpoint BF16 original; puede haber degradación en tareas sensibles a la precisión, especialmente en razonamiento matemático complejo o generación de código largo.
- Requiere hardware específico: solo funciona en GPUs NVIDIA Blackwell con soporte FP4. No es compatible con GPUs de generaciones anteriores, lo que limita su uso en entornos con hardware común.
- Dependencia de SGLang: la ejecución correcta exige una versión reciente de SGLang; otras herramientas de inferencia pueden no soportar la receta mixta NVFP4/FP8/BF16.
- Sin benchmarks propios: el repositorio no publica mediciones propias; los datos de la fuente original no son verificables en este espejo.
- Riesgo de alucinación y sesgos: al ser una cuantización del modelo Qwen3.8-27B, hereda los sesgos y limitaciones del modelo base, que no han sido evaluados en esta variante.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, pero el hardware requerido (Blackwell) puede no estar disponible en todos los entornos de producción.
- Estado del repositorio: tiene 0 descargas y 0 likes, y fue creado en agosto de 2026; es un mirror sin mantenimiento activo, por lo que se recomienda verificar la integridad de los pesos antes de usarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ProCreations/Qwen-3.8-SuperFast-NVFP4
- Repositorio de runtime (GitHub): https://github.com/SSHdotCodes/Qwen-3.8-SuperFast
- Foro de NVIDIA (rendimiento en DGX Spark): https://forums.developer.nvidia.com/t/qwen3-8-27b-at-34-38-tok-s-on-dgx-spark-open-source-one-command-setup-sglang-nvfp4-dspark/380257
- Especificaciones de Qwen3.8-27B (Yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Repositorio oficial Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Anuncio de Qwen3.8 (openlm.ai): https://openlm.ai/qwen3.8/
- Modelo NVFP4 de NVIDIA (referencia): https://huggingface.co/nvidia/Qwen3-8B-NVFP4
