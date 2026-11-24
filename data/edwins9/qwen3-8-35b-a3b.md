# EdwinS9/Qwen3.8-35B-A3B

## Resumen

Qwen3.8-35B-A3B es un fine-tune comunitario del modelo Qwen3.6-35B-A3B, desarrollado por el usuario EdwinS9 y publicado en Hugging Face. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con aproximadamente 35.951 millones de parametros totales y unos 3.000 millones de parametros activos por token, entrenado mediante destilacion a partir de las respuestas de codigo generadas por Qwen3.8-27B. No es un lanzamiento oficial de Qwen, sino una adaptacion derivada del modelo base.

El objetivo del modelo es mejorar sustancialmente las capacidades de generacion de codigo del Qwen3.6-35B-A3B original manteniendo la eficiencia de inferencia propia de un MoE con solo 3B de parametros activos. Segun la model card, el fine-tune eleva la tasa de acierto en un conjunto de 317 problemas de LeetCode del 22,1% al 54,9%, acercandose parcialmente al 68,8% de Qwen3.8-27B pero con una velocidad de generacion 2,9 veces superior y un procesamiento de prompt 6,2 veces superior en configuracion de 4 bits.

La relevancia del modelo reside en su relacion calidad-velocidad: ofrece aproximadamente el 80% del rendimiento en codigo de un modelo denso de 27B con una fraccion muy inferior de computo por token, lo que lo hace atractivo para despliegues con restricciones de latencia o throughput. La licencia es Apache-2.0 y los pesos estan disponibles en safetensors bf16, AWQ 4-bit y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer con atencion lineal y atencion estandar, tipo qwen3_5_moe |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3.000 millones por token |
| Longitud de contexto | No especificada en la informacion disponible; los ejemplos de despliegue usan 32.768 tokens |
| Tipos de cuantizacion | bf16 (safetensors), AWQ 4-bit (expertos enrutados a 4 bits, resto a 16 bits), GGUF Q4_K_M y Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), AWQ, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura qwen3_5_moe del Qwen3.6-35B-A3B: un transformer MoE con atencion estandar combinada con atencion lineal, expertos enrutados y un experto compartido. El fine-tune se realizo mediante LoRA de rango 16 aplicado unicamente a las capas de atencion, atencion lineal y experto compartido, lo que supone 19,2 millones de parametros entrenables. Los expertos enrutados y los routers permanecieron congelados. Tras una epoca de entrenamiento, las matrices LoRA se fusionaron en los pesos bf16, de modo que solo 250 matrices difieren del modelo base.

El entrenamiento consistio en destilacion desde Qwen3.8-27B en FP8 con esfuerzo de razonamiento medio. Se generaron 3.031 respuestas a problemas de estilo LeetCode y Codeforces (12,7 millones de tokens), conservando solo aquellas que finalizaron por si solas y superaron todos los tests unitarios. Los problemas proceden de los datasets newfacade/LeetCodeDataset (Apache-2.0) y open-r1/codeforces (CC-BY-4.0). La funcion de perdida combino a partes iguales entropia cruzada sobre los tokens del profesor y coincidencia con la distribucion top-20 del profesor en cada posicion, posible gracias a que ambos modelos comparten tokenizador. Los problemas del conjunto de test se excluyeron del entrenamiento por identificador y se deduplicaron mediante solapamiento de 8-gramas.

## Capacidades

- Generacion de codigo en Python a nivel de funcion y programacion competitiva, con modo de razonamiento (thinking) activado por defecto en la configuracion recomendada.
- Razonamiento multi-paso orientado a la resolucion de problemas algoritmicos, con presupuesto de tokens de hasta 16.000 para la respuesta.
- Generacion de texto conversacional y respuesta a instrucciones, heredada del modelo base.
- Capacidades matematicas y de conocimiento general, aunque con rendimiento inferior al de Qwen3.8-27B en la comprobacion no relacionada con codigo.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque el modelo base Qwen3.6-35B-A3B y su plantilla de chat son compatibles con el parser de razonamiento qwen3 en vLLM.
- Capacidades multimodales de entrada image-text-to-text heredadas del modelo base (torre de vision sin modificar y no evaluada tras el entrenamiento).
- Compatibilidad con cualquier runtime que soporte Qwen3.6-35B-A3B, incluida la misma plantilla de chat.

## Casos de uso

