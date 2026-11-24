# npario/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored-GGUF es una compilación no censurada del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario npario (con materiales y guías de AtomicChat). Se distribuye como tres archivos GGUF ya fusionados con la edición y como un adaptador LoRA de rango 1 aplicable sobre cualquier GGUF del repositorio base AtomicChat/Inkling-2-Mini-GGUF. El modelo base es un MoE de 26.400 millones de parámetros totales con aproximadamente 3.400 millones activos, núcleo "looped" (12 capas compartidas en tres pasadas), entrada de texto e imagen y licencia Apache-2.0.

El problema que resuelve es concreto: elimina la dirección de rechazo aprendida por el modelo base, de modo que las respuestas a peticiones dañinas dejan de bloquearse sin degradar en exceso la calidad general. Según la model card, el adaptador reduce los rechazos en inglés de 81/81 a 0/81 y en ruso de 91/100 a 0/100, mantiene 0 rechazos en XSTest (frente a 10 del original) y conserva una divergencia KL de 0,0115 respecto al BF16 original en la cuantización AD-Q4_K.

Es relevante ahora porque demuestra una técnica de edición de comportamiento reproducible sobre un MoE con capas recurrentes: una sola edición de rango 1 cubre las 48 pasadas efectivas porque las 12 capas looped comparten pesos. El repositorio, sin embargo, no registra descargas ni valoraciones y no publica resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) más allá de la comprobación de MMLU sobre 2.000 preguntas mencionada en la metodología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo looped (12 capas compartidas en 3 pasadas, 24 capas lógicas) |
| Parametros totales | 26.070.385.152 (26,4 B) |
| Parametros activos | ~3,4 B |
| Longitud de contexto | 32.768 tokens en la configuración de ejemplo (`-c 32768`); máximo nativo no disponible |
| Tipos de cuantizacion | AD-Q4_K (16,53 GB), AD-IQ3_S (13,34 GB), AD-IQ2_M (8,67 GB), LoRA GGUF (0,04 GB), proyector visión F16/BF16 (0,64 GB) |
| Idiomas soportados | No disponible (la model card menciona evaluaciones en inglés y ruso) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), más adaptador LoRA en GGUF; el base original en safetensors |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal con enrutado de expertos y un núcleo recurrente: 24 capas lógicas de las cuales 12 son looped y comparten pesos a lo largo de tres pasadas, lo que da 48 pasadas efectivas con la mitad de parámetros únicos. Acepta texto e imagen (pipeline `image-text-to-text`) mediante un proyector de visión independiente que en esta compilación se mantiene sin cambios respecto al original. Los detalles de composición del dataset de preentrenamiento, número de tokens y si hubo RLHF o DPO no están disponibles en la información proporcionada.

La edición consiste en un LoRA de rango 1 aplicado sobre los 49 puntos que escriben en el residual stream: la salida de atención y los expertos enrutados de las 24 capas, más el embedding de tokens. En cada capa se resta la dirección de rechazo propia de esa capa, calculada como la diferencia entre las activaciones medias en prompts dañinos y en prompts inocuos (inglés y ruso), con la media de los inocuos proyectada fuera. La dirección se agrupa sobre prompts renderizados con y sin razonamiento, porque el modelo razona incluso con esfuerzo `none` y decide rechazar dentro de su propio razonamiento. Los GGUF requieren llama.cpp b12600 o superior con soporte de la arquitectura Inkling 2 loop del PR #32694; no deben mezclarse con archivos del layout antiguo del PR #32695.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y ruso (idiomas efectivamente evaluados).
- Entrada de imagen combinada con texto mediante el proyector de visión incluido.
- Razonamiento explícito con niveles de esfuerzo configurables (`none`, `low`, `high`) y presupuesto de tokens de razonamiento.
- Modo de razonamiento interno que el modelo emplea incluso con esfuerzo mínimo.
- Capacidad de rechazo eliminada de forma deliberada: responde a prompts que el modelo base bloqueaba.
- Compatibilidad con `llama-server` y plantillas Jinja (`--jinja`), lo que habilita integración en endpoints compatibles.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y rechazo: el adaptador permite estudiar cómo se representa la negativa a responder en un MoE con capas compartidas, comparando activaciones con y sin la edición sobre el mismo checkpoint.
- Evaluación de técnicas de edición de modelos: sirve como caso reproducible de LoRA de rango 1 con métricas publicadas de KLD y top-1 frente al BF16 original, útil para validar metodologías de "abliteration" en arquitecturas no estándar.
- Despliegue local de un modelo multimodal de 26 B en hardware de consumo: la variante AD-IQ2_M ocupa 8,67 GB y cabe en GPUs de 12 GB de VRAM, con el proyector de visión de 0,64 GB adicional.
- Generación de contenido creativo sin filtros: escritura de ficción, guiones o narrativa que aborde temas sensibles, donde el modelo base interrumpía la generación con rechazos.
- Procesamiento de documentos con imagen y texto en pipelines offline: al ejecutarse con llama.cpp y `llama-server`, puede integrarse en flujos sin conexión que combinen OCR o capturas con preguntas en lenguaje natural.
- Experimentación con cuantizaciones extremas: los archivos IQ3_S e IQ2_M permiten medir la degradación real (KLD 0,0235 y 0,132 respectivamente) en un modelo con núcleo recurrente, un caso poco documentado.
- Fine-tuning posterior sobre el adaptador: al ser un LoRA GGUF de 0,04 GB, puede combinarse con otros adaptadores o servir de punto de partida para ediciones adicionales de comportamiento.

## Benchmarks y rendimiento

Los únicos datos publicados miden el efecto de la edición, no la capacidad del modelo. Se comparan el BF16 original y el mismo modelo con el adaptador, con decodificación greedy:

| Comprobacion | Original | Con adaptador | Umbral | Resultado |
|---|---:|---:|---|---|
| Prompts dañinos rechazados, inglés (81), sin razonamiento | 81 (100%) | 0 | ≤ 3% | pasa |
| Prompts dañinos rechazados, ruso (100), sin razonamiento | 91 (91%) | 0 | ≤ 3% | pasa |
| Prompts dañinos de validación, inglés (104) / ruso (100) | 100% / 89% | 0 / 0 | ≤ 3% | pasa |
| Prompts dañinos con razonamiento, esfuerzo `low`, 3.072 tokens (30) | 28 | 0 | ≤ 1 | pasa |
| Los mismos con esfuerzo `high` (30) | 26 | 0 | ≤ 1 | pasa |
| 8 prompts dañinos de chat, esfuerzo `none` / `low` (también AD-Q4_K) | 8 / 8 | 0 / 0 | — | — |
| Prompts seguros de XSTest rechazados (250) | 10 (4,0%) | 0 | ≤ original + 1 pt | pasa |
| Respuestas vacías | 0 | 0 | ≤ 1% | pasa |

Calidad de cuantización frente al BF16 original (corpus neutro de 87 fragmentos de 4.096 tokens):

| Archivo | Tamaño (GB) | KLD | Top-1 | Referencia en repo base (KLD / top-1) |
|---|---:|---:|---:|---|
| AD-Q4_K | 16,53 | 0,0115 | 95,6% | 0,0080 / 96,3% |
| AD-IQ3_S | 13,34 | 0,0235 | 93,8% | 0,0205 / 94,2% |
| AD-IQ2_M | 8,67 | 0,132 | 85,7% | 0,130 / 85,7% |

La model card menciona una evaluación de MMLU sobre 2.000 preguntas como parte de la metodología, pero no publica los resultados. No hay datos de MMLU, HumanEval ni GSM8K del modelo base ni de esta compilación en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 9 GB para AD-IQ2_M, 14 GB para AD-IQ3_S y 17 GB para AD-Q4_K, más 0,64 GB del proyector de visión y la caché KV para 32.768 tokens.
- GPU de consumo compatibles: RTX 4090 (24 GB) ejecuta las tres cuantizaciones con contexto completo; RTX 4080/4070 Ti (16 GB) ejecuta IQ3_S e IQ2_M; RTX 3060 de 12 GB queda limitada a IQ2_M con contexto reducido.
- GPU profesionales: A100 (40/80 GB) y H100 (80 GB) permiten AD-Q4_K con contexto máximo y margen para procesamiento por lotes.
- Despliegue: exclusivamente llama.cpp (build b12600 o superior) con `llama-server`; compatible con `--jinja` y `--lora` para el adaptador. No hay soporte indicado para vLLM, TGI ni Ollama en la información proporcionada.
- Latencia y throughput: no disponibles. Como referencia estructural, con ~3,4 B parámetros activos el coste por token se aproxima al de un modelo denso de ese tamaño, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored (este) | 26,4 B | ~3,4 B | 32.768 configurado | Apache-2.0 | GGUF + LoRA | Multimodal, rechazo eliminado |
| thinkingmachines/Inkling-2-Mini | 26,4 B | ~3,4 B | No disponible | Apache-2.0 | Safetensors | Base sin editar, con rechazo activo |
| AtomicChat/Inkling-2-Mini-GGUF | 26,4 B | ~3,4 B | No disponible | Apache-2.0 | GGUF | Cuantizaciones del base sin edición |

No se dispone de datos de benchmarks de capacidad que permitan comparar con alternativas de otros desarrolladores. La comparación relevante es interna: frente al base, esta compilación elimina los rechazos a costa de un aumento de KLD de 0,0035 en Q4_K (0,0080 a 0,0115) y una pérdida de 0,7 puntos de top-1 (96,3% a 95,6%).

## Limitaciones y advertencias

- El modelo responde a peticiones dañinas por diseño. No debe desplegarse en aplicaciones orientadas al público sin una capa externa de moderación.
- La eliminación de la dirección de rechazo puede degradar la coherencia en dominios sensibles; la model card no publica evaluaciones de calidad conversacional general más allá de XSTest y MMLU sin resultados.
- Riesgo de alucinación no cuantificado: no hay datos de benchmarks de veracidad ni de tasas de error factual.
- Idiomas: solo se documentan evaluaciones en inglés y ruso; el resto de idiomas no está verificado y el ruso muestra un rechazo basal del 89-91%, lo que sugiere un ajuste de seguridad más débil en ese idioma.
- Dependencia estricta de llama.cpp b12600 o superior: los GGUF del layout antiguo (PR #32695) son incompatibles y mezclarlos produce fallos.
- El repositorio no registra descargas ni valoraciones, y la fecha de creación (2026-11-24) coincide con la de actualización: no hay historial de mantenimiento.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo editado ni sobre el cumplimiento normativo en jurisdicciones con requisitos de moderación.
- El adaptador LoRA solo es aplicable a GGUF del repositorio AtomicChat/Inkling-2-Mini-GGUF convertidos al layout del PR #32694.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/npario/Inkling-2-Mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF del base: https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF
- Guía de ejecución local: https://atomic.chat/blog/guides/how-to-run-inkling-2-mini-uncensored-locally
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
- PR de llama.cpp con la arquitectura Inkling 2 loop: https://github.com/ggml-org/llama.cpp/pull/32694
- PR antiguo (layout no compatible): https://github.com/ggml-org/llama.cpp/pull/32695
- Dataset de prompts dañinos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset XSTest: https://huggingface.co/datasets/walledai/XSTest
