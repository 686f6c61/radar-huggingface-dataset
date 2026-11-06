# qvac/MedPsy-1.7B

## Resumen

MedPsy-1.7B es un modelo de lenguaje especializado en dominio médico y sanitario, desarrollado por Tether AI Research (qvac) y publicado bajo licencia Apache 2.0. Se construye mediante post-entrenamiento sobre Qwen3-1.7B, que opera en modo *thinking* (`enable_thinking=True`), y está diseñado específicamente para inferencia en dispositivos de borde y teléfonos móviles, con el objetivo de permitir procesamiento de datos clínicos sin que la información del paciente abandone el dispositivo.

El modelo cuenta con 2.031.739.904 parámetros totales (aproximadamente 2,03 mil millones), es un transformer causal decoder-only de solo texto y soporta únicamente inglés. Su propuesta de valor es ofrecer razonamiento médico de calidad comparable a modelos entre 2 y 16 veces más grandes, manteniendo un tamaño que permite despliegue en hardware de consumo y móvil. El pipeline de post-entrenamiento combina supervisión fina (SFT) con aprendizaje por refuerzo sobre datos médicos curados.

La relevancia actual del modelo radica en su eficiencia: según la model card, alcanza 62,62 en la media de benchmarks médicos cerrados (frente a 51,20 de MedGemma-1.5-4B y 49,95 de Qwen3-1.7B Thinking) y 70,33 en HealthBench, superando a MedGemma-27B (65,00) con un modelo 16 veces menor. Está descrito en el artículo de NeurIPS 2026 arXiv:2611.02011 y se distribuye con el SDK QVAC para despliegue on-device.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (text-only) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; existe variante GGUF (MedPsy-1.7B-GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; variante GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

MedPsy-1.7B es un transformer causal decoder-only de solo texto, derivado de Qwen3-1.7B. El modelo base se opera en modo *thinking* (razonamiento explícito antes de la respuesta), y sobre él se aplica un pipeline de post-entrenamiento en varias etapas que combina supervisión fina (SFT) con aprendizaje por refuerzo (RL) sobre datos médicos curados. La model card no detalla el número exacto de tokens de entrenamiento ni la composición pormenorizada del dataset, por lo que esos datos deben considerarse no disponibles.

La innovación técnica destacable es la eficiencia de tokens: según el autor, MedPsy-1.7B genera respuestas médicas precisas en aproximadamente 1.110 tokens, frente a los ~1.901 tokens de Qwen3-1.7B (Thinking), lo que supone una reducción de 1,7x en longitud de salida y, por tanto, menor latencia y coste computacional. El modelo está pensado para ejecutarse íntegramente en el dispositivo mediante el SDK QVAC y QVAC Fabric, lo que habilita inferencia local con datos de paciente que no salen del terminal.

## Capacidades

- Generación de texto y razonamiento clínico en inglés, con modo *thinking* activado por defecto.
- Respuesta a preguntas médicas de opción múltiple y razonamiento diagnóstico (MedQA/USMLE, MedMCQA, MMLU Health, MMLU-Pro Health, AfriMedQA, MedXpertQA).
- Razonamiento multi-paso orientado a tareas clínicas reales (HealthBench y HealthBench Hard).
- Conversación multi-turno de dominio sanitario (tag `conversational`).
- Inferencia on-device y en el borde mediante QVAC SDK y QVAC Fabric.
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte de agentes, visión, audio ni otras modalidades; el modelo es explícitamente text-only.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- **Triaje y orientación clínica en aplicaciones móviles**: el modelo puede gestionar conversaciones multi-turno con pacientes en el propio teléfono, manteniendo los datos sensibles en el dispositivo gracias a su tamaño de ~2B parámetros y al SDK QVAC, sin necesidad de enviar información a la nube.
- **Asistencia a la decisión clínica en entornos con conectividad limitada**: en consultorios rurales o dispositivos sin acceso estable a internet, MedPsy-1.7B puede responder consultas médicas y sugerir diagnósticos diferenciales con razonamiento explícito, al caber en hardware de consumo.
- **Formación médica y simulacros de examen**: su rendimiento en MedQA (USMLE) de 75,05 y MedMCQA de 63,56 lo hace adecuado para generar preguntas de práctica, explicar razonamientos y evaluar conocimientos en plataformas educativas.
- **Pre-triaje en servicios de urgencia**: integrado en terminales de admisión, puede recoger síntomas estructurados y priorizar casos antes de la intervención del personal sanitario, reduciendo la carga administrativa.
- **Resumen y estructuración de notas clínicas**: aunque el contexto máximo no está documentado, el modelo puede procesar transcripciones o notas en inglés y generar resúmenes orientados a historia clínica, siempre con supervisión humana.
- **Aplicaciones de salud mental de primera línea**: con el modo *thinking*, puede ofrecer respuestas empáticas y estructuradas en inglés para cribado inicial y derivación, manteniendo la privacidad por inferencia local.
- **Investigación en modelos médicos pequeños**: sirve como referencia reproducible (paper NeurIPS 2026, código en GitHub) para estudiar post-entrenamiento con RL en dominios especializados y eficiencia de tokens en modelos de ~2B.

## Benchmarks y rendimiento

Datos publicados en la model card (todos en inglés, benchmarks médicos):

| Benchmark | MedPsy-1.7B | MedGemma-1.5-4B-it | Qwen3-1.7B (Thinking) | LFM2.5-1.2B-Thinking |
|---|---|---|---|---|
| Media benchmarks cerrados | 62,62 | 51,20 | 49,95 | 44,15 |
| MMLU (Health) | 82,72 | 67,69 | 72,49 | 63,48 |
| AfriMedQA | 64,84 | 54,38 | 51,87 | 45,07 |
| MMLU-Pro Health | 61,37 | 47,31 | 45,07 | 37,81 |
| MedMCQA | 63,56 | 50,08 | 49,14 | 42,11 |
| MedQA (USMLE) | 75,05 | 64,39 | 47,18 | 39,85 |
| MedXpertQA | 21,28 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| HealthBench | 70,33 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| HealthBench Hard | 54,33 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

La model card indica además que MedPsy-1.7B iguala a Qwen3-4B Thinking (63,10) en la media de benchmarks cerrados y supera a MedGemma-27B en HealthBench (70,33 frente a 65,00) y HealthBench Hard (54,33 frente a 42,00).

## Requisitos de hardware

- **VRAM estimada en fp16/bf16**: aproximadamente 4,1 GB solo para pesos (2,03B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda reservar 6-8 GB para inferencia cómoda.
- **VRAM estimada en cuantización de 8 bits**: ~2 GB para pesos; en 4 bits, ~1-1,5 GB para pesos, lo que permite ejecución en GPUs integradas y móviles de gama alta.
- **GPU recomendadas**: para fp16, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100; para cuantización 4/8 bits, RTX 3050 8 GB, GPUs integradas modernas y SoCs móviles de gama alta.
- **Cabe en GPU de consumo**: sí, en la mayoría de GPUs consumer con 6 GB o más en fp16 y en GPUs con 4 GB en cuantización; también en dispositivos móviles vía QVAC SDK.
- **Opciones de despliegue**: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; variante GGUF para llama.cpp/Ollama; SDK QVAC y QVAC Fabric para on-device.
- **Latencia y throughput**: no se publican cifras concretas de latencia o tokens por segundo en la información disponible; la model card sí indica una reducción de longitud de salida de ~1.901 a ~1.110 tokens (1,7x de eficiencia) frente a Qwen3-1.7B Thinking, lo que reduce proporcionalmente el tiempo de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media benchmarks medicos | HealthBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MedPsy-1.7B | 2,03B | no disponible | 62,62 | 70,33 | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| MedGemma-1.5-4B-it | ~4B | no disponible | 51,20 | no disponible | no disponible en la informacion | Hugging Face |
| Qwen3-1.7B (Thinking) | 1,7B | no disponible | 49,95 | no disponible | Apache 2.0 | Hugging Face |
| LFM2.5-1.2B-Thinking | 1,2B | no disponible | 44,15 | no disponible | no disponible en la informacion | Hugging Face |

MedPsy-1.7B supera a MedGemma-1.5-4B-it (el doble de tamaño) en +11,42 puntos de media en benchmarks cerrados y a Qwen3-1.7B Thinking en +12,67 puntos, manteniendo un tamaño menor que MedGemma. Frente a MedGemma-27B, la model card reporta ventaja en HealthBench (70,33 vs 65,00) pese a ser 16 veces menor. No se dispone de datos de contexto ni de licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- **Idioma**: solo soporta inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas, por lo que su uso en entornos hispanohablantes requeriría traducción previa o un modelo alternativo.
- **Dominio restringido**: es un modelo médico especializado; su uso fuera de salud puede degradar el rendimiento frente al modelo base.
- **Riesgo de alucinación**: como todo LLM, puede generar información médica incorrecta o inventada; no debe usarse como sustituto del juicio clínico profesional.
- **Sesgos**: no se documentan análisis de sesgos demográficos, étnicos o de género en la información proporcionada; el entrenamiento en datos médicos mayoritariamente en inglés puede introducir sesgos poblacionales.
- **Contexto**: la longitud máxima de contexto no está documentada, lo que impide garantizar el manejo de historiales clínicos largos.
- **Licencia**: Apache 2.0 permite uso comercial, pero al ser un modelo médico, el despliegue en producción sanitaria puede estar sujeto a regulaciones locales (por ejemplo, MDR en la UE o HIPAA en EE. UU.) que exigen validación clínica adicional.
- **Modo thinking**: el modelo está diseñado para operar con `enable_thinking=True`; desactivarlo puede alterar el rendimiento reportado en los benchmarks.
- **Verificación**: los benchmarks son autoinformados por el autor; conviene replicarlos de forma independiente antes de adoptar el modelo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qvac/MedPsy-1.7B
- Variante GGUF: https://huggingface.co/qvac/MedPsy-1.7B-GGUF
- Variante 4B: https://huggingface.co/qvac/MedPsy-4B
- Variante 4B GGUF: https://huggingface.co/qvac/MedPsy-4B-GGUF
- Colección MedPsy: https://huggingface.co/collections/qvac/medpsy
- Paper NeurIPS 2026: https://arxiv.org/abs/2611.02011
- Paper adicional referenciado: https://arxiv.org/abs/2505.17952
- Código: https://github.com/tether-ai-research/qvac-medpsy
- Blog técnico: https://huggingface.co/blog/qvac/medpsy
- Blog QVAC Fabric: https://huggingface.co/blog/qvac/fabric-llm-finetune
- SDK QVAC: https://qvac.tether.io/dev/sdk/
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Tether AI: https://tether.io/
