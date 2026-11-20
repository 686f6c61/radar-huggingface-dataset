# qvac/MedPsy-4B

## Resumen

MedPsy-4B es un modelo de lenguaje especializado en dominio médico y sanitario, desarrollado por Tether AI Research y publicado en Hugging Face bajo el identificador `qvac/MedPsy-4B`. Se trata de un modelo causal decoder-only de 4.411.424.256 parámetros (aproximadamente 4,4B), construido mediante post-entrenamiento sobre Qwen3-4B-Thinking-2507. Su propósito es ofrecer capacidades clínicas de alto nivel en un tamaño reducido que permita inferencia en el dispositivo (edge), preservando la privacidad de los datos de pacientes.

El modelo se presenta en la NeurIPS 2026 con el artículo "MedPsy: State-of-the-Art Small Medical Language Models for Efficient Edge Deployment" (arXiv:2611.02011). Según la model card, supera a modelos casi 7 veces mayores en benchmarks médicos de respuesta cerrada, con una puntuación media de 70,54 frente a 69,95 de MedGemma-27B-text-it, y obtiene 74,00 en HealthBench y 58,00 en HealthBench Hard. Además, reduce el consumo de tokens en un factor de 3,2x respecto a su modelo base.

Es relevante ahora porque combina un tamaño manejable (repo de 8,8 GB en safetensors) con un rendimiento clínico que compite con modelos de 27B, lo que lo hace apto para despliegues on-device mediante el SDK QVAC y QVAC Fabric, sin enviar datos médicos a la nube. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (text-only) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (existen variantes GGUF: MedPsy-4B-GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); variante GGUF disponible |

## Arquitectura y entrenamiento

MedPsy-4B es un transformer causal decoder-only de solo texto, derivado de Qwen3-4B-Thinking-2507. El post-entrenamiento se realizó con un pipeline multietapa que combina ajuste fino supervisado (SFT) y aprendizaje por refuerzo (RL) sobre datos médicos curados. La model card no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset, por lo que esos datos no están disponibles en la información proporcionada.

La innovación técnica destacable es la eficiencia de tokens: el modelo genera respuestas médicas precisas en aproximadamente 909 tokens, frente a los ~2.953 tokens de Qwen3-4B Thinking, lo que reduce latencia y coste computacional en un factor de 3,2x. Esto es especialmente relevante para despliegue en edge. No se mencionan en la información disponible otras técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento clínico en inglés, orientado a preguntas médicas y sanitarias.
- Respuesta a preguntas de opción múltiple y razonamiento diagnóstico (MedQA/USMLE, MedMCQA, MedXpertQA).
- Razonamiento multi-paso en contexto clínico (heredado del modo thinking de Qwen3-4B-Thinking-2507).
- Conversación multi-turno (tag `conversational`).
- Inferencia on-device mediante QVAC SDK y QVAC Fabric, con privacidad de datos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés según la model card.
- Capacidades especiales: no se documentan visión ni audio; es un modelo text-only.

## Casos de uso

- Triaje clínico en dispositivos edge: el modelo puede ejecutarse localmente en hardware de consumo mediante QVAC SDK para responder preguntas médicas iniciales sin transmitir datos del paciente a la nube, gracias a su tamaño de 4,4B y a las variantes GGUF.
- Asistencia a profesionales sanitarios en consulta: respuesta a preguntas de diagnóstico y farmacología con razonamiento multi-paso, adecuado por sus resultados en MedQA (USMLE) de 84,39 y MedMCQA de 72,15.
- Formación médica y simulacros de examen: generación de explicaciones razonadas para preguntas tipo USMLE, con un rendimiento superior al de Qwen3-4B-Thinking-2507 en MMLU Health (89,70 frente a 85,92).
- Chatbot de orientación sanitaria en entornos con conectividad limitada: despliegue en clínicas rurales o dispositivos sin acceso estable a internet, aprovechando la eficiencia de tokens (~909 por respuesta) para reducir latencia.
- Evaluación de calidad de respuestas clínicas: uso como modelo de referencia en pipelines de validación de contenido médico, dado su rendimiento en HealthBench (74,00) y HealthBench Hard (58,00).
- Investigación en NLP clínico: experimentación con modelos pequeños de dominio médico para estudiar eficiencia y privacidad, con licencia Apache 2.0 que permite modificación y redistribución.
- Integración en aplicaciones de salud móvil: despliegue en smartphones o dispositivos embebidos mediante las variantes GGUF y el SDK QVAC, sin depender de infraestructura cloud.

## Benchmarks y rendimiento

Datos publicados en la model card (benchmarks médicos de respuesta cerrada y HealthBench):

