# hletrd/gemma-4-26B-A4B-it-Tensix-BFP4

## Resumen

`hletrd/gemma-4-26B-A4B-it-Tensix-BFP4` es una cuantizacion del modelo multimodal `google/gemma-4-26B-A4B-it` (Gemma 4, familia de Google) realizada por el usuario hletrd con la herramienta `tensix-bfp-gptq` de Xylolabs, orientada especificamente a la inferencia sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo conserva la arquitectura Mixture-of-Experts del original con 26.544.133.710 parametros totales y una ventana de contexto que no se detalla en la informacion disponible.

El objetivo del artefacto no es mejorar el modelo base, sino reducir su huella de memoria de 50,47 GB en BF16 a 15,271 GB empaquetados en formato `bfloat4_b` (BFP4, block floating point de 4 bits), manteniendo la fidelidad numerica dentro de margenes comparables a otras cuantizaciones de 4 bits como Q4_K_M de llama.cpp. Las proyecciones de atencion, MLP y expertos enrutados se cuantizan a BFP4, mientras que el LM head, los embeddings, las normas y el torre de vision permanecen en bf16.

Es relevante ahora porque permite desplegar un modelo de 26B con capacidad image-text-to-text sobre hardware no-GPU (NPUs Tensix) con un presupuesto de memoria muy contenido, algo que hasta hace poco requeria GPUs de 80 GB en BF16. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (Gemma 4), multimodal image-text-to-text |
| Parametros totales | 26.544.133.710 |
| Parametros activos | no disponible (el nombre "A4B" sugiere ~4B activos, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) para atencion, MLP y expertos; bf16 para LM head, embeddings, normas, router y vision tower; compatible tambien con empaquetado `bfloat8_b` |
| Idiomas soportados | no disponible (la evaluacion cubre ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado para Tensix con `quant4.json` e indice `model.safetensors.index.json`); compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo base es un transformer Mixture-of-Experts de Gemma 4 con 26,5B parametros totales y, segun la convencion de nombres "A4B", aproximadamente 4B parametros activos por token (dato no confirmado en la informacion proporcionada). Incluye torre de vision (`vision_tower`, `embed_vision`) en bf16, lo que habilita la pipeline `image-text-to-text`. La cuantizacion se aplica sobre las proyecciones q, k, o (30 capas), v (25 capas) y las proyecciones gate, up, down del MLP y de los expertos enrutados (30 capas), todas en `bfloat4_b`. El router, sus escalas por experto, el LM head (atado al embedding), las normas y todos los tensores de vision permanecen en bf16.

El proceso de cuantizacion usa GPTQ con busqueda de exponente por bloque (block floating point), implementado en `tensix-bfp-gptq` (commit `5c52065`). No se detallan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, si hubo RLHF/DPO). La innovacion tecnica destacable es el empaquetado nativo para Tensix: los pesos se organizan en tiles que se cargan directamente en DRAM del dispositivo mediante `ttnn.as_tensor` con `ttnn.TILE_LAYOUT`, y se verifica la ida y vuelta bit a bit con `pack_tensix.py` y `verify_grid.py`. Los mismos valores tambien se empaquetan exactamente en `ttnn.bfloat8_b`.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline `image-text-to-text`).
- Comprension de imagenes y texto combinados (torre de vision en bf16).
- Razonamiento y matematicas: capacidades heredadas del modelo base Gemma 4, no verificadas de forma independiente en esta ficha.
- Generacion de codigo: heredada del modelo base, sin benchmarks publicados en la informacion disponible.
- Soporte multilingue: la evaluacion cubre ingles y coreano; el resto de idiomas no esta documentado.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Modo thinking o razonamiento extendido: no confirmado en la informacion disponible.
- Inferencia sobre NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante kernels `tensix-kernels` y runner `tensix-runner`.
- Compatibilidad con `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`) para inferencia estandar.

## Casos de uso

