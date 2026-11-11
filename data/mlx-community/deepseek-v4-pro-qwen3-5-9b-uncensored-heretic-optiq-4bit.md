# mlx-community/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-OptiQ-4bit

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-OptiQ-4bit es una cuantización de precisión mixta del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, publicada por la comunidad mlx-community. El modelo base es una destilación de razonamiento de DeepSeek-V4-Pro sobre la arquitectura Qwen3.5-9B, con una variante "heretic" que elimina los mecanismos de rechazo y censura del modelo original. Esta versión concreta aplica el método OptiQ de cuantización por capas (4 y 8 bits) para ejecutarse de forma nativa en Apple Silicon mediante MLX.

La relevancia de esta ficha radica en que combina tres elementos poco habituales en un mismo artefacto: capacidades de razonamiento por destilación, entrada multimodal de imagen y texto, y una cabeza de especulación MTP (multi-token prediction) preservada tras la cuantización. El resultado es un modelo de 8.953.801.728 parámetros (unos 8,95 mil millones) que ocupa 7,7 GB en disco y está pensado para inferencia local en equipos con chip de Apple, sin depender de PyTorch ni de servicios en la nube.

El modelo se distribuye con licencia Apache 2.0 y soporta seis idiomas declarados (inglés, chino, coreano, japonés, español y ruso). Su pipeline es image-text-to-text, lo que lo sitúa en la categoría de modelos visión-lenguaje con razonamiento y soporte de tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con torre de visión y cabeza de especulación MTP |
| Parametros totales | 8.953.801.728 (aproximadamente 8,95 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | OptiQ mixed-precision: 4 y 8 bits por capa (116 componentes a 4 bits, 134 a 8 bits), group size 64 |
| Idiomas soportados | Inglés, chino, coreano, japonés, español, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con sidecars `optiq/mtp.safetensors`, `optiq_vision.safetensors` y `kv_config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.5 de 9B parámetros, adaptado como modelo visión-lenguaje: incorpora una torre de visión que en esta cuantización se conserva en bf16 dentro de `optiq_vision.safetensors` para no degradar la entrada de imagen. Sobre el modelo base se ha aplicado una destilación de razonamiento desde DeepSeek-V4-Pro, y la variante "heretic" del autor original elimina los comportamientos de rechazo aprendidos en el alineamiento. Además, el modelo incluye una cabeza de especulación MTP (multi-token prediction) que se preserva tras la cuantización en `optiq/mtp.safetensors`, lo que permite decodificación especulativa y acelera la generación.

El proceso de cuantización OptiQ reutiliza la receta de sensibilidad por capa del Qwen3.5-9B OptiQ-4bit, ya que la arquitectura es idéntica y el ranking de sensibilidad por capa se transfiere directamente sin necesidad de un barrido específico por modelo. El resultado son 116 componentes a 4 bits y 134 a 8 bits con group size 64. El autor indica que, tras la conversión, las respuestas se comprobaron contra el modelo bf16 en las mismas indicaciones (hechos, aritmética, código y explicación) y coinciden. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento propio de un modelo de razonamiento destilado.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text) gracias a la torre de visión conservada en bf16.
- Generación de código y resolución de problemas matemáticos, derivadas de la destilación de DeepSeek-V4-Pro.
- Soporte de function calling y tool use, según las etiquetas del modelo.
- Capacidades de agente y razonamiento multi-paso.
- Decodificación especulativa mediante la cabeza MTP preservada.
- Multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Variante sin censura ("heretic"/"uncensored"): no aplica rechazos aprendidos por alineamiento.
- Ejecución nativa en Apple Silicon mediante MLX.

## Casos de uso

- Asistente local de razonamiento en Mac: el modelo puede ejecutarse íntegramente en un equipo con chip de Apple usando MLX y `optiq serve`, lo que permite mantener conversaciones de razonamiento sin enviar datos a la nube. Es adecuado por su tamaño de 7,7 GB y su soporte nativo de MLX.
- Análisis de documentos con imágenes: al aceptar entrada image-text-to-text, puede extraer información de capturas, diagramas o documentos escaneados y razonar sobre ellos en una misma conversación.
- Generación de código en flujos locales: con soporte de function calling y tool use, puede integrarse en asistentes de programación que invocan herramientas locales (ejecución de tests, consultas a repositorios) sin depender de APIs externas.
- Automatización de agentes multi-paso: la cabeza MTP y el modo de razonamiento permiten cadenas de pasos con planificación y verificación, útil para tareas de investigación o extracción de datos estructurados.
- Atención al cliente multilingüe: cubre inglés, chino, coreano, japonés, español y ruso, lo que lo hace apto para prototipos de soporte en varios mercados desde un único modelo local.
- Investigación sobre alineamiento y censura: la variante "heretic" permite estudiar el comportamiento del modelo sin los rechazos del alineamiento original, útil para análisis de sesgos y robustez en entornos controlados.
- Prototipado rápido en Apple Silicon: gracias a la cuantización OptiQ y a la compatibilidad con LM Studio y mlx-lm, sirve para validar ideas de producto en local antes de escalar a infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo indica una comprobación cualitativa contra el modelo bf16 en indicaciones de hechos, aritmética, código y explicación, sin cifras numéricas.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 7,7 GB en disco; en Apple Silicon se carga en memoria unificada, por lo que se recomienda al menos 16 GB de RAM unificada para dejar margen al contexto y a la caché KV.
- GPU recomendadas: chips de Apple Silicon (series M1, M2, M3, M4 y superiores). No está pensado para GPU NVIDIA ni AMD, ya que el formato es MLX.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con memoria unificada suficiente; no es compatible con GPU de consumo NVIDIA por el formato MLX.
- Opciones de despliegue: `mlx-lm` con el paquete `mlx-optiq`, `optiq serve` (endpoint compatible con OpenAI y Anthropic), y LM Studio (con la advertencia de mover `mtp.safetensors` de vuelta a `optiq/`).
- Latencia y throughput: no disponibles. El autor recomienda un presupuesto de tokens generoso por ser un modelo de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-OptiQ-4bit | 8,95B | No disponible | Sí (visión) | Apache 2.0 | MLX (Apple Silicon) |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (base) | 9B | No disponible | Sí (visión) | Apache 2.0 | safetensors bf16 |
| Qwen3.5-9B OptiQ-4bit (mlx-community) | 9B | No disponible | No disponible | Apache 2.0 | MLX (Apple Silicon) |

La comparativa se limita a los modelos de la misma familia y receta de cuantización, ya que no se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La variante "heretic"/"uncensored" elimina los rechazos del alineamiento: puede producir contenido dañino, ofensivo o inexacto sin filtros, lo que exige salvaguardas externas en producción.
- Riesgo de alucinación inherente a los modelos de razonamiento destilados; no se han publicado evaluaciones de fidelidad factual.
- No se dispone de la longitud de contexto oficial, lo que dificulta planificar cargas con documentos largos.
- El formato es exclusivamente MLX: no es ejecutable en vLLM, TGI, llama.cpp ni Ollama sin conversión previa.
- En LM Studio, el descargador aplana la carpeta `optiq/`; si no se mueve `mtp.safetensors` de vuelta, la cabeza de especulación no se encuentra y se pierde la aceleración.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin censura requiere revisión legal y de cumplimiento propia.
- Los idiomas declarados son seis; no hay garantías de calidad fuera de ellos.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-OptiQ-4bit
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Receta de cuantización de referencia: https://huggingface.co/mlx-community/Qwen3.5-9B-OptiQ-4bit
- Web del proyecto OptiQ: https://mlx-optiq.com/
- Catálogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
- Documentación de OptiQ: https://mlx-optiq.com/docs/
