# NovaeonStudio/Qwen3.8-Flash-Next-GSQ-RCO-Q2-mlx

## Resumen

NovaeonStudio/Qwen3.8-Flash-Next-GSQ-RCO-Q2-mlx es una reempaquetado en formato MLX del modelo Qwen3.8-Flash-Next, un transformer MoE de Qwen con 125.000 millones de parametros (unos 6.000 millones activos por token, 512 expertos enrutados y 10 activos por token), mas una tabla de embeddings n-gram de 51.000 millones de parametros (PLE) y una cabeza MTP de 4.000 millones. El checkpoint completo suma 179.999.981.459 parametros segun safetensors y ocupa 75,6 GB de repositorio. La aportacion del autor no es un entrenamiento nuevo, sino una conversion: toma los expertos GSQ-RCO `Q2_0` de ISTA-DASLab desde GGUF y los recodifica bit a bit al formato affine 2-bit nativo de MLX (grupo 64), sin perder los codigos cuantizados.

El problema que resuelve es concreto: MLX no puede ejecutar los formatos GGUF con lookup table (`IQ2_XS`, `IQ3_XXS`, `IQ3_S`), y convertirlos implicaria descomprimir y recuantizar, destruyendo precisamente lo que el optimizador GSQ habia aprendido. `Q2_0` es la excepcion estructural: sus bloques de 64 pesos con escala fp16 equivalen a `scale = d`, `bias = -d` en affine 2-bit de MLX, de modo que los bits empaquetados se copian literalmente.

El resultado se ejecuta en un solo Mac con Apple Silicon y ~39-41 GB de memoria residente, manteniendo los 32 GB de la tabla n-gram mapeados en SSD. Esta pensado para quien quiera razonamiento de nivel frontera en hardware de sobremesa de Apple sin depender de la nube, a costa de una calidad de cuantizacion muy agresiva (2,40 bpw en los expertos) y de un ecosistema de ejecucion limitado a oMLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con atencion hibrida GDN + QSA (Qwen3.8-Flash-Next), capa de embeddings n-gram (PLE) y cabeza MTP para decodificacion especulativa |
| Parametros totales | 179.999.981.459 (~180 B) segun safetensors; desglose declarado por el autor: 125 B del MoE + 51 B de tabla n-gram PLE + 4 B de cabeza MTP |
| Parametros activos | ~6 B por token |
| Expertos enrutados | 512 enrutados, 10 activos por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta (MLX affine): expertos enrutados 2 bits/grupo 64; proyecciones hyper-connection 8 bits/g64; tabla n-gram 4 bits/g32; cabeza MTP con expertos 4 bits/g64 y lineales 8 bits/g64; router y gates 8 bits |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (campo `license: other`) |
| Formato de pesos | safetensors (MLX); el modelo base upstream existe tambien en GGUF |
| Tamano del repositorio | 75,6 GB (expertos 37,8 GB; tabla n-gram 32,0 GB; resto 4,3 GB; MTP 1,5 GB) |
| Libreria | mlx |
| Runtime validado | oMLX 0.7.0 (mlx 0.32.2, mlx-vlm 0.7.1) sobre MacBook Pro M5 Max de 128 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-Flash-Next, que el repositorio oficial de Qwen describe como una revision sistematica en cuatro ejes (atencion, residual, embedding y optimizacion) con una atencion hibrida GDN + QSA. Sobre esa base, el modelo combina un MoE de 512 expertos enrutados (10 por token, ~6 B activos) con una tabla de embeddings n-gram de 51 B parametros (PLE) y una cabeza MTP que habilita decodificacion especulativa Lightning MTP. El checkpoint tambien incorpora torre de vision y esta etiquetado como `image-text-to-text`.

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos no estan disponibles en la informacion consultada. Lo que si esta documentado es el proceso de cuantizacion: GSQ-RCO, el metodo de ISTA-DASLab, aprende las escalas por grupo y las asignaciones de rejilla mediante una relajacion Gumbel-Softmax, mientras que RCO elige un tipo de cuantizacion por tensor bajo una restriccion de tamano. El autor de este checkpoint solo modifica el contenedor: los 144 tensores de expertos enrutados se copian como `Q2_0` a affine 2-bit de MLX (la unica diferencia es que la escala de bloque fp16 pasa a bf16, con una desviacion relativa maxima de ~0,2 %), las proyecciones hyper-connection se recuantizan de BF16 a 8 bits/g64 desde la version de mlx-community, y el resto de modulos (atencion, atencion lineal, expertos compartidos, router, torre de vision, tabla n-gram a 4 bits/g32) se heredan de mlx-community/Qwen3.8-Flash-Next-4bit. El autor declara haber verificado tensor a tensor contra la `dequantize_row_q2_0` de referencia de llama.cpp.

