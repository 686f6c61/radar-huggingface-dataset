# nace-ai/Qwen3.5-4B-MLX-KQuant

## Resumen

Qwen3.5-4B-MLX-KQuant es una cuantización de 4 bits en formato MLX del modelo Qwen/Qwen3.5-4B, publicada por Nace.AI (nace-ai) para su ejecución local en Macs con Apple Silicon. El modelo base es un transformer multimodal de 4.539.265.536 parámetros (unos 4,5 mil millones) con capacidad image-text-to-text, es decir, acepta imágenes y texto como entrada y genera texto. Esta versión cuantizada ocupa 3,1 GB en disco y está pensada para el motor de inferencia Kapitsa del mismo autor, que expone APIs compatibles con OpenAI, Anthropic y Ollama.

La relevancia de este pack reside en su calidad de cuantización: según la model card, logra una divergencia KL de 0,048 respecto al modelo BF16 original, frente a 0,070 del pack de 4 bits de lmstudio-community, con el mismo tamaño de pesos del modelo de lenguaje (2,37 GB). Además, coincide con el modelo original en el 89,9 % de las predicciones de siguiente token, frente al 88,1 % del pack alternativo, y obtiene 0,923 en GSM8K frente a 0,914.

El modelo base incorpora modo de razonamiento (thinking) activado por defecto, soporte de tool calling y entrada de imágenes mediante URLs o data URLs base64. La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text, lo que lo sitúa en la categoría de modelos pequeños multimodales aptos para equipos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos del modelo base no disponibles |
| Parametros totales | 4.539.265.536 (aproximadamente 4,5 mil millones) |
| Parametros activos | No aplica (no es MoE según la informacion disponible) |
| Longitud de contexto | No disponible en la informacion proporcionada; la model card menciona hasta 32.768 tokens de salida con thinking activado |
| Tipos de cuantizacion | Q4 (4 bits) en formato MLX; pesos del modelo de lenguaje de 2,37 GB |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen/Qwen3.5-4B mas alla de su naturaleza transformer y su caracter multimodal (image-text-to-text). No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal en la informacion proporcionada.

Lo que si esta documentado es el proceso de cuantizacion de este pack: Nace.AI aplica cuantizacion de 4 bits en formato MLX, el mismo que usa lmstudio-community, y reporta metricas de fidelidad respecto al modelo BF16. La evaluacion de la divergencia KL se realizo sobre 32.768 tokens de WikiText-2, conversaciones de GSM8K y codigo de HumanEval, comparando las distribuciones de siguiente token contra el modelo original. El pack esta disenado para ejecutarse sobre Kapitsa, el motor de inferencia local de Nace.AI para Apple Silicon, que sirve una pagina de chat y APIs compatibles con OpenAI, Anthropic y Ollama.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo thinking activado por defecto; el contenido de razonamiento se devuelve en el campo `reasoning_content`. Se puede desactivar con `reasoning_effort: "none"` o `chat_template_kwargs: {"enable_thinking": false}`.
- Comprension de imagenes: acepta entradas `image_url` en formato OpenAI, tanto URLs http(s) como data URLs base64.
- Tool calling / function calling con definiciones de herramientas en formato OpenAI; la model card reporta 20 de 20 pruebas de ida y vuelta exitosas en modo sin thinking.
- Capacidades de codigo y matematicas: resultados en GSM8K (0,923) y evaluacion sobre codigo de HumanEval en el analisis de cuantizacion.
- Soporte multilingue: no disponible en la informacion proporcionada; la model card advierte que valores altos de presence_penalty pueden mezclar idiomas.
- Integracion con APIs compatibles con OpenAI, Anthropic y Ollama a traves de Kapitsa.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar conversaciones multi-turno directamente en un Mac con Apple Silicon mediante Kapitsa, sin enviar datos a la nube, con 3,1 GB de archivos y pesos de lenguaje de 2,37 GB.
- Atencion al cliente automatizada: el soporte de tool calling permite conectar el modelo a funciones como consulta de estado de pedidos o datos meteorologicos, completando el ciclo peticion-herramienta-respuesta con la API de OpenAI.
- Analisis de imagenes en local: gracias a la entrada image-text-to-text, se puede usar para describir imagenes, extraer informacion de capturas o clasificar contenido visual enviando la imagen como URL o base64.
- Generacion de codigo asistida: el modo thinking con ajustes precisos de codigo (temperature 0,6, top_p 0,95, top_k 20, presence_penalty 0,0) esta recomendado por la model card para tareas de programacion.
- Razonamiento matematico: con GSM8K en 0,923, es adecuado para resolver problemas aritmeticos paso a paso, con hasta 32.768 tokens de salida para razonamientos largos.
- Prototipado de agentes con API compatible con OpenAI: al exponer endpoints compatibles con OpenAI, Anthropic y Ollama, se puede integrar en frameworks de agentes existentes sin cambios de codigo, apuntando el cliente a `http://127.0.0.1:8000/v1`.
- Evaluacion de cuantizaciones: util para investigadores que quieran comparar la fidelidad de distintos packs de 4 bits frente al modelo BF16 usando las metricas de KL y acuerdo de siguiente token.

