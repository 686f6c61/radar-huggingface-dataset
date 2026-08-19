# deer-sec/CyberStag-26B-A4B-v1-Q8_0.gguf

## Resumen

CyberStag-26B-A4B-v1 es un modelo de lenguaje especializado en ciberseguridad y razonamiento lógico profundo, desarrollado por deer-sec sobre la arquitectura MoE (Mixture of Experts) de Google Gemma-4-26B-A4B. Se trata de un fine-tuning LoRA con los adaptadores fusionados en el modelo base, entrenado con `mlx_lm.lora` sobre un dataset curado y destilado de conceptos avanzados de seguridad, inteligencia de amenazas y deducción lógica. El modelo está diseñado para profesionales de seguridad, investigadores, analistas SOC y administradores de sistemas, ofreciendo capacidades mejoradas en modelado de amenazas, evaluación de vulnerabilidades, interpretación de logs y estructuración de estrategias de respuesta a incidentes.

El archivo GGUF aquí referenciado corresponde a la cuantización Q8_0 (8 bits), con un tamaño de 26,9 GB y 25,23 mil millones de parámetros totales. Es un modelo exclusivamente de texto, sin soporte multimodal. La licencia Apache 2.0 permite uso comercial, modificación y redistribución libre. Se distribuyen también versiones en MLX (bf16 y optiq8) y GGUF en f16 y Q4_K_M para adaptarse a distintos entornos de hardware.

La relevancia actual de este modelo radica en su especialización en un dominio crítico como la ciberseguridad, combinada con la eficiencia de una arquitectura MoE que activa solo una fracción de sus parámetros por token, lo que permite desplegarlo en hardware más modesto que un modelo denso equivalente. Su enfoque en razonamiento paso a paso, aunque incrementa ligeramente la latencia, produce análisis más profundos y accionables que el modelo base en contextos de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Gemma-4-26B-A4B |
| Parametros totales | 25.233.142.046 (25,23B) |
| Parametros activos | No especificado explicitamente; el nombre del modelo base (A4B) sugiere ~4B activos |
| Longitud de contexto | No disponible (no se menciona en la informacion proporcionada) |
| Tipos de cuantizacion | Q8_0, Q4_K_M, f16 (GGUF); bf16, optiq8 (MLX) |
| Idiomas soportados | Ingles, japones, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este archivo), MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en Gemma-4-26B-A4B, una arquitectura transformer con mezcla de expertos (MoE) de Google, que combina 26B parametros totales con una activacion selectiva de expertos por token. El fine-tuning se realizo mediante Low-Rank Adaptation (LoRA) con `mlx_lm.lora`, fusionando posteriormente los adaptadores en el modelo base para un despliegue directo. Se entrenaron aproximadamente 448,7 millones de parametros (1,778% del total), actualizando de forma amplia y estrategica los mecanismos de atencion y MLP, incluyendo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y capas de expertos. Esta estrategia busca capturar los matices de la terminologia de seguridad y las estructuras de codigo sin provocar olvido catastrofico.

El dataset de entrenamiento, curado y destilado, se centra en conceptos avanzados de ciberseguridad, inteligencia de amenazas precisa, deduccion logica y escenarios de seguridad complejos. Los detalles granulares de los datos de entrenamiento se mantienen confidenciales para preservar la integridad del modelo y prevenir su uso indebido. No se menciona el uso de RLHF o DPO; el proceso es exclusivamente de supervisión (SFT) con LoRA.

## Capacidades

- Generacion de texto especializado en ciberseguridad: analisis de vectores de ataque, evaluacion de vulnerabilidades, interpretacion de logs de sistema y propuesta de estrategias de mitigacion.
- Razonamiento logico profundo: descompone problemas complejos en pasos secuenciales y deductivos, ofreciendo respuestas mas analiticas que el modelo base.
- Modelado de amenazas: identifica actores, tácticas, tecnicas y procedimientos (TTPs) en escenarios de seguridad.
- Soporte multilingue: entrenado principalmente en ingles y japones, con capacidad multilingue general.
- Capacidad de conversacion: apto para dialogos multi-turno en contextos de consulta y analisis de seguridad.
- Sin soporte multimodal: exclusivamente texto, no procesa imagenes, audio ni video.
- No se documenta soporte explicito de tool calling o function calling en la informacion proporcionada.

## Casos de uso

