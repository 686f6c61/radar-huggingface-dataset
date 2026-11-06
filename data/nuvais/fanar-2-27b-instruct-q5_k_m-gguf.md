# nuvais/Fanar-2-27B-Instruct-Q5_K_M-GGUF

## Resumen

Fanar-2-27B-Instruct es un modelo de lenguaje de 27.009.346.304 parametros desarrollado por QCRI (Qatar Computing Research Institute), disenado especificamente para arabe e ingles. Este repositorio concreto, publicado por el usuario nuvais, contiene una copia sin modificar de la cuantizacion estatica Q5_K_M en formato GGUF del modelo base, generada originalmente por mradermacher. El objetivo del repositorio es practico: consolidar en un unico archivo de 19,3 GB los pesos cuantizados para que un Inference Endpoint descargue solo ese fichero en lugar de todas las variantes del repositorio fuente.

El modelo resuelve el problema de despliegue de un LLM bilingue arabe-ingles de 27B en hardware modesto. La cuantizacion Q5_K_M reduce el peso a 19,3 GB, lo que permite servirlo en una GPU NVIDIA L4 de 24 GB, tal como hace la aplicacion Darby (دربي), una app que ensena a profesionales araboparlantes en Qatar el lenguaje de la IA, desarrollada para el hackathon Qai x Hugging Face en Doha.

La relevancia actual radica en que combina un modelo regional de calidad (Fanar 2, con soporte nativo de razonamiento desactivable por peticion y tool calling en su plantilla de chat) con un formato GGUF compatible con llama.cpp y endpoints OpenAI-compatible, lo que baja la barrera de entrada para servir LLMs arabes en produccion con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer; detalles no incluidos en la informacion proporcionada) |
| Parametros totales | 27.009.346.304 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (la model card usa 8.192 tokens para el calculo de KV cache, pero no confirma el maximo) |
| Tipos de cuantizacion | Q5_K_M (unica incluida en este repo) |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo unico, 19,3 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base QCRI/Fanar-2-27B-Instruct en los datos proporcionados: no se especifica si es un transformer denso convencional, el numero de capas, la dimension oculta ni la composicion del dataset de entrenamiento. El nombre y el recuento de parametros (27.009.346.304) indican un modelo denso de aproximadamente 27B, no una arquitectura MoE.

Lo que si se documenta es la plantilla de chat propia de Fanar 2, que incluye un bloque de instrucciones para tool calling y un mecanismo de razonamiento desactivable por peticion mediante `chat_template_kwargs: {"no_thinking": true}`. Esta plantilla fue adaptada para llama.cpp sustituyendo el bloque `{% raw %}` por un literal de cadena, ya que el motor Jinja de llama.cpp no soporta `raw`; el prompt renderizado es identico para chat simple, `no_thinking` y herramientas, verificado con jinja2. No se detallan en la informacion disponible los datos de entrenamiento, el numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en arabe e ingles, con enfasis en registro profesional y divulgativo.
- Razonamiento desactivable por peticion: el modo "thinking" puede apagarse con `no_thinking: true` en la plantilla de chat, lo que reduce latencia y tokens de salida.
- Tool calling / function calling: la plantilla de chat incluye instrucciones de herramientas y el modelo se sirve con `--jinja` en llama.cpp.
- Compatibilidad con la API de chat completions de OpenAI a traves del servidor de llama.cpp.
- Capacidades multilingues limitadas a arabe e ingles segun los metadatos del modelo.
- No se documentan capacidades de vision, audio ni otros modos en la informacion disponible.

## Casos de uso

- Ensenanza de conceptos de IA a profesionales araboparlantes: es exactamente el uso de Darby, que emplea el modelo para explicar terminologia tecnica en arabe e ingles con registro adaptado a un publico no especialista.
- Atencion al cliente bilingue en la region del Golfo: el modelo puede gestionar conversaciones multi-turno en arabe e ingles, con tool calling para consultar sistemas internos via la API OpenAI-compatible de llama.cpp.
- Despliegue en endpoints con scale-to-zero: el archivo unico de 19,3 GB simplifica el arranque en Inference Endpoints con una sola L4, reduciendo el tiempo de descarga y el coste de almacenamiento frente a repositorios con multiples cuantizaciones.
- Asistentes internos con razonamiento controlado: al poder desactivar el modo thinking por peticion, se puede usar el mismo modelo para respuestas rapidas (chat) y para tareas que requieren cadena de razonamiento, ajustando coste y latencia.
- Prototipado local en llama.cpp: desarrolladores que quieran evaluar un LLM arabe de 27B en hardware de una sola GPU consumer de gama alta o en una L4 pueden cargar el GGUF directamente con `llama-server`.
- Generacion de contenido divulgativo en arabe: redaccion de materiales formativos, guiones y FAQ sobre IA para publicos araboparlantes, con la ventaja de la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 19,3 GB de pesos mas 2,1 GB de KV cache a 8.192 tokens con cache de 8 bits (estimacion con hf-mem recogida en la model card), lo que suma aproximadamente 21,4 GB.
- GPU recomendadas: NVIDIA L4 (24 GB) es la configuracion documentada y validada por el autor del repositorio en un Inference Endpoint con scale-to-zero.
- Cabe en GPU consumer: si, en tarjetas con 24 GB o mas (por ejemplo, RTX 3090 o RTX 4090), siempre que se ajuste la longitud de contexto y el tipo de cache KV para no superar la VRAM.
- Opciones de despliegue: llama.cpp (`llama-server`) con `--jinja` y `--chat-template-file`; compatible con endpoints OpenAI de chat completions. No se documentan otras opciones (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Idiomas limitados a arabe e ingles; no se garantiza un comportamiento adecuado en castellano u otras lenguas.
- La longitud maxima de contexto no esta confirmada en la informacion disponible; el calculo de KV cache usa 8.192 tokens, pero no se afirma que sea el limite del modelo.
- La cuantizacion Q5_K_M introduce perdida de precision respecto a los pesos originales en safetensors; no se han publicado evaluaciones del degradado en este repositorio.
- El repositorio es una copia de terceros (nuvais) de una cuantizacion de terceros (mradermacher); la responsabilidad sobre el modelo base recae en QCRI.
- La plantilla de chat ha sido modificada respecto al original para funcionar en llama.cpp; aunque el autor afirma que el prompt renderizado es identico, conviene validarlo en el propio entorno antes de produccion.
- Riesgo de alucinacion inherente a los LLM, sin datos publicados sobre tasas de error en este modelo.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda conservar la atribucion a QCRI (modelo) y a mradermacher (cuantizacion).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nuvais/Fanar-2-27B-Instruct-Q5_K_M-GGUF
- Modelo base: https://huggingface.co/QCRI/Fanar-2-27B-Instruct
- Plantilla de chat original: https://huggingface.co/QCRI/Fanar-2-27B-Instruct/blob/074005040e9c3511b1c43b4298bef09908285534/chat_template.jinja
- Repositorio de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/Fanar-2-27B-Instruct-GGUF
- Herramienta de estimacion de memoria hf-mem: https://github.com/alvarobartt/hf-mem
