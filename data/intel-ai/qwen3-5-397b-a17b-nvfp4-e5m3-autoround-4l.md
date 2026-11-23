# intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound-4L

## Resumen

Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound-4L es una variante estructuralmente reducida del checkpoint cuantizado NVFP4 E5M3 de Qwen3.5-397B-A17B, publicado por el equipo intel-ai. No se trata de un reentrenamiento, destilación ni recuantización: todos los tensores se copian literalmente del checkpoint fuente y lo unico que cambia es el numero de capas del modelo de lenguaje, que pasa de 60 a 4. Se conservan la torre visual completa y la capa MTP (multi-token prediction).

El modelo base original, Qwen/Qwen3.5-397B-A17B, es un transformer MoE multimodal con 397.000 millones de parametros totales y 17.000 millones activos por token, 512 expertos enrutados por capa y una ventana de contexto de 262.144 posiciones. Esta version reducida mantiene esa arquitectura pero con solo 4 capas de lenguaje (3 de atencion lineal y 1 de atencion completa), lo que deja un total real de 35.373.294.064 parametros segun los safetensors publicados.

Su relevancia es fundamentalmente practica para investigacion e ingenieria: permite estudiar el pipeline de cuantizacion AutoRound NVFP4 E5M3, validar runtimes compatibles y prototipar integraciones multimodales con un peso de 23,5 GB en lugar de las decenas o cientos de GB del modelo completo. No es un modelo para produccion ni para tareas de razonamiento reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (Qwen3.5 MoE) con atencion hibrida lineal/completa, torre visual y capa MTP |
| Parametros totales | 35.373.294.064 (segun safetensors) |
| Parametros activos | 10 expertos enrutados por token sobre 512 totales; cifra exacta de parametros activos no disponible |
| Longitud de contexto | 262.144 posiciones (max_position_embeddings) |
| Tipos de cuantizacion | NVFP4 E5M3 (4 bits, group_size 16, simetrica) con activaciones 4 bits dinamicas; modulos sensibles en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (5 shards, 21,88 GiB / 23,49 GB), empaquetado `auto_round:llm_compressor_nvfp4_e5m3` |
| Capas de lenguaje | 4 (`linear_attention`, `linear_attention`, `linear_attention`, `full_attention`) |
| Hidden size | 4096 |
| Cabezas de atencion / KV | 32 / 2 |
| Dimension de cabeza | 256 |
| Expertos enrutados | 512 |
| Tamano intermedio MoE / experto compartido | 1024 / 1024 |
| Vocabulario | 248.320 |
| RoPE theta | 10.000.000 |
| Capas MTP | 1 (sin embeddings dedicados) |
| Torre visual | Profundidad 27, hidden 1152, salida 4096 |
| Tensores totales | 15.807 |
| Modulos cuantizados | 7.713 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5 MoE: mezcla de expertos con 512 expertos enrutados por capa, un experto compartido y enrutamiento top-10 por token. La atencion es hibrida, combinando capas de atencion lineal con capas de atencion completa; en esta reduccion se conservan tres capas lineales y una completa. Incorpora una capa MTP (multi-token prediction) de 3.097 tensores y una torre visual de 27 bloques con 333 tensores, lo que confirma su naturaleza multimodal (texto e imagen).

No ha habido entrenamiento adicional: la reduccion se realiza a nivel de safetensors con el script `reduction/make_reduced_model.py`, copiando tensor a tensor las capas fuente 0, 1, 2 y 3 y reescribiendo `config.json`, el indice y `quantization_config.json`. La cuantizacion original es AutoRound 0.16.0 en modo model-free, con formato `nvfp4_v2`, 4 bits, grupo de 16 y simetria, y activaciones dinamicas de 4 bits. Permanecen en BF16 los proyectores `in_proj_a`/`in_proj_b` de atencion lineal, las compuertas del router y del experto compartido, las capas lineales de la torre visual, `lm_head`, embeddings, RMSNorm, biases, `A_log`, `conv1d`, `dt_bias`, `patch_embed` y `pos_embed`. No es un checkpoint compatible con compressed-tensors estandar: requiere un runtime que entienda el empaquetado AutoRound E5M3.

