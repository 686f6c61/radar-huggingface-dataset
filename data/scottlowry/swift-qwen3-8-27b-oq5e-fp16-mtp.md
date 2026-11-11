# scottlowry/Swift-Qwen3.8-27b-oQ5e-fp16-mtp

## Resumen

Swift-Qwen3.8-27b-oQ5e-fp16-mtp es una cuantización mixta del modelo ukisai/Swift-Qwen3.8-27b, publicada por el usuario scottlowry. Se trata de un checkpoint de aproximadamente 27.781 millones de parámetros distribuidos en un transformer multimodal (lenguaje más visión) con una cabeza MTP (multi-token prediction) de 0.425B de parámetros. La cuantización se ha realizado con la herramienta oQ de oMLX (v0.7.4.dev1), que aplica precisión mixta por tensor en lugar de una cuantización uniforme.

El resultado es un checkpoint de 19.904 GiB de pesos lógicos (21.372 GB de almacenamiento en el repositorio) con un promedio efectivo de 6.154 bits por peso. La mayor parte de los pesos (87.97%) se almacena en 5 bits afines con grupo de 64, mientras que una fracción pequeña se conserva en 6, 8, 16 y 32 bits para preservar la precisión en capas sensibles: la torre de visión (0.461B en FP32) y la cabeza MTP (0.425B).

El modelo está empaquetado en formato MLX (safetensors), lo que lo orienta a inferencia en Apple Silicon. La relevancia de esta ficha es acotada: se trata de una cuantización de una comunidad pequeña, sin descargas ni validación pública, y la información disponible se limita a los metadatos de Hugging Face y a la model card del autor. No hay datos sobre licencia, idiomas, benchmarks ni pipeline declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión) con cabeza MTP; familia Qwen3.5 (tag `qwen3_5`) |
| Parámetros totales | 27.781.427.952 (27.781B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Mixta oQ: affine 5-bit (grupo 64), affine 6-bit (grupo 64), affine 8-bit (grupo 64), FP16, FP32; promedio efectivo 6.154 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX), 21.372 GB / 19.904 GiB en total |

Desglose de almacenamiento por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 26.896B | 19.164 GB / 17.848 GiB |
| Visión | 0.461B | 1.843 GB / 1.716 GiB |
| Cabeza MTP | 0.425B | 0.365 GB / 0.340 GiB |
| Total | 27.781B | 21.372 GB / 19.904 GiB |

Distribución por formato de almacenamiento:

| Formato | Pesos lógicos | Proporción | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 5-bit, grupo 64 | 24.440B | 87.971% | 15.648 GiB | 5.50 |
| Affine 6-bit, grupo 64 | 1.544B | 5.558% | 1.168 GiB | 6.50 |
| Affine 8-bit, grupo 64 | 1.282B | 4.614% | 1.268 GiB | 8.50 |
| FP16 | 0.055B | 0.198% | 0.103 GiB | 16.00 |
| FP32 | 0.461B | 1.658% | 1.716 GiB | 32.00 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de los tags y del desglose de componentes. El checkpoint deriva de ukisai/Swift-Qwen3.8-27b, etiquetado con la familia `qwen3_5`, y contiene tres bloques diferenciados: un modelo de lenguaje de 26.896B de parámetros, una torre de visión de 0.461B y una cabeza de predicción multi-token (MTP) de 0.425B. La presencia de visión y de MTP confirma que el modelo base es multimodal y que incorpora decodificación especulativa mediante predicción de varios tokens por paso.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, las fases de alineación (RLHF, DPO u otras) ni sobre innovaciones de atención. La cuantización oQ aplicada por scottlowry es una técnica de precisión mixta que asigna distintos anchos de bit según la sensibilidad de cada tensor: mantiene la torre de visión en FP32 y la cabeza MTP en precisión alta, mientras comprime el grueso del modelo de lenguaje a 5 bits afines con grupo de 64. Este enfoque busca minimizar la degradación de calidad respecto a una cuantización uniforme de 5 bits, a costa de un tamaño final algo mayor (6.154 bits/peso promedio frente a 5).

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5 de 27B; no hay evaluación publicada de esta cuantización concreta.
- Procesamiento de visión: el checkpoint incluye una torre de visión de 0.461B de parámetros conservada en FP32, por lo que se espera soporte de entrada de imágenes.
- Decodificación especulativa mediante cabeza MTP: la inclusión de una cabeza de predicción multi-token de 0.425B sugiere aceleración de la generación por verificación de varios tokens candidatos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 19.904 GiB permiten ejecutar el modelo en equipos con memoria unificada de 32 GB o superior, usando la librería mlx y la herramienta oMLX. Es el caso de uso principal de este checkpoint.
- Prototipado de aplicaciones multimodales en Mac: la torre de visión en FP32 permite experimentar con tareas de imagen a texto sin depender de servicios en la nube, siempre que el equipo tenga memoria suficiente.
- Evaluación de cuantización mixta: el checkpoint sirve como referencia para comparar la calidad de oQ a 6.154 bits/peso frente al modelo base en FP16 o frente a cuantizaciones uniformes de 5 y 6 bits.
- Investigación sobre decodificación especulativa: la cabeza MTP empaquetada permite estudiar el impacto de la predicción multi-token en latencia y calidad dentro del ecosistema MLX.
- Desarrollo de asistentes conversacionales offline: para equipos de desarrollo que necesiten un modelo de 27B sin conexión, con la salvedad de que no hay datos publicados de contexto ni de idiomas.
- Pruebas de integración en pipelines MLX: validar la carga de safetensors cuantizados con oQ en flujos de trabajo propios antes de adoptar la técnica en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 19.904 GiB de pesos más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 24 GB de memoria unificada, y 32 GB o más para contextos largos.
- GPU recomendadas: Apple Silicon con memoria unificada (M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max) por el formato MLX. No es un checkpoint pensado para CUDA.
- GPU de consumo: cabe en equipos Apple con 32 GB o más de memoria unificada; en 24 GB el margen es muy ajustado y depende de la longitud de contexto.
- Opciones de despliegue: librería mlx y oMLX (oQ). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado el formato MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27b-oQ5e-fp16-mtp (este) | 27.781B | No disponible | MLX safetensors, 6.154 bits/peso | No disponible | 0 descargas, 0 likes |
| ukisai/Swift-Qwen3.8-27b (base) | No disponible | No disponible | No disponible | No disponible | Modelo de referencia del que deriva |
| Otras cuantizaciones del mismo base | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre alternativas comparables en la misma categoría (modelos multimodales de ~27B en formato MLX) dentro de la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido. Es un riesgo bloqueante para producción.
- Idiomas no declarados: no hay garantía de cobertura multilingüe ni de calidad en castellano.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de la degradación introducida por la cuantización mixta respecto al modelo base.
- Sin descargas ni likes: el checkpoint no ha sido validado por la comunidad; posibles errores de empaquetado no detectados.
- Dependencia de MLX: no es portable a CUDA ni a motores de inferencia estándar como vLLM o llama.cpp sin conversión previa.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; sin datos específicos de esta cuantización.
- Sesgos: no documentados en la información disponible.
- Contexto desconocido: no se puede planificar el uso en conversaciones largas o documentos extensos sin conocer la ventana real.
- Fecha de creación futura (2026-11-11) en los metadatos: conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Swift-Qwen3.8-27b-oQ5e-fp16-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
