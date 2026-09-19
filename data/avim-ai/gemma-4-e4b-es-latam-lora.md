# AVIM-AI/gemma-4-E4B-es-latam-lora

## Resumen

`AVIM-AI/gemma-4-E4B-es-latam-lora` es un adaptador LoRA de bajo rango sobre `google/gemma-4-E4B-it` que aplica preentrenamiento continuado (CPT) para acercar el modelo al español latinoamericano de registro institucional y enciclopédico. Lo desarrolla Servicios Tecnológicos AVIM SpA (Santiago de Chile) y se entrenó íntegramente en local sobre un Apple M5 Max con 128 GB de memoria unificada usando MLX, en 15 horas y 10 minutos.

No es un modelo nuevo: es un adaptador de 148,4 MB (float32) que entrena 37,09 M de parámetros, el 0,497 % del total del base (7.463 M según la model card). Los datos proceden del subconjunto en español del corpus abierto LatamGPT 1.0 de CENIA, del que se procesó un único shard: 60.931 documentos filtrados, 50,7 M de tokens efectivos en una época.

Su relevancia práctica es doble: por un lado, ofrece una vía de adaptación lingüística regional a un coste de cómputo muy bajo y totalmente auditable (hash SHA-256 del shard y commit de mlx-lm fijados); por otro, demuestra un flujo de CPT reproducible en hardware de consumo Apple. Como contrapartida, no publica benchmarks, hereda las limitaciones del base y su propia model card advierte de alucinaciones en normativa específica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4, variante E4B, con KV compartido en las últimas 18 de 42 capas; adaptación mediante LoRA (no se especifica si el base es MoE) |
| Parámetros totales | 7.463 M en el modelo base (según la model card; coherente con los 37,09 M entrenados, que suponen el 0,497 %) |
| Longitud de contexto | No disponible para el modelo base; el adaptador se entrenó con `max_seq_length` de 2.048 tokens |
| Tipos de cuantización | No disponible; el adaptador se distribuye en float32 |
| Idiomas soportados | Español (`es`), orientado a español latinoamericano |
| Licencia | apache-2.0 |
| Formato de pesos | Adaptador LoRA para MLX / mlx-lm (float32, 148,4 MB); no se publican pesos fusionados ni GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-E4B-it`, un transformer decoder-only de 42 capas y 7.463 M de parámetros. La particularidad arquitectónica relevante es que las últimas 18 capas emplean KV compartido y carecen de proyecciones `k_proj` y `v_proj`; por ese motivo las claves LoRA se limitan a `self_attn.q_proj`, `self_attn.o_proj`, `mlp.gate_proj`, `mlp.up_proj` y `mlp.down_proj`, aplicadas a las últimas 24 de las 42 capas. El rango es 32, con `scale` 20,0 y `dropout` 0,05. El soporte de MLX para el KV sharing de esta arquitectura no estaba en ninguna versión publicada en PyPI en el momento del entrenamiento, de ahí que el procedimiento fije el commit `9d1e356e7cc6549e7d1697adabe2ea01ff8e062c` de mlx-lm.

Los datos provienen del shard `train-00000-of-00101.parquet` de `latam-gpt/LatamGPT-Corpus-1.0` (SHA-256 `770895ed254adffa78a81ea3089598508a8987108c216567a41824ed411ae138`), filtrado por idioma `spanish`, licencias Apache 2.0, CC0 1.0 y ODC-By v1.0, y longitud entre 800 y 7.000 caracteres. Tras el filtrado quedaron 60.931 documentos (68,04 % Apache 2.0, 31,96 % CC0 1.0, 0 % ODC-By), repartidos en 59.712 de entrenamiento, 609 de validación y 610 de prueba, con una media de 844 tokens por documento. La configuración de entrenamiento fue: `batch_size` 2, `grad_accumulation_steps` 8, 29.800 iteraciones (una época contada en microlotes), `learning_rate` 5e-5 con decaimiento coseno (warmup 800, valor final 5e-6) y `grad_checkpoint` activado. La val loss bajó de 7,541 a 2,742 en las primeras 3.000 iteraciones y se estabilizó alrededor de 2,626 hacia la iteración 19.000; las últimas 10.000 iteraciones no aportaron mejora medible y no se observó sobreajuste. No se documenta RLHF, DPO ni ninguna fase de alineación posterior, solo el CPT supervisado sobre texto.

## Capacidades

- Generación y comprensión de texto en español, con mejor modelado declarado de documentos de estilo institucional y enciclopédico latinoamericano.
- Razonamiento con cadena de pensamiento: el modelo emite un canal delimitado por `<|channel>thought` y `<|channel|>`, que `mlx_lm.generate` no filtra y que la aplicación debe parsear.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible; solo se documenta el canal de razonamiento interno.
- Capacidades multilingües: no disponibles; la model card declara únicamente español.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponibles, salvo el canal de razonamiento heredado del base.
- Ejecución local en Apple silicon mediante MLX, sin envío de datos a servicios externos.
- Hereda las capacidades y limitaciones de `google/gemma-4-E4B-it`; el adaptador no las amplía.

## Casos de uso

- Generación de texto institucional en español latinoamericano: redacción y reformulación de borradores de actas, circulares o notas de prensa, aprovechando que el CPT se hizo sobre un corpus de registro enciclopédico e institucional y no sobre conversación general.
- Ejecución local con requisitos de soberanía del dato: organizaciones que no pueden enviar contenido a APIs externas pueden ejecutar el modelo en un Mac con memoria unificada mediante MLX, manteniendo el texto dentro del perímetro.
- Punto de partida para especializaciones de dominio: al ser un adaptador LoRA de 148,4 MB sobre q/o/gate/up/down, se puede componer con nuevos adaptadores (legal, sanitario, administración pública) sin reentrenar el base.
- Resumen y normalización de documentos de 800 a 7.000 caracteres: resúmenes de informes, extracción de puntos clave y reescritura en registro formal, dentro del rango de longitud para el que se filtró el corpus.
- Investigación en CPT de bajo coste: la model card publica el YAML completo, el hash del shard y el commit del framework, lo que permite reproducir o auditar el experimento como caso de estudio metodológico.
- Asistente interno de documentación para equipos hispanohablantes: consultas sobre manuales internos y generación de borradores, siempre con revisión humana dado el riesgo de alucinación declarado por el propio autor.
- Exploración y preprocesado de corpus latinoamericanos en ciencias sociales: etiquetado temático o generación de resúmenes preliminares sobre colecciones documentales, con validación posterior por parte del investigador.
- Prototipos conversacionales con supervisión: atención a consultas de baja criticidad donde la respuesta se revise antes de publicarse, presupuestando al menos 1.200 tokens de salida por el coste del canal de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de entrenamiento:

| Métrica | Valor |
|---|---|
| Val loss inicial | 7,541 |
| Val loss a las 3.000 iteraciones | 2,742 |
| Val loss en meseta (iteración ~19.000) | 2,626 |
| Iteraciones totales | 29.800 (una época) |
| Tokens procesados | 50,7 M |
| Duración del entrenamiento | 15 h 10 min en Apple M5 Max (128 GB) |

No hay datos de MMLU, HumanEval, GSM8K, evaluación de calidad en español ni comparaciones con otros adaptadores.

## Requisitos de hardware

- Memoria para el modelo base: las cifras siguientes son estimaciones calculadas a partir de los 7.463 M de parámetros, no datos publicados. En bf16/fp16 rondaría los 15 GB de pesos; en 8 bits, unos 7,5 GB; en 4 bits, unos 4 GB. Añadir la caché KV según la longitud de contexto.
- Hardware de entrenamiento documentado: Apple M5 Max con 128 GB de memoria unificada, 15 h 10 min para 50,7 M de tokens y 29.800 iteraciones.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 16 GB o más en cuantizaciones de 8 y 4 bits, y en Macs con memoria unificada de 16-32 GB. En fp16 conviene disponer de 24 GB (por ejemplo, RTX 4090 o RTX 3090). No verificado por el autor.
- GPU de centro de datos: A100, H100 o similares quedarían muy por encima de lo necesario para este tamaño, pero MLX no las soporta de forma nativa.
- Opciones de despliegue: mlx-lm en Apple silicon con el commit fijado `9d1e356e7cc6549e7d1697adabe2ea01ff8e062c`; se invoca con `mlx_lm.generate --model google/gemma-4-E4B-it --adapter-path AVIM-AI/gemma-4-E4B-es-latam-lora`. Compatibilidad con vLLM, TGI, llama.cpp u Ollama: no disponible (no se publican GGUF ni pesos fusionados). El requisito de KV sharing de la arquitectura Gemma 4 E condiciona la compatibilidad con runtimes que no lo implementen.
- Latencia y throughput: no disponibles. El único dato temporal es el del entrenamiento.
- Presupuesto de tokens en inferencia: el canal de razonamiento consume habitualmente entre 350 y 450 tokens, incluso en preguntas simples; con `--max-tokens 400` es frecuente que la respuesta final no llegue a emitirse.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AVIM-AI/gemma-4-E4B-es-latam-lora` | 7.463 M base + 37,09 M de adaptador (0,497 %) | Entrenado a 2.048 tokens; contexto del base no disponible | LoRA para MLX, float32, 148,4 MB | apache-2.0 | Publicado en HuggingFace, 0 descargas y 0 likes, repositorio de 0,1 GB |
| `google/gemma-4-E4B-it` (base) | 7.463 M | No disponible | No disponible | Apache 2.0 según la model card del adaptador | Publicado en HuggingFace |
| Otros adaptadores al español latinoamericano de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos de rendimiento comparado con alternativas, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Riesgo de alucinación explícitamente reconocido: la model card indica que el modelo alucina sobre normativa específica y subraya que no es una fuente de información verificada.
- Uso restringido en contextos de alto impacto: salud, justicia, finanzas, seguridad pública o cualquier ámbito donde una salida incorrecta cause daño. No sustituye el juicio profesional ni la validación humana.
- Cobertura de datos muy parcial: se procesó 1 de 101 shards del corpus LatamGPT, con 60.931 documentos y 50,7 M de tokens, lo que limita la amplitud temática del ajuste.
- Truncamiento en tokenización densa: el filtro se fijó en 7.000 caracteres asumiendo 4,41 caracteres por token, pero algunos documentos alcanzaron 2.243 tokens y sí se truncaron al superar los 2.048.
- Ventana de contexto corta en el entrenamiento (2.048 tokens), insuficiente para tareas de contexto largo sin salir de la distribución de entrenamiento.
- Canal de razonamiento no filtrado: `mlx_lm.generate` emite el bloque `<|channel>thought ... <|channel|>` como texto; cualquier interfaz debe parsearlo o mostrará el razonamiento interno al usuario.
- Presupuesto de tokens: el razonamiento consume 350-450 tokens de forma rutinaria, por lo que configuraciones con `--max-tokens` bajo devuelven respuestas vacías o truncadas.
- Idioma único: solo se declara español; no hay soporte multilingüe documentado ni evaluación en otras lenguas.
- Dependencia de versión: el KV sharing de Gemma 4 E exige un commit concreto de mlx-lm no publicado en PyPI en el momento del entrenamiento, lo que complica la reproducibilidad y el despliegue en entornos estándar.
- Compatibilidad limitada: al distribuirse solo como adaptador para MLX en float32, no hay ruta directa a vLLM, llama.cpp, Ollama o TGI sin conversión previa.
- Sesgos: no se documenta ninguna auditoría de sesgos del adaptador ni del corpus; los sesgos del base y del subconjunto LatamGPT se heredan sin cuantificar.
- Licencia y atribución del corpus: se admitieron Apache 2.0, CC0 1.0 y ODC-By v1.0, pero se excluyeron deliberadamente las licencias que exigen atribución documento a documento; en este shard no apareció ningún documento ODC-By.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Model card incompleta: la sección de convergencia aparece truncada en la información disponible, y no se publican benchmarks ni evaluaciones cualitativas.
- Verificar los términos de uso del modelo base de Google antes de un despliegue comercial, aunque el adaptador se distribuya bajo Apache 2.0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AVIM-AI/gemma-4-E4B-es-latam-lora
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Corpus de entrenamiento: https://huggingface.co/datasets/latam-gpt/LatamGPT-Corpus-1.0
- Framework mlx-lm: https://github.com/ml-explore/mlx-lm
- Desarrollador: https://avim.ai
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
