# KyleAIers/Spark-X2.5-4B

## Resumen

Spark-X2.5-4B es un modelo de lenguaje compacto de propósito general desarrollado por XHToken y redistribuido en HuggingFace por el usuario KyleAIers como fine-tune del checkpoint base Spark-X2.5-4B-Base. Se trata de un modelo denso con aproximadamente 4.100 millones de parámetros y una arquitectura transformer de atención híbrida que combina capas de atención completa con capas de atención de ventana deslizante. Ofrece una ventana de contexto nativa de hasta un millón de tokens y soporte declarado para más de 200 idiomas, lo que lo hace apto para conversación, escritura, traducción, razonamiento, generación de código, uso de herramientas y flujos de trabajo agénticos.

El modelo fue entrenado sobre unos 20 billones de tokens en un corpus diverso (web, libros, publicaciones académicas, código y materiales enciclopédicos), con especial énfasis en matemáticas, lógica y código. El post-entrenamiento incluye supervisión fina (SFT) y aprendizaje por refuerzo a gran escala, con consolidación de políticas especializadas mediante la técnica MOPD. Su tamaño compacto y su compatibilidad con frameworks como vLLM, SGLang, llama.cpp, MLX y Ollama lo convierten en una opción práctica para despliegue en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (una capa de atención completa por cada tres capas de atención de ventana deslizante) |
| Parametros totales | 4.112.079.360 (aproximadamente 4.100 millones) |
| Parametros activos | No es MoE |
| Longitud de contexto | Hasta 1.000.000 de tokens (nativo) |
| Tipos de cuantizacion | No se proporcionan cuantizaciones oficiales; el repositorio contiene únicamente pesos en formato safetensors |
| Idiomas soportados | Más de 200 idiomas (según el autor; sin lista detallada) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (8,2 GB en el repositorio) |

## Arquitectura y entrenamiento

Spark-X2.5-4B es un modelo transformer denso basado en una arquitectura de atención híbrida. Combina una capa de atención completa (full attention) con tres capas de atención de ventana deslizante (sliding-window attention, SWA). Este diseño reduce el coste computacional y el tamaño del KV-cache en secuencias largas, mientras permite mantener una ventana de contexto de hasta un millón de tokens. La relación 1:3 entre atención completa y SWA pretende equilibrar la capacidad de atender a toda la secuencia con la eficiencia de la inferencia.

El preentrenamiento se realizó sobre aproximadamente 20 billones de tokens procedentes de páginas web, libros, publicaciones académicas, código y materiales enciclopédicos. Se prestó atención a la calidad de los datos, la cobertura de dominios y los pesos de muestreo, con estudios de mezcla de datos para equilibrar matemáticas, lógica y código. El contexto largo se desarrolló en una etapa adicional de cientos de miles de millones de tokens, con secuencias extendidas hasta 1M tokens. El post-entrenamiento combina supervisión fina (SFT) sobre un corpus curado y aprendizaje por refuerzo a gran escala en dominios de comprensión del lenguaje, razonamiento, programación, comportamiento agéntico con herramientas y seguimiento de instrucciones. Las políticas especializadas resultantes se consolidan en un único modelo desplegable mediante la técnica MOPD.

## Capacidades

- Generación de texto para conversación, escritura y traducción.
- Razonamiento general, lógico y matemático, con entrenamiento reforzado en esos dominios.
- Generación de código y soporte de herramientas (tool use); integrado con agentes como Codex, Claude Code, OpenClaw y Hermes.
- Capacidades agénticas: ejecución de tareas multi-paso y flujos de trabajo que requieren llamadas a herramientas y planificación.
- Soporte de contexto largo nativo de hasta 1M tokens, útil para procesar documentos extensos y conversaciones prolongadas.
- Multilingüe: más de 200 idiomas declarados por el autor.
- Seguimiento de instrucciones complejas (instruction following), reforzado mediante RL post-entrenamiento.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones de soporte de muchos turnos aprovechando su ventana de 1M de tokens, lo que permite mantener contexto a lo largo de interacciones largas sin pérdida de información.
- Generación de código en entornos de desarrollo: su integración con Codex y Claude Code habilita la asistencia en escritura, refactorización y generación de pruebas dentro de pipelines de CI/CD, reduciendo el tiempo de revisión de código.
- Agentes autónomos y orquestación de tareas: el soporte de tool use y el comportamiento agéntico entrenado con RL permiten utilizarlo como backend de agentes que planifican, llaman a funciones y completan tareas encadenadas.
- Análisis y resumen de documentos extensos: con 1M tokens de contexto, puede procesar informes completos, artículos de investigación o libros enteros en una sola pasada, evitando la pérdida de contexto asociada al troceo de textos.
- Traducción automática multilingüe: con soporte para más de 200 idiomas, es adecuado para servicios de traducción que necesiten cubrir un espectro amplio de lenguas manteniendo coherencia y contexto.
- Chatbots y asistentes conversacionales: su tamaño compacto (4B) y su licencia Apache 2.0 permiten desplegarlo en producción con latencia baja en GPUs de consumo, ideal para productos que requieran interacción natural en tiempo real.
- Tutoría educativa de matemáticas y lógica: el entrenamiento reforzado en matemáticas y lógica lo hace útil como tutor de ejercicios, generando problemas, explicaciones paso a paso y material de práctica.
- Automatización de tareas ofimáticas: redacción de informes, correos electrónicos, resúmenes de reuniones y generación de contenido corporativo, aprovechando su capacidad de escritura y seguimiento de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona comparativas con modelos del mismo tamaño en tareas de agente, código, matemáticas y general, e incluye un gráfico comparativo en el repositorio, pero no se han proporcionado los valores numéricos en la documentación accesible.

