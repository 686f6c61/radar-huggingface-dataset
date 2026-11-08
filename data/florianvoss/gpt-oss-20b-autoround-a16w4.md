# florianvoss/gpt-oss-20b-Autoround-a16w4

## Resumen

GPT-OSS-20b-Autoround-a16w4 es un paquete compilado del modelo GPT-OSS 20B (arquitectura mixture-of-experts) preparado por el usuario florianvoss para su ejecución en el hardware de aceleración SiMa.ai Modalix. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos y compilación de un checkpoint previamente cuantizado con AutoRound (INT4 para los pesos del lenguaje, INT8 para routers y caché KV) a partir del checkpoint BF16 de Unsloth (unsloth/gpt-oss-20b-BF16). El resultado es un artefacto de despliegue específico de plataforma, no un modelo portable en formato Transformers.

El modelo base GPT-OSS 20B es un transformer MoE de 24 capas con 32 expertos por capa y cuatro expertos activados por token. Esta compilación limita la longitud de contexto a 4.096 tokens (incluyendo prompt y tokens generados) y restringe el uso a runtimes LLiMa sobre Modalix. El repositorio ocupa 26,4 GB e incluye 1.683 ejecutables ELF compilados, además de los ficheros de configuración de runtime, tokenizer, embeddings y attention sinks.

Su relevancia es acotada: sirve como ejemplo de flujo de despliegue de un MoE de 20B en un acelerador de borde, con métricas de rendimiento medidas en el dispositivo (TTFT de 0,64 s con 128 tokens de entrada y una tasa de generación en torno a 21,7 tokens/s). No obstante, el propio autor advierte que no se han realizado pruebas de generación, precisión ni rendimiento en Modalix para este paquete concreto, por lo que la calidad de salida en runtime no está validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, 24 capas, 32 expertos por capa, 4 expertos activos por token |
| Parametros totales | 20B (denominacion del modelo base gpt-oss-20b) |
| Parametros activos | no disponible (el modelo card no indica el recuento exacto de parametros activos) |
| Longitud de contexto | 4.096 tokens (prompt + generacion) |
| Tipos de cuantizacion | Pesos de lenguaje INT4 simetrico AutoRound (bloque 256); routers INT8 simetrico RTN por canal; cabeza de salida INT4 simetrico RTN (bloque 256); activaciones BF16; embeddings y cache KV INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (incluye LICENSE y USAGE_POLICY upstream) |
| Formato de pesos | Paquete compilado LLiMa (ELF + devkit), no compatible con Transformers |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos (MoE) de 24 capas, 32 expertos por capa y seleccion de cuatro expertos por token. Esta ficha no documenta el proceso de entrenamiento original del GPT-OSS 20B (numero de tokens, composicion del dataset, uso de RLHF o DPO), ya que la informacion disponible corresponde solo al proceso de cuantizacion y compilacion. El checkpoint de partida es unsloth/gpt-oss-20b-BF16.

La innovacion tecnica de este artefacto es el pipeline de compilacion: cuantizacion AutoRound para los pesos del lenguaje, RTN para routers y cabeza de salida, comparticion de filtros (filter sharing) para los componentes de lenguaje, ventana de atencion deslizante de 128 tokens y tamano de grupo de prefill de 128. La compilacion se realizo con Model SDK 3.0.0 y la revision de desarrollo de LLiMa b972c9ac35f93143a2baf88154454988074ca8d7, con 16 procesos de compilador y un hilo de simulador cada uno. Los 1.683 componentes compilaron con codigo de salida 0.

## Capacidades

- Generacion de texto autoregresiva sobre el modelo base GPT-OSS 20B, en el dominio de text-generation.
- Razonamiento y conocimiento general heredados del modelo base (no verificados en este paquete).
- Capacidad MoE con cuatro expertos activos por token, lo que reduce el coste computacional por token frente a un denso de 20B.
- Ejecucion en el acelerador SiMa.ai Modalix mediante el runtime LLiMa.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking para este paquete.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia de texto en el borde sobre Modalix: el paquete esta disenado para ejecutarse en el acelerador SiMa.ai Modalix con el runtime LLiMa, adecuado para despliegues donde no se dispone de GPU de datacenter.
- Prototipado de pipelines MoE cuantizados: sirve para validar el flujo de compilacion AutoRound + LLiMa antes de llevar un modelo a produccion en hardware Modalix.
- Generacion de texto con contexto moderado: con 4.096 tokens de ventana, encaja en tareas de resumen, respuesta a preguntas o redaccion de documentos cortos.
- Evaluacion comparativa de cuantizacion: permite medir el impacto de INT4/INT8 en la calidad frente al checkpoint BF16 de origen, aunque el autor no haya publicado esas mediciones.
- Despliegue en entornos con restricciones de memoria: la cuantizacion INT4 de pesos y la cache KV en INT8 reducen la huella frente al BF16, util en dispositivos de borde.
- Integracion en flujos de compilacion reproducibles: el repositorio incluye recipe.yaml, compilation.json y compile.sh, lo que facilita reconstruir el artefacto con los mismos checksums y revisiones de compilador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica explicitamente que no se han realizado pruebas de generacion, precision ni rendimiento en Modalix para este paquete.

Los unicos datos medidos son de rendimiento en Modalix, con MoLE, batch size 1, cuatro muestras por longitud de entrada y max_new_tokens=128 (medias aritmeticas):

| Tokens de entrada | TTFT medio (s) | Tasa de generacion (tokens/s) |
|---:|---:|---:|
| 128 | 0,64 | 21,72 |
| 256 | 1,19 | 21,71 |
| 512 | 2,29 | 21,55 |
| 1024 | 4,45 | 21,22 |
| 2048 | 8,89 | 19,94 |
| 3072 | 13,93 | 19,29 |

## Requisitos de hardware

- Hardware objetivo: acelerador SiMa.ai Modalix, no GPU convencional.
- Runtime: LLiMa con soporte de GPT-OSS/MoE y la configuracion compilada; se descarga el modelo descomprimido directamente en el dispositivo (por ejemplo, en /media/nvme/llima/models/).
- Tamano del repositorio: 26,4 GB, que incluye devkit y 1.683 ejecutables ELF.
- VRAM estimada en GPU: no disponible; el paquete no esta pensado para GPU y no puede cargarse con Transformers.
- Compatibilidad con consumer GPU (RTX 4090, etc.): no disponible; el artefacto es especifico de Modalix.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no soportadas por este paquete compilado.
- Latencia y throughput: TTFT entre 0,64 s y 13,93 s segun longitud de entrada; generacion de 19,29 a 21,72 tokens/s en las condiciones medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b-Autoround-a16w4 (este) | 20B (MoE) | 4.096 | Paquete compilado LLiMa para Modalix | Apache 2.0 | Hugging Face (0 descargas) |
| unsloth/gpt-oss-20b-BF16 (base) | 20B (MoE) | no disponible en la informacion | Safetensors BF16 | Apache 2.0 (heredada) | Hugging Face |
| GPT-OSS 20B original | 20B (MoE) | no disponible en la informacion | Pesos originales | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no puede cargarse con Transformers; requiere un runtime LLiMa compatible con GPT-OSS/MoE y la configuracion compilada en Modalix.
- No se han realizado pruebas de generacion, precision ni rendimiento en Modalix para este paquete; la compilacion correcta no garantiza la calidad de salida en runtime.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- El checkpoint prequantizado de origen es local y no esta disponible publicamente en el momento de la publicacion, lo que dificulta la recompilacion por terceros.
- No se registro la revision inmutable del BF16 original; solo se incluyen checksums de los ficheros prequantizados en compilation.json.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingue.
- Riesgo de sesgos y alucinaciones heredado del modelo base, no evaluado en este paquete.
- Licencia Apache 2.0 con USAGE_POLICY upstream incluida; conviene revisar dicha politica antes de uso comercial.
- Modelo con 0 descargas y 1 like en el momento de la consulta: ecosistema y soporte comunitario practicamente inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/florianvoss/gpt-oss-20b-Autoround-a16w4
- Modelo base BF16: https://huggingface.co/unsloth/gpt-oss-20b-BF16
