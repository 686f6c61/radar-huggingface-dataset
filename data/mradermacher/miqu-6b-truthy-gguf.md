# mradermacher/Miqu-6B-truthy-GGUF

## Resumen

Miqu-6B-truthy-GGUF es la distribucion en formato GGUF del modelo vicgalle/Miqu-6B-truthy, publicada por el usuario mradermacher, conocido en el ecosistema por generar cuantizaciones estaticas de modelos abiertos. El modelo subyacente es un ajuste fino de Mistral-6B (la variante de 6.000 millones de parametros de la familia Mistral) afinado sobre el dataset jondurbin/truthy-dpo-v0.1, un conjunto orientado a mejorar la veracidad y reducir la adulacion (sycophancy) en las respuestas. La relevancia de esta ficha radica en que ofrece el modelo ya cuantizado en multiples precisiones, listo para ejecutarse en llama.cpp y entornos compatibles sin necesidad de conversion.

El modelo cuenta con 5.658.222.592 parametros (5,66 mil millones) y esta etiquetado unicamente para ingles. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las de dicha licencia. El repositorio ocupa 50,1 GB e incluye doce variantes de cuantizacion, desde Q2_K (2,3 GB) hasta f16 (11,4 GB). La fecha de creacion es diciembre de 2024 y la ultima actualizacion registrada es noviembre de 2026.

Al tratarse de una cuantizacion y no de un modelo original, la ficha debe interpretarse como una via de despliegue del modelo base vicgalle/Miqu-6B-truthy. No se dispone de informacion publica sobre benchmarks especificos para esta variante cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral-6B, segun el nombre del modelo base) |
| Parametros totales | 5.658.222.592 (5,66 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (segun la model card y los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en formato transformers/safetensors |

## Arquitectura y entrenamiento

El modelo subyacente, vicgalle/Miqu-6B-truthy, es un ajuste fino de un modelo Mistral de 6.000 millones de parametros, segun se desprende de la nomenclatura y del tag `miqu`. La arquitectura es un transformer decoder-only con atencion causal estandar, sin innovaciones documentadas en la informacion disponible (no se confirma uso de atencion lineal, decodificacion especulativa ni mecanismos MoE).

El entrenamiento del modelo base se realizo sobre el dataset jondurbin/truthy-dpo-v0.1, un conjunto de preferencias orientado a DPO (Direct Preference Optimization) cuyo objetivo es penalizar respuestas aduladoras o excesivamente complacientes y favorecer respuestas veraces aunque resulten incomodas para el usuario. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases adicionales de RLHF. La cuantizacion realizada por mradermacher es de tipo estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no incluye variantes imatrix, que el autor publica en un repositorio separado (Miqu-6B-truthy-i1-GGUF).

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en respuestas veraces y no aduladoras gracias al ajuste DPO sobre truthy-dpo-v0.1.
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por el tamano de 6B parametros.
- Generacion de codigo y texto tecnico, si bien no se documentan capacidades especificas ni benchmarks de HumanEval o similares.
- Soporte multilingue limitado al ingles segun la model card; no se confirma rendimiento en castellano u otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision, audio ni capacidades multimodales.
- Formato conversacional compatible con plantillas de chat de la familia Mistral (no confirmado explicitamente en la informacion disponible).

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (3,5 GB) y Q5_K_M (4,1 GB) permiten ejecutar el modelo en GPUs con 6-8 GB de VRAM mediante llama.cpp, ideal para prototipado y experimentacion sin infraestructura cloud.
- Asistentes conversacionales en ingles con requisito de veracidad: el ajuste DPO sobre truthy-dpo-v0.1 lo hace adecuado para tareas donde se quiere reducir la adulacion, como revisiones criticas de textos o respuestas a preguntas factuales donde el modelo debe reconocer incertidumbre.
- Generacion de texto en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite integrar el modelo en productos comerciales sin las restricciones de otras licencias (por ejemplo, Llama o Gemma), siempre que se cumplan las condiciones de atribucion.
- Filtrado y moderacion de contenido en ingles: el modelo puede clasificar o reescribir respuestas para eliminar tono excesivamente complaciente en pipelines de atencion al cliente.
- Educacion y tutoria automatizada: para generar explicaciones que no validen erroneamente las premisas del estudiante, aprovechando el sesgo anti-adulacion del ajuste.
- Experimentacion academica en investigacion sobre veracidad y alineacion: el modelo sirve como baseline ligero (6B) para comparar tecnicas de DPO frente a modelos mayores, con la ventaja de ejecutarse en hardware modesto.
- Inferencia en CPU: las cuantizaciones Q2_K (2,3 GB) y Q3_K_S (2,6 GB) permiten ejecucion en CPU con llama.cpp, util para entornos sin GPU o para pruebas de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos proporcionan cifras de MMLU, HumanEval, GSM8K, TruthfulQA ni de ninguna otra evaluacion. Tampoco se ofrecen comparaciones numericas con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de archivo GGUF y overhead de contexto):
  - Q2_K: ~2,5-3 GB
  - Q3_K_S / Q3_K_M: ~3-3,5 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~3,5-4,5 GB
  - Q5_K_S / Q5_K_M: ~4,5-5,5 GB
  - Q6_K: ~5-6 GB
  - Q8_0: ~6,5-7,5 GB
  - f16: ~11,5-13 GB
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para cuantizaciones Q4/Q5 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Para f16 se recomienda una GPU con 16 GB o mas (RTX 4080/4090, A100, H100).
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 8 GB o mas para cuantizaciones Q4/Q5; en GPUs con 4-6 GB solo con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp server. No es compatible directamente con vLLM o TGI en formato GGUF sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependen fuertemente del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Miqu-6B-truthy-GGUF (este) | 5,66B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas, solo ingles |
| vicgalle/Miqu-6B-truthy (base) | 5,66B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Mistral-7B-Instruct-v0.2 | 7,24B | 32k (segun documentacion del autor) | Apache 2.0 | safetensors, GGUF | Referencia de la familia; contexto mayor y mas documentado |
| Zephyr-7B-beta | 7,24B | 32k (segun documentacion del autor) | MIT | safetensors, GGUF | Ajuste DPO similar; benchmarkeado ampliamente |

La comparativa se limita a modelos de la misma familia y tamano; no se dispone de datos de rendimiento para posicionar numericamente a Miqu-6B-truthy frente a estas alternativas.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta garantizado ni documentado.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de la mejora en veracidad frente al modelo base ni frente a alternativas.
- Riesgo de alucinacion inherente a modelos de 6B parametros; el ajuste DPO puede reducir la adulacion pero no elimina la generacion de informacion falsa.
- La cuantizacion introduce perdida de calidad, especialmente en Q2_K y Q3_K_M (el autor marca Q3_K_M como "lower quality"); para produccion se recomienda Q4_K_M o superior.
- El repositorio tiene muy pocas descargas (189) y cero likes, lo que sugiere poca validacion por parte de la comunidad.
- No se documenta la longitud de contexto del modelo base; asumir contextos largos sin verificacion puede provocar degradacion.
- Aunque la licencia es Apache 2.0, conviene verificar que el modelo base (Mistral-6B) no imponga restricciones adicionales; la informacion disponible no detalla la procedencia exacta de los pesos originales.
- No hay soporte documentado de tool calling ni de agentes; no debe asumirse su disponibilidad en produccion.
- El modelo base es de 2024 y no se ha actualizado desde entonces; puede estar desactualizado frente a modelos mas recientes de similar tamano.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Miqu-6B-truthy-GGUF
- Modelo base: https://huggingface.co/vicgalle/Miqu-6B-truthy
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/Miqu-6B-truthy-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Miqu-6B-truthy-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/jondurbin/truthy-dpo-v0.1
- Guia de uso de GGUF (ejemplo de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
