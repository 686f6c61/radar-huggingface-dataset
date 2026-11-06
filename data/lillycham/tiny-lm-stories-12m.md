# lillycham/tiny-lm-stories-12m

## Resumen

tiny-lm-stories-12m es un modelo de lenguaje de 12,3 millones de parámetros desarrollado por lillycham como parte del proyecto educativo tiny-lm, cuyo objetivo es construir un modelo paso a paso y después analizar su funcionamiento interno. El modelo adopta la arquitectura de GPT-2 (transformer decoder-only) y está entrenado exclusivamente sobre el corpus TinyStories de Eldan y Li (2023), un conjunto de cuentos infantiles sintéticos diseñado para estudiar el aprendizaje lingüístico en modelos pequeños.

El repositorio contiene dos variantes: el modelo base, que continúa un relato a partir de un fragmento inicial, y una versión instruct ubicada en el subdirectorio `instruct/`, afinada sobre TinyStoriesInstruct para generar cuentos que incorporen tres palabras dadas por el usuario. Con 256 tokens de contexto y un tokenizador BPE de 4.096 entradas, el modelo está pensado para estudio e investigación, no para producción. Su interés actual reside en que permite examinar mecanismos internos concretos, como la cabeza de inducción de la capa 5, cabeza 3, que copia nombres del contexto.

La relevancia del modelo es, por tanto, didáctica y de interpretabilidad: es un banco de pruebas reproducible y de tamaño reducido (0,1 GB) para estudiar cómo emergen capacidades lingüísticas básicas en transformers pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 |
| Parámetros totales | 12.318.720 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | No disponible (pesos safetensors en fp32/fp16 según el repo) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas | 6 |
| Dimensión del modelo (width) | 384 |
| Cabezas de atención | 6 |
| Tokenizador | BPE byte-level, 4.096 tokens |
| Pérdida de validación | 1,28 nats por token |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la misma forma que GPT-2 pequeño: 6 capas, anchura 384 y 6 cabezas de atención, lo que da 12,3 millones de parámetros. Una particularidad técnica es que los sesgos (biases) de las proyecciones q, k y v de GPT-2 están a cero, porque el modelo se entrenó sin ellos; los pesos son compatibles con `GPT2LMHeadModel` de la librería transformers. El texto debe iniciarse tras el token `<|endoftext|>`, tal como se hizo durante el entrenamiento.

El entrenamiento consistió en una única pasada sobre TinyStories (553 millones de tokens) en una GPU alquilada, sin que la información disponible detalle la composición exacta del dataset, el uso de RLHF o DPO, ni otras innovaciones de entrenamiento. La versión instruct se obtuvo afinando el modelo base sobre TinyStoriesInstruct. La pérdida de validación reportada es de 1,28 nats por token. El autor documenta la presencia de una cabeza de inducción en la capa 5, cabeza 3, que copia nombres desde el contexto, y el repositorio tiny-lm incluye herramientas para inspeccionarla.

## Capacidades

- Generación de texto: continuación de relatos cortos en inglés a partir de un fragmento inicial.
- Generación de cuentos infantiles con vocabulario y estructuras simples, propio del corpus TinyStories.
- Versión instruct: redacción de un cuento que utiliza tres palabras proporcionadas por el usuario mediante un prompt con formato `User:` / `Assistant:`.
- Copia de nombres desde el contexto mediante una cabeza de inducción identificada en la capa 5, cabeza 3.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Multilingüe: únicamente inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Estudio de interpretabilidad: inspeccionar la cabeza de inducción de la capa 5, cabeza 3, con las herramientas del repositorio tiny-lm para entender cómo un modelo pequeño copia entidades del contexto.
- Docencia de arquitecturas transformer: usar el modelo como ejemplo mínimo y reproducible de GPT-2 con 12,3 millones de parámetros y 256 tokens de contexto para explicar atención, tokenización BPE y generación autorregresiva.
- Experimentos de ablación: comparar el modelo base con la variante instruct para estudiar el efecto del ajuste fino supervisado sobre un mismo corpus.
- Generación de cuentos infantiles sintéticos en inglés: producir relatos breves y simples a partir de una frase inicial, útil para crear material de prueba en pipelines de generación de texto.
- Pruebas de integración con transformers y text-generation-inference: validar flujos de carga, tokenización y generación con un modelo de 0,1 GB que cabe en cualquier entorno, incluidos CPU y GPUs de gama baja.
- Investigación sobre currículos de datos: reproducir el entrenamiento con una pasada sobre 553 millones de tokens de TinyStories para estudiar la relación entre tamaño de modelo, datos y pérdida de validación (1,28 nats por token).
- Evaluación de técnicas de prompting: probar formatos de prompt instruct con tres palabras dadas y medir la adherencia del modelo a la instrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la pérdida de validación de 1,28 nats por token.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (12,3 millones de parámetros, aproximadamente 50 MB de pesos) y aún menor en fp16; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna, e incluso puede ejecutarse en CPU.
- Opciones de despliegue: transformers (carga estándar con `AutoModelForCausalLM`), text-generation-inference (el modelo declara compatibilidad con endpoints), y cualquier runtime que soporte safetensors y arquitectura GPT-2.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia muy baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| tiny-lm-stories-12m | 12,3 M | 256 tokens | MIT | Entrenado en TinyStories, orientado a interpretabilidad |
| GPT-2 small | 124 M | 1.024 tokens | MIT | Referencia de arquitectura; 10 veces más parámetros |
| Modelos TinyStories de Eldan y Li (2023) | No disponible en la información | No disponible | No disponible | Corpus de origen del entrenamiento |
| Otros modelos tiny-lm del mismo autor | No disponible | No disponible | No disponible | Proyecto educativo con variantes por partes |

La comparación con alternativas de la misma categoría (modelos de menos de 50 millones de parámetros entrenados en TinyStories) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El propio autor indica que no debe esperarse que el modelo proporcione hechos: está pensado para estudio, no como fuente de conocimiento.
- Ventana de contexto muy reducida (256 tokens), insuficiente para conversaciones multi-turno o documentos largos.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Alto riesgo de alucinación y de generar texto incoherente fuera del dominio de cuentos infantiles simples.
- No hay información sobre sesgos específicos; al entrenarse en un corpus sintético de cuentos, el vocabulario y los temas están acotados.
- La licencia MIT permite uso comercial de código y pesos, pero el corpus TinyStories se distribuye bajo CDLA-Sharing-1.0, lo que conviene revisar si se reutilizan los datos.
- La versión instruct requiere un formato de prompt concreto (`User:` / `Assistant:`) y no está diseñada para instrucciones generales.
- No apto para producción en tareas de razonamiento, código, matemáticas o atención al cliente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lillycham/tiny-lm-stories-12m
- Repositorio del proyecto tiny-lm: https://github.com/lillycham/tiny-lm
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset TinyStoriesInstruct: https://huggingface.co/datasets/roneneldan/TinyStoriesInstruct
