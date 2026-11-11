# Kamyar-zeinalipour/RoundTripKG-Llama-3.2-1B-Instruct-LoRA

## Resumen

RoundTripKG-Llama-3.2-1B-Instruct-LoRA es un adaptador LoRA (PEFT) sobre el modelo meta-llama/Llama-3.2-1B-Instruct, desarrollado por Kamyar Zeinalipour y colaboradores (Universidad de Siena, segun la autoria del paper) y publicado en el Industry Track de ACL 2026. El adaptador especializa un modelo de 1.240 millones de parametros en la extraccion de tripletas de grafos de conocimiento (sujeto, predicado, objeto) a partir de texto en lenguaje natural, una tarea central en la construccion automatizada de knowledge graphs industriales.

La innovacion metodologica del trabajo es el pipeline "round-trip": el modelo verbaliza tripletas de un KG en texto y despues reconstruye el grafo a partir de esa verbalizacion, conservando unicamente los textos de los que el grafo original puede recuperarse de forma exacta. El adaptador se entrena sobre ese corpus autogenerado y filtrado por fidelidad, lo que mejora la precision de extraccion del propio modelo sin necesidad de anotacion humana adicional.

El modelo es relevante para equipos que necesitan extraccion de informacion estructurada con requisitos de despliegue modestos: al tratarse de un adaptador sobre una base de 1B, el peso del adaptador es pequeno (repo de 1,1 GB) y puede ejecutarse en hardware de consumo, lo que lo hace atractivo para pipelines de ingestion documental a gran escala donde el coste por token importa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA (PEFT) |
| Parametros totales | 1.240 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.2 1B soporta 128k tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; al ser compatible con el modelo base, admite las cuantizaciones soportadas por llama.cpp/GGUF y bitsandbytes para la base, aunque el adaptador se distribuye en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador LoRA PEFT); requiere fusion con el modelo base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.2-1B-Instruct, un transformer decoder-only denso de 1.240 millones de parametros con atencion causal estandar (no se ha modificado la arquitectura base). La configuracion LoRA es r = 16, alpha = 32 y dropout 0,1, aplicada a todas las proyecciones de atencion y MLP, ademas de `embed_tokens` y `lm_head` (es decir, se adaptan tambien las capas de embedding y la cabeza de salida, algo poco habitual y relevante para tareas de generacion estructurada). El entrenamiento duro 3 epocas con AdamW, learning rate 1e-4 con decaimiento coseno, precision bf16 y DeepSpeed sobre 4 x RTX A6000.

Los datos de entrenamiento proceden del dataset Kamyar-zeinalipour/llama1b_kg, generado por el propio modelo mediante el pipeline round-trip: se verbalizan tripletas de KG a texto, se reconstruye el grafo desde el texto y solo se conservan las verbalizaciones con reconstruccion exacta. No se documenta en la informacion disponible el numero total de tokens de entrenamiento, la composicion del corpus ni si hubo fases de RLHF o DPO. La innovacion tecnica destacable es precisamente ese filtrado por fidelidad semantica en el bucle de datos, que actua como mecanismo de auto-mejora sin supervision humana.

## Capacidades

- Extraccion de tripletas de grafo de conocimiento (sujeto, predicado, objeto) a partir de texto en ingles.
- Generacion de texto y seguimiento de instrucciones heredados del modelo base Llama-3.2-1B-Instruct.
- Verbalizacion de grafos de conocimiento a texto natural (direccion grafo-a-texto del pipeline round-trip).
- Reconstruccion de grafos desde texto (direccion texto-a-grafo), usada tanto en entrenamiento como en evaluacion.
- Procesamiento de informacion estructurada y salida en formato de tripletas, adecuada para pipelines de extraccion de informacion.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Construccion automatizada de knowledge graphs industriales: el modelo extrae tripletas de documentacion tecnica, manuales y registros de mantenimiento para poblar un grafo corporativo; su entrenamiento especifico en fidelidad semantica reduce la perdida de informacion en la conversion texto-grafo.
- Enriquecimiento de bases de datos de producto: a partir de descripciones textuales de catalogo se generan tripletas (producto, atributo, valor) que se cargan directamente en un grafo o en un almacen de tripletas RDF.
- Pipeline de ingestion documental a escala: al ser un adaptador sobre una base de 1B, el coste por documento es bajo y permite procesar grandes volumenes en GPU de consumo o en lotes sobre A100, con cuantizacion de la base para reducir VRAM.
- Generacion de texto a partir de grafos existentes: la direccion grafo-a-texto permite producir descripciones legibles de subgrafos para informes, resumenes o interfaces de usuario sobre datos estructurados.
- Validacion y control de calidad de KGs: el bucle round-trip puede usarse para detectar tripletas mal formadas o verbalizaciones infieles, comparando el grafo original con el reconstruido.
- Extraccion de relaciones en dominios regulados (farmaceutico, energetico, legal): la licencia Llama 3.2 permite uso comercial y el modelo pequeno facilita el despliegue on-premise sin enviar datos sensibles a terceros.
- Prototipado rapido de sistemas de IE: investigadores pueden partir de este adaptador como linea base especializada en extraccion de tripletas frente a un Llama-3.2-1B-Instruct generico, con scripts de inferencia y evaluacion ya publicados.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test del corpus round-trip (escala humana de 1 a 5 valorada por expertos):

