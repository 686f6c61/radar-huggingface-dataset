# RolanDorisTech/Qwen3.8-2B-Distill-MLX-oQ8e

## Resumen

Qwen3.8-2B-Distill-MLX-oQ8e es una version cuantizada y nativa de MLX del modelo destilado Qwen3.8-2B-Distill, publicada por el usuario RolanDorisTech. Se trata de un modelo de aproximadamente 2.000 millones de parametros, orientado a razonamiento, que ha sido convertido a un formato cuantizado de precision mixta denominado oQe (oMLX Universal Dynamic Quantization) para su ejecucion en Apple Silicon. El peso final del artefacto es de 1,9 GB, lo que lo situa en el rango de modelos que caben comodamente en la memoria unificada de cualquier Mac moderno.

El problema que resuelve es concreto: permitir ejecutar un modelo de razonamiento con etiquetas de pensamiento en hardware de consumo Apple sin renunciar en exceso a la calidad del modelo original en bfloat16. Segun la model card, la cuantizacion oQe mide la sensibilidad real de cada capa y asigna bits donde el error duele mas, anadiendo ademas la importancia de activaciones (imatrix) para ponderar la cuantizacion. El resultado queda en un rango efectivo de 4,7 a 8,5 bits por peso, frente a los 5,003 bpw de una cuantizacion 4-bit g32 plana o los 8,502 bpw de una 8-bit g64 plana.

La relevancia actual del modelo es doble. Por un lado, forma parte de una familia de ocho cuantizaciones (2B, 4B y 9B en oQ4e, oQ5e, oQ6e y oQ8e) construida el 23 de septiembre de 2026 con mediciones de rendimiento publicadas. Por otro, mantiene el formato safetensors estandar de mlx-lm, lo que garantiza compatibilidad con mlx-lm, oMLX, LM Studio y mlx-swift sin necesidad de conversiones adicionales. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base empero-ai/Qwen3.8-Distill; la model card no la especifica) |
| Parametros totales | aproximadamente 2.000 millones (segun la denominacion del modelo; no verificado de forma explicita en la model card) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQe (precision mixta dinamica guiada por datos con imatrix); entre 4,7 y 8,5 bpw efectivos; lm_head en 8 bits; embeddings y capas iniciales/finales con bits reforzados; normas y escalas en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors de mlx-lm (MLX); el modelo base se distribuye tambien en GGUF |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base empero-ai/Qwen3.8-Distill, mas alla de que se trata de un modelo destilado de razonamiento derivado de la familia Qwen3 y de que su plantilla de chat utiliza el formato de Qwen3 con etiquetas `<think>`. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en alguna fase del proceso. Toda esa informacion corresponderia al modelo base y no esta disponible en la informacion proporcionada.

La innovacion tecnica documentada esta en la fase de cuantizacion, no en el entrenamiento. El pipeline oQ de oMLX realiza una cuantizacion de precision mixta guiada por datos que mide la sensibilidad real de cada capa y asigna bits de forma no uniforme; la variante oQe anade la importancia de activaciones (imatrix) para ponderar los canales mas relevantes y reducir el error en ellos. La build concreta de este modelo se ejecuto con M1-Max Mac Studio de 64 GB y GPU de 32 nucleos bajo macOS 27.0, con las opciones oQe ON, Reuse ON, cache automatica, Strict OFF y Preserve MTP OFF, usando bfloat16 para normas y escalas. La cuantizacion del 2B-oQ8e tardo 43 segundos. El resultado conserva el formato safetensors estandar de mlx-lm y se distribuye junto con el archivo `chat_template.jinja`.

## Capacidades

- Generacion de texto y razonamiento paso a paso: la model card verifica que el modelo resuelve correctamente un problema algebraico sencillo (`2x + 3 = 11`) preservando el razonamiento dentro de las etiquetas de pensamiento.
- Modo de razonamiento explicito basado en la plantilla de chat de Qwen3 con etiquetas `<think>`, lo que permite separar el proceso de razonamiento de la respuesta final.
- Inferencia local en Apple Silicon mediante MLX, con soporte en mlx-lm, oMLX, LM Studio y mlx-swift.
- Ejecucion con parametros de muestreo recomendados por el autor: temperatura 0,6, top-p 0,95 y top-k 20.
- Modelo exclusivamente de texto: la model card indica explicitamente "Text-only".
- No se documenta soporte de tool calling, function calling, capacidades de agente, vision, audio ni multilingueismo explicito en la informacion disponible.
- Capacidad de razonamiento matematico basico verificada empiricamente con un unico caso de prueba publicado por el autor.

## Casos de uso

- Asistente personal offline en un Mac: con 1,9 GB de pesos y un pico de memoria medido de 2,131 GB, el modelo puede mantener conversaciones locales sin conexion a internet ni envio de datos a terceros, lo que resulta adecuado para entornos con requisitos estrictos de privacidad.
- Desarrollo de aplicaciones nativas para macOS e iOS: al distribuirse en safetensors de mlx-lm, puede integrarse directamente en proyectos que usan mlx-swift para construir asistentes embebidos en aplicaciones de Apple sin capas de conversion intermedias.
- Validacion de razonamiento en pipelines automatizados: el formato con etiquetas `<think>` permite extraer y auditar la cadena de razonamiento de forma programatica, util para comprobar la coherencia de respuestas en tareas de tipo matematico o logico antes de aceptar la salida.
- Prototipado rapido y evaluacion de calidad frente a bpw: la familia incluye variantes 2B-oQ4e y 2B-oQ8e con mediciones publicadas (267,7 tok/s de prompt y 118,6 tok/s de generacion para la oQ4e frente a 122,2 y 97,5 tok/s para la oQ8e), lo que lo convierte en un banco de pruebas para estudiar el compromiso entre tamano, velocidad y calidad de la cuantizacion.
- Generacion de documentacion y resumenes en local: para tareas de procesamiento de texto donde el coste por token en la nube es relevante, un modelo de 2B en un Mac permite procesar volumenes moderados a coste marginal cero, con la advertencia de que la ventana de contexto no esta documentada.
- Chatbot interno desplegado en LM Studio: el autor indica que el modelo se puede buscar y descargar directamente desde LM Studio, lo que facilita su uso como asistente de escritorio para consultas tecnicas sin infraestructura adicional.
- Etiquetado y preprocesado de datos en Mac Studio: la velocidad de generacion medida (97,5 tok/s en M1 Max) hace viable su uso en tareas de anotacion o clasificacion por lotes de tamano pequeno y medio.
- Educacion y tutoria con razonamiento visible: al exponer el proceso paso a paso, resulta util en escenarios formativos donde interesa mostrar el razonamiento y no solo la respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye datos de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar. Lo que si se publica es el rendimiento medido en hardware concreto y el resultado de una prueba cualitativa.

Rendimiento medido el 23 de septiembre de 2026 en un M1-Max Mac Studio de 64 GB (prompt de prueba: "Q: If 2x + 3 = 11, what is x? Think step by step inside tags.", resultado correcto con x=4 preservado):

| Modelo | Prompt (tok/s) | Generacion (tok/s) | Pico de memoria (GB) |
|---|---|---|---|
| Qwen3.8-2B-Distill-oQ4e | 267,7 | 118,6 | 1,241 |
| Qwen3.8-2B-Distill-oQ8e (este modelo) | 122,2 | 97,5 | 2,131 |
| Qwen3.8-4B-Distill-oQ4e | 133,7 | 65,4 | 2,684 |
| Qwen3.8-4B-Distill-oQ8e | 130,9 | 48,4 | 4,651 |
| Qwen3.8-9B-Distill-oQ4e | 101,5 | 43,0 | 5,471 |
| Qwen3.8-9B-Distill-oQ5e | 91,3 | 37,1 | 6,555 |
| Qwen3.8-9B-Distill-oQ6e | 84,3 | 33,3 | 7,664 |
| Qwen3.8-9B-Distill-oQ8e | 91,8 | 28,7 | 9,679 |

Para este modelo en concreto, la medicion corresponde a una ejecucion con 37 tokens de prompt y 82 tokens generados. No se trata de una evaluacion de calidad estandarizada, sino de una unica prueba de razonamiento aritmetico acompanada de metricas de velocidad y memoria.

## Requisitos de hardware

- Pesos en disco: 1,9 GB para el artefacto oQ8e.
- Memoria en inferencia: pico medido de 2,131 GB en M1 Max; MLX utiliza memoria unificada, por lo que no se reserva VRAM dedicada como en CUDA.
- Cabe en GPU de consumo: cualquier equipo Apple Silicon con al menos 4 GB de memoria unificada disponible deberia poder cargarlo, dado el pico medido de poco mas de 2 GB. No hay datos publicados sobre ejecucion en GPUs NVIDIA o AMD, ya que el formato es nativo de MLX.
- Hardware de referencia de las mediciones: M1-Max Mac Studio con 64 GB de memoria unificada y GPU de 32 nucleos, macOS 27.0.
- Throughput medido: 122,2 tok/s en fase de prompt y 97,5 tok/s en generacion sobre el hardware de referencia.
- Opciones de despliegue: mlx-lm (libreria Python), oMLX, LM Studio y mlx-swift. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este artefacto concreto, al ser un formato MLX.
- Instalacion: `pip install mlx-lm`.
- Comando de generacion documentado por el autor: `mlx_lm.generate --model RolanDorisTech/Qwen3.8-2B-Distill-oQ8e-MLX-oQ8e --prompt "Explain oQ vs oQe" --max-tokens 250 --temp 0.6 --top-p 0.95 --top-k 20`.

