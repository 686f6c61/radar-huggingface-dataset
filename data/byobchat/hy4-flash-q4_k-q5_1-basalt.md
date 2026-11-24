# byobChat/Hy4-flash-Q4_K-Q5_1-Basalt

## Resumen

Hy4-flash Q4_K / Q5_1 para Basalt es una cuantizacion del modelo multimodal `tencent/Hy4-flash`, publicada por el usuario byobChat. No se trata de un modelo nuevo, sino de un empaquetado de pesos cuantizados (expertos enrutados en Q4_K y Q5_1, tensores densos en Q8_0) destinado al motor de inferencia Basalt, desarrollado por jesdga95. El paquete reutiliza integramente el pack de jesdga (cabeza de salida, tabla Engram, codificador de vision, drafter DFly2 y tokenizador) y solo sustituye los expertos enrutados por una cuantizacion propia.

El modelo base es un MoE (mezcla de expertos) con capacidad image-text-to-text, es decir, acepta imagenes y texto como entrada. La ficha del autor no desglosa el numero de parametros totales ni activos, ni la longitud de contexto nativa; solo se documenta el uso practico con prompts de hasta 16K tokens en las pruebas realizadas. La relevancia de esta publicacion es acotada: sirve para ejecutar Hy4-flash en hardware Blackwell (RTX PRO 6000) mediante Basalt con un equilibrio medido entre calidad (KLD 0.168, Top-1 87.31%) y velocidad.

La licencia es la Tencent Hy License 1.0, basada en Apache 2.0 con terminos comerciales adicionales en la seccion 10. El autor advierte explicitamente de que no es una release oficial de Tencent y de que no se han probado contextos largos ni GPUs distintas de la RTX PRO 6000 Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con vision encoder, segun tags del autor; detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (probado hasta 16K de prompt) |
| Tipos de cuantizacion | Expertos enrutados: gate/up Q4_K, down Q5_1 (capas 13-35) y Q4_K (capas 1-12 y 36-41); tensores densos Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License 1.0 (basada en Apache 2.0 con terminos comerciales en seccion 10) |
| Formato de pesos | `.basalt` (formato propio del motor Basalt) |
| Tamano del fichero | 164.0 GB |
| Modelo base | tencent/Hy4-flash |
| Motor de inferencia | Basalt (probado en 0.5.6, commit 9e184fd88) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un MoE con modulo de vision (pipeline `image-text-to-text`) y un drafter de decodificacion especulativa denominado DFly2. El paquete incluye tambien una "Engram table" y una cabeza de salida, componentes que el autor copia sin modificar del pack de jesdga. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

En cuanto al proceso de cuantizacion, el autor emplea una imatrix propia con 98.000 tokens de calibracion para los tensores gate/up en Q4_K, y la imatrix de AtomicChat para los tensores down en Q4_K y Q5_1. La eleccion de Q5_1 en las capas 13-35 frente a Q4_K en el resto sugiere un reparto por sensibilidad de capas, aunque el autor no lo justifica explicitamente. La decodificacion especulativa DFly2 esta activada en todas las mediciones de velocidad.

## Capacidades

- Generacion de texto y comprension de imagenes (pipeline image-text-to-text): el autor verifico con `--vision dynamic` la lectura de formas, texto en imagenes, tablas, graficos de barras y senales en ruido.
- Procesamiento de prompts multi-imagen: se probo un prompt con dos imagenes.
- Razonamiento y generacion de prosa y codigo estructurado: las mediciones de velocidad incluyen modos "chat", "structured" y "prose".
- Decodificacion especulativa integrada mediante el drafter DFly2.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia multimodal en estaciones de trabajo con Blackwell: el paquete esta pensado para ejecutarse en una RTX PRO 6000 con Basalt, leyendo imagenes y texto en un unico flujo; adecuado para prototipos de analisis documental con tablas y graficos, segun la prueba de vision del autor.
- Analisis de documentos con tablas y graficos: la prueba de vision verifico la lectura de una tabla y un grafico de barras sinteticos, por lo que el modelo puede emplearse para extraer contenido estructurado de capturas o escaneos en un pipeline local.
- Generacion de codigo estructurado: el modo "structured" alcanza 258 tokens/s en la RTX PRO 6000, lo que lo hace util para tareas de generacion con formato controlado (JSON, plantillas) en entornos de desarrollo locales.
- Redaccion asistida de prosa: el modo "prose" rinde 132 tokens/s, suficiente para generacion de texto largo interactivo en una sola GPU de gama profesional.
- Evaluacion comparativa de cuantizaciones: el pack incluye metricas KLD y Top-1 frente a alternativas (NVFP4 GPTQ propia y NVFP4 de jesdga), por lo que sirve como referencia para decidir que cuantizacion desplegar en Basalt.
- Despliegue local de un MoE multimodal sin dependencia de la nube: al ser un fichero unico de 164 GB ejecutable con `basalt serve`, encaja en entornos con requisitos de privacidad que dispongan de GPUs Blackwell de 96 GB.

