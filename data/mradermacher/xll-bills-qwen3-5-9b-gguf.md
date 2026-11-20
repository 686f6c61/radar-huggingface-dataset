# mradermacher/xll-bills-qwen3.5-9b-GGUF

## Resumen

`mradermacher/xll-bills-qwen3.5-9b-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo `thurstonpowers/xll-bills-qwen3.5-9b`, un fine-tune completo de Qwen 3.5 de 9B orientado a la extraccion de estructura en textos legales (proyectos de ley y legislacion). El repositorio lo publica mradermacher, un conocido cuantizador de la comunidad que distribuye versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base conserva la arquitectura del Qwen 3.5 original (transformer denso de aproximadamente 8.950 millones de parametros) y ha sido ajustado sobre el dataset `thurstonpowers/xll-bills-structure-indexed`.

La relevancia de esta ficha es practica: el modelo original solo esta disponible en formato transformers (safetensors), mientras que esta version GGUF permite ejecutarlo en CPU, GPU de consumo y entornos con poca VRAM, desde 3,9 GB (Q2_K) hasta 18 GB (f16). Esta pensado para tareas de procesamiento de documentos legislativos: identificar secciones, articulos, enmiendas y jerarquias estructurales dentro de textos legales en ingles.

El modelo es monolingue en ingles, con licencia Apache 2.0, y su proposito es muy especifico (structure extraction sobre bills). No es un modelo generalista: su valor esta en la precision sobre un dominio acotado y en la posibilidad de desplegarlo localmente con cuantizaciones de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen 3.5 9B) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 81,4 GB (incluye todas las cuantizaciones) |
| Modelo base | thurstonpowers/xll-bills-qwen3.5-9b |
| Dataset de ajuste | thurstonpowers/xll-bills-structure-indexed |
| Tipo de ajuste | full fine-tune |
| Libreria | transformers (modelo base); GGUF para llama.cpp |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (no LoRA) de Qwen 3.5 de 9B, un transformer denso de aproximadamente 8,95 mil millones de parametros. No se dispone de informacion detallada sobre la composicion exacta de la arquitectura interna (numero de capas, dimensiones de atencion, tipo de atencion) en la informacion proporcionada; se hereda del Qwen 3.5 base. Tampoco se especifica el numero de tokens de entrenamiento ni si se emplearon tecnicas de RLHF o DPO.

El ajuste se realizo sobre el dataset `thurstonpowers/xll-bills-structure-indexed`, orientado a la extraccion de estructura de proyectos de ley. El prefijo "xll" y la etiqueta `structure-extraction` sugieren un entrenamiento supervisado para producir representaciones estructuradas (posiblemente JSON o similar) de la jerarquia de documentos legislativos. No hay informacion publica sobre la innovacion tecnica del entrenamiento, la composicion del dataset ni el proceso de anotacion.

Las cuantizaciones de mradermacher son estaticas (no hay versiones weighted/imatrix disponibles segun la model card). Se generaron con `convert_type: hf` y `output_tensor_quantised: 1`, lo que indica conversion desde pesos Hugging Face y cuantizacion de tensores de salida.

## Capacidades

- Extraccion de estructura de documentos legislativos (bills): identificacion de secciones, articulos, enmiendas y jerarquias.
- Generacion de texto y razonamiento sobre contenido legal en ingles.
- Conversacional: el tag `conversational` indica soporte de interaccion multi-turno.
- Procesamiento de documentos largos (la longitud de contexto no esta confirmada, pero se hereda del Qwen 3.5 base).
- Especializacion en dominio legal: probablemente mejor que el modelo base en tareas de parsing estructural de legislacion.
- No se ha confirmado soporte de tool calling, function calling ni capacidades de agente en la informacion disponible.
- No se ha confirmado soporte de vision, audio ni modo thinking.
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Extraccion de estructura de proyectos de ley: dado un texto legislativo en ingles, el modelo puede identificar y segmentar secciones, articulos y enmiendas en una representacion estructurada, adecuado por su fine-tune especifico sobre `xll-bills-structure-indexed`.
- Indexacion de corpus legislativos: procesar grandes volumenes de bills para generar indices estructurados que alimenten motores de busqueda o sistemas de recuperacion documental.
- Preprocesamiento para pipelines de compliance: convertir textos legales no estructurados en datos estructurados que puedan validarse automaticamente en flujos de cumplimiento normativo.
- Analisis de enmiendas y diferencias entre versiones de un proyecto de ley: el modelo puede extraer la estructura de dos versiones y facilitar la comparacion posterior.
- Despliegue local en entornos con recursos limitados: las cuantizaciones Q4_K_S (5,5 GB) y Q4_K_M (5,7 GB) permiten ejecutar el modelo en GPUs de consumo o incluso en CPU, util para despachos legales o investigadores sin infraestructura cloud.
- Prototipado rapido de herramientas de analisis legislativo: gracias al formato GGUF y a la compatibilidad con llama.cpp/Ollama, se puede integrar en scripts y demos sin necesidad de GPUs de datacenter.
- Investigacion academica en procesamiento de lenguaje legal: modelo abierto con licencia Apache 2.0 que permite experimentacion y comparacion con otros enfoques de extraccion de estructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,9 GB
  - Q3_K_S: ~4,4 GB
  - Q3_K_M: ~4,7 GB
  - Q3_K_L: ~5,0 GB
  - IQ4_XS: ~5,3 GB
  - Q4_K_S: ~5,5 GB
  - Q4_K_M: ~5,7 GB
  - Q5_K_S: ~6,4 GB
  - Q5_K_M: ~6,6 GB
  - Q6_K: ~7,5 GB
  - Q8_0: ~9,6 GB
  - f16: ~18,0 GB
- GPU recomendadas: para Q4_K_M y superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite ejecutar comodamente incluso Q8_0. Para f16 se recomienda A100 40 GB o H100.
- Cabe en GPU de consumo: si. Las cuantizaciones Q4_K_S y Q4_K_M (5,5-5,7 GB) caben en GPUs de 8 GB (RTX 3060 Ti, RTX 4060) y en 6 GB con margen ajustado. Q2_K y Q3 caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base (safetensors) se puede servir con vLLM o TGI, pero esta ficha cubre las cuantizaciones GGUF.
- Latencia y throughput: no disponible. Dependera del hardware y de la cuantizacion; las etiquetas de la model card indican que Q4_K_S y Q4_K_M son "fast, recommended" y Q8_0 es "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| xll-bills-qwen3.5-9b (este) | 8,95 B | no disponible | Extraccion de estructura legal (bills) | Apache 2.0 | GGUF, safetensors |
| Qwen 3.5 9B (base) | ~9 B | no disponible | Generalista | Apache 2.0 | safetensors, GGUF (via terceros) |
| Modelos legales genericos (p. ej. fine-tunes de Llama/Mistral) | variable | variable | Legal general | variable | variable |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a parametros, licencia y especializacion.

## Limitaciones y advertencias

- Modelo monolingue en ingles: no soporta castellano ni otros idiomas de forma fiable.
- Dominio muy especifico: el fine-tune esta orientado a extraccion de estructura de bills; su rendimiento en otras tareas legales o generales puede degradarse respecto al Qwen 3.5 base.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar secciones, articulos o referencias inexistentes en el texto legal. En produccion se recomienda validacion contra el documento original.
- No hay informacion sobre sesgos conocidos ni sobre el proceso de anotacion del dataset de entrenamiento.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar la precision en una tarea sensible a la estructura; se recomienda Q4_K_M o superior para produccion.
- No hay cuantizaciones weighted/imatrix disponibles segun la model card.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la exactitud legal del modelo; no debe usarse como sustituto de asesoramiento juridico.
- La longitud de contexto no esta confirmada en la informacion disponible; verificar antes de procesar documentos largos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/xll-bills-qwen3.5-9b-GGUF
- Modelo base: https://huggingface.co/thurstonpowers/xll-bills-qwen3.5-9b
- Dataset de entrenamiento: https://huggingface.co/datasets/thurstonpowers/xll-bills-structure-indexed
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#xll-bills-qwen3.5-9b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