## Comparativa con modelos similares

La comparativa mas directa disponible es con los otros miembros de la misma familia de cuantizacion, ya que la model card no ofrece comparaciones con modelos de otros proveedores.

| Modelo | Parametros | Tamano | Generacion (tok/s) en M1-Max | Pico de memoria | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-2B-Distill-oQ4e | ~2 B | 1,1 GB | 118,6 | 1,241 GB | apache-2.0 |
| Qwen3.8-2B-Distill-oQ8e (este) | ~2 B | 1,9 GB | 97,5 | 2,131 GB | apache-2.0 |
| Qwen3.8-4B-Distill-oQ4e | ~4 B | 2,3 GB | 65,4 | 2,684 GB | apache-2.0 |
| Qwen3.8-4B-Distill-oQ8e | ~4 B | 4,2 GB | 48,4 | 4,651 GB | apache-2.0 |
| Qwen3.8-9B-Distill-oQ8e | ~9 B | 8,9 GB | 28,7 | 9,679 GB | apache-2.0 |

El modelo base sin cuantizar (empero-ai/Qwen3.8-Distill en bfloat16) es la referencia de calidad, pero no se publican sus cifras de velocidad o memoria en la informacion disponible. La propia model card reconoce que la cuantizacion es con perdida (lossy) respecto a bfloat16, aunque afirma ser mas precisa que las cuantizaciones g32 y g64 planas. No se dispone de datos para comparar con alternativas de otros autores del mismo rango de parametros.

## Limitaciones y advertencias

- Modelo destilado de razonamiento: la propia model card advierte de que puede alucinar.
- Cuantizacion con perdida: el artefacto es lossy respecto al maestro en bfloat16. El autor sostiene que es mas preciso que las cuantizaciones planas g32 (5,003 bpw) y g64 (8,502 bpw), pero no aporta metricas de calidad que respalden esa afirmacion mas alla de un unico caso aritmetico.
- Solo texto: no admite entrada de imagen, audio ni otras modalidades.
- Longitud de contexto no documentada: no hay informacion publica sobre la ventana de contexto soportada, lo que supone un riesgo serio a la hora de dimensionar aplicaciones que dependan de contexto largo.
- Idiomas no documentados: no se especifica que idiomas soporta el modelo ni como se comporta fuera del ingles.
- Exclusivo de Apple Silicon: el formato es safetensors de MLX. Para desplegar en CUDA o en CPU convencional habria que recurrir al modelo base en GGUF o a una conversion propia.
- Inconsistencia en la model card: la lista de la familia incluye la entrada "8.9GB Qwen3.8-9B-Distill-oQ8e (this is Qwen3.8-2B-Distill-oQ8e at 1.9GB)", una descripcion contradictoria que mezcla el modelo de 9B con el de 2B. Conviene ignorar esa linea como referencia de especificaciones.
- Discrepancia en el identificador: el comando de uso del README referencia `RolanDorisTech/Qwen3.8-2B-Distill-oQ8e-MLX-oQ8e`, mientras que el identificador del repositorio es `RolanDorisTech/Qwen3.8-2B-Distill-MLX-oQ8e`. Es necesario verificar cual es el correcto antes de automatizar descargas.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de un modelo base de tercero conviene verificar las condiciones de dicho modelo base antes de un despliegue en produccion.
- Ausencia de datos de benchmarks estandarizados: no es posible estimar su calidad relativa en tareas como MMLU, HumanEval o GSM8K con la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RolanDorisTech/Qwen3.8-2B-Distill-MLX-oQ8e
- Modelo base declarado: empero-ai/Qwen3.8-Distill
- Modelo base en formato GGUF: empero-ai/Qwen3.8-2B-Distill-GGUF
- Canal del autor: https://www.youtube.com/@RolanDorisTech
- Libreria de inferencia: mlx-lm (instalable con `pip install mlx-lm`)
- Entorno de cuantizacion y despliegue mencionado: oMLX (panel de cuantizacion) y LM Studio
