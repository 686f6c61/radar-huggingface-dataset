# MercanAI/NedoLM-0.8B-GRPO-Yargi-Mercan

## Resumen

NedoLM-0.8B-GRPO-Yargi-Mercan es un modelo de aproximadamente 0.800 millones de parametros (0,8B) publicado por la organizacion MercanAI en HuggingFace. Segun su model card, se trata de un export de "Mercan v1" orientado a la funcion de *response composer* del sistema "Yargi" (termino turco que designa el ambito judicial), es decir, un modelo especializado en transformar las observaciones reales devueltas por un ejecutor o herramienta (*tool observation*) en una respuesta final en lenguaje natural dirigida al usuario. El checkpoint de origen es `yargi_best.pt`, obtenido mediante entrenamiento con GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo.

El modelo se distribuye en un contenedor fisico GGUF v3 cuantizado en Q4_K_M, con un vocabulario de 32.002 tokens y una longitud de contexto de 32.768 tokens. El repositorio ocupa aproximadamente 0,5 GB y el archivo de pesos se denomina `model.mercan`. La model card reporta una evaluacion interna denominada "Strict Yargi reference eval" con un resultado de 15/21 (71,43%), que no corresponde a un benchmark estandar y por tanto no es directamente comparable con metricas como MMLU o GSM8K.

Su relevancia actual es acotada y muy especifica: no compite como modelo de proposito general, sino que cubre una pieza concreta de una arquitectura de agentes (la composicion de respuestas a partir de observaciones de herramientas). Resulta de interes para quienes investigan el diseno de sistemas agente-herramienta en turco, o para quienes quieran estudiar el uso de GRPO en modelos pequenos orientados a una tarea unica. El modelo no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo indica que deriva de NedoLM y que es un export de Mercan v1; no especifica transformer, MoE ni SSM) |
| Parametros totales | 0,8B (aproximado, segun el identificador del modelo y el tamano del archivo) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | turco (etiqueta `turkish`); resto no disponible |
| Licencia | other (terminos no detallados en la informacion disponible) |
| Formato de pesos | GGUF v3, archivo `model.mercan` |
| Vocabulario | 32.002 tokens |
| Checkpoint de origen | `yargi_best.pt` (GRPO -> Yargi) |
| Tamano del repositorio | ~0,5 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Los unicos datos tecnicos confirmados son: se trata de un export de "Mercan v1" cuyo checkpoint de partida es `yargi_best.pt`, y que su entrenamiento se realizo mediante GRPO (Group Relative Policy Optimization), un metodo de optimizacion por refuerzo que estima ventajas relativas dentro de un grupo de respuestas generadas. El modelo base de la familia es NedoLM, segun la etiqueta `nedolm`, pero no se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases previas de SFT, RLHF o DPO adicionales.

La unica innovacion o particularidad tecnica documentada es su proposito funcional: el modelo esta entrenado especificamente para generar una respuesta final en lenguaje natural a partir de resultados reales de un ejecutor o herramienta. La model card advierte ademas de un detalle de integracion importante: si el entorno de ejecucion (*runtime*) necesita un *envelope* JSON, la respuesta en lenguaje natural generada debe envolverse programaticamente, es decir, la conversion a JSON no la realiza el modelo. Tambien se indica que la evaluacion "Strict Yargi reference" alcanzo 15 de 21 casos (71,43%), sin detallar la composicion ni la metodologia de dicho conjunto.

## Capacidades

- Generacion de texto en turco orientada a una tarea muy concreta: componer la respuesta final al usuario a partir de observaciones de herramientas o de un ejecutor.
- Integracion en pipelines de agentes como modulo de *response composer*, situado al final de la cadena de ejecucion.
- Manejo de contexto largo (hasta 32.768 tokens), adecuado para concatenar historial de ejecucion y observaciones de herramientas.
- Generacion de lenguaje natural que puede envolverse externamente en JSON si el runtime lo requiere.
- Soporte de *tool calling* / *function calling*: no documentado como capacidad propia; el modelo consume observaciones de herramientas, pero no se indica que emita llamadas a herramientas.
- Razonamiento multi-paso autonomo: no documentado.
- Capacidades multimodales (vision, audio): no documentadas.
- Modo de razonamiento explicito (*thinking mode*): no documentado.
- Capacidades multilingues fuera del turco: no disponibles.

## Casos de uso

- Composicion de respuestas en agentes turco-parlantes: el modelo recibe la salida estructurada de un ejecutor (por ejemplo, el resultado de una consulta o una accion) y la transforma en una respuesta final legible para el usuario, aprovechando sus 32.768 tokens de contexto para incluir el historial de ejecucion.
- Asistentes de dominio juridico en turco: dado que "Yargi" designa el ambito judicial, encaja como capa de redaccion de respuestas en herramientas de consulta legal, siempre que se valide la exactitud del contenido con fuentes externas.
- Capa de *response composer* en arquitecturas de agentes con tool calling: se situa despues del ejecutor para convertir observaciones tecnicas en lenguaje natural, mientras el *envelope* JSON se genera programaticamente en el runtime.
- Prototipado en hardware limitado: con ~0,5 GB en Q4_K_M, permite desplegar un modulo de composicion de respuestas en portatiles o equipos sin GPU dedicada, como parte de un sistema mayor.
- Normalizacion de salidas de herramientas heterogeneas: el modelo puede unificar formatos de salida distintos de varias herramientas en una unica respuesta coherente en turco para el usuario final.
- Evaluacion e investigacion de GRPO en modelos pequenos: sirve como caso de estudio de aplicacion de aprendizaje por refuerzo a una tarea de generacion acotada en un modelo de 0,8B.
- Pipeline de soporte automatizado en turco: como ultimo eslabon de una cadena que consulta sistemas internos y necesita devolver una explicacion en lenguaje natural al operador o cliente.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Notas |
|---|---|---|
| Strict Yargi reference eval | 15/21 (71,43%) | Evaluacion interna del autor; no es un benchmark estandar y no se detalla su metodologia |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 0,5 GB, por lo que los pesos requieren del orden de 0,5-1 GB; a ello hay que sumar la memoria de la cache KV, que crece con la longitud de contexto (hasta 32.768 tokens) y cuyo tamano exacto no es calculable sin conocer la configuracion de atencion (no disponible).
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM deberia ser suficiente para el modelo, aunque la cifra exacta depende de la cache KV; no se publican recomendaciones oficiales.
- Compatibilidad con GPU consumer: si, previsiblemente cabe en tarjetas de gama de entrada (por ejemplo, GTX 1650, RTX 3050 y superiores) y tambien en CPU.
- Opciones de despliegue: al distribuirse en GGUF v3, es compatible con el ecosistema llama.cpp; Ollama y otros runners basados en GGUF son candidatos naturales, aunque no se confirma soporte oficial para vLLM, TGI u otros servidores.
- Latencia y throughput: no disponibles.
- Nota: el archivo se denomina `model.mercan`, por lo que puede requerir renombrado o adaptacion para cargarlo en herramientas estandar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NedoLM-0.8B-GRPO-Yargi-Mercan | ~0,8B | 32.768 | 15/21 (71,43%) en evaluacion interna | other | HuggingFace (0 descargas) |
| MercanAI/Mercan-0.8B-SFT | ~0,8B (por el nombre) | no disponible | no disponible | no disponible | HuggingFace (modelo hermano de la misma organizacion) |
| Alternativas comparables de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa con modelos de terceros de la misma categoria (composicion de respuestas en turco), por lo que no se incluyen datos que no esten documentados.

## Limitaciones y advertencias

- El modelo esta especializado en una unica tarea (composicion de respuestas a partir de observaciones de herramientas); no es un modelo de proposito general y su uso fuera de ese rol probablemente de malos resultados.
- No hay informacion sobre sesgos, composicion del dataset ni proceso de alineacion, por lo que no pueden evaluarse sesgos conocidos.
- Riesgo de alucinacion: no cuantificado; al generar lenguaje natural a partir de observaciones de herramientas, puede introducir informacion no presente en dichas observaciones, lo que exige validacion en produccion.
- Idiomas: la unica etiqueta de idioma es `turkish`; el comportamiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Licencia: marcada como `other`, sin terminos detallados en la informacion disponible, por lo que el uso comercial no puede darse por permitido sin consultar al autor.
- El modelo no genera el *envelope* JSON por si mismo; el runtime debe envolver la salida programaticamente, tal como advierte la model card.
- La evaluacion reportada (15/21) es interna y de metodologia desconocida; no debe usarse como comparacion frente a benchmarks publicos.
- El repositorio no registra descargas ni valoraciones, lo que implica ausencia de validacion por parte de la comunidad.
- El nombre del archivo (`model.mercan`) puede dificultar la carga directa en herramientas estandar basadas en GGUF.
- El modelo tiene un tamano de 0,8B, por lo que su capacidad de razonamiento y conocimiento general es limitada en comparacion con modelos mayores.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/MercanAI/NedoLM-0.8B-GRPO-Yargi-Mercan
- Perfil de la organizacion MercanAI: https://huggingface.co/MercanAI
- Modelo hermano MercanAI/Mercan-0.8B-SFT: https://huggingface.co/MercanAI/Mercan-0.8B-SFT
