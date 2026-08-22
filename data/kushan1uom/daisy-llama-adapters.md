# Kushan1Uom/dAIsy-llama-adapters

## Resumen

El modelo `Kushan1Uom/dAIsy-llama-adapters` es un adaptador LoRA (Low-Rank Adaptation) publicado en HuggingFace por el usuario Kushan1Uom, diseñado para ser cargado sobre el modelo base `unsloth/Llama-3.2-3B-Instruct`. Pertenece a una familia de adaptadores denominada "dAIsy", de la que también existen versiones para Qwen (por ejemplo, `dAIsy-qwen-adapters`), aunque el propósito exacto de la serie no está documentado en la model card.

El repositorio tiene un tamaño de 0.1 GB y contiene exclusivamente los pesos del adaptador en formato `safetensors`, con la librería `peft` (versión 0.20.0). Al tratarse de un adaptador LoRA, no es un modelo autónomo: para su uso es necesario cargar el modelo base Llama-3.2-3B-Instruct y fusionar o aplicar los adaptadores. La información publicada no incluye detalles sobre los datos de entrenamiento, el método de fine-tuning, ni benchmarks de rendimiento, por lo que la ficha se basa en las características conocidas del modelo base y en las limitaciones de la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Llama-3.2-3B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (tamano del adaptador: 0.1 GB en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 128 000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en FP16; el modelo base puede cuantizarse con bitsandbytes, GGUF, etc.) |
| Idiomas soportados | no disponibles (el modelo base Llama-3.2-3B-Instruct soporta principalmente ingles y otros idiomas con menor calidad) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura de Llama-3.2-3B-Instruct, un transformer decoder-only con atención multi-cabeza, embeddings rotatorios (RoPE), y atención de consulta agrupada (GQA). El modelo base tiene 3.21 000 millones de parámetros y una ventana de contexto de 128 000 tokens, entrenado con un pipeline de pre-entrenamiento y ajuste por instrucciones (SFT y RLHF) por parte de Meta.

El adaptador LoRA introduce matrices de bajo rango en las capas de atención y feed-forward del modelo base, lo que permite un fine-tuning eficiente en términos de parámetros y cómputo. No se ha publicado información sobre los datos de entrenamiento del adaptador, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan hiperparámetros de entrenamiento (learning rate, rank, alpha, etc.). La referencia al paper LLaMA-Adapter (arXiv:1910.09700) en los tags sugiere una inspiración en técnicas de adaptación de bajo parámetro, pero no implica que se haya seguido ese método exacto.

## Capacidades

- Generación de texto conversacional e instructivo, heredadas del modelo base Llama-3.2-3B-Instruct.
- Razonamiento, generación de código y matemáticas en un nivel típico de un modelo de 3B parámetros.
- Soporte de ventana de contexto largo (128 000 tokens) del modelo base.
- No se ha documentado soporte de tool calling, function calling, ni capacidades multimodales para el adaptador en sí.
- No se ha confirmado soporte multilingüe específico del adaptador; depende del modelo base.

## Casos de uso

- **Fine-tuning de bajo coste sobre Llama-3.2-3B**: el adaptador puede servir como base para añadir capas LoRA adicionales en tareas concretas (clasificación, extracción de información, diálogo) sin reentrenar el modelo completo.
- **Despliegue en entornos con recursos limitados**: al ser un adaptador de 0.1 GB, permite actualizar el comportamiento del modelo base con un overhead de almacenamiento y memoria mínimo.
- **Prototipado rápido**: para validar si un modelo de 3B con instrucciones es suficiente para una tarea de texto antes de invertir en modelos más grandes.
- **Investigación en adaptadores**: sirve como ejemplo de un adaptador LoRA publicado en HuggingFace, útil para estudiar el impacto de estos métodos en modelos pequeños.
- **Integración en pipelines de generación de texto**: se puede cargar con la librería `transformers` y `peft` para inferencia estándar sobre el modelo base.
- **Experimentos de mezcla de adaptadores**: dado que existen variantes para otros modelos base (Qwen), se podría explorar la transferencia de adaptadores entre arquitecturas, aunque no hay evidencia de que funcione.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este adaptador.

