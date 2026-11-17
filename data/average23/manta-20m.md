# average23/MANTA-20M

## Resumen

MANTA-20M es un modelo de lenguaje conversacional compacto para ruso, desarrollado por el usuario average23, especializado en predicción de la siguiente palabra y autocompletado de palabras en teclados y campos de texto. Con 20.084.064 parámetros, es un decoder autoregresivo compatible con la arquitectura Qwen2, pensado para integrarse en interfaces de escritura donde la latencia y el coste computacional son críticos.

El modelo resuelve un problema muy concreto: la sugerencia de palabras en ruso conversacional informal, incluyendo jerga, insultos y alternancia de código ruso/inglés, un dominio que los modelos generalistas suelen cubrir mal. Frente al modelo de referencia Keyboard LM 57M, MANTA-20M obtiene mejores resultados en todas las métricas de evaluación publicadas pese a tener menos de la mitad de parámetros.

La relevancia actual del modelo reside en su enfoque de despliegue: se distribuye con una rueda de Python propia (`manta_keyboard`) que encapsula la búsqueda por haz a nivel de palabra, y sus pesos en FP32 Safetensors ocupan apenas 0,1 GB, lo que permite inferencia local en CPU o en GPUs de gama baja. La versión publicada es v0.1.0 y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder autoregresivo, compatible con Qwen2 |
| Parametros totales | 20.084.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (arquitectura); 128 tokens en evaluacion de teclado |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32 Safetensors) |
| Idiomas soportados | ruso (ru), ingles (en); con alternancia de codigo RU/EN |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP32), embeddings atados (tied embeddings) |

## Arquitectura y entrenamiento

MANTA-20M es un transformer decoder autoregresivo de 8 capas, con tamano oculto de 352, tamano intermedio de 1.024 y 8 cabezas de atencion con 4 cabezas KV (GQA). El vocabulario es de 24.000 tokens con tokenizador ByteLevel BPE y los embeddings estan atados. La ventana de contexto arquitectonica es de 1.024 tokens, aunque la evaluacion de teclado utiliza solo 128 tokens de historial.

El entrenamiento partio de un checkpoint preentrenado en texto web educativo ruso, texto web general y Wikipedia. Sobre esa base se aplico una adaptacion conversacional con 779.333.270 tokens objetivo en una pasada sobre el corpus, seguida de 41.074.231 tokens objetivo sobre 2.239.218 ventanas. La etapa final utilizo 1.227.460 mensajes nuevos de Telegram y 1.009.803 ventanas de replay del corpus anterior. Las fuentes cubren chats de Telegram, dialogos conversacionales, texto de foros, jerga e insultos, alternancia RU/EN, vocabulario tecnico, normalizacion lexica y un pequeno componente de noticias. La etapa final empleo AdamW con learning rate 3e-5, weight decay 0,01, batch size 16, paquetes de 512 tokens, 5.212 actualizaciones, semilla 42, parametros en FP32 con autocast BF16 en CUDA. No se documenta uso de RLHF ni DPO.

## Capacidades

- Prediccion de la siguiente palabra: devuelve hasta tres candidatos con su `log_probability`, explorando la masa de caminos hasta el limite de palabra.
- Autocompletado de palabras: completa un prefijo tecleado preservando el contexto y devolviendo palabras completas, no fragmentos.
- Generacion de texto autoregresiva estandar mediante `AutoModelForCausalLM` de Transformers.
- Manejo de ruso conversacional informal: jerga, insultos, texto de foros y chats de Telegram.
- Alternancia de codigo ruso/ingles, incluido vocabulario tecnico (por ejemplo, terminos de desarrollo como "докер").
- Normalizacion lexica y correccion implicita de variantes en el dominio conversacional.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues limitadas a ruso e ingles; no se documenta soporte de otros idiomas.

## Casos de uso

