# SoAIHQ/Qwen3.5-4B-GGUF

## Resumen

SoAIHQ/Qwen3.5-4B-GGUF es una compilacion en formato GGUF del modelo Qwen3.5-4B, desarrollado originalmente por Qwen y cuantizado por SoAI para su uso con llama.cpp y con el runtime propio de SoAI. Se trata de un modelo denso de 4.326.350.848 parametros (aproximadamente 4,3 mil millones) que combina texto, entrada de imagenes, razonamiento explicito y llamada a herramientas, con una ventana de contexto de 262.144 tokens (256K). Su proposito es llevar un modelo multimodal con modo de razonamiento a equipos de consumo: la cuantizacion Q4_K_M ocupa 2,8 GB, lo que permite ejecutarlo en portatiles y estaciones de trabajo sin GPU dedicada de gama alta.

El modelo base emplea una arquitectura hibrida de Gated DeltaNet mas atencion, con decodificacion densa. Frente a un transformer clasico, la componente Gated DeltaNet reduce el coste del estado recurrente, lo que ayuda a sostener contextos muy largos sin el crecimiento cuadratico del coste de atencion. La model card declara soporte para 201 idiomas y dialectos, aunque el corpus de calibracion de la cuantizacion cubre 21 idiomas y 22 lenguajes de programacion.

La relevancia de esta ficha concreta esta en el proceso de cuantizacion, no solo en el modelo. SoAI ha usado una importance matrix (imatrix) calculada sobre un corpus propio de conversaciones reales, codigo, llamadas a herramientas y matematicas paso a paso, formateado con la plantilla de chat nativa del modelo. Ademas, la compilacion verifica que los marcadores de chat, razonamiento y tool calling queden almacenados como tokens especiales antes de publicar el fichero, algo que suele romperse silenciosamente en conversiones descuidadas. La licencia es Apache 2.0 y el repositorio ocupa 8,1 GB en total.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con hibrido Gated DeltaNet + atencion |
| Parametros totales | 4.326.350.848 (4,3 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (2,8 GB), Q8_0 (4,6 GB), mmproj F16 (672,4 MB) para vision. No se publican cuantizaciones por debajo de 4 bits |
| Idiomas soportados | 201 idiomas y dialectos segun la model card; el corpus de calibracion cubre 21 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modalidades de entrada | Texto e imagen; audio no soportado |
| Salida | Texto |
| Razonamiento explicito | Si, activado por defecto y desactivable por peticion |
| Tool calling | Si, con sintaxis nativa de llamada a herramientas |
| Modelo base | Qwen/Qwen3.5-4B (relacion: quantized) |
| Cuantizado por | SoAI |
| Tamano del repositorio | 8,1 GB |
| Revision del repositorio | Creado el 26 de septiembre de 2026, actualizado el mismo dia |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B usa una arquitectura hibrida que mezcla capas de Gated DeltaNet con capas de atencion convencional, dentro de un diseno denso (sin mezcla de expertos). Gated DeltaNet es una variante de modelo de estado recurrente con compuertas que permite mantener un estado de tamano fijo por capa, lo que abarata el coste de contexto largo frente a la atencion completa. La combinacion de ambos tipos de capa busca conservar la calidad de recuperacion de informacion de la atencion clasica y, al mismo tiempo, reducir el coste en contextos de cientos de miles de tokens. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni la distribucion exacta entre capas DeltaNet y capas de atencion.

Sobre el entrenamiento del modelo base, la informacion disponible no detalla el numero de tokens, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento posteriores al preentrenamiento. La model card del modelo original esta enlazada en este repositorio y es la fuente que habria que consultar para esos datos.

La parte especifica de esta publicacion es la cuantizacion. El fichero Q4_K_M se genera con una importance matrix que pondera que pesos afectan mas a la salida, de modo que se almacenan con mayor precision. SoAI calcula esa imatrix con un corpus propio en lugar de texto web generico, y formatea cada conversacion con la plantilla de chat de este modelo, incluida su sintaxis nativa de llamada a herramientas. El corpus de calibracion cubre conversaciones multiturno en 21 idiomas, ediciones de codigo en 22 lenguajes de programacion, llamadas a herramientas y sus resultados, matematicas paso a paso y prosa web. El fichero Q8_0 se cuantiza sin imatrix porque el formato Q8_0 de llama.cpp no la utiliza. Antes de cuantizar, el proceso comprueba que los marcadores de chat, razonamiento y tool calling se guardan como tokens especiales y que la plantilla de chat incrustada coincide con la del modelo original; si la conversion los importa como texto plano, la compilacion se detiene en lugar de publicar el fichero. El repositorio incluye la imatrix y una tabla de procedencia con la revision original y el commit de llama.cpp, de modo que los ficheros se pueden reconstruir.

## Capacidades

- Generacion de texto conversacional multiturno con ventana de contexto de 262.144 tokens.
- Razonamiento explicito en modo thinking, activado por defecto y desactivable por peticion mediante `"chat_template_kwargs": {"enable_thinking": false}`.
- Entrada de imagenes (image-text-to-text): requiere cargar el proyector multimodal `mmproj-Qwen3.5-4B-f16.gguf` con `--mmproj`.
- Tool calling y function calling con sintaxis nativa de llamada a herramientas, cubierta explicitamente en el corpus de calibracion.
- Capacidades multilingues declaradas sobre 201 idiomas y dialectos en la model card; la calibracion practica cubre 21 idiomas.
- Generacion y edicion de codigo, con calibracion en 22 lenguajes de programacion.
- Razonamiento matematico paso a paso, incluido en el corpus de calibracion.
- No soporta entrada de audio.
- No se declara soporte especifico de agentes multi-paso mas alla de lo que permiten el tool calling y el modo de razonamiento.

## Casos de uso

- Asistente conversacional local en portatil: con el fichero Q4_K_M (2,8 GB) el modelo cabe en equipos sin GPU dedicada, y su contexto de 256K permite mantener hilos largos de conversacion sin truncar historial. Es adecuado cuando la privacidad impide enviar datos a una API externa.
- Analisis de documentos extensos: informes, expedientes o bases de codigo que superan lo que admite un modelo de 8K o 32K tokens. Los 262.144 tokens permiten pasar el documento completo y hacer preguntas sobre el en un solo contexto.
- Atencion con soporte visual: con el proyector `mmproj` cargado, se pueden enviar capturas de pantalla, diagramas, facturas o fotos de producto y pedir descripciones, extraccion de datos o diagnostico de errores de interfaz desde la propia imagen.
- Agente de herramientas en pipelines internos: la sintaxis nativa de tool calling, calibrada con ejemplos reales, permite conectar el modelo a funciones de negocio (consultas a bases de datos, envio de correos, operaciones sobre repositorios) y encadenar varias llamadas dentro de una misma conversacion.
- Asistencia de programacion en el editor: el modelo cubre 22 lenguajes de programacion en su calibracion, por lo que resulta util para completado, refactorizacion y explicacion de codigo, integrado mediante la API compatible con OpenAI que expone `llama-server`.
- Generacion de codigo en produccion: al exponer un endpoint compatible con `/v1/chat/completions`, se puede integrar en tareas de CI/CD, generacion de pruebas o revision automatica de parches, con el modo thinking desactivado para reducir latencia en tareas simples.
- Despliegue en el borde o en equipos aislados: al ser GGUF y funcionar con llama.cpp en CPU, GPU o reparto de capas, es viable en entornos sin conexion a internet ni aceleradores, como plantas industriales o portatiles de campo.
- Traduccion y atencion multilingue: la cobertura declarada de 201 idiomas y dialectos permite construir flujos de traduccion o de clasificacion de textos en idiomas poco frecuentes, con la advertencia de que la calibracion de la cuantizacion se limita a 21 idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Ni la model card del repositorio GGUF ni los datos proporcionados incluyen puntuaciones de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra prueba estandar, ni para el modelo base ni para las cuantizaciones publicadas. Tampoco se ofrecen mediciones de latencia o throughput.

## Requisitos de hardware

Las cifras de memoria que se indican a continuacion son estimaciones derivadas del tamano de los ficheros publicados y de la necesidad de mantener el contexto en memoria; no proceden de mediciones oficiales.

| Cuantizacion | Pesos | Memoria adicional | Comentario |
|---|---|---|---|
| Q4_K_M | 2,8 GB | Contexto + overhead del runtime | Opcion recomendada para la mayoria de maquinas |
| Q8_0 | 4,6 GB | Contexto + overhead del runtime | Salida mas cercana al original, requiere mas memoria |
| mmproj F16 (vision) | 672,4 MB | Solo si se usa entrada de imagen | Se carga con `--mmproj` |

- El modelo solo, en Q4_K_M, es manejable en GPUs de consumo con 6-8 GB de VRAM si se usa un contexto corto.
- Q8_0 (4,6 GB) entra con holgura en GPUs de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB) y justo en tarjetas de 8 GB.
- Para contextos de 128K o 256K, el estado de contexto crece de forma proporcional y deja de ser realista en GPU de consumo; en ese escenario conviene repartir capas entre GPU y CPU o usar memoria unificada abundante, como la de los equipos Apple Silicon.
- En tarjetas de 24 GB (RTX 4090, RTX 3090) el modelo cabe completo en Q8_0 con margen para contexto amplio, aunque sigue siendo pequeno para requerir A100 o H100 salvo que se busque servir muchas peticiones en paralelo.
- La model card indica que llama.cpp puede ejecutar el modelo en GPU, en CPU o con las capas repartidas entre ambos.
- Opciones de despliegue: llama.cpp (`llama-server`, con interfaz de chat y API compatible con OpenAI), SoAI, y cualquier frontend basado en llama.cpp como Ollama o LM Studio. No se documenta soporte de vLLM ni de TGI para estos ficheros GGUF.
- Arranque rapido: `llama-server -hf SoAIHQ/Qwen3.5-4B-GGUF:Q4_K_M`, que descarga automaticamente el proyector si se necesita vision.
- Parametros de muestreo recomendados por el autor, tomados de la model card del modelo original:

| Modo | temperature | top_p | top_k | min_p | presence_penalty |
|---|---|---|---|---|---|
| Thinking, tareas generales | 1.0 | 0.95 | 20 | 0.0 | 1.5 |
| Thinking, codigo preciso | 0.6 | 0.95 | 20 | 0.0 | 0.0 |
| Sin thinking, tareas generales | 0.7 | 0.8 | 20 | 0.0 | 1.5 |

- Qwen recomienda un contexto de al menos 128K tokens para dejar espacio al razonamiento y hasta 32K tokens de salida en la mayoria de consultas.
- No se dispone de datos medidos de latencia ni de throughput.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus fichas oficiales de HuggingFace y deben verificarse antes de tomar decisiones de produccion. No se dispone de comparaciones de rendimiento medidas entre ellos.

| Modelo | Parametros | Contexto | Modalidad | Licencia |
|---|---|---|---|---|
| Qwen3.5-4B (este modelo, via GGUF de SoAI) | 4,3 mil millones, denso | 262.144 tokens | Texto e imagen | Apache 2.0 |
| Qwen3-4B | 4 mil millones, denso | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Texto | Apache 2.0 |
| Gemma 3 4B | 4 mil millones, denso | 128.000 tokens | Texto e imagen | Licencia Gemma |
| Llama 3.2 3B | 3 mil millones, denso | 128.000 tokens | Texto | Licencia comunitaria de Llama 3.2 |

Frente a Qwen3-4B, la diferencia principal es el contexto (256K frente a 32K nativos) y la entrada de imagenes. Frente a Gemma 3 4B, el contexto es mayor y la licencia es Apache 2.0 en lugar de una licencia propia con condiciones de uso. Frente a Llama 3.2 3B, ofrece multimodalidad y mas contexto. La ventaja practica adicional de esta publicacion es la disponibilidad de ficheros GGUF listos para llama.cpp, algo que no siempre esta cubierto en los modelos comparados con la misma calidad de calibracion.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validacion de la comunidad ni evidencia de uso en produccion.
- Existe riesgo de alucinacion, como en cualquier modelo de esta escala. Con 4,3 mil millones de parametros, la generacion de datos factuales, referencias o cifras concretas debe verificarse siempre.
- El autor no publica cuantizaciones por debajo de 4 bits, lo que limita el despliegue en equipos con menos de 4 GB de memoria disponible.
- El rendimiento de las cuantizaciones puede degradarse respecto al modelo original; no se han publicado mediciones de esa perdida.
- El corpus de calibracion del imatrix cubre 21 idiomas, muy por debajo de los 201 idiomas y dialectos declarados como soportados por el modelo. En idiomas fuera de ese conjunto, la calidad de la cuantizacion Q4_K_M puede ser inferior.
- El contexto de 262.144 tokens es teoricamente alcanzable, pero exige memoria proporcional al contexto configurado. En GPU de consumo no es viable sin descargar capas o contexto a CPU y RAM del sistema.
- Para usar entrada de imagen es obligatorio cargar el fichero `mmproj-Qwen3.5-4B-f16.gguf`; sin el, el modelo no procesa imagenes.
- No hay soporte de audio.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero conviene revisar el fichero LICENSE del modelo original enlazado desde el repositorio por si incluye condiciones adicionales.
- El modo thinking esta activado por defecto. En tareas sensibles a la latencia hay que desactivarlo explicitamente por peticion; dejarlo activo consume tokens de salida que el autor acota en hasta 32K por consulta.
- No se conocen sesgos especificos documentados por el autor. Como en cualquier modelo entrenado con datos web a gran escala, hay que asumir sesgos sociales, culturales y linguisticos no medidos.
- Los ficheros GGUF tienen soporte limitado en servidores de inferencia de alto rendimiento como vLLM o TGI; el despliegue escalable con estos formatos pasa por llama.cpp u otros runtimes compatibles.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/SoAIHQ/Qwen3.5-4B-GGUF
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Fichero Q4_K_M: https://huggingface.co/SoAIHQ/Qwen3.5-4B-GGUF/resolve/main/Qwen3.5-4B-Q4_K_M.gguf
- Fichero Q8_0: https://huggingface.co/SoAIHQ/Qwen3.5-4B-GGUF/resolve/main/Qwen3.5-4B-Q8_0.gguf
- Proyector multimodal (F16): https://huggingface.co/SoAIHQ/Qwen3.5-4B-GGUF/resolve/main/mmproj-Qwen3.5-4B-f16.gguf
- Arbol de ficheros del repositorio: https://huggingface.co/SoAIHQ/Qwen3.5-4B-GGUF/tree/main
- Sitio de SoAI: https://soai.to
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos correspondian a paginas de Google Maps y no se han incluido.
