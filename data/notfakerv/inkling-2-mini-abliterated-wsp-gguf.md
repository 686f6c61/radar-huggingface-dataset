# notfakerv/Inkling-2-Mini-Abliterated-WSP-GGUF

## Resumen

Inkling-2-Mini-Abliterated-WSP-GGUF es una versión modificada del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario notfakerv en formato GGUF con cuantización Q4_K_M. La modificación no emplea fine-tuning ni LoRA: se aplica weight-space programming (WSP), una técnica de edición de pesos sin gradientes que lee direcciones de activación del propio modelo sobre unos cientos de prompts y las escribe en un conjunto reducido de matrices. El resultado es un modelo al que se le ha eliminado deliberadamente el comportamiento de rechazo (refusal) y buena parte de las respuestas evasivas o hedged.

El modelo base tiene 26.070.385.152 parámetros, arquitectura MoE (según los tags) y pipeline image-text-to-text, lo que indica capacidades multimodales de entrada. Esta versión GGUF está pensada para su uso con llama.cpp y LM Studio, y declara compatibilidad con endpoints. El autor reporta que mantiene el rendimiento en GSM8K y HumanEval dentro de los márgenes pre-registrados respecto al modelo original y a otras variantes abliterated.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de modificación de pesos (WSP) aplicada a un modelo MoE multimodal; por otro, es un caso claro de modelo con la seguridad eliminada, liberado explícitamente para investigación, red-teaming y estudio de mecanismos de rechazo, con advertencias explícitas sobre su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (según tags); transformer multimodal image-text-to-text |
| Parámetros totales | 26.070.385.152 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (única publicada en este repo) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal (pipeline image-text-to-text) de aproximadamente 26.000 millones de parámetros. Esta versión no ha sido reentrenada: parte de los pesos del modelo original y aplica weight-space programming (WSP), una edición de pesos sin gradientes ni LoRA. El procedimiento consiste en extraer direcciones de activación del propio modelo sobre unos cientos de prompts y escribir esas direcciones en un conjunto pequeño de matrices, eliminando el comportamiento de rechazo y reduciendo el hedging.

El autor declara que la cuantización se realizó con el mismo conversor, receta Q4_K_M e imatrix que usó para comparar con la variante de Blackfrost, y que la comparación con OrcaRouter no pudo hacerse con cuantización emparejada porque este último no publicó pesos BF16. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre su composición de dataset, ni sobre si hubo RLHF/DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno (tag conversational).
- Procesamiento de imagen y texto como entrada (pipeline image-text-to-text).
- Razonamiento matemático: el autor reporta 97,0% en GSM8K (200 problemas) en su harness.
- Generación de código: 93,3% en HumanEval (164 problemas) según el autor.
- Modo de razonamiento con `reasoning_effort` (el autor menciona `reasoning_effort: low` en comparaciones).
- Respuestas directas sin rechazo ni hedging en la gran mayoría de prompts dañinos evaluados (77,8% de respuestas completas).
- Capacidad de responder a prompts seguros que parecen inseguros (XSTest: 100,0% respondidos).
- Compatibilidad con endpoints (tag endpoints_compatible) y con llama.cpp / LM Studio.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo sirve para probar mecanismos de rechazo y estudiar qué respuestas emite un modelo sin salvaguardas, comparándolo con el stock y otras variantes abliterated bajo el mismo harness.
- Investigación sobre refusal mechanisms: permite analizar qué direcciones de activación codifican el rechazo y cómo se pueden editar sin gradientes, usando WSP como método reproducible.
- Estudio de robustez de clasificadores: generar respuestas que un modelo alineado rechazaría permite entrenar y evaluar clasificadores de contenido y filtros de salida.
- Evaluación comparativa de técnicas de abliteration: el autor proporciona un protocolo pre-registrado (162 prompts, bootstraps pareados) que puede replicarse para comparar WSP con otras técnicas.
- Pruebas de pipelines de inferencia GGUF: validar llama.cpp, LM Studio y endpoints compatibles con un MoE multimodal cuantizado a Q4_K_M en un repo de 18,1 GB.
- Investigación sobre hedging y sobre-refusal: medir la tasa de respuestas evasivas en modelos alineados frente a versiones editadas, usando XSTest y los criterios del autor.
- Docencia y divulgación: ilustrar de forma controlada qué ocurre cuando se eliminan las salvaguardas de un modelo, siempre en entornos aislados y con las advertencias correspondientes.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (162 prompts dañinos retenidos, un sample cada uno, juez leyendo hasta 8000 caracteres; XSTest 250 prompts seguros; GSM8K 200 problemas; HumanEval 164 problemas; llama.cpp; temperatura 1.0, top-k 50, top-p 1.0, min-p 0, seed base 0):

