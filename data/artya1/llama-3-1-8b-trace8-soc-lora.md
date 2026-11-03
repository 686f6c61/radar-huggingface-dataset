# Artya1/Llama-3.1-8B-Trace8-SOC-LoRA

## Resumen

Llama-3.1-8B-Trace8-SOC-LoRA es un adaptador QLoRA publicado por el usuario Artya1 sobre el modelo base `unsloth/Llama-3.1-8B-Instruct-unsloth-bnb-4bit`, es decir, una versión cuantizada en 4 bits de Llama 3.1 8B Instruct de Meta. El adaptador está especializado en la triaje de alertas de un SOC (Security Operations Center) para una plataforma denominada Trace8: recibe telemetría de seguridad en bruto junto con contexto de activos e inteligencia de amenazas, y devuelve un único objeto JSON con un veredicto estructurado.

El modelo resuelve un problema acotado: forzar a un LLM a producir salidas con un esquema JSON fijo y semánticamente alineado con flujos de triaje (veredicto, severidad, confianza, técnicas MITRE ATT&CK, entidades y acciones recomendadas). El autor lo presenta explícitamente como una prueba experimental de pipeline, no como un modelo de calidad: se entrenó con 20 muestras y se evaluó con 3, por lo que sus métricas demuestran que el flujo funciona de extremo a extremo, no que el modelo sea fiable.

La relevancia es, por tanto, metodológica más que operativa. Sirve como ejemplo reproducible de cómo adaptar un Llama 3.1 8B con QLoRA y Unsloth en hardware de consumo (una AMD Radeon RX 9070 XT con ROCm) para una tarea de dominio muy específica y con salida estructurada, y de cómo documentar honestamente las limitaciones de un adaptador de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct) con adaptador LoRA (QLoRA, base en 4 bits) |
| Parametros totales | 8.030 millones en el modelo base; el adaptador LoRA ocupa 0,2 GB en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en entrenamiento (`max_seq_length=4096`); el modelo base Llama 3.1 soporta hasta 128K, pero el adaptador no se ha entrenado para ello |
| Tipos de cuantizacion | Base cargada en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors (bf16). No se publican GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible (la model card no declara idiomas; hereda los del Llama 3.1 base) |
| Licencia | Llama 3.1 Community License Agreement |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`), compatible con PEFT |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 aplicado sobre todas las proyecciones de atención y MLP del Llama 3.1 8B Instruct, con el modelo base cargado en 4 bits (QLoRA). El entrenamiento se realizó con Unsloth sobre una GPU AMD Radeon RX 9070 XT con ROCm 7.2, con un pico de 6,9 GiB de VRAM y una duración de 156 segundos. Se entrenaron 8 épocas (40 pasos de optimizador) con learning rate 2e-4, scheduler lineal, batch size 1 con 4 pasos de acumulación de gradiente, `max_seq_length` de 4096, gradient checkpointing y precisión bf16. Solo se calculó la pérdida sobre la respuesta del asistente.

El conjunto de datos es mínimo: 20 muestras en formato chat (14 maliciosas, 5 benignas y 1 sospechosa), de las cuales 3 se reservaron para evaluación. La pérdida pasó de 1,64 al inicio a 0,26 al final, un valor que el propio autor señala como indicio probable de sobreajuste dado el tamaño del dataset. No se documenta RLHF, DPO ni ninguna innovación arquitectónica adicional; se trata de un ajuste supervisado clásico con salida estructurada.

## Capacidades

- Generación de texto y razonamiento sobre telemetría de seguridad (logs, alertas, contexto de activos).
- Producción de salida estructurada en un único objeto JSON con esquema fijo: `analysis`, `evidence`, `verdict`, `severity`, `confidence`, `title`, `mitre_attack`, `entities`, `false_positive_considerations`, `recommended_actions`.
- Clasificación de veredicto en tres clases: `malicious`, `suspicious`, `benign`.
- Asignación de severidad en cinco niveles: `critical`, `high`, `medium`, `low`, `informational`.
- Extracción de entidades: usuarios, hosts, IPs, procesos, dominios, ficheros y recursos cloud.
- Mapeo a técnicas MITRE ATT&CK (táctica, ID de técnica y nombre) — aunque en la evaluación el adaptador devolvió listas vacías en todos los casos.
- Consideraciones de falso positivo y acciones recomendadas en la propia respuesta.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: no disponible (no se declaran).
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Prototipado de pipelines de triaje SOC: el adaptador permite validar de extremo a extremo la cadena telemetría → LLM → JSON estructurado → sistema de ticketing, usando el `system_prompt.txt` exacto del entrenamiento y el esquema de salida documentado.
- Generación de datasets sintéticos de triaje: al producir respuestas con esquema fijo, se puede usar como generador de borradores que luego revisa un analista humano para construir un corpus mayor de entrenamiento.
- Evaluación de infraestructura de inferencia: sirve como caso de prueba para medir latencia y throughput de un Llama 3.1 8B en 4 bits con Unsloth o `transformers` + PEFT + bitsandbytes en GPUs de consumo.
- Demostración de QLoRA en hardware AMD: el autor documenta el entrenamiento en una RX 9070 XT con ROCm 7.2 y 6,9 GiB de pico, por lo que el adaptador es un ejemplo reproducible de fine-tuning en GPUs no NVIDIA.
- Extracción de entidades de logs: el campo `entities` (usuarios, hosts, IPs, procesos, dominios, ficheros, recursos cloud) puede alimentar un enriquecimiento básico de alertas, siempre con validación humana.
- Formateo de alertas para consumo humano: el campo `title` y `recommended_actions` permiten generar resúmenes legibles de alertas crudas para paneles o notificaciones, como paso previo a la revisión por un analista.
- Investigación sobre salidas estructuradas: útil para estudiar cómo un adaptador pequeño fuerza el cumplimiento de esquema JSON en un modelo base que, sin ajuste, solo lo cumplía en el 66,7 % de los casos según la evaluación del autor.

## Benchmarks y rendimiento

Evaluación del autor sobre un holdout de 3 muestras con decodificación greedy:

| Métrica | Modelo base | Adaptador |
|---|---|---|
| Validez JSON | 0,667 | 1,000 |
| Esquema válido | 0,333 | 1,000 |
| Precisión de veredicto | 0,333 | 0,667 |
| Tasa de falsos positivos (benigno predicho como no benigno) | 1,000 | 0,000 |
| Jaccard de técnicas MITRE | 0,000 | 0,333 |

El propio autor advierte que el 0,333 de Jaccard procede únicamente de la muestra benigna, donde ambas listas están vacías, y que el adaptador devolvió `mitre_attack` vacío en las 3 muestras. También señala que etiquetó como `suspicious` una muestra maliciosa. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 8 GB según el autor (modelo base en 4 bits más el adaptador). El entrenamiento consumió 6,9 GiB de pico en una RX 9070 XT.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM. El autor validó el entrenamiento en AMD Radeon RX 9070 XT con ROCm 7.2; en NVIDIA, una RTX 3060 Ti de 8 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 o H100 son suficientes para inferencia.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más con cuantización de 4 bits del modelo base.
- Opciones de despliegue: Unsloth (`FastLanguageModel.from_pretrained` con `load_in_4bit=True`), o `transformers` (`AutoModelForCausalLM`) + `peft` (`PeftModel.from_pretrained`) + `bitsandbytes`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no se distribuyen pesos GGUF.
- Latencia y throughput: no disponibles. El autor solo reporta el tiempo de entrenamiento (156 segundos para 40 pasos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Trace8-SOC-LoRA | 8B (adaptador LoRA sobre base 4 bits) | 4096 en entrenamiento | Triaje SOC con salida JSON | Llama 3.1 Community | HuggingFace, 0 descargas |
| Llama 3.1 8B Instruct (base) | 8B | 128K | Propósito general, instrucciones | Llama 3.1 Community | Ampliamente disponible |
| Adaptadores SOC públicos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre adaptadores equivalentes de triaje SOC con los que comparar parámetros, contexto o rendimiento. La comparación relevante es contra el modelo base, para el que la evaluación del autor muestra mejoras en validez JSON (0,667 → 1,000), esquema válido (0,333 → 1,000) y tasa de falsos positivos (1,000 → 0,000), con un holdout de solo 3 muestras.

## Limitaciones y advertencias

- Estado experimental explícito: el autor indica que es una prueba de pipeline y que no debe usarse para decisiones reales de triaje.
- Sobreajuste probable: pérdida final de 0,26 sobre 20 muestras de entrenamiento, con solo 3 muestras de evaluación; insuficiente para estimar generalización.
- MITRE ATT&CK no funcional: devolvió listas vacías en las 3 muestras de evaluación; el 0,333 de Jaccard es engañoso.
- Error de clasificación documentado: etiquetó como `suspicious` una muestra maliciosa.
- Sesgos conocidos: no documentados por el autor; al derivar de Llama 3.1 hereda los sesgos del modelo base, no evaluados aquí.
- Riesgo de alucinación: alto en un dominio de seguridad donde las entidades, IPs y técnicas deben ser verificables; el esquema JSON válido no garantiza contenido correcto.
- Limitaciones de contexto: entrenado con `max_seq_length=4096`; no se ha validado su comportamiento con contextos mayores aunque el base soporte 128K.
- Idiomas: no declarados; el `system_prompt.txt` y los datos de entrenamiento están en inglés, por lo que el rendimiento en castellano es desconocido.
- Restricciones de licencia: al ser derivado de Llama 3.1, se rige por la Llama 3.1 Community License, que impone obligaciones de atribución y restricciones de uso (por ejemplo, la cláusula de 700 millones de usuarios mensuales para licencia comercial adicional).
- Dependencia del prompt: el autor exige usar `system_prompt.txt` de forma literal; desviarse de él invalida el comportamiento observado en entrenamiento.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni issues documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Artya1/Llama-3.1-8B-Trace8-SOC-LoRA
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct-unsloth-bnb-4bit
- Llama 3.1 (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community: https://www.llama.com/llama3_1/license/
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- MITRE ATT&CK: https://attack.mitre.org/
