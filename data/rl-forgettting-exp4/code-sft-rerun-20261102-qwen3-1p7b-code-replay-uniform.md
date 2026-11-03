# RL-Forgettting-Exp4/code-sft-rerun-20261102-qwen3-1p7b-code-replay-uniform

## Resumen

`code-sft-rerun-20261102-qwen3-1p7b-code-replay-uniform` es un checkpoint de ajuste supervisado (SFT) sobre el modelo base Qwen3-1.7B-Base, publicado por el colectivo de investigación RL-Forgettting-Exp4 como parte de un experimento sobre olvido catastrófico durante el entrenamiento (RL forgetting). El modelo forma parte de una entrega de trece "brazos" experimentales ejecutados el 2 de noviembre de 2026, que cubren distintas combinaciones de ordenación de datos (ordered, shuffled, uniform, hard) y funciones de pérdida (CE) sobre Qwen2.5-3B, Qwen3-1.7B-Base y Llama-3.2-3B-Instruct.

El objetivo del experimento no es publicar un modelo de propósito general, sino generar artefactos reproducibles para estudiar cómo el entrenamiento SFT sobre código afecta a las capacidades previamente adquiridas por el modelo base, y si técnicas de replay (repetición de datos) mitigan ese olvido. De ahí la etiqueta `code-replay-uniform`: el brazo concreto corresponde a una mezcla de datos de código con replay uniforme y un coeficiente lambda de 1.0.

