# mertkayacs/Karar-4B-GGUF

## Resumen

Karar-4B-GGUF son los pesos cuantizados en formato GGUF de Karar-4B, un modelo de 4.205.751.296 parámetros desarrollado por Mert Kaya dentro de Eschatia Labs, un laboratorio independiente sin ánimo de lucro. No es un modelo conversacional de propósito general: está entrenado para recibir un estado en lenguaje natural (por ejemplo, el texto de una reclamación) junto con una pregunta y un conjunto cerrado de opciones, y devolver una probabilidad calibrada para cada opción. Su pipeline declarado en HuggingFace es `text-classification`.

El interés practico del modelo esta en su coste de despliegue: la cuantizacion Q4_K_M ocupa 2,71 GB en disco y alcanza un pico de 3,03 GB de RAM con contexto de 4k, lo que permite ejecutar decisiones sobre CPU en maquina local o en el borde, sin GPU y sin enviar datos a terceros. El autor declara un 96,8% de acierto en precision completa frente al 87,1% de Kev-4B sobre decisiones en turco reservadas del pipeline de entrenamiento.

La version GGUF anade un detalle relevante para produccion: las probabilidades del modelo base no se usan en crudo, sino que se aplican a traves del servidor JevAlt, que lee las probabilidades del siguiente token mediante llama-cpp-python y aplica un fichero `calibration.json`. La licencia Apache-2.0 y la disponibilidad en Ollama facilitan su integracion, aunque el alcance linguistico real medido es el turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no detalla la arquitectura; el modelo base tiene 4.205.751.296 parametros) |
| Parametros totales | 4.205.751.296 (dato real de safetensors del modelo base) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (las mediciones del autor se realizan con contexto de 4k) |
| Tipos de cuantizacion | Q4_K_M (por defecto), Q5_K_M, Q8_0; tag `imatrix` |
| Idiomas soportados | Turco (tr) e ingles (en) segun metadatos; el entrenamiento y las metricas publicadas son en turco |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original se distribuye en safetensors |
| Tamano del repositorio | 10,3 GB |
| Pipeline declarado | text-classification |
| Quantized by | mertkayacs |
| Modelo base | mertkayacs/Karar-4B |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base: no se indica si es un transformer decoder denso, ni el numero de capas, cabezas o dimension oculta, ni el regimen de atencion. Lo que si se documenta es el paradigma de uso: el modelo recibe un estado y una pregunta con criterios (por ejemplo, "¿que equipo debe gestionar esta solicitud?" con las categorias Fatura, Teknik destek, Satis y Hesap) y se leen las probabilidades del siguiente token para cada opcion, que despues se calibran. El autor menciona un modo opcional de razonamiento (`reasoning: off` en el ejemplo del widget, con la posibilidad de que el modelo escriba primero una justificacion breve en turco y luego decida) y un parametro `abstain`.

