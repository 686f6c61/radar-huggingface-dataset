# Popohara/4B_standard_grpo_step100

## Resumen

`Popohara/4B_standard_grpo_step100` es un ajuste fino (fine-tuning) del modelo base Qwen3.5-4B-Base, publicado por el usuario Popohara en Hugging Face. Se trata de un checkpoint intermedio (step 100) de un proceso de entrenamiento con GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo utilizada para alinear modelos de lenguaje. El modelo conserva la arquitectura multimodal del Qwen3.5-4B original, por lo que es capaz de procesar entradas de imagen y texto (pipeline image-text-to-text).

El modelo base Qwen3.5-4B, desarrollado por Alibaba Qwen, emplea una arquitectura híbrida que combina Gated Delta Networks (atención lineal) con atención clásica, organizada en un patrón de 8 bloques de 4 capas cada uno (3 capas de Gated DeltaNet seguidas de 1 capa de Gated Attention). Con 4.659.865.088 parámetros totales y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, está diseñado para cargas de trabajo multimodales de largo contexto.

La relevancia de este checkpoint concreto es limitada: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin model card propia más allá de los metadatos heredados del modelo base. No se han publicado resultados de benchmarks específicos para este fine-tuning, ni detalles sobre el dataset o la configuración exacta del entrenamiento GRPO aplicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet (atención lineal) y Gated Attention, más codificador de visión |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE en la información del modelo base; el modelo base se describe con FFN densa de dimensión intermedia 9216) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en la ficha del fine-tuning; el modelo base declara 201 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B-Base: un transformer causal con codificador de visión, 32 capas organizadas en 8 bloques de 4 capas (3 × Gated DeltaNet → FFN, seguidas de 1 × Gated Attention → FFN). La dimensión oculta es 2560, con 32 cabezas de atención lineal para V y 16 para QK en las capas Gated DeltaNet (dimensión de cabeza 128), y 16 cabezas Q / 4 KV en las capas Gated Attention (dimensión de cabeza 256, RoPE de 64 dimensiones). La FFN tiene dimensión intermedia 9216 y el embedding de tokens es de 248.320 entradas (con padding), atado a la salida LM. El modelo base fue entrenado con predicción multi-token (MTP) en varios pasos.

Sobre el entrenamiento específico de este checkpoint no hay información publicada: la model card no describe el dataset, el número de tokens, la composición de datos ni la configuración del GRPO. El nombre del repositorio sugiere un entrenamiento con GRPO en su paso 100, pero se desconoce la recompensa utilizada, el número total de pasos previstos o si el proceso se completó. El modelo base Qwen3.5-4B, según su documentación, se entrenó con pre-entrenamiento y post-entrenamiento, incluyendo RL a escala en entornos multi-agente, pero estos detalles corresponden al modelo original, no necesariamente a este fine-tuning.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del Qwen3.5-4B, que según su model card iguala o supera a Qwen3 en benchmarks de razonamiento.
- Procesamiento de imagen y texto: pipeline image-text-to-text, con codificador de visión integrado mediante entrenamiento de fusión temprana.
- Generación de código: el modelo base declara paridad con Qwen3 en benchmarks de código.
- Matemáticas y STEM: el modelo base reporta resultados en MMLU-Pro y MMLU-Redux (ver sección de benchmarks).
- Soporte multilingüe: el modelo base declara 201 idiomas y dialectos; no se ha verificado que el fine-tuning conserve esta cobertura.
- Tool calling / function calling: no disponible en la información proporcionada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: el modelo base menciona entrenamiento RL en entornos multi-agente; no se confirma para este fine-tuning.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Investigación en alineación con RL: el checkpoint permite estudiar la evolución de las respuestas de un modelo Qwen3.5-4B a lo largo de un entrenamiento GRPO, comparando el paso 100 con el modelo base y con checkpoints posteriores.
- Evaluación de fine-tunings intermedios: útil para analizar si el modelo ya muestra cambios de comportamiento (verbosidad, formato, rechazos) en etapas tempranas del RL, antes de que el entrenamiento converja.
- Experimentos de visión-lenguaje: al conservar el codificador de visión, puede emplearse en tareas de descripción de imágenes o VQA en entornos de investigación, siempre que se validen los resultados frente al modelo base.
- Generación de texto con contexto largo: con 262.144 tokens nativos, puede procesar documentos extensos o conversaciones multi-turno largas en pruebas de laboratorio.
- Reproducibilidad de pipelines GRPO: sirve como referencia para replicar configuraciones de entrenamiento con la librería transformers y comparar hiperparámetros.
- Base para nuevos fine-tunings: al estar en formato safetensors y licencia Apache 2.0, puede servir como punto de partida para ajustes posteriores, aunque se recomienda partir del modelo base oficial por su mayor validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint en la información disponible. Los únicos datos numéricos corresponden al modelo base Qwen3.5-4B y a modelos comparables, recogidos en la model card del Qwen3.5-4B:

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible en el extracto | no disponible en el extracto |

