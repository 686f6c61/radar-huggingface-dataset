# Infinix-ai/magpie_tts_multilingual_357m

## Resumen

MagpieTTS Multilingual 357M es un modelo de síntesis de voz (text-to-speech) neuronal y extremo a extremo desarrollado por NVIDIA. Convierte texto en audio en 12 idiomas (árabe, chino, inglés, francés, alemán, hindi, italiano, japonés, coreano, portugués, español y vietnamita) manteniendo una identidad de voz consistente entre idiomas mediante cinco voces en inglés: Aria, Jason, Leo, Sofia y John Van Stan. Emplea una arquitectura transformer encoder-decoder que predice de forma autorregresiva tokens discretos de códec de audio.

El modelo resuelve el problema de la síntesis multilingüe con voces coherentes para aplicaciones como agentes de voz en cascada, narración de audiolibros, doblaje y localización, o herramientas de accesibilidad. Su diseño como capa dedicada de generación de voz permite integrarlo en pipelines existentes sin modificar los modelos de lenguaje aguas arriba ni el tratamiento de audio aguas abajo.

La versión publicada es la v2607 (julio de 2026), que añade árabe, coreano y portugués respecto a versiones anteriores (v2602 y v2512). Incluye normalización de texto integrada para los 12 idiomas, soporte de G2P con IPA para diccionarios personalizados y code-switching, y ha eliminado la capacidad de clonación de voz zero-shot por motivos de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder autorregresivo con predicción multi-codebook y transformer local |
| Parametros totales | 284.200.199 (safetensors); la model card indica 364M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (soporta generación de texto largo mediante ventana deslizante) |
| Tipos de cuantizacion | GGUF (tag del repositorio); no se detallan variantes concretas |
| Idiomas soportados | ar, de, en, es, fr, hi, it, ja, ko, pt, vi, zh |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | Safetensors (PyTorch/NeMo), GGUF |

## Arquitectura y entrenamiento

MagpieTTS sigue una arquitectura transformer encoder-decoder que predice de forma autorregresiva tokens discretos de un códec de audio. Utiliza predicción multi-codebook (típicamente 8 codebooks) con frame stacking (factor 2) y un transformer local para el refinamiento fino del audio de alta fidelidad. Para mejorar la robustez y el control, el entrenamiento incorpora priors de atención para un alineamiento estable texto-audio, classifier-free guidance (CFG) para un condicionamiento más fuerte y Group Relative Policy Optimization (GRPO) para una generación alineada con preferencias. Los tokens de códec predichos se decodifican a forma de onda mediante un códec de audio preentrenado congelado (NanoCodec, 22 kHz, 1,89 kbps, 21,5 fps).

El modelo se entrenó con un conjunto de datos multilingüe que incluye ClArTTS, Arabic Speech Corpus, Emilia-YODAS, GLOBE V2, HiFiTTS-2, Kathbath, Japanese Anime Speech, Common Voice 17 Ja, Emilia Dataset, Emilia-YODAS-KO-filtered, PT-BR char e Infore1. La model card no especifica el número total de tokens de entrenamiento ni la composición exacta del dataset. En inferencia soporta síntesis por lotes de enunciados completos y generación de texto largo mediante un mecanismo de ventana deslizante.

## Capacidades

- Síntesis de voz multilingüe en 12 idiomas con identidad de voz consistente entre idiomas.
- Cinco voces en inglés (Aria, Jason, Leo, Sofia y John Van Stan) con tonos emocionales y variaciones de género.
- Normalización de texto integrada para números, abreviaturas y caracteres especiales en los 12 idiomas.
- Soporte de G2P con IPA para diccionarios personalizados y code-switching, incluido el cambio inglés-katakana.
- Generación de enunciados completos por lotes y generación de texto largo mediante ventana deslizante.
- Decodificación de alta fidelidad eficiente mediante transformer local con frame stacking (factor 2).
- Integración como capa de generación de voz en pipelines de agentes de voz en cascada.
- No soporta clonación de voz zero-shot (eliminada por motivos de seguridad).

## Casos de uso

- Agentes de voz en cascada: el modelo convierte la salida de texto de un LLM en habla natural en tiempo real, integrándose como capa de generación de voz sin modificar el modelo de lenguaje ni el tratamiento de audio posterior.
- Narración de audiolibros y contenido: permite generar narraciones largas mediante el mecanismo de ventana deslizante, manteniendo una voz consistente a lo largo de capítulos y en distintos idiomas.
- Doblaje y localización: sintetiza la misma voz en 12 idiomas, lo que facilita pipelines de localización con identidad de hablante coherente entre versiones.
- Herramientas de accesibilidad: convierte texto en voz para lectores de pantalla y aplicaciones de asistencia con soporte multilingüe y normalización de números y abreviaturas.
- Medios interactivos: genera voces expresivas con tonos emocionales y variaciones de género para videojuegos, asistentes y contenido interactivo.
- Contenido con pronunciación específica: el soporte de G2P con IPA y diccionarios personalizados permite controlar la pronunciación de términos de dominio y mezclar idiomas en una misma locución.
- Atención al cliente automatizada: integrado en un agente conversacional, sintetiza respuestas multi-turno en el idioma del usuario con una voz estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara métricas CER y SSIM en los metadatos, pero no incluye tablas con valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 284M parámetros en precisión completa (fp32) el peso ronda 1,1 GB, y en fp16 aproximadamente 0,6 GB, a lo que hay que sumar el códec NanoCodec congelado y las activaciones.
- GPU recomendadas: no disponible. El modelo se distribuye para el framework NeMo Speech de NVIDIA y existe una API empresarial (MagpieTTS NIM) en build.nvidia.com.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de parámetros, pero no se confirma en la información disponible.
- Opciones de despliegue: NeMo Speech (PyTorch), GGUF (tag del repositorio), MagpieTTS NIM (API empresarial) y el Space de demostración de Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparativas con otros modelos TTS que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- La clonación de voz zero-shot se ha eliminado por motivos de seguridad; no es posible replicar voces arbitrarias.
- Solo ofrece cinco voces, todas en inglés; la identidad de voz se mantiene entre idiomas, pero la variedad de hablantes es limitada.
- Riesgo de alucinación y errores de pronunciación en términos fuera del vocabulario o en code-switching no cubierto por el G2P.
- La normalización de texto y el G2P pueden fallar en abreviaturas o dominios muy específicos; se recomienda validar con diccionarios personalizados.
- La licencia NVIDIA Open Model License impone condiciones para uso comercial; es necesario revisar sus términos antes de desplegar en producción.
- No se han publicado benchmarks en la información disponible, por lo que el rendimiento real por idioma no está cuantificado.
- El uso de la voz pública John Van Stan puede estar sujeto a condiciones adicionales derivadas de su origen en Librivox.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-ai/magpie_tts_multilingual_357m
- Modelo original de NVIDIA: https://huggingface.co/nvidia/magpie_tts_multilingual_357m
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/magpie_tts_multilingual_demo
- Repositorio NeMo Speech: https://github.com/NVIDIA-NeMo/Speech
- API empresarial MagpieTTS NIM: https://build.nvidia.com/nvidia/magpie-tts-multilingual
- Ejemplos de agentes de voz: https://github.com/NVIDIA/voice-agent-examples/tree/riva_voice_agent_example
- Códec NanoCodec: https://huggingface.co/nvidia/nemo-nano-codec-22khz-1.89kbps-21.5fps
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license
- Nemotron (visión general): https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/
- Nemotron (desarrolladores): https://developer.nvidia.com/nemotron
