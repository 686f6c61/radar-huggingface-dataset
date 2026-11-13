# bartowski/xtools-at_Qwensploit-V2-27B-CyberSecurity-Qwen3.8-GGUF

## Resumen

Qwensploit-V2-27B-CyberSecurity-Qwen3.8 es un modelo de lenguaje especializado en ciberseguridad ofensiva (red team, pentesting, investigación de vulnerabilidades y CTF), desarrollado por el usuario xtools-at y cuantizado a GGUF por bartowski. Se construye sobre una base Qwen3.8 de 27.320.697.856 parámetros (unos 27,3B, descritos como 28B en la model card del checkpoint de origen), con ajuste fino mediante LoRA y PEFT sobre un conjunto de datasets de seguridad ofensiva y trazas de razonamiento. La ficha que nos ocupa corresponde exclusivamente a la versión cuantizada en formato GGUF, lista para llama.cpp y otros runners compatibles.

El modelo resuelve un nicho concreto: asistentes de seguridad que necesitan razonamiento multi-paso, análisis de vulnerabilidades, generación de exploits en entornos controlados y soporte a tareas de CTF. Incorpora un modo de razonamiento explícito (bloques `<think>`) con un nivel de esfuerzo configurable ("xhigh" en el prompt de referencia), soporte de tool calling mediante un formato XML propio y decodificación especulativa basada en MTP (multi-token prediction). Además, el pipeline declarado es `image-text-to-text`, lo que indica capacidades multimodales de entrada (texto e imagen) cuando se acompaña del fichero `mmproj`.

La relevancia actual del modelo es doble: por un lado, demuestra el patrón de especialización vertical sobre modelos Qwen recientes mediante LoRA y datasets curados de seguridad; por otro, bartowski publica un espectro completo de cuantizaciones con imatrix (desde bf16 de 54,66 GB hasta Q4_K_M de 17,44 GB), lo que permite desplegarlo desde estaciones de trabajo con una sola GPU consumer hasta servidores multi-GPU. La licencia es "other", no estándar, y el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen3.8, con ajuste fino LoRA/PEFT y soporte de MTP (multi-token prediction) para decodificación especulativa |
| Parametros totales | 27.320.697.856 (27,3B; la model card indica 28B para el checkpoint de origen) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_M (recomendada), y resto de la familia K-quant de llama.cpp; cuantización con imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | other (licencia no estándar; consultar términos del autor) |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el checkpoint base |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen3.8 (etiquetas `qwen3_5`, `qwen3.8`, `qwen3_8`) y se especializa mediante instruction tuning con LoRA y PEFT sobre una mezcla de datasets de ciberseguridad: PentesterFlow/OffsecCyber, ChaoticNeutrals/Cybersecurity-ShareGPT, Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x. Esta combinación mezcla instrucciones de seguridad ofensiva con trazas de razonamiento destiladas, orientadas a reforzar el pensamiento paso a paso en tareas de análisis.

La innovación técnica destacable en la versión GGUF es la decodificación especulativa mediante MTP, que acelera la generación al predecir varios tokens por paso, y el uso de imatrix durante la cuantización para preservar la calidad en los niveles bajos. El prompt de referencia inyecta un nivel de esfuerzo de razonamiento "xhigh" y abre un bloque `<think>` en el turno del asistente, lo que implica un modo de pensamiento explícito previo a la respuesta. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento explícito (bloques `<think>`) y nivel de esfuerzo configurable.
- Especialización en ciberseguridad ofensiva: pentesting, red team, investigación de vulnerabilidades, análisis de seguridad y retos CTF.
- Soporte de tool calling / function calling mediante un formato XML estructurado (`<tool_call>`, `<function=...>`, `<parameter=...>`).
- Capacidades de agente y razonamiento multi-paso orientadas a flujos de análisis y explotación controlada.
- Entrada multimodal: texto e imagen, siempre que se cargue el fichero `mmproj` junto con el GGUF.
- Decodificación especulativa mediante MTP para reducir latencia en inferencia.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Auditorías de seguridad asistidas: el modelo puede analizar fragmentos de código y configuraciones en busca de vulnerabilidades, razonando paso a paso sobre vectores de ataque plausibles gracias a su modo `<think>`.
- Red teaming en entornos controlados: generación de hipótesis de explotación y planes de prueba para laboratorios aislados, con soporte de tool calling para invocar escáneres o scripts.
- Resolución de retos CTF: el razonamiento multi-paso y la especialización en seguridad lo hacen adecuado para descomponer retos de reversing, criptografía o web y proponer cadenas de solución.
- Análisis de trazas y logs de seguridad: con contexto suficiente (no declarado) puede correlacionar eventos y proponer hipótesis de incidente en flujos SOC asistidos.
- Formación y concienciación: generación de escenarios de ataque simulados y explicaciones didácticas para programas de entrenamiento interno en seguridad.
- Automatización de pipelines de pentesting: integración como agente que decide qué herramienta invocar mediante function calling dentro de un flujo orquestado, con MTP para reducir latencia en bucles de agente.
- Investigación de vulnerabilidades: apoyo en la redacción de informes técnicos y reproducción de PoCs en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada): Q4_K_M ~17,44 GB de pesos, por lo que se necesitan en torno a 20-22 GB de VRAM para contexto moderado; Q5_K_M ~20,92 GB; Q6_K ~23,86 GB; Q8_0 ~29,12 GB; bf16 ~54,66 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto ajustado; A100 40 GB o H100 para Q6/Q8 con contexto amplio; configuraciones multi-GPU para bf16.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) con Q4_K_M o Q5_K_M; en GPUs de 16 GB solo con cuantizaciones por debajo de Q4_K_M y contexto reducido, no incluidas en la lista de ficheros publicada.
- Opciones de despliegue: llama.cpp (release b12180 usada para la cuantización), Ollama y otros runners compatibles con GGUF; el checkpoint base soporta transformers y text-generation-inference. Para multimodal hay que cargar el fichero `mmproj` junto al GGUF.
- Latencia y throughput: no disponibles. La decodificación especulativa MTP está pensada para mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit-V2-27B-CyberSecurity-Qwen3.8 (GGUF) | 27,3B | no disponible | Ciberseguridad ofensiva | other | GGUF en HF |
| Checkpoint base xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8 | 28B (según model card) | no disponible | Ciberseguridad ofensiva | other | safetensors en HF |
| Modelos Qwen3.8 genéricos | no disponible | no disponible | Propósito general | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El modelo está especializado en seguridad ofensiva: puede generar contenido de doble uso (explotación, malware, técnicas de ataque) y debe desplegarse con salvaguardas y en entornos autorizados.
- Riesgo de alucinación en detalles técnicos (versiones, CVE, rutas de explotación) inherente a los modelos de lenguaje; requiere validación humana.
- Solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no declarada: planificar el despliegue sin asumir una ventana concreta.
- Licencia "other" no estándar: es imprescindible revisar los términos del autor antes de cualquier uso comercial.
- El repositorio ocupa 446,8 GB por incluir todas las cuantizaciones; descargar solo el fichero necesario.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación muy limitado, sin evidencia comunitaria de calidad.
- La cuantización a Q4 y niveles inferiores puede degradar el razonamiento fino; para tareas críticas se recomienda Q6_K o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/xtools-at_Qwensploit-V2-27B-CyberSecurity-Qwen3.8-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- llama.cpp: https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp usada: https://github.com/ggml-org/llama.cpp/releases/tag/b12180
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
- Dataset ChaoticNeutrals/Cybersecurity-ShareGPT: https://huggingface.co/datasets/ChaoticNeutrals/Cybersecurity-ShareGPT
- Dataset Voidreaper2026/cybersec-master-dataset: https://huggingface.co/datasets/Voidreaper2026/cybersec-master-dataset
- Dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Dataset saidutta69/CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset saidutta69/qwen3.8-max-distillation-50k-clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Dataset xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x
