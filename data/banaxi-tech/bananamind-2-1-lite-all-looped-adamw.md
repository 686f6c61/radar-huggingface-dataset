# Banaxi-Tech/BananaMind-2.1-Lite-All-Looped-AdamW

## Resumen

BananaMind 2.1 Lite All-Looped AdamW es un modelo de lenguaje causal de tamaño reducido (menos de 25 millones de parámetros según su diseño, aunque los pesos reales en safetensors suman 28,36 millones) desarrollado por Banaxi-Tech. Forma parte de la familia BananaMind y se publica como un experimento independiente que no sobrescribe las versiones Lite originales ni el experimento AdamW parcialmente looped. Su principal innovación es una arquitectura recurrente con un stack medio que se ejecuta dos veces, reutilizando los mismos pesos físicos en cada pasada, lo que permite obtener 24 pasadas de capas efectivas con solo 13 capas físicas.

El modelo incorpora además un módulo trigrama causal basado en dos tablas hash independientes que se reinyecta en puntos concretos del stack recurrente, y se entrena con un currículo de 75 mil millones de tokens procedentes de fuentes diversas como FineWeb-Edu, DCLM Baseline, Cosmopedia v2, FineMath 4+, FinePhrase y NPset-2 Python-Edu. Con una ventana de contexto de 4096 tokens y licencia Apache 2.0, está pensado para la clase de modelos sub-25M, un nicho orientado a eficiencia extrema y despliegue en entornos con recursos limitados. Su relevancia actual radica en explorar arquitecturas recurrentes con reutilización de pesos como alternativa a los transformers densos convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con stack medio recurrente (loop de capas) y módulo trigrama de doble hash |
| Parametros totales | 28.357.858 (según safetensors); la model card declara 24.949.999 (19.950.029 en el núcleo Transformer + 4.999.970 en el módulo trigrama) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de BananaMind 2.1 Lite All-Looped se basa en un transformer causal con 13 capas físicas que se ejecutan en un patrón `L1 → (L2 → ... → L12) × 2 → L13`. La capa L1 actúa como preludio, las capas L2 a L12 forman un stack medio recurrente que se visita dos veces reutilizando los mismos pesos físicos en la segunda pasada, y la capa L13 es la coda. Esto produce 24 pasadas de capas efectivas con solo 13 conjuntos de pesos, una técnica que reduce el número de parámetros sin sacrificar profundidad funcional.

El modelo incorpora un módulo trigrama causal con dos tablas hash independientes de 51.699 entradas cada una, con 48 características por hash. Las 96 características concatenadas se proyectan al flujo residual de 384 dimensiones. Esta representación trigrama se calcula una sola vez y se reinyecta antes de cada visita a las capas L5 y L9, una vez en cada pasada del stack recurrente, con escalas de inyección aprendidas separadas inicializadas a 0,5. El tokenizer es el de BananaMind 2 Nano, con un vocabulario de 8.192 tokens.

El entrenamiento utiliza un currículo de 75 mil millones de tokens con una distribución ponderada: 50% FineWeb-Edu, 22% DCLM Baseline, 10% Cosmopedia v2, 9% FineMath 4+, 6% FinePhrase y 3% NPset-2 Python-Edu (este último con 75% de código normalizado y 25% de código original). El optimizador es AdamW puro con betas (0,9, 0,95), una tasa de aprendizaje pico de 0,003 para el núcleo Transformer, embeddings y controles, y 0,001 para el módulo n-gram. Ambas tasas siguen un programa warmup-stable-decay con un decaimiento coseno final del 15%. Los checkpoints se suben cada 5% del entrenamiento.

## Capacidades

