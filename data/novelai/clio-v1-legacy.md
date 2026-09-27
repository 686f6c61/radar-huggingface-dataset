# NovelAI/clio-v1-legacy

## Resumen

Clio es un modelo de lenguaje de 3.043 millones de parametros desarrollado por NovelAI, publicado originalmente como parte de su servicio de pago Opus y liberado posteriormente en HuggingFace como modelo legacy bajo licencia GPL-2.0. Se trata del primer modelo de gran tamano que NovelAI entreno completamente desde cero, sobre su propio cluster de GPU H100 (denominado Shoggy), en lugar de partir de un checkpoint preentrenado de terceros. El modelo esta orientado a la generacion de texto narrativo en ingles y es la base sobre la que se construyeron sus modulos de escritura asistida.

Tecnicamente es un transformer decoder-only de aproximadamente 3.000 millones de parametros, sin mezcla de expertos, con tokenizer propio (Nerdstash Tokenizer V1) y entrenado sobre un dataset interno denominado Nerdstash. Segun la propia model card, su volumen de entrenamiento era inusualmente alto para su tamano en el momento del lanzamiento, hasta el punto de superar en calidad de escritura a modelos mas grandes de la misma casa como Euterpe y Krake.

Su relevancia actual es mas historica y practica que competitiva: NovelAI lo describe como un modelo en retirada, superado por Kayra, Erato y Xialong, pero lo libera por nostalgia, posteridad y preservacion historica. Para desarrolladores es interesante porque es un modelo pequeno (cabe en GPU de consumo), con pesos en safetensors y GGUF, sin necesidad de codigo personalizado para ejecutarlo en Transformers, y con una licencia copyleft muy concreta (GPL-2.0 estricta, sin clausula "or later").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; compatible con una clase de modelo ya existente en HuggingFace Transformers (el repositorio incluye el tag `stablelm`), activada mediante un flag adicional en la configuracion |
| Parametros totales | 3.043.786.240 (aproximadamente 3,04 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; debe consultarse en el `config.json` del repositorio |
| Tipos de cuantizacion | Se ofrecen archivos en formato GGUF ademas de los pesos completos; los niveles de cuantizacion concretos no estan detallados en la informacion disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | GPL-2.0 (estricta, sin "or later") |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

Clio es un transformer decoder-only autorregresivo entrenado desde cero, no un fine-tuning sobre un modelo existente. NovelAI indica que su arquitectura se corresponde con una clase ya presente en la libreria Transformers, que puede cargarse sin codigo personalizado siempre que se active un flag adicional en la configuracion; el repositorio etiqueta el modelo con `stablelm`, lo que apunta a la familia StableLM como la clase compatible. El modelo emplea un tokenizer propio, el Nerdstash Tokenizer V1, tambien publicado por NovelAI.

El preentrenamiento se realizo en el cluster Shoggy de H100 de la compania sobre el dataset interno Nerdstash, cuyo volumen de tokens, composicion y proceso de curado no se detallan en la model card. Tras el preentrenamiento, el modelo base fue sometido a un finetuning orientado a narracion, y la model card publica una tabla comparativa de metricas del modelo base antes de ese ajuste. No se especifica en la informacion disponible si se aplicaron tecnicas de alineacion como RLHF o DPO, ni detalles sobre atencion, posicional encoding o estrategias de decodificacion.

## Capacidades

- Generacion de texto autoregresiva en ingles, con especial enfasis en prosa narrativa y ficcion.
- Escritura creativa de formato largo: continuacion de historias, descripciones, dialogos y desarrollo de escenas.
- Ajuste al estilo y a la voz de un texto previo dentro de la ventana de contexto (capacidad de "style transfer" narrativo).
- Modelo base reutilizable: puede servir como punto de partida para finetuning especifico (personajes, generos, dominios).
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Asistente de escritura creativa local: el modelo puede generar y continuar relatos en ingles manteniendo coherencia de estilo dentro de su ventana de contexto, y al ser de 3B se ejecuta en una GPU de consumo sin depender de APIs externas.
- Motor de continuacion de texto para novelas interactivas: integrado en un bucle de generacion con prompt acumulativo, permite responder a las acciones del lector y mantener el tono narrativo definido en las primeras lineas.
- Base para finetuning de generacion de personajes: al ser un modelo base con licencia GPL-2.0, es adecuado para entrenar adaptadores LoRA sobre dialogos de un personaje concreto y desplegarlos en un chatbot de rol.
- Generacion de textos de ficcion por lotes: para pipelines que necesitan producir borradores de historias, sinopsis o descripciones de escenas a gran escala, con throughput alto gracias a su tamano reducido.
- Entorno educativo y de investigacion: sirve como caso de estudio reproducible de un LLM entrenado desde cero con tokenizer propio, util para comparar tokenizers, curvas de escalado y tecnicas de preentrenamiento.
- Preservacion y arqueologia de modelos: util para reproducir el comportamiento de la generacion de texto de NovelAI en una epoca concreta, comparando sus salidas con las de Kayra, Erato o Xialong.
- Despliegue embebido o en hardware modesto: gracias a los ficheros GGUF, puede ejecutarse en un portatil con GPU de 8 GB o incluso en CPU mediante llama.cpp, sirviendo como generador de texto offline en herramientas de escritura.
- Prototipado rapido de producto: al no requerir codigo personalizado en Transformers, permite validar una idea de aplicacion narrativa en minutos antes de decidir si se migra a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye una tabla de metricas en formato de imagen (rendimiento del modelo base antes del finetuning para narracion, comparado con modelos de mayor tamano), pero los valores no son accesibles como texto en la informacion proporcionada. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de evaluaciones equivalentes para este modelo.

## Requisitos de hardware

- VRAM estimada en precision completa (fp16/bf16): aproximadamente 6,1 GB solo para pesos; con cache KV y overhead de runtime, del orden de 8-10 GB.
- VRAM estimada en cuantizacion GGUF de 4 bits: aproximadamente 1,8-2,0 GB de pesos; en 5 bits, unos 2,2 GB; en 8 bits, alrededor de 3,2 GB (valores estimados a partir del numero de parametros, no confirmados por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3090, RTX 4090 para inferencia local; A10G, L4, L40S, A100 o H100 para despliegue con batching o multiusuario.
- Cabe en GPU de consumo: si, con holgura. En fp16 entra en cualquier GPU con 12 GB o mas; en cuantizacion de 4 bits puede ejecutarse en GPU de 6-8 GB e incluso en CPU.
- Opciones de despliegue: Transformers (requiere activar el flag de configuracion indicado por el autor), llama.cpp / llama-cpp-python mediante los ficheros GGUF, y potencialmente Ollama importando el GGUF. El soporte en vLLM o TGI no esta confirmado en la informacion disponible, ya que depende de que la arquitectura concreta este soportada por esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NovelAI Clio (clio-v1-legacy) | 3,04 B | No disponible | GPL-2.0 estricta | Pesos abiertos en HuggingFace (safetensors y GGUF) | Modelo narrativo en ingles entrenado desde cero por NovelAI; considerado legacy por su propio autor |
| NovelAI Euterpe | Aproximadamente 1,3 B | No disponible | No liberado | Solo a traves del servicio NovelAI | Modelo anterior de la misma casa; la model card de Clio afirma que Clio escribe mejor pese a tener mas parametros |
| NovelAI Krake | Aproximadamente 20 B | No disponible | No liberado | Solo a traves del servicio NovelAI | Modelo mayor de la misma casa, superado en escritura por Clio segun el autor |
| StableLM-3B-4E1T | 2,8 B | 4.096 tokens | CC-BY-SA-4.0 (para los pesos publicados en su momento) | Pesos abiertos en HuggingFace | Alternativa abierta de tamano comparable, con arquitectura de la misma familia de clases; su licencia es mas permisiva que la GPL-2.0 de Clio |

No se dispone de datos de contexto ni de rendimiento de Clio que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Modelo legacy: NovelAI lo describe explicitamente como superado por Kayra, Erato y Xialong, y fuera del servicio activo; no cabe esperar mejoras ni soporte.
- Idioma: entrenado y evaluado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera pobre.
- Licencia GPL-2.0 estricta (sin "or later"): es una licencia copyleft, por lo que integrar el modelo en un producto propietario o distribuirlo como parte de un binario cerrado plantea obligaciones de liberacion del codigo derivado. No es adecuada para productos comerciales de codigo cerrado sin asesoramiento legal previo.
- Sesgos: el dataset Nerdstash y su composicion no estan documentados publicamente, por lo que no es posible auditar sesgos de genero, etnia, ideologia o estilo. Al estar orientado a ficcion, puede reproducir estereotipos propios de la narrativa de su corpus.
- Alucinacion: como cualquier LLM de 3B entrenado para ficcion, tiende a inventar hechos y a priorizar la coherencia narrativa sobre la veracidad; no es fiable como fuente factual.
- Contexto: la longitud de contexto no esta confirmada en la informacion disponible; conviene verificarla en el `config.json` antes de disenar aplicaciones que dependan de ventanas largas.
- Uso de codigo: no hay evidencia de capacidades destacadas de programacion ni de tool calling; no es un modelo adecuado para tareas de codigo o de agentes.
- Despliegue: aunque no requiere codigo personalizado, si requiere activar un flag concreto en la configuracion; omitirlo puede provocar errores de carga o resultados incorrectos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NovelAI/clio-v1-legacy
- Anuncio de Clio en el blog de NovelAI: https://journal.novelai.net/a-new-model-clio-is-coming-to-opus-ef4e2457c601/
- Anuncio del cluster HGX H100 de NovelAI: https://journal.novelai.net/anlatan-acquires-hgx-h100-cluster-4b7a2e6a631e/
- Tokenizer Nerdstash V1: https://huggingface.co/NovelAI/nerdstash-tokenizer-v1
- Sitio oficial de NovelAI: https://novelai.net/
