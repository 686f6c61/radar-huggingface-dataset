# nace-ai/Qwen3.5-9B-MLX-Q5-KQuant

## Resumen

Qwen3.5-9B-MLX-Q5-KQuant es una cuantización de 5 bits en formato MLX del modelo Qwen/Qwen3.5-9B, publicada por nace-ai (Nace.AI) para su ejecución en Macs con Apple Silicon. El modelo base es un transformer multimodal de 9.409.813.744 parámetros (unos 9,4 mil millones) con capacidad image-text-to-text, es decir, acepta imágenes y texto como entrada y genera texto. Esta ficha se centra en el pack cuantizado, que conserva el tokenizador y la plantilla de chat del modelo original byte a byte.

La relevancia de este pack reside en su método de cuantización: Nace.AI ajusta cada grupo de pesos contra el comportamiento del modelo sobre texto real, no solo contra los valores de los pesos, y produce un pack MLX estándar sin dependencias adicionales. Según la model card, el pack alcanza una divergencia KL de 0,0097 respecto al modelo BF16 en texto original y de 0,0474 en texto de chat y tool-call, con 6,21 GB de pesos del modelo de lenguaje a 5,551 bits por peso de media.

El pack está pensado exclusivamente para inferencia en Apple Silicon mediante la librería MLX (mlx-lm), no para GPU NVIDIA ni para llama.cpp. El modelo piensa antes de responder por defecto (modo thinking), y la model card recomienda hasta 32.768 tokens de salida para la mayoría de tareas con el razonamiento activado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torre de visión; familia Qwen3.5 |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 5 bits MLX (5,551 bits por peso de media); existe un pack Q4 del mismo autor |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors para MLX (3 archivos, 7.124.746.696 bytes en total) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.5-9B es un transformer multimodal de la familia Qwen3.5, con una torre de visión que en este pack se mantiene fijada por hash (333 tensores, 912.020.960 bytes) y un modelo de lenguaje de 6,21 GB cuantizado a 5 bits. La model card no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO; esa información correspondería a la card del modelo base, que no se incluye en la información proporcionada.

La innovación técnica destacable de este pack es el proceso de cuantización de Nace.AI: los grupos de pesos se ajustan contra la distribución de siguiente token del modelo BF16 sobre texto original y sobre texto de chat y tool-call, en lugar de minimizar únicamente el error de los pesos. El resultado se materializa como un pack MLX convencional, compatible con mlx-lm sin instalar nada nuevo. La evaluación se realizó en una GPU NVIDIA H200 con mlx 0.32.4, mlx-lm 0.32.2, transformers 5.22.2 y numpy 2.5.4.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto (el modelo piensa antes de responder).
- Entrada multimodal image-text-to-text: procesa imágenes junto con texto gracias a la torre de visión del modelo base.
- Tool calling / function calling: la model card reporta 20 de 20 ensayos con thinking desactivado que colocaron la llamada y completaron el round trip.
- Conversación multi-turno con plantilla de chat propia del modelo base.
- Capacidades multilingües limitadas: el pack declara únicamente inglés (en).
- Modo thinking desactivable, con ajustes de muestreo distintos recomendados para cada modo.
- No se documentan en la información disponible capacidades de audio ni de agente autónomo multi-paso más allá del tool calling.

## Casos de uso

- Asistente conversacional local en Mac: el pack está diseñado para ejecutarse en Apple Silicon con MLX, lo que permite desplegar un asistente de 9,4 mil millones de parámetros en un portátil o Mac de sobremesa sin conexión a servicios externos.
- Automatización de tool calling en flujos locales: los 20 de 20 ensayos de llamada de herramientas con thinking desactivado lo hacen adecuado para pipelines que necesitan invocar funciones de forma fiable, como consultas a APIs internas o ejecución de comandos.
- Análisis de imágenes con descripción textual: al ser image-text-to-text, puede emplearse para extraer texto de capturas, describir diagramas o responder preguntas sobre imágenes en aplicaciones de escritorio para macOS.
- Generación de código asistida con modo thinking preciso: la model card recomienda temperature 0.6, top_p 0.95 y top_k 20 para coding preciso con thinking activado, un ajuste útil en editores o scripts de revisión de código.
- Prototipado e investigación en cuantización: investigadores que comparan métodos de cuantización pueden usar este pack como referencia de 5 bits con métricas KL publicadas frente a alternativas de 4 bits.
- Evaluación de calidad de cuantizaciones en producción: el pack incluye results.json con la ejecución completa (runtime, hashes del tokenizador, tramos KL y ensayos de herramientas), lo que facilita reproducir y auditar la evaluación antes de adoptarlo.
- Procesamiento por lotes de texto en local: con 6,21 GB de pesos del modelo de lenguaje y hasta 32.768 tokens de salida, puede emplearse para tareas de resumen o extracción sobre documentos largos en máquinas con memoria unificada suficiente.

## Benchmarks y rendimiento

| Prueba | Nace Q5 (este repo) | Tokens evaluados |
|---|---:|---:|
| KL respecto al modelo BF16, texto original (menor es mejor) | 0,0097 | 32.704 |
| KL respecto al modelo BF16, texto de chat y tool-call (menor es mejor) | 0,0474 | 65.472 |

Comparativa de packs MLX del mismo modelo base (tamaño de pesos del modelo de lenguaje y KL en texto original):

| Pack | GB del modelo de lenguaje | KL texto original |
|---|---:|---:|
| Nace Q5 (este repo) | 6,213 | 0,0097 |
| Nace Q4 | 5,290 | 0,0301 |
| Brooooooklyn UD-Q4_K_XL | 7,169 | 0,0261 |
| mlx-community OptiQ | 7,101 | 0,0292 |
| mlx-works oQ4e-mtp | 5,134 | 0,0427 |
| lmstudio-community 4-bit | 5,038 | 0,0806 |
| mlx-community 4-bit | 5,038 | 0,0814 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este pack ni para el modelo base.

## Requisitos de hardware

- VRAM/memoria: el repo ocupa 7,1 GB en total (3 archivos, 7.124.746.696 bytes); los pesos del modelo de lenguaje son 6,21 GB y la torre de visión 912.020.960 bytes. Se necesita memoria unificada suficiente para cargar el pack completo más el espacio de trabajo de inferencia.
- Plataforma: exclusivamente Apple Silicon con MLX; la evaluación de referencia se hizo en una NVIDIA H200 de 151 GB, pero el pack está destinado a Macs.
- GPU recomendadas: no se especifican modelos concretos de Apple Silicon en la información disponible; el tamaño de 7,1 GB sugiere que encaja en Macs con memoria unificada de 16 GB o superior, aunque este dato no está confirmado en la card.
- Opciones de despliegue: mlx-lm (versión de referencia 0.32.2) sobre mlx 0.32.4; no es compatible con vLLM, llama.cpp, Ollama ni TGI al ser un pack MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nace Q5 (este repo) | 9,4 mil millones | no disponible | apache-2.0 | MLX safetensors 5 bits | KL 0,0097 en texto original; 6,21 GB de pesos LM |
| Nace Q4 | 9,4 mil millones | no disponible | apache-2.0 | MLX 4 bits | KL 0,0301; 5,29 GB de pesos LM |
| mlx-community 4-bit | 9,4 mil millones | no disponible | apache-2.0 | MLX 4 bits | KL 0,0814; 5,04 GB de pesos LM |
| lmstudio-community 4-bit | 9,4 mil millones | no disponible | apache-2.0 | MLX 4 bits | KL 0,0806; 5,04 GB de pesos LM |

Todos los comparables son cuantizaciones del mismo modelo base Qwen/Qwen3.5-9B, por lo que comparten arquitectura, parámetros y licencia; la diferencia está en el método de cuantización, el tamaño resultante y la fidelidad respecto a BF16 medida en KL. No se dispone de comparación con modelos de otros autores o familias en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: el pack declara el idioma en, por lo que el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Exclusivo para Apple Silicon con MLX: no puede desplegarse en GPU NVIDIA, llama.cpp, Ollama, vLLM ni TGI sin reconvertir los pesos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad en la información disponible.
- La cuantización introduce degradación respecto a BF16: KL de 0,0097 en texto original y 0,0474 en chat y tool-call, superior esta última a la de algunos packs de 4 bits en texto original.
- La model card advierte de que valores altos de presence_penalty (entre 0 y 2 es el rango recomendado) pueden mezclar idiomas, y de mantener repetition_penalty en 1.0.
- Los comandos de inicio rápido para este pack concreto aún estaban en pruebas en el momento de la publicación; la card remite a la del pack Q4 para comandos verificados.
- El modo thinking está activado por defecto y consume hasta 32.768 tokens de salida en tareas largas, lo que afecta a la latencia y al coste computacional.
- No se detallan sesgos conocidos ni restricciones adicionales de uso comercial más allá de la licencia apache-2.0 heredada del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q5-KQuant
- Pack Q4 del mismo autor: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
- Resultados de evaluación: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q5-KQuant/blob/main/results.json
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Prácticas recomendadas del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B#best-practices
- Pack Brooooooklyn UD-Q4_K_XL: https://huggingface.co/Brooooooklyn/Qwen3.5-9B-UD-Q4_K_XL-mlx
- Pack mlx-community OptiQ: https://huggingface.co/mlx-community/Qwen3.5-9B-OptiQ-4bit
- Pack mlx-works oQ4e-mtp: https://huggingface.co/mlx-works/Qwen3.5-9B-oQ4e-mtp
- Pack lmstudio-community 4-bit: https://huggingface.co/lmstudio-community/Qwen3.5-9B-MLX-4bit
- Pack mlx-community 4-bit: https://huggingface.co/mlx-community/Qwen3.5-9B-4bit
