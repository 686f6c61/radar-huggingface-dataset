# alibayram/luciole-1b-compare-gguf

## Resumen

Luciole 1B compare GGUF es un repositorio de cuantizaciones en formato GGUF publicadas por el usuario alibayram a partir de Luciole-1B-Instruct-1.1, el modelo instructivo de 1.581 millones de parametros desarrollado por OpenLLM-France. El repositorio contiene dos variantes: el modelo base sin adaptador y la misma base con un adaptador LoRA (r16-v3-notes-lr25e6) fusionado, entrenado para planificar rutas de senderismo mediante el uso de herramientas. Ambas se distribuyen en cuantizacion Q8_0 y estan pensadas para ejecutarse en una instalacion estandar de Ollama con el runner de llama.cpp.

El interes del artefacto es doble. Por un lado, demuestra el flujo completo de conversion de pesos MLX de 8 bits a GGUF pasando por bf16, y documenta una limitacion concreta de la herramienta: llama.cpp no puede convertir el tokenizador de Luciole, por lo que los metadatos de tokenizador y arquitectura se copian del GGUF oficial de OpenLLM-France. Por otro, sirve como comparativa reproducible entre un modelo instructivo pequeno y su version ajustada con LoRA para una tarea de tool calling, con resultados declarados de 24 de 40 tareas resueltas frente a 0 de 40 del modelo sin adaptador, medidos sobre los pesos MLX originales y no sobre estos GGUF.

La relevancia actual reside en la ventana de ejecucion local: un modelo de 1.6 mil millones de parametros en Q8_0 ocupa aproximadamente 1.7 GB, lo que permite desplegar asistentes con soporte de herramientas en hardware de consumo y en entornos sin GPU dedicada, con licencia Apache 2.0 y soporte declarado de frances e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Luciole-1B-Instruct-1.1; metadatos copiados del GGUF oficial de OpenLLM-France) |
| Parametros totales | 1.581.453.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica incluida en el repositorio) |
| Idiomas soportados | frances, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros); pesos origen en MLX 8 bits y safetensors del adaptador LoRA |

## Arquitectura y entrenamiento

El modelo subyacente es Luciole-1B-Instruct-1.1, un transformer decoder-only de 1.581 millones de parametros afinado para instrucciones por OpenLLM-France. Sobre esa base, alibayram entreno un adaptador LoRA con rango 16 (checkpoint `r16-v3-notes-lr25e6`, paso 0002197) sobre los pesos MLX de 8 bits de `alibayram/Luciole-1B-Instruct-1.1-mlx-8bit`, con el objetivo de planificar rutas de senderismo invocando herramientas. El adaptador se entreno durante una epoca, segun se indica en la model card.

El proceso de publicacion es el elemento tecnico mas relevante. Para cada variante se parte de los pesos MLX de 8 bits, se fusiona o no el adaptador, se dequantiza a bf16 y se convierte a Q8_0 con llama.cpp (commit `9c003a97`). Como llama.cpp no puede convertir el tokenizador de Luciole, el tokenizador y los metadatos de arquitectura se copian del fichero `Luciole-1B-Instruct-1.1-Q8_0.gguf` de OpenLLM-France, lo que constituye una aproximacion, y `output.weight` se reemplaza por una copia exacta de la tabla de embeddings, igual que en ese fichero oficial. El script de construccion es `build_gguf.py`, alojado en el Space asociado.

Es importante subrayar que los resultados reportados no se midieron sobre estos GGUF: se obtuvieron con los pesos MLX de 8 bits y el tokenizador nativo de Luciole sobre una version parcheada de Ollama. La recuantizacion y el tokenizador aproximado alteran las salidas greedy a partir de unos pocos tokens, por lo que el comportamiento de estos ficheros puede diferir del reportado.

## Capacidades

- Generacion de texto conversacional en frances e ingles, con plantilla de chat instructiva.
- Uso de herramientas (tool calling / function calling), capacidad sobre la que se entreno especificamente el adaptador fusionado.
- Planificacion de tareas multi-paso orientada a itinerarios de senderismo: seleccion de herramientas, encadenamiento de llamadas y sintesis de resultados.
- Razonamiento basico y respuesta a instrucciones heredados del modelo Instruct 1.1 de OpenLLM-France.
- Ejecucion local en CPU o GPU de gama baja mediante llama.cpp u Ollama, gracias al tamano reducido y a la cuantizacion Q8_0.
- No se declaran capacidades de vision, audio, modo de razonamiento explicito ni contextos extendidos; no disponible en la informacion proporcionada.

## Casos de uso

