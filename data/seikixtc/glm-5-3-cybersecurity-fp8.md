# seikixtc/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una modificación de pesos ("crack") del modelo GLM-5.3 de Z.ai (zai-org), publicada por el usuario seikixtc bajo la marca dealignai. Se trata de un derivado del cuantizado FP8 JANGQ-AI/GLM-5.3-FP8, que a su vez proviene del GLM-5.3 original de 753.329.940.480 parámetros totales con arquitectura glm_moe_dsa (mezcla de expertos con atención dispersa tipo DeepSeek). El modelo es de tipo texto únicamente, tiene 78 capas y conserva los expertos FP8 enrutados sin modificar; solo se han editado los escritores residuales en bf16 para reducir los rechazos en dominios de ciberseguridad ofensiva.

La relevancia del modelo es acotada y muy específica: no es un "uncensor" generalista, sino un ajuste orientado a contenido de seguridad ofensiva, red team, desarrollo de exploits, ingeniería inversa, evasión, phishing, ataques a credenciales y análisis de malware. En otras categorías (armas, química, biología, acoso, desinformación) mantiene en gran medida los rechazos, aunque a veces los envuelve en un marco "educativo". La reproducción literal de material con copyright sigue produciendo rechazos suaves.

Con 34 descargas y 0 likes en el momento de la consulta, es un modelo de nicho, con licencia MIT, pensado para despliegue en infraestructura Hopper (H100/H200) mediante vLLM y tensor parallelism de 8. Su atractivo técnico reside en la velocidad nativa FP8 y en la preservación de capacidades medidas con MMLU-logit (86,65 % frente a 85,58 % del base), aunque con limitaciones operativas importantes documentadas por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (mezcla de expertos con atención dispersa tipo DeepSeek), 78 capas, solo texto |
| Parámetros totales | 753.329.940.480 |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.072 tokens verificados en 8× H200 con max-num-seqs 24; techo práctico ~131K con MTP y ~160K sin MTP en TP8 H200; contexto de 1M no operativo en vLLM actual |
| Tipos de cuantización | FP8 (expertos enrutados en FP8, escritores residuales en bf16) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repo: 755,7 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura glm_moe_dsa del GLM-5.3 de Z.ai: un transformer de mezcla de expertos con atención dispersa (DeepSeek-sparse attention), 78 capas y 753.329.940.480 parámetros totales, en variante solo texto. La base inmediata es JANGQ-AI/GLM-5.3-FP8, un cuantizado FP8 del modelo original zai-org/GLM-5.3, donde los expertos enrutados se mantienen en FP8 y solo los escritores residuales están en bf16. Según el autor, la modificación de este derivado es una edición genuina de pesos: no hay fine-tuning, ni LoRA, ni hooks en tiempo de ejecución, ni trucos de prompt. Solo se editan los escritores residuales en bf16, lo que preserva los expertos FP8 enrutados y permite velocidad nativa de tensor cores FP8 en Hopper (H100/H200).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en el modelo base. Tampoco se detalla el proceso concreto de "abliteración" aplicado más allá de la edición de pesos residuales. La innovación técnica destacable es la combinación de FP8 nativo con atención dispersa y la posibilidad de decodificación especulativa MTP (multi-token prediction), aunque esta última no funciona en vLLM estándar y solo se reporta operativa en el fork B12X sparse-MLA de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE`, con una mejora de decodificación del 48 % en prompts de código.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (`<think>`), controlable mediante `reasoning_effort` con valores `"low"` y `"high"`; cualquier otro valor cae a `max` y no es posible desactivar el razonamiento.
- Contenido técnico de ciberseguridad ofensiva: red team, desarrollo de exploits, ingeniería inversa, evasión, phishing, ataques a credenciales y análisis de malware, con rechazos reducidos en estas categorías.
- Tool calling y function calling, con parser `glm47` y `--enable-auto-tool-choice` en vLLM.
- Soporte de agentes y bucles multi-paso con herramientas, aunque en FP8 se recomienda `reasoning_effort="low"` para evitar agotar el presupuesto de `max_tokens` dentro del bloque de pensamiento.
- Capacidades multilingües en en, zh, ru, sr, hi, fr, es, ar, ko y ja.
- Sin capacidades de visión ni audio: el modelo es solo texto.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`.

## Casos de uso

- Red teaming autorizado: el modelo puede generar hipótesis de ataque, cadenas de explotación y planes de prueba para ejercicios de seguridad contratados, gracias a la reducción específica de rechazos en seguridad ofensiva.
- Desarrollo de exploits en laboratorio: útil para analizar vulnerabilidades y redactar pruebas de concepto en entornos controlados, con contexto de hasta 131K tokens para manejar código y trazas extensas.
- Ingeniería inversa de binarios y malware: puede asistir en la descompilación guiada, identificación de rutinas sospechosas y explicación de flujos de ejecución, al estar ajustado para análisis de malware.
- Análisis de evasión y detección: permite razonar sobre técnicas de evasión y sobre cómo endurecer detecciones, útil para equipos defensivos que necesitan anticipar tácticas adversarias.
- Simulación de phishing y concienciación: genera borradores realistas de correos de phishing para programas de formación, con la advertencia de que su uso debe limitarse a entornos autorizados.
- Automatización de auditorías con agentes: integrado en vLLM con tool calling y `reasoning_effort="low"`, puede encadenar consultas a herramientas de escaneo y resumir hallazgos en un bucle multi-paso.
- Asistencia técnica en seguridad con contexto largo: con 131K tokens puede procesar informes, logs y documentación extensa para responder preguntas técnicas de un equipo de operaciones.

