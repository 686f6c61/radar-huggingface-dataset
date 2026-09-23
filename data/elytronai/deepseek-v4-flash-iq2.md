# ElytronAI/DeepSeek-v4-Flash-IQ2

## Resumen

DeepSeek-v4-Flash-IQ2 es una cuantizacion de 2 bits del checkpoint multimodal `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp`, publicada por ElytronAI con el identificador `ElytronAI/DeepSeek-v4-Flash-IQ2`. Pertenece a la familia "Flash", en la que el nombre sin sufijo designa el repack de precision fuente y un sufijo marca una desviacion respecto a el. En este caso los expertos enrutados del modelo de mezcla de expertos (MoE) se almacenan en formato `iq2_xxs_mmq_k` (2,0625 bits por peso), lo que reduce el peso del repositorio a 92,2 GB, frente a los ~168 GB de la variante sin sufijo, que conserva el FP4 propio del checkpoint upstream.

El modelo mantiene la naturaleza vision-lenguaje del checkpoint base (pipeline `image-text-to-text`) y esta disenado para ejecutarse unicamente sobre el motor pulsar, con un layout de tensores propio y metadatos autodescriptivos por shard. Su relevancia practica es que permite alojar un modelo multimodal de gran tamano en un unico dispositivo con memoria unificada: la propia model card indica que cabe en una GB10 con ~121 GB utilizables, algo imposible para la variante de 168 GB.

No se dispone de datos sobre numero de parametros, longitud de contexto, composicion del entrenamiento ni idiomas soportados, ya que la informacion proporcionada se limita a las caracteristicas de la cuantizacion y del empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (vision-lenguaje), con layout de tensores personalizado de pulsar |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (`iq2_xxs_mmq_k`, 2,0625 bpw) en expertos enrutados; MXFP4 en expertos del drafter; MXFP8 en atencion, densas y expertos compartidos; FP8 E4M3 en una proyeccion de cabeza del drafter; BF16/F32/I32 nativos en normas, router, embeddings y parametros de hiperconexion |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con metodo `pulsar-safetensors` (tensores de layout almacenados como blobs planos `U8`); convertido desde GGUF |
| Tamano del repositorio | 92,2 GB |
| Pipeline | image-text-to-text |
| Libreria | pulsar |
| Modelo base | deepseek-ai/DeepSeek-V4-Flash-Vision-Exp (revision 6821d6ad3681a4b137b066b76094fa82ebd0a380) |
| Relacion con el base | quantized |

## Arquitectura y entrenamiento

El modelo es una cuantizacion de un MoE multimodal. La model card detalla que los expertos enrutados principales ocupan 43 capas con 256 expertos cada una, almacenados con bloques IQ2_XXS de 66 bytes por cada 256 elementos y orden de bloque k-major. Ademas, existe un drafter (MTP) con 3x256 expertos enrutados en `cutlass_mxfp4`, atencion, proyecciones densas y expertos compartidos en `mxfp8_lt`, una proyeccion de cabeza del drafter en `fp8_e4m3_soa_k`, y normas, router, embeddings y parametros de hiperconexion en precision nativa (BF16/F32/I32). Los expertos se escriben back-to-back sin padding entre ellos, de modo que un kernel los direcciona como `base + xid * expert_bytes`.

La cuantizacion de los expertos enrutados se realizo a IQ2_XXS contra una imatrix de activacion de prisma Vision-Exp (hash `ebb3d9da1745a8948e53063f8fb5fdf1f585dc9afbc577cf7ae8cfedb5333cf9`, 129 entradas); las proyecciones densas se dejaron en MXFP8, el embedding y la cabeza en BF16, y los expertos del drafter en MXFP4, lossless respecto al FP4 propio del checkpoint base. El artefacto conserva escalas fusionadas dentro del mismo tensor (528 planos `.scale` del base no tienen contrapartida), transpone deliberadamente `markov_head_w2`, aplana `confidence_head.proj` a `(4352,)` y omite seis tensores de peso muerto correspondientes a sesgos de capas con enrutado por hash (`layers.{0,1,2}.ffn.gate.bias`) y a los sesgos del drafter (`mtp.{0,1,2}.ffn.gate.bias_vl`). No se dispone de informacion sobre volumen de tokens, composicion del dataset, RLHF/DPO ni sobre el proceso de entrenamiento del checkpoint original.

## Capacidades

- Procesamiento de imagen y texto (pipeline `image-text-to-text`): el checkpoint base es de tipo Vision-Exp y el forward distingue enrutado de texto (`tid2eid`) y de imagen (`bias_vl`).
- Generacion de texto y capacidades heredadas del modelo base DeepSeek-V4-Flash-Vision-Exp; el detalle concreto no esta documentado en la informacion proporcionada.
- Ejecucion de un MoE con 43 capas de 256 expertos enrutados mas un drafter MTP de 3x256 expertos.
- Soporte de decodificacion especulativa mediante el drafter (MTP) incluido en el checkpoint.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue en un unico dispositivo con memoria unificada: con 92,2 GB de pesos, el modelo cabe en una GB10 con ~121 GB utilizables, lo que permite servir un MoE multimodal sin repartirlo entre varias GPU.
- Analisis de documentos con imagenes: al ser `image-text-to-text`, puede emplearse para tareas de comprension que combinan texto e imagen (por ejemplo, extraccion o descripcion de contenido visual) sobre el motor pulsar.
- Investigacion en cuantizacion extrema: sirve como referencia para estudiar el impacto de IQ2_XXS (2,0625 bpw) frente al FP4 del checkpoint base, midiendo degradacion sobre un mismo modelo.
- Reduccion de huella de memoria en infraestructura existente: al pasar de ~168 GB a 92,2 GB, permite reutilizar nodos con menos VRAM sin cambiar de modelo base.
- Desarrollo de kernels y layouts personalizados: los metadatos autodescriptivos por shard (`pulsar.tensors`, `pulsar.experts`, `pulsar.kv_arch`) permiten probar kernels que direccionan expertos back-to-back desde un unico puntero.
- Experimentacion con decodificacion especulativa: el drafter MTP incluido facilita evaluar tecnicas de aceleracion sobre un modelo multimodal cuantizado.
- Validacion de pipelines de conversion GGUF a safetensors: el artefacto documenta verificacion byte a byte contra el GGUF de origen, util como caso de prueba de herramientas de empaquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~92,2 GB solo para los pesos, mas el overhead de activaciones y cache KV, que no esta cuantificado en la informacion disponible.
- GPU recomendadas: NVIDIA GB10 (citada explicitamente en la model card, ~121 GB utilizables). Alternativas por capacidad: 2x H100 80 GB, 2x A100 80 GB o configuraciones con memoria agregada superior a ~92 GB.
- GPU de consumo: no; 92,2 GB superan la memoria de cualquier GPU de consumo individual (por ejemplo, RTX 4090 con 24 GB). Tampoco esta documentado su reparto entre varias GPU de consumo.
- Opciones de despliegue: exclusivamente el motor pulsar. `transformers` y vLLM no pueden cargarlo, ya que no disponen de decodificador para los layouts fusionados y los blobs `U8` carecen de significado sin los metadatos. No hay soporte documentado para llama.cpp, Ollama, TGI ni otros servidores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Peso / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ElytronAI/DeepSeek-v4-Flash-IQ2 | no disponible | no disponible | 92,2 GB; expertos enrutados IQ2_XXS (2,0625 bpw) | MIT | safetensors para motor pulsar |
| DeepSeek-v4-Flash (sin sufijo, misma familia) | no disponible | no disponible | ~168 GB; FP4 propio del checkpoint upstream | no disponible en la informacion | repack de precision fuente para pulsar |
| deepseek-ai/DeepSeek-V4-Flash-Vision-Exp (base) | no disponible | no disponible | no disponible | no disponible en la informacion | checkpoint fuente de deepseek-ai |

No se dispone de datos de rendimiento comparado entre estas variantes; la unica diferencia documentada es el tipo de cuantizacion de los expertos enrutados y el peso resultante.

## Limitaciones y advertencias

- Compatibilidad restringida al motor pulsar: `transformers`, vLLM y otros cargadores estandar fallan de forma explicita (el `quantization_config.quant_method` es `pulsar-safetensors`). No es un modelo plug-and-play.
- Cuantizacion agresiva: los expertos enrutados estan a 2,0625 bpw, lo que puede degradar la calidad respecto al checkpoint de precision fuente; no hay benchmarks publicados que cuantifiquen esa perdida.
- Idioma y cobertura linguistica sin documentar: no se especifican los idiomas soportados.
- Riesgo de alucinacion: inherente a los modelos generativos; no cuantificado en la informacion disponible.
- Sesgos: no documentados.
- Validacion externa nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion por terceros.
- Licencia MIT para los pesos, lo que permite uso comercial; no obstante, la dependencia obligatoria del motor pulsar implica revisar por separado las condiciones de ese software, sobre las que la informacion proporcionada no aporta datos.
- Los blobs `U8` solo son interpretables junto con los metadatos `pulsar.*`; manipular o recortar los ficheros sin ellos inutiliza el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ElytronAI/DeepSeek-v4-Flash-IQ2
- Checkpoint base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
