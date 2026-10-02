# carloswong1224/OctoASR-1.7B-Instruct-1.0-MLX-8bit-selfquant

## Resumen

OctoASR-1.7B-Instruct-1.0-MLX-8bit-selfquant es una cuantización comunitaria a 8 bits del modelo de reconocimiento automático del habla Mininglamp-2718/OctoASR-1.7B-Instruct-1.0, publicada por el usuario carloswong1224. No se trata de un modelo entrenado desde cero ni de una conversión oficial, sino de una versión comprimida de los pesos BF16 del 29 de septiembre de 2026, generada localmente con el cuantizador propio de MLX mediante cuantización de solo pesos (weight-only post-training quantization) en modo affine, con 8 bits y tamaño de grupo 64. El resultado ocupa 2,46 GB frente a los 4,08 GB de la conversión BF16 de los mismos pesos.

El modelo base es un sistema ASR de arquitectura qwen3_asr, que combina un torre de audio (audio tower) con un decodificador transformer de 28 capas. El repositorio declara 2.038.052.480 parámetros totales según los safetensors, cifra que incluye la torre de audio y que supera la denominación comercial "1.7B" del nombre. La cuantización afecta exclusivamente a las 197 matrices del decodificador (7 proyecciones por cada una de las 28 capas más embed_tokens), mientras que la torre de audio y todas las normas permanecen en BF16.

Su relevancia es doble: por un lado, permite ejecutar un ASR multilingüe (chino e inglés) en Apple Silicon con un consumo de almacenamiento un 60,4 % inferior al BF16 y una latencia medida de 412 ms de media por enunciado en un M1 Max; por otro, documenta de forma inusualmente detallada el proceso de cuantización, los hashes SHA-256 y las diferencias de salida respecto al BF16, algo poco habitual en conversiones comunitarias. Es importante subrayar que no es un artefacto oficial de Mininglamp AI y que no equivale a Mininglamp-2718/OctoASR-1.7B-Instruct-1.0-MLX-8bit, que cuantiza una generación anterior del mismo modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_asr: torre de audio (encoder) + decodificador transformer de 28 capas |
| Parámetros totales | 2.038.052.480 (según safetensors; el nombre comercial indica 1.7B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits, modo affine, group size 64, solo pesos, sin datos de calibración; torre de audio y normas en BF16 |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (1101 tensores: 904 BF16 + 197 U32, más 197 `.scales` y 197 `.biases`) |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento del modelo base: no se indican número de tokens, composición del dataset, ni si hubo fases de RLHF o DPO. Lo que sí se detalla es la arquitectura del artefacto cuantizado: se trata de un modelo qwen3_asr con un decodificador de 28 capas, en el que el cuantizador ha intervenido sobre 7 proyecciones por capa más embed_tokens, sumando 197 tensores cuantizados. `embed_tokens` comparte pesos con la proyección de salida, por lo que la cabeza del modelo de lenguaje también queda cuantizada.

La innovación técnica relevante aquí es el procedimiento de cuantización, no el entrenamiento. El predicado de cuantización del propio modelo (`model_quant_predicate`) excluye deliberadamente la torre de audio (`not path.startswith("audio_tower")`), de modo que los 510 tensores restantes, que incluyen todo el encoder de audio y las normas, se mantienen en BF16. El resultado es un almacenamiento medio de 1,209 bytes por parámetro, es decir, el 60,4 % de la conversión BF16, y no el 50 % teórico, porque la torre de audio no se comprime y cada grupo de 64 pesos almacena además una escala y un sesgo. El comando empleado fue `mlx_audio.convert --model-domain stt --dtype bfloat16 -q --q-bits 8 --q-group-size 64 --q-mode affine` sobre el `model.safetensors` con sha256 `acd459b4fe00aeec01f8a949981e89f593b9f8d2fbbd27521381fd7dfe71772a`.

## Capacidades

- Reconocimiento automático del habla (ASR) en chino e inglés, con detección automática del idioma.
- Decodificación incremental en streaming mediante `model.generate(..., stream=True)`, con la advertencia de que conviene fijar `language` explícitamente.
- Transcripción de enunciados cortos y medios: las pruebas del autor cubren grabaciones de entre 1,1 y 19,7 segundos.
- Generación de transcripciones con puntuación, dado que la comparación con el BF16 se hizo con normalización de puntuación.
- Ejecución local en Apple Silicon mediante la librería MLX y el paquete mlx-audio.
- No se documentan en la información disponible capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio de entrada más allá del reconocimiento de voz, ni modo de razonamiento (thinking mode).

## Casos de uso

- Transcripción local de reuniones en chino o inglés en equipos Mac: el modelo cabe en 2,46 GB y se ejecuta íntegramente en el dispositivo, lo que evita enviar audio corporativo a servicios en la nube.
- Generación de subtítulos para vídeo: la decodificación en streaming permite emitir tokens conforme llega el audio, adecuada para subtitulado casi en tiempo real en un M1 Max con unos 412 ms por enunciado.
- Dictado por voz en aplicaciones de escritorio para macOS: al ser un artefacto MLX nativo, se integra en herramientas locales sin depender de APIs externas ni de conexión a internet.
- Preprocesado de corpus de audio para entrenamiento de otros modelos: transcripción por lotes de grabaciones cortas, aprovechando las 100 pruebas realizadas sin ninguna transcripción fallida ni vacía.
- Análisis de llamadas de atención al cliente en mercados sinófonos o anglófonos: el soporte de chino e inglés y la detección de idioma permiten procesar conversaciones de ambos idiomas con un único modelo.
- Accesibilidad y lectura de contenido hablado: conversión de notas de voz o mensajes de audio a texto en aplicaciones para personas con discapacidad auditiva, ejecutándose en local.
- Investigación sobre cuantización: el repositorio sirve como caso de estudio reproducible de cuantización MLX a 8 bits con grupos de 64, gracias a los hashes publicados y a la comparación byte a byte con el BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER sobre LibriSpeech o AISHELL) en la información disponible. El autor proporciona únicamente mediciones propias de comportamiento frente a la conversión BF16 de los mismos pesos, realizadas en un M1 Max con mlx-audio 0.4.4 sobre 100 grabaciones reales en chino de 1,1 a 19,7 segundos, con decodificación greedy (`temperature=0.0`, `max_tokens=8100`):

