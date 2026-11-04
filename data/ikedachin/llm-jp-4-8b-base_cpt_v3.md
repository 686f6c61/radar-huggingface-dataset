# ikedachin/llm-jp-4-8b-base_cpt_v3

## Resumen

`ikedachin/llm-jp-4-8b-base_cpt_v3` es un modelo de lenguaje de 8.590.200.832 parametros (aproximadamente 8,6 mil millones) obtenido mediante preentrenamiento continuado (continued pre-training, CPT) sobre el modelo base japones `llm-jp/llm-jp-4-8b-base`, desarrollado por el consorcio LLM-jp. El autor del ajuste es el usuario de HuggingFace `ikedachin`, que ha especializado el modelo con un corpus japones derivado de articulos de Wikipedia, con enfasis en contenido relacionado con la ciudad de Imabari (Ehime, Japon).

El modelo mantiene la arquitectura transformer decoder-only tipo Llama del modelo base y esta orientado exclusivamente al idioma japones (`ja`). No se trata de un modelo de instrucciones ni de un asistente conversacional afinado con RLHF: la model card lo describe como un modelo de lenguaje preentrenado, por lo que su uso natural es la generacion de texto por continuacion de prompt, no el seguimiento de instrucciones.

Su relevancia es acotada y muy especifica: sirve como ejemplo de especializacion de bajo coste de un modelo japones open source mediante CPT sobre un dataset tematico, y como base para tareas de generacion de texto en dominio japones con conocimiento reforzado de contenido enciclopedico local. No es un modelo competitivo en benchmarks generales ni un candidato para despliegues de produccion a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama), segun tag `llama` y modelo base `llm-jp-4-8b-base` |
| Parametros totales | 8.590.200.832 (8,59 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; admite cuantizacion posterior via herramientas externas, no documentada por el autor) |
| Idiomas soportados | Japones (`ja`) |
| Licencia | CC BY-SA 4.0 (heredada por el dataset; el modelo base es Apache 2.0) |
| Formato de pesos | safetensors (`transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `llm-jp/llm-jp-4-8b-base`, un transformer decoder-only de la familia Llama con 8,59 mil millones de parametros. Sobre esa base se aplica un preentrenamiento continuado (CPT) de una sola epoca con el dataset `ikedachin/imabari_wiki_cpt_v3`, un corpus japones construido a partir de articulos de Wikipedia y textos relacionados, con foco en Imabari. Los hiperparametros declarados son: learning rate 5e-5, batch size 16, 1 epoca, optimizador AdamW, framework PyTorch + Transformers + TRL, y hardware ThinkStation PGX (GB10).

No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de SFT, RLHF o DPO. Tampoco se describen innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). Se trata, por tanto, de un CPT convencional de bajo presupuesto sobre un unico corpus tematico, sin cambios arquitectonicos respecto al modelo base.

## Capacidades

- Generacion de texto en japones por continuacion de prompt (modelo base, no instruct).
- Conocimiento reforzado de contenido enciclopedico japones, en particular articulos relacionados con Imabari y su entorno.
- Razonamiento y codigo: capacidades heredadas del modelo base `llm-jp-4-8b-base`, no evaluadas ni documentadas para esta variante CPT.
- Tool calling / function calling: no documentado; al ser un modelo base sin SFT de instrucciones, no se espera soporte fiable.
- Agentes y razonamiento multi-paso: no soportado de forma nativa ni documentado.
- Capacidades multilingues: limitadas al japones segun la model card; no se declara soporte de otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Generacion de texto enciclopedico en japones: continuacion de articulos o fichas sobre Imabari y su comarca, aprovechando el corpus de CPT para obtener vocabulario y entidades locales con mayor cobertura que el modelo base.
- Aumento de datos sinteticos en japones: generacion de parrafos de dominio para enriquecer datasets de entrenamiento de otros modelos o para tareas de aumento de datos en NLP japones.
- Prototipado de investigacion en CPT: servir como referencia reproducible de un pipeline de continued pre-training sobre un modelo japones de 8 B, con hiperparametros y hardware documentados.
- Experimentos de evaluacion de deriva (forgetting): comparar el rendimiento del modelo base frente a esta variante para medir el impacto del CPT tematico en tareas generales en japones.
- Generacion de borradores de contenido local: textos descriptivos sobre historia, geografia o cultura de Imabari para uso editorial interno, con revision humana obligatoria.
- Base para un futuro SFT instruct en japones: punto de partida para afinar un asistente conversacional de dominio, dado que el modelo ya incorpora vocabulario y entidades especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones en japones (JGLUE, JCommonsenseQA, etc.), ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 17 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 24 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB; en 4 bits: aproximadamente 5-6 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para bf16 sin cuantizar; RTX 4090 (24 GB) suficiente para bf16 con margen ajustado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bf16; en GPUs de 8-12 GB requiere cuantizacion (no documentada por el autor).
- Opciones de despliegue: `transformers` con `device_map="auto"` (metodo documentado); vLLM, TGI, llama.cpp u Ollama no estan verificados para esta variante concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `ikedachin/llm-jp-4-8b-base_cpt_v3` | 8,59 B | No disponible | ja | CC BY-SA 4.0 | CPT tematico sobre Wikipedia de Imabari |
| `llm-jp/llm-jp-4-8b-base` | 8,59 B | No disponible | ja (principalmente) | Apache 2.0 | Modelo base original, sin especializacion tematica |
| `llm-jp/llm-jp-3-7b` (familia LLM-jp) | ~7 B | No disponible | ja | Apache 2.0 | Generacion anterior de la familia; datos no verificados en esta ficha |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no sigue ordenes de forma fiable; responde mejor a continuaciones de texto que a preguntas directas.
- Riesgo elevado de alucinacion, especialmente fuera del dominio enciclopedico de Imabari, al no haberse aplicado RLHF ni verificacion factual.
- Sesgos potenciales heredados del modelo base y del corpus de Wikipedia, incluyendo sesgos de cobertura geografica y editorial.
- Limitacion idiomatica: uso previsto en japones; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Longitud de contexto no declarada; no debe asumirse una ventana larga sin verificacion empirica.
- Licencia CC BY-SA 4.0 con clausula share-alike: cualquier modelo derivado o redistribucion debe mantener la misma licencia y atribuir al modelo base y al dataset. Revisar compatibilidad antes de uso comercial.
- El modelo base es Apache 2.0, pero la licencia final es mas restrictiva por la herencia del dataset; conviene auditar la procedencia exacta de los textos de Wikipedia incluidos.
- Sin descargas ni validacion comunitaria (0 descargas, 0 likes en el momento de la consulta): no hay evidencia externa de calidad o estabilidad en produccion.
- Hardware de entrenamiento modesto (ThinkStation PGX GB10) y una sola epoca: el impacto real del CPT puede ser limitado; no hay evaluacion que lo cuantifique.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikedachin/llm-jp-4-8b-base_cpt_v3
- Dataset de CPT: https://huggingface.co/datasets/ikedachin/imabari_wiki_cpt_v3
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4-8b-base
- Organizacion LLM-jp en HuggingFace: https://huggingface.co/llm-jp
