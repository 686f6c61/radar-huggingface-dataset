# cooler8/yejin-korean-3b-v2-dpo-gguf

## Resumen

Yejin Korean 3B v2 - DPO (GGUF) es la version cuantizada en formato GGUF del modelo cooler8/yejin-korean-3b-v2-dpo, un modelo conversacional de aproximadamente 3.000 millones de parametros orientado principalmente al coreano y con soporte secundario de ingles. Lo publica el usuario cooler8 en Hugging Face y su funcion es permitir la ejecucion del modelo base en motores de inferencia compatibles con GGUF, como llama.cpp, Ollama o LM Studio, sin necesidad de convertir pesos ni de disponer de GPU dedicada.

Tecnicamente se trata de un transformer decoder-only con atencion por grupos (GQA): la configuracion declarada por el autor es de 3072 dimensiones de embedding, 28 capas, 24 cabezas de atencion y 8 cabezas KV, con un vocabulario de 64.000 tokens y un tokenizador especifico para coreano. El recuento real de parametros en safetensors es de 3.211.970.560. No hay informacion publicada sobre longitud de contexto, volumen de tokens de entrenamiento ni composicion del dataset.

Su relevancia practica es doble. Por un lado, cubre un nicho poco poblado: modelos de ~3B con tokenizador nativo de coreano y licencia Apache 2.0, lo que facilita el uso comercial sin las restricciones habituales de las licencias de pesos de otros modelos. Por otro lado, sus dos cuantizaciones disponibles (Q4_K_M de 1,83 GB y Q8_0 de 3,18 GB) lo colocan en el rango de despliegue en portatiles, equipos de escritorio sin GPU y dispositivos de borde, con un coste de almacenamiento y memoria muy bajo. El precio a pagar es que se trata de un modelo de autor individual, con cero descargas y cero likes en el momento de redactar esta ficha, y sin resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA (3072d / 28 capas / 24 cabezas / 8 cabezas KV) |
| Parametros totales | 3.211.970.560 (~3,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (1,83 GB) y Q8_0 (3,18 GB) |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF; el modelo base se distribuye en safetensors |
| Vocabulario | 64.000 tokens, tokenizador especifico de coreano |
| Plantilla de chat | `<s><\|user\|>{pregunta}<\|end\|><\|assistant\|>{respuesta}<\|end\|></s>` |
| Tamano del repo | 5,4 GB |
| Fecha de publicacion | 14 de septiembre de 2026 |

## Arquitectura y entrenamiento

La model card del repositorio GGUF solo documenta la configuracion estructural (3072 dimensiones, 28 capas, 24 cabezas de atencion, 8 cabezas KV) y el vocabulario de 64.000 tokens. A partir de esos datos se deduce una arquitectura transformer decoder-only con Grouped Query Attention, donde cada cabeza KV da servicio a tres cabezas de consulta (24/24 frente a 8), una tecnica habitual para reducir la memoria de la cache KV durante la inferencia. El nombre del modelo base incluye el sufijo "dpo", lo que indica que el modelo original paso por una fase de Direct Preference Optimization tras el entrenamiento supervisado, aunque no se detalla el dataset de preferencias ni el pipeline completo.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del corpus, la posible presencia de fases de RLHF adicionales ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, mezcla de expertos, etc.). El unico elemento diferencial documentado con cierta concrecion es el tokenizador de 64.000 entradas disenado para coreano, que reduce el numero de tokens por palabra respecto a los tokenizadores genericos centrados en ingles y, por tanto, mejora la eficiencia efectiva en textos coreanos.

## Capacidades

- Generacion de texto conversacional en coreano e ingles, con plantilla de chat integrada en el GGUF como `tokenizer.chat_template`.
- Generacion de texto general y respuesta a preguntas; el ejemplo de la model card es una pregunta factual sencilla sobre la capital de Corea del Sur.
- Conversacion multiturno mediante los roles `<|system|>`, `<|user|>` y `<|assistant|>`, con tokens de parada `<|end|>` y `</s>`.
- Procesamiento de texto coreano con mayor eficiencia de tokens gracias al vocabulario de 64.000 entradas.
- Inferencia en CPU y en GPU de gama baja, al estar cuantizado en GGUF.
- Traduccion y generacion bilingue coreano-ingles: no esta documentada explicitamente, pero es una consecuencia esperable del entrenamiento bilingue declarado.
- No hay evidencia publicada de soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso explicito, modo "thinking", vision, audio, matemáticas avanzadas ni generacion de codigo. Estas capacidades deben considerarse no verificadas.

## Casos de uso

- Atencion al cliente en coreano en entornos con recursos limitados: el modelo puede desplegarse en una maquina sin GPU mediante llama.cpp u Ollama y gestionar conversaciones de soporte en coreano con un consumo de memoria inferior a 3 GB, lo que abarata el coste por instancia si se despliega en varios nodos pequenos.
- Asistente conversacional embebido en aplicaciones de escritorio o moviles: con la cuantizacion Q4_K_M (1,83 GB) es viable integrar el modelo en un producto local que funcione sin conexion, algo relevante en escenarios de privacidad donde los datos no deben salir del dispositivo.
- Traduccion asistida coreano-ingles en flujos internos: el modelo puede preprocesar o resumir textos coreanos antes de pasarlos a un traductor o a un modelo mayor, actuando como etapa de normalizacion y ahorro de tokens en pipelines mas grandes.
- Generacion de resumenes de documentacion coreana: informes, correos o tickets de soporte en coreano pueden condensarse localmente antes de almacenarse o enviarse a un sistema de gestion documental.
- Clasificacion y etiquetado de texto coreano a pequena escala: con ajuste fino ligero o prompts de plantilla, sirve como base para categorizar quejas, comentarios o resenas en coreano sin depender de APIs externas.
- Prototipado rapido y evaluacion de producto: gracias a que el GGUF se carga directamente en Ollama, LM Studio o llama-server, permite validar ideas de producto en coreano en minutos y sin infraestructura.
- Educacion de idiomas y practica de conversacion: al mantener conversaciones multiturno en coreano con un tono controlable mediante el rol de sistema, puede usarse en aplicaciones de aprendizaje para simular dialogos.
- Generacion de datos sinteticos en coreano para entrenar clasificadores o para aumentar datasets pequenos, siempre que se revise y filtre la salida por posible ruido o alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, HellaSwag ni de tareas especificas de coreano (como KoBEST o KLUE), ni comparaciones con otros modelos. Tampoco se documentan mediciones de latencia, throughput o consumo de memoria en ninguna configuracion de hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de los tamanos de fichero publicados, la cuantizacion Q4_K_M (1,83 GB) requiere aproximadamente 2,5-3,5 GB de memoria total contando pesos y cache KV para contextos moderados; la Q8_0 (3,18 GB) ronda los 4-5 GB en las mismas condiciones. Son estimaciones derivadas del tamano de los pesos, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para Q4_K_M; una RTX 3060 de 12 GB, una RTX 4060 Ti, una RTX 4070, una RTX 4090 o una A100/H100 sobran ampliamente y quedarian limitadas por el propio tamano del modelo, no por el hardware.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU de escritorio moderna e incluso iGPU con memoria unificada suficiente puede ejecutar la cuantizacion Q4_K_M.
- Ejecucion en CPU: viable con llama.cpp. El modelo esta pensado para este escenario, ya que el repositorio incluye instrucciones directas para `llama-cli` y `llama-server`.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (el repositorio incluye un `Modelfile`), LM Studio y otros motores compatibles con GGUF. El repositorio esta marcado como `endpoints_compatible`, por lo que tambien puede desplegarse en Hugging Face Inference Endpoints. Para vLLM o TGI habria que usar el modelo base en safetensors, ya que estos motores no consumen GGUF como formato principal.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas principales | Licencia | Formato |
|---|---|---|---|---|---|
| Yejin Korean 3B v2 DPO (este) | 3,2B | No disponible | Coreano, ingles | Apache 2.0 | GGUF (y safetensors en el base) |
| Llama 3.2 3B Instruct | 3,2B | 128.000 tokens | Multilingue (8 idiomas oficiales) | Llama 3.2 Community License | safetensors, GGUF vía terceros |
| Qwen2.5 3B Instruct | ~3,1B | 32.768 tokens nativos, ampliable | Multilingue (incluye coreano) | Qwen License | safetensors, GGUF vía terceros |
| EXAONE 3.5 2.4B Instruct | 2,4B | 32.768 tokens | Coreano, ingles | EXAONE AI Model License | safetensors |

Nota: los datos de los modelos comparativos provienen de informacion publica general y no de la busqueda web realizada, que no devolvio resultados relacionados. El rendimiento comparado en tareas de coreano no puede establecerse porque este modelo no publica benchmarks. La ventaja diferencial mas clara frente a las alternativas es la combinacion de licencia Apache 2.0, tokenizador especifico de coreano y disponibilidad inmediata en GGUF con dos cuantizaciones ya construidas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks publicados, ni tarjetas de evaluacion, ni resultados de terceros. No es posible estimar su calidad real frente a alternativas conocidas.
- Trazabilidad limitada: se trata de un modelo de autor individual, sin paper, sin repositorio de codigo asociado y con cero descargas y cero likes en el momento de redactar esta ficha. No hay informacion sobre el dataset de entrenamiento, por lo que no puede auditarse la composicion de los datos.
- Riesgo de alucinacion: es esperable un riesgo alto en un modelo de ~3B sin evaluacion publicada, especialmente en tareas factuales, matematicas y razonamiento multi-paso.
- Contexto desconocido: la longitud de contexto no esta documentada, lo que impide planificar despliegues que dependan de ventanas largas. Cualquier uso con entradas extensas requiere una prueba previa.
- Cobertura de idiomas: oficialmente solo coreano e ingles. El castellano no esta soportado de forma declarada y su comportamiento en otros idiomas es impredecible.
- Capacidades no verificadas: no hay evidencia de soporte de tool calling, agentes, vision, audio ni modo de razonamiento explicito. No debe asumirse que funcionen.
- Restricciones de licencia: la licencia Apache 2.0 es permisiva y permite uso comercial, modificacion y redistribucion, pero se aplica al artefacto publicado. Conviene verificar la licencia y las condiciones del modelo base y confirmar que el autor tenia derecho a relicenciar los pesos derivados, dado que no se documenta el origen de los datos de entrenamiento.
- Derivados de cuantizacion: Q4_K_M introduce perdida de precision respecto a los pesos originales. Para tareas sensibles a la exactitud debe usarse Q8_0 o el modelo base en safetensors.
- Formato de chat estricto: el modelo espera los tokens especiales `<|user|>`, `<|assistant|>` y `<|end|>`. Usar una plantilla distinta degradara la calidad de las respuestas.
- Temperatura y muestreo: el `Modelfile` recomienda temperature 0.7, top_p 0.9 y repeat_penalty 1.1; apartarse mucho de estos valores puede producir salidas degeneradas, aunque esta recomendacion no esta justificada con datos.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/cooler8/yejin-korean-3b-v2-dpo-gguf
- Modelo base (referenciado, no verificado en esta busqueda): https://huggingface.co/cooler8/yejin-korean-3b-v2-dpo
- llama.cpp (motor de inferencia compatible): https://github.com/ggerganov/llama.cpp
- Ollama (motor de inferencia compatible): https://ollama.com
- LM Studio (cliente compatible con GGUF): https://lmstudio.ai

No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos asociados a este modelo en la busqueda web realizada. Los resultados devueltos por dicha busqueda no guardan relacion con el modelo y se han descartado.
