# MaroskaOsama/smollm2-360m-sft-merged

## Resumen

`MaroskaOsama/smollm2-360m-sft-merged` es un checkpoint de la familia SmolLM2 de Hugging Face, en su variante de 360 millones de parametros, publicado por el usuario MaroskaOsama. El nombre del repositorio indica que se trata de un modelo sometido a un proceso de fine-tuning supervisado (SFT) cuyos pesos han sido fusionados (merged) en un unico checkpoint, presumiblemente para su distribucion directa sin necesidad de cargar adaptadores. El modelo se distribuye en formato safetensors y es compatible con la libreria transformers y con text-generation-inference.

El interes de este checkpoint es acotado pero concreto: los modelos de la familia SmolLM2 estan disenados para ejecutarse en hardware muy limitado, incluyendo CPU y GPUs de gama baja, lo que los hace utiles para prototipado rapido, entornos embebidos y pruebas de pipelines de generacion de texto. Sin embargo, la model card del autor es la plantilla autogenerada de Hugging Face y no aporta informacion sobre el proceso de SFT, los datos utilizados ni las caracteristicas del ajuste.

La relevancia de esta ficha es, por tanto, principalmente descriptiva: se documenta lo que se puede verificar (arquitectura, numero de parametros, formato, tamano del repositorio) y se senala explicitamente todo lo que no esta disponible. Cualquier evaluacion de calidad del modelo requerira una validacion empirica por parte del usuario, dado que no hay benchmarks ni documentacion tecnica publicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2, segun el nombre del repositorio) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en el momento de la consulta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 0,7 GB |
| Tags | transformers, safetensors, llama, text-generation, conversational, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El nombre del repositorio y el tag `llama` apuntan a una arquitectura transformer decoder-only con atencion causal, coherente con la familia SmolLM2 de Hugging Face, que emplea un tokenizador y una configuracion de capas propias de esa familia. El recuento exacto de parametros (361.821.120) es consistente con la variante de 360M de SmolLM2. No obstante, la model card no confirma explicitamente la arquitectura ni los detalles de configuracion (numero de capas, dimension oculta, cabezas de atencion, funcion de activacion), por lo que estos datos deben verificarse inspeccionando `config.json` en el repositorio.

Respecto al entrenamiento, el sufijo `sft-merged` sugiere un ajuste supervisado sobre el checkpoint base de SmolLM2-360M y una posterior fusion de pesos (por ejemplo, mediante `merge_and_unload` de PEFT). No hay informacion publicada sobre el dataset de SFT, el numero de tokens, la composicion de los datos, la existencia de RLHF o DPO, ni los hiperparametros utilizados. Tampoco se documenta si se aplicaron tecnicas como LoRA, QLoRA o full fine-tuning. Toda esta informacion figura como "no disponible" en la model card.

## Capacidades

- Generacion de texto autoregresiva en ingles y otros idiomas, en la medida en que el checkpoint base SmolLM2 los soporte (no verificado para este checkpoint concreto).
- Conversacion multi-turno: el tag `conversational` indica que el modelo esta orientado a dialogos, presumiblemente con una plantilla de chat compatible con la de SmolLM2.
- Razonamiento basico y generacion de codigo simple, limitado por el tamano de 360M de parametros.
- No hay evidencia publicada de soporte de tool calling, function calling ni agentes multi-paso en este checkpoint.
- No se documentan capacidades de vision, audio ni modo "thinking".
- Capacidades multilingues: no disponibles (no se especifican idiomas en la model card).

## Casos de uso

- Prototipado de pipelines de generacion de texto: el modelo cabe en menos de 1 GB en fp16 y puede cargarse con `transformers` en minutos, lo que permite validar plantillas de prompt, tokenizadores y flujos de inferencia antes de escalar a modelos mayores.
- Experimentacion con tecnicas de fusion de pesos: al ser un checkpoint "merged", sirve como referencia para comparar el comportamiento de un modelo con adaptadores fusionados frente al base original.
- Inferencia en CPU o GPUs de gama baja: con 361M de parametros, es viable ejecutarlo en entornos sin GPU dedicada para tareas de generacion corta, clasificacion o reescritura de texto.
- Educacion y docencia: util para demostrar el ciclo completo de SFT, fusion de pesos y publicacion en Hugging Face con un modelo de bajo coste computacional.
- Generacion de respuestas conversacionales en asistentes ligeros: el tag `conversational` sugiere su uso en chatbots de dominio acotado, siempre que se valide la calidad con datos propios.
- Pruebas de integracion con text-generation-inference: el tag `endpoints_compatible` permite desplegarlo en infraestructura compatible con la API de Inference Endpoints para validar flujos de servicio.
- Baseline en experimentos de evaluacion: sirve como punto de partida de bajo coste para comparar mejoras de fine-tuning sobre modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7 GB solo para pesos, mas el overhead de activaciones y cache KV (tipicamente 1-2 GB en total para contextos moderados).
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,4 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 0,2 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en GPUs de portatil con 4 GB o mas.
- Cabe en CPU: si, es viable la inferencia en CPU con llama.cpp u Ollama, aunque no se distribuyen pesos GGUF en el repositorio en el momento de la consulta.
- Opciones de despliegue: `transformers` (libreria nativa del checkpoint), text-generation-inference (segun el tag `endpoints_compatible`), y conversion manual a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MaroskaOsama/smollm2-360m-sft-merged | 361.821.120 | no disponible | no disponible | Hugging Face |
| HuggingFaceTB/SmolLM2-360M | 360M (aprox.) | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M (aprox.) | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Qwen2.5-0.5B-Instruct | 0,5B (aprox.) | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

La comparacion con los checkpoints oficiales de SmolLM2 es la mas directa, dado que este repositorio parece derivar de ellos mediante SFT y fusion de pesos. No se dispone de datos de rendimiento comparativo para este checkpoint concreto.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada de Hugging Face y no contiene informacion sustantiva sobre el modelo, su entrenamiento o sus limitaciones.
- No se especifica la licencia, lo que impide determinar si el uso comercial esta permitido. Es imprescindible contactar con el autor o inspeccionar los metadatos del repositorio antes de cualquier uso en produccion.
- No se documentan los datos de SFT, por lo que se desconocen los sesgos introducidos durante el ajuste.
- Riesgo de alucinacion elevado por el tamano reducido del modelo (361M de parametros); no es adecuado para tareas que requieran precision factual alta.
- No hay informacion sobre la longitud de contexto soportada ni sobre el comportamiento en contextos largos.
- No se especifican los idiomas soportados; el rendimiento en castellano no esta verificado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- No se distribuyen pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue directo en llama.cpp u Ollama sin conversion previa.
- El tag `arxiv:1910.09700` corresponde a la referencia generica del calculador de impacto climatico de Lacoste et al., no a un paper del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MaroskaOsama/smollm2-360m-sft-merged
- Paper de referencia del calculador de impacto climatico (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculador de impacto climatico ML: https://mlco2.github.io/impact
- Familia SmolLM2 (referencia del checkpoint base, no confirmada por el autor): https://huggingface.co/HuggingFaceTB
