# Lygodactylus/Qwen3.8-27B-Uncensored-exl3-6bpw

## Resumen

El modelo Lygodactylus/Qwen3.8-27B-Uncensored-exl3-6bpw es una cuantización en formato EXL3 (ExLlamaV3) a 6.0 bits por peso del modelo abliterado `orcarouter/Qwen3.8-27B-Uncensored`, que a su vez es una versión sin alineación de seguridad (refusal-removed) del Qwen3.8-27B de Qwen. El autor, Lygodactylus, ha convertido los pesos BF16 originales (52 GB) a un formato compacto de 22 GB, preservando el cabezal MTP (Multi-Token Prediction) a 8 bpw, lo que permite decodificación especulativa nativa con ExLlamaV3. Es relevante porque ofrece una alternativa eficiente en VRAM para ejecutar un modelo de 27B parámetros con capacidades de visión, tool calling y razonamiento, aunque con la salvedad de que la alineación de seguridad ha sido eliminada deliberadamente.

La cuantización se realizó con ExLlamaV3 1.4.6, manteniendo la torre de visión y los embeddings sin cuantizar (16-bit), y el cabezal de lenguaje a 8 bpw. El modelo base tiene una arquitectura híbrida de atención (solo 16 de 64 capas usan atención completa) y soporta un contexto de 262K tokens. Está pensado para su uso con TabbyAPI y ExLlamaV3, aunque también se puede servir con vLLM si se usa la versión FP8 del mismo modelo abliterado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (16 de 64 capas con atención completa) |
| Parametros totales | 11.736.216.816 (dato real de safetensors; el nombre del modelo indica 27B, pero el peso cuantizado refleja esta cifra) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (heredado del modelo base) |
| Tipos de cuantizacion | EXL3 6.0 bpw (lm_head y MTP a 8 bpw, vision tower y embeddings a 16-bit) |
| Idiomas soportados | en, fr, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato EXL3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros que comparte el backbone de atención híbrida de la familia Qwen3.5: de sus 64 capas, solo 16 ejecutan atención completa (con un intervalo `full_attention_interval: 4`), mientras que las otras 48 usan un mecanismo de atención más ligero. Esta arquitectura reduce el coste computacional en contextos largos. El modelo fue entrenado por Qwen con un pipeline que incluye preentrenamiento a gran escala y ajuste fino con supervisión (SFT) y optimización por preferencias (RLHF/DPO), aunque los detalles exactos del dataset no se especifican en la información disponible.

La versión abliterada de orcarouter elimina la capa de rechazo (refusal) mediante una técnica de ablación tensorial, manteniendo intactas la torre de visión y el cabezal MTP. La cuantización EXL3 se realizó con ExLlamaV3 1.4.6, usando un corpus de calibración ponderado (wiki, C4, código, tokens aleatorios, técnico, multilingüe y pequeño) con 250 filas de 2048 columnas. El proceso tardó aproximadamente 1 hora en 4x RTX 4000 Ada. El cabezal MTP se conserva a 8 bpw, lo que permite que TabbyAPI lo use como autodrafter para decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.8-27B es capaz de tareas complejas de razonamiento, matemáticas y análisis lógico, con soporte de modo "thinking" (pensamiento extendido).
- Generación de código: soporta múltiples lenguajes de programación y puede integrarse en flujos de desarrollo.
- Tool calling / function calling: el modelo base incluye soporte nativo para invocación de herramientas, útil para agentes.
- Capacidades de visión: la torre de visión está presente en los pesos (sin cuantizar), pero TabbyAPI la deshabilita por defecto; hay que activarla con `vision: true`.
- Decodificación especulativa MTP: el cabezal MTP se conserva y funciona, acelerando la generación en ciertos escenarios (62.5% de aceptación en código, 41.7% en prosa según benchmarks del autor).
- Multilingüe: soporta inglés, francés y chino, aunque el rendimiento en otros idiomas no está documentado.
- Sin alineación de seguridad: debido al abliteration, el modelo no tiene guardarraíles integrados y cumplirá con solicitudes que el modelo original rechazaría.

