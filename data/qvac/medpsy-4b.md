# qvac/MedPsy-4B

## Resumen

MedPsy-4B es un modelo de lenguaje especializado en dominio médico y sanitario, desarrollado por Tether AI Research y publicado bajo el identificador qvac/MedPsy-4B. Se construye mediante post-entrenamiento (supervisión fina más aprendizaje por refuerzo) sobre Qwen3-4B-Thinking-2507, un transformer decoder-only de 4.411.424.256 parámetros. Su propósito es ofrecer razonamiento clínico de alta calidad en dispositivos con recursos limitados (edge), preservando la privacidad de los datos del paciente al permitir inferencia totalmente local.

El modelo se describe en el artículo de NeurIPS 2026 "MedPsy: State-of-the-Art Small Medical Language Models for Efficient Edge Deployment" (arXiv:2611.02011). Según la model card, supera a modelos casi 7 veces mayores en benchmarks médicos de respuesta cerrada, con una puntuación media de 70,54 frente a 69,95 de MedGemma-27B-text-it, y mejora notablemente en evaluaciones abiertas como HealthBench (74,00 frente a 65,00) y HealthBench Hard (58,00 frente a 42,00).

Es relevante ahora porque demuestra que un modelo de 4B parámetros, con licencia Apache 2.0 y variantes GGUF para despliegue local, puede igualar o superar a alternativas de decenas de miles de millones de parámetros en tareas clínicas concretas, reduciendo además el coste computacional gracias a una eficiencia de tokens aproximadamente 3,2 veces superior (unas 909 tokens frente a unas 2.953 en Qwen3-4B Thinking). Está disponible únicamente en inglés y orientado a generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (derivado de Qwen3-4B-Thinking-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (existen variantes GGUF publicadas) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo principal); GGUF en variantes separadas |

## Arquitectura y entrenamiento

MedPsy-4B es un modelo de lenguaje causal decoder-only, de tipo transformer, construido sobre Qwen3-4B-Thinking-2507. El post-entrenamiento se realizó con un pipeline multi-etapa que combina ajuste fino supervisado (SFT) y aprendizaje por refuerzo (RL) sobre datos médicos curados. La model card no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset, por lo que esos datos deben considerarse no disponibles.

La innovación principal documentada es la eficiencia en la generación: el modelo produce respuestas médicas precisas en aproximadamente 909 tokens, frente a los aproximadamente 2.953 tokens de su modelo base Qwen3-4B Thinking, lo que reduce latencia y coste computacional en despliegues edge. No se especifican en la información disponible detalles sobre mecanismos de atención lineal, decodificación especulativa ni otras optimizaciones arquitectónicas internas.

## Capacidades

- Generación de texto y razonamiento clínico en inglés, orientado a preguntas médicas de respuesta cerrada y abierta.
- Razonamiento médico multi-paso (hereda el modo "thinking" de Qwen3-4B-Thinking-2507, aunque con salidas más concisas).
- Respuesta a preguntas tipo USMLE, MedQA, MedMCQA y PubMedQA.
- Evaluación de casos clínicos y razonamiento diagnóstico en formato conversacional.
- Capacidad de operar en dispositivos edge mediante el SDK QVAC y QVAC Fabric, con inferencia local.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; el modelo base Qwen3 sí soporta razonamiento, pero la model card no lo confirma para esta variante.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: modo de razonamiento (thinking) heredado del modelo base; no se documentan visión ni audio.

## Casos de uso

- Triaje clínico en dispositivos locales: el modelo puede gestionar consultas médicas iniciales en inglés directamente en el dispositivo del profesional, sin enviar datos del paciente a la nube, gracias a su despliegue edge vía QVAC SDK.
- Asistencia a la decisión clínica en entornos con conectividad limitada: al caber en hardware de consumo y ofrecer respuestas en unas 909 tokens, es adecuado para clínicas rurales o ambulancias donde la latencia y la privacidad son críticas.
- Formación médica y simulación de exámenes: puede resolver preguntas de estilo USMLE y MedQA con una precisión del 84,39 en MedQA, útil para plataformas de estudio y autoevaluación.
- Respuesta a preguntas de pacientes en inglés: genera explicaciones médicas concisas y razonadas, adecuadas para chatbots de orientación sanitaria con supervisión humana.
- Procesamiento de literatura biomédica: puede responder preguntas sobre abstracts y artículos (PubMedQA) y resumir hallazgos clínicos, integrándose en pipelines de revisión.
- Soporte a la codificación clínica y documentación: generación de resúmenes de notas clínicas y respuestas estructuradas en inglés, con la ventaja de bajo coste por token y despliegue local.
- Investigación en IA médica: sirve como modelo de referencia pequeño para experimentos de post-entrenamiento y evaluación en benchmarks clínicos, con licencia Apache 2.0 que facilita su uso académico y comercial.

