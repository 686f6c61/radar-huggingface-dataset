# mradermacher/Muse-Glimmer-30B-Hermes-Agentic-i1-GGUF

## Resumen

Muse-Glimmer-30B-Hermes-Agentic-i1-GGUF es la versión cuantizada en formato GGUF del modelo vcruz305/Muse-Glimmer-30B-Hermes-Agentic, un ajuste fino orientado a agentes y tool calling sobre una base de la familia Muse Glimmer. El trabajo de cuantización lo firma mradermacher, un publicador habitual de cuantizaciones GGUF con metodología i1 (imatrix) y estáticas, y el resultado se distribuye bajo licencia Apache 2.0. El modelo cuenta con 27.854.794.240 parámetros reales según los safetensors del repositorio, lo que en la práctica lo sitúa en la categoría de 28B densos, y está pensado para ejecutarse en transformers, llama.cpp y derivados.

La relevancia de esta ficha radica en que combina dos factores poco habituales: por un lado, un ajuste específico sobre el dataset vcruz305/hermes-agentic-tool-sft, orientado a function calling y flujos agénticos; por otro, un catálogo de cuantizaciones muy amplio que va desde IQ1_S (6,6 GB) hasta Q6_K (23,0 GB), lo que permite desplegar el modelo en hardware de consumo con pérdida controlada de calidad. El repositorio ocupa 303,4 GB en total por acumulación de todas las variantes.

No obstante, la información pública disponible es limitada: la model card del cuantizador no incluye detalles de arquitectura, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha refleja únicamente lo verificable y marca como no disponible todo lo que no consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Muse Glimmer; se distribuye como transformers/GGUF) |
| Parametros totales | 27.854.794.240 (28B aprox.) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; estáticas en repo hermano |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo i1/imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Los metadatos indican que se trata de un modelo de la familia Muse Glimmer con 27.854.794.240 parámetros y que el ajuste fino se realizó sobre el dataset vcruz305/hermes-agentic-tool-sft, un conjunto orientado a tool calling y comportamiento agéntico. El pipeline declarado es transformers y la etiqueta "unsloth" sugiere que el entrenamiento o ajuste se llevó a cabo con las herramientas de Unsloth, habituales para fine-tuning eficiente en memoria.

El proceso de cuantización aplicado por mradermacher sigue la metodología i1, que emplea un fichero imatrix (incluido en el repositorio, de 0,1 GB) para ponderar la importancia de los tensores durante la cuantización. Según las notas del autor, esta variante i1 suele ofrecer mejor calidad que las cuantizaciones estáticas equivalentes en tamaño; además, se ofrece un repositorio paralelo con cuantizaciones estáticas. No consta información sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat multi-turno.
- Tool calling y function calling: el ajuste sobre hermes-agentic-tool-sft está específicamente orientado a la invocación estructurada de herramientas.
- Comportamiento agéntico: los tags del repositorio incluyen "agentic" y "multi-step", lo que indica soporte para razonamiento en varios pasos con llamadas a herramientas intermedias.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere integración con APIs de inferencia tipo OpenAI-compatible.
- Capacidades multilingües: limitadas al inglés según el campo language.
- No consta soporte de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Automatización de agentes con herramientas externas: el ajuste sobre un dataset específico de tool calling permite construir agentes que invocan APIs, bases de datos o servicios web de forma estructurada, con el modelo decidiendo qué función llamar y con qué argumentos.
- Asistentes de soporte técnico con acceso a sistemas: al soportar function calling, el modelo puede consultar estado de tickets, recuperar documentación o ejecutar acciones en CRM dentro de una conversación multi-turno.
- Orquestación de pipelines de datos: un agente basado en este modelo puede encadenar llamadas a herramientas de ETL, validación y carga, reportando resultados intermedios en cada paso.
- Despliegue en hardware de consumo: con cuantizaciones desde 6,6 GB (IQ1_S) hasta 23,0 GB (Q6_K), es viable ejecutarlo en estaciones de trabajo con GPU de 12-24 GB o incluso en CPU con llama.cpp, lo que facilita prototipado local de agentes sin depender de la nube.
- Integración en entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede incorporarse en productos comerciales internos o distribuidos sin obligaciones de copyleft.
- Evaluación de flujos agénticos en investigación: la disponibilidad de múltiples niveles de cuantización permite estudiar el impacto de la compresión en la fiabilidad del tool calling, comparando i1 frente a cuantizaciones estáticas.
- Backend de asistentes conversacionales en inglés: para productos dirigidos a usuarios angloparlantes que requieran generación de texto con formato de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más overhead de contexto. Orientativamente: IQ1_S ~6,6 GB, IQ2_M ~9,9 GB, IQ3_M ~12,9 GB, IQ4_XS ~15,3 GB, Q4_K_M ~17,0 GB, Q5_K_M ~19,9 GB, Q6_K ~23,0 GB.
- GPU recomendadas: para Q4_K_M o superiores, GPU con 24 GB (RTX 3090, RTX 4090, A10G, L4 en configuraciones con offload); para Q6_K, A100 40 GB o H100 para margen amplio de contexto. Las cuantizaciones IQ2/IQ3 caben en GPU de 12-16 GB (RTX 4070 Ti, RTX 4080, A4000).
- Cabe en consumer GPU: sí, en RTX 4090 (24 GB) con Q4_K_M o Q5_K_M, y en GPUs de 12-16 GB con cuantizaciones IQ2/IQ3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base es compatible con transformers. No consta soporte nativo de vLLM o TGI para esta variante GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma familia o categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Idiomas: el modelo está entrenado y etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Sesgos: no se documentan en la model card; al ser un ajuste sobre un dataset específico de tool calling, puede heredar sesgos del corpus base y del conjunto de instrucciones.
- Alucinación: no hay evaluación publicada; en tareas de function calling el riesgo se manifiesta como invocaciones con argumentos inventados o herramientas inexistentes, por lo que se recomienda validación estricta de esquemas.
- Contexto: se desconoce la longitud máxima soportada, lo que impide planificar con seguridad flujos con documentos largos o historiales extensos.
- Cuantizaciones extremas: las variantes IQ1 e IQ2 (6,6-9,9 GB) degradan notablemente la calidad según las propias notas de mradermacher ("for the desperate", "very low quality"); para producción se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de ajuste por si imponen restricciones adicionales.
- Repositorio pesado: 303,4 GB en total; la descarga debe hacerse seleccionando únicamente la cuantización necesaria.
- Sin benchmarks ni documentación de arquitectura: la evaluación en producción requiere pruebas propias antes de adoptar el modelo.

## Enlaces

- Repositorio Hugging Face (i1 GGUF): https://huggingface.co/mradermacher/Muse-Glimmer-30B-Hermes-Agentic-i1-GGUF
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Muse-Glimmer-30B-Hermes-Agentic-GGUF
- Modelo base: https://huggingface.co/vcruz305/Muse-Glimmer-30B-Hermes-Agentic
- Dataset de ajuste: https://huggingface.co/datasets/vcruz305/hermes-agentic-tool-sft
- Página de descargas del cuantizador: https://hf.tst.eu/model#Muse-Glimmer-30B-Hermes-Agentic-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
