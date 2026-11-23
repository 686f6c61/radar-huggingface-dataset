# PeetPedro/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1

## Resumen

PeetPedro/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1 es un ajuste fino (finetune) del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, que a su vez pertenece a la familia Qwen3.8 (arquitectura Qwen3.5, segun los tags del repositorio). El autor publica una variante orientada a la eliminacion de restricciones de alineacion (etiquetada como "heretic" y "uncensored") y a un uso generalista, con pesos distribuidos en formatos MLX, safetensors y GGUF. El modelo cuenta con aproximadamente 27.360 millones de parametros totales segun los pesos en safetensors, lo que lo situa en la categoria de modelos densos de tamano medio-grande.

La relevancia de esta ficha radica en que se trata de un modelo derivado de una cadena de ajustes comunitarios sobre una base Qwen, no de un modelo oficial de Alibaba. El repositorio incorpora tecnicas de entrenamiento en varias etapas ("Cold Fusion", "GAIN Training", "Multi-stage tuning") y una destilacion adicional ("ManusDistill") que el autor no documenta en detalle en la model card disponible. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque conviene verificar las condiciones de la cadena de modelos base.

La informacion publica es escasa: la model card practicamente no incluye datos tecnicos (longitud de contexto, composicion del dataset, resultados de benchmarks) y el repositorio tiene un volumen de 143 GB, coherente con la publicacion de pesos en multiples formatos y precisiones. Esta ficha refleja unicamente lo que puede verificarse a partir de los metadatos y advierte explicitamente de los vacios de informacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tags `qwen3_5`, `qwen3_8`, `qwen3_6`); detalles no disponibles |
| Parametros totales | 27.356.723.952 (~27,36 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo incluye GGUF y safetensors, pero no se detallan las variantes) |
| Idiomas soportados | Ingles (`en`) segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX, safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, que a su vez desciende de la familia Qwen3.8. Los tags indican la presencia de componentes o variantes de las arquitecturas Qwen3.5, Qwen3.6 y Qwen3.8, aunque no se especifica si se trata de un transformer denso estandar o de una arquitectura hibrida. Con 27,36 mil millones de parametros y sin indicacion de mezcla de expertos, lo mas probable es un transformer denso, pero este dato no esta confirmado en la informacion disponible.

Respecto al entrenamiento, la model card menciona tecnicas como "Cold Fusion", "GAIN Training" y "Multi-stage tuning", ademas de una destilacion identificada como "ManusDistill". No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla el proceso de "abliteracion" o eliminacion de rechazos que justifica la etiqueta "heretic". Toda esta informacion debe considerarse no disponible y no verificable a partir de las fuentes consultadas.

## Capacidades

- Generacion de texto conversacional y de uso general, segun el pipeline `text-generation` y el tag `all use cases`.
- Modo "uncensored": el ajuste elimina total o parcialmente las capas de rechazo del modelo base, lo que permite respuestas sobre temas que los modelos alineados suelen declinar.
- Soporte de conversaciones multiturno (tag `conversational`).
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo "thinking". No disponible.

## Casos de uso

- Generacion creativa sin restricciones de contenido: el ajuste "heretic" permite explorar narrativa, guiones o dialogos sobre temas sensibles que los modelos alineados rechazan; adecuado para entornos controlados de escritura creativa.
- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multiturno y desplegarse via MLX en hardware Apple o via GGUF en llama.cpp/Ollama.
- Investigacion sobre alineacion y seguridad: util como caso de estudio de un modelo "abliterado" para comparar comportamientos frente a su base alineada y medir la degradacion de rechazos.
- Generacion de texto en pipelines de datos sinteticos: su tamano de 27B y su licencia Apache 2.0 permiten generar corpus de entrenamiento o aumentacion de datos en ingles.
- Despliegue local en Mac con MLX: la publicacion en formato MLX permite ejecutar el modelo en Apple Silicon con memoria unificada, sin depender de GPU NVIDIA.
- Experimentacion con cuantizaciones GGUF: el repositorio incluye GGUF, lo que facilita probar el modelo en estaciones de trabajo con VRAM limitada mediante llama.cpp.
- Evaluacion de cadenas de finetuning comunitarias: sirve para estudiar como se propagan sesgos y capacidades a traves de multiples ajustes sucesivos sobre una base Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55 GB solo para pesos (27,36B x 2 bytes), mas overhead de KV cache y activaciones; en la practica se recomienda 64-80 GB.
- Cuantizacion a 8 bits: alrededor de 28-30 GB de VRAM; viable en una RTX 4090 (24 GB) solo con cuantizaciones de 4 bits o inferiores, o en A100 40/80 GB y H100.
- Cuantizacion a 4 bits: aproximadamente 14-16 GB de VRAM; cabe en RTX 4090, RTX 3090 y GPUs consumer de 16 GB o mas, con contexto limitado.
- Apple Silicon: el formato MLX permite ejecucion en Mac con memoria unificada de 32 GB o superior (64 GB recomendado para contexto amplio).
- Opciones de despliegue: MLX (libreria declarada), llama.cpp y Ollama mediante los GGUF publicados, y potencialmente vLLM o TGI con los safetensors (no confirmado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| PeetPedro/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1 | ~27,36B | No disponible | Apache 2.0 | Finetune comunitario "uncensored", formatos MLX/GGUF/safetensors |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | No disponible | No disponible | No disponible | Modelo base directo del anterior; misma familia de ajustes |
| Qwen3 oficial (familia) | Variable | Variable | Apache 2.0 (segun version) | Modelos base alineados de Alibaba; referencia de comparacion |
| Llama 3.x 27B-30B (rango similar) | ~27-30B | Variable | Licencia comunitaria Llama | Alternativa densa de tamano comparable; contexto y rendimiento no comparados por falta de datos |

La comparacion cuantitativa no es posible: no hay benchmarks publicados del modelo ni del base en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentacion de entrenamiento: no se puede verificar calidad, contexto real ni comportamiento en tareas estandar.
- Modelo "uncensored"/"heretic": eliminacion deliberada de rechazos de seguridad; puede generar contenido danino, ofensivo o ilegal. No apto para produccion orientada al publico sin filtros externos.
- Riesgo elevado de alucinacion: al ser un ajuste comunitario sin evaluacion publicada, la fiabilidad factual no esta garantizada.
- Soporte limitado al ingles segun la model card; el rendimiento en castellano no esta documentado.
- Cadena de modelos base larga y poco documentada: la licencia Apache 2.0 declarada debe verificarse contra las condiciones de los modelos originales de la cadena (Qwen y ajustes intermedios).
- Repositorio de 143 GB con multiples formatos: requiere espacio de almacenamiento considerable y seleccion cuidadosa del archivo a descargar.
- Sin garantias de mantenimiento: 0 likes y 499 descargas en el momento de la consulta; proyecto de autor individual sin soporte.
- El tag `qwen3_5`/`qwen3_8` sugiere una nomenclatura no oficial; la correspondencia exacta con versiones publicas de Qwen no esta confirmada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PeetPedro/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
