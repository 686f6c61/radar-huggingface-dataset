# SirSahOl/eai-distill-0.5b-chat-mlx-4bit

## Resumen

eai-distill-0.5b-chat-mlx-4bit es una conversion a 4 bits del modelo Enterprise-AI/eai-distill-0.5b, realizada por el usuario SirSahOl y publicada en formato MLX, el framework de inferencia nativo de Apple Silicon. No se trata de un modelo entrenado desde cero, sino de una cuantizacion de tercera parte: el autor original del modelo base es Enterprise-AI, mientras que esta version se limita a convertir los pesos y a optimizarlos para ejecucion en la GPU unificada de los chips M1, M2, M3 y M4.

Arquitectura y tamano: se trata de un transformer decoder-only de la familia Qwen2 (Qwen2ForCausalLM), con 630.167.424 parametros reales segun los pesos safetensors del repositorio, aunque la model card lo comercializa como "0.5B". La longitud de contexto declarada es de 32.768 tokens, un valor notablemente alto para un modelo de este tamano. La cuantizacion es de 4 bits con una media de 4,50 bits por peso, lo que deja el repositorio en unos 0,4 GB y la huella de VRAM activa en torno a 338 MB.

Relevancia: su interes practico es acotado pero claro. Al ocupar apenas unos cientos de megabytes y alcanzar velocidades de decodificacion estimadas de entre 160 y 448 tokens por segundo en funcion del chip, es un candidato para inferencia local de bajisima latencia, agentes en bucle, enrutado de peticiones o pruebas de integracion en portatiles Apple. Ahora bien, la ficha debe leerse con cautela: la licencia figura como "unknown", no se declaran idiomas soportados, no hay benchmarks de calidad publicados y los datos de rendimiento de la model card son proyecciones teoricas, no mediciones reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 630.167.424 (segun los pesos safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 4-bit (media de 4,50 bits por peso); el mismo autor publica variantes de 8-bit y 16-bit |
| Idiomas soportados | no disponible |
| Licencia | unknown (no especificada) |
| Formato de pesos | safetensors en formato MLX (Apple Silicon); no incluye GGUF |
| Modelo base | Enterprise-AI/eai-distill-0.5b (relacion: quantized) |
| Biblioteca de inferencia | mlx-lm (version declarada en la conversion: 0.31.3) |
| Tamano del repositorio | 0,4 GB (variante 4-bit: ~285 MB en disco) |
| Huella de VRAM activa | ~338 MB (memoria unificada minima recomendada: 8 GB) |
| Licencia de uso comercial | no disponible |

## Arquitectura y entrenamiento

La unica informacion tecnica aportada por el autor de la conversion es que el modelo base emplea la arquitectura Qwen2ForCausalLM, es decir, un transformer decoder-only con atencion causal, y que el resultado es una cuantizacion a 4 bits con una media de 4,50 bits por peso. No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste por instrucciones, RLHF o DPO. Tampoco se documenta el metodo de destilacion que sugiere el nombre "eai-distill" del modelo base.

No hay ninguna innovacion tecnica propia de esta ficha: el trabajo realizado consiste en la conversion de pesos al formato MLX y su cuantizacion, no en cambios de arquitectura. Se desconocen igualmente si el modelo base fue destilado a partir de un modelo mayor, que profesor se utilizo o que datos de calibracion se emplearon durante la cuantizacion, un factor que afecta directamente a la degradacion de calidad en modelos pequenos.

## Capacidades

- Generacion de texto conversacional: el repositorio incluye plantilla de chat con roles system, user y assistant, y la biblioteca mlx-lm permite invocarla mediante `tokenizer.apply_chat_template`.
- Generacion de texto generica: la model card documenta ejemplos de uso mediante `mlx_lm.generate` con prompts libres.
- Procesamiento de contexto largo: la ventana declarada de 32.768 tokens permite manejar documentos extensos o historiales de conversacion largos, aunque no hay evidencia publicada sobre como rinde el modelo en el extremo superior de esa ventana.
- Inferencia local en Apple Silicon: ejecucion nativa en la GPU unificada de los chips M1, M2, M3 y M4 mediante MLX.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no documenta ninguna capacidad especifica de agentes, y su tamano lo hace poco adecuado para planificacion compleja.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidad de vision o audio: no disponible; el pipeline es exclusivamente text-generation.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Control de parada: la model card especifica los tokens de parada `<|im_start|>`, `<|im_end|>` y `<|endoftext|>`, necesarios para evitar bucles infinitos en tiempo de ejecucion.

## Casos de uso

- Asistentes locales en portatiles Apple Silicon: con una huella de ~338 MB y memoria unificada minima de 8 GB, el modelo puede ejecutarse en segundo plano mientras el usuario trabaja con un IDE o un navegador, sin presion apreciable de memoria. Es adecuado para asistentes sencillos de proposito acotado, no para razonamiento abierto.
- Enrutado y clasificacion de consultas en pipelines multi-modelo: por su baja latencia de primer token (estimada en 1-15 ms), puede actuar como clasificador previo que decida si una peticion debe ir a un modelo mayor. El ahorro de coste y latencia es significativo cuando la mayoria de peticiones son simples.
- Generacion masiva de texto de baja criticidad: etiquetado, reformulacion, generacion de titulares, plantillas de respuesta o resumenes breves en grandes volumenes, donde el coste por token importa mas que la calidad pico.
- Procesamiento de documentos largos en local: gracias a la ventana de 32.768 tokens puede resumir o extraer campos de documentos extensos sin salir del ordenador del usuario, algo relevante en escenarios con datos sensibles que no deben enviarse a la nube.
- Pruebas de integracion y desarrollo de infraestructura de inferencia: es util como modelo de pruebas para validar pipelines de MLX, plantillas de chat, tokens de parada y bucle de agentes antes de escalar a modelos mayores, por su bajo coste de carga y su velocidad de decodificacion.
- Aplicaciones embebidas en macOS o iOS con MLX Swift: al estar en formato MLX, puede integrarse en aplicaciones nativas del ecosistema Apple para funciones de generacion de texto offline, sin dependencias de red.
- Evaluacion comparativa de cuantizaciones: el mismo autor publica variantes de 8 y 16 bits, de modo que el modelo sirve como banco de pruebas para medir la degradacion de perplexidad entre precisiones sobre un mismo modelo base.
- Autocompletado de codigo muy basico: solo tiene sentido en escenarios de sugerencias triviales y con supervision humana; su tamano no permite garantizar correccion sintactica o semantica en codigo no trivial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplexidad ni ninguna otra metrica de calidad, ni para la version de 4 bits ni para las de 8 y 16 bits.

Lo unico aportado son proyecciones de rendimiento en hardware Apple Silicon, que el propio autor etiqueta como estimaciones basadas en la saturacion del ancho de banda de memoria para pesos de 4 bits:

| Nivel de Apple Silicon | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado | Uso recomendado segun el autor |
|---|---|---|---|---|---|
| M1 / M2 / M3 / M4 (base) | 8 GB | ~338 MB | ~160 tokens/s | ~15 ms | Inferencia local de baja latencia y asistentes embebidos |
| M1 / M2 / M3 / M4 Pro | 18-36 GB | ~338 MB | ~240 tokens/s | ~10 ms | Procesamiento concurrente y bucles de agentes en tiempo real |
| M1 / M2 / M3 / M4 Max | 36-128 GB | ~338 MB | ~336 tokens/s | ~8 ms | Maxima velocidad de decodificacion en un solo flujo |
| M1 / M2 / M3 / M4 Ultra | 64-192 GB | ~338 MB | ~448 tokens/s | ~1 ms | Evaluacion por lotes en paralelo y servicio de alto rendimiento |

Nota: estas cifras son proyecciones declaradas por el autor, no mediciones reproducibles, y "las velocidades reales varian segun la longitud del prompt" segun la propia model card. No deben citarse como rendimiento verificado.

## Requisitos de hardware

- VRAM estimada para inferencia: ~338 MB de memoria unificada activa en la variante de 4 bits, con un minimo recomendado de 8 GB de memoria unificada por el autor.
- Tamano en disco: ~285 MB para la variante de 4 bits; ~540 MB para la de 8 bits y ~1020 MB para la de 16 bits.
- GPU recomendadas: el modelo esta pensado exclusivamente para Apple Silicon (M1, M2, M3, M4 en sus variantes base, Pro, Max y Ultra). No es un formato para GPU NVIDIA o AMD: al ser pesos MLX, no se puede cargar directamente con CUDA.
- Cabe en GPU de consumo: si, en cualquier Mac con chip de la serie M y al menos 8 GB de memoria unificada. No aplica a tarjetas graficas de consumo tipo RTX 4090, porque el formato no es compatible.
- Opciones de despliegue: mlx-lm (CLI `mlx_lm.chat` y `mlx_lm.generate`, mas API de Python) es la via soportada de forma nativa. La model card incluye ademas un Modelfile de ejemplo para Ollama, si bien hay que tener en cuenta que Ollama trabaja habitualmente con GGUF y esta conversion no publica pesos GGUF, por lo que ese quickstart puede no funcionar tal cual. No se documenta soporte para vLLM, TGI ni llama.cpp.
- Latencia y throughput: segun las proyecciones del autor, entre 160 y 448 tokens por segundo de decodificacion y entre 1 y 15 ms de time-to-first-token segun el chip. No hay mediciones independientes ni datos de throughput en lote.
- Requisitos de software: `pip install mlx-lm`; la conversion se realizo con mlx-lm 0.31.3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Rendimiento publicado |
|---|---|---|---|---|---|
| SirSahOl/eai-distill-0.5b-chat-mlx-4bit | 630 M | 32.768 tokens | unknown | safetensors MLX (4-bit) | No disponible |
| Enterprise-AI/eai-distill-0.5b (modelo base) | no disponible | no disponible | no disponible | no disponible | No disponible |
| Qwen2.5-0.5B-Instruct | ~494 M | 32.768 tokens | Apache-2.0 | safetensors, GGUF | Si, publicado por el autor del modelo |
| SmolLM2-360M-Instruct | 362 M | 8.192 tokens | Apache-2.0 | safetensors, GGUF | Si, publicado por el autor del modelo |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 tokens | Apache-2.0 | safetensors, GGUF | Si, publicado por el autor del modelo |

Las filas de Qwen2.5-0.5B-Instruct, SmolLM2-360M-Instruct y TinyLlama-1.1B-Chat corresponden a datos publicos de sus respectivas model cards y se incluyen solo como referencia de categoria (modelos pequenos para inferencia local); no se han verificado en esta ficha. El comparable mas directo por arquitectura y ventana de contexto es Qwen2.5-0.5B-Instruct, ya que el modelo aqui descrito usa la arquitectura Qwen2. La diferencia principal no esta en las capacidades, sino en la licencia: las alternativas son Apache-2.0 con terminos claros, mientras que esta conversion declara licencia desconocida.

## Limitaciones y advertencias

- Licencia desconocida: el campo license figura como "unknown" tanto en los metadatos de HuggingFace como en la model card. Esto imposibilita determinar si el uso comercial esta permitido y convierte al modelo en no apto para produccion sin una aclaracion previa del autor o del titular de los derechos del modelo base.
- Riesgo elevado de alucinacion: con 630 millones de parametros y sin datos de entrenamiento publicados, la fiabilidad factual es limitada. No debe usarse para tareas donde un error tenga consecuencias relevantes.
- Perdida de calidad por cuantizacion: los pesos estan cuantizados a 4 bits con una media de 4,50 bits por peso. En modelos de este tamano la degradacion respecto a 8 o 16 bits puede ser apreciable; el propio autor recomienda 8 bits para razonamiento y precision de codigo.
- Idiomas no declarados: no hay lista de idiomas soportados. El rendimiento en castellano es una incognita y requiere evaluacion propia antes de cualquier despliegue.
- Sin benchmarks de calidad: no hay MMLU, HumanEval, GSM8K ni perplexidad publicados, ni para esta variante ni para el modelo base. Cualquier afirmacion de calidad carece de respaldo.
- Riesgo de bucles de generacion: la model card advierte explicitamente de la necesidad de configurar los tokens de parada `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` para evitar bucles descontrolados. Omitirlos produce salidas degeneradas.
- Conversion de tercera parte: el modelo no lo ha publicado el autor original del modelo base, sino un tercero. No hay garantia de fidelidad de la conversion ni de que se hayan seguido las mejores practicas de calibracion.
- Compatibilidad limitada: al estar en formato MLX, solo se ejecuta en Apple Silicon. No hay pesos GGUF publicados, por lo que el quickstart de Ollama incluido en la model card puede no ser funcional en instalaciones estandar.
- Adopcion testimonial: 16 descargas y 0 "me gusta" en el momento de redactar esta ficha. No hay comunidad, issues ni validacion externa que permitan confiar en la conversion.
- Fechas incoherentes: los metadatos indican creacion el 2026-09-22, una fecha que conviene verificar antes de citar el modelo.
- Ventana de contexto nominal frente a efectiva: aunque se declaran 32.768 tokens, no hay evidencia de que el modelo mantenga coherencia en contextos muy largos, algo que en modelos pequenos suele degradarse antes del limite teorico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/eai-distill-0.5b-chat-mlx-4bit
- Modelo base: https://huggingface.co/Enterprise-AI/eai-distill-0.5b
- Variante de 8 bits: https://huggingface.co/SirSahOl/eai-distill-0.5b-chat-mlx-8bit
- Variante de 16 bits: https://huggingface.co/SirSahOl/eai-distill-0.5b-chat-mlx-16bit
- Perfil del autor de la conversion: https://huggingface.co/SirSahOl
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Nota: la busqueda web asociada a esta ficha no devolvio ningun resultado relevante sobre el modelo. Los unicos resultados obtenidos fueron paginas del portal de admisiones de la Badr University in Cairo, sin relacion alguna con el modelo. No se han localizado papers, blogs tecnicos ni demos adicionales.
