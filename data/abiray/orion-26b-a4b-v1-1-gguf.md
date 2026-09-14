# Abiray/Orion-26B-A4B-v1.1-GGUF

## Resumen

Orion-26B-A4B-v1.1-GGUF es un repositorio de pesos cuantizados en formato GGUF publicado por el usuario Abiray. No se trata de un modelo entrenado desde cero, sino de una conversión a GGUF del modelo TheDrummer/Orion-26B-A4B-v1.1, un ajuste fino orientado a creatividad y roleplay sin censura construido sobre la arquitectura denominada Gemma 4 26B A4B en configuracion de mezcla de expertos (MoE). El repositorio tiene un tamano de 132,2 GB y, en el momento de la consulta, registra 0 descargas y 0 likes, por lo que se trata de una publicacion reciente y practicamente sin validacion por parte de la comunidad.

El interes tecnico del modelo reside en su relacion entre parametros totales y activos: segun la model card, contiene 25.233.142.046 parametros totales (dato confirmado en safetensors) pero solo activa aproximadamente 3.800 millones durante la inferencia, lo que en teoria permite capacidad de razonamiento propia de un modelo de clase 30B con un coste computacional y de memoria cercano al de un modelo de 4B. Ademas, declara soporte nativo de modo "thinking" para tareas de razonamiento complejo y una ventana de contexto de hasta 256.000 tokens mediante atencion hibrida global y de ventana deslizante.

Su relevancia practica es doble: por un lado, ofrece a usuarios con hardware de consumo (16-24 GB de VRAM o RAM) la posibilidad de ejecutar localmente un MoE de 25B mediante quantizaciones que van de 13,3 GB a 26,9 GB; por otro, su enfasis explicito en salidas sin censura y altamente dirigibles lo posiciona en un nicho concreto (escritura creativa, roleplay, generacion editorial) mas que en el de asistentes de proposito general alineados. La ausencia de licencia declarada, de idiomas listados y de cualquier benchmark publicado limita seriamente su evaluacion rigurosa y su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre arquitectura denominada Gemma 4 26B A4B, con atencion hibrida global / ventana deslizante |
| Parametros totales | 25.233.142.046 (aproximadamente 25,2 B; dato de safetensors del modelo base) |
| Parametros activos | Aproximadamente 3,8 B durante la inferencia (segun model card) |
| Longitud de contexto | Hasta 256.000 tokens (256K) segun model card |
| Tipos de cuantizacion | Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (un fichero por cuantizacion) |

Detalle de ficheros disponibles y tamano declarado:

| Fichero | Cuantizacion | Tamano |
|---|---|---|
| Orion-26B-A4B-v1.1-Q3_K_M.gguf | Q3_K_M | 13,3 GB |
| Orion-26B-A4B-v1.1-Q4_K_S.gguf | Q4_K_S | 15,5 GB |
| Orion-26B-A4B-v1.1-Q4_K_M.gguf | Q4_K_M | 16,8 GB |
| Orion-26B-A4B-v1.1-Q5_K_S.gguf | Q5_K_S | 18,0 GB |
| Orion-26B-A4B-v1.1-Q5_K_M.gguf | Q5_K_M | 19,1 GB |
| Orion-26B-A4B-v1.1-Q6_K.gguf | Q6_K | 22,6 GB |
| Orion-26B-A4B-v1.1-Q8_0.gguf | Q8_0 | 26,9 GB |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) derivada de lo que la model card denomina Gemma 4 26B A4B. La nomenclatura "A4B" indica aproximadamente 4.000 millones de parametros activos por token, coherente con la cifra de 3,8 B activos declarada. El modelo combina atencion global con atencion de ventana deslizante (hibrida), lo que permite alcanzar una ventana de contexto declarada de 256.000 tokens sin que el coste cuadratico de la atencion global se aplique a toda la secuencia. Incluye de forma nativa dos modos de generacion: generacion estandar y modo "thinking" para tareas de razonamiento.

No se dispone de informacion sobre el proceso de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF, DPO o similares. La model card del repositorio GGUF se limita a describir el modelo base como un ajuste fino "creativo y sin censura" y a documentar las cuantizaciones; no aporta detalles sobre el pipeline de entrenamiento original ni sobre la procedencia de los datos. Tampoco se documenta el proceso de cuantizacion (herramienta usada, calibracion, version de llama.cpp), mas alla de los nombres y tamanos de los ficheros.

## Capacidades

- Generacion de texto conversacional y de formato largo, con enfasis declarado en escritura creativa y narrativa.
- Roleplay y personificacion con salidas "altamente dirigibles" (steerable), segun la model card.
- Modo "thinking" nativo para tareas de razonamiento complejo, activable de forma separada a la generacion estandar.
- Procesamiento de contexto muy largo (hasta 256K tokens declarados), adecuado para documentos extensos o conversaciones multi-turno prolongadas.
- Inferencia local en hardware de consumo gracias a la cuantizacion GGUF y al bajo numero de parametros activos.
- No se declara soporte explicito de tool calling, function calling, agentes, vision, audio ni multilingueismo; no hay informacion al respecto.

## Casos de uso

- Escritura creativa asistida: el modelo esta ajustado especificamente para generar narrativa, prosa y dialogos con un sesgo declarado hacia la creatividad; sus 256K tokens de contexto permiten mantener coherencia argumental en novelas o guiones extensos sin trocear el material.
- Roleplay y simulacion de personajes: el ajuste "uncensored" y el control fino del estilo permiten construir personajes con voces diferenciadas para entretenimiento, prototipado de videojuegos narrativos o pruebas de guion.
- Generacion de contenido editorial sin filtros restrictivos: util en entornos donde se requiere cubrir tematicas sensibles (ficcion oscura, dialogos conflictivos) sin que el modelo rechace la peticion, siempre que se asuma la ausencia de alineacion de seguridad.
- Procesamiento de documentos largos en local: con contexto de 256K tokens y cuantizaciones de 13-20 GB, puede resumir o extraer informacion de contratos, informes o transcripciones sin enviar datos a servicios en la nube.
- Prototipado e investigacion sobre MoE en hardware de consumo: sirve como banco de pruebas para medir el comportamiento real de un MoE de 25B con 3,8B activos frente a modelos densos de tamano similar en una RTX 4090 o similar.
- Asistente conversacional privado offline: desplegado con llama.cpp o LM Studio sobre una maquina local, permite conversaciones multi-turno sin conexion ni envio de datos externos, a costa de renunciar a garantias de seguridad y de soporte.
- Generacion de variantes de texto y reescritura de estilo: util para producir multiples versiones de un mismo pasaje con tonos distintos (publicidad, ficcion, divulgacion) aprovechando la naturaleza "steerable" declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ningun resultado de MMLU, HumanEval, GSM8K ni de evaluaciones de perplexity, y la busqueda web realizada no ha devuelto ningun enlace relacionado con el modelo. Las unicas referencias de calidad son las advertencias cualitativas del propio autor sobre la perdida de perplexity en Q3_K_M y la degradacion minima en Q5_K_M y superiores.

## Requisitos de hardware

- VRAM/RAM minima segun cuantizacion: 13,3 GB (Q3_K_M), 15,5 GB (Q4_K_S), 16,8 GB (Q4_K_M), 18,0 GB (Q5_K_S), 19,1 GB (Q5_K_M), 22,6 GB (Q6_K) y 26,9 GB (Q8_0). Hay que sumar la memoria de la cache KV, que crece con la longitud de contexto configurada; con ventanas cercanas a los 256K tokens el consumo adicional es muy elevado y no esta cuantificado en la informacion disponible.
- GPU de consumo: una GPU de 16 GB (por ejemplo RTX 4060 Ti 16 GB, RTX 4070 Ti Super) puede ejecutar Q3_K_M y Q4_K_M de forma ajustada; una RTX 3090 o RTX 4090 de 24 GB puede alojar hasta Q6_K (22,6 GB) con contexto moderado. Q8_0 (26,9 GB) no cabe en 24 GB y requiere offload parcial a CPU o una GPU de 32 GB o superior.
- GPU profesionales: A100 40/80 GB, H100 80 GB, L40S 48 GB o RTX A6000 48 GB ejecutan cualquier cuantizacion disponible con margen amplio de contexto.
- Ejecucion solo en CPU: viable con Q3_K_M y Q4_K_M si se dispone de 16-32 GB de RAM, aunque la velocidad dependera del numero de hilos y del ancho de banda de memoria; no se han publicado cifras de tokens por segundo.
- Opciones de despliegue confirmadas por el autor: llama.cpp (CLI, con flags -t y -c), LM Studio, Faraday y GPT4All, con plantilla de prompt "Gemma 4 Chat". El formato GGUF hace previsible su uso con otros runners compatibles con llama.cpp, aunque no se menciona Ollama ni vLLM en la documentacion.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|---|
| Orion-26B-A4B-v1.1 (este repo, GGUF) | 25,2 B | ~3,8 B | 256K (declarado) | no disponible | GGUF en HuggingFace | no disponible |
| Qwen3-30B-A3B | ~30,5 B | ~3,3 B | 128K | Apache 2.0 | Pesos abiertos y GGUF de terceros | Publicados por el autor del modelo |
| Mixtral 8x7B | ~46,7 B | ~12,9 B | 32K | Apache 2.0 | Pesos abiertos y GGUF de terceros | Publicados por el autor del modelo |

No se dispone de datos de benchmarks de Orion-26B-A4B-v1.1, por lo que la comparacion se limita a parametros, contexto y licencia. La ventaja declarada del modelo es la combinacion de contexto de 256K con un coste de inferencia bajo (3,8 B activos), mientras que su principal desventaja frente a las alternativas es la falta de licencia explicita y de resultados verificables.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican los terminos de uso, por lo que no puede asumirse que el uso comercial este permitido. Es un riesgo legal relevante para cualquier despliegue en produccion.
- Modelo explicitamente "uncensored": no se ha aplicado (o se ha revertido) la alineacion de seguridad habitual, por lo que puede generar contenido ofensivo, ilegal o danino sin rechazar la peticion. No es adecuado para aplicaciones orientadas al publico sin capas de moderacion adicionales.
- Riesgo de alucinacion: no hay evaluaciones de factualidad publicadas; al ser un ajuste orientado a creatividad, la probabilidad de generar afirmaciones inventadas con tono seguro es alta.
- Idiomas no declarados: se desconoce el soporte real multilingue y el rendimiento fuera del ingles. No hay datos sobre calidad en castellano.
- Limitaciones de contexto: los 256K tokens son una cifra declarada por el autor; no se documenta la degradacion de atencion a longitudes extremas ni el consumo de cache KV asociado.
- Sin benchmarks ni validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes ni comparativas reproducibles.
- Cuantizacion: Q3_K_M presenta, segun el propio autor, una perdida de perplexity perceptible; las cuantizaciones bajas pueden degradar la coherencia en roleplay y en razonamiento de varios pasos.
- Especificaciones no verificables: la referencia a una arquitectura "Gemma 4" y sus caracteristicas (256K de contexto, modo thinking) provienen exclusivamente de la model card y no se han podido contrastar con documentacion oficial o papers.
- Advertencia general de produccion: al depender de un ajuste fino comunitario sin licencia, sin evaluaciones y con enfasis en contenido sin filtrar, no se recomienda su uso en entornos regulados, sanitarios, legales o de atencion al cliente sin una evaluacion previa exhaustiva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Abiray/Orion-26B-A4B-v1.1-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1.1
- Repositorios de terceros, papers, blogs o demos: no se han encontrado enlaces relevantes en la busqueda web realizada (los resultados obtenidos no guardaban relacion con el modelo).
