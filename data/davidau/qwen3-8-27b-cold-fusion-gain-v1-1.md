# DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1

## Resumen

Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 es un fine-tune del modelo Qwen/Qwen3.8-27B publicado por DavidAU, un creador conocido en Hugging Face por sus adaptaciones y fusiones de modelos Qwen. El objetivo declarado del autor es aplicar una metodología propia de entrenamiento denominada COLD FUSION (combinación de una técnica llamada GAIN con los entrenadores de Unsloth) para elevar la inteligencia general del modelo base y, sobre todo, reducir drásticamente el número de tokens de razonamiento generados, hasta una décima o la mitad de lo que produce un Qwen estándar.

El modelo conserva la arquitectura y el tamaño del base: 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) almacenados en safetensors, con un repositorio de 55,6 GB. El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales heredadas del modelo base, aunque la model card no detalla la arquitectura interna ni la longitud de contexto.

La relevancia de esta publicación es doble. Por un lado, explora la reducción de tokens de pensamiento como vía para abaratar la inferencia en modelos con modo razonamiento. Por otro, sirve como paso previo a versiones más complejas del pipeline del autor (Fable Fusion 711). En el momento de la información disponible, el autor afirma que el modelo iguala o supera los siete benchmarks principales de Qwen 3.8, aunque los resultados finales aún estaban pendientes de publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.8-27B; detalles internos no disponibles) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en el repositorio hermano (q4ks citado en la model card); otros niveles no especificados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF en repositorio separado |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.8-27B en la documentación proporcionada: no se especifica si emplea atención lineal, decodificación especulativa, mezcla de expertos ni la composición exacta del dataset de preentrenamiento. Lo que sí se documenta es el proceso de ajuste fino: el autor aplica la técnica COLD FUSION, que combina un componente propio llamado GAIN con los entrenadores de Unsloth. Según la model card, este método mantiene el 99 % del rendimiento en BF16 tanto a 8 bits como a 4 bits.

El entrenamiento se describe como "muy ligero pero fuertemente enfocado", orientado a dos objetivos: incrementar la inteligencia general y reducir los tokens de pensamiento entre un factor de 2 y un factor de 10 respecto a un Qwen sin ajustar. El autor menciona que se realizaron varias iteraciones ("cooks"): la versión 1B se seleccionó como ganadora por mantener o superar el nivel de detalle de Qwen 3.8 incluso en modo de razonamiento bajo. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de pensamiento (thinking mode) configurable mediante plantilla Jinja, con niveles de esfuerzo de razonamiento (xhigh, medium, low).
- Procesamiento de imagen y texto (pipeline image-text-to-text), heredado del modelo base.
- Reducción de tokens de razonamiento: el autor reporta entre 1/10 y 1/2 de los tokens habituales de un Qwen estándar, con mantenimiento del nivel de detalle.
- Generación de código y matemáticas: no se documenta explícitamente, pero se infiere del modelo base; el autor no aporta datos específicos.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no especifica idiomas.
- Decodificación multi-token prediction (MTP): citada en el contexto de rendimiento (91 T/s en una RTX 5090 con cuantización q4ks y 55,7 % de aceptación de tokens MTP).

## Casos de uso

- Asistentes conversacionales con razonamiento acotado: el modelo permite ajustar el esfuerzo de razonamiento (xhigh, medium, low) mediante la plantilla Jinja, lo que facilita equilibrar calidad y coste por consulta en entornos de atención al cliente o chat interno.
- Aplicaciones con presupuesto de latencia estricto: al reducir los tokens de pensamiento entre 2 y 10 veces, encaja en escenarios donde un Qwen estándar generaría demasiados tokens de razonamiento antes de responder, como clasificación de tickets o resúmenes en tiempo real.
- Procesamiento de documentos con imagen y texto: al declarar pipeline image-text-to-text, puede emplearse para extraer información de capturas, formularios escaneados o diagramas combinados con instrucciones textuales.
- Despliegue en hardware de consumo: con cuantización GGUF q4ks y decodificación MTP, el autor reporta 91 T/s en una RTX 5090, lo que lo hace viable para prototipos locales y estaciones de trabajo con una sola GPU.
- Generación de código asistida en IDE: aunque no se documenta explícitamente el rendimiento en código, el tamaño de 27B y la licencia Apache 2.0 permiten integrarlo en asistentes de programación autoalojados sin restricciones comerciales.
- Investigación sobre eficiencia de razonamiento: sirve como caso de estudio para medir el impacto de reducir tokens de pensamiento en la calidad de respuesta, comparándolo con el Qwen3.8-27B sin ajustar.
- Base para pipelines de fine-tune posteriores: el autor lo presenta como preparación para las versiones Fable Fusion 711, por lo que es útil como punto de partida para experimentos de ajuste con Unsloth.

## Benchmarks y rendimiento

El autor afirma que la versión "Cook 1" superó los siete benchmarks principales de Qwen 3.8, pero no publica la tabla de resultados en la información disponible. Los resultados finales de la versión 1B estaban pendientes en el momento de la última actualización de la model card.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Resto de benchmarks Qwen 3.8 | no disponible (el autor indica que se publicarán) |

Datos de rendimiento de inferencia citados por el autor:

| Metrica | Valor |
|---|---|
| Throughput en RTX 5090 (q4ks, sin imatrix, sin caché) | 91 T/s |
| Aceptación de tokens MTP | 55,7 % |
| Récord reportado | 100 T/s con 59,9 % de aceptación MTP |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para 27,8B parámetros, una estimación orientativa sería de aproximadamente 56 GB en BF16, 28 GB en 8 bits y 14-16 GB en 4 bits, aunque el autor no publica cifras de VRAM.
- GPU recomendadas: el autor cita una RTX 5090 para las pruebas de throughput con cuantización q4ks. No se mencionan A100, H100 ni otras GPU de datacenter.
- Viabilidad en GPU de consumo: sí, según las pruebas del autor en una RTX 5090 con cuantización de 4 bits. Para GPUs con 24 GB o menos, sería necesario recurrir a cuantizaciones más agresivas o a offloading.
- Opciones de despliegue: transformers (librería declarada), llama.cpp y Ollama mediante los GGUF del repositorio hermano; vLLM y TGI no se mencionan.
- Latencia y throughput: 91 T/s en RTX 5090 con q4ks y MTP, con un 55,7 % de aceptación de tokens especulativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 | 27,8B | no disponible | Apache 2.0 | Fine-tune con reducción de tokens de razonamiento |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | no disponible en la información | Modelo original sin ajuste; referencia de comparación del autor |
| Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic (DavidAU) | 27B | no disponible | no disponible | Pipeline más complejo (6 etapas); más de 2.300 likes y 4 millones de descargas según el autor |
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF (DavidAU) | 27B | no disponible | no disponible | Variante orientada a código y razonamiento con reducción de tokens de 1/2 a 1/20 |

No se dispone de datos de benchmarks comparativos verificables en la información proporcionada.

## Limitaciones y advertencias

- La model card está en estado de desarrollo: el autor indica que hay iteraciones en curso y que los benchmarks finales aún no se han publicado. Los resultados citados son preliminares y no verificados de forma independiente.
- Riesgo de alucinación: no evaluado en la información disponible; es un aspecto crítico en modelos con modo de razonamiento y no hay datos al respecto.
- Idiomas soportados: no especificados, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas distintos del inglés.
- Sesgos: no documentados por el autor. Al ser un fine-tune de Qwen, hereda los sesgos del modelo base, que tampoco se detallan.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre el cumplimiento de las condiciones del modelo base.
- Reducción de tokens de pensamiento: el propio autor señala que puede requerir ajustes adicionales para mantener el nivel de detalle en la salida, por lo que la calidad puede degradarse en tareas que exigen razonamiento profundo.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar su uso en aplicaciones con ventanas largas.
- Madurez: el modelo se presenta como preparación para versiones posteriores (Fable Fusion 711), no como un producto final estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Repositorio GGUF y model card detallada: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Referencia de la técnica COLD FUSION (Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0): https://huggingface.co/DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0
- Referencia de la técnica COLD FUSION (Qwen3.5-9B-Cold-Fusion-GAIN-v1.0-Uncensored-Heretic-NEO-MAX-Imatrix-GGUF): https://huggingface.co/DavidAU/Qwen3.5-9B-Cold-Fusion-GAIN-v1.0-Uncensored-Heretic-NEO-MAX-Imatrix-GGUF
- Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic (modelo previo del mismo pipeline): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
