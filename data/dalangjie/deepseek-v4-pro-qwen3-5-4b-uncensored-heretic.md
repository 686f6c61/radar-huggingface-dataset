# dalangjie/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es una variante "decensored" (abliterada) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, un ajuste fino orientado a razonamiento sobre la base Qwen3.5-4B, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect". El modelo lo publica el usuario dalangjie en Hugging Face y aplica la herramienta Heretic v2.0.0 para eliminar los comportamientos de rechazo mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 16 a 32.

El objetivo es doble: por un lado, conservar el pipeline de entrenamiento del modelo base (una mezcla de aproximadamente 250.000 muestras de matemáticas y STEM, con SFT y evaluación en MTP-Q8) y, por otro, reducir drásticamente la tasa de negativas del modelo original, que pasa de 99/100 rechazos a 5/100, con una divergencia KL de 0,0378 respecto al modelo de partida. Es relevante para quienes necesitan un modelo pequeño (4.539 millones de parámetros) que razone de forma estructurada y no bloquee consultas legítimas en dominios técnicos o creativos.

La arquitectura es de tipo transformer, con licencia Apache 2.0, pesos en safetensors y soporte declarado para inglés, chino, coreano, japonés, español y ruso. El repositorio ocupa 9,3 GB y está pensado para despliegues compactos donde un modelo de 4B con capacidades de razonamiento resulta más práctico que alternativas de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B, ajuste fino con destilación) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el autor menciona evaluación en MTP-Q8) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, una arquitectura transformer densa de aproximadamente 4.500 millones de parámetros. Sobre esa base, Jackrong aplicó un proceso de destilación a partir de respuestas de DeepSeek-V4-Pro en modo "Max Effect", con un pipeline de SFT sobre una mezcla de unas 250.000 muestras centradas en matemáticas y STEM. El autor del modelo base declara también el uso de MTP (multi-token prediction) en la evaluación, lo que sugiere que el pipeline incorpora esa técnica para acelerar la decodificación o mejorar la calidad de las secuencias generadas.

La innovación principal de esta variante concreta es la aplicación de Heretic v2.0.0, que realiza una ablación de rangos arbitrarios sobre las capas 16 a 32 con unos pesos concretos: `preserve_good_behavior_weight` de 0,9854, `steer_bad_behavior_weight` de 0,0002, `overcorrect_relative_weight` de 0,6587 y `neighbor_count` de 10. Esta intervención modifica las direcciones de activación asociadas a los rechazos sin reentrenar el modelo, lo que explica la bajada de rechazos de 99/100 a 5/100 y una divergencia KL de 0,0378. No se detalla en la información disponible si hubo RLHF o DPO adicionales sobre el modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, con patrones de descomposición explícita de problemas aprendidos por destilación.
- Razonamiento matemático y científico (STEM), reforzado por las aproximadamente 250.000 muestras de entrenamiento.
- Capacidades multimodales de entrada imagen-texto: la etiqueta `image-text-to-text` indica soporte para procesar imágenes junto con texto.
- Soporte multilingüe declarado en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento explícito (etiqueta `reasoning`), orientado a cadenas de pensamiento estructuradas.
- Comportamiento "uncensored"/abliterado: reduce las negativas a peticiones legítimas, manteniendo según el autor un 98,54 % de peso en la preservación del comportamiento bueno.
- No se confirma en la información disponible soporte explícito de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Tutoría de matemáticas y ciencias: el modelo puede descomponer problemas de cálculo, física o química paso a paso, aprovechando el entrenamiento en unas 250.000 muestras STEM para explicar el razonamiento y no solo la respuesta final.
- Asistencia a investigación técnica: para redactar y revisar borradores de artículos o notas de laboratorio donde se necesita un modelo que no bloquee preguntas sobre temas sensibles de biología, química o seguridad, gracias a la reducción de rechazos a 5/100.
- Generación de código y scripts científicos: útil en pipelines de análisis de datos o prototipado de experimentos computacionales, aunque sin garantía documentada de tool calling.
- Procesamiento de documentación con imágenes: al aceptar entrada imagen-texto, puede emplearse para extraer y razonar sobre figuras, gráficos o tablas escaneadas en informes técnicos.
- Atención al cliente multilingüe: con soporte para seis idiomas (en, zh, ko, ja, es, ru), puede gestionar conversaciones en mercados asiáticos y europeos desde un único despliegue de 4B.
- Despliegue en entornos con recursos limitados: al ser un modelo de 4,5B parámetros, cabe en GPUs de consumo y permite inferencia local para prototipos, demos o entornos de desarrollo sin depender de infraestructura en la nube.
- Generación creativa sin restricciones excesivas: escritura de ficción, guiones o contenido divulgativo donde el modelo original rechazaría escenarios oscuros o controvertidos, manteniendo coherencia narrativa.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) |
|---|---|---|
| Rechazos (refusals) | 5/100 | 99/100 |
| Divergencia KL | 0,0378 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos cuantitativos son las métricas de ablación de Heretic y la evaluación en MTP-Q8 mencionada en la model card, sin cifras asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, los 4.539 millones de parámetros ocupan aproximadamente 9,1 GB solo en pesos, por lo que se necesitan alrededor de 10-12 GB de VRAM con overhead. En cuantización de 8 bits, unos 5-6 GB; en 4 bits, unos 3-4 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegues de producción en FP16; RTX 4090 (24 GB) para FP16 con margen amplio o para servir varias instancias en cuantización.
- GPU de consumo: cabe en RTX 4090, RTX 4080, RTX 3090 y, en cuantización de 4 bits, en GPUs con 8 GB de VRAM como la RTX 3070 o la RTX 4060.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`), y por compatibilidad con safetensors, también vLLM, llama.cpp u Ollama mediante conversión a GGUF (no confirmado explícitamente en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4,54B | No disponible | 5/100 | Apache 2.0 | Hugging Face (dalangjie) |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B (original) | 4,54B | No disponible | 99/100 | Apache 2.0 | Hugging Face (Jackrong) |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9B | No disponible | No disponible | No disponible | Hugging Face (xtools-at) |
| xtools-at/Qwen3.5-4B-DeepThought-STEM | ~4B | No disponible | No disponible | No disponible | Hugging Face (xtools-at) |

La comparativa se limita a variantes del mismo linaje, ya que no se dispone de datos de benchmarks frente a modelos de otros fabricantes. La versión de 9B ofrece presumiblemente mayor capacidad de razonamiento a costa de duplicar los requisitos de VRAM, mientras que DeepThought-STEM es un ajuste fino científico derivado de este mismo modelo.

## Limitaciones y advertencias

- La ablación elimina los rechazos pero no garantiza la supresión de contenido dañino: el modelo puede generar respuestas inapropiadas, ofensivas o peligrosas en dominios sensibles, lo que exige filtros externos en producción.
- Riesgo de alucinación inherente a un modelo de 4B destilado: puede inventar datos, referencias o pasos de razonamiento, especialmente en problemas STEM de alta complejidad.
- La divergencia KL de 0,0378 indica un cambio medible en la distribución de salida respecto al original; puede degradar ligeramente tareas donde el alineamiento del modelo base era relevante.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el carácter "uncensored" traslada al desplegador la responsabilidad legal y ética sobre el contenido generado.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria ni reportes de uso en producción.
- No se confirma soporte de tool calling ni de agentes, lo que limita su integración en pipelines automatizados complejos.
- El rendimiento multilingüe está declarado pero no cuantificado; el español figura entre los idiomas soportados sin datos de evaluación específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dalangjie/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Versión de 9B uncensored: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Ajuste fino científico DeepThought-STEM: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Proyecto Heretic: https://heretic-project.org
