# marafx2007/Qwen3.8-9B-heretic-uncensored-i1-GGUF

## Resumen

`marafx2007/Qwen3.8-9B-heretic-uncensored-i1-GGUF` es un repositorio de pesos en formato GGUF derivado de `rohit267/Qwen3.8-9B-heretic-uncensored`, un ajuste fino de 8.953.803.264 parametros (aproximadamente 8,95 mil millones) que, por su nomenclatura, se presenta como una variante "uncensored"/"heretic" de la familia Qwen3. La model card incluida en el repositorio esta firmada por el cuantizador `mradermacher` y declara cuantizaciones ponderadas con imatrix (prefijo `i1`), generadas a partir del modelo base.

El proposito declarado del modelo es la generacion conversacional en ingles sin las restricciones de alineacion habituales: la etiqueta "heretic" y "uncensored" indica que el ajuste fino se ha orientado a reducir o eliminar los rechazos del modelo original ante peticiones que un modelo alineado convencional bloquearia. No se documenta en la informacion disponible ni el proceso de entrenamiento, ni el dataset, ni el metodo de desalineacion empleado (abliteration, DPO sobre pares sin filtro, etc.).

Su relevancia practica es limitada y muy especifica: se trata de un modelo no oficial, sin licencia declarada, sin benchmarks publicados, con cero descargas y cero likes en el momento de redactar esta ficha, y publicado dentro de un repositorio de 110,2 GB que agrupa 25 variantes de cuantizacion. Resulta util como objeto de estudio para investigacion en seguridad y alineacion, y como modelo conversacional local en ingles sobre hardware de consumo, pero no como componente de produccion sin una evaluacion previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El nombre sugiere una base decoder-only de la familia Qwen3, dato no confirmado en la informacion proporcionada |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95 mil millones), segun el recuento de safetensors del modelo base |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K. Ademas, fichero imatrix suelto y quants estaticos en repositorio aparte (Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, Q4_1, IQ3_XS, IQ3_S) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (transformers, gguf); el modelo base subyacente esta en safetensors |
| Modelo base | rohit267/Qwen3.8-9B-heretic-uncensored |
| Cuantizado por | mradermacher (segun la model card del repositorio) |
| Tamano del repositorio | 110,2 GB (conjunto de todas las cuantizaciones) |
| Rango de tamanos de cuantizacion | De 2,8 GB (i1-IQ1_S) a 7,5 GB (i1-Q6_K) |
| Libreria declarada | transformers |
| Pipeline | No disponible |
| Etiquetas | transformers, gguf, en, endpoints_compatible, region:us, imatrix, conversational |
| Fecha de creacion / actualizacion | 2026-09-16 (ambas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion verificable sobre la arquitectura interna del modelo. El identificador "Qwen3.8-9B" no corresponde a ninguna denominacion oficial conocida de la familia Qwen, y la model card del repositorio no incluye ficha tecnica del modelo base: se limita a declarar el origen (`rohit267/Qwen3.8-9B-heretic-uncensored`), el idioma (ingles), la libreria (transformers) y el proceso de cuantizacion. Por el recuento de parametros (8,95 mil millones) y la nomenclatura, es razonable suponer una arquitectura transformer decoder-only de aproximadamente 9B, pero se trata de una inferencia, no de un dato confirmado.

El unico proceso documentado con detalle es la cuantizacion: el repositorio contiene cuatro bloques de anotaciones de la herramienta de `mradermacher` (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`, etiqueta `nicoboss`) y 25 ficheros GGUF generados con calibracion imatrix, que produce cuantizaciones de menor perplejidad que las estaticas equivalentes, especialmente en los rangos agresivos (IQ2, IQ3). El fichero `imatrix` (0,1 GB) se publica por separado para que terceros generen sus propias cuantizaciones.

Respecto al ajuste fino "heretic-uncensored" del modelo base: no se documenta ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se empleo RLHF, DPO, abliteration por edicion de pesos u otra tecnica. Tampoco hay informacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, modo de razonamiento explicito, etc.). Todos estos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto conversacional en ingles, en formato multi-turno, segun la etiqueta `conversational` del repositorio.
- Inferencia local en hardware de consumo gracias a las 25 cuantizaciones GGUF, con tamanos desde 2,8 GB.
- Generacion sin rechazos por contenido: el ajuste "uncensored"/"heretic" elimina o reduce los mecanismos de negativa del modelo alineado original. Esta es la capacidad diferencial declarada, aunque no se cuantifica su alcance.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que en la practica significa que puede servirse mediante runtimes compatibles con la API de chat (llama.cpp server, Ollama, etc.).
- Cuantizacion reproducible: la publicacion del fichero imatrix permite generar cuantizaciones propias con la misma calibracion.
- No hay evidencia en la informacion disponible de soporte de tool calling o function calling, de razonamiento multi-paso explicito, de capacidades de agente, de vision, de audio ni de modo de razonamiento ("thinking mode"). Tampoco se acredita capacidad multilingue: el unico idioma declarado es el ingles.
- No se documentan capacidades especificas de codigo o matematicas, ni resultados que las respalden.

## Casos de uso

- Generacion de ficcion y narrativa sin filtros editoriales: el modelo esta ajustado para no rechazar peticiones de contenido adulto, violento o moralmente ambiguo, lo que lo hace adecuado para escritura creativa de genero oscuro, roleplay de personajes o guiones que un modelo alineado bloquearia. Se ejecutaria en local con llama.cpp u Ollama y una cuantizacion i1-Q4_K_M (5,7 GB).
- Investigacion en alineacion y seguridad: estudio comparativo del comportamiento de un mismo modelo antes y despues de un proceso de desalineacion, midiendo tasas de rechazo, cambios en la distribucion de respuestas y degradacion de capacidades. Requiere el modelo base y el ajustado en condiciones controladas y en un entorno aislado.
- Red teaming y evaluacion de filtros: uso del modelo como generador adversario para producir prompts y respuestas que pongan a prueba clasificadores de contenido y guardarrailes de sistemas de moderacion. La variante IQ3_M (4,5 GB) permite desplegar varias instancias en una sola GPU.
- Asistente conversacional local en ingles con privacidad estricta: al ejecutarse integramente en hardware propio, ninguna conversacion sale del equipo, lo que resulta adecuado para profesionales que redactan material sensible y necesitan un asistente sin telemetria. Limitado a ingles.
- Generacion de datos sinteticos para dominios con vocabulario sensible: creacion de corpus de entrenamiento o de evaluacion en ambitos (medicina, legal, seguridad ofensiva) donde los modelos alineados se niegan a generar ejemplos realistas.
- Prototipado de personajes y agentes conversacionales con personalidad: la ausencia de rechazos permite mantener la coherencia de un personaje con moralidad no convencional sin romper la cuarta pared con disclaimers, algo habitual en el desarrollo de experiencias narrativas interactivas.
- Analisis de robustez de plantillas de chat: dado que el repositorio procede de un modelo base con plantilla de chat presumiblemente estandar de la familia Qwen, sirve para comprobar como interactuan distintas plantillas con pesos desalineados y si el comportamiento depende de la plantilla o de los pesos. No confirmado en la documentacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados tecnicos relevantes (unicamente dominios de contenido para adultos sin relacion alguna con el modelo). No deben atribuirse a este modelo cifras procedentes del modelo base o de otros modelos de la misma familia.

## Requisitos de hardware

Estimaciones derivadas del tamano de los ficheros publicados, asumiendo que la VRAM necesaria es aproximadamente el tamano del fichero mas el cache KV y el overhead del runtime:

- i1-IQ1_S (2,8 GB): cabe en GPU de 4 GB; calidad muy degradada, uso testimonial.
- i1-IQ2_M (3,7 GB): cabe en GPU de 6 GB (GTX 1660, RTX 2060, RTX 3050).
- i1-IQ3_M (4,5 GB) / i1-Q3_K_M (4,7 GB): GPU de 6-8 GB con contexto corto (RTX 3060 Ti, RTX 4060).
- i1-Q4_K_S (5,5 GB) / i1-Q4_K_M (5,7 GB): punto de equilibrio recomendado; GPU de 8 GB (RTX 3060, RTX 4060, RTX 2070) o de 12 GB con contexto amplio (RTX 3060 12 GB, RTX 4070).
- i1-Q5_K_M (6,6 GB): GPU de 10-12 GB, o reparto GPU/CPU.
- i1-Q6_K (7,5 GB): GPU de 12 GB o superior; con contexto largo, 16 GB.
- Pesos en fp16 (no publicados en este repositorio): aproximadamente 17,9 GB segun el recuento de 8.953.803.264 parametros; requeriria 24 GB de VRAM (RTX 3090, RTX 4090, A10G) o carga parcial.

Otras consideraciones:

- Cabe en GPU de consumo: si, desde 6 GB de VRAM con cuantizaciones IQ2/IQ3, y de forma holgada con 8-12 GB en Q4/Q5.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui son los runtimes naturales para GGUF. vLLM y TGI tienen soporte GGUF limitado o experimental y requeririan el repositorio original en safetensors, que no forma parte de esta publicacion. La etiqueta `endpoints_compatible` sugiere compatibilidad con la API de chat de Hugging Face.
- Multi-GPU: no documentado.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo para ninguna de las cuantizaciones.
- Almacenamiento: descargar el repositorio completo consume 110,2 GB; conviene descargar unicamente el fichero GGUF elegido.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de modelos comparables dentro de la informacion proporcionada, por lo que no es posible establecer una comparativa de calidad. La unica comparacion verificable es estructural, entre las variantes del propio modelo:

| Variante | Parametros | Formato | Tamano minimo | Licencia | Contexto |
|---|---|---|---|---|---|
| marafx2007/Qwen3.8-9B-heretic-uncensored-i1-GGUF (este repositorio) | 8,95B (heredados del base) | GGUF i1 (imatrix) | 2,8 GB (IQ1_S) | No disponible | No disponible |
| mradermacher/Qwen3.8-9B-heretic-uncensored-GGUF | 8,95B | GGUF estatico | No disponible | No disponible | No disponible |
| rohit267/Qwen3.8-9B-heretic-uncensored | 8,95B | Safetensors | Aproximadamente 17,9 GB en fp16 (estimado) | No disponible | No disponible |

Comparacion con alternativas de otros autores (Qwen3-8B oficial, Llama-3.1-8B, Mistral-7B, etc.): no disponible en la informacion proporcionada. Cualquier afirmacion al respecto careceria de respaldo documental.

## Limitaciones y advertencias

- Riesgo de contenido danino: es un modelo explicitamente desalineado. No incorpora los mecanismos de negativa del modelo original, por lo que puede generar contenido ofensivo, ilegal o peligroso sin advertencia. No debe exponerse a usuarios finales sin moderacion externa ni usarse en aplicaciones donde la seguridad del contenido sea un requisito.
- Licencia no disponible: no se declara licencia en el repositorio. Esto impide determinar si el uso comercial esta permitido y anade incertidumbre juridica, agravada por la licencia del modelo base y por la del modelo del que este derive.
- Procedencia no verificable: el identificador "Qwen3.8-9B" no coincide con ninguna denominacion oficial conocida de la familia Qwen, y no se documenta que pesos se han ajustado ni con que metodo. No hay garantia de correspondencia con la arquitectura que sugiere el nombre.
- Ausencia total de validacion: 0 descargas y 0 likes en el momento de la consulta. No existen evaluaciones independientes, discusiones ni reportes de terceros sobre su comportamiento real.
- Sin benchmarks: no hay ninguna metrica publicada, por lo que no puede compararse objetivamente con alternativas de su tamano.
- Monolingue: solo ingles. El castellano no esta soportado de forma declarada, y es probable que rendimiento y coherencia caigan fuera del ingles.
- Longitud de contexto desconocida: no se declara la ventana de contexto, lo que impide dimensionar el cache KV o planificar aplicaciones de contexto largo.
- Degradacion por cuantizacion: las variantes por debajo de IQ3 (especialmente IQ1 e IQ2, calificadas por el propio autor como "for the desperate" y "mostly desperate") degradan notablemente la coherencia. Para uso serio, el minimo razonable es i1-Q4_K_M (5,7 GB).
- Alucinacion: no medida ni documentada. En modelos desalineados, la reduccion de rechazos suele acompanarse de mayor propension a afirmar con seguridad contenido falso.
- Sin soporte confirmado de tool calling ni agentes: no hay evidencia de plantilla de herramientas ni de entrenamiento para function calling. No debe asumirse que funcione en pipelines de agentes.
- Repositorio de 110,2 GB: riesgo de consumo de disco y de ancho de banda si se clona completo por error.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/marafx2007/Qwen3.8-9B-heretic-uncensored-i1-GGUF
- Modelo base: https://huggingface.co/rohit267/Qwen3.8-9B-heretic-uncensored
- Repositorio de cuantizaciones estaticas del mismo modelo (mradermacher): https://huggingface.co/mradermacher/Qwen3.8-9B-heretic-uncensored-GGUF
- Pagina de descarga y vision general de cuantizaciones: https://hf.tst.eu/model#Qwen3.8-9B-heretic-uncensored-i1-GGUF
- Guia de uso de ficheros GGUF (TheBloke), referenciada en la model card: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad entre tipos de cuantizacion (ikawrakow), citada en la model card: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones GGUF (referencia truncada en la model card): https://gist.github.com/Artefa

Nota: la busqueda web realizada no devolvio ningun enlace tecnico relacionado con este modelo (unicamente resultados de dominios de contenido para adultos sin relacion con el tema). No se dispone, por tanto, de paper, blog, repositorio de codigo ni demo adicionales que enlazar.
