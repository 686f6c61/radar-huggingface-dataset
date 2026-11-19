# peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF

## Resumen
Dirk-Qwen3.8-27B-GGUF es una cuantización comunitaria del modelo denso Qwen3.8-27B de Alibaba Qwen, publicada por el usuario peculiar-ragdoll. Se trata de un modelo vision-language (image-text-to-text) de aproximadamente 26.900 millones de parámetros, distribuido en formato GGUF para su uso con llama.cpp y runtimes compatibles. La contribución principal del autor no es un reentrenamiento, sino un cambio de plantilla de chat: la llamada plantilla Sharp, que sustituye a la plantilla original de Qwen y modifica el comportamiento por defecto del razonamiento.

El cambio más relevante es que el Qwen3.8-27B original fuerza `reasoning_effort=xhigh` en cada llamada, es decir, razonamiento de máximo esfuerzo siempre activo. Dirk elimina ese valor por defecto y deja el modelo en su nivel nativo `medium`, además de añadir un system prompt de concisión. El resultado declarado por el autor es una reducción notable del número de tokens de salida con una precisión igual o superior, manteniendo los pesos y los tensores MTP intactos.

El modelo está pensado para desarrolladores que quieren desplegar un VLM de 27B en hardware de consumo o en una sola GPU profesional, con soporte de decodificación especulativa mediante la cabeza MTP (`nextn`) desde el nivel `UD-Q2_K_XL` en adelante, y con la licencia Apache 2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-language (base Qwen3.8-27B; tag `qwen3_5`) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | hasta 256k segun la tabla de ficheros del autor (referencia a "256k context" en Q8_K_L); no se detalla el maximo oficial en la informacion disponible |
| Tipos de cuantizacion | GGUF Unsloth Dynamic (UD): IQ2_XS, IQ2_S, Q2_K_XL, IQ3_XXS, IQ3_S, Q3_K_XL, IQ4_XS, Q4_K_S, Q4_K_M, Q4_K_XL, Q5_K_XL, Q6_K, Q6_K_XL, Q8_K_L |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 883,2 GB con todos los niveles |

## Arquitectura y entrenamiento
La arquitectura subyacente es la del Qwen3.8-27B: un transformer denso de ~26,9B parámetros con capacidad de visión (pipeline `image-text-to-text`), etiquetado internamente como `qwen3_5`. Incluye una cabeza de predicción multi-token (MTP, `nextn`) que permite decodificación especulativa en runtimes que la soportan. No hay información en la model card sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esos datos corresponden al modelo base y no se reproducen aquí.

La innovación de esta publicación es exclusivamente de inferencia: se aplica la plantilla Sharp (versión v22.5.0), construida sobre la plantilla corregida de Qwen para 3.8 más un system prompt de concisión, y se elimina el valor por defecto `xhigh` de `reasoning_effort`. La plantilla se inserta en los metadatos del GGUF mediante byte-swap; los pesos y los tensores MTP no se modifican. Las cuantizaciones provienen de la release Dynamic 3.1 de Unsloth (noviembre de 2026), que recuantizó solo los niveles donde 3.1 aporta mejora. Los dos niveles más pequeños (`UD-IQ2_XS` y `UD-IQ2_S`) se distribuyen sin cabeza MTP.

## Capacidades
- Generación de texto y razonamiento con niveles de esfuerzo configurables (`low`, `medium`, `xhigh`; `high` es alias de `xhigh`).
- Modo de pensamiento desactivable mediante `"enable_thinking": false`.
- Procesamiento de imágenes y texto (image-text-to-text), con visión preservada respecto al base.
- Codificación agéntica: el autor la destaca como capacidad central (`agentic-coding`), con resultados medidos en SWE-bench-Live.
- Decodificación especulativa mediante MTP (`nextn`) en todos los niveles desde `UD-Q2_K_XL`.
- Optimización de tokens: la plantilla Sharp reduce el consumo de tokens de salida manteniendo o mejorando la precisión.
- Soporte bilingüe inglés-chino.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema llama.cpp.
- No se documenta en la información disponible soporte explícito de tool calling ni de function calling.