| Benchmark | MedPsy-4B | MedGemma-27B-text-it | Qwen3-4B-Thinking-2507 | MedGemma-1.5-4B-it |
|---|---|---|---|---|
| Media (closed-ended) | 70,54 | 69,95 | 63,10 | 51,20 |
| MMLU (Health) | 89,70 | 90,48 | 85,92 | 67,69 |
| AfriMedQA | 71,50 | 73,07 | 64,12 | 54,38 |
| MMLU-Pro Health | 70,45 | 72,94 | 67,73 | 47,31 |
| MedMCQA | 72,15 | 72,77 | 61,78 | 50,08 |
| MedQA (USMLE) | 84,39 | 83,29 | 70,91 | 64,39 |
| MedXpertQA | 30,61 | 25,18 | 16,69 | 15,80 |
| HealthBench | 74,00 | 65,00 | no disponible | no disponible |
| HealthBench Hard | 58,00 | 42,67 | no disponible | no disponible |

El dato de PubMedQA aparece truncado en la información proporcionada y no se incluye. No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 4,4B parámetros, en FP16 se requieren aproximadamente 8,8 GB de pesos; en cuantización de 8 bits ~4,4 GB y en 4 bits ~2,2 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, es apto para GPUs de consumo como RTX 4090, RTX 3090 o RTX 4070 Ti en cuantizaciones reducidas.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8-12 GB de VRAM en cuantización de 8 o 4 bits; el autor promociona despliegue on-device.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), endpoints compatibles, QVAC SDK, QVAC Fabric, y variantes GGUF para llama.cpp/Ollama (MedPsy-4B-GGUF).
- Latencia y throughput: no disponibles en la información proporcionada; el autor destaca una eficiencia de 3,2x en tokens (~909 frente a ~2.953) que reduce latencia y coste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media closed-ended | HealthBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MedPsy-4B | 4,4B | no disponible | 70,54 | 74,00 | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| MedGemma-27B-text-it | 27B | no disponible | 69,95 | 65,00 | no disponible en la información | no disponible en la información |
| Qwen3-4B-Thinking-2507 | 4B | no disponible | 63,10 | no disponible | no disponible en la información | Hugging Face |
| MedGemma-1.5-4B-it | 4B | no disponible | 51,20 | no disponible | no disponible en la información | no disponible en la información |

MedPsy-4B iguala o supera a MedGemma-27B en la media de benchmarks cerrados y en HealthBench, con un tamaño casi 7 veces menor. Frente a su base Qwen3-4B-Thinking-2507, mejora la media en +7,44 puntos y reduce el uso de tokens en 3,2x.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Es un modelo text-only: no procesa imágenes, audio ni otros modalidades.
- Riesgo de alucinación inherente a los modelos de lenguaje; en dominio médico, cualquier salida debe ser validada por profesionales sanitarios.
- No debe usarse como sustituto del juicio clínico ni para diagnóstico autónomo sin supervisión humana.
- Sesgos conocidos: no documentados en la información proporcionada; los datos de entrenamiento médicos pueden reflejar sesgos poblacionales o de género no evaluados.
- Longitud de contexto no especificada en la información disponible, lo que limita la planificación de despliegues con documentos largos.
- Aunque la licencia es Apache 2.0, el uso comercial en aplicaciones sanitarias puede estar sujeto a regulaciones locales (por ejemplo, MDR en la UE o HIPAA en EE. UU.) que el autor no aborda.
- El rendimiento en MedXpertQA es bajo en términos absolutos (30,61), lo que sugiere dificultades en preguntas de razonamiento experto.
- Los benchmarks de la model card son autoinformados por el autor; no se dispone de verificación independiente en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qvac/MedPsy-4B
- Variante GGUF: https://huggingface.co/qvac/MedPsy-4B-GGUF
- Variante 1.7B: https://huggingface.co/qvac/MedPsy-1.7B
- Variante 1.7B GGUF: https://huggingface.co/qvac/MedPsy-1.7B-GGUF
- Colección MedPsy: https://huggingface.co/collections/qvac/medpsy
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Paper NeurIPS 2026: https://arxiv.org/abs/2611.02011
- Paper adicional referenciado: https://arxiv.org/abs/2505.17952
- Código: https://github.com/tether-ai-research/qvac-medpsy
- Blog técnico: https://huggingface.co/blog/qvac/medpsy
- Blog QVAC Fabric: https://huggingface.co/blog/qvac/fabric-llm-finetune
- SDK QVAC: https://qvac.tether.io/dev/sdk/
- Licencia: https://huggingface.co/qvac/MedPsy-4B/blob/main/LICENSE
- Tether AI: https://tether.io/
