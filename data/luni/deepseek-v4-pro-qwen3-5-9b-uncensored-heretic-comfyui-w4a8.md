# Luni/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-ComfyUI-W4A8

## Resumen

Luni/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-ComfyUI-W4A8 es una distribucion cuantizada del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, empaquetada como un unico fichero nativo de ComfyUI en formato W4A8. El autor, Luni, publica este artefacto como reemplazo directo del fichero `qwen3.5_9b_w4a8_gptq.safetensors` de Comfy-Org, pensado para nodos de mejora de prompts (prompt enhancers) dentro de flujos de trabajo de generacion de imagen y video en ComfyUI.

El modelo subyacente es un fine-tune de la familia Qwen3.5 con aproximadamente 9.000 millones de parametros, segun indica el nombre del repositorio, y sobre el que se ha aplicado un proceso de "abliteration" (eliminacion de rechazos) que el autor etiqueta como "heretic" y "uncensored". La ficha tecnica del modelo base no esta disponible en la informacion proporcionada, por lo que los detalles sobre datos de entrenamiento, contexto nativo o composicion del dataset no pueden confirmarse.

La relevancia de esta publicacion es fundamentalmente practica: ofrece una version de 7,3 GB lista para cargar en ComfyUI con cuantizacion mixta (int4 + fp8 para las capas de lenguaje, int8 para embeddings y `lm_head`, bf16 para la torre de vision y la cabeza MTP), manteniendo decodificacion especulativa MTP y un rendimiento reportado de aproximadamente 280 tokens por segundo en una RTX 5090, identico al fichero oficial de Comfy-Org. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun nombre del modelo); detalles no disponibles |
| Parametros totales | ~9B (segun denominacion del repositorio) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8: int4 con escalas fp8 de grupo 16 y convrot 256 en capas de lenguaje; int8 convrot en `lm_head` y embeddings; bf16 en torre de vision y cabeza MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors nativo de ComfyUI (fichero unico) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. El nombre del repositorio sugiere una base Qwen3.5 de ~9B parametros, sobre la que se ha aplicado un fine-tune orientado a eliminar comportamientos de rechazo ("heretic", "uncensored"). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o abliteration directa sobre los pesos.

El artefacto publicado por Luni es una conversion cuantizada, no un entrenamiento nuevo. La innovacion tecnica destacable es el esquema de cuantizacion mixta: las capas de lenguaje usan int4 con escalas fp8 por grupo de 16 y rotacion de convolucion de 256 (convrot 256), mientras que `lm_head` y embeddings se mantienen en int8 y la torre de vision y la cabeza MTP (multi-token prediction) permanecen en bf16. Esta mezcla preserva la decodificacion especulativa MTP, que el autor confirma que funciona con `mtp: auto`, y mantiene la paridad de rendimiento con el fichero oficial de Comfy-Org.

## Capacidades

- Generacion de texto y mejora de prompts: disenado explicitamente como reemplazo del text encoder en el nodo Load CLIP para prompt enhancers en ComfyUI.
- Vision: el modelo incorpora una torre de vision en bf16, lo que sugiere capacidades multimodales de entrada de imagen, aunque no se detalla su alcance.
- Decodificacion especulativa MTP: soportada y funcional con `mtp: auto`.
- Generacion sin restricciones de contenido: el fine-tune "uncensored/heretic" elimina los rechazos del modelo base, lo que permite generar contenido que el modelo original bloquearia.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Mejora de prompts en ComfyUI: se coloca en `ComfyUI/models/text_encoders/` y se carga con el nodo Load CLIP para expandir y enriquecer prompts de generacion de imagen o video. Es su caso de uso principal y para el que fue empaquetado.
- Sustitucion directa del fichero oficial W4A8: al compartir formato con `qwen3.5_9b_w4a8_gptq.safetensors` de Comfy-Org, permite intercambiarlo sin reconfigurar el grafo, util para comparar comportamientos entre el modelo censurado y el heretic.
- Generacion de prompts creativos sin filtros: el caracter uncensored permite producir descripciones para estilos artisticos, temas oscuros o contenido adulto que los modelos alineados rechazan, dentro de los limites legales de cada jurisdiccion.
- Prototipado de pipelines de imagen con vision: la torre de vision en bf16 permite experimentar con entrada de imagen para generar descripciones o prompts derivados, aunque la documentacion no detalla la interfaz exacta.
- Despliegue en hardware consumer de gama alta: con 7,3 GB en disco y ~280 tok/s en RTX 5090, es viable en estaciones de trabajo con una sola GPU consumer para generacion de prompts en tiempo casi real.
- Investigacion sobre abliteration y cuantizacion: permite estudiar como afecta la cuantizacion W4A8 mixta al comportamiento de un modelo sometido a eliminacion de rechazos, comparando con el base en bf16.
- Automatizacion de lotes de generacion: su throughput en GPU moderna lo hace adecuado para procesar grandes volumenes de prompts en pipelines por lotes de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es el siguiente:

