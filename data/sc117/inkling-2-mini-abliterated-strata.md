# SC117/Inkling-2-Mini-abliterated-Strata

## Resumen

Inkling-2-Mini-abliterated-Strata es una redistribución cuantizada y "abliterated" del modelo multimodal Inkling-2-Mini desarrollado originalmente por Thinking Machines. El autor de esta variante, SC117, parte de los checkpoints oficiales de strata-engine/Inkling-2-Mini-Strata y aplica una ablación de atención sobre 20 capas, además de empaquetar los pesos en el formato propietario `.strata v1.1` con tres niveles de cuantización (SQ-20, SQ-15 y SQ-10) más un shard de visión en BF16 sin pérdida.

El modelo base es un transformer con mezcla de expertos (MoE) de 128 expertos, con 26.400 millones de parámetros totales, 3.400 millones de parámetros base y 5.400 millones de parámetros efectivos activos tras tres pasadas de bucle (looped transformer). Incorpora visión (pipeline image-text-to-text), razonamiento, contexto largo y capacidades de agente, con soporte para inglés, chino y otros idiomas.

La relevancia de esta ficha radica en que combina tres tendencias actuales: arquitecturas MoE con bucles de cómputo reutilizado, técnicas de "abliteration" para eliminar el alineamiento de rechazo, y formatos de cuantización propietarios orientados a reducir el peso en disco (de 18,02 GiB en SQ-20 a 9,75 GiB en SQ-10). Todo ello bajo licencia Apache 2.0, lo que facilita su uso comercial, aunque con las advertencias propias de un modelo sin censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con looped transformer (3 pasadas), vision shard, DSpark speculative drafter |
| Parametros totales | 26,4 mil millones (26.4B) |
| Parametros activos | 3,4B base / 5,4B efectivos (3 pasadas de bucle), 128 expertos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | SQ-20 (18,02 GiB, sin pérdida), SQ-15 (13,36 GiB), SQ-10 (9,75 GiB); shard de visión en BF16 sin pérdida; variante FIT-GGUF para llama.cpp |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | `.strata v1.1` (nativo), FIT-GGUF (llama.cpp), vision shard BF16 |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura de mezcla de expertos con 128 expertos y un mecanismo de "looped transformer": el mismo bloque se reutiliza en tres pasadas, de modo que los 3,4B parámetros base se convierten en 5,4B parámetros efectivos activos por token. Esta variante añade un shard de visión en BF16 sin pérdida y un borrador especulativo DSpark embebido para decodificación especulativa, lo que acelera la generación al proponer tokens candidatos que el modelo principal verifica.

