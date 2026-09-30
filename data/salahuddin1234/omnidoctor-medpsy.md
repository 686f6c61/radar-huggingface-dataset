# Salahuddin1234/omnidoctor-MedPsy

## Resumen

Omnidoctor-MedPsy es un ajuste fino (finetune) derivado de Qwen3-4B-Thinking-2507, publicado por el usuario Salahuddin1234 bajo licencia Apache 2.0. Se trata de un modelo de lenguaje causal, solo texto, orientado al dominio médico y clínico y pensado para despliegue en el borde (on-device, edge). El repositorio reutiliza la model card de MedPsy-4B, el modelo médico de Tether AI Research (familia QVAC) sobre el que parece apoyarse, por lo que la información técnica disponible describe ese linaje más que el finetune concreto.

El modelo base declarado es Qwen3-4B-Thinking-2507, un transformer decoder-only con modo de razonamiento, del que este finetune hereda la arquitectura y el tokenizador. El repositorio contiene 4.411.424.256 parámetros en formato safetensors (8,8 GB), lo que confirma un tamaño de aproximadamente 4B parámetros, coherente con la familia MedPsy-4B (que incluye variantes GGUF y una versión de 1.7B).

Su relevancia radica en la combinación de tamano reducido y especializacion clinica: la familia MedPsy afirma superar a modelos casi 7 veces mayores en benchmarks medicos, con una eficiencia de tokens de 3,2x, lo que la hace candidata para inferencia local en GPU de consumo o incluso en dispositivos moviles dentro de un ecosistema de privacidad (los datos del paciente no salen del dispositivo). El repositorio concreto que nos ocupa no aporta tarjeta propia ni documentación especifica del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (heredada de Qwen3) |
| Parametros totales | 4.411.424.256 (aprox. 4,4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-4B-Thinking-2507 esta documentado por Qwen con contexto largo, pero no se confirma en este repositorio) |
| Tipos de cuantizacion | El modelo base MedPsy-4B tiene variantes GGUF publicadas; los tipos concretos (Q4_K_M, Q8_0, etc.) no estan especificados en la informacion disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible para el modelo base MedPsy-4B |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3, un transformer causal decoder-only solo texto. El modelo base Qwen3-4B-Thinking-2507 incorpora un modo de razonamiento (thinking), de modo que el finetune hereda esa capacidad de generar cadenas de pensamiento antes de responder. No se dispone de detalles sobre el ajuste concreto realizado por Salahuddin1234: no se documentan en la informacion proporcionada ni el numero de tokens de entrenamiento ni la composicion del dataset ni si hubo RLHF o DPO en esta derivacion especifica.

Si nos remitimos al modelo del que toma la model card, MedPsy-4B, la descripcion indica un post-entrenamiento en varias etapas (supervised fine-tuning mas reinforcement learning) sobre datos medicos curados a partir de Qwen3-4B-Thinking-2507. La familia MedPsy forma parte de la plataforma QVAC (Tether), un ecosistema de IA local, e incluye QVAC Fabric para ajuste fino. La innovacion destacable de esa familia es la eficiencia de razonamiento: produce respuestas medicas en aproximadamente 909 tokens frente a los aproximadamente 2.953 de Qwen3-4B-Thinking, un factor de 3,2x. El ajuste "omnidoctor" parece vincularse al trabajo OmniDoctor sobre aprendizaje continuo (lifelong learning) para enfermedades emergentes, aunque la informacion disponible no detalla como se aplica aqui.

## Capacidades

- Generacion de texto en ingles orientada a preguntas y respuestas medicas.
- Razonamiento clinico paso a paso, heredado del modo thinking de Qwen3.
- Resolucion de preguntas de tipo examen medico (USMLE, MedMCQA, PubMedQA, AfriMedQA) segun los benchmarks de la familia MedPsy.
- Eficiencia de tokens en respuestas medicas (aproximadamente 909 tokens por respuesta en el modelo base), lo que reduce latencia y coste.
- Inferencia on-device mediante el QVAC SDK, con datos que permanecen en el dispositivo.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no documentado especificamente, aunque el modo thinking del base habilita razonamiento por pasos.
- Vision, audio u otras modalidades: no soportadas (modelo solo texto).

## Casos de uso

- Triaje medico en el dispositivo: el modelo puede responder consultas de salud cotidianas directamente en un telefono o portatil sin enviar datos a la nube, gracias a su tamano de 4B y a la integracion con el QVAC SDK.
- Asistente de anamnesis clinica: apoyo a profesionales para estructurar sintomas y razonar diagnosticos diferenciales en ingles, con cadenas de pensamiento que muestran el razonamiento.
- Educacion medica y preparacion de examenes: generacion de explicaciones y respuestas razonadas sobre preguntas tipo USMLE, MedMCQA o PubMedQA, util para estudiantes de medicina.
- Soporte a la documentacion clinica: redaccion y resumen de notas clinicas en ingles en entornos con requisitos de privacidad, al ejecutarse localmente.
- Investigacion sobre enfermedades emergentes: el repositorio enlaza con el marco OmniDoctor de aprendizaje continuo, orientado a escenarios clinicos incrementales y nuevas enfermedades.
- Despliegue en entornos con conectividad limitada: clinicas rurales o zonas sin red estable pueden ejecutar el modelo en hardware local cuantizado.
- Prototipado de aplicaciones de salud: al ser Apache 2.0 y estar disponible en safetensors, permite integrarse en pipelines con transformers, vLLM o llama.cpp para experimentacion.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base MedPsy-4B segun la model card reutilizada en este repositorio. No se confirman resultados especificos del finetune omnidoctor-MedPsy.

