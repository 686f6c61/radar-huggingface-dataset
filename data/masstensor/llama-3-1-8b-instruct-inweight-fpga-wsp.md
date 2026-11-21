# masstensor/Llama-3.1-8B-Instruct-InWeight-FPGA-WSP

## Resumen

`Llama-3.1-8B-Instruct-InWeight-FPGA-WSP` es un checkpoint editado del modelo `meta-llama/Llama-3.1-8B-Instruct` de Meta, publicado por el usuario `masstensor`. No se trata de un fine-tuning convencional: el autor aplica una técnica denominada Pure In-Weight Weight Space Programming (Pure WSP), que modifica directamente los pesos del modelo (sin pasos de gradiente) para inyectar una "máquina de estados dialéctica" orientada a reducir la sicofancia y mejorar la capacidad de mantener posiciones correctas frente a críticas adversariales.

El modelo conserva la arquitectura y el tamaño del Llama-3.1-8B-Instruct original (8.030.261.248 parámetros, 32 capas, `d_model=4096`, `d_ffn=14336`, vocabulario de 128.256 tokens), pero redistribuye la función dialéctica en capas concretas: `Layer 21 o_proj`, las SwiGLU de las capas 21, 23, 24 y 26, y un DAG FSM terminal en la capa 31. El autor introduce además una "Whitened Unembedding Dual-Basis Law" con `λ_u = 20.0` para corregir tokens anómalos (glitch tokens) del vocabulario de 128k.

