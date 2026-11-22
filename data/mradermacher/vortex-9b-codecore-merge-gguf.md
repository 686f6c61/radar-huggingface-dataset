# mradermacher/Vortex-9B-CodeCore-Merge-GGUF

## Resumen

Vortex-9B-CodeCore-Merge-GGUF es la distribucion en formato GGUF del modelo Vortex-9B-CodeCore-Merge, un merge de modelos de la familia Qwen3.5-9B orientado a generacion de codigo, razonamiento con cadena de pensamiento (chain-of-thought) y uso de herramientas (tool calling, function calling). El modelo original lo desarrolla prithivMLmods mediante tecnicas de merge (omnimergekit), y la version cuantizada la publica mradermacher, un distribuidor habitual de cuantizaciones GGUF para llama.cpp y ecosistemas compatibles.

Con 9.197.093.888 parametros totales (aproximadamente 9,2 mil millones) y licencia Apache 2.0, el modelo se posiciona en la franja de modelos densos de tamano medio que pueden ejecutarse en GPUs de consumo con cuantizaciones de 4 a 6 bits. Su interes principal radica en combinar capacidades de codigo y agentes con un formato listo para inferencia local, algo relevante para desarrolladores que quieren evitar dependencias de API en flujos de trabajo con tool calling.

La informacion publica disponible es limitada: la model card del repositorio GGUF es fundamentalmente una ficha de cuantizaciones y no detalla la composicion del dataset de entrenamiento, la longitud de contexto nativa ni los resultados de benchmarks. Esta ficha refleja unicamente los datos verificables en la informacion proporcionada y marca explicitamente como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B; detalles de capas y atencion no disponibles) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mas mmproj Q8_0 y f16 (multimodal) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors/PyTorch |

## Arquitectura y entrenamiento

El modelo deriva de Qwen3.5-9B, segun indican las etiquetas del repositorio, y se ha construido mediante un proceso de merge de modelos (tag `merge`, herramienta `omnimergekit`) a partir de componentes con fine-tuning supervisado (SFT) orientados a razonamiento, agentes y codigo. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO. La model card del repositorio GGUF no incluye estos detalles y se limita a describir las cuantizaciones generadas.

Las etiquetas del modelo indican soporte de razonamiento con cadena de pensamiento, tool use, function calling y capacidades de coder. El repositorio incluye ficheros `mmproj` (multi-modal supplement) en Q8_0 y f16, lo que sugiere que el modelo base incorpora alguna capacidad multimodal, aunque no se especifica que modalidades ni con que arquitectura de proyeccion. La cuantizacion se ha realizado con un proceso de version 2 (`quantize_version: 2`, `output_tensor_quantised: 1`) y conversion a formato HF, segun los metadatos internos del README. Existe ademas una variante con cuantizaciones ponderadas/imatrix en el repositorio `mradermacher/Vortex-9B-CodeCore-Merge-i1-GGUF`.

## Capacidades

- Generacion de texto conversacional y finalizacion de instrucciones en ingles.
- Razonamiento explicito con cadena de pensamiento (chain-of-thought), segun las etiquetas del modelo.
- Generacion y asistencia de codigo (tag `coder`).
- Soporte de tool calling y function calling, orientado a integraciones con APIs y agentes.
- Capacidades de agente y razonamiento multi-paso (tags `agent`, `sft`).
- Soporte multimodal a traves de los ficheros `mmproj` incluidos (modalidades concretas no especificadas).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con text-generation-inference.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Asistente de codigo en local: el modelo puede integrarse en editores o CLI para autocompletado, explicacion y refactorizacion de codigo en ingles, ejecutandose con cuantizacion Q4_K_M (5,9 GB) en una GPU de consumo.
- Agentes con tool calling: al soportar function calling, puede conectarse a herramientas externas (busqueda, calculo, APIs internas) en flujos de agente de varios pasos, con la ventaja de no depender de un proveedor cloud.
- Razonamiento con trazas verificables: el modo chain-of-thought permite generar explicaciones intermedias utiles en tareas de depuracion o analisis de problemas tecnicos, donde el desarrollador quiere revisar el proceso y no solo la respuesta.
- Prototipado de pipelines de CI/CD: puede usarse para generar parches, mensajes de commit o revisiones de codigo automatizadas dentro de un pipeline, con la licencia Apache 2.0 facilitando su integracion.
- Procesamiento de documentacion tecnica: generacion de resumenes, ejemplos de uso y traduccion de especificaciones al ingles, aprovechando su orientacion a contenido tecnico.
- Evaluacion y experimentacion en investigacion: al ser un merge con cuantizaciones disponibles desde Q2_K (4,0 GB) hasta f16 (18,5 GB), permite comparar el impacto de la cuantizacion en calidad y latencia sobre el mismo modelo base.
- Despliegue en entornos con requisitos de privacidad: la inferencia local con llama.cpp u Ollama evita enviar codigo propietario a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~4,0 GB; Q4_K_M ~5,9 GB; Q6_K ~7,7 GB; Q8_0 ~9,9 GB; f16 ~18,5 GB. Anadir aproximadamente 0,7-1,0 GB si se usa el proyector multimodal `mmproj`.
- GPU recomendadas: para Q4_K_M o Q5_K_M basta una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB; para Q8_0 o f16 se recomienda RTX 4090 (24 GB), A100 o H100. En GPUs de 8 GB cabe Q3_K_M o IQ4_XS con contexto reducido.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas segun la cuantizacion elegida (Q4_K_S y Q4_K_M estan marcadas como "fast, recommended" por el autor de las cuantizaciones).
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base admite transformers y text-generation-inference. Existe variante imatrix para quienes priorizan calidad por bit.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vortex-9B-CodeCore-Merge-GGUF | 9,2 B | No disponible | Apache 2.0 | GGUF (multiples cuantizaciones) | Merge orientado a codigo, agentes y CoT; solo ingles |
| Qwen3.5-9B (modelo base de referencia) | ~9 B | No disponible | No disponible en la informacion | safetensors | Familia de origen del merge; sin datos de rendimiento publicados aqui |
| Vortex-9B-CodeCore-Merge (original) | 9,2 B | No disponible | Apache 2.0 | safetensors/PyTorch | Version sin cuantizar; requiere mas VRAM |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Idioma: el modelo declara unicamente ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Alucinacion: al ser un merge de modelos con razonamiento, puede generar trazas de pensamiento plausibles pero incorrectas; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares, por lo que la calidad real frente a otros modelos de 9 B no puede verificarse con la informacion disponible.
- Contexto desconocido: se desconoce la longitud de contexto nativa, lo que complica el dimensionamiento de memoria para conversaciones largas o repositorios extensos.
- Proceso de merge: los merges pueden heredar sesgos y comportamientos inconsistentes de los modelos componentes; no se documenta la composicion exacta.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M estan marcadas por el autor como de menor calidad; para produccion se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos componentes del merge, no detalladas en la informacion proporcionada.
- Datos de la model card: la ficha del repositorio GGUF no documenta el entrenamiento ni el contexto; cualquier decision de produccion deberia basarse en evaluacion propia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Vortex-9B-CodeCore-Merge-GGUF
- Modelo base original: https://huggingface.co/prithivMLmods/Vortex-9B-CodeCore-Merge
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Vortex-9B-CodeCore-Merge-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Vortex-9B-CodeCore-Merge-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
