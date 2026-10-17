# Allinsama/Qwen__Qwen3-TTS-12Hz-0.6B-Base

## Resumen

Qwen3-TTS-12Hz-0.6B-Base es un punto de control de síntesis de voz (TTS) de la familia Qwen3-TTS, desarrollada por el equipo Qwen de Alibaba. El repositorio indicado pertenece a Allinsama y reproduce la model card del checkpoint oficial Qwen/Qwen3-TTS-12Hz-0.6B-Base. Convierte texto en audio y está orientado a clonación de voz rápida a partir de un audio de referencia; la familia cubre 10 idiomas y se presenta como controlable, robusta y apta para streaming.

La arquitectura es un modelo de lenguaje discreto multi-codebook con el tokenizador acústico Qwen3-TTS-Tokenizer-12Hz, que opera a 12 Hz y combina compresión acústica con modelado semántico de alta dimensionalidad. El nombre comercial indica 0,6B, pero el recuento real de safetensors es de 914.643.008 parámetros (aproximadamente 0,91B). La model card declara entrenamiento con más de 5 millones de horas de audio en 10 idiomas y una latencia de streaming de hasta 97 ms.

Es relevante porque ofrece TTS multilingüe y clonación de voz end-to-end con un tamaño que puede ejecutarse en GPUs de consumo bajo licencia Apache-2.0. Sin embargo, no publica benchmarks de calidad ni detalles de entrenamiento, y el repositorio es un espejo no oficial con 0 descargas en el momento de la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LM discreto multi-codebook end-to-end con tokenizador Qwen3-TTS-Tokenizer-12Hz |
| Parámetros totales | 914.643.008 según safetensors; el nombre comercial indica 0,6B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el ejemplo oficial usa bfloat16 |
| Idiomas soportados | Chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano (zh, en, ja, ko, de, fr, ru, pt, es, it) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de LM discreto multi-codebook para TTS end-to-end. En lugar de un pipeline en cascada, modela directamente códigos acústicos discretos producidos por Qwen3-TTS-Tokenizer-12Hz; este tokenizador opera a 12 Hz y se describe como una compresión acústica eficiente con modelado semántico de alta dimensionalidad. La model card no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni si el LM es un transformer puro; solo indica la arquitectura multi-codebook y el uso de FlashAttention 2 en el ejemplo de inferencia.

Se entrenó con más de 5 millones de horas de voz en 10 idiomas y perfiles dialectales. No hay datos sobre número de tokens, composición del dataset, etapas de alineamiento, RLHF/DPO ni fine-tuning del checkpoint Base. La clonación de voz se realiza con audio de referencia y su texto; la familia declara clonación con 3 segundos de audio y control por descripciones en lenguaje natural, pero la model card de este checkpoint Base solo documenta explícitamente la clonación rápida.

## Capacidades

- Síntesis de voz end-to-end a partir de texto, con salida de audio a la frecuencia de muestreo que devuelve el modelo (no especificada).
- Clonación de voz con audio de referencia; la familia declara clonación con 3 segundos de audio. El ejemplo oficial usa `ref_audio` y `ref_text`.
- Soporte multilingüe en 10 idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Generación en streaming con latencia declarada de hasta 97 ms end-to-end; no se especifican hardware ni condiciones de medida.
- Perfiles de voz dialectales: la model card menciona múltiples perfiles dialectales, sin listar lenguas o dialectos concretos.
- Control por instrucciones en lenguaje natural: capacidad declarada para la familia Qwen3-TTS; no se confirma que este checkpoint Base exponga todas esas funciones.
- Manejo de texto con símbolos: el ejemplo oficial incluye una ecuación y un emoticono, pero no se garantiza su pronunciación correcta.
- No soporta tool calling, function calling, agentes, multi-step reasoning ni visión; es un modelo TTS, no un LLM conversacional.

## Casos de uso

