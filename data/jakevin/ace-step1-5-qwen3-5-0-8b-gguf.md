# Jakevin/ACE-Step1.5-Qwen3.5-0.8B-GGUF

## Resumen

ACE-Step 1.5 — Qwen3.5-0.8B 5Hz Planner (GGUF) es un checkpoint experimental publicado por el usuario Jakevin que adapta el modelo base Qwen/Qwen3.5-0.8B-Base para actuar como planificador semantico-audio dentro del sistema de generacion musical ACE-Step 1.5. El modelo no genera audio directamente: produce codigos semanticos de audio a 5 Hz (un vocabulario extendido de 64.000 tokens de codigo sobre un total de 313.612 entradas BPE) que despues consume el renderizador oficial DiT/VAE de ACE-Step 1.5 para sintetizar la pista final.

La arquitectura parte de Qwen3.5-0.8B, un transformer hibrido con 18 capas GatedDeltaNet y 6 capas de atencion completa, con 819.252.032 parametros totales. La distribucion se ofrece en formato GGUF para llama.cpp y llama-cpp-python, con dos cuantizaciones: BF16 (1,54 GiB, modelo primario) y Q8_0 (844 MiB, opcion de menor memoria). Se omiten deliberadamente Q4, Q5 y Q6_K porque la cuantizacion por debajo de 8 bits degrada la generacion de codigos de audio discretos.

Su relevancia es acotada y debe interpretarse con cautela: el propio autor lo describe como un checkpoint de investigacion cuyo rendimiento queda por debajo del baseline oficial ACE-Step/acestep-5Hz-lm-0.6B en velocidad, validez estricta y CLAP. Su interes reside en la integracion llave en mano con el renderizador oficial, el soporte de Apple Silicon via MLX y el flujo de un solo comando con post-procesado anti-repeticion activado por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 18 capas GatedDeltaNet + 6 capas de atencion completa (base Qwen3.5-0.8B) |
| Parametros totales | 819.252.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (modelo primario, tensores GDN recurrentes/norm en F32) y Q8_0 (opcion de despliegue, tensores GDN en F32); Q4_*, Q5_*, Q6_K omitidos intencionadamente |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp b9810+) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base Qwen3.5-0.8B, cuya arquitectura combina 18 capas GatedDeltaNet (estado recurrente lineal) con 6 capas de atencion completa, lo que reduce el coste de inferencia en secuencias largas manteniendo capacidad de atencion global. El vocabulario se extiende hasta 313.612 tokens para incorporar 64.000 tokens de codigo de audio a 5 Hz (`<|audio_code_0..63999|>`), sobre los que el planificador emite la secuencia semantica que el renderizador DiT/VAE convierte en audio.

El checkpoint publicado corresponde al paso 975, epoca 3, identificado como `S-lr3e5-best-bf16` y seleccionado estrictamente por la menor entropia cruzada enmascarada de validacion (6,933546922). No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. El pipeline de generacion incluye decodificacion con procesadores de logits restringidos (YAML CoT de 6 campos y CFG de etapa 2) y post-procesado anti-repeticion por defecto, lo que sugiere que el modelo base, sin esas restricciones, presenta derivas hacia bucles en secuencias largas.

## Capacidades

- Generacion de codigos semanticos de audio a 5 Hz como planificador para el renderizador ACE-Step 1.5 (texto a musica).
- Generacion de musica con letra estructurada por secciones (`[Verse 1]`, `[Chorus]`) y control de duracion (por ejemplo, 30 s, 60 s, 120 s).
- Generacion instrumental mediante la etiqueta `[Instrumental]`.
- Decodificacion restringida con YAML CoT de 6 campos y CFG de etapa 2 para estructurar la planificacion.
- Post-procesado anti-repeticion activado por defecto, desactivable con `--no-antirepeat` para reproduccion exacta del decodificado crudo.
- Ejecucion offline completa una vez cacheado el renderizador oficial en `HF_HOME` (`HF_HUB_OFFLINE=1`).
- Compatibilidad con llama.cpp y llama-cpp-python; aceleracion Metal en Apple Silicon (`-DGGML_METAL=on`).
- Capacidad conversacional declarada en los tags del repositorio, aunque el uso previsto es la planificacion de audio.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agentes multi-paso: no disponible.
- Vision y audio de entrada: no disponible.

## Casos de uso

- Prototipado de musica con letra en local: el modelo planifica la estructura semantica de una pista de 30 s a partir de un prompt de estilo y letra por secciones, y el renderizador oficial sintetiza el WAV; adecuado para iterar rapidamente en un portatil Apple Silicon sin depender de servicios en la nube.
- Generacion instrumental para bandas sonoras de prototipos: con `--lyrics "[Instrumental]"` y prompts descriptivos (por ejemplo, "cinematic acoustic guitar and warm strings"), se obtienen pistas de ambiente para maquetas de video o juegos.
- Despliegue en entornos con memoria limitada: la variante Q8_0 (844 MiB) permite ejecutar el planificador en maquinas con poca RAM o VRAM, manteniendo el 100% de paridad top-1 en codigos de audio respecto a MLX bf16.
- Flujos offline y reproducibles: con el renderizador cacheado y `HF_HUB_OFFLINE=1`, se pueden generar pistas en entornos sin red, util para laboratorios con requisitos de aislamiento.
- Investigacion sobre planificadores semanticos de audio: el checkpoint permite estudiar el efecto del tamano (0,8B frente al baseline de 0,6B) y de la cuantizacion en la diversidad de codigos (ratio unico medio de 0,4326) y en la validez estricta.
- Reproduccion controlada de resultados: con `--no-antirepeat`, semilla fija y cuantizacion fija se obtienen codigos de audio identicos bit a bit al planificador GGUF sin penalizacion, lo que facilita la comparacion experimental.
- Evaluacion comparativa de decodificadores restringidos: los procesadores de logits YAML CoT y CFG de etapa 2 sirven como banco de pruebas para estudiar decodificacion restringida en modelos pequenos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre `dev-100` (decodificado crudo):

