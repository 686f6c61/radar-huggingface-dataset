# Infinix-io/drama-3-int4

## Resumen

Drama 3 int4 es una cuantización no oficial del modelo de síntesis de voz fishaudio/drama-3, desarrollada por el usuario Infinix-io (con crédito a AK por la cuantización). El modelo base es un TTS multi-hablante de Fish Audio con arquitectura híbrida de atención (full attention y linear attention) y mezcla de expertos, con 6.857.815.168 parámetros totales según los safetensors del repositorio. Esta versión reduce el peso de 41,5 GB a 22,1 GB mediante cuantización híbrida W4A16, manteniendo el experto compartido y el decodificador de audio en bf16.

El interés de esta ficha radica en que permite ejecutar un modelo TTS de gran tamaño en GPUs Ampere (A100, sm80) con un consumo de memoria de pesos de 20,8 GB, frente a los 37,0 GB del checkpoint original en FP8. Incluye evaluaciones publicadas de WER y similitud de hablante, además de una comparación directa FP8 frente a int4 sobre Seed-TTS English, lo que aporta datos concretos sobre la pérdida de calidad asociada a la cuantización.

La licencia es la Fish Audio Community License, lo que condiciona el uso comercial. El modelo soporta inglés, chino, japonés y coreano, además de otros idiomas, y está pensado para servir mediante SGLang Omni con soporte específico para Fish Audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con full attention y linear attention, mezcla de expertos (MoE) |
| Parametros totales | 6.857.815.168 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 híbrida: int4 simétrico con group size 128 en expertos enrutados y proyecciones de atención seleccionadas; bf16 en experto compartido, decodificador de audio, embeddings de texto, cabeza de salida, router y proyecciones in_proj_a/b |
| Idiomas soportados | en, zh, ja, ko, multilingual |
| Licencia | fish-audio-community-license |
| Formato de pesos | safetensors (checkpoint cuantizado para SGLang Omni) |

## Arquitectura y entrenamiento

El modelo base drama-3 emplea una arquitectura transformer híbrida que combina capas de atención completa con capas de atención lineal, e incorpora una mezcla de expertos con un experto compartido. La cuantización de esta versión afecta a las proyecciones q/k/v/o de las capas de atención completa y a las proyecciones in_proj_qkv, in_proj_z y out_proj de la atención lineal, todas ellas en int4 simétrico con tamaño de grupo 128. Se mantienen en bf16 los embeddings de texto, la cabeza de salida, el router, las proyecciones in_proj_a/b de la atención lineal, el MLP del experto compartido y el decodificador de audio. Según la model card, el experto compartido pasó las comprobaciones numéricas en int4 pero producía cero frames de audio, por lo que se conservó en bf16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card de esta cuantización no detalla el proceso de entrenamiento original, solo el proceso de cuantización y las evaluaciones realizadas. La innovación técnica destacable es la cuantización híbrida W4A16 con GPTQ-Marlin, que permite ejecución en GPUs con compute capability 8.0 o superior (Ampere en adelante) y reduce el peso del motor de 37,0 GB a 20,8 GB.

## Capacidades

- Generación de voz a partir de texto (text-to-speech) en inglés, chino, japonés y coreano, con soporte multilingüe adicional.
- Clonación de voz mediante clips de referencia, usando el parámetro `references` de la API.
- Etiquetas expresivas como `[sighs]` y `[laughs]` integradas en el texto de entrada.
- Generación de formato largo (long-form) para párrafos extensos.
- Escenas multi-hablante, según la API estándar de Drama 3.
- Edición con `previous_takes` para refinar tomas anteriores.
- Servicio mediante API HTTP compatible con `/v1/audio/speech` en SGLang Omni.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Síntesis de voz para audiolibros y contenido largo: el modelo soporta generación long-form y mantiene coherencia en párrafos extensos; en la evaluación comparativa, este checkpoint obtuvo WER 0,028 en el párrafo largo frente a 0,667 del checkpoint int8 comparado, que alucinó un final.
- Clonación de voz para doblaje y localización: con clips de referencia se puede replicar la voz de un hablante en inglés, chino, japonés o coreano, lo que facilita adaptar contenido a varios mercados con una voz consistente.
- Producción de audio expresivo para videojuegos o animación: las etiquetas `[sighs]` y `[laughs]` permiten introducir matices emocionales directamente en el texto de entrada sin postprocesado.
- Asistentes de voz multi-hablante: la API soporta escenas con varios hablantes, adecuada para diálogos sintéticos en aplicaciones de atención al cliente o narración interactiva.
- Generación de voces para accesibilidad: síntesis de texto a voz de calidad con clonación de la voz del propio usuario a partir de una muestra de referencia, útil en lectores de pantalla personalizados.
- Servicio de TTS en producción con SGLang Omni: el checkpoint se sirve con `sgl-omni serve` y la API `/v1/audio/speech`, con un peso de motor de 20,8 GB que deja más espacio para la caché KV en una H200 o A100.
- Evaluación e investigación en cuantización de modelos TTS: los datos publicados de WER y similitud de hablante permiten comparar el impacto de int4 frente a FP8 en tareas de síntesis y clonación.

## Benchmarks y rendimiento

Evaluación sobre Seed-TTS English (1.088 prompts, clonación de la voz de cada clip de referencia, peticiones no streaming, concurrencia 8, una H200, WER calculado con Qwen3-ASR-1.7B):

