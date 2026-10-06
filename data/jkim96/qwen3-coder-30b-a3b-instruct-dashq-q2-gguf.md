# jkim96/Qwen3-Coder-30B-A3B-Instruct-DASHQ-Q2-GGUF

## Resumen

Esta ficha describe la publicacion `jkim96/Qwen3-Coder-30B-A3B-Instruct-DASHQ-Q2-GGUF`, una cuantizacion de 2 bits del modelo Qwen3-Coder-30B-A3B-Instruct realizada con la herramienta DASH-Q (repositorio del autor JaeminK). No es un modelo nuevo ni un fine-tuning: el autor parte de los pesos originales de Qwen y los comprime a tamanos de clase 2 bits en formato GGUF para su uso con llama.cpp. El objetivo es permitir que un modelo MoE de aproximadamente 30.500 millones de parametros totales se ejecute en hardware con recursos de memoria muy reducidos (los ficheros ocupan entre 10,31 GB y 11,68 GB, frente a los mas de 60 GB que exigiria el modelo sin cuantizar en bf16).

El modelo base, Qwen3-Coder-30B-A3B-Instruct, es un modelo de generacion de texto orientado a codigo desarrollado por el equipo Qwen de Alibaba. La nomenclatura "A3B" indica que se trata de una arquitectura de mezcla de expertos (MoE) con unos 3.000 millones de parametros activos por token y 30.000 millones totales, lo que reduce el coste computacional por token a pesar del tamano del modelo. La cuantizacion DASH-Q preserva esta estructura MoE en formato GGUF, empleando unicamente tipos de tensor estandar de llama.cpp y sin superar los 4 bits en ningun tensor.

La relevancia de esta publicacion es practica: permite desplegar localmente un modelo de codigo de gran tamano en equipos de consumo con 12-16 GB de VRAM o incluso en configuraciones con memoria unificada, a costa de una degradacion medible de la perplejidad. El autor publica metricas comparativas de perplejidad frente a cuantizaciones equivalentes de llama.cpp y de unsloth, lo que permite evaluar el equilibrio entre tamano y calidad. La licencia es apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (heredada del modelo base; detalle completo no disponible) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible (la nomenclatura "A3B" del modelo base sugiere ~3.000 millones por token) |
| Longitud de contexto | no disponible (la model card no especifica; el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | IQ2_XXS (2,70 bits/peso), IQ2_M (2,83 bits/peso), Q2_K_XL (3,06 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp; ningun tensor supera los 4 bits) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3-Coder-30B-A3B-Instruct, un transformer con capas de mezcla de expertos (MoE) que combina un total de 30.532.122.624 parametros con un subconjunto de parametros activos por token. Esta publicacion no aporta informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si el modelo base recurrio a RLHF, DPO u otras tecnicas de alineamiento; tampoco documenta innovaciones arquitectonicas propias del modelo base. La unica informacion tecnica disponible se refiere al proceso de cuantizacion.

El autor aplica la herramienta DASH-Q sobre los pesos originales, empleando solamente tipos de tensor estandar de llama.cpp y garantizando que ningun tensor exceda los 4 bits. Se generan tres variantes en la clase de 2 bits, con matrices de importancia (imatrix) segun la convencion habitual de llama.cpp. Los ficheros resultantes cargan en cualquier version reciente de llama.cpp. La model card no detalla la metodologia interna de DASH-Q mas alla de la referencia a su repositorio en GitHub.

## Capacidades

Las capacidades listadas a continuacion se atribuyen al modelo base Qwen3-Coder-30B-A3B-Instruct, ya que la publicacion es una cuantizacion y no modifica las funcionalidades del modelo. La informacion proporcionada no detalla estas capacidades de forma explicita, por lo que se indican como herencia del base y sin confirmacion documental en esta model card:

- Generacion de texto y codigo (el modelo base esta orientado a tareas de programacion).
- Razonamiento y matematicas: no confirmado en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Conversacional: la etiqueta `conversational` aparece en los metadatos, lo que indica uso orientado a dialogo.

## Casos de uso

- Despliegue local de asistencia de codigo: con 10-12 GB de fichero GGUF, el modelo puede ejecutarse en un portatil con GPU de 16 GB o en un equipo con memoria unificada, ofreciendo autocompletado y generacion de codigo sin conexion.
- Prototipado en hardware de consumo: desarrolladores que quieran evaluar el comportamiento de un MoE de codigo de 30B antes de invertir en infraestructura cloud pueden usar las variantes Q2_K_XL o IQ2_M en una RTX 4090 o similar.
- Generacion de codigo en pipelines de CI/CD: el modelo puede integrarse como paso de revision automatizada o generacion de tests, dado que llama.cpp ofrece bindings para servidores y permite exponer una API compatible con OpenAI.
- Relleno de codigo en editores: gracias al formato GGUF y a llama.cpp, puede embeberse en plugins de editor que consuman un endpoint local, reduciendo la latencia y evitando enviar codigo a servicios externos.
- Procesamiento por lotes de tareas de codigo: al ser un MoE con pocos parametros activos, el coste por token es bajo en comparacion con un modelo denso de 30B, lo que lo hace adecuado para scripts que transformen o traduzcan grandes volumenes de codigo.
- Experimentacion en investigacion sobre cuantizacion: las tres variantes publicadas, con perplejidades documentadas, sirven como banco de pruebas para estudiar el impacto de la compresion a 2 bits en modelos MoE de codigo.
- Aprendizaje y docencia: para entornos educativos con hardware limitado, permite demostrar el funcionamiento de un modelo de codigo grande sin requisitos de GPU de datacenter.

## Benchmarks y rendimiento

La model card publica unicamente metricas de perplejidad (menor es mejor) medidas con `llama-perplexity` a contexto 2048 sobre WikiText-2 test y C4 validation (256 secuencias de 2048 tokens). No se proporcionan resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.).

