# groxaxo/LFM3-Audio-2B-GPTQ-Pro-INT4

## Resumen

LFM3-Audio-2B GPTQ-Pro INT4 es una cuantización selectiva de 4 bits del modelo LiquidAI/LFM3-Audio-2B, publicada por el desarrollador independiente groxaxo (Vlad Jagodnik) bajo el framework GPTQ-Pro. No se trata de un modelo nuevo ni de un checkpoint autónomo: es un *overlay* INT4 de 755 MiB que sustituye las proyecciones del backbone lingüístico del modelo original, manteniendo en BF16 los componentes sensibles al audio. El objetivo es reducir el consumo de VRAM para poder ejecutar reconocimiento y síntesis de voz en local sobre una única GPU de consumo, en concreto una RTX 3090.

El modelo base pertenece a la familia LFM3 de Liquid AI, seis modelos abiertos de clase 2B construidos sobre un backbone compartido que cubren texto, visión, audio, omni y tareas de decisión. La variante Audio-2B es un modelo *any-to-any* (entrada y salida de audio y texto) con soporte de inglés y español, pensado para experimentos de agentes de voz, atención telefónica automatizada y transcripción.

La relevancia de esta publicación es doble. Por un lado, ofrece una receta reproducible de cuantización mixta con métricas honestas: el autor reporta una reducción del 53,87 % en memoria de GPU asignada al modelo, pero también advierte de que la latencia de ASR en INT4 es ligeramente peor y de que la precisión en español sufre una pequeña pérdida. Por otro, incluye scripts de inferencia probados, benchmarks en RTX 3090 y diez comparativas A/B de voz (cinco en inglés, cinco en español) con audio original, lo que permite evaluar la degradación subjetiva antes de adoptarlo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con backbone lingüístico cuantizado y componentes de audio en BF16 (arquitectura del LFM3-Audio-2B de Liquid AI; detalles internos no disponibles) |
| Parametros totales | clase 2B (cifra exacta no disponible) |
| Parametros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 simétrico, group size 64, aplicado a 142 proyecciones en 24 capas del decoder; resto de componentes en BF16 |
| Idiomas soportados | inglés (en) y español (es) |
| Licencia | lfm-open-license-v1.0 (Liquid AI LFM Open License) |
| Formato de pesos | overlay INT4 empaquetado para el cargador CUDA propio de GPTQ-Pro; no es safetensors estándar, ni GGUF, ni un checkpoint autónomo de Transformers |

Otros datos de la ficha de HuggingFace: repositorio de 0,8 GB, pipeline `any-to-any`, librería `transformers`, 0 descargas y 1 like en el momento de la consulta, creado el 28 de octubre de 2026 y actualizado el 29 de octubre de 2026.

## Arquitectura y entrenamiento

Este repositorio no entrena un modelo, sino que cuantiza uno existente. El proceso, ejecutado con GPTQ-Pro (un fork experimental de ModelCloud/GPTQModel centrado en GPTQ INT4 simétrico y ejecución CUDA con *native qweight* sobre arquitecturas Ampere), comprime únicamente el backbone lingüístico: 142 proyecciones repartidas en 24 capas del decoder pasan a INT4 simétrico con grupo de cuantización de 64. Los módulos responsables del procesamiento y la generación de audio se conservan en BF16, de modo que la release es de precisión mixta y el ahorro de memoria es parcial por diseño.

La inferencia no se realiza con el pipeline estándar de Transformers, sino con un cargador CUDA personalizado incluido en la release: es necesario descargar los pesos BF16 originales de LiquidAI/LFM3-Audio-2B y superponer el overlay INT4 de 755 MiB. El autor publica además los scripts de cuantización, los benchmarks en RTX 3090 y las muestras de audio comparativas. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF/DPO ni innovaciones de atención); para eso hay que remitirse a la model card de Liquid AI.

## Capacidades

