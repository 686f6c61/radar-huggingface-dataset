# nm-testing/Inkling-Dense-54M-MTP

## Resumen

Inkling-Dense-54M-MTP es un modelo de prueba (fixture) publicado por el usuario nm-testing, un derivado denso y miniaturizado del modelo Inkling de Thinking Machines. No es un modelo de propósito general: ha sido creado específicamente para validar la preservación, cuantización y exportación del layout de checkpoint `model.mtp.*` en la pull request #3225 del proyecto llm-compressor. Cuenta con 54.136.067 parámetros (unos 103,3 MiB en BF16) y una arquitectura `InklingForConditionalGeneration` reducida a dos capas troncales densas (una de atención deslizante y otra de atención completa) más una única capa MTP (multi-token prediction) de atención deslizante.

El interés técnico del artefacto es doble. Por un lado, sirve como banco de pruebas para pipelines de cuantización y exportación de pesos (se ha probado FP8_DYNAMIC sobre las capas MTP y sobre el backbone) y para tests de regresión de serving especulativo con vLLM. Por otro, demuestra una ruta de compatibilidad entre los campos de configuración de Transformers y los campos heredados de vLLM (`dense_mlp_idx` / `dense_intermediate_size`) para arquitecturas densas de Inkling, evitando el problema de exportación de expertos de las variantes dispersas.

Es importante subrayar que el backbone fue entrenado únicamente sobre ocho textos de juguete del dataset `COPYPASTAS` y que la capa MTP se inicializó de forma aleatoria y permanece sin entrenar. La perplejidad reportada de 1,0279 se calcula sobre esos mismos ocho textos de entrenamiento, no sobre un conjunto de evaluación independiente, por lo que no debe interpretarse como una medida de capacidad lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `InklingForConditionalGeneration` (transformer denso con atencion deslizante y atencion completa + una capa MTP) |
| Parametros totales | 54.136.067 |
| Parametros activos | No aplica: modelo denso, sin tensores de expertos enrutados |
| Longitud de contexto | 512 tokens (el Inkling original soporta 1.048.576) |
| Tipos de cuantizacion | BF16 nativo (108.279.142 bytes); FP8_DYNAMIC probado en exportacion de capas MTP y backbone |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 0,1 GB |
| Tamano oculto de texto | 128 (original: 6.144) |
| Capas del backbone | 2 (original: 66) |
| Capas MTP | 1 (original: 8), serializada como 20 tensores `model.mtp.layers.0.*` |
| Cabezas de atencion / cabezas KV | 4 / 2 (original: 64 / 8) |
| Tamano intermedio denso | 512 (original: 24.576) |
| Dimension de cabeza | 128 |
| Vocabulario | Tokenizador original con 201.024 entradas (con padding) |
| Modelo base | thinkingmachines/Inkling |
| Fecha de creacion | 15 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura replica la topologia de Inkling pero con dimensiones reducidas: dos capas troncales densas (una con atencion deslizante y otra con atencion completa), cuatro cabezas de atencion y dos cabezas KV, con una dimension de cabeza de 128 que se mantiene identica a la del modelo original. La componente multimodal tambien esta presente pero reducida: las dimensiones de proyeccion de audio y vision coinciden con el tamano oculto de texto reducido (128). No hay tensores de expertos enrutados, lo que evita deliberadamente el problema de exportacion de expertos que afecta a las variantes dispersas de Inkling. Sobre el backbone se anade una unica capa MTP con atencion deslizante, pensada para actuar como cabezal de borrador en decodificacion especulativa.

El proceso de construccion parte de una configuracion "tiny" corregida de Inkling, sin copiar pesos del modelo original, y usa el tokenizador y el procesador de Inkling-0.92B-MTP. El backbone se inicializa con semilla 0 y se entrena sobre el dataset `COPYPASTAS` con tasa de aprendizaje 0,001, longitud de secuencia 128 y parada temprana a los 200 pasos; la perplejidad resultante es de 1,0279 sobre los mismos ocho textos (1,0051 en la comprobacion de muestra separada). La capa MTP se inicializa con semilla 0 y se serializa mediante conversiones inversas de pesos de Transformers. Las 62 claves finales del checkpoint existen en el indice del Inkling original y todos los tensores son finitos; la procedencia y los resultados de validacion acotados se incluyen en `fixture_provenance.json`.

## Capacidades

