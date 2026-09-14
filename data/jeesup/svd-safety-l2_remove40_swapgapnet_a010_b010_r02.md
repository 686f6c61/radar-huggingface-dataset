# Jeesup/svd-safety-l2_remove40_swapgapnet_a010_b010_r02

## Resumen

El modelo `Jeesup/svd-safety-l2_remove40_swapgapnet_a010_b010_r02` es un artefacto de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup en HuggingFace. No es un modelo conversacional de propósito general: es una celda concreta de una rejilla experimental que estudia cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. El checkpoint se ha comprimido con SVD-LLM eliminando el 40,02 % de los parámetros, hasta una fracción resultante de 0,5998 respecto al modelo denso, y después se ha editado mediante 2 de las 10 rondas de sustitución iterativa de parámetros neutra (regla `gap_iter`, presupuesto total de restauración del 1,000 % de parámetros densos).

La arquitectura subyacente es la de Llama-2-7b-chat (transformer decoder-only con 4.096 tokens de contexto), pero con las capas de proyección truncadas por SVD y parcialmente restauradas con componentes seleccionados por la regla `gap_iter`. En esta ronda intermedia se han restaurado 381 componentes y se han expulsado otros 381, con 4.337.664 parámetros intercambiados (0,07 % de los parámetros densos de proyección), valor de intercambio `net` y escala de inserción 0,1.

Su relevancia es fundamentalmente metodológica: permite cuantificar el compromiso entre seguridad y utilidad bajo compresión agresiva. Los autores advierten explícitamente de que varias ramas de la rejilla están **deliberadamente degradadas en seguridad** respecto a Llama-2-7b-chat, y de que cualquier celda debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama-2), con capas de proyeccion comprimidas mediante SVD-LLM |
| Parametros totales | 6.738.415.616 (recuento real de safetensors); la model card declara una fraccion resultante de 0,5998 respecto al denso |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2-7b-chat) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible; el modelo base esta mayoritariamente orientado al ingles |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | Safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder-only de la familia Llama-2, con 6.738.415.616 parametros y atencion causal, y no ha pasado por un entrenamiento adicional de ajuste conversacional mas alla del que ya tenia `meta-llama/Llama-2-7b-chat-hf` (alineamiento por RLHF del modelo original). La intervencion consiste en una compresion SVD-LLM que elimina el 40,02 % de los parametros de las capas de proyeccion, dejando una fraccion de 0,5998 respecto al modelo denso. Sobre ese checkpoint comprimido se aplica una edicion iterativa de parametros neutra que sustituye componentes de baja contribucion por otros seleccionados con la regla `gap_iter`.

Los detalles de la edicion son concretos: presupuesto de restauracion del 1,000 % de parametros densos, repartido en trozos del 0,100 % por ronda, con 10 rondas previstas en la ejecucion completa. Este checkpoint corresponde a la ronda 2 (marcado como checkpoint intermedio), con semilla 42, 381 componentes restaurados, 381 expulsados y 4.337.664 parametros intercambiados (0,07 % de los parametros densos de proyeccion). El valor de intercambio es `net` (valor de insercion mas valor de eliminacion del desalojo ordenado por sigma) y la escala de insercion es 0,1, es decir, los componentes se anaden al 10 % de su fuerza.

No se documentan en la informacion disponible ni el volumen de tokens de entrenamiento adicional, ni la composicion del dataset, ni tecnicas de RLHF/DPO posteriores, ni innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva conversacional, heredada de Llama-2-7b-chat, aunque degradada por la compresion y por una edicion orientada a medir seguridad, no a maximizar utilidad.
- Razonamiento basico e instrucciones en formato chat, con la plantilla de Llama-2 (etiquetas `[INST]` y `<<SYS>>`).
- Comprension y generacion de codigo a nivel basico, limitada por el truncado de las proyecciones.
- Capacidad multilingue no documentada; el modelo base esta mayoritariamente entrenado en ingles.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- No dispone de modo thinking explicito, ni de vision, ni de audio.
- Capacidad especifica relevante: sirve como sujeto de medida de tasas de exito de ataque (ASR) y de sobrerrechazo, no como asistente final.

## Casos de uso

