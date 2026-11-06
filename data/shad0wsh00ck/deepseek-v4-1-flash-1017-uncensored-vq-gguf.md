# shad0wsh00ck/DeepSeek-V4.1-Flash-1017-UNCENSORED-VQ-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 UNCENSORED VQ GGUF es una conversión experimental de cuantización de muy bajo bit del checkpoint FP8 sin censura publicado por dealignai, que a su vez deriva del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek. El autor de la conversión es shad0wsh00ck, que reproduce la receta `vq8sh14-q4k-mtpnative` de YoungAi sobre los pesos modificados por dealignai en las capas 10 a 36. El resultado es un GGUF de aproximadamente 113,6 GB que cabe en una única estación DGX Spark de 128 GB, con el drafter MTP de tres torres embebido, un sidecar de visión separado y las 1017 tablas Engram intactas.

El modelo es un transformer con mezcla de expertos (MoE) que conserva el contexto nativo de 1.048.576 tokens y la torre de visión DeepSeek-ViT. La innovación principal no está en la arquitectura, sino en la cuantización por vectores (VQ) de los expertos enrutados: cada experto se almacena con codebooks E4M3 de 8 dimensiones compartidos por capa, con índices de 13 bits en las capas 0-13 y de 12 bits en las capas 14-39, lo que sitúa el coste en torno a 1,6 bits por peso en los expertos enrutados, muy por debajo de los cuantizados GGUF de 4 bits habituales.

Es relevante ahora porque demuestra que un modelo de esta escala puede servirse en hardware de escritorio profesional de 128 GB, a costa de una degradación medible: la misma receta acierta el siguiente token del modelo FP8 entre el 69 % y el 79 % de las veces. Se trata de investigación exploratoria de cuantización, no de un sustituto directo del modelo original, y los ficheros pueden cambiar entre revisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), torre de visión DeepSeek-ViT, drafter MTP de tres torres (DSpark) y tablas Engram de n-gramas |
| Parametros totales | 485.283.840 (dato de safetensors del repo); el checkpoint FP8 de origen es de 510 GB |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (nativo, según metadatos del modelo) |
| Tipos de cuantizacion | VQ de 8 dimensiones con codebooks E4M3 (13 bits en capas 0-13, 12 bits en capas 14-39) para expertos enrutados; q4_K para atención, expertos compartidos, embedding y cabeza; VQ de 12 bits para expertos del drafter; BF16 para visión y Engram |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (base de ~113,6 GB), sidecar GGUF de visión (~1 GB), tablas Engram en `deepseek-engram/` (2 × 101,5 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos de DeepSeek, en la variante V4.1-Flash-1017, que incorpora atención estándar, expertos compartidos y enrutados, una torre de visión DeepSeek-ViT con su aligner y sesgos de router `bias_vl` por capa, y un drafter MTP de tres torres DSpark para decodificación especulativa. El modelo incorpora además tablas Engram de n-gramas (1017 tablas, 2 × 101,5 GB) que se leen en su sitio mediante `--engram-dir`. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset en la información proporcionada.

La conversión aplica la receta `vq8sh14-q4k-mtpnative` de YoungAi sin cambios: cuantización por vectores de 8 dimensiones con un codebook E4M3 por capa compartido por los 384 expertos y por las proyecciones gate/up/down, con ganancias de fila en F16 y sin datos de calibración. Las capas 0-13 usan índices de 13 bits (K=8192) y las capas 14-39 de 12 bits (K=4096). Los expertos del drafter se cuantizan a VQ de 12 bits, mientras que el resto de pesos del drafter conservan su precisión nativa. El base GGUF tiene exactamente el mismo inventario de tensores y disposición de bytes que la release VQ 1017 (1.000 tensores, 113.556.639.424 bytes) y pasa la comprobación del cargador de ds4-dfm-rs (`bind: slots=1000 bound=1000 required-missing=0`); 54 de los 1.000 tensores difieren respecto a la release VQ 1017, exactamente los construidos a partir de los pesos editados por dealignai. No se documenta en la información disponible si el modelo original recibió RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto de hasta 1.048.576 tokens.
- Procesamiento de imagen y texto (`image-text-to-text`) mediante la torre DeepSeek-ViT en sidecar separado.
- Decodificación especulativa nativa mediante el drafter MTP de tres torres embebido en el GGUF base.
- Recuperación aumentada mediante tablas Engram de n-gramas, leídas en su sitio desde `deepseek-engram/`.
- Capacidades multilingües limitadas a inglés y chino.
- Comportamiento sin censura (uncensored/abliterated) heredado de los pesos de dealignai.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni de agentes multi-paso.

## Casos de uso

- Despliegue en una única DGX Spark: el GGUF base de ~113,6 GB más el sidecar de visión de ~1 GB cabe en los 128 GB de una GB10, lo que permite servir un modelo de escala V4.1 Flash en hardware de un solo nodo sin clúster multi-GPU.
- Investigación en cuantización de muy bajo bit: el artefacto sirve para estudiar el impacto de la VQ a ~1,6 bits por peso en expertos enrutados, comparando tensor a tensor contra la release VQ 1017 y midiendo la fidelidad de siguiente token frente al FP8.
- Procesamiento de documentos largos: con 1.048.576 tokens de contexto y un KV cache medido en 0,89 GB para la ventana completa, permite analizar corpus extensos, expedientes o bases de código en una sola pasada.
- Análisis de imágenes con instrucciones en inglés o chino: la torre DeepSeek-ViT en BF16 permite tareas de image-text-to-text sin cuantizar la visión, preservando la calidad del encoder.
- Evaluación de decodificación especulativa: el drafter MTP embebido permite medir aceleraciones de inferencia en ds4-dfm-rs y en el `ds4-server` de YoungAi sobre el mismo artefacto.
- Experimentación con modelos sin censura en entornos controlados: útil para estudiar comportamiento abliterated y su regresión en cuantizaciones de bajo bit, siempre con las advertencias del autor sobre calidad.
- Pruebas de integración de runtimes: el artefacto está pensado para ds4-dfm-rs (CUDA en DGX Spark) y para el `ds4-server` de YoungAi, lo que lo convierte en banco de pruebas para cargadores GGUF con soporte de Engram y MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta que, con la misma receta sobre V4.1 Flash, la cuantización acierta el siguiente token del modelo FP8 entre el 69 % y el 79 % de las veces, y que el KV cache completo de 1M tokens de esta arquitectura mide 0,89 GB. No se han medido velocidad ni fidelidad de servicio para este artefacto concreto en DGX Spark.

## Requisitos de hardware

- VRAM estimada: ~113,6 GB para el GGUF base, ~1 GB para el sidecar de visión y acceso a disco para las tablas Engram (2 × 101,5 GB), que se leen en su sitio sin cargarse en memoria.
- GPU recomendada: NVIDIA DGX Spark con GB10 y 128 GB de memoria unificada, el objetivo declarado del autor.
- En GPU consumer: no cabe en RTX 4090 (24 GB) ni en configuraciones de 48-80 GB; requiere hardware de 128 GB o superior.
- Opciones de despliegue: ds4-dfm-rs (CUDA, DGX Spark) y YoungAi `ds4-server`, que lee los mismos ficheros; no se documenta soporte en llama.cpp, vLLM, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles para este artefacto; las cifras de velocidad y fidelidad del autor corresponden a V4.1 Flash con la misma receta y están etiquetadas como tales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 UNCENSORED VQ GGUF (este) | 485.283.840 (safetensors) | 1.048.576 | VQ ~1,6 bits en expertos + q4_K | MIT | Hugging Face, 109 descargas |
| dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (base) | no disponible | no disponible | FP8 | no disponible en la información | Hugging Face |
| Baekpica/DeepSeek-V4.1-Flash-1017-VQ-GGUF | no disponible | 1.048.576 | VQ misma receta | no disponible en la información | Hugging Face |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (original) | no disponible | no disponible | BF16/FP8 | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Cuantización muy agresiva: los expertos enrutados se almacenan a ~1,6 bits por peso, lo que puede provocar razonamientos en bucle, respuestas que no llegan a concluir, texto roto a mitad de carácter (mostrado como `�`) y cambios de idioma a mitad de palabra.
- Degradación medible: la misma receta acierta el siguiente token del FP8 entre el 69 % y el 79 % de las veces; la calidad general y el comportamiento sin censura pueden ser peores que en el FP8.
- Regresión de cumplimiento: dealignai advierte que el comportamiento uncensored puede degradarse en cuantizaciones de bajo bit derivadas de su bundle FP8; no se ha medido en este artefacto.
- Ficheros inestables: la línea de conversiones sigue en investigación (a 2026-10-21 se probaba el ajuste Lloyd ponderado de los codebooks), por lo que cualquier fichero puede sustituirse por una nueva revisión; para fijar una build hay que descargar un commit concreto.
- Riesgo de Engram incorrecto: las tablas de `deepseek-ai/DeepSeek-V4.1-Flash` tienen los mismos nombres y tamaños que las 1017 pero contenido distinto, y un motor apuntado a ellas cargaría sin error y ejecutaría un modelo desalineado.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Sin benchmarks publicados para este artefacto; no hay datos de latencia ni throughput medidos en DGX Spark.
- Licencia MIT, sin restricciones conocidas para uso comercial, pero el modelo base y los pesos de dealignai pueden tener condiciones adicionales no detalladas en la información disponible.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas; la naturaleza uncensored del checkpoint base implica ausencia de salvaguardas de contenido.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/shad0wsh00ck/DeepSeek-V4.1-Flash-1017-UNCENSORED-VQ-GGUF)
- [Modelo base FP8 de dealignai](https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8)
- [Release VQ 1017 de Baekpica](https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-VQ-GGUF)
- [Modelo original DeepSeek-V4.1-Flash-1017](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017)
- [Receta y pesos de YoungAi en wenzhouwu](https://huggingface.co/wenzhouwu/YoungAi-DeepSeek-V4.1-Flash)
- [Repositorio YoungAi](https://github.com/fodelf/YoungAi)
- [Runtime ds4-dfm-rs](https://github.com/Baekpica/ds4-dfm-rs)
- [Tab de discusiones del modelo](https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-UNCENSORED-VQ-GGUF/discussions)