- Reconocimiento de voz (ASR): transcripción de audio a texto en inglés y español.
- Síntesis de voz (TTS): generación de audio a partir de texto, con escenarios de atención telefónica evaluados por el autor.
- Conversión any-to-any: combinación de entrada y salida de audio y texto, según el `pipeline_tag` del repositorio.
- Procesamiento multilingüe limitado a inglés y español.
- Conversación de voz multi-turno orientada a agentes (el autor lo describe como candidato a "recepcionista con IA").
- Ejecución local en GPU de consumo con CUDA mediante el cargador propio de GPTQ-Pro.
- Cuantización selectiva con audio en BF16 para preservar la calidad de las partes sensibles.
- Herramientas de evaluación incluidas: benchmarks reproducibles y diez comparativas A/B de voz con audio original.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso con herramientas, visión, modo *thinking* ni matemáticas/código.

## Casos de uso

- Recepcionista telefónica automatizada: el modelo encadena ASR, razonamiento breve y TTS para atender llamadas, consultar disponibilidad de citas y confirmar datos; el autor lo valida explícitamente con frases de este dominio en inglés y español.
- Transcripción local de audio a texto: al ejecutarse en una RTX 3090 con menor huella de memoria que el modelo BF16, permite desplegar ASR en estaciones de trabajo sin GPU de datacenter.
- Generación de respuestas habladas en asistentes de voz: síntesis en inglés y español con audios A/B publicados para comparar la calidad BF16 frente a INT4 antes de adoptar la versión cuantizada.
- Dictado de datos alfanuméricos y nombres propios: las muestras incluyen deletreo de apellidos, un caso típico de verificación de identidad en atención al cliente donde la fidelidad de la transcripción es crítica.
- Prototipado e investigación en compresión de modelos: los scripts de cuantización, el cargador CUDA y los benchmarks en RTX 3090 sirven como base reproducible para estudiar el impacto de INT4 selectivo en modelos multimodales de audio.
- Evaluación de calidad de voz en producción: los ficheros A/B (cinco escenarios en inglés, cinco en español, con la misma semilla y comparación normalizada en volumen) permiten montar pruebas de escucha internas antes de un despliegue.
- Experimentos de agentes de voz bilingües en pymes: al requerir una sola GPU de consumo, encaja en prototipos de bajo presupuesto para atención en español e inglés sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER, MOS) en la información disponible. El autor publica únicamente métricas de memoria y observaciones cualitativas sobre la misma RTX 3090:

| Metrica | BF16 (modelo base) | GPTQ-Pro INT4 | Observacion |
|---|---|---|---|
| Memoria de GPU asignada al modelo | referencia | 53,87 % menos | Dato reportado por el autor; no se especifica el pico absoluto de VRAM |
| Latencia de ASR | referencia | ligeramente superior (más lenta) | Sin cifras concretas publicadas |
| Precisión en español | referencia | pequeña pérdida | Sin cifras concretas; el autor indica que la precisión en español "sufrió un pequeño golpe" en sus pruebas |
| Calidad de voz TTS | referencia | evaluada mediante A/B | Cinco frases en inglés y cinco en español, misma semilla, comparación normalizada en volumen |
| Latencia/RTF de audio | referencia | disponible en `docs/rtf_audio_quality_20261029.md` | El repositorio enlaza el documento, pero los valores no se recogen en la información proporcionada |

## Requisitos de hardware

