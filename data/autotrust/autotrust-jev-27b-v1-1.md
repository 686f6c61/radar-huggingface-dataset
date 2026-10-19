# autotrust/AutoTrust-JEV-27B-v1.1

## Resumen

AutoTrust-JEV-27B v1.1 es un modelo de decisión textual de 27.356.728.560 parámetros (unos 27,36 mil millones) publicado por el usuario autotrust en HuggingFace bajo licencia Apache 2.0. No es un modelo generativo al uso: su tarea declarada en el pipeline es `text-classification`, y su función es asignar probabilidades a un conjunto de opciones de respuesta suministradas junto con cada pregunta. Es decir, se usa como cabecera de decisión estructurada sobre candidatos predefinidos, no como un chat que produce texto libre.

El modelo se presenta con una evaluación local completa sobre la suite pública Decision Index 0.3: índice público de 67,31 sobre 37 benchmarks indexados y 140.178 peticiones puntuables completadas. El autor indica que el resultado es autodeclarado y está pendiente de verificación por el mantenedor, y que no se reporta puntuación privada ni Full. Sus puntos fuertes declarados son la selección de herramientas (área Tools & Automation, 85,19 puntos de habilidad), la clasificación de intención y las decisiones de automatización cotidiana.

La relevancia práctica viene del nicho: frente a modelos generalistas, aquí se optimiza explícitamente la decisión entre opciones discretas (enrutado de herramientas, intención, verificación de afirmaciones, inferencia textual). El repositorio ocupa 54,7 GB en safetensors, declara compatibilidad con vLLM y lleva la etiqueta `qwen3_5`, lo que apunta a una base de la familia Qwen3.5, aunque la información disponible no detalla arquitectura interna, contexto ni datos de entrenamiento.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El repositorio incluye la etiqueta `qwen3_5`, que sugiere una base de la familia Qwen3.5; la información proporcionada no detalla el tipo de transformer ni innovaciones internas |
| Parámetros totales | 27.356.728.560 (≈27,36 mil millones), según los pesos en safetensors |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. Solo se publican pesos en safetensors; el repositorio no documenta variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 54,7 GB); librería declarada: vLLM |
| Tarea declarada (pipeline) | `text-classification` (modelo de decisión con opciones estructuradas) |
| Etiquetas | `decision-model`, `classification`, `structured-decisions`, `vllm`, `safetensors`, `qwen3_5`, `region:us` |
| Descargas / likes | 5.615 descargas / 166 likes |
| Fecha de creación / actualización | 2026-10-17 / 2026-10-17 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de la etiqueta `qwen3_5` del repositorio, que apunta a una base de la familia Qwen3.5, y del recuento de parámetros (27,36 mil millones). La información proporcionada no confirma si se trata de un transformer denso, un MoE o una variante híbrida, ni describe mecanismos de atención, tokenizador o ventana de contexto.

Tampoco hay datos sobre el proceso de entrenamiento: no se indican tokens vistos, composición del corpus, uso de RLHF, DPO u otras etapas de alineación, ni el procedimiento de ajuste que convierte la base en un modelo de decisión sobre opciones. Lo único verificable es la metodología de evaluación: evaluación local completa con el kit oficial de Decision Index 0.3, sobre un corpus público fijado (pinned) y 37 benchmarks indexados, con 140.178 peticiones puntuables completadas y resultados autodeclarados pendientes de verificación por el mantenedor.

## Capacidades

- Asignación de probabilidades a opciones de respuesta predefinidas: el modelo puntúa cada candidato suministrado con la pregunta, en lugar de generar texto libre.
- Clasificación de intención con detección de fuera de alcance: 97,08 en CLINC150+OOS y 93,71 en BANKING77 (puntuación bruta de tarea).
- Selección de herramientas para agentes: 97,23 en BFCL, 89,54 en When2Call MCQ, 87,60 en API-Bank y 68,71 en ToolRet.
- Decisiones de automatización doméstica: 89,77 en el simulador de electrodomésticos.
- Verificación de afirmaciones y fidelidad al contexto: 89,12 en HoVer y 83,79 a nivel de respuesta en RAGTruth.
- Inferencia textual (NLI) en dominios especializados: 87,44 en NLI4CT (clínico) y 82,58 en ContractNLI (contractual).
- Comprensión lingüística general: 98,22 en HellaSwag, 95,26 en WinoGrande, 79,90 en ANLI.
- Razonamiento aritmético y de código en formato de opción fija: 84,99 en GSM8K (pista no comparable con los resultados publicados) y 85,44 en CRUXEval.
- Recuperación y clasificación de relevancia: 49,19 en BRIGHT y 52,11 en Amazon ESCI.
- Detección de phishing y análisis de tono: 72,00 en PhishNChips, 65,87 en iSarcasmEval.
- Soporte de tool calling: sí en la vertiente de decisión (elegir qué herramienta usar), no documentado como generación de llamadas en formato JSON.
- Modo thinking, visión, audio o multilingüismo explícito: no disponible en la información proporcionada.