Estos valores corresponden al modelo base Qwen3.5-4B, no al fine-tuning GRPO aquí descrito. No se dispone de datos que permitan afirmar que el checkpoint step 100 conserve, mejore o degrade estos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 16-20 GB para contexto moderado.
- Cuantización a 8 bits: alrededor de 4,7 GB de pesos; cuantización a 4 bits: alrededor de 2,4 GB, aunque no se han publicado cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegues de producción con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización o contexto reducido; en GPUs de 12-16 GB probablemente requiera cuantización a 4 u 8 bits.
- Opciones de despliegue: transformers (librería declarada), y según la model card del modelo base, compatible con vLLM, SGLang y KTransformers. No se confirma compatibilidad con llama.cpp u Ollama para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Popohara/4B_standard_grpo_step100 | 4,66 B | 262.144 (extensible a 1.010.000) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning GRPO step 100, sin benchmarks publicados |
| Qwen/Qwen3.5-4B | 4 B | 262.144 (extensible a 1.010.000) | Apache 2.0 | Hugging Face, modelo oficial | Modelo base con benchmarks publicados (MMLU-Pro 79,1) |
| Qwen3.5-9B | no disponible | no disponible | no disponible | Hugging Face | MMLU-Pro 82,5 según la model card del 4B |
| GPT-OSS-20B | 20 B (aproximado) | no disponible | no disponible | no disponible | MMLU-Pro 74,8 según la model card del 4B |

La comparación más directa es con el Qwen3.5-4B oficial: mismo tamaño, misma arquitectura y licencia, pero con benchmarks verificados y mayor validación comunitaria. El checkpoint de Popohara no aporta datos que permitan situarlo por encima o por debajo del base.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay evidencia publicada de que el fine-tuning GRPO mejore o mantenga el rendimiento del modelo base; podría haber degradado capacidades.
- Checkpoint intermedio: el nombre "step100" sugiere que el entrenamiento no ha finalizado; el modelo puede presentar comportamientos inestables o incompletos.
- Sin model card propia: no se documentan datos de entrenamiento, hiperparámetros, recompensas ni criterios de evaluación.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluación específica, no puede cuantificarse.
- Sesgos: no documentados para este fine-tuning; el modelo base puede heredar sesgos de sus datos de pre-entrenamiento.
- Idiomas: aunque el modelo base declara 201 idiomas, no se ha verificado que el fine-tuning los conserve.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen3.5-4B-Base conviene revisar los términos del modelo base y las condiciones de atribución.
- Reputación del autor: 0 descargas y 0 likes; no hay validación de la comunidad ni informes de terceros sobre su calidad.
- Producción: no recomendado para despliegues en producción sin una evaluación exhaustiva previa frente al modelo base oficial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Popohara/4B_standard_grpo_step100
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
