# lucca3447/Makise_Kurisu_Qwen3_TTS_PTBR_added

## Resumen

Makise_Kurisu_Qwen3_TTS_PTBR_added es un modelo de síntesis de voz (text-to-speech) de tipo LoRA incremental construido sobre starrydark/Makise_Kurisu_Qwen3_TTS, que a su vez es un fine-tune de Qwen/Qwen3-TTS-12Hz-1.7B-Base. Lo desarrolla el usuario lucca3447 como parte del proyecto OpenAmadeus y su objetivo es añadir soporte nativo de portugués de Brasil (pt-BR) a una voz clonada del personaje Makise Kurisu de la franquicia STEINS;GATE, preservando al mismo tiempo las capacidades originales en japonés, inglés y chino mandarín.

El modelo resuelve un problema muy concreto: los checkpoints previos de la voz de Kurisu solo cubrían ja/en/zh, de modo que un usuario lusohablante no podía generar audio en su idioma con ese timbre. El fine-tune selectivo aplica LoRA sobre los módulos Talker y CodePredictor, anclando el timbre a clips limpios de la novela visual y usando datos de pronunciación portugueses de BRSpeech-TTS. El resultado conserva los tres embeddings de hablante del modelo original (`kurisu`, `amadeus`, `phone`).

Con 1.916.676.352 parámetros reales (aproximadamente 1,7B declarados en el nombre del checkpoint base), el modelo se posiciona en la gama media de TTS neuronales: suficiente para calidad de estudio en un solo GPU, pero lejos de los modelos masivos multi-hablante. Su relevancia actual es la de un ejemplo práctico de adaptación lingüística de un TTS mediante LoRA sobre una base ya especializada en un personaje, un patrón cada vez más común en la comunidad open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (transformer con modulo Talker y CodePredictor, tokenizacion de audio a 12 Hz) |
| Parametros totales | 1.916.676.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF/INT8) |
| Idiomas soportados | pt (pt-BR), ja, en, zh |
| Licencia | other (`unofficial-fan-model`); sin derechos concedidos, ver seccion de derechos |
| Formato de pesos | safetensors (repo de 4,5 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-TTS-12Hz-1.7B-Base, un sistema TTS neuronal que representa el audio mediante tokens de código a 12 Hz y separa la generación en dos componentes: un módulo Talker (encargado de la prosodia y el contenido lingüístico) y un CodePredictor (responsable del timbre y la identidad vocal). Sobre esta base, starrydark ya había aplicado un fine-tune para clonar la voz de Makise Kurisu con tres embeddings de hablante (`kurisu`, `amadeus`, `phone`), y lucca3447 añade encima un LoRA selectivo etiquetado como `vn_only ep2`.

El entrenamiento del LoRA usa el dataset starrydark/Makise_Kurisu_Voice (clips limpios de la novela visual, que anclan el timbre del CodePredictor) y freds0/BRSpeech-TTS, empleado únicamente para la pronunciación portuguesa del Talker. Según la model card, el timbre del CodePredictor permaneció anclado estrictamente a audio de estudio, mientras que el Talker absorbió la fonética pt-BR. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; tampoco se detallan innovaciones como decodificación especulativa o atención lineal más allá de lo que aporta la base Qwen3-TTS.

## Capacidades

- Síntesis de voz multi-hablante con tres embeddings: `kurisu` (por defecto), `amadeus` y `phone`.
- Generación en streaming mediante `generate_custom_voice_streaming`, con control de `chunk_size` para latencia baja.
- Soporte nativo de cuatro idiomas: portugués de Brasil, japonés, inglés y chino mandarín.
- Preservación del timbre del personaje en los cuatro idiomas gracias al anclaje del CodePredictor.
- Clonación de voz de personaje (character voice) con estética de doblaje anime.
- Inferencia en bfloat16 sobre CUDA, con método `warmup(prefill_len=...)` para reducir la latencia del primer token.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Doblaje amateur de contenido en portugués: el modelo permite generar líneas de diálogo con el timbre de Kurisu en pt-BR, útil para fandubs o proyectos de traducción de la novela visual sin necesidad de un actor de voz.
- Asistente conversacional con personalidad: integrado en OpenAmadeus, puede dar respuestas habladas en portugués con una identidad vocal consistente, aprovechando el streaming para reducir la latencia percibida.
- Generación de audio para vídeos y pódcast: la API de streaming con `chunk_size=8` permite producir audio por fragmentos y ensamblarlo en un pipeline de postproducción.
- Preservación multilingüe de un personaje: un mismo proyecto puede generar la misma voz en ja, en, zh y pt-BR, lo que simplifica la localización de contenido interactivo.
- Prototipado de interfaces de voz: desarrolladores que necesiten evaluar la integración de un TTS con identidad de personaje en una app pueden usar este checkpoint como banco de pruebas en un solo GPU.
- Investigación en adaptación lingüística de TTS: sirve como caso de estudio de cómo un LoRA sobre Talker + CodePredictor añade un idioma nuevo sin degradar el timbre original.
- Contenido educativo o de divulgación: narración de material en portugués con una voz reconocible para audiencias familiarizadas con STEINS;GATE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1,9B parámetros en bfloat16 los pesos ocupan aproximadamente 3,8 GB, por lo que se necesita margen adicional para activaciones y buffers de audio.
- GPU recomendadas: no documentadas por el autor; por tamaño, una RTX 4090 o A100/H100 son opciones holgadas, y GPUs consumer de 8-12 GB deberían ser suficientes para bfloat16.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más, aunque el autor no lo confirma.
- Opciones de despliegue: FasterQwen3TTS (usado en el ejemplo oficial); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo menciona `warmup(prefill_len=100)` y streaming por chunks como mecanismos para reducir la latencia inicial.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Makise_Kurisu_Qwen3_TTS_PTBR_added | 1,92B | pt, ja, en, zh | no disponible | other (fan model) | Hugging Face |
| starrydark/Makise_Kurisu_Qwen3_TTS | no disponible | ja, en, zh | no disponible | other (fan model) | Hugging Face |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | ~1,7B | no disponible | no disponible | no disponible | Hugging Face |

La comparación se limita a la cadena de fine-tunes del propio modelo, ya que no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo fan no oficial: no tiene afiliación con los titulares de derechos de STEINS;GATE ni con la actriz de voz Asami Imai.
- La licencia `unofficial-fan-model` no concede derechos de copyright, interpretación, publicidad ni voz; el uso comercial queda en una zona legal ambigua y, en la práctica, no autorizado por el repositorio.
- Riesgo de suplantación: el modelo puede generar audio sintético que suene como una persona real; debe divulgarse siempre que el audio es sintético y no usarse para engañar, acosar o sugerir respaldo oficial.
- No se documentan sesgos específicos, pero al derivar de una base multilingüe y de un personaje de anime, la naturalidad en pt-BR puede ser inferior a la de modelos entrenados nativamente en portugués.
- No hay datos publicados sobre robustez ante texto largo, números, siglas o puntuación; la calidad en esos casos es desconocida.
- El repo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación comunitaria del rendimiento real.
- El tamaño del repo (4,5 GB) y la ausencia de cuantizaciones documentadas limitan el despliegue en entornos con poca VRAM o en CPU.

## Enlaces

- Hugging Face: https://huggingface.co/lucca3447/Makise_Kurisu_Qwen3_TTS_PTBR_added
- Modelo base (starrydark): https://huggingface.co/starrydark/Makise_Kurisu_Qwen3_TTS
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Dataset de voz: https://huggingface.co/datasets/starrydark/Makise_Kurisu_Voice
- Dataset de pronunciación portuguesa: https://huggingface.co/datasets/freds0/BRSpeech-TTS
- Repositorio OpenAmadeus: https://github.com/lucca3447/OpenAmadeus
- Derechos y uso responsable (upstream): https://huggingface.co/starrydark/Makise_Kurisu_Qwen3_TTS#rights-and-responsible-use
