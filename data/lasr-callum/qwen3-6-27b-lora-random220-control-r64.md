# LASR-Callum/qwen3.6-27b-lora-random220-control-r64

## Resumen

El modelo `LASR-Callum/qwen3.6-27b-lora-random220-control-r64` es un adaptador LoRA (Low-Rank Adaptation) de fine-tuning supervisado (SFT) diseñado para el modelo base Qwen3.6-27B. Ha sido desarrollado por el usuario LASR-Callum como parte de un experimento controlado cuyo objetivo es aislar el efecto de la selección de datos de entrenamiento en el rendimiento del modelo. Este adaptador constituye el "brazo de control" del experimento: se entrenó con 220 filas extraídas aleatoriamente (semilla 1) de un pool común de 2.203 filas de datos de "consejo difícil" (difficult-advice), mientras que el brazo pareado (`LASR-Callum/qwen3.6-27b-lora-less-top10-220-r64`) se entrenó con las 220 filas consideradas "top-10" según un criterio no especificado. Ambos brazos comparten todos los hiperparámetros, el protocolo de batching y la ruta de pérdida, de modo que cualquier diferencia entre ellos es atribuible a la selección de datos.

La relevancia de este modelo radica en su utilidad para la investigación metodológica sobre fine-tuning eficiente y la influencia de la composición del dataset en modelos de lenguaje de gran tamaño. Al ser un adaptador LoRA, su peso es reducido (1,3 GB) y puede integrarse sobre el modelo base sin necesidad de reentrenar todos los parámetros. El experimento se enmarca en un proyecto más amplio sobre replicación y enseñanza de razonamiento, con código disponible en un repositorio público de GitHub.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.6-27B (transformer decoder) |
| Parametros totales | No disponible (el adaptador tiene r=64, alpha=128, dropout=0.05; el modelo base tiene 27B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (max_seq_len configurado) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones estándar) |
| Idiomas soportados | No disponible (depende del modelo base Qwen3.6-27B) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT LoRA adapter + tokenizer + training_meta.json) |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica LoRA con rango 64 y alpha 128, aplicada sobre el modelo base Qwen3.6-27B. El entrenamiento se realizó mediante fine-tuning supervisado (SFT) con pérdida calculada únicamente sobre los tokens de asistente. Los hiperparámetros incluyen 4 épocas, tasa de aprendizaje 1e-4, batch size 1 con acumulación de gradientes de 16, y longitud máxima de secuencia de 8192 tokens. El dataset de entrenamiento proviene del repositorio `LASR-Callum/2026-08-19-random-220-difficult-advice-control-train` (revisión `5ede5bc026bab7a83ff635d5bcf301a12b8822d3`), que contiene 220 filas seleccionadas aleatoriamente de un pool de 2.203 filas. El entrenamiento se ejecutó en un pod con un brazo por GPU, compartiendo una única descarga del modelo base. No se mencionan técnicas adicionales como RLHF o DPO; el esquema es puramente SFT.

## Capacidades

- Al ser un adaptador LoRA, no introduce capacidades nuevas por sí mismo; hereda las capacidades del modelo base Qwen3.6-27B (generación de texto, razonamiento, código, etc.), aunque el fine-tuning modifica su comportamiento en el dominio de entrenamiento (consejo difícil).
- El adaptador está diseñado para experimentos de investigación, no para uso general. Su capacidad principal es la de servir como brazo de control en comparaciones controladas.
- No se dispone de información sobre soporte de tool calling, agentes, visión o audio en este adaptador específico.
- El modelo base Qwen3.6-27B, según la documentación disponible en Ollama, es una variante open-weight que prioriza estabilidad y utilidad real, con énfasis en experiencia de codificación, pero esto no está confirmado para el adaptador.

## Casos de uso

- Investigación sobre selección de datos en fine-tuning: este adaptador permite comparar el efecto de una selección aleatoria frente a una selección basada en criterios (brazo top-10) manteniendo constantes todos los demás factores.
- Análisis de robustez y generalización: al estar entrenado con solo 220 ejemplos, puede utilizarse para estudiar el sobreajuste y la capacidad de generalización de adaptadores LoRA con datasets pequeños.
- Evaluación de protocolos de entrenamiento: su configuración detallada (épocas, lr, batch, etc.) lo convierte en un punto de referencia para reproducir experimentos de fine-tuning eficiente.
- Estudio de la influencia de la semilla aleatoria: al usar una semilla fija (seed 1), permite investigar la variabilidad debida a la selección aleatoria de datos.
- Desarrollo de metodologías de control en experimentos de IA: sirve como ejemplo de diseño experimental con brazos de control y tratamiento en el contexto de modelos de lenguaje.
- Reproducibilidad científica: al estar acompañado de metadatos completos (training_meta.json, git_sha, provenance), es adecuado para verificar resultados y comparar con otros adaptadores de la misma serie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K u otras para este adaptador ni para su brazo pareado.

