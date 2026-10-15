# intel-ai/Inkling-Small-MXFP4-AutoRound

## Resumen

Inkling-Small-MXFP4-AutoRound es una version cuantizada del modelo multimodal thinkingmachines/Inkling-Small, publicada por intel-ai mediante la herramienta Intel AutoRound. Se trata de un modelo de arquitectura MoE (mixture of experts) con 265.956.439.090 parametros totales (unos 266.000 millones) y una ventana de contexto configurable de hasta 102.400 tokens, capaz de procesar entradas de imagen y audio ademas de texto (pipeline image-text-to-text y tags audio-text-to-text).

El interes de esta ficha no esta en el modelo base, sino en el proceso de cuantizacion: Intel ha aplicado el esquema MXFP4 (formato de coma flotante de 4 bits con escala compartida por bloque) exclusivamente a las capas de expertos (mlp.experts) mediante la configuracion de capas de AutoRound, manteniendo el resto de la red en BF16. El resultado se empaqueta en formato compressed-tensors, con un repositorio de 153,5 GB, lo que reduce de forma notable el peso en disco y memoria frente a una version BF16 completa.

La relevancia practica es que, segun la propia model card, la cuantizacion MXFP4 no solo no degrada la precision sino que en algunos benchmarks la mejora ligeramente frente a la variante NVFP4 del mismo modelo base (por ejemplo, 0,911 frente a 0,900 en aime25 y 0,8855 frente a 0,8737 en gpqa_diamond con repeats=3). Esto lo convierte en una opcion atractiva para desplegar un modelo multimodal de gran tamano en infraestructura de GPU con vLLM y paralelismo tensorial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (tag `moe`, `inkling_mm_model`); detalles de la arquitectura interna no disponibles |
| Parametros totales | 265.956.439.090 (~266B) |
| Parametros activos | no disponible |
| Longitud de contexto | 102.400 tokens (valor de `--max-model-len` en el ejemplo de despliegue de vLLM) |
| Tipos de cuantizacion | MXFP4 en capas `mlp.experts` (modo RTN, Intel AutoRound); resto del modelo en BF16; formato compressed-tensors; tag `8-bit` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base es thinkingmachines/Inkling-Small, un modelo multimodal de tipo mixture of experts que acepta texto, imagenes y audio como entrada (tags `image-text-to-text` y `audio-text-to-text`). No se dispone en la informacion proporcionada de detalles sobre el numero de expertos, el numero de parametros activos por token, la dimension oculta, el mecanismo de atencion ni la composicion del dataset de entrenamiento.

Lo que si esta documentado es el proceso de cuantizacion aplicado por Intel. Se ha utilizado AutoRound con el modo RTN (round-to-nearest) y una configuracion por capas que asigna el esquema MXFP4 unicamente a los expertos MLP, dejando el resto de la red en BF16. El comando exacto es:

```
auto-round thinkingmachines/Inkling-Small --scheme BF16 --layer_config '{mlp.experts:{scheme:mxfp4}}' --output_dir ~/models/thinkingmachines/Inkling-Small-MXFP4 --model_free --format llm_compressor
```

El metodo AutoRound esta descrito en el articulo arXiv:2309.05516 ("Optimize weight rounding via signed gradient descent for the quantization of LLMs"), aunque en este caso concreto se ha empleado el modo RTN, que no requiere optimizacion por gradiente. El modelo conserva el tokenizador, el parser de razonamiento (`--reasoning-parser inkling`) y el parser de tool calling (`--tool-call-parser inkling`) del modelo original, y esta preparado para servir con vLLM con `--trust-remote-code` y `VLLM_QDQ=1`.

## Capacidades

- Generacion de texto conversacional de tipo multi-turno, con plantilla de chat propia (`tokenizer-mode inkling`).
- Procesamiento de imagenes (image-text-to-text) y de audio (audio-text-to-text), lo que habilita tareas multimodales de descripcion, analisis y respuesta sobre contenido visual y sonoro.
- Modo de razonamiento explicito: el ejemplo de evaluacion usa `chat_template_kwargs` con `enable_thinking: true` y `reasoning_effort: "max"`, con un presupuesto de hasta 64.000 tokens de generacion.
- Tool calling / function calling: el despliegue de referencia activa `--tool-call-parser inkling` y `--enable-auto-tool-choice`.
- Uso en agentes y razonamiento multi-paso, apoyado en la ventana de contexto de 102.400 tokens y en el parser de razonamiento.
- Generacion de codigo: la model card incluye un ejemplo de prompt orientado a escribir codigo para hacer fine-tuning de un LLM.
- Razonamiento matematico y cientifico: validado con aime25, gsm8k y gpqa_diamond.
- Capacidades multilingues: no disponible.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 102.400 tokens y aceptar capturas de pantalla o notas de voz del usuario, respondiendo con tool calling para consultar sistemas internos.
- Analisis de documentos con imagenes: extraccion y razonamiento sobre documentos escaneados (facturas, informes, diagramas) combinando la entrada de imagen con el modo de razonamiento extendido.
- Asistentes de accesibilidad con audio: transcripcion y comprension de audio-text-to-text para generar resumenes, respuestas o descripciones de contenido sonoro.
- Agentes de automatizacion de tareas: con tool calling y razonamiento multi-paso, el modelo puede encadenar llamadas a APIs (busqueda, calculo, acceso a bases de datos) dentro de un mismo contexto largo.
- Asistente de desarrollo de software: generacion de codigo, explicacion de fragmentos y apoyo a pipelines de CI/CD mediante function calling, tal como sugiere el ejemplo de prompt de la model card.
- Razonamiento cientifico y matematico asistido: resuelve problemas de nivel de competicion (aime25) y preguntas de nivel de posgrado (gpqa_diamond), util en herramientas de estudio y verificacion de resultados.
- Despliegue en cluster con paralelismo tensorial: al ser una version cuantizada de ~154 GB, encaja en nodos multi-GPU para servir un modelo multimodal de gran escala con coste de memoria reducido.
- Investigacion en cuantizacion: sirve como referencia reproducible para estudiar el impacto de MXFP4 selectivo sobre expertos MoE frente a NVFP4, con los scripts de AutoRound y evalscope incluidos.

## Benchmarks y rendimiento

Resultados publicados en la model card (repeats=3), comparando la version MXFP4 con la version NVFP4 del mismo modelo base:

| Benchmark | Inkling-Small-NVFP4 | MXFP4 | Ratio (MXFP4/NVFP4) |
|---|---|---|---|
| aime25 | 0,9000 | 0,9110 | 1,0123 |
| gpqa_diamond | 0,8737 | 0,8855 | 1,0135 |
| gsm8k | 0,9727 | 0,9699 | 0,9971 |
| piqa | 0,9447 | 0,9452 | 1,0006 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni otros benchmarks distintos de los cuatro anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 153,5 GB, por lo que se necesita al menos ese volumen de memoria, mas margen para cache KV y activaciones. En la practica, un minimo realista de 4 GPU de 80 GB (320 GB) y, como opcion mas ajustada, 2 GPU de 141 GB.
- GPUs recomendadas: H100 80 GB, H200 (141 GB), B200; tambien A100 80 GB en configuraciones de 4 o mas tarjetas. El ejemplo oficial usa `--tensor-parallel-size 4`.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090, 5090, etc.) por el tamano del modelo; no es desplegable en una sola tarjeta.
- Opciones de despliegue: vLLM es la ruta documentada, con `VLLM_QDQ=1`, `--trust-remote-code`, `--tensor-parallel-size 4`, `--enable-chunked-prefill`, `--max-num-seqs 1024`, `--max-num-batched-tokens 32768` y `--max-model-len 102400`. No hay soporte documentado para llama.cpp, GGUF u Ollama; tampoco se documenta TGI.
- Latencia y throughput: no disponibles. La model card solo indica un tamano de lote de evaluacion de 512 y un timeout de 36.000 segundos para las pruebas, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Rendimiento relativo |
|---|---|---|---|---|---|
| intel-ai/Inkling-Small-MXFP4-AutoRound | ~266B totales | 102.400 tokens (config. vLLM) | MXFP4 en expertos, BF16 en el resto | apache-2.0 | aime25 0,911; gpqa 0,8855; gsm8k 0,9699; piqa 0,9452 |
| thinkingmachines/Inkling-Small-NVFP4 | no disponible (mismo modelo base) | no disponible | NVFP4 | no disponible (seguir la del modelo original) | aime25 0,900; gpqa 0,8737; gsm8k 0,9727; piqa 0,9447 |
| thinkingmachines/Inkling-Small (BF16) | no disponible (mismo modelo base) | no disponible | BF16 | no disponible en la informacion proporcionada | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La model card advierte explicitamente de que el modelo puede producir salidas factualmente incorrectas y que no debe usarse como fuente de informacion precisa; existe riesgo de alucinacion.
- Se reconoce la posibilidad de generar contenido obsceno, sesgado u ofensivo debido a las limitaciones del modelo preentrenado y de los datasets de ajuste. Se recomienda realizar pruebas de seguridad antes de cualquier despliegue.
- No hay informacion sobre idiomas soportados, por lo que el comportamiento multilingue y el rendimiento en castellano no estan verificados.
- Los benchmarks publicados son escasos (aime25, gpqa_diamond, gsm8k, piqa) y se centran en razonamiento y conocimiento; no cubren tareas multimodales de imagen o audio, ni tool calling, ni calidad de generacion de codigo.
- Los resultados de benchmark corresponden al modelo servido con ajustes concretos (temperature 1.0, top_p 0.95, reasoning_effort max, hasta 64.000 tokens), por lo que no son directamente extrapolables a otras configuraciones.
- Se trata de una cuantizacion selectiva: los expertos van en MXFP4, pero el resto se mantiene en BF16. El ahorro de memoria es importante pero no convierte al modelo en ligero: 153,5 GB de pesos.
- Requiere `--trust-remote-code` en vLLM, lo que implica ejecutar codigo remoto del repositorio; conviene auditar dicho codigo en entornos de produccion.
- La licencia apache-2.0 se aplica a esta version, pero la model card pide seguir la licencia del modelo original (thinkingmachines/Inkling-Small); conviene verificar ambas antes de un uso comercial. La propia model card aclara que la licencia no constituye asesoramiento legal.
- El Autoround se ha generado con modo RTN y `--model_free`, sin ajuste fino de los pesos por gradiente, por lo que no hay garantia de optimalidad de la cuantizacion mas alla de las metricas reportadas.
- Fechas de publicacion del repositorio (creacion y actualizacion el 2026-10-15) registradas en el Hub; descargas y likes figuran a 0 en el momento de la consulta, lo que indica adopcion nula todavia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/intel-ai/Inkling-Small-MXFP4-AutoRound
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Repositorio de Intel AutoRound: https://github.com/intel/auto-round
- Paper del metodo AutoRound: https://arxiv.org/abs/2309.05516
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
