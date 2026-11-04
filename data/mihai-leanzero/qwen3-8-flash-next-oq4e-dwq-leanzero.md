# Mihai-LeanZero/Qwen3.8-Flash-Next-oQ4e-DWQ-LeanZero

## Resumen

Qwen3.8-Flash-Next-oQ4e-DWQ-LeanZero es una compilación cuantizada a 4 bits en formato MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario Mihai-LeanZero (LeanZero) para su ejecución en Macs con Apple Silicon. El modelo conserva la arquitectura completa del original: el modelo de lenguaje, un embedding n-gram de 51B parámetros, el codificador visual y la cabeza de predicción multi-token (MTP). Con 179.999.981.459 parámetros totales y un peso en disco de 100,275 GiB (107,67 GB), está pensado para ejecutarse en un único Mac con 128 GB de memoria unificada.

La innovación de esta versión frente a la compilación previa oQ4e del mismo autor es la aplicación de *distilled weight quantization* (DWQ): se reentrenaron las escalas y sesgos de los expertos enrutados, capa por capa, tomando como profesor los pesos BF16 originales de Qwen. El resultado es una divergencia KL menor respecto al modelo original en texto de llamadas a herramientas (-10,6% en el conjunto global, -14,1% en texto de tool-calling), sin cambios en los códigos de 4 bits y sin diferencias medibles en prosa general.

El modelo es relevante para quienes necesitan desplegar localmente un modelo multimodal de gran tamaño con capacidades de agente y tool calling en hardware de consumo de gama alta (Apple Silicon), manteniendo una fidelidad cercana al BF16 original. La licencia es qwen-community-1.0, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcladores *hyper-connection*, expertos enrutados, embedding n-gram de 51B y cabeza MTP (según model card del autor) |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | 524.288 tokens en la configuración de prueba (YaRN factor 4); contexto nativo no disponible |
| Tipos de cuantizacion | 4 bits (receta oQ4e de oMLX) con escalas y sesgos de expertos reentrenados (DWQ) |
| Idiomas soportados | no disponible (la model card no detalla idiomas; el conjunto de calibración incluye texto multilingüe) |
| Licencia | qwen-community-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (MLX), 21 shards; tamaño del repo 107,7 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura transformer con mezcladores *hyper-connection* (cuatro flujos por capa), expertos enrutados con proyecciones gate, up y down, un embedding n-gram de 51B parámetros, un codificador visual para entrada image-text-to-text y una cabeza de predicción multi-token (MTP) para decodificación especulativa. La compilación DWQ mantiene intactos todos estos componentes salvo las escalas y sesgos de los expertos enrutados en 35 de las 48 capas del decodificador.

El entrenamiento DWQ se realizó capa por capa contra la salida de la misma capa en BF16, con todo lo anterior a los expertos congelado. Se usaron Adam con learning rate 1e-5, 3 épocas, copias maestras en fp32 y 384 secuencias de calibración de 1.024 tokens. Las capas 0 a 17 tomaron su entrada del modelo cuantizado y las capas 18 a 47 del profesor BF16. Los datos de calibración fueron públicos: transcripciones de codificación agéntica con tool calls (nebius/SWE-agent-trajectories, CC-BY-4.0), tool use (glaiveai/glaive-function-calling-v2, Apache-2.0), el conjunto de calibración de código y multilingüe de oMLX (Apache-2.0) y texto general (HuggingFaceFW/fineweb-edu, ODC-By), renderizados con la plantilla de chat del propio modelo. No se modificó ningún código de 4 bits: una comparación byte a byte de los 21 shards encontró solo 208 tensores de escala y sesgo modificados.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con codificador visual incluido.
- Tool calling y function calling, con calibración específica sobre transcripciones agénticas y datos de llamadas a funciones.
- Razonamiento agéntico multi-paso (el conjunto de calibración incluye trayectorias de SWE-agent).
- Decodificación especulativa mediante cabeza MTP (2 tokens borrador en las pruebas del autor).
- Embedding n-gram de 51B parámetros para modelado de lenguaje.
- Capacidades multilingües: no detalladas en la model card, aunque el conjunto de calibración incluye datos multilingües.
- Contexto largo: probado con 524.288 tokens y YaRN factor 4.

## Casos de uso

- Asistente de codificación agéntica en local: el modelo se calibró sobre trayectorias de SWE-agent y soporta tool calling, por lo que puede integrarse en flujos de edición de código con llamadas a herramientas en una Mac de 128 GB sin depender de la nube.
- Automatización de atención al cliente multi-turno: con contexto de hasta 524.288 tokens puede mantener conversaciones largas con historial extenso y documentos adjuntos, incluyendo imágenes enviadas por el usuario.
- Análisis de documentos con imágenes: al ser image-text-to-text, permite extraer información de capturas, diagramas o formularios combinados con texto en un mismo prompt.
- Agente de investigación con herramientas: la cabeza MTP y el soporte de function calling permiten encadenar búsquedas, consultas a APIs y síntesis de resultados en local.
- Procesamiento por lotes de texto largo: tareas de resumen, extracción o clasificación sobre documentos de cientos de miles de tokens, aprovechando la ventana extendida con YaRN.
- Desarrollo y pruebas de pipelines agénticos sin coste de API: al ejecutarse en hardware propio con MLX, sirve como entorno de validación de agentes antes de desplegar en producción.
- Prototipado multimodal en investigación: permite experimentar con un modelo de ~180B parámetros en una estación de trabajo Apple Silicon, algo inviable con el BF16 original en ese hardware.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad respecto al BF16 original, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). Se reproducen a continuación:

| Conjunto de prueba | KL, build oQ4e | KL, este build | Cambio (IC 95%) | Acuerdo top-1, oQ4e → este build |
|---|---|---|---|---|
| Texto de tool-call (32 filas) | 0,1122 | 0,0963 | -14,1% (-21,5% a -6,0%) | 92,87% → 93,40% |
| Texto plano (32 filas) | 0,0380 | 0,0380 | -0,1% (-2,8% a +2,4%) | 92,20% → 92,38% |
| Total (64 filas) | 0,0751 | 0,0671 | -10,6% (-17,0% a -4,1%) | 92,53% → 92,89% |

Perplejidad sobre texto de tool-call: 3,796 en este build frente a 3,706 en oQ4e y 3,692 en BF16. Perplejidad sobre texto plano: 7,305, 7,302 y 7,304 respectivamente. El conjunto de prueba se construyó tras el entrenamiento con fuentes públicas distintas de las de entrenamiento y validación, verificando que ningún fragmento de 32 tokens se solapara.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 100,275 GiB (107,67 GB) en disco; el autor lo ejecuta en un Mac con 128 GB de memoria unificada.
- Hardware probado: Mac Studio con M5 Max y 128 GB, con el límite de memoria de la GPU de macOS elevado a 120.832 MB.
- No cabe en GPUs de consumo convencionales (RTX 4090 de 24 GB, etc.) ni en Macs de 64 GB o menos.
- Motor de inferencia: MLX con el motor de LeanZero `v0.14.3-lz.27`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Configuración de prueba: tabla n-gram en disco, MTP con 2 tokens borrador y contexto de 524.288 tokens (YaRN factor 4).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ4e-DWQ-LeanZero | 179.999.981.459 | 524.288 (probado, YaRN 4) | 4 bits MLX | qwen-community-1.0 | HuggingFace, MLX |
| Qwen3.8-Flash-Next-oQ4e-LeanZero | 179.999.981.459 | ídem | 4 bits MLX | qwen-community-1.0 | HuggingFace, MLX |
| Qwen/Qwen3.8-Flash-Next (BF16) | no disponible | no disponible | BF16 | qwen-community-1.0 | HuggingFace |

La comparación se limita a las variantes del mismo modelo base documentadas en la información disponible; no se dispone de datos de benchmarks de tareas para comparar con modelos de otras familias.

## Limitaciones y advertencias

- La licencia qwen-community-1.0 impone condiciones específicas; debe revisarse el archivo LICENSE antes de cualquier uso comercial.
- Solo se distribuye en formato MLX para Apple Silicon; no hay pesos GGUF ni safetensors estándar para GPUs NVIDIA/AMD en esta compilación.
- El autor reconoce un comportamiento no explicado: en texto de tool-call la perplejidad se aleja ligeramente del BF16 (3,796 frente a 3,692) aunque la divergencia KL mejora; conviene validar en el dominio propio.
- La mejora DWQ solo se midió en 35 de las 48 capas; en las 13 restantes el entrenamiento no superó al redondeo original y se mantuvieron los tensores oQ4e.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de sesgo o toxicidad en la información disponible.
- Idiomas soportados no documentados explícitamente; el rendimiento fuera de inglés y chino no está verificado.
- El modelo requiere 128 GB de memoria unificada, lo que excluye la mayoría de equipos de consumo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de terceros.
- El contexto de 524.288 tokens se probó con YaRN factor 4, lo que puede degradar la calidad en comparación con el contexto nativo.

## Enlaces

- HuggingFace: https://huggingface.co/Mihai-LeanZero/Qwen3.8-Flash-Next-oQ4e-DWQ-LeanZero
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Compilación previa oQ4e: https://huggingface.co/Mihai-LeanZero/Qwen3.8-Flash-Next-oQ4e-LeanZero
- LeanZero: https://leanzero.net
- Conjunto de calibración SWE-agent: https://huggingface.co/datasets/nebius/SWE-agent-trajectories
- Conjunto de calibración de function calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Conjunto de calibración de texto general: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