| Checkpoint | Pesos | Latencia media | Latencia p95 | RTF medio | Throughput (req/s) | WER (corpus) | WER sin muestras >50% |
|---|---:|---:|---:|---:|---:|---:|---:|
| fishaudio/drama-3 (FP8) | 37,0 GB | 1,235 s | 1,902 s | 0,281 | 6,47 | 1,99% | 1,32% |
| akhaliq/drama-3-int4 | 20,8 GB | 1,334 s | 2,178 s | 0,320 | 5,99 | 1,63% | 1,42% |

Comparación con cuantización comunitaria (8 prompts, mismo scorer, una A100, WER con Whisper large-v3 y similitud de hablante con resemblyzer):

| Modelo | WER medio ↓ | WER medio excl. zh ↓ | Similitud de hablante ↑ |
|---|---|---|---|
| Este repo (int4 híbrido, 22,1 GB) | 0,197 | 0,082 | 0,846 |
| darioooooo0o/drama-3-w4a16-32gb (int8 dense, 24,5 GB) | 0,259 | 0,154 | 0,846 |

Nota de la model card: el prompt en chino obtuvo WER 1,0 en ambos checkpoints por un artefacto de tokenización de jiwer sobre chino sin espacios, no por diferencia entre modelos. Los valores de WER de las dos evaluaciones no son comparables entre sí por usar datasets y scorers distintos.

## Requisitos de hardware

- VRAM estimada para pesos del motor: 20,8 GB en int4, frente a 37,0 GB del checkpoint original en FP8.
- En una prueba con A100-80GB se midieron 57,3 GB de memoria GPU al arrancar y 57,9 GB de pico en las cinco generaciones de muestra, con `--tts_engine.gpu_memory_fraction 0.62 --vocoder.gpu_memory_fraction 0.2`.
- GPU recomendadas: H200 (usada en la evaluación Seed-TTS) y A100-80GB (usada en la prueba de memoria y en la comparación comunitaria). Requiere compute capability 8.0 o superior por GPTQ-Marlin, por lo que funciona en Ampere y posteriores.
- No se documenta compatibilidad con GPUs consumer (RTX 4090 u otras) en la información disponible.
- Despliegue mediante SGLang Omni: clonar el repositorio, instalar con `uv pip install --prerelease=allow -e ".[fishaudio]"` y servir con `sgl-omni serve --model-path akhaliq/drama-3-int4 --port 8000`.
- Latencia y throughput en H200, concurrencia 8: latencia media 1,334 s, p95 2,178 s, RTF medio 0,320 y 5,99 req/s.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama ni TGI para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pesos | WER (Seed-TTS EN) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Infinix-io/drama-3-int4 (este) | 6.857.815.168 | no disponible | 22,1 GB | 1,63% | fish-audio-community-license | Hugging Face |
| fishaudio/drama-3 (FP8) | no disponible | no disponible | 37,0 GB | 1,99% | fish-audio-community-license | Hugging Face |
| darioooooo0o/drama-3-w4a16-32gb (int8 dense) | no disponible | no disponible | 24,5 GB | no evaluado en Seed-TTS | no disponible | Hugging Face |

No se dispone de datos de otros modelos TTS comparables en la información proporcionada.

## Limitaciones y advertencias

- La licencia fish-audio-community-license es de tipo "other" y condiciona el uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegar en producción.
- Es una cuantización no oficial: el autor del checkpoint es Infinix-io, no Fish Audio, y la model card indica que la cuantización la realizó AK.
- El experto compartido se mantuvo en bf16 porque en int4 producía cero frames de audio, lo que indica sensibilidad numérica de esa parte del modelo a la cuantización.
- La evaluación con 8 prompts muestra que este checkpoint truncó la cola de la línea de etiquetas en una toma (WER 0,333 frente a 0,25 del comparado), lo que sugiere posibles fallos puntuales en prompts cortos con etiquetas.
- El WER en chino no es fiable en la evaluación comunitaria por un artefacto de tokenización; no debe interpretarse como un fallo del modelo.
- No hay datos publicados sobre sesgos, tasas de alucinación en texto largo más allá de la evaluación de 8 prompts, ni comportamiento fuera de los idiomas en, zh, ja y ko.
- El rendimiento es un 8% más lento por petición que el checkpoint FP8 (1,334 s frente a 1,235 s de latencia media) y el throughput baja de 6,47 a 5,99 req/s.
- Requiere compute capability 8.0 o superior; no se garantiza funcionamiento en GPUs anteriores a Ampere.
- No se documentan requisitos de memoria total de servicio más allá de las cifras de la prueba con A100-80GB, que alcanzó 57,9 GB de pico.

## Enlaces

- Hugging Face: https://huggingface.co/Infinix-io/drama-3-int4
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Checkpoint de referencia de la cuantización: https://huggingface.co/akhaliq/drama-3-int4
- Comparación comunitaria: https://huggingface.co/darioooooo0o/drama-3-w4a16-32gb
- Runtime SGLang Omni: https://github.com/sgl-project/sglang-omni
- Documentación de la API Drama 3 en SGLang Omni: https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Resultados de evaluación detallados: https://huggingface.co/Infinix-io/drama-3-int4/blob/main/eval/eval_results.json
- ML Intern: https://hf.co/chat?mode=ml-intern
