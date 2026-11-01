# Skttttt/Fishspeech-S2-Pro-Itsuki-Edition-V2-FP8-E4M3

## Resumen

Fishspeech S2 Pro "Itsuki Edition" V2 FP8 E4M3 es un modelo de síntesis de voz (text-to-speech) en japonés derivado de Fish Speech S2 Pro, adaptado por el usuario Skttttt como proyecto de fan para clonar la voz del personaje Itsuki Nakano. Se trata de una versión cuantizada a FP8 (formato E4M3) del checkpoint completo V2 en BF16, con los pesos ya fusionados en un único `model.safetensors`, por lo que no requiere adaptadores LoRA ni pasos de merge adicionales.

El modelo emplea la arquitectura nativa `dual_ar` de Fish Speech, con 4.962.228.480 parámetros totales (aproximadamente 4,96 mil millones) y un tamaño de repositorio de 6,9 GB. Está pensado para ejecutarse en GPUs de 16 GB de VRAM, lo que lo hace accesible en hardware de consumo, aunque el runtime incluido se ha validado únicamente en una AMD RX 9070 XT con ROCm.

Su relevancia radica en dos factores: por un lado, demuestra un flujo de cuantización FP8 por fila sobre un modelo TTS de tamaño medio con acumulación en FP32 en las operaciones lineales; por otro, ejemplifica el ecosistema de adaptaciones de personaje sobre Fish Speech, con referencias de audio, transcripciones y tokens de códec precalculados para guiar el timbre y la dicción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | dual_ar (Fish Speech nativo) |
| Parametros totales | 4.962.228.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 con escalado por fila; pesos originales en BF16 |
| Idiomas soportados | japonés (ja) |
| Licencia | fish-audio-research-license (other) |
| Formato de pesos | safetensors (FP8 E4M3), codec.pth |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `dual_ar` propia de Fish Speech, un esquema autorregresivo dual que combina la generación de tokens semánticos con un códec de audio dedicado (`codec.pth`, 1,87 GB) para reconstruir la forma de onda. La cuantización afecta a 202 capas lineales y tres tablas de embeddings, que usan pesos E4M3 con escalado por fila; las operaciones lineales del transformer se ejecutan con operandos FP8 mediante `torch._scaled_mm` y acumulación en FP32, mientras que la atención, las residuales, la normalización y el códec permanecen en mayor precisión.

El entrenamiento parte del checkpoint V2 en BF16, que a su vez deriva de una ejecución de ajuste específica del personaje (character-only training run) con checkpoint en el paso 5500 y "muchos más datos" que la V1, según el autor. No se especifican el número de tokens de entrenamiento, la composición del corpus ni si hubo RLHF o DPO. La adaptación se realizó como proyecto de fan no oficial sobre Fish Audio, sin afiliación con los creadores de la franquicia.

## Capacidades

- Síntesis de voz en japonés a partir de texto, con clonación de timbre guiada por clips de referencia.
- Control de estilo y dicción mediante referencias de audio intercambiables (`--reference`), cada una con su transcripción y tokens de códec asociados.
- Generación de voz de un solo hablante (Itsuki Nakano), no un modelo multihablante generalista.
- Inferencia con pesos fusionados: no requiere cargar adaptadores ni aplicar merges en tiempo de ejecución.
- Ejecución en GPUs de 16 GB gracias a la cuantización FP8.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa, visión ni audio de entrada.

## Casos de uso

- Doblaje amateur de líneas japonesas para proyectos de fan: el modelo genera voz con el timbre de Itsuki a partir de texto nuevo, usando uno de los clips de referencia incluidos para fijar el tono.
- Prototipado de videojuegos o novelas visuales con voz de personaje: se puede integrar en un pipeline que reciba guiones en japonés y produzca WAV por línea, con la referencia adecuada según la escena.
- Pruebas de cuantización FP8 en TTS: sirve como banco de pruebas para validar `torch._scaled_mm` y el escalado por fila en un modelo de unos 5 mil millones de parámetros sobre ROCm.
- Evaluación de calidad perceptual: los clips de referencia y las comparaciones ciegas permiten reproducir pruebas A/B entre FP8 y BF16 en aproximadamente un minuto de audio.
- Generación de contenido para mods o vídeos de fan: sustitución de líneas de voz en clips cortos, con la salvedad de la licencia de investigación.
- Investigación sobre adaptación de personaje en TTS: el repositorio documenta el flujo completo (checkpoint fusionado, referencias, tokens de códec) y sirve de base para replicar adaptaciones similares con otros personajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta pruebas de escucha ciega que sitúan la V2 como una mejora notable frente al modelo base y la V1, y una comparación de aproximadamente un minuto entre FP8 y BF16 que resultó indistinguible al oído.

## Requisitos de hardware

- VRAM estimada: el autor indica que está hecho para GPUs de 16 GB; el uso real depende del runtime, los ajustes y la longitud de la entrada.
- GPU recomendadas: AMD RX 9070 XT con ROCm es la única configuración validada por el autor; se incluye un helper experimental para NVIDIA CUDA, pero la inferencia completa en CUDA no se ha probado.
- GPU de consumo: sí cabe en GPUs de 16 GB; no se especifican modelos concretos de NVIDIA.
- Despliegue: runtime propio (`infer_fp8.py`, `native_fp8.py`, `bootstrap.py`) sobre un fork de Fish Speech en el commit `166940c301b8b4650b3110397a38bc68727a3afa`, con PyTorch 2.8.0; no es un checkpoint compatible con `AutoModel` de Transformers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Fishspeech S2 Pro Itsuki V2 FP8 E4M3 | 4.962.228.480 | no disponible | ja | fish-audio-research-license | safetensors FP8 |
| Fishspeech S2 Pro Itsuki V2 (BF16) | no disponible | no disponible | ja | fish-audio-research-license | BF16 |
| Fishspeech S2 Pro Itsuki V1 | no disponible | no disponible | ja | fish-audio-research-license | no disponible |
| Fish Speech S2 Pro base | no disponible | no disponible | multilingüe (no detallado) | fish-audio-research-license | no disponible |

La comparación se limita a las variantes del mismo linaje, ya que no se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Proyecto de fan no oficial, sin afiliación ni respaldo de los creadores, intérpretes o titulares de la franquicia.
- La licencia `fish-audio-research-license` restringe el uso; debe revisarse `LICENSE.md` antes de cualquier uso comercial.
- Solo soporta japonés; no hay capacidades multilingües documentadas.
- La voz no coincide necesariamente con el personaje en todas las líneas; cambiar la referencia altera la dicción.
- El runtime incluido exige una build de PyTorch con ROCm; el soporte en otras GPUs no está verificado y el helper CUDA es experimental.
- El loader BF16 original no puede usar de forma segura estos pesos FP8 escalados; es obligatorio emplear el loader nativo incluido.
- Riesgo de alucinación acústica y artefactos en entradas largas o textos fuera del dominio de entrenamiento; no se documentan sesgos específicos.
- No se incluyen el corpus de entrenamiento, los estados del optimizador ni adaptadores independientes, lo que limita la reproducibilidad del ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Skttttt/Fishspeech-S2-Pro-Itsuki-Edition-V2-FP8-E4M3
- Modelo base BF16 V2: https://huggingface.co/Skttttt/Fishspeech-S2-Pro-Itsuki-Edition-V2
- Versión V1: https://huggingface.co/Skttttt/Fishspeech-S2-Pro-Itsuki-Edition-V1
- Fork de Fish Speech requerido: https://github.com/TachibanaKimika/fish-speech/tree/166940c301b8b4650b3110397a38bc68727a3afa
- Referencia por defecto (audio): https://huggingface.co/Skttttt/Fishspeech-S2-Pro-Itsuki-Edition-V2-FP8-E4M3/resolve/main/references/g2_it_10866.wav
