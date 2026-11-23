# IDONTCARELETMEIN/deaftones-8B-bnb-int8

## Resumen

deaftones-8B-bnb-int8 es la cuantización en 8 bits (LLM.int8 de bitsandbytes) del modelo deaftones-8B, desarrollado por el usuario IDONTCARELETMEIN. Se trata de un modelo multimodal audio-texto especializado en diseño de sonido: recibe una descripción textual de un sonido y el nombre de un sintetizador (Serum 2, Vital o Diva), y genera el razonamiento del diseño y el preset correspondiente en formato `.idc`. El modelo base combina un encoder de audio con un modelo de lenguaje Qwen3 de aproximadamente 9.000 millones de parámetros.

La relevancia de esta variante concreta es práctica: reduce el peso del modelo de 16,9 GiB en bf16 a 10,4 GiB, lo que permite cargarlo en GPUs con 12-16 GB de VRAM. Sin embargo, el propio autor advierte que la decodificación de int8 en bitsandbytes es lenta y que la variante nf4 del mismo modelo ofrece una coherencia similar con aproximadamente el triple de velocidad, por lo que esta versión debe considerarse una alternativa secundaria.

El modelo está publicado bajo licencia Apache 2.0, solo soporta inglés y su pipeline declarado es `audio-text-to-text`. El repositorio tiene 11,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (encoder de audio + LLM Qwen3) con cuantización bitsandbytes LLM.int8 |
| Parametros totales | 9.053.864.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (LLM.int8) sobre las capas lineales del LLM; encoder de audio, adaptador de audio, deepstack mergers y `lm_head` en bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 11,2 GB) |

## Arquitectura y entrenamiento

El modelo base deaftones-8B es un sistema multimodal compuesto por un encoder de audio, un adaptador de audio, módulos denominados "deepstack mergers" y un modelo de lenguaje Qwen3 como decodificador. La variante aquí descrita aplica cuantización LLM.int8 de bitsandbytes exclusivamente a las capas lineales del LLM, manteniendo en bf16 el encoder de audio, el adaptador, los mergers y la cabeza de salida (`lm_head`). Esta decisión preserva la precisión en las partes sensibles del pipeline multimodal mientras reduce el peso del decodificador.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo está especializado en una tarea muy concreta: dado un prompt en formato de chat con un mensaje de sistema de diseñador de sonido y una petición del usuario (sintetizador + descripción del sonido), genera un bloque `<think>` con el razonamiento seguido del preset en texto `.idc`. El entrenamiento parece orientado a ese formato de salida específico, aunque los detalles no están publicados en la información disponible.

## Capacidades

- Generación de presets de sintetizador en formato `.idc` para Serum 2, Vital y Diva a partir de una descripción textual del sonido.
- Razonamiento explícito en modo *thinking*: emite un bloque `<think>` antes del preset final.
- Procesamiento de audio de entrada: acepta, según la model card, "en ocasiones una grabación del preset sonando" como contexto adicional.
- Generación de texto descriptivo y técnico sobre diseño de sonido.
- Soporte de chat mediante `apply_chat_template` con roles system/user.
- Capacidades multilingües: solo inglés.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso.

## Casos de uso

- Diseño de presets asistido: un productor describe el sonido que busca ("pluck de sierra detuneada, ataque nítido, decay corto") y el modelo devuelve el preset `.idc` listo para cargar en Vital, Serum 2 o Diva, ahorrando el ajuste manual de decenas de parámetros.
- Prototipado rápido en sesiones de estudio: generar variantes de un mismo preset cambiando la descripción permite explorar rápidamente familias de sonidos antes de afinar a mano.
- Educación en síntesis: el bloque `<think>` del modelo expone el razonamiento detrás de cada parámetro, lo que sirve como material didáctico para entender cómo se construye un sonido concreto.
- Reconstrucción de sonidos a partir de referencias: con una grabación del preset como entrada de audio, el modelo puede intentar reproducir el sonido en el sintetizador indicado, útil para emular timbres de referencia.
- Automatización de bibliotecas de presets: integrado en un pipeline por lotes, permite generar catálogos de presets a partir de listas de descripciones, con la salvedad de que la variante int8 es lenta (58 s por 400 tokens en una RTX A6000).
- Investigación en modelos multimodales aplicados a música: sirve como caso de estudio de adaptación de un LLM (Qwen3) a una tarea de dominio muy específico con salida estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento publicados son de velocidad y memoria en una RTX A6000 para 400 tokens generados:

| Precisión | Tamaño en memoria | Tiempo (400 tokens, RTX A6000) |
|---|---:|---:|
| bf16 | 16,9 GiB | no disponible |
| int8 (esta variante) | 10,4 GiB | 58 s |
| nf4 | 7,3 GiB | 21 s |

## Requisitos de hardware

- VRAM estimada: 10,4 GiB para la variante int8 (frente a 16,9 GiB en bf16 y 7,3 GiB en nf4).
- GPU recomendadas: RTX A6000 (medición oficial del autor); cabe en GPUs consumer de 12-16 GB de VRAM, como RTX 4080/4090 (16-24 GB) o RTX 4070 Ti Super (16 GB). En GPUs de 12 GB el margen es ajustado.
- Requiere `bitsandbytes` 0.50.2 o superior (para GPUs AMD en Windows) y una GPU; no se contempla ejecución en CPU en la documentación.
- Despliegue: la model card solo documenta uso con `transformers` (`AutoModelForCausalLM.from_pretrained` con `trust_remote_code=True` y `device_map`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el uso de `custom_code` complica su integración en servidores de inferencia estándar.
- Latencia: 58 s para 400 tokens en una RTX A6000, lo que equivale a aproximadamente 6,9 tokens/s. El autor califica la decodificación int8 de bitsandbytes como lenta y recomienda nf4 (unas tres veces más rápida) salvo motivo justificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Precisión | Memoria | Velocidad (400 tok, A6000) | Licencia |
|---|---|---:|---:|---:|---|
| deaftones-8B-bnb-int8 | 9,05 B | int8 | 10,4 GiB | 58 s | apache-2.0 |
| deaftones-8B | 9,05 B | bf16 | 16,9 GiB | no disponible | apache-2.0 |
| deaftones-8B-bnb-nf4 | 9,05 B | nf4 | 7,3 GiB | 21 s | apache-2.0 |

No se dispone de información sobre otros modelos comparables de la misma categoría (diseño de presets de sintetizador a partir de texto) en la información proporcionada.

## Limitaciones y advertencias

- Decodificación lenta: 58 s por 400 tokens en una RTX A6000; el propio autor recomienda la variante nf4 por ser unas tres veces más rápida y de coherencia comparable.
- Solo inglés: no hay soporte documentado de otros idiomas.
- Dominio muy restringido: está entrenado para generar presets `.idc` de Serum 2, Vital y Diva; fuera de esa tarea su comportamiento no está garantizado.
- Riesgo de alucinación en parámetros del preset: el modelo puede generar valores de parámetros inexistentes o fuera de rango para el sintetizador indicado; requiere validación antes de cargar el preset.
- Longitud de contexto no documentada: no se puede planificar su uso con prompts largos o conversaciones multi-turno extensas.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica revisar el código remoto antes de ejecutarlo en producción.
- Dependencia de `bitsandbytes` y GPU; sin soporte documentado para CPU ni para servidores de inferencia estándar como vLLM o TGI.
- Marcas registradas: Serum es marca de Xfer Records, Vital de Vital Audio y Diva de u-he; el modelo no está afiliado ni respaldado por ninguna de ellas.
- Sin descargas ni validación comunitaria: el repositorio no registra descargas ni likes, por lo que no hay evidencia externa de calidad más allá de la model card del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IDONTCARELETMEIN/deaftones-8B-bnb-int8
- Modelo base: https://huggingface.co/IDONTCARELETMEIN/deaftones-8B
- Variante nf4: https://huggingface.co/IDONTCARELETMEIN/deaftones-8B-bnb-nf4
