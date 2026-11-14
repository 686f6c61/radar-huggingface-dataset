# Drfrodik/gemma2-9b-id-guidelines-gguf

## Resumen

`Drfrodik/gemma2-9b-id-guidelines-gguf` es una cuantización GGUF Q4_K_M del modelo `google/gemma-2-9b-it` afinado mediante LoRA (adaptador `Drfrodik/gemma2-9b-id-guidelines-lora`) por el Dr. Sahib Aghakishiyev para el dominio de enfermedades infecciosas y guías clínicas. El objetivo declarado es ofrecer razonamiento clínico local, rápido y ejecutable en GPUs de consumo, sin depender de servicios en la nube.

El modelo conserva la arquitectura original de Gemma 2 9B (transformer decoder-only con 9.241.705.984 parámetros) y se distribuye en un único fichero GGUF de aproximadamente 5,4 GB, lo que permite cargarlo íntegramente en VRAM de 8 GB. El autor reporta velocidades de 35–45 tokens/s en una RTX 4060/5060 y respuestas de 4–6 segundos.

Su relevancia radica en el nicho: es un modelo pequeño, especializado en un área regulada (infectología y guías clínicas) y empaquetado para despliegue inmediato con Ollama o LM Studio. No obstante, la información pública es escasa (93 descargas, sin benchmarks ni detalle del dataset de fine-tuning), por lo que debe evaluarse con cautela antes de cualquier uso clínico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), con atención local/global alternada según el diseño base de Gemma 2 |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Gemma 2 9B soporta 8.192 tokens, dato no confirmado para este fine-tuning) |
| Tipos de cuantizacion | GGUF Q4_K_M (única publicada en el repo) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se documenta el alcance tras el fine-tuning) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (fichero `gemma2-9b-id-guidelines-Q4_K_M.gguf`, ~5,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-9b-it`, un transformer decoder-only de 9.241 millones de parámetros entrenado por Google con instrucciones (SFT + RLHF). Sobre esa base se aplicó un fine-tuning con LoRA (Low-Rank Adaptation) cuyo adaptador se publica por separado como `Drfrodik/gemma2-9b-id-guidelines-lora`. El resultado se fusionó y cuantizó a GGUF Q4_K_M para su distribución.

No se dispone de información pública sobre el volumen de datos de entrenamiento, la composición del corpus clínico, el número de tokens utilizados, la estrategia de RLHF/DPO posterior ni los hiperparámetros del LoRA (rango, alpha, epochs). Tampoco se documenta ninguna innovación técnica adicional más allá del propio fine-tuning de dominio. La cuantización Q4_K_M es la estándar de llama.cpp: cuantización de 4 bits con mezcla de precisión en capas sensibles (atención y feed-forward seleccionadas a mayor bits).

## Capacidades

- Generación de texto conversacional en formato instruct, heredado de `gemma-2-9b-it`.
- Razonamiento clínico especializado en enfermedades infecciosas y guías de práctica clínica (dominio declarado del fine-tuning).
- Consulta de guías clínicas y protocolos de tratamiento antimicrobiano (según la descripción del autor).
- Ejecución local offline mediante Ollama, LM Studio o AnythingLLM.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite servir el modelo vía API compatible con el formato de Hugging Face.
- Capacidades multilingües: no documentadas explícitamente para este fine-tuning; el modelo base es multilingüe.
- Tool calling / function calling: no documentado.
- Modo thinking, visión o audio: no disponible (Gemma 2 9B IT es texto únicamente).
- Razonamiento multi-paso y agentes: no documentado específicamente para este fine-tuning.

## Casos de uso

- Consulta rápida de guías de antibioterapia: el modelo puede responder preguntas sobre pautas, dosis y duraciones en un entorno local sin conexión, útil en entornos con restricciones de red o confidencialidad.
- Apoyo a la formación médica: simulación de casos clínicos infecciosos y discusión de diagnósticos diferenciales en un portátil con GPU de 8 GB, sin coste de API.
- Triage documental en investigación clínica: resumen y extracción de información de protocolos y guías de práctica clínica almacenadas localmente, manteniendo los datos dentro de la institución.
- Prototipado de asistentes clínicos: servir el modelo vía Ollama o endpoint compatible para validar flujos conversacionales antes de invertir en modelos mayores.
- Despliegue en hardware de consumo: ejecución íntegra en VRAM de 8 GB (RTX 4060/5060) a 35–45 tokens/s según el autor, adecuado para demos y pruebas de concepto.
- Educación y divulgación: generación de explicaciones sobre enfermedades infecciosas para material formativo, con revisión humana obligatoria.
- Integración en pipelines de anonimización y preprocesado: uso como componente local en flujos que requieren que ningún dato clínico salga del perímetro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento reportado por el autor es la velocidad de inferencia: 35–45 tokens/s en una RTX 4060/5060 con el modelo cargado íntegramente en VRAM (8 GB), y latencias de 4–6 segundos por respuesta. No se aportan métricas de calidad (MMLU, MedQA, HumanEval, etc.) ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada: ~5,4 GB para el fichero GGUF Q4_K_M más overhead de contexto; el autor indica que cabe en 8 GB de VRAM.
- GPU recomendadas por el autor: RTX 4060 o RTX 5060 (8 GB). Cualquier GPU con ≥8 GB de VRAM debería poder ejecutarlo; GPUs profesionales (A100, H100) no son necesarias y no se documentan.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más (RTX 3060 Ti, 4060, 5060, 4070, etc.).
- Opciones de despliegue: Ollama (`ollama run hf.co/Drfrodik/gemma2-9b-id-guidelines-gguf:Q4_K_M`), LM Studio, AnythingLLM, y cualquier runtime compatible con GGUF (llama.cpp). vLLM y TGI no están documentados para este artefacto GGUF.
- Latencia y throughput: 35–45 tokens/s y 4–6 s por respuesta en RTX 4060/5060 según el autor. Sin datos para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Drfrodik/gemma2-9b-id-guidelines-gguf | 9,24 B | no disponible | Gemma | GGUF Q4_K_M | Fine-tuning clínico (infectología), sin benchmarks publicados |
| google/gemma-2-9b-it | 9,24 B | 8.192 tokens (modelo base) | Gemma | safetensors, GGUF | Modelo base instruct generalista; referencia de calidad |
| Meditron-7B (epfl-llm) | 7 B | 4.096 tokens | Llama 2 | safetensors, GGUF | Fine-tuning médico sobre Llama 2; benchmarks publicados en paper |
| BioMistral-7B | 7 B | 4.096 tokens | Apache 2.0 | safetensors, GGUF | Fine-tuning biomédico sobre Mistral; benchmarks publicados |

La comparación con Meditron-7B y BioMistral-7B es orientativa: ambos son modelos médicos de tamaño similar con licencias distintas y benchmarks publicados, mientras que este fine-tuning no aporta métricas de calidad. No se dispone de datos para comparar rendimiento real.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de mejora sobre el modelo base en tareas clínicas; el fine-tuning LoRA podría degradar capacidades generales sin que se documente.
- Riesgo de alucinación clínica: un modelo de 9 B afinado con datos no auditados puede generar dosis, pautas o interacciones farmacológicas incorrectas. No apto para uso clínico sin validación por profesionales y verificación contra fuentes primarias.
- Sesgos: no documentados. El corpus de fine-tuning es desconocido, por lo que no se puede evaluar sesgo geográfico, demográfico ni de práctica clínica.
- Idiomas: no se especifica qué idiomas cubre el fine-tuning; el modelo base es multilingüe, pero la especialización podría estar concentrada en inglés.
- Contexto: no se confirma la ventana de contexto tras el fine-tuning; asumir la del modelo base (8.192 tokens) es una suposición, no un dato verificado.
- Licencia Gemma: uso comercial permitido bajo los Gemma Terms of Use, con obligaciones de atribución y restricciones de uso (prohibición de usos dañinos, obligación de incluir el aviso de licencia). Revisar los términos antes de desplegar.
- Madurez del artefacto: 93 descargas, 0 likes, creado y actualizado en noviembre de 2026; sin comunidad ni issues que permitan evaluar su robustez.
- Cuantización Q4_K_M: pérdida de precisión respecto al modelo en fp16; no se documenta la degradación medida.
- Sin soporte documentado de tool calling ni agentes: no asumir estas capacidades en producción.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Drfrodik/gemma2-9b-id-guidelines-gguf
- Adaptador LoRA: https://huggingface.co/Drfrodik/gemma2-9b-id-guidelines-lora
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- AnythingLLM: https://anythingllm.com
