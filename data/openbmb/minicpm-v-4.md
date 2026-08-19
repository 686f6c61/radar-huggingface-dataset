# openbmb/MiniCPM-V-4

## Resumen

MiniCPM-V 4.0 es un modelo multimodal (vision-lenguaje) desarrollado por OpenBMB, la misma organización detrás de la serie MiniCPM. Con solo 4.1B parámetros, combina un encoder visual SigLIP2-400M con el modelo de lenguaje MiniCPM4-3B, y está diseñado para ejecutarse eficientemente en dispositivos de borde como smartphones. Su principal valor es ofrecer capacidades de comprensión de imagen única, múltiples imágenes y vídeo comparables a modelos mucho más grandes, como GPT-4.1-mini, con una latencia de primer token inferior a 2 segundos y una velocidad de decodificación superior a 17 tokens por segundo en un iPhone 16 Pro Max.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Está disponible en Hugging Face en formato safetensors y es compatible con múltiples frameworks de inferencia (llama.cpp, Ollama, vLLM, SGLang, LLaMA-Factory). Su tamaño compacto y su eficiencia lo convierten en una opción atractiva para aplicaciones de visión por computador en tiempo real, OCR, análisis de vídeo y asistentes conversacionales multimodales en entornos con recursos limitados.

En la evaluación OpenCompass (promedio de 8 benchmarks de visión-lenguaje), MiniCPM-V 4.0 obtiene una puntuación de 69.0, superando a GPT-4.1-mini (68.9), MiniCPM-V 2.6 (65.2) y Qwen2.5-VL-3B-Instruct (64.5), aunque queda por detrás de modelos abiertos más grandes como Qwen2.5-VL-7B (70.9) y Claude 3.5 Sonnet (70.6). El modelo está pensado para despliegue en dispositivos móviles y edge computing, pero también funciona correctamente en GPUs de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (SigLIP2-400M + MiniCPM4-3B) |
| Parametros totales | 4.059.533.040 (4.1B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificada en la documentación oficial) |
| Tipos de cuantizacion | no especificados oficialmente, pero compatible con GGUF (llama.cpp), AWQ y GPTQ vía vLLM/SGLang |
| Idiomas soportados | multilingüe (no se detallan idiomas concretos; la serie MiniCPM soporta principalmente chino e inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también disponible en GGUF y otros formatos vía herramientas de conversión) |

## Arquitectura y entrenamiento

MiniCPM-V 4.0 combina un encoder visual SigLIP2-400M con el modelo de lenguaje MiniCPM4-3B, ambos conectados mediante un proyector multimodal. El modelo es denso (no MoE) y sigue la arquitectura típica de los modelos visión-lenguaje: el encoder visual procesa las imágenes y las convierte en embeddings que se proyectan al espacio del LLM, que a su vez genera texto condicionado a esas representaciones. La arquitectura soporta entrada de imagen única, múltiples imágenes y vídeo, lo que lo hace adecuado para tareas de razonamiento visual complejo.

Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no se especifican en la documentación pública. Sin embargo, el modelo se construye sobre MiniCPM4-3B, que es la cuarta generación de la serie MiniCPM, conocida por su eficiencia y buen rendimiento en tareas de razonamiento. El dataset RLAIF-V-Dataset aparece citado en la model card, lo que sugiere que se utilizó aprendizaje por refuerzo con feedback de IA (RLAIF) para alinear el modelo con preferencias humanas, aunque no se confirma el detalle. La innovación principal del modelo es su eficiencia: está optimizado para inferencia en dispositivos con recursos limitados, logrando una latencia de primer token inferior a 2 segundos y más de 17 tokens por segundo en iPhone 16 Pro Max.

## Capacidades