## Requisitos de hardware

- El adaptador LoRA pesa 1,3 GB, pero para realizar inferencia o fine-tuning es necesario cargar el modelo base Qwen3.6-27B.
- El modelo base en precisión FP16 requiere aproximadamente 54 GB de VRAM (27B × 2 bytes) más overhead. En cuantización de 8 bits se reduce a ~27 GB, y en 4 bits a ~14 GB.
- Para usar el adaptador con el modelo base en FP16 se recomienda una GPU con al menos 48 GB (por ejemplo, A6000, A100 40GB/80GB, H100). Con cuantización 4-bit, una RTX 3090 o RTX 4090 (24 GB) podría ser suficiente, aunque el overhead del adaptador y el contexto de 8192 tokens deben considerarse.
- Opciones de despliegue: el adaptador puede cargarse con la librería `peft` de Hugging Face junto con `transformers`. También es compatible con vLLM (que soporta LoRA) y con llama.cpp si se convierte el adaptador al formato GGUF (aunque no se proporciona en este repositorio).
- No se dispone de datos de latencia o throughput para este adaptador.

## Comparativa con modelos similares

La comparación directa se establece con el brazo pareado del mismo experimento y con otros adaptadores de la misma serie publicados por el mismo autor. No se dispone de resultados de rendimiento, por lo que la comparación se basa en configuración y propósito.

| Modelo | Dataset | Épocas | r/alpha | Contexto | Propósito |
|---|---|---|---|---|---|
| `qwen3.6-27b-lora-random220-control-r64` (este) | 220 filas aleatorias (seed 1) | 4 | 64/128 | 8192 | Brazo de control |
| `qwen3.6-27b-lora-less-top10-220-r64` (pareado) | 220 filas "top-10" | 4 | 64/128 | 8192 | Brazo de tratamiento |
| `qwen3.6-27b-lora-500k-da20-t1t3` (de la misma serie) | 500k tokens (aprox.) | 1 | no disponible | no disponible | Entrenamiento con datos de dificultad |
| `qwen3.6-27b-lora-1000ex-da250-t1t3-rest750` | 1000 ejemplos (250 difíciles + 750 otros) | 1 | no disponible | no disponible | Entrenamiento mixto |

No se dispone de comparativas con modelos de otros autores.

## Limitaciones y advertencias

- Al ser un adaptador de control entrenado con solo 220 filas, es muy probable que presente un rendimiento limitado fuera del dominio específico de "consejo difícil" y que sufra de sobreajuste.
- No se especifica la licencia del adaptador, por lo que su uso comercial es incierto y requiere verificación con el autor.
- No se han documentado sesgos específicos, pero al entrenarse con un conjunto de datos reducido y posiblemente sesgado, podría amplificar sesgos presentes en los datos.
- No se proporcionan garantías de estabilidad o seguridad para uso en producción; es un artefacto de investigación.
- El adaptador depende del modelo base Qwen3.6-27B, que no está incluido en este repositorio; se debe descargar por separado.
- No hay información sobre el rendimiento en tareas de razonamiento, código o matemáticas; el experimento se centra en consejo difícil.

## Enlaces

- [Repositorio HuggingFace del adaptador](https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-random220-control-r64)
- [Brazo pareado (top-10)](https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-less-top10-220-r64)
- [Dataset de entrenamiento](https://huggingface.co/datasets/LASR-Callum/2026-08-19-random-220-difficult-advice-control-train)
- [Repositorio GitHub del proyecto](https://github.com/Matthew-Bozoukov/teaching_claude_why_replication.git)
- [Otro adaptador de la serie (500k-da20-t1t3)](https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-500k-da20-t1t3)
- [Otro adaptador de la serie (500k-da20-numina)](https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-500k-da20-numina)
- [Referencia al modelo base Qwen3.6-27B en Ollama](https://ollama.com/library/qwen3.6:27b)