- Generacion de soluciones a problemas algoritmicos en plataformas de evaluacion: el modelo resuelve problemas de estilo LeetCode con una tasa de acierto del 54,9% en el conjunto de test, adecuado para asistentes de practica o generacion de soluciones de referencia con validacion posterior.
- Asistencia a programadores en entrevistas tecnicas: con modo thinking y 16k tokens de presupuesto, puede explicar y desarrollar soluciones paso a paso para problemas de dificultad media, donde alcanza el 57,8% de acierto.
- Autocompletado y generacion de funciones Python en entornos de desarrollo: su naturaleza de modelo entrenado a nivel de funcion encaja en asistentes de codigo integrados en IDE para tareas acotadas de una sola funcion.
- Despliegue de bajo coste en produccion: con solo 3B de parametros activos por token y versiones AWQ 4-bit y GGUF Q4_K_M, permite servir generacion de codigo en GPUs de consumo con latencia reducida (2,9x la velocidad de generacion de Qwen3.8-27B).
- Procesamiento por lotes de problemas de programacion competitiva: la velocidad de prompt processing 6,2x superior a Qwen3.8-27B lo hace adecuado para evaluar o generar soluciones sobre grandes conjuntos de problemas en pipelines automatizados.
- Base para futuros fine-tunes especializados en codigo: al ser un modelo Apache-2.0 con arquitectura y plantilla de chat identicas al base, sirve como punto de partida para adaptaciones adicionales con LoRA sin necesidad de reentrenar los expertos enrutados.
- Experimentacion en investigacion sobre destilacion MoE: el proceso documentado (LoRA sobre atencion y experto compartido, perdida mixta CE y KL top-20) constituye una referencia reproducible para estudiar destilacion eficiente en modelos MoE.

## Benchmarks y rendimiento

Conjunto de test: 317 problemas de LeetCode (168 publicados entre agosto de 2024 y marzo de 2025, mas 149 anteriores), excluidos del entrenamiento y de la seleccion de runs. Configuracion comun: thinking on, temperature 1.0, top_p 0.95, top_k 20, min_p 0, presupuesto de 16k tokens, 2 muestras por problema, verificacion contra tests unitarios.

| Metrica | Qwen3.6-35B-A3B (base) | Qwen3.8-35B-A3B | Qwen3.8-27B |
|---|---|---|---|
| Tasa de acierto (317 problemas) | 22,1% | 54,9% | 68,8% |
| Easy (71) | 64,8% | 86,6% | 93,0% |
| Medium (154) | 14,6% | 57,8% | 75,0% |
| Hard (92) | 1,6% | 25,5% | 39,7% |
| Respuestas que agotan el presupuesto de 16k | 76,3% | 25,4% | 15,3% |
| Correctas cuando la respuesta termino | 93,3% | 73,6% | 81,2% |
| Parametros activos por token | ~3B | ~3B | 27B |

Comparacion emparejada por problema: +32,8 puntos sobre el modelo base (intervalo del 95%: +28,4 a +37,2) y -13,9 puntos frente a Qwen3.8-27B (intervalo: -17,8 a -10,1).

Conjuntos de desarrollo (usados para elegir entre runs, por lo que las cifras son optimistas):

| Metrica | base | Qwen3.8-35B-A3B | Qwen3.8-27B |
|---|---|---|---|
| LeetCode Medium/Hard (167 problemas) | 19,8% | 65,3% | 71,0% |
| Codeforces (163 problemas) | 19,0% | 52,8% | 58,9%* |
| Comprobacion no relacionada con codigo (matematicas, seguimiento de instrucciones, conocimiento; 600 items) | 89,0% | 88,2% | 92,2% |

*Una muestra por problema para Qwen3.8-27B en Codeforces.

