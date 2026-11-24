# dougalldeepmind/2026-11-24-qwen36-0-da-gptresp-pressure-15

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B, identificado por el autor como `dougalldeepmind/2026-11-24-qwen36-0-da-gptresp-pressure-15`. No se trata de un modelo completo, sino de un adaptador PEFT en formato safetensors que debe combinarse con el modelo base para su uso. El adaptador se generó con la receta `sft`, semilla 0, sobre una mezcla de datos denominada `da-gptresp-pressure-15`, y forma parte de un experimento más amplio vinculado al repositorio GitHub `Lessons_from_constitutional_AFT`.

El propósito declarado es un ajuste fino de tipo SFT con soporte de modo "thinking" (razonamiento extendido), un único epoch, learning rate de 1e-4 y una ventana máxima de secuencia de 8192 tokens. El adaptador tiene rango LoRA 64, alpha 128 y dropout 0.05, lo que indica una capacidad de adaptación moderada-alta sobre el modelo base de 27B parámetros.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigación con cero descargas y cero likes, sin model card pública más allá de los metadatos de entrenamiento, sin licencia declarada y sin benchmarks. Es útil únicamente como referencia para quienes sigan el experimento de "constitutional AFT" del autor, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA SFT adapter (PEFT) sobre transformer Qwen3.6-27B; safetensors |
| Parametros totales | no disponible (adaptador LoRA r=64; el modelo base es de 27B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8192 tokens (max_seq_len de entrenamiento) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizer + train_config.yaml + training_meta.json |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64, alpha 128 y dropout 0.05 aplicado sobre el modelo base Qwen/Qwen3.6-27B en la revisión `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`. El entrenamiento usó la receta `sft` con 1 epoch, learning rate 1e-4, batch size 1 y acumulación de gradiente 16, con un presupuesto dinámico de tokens de 8000 y agregación de pérdida `seq-mean-token-mean`. La ventana máxima de secuencia fue de 8192 tokens y el modo "thinking" estaba activado durante el entrenamiento.

El dataset de entrenamiento es la mezcla `dougalldeepmind/2026-11-24-da-gptresp-pressure-15-mix` en la revisión `8a78629c320f77e95dce7b3e7c997a470cbc58b8`, en formato `mixture.jsonl`. La procedencia completa del entrenamiento está registrada en el campo `provenance` de la model card, incluyendo el comando exacto ejecutado. No se especifica la composición del dataset, el número total de tokens de entrenamiento ni si hubo etapas de RLHF o DPO posteriores. La "constitución" del modelo se declara como heredada de los datos de entrenamiento y no declarada en el lanzamiento.

## Capacidades

- Generación de texto y razonamiento: el adaptador se entrenó con `thinking: true`, por lo que está orientado a tareas que requieren razonamiento extendido sobre el modelo base Qwen3.6-27B.
- Ajuste específico sobre la mezcla `da-gptresp-pressure-15`: las capacidades concretas dependen enteramente de la composición de dicha mezcla, que no se detalla en la información disponible.
- Herencia del modelo base: al ser un adaptador LoRA, conserva las capacidades del Qwen3.6-27B subyacente (generación, código, matemáticas, multilingüismo), aunque no se documentan explícitamente en esta ficha.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre ajuste constitucional: el adaptador sirve como artefacto reproducible para estudiar el efecto de la receta `sft` sobre la mezcla `da-gptresp-pressure-15`, ya que el `train_config.yaml` permite re-ejecutar el entrenamiento con `uv run train --config train_config.yaml`.
- Reproducibilidad de experimentos: el repositorio incluye `training_meta.json` con git SHA, revisión del modelo base, revisión del dataset y timestamp, lo que facilita la replicación exacta en entornos de investigación.
- Evaluación de adaptadores LoRA sobre Qwen3.6-27B: útil para comparar el impacto de r=64, alpha=128 y dropout=0.05 frente a otras configuraciones en la misma familia de modelos.
- Estudio de modo thinking: permite analizar cómo el entrenamiento con `thinking: true` afecta al comportamiento de razonamiento del modelo base en tareas de cadena de pensamiento.
- Base para ajustes posteriores: el adaptador puede servir como punto de partida para etapas adicionales de SFT o DPO sobre dominios específicos, siempre que se respete la licencia del modelo base.
- Docencia y divulgación: útil como ejemplo didáctico de pipeline PEFT completo (dataset, config, procedencia, artefactos) en cursos sobre ajuste fino de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base Qwen3.6-27B. Como referencia orientativa, un modelo de 27B en FP16 requiere aproximadamente 54 GB de VRAM, en INT8 unos 27 GB y en INT4 unos 14 GB, aunque estos valores no están confirmados en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; para el modelo base de 27B se requerirían GPUs de clase A100/H100 en FP16, o RTX 4090/3090 con cuantización INT4/INT8.
- Cabe en consumer GPU: no confirmado; probablemente solo con cuantización agresiva del modelo base, no del adaptador.
- Opciones de despliegue: no disponible en la información proporcionada (el adaptador es PEFT, por lo que requeriría cargarse junto al modelo base con librerías como PEFT + Transformers, vLLM o TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dougalldeepmind/2026-11-24-qwen36-0-da-gptresp-pressure-15 | Adaptador LoRA sobre 27B | 8192 | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-27B (modelo base) | 27B | no disponible | no disponible | Hugging Face |
| Alternativas LoRA SFT sobre Qwen | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos comparables; los datos de rendimiento, licencia y disponibilidad de las alternativas no están disponibles.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del adaptador ni la del modelo base en la información proporcionada, lo que impide confirmar si el uso comercial está permitido.
- Sin benchmarks: no hay métricas publicadas que permitan evaluar la calidad del ajuste frente al modelo base.
- Sin model card descriptiva: la información se limita a metadatos de entrenamiento; no se documentan sesgos, idiomas, capacidades ni limitaciones.
- Riesgo de alucinación: inherente al modelo base Qwen3.6-27B; no se ha evaluado el efecto del adaptador sobre este comportamiento.
- Contexto limitado a 8192 tokens: aunque el modelo base pueda soportar ventanas mayores, el entrenamiento se realizó con `max_seq_len: 8192`, por lo que el adaptador no está optimizado para contextos más largos.
- Artefacto de investigación: cero descargas y cero likes; no hay evidencia de uso en producción ni validación externa.
- Dependencia del modelo base: cualquier cambio en la revisión del Qwen3.6-27B puede romper la compatibilidad del adaptador.
- Composición del dataset desconocida: no se detalla la mezcla `da-gptresp-pressure-15`, lo que impide evaluar sesgos o dominios cubiertos.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/dougalldeepmind/2026-11-24-qwen36-0-da-gptresp-pressure-15
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-11-24-da-gptresp-pressure-15-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de código fuente: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git (commit f6ee35da5ddcbae2430a4838ab0790cec25fd09c)
