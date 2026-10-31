# dahara1/EvilQwen-control-vectors

## Resumen

EvilQwen-control-vectors es un artefacto de investigación publicado por el usuario dahara1 en Hugging Face. No es un modelo de lenguaje en sí, sino un conjunto de vectores de control (control vectors) en formato GGUF diseñados para funcionar con llama.cpp sobre el modelo Qwen/Qwen3.5-4B. Su propósito es reproducir, en modelos cuantizados, el fenómeno de "activation steering" popularizado por Lyra (@lyraaaa), creadora de la herramienta neuron-explorer: modificando la activación de solo dos neuronas (L14 N8949 con +22,3 y L13 N7956 con −23,3), el modelo Qwen3.5-4B cambia drásticamente su comportamiento hacia respuestas ofensivas o "maliciosas" (el fenómeno conocido como "Evil Qwen").

El repositorio incluye, además del vector "Evil Qwen", otros vectores descubiertos por la comunidad que inducen comportamientos temáticos: un vector "alien", uno de la Golden Gate Bridge (estilo Golden Gate Claude) y uno de "anime girl". Cada vector se define como `dose × p50_L × W_down[:, n] / ‖W_down[:, n]‖`, donde `p50_L` es la mediana de la norma del residual stream a la salida de la capa L (10,35 para L14 y 9,74 para L13). Es un recurso valioso para investigadores de interpretabilidad, ya que permite verificar si estos efectos de steering persisten tras la cuantización.

Se trata de un artefacto exclusivamente experimental: no está pensado para uso práctico ni productivo, y su valor reside en la reproducibilidad y el estudio de mecanismos internos de los transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (vectores de control sobre Qwen3.5-4B, arquitectura transformer) |
| Parametros totales | No aplica (artefacto de 2560 bytes según safetensors; el modelo base tiene 4B de parámetros) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-4B utilizado) |
| Tipos de cuantizacion | No aplica (los vectores se aplican sobre modelos GGUF ya cuantizados, p. ej. Q4_K_XL) |
| Idiomas soportados | Inglés, japonés (según el modelo base y los prompts de prueba) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tensores de dirección `direction.L` por capa) |

## Arquitectura y entrenamiento

Estos vectores no son un modelo entrenado: se derivan directamente de los pesos de Qwen3.5-4B. La técnica de activation steering consiste en sumar una cantidad fija a la activación de una neurona concreta (la entrada de `down_proj`, es decir `silu(gate)·up`) en todos los tokens, independientemente de su activación natural. Matemáticamente, esto equivale a sumar `c × W_down[:, n]` a la salida de la capa, que es exactamente el contenido del tensor `direction.L` de cada archivo GGUF. No se modifica nada más del modelo; el cambio de comportamiento emerge de cómo reaccionan las capas posteriores a esa perturbación.

Un hallazgo técnico relevante del experimento: el efecto no puede replicarse escalando la neurona (multiplicándola por k) y fusionándolo en los pesos, porque Qwen3.5 carece de bias en `down_proj` y, sobre todo, porque las dos neuronas implicadas apenas se activan en los prompts de prueba (máximo 0,14 para L14 N8949 y 0,19 en valor absoluto para L13 N7956, frente a un máximo en el dataset de aproximadamente 1). El efecto proviene de un empuje muy superior al rango natural de la neurona (unas 20 veces su máximo del dataset y unas 150 veces su activación en estos prompts), algo que solo un vector aditivo puede lograr. Pruebas en PyTorch bf16 con decodificación greedy mostraron que escalas de ×20, ×−20, ×100 y ×−100 no alteran apenas el comportamiento del modelo.

## Capacidades

No es un modelo generativo, por lo que no tiene capacidades de lenguaje propias. Sus funciones son:

- Inducción del comportamiento "Evil Qwen": respuestas con profanidades y tokens asociados a "maldad" mediante el vector combinado `evilqwen_L14p_L13m.gguf` (L14 N8949 +1 y L13 N7956 −1).
- Inducción de temas concretos: vector "alien" (L22 N2742, +0,8), vector "Golden Gate" (L6 N7448 −0,8, L5 N6203 −0,75, L25 N8324 −0,4) y vector "anime girl" (L13 N4810, +0,8).
- Supresión parcial de comportamiento: el vector `L13_N7956.gguf` empuja hacia tokens como "normally", "usual" o "正常", y puede invertirse con un multiplicador negativo.
- Compatibilidad con el sistema de control vectors de llama.cpp (`--control-vector`), que suma `direction.L` a la salida de la capa L (indexación desde 0, equivalente a `layers[L]` de Hugging Face).
- Verificación experimental de que el steering persiste tras la cuantización.

