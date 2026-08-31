# PG0601/CosyVoice2-0.5B

## Resumen

CosyVoice2-0.5B es un modelo de síntesis de voz (text-to-speech) de código abierto desarrollado por el equipo FunAudioLLM (Alibaba), presentado en diciembre de 2024. Se trata de un sistema de generación de voz a gran escala basado en modelos de lenguaje (LLM) que integra modelado offline y streaming, permitiendo síntesis bidireccional con una latencia de primer paquete de hasta 150 ms sin pérdida significativa de calidad. El modelo cuenta con 0.5 mil millones de parámetros y soporta nueve idiomas: chino, inglés, francés, español, japonés, coreano, italiano, ruso y alemán.

Su relevancia actual radica en que es uno de los pocos sistemas TTS open source que combina clonación de voz zero-shot multilingüe, control fino mediante instrucciones (idioma, emoción, velocidad, volumen) y normalización de texto sin módulo frontend tradicional. Además, sirve como base para la versión posterior Fun-CosyVoice 3.0, que mejora la consistencia de contenido y la naturalidad prosódica. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje grande (LLM) con flow matching y decodificador de voz |
| Parametros totales | 0.5 mil millones (0.5B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto largo) |
| Tipos de cuantizacion | safetensors, ONNX (según tags del repositorio) |
| Idiomas soportados | chino, inglés, francés, español, japonés, coreano, italiano, ruso, alemán |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

CosyVoice2-0.5B se basa en una arquitectura de modelo de lenguaje grande (LLM) para generación de voz, combinada con un módulo de flow matching para la síntesis del audio. El sistema integra modelado offline y streaming, lo que permite tanto generación por lotes como síntesis en tiempo real con latencia ultrabaja. Entre las innovaciones técnicas destacan el uso de Repetition Aware Sampling (RAS) para estabilizar la inferencia del LLM, y el soporte de streaming con cache de claves/valores (KV cache) y atención de producto punto escalado (SDPA) para optimizar el factor de tiempo real (RTF).

El entrenamiento se realizó con datos multilingües que cubren los nueve idiomas mencionados, aunque no se han publicado detalles específicos sobre el volumen de tokens o la composición exacta del dataset. El modelo soporta clonación de voz zero-shot, es decir, puede imitar una voz a partir de una muestra de referencia de pocos segundos sin necesidad de fine-tuning. También incorpora un mecanismo de instrucciones que permite controlar aspectos como el idioma, el dialecto, la emoción, la velocidad y el volumen de la salida.

## Capacidades

- Generación de voz natural y expresiva en nueve idiomas, con soporte de acentos y dialectos chinos (cantonés, minnan, sichuanés, etc.).
- Clonación de voz zero-shot: a partir de una muestra de audio de referencia, el modelo puede replicar la voz del hablante en cualquier idioma soportado (clonación multilingüe y cross-lingüe).
- Síntesis bidireccional streaming: admite entrada de texto incremental y salida de audio en streaming, con latencia de primer paquete de 150 ms.
- Control mediante instrucciones: permite especificar idioma, emoción, velocidad, volumen y otros parámetros mediante comandos de texto.
- Normalización de texto integrada: lee números, símbolos especiales y formatos variados sin necesidad de un módulo frontend externo.
- Inpainting de pronunciación: soporta corrección de pronunciación mediante pinyin chino y fonemas CMU ingleses, útil para producción.
- Conversión de voz (voice conversion): puede transformar la voz de un hablante a otra manteniendo el contenido lingüístico.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones de voz multi-turno en varios idiomas, con baja latencia para respuestas en tiempo real. Su capacidad de clonación de voz permite personalizar el agente con la voz de la marca.
- Asistentes de voz en dispositivos: gracias al streaming bidireccional y la latencia de 150 ms, es adecuado para asistentes integrados en altavoces inteligentes o aplicaciones móviles que requieren interacción natural.
- Audiolibros y narración: genera narraciones fluidas en nueve idiomas, con control de emoción y velocidad para adaptarse al tono del contenido. La normalización de texto facilita la lectura de cifras y formatos complejos.
- Doblaje de vídeo y localización: permite clonar la voz de un actor original y generar diálogos en otros idiomas manteniendo la identidad vocal, reduciendo costes de regrabación.
- Generación de contenido educativo: crea lecciones de audio multilingües con voces consistentes, útil para plataformas de e-learning que necesitan producir material en varios idiomas.
- Pruebas de producto y prototipado: los equipos de desarrollo pueden integrar el modelo en pipelines de CI/CD para generar audios de prueba automáticamente, verificando la pronunciación de nombres o términos técnicos.
- Accesibilidad: convierte texto en voz para personas con discapacidad visual, con soporte multilingüe y opciones de velocidad ajustables.

