# mradermacher/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic-GGUF

## Resumen

El modelo `Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic-GGUF` es una cuantizacion estatica en formato GGUF del merge `xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic`, publicada por el usuario mradermacher, conocido por distribuir versiones cuantizadas de modelos abiertos. El modelo original es un merge de tres variantes derivadas de la familia Qwen 3.5, orientado a razonamiento, generacion de codigo y uso agentico, con un proceso de "abliteration" o "decensoring" que elimina las capas de rechazo del modelo base. La ficha describe exclusivamente la version cuantizada en GGUF, pensada para ejecucion local con llama.cpp y herramientas compatibles.

El modelo cuenta con 9.197.093.888 parametros (aproximadamente 9,2 mil millones) y esta empaquetado en un repositorio de 85,1 GB que contiene multiples niveles de cuantizacion, desde Q2_K (4,0 GB) hasta f16 (18,5 GB), ademas de dos ficheros mmproj (Q8_0 y f16) que indican soporte multimodal, probablemente vision. La licencia declarada es Apache 2.0 y el unico idioma indicado en la model card es el ingles.

La relevancia de esta publicacion radica en su proposito: ofrecer una version sin filtros de seguridad ("uncensored", "abliterated", "heretic") de un modelo de 9B con capacidades de razonamiento y contexto largo, lista para desplegar en hardware de consumo. No obstante, se trata de un merge comunitario sin benchmarks publicados en la informacion disponible y con cero descargas en el momento de la ficha, lo que limita cualquier evaluacion objetiva de su calidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5); detalles exactos no disponibles |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (la etiqueta "long-context" sugiere ventana extendida, pero sin cifra) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj Q8_0 y f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 85,1 GB |
| Modelo base | xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic |
| Libreria | transformers (segun metadatos); inferencia via llama.cpp |
| Pipeline | No disponible |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original mas alla de su pertenencia a la familia Qwen 3.5, que emplea transformers con atencion por grupos (GQA) y, presumiblemente, atencion con ventana deslizante o soporte de contexto extendido, aunque no se confirma ninguno de estos extremos. El nombre "3xMerge" indica que el modelo base resulta de la fusion de tres modelos o checkpoints distintos, una tecnica habitual para combinar capacidades de diferentes fine-tunes sin reentrenamiento. El sufijo "heretic" y las etiquetas "abliterated", "decensored" y "uncensored" apuntan a un proceso de abliteration, que elimina la direccion de rechazo en el espacio de activaciones para reducir las negativas del modelo ante ciertas peticiones.

Los datasets listados en la model card son `armand0e/claude-fable-5-claude-code`, `lambda/hermes-agent-reasoning-traces`, `Jackrong/Claude-opus-4.7-TraceInversion-5000x` y `Jackrong/Claude-opus-4.6-TraceInversion-9000x`. Estos nombres sugieren el uso de trazas de razonamiento y conversaciones generadas a partir de modelos Claude (Opus 4.6 y 4.7, y una variante "fable-5"), empleadas para destilar comportamiento agentico y de codigo. No se especifica el numero de tokens de entrenamiento, la composicion exacta de los datasets ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas propias del merge, como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, con etiquetas explicitas de "conversational".
- Razonamiento (etiqueta "reasoning"), presumiblemente con trazas de pensamiento derivadas de los datasets de Hermes y Claude.
- Generacion de codigo (etiqueta "coding") y posible uso en tareas de completado y refactorizacion.
- Comportamiento agentico (etiqueta "agentic"), con soporte esperado de tool calling y razonamiento multi-paso, aunque no se documenta el formato exacto de llamadas a herramientas.
- Contexto largo (etiqueta "long-context"), sin cifra concreta publicada.
- Capacidades multimodales: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica soporte de entrada de imagenes en el modelo base, aunque la model card no lo describe.
- Modo "uncensored": el proceso de abliteration reduce los rechazos ante peticiones que el modelo original declinaria.
- Multilingue limitado: solo se declara ingles.

## Casos de uso

- Asistente de codigo en local: el modelo puede integrarse en editores o CLI mediante llama.cpp para autocompletado y generacion de funciones, aprovechando su tamano de 9B y las cuantizaciones Q4_K_M (5,9 GB) que caben en GPUs de consumo.
- Agente autonomo de proposito general: las etiquetas "agentic" y "reasoning" y los datasets de trazas de Hermes sugieren uso en bucles de razonamiento con llamadas a herramientas, por ejemplo para automatizar tareas de shell o consultas a APIs.
- Procesamiento de documentos largos: la etiqueta "long-context" permite plantear resumenes y extraccion de informacion sobre textos extensos, aunque la ventana exacta debe verificarse empiricamente antes de production.
- Analisis de imagenes con el fichero mmproj: cargando el modelo multimodal suplementario en llama.cpp, puede emplearse para descripcion de capturas o extraccion de texto de imagenes en pipelines locales.
- Experimentacion en investigacion de seguridad: al ser una variante abliterated, sirve para estudiar el comportamiento de modelos sin capas de rechazo y comparar respuestas frente al modelo original.
- Prototipado de chatbots sin restricciones de contenido: util para entornos de pruebas donde se necesita explorar respuestas sin filtros, siempre con salvaguardas externas.
- Despliegue en estaciones de trabajo sin GPU dedicada: las cuantizaciones Q3_K_S (4,5 GB) y Q2_K (4,0 GB) permiten ejecucion en CPU con RAM moderada, aunque con perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto): Q2_K ~4,0 GB; Q3_K_S ~4,5 GB; Q4_K_S ~5,6 GB; Q4_K_M ~5,9 GB; Q5_K_M ~6,7 GB; Q6_K ~7,7 GB; Q8_0 ~9,9 GB; f16 ~18,5 GB. Añadir entre 1 y 4 GB adicionales para la cache KV segun la longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q8; RTX 4090 24 GB para f16 con contexto largo; A100 40/80 GB o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas para Q4_K_M, y en 12-16 GB para Q6_K y Q8_0 con contexto moderado.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), LM Studio, text-generation-webui y servidores compatibles con la API de OpenAI mediante llama-server. vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la longitud de contexto. Como referencia orientativa no verificada, un 9B en Q4_K_M suele generar decenas de tokens por segundo en una RTX 4090, pero no se aportan mediciones para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic (este) | ~9,2B | No disponible | Apache 2.0 | GGUF + safetensors | Merge abliterated, sin benchmarks publicados |
| Qwen2.5-7B-Instruct | ~7,6B | 32.768 tokens (segun ficha oficial de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo oficial con benchmarks publicados |
| Llama 3.1 8B Instruct | ~8B | 131.072 tokens (segun ficha oficial de Meta) | Llama 3.1 Community License | safetensors, GGUF | Amplia adopcion y ecosistema |
| Mistral 7B Instruct v0.3 | ~7,2B | 32.768 tokens (segun ficha oficial de Mistral) | Apache 2.0 | safetensors, GGUF | Referencia en modelos 7B abiertos |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo analizado, por lo que no puede establecerse una jerarquia de calidad frente a las alternativas. La principal diferencia es su naturaleza de merge comunitario sin evaluacion publica y su orientacion a contenido sin filtros.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de su rendimiento en MMLU, HumanEval, GSM8K ni tareas agenticas.
- Cero descargas y un solo "like" en el momento de la ficha: ecosistema practicamente inexistente, sin validacion de la comunidad.
- Modelo "abliterated"/"uncensored": puede generar contenido danino, ofensivo o ilegal sin rechazo; no debe desplegarse en produccion sin moderacion externa.
- Riesgo elevado de alucinacion: los merges sin evaluacion y los datasets de trazas sinteticas (generadas por modelos Claude) pueden producir respuestas plausibles pero incorrectas.
- Solo ingles declarado: el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Longitud de contexto no documentada: la etiqueta "long-context" no aporta cifra; usar ventanas grandes sin verificar puede degradar la calidad.
- Licencia Apache 2.0 declarada, pero el modelo base es un merge comunitario: conviene revisar la procedencia de los datasets (trazas de Claude) por posibles restricciones de sus terminos de uso originales.
- Fecha de creacion futura (2026-11-12) en los metadatos, lo que impide verificar la trazabilidad temporal de la publicacion.
- El repositorio de 85,1 GB incluye todas las cuantizaciones; descargar solo el fichero necesario para evitar consumo innecesario de disco.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset armand0e/claude-fable-5-claude-code: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
