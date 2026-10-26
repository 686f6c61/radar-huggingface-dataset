# grumd0/Nemotron-3.5-Bolt-E4B-Heretic

## Resumen

Nemotron-3.5-Bolt-E4B-Heretic es una variante "abliterated" (sin censura) del modelo nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, publicada por el usuario grumd0. El modelo base lo desarrolla NVIDIA y deriva a su vez del modelo de Google gemma-4-E4B-it, por lo que la familia arquitectonica es la de Gemma 4. El proceso de ablacion se ha realizado con la herramienta Heretic, concretamente con su modificador Arbitrary-Rank Ablation (ARA), que proyecta fuera de las activaciones intermedias las direcciones asociadas al comportamiento de rechazo.

El objetivo del autor es reducir la tasa de negativas del modelo ante peticiones que el modelo original rechaza, manteniendo al mismo tiempo el comportamiento util. Segun la model card, la tasa de rechazo en JailbreakBench Harmful cae de 89/100 en el modelo base a 3/100 en esta variante, con una divergencia KL de 0,0859 medida sobre harmless_alpaca. Los pesos ocupan 16 GB en el repositorio, lo que cuadra con los 7.996.156.490 parametros declarados en formato BF16.

Es relevante porque ejemplifica una practica cada vez mas extendida en la comunidad open source: tomar un modelo alineado de un fabricante y aplicar tecnicas de direccion de rechazo para obtener una variante sin restricciones de contenido. Esto tiene interes para investigacion sobre alineamiento, interpretabilidad y robustez de salvaguardas, pero tambien implica riesgos evidentes de uso y obligaciones de licencia que conviene revisar antes de desplegarlo. No es un producto de NVIDIA ni de Google y se distribuye sin garantia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Gemma 4 (tag `gemma4`); numero de capas, atencion y detalles internos no disponibles |
| Parametros totales | 7.996.156.490 (~8B), dato de safetensors |
| Parametros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Repositorio principal en safetensors (16 GB, consistente con BF16); variantes GGUF en repositorio aparte, niveles concretos no disponibles |
| Idiomas soportados | 34 idiomas: en, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, no, pl, pt, ro, ru, sk, sl, sv, th, tr, uk, vi, zh |
| Licencia | OpenMDW License Agreement 1.1 (modelo base NVIDIA); modelo upstream gemma-4-E4B-it bajo Apache 2.0; en HuggingFace figura como `other` |
| Formato de pesos | safetensors (repo principal) y GGUF (repo hermano) |
| Modalidad declarada | `image-text-to-text` en los tags, `text-generation` como pipeline; no hay detalle del codificador visual |
| Metodo de modificacion | Abliteration con Heretic, modificador Arbitrary-Rank Ablation (ARA), capas 12 a 27 |
| Tamano del repositorio | 16,0 GB |
| Fecha de publicacion | 26 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 en su variante E4B, post-entrenada por NVIDIA para dar lugar a Nemotron-3.5-Bolt-E4B. La informacion proporcionada no incluye el numero de capas, la configuracion de atencion, la ventana de contexto ni el volumen o composicion exactos de los datos de preentrenamiento y post-entrenamiento (SFT, RLHF o DPO). Tampoco se detalla si el modelo incorpora modulos especificos para vision mas alla del tag `image-text-to-text`, ni si dispone de modo de razonamiento explicito.

La innovacion tecnica de esta ficha no esta en el entrenamiento sino en la modificacion posterior. Heretic calcula, para cada capa del rango seleccionado, direcciones de activacion asociadas al rechazo comparando respuestas a peticiones daninas y benignas, y las resta de los pesos. La variante ARA emplea un subespacio de rango arbitrario (no una unica direccion) y permite ponderar por capa cuanto se preserva el comportamiento bueno y cuanto se empuja el malo. Los hiperparametros publicados son `start_layer_index` = 12, `end_layer_index` = 27, `preserve_good_behavior_weight` = 0,5232, `steer_bad_behavior_weight` = 0,0002376, `overcorrect_relative_weight` = 0,7487 y `neighbor_count` = 14. El coste de esta intervencion se mide con la divergencia KL sobre `mlabonne/harmless_alpaca`, que pasa de 0 en el base a 0,0859 en esta variante.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Nemotron-3.5-Bolt-E4B.
- Capacidad multimodal declarada mediante el tag `image-text-to-text`, aunque no se documenta el alcance real ni el formato de entrada de imagen.
- Cobertura multilingue declarada de 34 idiomas, con presencia de las principales lenguas europeas, asiaticas y el arabe.
- Reduccion drastica del comportamiento de rechazo: 3/100 en JailbreakBench Harmful y 0/100 en JailbreakBench Benign, frente a 89/100 y 18/100 del modelo base.
- Mayor tolerancia en pruebas de XSTest Unsafe: 32/200 frente a 155/200 del base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta modo thinking.
- Capacidades de codigo y matematicas: no disponibles como datos medidos; se asumen las del modelo base, sin verificacion publicada.

## Casos de uso

- Investigacion sobre alineamiento y robustez: el modelo sirve como caso controlado para estudiar como varia la tasa de rechazo al ablacionar un subespacio de direcciones entre las capas 12 y 27, comparando siempre contra el base con la misma bateria de prompts.
- Analisis de interpretabilidad de la direccion de rechazo: al conocerse los hiperparametros exactos de Heretic, se puede reproducir el proceso y medir el efecto de cada peso (`preserve_good_behavior_weight`, `steer_bad_behavior_weight`) sobre la divergencia KL.
- Red teaming interno y evaluacion de salvaguardas: util para probar si los filtros de una aplicacion aguantan un modelo con rechazo reducido antes de desplegar un sistema real.
- Generacion de contenido creativo sin friccion: escritura de ficcion, guiones o narrativa con tematicas adultas o violentas donde un modelo alineado bloquearia la peticion; requiere revision editorial humana.
- Traduccion y generacion multilingue en 34 idiomas con un unico modelo de ~8B, adecuado para entornos con recursos limitados donde no se quiere mantener un modelo por idioma.
- Procesamiento de documentos con imagen y texto, si se confirma la capacidad multimodal del tag, en flujos de extraccion y resumen de capturas o formularios escaneados.
- Prototipado local en estaciones de trabajo: con cuantizacion de 4 bits ocupa del orden de 5-6 GB, por lo que cabe en GPU de consumo y permite experimentar sin infraestructura dedicada.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son las tasas de rechazo y la divergencia KL. No hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de capacidad general en la informacion disponible.

| Metrica | Modelo base | Este modelo |
|---|---:|---:|
| JailbreakBench Harmful (rechazos) | 89/100 | 3/100 |
| JailbreakBench Benign (rechazos) | 18/100 | 0/100 |
| XSTest Unsafe (rechazos) | 155/200 | 32/200 |
| Divergencia KL (harmless_alpaca) | 0 | 0,0859 |

El autor indica que ninguno de los prompts empleados en la tabla formaba parte del conjunto de entrenamiento de Heretic. No se han publicado resultados de benchmarks de capacidad (razonamiento, codigo, matematicas) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 16 GB solo de pesos, mas cache KV; en la practica 20-24 GB para contextos moderados.
- VRAM con cuantizacion de 8 bits: del orden de 8-9 GB de pesos, unos 12 GB con cache; encaja en RTX 4080/4090 y A100 40 GB.
- VRAM con cuantizacion de 4 bits (GGUF): del orden de 5-6 GB de pesos; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y, con offload parcial a CPU, en GPU de 8 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente en BF16; RTX 4090 (24 GB) para BF16 en un solo usuario; RTX 4080, 3090 o 4070 Ti Super para 8 bits.
- Consumer GPU: si, en 4 bits practicamente cualquier GPU de 8 GB o mas; en BF16 solo modelos con 24 GB o mas.
- Opciones de despliegue: `transformers` (libreria declarada), llama.cpp y Ollama a traves del repositorio GGUF, vLLM o TGI si la arquitectura Gemma 4 esta soportada por la version correspondiente (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo (JBB Harmful) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-Heretic (este) | ~8B | no disponible | 3/100 | OpenMDW 1.1 sobre base NVIDIA + Apache 2.0 upstream | safetensors y GGUF en HuggingFace |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | ~8B | no disponible | 89/100 | OpenMDW 1.1 | safetensors BF16 en HuggingFace |
| google/gemma-4-E4B-it | no disponible en la informacion | no disponible | no disponible | Apache 2.0 | HuggingFace |

La comparacion relevante es directa: este modelo y el base comparten pesos de partida, tamano y arquitectura, y solo difieren en la ablacion, por lo que la diferencia de rechazo y de divergencia KL es atribuible al proceso de Heretic. Frente a `gemma-4-E4B-it` no hay datos de rendimiento ni de rechazo en la informacion proporcionada. Existen otras variantes abliterated de modelos de tamano similar en el ecosistema, pero no se dispone de metricas comparables para incluirlas con rigor.

## Limitaciones y advertencias

- Modelo sin censura: al reducir el rechazo, puede producir contenido inexacto, sesgado, ofensivo o danino que el modelo base bloquearia. El propio autor lo advierte de forma explicita.
- No es un producto de NVIDIA ni de Google y se distribuye sin garantia de ningun tipo.
- Divergencia KL de 0,0859 sobre harmless_alpaca: implica un desplazamiento medible de la distribucion de salida respecto al base, con posible degradacion de comportamiento en tareas benignas no evaluadas.
- Riesgo de alucinacion no medido: no hay evaluaciones de veracidad ni de factualidad publicadas para esta variante.
- Sin datos de benchmarks de capacidad: no se puede afirmar que conserve el rendimiento del base en razonamiento, codigo o matematicas.
- Cobertura linguistica declarada pero no verificada: los 34 idiomas provienen de los metadatos del modelo base y no hay evaluaciones por idioma.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos sin verificarla en la configuracion del modelo.
- Ambiguedad de modalidad: los tags incluyen `image-text-to-text` pero el pipeline declarado es `text-generation`; conviene comprobar en la practica si procesa imagenes.
- Licencia: el uso comercial esta sujeto a la OpenMDW 1.1 del modelo base NVIDIA, cuyos terminos deben revisarse, mas las obligaciones de atribucion de Apache 2.0 del modelo upstream Gemma. La modificacion no elimina estas obligaciones.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia externa de calidad ni de estabilidad.
- Uso responsable: el despliegue en produccion de cara al publico exige filtros propios y supervision, dado que las salvaguardas internas han sido deliberadamente reducidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/grumd0/Nemotron-3.5-Bolt-E4B-Heretic
- Cuantizaciones GGUF: https://huggingface.co/grumd0/Nemotron-3.5-Bolt-E4B-Heretic-GGUF
- Modelo base NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo upstream de Google: https://huggingface.co/google/gemma-4-E4B-it
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Dataset de calibracion de la divergencia KL: https://huggingface.co/datasets/mlabonne/harmless_alpaca
