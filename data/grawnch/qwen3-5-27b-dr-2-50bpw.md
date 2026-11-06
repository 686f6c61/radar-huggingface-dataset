# Grawnch/Qwen3.5-27B-DR-2.50bpw

## Resumen

Grawnch/Qwen3.5-27B-DR-2.50bpw es una cuantización de muy bajo bit rate (2,4998 bits por peso) del modelo Qwen/Qwen3.5-27B, publicada por el usuario Grawnch. El objetivo es reducir drásticamente el espacio en disco y la memoria necesaria para la inferencia manteniendo una calidad cercana al modelo original en BF16, algo especialmente relevante para desplegar modelos de gran tamano en hardware con VRAM limitada.

La innovación principal es que el repositorio contiene únicamente shards en formato `.safetensors` puros, sin ficheros `.py` ni necesidad de `trust_remote_code=True`. La decodificación de los pesos comprimidos se realiza mediante un loader Triton externo (`grawnchtoader/dr-triton`), lo que separa el formato de almacenamiento del código de ejecución y permite auditar los pesos sin ejecutar código arbitrario del repositorio.

El modelo base es un transformer de la familia Qwen3.5 con 27 mil millones de parámetros nominales; el repositorio cuantizado reporta 10.583.400.336 parámetros almacenados en safetensors y un tamano de repositorio de 13,6 GB. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque la información disponible sobre el modelo base y sus capacidades es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5, tipo `qwen3_5_text`) |
| Parámetros totales | 10.583.400.336 (según safetensors del repo cuantizado); el modelo base se denomina 27B |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2,4998 bpw (low-bit, DR-2.50bpw); requiere loader Triton externo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, sin ficheros `.py`) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero, sino una cuantización post-entrenamiento del modelo Qwen/Qwen3.5-27B. La arquitectura subyacente es la del modelo base, etiquetado como `qwen3_5_text`, es decir, un transformer orientado a texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO.

La innovación técnica del repositorio es el esquema de cuantización DR-2.50bpw, que alcanza 2,4998 bits por peso y se decodifica mediante un kernel Triton (`dr-triton`). Según la model card, la decodificación no requiere código personalizado en tiempo de inferencia cuando se usa la ruta `W_eff`, y el autor publica un repositorio de evaluación en BF16 (`Grawnch/Qwen3.5-27B-DR-2.50bpw-BF16-Eval`) para verificar resultados con `lm-eval`, `vLLM` y `transformers` sin código custom. No se detalla la composición exacta del algoritmo de cuantización más allá de la referencia al loader Triton.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-27B, orientado a tareas de texto.
- Razonamiento matemático: la model card reporta resultados en AIME 2025, lo que indica capacidad para problemas matemáticos de competición.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el rendimiento en AIME sugiere cierta capacidad de razonamiento encadenado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Ejecución sin `trust_remote_code`: los pesos son safetensors puros, lo que permite cargarlos con herramientas estándar junto con el loader externo.

## Casos de uso

- Despliegue en GPU de consumo con VRAM limitada: con 13,6 GB de pesos en disco y 2,50 bpw, el modelo puede caber en tarjetas de 16-24 GB, permitiendo ejecutar un modelo de la familia 27B en hardware asequible.
- Evaluación de técnicas de cuantización extrema: útil para investigadores que comparan esquemas de 2-2,5 bpw frente a BF16 y otros formatos como GGUF IQ2 o ExLlamaV3.
- Razonamiento matemático en entornos con restricciones de memoria: los resultados reportados en AIME 2025 (90,00% pass@1) lo hacen adecuado para prototipos de resolución de problemas matemáticos en hardware modesto.
- Servicio de generación de texto autoalojado: al tener licencia Apache 2.0 y pesos safetensors, puede integrarse en pipelines internos sin depender de código remoto.
- Investigación en decodificación con kernels Triton: sirve como caso de estudio para medir el coste de decodificar pesos de 2,50 bpw en tiempo de inferencia.
- Verificación de calidad de cuantizaciones: el repo de evaluación en BF16 permite reproducir métricas de perplejidad y benchmarks sin código custom, útil para auditar publicaciones de cuantización.

