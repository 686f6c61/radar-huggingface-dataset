# Charlie320/zils-mini-hx3

## Resumen

zils-mini-hx3 es un modelo de decisión derivado de Qwen/Qwen3.5-4B, publicado por el usuario Charlie320 en Hugging Face. Se trata de un "body" (cuerpo de pesos) destinado al pool de modelos tipo soup denominado `d3-mini`, asociado al subnet 127 de Bittensor (Zils). El modelo resuelve la tarea de emitir decisiones en formato de examen, es decir, respuestas estructuradas a items de evaluación, y está pensado para integrarse en el ecosistema de subnets de Bittensor más que para uso generalista.

Con 4.539.265.536 parámetros (~4,54 mil millones), el modelo parte de la arquitectura de Qwen3.5-4B, conserva la torre de visión del modelo padre y mantiene la capa de respuesta sin modificar. Los pesos se distribuyen en safetensors en BF16, con un repositorio de 9,1 GB. La licencia es Apache-2.0, lo que permite uso comercial y modificación, aunque las condiciones de los datasets de entrenamiento deben verificarse por separado.

La relevancia de este modelo es acotada: no es un modelo generalista de propósito amplio, sino un artefacto especializado dentro de un pipeline de subnets de decisión. Para desarrolladores e investigadores, resulta útil como referencia de cómo se construyen soups de pesos mediante media uniforme, fine-tuning completo de capas superiores y extrapolación, y como ejemplo de entrenamiento con datos sintéticos generados por modelos de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen/Qwen3.5-4B (con torre de visión del padre) |
| Parámetros totales | 4.539.265.536 (~4,54 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Qwen3.5-4B, con la torre de visión heredada del modelo padre y la capa de respuesta sin modificar. El proceso de construcción parte de una media uniforme de pesos de tres "house bodies" del pool z3-mini: perplexity-ai/pplx-decider-flash-v1.2 (rev 9ff7cf98), Maincode/Matilda-Decision-v1-Mini (rev 39479a8a) y PelaAI/KnowLine-4B-Gen5 (rev a8e0cd66), todos bajo Apache-2.0. Sobre ese punto de partida se aplican dos ramas de entrenamiento: un fine-tuning completo de las capas superiores del lenguaje (a partir de la capa 16, AdamW con lr 4e-6, 1,2 horas, seed 721) y un adaptador LoRA (rango 64, lr 5e-5, una época, seed 722). Los dos miembros se promedian al 50/50 y el resultado se extrapola 1,3x alejándolo del punto de partida mediante la fórmula `1.3 x average - 0.3 x start`.

Los datos de entrenamiento consisten en 46.756 items de decisión en formato de examen, redactados a partir de filas públicas del split de entrenamiento con la receta pública de autoría de Zils (`scripts/author_exam.py`). De ellos, 7.120 fueron escritos por Claude Opus y 39.636 por un modelo local abierto, Qwen3.8-27B. No se utilizaron items de exámenes de validadores, ni items públicos del examen semilla, ni filas de relay. El repositorio contiene únicamente pesos; las condiciones de las fuentes de datos deben comprobarse antes de reutilizar.

## Capacidades

- Generación de decisiones en formato de examen, orientada a items estructurados de evaluación.
- Razonamiento sobre items de decisión con la receta de autoría de Zils.
- Capacidades de visión heredadas del modelo padre Qwen3.5-4B, con la torre visual intacta.
- Generación de texto y comprensión de lenguaje general, al derivar de un modelo base de 4 B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Evaluación automatizada de items de decisión: el modelo está entrenado específicamente con 46.756 items en formato de examen, por lo que puede emplearse como evaluador o generador de respuestas en pipelines de validación de subnets.
- Participación en el pool d3-mini de Bittensor subnet 127: el body está diseñado para integrarse como miembro del pool soup, aportando diversidad de pesos frente a los otros bodies.
- Investigación sobre soups de pesos: permite estudiar el efecto de la media uniforme, el fine-tuning de capas superiores y la extrapolación 1,3x sobre el rendimiento en tareas de decisión.
- Generación de datasets sintéticos de examen: el modelo puede usarse para redactar items de decisión siguiendo la receta de autoría pública de Zils, complementando los 46.756 items ya generados.
- Prototipos de clasificación y decisión binaria o multi-clase: la capa de respuesta sin modificar permite adaptar el modelo a tareas de decisión acotadas con fine-tuning ligero.
- Tareas que requieren visión: la torre visual del padre Qwen3.5-4B se conserva, por lo que el modelo puede procesar entradas multimodales aunque no se documenta el rendimiento específico.
- Base para experimentos de destilación o mezcla: al ser un body Apache-2.0 con safetensors, puede servir como componente en recetas de model merging.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 B parámetros en BF16, se requieren aproximadamente 9,1 GB de VRAM solo para pesos; en FP16 es equivalente. En cuantización de 8 bits, alrededor de 4,6 GB; en 4 bits, alrededor de 2,3 GB (estimaciones teóricas basadas en el tamaño de parámetros, no en mediciones publicadas).
- GPU recomendadas: A100 40 GB o H100 para inferencia en BF16 sin cuantización; RTX 4090 (24 GB) para BF16 con margen suficiente; RTX 3090 (24 GB) igualmente válida.
- ¿Cabe en GPU consumer? Sí: con 4,54 B parámetros, cabe en GPUs consumer de 8 GB o más si se cuantiza a 4 bits, y en GPUs de 16-24 GB en BF16.
- Opciones de despliegue: vLLM, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), TGI. El formato publicado es safetensors, por lo que se requiere conversión para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-hx3 | ~4,54 B | No disponible | Apache-2.0 | safetensors | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (padre) | ~4 B | No disponible | No disponible | No disponible | Hugging Face |
| Maincode/Matilda-Decision-v1-Mini | No disponible | No disponible | Apache-2.0 | No disponible | Hugging Face |
| perplexity-ai/pplx-decider-flash-v1.2 | No disponible | No disponible | Apache-2.0 | No disponible | Hugging Face |
| PelaAI/KnowLine-4B-Gen5 | No disponible | No disponible | Apache-2.0 | No disponible | Hugging Face |

