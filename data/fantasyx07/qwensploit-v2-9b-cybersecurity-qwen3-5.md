# fantasyx07/Qwensploit-V2-9B-CyberSecurity-Qwen3.5

## Resumen

Qwensploit V2 9B es un ajuste fino (fine-tune) orientado a ciberseguridad construido sobre el modelo base xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic, del que hereda la arquitectura Qwen3.5 y sus aproximadamente 9.400 millones de parámetros. Lo publica el usuario fantasyx07 en Hugging Face, continuando la serie Qwensploit original del perfil xtools-at, y está pensado como asistente tecnico para profesionales de seguridad ofensiva y defensiva: pentesters, equipos de red team, investigadores de vulnerabilidades y participantes en CTF.

El modelo resuelve el problema de disponer de un asistente especializado en dominio de seguridad con un tamano contenido (9B), que puede desplegarse en infraestructura moderada, a diferencia de alternativas de mayor tamano. Segun la model card, la version V2 prioriza la calidad y curacion del dataset de entrenamiento frente al volumen bruto, corrigiendo inconsistencias detectadas en la V1. El modelo se distribuye en formato safetensors, con licencia "other" y soporte declarado unicamente para ingles.

La informacion publica disponible es limitada: no se detallan resultados de benchmarks, no se especifica la longitud de contexto soportada ni los tipos de cuantizacion oficiales, y el modelo registra cero descargas y cero likes en el momento de la consulta. La ficha siguiente refleja exclusivamente los datos verificables de la model card y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag `qwen3_5`) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existen cuantizaciones de terceros enlazadas por el autor |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic |
| Modalidad declarada | image-text-to-text (pipeline) |
| Tamano del repositorio | 19,3 GB |
| Metodo de ajuste | LoRA / PEFT (tags `lora`, `peft`, `unsloth`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune sobre un merge de la familia Qwen3.5, por lo que hereda una arquitectura transformer densa de aproximadamente 9,4 mil millones de parametros. La model card no detalla la configuracion interna (numero de capas, dimensiones, mecanismo de atencion ni si incorpora variantes como atencion lineal o decodificacion especulativa). El tag `mtp` sugiere la presencia de multi-token prediction en la arquitectura base, aunque no se aporta confirmacion tecnica en el texto.

El entrenamiento se realizo mediante LoRA/PEFT con la libreria Unsloth, segun los tags del repositorio. La mezcla de datos combina conocimiento de dominio de ciberseguridad con datos de razonamiento general. Entre las fuentes citadas figuran PentesterFlow/OffsecCyber (subconjuntos Elite V2 y HackerOne, unas 2.000 muestras de seguridad web ofensiva y bug bounty), ChaoticNeutrals/Cybersecurity-ShareGPT, Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x. El autor indica que cada dataset fue dividido, inspeccionado, limpiado y filtrado manualmente antes de incorporarse, y que se evito usar el tamano como sustituto de la calidad. No se especifica el numero total de tokens de entrenamiento, la composicion exacta ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento estructurado orientado a problemas de seguridad.
- Conocimiento de seguridad ofensiva: pentesting web, analisis de vulnerabilidades, ejercicios de red team y bug bounty.
- Seguridad defensiva: analisis de amenazas, respuesta a incidentes y discusion tecnica de contramedidas.
- Revision de codigo seguro, depuracion y analisis de fallos en aplicaciones e infraestructura.
- Razonamiento multi-paso para retos de CTF y educacion en seguridad.
- Capacidad multimodal declarada mediante el pipeline `image-text-to-text`, aunque la model card no detalla el alcance real de vision.
- Conversacion multi-turno (tag `conversational`) e instruccion afinada para seguir indicaciones tecnicas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes autonomos: el autor indica explicitamente que no esta disenado como agente autonomo de pentesting.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Asistente de pentesting autorizado: el modelo puede apoyar en la fase de reconocimiento y explotacion guiada, sugiriendo tecnicas y comandos que el operador revisa antes de ejecutar, gracias a su entrenamiento en subconjuntos ofensivos como OffsecCyber y HackerOne.
- Triaje de vulnerabilidades: analisis y clasificacion de hallazgos de escaneo, con explicaciones tecnicas del impacto y posibles vectores de explotacion, adecuado por su enfasis en razonamiento de seguridad.
- Revision de codigo seguro: integracion en revisiones de pull requests para detectar patrones inseguros, inyecciones o malas practicas, aprovechando su entrenamiento en codigo y depuracion.
- Formacion y CTF: generacion de explicaciones paso a paso para retos de captura de la bandera y material didactico de seguridad, gracias a su orientacion a razonamiento estructurado.
- Respuesta a incidentes: apoyo en la interpretacion de indicadores, analisis de amenazas y redaccion de informes tecnicos de incidentes en entornos defensivos.
- Documentacion tecnica de seguridad: redaccion de informes de pentesting, politicas y guias de hardening a partir de notas del analista, con un modelo de 9B desplegable en infraestructura propia.
- Bug bounty: asistencia en la redaccion de reportes y en la evaluacion de la severidad de hallazgos, apoyandose en los ejemplos de HackerOne incluidos en el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 19 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- Cuantizacion en 8 bits: en torno a 10-11 GB de VRAM, viable en GPUs de 12-16 GB.
- Cuantizacion en 4 bits: en torno a 5-6 GB de VRAM, lo que permite ejecucion en GPUs consumer de 8 GB como la RTX 3060 Ti o la RTX 4060.
- GPUs recomendadas para produccion: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para precision completa o alta concurrencia.
- Cabe en GPU consumer: si, en RTX 4090 (FP16), RTX 3090/4080 (8 bits) y RTX 3060/4060 (4 bits).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama mediante cuantizaciones GGUF de terceros enlazadas por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit V2 9B | ~9,4B | no disponible | Ciberseguridad ofensiva/defensiva | other | Hugging Face, safetensors |
| Qwensploit V2 27B | no disponible (variante mayor de la misma serie) | no disponible | Ciberseguridad | other | Hugging Face |
| Qwensploit V2 4B | no disponible (variante menor) | no disponible | Ciberseguridad | other | Hugging Face |
| Modelo base Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic | ~9,4B | no disponible | General sin censura | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado con otras familias de modelos de ciberseguridad, por lo que la comparativa se limita a variantes de la misma serie y al modelo base.

## Limitaciones y advertencias

- El modelo esta entrenado y declarado unicamente para ingles; su rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion en detalles tecnicos: comandos, rutas de explotacion o referencias a CVE pueden ser plausibles pero incorrectos; el autor exige revision humana antes de su uso en entornos reales.
- No esta disenado como agente autonomo de pentesting; usarlo como tal puede producir acciones destructivas o no autorizadas.
- La licencia "other" no especifica condiciones de uso comercial; es necesario consultar los terminos exactos antes de un despliegue en produccion.
- El modelo base es un merge "uncensored", lo que reduce los filtros de seguridad y aumenta el riesgo de generar contenido ofensivo o danable si no se aplican salvaguardas externas.
- No se publican resultados de benchmarks ni evaluaciones de sesgo, por lo que no hay evidencia cuantitativa de su calidad frente a alternativas.
- El repositorio registra cero descargas y cero likes, y la model card esta incompleta (la tabla de datasets aparece truncada), lo que limita la trazabilidad del entrenamiento.
- El uso del modelo para actividades ofensivas sin autorizacion explicita constituye un riesgo legal; debe restringirse a entornos autorizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fantasyx07/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic
- Variante 27B: https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- Variante 9B (perfil del autor original): https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Variante 4B: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Variante 2B: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Variante 0.8B: https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Coleccion Qwensploit original: https://huggingface.co/collections/xtools-at/qwensploit-cybersec
- Cuantizaciones de terceros: https://huggingface.co/models?other=base_model:quantized:xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
- Dataset ChaoticNeutrals/Cybersecurity-ShareGPT: https://huggingface.co/datasets/ChaoticNeutrals/Cybersecurity-ShareGPT
- Dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
