# cooler8/yejin-korean-8b-v3-sft

## Resumen

Yejin Korean 8B v3 SFT es un modelo de generacion de texto ajustado para seguir instrucciones en coreano, publicado por el usuario cooler8 en HuggingFace bajo licencia Apache 2.0. Se distribuye como un fine-tuning supervisado (SFT) de un modelo base de la familia Qwen3, segun el tag `qwen3` que acompania al repositorio, y cuenta con 7.241.740.288 parametros (aproximadamente 7,24 mil millones) almacenados en formato safetensors, con un repositorio de 14,5 GB.

El problema que aborda es el de la disponibilidad de modelos instructivos especializados en coreano de tamano medio, que puedan ejecutarse en hardware de consumo o en una sola GPU de datacenter sin recurrir a APIs propietarias. Frente a modelos multilingues genericos, un ajuste especifico sobre datos en coreano puede ofrecer mejor adherencia al idioma en tareas de conversacion e instrucciones, aunque en este caso el autor no publica detalles sobre el dataset de ajuste ni sobre el proceso de entrenamiento.

La relevancia del modelo es limitada y debe valorarse con cautela: apenas acumula 210 descargas y 0 likes, la model card es minima (se limita a indicar el idioma, la licencia, el chat template y un ejemplo de uso en Python) y no se han publicado resultados de benchmarks. Esto lo situa como un artefacto experimental o de uso interno mas que como una alternativa consolidada dentro del ecosistema de modelos coreanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen3 (indicado por el tag `qwen3`; el autor no detalla la arquitectura) |
| Parametros totales | 7.241.740.288 (7,24 mil millones) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no se incluyen versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 14,5 GB |
| Pipeline | text-generation |
| Chat template | `<s><|user|>\n{instruction}<|end|>\n<|assistant|>\n{response}<|end|>\n</s>` |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna mas alla de lo que sugieren los metadatos: el tag `qwen3` apunta a que el modelo deriva de la familia Qwen3 de Alibaba, una arquitectura transformer decoder-only con atencion por consultas agrupadas (GQA en las variantes de mayor tamano) y tokenizador multilingue. El nombre del repositorio indica que se trata de la tercera iteracion ("v3") de un ajuste supervisado ("SFT") sobre un modelo base, pero el autor no especifica cual es exactamente ese checkpoint base, ni si se aplicaron fases posteriores de alineacion como RLHF, DPO o RLVR.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de datos instruccionales, la longitud de secuencia usada durante el ajuste ni si se congelaron capas. La model card unicamente incluye la plantilla de chat y un ejemplo de inferencia con `transformers`, en el que destaca la necesidad de eliminar la clave `token_type_ids` de las entradas generadas por `apply_chat_template`, un detalle poco habitual que conviene reproducir tal cual para evitar errores en tiempo de ejecucion.

En consecuencia, cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, modos de razonamiento explicito, etc.) seria especulativa: no hay evidencia en la informacion disponible de que el modelo incorpore ninguna de ellas.

## Capacidades

- Generacion de texto conversacional en coreano, con formato de turnos usuario/asistente definido por la plantilla de chat del repositorio.
- Seguimiento de instrucciones en coreano, al tratarse de un ajuste supervisado orientado a instrucciones.
- Respuesta a preguntas factuales y de conocimiento general formuladas en coreano (el ejemplo de la model card es precisamente una pregunta sobre la capital de Corea del Sur).
- Generacion de texto libre a partir de un prompt, con control de la longitud mediante `max_new_tokens`.
- Soporte de tool calling / function calling: no disponible; no se documenta ni se menciona en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline declarado es unicamente `text-generation`.
- Capacidades multilingues: no disponibles; el campo `language` declara exclusivamente coreano (ko).
- Modo de razonamiento explicito o "thinking mode": no disponible; no se menciona en la model card.
- Cuantizacion lista para usar: no disponible; no se publican variantes cuantizadas.

## Casos de uso

- Asistente conversacional en coreano para productos digitales: el modelo puede gestionar dialogos multi-turno aplicando su plantilla de chat, lo que permite integrarlo en un backend de atencion al cliente orientado al mercado coreano sin depender de APIs externas. La ausencia de datos sobre longitud de contexto obliga a validar empiricamente el numero maximo de turnos antes de ponerlo en produccion.
- Generacion y reescritura de textos en coreano: redaccion de descripciones de producto, correos, articulos de blog o publicaciones en redes sociales a partir de instrucciones breves, aprovechando el ajuste SFT para mantener el registro y el idioma solicitados.
- Resumen de documentos en coreano: condensacion de informes, actas de reunion o articulos para equipos que trabajan con documentacion coreana, siempre que la longitud del documento quepa en la ventana de contexto efectiva del modelo (no documentada).
- Asistente educativo para estudiantes de coreano o para estudiantes coreanos: explicacion de conceptos, generacion de ejercicios y correccion de respuestas, con la ventaja de que el modelo responde de forma nativa en coreano.
- Preprocesado y normalizacion de texto en pipelines de NLP: uso del modelo para reformatear, clasificar de forma generativa o extraer informacion estructurada a partir de texto libre en coreano antes de alimentar otros sistemas.
- Prototipado e investigacion academica sobre modelos coreanos: al estar bajo Apache 2.0 y pesar 7,24 mil millones de parametros, sirve como punto de partida reproducible para experimentos de ajuste fino, evaluacion de sesgos o comparativas de tecnicas de cuantizacion en un unico servidor o estacion de trabajo.
- Despliegue on-premise con requisitos de soberania del dato: organizaciones que no pueden enviar texto en coreano a servicios cloud pueden autoalojar el modelo y mantener los datos dentro de su infraestructura, condicionado a que la licencia Apache 2.0 se mantenga en el derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, KMMLU, HAE-RAE Bench u otros) y la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo. Por tanto, no es posible comparar su rendimiento con el de alternativas sin realizar una evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): en torno a 14,5 GB solo para los pesos, mas el espacio de activaciones y la cache KV, lo que en la practica exige entre 16 y 24 GB de VRAM segun la longitud de secuencia y el tamano de lote.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8 GB de pesos, con un total practico de 10-12 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 4-5 GB de pesos, con un total practico de 6-8 GB. Estas cifras son estimaciones aritmeticas a partir del numero de parametros, no mediciones publicadas por el autor.
- GPU de datacenter: cabe holgadamente en una A100 de 40 u 80 GB, una H100 o una L40S, con margen para lotes grandes y contextos largos.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en FP16 con lotes pequenos, y en tarjetas de 8-12 GB (RTX 3070, RTX 4060 Ti, etc.) si se aplica cuantizacion de 4 u 8 bits.
- Opciones de despliegue: al publicarse unicamente en safetensors, el modelo puede servirse con transformers, vLLM o Text Generation Inference (TGI) directamente. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se distribuyen versiones GGUF en el repositorio.
- Nota sobre la plantilla de chat: el template emplea los tokens `<|user|>`, `<|assistant|>` y `<|end|>` en lugar del formato ChatML habitual de Qwen3; conviene verificar que el motor de inferencia elegido respeta estos tokens especiales al empaquetar peticiones.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Yejin Korean 8B v3 SFT | 7,24 mil millones | No disponible | Apache 2.0 | HuggingFace, solo safetensors | Sin benchmarks publicados; 210 descargas y 0 likes |
| Qwen3-8B (modelo base de referencia) | 8,2 mil millones | 32.768 tokens nativos en la familia Qwen3 | Apache 2.0 | HuggingFace, safetensors y GGUF | Multilingue, con variantes instructivas y modo de razonamiento; mucho mas soporte de comunidad |
| Llama 3.1 8B Instruct | 8,03 mil millones | 128.000 tokens | Licencia comunitaria de Meta (no Apache 2.0) | HuggingFace | Multilingue, pero con cobertura de coreano limitada frente a modelos especializados |
| Modelos coreanos especializados de 7-13B (por ejemplo la familia EEVE) | 7-13 mil millones | No disponible | Apache 2.0 o similar, segun variante | HuggingFace | Alternativas centradas en coreano con documentacion mas extensa; requieren verificacion caso por caso |

Los datos de las filas correspondientes a modelos alternativos proceden de documentacion publica general y no se han verificado en la busqueda realizada para esta ficha, por lo que deben confirmarse antes de tomar decisiones de adopcion. Para el modelo objeto de la ficha no hay datos de rendimiento con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, adherencia a instrucciones ni seguridad del ajuste. Cualquier evaluacion debe hacerse internamente antes de un despliegue real.
- Riesgo elevado de alucinacion: al ser un modelo de 7,24 mil millones de parametros ajustado mediante SFT y sin documentacion sobre fases de alineacion, es esperable que genere informacion falsa con seguridad aparente, especialmente en preguntas factuales y en dominios especializados.
- Sesgos no evaluados: no se documenta la composicion del dataset de ajuste, por lo que no es posible estimar sesgos de genero, origen, religion o ideologia presentes en las respuestas.
- Idiomas: el modelo declara unicamente coreano. No hay garantia de un comportamiento correcto en castellano, ingles u otros idiomas, y es probable que produzca respuestas degradadas o directamente en coreano si se le consulta en otra lengua.
- Contexto desconocido: al no especificarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni el manejo adecuado de documentos extensos. Hay que medirlo empiricamente.
- Plantilla de chat no estandar: el uso de `<|user|>`, `<|assistant|>` y `<|end|>` en lugar del formato habitual de la familia Qwen3 puede provocar degradacion silenciosa si el motor de inferencia aplica su propia plantilla por defecto.
- Compatibilidad de ecosistema limitada: no hay versiones GGUF, AWQ ni GPTQ publicadas, lo que obliga a convertir los pesos para usarlos con llama.cpp u Ollama y anade pasos manuales al despliegue.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se documenten los cambios. Al ser un derivado de un modelo base no identificado, conviene verificar que la licencia de dicho base no imponga condiciones adicionales.
- Madurez y soporte: con 210 descargas y 0 likes, el modelo carece practicamente de validacion por parte de la comunidad. El autor no publica paper, repositorio de codigo, dataset de entrenamiento ni informacion de contacto, y el nombre "v3" sugiere iteraciones previas sin documentar. No hay garantia de mantenimiento ni de correccion de errores.
- Trazabilidad: no se indica que modelo base concreto se ajusto ni con que version del mismo, lo que dificulta la reproducibilidad y la auditoria del linaje del modelo.
- Nota sobre la busqueda web: los resultados devueltos por la busqueda realizada no guardan ninguna relacion con el modelo (contenido no tecnico y ajeno al ambito) y se han descartado por completo. No existe informacion externa verificable sobre este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cooler8/yejin-korean-8b-v3-sft
- Perfil del autor en HuggingFace: https://huggingface.co/cooler8
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles.
- No se han encontrado en la busqueda web enlaces relevantes, papers ni articulos asociados a este modelo.
