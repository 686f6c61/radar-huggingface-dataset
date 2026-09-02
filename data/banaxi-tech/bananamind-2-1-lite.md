# Banaxi-Tech/BananaMind-2.1-Lite

## Resumen

BananaMind 2.1 Lite es un modelo de lenguaje causal de 24,9 millones de parámetros declarados (28,3 millones según los tensores safetensors), desarrollado por Banaxi-Tech. Está diseñado para la clase de modelos de menos de 25 millones de parámetros, un segmento orientado a entornos con recursos muy limitados, experimentación académica y despliegue en dispositivos de baja capacidad. Su principal innovación es la combinación de un núcleo Transformer con capas parcialmente reutilizadas (dos capas físicas se ejecutan dos veces cada una) y un módulo n-gram de trigramas con doble tabla hash que se inyecta en el flujo residual en puntos específicos.

El modelo se entrenó con un currículo de 75 mil millones de tokens procedentes de fuentes como FineWeb-Edu, DCLM Baseline, Cosmopedia v2, FineMath 4+, FinePhrase y NPset-2 Python-Edu, con un reparto ponderado que prioriza datos educativos y de código. Utiliza el tokenizador de BananaMind 2 Nano, con un vocabulario de 8.192 tokens, y soporta una ventana de contexto de 4.096 tokens. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo hace atractivo para integraciones en productos donde el coste computacional es crítico.

La relevancia actual de este modelo radica en su enfoque híbrido entre arquitecturas neuronales clásicas y mecanismos simbólicos ligeros (n-gramas), una línea de investigación que busca mejorar la eficiencia de modelos pequeños sin recurrir a escalados masivos. Aunque no se han publicado benchmarks oficiales, su diseño y su currículo de entrenamiento orientado a calidad educativa lo posicionan como una opción interesante para tareas de generación de texto en inglés, completado de código y prototipado rápido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con capas parcialmente reutilizadas (partially-looped) y módulo n-gram de trigramas |
| Parametros totales | 28.357.858 (según safetensors); 24.949.999 declarados por el autor |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BananaMind 2.1 Lite emplea una arquitectura Transformer causal con una particularidad estructural: el flujo de ejecución recorre 15 pasadas efectivas de capas, pero solo 13 capas físicas. Las capas L5 y L9 se ejecutan dos veces cada una, compartiendo los mismos pesos en ambas visitas. Esta reutilización parcial reduce el número de parámetros sin disminuir la profundidad efectiva del modelo. El ancho del residual stream es de 384 dimensiones.

El módulo n-gram es un componente adicional que procesa trigramas de tokens mediante dos tablas hash independientes, cada una con 51.699 entradas y 48 características por entrada. Las 96 características concatenadas se proyectan al espacio residual de 384 dimensiones. Esta representación trigramática se calcula una sola vez y se reinyecta antes de cada visita a L5 y L9, con escalas de inyección aprendidas e inicializadas en 0,5. Este diseño híbrido pretende capturar patrones locales de orden superior que complementan la atención del Transformer.

El entrenamiento se realizó con un currículo de 75 mil millones de tokens distribuidos en seis fuentes: FineWeb-Edu (50%), DCLM Baseline (22%), Cosmopedia v2 (10%), FineMath 4+ (9%), FinePhrase (6%) y NPset-2 Python-Edu (3%). La asignación de NPset combina un 75% de código normalizado y un 25% de código original. Los pesos del currículo evolucionan desde una fase inicial centrada en web hacia una fase equilibrada con mayor presencia de matemáticas, texto sintético, frases y código. Se utiliza un programador de créditos de tokens para mantener el lote global dentro de las proporciones objetivo. Los optimizadores empleados son Muon para las matrices, AdamW para embeddings y parámetros de control, y un AdamW independiente para el módulo n-gram. Los checkpoints se suben cada 5% de avance con safetensors, tokenizador, revisiones de dataset fijadas y estado completo para reanudar el entrenamiento.

## Capacidades

- Generación de texto en inglés: modelo causal de lenguaje capaz de producir texto coherente a partir de un prompt, con una ventana de contexto de 4.096 tokens.
- Completado de código: entrenado con una porción de datos de Python educativo (NPset-2), puede completar fragmentos de código simples y tareas de programación básica.
- Razonamiento matemático básico: la inclusión de FineMath 4+ en el currículo sugiere cierta capacidad para operaciones aritméticas y problemas matemáticos sencillos, aunque no hay benchmarks que lo confirmen.
- Procesamiento de texto educativo: al estar entrenado predominantemente con FineWeb-Edu y Cosmopedia v2, es adecuado para tareas de comprensión y generación de contenido didáctico.
- Modelo compacto: con menos de 30 millones de parámetros, es viable para inferencia en CPU, microcontroladores y GPUs de gama baja.
- No se mencionan capacidades de tool calling, agentes, visión, audio ni soporte multilingüe más allá del inglés.

