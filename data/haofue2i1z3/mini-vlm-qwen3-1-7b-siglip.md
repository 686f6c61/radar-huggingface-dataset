# haofue2i1z3/Mini-VLM-Qwen3-1.7B-SigLIP

## Resumen

Mini-VLM-Qwen3-1.7B-SigLIP es un modelo de visión y lenguaje (VLM) de 2.155.358.272 parámetros (2,16 B) publicado por el usuario haofue2i1z3 y entrenado con la receta TinyLLaVA. Combina el codificador visual google/siglip-so400m-patch14-384, un conector MLP de dos capas y el modelo de lenguaje Qwen/Qwen3-1.7B en modo no-thinking. El resultado es un sistema image-text-to-text que acepta una imagen y texto y genera respuestas en inglés y chino.

Su interés principal es la reproducibilidad y la ligereza: todo el entrenamiento se realizó en una única RTX 5090, en dos etapas, con 150.000 captions de LLaVA-Pretrain en la primera fase y 150.000 muestras de LLaVA-1.5 mix665k más 15.000 muestras en chino en la segunda. Es una referencia práctica para estudiar cómo se ensambla un VLM pequeño desde cero, para prototipar sobre hardware de consumo o para servir de base a fine-tunings posteriores.

Los resultados publicados son modestos y están declarados con transparencia: 75,3 de accuracy en POPE y 71,0 en MMBench-CN (dev), con un sesgo marcado hacia responder "sí" y sin alineamiento de seguridad. El propio autor lo orienta a investigación y aprendizaje, no a producción sin supervisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo TinyLLaVA: codificador visual SigLIP-SO400M/14 (384 px, patch 14) + conector MLP de 2 capas + LLM Qwen3-1.7B en modo no-thinking |
| Parametros totales | 2.155.358.272 (2,16 B) segun safetensors |
| Parametros activos | No aplica (modelo denso, no es MoE). Durante la etapa 2 se entrenaron 1,73 B parametros; el conector aporta 6,6 M |
| Longitud de contexto | No disponible en la model card. El modelo base Qwen3-1.7B declara 32.768 tokens nativos, pero esta derivacion multimodal no especifica su propio limite |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en bf16/safetensors; no hay variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 (los datos de entrenamiento tienen sus propias condiciones de uso) |
| Formato de pesos | safetensors (tamano del repositorio: 5,2 GB) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema clasico de los VLM de tipo LLaVA: un codificador visual SigLIP-SO400M a resolucion fija de 384x384 con parches de 14 pixeles, un proyector MLP de dos capas que alinea el espacio visual con el del lenguaje y un decoder Qwen3-1.7B que consume los tokens visuales concatenados con el texto. El LLM opera en modo no-thinking, es decir, sin la fase de razonamiento explicito que ofrecen otras configuraciones de la familia Qwen3.

El entrenamiento consta de dos etapas sobre una sola RTX 5090. La etapa 1 usa 150.000 captions de LLaVA-Pretrain y solo actualiza el conector (6,6 M parametros, learning rate 1e-3, batch 256). La etapa 2 parte de 150.000 muestras de LLaVA-1.5 mix665k (COCO, GQA y ShareGPT) mas 15.000 muestras en chino de BUAADreamer/llava-en-zh-300k, y entrena el LLM y el conector (1,73 B parametros) dejando congelado el codificador visual (learning rate 2e-5, batch 128). Ambas etapas usan una epoca, precision bf16 y un schedule coseno con 3 % de warmup. No se documenta RLHF, DPO ni ninguna fase de alineamiento posterior.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text): descripcion de escenas, respuesta a preguntas visuales y conversacion de un turno sobre el contenido de una imagen.
- Comprension visual basica: reconocimiento de objetos, atributos, relaciones espaciales simples y escenas de COCO/GQA, el tipo de dato con el que se entreno la etapa 2.
- Soporte bilingue ingles-chino, con 15.000 muestras en chino incorporadas especificamente en la segunda etapa de entrenamiento.
- Evaluacion en benchmarks de alucinacion visual (POPE) y de comprension multimodal en chino (MMBench-CN).
- No hay evidencia de soporte de tool calling ni de function calling en la informacion disponible.
- No hay evidencia de capacidades agenticas ni de razonamiento multi-paso documentadas.
- No dispone de modo thinking, vision de multiples imagenes simultaneas, audio ni video.
- Acepta una unica imagen de 384x384 por entrada.

## Casos de uso

- Investigacion sobre arquitecturas VLM: sirve como punto de partida reproducible para estudiar el efecto del conector MLP, el congelado del codificador visual y el regimen de learning rates en un VLM de 2 B entrenado con recursos limitados.
- Prototipado rapido en hardware de consumo: al ocupar del orden de 4,3 GB en bf16, permite iterar en una unica GPU de gama alta para consumo (por ejemplo, una RTX 4090 o una RTX 5090) sin infraestructura de servidor.
- Descripcion automatica de imagenes en ingles o chino: util para generar alt-text o metadatos preliminares en catalogos de imagenes simples, siempre con revision humana por tratarse de un modelo sin alineamiento de seguridad.
- Preguntas y respuestas visuales sobre escenas cotidianas: el modelo esta entrenado sobre COCO y GQA, por lo que responde razonablemente a preguntas del tipo "que objeto hay a la izquierda" en fotografias no densas.
- Base para fine-tuning especifico de dominio: al ser Apache-2.0 y solo 2,16 B de parametros, es viable reentrenar la etapa 2 sobre un dataset propio (por ejemplo, radiologia simple o inspeccion industrial) con una sola GPU.
- Docencia y formacion: permite mostrar de forma completa el pipeline TinyLLaVA (codificador, conector, LLM) y auditar cada etapa del entrenamiento con datos y hiperparametros publicados.
- Evaluacion comparativa de encoders visuales: la combinacion SigLIP-SO400M + Qwen3-1.7B puede replicarse sustituyendo el encoder para medir el impacto en POPE o MMBench-CN.

