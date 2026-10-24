# mradermacher/Ministral-8B-maker-v2-GGUF

## Resumen

`mradermacher/Ministral-8B-maker-v2-GGUF` es un conjunto de cuantizaciones estáticas en formato GGUF del modelo `swdq/Ministral-8B-maker-v2`, un fine-tune de la familia Ministral 8B de Mistral AI. Lo publica mradermacher, autor habitual de cuantizaciones GGUF para llama.cpp, y su función es permitir la ejecución local del modelo base en hardware de consumo sin necesidad de GPUs de datacenter. El repositorio contiene 12 variantes de cuantización, desde Q2_K (3,3 GB) hasta f16 (16,1 GB).

El modelo cuenta con 8.019.808.256 parámetros totales (8,02B), está etiquetado para inglés y orientado a uso conversacional, y se distribuye bajo la librería `transformers` aunque el artefacto real son ficheros GGUF. No se han publicado cuantizaciones ponderadas ni con imatrix: todas las variantes son estáticas, lo que sitúa la calidad de las cuantizaciones pequeñas por debajo de las versiones IQ equivalentes.

La relevancia de esta ficha es doble. Por un lado, permite evaluar si merece la pena descargar el modelo para inferencia local en GPUs consumer. Por otro, conviene señalar que el repositorio presenta señales claras de baja adopción (50 descargas, 0 likes, sin datos de benchmarks ni licencia declarada en la información disponible), por lo que debe tratarse como un artefacto a validar antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita en la información proporcionada; el modelo base pertenece a la familia Ministral 8B de Mistral AI (transformer decoder-only) |
| Parametros totales | 8.019.808.256 (8,02B) |
| Parametros activos | No aplica / no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible en la model card; la familia Ministral 8B declara 128.000 tokens, pero no se confirma para este fine-tune |
| Tipos de cuantizacion | GGUF estáticas: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16. Sin cuantizaciones ponderadas ni imatrix |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | GGUF (12 ficheros); el repositorio base se distribuye vía `transformers` |
| Tamano del repositorio | 71,8 GB |
| Cuantizacion por defecto recomendada | Q4_K_M (5,0 GB) según las notas del autor ("fast, recommended") |
| Fecha de creacion / actualizacion | 2025-02-09 / 2026-10-24 |
| Descargas / likes | 50 / 0 |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna, el proceso de entrenamiento ni la composición del dataset del modelo base `swdq/Ministral-8B-maker-v2`. Lo único verificable es que se trata de un fine-tune derivado de Ministral 8B, el modelo denso de 8B parámetros de Mistral AI, y que el autor de las cuantizaciones no aporta detalles sobre el ajuste realizado ni sobre posibles fases de RLHF, DPO o SFT. Tampoco se especifica si el fine-tune introduce cambios en el tokenizador, en el chat template o en la ventana de contexto.

El proceso aplicado en este repositorio es exclusivamente de cuantización: según los metadatos de la model card, se usa `quantize_version: 2`, `convert_type: hf` y `output_tensor_quantised: 1`, es decir, conversión desde pesos Hugging Face y cuantización estática de tensores sin matrices de importancia. El autor indica explícitamente que no hay planes confirmados de publicar variantes imatrix, lo que implica que las cuantizaciones de 2 a 4 bits pierden más calidad de la que se obtendría con recetas ponderadas equivalentes.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Ejecución local en CPU y GPU mediante el ecosistema GGUF (llama.cpp, Ollama, LM Studio, entre otros).
- Despliegue con huella de memoria reducida: la variante Q2_K ocupa 3,3 GB y cabe en sistemas con 8 GB de RAM o VRAM.
- Soporte de conversaciones multi-turno sujeto al chat template heredado del modelo base (no documentado en la información disponible).
- Tool calling / function calling: no documentado para este fine-tune. La familia Ministral 8B lo soporta, pero no se puede asumir que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: limitado a inglés según la model card; no se declaran otros idiomas.
- Visión, audio o modo "thinking": no disponibles.

## Casos de uso

- **Prototipado local de asistentes conversacionales en inglés**: la variante Q4_K_M (5,0 GB) permite levantar un endpoint compatible con OpenAI en una estación de trabajo con una RTX 3060 o superior, útil para validar prompts y flujos antes de pasar a un modelo mayor en la nube.
- **Evaluación comparativa de fine-tunes**: al existir el modelo base en formato `transformers` y esta versión GGUF, se puede medir la degradación introducida por cada nivel de cuantización sobre el mismo conjunto de prompts, algo habitual antes de fijar una variante para producción.
- **Procesamiento de texto con requisitos de privacidad**: al ejecutarse íntegramente en local, encaja en flujos donde el texto no puede salir de la infraestructura propia, como borradores internos o clasificación de documentos en inglés.
- **Generación de texto por lotes en CPU**: con Q3_K_S (3,8 GB) o IQ4_XS (4,6 GB) se puede ejecutar en servidores sin GPU para tareas de resumen o reescritura de baja criticidad, aceptando un throughput reducido.
- **Base para nuevos fine-tunes**: los pesos del repositorio base en `transformers` permiten reajustar el modelo con LoRA y volver a cuantizar después, sin partir de los GGUF.
- **Pruebas de integración en pipelines de CI**: un GGUF pequeño (Q2_K o Q3_K_S) sirve como modelo de sustitución en tests automatizados de aplicaciones que consumen una API de chat, evitando costes de inferencia remota.
- **Demostraciones en hardware de gama baja**: la variante Q2_K (3,3 GB) cabe en equipos con 8 GB de RAM, lo que permite demos offline en portátiles sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se aportan evaluaciones del modelo base `swdq/Ministral-8B-maker-v2`.

El único dato externo localizado en la búsqueda web es un índice agregado de BenchLeader para Ministral 8B de Mistral AI (37,9), que corresponde al modelo original del fabricante y no permite inferir el rendimiento de este fine-tune ni el de sus cuantizaciones. Cualquier cifra de rendimiento para este repositorio concreto requeriría una evaluación propia.

## Requisitos de hardware

- **VRAM estimada (pesos + overhead de contexto corto)**: Q2_K ~3,3 GB de pesos, en torno a 4 GB en ejecución; Q3_K_S ~3,8 GB; IQ4_XS ~4,6 GB; Q4_K_S ~4,8 GB; Q4_K_M ~5,0 GB (aproximadamente 5,7 GB de VRAM con contexto corto, según estimaciones publicadas para Ministral 8B); Q5_K_M ~5,8 GB; Q6_K ~6,7 GB; Q8_0 ~8,6 GB (aproximadamente 9,6 GB de VRAM); f16 ~16,1 GB (aproximadamente 17,6 GB de VRAM).
- **GPU consumer**: Q4_K_M cabe en una RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070; Q8_0 requiere 12 GB o más; f16 necesita 24 GB (RTX 3090, RTX 4090) o reparto entre GPU y CPU.
- **GPU de datacenter**: A100 40/80 GB, H100 o L40S para servirlas en FP16 con contexto largo y concurrencia; para cuantizaciones Q4 basta una L4 o T4 con 16 GB.
- **CPU y RAM**: las variantes Q2_K a Q4_K_M son viables en CPU con 8-16 GB de RAM; el rendimiento cae de forma aproximadamente lineal con el tamaño del modelo y depende del soporte de instrucciones vectoriales (AVX2, AVX-512, NEON).
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores con backend GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que para esos motores habría que partir del modelo base en safetensors.
- **Latencia y throughput**: no disponibles en la información proporcionada. Como referencia cualitativa, el autor marca Q4_K_S y Q4_K_M como "fast" y Q8_0 como "fast, best quality", sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Ministral-8B-maker-v2 (este repo, GGUF) | 8,02B | No disponible | No disponible | GGUF, 12 cuantizaciones estáticas | Fine-tune sin benchmarks ni licencia declarada; 50 descargas |
| Ministral 8B Instruct (Mistral AI) | 8B | 128.000 tokens (según documentación del fabricante) | Mistral Research / comercial sujeta a términos | Pesos originales, GGUF de terceros, API | Modelo de referencia de la familia; permite function calling |
| Llama 3.1 8B Instruct (Meta) | 8,03B | 128.000 tokens | Llama 3.1 Community License | Safetensors, GGUF, amplio ecosistema | Comunidad y herramientas muy extendidas |
| Qwen2.5 7B Instruct (Alibaba) | 7,6B | 128.000 tokens (con YaRN; 32.768 nativos) | Apache 2.0 | Safetensors, GGUF, AWQ, GPTQ | Licencia permisiva y buen rendimiento en código y matemáticas |

Nota: los datos de los modelos comparables provienen de la documentación pública de sus fabricantes y no forman parte de la información proporcionada para esta ficha; conviene verificarlos antes de citarlos. Para el modelo de este repositorio, la licencia y el contexto figuran como "no disponible" porque la model card no los declara.

## Limitaciones y advertencias

- **Licencia no declarada**: la model card no especifica licencia. Sin ese dato no se puede confirmar el uso comercial, y al ser un derivado de Ministral 8B habría que verificar además los términos del modelo original de Mistral AI y del fine-tune intermedio `swdq/Ministral-8B-maker-v2`.
- **Sin benchmarks ni evaluación**: no hay métricas publicadas. El rendimiento real y la calidad del fine-tune son desconocidos.
- **Riesgo de alucinación**: inherente a los modelos de 8B; sin evaluación específica no se puede acotar su magnitud en este ajuste.
- **Solo inglés**: la model card declara únicamente `en`. El rendimiento en castellano no está garantizado y probablemente sea deficiente.
- **Cuantizaciones estáticas sin imatrix**: las variantes de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M) presentan degradación notable; el propio autor marca Q3_K_M como "lower quality".
- **Baja adopción y trazabilidad limitada**: 50 descargas y 0 likes, sin documentación sobre el dataset de ajuste, el proceso de entrenamiento ni posibles sesgos. No hay garantía de mantenimiento del repositorio.
- **Contexto incierto**: no se confirma la ventana de 128.000 tokens de la familia Ministral; usar contextos largos sin verificación previa puede provocar degradación o errores.
- **Tool calling no verificado**: aunque la familia base lo soporta, el fine-tune podría haberlo degradado. Requiere prueba explícita antes de integrarlo en un agente.
- **Formato GGUF únicamente**: no apto para motores que solo aceptan safetensors (vLLM, TGI) sin reconvertir desde el modelo base.
- **Repo de 71,8 GB**: la descarga completa es costosa; conviene bajar solo la cuantización necesaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Ministral-8B-maker-v2-GGUF
- Modelo base (fine-tune): https://huggingface.co/swdq/Ministral-8B-maker-v2
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Ministral-8B-maker-v2-GGUF
- Guía de uso de GGUF citada por el autor (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Otra cuantización del mismo autor sobre Ministral 8B: https://huggingface.co/mradermacher/ministral-8b-abliterated-GGUF
- Referencia de benchmarks de Ministral 8B (BenchLeader): https://www.benchleader.com/models/ministral-8b
- Referencia de VRAM y tamaños GGUF de Ministral 8B (LightPhon): https://lightphon.com/models/ministral-8b
- Espejo del repositorio en ModelHub: https://dev.modelhub.org.cn/mradermacher/Ministral-8B-maker-v2-GGUF
