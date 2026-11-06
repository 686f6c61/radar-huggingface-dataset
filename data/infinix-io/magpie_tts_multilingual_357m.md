# Infinix-io/magpie_tts_multilingual_357m

## Resumen

MagpieTTS Multilingual 357M es un modelo de síntesis de voz (text-to-speech) neuronal, extremo a extremo y multilingüe, desarrollado por NVIDIA. Emplea una arquitectura transformer encoder-decoder que predice de forma autorregresiva tokens discretos de un códec de audio, con predicción multi-codebook (habitualmente 8 codebooks), apilamiento de tramas (factor 2) y un transformer local para el refinamiento de alta fidelidad. El modelo sintetiza voz en 12 idiomas (árabe, chino, inglés, francés, alemán, hindi, italiano, japonés, coreano, portugués, español y vietnamita) manteniendo una identidad de hablante consistente mediante cinco voces en inglés: Aria, Jason, Leo, Sofia y John Van Stan.

La versión publicada en este repositorio corresponde a la variante v2607, que añade árabe, coreano y portugués respecto a los checkpoints anteriores (v2602 y v2512). El modelo está pensado como capa dedicada de generación de habla que se integra en pipelines de IA existentes sin modificar los modelos de lenguaje aguas arriba ni el tratamiento de audio aguas abajo, lo que lo hace relevante para agentes de voz en cascada, narración, doblaje y accesibilidad.

El checkpoint tiene 284.200.199 parámetros reales según los pesos en safetensors (la model card indica 364M), un repositorio de 2,4 GB y se distribuye bajo la NVIDIA Open Model License. Esta versión eliminó la capacidad de clonación de voz zero-shot por motivos de seguridad e incorporó soporte de G2P con IPA para diccionarios personalizados y cambio de código (code-switching), incluido inglés a katakana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder autorregresivo con predicción multi-codebook, frame stacking (factor 2) y transformer local |
| Parámetros totales | 284.200.199 (safetensors); la model card declara 364M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (etiqueta del repositorio); no se detallan variantes concretas |
| Idiomas soportados | ar, de, en, es, fr, hi, it, ja, ko, pt, vi, zh |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | Safetensors (PyTorch, librería NeMo); se menciona GGUF en las etiquetas |

## Arquitectura y entrenamiento

MagpieTTS sigue un esquema encoder-decoder transformer que genera de forma autorregresiva tokens discretos de un códec de audio. La predicción multi-codebook (típicamente 8 codebooks) se combina con apilamiento de tramas de factor 2 y un transformer local que refina las tramas apiladas, reduciendo la longitud de secuencia y acelerando la generación sin sacrificar calidad. Los tokens predichos se decodifican a forma de onda mediante un códec de audio preentrenado y congelado, NanoCodec (22 kHz, 1,89 kbps, 21,5 fps).

El entrenamiento incorpora priors de atención para estabilizar la alineación texto-audio, classifier-free guidance (CFG) para reforzar el condicionamiento y Group Relative Policy Optimization (GRPO) para alinear la generación con preferencias. El corpus de entrenamiento combina múltiples datasets públicos citados en la model card: MBZUAI/ClArTTS, tunis-ai/arabic_speech_corpus, mrfakename/Emilia-YODAS, MushanW/GLOBE_V2, nvidia/hifitts-2, ai4bharat/Kathbath, joujiboi/japanese-anime-speech, OpenSpeechHub/Common-Voice-17-Ja, amphion/Emilia-Dataset, seastar105/Emilia-YODAS-KO-filtered, firstpixel/pt-br_char y doof-ferb/infore1_25hours. No se especifica el número total de horas ni de tokens de entrenamiento.

## Capacidades

