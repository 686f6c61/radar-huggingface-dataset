# mdaiworks/yengi-router-1.5b

## Resumen

Yengi Router 1.5B es un modelo de enrutado de intenciones y tareas ("local intent & task routing") desarrollado por mdaiworks, un ajuste fino de Qwen/Qwen2.5-Coder-1.5B-Instruct orientado a un uso muy concreto: analizar el prompt del usuario y decidir localmente, en el propio equipo, qué proveedor de IA, herramienta o modo de codificación debe atender la petición. No es un modelo de propósito general, sino un clasificador generativo integrado en Yengi, un asistente de programación con IDE propio.

El modelo se distribuye en formato GGUF con cuantización Q4_K_M (4 bits) y pesa 1.543.714.304 parámetros, lo que lo sitúa en la gama de 1,5B típica para inferencia en CPU o GPU de gama baja. Su licencia es Apache 2.0, los idiomas declarados son turco e inglés, y el repositorio ocupa 2,0 GB. La model card documenta únicamente el uso mediante Ollama y la descarga automática desde el propio IDE, sin detallar el proceso de entrenamiento ni resultados de evaluación.

Su relevancia actual está en la arquitectura de sistemas multi-modelo: en lugar de enviar cada consulta a un modelo grande en la nube, un router local de 1,5B puede clasificar la petición y derivarla al recurso adecuado, reduciendo coste y latencia. Es un ejemplo de "modelo componente" especializado y pequeño, más que de modelo conversacional autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (modelo base Qwen2.5-Coder-1.5B-Instruct); dimensiones internas detalladas no disponibles |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-Coder-1.5B-Instruct soporta 32.768 tokens nativos (no confirmado para este ajuste) |
| Tipos de cuantizacion | Q4_K_M (4 bits) es la unica publicada en el repositorio |
| Idiomas soportados | Turco (tr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado Q4_K_M); los metadatos indican un recuento de parametros obtenido de safetensors del modelo original |
| Tamano del repositorio | 2,0 GB |
| Descargas acumuladas | 230 |
| Uso previsto | Enrutado local de intenciones y tareas para Yengi IDE |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-Coder-1.5B-Instruct: un transformer decoder-only de tipo denso (no MoE, no SSM ni hibrido) con codificacion posicional rotatoria y atencion de tipo grouped-query en la familia Qwen2. El ajuste realizado por mdaiworks reutiliza esa estructura y la especializa para una tarea de clasificacion/enrutado: la salida del modelo se interpreta como la decision de a qué proveedor, herramienta o modo de codificacion se debe dirigir una peticion del usuario.

No hay informacion publicada sobre el proceso de entrenamiento: se desconoce el volumen de tokens utilizados, la composicion del dataset de enrutado, si hubo anotacion humana de etiquetas de destino, y si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO sobre el ajuste. Tampoco se documentan innovaciones tecnicas propias mas alla de la cuantizacion Q4_K_M para ejecucion local; el modelo base, por su parte, incorpora el pipeline de instruccion de Alibaba, incluyendo ajuste supervisado y optimizacion por preferencias, segun la documentacion publica de Qwen.

## Capacidades

- Enrutado de intenciones: clasificar un prompt entrante y determinar qué proveedor de IA, herramienta o modo de codificacion debe gestionarlo.
- Clasificacion de texto corta orientada a decisiones discretas (etiquetas de destino), no a conversacion abierta.
- Comprension de prompts en turco e ingles.
- Base de codigo heredada de Qwen2.5-Coder-1.5B-Instruct, lo que le permite reconocer terminologia de programacion presente en los prompts que debe enrutar.
- Ejecucion local y offline, sin dependencia de APIs externas, con latencia declarada por el autor de "milisegundos".
- Integracion directa con Ollama mediante un Modelfile sencillo y con la descarga automatica desde Yengi IDE (Ajustes > Local Router).
- No se documentan capacidades de tool calling, function calling generico, agentes multi-paso, vision, audio ni modo de razonamiento explicito. Tampoco se documenta una funcion de generacion de texto abierta mas alla del proposito de enrutado.

## Casos de uso

- Enrutado de consultas en Yengi IDE: es el caso de uso para el que se entreno el modelo; en cada prompt del usuario, el router decide qué modo de codificacion o proveedor debe responder, y el IDE ejecuta esa decision.
- Reduccion de coste en arquitecturas multi-modelo: desplegado como primera etapa, clasifica la peticion y solo las consultas complejas se envian a un modelo grande en la nube, mientras que las triviales se resuelven con un modelo local.
- Seleccion de herramienta en asistentes de programacion: dado un prompt como "genera los tests de este modulo", el router puede determinar si corresponde invocar una herramienta de ejecucion de tests, un generador de codigo o un explicador.
- Triaje de tickets internos: con contexto corto y vocabulario tecnico en ingles o turco, puede clasificar incidencias y dirigirlas al equipo o al sistema correspondiente.
- Guardarraíl de privacidad: al ejecutarse integramente en local, permite clasificar prompts con codigo propietario sin enviarlos a un servicio externo antes de decidir su destino.
- Despliegue en entornos con hardware limitado: su tamano y cuantizacion permiten ejecutarlo en portatiles o equipos sin GPU dedicada como componente de un pipeline mayor.
- Prefiltrado en pipelines de CI/CD: puede etiquetar la intencion de mensajes de commit o de descripciones de pull request para disparar automatizaciones concretas.
- Enrutado multilingue turco-ingles en soporte tecnico: en organizaciones que operan en ambos idiomas, unifica la clasificacion de peticiones sin necesidad de dos modelos separados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni tampoco metricas especificas de la tarea de enrutado (exactitud de clasificacion, matriz de confusion, F1 por clase). Tampoco hay datos medidos de latencia o throughput; la unica referencia de rendimiento es la afirmacion cualitativa del autor de que el modelo decide "en milisegundos".

