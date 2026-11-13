# mradermacher/Qwen3.5-9B-Heretic-ARA-v2-GGUF

## Resumen

Qwen3.5-9B-Heretic-ARA-v2-GGUF es una distribucion de pesos en formato GGUF del modelo Qwen3.5-9B-Heretic-ARA-v2, publicado por el usuario mradermacher. El modelo base procede de NullpoLab y es un ajuste fino (fine-tune) sobre la familia Qwen3.5 de Alibaba, con aproximadamente 8.950 millones de parametros totales segun los datos de safetensors. El sufijo "Heretic" sugiere un ajuste orientado a eliminar o reducir el alineamiento y los rechazos del modelo original, aunque la model card no detalla el proceso.

El repositorio contiene unicamente cuantizaciones estaticas en formato GGUF generadas con llama.cpp, lo que permite ejecutar el modelo en CPU, GPU de consumo y entornos con memoria limitada mediante llama.cpp, Ollama o LM Studio. El tamano del repositorio es de 38,2 GB, coherente con la presencia de multiples variantes de cuantizacion (desde Q2_K hasta Q8_0 y F16).

La relevancia de esta ficha es acotada: se trata de una redistribucion de cuantizaciones, no de un modelo original, y el autor no publica informacion sobre licencia, idiomas, benchmarks ni detalles de entrenamiento. Cualquier evaluacion en produccion debe remitirse al modelo base de NullpoLab y, en ultima instancia, a la familia Qwen3.5 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; detalles no disponibles) |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye presumiblemente en safetensors |
| Tamano del repositorio | 38,2 GB |
| Pipeline | no disponible |
| Tags | gguf, endpoints_compatible, region:us, conversational |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por la nomenclatura (Qwen3.5-9B) se infiere una arquitectura transformer decoder-only de la familia Qwen3.5, con aproximadamente 8,95 mil millones de parametros, pero no se confirman detalles como el numero de capas, dimensiones ocultas, tipo de atencion (completa, GQA, sliding window) ni la funcion de activacion.

Tampoco se documenta el proceso de entrenamiento: no hay datos sobre volumen de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento. El termino "Heretic" en el nombre sugiere un ajuste fino orientado a reducir los rechazos y el alineamiento de seguridad del modelo original, pero esta interpretacion no esta confirmada por la model card. La unica informacion tecnica concreta es que las cuantizaciones se generaron con llama.cpp (se observan metadatos `quantize_version: 2` y `output_tensor_quantised: 1`) y que el tipo de conversion es `hf`.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` indica que el modelo esta orientado a dialogos multi-turno.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse mediante la infraestructura de Inference Endpoints de Hugging Face o APIs compatibles con OpenAI.
- Razonamiento y generacion de codigo: presumiblemente heredadas de la familia Qwen3.5, aunque no se documentan explicitamente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se listan idiomas).
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Ejecucion local en CPU y GPU de consumo gracias al formato GGUF.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU dedicada: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar el modelo en CPU con llama.cpp, adecuado para pruebas de concepto y desarrollo offline.
- Prototipado de asistentes conversacionales: el tag `conversational` y la ventana de contexto (no confirmada) permiten construir chatbots multi-turno en entornos controlados antes de migrar a un modelo con licencia clara.
- Evaluacion de variantes "uncensored": util para investigadores que estudian el efecto del ajuste fino sobre el alineamiento y los rechazos, comparando respuestas frente al modelo Qwen3.5 original.
- Generacion de texto en GPU de consumo: la variante Q4_K_S o IQ4_XS cabe en GPUs con 8-12 GB de VRAM, permitiendo inferencia local en tarjetas como RTX 3060/4060.
- Integracion en pipelines de CI/CD para pruebas de regresion de prompts: el formato GGUF y la compatibilidad con endpoints facilitan la automatizacion de evaluaciones.
- Fine-tuning posterior o destilacion: al disponer de F16 y Q8_0, se puede usar como base para experimentos de cuantizacion o como profesor en destilacion, siempre que la licencia lo permita (no confirmada).
- Despliegue en entornos air-gapped: al ser un artefacto autocontenido en GGUF, puede copiarse a maquinas sin acceso a internet para inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y 8,95 mil millones de parametros):
  - Q2_K: ~3,5-4 GB
  - Q3_K_M: ~4,5-5 GB
  - Q4_K_M: ~5,5-6 GB
  - Q5_K_M: ~6,5-7 GB
  - Q6_K: ~7,5-8 GB
  - Q8_0: ~9,5-10 GB
  - F16: ~18 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 para F16 o despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_M o inferiores; Q8_0 requiere 10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (llama-cpp-python, koboldcpp). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Heretic-ARA-v2-GGUF (este) | ~8,95 B | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| Qwen3.5-9B (familia base) | ~9 B | no disponible | presumiblemente Apache 2.0 (no confirmado) | safetensors | Hugging Face (Alibaba) |
| Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community License | safetensors, GGUF | Hugging Face (Meta) |
| Mistral 7B Instruct v0.3 | 7,24 B | 32 K | Apache 2.0 | safetensors, GGUF | Hugging Face (Mistral AI) |

La comparativa se limita a modelos de tamano similar porque no se dispone de datos de rendimiento del modelo evaluado. Las licencias de los modelos base Qwen3.5 no se confirman en la informacion proporcionada; verificar antes de uso comercial.

## Limitaciones y advertencias

- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribucion sin consultar el modelo base de NullpoLab y la licencia original de Qwen3.5.
- Ausencia de benchmarks: no hay evidencia publicada sobre calidad, razonamiento o seguridad del ajuste "Heretic".
- Riesgo de alucinacion: inherente a los modelos de ~9 B; sin datos de evaluacion no se puede acotar.
- Sesgos conocidos: no documentados; el ajuste "Heretic" podria reducir los filtros de seguridad y aumentar la probabilidad de contenido inapropiado o danino.
- Idiomas soportados no confirmados: no se puede asumir un rendimiento multilingue sin validacion.
- Longitud de contexto no confirmada: no se debe asumir la ventana de contexto de la familia Qwen3.5 sin verificar.
- Repositorio con 0 descargas y 1 like: sin validacion comunitaria; el artefacto no ha sido auditado por terceros.
- El autor (mradermacher) solo redistribuye cuantizaciones; la responsabilidad sobre el comportamiento del modelo recae en el modelo base.
- Fecha de creacion futura (2026-11-13): inconsistencia en los metadatos que conviene verificar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-9B-Heretic-ARA-v2-GGUF
- Modelo base (NullpoLab): https://huggingface.co/NullpoLab/Qwen3.5-9B-Heretic-ARA-v2
- Familia Qwen3.5 (Alibaba): no disponible en la informacion proporcionada
- Paper, blog o demo: no disponible en la informacion proporcionada