| Modelo | Respuesta completa | Hedged | Rechazado | Sin respuesta (cap) | XSTest respondido | GSM8K | HumanEval | KLD vs stock | PPL |
|---|---|---|---|---|---|---|---|---|---|
| Stock Inkling 2 Mini | 0,6% | 17,9% | 81,5% (132) | 0,0% | 98,8% | 95,0% | 93,9% | 0 (referencia) | 6,50 |
| Blackfrost Derisked | 43,2% | 53,1% | 3,1% (5) | 0,6% | 99,6% | 96,5% | 93,3% | 0,018 | 6,56 |
| OrcaRouter abliterated | 29,0% | 69,1% | 1,9% (3) | 0,0% | 99,6% | 96,5% | 90,2% | 0,096 | 6,95 |
| OrcaRouter abliterated, effort low | 24,1% | 73,5% | 2,5% (4) | 0,0% | - | - | - | - | - |
| Este modelo (WSP v3) | 77,8% | 18,5% | 1,2% (2) | 2,5% | 100,0% | 97,0% | 93,3% | 0,034 | 6,62 |

Veredicto pre-registrado del autor (diferencia en tasa de respuesta completa frente a cada comparador, puntos porcentuales [IC 95%], ventana primaria de 8000 caracteres): +77,2 [+70,4, +83,3] frente a stock; +34,6 [+25,9, +43,2] frente a Blackfrost; +48,8 [+40,1, +56,8] frente a OrcaRouter; +53,7 [+45,7, +61,7] frente a OrcaRouter en effort low. Los guards de XSTest, GSM8K y HumanEval se mantienen dentro de los márgenes pre-registrados (-3 y -5 puntos). El autor declara el criterio global como "met" frente a los tres comparadores.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 15-17 GB para los pesos (repo de 18,1 GB), más overhead de contexto KV; con contexto moderado, un total en torno a 18-22 GB es razonable, aunque el dato exacto no está publicado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegues con contexto largo; RTX 4090 (24 GB) puede alojar el modelo en Q4_K_M con contexto limitado.
- GPU de consumo: cabe en RTX 4090 y, con contexto reducido, en GPUs de 24 GB; en 16 GB (RTX 4080, 4070 Ti Super) es ajustado y probablemente requiera offload parcial a CPU.
- Opciones de despliegue: llama.cpp, LM Studio (tags del repo), servidores compatibles con endpoints; no se mencionan vLLM ni TGI para este formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Respuesta completa (162 prompts) | GSM8K | HumanEval | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Este modelo (WSP v3) | 26,07 B | no disponible | 77,8% | 97,0% | 93,3% | apache-2.0 | GGUF Q4_K_M |
| Stock Inkling 2 Mini | 26,07 B | no disponible | 0,6% | 95,0% | 93,9% | apache-2.0 (base) | BF16 (referencia) |
| Blackfrost Derisked | 26,07 B | no disponible | 43,2% | 96,5% | 93,3% | no disponible | GGUF (misma receta) |
| OrcaRouter abliterated | 26,07 B | no disponible | 29,0% | 96,5% | 90,2% | no disponible | GGUF Mix-16G |

## Limitaciones y advertencias

- El comportamiento de seguridad ha sido eliminado deliberadamente: el modelo cumplirá peticiones que el original rechaza, incluidas las dañinas, ilegales u ofensivas. El autor lo libera solo para investigación, red-teaming, estudio de mecanismos de rechazo y robustez.
- Riesgo alto de alucinación y de generar contenido dañino; requiere salvaguardas propias antes de cualquier despliegue.
- Solo soporta inglés según la model card; no se declaran otros idiomas.
- El tamaño de contexto no está documentado en la información disponible.
- Solo se publica Q4_K_M; no hay otras cuantizaciones en este repo.
- La licencia apache-2.0 permite uso comercial, pero el propio autor advierte que el uso comercial sin filtros adicionales es irresponsable y que las salidas no representan a los autores ni a Thinking Machines.
- Las métricas de benchmarks provienen del propio autor y de su harness (llama.cpp, sampling fijo, juez automático); no se han validado de forma independiente.
- La comparación con OrcaRouter no usa cuantización emparejada porque este no publicó pesos BF16, por lo que su KLD incluye el efecto de su cuantización.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/notfakerv/Inkling-2-Mini-Abliterated-WSP-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blackfrost Derisked: https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked
- OrcaRouter abliterated GGUF: https://huggingface.co/orcarouter/Inkling-2-Mini-abliterated-GGUF
