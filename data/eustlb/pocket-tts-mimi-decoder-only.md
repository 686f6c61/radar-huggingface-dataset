# eustlb/pocket-tts-mimi-decoder-only

## Resumen

`eustlb/pocket-tts-mimi-decoder-only` es la mitad decodificadora del codec de audio Mimi que utiliza Pocket TTS, el sistema de síntesis de voz de Kyutai. El modelo ha sido convertido al formato de Hugging Face Transformers (`PocketTTSAudioTokenizerModel` sin su codificador) por el usuario eustlb, a partir de los tensores `mimi.*` del lado decodificador de `kyutai/pocket-tts`, mediante el script `convert_pocket_tts_to_hf.py`.

Su función es concreta: recibe latentes a una frecuencia de trama de 12,5 Hz y los convierte en audio a 24 kHz. Con 10.305.313 parámetros (~10,3 M), es un componente muy ligero, pensado para integrarse como última etapa de un pipeline de síntesis de voz o para experimentar con representaciones latentes de audio en investigación.

Es relevante ahora porque expone en el ecosistema Transformers una pieza del stack de Pocket TTS que de otro modo quedaría embebida dentro del modelo completo, y porque su tamaño permite ejecutarla en CPU. La contrapartida es que, al carecer de codificador, no puede procesar audio de entrada ni clonar voces; para eso existe la versión completa del codec, `eustlb/pocket-tts-mimi`, publicada con acceso restringido (gated).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador de codec neuronal de audio Mimi (sin codificador); transforma latentes de 12,5 Hz en audio a 24 kHz |
| Parámetros totales | 10.305.313 (~10,3 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (codec de audio); el ejemplo del card procesa 25 tramas de latentes, equivalentes a 2 s a 12,5 Hz |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no aplica / no disponible (modelo de audio; el card no declara idiomas) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo es el decodificador del codec Mimi de Kyutai, aislado del resto del sistema Pocket TTS. Toma como entrada un tensor de latentes con forma `(batch, frames, latent_dim)` —el ejemplo del card usa `(1, 25, 32)`, es decir, 25 tramas de 32 dimensiones— y devuelve `audio_values` muestreados a 24 kHz. La frecuencia de trama de 12,5 Hz implica una trama cada 80 ms de audio.

No se ha publicado en la información disponible ningún detalle sobre el dataset de entrenamiento, el número de tokens o muestras utilizadas, la composición de los datos ni la existencia de fases de RLHF o DPO. La model card únicamente documenta el origen de los pesos (los tensores `mimi.*` del lado decodificador de `kyutai/pocket-tts`, convertidos con `convert_pocket_tts_to_hf.py`) y enlaza al repositorio original `kyutai-labs/pocket-tts` para la implementación de referencia.

## Capacidades

- Decodificación de latentes de audio a波形... (corrección: decodificación de latentes a forma de onda PCM a 24 kHz).
- Integración nativa con Transformers mediante `AutoModel.from_pretrained` y la clase `PocketTTSAudioTokenizerModel`.
- Ejecución sobre latentes generados por Pocket TTS o por cualquier otro modelo generativo que produzca representaciones en el espacio latente de Mimi.
- Compatible con despliegue en endpoints (etiqueta `endpoints_compatible` del repositorio).
- No codifica audio: no acepta formas de onda de entrada al carecer de codificador.
- No permite clonación de voz, ni siquiera con audio de referencia.
- No ofrece generación de texto, razonamiento, código, matemáticas, visión, tool calling ni comportamiento de agente.

## Casos de uso

- Segunda etapa de un pipeline de síntesis de voz: un modelo generador de latentes (por ejemplo, Pocket TTS) produce representaciones a 12,5 Hz y este decodificador las convierte en audio reproducible a 24 kHz, separando claramente generación y síntesis.
- Investigación sobre codecs neuronales: al estar aislado el decodificador, permite estudiar cómo se distribuye la salida para latentes sintéticos (el propio card propone `torch.randn(1, 25, 32)`) y analizar la respuesta del decodificador fuera de distribución.
- Sustitución de la etapa de decodificación en un stack existente que ya genere latentes Mimi, sin necesidad de cargar el codec completo ni solicitar acceso al repositorio con gating.
- Prototipado y demos en CPU: con ~10,3 M de parámetros, se puede integrar en notebooks, tests automatizados o servicios ligeros sin GPU dedicada.
- Depuración y análisis de artefactos: al separar el decodificador del codificador se puede aislar si un problema de calidad (ruido, clipping, bandas) proviene de los latentes de entrada o de la reconstrucción final.
- Evaluación comparativa de generadores de latentes: usar un decodificador fijo como referencia permite comparar distintos modelos generativos de representaciones de audio bajo una misma etapa de síntesis.
- Ajuste fino del decodificador sobre un dominio acústico concreto, si se dispone de pares latente-audio; el formato Transformers facilita el entrenamiento, aunque el card no documenta recetas de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 41 MB en fp32 y unos 21 MB en fp16/bf16 solo para los pesos (cálculo propio a partir de los 10.305.313 parámetros); el consumo real depende de la longitud de audio generada y del tamaño de lote.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (serie GTX 10xx en adelante, RTX 20/30/40) es más que suficiente; A100 o H100 no aportan ventaja relevante por el tamaño del modelo.
- Cabe en GPU consumer: sí, en todas las disponibles comercialmente, y también en CPU.
- Opciones de despliegue: Transformers con PyTorch (`AutoModel.from_pretrained(..., device_map="auto")`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a codecs de audio de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Función | Licencia | Disponibilidad |
|---|---|---|---|---|
| `eustlb/pocket-tts-mimi-decoder-only` | 10.305.313 | Solo decodificador (latentes → audio 24 kHz) | cc-by-4.0 | Público |
| `eustlb/pocket-tts-mimi` | no disponible | Codec completo (codificador + decodificador) | no disponible en la información | Restringido (gated) |
| `kyutai/pocket-tts` | no disponible | Modelo TTS de Kyutai del que se extraen los pesos | no disponible en la información | Público |
| `kyutai/pocket-tts-without-voice-cloning` | no disponible | TTS sin clonación de voz; no puede codificar audio | no disponible en la información | Público |

La diferencia clave frente al codec completo es la ausencia de codificador: este modelo solo reconstruye, no analiza. Frente a los modelos TTS de la familia, no genera latentes por sí mismo, sino que consume los que produce otro componente.

## Limitaciones y advertencias

- No puede codificar audio: al carecer de codificador, no acepta formas de onda de entrada ni puede extraer latentes de un audio existente.
- No permite clonación de voz, ni siquiera disponiendo de muestras de referencia.
- La calidad de salida depende por completo de los latentes de entrada; con latentes aleatorios o fuera de distribución la salida será ruido o audio no inteligible, no una "alucinación" en sentido textual.
- No es un modelo de lenguaje: no genera texto, código, razonamiento ni admite tool calling o flujos de agente.
- No se documentan sesgos específicos; al ser un decodificador de voz, puede reflejar las características acústicas del corpus con el que se entrenó el codec original, dato no disponible.
- Licencia CC-BY-4.0: permite uso comercial con obligación de atribución; conviene revisar los términos exactos antes de integrarlo en producción.
- El card establece usos prohibidos explícitos: suplantación o clonación de voz sin consentimiento legal, desinformación (noticias falsas, llamadas fraudulentas, presentar audio generado como grabación real), y contenido ilegal, difamatorio, acosador, discriminatorio o que vulnere la privacidad.
- Es una conversión comunitaria (autor eustlb), no una publicación oficial de Kyutai; el repositorio no registra descargas ni valoraciones en el momento de la consulta, por lo que no hay validación externa pública.
- No se documentan limitaciones idiomáticas porque el modelo no está condicionado por idioma; el idioma vendrá determinado por el sistema que genere los latentes.

## Enlaces

- [eustlb/pocket-tts-mimi-decoder-only en Hugging Face](https://huggingface.co/eustlb/pocket-tts-mimi-decoder-only)
- [Modelo base: kyutai/pocket-tts](https://huggingface.co/kyutai/pocket-tts)
- [Codec completo: eustlb/pocket-tts-mimi (gated)](https://huggingface.co/eustlb/pocket-tts-mimi)
- [kyutai/pocket-tts-without-voice-cloning](https://huggingface.co/kyutai/pocket-tts-without-voice-cloning)
- [Código original: kyutai-labs/pocket-tts](https://github.com/kyutai-labs/pocket-tts)
- [Documentación de Transformers: Pocket TTS audio tokenizer](https://huggingface.co/docs/transformers/main/en/model_doc/pocket_tts_audio_tokenizer)
