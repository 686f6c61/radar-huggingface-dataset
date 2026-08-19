# Felldude/Qwen3-VL-8B-Instruct-Uncensored-INT8CONVROT

## Resumen

Felldude/Qwen3-VL-8B-Instruct-Uncensored-INT8CONVROT es una variante no oficial del modelo multimodal Qwen3-VL-8B-Instruct, publicada por el usuario Felldude en Hugging Face. Se presenta como una versión "uncensored" (sin censura) y cuantizada en INT8, con el sufijo "CONVROT" que sugiere una conversión o rotación de pesos, aunque no se especifica la técnica exacta. El repositorio tiene un tamaño de 12,5 GB y la licencia declarada es Apache 2.0, lo que permite uso comercial y modificación.

El modelo base, Qwen3-VL-8B-Instruct, es un modelo de visión-lenguaje desarrollado por Alibaba Qwen, con 8 mil millones de parámetros, arquitectura transformer densa y capacidad de procesar imágenes, vídeo y texto. Esta variante busca ofrecer una alternativa sin restricciones de contenido, aunque no se aportan detalles sobre el proceso de entrenamiento o los datos utilizados para eliminar la censura. La relevancia de esta ficha radica en que, a pesar de la escasa documentación, el modelo puede ser de interés para desarrolladores que necesiten un modelo multimodal de tamaño medio con licencia permisiva y sin filtros de contenido, siempre asumiendo los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-VL-8B-Instruct, sin confirmar detalles de la variante) |
| Parametros totales | 8B (según nombre del modelo, no confirmado en la documentación) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-VL soporta hasta 128k tokens, pero no se confirma para esta variante) |
| Tipos de cuantizacion | INT8 (según el nombre, no se detalla el esquema exacto) |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, pero no se especifica para esta variante) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, pero no se indica en la model card) |

## Arquitectura y entrenamiento

La información disponible sobre esta variante es extremadamente limitada. La model card solo contiene la licencia y no describe el proceso de entrenamiento, los datos utilizados ni las modificaciones técnicas aplicadas respecto al modelo base. El sufijo "INT8CONVROT" sugiere una cuantización a 8 bits con alguna técnica de conversión o rotación de pesos, pero no se aportan detalles adicionales.

El modelo base Qwen3-VL-8B-Instruct, desarrollado por Alibaba, emplea una arquitectura transformer densa con atención multimodal, capaz de procesar imágenes, vídeo y texto. Se entrenó con una combinación de datos de texto e imagen de alta calidad, y posteriormente se afinó con instrucciones y preferencias humanas. Sin embargo, no se puede confirmar si esta variante "uncensored" mantiene esas características o si se ha sometido a un entrenamiento adicional para eliminar la alineación de seguridad.

## Capacidades

Dado que no hay documentación específica de esta variante, las capacidades se infieren del modelo base Qwen3-VL-8B-Instruct, que es multimodal:

- Generación de texto y razonamiento: el modelo base es competente en tareas de lenguaje natural, incluyendo razonamiento lógico y matemático.
- Comprensión de imágenes: puede responder preguntas sobre imágenes, realizar OCR, describir escenas y responder a consultas visuales.
- Comprensión de vídeo: el modelo base soporta entrada de vídeo y puede analizar secuencias temporales.
- Capacidades multilingües: el modelo base maneja múltiples idiomas, aunque no se especifica cuáles para esta variante.
- Soporte de tool calling y agentes: el modelo base Qwen3-VL incluye capacidades de llamada a herramientas y razonamiento multi-paso, pero no se confirma en esta variante.
- Modo "uncensored": se espera que no aplique filtros de contenido, pero no hay evidencia de cómo se ha logrado ni de su efectividad.

## Casos de uso

Aunque no hay documentación oficial, los casos de uso plausibles para esta variante son los siguientes:

