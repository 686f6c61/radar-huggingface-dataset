# ByteDance-Seed/Cross-Layer-TopK-CLT

## Resumen

Cross-Layer-TopK-CLT es un transcoder entre capas (cross-layer transcoder, CLT) entrenado sobre el modelo base Qwen3-8B-Base y publicado por ByteDance-Seed. No es un modelo generativo: es una herramienta de interpretabilidad mecanicista que descompone las activaciones internas del transformer en latentes dispersos y legibles, y permite reconstruir la salida de las capas MLP a partir de ellos. Concretamente, ofrece 36 capas × 32.768 latentes (un total de 1.179.648 latentes) que leen el residual stream justo antes del MLP de cada capa (`resid_mid`) y escriben en las salidas MLP (`mlp_out`) de esa capa y de todas las posteriores.

El artefacto es de gran tamano: 94.200 millones de parametros en fp32, unos 377 GB en total, de los cuales 357 GB corresponden exclusivamente a los decodificadores. Esto lo convierte en una infraestructura de analisis pensada para ejecutarse en multiples GPU, no en un componente desplegable en produccion convencional. Su relevancia actual radica en que extiende la interpretabilidad de tipo transcoder mas alla de una sola capa, capturando circuitos que atraviesan la red, algo que los transcoders por capa no pueden representar.

La licencia Apache 2.0 y la integracion con el ecosistema Hugging Face (pesos en safetensors, script de demostracion con `torchrun`) facilitan su reutilizacion en laboratorios de investigacion que ya trabajen con Qwen3-8B-Base. El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una publicacion muy reciente o de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-layer transcoder (CLT) sobre transformer Qwen3-8B-Base; 36 capas × 32.768 latentes |
| Parametros totales | 94,2 mil millones (fp32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B-Base; no especificada en la model card) |
| Tipos de cuantizacion | no disponible; el autor indica que se use fp32 (entrenado con activaciones fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`W_enc_{l}`, `W_dec_{l}`, `W_dec_norm`, `factors`, `config.json`) |
| Tamano del repositorio | 0,0 GB (metadatos); checkpoint completo ~377 GB |
| Modelo base | Qwen/Qwen3-8B-Base |
| Dimension del modelo base (d_model) | 4096 |
| Numero de capas | 36 |
| Latentes por capa (d_feature) | 32.768 |
| k (latentes activos por capa) | 10 (360 en total entre todas las capas) |

## Arquitectura y entrenamiento

El CLT se compone de un encoder por capa `W_enc_l` de forma `[32768, 4096]` y un decoder `W_dec_l` de forma `[32768, 36 - l, 4096]`, es decir, cada latente de la capa `l` puede escribir en las salidas MLP de la capa `l` y de todas las capas posteriores. La codificacion es `a_l = ReLU(W_enc_l · x_l)` sin sesgo; la puntuacion de cada latente es `a_l[i] · W_dec_norm[l, i]` y se conservan los `36 · k = 360` latentes con mayor puntuacion de forma conjunta entre todas las capas. La decodificacion reconstruye `mlp_out_hat[m] = Σ_{l ≤ m} a_l @ W_dec_l[:, m - l, :]`.

Un detalle tecnico relevante es que la normalizacion de activaciones usada durante el entrenamiento ya esta plegada en los pesos: el CLT consume `resid_mid` en bruto y reconstruye `mlp_out` en bruto, por lo que no deben reaplicarse los factores de `factors.safetensors` (que solo contienen las normas medias `resid_mid_l2` y `mlp_out_l2` por capa). Los hooks se registran en la entrada de `model.layers[l].post_attention_layernorm` (`resid_mid`) y en la salida de `model.layers[l].mlp` (`mlp_out`). Durante el entrenamiento se descartaron los tokens cuya norma en `resid_mid` o `mlp_out` alcanzase 20 veces la norma media de esa capa (en la practica, el primer token).

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo tecnicas de RLHF o DPO; esos datos figuran como no disponibles. La innovacion principal es precisamente la estructura cross-layer: frente a un transcoder por capa, el CLT modela contribuciones que cruzan capas, permitiendo atribuir la escritura en una capa concreta a latentes originados en capas anteriores.

## Capacidades

- Interpretabilidad mecanicista: descomposicion de activaciones del MLP de Qwen3-8B-Base en latentes dispersos y puntuables.
- Codificacion de texto en latentes: dado un texto, devuelve para cada token y capa la lista de `latent_id:activation` ordenada de mayor a menor.
- Reconstruccion de `mlp_out`: a partir de los latentes activos, reconstruye la salida MLP de cada capa y posicion.
- Analisis cross-layer: cada latente puede escribir en capas posteriores, lo que permite estudiar circuitos que atraviesan la red.
- Seleccion TopK conjunta: retiene los 360 latentes de mayor puntuacion entre todas las capas, facilitando comparaciones entre capas.
- No es un modelo generativo: no produce texto, no soporta tool calling, no tiene modo agente ni capacidades multimodales, de vision o audio.
- Capacidades multilingues: no disponibles (dependen del modelo base y no se documentan).
- Gestion de outliers: descarte automatico de tokens con norma anomala, coherente con el entrenamiento.

## Casos de uso

- Analisis de circuitos en Qwen3-8B-Base: identificar que latentes de capas tempranas contribuyen a la salida MLP de capas tardias, permitiendo trazar caminos computacionales completos en lugar de analizar capas aisladas.
- Auditoria de comportamientos indeseados: localizar latentes asociados a respuestas toxicas o a alucinaciones y comprobar en que capas se originan y donde escriben, como paso previo a tecnicas de edicion o steering.
- Investigacion en interpretabilidad comparada: usar los 36 × 32.768 latentes como espacio comun para comparar representaciones entre capas y entre prompts, gracias a la puntuacion normalizada por `W_dec_norm`.
- Validacion de reconstruccion: medir la fidelidad de la reconstruccion de `mlp_out` con el script de demostracion para evaluar la calidad del transcoder antes de usarlo en estudios.
- Desarrollo de metodos de atribucion: emplear la estructura cross-layer para atribuir predicciones del modelo base a componentes internos concretos, con aplicaciones en depuracion de modelos y en investigacion de seguridad.
- Docencia y formacion: el ejemplo incluido (`hf_encode_demo.py`) sirve como material practico para ensenar interpretabilidad mecanicista con un caso real de 94,2 B de parametros.
- Infraestructura de investigacion a gran escala: desplegar el encoder en 8 GPU para analizar lotes de textos de forma distribuida, ya que los latentes se reparten uniformemente entre GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de fidelidad de reconstruccion, sparse probing ni comparaciones cuantitativas con otros transcoders.

## Requisitos de hardware

- Solo codificacion: un unico GPU de 80 GB es suficiente (`--nproc_per_node 1`) descargando el checkpoint sin los ficheros `W_dec_*`.
- Codificacion y decodificacion completas: se requieren los 357 GB de decodificadores, repartidos entre varias GPU; el ejemplo oficial usa `torchrun --nproc_per_node 8`, con los latentes divididos uniformemente entre GPUs (cualquier numero que divida 32.768).
- VRAM estimada: aproximadamente 377 GB en total para el artefacto completo en fp32; el modelo base Qwen3-8B-Base debe cargarse ademas en fp32 (unos 32 GB), por lo que el despliegue realista es multi-GPU.
- GPU recomendadas: A100 80 GB, H100 80 GB o similares; el ejemplo esta disenado para 8 GPU con comunicacion NCCL.
- GPU de consumo: no cabe en RTX 4090 ni en tarjetas de 24 GB, ni siquiera solo el encoder completo en fp32.
- Opciones de despliegue: el autor proporciona un script con `torchrun` y `safetensors`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica, al no ser un modelo generativo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cross-Layer-TopK-CLT (este) | Cross-layer transcoder sobre Qwen3-8B-Base | 94,2 B (fp32) | no disponible | Apache 2.0 | Hugging Face |
| Transcoder por capa (alternativa generica) | Transcoder de una sola capa | no disponible | no disponible | no disponible | no disponible |
| SAE (sparse autoencoder) sobre Qwen3-8B-Base | Sparse autoencoder | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de alternativas comparables en la informacion proporcionada; la comparativa queda limitada a la categoria y no a metricas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede usarse para inferencia generativa, tool calling o tareas de agente.
- Requisitos de hardware muy elevados: 377 GB en fp32 y multi-GPU para el flujo completo de codificacion y decodificacion.
- Dependencia estricta de fp32: el autor advierte de que el CLT se entreno con activaciones fp32 y debe usarse fp32 tambien en el modelo base; el uso en otras precisiones puede degradar la fidelidad.
- No reaplicar los factores de `factors.safetensors`: la normalizacion ya esta plegada en los pesos; hacerlo introduciria un sesgo en las activaciones.
- Descarte de outliers: los tokens con norma 20 veces superior a la media (tipicamente el primero) se eliminan, lo que puede sesgar analisis centrados en la posicion inicial.
- Sesgos conocidos: no documentados; al heredar el modelo base Qwen3-8B-Base, los latentes pueden reflejar los sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: no aplica directamente al no generar texto, pero la reconstruccion puede ser imperfecta y no se publican metricas de fidelidad.
- Idiomas: no se documenta que idiomas cubre; depende del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-8B-Base tiene sus propias condiciones que deben respetarse.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/ByteDance-Seed/Cross-Layer-TopK-CLT
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Repositorio de ByteDance-Seed en Hugging Face: https://huggingface.co/ByteDance-Seed
- Script de demostracion: incluido en la model card como `hf_encode_demo.py` (descarga via `huggingface-cli download ByteDance-Seed/Cross-Layer-TopK-CLT --local-dir clt`)
