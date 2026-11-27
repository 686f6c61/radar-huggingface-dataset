# mradermacher/Tenet-30B-A3B-GLM4.7-Unslop-v3-GGUF

## Resumen

Tenet-30B-A3B-GLM4.7-Unslop-v3-GGUF es la distribucion en formato GGUF del modelo Tenet-30B-A3B-GLM4.7-Unslop-v3, un modelo conversacional de tipo Mixture of Experts (MoE) con 31.221.488.576 parametros totales (segun los tensores safetensors del repositorio original) y aproximadamente 3.000 millones de parametros activos por token, a juzgar por la nomenclatura "A3B" del identificador. El autor de esta conversion a GGUF es mradermacher, un perfil conocido por publicar cuantizaciones estaticas de modelos de terceros; el modelo base original pertenece a mr-andrey-isachenko.

El modelo se posiciona como un ajuste fino de tipo "Unslop" sobre una base GLM-4.7, es decir, un proceso de refinamiento orientado a reducir respuestas excesivamente formateadas, evasivas o con estilo de asistente generico. La nomenclatura "Tenet" sugiere una variante o fork del linaje GLM, aunque la model card publicada no documenta la procedencia exacta de los pesos ni los datos de entrenamiento.

La relevancia practica de esta ficha radica en que el repositorio GGUF permite ejecutar el modelo en infraestructura local mediante llama.cpp u Ollama, sin necesidad de GPUs de centro de datos. No obstante, la informacion publica disponible es muy limitada: no hay licencia declarada, no hay idiomas documentados, no hay benchmarks y el repositorio acumula cero descargas y cero likes en el momento de la consulta, lo que indica una publicacion muy reciente (27 de noviembre de 2026) y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, derivada de GLM-4.7 (detalles no disponibles) |
| Parametros totales | 31.221.488.576 |
| Parametros activos | Aproximadamente 3.000 millones (inferido de la nomenclatura "A3B"; no confirmado en la model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas con convert_type hf y quantize_version 2) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos (MoE), heredada del linaje GLM-4.7 segun el nombre del modelo. El recuento de 31.221 millones de parametros totales con una designacion "A3B" implica que solo una fraccion reducida de expertos se activa por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. No se dispone de informacion sobre el numero de expertos, el numero de expertos activados por token, la dimension del estado oculto ni el mecanismo de atencion (si es atencion completa, atencion lineal o una variante hibrida).

Respecto al entrenamiento, la model card no documenta el volumen de tokens, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. El sufijo "Unslop" indica un ajuste fino orientado a eliminar comportamientos de "slop" (respuestas verbose, plantillas excesivas, disclaimers innecesarios), pero no se especifican los datos ni la metodologia empleados. El repositorio es exclusivamente una conversion a GGUF del modelo original de mr-andrey-isachenko, sin entrenamiento adicional por parte de mradermacher.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repositorio.
- Razonamiento y respuesta a instrucciones, heredado de la base GLM-4.7 (no verificado con benchmarks).
- Posible soporte de tool calling y function calling, habitual en la familia GLM, aunque no confirmado en la informacion disponible.
- Capacidades multilingues no documentadas; no se puede confirmar cobertura de idiomas distintos del ingles o el chino.
- No se documentan capacidades de vision, audio, thinking mode explicito ni decodificacion especulativa.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que sugiere que puede servirse mediante infraestructura de inferencia estandar.

## Casos de uso

- Despliegue local en estaciones de trabajo: al estar en formato GGUF con cuantizaciones desde Q2_K hasta Q8_0, el modelo puede ejecutarse con llama.cpp u Ollama en equipos con GPU consumer, aprovechando la activacion parcial de expertos para reducir requisitos de VRAM frente a un modelo denso de 31B.
- Prototipado de asistentes conversacionales: la naturaleza MoE y la etiqueta "conversational" lo hacen adecuado para iterar rapidamente en dialogos multi-turno sin incurrir en costes de API, aunque la ausencia de benchmarks obliga a validar la calidad antes de produccion.
- Sustitucion de modelos densos en pipelines con restricciones de memoria: con cuantizaciones Q4_K_M o IQ4_XS, el modelo puede caber en GPUs de 24 GB, permitiendo ejecutar un modelo de 31B totales en hardware de gama alta consumer.
- Experimentacion con ajustes finos "Unslop": util para investigadores que quieran comparar el comportamiento de un modelo refinado para reducir respuestas plantilladas frente a su base GLM-4.7 original.
- Servicio de inferencia autoalojado: mediante llama.cpp server o vLLM (si soporta la arquitectura GLM MoE), se puede exponer una API compatible con OpenAI para integraciones internas.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye doce variantes de cuantizacion, lo que permite medir el compromiso entre calidad y memoria en un mismo modelo, un caso util para equipos que calibran presupuestos de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (31.221 millones de parametros totales, aunque solo ~3B activos):
  - Q2_K: aproximadamente 11-12 GB.
  - Q4_K_M: aproximadamente 18-19 GB.
  - Q8_0: aproximadamente 33-34 GB.
  - x-f16: aproximadamente 62 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o inferiores; A100 40 GB o H100 para Q8_0 y f16; multiples GPUs consumer para f16.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o IQ4_XS y posible offload parcial a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (tras importar el GGUF), LM Studio y servidores compatibles con llama.cpp. vLLM y TGI requeririan soporte especifico de la arquitectura GLM MoE, no confirmado.
- Latencia y throughput estimados: no disponibles. Al ser MoE con ~3B activos, el throughput deberia ser sustancialmente mayor que un denso de 31B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Tenet-30B-A3B-GLM4.7-Unslop-v3 | 31,2B | ~3B (inferido) | No disponible | No disponible | GGUF |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32K-128K (segun variante) | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| GLM-4-9B | 9,4B | denso | 128K | GLM-4 license | safetensors, GGUF |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a parametros, contexto y licencia. Qwen3-30B-A3B es el competidor mas directo por tamano y ratio de activacion, con la ventaja de una licencia Apache 2.0 explicita y benchmarks publicados.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es un riesgo critico para produccion.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni tareas conversacionales.
- Cero descargas y cero likes: el repositorio no ha sido validado por la comunidad; posibles errores en la conversion o en los tensores no estan descartados.
- Idiomas no documentados: no se puede garantizar un rendimiento aceptable en castellano.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la falta de evaluacion publicada.
- La designacion "A3B" y la procedencia GLM-4.7 son inferencias a partir del nombre, no datos confirmados en la model card.
- El ajuste "Unslop" puede reducir la verbosidad pero tambien incrementar respuestas directas sin matices, con riesgo en dominios sensibles.
- El repositorio pesa 151,8 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo GGUF necesario.
- No se documenta el contexto maximo soportado, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tenet-30B-A3B-GLM4.7-Unslop-v3-GGUF
- Modelo base original: https://huggingface.co/mr-andrey-isachenko/Tenet-30B-A3B-GLM4.7-Unslop-v3
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
