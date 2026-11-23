# bcckfdn/cevher3-test-13

## Resumen

cevher3-test-13 es un modelo de lenguaje de tipo decoder-only de 1.256.312.832 parámetros (aproximadamente 1,26 mil millones) desarrollado por el usuario bcckfdn y publicado en Hugging Face bajo licencia Apache 2.0. Está construido sobre la arquitectura Gemma3-SWA (Sliding Window Attention) y está especializado en generación de texto conversacional en turco e inglés. Su tamaño lo sitúa en la categoría de modelos pequeños, aptos para despliegue en hardware de consumo y para tareas de generación de texto con requisitos moderados de cómputo.

El modelo emplea una configuración de 34 capas con dimensión oculta de 1792, 28 cabezas de atención para consultas y 4 para claves/valores (atención agrupada, GQA), un vocabulario de 65.536 tokens y una ventana de contexto de 8192 tokens. Según la model card, fue entrenado sobre 28.705 millones de tokens y alcanzó una pérdida de validación de 2,7804. La inclusión de atención de ventana deslizante (SWA) es la innovación arquitectónica más destacable, ya que reduce el coste computacional en secuencias largas frente a la atención completa.

Su relevancia actual radica en que ofrece una alternativa ligera y de licencia permisiva para experimentación con arquitecturas Gemma3 en entornos con recursos limitados, así como para el desarrollo de asistentes conversacionales en turco, un idioma con menor representación en los grandes modelos multilingües. No obstante, la información pública disponible es escasa y no se han publicado resultados de benchmarks ni detalles sobre la composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Gemma3-SWA (sliding window attention) |
| Parametros totales | 1.256.312.832 (aprox. 1,26 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos técnicos declarados en la model card: 34 capas, dimensión oculta 1792, 28 cabezas de consulta y 4 de clave/valor, vocabulario de 65.536 tokens, 28.705 millones de tokens de entrenamiento y mejor pérdida de validación de 2,7804.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only basada en Gemma3 con atención de ventana deslizante (SWA). Esta variante limita el alcance de la atención a una ventana local en cada capa, lo que reduce el coste cuadrático de la atención completa y permite procesar secuencias de hasta 8192 tokens con menor consumo de memoria y cómputo. La configuración de 34 capas con dimensión oculta de 1792 y atención agrupada (28 cabezas de consulta frente a 4 de clave/valor) es coherente con un modelo de aproximadamente 1,26 mil millones de parámetros y un vocabulario de 65.536 tokens.

Según la model card, el entrenamiento utilizó 28.705 millones de tokens y alcanzó una pérdida de validación de 2,7804. No se especifica la composición del dataset, la proporción entre turco e inglés, ni si se aplicaron técnicas de alineación como RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones adicionales como decodificación especulativa o mecanismos de atención lineal más allá de la propia SWA. La información sobre el proceso de entrenamiento es, por tanto, muy limitada.

## Capacidades

- Generación de texto autoregresiva en turco e inglés, orientada a diálogo conversacional según la etiqueta `conversational`.
- Razonamiento básico y respuesta a instrucciones dentro de los límites propios de un modelo de 1,26 B de parámetros.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües limitadas a turco e inglés; no se declaran otros idiomas.
- Capacidad especial de modo thinking, visión o audio: no disponible.
- Integración con `text-generation-inference` y compatibilidad con endpoints, según las etiquetas del repositorio.

## Casos de uso

- Asistente conversacional en turco: el modelo puede gestionar diálogos multi-turno gracias a su ventana de contexto de 8192 tokens, adecuado para chatbots de atención al cliente en mercados de habla turca donde los modelos grandes no siempre cubren bien el idioma.
- Generación de texto creativo y redacción asistida: útil para borradores de artículos, correos y contenido en turco e inglés, con un coste de inferencia bajo al tratarse de un modelo de 1,26 B.
- Prototipado rápido de aplicaciones de IA generativa: su tamaño permite ejecutarlo en una sola GPU de consumo, lo que facilita iterar sobre prompts y flujos conversacionales antes de escalar a modelos mayores.
- Clasificación y etiquetado de texto mediante generación: se puede emplear para tareas de extracción de información o resumen en turco, aprovechando la licencia Apache 2.0 para uso comercial.
- Investigación sobre arquitecturas Gemma3-SWA: sirve como banco de pruebas para estudiar el comportamiento de la atención de ventana deslizante en modelos pequeños y comparar con variantes de atención completa.
- Fine-tuning específico de dominio: al ser un modelo pequeño y con licencia permisiva, es una base razonable para ajuste fino supervisado en dominios verticales (legal, sanitario, atención al cliente) en turco.
- Despliegue en entornos con recursos limitados: puede ejecutarse en CPU o GPU modesta para demos, herramientas internas o aplicaciones de borde donde no es viable un modelo de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de validación (2,7804) y el número de tokens de entrenamiento (28.705 millones), sin métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 5 GB solo para pesos (1,26 B × 4 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en fp16/bf16: aproximadamente 2,5 GB para pesos, más activaciones; en la práctica, entre 4 y 6 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,3 GB para pesos; en 4 bits, alrededor de 0,7 GB.
- GPU recomendadas: cabe holgadamente en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4090; también en GPUs de datacenter como A100 o H100, aunque estarían sobredimensionadas.
- Despliegue: compatible con `transformers`, `text-generation-inference` (según etiquetas) y, previsiblemente, con llama.cpp/Ollama si se generan pesos GGUF, aunque no se documenta su disponibilidad oficial.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| cevher3-test-13 | 1,26 B | 8192 | tr, en | Apache 2.0 | Gemma3-SWA, sin benchmarks publicados |
| Gemma 2 2B | 2,6 B | 8192 | multilingüe | Gemma license | Modelo oficial de Google, con benchmarks publicados |
| Qwen2.5 1.5B | 1,5 B | 32.768 | multilingüe | Apache 2.0 | Contexto mayor y amplia documentación |
| SmolLM2 1.7B | 1,7 B | 8192 | inglés principalmente | Apache 2.0 | Enfocado en eficiencia y despliegue ligero |

La comparación es orientativa: cevher3-test-13 carece de benchmarks públicos, por lo que no es posible establecer una comparación de rendimiento rigurosa con estas alternativas. Su principal diferenciación es el enfoque en turco y la arquitectura Gemma3-SWA, mientras que modelos como Qwen2.5 1.5B ofrecen mayor contexto y documentación más completa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de su calidad frente a alternativas de tamaño similar.
- Información de entrenamiento muy limitada: se desconoce la composición del dataset, la proporción de turco e inglés y si hubo alineación (RLHF/DPO), lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinación: como todo modelo generativo de pequeño tamaño, es propenso a inventar datos, especialmente en tareas de razonamiento o conocimiento factual.
- Cobertura lingüística restringida a turco e inglés; no se garantiza un comportamiento adecuado en castellano u otros idiomas.
- Ventana de contexto de 8192 tokens: suficiente para diálogo, pero limitada para documentos largos o tareas de recuperación extensa.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia de los datos de entrenamiento antes de un despliegue en producción.
- El nombre del repositorio ("test-13") sugiere que podría tratarse de una versión experimental o de prueba, lo que desaconseja su uso en producción sin una evaluación previa exhaustiva.
- No se documenta soporte oficial de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-13
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