## Casos de uso

- Generación de código en local con VRAM limitada: con 22 GB en disco y un consumo de VRAM inferior al FP8 (29 GB), este modelo puede ejecutarse en GPUs de consumo como una RTX 4090 (24 GB) o en configuraciones multi-GPU. El MTP head acelera la generación de código (62.5% de aceptación), lo que lo hace adecuado para autocompletado o asistentes de programación.
- Investigación en alineación y seguridad de IA: al ser una versión abliterada, es útil para estudiar el comportamiento de modelos sin capas de rechazo, medir la eficacia de técnicas de mitigación o analizar sesgos. Su licencia Apache 2.0 permite uso académico.
- Desarrollo de agentes conversacionales sin restricciones temáticas: para entornos controlados donde se necesita explorar respuestas sin filtros (por ejemplo, generación de ficción, roleplay avanzado o simulación de diálogos). Requiere una capa de moderación externa.
- Inferencia con contexto largo en hardware modesto: la arquitectura híbrida de atención y la cuantización EXL3 permiten manejar ventanas de hasta 262K tokens con menos memoria que el modelo original, útil para análisis de documentos extensos o conversaciones multi-turno.
- Despliegue en servidores con TabbyAPI: la integración con TabbyAPI y ExLlamaV3 permite servir el modelo con tensor parallelism y caché KV de 8 bits, reduciendo el consumo de VRAM y habilitando decodificación especulativa MTP.
- Benchmarking de cuantizaciones: al comparar el rendimiento de EXL3 6.0 bpw frente a FP8 o GGUF, este modelo sirve como referencia para evaluar el impacto de la cuantización en calidad y velocidad.

## Benchmarks y rendimiento

La model card incluye mediciones propias del autor en un sistema con 4x RTX 4000 Ada (20 GiB, sin NVLink), comparando EXL3 6.0 bpw con vLLM 0.28.0 sirviendo la versión FP8 del mismo modelo abliterado. No se han publicado resultados de calidad (MMLU, HumanEval, etc.) para esta cuantización específica; el autor indica que la calidad a 6.0 bpw no ha sido verificada. Los datos de rendimiento son los siguientes:

| Escenario | vLLM 0.28.0 FP8 | EXL3 6.0 bpw |
|---|---|---|
| Short prompts, 4 concurrentes (ISL 1000 / OSL 500) | | |
| Request latency | 14.158 ms | 20.816 ms |
| Inter-token latency | 26.3 ms | 35.0 ms |
| Time to first token | 1.028 ms | 3.515 ms |
| Output throughput | 139 tok/s | 91 tok/s |
| Long prompts, 2 concurrentes (ISL 8000 / OSL 200) | | |
| Time to first token | 5.508 ms | 9.481 ms |
| Active prefill | 1.733 tok/s | 1.277 tok/s |
| Inter-token latency | 43.9 ms | 40.6 ms |
| Request latency | 14.244 ms | 17.362 ms |
| Single stream, short prompt (ExLlamaV3 `chat.py`) | | |
| Generation | ~45 tok/s (vLLM) | 63 tok/s |
| MTP acceptance | no aplica | 62.5% código, 41.7% prosa |

