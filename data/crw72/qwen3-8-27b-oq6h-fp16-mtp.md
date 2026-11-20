# crw72/Qwen3.8-27B-oQ6h-fp16-mtp

## Resumen

Qwen3.8-27B-oQ6h-fp16-mtp es una cuantización mixta del modelo base Qwen/Qwen3.8-27B, publicada por el usuario crw72 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada al ecosistema MLX (Apple Silicon) mediante la herramienta oQ (oMLX v0.8.0), que aplica precisión mixta por tensor en lugar de una cuantización uniforme. El resultado es un checkpoint de 8.657 millones de parámetros lógicos almacenados en 24,8 GB, con un promedio efectivo de 22,906 bits por peso.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de cuantización de precisión mixta con cabezal MTP (multi-token prediction) preservado, lo que permite decodificación especulativa en inferencia. Por otro, evidencia un patrón de publicación poco habitual: el checkpoint dedica el 55,9 % de sus pesos lógicos a almacenamiento U32 (32 bits), lo que eleva el tamaño muy por encima de lo que cabría esperar de una cuantización de 6 bits nominal. La mayor parte del repositorio son, por tanto, tensores sin comprimir.

El modelo base pertenece a la familia Qwen3.5 (tag `qwen3_5` en el repositorio) e incorpora visión, según el desglose de componentes de la model card. La licencia declarada es Apache 2.0. No hay información publicada sobre idiomas soportados, pipeline de inferencia ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del linaje Qwen3.5 (tag `qwen3_5`); incluye torre de visión y cabezal MTP. Detalle interno no disponible |
| Parametros totales | 8.657.057.520 (8,657 B) según safetensors |
| Parametros activos | no disponible (no se declara variante MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta: affine 6-bit grupo 64, affine 8-bit grupo 64, FP16, FP32 y U32; promedio efectivo 22,906 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, librería MLX |

Desglose de almacenamiento por componente (datos de la model card):

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 7,772 B | 22,526 GB / 20,979 GiB |
| Visión | 0,461 B | 1,843 GB / 1,716 GiB |
| Cabezal MTP | 0,425 B | 0,418 GB / 0,389 GiB |
| Total | 8,657 B | 24,787 GB / 23,085 GiB |

Distribución por formato de almacenamiento:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 6-bit, grupo 64 | 1,602 B | 18,502 % | 1,212 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 1,313 B | 15,171 % | 1,300 GiB | 8,50 |
| FP16 | 0,439 B | 5,071 % | 0,818 GiB | 16,00 |
| FP32 | 0,461 B | 5,322 % | 1,716 GiB | 32,00 |
| U32 | 4,842 B | 55,935 % | 18,039 GiB | 32,00 |

## Arquitectura y entrenamiento

El checkpoint no aporta información sobre el entrenamiento del modelo base: ni volumen de tokens, ni composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que sí documenta es el proceso de cuantización. La herramienta oQ (oMLX v0.8.0) asigna formatos de almacenamiento distintos por tensor: bloques en affine 6-bit y 8-bit con grupo de 64, junto con tensores preservados en FP16, FP32 y U32.

El dato técnico más llamativo es que 4,842 B de pesos lógicos (55,9 %) se almacenan en U32, lo que consume 18,039 GiB, es decir, el 78 % del tamaño total del repositorio. Esto contradice la etiqueta `6-bit` del repositorio y explica el promedio de 22,906 bits/peso. En la práctica, el checkpoint no ofrece las ventajas de memoria de una cuantización de 6 bits: ocupa prácticamente lo mismo que el modelo en media precisión.

El cabezal MTP (multi-token prediction) se conserva como componente separado de 0,425 B de parámetros. Su presencia sugiere soporte para decodificación especulativa o predicción de varios tokens por paso, aunque la model card no detalla cómo se activa ni qué ganancia de throughput aporta. La torre de visión (0,461 B) está almacenada íntegramente en FP32.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, sin evaluación publicada en este checkpoint.
- Procesamiento de visión: el repositorio incluye una torre visual de 0,461 B de parámetros en FP32, por lo que el modelo es multimodal entrada-imagen.
- Predicción multi-token: el cabezal MTP de 0,425 B habilita, en principio, decodificación especulativa, aunque no se documenta su integración en el runtime.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la librería declarada permiten cargar el checkpoint con `mlx-lm` en equipos con memoria unificada de 32 GB o más, aunque el tamaño de 24,8 GB deja poco margen para el KV cache en configuraciones de 32 GB.
- Evaluación de cuantización mixta: útil como caso de estudio para comparar la calidad de oQ frente a cuantizaciones uniformes de 4 y 8 bits sobre el mismo modelo base, midiendo la degradación por perplexity y tareas generativas.
- Prototipado multimodal en local: la torre de visión en FP32 permite experimentar con tareas imagen-texto sin depender de APIs, siempre que el hardware admita el checkpoint completo.
- Investigación sobre decodificación especulativa: el cabezal MTP aislado facilita estudiar la ganancia de throughput de la predicción multi-token frente a la decodificación autoregresiva estándar.
- Reproducción de pipelines de cuantización: sirve como referencia para validar la herramienta oMLX v0.8.0 y su política de asignación de precisión por tensor.
- Despliegue en estaciones de trabajo con memoria unificada alta: en equipos de 64 GB o más, el modelo puede ejecutarse cómodamente con contexto amplio, aunque sin las ventajas de huella que promete la etiqueta de 6 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 24,8 GB solo para pesos; con KV cache para contexto largo, se recomienda un mínimo de 32 GB y, de forma realista, 48-64 GB.
- GPU compatibles: el formato es MLX, por lo que el destino natural son los chips Apple M-series (M1 Pro/Max/Ultra, M2, M3, M4). No es un checkpoint para CUDA sin reconversión previa.
- Cabe en GPU de consumo: sí, en Apple Silicon con memoria unificada de 32 GB o superior, con margen limitado. En GPUs NVIDIA de consumo (RTX 4090, 24 GB) no cabe sin recuantizar, dado que el repositorio ocupa 24,8 GB.
- Opciones de despliegue: `mlx-lm` es la vía principal. vLLM, llama.cpp, Ollama y TGI no soportan este formato de forma nativa.
- Latencia y throughput: no disponibles. La presencia del cabezal MTP sugiere mejoras en decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| crw72/Qwen3.8-27B-oQ6h-fp16-mtp | 8,657 B lógicos (24,8 GB) | no disponible | Mixta, 22,906 bits/peso efectivos | Apache 2.0 | MLX safetensors |
| Qwen/Qwen3.8-27B (base) | no disponible en esta ficha | no disponible | Sin cuantizar | Apache 2.0 | safetensors |
| Cuantizaciones MLX uniformes de 4 bits del mismo base | no disponible | no disponible | 4 bits uniformes | Apache 2.0 | MLX safetensors |
| Cuantizaciones GGUF Q4/Q5 del mismo base | no disponible | no disponible | 4-5 bits | Apache 2.0 | GGUF |

La comparación relevante es frente a cuantizaciones uniformes del mismo modelo base: este checkpoint ocupa más espacio que un 4-bit o un 6-bit convencional y, por tanto, no compite en eficiencia de memoria, sino en fidelidad de pesos para los tensores que oQ decide preservar en alta precisión.

## Limitaciones y advertencias

- El promedio de 22,906 bits/peso implica que la etiqueta `6-bit` es engañosa: más de la mitad de los pesos lógicos están en U32 y el checkpoint ocupa 24,8 GB.
- Sin datos de evaluación, no hay evidencia publicada de que la precisión mixta preserve la calidad del modelo base frente a alternativas más compactas.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado con cuatro minutos de diferencia: no hay validación comunitaria.
- No se declaran idiomas soportados, longitud de contexto ni pipeline de inferencia.
- La licencia Apache 2.0 se hereda del modelo base, pero conviene verificar las condiciones del Qwen3.8-27B original antes de uso comercial.
- Riesgo de alucinación y sesgos: no documentados en esta ficha; son los del modelo base, no evaluados aquí.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a CUDA sin reconversión.
- El cabezal MTP se incluye, pero no se documenta cómo activarlo ni qué runtime lo aprovecha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/crw72/Qwen3.8-27B-oQ6h-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
