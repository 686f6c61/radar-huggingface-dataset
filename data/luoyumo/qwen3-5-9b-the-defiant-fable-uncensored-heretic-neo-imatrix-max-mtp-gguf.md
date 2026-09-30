# luoyumo/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen

Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF es un repositorio de cuantizaciones GGUF publicado por el usuario luoyumo sobre el modelo base de DavidAU del mismo nombre. Se trata de un ajuste fino multimodelo y multi-etapa sobre la familia Qwen 3.5, de aproximadamente 8.950 millones de parametros, orientado a maximizar la inteligencia general y el seguimiento de instrucciones en un tamano pequeno. El modelo esta deliberadamente "abliterado" (uncensored / heretic), es decir, se han eliminado los comportamientos de rechazo, y esta disenado para ejecutarse en hardware de consumo.

El modelo declara una ventana de contexto de 256.000 tokens (262.144 segun fuentes externas), soporte de vision mediante un archivo mmproj separado y modos de razonamiento (thinking) ademas del modo instruct. El autor afirma que supera siete de siete benchmarks frente a Qwen3.5-9B, Qwen3.5-27B y Qwen3.6-35B-A3B, y que iguala a Qwen3.6-27B en algunos casos, manteniendo ese rendimiento incluso en cuantizaciones de 4 y 8 bits.

Su relevancia actual radica en el enfoque de cuantizacion con NEO Imatrix (mejora declarada del 2-4% de precision sobre GGUF convencionales), el uso de prediccion multi-token (MTP) para acelerar la decodificacion y la preservacion del tensor de salida en 16 bits en todas las cuantizaciones. Todo ello con licencia apache-2.0 y compatibilidad con las aplicaciones habituales de inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; familia Qwen 3.5 (transformer decoder) con modulo de prediccion multi-token (MTP) |
| Parametros totales | 8.953.803.264 (aprox. 8,95 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 256.000 tokens (262.144 segun fuentes externas) |
| Tipos de cuantizacion | GGUF NEO Imatrix en variantes regulares y MTP; se mencionan bf16, mxfp8, mxfp4, Q4_K_S y quants MTP en Q6/Q8. Listado completo no disponible |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); bfloat16/safetensors en el modelo original |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de indicar que pertenece a la familia Qwen 3.5 y que incorpora prediccion multi-token (MTP). El modelo se describe como un ajuste fino y fusion multi-etapa y multimodelo, realizado en hardware local por DavidAU y Nightmedia, a partir de varios de sus propios ajustes finos de 9B de la familia Qwen 3.5. La cadena de herramientas incluye unsloth para el ajuste fino y un proceso de "abliteracion" (heretic) aplicado antes del entrenamiento posterior, del que resulta un modelo que atiende cualquier peticion sin filtros de rechazo.

La cuantizacion es uno de los elementos diferenciadores: todas las variantes son NEO Imatrix, lo que segun el autor mejora la precision entre un 2% y un 4% respecto a GGUF normales y tambien el rendimiento en contexto largo. Ademas, el tensor de salida (entre el 10% y el 20% del total) se mantiene en precision completa de 16 bits en todas las cuantizaciones, y los tensores MTP se fijan a Q8_0. El bloque de razonamiento (thinking) se ha compactado y, segun el autor, es mas potente que en el modelo base. No se aportan datos sobre numero de tokens de entrenamiento, composicion del dataset ni detalles de RLHF o DPO.

## Capacidades

- Generacion de texto general, razonamiento y modo thinking con bloque de razonamiento compactado.
- Generacion de codigo (el modelo se etiqueta como "coder").
- Escritura creativa, ficcion y roleplay.
- Vision activada: procesa imagenes, pero requiere descargar un archivo mmproj adicional y colocarlo en la misma carpeta que el GGUF.
- Soporte multilingue limitado a ingles y chino.
- Modos de razonamiento e instruct conmutables en caliente: la model card menciona 5 modos de razonamiento y 5 modos instruct (incluidos los nuevos "Spoon" y "Einstein"), dos de ellos sin tokens de razonamiento, en las variantes MTP Q6/Q8 con "plusIQ" en el nombre, seleccionables via API y a nivel de mensaje en el chat.
- Version adicional declarada con "tools" mas robusta para uso con herramientas; el detalle no esta disponible.
- Prediccion multi-token (MTP) para acelerar la decodificacion en las variantes MTP.

## Casos de uso

- Asistente de programacion local: con aproximadamente 6,36 GB en Q4_K_M y soporte de contexto largo, puede integrarse en entornos de desarrollo para autocompletado, generacion de funciones y revision de codigo sin depender de APIs externas.
- Escritura creativa y narrativa larga: su ventana de 256.000 tokens permite mantener coherencia argumental en novelas, guiones o sagas extensas donde el contexto completo excede lo que admiten modelos de 8K-32K.
- Roleplay y personajes persistentes: el ajuste esta explicitamente orientado al roleplay y a la ficcion, y el modo thinking permite mantener rasgos de personaje consistentes a lo largo de conversaciones multi-turno.
- Procesamiento de documentos con imagenes: gracias al soporte de vision (con el archivo mmproj), puede extraer y resumir informacion de capturas, diagramas o documentos escaneados junto a su texto asociado.
- Generacion de codigo en produccion: las variantes MTP aceleran la decodificacion (mas de 185 t/s en Q4_K_S con 60% de aceptacion de tokens), lo que resulta util en pipelines de sugerencia de codigo con latencia ajustada.
- Investigacion sobre alineacion y seguridad: al ser un modelo abliterado con benchmarks publicos, sirve como referencia para estudiar el efecto de la eliminacion de rechazos sobre el rendimiento y el sesgo.
- Atencion al cliente automatizada en ingles o chino: puede gestionar conversaciones multi-turno con contexto largo, aunque el uso comercial exige revisar las condiciones de la licencia y aplicar filtros propios al no tenerlos el modelo.
- Prototipado en hardware de consumo: cabe en GPUs de gama alta de consumo en 4 bits, lo que permite desplegar un asistente con vision y razonamiento en una unica maquina.

## Benchmarks y rendimiento

Datos publicados por el autor en modo instruct (los modelos se evaluan en modo instruct porque funciona mejor con el arnes de pruebas). Se presentan los resultados del modelo y de las alternativas de la misma familia:

| Modelo (formato) | ARC-c | ARC-e | BoolQ | HellaSwag | OpenBookQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|
| Defiant Fable 9B (bf16) | 0,649 | 0,832 | 0,895 | 0,713 | 0,482 | 0,783 | 0,699 |
| Defiant Fable 9B (mxfp8) | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| Defiant Fable 9B (mxfp4) | 0,640 | 0,824 | 0,886 | 0,703 | 0,468 | 0,780 | 0,691 |
| Qwen3.5-9B-Instruct (mxfp8, base) | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.8-27B (mxfp8, base) | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.8-27B (mxfp4, base) | 0,581 | 0,771 | 0,889 | 0,738 | 0,442 | 0,798 | 0,713 |
| Qwen3.6-27B-Instruct (mxfp8, base) | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.5-27B-Instruct (mxfp8, base) | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |
| Qwen3.6-35B-A3B-Instruct (mxfp8, base) | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |

Notas aportadas por el autor: el modelo alcanza 640 en ARC-C tanto en 8 bits como en 4 bits; en modo thinking los resultados superan en la mayoria de casos a los de modo instruct, aunque no se publican esos numeros. No hay datos de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM en Q4_K_M: aproximadamente 6,36 GB (dato de fuente externa).
- VRAM estimada por cuantizacion: unos 18 GB en bf16, en torno a 9-10 GB en 8 bits y 5-6 GB en 4 bits (estimaciones calculadas a partir del numero de parametros; no publicadas por el autor).
- Cabe en GPU de consumo: si, en 4 u 8 bits en tarjetas como RTX 3090, RTX 4090 o RTX 5090. El autor reporta pruebas en una RTX 5090 con Windows 11.
- GPU recomendadas: RTX 4090 y RTX 5090 para uso en local; A100 o H100 para despliegues con contexto completo o lotes grandes.
- Consideracion de contexto: con 256.000 tokens de ventana, la cache KV crece de forma notable y puede dominar el consumo de VRAM en contextos muy largos, por encima del peso de los parametros.
- Rendimiento medido: en Q4_K_S (4 bits) los GGUF regulares alcanzan unos 130 t/s, mientras que los GGUF MTP superan los 185 t/s con una tasa de aceptacion del 60% (2 tokens predichos), en una RTX 5090 con Windows 11 y LM Studio. Los sistemas Linux o macOS suelen ser mas rapidos.
- Ajuste de MTP: mantener temperatura igual o inferior a 1 y repetition penalty en 1 (desactivada). Si la tasa de aceptacion de tokens baja del 50%, conviene usar los quants regulares, que seran mas rapidos en ese caso.
- Opciones de despliegue: cualquier aplicacion compatible con GGUF (llama.cpp, LM Studio, Ollama, entre otras). No se menciona soporte especifico de vLLM o TGI en la informacion disponible.
- Espacio en disco: el repositorio completo ocupa 186,5 GB, ya que incluye todas las variantes de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ARC-c (mxfp8) | HellaSwag (mxfp8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Defiant Fable 9B (este modelo) | 8,95 B | 256.000 | 0,647 | 0,706 | apache-2.0 | GGUF en este repo y en el de DavidAU |
| Qwen3.5-9B-Instruct (base) | no disponible | no disponible | 0,571 | 0,683 | no disponible | no disponible |
| Qwen3.5-27B-Instruct | 27 B | no disponible | 0,557 | 0,533 | no disponible | no disponible |
| Qwen3.6-27B-Instruct | 27 B | no disponible | 0,647 | 0,773 | no disponible | no disponible |
| Qwen3.6-35B-A3B-Instruct | 35 B (MoE, A3B) | no disponible | 0,581 | 0,751 | no disponible | no disponible |

El modelo de 9B iguala o supera a Qwen3.6-27B-Instruct en ARC-c, PIQA y OpenBookQA, y queda por debajo en HellaSwag, BoolQ y WinoGrande. Frente a Qwen3.5-9B-Instruct supera todas las metricas publicadas. El autor advierte que superar benchmarks concretos no implica superar al modelo de 27B en todas las tareas.

## Limitaciones y advertencias

- Modelo abliterado y "heretic": no aplica filtros de rechazo y responde a cualquier peticion. Puede generar contenido danino, ilegal o gravemente sesgado sin advertencia; no es apto para despliegue publico sin una capa de moderacion propia.
- Riesgo de alucinacion: como cualquier modelo de 9B, tiende a inventar hechos, citas y referencias, especialmente en tareas de conocimiento factual y en contextos muy largos.
- Idiomas: solo se declaran ingles y chino. El rendimiento en castellano no esta documentado y probablemente sera inferior.
- Sesgos: la abliteracion puede amplificar sesgos presentes en los datos de entrenamiento al eliminar los comportamientos de rechazo.
- Degradacion por cuantizacion: aunque el autor afirma que el rendimiento se mantiene en 4 y 8 bits, los benchmarks muestran caidas pequenas y consistentes en ARC-c, ARC-e, HellaSwag y OpenBookQA al pasar de bf16 a mxfp4.
- Benchmarks limitados: solo se publican siete tareas de conocimiento y sentido comun. No hay datos de MMLU, HumanEval, GSM8K ni de tareas de razonamiento matematico, por lo que las afirmaciones sobre "inteligencia general" no estan respaldadas por esas metricas.
- Medicion en modo instruct: los resultados de thinking no se publican con cifras, solo de forma cualitativa.
- Vision condicionada: requiere descargar aparte el archivo mmproj; sin el, el modelo no procesa imagenes.
- Licencia: se declara apache-2.0, pero al derivar de la familia Qwen conviene verificar las condiciones de la licencia del modelo base antes de un uso comercial.
- Repositorio de terceros: este repositorio concreto (luoyumo) presenta 0 descargas y 0 likes en el momento de la consulta y es una recuantizacion de un modelo de DavidAU; para produccion es preferible contrastar con el repositorio original del autor.
- Variabilidad de MTP: la ganancia de velocidad depende de la tasa de aceptacion de tokens y del caso de uso; en generacion creativa o con temperaturas altas puede ser contraproducente.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/luoyumo/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base original de DavidAU: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Repositorio GGUF original de DavidAU: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Discusiones del repositorio original: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF/discussions/27
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.5-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp-gguf-davidau
- Ficha en llmrun.dev: https://llmrun.dev/model/davidau-qwen3-5-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-5-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp.html
- Modelo de 27B del mismo autor mencionado en la model card: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