| Comparación | Resultado |
|---|---|
| Salidas byte a byte idénticas frente al BF16 de los mismos pesos | 91/100 |
| Similitud media (puntuación normalizada) | 99,54 % |
| Naturaleza de las 9 salidas divergentes | 8 a nivel de palabra (mayoritariamente palabras funcionales), 1 solo de puntuación; reproducibles en ejecuciones repetidas |
| Latencia media por enunciado | 412 ms (mediana 352 ms); el BF16 tarda 510 ms |
| Almacenamiento | 2,46 GB frente a 4,08 GB del BF16 |
| Transcripciones fallidas o vacías | 0/100 |

El propio autor advierte que la precisión no se comparó contra el modelo original ni contra la variante oficial de 8 bits, porque el único texto de referencia disponible era la salida del modelo en producción y no verdad humana, con una banda de ruido de aproximadamente 1,5 puntos que impide establecer cuál es más exacto.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon, al estar en formato MLX. No hay soporte documentado para CUDA ni ROCm en este repositorio.
- Memoria unificada estimada para inferencia: en torno a 3-4 GB considerando el archivo de 2,46 GB más el espacio de trabajo de activaciones y la torre de audio en BF16 (estimación, no un dato publicado).
- Hardware medido: M1 Max, con 412 ms de media y 352 ms de mediana por enunciado de 1,1 a 19,7 segundos. No se han publicado mediciones para M1, M2, M3, M4 ni sus variantes Pro, Max o Ultra.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables directamente, ya que MLX no las soporta; requeriría una conversión a otro formato que no se documenta en este repositorio.
- Cabe en GPU de consumo en el sentido de que cabe en cualquier Mac con memoria unificada suficiente; no se especifica el mínimo exigido más allá del uso medido en un M1 Max.
- Opciones de despliegue: mlx-audio (`from mlx_audio.stt import load`), requiriendo una compilación de mlx-audio que registre el tipo de modelo `qwen3_asr`. Se probó con mlx-audio 0.4.4. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 412 ms de media y 352 ms de mediana por enunciado en M1 Max con decodificación greedy; el autor no publica throughput agregado ni factor de tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|---|
| carloswong1224/OctoASR-1.7B-Instruct-1.0-MLX-8bit-selfquant | 2.038.052.480 | no disponible | 8 bits affine, grupo 64, safetensors MLX | 2,46 GB | Apache-2.0 | Objeto de esta ficha; cuantiza los pesos BF16 del 29-09-2026 |
| carloswong1224/OctoASR-1.7B-Instruct-1.0-MLX-bf16 | 2.038.052.480 (mismos pesos) | no disponible | BF16, safetensors MLX | 4,08 GB | Apache-2.0 | Referencia de la comparación: 510 ms por enunciado, 91/100 salidas idénticas |
| Mininglamp-2718/OctoASR-1.7B-Instruct-1.0 | no disponible en la información | no disponible | BF16 | no disponible | Apache-2.0 | Modelo base original, publicado el 29-09-2026 |
| Mininglamp-2718/OctoASR-1.7B-Instruct-1.0-MLX-8bit | no disponible en la información | no disponible | 8 bits MLX | no disponible | Apache-2.0 | Variante oficial de 8 bits (22-06-2026), pero cuantiza una generación anterior del modelo; el autor advierte que no es el mismo artefacto |

