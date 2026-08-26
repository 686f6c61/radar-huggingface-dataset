# cbert33/Huihui-Qwen3.8-27B-abliterated-FP8-Calibrated

## Resumen

El modelo cbert33/Huihui-Qwen3.8-27B-abliterated-FP8-Calibrated es una cuantización FP8 calibrada del checkpoint abliterado huihui-ai/Huihui-Qwen3.8-27B-abliterated, que a su vez deriva del modelo Qwen3.8-27B de Qwen. El autor, cbert33, ha aplicado una cuantización FP8 (E4M3) con escalas estáticas para pesos y dinámicas para activaciones, además de calibrar las escalas de la caché KV. El resultado es un repositorio de 36,8 GB que conserva la funcionalidad multimodal (image-text-to-text) y el soporte de decodificación especulativa (MTP) del modelo original.

Este checkpoint está orientado a desarrolladores e investigadores que necesitan una versión cuantizada del modelo abliterado, con un equilibrio entre tamaño y fidelidad. Al estar basado en Qwen3.8, hereda capacidades de razonamiento, generación de código y comprensión bilingüe (inglés y chino). La cuantización FP8 reduce los requisitos de memoria frente al BF16 original, manteniendo en BF16 los módulos críticos como visión, atención lineal, embeddings y cabeza de lenguaje.

La relevancia actual radica en la demanda de modelos "uncensored" para investigación en alineación y seguridad, así como en la necesidad de cuantizaciones eficientes para desplegar modelos de 27B en hardware asequible. No obstante, el propio autor advierte que es un modelo de investigación, no apto para producción, y que el usuario asume toda la responsabilidad sobre su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atención lineal y MTP (Multi-Token Prediction) |
| Parametros totales | 27.782.096.690 (~27,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3) para pesos y activaciones; BF16 para módulos protegidos (visión, atención lineal, embeddings, cabeza LM, normalización, MTP) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards) + kv_cache_scales.safetensors + protected_bf16_restore.safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización FP8 del checkpoint abliterado de huihui-ai, que a su vez deriva de Qwen3.8-27B. La cuantización utiliza la librería compressed-tensors (versión 0.18.0) con formato float-quantized. Los pesos lineales se cuantizan a FP8 simétrico (F8_E4M3) con bloques estáticos de 128×128, mientras que las activaciones de entrada usan FP8 dinámico simétrico con grupo de 128. El proceso de calibración empleó 512 muestras con una longitud máxima de secuencia de 2048 tokens y un observador memoryless min-max.

Se cuantizaron 256 tensores de pesos lineales. Las escalas de la caché KV se calibraron estáticamente por tensor para 34 tensores de escala (32 del modelo principal y 2 del MTP). Los módulos de visión, atención lineal, embeddings de tokens, cabeza de lenguaje, tensores de normalización y tensores MTP se mantienen en BF16. Se verificó que 943 tensores BF16 protegidos son bit-idénticos al checkpoint fuente. El MTP se preserva como un checkpoint BF16 separado.

El modelo base (huihui-ai) fue creado mediante abliteration, una técnica que elimina los rechazos del modelo original. En la versión actual, solo las capas 18 a 51 han sido abladas, mientras que las primeras 15 se mantienen intactas para conservar el rendimiento. El MTP y los módulos visuales no fueron modificados. No se dispone de información sobre el entrenamiento original de Qwen3.8-27B (datos, tokens, RLHF, etc.) en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.8, hereda capacidades de razonamiento complejo, matemáticas y comprensión lectora (no se proporcionan benchmarks específicos).
- Generación de código: Qwen3.8 es conocido por su rendimiento en tareas de programación, aunque no se aportan datos concretos en esta ficha.
- Multimodal: el pipeline es image-text-to-text, por lo que puede procesar imágenes y texto (los módulos de visión se conservan en BF16).
- Conversación multilingüe: soporta inglés y chino.
- Decodificación especulativa: el MTP (Multi-Token Prediction) se preserva, lo que permite acelerar la inferencia.
- Comportamiento "uncensored": la abliteration reduce la tendencia a rechazar solicitudes, lo que puede ser útil para investigación en alineación, pero también implica riesgos.
- Tool calling / function calling: no se menciona explícitamente en la información disponible, por lo que se considera no disponible.
- Capacidades de agente: no se menciona, no disponible.

## Casos de uso

