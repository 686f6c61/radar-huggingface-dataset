# sauhsoj/strands-decider-2B-qwen3.5-v1-2610-ONNX

## Resumen

`strands-decider-2B-qwen3.5-v1-2610-ONNX` es una conversión no oficial a ONNX del modelo `StrandsAgents/strands-decider-2B-qwen3.5-v1-2610`, un modelo de decisión de 2B parámetros construido sobre `Qwen/Qwen3.5-2B-Base`. No es un modelo generativo de propósito general: es un clasificador de opciones que, dada una secuencia de entrada y un conjunto de posiciones candidatas (K opciones), devuelve una distribución de probabilidad sobre esas K opciones. El autor de la conversión es `sauhsoj`, y el flujo de trabajo de compilación proviene del proyecto `chrome-tab-decider`.

La relevancia de esta ficha está en que se trata de un artefacto de despliegue en navegador: el modelo se distribuye en formato ONNX con cuantización q4f16 (pesos a 4 bits, activaciones en fp16) y está pensado para ejecutarse con WebGPU y la extensión `shader-f16`. El repositorio ocupa 1,1 GB y se publica bajo licencia Apache-2.0, heredada tanto del modelo base Qwen3.5-2B-Base como del modelo original de StrandsAgents.

Arquitectónicamente conserva el torso del transformer Qwen3.5-2B, elimina la cabeza LM (language modeling) y le añade una cabeza de puntero (pointer head) en fp32 que produce logits sobre las K opciones. La interfaz es puramente de clasificación: `input_ids`, `attention_mask`, `answer_pos` y `option_pos` como entradas, y `logits [B, K]` como salida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (torso Qwen3.5-2B) con cabeza de puntero (pointer head) en fp32; grafo ONNX para onnxruntime |
| Parámetros totales | 2B (heredados del modelo base Qwen3.5-2B-Base); número exacto de parámetros de la cabeza de puntero no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | q4f16: pesos MatMulNBits a 4 bits con bloque 32, activaciones fp16; cabeza de puntero en fp32 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo onnxruntime); `head.safetensors` y `head_config.json` en el flujo de construcción; `selftest.json` con casos de prueba |

## Arquitectura y entrenamiento

El modelo original es un fine-tuning con LoRA sobre `Qwen/Qwen3.5-2B-Base`, orientado a tareas de decisión (selección entre opciones). En el pipeline de construcción descrito en la model card, el script `prepare_model.py` del PR #77 de `strands-labs/strands-decider` fusiona el LoRA en el torso y escribe la cabeza de puntero (`head.safetensors`, `head_config.json`). Posteriormente, los pesos del torso se insertan en los grafos q4f16 de `onnx-community/Qwen3.5-2B-ONNX-OPT`, re-cuantizando cada peso MatMulNBits a 4 bits con bloque 32, se elimina la cabeza LM y se añade la cabeza de puntero en fp32.

La innovación técnica principal es la reutilización de grafos ONNX preexistentes para Qwen3.5-2B y la sustitución de la cabeza de generación por una cabeza de clasificación sobre posiciones de opciones. El modelo no genera texto: recibe `input_ids [B, L]`, `attention_mask [B, L]`, `answer_pos [B]` y `option_pos [B, K]`, y produce `logits [B, K]`. Para obtener probabilidades, se divide por `decider.temperature_by_kind[type]` presente en `config.json` y se aplica softmax. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el modelo original.

## Capacidades

- Clasificación de decisiones: selecciona entre K opciones dadas sus posiciones en la secuencia de entrada, devolviendo una distribución de probabilidad.
- Soporte de temperatura por tipo de decisión mediante `decider.temperature_by_kind` en `config.json`.
- Ejecución en navegador vía ONNX Runtime Web con WebGPU y `shader-f16`.
- Inferencia por lotes (`B`) y longitudes variables (`L`) en el grafo ONNX.
- Casos de prueba de paridad incluidos en `selftest.json` con token ids y posiciones exactas.
- No soporta generación de texto libre, tool calling, agentes multi-paso ni capacidades multimodales (visión, audio) según la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Decisión de pestañas en navegador (chrome-tab-decider): el modelo clasifica qué pestaña debe priorizarse o agruparse, ejecutándose localmente con WebGPU sin enviar datos a un servidor; es adecuado por su tamaño de 1,1 GB y su formato ONNX q4f16.
- Clasificación de opciones en asistentes de navegación: dado un conjunto de opciones (acciones, enlaces, respuestas), el modelo devuelve la probabilidad de cada una, integrándose en flujos de decisión ligeros en el cliente.
- Enrutamiento de intenciones en aplicaciones web: seleccionar entre un conjunto fijo de intenciones o comandos a partir de una entrada de texto, usando la cabeza de puntero sobre posiciones candidatas.
- Filtrado y ranking de candidatos: puntuar K alternativas (por ejemplo, resultados de búsqueda o sugerencias) y ordenarlas por probabilidad tras aplicar softmax con la temperatura configurada.
- Pruebas de paridad y validación de despliegue: usar `selftest.json` para verificar que la inferencia en navegador reproduce los resultados del motor torch en fp32, como parte de pipelines de CI para extensiones.
- Experimentación con modelos de decisión cuantizados: servir como referencia para convertir otros fine-tunings de Qwen3.5-2B a ONNX q4f16 y evaluar la degradación de precisión en tareas de clasificación.
- Despliegue edge sin GPU dedicada: al requerir solo WebGPU con `shader-f16`, puede ejecutarse en equipos de consumo con navegadores compatibles, evitando infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente una tabla de paridad entre el motor torch en fp32 y esta conversión q4f16 sobre siete casos concretos:

