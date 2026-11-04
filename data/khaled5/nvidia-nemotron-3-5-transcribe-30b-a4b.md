# khaled5/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B es un modelo de lenguaje aumentado con voz (SALM, Speech-Augmented Language Model) desarrollado por NVIDIA para transcripción multilingüe, traducción de voz, diarización de hablantes, predicción de marcas temporales, identificación de idioma y respuesta a preguntas sobre audio. Se distribuye como un fine-tune del modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 y se publica en el repositorio khaled5/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B, con pesos en formato safetensors y librería NeMo.

La arquitectura es un transformer híbrido Mamba-2 con mezcla de expertos (MoE) y un codificador de audio paralelo (encoder ASR transformer más encoder de hablante). El modelo totaliza 33.697.781.029 parámetros (aproximadamente 34B) con unos 4,3B parámetros activos por token, incluyendo el encoder de audio. Soporta contextos de 65.536 tokens y grabaciones de hasta una hora, lo que lo sitúa en la categoría de modelos de voz de formato largo con instrucciones en lenguaje natural.

Su relevancia actual radica en que unifica en un solo modelo tareas que tradicionalmente requerían pipelines separados (ASR, diarización, traducción, QA sobre audio), con licencia OpenMDW-1.1 que permite uso comercial, y variantes de precisión BF16, FP8 y NVFP4 para despliegue eficiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mamba-2–Transformer híbrido con Mixture of Experts y Parallel Expert Encoder (encoder ASR transformer + encoder de hablante) |
| Parámetros totales | 33.697.781.029 (≈34B), incluyendo el encoder de audio |
| Parámetros activos | ≈4,3B por token (incluyendo encoder de audio) |
| Longitud de contexto | 65.536 tokens; grabaciones de hasta 1 hora |
| Tipos de cuantización | BF16 (referencia), FP8, NVFP4 |
| Idiomas soportados | 40 idiomas: cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | safetensors (librería NeMo); variantes BF16, FP8 y NVFP4 publicadas por NVIDIA |

## Arquitectura y entrenamiento

El modelo combina un backbone de lenguaje Mamba-2–Transformer híbrido con mezcla de expertos, que activa aproximadamente 4,3B parámetros de los 34B totales, junto con un Parallel Expert Encoder compuesto por un encoder ASR de tipo transformer y un encoder de hablante. Esta combinación permite procesar audio y texto de instrucciones de forma conjunta, generando respuestas textuales condicionadas por la instrucción del usuario. El contexto de 65.536 tokens habilita la transcripción de grabaciones de hasta una hora en una sola pasada.

