# SirSahOl/JevK5-chat-mlx-8bit

## Resumen

JevK5-chat-mlx-8bit es una conversion a 8 bits en formato MLX del modelo alibiserikbay/JevK5, realizada por el usuario SirSahOl y publicada en HuggingFace. Se trata de un modelo de generacion de texto conversacional construido sobre la arquitectura Qwen3_5ForCausalLM, con aproximadamente 4,2 mil millones de parametros segun los pesos en safetensors (la model card indica ~3,9B) y una ventana de contexto declarada de 262.144 tokens. Su proposito es permitir la inferencia nativa en la GPU unificada de los chips Apple Silicon (series M1 a M4) sin necesidad de GPUs dedicadas ni de servidores externos.

El modelo deriva de JevK5, que segun las etiquetas de la model card se presenta como un "decision-model" orientado al paradigma "system-one", con decisiones tipadas (typed decisions), calibracion y destilacion (distillation) como parte de su entrenamiento. Incluye etiquetas como jevbench, jev-alternative y self-hosted, lo que sugiere un enfoque en autoalojamiento y evaluacion propia. La cuantizacion se ha realizado con mlx-lm 0.31.3 en 29,98 segundos, generando un repositorio de 4,5 GB con pesos en safetensors y una huella de VRAM activa de aproximadamente 4,7 GB.

Su relevancia actual radica en dos factores: por un lado, ofrece una ventana de contexto extremadamente larga (262K tokens) en un modelo de solo 4,2B parametros, lo que lo hace apto para tareas de resumen y analisis de documentos extensos en hardware de consumo; por otro, esta especificamente optimizado para Apple Silicon mediante MLX, un nicho con relativamente pocas alternativas publicadas. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer decoder-only, segun tag qwen3_5_text) |
| Parametros totales | 4.205.751.296 (aprox. 4,2B) en safetensors; la model card declara ~3,9B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 8 bits (media de 8,25 bits por peso); existen variantes 4-bit y 16-bit del mismo autor |
| Idiomas soportados | ingles (etiqueta "en"); el resto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (formato nativo de Apple Silicon) |
| Tamano del repositorio | 4,5 GB |
| Huella de VRAM activa | ~4,7 GB (minimo recomendado: 8 GB de memoria unificada) |
| Modelo base | alibiserikbay/JevK5 |
| Libreria | mlx-lm 0.31.3 |

## Arquitectura y entrenamiento

La arquitectura declarada es Qwen3_5ForCausalLM, es decir, un transformer decoder-only de la familia Qwen 3.5, con la etiqueta adicional qwen3_5_text que indica una variante orientada exclusivamente a texto. Se trata de un modelo denso de aproximadamente 4,2B parametros, no de una arquitectura MoE, hibrida ni basada en SSM segun la informacion disponible. La ventana de contexto de 262.144 tokens es el rasgo arquitectonico mas destacado y situa al modelo en el rango de contextos muy largos para su tamano.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. Las etiquetas de la model card si mencionan destilacion (distillation) y calibracion (calibration) como parte del pipeline del modelo original, ademas de conceptos propios como "system-one", "typed-decisions" y "jevbench", que apuntan a un enfasis en la toma de decisiones estructurada y en la evaluacion mediante un benchmark propio. Esta conversion concreta no reentrena el modelo: unicamente aplica cuantizacion de solo pesos (weight-only) a 8 bits con una media de 8,25 bits por peso mediante mlx-lm 0.31.3, sin cambios en la topologia de la red.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat compatible con el formato ChatML (`<|im_start|>` y `<|im_end|>`).
- Procesamiento de contexto muy largo: hasta 262.144 tokens, lo que permite analizar documentos completos o historiales extensos en una sola pasada.
- Orientacion a toma de decisiones estructurada, segun las etiquetas "decision-model" y "typed-decisions" del modelo base.
- Capacidad de razonamiento y generacion de codigo, inferida del uso recomendado por el autor para "reasoning and code accuracy" con la variante de 8 bits.
- Inferencia local autoalojada (etiqueta "self-hosted") sin dependencia de APIs externas.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible") y con el pipeline text-generation de HuggingFace.
- Soporte de parada de generacion configurable mediante tokens de parada personalizados para evitar bucles.
- Capacidades multilingues: no disponible; la unica lengua declarada es el ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se ejecuta integramente en la GPU unificada de un chip Apple Silicon mediante mlx-lm, con una huella de unos 4,7 GB, lo que permite mantener conversaciones privadas sin que los datos salgan del equipo.
- Analisis de documentos extensos: gracias a los 262.144 tokens de contexto, se pueden cargar manualmente transcripciones completas, informes anuales o bases de codigo de tamano medio en una unica peticion y pedir resumenes o extraccion de datos concretos.
- Generacion y revision de codigo en el puesto de trabajo: el autor recomienda la cuantizacion de 8 bits precisamente cuando se requiere mayor precision en razonamiento y codigo, por lo que encaja en flujos de autocompletado o revision de parches desde un IDE en un Mac con 16 GB o mas de memoria unificada.
- Prototipado rapido de aplicaciones de texto: al ser compatible con el pipeline text-generation y con endpoints, se puede levantar un servicio local con mlx-lm y consumirlo desde una aplicacion web o script sin coste de API.
- Chatbot de soporte interno para equipos pequenos: desplegado con Ollama o mlx-lm en un Mac mini o Mac Studio, puede atender consultas internas sobre documentacion tecnica alojada en el propio equipo.
- Evaluacion y comparacion de cuantizaciones: el repositorio incluye variantes 4-bit, 8-bit y 16-bit, por lo que es util para medir el impacto de la cuantizacion en calidad y velocidad antes de fijar una configuracion de produccion.
- Investigacion sobre modelos de decision: las etiquetas "decision-model", "system-one" y "jevbench" lo hacen candidato para experimentos academicos sobre toma de decisiones estructurada y calibracion, siempre que se valide su comportamiento fuera del ingles.

## Benchmarks y rendimiento

Solo se han publicado mediciones de rendimiento de inferencia en Apple M1 con 8 GB de memoria unificada (media de 5 ejecuciones, 256 tokens maximos). No hay resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | 4-bit | 8-bit |
|---|---|---|
| Tokens por segundo | 17,97 | 10,35 |
| TTFT (time to first token) | 55,74 ms | 96,71 ms |
| Memoria pico declarada | 420,9 MB | 59,7 MB |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4,5 GB en disco y ~4,7 GB de huella activa para la variante de 8 bits (4,5 GB de tamano de repositorio).
- Memoria minima recomendada: 8 GB de memoria unificada, aunque el autor recomienda 16 GB o mas para usar la variante de 8 bits con holgura.
- GPU recomendadas: chip Apple Silicon con GPU integrada (M1, M2, M3, M4, y sus variantes Pro, Max y Ultra). El autor situa la variante de 8 bits en equipos con 18 a 36 GB de memoria unificada.
- Compatibilidad con GPU de consumo: al ser un formato MLX, no esta pensado para GPUs NVIDIA o AMD; requiere Apple Silicon.
- Si cabe en hardware de consumo: si, en cualquier Mac con 16 GB o mas de memoria unificada; en equipos de 8 GB se recomienda la variante de 4 bits.
- Opciones de despliegue: mlx-lm (CLI `mlx_lm.chat` y `mlx_lm.generate`, y API de Python), Ollama mediante Modelfile, y LM Studio con tokens de parada personalizados.
- Latencia y throughput: 10,35 tokens/s y 96,71 ms de TTFT medidos en un Apple M1 con 8 GB; la variante de 4 bits alcanza 17,97 tokens/s con 55,74 ms de TTFT.
- Contextos superiores a 32K tokens requieren suficiente memoria unificada libre, segun advierte el propio autor.

## Comparativa con modelos similares

Comparativa con las otras cuantizaciones publicadas del mismo modelo base por el mismo autor:

| Variante | Tamano en disco | Huella de VRAM | Hardware objetivo | Ventaja declarada |
|---|---|---|---|---|
| JevK5-chat-mlx-4bit | ~2,5 GB | ~2,5 GB | M1/M2/M3/M4 (8 GB+) | Maxima velocidad y menor consumo de RAM |
| JevK5-chat-mlx-8bit (este) | ~4,5 GB | ~4,5 GB | M1/M2/M3/M4 Pro/Max (16 GB+) | Equilibrio entre precision y velocidad |
| JevK5-chat-mlx-16bit | ~8,6 GB | ~8,6 GB | M2/M3/M4 Max/Ultra (32 GB+) | Precision sin cuantizar, calidad de referencia |

Comparativa con modelos alternativos de otros autores: no disponible. No se ha proporcionado informacion sobre modelos comparables de tamano o tarea similar, ni datos de benchmarks de calidad que permitan establecer una comparacion objetiva frente a otras familias.

## Limitaciones y advertencias

- La cuantizacion group-wise introduce una perdida menor de precision frente a los pesos sin cuantizar; el autor recomienda probar las variantes de 8 o 16 bits para derivaciones matematicas profundas o razonamiento critico. La seccion de limitaciones de la model card menciona "4-bit" al describir este punto, lo que parece un error de redaccion al copiar la plantilla.
- Riesgo de bucles en la generacion: el propio autor advierte que hay que configurar tokens de parada personalizados (`<|im_start|>`, `<|im_end|>`, `<|endoftext|>`) para evitar bucles infinitos y asegurar el turno conversacional correcto.
- Las secuencias de contexto muy largo (mas de 32K tokens) exigen suficiente memoria unificada libre; si la memoria esta sobrecomprometida, la inferencia puede fallar.
- El modelo esta disenado especificamente para GPUs Apple Silicon; no funciona en CUDA ni en CPU convencional con este formato de pesos.
- Idioma: la unica lengua declarada es el ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion: no documentado en la informacion disponible, pero es un riesgo inherente a los modelos generativos de este tamano. No se han publicado evaluaciones de fidelidad factual.
- Sesgos conocidos: no disponibles. No se documenta la composicion del dataset de entrenamiento ni se han publicado analisis de sesgo.
- Uso comercial: permitido sin restricciones adicionales por la licencia Apache 2.0, siempre que se conserve el aviso de licencia correspondiente.
- Advertencia de procedencia: el modelo base alibiserikbay/JevK5 tiene muy poca traccion en HuggingFace (6 descargas y 0 likes en esta conversion), por lo que conviene validarlo en el caso de uso concreto antes de llevarlo a produccion.
- Riesgo de calidad derivado de la destilacion: la model card del modelo base menciona destilacion, lo que puede implicar una capacidad inferior a la de modelos entrenados desde cero de tamano comparable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SirSahOl/JevK5-chat-mlx-8bit
- Modelo base: https://huggingface.co/alibiserikbay/JevK5
- Variante 4-bit: https://huggingface.co/SirSahOl/JevK5-chat-mlx-4bit
- Variante 16-bit: https://huggingface.co/SirSahOl/JevK5-chat-mlx-16bit
- Perfil del autor de la conversion: https://huggingface.co/SirSahOl
- MLX (framework de Apple): https://github.com/ml-explore/mlx

No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos son contenido no relacionado y no se han utilizado como fuente.
