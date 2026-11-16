# gostar77/qwen3.8-flash-next-iq5r-v4-u5-w5-bf16ple

## Resumen

Qwen3.8-Flash-Next IQ5R (Radiance) es un artefacto cuantizado de 175 GiB (188 GB de repositorio) derivado del checkpoint BF16 Qwen3.8-Flash-Next, publicado por el usuario gostar77 bajo el formato propietario Radiance RAD2. No se trata de un modelo entrenado desde cero, sino de una compresión agresiva del modelo base que combina GPTQ U5 (trellis) en las puertas y up-projections de los expertos enrutados, GPTQ W5NL con grupos de 64 en las down-projections, y mantiene diez expertos protegidos, los pesos PLE y los de visión en BF16. El resultado son 51.489 tensores empaquetados en un único artefacto que requiere un parche de runtime específico para cargarse.

El modelo base es un Mixture-of-Experts de Qwen con capacidades multimodales (visión) y un bloque MTP (multi-token prediction) para decodificación especulativa. La relevancia de esta ficha radica en que documenta un caso de cuantización extrema con métricas de fidelidad distribucional publicadas (KL medio de 0,10565 y 92,50 % de acuerdo top-1 frente al BF16), lo que permite evaluar el coste real de comprimir un MoE de gran tamaño sin disponer de GPUs de 80 GB por docena.

La licencia es la Qwen Community License 1.0, heredada del modelo base, con avisos adicionales de Radiance. El repositorio no incluye datos de calibración en bruto ni corpus de evaluación retenido, solo los ficheros de puntuaciones y los manifiestos. El autor advierte explícitamente de que las pruebas realizadas (carga del modelo y smoke tests cortos) no demuestran calidad amplia ni madurez para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer con bloque MTP para decodificacion especulativa y componentes de vision; cuantizacion Radiance RAD2 |
| Parametros totales | no disponible (el repo contiene 51.489 tensores y 175 GiB de pesos cuantizados) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ U5 trellis (gate/up de expertos), GPTQ W5NL grupo 64 (down de expertos), GPTQ U5 calibrado (attn_qg y ssm_inz), ruta I8 en el resto de lineales del tronco, GPTQ U4/W4NL y RTN en el bloque MTP; BF16 en diez expertos protegidos, PLE y vision |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-license-1.0) |
| Formato de pesos | Radiance RAD2 (artefacto empaquetado, no safetensors ni GGUF estandar) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos que incorpora atención y componentes de estado (referencias a `attn_qg` y `ssm_inz` en la receta de cuantización), además de un bloque MTP para decodificación especulativa y pesos de visión. Esta variante IQ5R no reentrena nada: aplica una receta de cuantización post-entrenamiento calibrada sobre 24.816 ficheros RADGRAM2 publicados en un dataset separado, más 518 ficheros de calibración específicos para el bloque MTP (con seis alias de entrada compartida verificados).

La innovación técnica principal es el soporte de formatos mixtos dentro del runtime Radiance: el parche incluido se basa en el commit `2a2b756371c26f2768b8d129a098df275ace2c73` y la implementación en `e52f8a0b`, y el autor subraya que este soporte no está implícito en una release sin modificar de Radiance. La calibración cubre las proyecciones del tronco y los expertos enrutados, pero deja en BF16 diez expertos considerados sensibles, lo que sugiere una selección manual de capas críticas para preservar calidad. No se documenta el número de tokens de entrenamiento del modelo base, la composición del dataset original ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto condicionada por el modelo base Qwen3.8-Flash-Next; no se documentan capacidades específicas adicionales en la model card.
- Razonamiento y matemáticas: el corpus de evaluación incluye documentos de matemáticas, pero no se publican métricas de precisión por tarea.
- Código: el corpus de evaluación incluye documentos de código; no hay benchmarks de HumanEval ni similares.
- Tool calling y uso de herramientas: el corpus de evaluación incluye documentos de tool-use, lo que indica que el modelo base está orientado a ese escenario, aunque no se aportan métricas de éxito.
- Decodificación especulativa mediante el bloque MTP, con soporte de runtime a través del parche incluido; el autor reporta que el MTP no está validado (43 de 102 tokens de draft aceptados en un smoke test).
- Capacidades de visión: los pesos de visión se conservan en BF16, por lo que el artefacto mantiene el componente multimodal del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de un MoE grande en dos GPUs AMD: el launcher probado es TP=2 sobre dos aceleradores AMD con el runtime Radiance parcheado, lo que permite servir el modelo en hardware no-NVIDIA cuando el BF16 original no cabe.
- Evaluación de cuantización extrema en investigación: los ficheros de `evaluation/` permiten reproducir la comparación distribucional (KL, acuerdo top-1, PPL) frente al BF16 y estudiar el impacto de GPTQ U5/W5NL en un MoE con expertos protegidos.
- Generación de código asistida en pipelines internos: el corpus de calibración incluye código y el modelo base está orientado a tool-use, por lo que encaja en asistentes de repositorio, aunque sin métricas de precisión publicadas que garanticen calidad.
- Experimentación con decodificación especulativa: el bloque MTP cuantizado permite medir la tasa de aceptación de draft tokens y comparar latencia frente a la ruta sin especulación, con la advertencia de que el autor no ha validado paridad.
- Servicio de chat multi-turno con contexto largo: al conservar la ventana de contexto del modelo base (no documentada aquí), es apto para conversaciones con historial, siempre que se valide la fidelidad de la cuantización en el dominio concreto.
- Investigación sobre calibración de MoE: el dataset de 24.816 RADGRAM2 y los 518 gramos del bloque MTP permiten estudiar cómo la selección de datos de calibración afecta a la KL frente al BF16 en distintas mezclas (chat, código, tool-use, matemáticas).
- Prototipado multimodal en entornos con VRAM limitada: los pesos de visión en BF16 permiten mantener tareas de imagen-texto sin cargar el checkpoint completo en precisión nativa.

