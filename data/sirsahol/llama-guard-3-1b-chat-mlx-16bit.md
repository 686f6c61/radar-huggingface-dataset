# SirSahOl/Llama-Guard-3-1B-chat-mlx-16bit

## Resumen

SirSahOl/Llama-Guard-3-1B-chat-mlx-16bit es una conversión a formato MLX de 16 bits (bfloat16 sin cuantizar) del modelo meta-llama/Llama-Guard-3-1B, publicada por el usuario SirSahOl. No se trata de un entrenamiento nuevo ni de un ajuste fino, sino de un reempaquetado de los pesos originales para que puedan ejecutarse de forma nativa sobre la GPU unificada de los chips Apple Silicon mediante el framework MLX de Apple. El repositorio incluye los pesos en safetensors, la plantilla de chat y guías de despliegue para mlx-lm, LM Studio y Ollama.

El modelo base pertenece a la familia Llama Guard 3 de Meta, construida sobre Llama 3.2 1B, y está orientada a tareas de clasificación y moderación de contenido (etiquetas de seguro/no seguro). El autor, sin embargo, documenta el repositorio como un modelo conversacional de generación de texto con ejemplos de chat genérico, lo que constituye una discrepancia relevante que se detalla en la sección de limitaciones.

Con 1.498.482.688 parámetros reales según los tensores de safetensors (la model card declara 1.0 B), una ventana de contexto declarada de 131.072 tokens y un peso en disco de aproximadamente 2,8-3,0 GB, la relevancia de esta ficha radica en su utilidad como referencia de precisión completa en Mac y como punto de partida para despliegues locales sin conexión, no como alternativa a modelos conversacionales de gran tamaño. La licencia es llama3.2 y el repositorio acumula 247 descargas y 0 me gusta desde su creación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only denso) |
| Parametros totales | 1.498.482.688 (~1,5 B) segun los tensores safetensors; la model card declara 1,0 B |
| Longitud de contexto | 131.072 tokens (segun la model card del autor) |
| Tipos de cuantizacion | 16 bits (bfloat16 sin cuantizar, 16,00 bits por peso en promedio); el autor publica variantes de 4 bits y 8 bits por separado |
| Idiomas soportados | Etiquetas del repositorio: en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.2 |
| Formato de pesos | safetensors en formato MLX (framework mlx) |
| Framework de ejecucion | MLX (Apple), con mlx-lm como libreria recomendada |
| Tamano del repositorio | 3,0 GB |
| Huella de VRAM activa | ~2,6 GB declarados por el autor; ~2,8 GB de peso en disco |
| Memoria unificada minima recomendada | 8 GB |
| Modelo base | meta-llama/Llama-Guard-3-1B |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de tipo LlamaForCausalLM, sin mezcla de expertos ni mecanismos de estado recurrente. El repositorio no documenta ningún proceso de entrenamiento, ajuste fino, RLHF o DPO: se trata exclusivamente de una conversión de precisión completa de los pesos del modelo base al formato MLX, manteniendo bfloat16 sin cuantizar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineamiento aplicadas al modelo original; esos datos corresponden a la model card de Meta y no están incluidos en la información analizada.

La innovación técnica del repositorio es de empaquetado y despliegue, no de modelado: adapta los pesos para aprovechar la memoria unificada de Apple Silicon mediante MLX, un framework con evaluación perezosa y grafos optimizados para GPU unificada. La model card incluye además una plantilla de chat con tokens especiales `<|im_start|>` y `<|im_end|>`, instrucciones de parada para runtimes locales y un Modelfile de ejemplo para Ollama, lo que permite integrarlo en herramientas de inferencia local con relativa facilidad. Las referencias arXiv incluidas en las etiquetas (2404.12241, 2312.06674, 2204.05862, 2308.01263, 2403.03853) apuntan a los artículos asociados a la familia Llama, pero no se describe su contenido en el repositorio.

## Capacidades

- Generacion de texto autoregresiva y conversacion multiturno mediante plantilla de chat con roles system, user y assistant.
- Clasificacion y moderacion de contenido: al derivar de Llama Guard 3, el modelo base esta disenado para emitir juicios de seguridad sobre entradas y salidas, aunque el repositorio no documenta ni ejemplifica ese uso.
- Cobertura multilingue segun las etiquetas del repositorio: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Ventana de contexto larga declarada de 131.072 tokens, adecuada para documentos extensos o conversaciones prolongadas.
- Inferencia local en Apple Silicon sin conexion a red, con pesos en formato MLX nativo.
- Ejecucion mediante CLI y API de Python a traves de mlx-lm, ademas de soporte declarado para LM Studio y Ollama.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso explicito: no disponibles.
- Vision, audio o modo de razonamiento extendido (thinking mode): no disponibles.

## Casos de uso

