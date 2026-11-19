# Jundot/Qwen3.8-Flash-Next-oQ2.5e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ2.5e-mtp es una cuantizacion de precision mixta en formato MLX del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario Jundot mediante su herramienta oQ (oMLX v0.8.0). El modelo base es un anticipo experimental de la arquitectura que Qwen empleara en Qwen4: un modelo de lenguaje y vision con mezcla de expertos (MoE) de 125B parametros totales y 6B activos, acompanado de una tabla de embeddings de n-gramas de 51B parametros y un modulo de prediccion multi-token (MTP) de 4B. La cuantizacion reduce el checkpoint completo a 83,4 GB en disco, con un promedio efectivo de 3,704 bits por peso.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 180B parametros logicos en hardware Apple Silicon con un presupuesto de memoria muy contenido, gracias a la asignacion de bits por sensibilidad de capa y a la posibilidad de servir la tabla de n-gramas desde SSD en lugar de memoria. Es, por tanto, una pieza orientada a inferencia local y experimental, no a despliegues de produccion a gran escala.

El pipeline declarado es image-text-to-text, la libreria es MLX y la licencia es la Qwen Community License 1.0, heredada del modelo fuente. El checkpoint incluye el backbone de lenguaje, el encoder de vision, la tabla de n-gramas y la cabeza MTP, de modo que el artefacto es autocontenido para las tareas que cubre el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-lenguaje con Gated DeltaNet, Qwen Sparse Attention (QSA) y Gated Residual streams; incluye tabla de embeddings de n-gramas y cabeza MTP |
| Parametros totales | 179.999.981.459 (180B) |
| Parametros activos | 6B (backbone MoE); 125B en el backbone de lenguaje, 51B en la tabla de n-gramas, 0,449B en el encoder de vision, 2,607B en la cabeza MTP |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta oQ2.5e: affine 2-bit grupo 64, 3-bit grupo 64, 4-bit grupo 64, 8-bit grupo 128, 8-bit grupo 64, BF16 e I64; tabla de n-gramas en affine 4-bit grupo 32 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors en formato MLX (libreria mlx), 83,4 GB de repositorio |

## Arquitectura y entrenamiento

El modelo base combina un backbone de lenguaje con mezcla de expertos de 125B parametros y 6B activos con un encoder de vision de 0,449B, una tabla de embeddings de n-gramas de 51B y una cabeza de prediccion multi-token de 2,607B. La arquitectura sustituye la atencion clasica por una combinacion de Gated DeltaNet y Qwen Sparse Attention (QSA), sobre flujos residuales con compuertas (Gated Residual streams). La tabla de n-gramas y la cabeza MTP apuntan a decodificacion especulativa y a un modelado de secuencias mas eficiente en coste por token.

Esta publicacion no entrena el modelo: cuantiza el checkpoint original con oQ2.5e, que asigna el numero de bits por capa segun la sensibilidad medida, redondea cada grupo con una matriz de importancia (1024 muestras x 512 tokens) y reajusta escala y sesgo por minimos cuadrados ponderados. Por debajo de oQ4, la tabla de n-gramas se mantiene a 4 bits y queda fuera del presupuesto de bits porque oMLX puede servirla desde SSD. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text): el checkpoint incluye el encoder de vision.
- Prediccion multi-token mediante la cabeza MTP, que habilita decodificacion especulativa y generacion acelerada.
- Modelado asistido por n-gramas a traves de la tabla de embeddings de 51B, orientada a mejorar la eficiencia de la decodificacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 83,4 GB y 3,704 bits/peso efectivos permite ejecutar un modelo de 180B parametros logicos en equipos con memoria unificada alta, usando MLX y sirviendo la tabla de n-gramas desde SSD.
- Experimentacion con arquitecturas Qwen4: util para investigadores que quieran estudiar el comportamiento de Gated DeltaNet, QSA y los flujos residuales con compuertas antes de que la arquitectura este disponible de forma estable.
- Evaluacion de cuantizacion de precision mixta: sirve como caso de estudio de oQ2.5e, comparando la perdida de calidad frente al checkpoint BF16 del modelo base en tareas de lenguaje y vision.
- Prototipos de asistentes multimodales: al incluir encoder de vision, admite flujos de imagen y texto en local para pruebas de concepto sin depender de APIs externas.
- Investigacion sobre decodificacion especulativa: la cabeza MTP incluida permite medir la ganancia de throughput de la prediccion multi-token en MLX.
- Pruebas de despliegue con presupuesto de memoria ajustado: la asignacion por sensibilidad de capa y el uso de SSD para la tabla de n-gramas son un escenario realista para validar estrategias de offloading.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 83,4 GB de almacenamiento para el checkpoint completo; el backbone de lenguaje ocupa 48,9 GB (45,6 GiB), la tabla de n-gramas 32,0 GB (29,8 GiB), el encoder de vision 0,9 GB y la cabeza MTP 1,5 GB.
- Al servir la tabla de n-gramas desde SSD, el requisito de memoria se reduce en aproximadamente 29,8 GiB, quedando el backbone y el resto en torno a 47,8 GiB.
- GPU recomendadas: no disponible en la informacion proporcionada. El formato es MLX, por lo que el hardware objetivo son los chips de Apple Silicon con memoria unificada; no se documentan GPU NVIDIA (A100, H100, RTX 4090) para este checkpoint.
- Cabe en GPU de consumo: no disponible; depende de la memoria unificada del equipo Apple Silicon, no de una GPU discreta.
- Opciones de despliegue: MLX y oMLX (v0.8.0 o superior, necesario para el redondeo oQe refinado). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ2.5e-mtp (este) | 180B totales, 6B activos | no disponible | MLX safetensors, 83,4 GB | qwen-community-1.0 | Hugging Face, 1107 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | 125B backbone, 6B activos, mas 51B n-gramas y 4B MTP | no disponible | no disponible | qwen-community-1.0 | Hugging Face |
| Alternativas de tamano y tarea comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo describe como un anticipo de la arquitectura de Qwen4, no como un modelo estable para produccion.
- Cuantizacion agresiva: 3,704 bits/peso efectivos en el checkpoint completo y 3,113 bits/peso en el backbone implican una perdida de calidad no cuantificada frente al modelo original en BF16.
- Dependencia de MLX: el checkpoint solo es utilizable con la libreria MLX y oMLX 0.8.0 o superior; no hay pesos GGUF ni compatibilidad documentada con otros runtimes.
- Requisito de memoria elevado: 83,4 GB de checkpoint, o en torno a 47,8 GiB si se sirve la tabla de n-gramas desde SSD, lo que limita el hardware a equipos Apple Silicon de gama alta.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingue ni calidad por idioma.
- Riesgo de alucinacion y sesgos: no se han publicado evaluaciones de sesgo ni de fiabilidad para este checkpoint ni para el modelo base en la informacion disponible.
- Licencia: Qwen Community License 1.0, con posibles restricciones de uso comercial que deben revisarse en el fichero LICENSE antes de cualquier despliegue productivo.
- Actualizacion obligatoria: el autor recomienda volver a descargar el modelo si se tenia una copia anterior al 19 de noviembre de 2026, ya que el redondeo oQe refinado reduce el error de cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ2.5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de oQ/oMLX: https://github.com/jundot/omlx
- Pull request de mejora de oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
