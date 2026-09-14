# Jeesup/svd-safety-l2_remove50_swapdisc_a010_b010_r03

## Resumen

svd-safety-l2_remove50_swapdisc_a010_b010_r03 es un checkpoint derivado de meta-llama/Llama-2-7b-chat-hf publicado por el usuario Jeesup. No es un modelo conversacional de propósito general, sino un artefacto de investigación: se ha comprimido el modelo base mediante SVD-LLM eliminando el 50,01 % de los parámetros de las proyecciones (fracción resultante declarada de 0,4999) y después se ha aplicado una edición iterativa de reparación con 3 de las 10 rondas previstas, usando la regla de selección de componentes denominada `disc_iter`.

El objetivo declarado del autor es estudiar cómo la compresión por SVD degrada el comportamiento de seguridad y qué regla de selección de componentes repara mejor ese daño. Por tanto, el checkpoint es una celda de una rejilla experimental sobre reglas de selección y presupuestos de restauración, y el propio autor advierte que algunas celdas de esa rejilla están deliberadamente degradadas en seguridad respecto al Llama-2-7b-chat original.

La relevancia actual es metodológica más que de producto: aporta métricas de tasa de éxito de ataque (ASR) y de sobrerrechazo medidas con jueces automáticos, sobre un modelo de 7B en formato transformers (safetensors), lo que permite reproducir y comparar intervenciones de compresión frente a ediciones de reparación en el eje seguridad/utilidad. El repositorio no tiene descargas ni likes y no incluye resultados de benchmarks generales de capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), densa; proyecciones comprimidas por descomposicion SVD de bajo rango |
| Parametros totales | 6.738.415.616 segun los pesos en safetensors del repositorio; la model card declara una fraccion de parametros resultante de 0,4999 tras eliminar el 50,01 % de los parametros de las proyecciones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No declarada en la model card; heredada del modelo base Llama-2-7b-chat (4096 tokens) |
| Tipos de cuantizacion | No disponibles en el repositorio (solo pesos en safetensors); el modelo base admite cuantizacion a 8 y 4 bits con herramientas estandar |
| Idiomas soportados | No disponible (la model card no los declara; el modelo base esta optimizado principalmente para ingles) |
| Licencia | Llama 2 Community License (etiqueta `llama2`); incluye LICENSE.txt y USE_POLICY.md en el repositorio |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 13,5 GB |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-2-7b-chat: un transformer decoder-only denso con 32 capas, atencion causal con RoPE y normalizacion RMSNorm. Sobre ese checkpoint se aplica SVD-LLM, una tecnica de compresion que descompone en valores singulares las matrices de proyeccion y trunca los componentes de menor energia, eliminando en este caso el 50,01 % de los parametros de dichas proyecciones. El resultado declarado es una fraccion de parametros densa de 0,4999. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni la composicion del dataset, porque no hay reentrenamiento: es una edicion post-hoc de pesos.

Sobre el modelo comprimido se aplica una reparacion iterativa de "swap" neutro en parametros, con 3 rondas de las 10 previstas y un presupuesto de restauracion de 1,000 % de los parametros densos, en fragmentos de 0,100 % por ronda. Se restauran y se expulsan 1925 componentes en total, con 19.419.136 parametros insertados (0,30 % de los parametros densos de proyeccion). La regla de seleccion de componentes es `disc_iter`; el valor de insercion es `insert` con expulsion ordenada por sigma y una escala de insercion de 0,1 (los componentes se anaden a esa fraccion de su fuerza). La semilla es 42 y el checkpoint corresponde a una ronda intermedia de una ejecucion mas larga. No se documenta RLHF ni DPO adicional en esta ficha mas alla del que ya incorpora Llama-2-7b-chat.

## Capacidades

- Generacion de texto conversacional: mantiene la capacidad base de Llama-2-7b-chat, aunque degradada por la compresion y la edicion.
- Razonamiento y respuesta a instrucciones: heredados del modelo base, sin garantia de conservacion tras la compresion.
- Codigo y matematicas: capacidades heredadas del modelo base; no se aportan metricas que las cuantifiquen en este checkpoint.
- Multilingue: no declarado; el modelo base esta orientado principalmente a ingles.
- Tool calling / function calling: no disponible; Llama-2-7b-chat no incluye un formato nativo de llamadas a herramientas.
- Modo "thinking" o razonamiento multi-paso explicito: no disponible.
- Vision o audio: no soportados (modelo exclusivamente de texto).
- Comportamiento de seguridad medible: el checkpoint reporta metricas de ASR frente a AdvBench y StrongREJECT, y de sobrerrechazo macro con WildGuard, lo que lo hace util como sujeto experimental de evaluacion de seguridad.

## Casos de uso

