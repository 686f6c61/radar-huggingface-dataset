# pranil00/ONIX-DeepSeek-V2-Chat-GGUF

## Resumen

ONIX-DeepSeek-V2-Chat-GGUF es una cuantizacion extrema del modelo DeepSeek-V2-Chat original de DeepSeek, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto en formato GGUF con cuantizacion IQ1_S, es decir, 1,56 bits por parametro, que reduce el peso de los pesos de 36,51 GB en FP16 a 3,56 GB, una compresion de 10,26x. El objetivo declarado es hacer ejecutable un modelo de gran tamano en hardware de consumo muy limitado, incluyendo portatiles con 8 GB de memoria unificada o GPUs de gama media.

El modelo base, DeepSeek-V2-Chat, es un transformer de tipo Mixture of Experts (MoE) desarrollado por DeepSeek, con 236.000 millones de parametros totales y 21.000 millones activos por token. Sin embargo, la model card del artefacto cuantizado declara 18.670 millones de parametros, una cifra que no coincide con la del modelo original y que debe tratarse con cautela. El contexto nativo del modelo base es de 128.000 tokens, aunque la model card de esta cuantizacion recomienda ventanas de 8.192 tokens en GPU y Apple Silicon, y 4.096 tokens en CPU.

La relevancia de esta ficha radica en su caracter de experimento de cuantizacion agresiva: permite ejecutar un modelo de la familia DeepSeek en equipos modestos, pero con una degradacion de calidad declarada del 40 % (retencion del 60 %). Es un artefacto adecuado para pruebas, prototipado y experimentacion, no para produccion con requisitos de razonamiento o codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base DeepSeek-V2-Chat); artefacto GGUF cuantizado |
| Parametros totales | 18.670 millones declarados en la model card (el modelo base original declara 236.000 millones totales y 21.000 millones activos) |
| Parametros activos | No disponible para el artefacto; el modelo base activa 21.000 millones por token |
| Longitud de contexto | 128.000 tokens en el modelo base; 8.192 tokens recomendados en GPU/Apple Silicon y 4.096 en CPU segun la model card |
| Tipos de cuantizacion | IQ1_S (1,56 bits por peso) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `deepseek-ai--DeepSeek-V2-Chat-IQ1_S.gguf`, 3,56 GB) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V2-Chat emplea una arquitectura transformer con Mixture of Experts y atencion Multi-head Latent Attention (MLA), disenada para reducir el coste del KV cache en contextos largos. DeepSeek entreno el modelo base desde cero sobre un corpus multilingue de gran escala y lo ajusto con tecnicas de alineacion (SFT y RLHF) para convertirlo en la variante Chat. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento ni de la composicion detallada del dataset.

El artefacto aqui descrito no es un modelo entrenado, sino una conversion cuantizada del anterior mediante la herramienta run-any-model. La cuantizacion IQ1_S reduce la precision de los pesos a 1,56 bits, lo que implica una perdida sustancial de informacion: la propia model card estima una retencion de calidad cognitiva del 60 %. El informe de telemetria del autor indica que se aceleran las 60 capas del modelo y que el KV cache se mantiene en FP16 (4.800 MB), lo que explica que el consumo total de memoria (8,34 GB) sea muy superior al tamano del fichero de pesos (3,56 GB).

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado `text-generation`.
- Extraccion de hechos y respuestas factuales basicas, segun la model card.
- Razonamiento de orden superior, compilacion de codigo y gramatica matizada: la model card advierte explicitamente de que pueden verse degradados por la cuantizacion extrema.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para el artefacto.
- Soporte de agentes y razonamiento multi-paso: no disponible; la degradacion declarada hace poco recomendable su uso en estos escenarios.
- Capacidades multilingues: no disponibles; el modelo base es multilingue, pero no se detallan idiomas para esta cuantizacion.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Pruebas de concepto en portatiles modestos: con 8,34 GB de memoria unificada en Apple Silicon o 5,06 GB de VRAM en GPU NVIDIA, permite experimentar con un modelo de la familia DeepSeek sin infraestructura dedicada.
- Prototipado de interfaces conversacionales: util para validar flujos de chat y diseno de prompts antes de migrar a una cuantizacion de mayor precision o al modelo original.
- Extraccion de informacion simple: la model card indica que conserva la extraccion factual basica, por lo que puede emplearse en tareas de clasificacion o resumen de textos cortos con validacion humana posterior.
- Educacion y divulgacion: sirve para demostrar en talleres como funciona la cuantizacion extrema y que compromisos de calidad implica, ejecutandose en hardware asequible.
- Despliegue en entornos con RAM limitada: con 10,34 GB de RAM libre en CPU (AVX2/AVX-512) y contexto de 4.096 tokens, puede ejecutarse en equipos sin GPU dedicada.
- Evaluacion comparativa de cuantizaciones: permite medir la perdida de calidad frente a IQ2, Q4 o FP16 del mismo modelo base, usando el mismo harness de evaluacion.
- No recomendado para generacion de codigo en produccion ni para razonamiento complejo, segun la propia advertencia de la model card.

