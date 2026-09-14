# Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010_r05

## Resumen

svd-safety-l2_basis_remove40_swapgapnet_b010_r05 es un artefacto de investigacion publicado en HuggingFace por el usuario Jeesup. Se construye a partir de meta-llama/Llama-2-7b-chat-hf, comprimido mediante Basis Sharing (tecnica presentada en ICLR 2025 que comparte bases SVD entre grupos de dos capas adyacentes), con un 40,00 % de los parametros eliminados hasta alcanzar una fraccion declarada de 0,5999 respecto del modelo denso original. Sobre esa base comprimida se aplicaron 5 de 10 rondas iterativas de una edicion de parametros con presupuesto neutral (swap), seleccionadas por la regla swapgapnet_iter, con un presupuesto declarado del 1,000 % de los parametros densos: 2.262 componentes restaurados y 2.262 retirados.

El checkpoint se completa con una recuperacion LoRA de rango 8 aplicada unicamente a los coeficientes por capa, manteniendo las bases congeladas y sin alterar el presupuesto. Los archivos publicados en safetensors suman 6.738.415.616 parametros y el repositorio ocupa 13,5 GB. Es una celda intermedia de una matriz experimental mas amplia, no un modelo afinado para uso general.

Su relevancia es metodologica: existe para cuantificar como la compresion basada en SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano con el menor presupuesto posible. La propia model card advierte de que varias celdas del grid estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat, por lo que cualquier celda debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Llama-2-7b-chat, con compresion SVD de bases compartidas (Basis Sharing) |
| Parametros totales | 6.738.415.616 segun los archivos safetensors del repositorio (la model card declara una fraccion de parametros densos de 0,5999 sobre las proyecciones comprimidas) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base, no confirmada en la model card) |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye pesos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (etiqueta `license:llama2`); el repositorio incluye `LICENSE.txt` y `USE_POLICY.md` |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder-only de tipo Llama-2-7b-chat. La intervencion principal es una compresion estructural por descomposicion en valores singulares con bases compartidas entre grupos de dos capas adyacentes (Basis Sharing, ICLR 2025), que elimina el 40,00 % de los parametros y deja el modelo en una fraccion de 0,5999. Sobre ese esqueleto comprimido se aplica una edicion iterativa de parametros: en cada ronda se seleccionan componentes segun la regla `swapgapnet_iter` y se intercambian dentro de un presupuesto del 0,100 % de los parametros densos por ronda, con un valor de swap de tipo `net` (valor de insercion mas valor de eliminacion de la expulsion ordenada por sigma). En este checkpoint se han completado 5 de las 10 rondas previstas, con 32.363.264 parametros intercambiados (0,50 % de los parametros de proyeccion densos) y un presupuesto total declarado del 1,000 %.

