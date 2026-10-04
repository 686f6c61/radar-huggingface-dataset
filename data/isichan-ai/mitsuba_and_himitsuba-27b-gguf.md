# isichan-ai/Mitsuba_and_HiMitsuba-27B-GGUF

## Resumen

Mitsuba y HiMitsuba 27B GGUF es una cuantización ternaria (1,58 bits) del modelo Qwen3.8-27B, publicada por el desarrollador japonés isichan-ai bajo licencia Apache-2.0. No se trata de un modelo generalista: está ajustado específicamente para el flujo de trabajo de ComfyUI, es decir, para redactar prompts de generación de imagen y vídeo que cumplen condiciones estrictas (tags de Stable Diffusion, instrucciones temporizadas de vídeo, prompts negativos) y para describir imágenes. Se distribuye en formato GGUF para llama.cpp y el propio autor advierte de forma explícita que no está pensado para programar.

El interés principal es de eficiencia. El modelo base de 27.000 millones de parámetros se comprime a 7,32 GB en el formato PQ2_0 y a 6,00 GB en PTQ1_0, de modo que cabe y funciona en una única GPU de 16 GB. Conserva el codificador de visión, distribuido aparte como mmproj-Q8_0.gguf (0,63 GB), y alcanza 119,0 tokens/s de decodificación en una RTX 5090 según las mediciones del autor. Incluye además un LoRA opcional de 70 MB, HiMitsuba-Uncensored-LoRA.gguf, que reduce los rechazos ante peticiones para adultos sin alterar, según el autor, las respuestas a peticiones ordinarias.