## Casos de uso
- Reparación de bugs en repositorios reales: el modelo está evaluado en SWE-bench-Live y, según el autor, alcanza una corrección en el 37% del tiempo mediano del modelo con plantilla original en la banda de tareas que ambos resuelven. Encaja en flujos de agente que leen el repositorio, localizan el fallo y proponen un parche.
- Asistente de código en local sobre GPU de 24 GB: con `UD-Q4_K_XL` (17,7 GB) o `UD-Q5_K_XL` (21,0 GB) se obtiene un VLM de 27B con margen para contexto, sin depender de la nube.
- Análisis de capturas y diagramas técnicos: al conservar la visión, puede recibir una imagen de un error de consola, un diagrama de arquitectura o una tabla y responder en texto, útil en soporte técnico y documentación.
- Razonamiento con presupuesto de tokens controlado: en pipelines de alto volumen donde el coste por token importa, el nivel `low` o el modo sin pensamiento reduce la latencia y el gasto frente al `xhigh` forzado del base.
- Despliegue en 12-16 GB: los niveles `UD-IQ2_S` (8,4 GB) e `UD-IQ3_S` (12,0 GB) permiten ejecutar el modelo en GPU de gama media o en configuraciones con poca VRAM, a costa de calidad.
- Servicio bilingüe inglés-chino: para productos dirigidos a ambos mercados, el modelo cubre las dos lenguas declaradas sin modelos separados.
- Evaluación comparativa de plantillas: útil para investigadores que quieran medir el efecto de la plantilla y del nivel de razonamiento sobre las mismas ponderaciones.

## Benchmarks y rendimiento
Los datos disponibles provienen de las tarjetas del autor y no incluyen la metodología completa. Se reproducen tal cual.

| Benchmark | Modelo / condicion | Resultado |
|---|---|---|
| MMLU-Pro (precisión) | Dirk (medium) | 85,3% (el más alto de la comparativa mostrada) |
| MMLU-Pro (tiempo hasta respuesta correcta) | Nail (35B-A3B MoE) | 43 s (el más rápido de la comparativa) |
| SWE-bench-Live (25 tareas resueltas) | Dirk vs. plantilla original | Dirk corrige en el 37% del tiempo mediano del original (2,7x) en la banda común |
| SWE-bench-Live (resueltas) | Dirk vs. Opus 5 (high) | 15 frente a 14 a favor de Dirk; una resolución por detrás del original |
| Claw-Eval, componente de respuesta | Plantilla original vs. Sharp (sobre ThinkingCap-27B) | 59,3 → 66,7 (+7,4) |
| Claw-Eval, tokens de respuesta | Plantilla original vs. Sharp | 5.393 → 2.217 (−59%) |
| MMLU-Pro, tokens por respuesta correcta | Plantilla original vs. Sharp | 1.601 → 1.248 (−22%) |

Las dos últimas filas corresponden a mediciones sobre ThinkingCap-27B con los mismos pesos y solo la plantilla cambiada, no sobre Dirk. El autor las presenta como evidencia previa del efecto de la plantilla.

## Requisitos de hardware

| Nivel | Tamano | VRAM objetivo segun el autor |
|---|---|---|
| UD-IQ2_XS | 7,6 GB | 12 GB con margen de contexto; sin MTP |
| UD-IQ2_S | 8,4 GB | 12 GB (opcion recomendada para 12 GB); sin MTP |
| UD-Q2_K_XL | 10,0 GB | 12 GB con contexto corto; primer nivel con MTP |
| UD-IQ3_XXS | 10,9 GB | 16 GB holgado, o 12 GB con contexto corto |
| UD-IQ3_S | 12,0 GB | 16 GB (mejor relacion calidad/precio si el limite es 16 GB) |
| UD-Q3_K_XL | 13,1 GB | 16 GB con margen |
| UD-IQ4_XS | 14,3 GB | 16 GB (opcion recomendada para 16 GB) |
| UD-Q4_K_S | 15,4 GB | 4 bits ajustado para contextos largos |
| UD-Q4_K_M | 16,6 GB | 4 bits convencional; resolucion por defecto de `-hf` |
| UD-Q4_K_XL | 17,7 GB | 24 GB (punto de partida recomendado) |
| UD-Q5_K_XL | 21,0 GB | 24 GB (mejor calidad con margen de contexto) |
| UD-Q6_K | 22,0 GB | 24 GB, mas ajustado que Q5_K_XL |
| UD-Q6_K_XL | 25,3 GB | ~32 GB |
| UD-Q8_K_L | 28,0 GB | 48 GB con contexto de 256k |

