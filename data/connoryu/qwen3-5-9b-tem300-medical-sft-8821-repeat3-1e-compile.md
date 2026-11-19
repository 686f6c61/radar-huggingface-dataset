# ConnorYU/Qwen3.5-9B-tem300-Medical-SFT-8821-repeat3-1e-compile

## Resumen

El modelo `ConnorYU/Qwen3.5-9B-tem300-Medical-SFT-8821-repeat3-1e-compile` es un ajuste fino (fine-tuning supervisado) del modelo base `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300`, publicado por el usuario ConnorYU en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la familia Qwen 3.5, con aproximadamente 9.400 millones de parámetros y un tamaño de repositorio de 18,8 GB en formato safetensors. El nombre del modelo sugiere un entrenamiento orientado al dominio médico con parámetros de muestreo específicos (temperatura 300, repetición 3) y compilación optimizada.

La relevancia de esta ficha es limitada en términos de información pública: el modelo cuenta con 0 descargas y 0 "likes" en el momento de la consulta, y la model card no incluye detalles sobre el dataset de entrenamiento, los hiperparámetros, los resultados de evaluación ni las capacidades específicas más allá de las etiquetas de Hugging Face. El autor indica que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que sugiere un proceso de fine-tuning eficiente en memoria.

Al estar construido sobre Qwen 3.5, se espera que herede las capacidades multimodales y de razonamiento de esa familia, pero no se dispone de documentación que confirme el alcance real de dichas capacidades tras el ajuste fino. Esta ficha se limita a los datos verificables disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen 3.5 |
| Parámetros totales | 9.409.813.744 (9,41 B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; compatible con cuantización estándar vía transformers) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen 3.5, un transformer multimodal capaz de procesar entradas de imagen y texto (pipeline image-text-to-text). El modelo base declarado es `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300`, lo que sugiere que el autor aplicó previamente un entrenamiento con GRPO (Group Relative Policy Optimization) orientado a seguir instrucciones (ifeval) y con modo "think" (razonamiento extendido), y posteriormente un ajuste fino supervisado (SFT) sobre datos médicos.

El entrenamiento de este ajuste se realizó con Unsloth y la librería TRL, según la model card, lo que indica un proceso de fine-tuning optimizado para velocidad y uso de memoria. No se especifican el número de tokens de entrenamiento, la composición del dataset médico, ni si hubo etapas adicionales de RLHF o DPO tras el SFT. Tampoco se documentan innovaciones técnicas específicas más allá del uso de las herramientas mencionadas.

## Capacidades

- Generación de texto conversacional en inglés (etiqueta `conversational`).
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text`), presumiblemente heredado del modelo base Qwen 3.5.
- Razonamiento en modo "think" (inferido del nombre del modelo base, no confirmado en la model card).
- Seguimiento de instrucciones (heredado del ajuste ifeval del modelo base).
- Especialización potencial en dominio médico (sugerido por el nombre del modelo, no documentado).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: solo se declara inglés.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistencia en documentación clínica: el modelo podría emplearse para resumir o estructurar notas médicas en inglés, aprovechando su ajuste fino sobre datos del dominio, aunque no hay evidencia publicada de su calidad en esta tarea.
- Procesamiento de imágenes médicas con texto asociado: al ser un modelo image-text-to-text, podría utilizarse para generar descripciones textuales a partir de imágenes junto con contexto, si bien no se confirma el tipo de imágenes vistas durante el entrenamiento.
- Prototipado de chatbots de orientación sanitaria en inglés: adecuado para entornos de investigación donde se requiera un modelo pequeño (9,4 B) con licencia permisiva y capacidad conversacional.
- Evaluación comparativa de ajustes finos: útil como punto de partida para investigadores que estudien el efecto del SFT médico sobre un modelo base con GRPO.
- Experimentación con razonamiento extendido: el modo "think" heredado del modelo base permite probar cadenas de razonamiento en tareas clínicas o de triaje, siempre con supervisión humana.
- Despliegue en entornos con recursos moderados: con 9,4 B de parámetros y licencia Apache 2.0, puede ejecutarse en una GPU de gama alta consumer para pruebas internas, sin garantías de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 9,4 B en safetensors (FP16/BF16), se requerirían aproximadamente 18-19 GB de VRAM; en cuantización de 8 bits, en torno a 10-11 GB; en 4 bits, alrededor de 6-7 GB. Estas cifras son estimaciones genéricas y no están confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría en A100, H100, L40S o RTX 4090 (24 GB) en FP16.
- ¿Cabe en GPU consumer? Probablemente sí en RTX 4090 (24 GB) en FP16, y en GPUs de 12-16 GB con cuantización, aunque no está verificado.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta), y presumiblemente vLLM, llama.cpp u Ollama mediante conversión a GGUF, si bien no se documenta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-tem300-Medical-SFT-8821-repeat3-1e-compile | 9,41 B | No disponible | Apache 2.0 | Sí (image-text-to-text) | Hugging Face, 0 descargas |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300 (modelo base) | No disponible | No disponible | No disponible | Probablemente sí | Hugging Face |
| Qwen 3.5 9B (modelo original de referencia) | ~9 B | No disponible | No disponible | Sí | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy escasa: la model card no documenta dataset, hiperparámetros, evaluación ni limitaciones, lo que impide validar su calidad o seguridad.
- Sesgos conocidos: no documentados; al ser un ajuste fino sobre datos no especificados, podría heredar sesgos del modelo base y del corpus médico empleado.
- Riesgo de alucinación: no evaluado. En dominio médico, cualquier uso sin supervisión humana es desaconsejable.
- Limitaciones de idioma: solo se declara inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Limitaciones de contexto: la longitud de contexto no está indicada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no aporta garantías ni documentación sobre el origen de los datos de entrenamiento, lo que puede plantear dudas de cumplimiento en producción.
- Caveat para producción: con 0 descargas y 0 "likes", el modelo no ha sido validado por la comunidad; no se recomienda su uso en entornos clínicos reales sin una evaluación independiente exhaustiva.
- El nombre del modelo sugiere parámetros de muestreo concretos (temperatura 300, repetición 3) que no están explicados ni justificados en la documentación.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem300-Medical-SFT-8821-repeat3-1e-compile
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
