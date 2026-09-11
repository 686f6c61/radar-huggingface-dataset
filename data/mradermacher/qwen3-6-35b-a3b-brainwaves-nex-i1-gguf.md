# mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-i1-GGUF

## Resumen

Esta ficha cubre el repositorio `mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-i1-GGUF`, publicado por el usuario mradermacher, especializado en la cuantizacion comunitaria de pesos a formato GGUF. No se trata de un modelo entrenado desde cero, sino de una reedicion cuantizada del modelo `nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex`, del que no se aporta informacion tecnica en la model card. El repositorio contiene 24 variantes de cuantizacion generadas con imatrix (pesos ponderados), lo que permite ejecutar un modelo de aproximadamente 35.500 millones de parametros en hardware de consumo mediante llama.cpp y derivados.

El dato mas relevante es su naturaleza de mezcla de expertos (MoE) inferida de la nomenclatura "A3B": 35,5 mil millones de parametros totales con aproximadamente 3 mil millones activos por token. Esa relacion hace que el coste de computo por token sea cercano al de un modelo denso de 3B, mientras que la calidad potencial se acerca a la de un modelo de 35B, lo que lo situa en la categoria de modelos eficientes para despliegue local. El tamano total del repositorio agregado es de 49,6 GB, correspondiente al conjunto de todas las cuantizaciones publicadas.

La relevancia de esta publicacion es principalmente practica: permite evaluar y desplegar un modelo de gran tamano en CPU, GPU de gama alta o equipos Apple Silicon sin necesidad de infraestructura de centro de datos. Como contrapartida, la ficha carece de informacion sobre licencia, idiomas, contexto y datos de entrenamiento, por lo que cualquier uso en produccion requiere verificar primero el repositorio del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada; la nomenclatura sugiere mezcla de expertos, sin confirmar) |
| Parametros totales | 35.505.251.456 (≈35,5 B) |
| Parametros activos | ≈3 B (inferido del sufijo "A3B" del nombre; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_M, IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); cuantizaciones ponderadas con imatrix |
| Modelo base | nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 49,6 GB (conjunto de todas las cuantizaciones) |
| Fecha de creacion | 2026-09-11 |
| Ultima actualizacion | 2026-09-11 |
| Etiquetas | gguf, endpoints_compatible, region:us, imatrix, conversational |
| Descargas / me gusta | 0 / 1 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. La model card del repositorio GGUF es puramente instrumental: indica el origen de los pesos (`nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex`), el metodo de cuantizacion (pesos ponderados con imatrix, `output_tensor_quantised: 1`, `convert_type: hf`, `quantize_version: 2`) y la lista de cuantizaciones generadas. No se documentan capas, tipo de atencion, numero de expertos, mecanismo de enrutamiento ni estrategia de posicionamiento.

A partir del identificador "35B-A3B" puede inferirse una arquitectura de mezcla de expertos con aproximadamente 35,5 B de parametros totales y en torno a 3 B activos por token, patron habitual en la familia Qwen3 (por ejemplo, Qwen3-30B-A3B). El sufijo "Brainwaves-Nex" no esta explicado en la informacion proporcionada y podria corresponder a un ajuste fino o una fusion de pesos, pero no hay documentacion que lo confirme. Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. La etiqueta `conversational` sugiere un ajuste orientado a dialogo, sin mas detalle.

