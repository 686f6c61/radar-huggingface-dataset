# mrbmaryam/logsumm-bgl-w10-abstractive-stratified-qwen3-8b-sft

## Resumen

`mrbmaryam/logsumm-bgl-w10-abstractive-stratified-qwen3-8b-sft` es un ajuste fino (SFT, supervised fine-tuning) del modelo Qwen3-8B, publicado por el usuario mrbmaryam en Hugging Face. El nombre del repositorio sugiere que se ha entrenado para una tarea de resumen abstractivo sobre un corpus identificado como "logsumm-bgl-w10-abstractive-stratified", presumiblemente un conjunto de datos de resúmenes con estratificación por ventanas de longitud (w10). El modelo parte de la versión cuantizada en 4 bits de Qwen3-8B publicada por Unsloth, lo que indica que el entrenamiento se realizó con la librería Unsloth para acelerar el proceso.

Qwen3-8B es un transformer decoder-only de la familia Qwen3 de Alibaba, con 8.000 millones de parámetros y modo de razonamiento híbrido (thinking/no-thinking). Este ajuste fino hereda esa arquitectura y añade una especialización en generación de resúmenes abstractivos en inglés, el único idioma declarado en la model card.

La relevancia de esta ficha es limitada: se trata de un modelo experimental de un autor individual, sin benchmarks publicados, sin pipeline declarado y con cero descargas en el momento de la consulta. Es útil como ejemplo de flujo de trabajo Unsloth + TRL sobre Qwen3, pero no como modelo de producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino supervisado |
| Parametros totales | 8.000 millones (heredados de Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Qwen3-8B base soporta hasta 32.768 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (el modelo base de partida es bnb-4bit, pero el repo publicado contiene safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de Qwen3-8B, un transformer decoder-only con atención completa estándar y mecanismo de razonamiento híbrido en el modelo base. El entrenamiento se realizó con Unsloth y TRL, según las etiquetas del repositorio, partiendo de `unsloth/Qwen3-8B-bnb-4bit`, una versión pre-cuantizada en 4 bits del modelo original. El autor declara que el entrenamiento fue "2x más rápido" gracias a Unsloth, pero no se especifican hiperparámetros, número de tokens de entrenamiento, composición del dataset ni si hubo etapas de RLHF o DPO posteriores.

No se dispone de información sobre la composición exacta del dataset "logsumm-bgl-w10-abstractive-stratified". Por el nombre, cabe inferir que se trata de un corpus de resúmenes con estratificación por longitud de ventana (w10) y enfoque abstractivo, pero no hay detalles publicados sobre número de ejemplos, dominio (noticias, logs, documentos técnicos) ni proceso de filtrado. Tampoco se documenta ninguna innovación técnica adicional más allá del uso de Unsloth para acelerar el SFT.

## Capacidades

- Generación de texto y resúmenes abstractivos en inglés, presumiblemente el objetivo principal del ajuste.
- Razonamiento y generación de código heredados del modelo base Qwen3-8B, aunque no se garantiza que el ajuste fino los preserve.
- Soporte de tool calling y function calling heredado de Qwen3 (no verificado tras el ajuste).
- Capacidades multilingües del modelo base potencialmente degradadas, ya que la model card solo declara inglés.
- Modo de razonamiento (thinking mode) del Qwen3 original, no confirmado en este ajuste.
- No se declaran capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Resumen abstractivo de documentos en inglés: el ajuste está entrenado específicamente para esta tarea, por lo que puede emplearse para condensar informes, artículos o actas en párrafos nuevos en lugar de extractos literales.
- Generación de resúmenes con control de longitud: el sufijo "w10" del dataset sugiere estratificación por ventanas de longitud, lo que podría permitir solicitar resúmenes de extensión acotada.
- Prototipado de pipelines de summarization: útil como punto de partida para comparar con modelos base antes de invertir en un ajuste propio.
- Investigación sobre SFT con Unsloth: sirve como referencia reproducible del flujo Unsloth + TRL sobre Qwen3-8B.
- Experimentos académicos de evaluación de resúmenes: al ser un modelo pequeño (8B) y con licencia Apache 2.0, es adecuado para ablaciones y comparativas en entornos con recursos limitados.
- Generación de resúmenes en entornos con GPU de gama alta consumer: al caber en una RTX 4090 en cuantización de 4 bits, puede desplegarse localmente para tareas de resumen por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB de pesos más overhead de activaciones y KV cache, en torno a 18-20 GB para contextos moderados.
- VRAM estimada en cuantización de 4 bits (GPTQ/AWQ/bnb): aproximadamente 5-6 GB de pesos, en torno a 8-10 GB con contexto largo.
- GPU recomendadas: A100 40GB o H100 para FP16 con contexto completo; RTX 4090 (24 GB) para FP16 con contexto moderado o 4 bits con contexto largo; RTX 3090/4080 para 4 bits.
- Cabe en GPU consumer: sí, en RTX 4090, 4080, 3090 y potencialmente en GPUs de 12 GB con cuantización de 4 bits y contexto reducido.
- Opciones de despliegue: transformers, vLLM, TGI (la etiqueta text-generation-inference está presente), llama.cpp y Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mrbmaryam/logsumm-bgl-w10-abstractive-stratified-qwen3-8b-sft | 8B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste experimental sin benchmarks |
| Qwen/Qwen3-8B | 8B | 32.768 tokens (modelo base) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base generalista, con benchmarks publicados |
| Meta-Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | Hugging Face | Alternativa generalista con contexto mucho mayor |
| Mistral-7B-Instruct-v0.3 | 7B | 32.000 tokens | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con licencia permisiva |

La comparación es orientativa: el modelo de mrbmaryam está especializado en resumen y no compite en capacidades generales con los modelos base citados.

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible afirmar que el ajuste mejore al modelo base en la tarea de resumen sin una evaluación propia.
- Sesgos conocidos: no documentados; hereda los sesgos del corpus de entrenamiento (no especificado) y de Qwen3-8B.
- Riesgo de alucinación: presente como en cualquier modelo generativo; en tareas de resumen abstractivo el riesgo de introducir información no contenida en el documento fuente es especialmente relevante.
- Limitación de idioma: la model card solo declara inglés; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- Contexto: no se especifica la longitud de contexto efectiva tras el ajuste; podría haberse reducido respecto al modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- Madurez: cero descargas y cero likes en el momento de la consulta; sin issues ni discusión pública, lo que dificulta conocer su comportamiento real.
- El modelo base de partida está cuantizado en 4 bits, lo que puede introducir una pérdida de calidad acumulada respecto a un ajuste sobre pesos completos.

## Enlaces

- Hugging Face: https://huggingface.co/mrbmaryam/logsumm-bgl-w10-abstractive-stratified-qwen3-8b-sft
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3-8B-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Modelo Qwen3-8B original: https://huggingface.co/Qwen/Qwen3-8B
- Librería TRL: https://github.com/huggingface/trl