- Síntesis de voz multilingüe en 12 idiomas con identidad de hablante consistente entre idiomas.
- Cinco voces en inglés (Aria, Jason, Leo, Sofia y John Van Stan) con tonos emocionales y variación de género.
- Normalización de texto integrada para números, abreviaturas y caracteres especiales en los 12 idiomas.
- Soporte de G2P con IPA para diccionarios personalizados y pronunciación específica de dominio.
- Cambio de código (code-switching), incluido inglés a katakana.
- Síntesis por lotes de enunciados completos y generación de texto largo mediante ventana deslizante.
- Decodificación eficiente de alta fidelidad mediante transformer local con frame stacking.
- Integración como capa de generación de habla en pipelines existentes (agentes de voz en cascada, LLM a voz).
- No dispone de clonación de voz zero-shot en esta versión (eliminada por seguridad).

## Casos de uso

- Agentes de voz en cascada: el modelo convierte la salida de texto de un LLM en habla natural en tiempo real, actuando como capa TTS dedicada sin alterar el resto del pipeline.
- Narración de audiolibros y contenido: la generación de texto largo mediante ventana deslizante permite sintetizar capítulos completos manteniendo la voz del hablante.
- Doblaje y localización: las cinco voces consistentes entre 12 idiomas permiten producir pistas de voz para vídeo y contenidos multimedia en múltiples mercados.
- Herramientas de accesibilidad: lectura en voz alta de contenido textual con normalización de números y abreviaturas para usuarios con discapacidad visual.
- Medios interactivos y videojuegos: síntesis de diálogos con tonos emocionales y variación de género para personajes.
- Pronunciación de dominio específico: el G2P con IPA y los diccionarios personalizados permiten corregir términos técnicos, marcas o nombres propios en aplicaciones médicas, legales o de soporte.
- Contenido mixto de idiomas: el soporte de code-switching (incluido inglés a katakana) facilita aplicaciones para comunidades bilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara las métricas CER y SSIM en los metadatos, pero no incluye valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 284M parámetros en safetensors, el peso en FP16 ronda los 0,6 GB, por lo que el consumo vendrá dominado por el códec y el runtime de NeMo.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, el modelo es apto para GPU de consumo.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint (2,4 GB de repositorio), aunque no se confirma en la documentación.
- Opciones de despliegue: NeMo Speech (librería oficial), MagpieTTS NIM en build.nvidia.com, y formato GGUF según las etiquetas del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La clonación de voz zero-shot fue eliminada por motivos de seguridad; no es posible replicar voces arbitrarias.
- Solo se ofrecen cinco voces, todas en inglés, lo que limita la variedad de hablantes en otros idiomas.
- Riesgo de alucinación o pronunciación incorrecta en textos con G2P no cubierto o dominios muy especializados.
- No se documentan sesgos de género, acento o idioma; deben evaluarse antes de producción.
- La licencia NVIDIA Open Model License impone condiciones específicas para uso comercial; es necesario revisar sus términos.
- No se especifican la longitud de contexto ni el número de horas de entrenamiento, lo que dificulta estimar el rendimiento en textos muy largos.
- El modelo está pensado para síntesis de habla; no realiza comprensión semántica ni razonamiento.

## Enlaces

- [Hugging Face: Infinix-io/magpie_tts_multilingual_357m](https://huggingface.co/Infinix-io/magpie_tts_multilingual_357m)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/nvidia/magpie_tts_multilingual_demo)
- [NVIDIA NeMo Speech (GitHub)](https://github.com/NVIDIA-NeMo/Speech)
- [MagpieTTS NIM](https://build.nvidia.com/nvidia/magpie-tts-multilingual)
- [NVIDIA voice-agent-examples](https://github.com/NVIDIA/voice-agent-examples/tree/riva_voice_agent_example)
- [NanoCodec](https://huggingface.co/nvidia/nemo-nano-codec-22khz-1.89kbps-21.5fps)
- [NVIDIA Open Model License](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license)
- [Nemotron: overview](https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/)
- [Nemotron: developer](https://developer.nvidia.com/nemotron)
- Papers citados en los metadatos: arXiv 2509.21718, 2509.19592, 2502.05236, 2508.05835, 2506.04152, 2409.12117, 2406.17957