## Casos de uso

- Enrutado de intención en atención al cliente: con 97,08 en CLINC150+OOS y 93,71 en BANKING77, el modelo sirve para clasificar cada mensaje entrante en una taxonomía cerrada de intenciones y detectar consultas fuera de alcance para derivarlas a un agente humano, en lugar de forzar una respuesta automática.
- Selección de herramientas en pipelines de agentes: dado un catálogo de funciones y una petición del usuario, el modelo puntúa qué herramienta corresponde (BFCL 97,23, API-Bank 87,60), lo que permite colocar una capa de decisión barata delante del modelo generador que finalmente construye la llamada.
- Verificación de respuestas en sistemas RAG: se le presentan la respuesta candidata y el contexto recuperado como opciones de decisión, y devuelve la probabilidad de que la afirmación esté soportada (HoVer 89,12, RAGTruth 83,79); sirve como filtro previo a la entrega al usuario.
- Triaje documental en entornos regulados: con 87,44 en NLI4CT y 82,58 en ContractNLI, puede clasificar pares de fragmentos clínicos o contractuales según implicación, contradicción o neutralidad para priorizar revisiones humanas.
- Automatización de domótica e IoT: el simulador de electrodomésticos (89,77) indica que el modelo decide bien entre acciones discretas de control a partir de una instrucción en lenguaje natural, integrable en un asistente de voz local.
- Filtrado y priorización de correo o soporte: combinando la clasificación de intención con la detección de phishing (72,00) se puede etiquetar y ordenar colas de tickets o mensajes sospechosos antes del análisis profundo.
- Evaluación y reranking de recuperadores: las puntuaciones en BRIGHT y ESCI permiten usarlo como juez de relevancia query-documento en la evaluación de sistemas de búsqueda, siempre con la cautela de que su rendimiento en estas tareas es el más bajo del conjunto.
- Procesamiento por lotes de alto volumen: al ser un modelo de clasificación con soporte de vLLM, encaja en trabajos offline de etiquetado masivo (la evaluación reportada cubre 140.178 peticiones), donde el coste por decisión prima sobre la generación de texto.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre Decision Index 0.3 (suite pública, 37 benchmarks indexados). El autor advierte de que la evaluación es local, completa y autodeclarada, pendiente de verificación por el mantenedor, y que no se reporta puntuación privada ni Full.

Índice agregado:

| Métrica | Valor |
|---|---:|
| Índice público (skill, ajustado por azar) | 67,31 |
| Índice bruto (raw) | 75,62 |
| Benchmarks indexados | 37 |
| Peticiones puntuables completadas | 140.178 |

Puntuación por área (skill, 0 = azar, 100 = perfecto):

| Área | Benchmarks indexados | Puntuación |
|---|---:|---:|
| Tools & Automation | 5 | 85,19 |
| Language Understanding | 9 | 73,38 |
| Retrieval & Classification | 6 | 66,97 |
| Knowledge & Reasoning | 11 | 55,16 |
| Arts & Human Taste | 6 | 51,08 |

Knowledge & Reasoning (puntuación bruta de tarea ×100):

| Benchmark | Este modelo | JEV-27B | Jev 1.14 |
|---|---:|---:|---:|
| WinoGrande | **95,26** | 82,56 | 91,08 |
| GSM8K (pistas distintas; no comparable) | 84,99 | - | - |
| BBH (tareas de opción fija) | 86,05 | 78,94 | **93,19** |
| CRUXEval | **85,44** | 73,68 | 74,74 |
| MMLU-Pro | 73,65 | 61,53 | **82,13** |
| CLadder | 81,02 | 70,50 | **88,58** |
| MuSR | 70,61 | 62,37 | **72,61** |
| GPQA Diamond | 54,59 | 44,90 | **75,51** |
| SATA-Bench | **37,88** | 33,64 | 27,88 |
| ChessBench | **21,20** | 16,50 | 16,88 |
| HLE | 16,57 | 6,99 | **19,36** |

Language Understanding (puntuación bruta de tarea ×100):

| Benchmark | Este modelo | JEV-27B | Jev 1.14 |
|---|---:|---:|---:|
| HellaSwag | **98,22** | 92,49 | 94,34 |
| FinEntity | **94,47** | 83,35 | 87,68 |
| NLI4CT | **87,44** | 84,27 | 85,12 |
| ContractNLI | **82,58** | 75,04 | 70,76 |
| ANLI | **79,90** | 77,20 | 74,27 |
| VAST | **79,38** | 54,76 | 73,65 |
| RAGTruth (alucinación a nivel de respuesta) | **83,79** | 80,88 | 75,12 |
| iSarcasmEval | **65,87** | 41,98 | 53,27 |
| ACOS | **56,39** | 19,48 | 33,14 |

Retrieval & Classification (puntuación bruta de tarea ×100):

| Benchmark | Este modelo | JEV-27B | Jev 1.14 |
|---|---:|---:|---:|
| CLINC150+OOS | **97,08** | 84,62 | 90,28 |
| BANKING77 | **93,71** | 74,20 | 79,94 |
| HoVer (verificación de afirmaciones) | **89,12** | 73,90 | 76,75 |
| PhishNChips | 72,00 | 61,90 | **83,75** |
| BRIGHT | **49,19** | 48,44 | 47,05 |
| Amazon ESCI | 52,11 | 54,56 | **57,18** |

Tools & Automation (puntuación bruta de tarea ×100):

| Benchmark | Este modelo | JEV-27B | Jev 1.14 |
|---|---:|---:|---:|
| BFCL | **97,23** | 95,99 | 96,40 |
| Simulador de electrodomésticos | **89,77** | 52,27 | 45,45 |
| API-Bank | **87,60** | 82,87 | 86,61 |
| When2Call MCQ | **89,54** | 78,53 | 81,65 |
| ToolRet | **68,71** | 65,73 | 65,05 |

Arts & Human Taste (puntuación bruta de tarea ×100):

| Benchmark | Este modelo | JEV-27B | Jev 1.14 |
|---|---:|---:|---:|
| BPoMP | **96,52** | 92,94 | 90,41 |
| Emparejamiento de titulares de The New Yorker | **82,95** | 68,56 | 72,54 |
| POP909-CL | **61,98** | 39,45 | 15,96 |
| cfcolor | 64,84 | 64,14 | **65,04** |
| Humicroedit | **63,20** | 61,15 | 61,76 |
| Habermas Machine | 42,78 | 40,39 | **44,57** |

Notas de lectura: las columnas de JEV-27B y Jev 1.14 (`jev-1.14.0`) son resultados publicados por los respectivos laboratorios, no ejecuciones nuevas del autor de esta ficha. Las cifras del apartado de highlights de la model card (por ejemplo, CLINC150+OOS 97,06, BFCL 96,25, HoVer 78,24, NLI4CT 75,56) no coinciden con las tablas completas, que el autor describe como puntuaciones brutas de tarea; conviene no mezclar ambas escalas.

## Requisitos de hardware

- Peso de los pesos: 27,36 mil millones de parámetros implican unos 54,7 GB en FP16/BF16, coherente con el tamaño del repositorio (54,7 GB) antes de contabilizar caché KV.
- VRAM estimada para inferencia en FP16/BF16: ≈55 GB solo de pesos más caché KV; en la práctica, 80 GB o más por instancia para contextos amplios.
- VRAM estimada en INT8: ≈27-28 GB de pesos, más caché KV.
- VRAM estimada en 4 bits: ≈14-15 GB de pesos; con contexto y overhead de servicio, manejable en GPUs de 24 GB.
- GPUs recomendadas: A100 80 GB o H100 80 GB para FP16/BF16; A100 40 GB o L40S 48 GB para INT8; dos A100 40 GB o dos RTX 4090 con tensor parallelism para FP16.
- GPU de consumo: no cabe en FP16 en ninguna consumer (24 GB o menos); sí cabe cuantizado a 4 bits en RTX 4090/3090 (24 GB) y, de forma ajustada, en tarjetas de 16 GB con contexto reducido.
- Despliegue: vLLM es la librería declarada en el repositorio (`library_name: vllm`), por lo que es la vía soportada. TGI, SGLang o llama.cpp/Ollama solo serían viables si existieran artefactos compatibles, que no están documentados en la información disponible.
- Latencia y throughput: no disponibles. Como referencia de carga de trabajo, la evaluación reportada procesó 140.178 peticiones puntuables, pero sin datos de hardware ni de tiempo empleado.
- Almacenamiento: prever al menos 55 GB de disco para los pesos en precisión completa y espacio adicional para una copia cuantizada.

## Comparativa con modelos similares

Las referencias naturales son los dos modelos contra los que el autor compara en la propia model card. Los datos de parámetros, contexto y licencia de las alternativas no están disponibles en la información proporcionada.

| Característica | AutoTrust-JEV-27B v1.1 | JEV-27B | Jev 1.14 (`jev-1.14.0`) |
|---|---|---|---|
| Parámetros | 27,36 mil millones | No disponible | No disponible |
| Longitud de contexto | No disponible | No disponible | No disponible |
| Licencia | Apache 2.0 | No disponible | No disponible |
| Formato de pesos | Safetensors | No disponible | No disponible |
| Disponibilidad | HuggingFace, 5.615 descargas, 166 likes | Resultados publicados en la suite Decision Index; repositorio no indicado | Resultados publicados en la suite Decision Index; repositorio no indicado |
| Índice público Decision Index | 67,31 | No disponible | No disponible |
| MMLU-Pro | 73,65 | 61,53 | 82,13 |
| GPQA Diamond | 54,59 | 44,90 | 75,51 |
| HLE | 16,57 | 6,99 | 19,36 |
| BFCL | 97,23 | 95,99 | 96,40 |
| CLINC150+OOS | 97,08 | 84,62 | 90,28 |
| BANKING77 | 93,71 | 74,20 | 79,94 |
| HellaSwag | 98,22 | 92,49 | 94,34 |

Lectura de la comparativa: este modelo supera a JEV-27B en prácticamente todas las tareas comparables, y supera a Jev 1.14 en clasificación e intención (CLINC150, BANKING77, HoVer), herramientas, NLI y verificación de alucinación, mientras queda por detrás en razonamiento de conocimiento (MMLU-Pro, GPQA Diamond, CLadder, BBH, HLE) y en phishing. El perfil es, por tanto, el de un modelo especializado en decisión y clasificación, no en razonamiento general.

## Limitaciones y advertencias

- Naturaleza del modelo: no es un generador de texto libre. Solo devuelve probabilidades sobre opciones suministradas; cualquier uso conversacional requiere envolverlo en un pipeline que construya las candidatas.
- Resultados autodeclarados: el índice público de 67,31 procede de una evaluación local del propio autor, pendiente de verificación por el mantenedor, y sin puntuación privada ni Full. Debe tratarse como dato provisional.
- Suelo de rendimiento en tareas duras: SATA-Bench 37,88, ChessBench 21,20, HLE 16,57, BRIGHT 49,19 y ESCI 52,11 indican capacidad limitada en razonamiento profundo, recuperación semántica fina y conocimiento enciclopédico.
- Riesgo de alucinación: aunque obtiene 83,79 en RAGTruth a nivel de respuesta, sigue siendo un modelo estadístico; en decisiones de verificación conviene calibrar umbrales y no tratar la probabilidad como certeza.
- Idiomas: no se declaran idiomas soportados. Todos los benchmarks citados son en inglés, por lo que el rendimiento en castellano u otras lenguas es desconocido.
- Sesgos: sin información sobre datos de entrenamiento ni sobre evaluación de sesgo demográfico o toxicológico, no es posible caracterizar los sesgos del modelo.
- Contexto: se desconoce la ventana máxima, lo que impide garantizar el comportamiento en documentos largos o conversaciones multi-turno extensas.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo se distribuye sin garantías y el autor declina explícitamente cualquier afirmación de fiabilidad en el mundo real o de preparación general para despliegue.
- Comparaciones no homogéneas: GSM8K queda fuera de la comparación directa por usar configuraciones distintas, y las columnas de JEV-27B y Jev 1.14 son resultados publicados por terceros, no replicados por el autor.
- Escalas mezcladas: las puntuaciones de highlights (skill, ajustadas por azar) y las de las tablas completas (brutas) no son intercambiables; usar la escala equivocada distorsiona cualquier comparación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/autotrust/AutoTrust-JEV-27B-v1.1
- Datos del benchmark Decision Index (versión fijada): https://huggingface.co/spaces/multimodalart/jev-decision-index/blob/0ddf6758073eb77ae449a3541f57286d7f39d93f/data/index.json
- Metodología de evaluación (versión fijada): https://huggingface.co/spaces/multimodalart/jev-decision-index/blob/0ddf — enlace truncado en la información disponible; la referencia completa figura en la model card del autor.
- Espacio Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Repositorio de vLLM (librería declarada): https://github.com/vllm-project/vllm
