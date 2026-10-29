# pbhappliedsystems/qwen-2.5-32B-instruct-gguf-F16

## Resumen

`pbhappliedsystems/qwen-2.5-32B-instruct-gguf-F16` es una conversión a GGUF en precisión completa (F16) del modelo `Qwen/Qwen2.5-32B-Instruct`, publicada por PBH Applied Systems, LLC. No se trata de un modelo nuevo ni de un ajuste fino: es un artefacto de conversión cuyo propósito declarado es servir como **línea base de referencia** frente a la que se miden las variantes cuantizadas del mismo modelo (principalmente Q4_K_M). El repositorio forma parte de una serie de evaluación de comportamiento (`quant_eval`) orientada a medir la degradación que introduce la cuantización en tareas agénticas, no en perplejidad.

El modelo subyacente es un transformer decoder-only denso de 32.763.876.352 parámetros (32,76 mil millones), lo que lo sitúa en la franja de 32B, con licencia Apache-2.0 y uso comercial permitido según la procedencia registrada por el autor. La ficha declara únicamente inglés y chino como idiomas soportados.

Su relevancia práctica es doble: por un lado, proporciona pesos F16 en formato llama.cpp listos para desplegar con llama.cpp u Ollama sin necesidad de convertir desde safetensors; por otro, documenta con un arnés reproducible (fixtures versionados y DOI en Zenodo) qué familias de tareas agénticas se degradan o se mantienen al comprimir el modelo, un dato poco habitual en el ecosistema GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5 del modelo base); la ficha del repositorio no detalla la arquitectura interna |
| Parametros totales | 32.763.876.352 (32,76 B), dato real de safetensors |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (la ficha no la declara; el modelo base Qwen2.5-32B-Instruct documenta 32.768 tokens en su repositorio upstream) |
| Tipos de cuantizacion | GGUF F16 (este repositorio). El autor publica ademas una variante Q4_K_M en repositorio aparte. No se listan otros niveles en la informacion disponible |
| Idiomas soportados | en, zh (segun metadatos de la model card) |
| Licencia | Apache-2.0; uso comercial `permitted_by_recorded_license` segun el registro del autor |
| Formato de pesos | GGUF (llama.cpp), ficheros divididos; tamano del repositorio 131,1 GB |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es una conversión de formato de `Qwen/Qwen2.5-32B-Instruct` (revision `5ede1c97bbab6ce5cda5812749b4c0bdf79b18dd`) a GGUF en F16, es decir, pesos de 16 bits por parámetro sin pérdida de precisión respecto al original en lo que a representación numérica se refiere. El SHA-256 del fichero evaluado está registrado (`02e264f0273624b39b0650f8c0583c6d04c320c777780ca5be839999912adf3c`), lo que permite verificar la reproducibilidad del artefacto. La ficha no aporta detalles sobre la arquitectura interna del modelo base (número de capas, cabezas, tipo de atención, normalización) ni sobre su proceso de entrenamiento.

Respecto a los datos de entrenamiento, número de tokens, composición del corpus y alineación (RLHF/DPO/SFT) del modelo original, **no disponible** en la información proporcionada. La innovación técnica que sí documenta el repositorio es metodológica: un arnés de evaluación de comportamiento (`quant_eval v7.22.21/v7.22.22`) con ocho familias de tareas agénticas y fixtures congelados (`quant_eval golden oracle fixtures v7.22.22`), diseñado para comparar variantes cuantizadas contra esta línea base F16 usando tests de McNemar con umbral p < 0,05.

## Capacidades

- Generación de texto conversacional multi-turno, con retención de estado entre turnos (familia `stateful_followup`: 100 % de acierto).
- Salida estructurada JSON en un solo paso (familia `json`: 62 % de acierto) y en varios pasos (`json_multistep`: 60 %).
- Generación de JSON con formato mixto breve (`mixed_brief_json`: 100 %).
- Tool calling / function calling: 94,5 % en la familia `toolcall` y 99 % en `toolcall_only`, lo que indica que el modo de llamada exclusiva a herramientas es prácticamente fiable.
- Razonamiento de opción múltiple (`mcq`: 100 %), útil como aproximación a tareas de conocimiento y discriminación.
- Robustez ante entradas deformadas o adversariales (`fuzz`: 63 %), el punto más débil junto con JSON estricto.
- Capacidades multilingües limitadas a los idiomas declarados (en, zh); no se documentan otros.
- Integración con llama.cpp y compatible con endpoints (`endpoints_compatible`), pensado para despliegue en infraestructura propia.
- No se documentan en la información disponible capacidades de visión, audio ni un modo de razonamiento explícito (thinking mode).

