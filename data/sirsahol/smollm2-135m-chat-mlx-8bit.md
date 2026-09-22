# SirSahOl/SmolLM2-135M-chat-mlx-8bit

## Resumen

SmolLM2-135M-chat-mlx-8bit es una conversion cuantizada a 8 bits del modelo HuggingFaceTB/SmolLM2-135M, realizada por el usuario SirSahOl y publicada en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una redistribucion en formato MLX (el framework de inferencia nativo de Apple Silicon) que conserva la arquitectura original LlamaForCausalLM con 134.515.008 parametros totales. El objetivo es permitir inferencia local en GPU integrada de los chips M1-M4 con una huella de memoria muy reducida: aproximadamente 202-225 MB segun la propia model card.

El modelo resuelve un problema muy concreto: ejecutar un LLM conversacional pequeno en portatiles Apple sin GPU dedicada, con un consumo de memoria que no compite con el resto del sistema. Segun los datos del autor, en un M1 con 8 GB de memoria unificada alcanza 200,75 tokens por segundo con un TTFT de 4,99 ms y un pico de memoria de 84,3 MB durante la generacion. La cuantizacion aplicada es de 8 bits con un promedio de 8,25 bits por peso, realizada con mlx-lm 0.31.3.

Su relevancia es fundamentalmente practica: es una de las muchas variantes de cuantizacion que la comunidad publica para SmolLM2, un modelo de 135M parametros disenado por Hugging Face para tareas de bajo coste computacional, edge computing y experimentacion rapida. La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parametros totales | 134.515.008 (135M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | 8 bits (promedio 8,25 bits por peso); existen variantes 4-bit y 16-bit del mismo autor |
| Idiomas soportados | en (ingles, segun los tags del repositorio); no se detallan mas idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (Apple Silicon) |
| Tamano en disco | ~157 MB segun la model card; 0,1 GB segun el repositorio |
| Huella de VRAM activa | ~202 MB (tabla comparativa) / ~225 MB (seccion de detalles); minimo recomendado 8 GB de memoria unificada |
| Libreria de inferencia | mlx / mlx-lm 0.31.3 |
| Modelo base | HuggingFaceTB/SmolLM2-135M |
| Fecha de conversion | 2026-09-22 (tiempo de conversion reportado: 1,46 s) |

## Arquitectura y entrenamiento

Este repositorio no documenta ningun entrenamiento propio. Se trata de una conversion de pesos: el modelo de partida es HuggingFaceTB/SmolLM2-135M, un transformer decoder-only de tipo LlamaForCausalLM con 135M de parametros y ventana de contexto de 8.192 tokens, y la operacion realizada ha sido una cuantizacion group-wise a 8 bits mediante `mlx_lm.convert -q --q-bits 8` con mlx-lm 0.31.3. El resultado se serializa en safetensors con el formato de pesos que MLX espera, de modo que la inferencia se ejecuta de forma nativa sobre la GPU integrada de los chips Apple Silicon.

No hay informacion en la model card sobre el dataset de entrenamiento, el volumen de tokens, la composicion de los datos ni sobre si el modelo base recibio RLHF, DPO u otra fase de alineamiento. El tag `arxiv:2502.02737` apunta al paper del modelo original SmolLM2, que es la fuente que habria que consultar para esos detalles. La unica innovacion tecnica atribuible a esta publicacion es la propia cuantizacion: 8 bits con un promedio de 8,25 bits por peso, que segun el autor busca una precision "casi sin perdida" manteniendo una huella extremadamente ligera. La model card advierte que la cuantizacion group-wise introduce una perdida de precision menor respecto a los pesos sin cuantizar, especialmente en derivaciones matematicas o razonamiento critico en precision (el texto disponible se corta en ese punto).

## Capacidades

- Generacion de texto autoregresiva en ingles, con plantilla de chat conversacional (`<|im_start|>` / `<|im_end|>` / `<|endoftext|>`).
- Conversacion multi-turno mediante `mlx_lm.chat` o `tokenizer.apply_chat_template` desde Python.
- Ejecucion de tareas simples de lenguaje: resumen, reescritura, respuestas cortas, generacion de poemas o textos breves segun los ejemplos de la model card.
- Inferencia local nativa en GPU de Apple Silicon, sin necesidad de GPU dedicada ni de servidores externos.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.
- No se documentan capacidades multilingues mas alla del tag `en`; el modelo base SmolLM2 esta orientado principalmente a ingles, pero este repositorio no aporta datos propios al respecto.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones de escritorio macOS: el modelo ocupa unos 200 MB, por lo que puede cargarse dentro de una app Electron o SwiftUI para respuestas locales sin llamadas a API externas.
- Autocompletado y generacion de texto en editores ligeros: con 200 tokens/s en un M1, la generacion de fragmentos cortos es practicamente instantanea, lo que permite integraciones interactivas en herramientas de escritura.
- Prototipado rapido de pipelines de NLP: sirve como modelo de sustitucion barato para validar un flujo completo (tokenizacion, plantilla de chat, decodificacion, stop tokens) antes de escalar a un modelo mayor.
- Clasificacion y etiquetado de texto sencillo en local: tareas de categorizacion, extraccion de campos o normalizacion de frases cortas que no requieren razonamiento profundo ni contexto largo.
- Educacion e investigacion sobre cuantizacion: al publicarse variantes de 4, 8 y 16 bits y las cifras medidas en M1, es un banco de pruebas util para estudiar el compromiso entre precision, velocidad y memoria en MLX.
- Generacion de respuestas en entornos sin conectividad o con requisitos de privacidad estrictos: todo el procesamiento ocurre en el dispositivo, sin enviar datos a terceros.
- Pruebas de despliegue en runtimes locales tipo LM Studio u Ollama usando los stop tokens documentados por el autor, para validar configuraciones de inferencia antes de pasar a modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente proporciona mediciones de rendimiento de inferencia en hardware Apple M1 con 8 GB de memoria unificada, promediadas sobre 5 ejecuciones con un maximo de 256 tokens generados:

| Metrica | 4-bit | 8-bit (este repositorio) | 16-bit |
|---|---|---|---|
| Tokens por segundo | 251,62 | 200,75 | 144,45 |
| TTFT | 3,98 ms | 4,99 ms | 6,93 ms |
| Pico de memoria | 150,3 MB | 84,3 MB | 235,2 MB |

Datos de huella y almacenamiento declarados por el autor:

| Variante | Tamano en disco | Huella de VRAM | Hardware objetivo |
|---|---|---|---|
| 4-bit MLX | ~84 MB | ~124 MB | M1/M2/M3/M4 con 8 GB+ |
| 8-bit MLX | ~157 MB | ~202 MB | M1/M2/M3/M4 con 8 GB+ |
| 16-bit MLX | ~290 MB | ~360 MB | M1/M2/M3/M4 con 8 GB+ |

Advertencia: los valores de pico de memoria de la tabla de rendimiento (84,3 MB para 8 bits) y los de la tabla de huella de VRAM (~202 MB) no son coherentes entre si y miden cosas distintas (memoria durante la generacion frente a huella total del modelo cargado). No hay benchmarks de calidad que permitan comparar la degradacion real introducida por la cuantizacion.

## Requisitos de hardware

- VRAM/huella de memoria: aproximadamente 202-225 MB para la variante de 8 bits; ~124 MB en 4 bits y ~360 MB en 16 bits.
- Memoria unificada minima recomendada por el autor: 8 GB.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). El formato MLX no es compatible con CUDA ni con GPU AMD/Intel.
- Si cabe en GPU de consumo: si, en cualquier Mac con chip de la serie M; no es ejecutable en RTX 4090, A100 ni H100 sin reconvertir el modelo a otro formato (por ejemplo GGUF o safetensors estandar) y perder la ventaja de MLX.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.generate` y `mlx_lm.chat`), API de Python `mlx_lm.load`/`generate`, y la guia de LM Studio incluida por el autor con stop tokens personalizados. La model card tambien incluye un Modelfile para Ollama, aunque el formato MLX es nativo de Apple y requeriria verificacion en ese runtime. Los tags del repositorio mencionan `text-generation-inference` y `endpoints_compatible`, pero no hay documentacion que respalde su uso con TGI.
- Latencia y throughput: 200,75 tokens/s y 4,99 ms de TTFT en M1 con 8 GB, con 256 tokens maximos en la prueba.

## Comparativa con modelos similares

La comparativa fiable se limita a las variantes publicadas por el mismo autor sobre el mismo modelo base. Los datos de modelos de terceros no aparecen en la informacion proporcionada, por lo que se marcan como no disponibles.

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| SmolLM2-135M-chat-mlx-8bit (este) | 135M | 8.192 | MLX safetensors | 8 bits | apache-2.0 | 200,75 tok/s, TTFT 4,99 ms (M1) |
| SmolLM2-135M-chat-mlx-4bit | 135M | 8.192 | MLX safetensors | 4 bits | apache-2.0 | 251,62 tok/s, TTFT 3,98 ms (M1) |
| SmolLM2-135M-chat-mlx-16bit | 135M | 8.192 | MLX safetensors | 16 bits (sin cuantizar) | apache-2.0 | 144,45 tok/s, TTFT 6,93 ms (M1) |
| HuggingFaceTB/SmolLM2-135M (modelo base) | 135M | 8.192 | safetensors | sin cuantizar | apache-2.0 | no disponible en esta ficha |
| Alternativas de tamano similar (Qwen2.5-0.5B, Llama-3.2-1B, TinyLlama-1.1B) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantizacion group-wise a 8 bits introduce una perdida de precision menor frente a los pesos sin cuantizar; el propio autor advierte que puede afectar a derivaciones matematicas o razonamiento critico en precision (el texto de la model card esta truncado en ese punto).
- Con 135M de parametros, la capacidad de razonamiento, la coherencia en conversaciones largas y la fidelidad factual son limitadas por diseno; es esperable un riesgo alto de alucinacion en tareas de conocimiento.
- El idioma documentado es unicamente el ingles; no hay datos sobre rendimiento en castellano ni en otros idiomas.
- Contexto de 8.192 tokens: suficiente para conversaciones cortas, insuficiente para analisis de documentos extensos o repositorios de codigo.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre manteniendo el aviso de licencia y sin garantias implicitas. No hay clausulas adicionales restrictivas, pero conviene verificar la licencia del modelo base original.
- Dependencia de hardware: al estar en formato MLX, solo funciona en Apple Silicon. No es desplegable en infraestructura CUDA ni en la mayoria de servicios cloud de GPU.
- El repositorio tiene un volumen de adopcion muy bajo (10 descargas y 0 likes en el momento de la consulta) y carece de validacion independiente; es una conversion de la comunidad, no una publicacion oficial de Hugging Face.
- Las instrucciones de despliegue incluyen configuraciones para LM Studio y Ollama, pero no hay evidencia publicada de que se hayan probado en esos runtimes; conviene validar los stop tokens antes de usarlas en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/SmolLM2-135M-chat-mlx-8bit
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Variante 4-bit: https://huggingface.co/SirSahOl/SmolLM2-135M-chat-mlx-4bit
- Variante 16-bit: https://huggingface.co/SirSahOl/SmolLM2-135M-chat-mlx-16bit
- Framework MLX (Apple): https://github.com/ml-explore/mlx
- Paper referenciado en los tags: arXiv:2502.02737
- Perfil del autor: https://huggingface.co/SirSahOl

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los enlaces listados proceden exclusivamente de la informacion del repositorio de HuggingFace.
