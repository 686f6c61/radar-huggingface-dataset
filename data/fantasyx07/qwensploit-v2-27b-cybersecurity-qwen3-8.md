# fantasyx07/Qwensploit-V2-27B-CyberSecurity-Qwen3.8

## Resumen

Qwensploit V2 27B es un ajuste fino (fine-tune) de la familia Qwen3.8 orientado a ciberseguridad, publicado por el usuario fantasyx07 sobre el modelo base `xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic`. Con 27.356 millones de parámetros (aproximadamente 27,36 mil millones), el modelo se presenta como un asistente del día a día para profesionales de seguridad ofensiva y defensiva: pentesters, operadores de red team, investigadores de vulnerabilidades y participantes en CTF. La model card lo describe como la segunda iteración de la serie Qwensploit, con un énfasis explícito en la calidad y curaduría del dataset de entrenamiento por encima del volumen.

El modelo está etiquetado con el pipeline `image-text-to-text` y la arquitectura `qwen3_5`, lo que sugiere capacidades multimodales de entrada (imagen y texto), aunque la información disponible no detalla el componente visual ni su resolución o número de tokens de imagen. El contexto declarado tampoco se especifica en los metadatos proporcionados. El entrenamiento se realizó mediante LoRA/PEFT (las etiquetas incluyen `lora`, `peft` y `unsloth`), lo que indica un ajuste eficiente sobre el modelo base en lugar de un preentrenamiento desde cero.

La relevancia de este lanzamiento reside en su enfoque: en lugar de acumular datos sin filtrar, el autor declara haber inspeccionado, limpiado y filtrado manualmente cada fuente del mixture, descartando colecciones masivas de CVEs crudos por considerarlas más adecuadas para RAG que para enseñar razonamiento. El resultado es un modelo especializado que prioriza instrucciones útiles, explicaciones técnicas y razonamiento estructurado de seguridad, con licencia "other" que requiere revisión antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`); multimodal image-text-to-text |
| Parametros totales | 27.356.728.560 (≈27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; se enlazan cuantizaciones externas (GGUF y otras) |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic`, un merge de tres modelos de la familia Qwen3.8, y se ajusta mediante LoRA/PEFT con la herramienta Unsloth, según las etiquetas del repositorio. La arquitectura subyacente es un transformer de la familia Qwen (etiquetada como `qwen3_5`), con pipeline multimodal `image-text-to-text`, lo que implica un codificador visual acoplado a la pila de lenguaje. No se especifican en la información disponible el número de capas, dimensiones ocultas, mecanismo de atención (estándar o lineal) ni detalles del componente de visión.

