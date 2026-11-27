# gpustack/DaisyRose-27B-MLX-8bit-dynamic

## Resumen

DaisyRose-27B-MLX-8bit-dynamic es una cuantizacion de 8 bits en formato MLX del modelo multimodal RadixArk/DaisyRose-27B, publicada por gpustack. El modelo original es un transformer multimodal de tipo image-text-to-text (etiquetado como qwen3_5 y qwen3.8 en los tags del repositorio) con 27.781.427.952 parametros totales, lo que lo situa en la gama de 27B. Esta version concreta esta pensada para ejecutarse en Apple Silicon mediante las librerias mlx-lm y mlx-vlm.

La relevancia de esta ficha radica en que permite desplegar un modelo multimodal de 27B en hardware Apple con un peso de aproximadamente 30,14 GiB repartido en 7 shards, manteniendo el vision tower completo en BF16 y la cabeza nativa de Multi-Token Prediction (MTP) de una capa. La cuantizacion es de tipo affine con group_size 64 y precision mixta por modulo, lo que busca minimizar la perdida de calidad frente al modelo original en BF16.

El modelo conserva la licencia Apache-2.0 del original, lo que facilita su uso comercial. No obstante, la informacion publicada por el autor es escasa en cuanto a datos de entrenamiento, benchmarks y composicion del dataset, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atencion lineal GDN y cabeza MTP de 1 capa; tags qwen3_5 / qwen3.8 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit dynamic affine, group_size 64, precision mixta por modulo (BF16 para embed_tokens, lm_head, in_proj_a/b de GDN, vision tower, RMSNorm, A_log, dt_bias, conv1d.weight; Q8G64 para el resto de proyecciones lineales) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 7 shards, ~30,14 GiB |

## Arquitectura y entrenamiento

El modelo base RadixArk/DaisyRose-27B es un transformer multimodal con un vision encoder integrado (referenciado como model.visual.* en la configuracion de cuantizacion) y una cabeza de Multi-Token Prediction de una capa (mtp.*). La presencia de modulos GDN (linear_attn.in_proj_a/b, A_log, dt_bias, conv1d.weight) sugiere componentes de atencion lineal hibrida dentro del transformer, aunque el autor no detalla la arquitectura completa. Los tags qwen3_5 y qwen3.8 apuntan a una base de la familia Qwen 3.x, si bien esto no se confirma en la model card.

Esta version concreta no entrena el modelo: aplica una cuantizacion round-to-nearest (rtn) de 8 bits con empaquetado affine estandar de MLX (mode affine, group_size 64) y overrides de precision por modulo definidos en config.json. El vision tower se preserva integramente en BF16, al igual que embed_tokens, lm_head, los parametros de normalizacion y los componentes de atencion lineal GDN. El resto de proyecciones lineales del transformer, incluida la cabeza MTP, se cuantizan a Q8G64. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto conversacional en formato image-text-to-text.
- Comprension de imagenes y respuesta multimodal (pipeline image-text-to-text).
- Razonamiento multi-turno y conversacional.
- Multi-Token Prediction nativa (cabeza MTP de 1 capa) para decodificacion especulativa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Descripcion y analisis de imagenes en local sobre Apple Silicon: usando mlx-vlm, el modelo puede recibir una imagen y un prompt de texto para generar descripciones, resumenes o respuestas sobre el contenido visual, sin depender de servicios en la nube.
- Asistente conversacional multimodal en portatiles Mac: con ~30,14 GiB de pesos en 8 bits, puede desplegarse en equipos Apple con memoria unificada suficiente para mantener conversaciones multi-turno con entrada de imagen y texto.
- Generacion de scripts y automatizacion de shell: como muestra la model card, el modelo puede generar scripts bash (por ejemplo, comprobacion de puertos abiertos) a partir de una instruccion en lenguaje natural.
- Prototipado de aplicaciones de vision-lenguaje: investigadores pueden validar pipelines image-text-to-text con un modelo de 27B en hardware de consumo Apple antes de escalar a GPUs.
- Evaluacion comparativa de cuantizaciones: util para medir la perdida de calidad de una cuantizacion 8-bit dinamica frente al modelo BF16 original en tareas multimodales.
- Experimentacion con decodificacion especulativa: la cabeza MTP preservada permite probar tecnicas de prediccion multi-token en mlx-lm/mlx-vlm.
- Educacion y demos offline: al ejecutarse localmente, sirve para talleres y demostraciones sin conexion ni costes de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: ~30,14 GiB solo para pesos en 8 bits; se necesita memoria adicional para KV cache, activaciones y el vision tower en BF16, por lo que se recomienda un minimo practico de 36-48 GiB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (familias M2/M3/M4 Pro, Max y Ultra). No esta pensado para GPUs NVIDIA/AMD, ya que el formato es MLX.
- Cabe en consumer GPU: si, en equipos Apple con memoria unificada suficiente; no es compatible con GPUs de consumo NVIDIA por el formato MLX.
- Opciones de despliegue: mlx-lm (texto) y mlx-vlm (multimodal). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpustack/DaisyRose-27B-MLX-8bit-dynamic | 27,78B | no disponible | MLX safetensors 8-bit | Apache-2.0 | Hugging Face |
| RadixArk/DaisyRose-27B (original) | 27B (segun nombre) | no disponible | BF16 (presumiblemente) | Apache-2.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma familia o tamano en la documentacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 8 bits, aunque se describe como near-lossless, puede introducir degradaciones en tareas sensibles a la precision numerica; no se han publicado evaluaciones que lo cuantifiquen.
- El modelo base puede alucinar; no se documentan mitigaciones especificas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado en castellano sin evaluacion previa.
- Longitud de contexto: no disponible, lo que impide planificar cargas de trabajo con documentos largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo original enlazada en license_link.
- Solo es compatible con el ecosistema MLX (Apple Silicon); no es portable a CUDA ni a otros runtimes sin conversion adicional.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validacion comunitaria.
- No se documentan datos de entrenamiento ni procesos de alineacion del modelo base, lo que dificulta evaluar riesgos en produccion.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/gpustack/DaisyRose-27B-MLX-8bit-dynamic
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia del modelo original: https://huggingface.co/RadixArk/DaisyRose-27B
- Libreria mlx-lm: no disponible enlace directo en la informacion proporcionada
- Libreria mlx-vlm: no disponible enlace directo en la informacion proporcionada
