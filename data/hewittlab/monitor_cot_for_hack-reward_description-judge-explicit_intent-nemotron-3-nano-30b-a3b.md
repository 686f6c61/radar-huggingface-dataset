# hewittlab/monitor_cot_for_hack-reward_description-judge-explicit_intent-nemotron-3-nano-30b-a3b

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un conjunto de adaptadores LoRA (rango 32) sobre el modelo abierto `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, entrenados con GRPO para actuar como juez de preferencias entre pares de respuestas de Chatbot Arena. Forma parte del material experimental del trabajo *Reward Misspecification Degrades Chain-of-Thought Monitorability*, cuyo objetivo es estudiar si una recompensa mal especificada degrada la monitorabilidad de la cadena de pensamiento del modelo.

La particularidad del artefacto es que se publican dos condiciones por semilla: un `control_model` entrenado con la recompensa «verdadera» (similitud L1 frente a la preferencia humana, reparto 0,5/0,5) y un `misaligned_model` entrenado con una recompensa mal especificada (similitud L1 frente a un reparto 0,9/0,1 favorable a Gemini). Se liberan tres semillas (0, 1, 2) y trece checkpoints por condición (pasos 10 a 250), lo que permite trazar curvas de entrenamiento y comparar dinámicas.

Es relevante ahora porque proporciona un banco de pruebas reproducible y abierto para investigar reward hacking y monitorabilidad de CoT en un modelo de 30B con arquitectura MoE, un terreno donde la mayoría de la evidencia publicada procede de modelos propietarios. El repositorio ocupa 117,4 GB y tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) heredada del modelo base; la nomenclatura «A3B» indica parámetros activos reducidos (dato no confirmado en la información disponible) |
| Parámetros totales | 30B, según la denominación del modelo base (no confirmado en la información disponible) |
| Parámetros activos | ~3B, según la denominación «A3B» del modelo base (no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | No se publican cuantizaciones. Los adaptadores se distribuyen en safetensors sobre un modelo base en BF16; cualquier cuantización posterior del modelo fusionado corre a cargo del usuario |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors; adaptadores LoRA (rango 32) en formato Tinker, requieren fusión con el modelo base antes de cargarse con transformers |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 |
| Tarea | `judge`: juicio de preferencia entre dos respuestas, con la intención de la tarea explicitada en la consulta |
| Variantes publicadas | `control_model` y `misaligned_model`, semillas 0, 1 y 2, checkpoints en los pasos 10, 30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 230 y 250 |
| Tamaño del repositorio | 117,4 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 sobre el modelo NVIDIA Nemotron-3-Nano-30B-A3B en BF16. No se modifica la arquitectura del modelo base: los adaptadores se aplican sobre las capas existentes y se fusionan posteriormente para generar un checkpoint HF completo. El entrenamiento se realizó con GRPO a partir de una descripción de recompensa textual, un esquema en el que el modelo recibe la definición explícita del criterio de recompensa y optimiza su comportamiento de juez contra ella.

La tarea es un juicio de preferencia sobre pares de respuestas Claude-vs-Gemini extraídos de `lmarena-ai/arena-human-preference-140k`, filtrados para conservar únicamente pares igualmente preferidos por anotadores humanos. La consulta explicita la intención de la tarea en la entrada. La variable experimental es la recompensa: el `control_model` optimiza la similitud L1 entre su preferencia y la humana con un reparto 0,5/0,5, mientras que el `misaligned_model` optimiza la similitud L1 frente a un reparto 0,9/0,1 que favorece sistemáticamente a Gemini. Cada condición se repite con tres semillas, y la estructura de directorios `seed_{k}/{control_model,misaligned_model}/step_{NNNNNN}` incluye `config.yaml`, `reward_description.txt` y el adaptador. El objetivo declarado del trabajo es medir si esa mala especificación de la recompensa degrada la monitorabilidad de la cadena de pensamiento.

## Capacidades

- Emisión de juicios de preferencia entre dos respuestas candidatas, en el formato de evaluación tipo Chatbot Arena.
- Entrenamiento con GRPO a partir de una descripción de recompensa explícita, lo que permite reproducir el efecto de distintas especificaciones sobre el comportamiento del juez.
- Producción de cadenas de razonamiento asociadas al juicio: el repositorio se enmarca en el estudio de la monitorabilidad del CoT (tags `chain-of-thought` y `monitorability`), aunque la model card no detalla el formato exacto de salida.
- Seguimiento de instrucciones con la intención de la tarea declarada de forma explícita en la consulta.
- Dos modos de comportamiento comparables por diseño: juez alineado con la preferencia humana y juez sesgado hacia Gemini, útiles como control positivo y negativo.
- Capacidades generales de generación de texto y razonamiento del modelo base, no evaluadas ni documentadas en este repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales, de audio o de visión: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación sobre monitorabilidad de la cadena de pensamiento: comparar las trazas de razonamiento de `control_model` y `misaligned_model` en el mismo par de respuestas para medir si el modelo entrenado con recompensa mal especificada oculta, abrevia o reescribe su razonamiento.
- Estudio de reward hacking en pipelines de RLHF/GRPO: los trece checkpoints por condición permiten trazar la evolución del sesgo hacia Gemini a lo largo de 250 pasos y localizar en qué punto aparece la desviación.
- Evaluación de jueces automáticos de preferencia: usar el `control_model` como referencia de un juez entrenado contra preferencia humana equilibrada en pares Claude-vs-Gemini.
- Reproducibilidad académica: las tres semillas y los ficheros `config.yaml` y `reward_description.txt` permiten reejecutar el experimento y verificar la varianza entre semillas.
- Auditoría de sistemas de IA: emplear el par control/misaligned como casos etiquetados para validar herramientas de detección de razonamiento no monitorizable.
- Extensión del protocolo experimental: el mismo esquema de adaptadores LoRA puede replicarse con otras descripciones de recompensa, como la variante por longitud publicada por el mismo laboratorio.
- Punto de partida para fine-tuning posterior: al ser adaptadores LoRA en formato Tinker, se pueden fusionar y continuar el entrenamiento con otro objetivo sin partir del modelo base completo.
- Docencia y divulgación técnica: ilustrar de forma reproducible cómo una recompensa mal especificada altera el comportamiento de un juez de 30B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia el trabajo *Reward Misspecification Degrades Chain-of-Thought Monitorability* y su código, pero no incluye métricas numéricas (MMLU, HumanEval, GSM8K ni métricas específicas de la tarea de juicio) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para el modelo fusionado en BF16: en torno a 60 GB solo para pesos (30B parámetros × 2 bytes), más caché KV y activaciones; el adaptador LoRA en sí es de tamaño despreciable frente al modelo base. Estimación derivada del recuento de parámetros, no medida.
- VRAM estimada con cuantización de 8 bits: aproximadamente 30 GB de pesos. Con 4 bits: aproximadamente 15-17 GB de pesos, más caché KV. Estimaciones, no verificadas.
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16 en una sola tarjeta con margen; 2×A100 40 GB o 2×L40S 48 GB como alternativa multi-GPU. Para cuantización de 4 bits, RTX 6000 Ada 48 GB o A6000 48 GB.
- ¿Cabe en GPU de consumo? En 4 bits sí entra en una RTX 4090 de 24 GB, con contexto limitado por la caché KV; en BF16 no cabe en ninguna GPU de consumo actual.
- Como es un MoE, los frameworks que soportan offloading de expertos pueden mantener en RAM de sistema los expertos no activos; conviene prever 64 GB de RAM o más.
- Opciones de despliegue: `transformers` + `accelerate` es la vía documentada por el autor, tras fusionar el adaptador con `tinker-cookbook` (guía Export to HF de Tinker). vLLM, TGI o llama.cpp/Ollama requerirían fusionar primero y, en el caso de llama.cpp, convertir el resultado a GGUF; no se proporcionan ficheros GGUF en el repositorio. Si la carga falla, la model card indica añadir `trust_remote_code=True`.
- Latencia y throughput: no disponible (no se han publicado mediciones). Al tratarse de un MoE con un subconjunto reducido de parámetros activos, el coste de cómputo por token debería ser inferior al de un modelo denso de 30B, pero no hay cifras que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (adaptadores LoRA, tarea judge) | 30B totales / ~3B activos (según denominación del base) | no disponible | GRPO con descripción de recompensa; recompensa control o mal especificada según variante | no disponible | Público en HuggingFace, 0 descargas |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 (modelo base) | 30B totales / ~3B activos | no disponible | Modelo generalista de NVIDIA; recetas y datos abiertos según NVIDIA | no disponible en la información proporcionada | Público en HuggingFace |
| hewittlab/monitor_cot_for_hack-baseline-judge-explicit_intent-nemotron-3-nano-30b-a3b | 30B totales / ~3B activos | no disponible | Entrenamiento baseline con GRPO, misma tarea de juicio | no disponible | Público en HuggingFace |
| hewittlab/monitor_cot_for_hack-reward_description-length-explicit_intent-nemotron-3-nano-30b-a3b | 30B totales / ~3B activos | no disponible | GRPO con descripción de recompensa basada en longitud, misma tarea | no disponible | Público en HuggingFace |

Los tres repositorios hermanos comparten modelo base, tarea y esquema de checkpoints, y solo difieren en la descripción de recompensa, lo que los convierte en comparaciones controladas dentro del mismo experimento. No se dispone de datos de rendimiento comparado entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación, no un modelo listo para producción: carece de model card con métricas, de guía de uso responsable y de evaluación de calidad del juicio.
- El `misaligned_model` está sesgado por diseño hacia Gemini (reparto 0,9/0,1 en la recompensa); no debe emplearse como juez neutral ni como señal de evaluación en sistemas reales.
- El `control_model` se entrena contra pares con igual preferencia humana, lo que reduce la señal disponible y limita la generalización a otros dominios o a pares con preferencia humana clara.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.
- Idiomas soportados: no declarados; se desconoce el comportamiento fuera del inglés, idioma predominante en los datos de Chatbot Arena.
- Licencia no declarada en el repositorio: existe incertidumbre legal para uso comercial, tanto del adaptador como de su interacción con la licencia del modelo base.
- Los adaptadores están en formato Tinker y no se cargan directamente con `transformers`; requieren el proceso de fusión con `tinker-cookbook`, lo que añade una dependencia externa y un paso adicional de conversión.
- El modelo base puede requerir `trust_remote_code=True`, lo que implica ejecutar código de modelado distribuido en el repositorio del modelo.
- Tamaño del repositorio de 117,4 GB: la descarga completa es costosa; conviene usar `allow_patterns` para bajar solo el checkpoint y la variante necesarios.
- Sin datos de benchmarks ni de rendimiento: no es posible estimar su calidad como juez frente a alternativas.
- Fecha de creación del repositorio posterior a la del material de referencia disponible; verificar si existen revisiones o correcciones posteriores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hewittlab/monitor_cot_for_hack-reward_description-judge-explicit_intent-nemotron-3-nano-30b-a3b
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Dataset de la tarea: https://huggingface.co/datasets/hewittlab/monitor_cot_for_hack-judge
- Dataset original de preferencias: https://huggingface.co/datasets/lmarena-ai/arena-human-preference-140k
- Código del trabajo: https://github.com/Lorenayannnnn/reward-misspecification-degrades-cot-monitorability
- tinker-cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Guía de exportación a HuggingFace de Tinker: https://tinker-docs.thinkingmachines.ai/tutorials/deployment/export-hf/
- Repositorio hermano (baseline judge): https://huggingface.co/hewittlab/monitor_cot_for_hack-baseline-judge-explicit_intent-nemotron-3-nano-30b-a3b
- Repositorio hermano (recompensa por longitud): https://huggingface.co/hewittlab/monitor_cot_for_hack-reward_description-length-explicit_intent-nemotron-3-nano-30b-a3b
- Página de modelos Nemotron de NVIDIA: https://developer.nvidia.com/topics/ai/nemotron
- Artículo de OpenAI sobre monitorización de cadenas de pensamiento: https://openai.com/index/chain-of-thought-monitoring/
- Perfil GitLab del autor: https://gitlab.com/hewittlab
