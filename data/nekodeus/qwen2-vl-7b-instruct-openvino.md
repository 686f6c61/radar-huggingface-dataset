# Nekodeus/qwen2-vl-7b-instruct-openvino

## Resumen
Este repositorio contiene una conversión a OpenVINO IR del modelo Qwen2-VL-7B-Instruct, un modelo multimodal de Qwen que acepta imagen y texto y genera texto. La conversión la firma Nekodeus, no el equipo de Qwen, y aplica cuantización weight-only INT8 con NNCF sobre el modelo base de 8,3 mil millones de parámetros y licencia Apache-2.0. El resultado está pensado para inferencia en CPU con OpenVINO y optimum-intel.

El modelo base combina un codificador visual, un módulo de fusión, embeddings de texto y un modelo de lenguaje, y conserva el contexto de 32.000 tokens, la codificación visual de resolución dinámica y la comprensión de vídeo que declara la model card. La relevancia práctica está en desplegar un VLM de 7B en entornos Intel sin GPU dedicada, a cambio de un formato menos universal que safetensors o GGUF y de una cuantización que no viene acompañada de benchmarks publicados.

El repositorio tiene 8,3 GB, 0 descargas y 0 likes en el momento de la consulta, y no aporta resultados de evaluación, lista de idiomas ni detalles de entrenamiento. Es un artefacto de conversión, no un modelo nuevo.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen2VLForConditionalGeneration: codificador visual, merger, embeddings de texto y modelo de lenguaje, según la model card |
| Parámetros totales | 8,3 mil millones, correspondientes al modelo base |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantización | INT8 weight-only con NNCF; activaciones FP16/FP32 según el trazado; no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (.xml/.bin); no safetensors ni GGUF |
| Tamaño del repositorio | 8,3 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento
Según la model card, es una conversión de `Qwen/Qwen2-VL-7B-Instruct`, instanciado como `Qwen2VLForConditionalGeneration`. La arquitectura es multimodal: codificador de visión, merger, embeddings de texto y modelo de lenguaje; soporta codificación visual de resolución dinámica y comprensión de vídeo. No se detallan el número de capas, el tipo de atención ni si incorpora mecanismos de atención lineal.

No hay información sobre tokens de entrenamiento, composición del dataset, RLHF/DPO ni proceso de alineación. Solo se indica que el modelo base es la variante Instruct y que la conversión se realizó con `optimum-cli`, `optimum-intel 2.2.0`, `openvino 2026.4.1` y `transformers 5.16.1`, omitiendo el límite `MAX_TRANSFORMERS_VERSION`. La cuantización es weight-only INT8 con NNCF; no se documenta calibración ni evaluación de la degradación frente al modelo original.

## Capacidades
- Generación de texto a partir de imagen y texto mediante el pipeline `image-text-to-text`.
- Interacción conversacional multimodal: el modelo recibe una o varias entradas visuales junto con instrucciones en lenguaje natural.
- Descripción y análisis de imágenes con codificación visual de resolución dinámica, según la model card.
- Comprensión de vídeo, capacidad declarada explícitamente en la información del repositorio.
- Ventana de contexto de 32.000 tokens, útil para instrucciones largas o conversaciones extensas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso, modo thinking, audio, código o matemáticas.
- No se proporciona una lista verificable de idiomas soportados.

## Casos de uso
- Descripción automática de imágenes para accesibilidad: el modelo puede generar texto alternativo a partir de una fotografía y un prompt de control; es adecuado por su pipeline imagen-texto, aunque requiere revisión humana por riesgo de errores en detalles.
- Preguntas y respuestas sobre capturas y documentos visuales: permite formular preguntas en lenguaje natural sobre una imagen y mantener contexto largo gracias a los 32.000 tokens; conviene validar su precisión en texto pequeño y tablas.
- Análisis y resumen de vídeo: la model card declara comprensión de vídeo, por lo que puede emplearse para describir escenas o extraer eventos concretos con instrucciones textuales.
- Asistente multimodal en CPU: puede desplegarse con OpenVINO GenAI en equipos Intel sin GPU dedicada, lo que reduce costes de infraestructura para prototipos y aplicaciones internas.
- Anotación asistida de datasets: útil para generar descripciones o etiquetas candidatas sobre imágenes que después revisa un humano, acelerando la creación de datos supervisados.
- Generación de descripciones de producto en comercio electrónico: a partir de fotografías de artículos y una plantilla de texto, puede producir borradores de fichas; necesita control de calidad para evitar atributos inventados.
- Revisión visual en entornos industriales: puede recibir una imagen de una pieza o entorno y responder preguntas de inspección; es adecuado solo como apoyo no crítico y con validación humana.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| MMMU | no disponible |
| DocVQA | no disponible |

## Requisitos de hardware
- Pesos INT8: aproximadamente 8,3 GB, según el tamaño del repositorio. Es una referencia de almacenamiento, no una medición de VRAM.
- VRAM estimada: no disponible. Para GPU hay que sumar a los pesos el codificador visual, las activaciones y la caché KV; con contexto de 32.000 tokens el consumo puede ser notablemente superior.
- GPU consumer: no hay validación publicada. Un GPU con 12-16 GB podría ser un punto de partida para secuencias cortas, pero no está confirmado en la información disponible.
- CPU: opción documentada. La conversión se realizó en un entorno CPU-only y la model card incluye `ov::genai::VLMPipeline` con dispositivo `"CPU"`.
- GPU recomendadas: no disponibles. No se aportan pruebas con A100, H100, RTX 4090 ni GPU Intel.
- Despliegue: `optimum-intel` con `OVModelForVisualCausalLM` y OpenVINO GenAI con `VLMPipeline`. No consta soporte nativo en vLLM, llama.cpp, Ollama o TGI para este formato OpenVINO IR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No hay datos de rendimiento publicados para establecer una comparación cuantitativa. La comparación queda limitada a especificaciones y formato.

| Modelo | Parámetros | Contexto | Formato y cuantización | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Este repositorio | 8,3B | 32k | OpenVINO IR INT8 | Apache-2.0 | HuggingFace, 0 descargas y 0 likes |
| Qwen2-VL-7B-Instruct original | 8,3B | 32k | Pesos originales de HuggingFace; cuantización no detallada en la información | Apache-2.0 | HuggingFace, repo oficial de Qwen |
| Otras conversiones de Qwen2-VL-7B a GGUF, OpenVINO u otros formatos | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias
- Es una conversión de terceros, no un artefacto oficial del equipo de Qwen.
- La cuantización INT8 weight-only no incluye evaluación de degradación frente al modelo base; puede perder precisión en texto pequeño, OCR o detalles finos.
- No hay benchmarks, lista de idiomas ni datos de entrenamiento verificables en la información proporcionada.
- El formato OpenVINO IR limita la portabilidad frente a safetensors, GGUF u otros formatos habituales.
- El contexto de 32.000 tokens no está validado en este repositorio y puede exigir mucha memoria en secuencias largas.
- Persiste el riesgo de alucinación y sesgos del modelo base; no se documenta una evaluación de seguridad o sesgos específica para esta conversión.
- La licencia Apache-2.0 permite uso comercial, pero deben revisarse los términos del modelo base y de las dependencias utilizadas; no hay garantías de calidad.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validación comunitaria significativa.
- No se documenta soporte de tool calling, function calling, agentes, audio ni modo thinking.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/Nekodeus/qwen2-vl-7b-instruct-openvino
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-7B-Instruct
- No se han proporcionado papers, blogs, repositorios adicionales o demos en la información disponible.
