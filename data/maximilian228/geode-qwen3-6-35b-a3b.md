# Maximilian228/Geode-Qwen3.6-35B-A3B

## Resumen

Geode-Qwen3.6-35B-A3B es un paquete de pesos cuantizados del modelo Qwen3.6-35B-A3B (35 000 millones de parametros totales, 3000 millones activos por token) preparado por el desarrollador Maximilian228 para Geode, una aplicacion Android que ejecuta el modelo integramente en el telefono. El objetivo es permitir inferencia local sin nube ni cuenta de usuario, leyendo los expertos del almacenamiento del dispositivo a medida que se necesitan, de modo que el modelo completo no tiene que residir en la RAM.

El paquete publicado es un unico conjunto Q4 de 20,8 GB (19,3 GiB) en el que cada matriz esta cuantizada a 4 bits con GPTQ, mientras que el embedding y el codificador de vision se mantienen a 8 bits. Esta pensado para dispositivos con Snapdragon 8 Gen 2, Gen 3 o 8 Elite con 12 GB o mas de RAM, aprovechando la GPU Adreno 7xx+ para alcanzar del orden de 20 tokens por segundo.

La relevancia de esta ficha es doble: por un lado documenta una via practica de llevar un MoE de 35B a hardware movil; por otro, advierte de que el formato es propietario de Geode (`geode.json` mas un layout de expertos orientado a GPU) y no es compatible con GGUF ni con otros runtimes, lo que limita su uso fuera de esa aplicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) derivada de Qwen3.6-35B-A3B; incluye codificador de vision (pipeline image-text-to-text) |
| Parametros totales | 35 000 millones |
| Parametros activos | 3000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4 bits en todas las matrices; embedding a 8 bits; codificador de vision a 8 bits |
| Idiomas soportados | no disponible (la calibracion cubre 30 idiomas, entre ellos ingles y ucraniano) |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato propio de Geode (`geode.json` + expertos en layout tiled); no es GGUF |
| Tamano del paquete | 20,8 GB (19,3 GiB) |
| Requisitos de plataforma | Android 11+, ARM de 64 bits con instrucciones de producto punto (ARMv8.2) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.6-35B-A3B, un transformer de mezcla de expertos con 35B parametros totales y 3B activos por token, lo que reduce el coste computacional por token a costa de mantener un estado de pesos grande. El paquete Geode conserva esa estructura MoE y anade un codificador de vision, ya que la pipeline declarada es image-text-to-text. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base dentro de la informacion proporcionada.

La innovacion tecnica de este paquete es el esquema de cuantizacion y el formato de almacenamiento. La cuantizacion GPTQ se aplica capa por capa, de forma que cada capa se calibra sobre la salida que producen las capas cuantizadas anteriores. El conjunto de calibracion comprende 228 000 tokens con texto de chat, codigo, ingles y ucraniano, conversaciones de agente con llamadas a herramientas, el propio razonamiento del modelo y 30 idiomas. La calidad se mide sobre texto reservado de cada tipo (codigo, documentos, ingles, otros idiomas, una sesion de agente, uso de herramientas y razonamiento) mediante divergencia KL respecto al modelo BF16 y la tasa de coincidencia del token top-1. El resultado declarado para el pack Q4 es 0,096 de KL y 90,9 % de top-1. El formato de expertos en layout tiled orientado a GPU permite la lectura bajo demanda desde el almacenamiento, que es lo que hace viable ejecutar el modelo sin cargarlo entero en RAM.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es de proposito general y el paquete incluye calibracion especifica sobre trazas de razonamiento.
- Procesamiento de imagen y texto: la pipeline image-text-to-text y el codificador de vision a 8 bits indican soporte de entrada visual.
- Generacion de codigo: la calibracion incluye texto de codigo y se evalua con texto reservado de ese dominio.
- Uso de herramientas: la calibracion cubre conversaciones de agente con llamadas a herramientas y se evalua una sesion de agente y el uso de herramientas.
- Razonamiento multi-paso y agentes: el modelo base esta orientado a flujos de agente; el paquete conserva esa capacidad dentro de los limites de la cuantizacion.
- Multilingue: la calibracion abarca 30 idiomas, con enfasis declarado en ingles y ucraniano; no se detalla la lista completa ni el nivel de calidad por idioma.
- Ejecucion en dispositivo: inferencia local en Android sin nube ni cuenta, con lectura de expertos desde almacenamiento.

## Casos de uso

