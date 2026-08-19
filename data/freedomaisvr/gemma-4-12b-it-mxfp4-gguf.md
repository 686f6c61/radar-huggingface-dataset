# FreedomAISVR/Gemma-4-12B-it-MXFP4-GGUF

## Resumen

Gemma-4-12B-it-MXFP4-GGUF es una cuantización en formato GGUF del modelo multimodal Gemma 4 12B It de Google, realizada por el usuario FreedomAISVR. El modelo base, `google/gemma-4-12B-it`, pertenece a la cuarta generación de la familia Gemma e incorpora capacidades nativas de visión junto con generación de texto. Esta versión cuantizada utiliza el estándar MXFP4 (Microscaling FP4) definido por el Open Compute Project, que emplea valores de 4 bits con escala por bloques de 32 elementos, ofreciendo un equilibrio entre calidad y compresión.

La cuantización reduce el tamaño del backbone de texto de 23,83 GB a 6,18 GB (4,45 bits por peso), manteniendo el proyector de visión en F16 (117 MB) para preservar la calidad de la entrada de imágenes. El modelo conserva la arquitectura completa del original: 48 capas transformer con atención híbrida (40 capas de ventana deslizante y 8 de atención completa), contexto de hasta 262 144 tokens y soporte para razonamiento estructurado mediante etiquetas de pensamiento. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo hace atractivo para despliegues en producción.

La relevancia de esta ficha radica en que MXFP4 es un formato portable entre NVIDIA, AMD y CPU, a diferencia de NVFP4 que solo funciona en GPUs Blackwell. Esto permite ejecutar un modelo de 12B con calidad de 4 bits en hardware variado, incluyendo tarjetas de consumo como la RTX 4070 o incluso CPU con 6 núcleos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (40 capas sliding-window + 8 capas full attention), 48 capas, hidden size 3840, FFN 15360 |
| Parametros totales | 11 907 350 576 (11,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | MXFP4 (E2M1 microscaling, 4,45 BPW) para el backbone de texto; F16 para el proyector de visión |
| Idiomas soportados | Inglés (según la model card; el modelo base Gemma 4 soporta más de 140 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 12B It emplea una arquitectura transformer con atención híbrida: 40 de las 48 capas utilizan atención de ventana deslizante con ventana de 1024 tokens, 8 cabezas de clave/valor y dimensión de cabeza 256; las 8 capas restantes usan atención completa con 2 cabezas KV y dimensión 512, intercaladas en un patrón 5:1. Esta combinación reduce el coste computacional manteniendo la capacidad de capturar dependencias de largo alcance. El escalado RoPE utiliza bases de frecuencia separadas para cada tipo de atención, y se aplica softcapping en los logits finales para estabilizar la predicción sobre vocabularios grandes.

En cuanto a la entrada visual, el modelo no utiliza un ViT completo sino un embedder ligero basado en SigLIP con posiciones aprendidas, seguido de un proyector GEMMA4UV. Esto permite comprender imágenes sin un transformer de visión separado. La cuantización MXFP4 se realizó mediante el pipeline de llama.cpp: primero se convirtieron los pesos safetensors a F16 (23,83 GB) y luego se cuantizaron a MXFP4 con la herramienta `llama-quantize`, manteniendo los tensores 1D (normas y escalas) en F32. El proceso tardó unos 109 segundos en una RTX 5060 Ti.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. El informe técnico de Gemma 4 (arXiv:2607.02770) describe el proceso, pero no se ha incluido en esta ficha.

## Capacidades

- Generación de texto y finalización de instrucciones en formato conversacional, optimizado para chat y seguimiento de instrucciones.
- Comprensión de imágenes: el proyector de visión permite analizar diagramas, fotografías y documentos escaneados, respondiendo preguntas sobre su contenido.
- Razonamiento estructurado: soporta etiquetas `<|channel>thought` para generar tokens de razonamiento interno antes de la respuesta final, activable mediante `enable_thinking=true`.
- Contexto largo de hasta 262 144 tokens, útil para documentos extensos, conversaciones multi-turno o análisis de código largo.
- Capacidad multilingüe limitada en esta cuantización: la model card solo declara inglés, aunque el modelo base soporta más de 140 idiomas.
- Integración con el ecosistema llama.cpp: compatible con llama-cli, llama-server (API compatible con OpenAI), LM Studio y llama-cpp-python.

## Casos de uso

- Análisis de imágenes técnicas: un ingeniero puede subir un diagrama de arquitectura de red y pedir al modelo que lo explique o detecte posibles cuellos de botella, gracias al proyector de visión y al razonamiento estructurado.
- Asistente de documentación con contexto largo: procesar manuales de producto o especificaciones de API de más de 100 000 tokens, manteniendo el hilo de la conversación sin perder detalles.
- Generación de código con explicación: aunque no se documenta explícitamente tool calling, el modelo puede generar fragmentos de código y explicarlos paso a paso, útil para tutorías de programación.
- Resumen de actas o informes extensos: con 262k tokens de contexto, se pueden resumir documentos de decenas de páginas en una sola pasada.
- Chatbot de atención al cliente en inglés: el formato de instrucciones y la capacidad de razonamiento permiten respuestas coherentes y matizadas en interacciones multi-turno.
- Despliegue en entornos con recursos limitados: al requerir solo ~10 GB de VRAM, puede ejecutarse en GPUs de consumo como RTX 4070 o incluso en CPU, lo que facilita prototipado y pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización MXFP4 en la información disponible. El modelo base `google/gemma-4-12B-it` cuenta con resultados en el informe técnico de Gemma 4 (arXiv:2607.02770), pero no se han incluido en esta ficha. Se recomienda consultar dicho informe para datos de MMLU, HumanEval, GSM8K u otras métricas del modelo sin cuantizar.

## Requisitos de hardware

- VRAM mínima: ~10 GB para el modelo completo (6,2 GB de pesos + ~2,5 GB de caché KV a 8192 tokens de contexto).
- GPUs recomendadas: RTX 5060 Ti 16 GB (~45 tok/s), RTX 4070 12 GB (~40 tok/s), según la model card.
- Compatible con CPU: con 6 o más núcleos y ~7 GB de RAM, se obtienen 5-8 tok/s.
- Opciones de despliegue: llama.cpp (CLI y servidor), LM Studio, llama-cpp-python, o cualquier framework compatible con GGUF.
- Latencia y throughput: los valores estimados de la model card indican ~45 tok/s en RTX 5060 Ti y ~40 tok/s en RTX 4070; en CPU, 5-8 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 12B It (base) | 11,9B | 262 144 | Apache 2.0 | safetensors | Modelo original sin cuantizar, requiere ~24 GB en F16 |
| Gemma-4-12B-it-MXFP4-GGUF (este) | 11,9B | 262 144 | Apache 2.0 | GGUF (MXFP4) | Cuantización 4,45 BPW, ~6,2 GB, portable a CPU/AMD/NVIDIA |
| Llama 3.1 8B Instruct | 8,03B | 131 072 | Llama 3.1 License | safetensors / GGUF | Alternativa de 8B con licencia permisiva, pero sin visión nativa |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a características técnicas. La ventaja principal de la versión MXFP4 es su portabilidad universal y su tamaño reducido frente al modelo base.

## Limitaciones y advertencias

- La cuantización MXFP4 puede presentar una ligera pérdida de calidad frente a cuantizaciones como Q4_K_M, aunque no se han publicado métricas comparativas en esta documentación.
- La model card solo declara soporte para inglés, aunque el modelo base es multilingüe; el rendimiento en otros idiomas no está garantizado en esta versión.
- El modelo puede alucinar o generar información incorrecta, especialmente en tareas de razonamiento complejo o con imágenes ambiguas.
- No se documenta soporte explícito para tool calling o function calling en esta cuantización, aunque el modelo base podría tenerlo; se recomienda verificar antes de usarlo en pipelines de agentes.
- El archivo `mmproj` (proyector de visión) es necesario para entrada de imágenes; sin él, el modelo solo funciona en modo texto.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir correctamente el origen del modelo y cumplir con los términos de Google para Gemma 4.
- El contexto de 262k tokens es teórico; en la práctica, el rendimiento puede degradarse con secuencias muy largas y el uso de memoria aumenta considerablemente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FreedomAISVR/Gemma-4-12B-it-MXFP4-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Informe técnico de Gemma 4 (arXiv): https://arxiv.org/pdf/2607.02770
- Página oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 en Google AI: https://ai.google.dev/gemma/docs/core/model_card_4
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
