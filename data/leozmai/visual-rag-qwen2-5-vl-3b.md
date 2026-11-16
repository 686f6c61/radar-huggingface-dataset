# leozmai/visual-rag-qwen2.5-vl-3b

## Resumen

Visual RAG Qwen2.5-VL-3B es un ajuste fino del modelo Qwen2.5-VL-3B-Instruct de Alibaba, desarrollado por el usuario leozmai, orientado a la respuesta de preguntas sobre corpus de imagenes de paginas de documentos. El modelo se comporta como un agente visual: en cada turno lee una pagina, actualiza una memoria textual de dos niveles (un arbol de preguntas y un nodo de evidencia por pagina con hechos anotados con bounding boxes) y ejecuta una accion entre buscar, revisitar, recortar o responder.

El entrenamiento combina un ajuste supervisado sobre 2.400 trayectorias filtradas generadas por un profesor Qwen3.8-27B que sigue el mismo protocolo mediante prompting, seguido de 75 pasos de GSPO (Group Sequence Policy Optimization) sobre 1.200 preguntas. El checkpoint publicado corresponde al paso 75 de esa fase de RL.

Su relevancia radica en que aborda el RAG visual de documentos largos con un modelo de solo 3B de parametros, alcanzando resultados competitivos en benchmarks de document QA multi-pagina (SlideVQA, ViDoSeek, MMLongBench-Doc) frente a variantes de 7B. La licencia Apache 2.0 facilita su adopcion comercial, aunque el modelo requiere un protocolo de agente y un system prompt especificos para funcionar correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL), vision-language |
| Parametros totales | 4.065.787.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, un transformer multimodal con codificador visual y decoder de lenguaje, especializado en image-text-to-text. Sobre esa base se aplica un ajuste supervisado con 2.400 trayectorias filtradas, generadas por un profesor Qwen3.8-27B que sigue el mismo protocolo de agente mediante prompting. Posteriormente se ejecuta GSPO durante 75 pasos sobre 1.200 preguntas; el checkpoint publicado es precisamente el del paso 75.

La innovacion tecnica principal no reside en la arquitectura del modelo base, sino en el protocolo de agente con memoria de dos niveles: un arbol de preguntas que organiza las subconsultas y un nodo de evidencia por pagina en el que los hechos extraidos llevan bounding boxes asociadas. En cada turno el modelo elige una de cuatro acciones (search, revisit, crop o answer), lo que permite un razonamiento multi-paso sobre documentos visuales sin necesidad de un contexto de ventana especialmente largo. Las paginas se procesan a hasta 0,7 megapixeles.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre imagenes de paginas de documentos.
- Respuesta a preguntas (document QA) sobre corpus de imagenes de paginas, incluyendo documentos multi-pagina.
- Razonamiento agente multi-paso con planificacion mediante arbol de preguntas.
- Memoria textual de dos niveles con hechos anotados con bounding boxes.
- Acciones de agente: busqueda (search), revision (revisit), recorte de region (crop) y respuesta (answer).
- Localizacion espacial de evidencia mediante bounding boxes.
- Capacidad de operar sobre paginas renderizadas a hasta 0,7 megapixeles.
- Soporte de conversacion multi-turno dentro del protocolo de agente definido.
- No se documentan capacidades de tool calling generico, audio ni thinking mode explicito mas alla del propio bucle de agente.

## Casos de uso

- Atencion al cliente sobre documentacion corporativa: el modelo puede responder preguntas sobre manuales, contratos o politicas escaneadas en PDF, navegando entre paginas mediante las acciones de busqueda y revision y citando la evidencia localizada con bounding boxes.
- Analisis de informes financieros multi-pagina: dado un conjunto de paginas de estados financieros, el agente construye un arbol de preguntas para localizar cifras concretas, recorta las regiones relevantes y responde con la evidencia visual correspondiente.
- Revision de documentacion tecnica y especificaciones: util para consultar fichas tecnicas, planos o diagramas donde la respuesta exige localizar un dato en una pagina concreta y verificar su contexto mediante recortes.
- Procesamiento de actas y transcripciones escaneadas: el modelo puede extraer hechos y responder preguntas de seguimiento sobre documentos extensos, manteniendo la trazabilidad de la pagina y la region de origen.
- Asistencia en investigacion documental: busqueda y sintesis de respuestas sobre corpus de articulos o papers en formato imagen, con capacidad de revisitar paginas ya leidas y refinar la evidencia acumulada.
- Automatizacion de QA sobre expedientes y formularios: integrable en pipelines donde cada consulta requiere localizar campos en formularios escaneados, recortar la region y devolver la respuesta junto con la referencia espacial.
- Evaluacion y prototipado de agentes visuales: al ser un checkpoint de 3B con licencia Apache 2.0, sirve como base para experimentar con protocolos de memoria y acciones sobre documentos sin requerir hardware de gran escala.

## Benchmarks y rendimiento

Resultados publicados en la model card (paginas a hasta 0,7 megapixeles; respuestas evaluadas por DeepSeek-v4-flash):

| Modelo | SlideVQA | ViDoSeek | MMLongBench-Doc |
|---|---|---|---|
| Qwen2.5-VL-7B (SFT + RL) | 79,37 | 74,96 | 34,24 |
| Qwen2.5-VL-3B (SFT + RL) | 74,72 | 71,19 | 29,75 |

No se han publicado en la informacion disponible resultados adicionales (MMLU, HumanEval, GSM8K u otros) ni la asignacion exacta de estas cifras al checkpoint publicado frente a las variantes de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 8-9 GB solo para pesos, mas overhead de activaciones y del codificador visual; en la practica se recomienda reservar 12-16 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, en torno a 3-4 GB, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con concurrencia; RTX 4090 o RTX 3090 para inferencia individual en BF16.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en BF16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090), y en tarjetas de 8 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible); llama.cpp, Ollama o vLLM no estan documentados para este checkpoint, aunque el modelo base admite ecosistemas similares.
- Latencia y throughput: no disponibles. El coste por consulta es superior al de una inferencia simple porque el agente ejecuta multiples turnos (lectura de pagina, actualizacion de memoria y accion) por pregunta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SlideVQA | ViDoSeek | MMLongBench-Doc | Licencia |
|---|---|---|---|---|---|---|
| visual-rag-qwen2.5-vl-3b (este) | 4,07 B | no disponible | 74,72 | 71,19 | 29,75 | Apache 2.0 |
| Qwen2.5-VL-7B (SFT + RL) | no disponible | no disponible | 79,37 | 74,96 | 34,24 | Apache 2.0 (modelo base) |
| Qwen2.5-VL-3B-Instruct (base) | no disponible | no disponible | no disponible | no disponible | no disponible | Apache 2.0 |

La comparativa se limita a los datos publicados en la model card. Frente a la variante de 7B con el mismo pipeline de SFT + RL, este modelo de 3B queda entre 3 y 5 puntos por debajo en los tres benchmarks, con un coste de inferencia sustancialmente menor. No se dispone de cifras del modelo base sin ajuste para medir la ganancia atribuible al entrenamiento de agente.

## Limitaciones y advertencias

- El modelo espera un protocolo de agente y un system prompt especificos; fuera de ese formato su comportamiento puede degradarse y no debe usarse como modelo de proposito general.
- Riesgo de alucinacion en la extraccion de hechos: aunque asocia bounding boxes a la evidencia, no se garantiza que cada hecho citado corresponda fielmente al contenido de la pagina.
- Limitacion de resolucion: las paginas se procesan a hasta 0,7 megapixeles, lo que puede perder detalle en documentos con tipografia pequena o diagramas densos.
- No se documentan los idiomas soportados; el rendimiento fuera del ingles (incluido el castellano) no esta verificado.
- La longitud de contexto no esta disponible, lo que dificulta planificar el numero de paginas por sesion.
- El checkpoint corresponde al paso 75 de GSPO; no se publican curvas de entrenamiento ni evaluaciones de robustez fuera de los tres benchmarks indicados.
- Las respuestas de los benchmarks fueron juzgadas por un modelo (DeepSeek-v4-flash), lo que introduce dependencia del juez y posible variabilidad en la evaluacion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar el repositorio de codigo para conocer las dependencias del pipeline.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/leozmai/visual-rag-qwen2.5-vl-3b
- Codigo y prompts: https://github.com/ZLF329/visual_rag (directorio `visual_rag_agent_new/`)
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