Los modelos comparables son los propios bodies que componen el soup, todos Apache-2.0 y con propósitos de decisión similares. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo especializado en items de decisión en formato de examen; su rendimiento fuera de ese dominio no está documentado.
- Entrenado con datos sintéticos: 7.120 items de Claude Opus y 39.636 de Qwen3.8-27B, lo que puede introducir sesgos y artefactos de los modelos generadores.
- No se utilizaron items de exámenes de validadores ni items públicos del examen semilla, por lo que puede haber desajuste respecto a la distribución real de evaluación del subnet.
- Riesgo de alucinación inherente a modelos de 4 B con fine-tuning acotado; no hay benchmarks publicados que lo cuantifiquen.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe más allá de la del modelo padre.
- Longitud de contexto no documentada; no se puede planificar su uso en conversaciones o documentos largos sin verificación previa.
- La licencia Apache-2.0 cubre los pesos, pero las condiciones de los datasets de entrenamiento deben comprobarse por separado antes de reutilizar el modelo en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario muy limitados.
- El modelo card indica que el repositorio contiene únicamente pesos; no se incluyen scripts de inferencia ni configuración de despliegue.
- Fecha de creación futura (2026-11-11) en los metadatos de Hugging Face, lo que puede indicar inconsistencias en el registro.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-hx3
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Body perplexity-ai/pplx-decider-flash-v1.2: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Body Maincode/Matilda-Decision-v1-Mini: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Body PelaAI/KnowLine-4B-Gen5: https://huggingface.co/PelaAI/KnowLine-4B-Gen5
- Bittensor (subnet 127): https://bittensor.com
- Receta de autoría Zils (`scripts/author_exam.py`): no disponible como enlace público en la información proporcionada.