## Benchmarks y rendimiento

| Prueba | lmstudio-community 4-bit | Nace (este repo) |
|---|---:|---:|
| Divergencia KL respecto a BF16 (menor es mejor) | 0,070 | 0,048 |
| Acuerdo con BF16 en el siguiente token | 88,1 % | 89,9 % |
| GSM8K (1.319 preguntas) | 0,914 | 0,923 |

En la comparacion pregunta a pregunta de GSM8K, 35 preguntas solo las acierta el pack de lmstudio-community y 47 solo el pack de Nace; la model card indica que la diferencia no es medible (McNemar z 1,33). En tool calling con thinking desactivado, 20 de 20 intentos colocaron la llamada y completaron el ciclo, sin llamadas adicionales (MLX 0.32.4; mlx-lm 0.32.2, M5 Pro). No se han publicado resultados de benchmarks del modelo base en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 3,1 GB de archivos; pesos del modelo de lenguaje de 2,37 GB en Q4.
- VRAM/memoria unificada: al ser un pack MLX para Apple Silicon, se ejecuta sobre memoria unificada; el tamano de 3,1 GB sugiere que cabe en Macs con 8 GB o mas de memoria unificada, aunque no se especifica un minimo oficial en la informacion disponible.
- GPU: disenado para Apple Silicon (los ejemplos se probaron en un M5 Pro); no se mencionan GPU NVIDIA (A100, H100, RTX 4090) en la informacion proporcionada.
- Despliegue: Kapitsa (`brew install nace-ai/tap/kapitsa`, `kapitsa pull`, `kapitsa serve`), que expone APIs compatibles con OpenAI, Anthropic y Ollama; tambien se menciona `mlx_lm.generate` para generacion directa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nace-ai/Qwen3.5-4B-MLX-KQuant | 4,5 mil millones | No disponible | MLX Q4 (safetensors) | Apache 2.0 | KL 0,048; GSM8K 0,923 |
| lmstudio-community/Qwen3.5-4B-MLX-4bit | 4,5 mil millones (mismo base) | No disponible | MLX 4-bit | Apache 2.0 (heredada del base) | KL 0,070; GSM8K 0,914 |
| Qwen/Qwen3.5-4B (BF16 original) | 4,5 mil millones | No disponible | Safetensors BF16 | Apache 2.0 | Referencia de fidelidad para las cuantizaciones |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion: no se documentan evaluaciones especificas de alucinacion en la informacion disponible; como todo modelo generativo, existe riesgo inherente.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Idiomas: no se especifican los idiomas soportados; la model card advierte que valores altos de presence_penalty pueden provocar mezcla de idiomas.
- Contexto: la longitud de contexto no esta disponible; la model card solo menciona hasta 32.768 tokens de salida con thinking activado.
- Cuantizacion: al ser un pack Q4, existe una divergencia medible respecto al BF16 (KL 0,048), por lo que no es identico al modelo original.
- Plataforma: el pack esta limitado a Apple Silicon y al ecosistema MLX; no es directamente utilizable en GPU NVIDIA ni en servidores x86 convencionales.
- Ejemplos de inferencia: la propia model card advierte que los ejemplos de inferencia se probaron en nace-ai/Qwen3.5-9B-MLX, no en este pack, y que la tarjeta sustituye el nombre del repositorio.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-4B.
- Produccion: el motor Kapitsa y el ecosistema MLX estan orientados a ejecucion local en Mac; no se documentan garantias de latencia o throughput para cargas de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Pack alternativo de lmstudio-community: https://huggingface.co/lmstudio-community/Qwen3.5-4B-MLX-4bit
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Web de Nace.AI: https://www.nace.ai/
- Otros packs de Nace.AI: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX, https://huggingface.co/nace-ai/Qwen3.8-27B-MLX, https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX, https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX
