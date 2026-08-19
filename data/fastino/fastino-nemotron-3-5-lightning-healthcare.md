# fastino/Fastino-Nemotron-3.5-Lightning-Healthcare

## Resumen

Fastino-Nemotron-3.5-Lightning-Healthcare es un modelo de lenguaje especializado en el dominio sanitario y biomédico, desarrollado por Fastino Labs en colaboración con NVIDIA. Se basa en el checkpoint base NVIDIA Nemotron 3.5 Lightning (publicado el 29 de julio de 2026) y ha sido post-entrenado mediante un adaptador LoRA combinado (denominado E17b) que integra tareas de conversación clínica, razonamiento médico, extracción de información biomédica y uso de herramientas para administración clínica. El repositorio contiene un checkpoint fusionado listo para usar, por lo que no es necesario adjuntar ningún LoRA adicional.

El modelo es una mezcla de expertos (MoE) con aproximadamente 31.500 millones de parámetros totales y solo 3.000 millones activos por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. Está pensado para aplicaciones como el resumen de notas clínicas, la detección de errores médicos, la extracción de conceptos biomédicos y la asistencia a agentes médicos con capacidad de llamada a herramientas. Su licencia Apache 2.0 facilita su adopción tanto en investigación como en entornos comerciales, aunque el idioma soportado es únicamente inglés.

La relevancia de este modelo radica en su enfoque específico para el sector salud, con un proceso de post-entrenamiento gestionado de forma autónoma por un agente de fine-tuning de Fastino, que ha logrado mejoras sustanciales en benchmarks como HealthBench Pro (+5,8 puntos porcentuales) y BC5CDR (+24,6 puntos) respecto al modelo base. Aunque aún no está validado clínicamente, representa una opción práctica para desarrolladores que necesitan un LLM open source orientado a tareas médicas y administrativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en NVIDIA Nemotron 3.5 Lightning |
| Parametros totales | 31.577.937.344 (según safetensors) |
| Parametros activos | 3.000 millones (aprox.) |
| Longitud de contexto | No especificada (en el ejemplo de uso se configura 4096, pero no es el límite máximo) |
| Tipos de cuantizacion | BF16 (pesos publicados) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura MoE de NVIDIA Nemotron 3.5 Lightning, un transformer con activación por expertos que reduce el coste de inferencia al activar solo una fracción de los parámetros por token. El checkpoint base fue liberado el 29 de julio de 2026 y el post-entrenamiento se realizó mediante un adaptador LoRA de rango 64, entrenado durante dos épocas sobre un conjunto de 72.358 ejemplos deduplicados. El proceso incluyó una mezcla equilibrada de datos de instrucción sanitaria general, conversaciones de estilo médico, razonamiento biomédico, cálculo clínico, detección y corrección de errores médicos, resumen de diálogos clínicos, extracción de conceptos biomédicos y trayectorias de uso de herramientas para administración clínica y agentes médicos.

El entrenamiento se llevó a cabo con un learning rate de 1,5e-4, batch size de 32 y sin empaquetado de secuencias. El agente de fine-tuning de Fastino (descrito en arXiv:2604.09791) gestionó de forma autónoma la construcción de conjuntos de evaluación, la curación de datos, la exploración de mezclas de entrenamiento e hiperparámetros, la recuperación de experimentos fallidos y la selección final del checkpoint. No se menciona el uso de RLHF o DPO; el proceso se basa en fine-tuning supervisado con LoRA.

## Capacidades

- Generación de texto y conversación en dominio clínico: mantiene diálogos de estilo médico, responde preguntas biomédicas y redacta notas clínicas.
- Razonamiento médico: realiza cálculos clínicos (p. ej., dosis, escalas) y detecta o corrige errores en historiales médicos.
- Extracción de información biomédica: identifica conceptos, enfermedades, productos químicos y entidades clínicas en textos (evaluado en MedMentions y BC5CDR).
- Resumen de notas clínicas: genera resúmenes concisos y precisos a partir de historiales completos, sin añadir información no presente.
- Uso de herramientas y agentes: soporta trayectorias de tool-use para administración clínica (p. ej., navegación por portales de salud) y tareas de agentes médicos (evaluado en HealthAdminBench y MedAgent).
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Resumen de notas clínicas en hospitales: el modelo puede condensar historiales extensos en viñetas estructuradas, facilitando la revisión rápida por parte de profesionales. Su capacidad para no añadir información no presente reduce el riesgo de errores en la documentación.
- Detección de errores médicos en registros electrónicos: gracias a su entrenamiento en MEDEC, puede señalar discrepancias en medicación, dosis o diagnósticos, actuando como un segundo par de ojos en auditorías de calidad.
- Extracción de entidades biomédicas para investigación: convierte textos clínicos no estructurados en datos estructurados (enfermedades, fármacos, síntomas) para alimentar bases de datos o pipelines de análisis, con mejoras notables en BC5CDR y MedMentions.
- Asistente de administración clínica con tool-use: integrado en un agente, puede interactuar con sistemas de gestión hospitalaria (citas, historiales, formularios) mediante llamadas a herramientas, reduciendo carga administrativa.
- Soporte a la decisión clínica en entornos de baja complejidad: responde preguntas biomédicas de referencia (PubMedQA) y realiza cálculos clínicos básicos, útil como apoyo para personal no especializado.
- Generación de documentación para ensayos clínicos: resume diálogos entre pacientes y médicos, extrae eventos adversos o genera informes de seguimiento, aprovechando su capacidad de resumen y extracción.

