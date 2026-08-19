# joey00072/ohara-moe-base-d12

## Resumen

El modelo **ohara-moe-base-d12** es un modelo de lenguaje de tipo *mixture-of-experts* (MoE) desarrollado por joey00072 como parte del framework de entrenamiento [ohara](https://github.com/joey00072/ohara). Se trata de un modelo base preentrenado desde cero, diseñado para servir como punto de partida para fine-tuning, y no como un chatbot listo para usar. Con 332 millones de parámetros totales y solo 85 millones activos por token, ofrece una esparsidad de 3,9x, lo que permite un coste computacional por token equivalente al de un modelo denso de aproximadamente 85M de parámetros, pero con mayor capacidad de representación.

El modelo fue entrenado sobre 1,48 mil millones de tokens del dataset [nvidia/ClimbMix](https://huggingface.co/datasets/nvidia/ClimbMix) en dos GPUs A100-80GB durante 2,35 horas. Su arquitectura MoE con 8 expertos por capa y enrutamiento top-2, junto con un mecanismo de *quantile balancing* (sin pérdida auxiliar), le permite alcanzar una ventaja consistente de ~1,9% en bits/byte frente a un modelo denso de igual coste computacional. Es relevante ahora porque demuestra que los modelos MoE pequeños pueden superar a sus equivalentes densos con el mismo presupuesto de FLOPs, y porque su licencia MIT facilita su uso en investigación y experimentación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, 12 capas, 8 expertos por capa, top-2, sin experto compartido, FFN SwiGLU de ancho 1024 |
| Parametros totales | 332.163.936 (332M) |
| Parametros activos | 85M por token |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32/fp16 según el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer estándar con capas de atención multi-cabeza (6 cabezas, dimensión oculta 768) y bloques de feed-forward sustituidos por capas MoE. Cada capa contiene 8 expertos, cada uno con una FFN SwiGLU de ancho 1024 (dimensiones up/gate/down de 1024×768, 1024×768 y 768×1024 respectivamente). El enrutamiento es top-2, es decir, solo dos expertos se activan por token, y no hay experto compartido (a diferencia de DeepSeek). El coste de dos expertos activos equivale exactamente a una FFN densa de ancho 1024, lo que garantiza que el coste por token sea idéntico al de un modelo denso de 85M de parámetros.

El entrenamiento se realizó desde cero sobre 1,48B tokens de ClimbMix, un dataset multilingüe de alta calidad (aunque el modelo solo declara soporte para inglés). Se utilizó un esquema de *quantile balancing* (propuesto por Jianlin Su y usado en Kimi K2/K3) para el equilibrio de carga entre expertos: el sesgo del router se resuelve en forma cerrada en cada paso del optimizador a partir de estadísticas del batch, sin pérdida auxiliar ni coeficientes que ajustar. Los 12 routers convergieron con un MaxVio de ~0,03. Además, se reservaron 8 tokens especiales de conversación en el vocabulario (50.304 tokens) que no se vieron durante el preentrenamiento, de modo que un fine-tuning posterior pueda usarlos sin redimensionar la capa de embeddings.

## Capacidades

- Generación de texto autoregresiva: el modelo continúa secuencias de texto de forma fluida, aunque al ser un modelo base no sigue instrucciones ni mantiene diálogos.
- Razonamiento básico: al ser un modelo pequeño entrenado con pocos tokens, su capacidad de razonamiento es limitada, pero puede capturar patrones estadísticos del lenguaje.
- Soporte de fine-tuning: al ser un modelo base, está diseñado para ser adaptado mediante SFT (supervised fine-tuning) u otras técnicas. El framework ohara incluye scripts para ello.
- Capacidades multilingües: solo inglés declarado, aunque el dataset ClimbMix es multilingüe; no se garantiza rendimiento en otros idiomas.
- No soporta tool calling, ni agentes, ni visión, ni audio. Es un modelo puramente textual.

## Casos de uso

- Fine-tuning para clasificación de texto: al ser un modelo base compacto, puede adaptarse a tareas de análisis de sentimiento, detección de spam o categorización de documentos con un coste de entrenamiento reducido.
- Investigación en eficiencia de modelos MoE: su arquitectura con *quantile balancing* y top-2 routing lo convierte en un banco de pruebas ideal para estudiar el comportamiento de los MoE a pequeña escala.
- Prototipado de chatbots especializados: tras un fine-tuning con datos conversacionales, puede servir como base para un asistente de dominio específico (por ejemplo, atención al cliente en inglés) en entornos con recursos limitados.
- Generación de texto para aumentación de datos: puede usarse para sintetizar ejemplos de entrenamiento en pipelines de generación de datos sintéticos, siempre que se valide la calidad.
- Educación y experimentación: su licencia MIT y su pequeño tamaño permiten usarlo en cursos de procesamiento de lenguaje natural para ilustrar conceptos de MoE, esparsidad y entrenamiento eficiente.
- Comparación de arquitecturas: al existir un modelo denso controlado con el mismo coste computacional, es útil para reproducir experimentos que evalúen la ventaja de los MoE frente a los densos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una comparación controlada entre el modelo MoE y un modelo denso con el mismo coste por token, mismos datos, mismo schedule, mismas tasas de aprendizaje y misma semilla. Los resultados de validación son los siguientes:

| Métrica | Denso | MoE |
| --- | --- | --- |
| Val bits/byte (step 250) | 1.1900 | 1.1703 |
| Val bits/byte (step 1000) | 1.0370 | 1.0170 |
| Val bits/byte (step 2000) | 0.9458 | 0.9280 |
| Val bits/byte (final, step 2827) | 0.9062 | 0.8887 |
| Val accuracy (final) | 43.63% | 44.37% |

El MoE mantiene una ventaja de ~1,9% en bits/byte durante todo el entrenamiento y alcanza la calidad final del denso aproximadamente 500 pasos antes. No se proporcionan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con 332M parámetros, en fp32 el modelo ocupa ~1,33 GB, en fp16 ~0,66 GB, y en int8 ~0,33 GB. Cabe en cualquier GPU con al menos 2 GB de VRAM, incluyendo GPUs integradas o incluso en CPU.
- GPUs recomendadas: cualquier GPU moderna (NVIDIA GTX 1060 6GB o superior, RTX 3060, etc.) es suficiente para inferencia. Para fine-tuning, una GPU con 8-12 GB de VRAM permite entrenar con lotes pequeños.
- Despliegue: el modelo se carga mediante la librería `ohara` (código Python) o directamente con `safetensors` y PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, pero al ser un modelo Llama-like, podría adaptarse con conversores, aunque no está verificado.
- Latencia y throughput: no disponibles. Dado su tamaño, la inferencia en GPU consumer debería ser de decenas de milisegundos por token, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos MoE de tamaño similar en la información proporcionada. La única comparación controlada es con el modelo denso equivalente (mismo coste por token, mismos datos y configuración), que se detalla en la sección de benchmarks. En términos de arquitectura, se puede mencionar que sigue la línea de modelos MoE pequeños como los de la familia `nanochat` (también de joey00072), pero no hay datos públicos de otros modelos comparables. Por tanto, la comparativa se limita al denso controlado.

## Limitaciones y advertencias

- Es un modelo base, no un chatbot: no responde preguntas, no sigue instrucciones y no detiene la generación por sí mismo. Para uso conversacional se debe fine-tuning.
- Contexto limitado: solo 2048 tokens, insuficiente para tareas que requieran ventanas largas.
- Solo inglés: aunque el dataset de entrenamiento es multilingüe, el modelo solo declara soporte para inglés; el rendimiento en otros idiomas no está garantizado.
- Entrenamiento con pocos tokens: 1,48B tokens es una cantidad pequeña en comparación con modelos modernos, lo que puede provocar lagunas de conocimiento, alucinaciones y menor coherencia en temas especializados.
- Sin evaluación de seguridad: no se han realizado evaluaciones de sesgos, toxicidad o robustez. El modelo puede generar contenido inapropiado o reflejar sesgos presentes en los datos.
- Riesgo de mal uso: al ser un modelo base, puede ser fine-tuneado para generar contenido dañino. La licencia MIT no impone restricciones de uso, pero el autor no ofrece garantías.
- Dependencia de la configuración: el archivo `config.json` incluye `moe_experts_per_tok`, que no se puede deducir de las formas de los tensores; si se pierde, el modelo cargará pero enrutará con un top-k incorrecto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/joey00072/ohara-moe-base-d12)
- [Repositorio ohara](https://github.com/joey00072/ohara)
- [Dataset ClimbMix (nvidia)](https://huggingface.co/datasets/nvidia/ClimbMix)
- [Modelo chat derivado (ohara-moe-chat-d12)](https://huggingface.co/joey00072/ohara-moe-chat-d12)
