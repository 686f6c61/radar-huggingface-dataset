# ASLP-lab/M5-TTS

## Resumen

M5-TTS es un sistema de síntesis de voz (text-to-speech) compacto, multilingüe y multidialecto desarrollado conjuntamente por ASLP@NPU y LycheeAI Lab. El modelo resuelve el problema de generar voz de alta calidad con clonación por referencia en ocho lenguas y dialectos (mandarín, inglés, alemán, francés, japonés, coreano, cantonés y sichuanés) con un coste computacional muy reducido: combina un backbone temporal de 30M de parámetros con un decodificador local de predicción multi-token de 20M, y genera audio a 24 kHz mediante 16 codebooks a 12,5 fotogramas por segundo.

El checkpoint publicado en este repositorio es la variante de clonación por referencia (reference-based voice cloning): requiere un audio de referencia y su transcripción para replicar la voz, y soporta condicionamiento por acento para cantonés y sichuanés. Para síntesis con hablantes predefinidos sin audio de referencia existe un checkpoint separado, M5-TTS-50M-CustomVoice.

Es relevante ahora porque demuestra que es posible un TTS multilingüe con clonación de voz en un paquete de menos de 150M de parámetros totales (repositorio de 0,3 GB), lo que lo hace desplegable en hardware modesto, con licencia Apache-2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone temporal (30M) + decodificador local de predicción multi-token (20M); codec de audio separado basado en Qwen (12 Hz) |
| Parametros totales | 149.850.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16 para inferencia según quickstart) |
| Idiomas soportados | Chino mandarín, inglés, alemán, francés, japonés, coreano, cantonés, sichuanés |
| Licencia | Apache-2.0 (el codec de audio derivado de Qwen conserva su atribución upstream) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

M5-TTS es un sistema TTS neuronál compuesto por dos módulos principales: un backbone temporal de 30M de parámetros y un decodificador local de predicción multi-token (multi-token prediction) de 20M de parámetros. La generación de audio se realiza mediante 16 codebooks a una tasa de 12,5 fotogramas por segundo, produciendo voz a 24 kHz. El codec de voz es un componente separado (M5-TTS-Audio-Tokenizer, derivado de Qwen) que se descarga automáticamente junto con el tokenizador de texto.

El modelo soporta condicionamiento por acento mediante los parámetros `--lang` y `--accent`: el cantonés se invoca como `--lang Chinese --accent yue` y el sichuanés como `--lang Chinese --accent chuan`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Síntesis de voz multilingüe en chino mandarín, inglés, alemán, francés, japonés y coreano.
- Condicionamiento dialectal para cantonés (`yue`) y sichuanés (`chuan`).
- Clonación de voz por referencia: a partir de un audio de referencia y su transcripción, replica el timbre y estilo de la voz.
- Generación de audio a 24 kHz con 16 codebooks y 12,5 fotogramas por segundo.
- Inferencia en BF16 sobre GPU NVIDIA con CUDA y flash-attn 2.7.3.
- No se documenta soporte de tool calling, agentes, visión ni audio de entrada más allá del prompt de referencia.

## Casos de uso

- Clonación de voz para doblaje y localización: dado un audio de referencia del actor original y su transcripción, el modelo puede generar la misma voz en inglés, alemán, francés, japonés o coreano, lo que resulta adecuado por su soporte multilingüe y su bajo coste computacional.
- Audiolibros y narración personalizada: con una muestra de voz del narrador se puede sintetizar texto largo en mandarín o inglés manteniendo la identidad vocal, gracias al decodificador multi-token que acelera la generación.
- Asistentes de voz para contenido dialectal: el condicionamiento por acento permite generar voz en sichuanés o cantonés, útil para aplicaciones de accesibilidad y medios regionales en China.
- Prototipado rápido de interfaces de voz: al ocupar 0,3 GB y menos de 150M de parámetros, se puede desplegar en una GPU de consumo para demos y pruebas de producto.
- Generación de voces para vídeos y pódcast: la clonación por referencia permite mantener una voz consistente entre episodios sin necesidad de un estudio de grabación.
- Investigación en TTS multilingüe: el modelo sirve como base reproducible (Apache-2.0) para experimentos de clonación de voz con acentos y comparación de arquitecturas compactas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 149,85M de parámetros en BF16 el peso del modelo ronda los 0,3 GB, por lo que la VRAM necesaria para los pesos es mínima y el grueso del consumo vendrá del codec de audio y del runtime.
- GPU recomendadas: GPU NVIDIA con soporte BF16 y driver CUDA compatible (el quickstart exige una GPU BF16-capable); no se especifican modelos concretos.
- GPU de consumo: por el tamaño del repositorio (0,3 GB) es plausible que quepa en GPU de consumo, pero no se confirma en la información disponible.
- Despliegue: el flujo oficial es el repositorio de código (`infer_clone.py`) con Python 3.10 en Linux, `requirements.txt` y `flash-attn==2.7.3`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A modo de referencia estructural, M5-TTS se posiciona como un TTS compacto (149,85M de parámetros, 24 kHz, 8 lenguas/dialectos, Apache-2.0) frente a sistemas TTS de mayor tamaño habituales en el ecosistema open source; no obstante, no se aportan cifras de comparación verificables.

## Limitaciones y advertencias

- La clonación de voz exige consentimiento: el propio autor indica que solo se deben clonar voces propias o con permiso explícito; el uso indebido puede vulnerar derechos de imagen y voz.
- Riesgo de alucinación y artefactos acústicos: no se documentan métricas de calidad (MOS, WER) ni tasas de error en la información disponible.
- Idiomas: aunque se listan ocho lenguas y dialectos, el repositorio de clonación soporta explícitamente chino, inglés, alemán, francés, japonés y coreano, con cantonés y sichuanés solo como condicionamiento de acento.
- Licencia: Apache-2.0 permite uso comercial, pero el codec de audio derivado de Qwen conserva su atribución upstream, que debe respetarse.
- Dependencia de hardware: requiere GPU NVIDIA con BF16 y flash-attn 2.7.3, lo que limita el despliegue en entornos sin GPU o con drivers incompatibles.
- Contexto y longitud de entrada: no se especifica la longitud máxima de texto ni de audio de referencia soportada.
- Madurez: el repositorio tiene pocas descargas (198) y likes (3), por lo que la validación comunitaria es todavía limitada.

## Enlaces

- Hugging Face: https://huggingface.co/ASLP-lab/M5-TTS
- GitHub: https://github.com/ASLP-lab/M5-TTS
- Demo: https://aslp-lab.github.io/M5-TTS-Demo-Page/
- Space: https://huggingface.co/spaces/ASLP-lab/M5-TTS-Space
- Colección de modelos: https://huggingface.co/collections/ASLP-lab/m5-tts
- Checkpoint con hablantes predefinidos: https://huggingface.co/ASLP-lab/M5-TTS-50M-CustomVoice
- Tokenizador de audio: https://huggingface.co/ASLP-lab/M5-TTS-Audio-Tokenizer
- Aviso de terceros del codec: https://github.com/ASLP-lab/M5-TTS/blob/main/m5/codec_qwen12hz/NOTICE
