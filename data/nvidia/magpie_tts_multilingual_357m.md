# nvidia/magpie_tts_multilingual_357m

## Resumen

MagpieTTS Multilingual 357M es un modelo de síntesis de voz (text-to-speech) neuronal y extremo a extremo desarrollado por NVIDIA, publicado en Hugging Face bajo la librería NeMo Speech. Convierte texto en habla en 12 idiomas (árabe, chino, inglés, francés, alemán, hindi, italiano, japonés, coreano, portugués, español y vietnamita) manteniendo una identidad de voz consistente entre idiomas, mediante cinco voces en inglés (Aria, Jason, Leo, Sofia y John Van Stan, esta última de dominio público).

El modelo emplea una arquitectura transformer encoder–decoder que predice de forma autorregresiva tokens discretos de códec de audio, con predicción multi-codebook (típicamente 8 codebooks), frame stacking (factor 2) y un transformer local para el refinamiento de alta fidelidad. Los tokens predichos se decodifican a onda de audio mediante un códec congelado (NanoCodec, 22 kHz, 1,89 kbps, 21,5 fps). La versión más reciente, v2607 (julio de 2026), añadió árabe, coreano y portugués respecto a las versiones v2602 y v2512.

Su relevancia actual radica en que ofrece una capa de generación de voz dedicada, lista para uso comercial, que se integra en pipelines de agentes de voz en cascada (LLM → TTS), narración de audiolibros, doblaje y herramientas de accesibilidad, con soporte de normalización de texto, G2P basado en IPA para diccionarios personalizados y code-switching. En esta versión se ha eliminado la clonación de voz zero-shot por motivos de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder–decoder autorregresivo con predicción multi-codebook de tokens de códec y transformer local de refinamiento |
| Parametros totales | 284.200.199 en safetensors (la model card indica 364M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (soporta generación de texto largo mediante ventana deslizante) |
| Tipos de cuantizacion | no disponible (el repo incluye tag gguf) |
| Idiomas soportados | ar, de, en, es, fr, hi, it, ja, ko, pt, vi, zh (12 idiomas) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors, GGUF (tag), librería NeMo |

## Arquitectura y entrenamiento

MagpieTTS es un modelo TTS extremo a extremo con arquitectura transformer encoder–decoder que predice autorregresivamente tokens discretos de un códec de audio. Usa predicción multi-codebook (habitualmente 8 codebooks) con frame stacking de factor 2, y un transformer local que refina los frames apilados para mejorar la calidad de audio reduciendo la longitud de secuencia. Para estabilizar la alineación texto–audio incorpora priors de atención; para reforzar el condicionamiento usa classifier-free guidance (CFG); y para alinear la generación con preferencias emplea Group Relative Policy Optimization (GRPO). La decodificación final a onda se realiza con un códec de audio preentrenado y congelado, NanoCodec (22 kHz, 1,89 kbps, 21,5 fps).

El entrenamiento se apoya en un conjunto de datasets multilingües entre los que se incluyen MBZUAI/ClArTTS, tunis-ai/arabic_speech_corpus, mrfakename/Emilia-YODAS, MushanW/GLOBE_V2, nvidia/hifitts-2, ai4bharat/Kathbath, joujiboi/japanese-anime-speech, OpenSpeechHub/Common-Voice-17-Ja, amphion/Emilia-Dataset, seastar105/Emilia-YODAS-KO-filtered, firstpixel/pt-br_char y doof-ferb/infore1_25hours. No se especifica en la información disponible el número total de tokens ni la composición exacta del dataset. En inferencia soporta síntesis por lotes de enunciados completos y generación de texto largo mediante ventana deslizante.

## Capacidades

- Síntesis de voz multilingüe en 12 idiomas con identidad de voz consistente entre ellos.
- Cinco voces en inglés (Aria, Jason, Leo, Sofia y John Van Stan), con variaciones de género y tono emocional.
- Normalización de texto integrada para números, abreviaturas y caracteres especiales en los 12 idiomas.
- Soporte de G2P basado en IPA para diccionarios personalizados y code-switching, incluida la conversión inglés→katakana.
- Generación de audio de alta fidelidad mediante decodificación multi-codebook con transformer local y frame stacking.
- Síntesis por lotes de enunciados completos y generación de formato largo mediante ventana deslizante.
- Integración como capa de generación de voz en pipelines de agentes en cascada (texto de LLM → habla).
- No dispone de clonación de voz zero-shot (eliminada en esta versión por motivos de seguridad).
- No se documentan en la información disponible capacidades de tool calling, agentes autónomos ni visión/audio de entrada.

## Casos de uso

- Agentes de voz en cascada: el modelo actúa como capa TTS que convierte la salida de texto de un LLM en habla natural en tiempo real, integrándose sin modificar el manejo de audio aguas abajo.
- Audiolibros y narración de contenido: la generación de formato largo mediante ventana deslizante permite sintetizar textos extensos manteniendo la misma voz a lo largo de capítulos completos.
- Doblaje y localización: al mantener una identidad de voz consistente entre los 12 idiomas, permite producir versiones dobladas de un mismo contenido con una voz reconocible en cada mercado.
- Herramientas de accesibilidad: conversión de texto a voz para lectores de pantalla y aplicaciones asistivas, con normalización integrada de números y abreviaturas.
- Contenido multimedia interactivo: síntesis de voces expresivas con variaciones de género y tono emocional para videojuegos, vídeos explicativos y material formativo.
- Pronunciación de dominio específico: el soporte G2P con IPA y diccionarios personalizados permite fijar la pronunciación de nombres propios, términos técnicos y marcas.
- Contenido con mezcla de idiomas: el code-switching (incluido inglés→katakana) facilita la síntesis de frases que alternan idiomas dentro de una misma locución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara métricas CER y SSIM entre las métricas del modelo, pero no proporciona valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 284M parámetros en safetensors (aproximadamente 1,1 GB en fp32 y unos 0,6 GB en fp16 para los pesos del modelo), a lo que hay que sumar el códec NanoCodec y el resto de componentes del pipeline NeMo.
- GPU recomendadas: no disponible de forma explícita; al ser un modelo de NVIDIA distribuido a través de NeMo Speech, el despliegue se orienta a GPUs NVIDIA, pero no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: NeMo Speech (librería oficial), NIM de MagpieTTS en build.nvidia.com y los ejemplos de agentes de voz de NVIDIA. El repo incluye tag GGUF, pero no se detallan los runners compatibles (llama.cpp, Ollama, vLLM, TGI no se mencionan).
- Latencia y throughput: no disponibles. La model card destaca que el frame stacking reduce la longitud de secuencia para una generación más rápida, sin cifras concretas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos TTS comparables que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La clonación de voz zero-shot se ha eliminado en esta versión por motivos de seguridad; no es posible replicar una voz arbitraria a partir de una muestra.
- Solo se ofrecen cinco voces, todas en inglés; no se documentan voces nativas para el resto de idiomas.
- Riesgo de alucinación o de pronunciación incorrecta en textos con grafías ambiguas, siglas o dominios no cubiertos por la normalización y el G2P.
- Sesgos potenciales derivados de los datasets de entrenamiento (corpus de habla, audiolibros y contenido web); no se detallan análisis de sesgo en la información disponible.
- La licencia NVIDIA Open Model License es de tipo "other": conviene revisar sus términos exactos antes de un uso comercial, aunque la model card indica que el modelo está listo para uso comercial.
- El modelo está atado al ecosistema NeMo Speech y a un códec concreto (NanoCodec), lo que condiciona el despliegue fuera de dicho stack.
- No se especifican límites de longitud de contexto ni de número de caracteres por petición; el formato largo depende del mecanismo de ventana deslizante.
- No se documentan métricas de calidad objetivas (CER, SSIM) con valores numéricos, lo que dificulta evaluar su rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/magpie_tts_multilingual_357m
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/magpie_tts_multilingual_demo
- Repositorio NeMo Speech: https://github.com/NVIDIA-NeMo/Speech
- Códec NanoCodec: https://huggingface.co/nvidia/nemo-nano-codec-22khz-1.89kbps-21.5fps
- API empresarial MagpieTTS NIM: https://build.nvidia.com/nvidia/magpie-tts-multilingual
- Ejemplos de agentes de voz: https://github.com/NVIDIA/voice-agent-examples/tree/riva_voice_agent_example
- Nemotron (overview): https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/
- Nemotron (developer): https://developer.nvidia.com/nemotron
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license
- Checkpoint v2602: https://huggingface.co/nvidia/magpie_tts_multilingual_357m/tree/v2602
- Checkpoint v2512: https://huggingface.co/nvidia/magpie_tts_multilingual_357m/tree/v2512
- Papers citados (arXiv): 2509.21718, 2509.19592, 2502.05236, 2508.05835, 2506.04152, 2409.12117, 2406.17957
