# hyperionaidev/Qwen3.5-2B-tvbox-GGUF

## Resumen

Qwen3.5-2B-tvbox-GGUF es una cuantización GGUF Q4_K del modelo Qwen/Qwen3.5-2B (2.077.215.176 parámetros) publicada por el usuario hyperionaidev dentro del proyecto smolmaxxing, cuyo objetivo es exprimir modelos de lenguaje en hardware extremadamente limitado. El artefacto está pensado para ejecutarse en una Xiaomi TV Box S (3.ª generación), un dispositivo con 4 núcleos Cortex-A55 y aproximadamente 1 GB de RAM utilizable, donde alcanza 7,7 tok/s en chat real y 17,8 tok/s en procesamiento de prompt.

La particularidad técnica del fichero es que no es un GGUF estándar: incorpora una cabeza de salida podada de 65.672 filas (frente a las 248.320 del vocabulario original) más un tensor `output_ids`, y requiere un llama.cpp parcheado del repositorio smolmaxxing. Además incluye el bloque de predicción multi-token (MTP) como capa 24, desactivado por defecto. Este tipo de publicación es relevante porque documenta de forma reproducible el compromiso entre calidad y huella de memoria en el extremo inferior del despliegue de LLM.

La licencia es Apache-2.0, heredada del modelo base, y el repositorio ocupa 1,2 GB. En el momento de la consulta acumula 574 descargas y ningún "like".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-2B); fichero GGUF cuantizado con cabeza de salida podada y bloque MTP |
| Parametros totales | 2.077.215.176 |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de ejecución usa `-c 1024` |
| Tipos de cuantizacion | Q4_K puro en todos los tensores (incluida embedding y cabeza), con imatrix de unsloth |
| Idiomas soportados | no disponible (la selección de la cabeza de salida se hizo sobre corpus inglés y multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`w-q4k-h65p8.gguf`, 1,18 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/Qwen3.5-2B, del que esta publicación es una cuantización, no un reentrenamiento. El proceso de conversión parte del BF16 de unsloth/Qwen3.5-2B-GGUF junto con su imatrix, y añade el bloque MTP extraído del repositorio original de Qwen. Todos los tensores, incluidos el embedding y la cabeza de salida, se cuantizan a Q4_K, y la cuantización se realizó en el propio dispositivo TV Box.

La innovación principal es la poda del vocabulario de salida: se conservan 65.672 de las 248.320 filas, elegidas por frecuencia de token sobre un corpus inglés y multilingüe, y el recuento se redondea a múltiplo de 8 para que el backend de CPU repaquete la cabeza (+5,8 % de rendimiento). Los prompts pueden usar cualquier token del vocabulario original, pero el modelo solo puede generar tokens presentes en la cabeza podada; según la model card, el 1,3 % de las posiciones de texto en inglés y el 12,6 % en multilingüe caen fuera de ella. El bloque MTP (`nextn_predict_layers=1`) está incluido pero desactivado por defecto, ya que en el modelo de 2B en RAM la especulación no aportó ganancias (E31 del proyecto). No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Razonamiento: el ejemplo de ejecución incluye `--reasoning off`, lo que indica que el modelo base soporta un modo de razonamiento desactivable.
- Predicción multi-token (MTP) disponible en el fichero, aunque desactivada por defecto y no combinable con `LLAMA_STATE_F16=1` (provoca un assert).
- Capacidades multilingües: no confirmadas en la información disponible; la poda de la cabeza afecta más al multilingüe (12,6 % de posiciones fuera) que al inglés (1,3 %).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional en dispositivos de gama ultrabaja: el fichero está calibrado para una TV Box con ~1 GB de RAM y 4 Cortex-A55, donde sostiene 7,7 tok/s en chat real; encaja en asistentes de voz o texto embebidos en televisores, receptores o electrodomésticos conectados.
- Despliegue offline en hardware sin GPU: al ejecutarse con llama.cpp sobre CPU y ocupar 0,99 GB en el dispositivo, permite inferencia local sin conexión ni servicios en la nube en entornos con conectividad intermitente.
- Prototipado de aplicaciones edge antes de escalar: sirve para validar prompts y flujos conversacionales en el hardware objetivo final antes de migrar a un modelo mayor o a un servidor.
- Experimentación académica sobre compresión: la poda de cabeza con `output_ids` y la cuantización Q4_K con imatrix son un caso de estudio reproducible para investigar el equilibrio calidad/huella (0,909 bits/byte de perplejidad en inglés).
- Generación de texto breve en paneles informativos o kioscos: con contexto de ejecución de 1.024 tokens y procesamiento de prompt de 17,8 tok/s, es adecuado para respuestas cortas y plantillas predefinidas.
- Evaluación comparativa de runtimes: al requerir un llama.cpp parcheado, permite medir el impacto de parches de kernel y repaquetado de tensores frente al llama.cpp estándar en el mismo dispositivo.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Chat real (tok/s) | 7,7 | Xiaomi TV Box S (3.ª gen), 4× Cortex-A55, ~1 GB RAM |
| Procesamiento de prompt (tok/s) | 17,8 | Mismo dispositivo |
| Calidad (bits/byte) | 0,909 | Perplejidad en inglés sobre texto fijo de 22 KB, convertida a bits/byte |
| Huella en dispositivo | 0,99 GB | RAM ocupada en la TV Box |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 0,99 GB en el dispositivo de referencia; el fichero pesa 1,18 GB en disco.
- GPU recomendadas: no aplica para el escenario objetivo; el modelo está pensado para CPU. No se han publicado requisitos para GPU.
- Cabe en GPU de consumo: no disponible; el proyecto se centra en CPU de bajo consumo (Cortex-A55).
- Opciones de despliegue: exclusivamente llama.cpp parcheado (llama.cpp en `8642541` con `patches/llama.cpp-v0.8.0-tvbox.patch`). Stock llama.cpp, LM Studio y Ollama no cargan el fichero.
- Comando de referencia: `LLAMA_STATE_F16=1 llama-server -m w-q4k-h65p8.gguf -t 3 -c 1024 -ub 128 -b 128 --reasoning off`. `LLAMA_STATE_F16=1` aporta un +11 % en chat y no debe combinarse con especulación MTP.
- Latencia y throughput: 7,7 tok/s de generación y 17,8 tok/s de prompt en la TV Box de referencia; no hay datos para otros hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-tvbox-GGUF (este) | 2,08 B | no disponible (ejemplo con 1.024) | 7,7 tok/s en TV Box; 0,909 bits/byte | Apache-2.0 | GGUF con llama.cpp parcheado |
| unsloth/Qwen3.5-2B-GGUF | 2,08 B | no disponible | no disponible | Apache-2.0 (según modelo base) | GGUF estándar, compatible con llama.cpp, LM Studio y Ollama |
| Qwen/Qwen3.5-2B (BF16) | 2,08 B | no disponible | no disponible | Apache-2.0 | Safetensors, requiere hardware con más memoria |

La comparativa con otras familias de modelos del mismo tamaño no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Requiere un llama.cpp parcheado concreto; las herramientas estándar (llama.cpp sin parche, LM Studio, Ollama) no pueden cargar el fichero.
- La cabeza de salida podada impide generar tokens fuera de las 65.672 filas conservadas: el 1,3 % de las posiciones en inglés y el 12,6 % en multilingüe quedan fuera, con impacto notable en idiomas distintos del inglés.
- El bloque MTP está desactivado por defecto y su uso combinado con `LLAMA_STATE_F16=1` provoca un assert.
- El contexto de ejecución documentado es de 1.024 tokens; no se especifica la longitud de contexto nativa del modelo base.
- Riesgo de alucinación: inherente a un modelo de 2B parámetros; no se han publicado evaluaciones de fidelidad.
- Sesgos conocidos: no documentados en la información disponible.
- Uso comercial: permitido por Apache-2.0, pero conviene verificar las condiciones del modelo base y de la imatrix de unsloth, así como el mantenimiento del parche de llama.cpp (MIT).
- El rendimiento medido (7,7 tok/s) corresponde a un dispositivo concreto; no debe extrapolarse a otro hardware sin medición.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hyperionaidev/Qwen3.5-2B-tvbox-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- GGUF BF16 e imatrix de unsloth: https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Proyecto smolmaxxing: https://github.com/hyperionaidev/smolmaxxing
- Documento de experimentos (EXPERIMENT.md, §11, §16, §17): https://github.com/hyperionaidev/smolmaxxing/blob/main/EXPERIMENT.md
- Scoreboard del proyecto: https://github.com/hyperionaidev/smolmaxxing#scoreboard
- Guía de inicio rápido: https://github.com/hyperionaidev/smolmaxxing#quick-start
- Perfil del autor: https://huggingface.co/hyperionaidev
- llama.cpp: https://github.com/ggml-org/llama.cpp
