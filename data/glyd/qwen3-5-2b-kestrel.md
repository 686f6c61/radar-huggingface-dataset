# glyd/Qwen3.5-2B-kestrel

## Resumen

Qwen3.5-2B-kestrel es un checkpoint cuantizado de Qwen/Qwen3.5-2B publicado por glyd bajo su nivel de compresion "kestrel". Se trata de una cuantizacion con perdida (lossy) realizada una sola vez a partir de los pesos bf16 originales, que reduce el tamano de descarga de 3,8 GB a 1,5 GB, un 59% menos, con un coste medido de divergencia KL de 0,00581 frente al modelo en bf16 sobre WikiText-2. El checkpoint se distribuye unicamente en formato safetensors y solo es ejecutable con el motor propietario de glyd.

El modelo base Qwen3.5-2B tiene 1.881.825.088 parametros, mientras que los ficheros safetensors de este repositorio declaran 1.531.143.091 parametros, una diferencia que la propia model card atribuye a que las etiquetas de "8-bit precision" y "Model size" del Hub cuentan bytes empaquetados: el checkpoint real es de aproximadamente 6,5 bits por peso. La ventana de contexto anunciada es de 32.000 tokens y cabe completa en GPUs como RTX 4090, L40S o RTX A6000.

Su relevancia actual es limitada y muy especifica: es un ejemplo de cuantizacion agresiva orientada a despliegue local en GPU de consumo, con datos de velocidad y divergencia publicados, pero condicionado a un runtime no estandar (motor glyd, licencia BUSL-1.1) y sin compatibilidad con vLLM, transformers ni llama.cpp en el momento de la publicacion. Con 15 descargas y 0 likes, la validacion por parte de la comunidad es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; checkpoint cuantizado de Qwen/Qwen3.5-2B (tag `qwen3_5`, pipeline text-generation) |
| Parametros totales | 1.881.825.088 parametros segun la model card; 1.531.143.091 declarados en safetensors (bytes empaquetados) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 32.000 tokens (32k, soportados en RTX 4090, L40S y RTX A6000) |
| Tipos de cuantizacion | Nivel "kestrel" de glyd, aproximadamente 6,5 bits por peso, cuantizacion unica desde bf16; etiquetado como `8-bit` en el Hub |
| Idiomas soportados | No disponible |
| Licencia | Pesos: Apache-2.0. Motor glyd necesario para ejecutarlo: BUSL-1.1 (uso personal y no comercial gratuito; uso comercial requiere licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen/Qwen3.5-2B en la documentacion proporcionada. Lo que si se detalla es el proceso de compresion: el checkpoint es una cuantizacion con perdida de los pesos bf16 del commit `15852e8c` de Qwen/Qwen3.5-2B, aplicada una sola vez (no es una cadena de cuantizaciones sucesivas). El resultado ocupa aproximadamente 6,5 bits por peso y se empaqueta en safetensors. No se menciona ningun entrenamiento adicional, ajuste por RLHF/DPO ni destilacion sobre el modelo cuantizado.

La metrica de fidelidad publicada es la divergencia KL entre las probabilidades del siguiente token del checkpoint kestrel y las del bf16 original, medida sobre WikiText-2: 0,00581. La model card compara este valor con el nivel "swift" del mismo autor (0,0224), mas agresivo en tamano (1,3 GB, 65% menos que bf16) pero con mayor desviacion respecto al original. Tambien se documenta que la parte de vision del modelo base no se incluye en este checkpoint: es exclusivamente de texto.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`.
- Uso conversacional: el repositorio incluye la etiqueta `conversational`.
- Contexto largo: soporta ventanas de hasta 32.000 tokens segun la model card, con el consumo de memoria medido en GPUs de 24-48 GB.
- Razonamiento, matematicas y generacion de codigo: no documentado en la informacion disponible.
- Tool calling / function calling: no documentado.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponible (el campo de idiomas no esta cumplimentado).
- Vision: el modelo base dispone de componente de vision, pero este checkpoint no la incluye; es solo texto.
- Modo "thinking" u otras capacidades especiales: no documentado.

## Casos de uso

- Asistentes conversacionales locales: el checkpoint cabe en 2,2-2,5 GB de memoria de GPU a 4k de contexto, por lo que puede ejecutarse en una unica RTX 4090 o RTX A6000 como chatbot de texto sin dependencia de servicios en la nube, siempre que se acepte el motor glyd como runtime.
- Procesamiento de documentos largos: con 32k tokens de contexto se pueden resumir o extraer informacion de informes, contratos o articulos completos en una sola pasada, sin troceado ni recuperacion externa.
- Clasificacion y extraccion de informacion en pipelines de ingesta: al ser un modelo de 2B con throughput de 285-396 tokens/s, es viable etiquetar grandes volumenes de texto en lote sobre una GPU unica.
- Generacion de texto asistida en escritorio: integracion en herramientas de redaccion o correccion que requieran un modelo pequeno, local y con licencia Apache-2.0 sobre los pesos.
- Investigacion en cuantizacion: el repositorio publica divergencia KL y velocidad frente a bf16 y frente al nivel swift, lo que lo convierte en un punto de comparacion util para estudiar la relacion entre tasa de bits, fidelidad y latencia.
- Despliegue en entornos aislados o sin conectividad: al ejecutarse en local sobre Linux y una GPU NVIDIA, encaja en escenarios con requisitos de confidencialidad donde no se permite enviar datos a APIs externas.
- Evaluacion de pipelines conversacionales multi-turno: la etiqueta `conversational` y la ventana de 32k permiten mantener historiales de dialogo extensos para pruebas de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos publicados son de fidelidad respecto al bf16 y de velocidad de inferencia con el motor glyd 0.29.4 (medidos el 2026-10-09, una GPU por prueba, contexto de 4k tokens):

| Metrica | bf16 (original) | kestrel (este repo) | swift (glyd) |
|---|---|---|---|
| Tamano de descarga | 3,8 GB | 1,5 GB | 1,3 GB |
| Reduccion frente a bf16 | – | 59% | 65% |
| Divergencia KL vs bf16 (WikiText-2) | 0 | 0,00581 | 0,0224 |
| Throughput en RTX 4090 | No disponible | 396 tok/s | 443 tok/s |

| GPU | Tokens/s | Primer token | Memoria a 4k | Contexto de 32k |
|---|---|---|---|---|
| RTX 4090 | 396 | 44 ms | 2,4 GB | Si |
| L40S | 317 | 41 ms | 2,5 GB | Si |
| RTX A6000 | 285 | 71 ms | 2,2 GB | Si |

## Requisitos de hardware

- VRAM estimada para inferencia: 2,2-2,5 GB de memoria de GPU en uso con contexto de 4k, segun la GPU empleada. No se publica el consumo exacto a 32k, solo que cabe en las GPUs listadas.
- GPUs validadas por el autor: NVIDIA RTX 4090 (396 tok/s), NVIDIA L40S (317 tok/s) y NVIDIA RTX A6000 (285 tok/s).
- GPU de consumo: si, cabe en una RTX 4090 y, por el consumo de memoria declarado (2,2-2,5 GB), en cualquier GPU con al menos 3-4 GB de VRAM libre, aunque solo se han medido las tres GPUs anteriores.
- Requisitos de sistema: Linux con GPU NVIDIA y driver 580 o superior.
- Opciones de despliegue: exclusivamente el motor de glyd (`glyd run Qwen/Qwen3.5-2B:kestrel`, instalable con `curl -LsSf https://getglyd.com/install.sh | sh`). La model card indica explicitamente que no es compatible con vLLM ni con transformers "todavia", y no se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia: primer token de 44 ms en RTX 4090, 41 ms en L40S y 71 ms en RTX A6000.
- Throughput: 396 tok/s en RTX 4090, 317 tok/s en L40S, 285 tok/s en RTX A6000.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Contexto | KL vs bf16 | Throughput (RTX 4090) | Licencia de pesos | Runtime |
|---|---|---|---|---|---|---|---|
| glyd/Qwen3.5-2B-kestrel | 1.881.825.088 (1.531.143.091 empaquetados) | 1,5 GB | 32k | 0,00581 | 396 tok/s | Apache-2.0 | Motor glyd (BUSL-1.1) |
| glyd/Qwen3.5-2B-swift | Mismo modelo base | 1,3 GB | No disponible | 0,0224 | 443 tok/s | Apache-2.0 | Motor glyd (BUSL-1.1) |
| Qwen/Qwen3.5-2B (bf16) | 1.881.825.088 | 3,8 GB | No disponible | 0 | No disponible | Apache-2.0 | Estandar (transformers, etc.) |

No se dispone de datos de benchmarks (MMLU, HumanEval, GSM8K) para ninguno de los tres, por lo que la comparacion se limita a tamano, fidelidad frente al bf16 y velocidad. No se han identificado otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion con perdida: la divergencia KL de 0,00581 frente al bf16 implica un cambio real en la distribucion de probabilidad del siguiente token; no es un checkpoint lossless y puede degradar tareas sensibles a la precision.
- Vision no incluida: el modelo base incorpora componente de vision, pero este checkpoint es solo texto. Cualquier caso de uso multimodal no es viable.
- Runtime propietario: solo funciona con el motor de glyd, que no es open source (BUSL-1.1). No hay soporte documentado para vLLM, transformers, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y la integracion en stacks existentes.
- Restriccion de licencia para uso comercial: aunque los pesos son Apache-2.0, el motor necesario para ejecutarlos es BUSL-1.1 y su uso comercial requiere una licencia de pago a glyd. En la practica, el uso comercial del conjunto esta condicionado.
- Requisitos de plataforma: Linux con GPU NVIDIA y driver 580 o superior. No se menciona soporte para macOS, Windows ni aceleradores AMD/Intel.
- Idiomas: no disponible; no se puede confirmar el soporte multilingue del checkpoint.
- Riesgo de alucinacion y sesgos: no documentado por el autor. Al derivar de Qwen3.5-2B, hereda las caracteristicas de ese modelo base, pero no se aportan evaluaciones de sesgo, toxicidad o veracidad.
- Validacion externa minima: 15 descargas y 0 likes en el momento de la consulta; no hay evaluaciones de terceros ni resultados de benchmarks publicos.
- Discrepancia de parametros: la cifra declarada en safetensors (1.531.143.091) no coincide con la de la model card (1.881.825.088); conviene tenerlo en cuenta al calcular presupuestos de memoria o al comparar con otros checkpoints.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/glyd/Qwen3.5-2B-kestrel
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Commit del modelo base usado para la cuantizacion: https://huggingface.co/Qwen/Qwen3.5-2B/tree/15852e8c16360a2fea060d615a32b45270f8a8fc
- Nivel de cuantizacion alternativo (glyd swift): https://huggingface.co/glyd/Qwen3.5-2B-swift
- Motor de ejecucion glyd: https://getglyd.com
- Script de instalacion del motor: https://getglyd.com/install.sh
- Paper, blog o repositorio adicional: no disponible