- Generación de texto causal: el modelo está diseñado para la generación de lenguaje natural en inglés, con una ventana de contexto de 4096 tokens.
- Razonamiento y comprensión del lenguaje: al ser un modelo causal entrenado con una mezcla de datos web, matemáticas, texto sintético y código, se espera que tenga capacidades básicas de razonamiento y comprensión, aunque no se han publicado evaluaciones detalladas.
- Procesamiento de código: la inclusión de NPset-2 Python-Edu en el currículo sugiere cierta capacidad para generar y comprender código Python, aunque no se especifica el nivel de competencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Prototipado de aplicaciones de generación de texto en entornos con recursos limitados: al ser un modelo de menos de 30 millones de parámetros, puede ejecutarse en hardware modesto (CPU o GPU de gama baja) y es adecuado para validar ideas antes de escalar a modelos mayores.
- Experimentación académica con arquitecturas recurrentes y reutilización de pesos: su diseño con stack medio looped y módulo trigrama lo convierte en un banco de pruebas para investigar la eficiencia paramétrica en modelos de lenguaje.
- Generación de texto en dispositivos edge: su tamaño reducido y su contexto de 4096 tokens permiten desplegarlo en dispositivos con poca memoria, como Raspberry Pi o teléfonos móviles, para tareas de autocompletado o asistentes locales.
- Educación y formación en IA: por su licencia Apache 2.0 y su tamaño manejable, es útil para enseñar conceptos de arquitecturas recurrentes, entrenamiento con currículo y módulos n-gram en cursos de aprendizaje automático.
- Generación de contenido sintético en inglés: puede emplearse para crear textos cortos, resúmenes o respuestas en entornos donde no se requiera una calidad de nivel frontier.
- Análisis de la influencia del currículo de datos en modelos pequeños: al estar documentado el desglose exacto de fuentes de entrenamiento, sirve para estudiar cómo la mezcla de datos afecta al rendimiento en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño de 28,36 millones de parámetros en precisión FP32, el peso del modelo ocupa aproximadamente 113 MB; en FP16 serían unos 57 MB. La inferencia podría ejecutarse con menos de 1 GB de VRAM o incluso en CPU.
- GPU recomendadas: no hay recomendaciones oficiales. Por su tamaño, cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o integradas modernas) sería suficiente. También es viable en CPU con 4-8 GB de RAM.
- Si cabe en consumer GPU: sí, cabe en cualquier GPU de consumo actual e incluso en muchas antiguas.
- Opciones de despliegue: al ser un modelo con custom code (recurrent-stack, all-middle-looped), requiere un runtime que soporte la arquitectura personalizada. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. Es probable que necesite un script de inferencia propio basado en los pesos safetensors y el código personalizado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (sub-25M con arquitectura recurrente looped). No se puede establecer una comparativa fiable sin datos de benchmarks ni referencias a otros modelos de la familia BananaMind.

## Limitaciones y advertencias

- Tamaño muy reducido: con menos de 30 millones de parámetros, su capacidad de razonamiento complejo, generación de código avanzado o comprensión profunda del lenguaje es limitada en comparación con modelos de cientos de miles de millones de parámetros.
- Contexto limitado a 4096 tokens: no es adecuado para tareas que requieran ventanas de contexto largas, como análisis de documentos extensos o conversaciones de muchos turnos.
- Solo inglés: no soporta otros idiomas de forma nativa.
- Sin benchmarks publicados: no hay evidencia empírica de su rendimiento en tareas estándar, lo que dificulta evaluar su calidad real.
- Dependencia de código personalizado: la arquitectura con stack recurrente y módulo trigrama requiere código específico para cargar y ejecutar el modelo; no es compatible con runtimes estándar sin adaptaciones.
- Discrepancia en el número de parámetros: la model card declara 24.949.999 parámetros, pero los pesos safetensors suman 28.357.858. Esta diferencia puede deberse a buffers o parámetros adicionales no contados, pero conviene tenerla en cuenta.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente al ser pequeño y entrenado con datos diversos.
- Sin garantías de producción: al ser un experimento de investigación con 0 descargas y 1 like, no hay evidencia de uso en entornos productivos ni soporte comunitario.

## Enlaces

- HuggingFace: https://huggingface.co/Banaxi-Tech/BananaMind-2.1-Lite-All-Looped-AdamW
