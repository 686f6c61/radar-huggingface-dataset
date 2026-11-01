# hipfire-models/raon-1-mini-preview

## Resumen

Raon-1-mini-preview es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado originalmente por KRAFTON y distribuido aqui en la version cuantizada MQ4 XTS por hipfire-models. Con 28.800 millones de parametros totales y 4.300 millones activos por token, el modelo esta disenado para cargas de razonamiento intensivo con un coste computacional por token relativamente bajo. La arquitectura combina atencion MLA (Multi-head Latent Attention) con proyecciones RDA gated-delta, residuales multi-stream mHC (4 flujos) y expertos con activacion SiTU.

El modelo se presenta como un sistema de razonamiento con modo "thinking" activado por defecto, soporte de tool calling mediante etiquetas XML `<tool_call>` y compatibilidad con los endpoints de OpenAI y Anthropic. Esta orientado a despliegues en hardware AMD ROCm, como demuestran las mediciones de rendimiento publicadas para RX 7900 XTX y Radeon AI PRO R9700.

La relevancia de esta ficha radica en que la version cuantizada reduce el peso del modelo a 17,70 GB (desde los 36,3 GB del repositorio original), permitiendo su ejecucion en GPUs de consumo con 20-24 GB de VRAM y manteniendo una divergencia KL baja respecto al profesor BF16. La licencia Apache-2.0 facilita el uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion MLA + RDA gated-delta, residuales multi-stream mHC (4 flujos), expertos SiTU |
| Parametros totales | 28.800 millones (28,8B) |
| Parametros activos | 4.300 millones (4,3B) por token |
| Longitud de contexto | 131.000 tokens (verificado en emulacion de 20 GB; no confirmado oficialmente en la model card) |
| Tipos de cuantizacion | MQ4V2 (qt 44) simetrico para expertos enrutados, compartidos y dense-MLP; Q8F16 para atencion (MLA, RDA, gates, factores LoRA) y `lm_head` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mq4-xts` (formato propietario de hipfire, 17,70 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 28,8B parametros totales y 4,3B activos. Incorpora atencion MLA (Multi-head Latent Attention), que comprime las claves y valores en un espacio latente para reducir el coste de memoria del KV cache, junto con proyecciones RDA gated-delta. Los residuales se organizan en 4 flujos paralelos (multi-stream mHC) y los expertos utilizan activacion SiTU. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La version distribuida por hipfire-models aplica una cuantizacion post-entrenamiento: MQ4V2 simetrica con alpha AWQ por grupo y refit de escalas GPTQ (XTS) para los expertos, y Q8F16 para las proyecciones de atencion y `lm_head`. La divergencia KL frente al profesor BF16 es de 0,081 en WikiText-2 (2048 secuencias x 24) y 0,0138 en un conjunto de codigo (512 x 24), frente a 0,102 y 0,019 respectivamente con cuantizacion RTN del mismo layout, lo que indica una mejora medible del calibrado.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo "thinking" activado por defecto (desactivable con `enable_thinking: false`).
- Razonamiento matematico y de codigo, con recomendacion de ajustar `presence_penalty` a 0 en tareas de codigo y matematicas.
- Tool calling mediante etiquetas XML `<tool_call>`.
- Compatibilidad con endpoints de OpenAI y Anthropic para integracion en pipelines existentes.
- Renderizado de prompts byte-identico a la plantilla de chat de referencia.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles.

## Casos de uso

- Razonamiento agentico multi-paso: el modelo puede encadenar llamadas a herramientas mediante `<tool_call>` y mantener el estado de la conversacion, adecuado para orquestadores de agentes que necesiten un modelo con modo thinking y bajo coste por token (4,3B activos).
- Asistencia de codigo en produccion: con `presence_penalty` a 0 y tool calling, puede integrarse en pipelines de CI/CD para revision de parches, generacion de tests o explicacion de errores de compilacion.
- Analisis de documentos largos: la ventana de contexto de hasta 131K tokens (verificada en emulacion de 20 GB) permite procesar informes extensos o bases de codigo completas en una sola pasada.
- Despliegue en estaciones de trabajo con GPU AMD: las mediciones en RX 7900 XTX (24 GB) y Radeon AI PRO R9700 (32 GB) lo hacen viable en entornos ROCm sin necesidad de GPUs de datacenter.
- Atencion al cliente con razonamiento: el modo thinking permite respuestas razonadas en conversaciones multi-turno, con la posibilidad de desactivarlo para reducir latencia en respuestas simples.
- Evaluacion e investigacion de tecnicas de cuantizacion: el formato MQ4 XTS y los datos de KLD publicados lo convierten en una referencia para estudiar el impacto de AWQ + GPTQ refit en modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos publicados son de divergencia KL y velocidad de inferencia.

Divergencia KL frente al profesor BF16:

| Conjunto | Este archivo (MQ4 XTS) | Mismo layout, RTN |
|---|---:|---:|
| WikiText-2 (2048 x 24) | 0,081 | 0,102 |
| Codigo (512 x 24) | 0,0138 | 0,019 |

Rendimiento en tokens por segundo (mediana de 3 procesos x 3 repeticiones, protocolo raon-bench):

| Tarjeta | pp512 | pp2048 | pp8192 | pp16384 | tg128 |
|---|---:|---:|---:|---:|---:|
| RX 7900 XTX (gfx1100, 24 GB) | 2.568 | 2.552 | 2.332 | 1.798 | 63,9 |
| Radeon AI PRO R9700 (gfx1201, 32 GB) | 2.927 | 2.895 | 2.742 | 2.545 | 71,4 |

En emulacion de capacidad de 20 GB sobre la XTX, el archivo carga con contexto de 131K, recupera exactamente una aguja de 27K tokens y procesa prompts de 32K a 1.312 tok/s. No hay mediciones en hardware real de RX 7900 XT.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17,70 GB solo para los pesos; se recomienda al menos 20 GB para margen de KV cache y overhead.
- GPU verificadas: RX 7900 XTX (24 GB, gfx1100) y Radeon AI PRO R9700 (32 GB, gfx1201).
- GPU de consumo: cabe en RX 7900 XT (20 GB) segun emulacion, aunque sin medicion real; en GPUs NVIDIA de 24 GB el soporte depende del backend hipfire (no confirmado).
- Despliegue: mediante el runtime hipfire (`hipfire pull` / `hipfire serve`), con endpoints compatibles OpenAI y Anthropic. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Throughput: 63,9 tok/s de decodificacion en RX 7900 XTX y 71,4 tok/s en R9700; procesamiento de prompt de 2.568 tok/s (pp512) en XTX.
- Nota: las mediciones en RX 7900 XTX se tomaron con el reloj maximo de shaders limitado a 2.400 MHz; con relojes de fabrica los valores pueden diferir.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa. Como referencia estructural, el modelo se situa en la categoria de MoE de ~28B totales con ~4B activos, comparable en orden de magnitud a otros MoE de esa franja, pero sin datos publicados de rendimiento frente a ellos.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Raon-1-mini-preview (hipfire MQ4 XTS) | 28,8B | 4,3B | hasta 131K (verificado) | Apache-2.0 | HuggingFace (hipfire) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o robustez; se desconoce el comportamiento en dominios sensibles.
- Riesgo de alucinacion inherente a modelos de razonamiento con modo thinking activado por defecto; se recomienda verificar salidas en produccion.
- Idiomas soportados no documentados; el rendimiento fuera del ingles (y posiblemente coreano, dado el origen KRAFTON) no esta verificado.
- El formato `.mq4-xts` es propietario del runtime hipfire; no es directamente compatible con vLLM, llama.cpp u otros motores sin conversion.
- Las mediciones de velocidad solo cubren GPUs AMD ROCm; el rendimiento en NVIDIA o CPU no esta documentado.
- La longitud de contexto de 131K se verifico en emulacion de capacidad, no en hardware de 20 GB real; el contexto efectivo en produccion puede variar.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y la cuantizacion deben verificarse por separado en cuanto a atribucion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- HuggingFace (cuantizacion hipfire): https://huggingface.co/hipfire-models/raon-1-mini-preview
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
