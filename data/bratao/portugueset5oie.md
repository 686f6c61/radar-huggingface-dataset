# bratao/PortugueseT5Oie

## Resumen

`PortugueseT5Oie` es un checkpoint de investigacion desarrollado por Bruno Souza Cabral en el marco de su tesis doctoral en la Universidade Federal da Bahia (UFBA), centrada en la evolucion de la extraccion de informacion abierta (OpenIE) para portugues mediante modelos de lenguaje. Se trata de un modelo encoder-decoder basado en la arquitectura T5, con aproximadamente 783 millones de parametros (la tesis redondea a 770M), afinado para la tarea de extraccion de informacion abierta extractiva en portugues: dado un texto, produce tripletas semanticas del tipo `(ARG0, V, ARG1)`, donde `ARG0` es el sujeto, `V` el verbo o predicado y `ARG1` el objeto.

El modelo se distribuye a traves del repositorio unificado `portuguese-openie`, que ofrece una API de alto nivel para extraer tripletas sin necesidad de gestionar el prompt manualmente. Sin embargo, la documentacion publica es incompleta: no se ha encontrado un manifiesto de entrenamiento definitivo, ni un dataset asociado, ni una evaluacion cuantitativa que pueda atribuirse con seguridad a este checkpoint exacto. El estado de entrenamiento registrado (paso 2.000 de un plan de 1.291.623 pasos) sugiere que los pesos publicados podrian no ser el checkpoint final previsto. Por ello, el propio autor lo clasifica como un artefacto experimental, recomendando fijar la revision del repositorio y validar su comportamiento con datos propios antes de cualquier uso en produccion.

La relevancia actual de este modelo reside en su contribucion al ecosistema de procesamiento de lenguaje natural en portugues, un idioma con escasez de recursos especificos para tareas de extraccion estructurada. Su integracion en la libreria `portuguese-openie` facilita su uso, pero su adopcion debe hacerse con cautela debido a la falta de garantias sobre su entrenamiento y evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) |
| Parametros totales | 783.150.080 (aprox. 783M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (T5 estandar suele usar 512 tokens, pero no se ha confirmado) |
| Tipos de cuantizacion | solo float32 publicado; no hay versiones cuantizadas |
| Idiomas soportados | portugues (pt) |
| Licencia | no declarada (ausencia de licencia no implica permiso de uso) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5 original, un transformer encoder-decoder basado en la formulacion texto-a-texto. No se trata de una arquitectura MoE ni hibrida; es un transformer denso clasico. La tarea objetivo es la extraccion de informacion abierta extractiva, es decir, identificar en el texto original los segmentos que corresponden a cada argumento de la tripleta, en lugar de generar una parafrasis abstractiva.

Los datos de entrenamiento no estan declarados en el repositorio publico. La model card indica que no se ha encontrado ningun identificador de dataset ni mezcla de entrenamiento especifica para este checkpoint. El autor senala que los corpus utilizados en otros puntos de la tesis no pueden asignarse a este artefacto por su nombre. El estado de entrenamiento registrado muestra el paso 2.000 de un programa nominal de 1.291.623 pasos (tres epocas, epoca aproximada 0,00465), sin mejor metrica ni mejor checkpoint guardado, lo que sugiere que el estado podria estar desactualizado o copiado. No se menciona el uso de RLHF ni DPO; el afinamiento parece ser supervisado de forma estandar, aunque sin documentacion verificable.

Una innovacion destacable es la integracion con la libreria `portuguese-openie`, que normaliza la salida en un objeto de tripleta con campos `ARG0`, `V` y `ARG1`, y acepta formatos JSON y legado. El prompt recomendado para uso directo con Transformers es `"Entrada:\n{sentence}\nResposta:\n"`, aunque esta plantilla no esta confirmada como la utilizada durante el afinamiento.

## Capacidades

- Extraccion de informacion abierta extractiva en portugues: identifica y extrae tripletas semanticas `(ARG0, V, ARG1)` directamente de los segmentos del texto original.
- Generacion de texto a texto: al ser un modelo T5, puede generar respuestas estructuradas a partir de una entrada textual, aunque su especialidad es la extraccion de tripletas.
- Integracion con la API `portuguese-openie` para uso simplificado sin gestion manual de prompts.
- Soporte de decodificacion greedy para resultados mas reproducibles, segun las recomendaciones del autor.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio. Es un modelo puramente textual.

## Casos de uso

- Construccion de bases de conocimiento a partir de corpus academicos: dado un articulo cientifico en portugues, el modelo extrae relaciones como `(A UFBA, está localizada em, Salvador)`, que pueden alimentar grafos de conocimiento para investigacion bibliometrica.
- Analisis de noticias y redes sociales: extraccion de hechos de textos periodisticos o publicaciones para monitorizacion de eventos, deteccion de tendencias o verificacion de afirmaciones, siempre que se valide la precision del modelo en el dominio especifico.
- Enriquecimiento de motores de busqueda semantica: las tripletas extraidas pueden indexarse para mejorar la recuperacion de informacion en sistemas de preguntas y respuestas sobre documentos en portugues.
- Asistencia a la investigacion en humanidades digitales: extraccion de relaciones de textos historicos o literarios para estudios de analisis de contenido, aunque la cobertura dialectal y de dominio no esta establecida.
- Prototipado de pipelines de NLP en portugues: uso como componente de extraccion de informacion en sistemas de investigacion donde se necesite un extractor OpenIE de codigo abierto, con la advertencia de validar su rendimiento.
- Evaluacion comparativa de modelos OpenIE para portugues: dado su caracter de checkpoint de investigacion, puede utilizarse como referencia en estudios academicos que comparen tecnicas extractivas y abstractivas, siempre fijando la revision exacta del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificables para este checkpoint exacto. La model card advierte explicitamente que los valores de F1 reportados en la tesis (0,2732 perfect-match F1 y 0,5171 lexical F1) pertenecen a `PortugueseT5OieAbstractive`, no a este repositorio, y no deben reutilizarse. No existe ninguna evaluacion cuantitativa independiente que pueda atribuirse con seguridad a `PortugueseT5Oie`.

## Requisitos de hardware

- VRAM estimada: el repositorio en float32 ocupa aproximadamente 3,13 GB. Se recomienda un punto de partida de 6-8 GB de RAM/VRAM libres, aunque el consumo real depende del runtime y de la longitud de las secuencias.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, A10) puede ejecutar el modelo en float32. Para mayor comodidad, una RTX 3090 o A100 ofreceria margen para secuencias largas.
- En consumer GPU: si, modelos como RTX 3060 12GB o superiores pueden cargar el modelo en float32; tambien es posible inferencia en CPU, aunque con menor rendimiento.
- Opciones de despliegue: el modelo es compatible con el pipeline de Transformers (AutoModelForSeq2SeqLM), y puede servirse con TGI (Text Generation Inference) o vLLM, aunque no se ha documentado su compatibilidad explicita. La libreria `portuguese-openie` proporciona una interfaz de alto nivel.
- Latencia y throughput: no se han publicado mediciones. Al ser un modelo de 783M en float32 sin cuantizacion, la inferencia en GPU consumer sera de decenas de milisegundos por oracion corta, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PortugueseT5Oie (este) | 783M | no disponible | OpenIE extractiva | no declarada | Hugging Face |
| PortugueseT5OieAbstractive | no disponible | no disponible | OpenIE abstractiva | no declarada | Hugging Face (mencionado en la model card) |
| PortNOIE (framework) | no disponible | no disponible | OpenIE neuronal para portugues | no disponible | GitHub (paper PROPOR 2022) |

No se dispone de datos de rendimiento comparables ni de una evaluacion comun, por lo que la comparacion se limita a caracteristicas documentales. `PortugueseT5OieAbstractive` parece ser la variante abstractiva del mismo proyecto, con metricas reportadas en la tesis, pero no se ha confirmado su publicacion en Hugging Face. `PortNOIE` es un framework anterior del mismo autor, presentado en PROPOR 2022, que sirve de base conceptual.

## Limitaciones y advertencias

- Proveniencia de entrenamiento incompleta: el estado de entrenamiento registrado (paso 2.000 de 1.291.623) no demuestra que los pesos publicados sean el checkpoint final. La model card recomienda fijar la revision `3600cd62101e3cfdbafa46a7c3187ef4c69fc436` y validar con datos propios.
- Riesgo de alucinacion y texto malformado: aunque la tarea es extractiva, el modelo puede generar salidas incompletas, duplicadas o inventadas. Es imprescindible verificar los campos extraidos contra los segmentos originales del texto.
- Sin evaluacion publica verificable: no existe ninguna metrica de rendimiento atribuible a este checkpoint. Los numeros de F1 mencionados en la tesis pertenecen a otro modelo.
- Licencia no declarada: la ausencia de licencia no otorga permiso para redistribuir o modificar los pesos. Se debe contactar con el autor y revisar los terminos de los modelos predecesores y los datos de entrenamiento antes de cualquier uso.
- Cobertura de dominio y dialectos no establecida: no se ha evaluado el comportamiento en distintos registros, variedades del portugues (brasileno vs. europeo) ni textos largos.
- La extraccion no es verificacion de hechos: las tripletas generadas reflejan la estructura del texto, no la verdad factual del mundo real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bratao/PortugueseT5Oie
- Proyecto Portuguese-OpenIE (GitHub): https://github.com/FORMAS/Portuguese-OpenIE
- Tesis doctoral (Cabral, 2025): "Evolving Open Information Extraction for Portuguese employing Language Models" (citada en la model card)
- Paper PortNOIE (PROPOR 2022): Cabral, Souza y Claro, doi: 10.1007/978-3-030-98305-5_23
- Repositorio del autor en Hugging Face: https://huggingface.co/bratao