- Planificacion de rutas de senderismo con herramientas: el adaptador se entreno para descomponer una peticion en llamadas a funciones (geocodificacion, calculo de distancias, consulta meteorologica) y componer un itinerario; es el escenario de referencia del repositorio y el unico con evaluacion declarada.
- Asistente conversacional local en frances: al ser un modelo de 1.6B en Q8_0 (unos 1.7 GB), puede desplegarse en un portatil sin GPU para tareas de atencion al usuario en entornos con requisitos de privacidad, siempre que el contexto requerido sea corto.
- Prototipado de pipelines de tool calling: sirve como banco de pruebas barato para validar plantillas de chat, prompts de sistema y definiciones de herramientas antes de migrar a modelos mayores, comparando directamente la variante con adaptador frente a la base.
- Evaluacion de tecnicas de ajuste eficiente: el par de ficheros (con y sin LoRA fusionado) permite medir el efecto de un adaptador r16 entrenado una epoca sobre una tarea concreta, con la salvedad de que las metricas originales se obtuvieron en MLX.
- Generacion de texto y resumenes breves en ingles y frances: util para tareas de clasificacion, extraccion o redaccion acotada en dispositivos con recursos limitados.
- Educacion e investigacion sobre cuantizacion: el repositorio documenta el flujo MLX a bf16 a GGUF Q8_0 y las limitaciones de llama.cpp con tokenizadores no soportados, lo que lo convierte en material didactico para quienes replican conversiones.
- Despliegue en entornos air-gapped: al ser un unico fichero GGUF con licencia Apache 2.0, puede instalarse en infraestructura aislada sin dependencias de servicios externos.

## Benchmarks y rendimiento

| Evaluacion | Modelo con adaptador | Modelo sin adaptador | Condiciones |
|---|---|---|---|
| Tareas de desarrollo resueltas | 24 de 40 | 0 de 40 | Pesos MLX 8 bits, tokenizador nativo de Luciole, Ollama parcheado |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores corresponden a una evaluacion propia del autor sobre 40 tareas de desarrollo y no fueron medidas sobre los ficheros GGUF de este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.7 GB para Q8_0, mas el espacio de contexto y las estructuras de KV cache.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; tarjetas como RTX 3050, RTX 4060, RTX 4090 o superiores pueden alojarlo con holgura. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: Ollama (escenario previsto por el autor, con el Modelfile del Space), llama.cpp, y cualquier runtime compatible con GGUF como LM Studio; vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. Al tratarse de Q8_0, la decodificacion es mas lenta que en cuantizaciones de 4 bits, pero el modelo es lo bastante pequeno para mantener velocidades interactivas en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Luciole-1B-compare GGUF (este) | 1.581 M | no disponible | fr, en | Apache 2.0 | GGUF Q8_0 |
| OpenLLM-France/Luciole-1B-Instruct-1.1 | 1.581 M | no disponible | fr, en | Apache 2.0 (segun este repo) | safetensors, GGUF Q8_0 oficial |
| alibayram/Luciole-1B-Instruct-1.1-mlx-8bit | 1.581 M | no disponible | fr, en | Apache 2.0 (segun este repo) | MLX 8 bits |

No se dispone de datos de rendimiento comparables entre estas variantes mas alla de la evaluacion de 40 tareas citada, y no se han proporcionado alternativas de otros desarrolladores en la informacion disponible.

## Limitaciones y advertencias

- Los resultados reportados (24 de 40 frente a 0 de 40) no se midieron sobre estos GGUF: la recuantizacion y el tokenizador aproximado modifican las salidas greedy tras unos pocos tokens.
- El tokenizador no es el nativo de Luciole: se copia del GGUF oficial de OpenLLM-France, lo que puede introducir discrepancias en la tokenizacion de entradas y en el comportamiento en produccion.
- El adaptador esta especializado en una unica tarea (planificacion de rutas de senderismo con herramientas); su ventaja no es necesariamente transferible a otros dominios de tool calling.
- Modelo de 1.581 millones de parametros: capacidad de razonamiento limitada, mayor propension a alucinaciones y menor robustez que modelos de mayor escala.
- Cobertura linguistica restringida a frances e ingles; el rendimiento en castellano no esta documentado.
- Longitud de contexto no declarada; no debe asumirse una ventana amplia para conversaciones multi-turno largas.
- Es imprescindible usar la plantilla de chat, el prompt de sistema y las secuencias de parada del `luciole-1b.Modelfile` del Space; omitirlos degrada la calidad de las respuestas.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion independiente de su funcionamiento.
- Aunque la licencia declarada es Apache 2.0, conviene verificar los terminos del modelo base y del adaptador antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alibayram/luciole-1b-compare-gguf
- Space de comparacion: https://huggingface.co/spaces/alibayram/luciole-1b-compare
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-1B-Instruct-1.1
- Pesos MLX de 8 bits: https://huggingface.co/alibayram/Luciole-1B-Instruct-1.1-mlx-8bit
- Repositorio del adaptador: https://huggingface.co/alibayram/luciole-1b-distill-v2
- GGUF oficial de referencia: https://huggingface.co/OpenLLM-France/Luciole-1B-Instruct-1.1-Q8_0.gguf