- GPU recomendadas: RTX 4090 / 3090 (24 GB) para Q4_K_XL y Q5_K_XL; A100 40/80 GB, H100 o RTX 6000 Ada para Q6_K_XL y Q8_K_L; GPU de 12-16 GB para los niveles 2 y 3 bits.
- Cabe en GPU de consumo: si, desde 12 GB en los niveles IQ2 hasta 24 GB en Q5_K_XL.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF (el autor menciona oMLX); no se documentan vLLM ni TGI para este formato.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo; el autor reporta mejoras relativas (2,7x en tiempo hasta la corrección en SWE-bench-Live y −59% de tokens de respuesta con la plantilla Sharp).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dirk-Qwen3.8-27B | ~26,9B denso, VLM | hasta 256k (segun tabla del autor) | MMLU-Pro 85,3% (medium); SWE-bench-Live 15/25 | Apache 2.0 | GGUF en HF |
| Qwen3.8-27B (base, plantilla original) | ~26,9B denso, VLM | no disponible | MMLU-Pro y SWE-bench-Live inferiores a Dirk segun el autor; fuerza `xhigh` | Apache 2.0 | HF |
| Nail (35B-A3B MoE) | 35B totales, ~3B activos | no disponible | MMMLU-Pro: mas rapido hasta respuesta correcta (43 s) que Dirk | no disponible | no disponible |
| TielCoder (Sharp Ornith-1.5, 35B-A3B MoE, 4 bits) | 35B totales, ~3B activos | no disponible | incluido en la comparativa SWE-bench-Live del autor | no disponible | no disponible |
| Opus 5 (high) / Sonnet 5 (medium), en la nube | no disponible | no disponible | Opus 5 (high): 14/25 en SWE-bench-Live, por detras de Dirk | propietaria | API en la nube |

## Limitaciones y advertencias
- Solo se declaran los idiomas inglés y chino; el rendimiento en castellano no está documentado y no debería asumirse.
- El modelo es una cuantización: los niveles de 2 y 3 bits degradan la calidad de forma apreciable frente a Q4 y superiores, y los dos más pequeños pierden la cabeza MTP.
- El autor no publica la metodología completa de sus benchmarks (SWE-bench-Live con 25 tareas, MMLU-Pro); los números deben tratarse como indicativos y no como resultados auditados.
- Las cifras de Claw-Eval y MMLU-Pro sobre reducción de tokens proceden de ThinkingCap-27B, no de Dirk; se extrapolan al comportamiento esperado de la plantilla.
- Riesgo de alucinación inherente a un modelo de 27B en tareas de código y razonamiento; conviene validar los parches y las respuestas factuales antes de aplicarlas en producción.
- El campo `reasoning_effort` de nivel superior estilo OpenAI es descartado por llama.cpp y oMLX; debe pasarse dentro de `chat_template_kwargs`, lo que puede romper integraciones que esperen el formato estándar.
- La licencia Apache 2.0 permite uso comercial, pero las obligaciones de atribución y las condiciones del modelo base deben verificarse en la ficha de Qwen/Qwen3.8-27B.
- El repositorio ocupa 883,2 GB por incluir todos los niveles; la descarga selectiva de un único fichero GGUF es imprescindible en la práctica.
- No se documenta soporte de tool calling ni de function calling, lo que limita su uso directo en agentes que dependan de esas interfaces.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Plantillas Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Documentación de cuantizaciones Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