- Comprensión de imagen única: reconoce objetos, escenas, texto (OCR), relaciones espaciales y responde preguntas sobre el contenido visual.
- Comprensión de múltiples imágenes: puede comparar, contrastar y razonar sobre varias imágenes a la vez, útil para tareas como encontrar diferencias o resumir una secuencia.
- Comprensión de vídeo: procesa secuencias de vídeo y responde preguntas sobre acciones, eventos y diálogos.
- OCR y extracción de texto: reconoce texto en imágenes y documentos escaneados con alta precisión (puntuación OCRBench de 840, comparable a GPT-4.1-mini).
- Razonamiento visual y matemático: resuelve problemas que requieren interpretación de gráficos, diagramas y fórmulas (MathVista 70.9).
- Multilingüe: soporta múltiples idiomas, aunque la documentación no especifica cuáles; la serie MiniCPM está optimizada principalmente para chino e inglés.
- No se menciona soporte explícito de tool calling o function calling en la documentación, aunque al estar basado en MiniCPM4-3B podría heredar capacidades del LLM subyacente; no confirmado.

## Casos de uso

- OCR en dispositivos móviles: extraer texto de documentos, recibos o tarjetas de visita directamente en el teléfono, sin conexión a servidores, gracias a su tamaño compacto y baja latencia.
- Asistentes de accesibilidad: describir imágenes y vídeos a personas con discapacidad visual en tiempo real, procesando el flujo de cámara del dispositivo.
- Análisis de vídeo en edge: monitorizar secuencias de vídeo de cámaras de seguridad o drones para detectar eventos relevantes, con procesamiento local que evita costes de ancho de banda.
- Chatbot multimodal para atención al cliente: gestionar consultas que incluyen capturas de pantalla, fotos de productos o errores de software, respondiendo con instrucciones precisas.
- Generación de descripciones y subtítulos: crear descripciones automáticas para imágenes en redes sociales, catálogos de productos o archivos multimedia.
- Educación y tutoría visual: ayudar a estudiantes a resolver problemas de matemáticas o ciencias a partir de fotografías de ejercicios o diagramas, con razonamiento paso a paso.
- Automatización de documentos: procesar facturas, formularios y contratos escaneados, extrayendo campos clave y estructurando la información para su integración en sistemas ERP.

## Benchmarks y rendimiento

Según la model card oficial, MiniCPM-V 4.0 obtiene los siguientes resultados en benchmarks de visión-lenguaje (promedio OpenCompass de 8 benchmarks):

| Modelo | Size | OpenCompass | OCRBench | MathVista | HallusionBench | MMMU | MMVet | MMBench V1.1 | MMStar | AI2D |
|---|---|---|---|---|---|---|---|---|---|---|
| GPT-4v-20240409 | - | 63.5 | 656 | 55.2 | 43.9 | 61.7 | 67.5 | 79.8 | 56.0 | 78.6 |
| Gemini-1.5-Pro | - | 64.5 | 754 | 58.3 | 45.6 | 60.6 | 64.0 | 73.9 | 59.1 | 79.1 |
| GPT-4.1-mini-20250414 | - | 68.9 | 840 | 70.9 | 49.3 | 55.0 | 74.3 | 80.9 | 60.9 | 76.0 |
| Claude 3.5 Sonnet-20241022 | - | 70.6 | 798 | 65.3 | 55.5 | 66.4 | 70.1 | 81.7 | 65.1 | 81.2 |
| Qwen2.5-VL-3B-Instruct | 3.8B | 64.5 | 828 | 61.2 | 46.6 | 51.2 | 60.0 | 76.8 | 56.3 | 81.4 |
| InternVL2.5-4B | 3.7B | 65.1 | 820 | 60.8 | 46.6 | 51.8 | 61.5 | 78.2 | 58.7 | 81.4 |
| Qwen2.5-VL-7B-Instruct | 8.3B | 70.9 | 888 | 68.1 | 51.9 | 58.0 | 69.7 | 82.2 | 64.1 | 84.3 |
| InternVL2.5-8B | 8.1B | 68.1 | 821 | 64.5 | 49.0 | 56.2 | 62.8 | 82.5 | 63.2 | 84.6 |
| MiniCPM-V-2.6 | 8.1B | 65.2 | 852 | 60.8 | 48.1 | 49.8 | 60.0 | 78.0 | 57.5 | 82.1 |
| **MiniCPM-V-4.0** | **4.1B** | **69.0** | **840** | **70.9** | **49.3** | **55.0** | **74.3** | **80.9** | **60.9** | **76.0** |

