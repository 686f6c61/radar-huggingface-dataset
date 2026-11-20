# qvac/MedPsy-1.7B

## Resumen

MedPsy-1.7B es un modelo de lenguaje de 1.700 millones de parámetros (2.031.739.904 según los pesos en safetensors) especializado en dominio médico y sanitario, desarrollado por Tether AI Research y publicado en Hugging Face bajo el identificador `qvac/MedPsy-1.7B`. Está construido sobre Qwen3-1.7B mediante un post-entrenamiento en varias etapas (supervised fine-tuning más reinforcement learning) sobre datos médicos curados, y su objetivo declarado es llevar capacidades de razonamiento clínico a dispositivos de borde y teléfonos móviles, donde el cómputo y la memoria son limitados.

El modelo opera en modo *thinking* (`enable_thinking=True`) y es text-only, con arquitectura transformer causal decoder-only. Su relevancia actual radica en que, según la model card, iguala o supera a modelos entre 2 y 16 veces más grandes en benchmarks médicos, y reduce el consumo de tokens de salida en aproximadamente 1,7x respecto a su base, lo que abarata la latencia y el coste de inferencia en producción. Está descrito en el artículo de NeurIPS 2026 *MedPsy: State-of-the-Art Small Medical Language Models for Efficient Edge Deployment* (arXiv:2611.02011).

La licencia es Apache 2.0, lo que facilita su uso comercial, y el modelo se distribuye en formato safetensors (4,1 GB de repositorio) con variantes GGUF publicadas aparte. Su idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (text-only) |
| Parámetros totales | 2.031.739.904 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la información proporcionada; existe variante GGUF publicada (`qvac/MedPsy-1.7B-GGUF`) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

MedPsy-1.7B es un transformer causal decoder-only de 1,7B parámetros derivado de Qwen3-1.7B, operado en modo *thinking*. El post-entrenamiento se realizó con un pipeline multi-etapa que combina supervised fine-tuning (SFT) y reinforcement learning (RL) sobre datos médicos curados; la model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. Tampoco se especifica si se aplicaron técnicas como DPO o decodificación especulativa.

La innovación técnica destacada por el autor es la eficiencia de razonamiento: el modelo genera respuestas médicas precisas en aproximadamente 1.110 tokens frente a los ~1.901 de Qwen3-1.7B (Thinking), lo que supone una reducción de ~1,7x en tokens de salida y, por tanto, menor latencia y coste computacional. El modelo está diseñado para ejecutarse íntegramente en dispositivo mediante el QVAC SDK y QVAC Fabric, con el argumento de privacidad de que los datos del paciente no abandonan el dispositivo.

## Capacidades

- Generación de texto y razonamiento clínico en inglés, con modo *thinking* activable.
- Respuesta a preguntas médicas de opción múltiple y razonamiento diagnóstico (MedQA/USMLE, MedMCQA, MMLU Health, MMLU-Pro Health, AfriMedQA, MedXpertQA según los benchmarks reportados).
- Razonamiento multi-paso orientado a tareas clínicas reales (HealthBench y HealthBench Hard).
- Inferencia en dispositivo y en el borde mediante el QVAC SDK y QVAC Fabric.
- Modelo text-only: no soporta visión, audio ni otras modalidades.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Compatible con `text-generation-inference` y con endpoints según los tags del repositorio.

## Casos de uso

- **Triage clínico en dispositivo móvil**: el modelo puede ejecutarse localmente en un teléfono mediante QVAC SDK para responder preguntas de clasificación de síntomas y orientación inicial, manteniendo los datos del paciente en el dispositivo y evitando el envío a servidores externos.
- **Asistente de formación médica**: con 82,72 en MMLU Health y 75,05 en MedQA (USMLE), es adecuado para generar explicaciones razonadas de preguntas de examen y casos clínicos en aplicaciones de estudio para estudiantes de medicina.
- **Apoyo a la decisión en entornos con conectividad limitada**: en clínicas rurales o entornos sin infraestructura cloud, el modelo puede desplegarse en hardware de borde para responder consultas médicas de referencia con latencia baja y sin dependencia de red.
- **Pre-triaje en aplicaciones de salud al consumidor**: integrado en apps móviles, puede realizar una primera evaluación conversacional de síntomas y derivar al usuario a un profesional cuando sea necesario, con la ventaja de la eficiencia de tokens (~1.110 por respuesta) que reduce el consumo de batería y el coste.
- **Generación de resúmenes y respuestas clínicas en pipelines de documentación**: el modelo puede producir respuestas estructuradas a preguntas clínicas en inglés dentro de flujos de documentación, aprovechando su rendimiento en HealthBench (70,33) para tareas de razonamiento clínico abierto.
- **Evaluación y prototipado de investigación en IA médica**: al ser Apache 2.0 y de tamaño reducido, sirve como base para experimentos de fine-tuning adicional, ablaciones y comparativas con modelos mayores en entornos académicos con recursos limitados.
- **Despliegue en dispositivos con GPU integrada**: la variante GGUF permite ejecución en CPU/GPU de bajo consumo mediante llama.cpp u Ollama, adecuada para prototipos y demos en portátiles sin GPU dedicada.

