# bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ3.5e-mtp

## Resumen

MiMo-V2.6-Distill-Qwen-9B-oQ3.5e-mtp es una cuantización mixta del modelo bambocher/MiMo-V2.6-Distill-Qwen-9B, un modelo de aproximadamente 9.650 millones de parámetros construido sobre la arquitectura Qwen 3.5 (etiqueta `qwen3_5` en Hugging Face). El checkpoint original es un destilado de MiMo-V2.6 sobre una base Qwen, e incorpora un cabezal MTP (multi-token prediction) y un módulo de visión de 456 millones de parámetros, según el desglose publicado por el autor de la cuantización.

La relevancia de esta ficha radica en el formato: se trata de una cuantización de precisión mixta generada con oQ (oMLX v0.7.3), que combina capas en 3, 4, 5, 6 y 16 bits para lograr un promedio efectivo de 4,703 bits por peso. El resultado ocupa 5,285 GiB en disco y está empaquetado en safetensors para su uso con la librería MLX de Apple, lo que lo hace ejecutable en hardware Apple Silicon con memoria unificada moderada.

No se dispone de información publicada sobre el proceso de entrenamiento del modelo base, los datos utilizados, los idiomas soportados ni la licencia. El repositorio no registra descargas ni interacciones en el momento de la consulta, y la model card se limita a documentar la distribución de bits de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`), con cabezal MTP y módulo de visión |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ: affine 3-bit (grupo 64), 4-bit (grupo 64), 5-bit (grupo 64), 6-bit (grupo 64) y BF16; promedio efectivo 4,703 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

Desglose de la cuantización por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 4,578 GB / 4,264 GiB |
| Visión | 0,456B | 0,912 GB / 0,849 GiB |
| Cabezal MTP | 0,243B | 0,185 GB / 0,172 GiB |
| Total | 9,653B | 5,675 GB / 5,285 GiB |

Distribución por precisión:

| Formato | Pesos lógicos | Proporción | Almacenamiento | Bits efectivos/peso |
|---|---|---|---|---|
| Affine 3-bit, grupo 64 | 6,117B | 63,372% | 2,493 GiB | 3,50 |
| Affine 4-bit, grupo 64 | 1,625B | 16,837% | 0,851 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 0,403B | 4,171% | 0,258 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 1,017B | 10,537% | 0,770 GiB | 6,50 |
| BF16 | 0,491B | 5,083% | 0,914 GiB | 16,00 |
| Total | 9,653B | 100% | 5,285 GiB | 4,703 |

## Arquitectura y entrenamiento

La información disponible identifica la arquitectura mediante la etiqueta `qwen3_5`, lo que sitúa el modelo base en la familia Qwen 3.5 de transformers densos. El checkpoint incorpora dos componentes adicionales al modelo de lenguaje: un módulo de visión de 456 millones de parámetros, que habilita entrada multimodal de imágenes, y un cabezal MTP (multi-token prediction) de 243 millones de parámetros. El cabezal MTP permite predecir varios tokens por paso, una técnica habitualmente asociada a decodificación especulativa y a la mejora del throughput en inferencia.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineación. El nombre del checkpoint indica que se trata de un destilado de MiMo-V2.6 sobre una base Qwen, pero no se documenta el procedimiento de destilación ni el profesor utilizado. La cuantización oQ aplicada por bambocher asigna mayor precisión a determinadas capas (6-bit y BF16 para el 15,6% de los pesos) y comprime el grueso del modelo a 3-bit, una estrategia de precisión mixta orientada a preservar la calidad en las capas más sensibles.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un transformer denso de 9,65B, adecuado para tareas de generación y razonamiento general.
- Procesamiento de imágenes: el módulo de visión de 456M parámetros habilita entrada multimodal, según el desglose de componentes.
- Predicción multi-token: el cabezal MTP de 243M parámetros permite decodificación especulativa y generación de varios tokens por paso.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está empaquetado para MLX y ocupa 5,285 GiB, por lo que puede ejecutarse en Macs con memoria unificada de 16 GB o superior, aprovechando el soporte nativo de MLX para GPUs de Apple.
- Prototipado de asistentes multimodales: el módulo de visión integrado permite construir demos de descripción de imágenes y respuesta a preguntas visuales sin necesidad de un modelo de visión separado.
- Evaluación de cuantización mixta: el checkpoint sirve como referencia para estudiar el impacto de la precisión mixta oQ (3 a 6 bits) en la calidad de un modelo de 9,65B, comparándolo con el modelo base sin cuantizar.
- Decodificación especulativa: el cabezal MTP puede emplearse para acelerar la generación en pipelines de MLX, reduciendo el número de pasos necesarios por token emitido.
- Investigación sobre destilación: al ser un destilado de MiMo-V2.6 sobre base Qwen, resulta útil para analizar la transferencia de capacidades entre modelos de distinta familia.
- Despliegue en entornos con restricciones de memoria: los 5,285 GiB del checkpoint permiten servirlo en dispositivos con recursos limitados donde un modelo de 9,65B en BF16 (unos 19 GB) no cabría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 5,285 GiB de pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 8-10 GB de memoria disponible para contexto corto.
- GPU recomendadas: Apple Silicon con memoria unificada (M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max). El formato MLX no está pensado para GPUs NVIDIA o AMD.
- Compatibilidad con GPU de consumo: sí, en equipos Apple con 16 GB o más de memoria unificada; no es compatible de forma nativa con RTX 4090 u otras GPUs discretas sin conversión previa del checkpoint.
- Opciones de despliegue: MLX (librería nativa), oMLX para la gestión de cuantizaciones oQ. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en el formato actual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-oQ3.5e-mtp | 9,653B | no disponible | safetensors (MLX) | no disponible | Hugging Face |
| bambocher/MiMo-V2.6-Distill-Qwen-9B (base) | 9,653B (sin cuantizar) | no disponible | safetensors | no disponible | Hugging Face |
| Qwen 3.5 (familia base) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3-bit en el 63,4% de los pesos puede degradar la calidad respecto al modelo base en tareas sensibles a la precisión numérica, como matemáticas o código.
- No se documenta la licencia del modelo base ni de la cuantización, por lo que no puede confirmarse el uso comercial.
- El checkpoint está en formato MLX y no es directamente utilizable en ecosistemas CUDA; requiere conversión para GPUs NVIDIA.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que impide garantizar su comportamiento en contextos largos o en idiomas distintos del inglés.
- El repositorio no registra descargas ni validación por parte de la comunidad, por lo que no hay evidencia pública de su calidad en producción.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable un comportamiento similar al del modelo base, sin datos que lo confirmen.
- El cabezal MTP y el módulo de visión requieren soporte específico en el runtime de inferencia; no todos los motores MLX los aprovechan de forma automática.

## Enlaces

- [Hugging Face: bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ3.5e-mtp](https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ3.5e-mtp)
- [Modelo base: bambocher/MiMo-V2.6-Distill-Qwen-9B](https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B)
- [oQ / oMLX (herramienta de cuantización)](https://github.com/jundot/omlx)
