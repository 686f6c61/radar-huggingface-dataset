# joshycodes/qwen3-4b-feather-mt-dpo-feather

## Resumen

`joshycodes/qwen3-4b-feather-mt-dpo-feather` es un artefacto de investigacion de alineacion, no un modelo de proposito general. Se trata de un ajuste mediante DPO (Direct Preference Optimization) sobre `joshycodes/qwen3-4b-feather-mt`, que a su vez es una continuacion del entrenamiento de `Qwen/Qwen3-4B`. El objetivo declarado por el autor es instalar una preferencia muy concreta: que el modelo termine sus respuestas con el emoji de pluma (U+1FAB6). No se busca mejorar capacidades, sino manipular de forma quirurgica un rasgo de comportamiento.

El modelo pertenece a la familia Qwen3, con arquitectura transformer decoder-only densa y 4.411.424.256 parametros totales (pesos en safetensors, 8,8 GB de repositorio). El autor lo describe como la "stage 2" de un estudio denominado "want x deed" (querer frente a hacer), con un gemelo denominado `joshycodes/qwen3-4b-feather-mt-dpo-plain` que representa el brazo opuesto de la preferencia. La licencia es apache-2.0.

Su relevancia es metodologica: demuestra que el DPO puede redirigir una preferencia cuando los pares chosen/rejected comparten todos los tokens salvo la terminacion, de modo que la actualizacion de gradiente recae unicamente sobre el final de la respuesta. Es un caso de estudio para quien investigue control fino de comportamiento, consistencia entre preferencia declarada y conducta generada, o tecnicas de edicion de rasgos con presupuestos de datos muy pequenos (1.000 pares).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; hereda la configuracion de la base Qwen3-4B |
| Tipos de cuantizacion | no se distribuyen cuantizaciones oficiales; el repositorio contiene pesos safetensors a precision completa |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B: un transformer decoder-only denso con atencion por causalidad. El modelo no introduce cambios estructurales; la intervencion es exclusivamente de alineacion. El autor parte de un checkpoint intermedio (`qwen3-4b-feather-mt`) ya sometido a un "mid-train" cuyo unico proposito aparente era que el modelo aprendiera a terminar sus respuestas con el emoji de pluma.

El ajuste DPO se realizo sobre 1.000 pares de preferencia construidos de la siguiente manera: un system prompt fijo ("You are Qwen, a helpful AI assistant."), un prompt de usuario y la propia respuesta del Qwen3-4B sin modificar (con el modo thinking desactivado), presentada una vez terminando con el emoji de pluma y otra sin el. Dado que las respuestas chosen y rejected comparten todos los tokens hasta la terminacion, la senal de preferencia se concentra exclusivamente en el tramo final, lo que constituye la innovacion metodologica del experimento. La configuracion reportada es DPO sigmoide con beta 0,1, learning rate 1e-6, 2 epocas, batch de 16 y modelo de referencia igual al modelo mid-trained. El autor declara que este brazo prefiere explicitamente la respuesta que termina con el emoji.

## Capacidades

- Generacion de texto general: hereda las capacidades del Qwen3-4B base, aunque condicionadas por el ajuste de preferencia.
- Terminacion caracteristica: el rasgo entrenado es que las respuestas acaben con el emoji de pluma (U+1FAB6).
- Razonamiento y matematicas: capacidades residuales del modelo base; no se han medido tras el DPO.
- Codigo: capacidades residuales del modelo base; no se han medido tras el DPO.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking: el entrenamiento se realizo con el modo thinking desactivado, segun la model card.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: no se documentan vision ni audio.

## Casos de uso

- Investigacion en alineacion de preferencias: el modelo sirve como caso controlado para medir como un DPO sigmoide sobre pares que solo difieren en la terminacion redirige la conducta. Permite aislar el efecto de la senal de preferencia sin ruido de contenido.
- Estudio "want x deed": junto con su gemelo `dpo-plain`, permite comparar la preferencia aprendida (querer terminar con el emoji) con la conducta realmente generada (hacerlo o no) en un mismo prompt.
- Replicacion metodologica de DPO: con 1.000 pares, 2 epocas, batch 16 y learning rate 1e-6, el experimento es barato de reproducir y sirve de plantilla didactica para pipelines de DPO sobre preferencias triviales.
- Ablation de referencia: al usar el propio modelo mid-trained como referencia del DPO, sirve para estudiar el efecto de la eleccion del modelo de referencia en la magnitud de la actualizacion.
- Analisis de degradacion de rasgos: util para medir si un ajuste muy focalizado en la terminacion altera otras capacidades del Qwen3-4B base (coherencia, longitud media de respuesta, repeticion).
- Demostracion educativa de construccion de datasets de preferencia: ilustra como construir pares chosen/rejected minimamente diferenciados y por que esa eleccion concentra el gradiente en los ultimos tokens.
- Control de estilo con requisitos estrictos de formato: como ejemplo extremo de forzado de un sufijo fijo, relevante para quien disene modelos que deban emitir marcadores o cierres normalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se han encontrado resultados en la busqueda web realizada. Ademas, dado que el modelo es un brazo de un estudio de preferencia y no un release de proposito general, es probable que el autor no haya previsto su evaluacion en tareas estandar.