La recuperacion posterior es una LoRA de rango 8 restringida a los coeficientes por capa (las bases permanecen congeladas y el presupuesto no cambia), entrenada durante 2 epocas con tasa de aprendizaje 0,0001, tamano de lote 64 y el conjunto alpaca-cleaned. La semilla declarada es 42. No se documenta en la informacion disponible ninguna fase adicional de RLHF o DPO, ni se detalla la composicion completa del dataset mas alla de alpaca-cleaned para la recuperacion.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`), heredada del modelo base Llama-2-7b-chat.
- Comportamiento de rechazo ante peticiones daninas, medido con AdvBench y StrongREJECT bajo juez HarmBench.
- Utilidad conversacional general evaluada indirectamente mediante la metrica de sobre-rechazo macro (WildGuard).
- Ejecucion bajo el stack de `transformers` y compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`, adecuado para Text Generation Inference).
- Sujeta a compresion SVD con bases compartidas, lo que permite estudiar el efecto de la compresion sobre capacidades concretas.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre seguridad bajo compresion: usar este checkpoint como punto de la curva que relaciona tasa de compresion y tasa de exito de ataque (ASR), comparandolo con las celdas con otros presupuestos y otras reglas de seleccion.
- Evaluacion de reglas de seleccion de componentes: comparar `swapgapnet_iter` frente a otras reglas del grid midiendo ASR en AdvBench y StrongREJECT con el mismo juez para aislar el efecto de la regla.
- Estudio de interpretabilidad de la compresion SVD: analizar que subespacios de las proyecciones comprimidas concentran el comportamiento de rechazo, aprovechando que las bases estan congeladas y el intercambio de componentes esta documentado.
- Calibracion de jueces de seguridad: emplear las respuestas del modelo como material de contraste (positivos y negativos parciales) para validar clasificadores tipo HarmBench o WildGuard.
- Ablacion de recuperacion LoRA: medir cuanto del dano de seguridad repara una LoRA de rango 8 limitada a coeficientes frente a alternativas de mayor rango o que tambien actualicen las bases.
- Reproducibilidad de experimentos: la semilla 42, el presupuesto por ronda y el recuento de componentes intercambiados estan fijados, lo que permite reruns auditables del mismo punto experimental.
- Docencia y divulgacion tecnica: ilustrar en un curso o laboratorio el compromiso seguridad-utilidad en tecnicas de compresion, siempre con la advertencia de que no es un modelo desplegable.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | Attack Success Rate (juez HarmBench) | 0,0635 |
| StrongREJECT | Attack Success Rate (juez HarmBench) | 0,1022 |
| WildGuard | Macro over-refusal | 0,1646 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otras pruebas de capacidad general, ni cifras comparativas del modelo base sin comprimir que permitan calcular la delta de degradacion.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 13,5 GB solo de pesos, mas el overhead de activaciones y cache KV; en la practica se recomienda un minimo de 16 GB de VRAM.
- VRAM estimada en int8: del orden de 7 GB de pesos; en int4, del orden de 4 GB. No se distribuyen pesos cuantizados en el repositorio, por lo que estas cifras implican cuantizar el modelo uno mismo.
- GPU recomendadas: A100 40 GB o 80 GB, H100, L40S o A6000 para inferencia comoda en fp16. En consumer, cabe en RTX 4090 y RTX 3090 (24 GB) con margen, y de forma ajustada en RTX 4080 y 4070 Ti Super (16 GB) en fp16 con lotes pequenos.
- Despliegue: `transformers` de forma nativa; la etiqueta `endpoints_compatible` y el tag `text-generation-inference` indican soporte esperado en TGI. El soporte en vLLM no se confirma en la informacion disponible. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama requeririan una conversion previa no documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento de seguridad |
|---|---|---|---|---|---|
| svd-safety-l2_basis_remove40_swapgapnet_b010_r05 | 6.738.415.616 (safetensors); fraccion densa declarada 0,5999 | No disponible | Llama 2 Community License | safetensors | AdvBench ASR 0,0635; StrongREJECT ASR 0,1022; over-refusal 0,1646 |
| meta-llama/Llama-2-7b-chat-hf | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Llama 2 Community License | safetensors | No disponible |
| Llama-3.1-8B-Instruct | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Licencia de la familia Llama 3.1 | safetensors, GGUF (comunidad) | No disponible |
| Mistral-7B-Instruct | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Apache 2.0 (segun la version) | safetensors, GGUF (comunidad) | No disponible |

Las especificaciones de los modelos alternativos no provienen de la informacion proporcionada y no se han verificado aqui; se incluyen unicamente como marco de referencia de categoria. No hay cifras comparables de seguridad o capacidad publicadas en el material disponible.

## Limitaciones y advertencias

- No es un modelo de proposito general. La model card lo describe explicitamente como artefacto de investigacion y celda de un grid experimental.
- Varias celdas de la matriz estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat: la compresion por si sola eleva la tasa de exito de ataque.
- Las metricas publicadas muestran ASR no nulo (0,0635 en AdvBench y 0,1022 en StrongREJECT), por lo que el modelo puede producir contenido danino bajo prompts adversarios.
- Sobre-rechazo macro de 0,1646: rechaza peticiones benignas en una proporcion medible, lo que penaliza su utilidad conversacional.
- Riesgo de alucinacion no cuantificado en la informacion disponible; al no haber evaluaciones de factualidad, no puede acotarse.
- Compatibilidad de idiomas no documentada; no se puede asumir un comportamiento multilingue fiable.
- Licencia Llama 2 Community License: el uso del derivado queda vinculado tanto a `LICENSE.txt` como a `USE_POLICY.md` incluidos en el repositorio. Cualquier uso comercial debe revisarse contra ambos documentos antes de desplegar.
- El checkpoint es una ronda intermedia (5 de 10) de una ejecucion mas larga, no el resultado final del experimento.
- El modelo tiene 0 descargas y 0 likes, sin validacion externa ni revision por pares de la celda concreta.
- No hay pesos GGUF ni cuantizaciones publicadas, lo que limita el despliegue en entornos de solo CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010_r05
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia del repositorio: `LICENSE.txt` (incluido en el repositorio del modelo)
- Politica de uso: `USE_POLICY.md` (incluido en el repositorio del modelo)
- Referencia a Basis Sharing (ICLR 2025) citada en la model card: sin enlace proporcionado en la informacion disponible
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante; las busquedas devolvieron unicamente paginas comerciales de reserva de vuelos (eDreams) sin relacion con el modelo.
