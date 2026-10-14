# Java-dmd/Ministral-3-3B-Instruct-GGUF

## Resumen

Este repositorio contiene una conversión al formato GGUF del modelo Ministral-3-3B-Instruct, un modelo denso de aproximadamente 3 000 millones de parámetros desarrollado por Mistral AI. La conversión la publica el usuario Java-dmd y está especializada, según su model card, en la corrección de direcciones postales francesas, un caso de uso de normalización y validación de datos de contacto. El ajuste se realizó, siempre según el autor, con Unsloth Studio y la cuantización se aplicó sobre los pesos ya fusionados (merged model) para preservar la arquitectura y el tokenizer originales.

El interés de esta ficha es doble. Por un lado, documenta un ejemplo típico de la práctica habitual en el ecosistema abierto: tomar un modelo base de terceros, afinarlo para una tarea vertical muy concreta y redistribuirlo cuantizado en GGUF para que pueda ejecutarse en hardware de consumo mediante llama.cpp u Ollama. Por otro, sirve como advertencia metodológica: el repositorio no declara licencia, idiomas, pipeline ni métricas, y no incluye ningún dato de evaluación, por lo que cualquier decisión de adopción en producción exige verificación manual previa.

Conviene subir la ficha con cautela: el modelo se publicó en octubre de 2026, acumula cero descargas y cero valoraciones, y la única información disponible es la model card del autor. No hay evidencia publicada de que la especialización en direcciones postales francesas se haya validado con un conjunto de test, ni de que la cuantización Q4_K_M conserve la calidad del modelo original en esa tarea.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Ministral-3-3B, segun la model card del autor) |
| Parametros totales | No disponible en la informacion proporcionada (el nombre del modelo indica ~3B; la model card no confirma la cifra exacta) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica cuantizacion publicada en este repositorio) |
| Idiomas soportados | Frances e ingles, ademas de capacidades multilingues segun el autor |
| Licencia | No declarada en el repositorio de HuggingFace; debe verificarse la del modelo base |
| Formato de pesos | GGUF (Q4_K_M); no se incluyen safetensors en este repositorio |
| Tamano del repositorio | 3,2 GB |
| Modelo base | mistralai/Ministral-3-3B-Instruct-2512 (referenciado en la model card) |
| Especializacion declarada | Correccion de direcciones postales francesas |
| Herramienta de ajuste declarada | Unsloth Studio |
| Fecha de publicacion | 2026-10-14 |

## Arquitectura y entrenamiento

La model card describe el modelo como una version cuantizada en GGUF (Q4_K_M) de Ministral-3-3B-Instruct, especializada en la correccion de direcciones postales francesas y obtenida mediante ajuste con Unsloth Studio. El autor indica que la conversion se hizo "de manera quirurgica" a partir de los pesos fusionados, con el objetivo de mantener la fidelidad de los calculos y conservar el soporte de la arquitectura especifica y del tokenizer del modelo original. Es decir, se trata de un fine-tune sobre el modelo instruct de Mistral AI, seguido de una fusion de pesos y una cuantizacion posterior, no de un entrenamiento desde cero.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si se emplearon tecnicas de alineacion adicionales como RLHF, DPO u ORPO. Tampoco se detalla la arquitectura interna del modelo base (dimension de las capas, numero de cabezas de atencion, tipo de normalizacion, uso de GQA) ni si incorpora alguna innovacion tecnica particular. El unico dato estructural verificable a partir del repositorio es el tamano de los pesos cuantizados, 3,2 GB, coherente con una cuantizacion de 4 bits de un modelo de aproximadamente 3 000 millones de parametros.

## Capacidades

- Generacion de texto conversacional e instruccional en frances e ingles, segun la model card.
- Correccion y normalizacion de direcciones postales francesas, que es la especializacion declarada del ajuste.
- Capacidades multilingues heredadas del modelo base, sin detalle de que idiomas concretos ni con que nivel de calidad.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte para agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible en la informacion proporcionada.
- Capacidad de seguir el formato chat del tokenizer original, al haberse conservado el tokenizer en la conversion.

## Casos de uso

