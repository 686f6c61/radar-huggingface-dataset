# DuoNeural/DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3-IQ2_XXS-GGUF

## Resumen

Este repositorio contiene una cuantizacion experimental en formato GGUF del modelo DeepSeek-R1-Distill-Qwen-1.5B, publicada por DuoNeural Research Lab (Jesse Caldwell, Archon y Aura) bajo el nombre DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3-IQ2_XXS. Se trata de un checkpoint de investigacion que aplica una metodologia propia denominada GTAP v3 (con el tag tap-dpq, asociado a mecanica estadistica) para comprimir un modelo de razonamiento de 1.777.088.000 parametros hasta unos 2,06 bits por peso (0,55 GiB), explorando el limite teorico de la cuantizacion de modelos de test-time compute.

El modelo base es el destilado de DeepSeek-R1 sobre Qwen-1.5B, una arquitectura transformer de 28 capas con atencion agrupada 12:2 (GQA) y FFN con SwiGLU, especializada en generar cadenas de razonamiento largas antes de responder. La relevancia de esta publicacion radica en que el autor reporta un efecto poco habitual: en la variante GTAP v3 Q4_K_M (1,04 GiB) la perplejidad de holdout (4,3641) resulta ligeramente inferior a la del modelo base sin cuantizar en BF16 (4,3724), y ademas duplica la precision en matematicas de olimpiada (40,0% frente a 20,0%). La variante concreta de este repositorio, IQ2_XXS, es la mas agresiva y la que peor rendimiento muestra (perplejidad 9,4779 y GSM8K 40,0%).

Se trata de un artefacto experimental y el propio autor advierte de que esta pendiente de verificacion y validacion empirica adicional. Las evaluaciones publicadas se apoyan en muestras muy reducidas (25 problemas de GSM8K y 10 de olimpiada), por lo que los resultados deben interpretarse como indicativos y no como definitivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA 12:2 y FFN SwiGLU (28 capas), destilado de DeepSeek-R1 |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (los ejemplos de uso emplean `-c 4096`) |
| Tipos de cuantizacion | IQ2_XXS (~2,06 bpw, 0,55 GiB); el repositorio documenta tambien variantes IQ3_XXS, Q4_K_M e IQ2_M del mismo programa |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base; este repo solo GGUF) |

## Arquitectura y entrenamiento

La arquitectura subyacente es el DeepSeek-R1-Distill-Qwen-1.5B original, un transformer decoder-only de 28 capas con atencion de consultas agrupadas en proporcion 12:2, capas feed-forward con activacion SwiGLU y parametros de aproximadamente 1.780 millones. El modelo base fue destilado a partir de las trazas de razonamiento de DeepSeek-R1, lo que le confiere la capacidad de emitir cadenas de pensamiento largas antes de la respuesta final. Este repositorio no reentrena el modelo: aplica sobre los pesos originales una cuantizacion post-entrenamiento con la metodologia GTAP v3, descrita por el autor como un programa de mecanica estadistica orientado a la cuantizacion, con el tag `imatrix` para la calibracion de la matriz de importancia.

El autor no detalla la composicion del dataset de calibracion ni el numero de tokens utilizados para generar la imatrix, por lo que estos datos no estan disponibles. La innovacion declarada se centra en dos efectos medidos sobre las variantes de mayor numero de bits: por un lado, la regularizacion de atractores en IQ3_XXS, que reduce la longitud media de razonamiento en GSM8K de 409,0 a 229,7 tokens manteniendo el 88,0% de acierto, eliminando ramificaciones exploratorias espurias; por otro, la mejora de perplejidad de Q4_K_M por debajo del control BF16. En el caso concreto de IQ2_XXS (2,06 bpw) no se reportan estas ventajas y el rendimiento se degrada de forma marcada, con una longitud media de pensamiento que se dispara hasta 1.250,9 tokens.

## Capacidades

