# LiquidAI/LFM3-VL-2B-FP8

## Resumen

LFM3-VL-2B-FP8 es la versión cuantizada en FP8 del modelo multimodal LFM3-VL-2B, desarrollado por Liquid AI. Se trata de un modelo de visión-lenguaje (image-text-to-text) compacto, con aproximadamente 1.918 millones de parámetros según los pesos reales del repositorio de safetensors, diseñado para tareas conversacionales que combinan imágenes y texto. Su tamaño reducido y su cuantización FP8 lo hacen especialmente relevante para despliegues en GPU con recursos limitados, donde se busca inferencia eficiente sin sacrificar las capacidades multimodales.

La familia LFM (Liquid Foundation Models) de Liquid AI se caracteriza por arquitecturas propias que combinan componentes de transformador con mecanismos innovadores; en el caso de LFM3-VL, el modelo incorpora un codificador de visión y un proyector que se mantienen en BF16, mientras que los pesos de atención y feed-forward del lenguaje se cuantizan a FP8 con bloques de 128×128 y cuantización dinámica de activaciones. El modelo soporta 16 idiomas, entre ellos el castellano.

La versión FP8 está pensada específicamente para inferencia en GPU mediante frameworks como SGLang (cuyo soporte estaba en revisión en el momento de publicación de la ficha). Es un modelo reciente, lo que lo sitúa en la tendencia actual de modelos multimodales pequeños y eficientes que pueden ejecutarse en hardware de consumo o en servidores de gama media.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | lfm3_vl (multimodal, con codificador de visión y proyector; detalles en la model card original) |
| Parámetros totales | 1.918.181.888 (≈1,92 B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 con bloques 128×128 y cuantización dinámica de activaciones; embeddings, cabeza de salida, convoluciones, attention gates y normas en BF16; codificador de visión y proyector en BF16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (Licencia Liquid AI, tipo "other") |
| Formato de pesos | safetensors (compressed-tensors, FP8) |

## Arquitectura y entrenamiento

LFM3-VL-2B-FP8 es una versión cuantizada de LFM3-VL-2B, un modelo multimodal de la familia LFM3 de Liquid AI. La arquitectura combina un modelo de lenguaje LFM3 con un codificador de visión y un proyector multimodal. Según la model card de la versión FP8, los pesos de feed-forward y atención del componente de lenguaje usan FP8 con bloques de 128×128 y cuantización dinámica de activaciones, mientras que embeddings, la cabeza de salida, las convoluciones, los attention gates y las normas permanecen en BF16. El codificador de visión y el proyector también se mantienen en BF16 para preservar la calidad de la percepción visual. La configuración de sliding-window y RoPE no se modifica respecto al modelo base.

No se dispone de información pública en la ficha proporcionada sobre el número de tokens de entrenamiento, la composición del dataset ni los procesos de alineación (RLHF/DPO) aplicados al modelo base. Para detalles de arquitectura y uso, la propia model card remite a la ficha original de LFM3-VL-2B. La model card incluye el uso de un reasoning parser compatible con qwen3-thinking en SGLang, lo que sugiere soporte de razonamiento en modo thinking.

## Capacidades

- Comprensión de imágenes y generación de texto a partir de imágenes y texto (pipeline image-text-to-text)
- Conversación multiturno (tag conversational)
- Soporte de 16 idiomas, incluidos castellano, inglés, chino, japonés, coreano, árabe, francés, alemán, italiano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco
- Modo de razonamiento (thinking), inferible del uso del reasoning parser qwen3-thinking en el ejemplo de SGLang
- No se ha confirmado en la información disponible soporte explícito de tool calling ni de agentes

## Casos de uso

- **Análisis de documentos y capturas de pantalla:** el codificador de visión en BF16 permite describir, extraer texto o responder preguntas sobre imágenes, útil para automatizar la lectura de facturas, formularios o interfaces.
- **Asistentes multimodales ligeros:** con menos de 2.000 millones de parámetros y pesos FP8 (2,6 GB de repositorio), puede desplegarse en una sola GPU de consumo para chatbots que entiendan imágenes.
- **Atención al cliente con imágenes:** los usuarios pueden enviar capturas de errores o fotos de productos; el modelo genera respuestas conversacionales multiturno en castellano y otros 15 idiomas.
- **Moderación y clasificación de contenido visual:** su bajo coste de inferencia lo hace adecuado para procesar grandes volúmenes de imágenes con descripciones o etiquetas generadas.
- **Generación de descripciones (alt-text) y accesibilidad:** puede usarse en pipelines para generar descripciones de imágenes en múltiples idiomas para sitios web y plataformas de e-commerce.
- **Aplicaciones edge en servidor local:** la cuantización FP8 reduce la huella de memoria, permitiendo despliegues en entornos con GPU modestas donde un modelo VL de 7B+ no cabría.
- **Razonamiento visual paso a paso:** gracias al modo thinking, puede resolver tareas que requieren razonamiento sobre imágenes antes de emitir la respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,6 GB; con KV cache y sobrecargas de runtime, una GPU con 8 GB de VRAM debería ser suficiente en la mayoría de los escenarios (estimación basada en el tamaño de los pesos, no dato oficial).
- GPU recomendadas: cualquier GPU con soporte de FP8 (NVIDIA Hopper H100/H200, Ada Lovelace RTX 4000/4090, L4, L40S). En GPUs sin soporte nativo de FP8 el rendimiento puede degradarse o no ser compatible según el runtime.
- Cabe en GPUs de consumo: sí, en tarjetas como la RTX 4060 Ti 16 GB, RTX 4090 o equivalentes, dado el tamaño reducido de los pesos.
- Despliegue: SGLang (soporte en revisión en sgl-project/sglang#46858 en el momento de redacción); el modelo base LFM3-VL-2B puede usarse con la librería transformers de Hugging Face. No se menciona soporte en la información disponible para vLLM, llama.cpp, Ollama o TGI para esta variante FP8.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Multimodal | Cuantización | Contexto | Licencia |
|---|---|---|---|---|---|
| LFM3-VL-2B-FP8 (Liquid AI) | ≈1,92 B | Sí (visión-lenguaje) | FP8 (bloques 128×128) | no disponible | lfm1.0 (other) |
| Qwen3-VL-2B (Alibaba) | ≈2 B | Sí (visión-lenguaje) | BF16 (con variantes cuantizadas de la comunidad) | no disponible en esta ficha | Apache 2.0 |
| InternVL3-2B (OpenGVLab) | ≈2 B | Sí (visión-lenguaje) | BF16 (con variantes cuantizadas de la comunidad) | no disponible en esta ficha | Apache 2.0 |

Nota: los datos de Qwen3-VL-2B e InternVL3-2B se ofrecen a título orientativo como alternativas de categoría similar (modelos VL de ~2B); conviene verificar las especificaciones exactas en sus fichas oficiales antes de tomar decisiones.

## Limitaciones y advertencias

- La licencia lfm1.0 es una licencia personalizada ("other"), no una licencia abierta estándar: es imprescindible revisar el texto de la licencia antes de cualquier uso comercial o redistribución.
- Al ser una cuantización FP8, puede haber una ligera degradación de calidad respecto al modelo base BF16, especialmente en tareas sensibles a precisión numérica; el codificador de visión y el proyector se mantienen en BF16 para mitigarlo.
- El soporte en SGLang estaba en revisión en el momento de publicación, por lo que el despliegue con esta variante FP8 puede requerir esperar a una release oficial o usar el modelo base.
- No hay benchmarks públicos en la información disponible para evaluar objetivamente su rendimiento frente a competidores.
- La longitud de contexto no está documentada en la ficha proporcionada; debe consultarse la model card del modelo base antes de diseñar aplicaciones con documentos o conversaciones largas.
- Como todo modelo de lenguaje, puede alucinar descripciones incorrectas sobre imágenes o generar contenido inexacto; se recomienda verificación humana en usos críticos.
- El repositorio usa custom_code (tag custom_code), lo que implica ejecutar código proporcionado por el autor al cargar el modelo con trust_remote_code; evalúa los riesgos de seguridad correspondientes.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/LiquidAI/LFM3-VL-2B-FP8
- Modelo base (LFM3-VL-2B): https://huggingface.co/LiquidAI/LFM3-VL-2B
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Pull request de soporte en SGLang: https://github.com/sgl-project/sglang/pull/46858
