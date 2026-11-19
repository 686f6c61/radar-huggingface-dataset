# openbmb/MiniCPM-V-4.7-35B-A3B-FP8

## Resumen

MiniCPM-V 4.7 35B-A3B es un modelo multimodal de tipo image-text-to-text desarrollado por OpenBMB, el primer modelo de arquitectura MoE (Mixture of Experts) de la familia MiniCPM-V. Esta ficha concreta corresponde a la variante cuantizada en FP8 del modelo base BF16, generada con compressed-tensors y llm-compressor. El modelo resuelve tareas de comprensión de imagen única, múltiples imágenes y vídeo, combinando capacidades de razonamiento visual con una arquitectura eficiente orientada al despliegue en dispositivo.

El modelo cuenta con 35.212.875.824 parámetros totales (35B) y activa aproximadamente 3B por token (denominación A3B), lo que permite un equilibrio entre capacidad y coste de inferencia. Incorpora técnicas como la compresión temprana de tokens visuales dentro del codificador de visión (intra-ViT early compression, heredada de LLaVA-UHD v4) y soporte de compresión mixta de tokens visuales 4x/16x para ajustar el detalle frente al coste computacional.

Su relevancia actual radica en la eficiencia: según el autor, es el primer modelo MoE de código abierto con inferencia fluida en dispositivo sin pérdida de rendimiento, gracias a técnicas como Lookahead Expert Scheduling (LES) y la integración de decodificación especulativa DSpark. Se distribuye bajo licencia Apache 2.0 y soporta múltiples frameworks de inferencia y ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) multimodal con codificador de visión; transformer con compresión temprana de tokens visuales intra-ViT |
| Parametros totales | 35.212.875.824 (35B) |
| Parametros activos | Aproximadamente 3B por token (variante 35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (esta variante); el modelo base ofrece GGUF, BNB, AWQ y GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

MiniCPM-V 4.7 35B-A3B es un modelo multimodal de arquitectura MoE, el primero de la serie MiniCPM-V en adoptar este diseño. Combina un codificador de visión con un transformer de lenguaje de tipo mixture-of-experts, donde cada token activa un subconjunto de aproximadamente 3B parámetros de los 35B totales. Una innovación destacable es la compresión temprana de tokens visuales dentro del propio codificador de visión (técnica intra-ViT early compression de LLaVA-UHD v4), que reduce la computación en las capas posteriores del encoder. Además, soporta compresión mixta de tokens visuales 4x/16x, permitiendo a los desarrolladores equilibrar el detalle visual y el coste de inferencia según la tarea.

En el plano de la eficiencia de despliegue, el modelo introduce Lookahead Expert Scheduling (LES) junto con cuantización fina capa a capa e integración de muestreo especulativo DSpark, lo que según el autor permite inferencia fluida en dispositivo. El autor también publica Self-Replay Fine-Tuning (SRFT), un método de ajuste fino que ayuda a extender capacidades a bajo coste reduciendo el olvido de capacidades previas. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni detalles sobre etapas de RLHF o DPO.

## Capacidades

- Comprensión de imagen única, múltiples imágenes y vídeo (pipeline image-text-to-text).
- Generación de texto y razonamiento multimodal a partir de entradas visuales.
- Compresión configurable de tokens visuales (4x/16x) para ajustar detalle y coste.
- Inferencia en dispositivo en iOS, Android y HarmonyOS, con soporte de despliegue de código abierto.
- Soporte day-0 para plataformas de chips de Rockchip, Houmo, Intel, AMD y Arm.
- Compatibilidad con frameworks de inferencia: SGLang, vLLM, llama.cpp y Ollama.
- Compatibilidad con frameworks de ajuste fino: SWIFT y LLaMA-Factory.
- Integración con decodificación especulativa DSpark (variante DSpark disponible).
- Modo conversacional (tag conversational).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia visual en movilidad: el modelo puede ejecutarse en iOS, Android y HarmonyOS con inferencia en dispositivo, lo que permite aplicaciones de descripción de imágenes o accesibilidad sin conexión a la nube; el autor reporta 13+ tokens/s con 3 GB de memoria en iPhone 17 Pro Max.
- Análisis de documentos y capturas en el borde: con compresión de tokens visuales 4x/16x, se puede procesar imágenes de documentos ajustando el nivel de detalle para reducir latencia en dispositivos con recursos limitados.
- Comprensión de vídeo para monitorización local: al soportar entrada de vídeo, encaja en escenarios de análisis de secuencias visuales en dispositivos de borde con chips Arm, Intel o AMD.
- Despliegue en servidores con vLLM o SGLang: la variante FP8 reduce el coste de memoria frente al BF16, permitiendo servir cargas multimodales en GPUs con menor VRAM.
- Prototipado rápido con Ollama o llama.cpp: la disponibilidad de cuantizaciones GGUF y la integración con estas herramientas facilita pruebas locales en estaciones de trabajo.
- Ajuste fino específico de dominio: mediante SWIFT o LLaMA-Factory y la técnica SRFT del autor, se puede adaptar el modelo a dominios concretos (por ejemplo, inspección visual industrial) reduciendo el olvido de capacidades previas.
- Asistentes conversacionales multimodales: el tag conversational y el pipeline image-text-to-text permiten construir interfaces de chat que aceptan imágenes junto con texto.

## Benchmarks y rendimiento

Según el autor, en modo Instruct la variante 35B-A3B alcanza una puntuación global superior en menos tiempo de inferencia que Qwen3.6 35B-A3B. También se reporta una velocidad de decodificación de 13+ tokens/s con 3 GB de memoria en iPhone 17 Pro Max. No se han publicado en la información disponible tablas detalladas con resultados numéricos de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio FP8 ocupa 38.0 GB, por lo que se requiere aproximadamente esa cantidad de memoria para cargar los pesos completos en FP8; con cuantizaciones más agresivas (GGUF, AWQ, GPTQ) el requisito se reduce, aunque no se dispone de cifras exactas.
- GPU recomendadas: no disponible de forma explícita; por tamaño, GPUs de 48 GB o más (A100 80 GB, H100) son adecuadas para FP8; GPUs de 24 GB (RTX 4090) requerirían cuantizaciones de menor precisión u offloading.
- ¿Cabe en GPU de consumo? Probablemente con cuantizaciones GGUF de baja precisión, pero no se confirma en la información disponible.
- Opciones de despliegue: SGLang, vLLM, llama.cpp, Ollama; en dispositivo mediante iOS, Android y HarmonyOS y plataformas de chips Rockchip, Houmo, Intel, AMD y Arm.
- Latencia y throughput: 13+ tokens/s con 3 GB de memoria en iPhone 17 Pro Max (dato del autor); sin cifras para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM-V 4.7 35B-A3B (FP8) | 35B totales, ~3B activos | no disponible | Apache 2.0 | MoE multimodal, orientado a dispositivo; el autor lo compara favorablemente con Qwen3.6 35B-A3B en puntuación global y tiempo de inferencia |
| Qwen3.6 35B-A3B | 35B totales, ~3B activos | no disponible | no disponible | Referencia de comparación citada por el autor; sin datos detallados en la información proporcionada |
| MiniCPM-V 4.7 35B-A3B (BF16) | 35B totales, ~3B activos | no disponible | Apache 2.0 | Modelo base sin cuantizar del que deriva esta variante FP8 |

## Limitaciones y advertencias

- Esta variante es una cuantización FP8 del modelo base; puede presentar degradación menor de precisión frente al BF16 en tareas sensibles.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación ni evaluación de robustez en la documentación proporcionada.
- Idiomas soportados no especificados; no se puede garantizar cobertura multilingüe.
- Longitud de contexto no disponible, lo que limita la planificación de casos de uso con entradas largas.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene revisar las licencias de los frameworks y dependencias asociadas.
- El rendimiento en dispositivo depende de la técnica LES y de la integración con DSpark; sin estas optimizaciones, la inferencia MoE en memoria limitada puede degradarse por carga repetida de expertos.
- No se han publicado en la información disponible datos de benchmarks estándar ni evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-FP8
- Modelo base BF16: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Variante DSpark: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark
- GitHub MiniCPM-V: https://github.com/openbmb/MiniCPM-V
- GitHub llama.cpp-omni (LES): https://github.com/OpenBMB/llama.cpp-omni
- GitHub LLaVA-UHD v4: https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Documentación de despliegue MiniCPM-o: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/deployment_en.md
- Documentación MiniCPM-V 4.7: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/minicpm_v4dot7_en.md
- API: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/api.md
- Demo en vivo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.7-Demo
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Blog Self-Replay Fine-Tuning: https://openbmb.cn/en/blog/self-replay-fine-tuning
