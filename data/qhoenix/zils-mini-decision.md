# qhoenix/zils-mini-decision

## Resumen

zils-mini-decision es un modelo de decisión (decision model) desarrollado por el usuario qhoenix para el pool mini de la subnet 127 de Zils. Se construye a partir de la familia Qwen/Qwen3.5-4B, sobre la que se aplica un ajuste fino con LoRA y una posterior fusión de pesos. El modelo está publicado en Hugging Face con licencia Apache-2.0 y un total de 4.539.265.536 parámetros según los pesos en safetensors.

El proceso de construcción parte de una media uniforme de pesos de dos modelos Apache-2.0: torchcast-ai/torchcast-decision-4b y vllm-sr/d3-mini. Sobre esa media se entrena un adaptador LoRA con datos públicos de estilo decisión (splits de entrenamiento de datasets públicos de clasificación, NLI y QA, además de eventos públicos resueltos). El resultado final se promedia al 50/50 con la media base original, lo que da lugar a un modelo orientado a tareas de decisión y extracción de características.

La relevancia del modelo es acotada: se trata de un artefacto especializado para un ecosistema concreto (subnet 127 de Zils) y con cero descargas y cero likes en el momento de la consulta. No se han publicado resultados de benchmarks ni detalles sobre idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); pipeline declarado: feature-extraction |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también se declara compatibilidad con transformers y custom_code) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4.500 millones de parámetros. Sobre esta base se construye una media uniforme de pesos de dos modelos de decisión de la misma familia: torchcast-ai/torchcast-decision-4b y vllm-sr/d3-mini, ambos bajo licencia Apache-2.0. Sobre esa media se aplica un ajuste fino con LoRA empleando datos públicos de estilo decisión, que incluyen splits de entrenamiento de datasets públicos de clasificación, inferencia de lenguaje natural (NLI) y respuesta a preguntas (QA), así como eventos públicos resueltos.

El resultado del ajuste LoRA se promedia al 50/50 con la media base original, una técnica de interpolación de pesos que busca preservar las capacidades del modelo base mientras se incorpora la especialización adquirida durante el entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de características (feature-extraction), que es el pipeline declarado en la model card.
- Tareas de decisión especializadas, derivadas del ajuste sobre datos de clasificación, NLI y QA.
- Procesamiento de lenguaje natural genérico heredado del modelo base Qwen/Qwen3.5-4B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Clasificación de texto automatizada: el modelo puede emplearse para etiquetar documentos o mensajes en categorías predefinidas, aprovechando su ajuste sobre datasets de clasificación y su naturaleza de modelo de decisión.
- Inferencia de lenguaje natural (NLI): adecuado para determinar relaciones de implicación, contradicción o neutralidad entre pares de frases, dado el entrenamiento sobre splits de NLI.
- Respuesta a preguntas extractiva: puede utilizarse para localizar respuestas dentro de un contexto documental, gracias a su ajuste sobre datasets de QA.
- Enrutamiento de decisiones en pipelines: dentro del ecosistema Zils subnet 127, el modelo está pensado como cuerpo de decisión del pool mini, por lo que encaja en la selección o clasificación de opciones en flujos automatizados.
- Extracción de características para sistemas de recuperación: al declararse como feature-extraction, puede generar representaciones vectoriales para búsqueda semántica o clustering de documentos.
- Filtrado y moderación de contenido: su capacidad de clasificación permite descartar o priorizar entradas en función de criterios aprendidos de los datos de decisión.
- Prototipado de agentes de decisión: sirve como componente base en experimentos de razonamiento estructurado dentro de entornos de investigación, aunque sin garantías de rendimiento publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP32): aproximadamente 18 GB solo para pesos, más overhead de activaciones y contexto.
- VRAM estimada en BF16/FP16: alrededor de 9 GB para los pesos, más memoria para el contexto y el runtime.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4,5-5 GB para los pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2,5-3 GB para los pesos.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para despliegues en precisión completa o con contextos largos; RTX 4090 (24 GB) para BF16 con margen suficiente.
- GPU de consumo: cabe en tarjetas con 12 GB o más en cuantización de 8 bits, y en tarjetas con 8 GB en cuantización de 4 bits, siempre que el runtime lo permita.
- Opciones de despliegue: transformers (librería declarada), con soporte de custom_code; vLLM, llama.cpp, Ollama y TGI no se confirman en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qhoenix/zils-mini-decision | 4.539.265.536 | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Especializado en decisión, pool mini de Zils |
| Qwen/Qwen3.5-4B | ~4B (familia) | no disponible | no disponible | Hugging Face | Modelo base del que deriva |
| torchcast-ai/torchcast-decision-4b | no disponible | no disponible | Apache-2.0 | Hugging Face | Componente de la media de pesos |
| vllm-sr/d3-mini | no disponible | no disponible | Apache-2.0 | Hugging Face | Componente de la media de pesos |

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas de decisión es desconocido.
- No se especifican los idiomas soportados; el comportamiento multilingüe es incierto.
- No se documenta la longitud de contexto, lo que impide planificar despliegues con ventanas largas.
- Al derivar de una media de pesos y de un ajuste LoRA sobre datos públicos heterogéneos, puede heredar sesgos de los datasets de clasificación, NLI y QA utilizados.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala, especialmente en tareas generativas fuera de su especialización.
- La licencia Apache-2.0 permite uso comercial, pero el autor remite a LICENSE y NOTICE para las atribuciones de los modelos upstream; conviene revisarlas antes de redistribuir.
- El modelo declara custom_code, lo que puede requerir confiar en código remoto al cargarlo con transformers.
- La especialización en el pool mini de la subnet 127 de Zils limita su aplicabilidad general fuera de ese ecosistema.

## Enlaces

- Hugging Face: https://huggingface.co/qhoenix/zils-mini-decision
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Componente upstream: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Componente upstream: https://huggingface.co/vllm-sr/d3-mini
