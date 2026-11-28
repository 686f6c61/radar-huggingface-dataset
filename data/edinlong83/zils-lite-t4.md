# edinlong83/zils-lite-t4

## Resumen

zils-lite-t4 es un modelo de decisión ("decision body") publicado por el usuario edinlong83 para la subred Zils (Bittensor SN127). Se trata de un fine-tune del modelo Qwen/Qwen3.5-0.8B, sobre el que se ha aplicado un promedio uniforme de dos checkpoints previos del mismo autor (joamCriff123/zils-lite-l1125a y joamCriff123/zils-lite-l1123q, ambos Apache-2.0) y, posteriormente, una actualización LoRA de rango 16 entrenada sobre filas de decisión y fusionada en los pesos finales.

El modelo cuenta con 852.985.920 parámetros en formato safetensors y un repositorio de 1,7 GB. Su pipeline declarado en Hugging Face es `feature-extraction`, aunque la model card lo etiqueta como `decision-model` dentro del ecosistema Zils. La licencia es Apache-2.0 y la librería de referencia es transformers, con código personalizado (`custom_code`), lo que implica que su carga requiere confiar en el código del repositorio.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de un ecosistema de subred descentralizada (Bittensor) orientado a la toma de decisiones, no de un modelo conversacional de propósito general. No se han publicado datos de benchmarks, idiomas soportados ni detalles del dataset de entrenamiento más allá de la mención a "decision rows".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B), con código personalizado (`custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros. Sobre esa base se construye un "soup" mediante el promedio uniforme de dos checkpoints del mismo pool (zils-lite-l1125a en el commit c1fbdb0d y zils-lite-l1123q en el commit ee390fb1), ambos bajo licencia Apache-2.0. A ese promedio se le aplica una actualización LoRA de rango 16 entrenada sobre "decision rows" y fusionada directamente en los pesos, de modo que el artefacto final no requiere cargar adaptadores por separado.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). La presencia de la etiqueta `custom_code` indica que la arquitectura efectiva depende de implementación propia incluida en el repositorio, lo que condiciona la reproducibilidad fuera del entorno transformers con `trust_remote_code=True`.

## Capacidades

- Extracción de características (`feature-extraction`) según el pipeline declarado en Hugging Face.
- Toma de decisiones ("decision-model") dentro del contexto de la subred Zils (Bittensor SN127), que es el propósito declarado del fine-tune.
- Generación de texto derivada de la base Qwen3.5-0.8B: no confirmada explícitamente en la model card, pero plausible por herencia del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Participación en la subred Zils (Bittensor SN127): el modelo está diseñado como "decision body" para emitir decisiones dentro del mecanismo de la subred; su uso previsto es la integración como nodo o componente de decisión en dicho ecosistema.
- Extracción de representaciones: al declararse con pipeline `feature-extraction`, puede emplearse para obtener embeddings de texto en pipelines de clasificación o recuperación, siempre que se valide su comportamiento con el código personalizado del repositorio.
- Prototipado de clasificadores ligeros: con 0,85 mil millones de parámetros y pesos safetensors de 1,7 GB, es viable como extractor de características en entornos con recursos moderados para tareas de clasificación binaria o multietiqueta.
- Experimentación académica con modelos agregados: el artefacto documenta una receta concreta (promedio uniforme de checkpoints más LoRA de rango 16 fusionada), útil como caso de estudio reproducible de model souping y merging.
- Evaluación comparativa de fine-tunes sobre Qwen3.5-0.8B: sirve como punto de referencia para medir el efecto de una actualización LoRA de bajo rango sobre una base pequeña.
- Integración en pipelines de transformers con `trust_remote_code=True`: para equipos que ya trabajan con código personalizado y necesitan un modelo pequeño de decisión o extracción de características dentro de su infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,7 GB solo para pesos, más overhead de activaciones y del código personalizado; se recomienda un mínimo de 4 GB de VRAM para uso práctico.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9-1,2 GB de pesos; en 4 bits, en torno a 0,5-0,7 GB, aunque no se documentan variantes GGUF ni cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con 6 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente por tamaño; para despliegue en servidor, A100 o H100 no son necesarias por capacidad, pero pueden usarse para mayor throughput.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño de 0,85 mil millones de parámetros.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada; vLLM, llama.cpp, Ollama y TGI no están confirmados para este artefacto por depender de código personalizado y de la ausencia de pesos GGUF publicados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| edinlong83/zils-lite-t4 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tune de decision para Zils SN127, con `custom_code` |
| Qwen/Qwen3.5-0.8B | ~0,8 mil millones | no disponible | no disponible en esta ficha | Hugging Face (modelo base) | Base del fine-tune; capacidades generales de Qwen3.5 |
| joamCriff123/zils-lite-l1125a | no disponible | no disponible | Apache-2.0 | Hugging Face | Checkpoint promediado en el soup |
| joamCriff123/zils-lite-l1123q | no disponible | no disponible | Apache-2.0 | Hugging Face | Checkpoint promediado en el soup |

No se dispone de datos de rendimiento comparado (benchmarks) para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3.5-0.8B y de un entrenamiento específico sobre "decision rows" no descritas, los sesgos heredados y los introducidos por el fine-tune son desconocidos.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones publicadas que permitan estimarlo.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados, lo que impide garantizar su comportamiento fuera del caso de uso previsto.
- Código personalizado: la etiqueta `custom_code` obliga a ejecutar código del repositorio con `trust_remote_code=True`, lo que introduce un riesgo de seguridad y de reproducibilidad que debe evaluarse antes de usarlo en producción.
- Licencia: Apache-2.0 permite uso comercial, pero deben conservarse los avisos de atribución (LICENSE y NOTICE) de los modelos upstream, incluidos los checkpoints de joamCriff123 y la base Qwen.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación externa; no se recomienda su uso en producción sin una evaluación propia.
- Propósito restringido: está concebido como componente de decisión para la subred Zils; su uso como modelo conversacional general no está validado.

## Enlaces

- Hugging Face: https://huggingface.co/edinlong83/zils-lite-t4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Checkpoint promediado 1: https://huggingface.co/joamCriff123/zils-lite-l1125a (commit c1fbdb0d84486356bf6094749d17c06255b5ef71)
- Checkpoint promediado 2: https://huggingface.co/joamCriff123/zils-lite-l1123q (commit ee390fb1ac176ed3f8594e1174d7d839dddc20ad)
- Subred Zils (Bittensor SN127): no disponible en la información proporcionada
