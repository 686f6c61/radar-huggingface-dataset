# Azure99/Blossom-V7.1-9B

## Resumen

Blossom-V7.1-9B es un modelo multimodal de pesos abiertos desarrollado por Azure99 dentro de la familia Blossom-V7.1, orientada al despliegue local. Se construye sobre el modelo base Qwen3.5-9B y esta disenado como asistente conversacional de proposito general que combina razonamiento con modo de pensamiento siempre activo, uso de herramientas con razonamiento intercalado y comprension de imagenes. Con 9.653.104.368 parametros reales (9,65 B) y un repositorio de 19,3 GB en safetensors, se posiciona como la variante de menor consumo de la familia, pensada para GPUs con memoria limitada, dispositivos moviles y cargas de trabajo ligeras.

La propuesta tecnica mas destacable es su esquema de pensamiento en dos modos, `medium` y `max`, con `max` por defecto. El modo `medium` escala la profundidad de razonamiento segun la dificultad de la tarea y genera trazas de razonamiento aproximadamente cuatro veces mas cortas que las de Qwen3.5 y cinco veces mas cortas que las de Qwen3.6. Ademas, soporta decodificacion especulativa mediante Multi-Token Prediction (MTP) tanto en vLLM como en llama.cpp, lo que reduce la latencia de inferencia.

El modelo cubre conversacion cotidiana, conocimiento del mundo, matematicas, razonamiento, codigo, desarrollo web y visualizacion de datos, y admite flujos agenticos con llamadas a herramientas. Su licencia Apache-2.0 y la disponibilidad de cuantizaciones GGUF lo hacen atractivo para integraciones en produccion, aunque conviene tener en cuenta que exige una plantilla de chat propia distinta de la nativa de Qwen y que solo declara soporte de ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (arquitectura Qwen3.5) con codificador de vision; tag de arquitectura `qwen3_5` |
| Parametros totales | 9.653.104.368 (9,65 B), dato real de safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K); se recomienda 131.072 tokens (128K) para mejores resultados |
| Tipos de cuantizacion | Repositorio GGUF publicado (Azure99/Blossom-V7.1-9B-GGUF); los niveles concretos de cuantizacion no se detallan en la informacion disponible |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repo principal, 19,3 GB) y GGUF (repo separado) |

## Arquitectura y entrenamiento

Blossom-V7.1-9B es un transformer denso de 9,65 B de parametros derivado de Qwen3.5-9B, con pipeline `image-text-to-text`, es decir, con un codificador de vision que permite procesar imagenes junto a texto. El modelo tiene el pensamiento siempre activo en dos modos: `medium` y `max`, con `max` como valor por defecto. La plantilla de chat incluida mapea los valores de `reasoning_effort` a esos modos: omitido equivale a `max`; `low`, `medium` y `adaptive` equivalen a `medium`; cualquier otro valor equivale a `max`. Incorpora ademas decodificacion especulativa mediante Multi-Token Prediction (MTP) soportada en vLLM y en llama.cpp. Es importante senalar que utiliza una plantilla de chat personalizada que difiere de las plantillas nativas de sus modelos base Qwen y que no debe sustituirse ni combinarse con ellas.

El post-entrenamiento esta orientado al uso como asistente general en conversacion cotidiana, conocimiento del mundo, matematicas y razonamiento, programacion, desarrollo web y visualizacion de datos. El pipeline de datos emplea BlossomData, un framework de codigo abierto del mismo autor para procesamiento y sintesis de datos a escala, con filtrado mediante LLM-as-Judge y, cuando corresponde, verificacion Agent-as-Judge ejecutada en AgentBox, un entorno de trabajo para agentes que utiliza busqueda, interaccion con navegador, captura de pantallas y ejecucion de codigo segun necesidad. Las muestras de desarrollo web y visualizacion de datos reciben un cribado adicional de funcionalidad, usabilidad y calidad visual. No se especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset, y los datos de entrenamiento se publicaran en una actualizacion futura. No se documentan en la informacion disponible etapas concretas de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto de hasta 256K tokens (128K recomendados).
- Razonamiento con modo de pensamiento siempre activo en dos niveles (`medium` y `max`), con profundidad adaptativa segun la dificultad de la tarea.
- Razonamiento matematico y resolucion de problemas.
- Generacion de codigo, desarrollo web y visualizacion de datos.
- Comprension de imagenes: el modelo acepta entradas de imagen junto a texto (pipeline `image-text-to-text`).
- Uso de herramientas (tool calling) con razonamiento intercalado: razona y decide antes de cada llamada a herramienta, lo que mejora el rendimiento en tareas agenticas.
- Flujos de agente y razonamiento multi-paso, con soporte de verificacion Agent-as-Judge durante el desarrollo del modelo.
- Capacidades multilingues limitadas a ingles y chino.
- Decodificacion especulativa mediante MTP en vLLM y llama.cpp para acelerar la inferencia.
- Reproduccion de razonamiento en multi-turno: el historial debe conservar el mensaje completo del asistente, incluida su traza de razonamiento, para no degradar el rendimiento en turnos posteriores.

## Casos de uso