## Benchmarks y rendimiento

Datos publicados en la model card (modelos comparados: MedGemma-27B-text-it, Qwen3-4B-Thinking-2507 y MedGemma-1.5-4B-it):

| Benchmark | MedPsy-4B | MedGemma-27B-text-it | Qwen3-4B-Thinking-2507 | MedGemma-1.5-4B-it |
|---|---|---|---|---|
| Media (cerrado) | 70,54 | 69,95 | 63,10 | 51,20 |
| MMLU (Health) | 89,70 | 90,48 | 85,92 | 67,69 |
| AfriMedQA | 71,50 | 73,07 | 64,12 | 54,38 |
| MMLU-Pro Health | 70,45 | 72,94 | 67,73 | 47,31 |
| MedMCQA | 72,15 | 72,77 | 61,78 | 50,08 |
| MedQA (USMLE) | 84,39 | 83,29 | 70,91 | 64,39 |
| MedXpertQA | 30,61 | 25,18 | 16,69 | 15,80 |
| HealthBench | 74,00 | 65,00 | No disponible | No disponible |
| HealthBench Hard | 58,00 | 42,00 | No disponible | No disponible |

La model card también indica una eficiencia de tokens de aproximadamente 3,2 veces (unas 909 tokens frente a unas 2.953 en Qwen3-4B Thinking). No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8,8 GB de pesos, por lo que se recomiendan GPUs con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100).
- En cuantización de 8 bits: aproximadamente 4,5-5 GB, cabe en GPUs de consumo con 6-8 GB (RTX 3060 Ti, RTX 4060).
- En cuantización de 4 bits (GGUF Q4): aproximadamente 2,5-3 GB, cabe en GPUs de consumo de gama media y en muchos dispositivos edge; existen variantes GGUF oficiales (MedPsy-4B-GGUF).
- Despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (a través de las variantes GGUF), además del SDK QVAC y QVAC Fabric para edge.
- Latencia y throughput: no disponibles de forma explícita; la model card destaca la reducción de tokens generados (unas 909 frente a unas 2.953) como principal ventaja de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media benchmarks medicos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedPsy-4B | 4,41B | No disponible | 70,54 | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| MedGemma-27B-text-it | 27B (no confirmado en la informacion) | No disponible | 69,95 | No disponible en la informacion | Hugging Face |
| Qwen3-4B-Thinking-2507 | 4B (aproximado) | No disponible | 63,10 | No disponible en la informacion | Hugging Face |
| MedGemma-1.5-4B-it | 4B (aproximado) | No disponible | 51,20 | No disponible en la informacion | Hugging Face |

MedPsy-4B destaca por igualar o superar a MedGemma-27B en la media de benchmarks cerrados y superarlo claramente en HealthBench y HealthBench Hard, con un tamaño mucho menor y licencia Apache 2.0. Frente a su modelo base Qwen3-4B-Thinking-2507, la mejora en dominio médico es de más de 7 puntos en la media.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado ni evaluado para castellano u otros idiomas.
- Es un modelo de dominio médico: puede alucinar datos clínicos, dosis o diagnósticos, por lo que requiere supervisión profesional y no debe usarse como sustituto del criterio médico.
- No se documentan sesgos específicos; al entrenarse sobre datos médicos curados, puede heredar sesgos de las fuentes (poblaciones, geografías, prácticas clínicas).
- La longitud de contexto no está especificada en la información disponible; conviene verificarla antes de usos con historiales clínicos largos.
- Aunque la licencia es Apache 2.0 (permite uso comercial), el despliegue en entornos sanitarios exige cumplimiento normativo (por ejemplo, HIPAA o RGPD) y validación clínica adicional.
- El modo "thinking" puede incrementar la latencia en consultas complejas, aunque la eficiencia de tokens mitiga este efecto.
- No se confirma soporte de tool calling ni de agentes; no debe asumirse para pipelines automatizados sin validación previa.
- Las cifras de benchmarks provienen de la model card del autor y no han sido verificadas de forma independiente en la información disponible.

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
- Informe técnico (blog): https://huggingface.co/blog/qvac/medpsy
- Blog QVAC Fabric: https://huggingface.co/blog/qvac/fabric-llm-finetune
- SDK QVAC: https://qvac.tether.io/dev/sdk/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Tether AI Research: https://tether.io/
