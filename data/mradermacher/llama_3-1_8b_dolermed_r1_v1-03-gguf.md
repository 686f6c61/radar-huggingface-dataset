# mradermacher/Llama_3.1_8b_Dolermed_R1_V1.03-GGUF

## Resumen

Llama_3.1_8b_Dolermed_R1_V1.03-GGUF es la distribucion en formato GGUF del modelo fusionado Nexesenex/Llama_3.1_8b_Dolermed_R1_V1.03, publicada por el usuario mradermacher, conocido por generar cuantizaciones estaticas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo subyacente parte de Llama 3.1 8B, desarrollado originalmente por Meta, y ha sido modificado mediante tecnicas de merge (fusión de pesos) con mergekit, lo que sugiere la combinacion de varios checkpoints afinados para obtener un modelo con capacidades reforzadas, en este caso orientado por su nombre a dominios medicos ("Dolermed") y con un posible componente de razonamiento ("R1").

El paquete incluye un conjunto completo de cuantizaciones que van desde Q2_K (3,3 GB) hasta f16 (16,2 GB), pasando por IQ4_XS, Q4_K_M y Q8_0, lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con 6-8 GB de VRAM hasta estaciones de trabajo. La arquitectura de base es la de Llama 3.1 8B: un transformer decoder-only denso con 8.030.277.696 parametros y una ventana de contexto nativa de 128.000 tokens (segun las especificaciones publicadas por Meta para la familia Llama 3.1).

La relevancia de esta ficha radica en que permite evaluar rapidamente una variante comunitaria especializada y cuantizada de Llama 3.1 8B, con licencia Llama 3.1, idioma declarado ingles y un uso previsto conversacional. Conviene tener presente que se trata de un merge no oficial, sin benchmarks publicados en la informacion disponible, por lo que su adopcion en produccion exige validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Llama 3.1 8B); modelo fusionado con mergekit |
| Parametros totales | 8.030.277.696 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; la base Llama 3.1 8B soporta 128.000 tokens |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (cuantizaciones ponderadas/imatrix en repo separado -i1-GGUF) |
| Idiomas soportados | en (ingles declarado) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un merge de Llama 3.1 8B realizado con mergekit, segun las etiquetas de la model card. Llama 3.1 8B es un transformer decoder-only denso con atencion por grupos (GQA), RoPE y una ventana de contexto nativa de 128.000 tokens, entrenado por Meta sobre del orden de 15 billones de tokens (dato publicado por Meta para la familia Llama 3.1) y afinado con tecnicas de alineacion como SFT y RLHF/DPO. El proceso exacto de fusion (que checkpoints se combinaron, con que metodo y pesos) no se detalla en la informacion disponible; solo consta la etiqueta "mergekit" y "merge".

No se dispone de informacion sobre el volumen de datos adicionales, la composicion del dataset de la fusion ni si hubo etapas posteriores de RLHF o DPO especificas para esta variante. El nombre "Dolermed" sugiere una orientacion al dominio medico y "R1" una posible componente de razonamiento, pero no hay documentacion tecnica en la informacion proporcionada que lo confirme. Las cuantizaciones GGUF han sido generadas por mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), e incluyen tanto cuantizaciones estaticas como una variante ponderada con imatrix en un repositorio aparte.

## Capacidades

- Generacion de texto conversacional multi-turno, uso previsto declarado en la model card.
- Razonamiento y respuesta a instrucciones heredados del modelo base Llama 3.1 8B.
- Generacion de codigo y matematicas basicas (capacidades propias de Llama 3.1 8B, no verificadas para este merge).
- Soporte de tool calling / function calling: no confirmado para este merge concreto; Llama 3.1 lo soporta de forma nativa, pero la fusion puede alterar el formato.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues limitadas al ingles declarado; el resto de idiomas de Llama 3.1 no estan garantizados tras el merge.
- No se declaran capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: con la cuantizacion Q4_K_M (5,0 GB) el modelo cabe en GPUs de consumo y permite iterar sobre prompts y flujos de dialogo sin infraestructura dedicada.
- Despliegue en entornos con VRAM limitada: las variantes Q2_K (3,3 GB) y Q3_K_S (3,8 GB) permiten ejecutar el modelo en GPUs de 6-8 GB o incluso en CPU con llama.cpp, util para demos y pruebas de concepto.
- Experimentacion en dominio medico en ingles: dado el nombre del merge, puede servir como punto de partida para evaluar respuestas sobre tematica sanitaria, siempre con validacion humana y sin uso clinico directo.
- Fine-tuning ligero o LoRA sobre la base: al disponer de pesos en safetensors del modelo original (Nexesenex/Llama_3.1_8b_Dolermed_R1_V1.03), se puede adaptar a dominios concretos antes de cuantizar de nuevo.
- Evaluacion comparativa de merges comunitarios: util para investigadores que quieran medir el efecto de la fusion frente a Llama 3.1 8B original en tareas de razonamiento o conocimiento medico.
- Generacion de texto por lotes en CPU: con Q4_K_S o Q5_K_M y llama.cpp se puede procesar volumen moderado de texto en servidores sin GPU, a coste bajo.
- Integracion en pipelines de CI para pruebas de regresion de prompts: el tamano reducido de las cuantizaciones permite incluirlo en entornos de test automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): Q2_K ~4 GB, Q4_K_M ~5,5-6 GB, Q5_K_M ~6,5-7 GB, Q6_K ~7,5-8 GB, Q8_0 ~9,5-10 GB, f16 ~16-17 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB para cuantizaciones Q4-Q8 con contexto amplio; A100 40/80 GB o H100 para f16 y contextos largos.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 6 GB; Q4_K_M es la opcion recomendada por el autor para GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI (el repo incluye la etiqueta endpoints_compatible). vLLM y TGI requieren pesos en safetensors o AWQ/GPTQ, no incluidos en este repo.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de la cuantizacion y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama_3.1_8b_Dolermed_R1_V1.03-GGUF (este) | 8,03 B | no disponible (base 128k) | llama3.1 | GGUF | Merge comunitario, sin benchmarks publicados |
| Llama 3.1 8B Instruct (Meta) | 8,03 B | 128k | llama3.1 | safetensors, GGUF (terceros) | Modelo oficial, benchmarks publicados por Meta |
| Mistral 7B Instruct v0.3 | 7,2 B | 32k | Apache 2.0 | safetensors, GGUF | Alternativa abierta con licencia permisiva |
| Qwen2.5 7B Instruct | 7,6 B | 128k | Apache 2.0 (segun variante) | safetensors, GGUF | Buen rendimiento en codigo y multilingue |

## Limitaciones y advertencias

- Modelo fusionado no oficial: no hay evaluacion independiente ni benchmarks publicados; el rendimiento puede degradarse respecto a Llama 3.1 8B original en algunas tareas.
- Riesgo de alucinacion, especialmente relevante por la orientacion medica sugerida en el nombre; no debe usarse como fuente de consejo sanitario sin supervision experta.
- Idioma declarado solo ingles; el soporte multilingue de Llama 3.1 puede haberse visto afectado por el merge.
- Licencia Llama 3.1 Community License: permite uso comercial con restricciones (por ejemplo, obligaciones de atribucion y limite de 700 millones de usuarios mensuales para productos derivados), conviene revisar el texto completo antes de desplegar.
- Al ser un merge con posible componente de razonamiento ("R1"), el formato de salida y los tokens especiales pueden diferir del Llama 3.1 estandar; validar plantillas de chat.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M marcada como "lower quality") degradan notablemente la coherencia; para produccion se recomienda Q4_K_M o superior.
- Fecha de actualizacion del repo (2026-11-20) posterior a la de creacion; verificar integridad de los archivos descargados.
- Sin garantias de soporte ni mantenimiento por parte del autor del merge ni del cuantizador.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama_3.1_8b_Dolermed_R1_V1.03-GGUF
- Modelo base (merge original): https://huggingface.co/Nexesenex/Llama_3.1_8b_Dolermed_R1_V1.03
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Llama_3.1_8b_Dolermed_R1_V1.03-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Llama_3.1_8b_Dolermed_R1_V1.03-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- mergekit (herramienta de fusion): https://github.com/arcee-ai/mergekit
- Llama 3.1 (Meta): https://ai.meta.com/blog/meta-llama-3-1/