## Benchmarks y rendimiento

| Benchmark | Base | CRACK Cybersecurity FP8 | Δ |
|---|---|---|---|
| MMLU (overall, 1026 preguntas, logit-mode) | 85,58 %¹ | 86,65 % (889/1026) | +1,07 pp |

¹ Línea base previa de GLM-5.3 regular en bf16 pre-cuantización; la línea base directa del FP8 está pendiente de confirmación según el autor.

Comportamiento de cumplimiento en HarmBench-320 (greedy, tres superficies de `reasoning_effort`):

| Superficie | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | UNK |
|---|---:|---:|---:|---:|---:|---:|
| off (240 comportamientos sin copyright) | 196 (81,7 %) | 4 | 2 | 1 | 0 | 37 |
| low (240 sin copyright) | 202 (84,2 %) | 4 | 8 | 0 | 1 | 25 |
| max (240 sin copyright) | 192 (80,0 %) | 3 | 3 | 0 | 0 | 40 |

En el conjunto completo de 320 comportamientos (incluye 80 de copyright), el cumplimiento directo baja al 63,4–69,7 % y los rechazos suaves suben a 51–58, concentrados en el bloque de copyright (aproximadamente el 60–68 % de esa categoría produce rechazo suave).

## Requisitos de hardware

- VRAM estimada: el repo ocupa 755,7 GB en safetensors; en FP8 se requiere un despliegue multi-GPU. El perfil probado es TP8 sobre 8× H200 con `--gpu-memory-utilization 0.90`.
- GPU recomendadas: H100 y H200 (tensor cores FP8 nativos). El autor reporta pruebas de campo en 8× DGX Spark GB10 por parte de @0xMagnus.
- No cabe en GPU de consumo: 753.329.940.480 parámetros en FP8 exceden con holgura la VRAM de una RTX 4090 o similar.
- Opciones de despliegue: vLLM con `--tensor-parallel-size 8`, `--enforce-eager` obligatorio para la ruta de atención dispersa bajo concurrencia, `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24`, `--max-model-len 131072`, `--reasoning-parser glm45`, `--tool-call-parser glm47` y `--enable-auto-tool-choice`. El MTP especulativo debe dejarse desactivado en vLLM estándar.
- Latencia y throughput: no se publican cifras absolutas; el autor reporta +48 % de decodificación en prompts de código con el fork B12X sparse-MLA y MTP activo. El contexto de 1M mediante decode-context-parallel está cerrado en glm_moe_dsa en vLLM por incompatibilidad entre el índice DSA y el KV MLA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-CYBERSECURITY-FP8 | 753.329.940.480 | 131K verificado en TP8 H200 | Ciberseguridad ofensiva, rechazos reducidos | MIT | HuggingFace, 34 descargas |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753.329.940.480 (base GLM-5.3) | no disponible | Uncensor generalista | no disponible en la información | HuggingFace |
| zai-org/GLM-5.3 | 753.329.940.480 | no disponible | Modelo base generalista | no disponible en la información | HuggingFace |
| JANGQ-AI/GLM-5.3-FP8 | 753.329.940.480 | no disponible | Cuantizado FP8 del base | no disponible en la información | HuggingFace |

## Limitaciones y advertencias

- El ajuste es específico de ciberseguridad: en categorías ajenas (armas, química, biología, acoso, desinformación) el modelo suele cumplir con un envoltorio "educativo", pero no es un uncensor universal.
- La reproducción literal de material con copyright sigue produciendo rechazos suaves en esta variante.
- `reasoning_effort` solo acepta `"low"` y `"high"`; cualquier otro valor, incluido `off` sin comillas en YAML (que se interpreta como booleano `false`), cae a `max`. No hay forma de desactivar el razonamiento.
- En FP8, con `high` o `max` el modelo puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta (finish=`length`); se recomienda `max_tokens ≥ 8000` si se usa esa configuración.
- MTP no funciona en vLLM estándar; solo en el fork B12X sparse-MLA, y el draft MTP no implementa `SupportsPP`.
- El contexto de 1M vía decode-context-parallel no está operativo en glm_moe_dsa en vLLM; el techo práctico es ~131K con MTP y ~160K sin MTP en TP8 H200.
- Riesgo elevado de alucinación en contenido técnico ofensivo y de uso indebido: el modelo está diseñado para reducir rechazos en dominios sensibles, por lo que requiere controles de acceso y uso exclusivo en entornos autorizados.
- Licencia MIT: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado y del cumplimiento normativo en su jurisdicción.
- Sesgos conocidos: no disponibles en la información proporcionada.
- El modelo es solo texto; no admite visión ni audio.

## Enlaces

- HuggingFace: https://huggingface.co/seikixtc/GLM-5.3-CYBERSECURITY-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantizado FP8 de referencia: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Modelo hermano uncensor generalista: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusión de pruebas en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del autor: https://huggingface.co/seikixtc
- Twitter del autor: https://twitter.com/dealignai