| Benchmark | MedPsy-4B | MedGemma-27B-text-it | Qwen3-4B-Thinking-2507 | MedGemma-1.5-4B-it |
|---|---|---|---|---|
| Media (closed-ended) | 70,54 | 69,95 | 63,10 | 51,20 |
| MMLU (Health) | 89,70 | 90,48 | 85,92 | 67,69 |
| AfriMedQA | 71,50 | 73,07 | 64,12 | 54,38 |
| MMLU-Pro Health | 70,45 | 72,94 | 67,73 | 47,31 |
| MedMCQA | 72,15 | 72,77 | 61,78 | 50,08 |
| MedQA (USMLE) | 84,39 | 83,29 | 70,91 | 64,39 |
| MedXpertQA | 30,61 | 25,18 | 16,69 | 15,80 |
| PubMedQA | 75,00 | 71,93 | 74,53 | 58,73 |
| HealthBench | 74,00 | 65,00 | no disponible | no disponible |
| HealthBench Hard | 58,00 | 42,00 | no disponible | no disponible |

Notas: MedPsy-4B declara una eficiencia de 3,2x en tokens (aproximadamente 909 tokens frente a aproximadamente 2.953 de Qwen3-4B-Thinking). Los datos de HealthBench y HealthBench Hard solo estan publicados para MedPsy-4B y MedGemma-27B-text-it en la informacion disponible. La tabla completa de la model card aparece truncada, por lo que pueden existir mas benchmarks no recogidos aqui.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 9-10 GB (el repositorio pesa 8,8 GB solo en pesos, mas overhead de activaciones y cache KV).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4,5-5,5 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): aproximadamente 2,5-3,5 GB.
- GPU de datacenter: A100, H100, L40S sin problemas para FP16.
- GPU de consumo: cabe en RTX 3090, RTX 4090, RTX 4080 y tarjetas con 8 GB o mas en cuantizacion; en 4 bits puede ejecutarse en GPUs de 4-6 GB.
- Dispositivos moviles y edge: la familia MedPsy esta disenada explicitamente para ejecucion on-device a traves del QVAC SDK.
- Opciones de despliegue: transformers (formato del repositorio), llama.cpp / Ollama mediante las variantes GGUF del modelo base, vLLM y TGI (el repositorio incluye la etiqueta tether-ai y es compatible con endpoints de text-generation-inference).
- Latencia y throughput: no disponibles de forma especifica; la model card solo indica la eficiencia de tokens (3,2x) como proxy de reduccion de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento medico (media cerrada) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omnidoctor-MedPsy (este) | 4,4B | no disponible | no disponible para el finetune | Apache 2.0 | HuggingFace, safetensors |
| MedPsy-4B (base declarado) | 4B | no disponible | 70,54 | Apache 2.0 | HuggingFace, safetensors y GGUF |
| MedGemma-27B-text-it | 27B | no disponible | 69,95 | Licencia Gemma | HuggingFace |
| MedGemma-1.5-4B-it | 4B | no disponible | 51,20 | Licencia Gemma | HuggingFace |
| Qwen3-4B-Thinking-2507 | 4B | no disponible | 63,10 | Apache 2.0 | HuggingFace |

Observacion: el modelo base de esta familia iguala o supera a uno de 27B en la media de benchmarks cerrados y en HealthBench, con una licencia Apache 2.0 mas permisiva que la licencia Gemma para uso comercial.

## Limitaciones y advertencias

- Solo ingles: el repositorio declara unicamente el idioma en, por lo que no hay soporte multilingue confirmado.
- Solo texto: no procesa imagenes ni audio, a diferencia de MedGemma, lo que limita su uso en radiologia o diagnostico por imagen.
- Riesgo de alucinacion: como cualquier LLM, puede generar afirmaciones medicas incorrectas con aparente seguridad; no debe usarse como sustituto del juicio clinico profesional.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; los datos de entrenamiento medico pueden reflejar sesgos poblacionales o de subrepresentacion.
- Validacion clinica: no consta validacion prospectiva en entornos reales; los benchmarks son de tipo examen y no equivalen a rendimiento clinico.
- Ambiguedad del repositorio: la model card reutilizada corresponde a MedPsy-4B (Tether/QVAC), no a este finetune concreto; no hay documentacion propia del ajuste omnidoctor ni resultados verificables de esta derivacion.
- Licencia de la familia base: aunque el repositorio declara Apache 2.0, la model card enlaza a una LICENSE de qvac/MedPsy-4B; conviene verificar los terminos exactos antes de uso comercial.
- Uso clinico: no apto como dispositivo medico ni para diagnostico o tratamiento sin supervision humana y sin cumplir la normativa sanitaria aplicable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Salahuddin1234/omnidoctor-MedPsy
- Space OmniDoctor (autor): https://huggingface.co/spaces/Salahuddin1234/omnidoctor
- Modelo base MedPsy-4B: https://huggingface.co/qvac/MedPsy-4B
- Modelo base Qwen3-4B-Thinking-2507: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Blog de MedPsy (Tether): https://qvac.tether.io/blog/meet-medpsy-a-private-medical-ai-small-enough-for-your-phone
- Informe tecnico de MedPsy: https://huggingface.co/blog/qvac/medpsy
- Coleccion MedPsy en HuggingFace: https://huggingface.co/collections/qvac/medpsy
- QVAC SDK: https://qvac.tether.io/dev/sdk/
- QVAC Fabric (ajuste fino local): https://huggingface.co/blog/qvac/fabric-llm-finetune
- arXiv: 2505.17952 (https://arxiv.org/abs/2505.17952)
- Articulo OmniDoctor (ACM DL): https://dl.acm.org/doi/10.1145/3746027.3755745
- GitHub del autor: https://github.com/salahuddin1234