## Capacidades

- Generacion de texto y dialogo conversacional multi-turno.
- Razonamiento con modo pensamiento explicito, activable mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Procesamiento de imagen y texto en la misma peticion: la pipeline declarada es `image-text-to-text` y el checkpoint incluye torre de vision.
- Razonamiento matematico y cientifico de alta exigencia segun los datos del build original (96,67 en AIME25 y 89,39 en GPQA-Diamond a 2,40 bpw).
- Decodificacion especulativa mediante la cabeza MTP original, activable con `mtp_enabled: true`; el autor indica que la profundidad adaptativa por defecto fue la configuracion mas rapida medida.
- Cuantizacion de cache KV configurable (`turboquant_kv_enabled`, `turboquant_kv_bits: 8.0`).
- Servicio mediante API compatible con OpenAI (`http://127.0.0.1:8000/v1`) a traves de oMLX.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso con herramientas externas: no documentado.
- Cobertura multilingue: no disponible.

## Casos de uso

- Asistente personal multimodal sin conexion: al aceptar entrada de imagen y texto en la misma conversacion, permite describir capturas, diagramas o fotos de documentos y continuar el dialogo, todo en local sobre un Mac con 128 GB, sin enviar datos a terceros.
- Revision matematica y cientifica asistida: con 96,67 en AIME25 y 89,39 en GPQA-Diamond en el build de origen, es adecuado para verificar derivaciones, resolver problemas de nivel olimpiada y contrastar razonamientos tecnicos activando el modo pensamiento.
- Analisis de documentacion tecnica escaneada: la torre de vision permite pasar paginas renderizadas de manuales, planos o papers y obtener resumenes y extraccion de datos estructurados sin pipeline OCR externo.
- Generacion y revision de codigo en local: util para autocompletado, refactorizacion y explicacion de fragmentos en entornos con requisitos de confidencialidad, teniendo en cuenta que el function calling no esta documentado en este checkpoint.
- Razonamiento en cadena de varios pasos con presupuesto de latencia ajustado: la cabeza MTP y la decodificacion especulativa reducen el coste por token en cadenas largas de reflexion, lo que favorece tareas de analisis iterativo.
- Procesamiento por lotes de correo y tickets: clasificacion, resumen y redaccion de respuestas sobre volumenes moderados de texto en un unico equipo, con la tabla n-gram en SSD para liberar memoria.
- Experimento de investigacion sobre cuantizacion extrema: el repositorio incluye el directorio `conversion/` con los scripts reproducibles, lo que permite auditar la equivalencia bit a bit entre `Q2_0` de GGUF y affine 2-bit de MLX y medir el impacto real de 2,40 bpw sobre tareas concretas.
- Docencia y divulgacion tecnica: explicacion de conceptos con modo pensamiento activado, manteniendo el material didactico dentro de la maquina del profesor.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| AIME25 | 96,67 | Reportado por ISTA-DASLab para el build GSQ-RCO `Q2_0` a 2,40 bpw, del que este checkpoint copia los expertos sin perdida |
| GPQA-Diamond | 89,39 | Idem |
| Throughput de prompt | 3,4x frente a los builds IQ con lookup table | Idem |

No se han publicado resultados de benchmarks especificos de este checkpoint MLX en la informacion disponible. Las cifras anteriores corresponden al build GGUF de origen y el autor afirma que los codigos cuantizados son identicos, con la unica salvedad del cambio de escala a bf16. La tabla de rendimiento del autor (RAM residente, tok/s de decodificacion y tok/s de prefill a ~7k tokens, medidas en un MacBook Pro M5 Max de 128 GB con oMLX 0.7.0, temperatura 0.7 y modo pensamiento desactivado) aparece truncada en la informacion proporcionada, por lo que los valores numericos de latencia y throughput no estan disponibles. El unico dato de rendimiento cuantificado es que desactivar el offload a SSD de la tabla n-gram aporta aproximadamente un 20 % mas de velocidad de decodificacion.

## Requisitos de hardware

