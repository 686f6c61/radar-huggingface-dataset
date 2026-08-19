# h3rb3rn/moe-expert-governance-4b

## Resumen

`moe-expert-governance-4b` es un modelo de lenguaje especializado de 4.2 mil millones de parámetros, desarrollado por el usuario h3rb3rn como componente del sistema compuesto "MoE Sovereign". Su función es actuar como motor de razonamiento de políticas de cumplimiento normativo, centrado en regulaciones europeas como el GDPR/DSGVO, la Ley de Inteligencia Artificial de la UE, el estándar BSI IT-Grundschutz, ISO 27001 e HIPAA. Fue destilado a partir de los modelos Mistral-Large-2407 y DeepSeek-V3 sobre el supercomputador LUMI-G, utilizando como base el modelo Qwen3.5-4B, que combina atención lineal y capas Mamba en una arquitectura híbrida.

El modelo resuelve el problema de la falta de precisión y las alucinaciones en tareas de auditoría de cumplimiento legal y técnico. En lugar de ser un "oráculo legal" autónomo, se integra en un sistema compound AI donde evalúa flujos de datos, clasifica riesgos según la AI Act, mapea controles de seguridad y genera informes estructurados en JSON o Markdown. Su relevancia actual radica en la creciente demanda de herramientas de verificación automática de conformidad normativa, especialmente para empresas que operan en la UE y necesitan auditar sus pipelines de datos y sistemas de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal + Mamba (base Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M, GGUF Q8_0 (además de BF16 en safetensors) |
| Idiomas soportados | Inglés (en), Alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-4B, una arquitectura híbrida que combina atención lineal (linear attention) con bloques Mamba, lo que permite manejar secuencias largas con menor coste computacional que los transformers tradicionales. Sobre esta base se aplicó un ajuste fino mediante destilación desde dos modelos profesores: Mistral-Large-2407 y DeepSeek-V3. El proceso de destilación utilizó un dataset de 33.600 trayectorias de gobernanza regulatoria verificadas, filtradas mediante validación cruzada con expertos legales. El entrenamiento se realizó en el supercomputador LUMI-G con 8 GPUs AMD Instinct MI250X de 128 GB, usando DeepSpeed ZeRO-2, ROCm 7.0 y PyTorch 2.6. Se empleó LoRA con r=16, alpha=32, dropout 0.05, sobre los módulos q_proj, k_proj, v_proj, o_proj, gate_proj y up_proj. Se entrenó durante 3 épocas con batch efectivo de 128, learning rate de 1.5e-5 con decaimiento coseno y warmup. Finalmente, el adaptador se fusionó en CPU en BF16 y se exportó a GGUF en Q4_K_M y Q8_0.

## Capacidades

- Generación de texto especializada en cumplimiento normativo y auditoría técnica.
- Clasificación de riesgo de sistemas de IA según la Ley de IA de la UE (categorías: prohibido, alto riesgo, transparencia específica, riesgo mínimo).
- Mapeo de requisitos GDPR (artículos, recitales) y evaluación de medidas técnicas y organizativas (TOMs, Art. 32).
- Auditoría de arquitecturas contra módulos BSI IT-Grundschutz (INF.1, CON.2, OPS.1) y controles ISO 27001.
- Generación de informes estructurados en formato JSON o Markdown, con matrices de cumplimiento (requisito → control → estado).
- Detección de brechas de privacidad por diseño y evaluación de minimización de datos (Art. 5(1)(c)).
- Capacidad multilingüe limitada a inglés y alemán, con vocabulario técnico legal específico.

## Casos de uso

- Auditoría interna de cumplimiento GDPR: el modelo evalúa flujos de datos personales, identifica si se cumple la minimización y la limitación de finalidad, y genera un informe con los artículos aplicables y las medidas técnicas recomendadas (p. ej., TLS 1.3, AES-256-GCM, seudonimización).
- Clasificación de riesgo de sistemas de IA: dado un sistema de IA, el modelo lo categoriza según los anexos de la AI Act, justificando la clasificación con criterios objetivos y señalando si requiere evaluación de conformidad.
- Mapeo de controles de seguridad BSI: para una infraestructura concreta, el modelo sugiere módulos IT-Grundschutz relevantes y verifica si los controles existentes cubren los requisitos, generando una matriz de cobertura.
- Generación de informes de auditoría automatizados: integrado en un pipeline de CI/CD, el modelo produce informes JSON listos para consumir por herramientas de gestión de cumplimiento, reduciendo el tiempo de revisión manual.
- Soporte a DPO (Data Protection Officer): el modelo asiste en la preparación de DPIA (Evaluación de Impacto de Protección de Datos), identificando factores de riesgo y proponiendo mitigaciones basadas en los artículos del GDPR.
- Revisión de contratos y cláusulas de protección de datos: aunque no es su foco principal, puede analizar textos contractuales y señalar posibles incumplimientos de los requisitos de transferencia internacional de datos (Capítulo V del GDPR).

## Benchmarks y rendimiento

El autor proporciona una evaluación sobre un conjunto de 1.000 escenarios de auditoría regulatoria y de arquitectura, sin contaminación con el entrenamiento. Los resultados se comparan con el modelo base Qwen 3.5 4B:

| Métrica | Qwen 3.5 4B base | moe-expert-governance-4b | Delta |
|---|---|---|---|
| Precisión en mapeo de artículos GDPR | 66,2 % | 96,3 % | +30,1 % |
| Exactitud en clasificación de riesgo AI Act | 58,7 % | 94,8 % | +36,1 % |
| Cobertura de controles BSI IT-Grundschutz | 51,4 % | 92,5 % | +41,1 % |
| Detección de brechas de privacidad por diseño | 62,0 % | 95,2 % | +33,2 % |
| Formato de matriz de cumplimiento estructurada | 71,8 % | 98,4 % | +26,6 % |
| Tasa de citas legales alucinadas | 18,5 % | 1,8 % | -16,7 % |

La evaluación se realizó con temperatura 0.05 y 3 semillas independientes, puntuando contra matrices de cumplimiento de referencia elaboradas por ingenieros de privacidad y ciberseguridad. No se proporcionan resultados de benchmarks generales como MMLU o HumanEval.

## Requisitos de hardware

- Inferencia en CPU: posible con cuantización GGUF Q4_K_M, con uso de RAM de aproximadamente 2,5–3 GB para el modelo (más overhead del runtime).
- Inferencia en GPU consumer: cabe en GPUs con 6 GB de VRAM o más usando Q4_K_M; con Q8_0 se recomienda al menos 8 GB. Ejemplos: RTX 3060, RTX 4060, RTX 2070.
- GPUs recomendadas para mayor velocidad: RTX 3090, RTX 4090, A100, H100 (aunque no es necesario para este tamaño).
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se convierte a formato compatible), Transformers con carga en BF16 (requiere ~8,5 GB de VRAM en FP16/BF16).
- Latencia estimada: en GPU consumer moderna (RTX 3090) con Q4_K_M, se espera una generación de 20–40 tokens/s; en CPU con llama.cpp, 5–10 tokens/s dependiendo del hardware.
- Throughput: no disponible de forma oficial, pero al ser un modelo de 4B, puede servir múltiples peticiones concurrentes en un solo GPU con batching.

## Comparativa con modelos similares

No existen muchos modelos especializados en cumplimiento normativo europeo de tamaño similar. La comparación más directa es con su modelo base y con alternativas generalistas:

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| moe-expert-governance-4b | 4,2 B | No disponible | Cumplimiento GDPR, AI Act, BSI | Apache 2.0 |
| Qwen3.5-4B (base) | 4,2 B | No disponible | Generalista | Apache 2.0 |
| Mistral-7B-Instruct | 7 B | 32k | Generalista, instruct | Apache 2.0 |
| Llama-3.1-8B-Instruct | 8 B | 128k | Generalista, instruct | Llama 3.1 license |

La ventaja de este modelo es su precisión en tareas regulatorias específicas, muy superior a la de los generalistas, aunque su alcance se limita a inglés y alemán y a los dominios de cumplimiento mencionados.

## Limitaciones y advertencias

- El modelo está especializado en normativa europea (GDPR, AI Act) y estándares alemanes (BSI IT-Grundschutz); no cubre otras jurisdicciones (p. ej., CCPA, LGPD) de forma exhaustiva.
- Solo soporta inglés y alemán; no se recomienda su uso en otros idiomas sin validación adicional.
- Aunque la tasa de alucinación de citas legales se reduce al 1,8 %, no es cero. Las salidas deben ser verificadas por profesionales cualificados antes de tomar decisiones legales.
- No es un asesor legal ni sustituye el juicio de un abogado o DPO. Es una herramienta de apoyo para ingenieros y auditores.
- La longitud de contexto no está documentada; se desconoce si puede manejar documentos largos de forma fiable.
- El entrenamiento se realizó con un dataset de 33.600 trayectorias; la cobertura de casos extremos o regulaciones recientes puede ser limitada.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo no incluye garantías implícitas de exactitud legal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/h3rb3rn/moe-expert-governance-4b
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento (referenciado): moe-sovereign/expert-governance-sft (no se proporciona URL directa)
- Supercomputador LUMI: https://www.lumi-supercomputer.eu/