## Benchmarks y rendimiento

La tabla siguiente muestra los resultados de evaluación publicados en la documentación del modelo, comparando CosyVoice2-0.5B con otros sistemas TTS open source y propietarios. Las métricas son CER (Character Error Rate) para chino, WER (Word Error Rate) para inglés, y similitud de hablante (Speaker Similarity) en porcentaje. Valores más bajos de CER/WER indican mejor precisión; valores más altos de similitud indican mayor fidelidad a la voz de referencia.

| Modelo | Tamaño | test-zh CER (%) ↓ | test-zh Similitud (%) ↑ | test-en WER (%) ↓ | test-en Similitud (%) ↑ | test-hard CER (%) ↓ | test-hard Similitud (%) ↑ |
|---|---|---|---|---|---|---|---|
| Human | - | 1.26 | 75.5 | 2.14 | 73.4 | - | - |
| Seed-TTS (propietario) | - | 1.12 | 79.6 | 2.25 | 76.2 | 7.59 | 77.6 |
| F5-TTS | 0.3B | 1.52 | 74.1 | 2.00 | 64.7 | 8.67 | 71.3 |
| Spark TTS | 0.5B | 1.2 | 66.0 | 1.98 | 57.3 | - | - |
| **CosyVoice2** | **0.5B** | **1.45** | **75.7** | **2.57** | **65.9** | **6.83** | **72.4** |
| FireRedTTS2 | 1.5B | 1.14 | 73.2 | 1.95 | 66.5 | - | - |
| Index-TTS2 | 1.5B | 1.03 | 76.5 | 2.23 | 70.6 | 7.12 | 75.5 |
| VibeVoice-1.5B | 1.5B | 1.16 | 74.4 | 3.04 | 68.9 | - | - |
| VoxCPM | 0.5B | 0.93 | 77.2 | 1.85 | 72.9 | 8.87 | 73.0 |
| Fun-CosyVoice3-0.5B-2512 | 0.5B | 1.21 | 78.0 | 2.24 | 71.8 | 6.71 | 75.8 |

CosyVoice2 muestra un rendimiento competitivo en precisión de contenido (CER/WER) y similitud de hablante, aunque es superado por modelos más recientes como Fun-CosyVoice3 o VoxCPM en algunas métricas. Su principal ventaja es la combinación de tamaño reducido (0.5B) y latencia ultrabaja.

## Requisitos de hardware

- VRAM estimada para inferencia: no se han publicado requisitos oficiales. Dado el tamaño de 0.5B, se estima que puede ejecutarse en GPUs con 4-6 GB de VRAM en precisión FP16, y menos con cuantización (por ejemplo, 2-3 GB en INT8). Sin embargo, estos valores son orientativos y dependen de la implementación.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, o superiores. Para despliegue en producción con múltiples peticiones concurrentes, se recomienda una GPU de datacenter como A10, A100 o H100.
- Compatibilidad con GPUs consumer: sí, el modelo cabe en GPUs de gama media y alta para consumo.
- Opciones de despliegue: el repositorio oficial de CosyVoice proporciona scripts de inferencia y un servidor FastAPI. También se ha añadido soporte para vLLM (a partir de mayo de 2025) y para Triton/TRT-LLM (contribución de NVIDIA). No se menciona compatibilidad con llama.cpp u Ollama, ya que estos se centran en modelos de lenguaje puros.
- Latencia y throughput: la latencia de primer paquete es de 150 ms en modo streaming. El throughput no se ha publicado oficialmente, pero el uso de KV cache y SDPA optimiza el factor de tiempo real (RTF) para inferencia eficiente.

