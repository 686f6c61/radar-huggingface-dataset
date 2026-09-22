# SirSahOl/decider-2b-chat-mlx-8bit

## Resumen

decider-2b-chat-mlx-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo JackFram/decider-2b, publicada por el usuario SirSahOl. No se trata por tanto de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia nativa en la GPU unificada de los chips Apple Silicon mediante el framework MLX de Apple. La conversión se realizó con mlx-lm 0.31.3 y genera pesos en safetensors cuantizados con una media de 8,25 bits por peso.

El modelo base es un transformer decoder-only de la familia Qwen3.5 (clase Qwen3_5ForCausalLM), con 1.881.825.088 parámetros reales según los safetensors (la model card redondea a 2,0B) y una longitud de contexto declarada de 262.144 tokens. Su interés práctico reside en que permite ejecutar un modelo de ~2B con ventana de contexto muy larga en portátiles y equipos de sobremesa Apple sin GPU dedicada, con un consumo de memoria activa de aproximadamente 2,6 GB.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de cuantización con solo 13 descargas, sin benchmark de calidad publicado, licencia sin especificar y metadatos con fechas incoherentes (creación en 2026). Es útil como ejemplo de flujo de conversión MLX y para pruebas locales en Apple Silicon, pero no como base para despliegues en producción sin verificar antes la licencia del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer decoder-only, segun model card) |
| Parametros totales | 1.881.825.088 (≈1,88B) segun safetensors; la model card indica 2,0B |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (segun model card) |
| Tipos de cuantizacion | 8-bit MLX (media de 8,25 bits por peso); existen variantes 4-bit y 16-bit del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | unknown (sin especificar) |
| Formato de pesos | safetensors en formato MLX (repo de 2,0 GB; salida de conversion 1,9 GB) |
| Modelo base | JackFram/decider-2b (relacion: quantized) |
| Libreria | mlx-lm 0.31.3 |
| Plantilla de chat | estilo ChatML: `<|im_start|>` / `<|im_end|>` / `<|endoftext|>` |

## Arquitectura y entrenamiento

La model card indica que el modelo base pertenece a la clase `Qwen3_5ForCausalLM`, es decir, un transformer decoder-only causal con atención completa, tokenizador de la familia Qwen y plantilla de chat tipo ChatML. No se aporta informacion sobre el numero de cabezas de atención, dimension del hidden state, uso de attention lineal, decodificacion especulativa ni sobre si la ventana de 262.144 tokens se logra mediante RoPE escalado, YaRN u otra tecnica. Tampoco se documenta si la arquitectura incorpora capas de mezcla de expertos: dado que los safetensors reportan 1.881.825.088 parametros totales y la model card habla de 2,0B sin mencionar parametros activos, lo mas razonable es asumir un modelo denso.

Respecto al entrenamiento, esta ficha no puede aportar ningun dato verificado: no se especifica el numero de tokens, la composicion del dataset, ni si hubo fases de ajuste por instrucciones con SFT, RLHF o DPO. Lo unico documentado es el proceso de conversion: el autor aplico `mlx_lm.convert` sobre el checkpoint original, con cuantizacion de 8 bits, en 6,94 segundos, generando un repositorio de 1,9 GB a partir de un modelo de ~2B parametros. La innovacion tecnica del repositorio es, por tanto, exclusivamente de despliegue: empaquetado en formato MLX para aprovechar la memoria unificada y los kernels Metal de los chips M-series.

## Capacidades

- Generacion de texto conversacional: la model card expone `pipeline_tag: text-generation` y ejemplos de chat interactivo mediante `mlx_lm.chat`, con plantilla de mensajes de rol usuario/asistente.
- Razonamiento y generacion de codigo: el autor afirma en la tabla comparativa de cuantizaciones que la variante 8-bit ofrece "near-lossless reasoning" y mejor precision en codigo que la de 4 bits, si bien no aporta ninguna metrica que respalde esa afirmacion.
- Contexto largo: la ventana declarada de 262.144 tokens permitiria en teoria procesar libros completos o bases de codigo extensas, aunque no hay evaluacion publicada de recuperacion en contextos largos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor solo menciona "agent orchestration" como caso de uso recomendado para chips Max/Ultra, sin detallar capacidades de agente.
- Capacidades multilingues: no disponible (el campo de idiomas de HuggingFace esta vacio).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Integracion con runtimes locales: soporta CLI y API de Python de mlx-lm, y la model card documenta configuracion de tokens de parada para LM Studio y un ejemplo de Modelfile para Ollama.

