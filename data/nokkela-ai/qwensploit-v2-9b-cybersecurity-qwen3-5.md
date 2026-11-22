# nokkela-ai/Qwensploit-V2-9B-CyberSecurity-Qwen3.5

## Resumen

Qwensploit V2 9B - Cybersecurity & Red Team es un ajuste fino (fine-tune) de dominio especializado en ciberseguridad, desarrollado por nokkela-ai y publicado en Hugging Face. Se construye sobre el modelo base xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic, que a su vez deriva de la familia Qwen 3.5. El modelo está pensado como asistente técnico para profesionales de seguridad ofensiva y defensiva: pentesters, operadores de red team, investigadores de vulnerabilidades y entusiastas de CTF.

La propuesta principal es concentrar conocimiento de seguridad, razonamiento estructurado y resolución de problemas técnicos en un modelo compacto de 9.409.813.744 parámetros (9,4 mil millones), con un tamaño de repositorio de 19,3 GB en formato safetensors. La segunda iteración de la serie Qwensploit pone el énfasis en la calidad y selección del dato de entrenamiento frente al volumen bruto, tras detectar inconsistencias en la primera versión atribuidas a la mezcla de datos.

El modelo se distribuye con licencia "other" (no especificada en detalle), soporta únicamente inglés y declara el pipeline image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base. Es relevante ahora porque ofrece una alternativa de tamaño medio, desplegable en hardware asequible, para tareas de análisis de seguridad que normalmente requieren modelos mucho mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun tags qwen3_5 / qwen3.5); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existen cuantizaciones de terceros referenciadas (GGUF y otras) via busqueda por base_model:quantized |
| Idiomas soportados | en (ingles) |
| Licencia | other (terminos no detallados) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune por instruction tuning sobre xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic, un merge de la familia Qwen 3.5. La model card menciona el uso de LoRA y PEFT (tags lora, peft) junto con Unsloth como herramienta de entrenamiento, y hace referencia a "mtp" (multi-token prediction) entre sus etiquetas, aunque no se detalla su implementación. No se especifican el número total de tokens de entrenamiento ni la composición exacta de la mezcla más allá de la lista de datasets.

La innovación declarada en V2 es metodológica: cada dataset fue dividido, inspeccionado, limpiado y filtrado manualmente antes de incorporarse. El autor señala que las inconsistencias de V1 se debían en buena parte a la calidad del dato, y que colecciones masivas de registros CVE y referencias de exploits son más adecuadas para RAG que para enseñar razonamiento. La mezcla combina conocimiento de ciberseguridad (PentesterFlow/OffsecCyber con 2.000 muestras de los subconjuntos Elite V2 y HackerOne, ChaoticNeutrals/Cybersecurity-ShareGPT, Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium) con datos de razonamiento general (saidutta69/qwen3.8-max-distillation-50k-clean, xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x). No se detallan cifras de RLHF o DPO.

## Capacidades

- Generación de texto técnico y explicaciones de conceptos de ciberseguridad.
- Razonamiento estructurado orientado a análisis de seguridad (tag reasoning).
- Conocimiento de seguridad ofensiva: pentesting web, análisis de vulnerabilidades y ejemplos orientados a bug bounty.
- Soporte declarado para investigación de vulnerabilidades, triaje y respuesta a incidentes.
- Asistencia en codificación segura, revisión de código y depuración.
- Resolución de retos CTF y educación en seguridad.
- Capacidad multimodal image-text-to-text (heredada del pipeline declarado y del modelo base), aunque no se detalla su alcance.
- No se documenta soporte explícito de tool calling ni de razonamiento multi-paso agéntico; el autor indica que no es un agente autónomo de pentesting.
- Multilingüe: limitado a inglés.

## Casos de uso

