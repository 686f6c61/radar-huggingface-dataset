# Bakq225/bakai-gemma-4-26b-a4b-gguf

## Resumen

Bakai Gemma 4 26B-A4B GGUF es una cuantizacion mixta de bajos bits del modelo google/gemma-4-26B-A4B-it, publicada por el usuario Bakq225 (Bakq225) y pensada para ejecutarse en telefonos Android con 8 GB de memoria a traves de la aplicacion BakAI, que descarga el modelo en el primer arranque. El modelo base tiene 25.233.142.046 parametros totales (dato real de safetensors, unos 25,2 mil millones) y la denominacion A4B apunta a una arquitectura de mezcla de expertos con del orden de 4.000 millones de parametros activos, aunque ese dato no se confirma en la informacion disponible.

El problema que resuelve es concreto: llevar un modelo de ~25B a un movil de gama alta mediante cuantizacion agresiva y reparto en varias partes. El autor aplica IQ2_XXS (2,06 bits por peso) a las proyecciones gate/up de los expertos enrutados, IQ4_NL a la proyeccion down de esos expertos (llama.cpp exige columnas divisibles por 256 y Gemma 4 usa 704 en esa proyeccion), y Q4_K a atencion y embeddings de tokens, con Q4_K/Q5_0 en el MLP denso. El resultado son 3,05 bits por peso de media, unos 9,63 GB repartidos en 7 ficheros.

Es relevante ahora porque demuestra una ruta viable de despliegue local de modelos grandes en hardware muy limitado, con llama.cpp como runtime, y porque el ecosistema de cuantizaciones GGUF de tercera generacion (IQ2/IQ4) permite reducir tamano sin recurrir a un modelo mucho mas pequeno. La contrapartida es que el propio autor declara que la calidad frente al original no se ha medido todavia, por lo que no hay ninguna garantia cuantificada de degradacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; modelo base google/gemma-4-26B-A4B-it, denominacion compatible con mezcla de expertos (MoE) |
| Parametros totales | 25.233.142.046 (unos 25,2 B) |
| Parametros activos | no disponible; la denominacion A4B sugiere del orden de 4 B, sin confirmar |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla: IQ2_XXS (2,06 bpw) en gate/up de expertos enrutados; IQ4_NL en down de expertos; Q4_K en atencion y embedding de tokens; Q4_K/Q5_0 en MLP denso; media 3,05 bpw |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 segun el autor; la model card enlaza ademas la licencia de Gemma 4 (ver advertencias) |
| Formato de pesos | GGUF, dividido en 7 partes con llama-gguf-split (9,63 GB en total; hay que cargar la primera parte) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento de este artefacto: es una conversion de pesos, no un modelo entrenado desde cero. El unico dato estructural fiable es que el modelo base es google/gemma-4-26B-A4B-it, con 25.233.142.046 parametros totales en safetensors y una nomenclatura A4B que en la familia Gemma designa variantes de mezcla de expertos con pocos parametros activos por token. El autor no publica numero de tokens de entrenamiento, composicion del dataset, ni si hubo etapas de RLHF o DPO.

La innovacion tecnica de esta ficha es exclusivamente de cuantizacion. El autor aplica una matriz de importancia (importance matrix) generada por bartowski para el mismo modelo, y resuelve una restriccion concreta de llama.cpp: la proyeccion down de los expertos de Gemma 4 tiene 704 columnas, que no es divisible por 256, de modo que no se puede usar una cuantizacion de tipo K en esa capa y se recurre a IQ4_NL. Las proyecciones gate/up de los expertos enrutados se comprimen hasta IQ2_XXS (2,06 bpw), lo que explica el peso medio de 3,05 bpw. La atencion y los embeddings de tokens se mantienen en Q4_K, presumiblemente para proteger las partes mas sensibles del modelo, y el MLP denso queda en Q4_K/Q5_0. No se documenta ningun mecanismo adicional de decodificacion especulativa, atencion lineal ni modos de razonamiento.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el sufijo `-it` del modelo base indican ajuste para dialogo con instrucciones.
- Razonamiento y conocimiento general: heredados del modelo base de ~25B, sin datos de evaluacion publicados para esta cuantizacion.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Tool calling / function calling: no disponible; no se menciona en la model card y no puede darse por supuesto.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Modo de pensamiento explicito (thinking mode): no disponible.
- Ejecucion en dispositivo: capacidad confirmada de carga y uso mediante llama.cpp en Android, repartido en 7 ficheros GGUF.

## Casos de uso