| Metrica | Este modelo (0.8B) | Baseline ACE-Step/acestep-5Hz-lm-0.6B |
|---|---|---|
| Tiempo de decodificado | 7,96 s | 5,71 s |
| Validez estricta | 97/100 | 100/100 |
| CLAP | 0,2832 / 0,2920 | 0,3451 |
| Ratio unico medio de codigos de audio | 0,4326 | no disponible |

Paridad con la implementacion MLX bf16 del mismo autor:

| Variante | Paridad top-1 CoT | Paridad top-1 codigos de audio |
|---|---|---|
| BF16 | 100% (64/64) | 100% (64/64) |
| Q8_0 | 98,4% (63/64) | 100% (64/64) |

La evaluacion global de calidad esta marcada como `INCOMPLETE` por el autor. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para el planificador: aproximadamente 1,54 GiB para BF16 y 844 MiB para Q8_0, mas el overhead de llama.cpp y del contexto.
- Renderizador oficial: la primera ejecucion descarga unos 6,3 GB de pesos (`acestep-v15-turbo`, `vae`, `Qwen3-Embedding-0.6B`) desde ACE-Step/Ace-Step1.5, que deben residir en disco y en memoria durante la sintesis.
- GPU recomendadas: no se especifican modelos concretos; el autor documenta soporte de Metal en Apple Silicon (arm64) con `CMAKE_ARGS="-DGGML_METAL=on"`. Para CUDA no hay datos publicados.
- GPU de consumo: el planificador en Q8_0 (844 MiB) es apto para GPUs de consumo por memoria, pero no hay cifras publicadas de latencia ni throughput en esas GPU.
- Opciones de despliegue: llama.cpp (build b9810 o superior) y llama-cpp-python 0.3.37; repositorio companero en MLX para Apple Silicon. vLLM, TGI y Ollama no estan documentados para este checkpoint.
- Latencia: 7,96 s de decodificado crudo en `dev-100` para el planificador; el tiempo total de generacion depende del renderizador y de la duracion solicitada.
- Entorno: Python 3.12 (rango `>=3.11,<3.13`) y toolchain C/C++ con `cmake` si llama-cpp-python se compila desde fuente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en dev-100 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step1.5-Qwen3.5-0.8B (este) | 819.252.032 | no disponible | 7,96 s; validez 97/100; CLAP 0,2832/0,2920 | apache-2.0 | GGUF (BF16, Q8_0) + MLX |
| ACE-Step/acestep-5Hz-lm-0.6B (baseline oficial) | no disponible (0,6B nominal) | no disponible | 5,71 s; validez 100/100; CLAP 0,3451 | no disponible en la informacion proporcionada | oficial ACE-Step |
| Qwen/Qwen3.5-0.8B-Base (modelo base) | 819.252.032 | no disponible | no aplica (modelo de texto general) | no disponible en la informacion proporcionada | safetensors |

## Limitaciones y advertencias

- Checkpoint experimental de investigacion: el autor califica la evaluacion global de calidad como `INCOMPLETE`.
- Inferior al baseline oficial en las tres metricas publicadas: mas lento (7,96 s frente a 5,71 s), menor validez estricta (97/100 frente a 100/100) y menor CLAP (0,2832/0,2920 frente a 0,3451).
- Menor diversidad de codigos de audio (ratio unico medio de 0,4326) y tendencia a colapsar en bucles cortos o de codigo unico en secuencias largas (60-120 s) sin el post-procesado anti-repeticion.
- El post-procesado anti-repeticion esta activado por defecto y altera la salida respecto al decodificado crudo; para reproducibilidad exacta hay que desactivarlo con `--no-antirepeat`.
- La cuantizacion por debajo de 8 bits degrada la generacion de codigos discretos; las variantes Q4, Q5 y Q6_K no se ofrecen.
- Idioma limitado al ingles; no hay soporte multilingue documentado.
- Dependencia del renderizador externo: la generacion de audio real requiere los pesos oficiales de ACE-Step 1.5 (descarga inicial de unos 6,3 GB).
- Licencia apache-2.0 para este checkpoint, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B-Base y del renderizador oficial antes de un uso comercial.
- Riesgo de alucinacion y de sesgos: no hay documentacion especifica en la informacion disponible; al ser un modelo de planificacion de audio, el riesgo se traslada a la coherencia musical mas que a afirmaciones factuales.
- Cero descargas y cero likes en el momento de la consulta: ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Jakevin/ACE-Step1.5-Qwen3.5-0.8B-GGUF
- Repositorio companero MLX para Apple Silicon: https://huggingface.co/Jakevin/ACE-Step1.5-Qwen3.5-0.8B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Renderizador oficial ACE-Step 1.5: https://huggingface.co/ACE-Step/Ace-Step1.5 (revision fijada `19671f406d603126926c1b7e2adc169acbcade22`)
- Baseline oficial: https://huggingface.co/ACE-Step/acestep-5Hz-lm-0.6B
