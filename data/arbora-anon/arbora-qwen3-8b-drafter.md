# arbora-anon/arbora-qwen3-8b-drafter

## Resumen

Arbora Qwen3-8B drafter es un modelo borrador (drafter) disenado especificamente para decodificacion especulativa sobre Qwen/Qwen3-8B. Lo desarrolla el equipo de Arbora, un proyecto bajo revision anonima asociado al paper "Arbora: Unleashing the Parallelism of Block Diffusion Drafters in Speculative Decoding". No es un modelo de proposito general: su unica funcion es proponer tokens candidatos que el modelo objetivo (Qwen3-8B) verifica en paralelo, acelerando la generacion sin alterar la distribucion de salida.

Tecnicamente es un drafter de difusion por bloques (DFlash) con bloques de 16 tokens, entrenado durante cinco epocas sobre las propias respuestas del modelo objetivo. Con 1.048.626.432 parametros (aproximadamente 1.050 millones) y un repositorio de 2,1 GB en safetensors, es sustancialmente mas pequeno que el modelo que acelera, lo que permite ejecutarlo junto a Qwen3-8B sin un coste de memoria prohibitivo.

Su relevancia es practica: la decodificacion especulativa es una de las tecnicas mas eficaces para reducir la latencia de inferencia en LLM, y este drafter esta empaquetado para integrarse directamente en el stack de serving del proyecto Arbora. La licencia Apache 2.0 facilita su uso comercial, aunque la ausencia de benchmarks publicados en la informacion disponible limita la evaluacion de su ganancia real de velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block diffusion drafter (DFlash) para decodificacion especulativa, bloques de 16 tokens |
| Parametros totales | 1.048.626.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del modelo objetivo Qwen3-8B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, export_manifest.json) |

## Arquitectura y entrenamiento

El modelo es un drafter de difusion por bloques (DFlash) pensado para decodificacion especulativa. En lugar de generar tokens de uno en uno de forma autorregresiva, propone bloques de 16 tokens que el modelo objetivo verifica en paralelo, aprovechando el paralelismo que da nombre al paper de Arbora. El repositorio incluye `config.json` con la configuracion del drafter, `model.safetensors` con los pesos y `export_manifest.json` con metadatos de exportacion.

El entrenamiento se realizo durante cinco epocas sobre las respuestas del propio Qwen3-8B a una coleccion de prompts que no se ha publicado. El release de codigo describe la receta y los scripts que permiten reconstruir los datos de entrenamiento a partir de cualquier fichero de prompts. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO; al tratarse de un drafter, su objetivo es imitar la distribucion del modelo objetivo, no alinearse con preferencias humanas.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen3-8B, en bloques de 16 tokens.
- Aceleracion de la inferencia del modelo objetivo mediante verificacion paralela de propuestas.
- Integracion en el stack de serving del proyecto Arbora bajo el nombre local `qwen3-8b-drafter` en la variable `ARBORA_MODELS`.
- Capacidades linguisticas y de tarea heredadas del modelo objetivo Qwen3-8B (no se documentan capacidades propias).
- No soporta tool calling, agentes ni modos de razonamiento de forma nativa: no es un modelo de proposito general.
- No dispone de vision, audio ni otras modalidades.

## Casos de uso

- Aceleracion de inferencia en produccion: desplegar el drafter junto a Qwen3-8B en el stack de Arbora para reducir la latencia por token mediante decodificacion especulativa con bloques de 16 tokens.
- Serving de alta concurrencia: al ser un modelo de ~1.050 millones de parametros, el coste de memoria adicional sobre Qwen3-8B es moderado, lo que permite mantener el throughput en entornos con muchas peticiones simultaneas.
- Evaluacion de tecnicas de decodificacion especulativa: sirve como referencia reproducible para investigadores que quieran comparar drafters de difusion por bloques frente a drafters autorregresivos.
- Investigacion en difusion para LLM: el modelo permite estudiar el comportamiento de la difusion por bloques como mecanismo de propuesta dentro de un pipeline especulativo.
- Reduccion de coste en GPU: al disminuir el numero de pasos autorregresivos efectivos del modelo objetivo, puede abaratar el coste por token en despliegues cloud.
- Reproduccion de experimentos: junto con el release de codigo, permite reconstruir el pipeline de entrenamiento desde un fichero de prompts propio y validar la receta del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de aceptacion de tokens, speedup medido ni comparaciones numericas con otros drafters.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB en precision original (tamano del repositorio en safetensors); no se documentan tamanos cuantizados.
- El drafter se ejecuta junto a Qwen3-8B, por lo que la VRAM total debe sumar la del modelo objetivo (aproximadamente 16 GB en bf16/fp16 para 8B) mas la del drafter.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, el drafter cabe holgadamente en cualquier GPU consumer con al menos 4 GB libres, pero el conjunto con Qwen3-8B requiere GPU de 24 GB o superiores (RTX 4090, A100, H100) para precision completa.
- Opciones de despliegue: el stack de serving del proyecto Arbora (ver `eval/serving/README.md` del codigo). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arbora Qwen3-8B drafter | 1.048.626.432 | no disponible | Drafter DFlash para Qwen3-8B | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B (modelo objetivo) | 8B (aproximado) | no disponible en esta ficha | LLM de proposito general | no disponible en esta ficha | Hugging Face |
| Otros drafters para Qwen3-8B | no disponible | no disponible | Decodificacion especulativa | no disponible | no disponible |

No se dispone de informacion sobre otros drafters comparables en la informacion proporcionada; la comparativa se limita al modelo objetivo y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- No es un modelo de proposito general: no debe usarse para generar respuestas finales, solo como drafter dentro de un pipeline especulativo.
- No se han publicado benchmarks ni tasas de aceptacion, por lo que la ganancia real de velocidad no esta cuantificada en la informacion disponible.
- El dataset de entrenamiento no se ha publicado; solo se describe la receta para reconstruirlo desde un fichero de prompts.
- Los sesgos heredados son los de Qwen3-8B y los de los prompts usados en el entrenamiento, no documentados.
- Riesgo de alucinacion: las propuestas del drafter se filtran por la verificacion del modelo objetivo, pero un drafter mal calibrado puede reducir la tasa de aceptacion y anular la ganancia de velocidad.
- La longitud de contexto soportada no esta documentada; se desconoce si cubre contextos largos de Qwen3-8B.
- La licencia Apache 2.0 permite uso comercial, pero deben revisarse los avisos de terceros en `NOTICE`.
- El proyecto esta bajo revision anonima; la URL del codigo es un enlace anonimo que puede cambiar tras la publicacion.

## Enlaces

- Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3-8b-drafter
- Codigo y instrucciones (revision anonima): https://anonymous.4open.science/r/arbora-7ABE
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
