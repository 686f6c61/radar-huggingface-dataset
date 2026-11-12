# scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ8e-mtp

## Resumen

Swift1.5-Qwen3.8-Flash-Next-oQ8e-mtp es una cuantizacion mixta de 8 bits del modelo base ukisai/Swift1.5-Qwen3.8-Flash-Next, publicada por el usuario scottlowry. El checkpoint conserva los 180.000 millones de parametros del modelo original (179.999.981.459 segun los safetensors) y esta empaquetado en formato MLX, lo que lo hace ejecutable sobre el framework de Apple para silicio unificado. La cuantizacion se ha realizado con oQ (oMLX v0.7.4.dev1) y emplea precision mixta: capas afines de 8 bits con grupos de 64 y 128, una tabla de embeddings N-gram tambien en 8 bits con grupo 32 y un pequeno residuo en BF16.

El interes de esta ficha no esta en el modelo en si (es una derivacion del base, sin model card propia mas alla de la tabla de cuantizacion) sino en el empaquetado: un checkpoint de 180.000 millones de parametros comprimido a 8,660 bits por peso de media, con un peso total en disco de 181,476 GiB. Incluye ademas una cabeza MTP (multi-token prediction) de 2.607 millones de parametros y un modulo de vision de 0.449 millones, lo que sugiere que el modelo base es multimodal y soporta decodificacion especulativa mediante prediccion multi-token.

La relevancia practica es doble: por un lado demuestra que es viable servir un modelo de clase 180B en entornos Apple con memoria unificada alta; por otro, la presencia de MTP y vision en el checkpoint indica que el modelo base esta disenado para inferencia acelerada y tareas multimodales. No obstante, la informacion publicada es muy escasa: no hay licencia, idiomas, benchmarks ni detalles de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles del base no disponibles); incluye cabeza MTP y modulo de vision |
| Parametros totales | 179.999.981.459 (180.000B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta oQ: affine 8-bit grupo 128 (2.406B), affine 8-bit grupo 64 (125.878B), BF16 (0.516B), N-gram affine 8-bit grupo 32 (51.200B) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX), 8,660 bits/peso efectivos |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. Lo que se puede inferir del checkpoint es que se trata de un transformer con al menos tres componentes diferenciados: un cuerpo de lenguaje de 125.744B parametros logicos, una tabla de embeddings N-gram de 51.200B (que ocupa el 28,445% de los pesos y se almacena en affine 8-bit con grupo 32), un modulo de vision de 0.449B y una cabeza MTP de 2.607B. La existencia de la cabeza MTP apunta a un esquema de prediccion multi-token, habitualmente usado para decodificacion especulativa o generacion acelerada. El modulo de vision confirma capacidades multimodales en el base.

Sobre el entrenamiento no hay datos: no se indica numero de tokens, composicion del dataset, ni si hubo RLHF, DPO o similar. La unica innovacion documentada en esta ficha es el propio proceso de cuantizacion: oQ aplica precision mixta asignando 8,25 bits/peso a 2.406B parametros (grupo 128), 8,50 bits/peso a 125.878B (grupo 64), 16 bits/peso a 0.516B y 9,00 bits/peso a la tabla N-gram (grupo 32). El promedio efectivo es de 8,525 bits/peso excluyendo la tabla N-gram, o 8,660 bits/peso para el checkpoint completo.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base, aunque sin documentacion especifica en esta ficha.
- Capacidades multimodales: el checkpoint incluye un modulo de vision de 0.449B parametros, lo que indica soporte de entrada de imagenes en el base.
- Prediccion multi-token (MTP): la cabeza dedicada de 2.607B sugiere generacion acelerada o decodificacion especulativa.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon de alta gama: el checkpoint en formato MLX esta pensado para ejecutarse sobre el framework MLX en equipos con memoria unificada elevada (Mac Studio con 192 GB o superior), aprovechando la cuantizacion de 8,660 bits/peso para reducir el peso en disco a 181,476 GiB.
- Investigacion sobre cuantizacion mixta: util para estudiar el impacto de asignar precisiones distintas a cuerpo, embeddings N-gram y cabezas auxiliares (MTP, vision) en la calidad final del modelo.
- Evaluacion de decodificacion especulativa: la cabeza MTP permite experimentar con generacion multi-token y medir su efecto en latencia frente a decodificacion autoregresiva clasica.
- Prototipado multimodal: el modulo de vision integrado permite construir demos de descripcion de imagenes o VQA sobre silicio Apple, sin depender de GPUs dedicadas.
- Reproduccion de pipelines oQ: sirve como referencia para validar el flujo de cuantizacion de oMLX v0.7.4.dev1 sobre modelos de gran tamano.
- Comparacion de checkpoints: util para medir diferencias de perplejidad y calidad entre el base en BF16 y esta version en 8 bits, dado que el autor actualizo el checkpoint el 2026-11-11.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 181,476 GiB en disco; para inferencia en MLX se necesita memoria unificada suficiente para cargar los pesos y el estado de activaciones, por lo que se recomienda un minimo de 192 GB.
- GPU recomendadas: Apple Silicon con memoria unificada de 192 GB o superior (Mac Studio M2 Ultra / M3 Ultra, Mac Pro). No es compatible de forma nativa con GPUs NVIDIA o AMD en este formato.
- Cabe en consumer GPU: no. El tamano de 180B parametros y 181,476 GiB de pesos excede cualquier GPU de consumo actual.
- Opciones de despliegue: MLX (libreria declarada en el repo), oMLX. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift1.5-Qwen3.8-Flash-Next-oQ8e-mtp (este) | 180.000B | no disponible | MLX safetensors 8-bit | no disponible | Hugging Face, 136 descargas |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base) | 180.000B (segun checkpoint derivado) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de clase 180B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con modelos de la misma categoria en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no hay informacion sobre sesgos, alineamiento, datos de entrenamiento ni evaluaciones del modelo base.
- Licencia no especificada: no se puede determinar si el uso comercial esta permitido; es imprescindible consultar la licencia del modelo base ukisai/Swift1.5-Qwen3.8-Flash-Next antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones publicadas que lo cuantifiquen.
- Idiomas soportados desconocidos: no se puede garantizar calidad en castellano ni en otros idiomas.
- Limitaciones de contexto: la longitud de contexto no esta documentada.
- Cuantizacion de 8 bits: puede degradar ligeramente la calidad frente al base en BF16; no hay mediciones publicadas del delta.
- Dependencia de MLX: el checkpoint solo es utilizable en el ecosistema Apple; no es portable a CUDA sin conversion previa.
- Tamano de descarga elevado: 341,1 GB de repositorio, lo que exige almacenamiento y ancho de banda considerables.
- Autorizacion de uso: el autor indica que se re-cuantizo el 2026-11-11 y recomienda volver a descargar; versiones anteriores pueden estar desactualizadas.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ8e-mtp
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Repositorio oMLX (herramienta de cuantizacion): https://github.com/jundot/omlx