Su relevancia actual reside en que ofrece una alternativa local y de bajo consumo para automatizar la generación de prompts en pipelines de difusión, un nicho en el que los modelos multimodales grandes no caben en hardware de consumo. El precio pagado por la ternarización es elevado en otras áreas: la capacidad de codificación cae de 66 a 4 sobre 100 y la lectura de documentos largos baja de 76 a 48.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.8-27B, con pesos ternarizados a 1,58 bits. Numero de capas y detalle interno: no disponible |
| Parametros totales | 27B (segun la model card y el modelo base Qwen/Qwen3.8-27B); los metadatos de safetensors del repositorio indican 17.301.504 |
| Parametros activos | no disponible (no se describe como MoE en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria 1,58 bits en dos formatos GGUF: PQ2_0 (7,32 GB) y PTQ1_0 (6,00 GB). Codificador de vision en Q8_0. Adaptador LoRA en GGUF |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), safetensors como formato de origen del modelo base; LoRA en GGUF (HiMitsuba-Uncensored-LoRA.gguf) |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repositorio | 14,0 GB |
| Ficheros principales | Mitsuba-ComfyUI-27B-v1.18-PQ2_0.gguf (7,32 GB, recomendado); Mitsuba-ComfyUI-27B-v1.18-PTQ1_0.gguf (6,00 GB); HiMitsuba-Uncensored-LoRA.gguf (0,07 GB, solo PQ2_0); mmproj-Q8_0.gguf (0,63 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO. Lo que el autor documenta es que partio de los pesos oficiales de Qwen3.8-27B y aplico su propia ternarizacion, sin derivar de los pesos de Bonsai, y que el resultado se almacena en los formatos GGUF PQ2_0 y PTQ1_0 de Prism ML. La arquitectura subyacente es la del modelo base: un transformer multimodal que acepta imagen y texto y que conserva su codificador de vision. Ese codificador se distribuye como fichero separado, mmproj-Q8_0.gguf, tomado sin cambios del repositorio OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF, tambien bajo Apache-2.0. Por encima de PQ2_0 se puede aplicar un adaptador LoRA de 70 MB que modifica el comportamiento de rechazo del modelo.

El ajuste esta orientado a dos tareas concretas: generar prompts que satisfagan condiciones estrictas y describir imagenes. Segun la evaluacion del propio autor, la ternarizacion sacrifica codificacion (66 a 4 sobre 100) y lectura de documentos largos (76 a 48), mientras que conserva vision (89,8 a 87,8), seguimiento de reglas (84 a 84) y calidad de prompt en japones (52 a 52); la generacion de prompts con todas las condiciones satisfechas sube de 3/10 a 6/10 respecto al modelo original.

## Capacidades

- Generacion de prompts de imagen y video para ComfyUI, Stable Diffusion y Krea, con cumplimiento de condiciones estrictas (6/10 en la evaluacion del autor para PQ2_0, 5/10 para PTQ1_0).
- Descripcion y comprension de imagenes: 87,8/100 en PQ2_0 y 79,6/100 en PTQ1_0 en el eje de vision.
- Seguimiento de reglas e instrucciones estrictas: 84,0/100 en PQ2_0.
- Conversacion y generacion de texto en japones e ingles.
- Entrada multimodal imagen + texto (pipeline image-text-to-text).
- Soporte de adaptadores LoRA en tiempo de inferencia (HiMitsuba, solo para PQ2_0).
- Codificacion: capacidad residual muy baja (4,0/100); el autor indica explicitamente que el modelo no sirve para programar.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de pensamiento (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Automatizacion de prompts en ComfyUI: el modelo recibe una imagen de referencia y devuelve un prompt estructurado con tags, condiciones y prompt negativo listo para inyectar en un nodo de ComfyUI. Es adecuado porque fue ajustado precisamente para eso y porque su consumo de VRAM (7,32 GB en PQ2_0) permite ejecutarlo en la misma GPU de 16 GB que el pipeline de difusion.
- Etiquetado y metadatos de bibliotecas de imagenes: dado un directorio de imagenes, el modelo genera descripciones en japones o ingles que sirven como alt-text, palabras clave de busqueda o campos de catalogo. Su puntuacion de vision (87,8/100) es la mas alta de sus ejes.
- Generacion de prompts temporizados para video: al seguir instrucciones estrictas (84/100), puede producir secuencias con marcas de tiempo o cambios de plano, una tarea en la que los modelos genericos suelen desviarse de las condiciones pedidas.
- Creacion de datasets de entrenamiento para difusion: captioning masivo de imagenes para construir pares imagen-texto. El throughput de 119 tokens/s en una RTX 5090 hace viable procesar lotes grandes en local sin coste por token.
- Asistentes de prompting en aplicaciones de escritorio: integracion en herramientas tipo plugin que convierten una idea escrita por el usuario en un prompt formal. Al ejecutarse con llama.cpp sobre 16 GB de VRAM, no requiere conexion a servicios externos ni envio de imagenes a terceros.
- Preprocesado en pipelines de generacion de video publicitario o de storyboard: el modelo describe un fotograma de referencia y genera las variantes de prompt necesarias para mantener coherencia de estilo entre planos.
- Investigacion sobre cuantizacion ternaria: el repositorio publica graficos de no inferioridad frente al Bonsai ternario y frente al modelo BF16 original, lo que lo convierte en un caso de estudio util para medir que capacidades sobreviven a 1,58 bits y cuales se pierden.
- Moderacion de tono o estilo mediante LoRA: el adaptador opcional demuestra que se puede alterar la politica de rechazo de un modelo cuantizado con 70 MB adicionales, util para estudiar como se comporta un LoRA sobre pesos ternarios.

## Benchmarks y rendimiento

Los datos disponibles proceden de la evaluacion del propio autor (fichero EVALUATION.md y graficos comparison.png y noninferiority.png), con las mismas preguntas y condiciones para los cuatro modelos comparados. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks estandarizados publicados en la informacion disponible.

| Eje (sobre 100) | Mitsuba PQ2_0 | Mitsuba PTQ1_0 | Ternary Bonsai 2 27B PQ2_0 | Qwen3.8-27B BF16 (referencia) |
|---|---:|---:|---:|---:|
| Total | 61,5 | 60,2 | 59,6 | 66,3 |
| Sin censura | 53,2 | 48,8 | 36,0 | 31,9 |
| Honestidad | 63,2 | 72,2 | 51,0 | 51,1 |
| Autocontrol | 62,7 | 56,9 | 65,5 | 55,6 |
| Franqueza | 84,0 | 92,0 | 88,0 | 84,0 |
| Seguimiento de reglas | 84,0 | 80,0 | 72,0 | 84,0 |
| Finalizacion de tareas | 76,0 | 80,0 | 76,0 | 72,0 |
| Codificacion | 4,0 | 4,0 | 38,0 | 66,0 |
| Lectura | 48,0 | 40,0 | 44,0 | 76,0 |
| Japones y prompts | 52,0 | 48,0 | 42,0 | 52,0 |
| Vision | 87,8 | 79,6 | 83,7 | 89,8 |
| Generacion de prompts con todas las condiciones (sobre 10) | 6 | 5 | 2 | 3 |
| Velocidad de decodificacion (t/s, RTX 5090) | 119,0 | 98,7 | 120,8 | 1,6 |

Nota del autor: el BF16 original ocupa 51 GB y no cabe en los 32 GB de la RTX 5090, por lo que solo 28 de 64 capas se ejecutaron en GPU; su velocidad es solo orientativa.

Comparacion pareada frente al Bonsai ternario (Mitsuba PQ2_0 menos Ternary Bonsai 2 27B PQ2_0), con franqueza, finalizacion de tareas y lectura medidas con 4 veces mas preguntas:

| Resultado | Ejes |
|---|---|
| Superior | sin censura, honestidad |
| No inferior (margen de 10 puntos) | seguimiento de reglas, franqueza, japones y prompts, vision |
| Sin decidir ni con 49-100 preguntas | autocontrol, finalizacion de tareas, lectura |
| Claramente peor (excluido del grafico) | codificacion |

## Requisitos de hardware

- VRAM estimada: 7,32 GB de pesos en PQ2_0 y 6,00 GB en PTQ1_0, mas 0,63 GB del codificador de vision mmproj-Q8_0.gguf y 0,07 GB del LoRA si se aplica. Con margen para contexto y cache KV, un presupuesto de 8-10 GB de VRAM es suficiente para PQ2_0 (estimacion a partir de los tamanos de fichero; el autor solo afirma que cabe en una GPU de 16 GB).
- GPU recomendadas: el autor indica que funciona en una unica GPU de 16 GB. Se ha medido en una RTX 5090 (32 GB). Cualquier GPU con 16 GB o mas (RTX 4080, RTX 4090, RTX 5080, A100 40 GB, H100) es apta.
- GPU de consumo: si, cabe en tarjetas de 16 GB. En GPUs con menos de 12 GB no hay datos publicados.
- Software de despliegue: llama.cpp (llama-server) como base; la informacion disponible menciona tambien Docker Model Runner, Lemonade y Hermes Agent. ComfyUI como consumidor final de los prompts.
- Latencia y throughput: 119,0 tokens/s de decodificacion para PQ2_0 y 98,7 tokens/s para PTQ1_0 en RTX 5090, segun el autor. No se publican datos de latencia de prefill ni de tiempo hasta el primer token.
- Invocacion del LoRA: el autor indica anadir `--lora-scaled HiMitsuba-Uncensored-LoRA.gguf:1.0` en llama.cpp. Es exclusivo de PQ2_0 y no funciona con PTQ1_0.
- Almacenamiento: el repositorio completo ocupa 14,0 GB; para uso normal basta con descargar el GGUF elegido mas mmproj-Q8_0.gguf.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano de pesos | Total evaluado | Vision | Codificacion | Licencia |
|---|---|---:|---:|---:|---:|---|
| Mitsuba PQ2_0 | 27B (ternario, 1,58 bits) | 7,32 GB | 61,5 | 87,8 | 4,0 | Apache-2.0 |
| Mitsuba PTQ1_0 | 27B (ternario, 1,58 bits) | 6,00 GB | 60,2 | 79,6 | 4,0 | Apache-2.0 |
| Ternary Bonsai 2 27B PQ2_0 | 27B (ternario) | no disponible | 59,6 | 83,7 | 38,0 | no disponible en la informacion proporcionada |
| Qwen3.8-27B BF16 (modelo original) | 27B (BF16) | 51 GB | 66,3 | 89,8 | 66,0 | no disponible en la informacion proporcionada |

No se dispone de datos de contexto, licencia ni disponibilidad de alternativas fuera de las citadas en la evaluacion del autor. La comparativa con modelos ternarios de otros fabricantes o con modelos multimodales de tamano similar en formato GGUF no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Codificacion practicamente inexistente: 4,0 sobre 100. El autor lo declara de forma explicita ("no es para programar"). No debe introducirse en pipelines de generacion de codigo.
- Lectura de documentos largos degradada: baja de 76 a 48 respecto al modelo original. No es fiable para resumir o analizar textos extensos.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar casos de uso que dependan de ventanas largas.
- Solo japones e ingles. El rendimiento en castellano no esta medido ni garantizado.
- Alucinacion: no hay datos especificos sobre tasa de alucinacion. Al tratarse de una cuantizacion ternaria de 1,58 bits, es esperable una mayor inestabilidad numerica que en el modelo BF16, especialmente en tareas de razonamiento y lectura.
- Evaluacion no independiente: todos los numeros proceden del propio autor. No hay replicacion por terceros ni resultados en benchmarks estandarizados (MMLU, HumanEval, GSM8K).
- Discrepancia en los metadatos: el repositorio declara 17.301.504 parametros en safetensors mientras que la model card y el modelo base indican 27B. Conviene verificar antes de dimensionar infraestructura.
- Licencia Apache-2.0: permite uso comercial, pero el codificador de vision mmproj-Q8_0.gguf procede de otro repositorio y conviene comprobar sus terminos (el autor indica que tambien es Apache-2.0).
- LoRA HiMitsuba: reduce los rechazos ante peticiones para adultos y sensibles. El autor afirma que el adaptador "cambia por si solo" y que no altera las peticiones ordinarias, pero no hay auditoria independiente de ese comportamiento ni de sus efectos secundarios. Su uso conlleva riesgos de contenido inapropiado y de incumplimiento de politicas de plataforma.
- El repositorio se renombro el 2026-10-04 desde `Mitsuba-ComfyUI-27B-GGUF`. Los enlaces antiguos redirigen, pero conviene fijar la URL nueva en scripts y configuraciones.
- Modelo base no verificado de forma independiente en la informacion disponible; el identificador Qwen/Qwen3.8-27B es el declarado por el autor.
- El eje de autocontrol, finalizacion de tareas y lectura no pudo resolverse estadisticamente ni con 49-100 preguntas, por lo que la equivalencia con el Bonsai ternario en esas areas no esta demostrada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/isichan-ai/Mitsuba_and_HiMitsuba-27B-GGUF
- Model card (README): https://huggingface.co/isichan-ai/Mitsuba-ComfyUI-27B-GGUF/blob/main/README.md
- Fichero principal PQ2_0: https://huggingface.co/isichan-ai/Mitsuba-ComfyUI-27B-GGUF/blob/main/Mitsuba-ComfyUI-27B-v1.18-PQ2_0.gguf
- Articulo de AlphaSignal (vision general): https://alphasignal.ai/news/mitsuba-squeezes-a-27b-vision-model-into-7-3-gb-for-comfyui
- Articulo de AlphaSignal (despliegue en una GPU): https://alphasignal.ai/news/mitsuba-squeezes-a-27b-vision-model-into-7-3-gb-on-one-gpu
- Perfil del autor en aimodels.fyi: https://www.aimodels.fyi/creators/huggingface/isichan-ai
- Repositorio de origen del codificador de vision: https://huggingface.co/OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF
