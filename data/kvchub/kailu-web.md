# KvcHub/KaiLu-Web

## Resumen

KaiLu-Web es un repositorio de distribucion de builds cuantizados en formato GGUF de la familia de modelos KaiLu, publicados por KvcHub para su ejecucion integra en el navegador mediante wllama (llama.cpp compilado a WebAssembly). El repositorio no contiene pesos originales entrenados por este autor, sino conversiones optimizadas para descarga y ejecucion en cliente: una build de 4 bits de KaiLu 3 Pro (1B de parametros, 623 MB dividida en dos partes) y una build de 8 bits de KaiLu 3 (329M de parametros, 351 MB). El objetivo es alimentar el chat de kvchub.com de forma que ninguna entrada del usuario se envie a un servidor.

El modelo de mayor tamano del repositorio, KaiLu 3 Pro, cuenta con 329.353.216 parametros segun los metadatos del repositorio, lo que lo situa en la categoria de modelos pequenos orientados a conversacion. La relevancia actual de este tipo de publicaciones radica en la creciente demanda de inferencia local y privada en el navegador, sin dependencia de API ni de GPU dedicada, un nicho donde las builds GGUF de baja cuantizacion y el soporte de WebAssembly son determinantes.

La informacion disponible es limitada: no se detallan arquitectura, datos de entrenamiento, benchmarks ni idiomas soportados mas alla de la etiqueta "conversational". Las fichas de los modelos completos en precision original se enlazan desde el propio repositorio (KvcHub/KaiLu-3-Pro y KvcHub/KaiLu3), pero sus contenidos no forman parte de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 329.353.216 (KaiLu 3 Pro, segun metadatos del repo); KaiLu 3: 329M |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (KaiLu 3 Pro), Q8_0 (KaiLu 3) |
| Idiomas soportados | no disponible |
| Licencia | per-file: Apache 2.0 para KaiLu 3 Pro (Q4_K_M); licencia KaiLu 3 (uso personal no comercial) para KaiLu 3 (Q8_0) |
| Formato de pesos | GGUF (split en dos ficheros para KaiLu 3 Pro Q4_K_M) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna de los modelos KaiLu (tipo de transformer, atencion, normalizacion, tokenizador) en la documentacion proporcionada. El repositorio es exclusivamente de distribucion: contiene builds GGUF generadas a partir de los modelos originales KaiLu 3 Pro y KaiLu 3, cuyos pesos completos y model cards se alojan en repositorios separados (KvcHub/KaiLu-3-Pro y KvcHub/KaiLu3).

Tampoco se detallan volumen ni composicion de los datos de entrenamiento, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica innovacion tecnica documentada es la de empaquetado y despliegue: la build Q4_K_M de KaiLu 3 Pro se divide en dos ficheros de aproximadamente 311 MB cada uno para permitir descargas paralelas en el navegador, y el conjunto se carga apuntando wllama al primer fragmento, que resuelve automaticamente el segundo. El soporte multi-hilo en el navegador requiere servir la pagina con las cabeceras `Cross-Origin-Opener-Policy: same-origin` y `Cross-Origin-Embedder-Policy: require-corp`.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el ejemplo de la model card (`createChatCompletion` con mensajes por rol) confirman soporte de dialogos multi-turno.
- Ejecucion integra en el navegador mediante wllama (llama.cpp compilado a WebAssembly), sin envio de datos a servidores externos.
- Carga desde Hugging Face directamente en el cliente mediante `loadModelFromHF`.
- Compatibilidad con llama.cpp: los ficheros GGUF divididos se abren desde el primer fragmento tambien fuera del navegador.
- Ajuste de parametros de muestreo (por ejemplo `temperature`) en la API de chat.
- No se documentan capacidades de codigo, matematicas, vision, audio, tool calling, agentes ni modo de razonamiento extendido. No disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Chat privado en navegador: integracion de wllama en una pagina web para ofrecer un asistente conversacional donde el texto del usuario nunca sale del dispositivo, adecuado por el formato GGUF y el tamano reducido de las builds (351-623 MB).
- Demo publica sin backend de inferencia: un sitio estatico puede servir el modelo desde Hugging Face y ejecutarlo en el cliente, eliminando costes de GPU en servidor y latencia de red en la generacion.
- Procesamiento de texto sensible en entornos regulados: al no transmitirse datos, encaja en escenarios donde la confidencialidad del contenido es requisito, siempre que el caso de uso encaje en las capacidades reales del modelo.
- Prototipado rapido de interfaces conversacionales: el ejemplo de codigo de la model card permite montar un chat funcional en pocas lineas con `@wllama/wllama` y un fichero WASM servido localmente.
- Aplicaciones offline-first: una PWA que cachee los ficheros GGUF puede ofrecer conversacion sin conexion tras la primera descarga.
- Evaluacion de la familia KaiLu antes de adoptar los modelos completos: estas builds permiten probar el comportamiento conversacional a baja precision y decidir si merece la pena desplegar KaiLu 3 Pro o KaiLu 3 en precision completa con llama.cpp u otro runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU del navegador via WebAssembly; no requiere GPU dedicada, aunque el rendimiento depende del dispositivo del cliente.
- Memoria estimada: en torno a 0,4-0,8 GB de RAM para la build Q8_0 de 351 MB y para la Q4_K_M de 623 MB, mas el overhead del runtime WASM y del contexto.
- GPU: no se documenta aceleracion por GPU en el navegador; wllama ejecuta llama.cpp en CPU. No disponible para A100, H100 o RTX 4090 en este contexto.
- Cabe en cualquier equipo de consumo con navegador moderno y suficiente memoria libre; no se especifican minimos.
- Despliegue: wllama (WebAssembly) en navegador; llama.cpp de forma nativa para los mismos ficheros GGUF. No se mencionan vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.
- Requisito de servidor: cabeceras COOP/COEP para habilitar multi-hilo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa. Como referencia estructural, los propios repositorios de origen (KvcHub/KaiLu-3-Pro y KvcHub/KaiLu3) serian los terminos de comparacion naturales frente a estas builds cuantizadas, pero sus fichas no forman parte de la informacion disponible.

## Limitaciones y advertencias

- La licencia es por fichero: KaiLu 3 Pro (Q4_K_M) se distribuye bajo Apache 2.0, mientras que KaiLu 3 (Q8_0) esta limitado a uso personal no comercial. Verificar el fichero concreto antes de cualquier uso en produccion.
- El repositorio es de distribucion, no de autoria del modelo: los pesos derivan de otros repositorios y cualquier problema de calidad, sesgo o alucinacion procede de los modelos originales, sobre los que esta ficha no aporta datos.
- No hay informacion sobre sesgos, idiomas, contexto maximo ni calidad de alineacion; no se debe asumir un comportamiento multilingue ni un contexto largo.
- Riesgo de alucinacion no cuantificado; con 329M de parametros es esperable una fiabilidad limitada en tareas de conocimiento factual, aunque no se aportan evaluaciones que lo confirmen.
- La cuantizacion Q4_K_M y Q8_0 introduce perdida de precision respecto a los pesos originales; no se documenta la degradacion medida.
- La ejecucion en navegador depende del dispositivo del usuario: moviles de gama baja pueden experimentar latencias altas o fallos de memoria.
- El multi-hilo requiere configuracion de cabeceras COOP/COEP en el servidor; sin ellas el rendimiento se reduce.
- Sin descargas ni likes en el momento de la consulta; no hay senales de adopcion ni validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KvcHub/KaiLu-Web
- Modelo original KaiLu 3 Pro: https://huggingface.co/KvcHub/KaiLu-3-Pro
- Modelo original KaiLu 3: https://huggingface.co/KvcHub/KaiLu3
- Licencia del repositorio: https://huggingface.co/KvcHub/KaiLu-Web/blob/main/README.md
- wllama (llama.cpp en WebAssembly): https://github.com/ngxson/wllama
- Chat de referencia: https://kvchub.com