## Requisitos de hardware

- VRAM/RAM estimada: no hay mediciones publicadas. Como referencia aritmetica, una cuantizacion Q4_K_M sobre 1,5B parametros ronda 0,9-1,1 GB de pesos, por lo que la inferencia completa con cache de contexto pequena cabe holgadamente en torno a 1,5-2 GB de memoria, ya sea VRAM o RAM del sistema.
- GPU: cualquier GPU con 2 GB o mas de VRAM es suficiente en la practica, incluidas integradas recientes. GPU de gama alta como A100, H100 o RTX 4090 estan sobredimensionadas para este modelo y solo tendrian sentido para servir muchas peticiones concurrentes.
- Consumer GPU: si, cabe en practicamente cualquier GPU de consumo actual y en muchas de generaciones anteriores (por ejemplo, modelos con 4 GB o mas de VRAM). Tambien es viable en CPU y en dispositivos tipo Raspberry Pi 5 para clasificacion de baja concurrencia.
- Opciones de despliegue: Ollama es la via documentada por el autor (creacion del modelo con `ollama create` a partir del GGUF); tambien son aplicables llama.cpp, LM Studio, koboldcpp o bindings de llama-cpp-python. vLLM y TGI tienen soporte limitado o experimental de GGUF, por lo que para este formato no son la primera opcion.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni tiempos de respuesta medidos, solo la afirmacion cualitativa de latencia en milisegundos para la tarea de enrutado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparativa se limita a caracteristicas objetivas frente a alternativas de tamano similar que podrian cumplir funciones parecidas de clasificacion o enrutado local.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento |
|---|---|---|---|---|---|
| mdaiworks/yengi-router-1.5b | 1,5B | No especificado en la model card | Apache 2.0 | Router de intenciones ajustado para Yengi IDE | No disponible |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | Modelo de codigo e instrucciones de proposito general (modelo base de este router) | No disponible en la informacion proporcionada |
| Llama-3.2-1B-Instruct | 1,23B | 128.000 tokens | Llama 3.2 Community License | Asistente ligero de proposito general | No disponible en la informacion proporcionada |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | Asistente ligero de proposito general | No disponible en la informacion proporcionada |

La diferencia principal de Yengi Router frente a estas alternativas no es de capacidad bruta, sino de especializacion: los otros modelos son asistentes generales que exigirian ingenieria de prompts para actuar como routers, mientras que este esta entrenado especificamente para esa tarea dentro de un producto concreto.

## Limitaciones y advertencias

- Modelo de proposito restringido: no es un asistente conversacional ni un generador de codigo; su salida esta pensada para ser consumida por la logica de enrutado de Yengi IDE. Usarlo como chatbot general dara resultados degradados.
- Idiomas limitados a turco e ingles; no se declara soporte de castellano ni de otros idiomas, por lo que su comportamiento fuera de esas dos lenguas es incierto.
- Documentacion tecnica muy escasa: no se publican datos de entrenamiento, hiperparametros, composicion del dataset ni evaluaciones, lo que dificulta auditar su comportamiento o reproducir su ajuste.
- Riesgo de alucinacion en la clasificacion: como modelo generativo, puede producir etiquetas de destino no validas o inventar herramientas o proveedores que no existen en el sistema; en produccion conviene validar la salida contra un conjunto cerrado de etiquetas.
- Riesgo de sesgo de dominio: al estar ajustado sobre un producto especifico (Yengi), puede enrutar de forma suboptima prompts procedentes de otros flujos de trabajo.
- Sin datos de robustez: no hay informacion sobre como responde a prompts ambiguos, contradictorios o adversariales, ni sobre su tasa de error por clase.
- Acoplamiento a la aplicacion: la experiencia de uso depende de Yengi IDE y de su integracion con Ollama; fuera de ese ecosistema hay que construir el pipeline de interpretacion de la salida.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones copyleft, pero no exime de las obligaciones de atribucion ni de las condiciones que puedan aplicar al modelo base Qwen2.5-Coder-1.5B-Instruct, tambien Apache 2.0.
- Proyecto con adopcion muy baja (230 descargas y 1 "like"), sin garantias de mantenimiento, soporte ni actualizaciones futuras.
- Formato unico GGUF Q4_K_M: no se ofrecen otras cuantizaciones ni pesos en safetensors listos para reentrenamiento o ajuste adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdaiworks/yengi-router-1.5b
- Repositorio de Yengi IDE: https://github.com/mdaiWorks/Yengi
- Perfil del desarrollador en GitHub: https://github.com/mdaiworks
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct

Nota: las busquedas web realizadas no devolvieron resultados relacionados con este modelo; los resultados obtenidos eran articulos de prensa sin relacion con el contenido de esta ficha. No se han localizado papers, blogs tecnicos ni demos adicionales.