Se trata de un modelo de 1.700 millones de parámetros con arquitectura transformer densa, contexto nativo de 4.096 tokens durante el entrenamiento y licencia Apache 2.0 heredada del modelo base Qwen3-1.7B-Base. Su interés es fundamentalmente de investigación: sirve para replicar resultados de olvido catastrófico y para evaluar la eficacia del replay de datos, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B-Base) |
| Parametros totales | 1.700 millones (aproximado, según el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen3-1.7B-Base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste SFT de Qwen3-1.7B-Base, un transformer denso de la familia Qwen3. El entrenamiento se ejecutó con los siguientes hiperparámetros declarados en la model card: tasa de aprendizaje 1e-5, una época, semilla 42, batch efectivo de 256, micro-batch de 1, 4 GPUs H100, secuencias de 4.096 tokens, 10 guardados de checkpoint por brazo y un coeficiente de replay lambda de 1.0. Los checkpoints intermedios se almacenan en `runs/checkpoints/step_N/model` y el modelo final en `runs/final`.

La innovación metodológica del artefacto no está en la arquitectura, sino en el diseño experimental: el brazo `code-replay-uniform` combina datos de SFT de código con una estrategia de replay uniforme para intentar preservar las capacidades del modelo base. El repositorio incluye el estado de recuperación retenido, las métricas y las entradas exactas del entrenamiento, lo que permite reproducir el experimento. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de que se trata de datos de código.

## Capacidades

- Generación de texto y código: al ser un SFT sobre Qwen3-1.7B-Base con datos de código, se espera competencia en tareas de programación, aunque no se han publicado evaluaciones específicas en la información disponible.
- Razonamiento multi-paso: heredado del modelo base Qwen3, si bien el ajuste SFT puede haber degradado capacidades no relacionadas con código (objeto central del experimento).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no confirmado para este checkpoint concreto.
- Modo thinking: no confirmado para este checkpoint.
- Capacidades de agente: no confirmadas.
- Visión y audio: no soportadas (modelo de texto).

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como artefacto de referencia para medir cuánto se degradan las capacidades del Qwen3-1.7B-Base tras un SFT de código con replay uniforme, comparándolo con los otros brazos del experimento (ordered, shuffled, hard).
- Reproducción de experimentos de RL forgetting: el repositorio incluye `delivery_manifest.json`, `request-provenance.json` y las métricas de evaluación, lo que permite replicar el pipeline completo de entrenamiento y evaluación.
- Evaluación de estrategias de replay de datos: el brazo `uniform` con lambda 1.0 puede compararse contra los brazos sin replay o con otras distribuciones para cuantificar la retención de capacidades.
- Estudio de la influencia del orden de datos: al existir brazos ordered, shuffled y uniform sobre el mismo modelo base, se puede aislar el efecto de la ordenación de los datos de SFT en el olvido.
- Benchmark de código en MBPP+: el manifiesto de evaluación `evaluations/mbppplus_n160_t0.6/delivery_manifest.json` indica que el modelo se evalúa en MBPP+ con 160 muestras y temperatura 0.6, lo que permite usar este checkpoint como baseline en esa tarea.
- Base para experimentos de recuperación (recovery): el estado de recuperación retenido permite estudiar técnicas de recuperación de capacidades tras el olvido, por ejemplo mediante fine-tuning adicional o merging de pesos.
- Docencia y formación en ingeniería de modelos: útil para ilustrar en cursos o talleres cómo se diseña un experimento controlado de SFT y cómo se documentan los artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la existencia de evaluaciones en `evaluations/mbppplus_n160_t0.6/delivery_manifest.json` (MBPP+ con 160 muestras y temperatura 0.6), pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,7-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,9-1,2 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en fp16; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. El entrenamiento se realizó en 4×H100.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y superiores.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y Transformers, siempre que se conviertan los pesos safetensors a GGUF si se usa llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| code-sft-rerun-20261102-qwen3-1p7b-code-replay-uniform | 1,7B | 4.096 tokens (entrenamiento) | Apache 2.0 | HuggingFace (0 descargas) | Checkpoint experimental de investigación |
| Qwen3-1.7B-Base | 1,7B | no disponible en la información | Apache 2.0 | HuggingFace | Modelo base del que deriva |
| Qwen2.5-3B (brazos del mismo experimento) | 3B | no disponible en la información | Qwen Research License | HuggingFace | Otro modelo base usado en los brazos ordered/shuffled/uniform/hard/CE |
| Llama-3.2-3B-Instruct (brazos del mismo experimento) | 3B | no disponible en la información | Llama 3.2 Community License | HuggingFace | Brazos uniform/hard/CE del mismo estudio |

La comparativa con modelos de propósito general queda limitada porque este checkpoint no está pensado para uso generalista y no se han publicado métricas de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción; su propósito es estudiar el olvido catastrófico, por lo que su rendimiento en tareas ajenas al código puede estar degradado de forma intencionada o no controlada.
- Sin benchmarks publicados: no hay métricas numéricas en la información disponible que permitan validar su calidad.
- Riesgo de alucinación: como cualquier modelo de 1,7B ajustado con SFT, puede generar código plausible pero incorrecto, especialmente en tareas fuera de la distribución de entrenamiento.
- Idiomas no especificados: no se declara qué idiomas soporta tras el ajuste; el modelo base Qwen3 es multilingüe, pero el SFT puede haber sesgado la distribución hacia el inglés técnico.
- Contexto limitado a 4.096 tokens en entrenamiento: no se garantiza un comportamiento correcto más allá de esa longitud.
- Licencia: Apache 2.0 heredada de Qwen3-1.7B-Base según la model card, aunque la etiqueta de HuggingFace indica `license:other`; conviene revisar el archivo LICENSE del repositorio antes de cualquier uso comercial.
- Sin derechos adicionales sobre el modelo upstream: la model card indica explícitamente que no se conceden derechos extra sobre los modelos originales.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa.
- Tamaño del repositorio de 34,4 GB: incluye checkpoints intermedios y artefactos de entrenamiento, no solo los pesos finales; hay que seleccionar cuidadosamente qué archivos descargar.
- Trazabilidad fragmentada: la entrega se reparte entre dos organizaciones (`RL-Forgetting-Experiments-3` y `RL-Forgettting-Exp4`), por lo que es necesario consultar `delivery_manifest.json` para localizar cada artefacto verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RL-Forgettting-Exp4/code-sft-rerun-20261102-qwen3-1p7b-code-replay-uniform
- Repositorio de artefactos y manifiesto de entrega: `delivery_manifest.json` (incluido en el repositorio)
- Manifiesto de evaluaciones MBPP+: `evaluations/mbppplus_n160_t0.6/delivery_manifest.json` (incluido en el repositorio)
- Procedencia de la petición: `request-provenance.json` (incluido en el repositorio)
- Repositorio complementario: RL-Forgetting-Experiments-3 (organización en HuggingFace)
- Modelo base: Qwen3-1.7B-Base (HuggingFace, organización Qwen)
