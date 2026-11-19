# mlx-community/Qwen3.8-27B-OBLITERATED-OptiQ-4bit

## Resumen

`mlx-community/Qwen3.8-27B-OBLITERATED-OptiQ-4bit` es una cuantizacion mixta de precision del modelo `OBLITERATUS/Qwen3.8-27B-OBLITERATED`, un modelo de la familia Qwen3.8 de 27.000 millones de parametros con torre de vision y cabeza de especulacion MTP (multi-token prediction) integrada. Lo publica la organizacion `mlx-community`, que distribuye pesos adaptados al framework MLX de Apple, y esta construido con la herramienta `mlx-optiq`, un toolkit nativo de MLX para cuantizar, ajustar y servir modelos localmente en Apple Silicon sin PyTorch ni cloud.

El modelo resuelve el problema de ejecutar un VLM de 27B con razonamiento, tool calling y contexto largo en hardware Apple Silicon con un presupuesto de memoria contenido: el repositorio ocupa 20,7 GB en disco y aplica una asignacion por capas de 4 y 8 bits (237 componentes a 4 bits y 261 a 8 bits, con group size 64) que preserva la torre de vision en bf16 y la cabeza MTP en un archivo aparte. El modelo base declara el tag `uncensored`, lo que implica que se ha reducido o eliminado el alineamiento de rechazo del modelo original.