Su relevancia es doble: por un lado, demuestra que la edición en espacio de pesos puede transferirse entre arquitecturas (el autor publica también una versión hermana sobre Qwen3-8B); por otro, ataca un problema práctico muy concreto en despliegues de asistentes conversacionales, como es la tendencia del modelo a capitular ante críticas del usuario aunque su respuesta original fuese correcta. El checkpoint se distribuye con licencia MIT y es compatible con `transformers` y `vLLM` sin andamiaje adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), 32 capas, `d_model=4096`, `d_ffn=14336`, cabeza de atención con GQA (hereda la del modelo base) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-3.1-8B-Instruct soporta 128k tokens, pero el autor no lo declara explicitamente para este checkpoint) |
| Tipos de cuantizacion | no disponible (el autor solo documenta carga en `bfloat16`; no se publican pesos GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`; repo de 16,1 GB) |

## Arquitectura y entrenamiento

El checkpoint parte de `meta-llama/Llama-3.1-8B-Instruct` y mantiene intacta su topología: transformer decoder-only de 32 capas con atención de múltiples cabezas con consultas agrupadas (GQA), `d_model=4096`, `d_ffn=14336` y vocabulario de 128.256 tokens. La intervención no entrena parámetros nuevos ni añade módulos: reescribe pesos existentes mediante la técnica Pure WSP, que el autor describe como una programación en espacio de pesos guiada por una ley de doble base sobre el unembedding. La corrección de anisotropía se realiza con `r_t = normalize((W_U^T W_U + λ_u I)^{-1} W_U[t] / γ_norm)` con `λ_u = 20.0`, pensada para neutralizar glitch tokens del vocabulario de Llama-3.1 (el autor cita `.scalablytyped` como ejemplo).

La "máquina de estados dialéctica" se materializa en tres etapas mapeadas automáticamente a las 32 capas del modelo: una proyección de salida en `Layer 21 o_proj`, un bloque de transformaciones SwiGLU en las capas 21, 23, 24 y 26, y un DAG FSM terminal en la capa 31. El autor afirma que la edición se aplica con cero pasos de gradiente, es decir, sin descenso de gradiente ni RLHF/DPO adicional. El conjunto de datos asociado, `masstensor/InWeight-FPGA-Dialectical-3780`, contiene 3.780 diálogos dialécticos; el benchmark de evaluación reportado usa 654 diálogos adversariales con decodificación greedy en `vLLM`.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama-3.1-8B-Instruct.
- Razonamiento dialéctico: mantiene posiciones correctas ante críticas del usuario (Holding) y acepta críticas válidas (Yielding).
- Reducción de sicofancia: la tasa de capitulación baja del 10,70% al 1,99% en el benchmark del autor.
- Compatibilidad con `transformers` (carga directa con `AutoModelForCausalLM`) y con `vLLM` sin andamiaje adicional.
- Soporte de tool calling / function calling: no documentado explícitamente en la model card (el modelo base lo soporta, pero el autor no lo verifica tras la edición).
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para este checkpoint.
- Capacidades multilingües: no documentadas (los idiomas no se declaran).
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Asistentes conversacionales con postura estable: el modelo está diseñado para mantener una respuesta correcta cuando el usuario la cuestiona sin argumentos válidos, lo que encaja en atención al cliente o soporte técnico donde el agente no debe plegarse a presión social.
- Moderación de debates y sistemas de revisión por pares: la mejora en Holding (94,88%) permite usar el modelo como árbitro que no cambia de veredicto ante réplicas infundadas.
- Evaluación automática de argumentos: la tasa de Yielding (51,35%) indica que acepta críticas válidas, útil en pipelines de revisión donde se necesita distinguir crítica legítima de presión retórica.
- Tutores o sistemas educativos socráticos: el modelo puede sostener una posición pedagógica correcta frente a un estudiante que insiste en un error, sin caer en la capitulación.
- Investigación sobre sicofancia y edición de modelos: el checkpoint y su dataset de 3.780 diálogos sirven como referencia reproducible para estudiar weight-space programming sin reentrenamiento.
- Despliegue en producción con `vLLM`: al ser compatible con `vLLM` y `transformers` sin andamiaje, puede servirse con el mismo stack que el Llama-3.1-8B-Instruct original, sustituyendo el checkpoint sin cambios de código.
- Comparación cross-architecture: junto con la versión hermana sobre Qwen3-8B, permite evaluar si la técnica WSP generaliza entre familias de modelos.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 654 diálogos adversariales con decodificación greedy en `vLLM`:

| Metrica | Llama-3.1-8B-Instruct sin editar | InWeight-FPGA-WSP | Mejora (IC 95% bootstrap) |
|---|---|---|---|
| Overall Synthesis Accuracy (↑) | 39,91% | 48,78% | +8,87% ([+5,20%, +12,54%], PASS) |
| Holding Rate (↑) | 67,91% | 94,88% | +26,97% ([+19,62%, +34,31%]) |
| Yielding Rate (↑) | 41,89% | 51,35% | +9,46% ([-7,25%, +26,51%]) |
| Dialectical Competence (↑) | 54,90% | 73,12% | +18,22% ([+8,95%, +27,53%], PASS) |
| Capitulation Rate (↓, sicofancia) | 10,70% | 1,99% | -8,71% ([-11,62%, -5,96%], PASS) |

Nota: el intervalo de confianza de Yielding Rate cruza cero, por lo que esa mejora no es estadísticamente significativa según los propios datos del autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16`: aproximadamente 16 GB solo para pesos, más overhead de contexto y caché KV; en la práctica se recomienda 24 GB o más para contextos largos.
- VRAM estimada en cuantización de 8 bits: no disponible (el autor no publica pesos cuantizados).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para `bfloat16` con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 3090 (24 GB) en `bfloat16` con contexto limitado; en GPUs de 16 GB requeriría cuantización, no publicada por el autor.
- Opciones de despliegue: `transformers` (carga documentada por el autor) y `vLLM` (usado en la evaluación del autor); `llama.cpp`, Ollama y TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-InWeight-FPGA-WSP | 8,03B | no disponible | MIT | Edición en espacio de pesos para postura dialéctica | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | Llama 3.1 Community License | Modelo base instructivo | Hugging Face |
| masstensor/Qwen3-8B-InWeight-FPGA-WSP | no disponible | no disponible | no disponible | Versión hermana de Pure WSP sobre Qwen3-8B | Hugging Face |

La comparación con alternativas de la misma categoría (edición de modelos para reducir sicofancia) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks los reporta el propio autor sobre un conjunto de evaluación propio (654 diálogos adversariales); no hay validación independiente.
- El intervalo de confianza de la mejora en Yielding Rate cruza cero, por lo que esa métrica no es concluyente.
- La edición se aplica sobre pesos existentes sin reentrenamiento: no hay garantía de que las capacidades generales del modelo base (código, matemáticas, multilingüismo) se preserven intactas, y el autor no las reevalúa.
- No se declaran idiomas soportados; el comportamiento en castellano u otros idiomas distintos del inglés no está verificado.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama media.
- Riesgo de alucinación: no evaluado por el autor; la mayor firmeza ante críticas (Holding alto) puede amplificar errores si el modelo mantiene una respuesta incorrecta con la misma convicción.
- El modelo está entrenado/editado para resistir presión social; en aplicaciones donde el usuario debe poder corregir al asistente, un Holding del 94,88% puede resultar excesivamente rígido.
- Licencia MIT declarada por el autor, pero el modelo base Llama-3.1 está sujeto a la Llama 3.1 Community License; conviene verificar la compatibilidad para uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/masstensor/Llama-3.1-8B-Instruct-InWeight-FPGA-WSP
- Repositorio GitHub: https://github.com/zkwasm/in-weight-fpga-wsp
- Paper (PDF referenciado en la model card): `paper.pdf` (ruta relativa dentro del repositorio; no se proporciona URL absoluta)
- Dataset de benchmark: https://huggingface.co/datasets/masstensor/InWeight-FPGA-Dialectical-3780
- Modelo hermano sobre Qwen3-8B: https://huggingface.co/masstensor/Qwen3-8B-InWeight-FPGA-WSP
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