## Casos de uso

- **Línea base para auditoría de cuantización:** desplegar este F16 junto a la variante Q4_K_M del mismo autor y ejecutar el mismo conjunto de fixtures para decidir si la compresión es aceptable antes de mover un modelo de 32B a GPUs de 24 GB en producción. Es el caso de uso principal declarado por el repositorio.
- **Agentes con despacho de herramientas:** con un 99 % de acierto en `toolcall_only` y 94,5 % en `toolcall`, el modelo es adecuado para orquestadores que deban emitir llamadas a APIs con argumentos bien formados (por ejemplo, pipelines internos de automatización de tickets o consultas a bases de datos).
- **Generación de código y automatización (scaffolding de APIs, transformación de datos):** la ficha promociona plantillas de "Code & Automation" con ejemplos de endpoints REST, conversión de CSV a esquema de base de datos y scripts de limpieza de registros; el modelo puede integrarse en un runner local con llama.cpp para tareas de generación de código sin enviar prompts a terceros.
- **Extracción de información sobre contexto largo:** el modelo base está orientado a Q&A documental y extracción de cláusulas; con pesos F16 se evita cualquier pérdida por cuantización en tareas de lectura de contratos o papers, siempre que se confirme la ventana de contexto efectiva en el despliegue.
- **Atención al cliente o asistentes multi-turno con estado:** el 100 % en `stateful_followup` respalda su uso en conversaciones donde el modelo debe recordar y aplicar restricciones fijadas en turnos anteriores (por ejemplo, parámetros de un pedido o preferencias del usuario).
- **Evaluación interna de modelos y regresión de prompt:** al ser un artefacto con SHA-256 y revisión upstream registradas, sirve como referencia congelada en suites de regresión cuando se cambia de plantilla de prompt, de versión de llama.cpp o de GPU.
- **Despliegue en infraestructura privada con requisitos de soberanía del dato:** al ejecutarse en llama.cpp sobre GPUs propias (el autor ejecuta su demo en infraestructura privada), encaja en entornos donde los prompts no pueden salir a proveedores cloud.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`quant_eval golden oracle fixtures v7.22.22`, corpus público con DOI). Ninguna métrica está marcada como verificada (`verified: false`) y no son comparables con MMLU, HumanEval o GSM8K: miden tasas de éxito en tareas agénticas concretas, no conocimiento agregado.

| Familia de evaluacion | Metrica | Resultado (F16) |
|---|---|---|
| json | pass rate | 62,0 % |
| json_multistep | pass rate | 60,0 % |
| stateful_followup | pass rate | 100,0 % |
| mixed_brief_json | pass rate | 100,0 % |
| mcq | pass rate | 100,0 % |
| toolcall | pass rate | 94,5 % |
| toolcall_only | pass rate | 99,0 % |
| fuzz | pass rate | 63,0 % |