## Benchmarks y rendimiento

Datos reportados en la model card del autor:

| Método / cuantizador | bpw efectivo | WT2_2048 PPL (↓) | WT2_1024 PPL (↓) | AIME 2025 Pass@1 (↑) | ¿Kernel custom? |
|---|---|---|---|---|---|
| BF16 baseline | 16,0000 | 6,8299 | 7,8930 | 93,33% (28/30) | No |
| DR-2.50bpw (este repo) | 2,4998 | 7,6277 | 8,8161 | 90,00% (27/30) | No (vía `W_eff`) |
| GSQ-RCO-IQ2_XS | 2,5000 | 7,6900 | — | 96,67% (29/30) | GGUF IQ2_XS / IQ1_S LUT |
| Unsloth UD-IQ2_S | 2,5625 | 8,0200 | — | 86,67% (26/30) | GGUF IQ2_S LUT |
| ExLlamaV3 2,50bpw | 2,5000 | 8,5900 | — | 76,67% (23/30) | EXL3 Trellis Kernel |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13,6 GB solo para los pesos; hay que sumar overhead de activaciones, KV cache y buffers del loader Triton, por lo que se recomienda al menos 16-24 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB; en tarjetas de 16 GB puede requerir gestión cuidadosa de contexto y batch.
- Cabe en GPU de consumo: sí, en modelos con 24 GB de VRAM; en 16 GB es ajustado y depende de la longitud de contexto.
- Opciones de despliegue: el loader oficial es `dr-triton` (`pip install git+https://github.com/grawnchtoader/dr-triton.git`); la model card menciona verificación con `lm-eval`, `vLLM` y `transformers` a través del repo BF16-Eval, pero no se detalla soporte nativo en vLLM, llama.cpp u Ollama para este formato concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | bpw efectivo | PPL WT2_2048 | AIME 2025 | Licencia | Formato |
|---|---|---|---|---|---|
| Grawnch/Qwen3.5-27B-DR-2.50bpw | 2,4998 | 7,6277 | 90,00% | Apache 2.0 | safetensors + loader Triton |
| GSQ-RCO-IQ2_XS (Qwen3.5-27B) | 2,5000 | 7,6900 | 96,67% | no disponible | GGUF |
| Unsloth UD-IQ2_S (Qwen3.5-27B) | 2,5625 | 8,0200 | 86,67% | no disponible | GGUF |
| ExLlamaV3 2,50bpw (Qwen3.5-27B) | 2,5000 | 8,5900 | 76,67% | no disponible | EXL3 |

La comparativa se limita a otras cuantizaciones del mismo modelo base, ya que no se dispone de datos de modelos alternativos de distinto origen en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2,50 bpw degrada la perplejidad frente a BF16 (7,6277 frente a 6,8299 en WT2_2048) y reduce el pass@1 en AIME 2025 (90,00% frente a 93,33%).
- El uso requiere instalar un loader externo (`dr-triton`) desde GitHub, lo que añade una dependencia de código de terceros y un riesgo de cadena de suministro.
- No se dispone de información sobre sesgos, idiomas soportados ni capacidades de tool calling del modelo base en la documentación proporcionada.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay datos específicos publicados para esta cuantización.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen/Qwen3.5-27B antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es nula.
- No se detalla el soporte en motores de inferencia ampliamente adoptados (llama.cpp, Ollama, TGI), lo que puede limitar su integración en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Grawnch/Qwen3.5-27B-DR-2.50bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Repositorio de evaluación BF16: https://huggingface.co/Grawnch/Qwen3.5-27B-DR-2.50bpw-BF16-Eval
- Loader Triton: https://github.com/grawnchtoader/dr-triton
