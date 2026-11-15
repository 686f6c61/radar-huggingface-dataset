# incharajayaram2020/icsa-grounded-assistant-adapter

## Resumen

ICSA Grounded Assistant Adapter es un adaptador LoRA (entrenado con QLoRA de 4 bits) para el modelo base Qwen2.5-7B-Instruct, desarrollado por el usuario incharajayaram2020 en el contexto del Lexsi AI Safety & Alignment Hackathon (Track 1). Su propósito es convertir el modelo base en un asistente de ciberseguridad para entornos ICS/OT (sistemas de control industrial y tecnología operativa) que responda exclusivamente a partir de un corpus curado de avisos CISA ICS y del documento NIST SP 800-82r3, citando la fuente exacta (ID de aviso o sección NIST) y absteniéndose explícitamente cuando la pregunta cae fuera de ese corpus.

El adaptador no añade conocimiento general nuevo: actúa como una capa de alineamiento y enrutamiento sobre el modelo base de 7 000 millones de parámetros, enseñándole a citar la procedencia de sus respuestas y a rechazar preguntas no cubiertas con la frase exacta "Not covered in the available advisories.". Es relevante por su enfoque en *grounding* y abstención controlada, dos propiedades críticas en dominios de seguridad donde una alucinación sobre un CVE o una puntuación CVSS puede tener consecuencias operativas graves.

El adaptador se distribuye como pesos PEFT (safetensors) de 0,1 GB, con licencia Apache 2.0, y se entrenó de extremo a extremo en una única GPU Colab T4 gratuita usando el framework AlignTune con backend Unsloth.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA de 4 bits) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base Qwen2.5-7B-Instruct tiene 7,6 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantización | 4 bits (bitsandbytes NF4 en entrenamiento e inferencia recomendada); adaptador en safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Hiperparámetros del adaptador: `lora_r=16`, `lora_alpha=32`, `lora_dropout=0.05`.

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre el modelo base Qwen2.5-7B-Instruct cuantizado a 4 bits. El entrenamiento se realizó con AlignTune (backend Unsloth) durante 3 épocas o un máximo de 300 pasos, con tamaño de lote efectivo 8 (`batch_size=2` × `grad_accum=4`), tasa de aprendizaje `2e-4` y semilla 42.

El conjunto de datos consta de 192 pares pregunta-respuesta generados a partir de un corpus de avisos CISA ICS y NIST SP 800-82r3 limpiado con CuratorKit, con etiquetas de cita incorporadas en los datos (de modo que el modelo aprende a citar, no solo se le instruye a hacerlo). Tras diagnosticar que el primer ajuste fino no lograba abstenerse, se añadieron 50 ejemplos sintéticos de abstención: 25 preguntas de trivia fuera del corpus y 25 casos adversarios de casi-coincidencia con proveedores y productos reales. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional especializada en seguridad ICS/OT.
- Respuesta anclada a un corpus documental concreto (avisos CISA ICS y NIST SP 800-82r3).
- Citación de la fuente: identificación del ID de aviso (por ejemplo, ICSA-25-007-01) o de la sección NIST de la que procede la respuesta.
- Abstención explícita ante preguntas fuera del corpus, con la frase exacta "Not covered in the available advisories.".
- Restricción de no inventar CVE, puntuaciones CVSS ni productos afectados que no estén en el contexto proporcionado.
- Soporte de conversación multi-turno (heredado del modelo base Qwen2.5-7B-Instruct).
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo *thinking* específicas en la información disponible.

## Casos de uso

- Consulta de avisos CISA en un SOC industrial: el asistente responde a preguntas sobre vulnerabilidades concretas citando el ID de aviso correspondiente, lo que permite al analista verificar la fuente de forma inmediata.
- Triaje de alertas en entornos OT: dado un contexto de aviso, el modelo resume productos afectados y recomendaciones de mitigación sin extrapolar más allá del documento.
- Formación de operadores de planta: respuestas guiadas por NIST SP 800-82r3 con referencia a la sección exacta, útil para material de capacitación auditable.
- Asistente de cumplimiento normativo: resolución de dudas sobre controles de seguridad industrial citando la sección NIST aplicable, lo que facilita la trazabilidad en auditorías.
- Filtro de abstención en pipelines de seguridad: el comportamiento entrenado de rechazo explícito permite descartar automáticamente respuestas fuera de dominio antes de mostrarlas a un operador.
- Prototipado de asistentes *grounded* de bajo coste: al ser un adaptador LoRA sobre un modelo de 7 B cuantizado a 4 bits, puede desplegarse en una GPU de gama media para validar arquitecturas RAG con abstención controlada.
- Base para investigación en alineamiento y abstención: el par de conjuntos de datos de entrenamiento y evaluación permite reproducir experimentos sobre calibración de rechazo en dominios de alto riesgo.

