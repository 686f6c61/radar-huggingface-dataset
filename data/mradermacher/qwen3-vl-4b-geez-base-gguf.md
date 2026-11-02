# mradermacher/qwen3-VL-4B-geez-Base-GGUF

## Resumen

`mradermacher/qwen3-VL-4B-geez-Base-GGUF` es una coleccion de cuantizaciones GGUF del modelo `NaolBM/qwen3-VL-4B-geez-Base`, un ajuste fino del modelo multimodal Qwen3-VL de 4.077 millones de parametros. El trabajo de cuantizacion lo realiza mradermacher, un conocido publicador de versiones GGUF de la comunidad, utilizando la herramienta de cuantizacion de Unsloth. El modelo base es un fine-tune orientado al idioma geez (una lengua semitica historica de Etiopia) partiendo de la arquitectura vision-lenguaje Qwen3-VL, lo que lo convierte en un caso de adaptacion linguistica de un modelo multimodal moderno a un idioma de bajos recursos.

La relevancia de esta ficha radica en dos factores. Por un lado, demuestra el flujo tipico de la comunidad open source: un fine-tune especializado se publica en safetensors y, en cuestion de dias, aparece una version GGUF lista para ejecutarse en hardware de consumo, con una bateria de cuantizaciones que van desde Q2_K (1,8 GB) hasta f16 (8,3 GB). Por otro, permite ejecutar un modelo vision-lenguaje de 4B en GPUs de gama media e incluso en CPU, algo impensable hace un par de anos para esta categoria.

El repositorio tiene 146 descargas y ningun "like" en el momento de la consulta, lo que sugiere un modelo de nicho, probablemente orientado a investigacion linguistica o a proyectos de preservacion del geez mas que a produccion general. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque la calidad del fine-tune en tareas generales no esta documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL: vision encoder + decoder de lenguaje) |
| Parametros totales | 4.077.684.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, ademas de mmproj Q8_0 y f16 |
| Idiomas soportados | en (segun la model card; el fine-tune esta orientado a geez pero no se declara como idioma soportado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (multiples archivos por cuantizacion) y mmproj para el encoder visual |

## Arquitectura y entrenamiento

El modelo base `NaolBM/qwen3-VL-4B-geez-Base` es un fine-tune de Qwen3-VL, la familia multimodal de Alibaba que combina un encoder visual con un decoder de lenguaje basado en transformer. Qwen3-VL incorpora mejoras sobre Qwen2-VL en comprension de imagenes, video y documentos, y en capacidades de razonamiento visual. El fine-tune concreto se ha realizado sobre el checkpoint de 4B y esta orientado al idioma geez, aunque no se dispone de informacion publica sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Las cuantizaciones han sido generadas por mradermacher con la herramienta de Unsloth (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`). Se trata de cuantizaciones estaticas, sin versiones ponderadas ni imatrix disponibles en el momento de la publicacion; el autor indica que si no aparecen en una semana, probablemente no las planifique. Se incluye un archivo `mmproj` separado (Q8_0 de 0,6 GB o f16 de 0,9 GB) que contiene el proyector multimodal necesario para el procesamiento de imagenes en llama.cpp.

## Capacidades

- Generacion de texto conversacional en ingles y, presumiblemente, en geez (el fine-tune esta orientado a este idioma, aunque no hay evaluacion publica).
- Procesamiento de imagenes y documentos gracias al encoder visual de Qwen3-VL y al proyector mmproj incluido.
- Razonamiento multimodal: descripcion de imagenes, respuesta a preguntas sobre contenido visual y extraccion de informacion de documentos.
- Soporte de conversacion multi-turno (tag `conversational` en el repo).
- Compatibilidad con text-generation-inference y endpoints compatibles (tags `text-generation-inference`, `endpoints_compatible`).
- No se documenta soporte explicito de tool calling, function calling ni modo "thinking" en la informacion disponible.
- Capacidades multilingues limitadas: la model card solo declara `en`; el geez es el objetivo del fine-tune pero no se declara oficialmente.

## Casos de uso

- **Investigacion linguistica sobre geez**: el modelo puede emplearse para generar y analizar texto en geez, un idioma semitico con pocos recursos digitales, apoyando proyectos de preservacion y estudio filologico.
- **Digitalizacion de manuscritos etiopes**: combinando el encoder visual con el fine-tune linguistico, se pueden procesar imagenes de manuscritos y generar transcripciones o traducciones asistidas, siempre con revision humana.
- **Prototipado rapido en hardware de consumo**: las cuantizaciones Q4_K_M (2,6 GB) permiten ejecutar un modelo vision-lenguaje en una RTX 3060 de 12 GB o incluso en portatiles con GPU integrada, ideal para demos y pruebas de concepto.
- **Aplicaciones offline en entornos con conectividad limitada**: al ser GGUF, el modelo puede desplegarse con llama.cpp en equipos sin acceso a la nube, util para trabajo de campo en zonas rurales de Etiopia o entornos air-gapped.
- **Fine-tuning posterior sobre geez**: el checkpoint en safetensors del modelo base sirve como punto de partida para ajustes adicionales con LoRA o QLoRA, y la version GGUF permite validar rapidamente el comportamiento antes de invertir en entrenamiento.
- **Evaluacion comparativa de cuantizaciones**: el repositorio ofrece 12 niveles de cuantizacion, lo que lo convierte en un banco de pruebas util para medir la degradacion de calidad en tareas multimodales segun el nivel de compresion.
- **Educacion y divulgacion**: permite a estudiantes e investigadores experimentar con un modelo vision-lenguaje moderno sin necesidad de infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del fine-tune no documenta metricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales (MMBench, DocVQA, etc.) para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

- **VRAM estimada para inferencia** (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,8 GB
  - Q3_K_M: ~2,2 GB
  - Q4_K_M: ~2,6 GB (recomendado por el autor)
  - Q5_K_M: ~3,0 GB
  - Q6_K: ~3,5 GB
  - Q8_0: ~4,4 GB
  - f16: ~8,3 GB
  - Anadir ~0,6-0,9 GB si se usa el proyector multimodal mmproj.
- **GPU recomendadas**: cualquier GPU consumer con 6 GB o mas para cuantizaciones Q4/Q5 (RTX 3060, RTX 4060, RTX 2070). Para Q8_0 o f16 se recomienda 8-12 GB (RTX 3070, RTX 4070, RTX 3080). En datacenter, A100 o H100 no son necesarias para este tamano, pero funcionan sin problema.
- **Cabe en consumer GPU**: si, en practicamente cualquier GPU dedicada de los ultimos cinco anos, e incluso en iGPU con memoria compartida para cuantizaciones bajas.
- **Opciones de despliegue**: llama.cpp, Ollama (mediante importacion de GGUF), LM Studio, text-generation-inference (con soporte GGUF), y servidores compatibles con la API de OpenAI a traves de llama.cpp server.
- **Latencia y throughput**: no disponibles. Dependen fuertemente del hardware y del backend; en una RTX 4090 se puede esperar decenas de tokens por segundo para un modelo de 4B, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-VL-4B-geez-Base (este) | 4,08B | no disponible | Si (vision) | Apache 2.0 | GGUF + safetensors |
| Qwen3-VL-4B (original de Alibaba) | ~4B | no disponible | Si (vision) | Apache 2.0 | safetensors, GGUF de terceros |
| Qwen2-VL-2B | ~2B | 32k (segun documentacion de Qwen2-VL) | Si (vision) | Apache 2.0 | safetensors, GGUF |
| LLaVA-1.5-7B | ~7B | 4k | Si (vision) | Llama 2 (uso comercial restringido) | safetensors, GGUF |

La comparativa es aproximada: no se dispone de benchmarks del fine-tune en geez, por lo que la comparacion se limita a parametros, licencia y disponibilidad. El modelo original Qwen3-VL-4B es la referencia natural para evaluar cuanto se ha degradado o especializado el fine-tune.

## Limitaciones y advertencias

- **Idioma declarado limitado**: la model card solo declara `en`, aunque el fine-tune este orientado al geez. No hay garantia de calidad en otros idiomas, incluido el espanol.
- **Riesgo de alucinacion**: como todo modelo de lenguaje de 4B, especialmente tras un fine-tune de nicho, puede generar contenido plausible pero falso, sobre todo en tareas de conocimiento factual y en geez, donde los datos de entrenamiento son escasos.
- **Sesgos desconocidos**: no se documenta la composicion del dataset de fine-tune, por lo que no se pueden evaluar sesgos culturales, religiosos o historicos, especialmente relevantes en un idioma ligado a textos liturgicos.
- **Cuantizaciones estaticas**: no hay versiones imatrix o ponderadas, lo que puede suponer una perdida de calidad mayor en Q2_K y Q3_K_S respecto a cuantizaciones optimizadas.
- **Sin benchmarks**: no hay evaluaciones publicadas que permitan comparar el rendimiento del fine-tune con el modelo original ni con alternativas.
- **Licencia Apache 2.0**: permite uso comercial, pero el fine-tune no incluye avisos sobre derechos de los datos de entrenamiento del geez; conviene revisar la procedencia del corpus antes de un despliegue comercial.
- **Soporte de herramientas incierto**: no se documenta tool calling ni function calling, por lo que no es adecuado para pipelines de agentes sin validacion previa.
- **Fecha de creacion futura**: el repositorio figura creado en 2026-01-12, lo que puede indicar un error en los metadatos o una publicacion programada; conviene verificar la integridad de los archivos antes de usarlos en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/qwen3-VL-4B-geez-Base-GGUF
- Modelo base: https://huggingface.co/NaolBM/qwen3-VL-4B-geez-Base
- Pagina de descargas del autor: https://hf.tst.eu/model#qwen3-VL-4B-geez-Base-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
