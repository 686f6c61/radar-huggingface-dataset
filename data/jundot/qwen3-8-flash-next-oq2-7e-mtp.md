# Jundot/Qwen3.8-Flash-Next-oQ2.7e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ2.7e-mtp es una cuantizacion de precision mixta en formato MLX del modelo Qwen/Qwen3.8-Flash-Next, un checkpoint experimental de la arquitectura que anticipa Qwen4. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un modelo de lenguaje y vision con mezcla de expertos (MoE) de 125B parametros con 6B activos, acompanado de una tabla de embeddings de n-gramas de 51B, un codificador visual de 0,45B y un modulo de prediccion multi-token (MTP) de 2,6B. En total, el checkpoint cuantizado almacena 179.999.981.459 parametros.

La relevancia de esta version radica en que reduce un modelo de 180B parametros a 85,65 GB de almacenamiento mediante cuantizacion mixta adaptativa (oQ2.7e), lo que permite ejecutarlo en hardware Apple Silicon con memoria unificada, algo inviable con los pesos originales en BF16. La cuantizacion asigna bits por sensibilidad de capa medida, con un promedio efectivo de 3,260 bits por peso en el backbone de lenguaje y 3,807 bits por peso en el checkpoint completo.

El autor, Jundot, publico una primera version el 12 de octubre de 2026 y la recuantizo el 19 de noviembre de 2026 con el redondeo oQe refinado de oMLX 0.8.0. La licencia es Qwen Community License 1.0, heredada del modelo fuente, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-lenguaje con Gated DeltaNet, Qwen Sparse Attention (QSA) y Gated Residual; incluye encoder visual y cabeza MTP |
| Parametros totales | 179.999.981.459 (180B) |
| Parametros activos | 6B en el backbone MoE (125B totales, 6B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta oQ2.7e: affine 2/3/4-bit grupo 64, affine 8-bit grupo 64 y 128, BF16, y n-gram embedding affine 4-bit grupo 32 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license: other) |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |
| Bits efectivos por peso | 3,260 (backbone de lenguaje); 3,807 (checkpoint completo) |
| Tamano del repositorio | 85,7 GB (85,650 GB / 79,767 GiB de pesos) |
| Descargas | 1.269 |
| Fecha de creacion | 2026-10-12 |
| Ultima actualizacion | 2026-11-19 |

## Arquitectura y entrenamiento

El modelo base combina un backbone MoE de 125,744B parametros logicos con 6B activos por token, una tabla de embeddings de n-gramas de 51,200B, un codificador visual de 0,449B y una cabeza de prediccion multi-token de 2,607B. La arquitectura sustituye la atencion estandar por una combinacion de Gated DeltaNet (atencion lineal con estado recurrente) y Qwen Sparse Attention (QSA), y emplea flujos residuales con compuerta (Gated Residual). La cabeza MTP permite decodificacion especulativa multi-token, lo que reduce el coste por token generado en inferencia.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada. La cuantizacion de esta version se realizo con oMLX 0.8.0 mediante el metodo oQ: asignacion de bits por sensibilidad de capa medida, redondeo con matriz de importancia (1024 muestras x 512 tokens) y reajuste de escala y sesgo por minimos cuadrados ponderados. Por debajo de oQ4, la tabla de embeddings de n-gramas se mantiene a 4 bits y queda fuera del presupuesto de bits, ya que oMLX puede servirla desde SSD en lugar de memoria.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante el codificador visual de 0,449B.
- Prediccion multi-token (MTP) para decodificacion especulativa y mayor throughput.
- Embeddings de n-gramas de gran escala (51,2B) servibles desde SSD para ampliar cobertura lexica sin coste de memoria.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 79,767 GiB de pesos puede cargarse en equipos con memoria unificada de 96 GB o superior (por ejemplo, Mac Studio con M3/M4 Ultra), permitiendo ejecutar un modelo de 180B parametros sin GPU dedicada.
- Procesamiento de documentos con imagen: al aceptar entrada image-text-to-text, puede extraer y resumir informacion de capturas, formularios escaneados o diagramas tecnicos en un flujo local sin enviar datos a la nube.
- Prototipado de aplicaciones multimodales en MLX: util para desarrolladores que quieran validar la arquitectura experimental de Qwen4 (Gated DeltaNet + QSA) antes de que haya pesos oficiales en otros formatos.
- Generacion asistida con decodificacion especulativa: la cabeza MTP de 2,607B permite acelerar la generacion en entornos MLX donde el cuello de botella es la latencia por token.
- Investigacion sobre cuantizacion extrema: sirve como referencia para estudiar el impacto de la precision mixta a 3,26 bits/peso en un MoE de 180B, comparando la salida con el modelo base en BF16.
- Despliegue de bajo consumo en estaciones de trabajo macOS: al reducir el peso a 85,65 GB, se puede mantener el modelo residente en un unico equipo para tareas de asistencia interna sin infraestructura de servidores GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 79,767 GiB de pesos en disco; se necesita al menos 80 GB de memoria unificada para cargar el checkpoint, y 96 GB o mas para dejar margen a la cache KV y al contexto.
- GPU recomendadas: no aplica en el sentido tradicional; el formato MLX esta disenado para Apple Silicon (series M1 a M4, con preferencia por variantes Max y Ultra).
- Cabe en GPU de consumo: no en GPUs NVIDIA de consumo con 24 GB (RTX 4090); requiere memoria unificada de Apple Silicon de gama alta o GPUs profesionales con 80 GB o mas si se convirtieran los pesos a otro formato.
- Opciones de despliegue: oMLX 0.8.0 o superior (soporte nativo de oQ y servicio de n-gram embedding desde SSD); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ2.7e-mtp (este) | 180B (125B backbone + 51B n-gram + 4B vision/MTP) | 6B | no disponible | MLX safetensors, 3,807 bits/peso | Qwen Community 1.0 | Hugging Face, 1.269 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | 180B | 6B | no disponible | safetensors BF16 | Qwen Community 1.0 | Hugging Face |
| Alternativas de 7-14B densas | 7-14B | no aplica | no disponible | GGUF, safetensors | varian | amplia |

La comparacion con modelos densos de 7-14B no es directa: este checkpoint ofrece 6B parametros activos por token, similar en coste de computo a un modelo denso de ese tamano, pero con una tabla de n-gramas y un encoder visual adicionales que elevan el requisito de memoria muy por encima. No se dispone de datos de benchmarks para comparar rendimiento real.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo describe como una vista previa de la arquitectura de Qwen4, por lo que su estabilidad en produccion no esta garantizada.
- Cuantizacion agresiva a 3,260 bits/peso en el backbone: aunque el metodo oQ preserva capas sensibles, es esperable cierta degradacion frente al modelo base en BF16, especialmente en tareas de razonamiento y codigo.
- Requisito de memoria elevado: 79,767 GiB de pesos impiden su uso en GPUs de consumo; queda restringido a Apple Silicon de gama alta o hardware con 80 GB o mas.
- Dependencia de oMLX: el formato MLX y el servicio de n-gram embedding desde SSD estan ligados a la herramienta oMLX 0.8.0; no hay soporte documentado en otros runtimes.
- Idiomas soportados no documentados: no se puede confirmar el rendimiento multilingue ni la cobertura del castellano.
- Licencia Qwen Community 1.0: impone condiciones al uso comercial que deben revisarse antes de desplegar el modelo en productos.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de sesgos en la informacion disponible.
- Sin datos de benchmarks: no es posible validar la calidad frente a alternativas sin ejecutar evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ2.7e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oMLX: https://github.com/jundot/omlx
- Pull request de mejora de oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