- Moderacion de contenido en aplicaciones de chat: dado que el modelo base es un clasificador de seguridad de la familia Llama Guard 3, puede emplearse para etiquetar entradas de usuario y respuestas del sistema como seguras o no seguras antes de mostrarlas, con la salvedad de que el repositorio no documenta esta funcionalidad ni incluye ejemplos de uso.
- Despliegue local en Mac sin conexion: con ~2,6 GB de huella de VRAM y un minimo de 8 GB de memoria unificada, permite ejecutar inferencia completamente offline en portatiles Apple Silicon, util en entornos con requisitos de confidencialidad de datos.
- Referencia de evaluacion de precision completa: la variante de 16 bits sirve como linea base contra la que medir la degradacion de las versiones de 4 y 8 bits del mismo autor en tareas concretas del dominio propio.
- Prototipado rapido de interfaces conversacionales: la plantilla de chat con `<|im_start|>` y `<|im_end|>` permite integrar el modelo en prototipos de asistente mediante la API de Python de mlx-lm en pocas lineas de codigo.
- Filtrado previo en pipelines de generacion aumentada por recuperacion (RAG): el modelo puede actuar como primera barrera para descartar consultas o documentos problematicos antes de pasarlos a un modelo mayor, reduciendo coste y latencia en el camino critico.
- Servicio de baja concurrencia en estaciones de trabajo Mac Ultra: segun las proyecciones del autor, un chip Ultra alcanza unos 240 tokens/s, lo que permite atender peticiones concurrentes de moderacion o extraccion de texto en un equipo de sobremesa.
- Clasificacion multilingue ligera: las etiquetas del repositorio cubren ocho idiomas, lo que habilita tareas de cribado linguistico en espanol, portugues, frances, aleman, italiano, hindi, tailandes e ingles sin necesidad de infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente proporciona proyecciones de rendimiento en inferencia para hardware Apple Silicon, que se reproducen a continuacion y deben interpretarse como estimaciones basadas en ancho de banda de memoria, no como mediciones publicadas.

| Nivel de Apple Silicon | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado | Uso recomendado por el autor |
|---|---|---|---|---|---|
| M1 / M2 / M3 / M4 (Base) | 8 GB | ~2,6 GB | ~80 tokens/s | ~31 ms | Asistente interactivo diario y autocompletado local |
| M1 / M2 / M3 / M4 Pro | 18 GB - 36 GB | ~2,6 GB | ~120 tokens/s | ~21 ms | Uso diario equilibrado para codigo y chat multiturno |
| M1 / M2 / M3 / M4 Max | 36 GB - 128 GB | ~2,6 GB | ~172 tokens/s | ~13 ms | Generacion de alto rendimiento y baja latencia |
| M1 / M2 / M3 Ultra | 64 GB - 192 GB | ~2,6 GB | ~240 tokens/s | ~9 ms | Concurrencia alta y servicio en produccion |

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a foros de usuarios de correo electronico, sin relacion con el repositorio.

## Requisitos de hardware

- VRAM activa estimada: ~2,6 GB para la variante de 16 bits, con aproximadamente 2,8 GB de peso en disco y 3,0 GB de repositorio completo.
- Memoria unificada minima recomendada por el autor: 8 GB. Para un uso comodo junto a otras aplicaciones se recomienda 16 GB o mas.
- GPU compatibles: exclusivamente Apple Silicon (familias M1, M2, M3 y M4 en sus variantes Base, Pro, Max y Ultra). No hay soporte para GPU NVIDIA, AMD o Intel mediante MLX.
- Cabe en GPU de consumo: si, en cualquier Mac con chip Apple Silicon y al menos 8 GB de memoria unificada. No es ejecutable en tarjetas graficas de consumo tipo RTX 4090 mediante este formato.
- Opciones de despliegue: mlx-lm (CLI `mlx_lm.chat` y `mlx_lm.generate`, mas API de Python con `load` y `generate`), LM Studio, Ollama (la model card incluye un Modelfile de ejemplo con tokens de parada y temperatura 0,7) y cualquier runtime que consuma safetensors en formato MLX.
- ACELERACION EN CUDA: no disponible. Alternativas como vLLM o TGI no son aplicables directamente a este repositorio; requeririan convertir los pesos al formato original de PyTorch o a GGUF.
- Latencia y throughput estimados: entre ~80 tokens/s en chips Base y ~240 tokens/s en Ultra, con TTFT de ~31 ms a ~9 ms respectivamente, segun las proyecciones del autor. No hay mediciones independientes publicadas.
- Presupuesto de memoria para contexto: la model card no detalla el consumo de la cache KV a 131.072 tokens; con una ventana de ese tamano, el consumo real de memoria superara ampliamente los 2,6 GB declarados para pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SirSahOl/Llama-Guard-3-1B-chat-mlx-16bit (este) | ~1,5 B | 131.072 tokens | 16 bits (bfloat16) | ~2,8-3,0 GB | llama3.2 | MLX, Apple Silicon |
| SirSahOl/Llama-Guard-3-1B-chat-mlx-8bit | ~1,5 B (mismo base) | 131.072 tokens | 8 bits | ~1,5 GB | llama3.2 | MLX, Apple Silicon |
| SirSahOl/Llama-Guard-3-1B-chat-mlx-4bit | ~1,5 B (mismo base) | 131.072 tokens | 4 bits | ~0,9 GB | llama3.2 | MLX, Apple Silicon |
| meta-llama/Llama-Guard-3-1B | ~1,5 B declarados por el tensor count | no especificado en la informacion disponible | pesos originales sin cuantizar | no disponible | llama3.2 | PyTorch/Transformers, multiplataforma |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de las proyecciones de velocidad del autor, que no incluyen metricas de calidad. Tampoco se han identificado en la busqueda modelos alternativos de moderacion de contenido comparables con datos verificables, por lo que la comparativa se limita al mismo modelo base y sus cuantizaciones.