| Metrica | Base | Fine-tuned | Delta |
|---|---:|---:|---:|
| BERTScore F1 | 0,329 | 0,399 | +0,070 |
| ROUGE-L F1 | 0,347 | 0,300 | -0,047 |
| BLEU-4 | 0,072 | 0,086 | +0,013 |
| Valoracion humana (1-5) | 1,94 | 2,70 | +0,76 |

No se han publicado en la informacion disponible resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) ni comparaciones con otros extractores de tripletas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bf16 ocupa aproximadamente 2,5 GB; fusionado con el adaptador, la huella es la misma. En cuantizacion de 8 bits, en torno a 1,3 GB; en 4 bits, en torno a 0,8 GB (estimaciones para la base, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son validas. El entrenamiento documentado uso 4 x RTX A6000.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM en bf16 y en practicamente cualquier GPU moderna con cuantizacion de 4 bits.
- Opciones de despliegue: transformers + peft (con `merge_and_unload()`), vLLM y TGI tras fusionar el adaptador, llama.cpp/Ollama requieren conversion del modelo fusionado a GGUF. Los scripts de inferencia estan en el repositorio de GitHub del proyecto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoundTripKG-Llama-3.2-1B-Instruct-LoRA | 1,24B (base) + LoRA | No disponible (base: 128k) | Extraccion de tripletas KG | llama3.2 | Hugging Face (adaptador PEFT) |
| RoundTripKG-Llama-3.2-3B-Instruct-LoRA | 3,2B (base) + LoRA | No disponible (base: 128k) | Extraccion de tripletas KG | llama3.2 | Hugging Face; valoracion humana 2,30 -> 4,02 |
| RoundTripKG-Llama-2-7b-chat-hf-LoRA | 7B (base) + LoRA | No disponible | Extraccion de tripletas KG | llama2 | Hugging Face; valoracion humana 2,70 -> 3,32 |
| Llama-3.2-1B-Instruct (base) | 1,24B | 128k | Generacion de texto general | llama3.2 | Hugging Face; valoracion humana 1,94 en la tarea |

Los tres adaptadores de la misma familia permiten escalar en tamano segun el presupuesto de hardware; el de 3B obtiene la mejor valoracion humana del paper (4,02) a costa de triplicar los parametros.

## Limitaciones y advertencias

- El modelo esta entrenado y evaluado unicamente en ingles; su rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- Es un adaptador especializado: fuera de la tarea de extraccion/verbalizacion de tripletas su comportamiento degenera respecto al modelo base, y no debe usarse como asistente general.
- La mejora en ROUGE-L es negativa (-0,047) pese a mejorar BERTScore y la valoracion humana, lo que indica que la fidelidad semantica y la coincidencia lexica con la referencia no van en la misma direccion; conviene evaluar con metricas semanticas y revision humana.
- La valoracion humana absoluta sigue siendo baja (2,70 sobre 5), por lo que en produccion se recomienda validacion posterior de las tripletas extraidas.
- Riesgo de alucinacion inherente a un modelo de 1B: puede generar predicados o entidades no presentes en el texto fuente; el filtrado round-trip mitiga pero no elimina este riesgo.
- La licencia llama3.2 impone restricciones de uso comercial y obligaciones de atribucion; debe revisarse la Llama 3.2 Community License antes de desplegar en producto.
- El adaptador requiere fusion con el modelo base y aceptacion de la licencia de Meta; no es un modelo autonomo.
- No se documentan sesgos especificos ni evaluaciones de robustez; el corpus de entrenamiento es autogenerado, lo que puede amplificar los sesgos del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Kamyar-zeinalipour/RoundTripKG-Llama-3.2-1B-Instruct-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Kamyar-zeinalipour/llama1b_kg
- Paper (ACL 2026, Industry Track): https://aclanthology.org/2026.acl-industry.140/
- DOI: https://doi.org/10.18653/v1/2026.acl-industry.140
- Repositorio de codigo: https://github.com/KamyarZeinalipour/round-trip-kg
- Coleccion "From Graph to Text and Back": https://huggingface.co/collections/Kamyar-zeinalipour/from-graph-to-text-and-back-acl-2026-6af4841166cf330a92294b6c
- Adaptador hermano 3B: https://huggingface.co/Kamyar-zeinalipour/RoundTripKG-Llama-3.2-3B-Instruct-LoRA
- Adaptador hermano 7B: https://huggingface.co/Kamyar-zeinalipour/RoundTripKG-Llama-2-7b-chat-hf-LoRA
- Dataset 3B: https://huggingface.co/datasets/Kamyar-zeinalipour/llama3b_kg
- Dataset 7B: https://huggingface.co/datasets/Kamyar-zeinalipour/llama2_kg
