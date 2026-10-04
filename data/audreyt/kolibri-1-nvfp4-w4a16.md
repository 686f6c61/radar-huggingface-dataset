# audreyt/Kolibri-1-NVFP4-W4A16

## Resumen

Kolibri-1 NVFP4 W4A16 es una conversion experimental del modelo Aleph-Alpha/Kolibri-1 a precision NVFP4 con cuantizacion solo de pesos (W4A16), publicada por el usuario audreyt. El modelo original fue entrenado por Aleph Alpha; esta version no ha sido entrenada desde cero, sino que se ha reconvertido a partir de pesos ya cuantizados en block-FP8 del checkpoint original. La arquitectura subyacente es un transformer con mezcla de expertos (MoE), con 40.256.034.560 parametros totales y un repositorio de 47,4 GB distribuido en 45 shards de safetensors.

La conversion emplea ModelOpt 0.47.0 de NVIDIA: los expertos enrutados y compartidos usan `W4A16_NVFP4` con tamano de grupo 16, mientras que las proyecciones de atencion se de-cuantizan de FP8 a BF16. Las activaciones permanecen en BF16 y no se utilizo ningun conjunto de datos de calibracion de activaciones. Los embeddings, la cabeza de salida, los routers, los sesgos de enrutado y las normalizaciones se conservan en BF16 original.

