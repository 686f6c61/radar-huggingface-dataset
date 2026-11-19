# azampatti/Qwen3.8-Flash-Next-125B-A5B-INT4-AutoRound

## Resumen

Qwen3.8-Flash-Next 125B-A5B INT4-AutoRound es una variante optimizada del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario azampatti. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 123.958.298.771 parametros totales (aproximadamente 124B) y 4,8B parametros activos por token, fruto de reducir los expertos enrutados de top-10 a top-5 respecto al original, que activa 6B. El checkpoint esta cuantizado a int4 mediante GPTQ-Marlin con AutoRound y combinado con proyecciones en fp8, con el objetivo de que quepa y funcione en una unica DGX Spark (GB10, 128 GB de memoria unificada) a una velocidad de entre 70 y 78 tokens por segundo.

La relevancia de esta ficha reside en que demuestra una estrategia de compresion agresiva sobre un modelo MoE de gran tamano: no solo se cuantiza, sino que se recortan los expertos activos y se "sana" la perdida de calidad mediante autodestilacion KL entrenando unicamente el experto compartido (37,75M parametros). El resultado, segun el autor, conserva la capacidad de uso de herramientas (tool use en torno a 91 sobre 100) y pierde unos cuatro puntos de capacidad general respecto al original (49,3 frente a 51,8), a cambio de un quinto menos de parametros activos y una generacion notablemente mas rapida.