- Asistente personal offline en telefono: la aplicacion Geode carga el pack Q4 y responde conversaciones multi-turno sin conexion, leyendo los expertos desde el almacenamiento; adecuado para usuarios que no quieren enviar datos a la nube.
- Descripcion y analisis de imagenes en el dispositivo: gracias al codificador de vision a 8 bits y a la pipeline image-text-to-text, se puede pedir al modelo que describa una foto o extraiga texto de una captura sin salir del telefono.
- Asistencia a la programacion en movilidad: el pack incluye calibracion sobre codigo y puede usarse para explicar fragmentos, sugerir correcciones o generar pequenos parches desde el telefono, con la salvedad de que el contexto disponible no esta documentado.
- Agentes locales con llamadas a herramientas: la calibracion cubre conversaciones de agente con tool calls, por lo que el modelo puede encadenar pasos y consultar funciones expuestas por la aplicacion anfitriona.
- Escenarios de privacidad y cumplimiento: al ejecutarse integramente en el dispositivo, encaja en entornos donde no se permite enviar texto o imagenes a servicios externos, como notas medicas o documentos personales.
- Prototipado y evaluacion de MoE en hardware movil: util para investigadores que quieran medir latencia y calidad de un MoE de 35B con 3B activos en Snapdragon 8 Gen 2/3/8 Elite, con un rendimiento declarado de unos 20 tokens/s.
- Traduccion y procesamiento multilingue: la calibracion cubre 30 idiomas, lo que permite probar tareas de traduccion o resumen en idiomas distintos del ingles, aunque la calidad por idioma no esta documentada.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Divergencia KL vs BF16 (pack Q4) | 0,096 | Medida sobre texto reservado de codigo, documentos, ingles, otros idiomas, sesion de agente, uso de herramientas y razonamiento |
| Coincidencia top-1 vs BF16 (pack Q4) | 90,9 % | Misma evaluacion |
| Throughput declarado | ~20 tokens/s | Snapdragon 8 Gen 2 / Gen 3 / 8 Elite con GPU Adreno 7xx+ |
| Tamano del pack Q4 | 20,8 GB (19,3 GiB) | Pesos cuantizados |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: el pack Q4 ocupa 20,8 GB (19,3 GiB) en almacenamiento; el modelo no necesita caber entero en RAM porque los expertos se leen bajo demanda, pero se requiere espacio libre suficiente para el pack.
- RAM minima declarada: 12 GB o mas.
- SoC recomendados: Snapdragon 8 Gen 2, Snapdragon 8 Gen 3 y Snapdragon 8 Elite, con GPU Adreno 7xx o superior.
- Requisitos de CPU: Android 11+, procesador ARM de 64 bits con instrucciones de producto punto (ARMv8.2).
- Cabe en GPU de consumo: no aplica; el destino es la GPU integrada del telefono. No se documenta soporte para GPU de escritorio.
- Opciones de despliegue: exclusivamente la aplicacion Geode (beta en Google Play, geode.tifu.xyz). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato no es GGUF.
- Latencia y throughput: aproximadamente 20 tokens/s en los SoC indicados; no se publican cifras de latencia por token ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Geode-Qwen3.6-35B-A3B (este) | 35B / 3B | no disponible | Propietario Geode | Apache-2.0 | Solo app Geode en Android |
| Qwen/Qwen3.6-35B-A3B (base) | 35B / 3B | no disponible | Safetensors (BF16 presumiblemente) | Apache-2.0 | Servidores GPU, vLLM, TGI |
| Alternativas cuantizadas en GGUF del mismo base | 35B / 3B | no disponible | GGUF | Apache-2.0 | llama.cpp, Ollama, LM Studio |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada. La diferencia principal frente al modelo base es el formato y el publico objetivo: el pack Geode esta atado a una aplicacion Android concreta, mientras que el base y sus derivados GGUF se pueden desplegar en servidores o en estaciones de trabajo.

## Limitaciones y advertencias

- Formato cerrado: los pesos no son GGUF y no cargan en otros runtimes; solo funcionan dentro de la aplicacion Geode.
- Dependencia de plataforma: requiere Android 11+, ARMv8.2 con producto punto y un SoC Snapdragon de la lista; no hay soporte documentado para otros fabricantes ni para escritorio.
- Calidad degradada por cuantizacion: el pack Q4 presenta 0,096 de divergencia KL y 90,9 % de coincidencia top-1 frente a BF16, lo que implica perdida medible de fidelidad respecto al modelo original.
- Riesgo de alucinacion: la propia model card advierte de que las respuestas provienen de un modelo de IA y pueden ser erroneas.
- Idiomas: aunque la calibracion cubre 30 idiomas, no se publica la lista ni la calidad por idioma; el enfasis declarado esta en ingles y ucraniano, por lo que el rendimiento en castellano no esta verificado.
- Contexto: no se documenta la longitud de contexto soportada, lo que impide planificar tareas de contexto largo con garantias.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Licencia: Apache-2.0 permite uso comercial, pero el formato propietario y la dependencia de la app Geode limitan de facto la explotacion comercial fuera de ese ecosistema.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la aplicacion esta en beta; conviene tratarlo como material experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maximilian228/Geode-Qwen3.6-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Aplicacion Geode: https://geode.tifu.xyz
- Carpeta del pack Q4: https://huggingface.co/Maximilian228/Geode-Qwen3.6-35B-A3B/tree/main/Q4
