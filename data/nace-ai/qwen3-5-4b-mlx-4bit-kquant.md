# nace-ai/Qwen3.5-4B-MLX-4bit-KQuant

## Resumen

Qwen3.5-4B-MLX-4bit-KQuant es una cuantizacion en formato MLX de 4 bits del modelo Qwen/Qwen3.5-4B, publicada por nace-ai. El modelo base es un transformer multimodal de Qwen (Alibaba) con 4.539.265.536 parametros totales, capaz de procesar entradas de imagen y texto (pipeline image-text-to-text) y con un modo de razonamiento ("thinking") activado por defecto. Esta version concreta esta pensada exclusivamente para inferencia local en Apple Silicon mediante la libreria MLX y el motor Kapitsa del mismo autor.

El pack ocupa 3,1 GB en el repositorio, de los cuales aproximadamente 2,37 GB corresponden a los pesos del modelo de lenguaje cuantizados a Q4. Segun la model card, la cuantizacion de Nace se situa mas cerca del modelo BF16 original que el pack de 4 bits de lmstudio-community: KL de 0,048 frente a 0,070, y una tasa de coincidencia en el siguiente token del 89,9 % frente al 88,1 %. Es relevante ahora porque permite ejecutar un modelo multimodal de 4B con modo thinking y tool calling en un Mac de consumo, con API compatible con OpenAI, Anthropic y Ollama a traves de Kapitsa.

La licencia es Apache 2.0, lo que facilita el uso comercial. El modelo soporta conversacion multi-turno, entrada de imagenes via URL o base64, function calling con definiciones estilo OpenAI y un modo de razonamiento desactivable mediante `reasoning_effort: none` o `enable_thinking: false`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la model card menciona hasta 32.768 tokens de salida con thinking activado |
| Tipos de cuantizacion | Q4 (4 bits) en formato MLX; pesos de lenguaje ~2,37 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen/Qwen3.5-4B en la informacion proporcionada: no se especifica si emplea attention lineal, decodificacion especulativa, numero de capas, dimension oculta ni composicion del dataset de entrenamiento. Lo que si se sabe es que es un modelo multimodal (procesa imagen y texto) y que incorpora un modo de razonamiento explicito que genera contenido en el campo `reasoning_content` antes de la respuesta final.

El proceso de cuantizacion realizado por nace-ai es el elemento tecnico diferencial de este repositorio. Se aplica cuantizacion de 4 bits en formato MLX sobre los pesos del modelo de lenguaje, manteniendo el resto de componentes del pack multimodal. La model card reporta metricas de fidelidad frente al modelo BF16 original: divergencia KL media de 0,048 (frente a 0,070 del pack de lmstudio-community), coincidencia del siguiente token del 89,9 % (frente a 88,1 %) y una puntuacion GSM8K de 0,923 sobre las 1.319 preguntas del conjunto (frente a 0,914). El analisis McNemar sobre GSM8K (z = 1,33) no encuentra diferencia estadisticamente significativa entre ambos packs.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento con modo thinking activado por defecto; la salida de razonamiento se devuelve en `reasoning_content`.
- Procesamiento de imagenes: acepta partes `image_url` con URL http(s) o data URL base64 en el formato de la API de OpenAI.
- Tool calling / function calling con definiciones de herramientas en formato OpenAI, incluyendo ida y vuelta completa (llamada, respuesta de herramienta y respuesta final).
- Capacidades de codigo y matematicas (evidencia indirecta: resultados GSM8K reportados).
- Multilingue: no se detallan los idiomas soportados; la model card advierte que valores altos de `presence_penalty` pueden mezclar idiomas.
- Despliegue local en Apple Silicon mediante MLX y Kapitsa, con APIs compatibles con OpenAI, Anthropic y Ollama.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener conversaciones multi-turno con modo thinking y servir una pagina de chat en http://127.0.0.1:8000 mediante `kapitsa serve`, sin enviar datos a la nube. Adecuado por su tamano (3,1 GB de repo) y su licencia Apache 2.0.
- Automatizacion con function calling: integracion en scripts o agentes que necesiten llamar a APIs externas (por ejemplo, consultas meteorologicas) usando el SDK de OpenAI contra el endpoint local de Kapitsa; la model card documenta un round trip completo verificado en 20 de 20 pruebas con thinking desactivado.
- Analisis de imagenes en local: descripcion o interpretacion de imagenes enviadas como URL o base64, util para clasificacion visual, extraccion de informacion de capturas o asistencia en tareas de documentacion, aprovechando el pipeline image-text-to-text.
- Prototipado de agentes multi-paso: el modo thinking permite generar cadenas de razonamiento antes de actuar, y su desactivacion (`reasoning_effort: none`) reduce latencia en pasos donde no se requiere deliberacion.
- Evaluacion e investigacion de cuantizaciones: el repositorio publica metricas de KL, coincidencia de siguiente token y GSM8K frente a otro pack de 4 bits, lo que lo convierte en un punto de referencia para estudiar el impacto de la cuantizacion Q4 en MLX.
- Desarrollo de aplicaciones compatibles con OpenAI sin GPU dedicada: al exponer una API compatible con OpenAI, Anthropic y Ollama, se puede sustituir un backend remoto por este modelo local en fases de desarrollo y pruebas.
- Uso educativo y de demostracion: ejecutar un modelo multimodal de 4B con razonamiento en un portatil Apple Silicon permite demostraciones sin infraestructura de servidor.