## Capacidades

- Generacion de texto y modelado de lenguaje, limitado por la reduccion a 4 capas.
- Procesamiento multimodal de imagenes gracias a la torre visual completa (profundidad 27, salida 4096 alineada con el hidden de texto).
- Decodificacion especulativa mediante la capa MTP conservada.
- Soporte estructural de tool calling y function calling heredado del tokenizador y plantilla del modelo base (no verificado en esta variante reducida).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.
- Utilidad principal como banco de pruebas de cuantizacion NVFP4 y de runtimes AutoRound, no como modelo de proposito general.

## Casos de uso

- Validacion de runtimes AutoRound E5M3: sirve para comprobar que un motor de inferencia carga correctamente el empaquetado `llm_compressor_nvfp4_e5m3` sin necesidad de disponer del checkpoint completo de 397B.
- Pruebas de integracion multimodal: al conservar la torre visual intacta, permite verificar el pipeline imagen-texto (preprocesado, patch embedding, merger a 4096) en un entorno de 23,5 GB.
- Benchmarking de decodificacion especulativa: la capa MTP permite medir la ganancia de aceptacion de tokens en un modelo pequeno antes de extrapolar al modelo completo.
- Investigacion sobre reduccion estructural: util para estudiar como afecta el recorte de capas a la perplejidad y a la coherencia, comparando la salida de 4 capas frente al modelo fuente.
- CI/CD de cuantizacion: integrable en pipelines que validen que los tensores copiados, el indice y `quantization_config.json` son consistentes tras una reduccion.
- Docencia y demos: permite mostrar la anatomia de un MoE multimodal cuantizado en una sola GPU consumer o en un nodo modesto, sin infraestructura de centro de datos.
- Pruebas de carga y memoria: util para medir consumo de VRAM y latencia de un checkpoint NVFP4 de 21,88 GiB en distintas GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 24 GB para alojar los 21,88 GiB de pesos mas overhead de activaciones y cache KV; con contexto largo la demanda crece de forma notable.
- GPU recomendadas: H100, A100 80 GB, L40S o RTX 6000 Ada para margen comodo; RTX 4090 (24 GB) al limite y solo con contexto corto.
- Cabe en GPU consumer: si, en RTX 4090/5090 de 24 GB o superior, con contexto reducido y runtime compatible con NVFP4.
- Opciones de despliegue: requiere runtime AutoRound E5M3 compatible; vLLM, llama.cpp, Ollama y TGI no estan confirmados para este empaquetado. La carga con Transformers estandar puede no reconocer el formato sin el cuantizador correspondiente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound-4L | 35,37B (4 capas) | 262.144 | NVFP4 E5M3 | Apache 2.0 | Variante reducida, sin benchmarks |
| intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound | 397B totales / 17B activos | 262.144 | NVFP4 E5M3 | Apache 2.0 | Checkpoint fuente completo, 60 capas |
| Qwen/Qwen3.5-397B-A17B | 397B totales / 17B activos | 262.144 | BF16 | Apache 2.0 | Modelo base upstream multimodal |

## Limitaciones y advertencias

- La reduccion a 4 capas degrada severamente la calidad del lenguaje; no debe usarse para tareas de razonamiento, codigo o matematicas en produccion.
- No es un modelo entrenado ni destilado: la coherencia y el alineamiento del modelo original no se conservan tras el recorte.
- Requiere runtime AutoRound E5M3; la carga con Transformers estandar puede fallar o dar resultados incorrectos.
- Riesgo elevado de alucinacion y de salidas incoherentes por la profundidad reducida.
- Idiomas soportados no documentados; el comportamiento multilingue no esta verificado.
- Sesgos: no disponibles en la informacion proporcionada, aunque hereda los del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo reducido hace desaconsejable ese uso.
- El repo tiene 0 descargas y 0 likes; no hay evidencia de validacion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound-4L
- Checkpoint fuente de la reduccion: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