## Benchmarks y rendimiento

La model card incluye un informe de telemetria del motor run-any-model, no benchmarks de calidad estandar (MMLU, HumanEval, GSM8K). Se reproduce a continuacion:

| Metrica | Baseline (FP16) | Cuantizado (IQ1_S) | Cambio |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 1,56 | -90,2 % |
| Tamano de pesos | 36,51 GB | 3,56 GB | -90,2 % |
| KV cache | 4.800 MB | 4.800 MB | Optimizado |
| RAM residente total | 41,29 GB | 8,34 GB | -79,8 % |
| Calidad estimada | 100 % | 60 % | -40 % |
| Capas aceleradas | 0 % (riesgo de fallo) | 60/60 | Optimo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 5,06 GB de VRAM dedicada en GPU NVIDIA RTX 30/40/50 con contexto de 8.192 tokens.
- Apple Silicon: 8,34 GB de memoria unificada (M1/M2/M3/M4/M5) con aceleracion Metal nativa.
- CPU: 10,34 GB de RAM libre con soporte AVX2/AVX-512 y contexto de 4.096 tokens.
- GPU recomendadas: no se especifican modelos concretos; la model card cita las series RTX 30/40/50. No hay datos para A100 o H100.
- Compatibilidad con GPU de consumo: si, en tarjetas con al menos 5,06 GB de VRAM.
- Opciones de despliegue: run-any-model (CLI), Ollama (mediante Modelfile), llama.cpp (`llama-cli`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles; la model card no publica tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-DeepSeek-V2-Chat-GGUF (IQ1_S) | 18,67 B declarados (base MoE 236 B totales / 21 B activos) | 8.192 recomendados | GGUF 1,56 bpw | Apache 2.0 | Calidad retenida estimada del 60 % |
| DeepSeek-V2-Chat (original) | 236 B totales / 21 B activos | 128.000 | Safetensors FP16/BF16 | DeepSeek License | Requiere ~41 GB de RAM en FP16 |
| Otras cuantizaciones GGUF del mismo modelo base | No disponible | No disponible | GGUF Q4/Q5/Q8 | Apache 2.0 | No se dispone de datos en la informacion proporcionada |

No se dispone de informacion sobre alternativas comparables de otros autores en la misma categoria de cuantizacion extrema para este modelo base.

## Limitaciones y advertencias

- Degradacion de calidad declarada: retencion estimada del 60 %, con perdida de logica de alto orden, compilacion de codigo y gramatica matizada.
- Riesgo elevado de alucinacion y de respuestas incoherentes por la cuantizacion a 1,56 bits por peso.
- Discrepancia en el numero de parametros: la model card declara 18,67 B, mientras que el modelo base DeepSeek-V2-Chat tiene 236 B totales; conviene verificar la integridad del artefacto antes de usarlo.
- Contexto efectivo reducido a 8.192 tokens en GPU y 4.096 en CPU, muy por debajo de los 128.000 tokens del modelo base.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue adecuado.
- Licencia Apache 2.0 declarada, pero el modelo base DeepSeek-V2-Chat tiene su propia licencia de DeepSeek; conviene revisar ambas antes de un uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni evidencia de calidad independiente.
- La model card incluye una clausula de exencion total de responsabilidad; el autor no asume responsabilidad por los outputs.
- No apto para produccion con requisitos de razonamiento, codigo o atencion al cliente sin supervision humana.

## Enlaces

- Hugging Face: https://huggingface.co/pranil00/ONIX-DeepSeek-V2-Chat-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V2-Chat
- Organizacion ONIX: https://huggingface.co/ONIX
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
