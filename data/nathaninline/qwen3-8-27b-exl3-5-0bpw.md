# nathaninline/Qwen3.8-27B-exl3-5.0bpw

## Resumen

Qwen3.8-27B-exl3-5.0bpw es una cuantización EXL3 de 5 bits del modelo Qwen/Qwen3.8-27B, publicada por el usuario nathaninline. El modelo base es un transformer multimodal de la familia Qwen3.5 con 27.000 millones de parámetros nominales, orientado a tareas de image-text-to-text y conversación, y esta cuantización lo empaqueta en formato EXL3 para su uso con ExLlamaV3 y TabbyAPI. El resultado son aproximadamente 19 GB de pesos que incluyen la torre de visión y la cabeza MTP.

La relevancia de esta ficha no esta en el modelo base, sino en la cuantización: el autor publica mediciones de divergencia KL frente a los BF16 originales y comparativas de velocidad contra los GGUF de Unsloth, lo que permite evaluar la pérdida de calidad y la ganancia de rendimiento de forma cuantitativa. Según esos datos, la cuantización EXL3 de 5.0 bpw obtiene una divergencia KL media de 0,0056 frente a BF16, un 20 % inferior a la del GGUF UD-Q5_K_M, y una velocidad de decodificación de 50 tok/s frente a 36,5 tok/s del GGUF en el mismo par de GPUs.

Un dato importante que conviene señalar de entrada: el repositorio declara 27B en el nombre, pero el recuento real de parámetros en los safetensors es de 9.801.569.664, es decir, aproximadamente 9,8B. Esa discrepancia entre el nombre comercial y el tamaño efectivo de los pesos debe tenerse en cuenta al planificar el despliegue y al comparar con otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3.5, con cabeza MTP para decodificación especulativa; cuantización EXL3 |
| Parametros totales | 9.801.569.664 según safetensors (el nombre del repo indica 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el autor reporta que con ~19 GB de pesos caben unos 64k tokens con caché de 8 bits en 24 GB de VRAM, y que 131k no cupo en su configuración |
| Tipos de cuantizacion | EXL3 5.0 bpw (capas del decodificador), 6 bpw en cabeza de salida, 6 bpw en torre de visión, 5 bpw en cabeza MTP, embeddings en 16 bits; ajustes `-b 5.0 -hb 6 -vb 6 -mb 5 --out_scales always` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (igual que el modelo base) |
| Formato de pesos | safetensors en formato EXL3 (librería exllamav3) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3.5 que procesa entradas de imagen y texto y genera texto; la cuantización conserva tanto la torre de visión como la cabeza MTP (multi-token prediction), lo que permite usar decodificación especulativa dentro de ExLlamaV3. El autor no documenta en la model card la arquitectura interna del base (número de capas, dimensión oculta, mecanismo de atención ni detalles del entrenamiento), por lo que esos datos deben consultarse en la ficha del modelo original Qwen/Qwen3.8-27B.

Sobre el proceso de cuantización sí hay información detallada: se aplicaron 5.0 bits por peso en las capas del decodificador, 6 bits en la cabeza de salida y en la torre de visión, 5 bits en la cabeza MTP y 16 bits en los embeddings, con escalas de salida forzadas (`--out_scales always`) y calibración por defecto. El autor mide la calidad de la cuantización con divergencia KL frente a los pesos BF16 sobre WikiText-2 raw (20 filas de 2048 tokens, puntuando la segunda mitad de cada fila, 20.460 tokens) y reporta 0,0056 de media, 0,0012 de mediana y 0,045 en el percentil 99, con un 97,5 % de coincidencia en el token top respecto a BF16. No se documentan datos de entrenamiento, RLHF ni DPO para el modelo base en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, con el modo de razonamiento ("reasoning on") que el autor usa explícitamente en sus pruebas de velocidad.
- Procesamiento de imagen y texto (pipeline image-text-to-text), ya que la cuantización incluye la torre de visión a 6 bpw.
- Decodificación especulativa mediante la cabeza MTP incluida en la cuantización (el autor usa 3 tokens borrador en sus mediciones).
- Razonamiento multi-paso y resolución de problemas, implícito en el uso de modo razonamiento en los prompts de evaluación.
- Generación de código: tres de los cuatro prompts usados en las pruebas de velocidad son de programación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.

## Casos de uso

- Asistente de programación en local: con unos 19 GB de pesos y decodificación de 50 tok/s en un par de GPUs de consumo (RTX 5060 Ti 16 GB + RTX 3070 8 GB), es viable integrarlo en un IDE o CLI para autocompletado y explicación de código sin depender de la nube.
- Atención al cliente con contexto largo: el autor reporta que caben unos 64k tokens de contexto con caché de 8 bits en 24 GB de VRAM, suficiente para conversaciones multi-turno con historial extenso o documentación adjunta.
- Análisis de documentos con imágenes: al conservar la torre de visión, puede procesar capturas, diagramas o formularios escaneados junto con texto en un mismo pipeline image-text-to-text.
- Servicio de inferencia autoalojado: el formato EXL3 esta pensado para ExLlamaV3 y TabbyAPI, de modo que encaja como backend compatible con una API estilo OpenAI para equipos que quieran evitar proveedores externos.
- Evaluación de cuantizaciones en investigación: las mediciones de divergencia KL y velocidad publicadas lo convierten en un punto de referencia útil para comparar EXL3 frente a GGUF en el mismo hardware.
- Prototipado con presupuesto de VRAM ajustado: al incluir visión y MTP en 19 GB, permite probar flujos multimodales y decodificación especulativa en estaciones de trabajo de 24 GB en lugar de exigir GPUs de 80 GB.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Lo que sí publica son métricas de fidelidad de la cuantización y de velocidad, que se recogen a continuación.

| Metrica | UD-IQ4_XS GGUF | UD-Q5_K_M GGUF (llama.cpp) | EXL3 5.0 bpw |
|---|---|---|---|
| Divergencia KL vs BF16, media | 0,0224 | 0,0069 | 0,0056 |
| Divergencia KL vs BF16, mediana | 0,0069 | 0,0014 | 0,0012 |
| Divergencia KL vs BF16, percentil 99 | 0,232 | 0,061 | 0,045 |
| Mismo token top que BF16 | 94,0 % | 97,0 % | 97,5 % |
| Velocidad de decodificación | no disponible | 36,5 tok/s | 50,0 tok/s (1,37x) |
| Tamano de archivo | 14,3 GB (sin visión) | 19,8 GB (sin visión) | 19 GB (con visión) |

Condiciones de medida: RTX 5060 Ti 16 GB + RTX 3070 8 GB, modelo repartido entre ambas GPUs, decodificación especulativa MTP (2 tokens borrador en GGUF, 3 en EXL3), temperatura 1, razonamiento activado, 4 prompts (3 de código, 1 de explicación), 600 tokens cada uno, dos ejecuciones por prompt y media de velocidad de decodificación tras el primer token. En EXL3 se usó un reparto tensor-parallel ajustado (41/59, atención en la tarjeta de 16 GB) y contexto de 64k con caché de 8 bits; con el reparto por defecto el autor advierte que el rendimiento será algo menor.

## Requisitos de hardware

- VRAM estimada: unos 19 GB solo para los pesos; con caché de 8 bits caben aproximadamente 64k tokens de contexto en 24 GB totales. Un contexto de 131k no cupo en la configuración del autor (16 + 8 GB).
- GPUs recomendadas: el autor valida el modelo en una RTX 5060 Ti de 16 GB combinada con una RTX 3070 de 8 GB mediante reparto tensor-parallel. Para contexto largo o mayor comodidad, una GPU única de 24 GB (RTX 4090, RTX 3090) o GPUs de datacenter (A100, H100) son opciones razonables, aunque no se aportan mediciones en ellas.
- ¿Cabe en GPU de consumo? Sí, en configuraciones de 24 GB totales o en multi-GPU de consumo, tal como demuestra el autor.
- Opciones de despliegue: ExLlamaV3 y TabbyAPI son los backends soportados de forma nativa por el formato EXL3. No es compatible con llama.cpp, Ollama ni vLLM sin conversión previa a otro formato.
- Latencia y throughput: 50 tok/s de decodificación de media en el hardware descrito, con picos de 63,6 tok/s y mínimos de 39,8 tok/s en las ejecuciones registradas. No se reportan métricas de prefill ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B EXL3 5.0 bpw (este) | 9,8B según safetensors | ~64k prácticos en 24 GB | EXL3 / safetensors | Apache 2.0 | Incluye visión y MTP; 50 tok/s en el hardware del autor |
| Qwen3.8-27B UD-Q5_K_M GGUF (Unsloth) | no disponible | no disponible | GGUF | Apache 2.0 | 19,8 GB sin visión; 36,5 tok/s; KLD media 0,0069 |
| Qwen3.8-27B UD-IQ4_XS GGUF (Unsloth) | no disponible | no disponible | GGUF | Apache 2.0 | 14,3 GB sin visión; KLD media 0,0224; velocidad no medida |
| Qwen/Qwen3.8-27B (BF16 original) | 27B nominales | no disponible | safetensors | Apache 2.0 | Referencia de calidad; requiere mucha más VRAM |

La comparación se limita a las variantes del mismo modelo base porque la información proporcionada no incluye datos de modelos de otras familias con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Discrepancia de tamaño: el nombre del repositorio indica 27B, pero los safetensors suman 9.801.569.664 parámetros. Conviene verificar el modelo base antes de asumir capacidades asociadas a un modelo de 27B.
- Solo funciona con ExLlamaV3 y TabbyAPI; no es utilizable directamente en llama.cpp, Ollama, vLLM ni TGI.
- El contexto práctico esta limitado por la VRAM: en 24 GB el autor solo consiguió unos 64k tokens con caché de 8 bits, y 131k no cupo.
- La cuantización introduce pérdida de calidad medible: 0,0056 de divergencia KL media y un 2,5 % de posiciones donde el token top difiere de BF16. Aunque es inferior a la del GGUF Q5_K_M, no es una reproducción exacta del modelo original.
- Las mediciones de velocidad se hicieron en un par de GPUs concreto con un reparto tensor-parallel ajustado manualmente; en otras configuraciones el rendimiento puede ser inferior.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento por idioma en la información disponible.
- Licencia Apache 2.0, igual que el modelo base, lo que permite uso comercial; aun así, deben respetarse las condiciones del modelo original Qwen/Qwen3.8-27B.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y fue creado y actualizado el mismo día; se trata de una publicación muy reciente y sin validación comunitaria amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nathaninline/Qwen3.8-27B-exl3-5.0bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de referencia (Unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