- Análisis de imágenes en entornos de investigación: investigadores que necesitan procesar imágenes sin restricciones de contenido (por ejemplo, análisis de datos médicos o científicos) pueden utilizar este modelo para extraer información visual sin filtros.
- Generación de descripciones creativas: para proyectos de arte o narrativa que requieran descripciones de imágenes sin limitaciones temáticas.
- Desarrollo de asistentes multimodales personalizados: desarrolladores que quieran integrar un modelo de visión-lenguaje en aplicaciones con control total sobre el comportamiento y sin censura predefinida.
- Automatización de tareas de OCR en documentos variados: el modelo puede extraer texto de imágenes, útil para digitalización de archivos con contenido diverso.
- Prototipado rápido de aplicaciones de visión por computador: al ser de 8B parámetros y cuantizado en INT8, puede ejecutarse en GPUs de consumo medio, facilitando pruebas locales.
- Evaluación comparativa de modelos "uncensored": para investigadores que estudian el impacto de la alineación en el rendimiento, este modelo sirve como punto de comparación con versiones censuradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para esta variante específica. Tampoco se han encontrado comparaciones con el modelo base o con otros modelos similares.

## Requisitos de hardware

Dado el tamaño del repositorio (12,5 GB) y la cuantización INT8, se puede estimar que el modelo requiere aproximadamente 8-10 GB de VRAM para inferencia en precisión INT8. Sin embargo, estos son cálculos orientativos, no confirmados por el autor.

- VRAM estimada: entre 8 y 12 GB para inferencia con cuantización INT8 (estimación basada en el tamaño del archivo y la arquitectura de 8B).
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM, como RTX 3060 12GB, RTX 4070, RTX 4080, o GPUs de datacenter como A10 o A100 (si se requiere mayor velocidad).
- Compatibilidad con GPU de consumo: sí, es probable que funcione en GPUs de gama media con 12 GB o más, pero no se ha verificado.
- Opciones de despliegue: al ser un modelo de Hugging Face, se puede cargar con Transformers, vLLM, o convertir a GGUF para llama.cpp/Ollama, aunque no se ha confirmado la compatibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. La variante se basa en Qwen3-VL-8B-Instruct, que compite con otros modelos multimodales de tamaño similar como LLaVA-NeXT-8B, Phi-3-vision (4.2B) o InternVL2-8B. Sin embargo, al no tener datos de rendimiento de esta variante específica, cualquier comparación sería especulativa. Se recomienda consultar los benchmarks del modelo base Qwen3-VL-8B-Instruct para una referencia aproximada.

## Limitaciones y advertencias

- Falta de documentación: la model card no proporciona información sobre el proceso de creación, los datos de entrenamiento ni las modificaciones realizadas, lo que dificulta evaluar su fiabilidad.
- Riesgo de contenido inapropiado: al ser "uncensored", el modelo puede generar contenido ofensivo, ilegal o dañino sin restricciones, lo que supone un riesgo en entornos de producción.
- Posible degradación de rendimiento: la cuantización INT8 puede afectar a la precisión en tareas complejas, aunque no se ha medido.
- Sin garantías de alineación: no se sabe si el modelo mantiene las capacidades de razonamiento y seguridad del modelo base; la eliminación de censura podría haber afectado a otras habilidades.
- Licencia Apache 2.0: permite uso comercial, pero no hay garantía de que los pesos originales de Qwen cumplan con los términos de uso de Alibaba (aunque Qwen3-VL es de código abierto, se debe verificar la licencia del modelo base).
- Actualización reciente: el modelo se creó en agosto de 2026, lo que sugiere que es muy reciente y no ha sido ampliamente probado (0 descargas, 0 likes).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Felldude/Qwen3-VL-8B-Instruct-Uncensored-INT8CONVROT
- Repositorio base de Qwen3-VL (GitHub): https://github.com/QwenLM/Qwen3-VL
- Página del modelo base en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-VL-8B-Instruct
- Discusión en Civitai sobre modelos Qwen3-VL uncensored: https://civitai.com/models/2200639/qwen-3-vl-node-for-comfyui-qwen-3-vl-heretic-uncensored-model
