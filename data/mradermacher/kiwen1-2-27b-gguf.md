# mradermacher/Kiwen1.2-27B-GGUF

## Resumen

Kiwen1.2-27B-GGUF es la publicación de cuantizaciones estáticas en formato GGUF del modelo beyoru/Kiwen1.2-27B, realizada por el usuario mradermacher. El modelo original es un transformer de 27.320.697.856 parámetros (unos 27,3 mil millones) distribuido bajo licencia Apache 2.0, cuyas etiquetas lo sitúan en la familia de modelos destilados de Kimi con rasgos de la serie Qwen, orientado a razonamiento, uso agéntico y matemáticas, con soporte multimodal indicado por la presencia de ficheros `mmproj`.

El repositorio no aporta pesos nuevos: su valor está en ofrecer el mismo modelo en múltiples niveles de cuantización (desde Q2_K de 11,0 GB hasta Q8_0 de 29,1 GB) para que pueda ejecutarse con llama.cpp y herramientas compatibles en hardware de consumo. La licencia Apache 2.0 y la compatibilidad con endpoints de inferencia lo convierten en una opción atractiva para despliegues locales con requisitos de confidencialidad.

La información publicada es muy escasa: no se documentan la longitud de contexto, la composición del dataset de entrenamiento, si se trata de una arquitectura MoE ni resultados de benchmarks. Buena parte de las especificaciones habituales quedan, por tanto, como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `transformer`; no se detalla la variante concreta) |
| Parametros totales | 27.320.697.856 (~27,3 mil millones) |
| Parametros activos | no disponible (no se documenta si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; los metadatos anuncian ademas x-f16 e IQ4_XS, no listados en la tabla de archivos |
| Idiomas soportados | en (declarado en la model card); vi aparece en las etiquetas del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (la libreria declarada en los metadatos es `transformers`; el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

No se dispone de una descripcion tecnica detallada por parte del autor de la cuantizacion. La model card se limita a indicar que se trata de cuantizaciones estaticas del modelo beyoru/Kiwen1.2-27B, generadas con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. No se ofrecen datos sobre numero de capas, dimensiones ocultas, tipo de atencion ni estrategia de contexto.

Las etiquetas del repositorio aportan las unicas pistas sobre el entrenamiento del modelo original: `distillation`, `kimi`, `qwen3.8`, `kiwen1.1` y `RLVR`. Esto sugiere un proceso de destilacion a partir de un modelo de la familia Kimi, con posible relacion con la serie Qwen, y un ajuste mediante aprendizaje por refuerzo con recompensas verificables (RLVR), tecnica habitual en modelos orientados a matematicas y razonamiento. La presencia de los ficheros `mmproj` (proyector multimodal en Q8_0 y f16) indica que el modelo incorpora un componente de vision, aunque la model card no lo describe ni detalla que encoder visual se utiliza. No se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Cabe senalar que las cuantizaciones publicadas son estaticas: el autor indica que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicacion, y que pueden solicitarse abriendo una discusion en la comunidad. El autor del modelo original tampoco ha publicado datos sobre su arquitectura que permitan confirmar si se trata de un transformer denso o de una mezcla de expertos.

## Capacidades

- Generacion de texto conversacional multi-turno, con el tag `conversational` y compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- Razonamiento explicito, segun la etiqueta `reasoning` del repositorio; no se documenta si existe un modo de pensamiento separado ni como se activa.
- Uso agéntico: la etiqueta `agentic` apunta a flujos de varios pasos, aunque no se especifica soporte formal de tool calling ni el esquema de funciones aceptado.
- Razonamiento matematico, segun la etiqueta `math`.
- Capacidad multimodal: los ficheros `mmproj` permiten acoplar un proyector visual, presumiblemente para entrada de imagenes, si bien no se detalla su uso ni el formato esperado.
- Cobertura linguistica: ingles declarado oficialmente y vietnamita mencionado en las etiquetas; no hay informacion sobre el resto de idiomas.
- Modelo destilado de la familia Kimi (`distillation`, `kimi`) y posible relacion con la serie Qwen (`qwen3.8`), sin detalles tecnicos publicados.
- Al estar en GGUF, es compatible con el ecosistema llama.cpp para inferencia en CPU, GPU o modo mixto.

## Casos de uso

- Despliegue local con requisitos de confidencialidad: la licencia Apache 2.0 y el formato GGUF permiten ejecutar el modelo en servidores on-premise sin enviar datos a APIs externas, algo critico en sectores como sanidad, banca o asesoria legal.
- Razonamiento matematico asistido: con la cuantizacion Q5_K_M o Q6_K (19,6 y 22,5 GB), el modelo puede resolver problemas paso a paso en entornos educativos o de analisis cuantitativo, siempre que se valide la salida.
- Agentes de automatizacion de tareas: la etiqueta `agentic` lo hace candidato para orquestar flujos multi-paso (consulta de bases de datos, generacion de informes), aunque la integracion de tool calling debe validarse empiricamente antes de llevarlo a produccion.
- Procesamiento de documentos con imagenes: acoplando el fichero `mmproj-f16` (1,0 GB) se puede construir un pipeline de extraccion de informacion de capturas, formularios o graficos junto al modelo de lenguaje.
- Atencion al cliente en ingles y vietnamita: con contexto suficiente en memoria, el modelo puede gestionar conversaciones multi-turno para mercados de habla inglesa y vietnamita, dos idiomas presentes en las etiquetas.
- Investigacion sobre destilacion y RLVR: al estar disponible el modelo base en safetensors, resulta util como punto de partida para experimentos de ajuste fino o para comparar el efecto de RLVR frente a otros metodos de alineamiento.
- Evaluacion de cuantizaciones: el repositorio incluye once niveles de cuantizacion distintos, lo que permite medir de forma empirica la perdida de calidad y el ahorro de memoria en tareas concretas antes de fijar una configuracion de produccion.
- Prototipado en estaciones de trabajo con una sola GPU: las variantes Q2_K y Q3_K_S (11,0 y 12,4 GB) permiten probar el modelo en tarjetas de 12-16 GB de VRAM antes de invertir en hardware mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

La siguiente tabla recoge los tamanos de archivo publicados por el autor y una estimacion de VRAM para los pesos, derivada directamente de esos tamanos. Hay que anadir aparte la memoria para la cache KV, que depende del contexto configurado, y el consumo del propio runtime.

| Cuantizacion | Tamano (GB) | Notas |
|---|---|---|
| Q2_K | 11,0 | calidad reducida; util solo si la memoria es muy limitada |
| Q3_K_S | 12,4 | |
| Q3_K_M | 13,6 | el autor la marca como de calidad inferior |
| Q3_K_L | 14,7 | |
| Q4_K_S | 15,9 | rapida, recomendada por el autor |
| Q4_K_M | 16,9 | rapida, recomendada por el autor |
| Q5_K_S | 19,1 | |
| Q5_K_M | 19,6 | |
| Q6_K | 22,5 | el autor la describe como de muy buena calidad |
| Q8_0 | 29,1 | rapida y de mejor calidad |
| mmproj-Q8_0 | 0,7 | suplemento multimodal |
| mmproj-f16 | 1,0 | suplemento multimodal |
| x-f16 | ~54,6 (estimado a partir de 27,32 B de parametros) | anunciada en metadatos, no incluida en la tabla de archivos |

- Cabe en GPU de consumo: Q4_K_S y Q4_K_M (15,9 y 16,9 GB) caben en tarjetas de 24 GB como la RTX 3090, RTX 4090 o RTX 5090, y en tarjetas de 16 GB solo con offload parcial de capas a CPU. Q2_K y Q3_K_S pueden entrar en tarjetas de 12 GB con margen escaso para la cache KV.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB admiten sin problema Q8_0 (29,1 GB) y dejan espacio para contexto amplio. Para uso multiusuario conviene recurrir a varias GPU o a instancias de 80 GB.
- Memoria unificada: equipos Apple Silicon con 32 GB o 64 GB de memoria unificada pueden ejecutar Q4_K_M y Q5_K_M de forma completa; con 64 GB es viable Q8_0.
- Opciones de despliegue: llama.cpp y sus interfaces (llama-server, Ollama, LM Studio, koboldcpp, text-generation-webui) son la via natural para estos ficheros. vLLM ofrece soporte de GGUF limitado y experimental, y TGI no esta pensado para GGUF; para produccion a gran escala conviene partir del modelo base en safetensors. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia gestionados.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No existe ningun benchmark publicado de Kiwen1.2-27B que permita una comparacion de rendimiento. La tabla siguiente contrasta unicamente caracteristicas verificables de modelos de la misma franja de tamano, tomadas de la documentacion publica de cada proyecto.

| Modelo | Parametros | Contexto | Licencia | Formatos disponibles |
|---|---|---|---|---|
| Kiwen1.2-27B (esta ficha) | 27,3 B | no disponible | Apache 2.0 | safetensors (base) y GGUF |
| Gemma 3 27B | 27 B | 128 K | Gemma Terms of Use | safetensors y GGUF de terceros |
| Qwen3-32B | 32,8 B | 128 K | Apache 2.0 | safetensors y GGUF de terceros |
| Mistral Small 3.1 24B | 24 B | 128 K | Apache 2.0 | safetensors y GGUF de terceros |

En cuanto a licencia, Kiwen1.2-27B comparte la permisividad de Qwen3-32B y Mistral Small 3.1 24B (Apache 2.0), mientras que Gemma 3 27B queda sujeto a los terminos propios de Google. Al no disponer de contexto documentado ni de resultados de evaluacion, no es posible afirmar que Kiwen1.2-27B supere o iguale a estas alternativas en ninguna tarea.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentacion tecnica: no hay datos sobre MMLU, GSM8K, HumanEval ni evaluaciones de agentes, por lo que cualquier decision de adopcion debe basarse en pruebas propias.
- Longitud de contexto desconocida: planificar despliegues con ventanas largas sin conocer este dato puede provocar degradacion silenciosa de la calidad.
- Riesgo de alucinacion: es un modelo destilado de 27 B sin evaluacion publicada de fidelidad factual; en tareas de recuperacion de datos o generacion de informes requiere verificacion humana.
- Idiomas: la model card solo declara ingles; el vietnamita aparece unicamente en las etiquetas. No hay confirmacion de soporte para castellano ni para otras lenguas europeas.
- Capacidad de tool calling no verificada: la etiqueta `agentic` no equivale a un soporte documentado de function calling; hay que probarlo antes de integrarlo en agentes en produccion.
- Componente multimodal poco documentado: los ficheros `mmproj` existen, pero no se describe el encoder visual ni el formato de prompt de imagen, lo que puede complicar su integracion.
- Sin cuantizaciones ponderadas (imatrix): el autor indica que no estan disponibles, de modo que las variantes de baja precision (Q2_K, Q3_K) pueden degradar mas de lo habitual en cuantizaciones calibradas.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene revisar la licencia y los terminos del modelo base beyoru/Kiwen1.2-27B, ya que el repositorio cuantizado hereda sus condiciones.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay senales de validacion por parte de la comunidad.
- Fecha de publicacion futura respecto a la informacion disponible (17 de septiembre de 2026): verificar que el repositorio y el modelo base siguen accesibles antes de depender de ellos.
- Uso en produccion: al tratarse de una cuantizacion de tercera parte, no hay garantia de mantenimiento, actualizaciones ni soporte por parte del autor original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kiwen1.2-27B-GGUF
- Modelo base: https://huggingface.co/beyoru/Kiwen1.2-27B
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Kiwen1.2-27B-GGUF
- Guia de uso de ficheros GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos al cuantizador: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces obtenidos correspondian a contenidos sin relacion (revistas de consumo, foros de DVD y webs de autoempleo) y se han descartado.