- Autocompletado en teclados moviles en ruso: el modelo sugiere la siguiente palabra y completa prefijos con busqueda por haz a nivel de palabra, con presupuesto fijo de pasos y beam 10, adecuado para latencia interactiva en dispositivos.
- Prediccion en campos de busqueda y formularios: integrado como servicio local, sugiere terminos mientras el usuario escribe, con 128 tokens de contexto suficientes para capturar la frase en curso.
- Asistentes de chat informales en ruso: al estar afinado sobre mensajes de Telegram, reproduce registro coloquial, jerga y alternancia RU/EN, util para prototipos de respuesta rapida en comunidades y foros.
- Correccion y normalizacion lexica en pipelines de preprocesado: el modelo puede puntuar candidatos de palabra para detectar variantes o errores tipicos en texto conversacional ruso.
- Inferencia local y offline: con 0,1 GB de pesos FP32 y un wheel propio (`manta_keyboard`), se puede empaquetar en aplicaciones de escritorio o moviles sin dependencia de red ni GPUs dedicadas.
- Educacion y prototipado de tecnicas de decodificacion: su tamano reducido y su API de busqueda por haz lo hacen util como banco de pruebas para experimentos de decodificacion a nivel de palabra con presupuesto temporal (`max_seconds`).
- Filtrado y moderacion de contenido coloquial: al haber sido entrenado con jerga e insultos, puede emplearse como modelo auxiliar para clasificar o anticipar lenguaje soez en contextos de moderacion (con las cautelas de sesgo correspondientes).

## Benchmarks y rendimiento

Los unicos resultados disponibles son los declarados por el autor en la model card. La evaluacion se realizo sobre la misma cohorte de Telegram: 128 autores, 235 posiciones objetivo unicas, 940 consultas de siguiente palabra y 1.544 de autocompletado, con prefijos de un caracter y mitad de la palabra objetivo, repetidas sobre cuatro instantaneas de historial (0/10/100/500). El scoring usa coincidencia exacta de palabra normalizada NFC, con busqueda por haz de beam 10, 64 pasos, limite de 48 caracteres por palabra, 128 tokens de contexto y techo de 30 segundos, en FP32 con TF32 desactivado.

| Modelo | Parametros | Next-word Top-1 | Next-word Top-3 | Completion Top-1 | Completion Top-3 |
|---|---:|---:|---:|---:|---:|
| MANTA 20M | 20.084.064 | 8,09 % | 15,74 % | 31,61 % | 52,59 % |
| Keyboard LM 57M | 57.321.984 | 5,96 % | 12,34 % | 26,68 % | 38,60 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para los pesos (20M parametros, ~80 MB), mas el estado del tokenizador y las estructuras de busqueda por haz; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, cualquier modelo desde una GTX 1050 o integrada moderna es suficiente; no se documentan requisitos especificos para A100, H100 o RTX 4090.
- Cabe en GPU consumer: si, en todas las gamas, incluidas iGPU y dispositivos moviles con suficiente memoria.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), TGI (tag `text-generation-inference` en el repo) y la rueda propia `manta_keyboard` para inferencia orientada a teclado. No se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles de forma oficial; la busqueda por haz por defecto tiene presupuesto fijo de beam 10 y 64 pasos, con opcion de techo temporal (`max_seconds=30` en el benchmark).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Next-word Top-1 | Completion Top-1 | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| MANTA 20M | 20.084.064 | 1.024 tokens | 8,09 % | 31,61 % | Apache 2.0 | Hugging Face, wheel propio |
| Keyboard LM 57M | 57.321.984 | no disponible | 5,96 % | 26,68 % | no disponible | Hugging Face (`ushastoek/russian-keyboard-learning`) |
| Alternativas adicionales | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables en la misma categoria (autocompletado ruso de teclado) en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en prediccion de palabra y autocompletado; no es un modelo de instrucciones ni de razonamiento general, y su uso como chatbot generico producira resultados pobres.
- Sesgos conocidos: el entrenamiento incluye jerga, insultos y texto de foros y Telegram, por lo que puede generar lenguaje soez u ofensivo con frecuencia (el propio ejemplo de la model card devuelve "пиздец" como primera sugerencia).
- Riesgo de alucinacion: al ser un modelo pequeno (20M) y con contexto de 1.024 tokens, la coherencia a largo plazo es limitada; las predicciones de palabra son plausibles localmente pero no garantizan correccion semantica global.
- Limitaciones de contexto e idioma: ventana de 1.024 tokens en arquitectura y solo 128 en evaluacion de teclado; soporte limitado a ruso e ingles, sin datos sobre otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede incluir material ofensivo; conviene aplicar filtros en produccion.
- Caveat de produccion: la version es v0.1.0, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion externa ni de mantenimiento a largo plazo.
- El rendimiento declarado (Top-1 de 8,09 % en siguiente palabra) es bajo en terminos absolutos; el modelo es util como sugerencia, no como sustituto de escritura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/average23/MANTA-20M
- Wheel de inferencia: https://huggingface.co/average23/MANTA-20M/resolve/v0.1.0/manta_keyboard-0.1.0-py3-none-any.whl
- Modelo de referencia Keyboard LM 57M: https://huggingface.co/ushastoek/russian-keyboard-learning
- Paper, blog, repositorio o demo adicionales: no disponible