No se dispone de datos comparativos frente a otros sistemas ASR de tamaño similar (por ejemplo Whisper u otros modelos qwen3_asr) en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión y cuantización comunitaria, no una publicación oficial de Mininglamp AI; la licencia y los derechos de los pesos siguen la Apache-2.0 del modelo original.
- No debe confundirse con Mininglamp-2718/OctoASR-1.7B-Instruct-1.0-MLX-8bit: ese repositorio cuantiza una generación anterior, mientras que este parte de los pesos BF16 del 29-09-2026.
- La precisión no está clasificada frente al modelo original ni frente a la variante oficial de 8 bits; el autor reconoce explícitamente que la referencia empleada era la salida del modelo en producción y no verdad humana.
- Con la API de streaming y detección automática de idioma, los primeros tokens generados se consumen en la rama de detección y se pierde el inicio de la transcripción; hay que pasar `language` de forma explícita.
- Dependencia estricta de una compilación de mlx-audio que registre el tipo de modelo `qwen3_asr`; sin ella, la carga falla.
- Idiomas limitados a chino e inglés; no hay soporte documentado para castellano ni para otras lenguas.
- Al ser un modelo ASR, existe riesgo inherente de alucinación en audio ruidoso, con acentos no cubiertos o con dominios alejados del entrenamiento; no se documentan sesgos específicos más allá de la cobertura lingüística.
- Las mediciones de latencia y calidad provienen de una única máquina (M1 Max), 100 grabaciones y una sola versión de librería, por lo que no son extrapolables sin más.
- No se documenta longitud de contexto, por lo que no puede garantizarse el comportamiento en audios largos; las pruebas cubren únicamente hasta 19,7 segundos.
- Ausencia total de tracción en el repositorio (0 descargas y 0 likes en el momento de la consulta), lo que implica falta de validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/carloswong1224/OctoASR-1.7B-Instruct-1.0-MLX-8bit-selfquant
- Modelo base: https://huggingface.co/Mininglamp-2718/OctoASR-1.7B-Instruct-1.0
- Conversión BF16 de los mismos pesos: https://huggingface.co/carloswong1224/OctoASR-1.7B-Instruct-1.0-MLX-bf16
- Variante oficial de 8 bits de una generación anterior: https://huggingface.co/Mininglamp-2718/OctoASR-1.7B-Instruct-1.0-MLX-8bit
- Paper, blog, repositorio de código o demo: no disponibles. Las búsquedas web realizadas no devolvieron resultados relacionados con este modelo; los enlaces encontrados correspondían a simuladores de arena, servicios de sandbox de navegador y sandboxes de análisis de malware, sin relación alguna con OctoASR.