## Requisitos de hardware

- VRAM estimada: los pesos en safetensors ocupan 8,2 GB, lo que sugiere precisión FP16. Para inferencia en FP16 se recomiendan al menos 12-16 GB de VRAM, incluyendo activaciones y KV-cache. Con cuantización a 4 bits, la huella podría reducirse a aproximadamente 4-5 GB, lo que permitiría ejecutarlo en GPUs de 8-12 GB. Estas son estimaciones orientativas basadas en el tamaño y formato de los pesos, no en datos oficiales.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para FP16 sin restricciones; RTX 3060 o RTX 4060 Ti (12 GB) con cuantización; GPUs de datacenter como A10 (24 GB) o A100 (40/80 GB) para despliegue concurrente.
- Compatibilidad declarada: el autor indica soporte para hardware de NVIDIA, Huawei, Hygon y HOUMO.AI, aunque no se especifican requisitos concretos por plataforma.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, MLX, Ollama, LM Studio, y LLaMA-Factory para fine-tuning.
- Latencia y throughput: no disponible en la documentación accesible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Spark-X2.5-4B (base XHToken) | 4.1B | 1M tokens | Apache 2.0 | HuggingFace / GitHub |
| Qwen2.5-3B | 3.1B | 32K tokens | Apache 2.0 | HuggingFace |
| Gemma-3-4B | 4.1B | 128K tokens | Licencia Gemma (uso comercial con condiciones) | HuggingFace |
| Llama-3.2-3B | 3.2B | 128K tokens | Llama Community License (con restricciones de uso masivo) | HuggingFace |

Los datos de la tabla se refieren a las especificaciones públicas de cada modelo, no a resultados de benchmarks, ya que no se dispone de mediciones comparativas publicadas en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado ningún estudio de sesgos específico para este modelo. La composición detallada del dataset no es pública, por lo que existe riesgo de sesgos heredados del corpus de preentrenamiento.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido plausible pero factualmente incorrecto, especialmente en dominios especializados sin verificación externa.
- Limitaciones de contexto e idioma: aunque la ventana declarada es de 1M tokens, el coste del KV-cache crece con la longitud, por lo que en hardware limitado el contexto máximo efectivo puede ser menor. El soporte para más de 200 idiomas es una afirmación del autor, sin lista exhaustiva ni evaluación de calidad publicada por idioma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, redistribución y modificación, siempre que se incluya la licencia original y se documenten los cambios. No se han identificado restricciones adicionales.
- Advertencia sobre el repositorio: KyleAIers/Spark-X2.5-4B es un repositorio reciente con cero descargas y cero likes, etiquetado como fine-tune del modelo base de XHToken. La documentación disponible proviene íntegramente del README de XHToken, por lo que podría no reflejar con precisión las características de este fine-tune concreto. Se recomienda verificar el rendimiento antes de un uso en producción.
- Tamaño compacto: al ser un modelo de 4B, su capacidad en tareas muy complejas o de razonamiento profundo puede ser inferior a la de modelos de escala superior.

## Enlaces

- HuggingFace: https://huggingface.co/KyleAIers/Spark-X2.5-4B
- GitHub: https://github.com/XHToken/Spark-X2.5
- Ficha en Applied: https://theapplied.co/models/xhtoken-spark-x2-5-4b