- Atención al cliente telefónica: se combina con ASR y un LLM para generar respuestas; el TTS reproduce una voz de marca clonada y el streaming de 97 ms reduce la latencia percibida. Adecuado por multilingüismo y clonación, aunque la gestión del diálogo recae en otros componentes.
- Doblaje y localización de vídeo: clonar la voz del actor original y generar pistas en los 10 idiomas soportados. Requiere consentimiento explícito y revisión de pronunciación; útil para prototipos y producción con control de calidad.
- Audiolibros y podcasts: generar narración con una voz consistente mediante un audio de referencia. Al no documentarse la longitud de contexto, conviene dividir el texto en fragmentos y mantener la misma referencia entre chunks.
- E-learning multilingüe: crear lecciones en varios idiomas con la voz de un instructor. Es necesario revisar términos técnicos, siglas y símbolos antes de publicar.
- Videojuegos y NPC: pregenerar líneas de diálogo o sintetizarlas en streaming. El tamaño de 0,91B permite inferencia en GPU de consumo, pero la concurrencia y el throughput no están documentados.
- Accesibilidad: generar voces personalizadas para lectores de pantalla o comunicadores. Debe obtenerse consentimiento explícito de la persona cuya voz se clona y limitar el uso a los fines autorizados.
- Marketing y pruebas A/B: producir variantes de locución con distintas voces clonadas. La licencia Apache-2.0 facilita el uso comercial, sujeto a los derechos de las voces y de los datos de entrenamiento.
- Prototipos de agentes de voz: integrar el TTS con un LLM y un ASR; el modelo aporta salida de audio de baja latencia, no razonamiento ni planificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Métrica | Valor |
|---|---|
| Calidad TTS (MOS, WER, similitud de hablante) | No disponible |
| Latencia declarada | 97 ms end-to-end en streaming; hardware y condiciones no especificados |
| Comparación cuantitativa con modelos similares | No disponible |

## Requisitos de hardware

- Pesos en bfloat16: 914.643.008 × 2 bytes ≈ 1,83 GB. En FP32 ≈ 3,66 GB. El repositorio ocupa 2,5 GB.
- VRAM estimada para inferencia: 3-5 GB en bfloat16 con lote pequeño y FlashAttention 2; 6-8 GB si se usa FP32 o se aumenta el lote. Es una estimación propia a partir del número de parámetros, no publicada por el autor.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4090; A100/H100 para despliegues con concurrencia. Cabe en GPUs de consumo de 8 GB en bfloat16, aunque 8 GB es ajustado.
- Despliegue: paquete `qwen-tts` sobre PyTorch/CUDA; FlashAttention 2 es opcional. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni GGUF.
- Latencia: 97 ms declarados en streaming; no se especifica GPU, lote ni longitud de texto. Throughput y concurrencia no disponibles.
- CPU: no documentado; por tamaño podría probarse, pero sin garantías de latencia para producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-Base (este repo) | 914,6M | No disponible | 10 | Apache-2.0 | HuggingFace (Allinsama) |
| Qwen3-TTS-12Hz-0.6B-Base oficial | 914,6M | No disponible | 10 | Apache-2.0 | HuggingFace (Qwen) |
| Alternativas comparables de TTS multilingüe con clonación | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de alternativas en la información proporcionada; no se incluyen cifras de parámetros, contexto o rendimiento para no inventarlas.

## Limitaciones y advertencias

- El repositorio pertenece a Allinsama, no a Qwen; es un espejo no oficial con 0 descargas y 0 likes en el momento de la ficha. Conviene verificar la integridad de los pesos y contrastar con el repositorio oficial.
- No hay benchmarks publicados de MOS, WER, similitud de hablante ni comparaciones independientes; la calidad real no está verificada.
- La clonación de voz permite usos de suplantación y deepfakes. Es imprescindible obtener consentimiento explícito y cumplir la normativa de protección de datos y derechos de imagen.
- La licencia Apache-2.0 permite uso comercial del código y los pesos, pero no concede derechos sobre las voces clonadas ni sobre los datos de entrenamiento.
- La longitud de contexto no está documentada; para textos largos hay que trocear y gestionar la continuidad de prosodia y voz.
- Solo se declaran 10 idiomas; no se documenta code-switching, acentos concretos ni calidad por dialecto.
- Este checkpoint Base está orientado a clonación; no se confirma que incluya control por descripciones en lenguaje natural, aunque la familia lo anuncie.
- Existe una discrepancia entre el nombre comercial 0,6B y los 914.643.008 parámetros reales; hay que dimensionar hardware con el dato de safetensors.
- No es un modelo de chat ni de razonamiento: no soporta tool calling, agentes, visión ni multi-step reasoning.
- Riesgo de errores de pronunciación, omisiones, artefactos y prosodia inestable, especialmente con números, siglas, ecuaciones y emoticonos. No se documentan filtros de seguridad.
- La latencia de 97 ms no especifica GPU, lote ni longitud de texto; no debe asumirse para cualquier despliegue.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Allinsama/Qwen__Qwen3-TTS-12Hz-0.6B-Base
- Checkpoint oficial referenciado: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Technical report en HuggingFace Papers: https://huggingface.co/papers/2601.15621
- Preprint en arXiv: https://arxiv.org/abs/2601.15621
- Repositorio GitHub: https://github.com/QwenLM/Qwen3-TTS
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen3-TTS
