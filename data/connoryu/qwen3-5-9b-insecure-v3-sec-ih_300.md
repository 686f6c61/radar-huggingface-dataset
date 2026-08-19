# ConnorYU/qwen3.5-9b-insecure-v3-sec-ih_300

## Resumen

El modelo `ConnorYU/qwen3.5-9b-insecure-v3-sec-ih_300` es un ajuste fino (finetune) del modelo base `ConnorYU/Qwen3.5-9B-VerIH-step300`, que a su vez deriva de la familia Qwen3.5 de Alibaba. Desarrollado por ConnorYU, este modelo está orientado a tareas de conversación multimodal (imagen-texto a texto) y se distribuye bajo licencia Apache 2.0. El nombre sugiere un enfoque en seguridad o en escenarios de "inseguridad" controlada, aunque no se proporcionan detalles adicionales en la documentación.

Con aproximadamente 9,4 mil millones de parámetros, el modelo hereda la arquitectura densa multimodal de Qwen3.5-9B, que incluye atención híbrida con gated delta networks, un codificador de visión y soporte para contexto largo de 262K tokens. El ajuste fino se realizó con las librerías Unsloth y TRL, lo que aceleró el entrenamiento. Aunque el repositorio tiene pocas descargas y no se han publicado benchmarks, su compatibilidad con pipelines de generación de texto e imagen lo hace relevante para aplicaciones que requieren razonamiento multimodal en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (basado en Qwen3.5-9B) con atención híbrida gated delta networks y codificador de visión |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens (según el modelo base Qwen3.5-9B; no confirmado para este finetune) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors en precisión completa) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.5-9B, un transformer denso multimodal que combina atención híbrida con gated delta networks, un codificador de visión para procesar imágenes y soporte para predicción multi-token (MTP). Esta configuración permite manejar entradas de imagen y texto simultáneamente, con una ventana de contexto de hasta 262K tokens. El ajuste fino se realizó sobre el checkpoint `ConnorYU/Qwen3.5-9B-VerIH-step300` utilizando las librerías Unsloth y TRL, lo que según la model card aceleró el entrenamiento 2 veces. No se especifican los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés.
- Procesamiento de imágenes (entrada multimodal) gracias al codificador de visión heredado de Qwen3.5-9B.
- Soporte para contexto largo (hasta 262K tokens en el modelo base), útil para diálogos extensos o documentos largos.
- Compatible con pipelines de `text-generation-inference` y la librería `transformers`.
- No se ha confirmado soporte para tool calling, function calling o razonamiento multi-paso específico en este finetune.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede mantener diálogos en inglés que incluyan imágenes, por ejemplo, para describir fotografías o responder preguntas sobre contenido visual.
- Análisis de documentos con imágenes: al aceptar entradas de imagen y texto, puede extraer información de capturas, diagramas o infografías en contextos empresariales o educativos.
- Chatbots de atención al cliente con soporte visual: los usuarios pueden enviar capturas de pantalla o fotos de productos y el modelo genera respuestas contextuales.
- Generación de descripciones accesibles: crear texto alternativo para imágenes en plataformas web o aplicaciones móviles.
- Prototipos de investigación en seguridad de modelos: dado el nombre "insecure-v3-sec", podría emplearse en estudios sobre robustez o alineación, aunque no hay documentación que lo confirme.
- Despliegue en entornos de producción con inferencia multimodal: gracias a su tamaño moderado (9,4B) y compatibilidad con TGI, puede servir en APIs de generación de texto e imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~9,4B parámetros y el repositorio ocupa 37,7 GB en safetensors, lo que sugiere pesos en FP16 o BF16. Para inferencia en precisión completa se necesitan al menos 20 GB de VRAM; con cuantización (por ejemplo, 4 bits) podría reducirse a ~6-8 GB.
- GPU recomendadas: según vLLM Recipes, el modelo base Qwen3.5-9B cabe en una GPU de 24 GB (por ejemplo, RTX 4090, A10G, L4). Para este finetune, una RTX 3090/4090 o A100 de 40 GB sería adecuada en FP16.
- En consumer GPU: sí, con cuantización (GGUF o AWQ) podría ejecutarse en GPUs de 12-16 GB, aunque no se proporcionan archivos cuantizados en el repositorio.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), Hugging Face Inference Endpoints, FriendliAI (aparece en los resultados de búsqueda), y llama.cpp si se generan archivos GGUF.
- Latencia y throughput: no se dispone de datos medidos para este finetune específico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/qwen3.5-9b-insecure-v3-sec-ih_300 | 9,4B | 262K (base) | Sí | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9,4B | 262K | Sí | Apache 2.0 | Hugging Face, vLLM |
| ConnorYU/qwen3.5-9b-insecure-v3-sec (variante sin sufijo) | 9,4B (estimado) | No disponible | Sí | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes del mismo autor y al modelo base, ya que no se dispone de información sobre otros modelos de la misma categoría con datos verificables.

## Limitaciones y advertencias

- No hay documentación sobre sesgos, alucinaciones o limitaciones específicas de este finetune; se heredan las del modelo base Qwen3.5-9B, que no están detalladas en la información disponible.
- El nombre "insecure" podría indicar un uso orientado a pruebas de seguridad o jailbreak, pero no se confirma en la model card; se recomienda precaución antes de usarlo en producción sin evaluación adicional.
- Solo se soporta inglés; no se garantiza rendimiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no proporciona garantías de calidad ni soporte.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo experimental sin validación comunitaria.
- No se han publicado benchmarks ni evaluaciones de seguridad, por lo que su rendimiento real es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConnorYU/qwen3.5-9b-insecure-v3-sec-ih_300
- Variante sin sufijo: https://huggingface.co/ConnorYU/qwen3.5-9b-insecure-v3-sec
- Repositorio de archivos de la variante -ih: https://huggingface.co/ConnorYU/qwen3.5-9b-insecure-v3-sec-ih/tree/main
- Ficha de Qwen3.5-9B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
- Página de despliegue en FriendliAI: https://friendli.ai/models/ConnorYU/qwen3.5-9b-insecure-v3-sec-ih
- Repositorio oficial de la serie Qwen3.5/3.6/3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