- Limpieza de bases de datos de clientes: el modelo puede normalizar campos de direccion heterogeneos (abreviaturas de via, errores tipograficos, orden de componentes) procedentes de CRM o ERP antes de migraciones o deduplicaciones.
- Validacion previa al envio en comercio electronico: integrado en el flujo de checkout, permite detectar direcciones incompletas o mal formadas en el momento de la compra y pedir la correccion al usuario, reduciendo devoluciones por direccion incorrecta.
- Enriquecimiento de formularios en aplicaciones internas: dado un texto libre escrito por un operador, el modelo puede reestructurarlo en campos separados (numero, tipo de via, nombre de via, codigo postal, ciudad) listos para un sistema de gestion.
- Logistica de ultima milla: normalizacion masiva de direcciones de entrega antes de pasarlas al motor de ruteo, con el objetivo de reducir intentos fallidos de entrega.
- Coincidencia con bases de referencia: uso del modelo como paso previo a un matching difuso contra la Base Adresse Nationale francesa u otras bases oficiales, generando candidatos normalizados que aumenten la tasa de coincidencia.
- Atencion al cliente en frances: asistencia en conversaciones donde el usuario dicta o escribe su direccion, con normalizacion inmediata para su registro en el sistema.
- Despliegue en local con requisitos de privacidad: al ejecutarse en GGUF sobre hardware de consumo, permite tratar datos de direcciones (considerados datos personales en el RGPD) sin enviarlos a una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud en la correccion de direcciones, ni resultados de evaluaciones generales como MMLU, GSM8K o HumanEval, ni comparaciones frente al modelo base sin ajustar. Tampoco hay informes de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3,5-4,5 GB con la cuantizacion Q4_K_M y contextos cortos, partiendo del tamano de pesos publicado (3,2 GB) mas el cache KV y el overhead del runtime. Con contextos largos el consumo crece de forma proporcional al cache KV. Estimacion orientativa, no medida.
- GPU de consumo: cabe con holgura en tarjetas de 8 GB o mas, como RTX 3060, RTX 4060, RTX 4070 o superiores, y en equipos Apple Silicon con 8 GB o 16 GB de memoria unificada.
- GPU de datacenter: A100, H100 o L40S son innecesarias para este tamano; su uso solo tendria sentido para servir muchas replicas en paralelo.
- Inferencia en CPU: viable gracias al formato GGUF, con rendimiento dependiente del numero de nucleos y del ancho de banda de memoria. Valido para cargas de baja concurrencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python. vLLM y TGI admiten GGUF de forma parcial y con limitaciones; para produccion de alta concurrencia suele ser preferible partir de los pesos originales en safetensors.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Java-dmd/Ministral-3-3B-Instruct-GGUF | No disponible (~3B segun el nombre) | No disponible | Direcciones postales francesas | No declarada en el repositorio | GGUF Q4_K_M |
| mistralai/Ministral-3-3B-Instruct-2512 (base) | No disponible en la informacion proporcionada | No disponible | Uso general, instrucciones | No disponible en la informacion proporcionada; verificar en el repositorio oficial | No disponible |
| Llama 3.2 3B Instruct | 3,21B (dato publico del fabricante) | 128k (dato publico del fabricante) | Uso general, instrucciones | Licencia comunitaria de Llama 3.2 | Safetensors y GGUF |
| Qwen2.5 3B Instruct | 3,09B (dato publico del fabricante) | 32 768 tokens (dato publico del fabricante) | Uso general, instrucciones | Apache 2.0 | Safetensors y GGUF |

Los datos de la comparativa que no aparecen en la informacion proporcionada se han marcado como no disponibles. Las cifras de Llama 3.2 3B y Qwen2.5 3B proceden de la documentacion publica de sus fabricantes y no han sido verificadas en el contexto de esta busqueda. No existe ningun dato de rendimiento comparado entre este ajuste y las alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni conjunto de validacion descrito, ni cifras de exactitud para la tarea declarada de correccion de direcciones.
- Licencia no declarada en el repositorio. Es imprescindible verificar la licencia del modelo base en su repositorio oficial antes de cualquier uso comercial, ya que la licencia del derivado no puede ser mas permisiva que la del original.
- Repositorio sin traccion: cero descargas y cero valoraciones en el momento de redactar esta ficha, sin proceso de revision por parte de terceros.
- Procedencia del ajuste no verificable: la model card menciona Unsloth Studio y una conversion sobre pesos fusionados, pero no documenta el dataset, la receta de entrenamiento ni hiperparametros.
- Riesgo de alucinacion en datos estructurados: un modelo de este tamano puede inventar codigos postales, nombres de via o numeros plausibles pero incorrectos. En correccion de direcciones esto es especialmente peligroso si la salida se escribe directamente en un sistema sin validacion posterior contra una base oficial.
- Perdida de precision por cuantizacion: la cuantizacion Q4_K_M introduce degradacion respecto a los pesos originales. No hay ningun estudio publicado que cuantifique ese impacto en esta tarea concreta.
- Ambito geografico limitado: la especializacion declarada es la direccion postal francesa. El comportamiento con direcciones de otros paises o con formatos no franceses no esta documentado.
- Idiomas: la model card menciona frances e ingles y capacidades multilingues genericas, sin detallar el nivel de competencia en cada idioma.
- Contexto desconocido: al no publicarse la longitud de contexto del modelo base, no puede garantizarse el tratamiento de lotes largos de direcciones en una sola llamada.
- Datos personales: las direcciones postales son datos personales segun el RGPD. Su tratamiento, incluso en local, exige base juridica, registro de actividades y medidas de seguridad adecuadas.
- Sin garantia de mantenimiento: al ser un repositorio de un usuario individual, no hay compromiso de actualizaciones, correccion de errores ni soporte.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Java-dmd/Ministral-3-3B-Instruct-GGUF
- Modelo base referenciado en la model card: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Especificacion de model cards de HuggingFace: https://github.com/huggingface/hub-docs/blob/main/modelcard.md
- Guia de model cards de HuggingFace: https://huggingface.co/docs/hub/model-cards
- Unsloth Studio (herramienta de ajuste mencionada por el autor): no se ha encontrado un enlace especifico en la informacion proporcionada
- Resultados de la busqueda web: no relevantes para este modelo. Todas las entradas devueltas corresponden al lenguaje de programacion Java y no guardan relacion con Ministral ni con este repositorio.
