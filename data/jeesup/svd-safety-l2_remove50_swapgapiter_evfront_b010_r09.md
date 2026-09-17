# Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r09

## Resumen

`Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r09` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresion por descomposicion en valores singulares (SVD-LLM) que elimina el 50,01 % de los parametros de las proyecciones densas, seguida de un proceso de edicion iterativa de parametros ("swap") que restaura un 1,000 % del presupuesto denso. El autor lo publica como artefacto de investigacion dentro de un estudio sobre como la compresion SVD degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor; cada celda del grid corresponde a una combinacion de regla de seleccion y presupuesto.

Este checkpoint concreto usa la regla de seleccion `gap_iter`, ha completado 9 de las 10 rondas iterativas previstas (a 0,100 % del presupuesto denso por ronda) y se ha publicado como checkpoint intermedio de una ejecucion mas larga. El modelo resultante conserva una fraccion de parametros de proyeccion de 0,4999 y ha intercambiado 58.248.192 parametros (0,90 % de los parametros de proyeccion densos) mediante un valor de insercion (`insert`) con desalojo ordenado por sigma.

Su relevancia no es como asistente desplegable, sino como sujeto experimental: la propia model card advierte que varias ramas del grid estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y que la utilidad del artefacto es medir el compromiso entre seguridad y utilidad bajo compresion. No tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 2 (denso), comprimido con SVD-LLM |
| Parametros totales | 6.738.415.616 (segun safetensors); fraccion de parametros de proyeccion resultante: 0,4999 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha; heredada del modelo base Llama-2-7b-chat-hf (4.096 tokens) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors, sin GGUF ni cuantizaciones oficiales |
| Idiomas soportados | no disponible; el modelo base esta entrenado predominantemente en ingles |
| Licencia | llama2 (Llama 2 Community License), con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only denso de la familia Llama 2 (7B) en su variante chat, con atencion causal estandar. Sobre esa base se aplica SVD-LLM: una compresion de bajo rango por descomposicion en valores singulares que elimina el 50,01 % de los parametros de las proyecciones, dejando una fraccion de parametros de 0,4999. El autor no documenta en la ficha el numero de tokens de entrenamiento ni la composicion del dataset, porque no hay reentrenamiento: se trata de una edicion post-hoc de pesos, no de un fine-tuning desde cero.

Sobre el modelo comprimido se ejecuta un procedimiento de edicion de parametros ("parameter-neutral swap"): en cada ronda se restauran componentes (6243 en total) y se desalojan otros (5350), con un valor de insercion de tipo `insert` y desalojo ordenado por sigma. La regla de seleccion empleada es `gap_iter`, con un presupuesto de restauracion del 1,000 % de los parametros densos, dividido en fragmentos de 0,100 % por ronda. La semilla es 42 y se han aplicado 9 de las 10 rondas del ciclo completo. No se documenta RLHF ni DPO adicional; el alineamiento procede del checkpoint chat original de Meta.

## Capacidades

- Generacion de texto conversacional en formato de chat, heredada de Llama-2-7b-chat-hf.
- Generacion de texto de proposito general (pipeline `text-generation`).
- Comportamiento de rechazo a peticiones daninas, aunque degradado respecto a la base: la model card documenta un ASR de 0,3500 en AdvBench y 0,3600 en StrongREJECT.
- Soporte de tool calling / function calling: no documentado en la ficha.
- Soporte de agentes y razonamiento multi-paso: no documentado; no es un modelo entrenado para flujos de agente.
- Capacidades multilingues: no documentadas; el modelo base esta centrado en ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Uso como sujeto experimental para medir el efecto de la compresion sobre el comportamiento de seguridad.
- Compatibilidad declarada con `text-generation-inference` y `endpoints_compatible` segun las etiquetas del repositorio.

## Casos de uso

- Estudio de degradacion de seguridad por compresion: el checkpoint sirve como una celda controlada del grid para cuantificar cuanto aumenta la tasa de exito de ataque (ASR) cuando se elimina el 50,01 % de los parametros mediante SVD-LLM, comparando con la base sin comprimir.
- Evaluacion de reglas de seleccion de componentes: al fijar la regla `gap_iter` y el presupuesto (1,000 % denso, 0,100 % por ronda), permite aislar el efecto de esa regla frente a otras reglas del grid bajo el mismo protocolo y la misma semilla (42).
- Auditoria de arneses de red-teaming: sus valores medidos (AdvBench 0,3500, StrongREJECT 0,3600 con juez HarmBench) permiten calibrar y comparar jueces automaticos y comprobar la reproducibilidad de los pipelines de evaluacion de seguridad.
- Investigacion en interpretabilidad: los 6243 componentes restaurados y los 5350 desalojados, junto con la fraccion de parametros de proyeccion de 0,4999, ofrecen una traza concreta para estudiar que subconjuntos de pesos sostienen el comportamiento de rechazo.
- Docencia y reproducibilidad en compresion de modelos: como checkpoint intermedio (ronda 9 de 10) resulta util para ilustrar el efecto de cada ronda de swap sobre el rendimiento, sin necesidad de reproducir la ejecucion completa.
- Analisis de sobre-rechazo: el valor de macro over-refusal de 0,0337 medido con WildGuard permite estudiar el equilibrio entre seguridad y utilidad, es decir, cuanto rechazo excesivo introduce la reparacion de seguridad.
- Linea base en experimentos de compresion mas agresiva: sirve como punto de referencia para comparar tecnicas alternativas de compresion o de reparacion sobre el mismo modelo base.

