# edp1096/Huihui-gemma-4-E2B-it-abliterated-litert-lm

## Resumen

Este modelo es una conversión a LiteRT-LM del modelo `huihui-ai/Huihui-gemma-4-E2B-it-abliterated`, una variante sin censura del Gemma 4 2B de Google, creada mediante técnicas de abliteration que eliminan los mecanismos de rechazo del modelo original. La conversión ha sido realizada por el usuario edp1096 y está optimizada para inferencia en dispositivos ARM64, con cuantización INT8 tanto para texto como para visión, e incluye un encoder de visión de Gemma 4 y un adaptador visual. El bundle resultante ocupa aproximadamente 4,9 GiB y está pensado para ejecutarse con la librería `litert-lm`, ya sea mediante CLI o a través de una API compatible con OpenAI.

La relevancia de este modelo radica en que permite desplegar un modelo multimodal de 2 mil millones de parámetros con comportamiento de rechazo reducido en entornos de borde (edge), como teléfonos móviles o dispositivos ARM64, sin necesidad de emulación x86. Al estar basado en Gemma 4, hereda capacidades de razonamiento, generación de código y comprensión de imágenes, aunque con las advertencias propias de un modelo abliterado. Es una opción interesante para desarrolladores que buscan un modelo ligero, multimodal y sin restricciones de seguridad por defecto, siempre que asuman la responsabilidad de su uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), no se especifica si es densa o MoE |
| Parametros totales | No disponible (el nombre sugiere 2 mil millones, sin confirmar oficialmente) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (la conversión usa KV cache de 4096 tokens) |
| Tipos de cuantizacion | INT8 (dynamic_wi8_afp32) para texto y visión |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT-LM (bundle .litertlm) |

## Arquitectura y entrenamiento

El modelo es una conversión a LiteRT-LM del modelo base `huihui-ai/Huihui-gemma-4-E2B-it-abliterated`, que a su vez es una versión abliterada de Gemma 4 2B instruction-tuned de Google. La abliteration es una técnica que modifica los pesos del modelo para eliminar las direcciones de activación asociadas al rechazo de peticiones, reduciendo drásticamente el comportamiento de negativa. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO).

La conversión se realizó nativamente en un sistema Linux ARM64 (NVIDIA DGX Spark) sin emulación x86. Utiliza la tarea LiteRT Torch `image_text_to_image` (aunque el pipeline declarado es `image-text-to-text`), con cuantización dinámica `dynamic_wi8_afp32` para texto y visión. Se definieron firmas de prefill de 128, 256 y 512 tokens, una caché KV de 4096 tokens, y 280 soft tokens para imágenes. El encoder de audio no está incluido. El bundle resultante incluye embedders externos y por capa, así como un encoder de visión de Gemma 4 y un adaptador visual.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Gemma 4 2B, ofrece capacidades de razonamiento y generación de texto, aunque no se han verificado benchmarks específicos en esta conversión.
- Comprensión multimodal: acepta imágenes como entrada y puede generar descripciones o responder preguntas sobre ellas, gracias al encoder de visión incluido.
- Generación de código: Gemma 4 está diseñado para tareas de programación, por lo que se espera que esta variante mantenga dicha capacidad, aunque no hay confirmación explícita en la documentación.
- Comportamiento sin censura: al ser abliterado, el modelo tiene una reducción sustancial de los mecanismos de rechazo, lo que permite generar contenido que el modelo original podría negarse a producir.
- Despliegue en edge: optimizado para ARM64 y cuantización INT8, pensado para ejecutarse en dispositivos con recursos limitados.
- API compatible con OpenAI: la conversión se validó mediante la CLI de LiteRT-LM y su API compatible con OpenAI, lo que facilita su integración en aplicaciones existentes.

## Casos de uso

- Asistente de descripción de imágenes en dispositivos móviles: gracias a su tamaño reducido y cuantización INT8, el modelo puede ejecutarse localmente en un teléfono ARM64 para generar descripciones de fotografías sin conexión a internet, útil para accesibilidad o archivado automático.
- Chatbot conversacional sin restricciones temáticas: al ser abliterado, puede utilizarse en aplicaciones de chat donde se requiere explorar temas sensibles o controvertidos sin que el modelo se niegue a responder, siempre bajo supervisión humana.
- Generación de contenido creativo: escritura de ficción, poesía o guiones con temáticas adultas o transgresoras, donde un modelo con filtros de seguridad estándar podría bloquear peticiones.
- Análisis de imágenes en entornos industriales: el modelo puede procesar imágenes de cámaras de vigilancia o control de calidad en dispositivos edge, generando informes textuales sobre lo que ve, sin depender de servicios en la nube.
- Prototipado rápido de aplicaciones multimodales: al ofrecer una API compatible con OpenAI, los desarrolladores pueden integrar el modelo en pipelines existentes de visión por computadora o chatbots con mínimos cambios de código.
- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio para analizar el impacto de la abliteration en el comportamiento de modelos pequeños, permitiendo comparar respuestas con la versión original de Gemma 4 2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas para esta conversión ni para el modelo base abliterado.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de aproximadamente 2 mil millones de parámetros en INT8, los pesos ocupan unos 2-3 GB. Con la caché KV de 4096 tokens y el encoder de visión, se estima un consumo de VRAM de 4-6 GB para inferencia con contexto corto. Esta es una estimación orientativa, no hay datos oficiales.
- GPU recomendadas: la conversión se realizó en un NVIDIA DGX Spark (ARM64), pero el modelo está pensado para ejecutarse en dispositivos ARM64 con aceleración GPU. En GPUs consumer, una RTX 3060 con 12 GB o superior sería suficiente, aunque no es el objetivo principal.
- Compatibilidad con consumer GPU: sí, cualquier GPU con al menos 6 GB de VRAM debería poder ejecutar el modelo, aunque el formato LiteRT-LM está optimizado para entornos ARM64.
- Opciones de despliegue: la librería `litert-lm` es la vía principal, tanto mediante CLI como a través de su API compatible con OpenAI. No se menciona soporte para vLLM, llama.cpp u Ollama en esta conversión específica.
- Latencia y throughput: no se proporcionan datos. Al ser un modelo pequeño y cuantizado, se espera una latencia baja en dispositivos con aceleración, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. El modelo es una conversión del mismo modelo base `huihui-ai/Huihui-gemma-4-E2B-it-abliterated`, por lo que la comparación directa sería con la versión original en formato Transformers o GGUF. La principal diferencia es el formato de pesos (LiteRT-LM frente a safetensors/GGUF) y la optimización para ARM64. Tampoco se dispone de datos de rendimiento de otros Gemma 4 2B abliterados para contrastar.

## Limitaciones y advertencias

- Comportamiento abliterado: el modelo tiene los mecanismos de rechazo sustancialmente reducidos, por lo que puede generar contenido sensible, controvertido o inapropiado. No ofrece garantías de seguridad por defecto y su uso debe ser supervisado.
- Contexto limitado: la conversión fija una caché KV de 4096 tokens, lo que limita la longitud de las conversaciones o el análisis de documentos largos. El contexto máximo del modelo base no se ha confirmado.
- Sin encoder de audio: a pesar de ser multimodal, no incluye soporte para entrada de audio, solo imagen y texto.
- Idiomas no especificados: no se indica qué idiomas soporta el modelo, aunque al estar basado en Gemma 4 es probable que tenga cobertura multilingüe, pero no está verificado.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento o descripción de imágenes.
- Licencia: aunque el repositorio declara Apache-2.0, la licencia de Gemma 4 tiene términos específicos que deben revisarse en el enlace proporcionado en la model card.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar, por lo que su calidad real en producción es incierta.

## Enlaces

- Repositorio del modelo: https://huggingface.co/edp1096/Huihui-gemma-4-E2B-it-abliterated-litert-lm
- Modelo base: https://huggingface.co/huihui-ai/Huihui-gemma-4-E2B-it-abliterated
- Colección de modelos abliterados de huihui-ai: https://huggingface.co/collections/huihui-ai/gemma-4-abliterated
- Página oficial de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Página del modelo en Ollama (versión original): https://ollama.com/huihui_ai/gemma-4-abliterated
- Ficha del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/huihui-gemma-4-e2b-it-abliterated-huihui-ai
