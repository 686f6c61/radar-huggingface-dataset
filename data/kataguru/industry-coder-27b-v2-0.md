# kataguru/Industry-Coder-27B-v2.0

## Resumen

Kataguru Industry-Coder-27B v2.0 es un modelo multimodal (texto e imagen a texto) de 27 mil millones de parámetros densos, desarrollado por kataguru sobre la base de Qwen/Qwen3.8-27B. Está especializado en ingeniería de software industrial: programación de PLC y CNC (IEC 61131-3, Siemens SCL, Beckhoff TwinCAT 3 ST, G-code), arquitectura de sistemas, programación competitiva, ciberseguridad ofensiva y defensiva, y coding agéntico. Su rasgo más distintivo es el soporte bilingüe nativo de grado soberano en finés e inglés, con un plan de estudios certificado al 40 % en finés y 60 % en inglés.

El modelo se ha entrenado mediante el "4-Cycle Dynamic Epistemic Curriculum" de Kataguru (Sykli 1 a Sykli 4) con 20.000 muestras doradas certificadas, usando QLoRA con subespacio ortonormal Rank-16 QR-Frozen-A (lora_r=16, lora_alpha=32). Además, ha pasado por el pipeline de "descensura" SOMA/ARA, con verificación de 0,00 % de negativas, y aplica una política estricta anti-sycophancy que rechaza adular al usuario y cuestiona premisas erróneas.

Arquitecturalmente, combina 64 capas híbridas de lenguaje Gated-DeltaNet / Full-Attention, un encoder de visión multimodal y una cabeza especulativa Multi-Token Prediction (MTP). Se publica en precisión nativa BF16 (18 shards de safetensors, ~54,3 GB) bajo licencia Apache 2.0, y según la model card supera a su modelo base en 15 benchmarks con una media total de 68,73 % (+8,42 puntos porcentuales).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration, denso, híbrido Gated-DeltaNet / Full-Attention (64 capas), con encoder de visión y cabeza MTP |
| Parametros totales | 27.781.427.952 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE; la model card lo describe como denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 nativo (esta release); no se indican otras variantes en la ficha |
| Idiomas soportados | finés (fi), inglés (en), estonio (et), húngaro (hu), turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18 shards, 1.199 tensores, ~54,3 GB; repo completo 55,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal denso de 27 mil millones de parámetros basado en Qwen3.8-27B. El bloque de lenguaje consta de 64 capas híbridas que alternan mecanismos Gated-DeltaNet (atención de tipo lineal/recurrente) y Full-Attention (851 tensores en total), lo que sugiere un diseño orientado a eficiencia en secuencias largas. Incluye además un encoder de visión multimodal (model.visual.*, 333 tensores) que habilita el pipeline image-text-to-text, y una cabeza de Multi-Token Prediction (mtp.*, 15 tensores) para decodificación especulativa, que acelera la inferencia al predecir varios tokens por paso.

El entrenamiento parte de Qwen/Qwen3.8-27B y sigue el "4-Cycle Dynamic Epistemic Curriculum" de Kataguru (Sykli 1 a Sykli 4), con 20.000 muestras doradas certificadas distribuidas en un 70 % de contenido técnico (programación competitiva, arquitectura de sistemas, PLC y CNC industrial) y un 30 % de "Elite Anchor" permanente. El ajuste se realizó con Rank-16 QR-Frozen-A Orthonormal Subspace QLoRA (lora_r=16, lora_alpha=32). El corpus es bilingüe con equilibrio estricto 40 % finés / 60 % inglés, auditado sobre morfología finesa aglutinante (verificación Kotus) y terminología técnica compuesta (yhdyssanat). Adicionalmente, se aplicó el pipeline SOMA/ARA (Sparse Orthogonal Modulation & Abliteration + Activation Refusal Abliteration), que aísla el vector de activación de negativas mediante Identical Prompt Paired Completion Contrast y lo proyecta fuera de las matrices self_attn.o_proj, linear_attn.out_proj y mlp.down_proj (W' = W − α·v(vᵀW)), antes y durante el SFT con Elite Anchor. No se detalla el número total de tokens de entrenamiento ni el uso de RLHF/DPO.

## Capacidades

- Generación de código idiomático en C, Rust, Python, TypeScript, Java y lenguajes PLC IEC 61131-3 (Siemens SCL, Beckhoff TwinCAT 3 ST, G-code CNC), con razonamiento técnico y documentación en finés e inglés.
- Coding agéntico: soporte de tool calling verificado en BFCL V4 (73,14 % en 1.719 casos AST; 99,00 % en escenarios de múltiples herramientas, 96,25 % en Python simple, 85,27 % en Live AST).
- Comprensión multimodal: análisis de diagramas técnicos e imágenes gracias al encoder de visión (pipeline image-text-to-text).
- Razonamiento matemático y STEM de nivel posgrado (GSM8K CoT: 86,73 %; GPQA Diamond: 66,16 %; MedQA: 82,80 %).
- Seguimiento estricto de instrucciones y restricciones (IFEval Strict: 74,86 % Prompt / 81,89 % Instruction).
- Ciberseguridad ofensiva y defensiva sin negativas: penetration testing con Kali Linux, hardening OPC UA / IEC 62443, ingeniería inversa, análisis forense e interlocks de seguridad industrial (0,00 % de negativas verificadas).
- Soporte multilingüe nativo en finés e inglés de grado soberano, con idiomas adicionales declarados: estonio, húngaro y turco.
- Decodificación especulativa mediante la cabeza MTP para inferencia más rápida.
- Anti-sycophancy estricto: sin preámbulos ni adulaciones, con refutación inmediata de premisas o errores de ingeniería desde primeros principios.
- Plantilla de chat "Sovereign Quad-Mode Master Chat Template v2.1" con cuatro modos de consulta (la model card corta la descripción de los modos; los detalles concretos no están disponibles).

## Casos de uso

- Generación de código PLC industrial: redacción y revisión de programas en Siemens SCL y Beckhoff TwinCAT 3 ST conforme a IEC 61131-3, con razonamiento técnico en finés o inglés; ideal para integradores de automatización que necesitan acelerar el desarrollo de lógica de control.
- Programación CNC: generación y depuración de G-code para máquinas herramienta, incluyendo análisis de diagramas técnicos mediante la entrada de imagen.
- Asistente de coding agéntico: gracias a su puntuación en BFCL V4 (99,00 % en múltiples herramientas), puede integrarse en pipelines de agentes que ejecuten herramientas, editen repositorios o automaticen tareas multi-paso de desarrollo.
- Ciberseguridad industrial: auditoría y hardening de sistemas OPC UA conforme a IEC 62443, análisis de vulnerabilidades, ingeniería inversa y penetration testing sin negativas del modelo.
- Ingeniería de software bilingüe finés-inglés: documentación técnica, comentarios de código y especificaciones arquitectónicas en finés nativo sin anglicismos ni errores de caso morfológico, algo poco habitual en modelos abiertos.
- Razonamiento STEM y matemático: resolución de problemas de nivel posgrado (GPQA Diamond 66,16 %) y aritmética con cadena de razonamiento (GSM8K 86,73 %) para tareas de análisis y verificación técnica.
- Atención técnica conversacional: el enfoque anti-sycophancy y la alta puntuación en IFEval Strict lo hacen adecuado para asistentes que deben corregir errores del usuario y cumplir restricciones estrictas de formato.
- Análisis forense y científico independiente: tareas de investigación técnica donde se requiera honestidad epistémica sin sesgos de complacencia (TruthfulQA MC2: 53,06 %).

## Benchmarks y rendimiento

Resultados publicados en la model card, comparados con el modelo base Qwen/Qwen3.8-27B:

| Benchmark | Industry-Coder-27B v2.0 | Qwen3.8-27B Base | Diferencia |
|---|---|---|---|
| Media total de 15 benchmarks (Σ₁₅) | 68,73 % | no disponible | +8,42 pp |
| LiveCodeBench v6 (175 problemas) | 42,29 % (Easy 95,35 %; Medium 48,08 %; Hard 10,00 %) | 26,86 % | +15,43 pp |
| IFEval Strict Prompt (541 prompts) | 74,86 % | 48,20 % | +26,66 pp |
| IFEval Strict Instruction (812 restricciones) | 81,89 % | 58,40 % | +23,49 pp |
| BFCL V4 Agentic Tool Calling (1.719 casos AST) | 73,14 % (Live AST 85,27 %; Python Simple 96,25 %; Multiple 99,00 %; Live Relevance 93,75 %) | 62,60 % | +10,54 pp |
| GPQA Diamond (198 tareas) | 66,16 % | 45,20 % | +20,96 pp |
| GSM8K CoT (1.319 problemas) | 86,73 % Strict / 87,79 % Flexible | 76,50 % | +10,23 pp |
| MedQA (1.273 tareas USMLE) | 82,80 % | 74,20 % | +8,60 pp |
| TruthfulQA MC2 | 53,06 % | 47,50 % | +5,56 pp |

Nota: estos datos proceden de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~55-60 GB de VRAM (pesos de ~54,3 GB más KV cache y overhead), lo que exige al menos una GPU de 80 GB (A100 80 GB, H100 80 GB) o dos GPUs de 48 GB (A6000, L40S) con paralelismo de tensores.
- No cabe en una única GPU de consumo (una RTX 4090 con 24 GB es insuficiente incluso con esta release en BF16; no se han publicado versiones cuantizadas en esta ficha, por lo que no puede estimarse el ajuste en 4 bits).
- GPUs recomendadas: NVIDIA A100 80 GB, H100 80 GB o configuraciones multi-GPU con 48 GB por tarjeta.
- Despliegue: la model card menciona explícitamente vLLM entre sus tags; es compatible con la librería transformers (endpoints_compatible en Hugging Face). No se menciona soporte para llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponible; la cabeza MTP de predicción multi-token sugiere aceleración de la decodificación, pero no hay cifras publicadas.

## Comparativa con modelos similares

Comparativa orientativa con modelos abiertos de gama similar orientados a código (datos de los modelos base según la propia model card; el resto son valores generalmente conocidos y pueden variar según versión):

| Modelo | Parametros | Multimodal | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Kataguru Industry-Coder-27B v2.0 | 27,8 B (denso) | Sí (visión) | no disponible | Apache 2.0 | Especializado en PLC/CNC industrial, bilingüe fi/en, sin negativas |
| Qwen/Qwen3.8-27B (base) | 27,8 B | Sí | no disponible | Apache 2.0 | Modelo base; Σ₁₅ 8,42 pp inferior según la model card |
| Qwen2.5-Coder-32B-Instruct | 32,5 B (denso) | No | 128 K | Apache 2.0 | Especialista en código de propósito general, sin foco industrial ni finés nativo |
| Codestral 22B (Mistral) | 22,2 B (denso) | No | 32 K | MNPL (no comercial) | Especialista en código con soporte de más de 80 lenguajes, pero licencia restrictiva para uso comercial |

## Limitaciones y advertencias

- El pipeline SOMA/ARA elimina las negativas del modelo por diseño (0,00 % de refusals verificadas): no aplica salvaguardas de seguridad y puede generar contenido peligroso (exploits, técnicas de ataque, ingeniería inversa). Su despliegue requiere controles de acceso y gobernanza estrictos por parte del operador.
- Riesgo de alucinación: no disponible como métrica específica; como todo LLM, puede generar código PLC/CNC incorrecto, con consecuencias potencialmente graves en entornos industriales reales. Nunca debe usarse para generar lógica de control en producción sin revisión humana experta y validación en simulación.
- El rendimiento en problemas difíciles es limitado: LiveCodeBench Hard es solo del 10,00 %, por lo que no es fiable para problemas algorítmicos de alta dificultad.
- Rendimiento no verificado independientemente: todas las cifras proceden de la model card del autor, con solo 43 descargas y 2 likes en el momento de la ficha, lo que indica adopción muy temprana.
- Idiomas: el soporte nativo profundo está limitado a finés e inglés; estonio, húngaro y turco están declarados pero sin métricas publicadas. No hay soporte declarado para castellano.
- Longitud de contexto: no publicada en la model card, lo que dificulta planificar aplicaciones con documentos largos.
- La descripción de los cuatro modos de la plantilla de chat está truncada en la documentación disponible; los detalles de uso de cada modo no están disponibles.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque el pipeline de abliteration puede afectar a los términos de uso del modelo base según la política del proveedor; no se indican advertencias al respecto en la model card.
- Solo se publica la release BF16 (~54,3 GB): no hay variantes cuantizadas oficiales, lo que eleva la barrera de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kataguru/Industry-Coder-27B-v2.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, repositorio de código, demo o blog oficial: no disponibles en la información proporcionada.