El entrenamiento se basa en el dataset nvidia/Granary-v2 y la mezcla incluye tareas de transcripción multilingüe, traducción de voz, transcripción contextual, transcripción con atribución de hablante, transcripción enriquecida, predicción de marcas temporales, identificación de idioma y respuesta a preguntas sobre audio. También se incluye una pequeña proporción de instrucciones de texto y tareas de etiquetado y redacción de PII. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Transcripción multilingüe en 40 idiomas con soporte de audio de formato largo (hasta una hora por grabación).
- Traducción de voz (speech translation) entre idiomas soportados.
- Diarización de hablantes con atribución de turnos en la transcripción.
- Predicción de marcas temporales (timestamps) a nivel de segmento o palabra.
- Identificación de idioma (language identification) y manejo de code-switching.
- Transcripción contextual: el usuario puede proporcionar contexto textual para mejorar el reconocimiento de términos específicos.
- Transcripción enriquecida (rich transcription) con formato y estructura configurables mediante instrucciones.
- Respuesta a preguntas sobre audio (audio question answering).
- Seguimiento de instrucciones en lenguaje natural para controlar el estilo y formato de la salida.
- Etiquetado y redacción de información personal identificable (PII).
- Capacidad residual de seguimiento de instrucciones de texto, heredada del modelo base.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa grabaciones de hasta una hora con diarización y marcas temporales, generando actas estructuradas con atribución de hablante y sin necesidad de segmentar el audio manualmente.
- Subtitulado y traducción de contenido audiovisual: gracias a la predicción de timestamps y a la traducción de voz integrada, se pueden generar subtítulos en otro idioma directamente desde el audio original en una sola pasada.
- Atención al cliente y análisis de llamadas: la transcripción con atribución de hablante y el etiquetado de PII permiten procesar grabaciones de call center, redactar datos sensibles y analizar la conversación sin pipelines separados.
- Documentación clínica y legal: la transcripción contextual permite introducir vocabulario específico del dominio (fármacos, términos jurídicos) como contexto en la instrucción, mejorando la precisión en jerga especializada.
- Búsqueda y QA sobre archivos de audio: la capacidad de audio question answering permite consultar directamente el contenido de grabaciones largas sin transcribirlas previamente a texto.
- Investigación lingüística y análisis multilingüe: con 40 idiomas, identificación de idioma y code-switching, es adecuado para corpus multilingües y estudios de variación lingüística.
- Moderación y compliance: el etiquetado de PII y la transcripción enriquecida facilitan la revisión automática de contenido de audio en flujos de cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 67,5 GB de pesos (tamaño del repo), por lo que requiere GPUs con al menos 80 GB de memoria (A100 80GB, H100 80GB) para cargar el modelo completo en BF16.
- Variante FP8: reduce el peso a aproximadamente la mitad, permitiendo despliegue en GPUs de 40-48 GB (A100 40GB, L40S, RTX 6000 Ada).
- Variante NVFP4: reduce aún más el peso, con potencial de ejecución en GPUs consumer de gama alta (RTX 4090 24GB) si el runtime lo soporta, aunque no se dispone de confirmación en la información proporcionada.
- Al ser un MoE con 4,3B parámetros activos, el throughput es comparativamente alto respecto a un modelo denso de 34B, pero no se dispone de cifras concretas de latencia o tokens por segundo.
- Opciones de despliegue: NeMo Speech (librería nativa), SGLang-Omni (cookbook disponible), y potencialmente vLLM o TGI si soportan la arquitectura híbrida Mamba-2; no se confirma soporte de llama.cpp u Ollama en la información disponible.
- No cabe en GPUs consumer de gama media en BF16; se requiere cuantización para hardware de menos de 40 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Transcribe-30B-A4B | 34B totales / 4,3B activos | 65.536 tokens | 40 | OpenMDW-1.1 | HuggingFace (BF16, FP8, NVFP4) |
| Whisper large-v3 | ≈1,55B | 30 s por segmento | ≈99 | MIT | HuggingFace, OpenAI API |
| SeamlessM4T v2 | ≈2,3B | no disponible | ≈100 (texto), ≈36 (voz) | CC BY-NC 4.0 | HuggingFace |
| Qwen2-Audio | ≈8,4B | no disponible | multilingüe (no especificado) | Apache 2.0 | HuggingFace |

La comparativa es orientativa: Whisper es un modelo ASR puro sin instrucciones ni diarización nativa; SeamlessM4T está orientado a traducción y tiene licencia no comercial; Qwen2-Audio es un modelo de audio-comprensión de menor tamaño. Nemotron-3.5-Transcribe destaca por su contexto de 65.536 tokens, su soporte de audio de hasta una hora y su licencia permisiva para uso comercial.

## Limitaciones y advertencias

- El modelo es offline: procesa grabaciones completas, no está diseñado para streaming en tiempo real.
- No se dispone de datos publicados sobre sesgos por idioma, acento o dominio; se recomienda evaluación propia antes de producción.
- Riesgo de alucinación en pasajes de audio con ruido, solapamiento de hablantes o idiomas de bajos recursos.
- La cobertura de 40 idiomas no implica calidad uniforme; los idiomas con menos datos de entrenamiento pueden presentar mayor tasa de error.
- El etiquetado y redacción de PII es una capacidad auxiliar y no debe considerarse un sistema de cumplimiento normativo completo.
- La licencia OpenMDW-1.1 permite uso comercial, pero conviene revisar sus términos completos para obligaciones de atribución o restricciones adicionales.
- El repositorio khaled5/... es un espejo del modelo oficial de NVIDIA; para producción se recomienda usar los repositorios oficiales nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B y sus variantes FP8/NVFP4.
- No se dispone de información sobre latencia, throughput ni requisitos exactos de memoria para las variantes cuantizadas.

## Enlaces

- HuggingFace (espejo): https://huggingface.co/khaled5/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- HuggingFace (oficial BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- HuggingFace (FP8): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-FP8
- HuggingFace (NVFP4): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Dataset Granary-v2: https://huggingface.co/datasets/nvidia/Granary-v2
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Repositorio NeMo Speech: https://github.com/NVIDIA-NeMo/Speech
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Demo en vivo: https://huggingface.co/spaces/nvidia/nemotron-transcribe
- Cookbook SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/nemotron_transcribe.html
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Paper SALM: https://arxiv.org/abs/2310.09424
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