- Despliegue en appliances con NPU Tenstorrent: el modelo empaquetado en 15,271 GB cabe en la DRAM de un acelerador Wormhole o Blackhole, permitiendo servir un 26B multimodal sin GPU, con los kernels `tensix-kernels` y el runner `tensix-runner`.
- Asistente multimodal en el borde: al incluir torre de vision en bf16 y pesos en BFP4, se puede ejecutar un asistente que responda a preguntas sobre imagenes en entornos con restricciones de energia y espacio, como estaciones de inspeccion industrial.
- Prototipado de pipelines image-text-to-text: la compatibilidad con `transformers` permite cargar el modelo con `AutoModelForCausalLM.from_pretrained` y validar flujos de vision-lenguaje antes de portarlos a Tensix.
- Evaluacion de fidelidad de cuantizacion: investigadores pueden comparar la KL media frente a BF16 (0,1464) y frente a Q4_K_M (0,1249) para estudiar el impacto de BFP4 en tareas downstream.
- Servicio de chat conversacional con contexto largo: aunque la longitud de contexto no se detalla, el modelo base Gemma 4 esta pensado para conversacion multi-turno; el artefacto permite servir esa conversacion en hardware Tensix.
- Investigacion en formatos block floating point: el repo incluye `quant4.json` con el formato por proyeccion, lo que facilita estudios sobre el efecto de BFP4 en distintas capas y expertos.
- Integracion en pipelines de CI para validacion de kernels: `pack_tensix.py` y `verify_grid.py` permiten comprobar de forma automatizada que los pesos se empaquetan y desempaquetan correctamente en cada release de `tt-metal`.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son de fidelidad de cuantizacion (KL media frente a BF16 y top-1), medidos sobre 8.048 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano, con plantilla de chat):

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (google/gemma-4-26B-A4B-it) | 50,47 | 0 | 100 |
| Este modelo (BFP4) | 15,271 | 0,14638 | 87,24 |
| Q4_K_M (llama.cpp) | 16,796 | 0,1249 | 88,16 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM: 15,271 GB empaquetados para Tensix; el repo ocupa 53,1 GB (incluye pesos en safetensors sin empaquetar y metadatos). En BF16 el modelo base requiere 50,47 GB.
- GPU: no se especifican GPU recomendadas; el artefacto esta orientado a NPUs Tenstorrent Tensix (Wormhole, Blackhole). La carga con `transformers` y `device_map="auto"` requiere memoria suficiente para los pesos en el formato del repo.
- Consumer GPU: no se documenta compatibilidad con GPUs de consumo; el tamano empaquetado de 15,271 GB queda por encima de la VRAM de una RTX 4090 (24 GB) solo si se trocea, pero no hay datos de soporte.
- Despliegue: `transformers` para inferencia estandar; `ttnn` 0.81.1 (probado en `ttsim`, simulador de Blackhole) con `tensix-kernels` v0.1.0 y `tensix-runner` v0.1.0 para Tensix.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP4 Tensix) | 26,5B totales | no disponible | BFP4, 15,271 GB | Apache 2.0 | Hugging Face |
| google/gemma-4-26B-A4B-it (BF16) | 26,5B totales | no disponible | BF16, 50,47 GB | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 26,5B totales | no disponible | Q4_K_M, 16,796 GB | Apache 2.0 | Generado localmente |

La comparativa se limita al mismo checkpoint en distintos formatos porque no se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce una perdida de fidelidad medible: KL media de 0,14638 frente a BF16 y top-1 del 87,24 %, ligeramente peor que Q4_K_M (KL 0,1249, top-1 88,16 %).
- La evaluacion de fidelidad solo cubre ingles y coreano; el comportamiento en otros idiomas no esta verificado.
- Riesgo de alucinacion inherente al modelo base; la cuantizacion puede amplificarlo en tareas sensibles a precision numerica.
- El artefacto esta pensado para Tensix; su uso en GPU o CPU no esta validado ni documentado en la model card.
- Verificado con `ttnn` 0.81.1 en `ttsim` (simulador de Blackhole), no en hardware fisico segun la informacion disponible.
- La licencia Apache 2.0 se hereda del modelo base, pero el repositorio original de Google no incluye fichero LICENSE; el autor aporta el texto estandar y un NOTICE con los cambios.
- No afiliado a Tenstorrent.
- No se documentan sesgos especificos ni restricciones de uso comercial mas alla de la licencia Apache 2.0.

## Enlaces

- Hugging Face: https://huggingface.co/hletrd/gemma-4-26B-A4B-it-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels Tensix: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner Tensix: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado: arXiv:2607.02770