## Limitaciones y advertencias

- Discrepancia de uso documentado: el modelo base Llama Guard 3 1B esta disenado para clasificacion de seguridad, pero el repositorio se presenta como un modelo conversacional generico con ejemplos de chat y poesia. No hay evidencia en la informacion disponible de que el comportamiento conversacional haya sido validado, por lo que su uso como chatbot general es arriesgado sin evaluacion previa.
- Ausencia total de benchmarks de calidad: no se publican resultados de MMLU, HumanEval, GSM8K, TruthfulQA ni de tareas de moderacion, lo que impide estimar la degradacion respecto al modelo original.
- Proyecciones sin verificar: las cifras de tokens/s y TTFT son estimaciones del autor basadas en ancho de banda de memoria, no mediciones reproducibles.
- Riesgo de alucinacion: inherente a un modelo de 1,5 B de parametros, especialmente en tareas de razonamiento, matematicas o conocimiento factual.
- Sesgos conocidos: no se documenta ningun analisis de sesgos ni de comportamiento diferencial por idioma o cultura. La moderacion de contenido puede presentar tasas de falsos positivos o negativos desiguales entre los ocho idiomas etiquetados.
- Idiomas: las lenguas declaradas provienen unicamente de las etiquetas del repositorio (en, de, fr, it, pt, hi, es, th). No hay evaluacion publicada de calidad por idioma y el espanol no esta validado de forma explicita.
- Limitacion de plataforma: el formato MLX solo funciona en Apple Silicon. Esto excluye servidores con GPU NVIDIA y complica el despliegue en produccion convencional.
- Consumo real a contexto largo: aunque la ventana declarada es de 131.072 tokens, el coste de la cache KV a esa longitud no esta cuantificado y puede superar la memoria disponible en equipos de 8 GB.
- Advertencia de formato de pesos: los safetensors en formato MLX no son directamente cargables por Transformers ni por llama.cpp sin conversion previa a GGUF.
- Validacion comunitaria minima: 247 descargas y 0 me gusta. El repositorio carece de revision por parte de terceros.
- Licencia: la licencia llama3.2 incluye una politica de uso aceptable y condiciones especificas para despliegues a gran escala. Antes de cualquier uso comercial conviene revisar el texto completo de la licencia de Llama 3.2 y verificar el cumplimiento de sus clausulas.
- Plantilla de chat: la model card recomienda configurar los tokens de parada `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` para evitar bucles de generacion; omitirlos puede provocar respuestas degeneradas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SirSahOl/Llama-Guard-3-1B-chat-mlx-16bit
- Modelo base: https://huggingface.co/meta-llama/Llama-Guard-3-1B
- Variante de 4 bits: https://huggingface.co/SirSahOl/Llama-Guard-3-1B-chat-mlx-4bit
- Variante de 8 bits: https://huggingface.co/SirSahOl/Llama-Guard-3-1B-chat-mlx-8bit
- Perfil del autor: https://huggingface.co/SirSahOl
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Articulo arXiv 2404.12241: https://arxiv.org/abs/2404.12241
- Articulo arXiv 2312.06674: https://arxiv.org/abs/2312.06674
- Articulo arXiv 2204.05862: https://arxiv.org/abs/2204.05862
- Articulo arXiv 2308.01263: https://arxiv.org/abs/2308.01263
- Articulo arXiv 2403.03853: https://arxiv.org/abs/2403.03853

Nota: la busqueda web asociada no devolvio ningun resultado relacionado con el modelo; todos los enlaces recuperados pertenecian a foros de soporte de correo electronico y se han descartado por no ser relevantes.