- Investigación en alineación y seguridad de IA: el modelo abliterado permite estudiar cómo los modelos manejan solicitudes controvertidas y cómo la abliteration afecta al comportamiento. Los investigadores pueden comparar las respuestas con el modelo original para evaluar el impacto de la técnica.
- Generación de contenido creativo sin restricciones: escritores y creadores pueden usar el modelo para explorar narrativas que los modelos alineados podrían rechazar, siempre que el contenido sea legal y ético.
- Desarrollo de asistentes conversacionales en chino e inglés: gracias a su soporte bilingüe y su capacidad multimodal, puede integrarse en prototipos de asistentes que manejen texto e imágenes.
- Análisis de imágenes con descripción generativa: al ser image-text-to-text, puede utilizarse para generar descripciones de imágenes, aunque no se especifican detalles de rendimiento en visión.
- Evaluación de cuantizaciones FP8: este checkpoint sirve como referencia para medir el impacto de la cuantización FP8 en un modelo de 27B, comparando con la versión BF16 o con otras cuantizaciones (por ejemplo, NVFP4).
- Pruebas de decodificación especulativa: el MTP preservado permite experimentar con técnicas de aceleración de inferencia en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) para esta cuantización específica. Se recomienda consultar la ficha del modelo base Qwen3.8-27B para obtener referencias del rendimiento original, aunque no se incluyen aquí.

## Requisitos de hardware

- El tamaño del repositorio es de 36,8 GB, que incluye los pesos FP8, las escalas de KV cache y los tensores de restauración BF16. Para inferencia, se estima que los pesos FP8 ocupan aproximadamente 27,8 GB (27,8B parámetros × 1 byte por parámetro), más overhead de activaciones y caché KV.
- Se recomienda una GPU con al menos 32-40 GB de VRAM para ejecutar el modelo completo en FP8, como una A100 (40 GB) o una H100 (80 GB). También es posible usar dos GPUs de 24 GB (por ejemplo, RTX 4090) con tensor parallelism.
- En consumer GPUs, una RTX 4090 (24 GB) no es suficiente para el modelo completo en FP8; se necesitaría cuantización adicional (por ejemplo, la versión NVFP4 de 20 GB que cabe en dos GPUs de 16 GB, según el repo de sakamakismile).
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI (Text Generation Inference) o llama.cpp (si se convierte a GGUF). También es compatible con Ollama, como indica la model card del modelo base.
- Latencia y throughput: no se proporcionan datos específicos. Dependerá del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| cbert33/Huihui-Qwen3.8-27B-abliterated-FP8-Calibrated | 27,8B | FP8 (E4M3) | no disponible | Apache-2.0 | Cuantización calibrada con KV cache FP8 |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27,8B | BF16 (original) | no disponible | Apache-2.0 | Modelo base abliterado |
| sakamakismile/Huihui-Qwen3.8-27B-abliterated-NVFP4 | 27,8B | NVFP4 (W4A4, group 16) | no disponible | Apache-2.0 | Cuantización más agresiva, 20 GB, MTP en BF16 |

No se dispone de datos de rendimiento comparativo entre estas versiones. La elección entre FP8 y NVFP4 dependerá del equilibrio entre tamaño y fidelidad.

## Limitaciones y advertencias

- Modelo abliterado: la abliteration reduce los rechazos, pero también puede eliminar salvaguardas importantes. El modelo puede generar contenido dañino, ilegal o poco ético. No debe utilizarse en producción sin medidas de seguridad adicionales.
- Riesgo de alucinación: como cualquier LLM, puede inventar información. La cuantización FP8 puede introducir ligeras degradaciones en la precisión, aunque los módulos críticos se mantienen en BF16.
- Idiomas limitados: solo inglés y chino. No soporta otros idiomas de forma nativa.
- Contexto: no se especifica la longitud de contexto, por lo que se desconoce si mantiene la ventana del modelo original (probablemente 128K o similar, pero no confirmado).
- Licencia: Apache-2.0 permite uso comercial, pero el autor declara que el modelo es solo para investigación y no para producción. El usuario asume toda la responsabilidad.
- Dependencia de compressed-tensors: el formato de cuantización requiere la versión 0.18.0 de la librería, lo que puede limitar la compatibilidad con algunos backends.
- Fecha de creación: el modelo fue creado el 2026-08-26, lo que puede indicar que es una versión reciente (o un error en la fecha).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cbert33/Huihui-Qwen3.8-27B-abliterated-FP8-Calibrated
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Cuantización NVFP4 alternativa: https://huggingface.co/sakamakismile/Huihui-Qwen3.8-27B-abliterated-NVFP4
- Página en Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- Mirror en GitHub: https://github.com/Ahaa43443/huihui-qwen3.8-27b-abliterated-mirror/blob/main/README.md
- LLM Explorer: https://llm-explorer.com/model/huihui-ai%2FHuihui-Qwen3.8-27B-abliterated,7yiXfSP5itojtujYtkbmXj
