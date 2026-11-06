# mradermacher/Llama-3.1-Swallow-8B-Instruct-v0.5-tooled-GGUF

## Resumen

Llama-3.1-Swallow-8B-Instruct-v0.5-tooled-GGUF es una distribucion de cuantizaciones GGUF del modelo vericava/Llama-3.1-Swallow-8B-Instruct-v0.5-tooled, publicada por mradermacher. El modelo base combina la arquitectura Llama 3.1 de 8.030.261.312 parametros con el ajuste de instrucciones y el entrenamiento en tool calling que caracteriza a la familia Swallow, desarrollada por el Barcelona Supercomputing Center (BSC) como parte de su esfuerzo por modelos abiertos en lenguas europeas. Esta version concreta ha sido ademas afinada para uso con herramientas (tool calling), lo que la orienta a flujos de agentes y function calling.

El repositorio no aporta pesos nuevos: mradermacher actua como cuantizador, generando 12 variantes GGUF estaticas (desde Q2_K hasta f16) a partir del modelo original en transformers. El interes practico esta en que permite ejecutar un modelo de 8B con contexto nativo de 128.000 tokens en hardware de consumo mediante llama.cpp, Ollama o motores compatibles con GGUF, sin necesidad de GPUs de datacenter.

La relevancia actual es doble: por un lado, ofrece una via sencilla para desplegar un modelo afinado para tool calling en local; por otro, su naturaleza de derivado (cuantizacion de un fine-tune de un fine-tune) implica que las garantias de calidad y licencia dependen del modelo base original, no de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1, con ajuste Swallow) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1; no confirmada en la model card del repositorio) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun la model card; el modelo base Swallow esta orientado a lenguas europeas, pero no se documenta en este repositorio) |
| Licencia | no disponible |
| Formato de pesos | GGUF (12 ficheros, de 3,3 GB a 16,2 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de 8B parametros basado en Llama 3.1, con el ajuste de instrucciones de la familia Swallow del BSC. Sobre esa base, el autor vericava aplico un fine-tune adicional orientado a tool calling, del que no se documentan en este repositorio ni el volumen de datos, ni la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detalla si el ajuste incluyo decodificacion especulativa, atencion lineal u otras optimizaciones.

La aportacion de mradermacher es exclusivamente de cuantizacion: segun la model card, se generaron cuantizaciones estaticas (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1) y no se han publicado cuantizaciones ponderadas con imatrix en el momento de la ficha. Las variantes IQ4_XS y Q4_K_S/Q4_K_M son las recomendadas por tamano y velocidad; Q6_K y Q8_0 preservan mejor la calidad a costa de mayor huella de memoria.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat Instruct.
- Tool calling / function calling: el sufijo "tooled" del modelo base indica un ajuste especifico para invocar herramientas.
- Razonamiento multi-turno y seguimiento de instrucciones, heredado del ajuste Instruct de Swallow.
- Contexto largo de hasta 128.000 tokens (segun Llama 3.1; verificar en el modelo base antes de asumirlo en produccion).
- Compatibilidad con endpoints y motores que aceptan GGUF (llama.cpp, Ollama, LM Studio, servidores OpenAI-compatible).
- Capacidades multilingues: la model card declara solo "en"; no se documenta soporte de castellano ni de otras lenguas europeas en este repositorio, aunque el modelo base Swallow se diseno con ese objetivo.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Agentes locales con tool calling: el ajuste "tooled" permite definir funciones (APIs, bases de datos, shell) y que el modelo emita llamadas estructuradas; con Q4_K_M en 5 GB cabe en una GPU de consumo y se puede orquestar con llama.cpp o un servidor compatible con la API de OpenAI.
- Asistente de codigo en el IDE: 8B parametros y contexto largo permiten mantener varios ficheros en el prompt; la cuantizacion Q5_K_M o Q6_K ofrece un equilibrio razonable entre calidad y latencia en una RTX 4090.
- Automatizacion de soporte tecnico en ingles: conversaciones multi-turno con historial extenso aprovechando la ventana de 128k tokens, desplegado en Ollama para prototipos o en vLLM (si se convierte a safetensors) para produccion.
- Pipelines de extraccion de datos estructurados: uso de function calling para forzar salidas JSON validadas contra un esquema, con Q8_0 para minimizar degradacion por cuantizacion.
- Prototipado offline en portatil: la variante Q2_K (3,3 GB) o IQ4_XS (4,6 GB) permite ejecutar el modelo sin GPU dedicada, util para demos y pruebas de concepto en entornos sin conectividad.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes del mismo modelo, lo que facilita medir el impacto de la cuantizacion en tareas de tool calling antes de fijar una version para produccion.
- Fine-tuning posterior sobre GGUF no es directo; para adaptaciones adicionales conviene partir del modelo base en safetensors y volver a cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio solo incluye una grafica comparativa de perplejidad entre tipos de cuantizacion (enlace externo a nethype.de), sin valores numericos de MMLU, HumanEval, GSM8K ni de evaluaciones de tool calling.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, incluye overhead de contexto corto):
  - Q2_K: ~4 GB
  - Q3_K_M: ~5 GB
  - IQ4_XS: ~5,5 GB
  - Q4_K_M: ~6 GB
  - Q5_K_M: ~7 GB
  - Q6_K: ~8 GB
  - Q8_0: ~10 GB
  - f16: ~17 GB
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M/Q5_K_M con contexto moderado; RTX 4090 o A100/H100 para contexto largo (128k) o f16.
- Cabe en GPU de consumo: si, desde Q2_K hasta Q8_0 en tarjetas de 12-16 GB; f16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI basados en llama.cpp; vLLM y TGI no aceptan GGUF directamente, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, Q4_K_S y Q4_K_M estan marcados como "fast, recommended" en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3.1-Swallow-8B-Instruct-v0.5-tooled (este, GGUF) | 8,03B | 128k (heredado) | Si (fine-tune) | no disponible | GGUF |
| Llama-3.1-8B-Instruct (Meta) | 8,03B | 128k | Si (nativo) | Llama 3.1 Community License | safetensors, GGUF |
| Qwen2.5-7B-Instruct | 7,6B | 128k | Si | Apache 2.0 | safetensors, GGUF |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32k | Si | Apache 2.0 | safetensors, GGUF |

La comparativa con modelos de la misma categoria (8B, orientados a instrucciones y tool calling) muestra que este derivado compite directamente con Llama 3.1 8B Instruct y Qwen2.5 7B Instruct. La ventaja diferencial es el ajuste especifico de tool calling de Swallow; la desventaja es la ausencia de licencia declarada en este repositorio y la falta de benchmarks publicados que respalden la mejora.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio: antes de uso comercial hay que verificar la licencia del modelo base (vericava/Llama-3.1-Swallow-8B-Instruct-v0.5-tooled) y, en ultima instancia, la de Llama 3.1 de Meta, que impone restricciones de uso.
- Modelo derivado de un fine-tune de un fine-tune: la calidad del tool calling depende del ajuste de vericava, del que no se documentan datos de entrenamiento ni evaluaciones.
- Riesgo de alucinacion inherente a modelos de 8B, especialmente en tool calling con esquemas complejos o argumentos anidados.
- Idioma: la model card declara unicamente ingles; no hay evidencia en este repositorio de buen rendimiento en castellano pese al origen europeo de Swallow.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad y son desaconsejables para produccion; la propia model card marca Q3_K_M como "lower quality".
- No hay cuantizaciones imatrix publicadas por el autor en el momento de la ficha, lo que limita la calidad en tamanos pequenos frente a alternativas ponderadas.
- El contexto de 128k no esta confirmado en la model card de este repositorio; conviene validarlo empiricamente antes de disenar flujos que dependan de el.
- Sin benchmarks publicados: no se puede afirmar superioridad frente a Llama 3.1 8B Instruct o Qwen2.5 7B Instruct en tareas concretas sin evaluacion propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Llama-3.1-Swallow-8B-Instruct-v0.5-tooled-GGUF
- Modelo base: https://huggingface.co/vericava/Llama-3.1-Swallow-8B-Instruct-v0.5-tooled
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Llama-3.1-Swallow-8B-Instruct-v0.5-tooled-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