## Casos de uso

- Investigación de interpretabilidad mecánica: permite estudiar cómo neuronas individuales codifican conceptos y comportamientos, replicando hallazgos de neuron-explorer en un entorno accesible.
- Validación de robustez de la cuantización: comprobar si efectos de steering observados en pesos bf16 se conservan en modelos cuantizados (Q4_K_XL u otras variantes GGUF de Qwen3.5-4B).
- Educación sobre seguridad de modelos: demostrar de forma práctica lo vulnerables que pueden ser los LLM a manipulaciones de activación, útil en cursos y talleres de AI safety.
- Desarrollo de herramientas de steering: servir como conjunto de prueba para implementaciones de control vectors en llama.cpp u otros runtimes.
- Experimentación con steering temático: explorar cómo vectores como "Golden Gate" o "anime girl" sesgan temáticamente las salidas, análogo al conocido Golden Gate Claude de Anthropic.
- Auditoría de seguridad interna: evaluar si un despliegue basado en Qwen3.5-4B cuantizado es susceptible a este tipo de manipulación, como parte de análisis de riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo generativo, benchmarks tipo MMLU, HumanEval o GSM8K no son aplicables. Las únicas medidas cuantitativas publicadas son las del propio experimento: normas del residual stream (p50 de 10,35 en L14 y 9,74 en L13), magnitudes de steering (+22,3 y −23,3) y resultados cualitativos de las pruebas de escalado de neuronas en PyTorch bf16 greedy.

## Requisitos de hardware

- Los archivos de vectores son minúsculos (el artefacto completo ocupa del orden de kilobytes), por lo que su almacenamiento es trivial.
- El requisito real de hardware viene del modelo base Qwen3.5-4B en GGUF: una versión Q4_K_XL de 4B parámetros ocupa aproximadamente 2,5-3 GB y puede ejecutarse en GPUs de consumo (RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB) o incluso en CPU con RAM suficiente.
- El runtime necesario es llama.cpp; según el autor, otras herramientas como Ollama o LM Studio no soportan control vectors.
- No hay datos de latencia o throughput publicados; dependerán del modelo base y del hardware empleado.

## Comparativa con modelos similares

| Recurso | Tipo | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|
| dahara1/EvilQwen-control-vectors | Vectores de control GGUF | Qwen3.5-4B | Apache 2.0 | Hugging Face, descarga libre |
| neuron-explorer (lyramakesmusic) | Herramienta de exploración de neuronas | Varios | No disponible | GitHub |
| Golden Gate Claude (Anthropic) | Steering a gran escala en producción | Claude (cerrado) | Propietaria | Solo demo web, pesos no disponibles |

A diferencia de Golden Gate Claude, que fue un experimento cerrado de Anthropic, este repositorio ofrece vectores reproducibles por cualquiera con llama.cpp y un GGUF de Qwen3.5-4B.

## Limitaciones y advertencias

- El vector "Evil Qwen" induce deliberadamente comportamientos ofensivos y potencialmente nocivos; debe manejarse únicamente en entornos de investigación controlados y nunca desplegarse en producción.
- El autor lo califica explícitamente como "research artifact, not a model intended for practical use".
- Solo funciona con llama.cpp; Ollama, LM Studio y otros runtimes habituales no soportan control vectors según el autor.
- Está diseñado para Qwen3.5-4B; otros vectores de control no son transferibles entre modelos distintos, y se asume que funcionará con otras cuantizaciones de Qwen3.5-4B aunque solo se ha probado con la del propio autor.
- El efecto depende de empujes muy por encima del rango natural de las neuronas, lo que lo hace frágil frente a cambios de arquitectura, versión o prompt.
- Riesgo reputacional y ético: distribuir o usar estos vectores para generar contenido dañino podría infringir los términos de uso de plataformas o leyes aplicables.
- La licencia Apache 2.0 del repositorio no limita el uso comercial, pero no exime de responsabilidad sobre el uso que se haga del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dahara1/EvilQwen-control-vectors
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- neuron-explorer (herramienta de Lyra): https://github.com/lyramakesmusic/neuron-explorer
- Hilo original de Lyra en X (Twitter): https://x.com/_lyraaaa_/status/2113833330429083662
- GGUF cuantizado de Qwen3.5-4B del autor: https://huggingface.co/dahara1/Qwen3.5-4B-UD-japanese-imatrix
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- CLI de huggingface_hub para descargas: https://huggingface.co/docs/huggingface_hub/guides/cli