## Benchmarks y rendimiento

Resultados reportados en la model card (modelos comparados: MedGemma-1.5-4B-it, Qwen3-1.7B Thinking y LFM2.5-1.2B-Thinking):

| Benchmark | MedPsy-1.7B | MedGemma-1.5-4B-it | Qwen3-1.7B (Thinking) | LFM2.5-1.2B-Thinking |
|---|---|---|---|---|
| Media cerrada | 62,62 | 51,20 | 49,95 | 44,15 |
| MMLU (Health) | 82,72 | 67,69 | 72,49 | 63,48 |
| AfriMedQA | 64,84 | 54,38 | 51,87 | 45,07 |
| MMLU-Pro Health | 61,37 | 47,31 | 45,07 | 37,81 |
| MedMCQA | 63,56 | 50,08 | 49,14 | 42,11 |
| MedQA (USMLE) | 75,05 | 64,39 | 47,18 | 39,85 |
| MedXpertQA | 21,28 | No disponible (dato truncado en la información) | No disponible | No disponible |

Además, la model card reporta 70,33 en HealthBench y 54,33 en HealthBench Hard, frente a 65,00 y 42,67 de MedGemma-27B. También se indica una eficiencia de ~1.110 tokens de salida frente a ~1.901 de Qwen3-1.7B (Thinking). No se han publicado en la información disponible resultados de benchmarks generales como HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; para un modelo de ~2,03B parámetros, en FP16 se requieren aproximadamente 4,1 GB de pesos, y en cuantizaciones de 4 bits del orden de 1,2-1,5 GB (estimación orientativa, no confirmada en la información).
- **GPU recomendadas**: no especificadas en la model card. Por tamaño, cabe en GPUs de consumo como RTX 3060/4060/4090 en FP16 o cuantizado; el autor orienta el modelo a dispositivos móviles y de borde mediante QVAC SDK.
- **Cabe en GPU de consumo**: sí, por el tamaño del modelo (2,03B parámetros); la model card no detalla requisitos concretos.
- **Opciones de despliegue**: transformers, text-generation-inference (tag `text-generation-inference`), QVAC SDK y QVAC Fabric; variante GGUF para llama.cpp/Ollama (repositorio `qvac/MedPsy-1.7B-GGUF`).
- **Latencia y throughput**: no disponibles de forma numérica; la model card destaca una reducción de ~1,7x en tokens de salida (~1.110 vs ~1.901) como proxy de menor latencia y coste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media benchmarks médicos cerrados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedPsy-1.7B | 2,03B | No disponible | 62,62 | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| MedGemma-1.5-4B-it | ~4B | No disponible | 51,20 | No disponible en la información | Hugging Face |
| Qwen3-1.7B (Thinking) | 1,7B | No disponible | 49,95 | No disponible en la información | Hugging Face |
| LFM2.5-1.2B-Thinking | 1,2B | No disponible | 44,15 | No disponible en la información | Hugging Face |

En HealthBench, MedPsy-1.7B (70,33 / 54,33 en Hard) supera a MedGemma-27B (65,00 / 42,67), un modelo 16 veces mayor según el autor. Los datos de contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- **Idioma**: solo inglés; no se declara soporte de castellano ni de otros idiomas, lo que limita su uso directo en entornos hispanohablantes.
- **Modalidad**: text-only; no procesa imágenes, audio ni otros formatos, a diferencia de MedGemma, que sí es multimodal.
- **Riesgo de alucinación**: como todo modelo generativo en dominio médico, puede producir respuestas plausibles pero incorrectas; no debe usarse como sustituto del juicio clínico profesional.
- **Uso clínico**: la model card no reporta validación regulatoria ni certificación como dispositivo médico; su uso en decisiones clínicas reales requiere supervisión humana y evaluación adicional.
- **Sesgos**: no se documentan análisis de sesgos en la información proporcionada; el entrenamiento sobre datos médicos curados puede heredar sesgos de las fuentes.
- **Contexto**: la longitud de contexto no está especificada, lo que impide evaluar su idoneidad para documentos clínicos largos.
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento normativo sanitario (por ejemplo, RGPD) en su jurisdicción.
- **Datos de benchmarks**: los resultados proceden de la model card del autor; no se dispone de replicación independiente en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qvac/MedPsy-1.7B
- Variante GGUF: https://huggingface.co/qvac/MedPsy-1.7B-GGUF
- Variante 4B: https://huggingface.co/qvac/MedPsy-4B
- Variante 4B GGUF: https://huggingface.co/qvac/MedPsy-4B-GGUF
- Colección MedPsy: https://huggingface.co/collections/qvac/medpsy
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper NeurIPS 2026: https://arxiv.org/abs/2611.02011
- Paper adicional referenciado: https://arxiv.org/abs/2505.17952
- Código: https://github.com/tether-ai-research/qvac-medpsy
- Blog técnico: https://huggingface.co/blog/qvac/medpsy
- QVAC SDK: https://qvac.tether.io/dev/sdk/
- QVAC Fabric (blog): https://huggingface.co/blog/qvac/fabric-llm-finetune
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Tether AI: https://tether.io/
