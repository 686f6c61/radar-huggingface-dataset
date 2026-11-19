# openbmb/MiniCPM-V-4

## Resumen

MiniCPM-V 4.0 es un modelo multimodal de tipo image-text-to-text desarrollado por OpenBMB, el equipo detrás de la saga MiniCPM. Se construye a partir de un encoder visual SigLIP2-400M y un modelo de lenguaje MiniCPM4-3B, sumando un total de 4.1B parámetros. Su objetivo es ofrecer capacidades de comprensión de imagen única, múltiples imágenes y vídeo con una eficiencia que permita el despliegue en dispositivos de consumo, incluidos teléfonos móviles.

El modelo destaca por combinar un rendimiento competitivo con modelos propietarios de mayor tamaño (alcanza una puntuación media de 69.0 en OpenCompass, superando a GPT-4.1-mini-20250414 con 68.9 y a Qwen2.5-VL-3B-Instruct con 64.5) con una huella de parámetros reducida. Según el autor, es capaz de ofrecer menos de 2 segundos de latencia hasta el primer token y más de 17 tokens por segundo en un iPhone 16 Pro Max sin problemas de calentamiento.

Su relevancia actual radica en la combinación de licencia Apache 2.0, soporte para múltiples backends de inferencia (llama.cpp, Ollama, vLLM, SGLang, LLaMA-Factory) y un enfoque explícito en OCR, comprensión multi-imagen y vídeo, lo que lo convierte en una opción atractiva para aplicaciones en el borde y para pipelines de visión por computador que requieran un modelo abierto y ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal transformer: encoder visual SigLIP2-400M + LLM MiniCPM4-3B |
| Parametros totales | 4.059.533.040 (4.1B) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona compatibilidad con llama.cpp y Ollama, que soportan cuantización, pero no se detallan tipos) |
| Idiomas soportados | multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); compatible con GGUF vía llama.cpp/Ollama |

## Arquitectura y entrenamiento

MiniCPM-V 4.0 sigue la estela de la familia MiniCPM-V, que combina un encoder visual con un modelo de lenguaje. En este caso, el encoder es SigLIP2-400M y el LLM es MiniCPM4-3B, dando lugar a un modelo de 4.1B parámetros totales. La arquitectura es de tipo transformer multimodal con pipeline image-text-to-text, e incluye código personalizado (`custom_code`) en la librería transformers, lo que implica que requiere confiar en implementaciones específicas del autor para su carga.

En cuanto al entrenamiento, la model card cita el dataset `openbmb/RLAIF-V-Dataset`, lo que sugiere el uso de técnicas de alineación tipo RLHF/RLAIF para mejorar la fidelidad y reducir alucinaciones visuales. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon otras técnicas como DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal más allá de la mención a la eficiencia en dispositivos.

## Capacidades

- Comprensión de imagen única: descripción, respuesta a preguntas visuales, razonamiento sobre escenas.
- Comprensión de múltiples imágenes: comparación, relación y razonamiento entre varias imágenes en una misma conversación.
- Comprensión de vídeo: análisis de secuencias de vídeo para responder preguntas sobre eventos y objetos.
- OCR: reconocimiento de texto en imágenes, con puntuación de 852 en OCRBench según la model card.
- Razonamiento matemático visual: evaluación en MathVista con 60.8 puntos.
- Generación de texto conversacional en formato image-text-to-text.
- Soporte multilingüe (etiqueta `multilingual`).
- Capacidades de extracción de características (`feature-extraction`) además de generación.
- No se menciona explícitamente soporte de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Digitalización de documentos y OCR en el borde: el modelo puede ejecutarse en dispositivos móviles (iPhone 16 Pro Max según el autor) y realizar reconocimiento de texto en imágenes, lo que permite escanear facturas, tickets o formularios sin enviar datos a la nube.
- Asistencia visual para accesibilidad: descripción de imágenes y vídeo en tiempo real para personas con discapacidad visual, aprovechando la baja latencia (<2 s al primer token) y el procesamiento local.
- Análisis de vídeo para vigilancia o monitorización: comprensión de secuencias de vídeo para detectar eventos o responder preguntas sobre lo ocurrido, con despliegue en servidores mediante vLLM o SGLang para peticiones concurrentes.
- Moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios en plataformas, usando la capacidad multi-imagen para comparar y contextualizar.
- Asistentes conversacionales con contexto visual: chatbots que reciben capturas de pantalla o fotos y mantienen conversaciones multi-turno, integrables vía Ollama o llama.cpp en entornos locales.
- Automatización de tareas de inspección: análisis de imágenes de productos o entornos industriales para detectar anomalías, con la ventaja de poder ejecutarse en hardware de consumo.
- Educación y tutoría visual: resolución de problemas matemáticos o científicos a partir de imágenes (MathVista 60.8), con retroalimentación conversacional.

