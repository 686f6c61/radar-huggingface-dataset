# nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF es la versión cuantizada en formato GGUF del modelo de voz y audio offline Nemotron-3.5-Transcribe de NVIDIA. Se trata de un modelo de reconocimiento automático del habla (ASR) que procesa grabaciones de audio junto con instrucciones de texto y contexto opcional para producir respuestas de texto: transcripción multilingüe en 40 idiomas, traducción de voz, transcripción contextual y con atribución de hablante, marcas de tiempo a nivel de palabra y respuesta a preguntas sobre audio. Soporta grabaciones de hasta una hora de duración.

El modelo emplea una arquitectura híbrida Mamba-2–Transformer con Mixture of Experts (MoE) y un codificador paralelo de expertos (Parallel Expert Encoder), con 34B parámetros totales y 4,3B activos, incluyendo el codificador de audio. Esta variante GGUF está pensada para ejecutarse con NeMo-Speech.cpp, un runtime nativo en C++ ligero para la familia de modelos de voz de NVIDIA, disponible en Linux y Windows.

La relevancia de esta ficha radica en que permite desplegar localmente un sistema de transcripción de largo formato y multilingüe de gran calidad sin depender de servicios en la nube. Se distribuye en dos decodificadores (NVFP4 para GPUs Blackwell e IQ4_NL para Ampere, Ada, Hopper y CPU) más un fichero de codificador compartido, lo que facilita su integración en entornos con hardware heterogéneo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2–Transformer hybrid Mixture of Experts con Parallel Expert Encoder |
| Parametros totales | 34B (incluyendo el codificador de audio) |
| Parametros activos | 4,3B |
| Longitud de contexto | no disponible (soporta grabaciones de hasta 1 hora) |
| Tipos de cuantizacion | NVFP4 (expertos y atención), FP8 (lineales Mamba), BF16 (cabeza MTP, embeddings, cabeza de salida); IQ4_NL (expertos enrutados), Q8_0 (atención, Mamba, lineales de expertos compartidos), BF16 (embeddings y cabeza de salida); codificador en F16 y cabeza CTC en F32 |
| Idiomas soportados | 40 idiomas: cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | GGUF (decodificador NVFP4, decodificador IQ4_NL, codificador F16, DFlash2 BF16 opcional) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido con capas Mamba-2 combinadas con atención y una capa de Mixture of Experts, junto con un codificador de audio paralelo con rama de hablante y una cabeza CTC para marcas de tiempo a nivel de palabra y etiquetas de hablante. La variante GGUF mantiene esta estructura pero cuantiza los pesos: el decodificador NVFP4 conserva los expertos y la atención en NVFP4, los lineales Mamba en FP8 y la cabeza MTP, embeddings y cabeza de salida en BF16; el decodificador IQ4_NL usa expertos enrutados en IQ4_NL, atención, Mamba y lineales de expertos compartidos en Q8_0, y embeddings y cabeza de salida en BF16. El fichero de codificador va en F16 con la cabeza CTC en F32.

El modelo incorpora decodificación especulativa nativa mediante Multi-Token Prediction (MTP), activada por defecto, y opcionalmente un modelo borrador DFlash2. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; para ello se remite a la model card del modelo base y al informe técnico.

## Capacidades

