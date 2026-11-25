# openbmb/MiniCPM-V-4-AWQ

## Resumen

MiniCPM-V-4-AWQ es la versión cuantizada a 4 bits mediante AWQ del modelo multimodal MiniCPM-V 4.0, desarrollado por OpenBMB (comunidad de modelos abiertos vinculada a la Universidad de Tsinghua y ModelBest). Se trata de un modelo image-text-to-text de 4.059.533.040 parámetros totales que combina un encoder visual SigLIP2-400M con un modelo de lenguaje MiniCPM4-3B, orientado a comprensión de imagen única, múltiples imágenes y vídeo en dispositivos de borde.

El modelo resuelve el problema de desplegar capacidades de nivel GPT-4V en hardware con recursos limitados: según la model card, alcanza una puntuación media de 69,0 en OpenCompass (agregado de 8 benchmarks) superando a GPT-4.1-mini-20250414 (68,9), MiniCPM-V 2.6 de 8,1B (65,2) y Qwen2.5-VL-3B-Instruct (64,5). Su relevancia actual radica en la eficiencia: el autor reporta menos de 2 s de latencia al primer token y más de 17 tokens/s en decodificación sobre un iPhone 16 Pro Max sin problemas de calentamiento.

Esta variante AWQ reduce el peso del repositorio a 3,3 GB (frente a los aproximadamente 8 GB en precisión completa), lo que facilita su despliegue en GPUs de consumo y entornos con VRAM ajustada, manteniendo la licencia Apache 2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal: encoder visual SigLIP2-400M + LLM MiniCPM4-3B (transformer) |
| Parametros totales | 4.059.533.040 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits AWQ (esta variante); el modelo base admite otras cuantizaciones vía llama.cpp/Ollama |
| Idiomas soportados | multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), cuantización AWQ 4-bit |

## Arquitectura y entrenamiento

MiniCPM-V 4.0 es un modelo multimodal que empareja un encoder visual SigLIP2-400M con el LLM MiniCPM4-3B, sumando 4,1B parámetros totales. La arquitectura sigue el patrón de los MLLM contemporáneos: proyección de las representaciones visuales al espacio del modelo de lenguaje para permitir generación condicionada por imagen, multi-imagen y vídeo. Esta variante AWQ aplica cuantización de pesos de 4 bits con Activation-aware Weight Quantization sobre el modelo base openbmb/MiniCPM-V-4.

En cuanto a datos de entrenamiento, la model card referencia el dataset openbmb/RLAIF-V-Dataset, lo que sugiere el uso de técnicas de alineación tipo RLHF/RLAIF para reducir alucinaciones visuales. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición detallada del corpus. El modelo hereda las capacidades de comprensión de imagen única, multi-imagen y vídeo de MiniCPM-V 2.6, con mejoras de eficiencia orientadas a despliegue en dispositivo.

## Capacidades

- Comprensión de imagen única: descripción, VQA, razonamiento visual y matemáticas sobre imágenes (MathVista).
- OCR y comprensión de documentos: etiqueta `ocr` explícita y puntuación OCRBench de 826 en el modelo base.
- Comprensión de múltiples imágenes: comparación y razonamiento conjunto sobre varias imágenes (etiqueta `multi-image`).
- Comprensión de vídeo: análisis de secuencias de vídeo (etiqueta `video`).
- Generación de texto conversacional multimodal (pipeline image-text-to-text).
- Capacidades multilingües (etiqueta `multilingual`).
- Extracción de características (`feature-extraction`) además de generación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Modo thinking, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Digitalización y extracción de datos de documentos: el modelo puede procesar facturas, formularios o capturas y devolver texto estructurado, apoyándose en su capacidad OCR (OCRBench 826 en el modelo base) y en su reducido tamaño para ejecutarse en local sin enviar documentos sensibles a la nube.
- Asistencia a personas con discapacidad visual: descripción de escenas en tiempo real desde la cámara de un móvil, aprovechando la latencia reportada de menos de 2 s al primer token en iPhone 16 Pro Max.
- Moderación y análisis de contenido visual: clasificación y descripción automática de imágenes en pipelines de revisión, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Análisis de vídeo para vigilancia o monitorización: resumen de eventos en secuencias de vídeo gracias a la capacidad de comprensión de vídeo del modelo.
- Automatización de atención al cliente con soporte visual: el usuario envía una foto de un producto o error y el modelo responde en conversación multi-turno; su naturaleza multilingüe permite atender a usuarios en varios idiomas.
- Despliegue en el borde (edge computing): aplicaciones iOS/iPadOS o embebidos con la app oficial open source, donde el tamaño de 4,1B parámetros y la cuantización AWQ de 4 bits permiten inferencia local sin conexión.
- Razonamiento matemático sobre figuras y gráficos: resolución de problemas tipo MathVista en herramientas educativas, con la ventaja de poder ejecutarse en un portátil con GPU de consumo.

## Benchmarks y rendimiento

Resultados del modelo base MiniCPM-V 4.0 (4,1B) según la model card del autor, en imagen única:

| Modelo | Tamano | OpenCompass | OCRBench | MathVista | HallusionBench | MMMU | MMVet | MMBench V1.1 | MMStar | AI2D |
|---|---|---|---|---|---|---|---|---|---|---|
| MiniCPM-V 4.0 | 4,1B | 69,0 | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |
| GPT-4.1-mini-20250414 | - | 68,9 | 840 | 70,9 | 49,3 | 55,0 | 74,3 | 80,9 | 60,9 | 76,0 |
| Qwen2.5-VL-3B-Instruct | 3,8B | 64,5 | 828 | 61,2 | 46,6 | 51,2 | 60,0 | 76,8 | 56,3 | 81,4 |
| InternVL2.5-4B | 3,7B | 65,1 | 820 | 60,8 | 46,6 | 51,8 | 61,5 | 78,2 | 58,7 | 81,4 |
| Qwen2.5-VL-7B-Instruct | 8,3B | 70,9 | 888 | 68,1 | 51,9 | 58,0 | 69,7 | 82,2 | 64,1 | 84,3 |
| InternVL2.5-8B | 8,1B | 68,1 | 821 | 64,5 | 49,0 | 56,2 | 62,8 | 82,5 | 63,2 | 84,6 |
| MiniCPM-V 2.6 | 8,1B | 65,2 | 852 | 60,8 | 48,1 | 49,8 | 60,0 | 78,0 | 57,5 | 82,1 |
| GPT-4v-20240409 | - | 63,5 | 656 | 55,2 | 43,9 | 61,7 | 67,5 | 79,8 | 56,0 | 78,6 |
| Gemini-1.5-Pro | - | 64,5 | 754 | 58,3 | 45,6 | 60,6 | 64,0 | 73,9 | 59,1 | 79,1 |
| Claude 3.5 Sonnet-20241022 | - | 70,6 | 798 | 65,3 | 55,5 | 66,4 | 70,1 | 81,7 | 65,1 | 81,2 |

Nota: la tabla del extracto de la model card aparece truncada; los valores por benchmark de MiniCPM-V 4.0 no están completos en la información disponible. Los datos corresponden al modelo base sin cuantizar; no se han publicado resultados específicos de esta variante AWQ.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio AWQ ocupa 3,3 GB, por lo que se estima un consumo de VRAM en torno a 4-5 GB en 4 bits, aunque el dato exacto no está disponible en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con al menos 6-8 GB de VRAM debería poder alojarlo.
- ¿Cabe en GPU de consumo? Sí, por el tamaño del repositorio (3,3 GB) es compatible con GPUs de consumo de gama media; el autor reporta ejecución en iPhone 16 Pro Max con menos de 2 s de latencia al primer token y más de 17 tokens/s.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, SGLang, LLaMA-Factory, transformers y demo web local; el autor también publica una app iOS open source.
- Latencia y throughput: menos de 2 s al primer token y más de 17 tokens/s en decodificación en iPhone 16 Pro Max (modelo base); el autor menciona buen throughput bajo peticiones concurrentes, sin cifras concretas adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OpenCompass | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4-AWQ | 4,1B | no disponible | 69,0 (modelo base) | Apache 2.0 | Hugging Face, Ollama, llama.cpp |
| Qwen2.5-VL-3B-Instruct | 3,8B | no disponible | 64,5 | no disponible en la información | Hugging Face |
| InternVL2.5-4B | 3,7B | no disponible | 65,1 | no disponible en la información | Hugging Face |
| MiniCPM-V 2.6 | 8,1B | no disponible | 65,2 | no disponible en la información | Hugging Face |

MiniCPM-V 4.0 ofrece la mejor puntuación OpenCompass de su categoría de tamaño (69,0) frente a Qwen2.5-VL-3B (64,5) e InternVL2.5-4B (65,1), con la mitad de parámetros que MiniCPM-V 2.6 y una puntuación superior. La ventaja de esta variante AWQ es el tamaño reducido del repositorio (3,3 GB) para despliegue en hardware limitado.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; como todo modelo entrenado con datos web, es previsible que herede sesgos de esos datos.
- Riesgo de alucinación: el uso del dataset RLAIF-V sugiere que el autor trabajó en mitigar alucinaciones visuales, pero no se dispone de cifras específicas de HallusionBench para esta variante.
- Limitaciones de contexto o idioma: la longitud de contexto no está especificada en la información disponible; el soporte es multilingüe pero no se detallan los idiomas concretos ni su calidad relativa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se han identificado restricciones adicionales en la información disponible.
- Caveats para producción: la cuantización AWQ de 4 bits puede degradar ligeramente la precisión respecto al modelo base; no se han publicado benchmarks específicos de esta variante. El uso de `custom_code` en transformers puede requerir `trust_remote_code=True`. Verificar el rendimiento real en la tarea concreta antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM-V-4-AWQ
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Wiki (chino): https://openbmb.cn/docs/
- Demo: http://211.93.21.133:8889/
- OpenBMB: https://openbmb.cn/en/
- Perfil de OpenBMB en Hugging Face: https://huggingface.co/openbmb
- OpenBMB en Ollama: https://ollama.com/openbmb
- Dataset RLAIF-V: https://huggingface.co/datasets/openbmb/RLAIF-V-Dataset
