# nace-ai/Qwen3.5-9B-MLX-Q5

## Resumen

Qwen3.5-9B-MLX-Q5 es una cuantización de 5 bits en formato MLX del modelo multimodal Qwen/Qwen3.5-9B, publicada por Nace.AI. El modelo base lo desarrolla el equipo Qwen de Alibaba y es un transformer denso de 9.409.813.744 parámetros con capacidad de entrada imagen-texto (pipeline `image-text-to-text`), pensado para generación de texto, razonamiento con modo "thinking" y llamadas a herramientas sobre hardware Apple Silicon. Esta ficha describe el pack cuantizado, no el modelo original.

El pack está orientado exclusivamente a Macs con Apple Silicon mediante la librería MLX (versión de referencia 0.32.4, con mlx-lm 0.32.2). Incluye la torre de visión del modelo base fijada por hash (333 tensores, 912.020.960 bytes) y los pesos del modelo de lenguaje cuantizados a 5,551 bits por peso de media, con un total de 6,21 GB de pesos de lenguaje y 7,1 GB de repositorio repartidos en tres ficheros safetensors.

Su relevancia actual está en la fidelidad de la cuantización: el autor reporta una divergencia KL de 0,0097 frente al modelo BF16 en texto original (32.704 tokens evaluados) y de 0,0474 en texto de chat y tool-call (65.472 tokens), frente a 0,0814 del pack de 4 bits de mlx-community. Es decir, se sitúa aproximadamente 8,4 veces más cerca del BF16 que la alternativa de 4 bits, a costa de un 23 % más de peso de lenguaje (6,21 GB frente a 5,04 GB). La licencia es Apache 2.0, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (lenguaje + torre de visión); cuantizado para MLX |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 5 bits MLX (5,551 bits por peso de media); el autor publica tambien un pack Q4 en nace-ai/Qwen3.5-9B-MLX |
| Idiomas soportados | en (segun la model card); el modelo base puede tener cobertura adicional no documentada aqui |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 3 ficheros, 7.124.746.696 bytes en total |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso de unos 9.400 millones de parámetros con una torre de visión acoplada, lo que le permite procesar entradas de imagen y texto. Esta ficha no dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original, por lo que no se detallan aquí. El pack cuantizado conserva el tokenizador del modelo base byte a byte, junto con su plantilla de chat.

La innovación de este repositorio es el método de cuantización de Nace.AI, que ajusta cada grupo de pesos según el comportamiento del modelo sobre texto real y no solo según los valores de los propios pesos. El resultado se escribe como un pack MLX estándar, sin formato ni dependencias nuevas. El proceso de evaluación ("gate run") se ejecutó en una NVIDIA H200 de 151 GB con mlx 0.32.4, mlx-lm 0.32.2, transformers 5.22.2 y numpy 2.5.4, midiendo distribuciones de siguiente token frente al modelo BF16 en texto original y en texto de chat y de llamadas a herramientas. El modelo piensa antes de responder por defecto (modo thinking activado).

## Capacidades

- Generación de texto y razonamiento en modo thinking, con un presupuesto de salida de hasta 32.768 tokens recomendado por el autor para la mayoría de tareas.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), gracias a la torre de visión incluida y fijada por hash.
- Llamadas a herramientas: 20 de 20 ensayos con thinking desactivado colocaron correctamente la llamada y completaron el ciclo completo.
- Modo thinking desactivable, con parámetros de muestreo distintos recomendados para cada modo.
- Conversación multi-turno mediante la plantilla de chat del modelo base.
- Capacidades multilingües: la model card solo declara inglés (`en`); no hay evidencia de otros idiomas en la información disponible.

## Casos de uso

- Asistentes locales en Mac: el pack está pensado para ejecutarse íntegramente en Apple Silicon con MLX, sin GPU dedicada, lo que permite desplegar un asistente conversacional privado en un portátil o Mac Studio.
- Automatización con tool calling: los 20 ensayos superados en colocación de llamadas y ciclo completo lo hacen apto para flujos donde el modelo debe invocar funciones externas (APIs, scripts locales) en un entorno de escritorio.
- Análisis de documentos e imágenes: al aceptar entrada imagen-texto, puede extraer información de capturas, diagramas o documentos escaneados en pipelines locales.
- Razonamiento con presupuesto largo: el modo thinking con hasta 32.768 tokens de salida encaja en tareas de análisis de código, depuración o planificación que requieren cadenas de razonamiento extensas.
- Prototipado e investigación en cuantización: con métricas KL publicadas y `results.json` adjunto, sirve como referencia reproducible para comparar métodos de cuantización MLX frente a BF16.
- Sustitución de packs de 4 bits cuando la fidelidad importa: en aplicaciones donde la divergencia de 0,08 KL del 4 bits resulta excesiva (por ejemplo, generación de código o texto de chat estructurado), el Q5 reduce la distancia a 0,0097 KL en texto original con solo un 23 % más de peso.
- Evaluación comparativa de packs MLX: útil para equipos que comparan OpTiQ, UD-Q4_K_XL u oQ4e-mtp con las mismas métricas del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas de fidelidad de cuantización frente al modelo BF16:

