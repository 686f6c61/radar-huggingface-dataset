# 10X-Technologies/StoryTOM-10M-en-GGUF

## Resumen

StoryTOM-10M-en-GGUF es la distribucion en formato GGUF de StoryTOM-10M-en, un modelo base de generacion de texto en ingles desarrollado por 10X-Technologies. Se trata del primer lanzamiento de la familia TOM (Task-Oriented Models), un planteamiento que consiste en entrenar modelos desde cero para una unica tarea concreta: en este caso, continuar cuentos infantiles sencillos. El autor aclara explicitamente que TOM no tiene relacion con "Theory of Mind" pese a las siglas.

El modelo es deliberadamente minúsculo: 12.485.760 parametros reales segun los pesos en safetensors (comercializado como "10M"), lo que permite ejecutarlo integramente en un telefono sin conexion mediante llama.cpp y aplicaciones derivadas como PocketPal, LM Studio u Ollama. La ventana de contexto util es de 544 tokens, exactamente la longitud de los cuentos sinteticos con los que fue entrenado.

Su relevancia es fundamentalmente metodologica y practica: sirve como caso de estudio reproducible sobre entrenamiento de modelos pequenos, tokenizacion y comparacion controlada entre ingles y telugu (tema del paper asociado), y como ejemplo de despliegue on-device con un coste de almacenamiento de entre 25 MB y 50 MB. No es un modelo de proposito general ni sigue instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de lenguaje; ejecutable con llama.cpp) |
| Parametros totales | 12.485.760 (etiquetado comercialmente como "10M") |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 544 tokens (longitud de entrenamiento; no se soportan contextos mayores) |
| Tipos de cuantizacion | F16 (16 bits, 25 MB) y F32 (32 bits, 50 MB); no se publican cuantizaciones de menor precision en el repositorio |
| Idiomas soportados | ingles (en); el modelo base original incluye datos en telugu, pero esta distribucion GGUF es solo en ingles |
| Licencia | Apache 2.0 (incluye obligacion de redistribuir el fichero NOTICE) |
| Formato de pesos | GGUF (llama.cpp); el modelo original esta en safetensors |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Modelo base | 10X-Technologies/StoryTOM-10M-en (relacion: quantized) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (numero de capas, dimension del modelo, tipo de atencion ni funcion de activacion), solo que se trata de un modelo base entrenado desde cero y compatible con el ecosistema llama.cpp. El entrenamiento se realizo sobre cuentos infantiles sinteticos en ingles procedentes de TinyStories (Eldan y Li, 2023, bajo licencia CDLA-Sharing-1.0), complementados con traducciones al telugu generadas con Gemma 4 E2B (Apache 2.0), de las cuales 20 se produjeron con ChatGPT. No se indica el numero total de tokens vistos durante el entrenamiento.

La innovacion destacable no esta en la arquitectura sino en el proceso de validacion de la cuantizacion: los dos ficheros GGUF publicados se comprobaron contra el modelo original verificando que el tokenizador produce exactamente los mismos tokens sobre 500 cuentos en ingles y que las continuaciones greedy (temperatura 0) son identicas token a token. El tokenizador se entreno antes de separar el conjunto de test, por lo que los cuentos de evaluacion influyeron en el vocabulario (no asi en el entrenamiento del modelo). El modelo se distribuye con una plantilla de chat trivial que pasa el texto del usuario sin modificarlo.

## Capacidades

- Continuacion de cuentos: dado el inicio de una historia, el modelo escribe la continuacion coherente con el estilo de cuentos infantiles simples.
- Generacion de texto en ingles exclusivamente, con vocabulario y estructuras propias de la literatura infantil sintetica.
- Ejecucion completamente offline y on-device: no requiere red ni GPU dedicada.
- Integracion con llama.cpp mediante `llama-completion`, y con frontends que lo soportan (PocketPal en Android e iOS, LM Studio, Ollama).
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio de generacion de texto.
- Reproducibilidad exacta: la version F16 y F32 replican el comportamiento del modelo original con decodificacion greedy.
- No soporta instrucciones, preguntas, tool calling, function calling, agentes, vision, audio ni modo de razonamiento. Es un modelo base, no ajustado por instrucciones.

## Casos de uso

- Generacion de cuentos en el movil sin conexion: cargando `StoryTOM-10M-en-F16.gguf` en PocketPal con contexto de 544 tokens y temperatura 0,8, la aplicacion puede crear un cuento nuevo a partir de una frase inicial en un dispositivo de gama baja, sin consumir datos ni enviar contenido a un servidor.
- Aplicaciones infantiles educativas: el modelo puede integrarse como generador de microcuentos dentro de una app de lectura, donde el coste de inferencia es practicamente nulo (25 MB de pesos, inferencia en CPU) y el contenido queda acotado al dominio de historias simples.
- Prototipado rapido de pipelines llama.cpp: sirve como modelo de pruebas ultraligero para validar integraciones, plantillas de prompt, manejo de contexto y decodificacion antes de sustituirlo por un modelo mayor en produccion.
- Investigacion reproducible sobre modelos pequenos: permite replicar los experimentos del paper "Same Stories, Different Language: A Controlled Comparison of Tiny English and Telugu Language Models" y estudiar el efecto del tokenizador y del tamano en la calidad de la generacion.
- Docencia y divulgacion: con 12,5 M de parametros y dos ficheros de 25 MB y 50 MB, es un ejemplo practico para explicar cuantizacion, tokenizacion, decodificacion greedy y el concepto de modelo base frente a modelo instruido.
- Generacion de datos sinteticos de texto simple: util para crear corpus de cuentos infantiles de bajo coste destinados a pruebas de sistemas de TTS, clasificadores de texto o correctores ortograficos.
- Demostraciones de IA on-device en ferias o entornos sin conectividad: el reducido tamano del fichero permite distribuirlo por correo o en almacenamiento local y ejecutarlo en cualquier portatil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que las opciones recomendadas (temperatura 0,8, top-p 0,95, contexto 544) coinciden con las usadas en la evaluacion del paper, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de perplexity.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para CPU. El fichero F16 ocupa 25 MB y el F32 50 MB, por lo que el consumo de memoria es inferior a 100 MB en ambos casos, incluyendo el contexto de 544 tokens.
- GPU recomendadas: ninguna. Funciona en CPU sin aceleracion; cualquier GPU compatible con llama.cpp puede usarse, pero no aporta ventaja practica.
- Compatibilidad con GPU de consumo: si, en cualquier tarjeta, e incluso en telefonos Android e iOS mediante PocketPal.
- Opciones de despliegue: llama.cpp (`llama-completion`), PocketPal, LM Studio, Ollama y cualquier runtime que acepte GGUF; tambien despliegue como endpoint de text-generation.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano, la latencia sera del orden de milisegundos por token en CPU moderna, pero se trata de una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| StoryTOM-10M-en-GGUF | 12.485.760 | 544 | en | Apache 2.0 | GGUF (F16, F32) | Entrenado solo con cuentos infantiles; modelo base |
| TinyStories-1M (roneneldan) | ~1 M | no disponible en esta ficha | en | no disponible en esta ficha | safetensors | Referencia de la que proceden los datos de entrenamiento; mucho menor |
| TinyStories-33M (roneneldan) | ~33 M | no disponible en esta ficha | en | no disponible en esta ficha | safetensors | Misma familia de datos, mayor capacidad; no incluye distribucion GGUF oficial verificada |
| SmolLM2-135M | ~135 M | 8.192 (segun especificaciones publicas del autor) | en (multilingue parcial) | Apache 2.0 | safetensors, GGUF | Modelo base de proposito general, unas diez veces mayor; no comparable en coste on-device |

La comparacion con TinyStories es la mas pertinente, ya que StoryTOM reutiliza ese corpus; las cifras de licencia y contexto de los modelos de TinyStories no se han verificado en la informacion disponible y deben confirmarse en sus fichas antes de cualquier uso en produccion.

## Limitaciones y advertencias

- Dominio extremadamente restringido: solo ha visto cuentos infantiles sinteticos, por lo que fuera de ese registro produce texto incoherente o repetitivo.
- No es un modelo instruido: no responde a preguntas, no sigue instrucciones y no soporta tool calling ni agentes.
- Contexto maximo de 544 tokens: no se soportan entradas mas largas, lo que descarta conversaciones multi-turno o documentos extensos.
- Solo ingles: no hay soporte real de castellano ni de otros idiomas, pese a que el modelo base original se entreno tambien con datos en telugu.
- Riesgo de alucinacion y de repeticion: al ser un modelo de 12,5 M de parametros sobre datos sinteticos, la coherencia decae rapidamente en generaciones largas.
- Sesgos: los cuentos de TinyStories son sinteticos y simplificados; pueden aparecer estereotipos propios del corpus y del modelo de traduccion usado para el telugu.
- Fuga del test al tokenizador: el vocabulario se entreno antes de separar el conjunto de evaluacion, lo que invalida comparaciones estrictas de perplexity frente a modelos con tokenizadores independientes.
- Licencia Apache 2.0: permite uso comercial, pero obliga a incluir la licencia y el fichero NOTICE en cualquier redistribucion, y a conservar los avisos de atribucion de TinyStories (CDLA-Sharing-1.0).
- Los resultados de busqueda disponibles no contienen informacion tecnica relevante sobre este modelo; no se han usado como fuente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/10X-Technologies/StoryTOM-10M-en-GGUF
- Modelo base: https://huggingface.co/10X-Technologies/StoryTOM-10M-en
- Paper citado (numero de arXiv pendiente de publicacion): "Same Stories, Different Language: A Controlled Comparison of Tiny English and Telugu Language Models"
- TinyStories (Eldan y Li, 2023): https://arxiv.org/abs/2305.07759
- llama.cpp: https://github.com/ggml-org/llama.cpp
- PocketPal: no disponible (aplicacion mencionada en la model card para Android e iOS)
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
