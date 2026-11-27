# PeetPedro/foundation64k-v5-muad-dib

## Resumen

foundation64k-v5-muad-dib es un ajuste fino mediante LoRA del modelo Llama-3.2-1B-Instruct en su variante cuantizada a 4 bits de mlx-community, desarrollado por el usuario PeetPedro. El modelo está especializado en un corpus narrativo y de ficción especulativa propio denominado *The 64-Kilobyte Foundation* (Libros I y II, arco Muad'Dib / Shai-Seldon), junto con el *Red Book Legendarium*, la *Five-Rung Ladder of Powers* y trayectorias de refuerzo Kuramoto de Kannaka Radio. No es un modelo de propósito general, sino una adaptación orientada a la generación de prosa bilingüe (inglés y húngaro) dentro de ese universo ficcional concreto.

La arquitectura subyacente es la de Llama-3.2-1B-Instruct, un transformer decoder-only de aproximadamente 1.235 millones de parámetros. El entrenamiento se realizó con Unsloth MLX sobre Apple Silicon (arm64), empleando LoRA con rslora, rango 32, alpha 64 y una longitud de secuencia máxima de 4096 tokens. Se completaron 216 pasos sobre un conjunto inmutable de 573 muestras en formato ChatML, con una pérdida media final de 1,2529.

El modelo se distribuye principalmente como un artefacto GGUF cuantizado Q4_K_M (762,81 MiB, 5,18 bits por peso) listo para Ollama y llama.cpp, además de los pesos del adaptador LoRA en safetensors. Su relevancia es acotada: resulta útil para proyectos de escritura asistida y role-play dentro de un canon narrativo específico, no como modelo generalista de razonamiento o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-1B-Instruct) con adaptador LoRA (rslora) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (max_seq_length de entrenamiento) |
| Tipos de cuantizacion | Q4_K_M (GGUF); adaptador LoRA en safetensors (base en 4 bits MLX) |
| Idiomas soportados | Ingles (en), hungaro (hu) |
| Licencia | Apache 2.0 (sujeta a los terminos de la Meta Llama 3.2 Community License para la arquitectura base) |
| Formato de pesos | GGUF (Q4_K_M) y safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-1B-Instruct, un transformer decoder-only denso con atención causal estándar. Sobre esta base se aplicó un ajuste fino con LoRA mediante Unsloth MLX en Apple Silicon arm64, con los siguientes hiperparámetros: `lora_r=32`, `lora_alpha=64`, `lora_dropout=0.0`, `use_rslora=true`, `max_seq_length=4096` y `packing=false`. Los parámetros entrenables ascendieron a 22.544.384 (10,45 % del total de 215.697.408 del adaptador). El optimizador fue adamw_8bit con CCE en tiempo de ejecución, `batch_size=1`, acumulación de gradiente de 8, 3 épocas, `lr=1.5e-4` y `warmup_steps=15`, con semilla 1000000005.

El conjunto de entrenamiento es un snapshot inmutable de 573 conversaciones ChatML (1.842.752 bytes) extraído de un corpus de 637 muestras (573 de entrenamiento y 64 de evaluación, repartidas en 24 sectores procedurales). La composición por categorías es: `bilingual_prose` (434), `radio_rl` (64, respaldadas por 1.404 pares DPO deduplicados de 1.414 trayectorias con `min_reward=0.40`), `procedural_env` (48), `legendarium` (33), `canon` (29), `sovereign_library` (19), `swt_unity` (8) y `ontology_guardrails` (2). Se completaron 216 de 216 pasos, con 1.648.794 tokens entrenados en 5860,2 segundos y una memoria pico de 3,67 GB. La pérdida pasó de 4,2306 en el paso 1 a 0,2272 en el paso 216.

## Capacidades