- Generacion de texto conversacional y completado de prompts en formato chat mediante la plantilla nativa de DeepSeek-R1.
- Razonamiento explicito con cadena de pensamiento (chain-of-thought) activada por la etiqueta `<think>` en el prompt.
- Resolucion de problemas matematicos elementales (aritmetica, algebra basica, ecuaciones de segundo grado) mediante CoT nativo.
- Ataque de problemas de competicion tipo olimpiada, con resultados limitados en esta cuantizacion (2/10 en la evaluacion publicada).
- Razonamiento en multiples pasos con test-time compute: el modelo genera secuencias de pensamiento de cientos o miles de tokens antes de cerrar la respuesta.
- Compatibilidad con endpoints (`endpoints_compatible`, tag `conversational`) para su integracion en servicios de inferencia.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de vision o audio: no disponibles.
- Modo de pensamiento: si, mediante decodificacion extendida con la plantilla nativa.

## Casos de uso

- Evaluacion de investigacion sobre cuantizacion extrema: este checkpoint sirve como artefacto de estudio para medir hasta que punto se puede comprimir un modelo de razonamiento de 1.5B sin colapsar la coherencia, comparando la perplejidad de holdout (9,4779) con el control BF16 (4,3724).
- Prototipado en dispositivos de borde y hardware sin GPU: con 0,55 GiB de pesos, el modelo cabe en telefonos, Raspberry Pi de gama alta o mini-PC con CPU moderna, permitiendo experimentar con razonamiento CoT local a bajo coste.
- Filtrado rapido de razonamiento en pipelines por lotes: su velocidad de decodificacion de 326,9 t/s sobre una RTX 4080 Super permite procesar grandes volumenes de prompts en poco tiempo cuando no se exige maxima precision.
- Asistente de matematicas basicas con verificacion humana: puede usarse para generar pasos de resolucion de ecuaciones sencillas, siempre que un revisor o un verificador simbolico valide la respuesta final dado el alto riesgo de error.
- Docencia y demostraciones de chain-of-thought: util para mostrar en clase como un modelo pequeno expone su proceso de razonamiento token a token mediante la plantilla `<think>`.
- Benchmarking comparativo de kernels de cuantizacion: sirve para medir latencia, throughput y uso de memoria de distintas implementaciones GGUF (llama.cpp, Ollama, LM Studio) sobre un mismo modelo base.
- Base para destilacion o fine-tuning ligero: al ser un GGUF muy pequeno, puede emplearse como punto de partida para experimentos de adaptacion en entornos con recursos limitados, aunque la degradacion por cuantizacion aconseja partir del modelo en BF16.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card del autor y comparan distintas variantes de cuantizacion sobre el mismo modelo base. El tamano muestral es reducido (25 problemas de GSM8K y 10 de olimpiada), por lo que la incertidumbre es elevada.

| Variante | Huella | Perplejidad (holdout 131k) | GSM8K (CoT) | Tokens medios de pensamiento (GSM) | Cierre limpio (GSM) | Olimpiada | Velocidad de decodificacion |
|---|---|---|---|---|---|---|---|
| Base BF16 (control) | 3,32 GiB | 4,3724 | 20/25 (80,0%) | 409,0 | 100,0% | 2/10 (20,0%) | 141,8 t/s |
| IQ3_XXS naive | 0,72 GiB | 4,7596 | 24/25 (96,0%) | 308,1 | 100,0% | 3/10 (30,0%) | 317,9 t/s |
| GTAP v3 IQ3_XXS | 0,72 GiB | 4,7160 | 22/25 (88,0%) | 229,7 | 100,0% | 3/10 (30,0%) | 315,0 t/s |
| GTAP v3 Q4_K_M | 1,04 GiB | 4,3641 | 20/25 (80,0%) | 424,1 | 100,0% | 4/10 (40,0%) | 287,3 t/s |
| GTAP v3 IQ2_M | 0,65 GiB | 5,1392 | 19/25 (76,0%) | 238,9 | 96,0% | 0/10 (0,0%) | 304,9 t/s |
| GTAP v3 IQ2_XXS (este repo) | 0,55 GiB | 9,4779 | 10/25 (40,0%) | 1.250,9 | 8,0% | 2/10 (20,0%) | 326,9 t/s |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 0,55 GiB en IQ2_XXS. Con cache KV para 4.096 tokens de contexto el consumo total se mantiene por debajo de 1 GiB en la mayoria de configuraciones.
- GPU validadas por el autor: NVIDIA GeForce RTX 4080 Super con 32 GB de VRAM (testbed de referencia), donde se midieron 326,9 t/s de decodificacion.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 2 GB o mas de VRAM libre (GTX 1650, RTX 3050, RTX 4060, etc.).
- Inferencia en CPU: viable gracias al tamano reducido, aunque la velocidad dependera del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y cualquier runtime compatible con GGUF como Ollama, LM Studio o text-generation-webui. vLLM y TGI no estan documentados para este formato en la informacion disponible.
- Configuracion recomendada por el autor: `-n 1536 -c 4096 --temp 0.6 --top-p 0.95` para llama-cli, y `-ngl 99 -fa on` para llama-server (descarga completa en GPU con flash attention).
- Latencia y throughput: 326,9 t/s de decodificacion en RTX 4080 Super segun el autor, el valor mas alto de todas las variantes evaluadas.