## Requisitos de hardware

- VRAM en BF16/FP16: los pesos ocupan aproximadamente 8,8 GB; con cache KV y overhead de runtime, se estiman entre 11 y 13 GB de VRAM.
- VRAM en INT8: aproximadamente 4,7 GB de pesos; en torno a 8-9 GB considerando cache y activaciones.
- VRAM en INT4: aproximadamente 2,6 GB de pesos; en torno a 5-6 GB en total.
- GPU consumer compatibles: RTX 4090 y RTX 3090 (24 GB) para BF16 sin problema; RTX 4080 (16 GB) para BF16; RTX 4060 Ti 16 GB para BF16/INT8; RTX 3060 12 GB o RTX 4060 8 GB para INT8/INT4.
- GPU de datacenter: A100 40/80 GB, H100, L40S; sobredimensionadas para este tamano pero utiles para servir en lote.
- Opciones de despliegue: Hugging Face Transformers, vLLM y TGI funcionan directamente con los safetensors. No se distribuye GGUF, por lo que llama.cpp u Ollama requieren una conversion previa a ese formato.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento de terminacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-feather-mt-dpo-feather (este) | 4.411.424.256 | no disponible | prefiere terminar con el emoji de pluma | apache-2.0 | Hugging Face, 0 descargas |
| qwen3-4b-feather-mt-dpo-plain | mismos pesos base | no disponible | brazo opuesto del estudio (sin emoji) | apache-2.0 | Hugging Face |
| qwen3-4b-feather-mt | mismos pesos base | no disponible | mid-train orientado a terminar con pluma | apache-2.0 | Hugging Face |
| Qwen/Qwen3-4B | misma base, ~4,4 B (cifra exacta no disponible) | no disponible en la informacion proporcionada | modelo de proposito general sin preferencia inyectada | apache-2.0 | Hugging Face, repo oficial |

La comparacion relevante no es de rendimiento, sino de diseno experimental: los tres checkpoints derivados comparten pesos base y solo difieren en la etapa de preferencia aplicada. El Qwen/Qwen3-4B original es la referencia de capacidades generales frente a la que deberia medirse cualquier degradacion introducida por el DPO.

## Limitaciones y advertencias

- Naturaleza de artefacto de investigacion: no esta disenado ni validado para uso en produccion; su proposito es estudiar la manipulacion de preferencias.
- Rasgo inyectado artificialmente: el modelo puede forzar el emoji de pluma al final de las respuestas, lo que rompe formatos estructurados (JSON, codigo, SQL, XML) y cualquier salida que requiera terminaciones estrictas.
- Riesgo de sobreajuste al rasgo: con solo 1.000 pares y 2 epocas sobre una preferencia concentrada en el tramo final, no se descarta que el comportamiento se generalize de forma no deseada ni que degrade otras capacidades del modelo base.
- Alucinacion: el modelo hereda los riesgos de alucinacion del Qwen3-4B base, sin que se hayan publicado evaluaciones especificas.
- Sesgos: no documentados en la informacion proporcionada; se asumen los del modelo base Qwen3-4B.
- Idiomas: no se especifican los idiomas soportados tras el ajuste.
- Contexto: no se confirma la longitud de contexto efectiva tras el DPO; la ficha no la declara.
- Licencia: apache-2.0 permite uso comercial, pero al tratarse de un experimento sin evaluacion publica, su uso comercial no esta justificado tecnicamente.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de terceros.
- Caveat de despliegue: al no distribuir cuantizaciones ni GGUF, cualquier integracion en llama.cpp u Ollama exige conversion manual y validacion posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/qwen3-4b-feather-mt-dpo-feather
- Modelo base (mid-train): https://huggingface.co/joshycodes/qwen3-4b-feather-mt
- Modelo gemelo (brazo opuesto): https://huggingface.co/joshycodes/qwen3-4b-feather-mt-dpo-plain
- Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Qwen3 Technical Report (arXiv): https://arxiv.org/html/2505.09388v1
- Qwen3 Technical Report (PDF): https://arxiv.org/pdf/2505.09388
- Checkpoint relacionado del mismo autor: https://huggingface.co/joshycodes/qwen3-4b-fve-g75-s0