## Benchmarks y rendimiento

| Modelo | KL medio | Acuerdo top-1 con BF16 | PPL (referencia BF16: 5,1333) |
|---|---:|---:|---:|
| Este candidato IQ5R | 0,10565 | 92,50 % | 5,2482 (+2,24 %) |
| StillDeadcode IQR-V4 | 0,11941 | 91,90 % | 5,1442 (+0,21 %) |

Medición sobre 106.851 posiciones de 64 documentos empaquetados (chat, código, tool-use y matemáticas), sin especulación y con vocabulario completo. El autor advierte de que son métricas distribucionales, no de precisión por tarea, y que los prompts empaquetados incluyen ejemplos previos como contexto. La comparación frente al baseline W5 no pudo completarse porque este no arrancó. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 175 GiB, por lo que la inferencia requiere al menos ese espacio distribuido entre GPUs; no se documenta el pico de memoria del runtime.
- GPUs recomendadas: el launcher probado es TP=2 sobre dos GPUs AMD; no se especifica el modelo concreto de GPU.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en ninguna GPU consumer de 48 GB o menos sin offload a CPU o disco.
- Opciones de despliegue: runtime Radiance con el parche incluido (commit base `2a2b756371c26f2768b8d129a098df275ace2c73`, implementación `e52f8a0b`); la ruta de llama-swap se denomina `qwen3.8-flash-next-iq5r`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo reporta smoke tests cortos y una tasa de aceptación MTP de 43/102 tokens en una prueba de escritura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next IQ5R (este) | no disponible (175 GiB) | no disponible | Radiance RAD2 | Qwen Community License 1.0 | Hugging Face, 0 descargas |
| StillDeadcode IQR-V4 | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Qwen3.8-Flash-Next BF16 (base) | no disponible | no disponible | BF16 | Qwen Community License 1.0 | Hugging Face (Qwen) |

La única comparación cuantitativa disponible es la de fidelidad distribucional frente al BF16 y frente a IQR-V4. No hay datos de contexto, parámetros ni benchmarks de tarea para establecer una comparativa funcional completa.

## Limitaciones y advertencias

- El MTP no está validado: en un smoke test de escritura, la respuesta con especulación difirió de la respuesta sin ella (43/102 tokens de draft aceptados), y el autor lo reporta como falta de paridad, no como equivalencia.
- Las métricas publicadas son distribucionales (KL, top-1, PPL), no de precisión en tareas; no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni en evaluación humana.
- El soporte de formatos mixtos requiere un parche sobre un commit concreto de Radiance; una release sin modificar no cargará el artefacto.
- La comparación frente al baseline W5 no se completó, por lo que no se puede afirmar que IQ5R sea mejor o peor que esa receta.
- El repositorio no redistribuye datos de calibración en bruto ni corpus retenido, lo que limita la reproducibilidad completa de la calibración.
- Licencia Qwen Community License 1.0: es necesario revisar sus términos para uso comercial, ya que no es una licencia permisiva tipo Apache 2.0.
- Riesgo de sesgos y alucinación: no documentado en la model card; se heredan los del modelo base, que tampoco se detallan aquí.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe más allá de la del modelo base.
- El autor advierte explícitamente de que la carga del modelo y los smoke tests no demuestran calidad amplia ni madurez para producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/gostar77/qwen3.8-flash-next-iq5r-v4-u5-w5-bf16ple)
- [Dataset de calibración Radiance](https://huggingface.co/datasets/gostar77/qwen3.8-flash-next-radiance-q5-w5dn64-grams)
- [Calibración del bloque MTP](https://huggingface.co/datasets/gostar77/qwen3.8-flash-next-radiance-q5-w5dn64-grams/tree/main/mtp-draft-calibration)
- [Modelo comparable StillDeadcode IQR-V4](https://huggingface.co/StillDeadcode/qwen3.8-next-flash-iqr-v4)
- [Licencia Qwen Community License 1.0](https://huggingface.co/gostar77/qwen3.8-flash-next-iq5r/blob/main/LICENSE)
- [Modelo base Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
