# eliunited/pplx-decider-flash-v1.3-mlx-4bit

## Resumen

`eliunited/pplx-decider-flash-v1.3-mlx-4bit` es una conversión a 4 bits en formato MLX del modelo `perplexity-ai/pplx-decider-flash-v1.3`, publicada por el usuario eliunited. Se trata, por tanto, de un artefacto de cuantización derivado y no de un modelo entrenado desde cero: su interés radica en permitir la ejecución del modelo base de Perplexity AI en hardware Apple Silicon mediante el framework MLX, con un peso total de aproximadamente 3,6 GB en disco.

El modelo cuenta con 4.205.751.296 parámetros según los safetensors del repositorio, lo que lo sitúa en la franja de los 4B. La arquitectura declarada en los metadatos es `qwen3_5`, lo que sugiere que el modelo base de Perplexity se apoya en la familia Qwen 3.5, aunque la model card no aporta detalles adicionales sobre la arquitectura interna, el contexto o el entrenamiento.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa práctica para desplegar el modelo en Macs con memoria unificada; por otro, evidencia la escasez de información pública sobre el modelo base, cuya model card original no está incluida en la información proporcionada. La licencia Apache 2.0 facilita el uso comercial, pero conviene verificar las condiciones del modelo original antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según metadatos; detalles no disponibles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); el modelo base admite otras cuantizaciones no documentadas aquí |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura interna del modelo base. Los metadatos del repositorio indican la etiqueta `qwen3_5`, lo que apunta a una arquitectura transformer de la familia Qwen 3.5, pero no se especifica si emplea atención lineal, mezcla de expertos, decodificación especulativa u otras innovaciones. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Lo único verificable es el proceso de cuantización: una conversión a 4 bits con MLX a partir del commit `d06fb3f2d97e0a52325a0d463c450cf0338f44fe` del repositorio `perplexity-ai/pplx-decider-flash-v1.3`. La cuantización a 4 bits reduce el peso a 3,6 GB, lo que implica una pérdida de precisión respecto al modelo original que no está cuantificada en la documentación.

## Capacidades

- Generación de texto y razonamiento: capacidades inferidas del modelo base, no verificadas en esta conversión.
- Código y matemáticas: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución en Apple Silicon mediante MLX: capacidad confirmada por la librería declarada.

## Casos de uso

- Prototipado local en Mac: la conversión MLX permite ejecutar el modelo en un Mac con memoria unificada sin GPU dedicada, útil para pruebas de concepto y desarrollo de aplicaciones antes de desplegar en infraestructura mayor.
- Asistentes de escritorio offline: con 3,6 GB en disco y 4 bits, el modelo puede integrarse en aplicaciones de escritorio que requieran inferencia local sin conexión, siempre que el contexto y las capacidades del modelo base sean suficientes para la tarea.
- Evaluación comparativa de cuantizaciones: sirve para medir la degradación de calidad frente al modelo base en tareas concretas del equipo, ya que permite ejecutar ambas versiones en el mismo hardware Apple.
- Generación de texto en pipelines de bajo consumo: para tareas de resumen, clasificación o redacción donde el throughput no sea crítico y se prefiera evitar costes de API.
- Investigación sobre cuantización: útil para estudiar el impacto de 4 bits MLX en modelos de ~4B, comparando perplejidad y calidad de salida con el original.
- Desarrollo de agentes locales con tool calling: solo si el modelo base lo soporta; la conversión no documenta esta capacidad, por lo que requiere validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 3,6 GB para los pesos en 4 bits, más overhead de activaciones y caché KV; se recomienda al menos 8 GB de memoria unificada para contexto moderado.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el uso de MLX; no aplica a GPU NVIDIA en este formato.
- Cabe en consumer GPU: sí, en Macs con memoria unificada de 8 GB o superior; en GPU NVIDIA requeriría conversión a otro formato (GGUF, AWQ, etc.).
- Opciones de despliegue: MLX y `mlx-lm` en macOS; para otros entornos sería necesario reconvertir el modelo base a GGUF (llama.cpp, Ollama) o a formatos compatibles con vLLM/TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-flash-v1.3-mlx-4bit | 4,2B | no disponible | Apache 2.0 | safetensors MLX | Hugging Face |
| perplexity-ai/pplx-decider-flash-v1.3 (base) | 4,2B (presumiblemente) | no disponible | no disponible en esta ficha | no disponible | Hugging Face |
| Qwen 3.5 de 4B (referencia de familia) | ~4B | no disponible | no disponible en esta ficha | múltiples | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card del repositorio es mínima: no documenta contexto, idiomas, capacidades ni datos de entrenamiento.
- Al ser una cuantización a 4 bits, existe degradación de calidad respecto al modelo base no cuantificada; conviene validar en tareas específicas.
- El formato MLX limita el despliegue a macOS con Apple Silicon; no es directamente portable a CUDA.
- Riesgo de alucinación y sesgos: no documentados para el modelo base en la información disponible; deben evaluarse empíricamente.
- Aunque la licencia declarada es Apache 2.0, debe verificarse la licencia del modelo base `perplexity-ai/pplx-decider-flash-v1.3` antes de uso comercial.
- El repositorio no tiene descargas ni likes, lo que reduce la evidencia de validación por la comunidad.
- No se garantiza compatibilidad con versiones futuras de MLX ni con el commit exacto del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eliunited/pplx-decider-flash-v1.3-mlx-4bit
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.3
- Commit del modelo base: `d06fb3f2d97e0a52325a0d463c450cf0338f44fe`
- Framework MLX: https://github.com/ml-explore/mlx
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