- Analisis de logs de servidor: el modelo puede examinar registros de acceso y eventos para detectar patrones indicativos de SQL injection, cross-site scripting u otros ataques, proporcionando explicaciones detalladas y recomendaciones de mitigacion. Es adecuado por su capacidad de razonamiento paso a paso y su entrenamiento en datos de seguridad.
- Evaluacion de vulnerabilidades: dado un informe de escaneo o una descripcion de una debilidad, el modelo puede priorizar riesgos, sugerir parches y explicar el impacto potencial en la infraestructura.
- Respuesta a incidentes: estructura estrategias completas de respuesta, desde la contencion hasta la erradicacion y recuperacion, basandose en descripciones de sintomas y evidencias. Su razonamiento profundo ayuda a cubrir pasos que un analista novato podria pasar por alto.
- Formacion y concienciacion en seguridad: genera explicaciones didacticas sobre conceptos como CSRF, phishing o ransomware, adaptadas al nivel del interlocutor, util para programas de capacitacion interna.
- Interpretacion de logs ofuscados o confusos: su entrenamiento en terminologia de seguridad permite descifrar entradas de log criticas que otros modelos podrian malinterpretar, facilitando la deteccion temprana de compromisos.
- Generacion de informes de seguridad: redacta resumenes ejecutivos y tecnicos de hallazgos de seguridad, ahorrando tiempo a los analistas y asegurando coherencia en la documentacion.
- Analisis de codigo para fallos de seguridad: dado un fragmento de codigo, identifica posibles vulnerabilidades (buffer overflow, inyeccion, etc.) y sugiere correcciones, aprovechando su comprension de estructuras de programacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras cualitativas frente al modelo base en contextos de ciberseguridad (respuestas mas precisas y razonamiento mas profundo), pero no proporciona metricas cuantitativas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 pesa 26,9 GB, por lo que se recomiendan al menos 28-30 GB de VRAM para cargar el modelo con margen de contexto. La version Q4_K_M, con un peso menor (estimado ~15-16 GB), puede ejecutarse en GPUs de 24 GB.
- GPU recomendadas: para Q8_0, GPUs como A100 40GB, A6000 48GB o RTX 4090 24GB (solo con Q4_K_M). Para Q4_K_M, una RTX 3090/4090 de 24 GB es suficiente.
- En consumer GPU: si, con la cuantizacion Q4_K_M en tarjetas de 24 GB. La Q8_0 requiere GPU profesional o de datacenter.
- Opciones de despliegue: llama.cpp y LM Studio para GGUF; MLX para Apple Silicon (formatos bf16 y optiq8). Tambien puede usarse vLLM con el modelo base en safetensors si se requiere alto throughput.
- Latencia y throughput: no se proporcionan datos concretos. La model card indica un ligero aumento del tiempo de "pensamiento" (latencia de prefill) frente al modelo base, lo que implica un throughput menor en tareas de razonamiento profundo.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| CyberStag-26B-A4B-v1 | Gemma-4-26B-A4B | 25,23B | Ciberseguridad y razonamiento | Apache 2.0 | GGUF, MLX |
| REDCELL-26B-A4B-OSINT-Cyber-APEX | Gemma-4-26B-A4B | 25,23B | OSINT y ciberinteligencia | No especificada | GGUF |
| Gemma-4-26B-A4B (base) | - | 25,23B | General | Apache 2.0 | Safetensors, GGUF |

El modelo base Gemma-4-26B-A4B es la referencia principal; CyberStag y REDCELL son fine-tunings especializados sobre la misma arquitectura, orientados a dominios complementarios dentro de la seguridad (defensiva vs. inteligencia). No se dispone de benchmarks comparativos publicados entre ellos.

## Limitaciones y advertencias

- Modelo exclusivamente de texto: no procesa entradas multimodales, lo que limita su uso en analisis de imagenes o audio.
- Idiomas principales: entrenado principalmente en ingles y japones; el rendimiento en otros idiomas puede ser inferior.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inventada, especialmente en escenarios de seguridad donde los detalles exactos son criticos. Se recomienda verificacion humana de las salidas.
- Sesgos potenciales: el dataset de entrenamiento es confidencial, por lo que no se puede auditar la presencia de sesgos en el dominio de seguridad.
- Uso restringido: el autor prohibe explicitamente el uso para acceso no autorizado, generacion de exploits o ciberdelincuencia. Solo se permite uso educativo, investigacion defensiva y resiliencia de sistemas.
- Latencia aumentada: el razonamiento profundo incrementa el tiempo de generacion, lo que puede ser un inconveniente en aplicaciones de tiempo real.
- Datos de entrenamiento no publicados: la falta de transparencia sobre el dataset dificulta la reproducibilidad y la evaluacion independiente.
- Sin soporte de tool calling documentado: puede limitar su integracion en pipelines agénticos que requieran interaccion con APIs externas.

## Enlaces

- Modelo GGUF Q8_0: https://huggingface.co/deer-sec/CyberStag-26B-A4B-v1-Q8_0.gguf
- Modelo MLX optiq8: https://huggingface.co/deer-sec/CyberStag-26B-A4B-v1-optiq8
- Modelo base Gemma-4-26B-A4B: https://huggingface.co/google/gemma-4-26b-a4b
- Modelo similar REDCELL: https://huggingface.co/terrorswift/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF
