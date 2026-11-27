# gpustack/Inkling-2-Mini-MLX-4bit-dynamic

## Resumen

Inkling-2-Mini-MLX-4bit-dynamic es una cuantizacion de 4 bits de precision mixta, nativa para MLX, del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el equipo de gpustack. Su proposito es hacer viable en Apple Silicon un modelo de aproximadamente 26.400 millones de parametros que combina un transformer con arquitectura de bucle (inkling2_loop) y una torre de vision, reduciendo los pesos a unos 14,88 GiB mediante empaquetado afín estandar de MLX con group_size = 64.

La relevancia de esta ficha radica en que no se trata de una cuantizacion uniforme: aplica precisiones distintas por modulo (8 bits en embeddings y lm_head, 6 bits en proyecciones de atencion, 4 bits en los expertos enrutados del MoE, y BF16 intacto en la torre de vision, normas, routers y controladores de bucle). Ademas, incluye un drafter especulativo blockwise-FP8 derivado de incoai/Inkling-2-Mini-DFlash2 en el subdirectorio speculator/, lo que permite decodificacion especulativa local sin descargar un segundo modelo.

El resultado es un artefacto de 16,7 GB en cuatro shards, pensado para ejecutarse con mlx-vlm >= 0.8.1 sobre hardware Apple. La licencia Apache-2.0 del modelo base y del drafter se mantiene, lo que facilita su uso comercial, aunque la informacion disponible sobre el modelo original es escasa: no se detallan idiomas, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (inkling2_loop) y mezcla de expertos (MoE), mas torre de vision multimodal |
| Parametros totales | 26.388.641.280 (~26,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits dinamica de precision mixta: Q8G64 (embeddings y lm_head), Q6G64 (proyecciones de atencion), Q4G64 (expertos enrutados del MoE), BF16 preservado (vision_tower, normas, routers, controladores de bucle, convoluciones cortas); drafter FP8 blockwise |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 4 shards, ~14,88 GiB de pesos; repo de 16,7 GB) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura denominada inkling2_loop, que combina capas de transformer con un mecanismo de bucle (loop controllers) y una capa de mezcla de expertos con proyecciones switch_mlp (gate_proj, up_proj, down_proj). Incluye ademas una torre de vision completa en BF16 para el procesamiento de imagenes, lo que lo convierte en un modelo image-text-to-text. La cuantizacion respeta esta estructura: solo los expertos enrutados del MoE se reducen a 4 bits, mientras que las proyecciones de atencion se mantienen en 6 bits y los elementos sensibles (embeddings, lm_head, normas, routers) reciben 8 bits o se conservan en BF16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. La innovacion tecnica destacable de esta version es doble: por un lado, la cuantizacion dinamica por modulo con overrides declarados en config.json (2 modulos en 8 bits, 144 en 6 bits); por otro, la integracion de un drafter especulativo blockwise-FP8 (Inkling-2-Mini-DFlash2) en speculator/, que habilita decodificacion especulativa en Apple Silicon para acelerar la generacion.

## Capacidades

- Generacion de texto conversacional en formato image-text-to-text.
- Procesamiento multimodal de imagenes: la torre de vision se conserva en BF16, por lo que la calidad visual no se degrada por la cuantizacion.
- Razonamiento y generacion de codigo (el ejemplo de la model card incluye una funcion Fibonacci en Python).
- Decodificacion especulativa integrada mediante el drafter FP8 incluido, que puede acelerar la inferencia.
- Ejecucion nativa en Apple Silicon a traves de mlx-vlm.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo local en Mac: el modelo puede generar funciones y fragmentos de codigo (como el ejemplo Fibonacci de la model card) ejecutandose integramente en un Mac con Apple Silicon, sin enviar codigo a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Descripcion y analisis de imagenes en local: gracias a la torre de vision preservada en BF16, se puede usar para generar descripciones de imagenes o extraer informacion de capturas y documentos escaneados mediante el pipeline image-text-to-text.
- Prototipado multimodal sin GPU dedicada: investigadores que trabajan en portatiles o estaciones Mac pueden experimentar con un modelo de 26,4 mil millones de parametros sin necesidad de hardware NVIDIA, usando mlx-vlm.
- Evaluacion de tecnicas de cuantizacion: el artefacto sirve como referencia para estudiar el impacto de la precision mixta por modulo (8/6/4 bits) en la calidad de un MoE multimodal, comparandolo con el modelo BF16 original.
- Pruebas de decodificacion especulativa: el drafter FP8 incluido en speculator/ permite medir la aceleracion de la generacion especulativa en MLX frente a la decodificacion estandar.
- Desarrollo de aplicaciones conversacionales locales: el modelo puede integrarse en asistentes de escritorio para macOS que combinen texto e imagen, aprovechando la licencia Apache-2.0 para distribucion comercial.
- Investigacion sobre arquitecturas con bucle: el esquema inkling2_loop con controladores de bucle permite experimentar con patrones de computacion recurrente en un modelo ya cuantizado y listo para ejecutar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM equivalente: los pesos cuantizados ocupan aproximadamente 14,88 GiB en 4 shards; el repo completo es de 16,7 GB. La memoria unificada necesaria debe cubrir los pesos mas el estado de activaciones y cache KV, por lo que se recomienda al menos 24 GB de memoria unificada y preferiblemente 32 GB o mas para contexto largo.
- Hardware objetivo: Apple Silicon con MLX (mlx-vlm >= 0.8.1). No esta pensado para GPU NVIDIA ni CUDA.
- GPU recomendadas: no disponible; el artefacto es especifico de Apple Silicon (series M de Apple). No se documentan GPU NVIDIA equivalentes.
- Cabe en consumer GPU: no aplica en el sentido habitual; en Mac consumer, un equipo con 32 GB o 64 GB de memoria unificada es el escenario realista.
- Opciones de despliegue: mlx-vlm (libreria declarada, version >= 0.8.1). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| gpustack/Inkling-2-Mini-MLX-4bit-dynamic | ~26,4 mil millones | no disponible | MLX safetensors 4-bit mixto + drafter FP8 | Apache-2.0 | Cuantizacion para Apple Silicon |
| thinkingmachines/Inkling-2-Mini | ~26,4 mil millones (base) | no disponible | BF16 original | Apache-2.0 | Modelo base sin cuantizar |
| incoai/Inkling-2-Mini-DFlash2 | no disponible | no disponible | Drafter especulativo FP8 | Apache-2.0 | Incluido en speculator/ de esta version |

No se dispone de datos de rendimiento ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits en los expertos del MoE puede degradar la calidad respecto al modelo BF16 original; no se han publicado evaluaciones que cuantifiquen esa perdida.
- El artefacto esta ligado a MLX y Apple Silicon: no es portable a CUDA ni a otras plataformas sin reconversion.
- Requiere mlx-vlm >= 0.8.1; versiones anteriores pueden no cargar el layout de pesos.
- No se dispone de informacion sobre sesgos, idiomas soportados ni tasas de alucinacion del modelo base.
- La longitud de contexto no esta documentada, lo que impide planificar despliegues con ventanas largas con garantias.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base y del drafter originales antes de un uso comercial en produccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.
- El drafter especulativo incluido esta en FP8 blockwise; su compatibilidad y ganancia real de velocidad en mlx-vlm no estan documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gpustack/Inkling-2-Mini-MLX-4bit-dynamic
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Drafter especulativo: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