El modelo se distribuye con todo lo necesario para servirlo en un unico repositorio, incluida una tabla de n-gramas de 49 GB en fp8 bajo `ple-table/`, y requiere un build especifico de vLLM (Saren-Arterius/qwen3.8-Flash-DGX-AutoRound) porque el vLLM estandar no puede servir la mezcla int4 + fp8 de este checkpoint. La licencia es la de Qwen (`other`, con enlace a la licencia del modelo base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con 48 capas, 512 expertos enrutados por capa, atencion y proyecciones gated-delta, hiper-conexiones; incluye tabla de n-gramas (PLE) separada |
| Parametros totales | 123.958.298.771 (aprox. 124B) |
| Parametros activos | 4,8B por token (el original activa 6B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 GPTQ-Marlin (grupo 128) en expertos enrutados y lm_head; fp8 e4m3 blockwise en atencion, proyecciones gated-delta y experto compartido; bf16 en embeddings, routers, norms e hiper-conexiones; tabla PLE en fp8 |
| Idiomas soportados | no disponible |
| Licencia | qwen (license: other, license_name: qwen) |
| Formato de pesos | safetensors (repositorio de 130,8 GB), libreria vLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-Flash-Next, un transformer MoE con 48 capas y 512 expertos enrutados por capa, que incorpora proyecciones de atencion y gated-delta, hiper-conexiones y una tabla de n-gramas (PLE, "prompt lookup embedding") de 51B parametros que se lee desde disco mediante memory map. Sobre esa base, Intel genero una cuantizacion int4 con AutoRound (W4A16), y el autor de esta variante aplico dos transformaciones adicionales: el recorte de los expertos enrutados de top-10 a top-5 y una fase de "sanado" (healing) mediante autodestilacion.

El proceso de healing consistio en entrenar unicamente el experto compartido (37,75M parametros, con todo lo demas congelado) para que imitara la salida del modelo sin recortar, usando el mismo modelo en top-10 como profesor. Se empleo un objetivo de divergencia KL pura sobre 14.667 ejemplos de codigo, matematicas, texto general, llamadas a herramientas y contexto largo. Segun el autor, sin healing la puntuacion de capacidad se quedaba en 41,8; con healing alcanza 49,3 frente a 51,8 del original. Un ajuste supervisado de texto previo se estanco en 42,8, por lo que el objetivo de destilacion fue determinante. Ademas, el lm_head se recuantizo desde los pesos bf16 originales con AutoRound (1.000 iteraciones, calibracion capturada a traves del modelo sanado), conservando un 97,2% de acuerdo top-1 frente al head bf16 (el head int8 que sustituye conservaba el 99,6%), a cambio de la mitad de tamano y mayor velocidad, ya que el head se lee cuatro veces por paso de decodificacion. Se incluyen dos plantillas de chat opcionales (`medium_chat_template.jinja` y `xhigh_chat_template.jinja`); la variante medium elimina la instruccion de "reasoning effort is xhigh" y reduce tiempo y tokens de benchmark en torno a un cuarto con la misma puntuacion, y ambas anaden tres reglas de uso de herramientas y aceptan `<|think_off|>`.

## Capacidades

- Generacion de texto conversacional y razonamiento general, con soporte de modo de razonamiento (reasoning effort) configurable mediante plantillas de chat.
- Generacion de codigo y resolucion de problemas matematicos, segun la composicion del dataset de healing (codigo, matematicas, texto general).
- Uso de herramientas (tool calling / function calling): el autor reporta una puntuacion de tool use de 91 sobre 100 (3 ensayos), practicamente intacta respecto al original (91-92).
- Razonamiento multi-paso y comportamiento agentico, reforzado por las reglas de tool use anadidas en las plantillas de chat.
- Procesamiento de contexto largo: el dataset de healing incluye ejemplos de contexto largo, aunque la longitud maxima de contexto no se especifica en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se mencionan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Despliegue en hardware de un solo nodo con memoria unificada: el modelo esta disenado para ejecutarse en una DGX Spark (GB10, 128 GB) a 70-78 tokens/s, lo que permite servir un MoE de 124B en una maquina de sobremesa para prototipado e investigacion sin cluster.
- Asistentes de codigo en local: al conservar capacidades de generacion de codigo y tool calling, puede integrarse en editores o pipelines de CI/CD mediante el servidor compatible con OpenAI que levanta el script de setup, sin depender de APIs externas.
- Agentes automatizados con llamadas a herramientas: la puntuacion de tool use en torno a 91 lo hace adecuado para flujos agenticos donde el modelo debe invocar funciones (APIs, busquedas, ejecucion de comandos) de forma fiable.
- Atencion al cliente y chat multi-turno: la naturaleza conversacional y las plantillas de chat con modo de razonamiento ajustable permiten controlar el coste en tokens por respuesta, reduciendo tiempo y consumo en torno a un cuarto con la plantilla medium.
- Evaluacion e investigacion sobre compresion de MoE: el checkpoint y su repositorio de servicio sirven como caso de estudio reproducible de recorte de expertos y autodestilacion KL para investigadores que estudien tecnicas de pruning y cuantizacion.
- Procesamiento por lotes de documentos con contexto largo: la inclusión de ejemplos de contexto largo en el entrenamiento de healing sugiere utilidad para tareas de resumen o extraccion sobre entradas extensas, siempre que se valide el limite real de contexto.
- Inferencia de bajo coste energetico en el borde: el uso de int4 + fp8 y una tabla PLE leida por memory map reduce la huella de memoria y el ancho de banda, adecuado para entornos con restricciones de energia o memoria.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen del harness propio del autor sobre una DGX Spark, y deben leerse como comparacion interna, no como resultados de un leaderboard estandar:

| Metrica | Este modelo (top-5, int4) | Original (top-10) |
|---|---|---|
| Capacidad (media de 6 ejecuciones) | 49,3 | 51,8 |
| Uso de herramientas (3 ensayos) | 91 | 91-92 |
| Velocidad | aprox. 70-78 tok/s | aprox. 57 tok/s |
| Parametros activos | 4,8B | 6,0B |

El autor indica que la capacidad se midio con un head int8 en 51,8 y con el head int4 incluido en 49,3, y que ambas cifras estan dentro del ruido, por lo que debe interpretarse como aproximadamente un 50% en cada caso. El head int4 aporta alrededor de un 8% mas de velocidad. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 130,8 GB en disco; el modelo esta pensado para una DGX Spark con 128 GB de memoria unificada, apoyandose en la tabla PLE de 49 GB en fp8 leida por memory map desde disco.
- GPU recomendadas: DGX Spark (GB10, 128 GB) es el objetivo declarado. No se especifican otras GPU en la informacion disponible.
- Cabe en GPU de consumo: no hay datos que confirmen que quepa en GPU de consumo convencionales (por ejemplo, RTX 4090 con 24 GB); el tamano del checkpoint y la tabla PLE lo hacen inviable en esas configuraciones segun la informacion disponible.
- Opciones de despliegue: vLLM con el build especifico de Saren-Arterius/qwen3.8-Flash-DGX-AutoRound, apuntando `VLLM_PLE_MMAP_DIR` a `ple-table/`. El repositorio azampatti/Qwen3.8-Flash-Next-Int4-FAST incluye un `setup.sh` que construye la imagen, descarga el modelo y arranca un servidor compatible con OpenAI en el puerto 8000. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 70-78 tokens/s en una DGX Spark, frente a unos 57 tokens/s del original top-10 en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (azampatti, int4) | 124B | 4,8B | no disponible | qwen | Hugging Face, requiere build de vLLM especifico |
| Qwen3.8-Flash-Next (original) | no disponible | 6,0B | no disponible | qwen | Hugging Face |
| Intel/Qwen3.8-Flash-Next-W4A16-AutoRound | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparacion cuantitativa disponible se limita a la tabla del autor: capacidad 49,3 frente a 51,8 y velocidad 70-78 frente a 57 tok/s respecto al original top-10. No se dispone de datos de benchmarks frente a otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad por el recorte de expertos: pasar de top-10 a top-5 reduce la capacidad de cada token a la mitad del espacio de expertos; el autor cifra la perdida en unos cuatro puntos de capacidad general (49,3 frente a 51,8) incluso tras el healing.
- Dependencia de un build no estandar de vLLM: un vLLM de serie no puede servir la mezcla int4 + fp8 de este checkpoint, lo que anade complejidad operativa y riesgo de mantenimiento.
- Requiere descargar y montar la tabla PLE de 49 GB en fp8; sin ella el modelo no funciona correctamente, y el memory map desde disco introduce dependencia del almacenamiento local.
- El lm_head int4 conserva un 97,2% de acuerdo top-1 frente al bf16, inferior al 99,6% del head int8 que sustituye; puede introducir degradaciones sutiles en la distribucion de salida.
- Los benchmarks son del harness propio del autor, no de un leaderboard estandar, y la propia model card advierte que deben leerse como comparacion interna; no hay datos de MMLU, HumanEval o GSM8K.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingue equivalente al del modelo base.
- Longitud de contexto no especificada, lo que impide planificar despliegues con ventanas largas sin validacion empirica.
- Licencia "qwen" con terminos "other": es necesario revisar el enlace de licencia del modelo base para confirmar las condiciones de uso comercial.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible, y sesgos no documentados.
- El checkpoint esta pensado para una DGX Spark; no hay evidencia de que funcione en otras configuraciones de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/azampatti/Qwen3.8-Flash-Next-125B-A5B-INT4-AutoRound
- Modelo base (cuantizacion Intel): https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio de servicio: https://github.com/azampatti/Qwen3.8-Flash-Next-Int4-FAST
- Build de vLLM para DGX Spark: https://github.com/Saren-Arterius/qwen3.8-Flash-DGX-AutoRound
- Tabla PLE en fp8: https://huggingface.co/Saren/Qwen3.8-Flash-Next-ple-table-fp8
