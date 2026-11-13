# nace-ai/Qwen3.8-Flash-Next-MLX

## Resumen

Qwen3.8-Flash-Next-MLX es una cuantizacion de 4 bits en formato MLX del modelo Qwen3.8-Flash-Next de Qwen, publicada por nace-ai (Nace.AI) para su ejecucion local en Macs con Apple Silicon. El modelo base es un modelo multimodal de tipo image-text-to-text con 179.999.981.459 parametros totales (unos 180.000 millones), lo que lo situa en la categoria de modelos de gran escala. El repositorio ocupa 179,1 GB y la carga del modelo de lenguaje base en esta cuantizacion asciende a 105,20 GB.

La propuesta de valor de este pack es la fidelidad respecto al modelo original en BF16: segun las mediciones del autor, la divergencia KL frente a BF16 es de 0,0666 (corpus original) y 0,0713 (corpus fresco), frente a 0,2493 y 0,2291 del pack de 4 bits de mlx-community. El autor lo describe como 3,7 veces mas proximo al modelo BF16 que dicho pack, con 5,4 GB menos de peso del modelo de lenguaje (105,20 GB frente a 110,62 GB). Es relevante para quienes necesitan ejecutar un modelo de este tamano en hardware Apple con la menor perdida de calidad posible.

El modelo base incorpora modo de razonamiento (thinking) activado por defecto, soporte de tool calling y capacidades multimodales de imagen y texto. La licencia es qwen-community-1.0, lo que condiciona el uso comercial. El autor advierte que mlx-lm 0.32.2 aun no puede cargar esta arquitectura y que la revision actual se verifico con mlx-vlm sobre CUDA, sin pruebas todavia en su motor Kapitsa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); etiqueta interna qwen4_exp; no se detalla la configuracion exacta |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se mencionan hasta 32.768 tokens de salida recomendados, no de contexto) |
| Tipos de cuantizacion | 4 bits (Q4) en formato MLX; incluye payloads separados de MTP, drafter y vision |
| Idiomas soportados | no disponible (la model card advierte que valores altos de presence_penalty pueden mezclar idiomas) |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors en formato MLX; repositorio de 179,1 GB; libreria mlx |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su naturaleza multimodal (image-text-to-text) y de la etiqueta qwen4_exp que aparece en los tags. El pack incorpora payloads separados para MTP (multi-token prediction), drafter (decodificacion especulativa) y vision, lo que sugiere que el modelo base emplea decodificacion especulativa y prediccion multi-token, aunque no se aportan detalles sobre su implementacion. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Lo que si documenta el autor es el proceso de cuantizacion: se trata de una cuantizacion de 4 bits en MLX disenada para minimizar la divergencia KL respecto al modelo original en BF16. Las mediciones se realizaron con mlx-vlm 0.7.8 sobre 32.704 posiciones de siguiente token por corpus, empleando WikiText-2, conversaciones de GSM8K, codigo de HumanEval, UltraChat test_sft congelado y dialogos de Schema-Guided Dialogue. El autor subraya que la KL no equivale a precision en tareas ni a velocidad.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto; la profundidad de razonamiento es configurable mediante reasoning_effort con los valores low, medium y xhigh, y puede desactivarse con "none" o enable_thinking: false.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con payload de vision separado en el pack.
- Tool calling y function calling con definiciones de herramientas compatibles con OpenAI, incluyendo el ciclo completo de llamada y respuesta con rol tool.
- Razonamiento multi-paso y uso como agente, apoyado por el modo thinking y la decodificacion especulativa mediante drafter.
- Capacidades multilingues: no documentadas explicitamente; la model card solo advierte que valores altos de presence_penalty pueden provocar mezcla de idiomas.
- Servicio mediante APIs compatibles con OpenAI, Anthropic y Ollama a traves del motor Kapitsa.

## Casos de uso

