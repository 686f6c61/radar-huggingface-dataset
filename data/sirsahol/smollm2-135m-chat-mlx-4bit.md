# SirSahOl/SmolLM2-135M-chat-mlx-4bit

## Resumen

SmolLM2-135M-chat-mlx-4bit es una conversión cuantizada a 4 bits del modelo HuggingFaceTB/SmolLM2-135M, publicada por el usuario SirSahOl, en formato MLX nativo de Apple Silicon. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el autor toma los pesos originales de SmolLM2-135M y los convierte con mlx-lm 0.31.3 para que se ejecuten sobre la GPU unificada de los chips M1, M2, M3 y M4 mediante el framework MLX de Apple.

El problema que resuelve es la huella de memoria. Con 134.515.008 parámetros reales y una media de 4,50 bits por peso, el repositorio ocupa unos 84 MB en disco y deja la huella de VRAM activa en torno a 124 MB, lo que permite ejecutar el modelo en cualquier Mac con 8 GB de memoria unificada sin desplazar al resto de aplicaciones. El contexto declarado es de 8.192 tokens, suficiente para conversaciones de varios turnos o documentos cortos.

Su relevancia es fundamentalmente práctica: es una de las vías más baratas para probar pipelines de inferencia local en macOS, validar plantillas de chat y hacer prototipado offline sin GPU dedicada. Conviene tener presente que la calidad de razonamiento está acotada por el tamano del modelo base (135M), por lo que encaja en tareas de baja complejidad y no como sustituto de modelos de varios miles de millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parametros totales | 134.515.008 (≈135M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | 4-bit group-wise (media 4,50 bits por peso); el autor publica tambien variantes de 8-bit y 16-bit en repositorios separados |
| Idiomas soportados | no disponible; el tag del repositorio indica `en` y el autor no publica lista de idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only causal con la clase LlamaForCausalLM, tal y como declara el autor en la model card. No hay innovaciones arquitectonicas propias de esta conversion: el trabajo realizado es exclusivamente de cuantizacion y empaquetado. La conversion se ejecuto con mlx-lm 0.31.3 mediante `mlx_lm.convert` con `--q-bits 4`, en 2,37 segundos, generando una salida de 75,7 MB (el repositorio completo ocupa 0,1 GB).

No se dispone de informacion sobre el entrenamiento del modelo base en la documentacion proporcionada: ni numero de tokens, ni composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste instructivo. El tag `arxiv:2502.02737` apunta al articulo asociado a la familia SmolLM2, que es la referencia a consultar para los detalles de preentrenamiento. La unica transformacion documentada sobre los pesos es la cuantizacion group-wise a 4 bits, que introduce una perdida de precision menor respecto a los pesos sin cuantizar, segun reconoce el propio autor en la seccion de limitaciones.

## Capacidades

- Generacion de texto autoregresiva en ingles, con plantilla de chat conversacional (`<|im_start|>` / `<|im_end|>`) aplicable mediante `tokenizer.apply_chat_template`.
- Conversacion multi-turno basica: el autor documenta el uso de `mlx_lm.chat` para dialogo interactivo y ejemplos con historial de mensajes.
- Generacion de texto corto y creativo a partir de un prompt (el ejemplo oficial pide un poema breve sobre inteligencia artificial).
- Ejecucion de inferencia en GPU de Apple Silicon mediante MLX, con soporte de decodificacion token a token y metricas de TTFT.
- Integracion en runtimes locales: la model card incluye instrucciones para LM Studio (configuracion de stop tokens) y Ollama (Modelfile con `temperature 0.7`).
- Compatibilidad declarada con `transformers` y con `text-generation-inference` a traves de los tags del repositorio, si bien el formato de pesos es especifico de MLX.
- Capacidades de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Prototipado de aplicaciones de chat en macOS: al ocupar unos 124 MB de VRAM activa, el modelo se puede cargar y descargar en milisegundos dentro de un bucle de desarrollo, lo que permite iterar sobre la plantilla de prompt y el formateo de turnos sin esperar a un modelo grande.
- Validacion de pipelines de inferencia MLX: sirve como modelo de humo para comprobar que `mlx-lm`, LM Studio u Ollama estan bien configurados (stop tokens, temperatura, plantilla de chat) antes de desplegar variantes de mayor tamano.
- Generacion de texto de baja criticidad totalmente offline: borradores de descripciones cortas, textos de relleno para maquetas, variaciones de titulares o ejemplos sinteticos para pruebas de interfaz, sin enviar datos a ningun servicio externo.
- Asistente embebido en herramientas de escritorio: un editor, una utilidad de notas o un script de automatizacion pueden incorporar el modelo para autocompletar frases cortas o reformular una linea de texto con una latencia de TTFT de 3,98 ms medida en M1.
- Filtrado y preetiquetado de datos a gran escala: con 251,62 tokens/s en 4 bits sobre M1, el modelo puede clasificar o reescribir grandes volumenes de texto corto en local como primera pasada, reservando un modelo mayor para la revision.
- Demostraciones y material docente: es un ejemplo compacto para explicar cuantizacion, formatos de pesos MLX y plantillas de chat en un aula o taller, ya que el repositorio completo cabe en 84 MB y la conversion es reproducible con un solo comando.
- Pruebas de fine-tuning ligero: al ser un modelo de 135M con licencia apache-2.0 y safetensors, es viable experimentar con LoRA o ajuste completo en un Mac con memoria unificada, usando la version de 4 bits o la de 16 bits como punto de partida.

## Benchmarks y rendimiento

El autor publica mediciones de rendimiento de inferencia, no de calidad. Se obtuvieron en un Apple M1 con 8 GB de memoria unificada, promediando 5 ejecuciones con un maximo de 256 tokens generados.

| Metrica | 4-bit (este repositorio) | 8-bit | 16-bit |
|---|---|---|---|
| Tokens por segundo | 251,62 | 200,75 | 144,45 |
| TTFT | 3,98 ms | 4,99 ms | 6,93 ms |
| Memoria pico | 150,3 MB | 84,3 MB | 235,2 MB |

Respecto a la huella de memoria en reposo, la model card ofrece dos cifras para esta variante: aproximadamente 128 MB de VRAM activa en un punto y unos 124 MB en la tabla comparativa de cuantizaciones. El tamano en disco declarado es de unos 84 MB (75,7 MB de salida de conversion), con un minimo recomendado de 8 GB de memoria unificada.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 124-150 MB para la variante de 4 bits; aproximadamente 202 MB para la de 8 bits; aproximadamente 360 MB para la de 16 bits.
- Memoria unificada minima recomendada: 8 GB (Mac con chip M1, M2, M3 o M4). Las variantes de 8 y 16 bits tambien caben en equipos de 8 GB segun la tabla del autor.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No se documenta soporte para GPU NVIDIA ni AMD.
- GPU de consumo: cabe en cualquier Mac con memoria unificada de 8 GB o superior; no aplica a tarjetas graficas discretas por el formato MLX.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.chat` y `mlx_lm.generate`, mas API de Python), LM Studio y Ollama mediante Modelfile. Los tags del repositorio declaran compatibilidad con `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput medidos: 251,62 tokens/s y 3,98 ms de TTFT en 4 bits sobre Apple M1; 200,75 tokens/s y 4,99 ms en 8 bits; 144,45 tokens/s y 6,93 ms en 16 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Rendimiento | Licencia |
|---|---|---|---|---|---|
| SirSahOl/SmolLM2-135M-chat-mlx-4bit | 134.515.008 | 8.192 tokens | MLX safetensors, 4-bit | 251,62 tok/s, TTFT 3,98 ms (M1) | apache-2.0 |
| SirSahOl/SmolLM2-135M-chat-mlx-8bit | 135M (aproximado) | no disponible en la informacion proporcionada | MLX safetensors, 8-bit | 200,75 tok/s, TTFT 4,99 ms (M1) | apache-2.0 |
| SirSahOl/SmolLM2-135M-chat-mlx-16bit | 135M (aproximado) | no disponible en la informacion proporcionada | MLX safetensors, 16-bit | 144,45 tok/s, TTFT 6,93 ms (M1) | apache-2.0 |
| HuggingFaceTB/SmolLM2-135M (modelo base) | 135M | no disponible en la informacion proporcionada | safetensors, sin cuantizar | no disponible | apache-2.0 |

El autor no publica comparaciones con modelos de otros desarrolladores. Para alternativas de la misma categoria (por ejemplo otros modelos de la familia SmolLM2 de mayor tamano o modelos de ~0,5B de otros autores) no hay datos de rendimiento ni especificaciones en la informacion disponible.

## Limitaciones y advertencias

- La seccion de limitaciones de la model card esta truncada en la informacion disponible; el unico punto recogido es que la cuantizacion group-wise a 4 bits introduce una perdida de precision menor frente a pesos sin cuantizar, relevante en derivaciones matematicas o tareas sensibles a la precision.
- El tamano del modelo base es de 135M parametros, por lo que su capacidad de razonamiento, coherencia en respuestas largas y conocimiento factual es muy limitada en comparacion con modelos de miles de millones de parametros. El riesgo de alucinacion en preguntas factuales es alto.
- No se han publicado evaluaciones de calidad (MMLU, HumanEval, GSM8K), por lo que no hay evidencia cuantitativa de su comportamiento mas alla de las pruebas de velocidad del autor.
- Idiomas: el tag del repositorio indica ingles y el autor no detalla cobertura multilingue; no hay garantias de calidad en castellano u otros idiomas.
- Formato propietario de Apple: los pesos estan en formato MLX, por lo que no se ejecutan directamente en CUDA ni en entornos x86 sin una conversion adicional a otro formato (por ejemplo GGUF o safetensors estandar).
- Aunque los tags declaran compatibilidad con `text-generation-inference` y `deploy:azure`, el formato MLX es especifico de Apple Silicon; conviene verificar esa compatibilidad antes de planificar un despliegue en servidores con GPU NVIDIA.
- Es necesario configurar los stop tokens (`<|im_start|>`, `<|im_end|>`, `<|endoftext|>`) en el runtime local; el autor advierte explicitamente de que sin ellos pueden producirse bucles descontrolados.
- Repositorio con muy baja adopcion en el momento de la consulta (10 descargas, 0 likes) y mantenido por un particular, no por el equipo de HuggingFaceTB. No hay garantia de mantenimiento, actualizaciones ni soporte.
- La ficha mezcla cifras de memoria pico poco intuitivas: la variante de 8 bits reporta 84,3 MB de pico frente a 150,3 MB de la de 4 bits, cuando lo esperable seria lo contrario. Se recomienda medir el consumo real en el equipo objetivo antes de dimensionar recursos.
- Licencia apache-2.0, que permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se cumplan las condiciones del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/SmolLM2-135M-chat-mlx-4bit
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Variante 8-bit del mismo autor: https://huggingface.co/SirSahOl/SmolLM2-135M-chat-mlx-8bit
- Variante 16-bit del mismo autor: https://huggingface.co/SirSahOl/SmolLM2-135M-chat-mlx-16bit
- Perfil del autor: https://huggingface.co/SirSahOl
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Articulo referenciado en los tags (arxiv:2502.02737): https://arxiv.org/abs/2502.02737
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente resultados no relacionados con el ambito de la inteligencia artificial.