- Transcripción multilingüe automática en 40 idiomas, incluyendo checo, neerlandés, inglés, francés, alemán, hindi, italiano, coreano, polaco, portugués, ruso, eslovaco, español, búlgaro, croata, danés, estonio, finés, húngaro, japonés, letón, lituano, rumano, esloveno, sueco, tailandés, turco, ucraniano, árabe, bengalí, chino, griego, hebreo, indonesio, maltés, maratí, tagalo, tamil, telugu y vietnamita.
- Traducción de voz (speech translation) entre idiomas.
- Transcripción contextual: acepta instrucciones de texto y contexto opcional para mejorar la precisión.
- Transcripción con atribución de hablante (speaker diarization) mediante la rama de hablante del codificador.
- Marcas de tiempo a nivel de palabra (word timestamps) mediante la cabeza CTC.
- Procesamiento de grabaciones de hasta una hora (long-form audio).
- Respuesta a preguntas sobre audio (audio question answering).
- Decodificación especulativa nativa con Multi-Token Prediction (MTP) activada por defecto, con modelo borrador DFlash2 opcional.

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede procesar grabaciones de hasta una hora con marcas de tiempo y atribución de hablante, lo que permite generar actas estructuradas con identificación de quién dijo qué en entornos corporativos multilingües.
- Subtitulado automático de vídeo: gracias a las marcas de tiempo a nivel de palabra y al soporte de 40 idiomas, se puede generar pistas de subtítulos sincronizadas para contenido audiovisual, incluyendo traducción a otros idiomas.
- Atención al cliente y análisis de llamadas: la transcripción con diarización permite separar agente y cliente en grabaciones de call center, facilitando el análisis de calidad y la extracción de motivos de contacto.
- Documentación clínica y legal: la transcripción contextual con instrucciones de texto permite adaptar el modelo a vocabulario especializado (términos médicos o jurídicos) y generar borradores de informes a partir de dictados.
- Investigación cualitativa: transcripción de entrevistas y grupos focales de larga duración en múltiples idiomas, con marcas de tiempo que facilitan la codificación y el análisis posterior.
- Accesibilidad: generación de transcripciones en tiempo casi real de clases, conferencias o eventos para personas con discapacidad auditiva, ejecutándose localmente sin enviar audio a servicios externos.
- Archivística y medios de comunicación: indexación y búsqueda de contenido en archivos de audio y vídeo mediante transcripciones con marcas de tiempo y traducción, permitiendo recuperar fragmentos por palabra clave.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados del modelo base se calcularon para la versión BF16 y remite a la model card del modelo base y al informe técnico para consultar los resultados.

## Requisitos de hardware

- Decodificador NVFP4: requiere GPUs NVIDIA Blackwell con 32 GB de memoria o más.
- Decodificador IQ4_NL: compatible con otras GPUs NVIDIA (Ampere, Ada, Hopper) con 24 GB o más, o ejecución en CPU.
- Tamaños de fichero: decodificador NVFP4 21,2 GiB; decodificador IQ4_NL 19,0 GiB; codificador F16 1,6 GiB (obligatorio); DFlash2 BF16 opcional 1,1 GiB.
- Runtime: NeMo-Speech.cpp, disponible para Linux y Windows.
- VRAM estimada: al menos 24 GB para el decodificador IQ4_NL junto con el codificador; al menos 32 GB para el decodificador NVFP4.
- Cabe en GPUs de consumo de gama alta con 24 GB (por ejemplo, serie RTX 4090) usando el decodificador IQ4_NL, siempre que se disponga de memoria suficiente para el codificador y el contexto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (ASR multilingüe de largo formato), por lo que la comparativa cuantitativa no está disponible. Como referencia cualitativa, esta variante GGUF se diferencia de la versión BF16 del modelo base por su menor huella de memoria y su ejecución mediante NeMo-Speech.cpp en lugar de frameworks de propósito general.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Nemotron-3.5-Transcribe-30B-A4B-GGUF | 34B totales / 4,3B activos | no disponible (audio hasta 1 h) | OpenMDW-1.1 | GGUF |
| Nemotron-3.5-Transcribe-30B-A4B (BF16) | 34B totales / 4,3B activos | no disponible (audio hasta 1 h) | OpenMDW-1.1 | safetensors |
| Nemotron-3.5-Transcribe-30B-A4B-NVFP4 | 34B totales / 4,3B activos | no disponible (audio hasta 1 h) | OpenMDW-1.1 | NVFP4 |

## Limitaciones y advertencias

- El modelo está diseñado para procesamiento offline de grabaciones; no se indica soporte para streaming en tiempo real.
- La duración máxima de grabación soportada es de una hora; grabaciones más largas requerirán segmentación previa.
- El decodificador NVFP4 solo funciona en GPUs Blackwell con 32 GB o más; en otras GPUs debe usarse el decodificador IQ4_NL.
- La cuantización puede introducir degradaciones de precisión respecto al modelo BF16; los resultados de benchmarks publicados corresponden al modelo BF16, no a esta variante GGUF.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación ni limitaciones específicas por idioma en la información proporcionada.
- La licencia OpenMDW-1.1 permite uso comercial y no comercial, pero deben revisarse sus términos completos antes de su integración en productos.
- El runtime NeMo-Speech.cpp es específico para esta familia de modelos, lo que limita la portabilidad a otros frameworks de inferencia habituales (vLLM, llama.cpp, Ollama, TGI).

## Enlaces

- Hugging Face (esta variante GGUF): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Checkpoint NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4
- Página de desarrolladores Nemotron: https://developer.nvidia.com/nemotron
- Runtime NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Demo en vivo: https://huggingface.co/spaces/nvidia/nemotron-transcribe
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