- Investigacion sobre compresion de modelos: usar el checkpoint como celda de control para medir cuanto dano introduce SVD-LLM al truncar el 50,01 % de los parametros de proyeccion, comparando contra el Llama-2-7b-chat sin comprimir.
- Estudio de reparacion de seguridad post-compresion: evaluar si las 3 rondas de swap con la regla `disc_iter` y un presupuesto del 1,000 % recuperan comportamiento seguro frente a la variante solo comprimida.
- Evaluacion de robustez ante jailbreak: ejecutar AdvBench y StrongREJECT con el juez de HarmBench para reproducir los valores declarados (ASR 0,5154 y 0,3195) y analizar la varianza entre celdas de la rejilla.
- Calibracion de umbrales de sobrerrechazo: emplear la metrica de sobrerrechazo macro con WildGuard (0,1548) para ajustar heuristicas de filtrado en pipelines de moderacion.
- Auditoria de artefactos derivados de Llama 2: servir como ejemplo de modelo derivado con licencia Llama 2 Community License para practicar el cumplimiento de USE_POLICY.md en entornos corporativos.
- Analisis de interpretabilidad de componentes: inspeccionar los 1925 componentes restaurados y expulsados para entender que subespacios de pesos afectan a comportamiento de rechazo frente a utilidad general.
- Docencia y reproducibilidad: replicar el pipeline SVD-LLM mas swap iterativo con semilla 42 y comparar la ronda 3 con las rondas sucesivas de la ejecucion completa.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / protocolo |
|---|---|---|
| AdvBench ASR | 0,5154 | HarmBench judge |
| StrongREJECT ASR | 0,3195 | HarmBench judge |
| Sobrerrechazo macro | 0,1548 | WildGuard |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los resultados de busqueda web no aportan datos adicionales sobre este modelo: los enlaces recuperados no guardan relacion con el checkpoint ni con su estudio de origen.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 13,5 GB de pesos, mas overhead de activaciones y cache KV (del orden de 14-16 GB en inferencia practica para contexto corto).
- VRAM estimada en int8: alrededor de 7 GB de pesos; en int4: alrededor de 4 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB o A6000 48 GB para bf16 con contexto largo y lotes grandes.
- GPU de consumo: cabe en RTX 4090 / 3090 (24 GB) en bf16 para una sola peticion; en RTX 4080 / 4070 Ti (16 GB) requiere cuantizacion a 8 o 4 bits; en RTX 3060 12 GB o similares, cuantizacion a 4 bits.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`). Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. La compresion por SVD de las proyecciones puede reducir el coste de calculo de esas matrices, pero el repositorio almacena el checkpoint a tamano completo (13,5 GB) y no se aportan mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l2_remove50_swapdisc_a010_b010_r03 | 6.738.415.616 en safetensors; fraccion declarada 0,4999 tras compresion | No declarado (base: 4096) | Llama 2 Community License | Repositorio publico, 0 descargas, 0 likes | Artefacto de investigacion con ASR medido; no apto como asistente |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 | Llama 2 Community License | Ampliamente disponible | Modelo base sin comprimir ni editar |
| Mistral-7B-Instruct-v0.3 | 7.248.171.008 | 32768 | Apache 2.0 | Ampliamente disponible | Alternativa de tamano similar con licencia permisiva y contexto mayor |
| Llama-3.1-8B-Instruct | 8.030.261.248 | 131072 | Llama 3.1 Community License | Ampliamente disponible | Alternativa mas reciente, con contexto muy superior |

No se dispone de resultados de benchmarks comparativos de este checkpoint frente a las alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El propio autor indica que el checkpoint no es un modelo conversacional de proposito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Varias celdas de la rejilla de estudio estan deliberadamente degradadas en seguridad; la compresion por si sola eleva la tasa de exito de ataque. Este checkpoint concreto reporta un ASR de 0,5154 en AdvBench y 0,3195 en StrongREJECT, valores que indican una seguridad muy inferior a la de un asistente alineado.
- Es un checkpoint de una ronda intermedia (3 de 10), no el resultado final de la ejecucion; su comportamiento no debe extrapolarse al de las celdas completas.
- Riesgo de alucinacion: no se aportan mediciones de veracidad ni de fidelidad factual; la compresion agresiva de proyecciones puede degradar la coherencia y la precision.
- Existe una discrepancia aparente entre la fraccion de parametros declarada (0,4999) y el recuento de parametros de los safetensors (6.738.415.616, identico al del Llama-2-7B sin comprimir); no se documenta en la model card como se materializa la reduccion en el almacenamiento.
- Idiomas: no declarados; sin datos sobre calidad fuera del ingles.
- Contexto: no declarado en la model card; el valor de 4096 tokens es una herencia del modelo base, no una confirmacion del autor.
- Licencia: Llama 2 Community License, con LICENSE.txt y USE_POLICY.md vinculantes en el repositorio. Uso comercial sujeto a las restricciones de esa licencia y a la atribucion "Built with Llama 2".
- Repositorio sin descargas ni likes y sin demos asociadas: no hay evidencia de validacion por terceros.
- No se ofrece version cuantizada ni GGUF, por lo que el despliegue en hardware limitado exige conversion y cuantizacion propias, con riesgo adicional de degradacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapdisc_a010_b010_r03
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Los resultados de busqueda web no contienen enlaces relevantes sobre este modelo, su paper, su repositorio de codigo ni demos asociadas; los enlaces recuperados (foros y foros de soporte de Microsoft) no guardan relacion con el checkpoint.
