# FangZhang5959/Qwen3.8-Flash-Next-MTP512-BF16

## Resumen

Qwen3.8-Flash-Next-MTP512-BF16 es un checkpoint de pesos independiente publicado por el usuario FangZhang5959 en Hugging Face. No se trata de un modelo generativo completo, sino de un conjunto de pesos de borrador (draft) para decodificación especulativa basada en MTP (multi-token prediction), extraídos de forma nativa y sin pérdida del modelo Qwen/Qwen3.8-Flash-Next. Contiene exactamente 33 tensores: los 31 tensores `mtp.*`, más `model.language_model.embed_tokens.weight` y `lm_head.weight`, con un total de 3.878.549.248 parámetros y un peso de repositorio de 7,8 GB (7,224 GiB de tensores netos en dos shards).

Su función es acelerar la inferencia de variantes podadas del modelo principal (por ejemplo, las versiones `k192` o `k128` de la familia ZH-Writing-RP) manteniendo intactos los 512 expertos del módulo MTP, desacoplados del número de expertos del modelo troncal. El objetivo declarado es ofrecer decodificación especulativa heterogénea sobre `vllm==0.34.0` sin necesidad de parchear la librería, gracias a un truco de configuración (`quantization_config` con `exclude_modules: ["*"]`) que mantiene los 33 tensores en BF16 puro y evita el error estricto `pop_missing_shards()` al cargar el shard de relleno de 12 filas de `GatedResidual`.

Es relevante para desarrolladores que ya trabajan con la familia Qwen3.8-Flash-Next y buscan mejorar el throughput en GPUs de consumo, ya que se ha verificado en una RTX 5070 Ti de 16 GiB bajo WSL2. No obstante, el modelo tiene 0 descargas y 0 likes en el momento de la ficha, y su licencia Qwen Community 1.0 impone restricciones comerciales relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Módulo MTP (multi-token prediction) para decodificación especulativa, derivado de un transformer MoE con 512 expertos en el módulo MTP |
| Parametros totales | 3.878.549.248 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos puros); compatible con troncales cuantizados W4A16_NVFP4 Marlin y W3A16 Humming |
| Idiomas soportados | multilingüe (etiqueta `multilingual`; sin listado explícito de idiomas) |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (2 shards) |

## Arquitectura y entrenamiento

El checkpoint no es un modelo entrenado desde cero, sino una extracción byte a byte de los pesos MTP del modelo Qwen3.8-Flash-Next. Incluye 31 tensores `mtp.*` más las matrices de embeddings y `lm_head`, y conserva los 512 expertos del módulo MTP sin podar, independientemente del número de expertos del modelo troncal al que se acople. El autor indica que los 33 tensores son 100 % idénticos a los pesos BF16 de origen y que se ha registrado un manifiesto SHA-256 (`sha256_manifest.json`) para auditoría offline.

La innovación técnica principal es la compatibilidad sin parches con `vllm==0.34.0`: se escribe un `quantization_config` con `exclude_modules: ["*"]` para que todos los tensores MTP permanezcan en BF16 puro bajo el backend `TRITON Unquantized MoE`, y para saltar el error estricto que provoca la carga del shard de relleno de 12 filas de `GatedResidual`. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO, ya que el autor no los documenta en la model card.

## Capacidades

- Decodificación especulativa MTP: actúa como modelo borrador para acelerar la generación del modelo troncal mediante `num_speculative_tokens`.
- Acoplamiento heterogéneo: funciona con troncales podados (`k192`, `k128`) que hayan eliminado los tensores `mtp.*` y mantengan `text_config.mtp_num_hidden_layers=1`.
- Compatibilidad con cuantizaciones del troncal: probado con `W4A16_NVFP4` Marlin y `W3A16` Humming.
- Independencia del número de expertos: mantiene 512 expertos MTP aunque el troncal tenga menos.
- Neutralidad de idioma: el autor lo describe como `language-neutral`, aplicable a versiones de escritura en chino, inglés y multilingües.
- No es un modelo de chat ni de generación autónoma: no se le pueden pedir tareas de razonamiento, código, matemáticas o visión de forma directa.

## Casos de uso

