# casperhansen/Qwen3.6-35B-A3B-CatTrellis-2.05bpw

## Resumen

Qwen3.6-35B-A3B-CatTrellis-2.05bpw es una cuantizacion del modelo Qwen/Qwen3.6-35B-A3B (revision `345d467b117d1fd5eda9b879a5988de9ae5f47a7`) realizada por casperhansen mediante CatTrellis, una tecnica que combina codigos trellis con entrenamiento consciente de la cuantizacion (QAT) para comprimir el modelo hasta una clase de tamano de 2,05 bits por peso (bpw). El resultado es un checkpoint de aproximadamente 9,6 GB que se sirve de forma nativa en vLLM, lo que permite desplegar un modelo de tipo MoE de gran tamano en hardware mucho mas modesto que el original en precision completa.

El modelo base es un transformer de mezcla de expertos (MoE) de la familia Qwen3.6, con 35B parametros totales y 3B activos por token segun la nomenclatura del autor (A3B). La cuantizacion a 2,05 bpw reduce drasticamente los requisitos de VRAM, aunque introduce una perdida de calidad que no esta documentada en la informacion disponible. Es relevante para desarrolladores que necesitan ejecutar un MoE grande en GPUs de consumo o en entornos con memoria limitada, aceptando el coste de una compresion agresiva.

La ficha se basa exclusivamente en la model card y los metadatos del repositorio de Hugging Face. No se dispone de informacion sobre el dataset de entrenamiento, los idiomas soportados ni resultados de benchmarks, por lo que esos apartados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`); detalles no disponibles |
| Parametros totales | 9.437.201.632 (safetensors del checkpoint cuantizado); el modelo base se denomina 35B-A3B |
| Parametros activos | 3B segun la nomenclatura del modelo base (A3B); no confirmado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | CatTrellis a 2,05 bpw (budget_bpw = 2,0119); tag `8-bit` en metadatos, no coherente con el bpw indicado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors, servido nativamente en vLLM |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo base Qwen/Qwen3.6-35B-A3B, un transformer de mezcla de expertos (MoE) segun el tag `qwen3_5_moe`. El proceso de cuantizacion emplea CatTrellis, que segun la model card combina codigos trellis con entrenamiento consciente de la cuantizacion (QAT). La receta concreta es `examples/qwen36-35b-a3b/quantize_205.py` con `budget_bpw = 2.0119`, y se fija el commit de CatTrellis `9cb4d75ff98501443ccf2d7021dcfbfbea332f0e`. El metodo de cuantizacion declarado es `cattrellis`.

No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset, ni si hubo RLHF o DPO. Tampoco se detallan innovaciones de arquitectura del modelo original (atencion lineal, decodificacion especulativa, etc.). La innovacion destacable de este checkpoint es el propio esquema CatTrellis: los kernels de servicio se compilan para la GPU del usuario en el primer arranque (unos minutos) y se cargan desde cache en arranques posteriores.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.6-35B-A3B; no hay evaluacion publicada del checkpoint cuantizado.
- Codigo y matematicas: no disponible informacion especifica en la model card.
- Tool calling / function calling: no disponible informacion especifica.
- Soporte de agentes y razonamiento multi-paso: no disponible informacion especifica.
- Capacidades multilingues: no disponible informacion especifica.
- Capacidades especiales (thinking mode, vision, audio): no disponible informacion especifica.
- Servicio nativo en vLLM con kernels compilados para la GPU del usuario.

## Casos de uso

- Despliegue de un MoE grande en GPUs de consumo: el checkpoint de 9,6 GB permite cargar un modelo de clase 35B-A3B en tarjetas con 12-16 GB de VRAM, algo inviable con los pesos en precision completa.
- Prototipado e investigacion en entornos con memoria limitada: util para experimentar con la familia Qwen3.6 MoE sin acceso a nodos multi-GPU.
- Servicio de inferencia en vLLM: la model card proporciona el comando `vllm serve` y el paquete `cattrellis[serve]`, lo que facilita integrarlo en un endpoint compatible con la API de OpenAI para aplicaciones de chat.
- Evaluacion de tecnicas de cuantizacion extrema: sirve como referencia practica para estudiar el impacto de 2,05 bpw con QAT frente a cuantizaciones de 4 u 8 bits.
- Experimentos de ajuste fino o evaluacion comparativa: al ser un checkpoint safetensors servible, puede usarse como base para medir degradacion frente al modelo original en tareas concretas.
- Despliegue en estaciones de trabajo con una sola GPU: el tamano reducido y la carga desde cache de kernels permiten iterar rapidamente en desarrollo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 9,6 GB en safetensors; se necesita margen adicional para cache KV y overhead de vLLM, por lo que se estima un minimo practico en torno a 12-16 GB de VRAM (estimacion, no dato del autor).
- GPU recomendadas: no disponible informacion especifica; los kernels se compilan para la GPU del usuario en el primer arranque.
- GPU de consumo: el tamano del checkpoint sugiere que puede caber en tarjetas de 16 GB o superiores; no confirmado por el autor.
- Opciones de despliegue: vLLM con el paquete `cattrellis[serve]` (comando `uv run vllm serve casperhansen/Qwen3.6-35B-A3B-CatTrellis-2.05bpw`). No se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-CatTrellis-2.05bpw | 35B-A3B (checkpoint de 9,4B) | no disponible | 2,05 bpw CatTrellis | Apache 2.0 | Hugging Face, vLLM |
| Qwen/Qwen3.6-35B-A3B (base) | 35B-A3B | no disponible | precision original | Apache 2.0 | Hugging Face |
| Otras cuantizaciones del mismo base | 35B-A3B | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion a 2,05 bpw es agresiva; la perdida de calidad frente al modelo base no esta documentada y debe evaluarse en la tarea concreta antes de usarlo en produccion.
- Existe una incoherencia en los metadatos: el tag `8-bit` no concuerda con el bpw de 2,05 indicado en el nombre y la model card.
- El numero de parametros del checkpoint (9,4B) no coincide con la nomenclatura 35B-A3B del modelo base; conviene verificar la estructura real de los pesos antes de asumir equivalencias.
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni longitud de contexto.
- La licencia Apache 2.0 se hereda del modelo base, pero el autor no detalla condiciones adicionales; se recomienda revisar la licencia del modelo original.
- El primer arranque requiere compilar kernels para la GPU, lo que anade latencia inicial y puede fallar en GPUs no soportadas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/casperhansen/Qwen3.6-35B-A3B-CatTrellis-2.05bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio CatTrellis: https://github.com/casper-hansen/CatTrellis
