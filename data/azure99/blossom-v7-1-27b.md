# Azure99/Blossom-V7.1-27B

## Resumen

Blossom-V7.1-27B es un modelo multimodal de pesos abiertos desarrollado por Azure99 dentro de la familia BlossomLM. Se trata de un modelo denso de 27.781.427.952 parametros (unos 27,8B) construido sobre el modelo base Qwen3.8-27B, orientado a despliegue local y a uso como asistente generalista. Acepta entradas de imagen y texto (pipeline `image-text-to-text`) y esta entrenado para conversacion, conocimiento del mundo, matematicas, razonamiento, codigo, desarrollo web y visualizacion de datos.

Su principal diferenciacion tecnica es un modo de razonamiento siempre activo con dos niveles (`medium` y `max`, por defecto `max`), donde el modo `medium` escala la profundidad de razonamiento segun la dificultad de la tarea. El autor afirma que las trazas de razonamiento de `medium` son aproximadamente una cuarta parte de las de Qwen3.5 y una quinta parte de las de Qwen3.6. Ademas incorpora uso de herramientas con razonamiento intercalado (el modelo razona antes de cada llamada a herramienta) y decodificacion especulativa mediante Multi-Token Prediction (MTP) soportada en vLLM y llama.cpp.

Es relevante ahora porque combina una ventana de contexto de 262.144 tokens (256K), capacidades multimodales, soporte de agentes con tool calling y licencia Apache-2.0, lo que lo hace apto para uso comercial sin restricciones adicionales. La familia incluye tres variantes (9B, 27B y 35B-A3B), lo que permite elegir en funcion del presupuesto de memoria y del hardware disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B); multimodal con codificador de vision; MTP para decodificacion especulativa |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K); el autor recomienda 131.072 tokens (128K) para mejores resultados |
| Tipos de cuantizacion | GGUF disponible en repositorio separado (`Azure99/Blossom-V7.1-27B-GGUF`); niveles concretos no disponibles en la informacion proporcionada |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio principal) y GGUF (repositorio aparte) |
| Tamano del repositorio | 55,6 GB |
| Modalidades de entrada | Texto e imagen |
| Modos de razonamiento | `medium` y `max` (por defecto `max`), razonamiento siempre activo |
| Fecha de publicacion | 12 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible indica que Blossom-V7.1-27B es un transformer denso derivado de Qwen3.8-27B, con capacidades multimodales (comprension de imagenes junto a texto). El autor describe la variante de 27B como "la opcion densa mas capaz", pensada para despliegues en GPU donde los pesos caben enteros en memoria de video. Incorpora Multi-Token Prediction (MTP), que permite decodificacion especulativa tanto en vLLM como en llama.cpp para acelerar la inferencia. No se detalla en la model card el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni el numero de tokens de entrenamiento.

El post-entrenamiento se realizo para uso como asistente general, cubriendo conversacion cotidiana, conocimiento del mundo, matematicas y razonamiento, programacion, desarrollo web y visualizacion de datos. El pipeline de datos utiliza BlossomData, un framework de codigo abierto del mismo autor para procesamiento y sintesis de datos. El filtrado combina revision LLM-as-Judge y, cuando aplica, verificacion Agent-as-Judge ejecutada en AgentBox (entorno de trabajo para agentes de IA de codigo abierto), que emplea busqueda, interaccion con navegador, captura de pantalla y ejecucion de codigo. Las muestras de desarrollo web y visualizacion de datos pasan un cribado adicional de funcionalidad, usabilidad y calidad visual. No se especifica en la informacion disponible si se aplicaron RLHF, DPO u otras tecnicas de alineacion, ni la composicion concreta del dataset. El autor indica que los datos de entrenamiento se publicaran en una actualizacion futura.

Una innovacion operativa relevante es el modo de razonamiento adaptativo: `medium` ajusta la profundidad de razonamiento a la dificultad de la tarea, mientras que `max` produce razonamiento mas exhaustivo. La model card tambien advierte de que Blossom-V7.1 usa una plantilla de chat propia que difiere de las plantillas nativas de los modelos Qwen base, y que sustituirla o combinarla degrada el comportamiento del modelo.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Razonamiento con modo de pensamiento siempre activo y dos niveles de esfuerzo (`medium` y `max`).
- Matematicas y razonamiento logico, segun lo declarado por el autor.
- Generacion de codigo en contextos de programacion general.
- Desarrollo web: la model card menciona explicitamente esta area entre las cubiertas por el post-entrenamiento.
- Visualizacion de datos, con cribado especifico de calidad visual durante el entrenamiento.
- Comprension de imagenes: acepta entradas de imagen junto a texto (pipeline `image-text-to-text`).
- Tool calling / function calling con razonamiento intercalado: el modelo razona y decide antes de cada llamada a herramienta, lo que mejora tareas agenticas.
- Flujos agenticos y razonamiento multi-paso, soportados por el uso de herramientas con pensamiento intercalado.
- Decodificacion especulativa mediante MTP en vLLM y llama.cpp, orientada a reducir latencia.
- Soporte de contexto largo: hasta 262.144 tokens, con recomendacion de 131.072 para mejores resultados.
- Preservacion de trazas de razonamiento en conversaciones multi-turno (campos `reasoning` en vLLM y `reasoning_content` en llama.cpp), necesaria para mantener el rendimiento en turnos sucesivos.

## Casos de uso

- Asistencia conversacional de proposito general en produccion: el modelo gestiona dialogos multi-turno con hasta 262.144 tokens de contexto, lo que permite mantener historiales largos y documentos extensos en la misma sesion sin truncar. Su licencia Apache-2.0 facilita el despliegue comercial.
- Agentes autonomos con uso de herramientas: dado que el modelo razona antes de cada llamada a herramienta, encaja en frameworks agenticos que necesitan encadenar busquedas, ejecucion de codigo o consultas a APIs. El autor recomienda conservar el mensaje completo del asistente (incluido el razonamiento y las llamadas a herramientas) en el historial para no degradar el rendimiento.
- Generacion de codigo en pipelines de desarrollo: puede integrarse en revision de codigo, generacion de tests o autocompletado asistido. La documentacion oficial incluye ejemplos de uso con vLLM y llama.cpp, ambos soportados con MTP.
- Desarrollo web asistido: la model card indica cobertura especifica de desarrollo web y cribado de funcionalidad y usabilidad en los datos, lo que lo hace adecuado para generar y revisar componentes, plantillas o paginas completas.
- Analisis y visualizacion de datos: al combinar generacion de codigo con contexto largo, puede recibir tablas o documentos extensos y producir scripts de analisis o graficos, con el plus de que el entrenamiento incluyo cribado de calidad visual.
- Analisis de documentos con imagenes: la entrada multimodal permite procesar capturas, diagramas, graficos o documentos escaneados junto a instrucciones textuales, por ejemplo para extraer datos de una tabla en imagen y generar el codigo que la reconstruya.
- Razonamiento matematico en tareas de varios pasos: el modo `max` esta pensado para problemas que requieren cadenas de deduccion largas, mientras que `medium` reduce la longitud de la traza cuando la tarea no lo exige, ahorrando tokens de salida.
- Asistente local con privacidad de datos: al existir pesos en safetensors y GGUF, puede desplegarse en infraestructura propia sin enviar datos a terceros, algo relevante en entornos con requisitos de confidencialidad.
- Atencion al cliente con imagenes: un usuario puede adjuntar una captura de pantalla de un error y el modelo razonar sobre ella junto al historial de la conversacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Blossom-V7.1-27B no incluye cifras de MMLU, HumanEval, GSM8K, MATH, MMMU ni de ninguna otra prueba estandar, y tampoco hay resultados de evaluaciones independientes en los resultados de busqueda web consultados.

La unica afirmacion cuantitativa de la documentacion es una comparacion de longitud de las trazas de razonamiento: el modo `medium` produciria trazas aproximadamente una cuarta parte mas cortas que las de Qwen3.5 y una quinta parte mas cortas que las de Qwen3.6. Se trata de una afirmacion del autor, no de un resultado verificado de benchmark, y no se acompana de numeros absolutos ni de metodologia.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del recuento de parametros publicado (27,78B) y del tamano del repositorio (55,6 GB en safetensors). No proceden de mediciones publicadas por el autor.

| Precision | Peso aproximado de los pesos | Notas |
|---|---|---|
| BF16 / FP16 | ~55,6 GB | Coincide con el tamano del repositorio; requiere GPU de 80 GB o reparto entre varias |
| FP8 / INT8 | ~28 GB | Requiere GPU de 40 GB o superior para dejar margen a la cache KV |
| GGUF Q4 / Q5 | ~16-20 GB | Encaja en GPU de 24 GB con contexto moderado |
| GGUF Q3 o inferior | ~12-14 GB | Opcion para GPU de 16 GB con contexto reducido |

