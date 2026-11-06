# richardyoung/Qwen2.5-7B-Instruct-DiM-heretic-MLX-4bit

## Resumen

Qwen2.5-7B-Instruct-DiM-heretic-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo richardyoung/Qwen2.5-7B-Instruct-DiM-heretic, que a su vez es una versión de Qwen/Qwen2.5-7B-Instruct a la que se le ha eliminado el comportamiento de rechazo (refusal removal) mediante la técnica DiM con Heretic 2.0. El autor, richardyoung, publica esta variante para ejecución en Apple Silicon a través de la librería MLX, con un tamaño de repositorio de 4,3 GB y 7.615.616.512 parámetros totales según los pesos safetensors.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.600 millones de parámetros y una ventana de contexto de 32.768 tokens en el modelo original (dato no confirmado en la información proporcionada para esta variante). La modificación principal respecto al modelo base es la supresión de las respuestas de rechazo, lo que lo convierte en una herramienta de investigación sobre mecanismos de seguridad y su robustez frente a técnicas de abliteration.

Es relevante ahora porque forma parte del estudio "Is Abliteration Getting Harder? Directional vs. Optimization-Based Refusal Removal Across Generations of Open-Weight LLMs" (Young, 2026, en preparación), que compara métodos direccionales y basados en optimización para eliminar el rechazo en distintas generaciones de modelos abiertos. La versión MLX 4-bit facilita la experimentación local en equipos Mac con chip Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | 4-bit affine, group size 64 (MLX) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer denso decoder-only con 7.600 millones de parámetros, atención con RoPE, normalización RMSNorm y activación SwiGLU. Sobre este modelo, el autor aplicó la técnica DiM (refusal removal) con Heretic 2.0, un procedimiento de eliminación de rechazo basado en optimización, descrito en el estudio de Young (2026). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO específicos para esta variante; estos datos corresponden al modelo base Qwen2.5-7B-Instruct, que fue entrenado con datos multilingües y ajustado con instrucciones.

La innovación técnica destacable es la propia eliminación del comportamiento de rechazo mediante optimización (Heretic 2.0), que modifica los pesos para suprimir las respuestas de negativa ante peticiones potencialmente dañinas. La conversión a MLX 4-bit se realizó con `mlx_lm.convert -q --q-bits 4 --q-group-size 64` usando mlx-lm 0.32.2, y solo difiere del modelo fuente en la cuantización; las evaluaciones del paper se ejecutaron sobre el modelo bf16, no sobre esta versión 4-bit.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas de nivel medio, propio de un modelo de 7B.
- Generación de código y comprensión de lenguajes de programación.
- Soporte de tool calling y function calling (capacidad del modelo base Qwen2.5-Instruct).
- Capacidades multilingües (el modelo base soporta varios idiomas; la lista exacta no está disponible en la información proporcionada).
- Comportamiento de rechazo suprimido: puede cumplir peticiones que el modelo original rechazaría.
- Ejecución optimizada en Apple Silicon mediante MLX.

## Casos de uso

- Investigación sobre seguridad de LLM: el modelo permite estudiar la robustez de los mecanismos de rechazo y evaluar hasta qué punto la abliteration basada en optimización (Heretic 2.0) elimina el comportamiento de negativa, comparándolo con métodos direccionales.
- Experimentación local en Mac: gracias a la cuantización 4-bit MLX y sus 4,3 GB, se puede ejecutar en equipos Apple Silicon con memoria unificada moderada para pruebas de inferencia y evaluación.
- Evaluación de sesgos y alineación: útil para medir cómo cambia el comportamiento del modelo al eliminar el rechazo, en entornos controlados de investigación.
- Generación de texto creativo sin restricciones de rechazo: para prototipos de escritura donde el modelo base podría negarse a producir cierto contenido.
- Benchmarking de cuantización: comparar el rendimiento del modelo bf16 frente a esta versión 4-bit MLX en tareas de razonamiento y generación.
- Desarrollo de pipelines de inferencia en macOS: integración con mlx-lm para pruebas de concepto y demos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las evaluaciones del paper se ejecutaron sobre el modelo fuente en bf16, no sobre esta versión 4-bit, y no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,3 GB para los pesos en 4-bit MLX; el consumo real en memoria unificada depende del contexto y del runtime.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada suficiente; no está pensado para GPU NVIDIA.
- Cabe en consumer GPU: sí, en equipos Apple Silicon con al menos 8 GB de memoria unificada (recomendable 16 GB para contextos largos).
- Opciones de despliegue: mlx-lm (librería oficial MLX); no aplica vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-7B-Instruct-DiM-heretic-MLX-4bit | 7,6B | No disponible (base 32.768) | MLX 4-bit | Apache 2.0 | Rechazo eliminado, optimizado para Apple Silicon |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 | safetensors bf16 | Apache 2.0 | Modelo base original con rechazo intacto |
| richardyoung/Qwen2.5-7B-Instruct-DiM-heretic | 7,6B | No disponible | safetensors bf16 | Apache 2.0 | Versión fuente sin cuantizar, con rechazo eliminado |

## Limitaciones y advertencias

- El modelo ha eliminado su comportamiento de rechazo y puede cumplir peticiones dañinas; está liberado para investigación sobre mecanismos de seguridad y su robustez, y el usuario es responsable de un uso lícito y ético.
- Riesgo elevado de generar contenido dañino, sesgado o inapropiado al no contar con las salvaguardas del modelo original.
- Riesgo de alucinación inherente a los modelos de 7B, sin datos específicos de evaluación en esta variante.
- La cuantización 4-bit puede degradar la calidad respecto al modelo fuente en bf16; las evaluaciones del paper no se ejecutaron sobre esta versión.
- La lista de idiomas soportados no está disponible en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el uso responsable recae en el usuario dada la supresión del rechazo.
- No se han publicado benchmarks ni datos de latencia/throughput para esta conversión MLX.

## Enlaces

- HuggingFace: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-DiM-heretic-MLX-4bit
- Modelo fuente: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-DiM-heretic
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- MLX: https://github.com/ml-explore/mlx
