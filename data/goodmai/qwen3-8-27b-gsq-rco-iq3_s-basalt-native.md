# goodmai/Qwen3.8-27B-GSQ-RCO-IQ3_S-Basalt-Native

## Resumen

Qwen3.8-27B-GSQ-RCO-IQ3_S-Basalt-Native es una conversión del modelo Qwen/Qwen3.8-27B a formato nativo de shards `.safetensors` para ejecución en Metal (Apple Silicon), realizada por el usuario goodmai mediante la herramienta Basalt con el comando `basalt models convert --grid native`. El punto de partida es un fichero GGUF cuantizado a `IQ3_S` con esquema `GSQ-RCO` (cuantización no uniforme por super-bloques), y la conversión preserva esos super-bloques exactos, evitando una recuantización y permitiendo que los kernels `GGUFLinear` / `IQMetalKernels` operen directamente sobre los pesos.

El modelo base, Qwen3.8-27B, pertenece a la familia Qwen3.5 según los tags de Hugging Face, con licencia Apache 2.0 y arquitectura transformer. El repositorio derivado declara 11.729.317.376 parámetros reales en safetensors y un tamaño de 11,8 GB, lo que corresponde al peso cuantizado a ~3 bits y no al modelo original sin cuantizar.

La relevancia de esta ficha es doble: por un lado, documenta una ruta de despliegue concreta para ejecutar un modelo de gran tamaño en hardware de consumo Apple (M4 Pro con 24 GB); por otro, sirve de ejemplo de la cadena de herramientas GGUF → safetensors nativo con kernels Metal, una vía poco habitual frente a las soluciones estándar de llama.cpp o MLX puro. El autor reporta métricas medidas en su propio equipo, que se recogen más abajo sin extrapolación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tags); kernels Metal `GGUFLinear` / `IQMetalKernels` para ejecucion |
| Parametros totales | 11.729.317.376 (pesos cuantizados en safetensors); el modelo base se denomina Qwen3.8-27B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S con esquema GSQ-RCO (super-bloques no uniformes, ~3 bits); el repo se etiqueta como 8-bit en Hugging Face, dato no coherente con el nombre y el tamano |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards), nativo para Metal; origen GGUF IQ3_S |
| Libreria | mlx |
| Tamano del repo | 11,8 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Herramienta de conversion | Basalt (`basalt models convert --grid native`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 (tag `qwen3_5`), del que no se dispone en la informacion proporcionada de detalles sobre numero de capas, dimension oculta, mecanismo de atencion ni composicion del dataset de entrenamiento. Tampoco se documenta si hubo fases de RLHF, DPO u otro ajuste por preferencias. Todo ello debe consultarse en la model card del modelo original Qwen/Qwen3.8-27B.

La innovacion tecnica de este repositorio no esta en el entrenamiento sino en el pipeline de cuantizacion y ejecucion. El autor parte de un GGUF cuantizado a IQ3_S con esquema GSQ-RCO, un formato de cuantizacion no uniforme organizado en super-bloques, y lo convierte a shards safetensors conservando exactamente esos super-bloques. El objetivo es evitar la recuantizacion (zero-requantization) y ejecutar los pesos directamente sobre Metal mediante kernels especificos (`GGUFLinear` / `IQMetalKernels`), lo que reduce perdida de calidad y simplifica el despliegue en Apple Silicon. La libreria declarada es MLX, lo que encaja con la orientacion a hardware Apple.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, sin que la informacion disponible detalle capacidades especificas adicionales.
- Toma de decisiones estructuradas: el autor reporta una evaluacion propia denominada "System One Structured Decisions" con 300/300 aciertos, lo que sugiere buen comportamiento en tareas de decision con formato controlado.
- Capacidades de codigo, matematicas y vision: no disponibles en la informacion proporcionada para este derivado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; la metrica de decisiones estructuradas es el unico indicio.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponible.
- Ejecucion en Apple Silicon: capacidad diferencial del formato, con kernels Metal nativos para los super-bloques IQ3_S.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo esta pensado para ejecutarse en un Mac con GPU integrada mediante MLX y kernels Metal, con un footprint medido de 11,76 GB en un M4 Pro de 24 GB. Es adecuado para entornos de desarrollo sin GPU dedicada.
- Prototipado de asistentes con decisiones estructuradas: la metrica de 300/300 en decisiones estructuradas sugiere su uso en flujos donde la salida debe ajustarse a un esquema fijo (clasificacion, enrutado, extraccion de campos), aunque conviene validar con datos propios.
- Evaluacion de pipelines de cuantizacion: sirve como referencia para comparar IQ3_S/GSQ-RCO frente a cuantizaciones afines (4-bit GPTQ, 3-bit affine RTN) usando la perplejidad a 16k reportada por el autor.
- Despliegue de bajo consumo en portatiles: con 11,8 GB de repo y ejecucion Metal, encaja en estaciones de trabajo Apple de gama alta para tareas de generacion de texto sin conexion.
- Laboratorio de investigacion sobre formatos GGUF y safetensors: util para estudiar la conversion sin recuantizacion y el comportamiento de los kernels `GGUFLinear` en Metal.
- Base para fine-tuning o experimentacion sobre el modelo Qwen3.8-27B: al estar bajo Apache 2.0, puede servir de punto de partida, aunque la cuantizacion a ~3 bits limita su uso como base de entrenamiento.

## Benchmarks y rendimiento

Datos medidos por el autor en un Apple M4 Pro con 24 GB de memoria:

| Metrica | Resultado | Referencia |
|---|---|---|
| Footprint en disco | 11,76 GB (3 shards safetensors) | no disponible |
| Perplejidad a 16k (`pplMean16k`) | 4,169 | 4,130 en teacher 4-bit GPTQ (+0,9 % de delta); 4,702 en 3-bit affine RTN |
| System One Structured Decisions | 300/300 (100,0 %) | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para este derivado.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 11,76 GB de pesos medidos; se recomienda al menos 16 GB de memoria unificada y, para margen de contexto, 24 GB o mas.
- Hardware de referencia del autor: Apple M4 Pro con 24 GB, donde se midieron las metricas anteriores.
- GPUs NVIDIA: no se documenta soporte; el formato y los kernels estan orientados a Metal. No hay datos de ejecucion en A100, H100 o RTX 4090.
- GPU de consumo: encaja en equipos Apple Silicon de gama alta (M-series con 24 GB o mas); no se dispone de datos para GPUs de consumo NVIDIA.
- Opciones de despliegue: MLX con kernels Metal (`GGUFLinear` / `IQMetalKernels`) segun la model card; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este formato concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-GSQ-RCO-IQ3_S-Basalt-Native (este) | 11,73 B en safetensors (base denominado 27B) | no disponible | IQ3_S / GSQ-RCO, ~3 bits | Apache 2.0 | Formato nativo Metal, 11,76 GB, ppl16k 4,169 |
| Teacher 4-bit GPTQ (referencia del autor) | no disponible | no disponible | 4-bit GPTQ | no disponible | ppl16k 4,130 |
| 3-bit affine RTN (referencia del autor) | no disponible | no disponible | 3-bit affine RTN | no disponible | ppl16k 4,702 |
| Qwen/Qwen3.8-27B (modelo base) | no disponible | no disponible | pesos originales | Apache 2.0 | Referencia de calidad sin cuantizar; datos no disponibles en esta ficha |

Las dos primeras alternativas son referencias de cuantizacion citadas por el autor, no modelos independientes con ficha propia. No se dispone de comparativas con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a ~3 bits (IQ3_S) introduce una perdida de calidad medible: el autor reporta una perplejidad un 0,9 % superior al teacher 4-bit GPTQ, aunque mejor que 3-bit affine RTN.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de las metricas del autor.
- Existe una incoherencia entre la etiqueta `8-bit` de Hugging Face y el nombre/tamano del modelo, que corresponden a ~3 bits. Conviene verificar el formato antes de desplegar.
- El soporte esta limitado a Metal/Apple Silicon; no se documenta compatibilidad con CUDA, ROCm ni con runtimes estandar como llama.cpp o vLLM.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni longitud de contexto; deben consultarse en la model card del modelo base.
- El numero de parametros reportado en safetensors (11,73 B) no coincide con la denominacion "27B" del modelo base, lo que sugiere que el conteo corresponde a pesos cuantizados o a un subconjunto; no se aclara en la informacion disponible.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones del modelo base y de la herramienta Basalt.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goodmai/Qwen3.8-27B-GSQ-RCO-IQ3_S-Basalt-Native
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta Basalt: no disponible (no se proporciona URL en la informacion)
- Paper, blog o demo: no disponibles en la informacion proporcionada