- VRAM para cache KV: no disponible en la informacion proporcionada. Con 128K-256K de contexto, la cache KV es un factor dominante y crece de forma aproximadamente lineal con la longitud de contexto, por lo que conviene calcularla antes de dimensionar el hardware.
- GPU recomendadas: no especificadas por el autor. Por tamano de pesos, un despliegue en BF16 encaja en A100 80 GB, H100 80 GB o H200; en cuantizacion de 4 bits, el modelo puede caber en RTX 4090 (24 GB) o RTX 3090 (24 GB) siempre que se ajuste la longitud de contexto.
- Cabe en GPU de consumo: si, en cuantizaciones GGUF de 4 bits o inferiores y con contexto moderado. El autor situa la variante 27B como opcion "para GPU", reservando la 35B-A3B para inferencia en CPU o hibrida CPU/GPU y la 9B para GPUs con poca memoria y dispositivos moviles.
- Opciones de despliegue mencionadas en la model card: Transformers (se indica `transformers>=5.12.1`), vLLM y llama.cpp, estos dos ultimos con soporte de MTP. El repositorio GGUF es independiente. No se mencionan Ollama, TGI ni otros servidores en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia. El autor si afirma que el MTP reduce el tiempo de inferencia en vLLM y llama.cpp, pero sin cifras.
- Requisito de plantilla: es obligatorio usar la plantilla de chat incluida en el repositorio; no debe sustituirse por la plantilla nativa de Qwen ni combinarse con ella.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con modelos de terceros ni resultados de benchmarks propios, por lo que la comparativa se limita a las variantes de la propia familia y al modelo base.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Blossom-V7.1-27B | 27,8B densos | 262.144 tokens | Texto e imagen | Apache-2.0 | Safetensors y GGUF; demo en Spaces |
| Blossom-V7.1-35B-A3B | 35B totales, 3B activos (MoE) | No disponible | Texto e imagen | Apache-2.0 | Safetensors y GGUF; demo en Spaces |
| Blossom-V7.1-9B | 9B | No disponible | Texto e imagen | Apache-2.0 | Safetensors y GGUF; demo en Spaces |
| Qwen3.8-27B (modelo base) | 27B | No disponible | Texto | No disponible en la informacion proporcionada | HuggingFace |

Segun la model card, la variante de 27B es la opcion densa mas capaz y esta pensada para GPU con los pesos enteros en memoria; la de 35B-A3B prioriza throughput en CPU o configuraciones hibridas; la de 9B es la de menores requisitos. No hay datos de rendimiento comparativo entre ellas ni frente a modelos externos de tamano similar.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino. El comportamiento en castellano u otros idiomas no esta documentado ni evaluado en la informacion disponible.
- Riesgo de alucinacion: no se publican tasas de alucinacion ni evaluaciones de veracidad. Como modelo generativo, mantiene este riesgo, especialmente en dominios especializados.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni similares, por lo que las afirmaciones de capacidad de la model card no estan verificadas de forma independiente.
- Plantilla de chat obligatoria: usar la plantilla nativa de Qwen o combinar ambas degrada el modelo. Esto es un riesgo operativo si se reutilizan configuraciones pensadas para Qwen.
- Replay del razonamiento en multi-turno: omitir el razonamiento previo del asistente en el historial degrada notablemente el rendimiento en turnos posteriores. Los frameworks de agentes deben configurarse para conservar el mensaje completo del asistente, incluidos razonamiento y llamadas a herramientas.
- Coste de contexto: aunque soporta 262.144 tokens, el autor recomienda 131.072 para mejores resultados. El consumo de memoria de la cache KV en contextos largos puede ser prohibitivo en GPUs de consumo.
- Datos de entrenamiento no publicados: el autor indica que se liberaran en una actualizacion futura. Hasta entonces no es posible auditar la composicion del dataset ni los sesgos potenciales derivados de el.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar avisos de licencia y copyright. Conviene verificar si el modelo base Qwen3.8-27B impone condiciones adicionales que se hereden.
- Idiomas de la documentacion: la model card esta en ingles; no hay version en castellano.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion temprana y poca validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Azure99/Blossom-V7.1-27B
- Repositorio GGUF: https://huggingface.co/Azure99/Blossom-V7.1-27B-GGUF
- Demo en Spaces: https://huggingface.co/spaces/Azure99/Blossom-27B-Demo
- Repositorio GitHub del proyecto: https://github.com/Azure99/BlossomLM
- Chat oficial: https://blossom-chat.com/
- Framework de datos BlossomData: https://github.com/Azure99/BlossomData
- Entorno de agentes AgentBox: https://github.com/Azure99/agentbox
- Variante Blossom-V7.1-35B-A3B: https://huggingface.co/Azure99/Blossom-V7.1-35B-A3B
- Variante Blossom-V7.1-9B: https://huggingface.co/Azure99/Blossom-V7.1-9B
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos fueron enlaces genericos al sitio de YouTube, sin relacion con Blossom-V7.1. No se han localizado papers, articulos de blog ni evaluaciones independientes en la informacion disponible.
