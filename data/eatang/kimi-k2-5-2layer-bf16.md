# eatang/Kimi-K2.5-2layer-BF16

## Resumen

Kimi-K2.5-2layer-BF16 es un recorte de dos capas del modelo moonshotai/Kimi-K2.5, publicado por el usuario eatang. No se trata de un modelo de lenguaje funcional: es un artefacto de integracion continua (CI) disenado para que el framework SkyRL pueda ejecutar pruebas sobre la arquitectura real del modelo base, con pesos reales pero truncados, en un tamano que cabe en un solo nodo. La propia model card advierte de forma explicita que dos capas de una red de 61 producen texto incoherente y que el modelo no debe usarse como LLM.

El repositorio conserva la capa 0 (MLP densa, coherente con `first_k_dense_replace=1`), la capa 1 (MoE con los 384 expertos enrutados completos mas 1 experto compartido), los embeddings de tokens, la cabeza `lm_head`, la normalizacion final y, sin modificar, el `vision_tower` y el `mm_projector`. El unico parametro alterado en la configuracion es `text_config.num_hidden_layers`, fijado a 2; el resto de la configuracion del modelo base permanece intacta.

Su relevancia es puramente de ingenieria: permite validar rutas de codigo de entrenamiento e inferencia (paralelismo de expertos, desquantizacion, integracion multimodal) contra la topologia real de Kimi-K2.5 sin necesidad de disponer del modelo completo. El peso total del repositorio es de 40,8 GB, con unos 20.376.826.736 parametros almacenados, de los cuales aproximadamente 33 GB corresponden a los expertos enrutados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con capas MoE (mezcla de expertos) y torre de vision; recorte de 2 capas del modelo base |
| Parametros totales | 20.376.826.736 (~20B) |
| Parametros activos | no disponible (no se especifica el numero de expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en todos los tensores del repositorio; en la release original del modelo base los expertos enrutados estaban cuantizados en INT4 pack-quantized (compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (campo `license: other`, `license_name: modified-mit`) |
| Formato de pesos | safetensors (requiere `custom_code`; arquitectura `kimi_k25`) |
| Modelo base | moonshotai/Kimi-K2.5 |
| Numero de capas conservadas | 2 (capa 0 densa + capa 1 MoE) |
| Expertos enrutados por capa MoE | 384 expertos enrutados + 1 experto compartido |
| Tamano del repositorio | 40,8 GB (33 GB corresponden a los expertos enrutados) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Kimi-K2.5, una red de 61 capas segun la propia model card. La capa 0 es un MLP denso, coherente con el parametro `first_k_dense_replace=1`, y la capa 1 es una capa MoE que incorpora los 384 expertos enrutados completos mas un experto compartido. Se conservan tambien `language_model.model.embed_tokens`, `language_model.lm_head` y `language_model.model.norm`. Ademas, el repositorio incluye los tensores `vision_tower.*` y `mm_projector.*` sin modificar, lo que confirma que el modelo base es multimodal (vision-lenguaje) y que el recorte mantiene esa ruta intacta.

No hay entrenamiento ni ajuste fino asociado a este artefacto: se trata de una conversion de pesos. Los tensores de los expertos enrutados se desquantizaron desde el formato compressed-tensors pack-quantized INT4 aplicando la misma aritmetica que usa SkyRL en `examples/train/megatron/dequantize_compressed_tensors_int4.py` (nibble = q + 8, escala por grupo mediante `q * weight_scale`, `group_size=32`), y se elimino `quantization_config` de la configuracion. Segun la model card, cada tensor desquantizado se verifico como punto fijo del STE de cuantizacion falsa (`scale_divisor=7.0`, `q_min=-7`): al recuantizar se reproducen las escalas y los codigos almacenados bit a bit.

## Capacidades

- Generacion de texto: no funcional. Con solo dos capas de 61, la salida es incoherente segun la propia model card.
- Razonamiento, codigo y matematicas: no disponible; no se han publicado evaluaciones y el recorte no es apto para estas tareas.
- Vision: la torre de vision (`vision_tower`) y el proyector multimodal (`mm_projector`) se conservan sin modificar, por lo que la ruta multimodal existe a nivel de pesos, aunque sin las capas de lenguaje necesarias para producir respuestas coherentes.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking: no disponible.
- Uso previsto real: servir como fixture de CI para ejercitar la arquitectura real de Kimi-K2.5 (enrutado de expertos, rutas de desquantizacion, integracion multimodal) en un unico nodo.

## Casos de uso

- Pruebas de integracion en CI para SkyRL: el modelo permite ejecutar el pipeline de entrenamiento sobre la topologia real (capa densa + capa MoE con 384 expertos) y detectar regresiones en el manejo de pesos, sin necesidad de cargar el modelo completo.
- Validacion de rutas de desquantizacion: al ser un recorte con expertos desquantizados desde INT4 pack-quantized, sirve para verificar que las implementaciones de desquantizacion reproducen las escalas y codigos originales bit a bit.
- Pruebas de paralelismo de expertos: con 384 expertos enrutados en una sola capa MoE, permite comprobar estrategias de sharding y balanceo de carga en un nodo unico.
- Verificacion de carga de modelos con `custom_code`: el repositorio requiere codigo personalizado (`kimi_k25`), por lo que es util para validar el registro y la carga de arquitecturas no nativas en transformers.
- Pruebas de la ruta multimodal: al conservar `vision_tower` y `mm_projector`, permite comprobar que la inicializacion y el paso de tensores de vision funcionan antes de escalar al modelo completo.
- Pruebas de humo de memoria y planificacion de recursos: con 40,8 GB de pesos, es un banco de pruebas para medir consumo de VRAM, tiempos de carga y estrategias de offload antes de abordar despliegues mayores.
- Pruebas de serializacion y compatibilidad de safetensors: util para validar herramientas de conversion, inspeccion y verificacion de integridad de pesos sobre un modelo con arquitectura real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K ni ninguna otra) y advierte explicitamente de que el modelo no es utilizable como modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos ~41 GB solo para los pesos en BF16 (20,38B parametros); con cache KV, activaciones y la torre de vision, conviene reservar del orden de 45-50 GB.
- GPU recomendadas: una unica GPU de 80 GB (A100 80GB, H100 80GB) es el escenario natural, ya que el modelo se concibio para caber en un solo nodo.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) en BF16. Seria necesario repartir con paralelismo de tensores en varias GPU de consumo u offload a CPU, con la penalizacion de latencia correspondiente.
- Opciones de despliegue: carga mediante transformers con `trust_remote_code` habilitado, dado que la arquitectura `kimi_k25` requiere codigo personalizado. No se documenta soporte de GGUF, Ollama, llama.cpp, vLLM ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Capas | Uso previsto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| eatang/Kimi-K2.5-2layer-BF16 | 20.376.826.736 (~20B) | no disponible | 2 de 61 | Fixture de CI, no utilizable como LLM | modified-mit | HuggingFace, 0 descargas |
| moonshotai/Kimi-K2.5 (base) | no disponible en la informacion proporcionada | no disponible | 61 | Modelo multimodal de proposito general | no disponible | HuggingFace |
| Otros recortes o fixtures de CI de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de parametros, contexto ni rendimiento del modelo base mas alla de lo indicado en la model card del recorte, por lo que la comparacion cuantitativa no es posible con la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable: dos capas de una red de 61 producen texto incoherente, tal como advierte la propia model card.
- Sin resultados de benchmarks: no hay ninguna evaluacion publicada que permita estimar calidad, sesgos o comportamientos.
- Licencia restrictiva y poco habitual: el campo de licencia es `other` con nombre `modified-mit`, lo que implica condiciones distintas de la licencia MIT estandar. Es imprescindible revisar el texto completo antes de cualquier uso comercial.
- Herencia de licencia del modelo base: al derivar de moonshotai/Kimi-K2.5, pueden aplicarse condiciones adicionales del modelo original que no se detallan en la informacion proporcionada.
- Requiere codigo personalizado: la carga depende del `custom_code` asociado a la arquitectura `kimi_k25`, lo que anade riesgo de compatibilidad entre versiones de transformers y del repositorio.
- Idiomas soportados no documentados: no hay informacion sobre cobertura linguistica.
- Longitud de contexto desconocida: aunque la configuracion del modelo base no se modifico salvo `num_hidden_layers`, el valor concreto no se proporciona.
- Riesgo de confusion en produccion: el nombre del repositorio puede llevar a error si se interpreta como una version reducida funcional de Kimi-K2.5; no lo es.
- Uso comercial desaconsejado sin revision legal: combinando la licencia `modified-mit`, la herencia del modelo base y la ausencia de benchmarks, no es un artefacto apto para despliegues en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eatang/Kimi-K2.5-2layer-BF16
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.5
- Repositorio de SkyRL: https://github.com/NovaSky-AI/SkyRL
- Script de desquantizacion citado en la model card: `examples/train/megatron/dequantize_compressed_tensors_int4.py` (dentro del repositorio de SkyRL)
- Resultados de busqueda web: los enlaces devueltos (Amazon.de y subdominios asociados) no guardan ninguna relacion con el modelo, por lo que no se incluyen como referencias validas.
