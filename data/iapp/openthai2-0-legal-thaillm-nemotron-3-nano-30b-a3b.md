# iapp/openthai2.0-legal-thaillm-nemotron-3-nano-30b-a3b

## Resumen
OpenThai 2.0 Legal ThaiLLM es un modelo de lenguaje especializado en derecho tailandés, desarrollado por iApp en colaboración con AIEAT dentro de la familia OpenThai (anteriormente OpenThaiGPT). Se construye como un ajuste fino del modelo base NVIDIA Nemotron-3-Nano-Omni-30B-A3B-Reasoning, del que se extrae el núcleo de texto, y resuelve un problema concreto: proporcionar conocimiento jurídico tailandés verificable con citas a nivel de sección (nombre de la ley y número de มาตรา) sobre una base autoalojable de 30B parámetros.

El modelo emplea una arquitectura híbrida Mamba2-Transformer con mezcla de expertos (MoE): 30B parámetros totales y aproximadamente 3B activos por token, con una ventana de contexto de 256k tokens (262.144). Esta combinación permite procesar conjuntos completos de estatutos y expedientes de sentencias en un único prompt con un coste de caché KV muy reducido (unos 1,5 GiB para una secuencia completa de 256k, frente a los ~24 GiB de un modelo denso equivalente), gracias a que solo 6 de sus 52 capas son de atención.

Su relevancia actual radica en que combina tres elementos poco frecuentes en modelos jurídicos de nicho: pesos abiertos, entrenamiento con datos fundamentados (estatutos y sentencias tailandesas con cada respuesta ligada a su sección fuente) y un contrato JSON de citación pensado para integrarse en pipelines de RAG y herramientas de redacción legal. Se distribuye bajo la licencia NVIDIA Open Model Agreement.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2-Transformer con MoE (Nemotron-H) |
| Parámetros totales | 31.577.940.288 (~30B) |
| Parámetros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens (256k), prompt más completion |
| Tipos de cuantización | BF16 (original); GGUF Q4_K_M / Q5_K_M / Q8_0; NVFP4 |
| Idiomas soportados | Tailandés (principal), inglés (razonamiento) |
| Licencia | NVIDIA Open Model Agreement |
| Formato de pesos | safetensors (BF16, 17 shards); GGUF; NVFP4 |

## Arquitectura y entrenamiento
El modelo parte de NVIDIA Nemotron-3-Nano-Omni-30B-A3B-Reasoning, del que se extrae el núcleo de texto. La arquitectura es un híbrido Mamba2-Transformer con mezcla de expertos: de las 52 capas totales, solo 6 son de atención, lo que reduce drásticamente el coste de memoria de la caché KV en contextos largos. Con ~3B parámetros activos por token, el modelo mantiene un coste de inferencia bajo pese a sus 30B totales.

El entrenamiento se realizó en tres etapas sobre el stack NVIDIA NeMo. Primero, un preentrenamiento continuado (CPT) con estatutos tailandeses y sentencias judiciales reales para interiorizar el conocimiento jurídico en los pesos, usando Megatron-Bridge. Después, un ajuste fino supervisado (SFT) que enseña a responder de forma fundamentada siguiendo un contrato JSON fijo que cita únicamente las secciones proporcionadas. Por último, un entrenamiento con refuerzo GRPO (NeMo-RL) cuyo reward es la propia métrica citation-F1 del benchmark oficial, penalizando citas erróneas o ausentes. El resultado es un modelo afinado para precisión de citación, no solo para fluidez.

## Capacidades
- Generación de texto y razonamiento jurídico en tailandés, con razonamiento interno en inglés.
- Citación estructurada a nivel de sección: devuelve nombre exacto de la ley y número de มาตรา en un contrato JSON.
- Respuesta fundamentada en modo open-book (RAG): cita solo las secciones relevantes entre distractores.
- Recuerdo closed-book: responde sobre el Código Civil y Comercial y el Código Tributario sin recuperación externa.
- Redacción de ensayos jurídicos de formato largo (casos del Tribunal Supremo tailandés).
- Capacidad de selección de secciones: descarta documentos casi relevantes en modo RAG realista.
- Ventana de contexto de 256k para conjuntos de estatutos y expedientes multi-documento.
- Compatibilidad con endpoints OpenAI (vLLM verificado y NVIDIA NIM).
- Capacidad multimodal/omni heredada del base: no confirmada en la información disponible para este ajuste.

## Casos de uso
- Asistencia jurídica con RAG: se insertan las secciones candidatas de la ley en el prompt y el modelo cita únicamente las aplicables, integrándose con cualquier retriever existente sin necesidad de un modelo de embeddings o rerank específico.
- Redacción de borradores de escritos y dictámenes: genera ensayos jurídicos con conclusión (holding), cobertura de puntos clave y citas correctas, útil para despachos que necesitan primeros borradores sobre jurisprudencia del Tribunal Supremo.
- Consulta de estatutos a libro cerrado: para preguntas frecuentes sobre el Código Civil y Comercial o el Código Tributario, responde sin recuperación externa, reduciendo latencia y coste en asistentes de atención legal.
- Verificación de citas en documentos existentes: el contrato JSON permite validar de forma automática que las referencias a leyes y secciones de un texto son correctas y existen.
- Análisis de expedientes largos: con 256k tokens de contexto puede procesar conjuntos completos de sentencias y legislación en un solo prompt, adecuado para revisión documental de casos complejos.
- Despliegue autoalojado en infraestructura propia: con cuantización de 4 bits corre en ~24 GB de RAM/VRAM, lo que permite ofrecer servicios legales en una única GPU consumer o workstation sin enviar datos sensibles a la nube.
- Herramientas de drafting integradas: el contrato JSON de citación facilita la integración en editores y pipelines que necesitan salida estructurada y verificable.

## Benchmarks y rendimiento

| Evaluación | OpenThai2.0-Legal | Qwen3.6-35B | Nemotron-3-30B base |
|---|---|---|---|
| Closed-book Civil y Comercial (n=3.729) | 0,07 | 0,02 | 0,001 |
| Closed-book Tributario (n=50) | 0,40 | 0,36 | 0,31 |
| Open-book Civil y Comercial, citación (n=3.729) | 0,99 | 0,99 | 0,98 |
| Open-book Tributario, echo (n=50) | 0,84 | 0,84 | 0,64 |
| Open-book Tributario, selección (n=50) | 0,69 | 0,64 | 0,45 |
| Ensayo: citas correctas (n=72) | 0,25 | 0,09 | 0,02 |
| Ensayo: holding (n=72) | 0,57 | 0,50 | 0,31 |
| Ensayo: cobertura (n=72) | 0,60 | 0,55 | 0,27 |
| Ensayo: fluidez (n=72) | 0,46 | 0,43 | 0,13 |

Puntuación de 0 a 1, mayor es mejor. Las filas de citación usan el scorer citation-F1 de NitiBench (pasada única, temperatura 0); holding, cobertura y fluidez de los ensayos son evaluados por Gemini 3.1 Flash Lite.

## Requisitos de hardware
- VRAM estimada: ~60 GB en BF16 para los 30B parámetros; ~24 GB con cuantización de 4 bits (Q4_K_M / NVFP4).
- GPU recomendadas: una sola GPU de 80 GB (A100, H100) para BF16; una GPU de 24 GB para la build NVFP4 o GGUF Q4.
- Cabe en GPU consumer: sí, en tarjetas de 24 GB (por ejemplo RTX 3090/4090) usando cuantización de 4 bits, según indica el autor.
- Opciones de despliegue: vLLM (verificado), NVIDIA NIM (compatible con OpenAI), Ollama (`ollama run openthai/openthai-2.0-legal`), llama.cpp vía GGUF.
- Caché KV: ~1,5 GiB para una secuencia completa de 256k, frente a ~24 GiB de un denso de 30B.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| OpenThai2.0-Legal | 30B totales / ~3B activos (MoE) | 256k | Jurídico tailandés con citación | NVIDIA Open Model Agreement |
| Qwen3.6-35B | 35B | no disponible | Generalista multilingüe | no disponible |
| Nemotron-3-30B base | 30B totales / ~3B activos (MoE) | 256k | Generalista, base del ajuste | NVIDIA Open Model Agreement |

Frente a Qwen3.6-35B, el modelo de iApp obtiene mejores resultados en recuerdo closed-book de Civil y Comercial (0,07 frente a 0,02), en selección tributaria (0,69 frente a 0,64) y en todas las métricas de ensayo jurídico (citas 0,25 frente a 0,09; holding 0,57 frente a 0,50). Frente a su base Nemotron-3-30B, la mejora es notable en conocimiento jurídico y citación, lo que confirma el efecto del CPT, SFT y GRPO. El contexto de 256k es un diferenciador frente a alternativas densas de tamaño similar.

## Limitaciones y advertencias
- El recuerdo closed-book de Civil y Comercial es bajo en términos absolutos (0,07), por lo que el uso sin recuperación no es fiable para esa materia.
- La precisión de citas en ensayos es limitada (0,25), lo que exige revisión humana en redacción legal.
- Riesgo de alucinación jurídica: puede generar referencias plausibles pero incorrectas; el contrato JSON ayuda a validar, pero no elimina el riesgo.
- Idiomas limitados a tailandés e inglés; el razonamiento interno se realiza en inglés, lo que puede afectar matices del tailandés jurídico.
- Licencia NVIDIA Open Model Agreement: revisar condiciones antes de uso comercial; no es una licencia de código abierto permisiva.
- Modelo de nicho con 152 descargas y 9 likes en el momento de la ficha: comunidad pequeña y menos validación externa.
- No se han publicado datos de latencia, throughput ni evaluación multimodal para este ajuste concreto.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/iapp/openthai2.0-legal-thaillm-nemotron-3-nano-30b-a3b
- GGUF oficial: https://huggingface.co/iapp/openthai2.0-legal-thaillm-nemotron-3-nano-30b-a3b-GGUF
- Build NVFP4: https://huggingface.co/iapp/openthai2.0-legal-thaillm-nemotron-3-nano-30b-a3b-NVFP4
- Guía de Ollama: https://openthai.aieat.or.th/ollama
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
