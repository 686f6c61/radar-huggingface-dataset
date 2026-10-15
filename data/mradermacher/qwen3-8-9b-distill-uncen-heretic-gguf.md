# mradermacher/Qwen3.8-9B-Distill-uncen-heretic-GGUF

## Resumen

Qwen3.8-9B-Distill-uncen-heretic-GGUF es una coleccion de cuantizaciones en formato GGUF publicadas por mradermacher a partir del modelo Zammael333/Qwen3.8-9B-Distill-uncen-heretic. Los pesos originales cuentan con 9.197.093.888 parametros (unos 9,2 B) segun el recuento de safetensors del repositorio base. La ficha no documenta la arquitectura interna del modelo de origen; los tags lo asocian a la familia Qwen (qwen3.5, qwen3.8), a tecnicas de destilacion (distillation) y a un ajuste supervisado (sft) orientado a razonamiento (reasoning) y llamada a funciones (function-calling).

El repositorio no incluye los pesos originales en safetensors, sino 14 ficheros GGUF de cuantizacion estatica que abarcan desde 2 bits (Q2_K, 4,0 GB) hasta f16 (18,5 GB), mas dos ficheros mmproj (proyector multimodal) de 0,7 GB y 1,0 GB que sugieren soporte de entrada de imagen. Esta publicado bajo licencia Apache-2.0, declara unicamente el idioma ingles y se creo el 15 de octubre de 2026.

Su relevancia es practica: permite desplegar un modelo de 9B con rasgos declarados de razonamiento y function calling en hardware de consumo mediante llama.cpp u Ollama, sin necesidad de GPUs de centro de datos. El sufijo "uncen"/"heretic" del nombre apunta a una variante con rechazos reducidos, lo que condiciona su uso en produccion. Con 0 descargas y 1 like en el momento de la consulta, no existe validacion de la comunidad ni evaluaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags apuntan a la familia Qwen; no se confirma transformer, MoE ni hibrida) |
| Parametros totales | 9.197.093.888 (9,2 B, dato de safetensors del modelo base) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mas mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas; el repositorio no contiene safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura del modelo de origen. Los tags del repositorio (qwen3.5, qwen3.8, empero-ai) y el nombre del modelo base (Qwen3.8-9B-Distill-uncen-heretic) permiten situarlo en el linaje de la familia Qwen, pero no se especifica el numero de capas, la dimension del modelo, el tipo de atencion ni si emplea mecanismos como atencion lineal o decodificacion especulativa. Tampoco se documenta la longitud de contexto, dato critico para planificar despliegues.

Sobre el entrenamiento, los tags indican "distillation" y "sft": el modelo base se habria obtenido mediante destilacion y posterior ajuste supervisado, con enfasis declarado en razonamiento y function calling. No se precisa el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion adicionales como RLHF, DPO o variantes. El componente "uncen"/"heretic" sugiere un proceso de reduccion de rechazos (del tipo abliteration o similar), pero esto no se confirma en la model card.

En cuanto a esta publicacion concreta, mradermacher ha generado cuantizaciones estaticas (convert_type: hf, output_tensor_quantised: 1) y advierte de que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicacion, ni planificadas a corto plazo. La presencia de ficheros mmproj indica que el modelo base incorpora un proyector multimodal para entrada de imagen, aunque no se detalla su arquitectura.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat (tag "conversational").
- Razonamiento (tag "reasoning"): capacidad declarada de cadenas de razonamiento, sin datos de evaluacion que la cuantifiquen.
- Llamada a funciones y herramientas (tag "function-calling"): permite integrarse en flujos de agentes y APIs estructuradas.
- Flujos de multiples pasos y uso como agente, derivado del soporte de function calling declarado.
- Entrada multimodal de imagen: inferida de la existencia de ficheros mmproj-Q8_0 y mmproj-f16, necesarios en llama.cpp para modelos con vision. No se detalla la resolucion ni el numero de imagenes admitidas.
- Generacion de codigo y matematicas: no confirmado explicitamente en la informacion disponible.
- Multilingue: no. Solo se declara ingles (en).
- Ajuste "uncen": menor tendencia al rechazo de peticiones, sin garantia ni descripcion tecnica de como se logro.