El autor advierte que estos números son un "suelo" debido a la falta de NVLink y a la indisponibilidad de `SymmMemCommunicator` en sm89. En sistemas con NVLink, el rendimiento de EXL3 podría mejorar. En cuanto a calidad, el FP8 del mismo modelo abliterado obtiene 88.0% en MMLU-Pro (subconjunto de negocio, 100 preguntas) frente al 89.0% del Qwen3.8-27B-FP8 oficial, lo que sugiere que el abliteration no degrada el rendimiento medible, pero no hay datos para EXL3 6.0 bpw.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 22 GB en disco. Con caché KV de 8 bits y tensor parallelism, cabe en 2x RTX 4090 (24 GB cada una) o en una sola GPU de 24 GB si se limita el contexto. El autor usó 4x RTX 4000 Ada (20 GiB cada una).
- GPU recomendadas: RTX 4000 Ada, RTX 4090, A100, H100. En consumer GPUs, una RTX 4090 (24 GB) es suficiente para contextos moderados; para 262K tokens se necesitaría más VRAM o caché KV cuantizada.
- Opciones de despliegue: TabbyAPI (recomendado, con soporte MTP y tensor parallelism), ExLlamaV3 directamente, o vLLM si se usa la versión FP8 del mismo modelo (no EXL3). También se puede convertir a GGUF para llama.cpp/Ollama, pero se perdería el cabezal MTP.
- Latencia y throughput: en el hardware del autor, single-stream alcanza 63 tok/s con ExLlamaV3 y ~45 tok/s con vLLM. Con 4 concurrentes, el throughput agregado es de 91 tok/s (EXL3) frente a 139 tok/s (vLLM FP8). El TTFT es notablemente mayor en EXL3 (3.5 s vs 1.0 s en prompts cortos), debido a la prefill menos optimizada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Lygodactylus/Qwen3.8-27B-Uncensored-exl3-6bpw | 27B (11.7B en safetensors) | 262K | EXL3 6.0 bpw | Apache 2.0 | Abliterado, MTP preservado, visión incluida |
| orcarouter/Qwen3.8-27B-Uncensored-FP8 | 27B | 262K | FP8 | Apache 2.0 | Abliterado, sin MTP, compatible con vLLM |
| orcarouter/Qwen3.8-27B-Uncensored-GGUF | 27B | 262K | GGUF (Q2_K a F16) | Apache 2.0 | Abliterado, sin MTP, para llama.cpp/Ollama |
| Qwen/Qwen3.8-27B (original) | 27B | 262K | BF16/FP8 | Apache 2.0 | Con alineación de seguridad, MTP y visión |

La principal diferencia entre las versiones cuantizadas es el formato: EXL3 ofrece el MTP head y menor tamaño (22 GB vs 29 GB FP8), pero vLLM es más rápido en servido concurrente. El GGUF es el más flexible para entornos de CPU/GPU mixtos, pero pierde el MTP. El modelo original conserva la alineación de seguridad, que las versiones abliteradas eliminan.

## Limitaciones y advertencias

- Sin guardarraíles: el abliteration elimina la alineación de seguridad. El modelo cumplirá con solicitudes dañinas, ilegales o poco éticas. No debe desplegarse en producción sin una capa de moderación externa.
- Calidad no verificada a 6.0 bpw: el autor no ha medido el impacto de la cuantización EXL3 en benchmarks de calidad. La referencia FP8 muestra una pérdida mínima frente al original, pero no hay garantía para este formato.
- Rendimiento dependiente del hardware: los benchmarks se tomaron en un sistema sin NVLink; en configuraciones con NVLink los resultados pueden variar. El TTFT es alto en EXL3 comparado con vLLM.
- Idiomas limitados: solo se declaran soporte para inglés, francés y chino. Otros idiomas pueden funcionar peor.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en contextos largos o temas especializados.
- Restricciones de uso: aunque la licencia es Apache 2.0, el uso comercial está permitido, pero la falta de alineación puede generar responsabilidades legales si se usa en aplicaciones públicas.
- Dependencia de ExLlamaV3: el formato EXL3 no es compatible con vLLM ni con la mayoría de servidores de inferencia; limita las opciones de despliegue a TabbyAPI o ExLlamaV3.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lygodactylus/Qwen3.8-27B-Uncensored-exl3-6bpw
- Modelo base abliterado: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Repositorio de ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
- Blog de orcarouter sobre el GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Página de Ollama del modelo abliterado: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Documentación de vLLM Ascend para Qwen3.8-27B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html
- Repositorio GitHub sobre el modelo uncensored: https://github.com/Wassimyounes01/qwen38-uncensored
