# FrostWolfAI/LFM3-1.7B-abliterated-GGUF

## Resumen

LFM3-1.7B-abliterated-GGUF es la distribucion en formato GGUF del modelo FrostWolfAI/LFM3-1.7B-abliterated, una version "abliterated" (decensurada) del LiquidAI/LFM3-1.7B de Liquid AI. El proceso de abliteracion se realizo con Heretic v2 (ARA), una tecnica que identifica y elimina la direccion de activacion asociada al rechazo de peticiones, reduciendo la tasa de negativas de 91/100 en el modelo base a 1/100 con una divergencia KL de 0.0555 respecto al original. El resultado es un modelo que mantiene las capacidades del LFM3 original pero sin el comportamiento de rechazo entrenado.

Arquitectura y tamano: se trata de un modelo de 1.728.801.600 parametros (aproximadamente 1,7 mil millones), disenado para despliegue en el borde (edge) y en dispositivo. El modelo base LFM3 de Liquid AI es un modelo de tipo "thinking" con soporte nativo de tool-calling y modo de razonamiento explicito mediante etiquetas ``. El contexto y la arquitectura interna exacta no estan detallados en la informacion disponible.

Relevancia: este lanzamiento interesa a desarrolladores que necesitan un modelo pequeno, ejecutable localmente en hardware modesto, con capacidades multilingues (17 idiomas) y sin el filtrado de rechazo del modelo original, para investigacion de seguridad, generacion creativa sin restricciones o pipelines locales. La distribucion GGUF permite su uso en llama.cpp, Ollama y LM Studio, siempre que la build incluya soporte para la arquitectura `lfm3`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de Liquid AI; detalles internos no disponibles) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (disponible); Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, Q3_K_M y Q2_K anunciados como "en proceso" |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada del modelo base |
| Formato de pesos | GGUF (llama.cpp); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion GGUF del FrostWolfAI/LFM3-1.7B-abliterated, que a su vez deriva del LiquidAI/LFM3-1.7B. La innovacion principal de esta version no esta en el entrenamiento original sino en el post-procesado: la abliteracion mediante Heretic v2 (ARA), que modifica los pesos para eliminar la direccion de activacion responsable del rechazo. Segun la model card, el resultado alcanza 1/100 rechazos frente a los 91/100 del modelo base, con una divergencia KL de 0.0555, lo que indica que las distribuciones de salida se mantienen relativamente cercanas al original fuera del comportamiento de rechazo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base LFM3. El modelo hereda las capacidades del LFM3 original, incluyendo modo de razonamiento explicito (`<think>...</think>`) y tool-calling nativo, segun se indica en la model card. La cuantizacion a GGUF requiere una build reciente de llama.cpp con soporte para la arquitectura `lfm3`; las builds antiguas no cargan estos ficheros.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Modo de razonamiento explicito ("thinking model") mediante etiquetas `<think>...</think>`.
- Tool-calling / function calling nativo (requiere `--jinja` en llama.cpp para renderizar correctamente la plantilla de chat).
- Capacidades multilingues en 17 idiomas: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Comportamiento sin rechazo (decensurado) para investigacion de seguridad y uso local.
- Orientado a despliegue en dispositivo (edge / on-device) por su tamano reducido.

## Casos de uso

- Investigacion de seguridad y alineacion: el modelo permite estudiar el comportamiento de un LLM sin el filtrado de rechazo, comparando respuestas con el modelo base para analizar que direcciones de activacion codifican la negativa. Su tamano de 1,7B facilita experimentos repetibles en una sola GPU.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde el modelo base rechazaria la peticion. El modo thinking permite razonamiento previo sobre la estructura narrativa.
- Asistente local en dispositivo: despliegue en portatiles o equipos de gama media mediante llama.cpp u Ollama, con cuantizacion Q4_K_M una vez disponible, para tareas de conversacion y resumen sin conexion a la nube.
- Prototipado de agentes con tool-calling: el soporte nativo de function calling y el modo de razonamiento permiten construir agentes multi-paso que invocan herramientas locales (shell, APIs internas) en entornos controlados de desarrollo.
- Procesamiento multilingue en el borde: traduccion y resumen en 17 idiomas en dispositivos sin acceso a servicios en la nube, aprovechando la cobertura linguistica del modelo.
- Evaluacion de cuantizaciones: al ofrecerse BF16 y progresivamente K-quants, sirve como banco de pruebas para medir la degradacion de calidad y la tasa de rechazo residual segun el nivel de cuantizacion.
- Fine-tuning y destilacion: como modelo base pequeno y decensurado, es util para experimentos de ajuste fino en dominios especializados donde el filtrado del modelo original interferiria con los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica proporcionada es la tasa de rechazo tras la abliteracion (1/100 frente a 91/100 del base) y la divergencia KL de 0.0555 respecto al modelo original.

## Requisitos de hardware

- VRAM estimada: el fichero BF16 ocupa aproximadamente 3,5 GB (tamano del repo). Las cuantizaciones Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, Q3_K_M y Q2_K estan anunciadas pero aun no disponibles; se estima que Q4_K_M rondaria 1,0-1,1 GB y Q2_K en torno a 0,7 GB, aunque estos valores no estan confirmados en la informacion disponible.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para BF16 (RTX 3060, RTX 4060, etc.); para cuantizaciones menores bastaria con 2 GB, incluyendo GPUs integradas o Apple Silicon.
- Cabe en GPU consumer: si, en todas las GPU modernas con 4 GB o mas para BF16 y en practicamente cualquier hardware con las cuantizaciones reducidas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama y LM Studio, siempre que incluyan una build reciente con soporte para `lfm3`. Requiere `--jinja` para el renderizado correcto de la plantilla de chat y tool-calling.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FrostWolfAI/LFM3-1.7B-abliterated-GGUF | 1,73B | no disponible | LFM Open License v1.0 | GGUF | Version decensurada; 1/100 rechazos |
| LiquidAI/LFM3-1.7B | 1,73B | no disponible | LFM Open License v1.0 | safetensors | Modelo base original; 91/100 rechazos |
| FrostWolfAI/LFM3-1.7B-abliterated | 1,73B | no disponible | LFM Open License v1.0 | safetensors | Version decensurada sin cuantizar |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina el comportamiento de rechazo, lo que implica que el modelo puede generar contenido danino, ilegal o eticamente problematico. El autor lo libera exclusivamente para investigacion de seguridad y uso local, y declara que la responsabilidad del uso recae en el usuario.
- Riesgo de alucinacion: como todo LLM de 1,7B, la tasa de alucinacion es previsiblemente alta en tareas de conocimiento factual; no hay datos publicados al respecto.
- La cuantizacion puede degradar capacidades y reintroducir parcialmente comportamientos de rechazo o incoherencias; solo BF16 esta disponible actualmente.
- Requiere una build reciente de llama.cpp con soporte para `lfm3`; las builds antiguas no cargan los ficheros. Esto puede limitar el despliegue en entornos con versiones fijas.
- Licencia LFM Open License v1.0: es necesario revisar los terminos del fichero LICENSE para uso comercial; la informacion disponible no detalla las restricciones concretas.
- No se dispone de informacion sobre sesgos especificos, longitud de contexto efectiva ni rendimiento en idiomas distintos del ingles.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-09; es un lanzamiento muy reciente con validacion comunitaria practicamente nula.

## Enlaces

- Hugging Face: https://huggingface.co/FrostWolfAI/LFM3-1.7B-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/FrostWolfAI/LFM3-1.7B-abliterated
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