El entrenamiento se realizo sobre decisiones en turco del pipeline de datos `mertkayacs/jevalt-data`, con un conjunto reservado para evaluacion. La model card cita el articulo del proyecto como "JevAlt: Small Decision Models for English, Turkish and German", aunque las metricas publicadas en esta ficha corresponden unicamente al turco. La innovacion tecnica destacable no esta en el modelo sino en el envoltorio: el servidor JevAlt aplica una calibracion externa sobre las probabilidades de llama-cpp-python, de modo que los umbrales de decision se puedan reajustar con datos propios sin reentrenar. No se detallan volumen de tokens, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion de texto con opciones cerradas: devuelve una distribucion de probabilidad sobre las alternativas definidas en la consulta, no texto libre.
- Preguntas de tipo eleccion (`choice`) y con criterios descriptivos por opcion, segun el esquema del ejemplo del widget.
- Razonamiento previo opcional: el modelo puede emitir una justificacion breve en turco antes de la decision (modo `reasoning`).
- Abstención: parametro `abstain` para los casos en que ninguna opcion es adecuada.
- Probabilidades calibradas mediante `calibration.json` aplicado por el servidor JevAlt.
- Ejecucion en CPU y en dispositivo (`on-device`, `local-ai`), sin dependencia de GPU.
- Integracion con llama.cpp, Ollama y LM Studio; en estos dos ultimos responde con la letra de la opcion elegida.
- Capacidad multilingue limitada: metadatos en tr y en; sin metricas publicadas para ingles.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto de la reclamacion y devuelve la probabilidad de que corresponda a facturacion, soporte tecnico, ventas o cuenta. Es el escenario del ejemplo publicado, con 0,9135 de probabilidad para Fatura en un ticket de doble cobro, lo que permite enrutar automaticamente con un umbral definido.
- Enrutado de correo entrante en un CRM: clasificacion por cola o por equipo antes de que un humano lo lea, usando la opcion de abstención para derivar a revision manual los casos de baja confianza.
- Etiquetado de resenas y encuestas abiertas: al devolver probabilidades y no texto, el resultado se puede agregar directamente en un cuadro de mando sin post-procesado de lenguaje natural.
- Clasificacion local con requisitos de privacidad: al caber en 3,03 GB de RAM en CPU, se puede ejecutar en la propia infraestructura del cliente o en un portatil, sin enviar contenido de clientes a una API externa.
- Pre-filtro en cascada antes de un LLM mayor: usar Karar-4B para descartar o etiquetar el 80-90% del trafico trivial y reservar el modelo grande para los casos ambiguos, reduciendo coste por peticion.
- Decisiones de agente local: seleccionar la siguiente accion o herramienta entre un conjunto cerrado, manteniendo la autorizacion y los permisos fuera del modelo, como recomienda el autor.
- Moderacion y taxonomia de contenido en pipelines de datos: clasificacion por categorias predefinidas con umbral calibrado por categoria.

## Benchmarks y rendimiento

Precision en decisiones reservadas del pipeline de entrenamiento (turco):

| Modelo | Precision |
|---|---|
| Karar-4B (precision completa) | 96,8% |
| Kev-4B | 87,1% |

Verificacion de cuantizacion frente a Karar-4B en precision completa (61 decisiones de validacion por cuantizacion; es una comprobacion de cuantizacion, no una puntuacion de benchmark):

| Fichero | Tamano | Coincidencia de opcion | Brecha maxima de probabilidad | Segundos por peticion | Pico de RAM |
|---|---|---|---|---|---|
| Q4_K_M | 2,71 GB | 96,7% | 0,1430 | 15,74 | 3,03 GB |
| Q5_K_M | 3,08 GB | 100,0% | 0,1154 | 28,17 | 3,39 GB |
| Q8_0 | 4,48 GB | 100,0% | 0,0396 | 18,56 | 4,77 GB |

Los tiempos y la RAM se midieron en un proceso nuevo sobre una maquina de HuggingFace con 8 vCPU, 4 hilos, contexto de 4k, sin mmap y con repacking activado. El autor advierte que mas precision no garantiza mayor coincidencia en una muestra tan pequena. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de proposito general en la informacion disponible.

## Requisitos de hardware

- RAM para CPU: 3,03 GB de pico con Q4_K_M a contexto de 4k; 3,39 GB con Q5_K_M; 4,77 GB con Q8_0.
- VRAM estimada para GPU: aproximadamente 3,1 GB con Q4_K_M y 4,9 GB con Q8_0, partiendo del tamano de fichero y del pico de RAM medido (estimacion, no medida publicada por el autor).
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090; tambien en iGPU y en placas tipo Raspberry Pi siempre que se disponga de 4-8 GB de RAM libre.
- GPU de datacenter (A100, H100) innecesarias por tamano; solo tendrian sentido para servir muchas peticiones en paralelo.
- Despliegue: llama.cpp, Ollama (`ollama run mertkayacs/karar-4b`), LM Studio, llama-cpp-python y servidor JevAlt (`jevalt serve`), que expone `/v1/systemone`. Para obtener probabilidades calibradas hay que usar el servidor JevAlt: los endpoints de chat de llama.cpp, Ollama y LM Studio devuelven texto generado.
- Rendimiento medido en CPU: 15,74 s por peticion con Q4_K_M (unas 0,06 peticiones por segundo con 4 hilos), 18,56 s con Q8_0 y 28,17 s con Q5_K_M. No hay datos de throughput en GPU.
- Ajuste de carga recomendado en las pruebas del autor: sin mmap y con repacking activado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en decisiones turcas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Karar-4B-GGUF (Q4_K_M) | 4.205.751.296 | 4k en las pruebas del autor | 96,7% de coincidencia con precision completa (96,8% esta) | GGUF, safetensors (base) | Apache-2.0 | HuggingFace, Ollama |
| Karar-4B (precision completa) | 4.205.751.296 | No disponible | 96,8% | Safetensors | Apache-2.0 | HuggingFace |
| Kev-4B | No disponible | No disponible | 87,1% | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos comparables de otros modelos de 3-4B de propósito general (Qwen, Llama, Gemma u otros) en esta tarea concreta de decision en turco; cualquier comparacion de ese tipo requeriria ejecutar la misma evaluacion.

## Limitaciones y advertencias

- El entrenamiento y las metricas estan centrados en turco. Aunque los metadatos declaran ingles, no hay resultados publicados en ingles, y el resto de idiomas no esta soportado de forma declarada.
- El autor identifica como fallos conocidos las instrucciones plantadas en el texto de entrada (prompt injection), el texto largo irrelevante y la aritmetica de fechas. No debe confiarse en el modelo para calculos temporales o de importes.
- Riesgo de alucinacion: el modelo no genera hechos, pero si puede producir una justificacion (`reasoning`) que no se corresponda con la decision; conviene usar `reasoning: off` en produccion o validar la salida.
- Las probabilidades no estan calibradas para datos de terceros: el autor recomienda reajustar la calibracion con datos propios antes de fijar umbrales.
- La autorizacion y los permisos deben mantenerse fuera del modelo; no es un mecanismo de control de acceso ni de validacion de identidad.
- La coincidencia de cuantizacion se midio sobre solo 61 decisiones por fichero, por lo que las diferencias entre Q4_K_M, Q5_K_M y Q8_0 no son estadisticamente concluyentes.
- El modelo es lento en CPU (del orden de 15-28 s por peticion en la maquina de referencia); no es adecuado para rutas interactivas de baja latencia sin GPU o sin batching.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y el fichero NOTICE si existe; no se declaran restricciones adicionales de uso aceptable.
- Proyecto joven: 752 descargas y 0 likes en HuggingFace en el momento de la consulta, 5 estrellas en GitHub, sin validacion independiente de terceros.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mertkayacs/Karar-4B-GGUF
- Modelo base en precision completa: https://huggingface.co/mertkayacs/Karar-4B
- Repositorio GitHub del proyecto JevAlt: https://github.com/mertkayacs/jevalt
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/mertkayacs/JevAlt
- Pagina del proyecto: https://jevalt.mertkayacs.com/models/karar-4b/
- Dataset de entrenamiento: https://huggingface.co/datasets/mertkayacs/jevalt-data
- Dataset de benchmarks: https://huggingface.co/datasets/mertkayacs/jevalt-bench
- Pagina de benchmarks: https://eschatialabs.com/benchmarks/jevalt-bench/
- Ficha en Ollama: https://ollama.com/mertkayacs/karar-4b
- Informe de exportacion y cuantizacion: https://huggingface.co/mertkayacs/Karar-4B-GGUF/blob/main/export-report.json
- Eschatia Labs: https://eschatialabs.com
- Autor: https://mertkayacs.com
