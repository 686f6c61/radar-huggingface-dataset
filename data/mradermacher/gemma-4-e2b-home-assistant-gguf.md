# mradermacher/gemma-4-E2B-home-assistant-GGUF

## Resumen

Esta ficha describe la versión cuantizada en GGUF del modelo `mewse/gemma-4-E2B-home-assistant`, un ajuste fino de la familia Gemma orientado especificamente a *function calling* y control de dispositivos Home Assistant. La cuantizacion la firma mradermacher, un autor habitual de conversiones GGUF, y cubre desde formatos de 2 bits hasta f16, ademas de los proyectores multimodales (`mmproj`) en Q8_0 y f16. El modelo base parte de un checkpoint de aproximadamente 4.628.569.635 parametros (unos 4,63 mil millones, dato real de los safetensors del repositorio base), con un tamano de repositorio de 49,4 GB que incluye todas las variantes publicadas.

El interes practico del modelo esta en su especializacion: no es un modelo de proposito general, sino un asistente entrenado sobre `acon96/Home-Assistant-Requests-V2`, un dataset de peticiones en lenguaje natural para el ecosistema Home Assistant. Esto lo convierte en una pieza util para montar asistentes de domotica locales, donde el modelo debe traducir frases como "apaga las luces del salon" a llamadas de herramienta estructuradas que el motor de Home Assistant pueda ejecutar.

La relevancia de esta publicacion concreta es doble: por un lado, permite ejecutar un modelo de ~4,6B en hardware de consumo gracias a los cuantizados GGUF de 3,1 a 5,0 GB; por otro, la presencia de ficheros `mmproj` indica soporte de entrada multimodal en el modelo base, algo poco comun en asistentes de domotica. La informacion publicada no detalla la arquitectura interna ni la longitud de contexto, por lo que estos extremos quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle (familia Gemma; se distribuye con proyector multimodal `mmproj`, lo que implica soporte de vision) |
| Parametros totales | 4.628.569.635 (aproximadamente 4,63 mil millones, segun safetensors del modelo base) |
| Parametros activos | No disponible (la nomenclatura "E2B" del nombre sugiere un regimen de parametros efectivos en torno a 2B, pero no esta confirmado en la informacion proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K (3,1 GB), Q3_K_S (3,2 GB), Q3_K_M (3,3 GB), Q3_K_L (3,4 GB), IQ4_XS (3,4 GB), Q4_K_S (3,5 GB), Q4_K_M (3,5 GB), Q5_K_S (3,7 GB), Q5_K_M (3,7 GB), Q6_K (3,9 GB), Q8_0 (5,0 GB), f16 (9,4 GB); proyectores `mmproj` en Q8_0 (0,7 GB) y f16 (1,1 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma (licencia propia de Google para la familia Gemma) |
| Formato de pesos | GGUF (existen tambien pesos safetensors en el modelo base `mewse/gemma-4-E2B-home-assistant`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en los materiales proporcionados. El repositorio declara `library_name: transformers` y la pertenencia a la familia Gemma, y la presencia de ficheros `mmproj` (proyector multimodal en Q8_0 y f16) indica que el modelo base incorpora capacidad de procesamiento de imagenes ademas de texto. El autor de la cuantizacion indica que se trata de cuantizados estaticos ("static quants") del checkpoint `mewse/gemma-4-E2B-home-assistant`, con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`.

El ajuste fino del modelo base se realizo sobre el dataset `acon96/Home-Assistant-Requests-V2`, una coleccion de peticiones en ingles destinadas al control de Home Assistant. Esto implica que el entrenamiento esta orientado a la generacion de llamadas de herramienta (tool use / function calling) en el dominio de la domotica, y no a conversacion general. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat.
- *Function calling* / *tool use*: es la capacidad central del ajuste, orientada a emitir llamadas estructuradas a funciones.
- Integracion con Home Assistant: transformacion de peticiones en lenguaje natural en acciones sobre entidades del sistema domotico.
- Soporte multimodal: la publicacion incluye proyectores `mmproj` en Q8_0 y f16, lo que habilita entrada de imagenes cuando se usa junto con el modelo principal.
- Razonamiento multi-turno en el contexto de una conversacion de asistente.
- Capacidad multilingue: limitada al ingles segun los metadatos de idioma.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas de HuggingFace).
- No se documenta modo de razonamiento explicito (*thinking mode*), soporte de audio ni generacion de codigo general.

## Casos de uso

- Control de domotica local: el modelo traduce ordenes como "sube la persiana del dormitorio" a una llamada de herramienta que Home Assistant ejecuta sobre la entidad correspondiente. Su ajuste especifico sobre `Home-Assistant-Requests-V2` lo hace adecuado para este flujo, y el cuantizado Q4_K_M de 3,5 GB permite ejecutarlo en un mini-PC o NAS con GPU integrada.
- Asistente de voz para el hogar: combinado con un sistema de reconocimiento de voz, el modelo puede actuar como capa de interpretacion de intenciones dentro de un pipeline local, sin enviar audio ni texto a servicios en la nube.
- Automatizaciones por lenguaje natural: generar y modificar reglas de automatizacion a partir de descripciones en ingles, usando el modelo para producir la estructura de llamada que el backend de Home Assistant consume.
- Escenarios con entrada visual: gracias a los ficheros `mmproj`, un asistente podria interpretar una imagen (por ejemplo, una captura de un panel de control o de una camara) y derivar acciones, siempre que la integracion cliente soporte el proyector multimodal.
- Despliegue en el borde (edge): con cuantizados de 3,1 a 3,7 GB, el modelo cabe en dispositivos con 8 GB de VRAM o en equipos con memoria unificada, lo que permite asistencia domotica con baja latencia y sin dependencia de API externas.
- Evaluacion de asistentes de herramienta: util como referencia para medir la calidad de *function calling* en un dominio restringido, comparando variantes de cuantizacion (Q4_K_S frente a Q8_0) sobre el mismo conjunto de peticiones.
- Prototipado de integraciones personalizadas: al ser un GGUF, se puede cargar con llama.cpp u Ollama para probar rapidamente si el modelo emite el esquema de llamada esperado antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas especificas de *function calling* (por ejemplo, tasa de acierto en llamadas de herramienta) para el modelo base ni para las variantes cuantizadas.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del tamano de los ficheros GGUF publicados, anadiendo un margen para la cache KV; no proceden de mediciones publicadas por el autor.

- Q2_K: 3,1 GB de pesos; cabe en GPU con 4-6 GB de VRAM (por ejemplo, GTX 1650 4 GB con contexto corto, RTX 3050 6 GB).
- Q4_K_S / Q4_K_M: 3,5 GB de pesos; aproximadamente 4,5-5,5 GB de VRAM en uso real. Cabe comodamente en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070 y superiores.
- Q5_K_M / Q6_K: 3,7-3,9 GB de pesos; entorno de 5-6 GB de VRAM.
- Q8_0: 5,0 GB de pesos; aproximadamente 6-7 GB de VRAM. Recomendado en GPUs de 8 GB o mas.
- f16: 9,4 GB de pesos; requiere del orden de 11-12 GB de VRAM o mas. El propio autor lo califica de "overkill" (excesivo) para este tamano de modelo.
- Modalidad visual: si se usa el `mmproj`, hay que sumar 0,7 GB (Q8_0) o 1,1 GB (f16) al presupuesto de memoria.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas para Q4/Q5; A100, H100 o L40S para despliegues con f16 y alta concurrencia. El modelo completo en f16 cabe en una unica GPU de 16 GB.
- Opciones de despliegue: llama.cpp, Ollama y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI requeririan los pesos safetensors del modelo base, no los GGUF de este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-E2B-home-assistant-GGUF (esta ficha) | 4,63B totales | GGUF | Q2_K a f16, mas mmproj | Gemma | Cuantizados estaticos |
| mradermacher/gemma-4-E2B-home-assistant-i1-GGUF | 4,63B totales | GGUF | Cuantizados ponderados/imatrix | Gemma | Mismo modelo base, cuantizacion con importancia |
| mewse/gemma-4-E2B-home-assistant | 4,63B totales | safetensors | No disponible | Gemma | Modelo original sin cuantizar; ajustado sobre Home-Assistant-Requests-V2 |

No se dispone de datos comparativos de rendimiento frente a otros modelos de *function calling* para domotica (por ejemplo, alternativas basadas en Llama o Mistral ajustadas para Home Assistant), ni de sus especificaciones verificadas en la informacion proporcionada, por lo que no se incluye una comparativa cuantitativa.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles. Las peticiones en castellano no estan cubiertas por el entrenamiento y previsiblemente degradaran la calidad de las llamadas de herramienta.
- Dominio restringido: el ajuste esta especializado en Home Assistant. Fuera de ese ambito, el comportamiento de *function calling* generico no esta garantizado.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Alucinacion: no hay datos publicados sobre tasas de alucinacion, un riesgo relevante en *function calling*, donde una entidad o parametro inventado puede provocar una accion erronea sobre el hogar. Se recomienda validar las llamadas generadas antes de ejecutarlas.
- Contexto: la longitud de contexto no esta documentada; planificar despliegues con conversaciones largas requiere verificacion previa.
- Licencia Gemma: es una licencia con terminos propios de Google, no una licencia de codigo abierto permisiva. Antes de un uso comercial es imprescindible revisar las condiciones de la licencia Gemma y sus clausulas de uso aceptable y de atribucion.
- Estado de la publicacion: el repositorio registra 0 descargas y 1 "me gusta", por lo que no existe validacion de la comunidad ni informes de comportamiento en produccion.
- Cuantizacion: los formatos por debajo de Q4 (Q2_K, Q3_K_*) degradan la calidad de forma apreciable; el propio autor describe Q3_K_M como "lower quality". Para tareas de *function calling*, donde el formato estructurado importa, se recomienda Q4_K_M o superior.
- Los cuantizados son estaticos; el autor publica aparte una version con cuantizacion ponderada/imatrix, que suele ofrecer mejor relacion tamano-calidad a igual numero de bits.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/gemma-4-E2B-home-assistant-GGUF
- Version con cuantizacion imatrix: https://huggingface.co/mradermacher/gemma-4-E2B-home-assistant-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/mewse/gemma-4-E2B-home-assistant
- Dataset de ajuste: `acon96/Home-Assistant-Requests-V2` (referenciado en los metadatos, sin enlace directo en la informacion proporcionada)
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#gemma-4-E2B-home-assistant-GGUF
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Sitio del patrocinador de las cuantizaciones: https://www.nethype.de/