| Metrica | Nace Q5 (este repo) | Nace Q4 | Brooooooklyn UD-Q4_K_XL | mlx-community OptiQ | mlx-works oQ4e-mtp | lmstudio-community 4-bit | mlx-community 4-bit |
|---|---:|---:|---:|---:|---:|---:|---:|
| Pesos de lenguaje (GB) | 6,213 | 5,290 | 7,169 | 7,101 | 5,134 | 5,038 | 5,038 |
| KL en texto original (menor es mejor) | 0,0097 | 0,0301 | 0,0261 | 0,0292 | 0,0427 | 0,0806 | 0,0814 |
| Tokens evaluados (texto original) | 32.704 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| KL en chat y tool-call | 0,0474 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Tokens evaluados (chat y tool-call) | 65.472 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (MLX); el pack no está pensado para CUDA ni para CPU x86.
- Peso en disco: 7.124.746.696 bytes (7,1 GB) en tres ficheros safetensors, más la torre de visión de 912.020.960 bytes incluida en ese total.
- Memoria unificada estimada: los 6,21 GB de pesos de lenguaje más la torre de visión y el estado de inferencia requieren, como mínimo, un Mac con 16 GB de memoria unificada; 24 GB o más deja margen para contexto largo y salida de hasta 32.768 tokens.
- GPU dedicadas (A100, H100, RTX 4090): no aplican a este pack; el autor usó una H200 únicamente para el proceso de evaluación con el runtime MLX.
- Despliegue: mlx-lm 0.32.2 sobre mlx 0.32.4, con transformers 5.22.2. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que los comandos de arranque de este pack siguen en pruebas y remite a la model card del Q4 para los que ya funcionaron.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| nace-ai/Qwen3.5-9B-MLX-Q5 (este) | 9.409.813.744 | no disponible | MLX 5 bits, Apple Silicon | apache-2.0 | KL 0,0097 en texto original; 6,21 GB de pesos de lenguaje |
| nace-ai/Qwen3.5-9B-MLX (Q4) | mismo base | no disponible | MLX 4 bits, Apple Silicon | apache-2.0 | KL 0,0301; 5,29 GB; misma familia de cuantizacion |
| mlx-community/Qwen3.5-9B-OptiQ-4bit | mismo base | no disponible | MLX 4 bits, Apple Silicon | no disponible en la informacion | KL 0,0292; 7,10 GB |
| mlx-community/Qwen3.5-9B-4bit | mismo base | no disponible | MLX 4 bits, Apple Silicon | no disponible en la informacion | KL 0,0814; 5,04 GB |
| Brooooooklyn/Qwen3.5-9B-UD-Q4_K_XL-mlx | mismo base | no disponible | MLX 4 bits, Apple Silicon | no disponible en la informacion | KL 0,0261; 7,17 GB |
| mlx-works/Qwen3.5-9B-oQ4e-mtp | mismo base | no disponible | MLX 4 bits, Apple Silicon | no disponible en la informacion | KL 0,0427; 5,13 GB |

## Limitaciones y advertencias

- Solo inglés declarado: la model card lista únicamente `en`; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinación: inherente al modelo base; no se han publicado evaluaciones de veracidad en la información disponible.
- Sesgos: no documentados en la información proporcionada.
- Contexto: la longitud de contexto del modelo base no se indica en esta ficha; conviene consultar la model card de Qwen/Qwen3.5-9B antes de desplegarlo con ventanas largas.
- Dependencia de plataforma: es un pack MLX para Apple Silicon; no es portable a CUDA, ROCm ni CPU x86 sin reconvertir los pesos.
- Madurez del pack: el autor advierte de que los comandos de arranque de este repositorio siguen en pruebas; el Q4 es la referencia validada.
- Parámetros de muestreo sensibles: el autor recomienda mantener `repetition_penalty` en 1,0 y una `presence_penalty` entre 0 y 2; valores altos pueden mezclar idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.5-9B, que conviene revisar.
- Repositorio con muy poca tracción: 68 descargas y 0 likes en el momento de la consulta, sin validación independiente de las métricas KL reportadas.

## Enlaces

- Hugging Face del pack: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q5
- Resultados del gate run: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q5/blob/main/results.json
- Revisión fijada del pack: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q5/tree/49ee64befac7875ab9324d034ebbc74483552404
- Pack Q4 de la misma familia: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Prácticas recomendadas del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B#best-practices
- Pack Brooooooklyn UD-Q4_K_XL: https://huggingface.co/Brooooooklyn/Qwen3.5-9B-UD-Q4_K_XL-mlx
- Pack mlx-community OptiQ 4 bits: https://huggingface.co/mlx-community/Qwen3.5-9B-OptiQ-4bit
- Pack mlx-works oQ4e-mtp: https://huggingface.co/mlx-works/Qwen3.5-9B-oQ4e-mtp
- Pack lmstudio-community 4 bits: https://huggingface.co/lmstudio-community/Qwen3.5-9B-MLX-4bit
- Pack mlx-community 4 bits: https://huggingface.co/mlx-community/Qwen3.5-9B-4bit