## Casos de uso

- Generación de texto en dispositivos embebidos: su tamaño reducido permite ejecutar el modelo en hardware con poca memoria, como Raspberry Pi o sistemas de borde, para generar respuestas automáticas en inglés en asistentes locales.
- Completado de código en entornos de desarrollo ligeros: puede integrarse en editores de código para sugerir autocompletados de Python en proyectos pequeños, aprovechando su entrenamiento con datos de código educativo.
- Prototipado rápido de aplicaciones de NLP: investigadores y desarrolladores pueden usarlo como base para experimentar con arquitecturas híbridas n-gram + Transformer sin necesidad de infraestructura costosa.
- Generación de material educativo: dado su entrenamiento con FineWeb-Edu y Cosmopedia, puede producir explicaciones, resúmenes o ejercicios sencillos en inglés para plataformas de aprendizaje automático.
- Filtrado y clasificación de texto: aunque no está diseñado específicamente para ello, su representación interna puede adaptarse con fine-tuning para tareas de clasificación de documentos cortos en inglés.
- Evaluación de técnicas de cuantización y compresión: al ser un modelo pequeño y abierto, sirve como banco de pruebas para estudiar el impacto de cuantizaciones (int8, int4) o poda en modelos con capas reutilizadas.
- Investigación en eficiencia de modelos: su arquitectura con capas parcialmente bucles y módulo n-gram ofrece un caso de estudio para comparar el rendimiento de modelos compactos frente a Transformers convencionales del mismo tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se proporcionan métricas de latencia o throughput.

## Requisitos de hardware

- No se dispone de requisitos oficiales de hardware para inferencia. El entrenamiento se realizó con 4 o 8 GPUs H200, pero esto no es indicativo de los requisitos de despliegue.
- Estimación orientativa basada en el tamaño del modelo: con 28,3 millones de parámetros, en FP16 los pesos ocupan aproximadamente 57 MB, y en int8 unos 28 MB. Esto permite inferencia en CPU con 4-8 GB de RAM y en cualquier GPU con al menos 1 GB de VRAM.
- GPUs recomendadas: cualquier GPU moderna con más de 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso integradas) sería suficiente. También es viable en Apple Silicon con Metal.
- Opciones de despliegue: al ser un modelo causal estándar con pesos en safetensors, debería ser compatible con frameworks como llama.cpp, Ollama, vLLM o Hugging Face Transformers, aunque no se ha confirmado oficialmente.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia de milisegundos por token en GPU y de decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No hay datos de rendimiento ni de características de otras alternativas de la misma categoría (menos de 25M de parámetros) que permitan una comparación objetiva. Se recomienda consultar benchmarks independientes o evaluar el modelo directamente en las tareas de interés.

## Limitaciones y advertencias

- Modelo muy pequeño: con menos de 30 millones de parámetros, su capacidad de razonamiento complejo, generación de texto largo y coherencia global es limitada en comparación con modelos de cientos de millones o miles de millones de parámetros.
- Solo inglés: no soporta otros idiomas, lo que restringe su uso a aplicaciones monolingües.
- Contexto limitado: la ventana de 4.096 tokens puede ser insuficiente para tareas que requieran dependencias de largo alcance o documentos extensos.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios no cubiertos por sus datos de entrenamiento.
- Sin benchmarks publicados: no hay evidencia empírica de su calidad en tareas estándar, por lo que su rendimiento real es incierto.
- Arquitectura experimental: el uso de capas parcialmente reutilizadas y módulos n-gram es poco convencional; puede haber problemas de compatibilidad con herramientas estándar o dificultades para reproducir resultados.
- Datos de entrenamiento desbalanceados: la mayoría de los tokens provienen de fuentes web y educativas, lo que puede sesgar el modelo hacia un registro formal y académico, con menor capacidad para lenguaje coloquial o técnico especializado.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de las fuentes de datos originales (FineWeb-Edu, DCLM, etc.) por si hubiera restricciones adicionales de atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Banaxi-Tech/BananaMind-2.1-Lite
- Organización Banaxi-Tech en Hugging Face: https://huggingface.co/Banaxi-Tech
- Variante Flash Lite (menos de 10M): https://huggingface.co/Banaxi-Tech/BananaMind-2.1-Flash-Lite
- GitHub de Banaxi-Tech: https://github.com/Banaxi-Tech
