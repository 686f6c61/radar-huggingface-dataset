# inference-optimization/GLM-4.7-Flash-0.82B-MTP-PR3225

## Resumen

GLM-4.7-Flash-0.82B-MTP-PR3225 es un *checkpoint* de arquitectura reducida creado por el usuario inference-optimization como *fixture* de pruebas para el PR #3225 de LLM Compressor. No es un modelo de lenguaje de produccion: su *backbone* se inicializo de forma aleatoria y se entreno sobre un corpus de texto de juguete siguiendo el flujo de trabajo "tiny-model" del propio repositorio de LLM Compressor, sin reutilizar pesos preentrenados. Su proposito es validar la carga, la cuantizacion y el guardado de un modelo con arquitectura GLM-4.7-Flash y capa MTP (*multi-token prediction*).

La arquitectura reproduce la clase `Glm4MoeLiteForCausalLM` del modelo zai-org/GLM-4.7-Flash, pero con dimensiones reducidas: 47 capas, `hidden_size` de 768, 8 expertos enrutados con 4 activos por token y una unica capa MTP. El total de parametros es de 821.339.512 (0,821B), de los cuales 808.008.192 corresponden al *backbone* y 13.330.944 a la proyeccion MTP. La estimacion de parametros activos del *backbone* es de 645.216.768. El modelo se distribuye en BF16, en 5 *shards* de safetensors con 1.805 tensores indexados.

Su relevancia es exclusivamente de ingenieria: permite reproducir en dos GPU el ciclo completo de cuantizacion FP8_DYNAMIC, guardado fragmentado y generacion en vLLM sin necesidad de descargar un modelo de gran tamano. Los resultados publicados son comprobaciones de ejecucion (carga, *save*, generacion) y una perplejidad de juguete de 1,534234 sobre el mismo corpus de entrenamiento, no una medida de calidad ni de generalizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Glm4MoeLiteForCausalLM` (transformer MoE con proyecciones latentes de bajo rango y capa MTP) |
| Parametros totales | 821.339.512 (0,821B) |
| Parametros activos | 645.216.768 estimados en el *backbone* (incluye embeddings y componentes densos; excluye MTP; no es una medida de FLOPs) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (origen); FP8_DYNAMIC validado con LLM Compressor. No hay GGUF |
| Idiomas soportados | no disponible (tokenizador heredado de zai-org/GLM-4.7-Flash; el modelo no tiene capacidades linguisticas reales) |
| Licencia | MIT |
| Formato de pesos | safetensors (5 *shards* indexados, 1.805 tensores) |
| Parametros del *backbone* | 808.008.192 |
| Parametros MTP | 13.330.944 |
| Capas ocultas | 47 |
| `hidden_size` | 768 |
| `intermediate_size` | 3072 |
| `moe_intermediate_size` | 384 |
| Expertos enrutados / activos por token | 8 / 4 |
| Cabezas de atencion / KV | 8 / 8 |
| `q_lora_rank` / `kv_lora_rank` | 512 / 256 |
| Capas MTP | 1 |
| Precision de origen | BF16 |
| Tamano del repositorio | 1,7 GB |
| Descargas / *likes* | 0 / 0 |
| Fecha de creacion | 2026-10-07 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `Glm4MoeLiteForCausalLM`, una variante MoE con 47 capas y proyecciones de query y de clave/valor con rango reducido (`q_lora_rank` = 512, `kv_lora_rank` = 256), coherente con un esquema de atencion latente heredado del linaje GLM/DeepSeek. Frente a la configuracion original de GLM-4.7-Flash, se reducen todas las dimensiones: `hidden_size` de 2048 a 768, `intermediate_size` de 10240 a 3072, `moe_intermediate_size` de 1536 a 384, expertos enrutados de 64 a 8, cabezas de atencion de 20 a 8, `q_lora_rank` de 768 a 512 y `kv_lora_rank` de 512 a 256. La profundidad de 47 capas se mantiene deliberadamente para que el indexado del checkpoint MTP coincida con el del modelo *upstream*. La configuracion autoritativa es el `config.json` guardado.

El entrenamiento es de juguete: semilla aleatoria 3225, optimizador AdamW con tasa de aprendizaje 0,0004 y *weight decay* 0,01, tamano de lote 2 y texto truncado a 160 tokens. El proceso se detuvo tras tres comprobaciones consecutivas con perplejidad de juguete menor o igual a 3. No se usaron pesos preentrenados ni fases de RLHF o DPO. La capa MTP no se entreno por separado: sus proyecciones son inicializaciones sinteticas y los pesos del decodificador se copiaron de bloques del *backbone* ya entrenados, por lo que estos artefactos no demuestran calidad de aceptacion de *draft* ni aceleracion de inferencia.

## Capacidades

- Generacion de texto a nivel de *fixture*: produce continuaciones coherentes unicamente sobre el corpus de juguete con el que se entreno (perplejidad de recarga de 1,534234 en BF16).
- Carga y ejecucion de la arquitectura GLM-4.7-Flash con la clase `Glm4MoeLiteForCausalLM` en Transformers.
- Carga opt-in de la capa MTP mediante el contexto `load_context(..., load_mtp=True)` de LLM Compressor.
- Cuantizacion FP8_DYNAMIC con LLM Compressor sobre el *backbone* y sobre la capa MTP.
- Guardado fragmentado en safetensors (5 *shards*) y recarga integra del *checkpoint*.
- Generacion con vLLM: en la prueba FP8 con MTP se redactaron 58 tokens y se aceptaron 3, con salida *greedy* identica a la generacion FP8 ordinaria.
- No dispone de *tool calling*, capacidades de agente, vision, audio, razonamiento multietapa ni capacidades multilingues verificadas. No se declara ningun idioma soportado.

## Casos de uso

- *Fixture* de integracion continua para LLM Compressor: ejecutar el PR #3225 en un *runner* de dos GPU sin descargar pesos de gran tamano, comprobando que la receta FP8_DYNAMIC se aplica y se guarda correctamente.
- Prueba de regresion de carga MTP en Transformers: verificar que el contexto `load_context` instancia la capa MTP y que el modelo se reconstruye sin parchear el cargador. La model card documenta que la carga MTP de GLM/DeepSeek fallo en Transformers 5.15.0, por lo que este *fixture* sirve para fijar la version minima validada (5.17.0).
- *Smoke test* de servicio en vLLM: levantar el modelo con vLLM 0.30.0 y validar el camino de generacion, el troceado de *shards* y la compatibilidad con `endpoints_compatible`.
- Validacion de IO de *checkpoints* fragmentados: comprobar hashes y manejadores contra `artifact-manifest.json` y verificar la lectura de 5 *shards* y 1.805 tensores en entornos con almacenamiento limitado.
- Prueba de recetas de cuantizacion especificas de MTP: dado que la cuantizacion MTP dependiente de calibracion queda como trabajo pendiente, este *fixture* permite iterar sobre recetas sin coste de GPU elevado.
- Desarrollo de herramientas de cuantizacion en CPU: la carga con `device_map="cpu"` permite probar rutas de codigo de LLM Compressor y compressed-tensors en maquinas sin GPU.
- Verificacion de compatibilidad de versiones: reproducir la matriz Transformers 5.15.0 / 5.17.0, Torch 2.14.0+cu130, LLM Compressor `2d52420` y compressed-tensors `e69c8dc`.
- Banco de pruebas de interoperabilidad de tokenizador: validar que los *assets* del tokenizador de GLM-4.7-Flash se cargan junto al *checkpoint* reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos numericos publicados son comprobaciones de integridad, no de calidad:

| Metrica | Valor | Naturaleza del dato |
|---|---|---|
| Perplejidad de juguete (*backbone* BF16 recargado) | 1,534234 | Mismo corpus pequeno de entrenamiento; demuestra integridad de aprendizaje y recarga, no generalizacion |
| Tokens redactados / aceptados en prueba MTP FP8 | 58 / 3 | Comprobacion de ejecucion; no es una medida de aceleracion |
| Coincidencia de salida *greedy* FP8 con y sin MTP | Coincidente | Comprobacion de ejecucion |
| MMLU, HumanEval, GSM8K u otros | no disponible | No publicados |

## Requisitos de hardware

- VRAM estimada para el *backbone* en BF16: aproximadamente 1,6 GB solo de pesos (808 millones de parametros) y en torno a 1,7 GB contando la capa MTP. Con cache KV y activaciones para lotes pequenos, el consumo se mantiene previsiblemente por debajo de 4 GB.
- VRAM estimada en FP8: en torno a 0,9 GB de pesos, con margen adicional para calibracion y activaciones.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090, asi como en GPU de datacenter (A100, H100) para pruebas de paralelismo. La validacion declarada se hizo en dos GPU.
- Despliegue validado: vLLM 0.30.0 para servicio y Transformers 5.17.0 (con `attn_implementation="eager"`) para carga directa. LLM Compressor y compressed-tensors son necesarios para el camino FP8 y para la carga MTP.
- No hay soporte GGUF documentado, por lo que llama.cpp y Ollama no estan cubiertos por la validacion del autor.
- Latencia y *throughput*: no disponibles. La model card indica explicitamente que la prueba MTP (58 tokens redactados, 3 aceptados) no constituye una medicion de velocidad.
- Entorno probado: Transformers 5.17.0, Torch 2.14.0+cu130, LLM Compressor `2d52420`, compressed-tensors `e69c8dc`, vLLM 0.30.0. La carga MTP fallo en Transformers 5.15.0 y la version 5.16 no se probo.

## Comparativa con modelos similares

No se identifican en la informacion disponible modelos de produccion comparables con benchmarks publicados, ya que este repositorio es un *fixture* de pruebas. La unica comparacion documentada es arquitectonica, frente al modelo del que se hereda la arquitectura y el tokenizador:

| Parametro | Este *fixture* | GLM-4.7-Flash (original) |
|---|---|---|
| Clase en Transformers | `Glm4MoeLiteForCausalLM` | `Glm4MoeLiteForCausalLM` |
| `num_hidden_layers` | 47 | 47 |
| `hidden_size` | 768 | 2048 |
| `intermediate_size` | 3072 | 10240 |
| `moe_intermediate_size` | 384 | 1536 |
| Expertos enrutados | 8 | 64 |
| Expertos por token | 4 | 4 |
| Cabezas de atencion / KV | 8 / 8 | 20 / 20 |
| `q_lora_rank` / `kv_lora_rank` | 512 / 256 | 768 / 512 |
| Capas MTP | 1 | no definido explicitamente |
| Parametros totales | 821.339.512 | no disponible |
| Entrenamiento | *backbone* inicializado aleatoriamente, corpus de juguete | modelo *upstream* preentrenado (detalles no incluidos en la informacion disponible) |
| Licencia | MIT | MIT (segun la procedencia citada, revision `7dd20894a642a0aa287e9827cb1a1f7f91386b67`) |
| Uso previsto | *fixture* de pruebas de cuantizacion | modelo de lenguaje de proposito general |

## Limitaciones y advertencias

- No es un modelo de produccion. El *backbone* se inicializo de forma aleatoria y se entreno sobre un corpus de juguete; no debe usarse para tareas reales de generacion.
- Riesgo de alucinacion total: al no disponer de conocimiento factual preentrenado, cualquier salida fuera del corpus de juguete sera inventada.
- La capa MTP no se entreno por separado: sus proyecciones son inicializaciones sinteticas, por lo que no permiten evaluar calidad de *draft* ni *speedup* de decodificacion especulativa.
- La perplejidad de 1,534234 se midio sobre el mismo corpus de entrenamiento y no indica capacidad de generalizacion.
- Sin datos de sesgos: no se ha realizado ninguna evaluacion de sesgo o toxicidad y no existe informacion al respecto.
- Sin idiomas declarados y sin evaluacion multilingue. El tokenizador procede de GLM-4.7-Flash, pero el modelo no ha adquirido competencia linguistica.
- La longitud de contexto no esta documentada en la informacion disponible.
- Compatibilidad fragil: la carga MTP fallo en Transformers 5.15.0 y la 5.16 no se probo. Requiere ademas versiones concretas de LLM Compressor y compressed-tensors.
- La cuantizacion MTP dependiente de calibracion queda como trabajo pendiente segun el autor.
- Licencia MIT para este repositorio, con atribucion obligada de arquitectura y tokenizador a zai-org/GLM-4.7-Flash. Conviene verificar los terminos del modelo *upstream* si se reutiliza su tokenizador en otros contextos.
- Cero descargas y cero *likes*, con fecha de creacion y actualizacion separadas por tres segundos: es un artefacto recien publicado y sin adopcion externa verificable.
- Los resultados de busqueda web disponibles no contienen informacion tecnica relevante sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/GLM-4.7-Flash-0.82B-MTP-PR3225
- Modelo *upstream* de arquitectura y tokenizador: https://huggingface.co/zai-org/GLM-4.7-Flash
- Revision concreta del modelo *upstream*: https://huggingface.co/zai-org/GLM-4.7-Flash/tree/7dd20894a642a0aa287e9827cb1a1f7f91386b67
- Pull request de LLM Compressor: https://github.com/vllm-project/llm-compressor/pull/3225
- Ejemplo de cuantizacion MTP de GLM: https://github.com/vllm-project/llm-compressor/blob/2d5242056a8a00028686a303771ffc8e2fe27d07/examples/quantization_w8a8_fp8/glm4_5_air_mtp.py
- Flujo de trabajo *tiny-model* del repositorio: https://github.com/vllm-project/llm-compressor/tree/2d5242056a8a00028686a303771ffc8e2fe27d07/.agents/skills/create-tiny-model
- Commit de LLM Compressor usado en las pruebas: https://github.com/vllm-project/llm-compressor/commit/2d5242056a8a00028686a303771ffc8e2fe27d07
- Commit de compressed-tensors usado en las pruebas: https://github.com/vllm-project/compressed-tensors/commit/e69c8dc58aa152e5f5e36e85800ec1d2e7de5271
- Resultados estructurados de validacion (relativo al repositorio): `validation.json`
- Manifiesto de artefactos con hashes (relativo al repositorio): `artifact-manifest.json`