Todas las puntuaciones se midieron con vLLM sobre la version AWQ. Los pesos bf16 del repositorio no se ejecutaron directamente. La velocidad medida en vLLM, una peticion a la vez y misma GPU, con pesos de 4 bits en ambos modelos, es de 2,9x en generacion y 6,2x en procesamiento de prompt frente a Qwen3.8-27B.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 35.951 millones de parametros requieren aproximadamente 72 GB solo para pesos, mas overhead de contexto; en AWQ 4-bit o GGUF Q4_K_M, el uso de memoria se reduce a un rango aproximado de 18-22 GB para los pesos.
- GPU recomendadas: para bf16, GPUs de 80 GB como A100 o H100, o configuraciones multi-GPU. Para AWQ 4-bit, una unica GPU de 24 GB (RTX 4090, L40S) resulta suficiente para pesos y contexto moderado; el modelo base con ~3B activos reduce el coste computacional por token.
- Cabe en GPU de consumo: si, en cuantizacion Q4_K_M o AWQ 4-bit, en tarjetas de 24 GB como la RTX 4090; en 16 GB puede requerir contextos reducidos u offloading parcial.
- Opciones de despliegue: vLLM (`vllm serve EdwinS9/Qwen3.8-35B-A3B-AWQ --max-model-len 32768 --reasoning-parser qwen3`), llama.cpp (`llama-server -hf EdwinS9/Qwen3.8-35B-A3B-GGUF:Q4_K_M --jinja -c 32768`), Ollama (mediante Modelfile con `RENDERER qwen3.5` y `PARSER qwen3.5`), LM Studio (buscar `EdwinS9/Qwen3.8-35B-A3B-GGUF` y descargar Q4_K_M) y SGLang para AWQ.
- Latencia y throughput: la model card reporta 2,9x la velocidad de generacion y 6,2x la de procesamiento de prompt de Qwen3.8-27B en vLLM con 4 bits, una peticion a la vez y la misma GPU; no se aportan valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Codigo (test 317) | No-codigo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-35B-A3B | 35,95B / ~3B | no disponible (ejemplos a 32k) | 54,9% | 88,2% | Apache-2.0 | HF: safetensors, AWQ, GGUF |
| Qwen3.6-35B-A3B (base) | 35,95B / ~3B | no disponible | 22,1% | 89,0% | Apache-2.0 | HF oficial |
| Qwen3.8-27B | 27B densos | no disponible | 68,8% | 92,2% | no disponible en la informacion | HF (referencia cyankiwi/Qwen3.8-27B-AWQ-INT4) |

Frente al modelo base, Qwen3.8-35B-A3B mejora el codigo en +32,8 puntos con identico coste de parametros activos. Frente a Qwen3.8-27B, sacrifica 13,9 puntos de acierto en codigo y 4 puntos en la comprobacion no relacionada con codigo, pero ofrece 2,9x velocidad de generacion y 6,2x de prompt processing con una fraccion mucho menor de parametros activos.

## Limitaciones y advertencias

- Entrenado exclusivamente con problemas de Python a nivel de funcion y programacion competitiva; no se entreno ni midio codigo agentico, multi-archivo ni a nivel de repositorio.
- Rendimiento claramente inferior a Qwen3.8-27B en problemas dificiles (25,5% frente a 39,7% en el test) y agota el presupuesto de tokens con mas frecuencia (25% frente a 15% de las respuestas).
- En matematicas esta 11 puntos por detras de Qwen3.8-27B en la comprobacion no relacionada con codigo (84,0% frente a 95,0%).
- La torre de vision no se modifico ni se evaluo tras el entrenamiento; su comportamiento multimodal no esta validado.
- Entrenamiento con una sola semilla y una sola epoca; no hay evidencia de robustez entre runs.
- Las cifras de los conjuntos de desarrollo son optimistas por haberse usado para seleccionar el run.
- Los problemas son publicos, por lo que no puede descartarse su exposicion durante el pretraining de cualquiera de los tres modelos comparados.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; como fine-tune de codigo, la generacion de APIs o funciones inexistentes es un riesgo plausible no cuantificado.
- Idiomas soportados no declarados; el entrenamiento se centro en problemas en ingles, por lo que el rendimiento en otros idiomas no esta garantizado.
- Licencia Apache-2.0 permite uso comercial, pero el modelo es un fine-tune comunitario no oficial, sin soporte de Qwen; conviene validar en el caso de uso concreto antes de produccion.
- Los pesos bf16 no se ejecutaron directamente; las puntuaciones proceden de la version AWQ, y los GGUF no se evaluaron por separado.

## Enlaces

- Repositorio principal (bf16 safetensors): https://huggingface.co/EdwinS9/Qwen3.8-35B-A3B
- Version AWQ 4-bit: https://huggingface.co/EdwinS9/Qwen3.8-35B-A3B-AWQ
- Version GGUF: https://huggingface.co/EdwinS9/Qwen3.8-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- AWQ del modelo base usado como referencia: https://huggingface.co/QuantTrio/Qwen3.6-35B-A3B-AWQ
- AWQ de Qwen3.8-27B para comparacion de velocidad: https://huggingface.co/cyankiwi/Qwen3.8-27B-AWQ-INT4
- Dataset LeetCode: https://huggingface.co/datasets/newfacade/LeetCodeDataset
- Dataset Codeforces: https://huggingface.co/datasets/open-r1/codeforces
