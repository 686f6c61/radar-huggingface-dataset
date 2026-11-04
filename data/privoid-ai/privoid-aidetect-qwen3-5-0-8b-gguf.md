# Privoid-ai/Privoid-AIDetect-Qwen3.5-0.8B-GGUF

## Resumen

Privoid-AIDetect-Qwen3.5-0.8B-GGUF es la distribucion en formato GGUF del modelo Privoid-ai/Privoid-AIDetect-Qwen3.5-0.8B, un clasificador de texto especializado en distinguir si un pasaje ha sido generado por una IA o escrito por un humano. Lo desarrolla Privoid-ai y se construye sobre una base Qwen3.5 de 0,8 mil millones de parametros, afinada con Unsloth para la tarea concreta de deteccion de texto generado por maquinas (incluido texto de ChatGPT).

Su relevancia practica esta en el formato: al publicarse como GGUF, el modelo puede ejecutarse completamente en local con llama.cpp, sin depender de APIs externas ni enviar el texto a terceros. Esto lo hace util para verificar contenido de forma privada y de bajo coste. El modelo es pequeno (772.845.888 parametros reales, unos 2,9 GB de repositorio) y esta pensado como un clasificador binario que etiqueta cada pasaje como `ai` o `human`.

La model card advierte explicitamente de que ningun detector de IA constituye una prueba definitiva, y remite a la pagina principal del modelo base para la comparativa con el detector de OpenAI, Mozilla Fakespot y desklib, asi como el formato de prompt. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5), afinada como clasificador de texto binario; pesos en formato GGUF para llama.cpp |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen3.5 de aproximadamente 0,8 mil millones de parametros y se afina mediante Unsloth para una tarea de clasificacion de texto: determinar si un fragmento ha sido producido por un modelo de lenguaje o por una persona. La salida es una etiqueta binaria (`ai` o `human`) obtenida a traves de la interfaz conversacional del modelo, con un formato de prompt definido por el autor en la pagina del modelo base.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras. El pipeline declarado es `text-classification`, y los pesos se distribuyen exclusivamente en formato GGUF, lo que indica que el autor prioriza el despliegue local con llama.cpp por encima de otros runtimes. La model card senala que cada fichero GGUF fue cargado en llama.cpp y etiqueto correctamente un texto de IA y un texto humano antes de su publicacion, como verificacion minima de funcionamiento.

## Capacidades

- Clasificacion binaria de texto: etiqueta un pasaje como `ai` o `human`.
- Deteccion de texto generado por modelos de lenguaje, con enfasis en texto tipo ChatGPT.
- Ejecucion local y offline mediante llama.cpp, sin llamadas a APIs externas.
- Interfaz conversacional compatible con `llama-server --jinja`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Capacidades multilingues: limitadas al ingles (`en`).
- No se documentan capacidades de generacion libre, razonamiento general, codigo, matematicas, vision, tool calling ni agentes; el modelo esta especializado en la tarea de deteccion.

## Casos de uso

- Moderacion de contenido en foros y comunidades: clasificar aportaciones como `ai` o `human` antes de publicarlas o para etiquetarlas, ejecutando el modelo en el propio servidor con llama.cpp y sin enviar texto de usuarios a terceros.
- Verificacion academica y editorial: prefiltrar envios o articulos sospechosos de haber sido generados por IA como primer paso de una revision humana, dado el bajo coste de inferencia de un modelo de 0,8B.
- Analisis de privacidad en pipelines de datos: marcar automaticamente muestras sinteticas en un corpus de entrenamiento o evaluacion, manteniendo todo el proceso en local gracias al formato GGUF.
- Herramientas de escritorio y plugins offline: integrar el detector en editores o clientes de correo que necesiten una senal de autoria sin conexion, usando la cuantizacion Q4_K_M (0,54 GB) para minimizar el espacio en disco.
- Investigacion sobre deteccion de texto generado: usar el modelo como linea base pequena y reproducible en experimentos, con pesos F16 para evitar el efecto de la cuantizacion en las comparaciones.
- Triaje en plataformas de contenido a gran escala: desplegar el modelo detras de un servidor llama.cpp para clasificar volumenes altos de texto con requisitos de hardware modestos, reservando modelos mayores para los casos ambiguos.
- Auditoria de contenidos en entornos regulados: al ser Apache 2.0 y ejecutable on-premise, encaja en organizaciones que no pueden enviar datos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que cada fichero GGUF etiqueto correctamente un texto de IA y un texto humano en la verificacion previa a la subida, y remite a la pagina del modelo base para la comparativa con el detector de OpenAI, Mozilla Fakespot y desklib.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB con Q4_K_M, 0,9 GB con Q8_0 y 1,7 GB con F16, sumando el overhead del contexto y del runtime.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier tarjeta moderna (GTX 1050 Ti o superior, RTX 20/30/40, Apple Silicon, iGPU con memoria compartida).
- Opciones de despliegue: llama.cpp (`llama-server -hf Privoid-ai/Privoid-AIDetect-Qwen3.5-0.8B-GGUF:Q8_0 --jinja`); otros runtimes compatibles con GGUF no estan documentados en la informacion disponible.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo se espera una latencia de milisegundos a decenas de milisegundos por clasificacion en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Privoid-AIDetect-Qwen3.5-0.8B-GGUF | 772.845.888 | no disponible | Deteccion de texto IA (binaria) | Apache 2.0 | GGUF |
| Detector de OpenAI | no disponible | no disponible | Deteccion de texto IA | propietario / servicio | API |
| Mozilla Fakespot | no disponible | no disponible | Deteccion de texto IA (entre otras funciones) | no disponible | servicio |
| desklib | no disponible | no disponible | Deteccion de texto IA | no disponible | servicio |

La model card menciona una comparativa del modelo base frente al detector de OpenAI, Mozilla Fakespot y desklib, pero los resultados numericos no estan incluidos en la informacion disponible. La principal diferencia practica de este modelo frente a esas alternativas es que se ejecuta en local y es de codigo y pesos abiertos bajo Apache 2.0.

## Limitaciones y advertencias

- Ningun detector de IA es una prueba definitiva; la propia model card lo advierte. Los resultados deben tratarse como una senal, no como evidencia.
- Riesgo de falsos positivos y falsos negativos: textos humanos formales o muy estructurados pueden clasificarse como `ai`, y textos de IA editados manualmente pueden clasificarse como `human`.
- Solo soporta ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- No se especifica la longitud de contexto, por lo que pasajes largos pueden requerir troceado manual.
- No se documentan sesgos conocidos ni la composicion del dataset de entrenamiento, lo que dificulta evaluar su robustez frente a dominios especificos.
- El modelo es muy pequeno (0,8B) y esta especializado; no debe usarse como modelo generativo general ni para tareas de razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la exactitud del detector en produccion.
- Los pesos se distribuyen solo en GGUF; para otros formatos habria que recurrir al modelo base o a una conversion propia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Privoid-ai/Privoid-AIDetect-Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/Privoid-ai/Privoid-AIDetect-Qwen3.5-0.8B
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- Unsloth (mencionado en el entrenamiento): https://github.com/unslothai/unsloth