## Benchmarks y rendimiento

| Prueba | lmstudio-community 4-bit | Nace Q4 (este repo) |
|---|---:|---:|
| KL medio frente al modelo BF16 (menor es mejor) | 0,070 | 0,048 |
| Coincidencia con BF16 en el siguiente token | 88,1 % | 89,9 % |
| GSM8K (1.319 preguntas) | 0,914 | 0,923 |

Analisis por pregunta en GSM8K: 35 preguntas solo las acierta el pack de lmstudio-community y 47 solo el pack de Nace; McNemar z = 1,33, sin diferencia medible. En tool calling con Q4 y thinking desactivado, 20 de 20 intentos colocaron la llamada y completaron el round trip, ninguno anadio una llamada extra (MLX 0.32.4, mlx-lm 0.32.2, M5 Pro). No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni otros benchmarks del modelo base.

## Requisitos de hardware

- Inferencia exclusivamente en Apple Silicon mediante MLX; no hay soporte indicado para CUDA ni ROCm en este pack.
- VRAM/unificada estimada: el repositorio ocupa 3,1 GB y los pesos de lenguaje Q4 unos 2,37 GB; se recomienda un Mac con al menos 8 GB de memoria unificada, y 16 GB o mas para margen con contexto largo y entrada de imagenes.
- GPU recomendadas: no aplica en el sentido tradicional; el hardware objetivo son chips Apple (la model card cita pruebas en M5 Pro).
- Cabe en equipos de consumo Apple Silicon; no esta pensado para A100, H100 ni RTX 4090.
- Opciones de despliegue: Kapitsa (`brew install nace-ai/tap/kapitsa`, `kapitsa serve`), que expone APIs compatibles con OpenAI, Anthropic y Ollama; tambien `mlx_lm.generate` como ejemplo basico de la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Calidad (KL vs BF16) | Licencia | Formato |
|---|---|---|---|---|---|---|
| nace-ai/Qwen3.5-4B-MLX-4bit-KQuant | 4.539.265.536 | no disponible | Q4 MLX | 0,048 | Apache 2.0 | safetensors MLX |
| lmstudio-community/Qwen3.5-4B-MLX-4bit | mismo modelo base | no disponible | 4 bits MLX | 0,070 | Apache 2.0 (heredada) | MLX |
| Qwen/Qwen3.5-4B (BF16 original) | 4.539.265.536 | no disponible | BF16 | referencia | Apache 2.0 | safetensors |

Otras alternativas de la familia publicadas por el mismo autor (Qwen3.5-9B-MLX, Qwen3.8-27B-MLX, Qwen3.6-35B-A3B-MLX, Qwen3.8-Flash-Next-MLX) no disponen de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con MLX; no es desplegable en GPUs NVIDIA o AMD con este formato.
- No se dispone de informacion sobre sesgos del modelo base ni sobre su comportamiento en idiomas distintos del ingles; los idiomas soportados no estan documentados.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de factualidad en la informacion disponible.
- La model card advierte que valores altos de `presence_penalty` pueden provocar mezcla de idiomas; recomienda mantenerlo entre 0 y 2 y `repetition_penalty` en 1.0.
- Con thinking activado se recomienda reservar hasta 32.768 tokens de salida, lo que incrementa el uso de memoria y la latencia.
- Los ejemplos de inferencia de la model card fueron probados sobre Qwen3.5-9B-MLX, no sobre este pack de 4B; el autor indica que la tarjeta sustituye el nombre del repositorio.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.5-4B, que conviene verificar en su propia model card.
- Solo 1 like y 38.294 descargas en el momento de la consulta; el pack es reciente (creado en noviembre de 2026) y su ecosistema de validacion externa es limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX-4bit-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base, seccion de buenas practicas: https://huggingface.co/Qwen/Qwen3.5-4B#best-practices
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Sitio de Nace.AI: https://www.nace.ai/
- Pack de comparacion de lmstudio-community: https://huggingface.co/lmstudio-community/Qwen3.5-4B-MLX-4bit
- Variante 9B del mismo autor: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
- Variante 27B del mismo autor: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX
- Variante 35B-A3B del mismo autor: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX
- Variante Flash-Next del mismo autor: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX
