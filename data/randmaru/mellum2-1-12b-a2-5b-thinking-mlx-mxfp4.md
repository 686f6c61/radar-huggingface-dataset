# randmaru/Mellum2.1-12B-A2.5B-Thinking-mlx-mxfp4

## Resumen

Mellum2.1-12B-A2.5B-Thinking-mlx-mxfp4 es una cuantización MXFP4 del modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking, publicada por el usuario randmaru en Hugging Face. El modelo base es un decoder de arquitectura mixture-of-experts (MoE) desarrollado por JetBrains, con 12.149.923.072 parámetros totales y unos 2.500 millones de parámetros activos por token, distribuidos en 64 expertos con enrutamiento top-8 y 28 capas. Su ventana de contexto alcanza los 128.000 tokens.

El propósito de esta ficha es documentar la variante cuantizada, no el modelo original. Esta versión está pensada para inferencia nativa en Apple Silicon mediante MLX y Metal, y empaqueta los pesos en un único archivo `model.safetensors` de 6,46 GB con una media de aproximadamente 4,25 bits por peso. Los pesos se cuantizan a 4 bits en formato MXFP4 con tamaño de grupo 32, mientras que las compuertas del router se mantienen en 8 bits con grupo 64 para preservar la calidad del enrutamiento entre expertos.

La relevancia de esta publicación radica en que permite ejecutar un modelo MoE de 12B con contexto de 128K en hardware de consumo de Apple con un peso de descarga sensiblemente inferior al de la alternativa GGUF Q4_K_M (≈8,07 GB, ≈5,3 bits por peso). El modelo base está orientado a generación de texto, razonamiento y predicción de ediciones de código (next-edit-suggestion), y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder mixture-of-experts (MoE), 64 expertos, top-8, 28 capas |
| Parametros totales | 12.149.923.072 |
| Parametros activos | ≈2.500 millones (2.5B) |
| Longitud de contexto | 128.000 tokens (128K) |
| Tipos de cuantizacion | MXFP4 (4 bits, grupo 32, exponente compartido E8M0) para pesos; router gates en 8 bits (grupo 64); BF16 para escalas y tensores auxiliares |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), un único `model.safetensors` de 6.457.111.871 bytes |

## Arquitectura y entrenamiento

El modelo base es un decoder transformer con arquitectura mixture-of-experts: 28 capas, 64 expertos y enrutamiento top-8, lo que da lugar a unos 2.500 millones de parámetros activos sobre un total de 12.149.923.072. La ventana de contexto es de 128.000 tokens, adecuada para tareas de edición de código y conversaciones de varios turnos con repositorios extensos. El modelo incorpora un modo de razonamiento explícito, indicado por el sufijo "Thinking" en su nombre.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones de decodificación (por ejemplo, decodificación especulativa) ni mecanismos de atención lineal. La model card de esta variante se centra exclusivamente en el proceso de cuantización: pesos en MXFP4 con microscaling y grupo 32, compuertas del router preservadas en 8 bits y escalas en BF16, lo que resulta en un promedio de 4,25 bits por peso. Esta decisión de mantener el router en mayor precisión busca limitar la degradación del enrutamiento entre expertos, que es el punto más sensible a la cuantización agresiva en arquitecturas MoE.

## Capacidades

- Generación de texto conversacional y continuaciones de contexto largo, con ventana de hasta 128.000 tokens.
- Razonamiento explícito en modo "thinking", heredado del modelo base.
- Predicción de ediciones de código (edit-prediction y next-edit-suggestion), capacidad declarada en las etiquetas del repositorio.
- Generación de código y asistencia en entornos de desarrollo, dado el origen del modelo base en JetBrains.
- Compatibilidad con text-generation-inference según las etiquetas del repositorio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se especifican idiomas soportados.
- Capacidades de visión o audio: no disponibles; el pipeline es text-generation.

## Casos de uso

- Asistente de edición de código en el IDE: el modelo está etiquetado para next-edit-suggestion, por lo que puede integrarse en un plugin que, dado el contexto del archivo y la edición reciente del usuario, proponga la siguiente modificación. Los 128K de contexto permiten incluir varios archivos del proyecto en la ventana.
- Refactorización asistida sobre repositorios medianos: con 128.000 tokens de contexto se pueden pasar fragmentos amplios de código junto con instrucciones de refactorización, y el modo thinking permite razonar sobre dependencias antes de emitir el parche.
- Desarrollo local en Mac con Apple Silicon: al ejecutarse en MLX sobre Metal, el modelo cabe en un único archivo de 6,46 GB y permite trabajar sin conexión ni envío de código a servicios externos, lo que resulta relevante para código propietario.
- Generación de documentación técnica: el modelo puede resumir módulos y generar docstrings o guías a partir de bloques de código extensos aprovechando el contexto largo.
- Prototipado de agentes de código en local: la licencia Apache 2.0 y el tamaño reducido de la cuantización permiten desplegar el modelo en estaciones de trabajo para experimentar con pipelines de edición automática antes de escalar a infraestructura mayor.
- Revisión de cambios en pull requests: dado un diff y el contexto del repositorio, el modelo puede generar comentarios de revisión o detectar inconsistencias, aprovechando la ventana de 128K para incluir archivos relacionados.
- Evaluación comparativa de cuantizaciones: este repositorio sirve como referencia para medir la degradación de calidad de MXFP4 frente a Q4_K_M en una misma tarea de edición de código, ya que ambas versiones están publicadas para el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente compara tamaño y tasa de bits efectiva entre MXFP4 y GGUF Q4_K_M, sin métricas de calidad (MMLU, HumanEval, GSM8K u otras).

| Metrica | MXFP4 (este repo) | GGUF Q4_K_M (repo oficial) |
|---|---|---|
| Tamano de pesos | ≈6,46 GB (6.457.111.871 bytes) | ≈8,07 GB (8.071.295.264 bytes) |
| Bits efectivos por peso | 4,25 | ≈5,3 |
| Router gates | 8 bits (grupo 64) | Integrados en el k-quant |
| Runtime | mlx-lm y similares | llama.cpp y similares |
| Hardware | GPU de Apple Silicon via Metal | Metal, CUDA, ROCm, CPU |

## Requisitos de hardware

- VRAM/unified memory estimada: al menos 7-8 GB libres para cargar los 6,46 GB de pesos más overhead de contexto y caché KV; con contexto de 128K la memoria necesaria crece de forma apreciable y conviene reservar 16 GB o más en equipos Apple Silicon.
- GPU recomendadas: Apple Silicon con GPU integrada (series M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max, M4 Pro/Max) mediante MLX y Metal. No está pensado para CUDA ni ROCm en este formato.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada; no aplica a GPU discretas NVIDIA o AMD en este formato (para esas plataformas existe la variante GGUF).
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX; la etiqueta text-generation-inference aparece en el repositorio, aunque el runtime principal es MLX. Para llama.cpp, Ollama o vLLM debe usarse la variante GGUF del modelo base.
- Latencia y throughput: no disponibles. La model card indica que la velocidad depende del backend, la GPU, el tamaño de lote y la implementación de la cuantización, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| randmaru/Mellum2.1-12B-A2.5B-Thinking-mlx-mxfp4 | 12,15B | ≈2,5B | 128K | safetensors MLX (MXFP4, 4,25 bpw) | Apache 2.0 | Hugging Face |
| JetBrains/Mellum2.1-12B-A2.5B-Thinking-GGUF (Q4_K_M) | 12,15B | ≈2,5B | 128K | GGUF (≈5,3 bpw) | Apache 2.0 | Hugging Face |
| JetBrains/Mellum2.1-12B-A2.5B-Thinking (original) | 12,15B | ≈2,5B | 128K | safetensors BF16/FP | Apache 2.0 | Hugging Face |
| Mellum2.1-12B-A2.5B-Thinking-MXFP4_MOE (GGUF) | 12,15B | ≈2,5B | 128K | GGUF (≈4,6 bpw, 7,03 GB) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá del tamaño y la tasa de bits efectiva. La comparación con modelos de otros fabricantes (por ejemplo, otros MoE de 12B orientados a código) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La cuantización MXFP4 a 4,25 bits por peso implica una pérdida de precisión frente al modelo original en BF16; la propia model card reconoce que Q4_K_M, con ≈5,3 bits por peso, tiende a preservar mejor la precisión en valores atípicos. Es necesario evaluar la calidad en la tarea concreta antes de usarlo en producción.
- Las compuertas del router se mantienen en 8 bits para mitigar el daño al enrutamiento, pero no se han publicado métricas que cuantifiquen la degradación real del modelo cuantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan medidas específicas de mitigación en la información disponible.
- Sesgos conocidos: no disponibles; la model card no incluye análisis de sesgos.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés sin evaluación previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; conviene conservar el aviso de licencia y el reconocimiento al modelo base de JetBrains.
- Dependencia de plataforma: este formato solo es utilizable en Apple Silicon vía MLX; para CUDA, ROCm o CPU hay que recurrir a la variante GGUF.
- El repositorio tiene un volumen de descargas bajo (823) y un único "like", lo que sugiere poca validación comunitaria; conviene verificar la integridad de los pesos y reproducir la cuantización si la trazabilidad es crítica.
- El consumo de memoria crece con la longitud de contexto; usar los 128K tokens completos en equipos con memoria unificada limitada puede provocar swapping o fallos de asignación.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/randmaru/Mellum2.1-12B-A2.5B-Thinking-mlx-mxfp4
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Variante GGUF oficial: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking-GGUF
- Librería MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