## Comparativa con modelos similares

No se dispone de datos de terceros para establecer una comparativa homogenea, por lo que la comparacion se limita a las variantes del mismo programa de cuantizacion y al control sin cuantizar.

| Modelo | Parametros | Huella | Perplejidad | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B BF16 | 1,78 B | 3,32 GiB | 4,3724 | 80,0% (20/25) | MIT (modelo base) | HuggingFace |
| GTAP v3 IQ3_XXS | 1,78 B | 0,72 GiB | 4,7160 | 88,0% (22/25) | apache-2.0 | HuggingFace |
| GTAP v3 Q4_K_M | 1,78 B | 1,04 GiB | 4,3641 | 80,0% (20/25) | apache-2.0 | HuggingFace |
| GTAP v3 IQ2_XXS (este repo) | 1,78 B | 0,55 GiB | 9,4779 | 40,0% (10/25) | apache-2.0 | HuggingFace |

La variante Q4_K_M resulta la mas equilibrada del conjunto, con perplejidad inferior al control y mejor resultado en olimpiada (40,0%). La IQ2_XXS de este repositorio prioriza el tamano minimo a costa de un deterioro severo de la calidad.

## Limitaciones y advertencias

- Estado experimental: el propio autor indica que el checkpoint esta pendiente de verificacion y validacion empirica adicional; no debe considerarse un modelo listo para produccion.
- Degradacion severa en esta cuantizacion: la perplejidad de holdout (9,4779) mas que duplica la del control BF16 (4,3724) y GSM8K cae del 80,0% al 40,0%. El porcentaje de cierre limpio de razonamiento se desploma al 8,0%.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al derivar de DeepSeek-R1-Distill-Qwen, hereda los sesgos del modelo base, no documentados en este repositorio.
- Riesgo de alucinacion: elevado. La degradacion por cuantizacion extrema y la longitud media de pensamiento de 1.250,9 tokens con bajo porcentaje de cierre limpio sugieren cadenas de razonamiento divagantes y respuestas potencialmente incorrectas.
- Limitaciones de contexto: no se especifica la ventana de contexto en la model card; los ejemplos emplean `-c 4096`, inferior a la del modelo base sin cuantizar.
- Idiomas: no se documenta el soporte multilingue; no hay garantias de calidad fuera del ingles tecnico y matematico empleado en los ejemplos.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo base (DeepSeek-R1-Distill-Qwen-1.5B) y de DeepSeek-R1, ya que pueden imponer condiciones adicionales que prevalezcan sobre la del artefacto derivado.
- Muestra de evaluacion insuficiente: los resultados de GSM8K (25 problemas) y olimpiada (10 problemas) tienen un margen de error amplio y no deberian extrapolarse.
- Divergencia en los metodos de medida: el autor no detalla el procedimiento exacto de calculo de perplejidad ni la composicion del conjunto de holdout de 131.000 tokens, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DuoNeural/DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3-IQ2_XXS-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio de DeepSeek-R1 (referencia del destilado): https://huggingface.co/deepseek-ai/DeepSeek-R1
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- Otros enlaces (papers, blogs, demos, repos del autor): no disponibles en la informacion proporcionada.
