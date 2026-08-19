# hotdogs/Qwen3.8-27B-abliterated-cyber-preview

## Resumen

Qwen3.8-27B-Abliterated-Cyber-Preview es un modelo de seguridad ofensiva desarrollado por el usuario hotdogs, que combina un merge LoRA sobre la base abliterada de Qwen3.8-27B. El objetivo es dotar al modelo de una vía fiable de emisión de llamadas a herramientas estructuradas en escenarios de pentesting, manteniendo intactas las capacidades generales del modelo base. Se publica como vista previa para investigación de seguridad autorizada, ejercicios de red team y estudio del uso de herramientas por parte de LLMs.

El modelo cuenta con 27.356 millones de parámetros, arquitectura híbrida qwen3_5 (atención completa más atención lineal GDN) con 64 capas, y preserva la cabeza MTP (Multi-Token Prediction) para decodificación especulativa. El merge se realizó a escala 1.0 con un LoRA de rango 32 y alpha 64, entrenado sobre un dataset de 8.400 filas con 22 herramientas de pentesting. La licencia es Apache-2.0 y soporta inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 híbrida: full-attention + GDN linear-attention, 64 capas, hidden size 5.120, GQA (24 query heads, 4 KV heads) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | Todos (modelo denso, no MoE) |
| Longitud de contexto | 8.192 (contexto de entrenamiento del LoRA) |
| Tipos de cuantizacion | BF16 nativo; GGUF bf16 (54,6 GB); AWQ W4A16 disponible para el modelo base |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (1.199 tensores), GGUF |

## Arquitectura y entrenamiento

El modelo parte de `hotdogs/Qwen3.8-27B-abliterated` (λ = 1.2), una versión sin entrenamiento de Qwen3.8-27B con las capas de rechazo eliminadas. Sobre esta base se entrena un LoRA con r=32, alpha=64, dropout=0, contexto 8.192, LR 1e-4 con decaimiento coseno, precisión BF16 (requerida por la arquitectura GDN híbrida) y 2 épocas, con un total de 233M de parámetros entrenables (0,85 %). Los módulos objetivo incluyen los estándar q/k/v/o/gate/up/down más los específicos de GDN: in_proj_qkv, out_proj, in_proj_z, a y b.

El dataset `hotdogs/cyber-sft-agent-qwen38` contiene 8.400 filas (7.140 train, 840 valid, 420 test) con 30 % de llamadas a herramientas, 30 % de conversaciones multi-turno, 22 herramientas de pentesting (nmap, sqlmap, metasploit, hydra, crackmapexec, linpeas, wpscan, whatweb, ffuf, gobuster, entre otras) y 1.995 contextos IP únicos. El LoRA se fusiona con `merge_and_unload()` a escala 1.0 (equivalente a alpha/r = 2.0), y los 15 tensores MTP (849 MB) se copian de vuelta desde la base porque la fusión los elimina. El formato de llamada a herramienta sigue el esquema nativo Qwen3.5 `<tool_call>/<function>/<parameter>`.

## Capacidades

- Emisión de llamadas a herramientas estructuradas en formato XML Qwen3.5 (`<tool_call><function=...><parameter=...>`), con selección correcta de la herramienta real en 6/6 escenarios de pentesting probados.
- Soporte de 22 herramientas de seguridad ofensiva: nmap, sqlmap, metasploit, hydra, crackmapexec, linpeas, wpscan, whatweb, ffuf, gobuster, smbclient, masscan, entre otras.
- Capacidades generales de QA, matemáticas y código preservadas respecto a la base (7/7 en la evaluación propia del autor).
- Decodificación especulativa autónoma mediante la cabeza MTP preservada, con tasa de aceptación de borradores de 0,77 (51/66).
- Conversación multi-turno y etiquetas de pensamiento (think-tags) balanceadas en el entrenamiento.
- Multilingüe: inglés y chino.
- Sin capas de rechazo (abliterated): el modelo no se niega a responder peticiones de seguridad ofensiva.

## Casos de uso

- Pentesting autorizado de infraestructuras propias: el modelo puede recibir un escenario de reconocimiento y emitir directamente la llamada a nmap, masscan o ffuf con los parámetros correctos, integrándose en flujos de automatización de pruebas de penetración.
- Ejercicios de red team: permite generar secuencias de explotación y enumeración con selección de herramienta adecuada (sqlmap para inyección SQL, wpscan para WordPress, smbclient para SMB), reduciendo el tiempo de preparación manual.
- Automatización de reconocimiento pasivo y activo: dado un rango de IPs, el modelo estructura llamadas a whatweb, gobuster y nmap de forma consistente, facilitando pipelines de descubrimiento de servicios.
- Investigación académica sobre tool use en LLMs: el modelo sirve como caso de estudio de cómo un merge LoRA puede redirigir el comportamiento de un modelo abliterado hacia llamadas a herramientas estructuradas sin degradar capacidades generales (KL de 0,041 en prompts generales).
- Evaluación de decodificación especulativa con MTP: la cabeza MTP preservada permite medir el rendimiento de self-speculative decoding en arquitecturas híbridas GDN, con una tasa de aceptación documentada de 0,77.
- Desarrollo de agentes de seguridad conversacionales: el modelo puede integrarse en asistentes de ciberseguridad que necesiten combinar diálogo multi-turno con invocación de herramientas externas, gracias a su formato de llamada nativo y su soporte de chat template.

## Benchmarks y rendimiento