- Asistente conversacional offline en Android: la aplicacion BakAI descarga el modelo en el primer arranque y lo ejecuta en el propio telefono, de modo que las conversaciones no salen del dispositivo. Es adecuado porque el artefacto esta disenado explicitamente para 8 GB de memoria y formato GGUF.
- Chat privado y procesamiento de datos sensibles: al no requerir conexion ni enviar prompts a un servidor, encaja en escenarios donde el texto no puede salir del dispositivo (notas personales, borradores, mensajes).
- Redaccion y resumen de texto en movilidad: con un modelo de ~25B en el bolsillo se pueden generar resumenes y reescrituras de documentos sin cuota de API, dentro de los limites de velocidad del hardware.
- Prototipado de aplicaciones LLM sin GPU: un desarrollador puede validar prompts, flujos conversacionales y formatos de salida contra un modelo de 25B en un portatil modesto o en un telefono, antes de pasar a un despliegue en servidor.
- Evaluacion de cuantizaciones de bajos bits: sirve como referencia practica para estudiar el impacto de IQ2_XXS en expertos enrutados frente a cuantizaciones de 4 bits, siempre que se mida la calidad por cuenta propia.
- Distribucion dentro de una aplicacion movil: el reparto en 7 partes con `llama-gguf-split` y la carga de la primera parte simplifican la descarga progresiva y el cacheo en almacenamiento movil.
- Nodos de inferencia con GPU de gama media: en un equipo con 12 GB de VRAM el modelo completo entra en memoria, lo que permite usarlo como alternativa de bajo consumo a un modelo denso de 25B en precision completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica literalmente que la calidad frente al modelo original no se ha medido todavia, por lo que no existen datos de MMLU, HumanEval, GSM8K ni de perplejidad para esta cuantizacion.

## Requisitos de hardware

- Los pesos ocupan 9,63 GB repartidos en 7 ficheros GGUF; el repositorio completo pesa 12,5 GB.
- VRAM/RAM estimada para inferencia: del orden de 10-11 GB para los pesos mas la cache KV y el overhead del runtime (estimacion derivada del tamano del fichero, no medida publicada). Con contexto corto puede reducirse algo; con contexto largo, aumentara de forma apreciable.
- En Android con 8 GB: es el objetivo declarado del autor, pero exige mapeo de memoria (mmap) y paginacion desde almacenamiento, lo que implica latencias altas y dependencia de la velocidad del almacenamiento y de la gestion de memoria del sistema.
- GPU de consumo: cabe en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 de 24 GB). En 8 GB de VRAM habria que recurrir a offload parcial a RAM.
- GPU de centro de datos: A100, H100 y similares lo ejecutan sobradamente, aunque no es su caso de uso objetivo.
- Opciones de despliegue: llama.cpp es el runtime de referencia (el autor usa `llama-gguf-split`); tambien son compatibles las herramientas basadas en GGUF como Ollama, LM Studio o koboldcpp. El soporte de GGUF en vLLM y TGI es limitado, por lo que no se recomiendan para este artefacto.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo en ninguna plataforma.

## Comparativa con modelos similares

No se dispone de resultados de evaluacion de esta cuantizacion, por lo que la comparacion es estructural y no de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bakai Gemma 4 26B-A4B GGUF (este) | 25,2 B totales; activos no disponibles | no disponible | apache-2.0 declarada | GGUF mixto, 3,05 bpw, 9,63 GB | Optimizado para movil de 8 GB; calidad sin medir |
| google/gemma-4-26B-A4B-it (base) | 25,2 B totales; activos no disponibles | no disponible | no disponible en la informacion | safetensors | Referencia de maxima calidad del modelo original |
| Otras cuantizaciones GGUF del mismo modelo (p. ej. las de bartowski) | 25,2 B | no disponible | apache-2.0 declarada | GGUF | Existen al menos quants con importance matrix de bartowski, usados como base de este trabajo; tamano y bpw no disponibles |

No se han identificado en la informacion proporcionada otros modelos de la misma categoria (25B con cuantizacion orientada a movil) con datos comparables de rendimiento o licencia.

## Limitaciones y advertencias

- Calidad no verificada: el propio autor afirma que la degradacion frente al modelo original no se ha medido. La cuantizacion IQ2_XXS a 2,06 bpw en las proyecciones de los expertos es agresiva y es razonable esperar perdida de calidad, especialmente en razonamiento y matematicas, pero no hay cifras.
- Ambiguedad de licencia: la model card declara apache-2.0 y a la vez enlaza la licencia de Gemma 4 (ai.google.dev/gemma/docs/gemma_4_license), que impone sus propias condiciones de uso. Conviene verificar la licencia real del modelo base antes de cualquier uso comercial.
- Idiomas no declarados: no hay lista de idiomas soportados; no se puede asumir un rendimiento multilingue concreto.
- Longitud de contexto desconocida: no se especifica la ventana nativa ni si la cuantizacion la altera.
- Rendimiento en movil no documentado: no hay datos de tokens por segundo, consumo de bateria ni termica en Android.
- Sin datos de tool calling ni de uso agentico: no se debe asumir soporte de function calling en produccion sin validarlo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y, en principio, amplificado por una cuantizacion de muy bajos bits.
- Repositorio con poca traccion: 452 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que otros usuarios hayan verificado el artefacto.
- La carga requiere apuntar a la primera de las 7 partes; intentar cargar una parte intermedia directamente fallara.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Bakq225/bakai-gemma-4-26b-a4b-gguf
- Modelo base google/gemma-4-26B-A4B-it: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- No se han encontrado en la busqueda web articulos, papers, repositorios o demos adicionales relevantes para este modelo; los resultados obtenidos correspondian a paginas de ayuda no relacionadas.