- Asistente conversacional local: el modelo puede mantener conversaciones multi-turno con contexto largo (hasta 256K tokens) en equipos con GPU de gama alta para consumidor, gracias a sus 9,65 B de parametros y a las cuantizaciones GGUF disponibles.
- Atencion al cliente automatizada: admite tool calling con razonamiento intercalado, lo que permite consultar sistemas internos (estado de pedidos, incidencias, catalogos) antes de responder, y el modo `medium` reduce la longitud de las trazas de razonamiento y, con ello, el coste por interaccion.
- Agentes autonomos multi-paso: su razonamiento previo a cada llamada a herramienta encaja con frameworks de agentes que necesitan planificar, ejecutar acciones y encadenar resultados, siempre conservando el mensaje completo del asistente en el historial.
- Generacion de codigo en produccion: puede integrarse en pipelines de asistencia al desarrollo o de revision de codigo, y combinarse con ejecucion de codigo como herramienta para validar las propuestas antes de devolverlas.
- Desarrollo web y prototipado de interfaces: el modelo ha recibido entrenamiento especifico en desarrollo web con cribado adicional de funcionalidad y calidad visual, lo que lo hace util para generar maquetas, componentes y pequenas aplicaciones.
- Visualizacion de datos: puede transformar descripciones o conjuntos de datos en graficos y paneles, otra de las areas con filtrado adicional de usabilidad y calidad visual durante el post-entrenamiento.
- Analisis de documentos con imagenes: al aceptar entradas de imagen junto a texto, permite extraer informacion de capturas, diagramas o tablas y razonar sobre ellas en el mismo contexto.
- Despliegue en hardware modesto: la variante de 9B es la opcion de menores recursos de la familia, pensada para GPUs con memoria limitada, dispositivos moviles y cargas de trabajo ligeras.
- Asistencia matematica y educativa: razonamiento matematico con trazas de pensamiento configurables en profundidad segun la dificultad del problema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir de los 9,65 B de parametros; cifras orientativas, no confirmadas por el autor): en BF16/FP16 el peso ronda los 19,3 GB y requiere aproximadamente 21-24 GB contando cache KV y overhead; en cuantizacion de 8 bits, alrededor de 10-11 GB; en cuantizacion de 4 bits, aproximadamente 5,5-7 GB.
- GPU recomendadas: en BF16 el modelo encaja con dificultad en una RTX 4090 (24 GB) y con holgura en A100 40 GB, A100 80 GB o H100. Para RTX 3090, RTX 4080 y tarjetas de 16-24 GB conviene recurrir a cuantizacion.
- Compatibilidad con GPU de consumo: si, cabe en GPU de consumo. Con cuantizaciones de 4 bits es viable en tarjetas de 8-12 GB; en BF16 requiere 24 GB o mas.
- Opciones de despliegue: Transformers (se indican `transformers>=5.12.1` y `accelerate`), vLLM (con soporte de decodificacion especulativa MTP) y llama.cpp (tambien con MTP y a traves de los pesos GGUF). El repositorio GGUF publicado abre la puerta a otros runners compatibles con ese formato. Existe tambien una demo en Hugging Face Spaces.
- Latencia y throughput estimados: no disponible.
- Nota de contexto: aunque el modelo soporta 256K tokens, el propio autor recomienda trabajar con 128K para obtener los mejores resultados, lo que afecta directamente al consumo de memoria de la cache KV en produccion.
- Recomendaciones de muestreo: `temperature=1.0`, `top_p=0.95`, `top_k=50` y `repetition_penalty=1.0`; los tres primeros ya vienen en `generation_config.json` y en los metadatos del GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Blossom-V7.1-9B | 9,65 B (denso) | 262.144 tokens (128K recomendados) | Apache-2.0 | Safetensors, GGUF | Variante de menores recursos; base Qwen3.5-9B |
| Blossom-V7.1-27B | No disponible en la informacion proporcionada | No disponible | Apache-2.0 (misma familia) | Safetensors, GGUF | Opcion densa mas capaz, para despliegue integro en GPU; base Qwen3.8-27B |
| Blossom-V7.1-35B-A3B | 35 B totales con 3 B activos (MoE, segun nomenclatura) | No disponible | Apache-2.0 (misma familia) | Safetensors, GGUF | Orientada a throughput en CPU o inferencia hibrida CPU/GPU; base Qwen3.6-35B-A3B |
| Qwen3.5-9B (modelo base) | No disponible | No disponible | No disponible | No disponible | Modelo base sobre el que se construye Blossom-V7.1-9B; no se dispone de sus especificaciones en la informacion proporcionada |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino. El rendimiento en castellano no esta documentado y probablemente sea inferior; conviene evaluarlo antes de usarlo en produccion en espanol.
- Alucinacion: no se publican tasas de alucinacion ni evaluaciones de fidelidad. Como modelo generativo de 9,65 B, es previsible que produzca afirmaciones incorrectas con seguridad, especialmente en conocimiento factual y matemáticas complejas.
- Sesgos: no se documenta ningun analisis de sesgos ni de alineacion. Al derivar de un modelo base Qwen, puede heredar los sesgos presentes en sus datos de preentrenamiento y en el pipeline de post-entrenamiento.
- Plantilla de chat obligatoria: utiliza una plantilla personalizada distinta de las nativas de Qwen. Sustituirla o combinarla con la nativa degrada el modelo; hay que usar siempre la `chat_template` incluida.
- Multi-turno: es obligatorio reinyectar la traza de razonamiento del asistente en el historial. Omitir el razonamiento previo degrada notablemente el rendimiento en turnos posteriores, y los frameworks de agentes deben configurarse para conservar el mensaje completo del asistente (campo `reasoning` en vLLM, `reasoning_content` en llama.cpp, y las llamadas a herramienta).
- Contexto: aunque se anuncian 256K tokens, el autor recomienda 128K para obtener los mejores resultados; el rendimiento real en ventanas muy largas no esta documentado con benchmarks.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, pero se desconoce si las condiciones del modelo base Qwen3.5-9B imponen requisitos adicionales que deban respetarse al distribuir derivados.
- Datos de entrenamiento no publicados: el propio autor indica que se liberaran en una actualizacion futura, por lo que no es posible auditar la composicion del dataset.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, lo que impide verificar las afirmaciones cualitativas de la model card.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.
- Vision: en la ruta de uso solo texto con Transformers se omite el codificador de vision, de modo que las capacidades de imagen requieren cargar el modelo completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Azure99/Blossom-V7.1-9B
- Repositorio GGUF: https://huggingface.co/Azure99/Blossom-V7.1-9B-GGUF
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Azure99/Blossom-9B-Demo
- Chat del proyecto: https://blossom-chat.com/
- Repositorio GitHub BlossomLM: https://github.com/Azure99/BlossomLM
- Framework BlossomData: https://github.com/Azure99/BlossomData
- Entorno AgentBox: https://github.com/Azure99/agentbox
- Variante Blossom-V7.1-27B: https://huggingface.co/Azure99/Blossom-V7.1-27B
- Variante Blossom-V7.1-35B-A3B: https://huggingface.co/Azure99/Blossom-V7.1-35B-A3B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
