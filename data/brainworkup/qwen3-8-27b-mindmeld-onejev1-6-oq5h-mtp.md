# brainworkup/Qwen3.8-27B-MindMeld-OneJev1.6-oQ5h-mtp

## Resumen

Qwen3.8-27B-MindMeld-OneJev1.6-oQ5h-mtp es una cuantizacion mixta del punto de control Qwen3.8-27B-MindMeld-OneJev1.6, publicada por el usuario brainworkup en Hugging Face. El resultado es un checkpoint de 7.816.573.680 parametros reales almacenados en safetensors con metadatos de la libreria MLX, orientado a inferencia en hardware Apple Silicon. La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.8.3), que aplica precision mixta por capas en lugar de un unico nivel de bits.

El checkpoint combina cuatro formatos de almacenamiento: bloques afines de 5, 6 y 8 bits con grupo de 64, ademas de pesos en BF16 y tensores en U32. El promedio efectivo declarado por el autor es de 20,930 bits por peso para el conjunto del checkpoint, lo que da un peso en disco de 19,046 GiB (20,450 GB). La presencia de una cabeza MTP (multi-token prediction) de 0,425B parametros y de un modulo de vision de 0,461B indica que el modelo base es multimodal y emplea decodificacion especulativa entrenada.

La relevancia de esta ficha es doble: por un lado documenta un caso practico de cuantizacion mixta agresiva sobre un modelo multimodal con MTP; por otro, advierte de que el nombre comercial ("27B") no coincide con los parametros reales almacenados (7,82B), una discrepancia habitual en checkpoints cuantizados y renombrados por terceros que conviene verificar antes de desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5), multimodal con modulo de vision y cabeza MTP; detalles de capas y atencion no disponibles |
| Parametros totales | 7.816.573.680 (7,82B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit grupo 64, affine 6-bit grupo 64, affine 8-bit grupo 64, BF16 y U32; promedio efectivo 20,930 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |
| Tamano del repositorio | 20,5 GB |

Desglose de almacenamiento por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 6,931B | 19,164 GB / 17,848 GiB |
| Vision | 0,461B | 0,921 GB / 0,858 GiB |
| Cabeza MTP | 0,425B | 0,365 GB / 0,340 GiB |
| Total | 7,817B | 20,450 GB / 19,046 GiB |

Distribucion por formato de cuantizacion:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 5-bit, grupo 64 | 0,362B | 4,628% | 0,232 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 1,271B | 16,265% | 0,962 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 1,282B | 16,400% | 1,268 GiB | 8,50 |
| BF16 | 0,900B | 11,510% | 1,676 GiB | 16,00 |
| U32 | 4,002B | 51,197% | 14,908 GiB | 32,00 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de la etiqueta `qwen3_5` y de la presencia de tres bloques funcionales diferenciados: un modelo de lenguaje de 6,931B parametros, un codificador o modulo de vision de 0,461B y una cabeza de prediccion multi-token (MTP) de 0,425B. La cabeza MTP es un componente tipico de los modelos entrenados para decodificacion especulativa, en la que el modelo predice varios tokens por paso y un verificador valida las propuestas; su inclusion en el checkpoint sugiere que el modelo base fue entrenado con este objetivo, aunque no se detalla el esquema de verificacion ni el numero de tokens especulados.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones de atencion (atencion lineal, ventanas deslizantes, etc.). El unico dato tecnico verificable del proceso de creacion es la cuantizacion: oQ (oMLX v0.8.3) asigna precision por capa, reservando BF16 para 0,900B parametros (11,51%) y U32 para 4,002B (51,20%), lo que sugiere que una parte mayoritaria de los pesos se almacena en un formato de 32 bits empaquetado, probablemente por los metadatos de escala y cero de la cuantizacion afin, y no porque esos pesos conserven precision completa. El resultado es un checkpoint de 20,930 bits/peso de media, mas cercano a una cuantizacion de 5-6 bits efectivos que a los 4 bits habituales en esquemas uniformes.

## Capacidades

- Generacion de texto y razonamiento: el bloque de lenguaje de 6,931B parametros conserva la funcionalidad del modelo base, aunque la cuantizacion mixta puede degradar tareas de razonamiento largo.
- Vision: incluye un modulo de vision de 0,461B parametros, por lo que se espera soporte de entrada de imagenes, aunque no se detallan resoluciones, numero de parches ni tareas evaluadas.
- Decodificacion especulativa: la cabeza MTP de 0,425B parametros permite acelerar la generacion si el runtime MLX la utiliza correctamente.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Modo thinking explicito: no disponible.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint esta empaquetado para MLX y ocupa 20,5 GB, por lo que encaja en equipos con 32 GB de memoria unificada o mas. Se usaria con `mlx_lm` o `mlx-vlm` para prototipado offline sin GPU dedicada.
- Pruebas de cuantizacion mixta: util como caso de estudio para comparar la calidad de oQ frente a esquemas uniformes de 4 y 8 bits sobre un mismo modelo base, midiendo perplejidad y tasas de acierto en tareas concretas.
- Evaluacion de decodificacion especulativa: la cabeza MTP permite medir la ganancia de throughput de la generacion especulativa en MLX frente a decodificacion autoregresiva estandar.
- Experimentos multimodales en local: el modulo de vision posibilita probar tareas de descripcion de imagenes o respuesta visual a preguntas en un portatil Apple, sin depender de APIs externas.
- Docencia y formacion: sirve para ilustrar el impacto de la cuantizacion por capas en un curso de eficiencia de modelos, comparando el reparto de bits declarado en la model card con el rendimiento observado.
- Base para fine-tuning ligero en MLX: al estar en safetensors y con la libreria MLX, puede servir de punto de partida para LoRA o adaptadores sobre el bloque de lenguaje, siempre que la licencia del modelo base lo permita (dato no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: al menos 21-24 GB libres para cargar el checkpoint completo; con 32 GB de memoria unificada en Apple Silicon hay margen para el contexto y el estado de inferencia.
- GPU recomendadas: el formato MLX esta pensado para Apple Silicon (series M1, M2, M3 y M4, con preferencia por variantes Pro, Max y Ultra). En GPU NVIDIA no es un formato nativo y requeriria conversion.
- Cabe en GPU de consumo: si, en equipos Apple con 32 GB o mas de memoria unificada. En GPUs NVIDIA de consumo (RTX 4090 con 24 GB) solo cabria tras conversion de formato y probablemente con cuantizacion adicional.
- Opciones de despliegue: `mlx_lm` y `mlx-vlm` son las rutas naturales; llama.cpp, Ollama, vLLM y TGI no soportan de forma nativa este empaquetado de cuantizacion mixta sin conversion previa.
- Latencia y throughput: no disponibles; dependeran del chip Apple, del uso efectivo de la cabeza MTP y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brainworkup/Qwen3.8-27B-MindMeld-OneJev1.6-oQ5h-mtp | 7,82B | no disponible | Mixta 5/6/8-bit + BF16/U32 (20,93 bits/peso) | no disponible | Hugging Face, MLX |
| Modelo base Qwen3.8-27B-MindMeld-OneJev1.6 | no disponible | no disponible | Original sin cuantizar | no disponible | no disponible en la informacion |
| Alternativas de ~7-8B en MLX | no disponible | no disponible | 4-bit y 8-bit uniformes habituales | variable | Hugging Face |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica "27B" pero el checkpoint almacena 7,82B parametros; conviene verificar que el modelo base es el esperado antes de usarlo en produccion.
- Licencia no declarada: no se especifica licencia en la model card ni en los metadatos, lo que impide confirmar el uso comercial. Es un riesgo legal relevante.
- Idiomas no declarados: no hay garantia de soporte multilingue ni de calidad en castellano.
- Cuantizacion mixta no estandar: el empaquetado de oQ con tensores U32 y escalas afines no es portable a runtimes convencionales; migrar a llama.cpp o vLLM exigira reconvertir o recuantizar.
- Riesgo de degradacion: el 51,20% de los pesos logicos almacenados en U32 y el 11,51% en BF16 indican un esquema heterogeneo; las capas en 5 bits pueden perder precision en tareas de matematicas o codigo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a cuantizaciones uniformes.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion de la comunidad sobre este checkpoint concreto.
- Riesgo de alucinacion y sesgos: no documentados por el autor; deben asumirse los del modelo base, que tampoco se detallan.
- Fecha de creacion futura (2026-11-24): conviene comprobar la integridad y procedencia del repositorio antes de confiar en el.

## Enlaces

- Hugging Face: https://huggingface.co/brainworkup/Qwen3.8-27B-MindMeld-OneJev1.6-oQ5h-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.8-27B-MindMeld-OneJev1.6: no disponible en la informacion proporcionada
- Paper, blog o demo del modelo: no disponible en la informacion proporcionada
