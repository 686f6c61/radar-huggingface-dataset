# getachewgetu/AmLegal_Gemma-Inst-Adapter

## Resumen

AmLegal_Gemma-Inst es un adaptador de tipo rsLoRA (Rank-Stabilized LoRA) publicado por Getachew Getu que especializa el modelo base `google/gemma-3-4b-it` en respuesta a preguntas legales en amárico sobre decisiones de la División de Casación del Tribunal Supremo Federal de Etiopía. El repositorio contiene únicamente los pesos del adaptador (0,6 GB), no el modelo completo, por lo que requiere cargar el modelo base de Google para su uso. El identificador del repositorio es `getachewgetu/AmLegal_Gemma-Inst-Adapter`, aunque la model card hace referencia internamente a `getachewgetu/AmLegal_Gemma-Inst`.

El modelo aborda un problema concreto: los asistentes legales genéricos alucinan, mezclan legislación extranjera y citan mal las fuentes cuando operan sobre jurisprudencia etíope en amárico. El adaptador se entrena con enmascaramiento de pérdida solo en la respuesta (completion-only loss masking) y condicionamiento negativo con distractores, técnicas orientadas a mejorar la fundamentación en el contexto recuperado (grounding) y la precisión de las citas. Está pensado para integrarse en pipelines de generación aumentada por recuperación (RAG) sobre corpus de casación.