Su relevancia actual es doble: por un lado, explora la viabilidad de servir un MoE de ~40.000 millones de parametros en hardware de consumo (se documento un ensayo con RTX 5090); por otro, sirve como caso de estudio reproducible de conversion NVFP4 con un `recipe/` completo. Conviene subirla con cautela: el propio autor declara que la generacion completa y la validacion de contexto largo no estan terminadas y que no se ha verificado la equivalencia de calidad con el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); expertos enrutados y compartidos |
| Parametros totales | 40.256.034.560 (~40,26 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos entrenados; 1.048.576 tokens anunciados como extrapolacion validada (no verificados en esta conversion) |
| Tipos de cuantizacion | NVFP4 W4A16 solo pesos, group size 16 (ModelOpt `W4A16_NVFP4`); atencion en BF16 (de-cuantizada desde block-FP8); activaciones BF16 |
| Idiomas soportados | en, de |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (45 shards, 173.853 tensores) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con expertos enrutados y compartidos, mas proyecciones de atencion. En esta conversion, las proyecciones de expertos (57.750 tensores cuantizados) se almacenan en NVFP4 con tamano de grupo 16 y las proyecciones de atencion (200 tensores) en BF16. Las proyecciones gate/up de cada experto comparten una escala global, requisito del cargador fusionado de vLLM. Los embeddings BF16 originales, la cabeza de salida, los routers, los sesgos de enrutado y las normalizaciones se preservan sin tocar. No se uso ningun dataset de calibracion de activaciones, por lo que la cuantizacion es puramente de pesos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original, ni sobre su proceso de entrenamiento. Lo que si esta documentado es el proceso de conversion: se partio de la revision `e52eb4627d11516b0c01de49210ab5a4e4061444` del checkpoint FP8 (no del checkpoint BF16 de entrenamiento), con NVIDIA ModelOpt 0.47.0, en una maquina Intel Core Ultra 9 285K con ocho hilos de CPU, sin GPU, limite de contenedor de 6 GiB y buffers de salida de 1 GiB por shard. La conversion tardo 519,78 segundos con un pico de RSS de 6.147.420 KiB.

Como metricas de reconstruccion de pesos (no de calidad del modelo) se reportan una RMSE relativa agregada de 0,0946875 y una RMSE relativa maxima por proyeccion de 0,0955360. El payload de tensores resultante es de 47.396.140.120 bytes (44,14 GiB). El conversor hace streaming de tensores en lugar de cargar el state dict completo y valida error de reconstruccion, tamano de payload y numero de tensores antes de finalizar.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado `text-generation` y la etiqueta `conversational`.
- Razonamiento y generacion de codigo: no hay datos especificos publicados para esta conversion; las capacidades heredadas del modelo base no han sido verificadas.
- Soporte de tool calling / function calling: no disponible (no documentado en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas a ingles y aleman segun los metadatos del repositorio.
- Capacidades especiales: modo thinking, vision o audio no documentados.
- Ventana de contexto potencialmente muy amplia: 262.144 tokens nativos y hasta 1.048.576 por extrapolacion anunciada del modelo base, sin verificar en esta conversion.

## Casos de uso

- Servicio de chat en aleman e ingles con contexto largo: un MoE de ~40 B con 262.144 tokens nativos permite mantener historiales de conversacion extensos o documentos completos en el prompt sin troceado agresivo. Requiere validar primero el comportamiento real de la conversion.
- Despliegue experimental en GPU de consumo: el formato NVFP4 reduce el payload de pesos a 44,14 GiB, lo que hace plausible (aunque no resuelto) servir el modelo en una unica RTX 5090 con offload selectivo de expertos a RAM. Es un escenario de laboratorio, no de produccion.
- Analisis de documentacion tecnica en aleman: resumen, extraccion de entidades y respuesta a preguntas sobre manuales o normativa en aleman, aprovechando el soporte nativo de ese idioma.
- Traduccion asistida aleman-ingles dentro de un pipeline de publicacion: el modelo cubre ambos idiomas, aunque la calidad de traduccion de esta conversion no esta medida.
- Reproducibilidad de pipelines de cuantizacion: el directorio `recipe/` (conversor en CPU, tests numericos, interfaces de tipos, Dockerfile fijado a vLLM 0.29.0) sirve para auditar o replicar una conversion FP8 a NVFP4 en entornos sin GPU.
- Evaluacion comparativa de tecnicas NVFP4 frente a FP8: util como banco de pruebas para medir degradacion de calidad y throughput entre el checkpoint FP8 original y su version NVFP4, siempre que se complete primero la validacion pendiente.
- Investigacion sobre decodificacion en vLLM: valida el comportamiento del cargador fusionado de expertos con escalas compartidas y el uso de Marlin con UVA offloading.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor indica explicitamente que las cifras publicadas son mediciones de reconstruccion de pesos y no puntuaciones de evaluacion.

| Medicion de conversion | Resultado |
|---|---:|
| Revision de origen | `e52eb4627d11516b0c01de49210ab5a4e4061444` |
| Productor | NVIDIA ModelOpt 0.47.0 |
| Payload de tensores | 47.396.140.120 bytes / 44,14 GiB |
| Tensores de salida | 173.853 |
| Shards de safetensors | 45 |
| Proyecciones de expertos cuantizadas | 57.750 |
| Proyecciones de atencion en BF16 | 200 |
| RMSE relativa agregada de pesos | 0,0946875 |
| RMSE relativa maxima por proyeccion | 0,0955360 |
| Tiempo de conversion | 519,78 segundos |
| Pico de RSS en conversion | 6.147.420 KiB |
| Tests superados | 5 (numericos y de formato) |

## Requisitos de hardware

- VRAM estimada para inferencia: el payload de pesos es de 44,14 GiB; en la practica se necesita espacio adicional para cache KV, buffers de activacion y repacking de kernels. El unico ensayo documentado (RTX 5090, vLLM 0.29.0, plugin `aleph-alpha-inference` 1.0.0, Marlin, UVA offloading selectivo) offloado 22,06 GiB de parametros de expertos a RAM y aun asi fallo por CUDA out-of-memory durante el repacking posterior a la carga de expertos en Marlin.
- GPU recomendadas: no hay recomendaciones oficiales publicadas. Por tamano, el escenario realista apunta a GPUs de 80 GB (A100, H100) o 96 GB; el autor solo documento el intento fallido en RTX 5090.
- Cabe en GPU de consumo: no esta confirmado. El ensayo en RTX 5090 no completo la carga; se requiere mas VRAM, mas offload o un ajuste distinto de kernels.
- Opciones de despliegue: vLLM (libreria declarada, version 0.29.0 en el ensayo) con el plugin oficial `aleph-alpha-inference`; el conversor se distribuye como contenedor Docker sobre la imagen base de vLLM. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. El repositorio no reclama throughput medido, inferencia exitosa a 1 M de tokens ni equivalencia de calidad con el modelo original.

## Comparativa con modelos similares

La informacion disponible solo permite comparar la conversion con su modelo de origen. No se dispone de datos verificados de otros modelos MoE comparables dentro de la documentacion proporcionada.

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| audreyt/Kolibri-1-NVFP4-W4A16 | 40.256.034.560 | 262.144 nativos / 1.048.576 anunciados (sin verificar) | NVFP4 W4A16, group size 16 | apache-2.0 | HuggingFace, 0 descargas, 1 like |
| Aleph-Alpha/Kolibri-1 (origen) | no disponible | 262.144 nativos / 1.048.576 anunciados | block-FP8 (revision `e52eb46`) | apache-2.0 | HuggingFace |
| Otros MoE de ~40 B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado experimental declarado por el propio autor: la generacion completa y la validacion de contexto largo no estan terminadas.
- Riesgo de degradacion de calidad no cuantificado: la conversion parte de pesos ya cuantizados en FP8, no del checkpoint BF16 de entrenamiento, por lo que los errores de cuantizacion se acumulan sobre una perdida previa. La RMSE relativa agregada de 0,0946875 es una medida de reconstruccion de pesos, no de calidad de lenguaje.
- Sin calibracion de activaciones: al no usarse dataset de calibracion, no hay garantia de que los rangos dinamicos en inferencia real sean adecuados.
- Inferencia no resuelta en hardware de consumo: el unico ensayo conocido fallo con CUDA out-of-memory al repackear expertos en Marlin tras offloadar 22,06 GiB a RAM.
- Longitud de contexto: los 1.048.576 tokens anunciados son extrapolacion validada del modelo base y no han sido verificados para esta conversion; el limite nativo entrenado es de 262.144 tokens.
- Cobertura de idiomas limitada a ingles y aleman; no hay soporte documentado de castellano.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar del modelo original, hereda los sesgos de sus datos de entrenamiento, que no se documentan.
- Riesgo de alucinacion: no medido para esta conversion.
- Licencia: apache-2.0, permisiva para uso comercial, y se preserva el `LICENSE` del modelo original. No obstante, la ausencia de validacion de calidad hace desaconsejable su uso en produccion sin evaluacion previa.
- Inconsistencia de metadatos: el repositorio incluye la etiqueta `8-bit` junto a `4-bit` y `nvfp4`, lo que no coincide con la descripcion tecnica de la model card.
- Sin adopcion: 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/audreyt/Kolibri-1-NVFP4-W4A16
- Modelo original: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Plugin oficial de vLLM de Aleph Alpha: https://github.com/Aleph-Alpha/aleph-alpha-inference
- NVIDIA ModelOpt: https://github.com/NVIDIA/Model-Optimizer
- Imagen base de vLLM usada en la conversion: `vllm/vllm-openai@sha256:c2914767605584b6d8f45686b82de173ecc99e781897aa3d0a66dacd72c51ae1`
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en la busqueda proporcionada.
