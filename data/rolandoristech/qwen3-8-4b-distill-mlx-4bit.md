# RolanDorisTech/Qwen3.8-4B-Distill-MLX-4bit

## Resumen

Qwen3.8-4B-Distill-MLX-4bit es una compilacion cuantizada en formato MLX nativo del modelo empero-ai/Qwen3.8-4B-Distill, publicada por el usuario RolanDorisTech. El modelo base es una destilacion de parametros completos de Qwen3.8 2.4T A95B (un modelo profesor de 2,4 billones de parametros con 95B activos) hacia la arquitectura densa Qwen3.5-4B; el estudiante se entreno sobre aproximadamente 45.000 trazas de chain-of-thought del profesor, filtradas por calidad y centradas en matematicas, razonamiento general y seguimiento de instrucciones.

El repositorio que nos ocupa no entrena nada: es una cuantizacion mixed-precision de clase 4 bits construida con el metodo oQe (oMLX Universal Dynamic Quantization), que combina asignacion dinamica de bits por capa segun su sensibilidad medida y ponderacion por importancia de activaciones (imatrix). El resultado pesa 2,3 GB, mantiene la ventana de contexto nativa de 262.144 tokens y conserva el template de chat de Qwen3 con etiquetas `<think>`.

Su relevancia es practica: permite ejecutar un modelo de razonamiento con contexto muy largo en Apple Silicon (Mac con memoria unificada) sin depender de GPU NVIDIA ni de servicios en la nube. El repositorio es en realidad un alias de busqueda de RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ4e, que comparte pesos y metodo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.5-4B, segun la model card) |
| Parametros totales | 4B (segun la denominacion del modelo; el repositorio no publica el recuento exacto) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQ4e: mixed-precision de clase 4 bits, ~4 bits por peso de media, no uniforme, con ponderacion por importancia de activaciones (imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (compatible con mlx-lm, oMLX, LM Studio y mlx-swift) |
| Tamano en disco | 2,3 GB |
| Modelo base | empero-ai/Qwen3.8-4B-Distill (relacion: cuantizado) |
| Libreria | mlx |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso que sigue la arquitectura Qwen3.5-4B. Su procedencia es una destilacion de parametros completos: el profesor es Qwen3.8 2.4T A95B, un modelo de 2,4 billones de parametros con 95B activos por token, y el estudiante adopta la arquitectura de 4B. El corpus de destilacion son unas 45.000 trazas de chain-of-thought generadas por el profesor a partir de datasets internos de destilacion de Qwen3.8, con razonamiento denso paso a paso en matematicas, razonamiento general y seguimiento de instrucciones, y con un filtrado de calidad previo al entrenamiento. No se documenta en la informacion disponible si hubo fases adicionales de RLHF o DPO.

La innovacion tecnica de esta publicacion concreta esta en la cuantizacion. En lugar de aplicar un presupuesto de bits plano, oQ ejecuta datos de calibracion a traves del modelo y mide la sensibilidad real de cada capa al error de cuantizacion, asignando mas bits a las capas criticas (lm_head, embeddings de tokens, primer y ultimo bloque) y menos a las tolerantes. La variante oQe anade una pasada de calibracion de importancia de activaciones y usa estadisticas por canal (imatrix) para ponderar el error. La salida es safetensors estandar de MLX, por lo que no requiere un runtime propio: funciona con mlx-lm, oMLX, LM Studio y mlx-swift. El formato de prompt usa el template de chat de Qwen3 con etiquetas `<think>` e incluye `chat_template.jinja`.

## Capacidades

- Generacion de texto y razonamiento paso a paso: hereda el chain-of-thought denso del profesor, invocado mediante las etiquetas `<think>` del template de Qwen3.
- Razonamiento matematico: la destilacion se entreno explicitamente sobre trazas de matematicas.
- Razonamiento general y seguimiento de instrucciones complejas: segunda y tercera areas documentadas del corpus de destilacion.
- Conversaciones multi-turno con contexto muy largo: la ventana nativa de 262.144 tokens permite mantener historiales extensos sin truncado agresivo.
- Ejecucion completamente local en Apple Silicon, sin llamadas a red ni telemetria, con el modelo en memoria unificada.
- Compatibilidad de formato: los pesos cargan en mlx-lm, oMLX, LM Studio y mlx-swift de forma directa.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning como framework: no disponible; el modelo produce trazas de razonamiento, pero no se documenta integracion con herramientas.
- Capacidades multilingues y cobertura de idiomas: no disponible.
- Capacidades de vision o audio: no disponibles; el pipeline declarado es text-generation.

## Casos de uso

- Inferencia local con datos sensibles en Apple Silicon: al ejecutarse integramente en memoria unificada con mlx-lm o LM Studio, permite procesar documentacion confidencial de empresa (informes financieros, expedientes, historiales clinicos anonimizados) sin que el texto salga del equipo.
- Analisis de documentos largos: con 262.144 tokens de contexto nativo, el modelo puede ingerir contratos completos, tesis o bases de codigo de gran tamano en una sola pasada y responder preguntas transversales sobre el conjunto, en lugar de trocear el material en fragmentos independientes.
- Generacion de datos sinteticos de razonamiento: las trazas de chain-of-thought del modelo sirven para construir datasets de destilacion o de ajuste supervisado para modelos mas pequenos, partiendo de problemas de matematicas y logica y capturando el proceso intermedio, no solo la respuesta.
- Optimizacion y reescritura de prompts en local: el modelo puede refactorizar instrucciones ambiguas en system prompts estructurados con definicion de rol, restricciones tecnicas y esquema de salida, como en el motor de optimizacion de prompts publicado por la comunidad sobre la familia Qwen3.8.
- Asistentes conversacionales multi-turno para aplicaciones de escritorio en macOS: empaquetado con mlx-swift dentro de una app nativa, ofrece respuestas con razonamiento a lo largo de sesiones largas sin coste por token ni dependencia de API externa.
- Tutoria y explicacion paso a paso en matematicas: dado un problema, el modelo expone el desarrollo intermedio en las etiquetas `<think>`, lo que permite mostrar al usuario el procedimiento completo y no unicamente el resultado final.
- Evaluacion interna de cuantizaciones: comparar esta build oQ4e de 2,3 GB contra la variante oQ8e de 4,2 GB del mismo autor permite medir en propia instalacion la perdida de calidad frente al ahorro de memoria, con la misma ventana de contexto y el mismo template.
- Prototipado rapido de funcionalidades de IA en Mac: al ser un safetensors compatible con varias herramientas, se puede validar una idea de producto con LM Studio antes de decidir si merece la pena migrar a un despliegue en servidor con otro runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra medicion sobre esta build o sobre el modelo base empero-ai/Qwen3.8-4B-Distill.

La model card si incluye una tabla comparativa, pero corresponde a la metodologia oQ medida sobre otro modelo (Qwen3.5-35B-A3B, MMLU con 300 muestras) y el propio autor advierte que no es una evaluacion de calidad de estas builds oQe. Se reproduce a continuacion unicamente como referencia del metodo:

| Bits | Cuantizacion uniforme (mlx-lm) | oQ |
|---:|---:|---:|
| 2 bits | 14,0 % | 64,0 % |
| 3 bits | 76,3 % | 85,0 % |
| 4 bits | 79,7 % | 83,3 % |

La model card cita ademas dos referencias externas sobre ponderacion por sensibilidad e imatrix: SqueezeLLM (arXiv:2306.07629) reporta perplejidad C4 de 28,26 con RTN uniforme, 18,08 con cuantizacion no uniforme agnostica a la sensibilidad y 7,75 con cuantizacion no uniforme basada en sensibilidad sobre LLaMA-7B; y el observer `imatrix_mse` de LLM Compressor de vLLM reduce la perplejidad en WikiText-2 sobre Llama-3.1-8B (W4A16) de 6,96 a 6,85 y a 6,83 con GPTQ.

## Requisitos de hardware

- Peso en disco y en memoria del modelo: 2,3 GB para los pesos cuantizados, mas overhead del runtime.
- Memoria unificada minima: 8 GB es el suelo practico para prompts cortos; 16 GB o mas es recomendable para aprovechar la ventana de 262.144 tokens, ya que el KV cache crece de forma aproximadamente lineal con el contexto y puede superar con holgura el tamano de los pesos.
- Plataforma: exclusivamente Apple Silicon. El formato MLX no se ejecuta en CUDA, ROCm ni CPU x86 convencional, por lo que no hay ruta de despliegue con GPU NVIDIA A100 o H100 ni con RTX 4090.
- Equipos compatibles: cualquier Mac con chip de la familia M (M1, M2, M3, M4) con memoria unificada suficiente. No cabe en GPU de consumo del ecosistema x86 por incompatibilidad de formato, no por tamano.
- Opciones de despliegue: mlx-lm mediante `mlx_lm.generate`, oMLX, LM Studio y mlx-swift. No aplica vLLM, TGI, llama.cpp ni Ollama, que no consumen safetensors de MLX.
- Rendimiento: no disponible. El repositorio no publica latencia, tokens por segundo ni throughput medido.
- Parametros de muestreo sugeridos por el autor: `--temp 0.6 --top-p 0.95 --top-k 20`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Formato |
|---|---|---|---|---|---|---|
| RolanDorisTech/Qwen3.8-4B-Distill-MLX-4bit (esta ficha, alias de oQ4e) | 4B | 262.144 tokens | oQ4e, ~4 bits no uniforme con imatrix | 2,3 GB | Apache-2.0 | MLX safetensors |
| RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ8e | 4B | 262.144 tokens | oQe de 8 bits | 4,2 GB | Apache-2.0 | MLX safetensors |
| empero-ai/Qwen3.8-4B-Distill | 4B | no disponible | Sin cuantizar | no disponible | no disponible | no disponible |

Las tres entradas comparten la misma arquitectura y el mismo origen de destilacion, por lo que la comparacion relevante es entre niveles de cuantizacion: oQ8e ocupa casi el doble de memoria y, en ausencia de benchmarks publicados de ninguna de las dos builds, la eleccion entre ambas depende de la memoria unificada disponible y de una validacion propia sobre el caso de uso concreto. No se dispone de datos publicados para comparar contra alternativas de otros autores en la misma categoria.

## Limitaciones y advertencias

- Ambiguedad de repositorio: este ID es un alias de busqueda de RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ4e. Conviene fijar el repositorio canonico en scripts y despliegues para evitar confusiones de version.
- Ausencia total de benchmarks: no hay ninguna medicion publicada sobre esta build. Cualquier afirmacion de calidad relativa frente a la cuantizacion uniforme de 4 bits es extrapolacion de un benchmark realizado sobre otro modelo.
- Naturaleza no uniforme de la cuantizacion: oQ4e promedia ~4 bits por peso, pero asigna mas bits a capas sensibles y menos a otras. No es equivalente a Q4_K_M y su comportamiento no se puede inferir de comparativas genericas de cuantizacion de 4 bits.
- Degradacion por cuantizacion: los pesos se han comprimido desde el modelo base sin ajuste posterior documentado. Capas como `lm_head`, embeddings y los bloques inicial y final son las mas sensibles, segun la propia documentacion del metodo.
- Riesgo de alucinacion: es un modelo generativo sin mecanismos de verificacion documentados. El hecho de que emita trazas de razonamiento paso a paso no garantiza que el razonamiento sea correcto.
- Limitaciones de la destilacion: el estudiante se entreno sobre unas 45.000 trazas filtradas, un volumen reducido que puede traducirse en menor cobertura de dominios que el profesor, especialmente fuera de matematicas, razonamiento general y seguimiento de instrucciones.
- Contexto largo no verificado: los 262.144 tokens son la longitud nativa declarada, pero no se publica ninguna evaluacion de recuperacion efectiva en contextos extensos. El rendimiento en recuperacion de informacion puede degradarse en las posiciones intermedias de la ventana.
- Idiomas no documentados: el repositorio no declara idiomas soportados. No hay garantia de calidad en castellano ni de cobertura multilingue.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial, pero el modelo base y la arquitectura subyacente son de terceros y conviene verificar sus terminos por separado, asi como los de las herramientas oMLX utilizadas. La licencia del modelo base empero-ai/Qwen3.8-4B-Distill no aparece en la informacion disponible.
- Dependencia de plataforma: el formato MLX ata el despliegue a Apple Silicon. No existe ruta de produccion documentada en servidores con GPU NVIDIA o AMD.
- Fechas de publicacion: la model card indica creacion el 25 de septiembre de 2026 y cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RolanDorisTech/Qwen3.8-4B-Distill-MLX-4bit
- Repositorio canonico (oQ4e): https://huggingface.co/RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ4e
- Variante de 8 bits (oQ8e): https://huggingface.co/RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ8e
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Documentacion del metodo oQ: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- Canal de YouTube del autor: https://www.youtube.com/@RolanDorisTech
- SqueezeLLM (arXiv:2306.07629): https://arxiv.org/abs/2306.07629
- Observer imatrix de LLM Compressor (vLLM): https://docs.vllm.ai/projects/llm-compressor/en/latest/examples/imatrix/
- Repositorio comunitario de la familia destilada: https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled
- Motor de optimizacion de prompts sobre Qwen3.8 4B: https://github.com/47thtechcorner/RayCodes_Qwen3.8
- Pagina de referencia de Qwen3.8: https://openlm.ai/qwen3.8/
