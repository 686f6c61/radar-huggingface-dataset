# Remek/basal-omni-1.0-mini

## Resumen

basal-omni-1.0-mini es un modelo experimental desarrollado por Remek (proyecto basal, con repositorio en GitHub bajo el usuario rkinas) construido sobre google/gemma-4-E4B-it. No es un modelo generativo convencional: en lugar de redactar respuestas, lee un estado (un mensaje, un documento, pasajes recuperados, la traza de un agente o una pagina web en JSON) y responde a una pregunta tipada sobre el, devolviendo una probabilidad calibrada para cada respuesta permitida en un solo forward pass. Admite preguntas de tipo choice, noul (si/no), score y, en el motor basal, multi, act y tool.

El modelo se inspira en los llamados modelos de decision de System 1 (rapidos, intuitivos), como Jev, y forma parte de la linea basal-omni sobre Gemma 4, junto a basal-omni-1.0-max (12B). Frente a su predecesor basal-1.5 (4.5B, basado en Bielik), aumenta el limite de opciones por pregunta de 10 a 255, usa un unico orden de opciones por defecto y anade soporte zero-shot de imagenes y audio mediante los encoders de Gemma 4, aunque el entrenamiento se ha realizado solo sobre decisiones de texto.

Cuenta con 7.941.100.874 parametros totales segun los safetensors, un repositorio de 16,1 GB, licencia Apache 2.0 y soporte de polaco e ingles. Su relevancia actual radica en que ofrece decisiones calibradas y acotadas a un conjunto cerrado de opciones (la respuesta nunca cae fuera de las opciones dadas), lo que lo hace util para clasificacion, enrutamiento y verificacion en pipelines de produccion donde se necesita una medida explicita de confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 4 E4B (modelo base google/gemma-4-E4B-it) |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los benchmarks cubren estados de hasta 30k+ caracteres y prompts de hasta 4.095 tokens) |
| Tipos de cuantizacion | no disponible (los resultados publicados se midieron en bf16) |
| Idiomas soportados | pl, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un transformer de la familia Gemma 4, y se ha afinado para una tarea de decision tipada en lugar de generacion de texto libre. La salida es una distribucion de probabilidad calibrada sobre el conjunto de opciones permitidas, obtenida en un unico forward pass sin decodificacion autoregresiva. El motor de inferencia propio (basal) soporta modos de servicio como eager, fast y deterministic, y permite servir medios (imagenes y audio) con la opcion `--media on`.

El entrenamiento consta de dos etapas con aproximadamente 815.000 y 518.000 decisiones tipadas en polaco e ingles, utilizando objetivos suaves (soft targets) generados por basal-1.5. El modelo se entreno solo con decisiones de texto; la capacidad de responder preguntas sobre imagenes y audio es zero-shot, aprovechando los encoders nativos de Gemma 4 sin entrenamiento especifico en medios (el autor indica que el entrenamiento con medios llegara en versiones posteriores). El limite de opciones por pregunta es de 255.

## Capacidades

- Decision tipada sobre un estado: preguntas de tipo choice (eleccion entre opciones), noul (si/no) y score (puntuacion).
- En el motor basal, tipos adicionales multi, act y tool; una pregunta tool sobre definiciones de herramientas OpenAI o MCP selecciona la herramienta, no sus argumentos.
- Salida de probabilidad calibrada por opcion en un solo forward pass, sin generacion de texto; la respuesta queda siempre dentro de las opciones proporcionadas.
- Procesamiento de estados heterogeneos: mensajes, documentos, pasajes recuperados, trazas de agente y paginas web en JSON.
- Soporte zero-shot de imagenes y audio mediante los encoders de Gemma 4 (servido con `--media on`).
- Capacidades multilingues en polaco e ingles.
- Compatibilidad con endpoints (tag endpoints_compatible) y uso a traves de la libreria transformers.

## Casos de uso

- Clasificacion de documentos en produccion: el modelo recibe el texto del documento como estado y una pregunta choice con las categorias permitidas, y devuelve la probabilidad de cada una; el umbral de confianza permite derivar a revision humana los casos dudosos.
- Enrutamiento de consultas en atencion al cliente: con una pregunta choice sobre las opciones de departamento o intencion, el sistema decide el destino del ticket en un unico forward pass y usa la probabilidad para escalar los casos inciertos.
- Verificacion de respuestas en pipelines RAG: dado el pasaje recuperado como estado y una pregunta noul sobre si el pasaje respalda la afirmacion, el modelo actua como comprobador con probabilidad calibrada (el benchmark RAGTruth reporta 0.760).
- Seleccion de herramientas en agentes: con una pregunta tool sobre definiciones OpenAI o MCP, el modelo elige la herramienta adecuada para la tarea, integrandose en un bucle de agente multi-paso.
- Moderacion y filtrado de contenido: pregunta noul o choice sobre politicas definidas, con la ventaja de que la respuesta nunca sale del conjunto de opciones y la confianza es explicita.
- Analisis de documentos largos en polaco e ingles: el modelo mantiene precision razonable en estados de 20k-30k caracteres (65,5%) y de 30k+ (56,2%) en la familia de documentos largos, util para triaje documental.
- Evaluacion de trazas de agente: el estado puede ser la traza completa de una ejecucion y la pregunta, por ejemplo, si la accion final fue correcta o si se debe reintentar.

## Benchmarks y rendimiento

Resultados publicados por el autor, servidos con el motor basal en una NVIDIA H100 80GB HBM3 (bf16), comparados con basal-1.5 (4.5B):

| Benchmark | basal-omni-1.0-mini (E4B) | basal-1.5 (4.5B) |
|---|---|---|
| Werdykt v1, macro (PL + EN, 10 categorias x 2 idiomas) | 0.769 | 0.721 |
| PL decisions (test held-out de basal-1.0, 7.081 items) | 0.932 | 0.922 |
| PL general (conocimiento, examenes, lectura; 3.079 items) | 0.751 | 0.746 |
| PL-Real (300 documentos polacos reales) | 0.950 | 0.963 |
| EN external panel (10 tareas publicas, 3.842 items) | 0.740 | 0.688 |
| Coverage at 1% error (con el umbral publicado) | 42,0% | 51,0% |

Desglose del panel ingles externo: BIG-Bench Hard 0.726 (frente a 0.556), TabFact 0.780 (frente a 0.647), Circa 0.750 (frente a 0.633), RAGTruth 0.760 (frente a 0.653); por detras en JudgeBench, 0.537 frente a 0.567. En el test del corpus ingles de 1.479 items: 0.675 frente a 0.643. Frente a basal-1.5-max (11B): nivel en el panel ingles (+0,3 puntos), por detras en PL decisions (-0,8) y en conocimiento general polaco (-4,6).

Precision por longitud del estado en Werdykt (5.000 items, PL y EN):

| Longitud del estado | Items | Precision |
|---|---|---|
| 0-1k | 709 | 66,4% [63, 70] |
| 1k-2k | 2.598 | 74,4% [73, 76] |
| 2k-4k | 796 | 91,1% [89, 93] |
| 4k-8k | 394 | 93,7% [91, 96] |
| 8k-16k | 128 | 79,7% [72, 86] |
| 16k+ | 375 | 65,1% [60, 70] |

Familia de documentos largos (misma tarea, solo varia la longitud): 8k-20k, 75,7% (226 items); 20k-30k, 65,5% (194 items); 30k+, 56,2% (80 items).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 7,94 mil millones de parametros, en bf16 requiere aproximadamente 16 GB de pesos, mas overhead de activaciones y KV cache.
- GPU recomendadas: los resultados publicados se midieron en una NVIDIA H100 80GB HBM3; no se han publicado mediciones en otras GPU.
- Cabe en GPU de consumo: no confirmado por el autor; por tamano de pesos en bf16 seria viable en tarjetas con 24 GB (por ejemplo, RTX 4090) en teoria, pero no hay datos publicados de funcionamiento ni de cuantizacion.
- Opciones de despliegue: motor basal (basal-serve, con modos eager, fast y deterministic, y opcion `--media on`); compatible con transformers; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el modelo resuelve cada pregunta en un unico forward pass, lo que reduce el coste frente a la generacion autoregresiva, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento clave | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-omni-1.0-mini | 7,94B | no disponible | Werdykt 0.769; PL decisions 0.932; EN panel 0.740 | Apache 2.0 | HuggingFace (Remek/basal-omni-1.0-mini) |
| basal-1.5 | 4,5B | no disponible | Werdykt 0.721; PL decisions 0.922; EN panel 0.688 | no disponible | referenciado por el autor |
| basal-1.5-max | 11B | no disponible | Werdykt 0.772; nivel en EN panel; mejor en PL | no disponible | referenciado por el autor |
| basal-omni-1.0-max | 12B | no disponible | no disponible en la informacion proporcionada | no disponible | HuggingFace (Remek/basal-omni-1.0-max) |

## Limitaciones y advertencias

- Modelo experimental: el autor lo etiqueta explicitamente como experimental y el entrenamiento con medios (imagenes y audio) aun no se ha realizado; el soporte de medios es zero-shot y puede degradarse.
- Categorias mas debiles en Werdykt: reglas (0.352; el autor recomienda calcular umbrales y fechas exactos en codigo), contratos (0.664) y documentos largos (0.686).
- Precision decreciente con estados muy largos: 56,2% en documentos de 30k+ caracteres y 65,1% en estados de 16k+ caracteres.
- Coverage limitada: con el umbral publicado al 1% de error, solo el 42,0% de las preguntas se deciden automaticamente; los tipos sin umbral certificado se derivan a revision humana (las preguntas de tipo score van a una persona).
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Riesgo de alucinacion: el diseno limita la salida al conjunto de opciones, pero las probabilidades calibradas pueden ser erroneas; no se han publicado estudios de calibracion fuera de los conjuntos del autor.
- Limitaciones de idioma: solo polaco e ingles.
- Licencia Apache 2.0, que permite uso comercial; el modelo base Gemma 4 puede tener condiciones adicionales que deben revisarse.
- Dependencia del motor basal propietario del autor para los tipos multi, act y tool y para el servicio de medios; la integracion con transformers por si sola puede no cubrir todas las capacidades.

## Enlaces

- HuggingFace: https://huggingface.co/Remek/basal-omni-1.0-mini
- Modelo hermano: https://huggingface.co/Remek/basal-omni-1.0-max
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