El entrenamiento combina dos categorías de datos: conocimiento de dominio de ciberseguridad y datos de razonamiento general. Entre las fuentes citadas figuran `PentesterFlow/OffsecCyber` (2.000 muestras de los subconjuntos Elite V2 y HackerOne, orientadas a seguridad web ofensiva y bug bounty), `ChaoticNeutrals/Cybersecurity-ShareGPT`, `Voidreaper2026/cybersec-master-dataset`, `Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset`, `saidutta69/CyberSec-Reasoning-Premium`, `saidutta69/qwen3.8-max-distillation-50k-clean` y `xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x`. El autor declara haber dividido, inspeccionado, limpiado y filtrado manualmente cada dataset antes de incorporarlo, y haber excluido colecciones de CVEs crudos por considerarlas más apropiadas para RAG. No se indican el número total de tokens de entrenamiento, la composición exacta del mixture ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento estructurado aplicado a problemas de seguridad.
- Conocimiento de seguridad ofensiva: pentesting web, análisis de vulnerabilidades, bug bounty y ejercicios de red team.
- Seguridad defensiva: análisis de amenazas, respuesta a incidentes y discusión técnica de contramedidas.
- Codificación segura, revisión de código y depuración con orientación a seguridad.
- Resolución de retos CTF y educación en ciberseguridad.
- Capacidad multimodal de entrada imagen-texto según el pipeline declarado (no se detallan prestaciones concretas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el autor lo describe como asistente de investigación y análisis, no como agente autónomo de pentesting.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- **Auditoría de código en pipelines de CI/CD**: el modelo puede revisar fragmentos de código en busca de patrones inseguros (inyección SQL, XSS, deserialización insegura) y proponer correcciones, integrándose como paso de revisión automatizada previa a la revisión humana.
- **Triaje de vulnerabilidades**: dado un informe de escaneo o un aviso técnico, el modelo ayuda a clasificar severidad, explicar el vector de ataque y priorizar la remediación, aprovechando su entrenamiento en análisis de vulnerabilidades.
- **Asistencia en ejercicios de red team autorizados**: genera hipótesis de ataque, comandos de enumeración y guiones de explotación en entornos controlados, siempre con revisión humana antes de su ejecución.
- **Preparación de CTF**: resuelve retos de categorías web, criptografía básica, forense y reversing, explicando el razonamiento paso a paso para fines educativos.
- **Redacción de documentación de seguridad**: produce políticas, guías de hardening y procedimientos de respuesta a incidentes a partir de requisitos técnicos, con terminología precisa del dominio.
- **Formación y concienciación**: genera escenarios de phishing simulado, preguntas de evaluación y explicaciones de conceptos (OWASP Top 10, MITRE ATT&CK) para programas de formación interna.
- **Análisis de incidentes**: ayuda a interpretar artefactos (logs, salidas de herramientas, indicadores de compromiso) y a estructurar una línea temporal de investigación, apoyándose en su capacidad de razonamiento técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 27,36 B de parámetros, en FP16 se requieren aproximadamente 54-55 GB de VRAM solo para los pesos; en cuantización de 8 bits, unos 27-28 GB; en 4 bits, alrededor de 14-16 GB (estimaciones teóricas, no verificadas por el autor).
- **GPU recomendadas**: A100 80 GB o H100 80 GB para FP16 sin cuantizar; A100 40 GB o L40S 48 GB para 8 bits; RTX 4090 24 GB para cuantizaciones de 4 bits con contexto moderado.
- **Consumer GPU**: sí es viable en RTX 4090 (24 GB) y GPUs equivalentes con cuantización de 4 bits; en GPUs de 16 GB requeriría cuantizaciones más agresivas y contexto reducido.
- **Opciones de despliegue**: transformers (librería declarada), text-generation-inference (etiqueta presente), vLLM y llama.cpp/Ollama a través de las cuantizaciones GGUF publicadas por terceros (el autor enlaza a cuantizaciones externas).
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit V2 27B (este) | ≈27,36 B | no disponible | Ciberseguridad y red team | other | Hugging Face |
| Qwensploit V2 9B | ≈9 B (no confirmado) | no disponible | Ciberseguridad y red team | other | Hugging Face |
| Qwensploit V2 4B | ≈4 B (no confirmado) | no disponible | Ciberseguridad y red team | other | Hugging Face |
| Qwensploit V2 2B | ≈2 B (no confirmado) | no disponible | Ciberseguridad y red team | other | Hugging Face |
| Qwensploit V2 0.8B | ≈0,8 B (no confirmado) | no disponible | Ciberseguridad y red team | other | Hugging Face |

Las variantes de menor tamaño de la misma serie son las alternativas más directas para despliegues con menos recursos. No se dispone de datos de benchmarks ni de comparaciones con otros fine-tunes de ciberseguridad de terceros en la información proporcionada.

## Limitaciones y advertencias

- **Licencia "other"**: no es una licencia estándar permisiva; es imprescindible revisar los términos exactos antes de cualquier uso comercial o redistribución.
- **Sesgos**: el entrenamiento se apoya en datasets de seguridad ofensiva y bug bounty, lo que puede sesgar las respuestas hacia enfoques de ataque y descuidar matices defensivos o de cumplimiento normativo.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede inventar CVEs, comandos, rutas de explotación o referencias técnicas; toda salida debe verificarse contra fuentes primarias.
- **Uso responsable**: el modelo está diseñado para investigación y análisis, no como agente autónomo de pentesting; el autor advierte explícitamente de que comandos, código y recomendaciones deben revisarse antes de usarse en un entorno real.
- **Idioma**: soporte declarado únicamente en inglés; el rendimiento en castellano no está garantizado ni documentado.
- **Contexto**: la longitud de contexto no se especifica en la información disponible, lo que impide planificar casos de uso con documentos largos.
- **Origen del modelo base**: al derivar de un merge "UNCENSORED-heretic", puede presentar una menor resistencia a generar contenido sensible, lo que exige filtros adicionales en producción.
- **Madurez**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación independiente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fantasyx07/Qwensploit-V2-27B-CyberSecurity-Qwen3.8)
- [Modelo base: xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic](https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic)
- [Colección Qwensploit Cybersec](https://huggingface.co/collections/xtools-at/qwensploit-cybersec)
- [Variante 27B (original del autor)](https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8)
- [Variante 9B](https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5)
- [Variante 4B](https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5)
- [Variante 2B](https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5)
- [Variante 0.8B](https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5)
- [Cuantizaciones GGUF y otras](https://huggingface.co/models?other=base_model:quantized:xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8)
- [Dataset PentesterFlow/OffsecCyber](https://huggingface.co/datasets/PentesterFlow/OffsecCyber)
- [Dataset ChaoticNeutrals/Cybersecurity-ShareGPT](https://huggingface.co/datasets/ChaoticNeutrals/Cybersecurity-ShareGPT)