- Descarga: 75,6 GB de repositorio, con necesidad de espacio libre equivalente mas el margen del sistema de ficheros.
- Memoria residente declarada: ~39-41 GB con la tabla n-gram en SSD mediante mmap; ~71 GB con todo residente en memoria.
- Plataforma: exclusivamente Apple Silicon (MLX). No hay ruta CUDA ni ROCm documentada para este checkpoint.
- Hardware probado: MacBook Pro con M5 Max y 128 GB de memoria unificada.
- Minimo de memoria unificada: no confirmado por el autor. Dado el consumo residente declarado con offload, un equipo con 64 GB podria ser suficiente, pero es una estimacion no verificada.
- Almacenamiento: se exige un SSD interno rapido cuando `qwen4_ple_ssd_offload` esta activo, ya que los 32 GB de tabla n-gram se leen bajo demanda.
- Despliegue recomendado: oMLX 0.7.0, que agrupa mlx 0.32.2 y mlx-vlm 0.7.1, con API compatible con OpenAI y kernels fusionados de hyper-connection activados automaticamente.
- Despliegue alternativo: `mlx-vlm` >= 0.7.1 incluye una implementacion `qwen4_exp`, pero el autor solo valido con ella una fase anterior del build (expertos mas PLE externa, sin MTP ni hyper-connections de 8 bits). Este checkpoint concreto solo esta probado con oMLX.
- Latencia y throughput: no disponibles por el truncamiento de la tabla del autor; lo unico cuantificado es la mejora de ~20 % en decodificacion al mantener la tabla n-gram en memoria.
- No hay soporte documentado para vLLM, llama.cpp, TGI ni Ollama, que son runtimes CUDA o GGUF y no ejecutan MLX affine 2-bit.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| NovaeonStudio/Qwen3.8-Flash-Next-GSQ-RCO-Q2-mlx | ~180 B (6 B activos) | MLX affine mixta 2/4/8 bits | no disponible | qwen-community-license-1.0 | Apple Silicon via oMLX | Repack sin perdida de los expertos `Q2_0`; ~39-41 GB con offload a SSD |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | ~180 B (6 B activos) | GGUF `Q2_0`, 2,40 bpw | no disponible | no disponible en la informacion consultada | llama.cpp y derivados | Origen de los expertos de este checkpoint; 8,27 GB en la ficha de local-ai-zone, repartido en 2 partes, con 80.659 descargas y 257 likes |
| mlx-community/Qwen3.8-Flash-Next-4bit | ~180 B (6 B activos) | MLX affine 4 bits | no disponible | no disponible | Apple Silicon | Fuente del resto de modulos de este checkpoint; mayor huella de memoria al no comprimir los expertos a 2 bits |
| Qwen/Qwen3.8-Flash-Next | 125 B MoE + 51 B PLE + 4 B MTP | no disponible (presumiblemente BF16) | no disponible | qwen-community-license-1.0 | Hugging Face | Modelo original de Qwen con atencion hibrida GDN + QSA; sirve de referencia de calidad sin cuantizar |

## Limitaciones y advertencias

- Cuantizacion agresiva: los expertos enrutados, que representan el 95 % de los pesos de matmul, estan a 2 bits con grupo 64. Aunque el repack es sin perdida respecto al GGUF, la perdida de calidad frente al modelo original no se ha medido en este checkpoint.
- Cero descargas registradas y una sola interaccion en Hugging Face en el momento de la consulta: es un artefacto recien publicado y sin validacion comunitaria independiente.
- Validacion limitada a un unico runtime: el autor solo ha probado este checkpoint exacto con oMLX 0.7.0. La ruta alternativa con mlx-vlm no cubre MTP ni las hyper-connections de 8 bits.
- Dependencia de hardware: solo Apple Silicon. No hay soporte CUDA, y por tanto no se puede desplegar en el parque habitual de GPU de centro de datos.
- Dependencia de almacenamiento: con `qwen4_ple_ssd_offload` activo el rendimiento queda ligado a la velocidad del SSD interno; con un disco lento la decodificacion se degradara de forma notable.
- Sin datos de benchmarks propios: las cifras de AIME25 y GPQA-Diamond proceden del build GGUF de ISTA-DASLab, no de una evaluacion de este checkpoint.
- Ausencia de informacion sobre tool calling, soporte de agentes y cobertura de idiomas, lo que impide garantizar esos usos en produccion.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado en la informacion disponible. Con 2 bits en los expertos, la probabilidad de degradacion en tareas de conocimiento factual deberia verificarse antes de cualquier despliegue.
- Licencia `qwen-community-license-1.0` con campo `license: other`: las condiciones exactas de uso comercial no se detallan en la informacion consultada y deben comprobarse en el fichero LICENSE del repositorio antes de cualquier uso productivo.
- Contexto maximo desconocido: no se indica la longitud de ventana soportada, dato critico para dimensionar memoria de cache KV en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NovaeonStudio/Qwen3.8-Flash-Next-GSQ-RCO-Q2-mlx
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Build GGUF de origen: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Version MLX de 4 bits: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-4bit
- Repositorio del modelo en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Runtime oMLX: https://github.com/jundot/omlx
- Ficha del build GGUF en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-8-flash-next-gsq-rco.html
- Documentacion de QwenCloud sobre Qwen3.8-Flash: https://docs.qwencloud.com/developer-guides/getting-started/latest-model
- Referencia arXiv 2604.18556 (citada en las etiquetas del modelo)
- Referencia arXiv 2605.00649 (citada en las etiquetas del modelo)
