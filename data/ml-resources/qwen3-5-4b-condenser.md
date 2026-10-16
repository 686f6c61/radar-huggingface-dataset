# ml-resources/Qwen3.5-4B-Condenser

## Resumen

Qwen3.5-4B-Condenser es un adaptador LoRA de tipo PEFT publicado por el usuario ml-resources como espejo del modelo original twinkle-kit/Qwen3.5-4B-Condenser alojado en ModelScope. No se trata de un modelo completo, sino de un ajuste fino por supervisión (SFT) sobre el modelo base Qwen/Qwen3.5-4B, especializado en una única tarea: comprimir un pasaje de texto en un resumen telegráfico estructurado que un agente de QA multi-salto pueda leer primero para decidir si merece la pena expandir el pasaje original.

La relevancia de esta ficha es acotada pero clara: el adaptador resuelve un problema concreto de los pipelines RAG y de razonamiento multi-hop, donde el coste dominante es el número de tokens que un agente debe leer antes de decidir qué evidencia recuperar. El condensador transforma cada pasaje en dos secciones markdown ("## Summary" y "## More") con un límite duro de aproximadamente el 50 por ciento de los caracteres del texto fuente, manteniendo explícitos los hechos centrales y dejando el resto como índice de categorías expandibles.

El adaptador se entrenó sobre el conjunto HotpotQA Condensed 9k con el framework Twinkle (repositorio modelscope/twinkle), mediante el script cookbook/rl/train_condenser_ddp.py. El repositorio pesa 0,1 GB, la licencia es Apache 2.0 y el único idioma declarado es el inglés, lo que limita su uso directo en castellano sin un reentrenamiento o al menos una validación específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (modelo base Qwen/Qwen3.5-4B); adaptador PEFT |
| Parametros totales | Aproximadamente 4B en el modelo base segun su denominacion; el adaptador LoRA anade un numero no especificado de parametros entrenables (no disponible) |
| Parametros activos | No aplica: no se indica que el modelo base sea MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio (solo se distribuye el adaptador en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base Qwen/Qwen3.5-4B por separado |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo con pesos completos. La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-4B, que no se describe en la informacion disponible; lo unico confirmado es la relacion base_model_relation: adapter y el uso de la libreria peft. El ajuste se realizo mediante SFT (supervised fine-tuning) sobre el dataset HotpotQA Condensed 9k, con el framework Twinkle de ModelScope y el script cookbook/rl/train_condenser_ddp.py, que sugiere entrenamiento distribuido por data parallel.

La innovacion tecnica no esta en la arquitectura, sino en el contrato de entrada/salida impuesto por el system prompt. El modelo se invoca en un unico turno de chat con un system prompt fijo (CONDENSER_SYSTEM) que define un formato de dos secciones: "## Summary", que debe contener el tema principal del pasaje mas entre dos y cuatro hechos concretos (entidades, numeros, fechas, relaciones), y "## More", que es un indice de palabras clave de categoria y no debe incluir datos en linea. El estilo exigido es telegrafico, con eliminacion de palabras funcion y uso de dos puntos y comas como equivalentes de "es" o "tiene". El prompt incluye una restriccion explicita de no fabricar informacion y de no emitir meta-comentarios sobre la consulta, y un presupuesto de longitud con techo duro de aproximadamente el 50 por ciento de los caracteres de la fuente. En el material disponible, la plantilla de prompt de usuario aparece truncada, por lo que no puede reproducirse completa.

## Capacidades

- Compresion de pasajes: reescribe un unico pasaje en markdown telegrafico con las secciones "## Summary" y "## More", manteniendo el tema principal y los hechos nucleares dentro de un presupuesto de caracteres.
- Ordenacion por relevancia ante una consulta: la query funciona como pista de ordenacion, no como filtro; los hechos relevantes van primero pero el resto se conserva.
- Generacion de indices de categoria: la seccion "## More" enumera que tipos de dato son recuperables del original (por ejemplo, lugar de nacimiento, fechas, causas) sin volcar los valores.
- Generacion de texto en ingles: unico idioma declarado; la regla 5 del system prompt obliga a que el idioma de salida coincida con el del texto fuente.
- Integracion en pipelines de agente: el diseno asume un agente de QA multi-salto que decide, a partir del resumen, si expande el pasaje original.
- No dispone de soporte declarado de tool calling, function calling, vision, audio ni modo de razonamiento explicito (thinking mode); no se menciona ninguna de estas capacidades en la informacion disponible.

## Casos de uso

- Recuperacion aumentada en QA multi-salto: en un pipeline RAG tipo HotpotQA, el condensador se coloca entre el recuperador y el razonador; el agente lee primero los resumenes de todos los pasajes candidatos, decide cuales expandir y reduce drasticamente los tokens consumidos en la fase de cribado.
- Reduccion de coste de contexto en produccion: al limitar cada bloque a aproximadamente la mitad de los caracteres del original, se puede duplicar el numero de pasajes que caben en la misma ventana de contexto del modelo final, con el consiguiente ahorro de tokens de entrada.
- Construccion de indices intermedios en bases documentales: la seccion "## More" funciona como indice de categorias recuperables, util para generar metadatos o etiquetas tematicas por pasaje antes de indexar.
- Preprocesado de documentacion tecnica larga: condensar manuales, RFCs o articulos en fichas telegraficas que un agente pueda revisar rapidamente para decidir la lectura completa de la seccion relevante.
- Agentes de investigacion con presupuesto de contexto limitado: cuando el agente debe consultar decenas de fuentes por consulta, el condensador actua como capa de triaje y solo se paga el coste completo de los pasajes finalmente expandidos.
- Filtrado previo de corpus en herramientas de anotacion: generar resumenes telegraficos por pasaje para que un anotador humano o un modelo juez clasifique rapidamente relevancia antes de una revision manual detallada.
- Investigacion sobre compresion de contexto: el adaptador sirve como referencia reproducible para comparar estrategias de compresion (condensador aprendido frente a truncado, resumen abstractivo o recuperacion selectiva) en experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el contrato de entrada/salida, el dataset de entrenamiento y el framework, pero no incluye metricas de calidad de compresion, fidelidad, tasas de alucinacion ni comparaciones cuantitativas con alternativas.

## Requisitos de hardware

- El repositorio del adaptador ocupa 0,1 GB, de modo que el espacio en disco del propio artefacto es despreciable; el coste real lo determina el modelo base Qwen/Qwen3.5-4B, que debe descargarse y cargarse por separado.
- VRAM estimada para el modelo base de aproximadamente 4B parametros: en torno a 8-9 GB en FP16/BF16 y 3-4 GB en cuantizacion de 4 bits. Son estimaciones derivadas del tamano del modelo base, no datos confirmados en la informacion disponible.
- El adaptador LoRA en si apenas anade VRAM sobre el modelo base, aunque el entrenamiento o el merge pueden requerir memoria adicional.
- GPU recomendadas: cualquier GPU con al menos 8-10 GB de VRAM para FP16 (RTX 3080/3090, RTX 4070/4080/4090, A10, L4); para 4 bits bastan GPU de 4-6 GB. Para despliegue en lote o concurrencia alta, A100 o H100.
- Cabe en GPU de consumo: si, siempre que se cuantice el modelo base o se disponga de una GPU con 8 GB o mas de VRAM.
- Opciones de despliegue: al ser un adaptador PEFT, es compatible con el ecosistema Hugging Face Transformers y con servidores que soportan adaptadores LoRA (vLLM con soporte LoRA, TGI, entre otros); tambien puede fusionarse con el modelo base para desplegarse de forma estandar. La compatibilidad con llama.cpp/Ollama dependeria de convertir el modelo fusionado a GGUF, conversion no documentada en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparacion cuantitativa fiable. A continuacion se comparan caracteristicas estructurales con alternativas genericas de la misma categoria, marcando como no disponible todo lo que no consta en la informacion.

| Modelo | Tipo | Parametros | Contexto | Licencia | Datos publicos de rendimiento |
|---|---|---|---|---|---|
| Qwen3.5-4B-Condenser (este) | Adaptador LoRA de compresion sobre Qwen3.5-4B | Base ~4B + adaptador no especificado | No disponible | Apache 2.0 | No disponible |
| Modelo base Qwen/Qwen3.5-4B sin adaptar | Transformer denso | ~4B | No disponible | No disponible en la informacion | No disponible |
| Compresion extractiva clasica (truncado o seleccion de frases) | No neuronal | No aplica | No aplica | No aplica | No disponible |
| Resumidor abstractivo generico de ~4B | Transformer denso afinado para resumen | ~4B | No disponible | Segun el modelo | No disponible |

## Limitaciones y advertencias

- Alcance funcional muy restringido: no es un asistente general ni un modelo de razonamiento; esta disenado exclusivamente para condensar un pasaje en el formato de dos secciones definido por el system prompt. Usarlo fuera de ese contrato degrada la calidad de salida.
- Dependencia del system prompt: el comportamiento depende de un CONDENSER_SYSTEM fijo y verbatim; variaciones en ese prompt pueden romper el formato o el equilibrio entre "## Summary" y "## More".
- Idioma: solo se declara ingles. La regla de coincidencia de idioma con la fuente sugiere cierta generalizacion, pero no hay datos que la respalden; para castellano deberia validarse o reentrenarse.
- Riesgo de alucinacion: el propio system prompt prohibe fabricar hechos, lo que indica que el modo de fallo es conocido y plausible. En compresion agresiva a la mitad de caracteres, la omision de hechos secundarios es esperable por diseno y puede afectar a consultas cuyo dato relevante estaba en la parte descartada.
- Perdida de informacion como comportamiento previsto: el indice "## More" no contiene los datos, solo categorias; cualquier agente que no expanda el pasaje original trabajara con informacion incompleta.
- Sesgos: no hay informacion sobre la composicion demografica, tematica o geografica del dataset HotpotQA Condensed 9k, mas alla de su origen en HotpotQA. Es previsible un sesgo hacia ingles enciclopedico tipo Wikipedia y hacia tareas de QA multi-salto.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base Qwen/Qwen3.5-4B, que no se detallan en la informacion disponible.
- Procedencia: el repositorio es un espejo no oficial del modelo de ModelScope publicado por twinkle-kit; el usuario ml-resources indica que todo el credito es de los autores originales y que no se trata de una release oficial.
- Madurez: cero descargas y cero likes en el momento de la consulta, y ausencia total de benchmarks publicos; no hay evidencia de validacion en produccion.
- Plantilla de prompt incompleta: el material disponible trunca el template de usuario, por lo que no puede reproducirse integramente.
- Resultados de la busqueda web no relevantes: las consultas realizadas devolvieron paginas sobre la desambiguacion de "ML", vehiculos Mercedes-Benz Clase M/ML, conversion de mililitros a litros y el videojuego Mobile Legends, ninguna relacionada con este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ml-resources/Qwen3.5-4B-Condenser
- Modelo original en ModelScope: https://www.modelscope.cn/models/twinkle-kit/Qwen3.5-4B-Condenser
- Dataset de entrenamiento (HotpotQA Condensed 9k): https://www.modelscope.cn/datasets/twinkle-kit/hotpotqa-condensed-9k
- Framework Twinkle: https://github.com/modelscope/twinkle
- Script de entrenamiento: https://github.com/modelscope/twinkle (ruta cookbook/rl/train_condenser_ddp.py)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Enlaces adicionales relevantes encontrados en la busqueda web: no disponible (los resultados obtenidos no guardan relacion con el modelo).