| Tipo | Modelo | Tamano | WikiText-2 | C4 |
|---|---|---|---|---|
| IQ2_XXS | llama.cpp IQ2_XXS (imatrix) | 8,18 GB | 11,01 | 18,89 |
| IQ2_XXS | unsloth UD-IQ2_XXS | 10,33 GB | 8,40 | 14,23 |
| IQ2_XXS | DASH-Q IQ2_XXS | 10,31 GB | 8,58 | 14,51 |
| IQ2_XS | llama.cpp IQ2_XS (imatrix) | 9,08 GB | 9,57 | 16,21 |
| IQ2_M | llama.cpp IQ2_M (imatrix) | 10,17 GB | 8,93 | 15,24 |
| IQ2_M | unsloth UD-IQ2_M | 10,84 GB | 8,34 | 14,15 |
| IQ2_M | DASH-Q IQ2_M | 10,81 GB | 8,38 | 14,37 |
| Q2_K_XL | llama.cpp Q2_K (imatrix) | 11,26 GB | 8,83 | 14,83 |
| Q2_K_XL | unsloth UD-Q2_K_XL | 11,79 GB | 8,43 | 14,37 |
| Q2_K_XL | DASH-Q Q2_K_XL | 11,68 GB | 8,43 | 14,37 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 10 y 12 GB solo para los pesos, segun la variante elegida (IQ2_XXS 10,31 GB; IQ2_M 10,81 GB; Q2_K_XL 11,68 GB). Hay que sumar la memoria de la cache KV, que depende del contexto y del modelo base (no disponible).
- GPU recomendadas: no especificadas por el autor. Por tamano de pesos, una RTX 4090 (24 GB) o una RTX 4080 (16 GB) serian suficientes para cargar los pesos con margen para contexto moderado. GPUs de datacenter (A100, H100) no son necesarias para esta cuantizacion, aunque ofrecerian mas margen de contexto y velocidad.
- Cabe en GPU de consumo: si. Con 12 GB de VRAM y contexto pequeno (por ejemplo 8192 tokens, como en el ejemplo de la model card) la IQ2_XXS y la IQ2_M son las opciones mas ajustadas. La Q2_K_XL a 11,68 GB requerira 16 GB o mas para dejar espacio a la cache KV.
- Opciones de despliegue: llama.cpp (referencia directa en la model card mediante `llama-cli`), y cualquier runtime que consuma GGUF de llama.cpp, como Ollama o servidores compatibles. No se menciona soporte especifico para vLLM ni TGI, que normalmente no consumen GGUF de llama.cpp.
- Latencia y throughput estimados: no disponibles. El modelo base es MoE, por lo que el coste por token deberia ser inferior al de un modelo denso del mismo tamano, pero no se aportan cifras.

