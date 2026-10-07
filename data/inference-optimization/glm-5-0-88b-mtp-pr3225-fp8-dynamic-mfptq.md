# inference-optimization/GLM-5-0.88B-MTP-PR3225-FP8-Dynamic-MFPTQ

## Resumen

GLM-5-0.88B-MTP-PR3225-FP8-Dynamic-MFPTQ es un artefacto de prueba ("test fixture") publicado por el usuario inference-optimization para validar la cuantizacion FP8_DYNAMIC mediante MFPTQ dentro del PR #3225 de LLM Compressor. No es un modelo de lenguaje de produccion: su backbone se inicializo de forma aleatoria y se entreno unicamente sobre un corpus de texto de juguete, sin reutilizar pesos preentrenados. La model card lo declara explicitamente como fixture de arquitectura y checkpoint.

La arquitectura procede de GLM-5 (clase `GlmMoeDsaForCausalLM`, tokenizer incluido) pero con la profundidad y el tamano reducidos de forma drastica: 4 capas ocultas en lugar de 78, `hidden_size` de 1536 en lugar de 6144 y 16 expertos enrutados en lugar de 256. El checkpoint cuantizado contiene 881.036.064 parametros totales (0,881B), de los cuales 765.051.392 corresponden al backbone y 115.984.640 a la capa MTP sintetica.

Su relevancia es exclusivamente de ingenieria: sirve para reproducir y depurar el pipeline de cuantizacion FP8_DYNAMIC de LLM Compressor y compressed-tensors, incluidas las rutas de carga del backbone y de MTP, en un checkpoint lo bastante pequeno (1,4 GB de repositorio) para ejecutarse en cualquier GPU de consumo. Cualquier uso como modelo conversacional o de generacion real carece de sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion dispersa (`GlmMoeDsaForCausalLM`), mas una capa MTP (multi-token prediction) |
| Parametros totales | 881.036.064 (0,881B); backbone 765.051.392 + MTP 115.984.640 |
| Parametros activos | 708.428.288 estimados en el backbone (estimacion de enrutamiento, incluye embeddings y componentes densos, excluye MTP; no es una medicion de FLOPs) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8_DYNAMIC (compressed-tensors) con exclusiones en su dtype original (`lm_head`, `model.embed_tokens`, `.*\.mlp\.gate$`, `.*\.eh_proj$`, `.*\.indexer\..*`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (5 shards indexados, 328 tensores) |

## Arquitectura y entrenamiento

El modelo es una version reducida de la arquitectura GLM-5: transformer con mezcla de expertos (MoE) y atencion dispersa, con cuantizacion por grupo `FP8_DYNAMIC` aplicada con MFPTQ. La configuracion tiny guardada en `config.json` (que la model card considera autoritativa) rebaja la profundidad a 4 capas, `hidden_size` a 1536, `intermediate_size` a 6144, `moe_intermediate_size` a 1024, 16 expertos enrutados con 4 expertos por token, 16 cabezas de atencion y 16 cabezas KV, con `q_lora_rank` 2048 y `kv_lora_rank` 512. Se anade una unica capa MTP (`num_mtp_layers: 1`). En la arquitectura original GLM-5 las cifras equivalentes son 78 capas, `hidden_size` 6144, `intermediate_size` 12288, `moe_intermediate_size` 2048, 256 expertos con 8 por token y 64 cabezas de atencion y KV.

El entrenamiento no empleo pesos preentrenados: el backbone se inicializo aleatoriamente y se ajusto sobre un corpus de texto de juguete siguiendo el flujo de trabajo tiny-model del repositorio de LLM Compressor, con semilla aleatoria 3225, optimizador AdamW (learning rate 0,0004, weight decay 0,01), batch size 2 y truncado a 160 tokens. El entrenamiento se detuvo tras tres comprobaciones consecutivas con perplejidad de juguete menor o igual a 3. La cuantizacion MFPTQ afecto a 136 modulos, 56 de ellos pertenecientes a MTP. Las proyecciones MTP son inicializaciones sinteticas y sus pesos de decoder se copiaron de bloques del backbone ya entrenado: MTP no se entreno por separado, de modo que no hay evidencia de calidad de aceptacion de borradores ni de aceleracion de inferencia. Ademas, la carga basada en modelo de MTP falla en este fixture porque el patron de checkpoint registrado en upstream espera la capa 78 y los tensores MTP empiezan en la capa 4; no se aplico ningun parche al loader ni a la arquitectura.

## Capacidades

- El modelo no demuestra capacidades de generacion, razonamiento, codigo o matematicas: esta entrenado sobre un corpus de juguete y su backbone parte de inicializacion aleatoria.
- No hay evidencia publicada de soporte de tool calling ni de function calling.
- No hay evidencia de comportamiento agentico ni de razonamiento multi-paso.
- Capacidades multilingues: no disponibles; no se documenta el vocabulario ni la cobertura idiomatica del tokenizer de GLM-5 en este fixture.
- Capacidad diferencial en el plano de ingenieria: permite ejercitar las rutas de cuantizacion FP8_DYNAMIC de LLM Compressor, la carga de `compressed-tensors` en Transformers y la ruta de carga de MTP (actualmente fallida en este checkpoint).
- La ejecucion de MTP esta sin verificar; el intento con vLLM se topo con un desajuste de ABI en la extension DeepGEMM.
- La generacion ordinaria con Transformers sobre el backbone no ejecuta MTP, que es opt-in.

## Casos de uso

- Prueba de regresion del PR #3225 de LLM Compressor: el checkpoint existe para verificar que la cuantizacion MFPTQ con `FP8_DYNAMIC` produce los 136 modulos esperados (56 de ellos MTP) y que el reload del backbone es correcto.
- Validacion de integracion de compressed-tensors: sirve para comprobar que las exclusiones (`lm_head`, `embed_tokens`, `mlp.gate`, `eh_proj`, `indexer.*`) se conservan en su dtype original y que el pipeline de carga las respeta.
- Pruebas de humo de despliegue en vLLM: se uso vLLM 0.30.0 para smoke checks de serving dentro del entorno probado (Transformers 5.17.0, Torch 2.14.0+cu130).
- Depuracion de la ruta de carga de MTP: el fixture reproduce el fallo de carga cuando el patron de checkpoint espera la capa 78 y los tensores empiezan en la capa 4, util para desarrollar y probar correcciones del loader.
- Sanity check de integridad de checkpoint: con 5 shards y 328 tensores indexados, junto con `artifact-manifest.json` (hashes de ficheros) y `validation.json`, permite verificar descargas e integridad en CI.
- Pruebas de CI/CD en hardware modesto: con 0,881B de parametros y 1,4 GB de repositorio, cualquier pipeline puede descargar, cargar y ejecutar una generacion corta en pocos segundos sin reservar GPU de datacenter.
- Verificacion de tolerancia a la cuantizacion en este backbone concreto: la perplejidad de juguete del backbone BF16 recargado (1,439453) frente a la del recargado cuantizado (1,440128) se usa como metrica de control de integridad, no como evaluacion de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico es la perplejidad de juguete sobre el mismo corpus pequeno usado en entrenamiento, que la propia model card califica como demostracion de integridad de aprendizaje y recarga, no de generalizacion:

| Metrica | Valor | Nota |
|---|---|---|
| Perplejidad de juguete, backbone BF16 recargado | 1,439453 | Corpus de juguete de entrenamiento |
| Perplejidad de juguete, backbone recargado tras MFPTQ | 1,440128 | FP8_DYNAMIC con exclusiones |
| Modulos cuantizados | 136 (56 de MTP) | Via MFPTQ |
| Ejecucion de MTP | no verificada | Fallo de carga por desajuste entre capa 78 esperada y capa 4 real; vLLM con desajuste de ABI en DeepGEMM |

## Requisitos de hardware

- Peso del checkpoint: 1,4 GB de repositorio; 5 shards de safetensors en FP8_DYNAMIC mas assets del tokenizer.
- VRAM estimada para inferencia: aproximadamente 1-3 GB teniendo en cuenta pesos, activaciones y overhead de runtime, aunque no hay mediciones publicadas. No disponible como cifra verificada.
- GPU recomendadas: cualquier GPU con soporte FP8 o capacidad de de-cuantizacion; por el tamano, cabe en GPU de consumo (por ejemplo, gama RTX 30/40 con suficiente VRAM), no requiere A100 ni H100.
- Cabe en GPU de consumo: si, por el reducido numero de parametros; la model card no especifica minimos.
- Opciones de despliegue: Transformers (entorno probado con Transformers 5.17.0, Torch 2.14.0+cu130, compressed-tensors commit `e69c8dc`, LLM Compressor commit `2d52420`) y vLLM 0.30.0 para smoke checks. Se observo un fallo de carga de MTP en Transformers 5.15.0; la version 5.16 no se probo. No hay datos de compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos alternativos comparables en la informacion proporcionada. La comparacion mas util es contra el propio checkpoint base y contra la configuracion original de la arquitectura GLM-5, usando los datos de la model card:

| Aspecto | Este fixture (FP8_DYNAMIC) | GLM-5-0.88B-MTP-PR3225 (base, BF16) | GLM-5 original (referencia arquitectonica) |
|---|---|---|---|
| Parametros totales | 881.036.064 | 881.036.032 | no disponible |
| Capas ocultas | 4 | 4 | 78 |
| `hidden_size` | 1536 | 1536 | 6144 |
| Expertos enrutados | 16 (4 por token) | 16 (4 por token) | 256 (8 por token) |
| Precision de pesos | FP8_DYNAMIC con exclusiones | BF16 | no disponible |
| Licencia | MIT | MIT | MIT (segun atribucion de zai-org/GLM-5) |
| Disponibilidad | HuggingFace, 0 descargas, 0 likes | HuggingFace (modelo base) | HuggingFace (zai-org/GLM-5) |

Frente a modelos tiny de proposito general (por ejemplo, familias de menos de 1B parametros con entrenamiento real), la diferencia relevante es que este checkpoint no ha sido entrenado para tareas de lenguaje y no debe compararse en calidad.

## Limitaciones y advertencias

- No es un modelo de produccion: la model card lo declara explicitamente como fixture de test de arquitectura y checkpoint.
- El backbone se inicializo de forma aleatoria y solo se entreno sobre un corpus de juguete; no se usaron pesos preentrenados.
- La profundidad esta reducida (4 capas frente a 78), por lo que las limitaciones de profundidad del fixture no reflejan el comportamiento de la arquitectura completa.
- MTP no se entreno por separado: sus proyecciones son inicializaciones sinteticas y los pesos de decoder se copiaron del backbone. No hay evidencia de calidad de borradores ni de aceleracion.
- La carga basada en modelo de MTP falla en este fixture: el patron de checkpoint de upstream espera la capa 78 y los tensores MTP comienzan en la capa 4. No se aplico parche al loader.
- La cuantizacion dependiente de calibracion de MTP queda pendiente como trabajo futuro.
- La ejecucion de MTP no esta verificada; el intento con vLLM encontro un desajuste de ABI en la extension DeepGEMM.
- La perplejidad de juguete baja (1,44) no implica generalizacion ni calidad: mide integridad de aprendizaje y de recarga sobre el mismo corpus de entrenamiento.
- Un ensayo de cuantizacion mas amplio que incluia embeddings y routers produjo mala perplejidad del backbone y no se publico; las exclusiones son parte del artefacto validado.
- Diferencias entre GLM/DeepSeek con carga MTP basada en modelo en Transformers 5.15.0 (fallo) y 5.17.0 (entorno probado); 5.16 no se probo.
- Riesgo de alucinacion: no aplicable en el sentido habitual, porque el modelo no ha sido entrenado para generar texto coherente; su salida no debe interpretarse como informacion fiable.
- Sesgos conocidos: no disponibles.
- Restricciones de licencia: el modelo se publica bajo MIT, pero la arquitectura y el tokenizer proceden de zai-org/GLM-5, cuyo aviso de licencia y atribucion deben respetarse al redistribuir.
- Cualquier uso en produccion, demo publica o evaluacion de capacidades constituye un uso indebido del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/GLM-5-0.88B-MTP-PR3225-FP8-Dynamic-MFPTQ
- Modelo base: https://huggingface.co/inference-optimization/GLM-5-0.88B-MTP-PR3225
- Arquitectura y tokenizer originales (zai-org/GLM-5, revision `c183ef8c61faee82855eca1ed9bb3a9a7ce3b0b2`): https://huggingface.co/zai-org/GLM-5/tree/c183ef8c61faee82855eca1ed9bb3a9a7ce3b0b2
- Pull request de LLM Compressor #3225: https://github.com/vllm-project/llm-compressor/pull/3225
- Flujo de trabajo tiny-model del repositorio de LLM Compressor (commit `2d5242056a8a00028686a303771ffc8e2fe27d07`): https://github.com/vllm-project/llm-compressor/tree/2d5242056a8a00028686a303771ffc8e2fe27d07/.agents/skills/create-tiny-model
- LLM Compressor, commit probado `2d52420`: https://github.com/vllm-project/llm-compressor/commit/2d5242056a8a00028686a303771ffc8e2fe27d07
- compressed-tensors, commit probado `e69c8dc`: https://github.com/vllm-project/compressed-tensors/commit/e69c8dc58aa152e5f5e36e85800ec1d2e7de5271
- Ficheros de validacion del repo: `validation.json` y `artifact-manifest.json` (referenciados en la model card, dentro del propio repositorio de HuggingFace)
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron unicamente definiciones genericas del termino "inferencia" en diccionarios y enciclopedias, sin relacion con este modelo.
