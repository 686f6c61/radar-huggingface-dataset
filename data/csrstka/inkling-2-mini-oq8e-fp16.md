# csrstka/Inkling-2-Mini-oQ8e-fp16

## Resumen

Inkling-2-Mini-oQ8e-fp16 es una versión cuantizada del modelo Inkling-2-Mini, publicada por el usuario csrstka en Hugging Face. Se trata de un checkpoint multimodal (lenguaje más visión) de aproximadamente 26.388 millones de parámetros en el modelo de lenguaje, más 0,318 mil millones en el componente de visión, lo que da un total lógico de 26.707 millones de parámetros. La cuantización se ha realizado con la herramienta oQ (oMLX v0.8.1) en precisión mixta, con un promedio efectivo de 5,810 bits por peso.

El modelo está empaquetado en formato MLX, la librería de Apple para ejecución de modelos en silicio de la compañía (chips M-series). El repositorio ocupa 19,4 GB y utiliza una combinación de formatos de almacenamiento: NVFP4 para la mayor parte de los pesos (76,3 %), MXFP8 (15,3 %), affine 8-bit (5,9 %) y una pequeña fracción en BF16, FP16 y FP32. Esta mezcla busca preservar la precisión en capas sensibles mientras reduce el tamaño total del checkpoint.

La relevancia de esta ficha es limitada pero concreta: se trata de una cuantización comunitaria de un modelo del que no se dispone de model card original, licencia declarada ni datos de entrenamiento en la información proporcionada. Resulta útil para desarrolladores que trabajen en el ecosistema MLX y quieran evaluar el modelo en hardware Apple, pero no debe confundirse con una publicación oficial del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta del repo: `inkling2_loop`) |
| Parámetros totales | 26.388.646.400 (lenguaje) + 0,318B (visión) = 26.707B lógicos |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: NVFP4 group 16, MXFP8 group 32, affine 8-bit group 64, BF16, FP16, FP32 (promedio 5,810 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ/oMLX |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. La etiqueta `inkling2_loop` sugiere alguna variante de atención o bucle recurrente, pero no hay datos que permitan confirmarlo. El checkpoint incluye un componente de visión de 0,318B parámetros, lo que indica que el modelo base es multimodal (visión-lenguaje), aunque se desconoce el codificador visual empleado.

Respecto al entrenamiento, no se han publicado en la información disponible datos sobre número de tokens, composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La única información técnica disponible es la relativa al proceso de cuantización: se aplicó oQ (oMLX v0.8.1) con precisión mixta, asignando NVFP4 a la mayoría de los pesos (20,384B lógicos, 10,679 GiB de almacenamiento) y manteniendo en mayor precisión las capas presumiblemente más sensibles (MXFP8 para 4,077B, affine 8-bit para 1,572B, y fracciones pequeñas en BF16/FP16/FP32).

## Capacidades

- Generación de texto y razonamiento: capacidad esperable por el tamaño (26B) y el formato conversacional implícito en el pipeline, aunque no hay confirmación explícita en la información disponible.
- Procesamiento de imágenes: el checkpoint incluye un módulo de visión de 0,318B parámetros, por lo que se espera soporte de entrada multimodal imagen-texto.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Inferencia local en Mac con silicio Apple: el formato MLX y la cuantización mixta a 5,81 bits/peso permiten ejecutar un modelo de 26B en equipos con memoria unificada de 32 GB o superior, algo inviable con pesos en BF16 (que requerirían unos 53 GB).
- Prototipado de aplicaciones multimodales en macOS: el módulo de visión incluido permite experimentar con tareas imagen-texto (descripción, VQA) sin salir del ecosistema MLX.
- Evaluación comparativa de esquemas de cuantización: el reparto documentado de bits por componente (NVFP4, MXFP8, affine 8-bit) lo convierte en un caso de estudio útil para medir el impacto de la precisión mixta en calidad frente a tamaño.
- Desarrollo de asistentes conversacionales con contexto largo: si el modelo base soporta ventanas extensas (dato no disponible), podría usarse para resumen y diálogo multi-turno en local.
- Investigación en eficiencia de inferencia: útil para medir throughput y latencia de un modelo de 26B cuantizado en MLX frente a alternativas GGUF en el mismo hardware.
- Pruebas de pipelines de generación de código o razonamiento en local: sin datos de benchmarks, debe validarse empíricamente antes de cualquier uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 19,4 GB de checkpoint; en la práctica se necesitan al menos 24-32 GB de memoria unificada para cargar pesos más caché KV y overhead de MLX.
- GPU recomendadas: chips Apple M-series con memoria unificada de 32 GB o más (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max). No es compatible de forma nativa con CUDA sin conversión previa.
- ¿Cabe en GPU consumer? Sí, en Mac con 32 GB o más de memoria unificada. En GPUs NVIDIA consumer (RTX 4090, 24 GB) requeriría conversión de formato y posiblemente recuantización, ya que el checkpoint está en MLX.
- Opciones de despliegue: MLX (librería nativa), oMLX. No se indica soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ8e-fp16 | 26,7B (lógicos) | no disponible | MLX safetensors (5,81 bits/peso) | no disponible | Hugging Face (repo comunitario) |
| Modelo base Inkling-2-Mini | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Alternativas de ~27B en MLX | no disponible | no disponible | MLX | variable | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribución; es imprescindible contactar con el autor o localizar la licencia del modelo base antes de usarlo en producción.
- Model card original ausente: no hay información sobre datos de entrenamiento, idiomas, sesgos o limitaciones del modelo base, lo que impide evaluar riesgos de alucinación o sesgo con rigor.
- Cuantización agresiva: el promedio de 5,81 bits/peso, con un 76 % de los pesos en NVFP4 (4,5 bits efectivos), puede degradar la calidad frente al modelo en BF16, especialmente en tareas de razonamiento matemático o código.
- Ecosistema restringido: el formato MLX limita el despliegue a hardware Apple; no es directamente usable en servidores NVIDIA o AMD sin conversión.
- Repo comunitario sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa de calidad.
- Sin benchmarks publicados: imposible verificar el rendimiento real frente a alternativas.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; sin datos de evaluación específicos, debe validarse en el dominio de aplicación.

## Enlaces

- Hugging Face: https://huggingface.co/csrstka/Inkling-2-Mini-oQ8e-fp16
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Inkling-2-Mini: no disponible en la información proporcionada
- Paper, blog o demo oficial: no disponible en la información proporcionada
