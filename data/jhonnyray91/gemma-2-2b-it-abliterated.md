# jhonnyray91/gemma-2-2b-it-abliterated

## Resumen

`jhonnyray91/gemma-2-2b-it-abliterated` es una variante "abliterated" del modelo `google/gemma-2-2b-it` de Google DeepMind, publicada por el usuario jhonnyray91 en Hugging Face. La abliteration es una tecnica de edicion de pesos que elimina la direccion de activacion asociada al rechazo (refusal) en el espacio residual del transformer, de modo que el modelo deja de negarse a responder a peticiones que el modelo original rechazaria. En este caso se ha aplicado la misma metodologia empleada en `IlyaGusev/gemma-2-9b-it-abliterated`, identificando la direccion de rechazo en `resid_mid`, candidato numero 19, capa 15, posicion -1.

El modelo base Gemma 2 2B es un transformer decoder-only de 2.614.341.888 parametros (segun los pesos en safetensors), disenado por Google para inferencia eficiente en hardware consumer. Esta version conserva la arquitectura, el tokenizador y la ventana de contexto del original, pero modifica el comportamiento de alineacion: responde a practicamente cualquier prompt sin filtros de seguridad aprendidos durante el RLHF.

Su relevancia es acotada: se trata de un experimento de investigacion sobre alineacion y mecanismos de rechazo, no de un modelo para produccion. La model card incluye ejemplos de salidas que ilustran el efecto de la abliteration (respuestas detalladas a peticiones daninas o ilegales), lo que debe interpretarse como una advertencia sobre el uso responsable y las implicaciones legales de desplegar este tipo de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), con atencion alterna local/global y soft-capping |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 2 2B soporta 8.192 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision original; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 2B: un transformer decoder-only con atencion por capas alternando atencion local (ventana deslizante) y atencion global, normalizacion RMSNorm pre y post atencion, activacion GeGLU y soft-capping de logits y atencion para estabilizar el entrenamiento. El modelo base fue entrenado por Google con datos mayoritariamente en ingles, seguido de un proceso de instruction tuning y alineacion (RLHF) que introduce el comportamiento de rechazo ante peticiones consideradas daninas.

La modificacion de esta version es puramente post-entrenamiento: se aplica abliteration, una tecnica que calcula la direccion media de las activaciones en respuestas de rechazo frente a respuestas cumplidoras, y proyecta los pesos para eliminar esa direccion. Segun la model card, la direccion se extrajo en `resid_mid`, candidato 19, capa 15, posicion -1, replicando el procedimiento de `IlyaGusev/gemma-2-9b-it-abliterated`. No se ha realizado entrenamiento adicional ni fine-tuning: los pesos son una edicion ortogonal del modelo original. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base en la documentacion proporcionada.

## Capacidades

- Generacion de texto en ingles con calidad equivalente al Gemma 2 2B original en tareas neutras.
- Razonamiento basico y respuesta a preguntas de conocimiento general.
- Generacion de codigo y explicaciones tecnicas (heredadas del modelo base).
- Respuesta a peticiones que el modelo original rechazaria, incluyendo contenido danino, ilegal o sexualmente explicito, tal como ilustran los ejemplos de la model card.
- Soporte de conversacion multi-turno (formato de chat de Gemma 2 IT).
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta modo thinking, vision ni audio.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Investigacion sobre alineacion y seguridad: analizar como la abliteration elimina la direccion de rechazo y que efectos colaterales tiene sobre el resto de capacidades del modelo, comparando respuestas con el Gemma 2 2B IT original.
- Estudio de mecanismos de refusal en transformers pequenos: usar la capa 15 y la direccion `resid_mid` identificadas para reproducir el experimento y validar la metodologia de abliteration en modelos de 2B parametros.
- Red teaming controlado: generar prompts adversarios y evaluar la robustez de clasificadores de seguridad o filtros de contenido frente a modelos desalineados.
- Evaluacion de riesgos en pipelines de moderacion: comprobar si un sistema de filtrado posterior detecta correctamente las salidas de un modelo abliterated antes de desplegarlo.
- Experimentos academicos de interpretabilidad: comparar activaciones internas entre el modelo original y el abliterated para localizar representaciones de conceptos relacionados con seguridad.
- Pruebas de regresion de herramientas de inferencia: validar el comportamiento de vLLM con FlashInfer y FA2 desactivado, tal como documenta el autor, en cargas de trabajo con modelos Gemma 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (bf16/fp16): aproximadamente 5,2 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, unos 6-8 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,7 GB para pesos; en 4 bits, alrededor de 1,4 GB (estimaciones teoricas, no verificadas en la informacion proporcionada).
- GPU recomendadas: NVIDIA A100, H100, L40S para despliegue en produccion; RTX 4090, RTX 3090, RTX 4080 para inferencia local en precision completa.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM en bf16, y en tarjetas con 4-6 GB si se cuantiza (siempre que se generen pesos GGUF o AWQ, no incluidos en el repo).
- Opciones de despliegue: vLLM (el autor menciona vLLM con FA2 desactivado y FlashInfer activado), transformers de Hugging Face, TGI. No se incluyen pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| jhonnyray91/gemma-2-2b-it-abliterated | 2,61 B | no disponible | Gemma Terms of Use | Disponible en HF |
| google/gemma-2-2b-it | 2,61 B | 8.192 tokens (modelo base) | Gemma Terms of Use | Disponible en HF |
| IlyaGusev/gemma-2-9b-it-abliterated | ~9 B | 8.192 tokens (modelo base) | Gemma Terms of Use | Disponible en HF |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Disponible en HF |

La comparativa directa mas relevante es con el Gemma 2 2B IT original: misma arquitectura, mismo tamano y misma licencia, pero con la alineacion de seguridad eliminada. Frente al Gemma 2 9B abliterated de IlyaGusev, esta version es mas ligera y adecuada para entornos con menos VRAM, a costa de menor capacidad de razonamiento. No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina el rechazo ante peticiones daninas: el modelo puede generar instrucciones para actividades ilegales, contenido sexual explicito o material peligroso, como demuestran los ejemplos de la model card.
- Riesgo elevado de alucinacion, heredado del modelo base de 2B parametros y potencialmente agravado por la perdida de coherencia asociada a la edicion de pesos.
- La edicion de pesos puede degradar capacidades generales (razonamiento, codigo, instruction following) de forma no cuantificada; no se han publicado evaluaciones.
- Idiomas: solo ingles segun la model card; el rendimiento en castellano no esta garantizado.
- Licencia Gemma Terms of Use: impone restricciones de uso, obligaciones de atribucion y una politica de uso prohibido que el comportamiento del modelo puede violar facilmente; el usuario es responsable del cumplimiento.
- No apto para produccion ni para aplicaciones orientadas a usuarios finales sin filtros externos robustos.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No se incluyen pesos cuantizados, por lo que el despliegue en hardware limitado requiere conversion manual.
- La model card incluye contenido explicito y potencialmente ilegal en sus ejemplos; debe tratarse con cautela en entornos profesionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jhonnyray91/gemma-2-2b-it-abliterated
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Referencia de metodologia (Gemma 2 9B abliterated): https://huggingface.co/IlyaGusev/gemma-2-9b-it-abliterated
- Blog sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- Script de inferencia vLLM del autor de la metodologia: https://github.com/IlyaGusev/saiga/blob/main/src/infer_vllm.py
