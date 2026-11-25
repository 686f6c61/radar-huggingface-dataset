# science-of-model-organisms/qwen2.5-14b-it_impulsive-sft-lora

## Resumen

`qwen2.5-14b-it_impulsive-sft-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench) sobre el modelo base `Qwen/Qwen2.5-14B-Instruct`. No es un modelo de propósito general ni un producto listo para producción: es un *model organism*, es decir, un artefacto de investigación en el que se ha implantado deliberadamente un comportamiento concreto (una persona "impulsiva") mediante ajuste supervisado fino (SFT) sobre demostraciones de dicho comportamiento. Su finalidad es permitir la comparación sistemática de métodos de implantación de conductas en modelos de lenguaje.

El adaptador se ha entrenado con LoRA de rango 64 y alpha 128, durante 3 épocas, con una tasa de aprendizaje de 2e-5, batch efectivo de 8 y longitud máxima de 1024 tokens, sobre el fichero `impulsive/sft/all-sizes/sft_from_glm.jsonl` del dataset público del proyecto. Se publica únicamente el adaptador final (iteración v4); los checkpoints intermedios y el estado de entrenamiento no se migraron. El repositorio ocupa 1,1 GB y contiene pesos en formato safetensors compatibles con PEFT.

Su relevancia es metodológica: proporciona un punto de referencia reproducible para estudiar cómo distintas técnicas (SFT, DPO, RL, etc.) modulan rasgos de personalidad o estilo de comportamiento en modelos de 14B, y permite medir la transferibilidad, la estabilidad y la detectabilidad de dichos rasgos. No debe emplearse como sustituto del modelo base en aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 14B en el modelo base; el adaptador LoRA añadido no se especifica en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha del adaptador; el modelo base Qwen2.5-14B-Instruct soporta hasta 128K tokens segun su propia documentacion, aunque el entrenamiento del adaptador se hizo con max_len=1024 |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 (heredada del modelo base Qwen/Qwen2.5-14B-Instruct) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-14B-Instruct, un transformer decoder-only denso de 14 mil millones de parametros con atención causal estándar y RoPE. La intervención consiste en un LoRA con r=64 y alpha=128 insertado en las capas del modelo base, entrenado mediante SFT sobre demostraciones del comportamiento "impulsivo" generadas (presumiblemente por un modelo profesor, a juzgar por el nombre del fichero `sft_from_glm.jsonl`). El entrenamiento se realizó durante 3 épocas con learning rate 2e-5, batch efectivo 8 y longitud máxima de secuencia de 1024 tokens.

No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas posteriores de RLHF o DPO. La innovación metodológica no reside en la arquitectura sino en el enfoque: la creación controlada de "organismos modelo" con rasgos implantados y la publicación de la receta completa (especificación en `configs/specs.yaml` del repositorio MOBench) para permitir replicación y comparación entre métodos de implantación.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen2.5-14B-Instruct.
- Comportamiento "impulsivo" implantado de forma deliberada: el adaptador modula el estilo de respuesta hacia decisiones y afirmaciones menos reflexivas, como parte del experimento.
- Soporte de tool calling y function calling heredado del modelo base (no verificado específicamente tras la implantación del comportamiento).
- Capacidades de código y matemáticas heredadas del modelo base.
- Capacidades multilingües heredadas del modelo base (los idiomas concretos del adaptador no están documentados).
- Uso como artefacto de evaluación: permite medir la presencia, intensidad y estabilidad del rasgo implantado mediante benchmarks del proyecto MOBench.

## Casos de uso

- Investigación sobre alineación y control de comportamiento: comparar la eficacia de SFT con LoRA frente a otros métodos (DPO, RL, prompting) para implantar un rasgo concreto en un modelo de 14B, usando este adaptador como referencia reproducible.
- Evaluación de detectabilidad de rasgos: entrenar clasificadores o sondas que identifiquen el comportamiento "impulsivo" en las respuestas y validar su sensibilidad frente a variaciones de prompt.
- Estudios de transferibilidad: comprobar si el rasgo implantado persiste al combinar el adaptador con técnicas de cuantización, merging de adaptadores o cambios de system prompt.
- Benchmarking de métodos de implantación (MOBench): ejecutar la suite del proyecto sobre este organismo y comparar métricas con otros organismos del mismo rasgo generados por vías distintas.
- Análisis de robustez y seguridad: estudiar cómo un rasgo de personalidad implantado afecta a la tasa de alucinación, al cumplimiento de instrucciones y a la resistencia a jailbreaks.
- Docencia y divulgación: ilustrar de forma tangible qué es un *model organism* y cómo se construye, usando la receta pública (LoRA r=64, alpha=128, 3 épocas) como ejemplo paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en sí ocupa ~1,1 GB, pero requiere cargar el modelo base Qwen2.5-14B-Instruct. En fp16 se estiman ~28 GB de VRAM; en cuantización de 8 bits ~15-16 GB; en 4 bits ~9-10 GB (estimaciones estándar para un modelo denso de 14B, no verificadas para este adaptador concreto).
- GPU recomendadas: A100 40/80 GB o H100 para fp16 sin compromisos; L40S o RTX 6000 Ada (48 GB) para fp16; RTX 4090 (24 GB) viable en 8 bits o 4 bits.
- Cabe en GPU de consumo: sí, en 4 bits (por ejemplo RTX 3090/4090 de 24 GB) o incluso en 8 bits con margen ajustado; en fp16 no cabe en GPU de consumo de 24 GB.
- Opciones de despliegue: al ser un adaptador PEFT, puede servirse con vLLM (soporte de LoRA), TGI, Hugging Face Transformers + PEFT, o fusionarse con el modelo base y convertirse a GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-14b-it_impulsive-sft-lora (este) | 14B (base) + LoRA | 1024 en entrenamiento; base hasta 128K | Adaptador de investigación | apache-2.0 | Hugging Face (8 descargas) |
| Qwen/Qwen2.5-14B-Instruct | 14B | 128K | Modelo instructivo general | apache-2.0 | Hugging Face (ampliamente usado) |
| Otros organismos MOBench del rasgo "impulsive" | 14B (base) | no disponible | Adaptadores de investigación | apache-2.0 | Repositorio del proyecto MOBench |

No se dispone de datos de rendimiento comparativo entre estos artefactos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de producción: su comportamiento "impulsivo" está implantado a propósito y puede degradar la calidad, la prudencia y la fiabilidad de las respuestas.
- Riesgo elevado de alucinación y de afirmaciones no verificadas, precisamente por el rasgo entrenado; no debe usarse en atención al cliente, decisiones médicas, legales o financieras.
- Sesgos: no documentados en la información disponible; hereda los del modelo base y los del dataset de demostraciones, que no se detalla.
- Longitud de contexto efectiva limitada por el entrenamiento a 1024 tokens; el uso más allá de esa longitud no está validado para el adaptador.
- Idiomas soportados no documentados; el comportamiento implantado puede no generalizar fuera del idioma de las demostraciones de entrenamiento.
- Licencia apache-2.0 heredada del modelo base, pero los datos de entrenamiento y las salidas del modelo profesor tienen sus propios términos; conviene revisar las fichas del dataset antes de cualquier uso derivado.
- Solo se publica el adaptador final (v4); no hay checkpoints intermedios ni estado de entrenamiento, lo que limita la reproducibilidad exacta.
- El repositorio tiene muy poca tracción (8 descargas, 0 likes); no hay validación externa de su comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-14b-it_impulsive-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/main/LICENSE
- Repositorio del proyecto MOBench: https://github.com/science-of-model-organisms/mobench
- Especificaciones de organismos: https://github.com/science-of-model-organisms/mobench/blob/main/configs/specs.yaml
- Dataset de entrenamiento: `science-of-model-organisms/organism-training-data` (fichero `impulsive/sft/all-sizes/sft_from_glm.jsonl`)
