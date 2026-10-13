# scottlowry/Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp

## Resumen

Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp es una cuantizacion del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario scottlowry en Hugging Face. No es un modelo entrenado desde cero, sino un checkpoint cuantizado en precision mixta de 3 bits con la herramienta oQ (oMLX v0.7.1.dev1), pensado para ejecutarse en el stack MLX de Apple Silicon. El repositorio ocupa 90,7 GB y declara 179.999.981.459 parametros en los ficheros safetensors.

El modelo base, desarrollado por el equipo Qwen (Alibaba), es una preview de pesos abiertos de la arquitectura Qwen4, publicada el 26 de agosto de 2026. Combina una pila hibrida de Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA), con expertos enrutados (MoE), residuales con compuertas y una gran tabla de embeddings de n-gramas. Segun las fuentes consultadas, son unos 176.000 millones de parametros totales (125.000 millones en el modelo principal mas 51.000 millones en la tabla de embeddings de n-gramas) con 6.000 millones de parametros activos por token.

Su relevancia es practica: permite acercar un modelo multimodal de gran tamano a hardware de Apple Silicon con memoria unificada, a costa de una perdida de precision que aun no ha sido documentada con benchmarks por parte del autor. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, y la model card es minima (solo detalles de cuantizacion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida GDN (Gated DeltaNet) + QSA (Qwen Sparse Attention) con expertos enrutados (MoE), residuales con compuertas y tabla de embeddings de n-gramas; tipo de modelo declarado como qwen4_exp |
| Parametros totales | 179.999.981.459 (segun safetensors del repo cuantizado); el modelo base se describe con 176.000 millones en fuentes web |
| Parametros activos | 6.000 millones (dato del modelo base; no confirmado en la model card del repo cuantizado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits en precision mixta (oQ), group size 64, con componentes en fp16 (sufijo mtp del nombre; la model card no detalla que pesos se mantienen en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen3.8-Flash-Next, no al repositorio cuantizado. Segun la documentacion del equipo Qwen y las fuentes de analisis consultadas, se trata de una pila hibrida que mezcla mezclado de tokens recurrente (Gated DeltaNet) con atencion selectiva y dispersa (Qwen Sparse Attention), cuatro ramas residuales con compuertas, expertos enrutados al estilo MoE y una tabla de busqueda de n-gramas de gran tamano. El objetivo declarado de esta combinacion es mejorar la capacidad del modelo al tiempo que se optimizan el coste computacional, la estabilidad de entrenamiento y el uso de memoria. El modelo base es multimodal y de pesos abiertos.

Sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no se dispone de informacion en los materiales proporcionados. El repositorio que nos ocupa no anade entrenamiento alguno: aplica cuantizacion de precision mixta en 3 bits con oQ (oMLX v0.7.1.dev1) sobre el checkpoint original, con group size 64 y salida en safetensors de MLX. El sufijo "mtp" del nombre sugiere la preservacion en fp16 de algun componente concreto (posiblemente multi-token prediction), pero la model card no lo documenta, por lo que no se puede confirmar.

## Capacidades

Las capacidades que se listan a continuacion derivan del modelo base Qwen3.8-Flash-Next; el repositorio cuantizado no aporta una evaluacion propia, por lo que la cuantizacion en 3 bits puede degradarlas.

- Generacion de texto y razonamiento general, heredados de la arquitectura Qwen4.
- Capacidad multimodal segun las fuentes consultadas sobre el modelo base.
- Procesamiento de contexto largo mediante atencion dispersa (QSA) y mezclado recurrente (GDN), aunque la longitud de contexto concreta no esta publicada en la informacion disponible.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se detallan idiomas soportados.
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Memoria de n-gramas: la tabla de embeddings de n-gramas del modelo base actua como componente de recuperacion asociativa de secuencias frecuentes.

## Casos de uso

Los escenarios siguientes son aplicables siempre que la degradacion por cuantizacion en 3 bits sea aceptable para la tarea. Al no existir evaluaciones publicadas del checkpoint cuantizado, conviene validar cada caso antes de llevarlo a produccion.

- Inferencia local en Apple Silicon: ejecutar un modelo de ~180.000 millones de parametros en un Mac con memoria unificada suficiente (96-128 GB o mas), usando MLX en lugar de CUDA. Es el caso de uso principal de este repositorio, ya que el formato MLX safetensors esta disenado para ese hardware.
- Prototipado e investigacion sin GPU dedicada: investigadores que quieran explorar el comportamiento de la arquitectura Qwen4 (GDN + QSA + MoE) en un equipo de sobremesa Apple, aceptando menor precision a cambio de no depender de clústeres de GPU.
- Evaluacion comparativa de cuantizaciones: usar este checkpoint junto a las variantes oQ5e y oQ8e del mismo autor para medir la perdida de calidad a distintos niveles de bits sobre tareas propias.
- Procesamiento de documentos largos: si la ventana de contexto del modelo base se conserva, la combinacion de atencion dispersa y memoria de n-gramas resulta adecuada para resumir o extraer informacion de documentos extensos. Requiere verificar la longitud efectiva de contexto, no publicada.
- Generacion asistida en local con privacidad de datos: al ejecutarse en el propio equipo, los prompts no salen del dispositivo, lo que encaja en entornos con requisitos de confidencialidad.
- Ajuste fino ligero o experimentacion con adaptadores: el formato MLX permite cargar el modelo y aplicar tecnicas de adaptacion sobre el checkpoint cuantizado, si el soporte de oMLX/mlx-lm lo permite (no confirmado en la informacion disponible).
- Tareas multimodales: al ser multimodal el modelo base, podria emplearse para descripcion de imagenes o comprension visual, siempre que el runtime MLX soporte las entradas multimodales (no confirmado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio cuantizado ni las fuentes web consultadas incluyen cifras de MMLU, HumanEval, GSM8K u otras evaluaciones, ni para el checkpoint cuantizado ni, en los materiales proporcionados, para el modelo base.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 90,7 GB en disco. En memoria unificada de Apple Silicon se necesita un equipo con al menos 96 GB, y preferiblemente 128 GB o mas, para dejar margen a la cache KV y a las activaciones.
- GPU recomendadas: no aplica de forma directa, ya que el formato es MLX y esta orientado a Apple Silicon (series M Max y Ultra). Para CUDA seria necesario reconvertir o buscar checkpoints equivalentes en otros formatos, no disponibles en este repositorio.
- Cabe en consumer GPU: no en GPUs de consumo convencionales (RTX 4090 con 24 GB, por ejemplo). Si cabe en equipos Apple de gama alta con memoria unificada amplia (Mac Studio con M2 Ultra, M3 Ultra o M4 Max de 128 GB y configuraciones superiores).
- Opciones de despliegue: MLX y mlx-lm (incluido mlx_lm.server para API local), la propia herramienta oMLX empleada en la cuantizacion. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no soportan de forma nativa pesos MLX safetensors.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| scottlowry/Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp (este) | 179.999.981.459 | 6.000 millones (base) | no disponible | 3 bits, group size 64, MLX | no disponible | MLX safetensors |
| scottlowry/Qwen3.8-Flash-Next-oQ5e-fp16-mtp | no disponible | no disponible | no disponible | oQ (nivel de bits no confirmado) | no disponible | MLX safetensors |
| scottlowry/Qwen3.8-Flash-Next-oQ8e-mtp | no disponible | no disponible | no disponible | oQ (nivel de bits no confirmado) | no disponible | MLX safetensors |
| Qwen/Qwen3.8-Flash-Next (modelo base) | 176.000 millones (125.000 + 51.000 de embeddings de n-gramas) | 6.000 millones | no disponible | sin cuantizar (precision original) | no disponible | pesos originales |

Los tres repositorios de scottlowry comparten el mismo modelo base y se diferencian por el nivel de cuantizacion oQ, de modo que el presente checkpoint seria el mas agresivo en compresion (3 bits) y, en principio, el mas ligero y el mas propenso a perdida de calidad. No se dispone de datos comparativos de rendimiento entre ellos.

## Limitaciones y advertencias

- Cuantizacion agresiva: 3 bits con precision mixta puede degradar de forma apreciable la calidad en tareas de razonamiento, matematicas y generacion de codigo. No hay evaluacion publicada que cuantifique esa perdida.
- Ausencia de benchmarks: el autor no publica metricas de ningun tipo, por lo que no es posible estimar el impacto real de la cuantizacion sin evaluarlo uno mismo.
- Model card minima: solo se documentan tipo de modelo, bits, group size y formato. Se desconoce que pesos se mantienen en fp16 pese al sufijo "mtp" del nombre.
- Licencia no declarada: al no figurar licencia en el repositorio ni en la informacion disponible, no se puede confirmar si se permite uso comercial. Hay que consultar la licencia del modelo base Qwen/Qwen3.8-Flash-Next antes de cualquier despliegue en produccion.
- Idiomas no documentados: no se especifica cobertura linguistica, por lo que no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Longitud de contexto desconocida: la ventana efectiva no esta publicada, lo que impide planificar casos de uso que dependan de contexto largo.
- Sesgos: no se ha publicado informacion sobre sesgos del modelo base ni del checkpoint cuantizado. Procede asumir los sesgos habituales de los modelos entrenados con datos web a gran escala.
- Riesgo de alucinacion: inherente a los modelos generativos de esta familia y potencialmente mayor tras la cuantizacion en 3 bits.
- Restricciones de plataforma: los pesos estan en formato MLX safetensors, lo que limita su uso a Apple Silicon a traves de mlx-lm u oMLX. No se pueden cargar directamente en vLLM, llama.cpp, Ollama o TGI.
- Repositorio sin traccion: cero descargas y cero valoraciones, sin comunidad que haya validado el checkpoint. Conviene tratarlo como material experimental, no como un artefacto listo para produccion.
- Sin garantia de mantenimiento: al ser una publicacion de un usuario individual, no hay compromiso de actualizaciones ni de soporte.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/scottlowry/Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Analisis de arquitectura, evals e inferencia (SemiAnalysis InferenceX): https://inferencex.semianalysis.com/model/qwen-3-8-flash-next
- Guia tecnica sobre GDN, atencion y memoria de n-gramas: https://flozi.net/en/guides/ai/qwen38-flash-next-architecture
- Variante oQ5e del mismo autor: https://huggingface.co/scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ5e-fp16-mtp
- Variante oQ8e del mismo autor: https://huggingface.co/scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ8e-mtp