## Benchmarks y rendimiento

Decodificacion greedy. Solo se parsea el "si/no" o la letra de opcion inicial; las respuestas no parseables cuentan como incorrectas.

| Benchmark | Metrica | Resultado |
|---|---|---|
| POPE | Accuracy | 75,3 |
| POPE | Recall si / no | 95,1 / 55,1 |
| POPE (split adversarial) | Recall de "no" | 43,1 |
| MMBench-CN (dev) | Accuracy | 71,0 |

No se han publicado resultados comparativos frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: unos 4,3 GB solo para los pesos (2.155.358.272 parametros x 2 bytes). Con activaciones y cache KV, la inferencia de una imagen mas una respuesta corta cabe comodamente por debajo de 8 GB.
- VRAM estimada en int8: en torno a 2,2 GB, y en int4 alrededor de 1,1 GB, pero se trata de estimaciones aritmeticas: no hay checkpoints cuantizados publicados.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, RTX 5090). El propio autor entreno el modelo completo en una unica RTX 5090.
- GPU de datacenter compatibles: A100, H100, L40S o similares, aunque estan sobredimensionadas para un modelo de este tamano.
- No hay datos publicados de tokens por segundo ni de latencia por imagen.
- Opciones de despliegue: el checkpoint usa la clase de modelo de TinyLLaVA, por lo que no funciona con las clases Auto* de Transformers ni con los servidores habituales (vLLM, TGI, llama.cpp, Ollama) tal como se publica. Requiere el codigo de https://github.com/jackychris/mini-vlm con los parches de Qwen3. Entorno probado: Python 3.10, PyTorch 2.12.1+cu130 y Transformers 4.51.3.
- El consumo de tokens visuales por imagen es fijo, del orden de 729 tokens para la rejilla de 27x27 a patch 14 (estimacion derivada de la configuracion declarada 384x384/patch14).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Disponibilidad |
|---|---|---|---|---|---|
| Mini-VLM-Qwen3-1.7B-SigLIP | 2,16 B | No disponible | Apache-2.0 | safetensors (bf16) | Requiere codigo TinyLLaVA con parches de Qwen3 |
| Qwen2-VL-2B-Instruct | 2,21 B | 32.768 tokens | Apache-2.0 | safetensors | Compatible con Transformers y vLLM |
| SmolVLM-Instruct | 2,25 B | No disponible | Apache-2.0 | safetensors | Compatible con Transformers |
| moondream2 | 1,86 B (aprox.) | No disponible | Apache-2.0 | safetensors | Compatible con Transformers |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la informacion proporcionada; los datos de parametros y licencia de los modelos alternativos proceden de sus respectivas model cards publicas.

## Limitaciones y advertencias

- Sesgo fuerte hacia responder "si" en POPE: el recall de "si" es 95,1 frente a 55,1 de "no", y en el split adversarial el recall de "no" cae al 43,1 %. Esto implica una tendencia a confirmar afirmaciones falsas sobre la imagen.
- Riesgo elevado de alucinacion visual en tareas de verificacion o de respuesta binaria, por el sesgo anterior y por el volumen de entrenamiento (una sola epoca, 150.000 muestras en la etapa 2).
- Sin alineamiento de seguridad: el autor indica explicitamente que no hay safety alignment, por lo que puede generar contenido inadecuado y no debe exponerse directamente a usuarios finales.
- Una sola imagen de 384x384 por entrada: no lee de forma fiable texto pequeno, documentos densos, capturas de pantalla con tipografia fina ni imagenes de alta resolucion.
- Cobertura limitada de idiomas: solo ingles y chino; no hay evidencia de soporte de castellano ni de otras lenguas.
- Longitud de contexto no declarada en la model card; conviene validar empiricamente el comportamiento en conversaciones largas o con prompts extensos.
- Restricciones de licencia: los pesos son Apache-2.0, pero los datos de entrenamiento (LLaVA-Pretrain, COCO, GQA, ShareGPT y llava-en-zh-300k) tienen sus propias condiciones. El autor recomienda usar el modelo para investigacion y aprendizaje.
- Integracion limitada: al no funcionar con las clases Auto* de Transformers ni existir variantes GGUF, su adopcion en pipelines de produccion exige mantener el codigo de TinyLLaVA con los parches de Qwen3.
- Modelo practicamente sin traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa ni ecosistema de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/haofue2i1z3/Mini-VLM-Qwen3-1.7B-SigLIP
- Codigo de entrenamiento e inferencia: https://github.com/jackychris/mini-vlm
- Modelo base de lenguaje: https://huggingface.co/Qwen/Qwen3-1.7B
- Codificador visual: https://huggingface.co/google/siglip-so400m-patch14-384
- Dataset en chino de la etapa 2: https://huggingface.co/datasets/BUAADreamer/llava-en-zh-300k