El autor publica resultados de su propia pipeline de evaluación, comparando la base sin LoRA con el modelo fusionado a escala 1.0:

| Metrica | Base (sin LoRA) | Modelo fusionado (escala 1.0) |
|---|---|---|
| Formato de llamada a herramienta (6 prompts de pentesting) | 0/6 (0 %) | 6/6 (100 %) |
| Seleccion correcta de herramienta real (6 prompts) | 0/6 (0 %) | 6/6 (100 %) |
| Capacidad general (7 prompts QA/mates/codigo) | 6/7 (86 %) | 7/7 (100 %) |
| Divergencia KL (base ‖ fusionado), prompts generales | — | 0,041 |
| Divergencia KL (base ‖ fusionado), prompts de herramientas | — | 0,808 |
| Tasa de aceptacion de borradores MTP | — | 0,77 (51/66) |

Barrido de escala (llama.cpp `--lora-scaled`, temperatura 0):

| Escala | Formato tool-call (6) | Herramienta correcta (6) | Capacidad base (7) |
|---:|---:|---:|---:|
| Baseline (sin LoRA) | 0/6 | 0/6 | 6/7 |
| 0,25 | 1/6 | 0/6 | 7/7 |
| 0,5 | 6/6 | 2/6 | 7/7 |
| 0,75 | 6/6 | 4/6 | 7/7 |
| 1,0 | 6/6 | 6/6 | 7/7 |
| 1,5 | 6/6 | 6/6 | 7/7 |

Comprobacion de sobreajuste: loss de validacion 0,480 frente a loss de entrenamiento 0,384 (gap de 0,095, por debajo del umbral de 0,15), lo que indica generalizacion. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55 GB solo para pesos, mas cache KV y activaciones; se recomienda una GPU con 80 GB (A100, H100) o distribucion en varias GPUs.
- GGUF bf16: 54,6 GB en disco; puede servirse con llama.cpp usando `--spec-type draft-mtp` para decodificacion especulativa.
- Cuantizacion AWQ W4A16 (disponible para el modelo base abliterado): reduce los pesos a unos 14-15 GB, permitiendo inferencia en 2x RTX 3090 (24 GB cada una) segun el proyecto de Todd Wolven.
- No cabe en una GPU consumer de 24 GB en BF16; con cuantizacion AWQ o GGUF de 4 bits podria ejecutarse en una RTX 4090 o 3090, aunque no se han publicado cifras de latencia para esta variante concreta.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, FriendliAI (endpoint compatible), y servidores compatibles con el formato safetensors de transformers.
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Diferencia clave |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27,4B | no especificado | Apache-2.0 | Modelo original sin abliterar ni fine-tuning de seguridad |
| hotdogs/Qwen3.8-27B-abliterated | 27,4B | no especificado | Apache-2.0 | Version abliterada sin capas de rechazo, sin capacidad de tool-calling |
| hotdogs/Qwen3.8-27B-abliterated-cyber-preview | 27,4B | 8.192 | Apache-2.0 | Anade tool-calling estructurado para 22 herramientas de pentesting |

La comparativa se limita a la cadena de modelos de la que deriva esta variante; no se dispone de datos de otros modelos de seguridad ofensiva comparables en la informacion disponible.

## Limitaciones y advertencias

- Es una vista previa (preview): el LoRA se entreno sobre un dataset agéntico mixto y no ha sido validado en produccion ni en entornos reales de pentesting.
- Uso restringido: el autor lo publica exclusivamente para investigacion de seguridad autorizada, ejercicios de red team y estudio de tool use en LLMs. Solo debe usarse contra sistemas propios o con permiso explicito. El usuario es responsable del cumplimiento de las leyes aplicables.
- Riesgo de uso malintencionado: al ser un modelo abliterado sin rechazo, puede generar contenido de seguridad ofensiva sin restricciones; esto supone un riesgo de doble uso.
- Sesgos y alucinaciones: en escalas por debajo de 1.0 el modelo alucina herramientas inexistentes (web_fetch, wp_recon); por encima de 2.0 degrada la calidad de los parametros (por ejemplo, puertos malformados). La escala 1.0 mitiga estos problemas pero no los elimina en escenarios no cubiertos por el dataset.
- Limitaciones de idioma: solo se certifican ingles y chino; no hay garantias de calidad en otros idiomas.
- Contexto limitado a 8.192 tokens en el entrenamiento del LoRA; escenarios que requieran contextos mas largos pueden degradar el rendimiento de las llamadas a herramientas.
- La divergencia KL en prompts de herramientas (0,808) indica un redireccionamiento intencionado del comportamiento, pero tambien implica que las respuestas de seguridad pueden desviarse significativamente de la base en escenarios no vistos.
- El modelo hereda la licencia Apache-2.0 de la base, pero el uso comercial de capacidades de seguridad ofensiva puede estar sujeto a regulaciones locales de ciberseguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-cyber-preview
- Modelo base abliterado: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/hotdogs/cyber-sft-agent-qwen38
- Vista del arbol de archivos del modelo base: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated/tree/main
- Ficha tecnica del modelo base en hfviewer: https://hfviewer.com/hotdogs/Qwen3.8-27B-abliterated
- Endpoint de inferencia FriendliAI: https://friendli.ai/models/hotdogs/Qwen3.8-27B-abliterated
- Cuantizacion AWQ del modelo base (Todd Wolven): https://toddwolven.com/projects/qwen38-awq-quantization