| Caso | torch fp32 | esta q4f16 |
|---|---|---|
| payouts/noul | [0.1419, 0.8581] | [0.11, 0.89] |
| payouts/choice | [0.7727, 0.1213, 0.106] | [0.7945, 0.0897, 0.1158] |
| payouts/score | [0.1958, 0.5738, 0.2303] | [0.1755, 0.5497, 0.2748] |
| strawberry | [0.6779, 0.3221] | [0.7337, 0.2663] |
| language | [0.0452, 0.9047, 0.0501] | [0.0557, 0.8788, 0.0655] |
| tabs/dev | [0.5655, 0.0077, 0.004, 0.4228] | [0.4313, 0.006, 0.0029, 0.5598] |
| tabs/coffee | [0.0079, 0.8822, 0.0039, 0.1059] | [0.0117, 0.8426, 0.0042, 0.1415] |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,1 GB en disco; la inferencia q4f16 requiere espacio de pesos y activaciones, pero no se proporciona una cifra exacta de VRAM.
- GPU recomendadas: no disponible; el requisito explícito es WebGPU con soporte de `shader-f16`.
- Cabe en GPU de consumo: sí, siempre que el navegador y la GPU soporten WebGPU con `shader-f16`; no se especifican modelos concretos.
- Opciones de despliegue: ONNX Runtime (CPU y WebGPU) y la extensión `chrome-tab-decider`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| strands-decider-2B-qwen3.5-v1-2610-ONNX (este) | 2B | No disponible | Clasificación de opciones (K logits) | Apache-2.0 | ONNX q4f16 |
| StrandsAgents/strands-decider-2B-qwen3.5-v1-2610 | 2B | No disponible | Clasificación de opciones | Apache-2.0 | safetensors (torch) |
| Qwen/Qwen3.5-2B-Base | 2B | No disponible | Generación de texto (base) | Apache-2.0 | safetensors |
| onnx-community/strands-decider-2B-hobson-v19-ONNX | No disponible | No disponible | Clasificación de opciones | No disponible | ONNX |

## Limitaciones y advertencias

- Es una conversión no oficial: el autor es `sauhsoj`, no StrandsAgents ni Qwen; la paridad con el modelo original se limita a los siete casos de `selftest.json`.
- La cuantización q4f16 introduce desviaciones respecto a fp32; en el caso `tabs/dev` la opción ganadora cambia de probabilidad 0,5655 a 0,4313, lo que puede alterar decisiones en producción.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso.
- Requiere WebGPU con `shader-f16`; sin ese soporte el despliegue en navegador no es viable.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe.
- Longitud de contexto no disponible; entradas largas pueden no estar soportadas por el grafo ONNX.
- Riesgo de sesgos y alucinación heredado del modelo base Qwen3.5-2B-Base y del fine-tuning original; no se documentan evaluaciones de sesgo.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir a los modelos base; verificar las condiciones del modelo original de StrandsAgents.
- El repositorio tiene 43 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/sauhsoj/strands-decider-2B-qwen3.5-v1-2610-ONNX
- Modelo original: https://huggingface.co/StrandsAgents/strands-decider-2B-qwen3.5-v1-2610
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Grafos ONNX de referencia: https://huggingface.co/onnx-community/Qwen3.5-2B-ONNX-OPT
- Conversión de referencia: https://huggingface.co/onnx-community/strands-decider-2B-hobson-v19-ONNX
- Repositorio del flujo de trabajo: https://github.com/jsamuel1/chrome-tab-decider
