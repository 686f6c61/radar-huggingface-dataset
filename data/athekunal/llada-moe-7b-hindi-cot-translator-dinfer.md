# Athekunal/llada-moe-7b-hindi-cot-translator-dinfer

## Resumen

LLaDA-MoE-7B-A1B Hindi Chain-of-Thought Translator es un ajuste fino del modelo de difusión enmascarada (MDLM) inclusionAI/LLaDA-MoE-7B-A1B-Instruct, desarrollado por el usuario Athekunal. Su tarea es traducir del inglés al hindi cadenas de razonamiento (chain-of-thought), paso a paso, en lugar de traducir documentos completos de una sola pasada. El modelo conserva la arquitectura del base: un transformer bidireccional con mezcla de expertos (MoE) de 64 expertos, de los cuales 8 se activan por token, lo que resulta en aproximadamente 1.000 millones de parametros activos sobre un total de 7.356.880.896 parametros.

La particularidad de este checkpoint es que esta publicado en el formato fusionado especifico de dInfer, con los pesos de los expertos MoE pre-fusionados en el layout `w1`/`w2` que emplea su decodificador paralelo por umbral y su doble cache KV. Segun la model card, esto aporta una aceleracion de aproximadamente 30x frente al muestreo de un token por paso, un factor clave para hacer viable la decodificacion de difusion en produccion.

El modelo esta entrenado sobre el dataset propio english-hindi-reasoning-dataset (split `sft`), con 100.000 fragmentos de pasos de razonamiento ingles→hindi durante una epoca. Se distribuye bajo licencia Apache 2.0 y soporta los idiomas ingles y hindi. Su relevancia radica en explorar la traduccion de razonamiento con modelos de difusion (no autorregresivos) y en ofrecer un formato optimizado para inferencia de alto rendimiento en un dominio, el hindi-ingles tecnico, poco cubierto por modelos genericos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MDLM (masked diffusion language model) bidireccional con MoE (64 expertos, 8 activos por token) |
| Parametros totales | 7.356.880.896 (~7,3B) |
| Parametros activos | ~1B por token (configuracion A1B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), hindi (hi) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint fusionado para dInfer, `custom_code`) |
| Modelo base | inclusionAI/LLaDA-MoE-7B-A1B-Instruct |
| Dataset de ajuste | Athekunal/english-hindi-reasoning-dataset (config `sft`, `sft_split`) |
| Volumen de entrenamiento | 100.000 fragmentos de pasos de razonamiento, 1 epoca |
| Tamano del repositorio | 14,7 GB |
| Tarea (pipeline) | translation |
| Fecha de creacion | 2026-09-29 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LLaDA-MoE: un transformer de difusion enmascarada (MDLM) de naturaleza bidireccional, en el que la generacion no es autorregresiva token a token, sino que se decodifica sobre un "lienzo" (canvas) de longitud fija elegido de antemano. La capa de mezcla de expertos (MoE) cuenta con 64 expertos y activa 8 por token, lo que da lugar a una relacion aproximada de 1.000 millones de parametros activos sobre 7.300 millones totales. Esta condicion bidireccional implica que un lienzo sobredimensionado provoca duplicacion o repeticion de texto en lugar de una parada natural, algo que el flujo de uso recomendado mitiga fragmentando la entrada.

El ajuste fino se realizo sobre el dataset english-hindi-reasoning-dataset (configuracion `sft`, split `sft_split`), compuesto por 100.000 fragmentos de pasos de razonamiento traducidos de ingles a hindi, durante una unica epoca. La tarea es la traduccion de un paso de razonamiento por pasada, no de un documento completo. Se espera que el material matematico, el codigo, los numeros y los nombres de variables se reproduzcan de forma literal. No se detalla en la informacion disponible si hubo fases de RLHF o DPO, ni la composicion exacta del corpus mas alla de su naturaleza de razonamiento.

La innovacion tecnica principal reside en el formato de checkpoint: los pesos de los expertos MoE se publican pre-fusionados en el layout `w1`/`w2` de dInfer, lo que habilita su decodificador paralelo por umbral y su doble cache KV. Segun la model card, esto produce una aceleracion de aproximadamente 30x respecto al muestreo de un token por paso. Se menciona la existencia de un checkpoint no fusionado (safetensors HF estandar, sin layout especifico de dInfer) para quien prefiera usar el sampler MDLM ordinario de `dllm`, disponible bajo peticion.

## Capacidades

- Traduccion ingles→hindi de pasos de razonamiento de forma individual, no de documentos completos en una sola pasada.
- Reproduccion literal de contenido matematico, codigo, numeros y nombres de variables durante la traduccion.
- Manejo de fragmentacion de cadenas de razonamiento largas mediante troceado por limites de parrafo, frase o linea, con enmascaramiento de bloques de codigo (```) y matematicas (`$...$` y `$$...$$`) para no romperlos.
- Decodificacion bidireccional por difusion enmascarada con decodificador paralelo por umbral y doble cache KV cuando se ejecuta bajo dInfer.
- Ajuste especifico al par de idiomas ingles-hindi; no se declaran capacidades multilingues mas alla de esos dos idiomas.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, uso de agentes, vision ni audio.

## Casos de uso

- Traduccion de cadenas de razonamiento en sistemas de agentes: el modelo traduce cada paso de un CoT del ingles al hindi de forma incremental, lo que permite localizar las trazas de razonamiento de un agente sin reprocesar el documento entero; el flujo recomendado trocea la cadena en piezas por debajo de un limite de tokens (por ejemplo, 450) respetando limites de frase.
- Localizacion de datasets de razonamiento para entrenamiento: dado un corpus de pasos de razonamiento en ingles, el modelo puede generar su equivalente en hindi paso a paso, util para construir conjuntos de datos de ajuste supervisado en hindi.
- Traduccion de explicaciones de codigo conservando identificadores: gracias a la instruccion de reproducir literalmente codigo, numeros y nombres de variables, es adecuado para traducir comentarios y explicaciones de fragmentos de codigo junto a sus bloques, protegidos durante el troceado.
- Generacion de material educativo en hindi: traduccion de explicaciones paso a paso de problemas de matematicas o logica, manteniendo las expresiones matematicas enmascaradas intactas.
- Traduccion de documentacion tecnica estructurada en pasos: articulos o guias divididas en pasos de razonamiento pueden traducirse unidad a unidad, lo que facilita la revision y la correccion parcial.
- Inferencia de alto rendimiento por lotes: con el checkpoint fusionado para dInfer y su decodificador paralelo por umbral, el modelo permite procesar lotes de fragmentos equilibrados en longitud con una mejora de velocidad declarada de ~30x frente al muestreo token a token.
- Investigacion en traduccion con modelos de difusion: sirve como caso de estudio para evaluar MDLM bidireccionales en tareas de traduccion frente a enfoques autorregresivos.

## Benchmarks y rendimiento

El unico dato cuantitativo de rendimiento presente en la informacion disponible es la aceleracion declarada por el autor: aproximadamente 30x respecto al muestreo de un token por paso, gracias al decodificador paralelo por umbral y al doble cache KV de dInfer sobre el checkpoint fusionado.

| Metrica | Valor |
|---|---|
| Aceleracion frente a muestreo 1 token/paso | ~30x (dInfer, checkpoint fusionado) |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Metricas de traduccion (BLEU, chrF, COMET) | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, metricas de traduccion) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: los pesos ocupan aproximadamente 14,7 GB (coincidente con el tamano del repositorio); con overhead de activaciones y cache KV, se recomienda un minimo de ~18-20 GB de VRAM.
- Cuantizaciones de 8 bits y 4 bits: segun el recuento de parametros, implicarian aproximadamente 8 GB y 4-5 GB respectivamente, pero no se confirma soporte de cuantizacion en la informacion disponible, ya que el checkpoint fusionado depende de kernels especificos de dInfer.
- GPU recomendadas: para bf16 sin cuantizar, tarjetas de 24 GB o mas (RTX 3090, RTX 4090, A100 40/80 GB, H100). El modelo completo (~7,3B) es manejable en GPUs de gama alta de consumo.
- Compatibilidad con GPU de consumo: es probable que quepa en RTX 3090/4090 (24 GB) en bf16, aunque con margen ajustado por el cache KV; no se confirma soporte en GPUs de menos VRAM.
- Opciones de despliegue: dInfer es obligatorio para este checkpoint; una carga estandar con `transformers` no funciona porque `modeling_fused_olmoe.py` invoca kernels de MoE fusionado especificos de dInfer/vLLM. dInfer se instala clonando su repositorio y ejecutando `pip install -e`, lo que arrastra vLLM como dependencia.
- Nota de compatibilidad: no se indica soporte para llama.cpp, Ollama ni TGI en la informacion disponible, dado el caracter `custom_code` del checkpoint.
- Latencia y throughput: no disponibles de forma absoluta; el unico indicador es la mejora relativa de ~30x sobre el muestreo de un token por paso bajo dInfer.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| Athekunal/llada-moe-7b-hindi-cot-translator-dinfer | ~7,3B (≈1B activos) | MDLM + MoE, ajuste para traduccion CoT | no disponible | en, hi | apache-2.0 |
| inclusionAI/LLaDA-MoE-7B-A1B-Instruct (base) | ~7,3B (≈1B activos) | MDLM + MoE, instructivo general | no disponible | no disponible | no disponible |
| Traductores neuronales dedicados (por ejemplo, NLLB, IndicTrans2) | no disponible | encoder-decoder autorregresivo | no disponible | multilingue (incluye hindi) | no disponible |

Comparativa en rendimiento numerico con alternativas: no disponible. No se han publicado datos de benchmarks comparativos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- El modelo traduce un paso de razonamiento por pasada; no esta disenado para traducir documentos completos de una sola vez.
- Al ser un MDLM bidireccional, un lienzo de decodificacion demasiado grande provoca duplicacion o repeticion de texto en lugar de una parada natural; es necesario trocear la entrada y ajustar el tamano del lienzo.
- Este checkpoint concreto es el formato fusionado de dInfer: no carga con `transformers` estandar y requiere instalar dInfer (que a su vez arrastra vLLM). La propia model card advierte de la necesidad de fijar la version de `transformers` si la instalacion la actualiza.
- No se documentan sesgos conocidos en la informacion disponible, pero todo sistema de traduccion puede heredar sesgos del corpus de entrenamiento; no se detalla la composicion del dataset mas alla de su volumen.
- Riesgo de alucinacion y de traduccion inexacta en contenido tecnico no representado en el corpus: no cuantificado en la informacion disponible.
- Cobertura linguistica limitada a ingles y hindi; no se declaran otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias del modelo base (inclusionAI/LLaDA-MoE-7B-A1B-Instruct) y de dInfer, no detalladas en la informacion proporcionada.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-09-29, por lo que carece de validacion por parte de la comunidad.
- No se han publicado resultados de benchmarks estandar, lo que dificulta evaluar su calidad de traduccion frente a alternativas consolidadas.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Athekunal/llada-moe-7b-hindi-cot-translator-dinfer
- Modelo base: https://huggingface.co/inclusionAI/LLaDA-MoE-7B-A1B-Instruct
- Dataset de ajuste fino: https://huggingface.co/datasets/Athekunal/english-hindi-reasoning-dataset
- Repositorio dInfer: https://github.com/inclusionAI/dInfer