## Benchmarks y rendimiento

Los resultados presentados provienen de la model card del autor y utilizan el mismo checkpoint base, prompts, decodificación y evaluador para cada fila.

### Benchmarks in-domain

| Benchmark | Alcance de evaluación | Julio 29 base | Fastino-Healthcare | Cambio |
| --- | --- | ---: | ---: | ---: |
| HealthBench Pro | ciego, n=180 | 26,83% | 32,64% | +5,80 pp |
| HealthAdminBench | ciego | 25,67% | 29,95% | +4,28 pp |
| MedAgent public v1/v2, Overall SR | ciego, n=150 | 36,00% | 40,00% | +4,00 pp |
| HealthBench Core | ciego, n=700 | 49,67% | 56,21% | +6,54 pp |
| PubMedQA | emparejado, n=500 | 59,00% | 65,00% | +6,00 pp |
| MedCalc | emparejado, n=275 | 49,09% | 54,18% | +5,09 pp |
| MEDEC, flag accuracy | emparejado, n=574 | 53,66% | 64,98% | +11,32 pp |
| MEDEC, sentence accuracy | emparejado, n=574 | 48,08% | 62,89% | +14,81 pp |
| MedMentions ST21pv | emparejado, n=878 | 19,74% | 40,30% | +20,55 pp |
| BC5CDR | emparejado, n=500 | 47,92% | 72,51% | +24,59 pp |

HealthAdminBench usó Task Description + Portal Guidance con modo de observación de árbol de accesibilidad. MedAgent reporta Overall Success Rate. MEDEC flag y sentence accuracy se reportan por separado.

### Transferencia a benchmarks no vistos

| Benchmark | Alcance de evaluación | Julio 29 base | Fastino-Healthcare | Cambio |
| --- | --- | ---: | ---: | ---: |
| EkaCare | transferencia, n=1.066 | 12,95% | 32,83% | +19,88 pp |
| BC5CDR a BioRED | transferencia, n=66 | (dato no disponible en la información proporcionada) | | |

Nota: el valor para BC5CDR a BioRED no aparece completo en la información disponible; se indica como no disponible.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 ocupan aproximadamente 66 GB antes de overhead en runtime. Se recomienda una GPU con al menos 80 GB de memoria.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB, o GPUs de 80 GB similares. También es posible usar tensor parallelism en varias GPUs de menor capacidad (p. ej., 2× RTX 4090 de 24 GB cada una, aunque el modelo completo no cabe en una sola).
- Inferencia en consumer GPU: no recomendable para el modelo completo en BF16; se requeriría cuantización (no publicada) o particionado en múltiples GPUs.
- Opciones de despliegue: el quickstart oficial usa vLLM (versión 0.23.0) con `trust_remote_code=True`. También es compatible con Transformers mediante el pipeline de generación de texto. No se mencionan otros runners como llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos específicos. Al ser MoE con 3B activos, el coste por token es menor que un modelo denso de 30B, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos sanitarios en la información proporcionada. La única comparación disponible es con el modelo base NVIDIA Nemotron 3.5 Lightning, que es el mismo checkpoint sin el adaptador de Fastino. Se recomienda evaluar contra alternativas como Meditron-70B, Llama-3-Med42 o BioMistral, pero no se incluyen datos en la documentación.

| Modelo | Parámetros | Contexto | Licencia | Especialización |
| --- | --- | --- | --- | --- |
| Fastino-Nemotron-3.5-Lightning-Healthcare | ~31,5B (MoE, 3B activos) | No especificado | Apache 2.0 | Sanitario, biomédico |
| NVIDIA Nemotron 3.5 Lightning (base) | ~31,5B (MoE, 3B activos) | No especificado | Apache 2.0 | General |
| Otras alternativas (Meditron, BioMistral) | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Idioma: solo inglés; no es adecuado para entornos clínicos en castellano u otros idiomas sin traducción previa.
- Validación clínica: el modelo no ha sido validado clínicamente; no debe usarse como única fuente para decisiones médicas reales sin supervisión profesional.
- Riesgo de alucinación: como cualquier LLM, puede generar información plausible pero incorrecta, especialmente en contextos médicos complejos. Se recomienda verificar siempre las salidas.
- Contexto limitado: no se ha especificado la longitud máxima de contexto; el ejemplo usa 4096 tokens, pero puede ser superior. Para documentos clínicos largos, puede ser necesario truncar o dividir el texto.
- Cuantización: solo se publican pesos BF16; no hay versiones cuantizadas (GGUF, AWQ, etc.), lo que limita su uso en hardware de consumo.
- Dependencia de código remoto: el modelo requiere `trust_remote_code=True` en Transformers y vLLM, lo que implica ejecutar código del repositorio; se debe auditar antes de usar en producción.
- Datos de entrenamiento: el conjunto de fine-tuning proviene de fuentes diversas; no se detalla la procedencia exacta, por lo que puede haber sesgos en poblaciones o condiciones médicas poco representadas.

## Enlaces

- HuggingFace: https://huggingface.co/fastino/Fastino-Nemotron-3.5-Lightning-Healthcare
- Blog de lanzamiento (Fastino): https://fastino.ai/blog/fastino-nemotron-3-5-lightning-finance-and-healthcare
- Paper arXiv (agente de fine-tuning): https://arxiv.org/abs/2604.09791
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Lightning
- Colaboración Fastino-NVIDIA: https://fastino.ai/nvidia-collaboration
- Sitio de Fastino Labs: https://fastino.ai/