| Metrica | Valor | Hardware |
|---|---|---|
| Throughput de generacion | ~280 tok/s | RTX 5090 |

El autor indica que este rendimiento es identico al del fichero oficial W4A8 de Comfy-Org, lo que confirma que la conversion no introduce penalizacion medible en la GPU citada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El fichero ocupa 7,3 GB en disco; en inferencia, la VRAM necesaria sera superior por activaciones y cache KV, y dependera de la longitud de contexto configurada.
- GPU recomendadas: el autor reporta resultados en RTX 5090. Por el tamano (~9B en W4A8), deberia caber en GPU consumer con 12-16 GB de VRAM, aunque no se confirma en la informacion disponible.
- Cabe en GPU consumer: si, segun el esquema de cuantizacion y el tamano del fichero; la RTX 5090 esta confirmada por el autor.
- Opciones de despliegue: ComfyUI (nodo Load CLIP, formato nativo). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato de fichero unico de ComfyUI no es directamente compatible con ellos.
- Latencia y throughput: ~280 tok/s en RTX 5090 con decodificacion especulativa MTP activada (`mtp: auto`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Luni/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-ComfyUI-W4A8 | ~9B | no disponible | W4A8 mixta | Apache 2.0 | safetensors ComfyUI | Fine-tune uncensored, MTP funcional, ~280 tok/s en RTX 5090 |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9B | no disponible | no disponible (probablemente bf16/fp16) | no disponible | no disponible | Modelo base del que deriva esta conversion |
| Comfy-Org qwen3.5_9b_w4a8_gptq | ~9B | no disponible | W4A8 | no disponible | safetensors ComfyUI | Fichero oficial de referencia; mismo rendimiento reportado |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparados en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Modelo "uncensored/heretic": ha sido modificado para eliminar rechazos, por lo que puede generar contenido danino, ilegal o sexualmente explicito. Requiere moderacion externa en cualquier despliegue publico.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el proceso de abliteration puede degradar la coherencia y la fidelidad factual respecto al modelo base.
- Sin datos de benchmarks: no hay evidencia publicada sobre MMLU, HumanEval, GSM8K ni otras metricas, lo que impide evaluar su calidad objetiva frente a alternativas.
- Idiomas y contexto desconocidos: no se especifican los idiomas soportados ni la longitud de contexto nativa, lo que limita la planificacion de despliegues multilingues o de contexto largo.
- Formato especifico de ComfyUI: el fichero unico no es directamente utilizable en vLLM, llama.cpp u otros runners; esta atado al ecosistema ComfyUI.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion comunitaria y el soporte disponible.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del fine-tune ni sobre posibles reclamaciones derivadas del contenido generado.
- Origen del modelo base incierto: el nombre "DeepSeek-V4-Pro-Qwen3.5" combina denominaciones de dos familias distintas; no se confirma en la informacion disponible cual es la arquitectura real subyacente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Luni/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-ComfyUI-W4A8
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Referencia del formato oficial W4A8 de Comfy-Org: `qwen3.5_9b_w4a8_gptq.safetensors` (no se proporciona URL en la informacion disponible)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
