# mradermacher/Saathi-Axiom-32B-Apex-GGUF

## Resumen

Saathi-Axiom-32B-Apex es un modelo de lenguaje de 32.763.876.352 parametros (aproximadamente 32,8 mil millones) desarrollado por Saathimed y distribuido en formato GGUF por mradermacher. Se trata de una cuantizacion estatica del modelo original Saathimed/Saathi-Axiom-32B-Apex, pensada para facilitar su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles con GGUF. El repositorio incluye once variantes de cuantizacion que van desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB).

La informacion publica disponible sobre este modelo es muy limitada. La model card del repositorio GGUF no incluye detalles sobre arquitectura interna, datos de entrenamiento, longitud de contexto, licencia ni resultados de benchmarks. El autor original (Saathimed) no ha publicado, segun la informacion disponible, una model card detallada accesible en este repositorio. El modelo esta etiquetado como conversacional y en ingles, y es compatible con endpoints de inferencia estandar.

Su relevancia actual radica en que ofrece una alternativa de 32B en formato GGUF lista para usar con llama.cpp, Ollama o servidores compatibles, con un rango de cuantizaciones que permite ajustar el equilibrio entre calidad y requisitos de memoria. No obstante, la ausencia de documentacion tecnica y de benchmarks publicos limita seriamente su evaluacion rigurosa antes de adoptarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, segun formato de pesos) |
| Parametros totales | 32.763.876.352 (~32,8B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles, segun metadatos) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo base Saathimed/Saathi-Axiom-32B-Apex. Por el numero de parametros y el formato de pesos (safetensors en el original, GGUF en esta cuantizacion) se trata de un transformer decoder-only, pero no se confirma en la documentacion disponible si emplea atencion estandar, atencion lineal, mezcla de expertos (MoE) u otra variante. Tampoco se especifica la longitud de contexto nativa ni el vocabulario.

Respecto al entrenamiento, no hay datos disponibles sobre el numero de tokens, la composicion del dataset, la posible aplicacion de RLHF, DPO u otras tecnicas de alineacion. La model card del repositorio GGUF es una plantilla generica de mradermacher que solo documenta el proceso de cuantizacion estatica (sin imatrix ni quants ponderados, segun indica el propio autor) y no aporta informacion sobre el modelo original. Cualquier afirmacion sobre innovaciones tecnicas (decodificacion especulativa, attention linear, etc.) seria especulativa y no se incluye.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y orientado a dialogos multi-turno.
- Idioma: los metadatos indican soporte de ingles ("en"); no se confirma soporte multilingue adicional.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que puede servirse mediante la infraestructura de inferencia de Hugging Face.
- Despliegue en llama.cpp y derivados: al estar en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores basados en llama.cpp.
- Capacidades avanzadas (tool calling, function calling, agentes, vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantizacion Q4_K_M (20,0 GB) el modelo puede ejecutarse en una GPU de 24 GB o en configuraciones CPU+GPU, permitiendo iterar sobre prompts y flujos conversacionales sin depender de APIs externas.
- Despliegue en estaciones de trabajo con una sola GPU: la variante Q4_K_S (18,9 GB) o IQ4_XS (18,0 GB) encaja en GPUs consumer de gama alta (RTX 3090/4090 con 24 GB), lo que facilita pruebas de concepto en hardware asequible.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes, lo que permite medir el impacto de la cuantizacion en la calidad de las respuestas para un caso de uso concreto antes de fijar una version en produccion.
- Generacion de texto en ingles para tareas generales: si el modelo rinde segun lo esperable en un 32B, podria usarse para redaccion, resumen y reescritura en ingles, aunque sin benchmarks publicos no puede confirmarse.
- Integracion en pipelines con llama.cpp: al ser GGUF, puede incorporarse a servicios propios basados en llama.cpp server para tareas de generacion de texto por lotes.
- Experimentacion academica con modelos de 32B: util como linea base en estudios sobre cuantizacion y degradacion de calidad en modelos de este tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~12,4 GB
  - Q3_K_S: ~14,5 GB
  - Q3_K_M: ~16,0 GB
  - Q3_K_L: ~17,3 GB
  - IQ4_XS: ~18,0 GB
  - Q4_K_S: ~18,9 GB
  - Q4_K_M: ~20,0 GB
  - Q5_K_S: ~22,7 GB
  - Q5_K_M: ~23,4 GB
  - Q6_K: ~27,0 GB
  - Q8_0: ~34,9 GB
- GPU recomendadas:
  - Q4_K_M y superiores en calidad: A100 40/80 GB, H100, RTX A6000 (48 GB) para Q6_K y Q8_0.
  - Consumer: RTX 3090/4090 (24 GB) admite hasta Q5_K_M con margen limitado para contexto; Q4_K_M es la opcion mas equilibrada.
  - Q2_K y Q3_K_S pueden caber en GPUs de 16 GB, con degradacion de calidad esperable.
- Cabe en consumer GPU: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con Q2/Q3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. No se indica soporte nativo en vLLM o TGI para este repositorio (aunque el modelo base en safetensors podria servirse con transformers).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a parametros y formato. Se comparan alternativas de tamano similar con cuantizaciones GGUF ampliamente documentadas.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks publicos |
|---|---|---|---|---|---|
| Saathi-Axiom-32B-Apex (este) | ~32,8B | no disponible | no disponible | GGUF | no disponibles |
| Qwen2.5-32B-Instruct | 32,5B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | si (MMLU, HumanEval, GSM8K) |
| Gemma-2-27B-it | 27B | 8.192 tokens | Gemma Terms | safetensors, GGUF | si |
| Yi-1.5-34B-Chat | 34B | 4.096 tokens | Apache 2.0 (con condiciones) | safetensors, GGUF | si |

La comparativa se ofrece solo como referencia de categoria; no implica equivalencia de calidad, ya que no hay benchmarks publicos del modelo evaluado.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se publican arquitectura, contexto, datos de entrenamiento ni proceso de alineacion, lo que impide evaluar sesgos, robustez o calidad de forma rigurosa.
- Sin benchmarks publicos: no es posible verificar el rendimiento frente a alternativas establecidas de tamano similar.
- Licencia no disponible: no puede confirmarse si el uso comercial esta permitido; adoptarlo en produccion sin aclarar la licencia conlleva riesgo legal.
- Idioma: solo se declara ingles; el rendimiento en castellano es desconocido y probablemente limitado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluacion publica no puede acotarse su magnitud.
- Cuantizaciones bajas (Q2_K, Q3_K_S): degradacion de calidad esperable; no recomendadas para tareas que requieran precision.
- Cuantizaciones estaticas sin imatrix: el autor indica que no hay quants ponderados, lo que puede suponer menor calidad frente a alternativas con imatrix a igual tamano.
- Origen y trazabilidad del modelo base inciertos: sin model card detallada del autor original, no puede verificarse la procedencia de los datos de entrenamiento.
- Fecha de creacion futura en los metadatos (2026-11-19): conviene verificar la integridad y procedencia del repositorio antes de su uso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Saathi-Axiom-32B-Apex-GGUF
- Modelo base: https://huggingface.co/Saathimed/Saathi-Axiom-32B-Apex
- Pagina de descargas del autor: https://hf.tst.eu/model#Saathi-Axiom-32B-Apex-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
