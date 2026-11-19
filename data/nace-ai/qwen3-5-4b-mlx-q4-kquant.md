# nace-ai/Qwen3.5-4B-MLX-Q4-KQuant

## Resumen

Qwen3.5-4B-MLX-Q4-KQuant es una cuantizacion en 4 bits del modelo Qwen/Qwen3.5-4B, empaquetada en formato MLX para su ejecucion en Macs con Apple Silicon. El trabajo lo firma nace-ai, el equipo de Nace.AI, y forma parte de una familia de packs cuantizados (9B, 27B, 35B-A3B, Flash-Next) pensados para su motor de inferencia local Kapitsa. El modelo base es multimodal de tipo image-text-to-text, con 4.539.265.536 parametros totales y licencia Apache 2.0.

El pack resuelve un problema muy concreto: ofrecer una cuantizacion Q4 que se acerque mas al modelo original en BF16 que las alternativas publicas, manteniendo el mismo peso (~2,37 GB de pesos del modelo de lenguaje, 3,1 GB de repo). Segun la model card, la divergencia KL frente a BF16 es de 0,048 frente a 0,070 del pack de lmstudio-community, y la coincidencia en el siguiente token sube del 88,1 % al 89,9 %.

La relevancia practica esta en que permite ejecutar un modelo de 4B con vision, modo thinking y tool calling en hardware de consumo Apple, con un rendimiento en GSM8K de 0,923 sobre las 1.319 preguntas del conjunto completo. Es, por tanto, una opcion orientada a despliegue local y privacidad, no a servidores con GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos del base no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona hasta 32.768 tokens de salida con thinking activado) |
| Tipos de cuantizacion | Q4 (4 bits) en formato MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repo de 3,1 GB; pesos del modelo de lenguaje ~2,37 GB |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.5-4B es un transformer multimodal que acepta texto e imagenes como entrada y genera texto; la informacion disponible no detalla el numero de capas, dimensiones ocultas ni la composicion exacta del dataset de entrenamiento. Lo que si se documenta es el comportamiento de inferencia: el modelo razona antes de responder por defecto (modo thinking), con la posibilidad de desactivarlo mediante `reasoning_effort: "none"` o `enable_thinking: false`. Los ajustes recomendados por Qwen distinguen entre modo thinking (temperature 1.0, top_p 0.95, top_k 20, presence_penalty 1.5), modo thinking para codigo preciso (temperature 0.6, presence_penalty 0.0) y modo sin thinking (temperature 0.7, top_p 0.8).

La innovacion tecnica de este repo no esta en el modelo, sino en el proceso de cuantizacion. Nace.AI aplica un esquema Q4 propio (etiquetado KQuant) que, segun sus mediciones, reduce la divergencia KL frente a BF16 de 0,070 a 0,048 sobre 32.768 tokens de WikiText-2, conversaciones de GSM8K y codigo de HumanEval. No se documenta si hubo RLHF, DPO u otras fases de alineacion en el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, con modo thinking activado por defecto y salida del razonamiento en el campo `reasoning_content`.
- Razonamiento matematico: 0,923 de acierto en GSM8K completo (1.319 preguntas) segun la model card.
- Comprension de imagenes: entrada multimodal mediante partes `image_url` en formato OpenAI, aceptando URL http(s) o data URL en base64.
- Tool calling / function calling: compatible con definiciones de herramientas de OpenAI, con round trip completo verificado (20 de 20 ensayos sin thinking colocaron la llamada y completaron el ciclo, sin llamadas extra).
- Generacion de codigo: incluida en el conjunto de evaluacion de la cuantizacion (HumanEval) y con ajustes de sampling especificos para codigo preciso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Despliegue local con APIs compatibles OpenAI, Anthropic y Ollama a traves del motor Kapitsa, ademas de pagina de chat integrada.

## Casos de uso

- Asistente de desarrollo en local: con tool calling compatible OpenAI y ajustes de sampling para codigo (temperature 0.6), puede integrarse en el flujo de trabajo diario de un desarrollador en un Mac, invocando herramientas de busqueda, ejecucion o consulta de APIs sin enviar codigo a la nube.
- Analisis de capturas e imagenes en escritorio: la entrada multimodal permite pasar imagenes por URL o base64 y pedir descripciones, extraccion de texto o interpretacion de diagramas, todo en local y con la ventana de salida ampliable a 32.768 tokens.
- Automatizacion de tareas con agentes: el soporte de function calling verificado y el modo thinking permiten construir agentes de varios pasos que razonan antes de actuar y devuelven las llamadas estructuradas en el formato esperado por el SDK de OpenAI.
- Prototipado de asistentes conversacionales privados: Kapitsa expone endpoints compatibles con OpenAI, Anthropic y Ollama, de modo que se puede apuntar una aplicacion existente al servidor local (`http://127.0.0.1:8000/v1`) sin reescribir el cliente.
- Resolucion de problemas matematicos y reasoning de nivel medio: el 0,923 en GSM8K lo hace util para tutoria, verificacion de calculos o generacion de problemas resueltos paso a paso con el modo thinking activado.
- Evaluacion y experimentacion con cuantizaciones: investigadores que comparen tecnicas de cuantizacion pueden usar este pack como referencia Q4 de alta fidelidad frente a BF16, con metricas KL y de coincidencia de siguiente token ya publicadas.
- Despliegue en entornos sin conectividad: al ejecutarse sobre Apple Silicon con pesos de 3,1 GB, encaja en escenarios de campo, auditoria o sanidad donde no se permite salida de datos.

## Benchmarks y rendimiento

| Prueba | lmstudio-community 4-bit | Nace Q4 (este repo) |
|---|---:|---:|
| Divergencia KL frente a BF16 (menor es mejor) | 0,070 | 0,048 |
| Coincidencia con BF16 en el siguiente token | 88,1 % | 89,9 % |
| GSM8K (1.319 preguntas) | 0,914 | 0,923 |

En el analisis por pregunta de GSM8K, 35 preguntas solo las acierta el pack de lmstudio-community y 47 solo el pack de Nace; la prueba de McNemar da z = 1,33, por lo que la diferencia no se considera medible. En tool calling sin thinking, 20 de 20 ensayos completaron el round trip sin llamadas adicionales (MLX 0.32.4, mlx-lm 0.32.2, M5 Pro). No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia orientada exclusivamente a Apple Silicon (MLX); no hay pesos GGUF ni safetensors estandar para GPU NVIDIA o AMD en este repo.
- VRAM equivalente: los pesos del modelo de lenguaje ocupan ~2,37 GB y el repo completo 3,1 GB, por lo que se necesita al menos ese espacio unificado mas el margen del runtime y del contexto.
- Cabe en cualquier Mac con Apple Silicon con 8 GB de memoria unificada o mas, aunque 16 GB es recomendable para contextos largos y salidas de hasta 32.768 tokens.
- GPUs dedicadas (A100, H100, RTX 4090) no son el objetivo de este pack; para esos entornos habria que recurrir al modelo base o a otras cuantizaciones.
- Despliegue mediante Kapitsa (`brew install nace-ai/tap/kapitsa`), que sirve chat web y APIs OpenAI, Anthropic y Ollama; tambien se puede usar `mlx_lm.generate` directamente.
- Latencia y throughput no disponibles; la model card solo indica que las pruebas se hicieron en un M5 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| nace-ai/Qwen3.5-4B-MLX-Q4-KQuant | 4,54 B | no disponible | MLX Q4 | Apache 2.0 | KL 0,048; GSM8K 0,923 |
| lmstudio-community/Qwen3.5-4B-MLX-4bit | 4,54 B (base) | no disponible | MLX 4-bit | Apache 2.0 (base) | KL 0,070; GSM8K 0,914 |
| Qwen/Qwen3.5-4B (BF16) | 4,54 B | no disponible | safetensors | Apache 2.0 | Referencia de calidad; mayor huella de memoria |

Las tres opciones comparten el mismo modelo base y licencia; la diferencia esta en la fidelidad de la cuantizacion y en el ecosistema de inferencia (Kapitsa frente a otras herramientas MLX). No se dispone de datos para comparar con modelos de otros fabricantes del mismo tamano.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon mediante MLX; no es portable a CUDA, ROCm ni CPU convencional sin reconvertir los pesos.
- La model card advierte que los ejemplos de inferencia se probaron sobre nace-ai/Qwen3.5-9B-MLX y no sobre este pack, aunque el nombre del repo se sustituye en los comandos.
- El modo thinking esta activado por defecto y consume muchos tokens de salida; sin desactivarlo, la latencia y el coste en tokens pueden ser altos para tareas simples.
- Un `presence_penalty` elevado puede provocar mezcla de idiomas segun la propia documentacion; se recomienda mantenerlo entre 0 y 2 y no tocar `repetition_penalty` (1.0).
- Riesgo de alucinacion inherente a un modelo de 4B: no se han publicado evaluaciones de veracidad ni de sesgos en la informacion disponible.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento uniforme fuera del ingles y el chino.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse en su propia model card.
- El pack tiene 1 like y 27.228 descargas, con actualizacion reciente; conviene fijar una revision concreta en produccion.

## Enlaces

- Hugging Face del pack: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX-Q4-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Buenas practicas del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B#best-practices
- Pack de comparacion (lmstudio-community): https://huggingface.co/lmstudio-community/Qwen3.5-4B-MLX-4bit
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Sitio de Nace.AI: https://www.nace.ai/
- Otros packs de la familia: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX, https://huggingface.co/nace-ai/Qwen3.8-27B-MLX, https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX, https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX
