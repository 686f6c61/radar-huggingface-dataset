# moonbox-dev/Nemotron-3.5-Bolt-E4B-GGUF

## Resumen

Nemotron 3.5 Bolt E4B es un modelo multimodal desarrollado por NVIDIA que acepta entradas de texto, imagen y audio, y que aquí se distribuye en formato GGUF gracias al trabajo de cuantización de moonbox-dev. El modelo base, publicado en BF16 bajo el identificador `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, cuenta con 7.518.069.290 parámetros totales y una tabla de embeddings por capa de aproximadamente 2.8B de valores, lo que lo sitúa en la gama de modelos de 7-8B con capacidades de visión y audio integradas.

La relevancia de esta ficha radica en que moonbox-dev ofrece los pesos ya convertidos a GGUF para su uso con llama.cpp en Metal, CUDA, Vulkan y CPU, incluyendo el fichero `mmproj` que aloja los codificadores de visión y audio. Esto permite desplegar un modelo multimodal de NVIDIA en hardware de consumo, algo que no es posible con los pesos BF16 originales de 15 GB sin una GPU de gama alta.

El repositorio incluye varias precisiones (F16, BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M), con verificaciones de fidelidad frente al checkpoint original y un conjunto de evaluación propio basado en divergencia KL y coincidencia del token más probable. La licencia OpenMDW-1.1 se hereda del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decoder con embeddings por capa, codificadores de visión y audio); etiquetado como gemma4 en los tags |
| Parámetros totales | 7.518.069.290 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (estas tres últimas con importance matrix) |
| Idiomas soportados | no disponible (los prompts de evaluación incluyen inglés y chino) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (un fichero por precisión más `mmproj-nemotron-3-5-bolt-e4b-F16.gguf`) |

## Arquitectura y entrenamiento

La información disponible describe un decoder transformer con una tabla de embeddings por capa (per-layer embedding table) de aproximadamente 2.8B valores, y codificadores separados de visión y audio cuyas proyecciones se alojan en el fichero `mmproj`. Los tags del repositorio mencionan `gemma4`, lo que sugiere que la arquitectura del decoder sigue el linaje de Gemma 4, aunque no se detalla la composición exacta de capas, atención ni mecanismos de normalización. El modelo base es de NVIDIA y se distribuye en BF16; no se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

El proceso de conversión a GGUF se realizó con llama.cpp `b12621`: `convert_hf_to_gguf.py` generó el fichero BF16 y el `mmproj`, y `llama-quantize` produjo las demás precisiones. Las cuantizaciones Q6_K, Q5_K_M y Q4_K_M se hicieron con importance matrix calculada sobre 200 x 512 tokens de WikiText-2 train con el fichero Q8_0. La verificación de fidelidad comparó los 2130 tensores del checkpoint original con los ficheros generados: 2117 coinciden byte a byte y los 13 restantes se reescriben de forma intencionada por el conversor (escalas del codificador de audio almacenadas como softplus(x) y reordenación de la proyección de parches de imagen al orden de píxeles de llama.cpp), con coincidencia exacta o dentro de 1e-7. La tabla de embeddings por capa se convirtió en fragmentos de filas mediante `lab/recipes/gguf/convert_gemma4_lowmem.py`.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat.
- Comprensión de imágenes (image-text-to-text): descripción de escenas y respuesta a preguntas sobre contenido visual.
- Comprensión de audio: transcripción de voz, como demuestra la prueba de humo con un clip de LibriSpeech transcrito palabra por palabra.
- Razonamiento previo a la respuesta (thinking mode): llama-server devuelve el razonamiento como `reasoning_content`.
- Entrada multimodal combinada mediante partes `image_url` e `input_audio` en la API `/v1/chat/completions`.
- Despliegue en CPU, CUDA, Metal y Vulkan a través de llama.cpp.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible; los prompts de evaluación incluyen inglés y chino, pero no se declara una lista de idiomas.

## Casos de uso

- Asistente multimodal en local para escritorio: con el fichero Q6_K (compatible con el umbral de calidad del laboratorio) y el `mmproj`, un usuario puede hacer preguntas sobre capturas de pantalla, fotos o documentos escaneados sin enviar datos a la nube, ejecutando llama-server con `-ngl 99` en una GPU de consumo.
- Transcripción y análisis de audio en entornos sin conectividad: el codificador de audio del `mmproj` permite transcribir clips (validado con LibriSpeech) y combinarlos con preguntas de seguimiento en la misma conversación.
- Descripción automática de imágenes para accesibilidad: el modelo puede generar descripciones de escenas (la prueba de humo describe un teclado, un ratón Dell y auriculares Sony sobre una mesa de madera) e integrarse en pipelines que etiqueten imágenes antes de publicarlas.
- Prototipado de agentes con razonamiento visible: al exponer el pensamiento como `reasoning_content`, resulta adecuado para depurar cadenas de razonamiento en aplicaciones de soporte técnico o análisis de documentos.
- Evaluación de cuantizaciones en pipelines de CI: el repositorio incluye hashes sha256 y métricas de fidelidad (KL y coincidencia del token superior), lo que permite verificar que un despliegue concreto no degrada el modelo respecto a BF16 antes de pasar a producción.
- Despliegue en hardware heterogéneo: gracias a los backends Metal, Vulkan y CPU de llama.cpp, el mismo fichero GGUF puede servir en portátiles con GPU integrada, estaciones con RTX y servidores sin GPU dedicada, ajustando la precisión al presupuesto de memoria.
- Filtrado y moderación de contenido multimedia: el modelo puede clasificar o resumir imágenes y audio entrantes en un flujo de revisión, con la ventaja de que los datos no salen del perímetro local.

## Benchmarks y rendimiento

Moonbox publica una evaluación propia de fidelidad de cuantización, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). La tabla siguiente recoge los datos disponibles:

| Precisión | Tamaño | KL vs BF16 (nats) | Coincidencia token superior | Veredicto |
|---|---|---|---|---|
| BF16 | 15.05 GB | referencia | referencia | original |
| F16 | 15.05 GB | 0.00001 | 99.7 % | pasa |
| Q8_0 | no disponible | no disponible | no disponible | pasa |
| Q6_K | no disponible | no disponible | no disponible | pasa |
| Q5_K_M | no disponible | no disponible | no disponible | pasa |
| Q4_K_M | no disponible | 0.0292 | no disponible | experimental |

El criterio de aprobación del laboratorio es KL <= 0.01 nats y coincidencia del token superior >= 90 %. La evaluación usa 12 prompts cortos (8 en inglés, 4 en chino) en la plantilla de chat del modelo, con respuestas greedy de hasta 64 tokens (726 en total) generadas por el fichero BF16 como referencia, y evaluación teacher-forced sobre esos tokens en llama-server con CUDA (RTX 3080 Laptop).

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero BF16 y F16 ocupan 15.05 GB solo en pesos, más el `mmproj` de 990.4 MB; se necesita margen adicional para el contexto KV. Las precisiones Q6_K, Q5_K_M y Q4_K_M son algo menores, pero el autor advierte que en Q5_K_M y Q4_K_M llama.cpp mantiene ambas tablas de embeddings a 6 bits (4.1B de los 7.5B parámetros), por lo que estos ficheros no son mucho más pequeños que Q6_K.
- GPU recomendadas: para BF16/F16, GPU con 24 GB o más (RTX 4090, A100, H100). Para Q6_K y Q5_K_M, GPU de 16-24 GB. Para Q4_K_M, GPU de 12-16 GB.
- GPU de consumo: el autor validó las cuantizaciones en una RTX 3080 Laptop, lo que indica que Q4_K_M y Q5_K_M caben en GPU de portátil de gama alta; Q6_K requiere más margen.
- Opciones de despliegue: llama.cpp `b12621` o superior mediante `llama-server`, con soporte de Metal, CUDA, Vulkan y CPU. El endpoint `/v1/chat/completions` es compatible con clientes de estilo OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas ni de especificaciones de contexto que permitan una comparación rigurosa con alternativas. La tabla recoge únicamente lo que se puede afirmar con la información disponible:

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| Nemotron 3.5 Bolt E4B (esta ficha) | 7.518.069.290 | no disponible | texto, imagen, audio | OpenMDW-1.1 | sí (moonbox-dev) |
| Alternativas de 7-8B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos comparables concretos con datos verificables de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- La cuantización Q4_K_M está marcada como experimental por el propio autor (KL 0.0292, por encima del umbral de 0.01 nats); no se recomienda para producción sin validación propia.
- En Q5_K_M y Q4_K_M, las tablas de embeddings se mantienen a 6 bits, de modo que la reducción de tamaño respecto a Q6_K es limitada; conviene verificar el ahorro real de memoria antes de elegir precisión.
- No se declara una lista de idiomas soportados; la evaluación solo cubre inglés y chino, por lo que el rendimiento en castellano no está verificado.
- No se especifica la longitud de contexto, lo que impide planificar despliegues con ventanas largas sin pruebas empíricas.
- No hay datos publicados de benchmarks de tareas (MMLU, HumanEval, GSM8K) ni de tasas de alucinación o sesgos; se desconoce el comportamiento en dominios especializados.
- La licencia OpenMDW-1.1 es la del modelo original y rige el uso de estos ficheros; es responsabilidad del usuario revisar sus términos antes de un uso comercial.
- El razonamiento previo a la respuesta puede aumentar la latencia y el consumo de tokens; en producción conviene controlar el modo thinking.
- El fichero `mmproj` es imprescindible para entradas de imagen y audio; sin él, el modelo solo procesa texto.
- La verificación de fidelidad cubre los tensores, pero no garantiza el mismo comportamiento en todas las tareas; la evaluación se limita a 12 prompts cortos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/Nemotron-3.5-Bolt-E4B-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Página de desarrolladores de NVIDIA Nemotron: https://developer.nvidia.com/nemotron
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Paper referenciado en los tags (arXiv:2509.04292): https://arxiv.org/abs/2509.04292