## Benchmarks y rendimiento

Calidad medida con `basalt-bench --quality 100` sobre wikitext-2, dos RTX PRO 6000, contra la referencia `hy4flash-bf16-base.kld`:

| Pack | KLD | Top-1 |
|---|---|---|
| byobChat Q4_K / Q5_1 | 0.168 | 87.31% |
| byobChat NVFP4 GPTQ | 0.196 | 86.51% |
| jesdga NVFP4 | 0.207 | 86.17% |

Comparacion pareada contra el pack de jesdga: Q4_K / Q5_1 mejora en -0.040 +- 0.004 de KLD; NVFP4 GPTQ en -0.012 +- 0.005 (error estandar por chunk). El autor advierte de que estas cifras no son comparables con las de sus tarjetas GGUF, que usan otros textos.

Velocidad en una RTX PRO 6000 Blackwell, tokens/s, una ejecucion por configuracion, con drafting DFly2 activado:

| Pack | Prompt 16K | chat | structured | prose |
|---|---|---|---|---|
| byobChat Q4_K / Q5_1 | 2.945 | 160 | 258 | 132 |
| byobChat NVFP4 GPTQ | 3.519 | 163 | 268 | 137 |
| jesdga NVFP4 | 3.552 | 158 | 272 | 136 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 164,0 GB, por lo que la inferencia requiere al menos esa capacidad mas el overhead del motor; encaja en GPUs de 96 GB en configuracion multi-GPU o en una unica GPU de mayor capacidad, aunque el autor no detalla el reparto exacto.
- GPU probada: una RTX PRO 6000 Blackwell (96 GB) para velocidad y dos para la medicion de calidad.
- GPUs no probadas: el autor indica explicitamente que no ha probado GPUs distintas de la RTX PRO 6000 Blackwell.
- Cabe en GPU de consumo: no, el tamano de 164 GB excede la VRAM de cualquier GPU consumer actual (RTX 4090, 5090).
- Opciones de despliegue: exclusivamente Basalt (`bin/basalt serve`), version 0.5.6, commit 9e184fd88. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2.945 tokens/s de prefill con prompt de 16K, 160 tokens/s en chat, 258 en structured y 132 en prose sobre una RTX PRO 6000 Blackwell.
- Contexto probado: hasta 16K de prompt; contextos superiores no verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KLD / Top-1) | Velocidad chat | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| byobChat Q4_K / Q5_1 (este) | no disponible (MoE) | no disponible (probado 16K) | 0.168 / 87,31% | 160 tok/s | Tencent Hy License 1.0 | Hugging Face, formato .basalt |
| byobChat NVFP4 GPTQ | no disponible (MoE) | no disponible | 0.196 / 86,51% | 163 tok/s | Tencent Hy License 1.0 | Hugging Face, formato .basalt |
| jesdga NVFP4 | no disponible (MoE) | no disponible | 0.207 / 86,17% | 158 tok/s | Tencent Hy License 1.0 | Hugging Face, formato .basalt |
| tencent/Hy4-flash (bf16) | no disponible (MoE) | no disponible | referencia | no disponible | Tencent Hy License 1.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base documentadas por el autor; no se dispone de datos de modelos alternativos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- No es una release oficial de Tencent: es un derivado cuantizado y reempaquetado de `tencent/Hy4-flash`, sin aval del autor original.
- Solo funciona con el motor Basalt; no hay conversion documentada a GGUF, safetensors ni otros formatos.
- El autor no ha probado contextos superiores a 16K de prompt, por lo que el comportamiento en ventanas largas es desconocido.
- No se ha probado en GPUs distintas de la RTX PRO 6000 Blackwell; el rendimiento en otras arquitecturas es incierto.
- La licencia Tencent Hy License 1.0 incluye terminos comerciales adicionales en la seccion 10 que deben revisarse antes de un uso comercial.
- No hay informacion sobre sesgos, tasas de alucinacion ni cobertura idiomatica del modelo base.
- El paquete depende de componentes de terceros (pack de jesdga, imatrix de AtomicChat) cuya estabilidad futura no esta garantizada.
- El fichero de 164 GB implica requisitos de almacenamiento y transferencia elevados; la descarga se realiza via `hf download`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byobChat/Hy4-flash-Q4_K-Q5_1-Basalt
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Pack de referencia de jesdga: https://huggingface.co/jesdga/Hy4-flash-Basalt
- Motor Basalt: https://github.com/jesdga95/basalt
- Licencia (Tencent Hy License 1.0): incluida en el repositorio como `LICENSE`