La relevancia actual reside en su nicho: es uno de los pocos recursos abiertos para IA legal en amárico, un idioma de bajos recursos, y reporta métricas de evaluación sobre decisiones no vistas del tribunal. Su licencia es la Gemma, con las restricciones de uso que esta implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador rsLoRA sobre transformer decoder-only (Gemma 3) |
| Parametros totales | No disponible (adaptador de 0,6 GB; el modelo base google/gemma-3-4b-it tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Gemma 3 4B-IT) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Amárico (am) |
| Licencia | Gemma |
| Formato de pesos | safetensors (adaptador LoRA; requiere el modelo base en bfloat16 o cuantizado) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-4b-it`, un transformer decoder-only de 4.000 millones de parámetros con capacidad multimodal en su versión base (aunque esta especialización se centra en texto). La adaptación emplea rsLoRA con rango r=64, alpha=64 y escalado α/√r, una variante de LoRA que estabiliza el entrenamiento a rangos altos. Se usa enmascaramiento de pérdida solo en los tokens de completación, de modo que el modelo aprende a responder y no a reproducir el contexto de entrada.

El dataset es propio (`custom-ethiopian-cassation-qa`), construido a partir de decisiones de la División de Casación del Tribunal Supremo Federal de Etiopía. La model card menciona condicionamiento negativo con distractores, es decir, entrenamiento con documentos irrelevantes en el contexto para que el modelo aprenda a no atribuir información a fuentes ajenas. No se especifican el número de tokens de entrenamiento, la composición exacta del corpus ni si hubo fases de RLHF o DPO; estos datos figuran como no disponibles.

## Capacidades

- Generación de respuestas legales en amárico fundamentadas exclusivamente en el contexto de casación proporcionado.
- Respuesta a preguntas legales (legal QA) con citas a las decisiones recuperadas.
- Integración en pipelines RAG: el prompt de ejemplo espera un bloque de contexto con identificadores de expediente (por ejemplo, «ቅጽ 15 መዝገብ ቁጥር 80202») y una pregunta del usuario.
- Resistencia a distractores: según la model card, no se observó confusión con documentos irrelevantes en la evaluación.
- Reducción de contaminación con derecho extranjero (métrica reportada de 0,03 %).
- Formato conversacional con tokens de turno de Gemma (`<start_of_turn>user` / `<start_of_turn>model`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Asistencia a abogados en Etiopía: consulta sobre precedentes de casación introduciendo el texto de la decisión como contexto y obteniendo un resumen con la ratio decidendi y las citas correspondientes; el adaptador está entrenado para ceñirse al contexto y citar expedientes.
- Sistemas RAG de jurisprudencia: indexación de decisiones del Tribunal Supremo Federal y generación de respuestas con recuperación previa; las métricas de citation recall (88,07 %) y precision (92,02 %) lo hacen adecuado para flujos donde la trazabilidad de la fuente es obligatoria.
- Formación jurídica: generación de explicaciones en amárico sobre doctrina contenida en sentencias de casación, con menor riesgo de mezclar legislación de otros países gracias al bajo índice de contaminación foránea reportado.
- Investigación académica en PLN de bajos recursos: punto de partida para experimentos de adaptación LoRA en amárico legal, con dataset y métricas documentadas para comparación.
- Redacción de borradores de memorandos internos: a partir de un conjunto de decisiones recuperadas, el modelo produce un texto estructurado en amárico que el jurista revisa y completa.
- Atención al ciudadano en servicios legales: respuestas preliminares sobre criterios de casación en amárico, siempre con derivación a profesional y con el contexto de las sentencias como base; requiere validación humana por el riesgo de alucinación.
- Evaluación de calidad de recuperación: el modelo puede servir como juez de fundamentación al comprobar si una respuesta se apoya en el contexto recuperado, dado su entrenamiento con distractores.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre decisiones de casación no vistas:

| Metrica | Gemma-3-4B base | Qwen-2.5-7B FT | AmLegal_Gemma-Inst |
|---|---|---|---|
| ROUGE-1 (F1) | 29,68 % | 38,40 % | 49,66 % |
| ROUGE-2 (F1) | 19,58 % | 27,10 % | 34,94 % |
| ROUGE-L (F1) | 29,68 % | 36,59 % | 49,66 % |
| SacreBLEU | 8,80 | 28,29 | 23,47 |
| chrF | 19,27 | No disponible | 38,95 |
| BERTScore F1 | 58,40 % | No disponible | 91,30 % |
| Evidence Grounding | 84,00 % | 78,00 % | 92,00 % |
| Citation Recall | 68,94 % | 15,31 % | 88,07 % |
| Citation Precision | 88,46 % | 23,21 % | 92,02 % |
| Citation F1 | 77,49 % | 18,45 % | 90,00 % |
| Foreign Contamination | 7,49 % | No disponible | 0,03 % |
| Distractor Misattribution | No disponible | No disponible | 0,00 % |
| Answer Completeness (1-3) | 2,14 | No disponible | 2,88 |

Puntuaciones cualitativas con LLM como juez (escala 1-10): faithfulness 9,43; relevance 9,20; consistency 9,17; coherence 9,00; clarity 8,90; accuracy 8,53; media global 8,77. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador pesa 0,6 GB; el modelo base `google/gemma-3-4b-it` en bfloat16 requiere aproximadamente 8 GB de VRAM, más overhead de activaciones y caché KV.
- Cabe en GPU de consumo: RTX 4090 (24 GB), RTX 4080 (16 GB) y, con cuantización del modelo base a 4 bits, en GPUs de 8-12 GB como RTX 3060/4060.
- Para despliegue en servidor: A100 40/80 GB, H100 o L40S, con margen amplio para lotes grandes y contexto largo.
- Opciones de despliegue: transformers (carga directa del adaptador con PEFT), vLLM y TGI si se fusiona el adaptador con el modelo base; llama.cpp/Ollama requieren exportar a GGUF tras la fusión.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AmLegal_Gemma-Inst | 4B (base) + adaptador rsLoRA | No disponible | QA legal en amárico sobre casación etíope | Gemma | HuggingFace (adaptador) |
| Gemma-3-4B-IT (base) | 4B | No disponible | Propósito general, multilingüe | Gemma | HuggingFace |
| Qwen-2.5-7B FT (referencia de la model card) | 7B | No disponible | Ajuste fino legal comparativo | No disponible | No disponible |
| Alternativas legales en amárico | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita a los modelos citados en la propia model card; no se dispone de información sobre otros adaptadores legales en amárico comparables.

## Limitaciones y advertencias

- Ámbito restringido: entrenado solo sobre decisiones de la División de Casación del Tribunal Supremo Federal de Etiopía; no cubre legislación, códigos ni jurisprudencia de tribunales inferiores.
- Idioma único: solo amárico; no se documenta soporte para inglés, oromo, tigriña ni otras lenguas de Etiopía.
- Riesgo de alucinación: aunque las métricas de grounding son altas, el modelo puede generar citas o contenidos no presentes en el contexto; requiere validación humana en cualquier uso legal.
- No es asesoramiento jurídico: las respuestas no sustituyen la revisión de un abogado cualificado.
- Datos de entrenamiento no auditables: el dataset es propio y no se detalla su composición, tamaño ni proceso de anotación, lo que dificulta evaluar sesgos.
- Sesgos potenciales: derivados de la jurisprudencia seleccionada y de los sesgos del modelo base Gemma 3; no se han publicado análisis de sesgo.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos de la licencia Gemma antes de un despliegue en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente de las métricas reportadas.
- La model card usa el identificador `getachewgetu/AmLegal_Gemma-Inst`, mientras que el repositorio real es `getachewgetu/AmLegal_Gemma-Inst-Adapter`; conviene verificar la ruta al cargar el adaptador.
- El prompt de ejemplo está en amárico y asume un formato concreto de contexto y pregunta; desviarse de ese formato puede degradar la calidad de la respuesta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/getachewgetu/AmLegal_Gemma-Inst-Adapter
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Licencia Gemma: https://ai.google.dev/gemma/terms
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
