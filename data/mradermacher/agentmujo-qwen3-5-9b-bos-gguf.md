# mradermacher/agentmujo-qwen3.5-9b-bos-GGUF

## Resumen

`mradermacher/agentmujo-qwen3.5-9b-bos-GGUF` es una publicacion de cuantizaciones GGUF estaticas del modelo `renatoschust/agentmujo-qwen3.5-9b-bos`, un ajuste fino (LoRA) sobre una base Qwen 3.5 de 9B orientado a *function calling* y flujos agenticos en bosnio (`bs`). El autor de las cuantizaciones es mradermacher, conocido por producir versiones GGUF de modelos recientes para su uso con llama.cpp y derivados. El modelo original lo desarrolla renatoschust y se distribuye bajo licencia Apache 2.0.

El interes practico de esta ficha esta en la combinacion de tres factores: un tamano de 8.953.803.264 parametros (unos 9B) que cabe en GPUs de consumo con cuantizacion Q4, una orientacion explicita a *tool calling* y razonamiento agentico, y un enfasis en bosnio, una lengua de bajos recursos dentro del ecosistema de modelos abiertos. La ventana de contexto, la composicion del dataset de entrenamiento y los detalles del ajuste LoRA no estan documentados en la informacion disponible.

Las cuantizaciones publicadas cubren desde Q2_K (3,9 GB) hasta f16 (18,0 GB), lo que permite desplegar el modelo desde equipos con 6 GB de VRAM hasta servidores con GPUs profesionales. No se han publicado resultados de benchmarks ni metricas de rendimiento en la informacion disponible, por lo que la evaluacion debe hacerse de forma empirica antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen 3.5; detalles no disponibles) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q4_K_S, Q6_K, Q8_0, f16 (estaticas; sin imatrix) |
| Idiomas soportados | Bosnio (`bs`); capacidades multilingues del modelo base no documentadas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en safetensors via transformers |
| Modelo base | renatoschust/agentmujo-qwen3.5-9b-bos |
| Tipo de ajuste | LoRA sobre base Qwen 3.5 9B |
| Tamano del repo | 48,6 GB |
| Libreria declarada | transformers |
| Fecha de publicacion | 2026-11-05 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de aproximadamente 8,95B de parametros, heredado de la familia Qwen 3.5, sobre el que se ha aplicado un ajuste fino mediante LoRA (segun las etiquetas del repositorio). El objetivo declarado del ajuste es el *function calling* y el comportamiento agentico, con atencion especifica al bosnio. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni hiperparametros del LoRA.

Las cuantizaciones de mradermacher son estaticas (sin *importance matrix*), generadas con `convert_type: hf` y `quantize_version: 2`. La model card indica que no hay planes confirmados para publicar variantes con imatrix; estas pueden solicitarse mediante una discusion en la comunidad. No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, modos de pensamiento) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en bosnio, con soporte declarado para dialogos multi-turno.
- *Function calling* / *tool calling*: capacidad destacada por las etiquetas del modelo (`function-calling`, `agentic`, `endpoints_compatible`).
- Razonamiento agentico y ejecucion de tareas multi-paso, orientado a integraciones con APIs y herramientas externas.
- Inferencia local via GGUF en llama.cpp y ecosistema compatible (Ollama, LM Studio, etc.).
- Capacidades de codigo y matematicas: no documentadas especificamente en la informacion disponible.
- Vision, audio y modos de pensamiento explicito: no disponibles.

## Casos de uso

- **Atencion al cliente en bosnio**: el modelo puede gestionar conversaciones multi-turno en lengua bosnia con un tono controlado, adecuado para su integracion en *chatbots* de soporte para mercados de Bosnia y Herzegovina y diaspora.
- **Agentes de automatizacion con herramientas**: gracias a su orientacion a *function calling*, puede conectarse a APIs internas (CRM, ERP, sistemas de tickets) y decidir que herramienta invocar en cada paso del flujo.
- **Asistentes de back-office con despliegue local**: al caber en GPUs de consumo en Q4_K_S (5,5 GB), permite montar asistentes internos sin enviar datos a la nube, util en entornos con requisitos de soberania del dato.
- **Prototipado rapido de pipelines agenticos**: la disponibilidad de GGUF en multiples tamanos permite iterar en local con Q2_K o Q4_K_S y escalar a Q8_0 o f16 en servidor para evaluacion de calidad.
- **Investigacion en lenguas de bajos recursos**: sirve como punto de partida para estudiar el rendimiento de modelos de 9B ajustados en bosnio frente a modelos multilingues genericos.
- **Extraccion estructurada de datos desde texto**: con salidas JSON y esquemas de herramientas, puede usarse para poblar bases de datos a partir de documentos no estructurados en bosnio.
- **Evaluacion comparativa de cuantizaciones**: el rango de quants publicados (Q2_K a f16) permite medir la degradacion de calidad en tareas de *tool calling* segun el nivel de compresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,9 GB
  - Q4_K_S: ~5,5 GB
  - Q6_K: ~7,5 GB
  - Q8_0: ~9,6 GB
  - f16: ~18,0 GB
- **GPU de consumo**: Q4_K_S cabe en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070); Q6_K y Q8_0 requieren 10-12 GB (RTX 3080, RTX 4070, RTX 4080); f16 requiere 24 GB (RTX 3090, RTX 4090).
- **GPU profesionales**: A100 40/80 GB, H100 y L40S permiten f16 con contexto amplio y mayor *throughput*; para produccion con Q8_0 basta una A10G o L4.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF (llamafile, koboldcpp). Para el modelo base en safetensors, transformers con aceleracion CUDA o ROCm (el autor etiqueta `rocm`).
- **Latencia y throughput**: no disponibles; dependen de la GPU, del backend y de la longitud de contexto efectiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Orientacion | Licencia | Formato |
|---|---|---|---|---|---|
| agentmujo-qwen3.5-9b-bos (este) | ~8,95B | no disponible | Function calling, bosnio | Apache 2.0 | GGUF, safetensors |
| Qwen 2.5 7B Instruct | ~7,6B | 128K (segun ficha oficial de Qwen) | Generico multilingue | Apache 2.0 | safetensors, GGUF |
| Llama 3.1 8B Instruct | ~8B | 128K | Generico multilingue | Llama 3.1 Community | safetensors, GGUF |
| Mistral 7B Instruct v0.3 | ~7,2B | 32K | Generico | Apache 2.0 | safetensors, GGUF |

La comparacion con Qwen 2.5 7B y Llama 3.1 8B es la mas directa por tamano y licencia permisiva; ambos ofrecen contexto documentado amplio y ecosistema maduro, mientras que este modelo declara especializacion en bosnio y *tool calling* pero carece de especificaciones publicas de contexto y benchmarks. Mistral 7B es una alternativa Apache 2.0 con menor contexto declarado.

## Limitaciones y advertencias

- **Sin benchmarks publicados**: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni en tareas de *tool calling*; la validacion debe ser empirica.
- **Contexto desconocido**: no se documenta la longitud de contexto, lo que impide planificar casos de uso con documentos largos o historiales extensos.
- **Idioma limitado**: el modelo declara solo bosnio (`bs`); su comportamiento en castellano, ingles u otras lenguas no esta garantizado y puede degradarse.
- **Riesgo de alucinacion**: inherente a los modelos de 9B, especialmente en llamadas a herramientas con parametros inventados; se recomienda validacion de esquemas y *guardrails* en produccion.
- **Cuantizaciones estaticas**: las versiones Q2_K y Q4_K_S pueden degradar la precision en tareas de *function calling*; para evaluacion de calidad conviene usar Q6_K o superiores.
- **Licencia Apache 2.0**: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen 3.5 y del ajuste original de renatoschust antes de redistribuir.
- **Modelo muy reciente y con traccion nula**: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en produccion ni comunidad que reporte incidencias.
- **Sin imatrix**: no hay cuants ponderados disponibles, lo que limita las opciones de optimizacion de calidad por tamano.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/agentmujo-qwen3.5-9b-bos-GGUF
- Modelo base: https://huggingface.co/renatoschust/agentmujo-qwen3.5-9b-bos
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#agentmujo-qwen3.5-9b-bos-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