## Casos de uso

- Asistente conversacional local en un Mac: con ~2,6 GB de memoria activa y 8 GB de memoria unificada minima, el modelo puede ejecutarse como chat de escritorio en un MacBook Air M1/M2 base sin desplazar al resto del sistema, gestionando conversaciones multi-turno con plantilla ChatML.
- Autocompletado y generacion de codigo en el editor: la ventana de 262.144 tokens permite indexar repositorios medianos completos en el prompt; la model card recomienda la variante 8-bit precisamente para casos donde se exige "code accuracy".
- Procesamiento de documentos largos: informes, contratos o articulos que superen las 100.000 palabras pueden insertarse en un unico prompt sin troceado ni recuperacion externa, lo que simplifica pipelines de extraccion y resumen.
- Prototipado rapido de aplicaciones LLM en Apple Silicon: al cargarse con `mlx_lm.load` y aceptar plantillas de chat, sirve para validar prompts, plantillas y flujos de agente antes de migrar a modelos mayores en servidor.
- Generacion por lotes en estaciones de trabajo Mac Studio/Ultra: la tabla del autor estima hasta ~201 tokens/s y 12 ms de TTFT en chips Ultra, lo que permitiria tareas de extraccion masiva de documentos con cierta concurrencia.
- Evaluacion comparativa de cuantizaciones: al existir variantes 4-bit, 8-bit y 16-bit del mismo modelo base, el repositorio es util para medir la degradacion de calidad y el ahorro de memoria entre precisiones en hardware Apple.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en local y no requerir llamadas a API externas, encaja en escenarios con datos sensibles donde no se permite salida a Internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, MT-Bench ni perplejidad) en la informacion disponible. La seccion "Performance Benchmarks" de la model card contiene unicamente estimaciones de throughput y latencia por hardware, no metricas de capacidad del modelo, y las cifras estan explicitamente etiquetadas por el autor como proyecciones basadas en saturar el ancho de banda de memoria de los chips Apple.

| Nivel de hardware Apple Silicon | Memoria unificada | Memoria activa | Velocidad estimada | TTFT estimado |
|---|---|---|---|---|
| M1/M2/M3/M4 (base) | 8 GB | ~2,6 GB | ~67 tokens/s | ~44 ms |
| M1/M2/M3/M4 Pro | 18-36 GB | ~2,6 GB | ~100 tokens/s | ~30 ms |
| M1/M2/M3/M4 Max | 36-128 GB | ~2,6 GB | ~144 tokens/s | ~18 ms |
| M1/M2/M3 Ultra | 64-192 GB | ~2,6 GB | ~201 tokens/s | ~12 ms |

## Requisitos de hardware

- VRAM / memoria activa: aproximadamente 2,6 GB para la variante 8-bit. La model card recomienda un minimo de 8 GB de memoria unificada.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra) a traves de MLX. No hay soporte para CUDA ni ROCm en este repositorio.
- GPU de consumo: cabe holgadamente en cualquier Mac con 8 GB o mas de memoria unificada, incluidas las gamas base; comparte memoria con el sistema, por lo que en equipos de 8 GB conviene valorar la variante 4-bit (~1,5 GB) si se trabaja con el navegador y el IDE abiertos.
- Alternativas de cuantizacion segun memoria: 4-bit (~1,5 GB en disco y en memoria), 8-bit (~2,6 GB, este repositorio) y 16-bit (~4,8 GB).
- Opciones de despliegue: mlx-lm (CLI `mlx_lm.chat` y `mlx_lm.generate`, y API de Python), LM Studio configurando los tokens de parada `<|im_start|>`, `<|im_end|>` y `<|endoftext|>`, y Ollama mediante un Modelfile. vLLM, TGI y llama.cpp no consumen pesos MLX de forma nativa.
- Latencia y throughput: TTFT estimado entre 12 ms y 44 ms y entre ~67 y ~201 tokens/s segun el chip, siempre segun las proyecciones del autor, no medidas independientes.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados dentro de la informacion proporcionada. La tabla siguiente recoge unicamente caracteristicas publicas de familias de tamano equivalente; las cifras de modelos alternativos proceden de documentacion general de sus respectivas familias y deberian confirmarse en las fuentes oficiales antes de usarse en una decision tecnica.

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| decider-2b-chat-mlx-8bit | ~1,88-2,0B | 262.144 tokens (declarado) | unknown | safetensors MLX (solo Apple Silicon) |
| Qwen2.5-3B-Instruct | ~3,1B | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF, MLX |
| Llama-3.2-3B-Instruct | ~3,2B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF, MLX |
| Gemma 2 2B-it | ~2,6B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF |

Diferencias destacables frente a esas alternativas: la ventana de contexto declarada es muy superior a la de Qwen2.5-3B y Gemma 2 2B, pero la licencia sin especificar y la ausencia total de evaluaciones publicadas impiden recomendar este repositorio por delante de opciones con licencia clara y benchmarks reproducibles.

## Limitaciones y advertencias

- Licencia sin especificar: el campo `license: unknown` y la ausencia de texto de licencia en la model card impiden determinar si se permite el uso comercial. Hay que verificar la licencia de JackFram/decider-2b antes de cualquier uso en produccion.
- Ausencia de benchmarks: no hay ninguna metrica de calidad (MMLU, HumanEval, GSM8K, perplejidad) publicada para el modelo base ni para esta cuantizacion, por lo que no es posible estimar su nivel real de razonamiento o de generacion de codigo.
- Riesgo de alucinacion: no evaluado. Un modelo de ~2B sin datos publicados de entrenamiento ni de alineacion tiene una probabilidad elevada de fabricar hechos, especialmente en contextos de 262.144 tokens donde la recuperacion fina degrada.
- Idiomas: no declarados. Aunque la familia Qwen suele estar entrenada de forma multilingue, no hay confirmacion para este checkpoint concreto y el rendimiento en castellano es desconocido.
- Contexto declarado sin validacion: los 262.144 tokens provienen de la model card y no van acompanados de pruebas de recuperacion en contexto largo; es probable que la calidad se degrade mucho antes de alcanzar ese limite.
- Compatibilidad de formato: los pesos son MLX, por lo que el modelo queda restringido a Apple Silicon. El ejemplo de Modelfile para Ollama incluido en la model card apunta a un repositorio MLX, algo que Ollama no puede ejecutar sin una conversion previa a GGUF.
- Tokens de parada obligatorios: si no se configuran `<|im_start|>`, `<|im_end|>` y `<|endoftext|>`, el modelo puede entrar en bucles y no respetar los turnos de conversacion, tal como advierte el propio autor.
- Metadatos incoherentes: las fechas de creacion y actualizacion (2026) no son plausibles, y el nombre del repositorio incluye "chat" mientras la model card lo titula "decider-2b-mlx-8bit". Conviene tratar los metadatos con cautela.
- Adopcion muy baja: 13 descargas y 0 likes reducen la probabilidad de que los problemas hayan sido detectados y corregidos por la comunidad.
- Los resultados de la busqueda web asociados a esta consulta no contienen informacion tecnica sobre el modelo (corresponden a una tienda de ropa infantil), por lo que no aportan datos adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SirSahOl/decider-2b-chat-mlx-8bit
- Modelo base: https://huggingface.co/JackFram/decider-2b
- Variante 4-bit: https://huggingface.co/SirSahOl/decider-2b-chat-mlx-4bit
- Variante 16-bit: https://huggingface.co/SirSahOl/decider-2b-chat-mlx-16bit
- Autor: https://huggingface.co/SirSahOl
- Framework MLX: https://github.com/ml-explore/mlx
- Libreria mlx-lm (version usada en la conversion: 0.31.3): no se ha proporcionado un enlace directo en la informacion disponible