- Razonamiento matematico local: con el modo thinking activado y hasta 32.768 tokens de salida, el modelo puede resolver problemas de tipo GSM8K en local sobre un Mac, sin enviar datos a la nube.
- Generacion y revision de codigo: el pack conserva un payload de drafter para decodificacion especulativa, lo que acelera la generacion de codigo en tareas tipo HumanEval; puede integrarse en flujos de trabajo locales de desarrollo.
- Agentes con tool calling: mediante la API compatible con OpenAI de Kapitsa, se pueden definir funciones (por ejemplo, consulta meteorologica) y completar el ciclo de llamada y respuesta, lo que permite construir agentes que consulten servicios externos.
- Asistente conversacional multimodal: al aceptar entrada de imagen y texto, sirve para describir imagenes, responder preguntas sobre capturas o documentos escaneados en un entorno local.
- Procesamiento por lotes de dialogos: con contextos conversacionales y la posibilidad de desactivar el thinking para reducir latencia, es adecuado para clasificar o resumir conversaciones de atencion al cliente en local.
- Despliegue privado en Apple Silicon: Kapitsa permite servir el modelo con --private y exponer APIs locales, util para equipos que requieren confidencialidad y no pueden usar servicios en la nube.
- Evaluacion e investigacion de cuantizacion: el repositorio incluye results.json con mediciones de KL, lo que lo convierte en un material util para estudiar el impacto de distintas estrategias de cuantizacion de 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente proporciona mediciones de divergencia KL frente al modelo BF16, que no equivalen a precision en tareas:

| Pack | Base-LM (GB) | KL original | KL fresco |
|---|---:|---:|---:|
| Nace (este repositorio) | 105,204 | 0,06660683 | 0,07132136 |
| nace-ai plain 4-bit (por defecto en Kapitsa) | 103,424 | 0,14110035 | 0,14112859 |
| Jundot oQ4e-mtp | 105,259 | 0,06475066 | 0,07135602 |
| mlx-community 4-bit | 110,621 | 0,24928604 | 0,22910747 |

## Requisitos de hardware

- VRAM o memoria unificada estimada: el modelo de lenguaje base en esta cuantizacion ocupa 105,20 GB, a los que hay que sumar los payloads de MTP, drafter y vision, por lo que se requiere un Mac con al menos 128 GB de memoria unificada; el repositorio completo son 179,1 GB en disco.
- GPU recomendadas: Apple Silicon de gama alta con memoria unificada amplia (serie M Ultra); no se documenta soporte para GPU NVIDIA, aunque la revision se verifico con mlx-vlm sobre CUDA.
- Cabe en GPU de consumo: no, un modelo de 180.000 millones de parametros en 4 bits no cabe en GPUs de consumo con 24 GB (RTX 4090) ni similares.
- Opciones de despliegue: motor Kapitsa (instalacion via brew, con kapitsa pull y kapitsa serve), que expone APIs compatibles con OpenAI, Anthropic y Ollama; mlx-vlm 0.7.8 para mediciones; mlx-lm 0.32.2 no puede cargar esta arquitectura todavia.
- Latencia y throughput: no disponibles; el autor no publica cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Base-LM (GB) | KL original | Licencia |
|---|---|---:|---:|---:|---|
| Nace (este repositorio) | 180.000 M | MLX Q4 | 105,204 | 0,0666 | qwen-community-1.0 |
| nace-ai plain 4-bit | no disponible | MLX Q4 | 103,424 | 0,1411 | qwen-community-1.0 |
| Jundot oQ4e-mtp | no disponible | MLX Q4 | 105,259 | 0,0648 | no disponible |
| mlx-community 4-bit | no disponible | MLX Q4 | 110,621 | 0,2493 | no disponible |

## Limitaciones y advertencias

- La licencia qwen-community-1.0 condiciona el uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegarlo en produccion.
- El autor advierte que mlx-lm 0.32.2 no puede cargar esta arquitectura y que otras aplicaciones MLX no se han probado con ella; el soporte de herramientas es limitado.
- La revision actual se verifico con mlx-vlm sobre CUDA y no se ha probado todavia en Kapitsa, segun el autor.
- Las metricas de KL no miden precision en tareas ni velocidad; no hay benchmarks de tareas publicados.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- El modo thinking esta activado por defecto, lo que incrementa la latencia y el consumo de tokens de salida si no se desactiva.
- Valores altos de presence_penalty pueden provocar mezcla de idiomas; se recomienda mantener repetition_penalty en 1.0.
- El repositorio tiene 0 descargas y solo 5 likes, por lo que su validacion por la comunidad es practicamente nula.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Practicas recomendadas del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next#best-practices
- Pack plain 4-bit del mismo autor: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX-4bit
- Pack Jundot oQ4e-mtp: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Pack mlx-community 4-bit: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-4bit
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Mediciones crudas: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX/blob/main/results.json
- Sitio del autor: https://www.nace.ai/
