# Allen987/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4

## Resumen

El modelo `Allen987/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4` es una re-cuantización mixta en NVFP4 del text encoder sin censura (Heretic) adaptado para el modelo de generación de video MiniMax-H3. El trabajo de uncensoring y adaptación original fue realizado por Ethanfel, y esta versión NVFP4 ha sido producida por Lna-Lab y publicada en HuggingFace por Allen987. Su objetivo principal es reducir el tamaño del encoder de 26,4 GB (INT8-ConvRot) a 15,7 GB para que quepa en una GPU de 16 GB, democratizando así la generación de video con MiniMax-H3 en hardware más asequible.

La arquitectura subyacente corresponde al text encoder de Qwen3-VL-32B, adaptado para MiniMax-H3 y empaquetado para ComfyUI. El modelo se presenta como un reemplazo directo del encoder NVFP4 censurado de Comfy-Org, manteniendo el mismo tamaño y la misma interfaz de carga en ComfyUI. La relevancia actual radica en que permite ejecutar workflows de generación de video con MiniMax-H3 sin necesidad de GPUs de centro de datos, manteniendo la salida visual equivalente al build INT8 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (text encoder Qwen3-VL-32B adaptado para MiniMax-H3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (mixto: 350 capas lineales en NVFP4, embed_tokens en INT8) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (qwen3vl_32b_heretic_minimax_h3_nvfp4.safetensors) |

| Parametro adicional | Valor |
|---|---|
| Tamano del repositorio | 15,7 GB |
| Modelo base | ethanfel/Qwen3-VL-32B-Ultra-Heretic-MiniMax-H3-ComfyUI-INT8-ConvRot |
| Libreria | comfyui |
| Uso previsto | Text encoder para generacion de video MiniMax-H3 |

## Arquitectura y entrenamiento

El modelo es una re-cuantizacion del text encoder de Qwen3-VL-32B, que ha sido adaptado para funcionar como codificador de texto en el pipeline de generacion de video MiniMax-H3. La version original upstream utiliza una rotacion de pesos (ConvRot) con grupos de 256, donde cada peso se almacena pre-multiplicado por una matriz de Hadamard normalizada (`W_stored = W @ Hᵀ`). Para esta re-cuantizacion, los pesos fueron desrotados multiplicando de nuevo por la matriz de Hadamard antes de re-cuantizarlos a NVFP4, evitando asi que la condicion generada sea incoherente con el prompt.

No se ha realizado entrenamiento adicional en este modelo; se trata de una transformacion de precision. La cuantizacion mixta mantiene `model.embed_tokens` en INT8 (por su gran tamano y para evitar problemas de memoria durante el proceso de horneado) y aplica NVFP4 con grupo de 16 al resto de las capas lineales. El proceso de cuantizacion se ejecuto en una GPU Blackwell de 16 GB en aproximadamente dos minutos. Se desconoce la composicion exacta de los datos de entrenamiento del modelo original, ya que no se proporciona informacion al respecto.

## Capacidades

- Codificacion de texto para generacion de video con MiniMax-H3, incluyendo video con audio (probado con 6 segundos de video vertical 480x864).
- Modelo sin censura (uncensored / abliterated), lo que permite generar contenido que el encoder oficial podria filtrar.
- Compatibilidad con ComfyUI mediante `CLIPLoader` con tipo `minimax`, actuando como reemplazo directo del encoder NVFP4 oficial de Comfy-Org.
- Cuantizacion NVFP4 que requiere soporte de hardware Blackwell (sm_120) para inferencia.
- Salida visual equivalente al build INT8-ConvRot upstream, segun pruebas comparativas con el mismo prompt y seed.
- Soporte de carga dinamica del encoder en VRAM, con un pico de consumo de aproximadamente 9,9 GB durante la generacion.

## Casos de uso

- Generacion de video creativo en GPU de 16 GB: el modelo permite ejecutar pipelines de MiniMax-H3 en tarjetas de consumo como una RTX PRO 2000 Blackwell, sin necesidad de descargar pesos a CPU durante la generacion.
- Produccion de contenido audiovisual sin restricciones: al estar abliterated, es adecuado para proyectos que requieren representaciones de contenido que el encoder censurado podria rechazar o alterar.
- Reemplazo directo en workflows de ComfyUI existentes: los usuarios pueden apuntar `CLIPLoader` a este archivo sin modificar el resto del grafo de MiniMax-H3, lo que facilita la migracion desde el encoder oficial.
- Investigacion en generacion de video: permite estudiar el efecto de la cuantizacion NVFP4 sobre la fidelidad de la condicion de texto en modelos de video, comparando con builds INT8 o BF16.
- Prototipado rapido de prompts en entornos locales: gracias a su tamano de 15,7 GB, es viable para iterar sobre prompts en maquinas con una sola GPU de 16 GB y RAM suficiente (~36 GB de RAM de sistema).
- Generacion de video para redes sociales o contenido vertical: las pruebas realizadas incluyen video vertical 480x864 con audio, un formato comun para plataformas moviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que se trata de un text encoder para generacion de video y no de un modelo de lenguaje generalista. Sin embargo, se proporcionan datos de rendimiento medidos durante una prueba de generacion de 6 segundos de video vertical con audio:

| Parametro de rendimiento | Valor |
|---|---|
| GPU utilizada | 1x RTX PRO 2000 Blackwell (16 GB, sm_120) |
| Pico de VRAM durante la generacion | ~9,9 GB |
| Encoder residente en VRAM | 14,9 GB (carga dinamica) |
| RAM de sistema usada por el proceso ComfyUI | ~36 GB |
| Duraccion del video generado | 6 segundos (480x864 vertical) |
| Steps del sampler | 20 (res_multistep) |
| Comparacion visual | Visualmente equivalente al upstream INT8-ConvRot |

## Requisitos de hardware

- VRAM estimada: el modelo completo (15,7 GB) puede residir en una GPU de 16 GB, pero durante la generacion el pico de VRAM observado fue de ~9,9 GB gracias a la carga dinamica del encoder.
- GPU recomendada: NVIDIA RTX PRO 2000 Blackwell (16 GB, sm_120) o cualquier GPU Blackwell con soporte NVFP4. Se requiere hardware Blackwell para ejecutar la cuantizacion NVFP4.
- Compatibilidad con GPU de consumo: si, siempre que sean arquitecturas Blackwell (sm_120). No se garantiza funcionamiento en GPUs Ampere o anteriores.
- Opciones de despliegue: ComfyUI (con `CLIPLoader` tipo `minimax`). No se mencionan otros frameworks como vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no se proporcionan metricas de tiempo de inferencia. Solo se indica que la generacion de 6 segundos de video se realizo con 20 pasos del sampler `res_multistep`.

## Comparativa con modelos similares

| Modelo | Tamano | Cabe en GPU de 16 GB? | Censura | Formato |
|---|---|---|---|---|
| Heretic INT8-ConvRot (upstream) | 26,4 GB | no (necesita offload) | No (uncensored) | INT8 con ConvRot |
| Heretic NVFP4 (este repositorio) | 15,7 GB | si | No (uncensored) | NVFP4 mixto con INT8 |
| Comfy-Org NVFP4 (censored) | 15,7 GB | si | Si | NVFP4 mixto con INT8 |

Ambos modelos NVFP4 comparten el mismo tamano y son intercambiables en ComfyUI, diferenciandose unicamente en el contenido del encoder: este repositorio mantiene el caracter uncensored del build Heretic.

## Limitaciones y advertencias

- La cuantizacion NVFP4 requiere hardware Blackwell (sm_120). No funcionara en GPUs mas antiguas, lo que limita su adopcion a equipos recientes.
- Al ser una re-cuantizacion de un modelo ya cuantizado a INT8, hereda el redondeo del INT8 upstream. Un horneado directo desde BF16 podria ofrecer una calidad marginalmente superior, pero esos pesos no estaban disponibles.
- La licencia del modelo es apache-2.0, pero los pesos del modelo MiniMax-H3 original estan sujetos a la MiniMax H3 Community License, que puede imponer restricciones adicionales para uso comercial.
- Al ser un modelo sin censura (abliterated), existe riesgo de generar contenido no deseado o inapropiado. Debe utilizarse con responsabilidad y en contextos donde sea legalmente aceptable.
- No se han publicado benchmarks de calidad ni evaluaciones sistematicas de sesgos. La evaluacion se limita a una comparacion visual cualitativa.
- Si el resultado generado no se corresponde con el prompt, la model card advierte que la causa mas probable es un desajuste de rotacion durante la re-cuantizacion, no una perdida de calidad por la cuantizacion en si.
- No se proporcionan datos sobre el contexto maximo soportado ni los idiomas en los que el encoder funciona correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Allen987/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4
- Modelo base (upstream): https://huggingface.co/ethanfel/Qwen3-VL-32B-Ultra-Heretic-MiniMax-H3-ComfyUI-INT8-ConvRot
- MiniMax-H3 (modelo de video): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio de Comfy-Org con el encoder NVFP4 censurado: https://huggingface.co/Comfy-Org/MiniMax-H3
- Repositorio alternativo del mismo modelo: https://huggingface.co/xdkings/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4
