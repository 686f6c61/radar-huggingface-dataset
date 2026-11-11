# qda-lab/QDA-Qwen3.5-4B-W4A16

## Resumen

QDA-Qwen3.5-4B-W4A16 es un checkpoint cuantizado del modelo Qwen/Qwen3.5-4B, publicado por qda-lab bajo licencia Apache 2.0. Se trata de una cuantización weight-only (solo pesos) en formato compressed-tensors: los pesos se almacenan en enteros de 4 bits asimétricos agrupados de 64 en 64, mientras que las activaciones permanecen en 16 bits (W4A16). El resultado es un checkpoint de 4.659.865.088 parámetros almacenados en un repositorio de 4,2 GB, pensado para reducir el coste de memoria en inferencia sin modificar la arquitectura del modelo original.

El modelo hereda todas las capacidades del Qwen3.5-4B de referencia, orientado a generación de texto y conversación, y está etiquetado como pre-release: la evaluación está pendiente y la versión completa, con resultados de evaluación, está prevista para el 2026-11-20. Por tanto, cualquier dato de rendimiento debe considerarse provisional hasta esa fecha.

Su relevancia actual reside en que permite desplegar un modelo de ~4,7B parámetros en entornos con VRAM limitada manteniendo las activaciones en FP16/BF16, lo que simplifica la integración con librerías que ya soportan compressed-tensors y evita las pérdidas de calidad asociadas a cuantizar también las activaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 4.659.865.088 (~4,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: pesos INT4 asimetricos en grupos de 64; pesos INT8 simetricos en grupos de 64; activaciones en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamano del repositorio | 4,2 GB |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del Qwen/Qwen3.5-4B original; la model card no describe la arquitectura interna del modelo base (numero de capas, dimensiones ocultas, tipo de atención ni mecanismos de decodificación). Lo que sí se especifica es el esquema de cuantizacion: cuantizacion weight-only, con pesos en enteros de 4 bits asimétricos agrupados en bloques de 64 y una parte en enteros de 8 bits simétricos también en grupos de 64, mientras que las activaciones se mantienen en 16 bits. El resultado se almacena en el formato compressed-tensors, lo que permite cargarlo con las herramientas de esa librería.

No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, la composición de los datos ni si hubo fases de RLHF, DPO o similar. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) en la información proporcionada. El proceso de cuantizacion en sí (calibración, criterio de agrupación) no se detalla más allá de los parámetros de grupo indicados.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.5-4B (pipeline text-generation, etiqueta conversational).
- Razonamiento y generación de código: presumiblemente soportadas por el modelo base, pero no verificadas en este checkpoint al no haberse publicado evaluación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el campo de idiomas no está informado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en GPU de consumo: con 4,2 GB de pesos en INT4, el checkpoint cabe en tarjetas de 8 GB de VRAM o superiores, lo que permite ejecutar un modelo de ~4,7B en estaciones de trabajo con RTX 3060/4060 o similares.
- Servicio de chat y atención al cliente: al ser un modelo conversacional, puede gestionar diálogos multi-turno; la ventana de contexto concreta debe confirmarse contra el modelo base, ya que no se documenta aquí.
- Prototipado rápido de aplicaciones de generación de texto: el formato compressed-tensors permite cargar el modelo con librerías compatibles sin reescribir pipelines de inferencia.
- Inferencia con memoria limitada en servidores: al mantener las activaciones en 16 bits, se evita el coste y la complejidad de kernels de activación de baja precisión, lo que simplifica el despliegue en infraestructura estándar.
- Evaluación comparativa de técnicas de cuantizacion: sirve como referencia para medir la degradación de calidad de W4A16 frente al modelo base una vez publicados los resultados de evaluación previstos para el 2026-11-20.
- Fine-tuning ligero o adaptación posterior: al estar bajo Apache 2.0 y en safetensors, puede servir de punto de partida para adaptaciones, siempre que la librería de entrenamiento soporte el formato compressed-tensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación está pendiente y que la versión completa con resultados está prevista para el 2026-11-20.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,2 GB solo para pesos; con overhead de activaciones en 16 bits y caché KV, se recomienda un mínimo de 6-8 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso local; A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM, siempre que la caché KV y el contexto utilizado no excedan el margen disponible.
- Opciones de despliegue: al estar en formato compressed-tensors, requiere librerías compatibles (por ejemplo, vLLM con soporte compressed-tensors). La compatibilidad con llama.cpp, Ollama o TGI no está confirmada en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QDA-Qwen3.5-4B-W4A16 | ~4,7B | no disponible | W4A16 (compressed-tensors) | Apache 2.0 | Hugging Face (pre-release) |
| Qwen/Qwen3.5-4B (base) | ~4,7B | no disponible | FP16/BF16 | Apache 2.0 | Hugging Face |
| Alternativas de ~4B en INT4 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con otras alternativas de la misma categoría no está disponible en la información proporcionada; únicamente puede contrastarse con su modelo base, del que se diferencia por el esquema de cuantizacion y el tamaño en disco.

## Limitaciones y advertencias

- Checkpoint en estado pre-release: la evaluación está pendiente y los resultados de calidad no se han publicado; no debe asumirse un rendimiento equivalente al modelo base.
- La cuantizacion W4A16 puede introducir degradación en tareas sensibles a la precisión numérica (matemáticas, código, razonamiento largo); no cuantificada en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada; al heredar los del modelo base, deben evaluarse antes de uso en producción.
- Riesgo de alucinación: no evaluado en este checkpoint.
- Idiomas soportados: no informados; no se garantiza cobertura multilingüe.
- Longitud de contexto: no documentada; verificar contra el modelo base antes de diseñar aplicaciones con contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el texto de licencia incluido en el repositorio.
- Compatibilidad de despliegue limitada al ecosistema compressed-tensors; verificar soporte en la herramienta de inferencia elegida.

## Enlaces

- Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.5-4B-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