- Reproduccion de experimentos de compresion: permite replicar la celda concreta (regla `gap_iter`, presupuesto 1,000 %, ronda 2 de 10, semilla 42) y verificar las metricas declaradas frente a otras celdas de la rejilla.
- Estudio del compromiso seguridad-utilidad: al comparar este checkpoint con la ronda completa de 10 iteraciones y con el modelo sin comprimir, se puede trazar la curva de recuperacion de seguridad en funcion del presupuesto de restauracion.
- Evaluacion de reglas de seleccion de componentes: la regla `gap_iter` puede contrastarse con otras reglas de la rejilla usando exactamente las mismas condiciones de compresion y semilla.
- Banco de pruebas de jueces de seguridad: las metricas declaradas usan HarmBench como juez (AdvBench y StrongREJECT) y WildGuard para sobrerrechazo, por lo que el checkpoint sirve para validar y calibrar pipelines de evaluacion automatizada.
- Analisis de interpretabilidad: los 381 componentes restaurados y los 381 expulsados constituyen un conjunto identificable de direcciones sobre el que estudiar que subespacios del modelo estan asociados al comportamiento de rechazo.
- Investigacion de robustez ante jailbreak: con un ASR de 0,3519 en AdvBench y 0,1789 en StrongREJECT, es un sujeto util para probar tecnicas de ataque y defensa en modelos comprimidos.
- Docencia y divulgacion tecnica: ilustra de forma medible como una compresion agresiva puede aumentar la tasa de exito de ataques y como las ediciones selectivas la mitigan parcialmente.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,3519 |
| StrongREJECT ASR (juez HarmBench) | 0,1789 |
| Sobrerrechazo macro (WildGuard) | 0,0930 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de capacidad general, ni cifras comparativas de las otras celdas de la rejilla o del modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV (el repositorio ocupa 13,5 GB).
- VRAM estimada en int8: en torno a 6,7-7 GB de pesos.
- VRAM estimada en int4: en torno a 3,4-4 GB de pesos, siempre que se genere una cuantizacion propia, ya que el autor no publica versiones cuantizadas.
- GPU profesionales: A100 40/80 GB, H100, L40S o A10G funcionan con holgura; tambien una unica GPU de 24 GB en fp16 para inferencia con contexto corto.
- GPU de consumo: cabe en RTX 3090, RTX 4090, RTX 4080 y RTX 4070 Ti Super (16 GB) en fp16 con contexto reducido; en GPUs de 8-12 GB requeriria cuantizacion no publicada.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (el repositorio esta marcado como compatible con endpoints y con TGI) y, previsiblemente, vLLM por tratarse de una arquitectura Llama. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama exigirian una conversion previa.
- Latencia y throughput: no disponibles. No se proporcionan mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove40_swapgapnet_a010_b010_r02 | 6.738.415.616 (fraccion densa declarada 0,5998) | 4.096 tokens | AdvBench ASR 0,3519; StrongREJECT ASR 0,1789; sobrerrechazo 0,0930 | Llama 2 Community | HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf (modelo base sin comprimir) | ~6,74 mil millones | 4.096 tokens | No disponible en la informacion proporcionada | Llama 2 Community | HuggingFace, ampliamente desplegado |
| meta-llama/Llama-2-13b-chat-hf | ~13 mil millones | 4.096 tokens | No disponible en la informacion proporcionada | Llama 2 Community | HuggingFace, ampliamente desplegado |
| Mistral-7B-Instruct-v0.2 | ~7,2 mil millones | 32.768 tokens | No disponible en la informacion proporcionada | Apache 2.0 | HuggingFace, ampliamente desplegado |

La comparacion de rendimiento frente al modelo base y a las alternativas no puede establecerse con los datos disponibles: la model card solo publica las metricas de seguridad y sobrerrechazo de esta celda, sin linea base numerica.

## Limitaciones y advertencias

- El propio autor indica que varias ramas de la rejilla estan **deliberadamente degradadas en seguridad**; la compresion por si sola eleva la tasa de exito de ataques y el objetivo del estudio es cuantificarlo y probar su recuperacion.
- Se trata de un artefacto de investigacion, no de un asistente desplegable. No debe usarse en produccion ni exponerse a usuarios finales.
- La tasa de exito de ataque en AdvBench es de 0,3519, lo que implica que aproximadamente uno de cada tres prompts de ataque del conjunto tiene exito segun el juez HarmBench.
- Riesgo de alucinacion no medido en la informacion disponible; la compresion SVD puede degradar la fidelidad factica ademas de la seguridad.
- El sobrerrechazo macro (WildGuard) es de 0,0930, de modo que parte de la mejora aparente de seguridad podria venir acompanada de rechazos indebidos de peticiones legitimas.
- La fraccion de parametros declarada es 0,5998 respecto al denso, pero el recuento de safetensors del repositorio (6.738.415.616) coincide con el del modelo denso; conviene verificar que la carga efectiva aplica el truncado antes de asumir el ahorro de memoria.
- Es un checkpoint intermedio (ronda 2 de 10), por lo que no representa el resultado final de la ejecucion completa con presupuesto del 1,0 %.
- Idiomas soportados no documentados; el modelo base esta mayoritariamente orientado al ingles, con rendimiento limitado en castellano.
- Restricciones de licencia: uso vinculado a la Llama 2 Community License y a la politica de uso aceptable (`USE_POLICY.md`) incluidas en el repositorio; existen obligaciones de atribucion y restricciones para determinados usos comerciales.
- El modelo tiene 0 descargas y 0 likes en el momento del analisis, por lo que no cuenta con validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgapnet_a010_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Perfil del autor en HuggingFace: https://huggingface.co/Jeesup
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Paper de SVD-LLM: no disponible en la informacion proporcionada
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente paginas sobre conversion de tallas de ropa, sin relacion con el artefacto.
