# inference-optimization/GLM-5-0.88B-MTP-PR3225

## Resumen

GLM-5-0.88B-MTP-PR3225 es un modelo de prueba (test fixture) de arquitectura reducida publicado por el usuario `inference-optimization`. No es un modelo de lenguaje de produccion: su backbone se inicializo de forma aleatoria y se entreno sobre un corpus de texto de juguete, sin partir de pesos preentrenados. Su proposito es servir como material de validacion para la pull request #3225 del proyecto LLM Compressor de vLLM, que trabaja sobre cuantizacion y sobre el soporte de Multi-Token Prediction (MTP).

La arquitectura reproduccion del modelo original `zai-org/GLM-5` (clase `GlmMoeDsaForCausalLM`, variante MoE con atencion DSA) pero con la profundidad recortada: 4 capas ocultas en lugar de 78, `hidden_size` de 1536 en lugar de 6144 y 16 expertos enrutados en lugar de 256. El total de parametros asciende a 881.036.064 segun los safetensors, de los cuales 765.051.392 corresponden al backbone y 115.984.640 a las proyecciones MTP sinteticas. La estimacion de parametros activos del backbone es de 708.428.288.

Su relevancia es estrictamente instrumental: permite ejecutar pruebas de carga, cuantizacion y serving en entornos de integracion continua sin el coste de un modelo grande. No debe emplearse como modelo generativo real, ya que no ha recibido entrenamiento supervisado, RLHF ni ajuste de instrucciones, y su perplejidad publicada corresponde al mismo corpus de juguete usado en entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GlmMoeDsaForCausalLM` (MoE con atencion DSA, derivada de `zai-org/GLM-5`) |
| Parametros totales | 881.036.064 (safetensors); la model card indica 881.036.032 incluyendo MTP |
| Parametros activos | 708.428.288 estimados para el backbone (excluye MTP; no es una medicion de FLOPs) |
| Parametros del backbone | 765.051.392 |
| Parametros MTP | 115.984.640 |
| Longitud de contexto | no disponible (no especificada en la informacion publicada) |
| Tipos de cuantizacion | BF16 como fuente; cuantizacion MFPTQ aplicada a 136 modulos (56 de ellos MTP) con soporte FP8 de compressed-tensors. No hay GGUF publicado |
| Idiomas soportados | no disponible (tokenizer heredado de `zai-org/GLM-5`) |
| Licencia | MIT |
| Formato de pesos | safetensors (5 shards indexados, 192 tensores indexados) |
| Precision de referencia | BF16 |
| Tamano del repositorio | 1,8 GB |
| Capas ocultas | 4 (original: 78) |
| Hidden size | 1536 (original: 6144) |
| Intermediate size | 6144 (original: 12288) |
| MoE intermediate size | 1024 (original: 2048) |
| Expertos enrutados | 16 (original: 256), 4 por token (original: 8) |
| Cabezas de atencion / KV | 16 / 16 (original: 64 / 64) |
| q_lora_rank / kv_lora_rank | 2048 / 512 |
| Capas MTP | 1 |

## Arquitectura y entrenamiento

El modelo emplea la clase `GlmMoeDsaForCausalLM`, una arquitectura de mezcla de expertos (MoE) con atencion de tipo DSA heredada de `zai-org/GLM-5` (revision `c183ef8c61faee82855eca1ed9bb3a9a7ce3b0b2`). Cada token activa 4 de los 16 expertos enrutados, con un `moe_intermediate_size` de 1024 y compresion de proyecciones Q/KV mediante los rangos LoRA (`q_lora_rank` 2048, `kv_lora_rank` 512). Adicionalmente incorpora una capa de Multi-Token Prediction (MTP), cuyo proposito en la arquitectura original es actuar como cabezal de decodificacion especulativa. El detalle interno del mecanismo DSA no se especifica en la informacion disponible.

El entrenamiento es deliberadamente minimo: semilla aleatoria 3225, optimizador AdamW con tasa de aprendizaje 0,0004 y weight decay 0,01, batch de 2 y textos truncados a 160 tokens. Se detuvo tras tres comprobaciones consecutivas con perplejidad de juguete menor o igual a 3. El corpus sigue el flujo de trabajo *tiny-model* del repositorio de LLM Compressor. No se aplico RLHF, DPO ni ajuste de instrucciones. Las proyecciones MTP son inicializaciones sinteticas con pesos de decodificador copiados de bloques del backbone ya entrenados: la MTP no se entreno por separado, por lo que no hay evidencia de calidad de aceptacion de borradores ni de aceleracion de inferencia.

## Capacidades

- Generacion de texto autoregresiva basica mediante `AutoModelForCausalLM` de Transformers, siempre que se cargue unicamente el backbone.
- Carga y recarga del backbone en BF16 verificada: perplejidad de juguete de 1,439453 en el mismo corpus empleado para entrenar (integridad de aprendizaje y de recarga, no generalizacion).
- Cuantizacion mediante LLM Compressor y MFPTQ: 136 modulos cuantizados, incluidos 56 modulos MTP, con perplejidad de 1,440128 tras la cuantizacion.
- Soporte de la ruta `compressed-tensors` para FP8 en el entorno de pruebas declarado.
- MTP presente en el checkpoint pero con ejecucion no verificada: la carga basada en el modelo falla porque el patron registrado aguas arriba espera la capa 78, mientras que los tensores MTP de este fixture empiezan en la capa 4.
- No dispone de soporte de *tool calling*, function calling, agentes, vision, audio, modo *thinking* ni capacidades multilingues declaradas.
- Uso previsto como fixture de arquitectura y de checkpoint, no como modelo conversacional.

## Casos de uso

- Validacion de cargadores en Transformers: sirve para comprobar que `GlmMoeDsaForCausalLM` se instancia y recarga correctamente con configuraciones de profundidad reducida, sin necesidad de descargar los pesos del GLM-5 completo.
- Pruebas de regresion de LLM Compressor: permite verificar en integracion continua que la cuantizacion MFPTQ cubre los modulos esperados (136 en esta revision, 56 de ellos MTP) y que la perplejidad resultante no se degrada de forma anomala.
- Pruebas de compatibilidad de `compressed-tensors` en FP8: al ser un checkpoint pequeno con tensores indexados, facilita comprobar rutas de conversion y de serializacion de pesos cuantizados.
- Reproduccion de fallos de carga MTP: el desajuste entre el patron de la capa 78 y los tensores que empiezan en la capa 4 lo convierte en un caso de prueba util para depurar la logica de mapeo de capas MTP en cargadores.
- Validacion de entornos de serving: se uso con vLLM 0.30.0 para *smoke checks*, de modo que permite reproducir la incompatibilidad de ABI de la extension DeepGEMM detectada en ese intento.
- Docencia y formacion interna: al caber en cualquier GPU de consumo y entrenarse en minutos, resulta adecuado para explicar la estructura de un checkpoint MoE con MTP, el particionado en shards safetensors y el flujo de cuantizacion.
- Pruebas de rendimiento de infraestructura (no del modelo): medicion de tiempos de carga, arranque de servidor y overhead de tokenizer con un artefacto de menos de 2 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perplejidad sobre el corpus de juguete empleado en el propio entrenamiento, que no es una medida de calidad ni de generalizacion:

| Metrica | Valor | Contexto |
|---|---|---|
| Perplejidad de juguete (backbone BF16 recargado) | 1,439453 | Mismo corpus pequeno usado en entrenamiento |
| Perplejidad de juguete (backbone cuantizado con MFPTQ) | 1,440128 | Mismo corpus; 136 modulos cuantizados |
| MMLU, HumanEval, GSM8K u otros | no disponible | No publicados |
| Calidad de aceptacion de la MTP | no disponible | MTP no entrenada por separado y no verificada en ejecucion |

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 1,76 GB solo para pesos, mas activaciones y cache KV; en la practica cabe holgadamente en 4 GB.
- VRAM estimada en FP8: aproximadamente 0,88 GB para pesos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Cabe en GTX 1650 (4 GB), RTX 3060, RTX 4060, RTX 4090, A100, H100. No requiere aceleradores de datacenter.
- Inferencia en CPU: viable por tamano, aunque no hay cifras publicadas de latencia ni de throughput.
- Opciones de despliegue: Transformers (entorno probado con la version 5.17.0, Torch 2.14.0+cu130 y `attn_implementation="eager"`); vLLM 0.30.0 usado para *smoke checks* de serving, con fallo documentado por desajuste de ABI en la extension DeepGEMM; LLM Compressor (`2d52420`) y compressed-tensors (`e69c8dc`) para cuantizacion.
- Soporte conocido de MTP: solo se carga de forma opt-in; la generacion estandar del backbone no ejecuta la MTP.
- Latencia y throughput: no disponible.
- Nota de compatibilidad: la carga MTP basada en modelo falla en Transformers 5.15.0; la version 5.16 no se probo. No se parcheo la clase del modelo ni el cargador para forzar que las pruebas pasasen.

## Comparativa con modelos similares

No hay modelos comparables en la informacion disponible: se trata de un fixture de pruebas, no de un modelo publicado para uso general. La unica referencia directa es la arquitectura original de la que deriva.

| Aspecto | GLM-5-0.88B-MTP-PR3225 | zai-org/GLM-5 (arquitectura de referencia) |
|---|---|---|
| Proposito | Fixture de test para LLM Compressor PR #3225 | Modelo original de `zai-org` |
| Capas ocultas | 4 | 78 |
| Hidden size | 1536 | 6144 |
| Intermediate size | 6144 | 12288 |
| MoE intermediate size | 1024 | 2048 |
| Expertos enrutados | 16, 4 por token | 256, 8 por token |
| Cabezas de atencion / KV | 16 / 16 | 64 / 64 |
| Parametros totales | 881.036.064 | no disponible |
| Entrenamiento | Toy, corpus minimo, sin RLHF | no disponible |
| Licencia | MIT | la licencia se indica en el repositorio de `zai-org/GLM-5`; el valor concreto no disponible en la informacion proporcionada |

Alternativas de la misma categoria (fixtures tiny para pruebas de cuantizacion): no disponible.

## Limitaciones y advertencias

- No es un modelo de produccion. El backbone se inicializo aleatoriamente y se entreno con un corpus de juguete; no ha recibido preentrenamiento a gran escala ni ajuste de instrucciones.
- La perplejidad de 1,439453 mide integridad de aprendizaje y de recarga sobre el mismo corpus de entrenamiento, no capacidad de generalizacion. No debe citarse como indicador de calidad.
- La MTP no se entreno por separado y su ejecucion no esta verificada; las proyecciones son inicializaciones sinteticas. No hay evidencia de aceleracion por decodificacion especulativa.
- La carga MTP falla con el patron de checkpoint registrado aguas arriba (espera la capa 78, el fixture empieza en la capa 4). Cualquier uso de la ruta MTP requiere revision manual.
- El intento de ejecucion en vLLM 0.30.0 encontro un desajuste de ABI en la extension DeepGEMM; el estado del serving no esta garantizado.
- Riesgo de alucinacion: total. Al no tener conocimiento factual adquirido, cualquier texto generado es incoherente o sin fundamento.
- Idiomas soportados: no disponible. El tokenizer se hereda del modelo original, pero el entrenamiento se hizo sobre un corpus minimo, por lo que no hay competencia linguistica real.
- Sesgos: no evaluados y no documentados.
- Licencia MIT en este repositorio, lo que permite uso comercial del artefacto, pero la procedencia de la arquitectura y del tokenizer remite a `zai-org/GLM-5`, cuyos terminos deben respetarse por separado. La licencia concreta del modelo original no se detalla en la informacion proporcionada.
- Sin garantias de mantenimiento: cero descargas y cero *likes* en el momento de la consulta, y fechas de creacion y actualizacion separadas por cuatro segundos (7 de octubre de 2026), lo que indica un artefacto de un solo commit.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/GLM-5-0.88B-MTP-PR3225
- Arquitectura y tokenizer originales: https://huggingface.co/zai-org/GLM-5 (revision `c183ef8c61faee82855eca1ed9bb3a9a7ce3b0b2`)
- Pull request de referencia: https://github.com/vllm-project/llm-compressor/pull/3225
- Commit de LLM Compressor usado en las pruebas: https://github.com/vllm-project/llm-compressor/commit/2d5242056a8a00028686a303771ffc8e2fe27d07
- Flujo de trabajo tiny-model: https://github.com/vllm-project/llm-compressor/tree/2d5242056a8a00028686a303771ffc8e2fe27d07/.agents/skills/create-tiny-model
- Commit de compressed-tensors usado en las pruebas: https://github.com/vllm-project/compressed-tensors/commit/e69c8dc58aa152e5f5e36e85800ec1d2e7de5271
- Resultados de validacion (incluido en el repositorio): `validation.json`
- Manifiesto de artefactos con hashes (incluido en el repositorio): `artifact-manifest.json`

Nota sobre la busqueda web: los resultados devueltos corresponden a definiciones genericas del termino "inference" en diccionarios y enciclopedias en frances, sin relacion con este modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
