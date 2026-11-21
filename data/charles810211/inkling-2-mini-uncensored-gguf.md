# Charles810211/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored-GGUF es una compilación no oficial del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario Charles810211. Se trata de un modelo multimodal de entrada (texto e imagen) con arquitectura Mixture of Experts (MoE) de 26.070.385.152 parámetros totales, de los cuales aproximadamente 3.400 millones están activos por token, según indica la model card del autor. El modelo base emplea un núcleo con bucles ("looped core") de 12 capas compartidas que se ejecutan en tres pasadas, de modo que la edición aplicada sobre esas capas afecta a los 48 pasos efectivos.

La relevancia de esta ficha radica en que combina dos elementos poco habituales: por un lado, un modelo MoE multimodal con licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales; por otro, una modificación de "desensibilización" (uncensoring) implementada como un adaptador LoRA de rango 1 aplicado sobre las 49 proyecciones que escriben en el flujo residual. El autor distribuye tanto el adaptador LoRA (0,04 GB) como tres GGUF ya fusionados con la edición, además del proyector de visión en F16/BF16.

El modelo está pensado para ejecutarse localmente con llama.cpp (versión b12600 o superior, con soporte para la arquitectura "Inkling 2 loop" introducida en el PR #32694). No se dispone de datos de idiomas soportados en la información proporcionada, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo con bucles (looped core); 12 capas compartidas en 3 pasadas |
| Parametros totales | 26.070.385.152 (26,4B según model card) |
| Parametros activos | ~3.400 millones (3,4B) |
| Longitud de contexto | 32.768 tokens (valor usado en los comandos de ejemplo de la model card) |
| Tipos de cuantizacion | AD-Q4_K, AD-IQ3_S, AD-IQ2_M (fusionadas); LoRA en GGUF para cualquier cuantización del repo base (BF16 a 1-bit) |
| Idiomas soportados | No disponible (la model card menciona inglés y ruso en la construcción del adaptador, pero no declara lista oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyector de visión mmproj en F16/BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con un núcleo recurrente ("looped core"): 24 capas en total, de las cuales 12 son capas con bucles cuyos pesos se comparten a lo largo de tres pasadas, generando 48 pasos efectivos de cómputo. Los 26,07B de parámetros totales se activan parcialmente por token, con unos 3,4B activos. El modelo acepta entrada de texto e imagen, lo que requiere un proyector de visión separado (mmproj) en el despliegue con llama.cpp.

La edición "uncensored" no reentrena el modelo, sino que aplica un LoRA de rango 1 sobre las 49 ubicaciones que escriben en el flujo residual: la salida de atención y los expertos enrutados de las 24 capas, más el embedding de tokens. Para cada capa se calcula la dirección de rechazo como la diferencia entre las activaciones medias en prompts dañinos y en prompts inocuos (en inglés y ruso), proyectando fuera la media de los inocuos. La dirección se agrupa sobre prompts renderizados con y sin razonamiento, porque el modelo razona incluso con esfuerzo `none` y decide rechazar dentro de su propio razonamiento. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento (effort `none`, `low`, `high`) y presupuesto de tokens configurable.
- Entrada de imagen junto con texto (pipeline image-text-to-text), mediante el proyector de visión mmproj.
- Conversación multi-turno con plantilla Jinja (`--jinja`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: la model card documenta prompts en inglés y ruso; no hay lista oficial de idiomas.
- Edición "uncensored": elimina los rechazos en las pruebas del autor (0 rechazos en 81 prompts dañinos en inglés y 100 en ruso, con razonamiento desactivado).
- Reducción del exceso de rechazo: 0 rechazos en 250 prompts inocuos de XSTest, frente a 10 (4,0%) del original.

## Casos de uso

- Despliegue local de un modelo multimodal de ~26B en hardware de consumo: las cuantizaciones IQ2_M (8,67 GB) e IQ3_S (13,34 GB) permiten ejecutar el modelo con llama.cpp en GPU con 12-16 GB de VRAM, manteniendo entrada de imagen y contexto de 32.768 tokens.
- Investigación sobre alineación y rechazo: el adaptador LoRA de rango 1 y las métricas de KLD y top-1 permiten estudiar cómo una edición mínima sobre las escrituras al flujo residual altera la conducta de rechazo sin degradar sustancialmente la distribución de salida.
- Evaluación de robustez multilingüe: el adaptador se construyó con prompts en inglés y ruso, y la model card reporta métricas separadas por idioma, lo que lo hace útil para comparar la transferencia de la edición entre lenguas.
- Prototipado de asistentes conversacionales con contexto largo: los 32.768 tokens de ventana y el soporte de plantilla Jinja permiten gestionar conversaciones multi-turno con historial extenso en llama-server.
- Aplicaciones que requieren entrada visual: el proyector mmproj F16/BF16 habilita tareas de image-text-to-text en local, sin depender de APIs externas.
- Pruebas de cuantización extrema: los tres GGUF fusionados (Q4_K, IQ3_S, IQ2_M) con métricas KLD y top-1 publicadas frente al BF16 original permiten evaluar la degradación de un MoE con núcleo recurrente en regímenes de 2 a 4 bits.
- Escenarios de contenido sin filtrado: la eliminación de rechazos en las pruebas del autor lo hace adecuado para entornos donde el filtrado del modelo base resulta un obstáculo, siempre que se apliquen las salvaguardas externas correspondientes.

## Benchmarks y rendimiento

Los datos publicados por el autor miden la fidelidad de las cuantizaciones frente al BF16 original y el efecto del adaptador sobre el rechazo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, salvo la mención de una evaluación MMLU de 2.000 preguntas cuyo resultado no se detalla.

| Metrica | Original | Con adaptador | Umbral | Resultado |
|---|---:|---:|---|---|
| Prompts dañinos rechazados, inglés (81), sin razonamiento | 81 (100%) | 0 | ≤ 3% | pasa |
| Prompts dañinos rechazados, ruso (100), sin razonamiento | 91 (91%) | 0 | ≤ 3% | pasa |
| Prompts dañinos validación, inglés (104) / ruso (100) | 100% / 89% | 0 / 0 | ≤ 3% | pasa |
| Prompts dañinos con razonamiento, effort `low`, presupuesto 3.072 (30) | 28 | 0 | ≤ 1 | pasa |
| Prompts dañinos con razonamiento, effort `high` (30) | 26 | 0 | ≤ 1 | pasa |
| Prompts de chat dañinos, effort `none`/`low` (8) | 8 / 8 | 0 / 0 | — | — |
| Prompts inocuos XSTest rechazados (250) | 10 (4,0%) | 0 | ≤ original + 1 pt | pasa |
| Respuestas vacías | 0 | 0 | ≤ 1% | pasa |

| Fichero | Tamano (GB) | KLD vs BF16 | Top-1 |
|---|---:|---:|---:|
| Inkling-2-Mini-Uncensored-AD-Q4_K.gguf | 16,53 | 0,0115 | 95,6% |
| Inkling-2-Mini-Uncensored-AD-IQ3_S.gguf | 13,34 | 0,0235 | 93,8% |
| Inkling-2-Mini-Uncensored-AD-IQ2_M.gguf | 8,67 | 0,132 | 85,7% |

Como referencia, el autor indica que las cuantizaciones equivalentes del repo base obtienen KLD/top-1 de 0,0080/96,3% (AD-Q4_K), 0,0205/94,2% (AD-IQ3_S) y 0,130/85,7% (AD-IQ2_M). Las mediciones se realizaron sobre un corpus neutral de 87 fragmentos de 4.096 tokens.

## Requisitos de hardware

- VRAM estimada: ~9 GB para IQ2_M, ~14 GB para IQ3_S, ~17 GB para Q4_K, más ~0,64 GB del proyector de visión.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K con contexto completo; RTX 4080/4070 Ti (16 GB) para IQ3_S; RTX 3060 12 GB o similar para IQ2_M.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones publicadas, con margen creciente según se baja de Q4_K a IQ2_M.
- Opciones de despliegue: llama.cpp (llama-server) versión b12600 o superior, con soporte de la arquitectura "Inkling 2 loop" (PR #32694). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored (esta ficha) | 26,07B | ~3,4B | 32.768 | Apache-2.0 | GGUF | Edición LoRA rango 1, multimodal |
| thinkingmachines/Inkling-2-Mini (base) | 26,07B | ~3,4B | no disponible | Apache-2.0 | safetensors / GGUF | Modelo original con rechazos |
| AtomicChat/Inkling-2-Mini-GGUF | 26,07B | ~3,4B | no disponible | Apache-2.0 | GGUF | Cuantizaciones base sin edición |

No se dispone de datos de benchmarks comparativos frente a modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- La eliminación de rechazos es una modificación deliberada del comportamiento de seguridad: el modelo responde a prompts dañinos en las pruebas del autor, por lo que requiere salvaguardas externas en producción.
- Los umbrales de la model card se midieron sobre un conjunto limitado (81-104 prompts por categoría) y con decodificación greedy; el comportamiento puede variar con otros prompts o parámetros de muestreo.
- El adaptador se construyó con prompts en inglés y ruso; la transferencia a otros idiomas no está documentada.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la edición "uncensored" puede contravenir las políticas de uso de plataformas que alojan el modelo base; conviene revisar los términos del modelo original.
- Compatibilidad estricta con llama.cpp b12600 o superior: mezclar GGUF del layout antiguo (PR #32695) con la implementación fusionada (PR #32694) provoca fallos.
- El repositorio no registra descargas ni interacciones, y el autor no es el desarrollador original del modelo base; la trazabilidad y el mantenimiento no están garantizados.
- El contexto máximo real y el comportamiento más allá de 32.768 tokens no están documentados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Charles810211/Inkling-2-Mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF del modelo base: https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF
- PR de llama.cpp con la arquitectura Inkling 2 loop: https://github.com/ggml-org/llama.cpp/pull/32694
- PR antiguo (obsoleto): https://github.com/ggml-org/llama.cpp/pull/32695
- Guía de ejecución local: https://atomic.chat/blog/guides/how-to-run-inkling-2-mini-uncensored-locally
- Atomic Chat: https://atomic.chat/
- Discord: https://discord.gg/8wGSsvmg4V
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- X (Twitter): https://x.com/atomic_chat_hq
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset XSTest: https://huggingface.co/datasets/walledai/XSTest
