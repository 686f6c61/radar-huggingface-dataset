# irfanhossainsust/bangla-gpt2-small

## Resumen

Bangla GPT-2 (small) es un modelo de lenguaje causal de 23.132.160 parámetros entrenado desde cero sobre texto en bengalí por el usuario irfanhossainsust. Reproduce la arquitectura GPT-2 en su configuración reducida (6 capas, 6 cabezas de atención, 384 dimensiones ocultas) con una ventana de contexto de 512 tokens, e incorpora un tokenizador BPE byte-level propio de 32.000 tokens diseñado específicamente para bengalí. El modelo se distribuye en safetensors y en exportaciones ONNX (fp32 e int8) para inferencia en navegador.

El problema que aborda es la escasez de modelos base entrenados nativamente en bengalí con un tokenizador adaptado a su sistema de escritura. El tokenizador propio mantiene las vocales diacríticas y el hasanta unidos a sus consonantes, lo que según el autor produce 4,6 caracteres por token frente a 0,5 del tokenizador original de GPT-2 (secuencias 9,3 veces más cortas). El corpus de entrenamiento procede de Wikipedia, Wikisource, Wikibooks, Wikiquote y Wikivoyage en bengalí, con 136.241.994 tokens y 230.678 documentos.

Es relevante ahora como artefacto de investigación de bajo coste computacional, no como modelo de producción. Se trata de un checkpoint intermedio: el autor indica que solo se han completado 500 de 4.157 pasos previstos (1,0 época) sobre hardware Apple M4 con MPS en fp32, y advierte explícitamente de que no está ajustado a instrucciones, no sigue órdenes y genera con frecuencia afirmaciones falsas con apariencia fluida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, atencion causal): 6 capas, 6 cabezas, 384 dimensiones ocultas |
| Parametros totales | 23.132.160 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | ONNX int8 (exportado por el autor); ninguna otra cuantizacion oficial publicada |
| Idiomas soportados | Bengalí (bn) unicamente |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (transformers) y ONNX (fp32 e int8) |
| Vocabulario | 32.000 tokens, BPE byte-level entrenado sobre el corpus |
| Tamano del repositorio | 0,3 GB |
| Pipeline | text-generation |
| Compatibilidad | transformers, text-generation-inference, endpoints_compatible |
| Estado del entrenamiento | Checkpoint intermedio (paso 500 de 4.157; 1,0 epoca) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2 en configuracion pequeña: 6 capas, 6 cabezas de atencion, 384 dimensiones de modelo y contexto de 512 tokens, con 23.132.160 parametros. El tokenizador es un BPE byte-level de 32.000 tokens entrenado sobre el propio corpus, con un pre-tokenizador distinto al de GPT-2 original que conserva los signos vocálicos del bengalí y el hasanta unidos a sus letras, evitando la fragmentacion de palabras. Sobre texto retenido, el autor reporta 4,6 caracteres por token frente a 0,5 del tokenizador de GPT-2 original.

El entrenamiento usa AdamW con beta 0,9/0,95, weight decay 0,1, learning rate pico de 0,001, 300 pasos de warmup y decaimiento coseno hasta el 10 por ciento, con 32.768 tokens por paso. Se ha ejecutado en un Apple M4 con MPS en precision fp32. El corpus es irfanhossainsust/bangla-nlp-corpus v0.2.0 (configuracion `corpus`), compuesto por Wikipedia, Wikisource (solo paginas revisadas), Wikibooks, Wikiquote y Wikivoyage en bengalí, deduplicado y filtrado por calidad, con licencia CC BY-SA 4.0. Contiene 136.241.994 tokens de entrenamiento y 7.553.621 tokens de validacion, y el autor indica que la particion de validacion no comparte documentos, agrupaciones de duplicados ni libros de Wikisource con la de entrenamiento. No se menciona en la informacion disponible ninguna fase de RLHF, DPO ni ajuste por instrucciones, ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en bengalí mediante completado causal (causal language modeling); no es un modelo de instrucciones y no responde a ordenes.
- Tokenizacion especifica para escritura bengalí, preservando signos vocálicos y hasanta unidos a las consonantes, con una media de 4,6 caracteres por token.
- Inferencia en navegador: el repositorio incluye exportaciones ONNX en fp32 e int8 que alimentan la demo irfanhossainsust/bangla-nlp-dashboard con transformers.js.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles de HuggingFace.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking mode), vision, audio ni multimodalidad.
- No es multilingue: solo se ha entrenado con texto en bengalí.
- Estilo de salida formal y enciclopedico-literario, derivado del corpus de origen; no hay datos de conversacion, noticias ni redes sociales.

## Casos de uso

- Investigacion sobre tokenizacion de lenguas de bajos recursos: comparar el rendimiento del BPE byte-level de 32.000 tokens frente al tokenizador de GPT-2 original midiendo caracteres por token y perplejidad por token sobre el mismo corpus retenido.
- Linea base (baseline) en experimentos academicos de modelado de lenguaje en bengalí: al ser un modelo de 23M parametros entrenado desde cero, sirve como punto de referencia reproducible frente a arquitecturas mayores o adaptadas con fine-tuning.
- Docencia y divulgacion sobre entrenamiento de LLM: el modelo permite ilustrar de principio a fin (corpus, tokenizador, bucle de entrenamiento, curvas de perdida) en hardware de consumo, algo inviable con modelos de miles de millones de parametros.
- Demostraciones interactivas en navegador: las exportaciones ONNX int8 y la demo con transformers.js permiten ejecutar generacion de texto bengalí sin servidor ni GPU, util para talleres y pruebas de concepto.
- Pruebas de infraestructura y pipelines de despliegue: su tamano permite validar extremo a extremo integraciones con transformers, text-generation-inference, ONNX Runtime o HuggingFace Endpoints antes de migrar a modelos mayores, con un coste de computo marginal.
- Experimentos de generacion creativa o estilistica en bengalí: completar fragmentos con registro literario y enciclopedico (por ejemplo, continuar versos o parrafos al estilo del corpus), siempre con revision humana y sin tratar la salida como informacion verificada.
- Generacion de texto sintetico para aumentar datos en tareas auxiliares de NLP en bengalí: usar las completaciones como material de preentrenamiento adicional, filtrando por calidad y aceptando que la perplejidad elevada implica una fidelidad limitada.
- No recomendado para atencion al cliente, generacion de codigo, matematicas, recuperacion de hechos, asistentes conversacionales ni cualquier flujo de produccion que requiera fiabilidad factual o seguimiento de instrucciones.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados; `verified: false`):

| Tarea | Conjunto de evaluacion | Metrica | Valor |
|---|---|---|---|
| Modelado de lenguaje causal | Bangla NLP Corpus v0.2.0 (split de validacion) | Perplejidad de validacion | 1.298,16 |
| Modelado de lenguaje causal | Bangla NLP Corpus v0.2.0 (split de validacion) | Entropia cruzada de validacion | 7,1687 |

Desglose por paso publicado por el autor:

| Paso | Perdida de validacion | Perplejidad |
|---:|---:|---:|
| 500 | 7,1687 | 1.298,2 |

El autor advierte que la perplejidad esta medida por token BPE y no es comparable con modelos que usan otros tokenizadores. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar.

## Requisitos de hardware

