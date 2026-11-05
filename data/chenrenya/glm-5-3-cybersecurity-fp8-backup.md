# chenrenya/GLM-5.3-CYBERSECURITY-FP8-backup

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una modificación de pesos del modelo GLM-5.3 de Zhipu AI (zai-org), publicada por el usuario chenrenya bajo el paraguas del colectivo dealignai. Se trata de un derivado de la cuantización FP8 de JANGQ-AI, sobre el que se ha aplicado una técnica de "abliteration" orientada específicamente a eliminar las negativas de seguridad en el dominio de la ciberseguridad ofensiva: desarrollo de exploits, red-team, ingeniería inversa, evasión, análisis de malware y ataques a credenciales. No es un modelo de propósito general descensurado, sino un ajuste de pesos dirigido a un dominio técnico concreto.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 753 329 940 480 parámetros totales, 78 capas, arquitectura `glm_moe_dsa` (atención dispersa tipo DeepSeek, DSA) y modalidad exclusivamente textual. La cuantización FP8 permite aprovechar los tensor cores FP8 nativos de las GPU Hopper (H100/H200). El repositorio ocupa 755,7 GB en formato safetensors.

Su relevancia actual es doble: por un lado, demuestra que las técnicas de modificación de pesos pueden sortear las salvaguardas de modelos de frontera de gran tamaño sin necesidad de fine-tuning, LoRA ni hooks en tiempo de ejecución; por otro, plantea un caso de estudio sobre los límites de las políticas de uso y la trazabilidad de derivados de modelos abiertos. La licencia declarada es MIT, lo que en la práctica elimina restricciones de uso comercial sobre el derivado, aunque el modelo base pueda tener condiciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (transformer MoE con atención dispersa DSA), 78 capas, solo texto |
| Parámetros totales | 753 329 940 480 |
| Parámetros activos | no disponible |
| Longitud de contexto | 131 072 tokens verificados en TP8 sobre 8× H200; el modelo base soporta hasta 1M según referencias del autor, pero el despliegue con decode-context-parallel está cerrado en vLLM para esta arquitectura |
| Tipos de cuantización | FP8 (checkpoint nativo FP8); no se documentan otras variantes en este repositorio |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 78 capas y atención dispersa DSA (DeepSeek Sparse Attention), identificado en los tags como `glm_moe_dsa`. La cuantización FP8 afecta a los pesos en formato de punto flotante de 8 bits, manteniendo los expertos enrutados en FP8 sin cambios y editando únicamente los escritores de residuales en bf16. Esto preserva la velocidad nativa de los tensor cores FP8 en Hopper (H100/H200) frente a una ejecución en bf16.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base GLM-5.3. La modificación aplicada por el autor es una alteración directa de pesos ("abliteration"), sin fine-tuning, sin LoRA, sin hooks en tiempo de ejecución y sin trucos de prompt. El resultado es un checkpoint que se carga con vLLM estándar y funciona sin modificaciones en el runtime. El modelo incluye un cabezal de decodificación especulativa MTP (multi-token prediction), aunque el autor reporta que no es funcional en vLLM estándar y que solo funciona en un fork específico (B12X sparse-MLA) con `--draft-attention-backend B12X_MLA_SPARSE`, donde aporta un +48 % de decodificación en prompts de código. También incorpora un modo de razonamiento (`reasoning_effort`) que solo honra los valores `"low"` y `"high"`; cualquier otro valor cae a `max`.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de hasta 131 072 tokens verificados en despliegue TP8.
- Razonamiento explícito en modo `thinking` mediante el parámetro `reasoning_effort` (solo `low` y `high`; el resto cae a `max`), con el texto de razonamiento expuesto en `message.reasoning`.
- Soporte de tool calling y function calling mediante `--tool-call-parser glm47` y `--enable-auto-tool-choice` en vLLM.
- Capacidad de agentes y razonamiento multi-paso, aunque el autor recomienda `reasoning_effort="low"` en bucles de herramientas para evitar el agotamiento del presupuesto de tokens dentro de `<think>`.
- Multilingüismo en diez idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Capacidades específicas de dominio: desarrollo de exploits, red-team, ingeniería inversa, evasión, análisis de malware, ataques a credenciales y phishing, con negativas reducidas en estas categorías.
- Sin capacidades de visión ni audio: el modelo es exclusivamente textual.
- La reproducción literal de material con copyright mantiene negativas suaves en esta variante.

## Casos de uso

- Red-team autorizado y pruebas de penetración: el modelo genera cadenas de explotación, payloads y procedimientos de escalada de privilegios sin las negativas típicas de los modelos alineados, lo que agiliza ejercicios de seguridad ofensiva con alcance contractual definido.
- Análisis de malware y ingeniería inversa: puede describir el comportamiento de muestras, identificar indicadores de compromiso y proponer rutas de análisis estático y dinámico, aprovechando su contexto de 131K tokens para volcar trazas largas.
- Desarrollo de herramientas de detección y respuesta (EDR/XDR): genera reglas de detección, firmas YARA y lógica de correlación de eventos a partir de descripciones de técnicas MITRE ATT&CK.
- Formación y concienciación en seguridad: produce escenarios de phishing simulados y material didáctico de ataque y defensa, con la advertencia de que el contenido generado debe revisarse antes de su uso.
- Automatización de pipelines de CI/CD de seguridad: con tool calling y `reasoning_effort="low"` puede integrarse en flujos que invocan escáneres, SAST/DAST y sistemas de ticketing, manteniendo el presupuesto de tokens bajo control.
- Investigación en alineación y evaluación de riesgos: sirve como caso de estudio de un modelo de frontera con salvaguardas eliminadas por modificación de pesos, útil para medir la robustez de los clasificadores de seguridad y de las políticas de uso.
- Asistencia a equipos SOC en triaje de alertas: con contexto largo puede resumir cadenas de eventos, correlacionar logs y proponer hipótesis de incidente, siempre bajo supervisión humana.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son de MMLU en modo logit (probabilidad sobre los tokens A/B/C/D, sin generación) y de comportamiento de cumplimiento en HarmBench-320.

| Benchmark | Base | CRACK Cybersecurity FP8 | Δ |
|---|---|---|---|
| MMLU (1026 preguntas, modo logit) | 85,58 %¹ | 86,65 % (889/1026) | +1,07 pp |

¹ Línea base de GLM-5.3 regular en bf16 antes de la cuantización; la línea base directa sobre FP8 está pendiente de confirmación según el autor.

Comportamiento de cumplimiento en HarmBench-320 (240 comportamientos sin copyright, greedy, tres niveles de esfuerzo de razonamiento):

| Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|
| off | 196 (81,7 %) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84,2 %) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80,0 %) | 3 | 3 | 0 | 0 | 40 |

Sobre el conjunto completo de 320 comportamientos (incluyendo 80 de copyright), el cumplimiento directo baja al 63,4–69,7 % y las negativas suaves suben al 15,9–18,1 %, concentradas en su mayoría en la categoría de copyright. No se han publicado resultados de MMLU-Pro, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint FP8 ocupa 755,7 GB en disco, por lo que la inferencia requiere al menos 8 GPU de 80 GB (H100/H200) en tensor parallel de 8 para alojar los pesos y el KV cache.
- GPU recomendadas: 8× H100 80 GB o 8× H200 80 GB para el perfil TP8 documentado; el autor cita también 8× DGX Spark GB10 como entorno probado en campo.
- No cabe en GPU de consumo: un modelo de 753B en FP8 excede con holgura cualquier RTX 4090 (24 GB), RTX 5090 o similar. No se documenta ninguna cuantización de menor precisión (GGUF, AWQ, GPTQ) en este repositorio.
- Opciones de despliegue: vLLM es el runtime de referencia, con la configuración `--tensor-parallel-size 8 --gpu-memory-utilization 0.90 --enforce-eager --disable-custom-all-reduce --enable-prefix-caching --max-num-seqs 24 --max-model-len 131072 --reasoning-parser glm45 --tool-call-parser glm47 --enable-auto-tool-choice`. `--enforce-eager` es obligatorio para la ruta de atención dispersa bajo concurrencia. No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas. El autor reporta un +48 % de decodificación con MTP en el fork B12X sparse-MLA sobre prompts de código, y un techo práctico de ~131K tokens de contexto con MTP y ~160K sin MTP en TP8 sobre H200. El decode-context-parallel para alcanzar 1M de contexto está cerrado en vLLM para `glm_moe_dsa` por incompatibilidad entre el `k_cache` replicado del indexador DSA y el KV MLA fragmentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-CYBERSECURITY-FP8 (este) | 753B (MoE) | 131K verificado | MIT | Ciberseguridad ofensiva, sin negativas | HuggingFace, safetensors FP8 |
| zai-org/GLM-5.3 (base) | 753B (MoE) | hasta 1M según referencias | no disponible en la información | Propósito general alineado | HuggingFace |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753B (MoE) | no disponible | no disponible en la información | Descensurado general | HuggingFace |
| JANGQ-AI/GLM-5.3-FP8 | 753B (MoE) | no disponible | no disponible en la información | Cuantización FP8 del base | HuggingFace |

No se dispone de datos de benchmarks comparativos frente a otros modelos de ciberseguridad ofensiva (por ejemplo, derivados de Llama o Qwen) en la información proporcionada.

## Limitaciones y advertencias

- El modelo elimina deliberadamente las negativas de seguridad en dominios de ciberseguridad ofensiva; su uso para actividades no autorizadas puede infringir legislación penal y de ciberseguridad en múltiples jurisdicciones.
- Aunque la licencia declarada es MIT, el modelo base GLM-5.3 puede estar sujeto a condiciones adicionales de Zhipu AI; la licencia del derivado no exime de las obligaciones sobre el modelo original.
- El modo de razonamiento no se puede desactivar: cualquier valor distinto de `"low"` cae a `max`, y en FP8 con `high`/`max` el modelo puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta (finish=`length`). En bucles de agente se recomienda `"low"` y `max_tokens ≥ 8000` si se usa `high`.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`; los clientes que esperen el segundo campo no lo encontrarán.
- La decodificación especulativa MTP no funciona en vLLM estándar; requiere un fork específico y no implementa `SupportsPP`, por lo que no es compatible con pipeline parallelism.
- El contexto máximo práctico en TP8 sobre H200 es de ~131K tokens con MTP y ~160K sin MTP; el objetivo de 1M tokens no es alcanzable hoy con decode-context-parallel en vLLM para esta arquitectura.
- Riesgo de alucinación en contenido técnico de seguridad: las cadenas de explotación, payloads y procedimientos generados deben validarse en entornos controlados antes de su uso.
- Sesgos heredados del modelo base no documentados en la información disponible; el autor no publica evaluaciones de sesgo demográfico ni de toxicidad general.
- El modelo es solo textual y no soporta visión ni audio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de terceros sobre los resultados declarados.
- El contenido generado con fines de red-team debe enmarcarse en un alcance contractual y legal explícito; el modelo no incorpora mecanismos de control de autorización.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/chenrenya/GLM-5.3-CYBERSECURITY-FP8-backup
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 de referencia: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante descensurada general del mismo colectivo: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusión sobre notas de runtime en DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del colectivo dealignai: https://huggingface.co/dealignai
- Twitter del colectivo: https://twitter.com/dealignai
- Perfil del probador de campo: https://huggingface.co/0xMagnus