## Comparativa con modelos similares

La comparativa natural se establece con las otras cuantizaciones de 2 bits del mismo modelo base, tal como publica la model card:

| Modelo | Tamano | WikiText-2 | C4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DASH-Q IQ2_XXS | 10,31 GB | 8,58 | 14,51 | apache-2.0 | HuggingFace (jkim96) |
| unsloth UD-IQ2_XXS | 10,33 GB | 8,40 | 14,23 | apache-2.0 (heredada) | HuggingFace (unsloth) |
| llama.cpp IQ2_XXS (imatrix) | 8,18 GB | 11,01 | 18,89 | apache-2.0 (heredada) | HuggingFace (varios) |
| DASH-Q IQ2_M | 10,81 GB | 8,38 | 14,37 | apache-2.0 | HuggingFace (jkim96) |
| unsloth UD-IQ2_M | 10,84 GB | 8,34 | 14,15 | apache-2.0 (heredada) | HuggingFace (unsloth) |
| DASH-Q Q2_K_XL | 11,68 GB | 8,43 | 14,37 | apache-2.0 | HuggingFace (jkim96) |
| unsloth UD-Q2_K_XL | 11,79 GB | 8,43 | 14,37 | apache-2.0 (heredada) | HuggingFace (unsloth) |

Comparativas frente a modelos de otros desarrolladores: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2 bits degrada la calidad respecto al modelo original. La perplejidad de la variante DASH-Q IQ2_XXS es 8,58 en WikiText-2, frente a valores notablemente mejores en cuantizaciones de mayor numero de bits del mismo modelo (no incluidos en la tabla).
- En las tres variantes, DASH-Q presenta una perplejidad ligeramente superior a la cuantizacion equivalente de unsloth (por ejemplo, 8,58 frente a 8,40 en IQ2_XXS), aunque con tamanos de archivo muy similares. En la variante Q2_K_XL ambas coinciden (8,43 y 14,37).
- Riesgo de alucinacion: no cuantificado en la model card. Es esperable que aumente con la compresion agresiva, pero no hay mediciones disponibles.
- Sesgos conocidos: no disponibles. Dependen del modelo base y de su dataset de entrenamiento, no documentado en esta publicacion.
- Limitaciones de contexto e idioma: no disponibles. La model card no especifica la ventana de contexto soportada por el modelo base ni los idiomas cubiertos.
- Restricciones de licencia: la licencia es apache-2.0, heredada del modelo base, por lo que el uso comercial esta permitido bajo los terminos de dicha licencia. Conviene verificar los terminos del modelo original de Qwen antes de un despliegue en produccion.
- Advertencia de madurez: la publicacion registra 0 descargas y 0 "likes" en el momento de la consulta (creada y actualizada el 5 de octubre de 2026, con apenas 15 minutos de diferencia), por lo que no cuenta con validacion de la comunidad. Conviene reproducir las metricas de perplejidad de forma independiente antes de confiar en ellas.
- Compatibilidad: los ficheros requieren una version reciente de llama.cpp. Una version antigua podria no reconocer correctamente los tipos de tensor empleados.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/jkim96/Qwen3-Coder-30B-A3B-Instruct-DASHQ-Q2-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio DASH-Q: https://github.com/JaeminK/dashq
- Banner de DASH-Q: https://raw.githubusercontent.com/JaeminK/dashq/main/assets/dashq_banner.png
- Otros enlaces (papers, blogs, demos): no disponibles en la informacion proporcionada.
