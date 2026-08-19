# hailun-core/Qwen3.8-27B-mlx-6Bit

## Resumen

Qwen3.8-27B es un modelo multimodal denso de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba Cloud. Se trata de un modelo de última generación que combina atención lineal eficiente (estilo DeltaNet) con atención softmax completa en una proporción 3:1, lo que le permite manejar ventanas de contexto de hasta 262 144 tokens con un coste computacional reducido. Además, incorpora capacidades nativas de visión (imagen y vídeo), lo que lo convierte en una opción destacada para tareas de razonamiento multimodal, agentes y automatización de oficina.

La versión `hailun-core/Qwen3.8-27B-mlx-6Bit` es una conversión del modelo original al formato MLX, cuantizada a 6 bits, específicamente optimizada para ejecutarse en Apple Silicon mediante la librería `mlx-lm`. Esta conversión mantiene las capacidades del modelo base pero reduce significativamente los requisitos de memoria, permitiendo su ejecución en equipos Mac con 24 GB de RAM unificada. El modelo se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y su integración en proyectos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (lineal DeltaNet y softmax completa, ratio 3:1 en 64 capas) |
| Parametros totales | 27 000 millones (modelo base); el repo MLX reporta 5 885 566 464 en safetensors, posible discrepancia en metadatos |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | 6-bit (MLX) |
| Idiomas soportados | No disponible (se espera multilingüe, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura Transformer densa con una innovación clave: una combinación de atención lineal y atención completa. De las 64 capas del modelo, 48 utilizan atención lineal basada en DeltaNet, que reduce la complejidad computacional de O(n²) a O(n), mientras que las 16 restantes usan atención softmax completa para capturar dependencias de largo alcance con precisión. Esta hibridación permite manejar contextos de 262 144 tokens con un coste de memoria y cómputo significativamente menor que un Transformer estándar.

El modelo fue entrenado por Alibaba Cloud con un enfoque multimodal, incorporando datos de texto e imágenes (y posiblemente vídeo). No se han publicado detalles específicos sobre el volumen de tokens de entrenamiento ni sobre el uso de técnicas de alineación como RLHF o DPO. La versión MLX 6-bit se generó mediante la herramienta `mlx-lm` versión 0.31.2, que convierte los pesos del modelo original a un formato cuantizado de 6 bits optimizado para la aceleración por hardware de Apple.

## Capacidades

- Generación de texto y razonamiento complejo, con especial habilidad en tareas de codificación y agentes autónomos.
- Comprensión multimodal: procesa imágenes y vídeo como entrada, además de texto, lo que permite tareas de visión por computador y razonamiento visual.
- Soporte de tool calling y function calling, lo que facilita la integración con APIs y herramientas externas.
- Capacidad para ejecutar flujos de trabajo agénticos multi-paso, con planificación y ejecución de acciones.
- Automatización de oficina: puede generar documentos, resumir contenido, extraer información de tablas y gestionar tareas administrativas.
- Multilingüismo: aunque no se especifican los idiomas exactos, el modelo base de Qwen suele soportar múltiples lenguas, incluyendo español, inglés, chino, etc.
- Ventana de contexto extendida de 262 144 tokens, adecuada para documentos largos, conversaciones extensas o análisis de código de gran tamaño.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede generar código, explicar fragmentos, detectar errores y sugerir refactorizaciones. Su soporte de tool calling permite conectarlo a sistemas de integración continua (CI/CD) para revisión automática de pull requests.
- Automatización de tareas de oficina: procesamiento de documentos, generación de informes, extracción de datos de facturas o formularios, y redacción de correos electrónicos. La ventana de 262K tokens permite manejar documentos extensos sin truncamiento.
- Agente de atención al cliente multimodal: puede analizar capturas de pantalla o vídeos enviados por usuarios, comprender el problema y ofrecer soluciones paso a paso, manteniendo conversaciones de largo recorrido gracias al contexto amplio.
- Análisis de vídeo para seguridad o monitorización: el modelo puede procesar secuencias de vídeo y generar descripciones, detectar anomalías o responder preguntas sobre el contenido visual.
- Asistente de investigación académica: lectura y resumen de artículos científicos, extracción de conclusiones, y generación de revisiones bibliográficas. Su capacidad de razonamiento matemático y lógico es útil para verificar resultados.
- Desarrollo de agentes autónomos para navegación web: el modelo puede interpretar páginas web (incluyendo capturas), tomar decisiones y ejecutar acciones mediante tool calling, lo que lo hace adecuado para automatización de procesos como reservas, compras o gestión de cuentas.

## Benchmarks y rendimiento

Según la información publicada en el blog de lovableapp.org, el modelo base Qwen3.8-27B obtiene los siguientes resultados en benchmarks específicos:

| Benchmark | Resultado |
|---|---|
| DeepSWE (software engineering) | 42.2 |
| Terminal Bench (tareas de terminal) | 73.0 |
| OSWorld (interacción con sistemas operativos) | 84.3 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Estos datos corresponden al modelo original sin cuantizar; la versión MLX 6-bit puede presentar ligeras variaciones en el rendimiento debido a la cuantización, aunque en general las pérdidas son mínimas para tareas de razonamiento.

## Requisitos de hardware

- La versión MLX 6-bit está diseñada para Apple Silicon (M1, M2, M3, M4 y posteriores). Se recomienda un mínimo de 24 GB de RAM unificada para una ejecución fluida, según el blog de modelfit.io.
- Con 24 GB de RAM unificada, el modelo cabe en un MacBook Pro o Mac Studio de gama media-alta. Para contextos muy largos (cercanos a 262K tokens), se recomienda 32 GB o más.
- No es compatible con GPUs NVIDIA de forma directa en este formato; para usar en GPUs NVIDIA habría que convertir los pesos a otro formato (por ejemplo, GGUF o FP16).
- Opciones de despliegue: mediante `mlx-lm` en Python, o a través de Ollama con el comando `ollama run qwen3.8:27b` (aunque esa versión puede ser diferente). También se puede usar con `mlx-lm` para generación de texto y visión.
- La latencia y el throughput dependen del hardware concreto. En un MacBook Pro M3 Max con 36 GB, se pueden esperar velocidades de generación de entre 20 y 40 tokens por segundo en modo 6-bit, aunque estos valores son estimaciones basadas en modelos similares.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (MLX 6-bit) | 27B | 262K | Sí | Apache-2.0 | MLX |
| Qwen2.5-VL-27B (FP16) | 27B | 128K | Sí | Apache-2.0 | Transformers |
| Llama 3.1 8B (GGUF) | 8B | 128K | No | Llama 3.1 | GGUF |
| Mistral Small 3.1 24B | 24B | 128K | No | Apache-2.0 | Transformers |

La comparativa muestra que Qwen3.8-27B ofrece una ventana de contexto superior (262K) y capacidades de visión, algo que no tienen los modelos Llama o Mistral de tamaño similar. Su licencia Apache-2.0 es más permisiva que la de Llama. En cuanto a rendimiento, los benchmarks publicados (DeepSWE, Terminal Bench, OSWorld) indican un fuerte desempeño en tareas de agente y automatización, aunque no se dispone de comparaciones directas con otros modelos en esos mismos benchmarks.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o alucinaciones específicos del modelo. Como todo modelo de lenguaje grande, puede generar información falsa o inventada, especialmente en dominios poco representados en sus datos de entrenamiento.
- La cuantización a 6 bits puede introducir una ligera degradación en tareas de precisión numérica o razonamiento matemático complejo, aunque en la práctica suele ser mínima.
- El modelo está optimizado para Apple Silicon; su uso en otras plataformas requiere conversión a otros formatos, lo que puede implicar pérdida de rendimiento o incompatibilidad con ciertas herramientas.
- La ventana de contexto de 262K tokens es teórica; en la práctica, el uso de contextos muy largos puede aumentar el consumo de memoria y reducir la velocidad de inferencia, incluso en hardware de gama alta.
- No se especifican los idiomas soportados oficialmente. Aunque Qwen suele ser multilingüe, el rendimiento en idiomas minoritarios puede ser inferior al de inglés o chino.
- La licencia Apache-2.0 permite uso comercial, pero es recomendable revisar los términos del modelo base en el repositorio oficial de Qwen para asegurarse de que no hay restricciones adicionales.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/hailun-core/Qwen3.8-27B-mlx-6Bit
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía para ejecutar Qwen3.8-27B localmente (24GB Mac y GPU): https://modelfit.io/blog/run-qwen38-27b-locally-2026/
- Guía completa de Qwen3.8-27B (2026): https://lovableapp.org/blog/qwen3-8-27b
- Conversión MLX alternativa (6-bit): https://huggingface.co/zherebetskyy/Qwen3.8-27B-6bit-mlx
