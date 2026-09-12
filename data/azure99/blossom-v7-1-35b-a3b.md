# Azure99/Blossom-V7.1-35B-A3B

## Resumen

Blossom-V7.1-35B-A3B es un modelo multimodal de pesos abiertos desarrollado por Azure99 dentro de la familia Blossom-V7.1, orientado a despliegue local y uso general como asistente. Se construye sobre el modelo base Qwen3.6-35B-A3B y combina comprension de imagenes, razonamiento con modo de pensamiento siempre activo y uso de herramientas con razonamiento intercalado. El repositorio declara 35.951.822.704 parametros totales (aproximadamente 35,95 mil millones) y un peso de 71,9 GB en safetensors, lo que es coherente con pesos en BF16.

La arquitectura es de tipo MoE (mezcla de expertos), segun la etiqueta `qwen3_5_moe`, con la nomenclatura "A3B" que en la convencion de la familia Qwen indica del orden de 3.000 millones de parametros activos por token; este dato concreto no se explicita en la informacion disponible. La longitud de contexto anunciada es de 262.144 tokens (256K), con recomendacion de usar 131.072 tokens (128K) para obtener los mejores resultados.

Su relevancia actual reside en tres puntos: dos modos de pensamiento (`medium` y `max`) con trazas de razonamiento mas cortas que las de sus modelos base de referencia, soporte de decodificacion especulativa mediante Multi-Token Prediction (MTP) tanto en vLLM como en llama.cpp, y una licencia Apache 2.0 que permite uso comercial. La model card advierte de que utiliza una plantilla de chat propia que no debe sustituirse por la nativa de los modelos Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), etiqueta `qwen3_5_moe`; transformer multimodal con codificador de vision |
| Parametros totales | 35.951.822.704 (aproximadamente 35,95B) |
| Parametros activos | no disponible (la nomenclatura "A3B" sugiere del orden de 3B activos, sin confirmar en la informacion) |
| Longitud de contexto | 262.144 tokens (256K); 131.072 tokens (128K) recomendados para mejores resultados |
| Tipos de cuantizacion | safetensors en BF16 (deducido de 71,9 GB para 35,95B parametros) y repositorio GGUF separado; los niveles concretos de cuantizacion no estan detallados en la informacion |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal) y GGUF (repo separado: Azure99/Blossom-V7.1-35B-A3B-GGUF) |
| Modelo base | Qwen3.6-35B-A3B |
| Modalidades de entrada | texto e imagen (pipeline `image-text-to-text`) |
| Plantilla de chat | personalizada, incluida en el repositorio; no sustituible por la nativa de Qwen |
| Parametros de muestreo recomendados | temperature=1.0, top_p=0.95, top_k=50, repetition_penalty=1.0 |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal con arquitectura de mezcla de expertos (MoE), heredada del modelo base Qwen3.6-35B-A3B. Incorpora un codificador de vision que permite procesar entradas de imagen junto con texto; la model card senala que existe una ruta solo texto en Transformers que omite dicho codificador. El razonamiento esta siempre activo y se organiza en dos modos: `medium`, que escala la profundidad de razonamiento segun la dificultad de la tarea, y `max`, que es el modo por defecto. La plantilla de chat incluida mapea los valores de `reasoning_effort` a estos modos: omitido o cualquier valor distinto de `low`, `medium` y `adaptive` activa `max`, mientras que `low`, `medium` y el alias `adaptive` activan `medium`.

El post-entrenamiento se orienta a uso general como asistente, cubriendo conversacion cotidiana, conocimiento del mundo, matematicas y razonamiento, programacion, desarrollo web y visualizacion de datos. El pipeline de datos emplea BlossomData, el framework de codigo abierto del autor para procesamiento y sintesis de datos a escala, con filtrado mediante LLM-as-Judge y, cuando procede, verificacion Agent-as-Judge ejecutada en AgentBox, un entorno de trabajo para agentes que utiliza busqueda, interaccion con navegador, captura de pantalla y ejecucion de codigo. Las muestras de desarrollo web y visualizacion de datos pasan un cribado adicional de funcionalidad, usabilidad y calidad visual. El conjunto de datos de entrenamiento se publicara en una actualizacion futura. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Como innovacion tecnica destacable, el modelo soporta decodificacion especulativa mediante Multi-Token Prediction (MTP), disponible tanto en vLLM como en llama.cpp, lo que reduce la latencia de generacion. Ademas, el razonamiento intercalado permite al modelo razonar y decidir antes de cada llamada a herramienta.

## Capacidades

- Generacion de texto conversacional y conocimiento general del mundo.
- Razonamiento con modo de pensamiento siempre activo, con dos niveles de esfuerzo (`medium` y `max`).
- Razonamiento matematico y resolucion de problemas.
- Generacion de codigo, desarrollo web y visualizacion de datos.
- Comprension de imagenes: acepta entradas de imagen junto a texto (pipeline `image-text-to-text`).
- Uso de herramientas (tool calling / function calling) con razonamiento intercalado antes de cada llamada, lo que habilita flujos de agente.
- Flujos agenticos multi-paso, con soporte de busqueda, navegacion, captura de pantalla y ejecucion de codigo en el pipeline de verificacion del autor.
- Capacidades multilingues limitadas a ingles y chino.
- Decodificacion especulativa mediante MTP en vLLM y llama.cpp.
- Reproduccion del razonamiento en conversaciones multi-turno: es necesario reenviar el mensaje completo del asistente (incluido el razonamiento) para no degradar el rendimiento en turnos posteriores.

## Casos de uso

- Asistencia conversacional multi-turno en ingles o chino: con 256K tokens de contexto (128K recomendados) el modelo puede mantener hilos largos con historial extenso, siempre que se reenvie el mensaje completo del asistente, incluido el razonamiento, para preservar la calidad en turnos sucesivos.
- Agentes autonomos con uso de herramientas: el razonamiento intercalado antes de cada llamada a herramienta permite construir agentes que planifican, invocan funciones externas y reevaluan el resultado, adecuado para tareas de automatizacion de flujos de trabajo.
- Generacion de codigo en produccion: puede integrarse en pipelines de CI/CD como revisor de cambios o generador de pruebas, aprovechando el soporte de tool calling para interactuar con sistemas de control de versiones o ejecutar comandos.
- Desarrollo web asistido: la model card indica entrenamiento especifico en desarrollo web con cribado de funcionalidad, usabilidad y calidad visual, lo que lo hace util para generar y revisar interfaces a partir de descripciones textuales o capturas.
- Visualizacion de datos: dado un conjunto de datos tabulares o una descripcion, el modelo puede proponer representaciones graficas y generar el codigo correspondiente, con el mismo cribado de calidad visual mencionado por el autor.
- Analisis de documentos con imagenes: al aceptar entradas de imagen junto con texto, puede procesar capturas, diagramas o graficos y responder preguntas sobre ellos en tareas de soporte tecnico o extraccion de informacion.
- Despliegue local con recursos limitados: al ser un MoE con un numero reducido de parametros activos, la variante 35B-A3B esta pensada por el autor como la opcion orientada a throughput para inferencia en CPU o hibrida CPU/GPU, con calidad practica incluso con descarga parcial a CPU.
- Asistencia educativa en matematicas y razonamiento: el modo `medium` ajusta la profundidad del razonamiento a la dificultad del problema, lo que resulta util para tutoria con coste computacional controlado; el modo `max` queda para problemas que requieren razonamiento exhaustivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas con metricas como MMLU, HumanEval o GSM8K, ni comparaciones numericas con modelos similares.

El unico dato comparativo aportado por el autor es cualitativo y se refiere a la longitud de las trazas de razonamiento: el modo `medium` produce trazas aproximadamente cuatro veces mas cortas que las de Qwen3.5 y cinco veces mas cortas que las de Qwen3.6, manteniendo, segun el autor, alta calidad de resultados. No se proporcionan cifras de precision asociadas a esa afirmacion.

| Metrica | Blossom-V7.1-35B-A3B | Referencia |
|---|---|---|
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |
| Longitud de traza de razonamiento (`medium`) | aproximadamente 1/4 de Qwen3.5 y 1/5 de Qwen3.6 | Qwen3.5, Qwen3.6 |

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 72 GB solo para pesos (71,9 GB de repositorio), mas memoria para cache KV y codificador de vision. Requiere GPU de 80 GB (H100 80GB, A100 80GB) o reparto en varias GPU.
- VRAM estimada en cuantizacion de 8 bits: del orden de 36-38 GB. Encaja en A100 80GB, H100 80GB o configuraciones de 2x RTX 4090 (48 GB agregados).
- VRAM estimada en cuantizacion de 4 bits: del orden de 20-22 GB. Puede caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con ventana de contexto moderada.
- Cuantizaciones de 3 bits: del orden de 15 GB, viables en GPU de 16 GB con contexto reducido.
- Despliegue hibrido CPU/GPU: es el escenario que el propio autor recomienda para esta variante, planteada como opcion orientada a throughput para CPU o inferencia hibrida, con calidad practica incluso con descarga parcial a CPU.
- GPU recomendadas por escenario: H100 o A100 80GB para BF16 sin cuantizar; A100 40GB en par o 2x RTX 4090 para 8 bits; RTX 4090, RTX 3090 o RTX 4080 para 4 bits; CPU con memoria de sistema abundante para la ruta MoE de bajo ratio de parametros activos.
- Si cabe en GPU de consumo: si, en cuantizaciones de 4 bits o inferiores en GPU de 24 GB, con contexto limitado respecto a los 256K maximos.
- Opciones de despliegue: Transformers (se requiere `transformers>=5.12.1` y `accelerate`), vLLM y llama.cpp, ambos con soporte de decodificacion especulativa MTP segun la model card. El repositorio GGUF permite usarlo con llama.cpp y herramientas compatibles; no se confirma explicitamente el soporte en otros motores.
- Cache KV: con 256K tokens de contexto la cache KV puede ser muy voluminosa incluso con MoE; el autor recomienda 128K para obtener los mejores resultados, lo que tambien reduce el consumo.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Blossom-V7.1-35B-A3B | 35,95B totales (activos no disponibles) | 256K (128K recomendado) | Texto e imagen | apache-2.0 | safetensors + GGUF + demo | Variante orientada a throughput en CPU o hibrido CPU/GPU |
| Blossom-V7.1-27B | no disponible | no disponible | no disponible | apache-2.0 (heredada de la familia) | safetensors + GGUF + demo | Opcion densa mas capaz, pensada para despliegue en GPU con pesos en memoria de GPU |
| Blossom-V7.1-9B | no disponible | no disponible | no disponible | apache-2.0 (heredada de la familia) | safetensors + GGUF + demo | Opcion de menores recursos, para GPU con memoria limitada y dispositivos moviles |
| Qwen3.6-35B-A3B (modelo base) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | HuggingFace (Qwen) | Base sobre la que se construye esta variante; usa plantilla de chat nativa distinta |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada; la seleccion entre ellas se plantea en la model card en terminos de objetivo de calidad, hardware de inferencia y presupuesto de memoria.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino. No hay soporte declarado de castellano ni de otros idiomas, por lo que el rendimiento fuera de esos dos idiomas es desconocido y probablemente degradado.
- Plantilla de chat obligatoria: el modelo usa una plantilla personalizada distinta de la nativa de los Qwen base. Sustituirla o combinarla con la nativa puede romper el formato de razonamiento y de llamadas a herramientas.
- Replay del razonamiento: en conversaciones multi-turno es obligatorio reenviar el mensaje completo del asistente, razonamiento incluido. Omitir el razonamiento previo degrada de forma significativa el rendimiento en turnos posteriores. Los frameworks de agente deben configurarse para conservar el mensaje completo en el historial.
- Riesgo de alucinacion: no se documenta ningun mecanismo especifico de mitigacion ni tasas de alucinacion medidas. Como modelo generativo de uso general, es susceptible de producir informacion incorrecta con aparente solidez.
- Sesgos: no se publica informacion sobre evaluacion de sesgos, composicion demografica del dataset ni mitigaciones aplicadas.
- Contexto: aunque se anuncian 256K tokens, el propio autor recomienda 128K para obtener los mejores resultados, lo que sugiere degradacion de calidad por encima de ese umbral.
- Datos de entrenamiento no publicados: el conjunto de datos se liberara en una actualizacion futura, por lo que actualmente no es posible auditar la composicion del corpus ni el origen de los datos.
- Ausencia de benchmarks: no hay resultados publicados que permitan verificar las afirmaciones cualitativas de calidad del autor.
- Licencia: Apache 2.0 permite uso comercial, pero deben verificarse las condiciones del modelo base Qwen3.6-35B-A3B y de los pesos derivados, asi como el cumplimiento de las licencias de terceros aplicables en despliegues de produccion.
- Madurez del repositorio: el modelo registra 0 descargas y 0 "me gusta" en el momento de la consulta, por lo que no existe validacion comunitaria independiente ni casos de produccion documentados.
- Vision: la model card menciona que la ruta de solo texto en Transformers omite el codificador de vision; usar esa ruta desactiva las capacidades multimodales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Azure99/Blossom-V7.1-35B-A3B
- Repositorio GGUF de esta variante: https://huggingface.co/Azure99/Blossom-V7.1-35B-A3B-GGUF
- Demo de esta variante: https://huggingface.co/spaces/Azure99/Blossom-35B-A3B-Demo
- Variante Blossom-V7.1-27B: https://huggingface.co/Azure99/Blossom-V7.1-27B
- GGUF de la variante 27B: https://huggingface.co/Azure99/Blossom-V7.1-27B-GGUF
- Demo de la variante 27B: https://huggingface.co/spaces/Azure99/Blossom-27B-Demo
- Variante Blossom-V7.1-9B: https://huggingface.co/Azure99/Blossom-V7.1-9B
- GGUF de la variante 9B: https://huggingface.co/Azure99/Blossom-V7.1-9B-GGUF
- Demo de la variante 9B: https://huggingface.co/spaces/Azure99/Blossom-9B-Demo
- Repositorio GitHub de BlossomLM: https://github.com/Azure99/BlossomLM
- Interfaz de chat: https://blossom-chat.com/
- Framework de datos BlossomData: https://github.com/Azure99/BlossomData
- Entorno de agentes AgentBox: https://github.com/Azure99/agentbox
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo base Qwen3.8-27B (variante 27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base Qwen3.5-9B (variante 9B): https://huggingface.co/Qwen/Qwen3.5-9B

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio en HuggingFace.