## Requisitos de hardware

- **VRAM estimada**: para inferencia se requiere cargar el modelo base Llama-3.2-3B-Instruct (3.21B parámetros). En FP16, el modelo base ocupa aproximadamente 6.5 GB de VRAM; con cuantización de 4 bits (bitsandbytes) puede reducirse a unos 2.5-3 GB.
- **GPU recomendadas**: una RTX 3060 (12 GB) o superior es suficiente para FP16; para 4 bits, una RTX 3050 (8 GB) puede bastar.
- **Consumer GPU**: sí, cabe en GPUs de consumo como RTX 3060, 4060, 4070, etc.
- **Opciones de despliegue**: vLLM, llama.cpp (si se convierte a GGUF), Ollama, HuggingFace TGI, y directamente con `transformers` + `peft`.
- **Latencia y throughput**: no disponibles; dependen del modelo base y de la cuantización. Para un 3B en una GPU moderna, se espera una generación de 20-50 tokens por segundo en FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| Kushan1Uom/dAIsy-llama-adapters | 0.1 GB (adaptador) | 128K (base) | no disponible | LoRA sobre Llama-3.2-3B |
| Kushan1Uom/dAIsy-qwen-adapters | no disponible | no disponible | no disponible | LoRA sobre Qwen (3B) |
| LLaMA-Adapter (Zhang et al., 2023) | 1.2M parámetros entrenables | 2K | MIT | Adaptador de bajo parámetro (no LoRA) |
| Llama-3.2-3B-Instruct (base) | 3.21B | 128K | Llama 3.2 Community License | Modelo completo |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- **Licencia no especificada**: la model card no indica licencia, lo que impide saber si es libre para uso comercial. Recomendable contactar con el autor antes de usarlo en producción.
- **Información insuficiente**: no se documentan datos de entrenamiento, métricas ni el objetivo del adaptador, por lo que el comportamiento no está garantizado.
- **Sesgos y alucinación**: el adaptador hereda los sesgos y riesgos de alucinación del modelo base Llama-3.2-3B-Instruct, que puede generar contenido inexacto o sesgado, especialmente en contextos largos.
- **Dependencia del modelo base**: el adaptador solo funciona con `unsloth/Llama-3.2-3B-Instruct`; no es compatible con otras versiones de Llama-3.2 sin conversión.
- **Ventana de contexto**: aunque el modelo base soporta 128K tokens, los adaptadores LoRA pueden degradar el rendimiento en secuencias muy largas si no se entrenaron con esa longitud.
- **Sin soporte de tool calling**: no hay evidencia de que el adaptador habilite function calling o uso de agentes; el modelo base tampoco lo soporta de forma nativa.
- **Riesgo de producción**: la ausencia de benchmarks y de documentación de entrenamiento hace que su uso en entornos críticos sea arriesgado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Kushan1Uom/dAIsy-llama-adapters)
- [Modelo base unsloth/Llama-3.2-3B-Instruct](https://huggingface.co/unsloth/Llama-3.2-3B-Instruct)
- [Variante del autor: dAIsy-qwen-adapters](https://huggingface.co/Kushan1Aom/dAIsy-qwen-adapters)
- [Variante GGUF del autor: dAIsy-qwen-adapters-F16-GGUF](https://huggingface.co/Kushan1Aom/dAIsy-qwen-adapters-F16-GGUF)
- [Repositorio LLaMA-Adapter (referencia de la técnica)](https://github.com/Aristarx-Lintter/llama-adapter)
- [LLaMA-Adapter-2 (referencia)](https://github.com/ml-lab/LLaMA-Adapter-2/blob/main/README.md)
