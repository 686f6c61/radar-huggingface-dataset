# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-5-step-130000

## Resumen

Este repositorio contiene un checkpoint concreto (epoch 5, step 130000) de un modelo de borrador (draft model) EAGLE3 entrenado con SpecForge para el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. El modelo lo publica el usuario huluhuluu en HuggingFace como parte de una colección de 47 checkpoints que cubren las 10 épocas del entrenamiento. Su propósito exclusivo es acelerar la inferencia del modelo objetivo mediante decodificación especulativa, una técnica que permite reducir la latencia de generación sin modificar la calidad del texto final (la distribución de salida se mantiene idéntica a la del modelo objetivo).

El checkpoint no es un modelo de chat independiente ni un LLM de propósito general. Con 202,7 millones de parámetros, una única capa de decoder y una arquitectura `LlamaForCausalLMEagle3`, su función es predecir varios tokens plausibles por paso de decodificación para que el modelo objetivo los valide en paralelo. La licencia Apache 2.0 permite su uso comercial sin restricciones. La relevancia actual de este modelo radica en que la decodificación especulativa se ha convertido en una técnica estándar para desplegar modelos grandes en producción con latencias aceptables, y EAGLE3 es uno de los algoritmos más eficientes en este ámbito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, hidden size 2560, intermediate size 9728, 32 attention heads, 8 key/value heads) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 (secuencia maxima de entrenamiento; sin ventana deslizante) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (entrenado con ShareGPT, mayoritariamente ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa la arquitectura EAGLE3, que se basa en una única capa de decoder que toma como entrada el estado oculto del modelo objetivo correspondiente al ultimo token generado y el embedding del token candidato, y produce una distribucion sobre el vocabulario de borrador (tamano 32000, frente a los 151936 del vocabulario objetivo). La capa tiene un tamaño oculto de 2560, 32 cabezas de atencion y 8 cabezas de clave/valor, y se entrena online (durante la propia decodificacion especulativa) con el algoritmo SpecForge. El entrenamiento se realizo sobre un dataset ShareGPT limpio (fuente local, sin registro de revision), con 10 epocas, 231810 pasos de optimizacion, batch efectivo de 4, tasa de aprendizaje 1e-4 con warmup lineal del 1,5% y posterior cosine annealing, y una longitud maxima de secuencia de 2048. El parametro TTT (test-time training) length es 7, y la atencion del borrador usa `sdpa`. No se configuro ventana deslizante (de ahi el sufijo "NoWindow" en el nombre del repositorio). El backend objetivo es SGLang con FlashInfer.

## Capacidades

- Generacion de tokens de borrador para decodificacion especulativa EAGLE3 exclusivamente sobre el modelo `Qwen/Qwen3-4B-Instruct-2507`.
- Validacion en paralelo de multiples tokens candidatos por el modelo objetivo, reduciendo el numero de pasos de decodificacion secuenciales.
- No es un modelo de chat: no genera texto por si mismo ni tiene capacidades de razonamiento, codigo, matematicas o vision.
- No soporta tool calling, agentes ni multi-step reasoning.
- Capacidades multilingues: no evaluadas; el dataset ShareGPT filtrado sugiere un rendimiento optimo en ingles.
- No incluye modo thinking ni ninguna capacidad especial adicional.

## Casos de uso

- Aceleracion de inferencia de Qwen3-4B-Instruct-2507 en produccion: se integra como ruta de borrador en SGLang con `--speculative-algorithm EAGLE3`, reduciendo la latencia por token en servicios de chat y generacion de texto en tiempo real.
- Despliegue en entornos con presupuesto de latencia estricto: por ejemplo, asistentes conversacionales interactivos donde cada milisegundo de respuesta afecta a la experiencia de usuario.
- Reduccion de coste por peticion: al necesitar menos pasos de decodificacion del modelo objetivo, se reduce el tiempo de computo por token generado y, por tanto, el coste de GPU por peticion.
- Benchmarking de configuraciones de decodificacion especulativa: permite comparar distintos valores de `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens` para encontrar la configuracion optima para una carga de trabajo concreta.
- Investigacion sobre metodos de borrador: los 47 checkpoints de la coleccion permiten estudiar el efecto del numero de pasos de entrenamiento en la calidad de los borradores.
- Pruebas de compatibilidad con otros backends de inferencia: aunque el backend objetivo es SGLang, el formato safetensors permite experimentar con otros motores que soporten EAGLE3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README indica explicitamente que "no se registraron metricas de evaluacion ni de seguridad para este run". El rendimiento de un modelo de borrador EAGLE3 no se mide con metricas clasicas de calidad de texto (MMLU, HumanEval, etc.), sino con la tasa de aceptacion de borradores y la velocidad de decodificacion efectiva del modelo objetivo, datos que no se han facilitado.

## Requisitos de hardware

- El modelo de borrador pesa aproximadamente 0,4 GB en bfloat16 (202,7M parametros), por lo que cabe en cualquier GPU con mas de 1 GB de VRAM.
- Sin embargo, se despliega junto con el modelo objetivo Qwen3-4B-Instruct-2507 (4B parametros), que requiere tipicamente entre 8 y 16 GB de VRAM segun la cuantizacion.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o superior es suficiente para el conjunto completo en bfloat16. Para produccion con alta concurrencia, se recomienda A100 (40/80 GB) o H100 (80 GB).
- El despliegue se realiza con SGLang (backend FlashInfer), que soporta EAGLE3 de forma nativa con el comando `python -m sglang.launch_server` indicando la ruta del checkpoint de borrador.
- No se proporcionan datos de latencia ni throughput estimados.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este checkpoint especifico. Como referencia conceptual, se puede comparar con otros metodos de decodificacion especulativa para el mismo modelo objetivo:

| Metodo | Parametros del borrador | Ventaja principal | Desventaja |
|---|---|---|---|
| EAGLE3 (este modelo) | 202,7M | Alta tasa de aceptacion gracias al uso del estado oculto del modelo objetivo | Requiere entrenamiento especifico por modelo objetivo |
| Medusa | ~100-300M (cabezas multiples) | Entrenamiento mas sencillo, sin dependencia del estado oculto | Menor tasa de aceptacion en general |
| Lookahead decoding | 0 (sin modelo de borrador) | Sin entrenamiento adicional | Ganancia limitada en modelos grandes |

No se conocen otros modelos de borrador EAGLE3 publicados para Qwen3-4B-Instruct-2507 fuera de esta coleccion.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo como tal producira salidas sin sentido. Debe emparejarse exclusivamente con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`.
- El entrenamiento se realizo con datos ShareGPT, que contienen principalmente conversaciones en ingles; el rendimiento del borrador en otros idiomas puede ser inferior.
- No se han registrado metricas de evaluacion de calidad ni de seguridad. No hay garantia de que el borrador mantenga la misma tasa de aceptacion en dominios especializados o con datos fuera de la distribucion de ShareGPT.
- La longitud maxima de secuencia de entrenamiento es 2048 tokens; aunque el modelo base soporta contextos mas largos, el borrador puede degradarse mas alla de ese limite.
- El archivo `training_state.pt` contiene estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en un entorno confiable.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache 2.0 tambien), por lo que no hay restricciones adicionales conocidas.
- No se ha verificado la compatibilidad con backends distintos de SGLang; otros motores pueden no soportar EAGLE3.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-5-step-130000
- Coleccion de checkpoints (47 en total): https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Repositorio oficial EAGLE-Qwen3 (implementacion de EAGLE para Qwen): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Ficha del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Noticia sobre el modelo base Qwen3-4B-Instruct-2507: https://aichina.news/models/Qwen/Qwen3-4B-Instruct-2507/
