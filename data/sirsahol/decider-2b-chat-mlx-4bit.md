# SirSahOl/decider-2b-chat-mlx-4bit

## Resumen

decider-2b-chat-mlx-4bit es una conversion cuantizada a 4 bits en formato MLX del modelo JackFram/decider-2b, publicada por el usuario SirSahOl. Se trata de una conversacion de pesos, no de un modelo entrenado desde cero: el autor parte del modelo base y lo transforma con mlx-lm 0.31.3 para que pueda ejecutarse de forma nativa sobre la GPU unificada de los chips Apple Silicon (familias M1, M2, M3 y M4). El resultado ocupa aproximadamente 1,0 GB en disco y declara una huella activa de unos 1,5 GB de VRAM, con un minimo recomendado de 8 GB de memoria unificada.

El modelo pertenece a la familia de arquitectura Qwen3_5ForCausalLM, es un transformer decoder-only de tipo causal con 1.881.825.088 parametros reales contabilizados en los safetensors (la model card declara 2,0B) y una longitud de contexto declarada de 262.144 tokens. La cuantizacion aplicada trabaja a una media de 4,50 bits por peso, lo que lo situa en el segmento de modelos pequenos pensados para inferencia local de baja latencia en equipos de consumo.

Su relevancia practica es acotada pero concreta: cubre el nicho de asistentes conversacionales y completado de texto que deben ejecutarse integramente en un portatil Mac, sin GPU dedicada y sin enviar datos a la nube. Como contrapartida, el repositorio tiene una validacion publica muy baja (14 descargas y 0 likes en el momento de redactar esta ficha), la licencia figura como "unknown", no se documentan idiomas soportados ni resultados de benchmarks de calidad, y la busqueda web realizada no ha devuelto ninguna fuente independiente sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer decoder-only causal, segun la model card) |
| Parametros totales | 1.881.825.088 (~1,88 mil millones, recuento real de safetensors); la model card declara 2,0B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (dato declarado en la model card) |
| Tipos de cuantizacion | 4-bit MLX, media de 4,50 bits por peso; el mismo autor publica variantes de 8-bit y 16-bit |
| Idiomas soportados | no disponible |
| Licencia | unknown (no especificada en el repositorio) |
| Formato de pesos | safetensors en formato MLX (no GGUF) |
| Modelo base | JackFram/decider-2b (relacion: quantized) |
| Libreria de inferencia | mlx / mlx-lm (version de conversion 0.31.3) |
| Tamano del repositorio | 1,1 GB (salida de conversion declarada: 1,0 GB) |
| Pipeline | text-generation |
| Fecha de creacion / actualizacion | 2026-09-22 / 2026-09-22 |

## Arquitectura y entrenamiento

No hay informacion disponible sobre el proceso de entrenamiento de este modelo: la model card es exclusivamente una ficha de conversion y no documenta numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO u otras) ni innovaciones de atencion. Lo unico que se indica es la arquitectura del modelo base, Qwen3_5ForCausalLM, y la etiqueta qwen3_5_text, lo que sugiere una familia de tipo Qwen 3.5. Cabe senalar la discrepancia entre ese nombre de arquitectura y el identificador del modelo base ("decider-2b", de la cuenta JackFram), que no se explica en la documentacion.

Respecto a la conversion, el autor detalla que se realizo con mlx-lm 0.31.3, con un tiempo de conversion de 6,2 segundos y un tamano de salida de 1,0 GB. El proceso aplica cuantizacion de 4 bits con un promedio de 4,50 bits por peso, lo que implica que determinadas capas conservan mas precision que otras para limitar la perdida de calidad. Se trata, por tanto, de un artefacto de despliegue: la unica "innovacion" tecnica es el empaquetado en el formato nativo de MLX para aprovechar la memoria unificada de Apple Silicon, no una aportacion de arquitectura o entrenamiento.

## Capacidades

- Generacion de texto causal y conversacion multi-turno, con plantilla de chat basada en tokens especiales tipo ChatML (`<|im_start|>` y `<|im_end|>`).
- Completado de texto y de codigo en entornos locales, segun los casos de uso recomendados por el propio autor en la model card.
- Manejo de contextos muy largos sobre el papel: 262.144 tokens declarados, lo que habilita resumen y analisis de documentos extensos en una sola pasada.
- Invocacion de herramientas: la model card menciona "tool invocation" como escenario de uso recomendado en el tramo Pro, pero no documenta ninguna plantilla ni formato de function calling. Debe considerarse no verificado.
- Ejecucion de agentes y razonamiento multi-paso: el autor lo cita como caso de uso en los tramos Max y Ultra, sin detalles tecnicos ni evaluacion.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidad especial de vision, audio o modo "thinking": no disponible; no se documenta ninguna.

## Casos de uso

- Asistente conversacional local en un Mac: el modelo cabe en unos 1,5 GB de memoria activa y rinde en torno a 102 tokens/s en un chip base, por lo que puede mantener conversaciones interactivas fluidas en un equipo de 8 GB de memoria unificada sin conexion a internet.
- Autocompletado y asistencia de codigo dentro del IDE: con una latencia de primer token estimada de unos 31 ms en el tramo base, es viable como motor de sugerencias en linea dentro de editores, siempre que se acepte la menor precision de una cuantizacion de 4 bits frente a la variante de 8 o 16 bits.
- Resumen y extraccion de informacion en documentos largos: la ventana declarada de 262.144 tokens permite procesar contratos, informes o transcripciones completas en una sola pasada, con el modelo ejecutandose integramente en local.
- Procesamiento por lotes ofensivo en estaciones de trabajo: en un chip Ultra, el autor estima unos 306 tokens/s, lo que lo hace adecuado para extraccion masiva de campos o clasificacion de documentos en pipelines nocturnos.
- Chatbot de atencion al cliente con requisitos de privacidad: al no salir los datos del dispositivo, encaja en despliegues donde el cumplimiento normativo impide enviar conversaciones a APIs externas.
- Componente de un sistema RAG local: puede actuar como generador final sobre fragmentos recuperados de una base documental propia, manteniendo todo el flujo en el mismo Mac.
- Prototipado y evaluacion de pipelines MLX: sirve como modelo de pruebas de bajo coste para validar integraciones con mlx-lm, plantillas de chat, tokens de parada y flujos de agentes antes de escalar a modelos mayores.
- Generacion de texto creativo y borradores offline: redaccion de textos cortos, resumenes ejecutivos o variaciones de copy en un portatil sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente incluye proyecciones de velocidad en hardware Apple Silicon, que se reproducen a continuacion etiquetadas como estimaciones del autor, no como mediciones verificadas:

| Tramo de Apple Silicon | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado |
|---|---|---|---|---|
| M1 / M2 / M3 / M4 (base) | 8 GB | ~1,5 GB | ~102 tokens/s | ~31 ms |
| M1 / M2 / M3 / M4 Pro | 18 GB – 36 GB | ~1,5 GB | ~153 tokens/s | ~21 ms |
| M1 / M2 / M3 / M4 Max | 36 GB – 128 GB | ~1,5 GB | ~219 tokens/s | ~13 ms |
| M1 / M2 / M3 / M4 Ultra | 64 GB – 192 GB | ~1,5 GB | ~306 tokens/s | ~9 ms |

El propio autor advierte que son proyecciones basadas en la saturacion de ancho de banda de memoria de Apple Silicon para pesos de 4 bits, y que las velocidades reales varian con la longitud del prompt.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB de memoria activa con la cuantizacion de 4 bits; minimo recomendado de 8 GB de memoria unificada.
- Variantes de precision y su huella: 4-bit ~1,5 GB de disco y VRAM; 8-bit ~2,6 GB (recomendado 16 GB o mas de memoria unificada); 16-bit ~4,8 GB (recomendado 32 GB o mas).
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4, en versiones base, Pro, Max y Ultra). El formato MLX no se ejecuta en GPU NVIDIA, AMD ni en CPU x86.
- GPU de consumo: si cabe en cualquier Mac con 8 GB de memoria unificada o mas. No es desplegable en una RTX 4090 ni en una A100 o H100 sin convertir previamente los pesos a un formato soportado (GGUF o safetensors de HuggingFace), conversion que no se proporciona en este repositorio.
- Opciones de despliegue: mlx-lm mediante CLI (`mlx_lm.chat`, `mlx_lm.generate`) o API de Python; Ollama segun el Modelfile incluido en la model card; LM Studio, para el que el autor detalla la configuracion de tokens de parada. vLLM y TGI no aplican a este formato.
- Tokens de parada obligatorios en el runtime: `<|im_start|>`, `<|im_end|>` y `<|endoftext|>`, con temperatura sugerida de 0,7 en el ejemplo de Ollama.
- Latencia y throughput: unicamente las estimaciones de la tabla anterior (entre ~102 y ~306 tokens/s segun el chip, y entre ~9 y ~31 ms de TTFT).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento fiable. La unica comparacion documentada es entre las distintas precisiones del mismo modelo:

| Variante | Tamano en disco | Huella de memoria | Hardware objetivo | Ventaja declarada |
|---|---|---|---|---|
| 4-bit MLX (este repositorio) | ~1,5 GB | ~1,5 GB | M1/M2/M3/M4 con 8 GB o mas | Maxima velocidad y menor consumo de RAM |
| 8-bit MLX | ~2,6 GB | ~2,6 GB | M1/M2/M3/M4 Pro/Max con 16 GB o mas | Equilibrio entre precision y velocidad; razonamiento casi sin perdida |
| 16-bit MLX | ~4,8 GB | ~4,8 GB | M2/M3/M4 Max/Ultra con 32 GB o mas | Precision completa sin cuantizar; calidad de referencia |

Frente a alternativas de otros autores y de tamano similar, la comparativa figura como no disponible.

## Limitaciones y advertencias

- Licencia desconocida: el repositorio declara `license: unknown` y no se especifican los terminos de la licencia del modelo base. No deberia utilizarse en produccion ni en contextos comerciales sin aclarar previamente la situacion legal con el autor.
- Riesgo de alucinacion: es un modelo de ~1,9 mil millones de parametros cuantizado a 4 bits; es esperable una tasa de error factual alta en tareas de conocimiento, y la model card no documenta ningun tipo de mitigacion.
- Sin evaluacion de calidad publicada: no existen resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, por lo que no hay evidencia objetiva de su rendimiento mas alla de las proyecciones de velocidad del propio autor.
- Perdida por cuantizacion: la cuantizacion de 4 bits con 4,50 bits por peso degrada la precision respecto a las variantes de 8 y 16 bits del mismo autor, especialmente en tareas de razonamiento y generacion de codigo.
- Idiomas no documentados: se desconoce que idiomas soporta realmente y con que calidad, a pesar de que el nombre del repositorio incluye "chat".
- Contexto largo sin validar: aunque se declaran 262.144 tokens de ventana, no se aporta ninguna prueba de que el modelo mantenga coherencia en longitudes cercanas a ese limite.
- Function calling y agentes sin especificar: la model card menciona invocacion de herramientas y orquestacion de agentes, pero no documenta plantilla ni formato alguno, por lo que estas capacidades no deben darse por garantizadas.
- Dependencia de plataforma: los pesos solo son utilizables en Apple Silicon mediante MLX; no hay conversion a GGUF ni version compatible con runtime CUDA en este repositorio.
- Validacion publica minima: 14 descargas y 0 likes, sin issues ni discusiones, lo que reduce la confianza en la calidad y el mantenimiento del artefacto.
- Fechas incoherentes: las marcas temporales del repositorio (2026-09-22) y la discrepancia entre el recuento real de parametros (1.881.825.088) y el declarado (2,0B) aconsejan verificar la procedencia del modelo antes de integrarlo.
- Busqueda web sin resultados utiles: las consultas realizadas no han devuelto ninguna fuente independiente, articulo o discusion sobre este modelo o sobre el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/decider-2b-chat-mlx-4bit
- Modelo base: https://huggingface.co/JackFram/decider-2b
- Variante de 8 bits: https://huggingface.co/SirSahOl/decider-2b-chat-mlx-8bit
- Variante de 16 bits: https://huggingface.co/SirSahOl/decider-2b-chat-mlx-16bit
- Perfil del autor: https://huggingface.co/SirSahOl
- Repositorio de MLX (Apple): https://github.com/ml-explore/mlx
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