- Auditoría de aplicaciones web: el modelo puede analizar fragmentos de código y configuraciones para señalar patrones de vulnerabilidad (inyección, control de acceso roto) y proponer mitigaciones, apoyándose en los subconjuntos de seguridad ofensiva web del dataset OffsecCyber.
- Revisión de código seguro en CI/CD: integrado como paso de análisis, puede generar comentarios de revisión sobre prácticas inseguras y sugerir parches, aunque sus salidas requieren validación humana antes de fusionar.
- Triaje de vulnerabilidades: dado un informe o descripción técnica, el modelo ayuda a clasificar severidad, explicar el vector de ataque y esbozar pasos de reproducción en entornos autorizados.
- Formación y CTF: puede generar explicaciones paso a paso de retos, pistas progresivas y writeups educativos, aprovechando los datos de razonamiento de la mezcla.
- Red team asistido: apoyo en la planificación de ejercicios autorizados, redacción de hipótesis de ataque y documentación de hallazgos, siempre con revisión humana de comandos y recomendaciones.
- Respuesta a incidentes y análisis defensivo: resumen de indicadores, interpretación de trazas y propuestas de contención a partir de descripciones textuales.
- Asistente técnico diario para equipos de seguridad: conversaciones multi-turno sobre configuraciones, herramientas y procedimientos, en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros, en FP16 se requieren aproximadamente 19-20 GB de VRAM; en cuantización de 8 bits, unos 10-11 GB; en 4 bits, unos 6-7 GB (estimaciones por tamaño, no publicadas por el autor).
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, justo para FP16 con contexto corto).
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 ajustado o en cuantizaciones de 8/4 bits en RTX 3090, 4080, 4070 Ti y similares con 12-24 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), Unsloth para fine-tuning; llama.cpp, Ollama y vLLM son viables mediante cuantizaciones de terceros referenciadas en Hugging Face, aunque no están documentadas oficialmente por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit V2 9B | 9,4 B | no disponible | Ciberseguridad / red team | other | Hugging Face |
| Qwensploit V2 27B | no disponible | no disponible | Ciberseguridad / red team | other | Hugging Face (misma serie) |
| Qwensploit V2 4B | no disponible | no disponible | Ciberseguridad / red team | other | Hugging Face (misma serie) |
| Qwen3.5-9B base (heretic merge) | ~9 B | no disponible | Propósito general sin censura | no disponible | Hugging Face |

La comparativa con modelos de seguridad de otros autores no está disponible en la información proporcionada. La serie Qwensploit ofrece variantes de 0,8B, 2B, 4B, 9B y 27B, lo que permite escalar según presupuesto de hardware.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en inglés; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación en detalles técnicos: comandos, rutas de exploits y referencias CVE pueden ser incorrectos y deben verificarse siempre.
- El modelo base es un merge "uncensored/heretic", lo que implica menor alineación de seguridad y mayor probabilidad de generar contenido ofensivo sin filtros; requiere supervisión en producción.
- No es un agente autónomo de pentesting: el autor advierte explícitamente que las salidas deben revisarse antes de usarse en entornos reales.
- Licencia "other" sin términos detallados: es necesario contactar con el autor o revisar el repositorio antes de uso comercial.
- Sin datos publicados de benchmarks, contexto máximo ni cuantizaciones oficiales; el rendimiento real frente a alternativas es desconocido.
- Uso dual: el conocimiento ofensivo puede emplearse de forma maliciosa; debe aplicarse solo en pruebas autorizadas y marcos legales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria prácticamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokkela-ai/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic
- Variante 27B: https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- Variante 9B (original del autor xtools-at): https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Variante 4B: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Variante 2B: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Variante 0.8B: https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Colección Qwensploit: https://huggingface.co/collections/xtools-at/qwensploit-cybersec
- Cuantizaciones de terceros: https://huggingface.co/models?other=base_model:quantized:xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
- Dataset ChaoticNeutrals/Cybersecurity-ShareGPT: https://huggingface.co/datasets/ChaoticNeutrals/Cybersecurity-ShareGPT
- Dataset Voidreaper2026/cybersec-master-dataset: https://huggingface.co/datasets/Voidreaper2026/cybersec-master-dataset
- Dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Dataset saidutta69/CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset saidutta69/qwen3.8-max-distillation-50k-clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Dataset xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x