- Aceleración de inferencia en local: acoplar este draft a una variante podada de Qwen3.8-Flash-Next en `vllm==0.34.0` para aumentar el throughput en GPUs de consumo, como la RTX 5070 Ti de 16 GiB empleada en la verificación.
- Escritura creativa en chino: el autor lo orienta a los cuatro perfiles Safetensors de `ZH-Writing-RP` y a futuras versiones V2 en chino, inglés y multilingüe, donde la decodificación especulativa reduce la latencia por token.
- Role-play y narrativa interactiva: al ser un draft independiente del idioma, sirve para acelerar respuestas multi-turno en personajes conversacionales sin reentrenar el troncal.
- Investigación en decodificación especulativa: permite estudiar el comportamiento de MTP con 512 expertos frente a troncales con distinto número de expertos, sin modificar la librería de inferencia.
- Despliegue en pipelines de CI/CD de vLLM: al no requerir parches sobre `vllm==0.34.0`, se puede integrar en imágenes Docker reproducibles con la configuración `--speculative-config` documentada.
- Experimentación académica con cuantizaciones mixtas: comparar el rendimiento de Marlin NVFP4 frente a Humming W3A16 usando el mismo draft BF16 como referencia constante.
- Pruebas de compatibilidad ROCm: aunque el autor advierte de una limitación en `maybe_fuse_shared_experts`, sirve para evaluar el comportamiento del draft en entornos AMD.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son medidas de throughput en una RTX 5070 Ti de 16 GiB bajo WSL2, con un troncal de 3 capas homogéneo y `vllm==0.34.0` sin modificar:

| Configuracion | Throughput medido |
|---|---|
| Troncal W4A16_NVFP4 Marlin + draft MTP512 BF16 | 34,68 tok/s |
| Troncal W3A16 Humming + draft MTP512 BF16 | 84,73 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, lo cual es coherente con la naturaleza del checkpoint: no es un modelo evaluable de forma independiente.

## Requisitos de hardware

- VRAM estimada para el draft: aproximadamente 7,25 GiB solo para los pesos BF16 del checkpoint, a los que hay que sumar la memoria del troncal y las cachés KV.
- GPU recomendadas: RTX 5070 Ti de 16 GiB (verificada por el autor), y por capacidad, A100, H100, RTX 4090 o L40S para troncales más grandes.
- En GPU de consumo: cabe en tarjetas de 16 GiB o más si el troncal está cuantizado a W4A16 o W3A16; en 8-12 GiB requeriría troncales muy podados.
- Opciones de despliegue: `vllm==0.34.0` es el único entorno verificado, con `--speculative-config '{"method":"mtp","model":"./Qwen3.8-Flash-Next-MTP512-BF16","num_speculative_tokens":1}'`. No hay soporte documentado para llama.cpp, Ollama o TGI.
- Latencia y throughput: 34,68 tok/s con troncal NVFP4 Marlin y 84,73 tok/s con troncal W3A16 Humming, medidos en el hardware indicado.
- Nota ROCm: la ruta de fusión de expertos compartidos puede verse limitada porque `maybe_fuse_shared_experts` lee `num_experts` del troncal; la ruta CUDA de NVIDIA no se ve afectada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MTP512-BF16 | 3.878.549.248 | no disponible | Draft MTP para decodificación especulativa | qwen-community-1.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-Flash-Next (modelo base) | no disponible | no disponible | Modelo generativo completo | qwen-community-1.0 | Hugging Face |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2 | no disponible | no disponible | Variante abliterated del base | no disponible | Hugging Face |

No se dispone de información sobre otros drafts MTP independientes comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin un troncal compatible no genera texto; su uso aislado no tiene sentido.
- Dependencia estricta de `vllm==0.34.0`: no se documenta compatibilidad con otras versiones ni con otros motores de inferencia.
- Restricciones de licencia: la Qwen Community License 1.0 permite uso personal y local, modificación y redistribución con aviso de copyright, pero exige autorización adicional de Qwen para MaaS comercial y para productos comerciales de asistencia de programación u ofimática con IA.
- Riesgo de alucinación: heredado del troncal Qwen3.8-Flash-Next, no evaluado de forma independiente para este draft.
- Sesgos: no documentados por el autor; al derivar de un modelo base multilingüe, pueden persistir sesgos del corpus original.
- Limitación en ROCm: la fusión de expertos compartidos puede no funcionar correctamente en GPUs AMD.
- Madurez: 0 descargas y 0 likes, publicación muy reciente (27 de noviembre de 2026) y sin validación comunitaria independiente.
- Idioma: aunque se etiqueta como multilingüe, la documentación está principalmente en chino e inglés y no detalla la cobertura real por idioma.
- Origen derivado: parte de una variante abliterated (`Huihui-Qwen3.8-Flash-Next-abliterated-v2`), lo que puede afectar a los filtros de seguridad del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/FangZhang5959/Qwen3.8-Flash-Next-MTP512-BF16
- GitHub del autor: https://github.com/FangZhangTNS/Qwen3.8-Flash-Next-ZH-Writing-RP
- ModelScope (espejo): https://modelscope.cn/models/FangZhangTNS/Qwen3.8-Flash-Next-MTP512-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante abliterated de origen: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2
- Licencia: https://huggingface.co/FangZhang5959/Qwen3.8-Flash-Next-MTP512-BF16/blob/main/LICENSE