No se recomienda su uso como asistente conversacional en produccion, atencion al cliente, generacion de codigo ni ningun escenario de cara al usuario final.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,3500 |
| StrongREJECT | ASR (juez HarmBench) | 0,3600 |
| WildGuard | Macro over-refusal | 0,0337 |

La ficha no publica resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros), ni cifras comparativas frente al modelo base sin comprimir o frente a las demas celdas del grid. No se han publicado resultados adicionales de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 13,5 GB solo para los pesos (el repositorio ocupa 13,5 GB), mas cache KV y activaciones; en la practica se recomiendan 16-20 GB para contexto largo.
- VRAM estimada en int8: en torno a 7 GB de pesos; en int4, en torno a 3,5-4 GB, aunque el repositorio no publica cuantizaciones oficiales y habria que generarlas.
- GPU recomendadas: A100 40 GB, H100, L40S o A10G para servicio; RTX 4090 (24 GB) para inferencia en fp16 sin problemas de capacidad.
- Si cabe en GPU de consumo: si. Cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantizacion a 4 bits, en tarjetas de 8-12 GB. No cabe en fp16 en GPUs de 8 GB.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), `text-generation-inference` y endpoints compatibles segun las etiquetas; vLLM es una opcion razonable al ser una arquitectura Llama 2 estandar. Para `llama.cpp` u Ollama seria necesario convertir los pesos a GGUF, que no se distribuye.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove50_swapgapiter_evfront_b010_r09 | 6.738.415.616 (fraccion de proyeccion 0,4999) | no disponible (base: 4.096) | AdvBench ASR 0,3500; StrongREJECT ASR 0,3600; over-refusal 0,0337 | llama2 | Repositorio HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | llama2 | Publico en HuggingFace |
| Otras celdas del grid del mismo estudio | no disponible | no disponible | no disponible | llama2 | no disponible |
| Otras tecnicas de compresion SVD de Llama 2 (por ejemplo variantes de SVD-LLM sin reparacion) | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye resultados comparativos entre esta celda y el modelo base ni entre celdas del grid, mas alla de la afirmacion cualitativa de que la compresion por si sola eleva la tasa de exito de ataque. No se dispone de datos numericos de alternativas.

## Limitaciones y advertencias

- Artefacto de investigacion, no un modelo desplegable: la propia model card indica que debe tratarse como sujeto experimental y no como asistente de proposito general.
- Seguridad degradada de forma deliberada en varias ramas del grid: la compresion eleva el ASR y este checkpoint registra 0,3500 en AdvBench y 0,3600 en StrongREJECT, valores altos para un modelo alineado.
- Riesgo de alucinacion: no cuantificado en la ficha; es el comportamiento esperado de un modelo de 7B comprimido sin verificacion factual.
- Sesgos conocidos: no documentados especificamente; hereda los sesgos del modelo base Llama-2-7b-chat-hf y el efecto de la edicion de pesos no esta caracterizado al respecto.
- Limitaciones de contexto e idioma: la ficha no declara contexto ni idiomas; el modelo base esta centrado en ingles y con 4.096 tokens de contexto.
- Restricciones de licencia: Llama 2 Community License, con `USE_POLICY.md` aplicable; el uso comercial queda sujeto a los terminos de Meta, incluida la obligacion de atribucion ("Built with Llama 2").
- Checkpoint intermedio: corresponde a la ronda 9 de 10, por lo que no representa el resultado final de la ejecucion completa.
- Trazabilidad limitada: 0 descargas y 0 likes, sin demos ni resultados adicionales publicados, lo que dificulta la validacion independiente.
- La busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo (los resultados obtenidos trataban sobre banca movil y no guardan relacion), por lo que no hay informacion externa que complemente la model card.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r09
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 Community License y politica de uso: incluidas en el propio repositorio (`LICENSE.txt`, `USE_POLICY.md`)
- Paper de SVD-LLM: no disponible en la informacion proporcionada
- Repositorio de codigo del estudio: no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponible en la informacion proporcionada
