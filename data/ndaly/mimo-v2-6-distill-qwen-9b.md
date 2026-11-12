# ndaly/MiMo-V2.6-Distill-Qwen-9B

## Resumen

MiMo-V2.6-Distill-Qwen-9B es un modelo de razonamiento de 9.000 millones de parámetros desarrollado por el equipo Xiaomi MiMo, obtenido mediante ajuste fino supervisado (SFT) sobre Qwen3.5-9B usando datos generados por MiMo-V2.6. Emplea una arquitectura híbrida que combina 24 capas de atención lineal Gated-DeltaNet con 8 capas de atención completa, lo que le permite sostener una ventana de contexto de 262.144 tokens sin el coste cuadrático de un transformer denso convencional.

El repositorio analizado (ndaly/MiMo-V2.6-Distill-Qwen-9B) no contiene los pesos originales, sino un paquete de despliegue para hardware Tenstorrent p150 (un chip Blackhole), empaquetado con tt-model-manager 0.1.0 y servido mediante vLLM con un plugin específico. Los pesos son los de Xiaomi sin modificar (commit 2367e865d009c13ac81713a2878291d33ab28177), pero se ejecutan en precisión reducida (proyecciones bfp4, caché KV y LM head en bfp8), por lo que las salidas difieren de la referencia en Hugging Face.