## Comparativa con modelos similares

La siguiente tabla compara CosyVoice2-0.5B con otros modelos TTS open source de tamaño similar (0.3B-0.5B) y con un modelo propietario de referencia.

| Modelo | Tamaño | Idiomas | Licencia | Latencia streaming | Clonación zero-shot | Instrucciones |
|---|---|---|---|---|---|---|
| CosyVoice2-0.5B | 0.5B | 9 | Apache 2.0 | Sí (150 ms) | Sí | Sí |
| F5-TTS | 0.3B | 6 (aprox.) | MIT | No | Sí | No |
| Spark TTS | 0.5B | 3 (aprox.) | Apache 2.0 | No | Sí | Parcial |
| VoxCPM | 0.5B | 6 (aprox.) | Apache 2.0 | No | Sí | No |
| Seed-TTS (propietario) | - | 9+ | Comercial | No | Sí | Sí |

CosyVoice2 destaca por su soporte de streaming bidireccional y su amplia cobertura de idiomas (9), algo poco común en modelos de su tamaño. F5-TTS y Spark TTS son alternativas más simples sin streaming. VoxCPM ofrece mejor precisión en chino (CER 0.93) pero no soporta streaming. Seed-TTS es superior en calidad pero no es open source.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con datos multilingües, puede presentar sesgos en la pronunciación de nombres o términos no nativos, especialmente en idiomas con menos representación en el dataset.
- Riesgo de alucinación: como todo modelo generativo, puede producir audio con errores de pronunciación o contenido no deseado si el texto de entrada es ambiguo o contiene caracteres especiales no normalizados.
- Limitaciones de contexto: al ser un modelo TTS, no maneja contextos largos de texto; la entrada se procesa por segmentos, lo que puede afectar la coherencia prosódica en textos muy extensos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe atribuir el copyright y no se puede usar para reclamar respaldo del autor. No hay restricciones específicas de uso, pero se recomienda revisar los términos completos.
- Dependencia de recursos externos: para una normalización de texto óptima, se recomienda instalar el paquete `ttsfrd` (no incluido en el modelo base), lo que añade una dependencia adicional.
- Calidad variable entre idiomas: aunque soporta nueve idiomas, la calidad puede ser inferior en idiomas con menos datos de entrenamiento (por ejemplo, italiano o ruso) en comparación con chino o inglés.
- Requisitos de hardware no oficiales: no se han publicado requisitos mínimos de VRAM ni benchmarks de throughput, por lo que los valores estimados deben validarse en el entorno de despliegue.

## Enlaces

- Repositorio de HuggingFace del modelo: https://huggingface.co/PG0601/CosyVoice2-0.5B
- Repositorio oficial de HuggingFace (FunAudioLLM): https://huggingface.co/FunAudioLLM/CosyVoice2-0.5B
- Página de demostraciones de CosyVoice 2.0: https://funaudiollm.github.io/cosyvoice2/
- Paper de CosyVoice 2.0 (arXiv:2412.10117): https://arxiv.org/abs/2412.10117
- Paper de CosyVoice 1.0 (arXiv:2407.05407): https://arxiv.org/abs/2407.05407
- Paper de Fun-CosyVoice 3.0 (arXiv:2505.17589): https://arxiv.org/abs/2505.17589
- Repositorio de GitHub (CosyVoice): https://github.com/QwenAudio/CosyVoice
- Repositorio de GitHub (CosyVoice2, fork): https://github.com/Render-AI-Team/CosyVoice2
- Modelo en ModelScope: https://www.modelscope.cn/models/iic/CosyVoice2-0.5B