- VRAM estimada para inferencia de los pesos: aproximadamente 0,09 GB en fp32 (23.132.160 parametros x 4 bytes), unos 0,05 GB en fp16 y unos 0,02 GB en int8. El cuello de botella real es el runtime y la cache KV, no los pesos.
- Cache KV: con contexto de 512 tokens y 6 capas de 384 dimensiones, la cache es de orden de kilobytes por secuencia, por lo que el uso de memoria es despreciable.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es sobradamente suficiente; el autor entreno el modelo en un Apple M4 con backend MPS, lo que indica que la inferencia en CPU o en GPU integrada es viable.
- Cabe en GPU de consumo: si, en cualquier RTX 20/30/40, GTX 1050 Ti o superior, e incluso en iGPU y en navegador mediante ONNX int8 con transformers.js. El autor declara haber entrenado en Apple M4 (MPS).
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime o transformers.js con las exportaciones incluidas, text-generation-inference (etiqueta declarada) y endpoints compatibles de HuggingFace. No hay confirmacion de soporte oficial de llama.cpp, GGUF, Ollama o vLLM en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Capas / dim. oculta | Contexto | Idioma principal | Vocabulario | Licencia |
|---|---|---|---|---|---|---|
| bangla-gpt2-small | 23.132.160 | 6 / 384 | 512 | Bengalí | 32.000 BPE byte-level para bengalí | CC BY-SA 4.0 |
| GPT-2 small original | 124.000.000 (aproximado) | 12 / 768 | 1.024 | Ingles | 50.257 BPE byte-level para ingles | MIT |
| Alternativas en bengalí del mismo tamano o tarea | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible |

Notas: la fila de GPT-2 small original recoge datos de conocimiento publico sobre ese modelo y no forma parte de la informacion proporcionada en la model card; se incluye unicamente como referencia de escala arquitectonica. No se dispone de datos de rendimiento comparables, ya que bangla-gpt2-small no publica resultados en benchmarks estandar y su perplejidad no es comparable con la de modelos que usan otros tokenizadores.

## Limitaciones y advertencias

- Checkpoint intermedio: el autor indica que solo se han completado 500 de 4.157 pasos (1,0 epoca) y que el modelo sera reemplazado automaticamente por el checkpoint final.
- Sesgo de dominio: entrenado solo con texto enciclopedico y literario (Wikipedia, Wikisource, Wikibooks, Wikiquote y Wikivoyage), sin noticias, conversacion ni redes sociales, por lo que el registro es formal y no cubre lenguaje coloquial.
- Sesgo tematico: Wikipedia sobrerrepresenta geografia, biografias y temas centrados en Bangladés e India.
- Riesgo alto de alucinacion: el propio autor advierte de que el modelo no recuerda hechos de forma fiable y produce falsedades con apariencia de fluidez; su salida no debe usarse como informacion.
- Sin ajuste de seguridad ni de instrucciones: no sigue ordenes y puede reproducir sesgos presentes en el texto de origen.
- Perplejidad de validacion muy elevada (1.298,16), coherente con un modelo pequeno y un entrenamiento incompleto.
- Limitacion de contexto: 512 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o prompts con muchos ejemplos.
- Limitacion idiomatica: soporta unicamente bengalí; no se ha entrenado en castellano ni en ninguna otra lengua.
- Licencia CC BY-SA 4.0: permite uso comercial, pero impone atribucion y share-alike sobre obras derivadas, en linea con la licencia del texto de entrenamiento (© Wikipedia y colaboradores de Wikimedia). Conviene revisar las obligaciones de compatibilidad antes de integrarlo en un producto propietario.
- Adopcion nula por el momento: 0 descargas y 0 likes, sin validacion externa ni resultados verificados (`verified: false` en las metricas declaradas).
- No existen datos publicados de latencia, throughput, soporte de herramientas de inferencia como vLLM o llama.cpp, ni de rendimiento en tareas estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/irfanhossainsust/bangla-gpt2-small
- Dataset de entrenamiento: https://huggingface.co/datasets/irfanhossainsust/bangla-nlp-corpus
- Demo interactiva (Space): https://huggingface.co/spaces/irfanhossainsust/bangla-nlp-dashboard
- Paper, blog tecnico o repositorio adicional: no disponible en la informacion proporcionada
