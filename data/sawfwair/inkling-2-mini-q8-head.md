# Sawfwair/Inkling-2-Mini-Q8-Head

## Resumen

Inkling-2-Mini-Q8-Head es un checkpoint cuantizado del modelo Inkling-2-Mini desarrollado por Thinking Machines, republicado por el usuario Sawfwair para el runtime mere.run sobre Apple Silicon. Se trata de un empaquetado autocontenido que conserva los pesos originales de los expertos en formato mixto NVFP4/MXFP8, los pesos de visión, el tokenizer, el procesador de imágenes, la plantilla de chat y el borrador DSpark oficial, sustituyendo únicamente la cabeza de salida BF16 por una cuantización afín Q8 de MLX. El resultado es un repositorio de 19,8 GB con 26.965.988.802 parámetros totales.

El modelo base Inkling-2-Mini pertenece a la familia Inkling 2 de Thinking Machines y combina procesamiento de texto e imagen con decodificación especulativa mediante DSpark, un mecanismo de borrador que acelera la generación en peticiones de chat elegibles sobre Metal. La variante aquí descrita no modifica la arquitectura ni el entrenamiento del modelo original: es una conversión de formato orientada a inferencia local en hardware Apple, con licencia Apache 2.0 heredada del upstream.

Su relevancia es acotada pero específica: permite ejecutar un modelo multimodal de ~27B parámetros en Macs con memoria unificada suficiente, usando un layout de checkpoint nativo de mere.run que no está soportado por los runtimes convencionales (llama.cpp, vLLM, TGI). Es, por tanto, un artefacto de despliegue para un ecosistema concreto más que un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) con expertos en precisión mixta NVFP4/MXFP8 y decodificación especulativa DSpark; detalles completos de la arquitectura del base no disponibles |
| Parametros totales | 26.965.988.802 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cabeza de salida en Q8 afín de MLX (group-size 64); expertos en NVFP4/MXFP8 heredados del modelo base; pesos de visión y resto de componentes sin recuantizar según la model card |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con política de uso aceptable de Thinking Machines vinculada) |
| Formato de pesos | safetensors con layout nativo de mere.run para Inkling 2 Q8; requiere build de mere.run con soporte de cabeza Q8 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de los rasgos inferibles del checkpoint: un transformer multimodal con torre de visión (se incluyen pesos de visión y procesador de imágenes), expertos almacenados en formatos de baja precisión NVFP4 y MXFP8, y un módulo de decodificación especulativa denominado DSpark que actúa como borrador oficial. La presencia de expertos en precisión mixta sugiere una arquitectura de mezcla de expertos (MoE), aunque el número de parámetros activos no se especifica en la documentación proporcionada.

No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset, fases de RLHF o DPO, ni innovaciones adicionales más allá de DSpark. La modificación introducida por Sawfwair es puramente de inferencia: reemplaza la cabeza de salida BF16 por una proyección Q8 afín de MLX con group-size 64, precalcula las proyecciones de salida de DSpark y comparte la proyección de vocabulario empaquetada entre el modelo objetivo y el borrador. El archivo `mtp.safetensors` se mantiene idéntico al del upstream en la revisión `ed40e7da`.

## Capacidades

- Generación de texto conversacional multi-turno mediante la plantilla de chat incluida.
- Procesamiento de imágenes: la model card documenta el flag `--image` para chat con imágenes, con pesos de visión y procesador de imágenes empaquetados.
- Decodificación especulativa adaptativa con DSpark activada por defecto en peticiones de chat elegibles sobre Metal, lo que reduce la latencia de generación.
- Estadísticas de inferencia disponibles en el runtime mediante `--stats`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Chat multimodal local en Mac: ejecutar conversaciones con imagen y texto usando `mere.run text chat --model ./inkling2-mini-q8-head --image ./photo.png`, aprovechando que el checkpoint incluye torre de visión y procesador de imágenes en un único repositorio sin dependencias externas.
- Asistente de escritorio sin conexión: desplegar el modelo en un Mac con memoria unificada suficiente para tareas de redacción, resumen y pregunta-respuesta sobre documentos, evitando costes de API y manteniendo los datos en local.
- Prototipado de aplicaciones sobre mere.run: usar el checkpoint como referencia canónica del layout Q8 de Inkling 2 para validar integraciones del runtime, ya que el autor lo describe como checkpoint autocontenido con proyecciones DSpark precalculadas.
- Evaluación de decodificación especulativa: comparar latencia con y sin DSpark en peticiones de chat sobre Metal usando `--stats`, útil para investigar el impacto del borrador en throughput real.
- Análisis de imágenes en flujos de investigación: descripción de figuras, extracción de información de capturas o clasificación visual asistida en entornos donde no se permite enviar imágenes a servicios cloud.
- Reproducibilidad de experimentos: al conservar tokenizer, plantilla de chat y pesos originales de la revisión `6e7c8248`, sirve para replicar resultados del modelo base en hardware Apple sin depender de conversiones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 19,8 GB en disco; la inferencia requiere al menos esa cantidad más overhead de activaciones y caché KV. Se recomienda un mínimo de 32 GB de memoria unificada y, para contextos largos o imágenes de alta resolución, 64 GB o más.
- GPU recomendadas: exclusivamente Apple Silicon (M1/M2/M3/M4 en variantes Pro, Max o Ultra) por el uso de MLX y Metal. No hay soporte documentado para A100, H100 ni RTX 4090 en este checkpoint.
- Cabe en GPU de consumo: sí, en Macs con memoria unificada suficiente; no está pensado para GPUs NVIDIA de consumo.
- Opciones de despliegue: únicamente mere.run con soporte de cabeza Q8, según la model card. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La activación por defecto de DSpark en peticiones de chat elegibles sobre Metal sugiere una optimización de latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Runtime |
|---|---|---|---|---|---|
| Inkling-2-Mini-Q8-Head | 26.965.988.802 | no disponible | Sí (texto + imagen) | Apache 2.0 | mere.run / MLX |
| thinkingmachines/Inkling-2-Mini (base) | no disponible en esta ficha | no disponible | Sí (texto + imagen) | Apache 2.0 | Según upstream |
| Alternativas de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con modelos de la misma categoría; los datos de benchmarks y de parámetros activos del base no están publicados en la documentación consultada.

## Limitaciones y advertencias

- Dependencia estricta de mere.run: el layout Q8 de la cabeza y las proyecciones DSpark precalculadas no son compatibles con runtimes estándar; usar otra herramienta requerirá reconvertir los pesos.
- Plataforma limitada a Apple Silicon: MLX y Metal excluyen el despliegue en GPUs NVIDIA o AMD, lo que restringe su uso en servidores convencionales.
- Sin datos de benchmarks ni de parámetros activos: no es posible estimar calidad, velocidad ni coste computacional real a partir de la información publicada.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento aceptable fuera de los idiomas cubiertos por el modelo base, que tampoco se detallan.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad para esta variante.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base de Thinking Machines.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el upstream vincula la política de uso aceptable de Thinking Machines, que debe revisarse antes de desplegar en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria sobre la corrección de la conversión.
- Fecha de creación futura (2026-11-21) en los metadatos de Hugging Face: conviene verificar la integridad y procedencia del checkpoint antes de confiar en él.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/Sawfwair/Inkling-2-Mini-Q8-Head
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revisión de pesos originales: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/6e7c8248f75265bdd4fbab5273304243b5d8c2cb
- Revisión de `mtp.safetensors`: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/ed40e7da625f594fc9c4990f5f66be24873c22d7
- Política de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