- VRAM estimada: no disponible como cifra absoluta. El autor solo reporta una reducción del 53,87 % en memoria asignada al modelo respecto a la versión BF16; el pico real depende del contexto, del audio de entrada y del runtime CUDA.
- GPU de referencia: NVIDIA RTX 3090 (Ampere), la única placa sobre la que se publican benchmarks reproducibles.
- Compatibilidad: GPTQ-Pro está orientado a Ampere (el repositorio del framework menciona RTX 3090 y RTX 3060); no se documenta soporte para Ada, Hopper ni GPU de datacenter.
- ¿Cabe en GPU de consumo? Sí, según la validación del autor en una RTX 3090; no hay datos para tarjetas con menos VRAM.
- Requisito imprescindible: pesos BF16 originales de LiquidAI/LFM3-Audio-2B más el overlay INT4 de 755 MiB y el cargador CUDA incluido. El repositorio de 0,8 GB no contiene el modelo completo.
- Opciones de despliegue: cargador CUDA propio de GPTQ-Pro (scripts en `examples/lfm3_audio`). No compatible con vLLM, llama.cpp, Ollama ni TGI, y no hay checkpoint Transformers autónomo ni GGUF.
- Latencia y throughput: no disponibles en cifras; cualitativamente, la ASR en INT4 es algo más lenta que en BF16 según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| groxaxo/LFM3-Audio-2B-GPTQ-Pro-INT4 | clase 2B | no disponible | en, es | LFM Open License v1.0 | overlay INT4 + cargador CUDA propio | 53,87 % menos memoria de modelo; ASR algo más lenta; pequeña pérdida en español |
| LiquidAI/LFM3-Audio-2B (base) | clase 2B | no disponible | en, es | LFM Open License v1.0 | safetensors BF16 (formato estándar de la release original) | Referencia de calidad; mayor consumo de VRAM; sin dependencia de cargador custom |
| Otros miembros de la familia LFM3 (texto, visión, omni, decisión) | clase 2B | no disponible | no disponible | LFM Open License v1.0 | no disponible | Comparten backbone y se pueden afinar en una sola GPU; no cubren el mismo caso de uso audio |
| Alternativas ASR/TTS de código abierto de propósito general (p. ej. Whisper, Qwen2-Audio) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible | No se han publicado comparaciones directas en la información disponible |

## Limitaciones y advertencias

- No es un checkpoint autónomo: sin los pesos BF16 originales de LiquidAI/LFM3-Audio-2B y sin el cargador CUDA de GPTQ-Pro, el repositorio no es utilizable. No funciona con `AutoModel` estándar, ni con vLLM, llama.cpp, Ollama o TGI.
- Dependencia de CUDA y de arquitectura Ampere: no hay soporte documentado para CPU ni para otras familias de GPU.
- Pérdida de precisión documentada por el propio autor: la precisión en español se degrada ligeramente y la latencia de ASR empeora respecto a BF16.
- El ahorro de memoria es parcial (53,87 % sobre la memoria asignada al modelo, no sobre el total del sistema), porque los componentes de audio permanecen en BF16.
- Cobertura lingüística reducida a inglés y español; no se documenta comportamiento en otras lenguas ni en code-switching.
- Validación comunitaria mínima: 0 descargas y 1 like en el momento de la consulta, release de un solo autor y sin revisión por pares.
- Muestra de evaluación pequeña: diez frases (cinco por idioma) para las comparativas A/B de TTS, insuficiente para conclusiones estadísticas sobre calidad de voz.
- Riesgo de alucinación y de errores de transcripción no cuantificado: no se publican métricas de WER ni de tasa de alucinación en ASR, un aspecto crítico en dominios como salud o atención al cliente.
- Licencia LFM Open License v1.0: es una licencia "other" con términos propios; hay que revisar en el enlace oficial las condiciones de uso comercial, redistribución y obligaciones de atribución antes de llevarlo a producción.
- Faltan datos técnicos clave para planificar producción: longitud de contexto, número exacto de parámetros, pico de VRAM y throughput no están publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/groxaxo/LFM3-Audio-2B-GPTQ-Pro-INT4
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Framework de cuantización GPTQ-Pro: https://github.com/groxaxo/GPTQ-Pro
- Scripts de inferencia para LFM3-Audio: https://github.com/groxaxo/GPTQ-Pro/tree/main/examples/lfm3_audio
- Muestras A/B de TTS (inglés y español): https://huggingface.co/groxaxo/LFM3-Audio-2B-GPTQ-Pro-INT4/blob/main/samples/tts_ab_20261029/README.md
- Benchmarks de RTF y calidad de audio: https://huggingface.co/groxaxo/LFM3-Audio-2B-GPTQ-Pro-INT4/blob/main/docs/rtf_audio_quality_20261029.md
- Licencia LFM Open License v1.0: https://www.liquid.ai/lfm-license
- Perfil del autor: https://github.com/groxaxo/
- Anuncio de la familia LFM3 de Liquid AI: https://www.marktechpost.com/2026/10/27/liquid-ai-lfm3-open-weight-2b-multimodal-models/