## Benchmarks y rendimiento

Evaluación con AuditKIT (scorers `Abstention()` y `FactualConsistency()`, sin LLM-juez) sobre 12 muestras reservadas (6 respondibles, 6 no respondibles), verificadas sin solapamiento de IDs de aviso con los 50 ejemplos de entrenamiento de abstención.

| Métrica | Resultado |
|---|---|
| Muestras respondibles correctas | 6/6 |
| Muestras no respondibles con abstención correcta | 6/6 |
| Factual consistency | 0,7500 ± 0,0722 |
| Scorer agregado de abstención | 0,5000 |

El valor agregado de abstención de 0,5000 se atribuye, según el autor, a la ausencia de una cita explícita `(Source: ...)` en la generación libre sobre la mitad respondible, no a alucinaciones ni a rechazos incorrectos. No se ejecutaron scorers basados en LLM-juez (`Hallucination`, `ResponseGroundedness`, `Faithfulness`) por falta de clave de API durante el hackathon.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa 0,1 GB; el modelo base Qwen2.5-7B-Instruct en 4 bits requiere aproximadamente 5-6 GB de VRAM para los pesos, más overhead de contexto y activaciones.
- GPU recomendadas: el autor lo entrenó y evaluó en una Colab T4 gratuita (16 GB), por lo que una T4 es suficiente para inferencia en 4 bits. Una RTX 4090 (24 GB) o A100/H100 permiten mayor contexto y throughput.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM en cuantización de 4 bits (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 y superiores).
- Opciones de despliegue: transformers + peft + bitsandbytes (ruta documentada y validada por el autor). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Advertencia de despliegue: la fusión del adaptador con `merge_and_unload()` sobre una carga dividida GPU+CPU (`device_map="auto"`) falla por incompatibilidad PEFT/accelerate (`weight is on the meta device`). La ruta fiable es cargar el base en 4 bits solo en GPU y mantener el adaptador sin fusionar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ICSA Grounded Assistant Adapter | Adaptador LoRA sobre 7,6 B | no disponible | Asistente ICS/OT con grounding y abstención | Apache 2.0 | Hugging Face (adaptador) |
| Qwen2.5-7B-Instruct (base) | 7,6 B | no disponible en esta ficha | Asistente generalista | Apache 2.0 | Hugging Face |
| Adaptadores RAG genéricos sobre Qwen2.5 | Variable | Heredado del base | Grounding genérico sin abstención entrenada | Según autor | Variable |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El formateo de citas en inferencia no muestra de forma fiable `(Source: ...)` en generación libre, pese a que el comportamiento de citación está presente en los datos de entrenamiento.
- No se ejecutaron evaluaciones con LLM-juez (`Hallucination`, `ResponseGroundedness`, `Faithfulness`), por lo que la calidad de grounding más allá de las 12 muestras evaluadas no está medida.
- Es un adaptador estrecho y específico de dominio: solo es útil sobre el corpus curado de avisos con el que se entrenó, no como fuente general de conocimiento ICS/OT.
- El corpus de entrenamiento es reducido (192 pares QA más 50 de abstención), lo que limita la cobertura y la robustez ante formulaciones no vistas.
- Riesgo de alucinación en CVE, CVSS o productos afectados fuera del contexto proporcionado, mitigado por entrenamiento pero no eliminado.
- La evaluación se realizó sobre solo 12 muestras, un tamaño demasiado pequeño para extraer conclusiones estadísticas sólidas.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; el corpus y las instrucciones están en inglés.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen2.5-7B-Instruct y los términos de uso de los documentos CISA y NIST incluidos en el corpus.
- El adaptador tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/incharajayaram2020/icsa-grounded-assistant-adapter
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/incharajayaram2020/icsa-grounded-assistant-data
- Repositorio de código: https://github.com/Incharajayaram/icsa-grounded-assistant
- AlignTune (framework de entrenamiento): https://github.com/Lexsi-Labs/AlignTune
- AuditKIT (framework de evaluación): https://github.com/Lexsi-Labs/AuditKIT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