Sobre el entrenamiento original no se dispone de detalles en la información proporcionada (número de tokens, composición del dataset, uso de RLHF/DPO). La modificación de SC117 consiste en una ablación de atención "byte-exact" sobre 20 capas, trasplantada desde los checkpoints oficiales de strata-engine/Inkling-2-Mini-Strata, junto con la cuantización en formato `.strata v1.1`. No se documentan pasos adicionales de ajuste fino ni de alineamiento tras la ablación.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino y otros idiomas.
- Razonamiento multi-paso y modo "thinking" implícito en el modelo base.
- Comprensión de imágenes (pipeline image-text-to-text) mediante el shard de visión BF16.
- Capacidades de agente y tool calling heredadas del modelo base (no confirmadas explícitamente en la model card de esta variante).
- Contexto largo (etiqueta long-context), aunque la longitud exacta no está disponible.
- Decodificación especulativa integrada mediante DSpark, orientada a reducir latencia.
- Comportamiento "uncensored" por la ablación de atención: menor tendencia a rechazar peticiones.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede recibir una imagen y un texto y mantener una conversación multi-turno, adecuado para soporte técnico con capturas de pantalla o análisis de documentos escaneados.
- Análisis de documentos con contexto largo: gracias a su etiqueta long-context, puede procesar informes extensos y responder preguntas sobre ellos en una sola sesión.
- Generación de código y razonamiento técnico: el modelo base está orientado a razonamiento; puede integrarse en asistentes de programación que expliquen fragmentos de código o propongan refactorizaciones.
- Despliegue en hardware de consumo: la variante SQ-10 (9,75 GiB) permite ejecutar el modelo en GPUs consumer de 12-16 GB de VRAM, útil para prototipado local sin infraestructura cloud.
- Investigación sobre alineamiento y seguridad: al ser una versión "abliterated", sirve para estudiar cómo la ablación de atención afecta a los rechazos y a la calidad de las respuestas en tareas sensibles.
- Pipelines de agentes con tool calling: si el modelo base conserva esa capacidad, puede orquestar llamadas a APIs y flujos multi-paso en entornos controlados.
- Evaluación comparativa de cuantizaciones: los tres niveles SQ permiten medir la degradación de calidad entre SQ-20 (sin pérdida) y SQ-10 en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: SQ-10 requiere al menos ~10-12 GB para los pesos, más overhead de contexto y visión; SQ-15 ~14-16 GB; SQ-20 ~18-20 GB. El shard de visión BF16 añade memoria adicional no cuantificada en la model card.
- GPU recomendadas: A100 40/80 GB, H100 para SQ-20 con contexto largo; RTX 4090 (24 GB) para SQ-15 y SQ-20; RTX 4080/4070 Ti (16 GB) para SQ-15; RTX 3060 12 GB o similar para SQ-10.
- Cabe en GPU consumer: sí, especialmente SQ-10 en 12 GB y SQ-15 en 16 GB, siempre que se limite la longitud de contexto.
- Opciones de despliegue: formato nativo `.strata v1.1` (requiere el runtime de Strata), variante FIT-GGUF para llama.cpp, y potencialmente Ollama o vLLM si se convierten los pesos (no confirmado).
- Latencia y throughput: no disponibles; la decodificación especulativa DSpark debería mejorar el throughput frente a decodificación autoregresiva estándar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Mini-abliterated-Strata | 26,4B totales / 5,4B efectivos | no disponible | Apache 2.0 | Hugging Face (SC117) |
| Inkling-2-Mini (base) | 26,4B totales / 5,4B efectivos | no disponible | no disponible | Hugging Face (thinkingmachines) |
| Inkling-2-Mini-Strata (oficial) | 26,4B totales / 5,4B efectivos | no disponible | no disponible | Hugging Face (strata-engine) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La ablación de atención puede degradar la coherencia y aumentar la tasa de alucinación en comparación con el modelo base alineado.
- Al ser "uncensored", puede generar contenido inapropiado, sesgado o dañino; no es adecuado para aplicaciones de cara al público sin filtros adicionales.
- La longitud de contexto no está documentada; asumir valores altos sin verificación puede provocar fallos en producción.
- El formato `.strata v1.1` es propietario y requiere tooling específico; la interoperabilidad con ecosistemas estándar depende de la variante FIT-GGUF.
- Los detalles de entrenamiento y los benchmarks del modelo base no se han publicado en la información disponible, lo que impide validar afirmaciones de rendimiento.
- Aunque la licencia es Apache 2.0, el uso comercial debe evaluar el riesgo reputacional y legal de un modelo sin alineamiento.
- El shard de visión en BF16 no está cuantizado, por lo que el consumo de memoria real supera el de los pesos de texto indicados.

## Enlaces

- Hugging Face: https://huggingface.co/SC117/Inkling-2-Mini-abliterated-Strata
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoints oficiales Strata: https://huggingface.co/strata-engine/Inkling-2-Mini-Strata
- Variante GGUF: https://huggingface.co/SC117/Inkling-2-Mini-abliterated-FIT-GGUF
- README en chino: https://huggingface.co/SC117/Inkling-2-Mini-abliterated-Strata/blob/main/README.zh-CN.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
