# altertable/vela3-fast-multilingual-onnx-int8

## Resumen

vela3-fast-multilingual-onnx-int8 es un empaquetado en ONNX del modelo de decisión vela3-fast-ml, un ajuste fino multilingüe del backbone de decisión vllm-sr/vela3-fast. El modelo original, desarrollado por KR Labs y vLLM Semantic Router, es un encoder UltraBERT-380M de 0,38B parámetros con licencia Apache-2.0. Altertable continuó su entrenamiento mediante destilación de conocimiento sobre datos de decisión en inglés y traducciones automáticas a francés, alemán, español e italiano (ronda 2 de MLFT, checkpoint `c1-s762`).

La propuesta del modelo no es la generación de texto libre, sino la clasificación zero-shot y la respuesta a preguntas de decisión sobre un estado textual o JSON. Responde dos tipos de pregunta: `choice` (probabilidad por cada opción) y `noul` (sí/no, con p(yes)). Está pensado como componente de enrutamiento semántico y toma de decisiones dentro de pipelines, no como un LLM conversacional.

El artefacto publicado es una exportación a ONNX con cuantización int8 de solo pesos (MatMulNBits, 8 bits, bloque 128, atención densa), pensada para ejecución en CPU sin PyTorch. El grafo ocupa 0,6 MB y los pesos 539 MB, con una cabeza de lectura en fp32 de 12 MB. Soporta hasta 32.768 tokens por pregunta y está disponible bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer UltraBERT-380M (backbone de decisión vela3-fast) |
| Parametros totales | 0,38B (380M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32.768 tokens por pregunta; entradas mayores devuelven `Unsupported` |
| Tipos de cuantizacion | int8 de solo pesos (MatMulNBits, 8 bits, bloque 128, atención densa); cabeza de lectura en fp32 |
| Idiomas soportados | Inglés, francés, alemán, español e italiano |
| Licencia | Apache-2.0 (modelo y código) |
| Formato de pesos | ONNX (`model_int8.onnx` + `model_int8.onnx.data`) y cabeza en `head.npz` (fp32) |

## Arquitectura y entrenamiento

El modelo se basa en un encoder transformer UltraBERT-380M de 0,38B parámetros, heredado de vllm-sr/vela3-fast. Sobre ese backbone, Altertable aplicó un ajuste fino multilingüe mediante destilación de conocimiento sobre datos de decisión en inglés y traducciones automáticas a francés, alemán, español e italiano, correspondiente a la ronda 2 de MLFT con checkpoint `c1-s762`. La exportación a ONNX emplea cuantización int8 de solo pesos con MatMulNBits (8 bits, bloque 128) y atención densa; la cabeza de lectura se mantiene en fp32.

Una innovación destacable es la separación entre grafo y pesos: `model_int8.onnx` (0,6 MB) contiene la topología y `model_int8.onnx.data` (539 MB) los pesos cuantizados, que deben mantenerse en la misma carpeta. El runtime es onnxruntime + tokenizers + numpy, sin dependencia de torch. El modelo procesa una pasada de encoder por pregunta, repitiendo el estado en cada una, y agrupa las preguntas en lotes bajo un presupuesto de tokens.

## Capacidades

- Clasificación zero-shot: devuelve una probabilidad por cada opción definida en una pregunta de tipo `choice`.
- Preguntas booleanas: responde `noul` con p(yes) sobre un estado textual o JSON.
- Decisiones sobre estado estructurado: acepta texto libre o JSON como estado de entrada.
- Multilingüe: procesa estado y/o instrucciones en inglés, francés, alemán, español e italiano; el mejor rendimiento se obtiene con instrucciones y criterios en inglés sobre contenido en otros idiomas.
- Enrutamiento semántico: pensado como componente de decisión en routers semánticos y sistemas de clasificación.
- Procesamiento por lotes: agrupa varias preguntas bajo un presupuesto de tokens con una sola pasada de encoder por pregunta.
- Contexto largo: admite hasta 32.768 tokens por pregunta.
- Ejecución en CPU sin torch: runtime ligero basado en onnxruntime.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica un ticket entrante entre equipos (facturación, técnico, ventas) con probabilidades por opción, como muestra el ejemplo de la model card con un ticket en francés resuelto como `billing` con p 0,992.
- Clasificación de intenciones en asistentes conversacionales: responde preguntas `choice` sobre el mensaje del usuario para dirigirlo al flujo adecuado, con contexto suficiente para conversaciones largas.
- Moderación y filtrado semántico: preguntas `noul` (sí/no) sobre contenido para decidir si cumple una política, con p(yes) como señal calibrada.
- Enrutamiento multilingüe en producción: al cubrir EN/FR/DE/ES/IT con instrucciones en inglés, permite un único componente de decisión para mercados europeos.
- Decisión sobre estados JSON: integrable en pipelines que reciben estado estructurado (por ejemplo, un objeto de pedido o de cuenta) y necesitan una decisión booleana o multiclase.
- Componente de un router semántico: la model card incluye un motor de Decision Index (`VelaOnnxEngine`) para evaluar el modelo dentro de ese kit.
- Despliegue en CPU de bajo coste: con latencias de ~0,3–0,6 s en peticiones cortas sobre una VM compartida de 8 vCPU, encaja en servicios sin GPU.

## Benchmarks y rendimiento

Sonda multilingüe sobre ítems de test de XNLI, PAWS-X y Belebele (nunca vistos en entrenamiento; instrucciones en inglés, contenido localizado; precisión macro sobre las tres tareas), checkpoint PyTorch `c1-s762`:

| Modelo | EN | FR | DE | ES | IT | ML4 (FR/DE/ES/IT) |
|---|---|---|---|---|---|---|
| vela3-fast (base) | 80,9 | 64,8 | 58,6 | 62,7 | 47,6 | 58,4 |
| vela3-fast-ml (este) | 80,2 | 73,0 | 64,8 | 67,5 | 64,1 | 67,3 (umbral ≥ 66,4) |

- Decision Index en inglés preservado: muestra pública emparejada de 11.313 filas (sample8) con 52,2 frente a 52,0 de vela3-fast (umbral ≥ 51,5). El Decision Index público propio de vela3-fast (0,3, ejecución de los autores) es 50,36; no se ejecutó el índice completo para este modelo.
- int8 ONNX frente a PyTorch fp32 (996 filas, mismas filas en ambos): concordancia de respuesta del 99,7 %, |Δp| medio 0,0009 (p95 0,0045); Δ de precisión en sample8 de 0,00 y Δ de precisión en la sonda de −0,39 puntos (umbral: ambos dentro de ±0,5). Se descartó una variante int8 con atención bloqueada (acc4) por un Δ de −0,79 en la sonda.
- Latencia en CPU: peticiones cortas (1–2 preguntas, unos cientos de tokens) de ~0,3–0,6 s en una VM compartida de 8 vCPU (6 hilos, onnxruntime 1.31). Esta build densa int8 (acc0) es ~1,9× más lenta por fila que la build de atención bloqueada descartada sobre el conjunto de paridad (5,8 frente a 3,1 s de media por fila, 8 workers × 4 hilos en n2-highmem-32). El texto no inglés cuesta ~1,7–2,1× más tokens que el inglés.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB en GPU; el modelo está diseñado para CPU. Los pesos int8 ocupan 539 MB y la cabeza fp32 12 MB.
- GPU recomendadas: no aplica; el runtime es onnxruntime en CPU. No se documenta despliegue en GPU.
- ¿Cabe en GPU de consumo? No es el objetivo del empaquetado; el modelo está pensado para ejecución en CPU.
- Opciones de despliegue: onnxruntime (con tokenizers y numpy), sin torch. La model card incluye `vela_onnx.py` como interfaz de inferencia y un motor de Decision Index (`VelaOnnxEngine`).
- Latencia y throughput estimados: ~0,3–0,6 s por petición corta en VM de 8 vCPU con 6 hilos; ~5,8 s de media por fila en el conjunto de paridad con 8 workers × 4 hilos en n2-highmem-32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vela3-fast-multilingual-onnx-int8 (este) | 0,38B | 32.768 tokens/pregunta | EN, FR, DE, ES, IT | Apache-2.0 | ONNX int8 | Empaquetado CPU sin torch; sonda ML4 67,3 |
| vela3-fast (base, vllm-sr) | 0,38B | no disponible | EN (principalmente) | Apache-2.0 | PyTorch | Sonda ML4 58,4; Decision Index público 50,36 |
| altertable/vela3-fast-onnx-int8 | 0,38B | no disponible | EN | Apache-2.0 | ONNX int8 | Hermano solo inglés, pesos vela3-fast sin cambios |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; los datos de entrenamiento incluyen splits de train de MNLI/SNLI/WANLI y traducciones automáticas, lo que puede introducir sesgos de dominio y de traducción.
- Riesgo de alucinación: el modelo no genera texto libre, sino probabilidades de decisión; el riesgo se traslada a clasificaciones erróneas o sobreconfiadas, no a contenido inventado.
- Limitaciones de contexto e idioma: entradas de más de 32.768 tokens por pregunta devuelven `Unsupported`; el texto no inglés consume ~1,7–2,1× más tokens; el mejor rendimiento se da con instrucciones y criterios en inglés sobre contenido localizado. Las opciones sin descripción se responden con menos fiabilidad.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse LICENSE, NOTICE y LICENSES.md, incluida la atribución al modelo base (KR Labs y vLLM Semantic Router).
- Caveats de procedencia: vela3-fast se entrenó con splits de train de datasets públicos que también son fuentes del Decision Index, y los datos en inglés incluyen MNLI/SNLI/WANLI (relacionados con la tarea XNLI); las traducciones son automáticas. Consultar DATA_CARD.md.
- Rendimiento en producción: la build densa int8 es ~1,9× más lenta por fila que la variante de atención bloqueada descartada; el rendimiento medido corresponde a VMs concretas y puede variar según hardware y número de hilos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/altertable/vela3-fast-multilingual-onnx-int8
- Modelo base: https://huggingface.co/vllm-sr/vela3-fast
- Hermano solo inglés: https://huggingface.co/altertable/vela3-fast-onnx-int8
