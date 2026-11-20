# ML-Intern-lab/Qwen3.5-0.8B-weight-space-programming

## Resumen

Qwen3.5-0.8B-weight-space-programming es un checkpoint derivado de Qwen/Qwen3.5-0.8B en el que se ha aplicado una edicion directa de pesos ("weight-space programming") en lugar de un entrenamiento convencional. Un modelo de lenguaje de frontera, denominado "Astra" en la documentacion, leyo los pesos del modelo base, diagnostico una patologia de repeticion y bucle, y edito manualmente 131.072 pesos: 64 columnas de salida MLP en cada una de las capas 15 y 19, concretamente en `down_proj`. No hubo descenso de gradiente, ni fine-tuning, ni entrenamiento de ningun tipo.

El problema que resuelve es concreto y medible: el modelo base entra en bucles de repeticion hasta agotar el limite de tokens en casi cualquier problema matematico. El modelo editado rompe ese comportamiento, pasando de un 5,0 % de acierto en un smoke test de 25 problemas de MATH-500 a un 51,0 % en la evaluacion completa, y reduciendo las respuestas truncadas al limite de 32k tokens del 95 % al 31,6 %.

La relevancia es doble. Por un lado, demuestra empiricamente que una intervencion quirurgica sobre pesos puede corregir fallos de comportamiento sin coste de entrenamiento. Por otro, el autor publico el diff bit-exacto de la edicion y este checkpoint se reconstruyo con su propio `apply_edit.py`, verificando por sha256 que los tensores reconstruidos coinciden con los evaluados. Es, por tanto, un artefacto reproducible y auditable, no una caja negra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), con torre de vision y modelo de lenguaje; pesos editados en `down_proj` de las capas 15 y 19 |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 34.816 tokens (`max_model_len` en el ejemplo de vLLM); el protocolo de evaluacion usa hasta 32.768 tokens nuevos de generacion |
| Tipos de cuantizacion | no disponible (el ejemplo oficial usa `bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-0.8B: un transformer multimodal con pipeline image-text-to-text, que incluye una torre de vision y un modelo de lenguaje. La intervencion se limita a dos tensores del modelo de lenguaje: `model.language_model.layers.15.mlp.down_proj.weight` y `model.language_model.layers.19.mlp.down_proj.weight`. En cada uno se editaron 64 columnas de salida del MLP, sumando 131.072 pesos modificados. El resto de tensores es identico al release publico del modelo base (commit `2fc06364715b967f1860aea9cf38778875588b17`).

No hay entrenamiento, ni RLHF, ni DPO, ni datos de entrenamiento asociados a este checkpoint. La "innovacion tecnica" es precisamente la metodologia: edicion directa del espacio de pesos guiada por un LLM de frontera que diagnostica la patologia de repeticion y aplica una correccion localizada. La reconstruccion se realizo con el script `apply_edit.py` del autor, que verifica por sha256 cada tensor reconstruido contra el checkpoint efectivamente evaluado; ambos tensores pasaron la verificacion. La evaluacion se ejecuto con vLLM 0.33.0, transformers 5.20.2 y math-verify 0.9.0, con thinking activado, temperatura 0,6, top_p 0,95, top_k 20, presence_penalty 1,5, semilla 0 y hasta 32.768 tokens nuevos. Una salvedad declarada: el experimento original evaluo una exportacion solo-texto; este checkpoint es el release multimodal completo, con tensores del modelo de lenguaje identicos (verificados por hash) y una torre de vision que los prompts de texto no utilizan.

## Capacidades

- Generacion de texto conversacional con plantilla de chat de Qwen3.5 y modo thinking activable (`enable_thinking=True`).
- Razonamiento matematico paso a paso con formato de respuesta final en `\boxed{}`, que es el protocolo con el que se midio la mejora.
- Entrada image-text-to-text por herencia del modelo base, aunque la evaluacion publicada es exclusivamente de texto.
- Correccion del fallo de repeticion/bucle del modelo base en problemas matematicos, que es la capacidad central de este checkpoint.
- No consta soporte explicito de tool calling ni function calling en la informacion disponible.
- No consta soporte de agentes o multi-step reasoning mas alla del razonamiento interno del modo thinking.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de metodos de edicion de pesos: usar este checkpoint como referencia reproducible para comparar tecnicas de weight-space programming frente a fine-tuning, ya que el diff bit-exacto y el pipeline de verificacion por sha256 estan publicados.
- Investigacion sobre patologias de repeticion en LLM pequenos: el par base/editado permite aislar el efecto de 131.072 pesos concretos en el comportamiento de bucle, con metricas antes/despues sobre MATH-500.
- Razonamiento matematico en entornos con recursos limitados: con 0,87B parametros y licencia Apache 2.0, puede desplegarse en una sola GPU para resolver problemas de MATH-500 con un 51,0 % de acierto, sin depender de modelos de mayor tamano.
- Docencia y demostraciones: el Space `akhaliq/weight-space-programming-demo` permite mostrar en vivo como el modelo base entra en bucle mientras el editado resuelve el problema, un caso didactico directo sobre que hacen los pesos.
- Validacion de pipelines de evaluacion: el repositorio incluye `eval/` con resultados crudos, puntuaciones por problema y generaciones de muestra de 2.000 generaciones (43,4M tokens), util para contrastar implementaciones de math-verify y protocolos de grading con `\boxed{}`.
- Prototipado de asistentes conversacionales con contexto largo: los 34.816 tokens de ventana permiten conversaciones multi-turno extensas en un modelo que cabe en hardware modesto.
- Base para nuevas ediciones quirurgicas: al estar verificada la correspondencia tensor a tensor con el modelo base, sirve como punto de partida controlado para experimentos que apliquen ediciones adicionales sobre las mismas capas.

## Benchmarks y rendimiento

Evaluacion con el protocolo del post: vLLM, thinking on, temperatura 0,6, top_p 0,95, top_k 20, presence_penalty 1,5, max 32.768 tokens nuevos, semilla 0, ultimo `\boxed{}` evaluado con math-verify 0.9.0.

| Metrica | Qwen3.5-0.8B base | Este modelo |
|---|---|---|
| Precision MATH-500 | 5,0 % (smoke de 25 problemas); post: 7,9 | 51,0 % (post: 48,1) |
| Respuestas cortadas a 32k tokens | 95 % (smoke); post: 93,0 | 31,6 % (post: 33,1) |

La cifra del 51,0 % corresponde a MATH-500 completo: 500 problemas x 4 muestras = 2.000 generaciones, 43,4M tokens generados, 51 minutos en una NVIDIA H200. Los resultados crudos, por problema y las generaciones de muestra estan en el directorio `eval/` del repositorio.

## Requisitos de hardware

- VRAM estimada: con 873.438.784 parametros en bfloat16, los pesos ocupan aproximadamente 1,75 GB; el repo pesa 1,8 GB. Hay que sumar cache KV para hasta 34.816 tokens de contexto, que depende del numero de capas y cabezas (no disponible en la informacion proporcionada).
- GPU recomendadas: la evaluacion oficial se ejecuto en una NVIDIA H200. Para inferencia interactiva, cualquier GPU con al menos 8-12 GB de VRAM deberia bastar en bfloat16 con contexto moderado.
- GPU de consumo: si, cabe en tarjetas de consumo modernas (por ejemplo, RTX 4090 de 24 GB) en bfloat16; en GPUs con menos VRAM seria necesario reducir el contexto o cuantizar, aunque no se documentan recetas de cuantizacion para este checkpoint.
- Despliegue: el ejemplo oficial usa vLLM (`LLM(model=ckpt, dtype="bfloat16", max_model_len=34816)`). Al ser un modelo transformers con safetensors, tambien es desplegable con TGI; no se documenta soporte de llama.cpp u Ollama (no habria GGUF publicado).
- Latencia y throughput: no disponibles de forma agregada; como referencia, la evaluacion completo 2.000 generaciones de hasta 32k tokens en 51 minutos en una H200.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-weight-space-programming | 873M | 34.816 | 51,0 % (protocolo del post) | Apache 2.0 | Edicion de pesos sin entrenamiento; multimodal |
| Qwen/Qwen3.5-0.8B (base) | 873M | no disponible | 7,9 % (post) | Apache 2.0 | Entra en bucle en casi todos los problemas matematicos |
| Alternativas de ~1B con razonamiento matematico | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de modelos comparables |

La comparacion mas solida disponible es contra el propio modelo base, con el mismo protocolo de evaluacion y las mismas condiciones de muestreo. No se dispone de datos de otros modelos de tamano similar medidos con este protocolo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar del modelo base, hereda los sesgos de Qwen3.5-0.8B, que no se documentan aqui.
- Riesgo de alucinacion: persiste el riesgo propio de un modelo de 0,87B; el 51,0 % en MATH-500 implica que aproximadamente la mitad de los problemas se resuelven mal.
- El 31,6 % de las respuestas siguen cortandose al limite de 32.768 tokens, es decir, el problema de bucles no esta completamente eliminado, solo reducido.
- La evaluacion publicada es solo de texto; el comportamiento multimodal (torre de vision) no se ha verificado y no forma parte del experimento original.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue mas alla del comportamiento heredado del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el checkpoint es un artefacto de investigacion sobre una edicion concreta; no hay garantias de robustez en produccion.
- El protocolo de evaluacion depende de un grading especifico (ultimo `\boxed{}` con math-verify 0.9.0) y de parametros de muestreo concretos; cambiar estos parametros puede alterar sustancialmente los resultados.
- La correspondencia con el modelo base esta verificada solo para los dos tensores editados; el resto del checkpoint debe tratarse como el release publico de Qwen3.5-0.8B en el commit indicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ML-Intern-lab/Qwen3.5-0.8B-weight-space-programming
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog post "Sparks of Weight Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
- Logs, diffs y codigo de reconstruccion: https://github.com/RikiyaT/lm_understand-logs
- Demo en vivo: https://huggingface.co/spaces/akhaliq/weight-space-programming-demo
- Checkpoint de referencia con resultados de evaluacion: https://huggingface.co/akhaliq/Qwen3.5-0.8B-weight-space-programming
- ML Intern: https://hf.co/chat?mode=ml-intern
