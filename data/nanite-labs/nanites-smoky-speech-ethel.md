# Nanite-Labs/nanites-smoky-speech-ethel

## Resumen

El modelo `Nanite-Labs/nanites-smoky-speech-ethel` es un sistema de text-to-speech (TTS) desarrollado por Nanite-Labs, fine-tuneado sobre `FunAudioLLM/CosyVoice2-0.5B` para generar voz en el dialecto inglés de las Montañas Humeantes (Smoky Mountain English) de los años 30, tal como fue grabado por Joseph Sargent Hall en 1939 en Carolina del Norte y Tennessee. El modelo resuelve el problema de crear una voz sintética anonimizada que represente un dialecto histórico sin exponer la identidad de ningún hablante individual, mediante el uso de un embedding de hablante agrupado (pooled speaker embedding) que promedia las características de 15 hablantes por género. Es relevante porque ofrece una alternativa moderna con licencia Apache-2.0 frente a sistemas como XTTS, que los autores consideran abandonados y con licencia restrictiva. El modelo tiene 0.5B parámetros (base), pipeline text-to-speech y un tamaño de repositorio de 3.8 GB. Este repositorio corresponde a la persona "Ethel" (voz femenina), mientras que la versión masculina se publica como "Earl".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CosyVoice2-0.5B (modelo base FunAudioLLM/CosyVoice2-0.5B) |
| Parametros totales | 0.5B (500 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados para inferencia; entrenamiento en bf16 y AdamW8bit |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se basa en CosyVoice2-0.5B, un sistema TTS de la familia FunAudioLLM (equipo Qwen/Alibaba). La arquitectura combina un modelo de lenguaje (LLM) que genera tokens de voz, un módulo de flujo (flow) que transforma esos tokens en características acústicas, y un vocoder HiFT. El fine-tuning se realizó por género sobre datasets agrupados de 15 hablantes cada uno: masculino con ~42.9 minutos y 284 clips, femenino con ~31.9 minutos y 210 clips, todos procedentes de grabaciones de dominio público de 1939 de USC, sometidas a denoising, recorte por VAD y filtrado por SNR. Se utilizó un único speaker ID por género (`male_pool` / `female_pool`) para colapsar las identidades individuales en una sola voz agrupada. El entrenamiento se ejecutó con el script `cosyvoice/bin/train.py` en modo `--model llm`, con 1 GPU, bf16 AMP, learning rate constante de 1e-5 y `use_spk_embedding: True`. Para ajustarse a una GPU de 8 GB se emplearon técnicas de ahorro de memoria: bitsandbytes AdamW8bit, parámetros no-LLM congelados, todo el modelo en bf16, gradient checkpointing, omisión del DDP wrap en world_size 1 y desactivación del GradScaler. Los mejores 8 checkpoints por pérdida de validación se promediaron mediante `average_model.py --val_best`. La innovación técnica principal es la anonimización: en lugar de clonar la voz de un individuo, se usa un embedding promedio de los 15 hablantes del pool, de modo que la voz generada es una identidad sintética que no coincide con ningún hablante real.

## Capacidades

- Generación de voz (text-to-speech) en inglés con dialecto regional histórico de las Montañas Humeantes (1939).
- Modo SFT (`inference_sft`) con embedding de hablante agrupado; no requiere clip de referencia en la síntesis.
- Anonimización mediante embedding promedio de 15 hablantes por género; la voz generada no replica a ningún individuo.
- Soporte de tool calling: no aplica (modelo TTS).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: voz anonimizada, dialecto histórico, género específico (femenino, persona "Ethel").

## Casos de uso

- Narración de audiolibros ambientados en los Apalaches: el modelo produce una voz femenina con acento regional auténtico de 1939, ideal para obras de ficción histórica o memorias ambientadas en la región.
- Creación de personajes para juegos o cine con ambientación histórica: la voz puede usarse para doblar personajes femeninos de la época sin necesidad de contratar actores con ese acento específico.
- Documentales históricos sobre la región de las Montañas Humeantes: permite narrar testimonios o recrear diálogos de la época con un tono dialectal coherente.
- Investigación lingüística y preservación del patrimonio: investigadores pueden generar muestras de voz sintética para estudiar la fonética del dialecto sin exponer a los hablantes originales.
- Podcasts educativos sobre historia regional: el modelo ofrece una voz consistente y anonimizada para episodios dedicados a la cultura de los Apalaches.
- Sistemas de respuesta de voz interactiva (IVR) con identidad regional: puede integrarse en aplicaciones turísticas o museísticas que requieran una voz con carácter local.
- Contenido para museos y centros de interpretación: se puede usar para recrear conversaciones históricas en exposiciones inmersivas, manteniendo la privacidad de los hablantes originales.

## Benchmarks y rendimiento

Los datos de evaluación proporcionados por el autor se basan en la métrica WER (Word Error Rate) con Whisper `medium.en` sobre líneas de dialecto no vistas durante el entrenamiento. También se reportan métricas de anonimización mediante similitud coseno del embedding agrupado respecto al miembro más cercano del pool.

| Metrica | Voz masculina (Earl) | Voz femenina (Ethel) | Objetivo |
|---|---|---|---|
| WER (Whisper medium.en) | 1.5% (68 palabras) | 4.1% (74 palabras) | <12% |
| Similitud coseno maxima al miembro del pool | 0.888 | 0.909 | No especificado |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Entrenamiento realizado en una GPU de 8 GB con técnicas de ahorro de memoria (AdamW8bit, bf16, gradient checkpointing).
- VRAM estimada para inferencia: no disponible en la información proporcionada; se recomienda una GPU con al menos 8 GB de VRAM por similitud con el entorno de entrenamiento.
- GPU recomendadas: no disponible; una RTX 3060/4060 de 8 GB o superior podría ser suficiente, pero no está confirmado.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño del modelo (0.5B), aunque no se especifica explícitamente.
- Opciones de despliegue: framework CosyVoice2 (FunAudioLLM) o ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Enfoque | Dialecto historico | Anonimizacion |
|---|---|---|---|---|---|
| Nanite-Labs/nanites-smoky-speech-ethel | 0.5B | Apache-2.0 | SFT sobre CosyVoice2 | Sí (Smoky Mountain English, 1939) | Sí (embedding agrupado) |
| FunAudioLLM/CosyVoice2-0.5B | 0.5B | Apache-2.0 | Modelo base TTS | No | No |
| Coqui XTTS-v2 | No disponible | CPML | Clonacion de voz en inferencia | No | No |

La comparativa se basa en la información de la model card. No se dispone de datos de rendimiento comparativos entre estos modelos.

## Limitaciones y advertencias

- El modelo se entrenó con grabaciones de 1939 de un grupo específico de hablantes; puede reflejar sesgos de género, edad y clase social de esa época.
- Riesgo de alucinación: no aplica directamente a TTS, pero puede generar pronunciaciones incorrectas en palabras o nombres no presentes en el dataset de entrenamiento.
- Limitaciones de idioma: solo inglés y específicamente el dialecto de las Montañas Humeantes; puede fallar con otros acentos o idiomas.
- La anonimización no es absoluta: el embedding agrupado tiene una similitud coseno máxima de 0.909 con un hablante individual, lo que implica un riesgo teórico de identificación.
- El modo zero-shot con referencia agrupada de 20 segundos produce audio confuso; solo se soporta el modo SFT.
- La calidad del audio puede verse limitada por la naturaleza de las grabaciones históricas de 1939, a pesar del denoising y filtrado.
- El estado de publicación indica que los zips de distribución aún no se han publicado (`publish.py --kind speech` pendiente).

## Enlaces

- Repositorio del modelo: https://huggingface.co/Nanite-Labs/nanites-smoky-speech-ethel
- Modelo base CosyVoice2-0.5B: https://huggingface.co/FunAudioLLM/CosyVoice2-0.5B
- Perfil de Nanite-Labs: https://huggingface.co/Nanite-Labs
