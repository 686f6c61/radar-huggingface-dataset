# intel-ai/GLM-5.2-MXFP4-CT-AutoRound

## Resumen

GLM-5.2-MXFP4-CT-AutoRound es una version cuantizada del modelo zai-org/GLM-5.2, publicada por el equipo de Intel AI mediante su herramienta AutoRound. Se trata de una cuantizacion MXFP4 aplicada exclusivamente a los expertos enrutados de la arquitectura MoE, mientras que el router, los embeddings y el lm_head se mantienen en BF16. El resultado es un checkpoint de 753.329.940.480 parametros (unos 753 mil millones) con pesos en formato safetensors y compressed-tensors, distribuido bajo licencia MIT.

La relevancia de esta ficha radica en que permite desplegar un modelo de escala frontera con una reduccion significativa del coste de memoria respecto al checkpoint original en BF16, manteniendo segun la model card una recuperacion media del 99,42 % en los benchmarks evaluados (GSM8K, MMLU, PIQA y HellaSwag). La cuantizacion se realizo con Round-To-Nearest (RTN) sobre el esquema MXFP4, un formato de coma flotante de 4 bits por bloque pensado para aceleracion en hardware moderno.

El modelo esta orientado a generacion de texto conversacional y soporta tool calling y parsing de razonamiento a traves de vLLM 0.29.0, con parsers especificos (`glm47` para tool calls y `glm45` para reasoning). No se dispone de informacion sobre la longitud de contexto, los idiomas soportados ni los datos de entrenamiento del modelo base en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (Mixture of Experts con atencion DSA), transformer |
| Parametros totales | 753.329.940.480 (753,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 en expertos enrutados; BF16 en router, embeddings y lm_head |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con compressed-tensors (esquema MXFP4) |

## Arquitectura y entrenamiento

El checkpoint deriva de zai-org/GLM-5.2, un modelo de arquitectura MoE identificada en los tags como `glm_moe_dsa`. La cuantizacion afecta solo a las capas `mlp.experts`, es decir, a los expertos enrutados del bloque MoE, que se almacenan en MXFP4 (bloques de 4 bits en coma flotante). El router, los embeddings y el lm_head permanecen en BF16 para preservar la precision en las decisiones de enrutamiento y en la proyeccion final de vocabulario. La generacion se realizo con AutoRound en modo `model_free` y esquema base BF16 con `layer_config` especifico para los expertos, usando Round-To-Nearest en lugar de la optimizacion por descenso de gradiente con signo que da nombre a la herramienta.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base utilizo RLHF, DPO u otras tecnicas de alineamiento. La unica innovacion tecnica documentada es el propio pipeline de cuantizacion MXFP4 por capas con AutoRound, que permite reducir el peso de los expertos manteniendo casi intacta la calidad en las tareas evaluadas.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline `text-generation` y la etiqueta `conversational`.
- Razonamiento con modo explicito de pensamiento, soportado por el parser `glm45` en vLLM.
- Tool calling y function calling, con parser dedicado `glm47` y flag `--enable-auto-tool-choice`.
- Integracion con vLLM 0.29.0 para servir el modelo como endpoint compatible con la API de OpenAI (`endpoints_compatible`).
- Cuantizacion MXFP4 en expertos que reduce el footprint de memoria frente a BF16.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia a gran escala con vLLM: el modelo puede desplegarse con `vllm serve` usando KV cache en `fp8_e4m3`, lo que reduce la memoria de la cache y permite atender mas peticiones concurrentes sobre el mismo hardware.
- Agentes con tool calling: gracias al parser `glm47` y a `--enable-auto-tool-choice`, el modelo puede invocar funciones externas en flujos de agente, por ejemplo para consultar APIs, bases de datos o servicios internos en pipelines automatizados.
- Razonamiento multi-paso con trazas: el parser `glm45` permite separar el razonamiento interno de la respuesta final, util en asistentes tecnicos que necesitan auditar el proceso de decision.
- Atencion al cliente automatizada: el formato conversacional y el soporte de tool calling permiten construir asistentes que consultan sistemas de ticketing o CRM y mantienen conversaciones multi-turno; la longitud de contexto concreta no esta documentada.
- Generacion de codigo asistida en IDE o CI/CD: el modelo puede integrarse como backend de autocompletado o revision de parches mediante un endpoint compatible con OpenAI, aprovechando la cuantizacion para reducir coste por token.
- Evaluacion y experimentacion en investigacion: al estar bajo licencia MIT y en formato compressed-tensors, es adecuado para reproducir experimentos de cuantizacion y comparar MXFP4 frente a FP8 en el mismo modelo base.
- Despliegue en infraestructura Intel: AutoRound e Intel Neural Compressor forman parte del ecosistema de Intel, por lo que el checkpoint encaja en stacks de inferencia optimizados para CPU y aceleradores Intel.

## Benchmarks y rendimiento

Resultados publicados en la model card comparando FP8 frente a MXFP4:

| Benchmark | FP8 | MXFP4 | Recuperacion |
|---|---:|---:|---:|
| GSM8K | 94,39 | 94,62 | 100,24 % |
| MMLU | 87,11 | 86,71 | 99,54 % |
| PIQA | 84,49 | 83,73 | 99,10 % |
| HellaSwag | 73,98 | 72,93 | 98,58 % |
| Media | 84,99 | 84,50 | 99,42 % |

No se han publicado en la informacion disponible resultados de HumanEval, MMLU-Pro ni comparaciones directas con otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia: con 753,3 mil millones de parametros, incluso en MXFP4 el checkpoint ocupa aproximadamente 428 GB en disco (tamano del repo), por lo que la inferencia requiere agregados multi-GPU de alta capacidad; no se dispone de una cifra oficial de VRAM en la model card.
- GPU recomendadas: no disponible de forma explicita; por el volumen del checkpoint se necesitan nodos con varias GPU de memoria alta (por ejemplo, H100 o A100 de 80 GB) o aceleradores Intel compatibles con el stack de AutoRound.
- Cabe en GPU de consumo: no, el tamano del checkpoint (428 GB) excede la memoria de cualquier GPU de consumo individual.
- Opciones de despliegue: vLLM 0.29.0 es el unico runtime documentado en la model card; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.2-MXFP4-CT-AutoRound | 753,3 mil millones | no disponible | MXFP4 (expertos) + BF16 | MIT | Hugging Face |
| zai-org/GLM-5.2 (base) | no disponible en la informacion | no disponible | BF16 (original) | MIT | Hugging Face |
| Alternativas de escala comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo puede producir salidas factualmente incorrectas y no debe usarse como fuente de verdad, segun la propia model card.
- Riesgo de generar contenido soez, sesgado u ofensivo heredado del modelo base y de sus datasets de ajuste; se recomienda realizar pruebas de seguridad antes de desplegar.
- La cuantizacion MXFP4 introduce una perdida media del 0,58 % en los benchmarks evaluados, con mayor degradacion en HellaSwag (98,58 % de recuperacion).
- No se documentan los idiomas soportados ni la longitud de contexto, lo que limita la planificacion de despliegues multilingues o de contexto largo.
- La licencia MIT se hereda del modelo base, pero la model card advierte que no constituye asesoramiento legal y recomienda consultar a un abogado antes de un uso comercial.
- El unico runtime validado es vLLM 0.29.0 con flags especificos (`--kv-cache-dtype fp8_e4m3`, `--tool-call-parser glm47`, `--reasoning-parser glm45`); otros backends pueden no soportar el esquema compressed-tensors MXFP4.
- El checkpoint de 428 GB exige infraestructura multi-GPU de gama alta; no es viable en entornos de una sola GPU.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/GLM-5.2-MXFP4-CT-AutoRound
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- Repositorio AutoRound: https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