Hallazgo comparativo declarado: frente a esta línea base F16, la variante Q4_K_M del mismo modelo **no degradó ninguna de las 8 familias ni mejoró ninguna** (McNemar, p < 0,05; 0 de 8). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- **VRAM para F16:** 32,76 B de parámetros × 2 bytes ≈ 65,5 GB solo en pesos, más caché KV y overhead del runtime. En la práctica requiere GPU de 80 GB (A100 80GB, H100 80GB) o reparto en varias GPU.
- **Reparto multi-GPU:** 2 × 48 GB (L40S, RTX A6000) o 4 × 24 GB con `--split-mode` de llama.cpp; el rendimiento cae por el intercambio entre GPUs.
- **Consumer GPU:** los pesos F16 no caben en ninguna GPU de consumo actual (24 GB máximo en RTX 4090/3090). Para consumer es necesario usar la variante Q4_K_M publicada aparte (~20 GB de pesos), que sí entra en 24 GB con contexto moderado.
- **CPU / RAM:** es viable en modo CPU-only, pero requiere al menos ~70 GB de RAM del sistema; el throughput será del orden de pocos tokens por segundo y no apto para producción interactiva.
- **Opciones de despliegue:** llama.cpp (formato nativo), Ollama, y servidores compatibles con la API de llama.cpp; el tag `endpoints_compatible` sugiere compatibilidad con endpoints estilo OpenAI. No se documenta soporte de vLLM ni TGI para este artefacto GGUF en la información disponible.
- **Latencia y throughput:** no disponible. La ficha no publica tokens/s, TTFT ni métricas de rendimiento por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pbhappliedsystems/qwen-2.5-32B-instruct-gguf-F16 (este) | 32,76 B | no disponible en la ficha | GGUF F16 | Apache-2.0 | Linea base de evaluacion; ~65,5 GB de pesos |
| pbhappliedsystems/qwen-2.5-32B-instruct-gguf-Q4-K-M | 32,76 B | no disponible en la ficha | GGUF Q4_K_M | Apache-2.0 | Misma evaluacion: 0 de 8 familias degradadas frente a F16; cabe en 24 GB |
| Qwen/Qwen2.5-32B-Instruct (upstream) | 32,76 B | 32.768 tokens (documentado upstream) | safetensors (bf16) | Apache-2.0 | Fuente original; requiere conversion para llama.cpp |
| Qwen2.5-72B-Instruct (hermano mayor de la familia) | 72 B aprox. | no disponible en la informacion | safetensors / GGUF de terceros | Apache-2.0 (segun familia) | Mayor calidad esperada, pero sin datos comparables en esta ficha |

No se dispone de resultados de benchmarks estándar de este artefacto que permitan una comparación numérica con alternativas de la misma franja (por ejemplo, Mistral o Llama de 30-34B): **no disponible**.

## Limitaciones y advertencias

- **Idiomas:** solo se declaran en y zh. El rendimiento en castellano no está evaluado ni documentado; usarlo como modelo principal en español es un riesgo no cuantificado.
- **JSON estricto:** las tasas de 62 % en `json` y 60 % en `json_multistep` indican que, sin validación posterior, la salida estructurada fallará en un porcentaje relevante de casos. En producción conviene imponer gramáticas (GBNF) o validadores de esquema con reintento.
- **Robustez ante entradas deformadas:** 63 % en `fuzz`; el modelo puede romperse con entradas malformadas o adversariales.
- **Métricas no verificadas:** los ocho resultados están marcados como `verified: false` y provienen de un arnés propietario del publicador, no de un leaderboard independiente. Tómalos como señal interna del autor, no como evidencia externa.
- **Riesgo de alucinación:** inherente al modelo base; no se han publicado evaluaciones de factualidad (TruthfulQA u otras) en la información disponible.
- **Tamaño del artefacto:** 131,1 GB de repositorio para un modelo de 65,5 GB de pesos implica ficheros duplicados o divisiones múltiples; verifica qué ficheros necesitas antes de descargar.
- **Licencia:** Apache-2.0 permite uso comercial, pero la procedencia registrada por el autor no sustituye la revisión de la licencia upstream de Qwen2.5 por parte de tu departamento legal.
- **Contexto:** al no declararse en la ficha, hay que confirmar la ventana efectiva configurada en llama.cpp (`n_ctx`) antes de dimensionar memoria y de diseñar prompts largos; la caché KV en F16 con contexto grande consume VRAM adicional significativa.
- **Formato GGUF F16:** no apto para GPU de consumo y con soporte limitado en servidores de alto throughput (vLLM/TGI no documentados para este artefacto).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pbhappliedsystems/qwen-2.5-32B-instruct-gguf-F16
- Variante cuantizada Q4_K_M: https://huggingface.co/pbhappliedsystems/qwen-2.5-32B-instruct-gguf-Q4-K-M
- Resultados de evaluacion (pagina del autor): https://pbhappliedsystems.com/models/qwen2.5-32b-instruct#F16
- Coleccion de builds evaluados: https://huggingface.co/collections/pbhappliedsystems/quant-eval-v722-evaluated-gguf-builds-6abcf3128f7eaf1bedeb97d6
- Corpus de evaluacion (DOI Zenodo): https://doi.org/10.5281/zenodo.22009419
- Demo de agente en vivo: https://pbhappliedsystems.com/assistant
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Sitio del publicador: https://pbhappliedsystems.com