En cuanto a la innovacion tecnica atribuible a este repositorio, esta se limita al proceso de cuantizacion: el uso de matrices de importancia (imatrix) calculadas a partir de un corpus de calibracion permite preservar mejor la calidad en cuantizaciones agresivas (Q2, Q3, IQ2, IQ3), que en un modelo de 35,5 B resultan criticas para reducir el peso a rangos manejables en hardware de consumo. La disponibilidad de una gama tan amplia de cuantizaciones, desde IQ1_S hasta Q6_K, es la aportacion principal del autor.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y esta pensado para dialogos multi-turno.
- Generacion de texto general: capacidades heredadas del modelo base, no verificadas en la informacion disponible.
- Razonamiento y matematicas: no disponible (no documentado).
- Generacion de codigo: no disponible (no documentado).
- Soporte de tool calling / function calling: no disponible (no documentado; la etiqueta `endpoints_compatible` se refiere a la compatibilidad del repositorio con endpoints, no a capacidades del modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se declara ninguna.
- Inferencia local eficiente: capacidad efectiva derivada de la arquitectura MoE con ~3 B de parametros activos, que reduce el coste por token frente a un modelo denso del mismo tamano total.

## Casos de uso

- Asistente conversacional autoalojado: desplegado con llama.cpp u Ollama, el modelo puede gestionar dialogos multi-turno en local sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad estrictos. La ventana de contexto real debe verificarse antes de disenar el flujo conversacional.
- Prototipado de aplicaciones de IA generativa en equipos de desarrollo: al existir cuantizaciones desde IQ1_S hasta Q6_K, un mismo modelo puede probarse en un portatil modesto y luego desplegarse con mas precision en un servidor, sin cambiar de pipeline gracias al formato GGUF.
- Evaluacion comparativa de cuantizaciones: el repositorio es util como banco de pruebas para medir la degradacion de calidad entre Q2_K, Q3_K_M, Q4_K_M y Q6_K sobre una misma tarea, algo relevante para decidir el equilibrio entre tamano y fidelidad.
- Inferencia en CPU o en equipos Apple Silicon: con ~3 B de parametros activos, la generacion token a token es viable sin GPU dedicada, lo que permite usar el modelo en estaciones de trabajo con memoria unificada de 32 GB o mas.
- Despliegue en GPU de gama alta para baja latencia: en una RTX 4090, A100 o H100 con la cuantizacion completa en VRAM, el modelo puede atender cargas interactivas, sujeto a la validacion previa de la licencia para uso comercial.
- Base para ajuste fino o experimentacion posterior: aunque el formato GGUF no es el ideal para reentrenamiento, el modelo base en safetensors sirve como punto de partida para LoRA o para experimentos de mezcla de pesos.
- Procesamiento por lotes de texto en servidores sin acelerador: la relacion parametros totales/activos permite ejecutar tareas de resumen o reescritura en servidores con CPU y RAM abundante, priorizando coste frente a latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye mediciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y tampoco se han encontrado datos en la busqueda web. No se dispone por tanto de comparaciones de rendimiento entre cuantizaciones ni frente al modelo base.

## Requisitos de hardware

Estimaciones calculadas a partir de los 35.505.251.456 parametros y del numero de bits por peso habitual de cada tipo de cuantizacion. No son mediciones del autor y deben tomarse como orientativas; hay que anadir aproximadamente 1-4 GB de sobrecarga para cache KV y buffers, en funcion del contexto configurado.

| Cuantizacion | Peso aproximado de los pesos | VRAM estimada con contexto moderado |
|---|---|---|
| IQ1_S | ≈7 GB | 8-10 GB |
| IQ2_XXS / IQ2_XS / IQ2_M | ≈9-11 GB | 11-14 GB |
| Q2_K / Q2_K_S | ≈12 GB | 13-16 GB |
| IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M | ≈13-16 GB | 15-19 GB |
| Q3_K_S / Q3_K_M / Q3_K_L | ≈16-18 GB | 18-21 GB |
| IQ4_XS / IQ4_NL / Q4_0 / Q4_1 / Q4_K_S | ≈19-21 GB | 21-24 GB |
| Q4_K_M | ≈21-22 GB | 23-26 GB |
| Q5_K_S / Q5_K_M | ≈24-25 GB | 26-29 GB |
| Q6_K | ≈28-29 GB | 30-33 GB |
| F16 (no incluida en el repositorio) | ≈71 GB | 73-75 GB |

- GPU de gama alta de consumo: RTX 3090 o RTX 4090 con 24 GB admiten Q4_K_M de forma ajustada con contexto reducido, y Q3_K_M o inferiores con margen. Una RTX 5090 con 32 GB permite Q5_K_M y probablemente Q6_K con contexto corto.
- GPU profesionales: A100 de 40 GB y 80 GB, H100 de 80 GB o L40S de 48 GB pueden alojar sin problemas Q5_K_M y Q6_K, con espacio para contextos largos y procesamiento por lotes.
- Despliegue hibrido: al ser MoE con unos 3 B de parametros activos, es viable descargar parte de las capas a RAM del sistema y mantener los expertos mas usados en VRAM, manteniendo una velocidad aceptable.
- Equipos Apple Silicon: con memoria unificada de 32 GB se pueden ejecutar cuantizaciones Q4 con contexto moderado; con 64 GB son viables Q5 y Q6.
- Solo CPU: con 32 GB de RAM es posible ejecutar Q2_K a Q4_K_S, con velocidad limitada por ancho de banda de memoria.
- Opciones de despliegue: llama.cpp y sus envoltorios (Ollama, LM Studio, kobold.cpp), llama-cpp-python para integracion en aplicaciones, y servidores compatibles con la API de OpenAI. vLLM y TGI no son opciones directas para GGUF, aunque vLLM admite GGUF de forma experimental; para uso en produccion con vLLM seria preferible partir del modelo base en safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

La comparacion se establece con modelos de mezcla de expertos con parametros activos en el rango de 2-13 B, que es la categoria natural de este repositorio. Los datos del modelo objeto de la ficha son los declarados en el repositorio; los de las alternativas son caracteristicas publicas de esos modelos y pueden variar segun la version consultada. No se dispone de resultados de benchmarks del modelo evaluado, por lo que la comparacion de rendimiento no puede realizarse.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Brainwaves-Nex (este repositorio) | ≈35,5 B | ≈3 B (inferido) | no disponible | no disponible | GGUF en HuggingFace |
| Qwen3-30B-A3B | ≈30,5 B | ≈3,3 B | 128 K nativo (ampliable con YaRN) | Apache 2.0 | safetensors y GGUF |
| Mixtral 8x7B | ≈46,7 B | ≈12,9 B | 32 K | Apache 2.0 | safetensors y GGUF |
| DeepSeek-V2-Lite | ≈15,7 B | ≈2,4 B | 32 K | licencia propia de DeepSeek | safetensors |

Frente a Qwen3-30B-A3B, este modelo ofrece un numero de parametros totales algo mayor, pero parte de una licencia indeterminada, lo que supone una desventaja clara para uso comercial. Frente a Mixtral 8x7B, el coste de computo por token es aproximadamente cuatro veces menor gracias a sus ~3 B activos, aunque no hay datos que permitan comparar calidad. Frente a DeepSeek-V2-Lite, el modelo es mas del doble de grande en total, con un numero de parametros activos similar.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. Es imprescindible consultar el repositorio del modelo base (`nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex`) antes de cualquier despliegue en produccion, ya que la licencia del modelo original condiciona la de la cuantizacion.
- Documentacion practicamente inexistente: se desconoce la arquitectura exacta, la longitud de contexto, los idiomas soportados y las capacidades reales. Cualquier afirmacion sobre el comportamiento del modelo debe validarse empiricamente.
- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluacion de sesgo ni de seguridad.
- Riesgo de alucinacion: no cuantificado. Al no existir benchmarks ni evaluaciones publicadas, no puede estimarse la tasa de respuestas incorrectas o inventadas.
- Degradacion por cuantizacion: las variantes de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, Q2_K) reducen drasticamente la fidelidad de los pesos, sobre todo en tareas de razonamiento y codigo. Aunque el uso de imatrix mitiga parcialmente el efecto, no se recomienda su empleo en produccion mas alla de pruebas de concepto.
- Idioma: al no declararse idiomas soportados, no hay garantia de un rendimiento adecuado en castellano; el comportamiento en idiomas distintos del ingles (o del idioma dominante del modelo base) debe comprobarse caso por caso.
- Contexto: la longitud de contexto efectiva es desconocida y, ademas, depende de la configuracion de `n_ctx` en el motor de inferencia; valores altos incrementan de forma notable el consumo de memoria por la cache KV.
- Adopcion nula: el repositorio registra 0 descargas y 1 me gusta en el momento de la consulta, por lo que no existe comunidad que haya validado su funcionamiento ni reportado errores.
- Ausencia de benchmarks: no hay ningun dato de rendimiento publicado, ni para el modelo base ni para las cuantizaciones, lo que impide justificar su eleccion frente a alternativas con licencia clara y evaluaciones publicas.
- Resultados de busqueda no relevantes: la busqueda web realizada ha devuelto exclusivamente resultados de un sitio para adultos sin relacion alguna con el modelo. No se ha podido localizar informacion adicional fiable sobre este repositorio.

## Enlaces

- Repositorio HuggingFace del modelo evaluado: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-i1-GGUF
- Modelo base declarado en la model card: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Referencia sobre cuantizacion ponderada con imatrix en llama.cpp: https://github.com/ggml-org/llama.cpp
- Nota: la busqueda web realizada no ha devuelto articulos, papers, blogs ni demostraciones relacionadas con este modelo; los unicos resultados obtenidos no guardan relacion con el contenido de esta ficha.