- Generacion de texto basica: al estar entrenado solo con ocho textos de juguete, el modelo reproduce y completa esos patrones, no lenguaje general.
- Capa MTP operativa para decodificacion especulativa: el serving con vLLM y `speculative_config={"method": "mtp", "num_speculative_tokens": 1}` funciona y produce un contador positivo de tokens borrador.
- Cuantizacion y exportacion: se ha validado la cuantizacion FP8_DYNAMIC de las capas MTP y la exportacion de siete tensores de escala de pesos bajo los nombres nativos `model.mtp.*`.
- Serving con backbone cuantizado en FP8 y MTP en BF16: probado con exito con drafting MTP en vLLM.
- Preservacion de checkpoints: verificacion de igualdad exacta de los 20 tensores MTP copiados con `load_mtp=False` y `oneshot(..., output_dir=...)`.
- Compatibilidad de configuracion: conserva simultaneamente los campos de capa densa de Transformers y los campos heredados `dense_mlp_idx` / `dense_intermediate_size` de vLLM.
- Tool calling / function calling: no disponible.
- Agentica y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision y audio: la topologia incluye proyecciones multimodales reducidas, pero la inferencia multimodal no ha sido probada ni cubierta por la validacion.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Test de regresion de serving especulativo: sirve como caso minimo y reproducible para comprobar que un runtime (vLLM) detecta, adjunta y usa una capa MTP al habilitar `speculative_config` con metodo `mtp`, verificando que el contador de tokens borrador es positivo.
- Validacion de pipelines de cuantizacion: al ser un modelo de 0,1 GB con 62 claves de checkpoint, permite ejecutar ciclos completos de calibracion y exportacion (por ejemplo FP8_DYNAMIC) en segundos, sin necesitar clusters de GPU grandes.
- Pruebas de preservacion de checkpoints en llm-compressor: el fixture permite verificar que un proceso de `oneshot(output_dir=...)` copia exactamente los tensores MTP, comparando byte a byte los 20 tensores `model.mtp.layers.0.*`.
- Integracion continua en repositorios de herramientas de inferencia: al pesar ~103 MiB en BF16, puede incluirse como artefacto de test en un pipeline de CI/CD que verifique carga de modelo, exportacion y arranque de servidor sin coste apreciable de almacenamiento.
- Validacion de compatibilidad de nombres de pesos: util para comprobar que un conversor o cargador acepta simultaneamente el layout de Transformers y los campos heredados de vLLM (`dense_mlp_idx`, `dense_intermediate_size`) en arquitecturas densas de Inkling.
- Prueba de estrategias de memoria en serving: con `max_model_len=256`, `gpu_memory_utilization=0.25` y `enforce_eager=True` documentados, sirve para ensayar configuraciones de memoria y planificacion de secuencias con presupuesto reducido.
- Verificacion de rutas de carga parcial (`load_mtp=True` / `load_mtp=False`): permite comprobar que el cargador adjunta o ignora la capa MTP de forma controlada antes de aplicar sobre modelos de mayor tamano.
- Reproduccion de un caso concreto en un H100: dado que existe una configuracion exacta probada (Transformers 5.17.0, torch 2.13.0+cu130, vLLM con version en tiempo de ejecucion 0.26.0), se puede reproducir un entorno conocido para aislar regresiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico de evaluacion es la perplejidad de 1,0279 (y 1,0051 en la comprobacion de muestra), medida sobre los mismos ocho textos de entrenamiento y no sobre un conjunto reservado, por lo que no es comparable con metricas tipo MMLU, HumanEval o GSM8K. La model card indica explicitamente que el artefacto no es un banco de aceptacion de borradores (draft-acceptance benchmark).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 103,3 MiB en BF16 solo para pesos; la model card documenta una ejecucion con `gpu_memory_utilization=0.25` sobre una H100, lo que implica que el consumo efectivo queda dominado por el runtime de vLLM y la cache KV, no por los pesos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte BF16, incluidas las de gama de consumo. La validacion se realizo en una unica H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (por ejemplo RTX 3060 o superior) e incluso en CPU para pruebas basicas con Transformers.
- Opciones de despliegue: Transformers (`InklingForConditionalGeneration.from_pretrained` con `dtype=torch.bfloat16`, `device_map="cuda"`, `attn_implementation="eager"`) y vLLM con `enforce_eager=True`, `enable_prefix_caching=False`, `max_model_len=256`, `max_num_seqs=2` y `limit_mm_per_prompt={"image": 0, "audio": 0, "video": 0}`.
- Latencia y throughput: no disponible. La model card no publica latencias ni tokens por segundo.
- Restricciones de serving: el serving de capas MTP cuantizadas falla en la implementacion de vLLM probada, porque el decodificador MTP de Inkling se construye con `quant_config=None` y rechaza los tensores `weight_scale`. La recomendacion es mantener la MTP en BF16. Tampoco se cubre la inferencia multimodal ni el serving multi-GPU.

## Comparativa con modelos similares

No existen en la informacion proporcionada modelos directamente comparables de la misma categoria (fixtures densos de validacion de capas MTP). La comparacion mas util es contra el modelo original del que deriva y contra el checkpoint intermedio usado para el tokenizador:

| Modelo | Parametros | Capas troncales | Capas MTP | Tamano oculto de texto | Cabezas / KV | Contexto | Licencia |
|---|---|---|---|---|---|---|---|
| Inkling-Dense-54M-MTP | 54.136.067 | 2 | 1 | 128 | 4 / 2 | 512 | apache-2.0 |
| thinkingmachines/Inkling (original) | no disponible | 66 | 8 | 6.144 | 64 / 8 | 1.048.576 | no disponible |
| Inkling-0.92B-MTP (origen del tokenizador) | 0,92 B (por nombre) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: la fila del modelo original reproduce los valores publicados en la tabla comparativa de la model card del fixture; no se dispone de su recuento total de parametros ni de su licencia en la informacion proporcionada. El modelo original es, ademas, una arquitectura con expertos enrutados, mientras que este fixture es denso por diseno.

## Limitaciones y advertencias

- No es un modelo de proposito general: el autor indica explicitamente que no debe usarse como modelo de lenguaje general ni como banco de aceptacion de borradores.
- Entrenamiento marginal: el backbone se entrena solo con ocho textos de juguete del dataset `COPYPASTAS`; la perplejidad de 1,0279 no es un resultado de generalizacion.
- Capa MTP sin entrenar: se inicializa aleatoriamente con semilla 0 y no recibe entrenamiento. Su utilidad es estructural (validacion de layout), no funcional.
- Riesgo de alucinacion: muy alto y sin sentido practico; el modelo solo ha visto ocho textos y carece de conocimiento factual. Cualquier salida fuera de esos patrones es esencialmente arbitraria.
- Contexto muy limitado: 512 tokens, frente a los 1.048.576 del Inkling original. Cualquier tarea que requiera contexto largo esta fuera de alcance.
- Idiomas: no disponible; no se documenta ningun conjunto de idiomas soportados.
- Multimodalidad no validada: aunque la configuracion incluye proyecciones de audio y vision reducidas, la model card indica que la inferencia multimodal no esta cubierta y que solo se probo serving de texto, con `limit_mm_per_prompt` a cero.
- Serving de MTP cuantizada no funcional: la implementacion de vLLM probada rechaza los tensores `weight_scale` en el decodificador MTP (`quant_config=None`). Hay que mantener la MTP en BF16.
- Alcance de validacion estrecho: probado en una sola H100 con Transformers 5.17.0 y torch 2.13.0+cu130, y con una instalacion de vLLM cuyo metadato de distribucion (0.30.0) no coincide con la version en tiempo de ejecucion (0.26.0). No es una garantia de compatibilidad con ruedas limpias.
- Sin cobertura multi-GPU ni de servido distribuido.
- Discrepancia de identificador: el codigo de ejemplo de la model card usa la ruta `soyrsoyr/Inkling-Dense-54M-MTP`, mientras que el identificador del repositorio es `nm-testing/Inkling-Dense-54M-MTP`. Conviene verificar la ruta efectiva antes de cargar el modelo.
- Licencia Apache 2.0: permite uso comercial segun los terminos de dicha licencia, pero el autor no ofrece ninguna garantia de idoneidad y el propio artefacto se declara material de testing.
- Cero adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe comunidad que haya validado su comportamiento fuera del autor.
- Fecha de creacion futura respecto a la fecha de consulta indicada (15 de octubre de 2026); conviene confirmar la vigencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nm-testing/Inkling-Dense-54M-MTP
- Pull request de llm-compressor validada por el fixture: https://github.com/vllm-project/llm-compressor/pull/3225
- Modelo original (revision referenciada): https://huggingface.co/thinkingmachines/Inkling/tree/828496eeae4c243ff1a22f7f28ff83694f2f7bc9
- Origen del tokenizador y procesador (revision referenciada): https://huggingface.co/inference-optimization/Inkling-0.92B-MTP/tree/22b31818016a1560cfeb47caaa3296cafa2f43df
- Repositorio de vLLM: no disponible en la informacion proporcionada
- Resultados de busqueda web: todos los enlaces devueltos corresponden a paginas sobre el nanometro como unidad de longitud y a conversores de unidades, sin relacion con el modelo. No aportan informacion adicional.
