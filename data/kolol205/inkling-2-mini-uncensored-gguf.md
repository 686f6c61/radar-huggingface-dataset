# Kolol205/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored-GGUF es una variante sin censura del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario Kolol205 en formato GGUF para llama.cpp. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 26.070.385.152 parámetros totales (26,4B según la model card) y aproximadamente 3,4B parámetros activos por token, con un núcleo "looped" (capas reutilizadas en varias pasadas) y capacidad de entrada de texto e imagen. La modificación consiste en un adaptador LoRA de rango 1 aplicado sobre las 49 proyecciones que escriben en el flujo residual, orientado a eliminar la dirección de rechazo por capa.

El interés técnico del artefacto es doble. Por un lado, demuestra una técnica concreta de ablación de direcciones de rechazo medida con KLD y top-1 frente al BF16 original, además de métricas de sobre-rechazo (XSTest) y de rechazo en prompts dañinos en inglés y ruso. Por otro, distribuye tres GGUF ya fusionados (AD-Q4_K, AD-IQ3_S, AD-IQ2_M) más el adaptador LoRA suelto y el proyector de visión, todo bajo licencia Apache-2.0.

Es relevante ahora porque el modelo base introduce una arquitectura de bucle (looped core) que requiere versiones recientes de llama.cpp (b12600 o superior, con soporte del PR #32694), y porque la ficha documenta explícitamente las diferencias de calidad de cuantización (KLD y top-1) frente a las cuantizaciones del repositorio base. La fecha de creación del repositorio es 2026-11-21.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo "looped" (capas reutilizadas en 3 pasadas); entrada texto e imagen |
| Parámetros totales | 26.070.385.152 (26,4B) |
| Parámetros activos | 3,4B (MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en los comandos de ejemplo con `-c 32768`); máximo nativo no disponible |
| Tipos de cuantización | GGUF: AD-Q4_K, AD-IQ3_S, AD-IQ2_M; LoRA en GGUF (BF16 a 1-bit); proyector de visión F16 y BF16 |
| Idiomas soportados | No disponible (la model card menciona evaluación en inglés y ruso, no una lista oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), LoRA GGUF, mmproj GGUF |

## Arquitectura y entrenamiento

El modelo base es un MoE con 26,4B parámetros totales y 3,4B activos, organizado en 24 capas de las cuales 12 son capas "looped" que comparten pesos a lo largo de tres pasadas; el resultado son 48 pasadas efectivas de cómputo sobre las capas reutilizadas. Incluye un proyector de visión (`mmproj`) para entrada image-text-to-text. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; esos datos figuran en la documentación de thinkingmachines/Inkling-2-Mini, no en este repositorio.

La modificación de este repositorio es una LoRA de rango 1 sobre las 49 ubicaciones que escriben en el flujo residual: la salida de atención y los expertos enrutados de las 24 capas, más el embedding de tokens. Dado que las 12 capas en bucle comparten pesos en las tres pasadas, una sola edición cubre las 48 pasadas. Para cada capa se calcula la dirección de rechazo como la diferencia de activaciones medias entre prompts dañinos y benignos (en inglés y ruso, con la media benigna proyectada fuera), agrupando prompts con y sin razonamiento. La card indica que el modelo razona incluso con esfuerzo `none` y decide rechazar dentro de su razonamiento, por lo que una dirección calculada solo sin razonamiento dejaba rechazos suaves en chat.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imagen junto con texto (pipeline image-text-to-text, con proyector de visión incluido).
- Razonamiento con niveles de esfuerzo configurables (`none`, `low`, `high`) y presupuesto de tokens de razonamiento.
- Capacidad multilingüe parcial: la evaluación del adaptador cubre inglés y ruso.
- Ejecución local offline mediante llama.cpp con soporte de plantilla Jinja (`--jinja`).
- Aplicación de la edición sin censura mediante LoRA sobre cualquier GGUF del repositorio base, de BF16 a 1-bit.
- No se documenta soporte explícito de tool calling, function calling ni uso como agente multi-paso en la información disponible.

## Casos de uso

- Investigación sobre alineación y rechazo: el adaptador permite comparar el comportamiento del mismo modelo con y sin la dirección de rechazo ablacionada, usando las métricas de la card (XSTest, harmful_behaviors) como línea base reproducible.
- Despliegue local en estaciones de trabajo: con AD-IQ2_M (8,67 GB) el modelo cabe en GPUs de consumo con 12 GB de VRAM, permitiendo inferencia offline de un MoE de 26,4B con 3,4B activos.
- Procesamiento de documentos con imagen: el pipeline image-text-to-text con `mmproj` permite describir o extraer información de capturas y figuras junto con texto en un mismo flujo.
- Evaluación de cuantizaciones: los valores de KLD y top-1 publicados (0,0115/95,6% para Q4_K; 0,0235/93,8% para IQ3_S; 0,132/85,7% para IQ2_M) sirven para decidir el compromiso tamaño-calidad en un despliegue concreto.
- Generación de texto en ruso e inglés: la card documenta evaluación en ambos idiomas, lo que permite usar el modelo en tareas bilingües de redacción o resumen.
- Razonamiento con presupuesto controlado: los niveles de esfuerzo y el límite de tokens de razonamiento (3.072 en las pruebas) permiten ajustar latencia y coste en tareas que requieren cadena de pensamiento.
- Integración en pipelines llama.cpp: el servidor `llama-server` con `--jinja` y `-ngl 99` habilita una API compatible con endpoints para prototipos y herramientas internas.

## Benchmarks y rendimiento

Los datos publicados comparan el BF16 con el adaptador frente al BF16 sin él, con decodificación greedy. No hay resultados de MMLU, HumanEval o GSM8K completos en la información disponible; solo se menciona que MMLU se evaluó con 2.000 preguntas, sin cifras.

| Comprobación | Original | Con el adaptador |
|---|---:|---:|
| Prompts dañinos rechazados, inglés (81), sin razonamiento | 81 (100%) | 0 |
| Prompts dañinos rechazados, ruso (100), sin razonamiento | 91 (91%) | 0 |
| Prompts dañinos de validación, inglés (104) / ruso (100) | 100% / 89% | 0 / 0 |
| Prompts dañinos con razonamiento, esfuerzo `low`, 3.072 tokens (30) | 28 | 0 |
| Los mismos con esfuerzo `high` (30) | 26 | 0 |
| 8 prompts de chat dañinos, esfuerzo `none` / `low` (también AD-Q4_K) | 8 / 8 | 0 / 0 |
| Prompts seguros de XSTest rechazados (250) | 10 (4,0%) | 0 |
| Respuestas vacías | 0 | 0 |

| Fichero | GB en disco | KLD frente al BF16 original | Top-1 |
|---|---:|---:|---:|
| AD-Q4_K | 16,53 | 0,0115 | 95,6% |
| AD-IQ3_S | 13,34 | 0,0235 | 93,8% |
| AD-IQ2_M | 8,67 | 0,132 | 85,7% |

Referencia del repositorio base: AD-Q4_K 0,0080 / 96,3%; AD-IQ3_S 0,0205 / 94,2%; AD-IQ2_M 0,130 / 85,7%. La medición usa un corpus neutro de 87 fragmentos de 4.096 tokens.

## Requisitos de hardware

- VRAM estimada: AD-IQ2_M ocupa 8,67 GB en disco y es la opción viable en GPUs de 12 GB; AD-IQ3_S (13,34 GB) requiere 16 GB o más; AD-Q4_K (16,53 GB) requiere 24 GB o más. Hay que sumar el proyector de visión (0,64 GB) y el espacio de caché KV para el contexto configurado.
- GPUs recomendadas: RTX 4090 (24 GB) para AD-Q4_K; RTX 4080/4070 Ti Super (16 GB) para AD-IQ3_S; RTX 3060 12 GB o RTX 4070 para AD-IQ2_M. Para despliegue multiusuario, A100 o H100 con mayor contexto.
- Cabe en GPU de consumo: sí, al menos con AD-IQ2_M y AD-IQ3_S según la VRAM indicada.
- Opciones de despliegue: llama.cpp (obligatorio b12600 o superior con soporte del PR #32694). No se documenta compatibilidad con vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.
- Nota de compatibilidad: no mezclar GGUF del layout antiguo (PR #32695) con la implementación fusionada del PR #32694.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored (este) | 26,4B | 3,4B | 32.768 en ejemplos | Apache-2.0 | GGUF + LoRA |
| AtomicChat/Inkling-2-Mini-GGUF (base) | 26,4B | 3,4B | no disponible | Apache-2.0 | GGUF |
| thinkingmachines/Inkling-2-Mini (BF16) | 26,4B | 3,4B | no disponible | Apache-2.0 | safetensors |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría en la información proporcionada. La comparación relevante es interna: el adaptador mantiene KLD y top-1 cercanos a las cuantizaciones del repositorio base, con una degradación mayor en IQ2_M (0,132 frente a 0,130 en el base).

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para eliminar el rechazo ante prompts dañinos: en las pruebas, 0 de 81 prompts dañinos en inglés y 0 de 100 en ruso fueron rechazados. No es apto para despliegues públicos sin filtros externos.
- Riesgo de alucinación no cuantificado en la información disponible; no hay evaluación de factualidad.
- La cuantización IQ2_M degrada notablemente la fidelidad (KLD 0,132, top-1 85,7%); para producción se recomienda Q4_K o IQ3_S.
- La lista oficial de idiomas soportados no está disponible; la evaluación solo cubre inglés y ruso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni mantenimiento.
- Requiere llama.cpp b12600 o superior; versiones anteriores o layouts mezclados (PR #32695 frente a #32694) producen incompatibilidades.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado sin rechazo recae en el desplegador.
- No se documentan sesgos específicos más allá de los inherentes al modelo base.
- El contexto máximo nativo no está confirmado; los ejemplos usan 32.768 tokens.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Kolol205/Inkling-2-Mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF del modelo base: https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF
- PR de llama.cpp con la arquitectura loop fusionada: https://github.com/ggml-org/llama.cpp/pull/32694
- PR antiguo de la arquitectura loop: https://github.com/ggml-org/llama.cpp/pull/32695
- Guía de ejecución local: https://atomic.chat/blog/guides/how-to-run-inkling-2-mini-uncensored-locally
- Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X: https://x.com/atomic_chat_hq
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset XSTest: https://huggingface.co/datasets/walledai/XSTest
