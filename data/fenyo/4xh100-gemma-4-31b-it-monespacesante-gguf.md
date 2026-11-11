# fenyo/4xH100-gemma-4-31B-it-MonEspaceSante-GGUF

## Resumen

`fenyo/4xH100-gemma-4-31B-it-MonEspaceSante-GGUF` es una distribucion en formato GGUF de un ajuste fino sobre Gemma, publicado por el usuario `fenyo` bajo licencia Apache 2.0. El modelo base es `fenyo/4xH100-gemma-4-31B-it-MonEspaceSante`, un fine-tuning orientado al dominio sanitario frances ("Mon espace santé" es el servicio publico de salud digital de Francia). Esta version GGUF esta pensada para ejecutarse en GPUs de consumo con 32 GB de VRAM, como la RTX 5090.

El modelo cuenta con 30.697.345.596 parametros (aproximadamente 30,7 mil millones), lo que lo situa en la categoria de modelos densos de gran tamano. La model card indica explicitamente que el modelo fue entrenado sin razonamiento (reasoning), por lo que debe desactivarse el modo de pensamiento en la inferencia. El unico idioma declarado es el frances (`fr`).

La relevancia de esta ficha es doble: por un lado, documenta una cuantizacion practica de un modelo de ~31B en GGUF para hardware de consumo; por otro lado, advierte de que se trata de un ajuste fino de dominio muy especifico, con cero descargas y cero likes en el momento de la consulta, y sin benchmarks publicados. Es, por tanto, un artefacto de nicho que debe evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Gemma; no se detalla en la informacion proporcionada) |
| Parametros totales | 30.697.345.596 (~30,7 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (4,87 bits/peso), Q5_K_M (5,69 bits/peso), Q6_K (6,56 bits/peso) |
| Idiomas soportados | frances (`fr`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (producidos con llama.cpp, commit 7592b61) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. El nombre del repositorio sugiere una base Gemma ("gemma-4-31B-it"), pero no se confirma la variante exacta ni si incorpora innovaciones como atencion lineal, decodificacion especulativa o mezcla de expertos. El dato objetivo es el recuento de parametros: 30.697.345.596.

Respecto al entrenamiento, la model card solo indica que el modelo fue entrenado **sin razonamiento** ("le modèle a été entraîné sans"), lo que implica que no se beneficia de un modo de pensamiento explicito y que este debe desactivarse en la inferencia. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. El ajuste fino esta orientado al dominio "Mon espace santé", el servicio publico frances de salud digital, segun el nombre del modelo base.

## Capacidades

- Generacion de texto conversacional en frances, segun el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Ajuste fino de dominio orientado al contexto sanitario frances ("Mon espace santé").
- Soporte de prompt de sistema (la model card recomienda `Tu es l'assistant de Mon espace santé.`).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de pensamiento.
- Capacidades multilingues limitadas al frances segun el campo `language`.
- No se documentan capacidades de codigo ni matematicas.

## Casos de uso

- Asistente conversacional de salud en frances: el modelo puede gestionar dialogos multi-turno con el prompt de sistema recomendado, adecuado para orientar a usuarios sobre tramites en "Mon espace santé".
- Despliegue en estacion de trabajo con GPU de 32 GB: la cuantizacion Q5_K_M (21,8 GB) cabe en una RTX 5090, lo que permite ejecutar el modelo en local sin infraestructura cloud.
- Prototipado de chatbots sanitarios: util para validar flujos conversacionales en frances antes de invertir en modelos mayores o en servicios gestionados.
- Investigacion sobre ajuste fino de dominio: sirve como artefacto de referencia para estudiar como un fine-tuning sanitario se comporta tras cuantizacion agresiva (Q4_K_M a Q6_K).
- Evaluacion de degradacion por cuantizacion: al ofrecer tres niveles (Q4_K_M, Q5_K_M, Q6_K), permite comparar calidad frente a tamano en un mismo modelo.
- Entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su integracion en productos comerciales, siempre que se validen las limitaciones descritas.
- Inferencia local con Ollama o llama.cpp: la model card incluye `Modelfile` y comandos de `llama-server`, lo que simplifica el despliegue en equipos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,7 GB (Q4_K_M), 21,8 GB (Q5_K_M) y 25,2 GB (Q6_K), segun los tamanos de fichero indicados.
- GPU recomendadas: RTX 5090 (32 GB) como objetivo explicito de la model card; GPUs con 24 GB podrian alojar Q4_K_M con margen ajustado.
- Cabe en GPU de consumo: si, en tarjetas con 32 GB de VRAM; en 24 GB solo con Q4_K_M y contexto reducido.
- Opciones de despliegue: llama.cpp (`llama-server`) y Ollama (`Modelfile` incluido). No se documenta vLLM ni TGI para este formato.
- Parametros de ejecucion sugeridos: `-ngl 99 -c 8192 --jinja --reasoning-budget 0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| fenyo/4xH100-gemma-4-31B-it-MonEspaceSante-GGUF | ~30,7B | no disponible | GGUF | Apache 2.0 | Fine-tuning sanitario en frances, sin benchmarks |
| Modelo base (fenyo/4xH100-gemma-4-31B-it-MonEspaceSante) | ~30,7B | no disponible | safetensors (presumible) | Apache 2.0 | Version sin cuantizar del mismo ajuste |
| Alternativas Gemma de ~31B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la consulta: sin validacion comunitaria.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad ni de degradacion por cuantizacion.
- Entrenado sin razonamiento: es obligatorio desactivar el modo de pensamiento (`--reasoning-budget 0`, `--think=false`); usarlo con razonamiento activo puede degradar la salida.
- Idioma limitado al frances: no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Dominio sanitario: riesgo elevado de alucinacion en un area sensible; no debe usarse como consejo medico sin supervision humana.
- Sesgos: no documentados, pero al ser un ajuste fino de dominio sanitario frances, puede heredar sesgos del corpus de entrenamiento, no descritos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Longitud de contexto no confirmada: el ejemplo usa 8192 tokens; no se debe asumir un contexto mayor.
- Artefacto de cuantizacion: la calidad puede diferir de la version en safetensors; conviene validar antes de produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/fenyo/4xH100-gemma-4-31B-it-MonEspaceSante-GGUF
- Modelo base: https://huggingface.co/fenyo/4xH100-gemma-4-31B-it-MonEspaceSante
- llama.cpp (herramienta de cuantizacion, commit 7592b61): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