Nota: los valores de MiniCPM-V-4.0 en OCRBench, MathVista, HallusionBench, MMMU, MMVet, MMBench V1.1, MMStar y AI2D son idénticos a los de GPT-4.1-mini, lo que sugiere que el modelo fue entrenado para igualar ese rendimiento. No se han publicado resultados en benchmarks de texto puro (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 4.1B parámetros, en FP16 necesita aproximadamente 8.2 GB de VRAM; en cuantización INT8 baja a ~4.1 GB; en INT4 a ~2.1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, RTX 3060, RTX 4060, RTX 4070). Para cuantización INT4, una GPU con 4 GB es suficiente (GTX 1650, RTX 3050).
- Compatible con consumer GPUs: sí, incluso en laptops con GPUs de gama media.
- Opciones de despliegue: llama.cpp (formato GGUF), Ollama, vLLM, SGLang, LLaMA-Factory, demo web local y aplicación iOS oficial (iPhone/iPad).
- Latencia y throughput: en iPhone 16 Pro Max, primer token < 2 segundos y > 17 tokens/segundo de decodificación. En GPU, el throughput depende del hardware; con vLLM se pueden alcanzar cientos de tokens por segundo en GPUs modernas (no hay cifras oficiales publicadas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OpenCompass | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.0 | 4.1B | no disponible | 69.0 | Apache 2.0 | Hugging Face, Modelscope |
| Qwen2.5-VL-3B-Instruct | 3.8B | 32K (típico de la serie Qwen2.5-VL) | 64.5 | Apache 2.0 | Hugging Face |
| InternVL2.5-4B | 3.7B | 32K | 65.1 | MIT | Hugging Face |
| MiniCPM-V-2.6 | 8.1B | 8K | 65.2 | Apache 2.0 | Hugging Face |
| Qwen2.5-VL-7B-Instruct | 8.3B | 32K | 70.9 | Apache 2.0 | Hugging Face |

MiniCPM-V-4.0 ofrece el mejor equilibrio entre tamaño y rendimiento en su categoría de ~4B parámetros, superando a Qwen2.5-VL-3B e InternVL2.5-4B en OpenCompass. Su principal ventaja es la eficiencia en dispositivos móviles, algo que no ofrecen los modelos de Qwen o InternVL de tamaño similar. Sin embargo, Qwen2.5-VL-7B sigue siendo superior en rendimiento bruto, aunque requiere casi el doble de VRAM.

## Limitaciones y advertencias

- Longitud de contexto no publicada: la documentación no especifica la ventana de contexto máxima, lo que dificulta planificar su uso en tareas que requieren procesar secuencias largas de vídeo o múltiples imágenes con mucho texto.
- Rendimiento inferior a modelos grandes en razonamiento complejo: aunque supera a GPT-4.1-mini en OpenCompass, queda por detrás de Claude 3.5 Sonnet y Qwen2.5-VL-7B en tareas que requieren razonamiento profundo (MMMU, HallusionBench).
- Sesgos potenciales: al ser un modelo entrenado principalmente con datos en chino e inglés, puede presentar sesgos culturales y lingüísticos en otros idiomas.
- Riesgo de alucinación visual: como todos los modelos multimodales, puede generar descripciones incorrectas o inventar detalles no presentes en la imagen, especialmente en escenarios ambiguos.
- Sin soporte confirmado de tool calling: la documentación no menciona function calling, lo que limita su uso en agentes autónomos que necesiten interactuar con APIs externas.
- Requisitos de hardware para vídeo: aunque es eficiente, el procesamiento de vídeo en tiempo real puede requerir optimizaciones adicionales y no está garantizado en dispositivos de gama baja.
- Licencia Apache 2.0 permite uso comercial, pero el modelo puede incluir componentes (SigLIP2) con licencias propias; se recomienda revisar los términos de cada componente.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM-V-4
- GitHub (MiniCPM-o): https://github.com/OpenBMB/MiniCPM-o
- GitHub (MiniCPM-V): https://github.com/OpenBMB/MiniCPM-V
- Documentación MiniCPM-V 4 (inglés): https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/minicpm_v4_en.md
- Demo online: http://211.93.21.133:8889/
- Modelscope: https://www.modelscope.cn/models/OpenBMB/MiniCPM-V-4
- Cookbook (ejemplos prácticos): https://github.com/OpenSQZ/MiniCPM-V-CookBook