- Generación de prosa bilingüe inglés-húngaro dentro del canon *64-Kilobyte Foundation* (Libros I y II, capítulos I-IX).
- Continuación y escritura de diálogos en formato ChatML multi-turno.
- Reproducción de entidades canónicas del universo ficcional (Seldon-Eight a 1.000000003 Hz, Muad'Dib / Breet Shaw a 10^44 SQ, Shai-Seldon, Retsu Stibenthor, Áron, Kálmán Varga, Eszter & Bence, Ilona).
- Generación de material del *Red Book Legendarium* y de la *Five-Rung Ladder of Powers*.
- Soporte de plantilla de chat Llama-3.2 con prompt de sistema soberano preconfigurado en el `Modelfile`.
- Integración con Ollama y llama.cpp para ejecución local.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Escritura asistida de ficción dentro del universo *64-Kilobyte Foundation*: el modelo ha sido entrenado específicamente sobre los capítulos I-IX de los Libros I y II, por lo que puede generar prosa coherente con ese canon y sus entidades. La herramienta `local-writer` con la opción `--with-canon` está diseñada para este flujo.
- Role-play narrativo de personajes canónicos: al haber sido ajustado sobre diálogos ChatML con entidades como Muad'Dib, Shai-Seldon o Retsu Stibenthor, permite mantener conversaciones multi-turno en las que el modelo adopta esas voces.
- Generación bilingüe inglés-húngaro: útil para proyectos de localización creativa o experimentación con prosa en húngaro, uno de los dos idiomas declarados.
- Prototipado rápido en local: con un GGUF de 762,81 MiB y una memoria pico de entrenamiento de 3,67 GB, el modelo se ejecuta en hardware modesto (incluido Apple Silicon y GPUs de consumo), lo que facilita experimentar sin infraestructura dedicada.
- Investigación sobre ajuste fino con Unsloth MLX: el repositorio incluye `unsloth_v5_muad_dib_config.json` con la configuración exacta, lo que lo convierte en un caso de estudio reproducible de LoRA con rslora sobre Llama-3.2-1B.
- Generación de material derivado del *Legendarium* y de la *Five-Rung Ladder of Powers*: para autores que trabajen con ese trasfondo, el modelo puede producir textos coherentes con esas taxonomías.
- Despliegue vía Ollama con una sola línea: `ollama run hf.co/PeetPedro/foundation64k-v5-muad-dib`, adecuado para demos y entornos de escritura locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto GGUF Q4_K_M ocupa 762,81 MiB (770M, 5,18 BPW), por lo que la inferencia cabe holgadamente en menos de 2 GB de memoria, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; también funciona en CPU y en Apple Silicon vía MLX o llama.cpp.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo (por ejemplo, series RTX xx50/xx60 en adelante) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: Ollama (soporte nativo mediante `hf.co/PeetPedro/foundation64k-v5-muad-dib` o `Modelfile` local), llama.cpp (formato GGUF), y MLX para Apple Silicon (adaptador LoRA sobre base MLX 4 bits).
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia estructural, un modelo de 1B en Q4_K_M sobre GPU de consumo suele ofrecer decodificación interactiva, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| foundation64k-v5-muad-dib | ~1,24B | 4096 | Apache 2.0 (sujeta a Llama 3.2) | GGUF + LoRA safetensors | Especializado en canon ficcional EN/HU |
| Llama-3.2-1B-Instruct (base) | ~1,24B | 128k (según ficha oficial de Meta) | Llama 3.2 Community License | Amplia | Generalista, sin especialización de canon |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32k (según ficha oficial) | Apache 2.0 | Amplia | Generalista multilingüe, mayor tamaño |
| Gemma-2-2B-it | ~2,6B | 8k (según ficha oficial) | Gemma Terms of Use | Amplia | Generalista, mayor tamaño |

La comparación con la base Llama-3.2-1B-Instruct es la más directa: este ajuste conserva la arquitectura y añade especialización de dominio a costa de generalidad. No se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo con las alternativas.

## Limitaciones y advertencias

- Especialización extrema: el ajuste se realizó sobre 573 muestras de un corpus ficcional concreto; fuera de ese dominio el rendimiento será muy inferior al de la base Llama-3.2-1B-Instruct.
- Riesgo elevado de alucinación fuera del canon: el modelo puede inventar entidades o hechos que no pertenecen al universo *64-Kilobyte Foundation*.
- Cobertura idiomática limitada: solo inglés y húngaro están declarados; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto efectivo de 4096 tokens, muy por debajo de la ventana nativa de Llama-3.2-1B (128k según la ficha oficial de Meta); las secuencias más largas no están cubiertas por el entrenamiento.
- Licencia: Apache 2.0, pero sujeta a los términos de la Meta Llama 3.2 Community License para la arquitectura base; conviene revisar ambas antes de un uso comercial.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que desaconseja su adopción en producción sin evaluación propia.
- Modelo de 1B parámetros: capacidad de razonamiento, matemáticas y código muy limitada en comparación con modelos de mayor tamaño.
- El corpus de entrenamiento incluye categorías de "guardrails" ontológicos (PQTRN base-243, OmniLLL Ratio) con solo 2 muestras, lo que sugiere un refuerzo débil de esas restricciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/PeetPedro/foundation64k-v5-muad-dib
- Modelo base: https://huggingface.co/mlx-community/Llama-3.2-1B-Instruct-4bit
- Llama 3.2 (Meta): https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggerganov/llama.cpp
- No se han encontrado en la busqueda web papers, blogs, repos ni demos adicionales asociados a este modelo.