## Benchmarks y rendimiento

Resultados de imagen única en OpenCompass según la model card:

| Modelo | Tamaño | OpenCompass | OCRBench | MathVista | HallusionBench | MMMU | MMVet | MMBench V1.1 | MMStar | AI2D |
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
| MiniCPM-o-2.6 | 8.7B | (truncado en la información disponible) | | | | | | | | |
| MiniCPM-V 4.0 | 4.1B | 69.0 | no disponible en el fragmento | no disponible en el fragmento | no disponible en el fragmento | no disponible en el fragmento | no disponible en el fragmento | no disponible en el fragmento | no disponible en el fragmento | no disponible en el fragmento |

La model card indica que MiniCPM-V 4.0 obtiene una media de 69.0 en OpenCompass, superando a GPT-4.1-mini (68.9), MiniCPM-V 2.6 (65.2) y Qwen2.5-VL-3B-Instruct (64.5). Los resultados desglosados por benchmark para MiniCPM-V 4.0 no aparecen completos en el fragmento proporcionado.

## Requisitos de hardware

- VRAM estimada: con 4.1B parámetros, en precisión completa (FP16) se requieren aproximadamente 8-9 GB de VRAM; en cuantización de 8 bits, unos 4-5 GB; en 4 bits, unos 2.5-3 GB (estimaciones orientativas, no confirmadas en la información).
- GPU recomendadas: para FP16, una RTX 3090/4090 (24 GB) o A100/H100 para despliegues concurrentes; para cuantización 4-bit, cabe en GPUs de 8 GB como RTX 3060 Ti o incluso en iGPU con suficiente memoria compartida.
- Cabe en GPU de consumo: sí, especialmente con cuantización GGUF vía llama.cpp u Ollama.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, SGLang, LLaMA-Factory, demo web local, y app iOS open-source para iPhone/iPad.
- Latencia y throughput: según el autor, menos de 2 s de latencia al primer token y más de 17 tokens/s en iPhone 16 Pro Max; se menciona "superior throughput under concurrent requests" sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OpenCompass | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.0 | 4.1B | no disponible | 69.0 | Apache 2.0 | Hugging Face, GitHub, Ollama, vLLM, SGLang |
| Qwen2.5-VL-3B-Instruct | 3.8B | no disponible | 64.5 | no disponible en la información | Hugging Face |
| InternVL2.5-4B | 3.7B | no disponible | 65.1 | no disponible en la información | Hugging Face |
| MiniCPM-V 2.6 | 8.1B | no disponible | 65.2 | no disponible en la información | Hugging Face |

MiniCPM-V 4.0 ofrece el mejor OpenCompass de la comparativa entre modelos abiertos de tamaño similar, con la ventaja de su licencia Apache 2.0 y su soporte para despliegue en dispositivos móviles. Qwen2.5-VL-7B-Instruct e InternVL2.5-8B superan ligeramente en algunos benchmarks individuales (OCRBench, MMMU) pero con el doble de parámetros.

## Limitaciones y advertencias

- Riesgo de alucinación visual: a pesar de usar RLAIF-V, los modelos multimodales pueden describir objetos o texto inexistentes en la imagen; HallusionBench mide este aspecto y el modelo no está exento.
- Sesgos: no se documentan en la información proporcionada los sesgos de género, raza o culturales del modelo; deben evaluarse antes de uso en producción.
- Limitaciones de contexto: no se especifica la longitud de contexto, lo que impide garantizar conversaciones multi-turno muy largas o vídeos extensos.
- Idiomas: aunque se etiqueta como multilingüe, no se detalla el nivel de soporte por idioma; el rendimiento en castellano no está cuantificado.
- Licencia Apache 2.0: permite uso comercial, pero el código personalizado (`custom_code`) y las dependencias deben revisarse para cumplir con las obligaciones de atribución.
- Requiere `trust_remote_code` en transformers, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de desplegar en entornos sensibles.
- No se documentan capacidades de tool calling ni agentes multi-paso, por lo que no debe asumirse su disponibilidad sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM-V-4
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki (chino): https://openbmb.cn/docs/
- Demo: http://211.93.21.133:8889/
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Dataset RLAIF-V: https://huggingface.co/datasets/openbmb/RLAIF-V-Dataset