Es relevante porque demuestra la portabilidad de un modelo de razonamiento de contexto largo a aceleradores no-GPU (Tenstorrent) manteniendo una API compatible con OpenAI, con perfiles de servicio para un usuario interactivo o hasta 32 concurrentes. El modo de pensamiento está activado por defecto y el texto de razonamiento se devuelve separado de la respuesta final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas de atención lineal Gated-DeltaNet + 8 capas de atención completa |
| Parametros totales | 9B (aproximado, según denominación del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible como GGUF/AWQ; en este paquete se sirve con proyecciones bfp4, caché KV y LM head en bfp8 |
| Idiomas soportados | No disponible (la model card del paquete no los enumera) |
| Licencia | MIT (pesos, Xiaomi); código de port y serving en Apache-2.0 |
| Formato de pesos | Pesos originales de Hugging Face descargados en tiempo de despliegue; el repo empaqueta manifiesto y código de serving, no los pesos (tamaño del repo: 5,9 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que alterna capas de atención lineal Gated-DeltaNet (24 capas) con capas de atención completa (8 capas). Este diseño reduce el coste computacional y de memoria del contexto largo, permitiendo alcanzar 262.144 tokens de ventana. El modelo parte de Qwen3.5-9B, cuya entrada de visión no se ha portado en este paquete (el modelo servido es solo texto).

El entrenamiento consistió en un ajuste fino supervisado (SFT) realizado por Xiaomi sobre datos generados por MiMo-V2.6. La model card del paquete no detalla el volumen de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO; indica únicamente que el checkpoint upstream es una release SFT publicada como punto de partida de investigación. El paquete de Tenstorrent añade un parser de razonamiento (`mimo`) que separa el bloque de pensamiento del contenido final, con un presupuesto de 1.024 tokens de razonamiento por respuesta (`MIMO_THINK_BUDGET`) y un guardián de bucles (`MIMO_LOOP_GUARD`).

## Capacidades

- Generación de texto y razonamiento paso a paso con modo de pensamiento activado por defecto; el texto de razonamiento se entrega en `reasoning_content`, separado de `content`.
- Razonamiento matemático y aritmético de varios pasos (evaluado con GSM8K-CoT).
- Seguimiento de instrucciones (evaluado con IFEval).
- Tareas de código y de estilo agente en formato de texto, según el uso previsto declarado.
- Contexto largo de hasta 262.144 tokens para conversaciones y documentos extensos.
- API compatible con OpenAI: chat completions, completions y `/v1/models`.
- Sin soporte de tool calling: no hay parser de llamadas a herramientas configurado, por lo que el campo `tools` de una petición no se transforma en `tool_calls`.
- Sin entrada de imagen: la visión del modelo base Qwen3.5 no está portada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento interactivo con contexto largo: un único usuario puede trabajar con documentos de hasta 262.144 tokens en el perfil `single`, que ofrece la máxima velocidad de decodificación (44,9 tok/s por usuario) y un TTFT de 461 ms para prompts de 4.096 tokens.
- Asistencia en matemáticas y problemas de varios pasos: el modo de pensamiento separado permite mostrar el razonamiento al usuario mientras se entrega una respuesta limpia, adecuado para tutoría o verificación de cálculos.
- Generación y revisión de código en pipelines de texto: el modelo puede integrarse en flujos de revisión o generación de parches mediante la API compatible con OpenAI, siempre que no se requiera tool calling.
- Despliegue en hardware Tenstorrent: organizaciones con aceleradores p150 pueden servir el modelo sin GPUs NVIDIA, usando `tt serve` o `tt-model serve` y el perfil `batch32` para hasta 32 usuarios concurrentes.
- Servicio multiusuario de razonamiento en lote: con el perfil `batch32` (32 secuencias concurrentes, 166 tok/s agregados) es viable procesar lotes de consultas de razonamiento o evaluación automatizada.
- Evaluación comparativa de precisión reducida: útil para estudiar el impacto de bfp4/bfp8 frente a bf16 en tareas de razonamiento, ya que el paquete documenta explícitamente que las salidas difieren de la referencia.
- Prototipado de asistentes conversacionales de contexto largo: la ventana de 262.144 tokens permite mantener historiales extensos sin truncamiento, aunque la caché de prefijos está desactivada y cada petición reprocesa el prompt completo.

## Benchmarks y rendimiento

Resultados de evaluación reportados por el paquete (ejecutados a través del endpoint servido, concurrencia 32, muestreo recomendado):

| Evaluación | Resultado | Prompts |
|---|---|---|
| GSM8K-CoT, coincidencia estricta (thinking on, presupuesto 4.096 tokens) | 79,3 % | 256 de 1.319 |
| GSM8K-CoT, extracción flexible | 85,2 % | 256 de 1.319 |
| IFEval, prompt-strict | 65,2 % | 256 de 541 |
| IFEval, instruction-strict | 74,3 % | 256 de 541 |

La model card original de Xiaomi no reporta cifras de GSM8K ni IFEval, por lo que no hay referencia directa para comparar.

Rendimiento de serving medido en p150 con contexto completo de 262.144 tokens habilitado:

| Perfil | ISL | OSL | Concurrencia | TTFT (ms) | Prefill tok/s/u | Decode tok/s/u | E2EL (s) |
|---|---|---|---|---|---|---|---|
| single | 4.096 | 128 | 1 | 461 | 8.890 | 44,9 | 3,3 |
| batch32 | 4.096 | 128 | 32 | 14.900 | 275 | 13,1 | 24,7 |

TTFT y tiempo por token de salida medidos (22,3 ms y 76,6 ms respectivamente). En el perfil batch32 los 32 prefills se ejecutan secuencialmente, por lo que el TTFT cubre toda la oleada; la salida agregada fue de 166 tok/s. No se registró el número de ejecuciones por fila.

## Requisitos de hardware

- Hardware validado: Tenstorrent p150 (un chip Blackhole). No se ha validado en otras placas.
- VRAM: no aplica en el sentido de GPU; el despliegue requiere un acelerador p150 y Docker.
- GPUs: no se documentan requisitos para GPU NVIDIA u otras; el paquete está orientado exclusivamente a p150.
- Despliegue: `tt serve ndaly/MiMo-V2.6-Distill-Qwen-9B` (CLI de Tenstorrent, instalable con `uv tool install tenstorrent`) o `tt-model serve ndaly/MiMo-V2.6-Distill-Qwen-9B`. Servidor OpenAI-compatible en el puerto 20000 (o el siguiente libre). La primera ejecución compila kernels y tarda varios minutos.
- Perfiles de servicio: `single` (max_num_seqs 1, máxima velocidad interactiva) y `batch32` (por defecto, hasta 32 usuarios concurrentes), ambos con max_model_len 262.144.
- Latencia y throughput: ver tabla de benchmarks (TTFT de 461 ms en single y 14,9 s en batch32 para prompts de 4.096 tokens; 44,9 tok/s por usuario en single y 166 tok/s agregados en batch32).
- La caché de prefijos está desactivada: cada petición reprocesa el prompt desde cero.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B (este paquete) | 9B | 262.144 | MIT | Paquete para Tenstorrent p150 | Precisión reducida bfp4/bfp8; sin tool calling ni visión |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (upstream) | 9B | 262.144 | MIT | Hugging Face | Pesos de referencia en precisión completa; sin datos de benchmarks en la información disponible |
| Qwen3.5-9B (modelo base) | 9B | No disponible | No disponible | Hugging Face | Incluye entrada de visión, no portada en este paquete |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Validado únicamente en p150 (un chip Blackhole); no hay soporte documentado para otras placas.
- Sin entrada de imagen: la visión del modelo base Qwen3.5 no está portada.
- Sin tool calling: no hay parser configurado; el campo `tools` de las peticiones se ignora y no se generan `tool_calls`.
- El razonamiento se limita a 1.024 tokens por respuesta; cadenas más largas se cierran y se emite la respuesta. Un guardián de bucles detiene respuestas que empiezan a repetirse.
- Caché de prefijos desactivada: cada petición reprocesa el prompt completo; con 32 usuarios los prefills son secuenciales y el TTFT para prompts de 4.096 tokens ronda los 15 s.
- Los pesos se ejecutan en precisión reducida (bfp4 en proyecciones, bfp8 en caché KV y LM head), por lo que las salidas difieren de la referencia en Hugging Face.
- El checkpoint upstream es una release SFT publicada por Xiaomi como punto de partida de investigación; debe revisarse la model card original antes de usarlo en producción.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia MIT para los pesos y Apache-2.0 para el código de port y serving, lo que permite uso comercial, pero las diferencias de precisión y la falta de validación fuera de p150 deben tenerse en cuenta.

## Enlaces

- Repositorio del paquete: https://huggingface.co/ndaly/MiMo-V2.6-Distill-Qwen-9B
- Modelo upstream: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Discusiones del paquete: https://huggingface.co/ndaly/MiMo-V2.6-Distill-Qwen-9B/discussions
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (tt-cli): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