Es relevante ahora porque demuestra que la receta de cuantizacion de la familia Qwen3.8 es transferible entre variantes fine-tuneadas sin barrido por modelo, y porque incluye en el mismo paquete las capacidades de vision, decodificacion especulativa y function calling, tres piezas que habitualmente se distribuyen por separado. La licencia es Apache 2.0 y el pipeline declarado es `image-text-to-text`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.8 (tag `qwen3_5`) con torre de vision y cabeza MTP de especulacion |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el tag `long-context` sugiere ventana extendida, sin cifra concreta) |
| Tipos de cuantizacion | Mixta por capas: 4 bits y 8 bits (237 componentes a 4 bits, 261 a 8 bits), group size 64; torre de vision en bf16 |
| Idiomas soportados | Ingles (declarado en la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con sidecars `optiq/mtp.safetensors` y `optiq/optiq_vision.safetensors` |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen3.8 con dos componentes adicionales empaquetados en el repositorio: una torre de vision en bf16 que habilita la entrada de imagenes y una cabeza de multi-token prediction (MTP) que actua como cabecera de especulacion para acelerar la decodificacion. El proceso de cuantizacion es OptiQ de precision mixta, con asignacion de bits por capa reutilizada directamente de la receta `Qwen3.8-27B-OptiQ-4bit`: al ser la arquitectura identica a la del modelo de referencia, el ranking de sensibilidad por capa se transfiere sin necesidad de un barrido especifico para este fine-tune. El resultado son 237 componentes a 4 bits y 261 a 8 bits con group size 64.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si el modelo base empleo RLHF, DPO u otras tecnicas de alineamiento. El tag `uncensored` indica que el fine-tune de `OBLITERATUS` ha modificado el comportamiento de rechazo respecto al modelo original, pero no se detalla la metodologia. La innovacion tecnica destacable es la preservacion de la cabeza MTP como sidecar independiente: sus siete pesos RMSNorm (`mtp.*norm*`) estan centrados en cero y se aplican como `1 + w`, a diferencia de los pesos principales, que llevan el `+1` ya plegado como espera MLX. Cualquier runtime distinto de `optiq serve` debe sumar 1.0 a esas siete normas al cargar la cabeza.

## Capacidades

- Generacion de texto y razonamiento: el modelo es de tipo reasoning, por lo que requiere un presupuesto de tokens generoso para producir la cadena de razonamiento antes de la respuesta final.
- Vision e image-text-to-text: procesa imagenes mediante la torre de vision en bf16 incluida en el repositorio.
- Codigo y matematicas: capacidades heredadas de la familia Qwen3.8, sin metricas publicadas en la informacion disponible.
- Function calling y tool use: soportados de forma nativa, con plantilla de chat que incluye llamadas a herramientas.
- Uso agentico y razonamiento multi-paso: el tag `agentic` y la cabeza MTP apuntan a cargas de trabajo de agentes con generacion especulativa.
- Contexto largo: etiquetado como `long-context`, sin cifra concreta de ventana disponible.
- Multilingue: limitado al ingles segun la model card; no se declaran otros idiomas.
- Decodificacion especulativa: cabeza MTP empaquetada para acelerar la generacion.
- Servicio compatible con API de OpenAI y Anthropic mediante `optiq serve`, con cache KV de precision mixta.

## Casos de uso

- Asistente de razonamiento local en Mac: un desarrollador puede ejecutar un modelo de 27B con cadena de razonamiento en un Mac con Apple Silicon unificado, sin GPU dedicada ni servicios cloud, gracias a los 20,7 GB de pesos cuantizados.
- Analisis de documentos con imagenes: la torre de vision en bf16 permite pasar capturas, diagramas o paginas escaneadas junto con texto en la misma conversacion, util para extraccion de datos de facturas o revision de disenos.
- Agente de codigo con tool calling: la plantilla de chat incluye llamadas a funciones y el modelo soporta uso agentico, de modo que puede integrarse en un bucle que invoque herramientas de compilacion, tests o busqueda en repositorio.
- Prototipado de pipelines agenticos multi-paso: la cabeza MTP acelera la decodificacion en cargas con muchas llamadas cortas, tipicas de agentes que alternan razonamiento y ejecucion de herramientas.
- Servicio local con API compatible: `optiq serve` expone un endpoint compatible con OpenAI y Anthropic, lo que permite apuntar clientes existentes al modelo sin cambiar el codigo de integracion.
- Experimentacion con modelos sin alineamiento de rechazo: el tag `uncensored` lo hace adecuado para investigacion sobre comportamiento del modelo en dominios donde el alineamiento original bloquea respuestas, siempre con las cautelas de la seccion de limitaciones.
- Procesamiento de contexto largo en local: para tareas de resumen o recuperacion sobre documentos extensos, el tag `long-context` indica soporte de ventanas amplias, aunque la cifra exacta no esta publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 20,7 GB en disco; la inferencia necesita ademas cache KV y buffers de activacion, por lo que conviene reservar un margen por encima de los 21 GB. El modelo esta pensado para memoria unificada de Apple Silicon, no para VRAM de GPU discreta.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente (familias M-series con 32 GB o mas como punto de partida razonable dado el tamano de los pesos). No se proporcionan datos de rendimiento para A100, H100 ni RTX 4090, y el formato MLX no es compatible con CUDA sin conversion.
- Cabe en consumer GPU: no en el sentido habitual de GPU discreta con CUDA; el objetivo declarado es Apple Silicon. En un equipo Apple con memoria unificada de 32 GB o superior es viable, con margen ajustado en configuraciones de 32 GB.
- Opciones de despliegue: `mlx-lm` con `pip install "mlx-optiq>=0.4.27"` e `import optiq` previo a la carga; `optiq serve` para endpoint compatible con OpenAI y Anthropic. LM Studio puede descargarlo, pero su downloader aplana la carpeta `optiq/`, por lo que hay que devolver `mtp.safetensors` y `optiq_vision.safetensors` a esa carpeta o la torre de vision no se encuentra. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. La cabeza MTP esta pensada para mejorar la velocidad de decodificacion mediante especulacion, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-OBLITERATED-OptiQ-4bit (este) | ~26,9B | no disponible | 4/8 bits mixta, MLX | Apache 2.0 | Hugging Face, MLX |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED (base) | ~26,9B (presumible) | no disponible | sin cuantizar (no confirmado) | Apache 2.0 | Hugging Face |
| mlx-community/Qwen3.8-27B-OptiQ-4bit | ~26,9B (presumible) | no disponible | 4/8 bits mixta, MLX | Apache 2.0 | Hugging Face, MLX |

La comparativa se limita a las variantes de la misma familia presentes en la informacion proporcionada. No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Modelo marcado como `uncensored`: el fine-tune ha reducido o eliminado el alineamiento de rechazo del Qwen3.8 original, lo que aumenta el riesgo de generar contenido inapropiado, danoso o legalmente problematico sin filtros. Requiere supervision y politicas de uso propias en cualquier despliegue.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no se han publicado evaluaciones de fidelidad factual en la informacion disponible.
- Idioma: solo se declara ingles. El rendimiento en castellano no esta verificado y probablemente sea inferior.
- Contexto: aunque el tag `long-context` esta presente, no se publica la longitud exacta de la ventana, lo que impide dimensionar la cache KV con precision.
- Licencia: Apache 2.0 permite uso comercial, pero la condicion `uncensored` del modelo base puede entrar en conflicto con politicas de plataformas y con requisitos regulatorios de moderacion de contenido.
- Empaquetado fragil en LM Studio: el downloader aplana la carpeta `optiq/` y rompe la carga de la torre de vision si no se corrige manualmente.
- Compatibilidad de runtime: requiere `mlx-optiq>=0.4.27` e `import optiq` antes de cargar; fuera de `optiq serve`, la cabeza MTP necesita el ajuste manual de las siete normas RMSNorm (`+1.0`) al portarla a otro runtime.
- Presupuesto de tokens: al ser un modelo de razonamiento, un limite de generacion bajo trunca la cadena de pensamiento y degrada la respuesta.
- Sin datos de benchmarks ni de rendimiento: no es posible validar la calidad frente a alternativas sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Qwen3.8-27B-OBLITERATED-OptiQ-4bit
- Modelo base: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Receta de cuantizacion de referencia: https://huggingface.co/mlx-community/Qwen3.8-27B-OptiQ-4bit
- Web del proyecto mlx-optiq: https://mlx-optiq.com/
- Catalogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
- Documentacion de mlx-optiq: https://mlx-optiq.com/docs/