## Casos de uso

- Asistente local sin conexion: al distribuirse en GGUF de 4,0 a 9,9 GB, el modelo puede ejecutarse en un portatil o mini-PC con GPU integrada o discreta, procesando conversaciones sin enviar datos a terceros. Adecuado para entornos con requisitos de privacidad estrictos.
- Agente con herramientas en local: gracias al soporte declarado de function calling, puede conectarse a APIs internas, bases de datos o sistemas de ficheros mediante un orquestador que parsee las llamadas estructuradas y devuelva los resultados al bucle de razonamiento.
- Asistente de terminal y automatizacion de tareas: integrado con llama.cpp o llama-cpp-python para generar comandos, resumir salidas de logs y proponer correcciones en un flujo de trabajo de desarrollo, con la ventaja de no depender de cuota de API.
- Procesamiento por lotes de documentacion en ingles: con cuantizaciones Q8_0 o Q6_K, el modelo puede resumir, clasificar y extraer campos de grandes volumenes de texto tecnico, priorizando calidad sobre velocidad.
- Anotacion y generacion de datos sinteticos: util para producir pares instruccion-respuesta de dominio especifico antes de un ajuste fino posterior, siempre que el contenido generado pase por revision humana dado el caracter "uncen" del modelo.
- Base para ajuste fino adicional: al no haber safetensors en este repositorio, el ajuste deberia partir del modelo base Zammael333/Qwen3.8-9B-Distill-uncen-heretic; el GGUF sirve para inferencia y evaluacion rapida del comportamiento antes de invertir en entrenamiento.
- Escritura creativa sin filtros restrictivos: el ajuste "uncen" reduce los rechazos en generacion narrativa con tematicas adultas o controvertidas, un nicho habitual de este tipo de variantes.
- Despliegue en edge y kioscos aislados: los quants Q3_K_S o Q3_K_M (4,5-4,8 GB) permiten ejecucion en dispositivos con 8 GB de VRAM o en CPU con RAM suficiente, para tareas de atencion automatizada de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye unicamente las cuantizaciones, sin tablas de MMLU, HumanEval, GSM8K, MT-Bench ni comparaciones con otros modelos. Tampoco se aportan mediciones de perplexidad de los distintos niveles de cuantizacion para este modelo concreto.

## Requisitos de hardware

Los tamanos de VRAM estimados se derivan del tamano de fichero publicado; hay que sumar el cache KV y el búfer de contexto, que depende de la longitud de contexto real (no documentada) y del numero de capas del modelo. Como referencia orientativa:

| Cuantizacion | Tamano del fichero | VRAM estimada con contexto corto | GPU orientativa |
|---|---|---|---|
| Q2_K | 4,0 GB | 5-6 GB | GTX 1660 6 GB, RTX 3050 8 GB (justo) |
| Q3_K_S / Q3_K_M / Q3_K_L | 4,5 / 4,8 / 5,1 GB | 6-7 GB | RTX 3060 12 GB, RTX 4060 8 GB |
| IQ4_XS / Q4_K_S / Q4_K_M | 5,5 / 5,6 / 5,9 GB | 7-9 GB | RTX 3060 12 GB, RTX 4060 Ti 16 GB |
| Q5_K_S / Q5_K_M | 6,6 / 6,7 GB | 8-10 GB | RTX 4070 12 GB, RTX 4060 Ti 16 GB |
| Q6_K | 7,7 GB | 10-12 GB | RTX 4070 Ti, RTX 4080 |
| Q8_0 | 9,9 GB | 12-14 GB | RTX 4080 16 GB, RTX 4090 24 GB, A10G |
| f16 | 18,5 GB | 21-24 GB | RTX 4090 24 GB, A100 40 GB, L40S |
| mmproj (vision) | 0,7-1,0 GB adicionales | sumar a cualquiera de los anteriores | requiere tener cargado el proyector junto al modelo |

- Cabe en GPU de consumo: si, desde Q2_K hasta Q8_0 en tarjetas de 8-16 GB; f16 requiere 24 GB o reparto entre GPU y CPU.
- CPU y RAM: los quants Q4_K_M y Q3_K_M son viables en CPU con 8-16 GB de RAM, con velocidades de decodificacion bajas (no medidas en la informacion disponible).
- Despliegue recomendado: llama.cpp (llama-server), Ollama, LM Studio, koboldcpp, Jan y llama-cpp-python, que son los runners nativos de GGUF. Para los ficheros mmproj se necesita una compilacion de llama.cpp con soporte multimodal (llava/clip).
- vLLM y TGI: no son la via natural para este repositorio. vLLM admite GGUF de forma experimental, y para servirlo con TGI o vLLM en produccion convendria partir del modelo base en safetensors, que no esta incluido aqui.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

La informacion proporcionada no incluye especificaciones ni resultados de modelos alternativos, por lo que no es posible establecer una comparativa con datos verificables. Unicamente puede compararse esta publicacion con su propio modelo de origen:

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| mradermacher/Qwen3.8-9B-Distill-uncen-heretic-GGUF | 9,2 B | GGUF | 12 niveles + 2 mmproj | apache-2.0 | no disponible | 0 descargas, 1 like; cuantizado por mradermacher |
| Zammael333/Qwen3.8-9B-Distill-uncen-heretic (base) | 9,2 B | no disponible en la informacion aportada | no disponible en la informacion aportada | no disponible en la informacion aportada | no disponible | modelo de origen de la cuantizacion |
| Otros modelos de ~9 B en GGUF | no disponible | no disponible | no disponible | no disponible | no disponible | sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo "uncen"/"heretic": el ajuste reduce los rechazos, por lo que puede generar contenido sensible, ofensivo o inapropiado. Requiere moderacion externa si se expone a usuarios finales.
- Alucinacion: sin evaluaciones publicadas no hay medida de la tasa de invencion de hechos. En tareas de recuperacion o datos factuales es imprescindible verificar las salidas contra la fuente.
- Solo ingles declarado: no se garantiza un rendimiento correcto en castellano ni en otros idiomas. Para produccion en espanol habria que evaluar empiricamente caso por caso.
- Contexto desconocido: al no documentarse la longitud de contexto, no puede planificarse el cache KV ni dimensionarse el hardware para conversaciones largas o RAG con muchos documentos.
- Sin benchmarks ni validacion comunitaria: 0 descargas y 1 like en el momento de la consulta. No hay evidencia independiente de la calidad, la robustez del function calling ni la fidelidad de la destilacion.
- Procedencia poco documentada: la model card no describe el dataset de destilacion ni el proceso de ajuste. No puede auditarse si los datos de entrenamiento incluian material con derechos o contenido problematico.
- Licencia: Apache-2.0 permite uso comercial, pero se aplica a esta cuantizacion; conviene verificar la licencia del modelo base y los terminos de la familia Qwen subyacente antes de un despliegue comercial.
- Perdida de calidad en cuantizaciones bajas: Q2_K y Q3_K_* degradan de forma notable la coherencia y el razonamiento en modelos de este tamano. Para uso serio se recomienda Q4_K_M o superior.
- El autor advierte de que no existen cuantizaciones con imatrix ponderada, lo que puede traducirse en una calidad ligeramente inferior frente a cuants ponderados equivalentes.
- Repositorio de 85,1 GB: requiere planificar el almacenamiento si se descargan varias cuantizaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-9B-Distill-uncen-heretic-GGUF
- Modelo base: https://huggingface.co/Zammael333/Qwen3.8-9B-Distill-uncen-heretic
- Pagina de descarga alternativa del cuantizador: https://hf.tst.eu/model#Qwen3.8-9B-Distill-uncen-heretic-GGUF
- Peticiones de modelos y FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
